/* Checks the three fixes: moving terrarium bugs, indoor scale, and the back of Guin's head. */
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

  // --- 2. same scale indoors and out ---
  const outZoom = await p.evaluate(() => GG.view.zoom);
  await p.evaluate(() => {
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36);
  });
  await p.waitForTimeout(300);
  await p.keyboard.press('Space');
  await p.waitForTimeout(700);
  const inside = await p.evaluate(() => ({
    zoom: GG.view.zoom,
    room: [GG.House.W, GG.House.H],
    px: GG.Player.x, py: GG.Player.y
  }));
  ok('Guin is the same size indoors as outdoors (' + inside.zoom.toFixed(2) + ' vs ' + outZoom.toFixed(2) + ')',
    Math.abs(inside.zoom - outZoom) < 0.001);
  /* v1.16: the cottage is built to Guin's own scale now - a real room of
     about 12 m by 7 m at 45 px to the metre, not a giant's hall */
  const scale = await p.evaluate(() => {
    const H = GG.House, bed = H.spots.find(s => s.id === 'bed'), door = H.spots.find(s => s.id === 'door');
    return { w: H.W, h: H.H, bedLong: bed.h - 8, doorW: door.w - 8 };
  });
  ok('the room is a room, not a hall (' + scale.w + ' x ' + scale.h + ')', scale.w <= 640 && scale.h <= 480 && scale.w >= 400);
  ok('her bed is about one and a half Guins long (' + scale.bedLong + 'px)', scale.bedLong > 70 && scale.bedLong < 120);
  ok('the doorway is about her own width and a bit (' + scale.doorW + 'px)', scale.doorW > 34 && scale.doorW < 60);
  await p.screenshot({ path: __dirname + '/shots/fix-house.png' });

  // can she reach every piece of furniture?
  const reach = await p.evaluate(() => {
    const out = {};
    for (const s of GG.House.spots) {
      // walk a probe outwards from the spot to find a standable tile near it
      let found = false;
      for (let rad = 20; rad <= 140 && !found; rad += 5) {
        for (let a = 0; a < 6.28 && !found; a += 0.12) {
          const x = s.x + Math.cos(a) * rad, y = s.y + Math.sin(a) * rad;
          if (!GG.House.blocked(x, y, 11) && GG.House.nearest(x, y) && GG.House.nearest(x, y).id === s.id) found = true;
        }
      }
      out[s.id] = found;
    }
    return out;
  });
  ok('every piece of furniture can be walked up to: ' + JSON.stringify(reach),
    Object.values(reach).every(Boolean));

  // --- 3. the back of her head ---
  const head = await p.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.width = 120; cv.height = 120;
    const c = cv.getContext('2d');
    function sample(dir) {
      c.clearRect(0, 0, 120, 120);
      const old = GG.Player.dir, ox = GG.Player.x, oy = GG.Player.y, os = GG.Player.speed;
      GG.Player.dir = dir; GG.Player.speed = 0;
      c.save(); c.translate(0, 40); GG.Player.draw(c, 60, 60, 1.0); c.restore();
      GG.Player.dir = old; GG.Player.x = ox; GG.Player.y = oy; GG.Player.speed = os;
      // count skin-coloured pixels in the head area
      const d = c.getImageData(46, 56, 28, 26).data;
      let skin = 0, hair = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 30) continue;
        const R = d[i], G = d[i + 1], B = d[i + 2];
        if (R > 210 && G > 190 && B > 150) skin++;
        if (R < 90 && G < 70 && B < 60) hair++;
      }
      return { skin, hair };
    }
    return { up: sample('up'), down: sample('down') };
  });
  ok('the back of her head is hair, not a bald patch (skin px up=' + head.up.skin + ', down=' + head.down.skin + ')',
    head.up.skin < head.down.skin * 0.15 && head.up.hair > 100);

  // --- 1. bugs move inside a terrarium ---
  await p.evaluate(() => {
    ['monarch', 'firefly', 'snail', 'grasshopper', 'dragonfly'].forEach(id => GG.Save.addCatch(id));
    const t = GG.Save.data.terrariums[0];
    t.bugs = [
      { id: 'monarch', x: 200, y: 150, s: 1, seed: 0.2 },
      { id: 'firefly', x: 430, y: 190, s: 1, seed: 0.5 },
      { id: 'snail', x: 300, y: 350, s: 1, seed: 0.7 },
      { id: 'grasshopper', x: 480, y: 345, s: 1, seed: 0.4 },
      { id: 'dragonfly', x: 120, y: 120, s: 1, seed: 0.9 }
    ];
    t.decor = [
      { id: 'log', x: 150, y: 345, s: 1, seed: 0.1 },
      { id: 'fern', x: 520, y: 356, s: 1, seed: 0.3 },
      { id: 'mushroom', x: 360, y: 335, s: 1, seed: 0.9 }
    ];
    GG.Save.save();
    GG.Terrarium.open();
  });
  await p.waitForTimeout(400);
  const start = await p.evaluate(() =>
    GG.Save.data.terrariums[0].bugs.map(b => { const m = GG.Terrarium.motionFor(b); return [m.lx, m.ly]; }));
  await p.waitForTimeout(2500);
  const later = await p.evaluate(() =>
    GG.Save.data.terrariums[0].bugs.map(b => { const m = GG.Terrarium.motionFor(b); return [m.lx, m.ly]; }));
  const moved = start.map((s, i) => Math.hypot(later[i][0] - s[0], later[i][1] - s[1]));
  ok('every bug in the terrarium moves (' + moved.map(x => Math.round(x)).join(', ') + 'px in 2.5s)',
    moved.every(d => d > 4));

  const inside2 = await p.evaluate(() =>
    GG.Save.data.terrariums[0].bugs.every(b => {
      const m = GG.Terrarium.motionFor(b);
      return m.lx > 30 && m.lx < 610 && m.ly > 40 && m.ly < 385;
    }));
  ok('none of them escape the glass', inside2);

  const anchored = await p.evaluate(() =>
    GG.Save.data.terrariums[0].bugs.every(b => {
      const m = GG.Terrarium.motionFor(b);
      return Math.hypot(m.lx - b.x, m.ly - b.y) < 130;
    }));
  ok('they stay near where she put them', anchored);

  const savedStill = await p.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('guins-garden-save-v1'));
    return raw.terrariums[0].bugs.every(b => Object.keys(b).sort().join(',') === 'id,s,seed,x,y');
  });
  ok('the wandering is not written into the save file', savedStill);

  await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/shots/fix-terrarium.png' });

  console.log(r.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
