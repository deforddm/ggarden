/* v1.20: decorating the cottage.
   node tests/v120home.js [url]

   - a room she has never decorated is pixel-for-pixel the v1.19 cottage
     (against tests/fixtures/house.v119.js, the old House.draw kept verbatim,
     and the PNG snapshots taken of it before anything changed)
   - every wallpaper, floor, rug, quilt and curtain changes the room
   - buying takes sparkles, and is refused when she is short
   - placing, moving and putting away things, through the panel
   - things survive a reload
   - solid things block Guin and her friends
   - with the room crammed full, the door and every spot can still be reached
   - no page errors, and House.draw with its cache costs < 1 ms a frame
   Screenshots go to tests/shots/v120home/. */
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.argv[2] || 'http://localhost:8899/index.html';
const SHOTS = __dirname + '/shots/v120home/';
fs.mkdirSync(SHOTS, { recursive: true });

process.on('unhandledRejection', e => { console.log(r.join('\n')); console.log('CRASH', e.message.slice(0, 600)); process.exit(1); });
const r = [];
(async () => {
  const b = await chromium.launch();
  const ok = (n, v) => { r.push((v ? 'PASS ' : 'FAIL ') + n); };
  const errs = [];
  const watch = (p) => {
    p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
  };
  const fresh = async (p) => {
    await p.goto(URL);
    await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForTimeout(700); await p.click('#btn-play', { force: true }); await p.waitForTimeout(900);
    const hadChar = await p.evaluate(() => {
      const el = document.getElementById('screen-char');
      if (GG.CharSelect && GG.CharSelect.skip && el && !el.classList.contains('hidden')) { GG.CharSelect.skip(); return true; }
      return false;
    });
    if (hadChar) await p.waitForTimeout(900);
    await p.evaluate(() => {
      ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
      GG.Friends.spawnNear = () => false; GG.Critters.spawnNear = () => false;
      GG.Friends.clear(); GG.Critters.clear();
      GG.Time.set(12 * 60); GG.Time.rain = false;
    });
  };
  const goIn = async (p) => {
    for (let k = 0; k < 4; k++) {
      await p.evaluate(() => { GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36); });
      await p.waitForTimeout(400);
      await p.keyboard.press('Space');
      await p.waitForTimeout(1000);
      if (await p.evaluate(() => GG.debugScene() === 'house')) break;
    }
    await p.evaluate(() => document.getElementById('toast').classList.remove('show'));
  };

  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  watch(p);
  await fresh(p);

  /* ---------- 1. the default look is the v1.19 cottage ---------- */
  const oldSrc = fs.readFileSync(__dirname + '/fixtures/house.v119.js', 'utf8');
  const same = await p.evaluate(async (src) => {
    /* the v1.19 House, built into a copy of GG so the real one is untouched */
    const G2 = Object.create(GG);
    new Function('GG', src.replace(/\}\)\(window\.GG = window\.GG \|\| \{\}\);\s*$/, '})(GG);'))(G2);
    const Old = G2.House;
    const load = (s) => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = s; });
    function px(fn) {
      const cv = document.createElement('canvas'); cv.width = 1120; cv.height = 880;
      const c = cv.getContext('2d'); c.scale(2, 2); fn(c);
      return c.getImageData(0, 0, 1120, 880).data;
    }
    function cmp(A, B) {
      let n = 0, max = 0;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) + Math.abs(A[i + 3] - B[i + 3]);
        if (d > 6) n++; if (d > max) max = d;
      }
      return { n, max };
    }
    const out = {};
    for (const night of [false, true]) {
      GG.Time.set(night ? 23 * 60 : 12 * 60);
      GG.Save.data.home = null; GG.House.refresh();
      const now = px(c => GG.House.draw(c, { x: 0, y: 0 }, 1.234));
      const old = px(c => Old.draw(c, { x: 0, y: 0 }, 1.234));
      const img = await load('tests/fixtures/v119-room-' + (night ? 'night' : 'day') + '.png');
      const snap = px(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(img, 0, 0); });
      out[night ? 'night' : 'day'] = { vsOld: cmp(now, old), vsSnap: cmp(now, snap) };
      /* an empty home record is the same as none at all */
      GG.Save.data.home = { wall: null, floor: null, rug: null, quilt: null, curtain: null, owned: [], items: [] }; GG.House.refresh();
      out[(night ? 'night' : 'day') + 'Empty'] = cmp(px(c => GG.House.draw(c, { x: 0, y: 0 }, 1.234)), old);
    }
    GG.Save.data.home = null; GG.House.refresh(); GG.Time.set(12 * 60);
    return out;
  }, oldSrc);
  for (const k of ['day', 'night']) {
    ok(`default room (${k}) matches v1.19's House.draw pixel for pixel (${same[k].vsOld.n} px differ, max ${same[k].vsOld.max})`, same[k].vsOld.n === 0);
    ok(`default room (${k}) matches the snapshot taken before v1.20 (${same[k].vsSnap.n} px differ)`, same[k].vsSnap.n === 0);
    ok(`an empty home record (${k}) looks the same too (${same[k + 'Empty'].n} px)`, same[k + 'Empty'].n === 0);
  }

  /* ---------- 2. every option changes the room ---------- */
  const changes = await p.evaluate(() => {
    const D = GG.HOME_DECOR;
    function px() {
      const cv = document.createElement('canvas'); cv.width = 560; cv.height = 440;
      const c = cv.getContext('2d'); GG.House.draw(c, { x: 0, y: 0 }, 1);
      return c.getImageData(0, 0, 560, 440).data;
    }
    GG.Save.data.home = null; GG.House.refresh();
    const base = px(), bad = [], counts = {};
    D.kinds.forEach(k => {
      D[k].forEach((o, i) => {
        if (i === 0) return;
        GG.Save.data.home = { owned: [], items: [] }; GG.Save.data.home[k] = o.id; GG.House.refresh();
        const a = px(); let n = 0;
        for (let j = 0; j < a.length; j += 4) if (Math.abs(a[j] - base[j]) + Math.abs(a[j + 1] - base[j + 1]) + Math.abs(a[j + 2] - base[j + 2]) > 20) n++;
        counts[k + ':' + o.id] = n;
        if (n < 300) bad.push(k + ':' + o.id + '=' + n);
      });
    });
    /* every thing draws something */
    const blank = [];
    D.item.concat([{ id: '_decorate' }]).forEach(o => {
      const sp = GG.HomeArt.sprite(o.id, 2), d = sp.cv.getContext('2d').getImageData(0, 0, sp.cv.width, sp.cv.height).data;
      let n = 0; for (let j = 3; j < d.length; j += 4) if (d[j] > 100) n++;
      if (n < 200) blank.push(o.id + '=' + n);
    });
    GG.Save.data.home = null; GG.House.refresh();
    return { bad, blank, n: Object.keys(counts).length,
      sizes: { wall: D.wall.length, floor: D.floor.length, rug: D.rug.length, quilt: D.quilt.length, curtain: D.curtain.length,
        things: D.item.length, free: D.item.filter(x => !x.price).length, solid: D.item.filter(x => x.solid).length } };
  });
  ok('every wallpaper, floor, rug, quilt and curtain visibly changes the room (' + changes.n + ' options) ' + changes.bad.join(' '), changes.bad.length === 0);
  ok('every thing has a drawing ' + changes.blank.join(' '), changes.blank.length === 0);
  const sz = changes.sizes;
  ok('enough choice: ' + JSON.stringify(sz), sz.wall >= 8 && sz.floor >= 6 && sz.rug >= 6 && sz.quilt >= 6 && sz.curtain >= 6 && sz.things >= 14 && sz.free >= 2);

  /* ---------- 3. buying ---------- */
  const buy = await p.evaluate(() => {
    const H = GG.House, d = GG.Save.data;
    GG.Save.data.home = null; H.refresh();
    d.sparkles = 40;
    const r1 = H.useLook('wall', 'stars');                          // costs 50
    const after1 = { sp: d.sparkles, look: H.look('wall') };
    d.sparkles = 120;
    const r2 = H.useLook('wall', 'stars');
    const after2 = { sp: d.sparkles, look: H.look('wall'), owned: H.owns('wall', 'stars') };
    H.useLook('wall', 'cream');                                     // free, back to how it was
    const r3 = H.useLook('wall', 'stars');                          // already hers: no charge
    const free = H.useLook('floor', 'honey');
    return { r1, after1, r2, after2, r3, sp3: d.sparkles, free };
  });
  ok('short of sparkles: refused, nothing taken (' + buy.r1 + ', ' + buy.after1.sp + ')', buy.r1 === 'short' && buy.after1.sp === 40 && buy.after1.look === 'cream');
  ok('with enough: bought and up on the wall, 50 sparkles taken (' + buy.after2.sp + ')', buy.r2 === 'ok' && buy.after2.sp === 70 && buy.after2.look === 'stars' && buy.after2.owned);
  ok('putting it back up later costs nothing (' + buy.sp3 + ')', buy.r3 === 'ok' && buy.sp3 === 70);

  /* through the panel */
  await p.evaluate(() => { GG.Save.data.home = null; GG.House.refresh(); GG.Save.data.sparkles = 10; });
  await goIn(p);
  await p.evaluate(() => { GG.Player.reset(GG.House.STAND.x + 26, GG.House.STAND.y - 22); });
  await p.waitForTimeout(250);
  const atStand = await p.evaluate(() => ({ spot: (GG.House.nearest(GG.Player.x, GG.Player.y) || {}).id, btn: document.getElementById('btn-a').textContent }));
  ok('by the paint pots the big button says DECORATE (' + atStand.btn + ')', atStand.spot === 'decorate' && /DECORATE/.test(atStand.btn));
  await p.screenshot({ path: SHOTS + 'room-default.png' });
  await p.click('#btn-a'); await p.waitForTimeout(800);
  ok('the big button opens the decorating panel', await p.evaluate(() => !document.getElementById('screen-homedecor').classList.contains('hidden')));
  await p.screenshot({ path: SHOTS + 'panel-412x860.png' });
  const tabs412 = await p.evaluate(() => [...document.querySelectorAll('.hd-tab span')].filter(s => s.scrollWidth > s.clientWidth + 1).map(s => s.textContent));
  ok('412x860: every tab label fits ' + tabs412.join(','), tabs412.length === 0);
  await p.click('.hd-tab[data-kind=rug]'); await p.waitForTimeout(150);
  await p.click('.hd-tile[data-id=ladybug]'); await p.waitForTimeout(150);
  const tryOn = await p.evaluate(() => ({ tried: GG.HomeDecor.tryOn.rug, real: GG.House.look('rug'), btn: document.querySelector('#hd-actions .btn')?.textContent }));
  ok('tapping a rug she does not own tries it on (' + tryOn.btn + ')', tryOn.tried === 'ladybug' && tryOn.real === 'blue' && /Buy/.test(tryOn.btn));
  await p.click('#hd-actions .btn'); await p.waitForTimeout(200);
  const shortMsg = await p.evaluate(() => ({ toast: document.getElementById('toast').textContent, sp: GG.Save.data.sparkles, look: GG.House.look('rug') }));
  ok('Buy with too few sparkles says so and takes nothing (' + shortMsg.toast + ')', /not enough sparkles/i.test(shortMsg.toast) && shortMsg.sp === 10 && shortMsg.look === 'blue');
  await p.evaluate(() => { GG.Save.data.sparkles = 400; GG.HomeDecor.refreshBar(); });
  await p.click('#hd-actions .btn'); await p.waitForTimeout(200);
  const bought = await p.evaluate(() => ({ sp: GG.Save.data.sparkles, look: GG.House.look('rug'), owned: GG.House.owns('rug', 'ladybug') }));
  ok('Buy with enough: the ladybird rug is hers and down (' + bought.sp + ')', bought.sp === 355 && bought.look === 'ladybug' && bought.owned);
  /* a free one goes straight up */
  await p.click('.hd-tab[data-kind=wall]'); await p.waitForTimeout(150);
  await p.click('.hd-tile[data-id=mint]'); await p.waitForTimeout(150);
  ok('a free wallpaper goes straight up', await p.evaluate(() => GG.House.look('wall') === 'mint' && GG.Save.data.sparkles === 355));

  /* ---------- 4. placing, moving and putting away, through the panel ---------- */
  await p.click('.hd-tab[data-kind=item]'); await p.waitForTimeout(150);
  await p.click('.hd-tile[data-id=toychest]'); await p.waitForTimeout(100);
  const room = await (await p.$('#hd-room')).boundingBox();
  const at = (x, y) => [room.x + x / 560 * room.width, room.y + y / 440 * room.height];
  await p.mouse.click(...at(150, 240)); await p.waitForTimeout(200);
  const placed = await p.evaluate(() => ({ items: GG.House.items().slice(), sp: GG.Save.data.sparkles, picked: GG.HomeDecor.picked }));
  const chest = placed.items[0];
  ok('pick the toy chest, tap the room: it is down where she tapped, 30 sparkles (' + JSON.stringify(chest) + ', ' + placed.sp + ')',
    placed.items.length === 1 && chest.id === 'toychest' && Math.abs(chest.x - 150) <= 8 && Math.abs(chest.y - 249) <= 8 && placed.sp === 325);
  await p.screenshot({ path: SHOTS + 'panel-placed.png' });
  await p.click('#hd-actions .btn.primary'); await p.waitForTimeout(100);     // Move
  await p.mouse.click(...at(380, 220)); await p.waitForTimeout(200);
  const moved = await p.evaluate(() => GG.House.items()[0]);
  ok('Move, then tap somewhere else: it moves there (' + JSON.stringify(moved) + ')', Math.abs(moved.x - 380) <= 8 && Math.abs(moved.y - 229) <= 8);
  /* tap the chest itself, then put it away */
  await p.mouse.click(room.x + 5, room.y + room.height - 5); await p.waitForTimeout(100);  // tap bare wall corner: nothing picked
  await p.mouse.click(...at(moved.x, moved.y - 10)); await p.waitForTimeout(150);
  const pickedNow = await p.evaluate(() => GG.HomeDecor.picked);
  ok('tapping a thing in the room picks it up', pickedNow === 0);
  await p.click('#hd-actions .btn.pink'); await p.waitForTimeout(150);
  const away = await p.evaluate(() => ({ n: GG.House.items().length, spare: GG.House.spare('toychest'), sp: GG.Save.data.sparkles }));
  ok('Put away: gone from the room, still hers in the box (' + JSON.stringify(away) + ')', away.n === 0 && away.spare === 1 && away.sp === 325);
  await p.click('.hd-tile[data-id=toychest]'); await p.waitForTimeout(100);
  await p.mouse.click(...at(150, 240)); await p.waitForTimeout(150);
  ok('putting it out again is free', await p.evaluate(() => GG.House.items().length === 1 && GG.Save.data.sparkles === 325 && GG.House.spare('toychest') === 0));
  /* a wall thing goes on the wall */
  await p.click('.hd-tile[data-id=bunting]'); await p.waitForTimeout(100);
  await p.mouse.click(...at(378, 40)); await p.waitForTimeout(150);
  const bunt = await p.evaluate(() => GG.House.items().find(i => i.id === 'bunting'));
  ok('bunting hangs on the back wall (' + JSON.stringify(bunt) + ')', bunt && bunt.y <= 112 - 10);
  /* nowhere for it: the doorway */
  await p.click('.hd-tile[data-id=gameshelf]'); await p.waitForTimeout(100);
  const door = await p.evaluate(() => ({ at: GG.House.canPlace('gameshelf', 280, 400, -1), start: GG.House.canPlace('teddy', 280, 350, -1) }));
  ok('nothing may go in the doorway or where she comes in (' + door.at + ', ' + door.start + ')', door.at && door.start);
  /* close with a look only tried on: it goes back */
  await p.click('.hd-tab[data-kind=floor]'); await p.waitForTimeout(100);
  await p.click('.hd-tile[data-id=checker]'); await p.waitForTimeout(100);
  await p.screenshot({ path: SHOTS + 'panel-tryon.png' });
  await p.click('#hd-done'); await p.waitForTimeout(250);
  const closed = await p.evaluate(() => ({ open: !document.getElementById('screen-homedecor').classList.contains('hidden'), floor: GG.House.look('floor'), toast: document.getElementById('toast').textContent }));
  ok('Done closes it; a floor only tried on goes back (' + closed.toast + ')', !closed.open && closed.floor === 'honey' && /tried on/i.test(closed.toast));

  /* ---------- 5. things survive a reload ---------- */
  const before = await p.evaluate(() => JSON.stringify(GG.Save.data.home));
  await p.evaluate(() => GG.Save.save());
  await p.reload(); await p.waitForTimeout(800);
  const after = await p.evaluate(() => { GG.House.refresh(); return { h: JSON.stringify(GG.Save.data.home), rug: GG.House.look('rug'), n: GG.House.items().length,
    solid: (() => { const c = GG.House.items().find(i => i.id === 'toychest'); return c ? GG.House.blocked(c.x, c.y - 6, 11) : false; })() }; });
  ok('after a reload the home is exactly as she left it', after.h === before && after.rug === 'ladybug' && after.n === 2);
  ok('and the toy chest is still solid', after.solid);

  /* ---------- 6. solid things block Guin and her friends ---------- */
  await fresh(p);
  await p.evaluate(() => {
    GG.Save.data.sparkles = 5000;
    GG.Save.data.home = null; GG.House.refresh();
    GG.House.placeItem('rocker', 160, 260);
    ['tabby', 'labrador', 'cookie', 'chicken', 'budgie', 'moose', 'horse'].forEach(id => GG.Save.addFriend(id));
    GG.Save.data.homeFriends = ['tabby', 'labrador', 'chicken', 'budgie', 'moose', 'horse'];
    GG.Friends.setCompanion('cookie');
  });
  await goIn(p);
  const walk = await p.evaluate(async () => {
    const H = GG.House, it = H.items()[0], def = GG.HOME_DECOR.byId.item[it.id];
    const R = { x0: it.x - def.fw / 2, x1: it.x + def.fw / 2, y0: it.y - def.fd, y1: it.y };
    GG.Player.reset(R.x0 - 40, it.y - def.fd / 2);
    let inside = 0, maxX = -1;
    GG.Input.keys['d'] = true;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 50));
      const P = GG.Player; maxX = Math.max(maxX, P.x);
      if (P.x > R.x0 && P.x < R.x1 && P.y > R.y0 && P.y < R.y1) inside++;
    }
    GG.Input.keys['d'] = false;
    return { inside, stoppedAt: maxX, x0: R.x0 };
  });
  ok('Guin walks into the rocking chair and stops (reached x ' + walk.stoppedAt.toFixed(0) + ', chair starts ' + walk.x0 + ')', walk.inside === 0 && walk.stoppedAt < walk.x0);

  /* ---------- 7. the room crammed full: nobody stuck, everything reachable ---------- */
  const full = await p.evaluate(async () => {
    const H = GG.House, D = GG.HOME_DECOR;
    GG.Save.data.home = null; H.refresh();
    /* try hard to wall things off: solid things first, across the middle and
       round every spot, then fill up with anything */
    const solid = D.item.filter(d => d.solid).map(d => d.id), all = D.item.map(d => d.id);
    let placed = 0, refusedPath = 0, n = 0;
    const tries = [];
    for (let y = 150; y < 420; y += 22) for (let x = 30; x < 540; x += 26) tries.push([x, y]);
    for (const [x, y] of tries) {
      if (H.items().length >= D.MAX_ITEMS) break;
      const id = (n++ % 3) ? solid[n % solid.length] : all[n % all.length];
      if (GG.HOME_DECOR.byId.item[id].solid && H.canPlace(id, x, y, -1) === 'path') refusedPath++;
      const res = H.placeItem(id, x, y);
      if (res.ok) placed++;
    }
    for (let x = 30; x < 540 && H.items().length < D.MAX_ITEMS; x += 30) H.placeItem(['bunting', 'poster', 'clock', 'mirror'][x % 4], x, 50);
    /* an independent flood fill (not House.reachGrid) using only House.blocked */
    const seen = new Set(), q = [[H.START.x, H.START.y]], step = 4, found = {};
    seen.add(H.START.x + ',' + H.START.y);
    while (q.length) {
      const [x, y] = q.pop();
      const s = H.nearest(x, y); if (s) found[s.id] = true;
      for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k)) continue; seen.add(k);
        if (!H.blocked(nx, ny, 11)) q.push([nx, ny]);
      }
    }
    const spots = {};
    H.spots.forEach(s => { spots[s.id] = !!found[s.id]; });
    /* friends at home: start clear, potter about for a while, never stuck */
    GG.Friends.loadHome();
    const starts = GG.Friends.homeList.map(f => !H.blocked(f.x, f.y, GG.Friends.HOME_RAD) && H.reachable(f.x, f.y, GG.Friends.HOME_RAD));
    const hs = H.homeSpots(GG.Friends.HOME_RAD);
    const hsOk = hs.every(q => !H.blocked(q.x, q.y, GG.Friends.HOME_RAD) && H.reachable(q.x, q.y, GG.Friends.HOME_RAD));
    const R = GG.Friends.HOME_RAD, solids = H._solids;
    let inSolid = 0, blockedFrames = 0;
    const moved = GG.Friends.homeList.map(f => ({ x: f.x, y: f.y, far: 0 }));
    for (let i = 0; i < 400; i++) {
      GG.Friends.stepHome(0.05);
      GG.Friends.homeList.forEach((f, k) => {
        if (H.blocked(f.x, f.y, R)) blockedFrames++;
        for (const s of solids) if (f.x > s.x0 && f.x < s.x1 && f.y > s.y0 && f.y < s.y1) inSolid++;
        moved[k].far = Math.max(moved[k].far, Math.hypot(f.x - moved[k].x, f.y - moved[k].y));
      });
    }
    /* a friend dropped right inside a solid thing is set down on reachable floor */
    const f0 = GG.Friends.homeList[0], s0 = solids[0];
    f0.x = (s0.x0 + s0.x1) / 2; f0.y = (s0.y0 + s0.y1) / 2;
    for (let i = 0; i < 3; i++) GG.Friends.stepHome(0.05);
    const rescued = !H.blocked(f0.x, f0.y, R) && H.reachable(f0.x, f0.y, R);
    return { placed, total: H.items().length, solids: solids.length, refusedPath, spots, starts, hs: hs.length, hsOk, inSolid, blockedFrames,
      movers: moved.filter(m => m.far > 10).length, friends: moved.length, rescued };
  });
  ok('the room filled right up (' + full.total + ' things, ' + full.solids + ' solid; ' + full.refusedPath + ' refused for blocking the way)', full.total >= 20 && full.solids >= 6);
  ok('with it full, she can still reach the door and every spot ' + JSON.stringify(full.spots), Object.values(full.spots).every(Boolean));
  ok('friends waiting at home start on clear, reachable floor ' + JSON.stringify(full.starts), full.starts.length === 6 && full.starts.every(Boolean));
  ok('the home spots they use are all open and reachable (' + full.hs + ')', full.hs > 0 && full.hsOk);
  ok('nobody walks into a solid thing or gets stuck in one (' + full.inSolid + ' / ' + full.blockedFrames + ')', full.inSolid === 0 && full.blockedFrames === 0);
  ok('they keep pottering about (' + full.movers + '/' + full.friends + ' moved)', full.movers >= full.friends - 2);
  ok('a friend found inside a toy chest is set down on floor she can reach', full.rescued);
  await p.waitForTimeout(300);
  await p.evaluate(() => { GG.Player.reset(GG.House.START.x, GG.House.START.y); document.getElementById('toast').classList.remove('show'); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: SHOTS + 'room-full.png' });
  /* the v1.16 reach probe (tests/three.js) still finds every spot */
  const probe = await p.evaluate(() => {
    const out = {};
    for (const s of GG.House.spots) {
      let found = false;
      for (let rad = 10; rad <= 140 && !found; rad += 4)
        for (let a = 0; a < 6.28 && !found; a += 0.1) {
          const x = s.x + Math.cos(a) * rad, y = s.y + Math.sin(a) * rad;
          if (!GG.House.blocked(x, y, 11) && GG.House.nearest(x, y) && GG.House.nearest(x, y).id === s.id) found = true;
        }
      out[s.id] = found;
    }
    return out;
  });
  ok('and the old walk-up probe agrees ' + JSON.stringify(probe), Object.values(probe).every(Boolean));
  /* the door itself: walk her out */
  const out = await p.evaluate(async () => {
    GG.Input.walkTo && GG.Input.walkTo(GG.House.DOOR.x, GG.House.H - 20);
    for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 50)); if ((GG.House.nearest(GG.Player.x, GG.Player.y) || {}).id === 'door') break; }
    return (GG.House.nearest(GG.Player.x, GG.Player.y) || {}).id;
  });
  ok('she can walk from the middle of the full room to the door (' + out + ')', out === 'door');

  /* try, on purpose, to shut the bookshelf off with a wall of big things */
  const wall = await p.evaluate(() => {
    const H = GG.House, D = GG.HOME_DECOR;
    GG.Save.data.home = null; H.refresh(); GG.Save.data.sparkles = 9999;
    const ids = D.item.filter(d => d.solid).map(d => d.id);
    let path = 0, placed = 0;
    const reasons = {};
    for (let round = 0; round < 3; round++)
      for (let y = 140; y <= 200; y += 6) for (let x = 20; x <= 170; x += 6) for (const id of ids) {
        const why = H.canPlace(id, x, y, -1);
        reasons[why] = (reasons[why] || 0) + 1;
        if (why === 'path') path++;
        if (!why && H.items().length < D.MAX_ITEMS) { H.ensureHome().items.push({ id, x, y }); H.refresh(); placed++; }
      }
    const spots = {}; H.allReachable(H._solids, spots);
    return { path, placed, spots };
  });
  ok('walling off the bookshelf on purpose: ' + wall.placed + ' big things go in, ' + wall.path + ' spots refused because they would cut it off, and it is still reachable ' + JSON.stringify(wall.spots),
    wall.path > 0 && Object.values(wall.spots).every(Boolean));

  /* ---------- 8. cost of drawing ---------- */
  const perf = await p.evaluate(() => {
    const H = GG.House, s = 2 * 1.536;
    const cv = document.createElement('canvas'); cv.width = Math.round(412 * 2); cv.height = 860 * 2;
    const c = cv.getContext('2d'); c.setTransform(s, 0, 0, s, 0, 0);
    const cam = { x: 120, y: -60 };
    H.draw(c, cam, 0);                                     // builds the cache
    const t0 = performance.now(); let n = 0;
    for (; n < 300; n++) { cam.x = 100 + (n % 50) * 0.37; H.draw(c, cam, n / 60); }
    const perFrame = (performance.now() - t0) / n;
    /* and the things on the floor, as the room draws them */
    const ents = []; H.collect(ents);
    const t1 = performance.now();
    for (let k = 0; k < 100; k++) for (const e of ents) H.drawEntry(c, e, cam, k / 60);
    const items = (performance.now() - t1) / 100;
    const t2 = performance.now(); H._cacheKey = null; H.draw(c, cam, 0); const rebuild = performance.now() - t2;
    return { perFrame, items, ents: ents.length, rebuild };
  });
  ok('House.draw with the cache costs ' + perf.perFrame.toFixed(3) + ' ms a frame (< 1 ms)', perf.perFrame < 1);
  ok('and all ' + perf.ents + ' things on the floor ' + perf.items.toFixed(3) + ' ms (rebuilding the cache once: ' + perf.rebuild.toFixed(1) + ' ms)', perf.items < 1);

  /* ---------- 9. three very different rooms ---------- */
  const rooms = [
    { name: 'starry', look: { wall: 'stars', floor: 'bluecheck', rug: 'star', quilt: 'stars', curtain: 'starry' },
      items: [['starlamp', 470, 380], ['globe', 110, 190], ['gameshelf', 170, 150], ['beanbag', 380, 190], ['teddy', 440, 230], ['garland', 480, 40], ['poster', 70, 44], ['rocker', 90, 300]] },
    { name: 'garden', look: { wall: 'flowers', floor: 'grass', rug: 'ladybug', quilt: 'ladybug', curtain: 'leafy' },
      items: [['sunflower', 120, 160], ['fern', 520, 400], ['fishbowl', 180, 170], ['stool', 350, 300], ['flowertable', 400, 170], ['plant', 60, 210], ['bunting', 378, 40], ['rainbowpic', 70, 44], ['easel', 110, 280]] },
    { name: 'candy', look: { wall: 'candy', floor: 'checker', rug: 'rainbow', quilt: 'rainbow', curtain: 'pink' },
      items: [['dollhouse', 150, 170], ['piano', 400, 175], ['cushions', 380, 240], ['lamp', 90, 190], ['toychest', 120, 330], ['teddy', 150, 300], ['mirror', 495, 50], ['clock', 70, 44], ['bunting', 378, 40]] }
  ];
  for (const rm of rooms) {
    const got = await p.evaluate((rm) => {
      GG.Save.data.home = Object.assign({ owned: [], items: [] }, rm.look); GG.House.refresh();
      GG.Save.data.sparkles = 9999;
      rm.items.forEach(([id, x, y]) => GG.House.placeItem(id, x, y));
      GG.Friends.homeList = []; GG.Friends.setCompanion(null);
      GG.Player.reset(310, 250);
      document.getElementById('toast').classList.remove('show');
      return GG.House.items().length;
    }, rm);
    await p.waitForTimeout(400);
    ok(`the ${rm.name} room: ${got}/${rm.items.length} things placed`, got >= rm.items.length - 1);
    /* the whole room, drawn big */
    const png = await p.evaluate(() => {
      const cv = document.createElement('canvas'); cv.width = 1120; cv.height = 880;
      const c = cv.getContext('2d'); c.scale(2, 2);
      GG.House._cacheKey = null;
      GG.House.draw(c, { x: 0, y: 0 }, 1);
      const ents = [{ y: GG.Player.y, player: true }]; GG.House.collect(ents); ents.sort((a, b) => a.y - b.y);
      ents.forEach(e => e.player ? GG.Player.draw(c, GG.Player.x, GG.Player.y, 1) : GG.House.drawEntry(c, e, { x: 0, y: 0 }, 1));
      GG.House._cacheKey = null;
      return cv.toDataURL();
    });
    fs.writeFileSync(SHOTS + 'room-' + rm.name + '.png', Buffer.from(png.split(',')[1], 'base64'));
    await p.screenshot({ path: SHOTS + 'room-' + rm.name + '-phone.png' });
  }
  /* night, with the lamps on */
  await p.evaluate(() => GG.Time.set(22 * 60)); await p.waitForTimeout(400);
  await p.screenshot({ path: SHOTS + 'room-candy-night-phone.png' });
  await p.evaluate(() => GG.Time.set(12 * 60));

  /* ---------- 10. the panel on a small phone ---------- */
  const p2 = await b.newPage({ viewport: { width: 360, height: 640 }, hasTouch: true, deviceScaleFactor: 2 });
  watch(p2);
  await fresh(p2);
  await p2.evaluate(() => { GG.Save.data.sparkles = 120; });
  await goIn(p2);
  await p2.evaluate(() => GG.HomeDecor.open()); await p2.waitForTimeout(800);
  const fit = await p2.evaluate(() => {
    const q = s => document.querySelector(s).getBoundingClientRect();
    const tabs = [...document.querySelectorAll('.hd-tab')].map(t => ({ w: t.getBoundingClientRect().width, h: t.getBoundingClientRect().height, clip: t.querySelector('span').scrollWidth > t.querySelector('span').clientWidth + 1 }));
    const tile = q('.hd-tile'), body = q('.hd-body'), sheet = q('#screen-homedecor .sheet'), done = q('#hd-done');
    return { tabs, tileH: tile.height, tileW: tile.width, bodyH: body.height, sheetBottom: sheet.bottom, vh: innerHeight, sheetRight: sheet.right, vw: innerWidth,
      doneH: done.height, scrollX: document.documentElement.scrollWidth > innerWidth };
  });
  ok('360x640: every tab is a big enough target and its label fits ' + JSON.stringify(fit.tabs.map(t => Math.round(t.w) + 'x' + Math.round(t.h) + (t.clip ? '!' : ''))),
    fit.tabs.every(t => t.h >= 44 && t.w >= 44 && !t.clip));
  ok('360x640: the panel fits the screen, tiles are big (' + Math.round(fit.tileW) + 'x' + Math.round(fit.tileH) + '), and there is room to scroll them (' + Math.round(fit.bodyH) + 'px) ' + JSON.stringify({ b: Math.round(fit.sheetBottom), r: Math.round(fit.sheetRight), done: Math.round(fit.doneH), sx: fit.scrollX }),
    fit.sheetBottom <= fit.vh && fit.sheetRight <= fit.vw && fit.tileH >= 44 && fit.bodyH >= 120 && fit.doneH >= 44 && !fit.scrollX);
  await p2.screenshot({ path: SHOTS + 'panel-360x640.png' });
  await p2.click('.hd-tab[data-kind=item]'); await p2.waitForTimeout(150);
  await p2.screenshot({ path: SHOTS + 'panel-360x640-things.png' });
  await p2.click('.hd-tab[data-kind=quilt]'); await p2.waitForTimeout(150);
  await p2.click('.hd-tile[data-id=patch]'); await p2.waitForTimeout(150);
  await p2.screenshot({ path: SHOTS + 'panel-360x640-tryon.png' });

  ok('no page errors ' + [...new Set(errs)].join(' | '), errs.length === 0);
  console.log(r.join('\n'));
  const fails = r.filter(x => x.startsWith('FAIL')).length;
  console.log('\n' + (r.length - fails) + '/' + r.length + ' passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
