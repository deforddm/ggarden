/* Picture sheets for the 26 new scenery props: big, and at true size,
   on a light ground and a dark one. */
const { chromium } = require('playwright');
const PROPS = [
  ['garryOak', 52, 'oak savanna'], ['cliffOak', 30, 'oak savanna'],
  ['acorns', 15, 'oak savanna FLAT'], ['oakGall', 20, 'oak savanna'],
  ['oakSnag', 44, 'oak savanna'],
  ['cattail', 34, 'swamp'], ['bulrush', 32, 'swamp'],
  ['muskratLodge', 44, 'swamp'], ['sunkLog', 36, 'swamp'],
  ['duckweed', 34, 'swamp FLAT'], ['boardwalk', 46, 'swamp'],
  ['basaltColumn', 50, 'scabland'], ['scabPothole', 38, 'scabland FLAT'],
  ['currentRipple', 44, 'scabland FLAT'], ['scabRubble', 30, 'scabland'],
  ['bamboo', 46, 'bamboo'], ['bambooShoot', 22, 'bamboo'],
  ['cherryTree', 50, 'cherry (bloom)'], ['cherryTree', 50, 'cherry (fruit)'],
  ['petalDrift', 36, 'cherry FLAT'],
  ['nestBox', 26, 'bird town'], ['birdBath', 28, 'bird town'],
  ['feederPole', 32, 'bird town'],
  ['coop', 44, 'bird farm'], ['strawBale', 26, 'bird farm'],
  ['trough', 30, 'bird farm'], ['farmFence', 34, 'bird farm']
];
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

  const grid = function (c, w, h, o) {
    const list = o.list, cols = o.cols, cw = w / cols, ch = o.ch, k = o.k;
    c.fillStyle = o.bg; c.fillRect(0, 0, w, h);
    list.forEach((it, i) => {
      const x = (i % cols) * cw + cw / 2;
      const y = Math.floor(i / cols) * ch + ch - 26;
      c.strokeStyle = o.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - cw / 2 + 6, y + 0.5); c.lineTo(x + cw / 2 - 6, y + 0.5); c.stroke();
      const pp = { bloom: it[2].indexOf('fruit') >= 0 ? false : true };
      GG.Props[it[0]](c, x, y, it[1] * k, o.t, 0.37 + i * 0.113, null, pp);
      c.fillStyle = o.dark ? '#dfe8d6' : '#2c3a26';
      c.font = 'bold 11px system-ui'; c.textAlign = 'center';
      c.fillText(it[0], x, y + 14);
      c.fillStyle = o.dark ? '#93a68a' : '#6a7a60'; c.font = '9px system-ui';
      c.fillText(it[2] + '  r=' + it[1], x, y + 25);
    });
  };

  const A = PROPS.slice(0, 14), B = PROPS.slice(14);
  await sheet('p114-a.png', grid, 1200, 1000, '#8fc76a',
    { list: A, cols: 5, ch: 330, k: 1.5, t: 1.15, bg: '#8fc76a' });
  await sheet('p114-b.png', grid, 1200, 1000, '#8fc76a',
    { list: B, cols: 5, ch: 330, k: 1.5, t: 1.15, bg: '#8fc76a' });
  await sheet('p114-a-dark.png', grid, 1200, 1000, '#3b4a34',
    { list: A, cols: 5, ch: 330, k: 1.5, t: 2.7, bg: '#3b4a34', dark: 1 });
  await sheet('p114-b-dark.png', grid, 1200, 1000, '#3b4a34',
    { list: B, cols: 5, ch: 330, k: 1.5, t: 2.7, bg: '#3b4a34', dark: 1 });
  /* true size, the way she will actually see them */
  await sheet('p114-true.png', grid, 1200, 760, '#9ec972',
    { list: PROPS, cols: 7, ch: 190, k: 1, t: 1.15, bg: '#9ec972' });
  await sheet('p114-true-tan.png', grid, 1200, 760, '#c3b184',
    { list: PROPS, cols: 7, ch: 190, k: 1, t: 2.2, bg: '#c3b184' });
  await sheet('p114-true-dark.png', grid, 1200, 760, '#55603f',
    { list: PROPS, cols: 7, ch: 190, k: 1, t: 3.4, bg: '#55603f', dark: 1 });

  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await b.close();
})();
