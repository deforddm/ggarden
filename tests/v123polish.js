/* v1.23: the polish pass - the two bodies, footsteps by surface, the echo,
   and the little effects. */
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
  await p.waitForTimeout(800);
  const results = [];
  const check = (name, ok, extra) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + (ok || extra == null ? '' : '  -> ' + JSON.stringify(extra))); };
  const ev = (fn, a) => p.evaluate(fn, a);

  /* ---- girl and boy ---- */
  const art = await ev(() => {
    function px(look, dir, ph) {
      const cv = document.createElement('canvas'); cv.width = 240; cv.height = 300; const c = cv.getContext('2d');
      c.translate(120, 270); c.scale(4, 4); GG.PlayerArt.draw(c, look, 0, 0, dir, ph, 0, {});
      return c.getImageData(0, 0, 240, 300).data;
    }
    function diff(a, b) { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]) > 60) n++; return n; }
    /* width of the drawing in a band of rows (canvas y) */
    function width(d, y0, y1) { let x0 = 999, x1 = -1; for (let y = y0; y < y1; y++) for (let x = 0; x < 240; x++) if (d[(y * 240 + x) * 4 + 3] > 80) { if (x < x0) x0 = x; if (x > x1) x1 = x; } return x1 - x0; }
    const same = { skin: 'light', hair: 'buzz', hairCol: 'black', eyes: 'dark', outfit: 'tee', outfitCol: 0, acc: 'none', accCol: 'pink', name: 'T', v: 1 };
    const G = Object.assign({ body: 'girl' }, same), B = Object.assign({ body: 'boy' }, same);
    const out = {};
    ['down', 'right', 'up'].forEach(d => { out[d] = diff(px(G, d, null), px(B, d, null)); });
    const g = px(G, 'down', null), bb = px(B, 'down', null);
    /* shoulders: rows 18.5 to 16 units above the feet; face: rows 30 to 19 */
    out.gShould = width(g, 270 - 76, 270 - 62); out.bShould = width(bb, 270 - 76, 270 - 62);
    out.gFeet = width(g, 270 - 8, 270 - 1); out.bFeet = width(bb, 270 - 8, 270 - 1);
    /* the face alone: head-only drawings */
    function face(look) { const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200; const c = cv.getContext('2d'); GG.PlayerArt.head(c, look, 100, 150, 5, {}); return c.getImageData(0, 0, 200, 200).data; }
    out.face = diff(face(G), face(B));
    /* white teeth in his mouth, none in hers */
    function whites(d) { let n = 0; for (let y = 0; y < 200; y++) for (let x = 60; x < 140; x++) { const i = (y * 200 + x) * 4; if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245 && d[i + 3] > 250) n++; } return n; }
    out.gWhite = whites(face(G)); out.bWhite = whites(face(B));
    /* walking: how far the hands travel */
    out.walkG = diff(px(G, 'down', 0), px(G, 'down', Math.PI / 2)); out.walkB = diff(px(B, 'down', 0), px(B, 'down', Math.PI / 2));
    /* Guin herself is still Guin */
    out.guin = JSON.stringify(GG.defaultPlayer());
    return out;
  });
  check('the same hair and clothes on a girl and a boy draw differently from every side', art.down > 500 && art.right > 300 && art.up > 150, art);
  check('he is broader across the shoulders', art.bShould >= art.gShould + 5, [art.gShould, art.bShould]);
  check('and stands with his feet further apart', art.bFeet >= art.gFeet + 3, [art.gFeet, art.bFeet]);
  check('their faces differ', art.face > 250, art.face);
  check('he grins with his teeth; hers is an open smile', art.bWhite > art.gWhite + 40, [art.gWhite, art.bWhite]);
  check('the default is still Guin: a girl, pigtails, a sundress, a flower', /"body":"girl"/.test(art.guin) && /pigtails/.test(art.guin) && /sundress/.test(art.guin) && /flower/.test(art.guin));

  /* ---- the creator ---- */
  await p.tap('#btn-play');
  await p.waitForTimeout(500);
  const open = await ev(() => !document.getElementById('screen-char').classList.contains('hidden'));
  check('a new game opens My character', open);
  await p.$eval('#char-rows .cs-btn[data-field="body"][data-value="boy"]', e => e.click());
  await p.waitForTimeout(200);
  const boy = await ev(() => Object.assign({}, GG.CharSelect.look));
  check('choosing Boy swaps the pigtails, the sundress and the flower', boy.body === 'boy' && boy.hair === 'short' && boy.outfit === 'tee' && boy.acc === 'none', boy);
  check('and the buttons show it', await ev(() => document.querySelector('#char-rows .cs-btn[data-field="hair"][data-value="short"]').classList.contains('on') && document.querySelector('#char-rows .cs-btn[data-field="outfit"][data-value="tee"]').classList.contains('on')));
  await p.$eval('#char-rows .cs-btn[data-field="hair"][data-value="braids"]', e => e.click());
  await p.$eval('#char-rows .cs-btn[data-field="outfit"][data-value="party"]', e => e.click());
  await p.waitForTimeout(150);
  const free = await ev(() => Object.assign({}, GG.CharSelect.look));
  check('but a boy can still be given braids and a tutu by hand', free.body === 'boy' && free.hair === 'braids' && free.outfit === 'party', free);
  await p.$eval('#char-rows .cs-btn[data-field="hair"][data-value="afro"]', e => e.click());
  await p.$eval('#char-rows .cs-btn[data-field="outfit"][data-value="overalls"]', e => e.click());
  await p.$eval('#char-rows .cs-btn[data-field="body"][data-value="girl"]', e => e.click());
  await p.waitForTimeout(150);
  const keep = await ev(() => Object.assign({}, GG.CharSelect.look));
  check('hair and clothes that suit both stay when the body changes', keep.body === 'girl' && keep.hair === 'afro' && keep.outfit === 'overalls', keep);
  await p.$eval('#char-rows .cs-btn[data-field="body"][data-value="boy"]', e => e.click());
  await p.$eval('#char-rows .cs-btn[data-field="body"][data-value="girl"]', e => e.click());
  await p.screenshot({ path: '/tmp/v123-creator.png' });
  await ev(() => document.getElementById('char-go').click());
  await p.waitForTimeout(600);
  await ev(() => { GG.UI.close('screen-news'); if (GG.Favours) GG.Favours._say = function () {}; });

  /* ---- what is under her feet ---- */
  const surf = await ev(() => {
    const W = GG.World, out = {};
    out.garden = GG.stepSurface(W.DOOR.x, W.DOOR.y + 100);
    out.bridge = W.bridge ? GG.stepSurface(W.bridge.x, W.bridge.y) : 'wood';
    /* find a stream cell, a beach cell, a tundra cell and a mesa-top cell */
    function find(test) { for (let y = 60; y < W.H; y += 40) for (let x = 60; x < W.W; x += 40) if (test(x, y)) return GG.stepSurface(x, y); return null; }
    out.water = find((x, y) => W.isWater(x, y) && !W.isDeepWater(x, y));
    out.beach = find((x, y) => !W.isWater(x, y) && W.biomeAt(x, y) === 'beach');
    out.tundra = find((x, y) => !W.isWater(x, y) && W.biomeAt(x, y) === 'tundra');
    out.hill = find((x, y) => !W.isWater(x, y) && W.biomeAt(x, y) === 'hill');
    out.mesa = GG.stepSurface(W.MESA.cx, W.MESA.cy);
    GG.debugSetScene && 0;
    return out;
  });
  check('grass in the garden, wood on the bridge', surf.garden === 'grass' && surf.bridge === 'wood', surf);
  check('water in the stream, sand on the beach, snow on the tundra, stone on the hills and the Mesa', surf.water === 'water' && surf.beach === 'sand' && surf.tundra === 'snow' && surf.hill === 'stone' && surf.mesa === 'stone', surf);
  const steps = await ev(() => { const heard = []; const real = GG.Sfx.step; GG.Sfx.step = function (s) { heard.push(s); return real.call(GG.Sfx, s); };
    let threw = null; try { ['wood', 'stone', 'sand', 'snow', 'water', 'grass', null, undefined].forEach(s => GG.Sfx.step(s)); GG.Sfx.click(); GG.Sfx.swing(); } catch (e) { threw = e.message; }
    window.__heard = heard; heard.length = 0; return threw; });
  check('every footstep, the click and the swing play without a fault', steps === null, steps);

  /* walking for real: steps are heard with their surface, and dust rises */
  await ev(() => { GG.Critters.clear(); GG.Critters.spawnNear = function () {}; GG.Polish.clear(); GG.Player.reset(GG.World.DOOR.x + 40, GG.World.DOOR.y + 170); GG.Time.set(12 * 60); });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(1300); await p.keyboard.up('ArrowDown');
  const walk = await ev(() => ({ heard: window.__heard.slice(), counts: GG.Polish.counts() }));
  check('walking is heard as grass, several steps', walk.heard.length >= 3 && walk.heard.every(s => s === 'grass'), walk);
  check('and kicks up flecks of grass', walk.counts.puffs > 0, walk.counts);
  const ring = await ev(() => { GG.Polish.clear(); GG.Polish.step(100, 100, 'water'); GG.Polish.step(100, 100, 'wood'); const a = GG.Polish.counts(); GG.Polish.step(100, 100, 'sand'); return [a, GG.Polish.counts()]; });
  check('wading makes a ring, wood makes nothing, sand makes dust', ring[0].rings === 1 && ring[0].puffs === 0 && ring[1].puffs === 3, ring);
  await p.waitForTimeout(1400);
  check('and it all fades away', await ev(() => { const c = GG.Polish.counts(); return c.puffs === 0 && c.rings === 0; }));

  /* the net's streak and a catch's sparkles */
  const tr = await ev(async () => { GG.Critters.clear(); GG.Player.swing = 0; GG.Player.stun = 0; GG.Player.startSwing(); let most = 0;
    for (let i = 0; i < 10; i++) { await new Promise(r => setTimeout(r, 30)); most = Math.max(most, GG.Polish.counts().trail); } return most; });
  check('a swing leaves a streak behind the net', tr >= 2, tr);
  await p.waitForTimeout(700);
  check('which is gone a moment later', (await ev(() => GG.Polish.counts().trail)) === 0);
  const sp = await ev(() => { GG.Polish.burst(200, 200, '#ff0'); return GG.Polish.counts().sparks; });
  check('a catch goes off in nine sparkles', sp === 9, sp);

  /* cloud shadows and the corners */
  const shade = await ev(() => {
    function lum(night, rain) { const cv = document.createElement('canvas'); cv.width = 400; cv.height = 300; const c = cv.getContext('2d'); c.fillStyle = '#ffffff'; c.fillRect(0, 0, 400, 300);
      let dark = 0; for (let cx = 0; cx < 2600; cx += 400) for (let cy = 0; cy < 1900; cy += 300) { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 400, 300); GG.Polish.drawClouds(c, { x: cx, y: cy }, 400, 300, night, rain);
        const d = c.getImageData(0, 0, 400, 300).data; for (let i = 0; i < d.length; i += 64) if (d[i] < 250) dark++; } return dark; }
    const cv = document.createElement('canvas'); cv.width = 400; cv.height = 300; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 400, 300); GG.Polish.drawVignette(c, 400, 300);
    const d = c.getImageData(0, 0, 400, 300).data;
    return { day: lum(0, false), night: lum(1, false), rain: lum(0, true), corner: d[0], middle: d[(150 * 400 + 200) * 4] };
  });
  check('cloud shadows by day, none at night or in the rain', shade.day > 500 && shade.night === 0 && shade.rain === 0, shade);
  check('the corners are a little darker than the middle, and the middle is untouched', shade.corner < 240 && shade.corner > 150 && shade.middle === 255, shade);

  /* the echo is wired after the music bus and the music still runs */
  await ev(() => { GG.UI._cardAt = 0; GG.UI.hideCatch(); });
  await p.waitForTimeout(200);
  await p.tap('#btn-menu'); await p.waitForTimeout(200); await ev(() => GG.UI.close('screen-menu'));
  const snd = await ev(() => ({ ready: GG.Audio.ready(), playing: GG.Music.playing, state: GG.Audio.ctx() && GG.Audio.ctx().state }));
  check('the sound is running', snd.ready && snd.playing, snd);
  const fps = await ev(() => new Promise(res => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else res(n / 1.5); })(); }));
  check('the garden still runs smoothly (' + Math.round(fps) + ' frames a second)', fps > 30, fps);
  await p.screenshot({ path: '/tmp/v123-world.png' });
  check('the What\u2019s new list has the 1.23.0 entry', await ev(() => GG.CHANGELOG.some(c => c.v === '1.23.0')));

  results.forEach(r => console.log(r));
  if (errs.length) console.log(errs.join('\n'));
  const failed = results.filter(r => r.startsWith('FAIL')).length;
  console.log(failed ? failed + ' FAILED' : 'ALL ' + results.length + ' PASSED');
  await b.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
