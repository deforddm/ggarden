/* v1.24.1: no clicks. Every sound is rendered into an offline context and
   measured: it must start a moment ahead of "now", come in gradually, and
   go out to nothing. The looping noise must have no seam, a late music
   scheduler must skip rather than pile up, and the limiter must leave quiet
   sound alone and hold loud sound under full scale. */
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
  await p.waitForTimeout(900);
  const results = [];
  const check = (name, ok, extra) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + (ok || extra == null ? '' : '  -> ' + JSON.stringify(extra))); };
  const ev = (fn, a) => p.evaluate(fn, a);

  const r = await ev(async () => {
    const S = GG.Sfx, A = GG.Audio, SR = 44100, out = { sounds: {} };
    out.lead = A._lead();
    function shape(d) {
      let peak = 0; for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
      if (!peak) return { silent: true };
      let on = 0; while (on < d.length && Math.abs(d[on]) < peak * 0.002) on++;
      /* the loudest it gets in the first millisecond and the first three after it begins */
      let m1 = 0, m3 = 0; for (let i = on; i < on + SR * 0.003 && i < d.length; i++) { const a = Math.abs(d[i]); if (i < on + SR * 0.001) m1 = Math.max(m1, a); m3 = Math.max(m3, a); }
      let tail = 0; for (let i = d.length - Math.floor(SR * 0.05); i < d.length; i++) tail = Math.max(tail, Math.abs(d[i]));
      return { peak: +peak.toFixed(4), startMs: +(on / SR * 1000).toFixed(1), in1ms: +(m1 / peak).toFixed(3), in3ms: +(m3 / peak).toFixed(3), tail: +(tail / peak).toFixed(4) };
    }
    const list = { stepGrass: () => S.step('grass'), stepStone: () => S.step('stone'), stepSand: () => S.step('sand'), stepSnow: () => S.step('snow'), stepWater: () => S.step('water'), stepWood: () => S.step('wood'),
      click: () => S.click(), swing: () => S.swing(), catchNew: () => S.catchNew(), catchSmall: () => S.catchSmall(), starNote: () => S.starNote(0), starFound: () => S.starFound(), shootingStar: () => S.shootingStar(), night: () => S.night() };
    Object.keys(S).forEach(k => { if (typeof S[k] === 'function' && !list[k] && !/^step|^_/.test(k) && S[k].length === 0) list[k] = () => S[k](); });
    for (const k in list) { let d = null, err = null; try { d = await A._render(list[k], 3.2); } catch (e) { err = e.message; } out.sounds[k] = err ? { err } : shape(d); }

    /* a music note, low and high, and an ambience call */
    const M = GG.Music;
    for (const f of [65, 880]) { const d = await A._render(c => { const keep = M._out; M._out = A.bus('music'); M._note(f, 0.05, 0.4, 'sine', 0.2, 0.01); M._out = keep; }, 3.2); out['note' + f] = shape(d); }   // long enough for the echo to die away too

    /* the looping noise: the join against an ordinary step */
    const nb = (await (async () => { let got = null; await A._render(c => { got = A.noiseBuffer().getChannelData(0); }, 0.1); return got; })());
    const steps = []; for (let i = 1; i < 20000; i++) steps.push(Math.abs(nb[i] - nb[i - 1])); steps.sort((a, c) => a - c);
    out.seam = { join: Math.abs(nb[0] - nb[nb.length - 1]), p99: steps[Math.floor(steps.length * 0.99)], len: nb.length / SR };
    /* and its loudness is even across the cross-fade */
    function rms(a, z) { let s = 0; for (let i = a; i < z; i++) s += nb[i] * nb[i]; return Math.sqrt(s / (z - a)); }
    out.seam.fadeRms = rms(0, Math.floor(SR * 0.3)); out.seam.bodyRms = rms(SR, SR * 2);

    /* the scheduler, a long way behind */
    const fake = { currentTime: 100 }, realCtx = A.ctx; const when = [];
    const keep = { playing: M.playing, next: M._next, step: M._step, voice: M._voice };
    A.ctx = () => fake; M.playing = true; M._next = 92.3; M._step = 10; M._voice = (mood, t) => when.push(t);
    M._schedule();
    A.ctx = realCtx; M.playing = keep.playing; M._next = keep.next; M._step = keep.step; M._voice = keep.voice;
    out.sched = { n: when.length, first: when[0], last: when[when.length - 1], early: when.filter(t => t < 100.03).length };

    /* the limiter */
    async function sine(amp) { const d = await A._render(c => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 440; g.gain.value = amp; o.connect(g); g.connect(A.bus('sfx')); o.start(0); }, 1.5); let pk = 0; for (let i = SR; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); return pk; }
    const sfxVol = 0.7;
    out.lim = { quiet: (await sine(0.05)) / (0.05 * sfxVol), loud: await sine(3) };
    return out;
  });

  check('one-shots are scheduled a moment ahead, never at "now"', r.lead >= 0.02 && r.lead <= 0.05, r.lead);
  const names = Object.keys(r.sounds);
  const broke = names.filter(k => r.sounds[k].err);
  check('all ' + names.length + ' sound effects render without a fault', broke.length === 0, broke.map(k => k + ': ' + r.sounds[k].err));
  const heard = names.filter(k => !r.sounds[k].silent && !r.sounds[k].err);
  check('and at least fourteen of them make a sound', heard.length >= 14, heard.length);
  const early = heard.filter(k => r.sounds[k].startMs < r.lead * 1000 - 2);
  check('none begins before its scheduled moment', early.length === 0, early.map(k => k + ' ' + r.sounds[k].startMs));
  const snap = heard.filter(k => r.sounds[k].in1ms > 0.35);
  check('none jumps in: under 35% of its loudest in the first millisecond', snap.length === 0, snap.map(k => k + ' ' + r.sounds[k].in1ms));
  const hang = heard.filter(k => r.sounds[k].tail > 0.02);
  check('every one has died away to nothing by the end', hang.length === 0, hang.map(k => k + ' ' + r.sounds[k].tail));
  check('a low music note comes in slowly and goes out to nothing', r.note65.in3ms < 0.2 && r.note65.tail < 0.01, r.note65);
  check('so does a high one', r.note880.in1ms < 0.35 && r.note880.tail < 0.01, r.note880);
  check('the looping noise has no step at the join', r.seam.join <= r.seam.p99 * 1.5, r.seam);
  check('and is as loud across the join as anywhere else', r.seam.fadeRms > r.seam.bodyRms * 0.4 && r.seam.fadeRms < r.seam.bodyRms * 2.5, r.seam);
  check('a scheduler eight seconds behind skips ahead instead of piling notes up', r.sched.early === 0 && r.sched.n > 0 && r.sched.n < 12 && r.sched.first >= 100.03, r.sched);
  check('the limiter leaves quiet sound exactly as loud as it was', r.lim.quiet > 0.93 && r.lim.quiet < 1.07, r.lim);
  check('and holds very loud sound under full scale', r.lim.loud < 0.98, r.lim);

  /* the real thing still plays, and the garden still runs */
  await p.tap('#btn-play'); await require('./charskip')(p);
  await p.waitForTimeout(700);
  await ev(() => { GG.UI.close('screen-news'); if (GG.Favours) GG.Favours._say = function () {}; GG.Critters.clear(); GG.Critters.spawnNear = function () {}; GG.Player.reset(GG.World.DOOR.x + 40, GG.World.DOOR.y + 170); });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(900); await p.keyboard.up('ArrowDown');
  await p.tap('#btn-a'); await p.waitForTimeout(500);
  const live = await ev(() => ({ ready: GG.Audio.ready(), state: GG.Audio.ctx() && GG.Audio.ctx().state, music: GG.Music.playing, next: GG.Music._next - GG.Audio.ctx().currentTime }));
  check('the real sound is running, with the music scheduled ahead of the clock', live.ready && live.music && live.next > 0 && live.next < 2, live);
  check('the What’s new list has the 1.24.1 entry', await ev(() => GG.CHANGELOG.some(c => c.v === '1.24.1')));

  results.forEach(x => console.log(x));
  if (errs.length) console.log(errs.join('\n'));
  const failed = results.filter(x => x.startsWith('FAIL')).length;
  console.log(failed ? failed + ' FAILED' : 'ALL ' + results.length + ' PASSED');
  await b.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
