/* The open world: hills, meadow, garden, woods, orchard, a pond,
   a stream that becomes a river, an estuary, a beach and the sea. */
(function (GG) {
  'use strict';

  var CELL = 160, COLS = 50, ROWS = 26;
  /* H hill  M meadow  G garden  F forest  O orchard  P pond bank
     T tundra  A taiga  N mountain  D desert  R rainforest  L forest glade
     B scablands  V oak savanna  W marsh  Y bamboo  C cherry  E bird town
     K farmyard  Q Dog's Paradise
     The sea is in the south-east, so wet air comes off it, crosses the
     rainforest, climbs the mountains and drops its rain on the way up.
     What is left is dry, which is why the desert sits behind the ridge. */
  var MAP = [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTAAAATTTTTTAAAATTTTTAAAAAAAATTTTAAAAAAAAAAAATTT',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAANNNNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AABBBBBBBBDDDDHHNNNNHHHHHMMMMFFFFFFFFFFFFFFFFFFFFF',
    'ABBBBBBBBBDDDDDHNNNNHHHHHMMMMFFFFFFFFFFFFFFFFFFFFF',
    'BBBBBBBBBBDDDDDDNNNNHHHHMMEEEMFFFFFFFFFFFFFFFFFFFF',
    'BBBBBBBBBBDDDDDNNNNNHHHMMMEEEMFFFFFFLLFFFFFFFFFFFF',
    'BBBBBBBBBBDDDDDNNNNNHHMMMMMYYYMFFFFLLLLFFFFFFRRRRR',
    'BBBBBBBBBBDDDDDNNNNHQQQQQMMYYYMMFFFLLLFFFFFFRRRRRR',
    'BBBBBBBBBBDDDDDNNNNHQQQQQMMYYYGGOOOOOFFFFFFFRRRRRR',
    'BBBBBBBBBBDDDDNNNNNHQQQQQMGGGGGGOOOOOOFFFFFFRRRRRR',
    'BBBBBBBBBBDDDDNNNNNHPPMMMMGGGGGGGOOOOOOFFFFFRRRRRR',
    'VBBBBBBBBBDDDDNNNNHHPPPMMMGGGGGGGOOOOOOFFFFFRRRRRR',
    'VVBBBBBBBBDDDDNNNNHHPPPPMMGGGGGGGOOOOOCCCFFFRRRRRR',
    'VVVBBBBBBBDDDNNNNNHHPPPPPMMGGGGGGOOOOMCCCMMFRRRRRR',
    'VVVVBBBBBBDDDNNNNNHMPPPPPMMMGGGGMMMMMMCCCMMMMRRRRR',
    'VVVVVBBBBBDDDNNNNHHMPPPPMMKKKKMMMMMMMMMMMMMMMMMRRR',
    'VVVVVVBBBBDDDNNNNHHMPPPMMMKKKKMMMMMMMMMMMMMMMMMMMM',
    'VVVVVVVBBBDDNNNNNHWWWWWWWWMMMMMMMMMMMMMMMMMMMMMMMM',
    'VVVVVVVVBBDDNNNNHHWWWWWWWWMMMMMMMMMMMMMMMMMMMMMMMM',
    'VVVVVVVVVBDDNNNNHMWWWWWWWWMMMMMMMMMMMMMMMMMMMMMMMM',
    'VVVVVVVVVVDDNNNNHMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'VVVVVVVVVVDDNNNHHMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM'
  ];
  var LETTER = { M: 'meadow', G: 'garden', F: 'forest', P: 'pond', H: 'hill', O: 'orchard',
    T: 'tundra', A: 'taiga', N: 'mountain', D: 'desert', R: 'rainforest', L: 'glade',
    B: 'badlands', V: 'savanna', W: 'swamp', Y: 'bamboo', C: 'cherry',
    E: 'birdtown', K: 'farmyard', Q: 'dogpark' };

  /* water kinds */
  var NONE = 0, POND = 1, STREAM = 2, RIVER = 3, ESTUARY = 4, SEA = 5, TIDEPOOL = 6, MARSH = 7;

  var GROUND = {
    meadow: ['#8ecf63', '#83c55a', '#98d76d'],
    garden: ['#9ad96f', '#90d065', '#a5e17b'],
    forest: ['#4f9450', '#478a49', '#589c58'],
    pond: ['#9dcf7e', '#94c777', '#a7d78a'],
    hill: ['#c3bf94', '#b8b489', '#cdc9a0'],
    orchard: ['#a3d46a', '#99cb60', '#aeda78'],
    riverbank: ['#7fc472', '#74ba67', '#8cd07f'],
    beach: ['#efe0b4', '#e8d6a6', '#f5e9c2'],
    shore: ['#b9b3a4', '#aaa595', '#c6c0b0'],
    desert: ['#cdb68c', '#c6ae82', '#d4bf97'],
    mountain: ['#918e86', '#8a8781', '#9b978f'],
    taiga: ['#4a6b3e', '#446238', '#527446'],
    tundra: ['#8d8a68', '#86835f', '#97946f'],
    rainforest: ['#3f6b35', '#396430', '#46743a'],
    glade: ['#b8a85e', '#b2a256', '#c0b168'],
    /* pale loess over dark basalt - the flood country */
    badlands: ['#a89a7e', '#9e9075', '#b3a58a'],
    /* cured bunchgrass gold, and the gaps between the bunches are the point */
    savanna: ['#c9b172', '#bea567', '#d3bc7f'],
    /* wet organic mud at the walkable edge of the water */
    swamp: ['#5e6b47', '#556343', '#67744f'],
    bamboo: ['#7a9450', '#728c49', '#84a05a'],
    cherry: ['#a3d46a', '#99cb60', '#aeda78'],
    birdtown: ['#8ecf63', '#83c55a', '#98d76d'],
    /* trodden dirt and dropped straw */
    farmyard: ['#b9ac7e', '#b0a375', '#c2b68a'],
    /* a mown lawn, a shade brighter than the meadow round it */
    dogpark: ['#93d668', '#8acd5f', '#9edd74']
  };

  var GROUND_RGB = {};
  Object.keys(GROUND).forEach(function (k) {
    GROUND_RGB[k] = GROUND[k].map(function (h) {
      var v = parseInt(h.slice(1), 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    });
  });

  /* The three shades above are a fine speckle, close enough together to read
     as texture. These are the big blotches painted over them: the drifts of
     straw between the sagebrush, the lichen heath on the tundra, the patch of
     alpine turf between two slabs of talus. Real ground is a patchwork, and
     one flat colour per place looks like a bedsheet. Each entry is
     [colour, blob size in pixels, how much of the ground it covers, seed]. */
  var PATCH = {
    desert: [[189, 160, 104, 78, 0.60, 61], [181, 144, 79, 48, 0.76, 67], [142, 143, 110, 96, 0.86, 71]],
    mountain: [[110, 140, 85, 86, 0.62, 73], [125, 132, 103, 56, 0.74, 79], [182, 178, 166, 48, 0.84, 83]],
    taiga: [[92, 74, 51, 72, 0.66, 89], [125, 145, 80, 50, 0.76, 97], [138, 154, 76, 98, 0.90, 101]],
    tundra: [[196, 203, 189, 88, 0.60, 103], [116, 112, 74, 64, 0.72, 109],
             [214, 211, 194, 46, 0.84, 107], [150, 158, 96, 104, 0.92, 113]],
    rainforest: [[47, 74, 40, 78, 0.60, 127], [87, 133, 60, 48, 0.74, 131], [58, 45, 34, 52, 0.90, 137]],
    glade: [[111, 155, 61, 86, 0.56, 139], [127, 168, 74, 48, 0.72, 149], [90, 70, 48, 50, 0.92, 151]],
    badlands: [[74, 76, 80, 82, 0.62, 157], [189, 160, 104, 54, 0.74, 163], [110, 112, 86, 46, 0.86, 167]],
    savanna: [[155, 164, 94, 84, 0.62, 173], [168, 149, 92, 54, 0.74, 179], [141, 123, 78, 46, 0.84, 181]],
    swamp: [[62, 74, 51, 70, 0.58, 191], [140, 160, 78, 48, 0.72, 193], [111, 106, 82, 58, 0.84, 197]],
    bamboo: [[92, 112, 60, 74, 0.60, 199], [196, 186, 126, 52, 0.78, 211]],
    cherry: [[236, 206, 214, 60, 0.74, 223], [150, 180, 96, 82, 0.60, 227]],
    farmyard: [[150, 168, 92, 68, 0.58, 229], [142, 124, 86, 48, 0.80, 233]],
    /* worn patches where the dogs always run the same way round */
    dogpark: [[176, 164, 116, 54, 0.80, 241], [128, 192, 88, 80, 0.62, 251]]
  };

  var POND_E = { cx: 3820, cy: 2980, rx: 460, ry: 300 };

  /* The Cattail Marsh's open water. A marsh is not one pond: it is a lot of
     small dark leads between the stands of cattail, and you fish from the
     edges of them. (v1.15 - Guin: "I cant fish in the marsh". She could not,
     because v1.14 built the marsh as land and forgot to put any water in it.) */
  var MARSH_POOLS = [
    { x: 3090, y: 3470, rx: 150, ry: 72 },
    { x: 3420, y: 3540, rx: 200, ry: 92 },
    { x: 3790, y: 3480, rx: 150, ry: 76 },
    { x: 4000, y: 3650, rx: 118, ry: 62 },
    { x: 3260, y: 3740, rx: 136, ry: 56 },
    { x: 3640, y: 3740, rx: 170, ry: 62 }
  ];

  /* the stream grows into a river and then opens into the estuary */
  var FLOW = [
    { x: 3720,  y: 1220,  w: 13, kind: STREAM },
    { x: 3900,  y: 1520,  w: 15, kind: STREAM },
    { x: 4100,  y: 1840,  w: 17, kind: STREAM },
    { x: 4260,  y: 2170, w: 20, kind: STREAM },
    { x: 4380,  y: 2520, w: 24, kind: STREAM },
    { x: 4570,  y: 2820, w: 31, kind: RIVER },
    { x: 4900,  y: 2990, w: 42, kind: RIVER },
    { x: 5280,  y: 3110, w: 52, kind: RIVER },
    { x: 5650,  y: 3190, w: 64, kind: RIVER },
    { x: 5990,  y: 3290, w: 82, kind: RIVER },
    { x: 6270,  y: 3480, w: 125, kind: ESTUARY },
    { x: 6490,  y: 3730, w: 180, kind: ESTUARY },
    { x: 6670,  y: 3870, w: 245, kind: ESTUARY }
  ];

  /* the sea fills everything below this line */
  function shoreY(x) {
    var u = x - 3200;
    var y = 4010 - (u / 4800) * 760
      + Math.sin(u * 0.0022) * 52
      + Math.sin(u * 0.0071 + 1.2) * 22;
    /* West of the river mouth the coast swings away south, so the dry side of
       the mountains never touches the sea. A desert with a beach would be a lie. */
    var w = (4200 - x) / 900;
    if (w > 0) y += w * w * 1400;
    return y;
  }

  /* [x, height above the tide line, rx, ry] - always on the shelf, never in the sea */
  var TIDEPOOLS = (function () {
    var defs = [
      [6960, 132, 62, 40], [7120, 214, 46, 32], [7320, 118, 74, 44],
      [7530, 196, 52, 36], [7720, 126, 64, 42], [7190, 322, 44, 30],
      [7470, 306, 50, 34]
    ];
    var out = [], i, d;
    for (i = 0; i < defs.length; i++) {
      d = defs[i];
      out.push({ x: d[0], y: shoreY(d[0]) - d[1], rx: d[2], ry: d[3] });
    }
    return out;
  })();

  var SHELF = { x0: 6820, x1: 8000, pad: 210 };

  /* The footbridge near Shell Beach. It crosses the water where the river
     opens out into Gull Inlet, so she can walk over instead of all the way
     round - and she can fish off the side of it. Everything about it is
     worked out from these five numbers. */
  var BRIDGE = {
    x: 6057, y: 3343,        // mid-channel, where the river meets the beach
    ang: 2.167,              // square across the current, in radians
    len: 258,                // end to end, with a landing on the sand each side
    w: 34                    // how wide the deck is
  };
  BRIDGE.dx = Math.cos(BRIDGE.ang); BRIDGE.dy = Math.sin(BRIDGE.ang);
  BRIDGE.ax = BRIDGE.x - BRIDGE.dx * BRIDGE.len / 2;
  BRIDGE.ay = BRIDGE.y - BRIDGE.dy * BRIDGE.len / 2;
  BRIDGE.bx = BRIDGE.x + BRIDGE.dx * BRIDGE.len / 2;
  BRIDGE.by = BRIDGE.y + BRIDGE.dy * BRIDGE.len / 2;

  /* Things that are part of the ground rather than standing on it. They are
     painted before anything that walks, and never sorted by depth. */
  var FLAT = { lilypad: 1, wetrock: 1, pebbles: 1, kelp: 1, soilCrust: 1, snowPatch: 1,
    duckweed: 1, petalDrift: 1, scabPothole: 1, currentRipple: 1, acorns: 1,
    tennisBall: 1, dogBowl: 1, boneToy: 1 };

  var MS = 8;   // water mask resolution, in pixels

  /* Props that stand tall enough to hide what is just behind (north of) them. */
  var TALL = { tree: 1, pine: 1, willow: 1, appleTree: 1, blackSpruce: 1, subalpineFir: 1,
    mossyTrunk: 1, cherryTree: 1, bamboo: 1, basaltColumn: 1, garryOak: 1, oakSnag: 1, snag: 1,
    vineMaple: 1, krummholz: 1, cliffOak: 1 };
  /* how far a tall prop's crown spreads to each side, in units of its r */
  var WIDE = { garryOak: 1.7, basaltColumn: 1.7, cherryTree: 1.5, willow: 1.3, mossyTrunk: 1.0 };
  /* Small non-solid scenery that may be cleared away from round a plant to pick. */
  var DECO = { flower: 1, tulip: 1, grassTuft: 1, mushroom: 1, fireweed: 1, woodSorrel: 1,
    swordFern: 1, mossCampion: 1, pearly: 1, bracken: 1, heather: 1, lupine: 1, pasque: 1,
    balsamroot: 1, bunchgrass: 1 };

  /* The standing props are kept in columns this wide, each in y order, so a
     frame only looks at the few columns on screen and binary-searches to
     the rows it needs instead of walking all fifteen thousand props. */
  var PCOL = 256;
  /* How far a prop's paint reaches from its base (x, y), measured over every
     prop type: up to ~202 px above it (the tallest trees), ~45 below and
     ~109 to the side. So a prop whose base is up to 215 px BELOW the bottom
     of the screen can still reach up into it, and one more than 55 px above
     the top cannot. */
  var CULL_UP = 55, CULL_DOWN = 215, CULL_SIDE = 120;
  /* the collision grid, 200 px squares, numbered rather than keyed by string */
  var GS = 200, GPAD = 2, GCOLS = Math.ceil(COLS * CELL / GS) + GPAD * 2;
  function gkey(gx, gy) { return (gy + GPAD) * GCOLS + (gx + GPAD); }
  /* the ground is sampled every GSTEP px (GPADC extra cells round each
     chunk so the smoothing at its edges matches the next chunk) */
  var GSTEP = 8, GPADC = 2, GRAIN = 0;
  /* how many ground chunks to keep painted (each is 400x400) */
  var CHUNK_CAP = 40;

  function lowerBound(a, v) {
    var lo = 0, hi = a.length;
    while (lo < hi) { var m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; }
    return lo;
  }

  var World = GG.World = {
    CELL: CELL, COLS: COLS, ROWS: ROWS,
    W: COLS * CELL, H: ROWS * CELL,
    HOUSE: { x: 4720, y: 2440, w: 150 },
    DOOR: { x: 4720, y: 2446 },
    KIND: { NONE: NONE, POND: POND, STREAM: STREAM, RIVER: RIVER, ESTUARY: ESTUARY, SEA: SEA, TIDEPOOL: TIDEPOOL, MARSH: MARSH },
    marshPools: MARSH_POOLS,
    props: [], solids: [], hive: null, grid: {}, gridN: [], chunks: null,
    caveMouth: null, bootBrush: null,
    CHUNK: 400,
    pond: POND_E,
    flow: FLOW,
    tidepools: TIDEPOOLS,
    bridge: BRIDGE,

    /* Is this point on the footbridge deck? Walking on it is the whole
       point, so it beats the deep water underneath. */
    onBridge: function (x, y, pad) {
      var B = BRIDGE;
      var ox = x - B.x, oy = y - B.y;
      var along = ox * B.dx + oy * B.dy;
      var across = -ox * B.dy + oy * B.dx;
      var p = pad || 0;
      return Math.abs(along) <= B.len / 2 + p && Math.abs(across) <= B.w / 2 + p;
    },

    /* ---------- water ---------- */
    _kindAtRaw: function (x, y) {
      var i;
      // tidepools first - they sit close to the tide line and must win it
      for (i = 0; i < TIDEPOOLS.length; i++) {
        var p = TIDEPOOLS[i];
        var ex = (x - p.x) / p.rx, ey = (y - p.y) / p.ry;
        var e2 = ex * ex + ey * ey;
        /* the wobble below is never more than 1.15, so past that nothing
           can be inside - skip the noise (an exact shortcut, same mask) */
        if (e2 >= 1.15) continue;
        var wb = 1 + (GG.noise2(x / 40, y / 40, 19) - 0.5) * 0.3;
        if (e2 < wb) return TIDEPOOL;
      }
      // stream / river / estuary
      var best = 1e9, bestKind = NONE;
      for (i = 0; i < FLOW.length - 1; i++) {
        var a = FLOW[i], b = FLOW[i + 1];
        var vx = b.x - a.x, vy = b.y - a.y;
        var t = ((x - a.x) * vx + (y - a.y) * vy) / (vx * vx + vy * vy);
        t = t < 0 ? 0 : (t > 1 ? 1 : t);
        var px = a.x + vx * t, py = a.y + vy * t;
        var d = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
        var w = a.w + (b.w - a.w) * t;
        /* The wobble can widen the channel by at most 17%. If even that
           could not beat what is already found (or get below zero, which is
           all the answer cares about), the noise cannot change anything. */
        if (d - w * 1.17 >= Math.min(best, 0)) continue;
        w *= 1 + (GG.noise2(x / 70, y / 70, 11) - 0.5) * 0.34;
        if (d - w < best) { best = d - w; bestKind = (t > 0.5 ? b.kind : a.kind); }
      }
      if (best < 0) return bestKind;
      // the pond
      var dx = (x - POND_E.cx) / POND_E.rx, dy = (y - POND_E.cy) / POND_E.ry;
      var pd2 = dx * dx + dy * dy;
      if (pd2 < 1.08) {
        var wob = 1 + (GG.noise2(x / 90, y / 90, 3) - 0.5) * 0.16;
        if (pd2 < wob) return POND;
      }
      // the marsh leads, with ragged reedy edges
      for (i = 0; i < MARSH_POOLS.length; i++) {
        var m = MARSH_POOLS[i];
        var mx = (x - m.x) / m.rx, my = (y - m.y) / m.ry;
        var m2 = mx * mx + my * my;
        if (m2 >= 1.21) continue;
        var mw = 1 + (GG.noise2(x / 46, y / 46, 29) - 0.5) * 0.42;
        if (m2 < mw) return MARSH;
      }
      // and the sea fills everything below the tide line
      if (y > shoreY(x)) return SEA;
      return NONE;
    },

    buildWater: function () {
      var mw = this.MW = Math.ceil(this.W / MS), mh = this.MH = Math.ceil(this.H / MS);
      var kind = this.mask = new Uint8Array(mw * mh);
      var x, y, i;
      for (y = 0; y < mh; y++) {
        for (x = 0; x < mw; x++) {
          kind[y * mw + x] = this._kindAtRaw(x * MS + MS / 2, y * MS + MS / 2);
        }
      }
      function chamfer(test) {
        var d = new Uint16Array(mw * mh);
        var BIG = 9999;
        for (i = 0; i < d.length; i++) d[i] = test(kind[i]) ? 0 : BIG;
        for (y = 0; y < mh; y++) for (x = 0; x < mw; x++) {
          i = y * mw + x; var v = d[i];
          if (x > 0 && d[i - 1] + 1 < v) v = d[i - 1] + 1;
          if (y > 0 && d[i - mw] + 1 < v) v = d[i - mw] + 1;
          if (x > 0 && y > 0 && d[i - mw - 1] + 2 < v) v = d[i - mw - 1] + 2;
          if (x < mw - 1 && y > 0 && d[i - mw + 1] + 2 < v) v = d[i - mw + 1] + 2;
          d[i] = v;
        }
        for (y = mh - 1; y >= 0; y--) for (x = mw - 1; x >= 0; x--) {
          i = y * mw + x; var v2 = d[i];
          if (x < mw - 1 && d[i + 1] + 1 < v2) v2 = d[i + 1] + 1;
          if (y < mh - 1 && d[i + mw] + 1 < v2) v2 = d[i + mw] + 1;
          if (x < mw - 1 && y < mh - 1 && d[i + mw + 1] + 2 < v2) v2 = d[i + mw + 1] + 2;
          if (x > 0 && y < mh - 1 && d[i + mw - 1] + 2 < v2) v2 = d[i + mw - 1] + 2;
          d[i] = v2;
        }
        return d;
      }
      this.dShore = chamfer(function (k) { return k === NONE; });          // water: how deep
      this.dSea = chamfer(function (k) { return k === SEA || k === ESTUARY; });
      this.dRiver = chamfer(function (k) { return k === STREAM || k === RIVER; });
      this.dPool = chamfer(function (k) { return k === TIDEPOOL; });
    },

    maskIndex: function (x, y) {
      var mx = (x / MS) | 0, my = (y / MS) | 0;
      if (mx < 0) mx = 0; if (my < 0) my = 0;
      if (mx >= this.MW) mx = this.MW - 1;
      if (my >= this.MH) my = this.MH - 1;
      return my * this.MW + mx;
    },
    waterKind: function (x, y) { return this.mask[this.maskIndex(x, y)]; },
    isWater: function (x, y) { return this.mask[this.maskIndex(x, y)] !== NONE; },
    /* The stream and the tidepools are shallow enough to paddle through.
       Everything else is over her wellies. */
    isDeepWater: function (x, y) {
      var k = this.mask[this.maskIndex(x, y)];
      return k !== NONE && k !== TIDEPOOL && k !== STREAM;
    },
    /* 0 at the edge, 1 well out in the middle */
    waterDepth: function (x, y) {
      var i = this.maskIndex(x, y);
      if (this.mask[i] === NONE) return -1;
      return Math.min(1, this.dShore[i] / 9);
    },
    shoreY: shoreY,

    /* ---------- biomes ---------- */
    biomeLetter: function (x, y) {
      var cx = GG.clamp(Math.floor(x / CELL), 0, COLS - 1);
      var cy = GG.clamp(Math.floor(y / CELL), 0, ROWS - 1);
      return MAP[cy][cx];
    },
    biomeRaw: function (x, y) {
      var i = this.maskIndex(x, y);
      if (this.mask[i] !== NONE) {
        if (this.mask[i] === TIDEPOOL) return 'shore';
        if (this.mask[i] === SEA || this.mask[i] === ESTUARY) return 'beach';
        if (this.mask[i] === POND) return 'pond';
        if (this.mask[i] === MARSH) return 'swamp';
        return 'riverbank';
      }
      /* The inland edges of the sand and the rock wander about a bit, so the
         shore does not end in a ruler-straight line. The water edge itself
         stays exact. */
      var wob = (GG.noise2(x / 78, y / 78, 31) - 0.5) * 20;
      if (x > SHELF.x0 - 120 && this.dSea[i] < 30 + wob) return 'shore';
      if (this.dPool[i] < 13 + wob * 0.5) return 'shore';
      if (this.dSea[i] < 26 + wob) return 'beach';
      if (this.dRiver[i] < 15 + wob * 0.7) return 'riverbank';
      return LETTER[this.biomeLetter(x, y)];
    },
    biomeAt: function (x, y) {
      var wx = x + (GG.noise2(x / 110, y / 110, 7) - 0.5) * 150 + (GG.noise2(x / 34, y / 34, 17) - 0.5) * 44;
      var wy = y + (GG.noise2(x / 110, y / 110, 13) - 0.5) * 150 + (GG.noise2(x / 34, y / 34, 23) - 0.5) * 44;
      // the water-led biomes must not wobble, or the sand walks into the sea
      var hard = this.biomeRaw(x, y);
      if (hard === 'beach' || hard === 'shore' || hard === 'riverbank' || hard === 'pond') return hard;
      var soft = this.biomeRaw(wx, wy);
      if (soft === 'beach' || soft === 'shore' || soft === 'riverbank') return hard;
      return soft;
    },

    placeName: function (x, y) {
      var k = this.waterKind(x, y);
      if (k === SEA) return 'The Open Sea';
      if (k === ESTUARY) return 'Gull Inlet';
      if (k === RIVER) return 'Winding River';
      if (k === STREAM) return 'Pebble Stream';
      if (k === TIDEPOOL) return 'The Tidepools';
      if (k === POND) return 'Lily Pond';
      if (k === MARSH) return 'Cattail Marsh';
      return {
        meadow: 'Sunny Meadow', garden: 'Flower Garden', forest: 'Whispering Woods',
        pond: 'Lily Pond', hill: 'Pebble Hills', orchard: 'Apple Orchard',
        riverbank: 'Riverbank', beach: 'Shell Beach', shore: 'The Tidepools',
        desert: 'Sagebrush Desert', mountain: 'Cloudtop Ridge', taiga: 'Spruce Taiga',
        tundra: 'Lichen Tundra', rainforest: 'Mossy Rainforest', glade: 'Golden Glade',
        badlands: 'The Scablands', savanna: 'Oak Savanna', swamp: 'Cattail Marsh',
        bamboo: 'Bamboo Grove', cherry: 'Cherry Grove', birdtown: 'Bird Town',
        farmyard: 'The Farmyard', dogpark: 'Dog’s Paradise'
      }[this.biomeRaw(x, y)];
    },

    /* ---------- building ---------- */
    build: function () {
      this.buildWater();
      this.props = []; this.solids = []; this.grid = {}; this.gridN = []; this._colliders = [];
      var rnd = GG.mulberry32(20260912);
      var self = this;

      var skipAdd = false, inMain = false;
      function add(type, x, y, r, solid, rad, extra) {
        var p = { type: type, x: x, y: y, r: r, seed: rnd(), solid: !!solid, rad: rad || 0 };
        if (skipAdd) return p;
        /* The scattered things (not the hand-placed ones) do not go down
           on top of a solid thing already there: two trees growing out of
           one trunk looks broken. The dice are still rolled, so nothing
           else on the map moves. */
        if (inMain && p.solid && self.blocked(x, y, p.rad * 0.6)) return p;
        if (extra) for (var k in extra) p[k] = extra[k];
        self.props.push(p);
        if (p.solid) self._addSolid(p);
        return p;
      }

      var HOUSE = this.HOUSE;
      function nearHouse(x, y, pad) {
        return Math.abs(x - HOUSE.x) < HOUSE.w * 0.7 + (pad || 0) &&
               y > HOUSE.y - HOUSE.w * 1.3 - (pad || 0) && y < HOUSE.y + 60 + (pad || 0);
      }

      var FLOWER_COLS = ['#ff8fb0', '#ffd45c', '#c39bff', '#ff9a5c', '#fff0a8', '#8fd8ff', '#ff6f91'];

      inMain = true;
      for (var i = 0; i < 28000; i++) {
        var x = rnd() * this.W, y = rnd() * this.H;
        if (this.isWater(x, y)) continue;
        if (nearHouse(x, y, 40)) continue;
        if (this.onBridge(x, y, 26)) continue;
        var b = this.biomeAt(x, y);
        /* Dog's Paradise (v1.18) was meadow before it was a park. It still
           rolls the meadow's dice, so nothing anywhere else on the map moves,
           but it keeps none of what it rolls: the park is laid out by hand
           further down. */
        skipAdd = b === 'dogpark';
        if (skipAdd) b = 'meadow';
        var v = rnd();

        if (b === 'forest') {
          if (v < 0.125) add('tree', x, y, 34 + rnd() * 16, true, 14);
          else if (v < 0.185) add('pine', x, y, 40 + rnd() * 18, true, 12);
          else if (v < 0.235) add('bush', x, y, 22 + rnd() * 8, true, 13);
          else if (v < 0.325) add('mushroom', x, y, 12 + rnd() * 5);
          else if (v < 0.355) add('log', x, y, 22 + rnd() * 8, true, 18);
          else if (v < 0.385) add('stump', x, y, 18 + rnd() * 5, true, 14);
          else if (v < 0.78) add('grassTuft', x, y, 14 + rnd() * 7);
          else if (v < 0.86) add('flower', x, y, 10 + rnd() * 4, false, 0, { col: '#e9e2ff' });
        } else if (b === 'orchard') {
          if (v < 0.10) add('appleTree', x, y, 46 + rnd() * 14, true, 15);
          /* the berry rows at the ends of the orchard, and the low patch */
          else if (v < 0.20) add('berryBush', x, y, 22 + rnd() * 7, true, 13);
          else if (v < 0.215) add('fruitPatch', x, y, 17 + rnd() * 5);
          else if (v < 0.62) add('grassTuft', x, y, 13 + rnd() * 6);
          else if (v < 0.72) add('flower', x, y, 11 + rnd() * 4, false, 0, { col: GG.pick(FLOWER_COLS) });
        } else if (b === 'garden') {
          if (v < 0.035) add('tree', x, y, 38 + rnd() * 10, true, 14);
          else if (v < 0.07) add('bush', x, y, 20 + rnd() * 6, true, 12);
          else if (v < 0.42) add('tulip', x, y, 12 + rnd() * 5, false, 0, { col: GG.pick(FLOWER_COLS) });
          else if (v < 0.72) add('flower', x, y, 12 + rnd() * 5, false, 0, { col: GG.pick(FLOWER_COLS) });
          else if (v < 0.92) add('grassTuft', x, y, 12 + rnd() * 6);
        } else if (b === 'meadow') {
          if (v < 0.018) add('tree', x, y, 40 + rnd() * 16, true, 14);
          else if (v < 0.035) add('bush', x, y, 20 + rnd() * 7, true, 12);
          else if (v < 0.26) add('flower', x, y, 11 + rnd() * 5, false, 0, { col: GG.pick(FLOWER_COLS) });
          else if (v < 0.80) add('grassTuft', x, y, 13 + rnd() * 8);
        } else if (b === 'hill') {
          if (v < 0.12) add('rock', x, y, 16 + rnd() * 18, true, 15);
          /* the hills are where the wild fruit grows, so there is plenty of it */
          else if (v < 0.25) add('wildBush', x, y, 19 + rnd() * 6, true, 11);
          else if (v < 0.265) add('bush', x, y, 18 + rnd() * 6, true, 11);
          else if (v < 0.55) add('grassTuft', x, y, 10 + rnd() * 5);
          else if (v < 0.62) add('flower', x, y, 9 + rnd() * 3, false, 0, { col: '#ffe9a8' });
        } else if (b === 'pond') {
          var d = this.dShore[this.maskIndex(x, y)];
          if (v < 0.06) add('rock', x, y, 14 + rnd() * 10, true, 13);
          else if (v < 0.30) add('reed', x, y, 15 + rnd() * 7);
          else if (v < 0.70) add('grassTuft', x, y, 13 + rnd() * 6);
          else if (v < 0.78) add('flower', x, y, 10 + rnd() * 4, false, 0, { col: '#c6e9ff' });
        } else if (b === 'riverbank') {
          if (v < 0.05) add('willow', x, y, 46 + rnd() * 16, true, 15);
          else if (v < 0.10) add('bush', x, y, 20 + rnd() * 8, true, 12);
          else if (v < 0.20) add('rock', x, y, 12 + rnd() * 10, true, 12);
          else if (v < 0.46) add('reed', x, y, 16 + rnd() * 8);
          else if (v < 0.82) add('grassTuft', x, y, 13 + rnd() * 7);
          else if (v < 0.90) add('flower', x, y, 10 + rnd() * 4, false, 0, { col: '#fff0a8' });
        } else if (b === 'beach') {
          if (v < 0.030) add('palmGrass', x, y, 20 + rnd() * 10);
          else if (v < 0.055) add('driftwood', x, y, 22 + rnd() * 12, true, 16);
          else if (v < 0.085) add('shellProp', x, y, 9 + rnd() * 5);
          else if (v < 0.100) add('rock', x, y, 12 + rnd() * 8, true, 12);
          else if (v < 0.30) add('pebbles', x, y, 10 + rnd() * 6);
        } else if (b === 'shore') {
          if (v < 0.16) add('rock', x, y, 14 + rnd() * 16, true, 14);
          else if (v < 0.26) add('pebbles', x, y, 11 + rnd() * 7);
          else if (v < 0.34) add('shellProp', x, y, 9 + rnd() * 5);
          else if (v < 0.44) add('kelp', x, y, 16 + rnd() * 8);

        /* ---- the dry side of the mountains: cold shrub-steppe, not the Sahara ---- */
        } else if (b === 'desert') {
          if (v < 0.075) add('sagebrush', x, y, 26 + rnd() * 12, true, 13);
          else if (v < 0.110) add('rabbitbrush', x, y, 22 + rnd() * 8, true, 12);
          else if (v < 0.132) add('basalt', x, y, 20 + rnd() * 18, true, 16);
          else if (v < 0.150) add('pricklyPear', x, y, 15 + rnd() * 6, true, 13);
          else if (v < 0.180) add('balsamroot', x, y, 16 + rnd() * 6);
          else if (v < 0.40) add('bunchgrass', x, y, 15 + rnd() * 8);
          else if (v < 0.46) add('soilCrust', x, y, 16 + rnd() * 12);

        /* ---- up the ridge: talus, snowfields and the little alpine gardens ---- */
        } else if (b === 'mountain') {
          if (v < 0.085) add('talus', x, y, 18 + rnd() * 20, true, 17);
          else if (v < 0.135) add('subalpineFir', x, y, 44 + rnd() * 22, true, 11);
          else if (v < 0.155) add('krummholz', x, y, 22 + rnd() * 9, true, 15);
          else if (v < 0.195) add('heather', x, y, 15 + rnd() * 6);
          else if (v < 0.230) add('lupine', x, y, 17 + rnd() * 6);
          else if (v < 0.255) add('pasque', x, y, 15 + rnd() * 5);
          else if (v < 0.280) add('snowPatch', x, y, 26 + rnd() * 22);
          else if (v < 0.42) add('grassTuft', x, y, 10 + rnd() * 5);

        /* ---- the boreal forest: black spruce, moss hummocks and old burns ---- */
        } else if (b === 'taiga') {
          if (v < 0.105) add('blackSpruce', x, y, 48 + rnd() * 22, true, 12);
          else if (v < 0.130) add('snag', x, y, 44 + rnd() * 18, true, 11);
          else if (v < 0.155) add('deadfall', x, y, 24 + rnd() * 10, true, 18);
          else if (v < 0.190) add('labradorTea', x, y, 19 + rnd() * 6, true, 11);
          else if (v < 0.215) add('fireweed', x, y, 20 + rnd() * 7);
          else if (v < 0.34) add('mossHummock', x, y, 16 + rnd() * 10);
          else if (v < 0.48) add('grassTuft', x, y, 12 + rnd() * 6);

        /* ---- past the last tree: lichen, cushions and a willow you step over ---- */
        } else if (b === 'tundra') {
          if (v < 0.030) add('erratic', x, y, 22 + rnd() * 18, true, 18);
          else if (v < 0.085) add('arcticWillow', x, y, 15 + rnd() * 6);
          else if (v < 0.140) add('mossCampion', x, y, 12 + rnd() * 5);
          else if (v < 0.205) add('dryas', x, y, 13 + rnd() * 5);
          else if (v < 0.38) add('cottonGrass', x, y, 16 + rnd() * 7);
          else if (v < 0.58) add('reindeerLichen', x, y, 13 + rnd() * 7);

        /* ---- the wet side: every horizontal thing is furred with moss ---- */
        } else if (b === 'rainforest') {
          if (v < 0.042) add('mossyTrunk', x, y, 52 + rnd() * 26, true, 19);
          else if (v < 0.070) add('nurseLog', x, y, 28 + rnd() * 12, true, 20);
          else if (v < 0.098) add('vineMaple', x, y, 34 + rnd() * 14, true, 13);
          else if (v < 0.112) add('devilsClub', x, y, 22 + rnd() * 8, true, 12);
          else if (v < 0.30) add('swordFern', x, y, 20 + rnd() * 9);
          else if (v < 0.46) add('woodSorrel', x, y, 13 + rnd() * 6);
          else if (v < 0.50) add('mushroom', x, y, 12 + rnd() * 5);

        /* ---- the flood country: bare basalt, and ripples the size of dunes ---- */
        } else if (b === 'badlands') {
          if (v < 0.020) add('basaltColumn', x, y, 44 + rnd() * 16, true, 20);
          else if (v < 0.034) add('erratic', x, y, 24 + rnd() * 16, true, 18);
          else if (v < 0.058) add('scabRubble', x, y, 24 + rnd() * 12);
          else if (v < 0.072) add('currentRipple', x, y, 38 + rnd() * 17);
          else if (v < 0.086) add('scabPothole', x, y, 30 + rnd() * 16);
          else if (v < 0.120) add('sagebrush', x, y, 24 + rnd() * 10, true, 13);
          else if (v < 0.38) add('bunchgrass', x, y, 14 + rnd() * 8);
          else if (v < 0.47) add('soilCrust', x, y, 16 + rnd() * 12);

        /* ---- oak savanna: each tree throws its own island of shade ---- */
        } else if (b === 'savanna') {
          if (v < 0.022) add('garryOak', x, y, 45 + rnd() * 15, true, 17);
          else if (v < 0.034) add('cliffOak', x, y, 24 + rnd() * 12, true, 14);
          else if (v < 0.042) add('oakSnag', x, y, 38 + rnd() * 12, true, 12);
          else if (v < 0.066) add('acorns', x, y, 12 + rnd() * 6);
          else if (v < 0.080) add('oakGall', x, y, 16 + rnd() * 8);
          else if (v < 0.44) add('bunchgrass', x, y, 15 + rnd() * 9);
          else if (v < 0.50) add('flower', x, y, 10 + rnd() * 4, false, 0, { col: '#b9a6ff' });

        /* ---- the marsh: flat straps and round pencils, and everything doubled ---- */
        } else if (b === 'swamp') {
          if (v < 0.016) add('muskratLodge', x, y, 38 + rnd() * 12, true, 22);
          else if (v < 0.034) add('sunkLog', x, y, 30 + rnd() * 12, true, 20);
          else if (v < 0.044) add('boardwalk', x, y, 40 + rnd() * 15);
          else if (v < 0.115) add('duckweed', x, y, 28 + rnd() * 16);
          else if (v < 0.32) add('cattail', x, y, 28 + rnd() * 12);
          else if (v < 0.47) add('bulrush', x, y, 26 + rnd() * 12);
          else if (v < 0.62) add('reed', x, y, 16 + rnd() * 8);
          else if (v < 0.74) add('grassTuft', x, y, 13 + rnd() * 6);

        /* ---- a planted grove that got away from somebody ---- */
        } else if (b === 'bamboo') {
          if (v < 0.155) add('bamboo', x, y, 40 + rnd() * 15, true, 10);
          else if (v < 0.40) add('bambooShoot', x, y, 18 + rnd() * 8);
          else if (v < 0.60) add('grassTuft', x, y, 12 + rnd() * 6);

        /* ---- the cherry grove ---- */
        } else if (b === 'cherry') {
          if (v < 0.115) add('cherryTree', x, y, 44 + rnd() * 14, true, 15);
          else if (v < 0.185) add('petalDrift', x, y, 30 + rnd() * 14);
          else if (v < 0.60) add('grassTuft', x, y, 13 + rnd() * 6);
          else if (v < 0.72) add('flower', x, y, 11 + rnd() * 4, false, 0, { col: '#ffd6e4' });

        /* ---- bird town: boxes people put up, and the birds that use them ---- */
        } else if (b === 'birdtown') {
          if (v < 0.034) add('nestBox', x, y, 22 + rnd() * 8, true, 11);
          else if (v < 0.048) add('birdBath', x, y, 24 + rnd() * 8, true, 13);
          else if (v < 0.064) add('feederPole', x, y, 28 + rnd() * 10, true, 11);
          else if (v < 0.185) add('flower', x, y, 11 + rnd() * 5, false, 0, { col: '#8fd8ff' });
          else if (v < 0.72) add('grassTuft', x, y, 13 + rnd() * 7);

        /* ---- the farmyard ---- */
        } else if (b === 'farmyard') {
          if (v < 0.016) add('coop', x, y, 38 + rnd() * 12, true, 20);
          else if (v < 0.036) add('strawBale', x, y, 22 + rnd() * 8, true, 14);
          else if (v < 0.050) add('trough', x, y, 26 + rnd() * 8, true, 15);
          else if (v < 0.082) add('farmFence', x, y, 30 + rnd() * 10, true, 16);
          else if (v < 0.50) add('grassTuft', x, y, 11 + rnd() * 5);

        /* ---- the bright hole in the dark ceiling ---- */
        } else if (b === 'glade') {
          if (v < 0.014) add('fallenLog', x, y, 30 + rnd() * 12, true, 21);
          else if (v < 0.040) add('sunStump', x, y, 20 + rnd() * 6, true, 15);
          else if (v < 0.115) add('fireweed', x, y, 21 + rnd() * 7);
          else if (v < 0.175) add('pearly', x, y, 15 + rnd() * 6);
          else if (v < 0.245) add('bracken', x, y, 24 + rnd() * 9);
          else if (v < 0.285) add('thimbleberry', x, y, 21 + rnd() * 7, true, 12);
          else if (v < 0.70) add('grassTuft', x, y, 15 + rnd() * 8);
          else if (v < 0.80) add('flower', x, y, 11 + rnd() * 4, false, 0, { col: '#fff0a8' });
        }
      }
      /* (If the last square rolled happened to be in the dog park, this used
         to stay on and silently throw away everything placed below.) */
      skipAdd = false; inMain = false;
      /* the marsh's lodges, logs and boardwalks belong in the water */
      this._settleMarsh();

      // lily pads on the pond
      for (var j = 0; j < 34; j++) {
        var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.85;
        var lx = POND_E.cx + Math.cos(a) * POND_E.rx * rr;
        var ly = POND_E.cy + Math.sin(a) * POND_E.ry * rr;
        if (this.waterKind(lx, ly) === POND) add('lilypad', lx, ly, 20 + rnd() * 12);
      }
      // stepping stones and a few rocks in the stream
      for (var k2 = 0; k2 < 90; k2++) {
        var f = FLOW[Math.floor(rnd() * 5)];
        var sx = f.x + (rnd() - 0.5) * 120, sy = f.y + (rnd() - 0.5) * 120;
        if (this.waterKind(sx, sy) === STREAM) add('wetrock', sx, sy, 8 + rnd() * 7);
      }

      // the house and its garden
      for (var f2 = -3; f2 <= 3; f2++) {
        if (Math.abs(f2) < 1) continue;
        add('fence', HOUSE.x + f2 * 46, HOUSE.y + 66, 22, true, 16);
      }
      add('flower', HOUSE.x - 96, HOUSE.y - 10, 14, false, 0, { col: '#ff8fb0' });
      add('flower', HOUSE.x + 96, HOUSE.y - 10, 14, false, 0, { col: '#ffd45c' });
      this.hive = add('beehive', HOUSE.x + 150, HOUSE.y - 40, 26, true, 14);
      /* clear of the fence, so the rail does not run through the post */
      add('sign', HOUSE.x - 170, HOUSE.y + 56, 26, false, 0, { label: 'Home' });

      add('sign', 4180, 1660, 26, false, 0, { label: 'Meadow' });
      add('sign', 5400, 1860, 26, false, 0, { label: 'Woods' });
      add('sign', 4250, 2860, 26, false, 0, { label: 'Pond' });
      add('sign', 5480, 2240, 26, false, 0, { label: 'Orchard' });
      add('sign', 3620, 1520, 26, false, 0, { label: 'Hills' });
      add('sign', 4430, 2250, 26, false, 0, { label: 'Stream' });
      add('sign', 5500, 2960, 26, false, 0, { label: 'River' });
      add('sign', 6350, 3360, 26, false, 0, { label: 'Inlet' });
      add('sign', 5860, 3470, 26, false, 0, { label: 'Beach' });
      /* the six new places */
      add('sign', 2030, 2000, 26, false, 0, { label: 'Desert' });
      add('sign', 2780, 2330, 26, false, 0, { label: 'Ridge' });
      add('sign', 4880, 760, 26, false, 0, { label: 'Taiga' });
      add('sign', 4880, 250, 26, false, 0, { label: 'Tundra' });
      add('sign', 5810, 1640, 26, false, 0, { label: 'Glade' });
      add('sign', 7410, 2420, 26, false, 0, { label: 'Rainforest' });
      add('sign', BRIDGE.bx - BRIDGE.dy * 34, BRIDGE.by + BRIDGE.dx * 34, 26, false, 0, { label: 'Footbridge' });
      add('sign', 7200, 3160, 26, false, 0, { label: 'Tidepools' });
      /* the seven places from v1.14 */
      // duckweed rafts floating on the marsh leads (after everything else, so
      // the rest of the map's random layout is exactly what it was)
      for (var k3 = 0; k3 < 60; k3++) {
        var mp = MARSH_POOLS[Math.floor(rnd() * MARSH_POOLS.length)];
        var ma = rnd() * Math.PI * 2, mr = Math.sqrt(rnd()) * 0.8;
        var dxw = mp.x + Math.cos(ma) * mp.rx * mr, dyw = mp.y + Math.sin(ma) * mp.ry * mr;
        if (this.waterKind(dxw, dyw) === MARSH) add('duckweed', dxw, dyw, 22 + rnd() * 14);
      }
      skipAdd = false;
      /* The lava tube, and the boot brush that opens it. */
      this.caveMouth = add('caveMouth', 2480, 2180, 52, true, 30);
      this.bootBrush = add('bootBrush', 2578, 2246, 24, false, 0, {});
      add('sign', 2352, 2250, 26, false, 0, { label: 'Lava Tube' });
      add('sign', 620, 1900, 26, false, 0, { label: 'Scablands' });
      add('sign', 640, 3820, 26, false, 0, { label: 'Oak Savanna' });
      add('sign', 3250, 3392, 26, false, 0, { label: 'Cattail Marsh' });
      add('sign', 4460, 1780, 26, false, 0, { label: 'Bamboo' });
      add('sign', 6260, 2760, 26, false, 0, { label: 'Cherry Grove' });
      add('sign', 4380, 1420, 26, false, 0, { label: 'Bird Town' });
      add('sign', 4420, 3180, 26, false, 0, { label: 'Farmyard' });

      /* v1.18, last of all so everything above keeps exactly the place and
         the look it had: Dog's Paradise, and the new things to pick. */
      this.buildDogPark(add);
      this.buildBirdTown(add);
      this._clearSigns();
      this.plantPickables(add);
      this._lookAlikes();
      this._clearAroundPickables();

      this.props.push({ type: 'house', x: HOUSE.x, y: HOUSE.y, r: HOUSE.w, seed: 0.5, solid: false });
      this.chunks = null;
      this.reindex();
    },

    /* the solid props go into a 200 px grid for the collision test. Both a
       string-keyed one (friends.js walks it) and a numbered one (blocked()
       is called thousands of times a frame) are kept. */
    _addSolid: function (p) {
      this.solids.push(p);
      var gx = Math.floor(p.x / GS), gy = Math.floor(p.y / GS);
      var key = gx + ',' + gy;
      (this.grid[key] = this.grid[key] || []).push(p);
      var n = gkey(gx, gy);
      (this.gridN[n] = this.gridN[n] || []).push(p);
    },
    /* rebuild the collision lists from this.props (after props are taken out) */
    _rebuildSolids: function () {
      this.solids = []; this.grid = {}; this.gridN = [];
      for (var i = 0; i < this.props.length; i++) if (this.props[i].solid) this._addSolid(this.props[i]);
      var C = this._colliders || [];
      for (var j = 0; j < C.length; j++) this._addSolid(C[j]);
    },

    /* Sort the props by y and file them for drawing: the flat ones (painted
       with the ground) in one list, the standing ones in PCOL-wide columns.
       Called at the end of build(); call it again if props are ever added,
       removed or moved afterwards. */
    reindex: function () {
      this.props.sort(function (p, q) { return p.y - q.y; });
      var flat = [], cols = [], i, p, c;
      for (i = 0; i < this.props.length; i++) {
        p = this.props[i];
        if (FLAT[p.type] === 1) { flat.push(p); continue; }
        c = Math.max(0, Math.floor(p.x / PCOL));
        (cols[c] = cols[c] || []).push(p);
      }
      var colY = [];
      for (c = 0; c < cols.length; c++) {
        if (!cols[c]) continue;
        colY[c] = new Float64Array(cols[c].length);
        for (i = 0; i < cols[c].length; i++) colY[c][i] = cols[c][i].y;
      }
      var flatY = new Float64Array(flat.length);
      for (i = 0; i < flat.length; i++) flatY[i] = flat[i].y;
      this._pflat = flat; this._pflatY = flatY;
      this._pcols = cols; this._pcolY = colY;
      this._pcount = this.props.length;
    },

    /* ---------- Dog's Paradise (v1.18) ----------
       David: "add an area similar to bird town called Dog's Paradise". It
       is an off-leash dog park on the lawn west of the Flower Garden: an
       agility course in the middle, kennels to flop in, benches for the
       grown-ups, water bowls, and balls and bones dropped all over. */
    DOGPARK: { x0: 3200, y0: 1760, x1: 4000, y1: 2240, cx: 3600, cy: 2000 },
    buildDogPark: function (add) {
      var self = this, R = GG.mulberry32(20260922);
      var P = this.DOGPARK;
      function inPark(x, y, pad) {
        return !self.isWater(x, y) && self.biomeAt(x, y) === 'dogpark' &&
          self.biomeAt(x - pad, y) === 'dogpark' && self.biomeAt(x + pad, y) === 'dogpark' &&
          self.biomeAt(x, y - pad * 0.6) === 'dogpark' && self.biomeAt(x, y + pad * 0.6) === 'dogpark';
      }
      function put(type, x, y, r, solid, rad, extra) {
        if (self.isWater(x, y)) return null;
        if (solid && self.blocked(x, y, rad + 4)) return null;
        return add(type, x, y, r, solid, rad, extra);
      }
      /* the agility course: three jumps in a row, the weave poles, a tunnel */
      put('dogJump', 3470, 1930, 24, true, 9);
      put('dogJump', 3560, 1930, 24, true, 9);
      put('dogJump', 3650, 1930, 24, true, 9);
      put('dogWeave', 3780, 1950, 24, true, 10);
      put('dogTunnel', 3440, 2060, 28, true, 18);
      /* two kennels, with a bowl of water by each */
      put('dogHouse', 3300, 1860, 26, true, 18);
      put('dogBowl', 3342, 1880, 10);
      put('dogHouse', 3880, 1850, 26, true, 18);
      put('dogBowl', 3838, 1872, 10);
      /* benches for the grown-ups along the bottom, and a bowl between */
      put('parkBench', 3560, 2160, 24, true, 15);
      put('parkBench', 3760, 2150, 24, true, 15);
      put('dogBowl', 3660, 2168, 10);
      put('hydrant', 3700, 2060, 14, true, 7);
      put('hydrant', 3290, 2150, 14, true, 7);
      /* shade trees at the corners */
      put('tree', 3240, 1790, 40, true, 14);
      put('tree', 3930, 2200, 38, true, 14);
      put('tree', 3250, 2220, 36, true, 14);
      /* the sign at the path in from the garden */
      add('sign', 3960, 2080, 26, false, 0, { label: 'Dog’s Paradise' });
      /* then the lawn itself, and everything the dogs have dropped on it */
      var i, x, y, n;
      for (i = 0, n = 0; i < 900 && n < 90; i++) {
        x = P.x0 + R() * (P.x1 - P.x0); y = P.y0 + R() * (P.y1 - P.y0);
        if (!inPark(x, y, 4)) continue;
        n++;
        if (n % 7 === 0) add('flower', x, y, 10 + R() * 4, false, 0, { col: R() < 0.5 ? '#fff0a8' : '#ffffff' });
        else add('grassTuft', x, y, 12 + R() * 6);
      }
      for (i = 0, n = 0; i < 600 && n < 16; i++) {
        x = P.x0 + R() * (P.x1 - P.x0); y = P.y0 + R() * (P.y1 - P.y0);
        if (!inPark(x, y, 20) || this.blocked(x, y, 10)) continue;
        n++;
        if (n % 3 === 0) add('boneToy', x, y, 9, false, 0, { col: ['#f4f0e0', '#e0604a', '#5aa8e0'][n % 3] });
        else add('tennisBall', x, y, 4 + R() * 0.8);
      }
    },

    /* ---------- tidying after the scatter ---------- */

    /* take props out of the world, then rebuild the collision grid */
    _removeProps: function (dead) {
      if (!dead.size) return;
      this.props = this.props.filter(function (p) { return !dead.has(p); });
      this._rebuildSolids();
    },

    /* The muskrat lodges, the sunk logs and the boardwalks were scattered
       over the marsh's dry mud with everything else, which is not where any
       of them live. Each is moved to the nearest bit of marsh-pool edge,
       with its foot just in the water. */
    _settleMarsh: function () {
      var self = this, MK = { muskratLodge: 1, sunkLog: 1, boardwalk: 1 };
      var list = this.props.filter(function (p) { return MK[p.type] === 1; });
      var placed = [], moved = new Set();
      function wet(x, y) { return self.waterKind(x, y) === MARSH; }
      function edgeDepth(x, y) {
        var i = self.maskIndex(x, y);
        return self.mask[i] === MARSH ? self.dShore[i] : -1;
      }
      function clear(p, x, y) {
        for (var k = 0; k < placed.length; k++) {
          if (Math.hypot(placed[k].x - x, placed[k].y - y) < (p.type === 'boardwalk' ? 170 : 115)) return false;
        }
        var S = self.solids;
        for (var j = 0; j < S.length; j++) {
          var q = S[j];
          if (q === p || moved.has(q) || Math.abs(q.x - x) > 120 || Math.abs(q.y - y) > 120) continue;
          var dx = q.x - x, dy = (q.y - y) * 1.55, rr = q.rad + (p.rad || 20) + 6;
          if (dx * dx + dy * dy < rr * rr) return false;
        }
        return true;
      }
      function fits(p, x, y, relaxed) {
        var d = edgeDepth(x, y);
        if (d < 1 || d > (relaxed ? 4 : 2)) return false;
        if (p.type === 'boardwalk') {
          /* standing out from the north bank, both posts in the water */
          var hw = p.r * 1.5;
          if (!wet(x - hw * 0.8, y) || !wet(x + hw * 0.76, y)) return false;
          if (self.isWater(x, y - p.r * 0.9) && !relaxed) return false;
        } else if (p.type === 'sunkLog') {
          /* the far end under the water, the near end up on the bank */
          var flip = (((p.seed * 7) % 1) > 0.5) ? -1 : 1;
          if (!wet(x + flip * p.r * 0.9, y)) return false;
          if (!relaxed && wet(x - flip * p.r * 1.1, y - 8)) return false;
        } else if (!relaxed && !self.isWater(x, y + p.r * 0.3)) {
          return false;
        }
        return clear(p, x, y);
      }
      list.forEach(function (p) {
        var best = null, bd = Infinity, pass, dx, dy;
        for (pass = 0; pass < 2 && !best; pass++) {
          for (dy = -900; dy <= 900; dy += 8) {
            for (dx = -900; dx <= 900; dx += 8) {
              var d2 = dx * dx + dy * dy;
              if (d2 >= bd) continue;
              if (fits(p, p.x + dx, p.y + dy, pass === 1)) { bd = d2; best = [p.x + dx, p.y + dy]; }
            }
          }
        }
        if (!best) return;
        p.x = best[0]; p.y = best[1];
        moved.add(p);
        placed.push(p);
        if (p.type === 'boardwalk') {
          /* It is not something you walk under: posts along the deck stop
             her at the bank, where she stands behind the blind. */
          var hw2 = p.r * 1.5;
          for (var k = -3; k <= 3; k++) {
            self._colliders.push({ type: 'boardwalkPost', x: p.x + k * hw2 / 3.2, y: p.y - p.r * 0.3,
              r: p.r * 0.3, seed: 0, solid: true, rad: p.r * 0.26 });
          }
        }
      });
      this._rebuildSolids();
    },

    /* A signpost with a tree right in front of it (south of it, so drawn
       over it) cannot be read. Those trees go. */
    _clearSigns: function () {
      var signs = this.props.filter(function (p) { return p.type === 'sign'; });
      var dead = new Set();
      this.props.forEach(function (q) {
        if (TALL[q.type] !== 1) return;
        for (var i = 0; i < signs.length; i++) {
          var s = signs[i], dy = q.y - s.y;
          /* the wide crowns reach further sideways than 70 px */
          var reach = Math.max(70, q.r * (WIDE[q.type] || 1.1) + 30);
          if (Math.abs(q.x - s.x) < reach && dy > 0 && dy < 150) { dead.add(q); return; }
        }
      });
      this._removeProps(dead);
    },

    /* Is this a good place for something to pick? Not right by a signpost,
       and not tucked in behind a tree's canopy where she cannot see it. */
    _pickSpotOk: function (x, y) {
      var S = this._signList, T = this._tallGrid, i;
      for (i = 0; i < S.length; i++) {
        if (Math.abs(S[i].x - x) < 45 && Math.abs(S[i].y - y) < 45 &&
            Math.hypot(S[i].x - x, S[i].y - y) < 45) return false;
      }
      var gx = Math.floor(x / GS), gy = Math.floor(y / GS);
      for (var ax = -1; ax <= 1; ax++) {
        for (var ay = 0; ay <= 1; ay++) {
          var L = T[gkey(gx + ax, gy + ay)];
          if (!L) continue;
          for (i = 0; i < L.length; i++) {
            var q = L[i], dy = q.y - y;
            if (dy >= 0 && dy <= 140 && Math.abs(q.x - x) < q.r * 1.2) return false;
          }
        }
      }
      return true;
    },
    _prepPickSpots: function () {
      var T = [], S = [];
      this.props.forEach(function (q) {
        if (q.type === 'sign') S.push(q);
        if (TALL[q.type] === 1) { var n = gkey(Math.floor(q.x / GS), Math.floor(q.y / GS)); (T[n] = T[n] || []).push(q); }
      });
      this._tallGrid = T; this._signList = S;
    },

    /* Scenery that looks just like a plant she can pick, but is not, is a
       trap for a small child: she walks up, and nothing happens. So a few
       of those (about one in four, spread out) become real ones, and the
       rest are swapped for something that looks different. */
    _lookAlikes: function () {
      var self = this, planted = this.pickables || [];
      var TO = { fireweed: 'fireweed', lupine: 'lupine', balsamroot: 'arrowleaf_balsamroot', thimbleberry: 'thimbleberry' };
      var REST = { fireweed: { glade: 'bracken', taiga: 'grassTuft' }, lupine: 'heather', balsamroot: 'bunchgrass', thimbleberry: 'bush' };
      var got = {}, seen = {};
      var F = GG.FRUIT_BY_ID || {};
      this.props.forEach(function (p) {
        if (p.type === 'tulip') { p.type = 'flower'; return; }     // the garden's are plain flowers now
        var id = TO[p.type];
        if (!id) return;
        var def = F[id], biome = self.biomeAt(p.x, p.y), key = id + '@' + biome;
        seen[key] = (seen[key] || 0) + 1;
        var ok = def && GG.fruitGrowsIn && GG.fruitGrowsIn(def, biome) &&
          seen[key] % 4 === 1 && (got[key] || 0) < 5 && self._pickSpotOk(p.x, p.y);
        if (ok) {
          for (var k = 0; k < planted.length; k++) {
            if (Math.hypot(planted[k].x - p.x, (planted[k].y - p.y) * 1.3) < 90) { ok = false; break; }
          }
        }
        if (ok) {
          var flower = def.on === 'flower';
          p.type = flower ? 'pickFlower' : 'wildBerry';
          p.r = flower ? GG.clamp(p.r, 18, 23) : GG.clamp(p.r, 20, 24);
          p.pick = id; p.biome = biome;
          got[key] = (got[key] || 0) + 1;
          planted.push(p);
          return;
        }
        var r = REST[p.type];
        p.type = typeof r === 'string' ? r : (r[biome] || 'grassTuft');
      });
      this.pickables = planted;
    },

    /* and clear the grass and little flowers off each plant to pick, and out
       of the way in front of it, so it stands clear and easy to see */
    _clearAroundPickables: function () {
      var P = this.pickables || [], G = [], i;
      for (i = 0; i < P.length; i++) {
        var n = gkey(Math.floor(P[i].x / GS), Math.floor(P[i].y / GS));
        (G[n] = G[n] || []).push(P[i]);
      }
      var dead = new Set();
      this.props.forEach(function (q) {
        if (DECO[q.type] !== 1 || q.solid || q.pick) return;
        var gx = Math.floor(q.x / GS), gy = Math.floor(q.y / GS);
        for (var ax = -1; ax <= 1; ax++) for (var ay = -1; ay <= 1; ay++) {
          var L = G[gkey(gx + ax, gy + ay)];
          if (!L) continue;
          for (var k = 0; k < L.length; k++) {
            var pk = L[k], dx = (q.x - pk.x) / (pk.r * 1.1), dy = q.y - pk.y;
            dy /= dy > 0 ? pk.r * 1.5 : pk.r * 1.1;
            if (dx * dx + dy * dy < 1) { dead.add(q); return; }
          }
        }
      });
      this._removeProps(dead);
    },

    /* ---------- Bird Town ----------
       It was a meadow with one nest box, one bath and three feeders in it.
       Now the bath is in the middle of the green, with nest boxes and feeder
       poles round it and flowers for the insects the birds eat. */
    BIRDTOWN: { cx: 4380, cy: 1340, sign: { x: 4380, y: 1420 } },
    buildBirdTown: function (add) {
      var self = this, B = this.BIRDTOWN, SG = B.sign, placed = [];
      function ok(x, y, pad, edge) {
        var bm = self.biomeAt(x, y);
        return !self.isWater(x, y) && !self.isWater(x, y - 30) &&
          (bm === 'birdtown' || (edge && bm === 'meadow')) &&
          Math.hypot(x - SG.x, y - SG.y) > pad && self.dRiver[self.maskIndex(x, y)] > 8;
      }
      function put(type, x, y, r, solid, rad, extra, edge) {
        if (!ok(x, y, 70, edge)) return null;
        if (solid && self.blocked(x, y, rad + 16)) return null;
        var p = add(type, x, y, r, solid, rad, extra);
        placed.push(p);
        return p;
      }
      put('birdBath', B.cx, B.cy, 30, true, 14);
      /* a ring of nest boxes and feeder poles round the bath */
      var n = 10;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + i * Math.PI * 2 / n + 0.16;
        var x = B.cx + Math.cos(a) * 175, y = B.cy + Math.sin(a) * 84;
        /* the ring may lean out onto the meadow at the edge of the green */
        if (i % 2) put('feederPole', x, y, 32, true, 11, null, true);
        else put('nestBox', x, y, 26, true, 11, null, true);
      }
      /* two more boxes on the far side of the signpost */
      put('nestBox', B.cx - 150, B.cy + 190, 26, true, 11);
      put('nestBox', B.cx + 140, B.cy + 200, 26, true, 11);
      /* flowers round the bath */
      var cols = ['#8fd8ff', '#ff8fb0', '#ffd45c', '#c39bff', '#fff0a8', '#8fd8ff'];
      for (var j = 0; j < 9; j++) {
        var b2 = j * Math.PI * 2 / 9 + 0.3;
        var fx = B.cx + Math.cos(b2) * 66, fy = B.cy + 4 + Math.sin(b2) * 36;
        put('flower', fx, fy, 12, false, 0, { col: cols[j % cols.length] }, true);
      }
      /* and nothing scattered earlier left standing in the middle of them */
      var dead = new Set();
      this.props.forEach(function (q) {
        if (placed.indexOf(q) >= 0) return;
        if (!(DECO[q.type] === 1 || q.type === 'nestBox' || q.type === 'birdBath' || q.type === 'feederPole')) return;
        for (var k = 0; k < placed.length; k++) {
          var pk = placed[k];
          if (Math.hypot(q.x - pk.x, q.y - pk.y) < (pk.solid ? 44 : 18)) { dead.add(q); return; }
        }
      });
      this._removeProps(dead);
    },

    /* ---------- the new things to pick (v1.18) ----------
       Each vegetable, wild berry and flower is planted where it really
       grows, a few of each, and the plant knows what it carries from the
       start (p.pick). The fruit trees and the grape vine go into the orchard
       with the others instead. */
    plantPickables: function (add) {
      var self = this, R = GG.mulberry32(20260918);
      var LET = {};
      Object.keys(LETTER).forEach(function (k) { LET[LETTER[k]] = k; });
      var cells = {};
      for (var ry = 0; ry < ROWS; ry++) {
        for (var cx = 0; cx < COLS; cx++) {
          var L = MAP[ry][cx];
          (cells[L] = cells[L] || []).push([cx, ry]);
        }
      }
      var HOUSE = this.HOUSE;
      var planted = [];
      this._prepPickSpots();
      /* how many of each, per place */
      var COUNT = { veg: 2, berry: 3, fruit: 3, flower: 3 };
      function spot(biome, rad, gap) {
        var list = cells[LET[biome]];
        if (!list) return null;
        for (var a = 0; a < (rad >= 40 ? 4000 : 1500); a++) {
          var c0 = list[Math.floor(R() * list.length)];
          var x = (c0[0] + R()) * CELL, y = (c0[1] + R()) * CELL;
          if (x < 60 || y < 80 || x > self.W - 60 || y > self.H - 60) continue;
          if (self.isWater(x, y) || self.onBridge(x, y, 30)) continue;
          if (self.biomeAt(x, y) !== biome) continue;
          if (Math.abs(x - HOUSE.x) < HOUSE.w * 0.8 && y > HOUSE.y - HOUSE.w * 1.4 && y < HOUSE.y + 110) continue;
          if (self.blocked(x, y, rad + 10)) continue;
          if (rad >= 40 && self.solidWithin(x, y, 72)) continue;
          if (!self._pickSpotOk(x, y)) continue;
          var ok = true;
          for (var k = 0; k < planted.length; k++) {
            var q = planted[k];
            var dx = q.x - x, dy = (q.y - y) * 1.3;
            if (dx * dx + dy * dy < gap * gap) { ok = false; break; }
          }
          if (ok) return { x: x, y: y };
        }
        return null;
      }
      GG.FRUITS.forEach(function (def) {
        if (!def.autoDecor) return;
        var type = def.on === 'veg' ? 'vegPatch' : (def.on === 'flower' ? 'pickFlower'
          : ((def.on === 'wild' || def.on === 'low') ? 'wildBerry' : null));
        if (!type) return;
        var wheres = Array.isArray(def.where) ? def.where : [def.where];
        wheres.forEach(function (w) {
          var n = COUNT[def.kind] || 2;
          for (var i = 0; i < n; i++) {
            var r = type === 'pickFlower' ? 18 + R() * 4 : (def.on === 'low' ? 17 + R() * 4 : 20 + R() * 4);
            var solid = type === 'wildBerry' && def.on === 'wild';
            /* a bush needs room round it: jammed against a trunk it looks
               wrong and it walls in whoever is at the foot of the tree */
            var at = spot(w, solid ? 40 : (type === 'pickFlower' ? 20 : 16), type === 'vegPatch' ? 58 : 70);
            if (!at) break;
            var p = add(type, at.x, at.y, r, solid, solid ? 11 : 0, { pick: def.id, biome: w });
            planted.push(p);
          }
        });
      });
      this.pickables = planted;
    },

    /* is any solid thing's centre within d of (x, y)? */
    solidWithin: function (x, y, d) {
      for (var gx = -1; gx <= 1; gx++) {
        for (var gy = -1; gy <= 1; gy++) {
          var list = this.gridN[gkey(Math.floor(x / GS) + gx, Math.floor(y / GS) + gy)];
          if (!list) continue;
          for (var i = 0; i < list.length; i++) {
            if (Math.hypot(list[i].x - x, list[i].y - y) < d) return true;
          }
        }
      }
      return false;
    },

    /* ---------- collision ---------- */
    blocked: function (x, y, rad) {
      if (x < 24 || y < 40 || x > this.W - 24 || y > this.H - 24) return true;
      if (this.isDeepWater(x, y) && !this.onBridge(x, y, 6)) return true;   // the stream and the pools are waded, not blocked
      var H = this.HOUSE;
      if (x > H.x - H.w / 2 - rad && x < H.x + H.w / 2 + rad &&
          y > H.y - H.w * 0.72 - rad && y < H.y + 3) return true;   // to the very front of the wall, so she is never hidden behind it
      var G = this.gridN, cx = Math.floor(x / GS), cy = Math.floor(y / GS);
      for (var gx = -1; gx <= 1; gx++) {
        for (var gy = -1; gy <= 1; gy++) {
          var list = G[gkey(cx + gx, cy + gy)];
          if (!list) continue;
          for (var i = 0; i < list.length; i++) {
            var p = list[i];
            var dx = x - p.x, dy = (y - p.y) * 1.55;
            var rr = p.rad + rad;
            if (dx * dx + dy * dy < rr * rr) return true;
          }
        }
      }
      return false;
    },

    /* ---------- painting the ground ---------- */
    waterRGB: function (kind, depth) {
      var shallow, deep;
      if (kind === SEA) { shallow = [126, 214, 224]; deep = [26, 92, 150]; }
      else if (kind === ESTUARY) { shallow = [148, 198, 190]; deep = [56, 118, 136]; }
      else if (kind === RIVER) { shallow = [126, 198, 214]; deep = [58, 134, 168]; }
      else if (kind === STREAM) { shallow = [160, 220, 228]; deep = [96, 176, 200]; }
      else if (kind === TIDEPOOL) { shallow = [150, 214, 216]; deep = [86, 168, 178]; }
      else if (kind === MARSH) { shallow = [122, 150, 112]; deep = [52, 82, 66]; }   // tea-dark marsh water
      else { shallow = [126, 200, 214]; deep = [61, 147, 184]; }
      var t = GG.clamp(depth, 0, 1);
      return [shallow[0] + (deep[0] - shallow[0]) * t,
              shallow[1] + (deep[1] - shallow[1]) * t,
              shallow[2] + (deep[2] - shallow[2]) * t];
    },

    waterColour: function (kind, depth) {
      var c = this.waterRGB(kind, depth);
      return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
    },

    /* The biome of every GSTEP-sized cell of a chunk (plus a margin of GPADC
       cells all round), worked out once and shared by the ground colour and
       the blotches. */
    _bioGrid: function (cx, cy) {
      var C = this.CHUNK, n = C / GSTEP + GPADC * 2, out = new Array(n * n);
      for (var y = 0; y < n; y++) {
        for (var x = 0; x < n; x++) {
          out[y * n + x] = this._paintBiome(cx * C + (x - GPADC) * GSTEP + GSTEP / 2,
                                            cy * C + (y - GPADC) * GSTEP + GSTEP / 2);
        }
      }
      return out;
    },
    /* biomeAt, for painting only: where the beach's wobbly inland edge dips
       and leaves a little pocket of riverbank or meadow with sand all round
       it (there was one by the Footbridge sign), paint it as sand. The
       props were placed with biomeAt itself, so nothing moves. */
    _paintBiome: function (x, y) {
      var b = this.biomeAt(x, y);
      if (b === 'beach' || b === 'shore' || this.mask[this.maskIndex(x, y)] !== NONE) return b;
      if (this.dSea[this.maskIndex(x, y)] > 40) return b;
      var R = 40, sand = 0;
      if (this.biomeAt(x - R, y) === 'beach') sand++;
      if (this.biomeAt(x + R, y) === 'beach') sand++;
      if (this.biomeAt(x, y - R) === 'beach') sand++;
      if (sand >= 2 && this.biomeAt(x, y + R) === 'beach') sand++;
      return sand >= 4 || (sand === 3 && this.dSea[this.maskIndex(x, y)] < 30) ? 'beach' : b;
    },

    _blotch: function (c, cx, cy, bio) {
      var C = this.CHUNK, PS = GSTEP, pad = GPADC;
      var n = Math.ceil(C / PS) + pad * 2;
      var lay = document.createElement('canvas');
      lay.width = n; lay.height = n;
      var lc = lay.getContext('2d');
      var img = lc.createImageData(n, n), px = img.data;
      var any = false, x, y, q;
      for (y = 0; y < n; y++) {
        for (x = 0; x < n; x++) {
          var wx = cx * C + (x - pad) * PS + PS / 2;
          var wy = cy * C + (y - pad) * PS + PS / 2;
          var o = (y * n + x) * 4;
          var pt = PATCH[bio[y * n + x]];
          if (!pt) { px[o + 3] = 0; continue; }
          /* a wobble on the sample point, so a patch ends in a crumbly line */
          var jx = wx + (GG.noise2(wx / 11, wy / 11, 53) - 0.5) * 26;
          var jy = wy + (GG.noise2(wx / 11, wy / 11, 59) - 0.5) * 26;
          var hit = null;
          for (q = 0; q < pt.length; q++) {
            if (GG.noise2(jx / pt[q][3], jy / pt[q][3], pt[q][5]) > pt[q][4]) { hit = pt[q]; break; }
          }
          if (!hit) { px[o + 3] = 0; continue; }
          any = true;
          px[o] = hit[0]; px[o + 1] = hit[1]; px[o + 2] = hit[2]; px[o + 3] = 255;
        }
      }
      if (!any) return;
      lc.putImageData(img, 0, 0);
      c.save();
      c.globalAlpha = 0.88;
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(lay, 0, 0, n, n, -pad * PS, -pad * PS, n * PS, n * PS);
      c.restore();
    },

    /* The painted ground is cached a chunk at a time. Only the most
       recently used CHUNK_CAP chunks are kept (a Map remembers the order
       they were put in, so the first key is always the stalest one). */
    chunkCanvas: function (cx, cy) {
      var key = cy * 1000 + cx;
      var M = this.chunks || (this.chunks = new Map());
      var hit = M.get(key);
      if (hit) {
        M.delete(key); M.set(key, hit);
        return hit;
      }
      var cv = this._paintChunk(cx, cy);
      M.set(key, cv);
      if (M.size > CHUNK_CAP) M.delete(M.keys().next().value);
      return cv;
    },
    hasChunk: function (cx, cy) { return !!(this.chunks && this.chunks.has(cy * 1000 + cx)); },

    /* Paint at most one ground chunk that is not on screen yet but is about
       to be - the next row or column the way she is walking - so the frame
       that scrolls it in does not have to paint it. Call it once a frame
       from the main loop when there is time to spare. Returns true if it
       painted one. */
    prewarm: function (cam, vw, vh, dirx, diry) {
      var C = this.CHUNK;
      var x0 = Math.floor(cam.x / C), x1 = Math.floor((cam.x + vw) / C);
      var y0 = Math.floor(cam.y / C), y1 = Math.floor((cam.y + vh) / C);
      /* anything on screen first (normally already there), then one ring out,
         the side she is heading for first */
      var sx = dirx > 0 ? 1 : (dirx < 0 ? -1 : 0), sy = diry > 0 ? 1 : (diry < 0 ? -1 : 0);
      var cand = [], cx, cy;
      for (cy = y0 - 1; cy <= y1 + 1; cy++) {
        for (cx = x0 - 1; cx <= x1 + 1; cx++) {
          if (cx < 0 || cy < 0 || cx * C >= this.W || cy * C >= this.H) continue;
          if (this.hasChunk(cx, cy)) continue;
          var on = cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
          var ahead = (sx && (sx > 0 ? cx > x1 : cx < x0)) || (sy && (sy > 0 ? cy > y1 : cy < y0));
          cand.push({ cx: cx, cy: cy, s: on ? 0 : (ahead ? 1 : 2) });
        }
      }
      if (!cand.length) return false;
      cand.sort(function (a, b) { return a.s - b.s; });
      /* never let prewarming push out a chunk that is on screen */
      if (cand[0].s === 2 && this.chunks && this.chunks.size >= CHUNK_CAP) return false;
      this.chunkCanvas(cand[0].cx, cand[0].cy);
      return true;
    },

    _paintChunk: function (cx, cy) {
      var C = this.CHUNK;
      var cv = document.createElement('canvas');
      cv.width = C; cv.height = C;
      var c = cv.getContext('2d');
      var x, y, wx, wy, k;

      /* The ground colour, one sample per GSTEP cell, blown up smoothly (the
         same trick as the water and the blotches), so the edge between two
         places curves instead of stepping in big squares. Each sample also
         gets a tiny grain of its own, so the grass stays speckled instead of
         going soft. The damp sand at the water's edge goes in here too. */
      var bio = this._bioGrid(cx, cy);
      var n = C / GSTEP + GPADC * 2;
      var glay = document.createElement('canvas');
      glay.width = n; glay.height = n;
      var gctx = glay.getContext('2d');
      var gimg = gctx.createImageData(n, n), gp = gimg.data;
      for (y = 0; y < n; y++) {
        for (x = 0; x < n; x++) {
          k = y * n + x;
          wx = cx * C + (x - GPADC) * GSTEP + GSTEP / 2;
          wy = cy * C + (y - GPADC) * GSTEP + GSTEP / 2;
          var pal = GROUND_RGB[bio[k]] || GROUND_RGB.meadow;
          var sh3 = GG.noise2(wx / 26, wy / 26, 21);
          var rgb = pal[GG.clamp((sh3 * 3) | 0, 0, 2)];
          var grain = (GG.hash2(Math.floor(wx / GSTEP), Math.floor(wy / GSTEP), 77) - 0.5) * GRAIN;
          var r0 = rgb[0] + grain, g0 = rgb[1] + grain, b0 = rgb[2] + grain;
          var mi = this.maskIndex(wx, wy);
          if (this.mask[mi] === NONE) {
            var damp = (GG.noise2(wx / 30, wy / 30, 41) - 0.5) * 3.4;
            if (this.dSea[mi] <= 4.5 + damp || this.dPool[mi] <= 2.5 + damp) {
              r0 += (196 - r0) * 0.55; g0 += (176 - g0) * 0.55; b0 += (132 - b0) * 0.55;
            }
          }
          var o4 = k * 4;
          gp[o4] = r0; gp[o4 + 1] = g0; gp[o4 + 2] = b0; gp[o4 + 3] = 255;
        }
      }
      gctx.putImageData(gimg, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(glay, 0, 0, n, n, -GPADC * GSTEP, -GPADC * GSTEP, n * GSTEP, n * GSTEP);
      /* Smoothed all over, the grass goes soft and loses its speckle. So the
         same samples go down again as crisp little squares everywhere except
         in a band two cells wide along the edge between two places, where
         the smooth layer underneath is left to show. */
      var edge = new Uint8Array(n * n);
      for (y = 0; y < n; y++) {
        for (x = 0; x < n; x++) {
          var bb = bio[y * n + x];
          if ((x + 1 < n && bio[y * n + x + 1] !== bb) || (y + 1 < n && bio[(y + 1) * n + x] !== bb)) {
            for (var ey = Math.max(0, y - 1); ey <= Math.min(n - 1, y + 2); ey++) {
              for (var ex = Math.max(0, x - 1); ex <= Math.min(n - 1, x + 2); ex++) edge[ey * n + ex] = 1;
            }
          }
        }
      }
      for (k = 0; k < n * n; k++) if (edge[k]) gp[k * 4 + 3] = 0;
      gctx.putImageData(gimg, 0, 0);
      c.imageSmoothingEnabled = false;
      c.drawImage(glay, 0, 0, n, n, -GPADC * GSTEP, -GPADC * GSTEP, n * GSTEP, n * GSTEP);
      c.imageSmoothingEnabled = true;

      /* The big blotches of the newer places - drifts of straw between the
         sagebrush, lichen heath on the tundra, a patch of alpine turf between
         two slabs of talus. Painted at one pixel per eight and then blown up
         smoothly, the same trick as the water, so they melt into each other
         instead of stepping. Real ground is a patchwork, and one flat colour
         per place looks like a bedsheet. */
      this._blotch(c, cx, cy, bio);

      /* The water goes onto a little canvas one pixel per mask cell, then gets
         blown up smoothly over the ground, so the banks curve instead of
         stepping. One extra cell all round keeps the edges honest. */
      var pad = 3;
      var mw = Math.ceil(C / MS) + pad * 2, mh = mw;
      var lay = document.createElement('canvas');
      lay.width = mw; lay.height = mh;
      var lc = lay.getContext('2d');
      var img = lc.createImageData(mw, mh);
      var px = img.data;
      for (y = 0; y < mh; y++) {
        for (x = 0; x < mw; x++) {
          wx = cx * C + (x - pad) * MS + MS / 2;
          wy = cy * C + (y - pad) * MS + MS / 2;
          var idx = this.maskIndex(wx, wy);
          var k = this.mask[idx];
          var o = (y * mw + x) * 4;
          if (k === NONE ||
              wx < 0 || wy < 0 || wx >= this.W || wy >= this.H) { px[o + 3] = 0; continue; }
          var dep = Math.min(1, this.dShore[idx] / 10);
          var rgb = this.waterRGB(k, dep);
          if (this.dShore[idx] <= 1) {
            rgb = [rgb[0] + (255 - rgb[0]) * 0.34,
                   rgb[1] + (255 - rgb[1]) * 0.34,
                   rgb[2] + (255 - rgb[2]) * 0.34];
          }
          px[o] = rgb[0]; px[o + 1] = rgb[1]; px[o + 2] = rgb[2]; px[o + 3] = 255;
        }
      }
      lc.putImageData(img, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(lay, 0, 0, mw, mh, -pad * MS, -pad * MS, mw * MS, mh * MS);

      return cv;
    },

    drawGround: function (c, cam, vw, vh) {
      var C = this.CHUNK;
      var x0 = Math.floor(cam.x / C), x1 = Math.floor((cam.x + vw) / C);
      var y0 = Math.floor(cam.y / C), y1 = Math.floor((cam.y + vh) / C);
      for (var cy = y0; cy <= y1; cy++) {
        for (var cx = x0; cx <= x1; cx++) {
          if (cx < 0 || cy < 0 || cx * C >= this.W || cy * C >= this.H) continue;
          /* one pixel of overlap, so a chunk edge that lands between two
             screen pixels never shows a hairline of the dark canvas behind */
          c.drawImage(this.chunkCanvas(cx, cy), cx * C - cam.x, cy * C - cam.y, C + 1, C + 1);
        }
      }
    },

    /* sparkles, currents and surf, drawn live on top of the water */
    drawWater: function (c, cam, t, vw, vh) {
      var step = 26;
      var x0 = Math.floor(cam.x / step) * step, y0 = Math.floor(cam.y / step) * step;
      c.save();
      c.lineCap = 'round';
      for (var y = y0; y < cam.y + vh + step; y += step) {
        for (var x = x0; x < cam.x + vw + step; x += step) {
          var i = this.maskIndex(x, y);
          var k = this.mask[i];
          if (k === NONE) continue;
          var sx = x - cam.x, sy = y - cam.y;
          var h = GG.hash2(x / step | 0, y / step | 0, 5);
          var edge = this.dShore[i];

          if (k === SEA || k === ESTUARY) {
            if (edge <= 3) {
              // surf along the shore
              var f = 0.5 + 0.5 * Math.sin(t * 1.5 + x * 0.01);
              c.strokeStyle = 'rgba(255,255,255,' + (0.30 + 0.4 * f).toFixed(2) + ')';
              c.lineWidth = 2.4;
              c.beginPath();
              c.moveTo(sx - 12, sy + Math.sin(x * 0.05 + t * 2) * 2);
              c.lineTo(sx + 12, sy + Math.sin(x * 0.05 + 1 + t * 2) * 2);
              c.stroke();
            } else if (h > 0.72) {
              c.strokeStyle = 'rgba(255,255,255,0.26)';
              c.lineWidth = 2;
              var off = Math.sin(t * 0.8 + h * 9) * 7;
              c.beginPath();
              c.moveTo(sx - 9 + off, sy);
              c.quadraticCurveTo(sx + off, sy - 3.5, sx + 9 + off, sy);
              c.stroke();
            }
          } else if (k === RIVER || k === STREAM) {
            if (h > 0.55) {
              // current streaks that slide downstream
              var slide = ((t * 34 + h * 200) % 90) - 45;
              c.strokeStyle = 'rgba(255,255,255,' + (k === STREAM ? 0.34 : 0.24) + ')';
              c.lineWidth = 1.6;
              c.beginPath();
              c.moveTo(sx - 7 + slide * 0.55, sy - 5 + slide * 0.42);
              c.lineTo(sx + 5 + slide * 0.55, sy + 3 + slide * 0.42);
              c.stroke();
            }
          } else if (k === TIDEPOOL) {
            if (h > 0.6) {
              c.strokeStyle = 'rgba(255,255,255,0.30)';
              c.lineWidth = 1.4;
              c.beginPath();
              c.arc(sx, sy, 5 + Math.sin(t * 1.6 + h * 8) * 1.6, 0.3, 2.4);
              c.stroke();
            }
          } else if (k === POND || k === MARSH) {
            if (h > (k === MARSH ? 0.82 : 0.7)) {
              c.strokeStyle = 'rgba(255,255,255,0.28)';
              c.lineWidth = 2.2;
              var o2 = Math.sin(t * 0.9 + h * 9) * 7;
              c.beginPath();
              c.moveTo(sx - 9 + o2, sy);
              c.quadraticCurveTo(sx + o2, sy - 3.5, sx + 9 + o2, sy);
              c.stroke();
            }
          }
        }
      }
      c.restore();
    },

    /* The footbridge. Drawn after the water and before anything that walks,
       so Guin and her friends cross on top of it. */
    drawBridge: function (c, cam, t) {
      var B = BRIDGE;
      var mx = B.x - cam.x, my = B.y - cam.y;
      if (mx < -B.len || my < -B.len || mx > GG.view.w + B.len || my > GG.view.h + B.len) return;
      c.save();
      c.translate(mx, my);
      c.rotate(B.ang);
      var L = B.len, W = B.w;

      /* the shadow it casts on the water */
      c.fillStyle = 'rgba(20,40,60,0.22)';
      c.fillRect(-L / 2 + 3, -W / 2 + 5, L, W);

      /* the two stringers under the planks */
      c.fillStyle = '#6b4a2c';
      c.fillRect(-L / 2, -W / 2 - 1, L, W + 2);

      /* the planks, laid across */
      var planks = Math.round(L / 9);
      for (var i = 0; i < planks; i++) {
        var px = -L / 2 + (i + 0.06) * (L / planks);
        var shade = (i % 3 === 0) ? '#a07a4c' : (i % 3 === 1 ? '#b08a58' : '#97713f');
        c.fillStyle = shade;
        c.fillRect(px, -W / 2 + 1, L / planks - 1.4, W - 2);
      }
      /* the worn line down the middle where everybody walks */
      c.fillStyle = 'rgba(255,240,210,0.10)';
      c.fillRect(-L / 2, -3.5, L, 7);

      /* the rails, one each side, with posts */
      [-1, 1].forEach(function (side) {
        var ry = side * (W / 2 + 1);
        c.fillStyle = '#5c3f26';
        c.fillRect(-L / 2, ry - 2, L, 4);
        c.fillStyle = '#8a6438';
        c.fillRect(-L / 2, ry - 8.5, L, 3.2);
        for (var k = 0; k <= 7; k++) {
          var qx = -L / 2 + k * (L / 7);
          c.fillStyle = '#6b4a2c';
          c.fillRect(qx - 2, ry - 9.5, 4, 11);
        }
      });

      /* a plank or two missing a nail, for character */
      c.strokeStyle = 'rgba(70,45,25,0.5)'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(-L * 0.18, -W / 2 + 2); c.lineTo(-L * 0.18, W / 2 - 2); c.stroke();
      c.beginPath(); c.moveTo(L * 0.27, -W / 2 + 2); c.lineTo(L * 0.27, W / 2 - 2); c.stroke();
      c.restore();
    },

    /* Paint the props of one layer: 'flat' (the ones that lie on the
       ground), 'sorted' (the standing ones, in y order) or, with no layer,
       all of them in y order. */
    drawProps: function (c, cam, vw, vh, t, layer) {
      if (this._pcount !== this.props.length) this.reindex();
      var P = GG.Props, i, p, fn;
      if (layer !== 'flat') {
        var list = this.sortedProps(cam, vw, vh);
        if (layer !== 'sorted') {
          /* everything: fold the flat ones in, then one sort */
          list = list.slice();
          this._flatVisible(cam, vw, vh, list);
        }
        list.sort(function (a, b) { return a.y - b.y; });
        for (i = 0; i < list.length; i++) {
          p = list[i]; fn = P[p.type];
          if (fn) fn(c, p.x - cam.x, p.y - cam.y, p.r, t, p.seed, p.col || p.label, p);
        }
        return;
      }
      var F = this._pflat, FY = this._pflatY;
      var x0 = cam.x - CULL_SIDE, x1 = cam.x + vw + CULL_SIDE, y1 = cam.y + vh + CULL_DOWN;
      for (i = lowerBound(FY, cam.y - CULL_UP); i < F.length; i++) {
        p = F[i];
        if (p.y > y1) break;
        if (p.x < x0 || p.x > x1) continue;
        fn = P[p.type];
        if (fn) fn(c, p.x - cam.x, p.y - cam.y, p.r, t, p.seed, p.col || p.label, p);
      }
    },
    _flatVisible: function (cam, vw, vh, out) {
      var F = this._pflat, FY = this._pflatY;
      var x0 = cam.x - CULL_SIDE, x1 = cam.x + vw + CULL_SIDE, y1 = cam.y + vh + CULL_DOWN;
      for (var i = lowerBound(FY, cam.y - CULL_UP); i < F.length; i++) {
        var p = F[i];
        if (p.y > y1) break;
        if (p.x >= x0 && p.x <= x1) out.push(p);
      }
      return out;
    },

    /* The standing props that can show on screen, for the caller to sort
       in among Guin and the animals. Each column comes out in y order; the
       columns are not merged, so sort by y before drawing. The array is
       reused from frame to frame - copy it if you need to keep it. */
    sortedProps: function (cam, vw, vh) {
      if (this._pcount !== this.props.length) this.reindex();
      var out = this._pout || (this._pout = []);
      out.length = 0;
      var x0 = cam.x - CULL_SIDE, x1 = cam.x + vw + CULL_SIDE;
      var y0 = cam.y - CULL_UP, y1 = cam.y + vh + CULL_DOWN;
      var cols = this._pcols, colY = this._pcolY;
      var c0 = Math.max(0, Math.floor(x0 / PCOL)), c1 = Math.min(cols.length - 1, Math.floor(x1 / PCOL));
      for (var c = c0; c <= c1; c++) {
        var L = cols[c];
        if (!L) continue;
        for (var i = lowerBound(colY[c], y0); i < L.length; i++) {
          var p = L[i];
          if (p.y > y1) break;
          if (p.x < x0 || p.x > x1) continue;
          out.push(p);
        }
      }
      return out;
    }
  };
})(window.GG = window.GG || {});
