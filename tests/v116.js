/* v1.16: the quiet horse, the cottage at Guin's scale, nobody stuck on the
   bed, and hats that sit on the crown of the head. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] || 'http://localhost:8899/index.html');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700); await p.click('#btn-play'); await require('./charskip')(p); await p.waitForTimeout(900);
  const r = [];
  const ok = (n, v) => r.push((v ? 'PASS ' : 'FAIL ') + n);
  await p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    GG.Friends.spawnNear = () => false; GG.Critters.spawnNear = () => false;
    GG.Friends.clear(); GG.Critters.clear();
  });

  /* ---------- the horse: nothing while walking, a quiet offer when stopped ---------- */
  await p.evaluate(() => {
    const W = GG.World;
    GG.Player.reset(W.HOUSE.x + 260, W.HOUSE.y + 240);
    GG.Save.addFriend('horse'); GG.Friends.setCompanion('horse');
  });
  await p.waitForTimeout(600);
  // walk for a while, sampling the friend button as she goes
  const walking = await p.evaluate(async () => {
    let shown = 0, samples = 0, toasts = 0;
    const t0 = document.getElementById('toast').textContent;
    GG.Input.keys['d'] = true;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 60));
      if (i === 15) { GG.Input.keys['d'] = false; GG.Input.keys['a'] = true; }
      samples++;
      if (!document.getElementById('btn-friend').classList.contains('hidden')) shown++;
    }
    GG.Input.keys['a'] = false;
    return { shown, samples };
  });
  ok('walking along with the horse, no riding button pops up (' + walking.shown + '/' + walking.samples + ')', walking.shown === 0);
  await p.waitForTimeout(1600);
  const stopped = await p.evaluate(() => {
    const F = GG.Friends, P = GG.Player, btn = document.getElementById('btn-friend');
    return { offer: F.rideOffer(P), stance: F.rideStance(P, F.companion),
      shown: !btn.classList.contains('hidden'), quiet: btn.classList.contains('quiet'), text: btn.textContent };
  });
  ok('when she stops, the horse comes alongside - shoulder to her (' + stopped.stance + ')', stopped.stance === 'shoulder');
  ok('and a small, quiet RIDE? button appears (' + stopped.text + ')', stopped.shown && stopped.quiet && stopped.offer && stopped.offer.stage === 'ask');
  const tip = await p.evaluate(async () => {
    const F = GG.Friends, P = GG.Player, c = F.companion;
    F.standTold = false;
    const toast = () => document.getElementById('toast').textContent;
    P.x = c.x + (c.faceLeft ? 40 : -40); P.y = c.y;          // right behind her
    const s1 = (F.rideOffer(P) || {}).stage;
    F.rideTap(P); const t1 = toast();
    document.getElementById('toast').textContent = '';
    F.rideTap(P); const t2 = toast();
    return { s1, t1, t2, sidle: F.sidle > 0 };
  });
  ok('from behind the button says to go to her shoulder', tip.s1 === 'stand');
  ok('the reason is told once (' + tip.t1.slice(0, 30) + ')', /cannot see/.test(tip.t1));
  ok('and not every time after', tip.t2 === '' && tip.sidle);

  /* ---------- the cottage ---------- */
  await p.evaluate(() => {
    GG.Friends.setCompanion(null);
    ['cookie', 'tabby', 'labrador', 'horse', 'moose', 'chicken', 'budgie', 'cow'].forEach(id => GG.Save.addFriend(id));
    GG.Save.data.homeFriends = ['tabby', 'labrador', 'horse', 'moose', 'chicken', 'budgie', 'cow'];
    GG.Friends.setCompanion('cookie');
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 36);
  });
  await p.waitForTimeout(300);
  await p.keyboard.press('Space');
  await p.waitForTimeout(700);
  const inside = await p.evaluate(() => {
    const H = GG.House, F = GG.Friends;
    return {
      scene: GG.debugScene ? GG.debugScene() : '',
      starts: F.homeList.map(f => ({ id: f.def.id, bad: H.blocked(f.x, f.y, 12) })),
      doorFits: H.spots.find(s => s.id === 'door').w
    };
  });
  ok('friends waiting at home all start on clear floor ' + JSON.stringify(inside.starts.filter(s => s.bad)),
    inside.starts.length === 7 && inside.starts.every(s => !s.bad));
  // walk Guin right up against the bed and let everybody potter for a while
  const potter = await p.evaluate(async () => {
    const H = GG.House, F = GG.Friends, bed = H.spots.find(s => s.id === 'bed');
    GG.Player.reset(bed.x - bed.w / 2 - 14, bed.y);
    let onBed = 0, flips = 0, frames = 0;
    const last = {};
    for (let i = 0; i < 90; i++) {
      await new Promise(r => setTimeout(r, 50));
      frames++;
      const all = F.homeList.concat(F.companion ? [F.companion] : []);
      all.forEach((f, k) => {
        const inBed = f.x > bed.x - bed.w / 2 + 6 && f.x < bed.x + bed.w / 2 - 6 && f.y > bed.y - bed.h / 2 + 6 && f.y < bed.y + bed.h / 2 - 6;
        if (inBed) onBed++;
      });
    }
    // and one planted right in the middle of the bed gets set down beside it
    const f0 = F.homeList[0]; f0.x = bed.x; f0.y = bed.y;
    for (let i = 0; i < 3; i++) F.stepHome(0.05);
    return { onBed, frames, rescued: !H.blocked(f0.x, f0.y, 12) };
  });
  ok('nobody walks onto the bed, the companion included (' + potter.onBed + ' bed-frames)', potter.onBed === 0);
  ok('a friend found inside the bed is set down on the floor', potter.rescued);
  const reach = await p.evaluate(() => {
    const H = GG.House, out = {};
    for (const s of H.spots) {
      let found = false;
      for (let rad = 10; rad <= 120 && !found; rad += 4)
        for (let a = 0; a < 6.28 && !found; a += 0.1) {
          const x = s.x + Math.cos(a) * rad, y = s.y + Math.sin(a) * rad;
          if (!H.blocked(x, y, 11) && H.nearest(x, y) && H.nearest(x, y).id === s.id) found = true;
        }
      out[s.id] = found;
    }
    return out;
  });
  ok('she can still walk up to everything in the room ' + JSON.stringify(reach), Object.values(reach).every(Boolean));
  await p.screenshot({ path: __dirname + '/shots/v116-house.png' });

  /* ---------- hats on the crown ---------- */
  const hats = await p.evaluate(() => {
    /* For every shape, draw the animal alone and then with a hat, and look at
       where the hat's own pixels begin: the brim should come down onto the
       animal's head (touching its pixels), not float above it. */
    const out = { floating: [], huge: [] };
    const seen = {};
    GG.ANIMALS.forEach(d => {
      const k = d.art.shape + (d.art.ears || '');
      if (seen[k]) return; seen[k] = 1;
      const W = 240, Hh = 240;
      const a = document.createElement('canvas'); a.width = W; a.height = Hh;
      const bcv = document.createElement('canvas'); bcv.width = W; bcv.height = Hh;
      const sc = GG.animalFit(d, 150);
      GG.AnimalArt.draw(a.getContext('2d'), d, 120, 220, sc, false, 1.2, 0, null);
      GG.AnimalArt.draw(bcv.getContext('2d'), d, 120, 220, sc, false, 1.2, 0, 'cap');
      const A = a.getContext('2d').getImageData(0, 0, W, Hh).data, B = bcv.getContext('2d').getImageData(0, 0, W, Hh).data;
      /* in every column the hat covers, how far is the bottom of the hat
         above the top of the animal? A hat resting on a head has at least
         one column where that gap is (about) nothing. */
      let best = 1e9;
      for (let x = 0; x < W; x++) {
        let hatLow = -1, top = -1;
        for (let y = 0; y < Hh; y++) {
          const i = (y * W + x) * 4;
          const changed = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) + Math.abs(A[i + 3] - B[i + 3]) > 40;
          if (changed) hatLow = y;
          if (top < 0 && A[i + 3] > 100) top = y;
        }
        if (hatLow >= 0 && top >= 0) best = Math.min(best, top - hatLow);
      }
      if (best > 2) out.floating.push(d.art.shape + ' gap ' + best);
    });
    return out;
  });
  ok('every hat sits down on its animal\'s head, none floating ' + JSON.stringify(hats.floating), hats.floating.length === 0);

  console.log(r.join('\n'));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  console.log(r.some(x => x.startsWith('FAIL')) || errs.length ? '>>> SOME CHECKS FAILED' : '>>> ALL CHECKS PASSED');
  await b.close();
  process.exit(r.some(x => x.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
