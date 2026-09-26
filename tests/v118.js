/* v1.18: Dog's Paradise, and a great deal more to pick. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700); await p.tap('#btn-play'); await require('./charskip')(p); await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  await p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    GG.Critters.spawnNear = () => false; GG.Critters.clear();
  });

  /* ---------- the new pickables ---------- */
  const data = await p.evaluate(() => {
    const fresh = GG.FRUITS.filter(f => f.autoDecor);
    const bad = [];
    const kinds = {};
    fresh.forEach(f => {
      kinds[f.kind] = (kinds[f.kind] || 0) + 1;
      if (!f.facts || f.facts.length < 3) bad.push(f.id + ':facts');
      if (['yes', 'careful', 'never'].indexOf(f.eat) < 0) bad.push(f.id + ':eat');
      if (!f.care || f.care.length < 20) bad.push(f.id + ':care');
      if (!GG.DECOR_BY_ID[f.unlock] || !GG.DecorArt[f.unlock]) bad.push(f.id + ':decor');
      if (!GG.FruitArt.shapes[f.shape]) bad.push(f.id + ':shape');
      if (f.kind === 'flower' && !(f.petal && f.stemCol)) bad.push(f.id + ':petals');
    });
    const F = GG.FRUIT_BY_ID;
    return {
      n: fresh.length, bad, kinds,
      all: GG.FRUITS.every(f => f.kind),
      poison: ['baneberry', 'daffodil', 'foxglove', 'camas', 'red_elderberry', 'tulip', 'lupine'].every(id => F[id].eat === 'never'),
      stones: ['redhaven_peach', 'apricot', 'italian_plum', 'rainier_cherry'].every(id => F[id].eat === 'careful' && /stone|pit/i.test(F[id].care)),
      lavender: JSON.stringify(F.lavender.where) === '["garden","farmyard"]',
      hermiston: /Oregon/.test(F.watermelon.facts.join(' ')),
      dogsWarned: /dog/i.test(F.concord_grape.care) && /dog/i.test(F.walla_walla_onion.care),
      where: GG.fruitWhereName(F.carrot)
    };
  });
  ok('forty-three new things to pick (' + data.n + ') ' + JSON.stringify(data.kinds), data.n === 43
    && data.kinds.fruit === 6 && data.kinds.veg === 11 && data.kinds.berry === 12 && data.kinds.flower === 14);
  ok('each has facts, a safe-to-eat rating, a care line, art and a decoration ' + JSON.stringify(data.bad), !data.bad.length);
  ok('every pickable, old and new, has a kind', data.all);
  ok('the poisonous ones are all marked never', data.poison);
  ok('the stone fruit all say mind the stone', data.stones);
  ok('lavender grows in the garden and the farmyard, not the savanna', data.lavender);
  ok('the watermelon page says Hermiston is in Oregon', data.hermiston);
  ok('the grape and the onion both warn about dogs', data.dogsWarned);
  ok('where it grows reads as words (' + data.where + ')', data.where === 'the Farmyard and the Flower Garden');

  const planted = await p.evaluate(() => {
    const W = GG.World, bad = [], per = {};
    W.props.forEach(q => {
      if (!q.pick) return;
      per[q.pick] = (per[q.pick] || 0) + 1;
      const def = GG.FRUIT_BY_ID[q.pick];
      if (!GG.fruitGrowsIn(def, q.biome)) bad.push(q.pick + ' in ' + q.biome);
      if (W.biomeAt(q.x, q.y) !== q.biome) bad.push(q.pick + ' off its patch');
      if (W.isWater(q.x, q.y)) bad.push(q.pick + ' in the water');
      if (GG.Orchard.plants.indexOf(q) < 0) bad.push(q.pick + ' not pickable');
    });
    const none = GG.FRUITS.filter(f => f.autoDecor && f.on !== 'tree' && f.on !== 'vine' && !per[f.id]).map(f => f.id);
    /* each place listed for a plant has one of it */
    const missingPlace = [];
    GG.FRUITS.filter(f => f.autoDecor && f.on !== 'tree' && f.on !== 'vine').forEach(f => {
      [].concat(f.where).forEach(w => {
        if (!W.props.some(q => q.pick === f.id && q.biome === w)) missingPlace.push(f.id + '@' + w);
      });
    });
    const trees = ['redhaven_peach', 'apricot', 'italian_plum', 'rainier_cherry'].every(id =>
      GG.Orchard.plants.some(q => q.fruit === id && q.type === 'appleTree'));
    const vine = GG.Orchard.plants.some(q => q.fruit === 'concord_grape' && q.type === 'berryBush');
    return { bad, none, missingPlace, trees, vine, total: Object.keys(per).length };
  });
  ok('every bed, bush and flower grows where its page says ' + JSON.stringify(planted.bad.slice(0, 5)), !planted.bad.length);
  ok('every one of them is out in the world somewhere ' + JSON.stringify(planted.none), !planted.none.length);
  ok('and in every place it is listed for ' + JSON.stringify(planted.missingPlace), !planted.missingPlace.length);
  ok('the new fruit trees are in the orchard', planted.trees);
  ok('and the grape vine on the orchard rows', planted.vine);

  /* pick a carrot */
  const carrot = await p.evaluate(async () => {
    const gap = o => Math.min.apply(null, GG.Orchard.plants.filter(x => x !== o).map(x => Math.hypot(x.x - o.x, x.y - o.y - 30)));
    const q = GG.World.props.filter(o => o.pick === 'carrot').sort((a, c) => gap(c) - gap(a))[0];
    GG.Player.reset(q.x, q.y + 30);
    await new Promise(r => setTimeout(r, 300));
    const near = GG.Orchard.nearest(GG.Player);
    const prompt = document.getElementById('prompt').textContent;
    const label = document.getElementById('btn-a').textContent;
    const res = GG.Orchard.pick(near);
    return { near: near && near.fruit, prompt, label, first: res && res.first, unlocked: res && res.unlocked && res.unlocked.name,
      ripe: q.ripe, owned: GG.Save.data.unlockedDecor.indexOf('pk_carrot') >= 0 };
  });
  ok('walking up to a carrot bed offers the carrot (' + carrot.label + ')', carrot.near === 'carrot' && /PICK/.test(carrot.label) && /carrot/i.test(carrot.label));
  ok('the prompt says vegetable, not fruit (' + carrot.prompt + ')', /vegetable/.test(carrot.prompt));
  ok('picking it unlocks ' + carrot.unlocked, carrot.first && carrot.owned && /Crate of Carrots/.test(carrot.unlocked));
  ok('and the bed is bare until it grows back', carrot.ripe === 0);

  /* the Garden Book */
  const book = await p.evaluate(() => {
    GG.Book.open('fruit');
    const shelves = Array.from(document.querySelectorAll('#book-grid .book-shelf')).map(e => e.textContent);
    const r = {
      title: document.getElementById('book-title').textContent,
      cells: document.querySelectorAll('#book-grid .bugcell').length,
      shelves,
      tab: document.querySelector('#book-tabs .tab[data-book="fruit"]').textContent
    };
    GG.Book.showDetail(GG.FRUIT_BY_ID.carrot);
    r.tags = Array.from(document.querySelectorAll('#book-detail .tag')).map(e => e.textContent);
    GG.Book.showDetail(GG.FRUIT_BY_ID.tulip);
    r.flowerTags = Array.from(document.querySelectorAll('#book-detail .tag')).map(e => e.textContent);
    GG.UI.close('screen-book');
    return r;
  });
  ok('the Garden Book (' + book.title + ', tab ' + book.tab + ')', book.title === 'Garden Book' && book.tab === 'Garden');
  ok('it has shelves for fruit, berries, vegetables and flowers ' + JSON.stringify(book.shelves),
    book.shelves.length === 4 && /^Fruit/.test(book.shelves[0]) && /^Berries/.test(book.shelves[1])
    && /^Vegetables\s+1 \/ 11/.test(book.shelves[2]) && /^Flowers/.test(book.shelves[3]));
  ok('and every page is there (' + book.cells + ')', book.cells === 59);
  ok('the carrot page says where it grows and what it unlocked', book.tags.some(t => /Grows in: the Farmyard and the Flower Garden/.test(t))
    && book.tags.some(t => /Unlocked: Crate of Carrots/.test(t)));
  ok('a flower page says In bloom rather than Ripe in', book.flowerTags.some(t => /^In bloom:/.test(t)));

  /* ---------- Dog's Paradise ---------- */
  const park = await p.evaluate(() => {
    const W = GG.World, D = W.DOGPARK;
    const types = {};
    W.props.forEach(q => {
      if (q.x > D.x0 - 80 && q.x < D.x1 + 80 && q.y > D.y0 - 80 && q.y < D.y1 + 80) types[q.type] = (types[q.type] || 0) + 1;
    });
    const sign = W.props.find(q => q.type === 'sign' && /Paradise/.test(q.label));
    return {
      name: W.placeName(D.cx, D.cy), biome: W.biomeAt(D.cx, D.cy), types,
      sign: !!sign, also: JSON.stringify(GG.Critters.ALSO.dogpark),
      flat: ['tennisBall', 'dogBowl', 'boneToy'].every(t => W.props.some(q => q.type === t)),
      noOldMeadow: !W.props.some(q => (q.type === 'bush') && W.biomeAt(q.x, q.y) === 'dogpark'),
      where: GG.FRUITS_WHERE.dogpark
    };
  });
  ok('Dog’s Paradise is a place (' + park.name + ')', park.name === 'Dog’s Paradise' && park.biome === 'dogpark');
  ok('with an agility course, kennels, benches and a hydrant ' + JSON.stringify(park.types),
    park.types.dogJump >= 3 && park.types.dogWeave && park.types.dogTunnel && park.types.dogHouse >= 2
    && park.types.parkBench >= 2 && park.types.hydrant >= 1);
  ok('and balls, bones and water bowls lying on the grass', park.flat && park.types.tennisBall >= 6);
  ok('it has its own signpost', park.sign);
  ok('the bugs there are the meadow and garden ones', park.also === '["meadow","garden"]');

  const dogs = await p.evaluate(() => {
    const ids = ['golden_retriever', 'german_shepherd', 'dachshund', 'dalmatian', 'standard_poodle', 'australian_shepherd'];
    const bad = [];
    ids.forEach(id => {
      const a = GG.ANIMAL_BY_ID[id];
      if (!a) { bad.push(id + ':missing'); return; }
      if (a.family !== 'dog' || a.way !== 'ask') bad.push(id + ':way');
      if (a.places.indexOf('dogpark') < 0) bad.push(id + ':place');
      if (a.facts.length < 4 || !a.manners) bad.push(id + ':facts');
      const cv = document.createElement('canvas'); cv.width = 120; cv.height = 90;
      const c = cv.getContext('2d');
      const k = GG.animalFit(a, 80);
      GG.AnimalArt.draw(c, a, 60, 60, k, false, 1.1);
      const d = c.getImageData(0, 0, 120, 90).data;
      let n = 0, edge = 0;
      for (let y = 0; y < 90; y++) for (let x = 0; x < 120; x++) {
        if (d[(y * 120 + x) * 4 + 3] > 20) { n++; if (x < 2 || x > 117) edge++; }
      }
      if (n < 600) bad.push(id + ':blank ' + n);
      if (edge > 4) bad.push(id + ':overflows ' + edge);
    });
    const parkDogs = GG.ANIMALS.filter(a => a.places.indexOf('dogpark') >= 0);
    return { bad, n: GG.ANIMALS.length, parkDogs: parkDogs.length, onlyDogs: parkDogs.every(a => a.family === 'dog') };
  });
  ok('six new dog friends who draw and fit their frames ' + JSON.stringify(dogs.bad), !dogs.bad.length);
  ok('sixty-two friends in all (' + dogs.n + ')', dogs.n === 62);
  ok('eleven dogs come to the park, and only dogs (' + dogs.parkDogs + ')', dogs.parkDogs === 11 && dogs.onlyDogs);

  /* walking in shows the notice board and fills the park with dogs */
  await p.evaluate(() => {
    GG.Friends.clear();
    GG.Time.set(11 * 60);
    window.__toasts = [];
    const t0 = GG.UI.toast; GG.UI.toast = function (m, ms) { window.__toasts.push(m); return t0.call(this, m, ms); };
    GG.Player.reset(GG.World.HOUSE.x, GG.World.HOUSE.y + 200);
  });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const D = GG.World.DOGPARK; GG.Player.reset(D.cx, D.cy + 40); GG.Friends.clear(); });
  await p.waitForTimeout(1600);
  const inPark = await p.evaluate(() => ({
    toast: window.__toasts.filter(m => /Paradise/.test(m))[0] || '',
    chip: document.getElementById('chip-place').textContent,
    friends: GG.Friends.list.map(f => f.def.family + ':' + GG.World.biomeRaw(f.x, f.y))
  }));
  ok('the place chip says Dog’s Paradise', inPark.chip === 'Dog’s Paradise');
  ok('walking in shows something worth knowing about dogs (' + inPark.toast.slice(0, 50) + '…)', /^Dog’s Paradise!/.test(inPark.toast));
  const inside = inPark.friends.filter(s => /dogpark$/.test(s));
  ok('and it fills up with dogs ' + JSON.stringify(inPark.friends), inside.length >= 3 && inside.every(s => /^dog:/.test(s)));

  const shot = process.argv[3];
  if (shot) await p.screenshot({ path: shot });
  errs.forEach(e => r.push('FAIL ' + e));
  console.log(r.join('\n'));
  console.log(r.filter(x => x.startsWith('FAIL')).length ? 'SOME FAILED' : 'ALL PASS');
  await b.close();
})();
