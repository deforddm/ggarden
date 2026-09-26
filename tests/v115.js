/* v1.15: Guin's fix-it list, the Critter Compendium, unique Cookie, the
   marsh water and the new grove creatures. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForTimeout(700);
  await p.click('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const clearPops = () => p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    document.querySelectorAll('.panel').forEach(e => e.classList.add('hidden'));
  });
  await clearPops();

  /* ---------- the marsh has water, and fish in it ---------- */
  const marsh = await p.evaluate(() => {
    const W = GG.World, F = GG.Fishing;
    let cells = 0; for (let i = 0; i < W.mask.length; i++) if (W.mask[i] === W.KIND.MARSH) cells++;
    const pool = W.marshPools[1];
    // stand on the bank just north of a pool and look for somewhere to cast
    let bank = null;
    for (let dy = pool.ry; dy < pool.ry + 90; dy += 6) {
      const y = pool.y - dy;
      if (!W.isWater(pool.x, y) && !W.blocked(pool.x, y, 8)) { bank = { x: pool.x, y: y - 6 }; break; }
    }
    GG.Player.reset(bank.x, bank.y); GG.Player.angle = Math.PI / 2; GG.Player.dir = 'down';
    const cast = F.castTarget(GG.Player);
    return {
      cells, name: W.placeName(pool.x, pool.y), water: F.waterAt(pool.x, pool.y),
      deep: W.isDeepWater(pool.x, pool.y), fishable: W.marshPools.every(m => F.fishable(m.x, m.y)),
      eligible: F.eligible('swamp').map(c => c.f.id), cast: !!cast,
      castWater: cast ? F.waterAt(cast.x, cast.y) : null,
      duckweed: W.props.filter(q => q.type === 'duckweed' && W.waterKind(q.x, q.y) === W.KIND.MARSH).length,
      reachable: !W.blocked(bank.x, bank.y, 6)
    };
  });
  ok('the marsh has open water (' + marsh.cells + ' cells)', marsh.cells > 1000);
  ok('the water is the Cattail Marsh', marsh.name === 'Cattail Marsh' && marsh.water === 'swamp');
  ok('every marsh pool can be fished', marsh.fishable);
  ok('seven marsh fish can bite there (' + marsh.eligible.length + ')', marsh.eligible.length === 7 && marsh.eligible.indexOf('pacific_lamprey') >= 0);
  ok('she can cast into it from the bank', marsh.cast && marsh.castWater === 'swamp');
  ok('it is too deep to walk into', marsh.deep);
  ok('duckweed floats on it (' + marsh.duckweed + ')', marsh.duckweed > 15);

  /* ---------- the lava tube button ---------- */
  await p.evaluate(() => { const W = GG.World; W.bootBrush.used = false; GG.Player.reset(W.caveMouth.x, W.caveMouth.y + 30); });
  await p.waitForTimeout(400);
  const btn1 = await p.$eval('#btn-a', e => e.textContent);
  await p.click('#btn-a'); await p.waitForTimeout(300);
  const stillOut = await p.evaluate(() => GG.debugScene ? GG.debugScene() : (GG.Critters.room ? 'cave' : 'world'));
  await p.evaluate(() => { GG.World.bootBrush.used = true; });
  await p.waitForTimeout(300);
  const btn2 = await p.$eval('#btn-a', e => e.textContent);
  await p.click('#btn-a'); await p.waitForTimeout(500);
  const inCave = await p.evaluate(() => !!GG.Critters.room);
  ok('boots first: the button says so (' + btn1 + ')', /BOOTS/.test(btn1));
  ok('and tapping it does not go in yet', stillOut !== 'cave');
  ok('then there is a GO IN button at the lava tube (' + btn2 + ')', /GO IN/.test(btn2));
  ok('and it takes her into the cave', inCave);

  /* ---------- LOOK in the cave, and only once each ---------- */
  const caveLook = await p.evaluate(() => {
    GG.Critters.clear();
    const P = GG.Player;
    /* well inside, away from the way out (the exit button wins there) */
    P.reset(GG.Cave.START.x + 320, GG.Cave.START.y);
    GG.Critters.add(GG.BUG_BY_ID.ice_crawler, P.x + 30, P.y + 6);
    return true;
  });
  await p.waitForTimeout(300);
  const lookBtn = await p.$eval('#btn-a', e => e.textContent);
  ok('an ice crawler in the cave gets a LOOK button (' + lookBtn + ')', caveLook && /LOOK/.test(lookBtn));
  await p.click('#btn-a'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => {
    const b = GG.Critters.list.find(c => c.def.id === 'ice_crawler');
    return { looked: !!(b && b.looked), again: !!GG.Critters.nearestLookOnly(GG.Player, 200), seen: GG.Save.hasSeen('ice_crawler') };
  });
  await clearPops();
  await p.waitForTimeout(300);
  const lookBtn2 = await p.$eval('#btn-a', e => e.textContent);
  ok('looking at her once meets her', after.looked && after.seen);
  ok('and she cannot be looked at again and again', !after.again && !/LOOK/.test(lookBtn2));
  // out again
  await p.evaluate(() => { GG.debugSetScene && GG.debugSetScene('world'); GG.Critters.room = null; GG.Critters.clear(); });

  /* ---------- stings ---------- */
  const sting = await p.evaluate(() => {
    const out = {};
    const P = GG.Player;
    ['honeybee', 'bumblebee', 'yellowjacket'].forEach(id => {
      GG.Critters.clear(); P.stingCool = 0; P.stun = 0;
      GG.Critters.add(GG.BUG_BY_ID[id], P.x, P.y - 14);
      const b = GG.Critters.list[0]; b.angry = 5; b.z = 0;
      const def = GG.Critters.checkSting(P);
      out[id] = { stung: !!def, stillHere: GG.Critters.list.indexOf(b) >= 0, line: GG.stingLine(GG.BUG_BY_ID[id]) };
    });
    out.everyStinger = GG.BUGS.filter(b => b.sting).every(b => !!GG.STING_LINES[b.id]);
    out.ant = GG.stingLine(GG.BUG_BY_ID.thatching_ant);
    return out;
  });
  ok('a honeybee dies of stinging you', sting.honeybee.stung && !sting.honeybee.stillHere);
  ok('a bumblebee does not - she flies off', sting.bumblebee.stung && sting.bumblebee.stillHere);
  ok('nor does a yellowjacket', sting.yellowjacket.stung && sting.yellowjacket.stillHere);
  ok('the message names the right animal', /bumblebee/i.test(sting.bumblebee.line) && /yellowjacket/i.test(sting.yellowjacket.line) && !/bumblebee/i.test(sting.yellowjacket.line));
  ok('every stinger has its own true line', sting.everyStinger);
  ok('the thatching ant\'s line says it was a bite', /no stinger/i.test(sting.ant) && /bite/i.test(sting.ant));

  /* ---------- hybrid tanks ---------- */
  const tanks = await p.evaluate(() => {
    const d = GG.Save.data;
    d.unlockedDecor = GG.DECOR.map(x => x.id).concat(GG.TANK_BGS.map(x => 'bg_' + x.id));
    d.terrariums = [
      { name: 'Hybrid', type: 'hybrid', bg: 'riverbank', bugs: [], fish: [], decor: [], friends: [] },
      { name: 'Fish Tank', type: 'aquarium', bg: 'clear', bugs: [], fish: [], decor: [], friends: [] }
    ];
    GG.Save.save();
    const T = GG.Terrarium; T.index = 0;
    const H = GG.TANK_TYPE_BY_ID.hybrid, A = GG.TANK_TYPE_BY_ID.aquarium;
    ['monarch','ladybug','grasshopper','cricket','bumblebee','hoverfly','katydid','earwig','pillbug'].forEach(i => T.addItem('bug', i));
    ['bluegill','catfish','koi','bass','perch','carp','pike'].forEach(i => T.addItem('fish', i));
    T.addItem('decor', 'seagrass'); T.addItem('decor', 'treasure'); T.addItem('decor', 'fern');
    const tk = d.terrariums[0], b = T.bands(tk);
    const sea = tk.decor.find(x => x.id === 'seagrass'), tr = tk.decor.find(x => x.id === 'treasure'), fern = tk.decor.find(x => x.id === 'fern');
    return {
      hMax: [H.maxBugs, H.maxFish], aMax: A.maxBugs,
      bugs: tk.bugs.length, fish: tk.fish.length,
      seaUnder: sea && sea.y > b.waterTop + 40, treasureUnder: tr && tr.y > b.waterTop + 40,
      fernOnBank: fern && fern.y < b.waterTop
    };
  });
  ok('a hybrid tank holds 8 bugs and 6 fish', tanks.hMax[0] === 8 && tanks.hMax[1] === 6 && tanks.bugs === 8 && tanks.fish === 6);
  ok('a fish tank holds 8 rock-pool creatures', tanks.aMax === 8);
  ok('water decorations go under the water in a hybrid', tanks.seaUnder && tanks.treasureUnder);
  ok('and land ones stay on the bank', tanks.fernOnBank);
  const crab = await p.evaluate(() => {
    const T = GG.Terrarium, tk = GG.Save.data.terrariums[0];
    tk.bugs = []; T._motion = null;
    T.addItem('bug', 'shore_crab'); T.addItem('bug', 'sea_star');
    const b = T.bands(tk);
    let crabHigh = 1e9, starHigh = 1e9;
    for (let i = 0; i < 1400; i++) {
      T.step(0.05);
      tk.bugs.forEach(it => {
        const m = T.motionFor(it);
        if (it.id === 'shore_crab') crabHigh = Math.min(crabHigh, m.ly);
        else starHigh = Math.min(starHigh, m.ly);
      });
    }
    return { crabHigh, starHigh, ground: b.ground, waterTop: b.waterTop, walks: GG.walksAshore(GG.BUG_BY_ID.shore_crab) && GG.walksAshore(GG.BUG_BY_ID.hermit_crab) && !GG.walksAshore(GG.BUG_BY_ID.sea_star) };
  });
  ok('crabs are the ones that walk ashore', crab.walks);
  ok('a crab climbs up onto the bank (' + Math.round(crab.crabHigh) + ' vs waterline ' + crab.waterTop + ')', crab.crabHigh < crab.waterTop);
  ok('a sea star stays under the water (' + Math.round(crab.starHigh) + ')', crab.starHigh > crab.waterTop);

  /* ---------- the Critter Compendium ---------- */
  await clearPops();
  const menuText = await p.evaluate(() => document.getElementById('menu-book').textContent);
  ok('the menu button says Critter Compendium', /Critter Compendium/.test(menuText));
  const comp = await p.evaluate(() => {
    GG.Save.addCatch('monarch'); GG.Save.addFish('bluegill');
    GG.Book.open();
    const cards = Array.from(document.querySelectorAll('.shelfbook'));
    return {
      title: document.getElementById('book-title').textContent,
      cards: cards.map(c => c.getAttribute('data-open')),
      names: cards.map(c => c.querySelector('.bk').textContent),
      drawn: cards.every(c => { const cv = c.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 10) n++; return n > 300; }),
      home: !!document.querySelector('#book-tabs .tab[data-book="home"].on')
    };
  });
  await p.screenshot({ path: __dirname + '/shots/v115-compendium.png' });
  ok('it opens on the contents page', comp.title === 'Critter Compendium' && comp.home);
  ok('with four books on the shelf', comp.cards.join() === 'bugs,fish,friends,fruit');
  ok('named Bug, Fish, Friends and Garden Book', comp.names.join() === 'Bug Book,Fish Book,Friends Book,Garden Book');
  ok('each with a picture on it', comp.drawn);
  await p.click('.shelfbook[data-open="fish"]'); await p.waitForTimeout(300);
  const fishBook = await p.evaluate(() => ({ title: document.getElementById('book-title').textContent,
    kicker: document.getElementById('book-kicker').textContent, cells: document.querySelectorAll('#book-grid .bugcell').length }));
  ok('tapping a book opens it inside the Compendium', fishBook.title === 'Fish Book' && /Compendium/.test(fishBook.kicker) && fishBook.cells === GGcount(36));
  function GGcount(n) { return n; }
  await p.click('#book-tabs .tab[data-book="home"]'); await p.waitForTimeout(300);
  ok('and the shelf tab goes back to all four', await p.evaluate(() => document.querySelectorAll('.shelfbook').length === 4));
  await p.evaluate(() => GG.UI.close('screen-book'));

  /* ---------- Cookie is unique ---------- */
  const cookie = await p.evaluate(() => {
    const F = GG.Friends, d = GG.Save.data, T = GG.Terrarium, out = {};
    out.flag = GG.animalIsUnique(GG.ANIMAL_BY_ID.cookie) && GG.ANIMALS.filter(a => a.unique).length === 1;
    GG.Save.addFriend('cookie'); GG.Save.addFriend('labrador');
    d.terrariums.push({ name: 'Back Garden', type: 'habitat', bg: 'backyard', bugs: [], fish: [], decor: [], friends: [] });
    d.terrariums.push({ name: 'Porch', type: 'habitat', bg: 'porch', bugs: [], fish: [], decor: [], friends: [] });
    const h1 = d.terrariums.length - 2, h2 = d.terrariums.length - 1;
    F.setCompanion('cookie');
    out.walking = F.uniqueWhere('cookie') === 'companion';
    T.index = h1; T.addItem('friend', 'cookie');
    out.movedToHabitat = d.companion !== 'cookie' && d.terrariums[h1].friends.some(f => f.id === 'cookie');
    T.index = h2; T.addItem('friend', 'cookie');
    out.onlyOneHabitat = !d.terrariums[h1].friends.some(f => f.id === 'cookie') && d.terrariums[h2].friends.some(f => f.id === 'cookie');
    F.setCompanion('labrador'); F.setCompanion('cookie');
    out.labHome = d.homeFriends.indexOf('labrador') >= 0;
    out.cookieOut = d.terrariums.every(t => !(t.friends || []).some(f => f.id === 'cookie')) && d.companion === 'cookie';
    F.setCompanion('labrador');   // cookie goes home
    out.cookieHome = d.homeFriends.indexOf('cookie') >= 0 && d.companion === 'labrador';
    // the garden never spawns a second Cookie while she is home
    F.list.length = 0;
    let spawned = 0;
    for (let i = 0; i < 400; i++) { F.spawnNear(GG.World.HOUSE.x, GG.World.HOUSE.y + 300, 60, 400); if (F.list.some(f => f.def.id === 'cookie')) spawned++; F.list.length = 0; }
    out.noSpawn = spawned === 0;
    // an old save with Cookie in three places at once is tidied up
    d.companion = 'cookie'; d.homeFriends = ['cookie', 'labrador'];
    d.terrariums[h1].friends = [{ id: 'cookie', x: 300, y: 320, s: 1, seed: 0.3 }];
    d.terrariums[h2].friends = [{ id: 'cookie', x: 300, y: 320, s: 1, seed: 0.3 }, { id: 'labrador', x: 200, y: 320, s: 1, seed: 0.4 }];
    GG.Save.tidyUnique();
    let places = (d.companion === 'cookie' ? 1 : 0) + d.homeFriends.filter(x => x === 'cookie').length;
    d.terrariums.forEach(t => (t.friends || []).forEach(f => { if (f.id === 'cookie') places++; }));
    out.tidied = places === 1 && d.terrariums[h2].friends.some(f => f.id === 'labrador');
    // the book page says so
    GG.Book.open('friends'); GG.Book.showDetail(GG.ANIMAL_BY_ID.cookie);
    const box = document.getElementById('friend-unique');
    out.page = box ? box.textContent : '';
    GG.UI.close('screen-book');
    return out;
  });
  ok('Cookie is the one unique friend', cookie.flag);
  ok('she can walk with you', cookie.walking);
  ok('putting her in a habitat takes her off your walk', cookie.movedToHabitat);
  ok('she is only ever in one habitat', cookie.onlyOneHabitat);
  ok('asking her along takes her out of the habitat', cookie.cookieOut && cookie.labHome);
  ok('and sending her home puts her at home', cookie.cookieHome);
  ok('no second Cookie wanders the garden while she is home', cookie.noSpawn);
  ok('an old save with Cookie in three places keeps just one', cookie.tidied);
  ok('her page says there is only one of her (' + cookie.page.slice(0, 40) + ')', /only one Cookie/.test(cookie.page) && /walking with you|cottage|visiting|garden/.test(cookie.page));

  /* ---------- the new grove creatures ---------- */
  const NEW = ['spotted_wing_drosophila','peachtree_borer','tent_caterpillar','japanese_beetle','mining_bee','leafroller',
    'bamboo_mite','grass_carrying_wasp','woodlouse_spider','leopard_slug','garden_springtail','zebra_jumper'];
  const grove = await p.evaluate((NEW) => {
    const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120;
    const c = cv.getContext('2d');
    const out = { missing: [], blank: [], short: [] };
    NEW.forEach(id => {
      const d = GG.BUG_BY_ID[id];
      if (!d) { out.missing.push(id); return; }
      c.clearRect(0, 0, 120, 120);
      GG.BugArt.draw(c, d, 60, 60, 2.4, -Math.PI / 2, 0.5);
      const px = c.getImageData(0, 0, 120, 120).data; let n = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 12) n++;
      if (n < 80) out.blank.push(id);
      if (!d.facts || d.facts.length < 4) out.short.push(id);
    });
    out.cherry = GG.BUGS.filter(b => b.habitats.indexOf('cherry') >= 0).length;
    out.bamboo = GG.BUGS.filter(b => b.habitats.indexOf('bamboo') >= 0).length;
    out.admiral = GG.BUG_BY_ID.lorquins_admiral.habitats.indexOf('cherry') >= 0;
    out.chain = GG.hunts('woodlouse_spider', 'pillbug') && GG.hunts('zebra_jumper', 'bamboo_aphid') && GG.hunts('earwig', 'spotted_wing_drosophila');
    out.bee = !GG.BUG_BY_ID.mining_bee.sting;
    return out;
  }, NEW);
  ok('twelve new grove creatures (' + grove.missing.join(',') + ')', grove.missing.length === 0);
  ok('every one of them draws', grove.blank.length === 0);
  ok('each has four facts', grove.short.length === 0);
  ok('the Cherry Grove has more to find (' + grove.cherry + ')', grove.cherry >= 18);
  ok('the Bamboo Grove has more to find (' + grove.bamboo + ')', grove.bamboo >= 14);
  ok('Lorquin\'s Admiral visits the cherries too', grove.admiral);
  ok('and they are in the food chain', grove.chain);

  /* ---------- the map shows the landmarks ---------- */
  await p.tap('#btn-menu'); await p.waitForTimeout(600);
  const legend = await p.evaluate(() => document.getElementById('screen-menu').textContent);
  ok('the map tells her what the landmarks are', /lava tube/.test(legend) && /footbridge/.test(legend));
  await p.screenshot({ path: __dirname + '/shots/v115-mapmenu.png' });

  console.log(r.join('\n'));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) || errs.length ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
