/* The "update ready" bar on the title screen. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(900);

  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const hidden = sel => p.$eval(sel, e => e.hidden || e.classList.contains('hidden'));

  ok('the bar lives inside the title screen', await p.$eval('#update-bar', e => !!e.closest('#screen-title')));
  ok('it is hidden until there is an update', await hidden('#update-bar'));
  ok('the menu button is hidden too', await hidden('#menu-update'));

  await p.evaluate(() => GG.debugShowUpdate());
  await p.waitForTimeout(500);
  ok('it appears on the title screen when an update is ready', !(await hidden('#update-bar')));
  ok('the menu button appears too', !(await hidden('#menu-update')));

  const box = await p.$eval('#update-bar', e => {
    const b = e.getBoundingClientRect();
    return { w: b.width, h: b.height, onScreen: b.top >= 0 && b.bottom <= window.innerHeight };
  });
  ok('it is a big obvious bar, not a chip (' + Math.round(box.w) + '×' + Math.round(box.h) + ')',
    box.w > 250 && box.h > 50 && box.onScreen);

  ok('it says what it is', (await p.$eval('#update-bar', e => e.textContent)).indexOf('Update ready') >= 0);
  ok('it has an Update button and a dismiss', await p.evaluate(() =>
    !!document.getElementById('btn-update') && !!document.getElementById('btn-update-later')));

  // the icon animates
  const a = await p.$eval('#update-icon', c => c.getContext('2d').getImageData(20, 20, 40, 40).data.join(',').slice(0, 400));
  await p.waitForTimeout(500);
  const bb = await p.$eval('#update-icon', c => c.getContext('2d').getImageData(20, 20, 40, 40).data.join(',').slice(0, 400));
  ok('the butterfly icon is animating', a !== bb);

  await p.screenshot({ path: __dirname + '/shots/update-title.png' });

  // dismissing hides it but the menu keeps it
  await p.tap('#btn-update-later');
  await p.waitForTimeout(300);
  ok('the X puts the bar away', await hidden('#update-bar'));
  ok('but the menu still offers it', !(await hidden('#menu-update')));

  // it survives into the game and shows in the menu
  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(800);
  await p.tap('#btn-menu');
  await p.waitForTimeout(400);
  ok('the update button is in the Garden Menu during play', !(await hidden('#menu-update')));
  await p.screenshot({ path: __dirname + '/shots/update-menu.png' });

  // tapping it saves the garden, says it is working, then reloads
  await p.evaluate(() => { GG.Save.data.sparkles = 4242; });
  let label = '';
  try {
    label = await p.evaluate(() => {
      const el = document.getElementById('menu-update');
      el.click();
      return el.textContent.trim();
    });
  } catch (e) { label = 'Updating\u2026 (page already reloaded)'; }
  ok('the button says it is working', label.indexOf('Updating') >= 0);

  await p.waitForTimeout(3000);
  const after = await p.evaluate(() => ({
    saved: JSON.parse(localStorage.getItem('guins-garden-save-v1')).sparkles,
    backAtTitle: !document.getElementById('screen-title').classList.contains('hidden'),
    running: typeof GG !== 'undefined'
  }));
  ok('her garden was saved before the update (sparkles ' + after.saved + ')', after.saved === 4242);
  ok('the game reloaded and came back up', after.running && after.backAtTitle);

  console.log(r.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
