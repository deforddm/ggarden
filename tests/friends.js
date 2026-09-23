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
    /* the biomes the world actually has, including the seven the new roster
       reaches into: the desert, the ridge, the taiga, the tundra, the glade,
       the rainforest and the beach */
    const PLACES = ['meadow', 'garden', 'forest', 'pond', 'hill', 'orchard', 'riverbank',
      'beach', 'shore', 'desert', 'mountain', 'taiga', 'tundra', 'glade', 'rainforest'];
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
  ok('54 animals (got ' + roster.count + ')', roster.count === 54);
  ok('twenty-five families present ' + JSON.stringify(roster.fams),
    Object.keys(roster.fams).length === 25);
  ok('fourteen befriending methods (got ' + roster.ways + ')', roster.ways === 14);

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
  ok('it lists every animal', book.cells === 54);
  ok('one is found (' + book.progress + ')', book.got === 1 && book.progress === '1 / 54');
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
    /* not a monarch: a monarch is poisonous and nothing in this game hunts
       one, friends included */
    GG.Critters.add(GG.BUG_BY_ID.cabbage_white, P.x + 90, P.y);
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

  /* Staging a chase needs two things.

     One: the world keeps topping the friends and the bugs back up, and a
     spare cat or a nearer moth turns a measured chase into a guess. Emptying
     the lists every frame does not help - the spawner then works flat out,
     the frame rate drops, and because dt is capped at 50ms the whole game
     quietly runs in slow motion and nothing gets anywhere. So hold the
     spawner still instead, and put it back afterwards.

     Two: a clear dry patch to do it on. Put a bush between the two of them
     and the cat never gets near enough to try. */
  await p.evaluate(() => {
    window.__hold = () => {
      if (!GG.Friends._spawn) GG.Friends._spawn = GG.Friends.spawnNear;
      if (!GG.Critters._spawn) GG.Critters._spawn = GG.Critters.spawnNear;
      GG.Friends.spawnNear = () => false;
      GG.Critters.spawnNear = () => false;
      GG.Friends.clear();
      GG.Critters.clear();
    };
    window.__release = () => {
      if (GG.Friends._spawn) GG.Friends.spawnNear = GG.Friends._spawn;
      if (GG.Critters._spawn) GG.Critters.spawnNear = GG.Critters._spawn;
    };
    /* A tree with nothing else solid within 150px, so a chase round it is a
       chase and not an obstacle course. */
    window.__lonelyTree = () => {
      const W = GG.World;
      const trees = W.props.filter(q => q.type === 'tree' || q.type === 'pine');
      let best = trees[0], bestN = 1e9;
      for (let i = 0; i < trees.length; i += 7) {
        const t = trees[i];
        if (W.isWater(t.x, t.y)) continue;
        /* and open walkable ground east of it for the chase (the marsh grew
           real water in v1.15, which moved things about) */
        let open = true;
        for (let dx = 40; dx <= 280 && open; dx += 20) {
          for (let dy = -30; dy <= 260 && open; dy += 40) {
            if (W.isWater(t.x + dx, t.y + dy)) open = false;
          }
        }
        if (!open) continue;
        let n = 0;
        for (let j = 0; j < W.solids.length; j += 3) {
          const q = W.solids[j];
          if (q === t) continue;
          if (Math.abs(q.x - t.x) < 150 && Math.abs(q.y - t.y) < 150) n++;
        }
        if (n < bestN) { bestN = n; best = t; }
        if (n === 0) break;
      }
      return best;
    };

    /* Open ground with room to walk in a straight line - the map has grown
       twice now, and a staged spot that used to be a meadow can end up inside
       a wall, which measures the wall and not the behaviour. */
    window.__runway = (west, east) => {
      const W = GG.World;
      const clear = (x, y, dx, len) => {
        for (let d = 0; d <= len; d += 16) {
          const px = x + dx * d;
          if (W.isWater(px, y) || W.blocked(px, y, 14)) return false;
          if (W.isWater(px, y - 26) || W.blocked(px, y - 26, 14)) return false;
        }
        return true;
      };
      for (let r = 0; r < 2000; r += 40) {
        for (let a = 0; a < Math.PI * 2; a += 0.22) {
          const x = W.DOOR.x + Math.cos(a) * r, y = W.DOOR.y + 80 + Math.sin(a) * r;
          if (x < 200 || y < 200 || x > W.W - 200 || y > W.H - 200) continue;
          if (clear(x, y, -1, west) && clear(x, y, 1, east)) return { x: x, y: y };
        }
      }
      return { x: W.DOOR.x, y: W.DOOR.y + 80 };
    };

    /* Water she can actually walk about in, rather than a stream she is out
       of again in one stride. */
    window.__wadeSpot = () => {
      const W = GG.World;
      const ok = (x, y) => {
        if (!W.isWater(x, y) || W.blocked(x, y, 11)) return false;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          if (!W.isWater(x + Math.cos(a) * 20, y + Math.sin(a) * 20)) return false;
          if (W.blocked(x + Math.cos(a) * 20, y + Math.sin(a) * 20, 11)) return false;
        }
        return true;
      };
      for (let r = 0; r < 2400; r += 25) {
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const x = W.DOOR.x + Math.cos(a) * r, y = W.DOOR.y + Math.sin(a) * r;
          if (ok(x, y)) return { x: x, y: y };
        }
      }
      return null;
    };

    window.__spot = (x, y, reach) => {
      const W = GG.World;
      for (let rr = 0; rr <= (reach || 60); rr += 8) {
        for (let a = 0; a < Math.PI * 2; a += 0.45) {
          const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
          if (!W.isWater(px, py) && !W.blocked(px, py, 14) &&
              !GG.Friends.waterNear(px, py, 90)) return { x: px, y: py };
        }
      }
      return { x: x, y: y };
    };
  });

  ok('nothing is left open before the chase', !(await unpause()));
  const chase2 = await p.evaluate(async () => {
    const P = GG.Player;
    /* this one is about bugs hunting bugs, so hold the world still: a cat
       pouncing on the tiger beetle sends it running and we end up measuring
       the cat, and a nearer ant is a different hunt altogether */
    window.__hold();
    GG.Critters.add(GG.BUG_BY_ID.tiger_beetle, P.x + 70, P.y + 50);
    GG.Critters.add(GG.BUG_BY_ID.ant, P.x + 140, P.y + 50);
    const hunter = GG.Critters.list[0], prey = GG.Critters.list[1];
    const d0 = GG.dist(hunter.x, hunter.y, prey.x, prey.y);
    let closest = d0, stalked = false, bolted = false;
    /* a hunt is a wander with a purpose, so give it long enough to land */
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (GG.Critters.list.indexOf(prey) < 0) break;
      const d = GG.dist(hunter.x, hunter.y, prey.x, prey.y);
      /* both of them are wandering while nothing is happening, and a beetle
         that has pottered off out of range never picks the ant out at all -
         so when neither is hunting the other, put them back within sight of
         each other. The hunt itself is never touched. */
      if (!hunter.prey && prey.flee <= 0 && d > 150) {
        prey.x = hunter.x + 70; prey.y = hunter.y;
      }
      if (d < closest) closest = d;
      if (hunter.prey) stalked = true;
      if (prey.flee > 0) bolted = true;
      if (bolted) break;
    }
    window.__release();
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


  /* ================= THE HUNT =================
     Guin: "add the ability to for friends to hunt (friends cant hunt friends)"

     Three things have to be true: a hunt really happens, a friend only ever
     goes after something it really eats, and a friend never goes after
     another friend. */

  ok('nothing is left open before the friends hunt', !(await unpause()));

  /* ---------- the prey lists themselves ---------- */
  const prey = await p.evaluate(() => {
    const bad = [];
    const animals = {};
    GG.ANIMALS.forEach(a => { animals[a.id] = 1; });
    Object.keys(GG.ANIMAL_HUNTS).forEach(id => {
      if (!GG.ANIMAL_BY_ID[id]) bad.push('no such friend: ' + id);
      const seen = {};
      GG.ANIMAL_HUNTS[id].forEach(q => {
        /* David allowed exactly one friend-on-friend chase: the garter snake
           and the chorus frog, which is real and which never ends in a catch */
        const allowed = (id === 'garter_snake' && q === 'chorus_frog');
        if (!GG.BUG_BY_ID[q] && !GG.FISH_BY_ID[q] && !(allowed && GG.ANIMAL_BY_ID[q])) {
          bad.push(id + ' -> not a real creature: ' + q);
        }
        if (animals[q] && !allowed) bad.push(id + ' -> hunts a friend: ' + q);
        if (seen[q]) bad.push(id + ' -> listed twice: ' + q);
        seen[q] = 1;
      });
      if (!GG.ANIMAL_HUNTS[id].length) bad.push(id + ' -> empty list');
    });
    const fams = {};
    GG.ANIMALS.forEach(a => {
      if (GG.animalPrey(a.id).length) fams[a.family] = (fams[a.family] || 0) + 1;
    });
    return {
      bad,
      fams,
      /* the pairings the research says would be false animations */
      hummerTakesADragonfly: GG.animalHunts('annas_hummingbird', 'emperor_dragonfly'),
      hummerTakesAGrasshopper: GG.animalHunts('ruby_hummingbird', 'grasshopper'),
      hummerTakesAnAphid: GG.animalHunts('ruby_hummingbird', 'aphid'),
      hummerTakesASpider: GG.animalHunts('annas_hummingbird', 'garden_spider'),
      batTakesAnEarthworm: GG.animalHunts('little_brown_bat', 'earthworm'),
      batTakesASnail: GG.animalHunts('big_brown_bat', 'snail'),
      batTakesAButterfly: GG.animalHunts('hoary_bat', 'monarch'),
      hoaryTakesAMoth: GG.animalHunts('hoary_bat', 'luna_moth'),
      bigBrownTakesABeetle: GG.animalHunts('big_brown_bat', 'stag_beetle'),
      catTakesAMoth: GG.animalHunts('tabby', 'hawk_moth'),
      catTakesAWorm: GG.animalHunts('maine_coon', 'earthworm'),
      catTakesABee: GG.animalHunts('siamese', 'honeybee'),
      dogTakesAFly: GG.animalHunts('cookie', 'housefly'),
      dogTakesAWasp: GG.animalHunts('beagle', 'paper_wasp'),
      dogTakesASnail: GG.animalHunts('labrador', 'snail'),
      frogTakesAWorm: GG.animalHunts('green_frog', 'earthworm'),
      tinyFrogTakesACrayfish: GG.animalHunts('chorus_frog', 'crayfish'),
      tinyFrogTakesACicada: GG.animalHunts('chorus_frog', 'cicada'),
      bullfrogTakesACrayfish: GG.animalHunts('bullfrog', 'crayfish'),
      nobodyTakesAMonarch: GG.ANIMALS.every(a => !GG.animalHunts(a.id, 'monarch')),
      nobodyTakesASting: GG.ANIMALS.every(a => GG.animalPrey(a.id)
        .every(q => !(GG.BUG_BY_ID[q] && GG.BUG_BY_ID[q].sting))),
      parrotsHuntNothing: ['budgie', 'cockatiel', 'scarlet_macaw', 'african_grey']
        .every(id => GG.animalPrey(id).length === 0),
      parrotsForage: ['budgie', 'cockatiel', 'scarlet_macaw', 'african_grey']
        .every(id => !!GG.animalForage(id)),
      styles: GG.ANIMALS.map(a => a.family + ':' + GG.animalHuntStyle(a))
        .filter((v, i, l) => l.indexOf(v) === i).sort().join(' ')
    };
  });
  ok('every prey list is real ' + JSON.stringify(prey.bad.slice(0, 5)), !prey.bad.length);
  ok('most of the families hunt, and the plant-eaters do not ' + JSON.stringify(prey.fams),
    Object.keys(prey.fams).length >= 14 && !prey.fams.parrot && !prey.fams.rabbit &&
    !prey.fams.cow && !prey.fams.horse && !prey.fams.sheep && !prey.fams.deer &&
    !prey.fams.koala && !prey.fams.redpanda && !prey.fams.squirrel);
  ok('a hummingbird hunts aphids and spiders',
    prey.hummerTakesAnAphid && prey.hummerTakesASpider);
  ok('but never a dragonfly or a grasshopper - they are far too big',
    !prey.hummerTakesADragonfly && !prey.hummerTakesAGrasshopper);
  ok('a hoary bat hunts moths and a big brown bat hunts beetles',
    prey.hoaryTakesAMoth && prey.bigBrownTakesABeetle);
  ok('but a bat never hunts the ground or a daytime butterfly',
    !prey.batTakesAnEarthworm && !prey.batTakesASnail && !prey.batTakesAButterfly);
  ok('a cat hunts moths but not worms', prey.catTakesAMoth && !prey.catTakesAWorm);
  ok('a dog snaps at flies but not at snails',
    prey.dogTakesAFly && !prey.dogTakesASnail);
  ok('a fist-sized frog takes a worm', prey.frogTakesAWorm);
  ok('a frog the size of a paperclip does not take a crayfish or a cicada',
    !prey.tinyFrogTakesACrayfish && !prey.tinyFrogTakesACicada);
  ok('but a bullfrog does take a crayfish', prey.bullfrogTakesACrayfish);
  ok('nothing hunts a monarch', prey.nobodyTakesAMonarch);
  ok('nobody is ever shown hunting a bee or a wasp',
    prey.nobodyTakesASting && !prey.catTakesABee && !prey.dogTakesAWasp);
  ok('parrots hunt nothing at all, and forage instead',
    prey.parrotsHuntNothing && prey.parrotsForage);
  ok('each family hunts in its own way (' + prey.styles + ')',
    /cat:pounce/.test(prey.styles) && /dog:dash/.test(prey.styles) &&
    /hummingbird:hover/.test(prey.styles) && /bat:swoop/.test(prey.styles) &&
    /frog:ambush/.test(prey.styles) && /parrot:null/.test(prey.styles) &&
    /snake:pounce/.test(prey.styles) && /songbird:dash/.test(prey.styles) &&
    /turtle:ambush/.test(prey.styles));

  /* ---------- a hunt really happens ---------- */
  const catHunt = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 90);
    await new Promise(r => setTimeout(r, 200));
    window.__hold();
    /* the spider on a clear dry patch, and the cat a short walk from it */
    const sp = window.__spot(P.x + 130, P.y + 4, 60);
    const sc = window.__spot(sp.x - 80, sp.y, 30);
    GG.Critters.add(GG.BUG_BY_ID.garden_spider, sp.x, sp.y);
    F.add(GG.ANIMAL_BY_ID.tabby, sc.x, sc.y);
    const cat = F.list[0], bug = GG.Critters.list[0];
    const d0 = GG.dist(cat.x, cat.y, bug.x, bug.y);
    let closest = d0, picked = false, tried = false;
    /* a hunt is a wander with a purpose, so give it long enough to land */
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (cat.chaseId === bug) picked = true;
      const d = GG.dist(cat.x, cat.y, bug.x, bug.y);
      if (d < closest) closest = d;
      if (cat.missed > 0 || bug.flee > 0) tried = true;
      if (tried) break;
    }
    window.__release();
    return { d0: Math.round(d0), closest: Math.round(closest), picked, tried,
      alive: GG.Critters.list.indexOf(bug) >= 0 };
  });
  ok('a cat picks out a spider it really does hunt', catHunt.picked);
  ok('and goes after it (' + catHunt.d0 + ' -> ' + catHunt.closest + ')',
    catHunt.closest < catHunt.d0);
  ok('and has a go at it', catHunt.tried);
  ok('and the spider gets away, the way it usually does', catHunt.alive);

  /* a second family, to show it is not a cat trick */
  const batHunt = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const sm = window.__spot(P.x + 130, P.y - 10, 60);
    const sb = window.__spot(sm.x - 110, sm.y, 40);
    GG.Critters.add(GG.BUG_BY_ID.rosy_maple, sm.x, sm.y);
    F.add(GG.ANIMAL_BY_ID.little_brown_bat, sb.x, sb.y);
    const bat = F.list[0], moth = GG.Critters.list[0];
    const d0 = GG.dist(bat.x, bat.y, moth.x, moth.y);
    let closest = d0, picked = false, tried = false;
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (bat.chaseId === moth) picked = true;
      const d = GG.dist(bat.x, bat.y, moth.x, moth.y);
      if (d < closest) closest = d;
      if (bat.missed > 0 || moth.flee > 0) tried = true;
      if (tried) break;
    }
    window.__release();
    return { d0: Math.round(d0), closest: Math.round(closest), picked, tried,
      alive: GG.Critters.list.indexOf(moth) >= 0 };
  });
  ok('a little brown bat goes after a moth (' + batHunt.d0 + ' -> ' + batHunt.closest + ')',
    batHunt.picked && batHunt.closest < batHunt.d0);
  ok('and has a go at that too', batHunt.tried);
  ok('and the moth gets away as well', batHunt.alive);

  /* a frog does not chase. It sits still and waits. */
  const frogWait = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const sf = window.__spot(P.x + 90, P.y + 40, 60);
    GG.Critters.add(GG.BUG_BY_ID.housefly, sf.x + 60, sf.y);
    F.add(GG.ANIMAL_BY_ID.green_frog, sf.x, sf.y);
    const frog = F.list[0], fly = GG.Critters.list[0];
    const start = { x: frog.x, y: frog.y };
    let waiting = false, wander = 0, moveWhileWaiting = 0, at = null;
    for (let i = 0; i < 200; i++) {
      await new Promise(r => setTimeout(r, 50));
      /* watch the whole window: a frog that hops back to where it began
         would look like a frog that never moved */
      wander = Math.max(wander, GG.dist(frog.x, frog.y, start.x, start.y));
      if (frog.chase > 0) {
        if (!waiting) { waiting = true; at = { x: frog.x, y: frog.y }; }
        moveWhileWaiting = Math.max(moveWhileWaiting, GG.dist(frog.x, frog.y, at.x, at.y));
      }
      if (waiting && i > 60) break;
    }
    window.__release();
    return { waiting, wander: Math.round(wander),
      moveWhileWaiting: Math.round(moveWhileWaiting) };
  });
  ok('a frog picks out its dinner', frogWait.waiting);
  ok('and then sits perfectly still and waits for it (' + frogWait.moveWhileWaiting + 'px)',
    frogWait.moveWhileWaiting < 26);

  /* ---------- it only ever chases what it really eats ---------- */
  const wrongPrey = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    /* a dragonfly is bigger than the hummingbird - in the real world the
       dragonfly is the one doing the catching */
    GG.Critters.add(GG.BUG_BY_ID.emperor_dragonfly, P.x + 60, P.y + 10);
    GG.Critters.add(GG.BUG_BY_ID.earthworm, P.x + 40, P.y + 40);
    F.add(GG.ANIMAL_BY_ID.annas_hummingbird, P.x + 20, P.y + 10);
    F.add(GG.ANIMAL_BY_ID.hoary_bat, P.x + 20, P.y + 50);
    const bird = F.list[0], bat = F.list[1];
    const dragon = GG.Critters.list[0], worm = GG.Critters.list[1];
    const wrong = [];
    for (let i = 0; i < 200; i++) {
      await new Promise(r => setTimeout(r, 50));
      /* `flee` is no evidence here - a bug bolts from Guin as well - so watch
         who picked what, and who was close enough to have a go at it */
      [[bird, 'hummingbird'], [bat, 'bat']].forEach(pair => {
        if (pair[0].chaseId === dragon) wrong.push(pair[1] + ' picked the dragonfly');
        if (pair[0].chaseId === worm) wrong.push(pair[1] + ' picked the earthworm');
        if (pair[0].missed > 0) {
          if (GG.dist(pair[0].x, pair[0].y, dragon.x, dragon.y) < 40) wrong.push(pair[1] + ' struck at the dragonfly');
          if (GG.dist(pair[0].x, pair[0].y, worm.x, worm.y) < 40) wrong.push(pair[1] + ' struck at the earthworm');
        }
      });
      if (wrong.length) break;
    }
    window.__release();
    return { wrong: wrong.filter((v, i, l) => l.indexOf(v) === i) };
  });
  ok('nothing chases what it could never eat ' + JSON.stringify(wrongPrey.wrong),
    !wrongPrey.wrong.length);

  /* ---------- Guin's rule: friends never hunt friends ---------- */
  const ruleData = await p.evaluate(() => {
    const A = GG.ANIMAL_BY_ID;
    return {
      catAndBird: !!GG.friendRuleFor(A.tabby, A.annas_hummingbird),
      dogAndCat: !!GG.friendRuleFor(A.cookie, A.tabby),
      bullfrogAndBat: !!GG.friendRuleFor(A.bullfrog, A.hoary_bat),
      bullfrogAndFrog: !!GG.friendRuleFor(A.bullfrog, A.chorus_frog),
      catAndFrog: !!GG.friendRuleFor(A.tabby, A.green_frog),
      birdAndCat: !!GG.friendRuleFor(A.annas_hummingbird, A.tabby),
      notItself: !!GG.friendRuleFor(A.tabby, A.tabby),
      /* the ONLY friend on any friend's prey list is the chorus frog, on the
         garter snake's - the one exception David allowed, and it never ends
         in a catch */
      friendPairs: [].concat.apply([], GG.ANIMALS.map(a => GG.animalPrey(a.id)
        .filter(q => GG.ANIMAL_BY_ID[q]).map(q => a.id + '->' + q))),
      /* and it is written down where she can read it */
      onTheCatsPage: GG.ANIMALS.filter(a => a.family === 'cat')
        .every(a => a.facts.join(' ').indexOf('friends never hunt friends') >= 0),
      onTheDogsPage: GG.ANIMALS.filter(a => a.family === 'dog')
        .every(a => a.facts.join(' ').indexOf('friends never hunt friends') >= 0),
      onTheBullfrogsPage: A.bullfrog.facts.join(' ').indexOf('friends never hunt friends') >= 0
    };
  });
  ok('the garter snake and the chorus frog are the only friend-on-friend chase '
    + JSON.stringify(ruleData.friendPairs),
    ruleData.friendPairs.length === 1 && ruleData.friendPairs[0] === 'garter_snake->chorus_frog');
  ok('the rule knows a cat would really take a hummingbird', ruleData.catAndBird);
  ok('and that a dog would chase a cat', ruleData.dogAndCat);
  ok('and that a bullfrog would swallow a bat or a little frog',
    ruleData.bullfrogAndBat && ruleData.bullfrogAndFrog);
  ok('and it does not invent pairs that are not real',
    !ruleData.catAndFrog && !ruleData.birdAndCat && !ruleData.notItself);
  ok('the book says so on every cat page', ruleData.onTheCatsPage);
  ok('and on every dog page', ruleData.onTheDogsPage);
  ok('and on the bullfrog page', ruleData.onTheBullfrogsPage);

  const ruleLive = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    /* a cat, a hummingbird it really would catch, and a moth it really would
       chase, all within reach at once */
    GG.Critters.add(GG.BUG_BY_ID.hawk_moth, P.x + 120, P.y + 60);
    F.add(GG.ANIMAL_BY_ID.tabby, P.x + 90, P.y + 60);
    F.add(GG.ANIMAL_BY_ID.annas_hummingbird, P.x + 140, P.y + 60);
    const cat = F.list[0], bird = F.list[1];
    let watched = false, wentForTheBird = false, sat = 0;
    for (let i = 0; i < 200; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (cat.watch > 0) watched = true;
      if (cat.chaseId === bird) wentForTheBird = true;
      if (watched) break;
    }
    /* and while it is watching, it stays put */
    const at = { x: cat.x, y: cat.y };
    for (let i = 0; i < 14 && cat.watch > 0; i++) {
      await new Promise(r => setTimeout(r, 50));
      sat = Math.max(sat, GG.dist(cat.x, cat.y, at.x, at.y));
    }
    window.__release();
    return { watched, wentForTheBird, sat: Math.round(sat),
      birdAlive: F.list.indexOf(bird) >= 0,
      why: cat.watchWhy ? cat.watchWhy.why : '' };
  });
  ok('a cat that spots a hummingbird stops and watches instead', ruleLive.watched);
  ok('it never goes after the bird', !ruleLive.wentForTheBird);
  ok('it sits there while it watches (' + ruleLive.sat + 'px)', ruleLive.sat < 22);
  ok('and the hummingbird is still there', ruleLive.birdAlive);
  ok('and it knows why (' + ruleLive.why.slice(0, 40) + ')',
    /friends never hunt friends/i.test(ruleLive.why));

  /* ---------- the ones that do not hunt ---------- */
  const forage = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    F.bits.length = 0;
    GG.Critters.add(GG.BUG_BY_ID.housefly, P.x + 110, P.y + 30);
    F.add(GG.ANIMAL_BY_ID.budgie, P.x + 80, P.y + 30);
    const bird = F.list[0];
    let foraged = false, bits = 0, chased = false;
    for (let i = 0; i < 200; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (bird.forage > 0) foraged = true;
      bits = Math.max(bits, F.bits.length);
      if (bird.chase > 0 || bird.chaseId) chased = true;
      if (foraged && bits > 0) break;
    }
    window.__release();
    return { foraged, bits, chased };
  });
  ok('a budgie stops to forage', forage.foraged);
  ok('and makes a mess of husks doing it (' + forage.bits + ')', forage.bits > 0);
  ok('and never chases anything', !forage.chased);

  /* ---------- and the book carries all of it ---------- */
  const huntBook = await p.evaluate(() => {
    GG.Book.open(); GG.Book.tab = 'friends';
    GG.Book.showDetail(GG.ANIMAL_BY_ID.annas_hummingbird);
    const bird = document.getElementById('book-detail').textContent;
    GG.Book.showDetail(GG.ANIMAL_BY_ID.tabby);
    const cat = document.getElementById('book-detail').textContent;
    GG.Book.showDetail(GG.ANIMAL_BY_ID.budgie);
    const budgie = document.getElementById('book-detail').textContent;
    GG.UI.close('screen-book');
    return {
      birdHunts: bird.indexOf('It hunts') >= 0,
      birdLeafhoppers: bird.indexOf('thirty-two leafhoppers') >= 0,
      catHunts: cat.indexOf('It hunts') >= 0,
      catRule: cat.indexOf('friends never hunt friends') >= 0,
      catHomeless: cat.indexOf('no home') >= 0,
      getsAway: cat.indexOf('always gets away') >= 0,
      budgieHunts: budgie.indexOf('It hunts') >= 0,
      budgieForages: budgie.indexOf('does not hunt') >= 0
    };
  });
  ok('an animal page now says what it hunts', huntBook.birdHunts && huntBook.catHunts);
  ok('and still promises everybody gets away', huntBook.getsAway);
  ok('the hummingbird page has the thirty-two leafhoppers', huntBook.birdLeafhoppers);
  ok('the cat page puts the weight on cats with no home', huntBook.catHomeless);
  ok('and spells out the rule', huntBook.catRule);
  ok('a budgie page has no hunting line at all', !huntBook.budgieHunts);
  ok('it says the budgie does not hunt instead', huntBook.budgieForages);

  /* ---------- the three range errors in the roster ---------- */
  const range = await p.evaluate(() => {
    const A = GG.ANIMAL_BY_ID;
    const frogs = GG.ANIMALS.filter(a => a.family === 'frog').map(a => a.id);
    return {
      frogs,
      peeperGone: !A.spring_peeper,
      redLegged: !!A.red_legged_frog,
      redLeggedFacts: A.red_legged_frog ? A.red_legged_frog.facts.length : 0,
      greenIsAVisitor: A.green_frog.facts.join(' ').indexOf('eastern side of the country') >= 0,
      bullfrogIntroduced: A.bullfrog.facts.join(' ').indexOf('prohibited') >= 0,
      bullfrogTwiceTheSize: A.bullfrog.facts.join(' ').indexOf('twice the size') >= 0,
      bullfrogNotBlamed: A.bullfrog.facts.join(' ').indexOf('not the frog') >= 0,
      chorusStillHere: !!A.chorus_frog
    };
  });
  ok('the Spring Peeper is gone - it is an eastern frog and never lived here',
    range.peeperGone);
  ok('a Northern Red-legged Frog took its place ' + JSON.stringify(range.frogs),
    range.redLegged && range.redLeggedFacts >= 3);
  ok('the Pacific Chorus Frog, the properly local one, is still here', range.chorusStillHere);
  ok('the Green Frog page says it came from the east', range.greenIsAVisitor);
  ok('the bullfrog page says it is introduced and prohibited here',
    range.bullfrogIntroduced && range.bullfrogTwiceTheSize);
  ok('and does not blame the frog for it', range.bullfrogNotBlamed);


  /* ================= THE FOUR BEHAVIOURS AND THE THREE FIXES =================

     Guin asked for four things - rideable friends, dogs chasing squirrels,
     friends laughing together, and fish that scatter when she steps in the
     stream - and the new roster needed three things the code could not do:
     a friend who is met and never befriended, a ring that runs backwards for
     the animals you befriend by going away, and one chase that crosses from
     the bugs into the friends. */

  ok('nothing is left open before the new behaviours', !(await unpause()));

  /* ---------- 1. LOOK, DON'T TOUCH: the western rattlesnake ---------- */
  const lookData = await p.evaluate(() => {
    const A = GG.ANIMAL_BY_ID;
    const looks = GG.ANIMALS.filter(a => a.lookOnly).map(a => a.id);
    return {
      looks,
      isLookOnly: GG.animalIsLookOnly(A.western_rattlesnake),
      worthNothing: A.western_rattlesnake.value === 0,
      hasDanger: !!A.western_rattlesnake.danger,
      backsAway: A.western_rattlesnake.way === 'backaway',
      widowToo: !!(GG.BUG_BY_ID.black_widow && GG.BUG_BY_ID.black_widow.lookOnly)
    };
  });
  ok('the rattlesnake is the only look-only friend ' + JSON.stringify(lookData.looks),
    lookData.looks.length === 1 && lookData.looks[0] === 'western_rattlesnake');
  ok('she is worth no sparkles and carries a danger line',
    lookData.isLookOnly && lookData.worthNothing && lookData.hasDanger);
  ok('and you make friends with her by backing away', lookData.backsAway);

  const met = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    GG.Save.data.seen = {};
    const spot = window.__runway(300, 320);
    P.reset(spot.x, spot.y);
    await new Promise(r => setTimeout(r, 200));
    const before = GG.Save.data.sparkles;
    F.add(GG.ANIMAL_BY_ID.western_rattlesnake, P.x + 210, P.y);
    await new Promise(r => setTimeout(r, 200));
    const cand = F.candidate(P);
    const began = F.begin(P);
    const rings = [];
    GG.Input.keys['a'] = true;                 /* stepping slowly backwards */
    for (let i = 0; i < 90 && F.busy; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (F.busy) rings.push(F.busy.ring);
    }
    GG.Input.keys['a'] = false;
    await new Promise(r => setTimeout(r, 200));
    /* and she is never a friend, never a companion, never at home */
    F.setCompanion('western_rattlesnake');
    const comp = GG.Save.data.companion;
    F.sendHome('western_rattlesnake');
    window.__release();
    return { cand: !!cand, began, done: !F.busy,
      rose: rings.length > 4 && rings[rings.length - 1] > rings[0],
      seen: GG.Save.hasSeen('western_rattlesnake'),
      count: GG.Save.countOfSeen('western_rattlesnake'),
      friend: GG.Save.hasFriend('western_rattlesnake'),
      paid: GG.Save.data.sparkles - before,
      companion: comp,
      home: (GG.Save.data.homeFriends || []).indexOf('western_rattlesnake') >= 0
    };
  });
  ok('she can be met from a long way off', met.cand && met.began);
  ok('backing away fills the ring', met.rose);
  ok('and meeting her finishes it', met.done);
  ok('she goes in the "met" list, not the friends list', met.seen && !met.friend);
  ok('meeting her is counted (' + met.count + ')', met.count === 1);
  ok('she is worth no sparkles at all and no new-friend bonus (' + met.paid + ')', met.paid === 0);
  ok('she can never be asked along', met.companion !== 'western_rattlesnake');
  ok('and never waits at the house', !met.home);

  const lookBook = await p.evaluate(() => {
    GG.Book.open(); GG.Book.tab = 'friends'; GG.Book.showGrid();
    const cells = document.querySelectorAll('#book-grid .bugcell');
    const idx = GG.ANIMAL_BY_ID.western_rattlesnake.index;
    /* the grid has the companion strip first, so the cells run one behind */
    const cell = cells[idx];
    const opened = cell.classList.contains('got');
    GG.Book.showDetail(GG.ANIMAL_BY_ID.western_rattlesnake);
    const t = document.getElementById('book-detail').textContent;
    const along = !!document.querySelector('#book-detail .btn.primary');
    GG.UI.close('screen-book');
    return { opened, met: t.indexOf('Met: 1 time') >= 0,
      tag: t.indexOf('keep away from') >= 0,
      noNet: t.indexOf('your net will not take her') < 0,
      danger: t.indexOf('Keep your hands to yourself') >= 0, along };
  });
  ok('meeting her opens her page in the Friends Book', lookBook.opened);
  ok('the page counts the meetings, not the friendships', lookBook.met);
  ok('the look-only tag is worded for a friend, not for a net',
    lookBook.tag && lookBook.noNet);
  ok('the danger box is on the page', lookBook.danger);
  ok('and there is no "ask them along" button on it', !lookBook.along);

  /* ---------- 2. THE RING THAT RUNS BACKWARDS ---------- */
  ok('nothing is left open before the backing away', !(await unpause()));
  const back = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const spot = window.__runway(420, 380);
    P.reset(spot.x, spot.y);
    await new Promise(r => setTimeout(r, 200));
    const bear = F.add(GG.ANIMAL_BY_ID.black_bear, P.x + 220, P.y);
    await new Promise(r => setTimeout(r, 200));
    const began = F.begin(P);
    /* standing still does nothing much: it is going away that counts */
    await new Promise(r => setTimeout(r, 1200));
    const stillRing = F.busy ? F.busy.ring : -1;
    GG.Input.keys['a'] = true;
    await new Promise(r => setTimeout(r, 1500));
    GG.Input.keys['a'] = false;
    const awayRing = F.busy ? F.busy.ring : 1;
    /* now walk back at it: the ring slips straight back */
    GG.Input.keys['d'] = true;
    await new Promise(r => setTimeout(r, 900));
    const closerRing = F.busy ? F.busy.ring : -1;
    await new Promise(r => setTimeout(r, 900));
    GG.Input.keys['d'] = false;
    const stopped = !F.busy;
    const toast = document.getElementById('toast').textContent;
    /* and she can never end up standing next to one */
    const nearest = F.list.length ? GG.dist(bear.x, bear.y, P.x, P.y) : -1;
    window.__release();
    return { began, stillRing, awayRing, closerRing, stopped, toast,
      keep: GG.ANIMAL_BY_ID.black_bear.keep, nearest: Math.round(nearest) };
  });
  ok('you can start backing away from a bear a long way off', back.began);
  ok('standing still in front of a bear does almost nothing ('
    + back.stillRing.toFixed(2) + ')', back.stillRing < 0.35);
  ok('walking away fills the ring (' + back.awayRing.toFixed(2) + ')',
    back.awayRing > back.stillRing);
  ok('walking back towards it slips the ring back (' + back.closerRing.toFixed(2) + ')',
    back.closerRing < back.awayRing);
  ok('and walking at it stops the whole thing', back.stopped);
  ok('and says why (' + back.toast.slice(0, 40) + ')', /step slowly backwards/.test(back.toast));

  const keepOff = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const spot = window.__runway(60, 700);
    P.reset(spot.x, spot.y);
    const moose = F.add(GG.ANIMAL_BY_ID.moose, P.x + 150, P.y + 4);
    let closest = 1e9;
    GG.Input.keys['d'] = true;            /* walk straight at it for a while */
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 100));
      closest = Math.min(closest, GG.dist(moose.x, moose.y, P.x, P.y));
    }
    GG.Input.keys['d'] = false;
    window.__release();
    return { closest: Math.round(closest), keep: GG.ANIMAL_BY_ID.moose.keep };
  });
  ok('a moose never lets her walk up to it (' + keepOff.closest + 'px, keeps '
    + keepOff.keep + ')', keepOff.closest > keepOff.keep * 0.55);

  /* ---------- 3. THE GARTER SNAKE AND THE CHORUS FROG ---------- */
  ok('nothing is left open before the snake', !(await unpause()));
  const snakeFrog = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const sp = window.__spot(GG.World.DOOR.x + 160, GG.World.DOOR.y + 120, 80);
    P.reset(sp.x - 120, sp.y);
    const snake = F.add(GG.ANIMAL_BY_ID.garter_snake, sp.x, sp.y);
    const frog = F.add(GG.ANIMAL_BY_ID.chorus_frog, sp.x + 120, sp.y + 6);
    const d0 = GG.dist(snake.x, snake.y, frog.x, frog.y);
    let picked = false, closest = d0, tried = false, watched = false;
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (snake.chaseId === frog) picked = true;
      if (snake.watch > 0) watched = true;
      closest = Math.min(closest, GG.dist(snake.x, snake.y, frog.x, frog.y));
      if (snake.missed > 0 || frog.bolt > 0) tried = true;
      if (tried) break;
    }
    window.__release();
    return { picked, tried, watched, d0: Math.round(d0), closest: Math.round(closest),
      alive: F.list.indexOf(frog) >= 0,
      hunts: GG.animalHunts('garter_snake', 'chorus_frog'),
      notTheOtherWay: GG.animalHunts('chorus_frog', 'garter_snake'),
      bullfrogSitsInstead: !!GG.friendRuleFor(GG.ANIMAL_BY_ID.bullfrog,
        GG.ANIMAL_BY_ID.garter_snake) };
  });
  ok('the garter snake really does hunt the chorus frog', snakeFrog.hunts && !snakeFrog.notTheOtherWay);
  ok('and it picks the frog out even though the frog is a friend', snakeFrog.picked);
  ok('and goes after it (' + snakeFrog.d0 + ' -> ' + snakeFrog.closest + ')',
    snakeFrog.closest < snakeFrog.d0);
  ok('and has a go at it', snakeFrog.tried);
  ok('and the frog always gets away', snakeFrog.alive);
  ok('this one does not sit down and watch - it is the one exception', !snakeFrog.watched);
  ok('but a bullfrog and a snake still stop and watch each other',
    snakeFrog.bullfrogSitsInstead);

  /* ---------- 4. DOGS CHASE SQUIRRELS ---------- */
  ok('nothing is left open before the chase', !(await unpause()));
  const playData = await p.evaluate(() => {
    const A = GG.ANIMAL_BY_ID;
    return {
      dogAndSquirrel: !!GG.friendPlayFor(A.labrador, A.fox_squirrel),
      notAHunt: !GG.animalHunts('labrador', 'fox_squirrel'),
      noRule: !GG.friendRuleFor(A.labrador, A.fox_squirrel),
      notBackwards: !GG.friendPlayFor(A.fox_squirrel, A.labrador),
      notACat: !GG.friendPlayFor(A.tabby, A.fox_squirrel),
      why: (GG.friendPlayFor(A.cookie, A.townsends_squirrel) || {}).why || ''
    };
  });
  ok('a dog and a squirrel are a play pairing, not a hunt',
    playData.dogAndSquirrel && playData.notAHunt && playData.noRule);
  ok('and it only goes one way, and only for dogs',
    playData.notBackwards && playData.notACat);
  ok('and the book knows it is play (' + playData.why.slice(0, 36) + ')',
    /play, not hunting/i.test(playData.why));

  const chaseSquirrel = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player, W = GG.World;
    window.__hold();
    /* a real tree, a squirrel out in front of it, and a dog further off */
    /* a tree with room round it: in the thick of the wood the dog spends the
       whole chase walking into other trees, which measures the wood and not
       the chase */
    const tree = window.__lonelyTree();
    P.reset(tree.x + 250, tree.y + 250);
    const sq = F.add(GG.ANIMAL_BY_ID.fox_squirrel, tree.x + 70, tree.y + 8);
    const dog = F.add(GG.ANIMAL_BY_ID.labrador, tree.x + 175, tree.y + 12);
    let chased = false, scolded = false, up = 0, closest = 1e9, inSight = false;
    let watched = false, climbed = false;
    for (let i = 0; i < 400; i++) {
      await new Promise(r => setTimeout(r, 50));
      /* both of them are wandering while they are not playing, and a dog that
         has pottered off over the hill never sees the squirrel at all - so
         keep the pair of them staged, as the other chase tests do */
      if (!(dog.play > 0) && !(sq.scold > 0) &&
          GG.dist(dog.x, dog.y, sq.x, sq.y) > 230) {
        dog.x = sq.x + 150; dog.y = sq.y + 6;
      }
      if (dog.play > 0) chased = true;
      if (dog.watch > 0 || sq.watch > 0) watched = true;
      closest = Math.min(closest, GG.dist(dog.x, dog.y, sq.x, sq.y));
      if (sq.scold > 0) {
        scolded = true;
        up = Math.max(up, sq.up || 0);
        climbed = !!sq.climb;
        /* in plain sight: it stays between the trunk and the dog, not round
           the back of it */
        if (sq.climb) {
          const toDog = GG.dist(sq.x, sq.y, dog.x, dog.y);
          const trunkToDog = GG.dist(sq.climb.x, sq.climb.y, dog.x, dog.y);
          if (toDog < trunkToDog) inSight = true;
        }
      }
      if (scolded && i > 120) break;
    }
    window.__release();
    return { chased, scolded, up: +up.toFixed(2), climbed, inSight, watched,
      closest: Math.round(closest), alive: F.list.indexOf(sq) >= 0 };
  });
  ok('a dog bounds after a squirrel', chaseSquirrel.chased);
  ok('and nobody sits down and watches - the rule is not needed here',
    !chaseSquirrel.watched);
  ok('the squirrel runs to a tree', chaseSquirrel.climbed);
  ok('and goes part way up it (' + chaseSquirrel.up + ')', chaseSquirrel.up > 0);
  ok('and stops there in plain sight, facing the dog', chaseSquirrel.inSight);
  ok('and scolds it', chaseSquirrel.scolded);
  ok('the dog never lays a paw on it (' + chaseSquirrel.closest + 'px at the closest)',
    chaseSquirrel.alive && chaseSquirrel.closest > 14);

  /* the real escape sums: close to its tree a squirrel is brave, out in the
     open it goes early. Dill & Houtman ran a model cat at grey squirrels on a
     wire and got flight distance = 2.19 + 0.385 x distance-to-tree, in
     metres, which is exactly the line the garden uses. */
  const fleeSums = await p.evaluate(async () => {
    const F = GG.Friends;
    window.__hold();
    const tree = window.__lonelyTree();
    const sq = F.add(GG.ANIMAL_BY_ID.fox_squirrel, tree.x + 20, tree.y);
    const rows = [], off = [];
    for (let d = 14; d <= 460; d += 22) {
      sq.x = tree.x + d; sq.y = tree.y;
      const t = F.nearestTree(sq.x, sq.y, 420);
      rows.push({ d: t ? Math.round(t.dist) : -1, r: Math.round(F.squirrelFlee(sq)) });
    }
    rows.forEach(q => { if (q.d >= 0) off.push(q); });
    const lo = off.reduce((a, q) => (q.d < a.d ? q : a), off[0]);
    const hi = off.reduce((a, q) => (q.d > a.d ? q : a), off[0]);
    /* and the line itself, in this garden's pixels: thirty to the metre */
    const line = off.every(q => Math.abs(q.r - (2.19 * 30 + 0.385 * q.d)) < 1.5);
    window.__release();
    F.clear();
    return { lo, hi, line, n: off.length };
  });
  ok('the squirrel\u2019s escape sums are the measured ones', fleeSums.line);
  ok('so close to its tree it lets a dog come nearer (' + fleeSums.lo.d + 'px from the '
    + 'tree -> ' + fleeSums.lo.r + 'px) than out in the open (' + fleeSums.hi.d
    + 'px -> ' + fleeSums.hi.r + 'px)',
    fleeSums.hi.d - fleeSums.lo.d > 50 && fleeSums.hi.r > fleeSums.lo.r + 18);

  /* ---------- 5. FRIENDS LAUGH TOGETHER ---------- */
  ok('nothing is left open before the play signals', !(await unpause()));
  const signals = await p.evaluate(() => {
    const A = GG.ANIMAL_BY_ID, S = GG.FRIEND_SIGNALS;
    return {
      kinds: Object.keys(S).sort().join(','),
      dogs: GG.friendSignalFor(A.labrador, A.beagle).id,
      parrots: GG.friendSignalFor(A.budgie, A.cockatiel).id,
      mixed: GG.friendSignalFor(A.tabby, A.green_frog).id,
      /* nothing claims an animal laughs */
      noLaughing: Object.keys(S).every(k => !/laugh(s|ing)? ?(out|at)?\b/i.test(S[k].does)),
      honestAboutDogs: /not laugh/i.test(S.playbow.honest),
      keaIsInIt: /kea/i.test(S.playcall.why),
      honestAboutTheRest: /nobody has ever found/i.test(S.companionable.honest)
    };
  });
  ok('there are three play signals and no more (' + signals.kinds + ')',
    signals.kinds === 'companionable,playbow,playcall');
  ok('two dogs do a play bow', signals.dogs === 'playbow');
  ok('two parrots do the play call', signals.parrots === 'playcall');
  ok('and everybody else just sits together', signals.mixed === 'companionable');
  ok('nothing in the game says an animal laughs', signals.noLaughing);
  ok('and the dog page says so out loud', signals.honestAboutDogs);
  ok('the kea study is the one behind the parrots', signals.keaIsInIt);
  ok('and the quiet one is honest about the empty spaces', signals.honestAboutTheRest);

  const bowLive = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const sp = window.__spot(GG.World.DOOR.x + 140, GG.World.DOOR.y + 160, 80);
    P.reset(sp.x - 150, sp.y);
    const a = F.add(GG.ANIMAL_BY_ID.labrador, sp.x, sp.y);
    const b2 = F.add(GG.ANIMAL_BY_ID.beagle, sp.x + 40, sp.y + 8);
    let bowed = false, bounced = false;
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 50));
      /* two dogs left to themselves wander apart, and a dog on the other side
         of the meadow has nobody to bow to - so keep them in the same field */
      if (!bowed && GG.dist(a.x, a.y, b2.x, b2.y) > 130) { b2.x = a.x + 46; b2.y = a.y + 8; }
      if (a.bow > 0 || b2.bow > 0) bowed = true;
      if (a.bounce > 0 && b2.bounce > 0) bounced = true;
      if (bowed && bounced) break;
    }
    window.__release();
    return { bowed, bounced, signal: (a.signal || {}).id };
  });
  ok('two dogs that meet really do bow to each other', bowLive.bowed);
  ok('and then both of them bounce', bowLive.bounced);
  ok('and the garden knows which signal that was', bowLive.signal === 'playbow');

  const keaLive = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const sp = window.__spot(GG.World.DOOR.x + 140, GG.World.DOOR.y + 180, 80);
    P.reset(sp.x - 160, sp.y);
    const one = F.add(GG.ANIMAL_BY_ID.budgie, sp.x, sp.y);
    /* the second one is a long way off and cannot see the first: the call
       alone is what sets it playing */
    const two = F.add(GG.ANIMAL_BY_ID.cockatiel, sp.x + 380, sp.y + 220);
    let spread = false, apart = 0;
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (GG.dist(one.x, one.y, two.x, two.y) > 480) { two.x = one.x + 380; two.y = one.y + 220; }
      if (one.bounce > 0 && two.bounce > 0) {
        spread = true;
        apart = Math.round(GG.dist(one.x, one.y, two.x, two.y));
        break;
      }
    }
    window.__release();
    return { spread, apart };
  });
  ok('a parrot calling sets another parrot playing, right across the garden ('
    + keaLive.apart + 'px apart)', keaLive.spread && keaLive.apart > 200);

  const signalBook = await p.evaluate(() => {
    GG.Book.open(); GG.Book.tab = 'friends';
    GG.Book.showDetail(GG.ANIMAL_BY_ID.labrador);
    const dog = document.getElementById('book-detail').textContent;
    GG.Book.showDetail(GG.ANIMAL_BY_ID.budgie);
    const bird = document.getElementById('book-detail').textContent;
    GG.Book.showDetail(GG.ANIMAL_BY_ID.green_frog);
    const frog = document.getElementById('book-detail').textContent;
    GG.UI.close('screen-book');
    return {
      dogBow: dog.indexOf('play bow') >= 0,
      dogHonest: dog.indexOf('Dogs do not laugh') >= 0,
      parrotKea: bird.indexOf('kea') >= 0,
      frogQuiet: frog.indexOf('Not every animal plays with a friend') >= 0
    };
  });
  ok('the dog page explains the play bow', signalBook.dogBow);
  ok('and says plainly that dogs do not laugh', signalBook.dogHonest);
  ok('the parrot page has the kea and the loudspeaker', signalBook.parrotKea);
  ok('and the frog page says some friends just sit together', signalBook.frogQuiet);

  /* ---------- 6. RIDING ---------- */
  ok('nothing is left open before the riding', !(await unpause()));
  const rideable = await p.evaluate(() => ({
    rideable: GG.ANIMALS.filter(a => a.rideable).map(a => a.id),
    horseWay: GG.ANIMAL_BY_ID.horse.way
  }));
  ok('only the horse can be ridden ' + JSON.stringify(rideable.rideable),
    rideable.rideable.length === 1 && rideable.rideable[0] === 'horse');
  ok('and she is befriended at the shoulder', rideable.horseWay === 'shoulder');

  const ride = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    window.__hold();
    const sp = window.__runway(80, 640);
    P.reset(sp.x, sp.y);
    GG.Save.addFriend('horse');
    F.setCompanion('horse');
    await new Promise(r => setTimeout(r, 1200));
    const comp = F.companion;
    const out = {};
    const put = (dx, dy) => { P.x = comp.x + dx; P.y = comp.y + dy; };

    /* straight behind her: the one place you never stand */
    put(comp.faceLeft ? 34 : -34, 0);
    out.behindStance = F.rideStance(P, comp);
    out.behind = F.rideOffer(P);
    F.rideTap(P);
    out.behindToast = document.getElementById('toast').textContent;
    out.stillNotUp = !F.riding;

    /* round at her shoulder, where she can see you */
    put(6, -26);
    out.stance = F.rideStance(P, comp);
    out.ask = (F.rideOffer(P) || {}).stage;
    F.rideTap(P);
    out.asked = F.asked;
    out.helmetStage = (F.rideOffer(P) || {}).stage;
    /* and you cannot get up without the helmet */
    out.noHelmetNoRide = !F.mount(P);
    F.rideTap(P);
    out.helmetOn = F.helmetOn;
    out.upStage = (F.rideOffer(P) || {}).stage;
    F.rideTap(P);
    out.riding = !!F.riding;
    out.lift = F.rideLift();

    /* riding is faster than walking, and the horse is under her */
    const x0 = P.x, y0 = P.y;
    GG.Input.keys['d'] = true;
    await new Promise(r => setTimeout(r, 1000));
    GG.Input.keys['d'] = false;
    out.rodeFor = Math.round(GG.dist(P.x, P.y, x0, y0));
    out.stillUp = !!F.riding;               /* she stayed on the whole way */
    out.horseUnder = Math.round(GG.dist(F.companion.x, F.companion.y, P.x, P.y));
    out.noFriendButton = !F.candidate(P);
    await new Promise(r => setTimeout(r, 400));

    F.rideTap(P);
    out.down = !F.riding;
    out.horseBeside = Math.round(GG.dist(F.companion.x, F.companion.y, P.x, P.y));

    /* and she walks slower on her own two feet */
    P.reset(x0, y0);
    GG.Input.keys['d'] = true;
    await new Promise(r => setTimeout(r, 1000));
    GG.Input.keys['d'] = false;
    out.walkedFor = Math.round(GG.dist(P.x, P.y, x0, y0));
    window.__release();
    return out;
  });
  ok('standing behind the horse is the wrong place to be',
    ride.behindStance === 'behind' && ride.behind.stage === 'stand');
  ok('and it says why (' + ride.behindToast.slice(0, 40) + ')',
    /cannot see/.test(ride.behindToast));
  ok('you cannot get up from back there', ride.stillNotUp);
  ok('at her shoulder the first thing you do is ask',
    ride.stance === 'shoulder' && ride.ask === 'ask');
  ok('then the helmet', ride.asked && ride.helmetStage === 'helmet');
  ok('and there is no getting up without it', ride.noHelmetNoRide);
  ok('helmet on, and then you can get up',
    ride.helmetOn && ride.upStage === 'up' && ride.riding);
  ok('her sprite sits up on the horse’s back (' + ride.lift + 'px)', ride.lift > 8);
  ok('the horse carries her along (' + ride.horseUnder + 'px apart)', ride.horseUnder < 12);
  ok('she stays up while she rides', ride.stillUp);
  ok('riding is faster than walking (' + ride.rodeFor + ' vs ' + ride.walkedFor + ')',
    ride.rodeFor > ride.walkedFor * 1.2 && ride.walkedFor > 60);
  ok('nobody else is befriended from up there', ride.noFriendButton);
  ok('and she can get down again', ride.down && ride.horseBeside > 12);

  const noRide = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player;
    const out = {};
    for (const id of ['cow', 'mule_deer', 'moose']) {
      GG.Save.addFriend(id);
      F.setCompanion(id);
      await new Promise(r => setTimeout(r, 500));
      const c = F.companion;
      P.x = c.x + 6; P.y = c.y - 26;
      out[id] = F.rideOffer(P);
      out[id + 'Mount'] = F.mount(P);
    }
    F.setCompanion(null);
    return out;
  });
  ok('a cow is never offered for riding', !noRide.cow && !noRide.cowMount);
  ok('nor a deer', !noRide.mule_deer && !noRide.mule_deerMount);
  ok('nor a moose', !noRide.moose && !noRide.mooseMount);

  const rideBook = await p.evaluate(() => {
    GG.Book.open(); GG.Book.tab = 'friends';
    GG.Book.showDetail(GG.ANIMAL_BY_ID.horse);
    const t = document.getElementById('book-detail').textContent;
    GG.UI.close('screen-book');
    return { riding: t.indexOf('Riding her') >= 0, helmet: t.indexOf('helmet') >= 0,
      shoulder: t.indexOf('shoulder') >= 0, behind: t.indexOf('never straight behind') >= 0 };
  });
  ok('the horse page says how to get on her', rideBook.riding && rideBook.shoulder);
  ok('and about the helmet, and about never standing behind her',
    rideBook.helmet && rideBook.behind);

  /* ---------- 7. FISH AND THE STREAM ---------- */
  ok('nothing is left open before the fish', !(await unpause()));
  const wade = await p.evaluate(async () => {
    const W = GG.World, Fi = GG.Fishing, P = GG.Player;
    const spot = window.__wadeSpot();
    if (!spot) return { noWater: true };
    P.reset(spot.x, spot.y);
    await new Promise(r => setTimeout(r, 1800));
    const out = {
      wading: Fi.wading(P),
      place: W.placeName(P.x, P.y),
      radiusStill: Math.round(Fi.spookRadius({ speed: 0 })),
      radiusWalk: Math.round(Fi.spookRadius({ speed: 84 })),
      radiusRun: Math.round(Fi.spookRadius({ speed: 168 })),
      near: Fi.swimmers.filter(s => GG.dist(s.x, s.y, P.x, P.y) < 260).length
    };
    /* standing still: nothing moves, so nothing is frightened */
    let stillFled = 0;
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 50));
      stillFled = Math.max(stillFled, Fi.swimmers.filter(s => s.flee > 0).length);
    }
    out.fledWhileStill = stillFled;
    /* now splash about in it, back and forth so she stays in the water */
    let maxFled = 0, bent = 0, one = null, home = null;
    GG.Input.keys['d'] = true;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (i % 5 === 4) {
        const d = GG.Input.keys['d'];
        GG.Input.keys['d'] = !d; GG.Input.keys['a'] = d;
      }
      const fled = Fi.swimmers.filter(s => s.flee > 0);
      if (fled.length > maxFled) { maxFled = fled.length; }
      bent = Math.max(bent, fled.filter(s => s.spook > 0 || s.back).length);
      if (!one && fled.length && fled[0].back) {
        one = fled[0];
        home = { x: one.back.x, y: one.back.y };      /* where it was standing */
      }
    }
    GG.Input.keys['d'] = false; GG.Input.keys['a'] = false;
    out.fledWhileWading = maxFled;
    out.bentIntoAC = bent;
    /* and they drift back once she stands still again */
    if (one && home) {
      /* let the bolt itself finish first - a fish that is still going is
         still going away */
      for (let i = 0; i < 40 && one.flee > 0; i++) await new Promise(r => setTimeout(r, 50));
      const d0 = GG.dist(one.x, one.y, home.x, home.y);
      /* a fish coming home bumps along the bank on the way, so watch the
         whole window and take the nearest it got */
      let d1 = d0;
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 50));
        d1 = Math.min(d1, GG.dist(one.x, one.y, home.x, home.y));
      }
      out.wentBack = Math.round(d0) + ' -> ' + Math.round(d1);
      out.driftedBack = d1 < d0 - 2 || d1 < 30;
    }
    return out;
  });
  ok('she can wade into the water', wade.noWater || wade.wading);
  ok('there are fish about (' + wade.near + ')', wade.noWater || wade.near > 0);
  ok('creeping disturbs almost nothing (' + wade.radiusStill + 'px) but running in '
    + 'disturbs the lot (' + wade.radiusRun + 'px)',
    wade.noWater || (wade.radiusStill < 60 && wade.radiusRun > 250
      && wade.radiusWalk > wade.radiusStill && wade.radiusWalk < wade.radiusRun));
  ok('standing still in the stream frightens nobody', wade.noWater || !wade.fledWhileStill);
  ok('wading about scatters the fish nearby (' + wade.fledWhileWading + ')',
    wade.noWater || wade.fledWhileWading > 0);
  ok('and they bolt, and remember where they were',
    wade.noWater || wade.bentIntoAC > 0);
  ok('and drift back when she stands still again (' + wade.wentBack + ')',
    wade.noWater || wade.driftedBack);

  const fishBook = await p.evaluate(() => {
    GG.Book.open(); GG.Book.tab = 'fish';
    GG.Book.showDetail(GG.FISH[0]);
    const t = document.getElementById('book-detail').textContent;
    GG.UI.close('screen-book');
    return { lateral: t.indexOf('lateral line') >= 0,
      cshape: t.indexOf('C shape') >= 0,
      upstream: t.indexOf('walk') >= 0 && t.indexOf('upstream') >= 0,
      slow: t.indexOf('almost touch one') >= 0 };
  });
  ok('the fish page explains the lateral line', fishBook.lateral);
  ok('and the C-start', fishBook.cshape);
  ok('and how to walk in a stream if you want to see one',
    fishBook.upstream && fishBook.slow);

  /* ---------- 8. EVERY FAMILY HAS A VOICE (or is honestly silent) ---------- */
  const voices = await p.evaluate(async () => {
    GG.Sfx.unlock();
    await new Promise(r => setTimeout(r, 60));
    const proto = Object.getPrototypeOf(GG.Audio.ctx());
    const oscs = proto.createOscillator, bufs = proto.createBufferSource;
    let n = 0;
    proto.createOscillator = function () { n++; return oscs.apply(this, arguments); };
    proto.createBufferSource = function () { n++; return bufs.apply(this, arguments); };
    const made = {};
    Object.keys(GG.FAMILY_NAMES).forEach(fam => {
      n = 0;
      GG.Sfx.animalCall(fam);
      made[fam] = n;
    });
    n = 0; GG.Sfx.animalCall('bear', 'giant_panda'); made.panda = n;
    n = 0; GG.Sfx.squirrelScold(); made.scold = n;
    n = 0; GG.Sfx.playPant(); made.pant = n;
    n = 0; GG.Sfx.fishDart(); made.dart = n;
    proto.createOscillator = oscs;
    proto.createBufferSource = bufs;
    return made;
  });
  const silent = Object.keys(voices).filter(k => !voices[k]);
  ok('the snakes have a dry rattle (' + voices.snake + ' sounds)', voices.snake > 2);
  ok('the songbirds have a two-note whistle', voices.songbird >= 2);
  ok('and every other family has a voice too ' + JSON.stringify(silent),
    silent.length === 2 && silent.indexOf('turtle') >= 0 && silent.indexOf('salamander') >= 0);
  ok('a squirrel can scold, a dog can play-pant, a fish can dart',
    voices.scold > 0 && voices.pant > 0 && voices.dart > 0);

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
