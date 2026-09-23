/* Flowers, drawn with code like the fruit.
   Each flower shape is one bloom on a short stem with its own real leaves,
   about 26 pixels tall at scale 1 and centred on (0, 0), so it slots into
   GG.FruitArt.shapes next to the peaches and the plums. The colours come from
   the def: petal, petal2, centre, stemCol (and leaf, when it has one).
   GG.FruitArt.blobs gets a tiny bold version of each for the world.
   GG.FlowerArt.draw can also draw a flower still in bud (bloom < 1) and a cut
   flower without its ground leaves, which the flower clump and the jar use. */
(function (GG) {
  'use strict';

  var TAU = Math.PI * 2;

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath();
    c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU);
    c.fill();
  }
  function sh(col, amt) {
    return (typeof col === 'string' && col.charAt(0) === '#' && col.length === 7) ? GG.shade(col, amt) : col;
  }
  function lum(col) {
    if (typeof col !== 'string' || col.charAt(0) !== '#' || col.length !== 7) return 0.5;
    var n = parseInt(col.slice(1), 16);
    return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
  }
  function leafAt(c, x, y, r, col, rot, vein) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(r * 0.9, -r * 0.7, r * 2, 0);
    c.quadraticCurveTo(r * 0.9, r * 0.7, 0, 0);
    c.closePath(); c.fill();
    if (vein !== false) {
      c.strokeStyle = sh(col, -0.25); c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(0.2, 0); c.lineTo(r * 1.8, 0); c.stroke();
    }
    c.restore();
  }
  /* a long grass-like blade from the ground: tulips, daffodils, camas */
  function blade(c, x, y, len, w, bend, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - w, y);
    c.quadraticCurveTo(x - w + bend * 0.5, y - len * 0.6, x + bend, y - len);
    c.quadraticCurveTo(x + w + bend * 0.5, y - len * 0.6, x + w, y);
    c.closePath(); c.fill();
  }
  /* one rounded petal lying along angle `ang`, from `inner` out to `outer` */
  function petal(c, ang, inner, outer, w) {
    var m = (inner + outer) / 2;
    ell(c, Math.cos(ang) * m, Math.sin(ang) * m, (outer - inner) / 2, w, ang);
  }
  /* one pointed petal (daffodil, camas) */
  function point(c, ang, len, w) {
    c.save(); c.rotate(ang);
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.45, -w, len, 0);
    c.quadraticCurveTo(len * 0.45, w, 0, 0);
    c.closePath(); c.fill();
    c.restore();
  }

  /* a stem can be purple-brown (fireweed); the leaves still need to be green */
  function greenish(col) {
    if (typeof col !== 'string' || col.charAt(0) !== '#' || col.length !== 7) return true;
    var n = parseInt(col.slice(1), 16);
    return ((n >> 8) & 255) >= Math.max((n >> 16) & 255, n & 255);
  }
  /* worked out once per flower def - the defs never change while playing */
  var colMemo = typeof WeakMap === 'function' ? new WeakMap() : null;
  function colours(a) {
    if (!colMemo || !a || typeof a !== 'object') return coloursRaw(a);
    var C = colMemo.get(a);
    if (!C) { C = coloursRaw(a); colMemo.set(a, C); }
    return C;
  }
  function coloursRaw(a) {
    var p = a.petal || a.skin || '#e0608a';
    var sc = a.stemCol || '#4f8a3a';
    return {
      p: p,
      p2: a.petal2 || a.skin2 || sh(p, -0.2),
      centre: a.centre || '#f0c030',
      stem: sc,
      leaf: a.leaf || (greenish(sc) ? sh(sc, 0.1) : '#5f8a4a'),
      light: lum(p) > 0.86
    };
  }
  function floretKind(a) {
    if (a.floret) return a.floret;
    var id = (a.id || '') + ' ' + (a.name || '');
    if (/lupin/i.test(id)) return 'pea';
    if (/fireweed|willowherb/i.test(id)) return 'cross';
    return 'whorl';
  }
  function bigDaisy(a, C) {
    return a.big != null ? !!a.big : lum(C.centre) < 0.3;
  }
  function daisyLeaves(a, C) {
    if (a.leafForm) return a.leafForm;
    if (/balsam/i.test((a.id || '') + (a.name || ''))) return 'arrow';
    return bigDaisy(a, C) ? 'heart' : 'narrow';
  }

  /* ------------------------------------------------------------------
     Each kind: top (y where the stem ends and the head sits), basal (the
     leaves on the ground, left out of a cut flower), leaves (on the stem),
     head (drawn with the origin at the top of the stem), bud (the closed
     flower while it grows back, g = 0..1).
     ------------------------------------------------------------------ */
  var K = {};

  /* ---------- daisy: sunflower, oxeye daisy, balsamroot ---------- */
  K.daisy = {
    top: function () { return -3; },
    basal: function (c, a, C, g) {
      if (daisyLeaves(a, C) !== 'arrow') return;
      /* balsamroot: big felted silver-green arrowheads straight off the root */
      var col = a.leaf || '#9fae8e';
      [[-1, -0.55], [1, 0.5], [0, -0.1]].forEach(function (q, i) {
        c.save();
        c.translate(q[0] * 1.2, 13);
        c.rotate(q[1]);
        c.scale(g, g);
        c.fillStyle = i === 2 ? sh(col, 0.1) : col;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, -4);
        c.quadraticCurveTo(-4.2, -5, -2.6, -9.6);
        c.quadraticCurveTo(-1, -12.4, 0, -14.4);
        c.quadraticCurveTo(1, -12.4, 2.6, -9.6);
        c.quadraticCurveTo(4.2, -5, 0, -4);
        c.closePath(); c.fill();
        c.strokeStyle = sh(col, -0.2); c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(0, -4); c.lineTo(0, -13.4); c.stroke();
        c.restore();
      });
    },
    leaves: function (c, a, C, top, sway, g) {
      var form = daisyLeaves(a, C);
      if (form === 'heart') {
        /* sunflower: big rough heart-shaped leaves on long stalks */
        [[-1, 6.4, -2.6], [1, 1.6, -0.5]].forEach(function (q) {
          var sx = q[0], y = q[1];
          c.strokeStyle = C.stem; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(sway * (13 - y) / 16 * 0.5, y);
          c.lineTo(sx * 2.4, y - 0.8); c.stroke();
          c.save(); c.translate(sx * 2.2, y - 0.8); c.scale(sx * g, g);
          c.fillStyle = sh(C.leaf, -0.06);
          c.beginPath();
          c.moveTo(0, 0);
          c.bezierCurveTo(1.6, -3.6, 5.2, -3.4, 5.8, -0.6);
          c.bezierCurveTo(6.4, 1.8, 4.6, 3, 9, 3.4);
          c.bezierCurveTo(5, 5.4, 1.4, 3.6, 0, 0);
          c.closePath(); c.fill();
          c.strokeStyle = sh(C.leaf, -0.28); c.lineWidth = 0.45;
          c.beginPath(); c.moveTo(0.4, 0.2); c.quadraticCurveTo(4, 0.6, 8, 3.2); c.stroke();
          c.restore();
        });
      } else if (form === 'narrow') {
        /* oxeye: small dark leaves with toothed edges, hugging the stem */
        [[-1, 7.4, -2.5], [1, 3, -0.6]].forEach(function (q) {
          var bx = sway * (13 - q[1]) / 16 * 0.4;
          c.save(); c.translate(bx, q[1]); c.scale(g, g);
          leafAt(c, 0, 0, 2.3, C.leaf, q[0] < 0 ? Math.PI + 0.55 : -0.55);
          c.fillStyle = C.leaf;
          for (var k = 1; k <= 3; k++) {
            var d = k * 1.2;
            ell(c, q[0] * d * 0.86, -d * 0.52 - 0.5, 0.55, 0.45);
          }
          c.restore();
        });
      }
    },
    head: function (c, a, C, t) {
      var big = bigDaisy(a, C);
      var n = a.petals || (big ? 21 : 13);
      var R = big ? 9.6 : 7.8, cr = big ? R * 0.44 : R * 0.3;
      var w = Math.min(R * 0.2, (Math.PI * R * 0.62) / n * 1.05);
      var i;
      c.save();
      c.scale(1, 0.92);
      /* the green bracts behind */
      c.fillStyle = sh(C.stem, -0.1);
      for (i = 0; i < 9; i++) petal(c, i / 9 * TAU + 0.2, cr * 0.5, cr + 1.6, 0.9);
      c.fillStyle = C.p2;
      for (i = 0; i < n; i++) petal(c, (i + 0.5) / n * TAU, cr * 0.6, R * 0.94, w * 0.95);
      c.fillStyle = C.p;
      for (i = 0; i < n; i++) petal(c, i / n * TAU - 0.05, cr * 0.7, R, w);
      if (C.light) {
        c.strokeStyle = 'rgba(120,110,80,0.28)'; c.lineWidth = 0.35;
        for (i = 0; i < n; i++) {
          var ang = i / n * TAU - 0.05, m = (cr * 0.7 + R) / 2;
          c.beginPath();
          c.ellipse(Math.cos(ang) * m, Math.sin(ang) * m, (R - cr * 0.7) / 2, w, ang, 0, TAU);
          c.stroke();
        }
      }
      /* the disc */
      c.fillStyle = sh(C.centre, -0.32); ell(c, 0, 0, cr * 1.1, cr * 1.1);
      c.fillStyle = C.centre; ell(c, 0, 0, cr, cr);
      if (big) {
        /* the seeds packed in their spiral, the way a real sunflower does it */
        c.fillStyle = sh(C.centre, 0.22);
        for (i = 0; i < 44; i++) {
          var rr = Math.sqrt(i / 44) * cr * 0.88, aa = i * 2.39996;
          ell(c, Math.cos(aa) * rr, Math.sin(aa) * rr, 0.36, 0.36);
        }
      } else {
        c.fillStyle = sh(C.centre, -0.2);
        for (i = 0; i < 10; i++) {
          var r2 = Math.sqrt((i + 0.5) / 10) * cr * 0.8, a2 = i * 2.39996;
          ell(c, Math.cos(a2) * r2, Math.sin(a2) * r2 + 0.2, 0.32, 0.32);
        }
        c.fillStyle = 'rgba(255,255,255,0.35)';
        ell(c, -cr * 0.3, -cr * 0.35, cr * 0.3, cr * 0.22, -0.4);
      }
      c.restore();
    }
  };

  /* ---------- cup: the tulip ---------- */
  K.cup = {
    top: function () { return -3.6; },
    basal: function (c, a, C, g) {
      var col = a.leaf || sh(C.stem, 0.14);
      c.save(); c.translate(0, 13); c.scale(g, g); c.translate(0, -13);
      blade(c, -1, 13, 13, 2.2, -5.4, sh(col, -0.08));
      blade(c, 1, 13, 10.6, 2.1, 5.2, col);
      c.restore();
    },
    head: function (c, a, C, t) {
      /* the back petal, peeping between the front two */
      c.fillStyle = C.p2;
      c.beginPath();
      c.moveTo(-3.6, -1);
      c.quadraticCurveTo(-3.4, -7, 0, -9.8);
      c.quadraticCurveTo(3.4, -7, 3.6, -1);
      c.closePath(); c.fill();
      /* the two side petals */
      c.fillStyle = sh(C.p, -0.06);
      c.beginPath();
      c.moveTo(0.6, 2.4);
      c.bezierCurveTo(-3.8, 2.6, -6, -1.8, -4.6, -8.6);
      c.bezierCurveTo(-2.8, -7.6, -0.2, -5.4, 0.6, 2.4);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(-0.6, 2.4);
      c.bezierCurveTo(3.8, 2.6, 6, -1.8, 4.6, -8.6);
      c.bezierCurveTo(2.8, -7.6, 0.2, -5.4, -0.6, 2.4);
      c.closePath(); c.fill();
      /* the front petal */
      c.fillStyle = C.p;
      c.beginPath();
      c.moveTo(0, 2.6);
      c.bezierCurveTo(-3.9, 1.8, -3.6, -5.2, 0, -8.6);
      c.bezierCurveTo(3.6, -5.2, 3.9, 1.8, 0, 2.6);
      c.closePath(); c.fill();
      c.strokeStyle = sh(C.p2, -0.1); c.lineWidth = 0.4;
      c.beginPath(); c.moveTo(0, 1.8); c.quadraticCurveTo(-0.3, -3, 0, -7.4); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.32)';
      ell(c, -1.7, -3.2, 0.8, 2.8, 0.12);
    }
  };

  /* ---------- trumpet: the daffodil ---------- */
  K.trumpet = {
    top: function () { return -4.4; },
    basal: function (c, a, C, g) {
      var col = a.leaf || sh(C.stem, 0.06);
      c.save(); c.translate(0, 13); c.scale(g, g); c.translate(0, -13);
      blade(c, -0.8, 13, 13.4, 1.4, -4.6, sh(col, -0.1));
      blade(c, 0.8, 13, 11.4, 1.3, 4.4, col);
      blade(c, 0.2, 13, 8.4, 1.2, -1.2, sh(col, 0.08));
      c.restore();
    },
    head: function (c, a, C, t) {
      /* the papery sheath where the neck bends */
      c.fillStyle = '#cbbd8a';
      ell(c, -1.1, 1.2, 0.8, 2, 0.5);
      c.save();
      c.rotate(0.18);
      /* six pointed petals, the back three a shade deeper */
      var i;
      c.fillStyle = sh(C.p, -0.08);
      for (i = 0; i < 3; i++) point(c, -Math.PI / 2 + Math.PI / 3 + i * TAU / 3, 7.6, 3.1);
      c.fillStyle = C.p;
      for (i = 0; i < 3; i++) point(c, -Math.PI / 2 + i * TAU / 3, 7.8, 3.2);
      c.strokeStyle = sh(C.p, -0.18); c.lineWidth = 0.35;
      for (i = 0; i < 6; i++) {
        var ang = -Math.PI / 2 + i * Math.PI / 3;
        c.beginPath(); c.moveTo(Math.cos(ang) * 2, Math.sin(ang) * 2);
        c.lineTo(Math.cos(ang) * 6, Math.sin(ang) * 6); c.stroke();
      }
      /* the trumpet, pointing out at you and a little down */
      var dx = 1.5, dy = 1.9;
      c.fillStyle = sh(C.p2, -0.12);
      for (i = 0; i <= 5; i++) {
        var f = i / 5;
        ell(c, dx * f, dy * f, 2.5 + f * 0.9, 2.4 + f * 0.8);
      }
      c.fillStyle = C.p2;
      for (i = 0; i < 12; i++) {
        var aa = i / 12 * TAU;
        ell(c, dx + Math.cos(aa) * 3.3, dy + Math.sin(aa) * 3.1, 0.95, 0.95);
      }
      ell(c, dx, dy, 3.4, 3.2);
      c.fillStyle = sh(C.p2, -0.3);
      ell(c, dx + 0.2, dy + 0.2, 2.1, 2);
      c.fillStyle = sh(C.p2, 0.35);
      ell(c, dx + 0.1, dy + 0.3, 0.5, 0.5);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      ell(c, dx - 1.8, dy - 1.7, 0.9, 0.6, -0.6);
      c.restore();
    }
  };

  /* ---------- rose ---------- */
  K.rose = {
    top: function () { return -4.6; },
    leaves: function (c, a, C, top, sway, g) {
      /* a thorn or two, and a leaf of three serrated leaflets */
      c.fillStyle = sh(C.stem, -0.22);
      [[8.6, 1], [3.4, -1], [-0.8, 1]].forEach(function (q) {
        var bx = sway * (13 - q[0]) / 18;
        c.beginPath();
        c.moveTo(bx, q[0] - 0.8); c.lineTo(bx + q[1] * 1.5, q[0] + 0.4); c.lineTo(bx, q[0] + 0.6);
        c.closePath(); c.fill();
      });
      var by = 5.2, bx = sway * (13 - by) / 18;
      c.save(); c.translate(bx, by); c.scale(g, g);
      /* the leaf stalk, one leaflet on the end and a pair either side */
      var th = Math.atan2(-2.2, -5.4);
      c.strokeStyle = C.stem; c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-5.4, -2.2); c.stroke();
      leafAt(c, -2.9, -1.2, 1.6, sh(C.leaf, -0.1), th + 1.0);
      leafAt(c, -2.9, -1.2, 1.6, sh(C.leaf, -0.04), th - 1.0);
      leafAt(c, -5.2, -2.1, 2.0, C.leaf, th);
      c.restore();
    },
    head: function (c, a, C, t) {
      var i, ang;
      /* green sepals curling down */
      c.fillStyle = sh(C.stem, -0.05);
      for (i = 0; i < 5; i++) point(c, Math.PI * 0.15 + i * Math.PI * 0.175, 6.4, 1.1);
      c.save();
      c.scale(1, 0.88);
      /* the outer ring, deepest colour */
      c.fillStyle = C.p2;
      for (i = 0; i < 5; i++) {
        ang = i / 5 * TAU - Math.PI / 2 + 0.3;
        ell(c, Math.cos(ang) * 3.6, Math.sin(ang) * 3.6, 4, 4);
      }
      c.fillStyle = sh(C.p, -0.06);
      for (i = 0; i < 5; i++) {
        ang = i / 5 * TAU - Math.PI / 2 - 0.35;
        ell(c, Math.cos(ang) * 2.5, Math.sin(ang) * 2.5, 3.3, 3.2);
      }
      /* the cupped middle, and the swirl you see looking in */
      c.fillStyle = C.p;
      ell(c, 0, -0.2, 3.9, 3.5);
      c.strokeStyle = sh(C.p2, -0.12); c.lineWidth = 0.75; c.lineCap = 'round';
      c.beginPath();
      for (i = 0; i <= 40; i++) {
        var f = i / 40, rr = 0.3 + f * 3.1, aa = f * TAU * 2.1 + 1;
        var px = Math.cos(aa) * rr, py = Math.sin(aa) * rr * 0.9 - 0.3;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.28)';
      ell(c, -2.2, -2.6, 1.3, 0.8, -0.4);
      c.restore();
    }
  };

  /* ---------- spike: lavender, lupine, fireweed ---------- */
  K.spike = {
    top: function (a) {
      var k = floretKind(a);
      return k === 'whorl' ? -1.6 : (k === 'pea' ? 2.6 : 1.2);
    },
    basal: function (c, a, C, g) {
      var k = floretKind(a);
      c.save(); c.translate(0, 13); c.scale(g, g);
      if (k === 'pea') {
        /* lupine: a leaf like a hand with seven fingers */
        [[-1, -3.4], [1, -2.6]].forEach(function (q) {
          var lx = q[0] * 4.2, ly = q[1];
          c.strokeStyle = C.stem; c.lineWidth = 0.6;
          c.beginPath(); c.moveTo(0, 0); c.lineTo(lx, ly); c.stroke();
          c.fillStyle = q[0] < 0 ? C.leaf : sh(C.leaf, -0.08);
          for (var j = 0; j < 7; j++) {
            var ang = -Math.PI + j * Math.PI / 6 + (q[0] < 0 ? -0.2 : 0.2);
            ell(c, lx + Math.cos(ang) * 1.9, ly + Math.sin(ang) * 1.5, 1.8, 0.5, ang);
          }
        });
      } else if (k === 'whorl') {
        /* lavender: narrow grey leaves in a bushy tuft */
        var col = a.leaf || sh(C.stem, 0.1);
        c.strokeStyle = col; c.lineWidth = 0.9; c.lineCap = 'round';
        for (var i = -3; i <= 3; i++) {
          c.beginPath(); c.moveTo(i * 0.3, 0);
          c.quadraticCurveTo(i * 1.2, -3, i * 2 + (i === 0 ? 0.5 : 0), -5 + Math.abs(i) * 0.5);
          c.stroke();
        }
      }
      c.restore();
    },
    leaves: function (c, a, C, top, sway, g) {
      if (floretKind(a) !== 'cross') return;
      /* fireweed: long narrow willowy leaves all the way up */
      for (var i = 0; i < 3; i++) {
        var y = 10 - i * 3.6, bx = sway * (13 - y) / (13 - top) * 0.5;
        var sgn = i % 2 ? 1 : -1;
        c.save(); c.translate(bx, y); c.scale(g, g);
        leafAt(c, 0, 0, 2.8 - i * 0.3, i % 2 ? C.leaf : sh(C.leaf, -0.08),
               sgn > 0 ? -0.5 : Math.PI + 0.5);
        c.restore();
      }
    },
    head: function (c, a, C, t) {
      var k = floretKind(a), i, f, y;
      if (k === 'whorl') {
        /* lavender: whorls of tiny florets, spaced apart at the bottom */
        var ys = [0, -1.8, -3.4, -4.8, -6, -7.1, -8.1, -9, -9.8, -10.5];
        c.strokeStyle = C.stem; c.lineWidth = 0.7;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -10.8); c.stroke();
        for (i = 0; i < ys.length; i++) {
          f = i / (ys.length - 1); y = ys[i];
          var w = 1.5 - f * 0.7, r = 1.05 - f * 0.4;
          c.fillStyle = C.p2;
          ell(c, -w, y + 0.3, r, r * 0.9); ell(c, w, y + 0.3, r, r * 0.9);
          c.fillStyle = C.p;
          ell(c, -w * 0.5, y - 0.2, r, r); ell(c, w * 0.5, y - 0.2, r, r);
          c.fillStyle = sh(C.p, 0.25);
          ell(c, -w * 0.6, y - 0.5, r * 0.4, r * 0.4);
        }
        return;
      }
      if (k === 'pea') {
        /* lupine: a tapering tower of little pea flowers */
        var H = 15.2;
        c.strokeStyle = C.stem; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -H); c.stroke();
        for (i = 0; i < 9; i++) {
          f = i / 8; y = -0.6 - f * (H - 1.6);
          var ww = 2.8 * (1 - f * 0.62), rr = 1.55 - f * 0.65;
          for (var s = -1; s <= 1; s += 2) {
            var fx = s * ww, fy = y + (s > 0 ? 0.4 : 0);
            if (f > 0.75) {
              c.fillStyle = sh(C.p2, -0.1); ell(c, fx * 0.7, fy, rr * 0.8, rr * 0.6);
              continue;
            }
            /* the keel and wings */
            c.fillStyle = C.p2; ell(c, fx, fy + rr * 0.3, rr, rr * 0.7, s * 0.3);
            /* the banner petal standing up behind, pale in the middle */
            c.fillStyle = C.p; ell(c, fx - s * rr * 0.2, fy - rr * 0.35, rr * 0.8, rr * 0.75);
            c.fillStyle = 'rgba(255,255,255,0.75)';
            ell(c, fx - s * rr * 0.25, fy - rr * 0.45, rr * 0.3, rr * 0.3);
          }
        }
        c.fillStyle = sh(C.p2, -0.15); ell(c, 0, -H + 0.2, 0.9, 1.4);
        return;
      }
      /* fireweed: open four-petal flowers below, nodding buds on top */
      var HH = 14;
      c.strokeStyle = C.stem; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(0.4, -HH * 0.7, 1.4, -HH); c.stroke();
      for (i = 5; i >= 0; i--) {
        f = i / 7; y = -0.4 - i * 1.7;
        var sx = i % 2 ? 1 : -1, px = sx * 2.4 * (1 - f * 0.4), py = y;
        c.strokeStyle = C.stem; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(0.1 * i, y + 0.8); c.lineTo(px, py); c.stroke();
        var pr = 1.45 - f * 0.4;
        c.fillStyle = C.p;
        for (var q = 0; q < 4; q++) {
          var ang = q / 4 * TAU + 0.78 + sx * 0.2;
          ell(c, px + Math.cos(ang) * pr * 0.95, py + Math.sin(ang) * pr * 0.95, pr, pr * 0.82, ang);
        }
        c.strokeStyle = C.p2; c.lineWidth = 0.3;
        for (q = 0; q < 4; q++) {
          var a2 = q / 4 * TAU + 0.78 + sx * 0.2;
          c.beginPath(); c.moveTo(px, py);
          c.lineTo(px + Math.cos(a2) * pr * 1.4, py + Math.sin(a2) * pr * 1.4); c.stroke();
        }
        c.fillStyle = '#fbf4f6'; ell(c, px, py, pr * 0.3, pr * 0.3);
      }
      /* the buds going up the tip, deeper pink and nodding */
      for (i = 0; i < 4; i++) {
        var by = -10.6 - i * 1.1, bxx = 0.4 + i * 0.3 + (i % 2 ? 0.9 : -0.9) * (1 - i * 0.2);
        c.fillStyle = C.p2; ell(c, bxx, by, 0.75 - i * 0.08, 1.1 - i * 0.1, i % 2 ? 0.4 : -0.4);
      }
    },
    bud: function (c, a, C, g) {
      /* a closed green spike of buds */
      var k = floretKind(a), H = (k === 'whorl' ? 9 : 12) * (0.4 + 0.6 * g);
      c.strokeStyle = C.stem; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -H); c.stroke();
      for (var i = 0; i < 7; i++) {
        var f = i / 6, y = -f * H;
        var r = (1.1 - f * 0.5) * (0.6 + 0.4 * g);
        c.fillStyle = i % 2 ? sh(C.stem, 0.12) : sh(C.stem, 0.24);
        ell(c, (i % 2 ? 1 : -1) * r * 0.7, y, r, r * 0.9);
      }
      if (g > 0.5) {
        c.fillStyle = C.p2;
        c.globalAlpha *= (g - 0.5) * 2;
        ell(c, -0.7, -0.2, 0.6, 0.6); ell(c, 0.7, -1.4, 0.6, 0.6);
      }
    }
  };

  /* ---------- bells: the foxglove ---------- */
  K.bells = {
    top: function () { return 4; },
    basal: function (c, a, C, g) {
      /* soft, wrinkly, velvety leaves in a big rosette */
      c.save(); c.translate(0, 12.6); c.scale(g, g);
      leafAt(c, 0, 0, 3.4, sh(C.leaf, -0.08), Math.PI + 0.3);
      leafAt(c, 0, 0, 3.2, C.leaf, -0.28);
      leafAt(c, 0, -0.2, 2.4, sh(C.leaf, 0.08), -Math.PI / 2 - 0.3);
      c.restore();
    },
    head: function (c, a, C, t) {
      var H = 17;
      c.strokeStyle = C.stem; c.lineWidth = 0.9; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-0.3, -H * 0.6, 0.4, -H); c.stroke();
      var i;
      /* the buds up the tip */
      for (i = 0; i < 4; i++) {
        c.fillStyle = i < 2 ? sh(C.p2, -0.05) : sh(C.stem, 0.1);
        ell(c, 0.9 + i * 0.05, -12.4 - i * 1.3, 0.9 - i * 0.12, 0.7 - i * 0.08, 0.4);
      }
      /* bells, all hanging off one side, biggest at the bottom */
      for (i = 3; i >= 0; i--) {
        var f = i / 4, y = -0.8 - i * 3.1, L = 6 - f * 2, w = 2.1 - f * 0.55;
        c.save();
        c.translate(0.4, y);
        c.rotate(0.62 + f * 0.1);
        /* the shaded underside, then the lit top of the tube */
        c.fillStyle = C.p2;
        c.beginPath();
        c.moveTo(0, -w * 0.5);
        c.quadraticCurveTo(L * 0.55, -w * 1.0, L, -w * 1.2);
        c.lineTo(L, w * 1.15);
        c.quadraticCurveTo(L * 0.55, w * 0.9, 0, w * 0.5);
        c.closePath(); c.fill();
        c.fillStyle = C.p;
        c.beginPath();
        c.moveTo(0, -w * 0.5);
        c.quadraticCurveTo(L * 0.55, -w * 1.0, L, -w * 1.2);
        c.lineTo(L, w * 0.25);
        c.quadraticCurveTo(L * 0.55, w * 0.15, 0, 0);
        c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.25)';
        ell(c, L * 0.5, -w * 0.55, L * 0.3, w * 0.18, -0.1);
        /* the open mouth: pale inside, with the spots that lead the bees in */
        c.fillStyle = C.p;
        ell(c, L, 0, w * 0.62, w * 1.25);
        c.fillStyle = sh(C.p, 0.6);
        ell(c, L + 0.15, w * 0.1, w * 0.42, w * 1.0);
        c.fillStyle = C.p2;
        ell(c, L, -w * 0.35, 0.3, 0.3);
        ell(c, L + 0.25, w * 0.2, 0.34, 0.34);
        ell(c, L + 0.1, w * 0.7, 0.28, 0.28);
        c.restore();
      }
    }
  };

  /* ---------- puff: the dandelion ---------- */
  K.puff = {
    top: function () { return -3.8; },
    basal: function (c, a, C, g) {
      /* the "lion's teeth" leaves, lying flat in a rosette */
      c.save(); c.translate(0, 12.8); c.scale(g, g);
      [[-1, -0.25, 7.4], [1, -0.3, 7.8], [-1, -1.0, 6], [1, -1.15, 5.6]].forEach(function (q, i) {
        c.save(); c.scale(q[0], 1); c.rotate(q[1]);
        c.fillStyle = i > 1 ? sh(C.leaf, 0.08) : (i ? sh(C.leaf, -0.08) : C.leaf);
        var L = q[2], w = 1.7, n = 3, k, xa;
        c.beginPath();
        c.moveTo(0, -0.35);
        /* the teeth point back toward the root, like a lion's jaw */
        for (k = 1; k <= n; k++) {
          xa = k * L / (n + 1);
          c.lineTo(xa, -w * 0.35);
          c.lineTo(xa - 1.1, -w * 1.15);
        }
        c.lineTo(L, 0);
        for (k = n; k >= 1; k--) {
          xa = k * L / (n + 1);
          c.lineTo(xa + 0.4, w * 1.0);
          c.lineTo(xa - 0.4, w * 0.35);
        }
        c.lineTo(0, 0.35);
        c.closePath(); c.fill();
        c.strokeStyle = sh(C.leaf, 0.3); c.lineWidth = 0.35;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(L - 0.8, 0); c.stroke();
        c.restore();
      });
      c.restore();
    },
    head: function (c, a, C, t) {
      var i, ang;
      /* the green bracts folded back under the head */
      c.fillStyle = sh(C.stem, -0.05);
      for (i = 0; i < 6; i++) point(c, Math.PI * 0.2 + i * Math.PI * 0.12, 4.6, 0.7);
      c.save();
      c.scale(1, 0.92);
      c.fillStyle = C.p2;
      for (i = 0; i < 24; i++) petal(c, i / 24 * TAU, 2, 7, 0.55);
      c.fillStyle = C.p;
      for (i = 0; i < 20; i++) petal(c, i / 20 * TAU + 0.12, 1.6, 6, 0.6);
      c.fillStyle = sh(C.p, 0.18);
      for (i = 0; i < 14; i++) petal(c, i / 14 * TAU + 0.05, 0.8, 4.4, 0.6);
      c.fillStyle = sh(C.p2, -0.08);
      for (i = 0; i < 9; i++) {
        ang = i * 2.39996;
        var rr = Math.sqrt((i + 0.5) / 9) * 1.8;
        ell(c, Math.cos(ang) * rr, Math.sin(ang) * rr, 0.5, 0.5);
      }
      c.fillStyle = 'rgba(255,255,255,0.3)';
      ell(c, -2, -2.3, 1.4, 0.8, -0.6);
      c.restore();
    }
  };

  /* ---------- star: camas ---------- */
  K.star = {
    top: function () { return -3.2; },
    basal: function (c, a, C, g) {
      var col = a.leaf || sh(C.stem, 0.1);
      c.save(); c.translate(0, 13); c.scale(g, g); c.translate(0, -13);
      blade(c, -0.6, 13, 11, 0.9, -4.2, sh(col, -0.1));
      blade(c, 0.6, 13, 9.6, 0.9, 3.8, col);
      blade(c, 0, 13, 7, 0.8, 1.6, sh(col, 0.08));
      c.restore();
    },
    head: function (c, a, C, t) {
      var i;
      /* two buds still to open above it, the way the spike goes */
      c.strokeStyle = C.stem; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0.8, -9.2); c.stroke();
      c.fillStyle = C.p2;
      ell(c, 0.9, -9.8, 0.8, 1.6, 0.2);
      ell(c, -1.4, -8.4, 0.7, 1.4, -0.5);
      /* six tepals, slightly uneven like the real thing */
      c.fillStyle = sh(C.p, -0.08);
      for (i = 0; i < 3; i++) point(c, -Math.PI / 2 + Math.PI / 3 + i * TAU / 3, 7.2, 1.9);
      c.fillStyle = C.p;
      for (i = 0; i < 3; i++) point(c, -Math.PI / 2 + i * TAU / 3 + (i === 0 ? 0.12 : 0), 7.4, 2);
      c.strokeStyle = C.p2; c.lineWidth = 0.35;
      for (i = 0; i < 6; i++) {
        var ang = -Math.PI / 2 + i * Math.PI / 3;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ang) * 5.6, Math.sin(ang) * 5.6); c.stroke();
      }
      /* the stamens with their bright yellow anthers */
      c.strokeStyle = sh(C.p, 0.6); c.lineWidth = 0.4;
      for (i = 0; i < 6; i++) {
        var a2 = -Math.PI / 2 + i * Math.PI / 3 + 0.5;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a2) * 2.7, Math.sin(a2) * 2.7); c.stroke();
      }
      c.fillStyle = C.centre;
      for (i = 0; i < 6; i++) {
        var a3 = -Math.PI / 2 + i * Math.PI / 3 + 0.5;
        ell(c, Math.cos(a3) * 2.9, Math.sin(a3) * 2.9, 0.6, 0.45, a3);
      }
      c.fillStyle = '#b7cf6a'; ell(c, 0, 0, 0.9, 0.9);
    }
  };

  /* ---------- round: the nasturtium ---------- */
  K.round = {
    top: function () { return -3.2; },
    basal: function (c, a, C, g) {
      /* the round leaf, held up flat on its own stalk from the middle */
      var col = a.leaf || sh(C.stem, 0.08);
      c.strokeStyle = C.stem; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(0, 13); c.quadraticCurveTo(-3, 9, -5.4, 6.6 + (1 - g) * 3); c.stroke();
      c.save(); c.translate(-5.4, 6.6 + (1 - g) * 3); c.scale(g, g);
      c.fillStyle = col;
      c.beginPath();
      for (var k = 0; k <= 30; k++) {
        var ang = k / 30 * TAU, rr = 4.3 + Math.sin(ang * 5) * 0.25;
        var px = Math.cos(ang) * rr, py = Math.sin(ang) * rr * 0.84;
        if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.fill();
      c.strokeStyle = sh(col, 0.35); c.lineWidth = 0.4;
      for (k = 0; k < 9; k++) {
        var a2 = k / 9 * TAU + 0.3;
        c.beginPath(); c.moveTo(0.4, 0.2); c.lineTo(Math.cos(a2) * 3.9, Math.sin(a2) * 3.3); c.stroke();
      }
      c.fillStyle = sh(col, 0.4); ell(c, 0.4, 0.2, 0.5, 0.45);
      c.restore();
    },
    head: function (c, a, C, t) {
      var i;
      /* the long nectar spur sticking out behind */
      c.strokeStyle = C.p2; c.lineWidth = 1.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(1, -1.5); c.quadraticCurveTo(4, -5, 7.2, -6.8); c.stroke();
      c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(6.2, -6.3); c.lineTo(7.8, -7.3); c.stroke();
      /* two upper petals, veined, and three lower ones */
      var up = [-2.05, -1.1], low = [0.25, Math.PI / 2 + 0.05, Math.PI - 0.2];
      c.fillStyle = sh(C.p, -0.06);
      up.forEach(function (ang) { ell(c, Math.cos(ang) * 3.4, Math.sin(ang) * 3.4, 3.3, 2.9, ang); });
      c.strokeStyle = C.p2; c.lineWidth = 0.45;
      up.forEach(function (ang) {
        for (var k = -1; k <= 1; k++) {
          c.beginPath(); c.moveTo(0, 0);
          c.lineTo(Math.cos(ang + k * 0.35) * 4.8, Math.sin(ang + k * 0.35) * 4.8); c.stroke();
        }
      });
      c.fillStyle = C.p;
      low.forEach(function (ang) { ell(c, Math.cos(ang) * 3.5, Math.sin(ang) * 3.5, 3.2, 2.8, ang); });
      /* the throat */
      c.fillStyle = C.centre; ell(c, 0, 0.2, 1.4, 1.2);
      c.strokeStyle = C.p2; c.lineWidth = 0.4;
      for (i = 0; i < 3; i++) {
        var a2 = Math.PI / 2 + (i - 1) * 0.8;
        c.beginPath(); c.moveTo(Math.cos(a2) * 1.2, Math.sin(a2) * 1.2);
        c.lineTo(Math.cos(a2) * 3.8, Math.sin(a2) * 3.8); c.stroke();
      }
      c.fillStyle = 'rgba(255,255,255,0.28)';
      ell(c, -2.6, 1.6, 1.2, 0.7, 0.3);
    }
  };

  /* a closed bud on top of the stem, colouring up as it gets ready */
  function genericBud(c, a, C, g) {
    var h = 1.4 + 3 * g, w = 0.9 + 1.4 * g;
    c.fillStyle = sh(C.stem, 0.12);
    c.beginPath();
    c.moveTo(0, 0.8);
    c.quadraticCurveTo(-w * 1.3, -h * 0.3, 0, -h);
    c.quadraticCurveTo(w * 1.3, -h * 0.3, 0, 0.8);
    c.closePath(); c.fill();
    if (g > 0.35) {
      c.fillStyle = C.p;
      c.beginPath();
      c.moveTo(0, -h * 0.25);
      c.quadraticCurveTo(-w * 0.55, -h * 0.65, 0, -h * (0.9 + 0.1 * g));
      c.quadraticCurveTo(w * 0.55, -h * 0.65, 0, -h * 0.25);
      c.closePath(); c.fill();
    }
    c.fillStyle = sh(C.stem, -0.08);
    ell(c, -w * 0.5, 0, w * 0.5, 0.5, 0.5);
    ell(c, w * 0.5, 0, w * 0.5, 0.5, -0.5);
  }

  /* the whole flower: ground leaves, stem, stem leaves and the head.
     opt.bloom 0..1 (1 = open), opt.cut (no ground leaves), opt.stemW, opt.phase. */
  function drawFlower(c, a, t, shape, opt) {
    var k = K[shape] || K.daisy;
    var C = colours(a);
    opt = opt || {};
    var bloom = opt.bloom == null ? 1 : Math.max(0, Math.min(1, opt.bloom));
    var g = bloom >= 1 ? 1 : 0.45 + 0.55 * bloom;
    var top = k.top(a);
    if (bloom < 1) top = 13 - (13 - top) * (0.5 + 0.4 * bloom);
    var sway = Math.sin((t || 0) * 1.3 + (opt.phase || 0)) * 0.7;
    c.lineCap = 'round';
    if (k.basal && !opt.cut) k.basal(c, a, C, g);
    c.strokeStyle = C.stem;
    c.lineWidth = (opt.stemW || 1.2) * (shape === 'daisy' && bigDaisy(a, C) ? 1.4 : 1);
    c.beginPath();
    c.moveTo(0, 13);
    c.quadraticCurveTo(sway * 0.3, (13 + top) / 2, sway, top);
    c.stroke();
    if (k.leaves) k.leaves(c, a, C, top, sway, g);
    c.save();
    c.translate(sway, top);
    if (bloom >= 1) k.head(c, a, C, t || 0);
    else if (bloom > 0.12) (k.bud || genericBud)(c, a, C, (bloom - 0.12) / 0.88);
    c.restore();
  }

  /* ------------------------------------------------------------------
     tiny bold blobs, a few pixels across, centred on (0, 0)
     ------------------------------------------------------------------ */
  var B = {};
  B.daisy = function (c, def, s) {
    var C = colours(def), big = bigDaisy(def, C), n = big ? 12 : 9;
    c.fillStyle = C.p;
    for (var i = 0; i < n; i++) petal(c, i / n * TAU, s * 0.25, s, s * (big ? 0.24 : 0.22));
    c.fillStyle = C.centre; ell(c, 0, 0, s * (big ? 0.46 : 0.32), s * (big ? 0.46 : 0.32));
  };
  B.cup = function (c, def, s) {
    var C = colours(def);
    c.fillStyle = C.p;
    c.beginPath();
    c.moveTo(-s * 0.72, -s * 0.9);
    c.lineTo(-s * 0.3, -s * 0.5); c.lineTo(0, -s * 1.05); c.lineTo(s * 0.3, -s * 0.5);
    c.lineTo(s * 0.72, -s * 0.9);
    c.quadraticCurveTo(s * 0.8, s * 0.8, 0, s * 0.8);
    c.quadraticCurveTo(-s * 0.8, s * 0.8, -s * 0.72, -s * 0.9);
    c.closePath(); c.fill();
    c.fillStyle = C.p2; ell(c, s * 0.28, s * 0.1, s * 0.18, s * 0.5);
  };
  B.trumpet = function (c, def, s) {
    var C = colours(def);
    c.fillStyle = C.p;
    for (var i = 0; i < 6; i++) point(c, -Math.PI / 2 + i * Math.PI / 3, s, s * 0.42);
    c.fillStyle = C.p2; ell(c, s * 0.08, s * 0.08, s * 0.44, s * 0.44);
    c.fillStyle = sh(C.p2, -0.3); ell(c, s * 0.1, s * 0.1, s * 0.22, s * 0.22);
  };
  B.rose = function (c, def, s) {
    var C = colours(def);
    c.fillStyle = C.p2; ell(c, 0, 0, s, s * 0.9);
    c.fillStyle = C.p; ell(c, 0, -s * 0.05, s * 0.66, s * 0.6);
    c.strokeStyle = sh(C.p2, -0.1); c.lineWidth = Math.max(0.4, s * 0.16);
    c.beginPath(); c.arc(0, -s * 0.05, s * 0.3, 0.4, 4.4); c.stroke();
  };
  var fruitSpikeBlob = null;
  B.spike = function (c, def, s) {
    if (!def.petal && def.kind !== 'flower') {
      if (fruitSpikeBlob) { fruitSpikeBlob(c, def, s); return; }
      /* the chokecherry's hanging spike, as fruitart has always drawn it */
      for (var j = 0; j < 5; j++) {
        c.fillStyle = j % 2 ? def.skin2 : def.skin;
        ell(c, (j % 2 ? 1 : -1) * s * 0.5, -s + j * s * 0.9, s * 0.55, s * 0.55);
      }
      return;
    }
    var C = colours(def);
    c.strokeStyle = C.stem; c.lineWidth = Math.max(0.5, s * 0.16);
    c.beginPath(); c.moveTo(0, s * 1.3); c.lineTo(0, -s * 1.3); c.stroke();
    for (var i = 0; i < 6; i++) {
      var f = i / 5, r = s * (0.44 - f * 0.18);
      c.fillStyle = i % 2 ? C.p2 : C.p;
      ell(c, -r * 0.6, s * 1.1 - f * s * 2.3, r, r);
      c.fillStyle = i % 2 ? C.p : C.p2;
      ell(c, r * 0.6, s * 1.1 - f * s * 2.3 - s * 0.2, r, r);
    }
  };
  B.bells = function (c, def, s) {
    var C = colours(def);
    c.strokeStyle = C.stem; c.lineWidth = Math.max(0.5, s * 0.16);
    c.beginPath(); c.moveTo(0, s * 1.3); c.lineTo(0, -s * 1.3); c.stroke();
    for (var i = 0; i < 3; i++) {
      var y = s * 0.8 - i * s * 0.85, L = s * (0.9 - i * 0.18);
      c.fillStyle = C.p;
      ell(c, L * 0.6, y, L * 0.62, L * 0.36, 0.6);
      c.fillStyle = sh(C.p, 0.5);
      ell(c, L * 1.0, y + L * 0.3, L * 0.18, L * 0.26, 0.6);
    }
  };
  B.puff = function (c, def, s) {
    var C = colours(def);
    c.fillStyle = C.p2; ell(c, 0, 0, s, s);
    c.fillStyle = C.p; ell(c, 0, 0, s * 0.74, s * 0.74);
    c.strokeStyle = C.p2; c.lineWidth = Math.max(0.3, s * 0.08);
    for (var i = 0; i < 8; i++) {
      var ang = i / 8 * TAU;
      c.beginPath(); c.moveTo(Math.cos(ang) * s * 0.3, Math.sin(ang) * s * 0.3);
      c.lineTo(Math.cos(ang) * s * 0.7, Math.sin(ang) * s * 0.7); c.stroke();
    }
  };
  B.star = function (c, def, s) {
    var C = colours(def);
    c.fillStyle = C.p;
    for (var i = 0; i < 6; i++) point(c, -Math.PI / 2 + i * Math.PI / 3, s, s * 0.34);
    c.fillStyle = C.centre; ell(c, 0, 0, s * 0.24, s * 0.24);
  };
  B.round = function (c, def, s) {
    var C = colours(def);
    c.fillStyle = C.p;
    for (var i = 0; i < 5; i++) {
      var ang = -Math.PI / 2 + i / 5 * TAU;
      ell(c, Math.cos(ang) * s * 0.5, Math.sin(ang) * s * 0.5, s * 0.52, s * 0.52);
    }
    c.fillStyle = C.p2; ell(c, 0, 0, s * 0.32, s * 0.32);
    c.fillStyle = C.centre; ell(c, 0, 0, s * 0.16, s * 0.16);
  };

  /* ------------------------------------------------------------------
     register with the fruit art
     ------------------------------------------------------------------ */
  var FA = GG.FruitArt = GG.FruitArt || {};
  var S = FA.shapes = FA.shapes || {};
  var BL = FA.blobs = FA.blobs || {};
  var NAMES = ['daisy', 'cup', 'trumpet', 'rose', 'spike', 'bells', 'puff', 'star', 'round'];

  /* 'spike' is already the chokecherry's shape, so a flower spike only takes
     over when the def really is a flower. */
  var fruitSpike = S.spike;
  if (BL.spike) fruitSpikeBlob = BL.spike;

  function isFlower(def) {
    return !!def && (def.kind === 'flower' || def.on === 'flower' || !!def.petal);
  }

  NAMES.forEach(function (name) {
    var fn = function (c, a, t) { drawFlower(c, a, t, name); };
    if (name === 'spike' && fruitSpike) {
      S.spike = function (c, a, t) {
        if (isFlower(a)) drawFlower(c, a, t, 'spike');
        else fruitSpike(c, a, t);
      };
    } else {
      S[name] = fn;
    }
    BL[name] = B[name];
  });

  GG.FlowerArt = {
    shapes: NAMES,
    isFlower: isFlower,
    /* how much taller than the usual flower this one stands (a sunflower) */
    tall: function (def) {
      if (def && def.tall) return def.tall;
      return def && def.shape === 'daisy' && bigDaisy(def, colours(def)) ? 1.45 : 1;
    },
    /* one flower centred on (x, y), 26px tall at scale 1 with its stem foot at
       y + 13 * scale. opt: { bloom 0..1, cut: true, stemW, phase } */
    draw: function (c, def, x, y, scale, t, opt) {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      drawFlower(c, def, t || 0, def.shape, opt);
      c.restore();
    },
    /* just the bloom, centred on (x, y) */
    head: function (c, def, x, y, scale, t) {
      var k = K[def.shape] || K.daisy;
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      k.head(c, def, colours(def), t || 0);
      c.restore();
    },
    blob: function (c, def, x, y, s) {
      c.save(); c.translate(x, y);
      (B[def.shape] || B.daisy)(c, def, s);
      c.restore();
    }
  };
})(window.GG = window.GG || {});
