/* v1.17: walking from anywhere on the screen, and tap-to-walk. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700); await p.tap('#btn-play'); await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const clear = () => p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    GG.Friends.spawnNear = () => false; GG.Critters.spawnNear = () => false;
    GG.Friends.clear(); GG.Critters.clear();
    const W = GG.World; GG.Player.reset(W.HOUSE.x + 40, W.HOUSE.y + 260);
  });
  await clear();
  await p.waitForTimeout(400);
  const pos = () => p.evaluate(() => ({ x: GG.Player.x, y: GG.Player.y }));
  const drag = (id, x0, y0, dx, dy) => p.evaluate(async ({ id, x0, y0, dx, dy }) => {
    const app = document.getElementById('app');
    const fire = (type, x, y) => {
      const t = new Touch({ identifier: id, target: app, clientX: x, clientY: y });
      app.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : [t], changedTouches: [t], targetTouches: type === 'touchend' ? [] : [t] }));
    };
    fire('touchstart', x0, y0);
    for (let i = 1; i <= 30; i++) { fire('touchmove', x0 + dx * i / 30, y0 + dy * i / 30); await new Promise(r => setTimeout(r, 25)); }
    await new Promise(r => setTimeout(r, 300));
    fire('touchend', x0 + dx, y0 + dy);
  }, { id, x0, y0, dx, dy });

  /* ---------- the joystick works on the RIGHT side now too ---------- */
  let a = await pos();
  await drag(3, 330, 520, 0, 60);                      // right-hand side, drag down
  let b1 = await pos();
  ok('dragging on the right-hand side walks her (' + Math.round(b1.y - a.y) + 'px down)', b1.y - a.y > 20);
  a = await pos();
  await drag(4, 70, 520, 60, 0);                       // left side still works
  b1 = await pos();
  ok('and on the left, as before (' + Math.round(b1.x - a.x) + 'px right)', b1.x - a.x > 20);
  ok('a drag leaves no walk-to marker behind', await p.evaluate(() => !GG.Input.moveTarget));

  /* ---------- tap to walk ---------- */
  await p.waitForTimeout(600);                          // let her (and the camera) settle
  const tap1 = await p.evaluate(() => {
    const P = GG.Player;
    // a point on screen 70 world px right and 90 down of her
    const r = document.getElementById('game').getBoundingClientRect();
    const z = GG.view.zoom, s0 = GG.screenToWorld(0, 0);
    const want = { x: P.x + 70, y: P.y + 90 };
    return { want, sx: (want.x - s0.x) * z + r.left, sy: (want.y - s0.y) * z + r.top, from: { x: P.x, y: P.y } };
  });
  await p.touchscreen.tap(tap1.sx, tap1.sy);
  await p.waitForTimeout(150);
  const marker = await p.evaluate(() => GG.Input.moveTarget && { x: GG.Input.moveTarget.x, y: GG.Input.moveTarget.y });
  ok('a tap sets where she is going (' + (marker ? Math.round(marker.x - tap1.want.x) + ',' + Math.round(marker.y - tap1.want.y) : 'none') + ')',
    marker && Math.abs(marker.x - tap1.want.x) < 4 && Math.abs(marker.y - tap1.want.y) < 4);
  await p.waitForTimeout(2200);
  const there = await pos();
  ok('she walks there on her own (' + Math.round(Math.hypot(there.x - tap1.want.x, there.y - tap1.want.y)) + 'px off)',
    Math.hypot(there.x - tap1.want.x, there.y - tap1.want.y) < 8);
  ok('and the marker goes away when she arrives', await p.evaluate(() => !GG.Input.moveTarget));

  /* on a computer, a mouse click does the same */
  await p.waitForTimeout(300);
  const click = await p.evaluate(() => {
    const P = GG.Player, r = document.getElementById('game').getBoundingClientRect();
    const z = GG.view.zoom, s0 = GG.screenToWorld(0, 0);
    const want = { x: P.x - 60, y: P.y - 40 };
    return { want, sx: (want.x - s0.x) * z + r.left, sy: (want.y - s0.y) * z + r.top };
  });
  await p.mouse.click(click.sx, click.sy);
  await p.waitForTimeout(1800);
  const clicked = await pos();
  ok('a mouse click walks her there too (' + Math.round(Math.hypot(clicked.x - click.want.x, clicked.y - click.want.y)) + 'px off)',
    Math.hypot(clicked.x - click.want.x, clicked.y - click.want.y) < 8);

  /* a tap on a button is a button press, not a walk */
  await p.tap('#btn-menu');
  await p.waitForTimeout(300);
  ok('tapping a button does not set a walk target', await p.evaluate(() => !GG.Input.moveTarget));
  await p.evaluate(() => GG.UI.close('screen-menu'));
  await p.waitForTimeout(200);

  /* a tap into deep water: she walks to the bank and stops, not stuck walking forever */
  const river = await p.evaluate(() => {
    const W = GG.World, P = GG.Player;
    P.reset(5280, 3010);                                   // on the river bank
    GG.Input.walkTo(5280, 3110);                           // the river itself
    return true;
  });
  await p.waitForTimeout(1800);
  const wet = await p.evaluate(() => ({ target: !!GG.Input.moveTarget, deep: GG.World.isDeepWater(GG.Player.x, GG.Player.y), y: GG.Player.y }));
  ok('tapping the river walks her to the edge and she stops there', !wet.target && !wet.deep);

  /* a key press takes over from a tap */
  const keys = await p.evaluate(async () => {
    const P = GG.Player; P.reset(GG.World.HOUSE.x + 40, GG.World.HOUSE.y + 260);
    GG.Input.walkTo(P.x + 300, P.y);
    await new Promise(r => setTimeout(r, 200));
    GG.Input.keys['s'] = true;
    await new Promise(r => setTimeout(r, 120));
    GG.Input.keys['s'] = false;
    return !GG.Input.moveTarget;
  });
  ok('the keyboard takes over from a tap straight away', keys);

  /* indoors too */
  const house = await p.evaluate(async () => {
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36);
    return true;
  });
  await p.keyboard.press('Space');
  await p.waitForTimeout(600);
  const indoor = await p.evaluate(async () => {
    const P = GG.Player;
    const cleared = !GG.Input.moveTarget;
    const to = { x: P.x - 90, y: P.y - 60 };
    GG.Input.walkTo(to.x, to.y);
    await new Promise(r => setTimeout(r, 1800));
    return { cleared, off: Math.hypot(P.x - to.x, P.y - to.y), scene: GG.debugScene ? GG.debugScene() : 'house' };
  });
  ok('going indoors forgets any walk-to spot outside', indoor.cleared);
  ok('tap-to-walk works in the cottage (' + Math.round(indoor.off) + 'px off)', indoor.off < 8);
  await p.screenshot({ path: __dirname + '/shots/v117-house.png' });

  console.log(r.join('\n'));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) || errs.length ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
