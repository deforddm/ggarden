/* v1.20: the Garden Habitats stand outside in the yard round the cottage.
   David: "let's put 'outdoor terrariums' actually outdoors. Represent them
   outside the house and scale them to appropriate size for the pets."
   node tests/v120yard.js [url] [shotsDir] */
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.argv[2] || 'http://localhost:8899/index.html';
const SHOTS = process.argv[3] || null;

/* times the main loop's JS, per frame (as .work/worldfix/perf.js) */
const INIT = `(function(){ const raf = window.requestAnimationFrame.bind(window);
  window.__pf = { on: false, d: [] };
  window.requestAnimationFrame = function(cb){ return raf(function(ts){ const P = window.__pf; const t0 = performance.now(); cb(ts); const t1 = performance.now();
    if (P.on && cb.name === 'loop') P.d.push(t1 - t0); }); }; })();`;

const SMALL = { name: 'Hummingbird Nook', bg: 'backyard', friends: ['ruby_hummingbird'], decor: ['feeder', 'birdbath'] };
const MEDIUM = { name: 'Dog Run', bg: 'porch', friends: ['labrador', 'corgi'], decor: ['kennel', 'foodbowl'] };
const BIG = { name: 'Pony Paddock', bg: 'wildwood', friends: ['horse'], decor: ['birdbath'] };

async function fresh(p) {
  await p.goto(URL);
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForTimeout(700);
  await p.tap('#btn-play'); await p.waitForTimeout(900);
  await skipChar(p);
  await quiet(p);
}
async function skipChar(p) {
  await p.evaluate(() => {
    const s = document.getElementById('screen-char');
    if (s && !s.classList.contains('hidden') && GG.CharSelect && GG.CharSelect.skip) GG.CharSelect.skip();
  });
  await p.waitForTimeout(200);
}
async function quiet(p) {
  await p.evaluate(() => {
    ['catch-pop', 'friend-pop', 'warn-pop'].forEach(id => { const e = document.getElementById(id); if (e) e.className = 'hidden'; });
    (GG.UI.openPanels || []).slice().forEach(id => { if (id !== 'screen-title') GG.UI.close(id); });
  });
}
/* put these habitats in the save (after the first tank) */
async function setHabitats(p, spec) {
  return p.evaluate((spec) => {
    const d = GG.Save.data;
    d.terrariums = d.terrariums.slice(0, 1);
    spec.forEach((s) => {
      const tk = { name: s.name, type: 'habitat', bg: s.bg || 'backyard', bugs: [], fish: [], decor: [], friends: [] };
      (s.friends || []).forEach((id, k) => {
        d.friends[id] = d.friends[id] || { count: 1, first: 1 };
        tk.friends.push({ id, x: 160 + k * 120, y: 330, s: 1, seed: 0.3 + k * 0.1 });
      });
      (s.decor || []).forEach((id, k) => tk.decor.push({ id, x: 110 + k * 150, y: 290 + (k % 2) * 60, s: 1, seed: 0.2 + k * 0.1 }));
      d.terrariums.push(tk);
    });
    GG.Save.save();
    GG.Yard.sync(true);
    return GG.Yard.list.map(e => ({ name: e.tank.name, index: e.index, yid: e.yid, slot: e.slot.id,
      w: e.w, h: e.h, x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, gx: e.gx, gy: e.gy }));
  }, spec);
}
/* Every place round the yard she can walk to from the start */
async function flood(p) {
  return p.evaluate(() => {
    const W = GG.World, S = 8, R = 11;
    const X0 = 4300, X1 = 5400, Y0 = 2040, Y1 = 2960;
    const cols = Math.ceil((X1 - X0) / S), rows = Math.ceil((Y1 - Y0) / S);
    const seen = new Uint8Array(cols * rows);
    const sx = Math.round((W.DOOR.x - X0) / S), sy = Math.round((W.DOOR.y + 100 - Y0) / S);
    const q = [sy * cols + sx]; seen[q[0]] = 1;
    while (q.length) {
      const i = q.pop(), cx = i % cols, cy = (i / cols) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
        const j = ny * cols + nx;
        if (seen[j]) return;
        if (W.blocked(X0 + nx * S, Y0 + ny * S, R)) return;
        seen[j] = 1; q.push(j);
      });
    }
    function reach(x, y, rad) {
      for (let yy = y - rad; yy <= y + rad; yy += S) for (let xx = x - rad; xx <= x + rad; xx += S) {
        const cx = Math.round((xx - X0) / S), cy = Math.round((yy - Y0) / S);
        if (cx >= 0 && cy >= 0 && cx < cols && cy < rows && seen[cy * cols + cx]) return true;
      }
      return false;
    }
    const door = reach(W.DOOR.x, W.DOOR.y + 36, 8);
    const pens = GG.Yard.list.map(e => ({ name: e.tank.name,
      gate: reach(e.gx, e.gy, 8),
      sides: [reach(e.x0 - 18, (e.y0 + e.y1) / 2, 10), reach(e.x1 + 18, (e.y0 + e.y1) / 2, 10),
        reach(e.cx, e.y0 - 16, 10), reach(e.cx, e.y1 + 16, 10)] }));
    return { door, pens };
  });
}
/* the yard's own rules: not in water, not on the cottage, hive, fence, path
   or signs, and not on top of each other */
