/* Same proof for the fish: nothing that was already swimming here draws
   any differently. */
const { chromium } = require('playwright');
const NEW = require('./newids.v115.json');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 400 } });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(600); await p.click('#btn-play'); await p.waitForTimeout(800);
  await p.addScriptTag({ url: '/tests/fishart.old.js' });
  const out = await p.evaluate(({ newIds }) => {
    const skip = {}; newIds.forEach(i => skip[i] = 1);
    const cv = document.createElement('canvas'); cv.width = 180; cv.height = 120;
    const c = cv.getContext('2d');
    const shot = (def, art, t) => {
      c.fillStyle = '#7a8a6a'; c.fillRect(0, 0, 180, 120);
      art.draw(c, def, 90, 60, 1.8, false, t);
      return c.getImageData(0, 0, 180, 120).data;
    };
    const changed = [], checked = [];
    GG.FISH.concat(GG.JUNK).forEach(def => {
      if (skip[def.id]) return;
      checked.push(def.id);
      let diff = 0;
      [0.4, 1.15, 2.6, 4.2].forEach(t => {
        const a = shot(def, GG.FishArtOld, t), z = shot(def, GG.FishArt, t);
        for (let i = 0; i < a.length; i += 4) {
          if (a[i] !== z[i] || a[i + 1] !== z[i + 1] || a[i + 2] !== z[i + 2]) diff++;
        }
      });
      if (diff) changed.push(def.id + ' (' + diff + ' px)');
    });
    return { checked: checked.length, changed: changed };
  }, { newIds: NEW.fish });
  console.log('existing fish compared: ' + out.checked);
  console.log(out.changed.length ? 'CHANGED:\n' + out.changed.join('\n')
    : 'no existing fish draws differently');
  await b.close();
  process.exit(out.changed.length ? 1 : 0);
})();
