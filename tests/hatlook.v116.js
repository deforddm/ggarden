/* v1.16: every animal shape wearing a hat, big, so hat placement can be
   judged by eye. argv[3] = hat id, argv[4] = 'a' or 'b' (first/second half). */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  const hat = process.argv[3] || 'party', half = process.argv[4] || 'a';
  const data = await p.evaluate(({ hat, half }) => {
    const seen = {}, all = [];
    GG.ANIMALS.forEach(a => {
      const k = a.art.shape + (a.art.ears ? ':' + a.art.ears : '') + (a.art.calf ? ':calf' : '');
      if (!seen[k]) { seen[k] = 1; all.push(a); }
    });
    const mid = Math.ceil(all.length / 2);
    const defs = half === 'a' ? all.slice(0, mid) : all.slice(mid);
    const cols = 4, cw = 330, ch = 260;
    const rows = Math.ceil(defs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cols * cw; cv.height = rows * ch;
    const c = cv.getContext('2d');
    c.fillStyle = '#eef3e2'; c.fillRect(0, 0, cv.width, cv.height);
    defs.forEach((d, i) => {
      const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch;
      c.strokeStyle = '#cfd8c0'; c.strokeRect(x0 + 0.5, y0 + 0.5, cw - 1, ch - 1);
      c.fillStyle = '#223'; c.font = 'bold 15px sans-serif'; c.textAlign = 'left';
      c.fillText(d.art.shape + ' - ' + d.name, x0 + 8, y0 + 20);
      const sc = GG.animalFit(d, 170);
      GG.AnimalArt.draw(c, d, x0 + cw / 2, y0 + ch - 24, sc, false, 1.2, 0, hat);
    });
    return cv.toDataURL('image/png');
  }, { hat, half });
  require('fs').writeFileSync(__dirname + '/shots/v116-hats-' + hat + '-' + half + '.png', Buffer.from(data.split(',')[1], 'base64'));
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