async function layoutProblems(p) {
  return p.evaluate(() => {
    const W = GG.World, H = W.HOUSE, out = [];
    const L = GG.Yard.list;
    L.forEach((e, i) => {
      for (let y = e.y0 - 12; y <= e.y1 + 12; y += 6) for (let x = e.x0 - 12; x <= e.x1 + 12; x += 6) {
        if (W.isWater(x, y)) { out.push(e.tank.name + ' water at ' + x + ',' + y); return; }
      }
      const hit = (ax0, ay0, ax1, ay1) => e.x0 < ax1 && e.x1 > ax0 && e.y0 - 22 < ay1 && e.y1 + 10 > ay0;
      if (hit(H.x - H.w / 2 - 20, H.y - H.w * 1.3, H.x + H.w / 2 + 20, H.y + 30)) out.push(e.tank.name + ' on the cottage');
      if (hit(H.x - 60, H.y, H.x + 60, H.y + 520)) out.push(e.tank.name + ' on the door path');
      if (hit(W.hive.x - 70, W.hive.y - 70, W.hive.x + 70, W.hive.y + 70)) out.push(e.tank.name + ' by the hive');
      if (hit(H.x - 3 * 46 - 20, H.y + 66 - 30, H.x + 3 * 46 + 20, H.y + 66 + 30)) out.push(e.tank.name + ' on the garden fence');
      W.props.filter(q => q.type === 'sign' || q.type === 'fence' || q.type === 'beehive' || q.type === 'house').forEach(q => {
        if (q.x > e.x0 - 30 && q.x < e.x1 + 30 && q.y > e.y0 - 20 && q.y < e.y1 + 50) out.push(e.tank.name + ' by the ' + q.type + ' ' + (q.label || ''));
      });
      for (let j = i + 1; j < L.length; j++) {
        const f = L[j];
        if (e.x0 < f.x1 + 26 && e.x1 > f.x0 - 26 && e.y0 < f.y1 + 30 && e.y1 > f.y0 - 30) out.push(e.tank.name + ' touches ' + f.tank.name);
      }
    });
    return out;
  });
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(INIT);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  /* (a font that cannot be fetched on a machine with no internet is not ours) */
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
  const r = [];
  const ok = (n, v) => { r.push((v ? 'PASS ' : 'FAIL ') + n); };
  const shot = async (name) => { if (SHOTS) await p.screenshot({ path: SHOTS + '/' + name + '.png' }); };

  await fresh(p);
  const none = await p.evaluate(() => ({ n: GG.Yard.list.length, props: GG.World.props.length, label: document.getElementById('btn-a').textContent }));
  ok('a new game has no habitats and so nothing in the yard (' + none.n + '), and starts on NET', none.n === 0 && /^NET/.test(none.label));

  /* ---------- three habitats: small, medium, big ---------- */
  const L = await setHabitats(p, [SMALL, MEDIUM, BIG]);
  ok('three habitats stand outside as three enclosures (' + L.map(e => e.slot).join(',') + ')', L.length === 3);
  const area = L.map(e => e.w * e.h);
  ok('sized by who lives there: hummingbird < dogs < horse (' + L.map(e => e.w + 'x' + e.h).join(' < ') + ')',
    area[0] < area[1] && area[1] < area[2]);
  const hidden = await p.evaluate(() => GG.Yard._hidden.length);
  ok('scenery standing where they go is lifted out (' + (none.props - (await p.evaluate(() => GG.World.props.length))) + ' props, ' + hidden + ' hidden)',
    hidden > 0 && none.props - (await p.evaluate(() => GG.World.props.length)) === hidden);

  /* ---------- solid at the fence ---------- */
  const solid = await p.evaluate(() => GG.Yard.list.map(e => {
    const W = GG.World;
    return { name: e.tank.name,
      in: W.blocked(e.cx, e.cy, 11) && W.blocked(e.x0 + 3, e.cy, 11) && W.blocked(e.x1 - 3, e.cy, 11) &&
        W.blocked(e.cx, e.y0 + 2, 11) && W.blocked(e.cx, e.y1 - 2, 11),
      gate: !W.blocked(e.gx, e.gy, 11) };
  }));
  ok('each one is solid at its fence, and the spot in front of its gate is free (' +
    solid.map(s => s.name + ':' + s.in + '/' + s.gate).join(', ') + ')', solid.every(s => s.in && s.gate));

  /* walking into one: she stops at the fence */
  const walk = await p.evaluate(async () => {
    const e = GG.Yard.list[1], P = GG.Player;
    P.reset(e.cx, e.y1 + 40);
    GG.Input.walkTo(e.cx, e.cy);
    await new Promise(res => setTimeout(res, 1600));
    const y = P.y;
    GG.Input.clearTarget();
    return { y, y1: e.y1 };
  });
  ok('walking straight at a fence she stops outside it (y ' + Math.round(walk.y) + ' vs fence ' + walk.y1 + ')', walk.y > walk.y1);

  /* ---------- nobody boxed in ---------- */
  const fl = await flood(p);
  ok('the door is still reachable from the start', fl.door);
  ok('every gate can be walked to (' + fl.pens.map(q => q.name + ':' + q.gate).join(', ') + ')', fl.pens.every(q => q.gate));
  ok('and she can walk right round each of them (' + fl.pens.map(q => q.sides.map(s => s ? 1 : 0).join('')).join(' ') + ')',
    fl.pens.every(q => q.sides.filter(Boolean).length >= 3));
  const probs = await layoutProblems(p);
  ok('nothing in the water, on the cottage, the path, the hive, the fence or a sign' + (probs.length ? ' (' + probs.slice(0, 4).join('; ') + ')' : ''), probs.length === 0);

  /* ---------- the residents ---------- */
  await p.evaluate(() => { GG.Time.set(12 * 60); for (let i = 0; i < 200; i++) GG.Yard.update(0.05); });
  const res = await p.evaluate(() => {
    const out = [];
    GG.Yard.list.forEach(e => e.animals.forEach(a => out.push({ id: a.def.id, inside: a.x > e.x0 && a.x < e.x1 && a.y > e.y0 && a.y < e.y1 })));
    const cam = { x: 4400, y: 2400 }, vw = GG.view.w, vh = GG.view.h;
    GG.view.w = 1000; GG.view.h = 600;
    const list = []; GG.Yard.collect(list, cam);
    GG.view.w = vw; GG.view.h = vh;
    return { out, drawn: list.filter(d => d.part === 'animal').map(d => d.a.def.id) };
  });
  ok('the friends living in them are inside their fences (' + res.out.map(a => a.id + ':' + a.inside).join(', ') + ')',
    res.out.length === 4 && res.out.every(a => a.inside));
  ok('and they are drawn there (' + res.drawn.join(',') + ')', res.drawn.length === 4);

  /* one copy only: a friend at home in the yard is not also out wandering */
  const once = await p.evaluate(() => {
    const F = GG.Friends, P = GG.Player;
    P.reset(4760, 2560);
    const ids = {}; let seenRes = 0;
    for (let k = 0; k < 400; k++) {
      F.list.length = 0;
      for (let j = 0; j < 6; j++) F.spawnNear(P.x, P.y, 60, 300);
      F.list.forEach(f => { ids[f.def.id] = 1; if (GG.Yard.houses(f.def.id)) seenRes++; });
    }
    F.list.length = 0;
    return { seenRes, kinds: Object.keys(ids).length };
  });
  ok('a friend who lives in the yard never also turns up wandering the garden (' + once.seenRes + ' copies in 400 rounds, ' + once.kinds + ' other kinds met)',
    once.seenRes === 0 && once.kinds > 3);

  /* true to life inside the fences: a cat walks round the pond, bats sleep the day away */
  const life = await p.evaluate(() => {
    const d = GG.Save.data, keep = d.terrariums.slice();
    ['tabby', 'siamese', 'big_brown_bat'].forEach(id => { d.friends[id] = { count: 1, first: 1 }; });
    d.terrariums.push({ name: 'Pond Test', type: 'habitat', bg: 'pondside', bugs: [], fish: [], decor: [],
      friends: [{ id: 'tabby', x: 60, y: 300, s: 1, seed: 0.1 }, { id: 'siamese', x: 120, y: 290, s: 1, seed: 0.2 }] });
    d.terrariums.push({ name: 'Bat Test', type: 'habitat', bg: 'dusk', bugs: [], fish: [], decor: [],
      friends: [{ id: 'big_brown_bat', x: 300, y: 300, s: 1, seed: 0.3 }] });
    GG.Yard.sync(true);
    const pond = GG.Yard.list.find(e => e.tank.name === 'Pond Test'), bat = GG.Yard.list.find(e => e.tank.name === 'Bat Test');
    let wet = 0;
    GG.Time.set(12 * 60);
    for (let i = 0; i < 3000; i++) {
      GG.Yard.update(0.05);
      pond.animals.forEach(a => { if (GG.Yard.inPond(pond, a.x, a.y, 0)) wet++; });
    }
    const dayRoost = bat.animals[0].roost;
    GG.Time.set(23 * 60); GG.Yard.update(0.05);
    const nightRoost = bat.animals[0].roost;
    GG.Time.set(12 * 60);
    d.terrariums = keep; GG.Yard.sync(true);
    return { wet, dayRoost, nightRoost };
  });
  ok('in a Pondside habitat the cats walk round the pond, never through it (' + life.wet + ' wet steps in 150 s)', life.wet === 0);
  ok('a bat hangs asleep by day and flies at night (' + life.dayRoost + '/' + life.nightRoost + ')', life.dayRoost === true && life.nightRoost === false);

  /* ---------- VISIT ---------- */
  await p.evaluate(() => { const e = GG.Yard.list[2]; GG.Critters.clear(); GG.Critters.spawnNear = () => false; GG.Player.reset(e.gx, e.gy); });
  await p.waitForTimeout(500);
  const v = await p.evaluate(() => ({ label: document.getElementById('btn-a').textContent,
    prompt: document.getElementById('prompt').textContent, show: document.getElementById('prompt').classList.contains('show') }));
  ok('walking up to one: the button says VISIT and the prompt names it (' + v.label + ' / ' + v.prompt + ')',
    /^VISIT/.test(v.label) && v.show && v.prompt.indexOf('Pony Paddock') >= 0);
  await shot('v120-visit-button');
  await p.tap('#btn-a'); await p.waitForTimeout(500);
  const opened = await p.evaluate(() => ({ open: !document.getElementById('screen-terrarium').classList.contains('hidden'),
    index: GG.Terrarium.index, name: document.getElementById('tank-name').textContent,
    note: (document.getElementById('tank-yardnote') || {}).textContent || '',
    noteShown: !!document.getElementById('tank-yardnote') && !document.getElementById('tank-yardnote').hidden,
    want: GG.Yard.list[2].index }));
  ok('VISIT opens My Tanks on that very tank (' + opened.name + ', index ' + opened.index + ')', opened.open && opened.index === opened.want && opened.name === 'Pony Paddock');
  ok('and the habitat says where it is ("' + opened.note + '")', opened.noteShown && /out in the garden by your house/.test(opened.note));
  await shot('v120-visit-tanks');
  const notHab = await p.evaluate(() => { document.getElementById('tank-prev').click(); document.getElementById('tank-prev').click(); document.getElementById('tank-prev').click();
    const t = GG.Terrarium.tank(); return { type: t.type, hidden: document.getElementById('tank-yardnote').hidden }; });
  ok('a terrarium does not say so (' + notHab.type + ')', notHab.type !== 'habitat' && notHab.hidden);
  await quiet(p);
  await p.waitForTimeout(300);

  /* a tap on an enclosure walks her to its gate */
  const tapAt = await p.evaluate(() => {
    const e = GG.Yard.list[1], P = GG.Player;
    P.reset(e.cx + 40, e.y1 + 70);
    return { cx: e.cx, cy: e.cy - 10 };
  });
  await p.waitForTimeout(300);
  const scr = await p.evaluate((w) => { const o = GG.screenToWorld(0, 0), z = GG.view.zoom; return { x: (w.cx - o.x) * z, y: (w.cy - o.y) * z }; }, tapAt);
  await p.touchscreen.tap(scr.x, scr.y);
  await p.waitForTimeout(2600);
  const tapWalk = await p.evaluate(() => {
    const e = GG.Yard.list[1], P = GG.Player;
    return { d: Math.hypot(P.x - e.gx, P.y - e.gy), label: document.getElementById('btn-a').textContent };
  });
  ok('tapping an enclosure walks her to its gate (' + Math.round(tapWalk.d) + ' px away, ' + tapWalk.label + ')', tapWalk.d < 30 && /^VISIT/.test(tapWalk.label));

  /* ---------- a big friend moves in ---------- */
  const grow = await p.evaluate(() => {
    const e = GG.Yard.list[0], before = { w: e.w, h: e.h, slot: e.slot.id };
    GG.Save.data.friends.cow = { count: 1, first: 1 };
    e.tank.friends.push({ id: 'cow', x: 320, y: 340, s: 1, seed: 0.7 });
    GG.Yard.dirty = true; GG.Yard.update(0.016);
    const f = GG.Yard.list.find(q => q.tank === e.tank);
    return { before, after: { w: f.w, h: f.h, slot: f.slot.id }, inside: f.animals.every(a => a.x > f.x0 && a.x < f.x1 && a.y > f.y0 && a.y < f.y1) };
  });
  ok('a cow moving into the hummingbird nook makes it grow (' + grow.before.w + 'x' + grow.before.h + ' ' + grow.before.slot +
    ' -> ' + grow.after.w + 'x' + grow.after.h + ' ' + grow.after.slot + ')', grow.after.w * grow.after.h > grow.before.w * grow.before.h && grow.inside);
  const fl2 = await flood(p);
  ok('still nobody boxed in after it grew', fl2.door && fl2.pens.every(q => q.gate));

  /* ---------- the same place after a reload ---------- */
  const before = await p.evaluate(() => GG.Yard.list.map(e => e.yid + '@' + e.slot.id).sort().join(' '));
  await p.evaluate(() => GG.Save.save());
  await p.reload(); await p.waitForTimeout(700);
  await p.tap('#btn-play'); await p.waitForTimeout(900);
  await skipChar(p); await quiet(p);
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => GG.Yard.list.map(e => e.yid + '@' + e.slot.id).sort().join(' '));
  ok('each habitat is in the same place after a reload', before === after && before.length > 0);

  /* ---------- ten of them ---------- */
  const ten = await p.evaluate(() => {
    const d = GG.Save.data;
    const kinds = [['horse'], ['cow'], ['mule_deer'], ['sheep'], ['labrador'], ['tabby'], ['green_frog'], ['big_brown_bat'], ['chickadee'], ['golden_retriever', 'beagle']];
    const bgs = ['backyard', 'porch', 'wildwood', 'dusk', 'pondside', 'jungle'];
    d.terrariums = kinds.map((ids, i) => ({ name: 'Habitat ' + (i + 1), type: 'habitat', bg: bgs[i % bgs.length], bugs: [], fish: [], decor: [{ id: 'birdbath', x: 200, y: 300, s: 1, seed: 0.4 }],
      friends: ids.map((id, k) => { d.friends[id] = { count: 1, first: 1 }; return { id, x: 200 + k * 100, y: 330, s: 1, seed: 0.5 }; }) }));
    GG.Save.save(); GG.Yard.sync(true);
    const slots = GG.Yard.list.map(e => e.slot.id);
    return { n: GG.Yard.list.length, distinct: new Set(slots).size, max: GG.MAX_TANKS };
  });
  ok('ten habitats (the most tanks she can have) all fit in the yard (' + ten.n + ' in ' + ten.distinct + ' places)', ten.n === 10 && ten.distinct === 10 && ten.max === 10);
  const probs10 = await layoutProblems(p);
  ok('ten of them: nothing in water or on anything' + (probs10.length ? ' (' + probs10.slice(0, 4).join('; ') + ')' : ''), probs10.length === 0);
  const fl10 = await flood(p);
  ok('ten of them: the door and every gate still reachable (' + fl10.pens.filter(q => !q.gate).map(q => q.name).join(',') + ')', fl10.door && fl10.pens.every(q => q.gate));
  const stuck = await p.evaluate(async () => {
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 100);
    await new Promise(res => setTimeout(res, 2500));
    const fr = GG.Friends.list.filter(f => GG.Yard.blocked(f.x, f.y, 4)).length;
    const cr = GG.Critters.list.filter(c => ['crawl', 'hop', 'slow'].indexOf(c.def.behavior) >= 0 && GG.Yard.blocked(c.x, c.y, 1)).length;
    return { fr, cr, me: GG.Yard.blocked(GG.Player.x, GG.Player.y, 11) };
  });
  ok('nobody is standing inside a fence (friends ' + stuck.fr + ', crawlers ' + stuck.cr + ', Guin ' + stuck.me + ')', !stuck.fr && !stuck.cr && !stuck.me);

  /* back to one habitat: the others' scenery comes back */
  const back = await p.evaluate(() => {
    const d = GG.Save.data, n0 = GG.World.props.length;
    d.terrariums = d.terrariums.slice(0, 1).map(t => Object.assign(t, { type: 'terrarium', friends: [] }));
    GG.Yard.sync(true);
    return { n: GG.Yard.list.length, restored: GG.World.props.length - n0, hidden: GG.Yard._hidden.length, plants: GG.Orchard.plants.length };
  });
  ok('with no habitats left the yard is empty and every lifted prop is back (' + back.restored + ' back, ' + back.hidden + ' still hidden)', back.n === 0 && back.hidden === 0 && back.restored > 0);

  /* ---------- perf: six enclosures in the Flower Garden, 4x CPU ---------- */
  await p.evaluate(() => {
    const d = GG.Save.data;
    const kinds = [['horse'], ['labrador', 'corgi'], ['ruby_hummingbird'], ['tabby', 'calico'], ['cow'], ['green_frog']];
    d.terrariums = [d.terrariums[0]].concat(kinds.map((ids, i) => ({ name: 'Home ' + (i + 1), type: 'habitat', bg: ['backyard', 'porch', 'dusk', 'wildwood', 'pondside', 'jungle'][i], bugs: [], fish: [],
      decor: ['kennel', 'birdbath', 'foodbowl'].map((id, k) => ({ id, x: 120 + k * 180, y: 300 + k * 20, s: 1, seed: 0.3 })),
      friends: ids.map((id, k) => { d.friends[id] = { count: 1, first: 1 }; return { id, x: 200 + k * 100, y: 330, s: 1, seed: 0.5 }; }) })));
    GG.Save.save(); GG.Yard.sync(true);
    GG.Time.RATE = 0;
    GG.Player.reset(4880, 2720);
  });
  await p.waitForTimeout(800);
  await shot('v120-garden-six');
  /* the yard's own share of each frame, timed directly */
  await p.evaluate(() => {
    window.__yt = 0;
    const wrap = (o, k) => { const f = o[k]; o[k] = function () { const t0 = performance.now(); const r = f.apply(this, arguments); window.__yt += performance.now() - t0; return r; }; };
    wrap(GG.Yard, 'update'); wrap(GG.Yard, 'collect'); wrap(GG.YardArt, 'drawEntry');
  });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const SPOTS = [[4880, 2720], [4720, 2546], [5100, 2520]];
  async function measure() {
    const out = [];
    for (const at of SPOTS) {
      await p.evaluate((at) => GG.Player.reset(at[0], at[1]), at);
      await p.waitForTimeout(900);
      await p.evaluate(() => { window.__pf.d = []; window.__pf.on = true; window.__yt = 0; });
      await p.waitForTimeout(2500);
      out.push(await p.evaluate(() => { const P = window.__pf; P.on = false; const d = P.d.slice(3); const n = d.length; d.sort((a, b) => a - b);
        return { med: d[n >> 1], yard: window.__yt / P.d.length }; }));
    }
    return out;
  }
  const withYard = await measure();
  const saved = await p.evaluate(() => { const d = GG.Save.data, keep = d.terrariums; d.terrariums = [keep[0]]; GG.Yard.sync(true); return keep.length; });
  const base = await measure();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const worstYard = Math.max.apply(null, withYard.map(q => q.yard));
  const worst = Math.max.apply(null, withYard.map(q => q.med)), worstBase = Math.max.apply(null, base.map(q => q.med));
  const meanYard = withYard.reduce((a, q) => a + q.yard, 0) / withYard.length;
  ok('perf, the yard itself: six enclosures in the Flower Garden cost ' + withYard.map(q => q.yard.toFixed(2)).join(' / ') +
    ' ms of JS a frame at 4x CPU (mean < 1.2, worst < 2)', meanYard < 1.2 && worstYard < 2);
  ok('perf, the whole frame at 4x CPU: ' + withYard.map(q => q.med.toFixed(1)).join(' / ') + ' ms with them, ' +
    base.map(q => q.med.toFixed(1)).join(' / ') + ' ms without (< 8, or within 1.5 of the same machine without them)',
    worst < 8 || worst - worstBase < 1.5);
  void saved;


  ok('no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''), errs.length === 0);
  console.log(r.join('\n'));
  const fails = r.filter(x => x.startsWith('FAIL')).length;
  console.log(fails ? fails + ' FAILED' : 'ALL ' + r.length + ' PASSED');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
