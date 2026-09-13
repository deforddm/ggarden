const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.argv[2]);
  await p.waitForTimeout(600);
  const el = await p.$('#c');
  if (el) await el.screenshot({ path: process.argv[3] });
  else await p.screenshot({ path: process.argv[3] });
  if (errs.length) console.log('ERRORS:', errs.join('\n'));
  await b.close();
})();
