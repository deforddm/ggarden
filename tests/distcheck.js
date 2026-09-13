const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  /* The service worker must carry a NEW cache name every release, or the
     browser sees the same bytes, never installs it, and the "Update ready"
     bar never appears on her phone. This is the check for that. */
  const root = path.join(__dirname, '..');
  const ver = fs.readFileSync(path.join(root, 'src/data/changelog.js'), 'utf8')
    .match(/GG\.VERSION\s*=\s*'([^']+)'/)[1];
  const distSw = fs.readFileSync(path.join(root, 'dist/sw.js'), 'utf8');
  const srcSw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const want = "const CACHE = 'guins-garden-v" + ver + "';";
  console.log(distSw.indexOf(want) >= 0
    ? 'PASS dist/sw.js cache name matches version ' + ver
    : 'FAIL dist/sw.js cache name does NOT match version ' + ver + ' (phones would not see the update)');
  console.log(srcSw.indexOf(want) >= 0
    ? 'PASS sw.js cache name matches too'
    : 'FAIL sw.js cache name does not match');
  console.log(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8').indexOf("GG.VERSION = '" + ver + "'") >= 0
    ? 'PASS the bundle carries version ' + ver
    : 'FAIL the bundle is missing the version');

  const b = await chromium.launch();
  for (const [url, tag] of [['http://localhost:8899/dist/index.html','dist'],
                            ['http://localhost:8899/tests/artifactwrap.html','artifact']]) {
    const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
    const errs = [];
    p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
    await p.goto(url);
    await p.waitForTimeout(700);
    await p.click('#btn-play');
    await p.waitForTimeout(1000);
    await p.keyboard.down('ArrowUp'); await p.waitForTimeout(700); await p.keyboard.up('ArrowUp');
    for (let i = 0; i < 10; i++) { await p.keyboard.press('Space'); await p.waitForTimeout(220); }
    const ok = await p.evaluate(() => typeof GG !== 'undefined' && GG.BUGS.length);
    await p.screenshot({ path: __dirname + '/shots/' + tag + '-check.png' });
    console.log(tag, 'bugs:', ok, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'clean');
    await p.close();
  }
  await b.close();
})();
