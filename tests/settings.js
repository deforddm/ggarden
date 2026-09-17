/* Settings, sound, the guest visit, the What's-new card and the guarded reset.
   Real taps on a phone-sized screen, because that is how she plays. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  const base = process.argv[2] || 'http://localhost:8899/index.html';
  await p.goto(base);
  await p.waitForTimeout(800);

  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const hidden = id => p.$eval('#' + id, e => e.classList.contains('hidden') || e.hidden);

  // ---------- settings from the title screen ----------
  await p.tap('#btn-settings');
  await p.waitForTimeout(400);
  ok('Settings opens from the title screen', !(await hidden('screen-settings')));
  ok('it shows the version', (await p.$eval('#set-version', e => e.textContent))
    .indexOf(await p.evaluate(() => GG.VERSION)) >= 0);

  // the three sliders really move the three buses
  const slid = await p.evaluate(async () => {
    const set = (id, v) => {
      const el = document.getElementById(id);
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set('set-music', 20); set('set-amb', 0); set('set-sfx', 100);
    await new Promise(r => setTimeout(r, 120));
    const s = GG.Save.data.settings;
    return { s, label: document.getElementById('set-music-val').textContent };
  });
  ok('the music slider sets the music level (' + slid.label + ')', Math.abs(slid.s.music - 0.2) < 0.001);
  ok('the garden-sounds slider goes all the way to silence', slid.s.ambience === 0);
  ok('the beeps slider goes all the way up', slid.s.sfx === 1);

  ok('the levels are kept for next time', await p.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('guins-garden-settings'));
    return raw && Math.abs(raw.music - 0.2) < 0.001;
  }));

  // mute
  await p.tap('#set-mute');
  await p.waitForTimeout(250);
  ok('the mute button turns everything off', await p.evaluate(() => GG.Save.data.muted === true));
  ok('and says how to turn it back on',
    (await p.$eval('#set-mute', e => e.textContent)).indexOf('back on') >= 0);
  await p.tap('#set-mute');
  await p.waitForTimeout(250);
  ok('and back on again', await p.evaluate(() => GG.Save.data.muted === false));

  // ---------- the reset is hard to hit ----------
  ok('reset is not on the Garden Menu any more', await p.evaluate(() => !document.getElementById('menu-reset')));
  ok('the confirm step starts hidden', await hidden('reset-step2'));
  await p.tap('#set-reset');
  await p.waitForTimeout(250);
  ok('tapping it only asks a question', !(await hidden('reset-step2')));

  // a plain tap on the pink button must NOT wipe anything
  await p.evaluate(() => { GG.Save.data.sparkles = 4242; GG.Save.addCatch('ladybug'); GG.Save.save(); });
  await p.tap('#reset-yes');
  await p.waitForTimeout(600);
  ok('a quick tap on "yes" does nothing at all', await p.evaluate(() =>
    GG.Save.data.sparkles === 4242 && GG.Save.has('ladybug')));

  await p.tap('#reset-no');
  await p.waitForTimeout(250);
  ok('"no" puts the question away', await hidden('reset-step2'));
  ok('and the garden is still there', await p.evaluate(() => GG.Save.data.sparkles === 4242));

  // holding it down for three seconds is what actually does it
  const held = await p.evaluate(async () => {
    document.getElementById('set-reset').click();
    await new Promise(r => setTimeout(r, 60));
    const y = document.getElementById('reset-yes');
    y.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    const arming = y.classList.contains('arming');
    y.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    return { arming, stillThere: GG.Save.data.sparkles === 4242 };
  });
  ok('holding it lights the button up', held.arming);
  ok('letting go early cancels it', held.stillThere);

  await p.evaluate(() => GG.UI.close('screen-settings'));
  await p.waitForTimeout(200);

  // ---------- what's new ----------
  const news = await p.evaluate(async () => {
    GG.Save.data.version = '1.7.0';
    GG.Save.save();
    return GG.changesSince('1.7.0').map(e => e.v);
  });
  ok('an older save is offered every version it missed (' + news.join(', ') + ')',
    news.indexOf('1.9.0') >= 0 && news.indexOf('1.8.0') >= 0 && news.indexOf('1.7.0') < 0);
  ok('an up-to-date save is offered nothing', await p.evaluate(() => GG.changesSince(GG.VERSION).length === 0));
  ok('a brand new garden is offered nothing', await p.evaluate(() => GG.changesSince(null).length === 0));

  await p.tap('#btn-play');
  await p.waitForTimeout(1600);
  ok('the What’s new card appears after an update', !(await hidden('screen-news')));
  const newsText = await p.$eval('#news-body', e => e.textContent);
  ok('it lists what changed', newsText.indexOf('Music') >= 0 && newsText.indexOf('rock pools') >= 0);
  ok('it draws a picture', await p.evaluate(() => {
    const cv = document.getElementById('news-art');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let px = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 12) px++;
    return px > cv.width * cv.height * 0.8;
  }));
  await p.screenshot({ path: __dirname + '/shots/news.png' });
  await p.tap('#screen-news footer .btn');
  await p.waitForTimeout(300);
  ok('and closes on tap', await hidden('screen-news'));
  ok('the version is written down so it only shows once',
    await p.evaluate(() => GG.Save.data.version === GG.VERSION));
  ok('so it does not come back', await p.evaluate(() => GG.changesSince(GG.Save.data.version).length === 0));

  // ---------- sound is actually running ----------
  ok('the music box is playing', await p.evaluate(() => GG.Music.playing === true));
  ok('the ambience is running', await p.evaluate(() => GG.Ambience.on === true));
  ok('the mood follows the time of day', await p.evaluate(() => {
    GG.Time.minutes = 22 * 60;
    GG.Music.setMood(GG.Music.moodForNow('world'));
    const night = GG.Music.mood;
    GG.Time.minutes = 10 * 60;
    GG.Music.setMood(GG.Music.moodForNow('world'));
    return night === 'night' && GG.Music.mood === 'day';
  }));
  ok('the sea is louder at the beach than in the meadow', await p.evaluate(async () => {
    const W = GG.World;
    const read = async (x, y) => {
      GG.Player.reset(x, y);
      for (let i = 0; i < 120; i++) GG.Ambience.update(0.05, 'world', x, y);
      return GG.Ambience.beds.surf.level;
    };
    const beach = await read(4300, 3520);
    const meadow = await read(2500, 1660);
    return beach > 0.25 && meadow < 0.05;
  }));
  ok('crickets come out at night and not at noon', await p.evaluate(async () => {
    const run = (mins) => {
      GG.Time.minutes = mins;
      for (let i = 0; i < 120; i++) GG.Ambience.update(0.05, 'world', 2500, 1660);
      return GG.Ambience.callers.crickets.target;
    };
    const night = run(23 * 60), noon = run(12 * 60);
    return night > 0.8 && noon === 0;
  }));

  // ---------- the water is only heard near water ----------
  /* Walk her there, let the levels settle, then give the audio graph real
     time to follow - setTargetAtTime moves in wall-clock seconds, so reading
     a gain straight after a simulated walk reads a value still on its way. */
  /* Put her where we want her, then let the REAL game loop run for a couple of
     seconds of wall-clock time. Reading the audio graph after a simulated walk
     reads a value still on its way, and hand-driving Ambience.update fights the
     loop, which keeps re-asserting the scene it is actually drawing. */
  const settle = async (scene, x, y) => p.evaluate(async ([scene, x, y]) => {
    GG.debugSetScene(scene);
    GG.Player.reset(x, y);
    await new Promise(r => setTimeout(r, 2600));
    const out = { scene: GG.debugScene() };
    for (const k in GG.Ambience.beds) {
      const bed = GG.Ambience.beds[k];
      out[k] = {
        level: +bed.level.toFixed(4),
        target: +bed.target.toFixed(4),
        gain: bed.nodes ? +bed.nodes.gain.gain.value.toFixed(4) : 0,
        swell: bed.nodes && bed.nodes.swell ? +bed.nodes.swell.gain.value.toFixed(3) : 1
      };
    }
    return out;
  }, [scene, x, y]);

  const beach = await settle('world', 4300, 3520);
  ok('at the beach you can hear the sea (' + beach.surf.gain + ')', beach.surf.gain > 0.01);

  const meadow = await settle('world', 4050, 1740);
  ok('in the meadow the sea is silent (' + meadow.surf.gain + ')', meadow.surf.gain < 0.0005);
  ok('and so is the river there (' + meadow.river.gain + ')', meadow.river.gain < 0.0005);

  const indoors = await settle('house', 4050, 1740);
  const wet = ['surf', 'river', 'stream'];
  ok('indoors every water layer is silent (' +
    wet.map(k => k + ':' + indoors[k].gain).join(' ') + ')',
    wet.every(k => indoors[k].gain < 0.0005));
  ok('but the hearth is crackling (' + indoors.hearth.gain + ')', indoors.hearth.gain > 0.005);
  ok('and she really is indoors', indoors.scene === 'house');
  ok('and the wind does not get in (' + indoors.wind.gain + ')', indoors.wind.gain < 0.0005);

  // the swell must never be able to make a quiet layer loud
  ok('every swell stays between 0 and 1, so it can only scale a layer down',
    await p.evaluate(() => {
      const bad = [];
      for (const k in GG.Ambience.beds) {
        const bed = GG.Ambience.beds[k];
        if (!bed.nodes || !bed.nodes.swell) continue;
        const base = bed.nodes.swell.gain.value;
        const depth = (bed.opts.swellDepth || 0) * 0.5;
        if (base - depth < -0.001 || base + depth > 1.001) bad.push(k + ' ' + base + '±' + depth);
      }
      window.__badSwell = bad;
      return bad.length === 0;
    }));
  const badSwell = await p.evaluate(() => window.__badSwell || []);
  if (badSwell.length) r.push('     (' + badSwell.join(', ') + ')');

  ok('and nothing is wired onto the level gain itself', await p.evaluate(() => {
    /* the old bug: the LFO was connected to the LEVEL AudioParam, which is
       additive, so a layer played at full swell depth even at zero level */
    const bed = GG.Ambience.beds.surf;
    if (!bed.nodes) return false;
    bed.level = 0;
    bed.nodes.gain.gain.cancelScheduledValues(GG.Audio.ctx().currentTime);
    bed.nodes.gain.gain.setValueAtTime(0, GG.Audio.ctx().currentTime);
    return bed.nodes.gain.gain.value === 0;
  }));

  await p.evaluate(() => GG.debugSetScene('world'));

  // walking inland from the beach fades it out rather than cutting
  const fade = await p.evaluate(() => {
    const read = (scene, x, y, secs) => {
      const steps = Math.round(secs / 0.05);
      for (let i = 0; i < steps; i++) GG.Ambience.update(0.05, scene, x, y);
      return GG.Ambience.beds.surf.level;
    };
    read('world', 4300, 3520, 10);
    const atBeach = GG.Ambience.beds.surf.level;
    const after1s = read('world', 4050, 1740, 1);
    const after6s = read('world', 4050, 1740, 5);
    return { atBeach, after1s, after6s };
  });
  ok('walking away fades the sea out rather than cutting it (' +
    fade.atBeach.toFixed(2) + ' -> ' + fade.after1s.toFixed(2) + ' -> ' + fade.after6s.toFixed(2) + ')',
    fade.atBeach > 0.3 && fade.after1s < fade.atBeach * 0.6 && fade.after6s < 0.02);

  // ---------- decorations for every kind of tank ----------
  const decor = await p.evaluate(() => ({
    total: GG.DECOR.length,
    land: GG.decorFor('terrarium').length,
    water: GG.decorFor('aquarium').length,
    hybrid: GG.decorFor('hybrid').length,
    habitat: GG.decorFor('habitat').length,
    outdoorOnly: GG.DECOR.filter(x => x.for === 'habitat').length,
    scenes: { land: GG.scenesFor('terrarium').length, water: GG.scenesFor('aquarium').length,
      hybrid: GG.scenesFor('hybrid').length, habitat: GG.scenesFor('habitat').length },
    leafInFishTank: GG.decorFits(GG.DECOR_BY_ID.leaf, 'aquarium'),
    coralInTerrarium: GG.decorFits(GG.DECOR_BY_ID.coral, 'terrarium'),
    coralInHybrid: GG.decorFits(GG.DECOR_BY_ID.coral, 'hybrid')
  }));
  ok('there are plenty of decorations (' + decor.total + ')', decor.total >= 30);
  ok('every kind of tank has its own (' + decor.land + ' land, ' + decor.water + ' water, ' +
    decor.hybrid + ' hybrid, ' + decor.habitat + ' habitat)',
    decor.land >= 12 && decor.water >= 8 && decor.habitat >= 20 &&
    decor.hybrid === decor.total - decor.outdoorOnly);
  ok('a hybrid takes everything except the outdoor things',
    decor.hybrid + decor.outdoorOnly === decor.total);
  ok('every kind of tank has several scenes (' + JSON.stringify(decor.scenes) + ')',
    decor.scenes.land >= 7 && decor.scenes.water >= 6 && decor.scenes.hybrid >= 5 &&
    decor.scenes.habitat >= 5);
  ok('a big leaf will not go in a fish tank', !decor.leafInFishTank);
  ok('coral will not go in a terrarium', !decor.coralInTerrarium);
  ok('but a hybrid takes everything', decor.coralInHybrid);

  ok('every decoration draws something', await p.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120;
    const c = cv.getContext('2d');
    const bad = [];
    GG.DECOR.forEach(d => {
      const fn = GG.DecorArt[d.id];
      if (!fn) { bad.push(d.id + ':missing'); return; }
      c.clearRect(0, 0, 120, 120);
      try { fn(c, 60, 95, 1, 0.6); } catch (e) { bad.push(d.id + ':threw'); return; }
      const px = c.getImageData(0, 0, 120, 120).data;
      let n = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 12) n++;
      if (n < 80) bad.push(d.id + ':blank');
    });
    window.__badDecor = bad;
    return bad.length === 0;
  }));
  const badDecor = await p.evaluate(() => window.__badDecor || []);
  if (badDecor.length) r.push('     (' + badDecor.join(', ') + ')');

  // ---------- a friend's visit ----------
  await p.evaluate(() => {
    GG.Save.setSlot('main');
    GG.Save.data.sparkles = 999;
    GG.Save.addCatch('monarch'); GG.Save.addCatch('ladybug');
    GG.Save.data.terrariums[0].name = 'Guin’s best tank';
    GG.Save.save();
  });
  const before = await p.evaluate(() => localStorage.getItem('guins-garden-save-v1'));

  await p.evaluate(() => { GG.UI.open('screen-title'); });
  await p.waitForTimeout(250);
  await p.tap('#btn-guest');
  await p.waitForTimeout(350);
  ok('the guest card opens', !(await hidden('screen-guest')));
  await p.fill('#guest-name', 'Maisie');
  await p.tap('#guest-start');
  await p.waitForTimeout(900);

  const g = await p.evaluate(() => ({
    slot: GG.Save.slot,
    guest: GG.Save.isGuest(),
    name: GG.Save.data.name,
    sparkles: GG.Save.data.sparkles,
    species: GG.Save.totalSpecies(),
    chip: document.getElementById('chip-guest').hidden,
    chipText: document.getElementById('chip-guest').textContent
  }));
  ok('the visit starts in the guest slot', g.slot === 'guest' && g.guest);
  ok('with a fresh, empty garden', g.sparkles === 0 && g.species === 0);
  ok('named after the friend (' + g.name + ')', g.name === 'Maisie');
  ok('and a chip saying whose visit it is (' + g.chipText + ')', !g.chip && g.chipText.indexOf('Maisie') >= 0);

  ok('Guin’s save is byte-for-byte untouched',
    await p.evaluate(b => localStorage.getItem('guins-garden-save-v1') === b, before));

  // what the guest does must stay in the guest slot
  await p.evaluate(() => {
    GG.Save.data.sparkles = 77;
    GG.Save.addCatch('firefly');
    GG.Save.save();
  });
  ok('what the guest catches is written to its own key', await p.evaluate(() => {
    const guest = JSON.parse(localStorage.getItem('guins-garden-guest-v1'));
    const main = JSON.parse(localStorage.getItem('guins-garden-save-v1'));
    return guest.caught.firefly && !main.caught.firefly && main.sparkles === 999;
  }));
  ok('and Guin’s save is still untouched',
    await p.evaluate(b => localStorage.getItem('guins-garden-save-v1') === b, before));

  ok('the Garden Menu offers to finish the visit', await p.evaluate(() =>
    !document.getElementById('menu-endguest').hidden));

  // the visit survives a reload rather than dumping the friend into Guin's garden
  await p.reload();
  await p.waitForTimeout(900);
  ok('a reload keeps the friend in their own garden', await p.evaluate(() =>
    GG.Save.slot === 'guest' && GG.Save.data.name === 'Maisie'));

  // end the visit
  await p.evaluate(() => { window.confirm = () => true; });
  await p.evaluate(() => { GG.Save.endGuest(); });
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({
    slot: GG.Save.slot,
    sparkles: GG.Save.data.sparkles,
    species: GG.Save.totalSpecies(),
    guestGone: localStorage.getItem('guins-garden-guest-v1') === null,
    tank: GG.Save.data.terrariums[0].name
  }));
  ok('finishing the visit comes back to Guin’s garden', after.slot === 'main');
  ok('with everything exactly as she left it',
    after.sparkles === 999 && after.species === 2 && after.tank === 'Guin’s best tank');
  ok('and the guest garden is cleared away', after.guestGone);

  console.log(r.join('\n'));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) || errs.length ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
