/* Picture sheets of everything the new waters added. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await p.goto('http://localhost:8899/index.html');
  await p.waitForTimeout(700);
  await p.click('#btn-play');
  await p.waitForTimeout(800);

  const sheet = async (id, ids, isFish) => {
    await p.evaluate(([id, ids, isFish]) => {
      const cols = 5, cell = 190, rows = Math.ceil(ids.length / cols);
      const cv = document.createElement('canvas');
      cv.id = id; cv.width = cols * cell; cv.height = rows * cell;
      cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99';
      document.body.appendChild(cv);
      const c = cv.getContext('2d');
      const g = c.createLinearGradient(0, 0, 0, cv.height);
      if (isFish) { g.addColorStop(0, '#a8dcee'); g.addColorStop(1, '#3f93b8'); }
      else { g.addColorStop(0, '#dfeecd'); g.addColorStop(1, '#b8d8b0'); }
      c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
      ids.forEach((sid, i) => {
        const x = (i % cols) * cell + cell / 2, y = ((i / cols) | 0) * cell + cell / 2;
        const def = isFish ? GG.FISH_BY_ID[sid] : GG.BUG_BY_ID[sid];
        if (!def) { c.fillStyle = '#c00'; c.fillText('?? ' + sid, x, y); return; }
        if (isFish) GG.FishArt.draw(c, def, x, y - 12, 2.0, false, 1.1);
        else GG.BugArt.draw(c, def, x, y - 12, 3.0, -Math.PI / 2, 1.1);
        c.fillStyle = '#24331c'; c.font = 'bold 14px "Trebuchet MS", sans-serif';
        c.textAlign = 'center';
        c.fillText(def.name, x, y + cell / 2 - 14);
      });
    }, [id, ids, isFish]);
    await p.waitForTimeout(250);
    await (await p.$('#' + id)).screenshot({ path: __dirname + '/shots/' + id + '.png' });
    await p.evaluate(id => document.getElementById(id).remove(), id);
  };

  await sheet('sheet-tidepool', ['hermit_crab','shore_crab','sea_star','anemone','urchin',
    'limpet','periwinkle','sea_slug','ghost_crab','horseshoe_crab'], false);
  await sheet('sheet-shore', ['sand_hopper','kelp_fly','sand_wasp','tiger_beetle','stonefly',
    'dobsonfly','whirligig','boatman','caddisfly','mayfly_river'], false);
  await sheet('sheet-newfish', ['creek_chub','smallmouth','sculpin','crayfish','eel',
    'chinook','striped_bass','flounder','blue_crab','mackerel',
    'sea_bass','cod','snapper','halibut','mola'], true);
  await b.close();
})();
