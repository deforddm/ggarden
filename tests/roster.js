/* Sanity checks on the whole creature roster. */
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

  const data = await p.evaluate(() => {
    const bad = { noShape: [], noFacts: [], shortFact: [], noMeasure: [], badTime: [],
      badHab: [], dupe: [], noWater: [] };
    const WATERS = ['pond', 'stream', 'river', 'estuary', 'sea'];
    const seen = {};
    const TIMES = ['morning', 'day', 'evening', 'night', 'any'];
    const HABS = ['meadow', 'garden', 'forest', 'pond', 'hill', 'orchard',
      'riverbank', 'river', 'beach', 'shore', 'tidepool', 'anywhere'];
    GG.BUGS.forEach(x => {
      if (seen[x.id]) bad.dupe.push(x.id); seen[x.id] = 1;
      if (!GG.BugArt.shapes[x.art.shape]) bad.noShape.push(x.id);
      if (!x.facts || x.facts.length < 2) bad.noFacts.push(x.id);
      (x.facts || []).forEach(f => { if (f.length < 30) bad.shortFact.push(x.id); });
      if (!x.measure) bad.noMeasure.push(x.id);
      if (!x.times.every(t => TIMES.indexOf(t) >= 0)) bad.badTime.push(x.id);
      if (!x.habitats.every(h => HABS.indexOf(h) >= 0)) bad.badHab.push(x.id);
    });
    GG.FISH.forEach(f => {
      if (!f.waters || !f.waters.length) bad.noWater.push(f.id);
      else if (!f.waters.every(w => WATERS.indexOf(w) >= 0)) bad.noWater.push(f.id);
      if (!GG.FishArt.shapes[f.art.shape]) bad.noShape.push(f.id);
    });
    // every bug can actually be drawn without throwing
    const cv = document.createElement('canvas'); cv.width = 80; cv.height = 80;
    const c = cv.getContext('2d');
    const drawFails = [];
    GG.BUGS.forEach(x => {
      try { c.clearRect(0, 0, 80, 80); GG.BugArt.draw(c, x, 40, 40, 2, -Math.PI / 2, 1.3); }
      catch (e) { drawFails.push(x.id + ': ' + e.message); }
    });
    // every bug leaves ink on the canvas
    const blank = [];
    GG.BUGS.forEach(x => {
      c.clearRect(0, 0, 80, 80);
      GG.BugArt.draw(c, x, 40, 40, 2, -Math.PI / 2, 1.3);
      const d = c.getImageData(0, 0, 80, 80).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 10) n++;
      if (n < 60) blank.push(x.id + '(' + n + 'px)');
    });
    // every place and time can spawn something
    const combos = {};
    ['meadow', 'garden', 'forest', 'pond', 'hill', 'orchard'].forEach(h => {
      ['morning', 'day', 'evening', 'night'].forEach(t => {
        combos[h + '/' + t] = GG.Critters.eligible(h, t, false).length;
      });
    });
    return { count: GG.BUGS.length, fish: GG.FISH.length, bad, drawFails, blank,
      minCombo: Math.min(...Object.values(combos)),
      emptyCombos: Object.keys(combos).filter(k => combos[k] === 0) };
  });

  ok('83 bugs and 29 fish (' + data.count + ' + ' + data.fish + ')', data.count === 83 && data.fish === 29);
  ok('every fish says which waters it lives in', data.bad.noWater.length === 0);
  ok('no duplicate ids', data.bad.dupe.length === 0);
  ok('every bug has a drawing shape', data.bad.noShape.length === 0);
  ok('every bug has at least two facts', data.bad.noFacts.length === 0);
  ok('no stub facts', data.bad.shortFact.length === 0);
  ok('every bug has a size', data.bad.noMeasure.length === 0);
  ok('every time-of-day is valid', data.bad.badTime.length === 0);
  ok('every habitat is valid', data.bad.badHab.length === 0);
  ok('every bug draws without error', data.drawFails.length === 0);
  ok('every bug actually draws something' + (data.blank.length ? ' — ' + data.blank.join(', ') : ''), data.blank.length === 0);
  ok('every place/time can spawn something (fewest ' + data.minCombo + ')',
    data.emptyCombos.length === 0 && data.minCombo >= 3);

  // the book copes with the bigger roster
  await p.evaluate(() => { GG.BUGS.forEach(x => GG.Save.addCatch(x.id)); GG.Book.open('bugs'); });
  await p.waitForTimeout(600);
  ok('the Bug Book shows all of them', await p.$eval('#book-grid', e => e.children.length) === 83);
  ok('the counter reads 83 / 83', (await p.$eval('#progress', e => e.textContent)).trim() === '83 / 83');
  await p.screenshot({ path: __dirname + '/shots/book-full.png' });

  console.log(r.join('\n'));
  if (data.bad.noShape.length) console.log('missing shapes:', data.bad.noShape.join(','));
  if (data.drawFails.length) console.log(data.drawFails.join('\n'));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
})();
