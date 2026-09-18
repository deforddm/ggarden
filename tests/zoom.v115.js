const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(600); await p.click('#btn-play'); await p.waitForTimeout(800);
  const ids = process.argv[2].split(',');
  const data = await p.evaluate(({ ids }) => {
    const cols = Math.min(ids.length, 3), rows = Math.ceil(ids.length / cols);
    const W = cols * 320, H = rows * 320;
    const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2;
    const c = cv.getContext('2d'); c.scale(2, 2);
    ids.forEach((id, i) => {
      const x = (i % cols) * 320, y = Math.floor(i / cols) * 320;
      c.fillStyle = (i % 2) ? '#eef4e8' : '#8fc76a'; c.fillRect(x, y, 320, 160);
      c.fillStyle = (i % 2) ? '#2a3326' : '#455c4a'; c.fillRect(x, y + 160, 320, 160);
      const def = GG.BUG_BY_ID[id] || GG.FISH_BY_ID[id];
      const drawIt = (yy, t) => {
        if (def.isFish) GG.FishArt.draw(c, def, x + 160, yy, 5, false, t);
        else GG.BugArt.draw(c, def, x + 160, yy, 5.4, -Math.PI / 2, t);
      };
      drawIt(y + 80, 1.15); drawIt(y + 240, 2.6);
      c.fillStyle = '#000'; c.font = 'bold 12px system-ui'; c.textAlign = 'left';
      c.fillText(def.name, x + 6, y + 14);
    });
    return cv.toDataURL('image/png');
  }, { ids });
  require('fs').writeFileSync('tests/shots/v115-zoom.png', Buffer.from(data.split(',')[1], 'base64'));
  await b.close();
})();
