/* Proves the seven new places changed no existing species: renders every
   bug that was already in the roster with the pre-change shapes and with
   the current ones, and compares the two pictures pixel for pixel. */
const { chromium } = require('playwright');
const NEW = require('./newids.v115.json');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 400 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(600); await p.click('#btn-play'); await p.waitForTimeout(800);
  await p.addScriptTag({ url: '/tests/bugart.old.js' });
  const out = await p.evaluate(({ newIds }) => {
    const skip = {}; newIds.forEach(i => skip[i] = 1);
    const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120;
    const c = cv.getContext('2d');
    const shot = (def, art, t) => {
      c.clearRect(0, 0, 120, 120);
      c.fillStyle = '#7a8a6a'; c.fillRect(0, 0, 120, 120);
      art.draw(c, def, 60, 60, 3.2, -Math.PI / 2, t);
      return c.getImageData(0, 0, 120, 120).data;
    };
    const changed = [], checked = [];
    GG.BUGS.forEach(def => {
      if (skip[def.id]) return;
      checked.push(def.id);
      let diff = 0;
      [0.4, 1.15, 2.6, 4.2].forEach(t => {
        const a = shot(def, GG.BugArtOld, t), z = shot(def, GG.BugArt, t);
        for (let i = 0; i < a.length; i += 4) {
          if (a[i] !== z[i] || a[i + 1] !== z[i + 1] || a[i + 2] !== z[i + 2]) diff++;
        }
      });
      if (diff) changed.push(def.id + ' (' + diff + ' px)');
    });
    return { checked: checked.length, changed: changed };
  }, { newIds: NEW.bugs });
  console.log('existing species compared: ' + out.checked);
  console.log(out.changed.length
    ? 'CHANGED:\n' + out.changed.join('\n')
    : 'no existing species draws differently');
  if (errs.length) console.log(errs.join('\n'));
  await b.close();
  process.exit(out.changed.length ? 1 : 0);
})();
