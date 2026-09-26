/* v1.20.1: the rounded fonts are part of the game. With every request to
   anywhere but the game itself blocked, Fredoka and Nunito still load, the
   buttons use them, and nothing asks Google Fonts for anything. Runs against
   the source page and the single-file build (argv[2], default both). */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  const urls = process.argv[2] ? [process.argv[2]]
    : ['http://localhost:8899/index.html', 'http://localhost:8899/dist/index.html'];
  for (const url of urls) {
    const tag = /dist/.test(url) ? 'build' : 'source';
    const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const outside = [], errs = [];
    await ctx.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://localhost:8899/') || u.startsWith('data:')) return route.continue();
      outside.push(u); return route.abort();
    });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(url);
    await p.waitForTimeout(1500);
    const f = await p.evaluate(async () => {
      await document.fonts.ready;
      const loaded = [...document.fonts].filter(x => x.status === 'loaded').map(x => x.family.replace(/"/g, ''));
      const play = getComputedStyle(document.getElementById('btn-play')).fontFamily;
      return {
        loaded,
        fredoka: document.fonts.check('600 20px "Fredoka"'),
        nunito: document.fonts.check('800 16px "Nunito"'),
        play, ready: !!(GG.FxUI && GG.FxUI._fontsReady), v: GG.VERSION
      };
    });
    ok(tag + ': Fredoka loads with no internet (' + f.loaded.join(', ') + ')', f.fredoka && f.loaded.indexOf('Fredoka') >= 0);
    ok(tag + ': Nunito loads with no internet', f.nunito && f.loaded.indexOf('Nunito') >= 0);
    ok(tag + ': the Play button is set in Fredoka (' + f.play.split(',')[0] + ')', /^"?Fredoka/.test(f.play));
    ok(tag + ': the minimap is told the fonts are ready', f.ready);
    ok(tag + ': nothing is fetched from outside the game (' + outside.length + ')', outside.length === 0);
    ok(tag + ': no page errors (' + errs.length + ') on version ' + f.v, !errs.length && f.v === '1.20.1');
    await ctx.close();
  }
  r.forEach(l => console.log(l));
  console.log(r.every(l => l.startsWith('PASS')) ? 'ALL PASS' : 'SOME FAILED');
  await b.close();
})();
