/* v1.20: the Mesa - Guin asked for it. A flat top on a cliff, one trail up,
   new bugs, two new friends and bitterroot. Pass "shots" as argv[3] to also
   save pictures to tests/shots/. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const shots = process.argv[3] === 'shots';
  const p = await b.newPage(shots ? { viewport: { width: 900, height: 700 }, deviceScaleFactor: 1 }
    : { viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700);
  await p.evaluate(() => document.getElementById('btn-play').click());
  await require('./charskip')(p); await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  await p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
  });

  const d = await p.evaluate(() => {
    const W = GG.World, M = W.MESA, T = W.MESA_TRAIL;
    const step = 6, x0 = M.cx - M.rx * 1.8, x1 = M.cx + M.rx * 1.8, y0 = M.cy - M.ry * 1.8, y1 = M.cy + M.ry * 2.2;
    const nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step);
    function flood(noTrail) {
      const seen = new Uint8Array(nx * ny), q = [];
      const sx = Math.round((M.cx - x0) / step), sy = Math.round((M.cy - y0) / step);
      seen[sy * nx + sx] = 1; q.push(sx, sy);
      let escaped = false, i = 0;
      while (i < q.length) {
        const cx = q[i++], cy = q[i++];
        const wx = x0 + cx * step, wy = y0 + cy * step;
        const v = Math.hypot((wx - M.cx) / M.rx, (wy - M.cy) / M.ry);
        if (v > 1.7) { escaped = true; continue; }
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const ax = cx + dx, ay = cy + dy;
          if (ax < 0 || ay < 0 || ax >= nx || ay >= ny || seen[ay * nx + ax]) return;
          const px = x0 + ax * step, py = y0 + ay * step;
          if (W.blocked(px, py, 10)) return;
          if (noTrail && W.onMesaTrail(px, py)) return;
          seen[ay * nx + ax] = 1; q.push(ax, ay);
        });
      }
      return escaped;
    }
    let trailClear = true;
    for (let s = 0; s < 2; s++) for (let k = 0; k <= 30; k++) {
      const a = T[s], c = T[s + 1], t = k / 30;
      if (W.blocked(a.x + (c.x - a.x) * t, a.y + (c.y - a.y) * t, 10)) trailClear = false;
    }
    let rimBlocked = true;
    for (let u = -0.8; u <= 0.8; u += 0.1) {
      const x = M.cx + u * M.rx;
      const e = M.cy + M.ry * Math.sqrt(1 - u * u);
      if (!W.blocked(x, e + 10, 10) && !W.onMesaTrail(x, e + 10)) rimBlocked = false;
    }
    const picks = W.props.filter(q => q.pick && W.inMesaTop(q.x, q.y)).map(q => q.pick);
    const onTop = W.props.filter(q => W.inMesaTop(q.x, q.y));
    return {
      top: W.biomeRaw(M.cx, M.cy), name: W.placeName(M.cx, M.cy), footName: W.placeName(T[0].x, T[0].y),
      escapes: flood(false), escapesNoTrail: flood(true), trailClear, rimBlocked,
      centreFree: !W.blocked(M.cx, M.cy, 12),
      picks, props: onTop.length, signs: W.props.filter(q => q.type === 'sign' && Math.hypot(q.x - M.cx, q.y - M.cy) < 420).length,
      bugs: GG.BUGS.length, mesaBugs: GG.BUGS.filter(b => b.habitats.indexOf('mesa') >= 0).map(b => b.id),
      friends: GG.ANIMALS ? GG.ANIMALS.length : -1,
      mesaFriends: (GG.ANIMALS || []).filter(a => a.places.indexOf('mesa') >= 0).map(a => a.id),
      eligible: GG.Critters.eligible('mesa', 'day', false).length,
      bitter: !!GG.FRUIT_BY_ID.bitterroot && GG.fruitWhereName(GG.FRUIT_BY_ID.bitterroot),
      habName: GG.HABITAT_NAMES.mesa, facts: (GG.MESA_FACTS || []).length,
      edgeFact: (GG.MESA_FACTS || []).some(f => /trail/.test(f) && /edge/.test(f))
    };
  });
  ok('the top of the Mesa is its own place (' + d.top + ', ' + d.name + ')', d.top === 'mesa' && d.name === 'The Mesa');
  ok('the foot of the trail says The Mesa too (' + d.footName + ')', d.footName === 'The Mesa');
  ok('she can walk the middle of the top', d.centreFree);
  ok('the trail is clear all the way up', d.trailClear);
  ok('the cliff face along the south rim is solid', d.rimBlocked);
  ok('from the top she can walk down to the rest of the world', d.escapes);
  ok('the trail is the only way up and down', !d.escapesNoTrail);
  ok('bitterroot and balsamroot grow on top ' + JSON.stringify(d.picks), d.picks.indexOf('bitterroot') >= 0 && d.picks.indexOf('arrowleaf_balsamroot') >= 0);
  ok('there are things on top (' + d.props + ') and two signs (' + d.signs + ')', d.props >= 30 && d.signs >= 2);
  ok('three new Mesa bugs ' + JSON.stringify(d.mesaBugs) + ', ' + d.bugs + ' bugs in all', d.mesaBugs.length === 3 && d.bugs === 189);
  ok('marmot, canyon wren and the rattlesnake live there ' + JSON.stringify(d.mesaFriends), ['yellow_bellied_marmot', 'canyon_wren', 'western_rattlesnake'].every(id => d.mesaFriends.indexOf(id) >= 0));
  ok('the Mesa borrows bugs from next door too (' + d.eligible + ')', d.eligible > 6);
  ok('bitterroot is in the Garden Book (' + d.bitter + ')', d.bitter === 'the Mesa');
  ok('the Mesa has a name in the Bug Book (' + d.habName + ')', d.habName === 'the Mesa');
  ok('the Mesa sign has facts (' + d.facts + '), one says stay on the trail and back from the edge', d.facts >= 4 && d.edgeFact);

  /* walking in brings the sign's first fact */
  const toast = await p.evaluate(async () => {
    const T = GG.World.MESA_TRAIL;
    GG.Player.x = T[0].x; GG.Player.y = T[0].y + 160;
    await new Promise(r => setTimeout(r, 500));
    GG.Player.x = T[0].x; GG.Player.y = T[0].y;
    await new Promise(r => setTimeout(r, 500));
    const e = document.getElementById('toast');
    return e ? e.textContent : '';
  });
  ok('walking up to the Mesa shows a fact (' + toast.slice(0, 40) + ')', /Mesa/.test(toast));

  if (shots) {
    const fs = require('fs'); fs.mkdirSync(__dirname + '/shots', { recursive: true });
    const spots = await p.evaluate(() => {
      const M = GG.World.MESA, T = GG.World.MESA_TRAIL;
      return [['top', M.cx, M.cy], ['face', M.cx - 60, M.cy + M.ry + 110], ['trail', T[1].x - 20, T[1].y], ['foot', T[0].x, T[0].y + 30], ['far', M.cx, M.cy + 60]];
    });
    for (const [n, x, y] of spots) {
      await p.evaluate(([x, y]) => { GG.Player.x = x; GG.Player.y = y; const t = document.getElementById('toast'); if (t) t.className = 'hidden'; }, [x, y]);
      await p.waitForTimeout(1600);
      await p.screenshot({ path: __dirname + '/shots/mesa-' + n + '.png' });
    }
  }

  r.forEach(l => console.log(l));
  if (errs.length) console.log(errs.join('\n'));
  console.log(r.every(l => l.startsWith('PASS')) && !errs.length ? 'ALL PASS' : 'SOME FAILED');
  await b.close();
})();
