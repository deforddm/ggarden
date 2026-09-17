/* The river, the stream, the inlet, the beach and the tidepools. */
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

  // ---- every water is really there, and named correctly ----
  const waters = await p.evaluate(() => {
    const W = GG.World, out = {}, counts = {};
    for (let i = 0; i < W.mask.length; i++) counts[W.mask[i]] = (counts[W.mask[i]] || 0) + 1;
    const probe = (x, y) => ({ kind: W.waterKind(x, y), place: W.placeName(x, y) });
    out.counts = counts;
    out.pond = probe(2220, 2980);
    out.stream = probe(2500, 1840);
    out.river = probe(3680, 3110);
    out.estuary = probe(4890, 3730);
    out.sea = probe(5600, 4060);
    out.pool = probe(W.tidepools[0].x, W.tidepools[0].y);
    out.house = probe(W.HOUSE.x, W.HOUSE.y);
    out.poolsAboveTide = W.tidepools.every(q => q.y + q.ry * 1.2 < W.shoreY(q.x));
    return out;
  });
  ok('the pond is the Lily Pond', waters.pond.kind === 1 && waters.pond.place === 'Lily Pond');
  ok('the stream is Pebble Stream', waters.stream.kind === 2 && waters.stream.place === 'Pebble Stream');
  ok('the river is the Winding River', waters.river.kind === 3 && waters.river.place === 'Winding River');
  ok('the inlet is Gull Inlet', waters.estuary.kind === 4 && waters.estuary.place === 'Gull Inlet');
  ok('the sea is the Open Sea', waters.sea.kind === 5 && waters.sea.place === 'The Open Sea');
  ok('the tidepools are tidepools', waters.pool.kind === 6 && waters.pool.place === 'The Tidepools');
  ok('the cottage is on dry land (' + waters.house.place + ')', waters.house.kind === 0);
  ok('every tidepool sits above the tide line', waters.poolsAboveTide);
  ok('all six kinds of water exist', [1, 2, 3, 4, 5, 6].every(k => (waters.counts[k] || 0) > 40));

  // ---- nothing wet where the cottage and its garden are ----
  ok('no water in the cottage garden', await p.evaluate(() => {
    const W = GG.World, H = W.HOUSE;
    for (let dy = -220; dy <= 160; dy += 12)
      for (let dx = -190; dx <= 190; dx += 12)
        if (W.isWater(H.x + dx, H.y + dy)) return false;
    return true;
  }));

  // ---- she can wade a tidepool but not the sea ----
  const wade = await p.evaluate(() => {
    const W = GG.World, q = W.tidepools[1];
    return { pool: !W.blocked(q.x, q.y, 6), sea: W.blocked(5600, 4060, 6) };
  });
  ok('she can wade into a tidepool', wade.pool);
  ok('but the deep sea stops her', wade.sea);
  ok('she can paddle across the little stream', await p.evaluate(() =>
    !GG.World.blocked(2500, 1840, 6) && GG.World.waterKind(2500, 1840) === 2));
  ok('the river is too deep to cross', await p.evaluate(() =>
    GG.World.blocked(3680, 3110, 6) && GG.World.waterKind(3680, 3110) === 3));

  // ---- fish live in the right water ----
  const fish = await p.evaluate(() => {
    const F = GG.Fishing, out = {};
    ['pond', 'stream', 'river', 'estuary', 'sea'].forEach(w => {
      out[w] = F.eligible(w).map(c => c.f.id);
    });
    out.tidepoolFishable = F.fishable(GG.World.tidepools[0].x, GG.World.tidepools[0].y);
    out.seaFishable = F.fishable(5600, 4060);
    out.wrong = [];
    GG.FISH.forEach(f => {
      f.waters.forEach(w => {
        if (F.eligible(w).length && GG.FISH.filter(g => g.id === f.id).length !== 1) out.wrong.push(f.id);
      });
    });
    return out;
  });
  ok('every water has fish to catch',
    ['pond', 'stream', 'river', 'estuary', 'sea'].every(w => fish[w].length > 0));
  ok('the sea has sea fish, not pond fish',
    fish.sea.indexOf('bluegill') < 0 && fish.sea.indexOf('mackerel') >= 0);
  const SEA_ONLY = ['halibut', 'cod', 'mackerel', 'snapper', 'mola'];
  ok('the stream has stream fish, not sea fish',
    SEA_ONLY.every(id => fish.stream.indexOf(id) < 0) &&
    ['creek_chub', 'smallmouth', 'brook_trout', 'sculpin', 'crayfish']
      .some(id => fish.stream.indexOf(id) >= 0));
  ok('the pond has no sea fish either', SEA_ONLY.every(id => fish.pond.indexOf(id) < 0));
  ok('you fish the sea but not the tidepools', fish.seaFishable && !fish.tidepoolFishable);

  // ---- the tidepool creatures turn up in the pools, and only there ----
  const pool = await p.evaluate(async () => {
    const W = GG.World, q = W.tidepools[2];
    GG.Player.reset(q.x, q.y - 90);
    GG.Critters.clear();
    for (let i = 0; i < 900; i++) GG.Critters.spawnNear(q.x, q.y, 10, 120);
    const list = GG.Critters.list;
    const wet = list.filter(b => W.waterKind(b.x, b.y) !== 0);
    const dry = list.filter(b => W.waterKind(b.x, b.y) === 0);
    return {
      n: wet.length,
      allTide: wet.every(b => b.def.behavior === 'tide'),
      allInPool: wet.every(b => W.waterKind(b.x, b.y) === W.KIND.TIDEPOOL),
      noneAdrift: dry.every(b => b.def.behavior !== 'tide'),
      kinds: Array.from(new Set(wet.map(b => b.def.id)))
    };
  });
  ok('tidepool creatures appear in the pools (' + pool.kinds.length + ' kinds)', pool.n > 0 && pool.kinds.length >= 3);
  ok('everything in the water is a tidepool creature', pool.allTide);
  ok('all of them are in a pool, not the open sea', pool.allInPool);
  ok('and none of them turn up on dry rock', pool.noneAdrift);

  // ---- they stay in their pool while they potter about ----
  ok('they stay in their pool as they potter about', await p.evaluate(() => {
    const W = GG.World;
    for (let i = 0; i < 260; i++) GG.Critters.update(0.03, GG.Player);
    return GG.Critters.list.filter(b => b.def.behavior === 'tide')
      .every(b => W.waterKind(b.x, b.y) === W.KIND.TIDEPOOL);
  }));

  // ---- the net still works on them ----
  ok('the net catches a tidepool creature', await p.evaluate(() => {
    const b0 = GG.Critters.list[0];
    if (!b0) return false;
    GG.Player.reset(b0.x, b0.y - 14);
    GG.Player.angle = Math.PI / 2;
    GG.Player.dir = 'down';
    GG.Player.startSwing();
    for (let i = 0; i < 30; i++) {
      GG.Player.swing -= 0.02;
      if (GG.Critters.tryCatch(GG.Player)) return true;
    }
    return false;
  }));

  // ---- she can actually walk to all of it from her own front door ----
  const reach = await p.evaluate(() => {
    const W = GG.World, S = 12;
    const gw = Math.ceil(W.W / S), gh = Math.ceil(W.H / S);
    const open = (gx, gy) => {
      const x = gx * S + S / 2, y = gy * S + S / 2;
      if (x < 24 || y < 40 || x > W.W - 24 || y > W.H - 24) return false;
      return !W.isDeepWater(x, y);
    };
    const seen = new Uint8Array(gw * gh);
    const q = [Math.floor(2560 / S) * gw + Math.floor(W.HOUSE.x / S)];
    seen[q[0]] = 1;
    while (q.length) {
      const i = q.pop(), gx = i % gw, gy = (i / gw) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => {
        const nx = gx + d[0], ny = gy + d[1];
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) return;
        const j = ny * gw + nx;
        if (seen[j] || !open(nx, ny)) return;
        seen[j] = 1; q.push(j);
      });
    }
    const at = (x, y) => !!seen[Math.floor(y / S) * gw + Math.floor(x / S)];
    const spots = {
      'the pond': [2750, 2980], 'the hills': [2020, 1360], 'the woods': [4100, 1660],
      'the orchard': [3960, 2380], 'the stream': [2500, 1840],
      'the riverbank': [3700, 3020], 'the far bank': [3700, 3200],
      'the west beach': [3600, 3460], 'the east beach': [4900, 3310],
      'the tidepools': [5720, 3210]
    };
    const cut = Object.keys(spots).filter(k => !at(spots[k][0], spots[k][1]));
    return cut;
  });
  ok('she can walk from her door to every part of the garden' +
    (reach.length ? ' — cut off: ' + reach.join(', ') : ''), reach.length === 0);

  // ---- the new scenery actually draws ----
  ok('every new prop draws something', await p.evaluate(() => {
    const names = ['willow', 'palmGrass', 'driftwood', 'shellProp', 'pebbles', 'kelp', 'wetrock'];
    const cv = document.createElement('canvas'); cv.width = 140; cv.height = 140;
    const c = cv.getContext('2d');
    return names.every(n => {
      if (!GG.Props[n]) return false;
      c.clearRect(0, 0, 140, 140);
      c.save(); c.translate(70, 110);
      GG.Props[n](c, 0, 0, 26, 1.2, 0.4);
      c.restore();
      const d = c.getImageData(0, 0, 140, 140).data;
      let px = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 12) px++;
      return px > 120;
    });
  }));

  // ---- the map shows the new places ----
  await p.evaluate(() => { const e = document.getElementById('catch-pop'); if (e) e.className = 'hidden'; });
  await p.waitForTimeout(200);
  await p.tap('#btn-menu');
  await p.waitForTimeout(700);
  ok('the map draws', await p.evaluate(() => {
    const cv = document.getElementById('minimap');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let px = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 12) px++;
    return px > cv.width * cv.height * 0.8;
  }));
  await p.screenshot({ path: __dirname + '/shots/map-big.png' });
  await p.evaluate(() => GG.UI.close('screen-menu'));

  console.log(r.join('\n'));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) || errs.length ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
