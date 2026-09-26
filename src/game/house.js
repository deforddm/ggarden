/* Inside Guin's cottage: the Critter Compendium on its bookshelf, the tank
   table, the decoration chest, a fireplace, and her own bed.

   v1.16 - David: "make the inside of the house feel more true to the
   player's dimensions. It feels like a giant's home currently." It did: the
   bed was five Guins long and the front door twice her height. The whole room
   is now built to her scale, at about 45 pixels to the metre (Guin is a child
   of about 1.2 m and ~56 px): a 1.9 m bed, a door she could walk through, a
   bookshelf a little taller than she is. The room is drawn at the same zoom as
   the world outside, so she is exactly the same size indoors.

   v1.20 - she can decorate it (David: "add the option to customize the decor
   of your home"). Save.data.home holds her choices - wallpaper, floor, rug,
   quilt, curtains - and the things she has put down or hung up; null is the
   cottage exactly as it was. The room's still parts are drawn ONCE to an
   offscreen canvas at the screen's own resolution and only redrawn when
   something about them changes; each frame just stamps that and adds the
   fire. Things on the floor stand in the y-sorted crowd with Guin and her
   friends, and the big ones (toy chest, shelf of games, rocking chair, doll's
   house) are solid. Nothing may ever be put where it would cut her off from
   the door or anything she uses: every placement is checked with a flood fill
   from where she comes in. */
