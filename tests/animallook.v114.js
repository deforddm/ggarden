/* Contact sheets for the twenty-three new animal shapes.

   Big, true size, light ground, dark ground, and through GG.animalFit at
   book-page size - which is where most of them are actually seen.
   Also re-renders the original six shapes and all twelve hats, so a
   before/after comparison proves nothing old moved. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/* Sample art blocks, written to the same contract as src/data/animals.js. */
const DEFS = [
  { id: 'cottontail', name: 'Cottontail', size: 1,
    art: { shape: 'rabbit', body: '#9a8b78', body2: '#b5a692', belly: '#f2efe8',
      ear: '#a3947f', accent: '#3b322b', tail: '#f2efe8', nose: '#7a6154' } },
  { id: 'foxsquirrel', name: 'Fox Squirrel', size: 1,
    art: { shape: 'treesquirrel', body: '#8a6a45', body2: '#7a5c3c', belly: '#d9a05b',
      tail: '#c08a4e', accent: '#e8d2ae', ear: '#7a5c3c' } },
  { id: 'groundsq', name: "Townsend's Ground Squirrel", size: 1,
    art: { shape: 'groundsquirrel', body: '#a99a80', body2: '#7c6e58', belly: '#d6ccb6',
      tail: '#a08f76', accent: '#6d6049' } },
  { id: 'painted', name: 'Painted Turtle', size: 1,
    art: { shape: 'turtle', shell: '#2f3a2a', shell2: '#1e2619', plastron: '#d9532e',
      body: '#2b3a32', accent: '#e8c64a' } },
  { id: 'blackbear', name: 'Black Bear', size: 1,
    art: { shape: 'bear', body: '#2a231e', body2: '#221c18', face: '#9c7a52',
      ear: '#251f1a', leg: '#1e1815', nose: '#120e0b', accent: '#d8cbb5' } },
  { id: 'cinnamonbear', name: 'Bear (brown morph)', size: 1,
    art: { shape: 'bear', body: '#6b4327', body2: '#5a3720', face: '#9c7a52',
      ear: '#5a3720', leg: '#4a2e1c', nose: '#1a1310', accent: '#d8cbb5' } },
  { id: 'raccoon', name: 'Raccoon', size: 1,
    art: { shape: 'raccoon', body: '#7e7768', body2: '#6b6456', belly: '#9c9280',
      face: '#e8e2d4', accent: '#22201c', tail: '#9c9280', nose: '#3a3330' } },
  { id: 'redfox', name: 'Red Fox', size: 1,
    art: { shape: 'fox', body: '#c2622a', body2: '#a9511f', belly: '#f4efe6',
      face: '#f4efe6', ear: '#26201c', leg: '#26201c', accent: '#f4efe6',
      eye: '#c9a227' } },
  { id: 'muledeer', name: 'Mule Deer (buck)', size: 1,
    art: { shape: 'deer', body: '#a97a4c', body2: '#8c7a62', belly: '#ede6d8',
      ear: '#c0a180', leg: '#8a6238', accent: '#f0ebe0', antler: '#b1976c' } },
  { id: 'muledoe', name: 'Mule Deer (fawn)', size: 1,
    art: { shape: 'deer', body: '#a97a4c', body2: '#8c7a62', belly: '#ede6d8',
      ear: '#c0a180', leg: '#8a6238', accent: '#f0ebe0', calf: true } },
  { id: 'moose', name: 'Moose (bull)', size: 1,
    art: { shape: 'moose', body: '#3a2b22', body2: '#2e231c', leg: '#9e9385',
      face: '#241b15', accent: '#332619', antler: '#b9a883' } },
  { id: 'moosecow', name: 'Moose (calf)', size: 1,
    art: { shape: 'moose', body: '#3a2b22', body2: '#2e231c', leg: '#9e9385',
      face: '#241b15', accent: '#332619', calf: true } },
  { id: 'holstein', name: 'Cow (Holstein)', size: 1,
    art: { shape: 'cow', body: '#f5f2ec', body2: '#e2ded4', patch: '#1e1b18',
      face: '#c89d9c', leg: '#ddd8cc', nose: '#3a342c' } },
  { id: 'hereford', name: 'Cow (Hereford)', size: 1,
    art: { shape: 'cow', body: '#8e3b22', body2: '#7a3018', patch: '#f5f2ec',
      face: '#c89d9c', leg: '#f0ece2', nose: '#3a342c' } },
  { id: 'bayhorse', name: 'Horse (bay, ridden)', size: 1,
    art: { shape: 'horse', body: '#6b4423', body2: '#5a3a1e', belly: '#7d5530',
      mane: '#1c1815', leg: '#1c1815', accent: '#8a5a2a', rideable: true } },
  { id: 'greyhorse', name: 'Horse (grey)', size: 1,
    art: { shape: 'horse', body: '#c8c4bc', body2: '#b0aca2', belly: '#d8d4cc',
      mane: '#8a867c', leg: '#3e382f', accent: '#3e382f' } },
  { id: 'mallard', name: 'Mallard (drake)', size: 1,
    art: { shape: 'duck', head: '#1f6b3f', body: '#b9b4a8', body2: '#a39e92',
      face: '#6e3b22', accent: '#f5f2ec', bill: '#d9b546', speculum: '#2e4fa0',
      leg: '#e08a2f', tail: '#1a1714' } },
  { id: 'hen', name: 'Mallard (hen)', size: 1,
    art: { shape: 'duck', head: '#8c7350', body: '#9b8663', body2: '#7a6748',
      face: '#8c7350', accent: '#e8e0cc', bill: '#c08a3a', speculum: '#2e4fa0',
      leg: '#e08a2f', tail: '#5a4732' } },
  { id: 'otter', name: 'River Otter', size: 1,
    art: { shape: 'otter', body: '#4a3a2c', body2: '#6b5544', belly: '#b9ac96',
      face: '#cfc3ac', accent: '#ede7d9', nose: '#2a231c' } },
  { id: 'suffolk', name: 'Sheep (Suffolk)', size: 1,
    art: { shape: 'sheep', body: '#e4dccc', body2: '#bfb5a0', face: '#2a2520',
      ear: '#2a2520', leg: '#2a2520', accent: '#3a342c' } },
  { id: 'merino', name: 'Sheep (Merino)', size: 1,
    art: { shape: 'sheep', body: '#efe9dc', body2: '#cfc5ae', face: '#d8cebb',
      ear: '#c8bda6', leg: '#bfb49c', accent: '#8a8070', patch: '#d3c8b0' } },
  { id: 'rir', name: 'Chicken (Rhode Island Red)', size: 1,
    art: { shape: 'chicken', body: '#7a3a1c', body2: '#632e14', tail: '#4a2010',
      face: '#c2302a', leg: '#e0b04a', accent: '#4a2010' } },
  { id: 'rock', name: 'Chicken (Plymouth Rock)', size: 1,
    art: { shape: 'chicken', body: '#8a8680', body2: '#6b6862', tail: '#3a3733',
      face: '#c2302a', leg: '#e0b04a', accent: '#d6d0c4' } },
  { id: 'burrowing', name: 'Burrowing Owl', size: 1,
    art: { shape: 'owl', body: '#8a6f4e', body2: '#6f5738', belly: '#c9b48f',
      disc: '#c9b48f', brow: '#f5efdf', accent: '#ede4ce', leg: '#9c8768',
      eye: '#f2c230', nose: '#d6d0c0', tail: '#7a6244' } },
  { id: 'panda', name: 'Giant Panda', size: 1,
    art: { shape: 'panda', body: '#f5f1e8', body2: '#e6e0d4', ear: '#211e1c',
      leg: '#211e1c', accent: '#211e1c', nose: '#211e1c' } },
  { id: 'koala', name: 'Koala', size: 1,
    art: { shape: 'koala', body: '#9aa2a7', body2: '#848d93', belly: '#f1f0eb',
      face: '#f1f0eb', ear: '#8e979d', accent: '#c8ced1', nose: '#241f1d' } },
  { id: 'ocelot', name: 'Ocelot', size: 1,
    art: { shape: 'ocelot', body: '#d6b173', body2: '#c39a5c', belly: '#f3ede2',
      ear: '#211c18', accent: '#2a2118', eye: '#c8a83c' } },
  { id: 'redpanda', name: 'Red Panda', size: 1,
    art: { shape: 'redpanda', body: '#b85c29', body2: '#8c4a24', belly: '#2b1c14',
      leg: '#2b1c14', face: '#f7f3ec', ear: '#a8501f', accent: '#6b3a22',
      tail: '#c4622c' } },
  { id: 'axolotl', name: 'Axolotl (pet pink)', size: 1,
    art: { shape: 'axolotl', body: '#e8afc0', body2: '#f4cedaee', belly: '#f4ceda',
      accent: '#d45c7a', nose: '#c07b8c' } },
  { id: 'axowild', name: 'Axolotl (wild dark)', size: 1,
    art: { shape: 'axolotl', body: '#4a4638', body2: '#6e6a52', belly: '#6e6a52',
      accent: '#7c6a4a', nose: '#2f2b22' } },
  { id: 'chickadee', name: 'Black-capped Chickadee', size: 1,
    art: { shape: 'songbird', body: '#9aa0a2', body2: '#7c8386', belly: '#f4f1e8',
      face: '#ffffff', cap: '#1e1b18', bib: '#1e1b18', wing: '#8a9194',
      accent: '#e8e4d8', tail: '#7c8386' } },
  { id: 'nuthatch', name: 'Red-breasted Nuthatch', size: 1,
    art: { shape: 'songbird', body: '#6e8497', body2: '#5a6f80', belly: '#c98a5a',
      face: '#f4f1e8', cap: '#1e2228', bib: '#c98a5a', wing: '#63798a',
      accent: '#e8e4d8', tail: '#5a6f80' } },
  { id: 'junco', name: 'Dark-eyed Junco', size: 1,
    art: { shape: 'songbird', body: '#7a5f46', body2: '#63503c', belly: '#f4f1e8',
      face: '#3a3a40', cap: '#33333a', bib: '#33333a', wing: '#4a4148',
      accent: '#d8d2c6', tail: '#3a3a40', nose: '#e8c0c4' } },
  { id: 'goldfinch', name: 'American Goldfinch', size: 1,
    art: { shape: 'songbird', body: '#e8d23a', body2: '#cbb42a', belly: '#f2e88a',
      face: '#e8d23a', cap: '#1e1b18', wing: '#22201c', accent: '#f4f1e8',
      tail: '#22201c', nose: '#e8862a' } },
  { id: 'swallow', name: 'Violet-green Swallow', size: 1,
    art: { shape: 'songbird', body: '#4a7a5f', body2: '#3a5f6e', belly: '#f6f4ee',
      face: '#f6f4ee', cap: '#4a7a5f', wing: '#2f4a5f', accent: '#f6f4ee',
      tail: '#2f4a5f' } },
  { id: 'bluebird', name: 'Western Bluebird', size: 1,
    art: { shape: 'songbird', body: '#3a6fb0', body2: '#2f5c96', belly: '#e8e4d8',
      face: '#3a6fb0', cap: '#3a6fb0', bib: '#b05a2a', wing: '#2f5c96',
      accent: '#cfd8e8', tail: '#2f5c96' } },
  { id: 'garter', name: 'Common Garter Snake', size: 1,
    art: { shape: 'snake', pattern: 'stripes', body: '#33383a', body2: '#22262a',
      belly: '#b8cdbc', stripe: '#e8d46a', accent: '#c24a2a' } },
  { id: 'nwgarter', name: 'NW Garter Snake', size: 1,
    art: { shape: 'snake', pattern: 'stripes', body: '#4a4030', body2: '#372f22',
      belly: '#cfc8a8', stripe: '#c8442a', accent: '#8a7a3a' } },
  { id: 'gopher', name: 'Gopher Snake', size: 1,
    art: { shape: 'snake', pattern: 'blotches', body: '#d8c79a', body2: '#584426',
      belly: '#f2ece0', accent: '#8a6f3a' } },
  { id: 'boa', name: 'Northern Rubber Boa', size: 1,
    art: { shape: 'snake', pattern: 'plain', body: '#8a7358', body2: '#6e5a42',
      belly: '#e8dcbc', accent: '#5a4a36' } },
  { id: 'rattler', name: 'Western Rattlesnake', size: 1,
    art: { shape: 'snake', pattern: 'diamond', body: '#b8a274', body2: '#4a3d28',
      belly: '#e2d8be', accent: '#efe6cc' } }
];

