/* v1.15 picture sheet: the thirteen new cherry and bamboo creatures, big and
   at true sprite size, on light and dark ground. */
const { chromium } = require('playwright');
const IDS = ['spotted_wing_drosophila','peachtree_borer','tent_caterpillar','lorquins_admiral','japanese_beetle','mining_bee','leafroller',
  'bamboo_mite','grass_carrying_wasp','woodlouse_spider','leopard_slug','garden_springtail','zebra_jumper'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  for (const [name, bg, ink, t] of [['light', '#e9f3dc', '#223', 0.3], ['dark', '#2c3a2a', '#eee', 1.1]]) {
    const data = await p.evaluate(({ IDS, bg, ink, t }) => {
      const w = 1100, cols = 5, cw = w / cols, ch = 190, h = Math.ceil(IDS.length / cols) * ch + 20;
      const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2;
      const c = cv.getContext('2d'); c.scale(2, 2);
      c.fillStyle = bg; c.fillRect(0, 0, w, h);
      IDS.forEach((id, i) => {
        const def = GG.BUG_BY_ID[id];
        const x = (i % cols) * cw + cw / 2 - 30, y = Math.floor(i / cols) * ch + 90;
        GG.BugArt.draw(c, def, x, y, 3.0, -Math.PI / 2, t);
        GG.BugArt.draw(c, def, x + 95, y + 20, 1.0 * (def.size || 1), -Math.PI / 2, t);
        c.fillStyle = ink; c.font = 'bold 12px system-ui'; c.textAlign = 'center';
        c.fillText(def.name, x + 30, y + 80);
      });
      return cv.toDataURL('image/png');
    }, { IDS, bg, ink, t });
    require('fs').writeFileSync(__dirname + '/shots/v116-new-' + name + '.png', Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
