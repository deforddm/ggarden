const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);
  const spots = [
    ['stream', 1100, 1300], ['river', 2200, 2120], ['inlet', 3200, 2600],
    ['beach', 2700, 2560], ['tidepools', 4050, 2280], ['sea-edge', 3900, 2500],
    ['pond', 900, 1980], ['home', 1520, 1560]
  ];
  for (const [n, x, y] of spots) {
    await p.evaluate(([x, y]) => { GG.Player.reset(x, y); GG.Critters.clear(); }, [x, y]);
    await p.waitForTimeout(1400);
    await p.evaluate(() => { const e = document.getElementById('catch-pop'); if (e) e.className = 'hidden'; });
    await p.screenshot({ path: __dirname + '/shots/w-' + n + '.png' });
  }
  await b.close();
})();
