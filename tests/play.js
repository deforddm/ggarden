const { chromium } = require('playwright');
const path = require('path');
const ROOT = path.join(__dirname, '..');

(async () => {
  const mobile = process.argv[3] === 'mobile';
  const b = await chromium.launch();
  const p = await b.newPage({
    viewport: mobile ? { width: 412, height: 860 } : { width: 1100, height: 720 },
    deviceScaleFactor: 2,
    hasTouch: true
  });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(800);
  const shots = [];
  async function shot(name) { const f = path.join(__dirname, 'shots', (mobile?'m-':'') + name + '.png'); await p.screenshot({ path: f }); shots.push(f); }

  await shot('01-title');
  await p.click('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(1200);
  await shot('02-world');

  // walk around with keys
  for (const k of ['ArrowUp', 'ArrowLeft']) {
    await p.keyboard.down(k); await p.waitForTimeout(1100); await p.keyboard.up(k);
  }
  await shot('03-walk');

  // swing a few times, try to catch something
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press('Space');
    await p.waitForTimeout(180);
    const open = await p.$eval('#catch-pop', el => !el.classList.contains('hidden'));
    if (open) break;
    await p.keyboard.down('ArrowDown'); await p.waitForTimeout(220); await p.keyboard.up('ArrowDown');
  }
  const caught = await p.$eval('#catch-pop', el => !el.classList.contains('hidden'));
  await shot('04-catch');
  if (caught) { await p.click('#catch-ok'); await p.waitForTimeout(300); }

  // force-grant some progress so the book/terrarium/shop can be checked
  await p.evaluate(() => {
    ['monarch','ladybug','firefly','luna_moth','dragonfly','snail','bumblebee','mantis'].forEach(id => GG.Save.addCatch(id));
    GG.Save.data.sparkles = 5000;
    GG.Save.data.unlockedDecor = GG.DECOR.map(d => d.id).concat(GG.TANK_BGS.map(b => 'bg_' + b.id));
    GG.Save.save(); GG.UI.refreshHud();
  });

  await p.evaluate(() => GG.Book.open());
  await p.waitForTimeout(500); await shot('05-book');
  await p.evaluate(() => GG.Book.showDetail(GG.BUG_BY_ID['luna_moth']));
  await p.waitForTimeout(500); await shot('06-book-detail');
  await p.evaluate(() => GG.UI.close('screen-book'));

  await p.evaluate(() => {
    const t = GG.Save.data.terrariums[0];
    t.bugs = [{id:'monarch',x:200,y:150,s:1,seed:.2},{id:'firefly',x:420,y:190,s:1,seed:.5},{id:'snail',x:300,y:350,s:1,seed:.7}];
    t.decor = [{id:'log',x:150,y:340,s:1,seed:.1},{id:'fern',x:470,y:352,s:1,seed:.3},{id:'mushroom',x:360,y:330,s:1,seed:.9},{id:'lantern',x:250,y:360,s:1,seed:.4}];
    GG.Save.save(); GG.Terrarium.open();
  });
  await p.waitForTimeout(700); await shot('07-terrarium');

  await p.evaluate(() => { GG.Terrarium.tab='decor'; GG.Terrarium.buildTray(); });
  await p.waitForTimeout(300); await shot('08-terrarium-decor');
  await p.evaluate(() => GG.UI.close('screen-terrarium'));

  await p.evaluate(() => GG.Shop.open());
  await p.waitForTimeout(400); await shot('09-shop');
  await p.evaluate(() => GG.UI.close('screen-shop'));

  // night time
  await p.evaluate(() => { GG.Time.minutes = 22*60; });
  await p.waitForTimeout(900); await shot('10-night');

  // rain
  await p.evaluate(() => { GG.Time.minutes = 13*60; GG.Time.rain = true; GG.Time.rainTimer = 300; });
  await p.waitForTimeout(900); await shot('11-rain');

  // go to the pond
  await p.evaluate(() => { GG.Player.reset(980, 1930); GG.Critters.clear(); });
  await p.waitForTimeout(1400); await shot('12-pond');

  // forest
  await p.evaluate(() => { GG.Time.rain=false; GG.Player.reset(2400, 700); GG.Critters.clear(); });
  await p.waitForTimeout(1400); await shot('13-forest');

  // house
  await p.evaluate(() => { GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36); });
  await p.waitForTimeout(400);
  await p.keyboard.press('Space');
  await p.waitForTimeout(700); await shot('14-house');

  await p.evaluate(() => { GG.UI.close('screen-book'); GG.UI.close('screen-terrarium'); });
  await p.click('#btn-menu');
  await p.waitForTimeout(500); await shot('15-menu');
  await p.evaluate(() => GG.UI.close('screen-menu'));

  const state = await p.evaluate(() => ({
    species: GG.Save.totalSpecies(), sparkles: GG.Save.data.sparkles,
    bugs: GG.Critters.list.length, fps: 1
  }));
  console.log('STATE', JSON.stringify(state));
  if (errs.length) console.log('ERRORS:\n' + errs.join('\n'));
  else console.log('no console errors');
  await b.close();
})();
