/* v1.24.3: the Bamboo Grove and the Cattail Marsh lagged. Their plants are
   now painted once and stamped. This checks the stamps are used, that the
   screen asks for far fewer shapes there, that a stamp looks like the
   painting it replaced, and that the memory they take stays small. */
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const base = process.argv[2] || 'http://localhost:8899/index.html';
  const ctx = await b.newContext({ ...devices['Pixel 7'], hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(base); await p.waitForTimeout(900);
  await p.tap('#btn-play'); await require('./charskip')(p); await p.waitForTimeout(800);
  const results = [];
  const check = (name, ok, extra) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + (ok || extra == null ? '' : '  -> ' + JSON.stringify(extra))); };

  const r = await p.evaluate(async () => {
    GG.UI.close('screen-news'); if (GG.Favours) GG.Favours._say = function () {};
    GG.Critters.clear(); GG.Critters.spawnNear = function () {};
    const out = {}, names = ['bamboo', 'bambooShoot', 'duckweed', 'bulrush', 'cattail'];
    const cv = document.getElementById('game'), c = cv.getContext('2d');
    /* count what the frame asks the canvas to do */
    let n = 0; const proto = CanvasRenderingContext2D.prototype, keep = {};
    ['fill', 'stroke', 'fillRect', 'drawImage'].forEach(k => { keep[k] = proto[k]; proto[k] = function () { if (this === c) n++; return keep[k].apply(this, arguments); }; });
    const frames = (k) => new Promise(res => { let i = 0; function f() { if (++i >= k) res(); else requestAnimationFrame(f); } requestAnimationFrame(f); });
    async function ops(x, y, off) { GG.noSprites = off; GG.Player.reset(x, y); await new Promise(res => setTimeout(res, 500)); await frames(3); n = 0; await frames(20); GG.noSprites = false; return Math.round(n / 20); }
    out.bambooOld = await ops(4600, 1800, true); out.bambooNew = await ops(4600, 1800, false);
    out.marshOld = await ops(3800, 3800, true); out.marshNew = await ops(3800, 3800, false);
    ['fill', 'stroke', 'fillRect', 'drawImage'].forEach(k => { proto[k] = keep[k]; });
    out.sprites = {}; out.mb = 0;
    names.forEach(k => { out.sprites[k] = GG.Props[k]._sprites(); out.mb += GG.Props[k]._pixels() * 4 / 1e6; });
    /* a stamp against the painting, on a plain canvas */
    out.diff = {};
    names.forEach(k => {
      function draw(off) { const t = document.createElement('canvas'); t.width = 360; t.height = 420; const g = t.getContext('2d'); g.fillStyle = '#8cc46a'; g.fillRect(0, 0, 360, 420); g.setTransform(2, 0, 0, 2, 0, 0); GG.noSprites = off; GG.Props[k](g, 90, 180, 42, 0, 0.375); GG.noSprites = false; return g.getImageData(0, 0, 360, 420).data; }
      const a = draw(true), s = draw(false); let d = 0; for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - s[i]) + Math.abs(a[i + 1] - s[i + 1]) + Math.abs(a[i + 2] - s[i + 2]);
      out.diff[k] = +(d / (a.length / 4) / 3).toFixed(2);
    });
    /* a turned canvas is painted the old way, not stamped wrongly */
    const t = document.createElement('canvas'); t.width = 200; t.height = 200; const g = t.getContext('2d'); g.rotate(0.3);
    const before = GG.Props.bamboo._sprites(); GG.Props.bamboo(g, 100, 150, 30, 0, 0.1); out.rotatedBuilt = GG.Props.bamboo._sprites() - before;
    return out;
  });
  check('all five plants are stamped from a picture', Object.values(r.sprites).every(n => n > 0), r.sprites);
  check('the Bamboo Grove asks for under half the shapes it used to', r.bambooNew < r.bambooOld * 0.5, r);
  check('so does the Cattail Marsh, or near it', r.marshNew < r.marshOld * 0.6, r);
  const off = Object.keys(r.diff).filter(k => r.diff[k] > 6);
  check('a stamp looks like the painting it replaced', off.length === 0, r.diff);
  check('the pictures take under 30 MB between them', r.mb < 30, r.mb);
  check('a turned canvas is painted the old way', r.rotatedBuilt === 0, r.rotatedBuilt);
  check('the What’s new list has the 1.24.3 entry', await p.evaluate(() => GG.CHANGELOG.some(c => c.v === '1.24.3')));
  console.log('shapes per frame: grove ' + r.bambooOld + ' -> ' + r.bambooNew + ', marsh ' + r.marshOld + ' -> ' + r.marshNew + ', memory ' + r.mb.toFixed(1) + ' MB');
  results.forEach(x => console.log(x));
  if (errs.length) console.log(errs.join('\n'));
  const failed = results.filter(x => x.startsWith('FAIL')).length;
  console.log(failed ? failed + ' FAILED' : 'ALL ' + results.length + ' PASSED');
  await b.close(); process.exit(failed || errs.length ? 1 : 0);
})();
