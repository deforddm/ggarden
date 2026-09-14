/* Garden Friends: the roster, the befriending ritual, the companion,
   the Friends Book and the Garden Habitat. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(800);
  await p.click('#btn-play');
  await p.waitForTimeout(700);

  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);

  /* ---------- the roster ---------- */
  const roster = await p.evaluate(() => {
    const bad = { noShape: [], noWay: [], noFacts: [], shortFact: [], noManners: [],
      shortManners: [], noMeasure: [], badTime: [], badPlace: [], dupe: [],
      badRarity: [], badPatience: [], badKeep: [], badSize: [], noFamily: [] };
    const TIMES = ['morning', 'day', 'evening', 'night', 'any'];
    const PLACES = ['meadow', 'garden', 'forest', 'pond', 'hill', 'orchard', 'riverbank', 'beach', 'shore'];
    const FAMS = Object.keys(GG.FAMILY_NAMES);
    const seen = {};
    GG.ANIMALS.forEach(a => {
      if (seen[a.id] || GG.BUG_BY_ID[a.id] || GG.FISH_BY_ID[a.id]) bad.dupe.push(a.id);
      seen[a.id] = 1;
      if (!GG.AnimalArt.shapes[a.art.shape]) bad.noShape.push(a.id);
      if (!GG.FRIEND_WAYS[a.way]) bad.noWay.push(a.id);
      if (FAMS.indexOf(a.family) < 0) bad.noFamily.push(a.id);
      if (!a.facts || a.facts.length < 2) bad.noFacts.push(a.id);
      (a.facts || []).forEach(f => { if (f.length < 30) bad.shortFact.push(a.id); });
      if (!a.manners) bad.noManners.push(a.id);
      else if (a.manners.length < 40) bad.shortManners.push(a.id);
      if (!a.measure) bad.noMeasure.push(a.id);
      (a.times || []).forEach(t => { if (TIMES.indexOf(t) < 0) bad.badTime.push(a.id + ':' + t); });
      (a.places || []).forEach(t => { if (PLACES.indexOf(t) < 0) bad.badPlace.push(a.id + ':' + t); });
      if (!(a.rarity >= 1 && a.rarity <= 5)) bad.badRarity.push(a.id);
      if (!(a.patience >= 2 && a.patience <= 8)) bad.badPatience.push(a.id);
      if (!(a.keep >= 20 && a.keep <= 200)) bad.badKeep.push(a.id);
      if (!(a.size > 0.1 && a.size < 2)) bad.badSize.push(a.id);
    });
    const fams = {};
    GG.ANIMALS.forEach(a => { fams[a.family] = (fams[a.family] || 0) + 1; });
    return { bad, count: GG.ANIMALS.length, fams, ways: Object.keys(GG.FRIEND_WAYS).length };
  });
  Object.keys(roster.bad).forEach(k => ok('roster ' + k + ' ' + JSON.stringify(roster.bad[k]), !roster.bad[k].length));
  ok('23 animals (got ' + roster.count + ')', roster.count === 23);
  ok('all six families present ' + JSON.stringify(roster.fams), Object.keys(roster.fams).length === 6);
  ok('seven befriending methods', roster.ways === 7);

  /* every method's button text and blurb exist */
  const ways = await p.evaluate(() => {
    const bad = [];
    Object.keys(GG.FRIEND_WAYS).forEach(k => {
      const w = GG.FRIEND_WAYS[k];
      if (!w.verb || !w.btn || !w.sub || !w.waiting || !w.blurb) bad.push(k);
      if (w.btn.length > 11) bad.push(k + ':button-text-too-long');
      if (w.sub.length > 18) bad.push(k + ':sub-too-long');
    });
    return bad;
  });
  ok('every method has short button text and a blurb ' + JSON.stringify(ways), !ways.length);

  /* the art draws something for every animal */
  const drew = await p.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = 240; cv.height = 240;
    const c = cv.getContext('2d');
    const blank = [];
    GG.ANIMALS.forEach(a => {
      c.clearRect(0, 0, 240, 240);
      GG.AnimalArt.draw(c, a, 120, 170, GG.animalFit(a, 120), false, 0.6);
      const d = c.getImageData(0, 0, 240, 240).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 12) n++;
      if (n < 300) blank.push(a.id + ':' + n);
    });
    return blank;
  });
  ok('every animal draws ' + JSON.stringify(drew), !drew.length);

  /* ---------- the ritual ---------- */
  await p.evaluate(() => {
    GG.Save.data.friends = {}; GG.Save.data.companion = null;
    GG.Friends.clear();
    GG.Friends.add(GG.ANIMAL_BY_ID.green_frog, GG.Player.x + 36, GG.Player.y + 6);
  });
  await p.waitForTimeout(500);
  let s = await p.evaluate(() => {
    const btn = document.getElementById('btn-friend');
    return { shown: !btn.classList.contains('hidden'), html: btn.innerHTML };
  });
  ok('FRIEND button appears next to an animal', s.shown);
  ok('button says the right thing (' + s.html + ')', /KEEP STILL/.test(s.html));

  await p.click('#btn-friend');
  await p.waitForTimeout(300);
  ok('tapping it starts the wait', await p.evaluate(() => !!GG.Friends.busy));

  /* fidgeting slips the ring back but never empties it */
  await p.waitForTimeout(900);
  const ringBefore = await p.evaluate(() => GG.Friends.busy ? GG.Friends.busy.ring : -1);
  await p.keyboard.down('d');             // a few steps on the spot
  await p.waitForTimeout(600);
  const ringAfter = await p.evaluate(() => GG.Friends.busy ? GG.Friends.busy.ring : -1);
  await p.keyboard.up('d');
  ok('the ring fills while she is still (' + ringBefore.toFixed(2) + ')', ringBefore > 0.1);
  ok('walking about slips the ring back (' + ringAfter.toFixed(2) + ')', ringAfter < ringBefore);
  ok('but it never empties', ringAfter > 0);
  ok('and the animal is still there', await p.evaluate(() => !!GG.Friends.busy));

  await p.waitForTimeout(4500);
  const done = await p.evaluate(() => ({
    pop: !document.getElementById('friend-pop').classList.contains('hidden'),
    name: document.getElementById('friend-name').textContent,
    manners: document.getElementById('friend-manners').querySelector('span').textContent,
    newBadge: document.getElementById('friend-new').style.display,
    saved: GG.Save.hasFriend('green_frog'),
    sparkles: GG.Save.data.sparkles
  }));
  ok('the friend card appears', done.pop);
  ok('it names the animal (' + done.name + ')', done.name === 'Green Frog');
  ok('it shows the good-manners line', done.manners.length > 40);
  ok('it says NEW FRIEND the first time', done.newBadge === 'inline-block');
  ok('the friend is saved', done.saved);
  ok('sparkles were awarded', done.sparkles > 0);

  /* ---------- the companion ---------- */
  await p.click('#friend-along');
  await p.waitForTimeout(1400);
  const comp = await p.evaluate(() => {
    const c = GG.Friends.companion;
    return { id: GG.Save.data.companion, live: !!c,
      apart: c ? GG.dist(c.x, c.y, GG.Player.x, GG.Player.y) : -1 };
  });
  ok('the companion is saved', comp.id === 'green_frog');
  ok('the companion is following', comp.live);
  ok('it keeps out of her way (' + comp.apart.toFixed(0) + 'px)', comp.apart > 8 && comp.apart < 90);

  /* ---------- the Friends Book ---------- */
  await p.evaluate(() => { GG.Book.open(); GG.Book.tab = 'friends'; GG.Book.showGrid(); });
  await p.waitForTimeout(400);
  const book = await p.evaluate(() => ({
    title: document.getElementById('book-title').textContent,
    progress: document.getElementById('progress').textContent,
    cells: document.querySelectorAll('#book-grid .bugcell').length,
    got: document.querySelectorAll('#book-grid .bugcell.got').length,
    row: !!document.getElementById('companion-row')
  }));
  ok('the Friends Book opens', book.title === 'Friends Book');
  ok('it lists every animal', book.cells === 23);
  ok('one is found (' + book.progress + ')', book.got === 1 && book.progress === '1 / 23');
  ok('the companion strip is there', book.row);

  const detail = await p.evaluate(() => {
    GG.Book.showDetail(GG.ANIMAL_BY_ID.green_frog);
    const t = document.getElementById('book-detail').textContent;
    return { hasWay: t.indexOf('keep still') >= 0 || t.indexOf('Crouch down') >= 0,
      hasManners: t.indexOf('Good manners') >= 0,
      hasPlaces: t.indexOf('Found in') >= 0 };
  });
  ok('the page explains how to befriend it', detail.hasWay);
  ok('the page shows the good manners', detail.hasManners);
  ok('the page says where it lives', detail.hasPlaces);
  await p.evaluate(() => GG.UI.close('screen-book'));

  /* ---------- the Garden Habitat ---------- */
  const hab = await p.evaluate(() => {
    const d = GG.Save.data;
    ['ruby_hummingbird', 'corgi', 'tabby', 'little_brown_bat'].forEach(id => GG.Save.addFriend(id));
    GG.DECOR.forEach(x => { if (d.unlockedDecor.indexOf(x.id) < 0) d.unlockedDecor.push(x.id); });
    d.terrariums.push({ name: 'Habitat', type: 'habitat', bg: GG.defaultSceneFor('habitat'),
      decor: [], bugs: [], fish: [], friends: [] });
    const T = GG.Terrarium;
    T.index = d.terrariums.length - 1;
    T.open(); T.tab = 'friends'; T.buildTray();
    ['green_frog', 'ruby_hummingbird', 'corgi', 'tabby', 'little_brown_bat'].forEach(id => T.addItem('friend', id));
    T.addItem('friend', 'green_frog');            // already there - should be refused
    T.addItem('bug', 'monarch');                  // no bugs in a habitat
    T.addItem('decor', 'feeder');
    T.addItem('decor', 'seagrass');               // sea grass does not belong in a garden
    const tk = T.tank();
    return {
      tab: T.tab,
      friends: tk.friends.length,
      bugs: tk.bugs.length,
      decor: tk.decor.map(x => x.id),
      habitatDecor: GG.decorFor('habitat').map(x => x.id),
      terrariumTakesHabitatDecor: GG.decorFits(GG.DECOR_BY_ID.kennel, 'terrarium'),
      aquariumTakesHabitatDecor: GG.decorFits(GG.DECOR_BY_ID.kennel, 'aquarium'),
      scenes: GG.scenesFor('habitat').map(x => x.id)
    };
  });
  ok('friends go in a habitat (' + hab.friends + ')', hab.friends === 5);
  ok('the same friend cannot be invited twice', hab.friends === 5);
  ok('bugs do not go in a habitat', hab.bugs === 0);
  ok('the feeder goes in', hab.decor.indexOf('feeder') >= 0);
  ok('sea grass does not', hab.decor.indexOf('seagrass') < 0);
  ok('a kennel is not offered for a terrarium', !hab.terrariumTakesHabitatDecor);
  ok('a kennel is not offered for a fish tank', !hab.aquariumTakesHabitatDecor);
  ok('the habitat has its own scenes (' + hab.scenes.length + ')', hab.scenes.length >= 5);
  ok('habitat decor list is stocked (' + hab.habitatDecor.length + ')', hab.habitatDecor.length >= 20);

  /* everything in the habitat actually paints */
  await p.waitForTimeout(1200);
  const painted = await p.evaluate(() => {
    const cv = document.getElementById('tank-canvas');
    const c = cv.getContext('2d');
    const d = c.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 12) n++;
    return n;
  });
  ok('the habitat draws (' + painted + ' px)', painted > 100000);

  /* the animals stay inside their patch of garden */
  const inside = await p.evaluate(async () => {
    await new Promise(r => setTimeout(r, 2500));
    const T = GG.Terrarium, tk = T.tank(), b = T.bands(tk);
    const out = [];
    tk.friends.forEach(f => {
      const m = T.motionFor(f);
      const band = T.friendBand(GG.ANIMAL_BY_ID[f.id], b);
      if (m.lx < 30 || m.lx > 610) out.push(f.id + ':x' + Math.round(m.lx));
      if (m.ly < band[0] - 2 || m.ly > band[1] + 2) out.push(f.id + ':y' + Math.round(m.ly));
    });
    return out;
  });
  ok('nobody wanders out of the garden ' + JSON.stringify(inside), !inside.length);

  /* it all survives a save and a reload */
  await p.evaluate(() => GG.Save.save());
  await p.reload();
  await p.waitForTimeout(900);
  const after = await p.evaluate(() => {
    const tk = GG.Save.data.terrariums.filter(t => t.type === 'habitat')[0];
    return { friends: tk ? tk.friends.length : -1, bg: tk ? tk.bg : '',
      saved: GG.Save.totalFriends(), companion: GG.Save.data.companion };
  });
  ok('the habitat survives a reload', after.friends === 5);
  ok('its scene is not reset', after.bg === 'backyard');
  ok('the Friends Book survives a reload (' + after.saved + ')', after.saved === 5);
  ok('the companion survives a reload', after.companion === 'green_frog');

  /* a companion nobody has befriended is dropped */
  const stale = await p.evaluate(() => {
    GG.Save.data.companion = 'african_grey';
    GG.Save.save();
    GG.Save.load();
    return GG.Save.data.companion;
  });
  ok('a companion you have not befriended is dropped', stale === null);


  /* the reload above dropped us back to the title screen; start playing again
     so the game loop is actually running for the chases below */
  await p.evaluate(() => { const b = document.getElementById('btn-play'); if (b) b.click(); });
  await p.waitForTimeout(900);
  await p.evaluate(() => { GG.UI.close('screen-news'); GG.UI.close('screen-book'); });
  await p.waitForTimeout(300);

  /* ---------- Cookie ---------- */
  const cookie = await p.evaluate(() => {
    const d = GG.ANIMAL_BY_ID.cookie;
    return d ? { name: d.name, family: d.family, ears: d.art.ears, face: d.art.face,
      curl: !!d.art.curl, facts: d.facts.length, manners: d.manners.length } : null;
  });
  ok('Cookie the husky is in the roster', cookie && cookie.name === 'Cookie' && cookie.family === 'dog');
  ok("she has a husky's upright ears, bandit face and curled tail",
    cookie && cookie.ears === 'up' && cookie.face === 'bandit' && cookie.curl);

  /* ---------- walking ---------- */
  const walk = await p.evaluate(() => {
    function ink(id, gait) {
      const cv = document.createElement('canvas'); cv.width = 220; cv.height = 220;
      const c = cv.getContext('2d');
      GG.AnimalArt.draw(c, GG.ANIMAL_BY_ID[id], 110, 170, GG.animalFit(GG.ANIMAL_BY_ID[id], 110),
        false, 0.55, gait);
      return c.getImageData(0, 0, 220, 220).data.join(',');
    }
    const out = {};
    ['cookie', 'labrador', 'tabby', 'maine_coon', 'budgie'].forEach(id => {
      out[id] = ink(id, 0) !== ink(id, 1);
    });
    return out;
  });
  Object.keys(walk).forEach(k => ok('a walking ' + k + ' is drawn differently from a still one', walk[k]));

  /* ---------- silly hats ---------- */
  const hats = await p.evaluate(() => {
    const bad = [];
    const ids = ['cookie', 'tabby', 'green_frog', 'ruby_hummingbird', 'little_brown_bat', 'budgie'];
    GG.HATS.forEach(h => {
      ids.forEach(id => {
        const def = GG.ANIMAL_BY_ID[id];
        const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
        const c = cv.getContext('2d');
        GG.AnimalArt.draw(c, def, 100, 150, GG.animalFit(def, 90), false, 0.5, 0, null);
        const plain = c.getImageData(0, 0, 200, 200).data.join(',');
        c.clearRect(0, 0, 200, 200);
        GG.AnimalArt.draw(c, def, 100, 150, GG.animalFit(def, 90), false, 0.5, 0, h.id);
        if (c.getImageData(0, 0, 200, 200).data.join(',') === plain) bad.push(h.id + ':' + id);
      });
    });
    return { n: GG.HATS.length, bad };
  });
  ok('there are plenty of hats (' + hats.n + ')', hats.n >= 10);
  ok('every hat draws on every kind of friend ' + JSON.stringify(hats.bad.slice(0, 5)), !hats.bad.length);

  const hatSave = await p.evaluate(() => {
    GG.Save.setHat('green_frog', 'wizard');
    const a = GG.Save.hatOf('green_frog');
    GG.Save.save(); GG.Save.load();
    const b2 = GG.Save.hatOf('green_frog');
    GG.Save.setHat('green_frog', null);
    return { a, b2, cleared: GG.Save.hatOf('green_frog') };
  });
  ok('a hat is remembered and survives a reload', hatSave.a === 'wizard' && hatSave.b2 === 'wizard');
  ok('and it can be taken off again', hatSave.cleared === null);

  /* ---------- habits ---------- */
  const habits = await p.evaluate(async () => {
    const W = GG.World, F = GG.Friends;
    let spot = null;
    for (let rr = 40; rr < 400 && !spot; rr += 12) {
      for (let a = 0; a < Math.PI * 2; a += 0.3) {
        const x = 620 + Math.cos(a) * rr, y = 2020 + Math.sin(a) * rr;
        if (!W.isWater(x, y) && !W.blocked(x, y, 12) && F.waterNear(x, y, 70)) { spot = { x, y }; break; }
      }
    }
    if (!spot) return { noSpot: true };
    GG.Player.reset(spot.x, spot.y);
    F.clear();
    F.add(GG.ANIMAL_BY_ID.tabby, spot.x, spot.y);
    F.add(GG.ANIMAL_BY_ID.green_frog, spot.x + 10, spot.y + 10);
    const cat = F.list[0], frog = F.list[1];
    const catStart = F.waterNear(cat.x, cat.y, 200);
    let wetEver = false;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (W.isWater(cat.x, cat.y)) wetEver = true;
    }
    const catEnd = F.waterNear(cat.x, cat.y, 200);
    const frogEnd = F.waterNear(frog.x, frog.y, 220);
    return {
      wetEver,
      frogNearWater: !!frogEnd,
      catStart: catStart ? Math.round(catStart.dist) : 999,
      catEnd: catEnd ? Math.round(catEnd.dist) : 999
    };
  });
  ok('a cat never puts a paw in the water', habits.noSpot || !habits.wetEver);
  ok('a cat keeps its distance from it (' + habits.catStart + ' -> ' + habits.catEnd + ')',
    habits.noSpot || habits.catEnd >= habits.catStart);
  ok('a frog stays near the water', habits.noSpot || habits.frogNearWater);

  const chase = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    /* back to the dry garden - a cat beside the pond is busy avoiding it */
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 90);
    await new Promise(r => setTimeout(r, 200));
    F.clear(); GG.Critters.clear();
    GG.Critters.add(GG.BUG_BY_ID.monarch, P.x + 90, P.y);
    F.add(GG.ANIMAL_BY_ID.tabby, P.x + 10, P.y);
    const cat = F.list[0];
    const bug0 = GG.Critters.list[0];
    const d0 = GG.dist(cat.x, cat.y, bug0.x, bug0.y);
    let closest = d0, sawChase = false;
    for (let i = 0; i < 80; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (GG.Critters.list.indexOf(bug0) < 0) break;
      const d = GG.dist(cat.x, cat.y, bug0.x, bug0.y);
      if (d < closest) closest = d;
      if (cat.chase > 0) sawChase = true;
    }
    return { d0: Math.round(d0), closest: Math.round(closest), sawChase,
      butterflyAlive: GG.Critters.list.indexOf(bug0) >= 0 };
  });
  ok('a cat goes after a butterfly (' + chase.d0 + ' -> ' + chase.closest + ')',
    chase.sawChase || chase.closest < chase.d0);
  ok('and the butterfly is never caught', chase.butterflyAlive);

  /* ---------- the food chain ---------- */
  const chain = await p.evaluate(() => {
    const bad = [];
    Object.keys(GG.EATS).forEach(pred => {
      if (!GG.BUG_BY_ID[pred] && !GG.FISH_BY_ID[pred]) bad.push('predator ' + pred);
      GG.EATS[pred].forEach(prey => {
        if (!GG.BUG_BY_ID[prey] && !GG.FISH_BY_ID[prey]) bad.push('prey ' + prey);
        if (pred === prey) bad.push('self ' + pred);
      });
    });
    return {
      bad,
      ladybugEatsAphid: GG.hunts('ladybug', 'aphid'),
      aphidEatsLadybug: GG.hunts('aphid', 'ladybug'),
      craneFlyMyth: GG.hunts('crane_fly', 'housefly'),
      millipedeMyth: !!GG.EATS.millipede,
      boatmanMyth: !!GG.EATS.boatman,
      monarchSafe: GG.eatenByList('monarch').length === 0,
      friendsNeverHunt: GG.ANIMALS.every(a => !GG.EATS[a.id]),
      tidepoolIncluded: GG.eatsList('sea_star').length > 0 && GG.eatsList('shore_crab').length > 0,
      fishEatFish: GG.hunts('bass', 'bluegill'),
      fishEatBugs: GG.hunts('bluegill', 'mayfly'),
      bugsEatBugs: GG.hunts('mantis', 'cricket')
    };
  });
  ok('every id in the food chain is a real creature ' + JSON.stringify(chain.bad.slice(0, 4)), !chain.bad.length);
  ok('fish eat fish', chain.fishEatFish);
  ok('fish eat bugs', chain.fishEatBugs);
  ok('bugs eat bugs', chain.bugsEatBugs);
  ok('rock-pool creatures are in it too', chain.tidepoolIncluded);
  ok('tamed friends never hunt anything', chain.friendsNeverHunt);
  ok('it only goes one way (no aphid hunting a ladybug)',
    chain.ladybugEatsAphid && !chain.aphidEatsLadybug);
  ok('the crane-fly myth is not in it', !chain.craneFlyMyth);
  ok('millipedes and water boatmen are not predators',
    !chain.millipedeMyth && !chain.boatmanMyth);
  ok('nothing eats a monarch', chain.monarchSafe);

  /* Nothing below can be timed properly while a card is still on screen -
     the whole game loop pauses whenever a panel or a popup is open. */
  const unpause = () => p.evaluate(() => {
    GG.UI.hideCatch && GG.UI.hideCatch();
    GG.UI.hideFriend && GG.UI.hideFriend();
    document.getElementById('catch-pop').classList.add('hidden');
    document.getElementById('friend-pop').classList.add('hidden');
    (GG.UI.openPanels || []).slice().forEach(id => GG.UI.close(id));
    return GG.UI.anyOpen();
  });

  ok('nothing is left open before the chase', !(await unpause()));
  const chase2 = await p.evaluate(async () => {
    const P = GG.Player;
    GG.Critters.clear();
    GG.Critters.add(GG.BUG_BY_ID.tiger_beetle, P.x + 70, P.y + 50);
    GG.Critters.add(GG.BUG_BY_ID.ant, P.x + 140, P.y + 50);
    const hunter = GG.Critters.list[0], prey = GG.Critters.list[1];
    const d0 = GG.dist(hunter.x, hunter.y, prey.x, prey.y);
    let closest = d0, stalked = false, bolted = false;
    /* a hunt is a wander with a purpose, so give it long enough to land */
    for (let i = 0; i < 200; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (GG.Critters.list.indexOf(prey) < 0) break;
      const d = GG.dist(hunter.x, hunter.y, prey.x, prey.y);
      if (d < closest) closest = d;
      if (hunter.prey) stalked = true;
      if (prey.flee > 0) bolted = true;
      if (bolted) break;
    }
    return { d0: Math.round(d0), closest: Math.round(closest), stalked, bolted,
      preyAlive: GG.Critters.list.indexOf(prey) >= 0 };
  });
  ok('a tiger beetle picks out an ant to hunt', chase2.stalked);
  ok('and closes in on it (' + chase2.d0 + ' -> ' + chase2.closest + ')',
    chase2.closest < chase2.d0);
  ok('the ant bolts when it gets too close', chase2.bolted);
  ok('but it is never eaten', chase2.preyAlive);

  const chainBook = await p.evaluate(() => {
    GG.Book.open(); GG.Book.tab = 'bugs';
    GG.Book.showDetail(GG.BUG_BY_ID.mantis);
    const t = document.getElementById('book-detail').textContent;
    GG.UI.close('screen-book');
    return { hunts: t.indexOf('It hunts') >= 0, safe: t.indexOf('always gets away') >= 0 };
  });
  ok('the book says what a creature hunts', chainBook.hunts);
  ok('and promises everybody gets away', chainBook.safe);


  /* ---------- the friend who comes with you ---------- */
  await p.evaluate(() => {
    ['cookie', 'tabby', 'budgie'].forEach(id => GG.Save.addFriend(id));
    GG.Save.data.companion = null; GG.Save.data.homeFriends = []; GG.Save.save();
    GG.Friends.loadCompanion();
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 90);
  });
  await p.waitForTimeout(300);

  const noCopy = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    F.clear();
    F.add(GG.ANIMAL_BY_ID.cookie, P.x + 50, P.y);
    const before = F.list.filter(f => f.def.id === 'cookie').length;
    F.setCompanion('cookie');
    await new Promise(r => setTimeout(r, 2500));
    return { before, after: F.list.filter(f => f.def.id === 'cookie').length };
  });
  ok('the friend you invite leaves no copy behind (' + noCopy.before + ' -> ' + noCopy.after + ')',
    noCopy.before === 1 && noCopy.after === 0);

  const swap = await p.evaluate(() => {
    GG.Friends.setCompanion('tabby');
    return { companion: GG.Save.data.companion, home: GG.Save.data.homeFriends.slice(),
      toast: document.getElementById('toast').textContent };
  });
  ok('inviting a different friend swaps them over', swap.companion === 'tabby');
  ok('and sends the old one home', swap.home.indexOf('cookie') >= 0);
  ok('and says so (' + swap.toast + ')', /gone to wait at your house/.test(swap.toast));

  const reinvite = await p.evaluate(() => {
    GG.Friends.setCompanion('cookie');
    return { companion: GG.Save.data.companion, home: GG.Save.data.homeFriends.slice() };
  });
  ok('asking a friend back out takes them out of the house',
    reinvite.companion === 'cookie' && reinvite.home.indexOf('cookie') < 0);
  ok('and the one they replaced is waiting there instead', reinvite.home.indexOf('tabby') >= 0);

  /* ---------- indoors ---------- */
  await p.evaluate(() => {
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 34);
    GG.Input._actionQueued = true;
  });
  await p.waitForTimeout(1300);
  const indoors = await p.evaluate(async () => {
    if (GG.debugScene() !== 'house') return { notInside: true };
    GG.UI.hideCatch && GG.UI.hideCatch();
    document.getElementById('catch-pop').classList.add('hidden');
    document.getElementById('friend-pop').classList.add('hidden');
    (GG.UI.openPanels || []).slice().forEach(id => GG.UI.close(id));
    const c0 = GG.Friends.companion;
    const start = c0 ? { x: c0.x, y: c0.y } : null;
    const homeStart = (GG.Friends.homeList || []).map(f => ({ x: f.x, y: f.y }));
    GG.Input.keys['d'] = true;
    /* a friend pottering about wanders and pauses, and can wander back to
       where it started - so watch the whole window, not just the ends */
    let homeMax = 0;
    for (let i = 0; i < 26; i++) {
      await new Promise(r => setTimeout(r, 200));
      (GG.Friends.homeList || []).forEach((f, k) => {
        if (!homeStart[k]) return;
        homeMax = Math.max(homeMax, GG.dist(f.x, f.y, homeStart[k].x, homeStart[k].y));
      });
    }
    GG.Input.keys['d'] = false;
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 200));
      (GG.Friends.homeList || []).forEach((f, k) => {
        if (!homeStart[k]) return;
        homeMax = Math.max(homeMax, GG.dist(f.x, f.y, homeStart[k].x, homeStart[k].y));
      });
    }
    const c1 = GG.Friends.companion, H = GG.House;
    const homeNow = (GG.Friends.homeList || []).map(f => ({ x: f.x, y: f.y }));
    return {
      followed: c1 && start ? GG.dist(c1.x, c1.y, start.x, start.y) > 20 : false,
      gap: c1 ? Math.round(GG.dist(c1.x, c1.y, GG.Player.x, GG.Player.y)) : -1,
      inRoom: c1 ? (c1.x > 50 && c1.x < H.W - 50 && c1.y > H.FLOOR && c1.y < H.H) : false,
      homeCount: homeNow.length,
      homeMoved: homeStart.length > 0 && homeMax > 2,
      homeMax: Math.round(homeMax),
      homeInRoom: homeNow.every(h => !H.blocked(h.x, h.y, 6))
    };
  });
  ok('your friend comes indoors with you', indoors.notInside || indoors.followed);
  ok('and keeps up (' + indoors.gap + 'px)', indoors.notInside || (indoors.gap > 5 && indoors.gap < 100));
  ok('without walking through the walls', indoors.notInside || indoors.inRoom);
  ok('the friend waiting at home is in the room (' + indoors.homeCount + ')',
    indoors.notInside || indoors.homeCount === 1);
  ok('and potters about it (' + indoors.homeMax + 'px)', indoors.notInside || indoors.homeMoved);
  ok('without walking into the furniture', indoors.notInside || indoors.homeInRoom);

  const kept = await p.evaluate(() => {
    GG.Save.save(); GG.Save.load();
    return { companion: GG.Save.data.companion, home: GG.Save.data.homeFriends.slice() };
  });
  ok('who is with you and who is at home both survive a save',
    kept.companion === 'cookie' && kept.home.indexOf('tabby') >= 0);
  ok('and the two lists never overlap', kept.home.indexOf(kept.companion) < 0);

  r.forEach(l => console.log(l));
  if (errs.length) { console.log('--- errors ---'); errs.forEach(e => console.log(e)); }
  console.log(r.filter(x => x.startsWith('FAIL')).length ? 'SOME FAILED' : 'ALL PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
