/* The open world: hills, meadow, garden, woods, orchard, a pond,
   a stream that becomes a river, an estuary, a beach and the sea. */
(function (GG) {
  'use strict';

  var CELL = 160, COLS = 30, ROWS = 20;
  // H hill  M meadow  G garden  F forest  O orchard  P pond bank
  var MAP = [
    'HHHHHMMMMFFFFFFFFFFFFFFFFFFFFF',
    'HHHHHMMMMFFFFFFFFFFFFFFFFFFFFF',
    'HHHHMMMMMMFFFFFFFFFFFFFFFFFFFF',
    'HHHMMMMMMMFFFFFFFFFFFFFFFFFFFF',
    'HHMMMMMMMMMFFFFFFFFFFFFFFFFFFF',
    'MMMMMMMMMMMMFFFFFFFFFFFFFFFFFF',
    'MMMMMMMGGGGGOOOOOFFFFFFFFFFFFF',
    'MMMMMMGGGGGGOOOOOOFFFFFFFFFFFF',
    'PPMMMMGGGGGGGOOOOOOFFFFFFFFFFF',
    'PPPMMMGGGGGGGOOOOOOFFFFFFFFFFF',
    'PPPPMMGGGGGGGOOOOOMMMFFFFFFFFF',
    'PPPPPMMGGGGGGOOOOMMMMMMFFFFFFF',
    'PPPPPMMMGGGGMMMMMMMMMMMMMFFFFF',
    'PPPPMMMMMMMMMMMMMMMMMMMMMMMFFF',
    'PPPMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM'
  ];
  var LETTER = { M: 'meadow', G: 'garden', F: 'forest', P: 'pond', H: 'hill', O: 'orchard' };

  /* water kinds */
  var NONE = 0, POND = 1, STREAM = 2, RIVER = 3, ESTUARY = 4, SEA = 5, TIDEPOOL = 6;

  var GROUND = {
    meadow: ['#8ecf63', '#83c55a', '#98d76d'],
    garden: ['#9ad96f', '#90d065', '#a5e17b'],
    forest: ['#4f9450', '#478a49', '#589c58'],
    pond: ['#9dcf7e', '#94c777', '#a7d78a'],
    hill: ['#c3bf94', '#b8b489', '#cdc9a0'],
    orchard: ['#a3d46a', '#99cb60', '#aeda78'],
    riverbank: ['#7fc472', '#74ba67', '#8cd07f'],
    beach: ['#efe0b4', '#e8d6a6', '#f5e9c2'],
    shore: ['#b9b3a4', '#aaa595', '#c6c0b0']
  };

  var POND_E = { cx: 620, cy: 2020, rx: 460, ry: 300 };

  /* the stream grows into a river and then opens into the estuary */
  var FLOW = [
    { x: 520,  y: 260,  w: 13, kind: STREAM },
    { x: 700,  y: 560,  w: 15, kind: STREAM },
    { x: 900,  y: 880,  w: 17, kind: STREAM },
    { x: 1060, y: 1210, w: 20, kind: STREAM },
    { x: 1180, y: 1560, w: 24, kind: STREAM },
    { x: 1370, y: 1860, w: 31, kind: RIVER },
    { x: 1700, y: 2030, w: 42, kind: RIVER },
    { x: 2080, y: 2150, w: 52, kind: RIVER },
    { x: 2450, y: 2230, w: 64, kind: RIVER },
    { x: 2790, y: 2330, w: 82, kind: RIVER },
    { x: 3070, y: 2520, w: 125, kind: ESTUARY },
    { x: 3290, y: 2770, w: 180, kind: ESTUARY },
    { x: 3470, y: 2910, w: 245, kind: ESTUARY }
  ];

  /* the sea fills everything below this line */
  function shoreY(x) {
    return 3050 - (x / 4800) * 760
      + Math.sin(x * 0.0022) * 52
      + Math.sin(x * 0.0071 + 1.2) * 22;
  }

  /* [x, height above the tide line, rx, ry] - always on the shelf, never in the sea */
  var TIDEPOOLS = (function () {
    var defs = [
      [3760, 132, 62, 40], [3920, 214, 46, 32], [4120, 118, 74, 44],
      [4330, 196, 52, 36], [4520, 126, 64, 42], [3990, 322, 44, 30],
      [4270, 306, 50, 34]
    ];
    var out = [], i, d;
    for (i = 0; i < defs.length; i++) {
      d = defs[i];
      out.push({ x: d[0], y: shoreY(d[0]) - d[1], rx: d[2], ry: d[3] });
    }
    return out;
  })();

  var SHELF = { x0: 3620, x1: 4800, pad: 210 };

  /* The footbridge near Shell Beach. It crosses the water where the river
     opens out into Gull Inlet, so she can walk over instead of all the way
     round - and she can fish off the side of it. Everything about it is
     worked out from these five numbers. */
  var BRIDGE = {
    x: 2857, y: 2383,        // mid-channel, where the river meets the beach
    ang: 2.167,              // square across the current, in radians
    len: 258,                // end to end, with a landing on the sand each side
    w: 34                    // how wide the deck is
  };
  BRIDGE.dx = Math.cos(BRIDGE.ang); BRIDGE.dy = Math.sin(BRIDGE.ang);
  BRIDGE.ax = BRIDGE.x - BRIDGE.dx * BRIDGE.len / 2;
  BRIDGE.ay = BRIDGE.y - BRIDGE.dy * BRIDGE.len / 2;
  BRIDGE.bx = BRIDGE.x + BRIDGE.dx * BRIDGE.len / 2;
  BRIDGE.by = BRIDGE.y + BRIDGE.dy * BRIDGE.len / 2;

  var MS = 8;   // water mask resolution, in pixels

  var World = GG.World = {
    CELL: CELL, COLS: COLS, ROWS: ROWS,
    W: COLS * CELL, H: ROWS * CELL,
    HOUSE: { x: 1520, y: 1480, w: 150 },
    DOOR: { x: 1520, y: 1486 },
    KIND: { NONE: NONE, POND: POND, STREAM: STREAM, RIVER: RIVER, ESTUARY: ESTUARY, SEA: SEA, TIDEPOOL: TIDEPOOL },
    props: [], solids: [], hive: null, grid: {}, chunks: {},
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
        var wb = 1 + (GG.noise2(x / 40, y / 40, 19) - 0.5) * 0.3;
        if (ex * ex + ey * ey < wb) return TIDEPOOL;
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
        w *= 1 + (GG.noise2(x / 70, y / 70, 11) - 0.5) * 0.34;
        if (d - w < best) { best = d - w; bestKind = (t > 0.5 ? b.kind : a.kind); }
      }
      if (best < 0) return bestKind;
      // the pond
      var dx = (x - POND_E.cx) / POND_E.rx, dy = (y - POND_E.cy) / POND_E.ry;
      var wob = 1 + (GG.noise2(x / 90, y / 90, 3) - 0.5) * 0.16;
      if (dx * dx + dy * dy < wob) return POND;
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
      return {
        meadow: 'Sunny Meadow', garden: 'Flower Garden', forest: 'Whispering Woods',
        pond: 'Lily Pond', hill: 'Pebble Hills', orchard: 'Apple Orchard',
        riverbank: 'Riverbank', beach: 'Shell Beach', shore: 'The Tidepools'
      }[this.biomeRaw(x, y)];
    },

    /* ---------- building ---------- */
    build: function () {
      this.buildWater();
      this.props = []; this.solids = []; this.grid = {};
      var rnd = GG.mulberry32(20260912);
      var self = this;

      function add(type, x, y, r, solid, rad, extra) {
        var p = { type: type, x: x, y: y, r: r, seed: rnd(), solid: !!solid, rad: rad || 0 };
        if (extra) for (var k in extra) p[k] = extra[k];
        self.props.push(p);
        if (p.solid) {
          self.solids.push(p);
          var key = Math.floor(x / 200) + ',' + Math.floor(y / 200);
          (self.grid[key] = self.grid[key] || []).push(p);
        }
        return p;
      }

      var HOUSE = this.HOUSE;
      function nearHouse(x, y, pad) {
        return Math.abs(x - HOUSE.x) < HOUSE.w * 0.7 + (pad || 0) &&
               y > HOUSE.y - HOUSE.w * 1.3 - (pad || 0) && y < HOUSE.y + 60 + (pad || 0);
      }

      var FLOWER_COLS = ['#ff8fb0', '#ffd45c', '#c39bff', '#ff9a5c', '#fff0a8', '#8fd8ff', '#ff6f91'];

      for (var i = 0; i < 13000; i++) {
        var x = rnd() * this.W, y = rnd() * this.H;
        if (this.isWater(x, y)) continue;
        if (nearHouse(x, y, 40)) continue;
        if (this.onBridge(x, y, 26)) continue;
        var b = this.biomeAt(x, y);
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
          else if (v < 0.16) add('berryBush', x, y, 22 + rnd() * 7, true, 13);
          else if (v < 0.60) add('grassTuft', x, y, 13 + rnd() * 6);
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
        }
      }

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
      add('sign', HOUSE.x - 118, HOUSE.y + 56, 26, false, 0, { label: 'Home' });

      add('sign', 980, 700, 26, false, 0, { label: 'Meadow' });
      add('sign', 2200, 900, 26, false, 0, { label: 'Woods' });
      add('sign', 1050, 1900, 26, false, 0, { label: 'Pond' });
      add('sign', 2280, 1280, 26, false, 0, { label: 'Orchard' });
      add('sign', 420, 560, 26, false, 0, { label: 'Hills' });
      add('sign', 1230, 1290, 26, false, 0, { label: 'Stream' });
      add('sign', 2300, 2000, 26, false, 0, { label: 'River' });
      add('sign', 3150, 2400, 26, false, 0, { label: 'Inlet' });
      add('sign', 2660, 2510, 26, false, 0, { label: 'Beach' });
      add('sign', BRIDGE.bx - BRIDGE.dy * 34, BRIDGE.by + BRIDGE.dx * 34, 26, false, 0, { label: 'Footbridge' });
      add('sign', 4000, 2200, 26, false, 0, { label: 'Tidepools' });

      this.props.push({ type: 'house', x: HOUSE.x, y: HOUSE.y, r: HOUSE.w, seed: 0.5, solid: false });
      this.props.sort(function (p, q) { return p.y - q.y; });
      this.chunks = {};
    },

    /* ---------- collision ---------- */
    blocked: function (x, y, rad) {
      if (x < 24 || y < 40 || x > this.W - 24 || y > this.H - 24) return true;
      if (this.isDeepWater(x, y) && !this.onBridge(x, y)) return true;   // the stream and the pools are waded, not blocked
      var H = this.HOUSE;
      if (x > H.x - H.w / 2 - rad && x < H.x + H.w / 2 + rad &&
          y > H.y - H.w * 0.72 - rad && y < H.y - 4) return true;
      for (var gx = -1; gx <= 1; gx++) {
        for (var gy = -1; gy <= 1; gy++) {
          var list = this.grid[(Math.floor(x / 200) + gx) + ',' + (Math.floor(y / 200) + gy)];
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

    chunkCanvas: function (cx, cy) {
      var key = cx + ',' + cy;
      if (this.chunks[key]) return this.chunks[key];
      var C = this.CHUNK;
      var cv = document.createElement('canvas');
      cv.width = C; cv.height = C;
      var c = cv.getContext('2d');
      var step = 10, x, y, wx, wy;

      for (y = 0; y < C; y += step) {
        for (x = 0; x < C; x += step) {
          wx = cx * C + x; wy = cy * C + y;
          var b = this.biomeAt(wx + step / 2, wy + step / 2);
          var pal = GROUND[b] || GROUND.meadow;
          var n = GG.noise2(wx / 26, wy / 26, 21);
          c.fillStyle = pal[GG.clamp((n * 3) | 0, 0, 2)];
          c.fillRect(x, y, step + 1, step + 1);
        }
      }

      // damp sand right at the water's edge
      for (y = 0; y < C; y += 6) {
        for (x = 0; x < C; x += 6) {
          wx = cx * C + x; wy = cy * C + y;
          var i = this.maskIndex(wx, wy);
          if (this.mask[i] !== NONE) continue;
          var damp = (GG.noise2(wx / 30, wy / 30, 41) - 0.5) * 3.4;
          if (this.dSea[i] <= 4.5 + damp || this.dPool[i] <= 2.5 + damp) {
            c.fillStyle = 'rgba(196,176,132,0.55)';
            c.fillRect(x, y, 7, 7);
          }
        }
      }

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

      this.chunks[key] = cv;
      return cv;
    },

    drawGround: function (c, cam, vw, vh) {
      var C = this.CHUNK;
      var x0 = Math.floor(cam.x / C), x1 = Math.floor((cam.x + vw) / C);
      var y0 = Math.floor(cam.y / C), y1 = Math.floor((cam.y + vh) / C);
      for (var cy = y0; cy <= y1; cy++) {
        for (var cx = x0; cx <= x1; cx++) {
          if (cx < 0 || cy < 0 || cx * C >= this.W || cy * C >= this.H) continue;
          c.drawImage(this.chunkCanvas(cx, cy), cx * C - cam.x, cy * C - cam.y);
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
          } else if (k === POND) {
            if (h > 0.7) {
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

    drawProps: function (c, cam, vw, vh, t, layer) {
      var P = GG.Props;
      var pad = 140;
      for (var i = 0; i < this.props.length; i++) {
        var p = this.props[i];
        if (p.x < cam.x - pad || p.x > cam.x + vw + pad) continue;
        if (p.y < cam.y - pad * 2.4 || p.y > cam.y + vh + pad) continue;
        var isFlat = (p.type === 'lilypad' || p.type === 'wetrock' || p.type === 'pebbles' || p.type === 'kelp');
        if (layer === 'flat' && !isFlat) continue;
        if (layer === 'sorted' && isFlat) continue;
        var fn = P[p.type];
        if (fn) fn(c, p.x - cam.x, p.y - cam.y, p.r, t, p.seed, p.col || p.label, p);
      }
    },

    sortedProps: function (cam, vw, vh) {
      var out = [], pad = 150;
      for (var i = 0; i < this.props.length; i++) {
        var p = this.props[i];
        if (p.type === 'lilypad' || p.type === 'wetrock' || p.type === 'pebbles' || p.type === 'kelp') continue;
        if (p.x < cam.x - pad || p.x > cam.x + vw + pad) continue;
        if (p.y < cam.y - pad * 2.6 || p.y > cam.y + vh + pad) continue;
        out.push(p);
      }
      return out;
    }
  };
})(window.GG = window.GG || {});
