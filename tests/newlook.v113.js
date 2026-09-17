/* Picture sheets for the six new habitats: all 48 new species, big and at
   true sprite size, on a light ground and a dark one. */
const { chromium } = require('playwright');
const NEW = require('./newids.json');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);

  async function sheet(file, fn, w, h, bg, arg) {
    const data = await p.evaluate(({ fnStr, w, h, bg, arg }) => {
      const cv = document.createElement('canvas');
      cv.width = w * 2; cv.height = h * 2;
      const c = cv.getContext('2d'); c.scale(2, 2);
      c.fillStyle = bg; c.fillRect(0, 0, w, h);
      // eslint-disable-next-line no-eval
      eval('(' + fnStr + ')')(c, w, h, arg);
      return cv.toDataURL('image/png');
    }, { fnStr: fn.toString(), w, h, bg, arg });
    require('fs').writeFileSync('tests/shots/' + file,
      Buffer.from(data.split(',')[1], 'base64'));
  }

  const big = function (c, w, h, o) {
    const ids = o.ids, cols = 6, cw = w / cols, ch = 168;
    c.fillStyle = o.dark ? '#2a3326' : '#eef4e8'; c.fillRect(0, 0, w, h);
    ids.forEach((id, i) => {
      const def = GG.BUG_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 78;
      GG.BugArt.draw(c, def, x, y, 2.9, -Math.PI / 2, o.t);
      c.fillStyle = o.dark ? '#dfe8d6' : '#2c3a26';
      c.font = 'bold 11px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 66);
      c.fillStyle = o.dark ? '#93a68a' : '#6a7a60'; c.font = '10px system-ui';
      c.fillText(def.art.shape + '  ' + def.size, x, y + 79);
    });
  };
  const tiny = function (c, w, h, o) {
    const ids = o.ids, cols = 8, cw = w / cols, ch = 72;
    c.fillStyle = o.dark ? '#2a3326' : '#eef4e8'; c.fillRect(0, 0, w, h);
    ids.forEach((id, i) => {
      const def = GG.BUG_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 28;
      GG.BugArt.draw(c, def, x, y, 1, -Math.PI / 2, o.t);
      c.fillStyle = o.dark ? '#93a68a' : '#6a7a60';
      c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 34);
    });
  };

  const A = NEW.slice(0, 24), B = NEW.slice(24);
  await sheet('v113-a.png', big, 1200, 700, '#eef4e8', { ids: A, t: 1.15 });
  await sheet('v113-b.png', big, 1200, 700, '#eef4e8', { ids: B, t: 1.15 });
  await sheet('v113-a-dark.png', big, 1200, 700, '#2a3326', { ids: A, t: 2.6, dark: 1 });
  await sheet('v113-b-dark.png', big, 1200, 700, '#2a3326', { ids: B, t: 2.6, dark: 1 });
  await sheet('v113-tiny.png', tiny, 1000, 460, '#eef4e8', { ids: NEW, t: 1.15 });
  await sheet('v113-tiny-dark.png', tiny, 1000, 460, '#2a3326', { ids: NEW, t: 2.6, dark: 1 });

  /* the whole roster, to prove nothing old changed */
  await sheet('v113-roster.png', function (c, w, h) {
    const cols = 9, cw = w / cols, ch = 122;
    c.fillStyle = '#eef4e8'; c.fillRect(0, 0, w, h);
    GG.BUGS.forEach((def, i) => {
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 58;
      GG.BugArt.draw(c, def, x, y, 2, -Math.PI / 2, 1.15);
      c.fillStyle = '#4a5a44'; c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 48);
    });
  }, 1350, 2130, '#eef4e8', {});

  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await b.close();
})();
