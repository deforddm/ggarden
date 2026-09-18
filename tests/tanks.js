/* Terrariums, fish tanks and hybrid tanks are three separate things. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(800);

  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);

  await p.evaluate(() => {
    ['monarch','ladybug','grasshopper','water_strider','firefly'].forEach(i => GG.Save.addCatch(i));
    ['bluegill','koi','catfish','bass'].forEach(i => GG.Save.addFish(i));
    const d = GG.Save.data;
    d.sparkles = 9000;
    d.unlockedDecor = GG.DECOR.map(x => x.id).concat(GG.TANK_BGS.map(x => 'bg_' + x.id));
    d.terrariums = [
      { name: 'Bug Tank', type: 'terrarium', bg: 'meadow', bugs: [], fish: [], decor: [] },
      { name: 'Fish Tank', type: 'aquarium', bg: 'clear', bugs: [], fish: [], decor: [] },
      { name: 'Hybrid', type: 'hybrid', bg: 'riverbank', bugs: [], fish: [], decor: [] }
    ];
    GG.Save.save();
  });

  ok('there are four kinds of tank', await p.evaluate(() => GG.TANK_TYPES.length === 4));
  ok('each kind has its own scenes', await p.evaluate(() =>
    GG.scenesFor('terrarium').every(s => s.kind === 'land') &&
    GG.scenesFor('aquarium').every(s => s.kind === 'water') &&
    GG.scenesFor('hybrid').every(s => s.kind === 'hybrid') &&
    GG.scenesFor('terrarium').length && GG.scenesFor('aquarium').length && GG.scenesFor('hybrid').length));

  // --- terrarium: bugs yes, fish no ---
  await p.evaluate(() => { GG.Terrarium.index = 0; GG.Terrarium.tab = 'bugs'; GG.Terrarium.open(); });
  await p.waitForTimeout(400);
  ok('a terrarium has no Fish tab', await p.$eval('#screen-terrarium .tab[data-tab="fish"]', e => e.style.display === 'none'));
  await p.evaluate(() => GG.Terrarium.addItem('bug', 'monarch'));
  await p.evaluate(() => GG.Terrarium.addItem('fish', 'bluegill'));
  ok('a terrarium takes bugs but refuses fish', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[0];
    return t.bugs.length === 1 && t.fish.length === 0;
  }));

  // --- fish tank: fish yes, bugs no ---
  await p.evaluate(() => { GG.Terrarium.index = 1; GG.Terrarium.tab = 'fish'; GG.Terrarium.refresh(); });
  await p.waitForTimeout(300);
  ok('a fish tank has a Bugs tab, for the rock-pool creatures',
    await p.$eval('#screen-terrarium .tab[data-tab="bugs"]', e => e.style.display !== 'none'));
  await p.evaluate(() => { GG.Terrarium.addItem('fish', 'koi'); GG.Terrarium.addItem('bug', 'monarch'); });
  ok('a fish tank takes fish but refuses a land bug', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[1];
    return t.fish.length === 1 && t.bugs.length === 0;
  }));

  // --- hybrid: both, in their own halves ---
  await p.evaluate(() => { GG.Terrarium.index = 2; GG.Terrarium.refresh(); });
  await p.waitForTimeout(300);
  ok('a hybrid shows all three tabs', await p.evaluate(() =>
    ['bugs','fish','decor'].every(k =>
      document.querySelector('#screen-terrarium .tab[data-tab="' + k + '"]').style.display !== 'none')));
  await p.evaluate(() => {
    ['monarch','ladybug','grasshopper'].forEach(i => GG.Terrarium.addItem('bug', i));
    ['bluegill','catfish'].forEach(i => GG.Terrarium.addItem('fish', i));
    GG.Terrarium.addItem('decor', 'fern');
  });
  ok('a hybrid holds bugs and fish together', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[2];
    return t.bugs.length === 3 && t.fish.length === 2;
  }));

  await p.waitForTimeout(2200);
  const zones = await p.evaluate(() => {
    const t = GG.Save.data.terrariums[2];
    const b = GG.Terrarium.bands(t);
    const fishOk = t.fish.every(f => { const m = GG.Terrarium.motionFor(f); return m.ly >= b.water[0] - 2 && m.ly <= b.water[1] + 2; });
    const bugsOk = t.bugs.every(x => { const m = GG.Terrarium.motionFor(x); return m.ly <= b.waterTop + 18; });
    return { fishOk, bugsOk, waterTop: b.waterTop };
  });
  ok('fish stay below the waterline in a hybrid', zones.fishOk);
  ok('bugs stay above the waterline in a hybrid', zones.bugsOk);

  // a water strider is allowed to sit ON the water in a hybrid
  await p.evaluate(() => {
    const t = GG.Save.data.terrariums[2];
    t.bugs = []; GG.Terrarium.addItem('bug', 'water_strider');
  });
  await p.waitForTimeout(1600);
  ok('a water strider skates on the surface of a hybrid', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[2];
    const b = GG.Terrarium.bands(t);
    const m = GG.Terrarium.motionFor(t.bugs[0]);
    return m.ly > b.waterTop - 10 && m.ly < b.waterTop + 22;
  }));

  // scene cycling stays within the right kind
  const scenes = await p.evaluate(() => {
    const out = [];
    for (const idx of [0, 1, 2]) {
      GG.Terrarium.index = idx;
      const seen = [];
      for (let i = 0; i < 6; i++) { document.getElementById('tank-bg').click(); seen.push(GG.Save.data.terrariums[idx].bg); }
      out.push({ type: GG.Save.data.terrariums[idx].type, seen: Array.from(new Set(seen)) });
    }
    return out;
  });
  const kinds = await p.evaluate(() => {
    const map = {}; GG.TANK_BGS.forEach(b => map[b.id] = b.kind); return map;
  });
  ok('the Scene button only offers scenes of the right kind', scenes.every(s => {
    const want = s.type === 'aquarium' ? 'water' : (s.type === 'hybrid' ? 'hybrid' : 'land');
    return s.seen.length > 1 && s.seen.every(id => kinds[id] === want);
  }));

  ok('scene kinds match the tank kinds', await p.evaluate(() =>
    GG.Save.data.terrariums.every(t => {
      const want = t.type === 'aquarium' ? 'water' : (t.type === 'hybrid' ? 'hybrid' : 'land');
      return GG.TANK_BY_ID[t.bg].kind === want;
    })));

  // an old save gets migrated
  ok('an old save is migrated to the new tank kinds', await p.evaluate(() => {
    localStorage.setItem('guins-garden-save-v1', JSON.stringify({
      v: 1, sparkles: 10, caught: {}, caughtFish: {},
      terrariums: [
        { name: 'Old bugs', bg: 'meadow', decor: [], bugs: [{ id: 'monarch', x: 200, y: 200, s: 1, seed: 0.2 }] },
        { name: 'Old fish', bg: 'aquarium', decor: [], bugs: [], fish: [{ id: 'koi', x: 200, y: 200, s: 1, seed: 0.2 }] }
      ],
      unlockedDecor: ['leaf'], unlockedTanks: 2, clock: 500, day: 1, totalCatches: 0
    }));
    GG.Save.load();
    const t = GG.Save.data.terrariums;
    return t[0].type === 'terrarium' && t[1].type === 'aquarium' &&
      GG.TANK_BY_ID[t[0].bg].kind === 'land' && GG.TANK_BY_ID[t[1].bg].kind === 'water' &&
      t[1].fish.length === 1;
  }));

  // --- rock-pool creatures need water ---
  await p.evaluate(() => {
    ['monarch','ladybug','grasshopper','water_strider','firefly',
     'hermit_crab','sea_star','urchin','shore_crab','periwinkle'].forEach(i => GG.Save.addCatch(i));
    GG.Save.data.terrariums = [
      { name: 'Bug Tank', type: 'terrarium', bg: 'meadow', bugs: [], fish: [], decor: [] },
      { name: 'Fish Tank', type: 'aquarium', bg: 'clear', bugs: [], fish: [], decor: [] },
      { name: 'Hybrid', type: 'hybrid', bg: 'riverbank', bugs: [], fish: [], decor: [] }
    ];
    GG.Save.save();
  });

  ok('everything marked as needing water lives in water', await p.evaluate(() => {
    const WET = ['tidepool', 'pond', 'swamp', 'river', 'riverbank', 'badlands'];
    const wet = GG.BUGS.filter(x => GG.isAquaticBug(x));
    return wet.length >= 8 && wet.every(x => x.habitats.some(h => WET.indexOf(h) >= 0));
  }));
  ok('the eight rock-pool creatures are among them', await p.evaluate(() =>
    GG.BUGS.filter(x => x.habitats.indexOf('tidepool') >= 0)
      .every(x => GG.isAquaticBug(x))));
  ok('and no land bug is marked that way', await p.evaluate(() =>
    ['monarch','ladybug','grasshopper','water_strider','ghost_crab','horseshoe_crab']
      .every(id => !GG.isAquaticBug(GG.BUG_BY_ID[id]))));

  // a terrarium turns them away
  await p.evaluate(() => { GG.Terrarium.index = 0; GG.Terrarium.tab = 'bugs'; GG.Terrarium.open(); });
  await p.waitForTimeout(350);
  await p.evaluate(() => GG.Terrarium.addItem('bug', 'sea_star'));
  ok('a terrarium will not take a sea star', await p.evaluate(() =>
    GG.Save.data.terrariums[0].bugs.length === 0));
  ok('and it says why', (await p.$eval('#toast', e => e.textContent)).indexOf('needs water') >= 0);
  const trayNames = await p.evaluate(() => {
    GG.Terrarium.buildTray();
    return Array.from(document.querySelectorAll('#tray .trayitem .nm')).map(e => e.textContent);
  });
  ok('the terrarium tray does not even offer them (' + trayNames.join(', ') + ')',
    trayNames.length > 0 && trayNames.indexOf('Ochre Sea Star') < 0 && trayNames.indexOf('Hermit Crab') < 0);

  // a fish tank takes them
  await p.evaluate(() => { GG.Terrarium.index = 1; GG.Terrarium.tab = 'bugs'; GG.Terrarium.refresh(); });
  await p.waitForTimeout(350);
  ok('a fish tank offers only the rock-pool creatures', await p.evaluate(() => {
    const names = Array.from(document.querySelectorAll('#tray .trayitem .nm')).map(e => e.textContent);
    return names.length === 5 && names.indexOf('Ochre Sea Star') >= 0 &&
      names.indexOf('Monarch Butterfly') < 0;
  }));
  await p.evaluate(() => { ['sea_star','hermit_crab','urchin'].forEach(i => GG.Terrarium.addItem('bug', i)); });
  ok('and lets her put them in', await p.evaluate(() =>
    GG.Save.data.terrariums[1].bugs.length === 3));
  await p.waitForTimeout(2000);
  ok('they settle on the bottom, under the water', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[1], b = GG.Terrarium.bands(t);
    return t.bugs.every(x => {
      const m = GG.Terrarium.motionFor(x);
      return m.ly >= b.floor[0] - 3 && m.ly <= b.floor[1] + 3;
    });
  }));
  ok('and they potter about rather than sitting still', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[1];
    const before = t.bugs.map(x => { const m = GG.Terrarium.motionFor(x); return [m.lx, m.ly]; });
    window.__poolBefore = before;
    return true;
  }));
  await p.waitForTimeout(2500);
  ok('they really do move', await p.evaluate(() => {
    const t = GG.Save.data.terrariums[1];
    return t.bugs.some((x, i) => {
      const m = GG.Terrarium.motionFor(x);
      return Math.hypot(m.lx - window.__poolBefore[i][0], m.ly - window.__poolBefore[i][1]) > 3;
    });
  }));
  await p.screenshot({ path: __dirname + '/shots/tank-rockpool.png' });

  // a hybrid takes both
  await p.evaluate(() => {
    GG.Terrarium.index = 2; GG.Terrarium.tab = 'bugs'; GG.Terrarium.refresh();
    GG.Terrarium.addItem('bug', 'monarch');
    GG.Terrarium.addItem('bug', 'hermit_crab');
  });
  await p.waitForTimeout(1800);
  const hy = await p.evaluate(() => {
    const t = GG.Save.data.terrariums[2], b = GG.Terrarium.bands(t);
    const crab = t.bugs.find(x => x.id === 'hermit_crab');
    const fly = t.bugs.find(x => x.id === 'monarch');
    return {
      both: t.bugs.length === 2,
      crabUnder: crab ? GG.Terrarium.motionFor(crab).ly > b.waterTop : false,
      flyOver: fly ? GG.Terrarium.motionFor(fly).ly < b.waterTop : false
    };
  });
  ok('a hybrid takes a butterfly and a hermit crab together', hy.both);
  ok('the crab stays under the water', hy.crabUnder);
  ok('and the butterfly stays above it', hy.flyOver);

  // an old save with a sea star in a terrarium is tidied up
  ok('a rock-pool creature saved in a terrarium is moved back to the book',
    await p.evaluate(() => {
      localStorage.setItem('guins-garden-save-v1', JSON.stringify({
        v: 1, sparkles: 10, caught: { sea_star: { count: 1, first: 1 }, monarch: { count: 1, first: 1 } },
        caughtFish: {},
        terrariums: [{ name: 'Old', type: 'terrarium', bg: 'meadow', decor: [], fish: [], bugs: [
          { id: 'sea_star', x: 200, y: 300, s: 1, seed: 0.2 },
          { id: 'monarch', x: 300, y: 200, s: 1, seed: 0.4 }
        ] }],
        unlockedDecor: ['leaf'], unlockedTanks: 1, clock: 500, day: 1, totalCatches: 2
      }));
      GG.Save.setSlot('main');
      GG.Save.load();
      const t = GG.Save.data.terrariums[0];
      return t.bugs.length === 1 && t.bugs[0].id === 'monarch' && GG.Save.has('sea_star');
    }));

  // the chooser
  await p.evaluate(() => {
    GG.Save.data.sparkles = 9000; GG.Save.save();
    document.getElementById('tank-new').click();
  });
  await p.waitForTimeout(500);
  ok('the new-tank chooser opens with four options',
    !(await p.$eval('#screen-newtank', e => e.classList.contains('hidden'))) &&
    (await p.$$eval('#newtank-list .newtank', els => els.length)) === 4);
  await p.screenshot({ path: __dirname + '/shots/tank-chooser.png' });
  await p.evaluate(() => document.querySelector('#newtank-list .newtank[data-type="hybrid"]').click());
  await p.waitForTimeout(400);
  ok('picking one buys that kind', await p.evaluate(() => {
    const t = GG.Save.data.terrariums;
    return t[t.length - 1].type === 'hybrid' && GG.TANK_BY_ID[t[t.length - 1].bg].kind === 'hybrid';
  }));

  /* ---------- getting rid of a tank ---------- */
  await p.evaluate(() => {
    const d = GG.Save.data;
    d.terrariums.push({ name: 'Doomed', type: 'terrarium', bg: 'meadow',
      decor: [], bugs: [], fish: [], friends: [] });
    GG.Terrarium.index = d.terrariums.length - 1;
    GG.Terrarium.refresh();
    GG.Terrarium.addItem('bug', 'monarch');
    GG.Terrarium.addItem('decor', 'leaf');
  });
  await p.waitForTimeout(400);

  ok('the Get rid of it button is there when you have more than one tank',
    !(await p.$eval('#tank-delete', e => e.hidden)));

  await p.click('#tank-delete');
  await p.waitForTimeout(500);
  const del = await p.evaluate(() => ({
    open: !document.getElementById('screen-deltank').classList.contains('hidden'),
    name: document.getElementById('deltank-name').textContent,
    what: document.getElementById('deltank-what').textContent,
    safe: document.querySelector('.keepsafe').textContent.indexOf('Nothing is lost') >= 0,
    painted: (() => {
      const cv = document.getElementById('deltank-art');
      const dd = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      let n = 0; for (let i = 3; i < dd.length; i += 4) if (dd[i] > 12) n++;
      return n;
    })()
  }));
  ok('it asks first, naming the tank (' + del.name + ')', del.open && del.name === 'Doomed');
  ok('it says what is inside (' + del.what + ')', /1 creature/.test(del.what) && /1 decoration/.test(del.what));
  ok('it promises nothing is lost', del.safe);
  ok('it shows a picture of that tank (' + del.painted + ' px)', del.painted > 50000);

  /* backing out must change nothing */
  const nBefore = await p.evaluate(() => GG.Save.data.terrariums.length);
  await p.evaluate(() => GG.UI.close('screen-deltank'));
  await p.waitForTimeout(300);
  ok('saying no keeps the tank',
    (await p.evaluate(() => GG.Save.data.terrariums.length)) === nBefore);

  await p.click('#tank-delete');
  await p.waitForTimeout(400);
  await p.click('#deltank-yes');
  await p.waitForTimeout(600);
  const gone = await p.evaluate(() => ({
    n: GG.Save.data.terrariums.length,
    names: GG.Save.data.terrariums.map(t => t.name),
    idx: GG.Terrarium.index,
    closed: document.getElementById('screen-deltank').classList.contains('hidden'),
    bugStillInBook: GG.Save.has('monarch'),
    decorStillOwned: GG.Save.data.unlockedDecor.indexOf('leaf') >= 0
  }));
  ok('saying yes gets rid of it', gone.n === nBefore - 1 && gone.names.indexOf('Doomed') < 0);
  ok('the card closes and a real tank is showing', gone.closed && gone.idx < gone.n);
  ok('the creature that was in it is still in the book', gone.bugStillInBook);
  ok('the decorations stay bought', gone.decorStillOwned);

  /* the last tank can never be thrown away */
  const last = await p.evaluate(() => {
    while (GG.Save.data.terrariums.length > 1) GG.Terrarium.doDelete();
    GG.Terrarium.refresh();
    return { n: GG.Save.data.terrariums.length,
      hidden: document.getElementById('tank-delete').hidden,
      askRefused: GG.Terrarium.askDelete() === false,
      doRefused: GG.Terrarium.doDelete() === false,
      after: GG.Save.data.terrariums.length };
  });
  ok('your only tank cannot be thrown away', last.n === 1 && last.after === 1 &&
    last.askRefused && last.doRefused);
  ok('and the button is hidden when there is only one', last.hidden);

  /* it sticks after a reload */
  await p.evaluate(() => GG.Save.save());
  await p.reload();
  await p.waitForTimeout(900);
  ok('the deletions survive a reload',
    (await p.evaluate(() => GG.Save.data.terrariums.length)) === 1);

  console.log(r.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
