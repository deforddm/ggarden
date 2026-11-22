/* v1.21: the night sky. The telescopes, the real sky for a real date, the
   Moon, joining up a constellation with real taps, the seasons, the Mesa's
   dark sky, shooting stars, and the Star Book. */
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const base = process.argv[2] || 'http://localhost:8899/index.html';
  const ctx = await b.newContext({ ...devices['Pixel 7'], hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(base);
  await p.waitForTimeout(800);
  const results = [];
  const check = (name, ok, extra) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + (ok || extra == null ? '' : '  -> ' + JSON.stringify(extra))); };
  const hidden = sel => p.$eval(sel, e => e.classList.contains('hidden'));
  const ev = fn => p.evaluate(fn);

  /* ---- the astronomy, against things that are known ---- */
  const astro = await ev(() => {
    const A = GG.Sky._astro, jd = ms => A.julian(ms);
    const full = A.moonPos(jd(Date.UTC(2026, 10, 24, 14, 53)));   // full Moon, 24 Nov 2026
    const neu = A.moonPos(jd(Date.UTC(2026, 7, 12, 17, 37)));     // new Moon (a solar eclipse), 12 Aug 2026
    const j2000 = A.moonPos(jd(Date.UTC(2000, 0, 21, 4, 40)));    // full Moon (a lunar eclipse), 21 Jan 2000
    const eq = A.sunPos(jd(Date.UTC(2026, 2, 20, 14, 46)));       // the March equinox
    const gc = A.galToEq(0, 0);
    return { full: full.elong, neu: neu.elong, j2000: j2000.elong, sunDec: eq.dec, sunRa: eq.ra,
      gmst: A.gmst(2451545.0), gcRa: gc.ra, gcDec: gc.dec,
      summer: A.pacificOffset(2026, 7, 4), winter: A.pacificOffset(2026, 12, 25),
      mar7: A.pacificOffset(2026, 3, 7), mar8: A.pacificOffset(2026, 3, 8), nov1: A.pacificOffset(2026, 11, 1), oct31: A.pacificOffset(2026, 10, 31) };
  });
  const near = (a, b, tol) => Math.abs(((a - b + 540) % 360) - 180) <= tol;
  check('the Moon is full on 24 Nov 2026', near(astro.full, 180, 3), astro.full);
  check('the Moon is new on 12 Aug 2026', near(astro.neu, 0, 3), astro.neu);
  check('the Moon is full on 21 Jan 2000', near(astro.j2000, 180, 3), astro.j2000);
  check('the Sun crosses the equator at the March equinox', Math.abs(astro.sunDec) < 0.3 && near(astro.sunRa, 0, 0.6), astro);
  check('sidereal time at J2000 is 280.46 degrees', Math.abs(astro.gmst - 280.46) < 0.01, astro.gmst);
  check('the middle of the galaxy is in Sagittarius', Math.abs(astro.gcRa - 266.4) < 0.2 && Math.abs(astro.gcDec + 28.94) < 0.2, astro);
  check('summer time: 7 hours behind in July, 8 at Christmas', astro.summer === 7 && astro.winter === 8);
  check('the clocks change on 8 March and 1 November 2026', astro.mar7 === 8 && astro.mar8 === 7 && astro.oct31 === 7 && astro.nov1 === 8, astro);

  /* ---- the data ---- */
  const data = await ev(() => ({
    stars: GG.STAR_DATA.length / 4, cons: GG.CONSTELLATIONS.length, tr: GG.SKY_TREASURES.length,
    noLines: GG.CONSTELLATIONS.filter(c => !GG.STAR_LINES[c.id]).map(c => c.id),
    noWords: GG.SKY_ALL.filter(c => !c.name || !c.fact || !c.look || !c.when || !c.latin).map(c => c.id),
    noFact: Object.keys(GG.STAR_NAMED).filter(n => !GG.STAR_FACTS[n]),
    polaris: GG.STAR_NAMED.Polaris, sirius: GG.STAR_NAMED.Sirius,
    sorted: (() => { for (let i = 1; i < GG.STAR_DATA.length / 4; i++) if (GG.STAR_DATA[i * 4 + 2] < GG.STAR_DATA[i * 4 - 2]) return false; return true; })(),
    fresh: GG.Save.fresh()
  }));
  check('over a thousand real stars', data.stars > 1000, data.stars);
  check('26 constellations and 5 treasures', data.cons === 26 && data.tr === 5, data);
  check('every constellation has a figure', data.noLines.length === 0, data.noLines);
  check('every page has all its words', data.noWords.length === 0, data.noWords);
  check('every named star has a line to say', data.noFact.length === 0, data.noFact);
  check('Polaris is at the pole and Sirius is the brightest', data.polaris[1] > 89 && data.sirius[2] < -1.4 && data.sorted, data);
  check('a new save has an empty Star Book', data.fresh.stars && Object.keys(data.fresh.stars).length === 0 && data.fresh.wishes === 0);

  /* ---- into the garden ---- */
  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(600);
  await ev(() => { ['screen-news'].forEach(id => GG.UI.close(id)); });
  const scopes = await ev(() => GG.World.telescopes.map(t => ({ x: t.x, y: t.y, site: t.site,
    front: GG.World.blocked(t.x, t.y + 26, 9), solid: GG.World.blocked(t.x, t.y, 4),
    art: typeof GG.Props.telescope, onMesa: GG.World.placeName(t.x, t.y) })));
  check('two telescopes: home and the Mesa', scopes.length === 2 && scopes[0].site === 'home' && scopes[1].site === 'mesa', scopes);
  check('she can stand at each eyepiece, and cannot walk through one', scopes.every(s => !s.front && s.solid && s.art === 'function'), scopes);
  check('the home telescope is by the cottage', Math.hypot(scopes[0].x - 4720, scopes[0].y - 2440) < 260, scopes[0]);

  /* a fixed night, so the test means the same thing every day:
     Saturday 21 November 2026, at home */
  await ev(() => { GG.Sky._now = Date.UTC(2026, 10, 22, 4, 0); });

  /* by day the button offers to wait */
  await ev(() => { const t = GG.World.telescopes[0]; GG.Critters.clear(); GG.Critters.spawnNear = function () {}; GG.Player.reset(t.x, t.y + 26); GG.Time.set(13 * 60); });
  await p.waitForTimeout(1100);
  check('by day the button says STARS, wait for dark', (await p.$eval('#btn-a', e => e.textContent)) === 'STARSwait for dark');
  await p.tap('#btn-a');
  await p.waitForTimeout(400);
  check('waiting takes the clock to nine at night', await ev(() => Math.abs(GG.Time.minutes - 21 * 60) < 30));
  await p.waitForTimeout(1800);
  check('and then the sky opens by itself', !(await hidden('#screen-sky')));
  await p.tap('#sky-close');
  await p.waitForTimeout(300);
  check('the X goes back to the garden', await hidden('#screen-sky'));
  await p.waitForTimeout(900);
  check('after dark the button says STARS, look up', (await p.$eval('#btn-a', e => e.textContent)) === 'STARSlook up');
  await p.tap('#btn-a');
  await p.waitForTimeout(700);
  check('STARS opens the sky', !(await hidden('#screen-sky')));
  let d = await ev(() => GG.Sky.debug());
  check('it is the night of 21 November 2026, at home', d.base.y === 2026 && d.base.m === 11 && d.base.d === 21 && d.site === 'home', d.base);
  check('dark from about 5 pm to about 6 am', d.hStart > 16.8 && d.hStart < 17.6 && d.hEnd > 29.6 && d.hEnd < 30.6, [d.hStart, d.hEnd]);
  check('the date and the Moon are written at the top', /Sat 21 Nov/.test(await p.$eval('#sky-date', e => e.textContent)) && /gibbous/.test(await p.$eval('#sky-date', e => e.textContent)));
  check('the garden is paused underneath', await ev(() => GG.UI.anyOpen()));
  check('the canvas fills the screen', d.W > 380 && d.H > 700, [d.W, d.H]);

  /* ---- the sky is the right sky ---- */
  await ev(() => GG.Sky._setHour(22));
  const s22 = await ev(() => ({ ori: GG.Sky._con('Ori'), sco: GG.Sky._con('Sco'), uma: GG.Sky._con('UMa'), leo: GG.Sky._con('Leo'), cyg: GG.Sky._con('Cyg'), sgr: GG.Sky._con('Sgr') }));
  check('at 10 pm in November Orion is up', s22.ori.up && s22.ori.state === 'up');
  check('the Scorpion and the Archer are not in tonight’s sky at all', s22.sco.state === 'away' && s22.sgr.state !== 'up', [s22.sco.state, s22.sgr.state]);
  check('the Lion is not up yet but comes up later tonight', s22.leo.state === 'later' && s22.leo.best > 25, s22.leo);
  const polaris = await ev(() => {
    GG.Sky._look(0, 46); const a = GG.Sky._named('Polaris');
    GG.Sky._setHour(28); GG.Sky._look(0, 46); const b = GG.Sky._named('Polaris');
    GG.Sky._setHour(22); GG.Sky._look(0, 46);
    const v = GG.Sky._named('Dubhe'); GG.Sky._setHour(28); const w = GG.Sky._named('Dubhe'); GG.Sky._setHour(22);
    return { a, b, v, w };
  });
  check('Polaris stays put all night', Math.hypot(polaris.a.x - polaris.b.x, polaris.a.y - polaris.b.y) < 12, polaris);
  check('and the Big Dipper swings round it', Math.hypot(polaris.v.x - polaris.w.x, polaris.v.y - polaris.w.y) > 80, polaris);
  check('Polaris is due north, as high as the latitude', Math.abs(polaris.a.x - d.W / 2) < 14, polaris.a);
  const moon = await ev(() => { const m = GG.Sky.debug(); return { illum: m.moon.illum, alt: m.moonAlt, elong: m.moon.elong }; });
  check('a nearly full Moon is up', moon.illum > 0.82 && moon.illum < 0.97 && moon.alt > 20, moon);
  const lims = await ev(() => GG.Sky.debug().limit);
  check('moonlight hides the faint stars', lims < 4.3 && lims > 3.4, lims);
  const summer = await ev(() => {
    GG.Sky._now = Date.UTC(2026, 6, 16, 5, 0); GG.Sky.open('home'); GG.Sky._setHour(23);
    const r = { sco: GG.Sky._con('Sco').state, ori: GG.Sky._con('Ori').state, lyr: GG.Sky._con('Lyr').state, base: GG.Sky.debug().base, hStart: GG.Sky.debug().hStart };
    GG.Sky._now = Date.UTC(2026, 11, 14, 6, 0); GG.Sky.open('home'); r.shower = GG.Sky.debug().shower; r.cap = document.getElementById('sky-caption').textContent;
    GG.Sky._now = Date.UTC(2026, 10, 22, 4, 0); GG.Sky.open('home'); GG.Sky._setHour(22); r.none = GG.Sky.debug().shower;
    return r;
  });
  check('in July the Scorpion and the Harp are up and Orion is away', summer.sco === 'up' && summer.lyr === 'up' && summer.ori !== 'up', summer);
  check('in July it is summer time and dark comes late', summer.base.off === 7 && summer.hStart > 21.5, summer);
  check('13 December is a Geminid night, and it says so', summer.shower === 'Geminids' && /Geminids/.test(summer.cap) && summer.none === null, summer);

  /* ---- joining up a constellation with real fingers ---- */
  await ev(() => { GG.Sky._point('Cas'); });
  await p.waitForTimeout(300);
  let cas = await ev(() => GG.Sky._con('Cas'));
  const box = await p.$eval('#sky-canvas', e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; });
  check('the Queen has five stars, all on the screen', cas.verts.length === 5 && cas.verts.every(v => v.on && v.x > 10 && v.x < d.W - 10 && v.y > 70 && v.y < d.H - 190), cas.verts);
  const sparkles0 = await ev(() => GG.Save.data.sparkles);
  await p.touchscreen.tap(box.x + cas.verts[0].x, box.y + cas.verts[0].y);
  await p.waitForTimeout(250);
  check('one tap on a star starts the puzzle', (await ev(() => GG.Sky.debug().target)) === 'Cas');
  cas = await ev(() => GG.Sky._con('Cas'));
  check('and lights that star', cas.verts[0].lit && !cas.verts[1].lit);
  check('the caption says what to do', /ring/.test(await p.$eval('#sky-caption', e => e.textContent)));
  for (let i = 1; i < 4; i++) { await p.touchscreen.tap(box.x + cas.verts[i].x, box.y + cas.verts[i].y); await p.waitForTimeout(160); }
  check('four of five is not found yet', !(await ev(() => GG.Sky.has('Cas'))) && /4 of 5/.test(await p.$eval('#sky-caption', e => e.textContent)));
  /* a tap on empty sky must not throw the puzzle away */
  await p.touchscreen.tap(box.x + 30, box.y + 120);
  await p.waitForTimeout(150);
  check('a tap somewhere else loses none of her stars', (await ev(() => GG.Sky._con('Cas').verts.filter(v => v.lit).length)) === 4);
  await p.touchscreen.tap(box.x + cas.verts[4].x, box.y + cas.verts[4].y);
  await p.waitForTimeout(300);
  check('the fifth star finds the Queen', await ev(() => GG.Sky.has('Cas')), [cas, await ev(() => GG.Sky._con('Cas')), await ev(() => GG.Sky.debug())]);
  check('six sparkles for it', (await ev(() => GG.Save.data.sparkles)) === sparkles0 + 6);
  await p.waitForTimeout(2200);
  check('then her card comes up, NEW!', !(await hidden('#sky-card-wrap')) && !(await hidden('#sky-card-new')) && (await p.$eval('#sky-card-name', e => e.textContent)) === 'The Queen');
  check('with a true fact on it', /see-saw/.test(await p.$eval('#sky-card-fact', e => e.textContent)));
  const artInk = await p.$eval('#sky-card-art', cv => { const dd = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < dd.length; i += 16) if (dd[i] > 150 && dd[i + 1] > 150) n++; return n; });
  check('and her picture', artInk > 40, artInk);
  await p.waitForTimeout(600);
  await ev(() => { GG.Sky._cardAt = 0; document.getElementById('sky-card-ok').click(); });
  await p.waitForTimeout(300);
  check('Wow! closes the card', await hidden('#sky-card-wrap'));
  check('the count at the top says 1 / 31', /1 \/ 31/.test(await p.$eval('#sky-count', e => e.textContent)));
  await p.waitForTimeout(400);
  check('her chip is ticked and moved to the end', await ev(() => { const c = document.querySelector('.skychip[data-sky="Cas"]'); return c && c.classList.contains('found') && /✓/.test(c.textContent) && !c.nextElementSibling; }));

  /* rubbing: one swipe across the Little Dog's two stars */
  await ev(() => { GG.Sky._point('CMi'); GG.Sky._setHour(24); GG.Sky._point('CMi'); });
  await p.waitForTimeout(300);
  await p.tap('.skychip[data-sky="CMi"]');
  await p.waitForTimeout(900);
  check('a chip picks its constellation and tells her how to find it', (await ev(() => GG.Sky.debug().target)) === 'CMi' && /Procyon/.test(await p.$eval('#sky-caption', e => e.textContent)));
  const cmi = await ev(() => GG.Sky._con('CMi'));
  const cdp = await ctx.newCDPSession(p);
  const pt = (x, y) => [{ x: box.x + x, y: box.y + y, id: 1 }];
  const A = cmi.verts[0], B = cmi.verts[1];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(A.x, A.y) });
  for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(A.x + (B.x - A.x) * k / 8, A.y + (B.y - A.y) * k / 8) }); await p.waitForTimeout(20); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(300);
  check('rubbing a finger from star to star joins them up', await ev(() => GG.Sky.has('CMi')), [cmi, await ev(() => GG.Sky.debug())]);
  const azAfter = await ev(() => GG.Sky.debug().az);
  await p.waitForTimeout(2300);
  await ev(() => { GG.Sky._cardAt = 0; document.getElementById('sky-card-ok').click(); });
  await p.waitForTimeout(300);

  /* dragging turns her round */
  const az1 = await ev(() => GG.Sky.debug().az);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(300, 300) });
  for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(300 - k * 20, 300) }); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(200);
  const az2 = await ev(() => GG.Sky.debug().az);
  check('dragging left turns her to the right', ((az2 - az1 + 540) % 360) - 180 > 10, [az1, az2, azAfter]);

  /* a named star, and the Moon */
  await ev(() => { GG.Sky._setHour(22); GG.Sky._look(0, 46); });
  await p.waitForTimeout(200);
  const pol = await ev(() => GG.Sky._named('Polaris'));
  await p.touchscreen.tap(box.x + pol.x, box.y + pol.y);
  await p.waitForTimeout(250);
  check('tapping Polaris says so, and starts the Little Bear', /North Star/.test(await p.$eval('#sky-caption', e => e.textContent)) && (await ev(() => GG.Sky.debug().target)) === 'UMi');
  /* ---- the seasons, from the chips ---- */
  await p.tap('.skychip[data-sky="Sco"]');
  await p.waitForTimeout(300);
  check('the Scorpion’s chip says come back in summer', /not in tonight/.test(await p.$eval('#sky-caption', e => e.textContent)) && /summer/.test(await p.$eval('#sky-caption', e => e.textContent)));
  await p.tap('.skychip[data-sky="Leo"]');
  await p.waitForTimeout(300);
  check('the Lion’s chip winds the night along', /Winding/.test(await p.$eval('#sky-caption', e => e.textContent)));
  await p.waitForTimeout(3200);
  d = await ev(() => GG.Sky.debug());
  check('to when the Lion is up, and picks him', d.hour > 25 && d.target === 'Leo' && (await ev(() => GG.Sky._con('Leo').up)), d);
  check('the clock by the slider moved too', /am/.test(await p.$eval('#sky-clock', e => e.textContent)));
  /* the slider */
  await p.$eval('#sky-time', e => { e.value = '0'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.waitForTimeout(200);
  check('the slider winds back to dusk', Math.abs((await ev(() => GG.Sky.debug().hour)) - d.hStart) < 0.01 && /pm/.test(await p.$eval('#sky-clock', e => e.textContent)));
  check('at dusk there is still a glow and fewer stars', await ev(() => GG.Sky.debug().sunAlt > -10 && GG.Sky.debug().limit < 3.4));

  /* ---- treasures and the dark sky ---- */
  await ev(() => GG.Sky._setHour(23));
  const home = await ev(() => ({ m31: GG.Sky._treasure('m31'), lim: GG.Sky.debug().limit }));
  check('from home the Andromeda Galaxy cannot be seen', home.m31 === null);
  const ple = await ev(() => { GG.Sky._look(150, 50); for (let az = 0; az < 360; az += 30) { GG.Sky._look(az, 50); const t = GG.Sky._treasure('pleiades'); if (t && t.x > 40 && t.x < 370 && t.y > 90 && t.y < 600) return t; } return null; });
  check('the Seven Sisters are up', !!ple, ple);
  await p.touchscreen.tap(box.x + ple.x, box.y + ple.y);
  await p.waitForTimeout(900);
  check('tapping them finds a treasure: eight sparkles and a card', (await ev(() => GG.Sky.has('pleiades'))) && !(await hidden('#sky-card-wrap')) && (await p.$eval('#sky-card-name', e => e.textContent)) === 'The Seven Sisters');
  await p.waitForTimeout(600); await ev(() => { GG.Sky._cardAt = 0; document.getElementById('sky-card-ok').click(); }); await p.waitForTimeout(300);

  /* shooting star */
  const w0 = await ev(() => ({ w: GG.Save.data.wishes, s: GG.Save.data.sparkles }));
  check('no WISH button until there is one', await hidden('#sky-wish'));
  await ev(() => GG.Sky._meteor());
  await p.waitForTimeout(350);
  check('a shooting star brings up WISH!', !(await hidden('#sky-wish')));
  await p.$eval('#sky-wish', e => e.click());
  await p.waitForTimeout(250);
  const w1 = await ev(() => ({ w: GG.Save.data.wishes, s: GG.Save.data.sparkles }));
  check('a wish is counted, two sparkles, and a true fact', w1.w === w0.w + 1 && w1.s === w0.s + 2 && /not a star|miles|dust/.test(await p.$eval('#sky-caption', e => e.textContent)), [w0, w1]);
  check('and the button goes away', await hidden('#sky-wish'));
  await ev(() => GG.Sky._meteor());
  await p.waitForTimeout(4200);
  check('a missed one just goes away', await hidden('#sky-wish'));

  /* lines on and off */
  await p.tap('#sky-lines');
  check('Lines can be turned off', /off/.test(await p.$eval('#sky-lines', e => e.textContent)));
  await p.tap('#sky-lines');
  await p.tap('#sky-close');
  await p.waitForTimeout(300);

  /* ---- the Mesa ---- */
  await ev(() => { const t = GG.World.telescopes[1]; GG.Player.reset(t.x, t.y + 26); GG.Time.set(23 * 60); });
  await p.waitForTimeout(1200);
  check('the Mesa telescope offers STARS too', (await p.$eval('#btn-a', e => e.textContent)) === 'STARSlook up');
  await p.tap('#btn-a');
  await p.waitForTimeout(700);
  d = await ev(() => { GG.Sky._setHour(23); return GG.Sky.debug(); });
  check('it opens the Mesa sky', d.site === 'mesa' && /Mesa/.test(await p.$eval('#sky-title', e => e.textContent)));
  check('which is darker: more stars than at home', d.limit > home.lim + 0.5, [d.limit, home.lim]);
  const m31 = await ev(() => { for (let az = 0; az < 360; az += 30) { GG.Sky._look(az, 55); const t = GG.Sky._treasure('m31'); if (t && t.x > 40 && t.x < 370 && t.y > 90 && t.y < 600) return t; } return null; });
  check('and the Andromeda Galaxy is there', !!m31, m31);
  await p.touchscreen.tap(box.x + m31.x, box.y + m31.y);
  await p.waitForTimeout(900);
  check('tapping it finds it', await ev(() => GG.Sky.has('m31')));
  await p.waitForTimeout(600); await ev(() => { GG.Sky._cardAt = 0; document.getElementById('sky-card-ok').click(); }); await p.waitForTimeout(300);
  await p.screenshot({ path: '/tmp/v121-mesa.png' });
  await p.tap('#sky-close');
  await p.waitForTimeout(300);

  /* ---- the Star Book ---- */
  await ev(() => GG.Book.open());
  await p.waitForTimeout(300);
  check('the Compendium has five books', (await p.$$eval('.shelfbook', l => l.length)) === 5 && /Five books/.test(await p.$eval('.shelfnote', e => e.textContent)));
  check('the Star Book says 4 of 31', /4 of 31/.test(await p.$eval('.shelfbook[data-open="stars"] .bn', e => e.textContent)));
  await p.tap('.shelfbook[data-open="stars"]');
  await p.waitForTimeout(300);
  check('it opens on a grid of 31', (await p.$$eval('.bugcell.sky', l => l.length)) === 31 && (await p.$eval('#progress', e => e.textContent)) === '4 / 31');
  check('found ones are named, the rest are ???', (await p.$eval('.bugcell[data-sky="Cas"] .nm', e => e.textContent)) === 'The Queen' && (await p.$eval('.bugcell[data-sky="Ori"] .nm', e => e.textContent)) === '???');
  await p.tap('.bugcell[data-sky="Sco"]');
  await p.waitForTimeout(200);
  check('an unfound one says when to look', /summer/.test(await p.$eval('#toast', e => e.textContent)));
  await p.tap('.bugcell[data-sky="m31"]');
  await p.waitForTimeout(300);
  check('a page opens with the picture, how to find it and the facts', (await p.$eval('#book-detail h2', e => e.textContent)) === 'The Andromeda Galaxy' && (await p.$$eval('#book-detail .factline', l => l.length)) === 3 && /the Mesa/.test(await p.$eval('#book-detail .meta', e => e.textContent)));
  await p.tap('#book-back');
  await p.waitForTimeout(200);
  check('All the sky goes back to the grid', (await p.$$eval('.bugcell.sky', l => l.length)) === 31);
  await p.tap('#book-tabs .tab[data-book="bugs"]');
  await p.waitForTimeout(200);
  check('the other books still open', (await p.$eval('#book-title', e => e.textContent)) === 'Bug Book');
  await ev(() => GG.UI.close('screen-book'));

  /* ---- it is all still there after a reload ---- */
  await ev(() => GG.Save.save());
  await p.reload();
  await p.waitForTimeout(800);
  const kept = await ev(() => ({ n: Object.keys(GG.Save.data.stars).sort(), w: GG.Save.data.wishes, site: GG.Save.data.stars.m31.site }));
  check('a reload keeps the Star Book and the wishes', kept.n.join() === 'Cas,CMi,m31,pleiades'.split(',').sort().join() && kept.w === 1 && kept.site === 'mesa', kept);
  check('the news card tells her about the night sky', await ev(() => { const e = GG.CHANGELOG.find(c => c.v === '1.21.0'); return !!e && /telescope/.test(e.lines[0]); }));

  results.forEach(r => console.log(r));
  if (errs.length) console.log(errs.join('\n'));
  const failed = results.filter(r => r.startsWith('FAIL')).length;
  console.log(failed ? failed + ' FAILED' : 'ALL ' + results.length + ' PASSED');
  await b.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