const OLD = [
  { id: 'anna', name: 'Anna’s Hummingbird', size: 1,
    art: { shape: 'hummingbird', body: '#2f9a6a', wing: '#6fc4a0', throat: '#c8203a',
      belly: '#f2f0e2', accent: '#1f5a44' } },
  { id: 'frog', name: 'Green Frog', size: 1,
    art: { shape: 'frog', body: '#5f9a3f', belly: '#e8e8c0', accent: '#3a6b28',
      eye: '#d8b040', pattern: 'mottle' } },
  { id: 'bat', name: 'Little Brown Bat', size: 1,
    art: { shape: 'bat', body: '#6b4a2f', wing: '#3f2c1e', ear: '#4a3220',
      accent: '#8a6a45' } },
  { id: 'collie', name: 'Collie', size: 1,
    art: { shape: 'dog', body: '#b0763a', ear: '#8a5a28', muzzle: '#f2ece0',
      nose: '#2a2320', collar: '#c8443a', accent: '#f4f0e6', patch: 'ruff' } },
  { id: 'tabby', name: 'Tabby Cat', size: 1,
    art: { shape: 'cat', body: '#9a8256', belly: '#e8e0cc', accent: '#5f4a2a',
      nose: '#d89a9a', eye: '#8aa83c', pattern: 'tabby' } },
  { id: 'macaw', name: 'Macaw', size: 1,
    art: { shape: 'parrot', body: '#c8322a', wing: '#2a5ab0', face: '#f2ece0',
      beak: '#2a2320', accent: '#e8b02a', longtail: true, wingTip: '#2a8a4a' } }
];

