/* v1.20: the "My character" screen - girl or boy, a name, skin, hair, eyes,
   clothes and something extra - and the player drawn from that look.
   node tests/v120char.js [url] */
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://localhost:8899/index.html';
(async () => {
  const b = await chromium.launch();
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const errs = [];
  const watch = (p, tag) => {
    p.on('pageerror', e => errs.push(tag + ' PAGEERROR: ' + e.message));
    p.on('console', m => {
      if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|fonts\.g/.test(m.text())) errs.push(tag + ' CONSOLE: ' + m.text());
    });
  };
  const isOpen = (p, id) => p.evaluate(id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); }, id);

  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  watch(p, '412');
  await p.goto(URL);
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(800);

  /* ---------- a new game makes a character first ---------- */
  await p.tap('#btn-play'); await p.waitForTimeout(500);
  ok('Play on a new game opens the character screen', await isOpen(p, 'screen-char'));
  ok('...and nothing is saved yet', await p.evaluate(() => GG.Save.data.player === null));
  ok('...starting as Guin, named Guin', await p.evaluate(() =>
    GG.CharSelect.look.hair === 'pigtails' && GG.CharSelect.look.outfit === 'sundress' &&
    document.getElementById('char-name').value === 'Guin'));
  const counts = await p.evaluate(() => ({
    hair: document.querySelectorAll('.cs-tile[data-field="hair"]').length,
    skin: document.querySelectorAll('[data-field="skin"]').length,
    hairCol: document.querySelectorAll('[data-field="hairCol"]').length,
    outfit: document.querySelectorAll('.cs-tile[data-field="outfit"]').length,
    acc: document.querySelectorAll('.cs-tile[data-field="acc"]').length,
    eyes: document.querySelectorAll('[data-field="eyes"]').length
  }));
  ok('lots to choose from (' + JSON.stringify(counts) + ')', counts.hair >= 10 && counts.skin >= 6 &&
    counts.hairCol >= 8 && counts.outfit >= 8 && counts.acc >= 8 && counts.eyes >= 4);

  /* every button a finger can hit */
  const small = await p.evaluate(() => [...document.querySelectorAll('#screen-char button, #char-name')]
    .filter(e => e.offsetParent).map(e => [e.id || e.getAttribute('data-value'), e.offsetWidth, e.offsetHeight])
    .filter(x => x[1] < 44 || x[2] < 44));
  ok('every tap target is at least 44px (' + JSON.stringify(small) + ')', small.length === 0);

  /* ---------- choices change the look ---------- */
  const tapChoice = async (field, value) => {
    const sel = '#char-rows [data-field="' + field + '"][data-value="' + value + '"]';
    await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
    await p.waitForTimeout(80);
    await p.tap(sel); await p.waitForTimeout(120);
  };
  await tapChoice('body', 'boy');
  await tapChoice('skin', 'deep');
  await tapChoice('hair', 'afro');
  await tapChoice('hairCol', 'blue');
  await tapChoice('eyes', 'green');
  await tapChoice('outfit', 'hoodie');
  await tapChoice('outfitCol', '2');
  await tapChoice('acc', 'cap');
  await tapChoice('accCol', 'yellow');
  const lk = await p.evaluate(() => GG.CharSelect.look);
  ok('tapping choices changes the look (' + [lk.body, lk.skin, lk.hair, lk.hairCol, lk.eyes, lk.outfit, lk.outfitCol, lk.acc, lk.accCol].join(',') + ')',
    lk.body === 'boy' && lk.skin === 'deep' && lk.hair === 'afro' && lk.hairCol === 'blue' && lk.eyes === 'green' &&
    lk.outfit === 'hoodie' && lk.outfitCol === 2 && lk.acc === 'cap' && lk.accCol === 'yellow');
  ok('the chosen tile is marked', await p.evaluate(() =>
    document.querySelector('[data-field="hair"][data-value="afro"]').classList.contains('on') &&
    !document.querySelector('[data-field="hair"][data-value="pigtails"]').classList.contains('on')));
  ok('a change makes the preview bounce', await p.evaluate(() => { GG.CharSelect._set('eyes', 'blue'); return GG.CharSelect._pop > 0.9; }));
  await p.waitForTimeout(700);
  const pv = await p.evaluate(() => {
    const c = document.getElementById('char-preview'), d = c.getContext('2d').getImageData(c.width / 2 - 40, c.height * 0.3, 80, c.height * 0.5).data;
    let dark = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 200) dark++;
    return dark;
  });
  ok('the preview shows the character (' + pv + ' dark pixels)', pv > 200);
  ok('hair tiles are drawn', await p.evaluate(() => {
    const c = document.querySelector('.cs-tile[data-field="hair"] canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n > c.width * c.height * 0.15;
  }));

  /* ---------- surprise me ---------- */
  await p.fill('#char-name', 'Rosie');
  const before = await p.evaluate(() => JSON.stringify(GG.CharSelect.look));
  let changed = 0;
  for (let i = 0; i < 4; i++) {
    await p.tap('#char-surprise'); await p.waitForTimeout(120);
    if (await p.evaluate(b => JSON.stringify(GG.CharSelect.look) !== b, before)) changed++;
  }
  ok('Surprise me! makes a new look (' + changed + '/4)', changed >= 3);
  ok('...and keeps the name', await p.evaluate(() => GG.CharSelect.look.name === 'Rosie' && document.getElementById('char-name').value === 'Rosie'));
  await tapChoice('hair', 'braids');
  const want = await p.evaluate(() => JSON.parse(JSON.stringify(GG.CharSelect.look)));

  /* ---------- let's go ---------- */
  await p.tap('#char-go'); await p.waitForTimeout(900);
  const saved = await p.evaluate(() => GG.Save.data.player);
  ok('Let’s go! saves the look', saved && saved.hair === 'braids' && saved.outfit === want.outfit && saved.skin === want.skin);
  ok('...and the name (' + (saved && saved.name) + ', GG.playerName() = ' + await p.evaluate(() => GG.playerName()) + ')',
    saved && saved.name === 'Rosie' && await p.evaluate(() => GG.playerName() === 'Rosie'));
  ok('...and it survives a reload', await p.evaluate(() => JSON.parse(localStorage.getItem('guins-garden-save-v1')).player.name === 'Rosie'));
  ok('...and the game starts', !(await isOpen(p, 'screen-char')) && !(await isOpen(p, 'screen-title')) &&
    await p.evaluate(() => GG.debugScene() === 'world'));

  /* ---------- the player is drawn with the chosen look ---------- */
  const drawDiff = await p.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = 180; cv.height = 180;
    const c = cv.getContext('2d');
    const P = GG.Player;
    function shot(look) {
      GG.Save.data.player = look;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 180, 180);
      c.setTransform(3, 0, 0, 3, 0, 0);
      P.speed = 0; P.swing = 0; P.stun = 0;
      P.draw(c, 30, 52, 1.0);
      return c.getImageData(0, 0, 180, 180).data;
    }
    const keep = GG.Save.data.player;
    const a = shot(Object.assign(GG.defaultPlayer(), { hair: 'pigtails', outfit: 'sundress' }));
    const b2 = shot(Object.assign(GG.defaultPlayer(), { hair: 'spiky', hairCol: 'blue', outfit: 'raincoat', skin: 'rich', acc: 'sunhat' }));
    GG.Save.data.player = keep;
    let diff = 0, ink = 0;
    for (let i = 0; i < a.length; i += 4) {
      if (Math.abs(a[i] - b2[i]) + Math.abs(a[i + 1] - b2[i + 1]) + Math.abs(a[i + 2] - b2[i + 2]) > 60) diff++;
      if (a[i + 3] > 0) ink++;
    }
    return { diff, ink };
  });
  ok('Player.draw uses the chosen look (' + drawDiff.diff + ' px differ, ' + drawDiff.ink + ' drawn)', drawDiff.diff > 800 && drawDiff.ink > 1500);

  /* in the real world canvas, around her */
  const worldDiff = await p.evaluate(async () => {
    const cv = document.getElementById('game');
    const grab = () => { const w = 90, h = 150; const d = cv.getContext('2d').getImageData(cv.width / 2 - w / 2, cv.height / 2 - h * 0.7, w, h).data; return d; };
    const wait = () => new Promise(res => setTimeout(res, 250));
    GG.Critters.clear(); GG.Critters.spawnNear = () => false;
    const keep = GG.Save.data.player;
    GG.Save.data.player = Object.assign(GG.defaultPlayer(), { hair: 'buzz', outfit: 'sporty', skin: 'porcelain', acc: 'none' });
    await wait(); const a = grab();
    GG.Save.data.player = Object.assign(GG.defaultPlayer(), { hair: 'afro', hairCol: 'pink', outfit: 'party', skin: 'rich', acc: 'none' });
    await wait(); const c2 = grab();
    GG.Save.data.player = keep;
    let d = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - c2[i]) + Math.abs(a[i + 1] - c2[i + 1]) + Math.abs(a[i + 2] - c2[i + 2]) > 60) d++;
    return d;
  });
  ok('...and in the garden itself (' + worldDiff + ' px differ around her)', worldDiff > 500);

  /* every hairstyle x body x direction renders, and they are all different */
  const sheet = await p.evaluate(() => {
    const L = GG.LOOKS, bad = [], hashes = {};
    ['girl', 'boy'].forEach(body => L.HAIRS.forEach(h => ['down', 'up', 'left', 'right'].forEach(dir => {
      const lk = Object.assign(GG.defaultPlayer(), { body, hair: h.id, acc: 'none' });
      const cv = GG.PlayerArt.renderTo(lk, dir, 2, {});
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      let n = 0, hs = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 20) { n++; hs = (hs * 31 + d[i - 3] + i) | 0; }
      if (n < 1500) bad.push(body + '/' + h.id + '/' + dir + ':' + n);
      if (body === 'girl' && dir === 'down') hashes[h.id] = hs;
    })));
    const uniq = new Set(Object.values(hashes)).size;
    /* and every outfit style, in every colour */
    L.OUTFITS.forEach(o => o.colors.forEach((c, k) => ['down', 'right', 'up'].forEach(dir => {
      const cv = GG.PlayerArt.renderTo(Object.assign(GG.defaultPlayer(), { outfit: o.id, outfitCol: k }), dir, 1.5, {});
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
      if (n < 800) bad.push(o.id + k + dir + ':' + n);
    })));
    L.ACCS.forEach(a => ['down', 'right', 'up'].forEach(dir => {
      try { GG.PlayerArt.renderTo(Object.assign(GG.defaultPlayer(), { acc: a.id }), dir, 1.5, {}); } catch (e) { bad.push(a.id + ':' + e.message); }
    }));
    return { bad, uniq, total: L.HAIRS.length };
  });
  ok('every hairstyle, body and direction draws (' + (sheet.bad.slice(0, 5).join(' ') || 'all fine') + ')', sheet.bad.length === 0);
  ok('every hairstyle looks different (' + sheet.uniq + ' of ' + sheet.total + ')', sheet.uniq === sheet.total);

  /* walking frames differ from standing */
  ok('walking animates (frames differ)', await p.evaluate(() => {
    const lk = GG.defaultPlayer();
    const px = cv => cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    const a = px(GG.PlayerArt.renderTo(lk, 'right', 2, { frame: 1 })), c = px(GG.PlayerArt.renderTo(lk, 'right', 2, { frame: 5 }));
    let d = 0; for (let i = 0; i < a.length; i += 4) if (a[i + 3] !== c[i + 3]) d++;
    return d > 100;
  }));

  /* a broken or partial look in a save still draws */
  ok('a half-written look falls back safely', await p.evaluate(() => {
    const keep = GG.Save.data.player;
    GG.Save.data.player = { hair: 'nonsense', outfit: 'tuxedo', outfitCol: 99 };
    const cv = document.createElement('canvas'); cv.width = 90; cv.height = 90;
    let fine = true;
    try { GG.Player.draw(cv.getContext('2d'), 40, 70, 1); } catch (e) { fine = false; }
    GG.Save.data.player = keep;
    return fine;
  }));

  /* ---------- the cost of drawing her every frame ---------- */
  const perf = await p.evaluate(() => {
    const c = document.getElementById('game').getContext('2d');
    const P = GG.Player;
    c.save();
    /* every pose of this direction drawn once (as the idle-time warm-up does) */
    const S = GG.PlayerArt._deviceScale(c), lk = GG.playerLook();
    let g0 = performance.now();
    for (let f = -1; f < GG.PlayerArt.WALK_FRAMES; f++) GG.PlayerArt.sprite(lk, P.dir, f, false, S, false);
    const genMs = (performance.now() - g0) / (GG.PlayerArt.WALK_FRAMES + 1);
    P.speed = 120;
    const N = 400;
    let t0 = performance.now();
    for (let i = 0; i < N; i++) { P.walk = i * 0.07; P.draw(c, 100, 100, i * 0.1); }
    const walk = (performance.now() - t0) / N;
    P.speed = 0;
    t0 = performance.now();
    for (let i = 0; i < N; i++) P.draw(c, 100, 100, i * 0.1);
    const idle = (performance.now() - t0) / N;
    c.restore();
    return { walk: +walk.toFixed(3), idle: +idle.toFixed(3), cached: GG.PlayerArt._count, gen: +genMs.toFixed(1) };
  });
  ok('Player.draw is cheap with the sprite cache (walking ' + perf.walk + ' ms, idle ' + perf.idle + ' ms, ' + perf.cached + ' poses cached; drawing a new pose once costs ' + perf.gen + ' ms)',
    perf.walk < 0.3 && perf.idle < 0.3 && perf.cached >= 9);

  /* ---------- change your look from the Garden Menu ---------- */
  await p.tap('#btn-menu'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('menu-char').scrollIntoView({ block: 'center' }));
  await p.tap('#menu-char'); await p.waitForTimeout(500);
  ok('My character in the menu opens the screen', await isOpen(p, 'screen-char'));
  ok('...and the menu steps aside', !(await isOpen(p, 'screen-menu')));
  ok('...showing the saved look and name', await p.evaluate(() =>
    GG.CharSelect.look.hair === 'braids' && document.getElementById('char-name').value === 'Rosie' &&
    document.getElementById('char-title').textContent === 'My character'));
  await tapChoice('hair', 'bob');
  await p.tap('#char-go'); await p.waitForTimeout(600);
  ok('...and a new hairdo is saved without restarting', await p.evaluate(() => GG.Save.data.player.hair === 'bob' && GG.debugScene() === 'world') &&
    !(await isOpen(p, 'screen-char')));

  /* ---------- an old save: prefilled as Guin ---------- */
  await p.evaluate(() => {
    GG.Save.save = () => {};   /* so leaving the page cannot write it back */
    const s = JSON.parse(localStorage.getItem('guins-garden-save-v1'));
    delete s.player; s.caught = { monarch: { count: 3, first: 1 } }; s.sparkles = 42; s.totalCatches = 3;
    localStorage.setItem('guins-garden-save-v1', JSON.stringify(s));
  });
  await p.reload(); await p.waitForTimeout(800);
  ok('an old save loads with no character', await p.evaluate(() => GG.Save.data.player === null && GG.Save.data.sparkles === 42));
  ok('...and is drawn as Guin meanwhile (' + await p.evaluate(() => GG.playerName()) + ')', await p.evaluate(() => GG.playerLook().hair === 'pigtails' && GG.playerName() === 'Guin'));
  await p.tap('#btn-play'); await p.waitForTimeout(500);
  ok('Play on an old save shows the screen, prefilled as Guin', await isOpen(p, 'screen-char') &&
    await p.evaluate(() => GG.CharSelect.look.hair === 'pigtails' && document.getElementById('char-name').value === 'Guin'));
  await p.tap('#char-go'); await p.waitForTimeout(700);
  ok('...one tap on Let’s go! and she is playing, bugs intact', await p.evaluate(() =>
    GG.Save.data.player && GG.Save.data.player.name === 'Guin' && GG.Save.data.caught.monarch.count === 3 && GG.debugScene() === 'world'));

  /* ---------- the title's My character button ---------- */
  await p.evaluate(() => { GG.Save.save = () => {}; localStorage.clear(); });
  await p.reload(); await p.waitForTimeout(800);
  await p.tap('#btn-char'); await p.waitForTimeout(400);
  ok('My character on the title opens the screen', await isOpen(p, 'screen-char'));
  await p.tap('#char-x'); await p.waitForTimeout(300);
  ok('...the X goes back to the title without saving', !(await isOpen(p, 'screen-char')) && await isOpen(p, 'screen-title') &&
    await p.evaluate(() => GG.Save.data.player === null));

  /* ---------- a friend's visit makes its own character ---------- */
  await p.tap('#btn-guest'); await p.waitForTimeout(300);
  await p.fill('#guest-name', 'Mia');
  await p.tap('#guest-start'); await p.waitForTimeout(600);
  ok('a guest visit opens the screen with the friend’s name', await isOpen(p, 'screen-char') &&
    await p.evaluate(() => document.getElementById('char-name').value === 'Mia' && GG.Save.isGuest()));
  await tapChoice('hair', 'spiky');
  await p.tap('#char-go'); await p.waitForTimeout(600);
  ok('...the guest’s character goes in the guest slot only', await p.evaluate(() => {
    const main = JSON.parse(localStorage.getItem('guins-garden-save-v1') || 'null');
    return GG.Save.data.player.hair === 'spiky' && GG.Save.data.player.name === 'Mia' && GG.playerName() === 'Mia' &&
      (!main || !main.player);
  }));

  /* ---------- small and big screens ---------- */
  for (const [w, h] of [[360, 640], [1280, 800]]) {
    const q = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 800, deviceScaleFactor: w < 800 ? 2 : 1 });
    watch(q, w + 'x' + h);
    await q.goto(URL);
    await q.evaluate(() => localStorage.clear()); await q.reload(); await q.waitForTimeout(700);
    await q.click('#btn-play'); await q.waitForTimeout(1300);
    const lay = await q.evaluate(() => {
      const body = document.querySelector('#screen-char .body'), go = document.getElementById('char-go').getBoundingClientRect();
      const pv = document.getElementById('char-preview').getBoundingClientRect();
      const tiny = [...document.querySelectorAll('#screen-char button')].filter(e => e.offsetParent)
        .map(e => (e.id || e.getAttribute('data-value')) + ':' + e.offsetWidth + 'x' + e.offsetHeight)
        .filter(s => { const m = s.split(':').pop().split('x'); return +m[0] < 44 || +m[1] < 44; });
      return { scrolls: body.scrollHeight > body.clientHeight, goIn: go.bottom <= innerHeight && go.top >= 0,
        pvH: Math.round(pv.height), noSide: document.documentElement.scrollWidth <= innerWidth, tiny };
    });
    ok(w + 'x' + h + ': Let’s go! on screen, rows scroll inside the sheet, preview ' + lay.pvH + 'px, small targets: ' + (lay.tiny.join(' ') || 'none'),
      lay.goIn && lay.pvH >= 140 && lay.noSide && lay.tiny.length === 0 && (w > 800 || lay.scrolls));
    await q.close();
  }

  ok('no page errors (' + errs.slice(0, 3).join(' | ') + ')', errs.length === 0);
  console.log(r.join('\n'));
  const fails = r.filter(x => x.startsWith('FAIL')).length;
  console.log('\n' + (r.length - fails) + '/' + r.length + ' passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
