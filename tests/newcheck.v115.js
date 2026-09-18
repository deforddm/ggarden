/* Loads util.js, the two data files and the two art files in a bare
   sandbox and checks the new roster over: no duplicate ids, every art
   shape exists, every habitat and water is a real one, and every species
   has a measure, a size and at least two facts. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, Math: Math, console: console };
ctx.globalThis = ctx;
vm.createContext(ctx);
['src/core/util.js', 'src/data/bugs.js', 'src/data/fish.js',
 'src/render/bugart.js', 'src/render/fishart.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
});
const GG = ctx.window.GG;
const bad = [];
const seen = {};

const HAB = Object.keys(GG.HABITAT_NAMES);
const WAT = Object.keys(GG.WATER_NAMES);

function common(def, kind) {
  if (seen[def.id]) bad.push('duplicate id: ' + def.id);
  seen[def.id] = 1;
  if (!def.name) bad.push(kind + ' ' + def.id + ': no name');
  if (!def.measure) bad.push(kind + ' ' + def.id + ': no measure');
  if (!(def.size > 0)) bad.push(kind + ' ' + def.id + ': no size');
  if (!def.facts || def.facts.length < 2) bad.push(kind + ' ' + def.id + ': fewer than 2 facts');
  (def.facts || []).forEach((f, i) => {
    if (typeof f !== 'string' || f.length < 12) bad.push(kind + ' ' + def.id + ': fact ' + i + ' looks wrong');
  });
  if (!(def.rarity >= 1 && def.rarity <= 5)) bad.push(kind + ' ' + def.id + ': rarity out of range');
  if (def.value == null) bad.push(kind + ' ' + def.id + ': no value');
}

const BEHAVIOR = ['flutter','hover','dart','crawl','hop','glow','skim','cling','slow','drift','tide'];
const TIMES = ['morning','day','evening','night','any'];

GG.BUGS.forEach(b => {
  common(b, 'bug');
  if (!GG.BugArt.shapes[b.art.shape]) bad.push('bug ' + b.id + ': no such shape ' + b.art.shape);
  b.habitats.forEach(h => { if (HAB.indexOf(h) < 0) bad.push('bug ' + b.id + ': bad habitat ' + h); });
  b.times.forEach(h => { if (TIMES.indexOf(h) < 0) bad.push('bug ' + b.id + ': bad time ' + h); });
  if (BEHAVIOR.indexOf(b.behavior) < 0) bad.push('bug ' + b.id + ': bad behavior ' + b.behavior);
  if (!(b.speed >= 0)) bad.push('bug ' + b.id + ': no speed');
  if (b.shy == null) bad.push('bug ' + b.id + ': no shy');
});
GG.FISH.forEach(f => {
  common(f, 'fish');
  if (!GG.FishArt.shapes[f.art.shape]) bad.push('fish ' + f.id + ': no such shape ' + f.art.shape);
  f.waters.forEach(w => { if (WAT.indexOf(w) < 0) bad.push('fish ' + f.id + ': bad water ' + w); });
  f.times.forEach(h => { if (TIMES.indexOf(h) < 0) bad.push('fish ' + f.id + ': bad time ' + h); });
  if (!(f.shadow >= 1 && f.shadow <= 5)) bad.push('fish ' + f.id + ': bad shadow');
});

/* every new habitat actually has something living in it */
['savanna', 'swamp', 'cave', 'badlands', 'bamboo', 'cherry', 'farmyard'].forEach(h => {
  if (!GG.BUGS.some(b => b.habitats.indexOf(h) >= 0))
    bad.push('habitat ' + h + ' has nothing in it');
});
WAT.forEach(w => {
  if (!GG.FISH.some(f => f.waters.indexOf(w) >= 0)) bad.push('water ' + w + ' has no fish in it');
});

const counts = {};
HAB.forEach(h => { counts[h] = GG.BUGS.filter(b => b.habitats.indexOf(h) >= 0).length; });
console.log('bugs: ' + GG.BUGS.length + '   fish: ' + GG.FISH.length);
console.log('per habitat: ' + JSON.stringify(counts));
console.log(bad.length ? 'FAILURES:\n' + bad.join('\n') : 'all checks pass');
process.exit(bad.length ? 1 : 0);
