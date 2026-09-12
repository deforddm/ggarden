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
  ok('22 animals (got ' + roster.count + ')', roster.count === 22);
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
  ok('it lists every animal', book.cells === 22);
  ok('one is found (' + book.progress + ')', book.got === 1 && book.progress === '1 / 22');
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

  r.forEach(l => console.log(l));
  if (errs.length) { console.log('--- errors ---'); errs.forEach(e => console.log(e)); }
  console.log(r.filter(x => x.startsWith('FAIL')).length ? 'SOME FAILED' : 'ALL PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