(function (GG) {
  'use strict';

  var W = 560, H = 440;

  /* The corner plant's bush exactly as v1.19's GG.Props.bush drew it, kept
     here so the room does not change when the outdoor props are restyled. */
  function bushEll(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2); c.fill(); }
  function cornerBush(c, x, y, r) {
    c.fillStyle = 'rgba(30,60,25,0.16)';
    bushEll(c, x + 1, y, r * 0.85, r * 0.85 * 0.38);
    c.fillStyle = '#33783a';
    bushEll(c, x - r * 0.42, y - r * 0.36, r * 0.6, r * 0.48);
    bushEll(c, x + r * 0.42, y - r * 0.36, r * 0.6, r * 0.48);
    bushEll(c, x, y - r * 0.6, r * 0.68, r * 0.56);
    c.fillStyle = '#47954a';
    bushEll(c, x - r * 0.2, y - r * 0.62, r * 0.42, r * 0.34);
    bushEll(c, x + r * 0.28, y - r * 0.46, r * 0.34, r * 0.28);
  }
  var FLOOR = 112;          // where the back wall stops and the floorboards start
  var SIDE = 14;            // thickness of the side and front walls
  var BACK = FLOOR + 16;    // furniture along the back wall stands out this far

  /* the solid things on the floor, as rectangles (the back-wall furniture is
     covered by BACK) */
  var BED = { x0: 468, x1: W - SIDE, y0: 244, y1: 344 };
  var PLANT = { x0: SIDE, x1: 58, y0: 360, y1: 396 };
  var DOOR = { x: 280, w: 46 };
  /* v1.20: the paint pots and little easel just inside the door, where she
     goes to decorate. Its base is at STAND.y; it is solid, like the plant. */
  var STAND = { x: 206, y: 404, x0: 192, x1: 220, y0: 394, y1: 406 };

  /* where things may not go (floor), so the bed, the plant, the doorway and
     every spot stay clear to walk up to */
  var KEEP_FLOOR = [
    { x0: BED.x0 - 4, x1: W, y0: BED.y0 - 14, y1: BED.y1 + 6 },
    { x0: BED.x0 - 32, x1: BED.x0 - 4, y0: BED.y0 + 28, y1: BED.y0 + 72 },     // the bedside rug
    { x0: 0, x1: PLANT.x1 + 4, y0: PLANT.y0 - 10, y1: H },
    { x0: DOOR.x - 38, x1: DOOR.x + 38, y0: H - 96 - 26, y1: H },               // START to the door
    { x0: 182, x1: 232, y0: 378, y1: H },                                       // the paint pots
    { x0: 30, x1: 94, y0: FLOOR + 6, y1: FLOOR + 38 },                          // bookshelf spot
    { x0: 330, x1: 426, y0: FLOOR + 8, y1: FLOOR + 40 },                        // tank table spot
    { x0: 455, x1: 509, y0: FLOOR + 8, y1: FLOOR + 40 }                         // decoration box spot
  ];
  /* where nothing may hang on the back wall: the window (and its curtains),
     the bookshelf, the fireplace, the tank table and the toy box */
  var KEEP_WALL = [
    { x0: 110, x1: 218, y0: 0, y1: 88 },
    { x0: 28, x1: 96, y0: 50, y1: FLOOR },
    { x0: 222, x1: 306, y0: 36, y1: FLOOR },
    { x0: 326, x1: 430, y0: 66, y1: FLOOR },
    { x0: 454, x1: 510, y0: 86, y1: FLOOR }
  ];
  function hit(a, b, pad) {
    pad = pad || 0;
    return a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;
  }

  var DEF_STYLE = { wall: 'cream', floor: 'honey', rug: 'blue', quilt: 'pink', curtain: 'none' };
  var CELL = 4, GW = W / CELL, GH = H / CELL;

  var House = GG.House = {
    W: W, H: H, FLOOR: FLOOR, BACK: BACK, SIDE: SIDE, BED: BED, DOOR: DOOR, STAND: STAND,
    START: { x: 280, y: H - 96 },   // a step in from the door, so a double tap does not walk her straight back out
    DEFAULT_STYLE: DEF_STYLE,

    spots: [
      { id: 'book', x: 62, y: FLOOR + 22, w: 64, h: 32, label: 'Critter Compendium' },
      { id: 'terrarium', x: 378, y: FLOOR + 24, w: 96, h: 32, label: 'My Tanks' },
      { id: 'shop', x: 482, y: FLOOR + 24, w: 54, h: 32, label: 'Decoration Box' },
      { id: 'bed', x: (BED.x0 + BED.x1) / 2, y: (BED.y0 + BED.y1) / 2, w: BED.x1 - BED.x0 + 8, h: BED.y1 - BED.y0 + 8, label: 'Bed — have a nap' },
      { id: 'door', x: DOOR.x, y: H - 22, w: DOOR.w + 8, h: 26, label: 'Go Outside' },
      { id: 'decorate', x: STAND.x, y: STAND.y - 8, w: 40, h: 28, label: 'Decorate my home' }
    ],

    /* ---------------- her choices ---------------- */
    home: function () { return GG.Save.data.home || null; },
    /* the home record, made the first time she changes anything */
    ensureHome: function () {
      var d = GG.Save.data;
      if (!d.home) d.home = { wall: null, floor: null, rug: null, quilt: null, curtain: null, owned: [], items: [] };
      if (!d.home.owned) d.home.owned = [];
      if (!d.home.items) d.home.items = [];
      return d.home;
    },
    /* which option of a kind is showing: her choice, or the cottage as built */
    look: function (kind) {
      var h = this.home(), id = h && h[kind];
      var by = GG.HOME_DECOR && GG.HOME_DECOR.byId[kind];
      return (id && by && by[id]) ? id : DEF_STYLE[kind];
    },
    style: function () {
      return { wall: this.look('wall'), floor: this.look('floor'), rug: this.look('rug'),
        quilt: this.look('quilt'), curtain: this.look('curtain') };
    },
    items: function () { var h = this.home(); return (h && h.items) || []; },
    owns: function (kind, id) {
      var def = GG.HOME_DECOR.byId[kind][id];
      if (!def) return false;
      if (!def.price) return true;
      var h = this.home();
      return !!(h && h.owned && h.owned.indexOf(kind + ':' + id) >= 0);
    },
    /* how many of a thing are bought but not out in the room */
    spare: function (id) {
      var def = GG.HOME_DECOR.byId.item[id];
      if (!def) return 0;
      if (!def.price) return 99;
      var h = this.home(), n = 0, i;
      if (!h) return 0;
      for (i = 0; i < h.owned.length; i++) if (h.owned[i] === 'item:' + id) n++;
      for (i = 0; i < h.items.length; i++) if (h.items[i].id === id) n--;
      return Math.max(0, n);
    },
    /* buy (if need be) and use a wallpaper / floor / rug / quilt / curtains.
       Returns 'ok', 'short' (not enough sparkles) or 'bad'. */
    useLook: function (kind, id) {
      var def = GG.HOME_DECOR.byId[kind] && GG.HOME_DECOR.byId[kind][id];
      if (!def) return 'bad';
      var d = GG.Save.data;
      if (!this.owns(kind, id)) {
        if ((d.sparkles || 0) < def.price) return 'short';
        var h0 = this.ensureHome();
        d.sparkles -= def.price;
        h0.owned.push(kind + ':' + id);
      }
      var h = this.ensureHome();
      h[kind] = id;
      this.refresh();
      GG.Save.save();
      return 'ok';
    },

    /* ---------------- things in the room ---------------- */
    _solids: [],
    _entries: [],
    _ver: 0,
    _homeRef: undefined,
    /* rebuild the solid rectangles and the draw list after any change */
    refresh: function () {
      var list = this.items(), solids = [], ents = [], i;
      ents.push({ y: STAND.y, homeItem: true, id: '_decorate', x: STAND.x });
      for (i = 0; i < list.length; i++) {
        var it = list[i], def = GG.HOME_DECOR.byId.item[it.id];
        if (!def || def.wall) continue;
        if (def.solid) solids.push({ x0: it.x - def.fw / 2, x1: it.x + def.fw / 2, y0: it.y - def.fd, y1: it.y });
        ents.push({ y: it.y, homeItem: true, id: it.id, x: it.x, def: def });
      }
      this._solids = solids;
      this._entries = ents;
      this._ver++;
      this._reach = {};
      this._homeRef = GG.Save.data.home;
      this._cacheKey = null;
    },
    _sync: function () { if (GG.Save.data.home !== this._homeRef) this.refresh(); },

    blockedWith: function (x, y, rad, solids) {
      rad = rad || 0;
      if (x < SIDE + rad || x > W - SIDE - rad) return true;
      if (y < BACK + rad * 0.6) return true;
      if (y > H - SIDE - rad * 0.6) return true;
      if (x > BED.x0 - rad && x < BED.x1 + rad && y > BED.y0 - rad * 0.6 && y < BED.y1 + rad * 0.4) return true;
      if (x < PLANT.x1 + rad && y > PLANT.y0 - rad * 0.6 && y < PLANT.y1 + rad * 0.4) return true;
      if (x > STAND.x0 - rad && x < STAND.x1 + rad && y > STAND.y0 - rad * 0.6 && y < STAND.y1 + rad * 0.4) return true;
      for (var i = 0; i < solids.length; i++) {
        var s = solids[i];
        if (x > s.x0 - rad && x < s.x1 + rad && y > s.y0 - rad * 0.6 && y < s.y1 + rad * 0.4) return true;
      }
      return false;
    },
    blocked: function (x, y, rad) {
      if (GG.Save.data.home !== this._homeRef) this.refresh();
      return this.blockedWith(x, y, rad, this._solids);
    },

    /* Which 4-px cells something of radius rad can walk to from the door.
       Cached until the room changes. */
    reachGrid: function (rad, solids) {
      var g = new Uint8Array(GW * GH), q = new Int32Array(GW * GH), qh = 0, qt = 0;
      var sx = Math.floor(this.START.x / CELL), sy = Math.floor(this.START.y / CELL);
      var self = this;
      function free(cx, cy) { return !self.blockedWith(cx * CELL + CELL / 2, cy * CELL + CELL / 2, rad, solids); }
      if (!free(sx, sy)) return g;
      g[sy * GW + sx] = 1; q[qt++] = sy * GW + sx;
      while (qh < qt) {
        var k = q[qh++], cx = k % GW, cy = (k - cx) / GW;
        for (var d = 0; d < 4; d++) {
          var nx = cx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = cy + (d === 2 ? 1 : d === 3 ? -1 : 0);
          if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
          var nk = ny * GW + nx;
          if (g[nk]) continue;
          if (!free(nx, ny)) { g[nk] = 2; continue; }
          g[nk] = 1; q[qt++] = nk;
        }
      }
      return g;
    },
    _reach: {},
    reach: function (rad) {
      this._sync();
      var key = Math.round(rad || 0);
      if (!this._reach[key]) this._reach[key] = this.reachGrid(key, this._solids);
      return this._reach[key];
    },
    reachable: function (x, y, rad) {
      var cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
      if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) return false;
      return this.reach(rad)[cy * GW + cx] === 1;
    },
    /* true if, with these solid things, Guin can still walk from the door to
       the door and up to every spot in the room */
    allReachable: function (solids, out) {
      var g = this.reachGrid(11, solids), found = {}, n = 0, i;
      for (var k = 0; k < g.length; k++) {
        if (g[k] !== 1) continue;
        var cx = k % GW, cy = (k - cx) / GW;
        var s = this.nearest(cx * CELL + CELL / 2, cy * CELL + CELL / 2);
        if (s && !found[s.id]) { found[s.id] = 1; n++; if (n === this.spots.length) break; }
      }
      if (out) for (i = 0; i < this.spots.length; i++) out[this.spots[i].id] = !!found[this.spots[i].id];
      return n === this.spots.length;
    },

    /* The nearest place to (x, y) where something of this size can stand -
       for putting a friend back on the floor if it ever ends up inside the
       bed or the wall. v1.20: and somewhere she can walk to from the door,
       never a corner closed off by the furniture. */
    freeNear: function (x, y, rad) {
      if (!this.blocked(x, y, rad) && this.reachable(x, y, rad)) return { x: x, y: y };
      var loose = null;
      for (var r = 6; r < 400; r += 6) {
        for (var a = 0; a < Math.PI * 2; a += 0.3) {
          var nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r;
          if (!this.blocked(nx, ny, rad)) {
            if (this.reachable(nx, ny, rad)) return { x: nx, y: ny };
            if (!loose) loose = { x: nx, y: ny };
          }
        }
      }
      return loose || { x: this.START.x, y: this.START.y - 60 };
    },

    /* Open floor, spread about the room and clear of the furniture and the
       doorway, for the friends waiting at home. */
    homeSpots: function (rad) {
      var out = [];
      for (var y = BACK + 36; y < H - 40; y += 54) {
        for (var x = SIDE + 44; x < W - SIDE - 30; x += 62) {
          if (this.blocked(x, y, rad)) continue;
          if (!this.reachable(x, y, rad)) continue;
          if (GG.dist(x, y, this.START.x, this.START.y) < 70) continue;
          out.push({ x: x, y: y });
        }
      }
      return out;
    },

    nearest: function (px, py) {
      var best = null, bd = 1e9;
      for (var i = 0; i < this.spots.length; i++) {
        var s = this.spots[i];
        var dx = Math.max(0, Math.abs(px - s.x) - s.w / 2);
        var dy = Math.max(0, Math.abs(py - s.y) - s.h / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 24 && d < bd) { bd = d; best = s; }
      }
      return best;
    },

    /* ---------------- placing things ---------------- */
    rectFor: function (def, x, y) {
      return def.wall ? { x0: x - def.fw / 2, x1: x + def.fw / 2, y0: y - def.ht, y1: y }
        : { x0: x - def.fw / 2, x1: x + def.fw / 2, y0: y - def.fd, y1: y };
    },
    /* Why a thing cannot go here (a short reason), or null if it can.
       skip = index of an item being moved, so it does not collide with itself. */
    canPlace: function (id, x, y, skip, noReach) {
      var def = GG.HOME_DECOR.byId.item[id];
      if (!def) return 'bad';
      var r = this.rectFor(def, x, y), list = this.items(), i;
      if (def.wall) {
        if (r.x0 < SIDE + 2 || r.x1 > W - SIDE - 2 || r.y0 < 6 || r.y1 > FLOOR - 10) return 'wall';
        for (i = 0; i < KEEP_WALL.length; i++) if (hit(r, KEEP_WALL[i])) return 'taken';
      } else {
        if (r.x0 < SIDE + 2 || r.x1 > W - SIDE - 2 || r.y0 < BACK - 4 || r.y1 > H - SIDE - 2) return 'floor';
        for (i = 0; i < KEEP_FLOOR.length; i++) if (hit(r, KEEP_FLOOR[i])) return 'taken';
      }
      for (i = 0; i < list.length; i++) {
        if (i === skip) continue;
        var od = GG.HOME_DECOR.byId.item[list[i].id];
        if (!od || !!od.wall !== !!def.wall) continue;
        if (hit(r, this.rectFor(od, list[i].x, list[i].y), 2)) return 'taken';
      }
      if (def.solid && !noReach) {
        var solids = [r];
        for (i = 0; i < list.length; i++) {
          if (i === skip) continue;
          var sd = GG.HOME_DECOR.byId.item[list[i].id];
          if (sd && sd.solid && !sd.wall) solids.push(this.rectFor(sd, list[i].x, list[i].y));
        }
        if (!this.allReachable(solids)) return 'path';
      }
      return null;
    },
    /* The nearest good place to where she tapped, snapped to a 4 px grid. */
    findPlace: function (id, x, y, skip) {
      var def = GG.HOME_DECOR.byId.item[id];
      if (!def) return null;
      var snap = function (v) { return Math.round(v / 4) * 4; };
      var tries = 0;
      for (var r = 0; r <= 72; r += 4) {
        var n = r === 0 ? 1 : Math.max(8, Math.round(r * 1.2));
        for (var k = 0; k < n; k++) {
          var a = k / n * Math.PI * 2;
          var px = snap(x + Math.cos(a) * r), py = snap(y + Math.sin(a) * r);
          if (this.canPlace(id, px, py, skip, true)) continue;
          if (def.solid) {
            if (++tries > 14) return null;
            if (this.canPlace(id, px, py, skip)) continue;
          }
          return { x: px, y: py };
        }
      }
      return null;
    },
    /* Put a thing down (buying it first if she has none spare).
       Returns { ok, reason, index }: reason 'short' = not enough sparkles,
       'full' = the room has as much as it can hold, 'nowhere' = no room near there. */
    placeItem: function (id, x, y) {
      var def = GG.HOME_DECOR.byId.item[id], d = GG.Save.data;
      if (!def) return { ok: false, reason: 'bad' };
      if (this.items().length >= GG.HOME_DECOR.MAX_ITEMS) return { ok: false, reason: 'full' };
      var p = this.findPlace(id, x, y, -1);
      if (!p) return { ok: false, reason: 'nowhere' };
      var buy = def.price > 0 && this.spare(id) <= 0;
      if (buy && (d.sparkles || 0) < def.price) return { ok: false, reason: 'short' };
      var h = this.ensureHome();
      if (buy) { d.sparkles -= def.price; h.owned.push('item:' + id); }
      h.items.push({ id: id, x: p.x, y: p.y });
      this.refresh();
      GG.Save.save();
      return { ok: true, index: h.items.length - 1, bought: buy, x: p.x, y: p.y };
    },
    moveItem: function (i, x, y) {
      var list = this.items(), it = list[i];
      if (!it) return { ok: false, reason: 'bad' };
      var p = this.findPlace(it.id, x, y, i);
      if (!p) return { ok: false, reason: 'nowhere' };
      it.x = p.x; it.y = p.y;
      this.refresh();
      GG.Save.save();
      return { ok: true, index: i, x: p.x, y: p.y };
    },
    /* back in the box: still hers, and free to put out again */
    removeItem: function (i) {
      var list = this.items();
      if (!list[i]) return false;
      list.splice(i, 1);
      this.refresh();
      GG.Save.save();
      return true;
    },
    /* the item under a point in room coordinates (front-most first) */
    itemAt: function (x, y) {
      var list = this.items(), best = -1, by = -1e9;
      for (var i = 0; i < list.length; i++) {
        var def = GG.HOME_DECOR.byId.item[list[i].id];
        if (!def) continue;
        var it = list[i];
        var x0 = it.x - def.fw / 2 - 4, x1 = it.x + def.fw / 2 + 4, y0 = it.y - def.ht - 4, y1 = it.y + 4;
        if (x >= x0 && x <= x1 && y >= y0 && y <= y1 && it.y > by) { best = i; by = it.y; }
      }
      return best;
    },

    /* ---------------- drawing ---------------- */

    /* everything in the room that does not move, in the order v1.19 drew it */
    drawStatic: function (c, st, night, items) {
      var i;
      var HA = GG.HomeArt;

      /* ---- floor, back wall, rug ---- */
      HA.floor(c, st.floor);
      HA.wall(c, st.wall);
      HA.rug(c, st.rug, 262, 290);

      /* ---- window: 1.2 m wide, with the real time of day in it ---- */
      var wx = 136, wy = 24, ww = 56, wh = 46;
      c.fillStyle = '#8a6a45';
      GG.roundRect(c, wx - 4, wy - 4, ww + 8, wh + 8, 4); c.fill();
      c.fillStyle = night ? '#20306a' : '#a7dcf4';
      c.fillRect(wx, wy, ww, wh);
      if (night) {
        c.fillStyle = '#fff6c4';
        c.beginPath(); c.arc(wx + 40, wy + 13, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#dfe8ff';
        for (var s = 0; s < 7; s++) c.fillRect(wx + 4 + (s * 17) % 48, wy + 4 + (s * 11) % 38, 1.5, 1.5);
      } else {
        c.fillStyle = '#7fc46a'; c.fillRect(wx, wy + wh - 12, ww, 12);
        c.fillStyle = '#ffe98a';
        c.beginPath(); c.arc(wx + 42, wy + 12, 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.ellipse(wx + 16, wy + 14, 9, 4, 0, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = '#8a6a45'; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh);
      c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2);
      c.stroke();
      c.fillStyle = '#9a6f43'; c.fillRect(wx - 6, wy + wh + 3, ww + 12, 4);   // sill
      HA.curtain(c, st.curtain, wx, wy, ww, wh);

      /* ---- things hung on the wall ---- */
      if (items) {
        for (i = 0; i < items.length; i++) {
          var wd = GG.HOME_DECOR.byId.item[items[i].id];
          if (wd && wd.wall) HA.drawItem(c, items[i].id, items[i].x, items[i].y, 0, wd);
        }
      }

      /* ---- fireplace, 1.4 m across (its fire is drawn every frame) ---- */
      var fx = 232, fw = 64;
      c.fillStyle = '#b3a494';
      c.fillRect(fx, FLOOR - 56, fw, 56 + 10);
      c.fillStyle = '#a09080';
      for (var bk = 0; bk < 7; bk++) {
        for (var bc = 0; bc < 4; bc++) {
          c.fillRect(fx + 2 + bc * 16 + (bk % 2) * 8, FLOOR - 54 + bk * 9, 14, 1.2);
        }
      }
      c.fillStyle = '#8a5f36';
      c.fillRect(fx - 6, FLOOR - 60, fw + 12, 7);                              // mantel
      c.fillStyle = '#2b1f18';
      GG.roundRect(c, fx + 14, FLOOR - 34, fw - 28, 34, 10); c.fill();       // firebox
      c.fillStyle = '#6b4a2e';
      c.fillRect(fx + 18, FLOOR - 6, fw - 36, 4);                             // log
      c.fillStyle = '#8f8274';
      c.fillRect(fx - 4, FLOOR + 6, fw + 8, 8);                               // hearth stone
      /* a little clock and a candle on the mantel, for the sense of size */
      c.fillStyle = '#f2e6cf'; c.fillRect(fx + 6, FLOOR - 68, 5, 8);
      c.fillStyle = '#ffd45c'; c.beginPath(); c.ellipse(fx + 8.5, FLOOR - 70, 1.6, 2.4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#c98f56'; GG.roundRect(c, fx + fw - 18, FLOOR - 72, 12, 12, 3); c.fill();
      c.fillStyle = '#fff6e0'; c.beginPath(); c.arc(fx + fw - 12, FLOOR - 66, 4, 0, Math.PI * 2); c.fill();

      /* ---- bookshelf: 1.2 m wide, a little taller than Guin ---- */
      var sx0 = 32, sw = 60, stop = FLOOR - 58, sbase = FLOOR + 14;
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, sx0, stop, sw, sbase - stop, 3); c.fill();
      c.fillStyle = '#7d5733';
      c.fillRect(sx0 + 3, stop + 3, sw - 6, sbase - stop - 6);
      var bookCols = ['#d2584f', '#e0a34a', '#5f9ed6', '#78bb63', '#b57fd1', '#e07f9c', '#6fb2a8'];
      for (var shelf = 0; shelf < 3; shelf++) {
        var sy = stop + 5 + shelf * 19;
        var bxp = sx0 + 5, k = shelf * 3;
        while (bxp < sx0 + sw - 8) {
          var bw = 4 + ((k * 7) % 3);
          var bh = 12 + ((k * 5) % 4);
          c.fillStyle = bookCols[k % bookCols.length];
          c.fillRect(bxp, sy + (16 - bh), bw, bh);
          bxp += bw + 1; k++;
        }
        c.fillStyle = '#9a6f43'; c.fillRect(sx0 + 3, sy + 16, sw - 6, 3);
      }
      /* the Collections sign across the bottom shelf */
      c.fillStyle = '#f2e6cf';
      GG.roundRect(c, sx0 + 3, sbase - 17, sw - 6, 14, 3); c.fill();
      c.fillStyle = '#4b6b3a';
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      var fs = 11;
      do {
        c.font = 'bold ' + fs + 'px "Trebuchet MS", sans-serif';
      } while (c.measureText('Collections').width > sw - 12 && --fs > 6);
      c.fillText('Collections', sx0 + sw / 2, sbase - 6);

      /* ---- tank table: 2 m long, waist height to a grown-up ---- */
      var tx0 = 330, tw = 96, ttop = FLOOR - 20, tbase = FLOOR + 14;
      c.fillStyle = '#8a5f36';
      c.fillRect(tx0 + 5, ttop + 6, 5, tbase - ttop - 6);
      c.fillRect(tx0 + tw - 10, ttop + 6, 5, tbase - ttop - 6);
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, tx0, ttop, tw, 8, 3); c.fill();
      var tanks = GG.Save.data.terrariums;
      for (var tk = 0; tk < Math.min(3, tanks.length); tk++) {
        var gx = tx0 + 5 + tk * 30, gw = 26, gh = 20, gy = ttop - gh, type = tanks[tk].type || 'terrarium';
        c.save();
        GG.roundRect(c, gx, gy, gw, gh, 3); c.clip();
        if (type === 'aquarium') {
          c.fillStyle = '#8fd3ea'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#3f93b8'; c.fillRect(gx, gy + 12, gw, 8);
          c.fillStyle = '#e3d6a8'; c.fillRect(gx + 1, gy + 16, gw - 2, 4);
        } else if (type === 'hybrid') {
          c.fillStyle = '#cfeeff'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#8ecf63'; c.fillRect(gx, gy + 8, gw, 4);
          c.fillStyle = '#7fc4d2'; c.fillRect(gx, gy + 12, gw, 8);
        } else if (type === 'habitat') {
          c.fillStyle = '#cfeeff'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#6fae52'; c.fillRect(gx, gy + 8, gw, 4);
          c.fillStyle = '#8ecf63'; c.fillRect(gx, gy + 12, gw, 8);
        } else {
          c.fillStyle = 'rgba(180,230,255,0.55)'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#7fc46a'; c.fillRect(gx, gy + 13, gw, 7);
        }
        c.restore();
        c.strokeStyle = '#cfe9f5'; c.lineWidth = 1.2;
        GG.roundRect(c, gx, gy, gw, gh, 3); c.stroke();
      }

      /* ---- decoration chest: a toy box, knee high ---- */
      var cx0 = 460, cw = 44, cbase = FLOOR + 14;
      c.fillStyle = '#c98f56';
      GG.roundRect(c, cx0, cbase - 24, cw, 24, 3); c.fill();
      c.fillStyle = '#e0a86c';
      GG.roundRect(c, cx0 - 2, cbase - 31, cw + 4, 9, 3); c.fill();
      c.fillStyle = '#8a5f36'; c.fillRect(cx0 + cw / 2 - 3, cbase - 24, 6, 8);
      c.fillStyle = '#ffd45c';
      c.beginPath(); c.arc(cx0 + cw / 2, cbase - 16, 2.4, 0, Math.PI * 2); c.fill();

      /* ---- her bed: a real single bed, 1.9 m by 0.9 m ---- */
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, BED.x0, BED.y0 - 8, BED.x1 - BED.x0, BED.y1 - BED.y0 + 8, 5); c.fill();  // frame + headboard
      c.fillStyle = '#f6eadf';
      GG.roundRect(c, BED.x0 + 4, BED.y0, BED.x1 - BED.x0 - 8, 22, 5); c.fill();                // pillow
      HA.quilt(c, st.quilt, BED);
      /* a bedside rug */
      c.fillStyle = '#e8c870';
      GG.roundRect(c, BED.x0 - 30, BED.y0 + 30, 24, 40, 6); c.fill();

      /* ---- potted plant in the corner ---- */
      c.fillStyle = '#c4703f';
      GG.roundRect(c, PLANT.x0 + 12, PLANT.y1 - 20, 24, 20, 4); c.fill();
      cornerBush(c, PLANT.x0 + 24, PLANT.y1 - 18, 20);

      /* ---- side and front walls, with the doorway in the front one ---- */
      c.fillStyle = '#b3906a';
      c.fillRect(0, 0, SIDE, H);
      c.fillRect(W - SIDE, 0, SIDE, H);
      c.fillRect(0, H - SIDE, DOOR.x - DOOR.w / 2, SIDE);
      c.fillRect(DOOR.x + DOOR.w / 2, H - SIDE, W - DOOR.x - DOOR.w / 2, SIDE);
      c.fillStyle = '#9d7b57';
      c.fillRect(SIDE - 2, 0, 2, H - SIDE); c.fillRect(W - SIDE, 0, 2, H - SIDE);
      /* the doorway: open, with the doormat and daylight (or night) outside */
      c.fillStyle = night ? '#223066' : '#9fd87a';
      c.fillRect(DOOR.x - DOOR.w / 2, H - SIDE, DOOR.w, SIDE);
      c.fillStyle = '#8a5f36';
      c.fillRect(DOOR.x - DOOR.w / 2 - 3, H - SIDE, 3, SIDE);
      c.fillRect(DOOR.x + DOOR.w / 2, H - SIDE, 3, SIDE);
      c.fillStyle = '#a9743f';
      GG.roundRect(c, DOOR.x - 20, H - SIDE - 16, 40, 13, 3); c.fill();       // doormat
      c.fillStyle = '#8a5f36';
      c.font = 'bold 8px "Trebuchet MS", sans-serif'; c.textAlign = 'center';
      c.fillText('HELLO', DOOR.x, H - SIDE - 6.5);
    },

    /* the fire and its glow, every frame */
    drawFire: function (c, t) {
      var fx = 232, fw = 64;
      var fl = 0.5 + 0.5 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 1);
      c.fillStyle = 'rgba(255,150,40,0.95)';
      c.beginPath();
      c.moveTo(fx + 22, FLOOR - 5); c.quadraticCurveTo(fx + 26, FLOOR - 20 - fl * 5, fx + 32, FLOOR - 26 - fl * 3);
      c.quadraticCurveTo(fx + 38, FLOOR - 18 - fl * 4, fx + 42, FLOOR - 5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,230,120,0.95)';
      c.beginPath();
      c.moveTo(fx + 27, FLOOR - 5); c.quadraticCurveTo(fx + 30, FLOOR - 14 - fl * 3, fx + 32, FLOOR - 17 - fl * 2);
      c.quadraticCurveTo(fx + 35, FLOOR - 12 - fl * 2, fx + 37, FLOOR - 5); c.closePath(); c.fill();
      /* a warm glow on the floor in front of it */
      var g = c.createRadialGradient(fx + fw / 2, FLOOR + 14, 4, fx + fw / 2, FLOOR + 14, 80);
      g.addColorStop(0, 'rgba(255,170,70,' + (0.22 + fl * 0.06).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,170,70,0)');
      c.fillStyle = g; c.fillRect(fx - 60, FLOOR, fw + 120, 100);
      /* the glow is under the tank table's near leg, as it always was */
      c.fillStyle = '#8a5f36';
      c.fillRect(335, FLOOR, 5, 14);
    },

    /* is the cached room still right? (no allocation unless it is not) */
    _cache: null, _cacheKey: null, _cs: 0, _cNight: null, _cTanks: '',
    _tankSig: function () {
      var t = GG.Save.data.terrariums, n = Math.min(3, t.length), c = this._cTanksArr || (this._cTanksArr = []);
      var same = c.length === n;
      for (var i = 0; i < n && same; i++) if (c[i] !== (t[i].type || 'terrarium')) same = false;
      if (!same) { c.length = 0; for (i = 0; i < n; i++) c.push(t[i].type || 'terrarium'); }
      return same;
    },

    draw: function (c, cam, t) {
      this._sync();
      var night = GG.Time.isDark();
      var m = c.getTransform(), s = m.a;
      var tanksSame = this._tankSig();
      if (!this._cache || this._cacheKey !== this._ver || this._cs !== s || this._cNight !== night || !tanksSame) {
        var cw = Math.ceil(W * s), ch = Math.ceil(H * s);
        if (!this._cache) this._cache = document.createElement('canvas');
        if (this._cache.width !== cw || this._cache.height !== ch) { this._cache.width = cw; this._cache.height = ch; }
        var cc = this._cache.getContext('2d');
        cc.setTransform(1, 0, 0, 1, 0, 0);
        cc.clearRect(0, 0, cw, ch);
        cc.setTransform(s, 0, 0, s, 0, 0);
        this.drawStatic(cc, this.style(), night, this.items());
        this._cacheKey = this._ver; this._cs = s; this._cNight = night;
      }
      this.scale = s;
      /* stamp it on whole device pixels, so it stays crisp */
      var dx = Math.round(m.e - cam.x * s), dy = Math.round(m.f - cam.y * m.d);
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(this._cache, dx, dy);
      c.restore();
      c.save();
      c.translate(-cam.x, -cam.y);
      this.drawFire(c, t);
      c.restore();
    },

    /* the paint pots and the things on the floor, for main.js's y-sorted pass */
    collect: function (out) {
      this._sync();
      for (var i = 0; i < this._entries.length; i++) out.push(this._entries[i]);
    },
    drawEntry: function (c, e, cam, t) {
      var sp = GG.HomeArt.sprite(e.id, this.scale || 2);
      c.drawImage(sp.cv, e.x - cam.x - sp.ax, e.y - cam.y - sp.ay, sp.cv.width / (this.scale || 2), sp.cv.height / (this.scale || 2));
      if (e.id === 'fishbowl') GG.HomeArt.fishInBowl(c, e.x - cam.x, e.y - cam.y, t);
    },
    /* lamps glow at night (drawn over the night tint) */
    drawGlows: function (c, cam) {
      var g = null;
      for (var i = 0; i < this._entries.length; i++) {
        var e = this._entries[i];
        if (!e.def || !e.def.glow) continue;
        g = g || GG.HomeArt.glowSprite();
        var r = e.id === 'lamp' ? 70 : 46, hy = e.id === 'lamp' ? e.y - 50 : e.y - 20;
        c.drawImage(g, e.x - cam.x - r, hy - cam.y - r, r * 2, r * 2);
      }
    },

    /* The whole room, for the decorating panel's preview: st may be a look
       she is only trying on. No cache - it is only drawn when something changes. */
    drawPreview: function (c, st, opts) {
      opts = opts || {};
      var night = GG.Time.isDark(), items = this.items(), i;
      this.drawStatic(c, st, night, items);
      this.drawFire(c, 1.234);
      var list = [{ y: STAND.y, id: '_decorate', x: STAND.x }];
      for (i = 0; i < items.length; i++) {
        var def = GG.HOME_DECOR.byId.item[items[i].id];
        if (def && !def.wall) list.push({ y: items[i].y, id: items[i].id, x: items[i].x, idx: i });
      }
      list.sort(function (a, b) { return a.y - b.y; });
      for (i = 0; i < list.length; i++) {
        if (opts.hide === list[i].idx) continue;
        GG.HomeArt.drawItem(c, list[i].id, list[i].x, list[i].y, 1.234);
      }
    }
  };
})(window.GG = window.GG || {});
