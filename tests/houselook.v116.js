/* v1.16 picture of the cottage at Guin's own scale, on a phone and on a
   wide screen, with friends at home and one walking with her. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [name, vw, vh] of [['phone', 412, 860], ['wide', 1280, 800]]) {
    const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
    await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForTimeout(700); await p.click('#btn-play'); await p.waitForTimeout(800);
    await p.evaluate(() => {
      ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
      ['cookie', 'tabby', 'horse', 'labrador', 'chicken', 'budgie', 'moose'].forEach(id => GG.Save.addFriend(id));
      GG.Save.data.homeFriends = ['tabby', 'horse', 'labrador', 'chicken', 'budgie', 'moose'];
      GG.Friends.setCompanion('cookie');
      GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36);
    });
    await p.waitForTimeout(300);
    await p.keyboard.press('Space');
    await p.waitForTimeout(600);
    await p.evaluate(() => { GG.Player.reset(300, 250); });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: __dirname + '/shots/v116-house-' + name + '.png' });
    await p.close();
  }
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
