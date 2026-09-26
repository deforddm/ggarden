/* v1.20: a tap far away through thick woods should get her there.
   Simulates 60 taps in the Whispering Woods and 60 across the whole map,
   frame by frame with a fake clock, first the old way (no route) and then
   with the new route planner, and counts how many arrive. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700);
  await p.evaluate(() => document.getElementById('btn-play').click());
  await require('./charskip')(p); await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);

  const res = await p.evaluate(() => {
    const W = GG.World, In = GG.Input, P = GG.Player;
    const B = In.blockedFn || ((x, y, rad) => W.blocked(x, y, rad));
    const rng = GG.mulberry32(777);
    function pairs(biome, n) {
      const out = [];
      let guard = 0;
      while (out.length < n && guard++ < 200000) {
        const x = 200 + rng() * (W.W - 400), y = 200 + rng() * (W.H - 400);
        if (biome && W.biomeAt(x, y) !== biome) continue;
        if (B(x, y, 12) || W.isWater(x, y)) continue;
        const a = rng() * Math.PI * 2, L = 260 + rng() * 380;
        const tx = x + Math.cos(a) * L, ty = y + Math.sin(a) * L;
        if (tx < 100 || ty < 100 || tx > W.W - 100 || ty > W.H - 100) continue;
        if (biome && W.biomeAt(tx, ty) !== biome) continue;
        if (B(tx, ty, 12) || W.isWater(tx, ty)) continue;
        out.push([x, y, tx, ty]);
      }
      return out;
    }
    /* is the spot reachable at all? a plain flood fill, so an island across
       the river is not counted against her */
    function reachable(x, y, tx, ty) {
      const C = 10, pad = 300;
      const minX = Math.min(x, tx) - pad, minY = Math.min(y, ty) - pad;
      const nx = Math.ceil((Math.max(x, tx) + pad - minX) / C), ny = Math.ceil((Math.max(y, ty) + pad - minY) / C);
      const seen = new Uint8Array(nx * ny), q = [];
      const s = Math.round((y - minY) / C) * nx + Math.round((x - minX) / C);
      const gx = Math.round((tx - minX) / C), gy = Math.round((ty - minY) / C);
      seen[s] = 1; q.push(s);
      for (let i = 0; i < q.length; i++) {
        const c = q[i], cx = c % nx, cy = (c / nx) | 0;
        if (Math.abs(cx - gx) <= 1 && Math.abs(cy - gy) <= 1) return true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ax = cx + dx, ay = cy + dy;
          if (ax < 0 || ay < 0 || ax >= nx || ay >= ny) continue;
          const ai = ay * nx + ax;
          if (seen[ai] || B(minX + ax * C, minY + ay * C, 11)) continue;
          seen[ai] = 1; q.push(ai);
        }
      }
      return false;
    }
    const realNow = Date.now;
    function run(list, usePlan) {
      const savedPlan = In.plan;
      if (!usePlan) In.plan = () => null;
      let arrived = 0, tried = 0, planMs = 0, frames = 0;
      list.forEach(([x, y, tx, ty]) => {
        if (!reachable(x, y, tx, ty)) return;
        tried++;
        P.x = x; P.y = y; P.vx = 0; P.vy = 0; P.stun = 0; P.swing = 0;
        let clock = realNow.call(Date);
        Date.now = () => clock;
        In.keys = {}; In.stick.active = false;
        In.walkTo(tx, ty);
        const t0 = performance.now();
        In.beginFrame();
        planMs = Math.max(planMs, performance.now() - t0);
        for (let f = 0; f < 60 * 14 && In.moveTarget; f++) {
          P.update(1 / 60, B);
          clock += 1000 / 60; frames++;
          In.beginFrame();
        }
        Date.now = realNow;
        if (Math.hypot(P.x - tx, P.y - ty) < 24) arrived++;
        In.moveTarget = null;
      });
      In.plan = savedPlan;
      return { arrived, tried, planMs: Math.round(planMs) };
    }
    GG.Critters.spawnNear = () => false;
    const woods = pairs('forest', 60), all = pairs(null, 60);
    /* a tap she can never reach (out on the water, inside a rock): the
       planner gives up fast rather than freezing the game */
    let worstNo = 0, tries = 0;
    for (let i = 0; i < 400 && tries < 25; i++) {
      const x = 200 + rng() * (W.W - 400), y = 200 + rng() * (W.H - 400);
      if (B(x, y, 12)) continue;
      const tx = x + (rng() - 0.5) * 900, ty = y + (rng() - 0.5) * 900;
      if (!W.isWater(tx, ty)) continue;
      tries++;
      const t0 = performance.now();
      In.plan({ x: tx, y: ty }, { x, y }, B);
      worstNo = Math.max(worstNo, performance.now() - t0);
    }
    const out = { unreach: { tries, worst: Math.round(worstNo) }, woodsOld: run(woods, false), woodsNew: run(woods, true), allOld: run(all, false), allNew: run(all, true) };
    return out;
  });
  const pc = o => Math.round(100 * o.arrived / Math.max(1, o.tried));
  console.log(JSON.stringify(res));
  ok('in the woods: old way ' + pc(res.woodsOld) + '%, with a route ' + pc(res.woodsNew) + '% arrive', pc(res.woodsNew) >= 95 && res.woodsNew.tried >= 40);
  ok('all over the map: old way ' + pc(res.allOld) + '%, with a route ' + pc(res.allNew) + '% arrive', pc(res.allNew) >= 95);
  ok('a spot she can never reach is given up on quickly (' + res.unreach.tries + ' tries, worst ' + res.unreach.worst + ' ms)', res.unreach.tries >= 10 && res.unreach.worst < 60);
  ok('planning a route never takes long (worst ' + Math.max(res.woodsNew.planMs, res.allNew.planMs) + ' ms)', Math.max(res.woodsNew.planMs, res.allNew.planMs) < 60);

  r.forEach(l => console.log(l));
  if (errs.length) console.log(errs.join('\n'));
  console.log(r.every(l => l.startsWith('PASS')) && !errs.length ? 'ALL PASS' : 'SOME FAILED');
  await b.close();
})();
