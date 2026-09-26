/* v1.19: a simpler How to play, the menu stepping aside for Settings, and a
   polish pass over the whole game. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(800);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);

  /* ---------- How to play ---------- */
  await p.tap('#btn-howto'); await p.waitForTimeout(300);
  const help = await p.evaluate(() => {
    const body = document.querySelector('#screen-help .body');
    return { rows: document.querySelectorAll('#screen-help .how').length,
      oldList: document.querySelectorAll('#screen-help ul.tips li').length,
      words: body.innerText.split(/\s+/).length,
      fits: body.scrollHeight <= body.clientHeight + 4,
      pick: /PICK/.test(body.innerText) };
  });
  ok('How to play is eight short rows, not a wall of text (' + help.rows + ' rows, ' + help.words + ' words)',
    help.rows === 8 && help.oldList === 0 && help.words < 160);
  ok('it fits on a phone screen without scrolling', help.fits);
  ok('and it mentions picking', help.pick);
  await p.evaluate(() => GG.UI.close('screen-help'));

  await p.tap('#btn-play'); await require('./charskip')(p); await p.waitForTimeout(1000);
  await p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    GG.Critters.spawnNear = () => false; GG.Critters.clear();
  });

  /* ---------- a new game does not start in the doorway ---------- */
  await p.waitForTimeout(300);
  const start = await p.evaluate(() => ({ label: document.getElementById('btn-a').textContent }));
  ok('a new game starts clear of the door, so the button is NET (' + start.label + ')', /^NET/.test(start.label));

  /* ---------- the Garden Menu steps aside ---------- */
  await p.tap('#btn-menu'); await p.waitForTimeout(300);
  await p.tap('#menu-settings'); await p.waitForTimeout(300);
  const set = await p.evaluate(() => GG.UI.openPanels.slice());
  ok('opening Settings from the menu closes the menu (' + set.join(',') + ')',
    set.indexOf('screen-menu') < 0 && set.indexOf('screen-settings') >= 0);
  await p.evaluate(() => GG.UI.close('screen-settings'));
  await p.tap('#btn-menu'); await p.waitForTimeout(300);
  await p.tap('#menu-help'); await p.waitForTimeout(300);
  const hp = await p.evaluate(() => GG.UI.openPanels.slice());
  ok('and so does How to play', hp.indexOf('screen-menu') < 0 && hp.indexOf('screen-help') >= 0);
  await p.evaluate(() => GG.UI.close('screen-help'));
  const mp = await p.evaluate(async () => {
    const t0 = performance.now(); document.getElementById('btn-menu').click();
    const a = performance.now() - t0; GG.UI.close('screen-menu');
    const t1 = performance.now(); document.getElementById('btn-menu').click();
    const b2 = performance.now() - t1; GG.UI.close('screen-menu');
    return { a, b: b2, text: document.getElementById('menu-progress').textContent };
  });
  ok('the map is painted once and then reused (' + Math.round(mp.a) + 'ms, then ' + Math.round(mp.b) + 'ms)', mp.b < 60);
  ok('the menu counts every book (' + mp.text + ')', /pages in your Critter Compendium/.test(mp.text));

  /* ---------- toasts show over panels ---------- */
  const toast = await p.evaluate(() => {
    GG.Book.open('bugs');
    GG.UI.toast('hello there');
    const t = document.getElementById('toast');
    t.style.pointerEvents = 'auto';
    const r1 = t.getBoundingClientRect();
    const top = document.elementFromPoint(r1.left + r1.width / 2, r1.top + r1.height / 2);
    t.style.pointerEvents = '';
    GG.UI.close('screen-book');
    return { onTop: top === t || t.contains(top), z: getComputedStyle(t).zIndex };
  });
  ok('a toast is seen on top of an open book (z ' + toast.z + ')', toast.onTop);

  /* ---------- the fish book box ---------- */
  const fc = await p.evaluate(() => {
    const d = document.createElement('div'); d.className = 'foodchain';
    d.innerHTML = '<b>Head</b><div class="fcline">a <b>word</b> in a line</div>';
    document.body.appendChild(d);
    const r2 = [getComputedStyle(d.children[0]).display, getComputedStyle(d.querySelector('.fcline b')).display];
    d.remove(); return r2;
  });
  ok('bold words inside a line stay inline (' + fc.join(',') + ')', fc[0] === 'block' && fc[1] === 'inline');

  /* ---------- a card that just opened ignores a stray tap ---------- */
  const card = await p.evaluate(async () => {
    GG.UI.showCatch(GG.BUG_BY_ID.ladybug, true, 20);
    document.getElementById('catch-pop').click();
    const stillOpen = !document.getElementById('catch-pop').classList.contains('hidden');
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById('catch-pop').click();
    const closed = document.getElementById('catch-pop').classList.contains('hidden');
    return { stillOpen, closed };
  });
  ok('a tap straight after a catch does not close the NEW! card', card.stillOpen);
  ok('but a tap a second later does', card.closed);

  const never = await p.evaluate(() => {
    GG.UI.showFruit({ def: GG.FRUIT_BY_ID.baneberry, first: true, unlocked: null });
    const a = document.getElementById('catch-ok').textContent;
    GG.UI.hideCatch();
    GG.UI.showCatch(GG.BUG_BY_ID.ladybug, false, 5);
    const c = document.getElementById('catch-ok').textContent;
    GG.UI.hideCatch();
    return { a, c };
  });
  ok('a poisonous plant’s card says Got it, not Nice! (' + never.a + ' / ' + never.c + ')', never.a === 'Got it' && never.c === 'Nice!');

  const far = await p.evaluate(() => {
    const snake = GG.ANIMALS.find(a => GG.animalIsLookOnly(a));
    GG.UI.showFriend(snake, true, 0);
    const r3 = { tag: document.getElementById('friend-new').textContent, ok: document.getElementById('friend-ok').textContent };
    GG.UI.hideFriend();
    return r3;
  });
  ok('a keep-away animal is met from far away, not a new friend (' + far.tag + ')', /FAR AWAY/.test(far.tag) && /distance/.test(far.ok));

  /* ---------- PICK does not steal the net from a bug ---------- */
  const pick = await p.evaluate(async () => {
    const q = GG.World.props.find(o => o.pick === 'dandelion');
    GG.Orchard.wanted = null;
    GG.Player.reset(q.x - 30, q.y + 16);
    await new Promise(r => setTimeout(r, 250));
    const alone = document.getElementById('btn-a').textContent;
    GG.Critters.add(GG.BUG_BY_ID.ladybug, GG.Player.x + 30, GG.Player.y - 6);
    await new Promise(r => setTimeout(r, 250));
    const withBug = document.getElementById('btn-a').textContent;
    GG.Orchard.want(q.x, q.y - 10);
    await new Promise(r => setTimeout(r, 250));
    const chosen = document.getElementById('btn-a').textContent;
    GG.Critters.clear(); GG.Orchard.wanted = null;
    return { alone, withBug, chosen };
  });
  ok('next to a flower alone the button is PICK (' + pick.alone + ')', /^PICK/.test(pick.alone));
  ok('with a bug right there it stays NET (' + pick.withBug + ')', /^NET/.test(pick.withBug));
  ok('unless she tapped the flower herself (' + pick.chosen + ')', /^PICK/.test(pick.chosen));

  /* ---------- going in and straight back out ---------- */
  const door = await p.evaluate(async () => {
    const W = GG.World;
    GG.Player.reset(W.DOOR.x, W.DOOR.y + 40);
    await new Promise(r => setTimeout(r, 200));
    document.getElementById('btn-a').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 250));
    const inside = GG.debugScene();
    document.getElementById('btn-a').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 250));
    const still = GG.debugScene();
    const label = document.getElementById('btn-a').textContent;
    return { inside, still, label };
  });
  ok('a quick second tap on GO IN does not walk her straight back out (' + door.inside + ' -> ' + door.still + ')',
    door.inside === 'house' && door.still === 'house');
  ok('and she is not standing on the way out (' + door.label + ')', !/GO OUT/.test(door.label));
  await p.evaluate(async () => {
    const H = GG.House; GG.Player.reset(280, H.H - 30);
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById('btn-a').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
  });
  const outside = await p.evaluate(() => ({ scene: GG.debugScene(), label: document.getElementById('btn-a').textContent }));
  ok('coming out, she lands clear of the door (' + outside.label + ')', outside.scene === 'world' && !/GO IN/.test(outside.label));

  /* ---------- a tap on the painted door walks her to the step ---------- */
  const tapDoor = await p.evaluate(async () => {
    const W = GG.World;
    await new Promise(r => setTimeout(r, 900));
    let sx = W.DOOR.x + 20, sy = W.DOOR.y + 150;
    for (let k = 0; k < 40 && W.blocked(sx, sy, 12); k++) { sx += 7; sy += 3; }
    GG.Player.reset(sx, sy);
    GG.Input._tapQueued = { x: W.DOOR.x, y: W.DOOR.y - 20 };
    GG.Input.walkTo(W.DOOR.x, W.DOOR.y - 20);
    await new Promise(r => setTimeout(r, 2200));
    return { label: document.getElementById('btn-a').textContent, y: GG.Player.y, houseY: W.HOUSE.y };
  });
  ok('tapping the cottage walks her to the door step (' + tapDoor.label + ')', /GO IN/.test(tapDoor.label) && tapDoor.y > tapDoor.houseY);

  /* ---------- fishing: a tap on the water is the catch tap ---------- */
  const fish = await p.evaluate(async () => {
    const F = GG.Fishing, W = GG.World;
    const pond = W.pond || { cx: 3820, cy: 2980, rx: 460 };
    let spot = null;
    for (let a = 0; a < 64 && !spot; a++) {
      const ang = a / 64 * Math.PI * 2;
      for (let rr = 1.05; rr < 1.4 && !spot; rr += 0.05) {
        const x = pond.cx + Math.cos(ang) * (pond.rx || 460) * rr, y = pond.cy + Math.sin(ang) * (pond.ry || 300) * rr;
        if (!W.isWater(x, y) && !W.blocked(x, y, 10)) {
          GG.Player.reset(x, y); GG.Player.angle = ang + Math.PI;
          if (F.castTarget(GG.Player)) spot = { x, y };
        }
      }
    }
    if (!spot) return { skipped: true };
    F.cast(GG.Player);
    await new Promise(r => setTimeout(r, 700));
    const x0 = GG.Player.x, y0 = GG.Player.y;
    GG.Input._tapQueued = { x: x0 + 60, y: y0 - 60 }; GG.Input.walkTo(x0 + 60, y0 - 60);
    await new Promise(r => setTimeout(r, 500));
    return { moved: Math.hypot(GG.Player.x - x0, GG.Player.y - y0), target: !!GG.Input.moveTarget };
  });
  ok('while the line is out a tap does not walk her away (' + (fish.skipped ? 'skipped' : Math.round(fish.moved) + 'px') + ')',
    fish.skipped || (fish.moved < 6 && !fish.target));
  await p.evaluate(() => GG.Fishing.reset());

  /* ---------- the ! gives her time, and stopping works ---------- */
  const alert = await p.evaluate(async () => {
    const W = GG.World;
    let x = 4700, y = 2700;
    for (let k = 0; k < 60 && (W.blocked(x, y, 12) || W.blocked(x + 120, y, 12) || W.isWater(x + 120, y)); k++) { x += 37; y += 11; }
    GG.Player.reset(x, y);
    await new Promise(r => setTimeout(r, 200));
    const P = GG.Player;
    GG.Critters.clear();
    GG.Critters.add(GG.BUG_BY_ID.monarch, P.x + 120, P.y);
    const bug = GG.Critters.list[0];
    bug.x = P.x + 120; bug.y = P.y;
    GG.Input.walkTo(P.x + 110, P.y);
    let saw = null;
    for (let i = 0; i < 120 && saw === null; i++) {
      await new Promise(r => setTimeout(r, 16));
      if (bug.alert > 0) saw = bug.alert;
    }
    GG.Input.clearTarget();           // she stops dead when she sees the !
    await new Promise(r => setTimeout(r, 2200));
    const r = { saw, fled: bug.flee > 0, there: GG.Critters.list.indexOf(bug) >= 0, alertNow: bug.alert };
    GG.Critters.clear();
    return r;
  });
  ok('running at a bug makes it show a ! (' + alert.saw + ')', alert.saw > 0.6);
  ok('and stopping still settles it instead of scaring it off (fled ' + alert.fled + ', alert ' + alert.alertNow + ')',
    alert.there && !alert.fled && alert.alertNow === 0);

  /* ---------- emptying a tank ---------- */
  const tank = await p.evaluate(async () => {
    GG.Save.addCatch('ladybug');
    GG.Terrarium.open();
    await new Promise(r => setTimeout(r, 300));
    const tk = GG.Terrarium.tank();
    tk.bugs.push({ id: 'ladybug', x: 0.5, y: 0.5 });
    const btn = document.getElementById('tank-clear');
    btn.click();
    const afterOne = tk.bugs.length, label1 = btn.textContent;
    btn.click();
    const afterTwo = GG.Terrarium.tank().bugs.length, label2 = btn.textContent;
    btn.click();
    const back = GG.Terrarium.tank().bugs.length;
    GG.UI.close('screen-terrarium');
    return { afterOne, label1, afterTwo, label2, back };
  });
  ok('one tap on Empty it does not empty the tank (' + tank.label1 + ')', tank.afterOne === 1 && /again/.test(tank.label1));
  ok('a second tap does, and offers to put it back (' + tank.label2 + ')', tank.afterTwo === 0 && /back/i.test(tank.label2));
  ok('and putting it back works', tank.back === 1);

  /* ---------- nothing is redrawn under an open panel ---------- */
  const redraw = await p.evaluate(async () => {
    let n = 0;
    const orig = GG.World.drawGround;
    GG.World.drawGround = function () { n++; return orig.apply(this, arguments); };
    GG.Book.open('bugs');
    await new Promise(r => setTimeout(r, 120));
    n = 0;
    await new Promise(r => setTimeout(r, 600));
    const whilePaused = n;
    GG.UI.close('screen-book');
    await new Promise(r => setTimeout(r, 300));
    GG.World.drawGround = orig;
    return { whilePaused, after: n };
  });
  ok('the garden is not repainted while a book is open (' + redraw.whilePaused + ' frames)', redraw.whilePaused === 0 && redraw.after > 3);

  /* ---------- the HUD stays on one row ---------- */
  const hud = await p.evaluate(async () => {
    GG.Save.data.sparkles = 123456; GG.UI.refreshHud();
    GG.Player.reset(2100, 2300);
    await new Promise(r => setTimeout(r, 300));
    const tops = Array.from(document.querySelectorAll('#hud-top > *')).filter(e => !e.hidden).map(e => Math.round(e.getBoundingClientRect().top));
    return tops;
  });
  ok('the top bar stays on one row with a big sparkle count (' + hud.join(',') + ')', Math.max.apply(null, hud) - Math.min.apply(null, hud) < 6);

  errs.forEach(e => r.push('FAIL ' + e));
  console.log(r.join('\n'));
  console.log(r.filter(x => x.startsWith('FAIL')).length ? 'SOME FAILED' : 'ALL PASS');
  await b.close();
})();
