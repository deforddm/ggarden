const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);
  await p.evaluate(() => {
    GG.Critters.clear();
    GG.Player.reset(1520, 1560);
    ['honeybee','bumblebee','honeybee'].forEach((id,i) => {
      GG.Critters.add(GG.BUG_BY_ID[id], 1520 + (i-1)*56, 1560 - 130 + i*10);
      GG.Critters.list[i].angry = 7;
    });
  });
  await p.waitForTimeout(120);
  await p.screenshot({ path: __dirname + '/shots/bee-angry.png' });
  await p.evaluate(() => {
    GG.Player.sting();
    GG.Critters.clear();
  });
  await p.waitForTimeout(250);
  await p.screenshot({ path: __dirname + '/shots/bee-stung.png' });
  await b.close();
})();
