const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);

  // back view, big
  await p.evaluate(() => {
    GG.Critters.clear();
    const cv = document.createElement('canvas');
    cv.id = 'head'; cv.width = 560; cv.height = 300;
    cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:#8ecf63';
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    ['down','up','left','right'].forEach((d, i) => {
      const old = GG.Player.dir; GG.Player.dir = d; GG.Player.speed = 0;
      c.save(); c.translate(0, 0); c.scale(2.6, 2.6);
      GG.Player.draw(c, 28 + i * 52, 52, 3.2);
      c.restore();
      GG.Player.dir = old;
    });
    c.fillStyle = '#1d3a12'; c.font = 'bold 15px sans-serif'; c.textAlign='center';
    ['front','back','left','right'].forEach((n,i)=>c.fillText(n, 73 + i*135, 200));
  });
  await p.waitForTimeout(300);
  await (await p.$('#head')).screenshot({ path: __dirname + '/shots/head.png' });
  await p.evaluate(() => document.getElementById('head').remove());

  // indoors, by the bookshelf
  await p.evaluate(() => { GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36); });
  await p.waitForTimeout(200);
  await p.keyboard.press('Space');
  await p.waitForTimeout(600);
  await p.evaluate(() => { GG.Player.reset(200, 300); GG.Player.dir='up'; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: __dirname + '/shots/house-book.png' });
  await p.evaluate(() => { GG.Player.reset(420, 300); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: __dirname + '/shots/house-table.png' });
  await b.close();
})();
