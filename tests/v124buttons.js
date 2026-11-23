/* v1.24: the buttons and the swimming fish. */
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const base = process.argv[2] || 'http://localhost:8899/index.html';
  const ctx = await b.newContext({ ...devices['Pixel 7'], hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(base);
  await p.waitForTimeout(900);
  const results = [];
  const check = (name, ok, extra) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + (ok || extra == null ? '' : '  -> ' + JSON.stringify(extra))); };
  const ev = (fn, a) => p.evaluate(fn, a);
  const badge = id => ev(id => { const e = document.getElementById(id), b = getComputedStyle(e, '::before'), a = getComputedStyle(e, '::after'), r = e.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(e); const tr = range.getBoundingClientRect();
    return { w: parseFloat(b.width), round: b.borderRadius, mask: (a.webkitMaskImage || a.maskImage || '').slice(0, 30), textLeft: tr.left - r.left, textRight: r.right - tr.right, h: r.height }; }, id);

  /* ---- the title screen ---- */
  for (const id of ['btn-char', 'btn-howto', 'btn-settings', 'btn-guest']) {
    const s = await badge(id);
    check(id + ' has a round badge with a picture, and its words clear of it', s.w === 36 && /50%/.test(s.round) && /data:image\/svg/.test(s.mask) && s.textLeft >= 46 && s.textRight >= 8 && s.h >= 44, s);
  }
  const icons = await ev(() => { const cs = getComputedStyle(document.documentElement); return ['person', 'question', 'sliders', 'friends', 'heart', 'book', 'net', 'flower', 'eye', 'star', 'house', 'moon', 'fish', 'paw', 'boot', 'brush'].filter(n => !/^url\("data:image\/svg\+xml/.test(cs.getPropertyValue('--i-' + n).trim())); });
  check('all sixteen pictures are built in, nothing fetched', icons.length === 0, icons);
  const play = await ev(() => { const e = document.getElementById('btn-play'), a = getComputedStyle(e, '::after'), b = getComputedStyle(e, '::before'); return { ring: a.borderTopWidth, shine: b.animationName, over: getComputedStyle(e).overflow }; });
  check('Play keeps its glowing ring and has a shine that passes over it', play.ring === '4px' && play.shine === 'playshine' && play.over !== 'hidden', play);
  await p.tap('#btn-settings'); await p.waitForTimeout(300);
  check('the badged buttons still work', await ev(() => !document.getElementById('screen-settings').classList.contains('hidden')));
  await ev(() => GG.UI.close('screen-settings'));

  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(600);
  await ev(() => { GG.UI.close('screen-news'); if (GG.Favours) GG.Favours._say = function () {}; GG.Critters.clear(); GG.Critters.spawnNear = function () {}; });

  /* ---- the Garden Menu ---- */
  await p.tap('#btn-menu'); await p.waitForTimeout(300);
  for (const id of ['menu-favours', 'menu-book', 'menu-char', 'menu-help', 'menu-settings']) {
    const s = await badge(id);
    check(id + ' has its badge and its words clear of it', s.w === 36 && /data:image\/svg/.test(s.mask) && s.textLeft >= 46 && s.textRight >= 8, s);
  }
  await ev(() => GG.Favours.dot());
  check('the Favour Board keeps its picture when its words change', /data:image\/svg/.test((await badge('menu-favours')).mask) && /to do|all done/.test(await p.$eval('#menu-favours', e => e.textContent)));
  await p.tap('#menu-book'); await p.waitForTimeout(300);
  check('and the menu buttons still work', await ev(() => !document.getElementById('screen-book').classList.contains('hidden')));
  await ev(() => GG.UI.close('screen-book'));

  /* ---- the big round button ---- */
  await ev(() => { GG.Player.reset(GG.World.DOOR.x + 40, GG.World.DOOR.y + 170); GG.Time.set(12 * 60); });
  await p.waitForTimeout(900);
  const net = await ev(() => { const e = document.getElementById('btn-a'), b = getComputedStyle(e, '::before'); return { verb: e.getAttribute('data-verb'), text: e.textContent, mask: (b.webkitMaskImage || b.maskImage || '').slice(0, 20), w: b.width, sh: getComputedStyle(e).boxShadow.indexOf('inset') >= 0 }; });
  check('out in the garden it says NET with a net on it', net.verb === 'net' && /^NET/.test(net.text) && /data:image/.test(net.mask) && net.w === '26px' && net.sh, net);
  await ev(() => { const t = GG.World.telescopes[0]; GG.Player.reset(t.x, t.y + 26); GG.Time.set(22 * 60); });
  await p.waitForTimeout(1000);
  check('at the telescope it shows a star', (await p.$eval('#btn-a', e => e.getAttribute('data-verb'))) === 'stars');
  await ev(() => { const B = GG.World.board; GG.Player.reset(B.x, B.y + 26); });
  await p.waitForTimeout(1000);
  check('at the Favour Board it shows a book', (await p.$eval('#btn-a', e => e.getAttribute('data-verb'))) === 'read');
  const fits = await ev(() => { const e = document.getElementById('btn-a'); return e.scrollHeight <= e.clientHeight + 1 && e.scrollWidth <= e.clientWidth + 1; });
  check('the picture and both lines of words fit inside the button', fits);
  await p.tap('#btn-a'); await p.waitForTimeout(400);
  check('and pressing it still does the thing', await ev(() => !document.getElementById('screen-favours').classList.contains('hidden')));
  await ev(() => GG.UI.close('screen-favours'));
  const fishBtn = await ev(() => { const b = getComputedStyle(document.getElementById('btn-fish'), '::before'); return (b.webkitMaskImage || b.maskImage || '').slice(0, 20); });
  check('the FISH button has a fish on it', /data:image/.test(fishBtn), fishBtn);

  /* ---- the swimming fish ---- */
  const fish = await ev(() => {
    const F = GG.Fishing, out = {};
    out.forms = {}; ['minnow', 'sunfish', 'pike', 'eel', 'flatfish', 'seacrab', 'crayfish'].forEach(sh => { const d = GG.FISH.find(f => f.art && f.art.shape === sh); out.forms[sh] = d ? F._form(d) : null; });
    out.junk = F._form(GG.FISH.find(f => f.isJunk) || { isJunk: true });
    out.all = GG.FISH.every(f => { const m = F._form(f); return m && (m.junk || m.crab || (m.k > 0 && m.deep > 0)); });
    function draw(def, t, spook) { const cv = document.createElement('canvas'); cv.width = 200; cv.height = 120; const c = cv.getContext('2d'); const keep = F.swimmers, rp = F.ripples; F.ripples = [];
      F.swimmers = [{ def, x: 100, y: 60, ang: 0, sp: 26, t, age: 5, spook: spook || 0, flee: 0 }]; const vw = GG.view.w, vh = GG.view.h; GG.view.w = 200; GG.view.h = 120;
      let err = null; try { F.drawShadows(c, { x: 0, y: 0 }, 0); } catch (e) { err = e.message; } GG.view.w = vw; GG.view.h = vh; F.swimmers = keep; F.ripples = rp;
      const d = c.getImageData(0, 0, 200, 120).data; let n = 0, x0 = 999, x1 = -1, y0 = 999, y1 = -1; for (let y = 0; y < 120; y++) for (let x = 0; x < 200; x++) if (d[(y * 200 + x) * 4 + 3] > 60) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      return { n, w: x1 - x0, h: y1 - y0, err, data: d }; }
    function differ(a, b) { let n = 0; for (let i = 3; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 40) n++; return n; }
    out.errs = GG.FISH.map(f => draw(f, 1).err).filter(Boolean);
    out.blank = GG.FISH.filter(f => draw(f, 1).n < 30).map(f => f.id);
    const by = sh => GG.FISH.find(f => f.art && f.art.shape === sh);
    const pike = draw(by('pike'), 1), sun = draw(by('sunfish'), 1), eel = draw(by('eel'), 1);
    out.pikeRatio = pike.w / pike.h; out.sunRatio = sun.w / sun.h; out.eelRatio = eel.w / Math.max(1, eel.h);
    out.moves = differ(draw(by('pike'), 1).data, draw(by('pike'), 1.35).data);
    out.spooked = differ(draw(by('pike'), 1).data, draw(by('pike'), 1, 0.16).data);
    out.crabMoves = differ(draw(by('seacrab'), 1).data, draw(by('seacrab'), 1.2).data);
    return out;
  });
  check('every fish has a way of swimming', fish.all, fish.forms);
  check('none of them fails to draw, none is a blank', fish.errs.length === 0 && fish.blank.length === 0, [fish.errs, fish.blank]);
  check('a pike is a long thin shape, a sunfish a short deep one', fish.pikeRatio > fish.sunRatio * 1.3, [fish.pikeRatio, fish.sunRatio]);
  check('an eel has no tail fin and wriggles more', fish.forms.eel.tail === 'none' && fish.forms.eel.wave > fish.forms.pike.wave);
  check('crabs and crayfish are drawn as themselves, and junk as a lump', fish.forms.seacrab.crab && fish.forms.crayfish.cray && fish.junk.junk);
  check('the body bends as it swims', fish.moves > 60, fish.moves);
  check('a startled fish whips into a C', fish.spooked > 120, fish.spooked);
  check('a crab’s legs scuttle', fish.crabMoves > 15, fish.crabMoves);

  /* real water: fish are there, drawn every frame, and can still be caught */
  const live = await ev(async () => { const W = GG.World; let spot = null; for (let y = 2500; y < 3400 && !spot; y += 20) for (let x = 4300; x < 5200; x += 20) if (!W.blocked(x, y, 12) && GG.Fishing.waterAt(x, y + 60) && !W.isWater(x, y)) { spot = [x, y]; break; }
    GG.Player.reset(spot[0], spot[1]); GG.Time.set(12 * 60); await new Promise(r => setTimeout(r, 2600));
    return { n: GG.Fishing.swimmers.length, formed: GG.Fishing.swimmers.filter(s => s._form).length, fishBtn: !document.getElementById('btn-fish').classList.contains('hidden') }; });
  check('by the water there are fish swimming, each with its shape', live.n > 0 && live.formed > 0, live);
  check('and the FISH button is offered', live.fishBtn, live);
  const fps = await ev(() => new Promise(res => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else res(n / 1.5); })(); }));
  check('still smooth beside the water (' + Math.round(fps) + ' frames a second)', fps > 30, fps);
  check('the What’s new list has the 1.24.0 entry', await ev(() => GG.CHANGELOG.some(c => c.v === '1.24.0')));

  results.forEach(r => console.log(r));
  if (errs.length) console.log(errs.join('\n'));
  const failed = results.filter(r => r.startsWith('FAIL')).length;
  console.log(failed ? failed + ' FAILED' : 'ALL ' + results.length + ' PASSED');
  await b.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
