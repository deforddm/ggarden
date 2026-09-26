/* The yard (v1.20). David: "let's put 'outdoor terrariums' actually outdoors.
   Represent them outside the house and scale them to appropriate size for
   the pets."

   Every Garden Habitat tank is a real little enclosure standing in the
   Flower Garden round the cottage: a fenced patch of ground with the tank's
   decorations in it and the friends who live there walking about inside.
   It is solid at its fence (she walks round it), and walking up to it and
   pressing VISIT opens that tank in My Tanks.

   Where each one stands is a SLOT, chosen the first time the habitat is seen
   and remembered in Save.data.yard by a stable id (`yid`) put on the tank,
   so they never jump about. How big it is depends on who lives in it: a
   hummingbird's corner is small, a dog's run medium and a horse's paddock
   big, and it grows when a bigger friend moves in.

   Drawing is in src/render/yardart.js. This file is the layout, the
   collision, the residents' walking about and the tidying of the garden
   (scenery standing where an enclosure goes is lifted out while it is
   there, and put back when it goes). */
(function (GG) {
  'use strict';

  /* The slots, in the order they are handed out: the front garden first,
     either side of the path, then round the sides and the back. Each is
     anchored at its FRONT edge (by) and centre (cx), so the front fences in
     a row line up; mw x mh is the most room there is there. Kept clear of:
     the door and the path south of it (x 4660-4780), the garden fence at
     y 2506 and its gap, the beehive (4870, 2400), the Home sign (4550, 2496),
     the Stream sign (4430, 2250), the stream to the west and the river to
     the south. tests/v120yard.js checks every one. */
  var SLOTS = [
    { id: 'F1', cx: 4590, by: 2660, mw: 130, mh: 90 },   // front, west of the path
    { id: 'F2', cx: 4895, by: 2690, mw: 190, mh: 120 },  // front, east of the path
    { id: 'B4', cx: 4530, by: 2425, mw: 140, mh: 95 },   // west of the cottage
    { id: 'F3', cx: 5140, by: 2685, mw: 230, mh: 140 },  // front, far east
    { id: 'B1', cx: 5100, by: 2475, mw: 230, mh: 140 },  // east of the cottage, past the hive
    { id: 'F4', cx: 4895, by: 2845, mw: 200, mh: 105 },  // front, second row
    { id: 'B3', cx: 4550, by: 2265, mw: 160, mh: 115 },  // behind, west
    { id: 'B5', cx: 4745, by: 2230, mw: 170, mh: 100 },  // behind the cottage
    { id: 'B2', cx: 5010, by: 2265, mw: 230, mh: 130 },  // behind, east
    { id: 'F5', cx: 5140, by: 2870, mw: 230, mh: 130 }   // front, far east, second row
  ];
  var SLOT_BY_ID = {};
  SLOTS.forEach(function (s, i) { s.i = i; SLOT_BY_ID[s.id] = s; });

  /* How big a friend is, in three steps. The families, not the numbers,
     decide the step: a hoary bat is heavier than a Siamese cat on paper,
     but she needs a bat house, not a run. */
  var TIER = {
    hummingbird: 0, bat: 0, frog: 0, songbird: 0, turtle: 0, salamander: 0, owl: 0,
    dog: 1, cat: 1, parrot: 1, rabbit: 1, squirrel: 1, raccoon: 1, fox: 1, duck: 1,
    chicken: 1, otter: 1, snake: 1, koala: 1, redpanda: 1,
    sheep: 2, cow: 2, horse: 2, deer: 2, bear: 2
  };
  var BASE_W = [110, 150, 205];
  var MIN_W = 110, MAX_W = 230, MIN_H = 70, MAX_H = 140;

  /* how fast each family potters about, px/s at world scale */
  var SPEED = { hummingbird: 46, bat: 50, frog: 0, songbird: 22, turtle: 5, salamander: 6,
    owl: 14, dog: 32, cat: 20, parrot: 16, rabbit: 26, squirrel: 30, raccoon: 18, fox: 26,
    duck: 14, chicken: 16, otter: 24, snake: 10, koala: 8, redpanda: 14,
    sheep: 14, cow: 11, horse: 22, deer: 20, bear: 12 };
  var FLY = { hummingbird: 1, bat: 1 };
  var GRAZE = { sheep: 1, cow: 1, horse: 1, deer: 1 };
  /* who may walk into the little pond in a Pondside habitat. A cat never
     would (Guin: cats hate water). */
  var WET = { frog: 1, duck: 1, otter: 1, turtle: 1, salamander: 1, hummingbird: 1, bat: 1, songbird: 1 };

  /* Scenery that is never lifted out of the way. */
  var KEEP = { house: 1, sign: 1, fence: 1, beehive: 1, caveMouth: 1, bootBrush: 1 };
  /* Things whose crown stands well above their base: one just in front of
     an enclosure would hide it, so those go from a little further out. */
  var TALL = { tree: 1, pine: 1, willow: 1, appleTree: 1, cherryTree: 1, garryOak: 1,
    vineMaple: 1, mossyTrunk: 1, bamboo: 1, snag: 1, oakSnag: 1 };

  function spanOf(def) {
    var S = GG.AnimalArt && GG.AnimalArt.SPAN;
    var base = (S && S[def.art.shape]) || 38;
    return base * (def.size || 1) * 1.15 * (def.art.long ? 1.2 : 1);
  }

  var Yard = GG.Yard = {
    SLOTS: SLOTS,
    TIER: TIER,
    list: [],          // the enclosures standing today
    dirty: true,       // re-read the tanks at the next chance
    _sig: '',
    _t: 0,
    _hidden: [],       // scenery lifted out while an enclosure stands there
    _hive: null,       // which build of the world the hidden list belongs to
    _bx0: 0, _bx1: -1, _by0: 0, _by1: -1,   // all of them, for a quick "nowhere near"
    _entries: null,

    /* ---------- size ---------- */
    /* How big should this habitat be? Returns {w, h, tier}. */
    sizeFor: function (tk) {
      var fr = tk.friends || [], tier = 0, span = 0, n = 0;
      for (var i = 0; i < fr.length; i++) {
        var def = GG.ANIMAL_BY_ID[fr[i].id];
        if (!def) continue;
        n++;
        var tr = TIER[def.family];
        if (tr == null) tr = (def.size || 1) >= 1.1 ? 2 : ((def.size || 1) >= 0.5 ? 1 : 0);
        if (tr > tier) tier = tr;
        var sp = spanOf(def);
        if (sp > span) span = sp;
      }
      var w = Math.max(BASE_W[tier], 60 + span * 2.2);
      if (n > 1) w += (n - 1) * 8;
      w += Math.min((tk.decor || []).length, 12) * 2;
      w = Math.round(GG.clamp(w, MIN_W, MAX_W));
      var h = Math.round(GG.clamp(w * 0.6, MIN_H, MAX_H));
      return { w: w, h: h, tier: tier };
    },

    /* ---------- which tanks, where ---------- */
    habitats: function () {
      var out = [], d = GG.Save.data, T = (d && d.terrariums) || [];
      for (var i = 0; i < T.length; i++) if (T[i] && T[i].type === 'habitat') out.push(i);
      return out;
    },

    signature: function () {
      var d = GG.Save.data, T = (d && d.terrariums) || [], s = (d && d.companion) || '';
      for (var i = 0; i < T.length; i++) {
        var t = T[i];
        if (!t || t.type !== 'habitat') continue;
        s += '|' + i + ':' + (t.yid || '?') + ':' + t.bg + ':' + t.name + ':';
        var fr = t.friends || [], j;
        for (j = 0; j < fr.length; j++) s += fr[j].id + ',';
        s += ':';
        var dc = t.decor || [];
        for (j = 0; j < dc.length; j++) s += dc[j].id + '@' + Math.round(dc[j].x) + '/' + Math.round(dc[j].y) + ',';
      }
      return s;
    },

    newYid: function () {
      return 'y' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    },

    fits: function (slot, need) { return slot.mw >= need.w && slot.mh >= need.h; },

    /* Hand every habitat a slot, keeping the one it already has. */
    assign: function () {
      var d = GG.Save.data, T = d.terrariums || [], changed = false;
      if (!d.yard || typeof d.yard !== 'object') { d.yard = { slot: {} }; changed = true; }
      if (!d.yard.slot) { d.yard.slot = {}; changed = true; }
      var map = d.yard.slot, hab = this.habitats(), used = {}, self = this;
      var seen = {}, want = [];
      hab.forEach(function (i) {
        var tk = T[i];
        if (!tk.yid || seen[tk.yid]) { tk.yid = self.newYid(); changed = true; }
        seen[tk.yid] = 1;
        want.push({ i: i, tk: tk, need: self.sizeFor(tk) });
      });
      /* forget the tanks that are gone, or are not habitats any more */
      Object.keys(map).forEach(function (k) {
        if (!seen[k] || !SLOT_BY_ID[map[k]]) { delete map[k]; changed = true; }
      });
      /* first, everyone who already has a place keeps it */
      want.forEach(function (w) {
        var s = SLOT_BY_ID[map[w.tk.yid]];
        if (s && !used[s.id]) { used[s.id] = w; w.slot = s; } else if (s) { delete map[w.tk.yid]; changed = true; }
      });
      function firstFree(need) {
        var best = null;
        for (var k = 0; k < SLOTS.length; k++) {
          var s = SLOTS[k];
          if (used[s.id]) continue;
          if (!need || self.fits(s, need)) return s;
          if (!best || s.mw * s.mh > best.mw * best.mh) best = s;
        }
        return best;
      }
      /* a friend too big for where they are moves to a place that fits,
         if there is one free */
      want.forEach(function (w) {
        if (!w.slot || self.fits(w.slot, w.need)) return;
        for (var k = 0; k < SLOTS.length; k++) {
          var s = SLOTS[k];
          if (!used[s.id] && self.fits(s, w.need)) {
            delete used[w.slot.id]; used[s.id] = w; w.slot = s;
            map[w.tk.yid] = s.id; changed = true;
            break;
          }
        }
      });
      /* and the new ones take the first place that fits (or the roomiest
         left, if none does) */
      want.forEach(function (w) {
        if (w.slot) return;
        var s = firstFree(w.need) || firstFree(null);
        if (!s) return;   // more habitats than slots: cannot happen at MAX_TANKS 10
        used[s.id] = w; w.slot = s; map[w.tk.yid] = s.id; changed = true;
      });
      return { want: want, changed: changed };
    },

    /* Re-read the tanks and rebuild the enclosures. Cheap unless something
       changed. */
    sync: function (force) {
      var d = GG.Save.data;
      if (!d || !d.terrariums || !GG.World || !GG.World.props) return;
      var sig = this.signature();
      if (!force && sig === this._sig && this._hive === GG.World.hive) return;
      var res = this.assign();
      var old = {}, i;
      for (i = 0; i < this.list.length; i++) old[this.list[i].yid] = this.list[i];
      var list = [];
      for (i = 0; i < res.want.length; i++) {
        var w = res.want[i];
        if (!w.slot) continue;
        var e = old[w.tk.yid] || { yid: w.tk.yid, animals: [], decor: [], entries: [] };
        var s = w.slot;
        var ww = Math.min(w.need.w, s.mw), hh = Math.min(w.need.h, s.mh);
        e.tank = w.tk; e.index = w.i; e.slot = s; e.tier = w.need.tier;
        var geo = s.id + ':' + ww + 'x' + hh;
        if (e.geo !== geo) {
          e.geo = geo;
          e.w = ww; e.h = hh;
          e.cx = s.cx; e.x0 = s.cx - ww / 2; e.x1 = s.cx + ww / 2;
          e.y1 = s.by; e.y0 = s.by - hh; e.cy = (e.y0 + e.y1) / 2;
          /* where she stands to visit: just in front of the gate */
          e.gx = e.cx; e.gy = e.y1 + 18;
        }
        e.bg = GG.TANK_BY_ID[w.tk.bg] ? w.tk.bg : 'backyard';
        e.key = null;            // the art is redrawn next time it is seen
        this.placeDecor(e);
        this.placeAnimals(e);
        list.push(e);
      }
      this.list = list;
      this._sig = this.signature();   // assign() may have added yids
      this._bx0 = 1e9; this._bx1 = -1e9; this._by0 = 1e9; this._by1 = -1e9;
      for (i = 0; i < list.length; i++) {
        var q = list[i];
        this._bx0 = Math.min(this._bx0, q.x0); this._bx1 = Math.max(this._bx1, q.x1);
        this._by0 = Math.min(this._by0, q.y0); this._by1 = Math.max(this._by1, q.y1);
      }
      this.clearScenery();
      this.tidyAround();
      if (res.changed) GG.Save.save();
      this.dirty = false;
    },

    /* The tank's own arrangement, from the 640 x 420 tank picture to the
       enclosure's floor: left-right is kept, and the height in the picture
       becomes how far back it stands. */
    placeDecor: function (e) {
      var dc = e.tank.decor || [], out = [];
      var ix0 = e.x0 + 14, ix1 = e.x1 - 14, iy0 = e.y0 + 10, iy1 = e.y1 - 8;
      for (var i = 0; i < dc.length; i++) {
        var it = dc[i];
        if (!GG.DecorArt[it.id]) continue;
        var fx = GG.clamp(it.x / 640, 0.06, 0.94);
        var fy = GG.clamp((it.y - 270) / 120, 0, 1);
        out.push({ it: it, id: it.id, x: ix0 + fx * (ix1 - ix0), y: iy0 + fy * (iy1 - iy0),
          seed: it.seed || 0.5, sprite: null, entry: null });
      }
      out.sort(function (a, b) { return a.y - b.y; });
      e.decor = out;
    },

    placeAnimals: function (e) {
      var fr = e.tank.friends || [], out = [], prev = e.animals || [];
      for (var i = 0; i < fr.length; i++) {
        var it = fr[i], def = GG.ANIMAL_BY_ID[it.id];
        if (!def) continue;
        var a = null;
        for (var j = 0; j < prev.length; j++) if (prev[j].it === it) { a = prev[j]; break; }
        if (!a) {
          a = { it: it, def: def, t: Math.random() * 10, wait: Math.random() * 2,
            faceLeft: Math.random() < 0.5, gait: 0, bob: 0, tx: 0, ty: 0, hop: 0, entry: null };
          var b = this.box(e, def);
          a.x = GG.clamp(b.x0 + (it.x / 640) * (b.x1 - b.x0), b.x0, b.x1);
          a.y = b.y0 + Math.random() * (b.y1 - b.y0);
          if (!WET[def.family] && this.inPond(e, a.x, a.y, 10)) {
            var pd0 = this.pondOf(e);
            a.x = GG.clamp(pd0.x + pd0.rx + 16, b.x0, Math.max(b.x0, b.x1));
          }
          a.tx = a.x; a.ty = a.y;
        }
        a.def = def;
        var bb = this.box(e, def);
        a.x = GG.clamp(a.x, bb.x0, bb.x1); a.y = GG.clamp(a.y, bb.y0, bb.y1);
        out.push(a);
      }
      e.animals = out;
    },

    /* Where inside the fence an animal's feet may go: far enough from the
       sides that its nose and tail stay inside. */
    box: function (e, def) {
      var sp = spanOf(def);
      var half = Math.min(sp * 0.5 + 4, (e.w - 20) / 2);
      /* a tall animal stands a little further from the back fence, so it
         is plainly inside it and not stood on top of it */
      var back = FLY[def.family] ? 22 : 14 + Math.min(18, sp * 0.2);
      return { x0: e.x0 + 8 + half, x1: e.x1 - 8 - half,
        y0: Math.min(e.y0 + back, e.y1 - 8), y1: e.y1 - 6 };
    },

    /* The little pond in the back corner of a Pondside habitat (drawn by
       yardart.js from the same numbers), or null. */
    pondOf: function (e) {
      if (e.bg !== 'pondside') return null;
      var pw = Math.min(e.w * 0.28, 44), ph = Math.min(e.h * 0.3, 22);
      return { x: e.x0 + 12 + pw, y: e.y0 + 8 + ph, rx: pw + 4, ry: ph + 3 };
    },
    inPond: function (e, x, y, pad) {
      var P = this.pondOf(e);
      if (!P) return false;
      var dx = (x - P.x) / (P.rx + (pad || 0)), dy = (y - P.y) / (P.ry + (pad || 0) * 0.5);
      return dx * dx + dy * dy < 1;
    },

    /* ---------- the garden round them ---------- */
    /* Lift out whatever stands where an enclosure (or its fence, sign or a
       walkable ring round it) goes, and put back anything whose enclosure
       has gone. The dice that placed the scenery are never re-rolled, so
       the rest of the map stays exactly as it was. */
    clearScenery: function () {
      var W = GG.World, O = GG.Orchard, i, p;
      if (this._hive !== W.hive) { this._hidden = []; this._hive = W.hive; }
      var L = this.list, self = this;
      function covered(p) {
        if (KEEP[p.type] === 1) return false;
        for (var k = 0; k < L.length; k++) {
          var e = L[k];
          var side = TALL[p.type] ? 30 + (p.r || 30) : (p.solid ? 30 : 16);
          var below = TALL[p.type] ? 64 : (p.solid ? 30 : 22);
          var above = p.solid ? 34 : 30;
          if (p.x > e.x0 - side - (p.rad || 0) && p.x < e.x1 + side + (p.rad || 0) &&
              p.y > e.y0 - above && p.y < e.y1 + below) return true;
        }
        return false;
      }
      var hide = new Set();
      var props = W.props;
      if (L.length) {
        for (i = 0; i < props.length; i++) if (covered(props[i])) hide.add(props[i]);
      }
      var back = [];
      for (i = 0; i < this._hidden.length; i++) {
        p = this._hidden[i];
        if (covered(p)) hide.add(p); else back.push(p);
      }
      if (!hide.size && !back.length && !this._hidden.length) return;
      var now = props.filter(function (q) { return !hide.has(q); });
      for (i = 0; i < back.length; i++) now.push(back[i]);
      var changed = now.length !== props.length || back.length > 0;
      this._hidden = Array.from(hide);
      if (changed) {
        W.props = now;
        W._rebuildSolids();
        W.reindex();
      }
      /* the plants to pick go with them, and come back with them */
      if (O && O.plants) {
        var keep = O.plants.filter(function (q) { return !hide.has(q); });
        for (i = 0; i < back.length; i++) if (back[i].fruit && keep.indexOf(back[i]) < 0) keep.push(back[i]);
        O.plants = keep;
        if (O.wanted && hide.has(O.wanted)) O.wanted = null;
      }
      void self;
    },

    /* Nothing is left standing inside a fence that has just gone up: not
       Guin, not a wandering friend, not a beetle. */
    tidyAround: function () {
      if (!this.list.length) return;
      var P = GG.Player, i;
      if (P && this.blocked(P.x, P.y, P.rad || 11)) {
        var e = this.inside(P.x, P.y, P.rad || 11) || this.list[0];
        var spot = this.freeNear(e.gx, e.gy, P.rad || 11);
        P.x = spot.x; P.y = spot.y;
      }
      var F = GG.Friends;
      if (F && F.list) {
        for (i = F.list.length - 1; i >= 0; i--) {
          var f = F.list[i];
          if (F.busy && F.busy.animal === f) continue;
          if (this.houses(f.def.id) || this.blocked(f.x, f.y, 6)) F.list.splice(i, 1);
        }
      }
      var C = GG.Critters;
      if (C && C.list && !C.room) {
        for (i = C.list.length - 1; i >= 0; i--) {
          var b = C.list[i];
          if (this.blocked(b.x, b.y, 2)) C.list.splice(i, 1);
        }
      }
    },

    /* the nearest spot to (x, y) that nothing is standing on */
    freeNear: function (x, y, rad) {
      var W = GG.World;
      if (!W.blocked(x, y, rad)) return { x: x, y: y };
      for (var r = 12; r < 400; r += 12) {
        for (var a = 0; a < 16; a++) {
          var ang = Math.PI / 2 + a / 16 * Math.PI * 2;
          var qx = x + Math.cos(ang) * r, qy = y + Math.sin(ang) * r;
          if (!W.blocked(qx, qy, rad) && !W.isWater(qx, qy)) return { x: qx, y: qy };
        }
      }
      return { x: x, y: y };
    },

    /* ---------- the questions the rest of the game asks ---------- */
    /* Called from World.blocked, thousands of times a frame: a quick
       "nowhere near the yard" first. The fence is the edge. */
    blocked: function (x, y, rad) {
      var L = this.list;
      if (!L.length) return false;
      if (x < this._bx0 - rad - 2 || x > this._bx1 + rad + 2 || y < this._by0 - rad || y > this._by1 + rad) return false;
      for (var i = 0; i < L.length; i++) {
        var e = L[i];
        if (x > e.x0 - rad && x < e.x1 + rad && y > e.y0 - rad * 0.5 && y < e.y1 + rad * 0.5) return true;
      }
      return false;
    },
    inside: function (x, y, rad) {
      for (var i = 0; i < this.list.length; i++) {
        var e = this.list[i], r = rad || 0;
        if (x > e.x0 - r && x < e.x1 + r && y > e.y0 - r * 0.5 && y < e.y1 + r * 0.5) return e;
      }
      return null;
    },

    /* Is this friend living in one of the enclosures today? (One copy only:
       a friend in the yard is not also out wandering the garden.) */
    houses: function (id) {
      for (var i = 0; i < this.list.length; i++) {
        var A = this.list[i].animals;
        for (var j = 0; j < A.length; j++) if (A[j].def.id === id) return this.list[i];
      }
      return null;
    },

    /* The enclosure she is standing beside, if any. */
    near: function (P, reach) {
      var best = null, bd = reach || 30;
      for (var i = 0; i < this.list.length; i++) {
        var e = this.list[i];
        var dx = Math.max(e.x0 - P.x, 0, P.x - e.x1);
        var dy = Math.max(e.y0 - P.y, 0, P.y - e.y1) * 1.2;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    },

    /* A tap on an enclosure (its fence, its sign, anything in it). */
    at: function (x, y) {
      for (var i = 0; i < this.list.length; i++) {
        var e = this.list[i];
        if (x > e.x0 - 6 && x < e.x1 + 6 && y > e.y0 - 30 && y < e.y1 + 10) return e;
      }
      return null;
    },

    /* what the prompt and the button call it */
    nameOf: function (e) { return (e && e.tank && e.tank.name) || 'Garden Habitat'; },
    shortName: function (e) {
      var n = this.nameOf(e);
      return n.length > 14 ? 'habitat' : n.toLowerCase();
    },
    promptOf: function (e) {
      var n = this.nameOf(e);
      if (e._pn !== n) { e._pn = n; e._prompt = n + ' — tap VISIT to look after it'; }
      return e._prompt;
    },
    tapped: null,     // the one she tapped on, so VISIT wins over NET there

    /* ---------- every frame ---------- */
    update: function (dt) {
      this._t -= dt;
      if (this.dirty || this._t <= 0 || this._hive !== GG.World.hive) {
        this._t = 1;
        this.sync(false);
        this.dirty = false;
      }
      /* the tap that chose one only counts until she wanders off */
      if (this.tapped && GG.Player && !GG.Input.moveTarget &&
          this.near(GG.Player, 40) !== this.tapped) this.tapped = null;
      var ph = GG.Time && GG.Time.phase ? GG.Time.phase() : 'day';
      var night = ph !== 'day' && ph !== 'morning';
      var comp = GG.Save.data.companion;
      for (var i = 0; i < this.list.length; i++) {
        var e = this.list[i];
        for (var j = 0; j < e.animals.length; j++) this.stepAnimal(dt, e, e.animals[j], night, comp);
      }
    },

    stepAnimal: function (dt, e, a, night, comp) {
      var def = a.def, fam = def.family;
      a.t += dt;
      a.away = comp === def.id;           // out walking with her today
      var b = this.box(e, def);
      var fly = !!FLY[fam];
      /* bats sleep the day away: tucked up under the back rail */
      if (fam === 'bat' && !night) {
        a.roost = true; a.gait = 0;
        a.x += (GG.clamp(a.x, b.x0, b.x1) - a.x);
        a.y += (e.y0 + 3 - a.y) * Math.min(1, dt * 2);
        a.bob = -20;
        return;
      }
      a.roost = false;
      if (a.wait > 0) {
        a.wait -= dt;
        a.gait = 0;
      } else {
        var dx = a.tx - a.x, dy = a.ty - a.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 2) {
          /* rest a while, then potter somewhere not far off. They are at
             home in here, so mostly they are resting: a grazer grazes, a
             cat sits and watches. */
          a.wait = fly ? GG.rand(0.4, 1.6) : GG.rand(2, 5.5);
          if (fam === 'cat') a.wait += GG.rand(2, 5);
          if (GRAZE[fam]) a.wait += GG.rand(3, 6);
          a.tx = GG.clamp(a.x + GG.rand(-80, 80), b.x0, Math.max(b.x0, b.x1));
          a.ty = GG.clamp(a.y + GG.rand(-34, 34), b.y0, Math.max(b.y0, b.y1));
          /* a dry-land animal walks round the pond, never into it */
          if (!WET[fam] && this.inPond(e, a.tx, a.ty, 10)) {
            var pd = this.pondOf(e);
            a.tx = GG.clamp(pd.x + pd.rx + 14 + Math.random() * 30, b.x0, Math.max(b.x0, b.x1));
          }
          a.gait = 0;
          a.rest = (a.rest || 0) + 1;
        } else {
          var sp = SPEED[fam] || 16;
          if (fam === 'frog' || fam === 'rabbit') {
            /* hop, hop */
            if (a.hop <= 0) a.hop = 0.42;
            sp = fam === 'frog' ? 40 : 34;
          }
          var step = Math.min(d, sp * dt);
          a.x += dx / d * step; a.y += dy / d * step;
          if (Math.abs(dx) > 1.5) a.faceLeft = dx < 0;
          a.gait = GG.clamp(sp / 34, 0.2, 1.4);
        }
      }
      if (a.hop > 0) a.hop -= dt;
      a.x = GG.clamp(a.x, b.x0, b.x1); a.y = GG.clamp(a.y, b.y0, b.y1);
      if (fam === 'hummingbird') a.bob = -22 + Math.sin(a.t * 2.6) * 3;
      else if (fam === 'bat') a.bob = -28 + Math.sin(a.t * 1.9) * 5;
      else if (fam === 'frog' || fam === 'rabbit') {
        a.bob = a.hop > 0 ? -Math.sin((1 - a.hop / 0.42) * Math.PI) * (fam === 'frog' ? 9 : 7) : 0;
      } else a.bob = a.gait > 0 ? Math.sin(a.t * 7) * 0.8 : 0;
    },

    /* The enclosures that can be seen, into the sorted list of things to
       draw: the back (ground and far fence), each decoration, each animal,
       then the near fence. They sort in with the trees and Guin, so she can
       stand behind a paddock or in front of it. Entries are made once and
       reused. */
    collect: function (out, cam) {
      var L = this.list;
      if (!L.length) return;
      var vw = GG.view.w, vh = GG.view.h;
      for (var i = 0; i < L.length; i++) {
        var e = L[i];
        if (e.x1 + 20 < cam.x || e.x0 - 20 > cam.x + vw || e.y1 + 30 < cam.y || e.y0 - 90 > cam.y + vh) continue;
        if (!e.eBack) {
          e.eBack = { y: 0, yard: e, part: 'back' };
          e.eFront = { y: 0, yard: e, part: 'front' };
        }
        e.eBack.y = e.y0; out.push(e.eBack);
        for (var j = 0; j < e.decor.length; j++) {
          var dd = e.decor[j];
          if (!dd.entry) dd.entry = { y: 0, yard: e, part: 'decor', d: dd };
          dd.entry.y = dd.y; out.push(dd.entry);
        }
        for (var k = 0; k < e.animals.length; k++) {
          var a = e.animals[k];
          if (a.away) continue;
          if (a.x < cam.x - 70 || a.x > cam.x + vw + 70 || a.y < cam.y - 20 || a.y > cam.y + vh + 90) continue;
          if (!a.entry) a.entry = { y: 0, yard: e, part: 'animal', a: a };
          a.entry.y = a.roost ? e.y0 + 0.5 : a.y; out.push(a.entry);
        }
        e.eFront.y = e.y1; out.push(e.eFront);
      }
    }
  };
})(window.GG = window.GG || {});
