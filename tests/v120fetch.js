/* v1.20: fetch at Dog's Paradise. THROW appears in the park with a dog
   about, the dog runs for the ball and brings it back, and she gets two
   sparkles. Pass "shots" as argv[3] for pictures of the ball in flight. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const shots = process.argv[3] === 'shots';
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700);
  await p.tap('#btn-play'); await require('./charskip')(p); await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const hidden = id => p.evaluate(i => document.getElementById(i).classList.contains('hidden'), id);
  const label = id => p.evaluate(i => document.getElementById(i).textContent, id);

  /* out in the meadow: no THROW */
  await p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    GG.Critters.spawnNear = () => false; GG.Critters.clear();
    GG.Friends.spawnNear = () => false; GG.Friends.clear();
  });
  await p.waitForTimeout(300);
  ok('no THROW button outside the park', await hidden('btn-fish'));

  /* in the park but no dog: no THROW */
  await p.evaluate(() => { const D = GG.World.DOGPARK; GG.Player.x = D.cx + 60; GG.Player.y = D.cy + 60; GG.Player.angle = Math.PI; });
  await p.waitForTimeout(400);
  ok('no THROW in the park with no dog about', await hidden('btn-fish'));

  /* a labrador turns up */
  const before = await p.evaluate(() => {
    const D = GG.World.DOGPARK, P = GG.Player;
    const dog = GG.Friends.add(GG.ANIMAL_BY_ID.labrador, P.x + 40, P.y + 20);
    dog.park = true;
    window.__dog = dog;
    return GG.Save.data.sparkles;
  });
  await p.waitForTimeout(400);
  const lab = await label('btn-fish');
  ok('with a dog nearby the round button says THROW (' + lab + ')', !(await hidden('btn-fish')) && /THROW/.test(lab));

  await p.tap('#btn-fish');
  await p.waitForTimeout(250);
  const fly = await p.evaluate(() => ({ state: GG.Fetch.state, ctl: !!window.__dog.fetchCtl, z: GG.Fetch.ball && GG.Fetch.ball.z, dbg: GG.Fetch.ball && [Math.round(GG.Fetch.ball.tx - GG.Player.x), Math.round(GG.Fetch.ball.ty - GG.Player.y), Math.round(GG.Player.x), Math.round(GG.Player.y), +(GG.Player.angle||0).toFixed(2), Math.round(window.__dog.x - GG.Player.x), Math.round(window.__dog.y - GG.Player.y)] }));
  ok('tapping THROW sends the ball flying (' + fly.state + ', height ' + Math.round(fly.z || 0) + ')', fly.state === 'fly' && fly.ctl && fly.z > 10);
  ok('the button hides while the ball is out', await hidden('btn-fish'));
  if (shots) { await p.waitForTimeout(150); await p.screenshot({ path: __dirname + '/shots/fetch-fly.png' }); }

  /* watch it: chase, carry, drop */
  const seen = await p.evaluate(async () => {
    const st = new Set(), far = { d: 0 };
    const P = GG.Player;
    for (let i = 0; i < 120 && GG.Fetch.state !== 'idle'; i++) {
      st.add(GG.Fetch.state);
      const d = Math.hypot(window.__dog.x - P.x, window.__dog.y - P.y);
      if (d > far.d) far.d = d;
      await new Promise(r => setTimeout(r, 50));
    }
    return { states: [...st], far: Math.round(far.d), end: GG.Fetch.state, back: Math.round(Math.hypot(window.__dog.x - P.x, window.__dog.y - P.y)) };
  });
  ok('the dog runs out for it, carries it and drops it ' + JSON.stringify(seen.states), ['fly', 'roll', 'carry', 'drop'].every(s => seen.states.indexOf(s) >= 0) || (seen.states.indexOf('carry') >= 0 && seen.states.indexOf('drop') >= 0));
  ok('it went a good way off (' + seen.far + ' px) and came back to her feet (' + seen.back + ' px)', seen.far > 90 && seen.back < 50 && seen.end === 'idle');
  const after = await p.evaluate(() => ({ s: GG.Save.data.sparkles, n: GG.Save.data.fetches, ctl: !!window.__dog.fetchCtl, toast: document.getElementById('toast').textContent }));
  ok('two sparkles for a fetch (' + before + ' -> ' + after.s + ')', after.s === before + 2 && after.n === 1);
  ok('the first fetch tells her something true (' + after.toast.slice(0, 50) + ')', /Fetch!/.test(after.toast));
  ok('the dog is free again afterwards', !after.ctl);
  await p.waitForTimeout(300);
  ok('and THROW is back for another go', !(await hidden('btn-fish')));

  /* a dog caught on the corner of the hydrant still gets out and fetches */
  const corner = await p.evaluate(async () => {
    const P = GG.Player, d = window.__dog;
    P.x = 3660; P.y = 2060; P.angle = Math.PI;
    d.x = 3706; d.y = 2070;
    GG.Fetch.throwBall(P);
    let far = 0;
    for (let i = 0; i < 120 && GG.Fetch.state !== 'idle'; i++) { await new Promise(r => setTimeout(r, 50)); far = Math.max(far, Math.hypot(d.x - P.x, d.y - P.y)); }
    return { far: Math.round(far), state: GG.Fetch.state };
  });
  ok('a dog caught on the hydrant still runs for the ball (' + corner.far + ' px)', corner.far > 120 && corner.state === 'idle');

  /* facing the fence: the ball still lands inside the park */
  const fence = await p.evaluate(() => {
    const D = GG.World.DOGPARK, P = GG.Player;
    P.x = D.x0 + 90; P.y = D.cy; P.angle = Math.PI;   // facing west, at the west fence
    window.__dog.x = P.x + 30; window.__dog.y = P.y;
    GG.Fetch.throwBall(P);
    const b = GG.Fetch.ball;
    const inside = GG.World.biomeRaw(b.tx, b.ty) === 'dogpark';
    return { inside, tx: Math.round(b.tx), ty: Math.round(b.ty) };
  });
  ok('facing the fence, the ball still lands in the park (' + fence.tx + ',' + fence.ty + ')', fence.inside);
  await p.waitForTimeout(4500);
  const fin = await p.evaluate(() => GG.Fetch.state);
  ok('and that fetch finishes too (' + fin + ')', fin === 'idle');

  /* the friend button never offers the dog while it is fetching */
  const cand = await p.evaluate(() => {
    const P = GG.Player;
    window.__dog.x = P.x + 30; window.__dog.y = P.y;
    GG.Fetch.throwBall(P);
    const c = GG.Friends.candidate(P);
    GG.Fetch.release();
    return c === window.__dog;
  });
  ok('no friend button for a dog in the middle of a fetch', !cand);

  r.forEach(l => console.log(l));
  if (errs.length) console.log(errs.join('\n'));
  console.log(r.every(l => l.startsWith('PASS')) && !errs.length ? 'ALL PASS' : 'SOME FAILED');
  await b.close();
})();
