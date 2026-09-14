/* Picture sheets for v1.12: the twenty new bugs, the ten fruits, the ten
   new decorations, and the footbridge in place. */
const { chromium } = require('playwright');
const NEW_BUGS = ['mason_bee','yellowjacket','baldfaced_hornet','sap_beetle','apple_maggot_fly',
  'snakefly','bee_fly','cross_orbweaver','tenlined_beetle','ground_beetle',
  'jerusalem_cricket','northern_scorpion','windscorpion','pinacate_beetle','harvester_ant',
  'velvet_ant','robber_fly','blister_beetle','sweat_bee','behrs_hairstreak'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(900);

  async function sheet(file, fn, w, h) {
    const data = await p.evaluate(({ fnStr, w, h }) => {
      const cv = document.createElement('canvas');
      cv.width = w * 2; cv.height = h * 2;
      const c = cv.getContext('2d'); c.scale(2, 2);
      c.fillStyle = '#eef4e8'; c.fillRect(0, 0, w, h);
      // eslint-disable-next-line no-eval
      eval('(' + fnStr + ')')(c, w, h);
      return cv.toDataURL('image/png');
    }, { fnStr: fn.toString(), w, h });
    require('fs').writeFileSync('tests/shots/' + file,
      Buffer.from(data.split(',')[1], 'base64'));
  }

  await sheet('v112-bugs.png', function (c, w, h) {
    const ids = ['mason_bee','yellowjacket','baldfaced_hornet','sap_beetle','apple_maggot_fly',
      'snakefly','bee_fly','cross_orbweaver','tenlined_beetle','ground_beetle',
      'jerusalem_cricket','northern_scorpion','windscorpion','pinacate_beetle','harvester_ant',
      'velvet_ant','robber_fly','blister_beetle','sweat_bee','behrs_hairstreak'];
    const cols = 5, cw = w / cols, ch = 170;
    ids.forEach((id, i) => {
      const def = GG.BUG_BY_ID[id];
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 76;
      GG.BugArt.draw(c, def, x, y, 3.1, -Math.PI / 2, 1.15);
      c.fillStyle = '#2c3a26'; c.font = 'bold 12px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 62);
      c.fillStyle = '#6a7a60'; c.font = '11px system-ui';
      c.fillText(def.habitats.join(', ') + ' / ' + def.times.join(','), x, y + 77);
    });
  }, 1000, 700);

  await sheet('v112-fruit.png', function (c, w, h) {
    const cols = 5, cw = w / cols, ch = 180;
    GG.FRUITS.forEach((def, i) => {
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 80;
      GG.FruitArt.draw(c, def, x, y, 3.4, 1.2);
      c.fillStyle = '#2c3a26'; c.font = 'bold 12px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 66);
      c.fillStyle = def.eat === 'never' ? '#b22b2b' : (def.eat === 'careful' ? '#9a6a12' : '#3f7a3a');
      c.font = '11px system-ui';
      c.fillText(GG.FRUIT_EAT[def.eat].label + '  →  ' + GG.DECOR_BY_ID[def.unlock].name, x, y + 82);
    });
  }, 1000, 380);

  await sheet('v112-decor.png', function (c, w, h) {
    const list = GG.DECOR.filter(d => d.fruit);
    const cols = 5, cw = w / cols, ch = 170;
    list.forEach((dec, i) => {
      const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 120;
      GG.DecorArt[dec.id](c, x, y, 1.5, 1.1);
      c.fillStyle = '#2c3a26'; c.font = 'bold 12px system-ui'; c.textAlign = 'center';
      c.fillText(dec.name, x, y + 22);
    });
  }, 1000, 360);

  /* the footbridge, in the world */
  await p.setViewportSize({ width: 500, height: 900 });
  await p.evaluate(() => {
    const B = GG.World.bridge;
    GG.Player.reset(B.x, B.y);
    GG.Time.minutes = 11 * 60;
  });
  await p.waitForTimeout(900);
  await p.screenshot({ path: 'tests/shots/v112-bridge.png' });

  await p.evaluate(() => {
    const t = GG.Orchard.plants.filter(q => q.type === 'appleTree')[2];
    GG.Player.reset(t.x, t.y + 52);
    GG.Time.minutes = 10 * 60;
  });
  await p.waitForTimeout(900);
  await p.screenshot({ path: 'tests/shots/v112-orchard.png' });

  await p.evaluate(() => {
    const t = GG.Orchard.plants.filter(q => q.type === 'wildBush')[1];
    GG.Player.reset(t.x, t.y + 56);
    GG.debugCam = true;
  });
  await p.waitForTimeout(900);
  await p.screenshot({ path: 'tests/shots/v112-hills.png' });

  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log('sheets written');
  await b.close();
})();
