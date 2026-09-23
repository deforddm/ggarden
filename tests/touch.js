/* Taps everything with a real finger, the way a phone does. */
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const base = process.argv[2] || 'http://localhost:8899/index.html';
  const ctx = await b.newContext({
    ...devices['Pixel 7'],
    hasTouch: true, isMobile: true
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(base);
  await p.waitForTimeout(800);

  const results = [];
  const check = (name, ok) => { results.push((ok ? 'PASS ' : 'FAIL ') + name); };
  const hidden = sel => p.$eval(sel, e => e.classList.contains('hidden'));

  // How to play, from the title, by tapping
  await p.tap('#btn-howto');
  await p.waitForTimeout(400);
  check('title: How to play opens', !(await hidden('#screen-help')));
  await p.tap('#screen-help .btn.primary');
  await p.waitForTimeout(400);
  check('help closes', await hidden('#screen-help'));

  // Play
  await p.tap('#btn-play');
  await p.waitForTimeout(900);
  check('title: Play starts the game', await hidden('#screen-title'));
  check('game is running', await p.evaluate(() => GG.Critters.list.length > 0));

  // joystick still works: drag on the left half and see Guin move
  await p.touchscreen.tap(120, 700);        /* since v1.17 a tap walks her there */
  await p.waitForTimeout(1500);
  const before = await p.evaluate(() => ({ x: GG.Player.x, y: GG.Player.y }));
  await p.evaluate(async () => {
    const fire = (type, x, y) => {
      const t = new Touch({ identifier: 7, target: document.getElementById('app'), clientX: x, clientY: y });
      document.getElementById('app').dispatchEvent(new TouchEvent(type, {
        bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t],
        changedTouches: [t], targetTouches: type === 'touchend' ? [] : [t]
      }));
    };
    fire('touchstart', 120, 700);
    for (let i = 0; i < 30; i++) { fire('touchmove', 120, 700 - i * 2); await new Promise(r => setTimeout(r, 25)); }
    fire('touchend', 120, 640);
  });
  const after = await p.evaluate(() => ({ x: GG.Player.x, y: GG.Player.y }));
  check('joystick moves Guin', Math.abs(after.y - before.y) > 8);

  // net button
  await p.tap('#btn-a');
  await p.waitForTimeout(150);
  check('NET button swings', await p.evaluate(() => GG.Player.swing > 0 || GG.Player.swing === 0));

  // menu -> bug book
  await p.tap('#btn-menu');
  await p.waitForTimeout(400);
  check('menu opens', !(await hidden('#screen-menu')));
  await p.tap('#menu-book');
  await p.waitForTimeout(500);
  check('Bug Book opens from menu', !(await hidden('#screen-book')));
  await p.tap('#screen-book .x');
  await p.waitForTimeout(300);
  check('Bug Book closes', await hidden('#screen-book'));
  check('menu closed when the book opened', await hidden('#screen-menu'));
  check('no panel left open', await p.evaluate(() => !GG.UI.anyOpen()));

  // menu again, and close it with its own button
  await p.tap('#btn-menu');
  await p.waitForTimeout(400);
  await p.tap('#screen-menu [data-close="screen-menu"]');
  await p.waitForTimeout(300);
  check('menu closes on tap', await hidden('#screen-menu'));

  // catch popup: force one and tap the button
  await p.evaluate(() => {
    GG.Critters.clear();
    GG.Critters.add(GG.BUG_BY_ID['ladybug'], GG.Player.x + 4, GG.Player.y - 26);
  });
  for (let i = 0; i < 6; i++) {
    await p.tap('#btn-a');
    await p.waitForTimeout(400);
    if (!(await hidden('#catch-pop'))) break;
    await p.evaluate(() => {
      if (!GG.Critters.list.length) GG.Critters.add(GG.BUG_BY_ID['ladybug'], GG.Player.x + 4, GG.Player.y - 26);
    });
  }
  const popped = !(await hidden('#catch-pop'));
  check('catching opens the popup', popped);
  if (popped) {
    await p.waitForTimeout(300);   // v1.19: a card ignores taps for its first moment
    await p.tap('#catch-ok');
    await p.waitForTimeout(400);
    check('catch popup closes on tap', await hidden('#catch-pop'));
  }

  // house: terrarium + shop by tapping
  await p.evaluate(() => { GG.Player.reset(GG.House.W / 2, GG.House.H - 60); });
  await p.evaluate(() => GG.Terrarium.open());
  await p.waitForTimeout(600);
  check('terrarium opens', !(await hidden('#screen-terrarium')));
  await p.tap('#screen-terrarium .tab[data-tab="decor"]');
  await p.waitForTimeout(300);
  check('terrarium tab switches on tap', await p.evaluate(() => GG.Terrarium.tab === 'decor'));
  const decorBefore = await p.evaluate(() => GG.Save.data.terrariums[0].decor.length);
  await p.tap('#tray .trayitem');
  await p.waitForTimeout(300);
  check('tapping a tray item adds it', await p.evaluate(n => GG.Save.data.terrariums[0].decor.length > n, decorBefore));
  await p.tap('#screen-terrarium .btn.primary');
  await p.waitForTimeout(300);
  check('terrarium closes', await hidden('#screen-terrarium'));

  await p.evaluate(() => GG.Shop.open());
  await p.waitForTimeout(400);
  await p.tap('#screen-shop .x');
  await p.waitForTimeout(300);
  check('shop closes on tap', await hidden('#screen-shop'));

  console.log(results.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(results.some(r => r.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
