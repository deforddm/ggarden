/* The yard's art (v1.20): each Garden Habitat as a real fenced enclosure
   standing in the garden. See src/game/yard.js for where they go and who
   lives in them.

   The still parts - the ground, the fences, the gate, the name sign and
   each decoration - are painted once into offscreen canvases at the
   screen's own resolution and stamped every frame; only the animals are
   drawn live. The scene the tank was given in My Tanks chooses the ground
   and the fence: the Back Garden has a white picket fence round grass, the
   Sunny Porch a deck and a wooden rail, the Wild Wood a hedge round leaf
   litter, Dusk a dark rail strung with little lights, Pondside a pond in
   the corner and Jungle a bamboo fence round big leaves. A big friend's
   picket becomes a paddock rail. */
(function (GG) {
  'use strict';

  var STYLE = {
    backyard: { fence: 'picket', ground: 'grass', wood: '#f6f2e8', dark: '#cfc6b2' },
    porch: { fence: 'rail', ground: 'deck', wood: '#c98f55', dark: '#91613a' },
    wildwood: { fence: 'hedge', ground: 'forest', wood: '#8a6a44', dark: '#5f4a30' },
    dusk: { fence: 'rail', ground: 'grass', wood: '#6f5039', dark: '#4a3526', lights: true },
    pondside: { fence: 'rail', ground: 'pond', wood: '#b4ad98', dark: '#8a8472' },
    jungle: { fence: 'bamboo', ground: 'jungle', wood: '#cdb45a', dark: '#9c8638' }
  };

  /* how big each decoration stands out here, where a Labrador is life size
     (the tank draws them at 1.75 on a 640 px picture) */
  var DSCALE = { feeder: 0.6, foodbowl: 0.5, lilylog: 0.62, basket: 0.52, branch: 0.7,
    perch: 0.7, birdbath: 0.72, batbox: 0.62, scratchpost: 0.58, kennel: 0.78, vine: 0.72,
    log: 0.72, rock: 0.62, tinypond: 0.95, waterdish: 0.6, fairyhouse: 0.5, bunting: 0.8,
    lantern: 0.6, signplate: 0.55, crystal: 0.55, leaf: 0.45, pebble: 0.5, twig: 0.5 };
  var DSCALE_DEFAULT = 0.5;
  var ANIMAL_SCALE = 1.15;   // as the friends out in the garden (friends.js drawOne)

  function rng(seed) {
    var s = Math.floor(seed * 1e6) >>> 0 || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  }
  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); c.fill();
  }

  var YA = GG.YardArt = {
    STYLE: STYLE,
    DSCALE: DSCALE,

    /* the pixel density the caches are painted at: the screen's own */
    density: function () {
      return (GG.view.zoom || 1) * Math.min(window.devicePixelRatio || 1, 2);
    },

    styleOf: function (e) {
      var st = STYLE[e.bg] || STYLE.backyard;
      var fence = st.fence;
      if (e.tier === 2 && fence === 'picket') fence = 'rail';   // a paddock, for the big ones
      return { fence: fence, ground: st.ground, wood: st.wood, dark: st.dark, lights: !!st.lights,
        bg: GG.TANK_BY_ID[e.bg] || GG.TANK_BY_ID.backyard };
    },

    /* ---------- the caches ---------- */
    ensure: function (e) {
      var k = this.density();
      /* yard.js clears e.key whenever the habitat changes */
      if (e.key && e.cBack && e.k === k) return;
      e.k = k;
      e.key = e.geo + '|' + e.bg + '|' + e.tier;
      var st = this.styleOf(e);
      YA._bulbs = e.bulbs = [];      // where the little lights are, for drawLights
      /* the back: the ground, the far fence and both sides */
      e.bx = e.x0 - 12; e.by = e.y0 - 38; e.bw = e.w + 24; e.bh = e.h + 38 + 8;
      e.cBack = this.paint(e.cBack, e.bw, e.bh, k, function (c) {
        c.translate(-e.bx, -e.by);
        YA.drawGround(c, e, st);
        YA.fenceH(c, e.x0, e.x1, e.y0, st, e, null);
        YA.fenceV(c, e.x0, e.y0, e.y1, st, e);
        YA.fenceV(c, e.x1, e.y0, e.y1, st, e);
      });
      /* the front: the near fence, the gate and the name on its post */
      e.fx = e.x0 - 12; e.fy = e.y1 - 52; e.fw = e.w + 24; e.fh = 52 + 16;
      e.cFront = this.paint(e.cFront, e.fw, e.fh, k, function (c) {
        c.translate(-e.fx, -e.fy);
        var gate = [e.cx - 13, e.cx + 13];
        YA.fenceH(c, e.x0, e.x1, e.y1, st, e, gate);
        YA.gate(c, gate[0], gate[1], e.y1, st);
        YA.sign(c, e);
      });
      YA._bulbs = null;
      for (var i = 0; i < e.decor.length; i++) e.decor[i].sprite = null;
    },

    paint: function (cv, w, h, k, fn) {
      cv = cv || document.createElement('canvas');
      var pw = Math.max(1, Math.ceil(w * k)), ph = Math.max(1, Math.ceil(h * k));
      /* resizing a canvas throws its memory away, so only when it must */
      if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
      var c = cv.getContext('2d');
      c.setTransform(k, 0, 0, k, 0, 0);
      c.clearRect(0, 0, w, h);
      c.save();
      fn(c);
      c.restore();
      return cv;
    },

    decorSprite: function (e, dd) {
      var k = this.density();
      if (dd.sprite && dd.k === k) return dd.sprite;
      var s = DSCALE[dd.id] || DSCALE_DEFAULT;
      dd.s = s; dd.k = k;
      dd.sx = 66 * s; dd.sy = 80 * s;              // where the item's foot is, in the sprite
      dd.sw = 132 * s; dd.sh = 100 * s;
      dd.sprite = this.paint(dd.sprite, dd.sw, dd.sh, k, function (c) {
        c.translate(dd.sx, dd.sy);
        YA.drawDecor(c, dd.id, 0, 0, s, 1 + dd.seed * 10);
      });
      return dd.sprite;
    },

    /* One decoration, standing on the ground. A couple of the habitat
       pieces hang in the air in the tank; out here they get something to
       hang from. */
    drawDecor: function (c, id, x, y, s, t) {
      if (id === 'feeder') {
        /* a shepherd's hook */
        c.strokeStyle = '#5d6166'; c.lineWidth = 2.2 * s; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(x + 14 * s, y + 2 * s);
        c.lineTo(x + 14 * s, y - 62 * s);
        c.quadraticCurveTo(x + 14 * s, y - 72 * s, x + 6 * s, y - 70 * s);
        c.quadraticCurveTo(x, y - 68 * s, x, y - 60 * s);
        c.stroke();
        c.fillStyle = 'rgba(30,50,25,0.16)'; ell(c, x + 14 * s, y + 2 * s, 5 * s, 1.8 * s);
      } else if (id === 'branch') {
        /* a forked post to hold it up */
        c.fillStyle = 'rgba(30,50,25,0.16)'; ell(c, x - 8 * s, y + 1, 7 * s, 2.4 * s);
        c.strokeStyle = '#7a5a3a'; c.lineWidth = 4 * s; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x - 8 * s, y); c.lineTo(x - 9 * s, y - 34 * s); c.stroke();
      }
      var fn = GG.DecorArt[id];
      if (fn) fn(c, x, y, s, t);
    },

    /* ---------- ground ---------- */
    drawGround: function (c, e, st) {
      var bg = st.bg, R = rng(hashStr(e.yid || 'y'));
      var x0 = e.x0, y0 = e.y0, w = e.w, h = e.h;
      /* a soft shadow round the edge, where the grass meets the fence */
      c.fillStyle = 'rgba(30,50,25,0.16)';
      GG.roundRect(c, x0 - 3, y0 - 2, w + 6, h + 6, 8); c.fill();
      c.save();
      GG.roundRect(c, x0, y0, w, h, 6); c.clip();
      var base = bg.ground, alt = bg.ground2;
      if (st.ground === 'deck') {
        c.fillStyle = base; c.fillRect(x0, y0, w, h);
        c.strokeStyle = GG.shade(base, -0.18); c.lineWidth = 1;
        for (var py = y0 + 6; py < y0 + h; py += 7) {
          c.beginPath(); c.moveTo(x0, py); c.lineTo(x0 + w, py); c.stroke();
          /* the plank ends, staggered */
          var off = ((py - y0) / 7 % 2) ? 0 : 23;
          for (var px = x0 + off + 10; px < x0 + w; px += 46) {
            c.beginPath(); c.moveTo(px, py - 7); c.lineTo(px, py); c.stroke();
          }
        }
        c.fillStyle = 'rgba(255,255,255,0.10)';
        for (var q = 0; q < 6; q++) c.fillRect(x0 + R() * w, y0 + R() * h, 14 + R() * 20, 1.4);
      } else {
        c.fillStyle = base; c.fillRect(x0, y0, w, h);
        /* soft patches of the second colour */
        c.fillStyle = alt;
        var n = Math.round(w * h / 1400);
        for (var i = 0; i < n; i++) {
          ell(c, x0 + R() * w, y0 + R() * h, 8 + R() * 16, 4 + R() * 7);
        }
        if (st.ground === 'forest') {
          /* leaf litter and a mossy stone */
          var LEAF = ['#9a6a36', '#b3874a', '#7f5a34', '#8f8440', '#6f8a40'];
          c.fillStyle = 'rgba(92,70,40,0.22)';
          for (var m = 0; m < w * h / 1800; m++) ell(c, x0 + R() * w, y0 + R() * h, 10 + R() * 14, 5 + R() * 6);
          for (var l = 0; l < w * h / 260; l++) {
            c.fillStyle = LEAF[Math.floor(R() * LEAF.length)];
            ell(c, x0 + R() * w, y0 + R() * h, 1.8 + R() * 1.4, 1 + R() * 0.8, R() * 3);
          }
          c.fillStyle = '#8e9488'; ell(c, x0 + w * 0.82, y0 + h * 0.3, 7, 4);
          c.fillStyle = '#6f9a4a'; ell(c, x0 + w * 0.82, y0 + h * 0.3 - 2, 6, 2.4);
        } else if (st.ground === 'jungle') {
          for (var b = 0; b < w * h / 700; b++) {
            var lx = x0 + R() * w, ly = y0 + R() * h, ang = R() * Math.PI * 2;
            c.fillStyle = R() < 0.5 ? '#2f6f38' : '#4f9a4a';
            ell(c, lx, ly, 7 + R() * 5, 3 + R() * 2, ang);
            c.strokeStyle = 'rgba(20,60,20,0.5)'; c.lineWidth = 0.6;
            c.beginPath(); c.moveTo(lx - Math.cos(ang) * 7, ly - Math.sin(ang) * 7);
            c.lineTo(lx + Math.cos(ang) * 7, ly + Math.sin(ang) * 7); c.stroke();
          }
        } else if (st.ground === 'pond') {
          /* a little pond in the back corner, for the frogs */
          var PD = GG.Yard.pondOf(e);
          var pw = PD.rx - 4, ph = PD.ry - 3, pcx = PD.x, pcy = PD.y;
          c.fillStyle = '#6f9a58'; ell(c, pcx, pcy, pw + 4, ph + 3);
          c.fillStyle = '#7cc6da'; ell(c, pcx, pcy, pw, ph);
          c.fillStyle = '#9fdcea'; ell(c, pcx - pw * 0.2, pcy - ph * 0.25, pw * 0.55, ph * 0.4);
          c.fillStyle = '#5fae55'; ell(c, pcx + pw * 0.35, pcy + ph * 0.2, 5, 3);
          c.fillStyle = '#ff9fc0'; ell(c, pcx + pw * 0.38, pcy + ph * 0.1, 1.6, 1.2);
          c.strokeStyle = '#6f8a3a'; c.lineWidth = 1.2; c.lineCap = 'round';
          for (var r2 = 0; r2 < 4; r2++) {
            var rx = pcx - pw - 2 + r2 * 3;
            c.beginPath(); c.moveTo(rx, pcy + 2); c.lineTo(rx - 1 + r2, pcy - 12 - r2 * 2); c.stroke();
          }
        }
        /* tufts, and a few clover flowers on the grassy ones */
        c.strokeStyle = GG.shade(alt, -0.2); c.lineWidth = 1.1; c.lineCap = 'round';
        var tufts = Math.round(w * h / 500);
        for (var tt = 0; tt < tufts; tt++) {
          var tx = x0 + R() * w, ty = y0 + 6 + R() * (h - 6);
          c.beginPath();
          c.moveTo(tx - 2, ty); c.lineTo(tx - 3, ty - 4);
          c.moveTo(tx, ty); c.lineTo(tx, ty - 5);
          c.moveTo(tx + 2, ty); c.lineTo(tx + 3, ty - 4);
          c.stroke();
        }
        if (st.ground === 'grass' || st.ground === 'pond') {
          for (var f = 0; f < w * h / 2600; f++) {
            c.fillStyle = e.bg === 'dusk' ? '#e8e6ff' : (R() < 0.5 ? '#fff6d8' : '#ffc6d8');
            ell(c, x0 + 8 + R() * (w - 16), y0 + 8 + R() * (h - 12), 1.5, 1.2);
          }
        }
      }
      /* the fence throws a little shade on the ground inside */
      var g = c.createLinearGradient(0, y0, 0, y0 + 14);
      g.addColorStop(0, 'rgba(20,40,20,0.22)'); g.addColorStop(1, 'rgba(20,40,20,0)');
      c.fillStyle = g; c.fillRect(x0, y0, w, 14);
      /* a worn path from the gate in */
      c.fillStyle = 'rgba(120,90,50,0.13)';
      ell(c, e.cx, e.y1 - 5, 12, 6);
      ell(c, e.cx, e.y1 - 14, 8, 4);
      c.restore();
    },

    /* ---------- fences ---------- */
    /* A straight run across (the back and the front). `gap` is left for the
       gate. */
    fenceH: function (c, xa, xb, y, st, e, gap) {
      var f = st.fence, wood = st.wood, dark = st.dark;
      function open(x, pad) { return gap && x > gap[0] - (pad || 0) && x < gap[1] + (pad || 0); }
      /* its shadow on the grass */
      c.fillStyle = 'rgba(30,50,25,0.16)';
      c.fillRect(xa - 2, y, xb - xa + 4, 3);
      var x;
      if (f === 'picket') {
        c.fillStyle = dark;
        this.railH(c, xa, xb, y - 6, 2.2, gap);
        this.railH(c, xa, xb, y - 13, 2.2, gap);
        for (x = xa; x <= xb + 0.1; x += 6.5) {
          if (open(x, 2)) continue;
          this.picket(c, x, y, wood, dark);
        }
      } else if (f === 'rail') {
        var n = Math.max(2, Math.round((xb - xa) / 24));
        c.fillStyle = dark;
        this.railH(c, xa, xb, y - 15.5, 3.4, gap);
        this.railH(c, xa, xb, y - 8.5, 3.4, gap);
        c.fillStyle = wood;
        this.railH(c, xa, xb, y - 16, 2.6, gap);
        this.railH(c, xa, xb, y - 9, 2.6, gap);
        for (var i = 0; i <= n; i++) {
          x = xa + (xb - xa) * i / n;
          if (open(x, 3)) continue;
          this.post(c, x, y, 20, wood, dark);
        }
        if (st.lights) this.lights(c, xa, xb, y - 19, gap);
      } else if (f === 'hedge') {
        if (!gap) this.hedgeH(c, xa, xb, y);
        else { this.hedgeH(c, xa, gap[0] - 3, y); this.hedgeH(c, gap[1] + 3, xb, y); }
      } else if (f === 'bamboo') {
        c.fillStyle = dark;
        this.railH(c, xa, xb, y - 13, 2.4, gap);
        for (x = xa; x <= xb + 0.1; x += 4.6) {
          if (open(x, 2)) continue;
          this.cane(c, x, y, 18 + ((x * 7.3) % 5), wood, dark);
        }
        c.fillStyle = '#7a6a2e';
        this.railH(c, xa, xb, y - 7, 1.6, gap);
      }
    },
    railH: function (c, xa, xb, y, th, gap) {
      if (!gap) { c.fillRect(xa, y - th / 2, xb - xa, th); return; }
      c.fillRect(xa, y - th / 2, gap[0] - xa, th);
      c.fillRect(gap[1], y - th / 2, xb - gap[1], th);
    },

    /* A run going back into the picture (the two sides): the posts stand
       one behind the other, nearest drawn last. */
    fenceV: function (c, x, ya, yb, st, e) {
      var f = st.fence, wood = st.wood, dark = st.dark, y;
      c.fillStyle = 'rgba(30,50,25,0.14)';
      c.fillRect(x - 2, ya, 4, yb - ya);
      if (f === 'picket') {
        c.fillStyle = dark;
        c.fillRect(x - 1.1, ya - 13, 2.2, yb - ya);
        c.fillRect(x - 1.1, ya - 6, 2.2, yb - ya);
        for (y = ya; y <= yb + 0.1; y += 5) this.picket(c, x, y, wood, dark, true);
      } else if (f === 'rail') {
        c.fillStyle = dark; c.fillRect(x - 1.7, ya - 16, 3.4, yb - ya);
        c.fillStyle = wood; c.fillRect(x - 1.3, ya - 16, 2.6, yb - ya);
        c.fillStyle = dark; c.fillRect(x - 1.7, ya - 9, 3.4, yb - ya);
        c.fillStyle = wood; c.fillRect(x - 1.3, ya - 9, 2.6, yb - ya);
        var n = Math.max(1, Math.round((yb - ya) / 22));
        for (var i = 0; i <= n; i++) this.post(c, x, ya + (yb - ya) * i / n, 20, wood, dark);
        if (st.lights) this.lightsV(c, x, ya, yb);
      } else if (f === 'hedge') {
        this.hedgeV(c, x, ya, yb);
      } else if (f === 'bamboo') {
        for (y = ya; y <= yb + 0.1; y += 3.4) this.cane(c, x, y, 18 + ((y * 5.1) % 5), wood, dark);
      }
    },

    picket: function (c, x, y, wood, dark, side) {
      var w = side ? 3.2 : 4.2, h = 16;
      c.fillStyle = dark;
      c.beginPath();
      c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - h); c.lineTo(x, y - h - 3);
      c.lineTo(x + w / 2, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
      c.fillStyle = wood;
      c.beginPath();
      c.moveTo(x - w / 2, y - 0.6); c.lineTo(x - w / 2, y - h); c.lineTo(x, y - h - 3);
      c.lineTo(x + w / 2 - 0.9, y - h + 0.4); c.lineTo(x + w / 2 - 0.9, y - 0.6); c.closePath(); c.fill();
    },
    post: function (c, x, y, h, wood, dark) {
      c.fillStyle = dark; c.fillRect(x - 2.4, y - h, 4.8, h);
      c.fillStyle = wood; c.fillRect(x - 2.4, y - h, 3.6, h - 0.5);
      c.fillStyle = GG.shade(wood, 0.12); c.fillRect(x - 2.6, y - h - 1.2, 5.2, 1.8);
    },
    /* A clipped hedge: a dark body, a bumpy lighter top, a few bright
       leaves and the odd white flower. */
    hedgeH: function (c, xa, xb, y) {
      if (xb - xa < 4) return;
      var H = 15, x, j;
      c.fillStyle = '#2c5a2a';
      GG.roundRect(c, xa - 4, y - H, xb - xa + 8, H + 1, 5); c.fill();
      c.fillStyle = '#3d7838';
      for (x = xa - 1; x <= xb + 1; x += 5.5) {
        j = Math.sin(x * 1.37) * 1.2;
        ell(c, x, y - H + 2 + j, 4.4, 3.6);
      }
      c.fillRect(xa - 3, y - H + 2, xb - xa + 6, 6);
      c.fillStyle = '#5d9f4e';
      for (x = xa; x <= xb; x += 7.5) ell(c, x + Math.sin(x) * 1.5, y - H + 1.2 + Math.sin(x * 2.1), 2.2, 1.5);
      c.fillStyle = 'rgba(20,45,20,0.35)';
      c.fillRect(xa - 4, y - 4, xb - xa + 8, 3.5);
      for (x = xa + 4; x < xb; x += 23) {
        if (Math.sin(x * 3.1) > 0.3) { c.fillStyle = '#fff8f0'; ell(c, x, y - H + 4, 1.1, 1.1); }
      }
    },
    hedgeV: function (c, x, ya, yb) {
      var H = 15, y;
      c.fillStyle = '#2c5a2a';
      GG.roundRect(c, x - 6, ya - H, 12, yb - ya + H + 1, 5); c.fill();
      c.fillStyle = '#3d7838';
      c.fillRect(x - 4.6, ya - H + 2, 9.2, yb - ya);
      for (y = ya - H + 3; y <= yb - H + 2; y += 5) {
        ell(c, x - 4.2 + Math.sin(y * 1.9) * 0.6, y, 2.6, 3.2);
        ell(c, x + 4.2 + Math.sin(y * 1.3) * 0.6, y + 2.4, 2.6, 3.2);
      }
      c.fillStyle = '#5d9f4e';
      for (y = ya - H + 4; y <= yb - H; y += 9) ell(c, x + Math.sin(y) * 2, y, 1.8, 1.4);
    },
    cane: function (c, x, y, h, wood, dark) {
      c.fillStyle = dark; c.fillRect(x - 1.6, y - h, 3.2, h);
      c.fillStyle = wood; c.fillRect(x - 1.6, y - h, 2.3, h);
      c.fillStyle = dark;
      for (var k = 5; k < h; k += 6) c.fillRect(x - 1.7, y - k, 3.4, 0.9);
      c.fillStyle = GG.shade(wood, 0.2); ell(c, x, y - h, 1.6, 0.8);
    },

    /* a string of little lights along the top of the rail (Dusk) */
    lights: function (c, xa, xb, y, gap) {
      var COL = ['#ffe27a', '#ff9fc0', '#9fe0ff', '#c6ff9f'];
      c.strokeStyle = 'rgba(40,30,20,0.7)'; c.lineWidth = 0.7;
      var i = 0;
      for (var x = xa; x < xb; x += 24) {
        var x2 = Math.min(xb, x + 24);
        if (gap && x2 > gap[0] && x < gap[1]) continue;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + x2) / 2, y + 6, x2, y); c.stroke();
        for (var b = 1; b < 4; b++) {
          var bx = x + (x2 - x) * b / 4, by = y + Math.sin(b / 4 * Math.PI) * 4.4;
          c.fillStyle = COL[i++ % COL.length]; ell(c, bx, by + 1.2, 1.4, 1.8);
          if (YA._bulbs) YA._bulbs.push(bx, by + 1.2);
        }
      }
    },
    lightsV: function (c, x, ya, yb) {
      var COL = ['#ffe27a', '#ff9fc0', '#9fe0ff', '#c6ff9f'];
      for (var y = ya + 4, i = 0; y < yb; y += 8, i++) {
        c.fillStyle = COL[i % COL.length]; ell(c, x, y - 18, 1.3, 1.6);
        if (YA._bulbs && i % 2 === 0) YA._bulbs.push(x, y - 18);
      }
    },

    /* ---------- the gate ---------- */
    gate: function (c, gx0, gx1, y, st) {
      var wood = st.fence === 'picket' ? st.wood : (st.fence === 'hedge' ? '#b8894f' : st.wood);
      var dark = st.fence === 'picket' ? st.dark : (st.fence === 'hedge' ? '#7a5a34' : st.dark);
      this.post(c, gx0, y, 22, wood, dark);
      this.post(c, gx1, y, 22, wood, dark);
      /* the gate itself, shut, with a brace across it */
      c.fillStyle = dark;
      c.fillRect(gx0 + 2.4, y - 15.5, gx1 - gx0 - 4.8, 2.8);
      c.fillRect(gx0 + 2.4, y - 6.5, gx1 - gx0 - 4.8, 2.8);
      c.fillStyle = wood;
      c.fillRect(gx0 + 2.4, y - 16, gx1 - gx0 - 4.8, 2.2);
      c.fillRect(gx0 + 2.4, y - 7, gx1 - gx0 - 4.8, 2.2);
      for (var x = gx0 + 5.5; x < gx1 - 3; x += 4.2) {
        c.fillStyle = dark; c.fillRect(x - 1.2, y - 17, 2.4, 13);
        c.fillStyle = wood; c.fillRect(x - 1.2, y - 17, 1.7, 12.6);
      }
      c.strokeStyle = dark; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(gx0 + 3, y - 5); c.lineTo(gx1 - 3, y - 15); c.stroke();
      /* the latch */
      c.fillStyle = '#5d6166'; ell(c, gx1 - 4.5, y - 11, 1.3, 1.3);
    },

    /* ---------- the name, on a post by the gate ---------- */
    sign: function (c, e) {
      var name = GG.Yard.nameOf(e);
      var fs = 9, font, tw, maxW = Math.max(60, e.w - 16);
      for (; fs >= 7; fs--) {
        font = 'bold ' + fs + 'px "Trebuchet MS", sans-serif';
        c.font = font; tw = c.measureText(name).width;
        if (tw + 10 <= maxW) break;
      }
      if (tw + 10 > maxW) {
        while (name.length > 3 && c.measureText(name + '…').width + 10 > maxW) name = name.slice(0, -1);
        name += '…'; tw = c.measureText(name).width;
      }
      var bw = tw + 10, bh = fs + 6;
      var px = e.cx - 13 - 7;                 // the post, just left of the gate
      var bx = GG.clamp(px - bw * 0.72, e.x0 - 8, e.x1 + 8 - bw);
      var py = e.y1 + 7;
      var top = py - 30;
      c.fillStyle = 'rgba(30,50,25,0.2)'; ell(c, px, py, 4, 1.6);
      c.fillStyle = '#7a5a3a'; c.fillRect(px - 1.4, top + bh - 1, 2.8, py - top - bh + 1);
      c.fillStyle = '#9a7247'; c.fillRect(px - 1.4, top + bh - 1, 1.8, py - top - bh + 1);
      c.fillStyle = '#e8cf9c';
      GG.roundRect(c, bx, top, bw, bh, 2.5); c.fill();
      c.strokeStyle = '#9a7247'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(bx + 2, top + 1.6, bw - 4, 1);
      c.fillStyle = '#5b432a';
      c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(name, bx + bw / 2, top + bh / 2 + 0.5);
      /* a heart on the gate post, because they live here */
      c.fillStyle = '#ff7fa6';
      var hx = e.cx + 13, hy = e.y1 - 25.5;
      c.beginPath();
      c.moveTo(hx, hy + 2.2);
      c.bezierCurveTo(hx - 3.2, hy - 0.6, hx - 1.8, hy - 3.2, hx, hy - 1.4);
      c.bezierCurveTo(hx + 1.8, hy - 3.2, hx + 3.2, hy - 0.6, hx, hy + 2.2);
      c.fill();
    },

    /* ---------- every frame ---------- */
    drawEntry: function (c, d, cam, t) {
      var e = d.yard;
      this.ensure(e);
      if (d.part === 'back') {
        c.drawImage(e.cBack, e.bx - cam.x, e.by - cam.y, e.bw, e.bh);
      } else if (d.part === 'front') {
        c.drawImage(e.cFront, e.fx - cam.x, e.fy - cam.y, e.fw, e.fh);
      } else if (d.part === 'decor') {
        var dd = d.d, sp = this.decorSprite(e, dd);
        c.drawImage(sp, dd.x - dd.sx - cam.x, dd.y - dd.sy - cam.y, dd.sw, dd.sh);
      } else if (d.part === 'animal') {
        this.drawAnimal(c, e, d.a, cam, t);
      }
    },

    drawAnimal: function (c, e, a, cam, t) {
      var def = a.def, sx = a.x - cam.x, sy = a.y - cam.y;
      if (a.roost) {
        /* a bat asleep in the day: hanging upside down from the back rail
           (painted once - she does not move) */
        this.roostSprite(a);
        c.drawImage(a.spr, sx - a.sprAx, e.y0 - 16 - cam.y - a.sprAy, a.sprW, a.sprH);
        return;
      }
      GG.AnimalArt.shadow(c, sx, sy + 2, 9 * (def.size || 1), a.bob < -6 ? 0.1 : 0.18);
      /* Standing still, an animal is kept as a picture painted once when it
         stops (yard.js counts each rest in a.rest), so a paddock of dozing
         animals costs almost nothing. Moving, it is drawn fresh every frame
         exactly as the friends out in the garden are (friends.js drawOne).
         (Repainting the pictures several times a second was tried and was
         slower: stamping a canvas that has just been painted makes the
         browser stop and flush.) */
      if (a.gait === 0 && a.bob === 0) {
        this.restSprite(a, t);
        c.drawImage(a.spr, sx - a.sprAx, sy - a.sprAy, a.sprW, a.sprH);
        return;
      }
      GG.AnimalArt.draw(c, def, sx, sy + a.bob, ANIMAL_SCALE, a.faceLeft, t + a.t, a.gait);
    },

    restSprite: function (a, t) {
      var k = this.density(), def = a.def;
      if (a.spr && !a.sprRoost && a.sprK === k && a.sprDef === def && a.sprFace === a.faceLeft &&
          a.sprRest === a.rest) return;
      this.spriteBox(a, k, false);
      a.sprRest = a.rest;
      var at = t + a.t;
      a.spr = this.paint(a.spr, a.sprW, a.sprH, k, function (c) {
        c.translate(a.sprAx, a.sprAy);
        GG.AnimalArt.draw(c, def, 0, 0, ANIMAL_SCALE, a.faceLeft, at, 0);
      });
    },
    spriteBox: function (a, k, roost) {
      var def = a.def;
      var span = (GG.AnimalArt.SPAN[def.art.shape] || 38) * (def.size || 1) * ANIMAL_SCALE * (def.art.long ? 1.2 : 1);
      a.sprW = Math.ceil(span * 1.5 + 24);
      a.sprH = Math.ceil(span * 1.25 + 34);
      a.sprAx = a.sprW / 2; a.sprAy = roost ? 4 : a.sprH - 8;
      a.sprK = k; a.sprDef = def; a.sprFace = a.faceLeft; a.sprRoost = roost;
    },

    roostSprite: function (a) {
      var k = this.density(), def = a.def;
      if (a.spr && a.sprRoost && a.sprK === k && a.sprDef === def && a.sprFace === a.faceLeft) return;
      this.spriteBox(a, k, true);
      a.spr = this.paint(a.spr, a.sprW, a.sprH, k, function (c) {
        c.translate(a.sprAx, a.sprAy);
        c.scale(1, -1);
        GG.AnimalArt.draw(c, def, 0, -2, ANIMAL_SCALE * 0.9, a.faceLeft, 0, 0);
      });
    },

    /* After the night has been laid over the world (main.js, beside
       GG.FX.drawLights): the Dusk habitat's string of little lights and
       any lantern or glow crystal inside a fence shine. */
    _glow: null,
    glowSprite: function () {
      if (this._glow) return this._glow;
      var cv = document.createElement('canvas'); cv.width = cv.height = 64;
      var c = cv.getContext('2d');
      var g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,236,170,1)');
      g.addColorStop(0.35, 'rgba(255,210,120,0.45)');
      g.addColorStop(1, 'rgba(255,190,90,0)');
      c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      this._glow = cv;
      return cv;
    },
    GLOWS: { lantern: [0, -16, 64], crystal: [0, -12, 50], fairyhouse: [0, -10, 40] },
    drawLights: function (c, cam, t, night) {
      if (!(night > 0.05) || !GG.Yard || !GG.Yard.list.length) return;
      var L = GG.Yard.list, vw = GG.view.w, vh = GG.view.h, g = this.glowSprite();
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < L.length; i++) {
        var e = L[i];
        if (e.x1 + 20 < cam.x || e.x0 - 20 > cam.x + vw || e.y1 + 30 < cam.y || e.y0 - 60 > cam.y + vh) continue;
        var B = e.bulbs;
        if (B) {
          for (var k = 0; k < B.length; k += 2) {
            c.globalAlpha = night * (0.55 + 0.25 * Math.sin(t * 2.2 + k));
            c.drawImage(g, B[k] - 6 - cam.x, B[k + 1] - 6 - cam.y, 12, 12);
          }
        }
        for (var j = 0; j < e.decor.length; j++) {
          var dd = e.decor[j], G = this.GLOWS[dd.id];
          if (!G) continue;
          var s = DSCALE[dd.id] || DSCALE_DEFAULT, r = G[2] * s;
          c.globalAlpha = night * 0.7;
          c.drawImage(g, dd.x + G[0] * s - r / 2 - cam.x, dd.y + G[1] * s - r / 2 - cam.y, r, r);
        }
      }
      c.restore();
    },

    /* everything at once, in y order - for the tests and overview pictures */
    drawAll: function (c, cam, t) {
      var out = [];
      GG.Yard.collect(out, cam);
      out.sort(function (a, b) { return a.y - b.y; });
      for (var i = 0; i < out.length; i++) this.drawEntry(c, out[i], cam, t);
    }
  };
})(window.GG = window.GG || {});
