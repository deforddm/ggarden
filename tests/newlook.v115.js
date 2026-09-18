/* Picture sheets for everything added with the seven new places: every new
   bug and every new fish, big and at true sprite size, on a light ground
   and a dark one, plus the whole roster before-and-after. */
const { chromium } = require('playwright');
const NEW = require('./newids.v115.json');
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

  const bigBugs = function (c, w, h, o) {
    const ids = o.ids, cols = 6, cw = w / cols, ch = 176;
    c.fillStyle = o.bg; c.fillRect(0, 0, w, h);
    ids.forEach((id, i) => {
      const def = GG.BUG_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 84;
      GG.BugArt.draw(c, def, x, y, 2.9, -Math.PI / 2, o.t);
      c.fillStyle = o.ink; c.font = 'bold 11px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 70);
      c.fillStyle = o.ink2; c.font = '10px system-ui';
      c.fillText(def.art.shape + '  ' + def.size, x, y + 83);
    });
  };
  const tinyBugs = function (c, w, h, o) {
    const ids = o.ids, cols = 7, cw = w / cols, ch = 76;
    c.fillStyle = o.bg; c.fillRect(0, 0, w, h);
    ids.forEach((id, i) => {
      const def = GG.BUG_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 30;
      GG.BugArt.draw(c, def, x, y, 1, -Math.PI / 2, o.t);
      c.fillStyle = o.ink2; c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 34);
    });
  };
  const bigFish = function (c, w, h, o) {
    const ids = o.ids, cols = 3, cw = w / cols, ch = 176;
    c.fillStyle = o.bg; c.fillRect(0, 0, w, h);
    ids.forEach((id, i) => {
      const def = GG.FISH_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 80;
      GG.FishArt.draw(c, def, x, y, 2.4, false, o.t);
      c.fillStyle = o.ink; c.font = 'bold 12px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 62);
      c.fillStyle = o.ink2; c.font = '10px system-ui';
      c.fillText(def.art.shape + '  ' + def.size, x, y + 76);
    });
  };
  const tinyFish = function (c, w, h, o) {
    const ids = o.ids, cols = 4, cw = w / cols, ch = 78;
    c.fillStyle = o.bg; c.fillRect(0, 0, w, h);
    ids.forEach((id, i) => {
      const def = GG.FISH_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 34;
      GG.FishArt.draw(c, def, x, y, 1, false, o.t);
      c.fillStyle = o.ink2; c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 30);
    });
  };

  const LIGHT = { bg: '#eef4e8', ink: '#2c3a26', ink2: '#6a7a60' };
  const GRASS = { bg: '#8fc76a', ink: '#1d3a12', ink2: '#2f4a22' };
  const DARK  = { bg: '#2a3326', ink: '#dfe8d6', ink2: '#93a68a' };
  const MUD   = { bg: '#455c4a', ink: '#e4ecdd', ink2: '#a8bda4' };

  const B = NEW.bugs, F = NEW.fish;
  await sheet('v115-bugs-light.png', bigBugs, 1200, 740, LIGHT, Object.assign({ ids: B, t: 1.15 }, LIGHT));
  await sheet('v115-bugs-dark.png',  bigBugs, 1200, 740, DARK,  Object.assign({ ids: B, t: 2.6 }, DARK));
  await sheet('v115-bugs-grass.png', bigBugs, 1200, 740, GRASS, Object.assign({ ids: B, t: 0.55 }, GRASS));
  await sheet('v115-bugs-tiny.png',  tinyBugs, 900, 360, LIGHT, Object.assign({ ids: B, t: 1.15 }, LIGHT));
  await sheet('v115-bugs-tiny-dark.png', tinyBugs, 900, 360, DARK, Object.assign({ ids: B, t: 2.6 }, DARK));
  await sheet('v115-bugs-tiny-grass.png', tinyBugs, 900, 360, GRASS, Object.assign({ ids: B, t: 0.55 }, GRASS));
  await sheet('v115-fish-light.png', bigFish, 1100, 560, LIGHT, Object.assign({ ids: F, t: 1.15 }, LIGHT));
  await sheet('v115-fish-dark.png',  bigFish, 1100, 560, MUD,   Object.assign({ ids: F, t: 2.6 }, MUD));
  await sheet('v115-fish-tiny.png',  tinyFish, 800, 200, LIGHT, Object.assign({ ids: F, t: 1.15 }, LIGHT));
  await sheet('v115-fish-tiny-dark.png', tinyFish, 800, 200, MUD, Object.assign({ ids: F, t: 2.6 }, MUD));

  /* the whole roster, to prove nothing old changed */
  await sheet((process.argv[3] || 'v115') + '-roster.png', function (c, w, h) {
    const cols = 9, cw = w / cols, ch = 122;
    c.fillStyle = '#eef4e8'; c.fillRect(0, 0, w, h);
    GG.BUGS.forEach((def, i) => {
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 58;
      GG.BugArt.draw(c, def, x, y, 2, -Math.PI / 2, 1.15);
      c.fillStyle = '#4a5a44'; c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 48);
    });
  }, 1350, 2420, '#eef4e8', {});
  await sheet((process.argv[3] || 'v115') + '-fishroster.png', function (c, w, h) {
    const cols = 6, cw = w / cols, ch = 110;
    c.fillStyle = '#eef4e8'; c.fillRect(0, 0, w, h);
    GG.FISH.forEach((def, i) => {
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 52;
      GG.FishArt.draw(c, def, x, y, 1.5, false, 1.15);
      c.fillStyle = '#4a5a44'; c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 42);
    });
  }, 1100, 700, '#eef4e8', {});

  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await b.close();
})();
