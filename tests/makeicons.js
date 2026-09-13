const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.goto('file://' + path.join(__dirname, 'icon.html'));
  await p.waitForTimeout(400);
  const el = await p.$('#c');
  for (const [w, name] of [[512, 'icon-512.png'], [192, 'icon-192.png']]) {
    await p.setViewportSize({ width: w, height: w });
    await p.evaluate((w) => window.render(w, false), w);
    await p.waitForTimeout(150);
    await (await p.$('#c')).screenshot({ path: path.join(__dirname, '..', 'icons', name) });
  }
  await p.setViewportSize({ width: 512, height: 512 });
  await p.evaluate(() => window.render(512, true));
  await p.waitForTimeout(150);
  await (await p.$('#c')).screenshot({ path: path.join(__dirname, '..', 'icons', 'icon-512-maskable.png') });
  await b.close();
})();