const HATS = ['party', 'top', 'bow', 'flower', 'crown', 'wizard',
  'sun', 'cap', 'chef', 'pirate', 'antlers', 'propeller'];

(async () => {
  const outDir = path.join(__dirname, 'shots');
  const tag = process.argv[3] || 'v114';
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto('file://' + (process.env.PAGE || path.join(__dirname, 'animalsheet.v114.html')));
  await p.waitForTimeout(200);

  async function sheet(file, fn, w, h, arg) {
    const data = await p.evaluate(({ fnStr, w, h, arg }) => {
      const cv = document.createElement('canvas');
      cv.width = w * 2; cv.height = h * 2;
      const c = cv.getContext('2d'); c.scale(2, 2);
      // eslint-disable-next-line no-eval
      eval('(' + fnStr + ')')(c, w, h, arg);
      return cv.toDataURL('image/png');
    }, { fnStr: fn.toString(), w, h, arg });
    fs.writeFileSync(path.join(outDir, file), Buffer.from(data.split(',')[1], 'base64'));
  }

  const big = function (c, w, h, o) {
    const defs = o.defs, cols = o.cols, cw = w / cols, ch = o.ch;
    c.fillStyle = o.dark ? '#2a3326' : '#eef4e8'; c.fillRect(0, 0, w, h);
    defs.forEach((def, i) => {
      const x = (i % cols) * cw + cw / 2;
      const y = Math.floor(i / cols) * ch + ch - 30;
      c.strokeStyle = o.dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - cw / 2 + 6, y + 0.5); c.lineTo(x + cw / 2 - 6, y + 0.5); c.stroke();
      GG.AnimalArt.draw(c, def, x, y, o.z, false, o.t, o.gait, null);
      c.fillStyle = o.dark ? '#dfe8d6' : '#2c3a26';
      c.font = 'bold 10px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 14);
      c.fillStyle = o.dark ? '#93a68a' : '#6a7a60'; c.font = '9px system-ui';
      c.fillText(def.art.shape, x, y + 25);
    });
  };

  const fit = function (c, w, h, o) {
    const defs = o.defs, cols = o.cols, cw = w / cols, ch = o.ch;
    c.fillStyle = o.dark ? '#2a3326' : '#f7f3e8'; c.fillRect(0, 0, w, h);
    defs.forEach((def, i) => {
      const x = (i % cols) * cw + cw / 2;
      const y = Math.floor(i / cols) * ch + ch - 28;
      c.strokeStyle = o.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
      c.lineWidth = 1;
      c.strokeRect(x - o.px / 2, y - o.px, o.px, o.px);
      GG.AnimalArt.draw(c, def, x, y, GG.animalFit(def, o.px), false, o.t, 0, null);
      c.fillStyle = o.dark ? '#dfe8d6' : '#2c3a26';
      c.font = '9px system-ui'; c.textAlign = 'center';
      c.fillText(def.name, x, y + 13);
    });
  };

  const hatSheet = function (c, w, h, o) {
    const cols = 6, cw = w / cols, ch = 150;
    c.fillStyle = '#eef4e8'; c.fillRect(0, 0, w, h);
    let i = 0;
    o.defs.forEach(def => {
      o.hats.forEach(hat => {
        const x = (i % cols) * cw + cw / 2;
        const y = Math.floor(i / cols) * ch + ch - 34;
        GG.AnimalArt.draw(c, def, x, y, 2.2, false, o.t, 0, hat);
        c.fillStyle = '#4a5a44'; c.font = '9px system-ui'; c.textAlign = 'center';
        c.fillText(def.name + ' / ' + hat, x, y + 16);
        i++;
      });
    });
  };

  const A = DEFS.slice(0, 21), B = DEFS.slice(21);
  await sheet(tag + '-big-a.png', big, 1300, 940, { defs: A, cols: 7, ch: 134, z: 2.5, t: 1.15, gait: 0 });
  await sheet(tag + '-big-b.png', big, 1300, 940, { defs: B, cols: 7, ch: 134, z: 2.5, t: 1.15, gait: 0 });
  await sheet(tag + '-walk.png', big, 1300, 940, { defs: A, cols: 7, ch: 134, z: 2.5, t: 2.42, gait: 1 });
  await sheet(tag + '-walk-b.png', big, 1300, 940, { defs: B, cols: 7, ch: 134, z: 2.5, t: 2.42, gait: 1 });
  await sheet(tag + '-dark.png', big, 1300, 940, { defs: DEFS.slice(0, 21), cols: 7, ch: 134, z: 2.5, t: 2.6, gait: 0.5, dark: 1 });
  await sheet(tag + '-dark-b.png', big, 1300, 940, { defs: B, cols: 7, ch: 134, z: 2.5, t: 2.6, gait: 0.5, dark: 1 });
  await sheet(tag + '-true.png', big, 1100, 420, { defs: DEFS, cols: 10, ch: 66, z: 1, t: 1.15, gait: 0.4 });
  await sheet(tag + '-true-dark.png', big, 1100, 420, { defs: DEFS, cols: 10, ch: 66, z: 1, t: 2.3, gait: 0.4, dark: 1 });
  await sheet(tag + '-book.png', fit, 1100, 700, { defs: DEFS, cols: 8, ch: 112, px: 72, t: 1.15 });
  await sheet(tag + '-old.png', big, 1000, 300, { defs: OLD, cols: 6, ch: 140, z: 2.5, t: 1.15, gait: 0 });
  await sheet(tag + '-old-walk.png', big, 1000, 300, { defs: OLD, cols: 6, ch: 140, z: 2.5, t: 2.42, gait: 1 });
  await sheet(tag + '-hats.png', hatSheet, 1000, 320, { defs: [OLD[3], OLD[4]], hats: HATS, t: 1.15 });
  await sheet(tag + '-hats2.png', hatSheet, 1000, 320, { defs: [OLD[0], OLD[5]], hats: HATS, t: 1.15 });
  await sheet(tag + '-hats3.png', hatSheet, 1000, 320, { defs: [OLD[1], OLD[2]], hats: HATS, t: 1.15 });
  await sheet(tag + '-newhats.png', hatSheet, 1300, 620, {
    defs: [DEFS[0], DEFS[8], DEFS[14], DEFS[23], DEFS[24], DEFS[30], DEFS[40]],
    hats: ['party', 'crown', 'sun', 'propeller'], t: 1.15 });

  /* a close-up strip for whichever ones need another look */
  const pick = (process.env.ZOOM || '').split(',').filter(Boolean);
  if (pick.length) {
    const z = DEFS.filter(d => pick.indexOf(d.id) >= 0);
    await sheet(tag + '-zoom.png', big, 1300, 300 * Math.ceil(z.length / 4),
      { defs: z, cols: 4, ch: 300, z: 5.6, t: 1.15, gait: 0 });
  }

  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await b.close();
})();
