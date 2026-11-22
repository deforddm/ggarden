/* v1.22: the Favour Board and the ranks. */
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
  const ev = (fn, a) => p.evaluate(fn, a);

  /* ---- the rules, before any garden ---- */
  const rules = await ev(() => {
    const F = GG.Favours, R = F.RANKS;
    const groups = {}; F.ASKS.forEach(a => { groups[a.group] = (groups[a.group] || 0) + 1; });
    /* every favour must be possible: something in the game has to pass its test */
    const impossible = F.ASKS.filter(a => {
      if (GG.BUGS.some(d => !d.lookOnly && a.test('bug', d))) return false;
      if (GG.FISH.some(d => a.test('fish', d))) return false;
      if (GG.FRUITS.some(d => a.test('pick', d))) return false;
      return !(a.test('friend', GG.ANIMALS[0]) || a.test('fetch') || a.test('wish'));
    }).map(a => a.id);
    return { ranks: R.length, rising: R.every((r, i) => !i || r.at > R[i - 1].at), first: R[0].at, top: R[R.length - 1].at, most: F.most(),
      groups, impossible, junk: F.ASKS.find(a => a.id === 'fish').test('fish', { isJunk: true }),
      d1: F._today(Date.UTC(2026, 10, 22, 11, 0)), d2: F._today(Date.UTC(2026, 10, 22, 13, 0)), d3: F._today(Date.UTC(2026, 6, 4, 10, 30)) };
  });
  check('13 ranks, each higher than the last, starting at nothing', rules.ranks === 13 && rules.rising && rules.first === 0, rules);
  check('the top rank can be reached but needs nearly everything (' + rules.top + ' of ' + rules.most + ' pages, plus favours)', rules.top > rules.most * 0.9 && rules.top < rules.most + 60, rules);
  check('three kinds of favour, several of each', rules.groups.bug >= 3 && rules.groups.find >= 3 && rules.groups.kind >= 3, rules.groups);
  check('every favour can really be done', rules.impossible.length === 0, rules.impossible);
  check('an old boot is not a fish', rules.junk === false);
  check('the day turns over at four in the morning, Pacific time', rules.d1 === '2026-11-21' && rules.d2 === '2026-11-22' && rules.d3 === '2026-07-03', rules);

  /* ---- a brand new garden ---- */
  await ev(() => { GG.Favours._now = Date.UTC(2026, 10, 22, 20, 0); GG.Favours._say = function (m) { (window.__said = window.__said || []).push(m); }; });
  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(700);
  await ev(() => GG.UI.close('screen-news'));
  await p.waitForTimeout(2600);
  check('a new garden starts as a Seedling with no fuss', (await ev(() => GG.Favours.rank())) === 0 && (await hidden('#screen-rank')));
  const day1 = await ev(() => GG.Favours.list().map(x => ({ id: x.ask.id, g: x.ask.group, who: x.who && x.who.name, text: x.ask.text })));
  check('three favours today, one of each kind', day1.length === 3 && day1.map(x => x.g).join() === 'bug,find,kind', day1);
  check('each asked by a different animal', new Set(day1.map(x => x.who)).size === 3 && day1.every(x => x.who), day1);
  check('the menu button has a dot on it', await p.$eval('#btn-menu', e => e.classList.contains('has-news')));
  const again = await ev(() => { const a = JSON.stringify(GG.Save.data.favours.list); GG.Favours.roll(); return a === JSON.stringify(GG.Save.data.favours.list); });
  check('they stay the same all day', again);

  /* the board in the garden */
  const board = await ev(() => { const B = GG.World.board; return B && { x: B.x, y: B.y, front: GG.World.blocked(B.x, B.y + 26, 9), solid: GG.World.blocked(B.x, B.y, 4), art: typeof GG.Props.noticeboard,
    scope: Math.hypot(B.x - GG.World.telescopes[0].x, B.y - GG.World.telescopes[0].y), yard: !!(GG.Yard && GG.Yard.SLOTS.some(s => Math.abs(B.x - s.cx) < s.mw / 2 + 6 && B.y > s.by - s.mh - 6 && B.y < s.by + 6)) }; });
  check('the Favour Board stands by the cottage, clear of the telescope and the yard', board && !board.front && board.solid && board.art === 'function' && board.scope > 60 && !board.yard && Math.hypot(board.x - 4720, board.y - 2440) < 330, board);
  await ev(() => { const B = GG.World.board; GG.Critters.clear(); GG.Critters.spawnNear = function () {}; GG.Player.reset(B.x, B.y + 26); });
  await p.waitForTimeout(1100);
  check('standing at it the button says READ, favours', (await p.$eval('#btn-a', e => e.textContent)) === 'READfavours');
  await p.tap('#btn-a');
  await p.waitForTimeout(500);
  check('READ opens the board', !(await hidden('#screen-favours')));
  const shown = await ev(() => ({ rows: [...document.querySelectorAll('.favrow')].map(r => ({ what: r.querySelector('.what').textContent, who: r.querySelector('.who').textContent, done: r.classList.contains('done'),
      ink: (() => { const cv = r.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return n; })() })),
    rank: document.getElementById('fav-rank').textContent, next: document.getElementById('fav-next').textContent,
    medal: (() => { const cv = document.getElementById('fav-medal'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return n; })() }));
  check('it lists the three, with who is asking and their picture', shown.rows.length === 3 && shown.rows.every((r, i) => r.what === day1[i].text && /asks/.test(r.who) && r.ink > 300 && !r.done), shown.rows);
  check('and her rank, her medal and how far to the next', shown.rank === 'Seedling' && /more to become a Sprout/.test(shown.next) && shown.medal > 2000, shown);
  check('reading it takes the dot away', !(await p.$eval('#btn-menu', e => e.classList.contains('has-news'))));
  const fits = await p.$eval('#screen-favours .body', e => e.scrollHeight <= e.clientHeight + 2);
  check('it all fits on a phone without scrolling', fits);
  await p.screenshot({ path: '/tmp/v122-board.png' });
  await p.tap('#screen-favours footer .btn');
  await p.waitForTimeout(300);
  check('Off I go! closes it', await hidden('#screen-favours'));

  /* ---- doing favours ---- */
  const done = await ev(() => {
    const F = GG.Favours, S = GG.Save.data, out = { s0: S.sparkles };
    window.__said = [];
    const L = F.list();
    /* the wrong thing does nothing */
    F.note('bug', { behavior: 'nothing', habitats: [] }); F.note('fish', { isJunk: true });
    out.wrong = L.filter(x => x.it.done).length + (L[0].ask.need === 3 ? 0 : L[0].it.n);
    /* the right things */
    function doIt(x) {
      for (let i = 0; i < x.ask.need; i++) {
        if (x.ask.group === 'bug') F.note('bug', GG.BUGS.find(d => !d.lookOnly && x.ask.test('bug', d)));
        else if (x.ask.id === 'fish') F.note('fish', GG.FISH[0]);
        else if (/^pick/.test(x.ask.id)) F.note('pick', GG.FRUITS.find(d => x.ask.test('pick', d)));
        else F.note(x.ask.id === 'hello' ? 'friend' : x.ask.id, GG.ANIMALS[0]);
      }
    }
    doIt(L[0]); out.after1 = { s: S.sparkles, done: S.favours.done, left: F.left(), said: window.__said.slice() };
    doIt(L[0]); out.twice = S.favours.done;
    doIt(L[1]); doIt(L[2]);
    out.after3 = { s: S.sparkles, done: S.favours.done, left: F.left(), thanked: S.favours.thanked, days: S.favours.days };
    return out;
  });
  check('the wrong thing counts for nothing', done.wrong === 0, done);
  check('one favour done: 12 sparkles and a thank-you by name', done.after1.s - done.s0 >= 12 && done.after1.done === 1 && done.after1.left === 2 && /says thank you/.test(done.after1.said.join()), done.after1);
  check('doing it again does not count twice', done.twice === 1);
  check('all three done', done.after3.done === 3 && done.after3.left === 0 && done.after3.thanked && done.after3.days === 1, done.after3);
  await p.waitForTimeout(4200);
  check('and the big thank-you comes', await ev(() => /All three favours/.test(window.__said.join())));
  await ev(() => GG.Favours.open());
  await p.waitForTimeout(300);
  check('the board shows them ticked', (await p.$$eval('.favrow.done', l => l.length)) === 3 && /All done for today/.test(await p.$eval('#fav-foot', e => e.textContent)));
  await ev(() => GG.UI.close('screen-favours'));
  await p.tap('#btn-menu'); await p.waitForTimeout(300);
  check('the Garden Menu has the board too, and says all done', /all done/.test(await p.$eval('#menu-favours', e => e.textContent)));
  await p.tap('#menu-favours'); await p.waitForTimeout(300);
  check('and opens it, closing the menu', !(await hidden('#screen-favours')) && (await hidden('#screen-menu')));
  await ev(() => GG.UI.close('screen-favours'));

  /* ---- tomorrow ---- */
  const tomorrow = await ev(() => { const F = GG.Favours, before = F.list().map(x => x.ask.id); F._now = Date.UTC(2026, 10, 23, 20, 0); const fresh = F.roll();
    return { fresh, before, after: F.list().map(x => x.ask.id), left: F.left(), kept: GG.Save.data.favours.done, days: GG.Save.data.favours.days }; });
  check('the next day there are three new ones, none repeated', tomorrow.fresh && tomorrow.left === 3 && tomorrow.after.every(id => tomorrow.before.indexOf(id) < 0), tomorrow);
  check('and what she did is still counted', tomorrow.kept === 3 && tomorrow.days === 1);
  const skipped = await ev(() => { const F = GG.Favours; F._now = Date.UTC(2026, 10, 30, 20, 0); F.roll(); return { done: GG.Save.data.favours.done, days: GG.Save.data.favours.days, s: GG.Save.data.sparkles }; });
  check('missing a week loses nothing', skipped.done === 3 && skipped.days === 1, skipped);

  /* ---- going up a rank, for real ---- */
  const up = await ev(async () => {
    const S = GG.Save.data, F = GG.Favours; const s0 = S.sparkles, p0 = F.points();
    GG.BUGS.filter(d => !d.lookOnly).slice(0, 4).forEach(d => GG.Save.addCatch(d.id));
    F.checkRank();
    await new Promise(r => setTimeout(r, 900));
    return { p0, p1: F.points(), rank: S.rank, got: S.sparkles - s0 };
  });
  check('past five steps she becomes a Sprout', up.p1 >= 5 && up.rank === 1 && up.got === 25, up);
  check('with a card, a medal and her new name', !(await hidden('#screen-rank')) && (await p.$eval('#rank-name', e => e.textContent)) === 'Sprout' && /up a rank/.test(await p.$eval('#rank-kicker', e => e.textContent)));
  check('the garden waits while she reads it', await ev(() => GG.UI.anyOpen()));
  await p.screenshot({ path: '/tmp/v122-rank.png' });
  await p.waitForTimeout(600);
  await p.tap('#rank-ok'); await p.waitForTimeout(300);
  check('Hooray! closes it', await hidden('#screen-rank'));
  const once = await ev(async () => { GG.Favours.checkRank(); await new Promise(r => setTimeout(r, 700)); return document.getElementById('screen-rank').classList.contains('hidden'); });
  check('and it is only said once', once);

  /* a real catch through the real code path counts towards a favour */
  const real = await ev(() => { const F = GG.Favours; F._now = Date.UTC(2026, 11, 2, 20, 0); F.roll(); const L = F.list(); const bug = GG.BUGS.find(d => !d.lookOnly && L[0].ask.test('bug', d));
    return { id: bug.id, need: L[0].ask.need }; });
  await ev(id => { const P = GG.Player; const c = GG.Critters; c.clear(); const def = GG.BUG_BY_ID[id]; GG.Player.reset(GG.World.DOOR.x + 60, GG.World.DOOR.y + 160); window.__def = def; }, real.id);
  const viaHook = await ev(() => { const src = String(GG.Favours.note); const before = GG.Favours.list()[0].it.n; 
    /* the catch handler in main.js is private; the fetch hook is not */
    const b2 = GG.Favours.data().done; return { before, hooks: [/Favours\.note\('fetch'\)/.test(String(GG.Fetch.update) + String(GG.Fetch.throwBall) + Object.keys(GG.Fetch).map(k => String(GG.Fetch[k])).join('')), /Favours\.note\('wish'\)/.test(String(GG.Sky.wish))] }; });
  check('fetch and the shooting-star wish both report in', viaHook.hooks[0] && viaHook.hooks[1], viaHook);

  /* ---- an old save gets the rank it has earned ---- */
  await ev(() => {
    const S = GG.Save.data;
    GG.BUGS.filter(d => !d.lookOnly).slice(0, 60).forEach(d => GG.Save.addCatch(d.id));
    GG.FISH.slice(0, 12).forEach(d => GG.Save.addFish(d.id));
    delete S.rank; delete S.favours; delete S.favoursSeen;
    S.version = '1.21.0';
    GG.Save.save();
  });
  await p.reload();
  await p.waitForTimeout(800);
  await ev(() => { GG.Favours._now = Date.UTC(2026, 10, 22, 20, 0); });
  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(700);
  check('an old save sees the What’s new card first, about favours and ranks', !(await hidden('#screen-news')) && /Favours and ranks/.test(await p.$eval('#screen-news', e => e.textContent)));
  await ev(() => GG.UI.close('screen-news'));
  await p.waitForTimeout(3400);
  const old = await ev(() => ({ rank: GG.Save.data.rank, pts: GG.Favours.points(), name: document.getElementById('rank-name').textContent, kick: document.getElementById('rank-kicker').textContent, open: !document.getElementById('screen-rank').classList.contains('hidden') }));
  check('then it is told the rank it has already earned, in one go', old.open && old.rank === GG_rank(old.pts) && old.rank >= 4 && /ranks!/.test(old.kick), old);
  function GG_rank(pts) { const at = [0, 5, 15, 30, 50, 75, 105, 140, 180, 225, 275, 330, 390]; let r = 0; at.forEach((a, i) => { if (pts >= a) r = i; }); return r; }
  await p.waitForTimeout(600);
  await p.tap('#rank-ok'); await p.waitForTimeout(300);
  await ev(() => GG.Save.save());
  await p.reload(); await p.waitForTimeout(800);
  await ev(() => { GG.Favours._now = Date.UTC(2026, 10, 22, 20, 0); });
  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(3200);
  check('and not again after a reload', (await hidden('#screen-rank')) && (await ev(() => GG.Save.data.rank)) === old.rank);
  check('the version is 1.22.0', await ev(() => GG.VERSION === '1.22.0'));

  results.forEach(r => console.log(r));
  if (errs.length) console.log(errs.join('\n'));
  const failed = results.filter(r => r.startsWith('FAIL')).length;
  console.log(failed ? failed + ' FAILED' : 'ALL ' + results.length + ' PASSED');
  await b.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
