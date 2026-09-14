/* v1.12: picking fruit, the footbridge, and the new orchard and hill bugs. */
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
  await p.waitForTimeout(800);

  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);

  /* ---------------- the fruit roster ---------------- */
  const roster = await p.evaluate(() => {
    const bad = { noFacts: [], shortFact: [], noCare: [], shortCare: [], badEat: [],
      noRipens: [], noMeasure: [], noUnlock: [], badWhere: [], dupe: [], noShape: [] };
    const seen = {};
    GG.FRUITS.forEach(f => {
      if (seen[f.id]) bad.dupe.push(f.id);
      seen[f.id] = 1;
      if (!GG.FruitArt.shapes[f.shape]) bad.noShape.push(f.id);
      if (!f.facts || f.facts.length < 2) bad.noFacts.push(f.id);
      (f.facts || []).forEach(x => { if (x.length < 40) bad.shortFact.push(f.id); });
      if (!f.care) bad.noCare.push(f.id);
      else if (f.care.length < 40) bad.shortCare.push(f.id);
      if (['yes', 'careful', 'never'].indexOf(f.eat) < 0) bad.badEat.push(f.id);
      if (!f.ripens) bad.noRipens.push(f.id);
      if (!f.measure) bad.noMeasure.push(f.id);
      if (!GG.DECOR_BY_ID[f.unlock]) bad.noUnlock.push(f.id);
      if (['orchard', 'hill'].indexOf(f.where) < 0) bad.badWhere.push(f.id);
    });
    const kinds = {};
    GG.FRUITS.forEach(f => { kinds[f.eat] = (kinds[f.eat] || 0) + 1; });
    return { bad, count: GG.FRUITS.length, kinds,
      orchard: GG.FRUITS.filter(f => f.where === 'orchard').length,
      hill: GG.FRUITS.filter(f => f.where === 'hill').length };
  });
  Object.keys(roster.bad).forEach(k =>
    ok('fruit ' + k + ' ' + JSON.stringify(roster.bad[k]), !roster.bad[k].length));
  ok('ten fruits (got ' + roster.count + ')', roster.count === 10);
  ok('five in the orchard and five in the hills',
    roster.orchard === 5 && roster.hill === 5);
  ok('all three eat ratings are used ' + JSON.stringify(roster.kinds),
    roster.kinds.yes > 0 && roster.kinds.careful > 0 && roster.kinds.never > 0);

  /* the safety lines really say the dangerous thing */
  const safety = await p.evaluate(() => ({
    snowberryNever: GG.FRUIT_BY_ID.snowberry.eat === 'never',
    snowberrySaysSo: /not eat|do not eat|never/i.test(GG.FRUIT_BY_ID.snowberry.care),
    chokeStone: /stone/i.test(GG.FRUIT_BY_ID.chokecherry.care),
    chokeLeaves: /leaves/i.test(GG.FRUIT_BY_ID.chokecherry.care),
    pearHard: /hard/i.test(GG.FRUIT_BY_ID.bartlett_pear.care),
    hipHairs: /hair/i.test(GG.FRUIT_BY_ID.rosehip.care),
    cherryStone: /stone/i.test(GG.FRUIT_BY_ID.bing_cherry.care)
  }));
  ok('the snowberry is marked never eat', safety.snowberryNever && safety.snowberrySaysSo);
  ok('the chokecherry warns about the stone and the leaves',
    safety.chokeStone && safety.chokeLeaves);
  ok('the cherry says to spit the stone out', safety.cherryStone);
  ok('the pear says to let it soften first', safety.pearHard);
  ok('the rose hip warns about the itchy hairs', safety.hipHairs);

  /* every fruit actually draws something */
  const drawn = await p.evaluate(() => {
    const bad = [];
    GG.FRUITS.forEach(f => {
      const cv = document.createElement('canvas'); cv.width = 80; cv.height = 80;
      const c = cv.getContext('2d');
      try { GG.FruitArt.draw(c, f, 40, 40, 2.4, 1.1); } catch (e) { bad.push(f.id + ':' + e.message); return; }
      const d = c.getImageData(0, 0, 80, 80).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
      if (n < 60) bad.push(f.id + ':' + n);
    });
    return bad;
  });
  ok('every fruit draws something ' + JSON.stringify(drawn), !drawn.length);

  /* the decorations they unlock */
  const decor = await p.evaluate(() => {
    const list = GG.DECOR.filter(d => d.fruit);
    const bad = { noArt: [], notFree: [], badFruit: [], blank: [] };
    list.forEach(d => {
      if (!GG.DecorArt[d.id]) { bad.noArt.push(d.id); return; }
      if (d.price !== 0) bad.notFree.push(d.id);
      if (!GG.FRUIT_BY_ID[d.fruit]) bad.badFruit.push(d.id);
      const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120;
      const c = cv.getContext('2d');
      GG.DecorArt[d.id](c, 60, 100, 1.6, 1.2);
      const px = c.getImageData(0, 0, 120, 120).data;
      let n = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 8) n++;
      if (n < 80) bad.blank.push(d.id + ':' + n);
    });
    return { count: list.length, bad,
      startsLocked: list.every(d => GG.Save.fresh().unlockedDecor.indexOf(d.id) < 0) };
  });
  Object.keys(decor.bad).forEach(k =>
    ok('fruit decor ' + k + ' ' + JSON.stringify(decor.bad[k]), !decor.bad[k].length));
  ok('ten fruit decorations (got ' + decor.count + ')', decor.count === 10);
  ok('none of them are unlocked to begin with', decor.startsLocked);

  /* ---------------- the plants out in the garden ---------------- */
  const plants = await p.evaluate(() => {
    const by = {};
    GG.Orchard.plants.forEach(q => { by[q.fruit] = (by[q.fruit] || 0) + 1; });
    const placeOK = GG.Orchard.plants.every(q => {
      const def = GG.FRUIT_BY_ID[q.fruit];
      const place = GG.World.biomeRaw(q.x, q.y);
      return def.where === 'orchard' ? q.type === 'appleTree' : q.type === 'wildBush';
    });
    return { total: GG.Orchard.plants.length, by, placeOK,
      everyKind: GG.FRUITS.every(f => by[f.id] >= 4),
      allRipe: GG.Orchard.plants.every(q => q.ripe === 1) };
  });
  ok('the garden is planted (' + plants.total + ' plants)', plants.total > 60);
  ok('every kind of fruit grows somewhere ' + JSON.stringify(plants.by), plants.everyKind);
  ok('orchard fruit on trees, hill fruit on bushes', plants.placeOK);
  ok('all of it starts ripe', plants.allRipe);

  /* ---------------- picking ---------------- */
  const walkTo = async (fx, fy) => p.evaluate(({ fx, fy }) => {
    GG.Player.reset(fx, fy);
  }, { fx, fy });

  const pick = await p.evaluate(async () => {
    const plant = GG.Orchard.plants.find(q => q.fruit === 'gala');
    GG.Player.reset(plant.x, plant.y + 40);
    await new Promise(r => setTimeout(r, 260));
    const near = GG.Orchard.nearest(GG.Player);
    const label = document.getElementById('btn-a').textContent;
    const before = GG.Save.countOfFruit('gala');
    const res = GG.Orchard.pick(near);
    return {
      found: !!near, sameTree: near === plant,
      label,
      first: res.first, unlocked: res.unlocked && res.unlocked.id,
      before, after: GG.Save.countOfFruit('gala'),
      bare: plant.ripe, regrow: plant.regrow > 0,
      inSave: GG.Save.data.unlockedDecor.indexOf('appleplate') >= 0,
      nearestNowSkipsIt: GG.Orchard.nearest(GG.Player) !== plant
    };
  });
  ok('standing by a tree finds its fruit', pick.found && pick.sameTree);
  ok('and the button says PICK (' + pick.label.replace(/\s+/g, ' ') + ')', /PICK/.test(pick.label));
  ok('picking it counts (' + pick.before + ' -> ' + pick.after + ')', pick.after === pick.before + 1);
  ok('the first one unlocks its decoration (' + pick.unlocked + ')',
    pick.first && pick.unlocked === 'appleplate' && pick.inSave);
  ok('the tree is bare afterwards', pick.bare === 0 && pick.regrow);
  ok('and it is no longer offered', pick.nearestNowSkipsIt);

  const regrow = await p.evaluate(async () => {
    const plant = GG.Orchard.plants.find(q => q.fruit === 'gala' && q.ripe < 1);
    plant.regrow = 0.05;
    GG.Orchard.update(0.1);
    return { ripe: plant.ripe, offered: GG.Orchard.nearest(GG.Player) === plant };
  });
  ok('the fruit grows back', regrow.ripe === 1);

  /* a second pick of the same kind is not a new unlock */
  const second = await p.evaluate(() => {
    const plant = GG.Orchard.plants.find(q => q.fruit === 'gala' && q.ripe === 1);
    const res = GG.Orchard.pick(plant);
    return { first: res.first, unlocked: !!res.unlocked, count: GG.Save.countOfFruit('gala') };
  });
  ok('picking a second one is not a new page', !second.first && !second.unlocked);
  ok('but it still counts (' + second.count + ')', second.count === 2);

  /* the card that pops up */
  const card = await p.evaluate(() => {
    const plant = GG.Orchard.plants.find(q => q.fruit === 'snowberry' && q.ripe === 1);
    const res = GG.Orchard.pick(plant);
    GG.UI.showFruit(res);
    const care = document.getElementById('catch-care');
    return {
      shown: !document.getElementById('catch-pop').classList.contains('hidden'),
      name: document.getElementById('catch-name').textContent,
      careShown: care.style.display !== 'none',
      careClass: care.className,
      careText: care.textContent,
      reward: document.getElementById('catch-reward').textContent
    };
  });
  ok('the fruit card appears', card.shown && card.name === 'Snowberry');
  ok('with a red "never eat" box', card.careShown && card.careClass === 'eat-never');
  ok('and it says not to eat it', /not eat/i.test(card.careText));
  ok('and names the decoration it unlocked (' + card.reward + ')', /Snowberry Sprig/.test(card.reward));
  await p.evaluate(() => GG.UI.hideCatch());

  /* the ordinary catch card does not keep the fruit warning */
  const clean = await p.evaluate(() => {
    GG.UI.showCatch(GG.BUG_BY_ID.ladybug, true, 20);
    const hidden = document.getElementById('catch-care').style.display === 'none';
    GG.UI.hideCatch();
    return hidden;
  });
  ok('the bug card has no fruit warning on it', clean);

  /* ---------------- the Fruit Book ---------------- */
  const book = await p.evaluate(() => {
    GG.Book.open('fruit');
    const cells = document.querySelectorAll('#book-grid .bugcell');
    const got = document.querySelectorAll('#book-grid .bugcell.got');
    return {
      title: document.getElementById('book-title').textContent,
      cells: cells.length,
      got: got.length,
      progress: document.getElementById('progress').textContent.trim(),
      tab: !!document.querySelector('#book-tabs .tab[data-book="fruit"].on')
    };
  });
  ok('the Fruit Book opens', book.title === 'Fruit Book' && book.tab);
  ok('it lists every fruit (' + book.cells + ')', book.cells === 10);
  ok('and counts the two she has picked (' + book.progress + ')', book.progress === '2 / 10');

  const page = await p.evaluate(() => {
    GG.Book.showDetail(GG.FRUIT_BY_ID.chokecherry);
    const det = document.getElementById('book-detail');
    const care = document.getElementById('fruit-care');
    return {
      shown: det.style.display === 'block',
      tags: Array.from(det.querySelectorAll('.meta .tag')).map(e => e.textContent),
      care: care ? care.textContent : '',
      careClass: care ? care.className : '',
      facts: det.querySelectorAll('.factline').length,
      back: document.getElementById('book-back').textContent
    };
  });
  ok('a fruit page opens', page.shown && page.facts >= 3);
  ok('it says where it grows and when', page.tags.some(t => /Grows in: the Pebble Hills/.test(t))
    && page.tags.some(t => /Ripe in:/.test(t)));
  ok('it names the decoration it unlocks', page.tags.some(t => /Unlocked:/.test(t)));
  ok('and it carries the careful box', page.careClass === 'eat-careful' && /stone/i.test(page.care));
  ok('the back button says All fruit', page.back === 'All fruit');

  await p.evaluate(() => GG.UI.close('screen-book'));

  /* ---------------- the shop ---------------- */
  const shop = await p.evaluate(() => {
    GG.Shop.open();
    const items = Array.from(document.querySelectorAll('#shop-grid .shopitem'));
    const names = items.map(e => e.querySelector('.nm').textContent);
    const prices = items.map(e => e.querySelector('.price').textContent);
    const groups = Array.from(document.querySelectorAll('#shop-grid .shop-group')).map(e => e.textContent);
    return {
      pickedGroup: groups.some(g => /Picked, not bought/.test(g)),
      hidden: names.filter((n, i) => n === '???').length,
      pickOne: prices.filter(x => x === 'pick one').length,
      plateOwned: names.indexOf('Plate of Apples') >= 0
        && prices[names.indexOf('Plate of Apples')] === 'owned'
    };
  });
  ok('the shop has a picked-not-bought shelf', shop.pickedGroup);
  ok('the ones she has not found are still a mystery (' + shop.hidden + ')', shop.hidden === 8);
  ok('and they say "pick one" instead of a price', shop.pickOne === 8);
  ok('the apple plate she earned is hers', shop.plateOwned);
  await p.evaluate(() => GG.UI.close('screen-shop'));

  /* it all survives a reload */
  await p.evaluate(() => GG.Save.save());
  await p.reload();
  await p.waitForTimeout(800);
  await p.click('#btn-play');
  await p.waitForTimeout(700);
  await p.evaluate(() => {
    const n = document.getElementById('screen-news');
    if (n && !n.classList.contains('hidden')) GG.UI.close('screen-news');
  });
  const after = await p.evaluate(() => ({
    gala: GG.Save.countOfFruit('gala'),
    snow: GG.Save.hasFruit('snowberry'),
    kinds: GG.Orchard.kinds(),
    decor: GG.Save.data.unlockedDecor.indexOf('appleplate') >= 0
      && GG.Save.data.unlockedDecor.indexOf('snowsprig') >= 0,
    plantsRipeAgain: GG.Orchard.plants.every(q => q.ripe === 1)
  }));
  ok('the fruit she picked survives a reload (' + after.gala + ')', after.gala === 2 && after.snow);
  ok('so do the decorations it unlocked', after.decor);
  ok('two kinds in the basket', after.kinds === 2);
  ok('and the garden is ripe again next time she plays', after.plantsRipeAgain);

  /* ---------------- the footbridge ---------------- */
  const bridge = await p.evaluate(() => {
    const W = GG.World, B = W.bridge;
    let blocked = 0, wet = 0, n = 0;
    for (let f = 0; f <= 1.0001; f += 0.02) {
      const x = B.ax + (B.bx - B.ax) * f, y = B.ay + (B.by - B.ay) * f;
      n++;
      if (W.blocked(x, y, 12)) blocked++;
      if (W.isWater(x, y)) wet++;
    }
    /* just off the side of the deck she is back in the water */
    const offSide = W.blocked(B.x - B.dy * (B.w / 2 + 26), B.y + B.dx * (B.w / 2 + 26), 12);
    return {
      ends: [W.isWater(B.ax, B.ay), W.isWater(B.bx, B.by)],
      endPlaces: [W.placeName(B.ax, B.ay), W.placeName(B.bx, B.by)],
      blocked, wet, n,
      onDeck: W.onBridge(B.x, B.y),
      offEnd: !W.onBridge(B.ax - B.dx * 30, B.ay - B.dy * 30),
      offSide,
      fishable: GG.Fishing.fishable(B.x, B.y)
    };
  });
  ok('both ends of the footbridge are on dry land ('
    + bridge.endPlaces.join(' / ') + ')', !bridge.ends[0] && !bridge.ends[1]);
  ok('nothing blocks the way across', bridge.blocked === 0);
  ok('and most of it really is over water (' + bridge.wet + '/' + bridge.n + ')',
    bridge.wet > bridge.n * 0.5);
  ok('the deck test knows where the deck is',
    bridge.onDeck && bridge.offEnd);
  ok('step off the side and it is deep water again', bridge.offSide);
  ok('there is water under it to fish in', bridge.fishable);

  /* she can actually walk from one side to the other */
  const walk = await p.evaluate(async () => {
    const W = GG.World, B = W.bridge, P = GG.Player;
    const startX = B.ax - B.dx * 22, startY = B.ay - B.dy * 22;
    P.reset(startX, startY);
    /* hold the joystick pointing along the bridge */
    GG.Input.stick.active = true;
    GG.Input.x = B.dx; GG.Input.y = B.dy; GG.Input.mag = 1;
    const t0 = Date.now();
    while (Date.now() - t0 < 4000) {
      await new Promise(r => setTimeout(r, 60));
      GG.Input.x = B.dx; GG.Input.y = B.dy; GG.Input.mag = 1;
      const along = (P.x - B.x) * B.dx + (P.y - B.y) * B.dy;
      if (along > B.len / 2 - 6) break;
    }
    GG.Input.stick.active = false;
    GG.Input.x = 0; GG.Input.y = 0; GG.Input.mag = 0;
    const along = (P.x - B.x) * B.dx + (P.y - B.y) * B.dy;
    return { along: Math.round(along), half: Math.round(B.len / 2),
      crossed: along > 0, dry: !W.isWater(P.x, P.y), x: Math.round(P.x), y: Math.round(P.y) };
  });
  ok('Guin walks right across the footbridge (' + walk.along + ' of ' + walk.half + ')',
    walk.crossed && walk.along > walk.half - 20);
  ok('and ends up on the far bank, out of the water', walk.dry);

  /* casting from the middle of the bridge */
  const cast = await p.evaluate(() => {
    const B = GG.World.bridge, P = GG.Player;
    P.reset(B.x, B.y);
    P.angle = B.ang + Math.PI / 2;
    const t = GG.Fishing.castTarget(P);
    const got = t ? GG.Fishing.cast(P) : false;
    const st = GG.Fishing.state;
    GG.Fishing.reset();
    return { hasTarget: !!t, cast: got, state: st };
  });
  ok('she can cast a line off the side of the bridge', cast.hasTarget && cast.cast);

  /* ---------------- the new bugs ---------------- */
  const bugs = await p.evaluate(() => {
    const NEW = ['mason_bee', 'yellowjacket', 'baldfaced_hornet', 'sap_beetle', 'apple_maggot_fly',
      'snakefly', 'bee_fly', 'cross_orbweaver', 'tenlined_beetle', 'ground_beetle',
      'jerusalem_cricket', 'northern_scorpion', 'windscorpion', 'pinacate_beetle', 'harvester_ant',
      'velvet_ant', 'robber_fly', 'blister_beetle', 'sweat_bee', 'behrs_hairstreak'];
    const missing = NEW.filter(id => !GG.BUG_BY_ID[id]);
    const blank = [];
    NEW.forEach(id => {
      const def = GG.BUG_BY_ID[id]; if (!def) return;
      const cv = document.createElement('canvas'); cv.width = 90; cv.height = 90;
      const c = cv.getContext('2d');
      GG.BugArt.draw(c, def, 45, 45, 2.6, -Math.PI / 2, 1.2);
      const d = c.getImageData(0, 0, 90, 90).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
      if (n < 120) blank.push(id + ':' + n);
    });
    const byPlace = (place) => GG.BUGS.filter(x => x.habitats.indexOf(place) >= 0).length;
    const atNight = (place) => GG.BUGS.filter(x =>
      x.habitats.indexOf(place) >= 0 &&
      (x.times.indexOf('night') >= 0 || x.times.indexOf('any') >= 0)).length;
    return { missing, blank, total: GG.BUGS.length,
      orchard: byPlace('orchard'), hill: byPlace('hill'),
      orchardNight: atNight('orchard'), hillNight: atNight('hill'),
      stingers: NEW.filter(id => GG.BUG_BY_ID[id] && GG.BUG_BY_ID[id].sting) };
  });
  ok('all twenty new bugs are in the roster ' + JSON.stringify(bugs.missing), !bugs.missing.length);
  ok('and every one of them draws something ' + JSON.stringify(bugs.blank), !bugs.blank.length);
  ok('the roster is 104 (got ' + bugs.total + ')', bugs.total === 104);
  ok('the orchard has plenty now (' + bugs.orchard + ')', bugs.orchard >= 25);
  ok('the hills are no longer empty (' + bugs.hill + ')', bugs.hill >= 13);
  ok('both have something out at night (' + bugs.orchardNight + ', ' + bugs.hillNight + ')',
    bugs.orchardNight >= 3 && bugs.hillNight >= 3);
  ok('the ones that sting are marked ' + JSON.stringify(bugs.stingers), bugs.stingers.length === 7);

  /* the new bugs really spawn where they should */
  const spawn = await p.evaluate(() => {
    const out = {};
    ['hill', 'orchard'].forEach(place => {
      ['day', 'night'].forEach(phase => {
        const list = GG.BUGS.filter(x =>
          (x.habitats.indexOf(place) >= 0 || x.habitats.indexOf('anywhere') >= 0) &&
          (x.times.indexOf(phase) >= 0 || x.times.indexOf('any') >= 0));
        out[place + '/' + phase] = list.length;
      });
    });
    return out;
  });
  ok('every place and time can fill up ' + JSON.stringify(spawn),
    Object.keys(spawn).every(k => spawn[k] >= 5));

  /* the food chain grew with them, and friends stayed out of it */
  const chain = await p.evaluate(() => {
    const ids = {};
    GG.BUGS.forEach(x => ids[x.id] = 1); GG.FISH.forEach(x => ids[x.id] = 1);
    const animals = {}; GG.ANIMALS.forEach(x => animals[x.id] = 1);
    const bad = [], withAnimals = [];
    Object.keys(GG.EATS).forEach(pred => {
      if (!ids[pred]) bad.push('pred:' + pred);
      if (animals[pred]) withAnimals.push(pred);
      GG.EATS[pred].forEach(prey => {
        if (!ids[prey]) bad.push(pred + '->' + prey);
        if (animals[prey]) withAnimals.push(pred + '->' + prey);
      });
    });
    return { bad, withAnimals, predators: Object.keys(GG.EATS).length,
      robber: GG.hunts('robber_fly', 'honeybee'),
      beeflyMason: GG.hunts('bee_fly', 'mason_bee'),
      scorpionBeetle: GG.hunts('northern_scorpion', 'pinacate_beetle'),
      noBackwards: !GG.hunts('mason_bee', 'bee_fly') };
  });
  ok('every new food-chain id is real ' + JSON.stringify(chain.bad), !chain.bad.length);
  ok('no tamed friend is in the food chain ' + JSON.stringify(chain.withAnimals), !chain.withAnimals.length);
  ok('a robber fly hunts a honeybee', chain.robber);
  ok('a bee fly goes after a mason bee', chain.beeflyMason);
  ok('a scorpion hunts a pinacate beetle', chain.scorpionBeetle);
  ok('and it only goes one way', chain.noBackwards);

  /* the new bugs can be caught and kept like any other */
  const keep = await p.evaluate(() => {
    const t = GG.Save.data.terrariums[0];
    t.type = 'terrarium';
    const before = t.bugs.length;
    const okAdd = GG.Terrarium.addItem
      ? true : true;
    return {
      fitsTerrarium: GG.bugFitsTank(GG.BUG_BY_ID.jerusalem_cricket, 'terrarium'),
      notAquatic: !GG.isAquaticBug(GG.BUG_BY_ID.windscorpion),
      before, okAdd
    };
  });
  ok('a Jerusalem cricket can live in a terrarium', keep.fitsTerrarium && keep.notAquatic);

  /* ---------------- look, don't catch ---------------- */
  const widow = await p.evaluate(() => {
    const d = GG.BUG_BY_ID.black_widow;
    if (!d) return { missing: true };
    const cv = document.createElement('canvas'); cv.width = 100; cv.height = 100;
    const c = cv.getContext('2d');
    GG.BugArt.draw(c, d, 50, 50, 2.8, -Math.PI / 2, 1.2);
    const px = c.getImageData(0, 0, 100, 100).data;
    let ink = 0, red = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 8) ink++;
      if (px[i] > 150 && px[i + 1] < 90 && px[i + 2] < 90 && px[i + 3] > 100) red++;
    }
    return {
      lookOnly: d.lookOnly === true,
      value: d.value,
      hills: d.habitats.length === 1 && d.habitats[0] === 'hill',
      night: d.times.indexOf('night') >= 0,
      danger: d.danger || '',
      facts: d.facts.length,
      ink, red,
      notAquatic: !GG.isAquaticBug(d),
      onlyOne: GG.BUGS.filter(x => x.lookOnly).length
    };
  });
  ok('the black widow is in the roster', !widow.missing && widow.lookOnly);
  ok('she lives on the hills after dark', widow.hills && widow.night);
  ok('she is the only look-only creature (' + widow.onlyOne + ')', widow.onlyOne === 1);
  ok('she draws, hourglass and all (' + widow.ink + 'px, ' + widow.red + ' red)',
    widow.ink > 200 && widow.red > 20);
  ok('she is worth no sparkles, because she is never caught', widow.value === 0);
  ok('her danger line says do not reach where you cannot see',
    /cannot see/i.test(widow.danger) && /rock/i.test(widow.danger));
  ok('and she has a proper page of facts (' + widow.facts + ')', widow.facts >= 4);

  const refuse = await p.evaluate(async () => {
    const P = GG.Player;
    /* away from the cottage, or GO IN wins the button */
    P.reset(GG.World.DOOR.x + 320, GG.World.DOOR.y + 300);
    await new Promise(r => setTimeout(r, 260));
    GG.Critters.clear();
    GG.Critters.add(GG.BUG_BY_ID.black_widow, P.x + 36, P.y + 8);
    await new Promise(r => setTimeout(r, 420));
    const before = GG.Critters.list.length;
    P.angle = 0;
    const caught = GG.Critters.tryCatch(P);
    return {
      near: !!GG.Critters.nearestLookOnly(P, 78),
      label: document.getElementById('btn-a').textContent.replace(/\s+/g, ' '),
      prompt: document.getElementById('prompt').textContent,
      caught: caught && caught.id,
      stillThere: GG.Critters.list.some(c => c.def.id === 'black_widow'),
      underNet: !!GG.Critters.lookOnlyUnderNet(P),
      before
    };
  });
  ok('standing beside her is noticed', refuse.near);
  ok('and the button says LOOK (' + refuse.label + ')', /LOOK/.test(refuse.label));
  ok('with a prompt that says she is not for catching',
    /not for catching/i.test(refuse.prompt));
  ok('the net refuses her', refuse.caught === null || refuse.caught === undefined);
  ok('and she is still sitting there afterwards', refuse.stillThere);
  ok('a swing at her is recognised for what it is', refuse.underNet);

  await p.click('#btn-a');
  await p.waitForTimeout(700);
  const wcard = await p.evaluate(() => ({
    shown: !document.getElementById('warn-pop').classList.contains('hidden'),
    badge: document.getElementById('warn-badge').textContent,
    name: document.getElementById('warn-name').textContent,
    danger: document.getElementById('warn-danger').textContent,
    paused: GG.UI.anyOpen(),
    seen: GG.Save.hasSeen('black_widow'),
    caught: GG.Save.has('black_widow'),
    inTray: Object.keys(GG.Save.data.caught).indexOf('black_widow') >= 0
  }));
  ok('meeting her shows the warning card', wcard.shown && wcard.name === 'Western Black Widow');
  ok('with the LOOK, DON\u2019T CATCH badge', /LOOK, DON/.test(wcard.badge));
  ok('and the safety line on it', /cannot see/i.test(wcard.danger));
  ok('the card pauses the garden while it is up', wcard.paused);
  ok('meeting her records her as MET, never as caught',
    wcard.seen && !wcard.caught && !wcard.inTray);

  await p.click('#warn-ok');
  await p.waitForTimeout(300);

  const wbook = await p.evaluate(() => {
    GG.Book.open('bugs');
    const cells = document.querySelectorAll('#book-grid .bugcell');
    const got = document.querySelectorAll('#book-grid .bugcell.got').length;
    GG.Book.showDetail(GG.BUG_BY_ID.black_widow);
    const det = document.getElementById('book-detail');
    const tags = Array.from(det.querySelectorAll('.meta .tag')).map(e => e.textContent);
    return {
      cells: cells.length,
      got,
      progress: document.getElementById('progress').textContent.trim(),
      tags,
      dangerBox: !!document.getElementById('fruit-care'),
      facts: det.querySelectorAll('.factline').length,
      hunts: !!det.querySelector('.foodchain')
    };
  });
  ok('the Bug Book lists 104 now (' + wbook.cells + ')', wbook.cells === 104);
  ok('meeting her opened her page (' + wbook.progress + ')', wbook.got >= 1);
  ok('the page says Met, not Caught', wbook.tags.some(t => /^Met: /.test(t))
    && !wbook.tags.some(t => /^Caught: /.test(t)));
  ok('it carries the look-don\u2019t-catch tag',
    wbook.tags.some(t => /Look, don/.test(t) && /net will not take her/.test(t)));
  ok('and the red safety box', wbook.dangerBox);
  ok('she is in the food chain like everybody else', wbook.hunts);
  await p.evaluate(() => GG.UI.close('screen-book'));

  /* she survives a reload as MET */
  await p.evaluate(() => GG.Save.save());
  await p.reload();
  await p.waitForTimeout(800);
  await p.click('#btn-play');
  await p.waitForTimeout(700);
  await p.evaluate(() => {
    const n = document.getElementById('screen-news');
    if (n && !n.classList.contains('hidden')) GG.UI.close('screen-news');
  });
  const wafter = await p.evaluate(() => ({
    seen: GG.Save.hasSeen('black_widow'),
    caught: GG.Save.has('black_widow'),
    counted: GG.Save.totalSpecies() >= 1,
    /* and an old save that somehow had her caught is tidied up */
    tidied: (function () {
      GG.Save.data.caught.black_widow = { count: 3, first: 1 };
      GG.Save.data.terrariums[0].bugs.push({ id: 'black_widow', x: 100, y: 100 });
      GG.Save.save();
      GG.Save.load();
      return !GG.Save.data.caught.black_widow
        && GG.Save.data.terrariums[0].bugs.every(x => x.id !== 'black_widow')
        && GG.Save.hasSeen('black_widow');
    })()
  }));
  ok('she is still MET after a reload', wafter.seen && !wafter.caught);
  ok('and she counts toward the book', wafter.counted);
  ok('an old save with her caught or in a tank is tidied up', wafter.tidied);

  console.log(r.join('\n'));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) ? 1 : 0);
})();
