/* Checks the fishing mechanic end to end. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);

  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);

  // stand on the pond bank facing the water
  const setup = async () => p.evaluate(() => {
    const W = GG.World;
    // walk east from the middle of the pond until we hit land, then step back
    let x = W.pond.cx, y = W.pond.cy;
    while (W.isWater(x, y)) x += 4;
    x += 14;
    GG.Player.reset(x, y);
    GG.Player.angle = Math.PI;          // facing west, back at the water
    GG.Player.dir = 'left';
    GG.Fishing.reset();
    GG.Fishing.swimmers.length = 0;
    return { x, y, water: W.isWater(x, y) };
  });
  const pos = await setup();
  ok('she can stand on the bank (not in the water)', !pos.water);

  ok('facing the water gives a cast target', await p.evaluate(() => !!GG.Fishing.castTarget(GG.Player)));
  ok('facing away gives none', await p.evaluate(() => {
    const a = GG.Player.angle; GG.Player.angle = 0;
    const t = GG.Fishing.castTarget(GG.Player);
    GG.Player.angle = a;
    return t === null;
  }));
  await p.waitForTimeout(400);
  ok('the FISH button appears on the bank', !(await p.$eval('#btn-fish', e => e.classList.contains('hidden'))));

  ok('the pond stocks itself with fish', await p.evaluate(() => GG.Fishing.swimmers.length > 0));
  ok('every fish stays in the water', await p.evaluate(() =>
    GG.Fishing.swimmers.every(s => GG.World.isWater(s.x, s.y))));
  ok('only fish that bite at this time of day are here', await p.evaluate(() => {
    const phase = GG.Time.phase();
    return GG.Fishing.swimmers.every(s => s.def.times.indexOf('any') >= 0 || s.def.times.indexOf(phase) >= 0);
  }));

  // a full cast -> bite -> catch, with a fish parked right on the bait
  const run = await p.evaluate(async () => {
    GG.Fishing._stock = GG.Fishing.stock;
    GG.Fishing.stock = function () {};      // no restocking while we test one fish
    GG.Fishing.reset();
    GG.Fishing.swimmers.length = 0;
    const t = GG.Fishing.castTarget(GG.Player);
    GG.Fishing.swimmers.push({
      def: GG.FISH_BY_ID.bluegill, x: t.x + 30, y: t.y, ang: 0, sp: 30,
      timer: 2, chase: 0, t: 0, left: false, age: 0
    });
    GG.Fishing.cast(GG.Player);
    const seen = [];
    for (let i = 0; i < 400; i++) {
      GG.Fishing.update(0.03, GG.Player);
      if (seen[seen.length - 1] !== GG.Fishing.state) seen.push(GG.Fishing.state);
      if (GG.Fishing.state === 'bite') break;
    }
    const tapped = GG.Fishing.tap();
    let res = null;
    for (let i = 0; i < 40 && !res; i++) res = GG.Fishing.update(0.03, GG.Player);
    return { seen, tapped, res, idle: GG.Fishing.state, pond: GG.Fishing.swimmers.length };
  });
  ok('the pond stayed frozen for the test', run.pond === 0);
  ok('a cast runs cast -> wait -> nibble -> bite (' + run.seen.join(' -> ') + ')',
    run.seen.join(',').indexOf('cast,wait,nibble,bite') === 0);
  ok('tapping on the bite lands the fish', run.tapped === 'catch' && run.res && run.res.kind === 'catch'
    && run.res.def && run.res.def.id === 'bluegill');
  ok('the line is idle again afterwards', run.idle === 'idle');

  // tapping too early
  const early = await p.evaluate(async () => {
    GG.Fishing.reset(); GG.Fishing.swimmers.length = 0;
    GG.Fishing.cast(GG.Player);
    for (let i = 0; i < 20; i++) GG.Fishing.update(0.03, GG.Player);
    const t = GG.Fishing.tap();
    let res = null;
    for (let i = 0; i < 40 && !res; i++) res = GG.Fishing.update(0.03, GG.Player);
    return { t, res };
  });
  ok('reeling in too early just loses the cast', early.t === 'early' && early.res.kind === 'early');

  // missing the window
  const missed = await p.evaluate(async () => {
    GG.Fishing.reset(); GG.Fishing.swimmers.length = 0;
    const tt = GG.Fishing.castTarget(GG.Player);
    GG.Fishing.swimmers.push({ def: GG.FISH_BY_ID.perch, x: tt.x + 20, y: tt.y, ang: 0, sp: 30,
      timer: 2, chase: 0, t: 0, left: false, age: 0 });
    GG.Fishing.cast(GG.Player);
    for (let i = 0; i < 400 && GG.Fishing.state !== 'bite'; i++) GG.Fishing.update(0.03, GG.Player);
    let res = null;
    for (let i = 0; i < 200 && !res; i++) res = GG.Fishing.update(0.03, GG.Player);
    return res;
  });
  ok('not tapping in time means it gets away', missed && missed.kind === 'lost');

  // walking away cancels
  const walked = await p.evaluate(async () => {
    GG.Fishing.reset(); GG.Fishing.swimmers.length = 0;
    GG.Fishing.cast(GG.Player);
    for (let i = 0; i < 20; i++) GG.Fishing.update(0.03, GG.Player);
    GG.Player.x += 60;
    let res = null;
    for (let i = 0; i < 40 && !res; i++) res = GG.Fishing.update(0.03, GG.Player);
    GG.Player.x -= 60;
    return res;
  });
  ok('walking away reels the line in', walked && walked.kind === 'moved');

  // the catch popup and the Fish Book
  await p.evaluate(() => {
    GG.Fishing.reset();
    ['bluegill','bass','koi','catfish'].forEach(id => GG.Save.addFish(id));
    GG.Save.data.sparkles = 3000; GG.Save.save();
  });
  await p.evaluate(() => GG.Book.open('fish'));
  await p.waitForTimeout(500);
  ok('the Fish Book lists the fish', await p.$eval('#book-grid', e => e.children.length) === 29);
  ok('the book title switches', await p.$eval('#book-title', e => e.textContent) === 'Fish Book');
  await p.screenshot({ path: __dirname + '/shots/fish-book.png' });
  await p.evaluate(() => GG.Book.showDetail(GG.FISH_BY_ID.koi));
  await p.waitForTimeout(500);
  await p.screenshot({ path: __dirname + '/shots/fish-detail.png' });
  await p.evaluate(() => GG.UI.close('screen-book'));

  // aquarium
  await p.evaluate(() => {
    const t = GG.Save.data.terrariums[0];
    t.type = 'aquarium'; t.bg = 'clear';
    t.fish = [
      { id: 'bluegill', x: 200, y: 150, s: 1, seed: 0.3 },
      { id: 'koi', x: 420, y: 240, s: 1, seed: 0.6 },
      { id: 'catfish', x: 300, y: 330, s: 1, seed: 0.1 }
    ];
    t.decor = [{ id: 'fern', x: 520, y: 380, s: 1, seed: 0.2 }, { id: 'rock', x: 130, y: 385, s: 1, seed: 0.5 }];
    GG.Save.save();
    GG.Terrarium.open();
  });
  await p.waitForTimeout(400);
  const before = await p.evaluate(() => GG.Save.data.terrariums[0].fish.map(f => {
    const m = GG.Terrarium.motionFor(f); return [m.lx, m.ly];
  }));
  await p.waitForTimeout(2200);
  const after = await p.evaluate(() => GG.Save.data.terrariums[0].fish.map(f => {
    const m = GG.Terrarium.motionFor(f); return [m.lx, m.ly];
  }));
  const moved = before.map((s, i) => Math.hypot(after[i][0] - s[0], after[i][1] - s[1]));
  ok('fish swim about in an aquarium (' + moved.map(x => Math.round(x)).join(', ') + 'px)', moved.every(d => d > 5));
  ok('fish stay inside the glass', await p.evaluate(() =>
    GG.Save.data.terrariums[0].fish.every(f => {
      const m = GG.Terrarium.motionFor(f);
      return m.lx > 40 && m.lx < 600 && m.ly > 50 && m.ly < 370;
    })));
  await p.screenshot({ path: __dirname + '/shots/aquarium.png' });

  // fish are refused in a dry tank
  ok('a terrarium refuses fish altogether', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[0];
    t.type = 'terrarium'; t.bg = 'meadow'; t.fish = [];
    GG.Terrarium.refresh();
    GG.Terrarium.addItem('fish', 'bluegill');
    return t.fish.length === 0;
  }));

  await p.evaluate(() => { if (GG.Fishing._stock) GG.Fishing.stock = GG.Fishing._stock; });

  console.log(r.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
