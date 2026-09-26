const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(800);
  const url = await p.evaluate(() => {
    const D = GG.HOME_DECOR, kinds = ['wall', 'floor', 'rug', 'quilt', 'curtain'];
    const S = 2, tw = 100, th = 64;
    const cv = document.createElement('canvas'); cv.width = 12 * (tw + 8) * S; cv.height = 5 * (th + 8) * S;
    const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);
    kinds.forEach((k, r) => D[k].forEach((o, i) => { c.save(); c.scale(S, S); c.translate(i * (tw + 8), r * (th + 8)); GG.HomeArt.swatch(c, k, o.id, tw, th); c.restore(); }));
    const cv2 = document.createElement('canvas'); cv2.width = 8 * 110 * 3; cv2.height = 3 * 110 * 3;
    const c2 = cv2.getContext('2d'); c2.fillStyle = '#f3e6cc'; c2.fillRect(0, 0, cv2.width, cv2.height);
    D.item.forEach((o, i) => { c2.save(); c2.scale(3, 3); c2.translate((i % 8) * 110 + 55, Math.floor(i / 8) * 110 + 95); GG.HomeArt.drawItem(c2, o.id, 0, 0, 0.5, o); c2.restore(); });
    c2.save(); c2.scale(3,3); c2.translate(7*110+55, 2*110+95); GG.HomeArt.drawItem(c2, '_decorate', 0, 0, 0); c2.restore();
    return [cv.toDataURL(), cv2.toDataURL()];
  });
  const fs = require('fs');
  fs.writeFileSync('tests/shots/v120home/_sheet-looks.png', Buffer.from(url[0].split(',')[1], 'base64'));
  fs.writeFileSync('tests/shots/v120home/_sheet-items.png', Buffer.from(url[1].split(',')[1], 'base64'));
  await b.close();
})();
