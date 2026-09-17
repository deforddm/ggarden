const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);
  await p.evaluate(() => {
    const W = GG.World;
    let x = W.pond.cx, y = W.pond.cy;
    while (W.isWater(x, y)) x += 4;
    GG.Player.reset(x + 14, y);
    GG.Player.angle = Math.PI; GG.Player.dir = 'left';
    GG.Critters.clear();
  });
  await p.waitForTimeout(1400);
  await p.screenshot({ path: __dirname + '/shots/pond-shadows.png' });
  await p.evaluate(() => { GG.Fishing.cast(GG.Player); });
  await p.waitForTimeout(900);
  await p.screenshot({ path: __dirname + '/shots/pond-cast.png' });
  await p.evaluate(() => {
    // park a fish on the bait so we can photograph the bite
    const t = GG.Fishing.bob;
    GG.Fishing.swimmers.length = 0;
    GG.Fishing.swimmers.push({ def: GG.FISH_BY_ID.bass, x: t.x + 20, y: t.y, ang: 0, sp: 30,
      timer: 2, chase: 1, t: 0, left: true, age: 0 });
    GG.Fishing.hooked = GG.Fishing.swimmers[0];
    GG.Fishing.state = 'bite'; GG.Fishing.timer = 6;
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: __dirname + '/shots/pond-bite.png' });
  await b.close();
})();
