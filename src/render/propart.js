/* Trees, flowers, rocks, the house - all drawn with code.
   Props are drawn with their BASE at (x, y), growing upward. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); c.fill();
  }

  /* ---------- v1.20 art helpers ----------
     A soft contact shadow, the same everywhere: a blurred cool oval,
     nudged a little right and down because the sun is up and to the left.
     Painted once, stamped after that. */
  var shadowCv = null;
  function shadowSprite() {
    if (shadowCv) return shadowCv;
    shadowCv = document.createElement('canvas');
    shadowCv.width = 96; shadowCv.height = 48;
    var g = shadowCv.getContext('2d');
    g.setTransform(1, 0, 0, 0.5, 0, 0);
    var gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, 'rgba(24,52,44,0.34)');
    gr.addColorStop(0.55, 'rgba(24,52,44,0.24)');
    gr.addColorStop(1, 'rgba(24,52,44,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
    return shadowCv;
  }
  function shadow(c, x, y, rx, ry) {
    ry = ry || rx * 0.38;
    var w = rx * 2.3, h = ry * 2.4;
    c.drawImage(shadowSprite(), x + rx * 0.1 - w / 2, y + ry * 0.12 - h / 2, w, h);
  }
  GG.softShadow = shadow;

  /* Pictures of the busiest props, painted once at the screen's real
     resolution and then just stamped (the idea plantart.js uses for the
     v1.18 plants). The crown of a tree takes forty ellipses to paint well
     and one drawImage to stamp. They are shared: one picture per kind,
     variant and size, so a whole forest uses a handful. */
  var SPR = new Map(), SPR_CAP = 260, sprS = 0;
  function sprScale() {
    var s = Math.min(window.devicePixelRatio || 1, 2) * ((GG.view && GG.view.zoom) || 1);
    return Math.min(3, Math.round(s * 4) / 4);
  }
  /* key: a small number per kind, the variant and the size; paint(g, ox, oy)
     draws the thing with its base at (ox, oy) */
  var sprPx = 0, SPR_PX = 10e6;   // at most ~40 MB of pictures
  function cached(key) {
    var S = sprScale();
    if (S !== sprS) { SPR.clear(); sprS = S; sprPx = 0; }
    return SPR.get(key);
  }
  function sprite(key, w, up, down, paint) {
    var e = SPR.get(key), S = sprS || sprScale();
    if (!e) {
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil(w * 2 * S)); cv.height = Math.max(1, Math.ceil((up + down) * S));
      var g = cv.getContext('2d');
      g.setTransform(S, 0, 0, S, 0, 0);
      g.lineCap = 'round'; g.lineJoin = 'round';
      paint(g, w, up);
      e = { cv: cv, w: w, up: up, h: up + down };
      SPR.set(key, e);
      sprPx += cv.width * cv.height;
      while (SPR.size > SPR_CAP || sprPx > SPR_PX) {
        var old = SPR.keys().next().value, oe = SPR.get(old);
        sprPx -= oe.cv.width * oe.cv.height;
        SPR.delete(old);
      }
    }
    return e;
  }
  /* stamp it, landing on whole device pixels so it never goes soft; k
     scales it (a prop a shade bigger or smaller than its picture) */
  function stamp(c, e, x, y, k) {
    var S = sprS, kk = k || 1;
    var dx = Math.round((x - e.w * kk) * S) / S, dy = Math.round((y - e.up * kk) * S) / S;
    c.drawImage(e.cv, dx, dy, e.w * 2 * kk, e.h * kk);
  }
  var KIND_ID = { tree: 1, pine: 2, bush: 3, rock: 4, log: 5, stump: 6, willow: 7, mushroom: 8,
    flower: 9, tulip: 10, fence: 11 };
  /* a size bucket: r to the nearest 2 px, so near sizes share one picture */
  function rb(r) { return Math.max(2, Math.round(r / 2) * 2); }
  function skey(kind, variant, r) { return (KIND_ID[kind] * 16 + variant) * 1024 + rb(r); }
  /* colour names to small numbers, for the flower keys */
  var colId = {}, colN = 0;
  function cid(col) { var v = colId[col]; if (v == null) v = colId[col] = ++colN; return v; }
  function shd(col, amt) {
    return (typeof col === 'string' && col.charAt(0) === '#' && col.length === 7) ? GG.shade(col, amt) : col;
  }

  var P = {};

  /* v1.20: a rounder, brighter crown - a dark rim and underside, a sunny
     top, a few light leaf-clumps - in three shapes, stamped. The trunk and
     the gentle sway stay live. */
  function treeCrown(g, cx, cy, r, v) {
    var rnd = GG.mulberry32(7331 + v * 101);
    var blobs = [[-0.46, 0.2, 0.62, 0.56], [0.46, 0.2, 0.62, 0.56], [0, -0.22, 0.74, 0.66]];
    if (v === 1) blobs.push([-0.2, 0.34, 0.5, 0.42]);
    if (v === 2) blobs.push([0.24, -0.4, 0.46, 0.4]);
    var i, b;
    /* the outline and the shaded underside */
    g.fillStyle = '#1f5a30';
    for (i = 0; i < blobs.length; i++) { b = blobs[i]; ell(g, cx + b[0] * r, cy + b[1] * r + 1.2, b[2] * r + 1.4, b[3] * r + 1.4); }
    g.fillStyle = '#2e8a3c';
    for (i = 0; i < blobs.length; i++) { b = blobs[i]; ell(g, cx + b[0] * r, cy + b[1] * r, b[2] * r, b[3] * r); }
    /* the lit upper body */
    g.fillStyle = '#45ad4a';
    ell(g, cx - r * 0.34, cy + r * 0.02, r * 0.5, r * 0.42);
    ell(g, cx + r * 0.40, cy - r * 0.02, r * 0.46, r * 0.40);
    ell(g, cx - r * 0.05, cy - r * 0.36, r * 0.6, r * 0.5);
    g.fillStyle = '#63c75a';
    ell(g, cx - r * 0.24, cy - r * 0.34, r * 0.38, r * 0.3);
    ell(g, cx + r * 0.26, cy - r * 0.16, r * 0.3, r * 0.25);
    /* leaf clumps catching the sun */
    g.fillStyle = '#8ade70';
    ell(g, cx - r * 0.32, cy - r * 0.46, r * 0.2, r * 0.13);
    ell(g, cx + r * 0.08, cy - r * 0.62, r * 0.16, r * 0.1);
    for (i = 0; i < 5; i++) {
      var a = Math.PI * (1.05 + rnd() * 0.9), d = 0.35 + rnd() * 0.35;
      g.fillStyle = i % 2 ? '#7bd466' : '#57b84f';
      ell(g, cx + Math.cos(a) * r * d * 1.1, cy - r * 0.1 + Math.sin(a) * r * d * 0.8, r * 0.1, r * 0.07);
    }
    /* a few darker leaves low down, in the shade, for texture */
    g.fillStyle = 'rgba(24,96,48,0.55)';
    for (i = 0; i < 5; i++) {
      var lx = cx + (rnd() - 0.5) * r * 1.3, ly = cy + r * (0.12 + rnd() * 0.32);
      ell(g, lx, ly, r * 0.07, r * 0.04, (rnd() - 0.5) * 1.2);
    }
  }
  P.tree = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.8 + seed * 6) * 2.2;
    shadow(c, x + 2, y, r * 0.76);
    c.fillStyle = '#6e4a2a';
    c.beginPath();
    c.moveTo(x - r * 0.17, y);
    c.lineTo(x - r * 0.12 + sway * 0.4, y - r * 0.95);
    c.lineTo(x + r * 0.12 + sway * 0.4, y - r * 0.95);
    c.lineTo(x + r * 0.17, y);
    c.closePath(); c.fill();
    c.fillStyle = '#8f6538';
    c.beginPath();
    c.moveTo(x - r * 0.17, y);
    c.lineTo(x - r * 0.12 + sway * 0.4, y - r * 0.95);
    c.lineTo(x - r * 0.03 + sway * 0.4, y - r * 0.95);
    c.lineTo(x - r * 0.06, y);
    c.closePath(); c.fill();
    var v = (seed * 3) | 0, R = rb(r);
    var K = skey('tree', v, r);
    var e = cached(K) || sprite(K, R * 1.12 + 3, R * 2.1 + 3, 3, function (g, ox, oy) {
      treeCrown(g, ox, oy - R * 1.18, R, v);
    });
    stamp(c, e, x + sway, y, r / R);
  };

  function pineBody(g, x, y, r) {
    for (var i = 0; i < 3; i++) {
      var w = r * (0.82 - i * 0.20), yy = y - r * (0.35 + i * 0.55), h = r * 0.82;
      /* dark rim, then the shaded right side, then the lit left side */
      g.fillStyle = '#18493a';
      g.beginPath(); g.moveTo(x, yy - h - 1.4); g.lineTo(x - w - 1.4, yy + 1.2); g.lineTo(x + w + 1.4, yy + 1.2); g.closePath(); g.fill();
      g.fillStyle = i === 2 ? '#2f8452' : (i === 1 ? '#2b7a4b' : '#277044');
      g.beginPath(); g.moveTo(x, yy - h); g.lineTo(x - w, yy); g.lineTo(x + w, yy); g.closePath(); g.fill();
      g.fillStyle = i === 2 ? '#43a364' : (i === 1 ? '#3d985c' : '#378c54');
      g.beginPath(); g.moveTo(x, yy - h); g.lineTo(x - w, yy); g.lineTo(x - w * 0.1, yy - h * 0.12); g.closePath(); g.fill();
      /* the drooping hem of each tier */
      g.fillStyle = 'rgba(12,50,34,0.35)';
      g.beginPath(); g.moveTo(x - w, yy); g.quadraticCurveTo(x, yy - h * 0.16, x + w, yy); g.quadraticCurveTo(x, yy - h * 0.05, x - w, yy); g.fill();
      g.fillStyle = 'rgba(200,255,200,0.35)';
      g.beginPath(); g.moveTo(x - w * 0.1, yy - h * 0.88); g.lineTo(x - w * 0.22, yy - h * 0.62); g.lineTo(x - w * 0.06, yy - h * 0.7); g.closePath(); g.fill();
    }
  }
  P.pine = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.7 + seed * 5) * 1.6;
    shadow(c, x + 2, y, r * 0.6);
    c.fillStyle = '#6e4a2a';
    c.fillRect(x - r * 0.11, y - r * 0.5, r * 0.22, r * 0.5);
    c.fillStyle = '#8f6538';
    c.fillRect(x - r * 0.11, y - r * 0.5, r * 0.08, r * 0.5);
    var R = rb(r);
    var K = skey('pine', 0, r);
    var e = cached(K) || sprite(K, R * 0.86 + 2, R * 2.3 + 3, 3, function (g, ox, oy) { pineBody(g, ox, oy, R); });
    stamp(c, e, x + sway * 0.7, y, r / R);
  };

  P.appleTree = function (c, x, y, r, t, seed, col, p) {
    P.tree(c, x, y, r, t, seed);
    var cx = x + Math.sin(t * 0.8 + seed * 6) * 2.2, cy = y - r * 1.18;
    /* Since v1.12 each orchard tree carries a real fruit, and it grows back
       after she picks it. A tree with no fruit assigned keeps its old apples. */
    var def = p && p.fruit && GG.FRUIT_BY_ID ? GG.FRUIT_BY_ID[p.fruit] : null;
    if (def) {
      var ripe = (p.ripe == null) ? 1 : p.ripe;
      GG.FruitArt.onPlant(c, def, cx, cy, r, 6, seed, t, ripe);
      return;
    }
    c.fillStyle = '#e0413c';
    var rnd = GG.mulberry32(Math.floor(seed * 9999));
    for (var i = 0; i < 5; i++) {
      ell(c, cx + (rnd() - 0.5) * r * 1.2, cy + (rnd() - 0.3) * r * 0.9, r * 0.11, r * 0.11);
    }
  };

  /* A low, tough, grey-green hillside shrub: serviceberry, currant,
     chokecherry, wild rose or snowberry, depending on what it carries. */
  P.wildBush = function (c, x, y, r, t, seed, col, p) {
    var def = p && p.fruit && GG.FRUIT_BY_ID ? GG.FRUIT_BY_ID[p.fruit] : null;
    var leaf = (def && def.leaf) || '#6a8f5a';
    shadow(c, x + 1, y, r * 0.8);
    /* woody stems */
    c.strokeStyle = '#7a6a52'; c.lineWidth = Math.max(1, r * 0.07); c.lineCap = 'round';
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.08, y);
      c.quadraticCurveTo(x + i * r * 0.3, y - r * 0.5, x + i * r * 0.42, y - r * 0.78);
      c.stroke();
    }
    c.fillStyle = GG.shade(leaf, -0.14);
    ell(c, x - r * 0.4, y - r * 0.34, r * 0.52, r * 0.4);
    ell(c, x + r * 0.4, y - r * 0.34, r * 0.52, r * 0.4);
    ell(c, x, y - r * 0.58, r * 0.6, r * 0.48);
    c.fillStyle = leaf;
    ell(c, x - r * 0.18, y - r * 0.6, r * 0.38, r * 0.3);
    ell(c, x + r * 0.26, y - r * 0.44, r * 0.32, r * 0.26);
    c.fillStyle = GG.shade(leaf, 0.16);
    ell(c, x - r * 0.32, y - r * 0.72, r * 0.2, r * 0.16);
    if (def) {
      var ripe = (p.ripe == null) ? 1 : p.ripe;
      GG.FruitArt.onPlant(c, def, x, y - r * 0.52, r * 0.98, 5, seed, t, ripe);
    }
  };

  P.bush = function (c, x, y, r, t, seed) {
    shadow(c, x + 1, y, r * 0.9);
    var v = (seed * 2) | 0, R = rb(r);
    var K = skey('bush', v, r);
    var e = cached(K) || sprite(K, R * 1.12 + 2, R * 1.25 + 3, 3, function (g, ox, oy) {
      var X = ox, Y = oy, r = R;
      g.fillStyle = '#1f5a30';
      ell(g, X - r * 0.42, Y - r * 0.34, r * 0.62, r * 0.5);
      ell(g, X + r * 0.42, Y - r * 0.34, r * 0.62, r * 0.5);
      ell(g, X, Y - r * 0.6, r * 0.7, r * 0.58);
      g.fillStyle = '#2f8a3c';
      ell(g, X - r * 0.42, Y - r * 0.36, r * 0.6, r * 0.48);
      ell(g, X + r * 0.42, Y - r * 0.36, r * 0.6, r * 0.48);
      ell(g, X, Y - r * 0.6, r * 0.68, r * 0.56);
      g.fillStyle = '#4bb04e';
      ell(g, X - r * 0.2, Y - r * 0.64, r * 0.44, r * 0.34);
      ell(g, X + r * 0.3, Y - r * 0.48, r * 0.34, r * 0.28);
      g.fillStyle = '#7ed468';
      ell(g, X - r * 0.28, Y - r * 0.8, r * 0.2, r * 0.12);
      ell(g, X + r * 0.3, Y - r * 0.6, r * 0.14, r * 0.09);
      if (v) {
        /* a few tiny white flowers on some of them */
        g.fillStyle = '#fffbe8';
        ell(g, X - r * 0.5, Y - r * 0.5, r * 0.07, r * 0.07);
        ell(g, X + r * 0.1, Y - r * 0.9, r * 0.07, r * 0.07);
        ell(g, X + r * 0.55, Y - r * 0.38, r * 0.07, r * 0.07);
      }
    });
    stamp(c, e, x, y, r / R);
  };

  /* The orchard's berry rows. Like the hillside shrub, this one carries a
     real species since v1.13 - a bramble, a cane, a currant bush, a
     gooseberry, or the nightshade climbing up through them. */
  P.berryBush = function (c, x, y, r, t, seed, col, p) {
    var def = p && p.fruit && GG.FRUIT_BY_ID ? GG.FRUIT_BY_ID[p.fruit] : null;
    var on = def ? def.on : null;
    var leaf = (def && def.leaf) || '#47954a';
    var sway = Math.sin(t * 0.9 + seed * 7) * 1.4;
    var i;
    shadow(c, x + 1, y, r * 0.85);

    if (on === 'bramble' || on === 'cane') {
      /* long arching canes, prickles and all */
      c.strokeStyle = '#6e5a3e'; c.lineWidth = Math.max(1.2, r * 0.09); c.lineCap = 'round';
      for (i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(x + i * r * 0.16, y);
        c.quadraticCurveTo(x + i * r * 0.8, y - r * 1.0, x + i * r * 1.25 + sway * 0.4, y - r * 0.72);
        c.stroke();
      }
      c.fillStyle = GG.shade(leaf, -0.16);
      ell(c, x - r * 0.55, y - r * 0.58, r * 0.46, r * 0.34, -0.3);
      ell(c, x + r * 0.55, y - r * 0.58, r * 0.46, r * 0.34, 0.3);
      ell(c, x, y - r * 0.86, r * 0.5, r * 0.36);
      c.fillStyle = leaf;
      ell(c, x - r * 0.24, y - r * 0.84, r * 0.34, r * 0.24, -0.2);
      ell(c, x + r * 0.34, y - r * 0.66, r * 0.30, r * 0.22, 0.2);
    } else if (on === 'vine') {
      /* it climbs. That is the whole point of the nightshade. */
      c.strokeStyle = '#6a7a4e'; c.lineWidth = Math.max(1.1, r * 0.08); c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, y);
      c.bezierCurveTo(x - r * 0.4, y - r * 0.6, x + r * 0.45, y - r * 1.0, x + sway * 0.5, y - r * 1.5);
      c.stroke();
      c.fillStyle = GG.shade(leaf, -0.12);
      for (i = 0; i < 4; i++) {
        var vy = y - r * (0.3 + i * 0.34), sgn = i % 2 ? 1 : -1;
        ell(c, x + sgn * r * 0.34 + sway * 0.2 * i, vy, r * 0.30, r * 0.20, sgn * 0.4);
      }
      c.fillStyle = leaf;
      ell(c, x - r * 0.28 + sway * 0.3, y - r * 1.28, r * 0.26, r * 0.17, -0.35);
    } else {
      /* a neat rounded bush: currant, gooseberry, or no fruit assigned */
      c.fillStyle = GG.shade(leaf, -0.26);
      ell(c, x - r * 0.42, y - r * 0.36, r * 0.6, r * 0.48);
      ell(c, x + r * 0.42, y - r * 0.36, r * 0.6, r * 0.48);
      ell(c, x, y - r * 0.6, r * 0.68, r * 0.56);
      c.fillStyle = leaf;
      ell(c, x - r * 0.2, y - r * 0.62, r * 0.42, r * 0.34);
      ell(c, x + r * 0.28, y - r * 0.46, r * 0.34, r * 0.28);
      c.fillStyle = GG.shade(leaf, 0.16);
      ell(c, x - r * 0.34, y - r * 0.74, r * 0.2, r * 0.16);
    }

    if (def) {
      var ripe = (p.ripe == null) ? 1 : p.ripe;
      var fy = (on === 'vine') ? y - r * 1.05 : y - r * 0.58;
      GG.FruitArt.onPlant(c, def, x, fy, r * 1.0, 5, seed, t, ripe);
      return;
    }
    var rnd = GG.mulberry32(Math.floor(seed * 7777));
    c.fillStyle = '#b6407e';
    for (i = 0; i < 6; i++) ell(c, x + (rnd() - 0.5) * r * 1.5, y - r * (0.2 + rnd() * 0.7), r * 0.1, r * 0.1);
  };

  /* A strawberry is not a bush. It is a rosette of three-part leaves lying on
     the ground with a runner snaking away, and the fruit hangs just clear of
     the dirt - which is the reason you always wash that one. */
  P.fruitPatch = function (c, x, y, r, t, seed, col, p) {
    var def = p && p.fruit && GG.FRUIT_BY_ID ? GG.FRUIT_BY_ID[p.fruit] : null;
    var leaf = (def && def.leaf) || '#5f9a44';
    var sway = Math.sin(t * 1.5 + seed * 9) * 0.8;
    var i, k, a;
    c.fillStyle = 'rgba(30,60,25,0.14)';
    ell(c, x + 1, y, r * 0.9, r * 0.28);
    /* the runner, with a baby plant on the end of it */
    c.strokeStyle = '#b06a4a'; c.lineWidth = Math.max(0.9, r * 0.06); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y - r * 0.1);
    c.quadraticCurveTo(x + r * 0.7, y + r * 0.12, x + r * 1.15, y - r * 0.02);
    c.stroke();
    c.fillStyle = GG.shade(leaf, 0.1);
    ell(c, x + r * 1.2, y - r * 0.1, r * 0.16, r * 0.12);
    /* the rosette: five leaves, each three leaflets */
    for (i = 0; i < 5; i++) {
      a = -Math.PI + i * (Math.PI / 4);
      var lx = x + Math.cos(a) * r * 0.46 + sway * 0.3;
      var ly = y - r * 0.2 + Math.sin(a) * r * 0.20;
      c.fillStyle = i % 2 ? leaf : GG.shade(leaf, -0.14);
      for (k = -1; k <= 1; k++) {
        ell(c, lx + k * r * 0.17, ly - Math.abs(k) * r * 0.04, r * 0.16, r * 0.13);
      }
    }
    if (def) {
      var ripe = (p.ripe == null) ? 1 : p.ripe;
      GG.FruitArt.onPlant(c, def, x, y - r * 0.34, r * 0.66, 3, seed, t, ripe);
    } else {
      c.fillStyle = '#fbf6ee';
      ell(c, x + r * 0.2, y - r * 0.44, r * 0.13, r * 0.11);
      c.fillStyle = '#e8c33a';
      ell(c, x + r * 0.2, y - r * 0.44, r * 0.05, r * 0.045);
    }
  };

  P.rock = function (c, x, y, r, t, seed) {
    shadow(c, x + 1, y, r * 0.95);
    var v = (seed * 3) | 0, R = rb(r);
    var K = skey('rock', v, r);
    var e = cached(K) || sprite(K, R * 1.08 + 2, R * 1.05 + 3, 3, function (g, X, Y) {
      var r = R, j = [0, 0.08, -0.08][v];
      function body() {
        g.beginPath();
        g.moveTo(X - r, Y);
        g.lineTo(X - r * (0.72 + j), Y - r * 0.72);
        g.lineTo(X - r * (0.1 - j), Y - r * (0.95 - j * 0.5));
        g.lineTo(X + r * 0.62, Y - r * (0.68 + j));
        g.lineTo(X + r, Y);
        g.closePath();
      }
      g.lineWidth = 2.2; g.strokeStyle = '#5f6468';
      body(); g.stroke();
      g.fillStyle = '#9ea4a6'; body(); g.fill();
      /* the shaded right face */
      g.fillStyle = '#868c90';
      g.beginPath();
      g.moveTo(X - r * (0.1 - j), Y - r * (0.95 - j * 0.5)); g.lineTo(X + r * 0.62, Y - r * (0.68 + j));
      g.lineTo(X + r, Y); g.lineTo(X + r * 0.1, Y); g.lineTo(X + r * 0.2, Y - r * 0.45);
      g.closePath(); g.fill();
      /* the sunny top */
      g.fillStyle = '#c9ced0';
      g.beginPath();
      g.moveTo(X - r * 0.62, Y - r * 0.6);
      g.lineTo(X - r * (0.1 - j), Y - r * (0.88 - j * 0.5));
      g.lineTo(X + r * 0.3, Y - r * 0.55);
      g.lineTo(X - r * 0.2, Y - r * 0.4);
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.beginPath(); g.moveTo(X - r * 0.52, Y - r * 0.62); g.lineTo(X - r * (0.14 - j), Y - r * (0.84 - j * 0.5)); g.lineTo(X - r * 0.3, Y - r * 0.6); g.closePath(); g.fill();
      /* a speck of moss */
      g.fillStyle = '#7cc05a';
      ell(g, X - r * 0.55, Y - r * 0.18, r * 0.16, r * 0.08);
    });
    stamp(c, e, x, y, r / R);
  };

  /* v1.20: brighter petals with a soft darker edge, a glossy yellow eye,
     a leaf on the stem, and a small shadow. The head is stamped. */
  P.flower = function (c, x, y, r, t, seed, col) {
    var sway = Math.sin(t * 1.6 + seed * 8) * 1.2;
    shadow(c, x + 1, y, r * 0.42);
    c.strokeStyle = '#3f9a3a'; c.lineWidth = Math.max(1, r * 0.14); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * 0.4, y - r * 0.8, x + sway, y - r * 1.3); c.stroke();
    c.fillStyle = '#56b848';
    ell(c, x + r * 0.28 + sway * 0.2, y - r * 0.45, r * 0.3, r * 0.12, -0.5);
    if (typeof col !== 'string') col = '#ff9ec0';
    var R = rb(r), v = ((seed * 5) | 0) % 5;
    var K = ((KIND_ID.flower * 16 + v) * 1024 + R) * 64 + (cid(col) & 63);
    var e = cached(K) || sprite(K, R * 1.02 + 2, R * 1.02 + 2, R * 1.02 + 2, function (g, X, Y) {
      var a0 = v * 1.2566 / 5, i, a;
      g.fillStyle = shd(col, -0.22);
      for (i = 0; i < 5; i++) { a = i * Math.PI * 2 / 5 + a0; ell(g, X + Math.cos(a) * R * 0.5, Y + Math.sin(a) * R * 0.5, R * 0.46, R * 0.46); }
      g.fillStyle = col;
      for (i = 0; i < 5; i++) { a = i * Math.PI * 2 / 5 + a0; ell(g, X + Math.cos(a) * R * 0.5, Y + Math.sin(a) * R * 0.5, R * 0.4, R * 0.4); }
      g.fillStyle = shd(col, 0.35);
      for (i = 0; i < 5; i++) { a = i * Math.PI * 2 / 5 + a0; ell(g, X + Math.cos(a) * R * 0.56 - R * 0.06, Y + Math.sin(a) * R * 0.56 - R * 0.08, R * 0.16, R * 0.12); }
      g.fillStyle = '#e8a91c'; ell(g, X, Y + R * 0.03, R * 0.34, R * 0.34);
      g.fillStyle = '#ffd94a'; ell(g, X, Y, R * 0.3, R * 0.3);
      g.fillStyle = '#fff4b0'; ell(g, X - R * 0.1, Y - R * 0.1, R * 0.1, R * 0.08);
    });
    stamp(c, e, x + sway, y - r * 1.3, r / R);
  };

  P.tulip = function (c, x, y, r, t, seed, col) {
    var sway = Math.sin(t * 1.4 + seed * 8) * 1.1;
    shadow(c, x + 1, y, r * 0.4);
    c.strokeStyle = '#3f9a3a'; c.lineWidth = Math.max(1, r * 0.16); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * 0.4, y - r, x + sway, y - r * 1.5); c.stroke();
    c.fillStyle = '#56b848';
    ell(c, x - r * 0.5 + sway * 0.2, y - r * 0.6, r * 0.5, r * 0.2, -0.5);
    if (typeof col !== 'string') col = '#ff7a8a';
    var R = rb(r);
    var K = ((KIND_ID.tulip * 16) * 1024 + R) * 64 + (cid(col) & 63);
    var e = cached(K) || sprite(K, R * 0.62 + 2, R * 0.9 + 2, R * 0.62 + 2, function (g, cx, cy) {
      var r = R;
      function cup() {
        g.beginPath();
        g.moveTo(cx - r * 0.5, cy + r * 0.2);
        g.quadraticCurveTo(cx - r * 0.55, cy - r * 0.6, cx, cy - r * 0.8);
        g.quadraticCurveTo(cx + r * 0.55, cy - r * 0.6, cx + r * 0.5, cy + r * 0.2);
        g.quadraticCurveTo(cx, cy + r * 0.55, cx - r * 0.5, cy + r * 0.2);
      }
      g.lineWidth = 1.4; g.strokeStyle = shd(col, -0.3); cup(); g.stroke();
      g.fillStyle = col; cup(); g.fill();
      g.fillStyle = shd(col, -0.18);
      g.beginPath(); g.moveTo(cx, cy - r * 0.8); g.quadraticCurveTo(cx - r * 0.2, cy - r * 0.1, cx, cy + r * 0.35);
      g.quadraticCurveTo(cx + r * 0.2, cy - r * 0.1, cx, cy - r * 0.8); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)';
      ell(g, cx - r * 0.26, cy - r * 0.3, r * 0.08, r * 0.22, 0.2);
    });
    stamp(c, e, x + sway, y - r * 1.62, r / R);
  };

  P.grassTuft = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.9 + seed * 11) * 1.6;
    c.lineCap = 'round';
    c.lineWidth = Math.max(1, r * 0.17);
    c.strokeStyle = '#3f9a3c';
    c.beginPath();
    for (var i = -2; i <= 2; i++) {
      c.moveTo(x + i * r * 0.2, y);
      c.quadraticCurveTo(x + i * r * 0.35 + sway * 0.4, y - r * 0.7, x + i * r * 0.55 + sway, y - r * 1.1);
    }
    c.stroke();
    /* two lit blades in front */
    c.strokeStyle = '#7fd35a';
    c.lineWidth = Math.max(0.9, r * 0.12);
    c.beginPath();
    c.moveTo(x - r * 0.1, y);
    c.quadraticCurveTo(x - r * 0.12 + sway * 0.4, y - r * 0.5, x - r * 0.2 + sway, y - r * 0.85);
    c.moveTo(x + r * 0.12, y);
    c.quadraticCurveTo(x + r * 0.2 + sway * 0.4, y - r * 0.45, x + r * 0.34 + sway, y - r * 0.75);
    c.stroke();
  };

  P.mushroom = function (c, x, y, r, t, seed) {
    shadow(c, x + 1, y, r * 0.55);
    var R = rb(r);
    var K = skey('mushroom', 0, r);
    var e = cached(K) || sprite(K, R * 0.72 + 2, R * 1.25 + 2, 2, function (g, X, Y) {
      var r = R;
      g.fillStyle = '#d9ccb2';
      GG.roundRect(g, X - r * 0.2, Y - r * 0.72, r * 0.4, r * 0.72, r * 0.1); g.fill();
      g.fillStyle = '#fbf4e4';
      GG.roundRect(g, X - r * 0.2, Y - r * 0.72, r * 0.24, r * 0.72, r * 0.1); g.fill();
      g.fillStyle = '#9e2a28';
      g.beginPath(); g.ellipse(X, Y - r * 0.68, r * 0.68, r * 0.54, 0, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#e8453c';
      g.beginPath(); g.ellipse(X, Y - r * 0.72, r * 0.62, r * 0.48, 0, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#ff7a5e';
      g.beginPath(); g.ellipse(X - r * 0.14, Y - r * 0.86, r * 0.34, r * 0.26, 0, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#fff6ea';
      ell(g, X - r * 0.28, Y - r * 0.9, r * 0.12, r * 0.1);
      ell(g, X + r * 0.2, Y - r * 1.0, r * 0.1, r * 0.09);
      ell(g, X + r * 0.4, Y - r * 0.8, r * 0.07, r * 0.06);
      ell(g, X - r * 0.02, Y - r * 1.1, r * 0.07, r * 0.05);
    });
    stamp(c, e, x, y, r / R);
  };

  P.log = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.15);
    var R = rb(r);
    var K = skey('log', 0, r);
    var e = cached(K) || sprite(K, R * 1.1 + 2, R * 0.72 + 2, 2, function (g, X, Y) {
      var r = R;
      g.fillStyle = '#4e331d';
      GG.roundRect(g, X - r - 1, Y - r * 0.64, r * 2 + 2, r * 0.72, r * 0.32); g.fill();
      g.fillStyle = '#80583a';
      GG.roundRect(g, X - r, Y - r * 0.62, r * 2, r * 0.68, r * 0.3); g.fill();
      g.fillStyle = '#9c7048';
      GG.roundRect(g, X - r * 0.9, Y - r * 0.6, r * 1.85, r * 0.2, r * 0.1); g.fill();
      g.strokeStyle = 'rgba(60,36,18,0.45)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(X - r * 0.4, Y - r * 0.3); g.lineTo(X + r * 0.5, Y - r * 0.3);
      g.moveTo(X - r * 0.1, Y - r * 0.14); g.lineTo(X + r * 0.8, Y - r * 0.14); g.stroke();
      g.fillStyle = '#6fb54a';
      ell(g, X + r * 0.3, Y - r * 0.6, r * 0.28, r * 0.08);
      g.fillStyle = '#96683d';
      ell(g, X - r * 0.95, Y - r * 0.3, r * 0.22, r * 0.34);
      g.fillStyle = '#d9a672';
      ell(g, X - r * 0.95, Y - r * 0.3, r * 0.14, r * 0.23);
      g.strokeStyle = '#b07d4c'; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(X - r * 0.95, Y - r * 0.3, r * 0.07, r * 0.12, 0, 0, Math.PI * 2); g.stroke();
    });
    stamp(c, e, x, y, r / R);
  };

  P.stump = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.0);
    var R = rb(r);
    var K = skey('stump', 0, r);
    var e = cached(K) || sprite(K, R * 0.8 + 2, R * 1.2 + 2, 2, function (g, X, Y) {
      var r = R;
      g.fillStyle = '#4e331d';
      GG.roundRect(g, X - r * 0.72, Y - r * 0.86, r * 1.44, r * 0.92, r * 0.18); g.fill();
      g.fillStyle = '#80583a';
      GG.roundRect(g, X - r * 0.7, Y - r * 0.85, r * 1.4, r * 0.9, r * 0.18); g.fill();
      g.fillStyle = '#9c7048';
      g.fillRect(X - r * 0.55, Y - r * 0.8, r * 0.24, r * 0.74);
      g.fillStyle = '#6a4629';
      g.fillRect(X + r * 0.3, Y - r * 0.8, r * 0.16, r * 0.74);
      g.fillStyle = '#e0ae78'; ell(g, X, Y - r * 0.85, r * 0.7, r * 0.28);
      g.strokeStyle = '#b07d4c'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(X, Y - r * 0.85, r * 0.44, r * 0.17, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.ellipse(X, Y - r * 0.85, r * 0.2, r * 0.08, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#6fb54a';
      ell(g, X - r * 0.5, Y - r * 0.05, r * 0.26, r * 0.08);
    });
    stamp(c, e, x, y, r / R);
  };

  P.reed = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.5 + seed * 9) * 2;
    c.strokeStyle = '#4c9a44'; c.lineWidth = Math.max(1.2, r * 0.14); c.lineCap = 'round';
    c.beginPath();
    for (var i = -1; i <= 1; i++) {
      c.moveTo(x + i * r * 0.3, y);
      c.quadraticCurveTo(x + i * r * 0.4 + sway * 0.5, y - r, x + i * r * 0.5 + sway, y - r * 1.7);
    }
    c.stroke();
    c.strokeStyle = '#7ccf5e'; c.lineWidth = Math.max(0.8, r * 0.07);
    c.beginPath();
    c.moveTo(x - r * 0.28, y - r * 0.1);
    c.quadraticCurveTo(x - r * 0.38 + sway * 0.5, y - r, x - r * 0.48 + sway, y - r * 1.6);
    c.stroke();
    c.fillStyle = '#6e4424';
    ell(c, x + sway, y - r * 1.85, r * 0.15, r * 0.36);
    c.fillStyle = '#a8703c';
    ell(c, x + sway - r * 0.04, y - r * 1.9, r * 0.07, r * 0.26);
  };

  P.lilypad = function (c, x, y, r, t, seed) {
    var bob = Math.sin(t * 1.1 + seed * 7) * 1.2;
    /* v1.20: a darker rim under a brighter, glossier pad */
    c.fillStyle = '#2f7a40';
    c.beginPath();
    c.ellipse(x + bob * 0.4, y + bob * 0.2 + 1, r + 0.8, r * 0.82 + 0.8, seed * 3, 0.42, Math.PI * 2 + 0.1);
    c.closePath(); c.fill();
    c.fillStyle = '#4fae55';
    c.beginPath();
    c.ellipse(x + bob * 0.4, y + bob * 0.2, r, r * 0.82, seed * 3, 0.42, Math.PI * 2 + 0.1);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(190,255,170,0.28)';
    ell(c, x + bob * 0.4 - r * 0.3, y + bob * 0.2 - r * 0.28, r * 0.36, r * 0.18, -0.4);
    c.strokeStyle = 'rgba(20,80,30,0.3)'; c.lineWidth = 1;
    for (var i = 0; i < 5; i++) {
      var a = 0.7 + i * 0.95;
      c.beginPath(); c.moveTo(x + bob * 0.4, y + bob * 0.2);
      c.lineTo(x + bob * 0.4 + Math.cos(a) * r * 0.85, y + bob * 0.2 + Math.sin(a) * r * 0.7);
      c.stroke();
    }
    if (seed > 0.72) {
      c.fillStyle = '#f6b8d8';
      for (var j = 0; j < 5; j++) {
        var b = j * 1.256 + seed;
        ell(c, x + bob * 0.4 + Math.cos(b) * r * 0.24, y + bob * 0.2 + Math.sin(b) * r * 0.2, r * 0.2, r * 0.2);
      }
      c.fillStyle = '#ffe27a'; ell(c, x + bob * 0.4, y + bob * 0.2, r * 0.15, r * 0.15);
    }
  };

  P.fence = function (c, x, y, r, t, seed) {
    shadow(c, x + 1, y, r * 0.9, r * 0.16);
    c.fillStyle = '#8a6a40';
    c.fillRect(x - r * 0.12 - 0.8, y - r * 1.1, r * 0.24 + 1.6, r * 1.1);
    c.fillRect(x - r, y - r * 0.9 - 0.8, r * 2, r * 0.16 + 1.6);
    c.fillRect(x - r, y - r * 0.5 - 0.8, r * 2, r * 0.16 + 1.6);
    c.fillStyle = '#e2c290';
    c.fillRect(x - r * 0.12, y - r * 1.1, r * 0.24, r * 1.1);
    c.fillRect(x - r, y - r * 0.9, r * 2, r * 0.16);
    c.fillRect(x - r, y - r * 0.5, r * 2, r * 0.16);
    c.fillStyle = '#f4dcae';
    c.fillRect(x - r, y - r * 0.9, r * 2, r * 0.05);
    c.fillRect(x - r, y - r * 0.5, r * 2, r * 0.05);
    c.fillStyle = '#b48c5a';
    c.beginPath();
    c.moveTo(x - r * 0.12, y - r * 1.1); c.lineTo(x, y - r * 1.3); c.lineTo(x + r * 0.12, y - r * 1.1);
    c.closePath(); c.fill();
  };

  /* The board grows to fit its words ("Dog's Paradise" ran off both ends
     of the old fixed-width board). Text widths are remembered per label. */
  var signTextW = {};
  P.sign = function (c, x, y, r, t, seed, label) {
    var font = 'bold ' + Math.round(r * 0.36) + 'px "Trebuchet MS", sans-serif';
    var w = r * 1.8;
    if (label) {
      c.font = font;
      var key = label + '|' + font;
      var tw = signTextW[key];
      if (tw == null) tw = signTextW[key] = c.measureText(label).width;
      w = Math.max(w, tw + r * 0.5);
    }
    shadow(c, x + 2, y, r * 0.5, r * 0.18);
    c.fillStyle = '#8a6238';
    c.fillRect(x - r * 0.1, y - r * 1.1, r * 0.2, r * 1.1);
    /* the board: a dark edge, a warm face, a lit top */
    c.fillStyle = '#7a5530';
    GG.roundRect(c, x - w / 2 - 1.2, y - r * 1.9 - 1.2, w + 2.4, r * 0.9 + 3, r * 0.14); c.fill();
    c.fillStyle = '#e6c58c';
    GG.roundRect(c, x - w / 2, y - r * 1.9, w, r * 0.9, r * 0.12); c.fill();
    c.fillStyle = '#f5dcaa';
    GG.roundRect(c, x - w / 2 + 2, y - r * 1.9 + 1.5, w - 4, r * 0.16, r * 0.06); c.fill();
    if (label) {
      c.fillStyle = '#5b3d22';
      c.font = font;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(label, x, y - r * 1.43);
    }
  };

  P.beehive = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 0.7);
    c.fillStyle = '#d9a648';
    for (var i = 0; i < 3; i++) ell(c, x, y - r * (0.3 + i * 0.42), r * (0.72 - i * 0.1), r * 0.26);
    c.fillStyle = '#7a5a25'; ell(c, x, y - r * 0.35, r * 0.16, r * 0.12);
  };

  /* The player's house: front door faces down (south). v1.20: a soft
     shadow, shaded walls and roof, and the windows lit up after dark. */
  P.house = function (c, x, y, w, t) {
    var h = w * 0.72;
    shadow(c, x + 4, y + 2, w * 0.6, w * 0.13);
    c.fillStyle = '#f7ead2';
    GG.roundRect(c, x - w / 2, y - h, w, h, 6); c.fill();
    c.strokeStyle = '#c7ae86'; c.lineWidth = 2; c.stroke();
    /* the shaded right-hand wall and the dark line under the eaves */
    c.fillStyle = 'rgba(160,120,80,0.14)';
    GG.roundRect(c, x + w * 0.3, y - h + 2, w * 0.2 - 2, h - 4, 4); c.fill();
    c.fillStyle = 'rgba(120,80,50,0.18)';
    c.fillRect(x - w / 2 + 2, y - h, w - 4, 7);
    c.fillStyle = '#e25a4f';
    c.beginPath();
    c.moveTo(x - w * 0.60, y - h);
    c.lineTo(x, y - h - w * 0.46);
    c.lineTo(x + w * 0.60, y - h);
    c.closePath(); c.fill();
    c.fillStyle = '#b8443c';
    c.beginPath();
    c.moveTo(x - w * 0.60, y - h); c.lineTo(x, y - h - w * 0.46);
    c.lineTo(x, y - h + w * 0.02); c.closePath(); c.fill();
    /* the roof tiles, as soft rows */
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1.4;
    c.beginPath();
    for (var k = 1; k < 4; k++) {
      var ry = y - h - w * 0.46 * (1 - k / 4);
      var half = w * 0.60 * (k / 4);
      c.moveTo(x - half + 2, ry); c.lineTo(x + half - 2, ry);
    }
    c.stroke();
    c.fillStyle = '#ff8a78';
    c.beginPath();
    c.moveTo(x, y - h - w * 0.46); c.lineTo(x + w * 0.6, y - h); c.lineTo(x + w * 0.52, y - h); c.lineTo(x, y - h - w * 0.4);
    c.closePath(); c.fill();
    c.fillStyle = '#8a5a34';
    GG.roundRect(c, x - w * 0.14 - 1.5, y - h * 0.66 - 1.5, w * 0.28 + 3, h * 0.66 + 1.5, 5); c.fill();
    c.fillStyle = '#a8703f';
    GG.roundRect(c, x - w * 0.14, y - h * 0.66, w * 0.28, h * 0.66, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.14)';
    GG.roundRect(c, x - w * 0.1, y - h * 0.6, w * 0.08, h * 0.54, 3); c.fill();
    c.fillStyle = '#ffd88a'; ell(c, x + w * 0.08, y - h * 0.32, w * 0.024, w * 0.024);
    var lit = GG.Time && GG.Time.isDark && GG.Time.isDark();
    c.fillStyle = lit ? '#ffd46e' : '#9fdcf5';
    GG.roundRect(c, x - w * 0.40, y - h * 0.78, w * 0.20, w * 0.18, 3); c.fill();
    GG.roundRect(c, x + w * 0.20, y - h * 0.78, w * 0.20, w * 0.18, 3); c.fill();
    if (!lit) {
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.beginPath();
      c.moveTo(x - w * 0.38, y - h * 0.78 + w * 0.12); c.lineTo(x - w * 0.34, y - h * 0.78 + 2); c.lineTo(x - w * 0.31, y - h * 0.78 + 2); c.lineTo(x - w * 0.35, y - h * 0.78 + w * 0.12);
      c.moveTo(x + w * 0.22, y - h * 0.78 + w * 0.12); c.lineTo(x + w * 0.26, y - h * 0.78 + 2); c.lineTo(x + w * 0.29, y - h * 0.78 + 2); c.lineTo(x + w * 0.25, y - h * 0.78 + w * 0.12);
      c.fill();
    }
    c.strokeStyle = '#e8dcc2'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x - w * 0.30, y - h * 0.78); c.lineTo(x - w * 0.30, y - h * 0.78 + w * 0.18);
    c.moveTo(x + w * 0.30, y - h * 0.78); c.lineTo(x + w * 0.30, y - h * 0.78 + w * 0.18);
    c.stroke();
    /* window boxes of flowers */
    c.fillStyle = '#9a6a3c';
    c.fillRect(x - w * 0.41, y - h * 0.78 + w * 0.18, w * 0.22, 4);
    c.fillRect(x + w * 0.19, y - h * 0.78 + w * 0.18, w * 0.22, 4);
    var fc = ['#ff6f91', '#ffd24a', '#ffffff', '#b98cff'];
    for (var f = 0; f < 5; f++) {
      c.fillStyle = fc[f % 4];
      ell(c, x - w * 0.39 + f * w * 0.045, y - h * 0.78 + w * 0.18 - 1, 2.4, 2.4);
      c.fillStyle = fc[(f + 2) % 4];
      ell(c, x + w * 0.21 + f * w * 0.045, y - h * 0.78 + w * 0.18 - 1, 2.4, 2.4);
    }
    c.fillStyle = '#7fc26a';
    GG.roundRect(c, x - w * 0.24, y - 6, w * 0.48, 8, 3); c.fill();
    c.fillStyle = '#a4dc88';
    GG.roundRect(c, x - w * 0.22, y - 6, w * 0.44, 3, 2); c.fill();
  };

  /* ---------- the river, the beach and the tidepools ---------- */

  P.willow = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.7 + seed * 6) * 3.2;
    shadow(c, x + 2, y, r * 0.72);
    c.fillStyle = '#6a4e2e';
    c.beginPath();
    c.moveTo(x - r * 0.16, y);
    c.lineTo(x - r * 0.10 + sway * 0.3, y - r * 0.86);
    c.lineTo(x + r * 0.12 + sway * 0.3, y - r * 0.86);
    c.lineTo(x + r * 0.18, y);
    c.closePath(); c.fill();
    c.fillStyle = '#8a6a40';
    c.fillRect(x - r * 0.12, y - r * 0.8, r * 0.08, r * 0.8);
    var cx = x + sway, cy = y - r * 1.02, R = rb(r);
    var K = skey('willow', 0, r);
    var e = cached(K) || sprite(K, R * 0.95 + 2, R * 0.72 + 2, R * 0.42 + 2, function (g, X, Y) {
      var r = R;
      g.fillStyle = '#35682a';
      ell(g, X, Y - r * 0.14, r * 0.88, r * 0.52);
      g.fillStyle = '#579a3a';
      ell(g, X, Y - r * 0.16, r * 0.86, r * 0.5);
      g.fillStyle = '#7dbb4e';
      ell(g, X - r * 0.34, Y - r * 0.26, r * 0.44, r * 0.32);
      ell(g, X + r * 0.36, Y - r * 0.22, r * 0.40, r * 0.30);
      g.fillStyle = '#a6d86a';
      ell(g, X - r * 0.4, Y - r * 0.38, r * 0.2, r * 0.12);
      ell(g, X + r * 0.3, Y - r * 0.36, r * 0.16, r * 0.1);
    });
    stamp(c, e, cx, cy, r / R);
    /* the trailing curtain of leaves, two greens, one path each */
    c.lineCap = 'round';
    for (var pass = 0; pass < 2; pass++) {
      c.strokeStyle = pass ? '#9fd25e' : '#6fa844';
      c.lineWidth = Math.max(1.1, r * (pass ? 0.04 : 0.06));
      c.beginPath();
      for (var i = -4; i <= 4; i++) {
        if (pass && (i & 1)) continue;
        var bx = cx + i * r * 0.19 + (pass ? r * 0.04 : 0);
        var len = r * (0.62 + 0.34 * Math.cos(i * 0.55)) + Math.sin(seed * 9 + i) * r * 0.1 - (pass ? r * 0.08 : 0);
        var dr = sway * 0.6 + Math.sin(t * 1.1 + i * 0.8 + seed * 4) * 2.2;
        c.moveTo(bx, cy + r * 0.08);
        c.quadraticCurveTo(bx + dr * 0.5, cy + len * 0.6, bx + dr, cy + len);
      }
      c.stroke();
    }
  };

  P.palmGrass = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.3 + seed * 8) * 2.6;
    c.strokeStyle = '#8fae5c'; c.lineWidth = Math.max(1.2, r * 0.13); c.lineCap = 'round';
    for (var i = -3; i <= 3; i++) {
      var lean = i * 0.26;
      c.beginPath();
      c.moveTo(x + i * r * 0.07, y);
      c.quadraticCurveTo(x + lean * r * 0.7 + sway * 0.4, y - r * 0.8,
                         x + lean * r * 1.5 + sway, y - r * (1.05 - Math.abs(i) * 0.13));
      c.stroke();
    }
    c.strokeStyle = '#b6cd7e'; c.lineWidth = Math.max(1, r * 0.09);
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + sway * 0.5, y - r * 0.9, x + sway * 1.2, y - r * 1.25);
    c.stroke();
  };

  P.driftwood = function (c, x, y, r, t, seed) {
    shadow(c, x + 1, y, r * 0.74);
    var tilt = -0.16 + seed * 0.3;
    c.save(); c.translate(x, y - r * 0.16); c.rotate(tilt);
    c.fillStyle = '#c8b79a';
    GG.roundRect(c, -r * 0.95, -r * 0.24, r * 1.9, r * 0.44, r * 0.2); c.fill();
    c.fillStyle = '#ab977a';
    GG.roundRect(c, -r * 0.95, r * 0.02, r * 1.9, r * 0.18, r * 0.09); c.fill();
    /* a couple of bleached stubs */
    c.fillStyle = '#d6c6a9';
    c.beginPath(); c.moveTo(-r * 0.2, -r * 0.2);
    c.lineTo(-r * 0.52, -r * 0.66); c.lineTo(-r * 0.3, -r * 0.2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(r * 0.42, -r * 0.2);
    c.lineTo(r * 0.74, -r * 0.52); c.lineTo(r * 0.56, -r * 0.18); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,100,74,0.5)'; c.lineWidth = Math.max(1, r * 0.05);
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(-r * 0.8, i * r * 0.1);
      c.quadraticCurveTo(0, i * r * 0.16, r * 0.8, i * r * 0.08);
      c.stroke();
    }
    c.restore();
  };

  P.shellProp = function (c, x, y, r, t, seed) {
    var kind = seed > 0.5 ? 1 : 0;
    c.fillStyle = 'rgba(120,110,88,0.16)';
    ell(c, x + 1, y, r * 0.8, r * 0.3);
    if (kind) {
      /* a little spiral snail shell */
      c.fillStyle = '#f2d9bd';
      ell(c, x, y - r * 0.42, r * 0.72, r * 0.6, 0.2);
      c.strokeStyle = '#cf9f79'; c.lineWidth = Math.max(1, r * 0.11);
      c.beginPath();
      for (var a = 0; a < 8; a += 0.2) {
        var rr = r * 0.66 * (1 - a / 9);
        var px = x + Math.cos(a + 0.4) * rr, py = y - r * 0.42 + Math.sin(a + 0.4) * rr * 0.84;
        if (a === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
    } else {
      /* a scallop */
      c.fillStyle = '#ffe6cf';
      c.beginPath();
      c.moveTo(x, y);
      c.arc(x, y, r * 0.92, Math.PI, 0);
      c.closePath(); c.fill();
      c.strokeStyle = '#e6b48f'; c.lineWidth = Math.max(1, r * 0.09);
      for (var i = -2; i <= 2; i++) {
        c.beginPath(); c.moveTo(x, y);
        c.lineTo(x + i * r * 0.34, y - r * (0.86 - Math.abs(i) * 0.11));
        c.stroke();
      }
    }
  };

  P.pebbles = function (c, x, y, r, t, seed) {
    var cols = ['#c9c3b4', '#b3ac9c', '#ddd6c6', '#a89f90'];
    for (var i = 0; i < 5; i++) {
      var a = seed * 9 + i * 1.29;
      var px = x + Math.cos(a) * r * 0.78, py = y + Math.sin(a) * r * 0.32;
      var rr = r * (0.2 + ((i * 7 + seed * 13) % 10) / 42);
      c.fillStyle = cols[i % 4];
      ell(c, px, py, rr, rr * 0.72, a);
      c.fillStyle = 'rgba(255,255,255,0.32)';
      ell(c, px - rr * 0.22, py - rr * 0.26, rr * 0.34, rr * 0.22, a);
    }
  };

  P.kelp = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.9 + seed * 7) * 3;
    c.strokeStyle = '#5c7a3a'; c.lineWidth = Math.max(1.4, r * 0.16); c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.22, y);
      c.quadraticCurveTo(x + i * r * 0.3 + sway * 0.6, y - r * 0.6,
                         x + i * r * 0.36 + sway, y - r * 1.15);
      c.stroke();
    }
    c.fillStyle = '#7d9b48';
    for (var j = 0; j < 5; j++) {
      var ty = y - r * (0.24 + j * 0.22);
      var tx = x + sway * (j / 5) + (j % 2 ? r * 0.3 : -r * 0.3);
      ell(c, tx, ty, r * 0.26, r * 0.14, j % 2 ? 0.5 : -0.5);
    }
    c.fillStyle = '#c8b46a';
    ell(c, x + sway, y - r * 1.2, r * 0.14, r * 0.2);
  };

  P.wetrock = function (c, x, y, r, t, seed) {
    c.fillStyle = 'rgba(20,60,80,0.20)';
    ell(c, x + 1, y + r * 0.16, r * 1.05, r * 0.42);
    c.fillStyle = '#8e8b80';
    c.beginPath();
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2;
      var rr = r * (0.78 + ((i * 5 + seed * 11) % 10) / 34);
      var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.62;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.fillStyle = '#a8a599';
    ell(c, x - r * 0.16, y - r * 0.22, r * 0.5, r * 0.3, -0.3);
    c.fillStyle = 'rgba(255,255,255,0.34)';
    ell(c, x - r * 0.24, y - r * 0.3, r * 0.24, r * 0.12, -0.3);
    c.fillStyle = 'rgba(90,140,80,0.42)';
    ell(c, x + r * 0.34, y + r * 0.16, r * 0.3, r * 0.14, 0.2);
  };

  /* =====================================================================
     THE SAGEBRUSH DESERT
     A cold shrub-steppe in the rain shadow, not a Sahara: silver sagebrush,
     bunchgrass with bare ground between the clumps, black basalt and a
     cactus that only comes up to your ankle.
     ===================================================================== */

  P.sagebrush = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.9 + seed * 7) * 1.3;
    shadow(c, x + 2, y, r * 0.78);
    /* low twisted trunk with stringy shredding bark */
    c.strokeStyle = '#6e655a'; c.lineWidth = Math.max(1.4, r * 0.13); c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.1, y);
      c.quadraticCurveTo(x + i * r * 0.3, y - r * 0.32, x + i * r * 0.5 + sway * 0.3, y - r * 0.6);
      c.stroke();
    }
    /* the silver-grey dome */
    c.fillStyle = '#8e9583';
    ell(c, x - r * 0.42 + sway, y - r * 0.72, r * 0.52, r * 0.42);
    ell(c, x + r * 0.42 + sway, y - r * 0.70, r * 0.50, r * 0.40);
    ell(c, x + sway, y - r * 0.95, r * 0.62, r * 0.48);
    c.fillStyle = '#a3aa96';
    ell(c, x - r * 0.18 + sway, y - r * 1.02, r * 0.38, r * 0.28);
    ell(c, x + r * 0.30 + sway, y - r * 0.82, r * 0.28, r * 0.22);
    /* fine silvery stipple - the tiny three-toothed leaves */
    var rnd = GG.mulberry32(Math.floor(seed * 4211));
    c.fillStyle = 'rgba(214,220,204,0.75)';
    for (var k = 0; k < 9; k++) {
      ell(c, x + (rnd() - 0.5) * r * 1.5 + sway, y - r * (0.55 + rnd() * 0.65), r * 0.055, r * 0.055);
    }
    /* late-summer flower spikes at the branch tips */
    c.strokeStyle = 'rgba(214,198,118,0.85)'; c.lineWidth = Math.max(1, r * 0.06);
    for (var j = -1; j <= 1; j += 2) {
      c.beginPath();
      c.moveTo(x + j * r * 0.34 + sway, y - r * 1.0);
      c.lineTo(x + j * r * 0.40 + sway, y - r * 1.28);
      c.stroke();
    }
  };

  P.rabbitbrush = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.1 + seed * 9) * 1.5;
    shadow(c, x + 1, y, r * 0.72);
    /* a bundle of pale grey-green stems all rising from one point */
    c.strokeStyle = '#9aa37f'; c.lineWidth = Math.max(1.2, r * 0.10); c.lineCap = 'round';
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + i * r * 0.18, y - r * 0.55, x + i * r * 0.30 + sway, y - r * 1.0);
      c.stroke();
    }
    /* domes of bright mustard-yellow flowers on top */
    c.fillStyle = '#e0b838';
    for (var j = -2; j <= 2; j++) {
      ell(c, x + j * r * 0.30 + sway, y - r * 1.04, r * 0.24, r * 0.17);
    }
    c.fillStyle = '#f2d264';
    ell(c, x - r * 0.24 + sway, y - r * 1.12, r * 0.16, r * 0.10);
    ell(c, x + r * 0.36 + sway, y - r * 1.10, r * 0.14, r * 0.09);
  };

  /* Bunchgrass really does grow in separate clumps with bare dirt between
     them. That gap is the whole look of the shrub-steppe. */
  P.bunchgrass = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.7 + seed * 13) * 2;
    c.strokeStyle = '#c0a15e'; c.lineWidth = Math.max(1, r * 0.11); c.lineCap = 'round';
    for (var i = -3; i <= 3; i++) {
      var lean = i * 0.16;
      c.beginPath();
      c.moveTo(x + i * r * 0.07, y);
      c.quadraticCurveTo(x + lean * r * 1.1 + sway * 0.4, y - r * 0.8,
                         x + lean * r * 2.0 + sway, y - r * 1.15);
      c.stroke();
    }
    /* a couple of slender arching seed-heads above the tussock */
    c.strokeStyle = '#8f7a44'; c.lineWidth = Math.max(0.8, r * 0.06);
    c.beginPath();
    c.moveTo(x, y); c.quadraticCurveTo(x + r * 0.2 + sway, y - r * 1.2, x + r * 0.7 + sway, y - r * 1.5);
    c.stroke();
  };

  P.pricklyPear = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.0);
    var rnd = GG.mulberry32(Math.floor(seed * 3301));
    /* three or four flattened blue-green pads, low and sprawling */
    var pads = [[-0.7, -0.22, 0.42, 0.34, -0.5], [0.05, -0.34, 0.46, 0.40, 0.12],
                [0.72, -0.20, 0.40, 0.32, 0.55], [0.28, -0.72, 0.34, 0.30, -0.2]];
    for (var i = 0; i < pads.length; i++) {
      var q = pads[i];
      c.fillStyle = i % 2 ? '#6e8358' : '#7d9163';
      ell(c, x + q[0] * r, y + q[1] * r, r * q[2], r * q[3], q[4]);
      /* long pale spines */
      c.strokeStyle = 'rgba(238,232,206,0.9)'; c.lineWidth = Math.max(0.6, r * 0.05);
      for (var k = 0; k < 5; k++) {
        var a = rnd() * Math.PI * 2;
        var px = x + q[0] * r + Math.cos(a) * r * q[2] * 0.6;
        var py = y + q[1] * r + Math.sin(a) * r * q[3] * 0.6;
        c.beginPath(); c.moveTo(px, py);
        c.lineTo(px + Math.cos(a) * r * 0.22, py + Math.sin(a) * r * 0.22);
        c.stroke();
      }
    }
    /* one yellow flower, sometimes flushed red */
    c.fillStyle = '#f2cf3c';
    ell(c, x + r * 0.28, y - r * 0.95, r * 0.18, r * 0.15);
    c.fillStyle = '#e88b3c';
    ell(c, x + r * 0.28, y - r * 0.95, r * 0.08, r * 0.07);
  };

  P.basalt = function (c, x, y, r, t, seed) {
    shadow(c, x + 2, y, r * 0.95);
    var rnd = GG.mulberry32(Math.floor(seed * 7717));
    /* stacked angular columns, flat-faced, tipped at slightly different angles */
    var n = 3 + ((seed * 13) | 0) % 2;
    for (var i = 0; i < n; i++) {
      var w = r * (0.30 + rnd() * 0.16);
      var h = r * (0.55 + rnd() * 0.75);
      var cx = x + (i - (n - 1) / 2) * r * 0.58 + (rnd() - 0.5) * r * 0.12;
      var tilt = (rnd() - 0.5) * 0.24;
      c.save(); c.translate(cx, y); c.rotate(tilt);
      c.fillStyle = '#45464a';
      c.fillRect(-w, -h, w * 2, h);
      c.fillStyle = '#54565b';                      // the lit face
      c.fillRect(-w, -h, w * 0.7, h);
      c.fillStyle = '#2e2f31';                      // the shaded one
      c.fillRect(w * 0.42, -h, w * 0.58, h);
      c.fillStyle = '#5d5f64';                      // the flat top
      c.beginPath();
      c.moveTo(-w, -h); c.lineTo(-w * 0.3, -h - r * 0.14);
      c.lineTo(w, -h + r * 0.02); c.lineTo(w * 0.2, -h + r * 0.1);
      c.closePath(); c.fill();
      c.restore();
      /* orange map lichen and pale grey crust on the rock faces */
      if (rnd() > 0.35) {
        c.fillStyle = 'rgba(200,128,42,0.72)';
        ell(c, cx + (rnd() - 0.5) * w, y - h * (0.3 + rnd() * 0.5), r * 0.10, r * 0.08);
      }
      if (rnd() > 0.5) {
        c.fillStyle = 'rgba(182,181,166,0.6)';
        ell(c, cx + (rnd() - 0.5) * w, y - h * (0.2 + rnd() * 0.6), r * 0.12, r * 0.07);
      }
    }
  };

  P.balsamroot = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.3 + seed * 8) * 1.4;
    /* a rosette of big grey-green arrow-shaped leaves lying low */
    c.fillStyle = '#8a9670';
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI + i * (Math.PI / 4);
      ell(c, x + Math.cos(a) * r * 0.42, y - r * 0.06 + Math.sin(a) * r * 0.14,
          r * 0.36, r * 0.15, a * 0.35);
    }
    /* tall stalks with big yellow sunflower heads */
    c.strokeStyle = '#7f8c66'; c.lineWidth = Math.max(1, r * 0.08);
    for (var j = -1; j <= 1; j += 2) {
      var hx = x + j * r * 0.24 + sway, hy = y - r * 1.05 - Math.abs(j) * r * 0.1;
      c.beginPath(); c.moveTo(x + j * r * 0.1, y - r * 0.1); c.lineTo(hx, hy); c.stroke();
      c.fillStyle = '#f0c22a';
      for (var k = 0; k < 8; k++) {
        var pa = k / 8 * Math.PI * 2;
        ell(c, hx + Math.cos(pa) * r * 0.20, hy + Math.sin(pa) * r * 0.17, r * 0.11, r * 0.07, pa);
      }
      c.fillStyle = '#b8862a';
      ell(c, hx, hy, r * 0.12, r * 0.10);
    }
  };

  /* Biological soil crust: a living skin of moss, lichen and cyanobacteria
     holding the dirt together between the shrubs. A footprint takes decades
     to heal, which is worth knowing before you walk on it. */
  P.soilCrust = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 9137));
    c.fillStyle = 'rgba(102,107,78,0.55)';
    c.beginPath();
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * Math.PI * 2;
      var rr = r * (0.7 + ((i * 7 + seed * 17) % 10) / 26);
      var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.5;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    /* the bumpy, slightly orange knobbles on top */
    for (var k = 0; k < 7; k++) {
      c.fillStyle = rnd() > 0.7 ? 'rgba(168,118,58,0.5)' : 'rgba(74,84,62,0.55)';
      ell(c, x + (rnd() - 0.5) * r * 1.4, y + (rnd() - 0.5) * r * 0.7, r * 0.13, r * 0.08);
    }
  };

  /* =====================================================================
     CLOUDTOP RIDGE - subalpine and alpine
     ===================================================================== */

  P.talus = function (c, x, y, r, t, seed) {
    shadow(c, x + 2, y, r * 0.95);
    var rnd = GG.mulberry32(Math.floor(seed * 5519));
    /* angular flat-faced blocks tipped at random, with dark gaps between */
    for (var i = 0; i < 3; i++) {
      var bw = r * (0.42 + rnd() * 0.30), bh = r * (0.32 + rnd() * 0.36);
      var bx = x + (rnd() - 0.5) * r * 1.1, by = y - rnd() * r * 0.36;
      var rot = (rnd() - 0.5) * 0.9;
      c.save(); c.translate(bx, by); c.rotate(rot);
      c.fillStyle = '#5f5c59';
      c.beginPath();
      c.moveTo(-bw, 0); c.lineTo(-bw * 0.8, -bh); c.lineTo(bw * 0.5, -bh * 1.1);
      c.lineTo(bw, -bh * 0.2); c.closePath(); c.fill();
      c.fillStyle = '#8d8a86';                       // the lit upper half
      c.beginPath();
      c.moveTo(-bw * 0.86, -bh * 0.52); c.lineTo(-bw * 0.8, -bh);
      c.lineTo(bw * 0.5, -bh * 1.1); c.lineTo(bw * 0.86, -bh * 0.4);
      c.closePath(); c.fill();
      c.fillStyle = '#a5a29a';                       // the flat top face
      c.beginPath();
      c.moveTo(-bw * 0.8, -bh); c.lineTo(-bw * 0.2, -bh * 1.16);
      c.lineTo(bw * 0.62, -bh * 1.02); c.lineTo(bw * 0.5, -bh * 1.1);
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(182,178,166,0.75)';        // pale lichen crust
      ell(c, -bw * 0.34, -bh * 0.82, bw * 0.34, bh * 0.16, -0.12);
      c.restore();
      if (rnd() > 0.55) {                            // yellow-green map lichen
        c.fillStyle = 'rgba(201,192,78,0.6)';
        ell(c, bx + (rnd() - 0.5) * bw, by - bh * (0.3 + rnd() * 0.5), r * 0.11, r * 0.07);
      }
    }
  };

  /* A steeple, not a Christmas tree: subalpine firs are far narrower than
     anything down in the woods, and they grow in little huddles. */
  P.subalpineFir = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.6 + seed * 5) * 1.2;
    shadow(c, x + 2, y, r * 0.30);
    c.fillStyle = '#5a4a3c';
    c.fillRect(x - r * 0.05, y - r * 0.30, r * 0.10, r * 0.30);
    for (var i = 0; i < 5; i++) {
      var w = r * (0.34 - i * 0.055), yy = y - r * (0.22 + i * 0.38), h = r * 0.60;
      c.fillStyle = ['#2c4432', '#314c38', '#2c4432', '#35543c', '#2c4432'][i];
      c.beginPath();
      c.moveTo(x + sway * (i + 1) * 0.28, yy - h);
      c.lineTo(x - w, yy); c.lineTo(x + w, yy);
      c.closePath(); c.fill();
    }
    /* the sharp point */
    c.fillStyle = '#35543c';
    c.beginPath();
    c.moveTo(x + sway * 1.8, y - r * 2.34);
    c.lineTo(x - r * 0.08, y - r * 2.0); c.lineTo(x + r * 0.08, y - r * 2.0);
    c.closePath(); c.fill();
  };

  /* Treeline. The same fir, beaten flat by the wind, all its branches
     streaming away downwind and hiding behind a rock. */
  P.krummholz = function (c, x, y, r, t, seed) {
    shadow(c, x + 2, y, r * 0.9);
    var lean = ((seed * 7) % 1 > 0.5) ? 1 : -1;
    /* the rock it is sheltering behind */
    c.fillStyle = '#7f7c76';
    ell(c, x - lean * r * 0.72, y - r * 0.24, r * 0.40, r * 0.30);
    c.fillStyle = '#95928b';
    ell(c, x - lean * r * 0.78, y - r * 0.32, r * 0.26, r * 0.16, -0.2);
    /* the trunk, bent right over and creeping along the ground */
    c.strokeStyle = '#4c3f33'; c.lineWidth = Math.max(1.6, r * 0.14); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - lean * r * 0.5, y);
    c.quadraticCurveTo(x - lean * r * 0.1, y - r * 0.34, x + lean * r * 0.78, y - r * 0.24);
    c.stroke();
    /* every branch combed the same way by the wind */
    var k, yy;
    c.strokeStyle = '#2c4432'; c.lineCap = 'round';
    for (k = 0; k < 6; k++) {
      yy = y - r * (0.06 + k * 0.11);
      c.lineWidth = Math.max(1.2, r * (0.13 - k * 0.012));
      c.beginPath();
      c.moveTo(x - lean * r * (0.34 - k * 0.06), yy);
      c.lineTo(x + lean * r * (0.85 + k * 0.07), yy - r * 0.04);
      c.stroke();
    }
    /* needle mass, thickest at the downwind end */
    c.fillStyle = '#2c4432';
    ell(c, x + lean * r * 0.44, y - r * 0.28, r * 0.62, r * 0.24, lean * 0.10);
    c.fillStyle = '#35543c';
    ell(c, x + lean * r * 0.62, y - r * 0.40, r * 0.44, r * 0.17, lean * 0.12);
    c.fillStyle = '#3f6247';
    ell(c, x + lean * r * 0.30, y - r * 0.46, r * 0.30, r * 0.12, lean * 0.14);
    /* bare wind-killed tips poking out the far end */
    c.strokeStyle = '#8b8378'; c.lineWidth = Math.max(0.8, r * 0.05);
    for (k = 0; k < 3; k++) {
      yy = y - r * (0.16 + k * 0.14);
      c.beginPath();
      c.moveTo(x + lean * r * 0.9, yy);
      c.lineTo(x + lean * r * (1.2 + k * 0.06), yy - r * 0.03);
      c.stroke();
    }
  };

  P.heather = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.5 + seed * 11) * 0.9;
    /* a dense low mat of tiny needle leaves */
    c.fillStyle = '#3d5a40';
    ell(c, x, y - r * 0.22, r * 0.82, r * 0.34);
    ell(c, x - r * 0.4, y - r * 0.14, r * 0.42, r * 0.22);
    ell(c, x + r * 0.42, y - r * 0.16, r * 0.40, r * 0.21);
    c.fillStyle = '#4c6c4e';
    ell(c, x - r * 0.1, y - r * 0.38, r * 0.48, r * 0.2);
    /* small bell-shaped pink flowers, nodding downward */
    var rnd = GG.mulberry32(Math.floor(seed * 2207));
    c.fillStyle = '#d1739a';
    for (var i = 0; i < 7; i++) {
      var bx = x + (rnd() - 0.5) * r * 1.5 + sway, by = y - r * (0.34 + rnd() * 0.36);
      c.beginPath();
      c.ellipse(bx, by, r * 0.09, r * 0.12, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e295b4';
      ell(c, bx, by - r * 0.05, r * 0.05, r * 0.04);
      c.fillStyle = '#d1739a';
    }
  };

  P.lupine = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.4 + seed * 9) * 1.6;
    /* a ring of leaves shaped like a hand with seven fingers */
    c.strokeStyle = '#7e9478'; c.lineWidth = Math.max(1, r * 0.07); c.lineCap = 'round';
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI + i * (Math.PI / 6);
      c.beginPath();
      c.moveTo(x, y - r * 0.12);
      c.lineTo(x + Math.cos(a) * r * 0.40, y - r * 0.12 + Math.sin(a) * r * 0.20);
      c.stroke();
    }
    /* the spike of blue-violet pea flowers */
    c.strokeStyle = '#7e9478'; c.lineWidth = Math.max(1, r * 0.08);
    c.beginPath(); c.moveTo(x, y - r * 0.1); c.lineTo(x + sway * 0.5, y - r * 0.8); c.stroke();
    for (var k = 0; k < 6; k++) {
      var fy = y - r * (0.78 + k * 0.16);
      var fx = x + sway * (0.5 + k * 0.12);
      c.fillStyle = k % 2 ? '#6e6ed2' : '#8080dd';
      ell(c, fx - r * 0.13, fy, r * 0.12, r * 0.08);
      ell(c, fx + r * 0.13, fy, r * 0.12, r * 0.08);
    }
  };

  /* The mop-head: what a pasqueflower turns into after it has flowered.
     Children call it the mouse-on-a-stick. */
  P.pasque = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.2 + seed * 6) * 2;
    c.strokeStyle = '#8a9470'; c.lineWidth = Math.max(1, r * 0.09); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + sway * 0.4, y - r * 0.7, x + sway, y - r * 1.2);
    c.stroke();
    var hx = x + sway, hy = y - r * 1.28;
    c.strokeStyle = 'rgba(238,231,217,0.9)'; c.lineWidth = Math.max(0.7, r * 0.05);
    for (var i = 0; i < 13; i++) {
      var a = i / 13 * Math.PI * 2;
      c.beginPath(); c.moveTo(hx, hy);
      c.lineTo(hx + Math.cos(a) * r * 0.36, hy + Math.sin(a) * r * 0.32);
      c.stroke();
    }
    c.fillStyle = '#eee7d9';
    ell(c, hx, hy, r * 0.15, r * 0.14);
  };

  /* A snowfield that has not melted yet, with the pink tinge of watermelon
     snow - an alga, and the ice worms' dinner. */
  P.snowPatch = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 6151));
    c.fillStyle = '#eef3f8';
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2;
      var rr = r * (0.72 + ((i * 11 + seed * 23) % 10) / 22);
      var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.46;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(191,210,228,0.8)';
    ell(c, x - r * 0.24, y + r * 0.12, r * 0.44, r * 0.16, 0.2);
    c.fillStyle = 'rgba(242,198,203,0.55)';
    for (var k = 0; k < 3; k++) {
      ell(c, x + (rnd() - 0.5) * r * 1.2, y + (rnd() - 0.5) * r * 0.5, r * 0.20, r * 0.08);
    }
  };

  /* =====================================================================
     THE SPRUCE TAIGA - boreal forest, moss, bog and old burns
     ===================================================================== */

  P.blackSpruce = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.55 + seed * 5) * 1.3;
    var lean = ((seed * 31) % 1 - 0.5) * 0.10;        // boreal spruces are never tidy
    shadow(c, x + 2, y, r * 0.26);
    c.save(); c.translate(x, y); c.rotate(lean);
    c.fillStyle = '#4a3a2c';
    c.fillRect(-r * 0.045, -r * 0.44, r * 0.09, r * 0.44);   // spindly bare lower trunk
    for (var i = 0; i < 4; i++) {
      var w = r * (0.26 - i * 0.045), yy = -r * (0.36 + i * 0.36), h = r * 0.56;
      c.fillStyle = i % 2 ? '#26472f' : '#22402f';
      c.beginPath();
      c.moveTo(sway * (i + 1) * 0.22, yy - h);
      c.lineTo(-w, yy); c.lineTo(w, yy);
      c.closePath(); c.fill();
    }
    /* the club of denser branches at the very top - the crow's nest.
       It is what tells a black spruce apart from every other spruce. */
    c.fillStyle = '#22402f';
    c.beginPath();
    c.moveTo(sway * 1.3, -r * 2.10);
    c.lineTo(sway * 1.3 - r * 0.15, -r * 1.68);
    c.lineTo(sway * 1.3 + r * 0.15, -r * 1.68);
    c.closePath(); c.fill();
    c.fillStyle = '#1d3827';
    ell(c, sway * 1.3, -r * 1.80, r * 0.17, r * 0.14);
    c.fillStyle = '#2b4d34';
    ell(c, sway * 1.3 - r * 0.05, -r * 1.86, r * 0.09, r * 0.07);
    c.restore();
  };

  /* A fire-killed standing trunk. Fire is normal here - black spruce cones
     are held shut with resin and it takes the heat of a fire to open them. */
  P.snag = function (c, x, y, r, t, seed) {
    shadow(c, x + 2, y, r * 0.24);
    var h = r * 1.8;
    var g = c.createLinearGradient(x, y, x, y - h);
    g.addColorStop(0, '#2b2622'); g.addColorStop(0.55, '#6b6058'); g.addColorStop(1, '#9a9186');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(x - r * 0.11, y); c.lineTo(x - r * 0.06, y - h);
    c.lineTo(x + r * 0.06, y - h); c.lineTo(x + r * 0.11, y);
    c.closePath(); c.fill();
    /* two broken branch stubs */
    c.strokeStyle = '#7a6f64'; c.lineWidth = Math.max(1, r * 0.06); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - h * 0.62); c.lineTo(x - r * 0.28, y - h * 0.70); c.stroke();
    c.beginPath(); c.moveTo(x, y - h * 0.44); c.lineTo(x + r * 0.24, y - h * 0.38); c.stroke();
  };

  P.deadfall = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.15);
    var rnd = GG.mulberry32(Math.floor(seed * 4409));
    c.fillStyle = '#9a9186';                       // bare silver-grey wood
    GG.roundRect(c, x - r, y - r * 0.56, r * 2, r * 0.62, r * 0.12); c.fill();
    c.fillStyle = '#6b5540';                       // the bark still clinging on
    GG.roundRect(c, x - r * 0.94, y - r * 0.56, r * 0.66, r * 0.60, r * 0.08); c.fill();
    GG.roundRect(c, x + r * 0.30, y - r * 0.50, r * 0.46, r * 0.50, r * 0.08); c.fill();
    c.fillStyle = '#aaa094';                       // the sawn-off end, facing you
    ell(c, x + r * 0.99, y - r * 0.25, r * 0.15, r * 0.31);
    c.strokeStyle = '#7f766a'; c.lineWidth = Math.max(0.6, r * 0.04);
    c.beginPath(); c.ellipse(x + r * 0.99, y - r * 0.25, r * 0.08, r * 0.17, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.14)';
    GG.roundRect(c, x - r * 0.8, y - r * 0.52, r * 1.5, r * 0.10, r * 0.05); c.fill();
    /* the round exit holes the sawyers and horntails chewed on the way out */
    c.fillStyle = '#3a332a';
    for (var i = 0; i < 3; i++) {
      ell(c, x + (rnd() - 0.5) * r * 1.4, y - r * (0.16 + rnd() * 0.3), r * 0.07, r * 0.06);
    }
  };

  P.labradorTea = function (c, x, y, r, t, seed) {
    shadow(c, x + 1, y, r * 0.72);
    /* narrow leathery leaves that curl under, rusty-woolly beneath */
    c.fillStyle = '#8a6034';
    ell(c, x - r * 0.3, y - r * 0.30, r * 0.46, r * 0.17, -0.5);
    ell(c, x + r * 0.34, y - r * 0.26, r * 0.44, r * 0.16, 0.5);
    c.fillStyle = '#2f5234';
    ell(c, x - r * 0.32, y - r * 0.36, r * 0.44, r * 0.15, -0.5);
    ell(c, x + r * 0.32, y - r * 0.32, r * 0.42, r * 0.14, 0.5);
    ell(c, x, y - r * 0.52, r * 0.40, r * 0.15, 0.06);
    c.fillStyle = '#3d6740';
    ell(c, x - r * 0.1, y - r * 0.66, r * 0.34, r * 0.13, -0.2);
    /* tight round clusters of small white flowers */
    c.fillStyle = '#f4f1e6';
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2;
      ell(c, x + Math.cos(a) * r * 0.16, y - r * 0.82 + Math.sin(a) * r * 0.11, r * 0.09, r * 0.07);
    }
    c.fillStyle = '#fffdf6';
    ell(c, x, y - r * 0.82, r * 0.11, r * 0.08);
  };

  P.fireweed = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.3 + seed * 8) * 2.2;
    c.strokeStyle = '#6b8c48'; c.lineWidth = Math.max(1, r * 0.07); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + sway * 0.4, y - r * 0.9, x + sway, y - r * 1.7);
    c.stroke();
    /* narrow willow-like leaves up the stem */
    for (var i = 0; i < 4; i++) {
      var ly = y - r * (0.25 + i * 0.3), lx = x + sway * (i * 0.16);
      var s = i % 2 ? 1 : -1;
      c.strokeStyle = '#5f8340'; c.lineWidth = Math.max(0.9, r * 0.05);
      c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + s * r * 0.34, ly - r * 0.1); c.stroke();
    }
    /* magenta four-petalled flowers, open at the bottom, still buds on top */
    for (var k = 0; k < 6; k++) {
      var fy = y - r * (1.06 + k * 0.13);
      var fx = x + sway * (0.62 + k * 0.06);
      if (k < 4) {
        c.fillStyle = k % 2 ? '#d2469a' : '#c7407c';
        ell(c, fx - r * 0.13, fy, r * 0.11, r * 0.08, -0.4);
        ell(c, fx + r * 0.13, fy, r * 0.11, r * 0.08, 0.4);
      } else {
        c.fillStyle = '#a63a6c';
        ell(c, fx, fy, r * 0.07, r * 0.10);
      }
    }
  };

  P.mossHummock = function (c, x, y, r, t, seed) {
    var i, a;
    c.fillStyle = 'rgba(30,50,25,0.18)';
    ell(c, x + 1, y, r * 0.92, r * 0.28);
    /* a rounded dome, not a flat pad - the taiga floor is lumpy */
    c.fillStyle = '#2f4a2b';
    c.beginPath(); c.arc(x, y - r * 0.26, r * 0.82, Math.PI, 0); c.fill();
    c.fillRect(x - r * 0.82, y - r * 0.28, r * 1.64, r * 0.26);
    c.fillStyle = '#4a6b3e';
    c.beginPath(); c.arc(x - r * 0.04, y - r * 0.30, r * 0.70, Math.PI, 0); c.fill();
    c.fillStyle = '#5f8348';
    c.beginPath(); c.arc(x - r * 0.16, y - r * 0.36, r * 0.46, Math.PI * 1.05, -0.2); c.fill();
    c.fillStyle = '#7d9150';
    ell(c, x - r * 0.26, y - r * 0.70, r * 0.24, r * 0.10);
    /* a furry edge, so the dome does not end in a clean drawn line */
    c.fillStyle = '#3d5c33';
    for (i = -5; i <= 5; i++) {
      a = Math.PI + (i + 5) / 10 * Math.PI;
      ell(c, x + Math.cos(a) * r * 0.80, y - r * 0.26 + Math.sin(a) * r * 0.80,
          r * 0.13, r * 0.10);
    }
  };

  /* =====================================================================
     THE LICHEN TUNDRA - past the last tree
     ===================================================================== */

  P.erratic = function (c, x, y, r, t, seed) {
    shadow(c, x + 2, y, r * 0.9);
    /* a big rounded boulder the ice left behind, sunk into the ground */
    c.fillStyle = '#6a6258';
    c.beginPath();
    c.moveTo(x - r * 0.92, y);
    c.bezierCurveTo(x - r * 1.02, y - r * 0.62, x - r * 0.52, y - r * 1.06, x + r * 0.06, y - r * 1.02);
    c.bezierCurveTo(x + r * 0.66, y - r * 0.98, x + r * 0.98, y - r * 0.52, x + r * 0.90, y);
    c.closePath(); c.fill();
    c.fillStyle = '#8d8377';
    c.beginPath();
    c.moveTo(x - r * 0.72, y - r * 0.22);
    c.bezierCurveTo(x - r * 0.80, y - r * 0.66, x - r * 0.40, y - r * 0.96, x + r * 0.04, y - r * 0.92);
    c.bezierCurveTo(x + r * 0.40, y - r * 0.88, x + r * 0.52, y - r * 0.50, x + r * 0.34, y - r * 0.26);
    c.closePath(); c.fill();
    c.fillStyle = '#aca294';
    ell(c, x - r * 0.24, y - r * 0.70, r * 0.36, r * 0.18, -0.30);
    /* orange-yellow map lichen, the slowest-growing thing on the tundra */
    var rnd = GG.mulberry32(Math.floor(seed * 8821));
    for (var i = 0; i < 5; i++) {
      c.fillStyle = rnd() > 0.5 ? 'rgba(216,195,63,0.72)' : 'rgba(199,206,192,0.62)';
      ell(c, x + (rnd() - 0.5) * r * 1.2, y - r * (0.2 + rnd() * 0.7), r * 0.13, r * 0.09,
          (rnd() - 0.5) * 2);
    }
  };

  /* A willow tree you step over. It lies flat because standing up here
     would kill it, and it is the woolly bear caterpillar's whole larder. */
  P.arcticWillow = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 3607));
    c.strokeStyle = '#6b5a45'; c.lineWidth = Math.max(1, r * 0.09); c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + i * r * 0.5, y - r * 0.12, x + i * r * 1.05, y - r * 0.04);
      c.stroke();
    }
    c.fillStyle = '#7e9660';
    for (var k = 0; k < 9; k++) {
      ell(c, x + (rnd() - 0.5) * r * 2.0, y - r * (0.02 + rnd() * 0.24), r * 0.13, r * 0.10);
    }
    /* fat fuzzy catkins standing up out of the mat */
    c.fillStyle = '#c9b98f';
    for (var j = -1; j <= 1; j += 2) {
      ell(c, x + j * r * 0.44, y - r * 0.40, r * 0.09, r * 0.20);
    }
  };

  P.mossCampion = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 1913));
    c.fillStyle = '#4c6740';
    ell(c, x, y - r * 0.16, r * 0.78, r * 0.44);
    c.fillStyle = '#5d7a4e';
    ell(c, x, y - r * 0.26, r * 0.70, r * 0.40);
    c.fillStyle = '#6d8a5b';
    ell(c, x - r * 0.18, y - r * 0.36, r * 0.36, r * 0.20);
    /* studded all over with tiny pink dots of flower */
    c.fillStyle = '#d9578e';
    for (var i = 0; i < 12; i++) {
      var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
      ell(c, x + Math.cos(a) * r * 0.62 * rr, y - r * 0.26 + Math.sin(a) * r * 0.34 * rr,
          r * 0.055, r * 0.048);
    }
  };

  P.dryas = function (c, x, y, r, t, seed) {
    var seedhead = ((seed * 17) % 1) > 0.5;
    /* a low mat of small dark crinkled leaves */
    c.fillStyle = '#4a5c3c';
    ell(c, x, y - r * 0.1, r * 0.72, r * 0.30);
    c.fillStyle = '#5a6f47';
    ell(c, x - r * 0.2, y - r * 0.18, r * 0.40, r * 0.18);
    ell(c, x + r * 0.28, y - r * 0.14, r * 0.32, r * 0.15);
    c.strokeStyle = '#6f7a58'; c.lineWidth = Math.max(0.8, r * 0.08); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - r * 0.2); c.lineTo(x + r * 0.04, y - r * 0.64); c.stroke();
    if (seedhead) {
      /* later in the year the same flower becomes a twisted silver plume */
      c.strokeStyle = 'rgba(226,222,208,0.9)'; c.lineWidth = Math.max(0.6, r * 0.05);
      for (var k = 0; k < 9; k++) {
        var a2 = -Math.PI / 2 + (k - 4) * 0.30;
        c.beginPath();
        c.moveTo(x + r * 0.04, y - r * 0.64);
        c.quadraticCurveTo(x + r * 0.04 + Math.cos(a2) * r * 0.2, y - r * 0.82,
                           x + r * 0.04 + Math.cos(a2) * r * 0.34, y - r * 0.92);
        c.stroke();
      }
    } else {
      /* eight white petals round a yellow eye */
      c.fillStyle = '#ffffff';
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * Math.PI * 2;
        ell(c, x + r * 0.04 + Math.cos(a) * r * 0.16, y - r * 0.68 + Math.sin(a) * r * 0.14,
            r * 0.11, r * 0.09, a);
      }
      c.fillStyle = '#e8c34a';
      ell(c, x + r * 0.04, y - r * 0.68, r * 0.08, r * 0.07);
    }
  };

  /* Nothing says tundra faster. The fluffy head keeps the flower inside a
     few degrees warmer, which is the only reason it can flower at all. */
  P.cottonGrass = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.8 + seed * 12) * 2.4;
    for (var i = -1; i <= 1; i++) {
      var hx = x + i * r * 0.26 + sway * (0.6 + i * 0.1);
      var hy = y - r * (1.05 + Math.abs(i) * -0.12);
      c.strokeStyle = '#8e9a5e'; c.lineWidth = Math.max(0.9, r * 0.06); c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x + i * r * 0.1, y);
      c.quadraticCurveTo(x + i * r * 0.2 + sway * 0.4, y - r * 0.6, hx, hy);
      c.stroke();
      c.fillStyle = '#f6f4ee';
      ell(c, hx, hy - r * 0.12, r * 0.19, r * 0.17);
      c.fillStyle = 'rgba(255,255,255,0.75)';
      ell(c, hx - r * 0.06, hy - r * 0.17, r * 0.10, r * 0.08);
    }
  };

  P.reindeerLichen = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 7237));
    c.strokeStyle = '#c7cec0'; c.lineCap = 'round';
    for (var i = 0; i < 6; i++) {
      var bx = x + (rnd() - 0.5) * r * 1.3, by = y - rnd() * r * 0.12;
      var h = r * (0.28 + rnd() * 0.30);
      c.lineWidth = Math.max(0.8, r * 0.09);
      c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by - h); c.stroke();
      c.lineWidth = Math.max(0.6, r * 0.06);
      c.beginPath(); c.moveTo(bx, by - h * 0.55); c.lineTo(bx - r * 0.13, by - h * 0.95); c.stroke();
      c.beginPath(); c.moveTo(bx, by - h * 0.62); c.lineTo(bx + r * 0.12, by - h * 1.0); c.stroke();
    }
    c.fillStyle = 'rgba(220,216,197,0.6)';
    ell(c, x, y - r * 0.06, r * 0.66, r * 0.16);
  };

  /* =====================================================================
     THE MOSSY RAINFOREST - temperate, not tropical: few species,
     enormous individuals, deep shade, and everything furred with moss.
     ===================================================================== */

  P.mossyTrunk = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.4 + seed * 4) * 1.1;
    var rnd = GG.mulberry32(Math.floor(seed * 8081));
    var j, k;
    shadow(c, x + 3, y, r * 0.66);
    /* flared, stilt-like roots - a tree that germinated on a nurse log and
       was left standing on its own legs when the log rotted away */
    c.fillStyle = '#4c4238';
    for (j = -1; j <= 1; j += 2) {
      c.beginPath();
      c.moveTo(x + j * r * 0.34, y - r * 0.52);
      c.quadraticCurveTo(x + j * r * 0.62, y - r * 0.18, x + j * r * 0.74, y);
      c.lineTo(x + j * r * 0.18, y);
      c.closePath(); c.fill();
    }
    /* a trunk so wide it leaves the top of the frame */
    c.fillStyle = '#5a4e42';
    c.beginPath();
    c.moveTo(x - r * 0.42, y); c.lineTo(x - r * 0.34, y - r * 2.4);
    c.lineTo(x + r * 0.34, y - r * 2.4); c.lineTo(x + r * 0.42, y);
    c.closePath(); c.fill();
    c.fillStyle = '#6b5c4d';
    c.fillRect(x - r * 0.10, y - r * 2.4, r * 0.16, r * 2.4);
    /* the moss climbs it in mottled sheets, not in one clean stripe */
    for (k = 0; k < 14; k++) {
      c.fillStyle = ['rgba(85,127,61,0.95)', 'rgba(111,162,75,0.85)',
                     'rgba(63,102,48,0.9)'][k % 3];
      ell(c, x + (rnd() - 0.5) * r * 0.74, y - r * (0.1 + rnd() * 2.2),
          r * (0.10 + rnd() * 0.16), r * (0.12 + rnd() * 0.26));
    }
    c.fillStyle = 'rgba(154,169,140,0.55)';        // pale lichen down one side
    ell(c, x + r * 0.28, y - r * 1.5, r * 0.09, r * 0.44);
    /* hanging curtains of moss and pale lichen off the lower limbs */
    c.strokeStyle = 'rgba(154,169,140,0.85)'; c.lineCap = 'round';
    for (var i = 0; i < 5; i++) {
      var hx = x + (i - 2) * r * 0.22 + sway * 0.4;
      var top = y - r * (1.5 + (i % 3) * 0.24);
      c.lineWidth = Math.max(1, r * 0.055);
      c.beginPath();
      c.moveTo(hx, top);
      c.quadraticCurveTo(hx + sway, top + r * 0.26, hx + sway * 1.6, top + r * 0.52);
      c.stroke();
    }
    c.fillStyle = 'rgba(111,162,75,0.9)';       // licorice fern out of the moss mat
    ell(c, x - r * 0.34, y - r * 1.72, r * 0.22, r * 0.08, -0.5);
    ell(c, x + r * 0.34, y - r * 1.52, r * 0.20, r * 0.07, 0.5);
  };

  /* A nurse log is one of the most alive things in the forest: the
     seedlings germinate along the top of it, and when the log finally rots
     away they are left standing in a row on stilt roots. */
  P.nurseLog = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.2);
    c.fillStyle = '#6b4a32';
    GG.roundRect(c, x - r, y - r * 0.60, r * 2, r * 0.66, r * 0.28); c.fill();
    c.fillStyle = '#5c8a3e';                    // moss over the whole top
    GG.roundRect(c, x - r * 0.98, y - r * 0.66, r * 1.96, r * 0.40, r * 0.2); c.fill();
    c.fillStyle = '#6fa24b';
    ell(c, x - r * 0.3, y - r * 0.58, r * 0.5, r * 0.12);
    c.fillStyle = '#8a5f3e';                    // punky red-brown rotted end
    ell(c, x + r * 0.98, y - r * 0.28, r * 0.15, r * 0.28);
    /* the straight row of little hemlock seedlings along the top */
    var rnd = GG.mulberry32(Math.floor(seed * 5171));
    for (var i = 0; i < 5; i++) {
      var sx = x - r * 0.8 + i * r * 0.4 + (rnd() - 0.5) * r * 0.1;
      var sh = r * (0.34 + rnd() * 0.26);
      c.fillStyle = '#3b2b1e';
      c.fillRect(sx - r * 0.02, y - r * 0.66 - sh * 0.3, r * 0.04, sh * 0.3);
      c.fillStyle = '#2e5b33';
      c.beginPath();
      c.moveTo(sx, y - r * 0.66 - sh);
      c.lineTo(sx - r * 0.13, y - r * 0.66 - sh * 0.26);
      c.lineTo(sx + r * 0.13, y - r * 0.66 - sh * 0.26);
      c.closePath(); c.fill();
    }
  };

  P.swordFern = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.0 + seed * 7) * 1.6;
    /* a shuttlecock of long stiff single-bladed fronds from one crown */
    for (var i = -3; i <= 3; i++) {
      var a = i * 0.30;
      var tipx = x + Math.sin(a) * r * 1.15 + sway * (0.3 + Math.abs(i) * 0.12);
      var tipy = y - r * 1.15 * Math.cos(a) * 0.92;
      c.strokeStyle = (i % 2) ? '#33632f' : '#4e7a3e';
      c.lineWidth = Math.max(1.2, r * 0.10); c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.sin(a) * r * 0.5, y - r * 0.66, tipx, tipy);
      c.stroke();
      /* the leaflets, as little ticks either side of the blade */
      c.lineWidth = Math.max(0.6, r * 0.045);
      for (var k = 1; k <= 3; k++) {
        var u = k / 4;
        var mx = x + (tipx - x) * u + Math.sin(a) * r * 0.1;
        var my = y + (tipy - y) * u;
        c.beginPath(); c.moveTo(mx, my);
        c.lineTo(mx + Math.cos(a) * r * 0.14, my + Math.sin(a) * r * 0.1 - r * 0.04);
        c.stroke();
      }
    }
  };

  P.vineMaple = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.8 + seed * 6) * 2;
    var autumn = ((seed * 23) % 1) > 0.88;
    shadow(c, x + 2, y, r * 0.8);
    /* multi-stemmed, sprawling, almost horizontal */
    c.strokeStyle = '#6a5a46'; c.lineWidth = Math.max(1.4, r * 0.09); c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + i * r * 0.6, y - r * 0.7, x + i * r * 1.1 + sway * 0.4, y - r * 0.85);
      c.stroke();
    }
    var leaf = autumn ? '#d6622a' : '#7ca83f';
    var leaf2 = autumn ? '#e8813c' : '#94bd52';
    c.fillStyle = leaf;
    ell(c, x - r * 0.9 + sway * 0.4, y - r * 0.92, r * 0.42, r * 0.3);
    ell(c, x + r * 0.9 + sway * 0.4, y - r * 0.92, r * 0.42, r * 0.3);
    ell(c, x + sway * 0.4, y - r * 1.1, r * 0.5, r * 0.34);
    c.fillStyle = leaf2;
    ell(c, x - r * 0.4 + sway * 0.4, y - r * 1.18, r * 0.32, r * 0.22);
    ell(c, x + r * 0.5 + sway * 0.4, y - r * 1.06, r * 0.28, r * 0.2);
  };

  /* Huge leaves on a cane covered in spines. Beautiful, and absolutely not
     a thing to grab on the way past. */
  P.devilsClub = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.9 + seed * 8) * 1.4;
    shadow(c, x + 1, y, r * 0.6);
    c.strokeStyle = '#8a8a5f'; c.lineWidth = Math.max(1.6, r * 0.13); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + sway * 0.4, y - r * 1.0); c.stroke();
    /* the spines all up the cane */
    c.strokeStyle = 'rgba(232,226,196,0.9)'; c.lineWidth = Math.max(0.6, r * 0.04);
    for (var i = 0; i < 6; i++) {
      var sy2 = y - r * (0.1 + i * 0.15), s = i % 2 ? 1 : -1;
      c.beginPath(); c.moveTo(x + sway * 0.1 * i, sy2);
      c.lineTo(x + sway * 0.1 * i + s * r * 0.13, sy2 - r * 0.05); c.stroke();
    }
    /* one enormous maple-shaped leaf */
    c.fillStyle = '#41762f';
    c.beginPath();
    for (var k = 0; k < 7; k++) {
      var a = -Math.PI + k * (Math.PI / 6);
      var rr = (k % 2) ? r * 0.78 : r * 0.58;
      var px = x + sway * 0.4 + Math.cos(a) * rr, py = y - r * 1.05 + Math.sin(a) * rr * 0.6;
      if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(104,152,66,0.8)';
    ell(c, x + sway * 0.4 - r * 0.2, y - r * 1.2, r * 0.3, r * 0.14, -0.2);
  };

  P.woodSorrel = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 2609));
    for (var i = 0; i < 5; i++) {
      var lx = x + (rnd() - 0.5) * r * 1.5, ly = y - rnd() * r * 0.3;
      c.fillStyle = i % 2 ? '#4c8a46' : '#599a51';
      for (var k = 0; k < 3; k++) {
        var a = -Math.PI / 2 + k * (Math.PI * 2 / 3);
        ell(c, lx + Math.cos(a) * r * 0.14, ly + Math.sin(a) * r * 0.11, r * 0.13, r * 0.11);
      }
      if (rnd() > 0.6) {
        c.fillStyle = '#fdf6fa';
        ell(c, lx + r * 0.1, ly - r * 0.3, r * 0.10, r * 0.09);
        c.fillStyle = '#e6a8c6';
        ell(c, lx + r * 0.1, ly - r * 0.3, r * 0.04, r * 0.04);
      }
    }
  };

  /* =====================================================================
     THE GOLDEN GLADE - the bright hole in a dark ceiling
     ===================================================================== */

  P.fallenLog = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.2);
    var rnd = GG.mulberry32(Math.floor(seed * 6421));
    c.save();
    c.translate(x, y); c.rotate(((seed * 29) % 1 - 0.5) * 0.4);
    c.fillStyle = '#9a9186';                     // silvered weathered wood on top
    GG.roundRect(c, -r, -r * 0.58, r * 2, r * 0.64, r * 0.28); c.fill();
    c.fillStyle = '#7c7367';                     // bark still on in patches
    GG.roundRect(c, -r * 0.86, -r * 0.56, r * 0.6, r * 0.58, r * 0.18); c.fill();
    c.fillStyle = '#4e7a3e';                     // moss on the shaded north side
    GG.roundRect(c, -r * 0.95, -r * 0.14, r * 1.9, r * 0.2, r * 0.1); c.fill();
    c.fillStyle = '#2b2620';                     // the dark hollow at one end
    ell(c, r * 0.97, -r * 0.26, r * 0.14, r * 0.24);
    /* the round exit holes - a quarter to half an inch, which is the size a
       horntail really chews on its way out */
    c.fillStyle = '#4a4238';
    for (var i = 0; i < 4; i++) {
      ell(c, (rnd() - 0.5) * r * 1.5, -r * (0.2 + rnd() * 0.3), r * 0.06, r * 0.05);
    }
    c.restore();
  };

  P.sunStump = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 0.95);
    c.fillStyle = '#7a6b55';
    GG.roundRect(c, x - r * 0.72, y - r * 0.9, r * 1.44, r * 0.95, r * 0.18); c.fill();
    c.fillStyle = '#9c8a6e';
    ell(c, x, y - r * 0.9, r * 0.72, r * 0.3);
    c.strokeStyle = '#7a6b55'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(x, y - r * 0.9, r * 0.42, r * 0.17, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#4e7a3e';                     // moss and a seedling on top
    ell(c, x - r * 0.3, y - r * 0.96, r * 0.3, r * 0.13);
    c.fillStyle = '#2e5b33';
    c.beginPath();
    c.moveTo(x + r * 0.2, y - r * 1.5);
    c.lineTo(x + r * 0.06, y - r * 0.96); c.lineTo(x + r * 0.34, y - r * 0.96);
    c.closePath(); c.fill();
  };

  P.pearly = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.4 + seed * 10) * 1.2;
    /* grey-woolly narrow leaves */
    c.strokeStyle = '#93a08b'; c.lineWidth = Math.max(1, r * 0.09); c.lineCap = 'round';
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + i * r * 0.22 + sway * 0.3, y - r * 0.66);
      c.stroke();
    }
    /* flat-topped clusters of small round papery white flowers */
    var rnd = GG.mulberry32(Math.floor(seed * 1493));
    for (var k = 0; k < 7; k++) {
      var bx = x + (rnd() - 0.5) * r * 1.2 + sway, by = y - r * (0.7 + rnd() * 0.3);
      c.fillStyle = '#f2f0e6';
      ell(c, bx, by, r * 0.11, r * 0.10);
      c.fillStyle = '#e5c33a';
      ell(c, bx, by, r * 0.045, r * 0.04);
    }
  };

  /* One big triangular frond per stalk, held out flat like a little table.
     A stand of them makes the floor of the clearing read. */
  P.bracken = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.1 + seed * 9) * 1.5;
    var autumn = ((seed * 19) % 1) > 0.86;
    var i, u, bx, by, half;
    c.strokeStyle = '#6b7f3e'; c.lineWidth = Math.max(1.2, r * 0.10); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + sway * 0.4, y - r * 0.72); c.stroke();
    var fx = x + sway * 0.4, fy = y - r * 0.76;
    /* one big triangular frond held out almost flat, like a little table */
    var mid = autumn ? '#8f6430' : '#4f7f31';
    c.strokeStyle = mid; c.lineWidth = Math.max(1, r * 0.07);
    c.beginPath(); c.moveTo(fx, fy + r * 0.10); c.lineTo(fx, fy - r * 0.34); c.stroke();
    /* pairs of leaflets, longest at the bottom, so it reads as a triangle */
    c.strokeStyle = autumn ? '#9c6b32' : '#5f8f3a';
    for (i = 0; i < 6; i++) {
      u = i / 5;
      by = fy + r * 0.10 - u * r * 0.44;
      half = r * (1.05 - u * 0.88);
      c.lineWidth = Math.max(1.4, r * 0.13 * (1 - u * 0.4));
      c.beginPath();
      c.moveTo(fx - half, by + r * 0.06);
      c.quadraticCurveTo(fx, by - r * 0.03, fx + half, by + r * 0.06);
      c.stroke();
      /* the little notches down each leaflet */
      c.lineWidth = Math.max(0.5, r * 0.035);
      c.strokeStyle = autumn ? '#7d5426' : '#43702a';
      for (var k = -2; k <= 2; k++) {
        if (!k) continue;
        bx = fx + (k / 2) * half * 0.8;
        c.beginPath(); c.moveTo(bx, by + r * 0.05); c.lineTo(bx, by + r * 0.13); c.stroke();
      }
      c.strokeStyle = autumn ? '#9c6b32' : '#5f8f3a';
    }
  };

  P.thimbleberry = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.0 + seed * 7) * 1.6;
    shadow(c, x + 1, y, r * 0.75);
    c.strokeStyle = '#7c8c4e'; c.lineWidth = Math.max(1.2, r * 0.08); c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + i * r * 0.3, y - r * 0.6, x + i * r * 0.55 + sway * 0.3, y - r * 0.95);
      c.stroke();
    }
    /* big soft maple-shaped leaves - no prickles anywhere on this one */
    for (var j = -1; j <= 1; j++) {
      c.fillStyle = j === 0 ? '#6e9440' : '#628738';
      var lx = x + j * r * 0.56 + sway * 0.3, ly = y - r * (0.95 + (j === 0 ? 0.16 : 0));
      c.beginPath();
      for (var k = 0; k < 5; k++) {
        var a = -Math.PI + k * (Math.PI / 4);
        var rr = (k % 2) ? r * 0.46 : r * 0.34;
        var px = lx + Math.cos(a) * rr, py = ly + Math.sin(a) * rr * 0.62;
        if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.fill();
    }
    /* white crumpled flowers and the flat red fruit */
    c.fillStyle = '#fbf6ee';
    ell(c, x - r * 0.3 + sway * 0.3, y - r * 1.24, r * 0.14, r * 0.11);
    c.fillStyle = '#d2453a';
    ell(c, x + r * 0.34 + sway * 0.3, y - r * 1.18, r * 0.14, r * 0.10);
    c.fillStyle = '#e8695c';
    ell(c, x + r * 0.31 + sway * 0.3, y - r * 1.21, r * 0.07, r * 0.05);
  };

  /* =====================================================================
     THE OAK SAVANNA - a grassland with trees standing in it far apart.
     Every crown throws its own separate island of shade with bright grass
     all round it, and the gap between the trees is the whole point.
     ===================================================================== */

  /* The open-grown Garry oak. With room around it the tree spends its life
     going sideways, so it ends up a crooked black elbow of trunk under a
     wide flat-bottomed cloud - three times as broad as it is tall. */
  P.garryOak = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.55 + seed * 6) * 1.8;
    var rnd = GG.mulberry32(Math.floor(seed * 5273));
    var i;
    shadow(c, x + 3, y, r * 1.22);
    var cx = x + sway;
    var by = y - r * 0.60;          // the flat underside of the crown
    var hw = r * 1.45;              // half the crown's width

    /* the trunk: short, thick and bent. Never a straight pole. */
    c.fillStyle = '#8f8a80';
    c.beginPath();
    c.moveTo(x - r * 0.25, y);
    c.lineTo(x - r * 0.19, y - r * 0.26);
    c.lineTo(x - r * 0.11, y - r * 0.50);
    c.lineTo(x - r * 0.15 + sway * 0.4, y - r * 0.76);
    c.lineTo(x + r * 0.11 + sway * 0.4, y - r * 0.76);
    c.lineTo(x + r * 0.16, y - r * 0.48);
    c.lineTo(x + r * 0.23, y - r * 0.24);
    c.lineTo(x + r * 0.27, y);
    c.closePath(); c.fill();
    c.fillStyle = '#a49e93';                          // the lit west face
    c.beginPath();
    c.moveTo(x - r * 0.25, y);
    c.lineTo(x - r * 0.11, y - r * 0.50);
    c.lineTo(x - r * 0.15 + sway * 0.4, y - r * 0.76);
    c.lineTo(x - r * 0.02 + sway * 0.4, y - r * 0.76);
    c.lineTo(x - r * 0.05, y - r * 0.40);
    c.lineTo(x - r * 0.10, y);
    c.closePath(); c.fill();
    /* thick furrowed bark, near black in the cracks */
    c.strokeStyle = '#2e2924'; c.lineWidth = Math.max(0.8, r * 0.032); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - r * 0.04, y - r * 0.08);
    c.quadraticCurveTo(x + r * 0.03, y - r * 0.34, x - r * 0.02 + sway * 0.3, y - r * 0.68);
    c.stroke();
    c.beginPath();
    c.moveTo(x + r * 0.13, y - r * 0.05);
    c.quadraticCurveTo(x + r * 0.08, y - r * 0.28, x + r * 0.11 + sway * 0.3, y - r * 0.50);
    c.stroke();

    /* the big crooked limbs, elbowing out from under the crown */
    c.strokeStyle = '#7b756b'; c.lineCap = 'round'; c.lineJoin = 'round';
    for (i = -1; i <= 1; i += 2) {
      c.lineWidth = Math.max(1.8, r * 0.16);
      c.beginPath();
      c.moveTo(x + i * r * 0.14, y - r * 0.56);
      c.lineTo(x + i * r * 0.36 + sway * 0.4, y - r * 0.58);
      c.lineTo(x + i * r * 0.58 + sway * 0.6, y - r * 0.76);
      c.stroke();
    }

    /* the crown: a flat-bottomed cloud, far broader than it is tall */
    c.fillStyle = '#3a5526';
    c.fillRect(cx - hw * 0.94, by - r * 0.30, hw * 1.88, r * 0.30);
    ell(c, cx - hw * 0.66, by - r * 0.30, hw * 0.46, r * 0.30);
    ell(c, cx + hw * 0.66, by - r * 0.30, hw * 0.46, r * 0.30);
    ell(c, cx - hw * 0.28, by - r * 0.52, hw * 0.48, r * 0.34);
    ell(c, cx + hw * 0.34, by - r * 0.48, hw * 0.44, r * 0.32);
    ell(c, cx, by - r * 0.64, hw * 0.48, r * 0.36);
    c.fillStyle = '#4c6b33';
    ell(c, cx - hw * 0.62, by - r * 0.42, hw * 0.38, r * 0.26);
    ell(c, cx + hw * 0.58, by - r * 0.40, hw * 0.36, r * 0.25);
    ell(c, cx - hw * 0.14, by - r * 0.60, hw * 0.44, r * 0.30);
    ell(c, cx + hw * 0.30, by - r * 0.58, hw * 0.34, r * 0.26);
    c.fillStyle = '#5f8440';
    ell(c, cx - hw * 0.40, by - r * 0.68, hw * 0.30, r * 0.20);
    ell(c, cx + hw * 0.10, by - r * 0.76, hw * 0.28, r * 0.19);
    ell(c, cx + hw * 0.52, by - r * 0.56, hw * 0.20, r * 0.14);
    /* the gaps an open oak always has - you can see sky through it */
    c.fillStyle = 'rgba(46,62,32,0.45)';
    ell(c, cx - hw * 0.34, by - r * 0.22, hw * 0.13, r * 0.08);
    ell(c, cx + hw * 0.44, by - r * 0.26, hw * 0.10, r * 0.07);
    /* leaves are pale and fuzzy underneath, and some of them flip over */
    c.fillStyle = 'rgba(168,178,122,0.45)';
    for (i = 0; i < 6; i++) {
      ell(c, cx + (rnd() - 0.5) * hw * 1.5, by - r * (0.04 + rnd() * 0.24),
          hw * 0.040, r * 0.026, (rnd() - 0.5) * 2);
    }
  };

  /* The same oak, on the rock at the edge of the cliff. It is not a
     different tree and it is not a young one - it is the identical species
     grown where the wind never stops, and it stays knee-high forever. */
  P.cliffOak = function (c, x, y, r, t, seed) {
    var lean = (((seed * 41) % 1) > 0.5) ? 1 : -1;
    var sway = Math.sin(t * 0.8 + seed * 7) * 1.0;
    var rnd = GG.mulberry32(Math.floor(seed * 3931));
    var i, k, bx, byy;
    shadow(c, x + 2, y, r * 0.78);
    /* the same thick grey bark as the big tree, on a trunk that never got
       past your knee, leaning away from the wind */
    c.strokeStyle = '#8f8a80'; c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = Math.max(2.4, r * 0.28);
    c.beginPath();
    c.moveTo(x - lean * r * 0.22, y);
    c.lineTo(x - lean * r * 0.10, y - r * 0.30);
    c.lineTo(x + lean * r * 0.06, y - r * 0.58);
    c.stroke();
    c.strokeStyle = '#a49e93'; c.lineWidth = Math.max(1, r * 0.09);
    c.beginPath();
    c.moveTo(x - lean * r * 0.25, y - r * 0.04);
    c.lineTo(x - lean * r * 0.14, y - r * 0.32);
    c.stroke();
    /* three crooked branches, every one of them combed downwind */
    var arm = [[0.46, -0.78, 0.98, -0.94, 0.12],
               [0.52, -0.52, 1.14, -0.60, 0.10],
               [0.26, -0.84, 0.62, -1.04, 0.08]];
    c.strokeStyle = '#8f8a80';
    for (i = 0; i < 3; i++) {
      c.lineWidth = Math.max(1.4, r * arm[i][4]);
      c.beginPath();
      c.moveTo(x + lean * r * 0.02, y - r * 0.50);
      c.lineTo(x + lean * r * arm[i][0], y + r * arm[i][1]);
      c.lineTo(x + lean * r * arm[i][2] + sway * 0.5, y + r * arm[i][3]);
      c.stroke();
    }
    /* the crown: a low wedge of foliage, all of it on the sheltered side */
    var lumps = [[0.22, 0.72, 0.34, 0.24], [0.62, 0.86, 0.36, 0.26],
                 [1.00, 0.70, 0.30, 0.21], [0.46, 0.52, 0.28, 0.19]];
    for (k = 0; k < 4; k++) {
      bx = x + lean * r * lumps[k][0] + sway * 0.4;
      byy = y - r * lumps[k][1];
      c.fillStyle = '#3a5526';
      ell(c, bx, byy, r * lumps[k][2], r * lumps[k][3]);
    }
    for (k = 0; k < 4; k++) {
      bx = x + lean * r * lumps[k][0] + sway * 0.4;
      byy = y - r * lumps[k][1];
      c.fillStyle = '#4c6b33';
      ell(c, bx - lean * r * 0.05, byy - r * 0.05, r * lumps[k][2] * 0.72, r * lumps[k][3] * 0.70);
      c.fillStyle = '#5f8440';
      ell(c, bx - lean * r * 0.10, byy - r * 0.09, r * lumps[k][2] * 0.38, r * lumps[k][3] * 0.36);
    }
    /* bare crooked tips coming out through the leaves, downwind */
    c.strokeStyle = '#7b756b'; c.lineWidth = Math.max(0.9, r * 0.055);
    for (i = 0; i < 2; i++) {
      byy = y - r * (0.62 + i * 0.26);
      c.beginPath();
      c.moveTo(x + lean * r * 0.90, byy);
      c.lineTo(x + lean * r * 1.16 + sway * 0.5, byy - r * 0.06);
      c.lineTo(x + lean * r * 1.34 + sway * 0.7, byy + r * 0.02);
      c.stroke();
    }
    /* one silver wind-killed twig on the side the wind comes from */
    c.strokeStyle = '#b6b0a4'; c.lineWidth = Math.max(0.8, r * 0.045);
    c.beginPath();
    c.moveTo(x - lean * r * 0.04, y - r * 0.50);
    c.lineTo(x - lean * r * 0.34, y - r * 0.70);
    c.stroke();
    c.fillStyle = 'rgba(168,178,122,0.75)';
    ell(c, x + lean * r * 0.34, y - r * 0.58, r * 0.10, r * 0.065, 0.3);
    ell(c, x + lean * r * 0.86, y - r * 0.82, r * 0.09, r * 0.06, -0.2);
    if (rnd() > 2) { bx = 0; }
  };

  /* Acorns on the ground in September. One of them has a small round door
     chewed in it, which means a filbert weevil grub has already spent its
     whole childhood inside and let itself out. */
  P.acorns = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 6607));
    var n = 3 + (rnd() > 0.5 ? 1 : 0);
    for (var i = 0; i < n; i++) {
      var aa = seed * 6.3 + i * (Math.PI * 2 / n) + (rnd() - 0.5) * 0.5;
      var uu = 0.62 + rnd() * 0.42;
      var px = x + Math.cos(aa) * r * 1.05 * uu;
      var py = y + Math.sin(aa) * r * 0.46 * uu;
      var rot = (rnd() - 0.5) * 2.4;
      var s = r * (0.40 + rnd() * 0.10);
      var holed = rnd() > 0.62;
      c.fillStyle = 'rgba(40,52,26,0.20)';
      ell(c, px + s * 0.10, py + s * 0.34, s * 0.95, s * 0.30);
      c.save(); c.translate(px, py); c.rotate(rot);
      /* the nut */
      c.fillStyle = '#a87b3e';
      ell(c, 0, 0, s * 0.92, s * 0.56);
      c.fillStyle = '#c49660';
      ell(c, -s * 0.10, -s * 0.17, s * 0.54, s * 0.22, -0.18);
      c.fillStyle = '#8b6531';
      c.beginPath();
      c.moveTo(s * 0.80, -s * 0.17); c.lineTo(s * 1.18, 0);
      c.lineTo(s * 0.80, s * 0.17); c.closePath(); c.fill();
      /* the shallow scaly cup pulled down over the blunt end */
      c.fillStyle = '#6e5432';
      ell(c, -s * 0.44, 0, s * 0.54, s * 0.60);
      c.fillStyle = '#83653f';
      ell(c, -s * 0.50, -s * 0.16, s * 0.34, s * 0.30, -0.2);
      c.fillStyle = '#57411f';
      for (var k = 0; k < 3; k++) {
        ell(c, -s * (0.34 + (k % 2) * 0.24), -s * 0.30 + k * s * 0.30,
            s * 0.10, s * 0.08);
      }
      c.fillStyle = '#6e5432';                   // the little stalk
      c.fillRect(-s * 1.04, -s * 0.06, s * 0.20, s * 0.12);
      if (holed) {
        c.fillStyle = '#2f2519';
        ell(c, s * 0.20, s * 0.06, s * 0.13, s * 0.11);
      }
      c.restore();
    }
  };

  /* The speckled oak gall. It is not a fruit and the wasp did not build it:
     the wasp laid an egg in the leaf and the tree grew the ball itself,
     round the grub, with the grub slung in the middle on threads. */
  P.oakGall = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.2 + seed * 9) * 1.2;
    var rnd = GG.mulberry32(Math.floor(seed * 2437));
    var i, a;
    function oakLeaf(lx, ly, ln, ang, dark) {
      var k, u, px, rr;
      c.save(); c.translate(lx, ly); c.rotate(ang);
      c.fillStyle = dark ? '#3f5a2a' : '#4c6b33';
      ell(c, 0, 0, ln, ln * 0.26);
      for (k = 0; k < 4; k++) {
        u = -0.72 + k * 0.48;
        px = u * ln;
        rr = ln * (0.30 - Math.abs(u) * 0.12);
        ell(c, px, -rr * 0.56, rr, rr * 0.86);
        ell(c, px, rr * 0.56, rr, rr * 0.86);
      }
      c.fillStyle = dark ? '#4c6b33' : '#5f8440';
      ell(c, -ln * 0.10, -ln * 0.13, ln * 0.52, ln * 0.13, -0.10);
      c.restore();
    }
    /* the twig */
    c.strokeStyle = '#6f5b41'; c.lineWidth = Math.max(1.2, r * 0.09); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + sway * 0.3, y - r * 0.55, x + sway, y - r * 1.00);
    c.stroke();
    c.strokeStyle = '#6f5b41'; c.lineWidth = Math.max(0.9, r * 0.055);
    c.beginPath();
    c.moveTo(x + sway * 0.55, y - r * 0.62);
    c.lineTo(x - r * 0.42 + sway * 0.4, y - r * 0.72);
    c.stroke();
    /* three deeply lobed leaves */
    oakLeaf(x - r * 0.52 + sway * 0.4, y - r * 0.74, r * 0.40, -0.30, 1);
    oakLeaf(x + r * 0.42 + sway * 0.8, y - r * 0.96, r * 0.36, 0.34, 1);
    oakLeaf(x - r * 0.06 + sway, y - r * 1.12, r * 0.44, -0.08, 0);
    /* and slung under the big one, the gall itself */
    var gx = x + sway * 0.95, gy = y - r * 0.86, gr = r * 0.36;
    c.strokeStyle = '#8f7a54'; c.lineWidth = Math.max(0.8, r * 0.04);
    c.beginPath(); c.moveTo(gx, gy - gr * 0.9); c.lineTo(gx - r * 0.02, y - r * 1.10); c.stroke();
    c.fillStyle = '#b8a869';
    ell(c, gx, gy, gr, gr);
    c.fillStyle = '#d6c98e';
    ell(c, gx - gr * 0.12, gy - gr * 0.14, gr * 0.82, gr * 0.80);
    c.fillStyle = '#ece2b4';
    ell(c, gx - gr * 0.34, gy - gr * 0.36, gr * 0.30, gr * 0.24, -0.4);
    c.fillStyle = '#9a5e3a';
    for (i = 0; i < 8; i++) {
      a = rnd() * Math.PI * 2;
      var rr2 = Math.sqrt(rnd()) * gr * 0.74;
      ell(c, gx + Math.cos(a) * rr2, gy + Math.sin(a) * rr2, gr * 0.11, gr * 0.09);
    }
    /* a second, smaller one - there are often two or three on a leaf */
    c.fillStyle = '#c9bb81';
    ell(c, x - r * 0.46 + sway * 0.4, y - r * 0.60, gr * 0.44, gr * 0.44);
    c.fillStyle = '#9a5e3a';
    ell(c, x - r * 0.50 + sway * 0.4, y - r * 0.62, gr * 0.09, gr * 0.08);
  };

  /* A dead oak left standing. This one is a granary tree: an acorn
     woodpecker drills a hole, hammers one acorn into it, and then does that
     again, and again, until the trunk is a wall of little full cupboards. */
  P.oakSnag = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 4703));
    var i, k, hx, hy;
    shadow(c, x + 2, y, r * 0.58);
    var h = r * 1.90;
    /* the silvered trunk, snapped off at the top */
    c.fillStyle = '#8e897e';
    c.beginPath();
    c.moveTo(x - r * 0.30, y);
    c.lineTo(x - r * 0.20, y - h * 0.5);
    c.lineTo(x - r * 0.12, y - h);
    c.lineTo(x + r * 0.13, y - h * 0.96);
    c.lineTo(x + r * 0.21, y - h * 0.5);
    c.lineTo(x + r * 0.31, y);
    c.closePath(); c.fill();
    c.fillStyle = '#b4afa3';
    c.beginPath();
    c.moveTo(x - r * 0.30, y);
    c.lineTo(x - r * 0.20, y - h * 0.5);
    c.lineTo(x - r * 0.12, y - h);
    c.lineTo(x + r * 0.01, y - h);
    c.lineTo(x - r * 0.06, y - h * 0.5);
    c.lineTo(x - r * 0.13, y);
    c.closePath(); c.fill();
    c.fillStyle = '#635f57';
    c.beginPath();
    c.moveTo(x + r * 0.10, y - h * 0.96);
    c.lineTo(x + r * 0.13, y - h * 0.96);
    c.lineTo(x + r * 0.31, y);
    c.lineTo(x + r * 0.22, y);
    c.closePath(); c.fill();
    /* the ragged splintered break */
    c.fillStyle = '#c6c0b2';
    c.beginPath();
    c.moveTo(x - r * 0.12, y - h);
    c.lineTo(x - r * 0.07, y - h - r * 0.20);
    c.lineTo(x - r * 0.01, y - h - r * 0.03);
    c.lineTo(x + r * 0.06, y - h - r * 0.24);
    c.lineTo(x + r * 0.13, y - h * 0.96);
    c.closePath(); c.fill();
    /* two broken limbs, stubby and crooked */
    c.fillStyle = '#9d988c';
    c.beginPath();
    c.moveTo(x - r * 0.14, y - h * 0.72);
    c.lineTo(x - r * 0.40, y - h * 0.82);
    c.lineTo(x - r * 0.38, y - h * 0.76);
    c.lineTo(x - r * 0.14, y - h * 0.64);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(x + r * 0.13, y - h * 0.52);
    c.lineTo(x + r * 0.34, y - h * 0.48);
    c.lineTo(x + r * 0.33, y - h * 0.43);
    c.lineTo(x + r * 0.13, y - h * 0.44);
    c.closePath(); c.fill();
    c.fillStyle = '#7d786e';
    c.beginPath();
    c.moveTo(x + r * 0.13, y - h * 0.30);
    c.lineTo(x + r * 0.24, y - h * 0.32);
    c.lineTo(x + r * 0.13, y - h * 0.25);
    c.closePath(); c.fill();
    /* the granary holes, in loose rows, most of them with an acorn in */
    for (i = 0; i < 7; i++) {
      for (k = 0; k < 3; k++) {
        hx = x - r * 0.13 + k * r * 0.10 + (rnd() - 0.5) * r * 0.04;
        hy = y - h * (0.16 + i * 0.115) + (rnd() - 0.5) * r * 0.05;
        c.fillStyle = '#1e1a16';
        ell(c, hx, hy, r * 0.042, r * 0.036);
        if (rnd() > 0.38) {
          c.fillStyle = '#a87b3e';
          ell(c, hx, hy, r * 0.030, r * 0.024);
        }
      }
    }
    /* and one proper nest hole */
    c.fillStyle = '#1e1a16';
    ell(c, x + r * 0.02, y - h * 0.80, r * 0.085, r * 0.095);
    c.fillStyle = 'rgba(255,255,255,0.22)';
    ell(c, x + r * 0.02, y - h * 0.84, r * 0.075, r * 0.026);
  };

  /* =====================================================================
     THE SWAMP - marsh and slough. Tea-coloured water, and most of what
     lives here is under it or inside the reeds.
     ===================================================================== */

  /* Cattail: flat straps. That is the field mark, and it is the only way
     to tell it from the bulrush standing next to it. */
  P.cattail = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.1 + seed * 8) * 2.2;
    var rnd = GG.mulberry32(Math.floor(seed * 3121));
    var i, lean, tipx, tipy, wid;
    for (i = -2; i <= 2; i++) {
      lean = i * 0.30 + (rnd() - 0.5) * 0.14;
      tipx = x + lean * r * 1.05 + sway * (0.45 + Math.abs(i) * 0.22);
      tipy = y - r * (1.72 - Math.abs(i) * 0.26);
      wid = r * 0.085;
      c.fillStyle = (i % 2) ? '#5e7a3e' : '#6d8c46';
      c.beginPath();
      c.moveTo(x + i * r * 0.05 - wid, y);
      c.quadraticCurveTo(x + lean * r * 0.34 - wid * 0.9, y - r * 0.92, tipx, tipy);
      c.quadraticCurveTo(x + lean * r * 0.34 + wid * 0.9, y - r * 0.92, x + i * r * 0.05 + wid, y);
      c.closePath(); c.fill();
      /* the crease down the middle of the strap */
      if (i % 2 === 0) {
        c.strokeStyle = 'rgba(146,176,104,0.6)'; c.lineWidth = Math.max(0.6, r * 0.022);
        c.beginPath();
        c.moveTo(x + i * r * 0.05, y - r * 0.04);
        c.quadraticCurveTo(x + lean * r * 0.34, y - r * 0.92, tipx, tipy);
        c.stroke();
      }
    }
    /* the brown velvet sausage, with the thin bare spike above it */
    for (i = -1; i <= 1; i += 2) {
      var hx = x + i * r * 0.14 + sway * 0.8;
      var hy = y - r * (1.28 + (i > 0 ? 0.20 : 0));
      c.strokeStyle = '#6f8a44'; c.lineWidth = Math.max(1.1, r * 0.055); c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x + i * r * 0.05, y);
      c.quadraticCurveTo(x + i * r * 0.10 + sway * 0.4, y - r * 0.7, hx, hy + r * 0.28);
      c.stroke();
      c.strokeStyle = '#8a7048'; c.lineWidth = Math.max(0.8, r * 0.032);
      c.beginPath();
      c.moveTo(hx, hy - r * 0.26);
      c.lineTo(hx + sway * 0.14, hy - r * 0.56);
      c.stroke();
      c.fillStyle = '#6b4a2a';
      ell(c, hx, hy, r * 0.105, r * 0.30);
      c.fillStyle = '#7e5a33';
      ell(c, hx - r * 0.035, hy - r * 0.04, r * 0.050, r * 0.22);
      c.fillStyle = '#523821';
      ell(c, hx + r * 0.058, hy + r * 0.02, r * 0.036, r * 0.22);
      /* one of them has burst and gone to grey fluff */
      if (i > 0 && ((seed * 11) % 1) > 0.45) {
        c.fillStyle = 'rgba(214,208,192,0.9)';
        ell(c, hx - r * 0.05, hy - r * 0.22, r * 0.11, r * 0.09);
        ell(c, hx + r * 0.07, hy - r * 0.12, r * 0.08, r * 0.07);
        c.fillStyle = 'rgba(238,234,222,0.8)';
        ell(c, hx - r * 0.02, hy - r * 0.28, r * 0.07, r * 0.055);
      }
    }
  };

  /* Hardstem bulrush - tule. Round pencils stood on end, no leaves at all,
     and a small brown tassel just under the tip. */
  P.bulrush = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.0 + seed * 7) * 1.8;
    var rnd = GG.mulberry32(Math.floor(seed * 5417));
    var i, k, lean, tx, ty, mx, my;
    for (i = -3; i <= 3; i++) {
      lean = i * 0.15 + (rnd() - 0.5) * 0.10;
      tx = x + lean * r * 0.95 + sway * 0.7;
      ty = y - r * (1.98 - Math.abs(i) * 0.20 - rnd() * 0.16);
      mx = x + lean * r * 0.38 + sway * 0.3;
      my = y - r * 1.00;
      c.strokeStyle = (i % 2) ? '#2f6b3e' : '#37764a';
      c.lineWidth = Math.max(1.3, r * 0.070); c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x + i * r * 0.115, y);
      c.quadraticCurveTo(mx, my, tx, ty);
      c.stroke();
      /* the highlight stripe that makes it a pencil and not a ribbon */
      c.strokeStyle = 'rgba(152,204,122,0.55)'; c.lineWidth = Math.max(0.6, r * 0.020);
      c.beginPath();
      c.moveTo(x + i * r * 0.115 - r * 0.018, y - r * 0.06);
      c.quadraticCurveTo(mx - r * 0.018, my, tx - r * 0.016, ty + r * 0.06);
      c.stroke();
      /* the tassel, hanging off a little below the tip */
      if (Math.abs(i) < 3 && rnd() > 0.25) {
        c.strokeStyle = '#7a5a2e'; c.lineWidth = Math.max(0.6, r * 0.020);
        c.fillStyle = '#7a5a2e';
        for (k = 0; k < 4; k++) {
          var dx = (k - 1.5) * r * 0.045;
          c.beginPath();
          c.moveTo(tx, ty + r * 0.14);
          c.lineTo(tx + dx, ty + r * 0.30);
          c.stroke();
          ell(c, tx + dx, ty + r * 0.31, r * 0.028, r * 0.045, dx * 3);
        }
        c.fillStyle = '#8e6b39';
        ell(c, tx - r * 0.03, ty + r * 0.30, r * 0.024, r * 0.036);
      }
    }
  };

  /* A muskrat lodge: a shaggy haystack of cut cattail and mud shoved up out
     of the water. The doors are underneath, where you cannot see them. */
  P.muskratLodge = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 8237));
    var i, a, u, bx, byy, len, ang;
    /* the wet ring where it comes out of the water */
    c.fillStyle = 'rgba(40,72,56,0.26)';
    ell(c, x, y, r * 1.22, r * 0.38);
    /* the mud core */
    c.fillStyle = '#54452f';
    c.beginPath(); c.ellipse(x, y - r * 0.04, r * 1.0, r * 0.76, 0, Math.PI, 0); c.fill();
    c.fillRect(x - r, y - r * 0.12, r * 2, r * 0.12);
    c.fillStyle = '#6a5940';
    c.beginPath(); c.ellipse(x - r * 0.08, y - r * 0.10, r * 0.82, r * 0.62, 0, Math.PI, 0); c.fill();
    /* cut cattail piled on every which way, some of it hanging over */
    c.lineCap = 'round';
    for (i = 0; i < 34; i++) {
      a = rnd() * Math.PI * 2;
      u = Math.sqrt(rnd());
      bx = x + Math.cos(a) * r * 0.92 * u;
      byy = y - r * 0.06 - Math.abs(Math.sin(a)) * r * 0.62 * u;
      len = r * (0.32 + rnd() * 0.46);
      ang = (rnd() - 0.5) * 1.5;
      c.strokeStyle = ['#9a8a5c', '#b3a373', '#7e7048', '#c3b689', '#8d7d51'][i % 5];
      c.lineWidth = Math.max(1, r * 0.05);
      c.beginPath();
      c.moveTo(bx - Math.cos(ang) * len * 0.5, byy - Math.sin(ang) * len * 0.4);
      c.lineTo(bx + Math.cos(ang) * len * 0.5, byy + Math.sin(ang) * len * 0.4);
      c.stroke();
    }
    /* a few long stems poking out past the edge, so it is not a smooth dome */
    c.strokeStyle = '#b3a373'; c.lineWidth = Math.max(0.9, r * 0.042);
    for (i = 0; i < 6; i++) {
      a = Math.PI + rnd() * Math.PI;
      bx = x + Math.cos(a) * r * 0.86;
      byy = y - r * 0.06 + Math.sin(a) * r * 0.62;
      c.beginPath();
      c.moveTo(bx, byy);
      c.lineTo(bx + Math.cos(a) * r * (0.22 + rnd() * 0.22),
               byy + Math.sin(a) * r * (0.18 + rnd() * 0.16));
      c.stroke();
    }
    /* mud smeared over the top, which is what actually holds it together */
    c.fillStyle = 'rgba(92,76,52,0.55)';
    ell(c, x + r * 0.10, y - r * 0.50, r * 0.42, r * 0.18, -0.12);
    ell(c, x - r * 0.42, y - r * 0.30, r * 0.26, r * 0.12, 0.2);
    c.fillStyle = 'rgba(30,50,36,0.30)';
    ell(c, x, y - r * 0.02, r * 0.94, r * 0.16);
  };

  /* A barkless log lying at a low angle out of the slough. The top is dry
     and pale, there is a dark wet line where the water has been, and the
     far end just disappears into the tea. */
  P.sunkLog = function (c, x, y, r, t, seed) {
    var flip = (((seed * 7) % 1) > 0.5) ? -1 : 1;
    var tilt = (-0.17 - ((seed * 13) % 1) * 0.14) * flip;
    var i;
    c.fillStyle = 'rgba(35,62,46,0.22)';
    ell(c, x, y, r * 1.20, r * 0.32);
    c.save(); c.translate(x, y - r * 0.20); c.rotate(tilt);
    c.fillStyle = '#9b8e77';                        // barkless weathered wood
    GG.roundRect(c, -r * 1.15, -r * 0.24, r * 2.30, r * 0.46, r * 0.11); c.fill();
    c.fillStyle = '#bcaf94';                        // the dry sun-bleached top
    GG.roundRect(c, -r * 1.10, -r * 0.24, r * 2.20, r * 0.17, r * 0.06); c.fill();
    c.fillStyle = '#463f2f';                        // the dark waterline band
    GG.roundRect(c, -r * 1.13, r * 0.03, r * 2.26, r * 0.19, r * 0.06); c.fill();
    c.fillStyle = 'rgba(95,122,78,0.8)';            // algae right on the line
    GG.roundRect(c, -r * 0.88, r * 0.01, r * 1.5, r * 0.07, r * 0.03); c.fill();
    /* the sawn end, and the grain running the length of it */
    c.fillStyle = '#c9b48c';
    ell(c, -r * 1.12, -r * 0.02, r * 0.13, r * 0.23);
    c.strokeStyle = '#9a8460'; c.lineWidth = Math.max(0.6, r * 0.028);
    c.beginPath(); c.ellipse(-r * 1.12, -r * 0.02, r * 0.07, r * 0.13, 0, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(-r * 1.20, -r * 0.02); c.lineTo(-r * 1.02, -r * 0.02); c.stroke();
    c.strokeStyle = 'rgba(108,94,70,0.55)'; c.lineWidth = Math.max(0.6, r * 0.024);
    for (i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(-r * 0.92, i * r * 0.050 - r * 0.08);
      c.quadraticCurveTo(0, i * r * 0.070 - r * 0.06, r * 0.94, i * r * 0.046 - r * 0.09);
      c.stroke();
    }
    c.fillStyle = 'rgba(70,58,40,0.45)';            // a knot, and a long split
    ell(c, r * 0.38, -r * 0.10, r * 0.07, r * 0.045);
    c.strokeStyle = 'rgba(58,48,32,0.5)'; c.lineWidth = Math.max(0.7, r * 0.030);
    c.beginPath();
    c.moveTo(-r * 0.30, -r * 0.20); c.lineTo(r * 0.62, -r * 0.16);
    c.stroke();
    c.restore();
    /* and the end that is under the water */
    c.fillStyle = 'rgba(69,92,74,0.62)';
    ell(c, x + flip * r * 0.88, y + r * 0.02, r * 0.50, r * 0.26, 0);
    c.strokeStyle = 'rgba(190,205,180,0.30)'; c.lineWidth = Math.max(0.7, r * 0.03);
    for (i = 0; i < 2; i++) {
      c.beginPath();
      c.ellipse(x + flip * r * 0.72, y + r * 0.04, r * (0.42 + i * 0.24), r * (0.16 + i * 0.09),
                0, 0, Math.PI * 2);
      c.stroke();
    }
  };

  /* Duckweed. Each disc is one whole plant, about the size of this full
     stop, and a million of them make the bright green skin on still water.
     Ground layer: it lies flat and things walk over it. */
  P.duckweed = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 9311));
    var i, a, rr, px, py, u;
    var drift = Math.sin(t * 0.35 + seed * 5) * r * 0.05;
    c.fillStyle = 'rgba(148,176,82,0.92)';
    c.beginPath();
    for (i = 0; i < 14; i++) {
      a = i / 14 * Math.PI * 2;
      rr = r * (0.80 + ((i * 7 + seed * 19) % 10) / 44);
      px = x + drift + Math.cos(a) * rr;
      py = y + Math.sin(a) * rr * 0.46;
      if (!i) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    /* the individual fronds, thickest in the middle, crumbling at the edge */
    for (i = 0; i < 46; i++) {
      a = rnd() * Math.PI * 2;
      u = 0.35 + rnd() * 0.85;
      px = x + drift + Math.cos(a) * r * u;
      py = y + Math.sin(a) * r * 0.48 * u;
      c.fillStyle = rnd() > 0.45 ? '#a8c46e' : '#c2d886';
      ell(c, px, py, r * 0.055, r * 0.044);
    }
    /* holes where the black water shows through the mat */
    c.fillStyle = 'rgba(52,72,58,0.55)';
    ell(c, x + drift + r * 0.28, y - r * 0.09, r * 0.15, r * 0.065, 0.2);
    ell(c, x + drift - r * 0.40, y + r * 0.12, r * 0.10, r * 0.045, -0.3);
  };

  /* The refuge boardwalk, and the blind at the end of it: weathered planks
     on posts over the water, and a wooden screen with a slot to look
     through so the birds never find out you are there. */
  P.boardwalk = function (c, x, y, r, t, seed) {
    var hw = r * 1.5, i, px;
    var dy = y - r * 0.44, dh = r * 0.30;
    c.fillStyle = 'rgba(35,62,46,0.24)';
    ell(c, x, y, hw * 0.96, r * 0.20);
    /* the posts standing in the water */
    c.fillStyle = '#5f5b51';
    c.fillRect(x - hw * 0.84, y - r * 0.50, r * 0.15, r * 0.50);
    c.fillRect(x + hw * 0.70, y - r * 0.50, r * 0.15, r * 0.50);
    c.fillStyle = 'rgba(120,150,110,0.45)';
    c.fillRect(x - hw * 0.84, y - r * 0.12, r * 0.15, r * 0.09);
    c.fillRect(x + hw * 0.70, y - r * 0.12, r * 0.15, r * 0.09);
    /* the deck */
    c.fillStyle = '#9a958a';
    c.fillRect(x - hw, dy - dh, hw * 2, dh);
    c.fillStyle = '#7c766b';
    c.fillRect(x - hw, dy - dh * 0.26, hw * 2, dh * 0.26);
    c.strokeStyle = 'rgba(78,74,66,0.45)'; c.lineWidth = 1;
    for (i = -6; i <= 6; i++) {
      px = x + i * hw / 6.5;
      c.beginPath(); c.moveTo(px, dy - dh); c.lineTo(px, dy); c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.18)';
    c.fillRect(x - hw, dy - dh, hw * 2, dh * 0.16);
    /* the handrail */
    c.fillStyle = '#8d877c';
    c.fillRect(x - hw * 0.94, dy - dh - r * 0.58, r * 0.10, r * 0.58);
    c.fillRect(x - hw * 0.10, dy - dh - r * 0.58, r * 0.10, r * 0.58);
    c.fillRect(x - hw, dy - dh - r * 0.60, hw * 1.20, r * 0.10);
    /* the blind: a screen you stand behind, with a slot at eye height */
    c.fillStyle = '#847e72';
    c.fillRect(x + hw * 0.18, dy - dh - r * 0.86, hw * 0.86, r * 0.86);
    c.fillStyle = '#726c61';
    c.fillRect(x + hw * 0.18, dy - dh - r * 0.86, hw * 0.86, r * 0.10);
    c.strokeStyle = 'rgba(70,66,58,0.45)'; c.lineWidth = 1;
    for (i = 1; i < 4; i++) {
      c.beginPath();
      c.moveTo(x + hw * 0.18, dy - dh - r * 0.86 + i * r * 0.215);
      c.lineTo(x + hw * 1.04, dy - dh - r * 0.86 + i * r * 0.215);
      c.stroke();
    }
    c.fillStyle = '#24211b';
    c.fillRect(x + hw * 0.28, dy - dh - r * 0.62, hw * 0.66, r * 0.15);
  };

  /* =====================================================================
     THE CHANNELED SCABLANDS - a badland a flood made in a fortnight.
     Flat tops, straight sides, hard shadows, almost no curves.
     ===================================================================== */

  /* Rimrock: a flat plateau cap, a band of standing basalt columns under
     it, and a skirt of the columns that have already fallen off. */
  P.basaltColumn = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 7817));
    var i, cw, ch, cx, k;
    var hw = r * 1.55;
    var top = y - r * 1.50;                      // the underside of the cap
    shadow(c, x + 2, y, r * 1.2);
    /* the talus skirt of fallen columns at the foot */
    for (i = 0; i < 7; i++) {
      var bw = r * (0.16 + rnd() * 0.14), bh = r * (0.10 + rnd() * 0.10);
      var bx = x + (rnd() - 0.5) * hw * 1.9, byy = y - rnd() * r * 0.22;
      c.save(); c.translate(bx, byy); c.rotate((rnd() - 0.5) * 1.1);
      c.fillStyle = '#35322d';
      c.fillRect(-bw, -bh, bw * 2, bh * 2);
      c.fillStyle = '#4e4a44';
      c.fillRect(-bw, -bh, bw * 2, bh * 0.9);
      c.restore();
    }
    /* the columns */
    var n = 7;
    for (i = 0; i < n; i++) {
      cw = hw * 2 / n * 0.5;
      cx = x - hw + (i + 0.5) * (hw * 2 / n);
      var ctop = top + rnd() * r * 0.16;         // no two columns end level
      ch = (y - r * 0.26) - ctop;
      c.fillStyle = '#26241f';                   // the shadowed gap behind
      c.fillRect(cx - cw * 1.05, ctop, cw * 2.10, ch);
      c.fillStyle = '#4e4a44';
      c.fillRect(cx - cw * 0.92, ctop, cw * 1.84, ch);
      c.fillStyle = '#5d5952';                   // the lit left facet
      c.fillRect(cx - cw * 0.92, ctop, cw * 0.62, ch);
      c.fillStyle = '#332f2a';                   // the dark right facet
      c.fillRect(cx + cw * 0.46, ctop, cw * 0.46, ch);
      /* one cross-joint per column, at its own height - a colonnade,
         not a brick wall */
      c.strokeStyle = 'rgba(20,18,15,0.40)'; c.lineWidth = 1;
      var yy = ctop + ch * (0.22 + rnd() * 0.56);
      c.beginPath();
      c.moveTo(cx - cw * 0.92, yy); c.lineTo(cx + cw * 0.92, yy + r * 0.025);
      c.stroke();
      /* lichen: mustard, rust, pale grey-green */
      if (rnd() > 0.34) {
        c.fillStyle = ['rgba(154,140,66,0.75)', 'rgba(138,74,46,0.7)',
                       'rgba(168,176,160,0.62)'][(rnd() * 3) | 0];
        ell(c, cx + (rnd() - 0.5) * cw * 1.2, ctop + ch * (0.15 + rnd() * 0.7),
            cw * 0.42, r * 0.055, (rnd() - 0.5) * 0.6);
      }
    }
    /* the cap: one hard flat slab across the top of the lot */
    c.fillStyle = '#3b3833';
    c.fillRect(x - hw * 1.08, top - r * 0.24, hw * 2.16, r * 0.24);
    c.fillStyle = '#57534b';
    c.fillRect(x - hw * 1.08, top - r * 0.24, hw * 2.16, r * 0.09);
    c.fillStyle = '#6d6659';
    c.beginPath();
    c.moveTo(x - hw * 1.08, top - r * 0.24);
    c.lineTo(x - hw * 0.94, top - r * 0.36);
    c.lineTo(x + hw * 1.08, top - r * 0.34);
    c.lineTo(x + hw * 1.08, top - r * 0.24);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(154,140,66,0.6)';
    ell(c, x - hw * 0.5, top - r * 0.32, hw * 0.24, r * 0.035);
    ell(c, x + hw * 0.62, top - r * 0.31, hw * 0.16, r * 0.030);
  };

  /* A pothole. A kolk - a whirlpool standing on its head in the flood -
     drilled this into solid rock like a hand drill. Some of them still
     hold water in July, and then they go green round the rim.
     Ground layer. */
  P.scabPothole = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 7411));
    var i, a, rr, px, py;
    /* the swept rock apron */
    c.fillStyle = 'rgba(74,71,65,0.9)';
    c.beginPath();
    for (i = 0; i < 9; i++) {
      a = i / 9 * Math.PI * 2;
      rr = r * (0.88 + ((i * 11 + seed * 23) % 10) / 30);
      px = x + Math.cos(a) * rr; py = y + Math.sin(a) * rr * 0.50;
      if (!i) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(38,36,31,0.5)';
    ell(c, x - r * 0.48, y + r * 0.20, r * 0.30, r * 0.09, -0.2);
    /* the one green thing in the scabland, right on the rim */
    c.fillStyle = 'rgba(110,122,82,0.92)';
    ell(c, x, y, r * 0.70, r * 0.36);
    c.fillStyle = 'rgba(132,146,96,0.85)';
    ell(c, x - r * 0.10, y - r * 0.05, r * 0.58, r * 0.28);
    /* the bowl. The lit crescent on the far wall is what makes it a hole
       and not a coin lying on the ground. */
    c.fillStyle = '#4b473f';
    ell(c, x, y, r * 0.56, r * 0.28);
    c.fillStyle = '#6e685c';
    c.beginPath();
    c.ellipse(x, y, r * 0.56, r * 0.28, 0, Math.PI, 0);
    c.closePath(); c.fill();
    c.fillStyle = '#211f1a';
    ell(c, x, y + r * 0.035, r * 0.48, r * 0.235);
    c.fillStyle = '#3a4c44';                 // the water still in the bottom
    ell(c, x, y + r * 0.055, r * 0.38, r * 0.17);
    c.fillStyle = 'rgba(158,186,172,0.32)';
    ell(c, x - r * 0.12, y + r * 0.01, r * 0.17, r * 0.05, -0.15);
    /* sedge round the edge */
    c.strokeStyle = 'rgba(122,138,84,0.95)'; c.lineWidth = Math.max(0.8, r * 0.035);
    c.lineCap = 'round';
    for (i = 0; i < 9; i++) {
      a = rnd() * Math.PI * 2;
      px = x + Math.cos(a) * r * 0.66; py = y + Math.sin(a) * r * 0.33;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + (rnd() - 0.5) * r * 0.14, py - r * (0.14 + rnd() * 0.12));
      c.stroke();
    }
  };

  /* Giant current ripples. These are ripple marks, the same shape as the
     ones in the sand at the edge of a puddle - except each one of these is
     taller than a house, and the water that made them was a flood.
     Ground layer. */
  P.currentRipple = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 5813));
    var n = 5, i, k, yy, sag, hw, th, gap, u, gx, gy;
    /* each swell is a lens that comes to nothing at both ends, so a field
       of them reads as ground and not as a stack of planks */
    function band(yc, thk, sg, wid, fill) {
      c.fillStyle = fill;
      c.beginPath();
      c.moveTo(x - wid, yc);
      c.quadraticCurveTo(x, yc + sg * 2, x + wid, yc);
      c.quadraticCurveTo(x, yc + (sg + thk) * 2, x - wid, yc);
      c.closePath(); c.fill();
    }
    yy = y;
    for (i = 0; i < n; i++) {
      /* the far ones are smaller, closer together and paler, because they
         are further away - otherwise a row of stripes reads as an awning */
      u = i / (n - 1);
      hw = r * (2.0 - u * 0.55);
      th = r * (0.17 - u * 0.075);
      sag = r * (0.20 - u * 0.07) + ((i * 7 + seed * 13) % 4) / 60 * r;
      gap = r * (0.40 - u * 0.15);
      /* the trough in front of each swell, in shadow */
      band(yy - th * 0.35, th * 1.45, sag, hw, 'rgba(74,66,52,' + (0.42 - u * 0.10).toFixed(2) + ')');
      /* the crest */
      band(yy - th * 1.05, th * 0.80, sag, hw * 0.94, 'rgba(196,178,140,' + (0.90 - u * 0.16).toFixed(2) + ')');
      band(yy - th * 1.42, th * 0.44, sag, hw * 0.78, 'rgba(228,214,182,' + (0.80 - u * 0.18).toFixed(2) + ')');
      /* gravel on the crest - these are dunes made out of boulders */
      for (k = 0; k < 11; k++) {
        var v = (rnd() - 0.5) * 1.92;
        gx = x + v * hw;
        gy = yy - th * (0.6 + rnd() * 0.9) + sag * (1 - v * v * 0.9);
        c.fillStyle = rnd() > 0.5 ? 'rgba(124,113,94,0.55)' : 'rgba(222,206,172,0.55)';
        ell(c, gx, gy, r * (0.020 + rnd() * 0.020), r * 0.016);
      }
      yy -= gap;
    }
  };

  /* Broken basalt pavement - the scab in scabland. The flood peeled the
     soil off and then started prising up the rock underneath. */
  P.scabRubble = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 6133));
    var i, k, bw, bh, bx, byy;
    shadow(c, x + 1, y, r * 0.95);
    /* flat slabs lying about, hardly lifted off the ground */
    for (i = 0; i < 6; i++) {
      bw = r * (0.30 + rnd() * 0.26); bh = r * (0.12 + rnd() * 0.10);
      bx = x + (rnd() - 0.5) * r * 1.7; byy = y - rnd() * r * 0.30;
      c.save(); c.translate(bx, byy); c.rotate((rnd() - 0.5) * 0.6);
      c.fillStyle = '#211f1a';
      c.beginPath();
      c.moveTo(-bw, 0); c.lineTo(-bw * 0.86, bh * 0.55);
      c.lineTo(bw * 0.9, bh * 0.5); c.lineTo(bw, -bh * 0.1);
      c.closePath(); c.fill();
      c.fillStyle = '#4a4741';
      c.beginPath();
      c.moveTo(-bw, 0); c.lineTo(-bw * 0.62, -bh);
      c.lineTo(bw * 0.7, -bh * 0.88); c.lineTo(bw, -bh * 0.1);
      c.closePath(); c.fill();
      c.fillStyle = '#5d5951';
      c.beginPath();
      c.moveTo(-bw * 0.72, -bh * 0.3); c.lineTo(-bw * 0.5, -bh * 0.9);
      c.lineTo(bw * 0.4, -bh * 0.8); c.lineTo(bw * 0.5, -bh * 0.3);
      c.closePath(); c.fill();
      c.restore();
      if (rnd() > 0.45) {
        c.fillStyle = ['rgba(154,140,66,0.7)', 'rgba(138,74,46,0.65)',
                       'rgba(168,176,160,0.6)'][(rnd() * 3) | 0];
        ell(c, bx + (rnd() - 0.5) * bw, byy - bh * 0.6, bw * 0.34, bh * 0.28,
            (rnd() - 0.5) * 0.8);
      }
    }
    /* one slab levered up on its edge, which is a thing a flood does */
    var lx = x + (((seed * 17) % 1) - 0.5) * r * 0.9;
    c.fillStyle = 'rgba(20,18,15,0.35)';
    ell(c, lx + r * 0.12, y - r * 0.04, r * 0.34, r * 0.10);
    c.fillStyle = '#3a3731';
    c.beginPath();
    c.moveTo(lx - r * 0.30, y - r * 0.02);
    c.lineTo(lx - r * 0.18, y - r * 0.58);
    c.lineTo(lx + r * 0.10, y - r * 0.62);
    c.lineTo(lx + r * 0.16, y - r * 0.04);
    c.closePath(); c.fill();
    c.fillStyle = '#56524a';
    c.beginPath();
    c.moveTo(lx - r * 0.26, y - r * 0.06);
    c.lineTo(lx - r * 0.16, y - r * 0.54);
    c.lineTo(lx - r * 0.01, y - r * 0.56);
    c.lineTo(lx - r * 0.04, y - r * 0.06);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(154,140,66,0.6)';
    ell(c, lx - r * 0.10, y - r * 0.40, r * 0.07, r * 0.10, 0.1);
  };

  /* =====================================================================
     THE BAMBOO GROVE - a planted thing, and the only place in the world
     that is a forest of dead straight lines.
     ===================================================================== */

  /* A bamboo culm: straight, hollow, ringed, and branching only in the top
     half. It came up out of the ground this thick and it will never get
     any thicker - a bamboo shoot is not a sapling. */
  P.bamboo = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 4001));
    var culms = [[-0.36, 0.78, 0.84], [0.32, 0.88, 0.90], [0, 1.0, 1.0]];
    var ci, i, k, h, w, cxb, lean, nodes, ny, nx, half, bw;
    shadow(c, x + 2, y, r * 0.40);
    for (ci = 0; ci < culms.length; ci++) {
      cxb = x + culms[ci][0] * r;
      h = r * 3.1 * culms[ci][1];
      w = r * 0.075 * culms[ci][2];
      lean = Math.sin(t * 0.85 + seed * 6 + ci * 2.1) * r * 0.045 + (culms[ci][0] * r * 0.10);
      /* the culm */
      c.fillStyle = '#7e8c4a';
      c.beginPath();
      c.moveTo(cxb - w, y);
      c.lineTo(cxb - w * 0.74 + lean, y - h);
      c.lineTo(cxb + w * 0.74 + lean, y - h);
      c.lineTo(cxb + w, y);
      c.closePath(); c.fill();
      c.fillStyle = '#98a862';                     // the lit side
      c.beginPath();
      c.moveTo(cxb - w, y);
      c.lineTo(cxb - w * 0.74 + lean, y - h);
      c.lineTo(cxb - w * 0.18 + lean, y - h);
      c.lineTo(cxb - w * 0.30, y);
      c.closePath(); c.fill();
      c.fillStyle = '#5e6c33';                     // the shaded side
      c.beginPath();
      c.moveTo(cxb + w * 0.42, y);
      c.lineTo(cxb + w * 0.34 + lean, y - h);
      c.lineTo(cxb + w * 0.74 + lean, y - h);
      c.lineTo(cxb + w, y);
      c.closePath(); c.fill();
      /* the nodes: a pale ring every so often, with a dark line under it */
      nodes = 7;
      for (i = 1; i <= nodes; i++) {
        var u = i / (nodes + 0.4);
        ny = y - h * u;
        nx = cxb + lean * u;
        half = w * (1 - u * 0.26);
        c.fillStyle = '#c0c884';
        c.fillRect(nx - half * 1.10, ny - h * 0.012, half * 2.20, h * 0.019);
        c.fillStyle = 'rgba(58,68,30,0.75)';
        c.fillRect(nx - half * 1.06, ny + h * 0.007, half * 2.12, h * 0.008);
        /* branches, only in the upper half, in small forked pairs */
        if (u > 0.54) {
          for (k = -1; k <= 1; k += 2) {
            bw = r * (0.30 + rnd() * 0.24);
            c.strokeStyle = '#71803f'; c.lineWidth = Math.max(0.8, r * 0.028);
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(nx + k * half, ny);
            c.quadraticCurveTo(nx + k * bw * 0.6, ny - r * 0.06,
                               nx + k * bw, ny - r * 0.16);
            c.stroke();
            /* the fan of narrow lance blades */
            for (var j = 0; j < 4; j++) {
              var a = -0.55 + j * 0.34;
              var lx = nx + k * bw, ly = ny - r * 0.16;
              c.fillStyle = (j % 2) ? '#6f8c3c' : '#88a44e';
              ell(c, lx + k * Math.cos(a) * r * 0.20, ly + Math.sin(a) * r * 0.16,
                  r * 0.20, r * 0.042, k > 0 ? a : Math.PI - a);
            }
          }
        }
      }
      /* the leafy tuft at the very top */
      c.fillStyle = '#6f8c3c';
      for (k = 0; k < 5; k++) {
        var aa = -1.5 + k * 0.62;
        ell(c, cxb + lean + Math.cos(aa) * r * 0.22, y - h + Math.sin(aa) * r * 0.16 - r * 0.04,
            r * 0.21, r * 0.045, aa * 0.6);
      }
      c.fillStyle = '#88a44e';
      ell(c, cxb + lean - r * 0.14, y - h - r * 0.10, r * 0.18, r * 0.04, -0.5);
    }
  };

  /* A new shoot. As thick as your arm and only knee-high, wrapped in furry
     brown sheaths - and it will be thirty feet tall by autumn, without ever
     getting any fatter than it is right now. */
  P.bambooShoot = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 2711));
    var i, k, u, yb, halfw, tipx;
    var h = r * 1.10, w = r * 0.50;
    shadow(c, x, y, r * 0.58);
    function widthAt(v) { return w * (1 - v * v * 0.80); }
    /* the blunt cone */
    c.fillStyle = '#8a6b42';
    c.beginPath();
    c.moveTo(x - w, y);
    for (i = 0; i <= 10; i++) { u = i / 10; c.lineTo(x - widthAt(u), y - h * u); }
    c.quadraticCurveTo(x, y - h * 1.07, x + widthAt(1), y - h);
    for (i = 10; i >= 0; i--) { u = i / 10; c.lineTo(x + widthAt(u), y - h * u); }
    c.closePath(); c.fill();
    /* the overlapping sheaths, each one pointed at the top */
    for (k = 0; k < 5; k++) {
      u = 0.05 + k * 0.185;
      yb = y - h * u;
      halfw = widthAt(u);
      tipx = x + (k % 2 ? 0.22 : -0.22) * halfw;
      c.fillStyle = (k % 2) ? '#a08051' : '#7d5f39';
      c.beginPath();
      c.moveTo(x - halfw, yb);
      c.quadraticCurveTo(x - halfw * 0.7, yb - h * 0.20, tipx, yb - h * 0.26);
      c.quadraticCurveTo(x + halfw * 0.7, yb - h * 0.20, x + halfw, yb);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(56,40,22,0.75)'; c.lineWidth = Math.max(0.8, r * 0.030);
      c.beginPath();
      c.moveTo(x - halfw, yb);
      c.quadraticCurveTo(x - halfw * 0.7, yb - h * 0.20, tipx, yb - h * 0.26);
      c.quadraticCurveTo(x + halfw * 0.7, yb - h * 0.20, x + halfw, yb);
      c.stroke();
    }
    /* the lit left face, over the lot */
    c.fillStyle = 'rgba(214,180,128,0.30)';
    c.beginPath();
    c.moveTo(x - w, y);
    for (i = 0; i <= 10; i++) { u = i / 10; c.lineTo(x - widthAt(u), y - h * u); }
    c.lineTo(x - widthAt(1) * 0.1, y - h);
    for (i = 10; i >= 0; i--) { u = i / 10; c.lineTo(x - widthAt(u) * 0.34, y - h * u); }
    c.closePath(); c.fill();
    /* dark speckles all over the sheaths */
    c.fillStyle = 'rgba(60,44,24,0.75)';
    for (i = 0; i < 16; i++) {
      u = rnd();
      ell(c, x + (rnd() - 0.5) * widthAt(u) * 1.7, y - h * u, r * 0.026, r * 0.020);
    }
    /* the first two blades, just splitting out of the top */
    c.fillStyle = '#5c7a34';
    ell(c, x - r * 0.09, y - h * 1.10, r * 0.15, r * 0.045, -1.0);
    ell(c, x + r * 0.10, y - h * 1.13, r * 0.14, r * 0.042, 1.1);
    c.fillStyle = '#6f8c3c';
    ell(c, x + r * 0.02, y - h * 1.16, r * 0.11, r * 0.035, -0.2);
    c.strokeStyle = 'rgba(206,182,140,0.7)'; c.lineWidth = Math.max(0.6, r * 0.018);
    c.lineCap = 'round';
    for (i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.08, y - h * 0.96);
      c.lineTo(x + i * r * 0.15, y - h * 1.06);
      c.stroke();
    }
    /* the litter it shoved aside on the way up */
    c.fillStyle = 'rgba(150,134,94,0.55)';
    ell(c, x, y - r * 0.02, r * 0.66, r * 0.14);
  };

  /* =====================================================================
     THE CHERRY GROVE - the prettiest place in the garden, and the one that
     is only like this for a week.
     ===================================================================== */

  /* A cherry tree. In blossom it is solid flower with no leaves at all,
     which is the trick that makes it look unreal. Out of blossom it is the
     pruned orchard tree, an open vase of limbs with the fruit hanging on
     long stalks. Pass p.bloom (or col) to choose. */
  P.cherryTree = function (c, x, y, r, t, seed, col, p) {
    var bloom = true;
    if (p && p.bloom != null) bloom = !!p.bloom;
    else if (col === false || col === 'fruit') bloom = false;
    else if (col === true || col === 'bloom') bloom = true;
    var sway = Math.sin(t * 0.7 + seed * 6) * 2.0;
    var rnd = GG.mulberry32(Math.floor(seed * 9209));
    var i, k, a, lx, ly;
    shadow(c, x + 3, y, r * 0.95);

    /* the trunk, the same in both: glossy red-brown, with the pale
       horizontal dashes that tell you it is a cherry and nothing else */
    var th = bloom ? r * 0.50 : r * 0.44;
    c.fillStyle = '#5a3a2c';
    c.beginPath();
    c.moveTo(x - r * 0.19, y);
    c.lineTo(x - r * 0.13, y - th);
    c.lineTo(x + r * 0.13, y - th);
    c.lineTo(x + r * 0.19, y);
    c.closePath(); c.fill();
    c.fillStyle = '#6b4030';
    c.fillRect(x - r * 0.11, y - th, r * 0.16, th);
    c.strokeStyle = 'rgba(196,168,142,0.85)'; c.lineWidth = Math.max(0.7, r * 0.022);
    for (i = 0; i < 3; i++) {
      var dy2 = y - th * (0.22 + i * 0.29);
      var ox2 = (i % 2) ? r * 0.02 : -r * 0.06;
      c.beginPath();
      c.moveTo(x + ox2 - r * 0.07, dy2);
      c.lineTo(x + ox2 + r * 0.05, dy2 - r * 0.005);
      c.stroke();
    }

    if (bloom) {
      /* branches spreading out almost horizontally, near black */
      c.strokeStyle = '#3a2e28'; c.lineCap = 'round'; c.lineJoin = 'round';
      for (i = -2; i <= 2; i++) {
        c.lineWidth = Math.max(1.4, r * (0.10 - Math.abs(i) * 0.015));
        c.beginPath();
        c.moveTo(x + i * r * 0.03, y - th * 0.9);
        c.quadraticCurveTo(x + i * r * 0.34, y - r * 0.80,
                           x + i * r * 0.56 + sway * 0.4, y - r * (1.02 + (2 - Math.abs(i)) * 0.14));
        c.stroke();
      }
      /* the blossom: broad, rounded, wider than tall */
      var cx = x + sway, cy = y - r * 1.10, hw = r * 1.32;
      c.fillStyle = '#d9a9bc';
      ell(c, cx - hw * 0.62, cy + r * 0.24, hw * 0.52, r * 0.34);
      ell(c, cx + hw * 0.62, cy + r * 0.24, hw * 0.52, r * 0.34);
      ell(c, cx, cy + r * 0.30, hw * 0.60, r * 0.32);
      c.fillStyle = '#e3bccb';
      ell(c, cx - hw * 0.56, cy + r * 0.06, hw * 0.50, r * 0.34);
      ell(c, cx + hw * 0.58, cy + r * 0.04, hw * 0.48, r * 0.32);
      ell(c, cx - hw * 0.08, cy + r * 0.12, hw * 0.58, r * 0.36);
      c.fillStyle = '#f0d5df';
      ell(c, cx - hw * 0.34, cy - r * 0.16, hw * 0.46, r * 0.32);
      ell(c, cx + hw * 0.36, cy - r * 0.18, hw * 0.44, r * 0.30);
      ell(c, cx + hw * 0.02, cy - r * 0.26, hw * 0.48, r * 0.32);
      c.fillStyle = '#f6e3ea';
      ell(c, cx - hw * 0.44, cy - r * 0.34, hw * 0.30, r * 0.20);
      ell(c, cx + hw * 0.10, cy - r * 0.44, hw * 0.34, r * 0.22);
      ell(c, cx + hw * 0.56, cy - r * 0.30, hw * 0.22, r * 0.15);
      /* small puffs round the rim, so the edge is flowers and not a balloon */
      for (i = 0; i < 12; i++) {
        a = Math.PI + i / 11 * Math.PI * 1.34 - 0.18;
        lx = cx + Math.cos(a) * hw * 0.92;
        ly = cy + Math.sin(a) * r * 0.50 + r * 0.06;
        c.fillStyle = (i % 3) ? '#eed0dc' : '#f6e3ea';
        ell(c, lx, ly, hw * 0.17, r * 0.15);
      }
      c.fillStyle = '#e3bccb';
      for (i = 0; i < 5; i++) {
        lx = cx + (i - 2) * hw * 0.44;
        ell(c, lx, cy + r * 0.40, hw * 0.19, r * 0.13);
      }
      /* twigs showing through, because a real bloom is not a cloud of icing */
      c.strokeStyle = 'rgba(58,46,40,0.42)'; c.lineWidth = Math.max(0.6, r * 0.015);
      for (i = 0; i < 5; i++) {
        a = 0.35 + rnd() * (Math.PI - 0.7);
        lx = cx + Math.cos(a) * hw * 0.78; ly = cy + Math.sin(a) * r * 0.40;
        c.beginPath();
        c.moveTo(lx, ly);
        c.lineTo(lx + (rnd() - 0.5) * r * 0.20, ly + rnd() * r * 0.16);
        c.stroke();
      }
      /* a few single flowers on the outside, five petals and a yellow tuft */
      for (i = 0; i < 6; i++) {
        a = rnd() * Math.PI * 2;
        lx = cx + Math.cos(a) * hw * 0.88;
        ly = cy + Math.sin(a) * r * 0.46;
        c.fillStyle = '#fdf2f6';
        for (k = 0; k < 5; k++) {
          var pa = k / 5 * Math.PI * 2 + seed;
          ell(c, lx + Math.cos(pa) * r * 0.055, ly + Math.sin(pa) * r * 0.055,
              r * 0.048, r * 0.044);
        }
        c.fillStyle = '#e8c860';
        ell(c, lx, ly, r * 0.028, r * 0.026);
      }
      /* and the petals coming down, which they do the whole time */
      for (i = 0; i < 4; i++) {
        var ph = (t * 11 + i * 37 + seed * 90) % (r * 1.5);
        var px = cx + Math.sin(t * 1.4 + i * 2.1) * r * 0.30 + (i - 1.5) * r * 0.46;
        c.fillStyle = 'rgba(246,227,234,0.92)';
        ell(c, px, cy + r * 0.40 + ph, r * 0.055, r * 0.032, Math.sin(t * 3 + i) * 1.2);
      }
    } else {
      /* the pruned fruiting tree: an open vase, kept low on purpose */
      c.fillStyle = '#7a5442';                       // the hard pruning cut
      ell(c, x, y - th, r * 0.16, r * 0.055);
      c.strokeStyle = '#3a2e28'; c.lineCap = 'round';
      for (i = -1; i <= 1; i++) {
        c.lineWidth = Math.max(1.6, r * 0.09);
        c.beginPath();
        c.moveTo(x + i * r * 0.08, y - th);
        c.quadraticCurveTo(x + i * r * 0.44, y - r * 0.9,
                           x + i * r * 0.70 + sway * 0.4, y - r * 1.20);
        c.stroke();
      }
      c.lineWidth = Math.max(1.4, r * 0.07);
      c.beginPath();
      c.moveTo(x, y - th);
      c.lineTo(x + sway * 0.4, y - r * 1.26);
      c.stroke();
      var fy = y - r * 1.22, fw = r * 1.05;
      c.fillStyle = '#3f6a2b';
      ell(c, x - fw * 0.60 + sway * 0.4, fy + r * 0.18, fw * 0.52, r * 0.32);
      ell(c, x + fw * 0.60 + sway * 0.4, fy + r * 0.16, fw * 0.50, r * 0.30);
      ell(c, x + sway * 0.4, fy - r * 0.02, fw * 0.62, r * 0.36);
      c.fillStyle = '#4e7a33';
      ell(c, x - fw * 0.36 + sway * 0.4, fy - r * 0.10, fw * 0.44, r * 0.28);
      ell(c, x + fw * 0.40 + sway * 0.4, fy - r * 0.12, fw * 0.40, r * 0.26);
      c.fillStyle = '#61933f';
      ell(c, x - fw * 0.10 + sway * 0.4, fy - r * 0.30, fw * 0.40, r * 0.24);
      ell(c, x + fw * 0.46 + sway * 0.4, fy - r * 0.26, fw * 0.22, r * 0.14);
      /* the fruit: in pairs and threes, on long stalks */
      for (i = 0; i < 6; i++) {
        var sx = x + (rnd() - 0.5) * fw * 1.7 + sway * 0.4;
        var sy = fy + r * (0.18 + rnd() * 0.20);
        var m = 2 + (rnd() > 0.6 ? 1 : 0);
        for (k = 0; k < m; k++) {
          var ox = (k - (m - 1) / 2) * r * 0.075;
          c.strokeStyle = '#41651f'; c.lineWidth = Math.max(0.7, r * 0.018);
          c.beginPath();
          c.moveTo(sx, sy + r * 0.06); c.lineTo(sx + ox, sy + r * 0.15);
          c.stroke();
          c.fillStyle = '#8e1b2c';
          ell(c, sx + ox, sy + r * 0.205, r * 0.078, r * 0.074);
          c.fillStyle = '#c4364a';
          ell(c, sx + ox - r * 0.026, sy + r * 0.185, r * 0.030, r * 0.024, -0.4);
        }
      }
    }
  };

  /* A drift of fallen petals, gathered up against the foot of a trunk and
     in the lee of things. It is only there for about a week.
     Ground layer. */
  P.petalDrift = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 1277));
    var i, a, rr, px, py, u;
    c.fillStyle = 'rgba(233,211,222,0.62)';
    c.beginPath();
    for (i = 0; i < 10; i++) {
      a = i / 10 * Math.PI * 2;
      rr = r * (0.64 + ((i * 13 + seed * 29) % 10) / 26);
      px = x + Math.cos(a) * rr; py = y + Math.sin(a) * rr * 0.44;
      if (!i) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(242,228,234,0.62)';
    ell(c, x - r * 0.14, y - r * 0.04, r * 0.50, r * 0.19, -0.1);
    /* the individual petals, thinning out and crumbling at the edges */
    for (i = 0; i < 52; i++) {
      a = rnd() * Math.PI * 2;
      u = 0.18 + rnd() * 1.05;
      px = x + Math.cos(a) * r * u;
      py = y + Math.sin(a) * r * 0.46 * u;
      c.fillStyle = rnd() > 0.45 ? 'rgba(249,232,239,0.95)' : 'rgba(222,190,206,0.95)';
      ell(c, px, py, r * 0.062, r * 0.036, rnd() * Math.PI);
    }
    /* one or two still with their yellow middle */
    c.fillStyle = 'rgba(232,200,96,0.85)';
    ell(c, x + r * 0.22, y + r * 0.10, r * 0.030, r * 0.024);
    ell(c, x - r * 0.40, y - r * 0.12, r * 0.026, r * 0.021);
  };

  /* =====================================================================
     BIRD TOWN - a meadow where the houses were put up by people, for
     birds that would not be here otherwise.
     ===================================================================== */

  /* A bluebird box on a pole, with the predator guard under it. Note what
     is NOT on it: there is no perch below the hole, and that is deliberate,
     because a perch is an invitation to a house sparrow. */
  P.nestBox = function (c, x, y, r, t, seed) {
    var i;
    shadow(c, x + 1, y, r * 0.30);
    /* the pole */
    c.fillStyle = '#8e9298';
    c.fillRect(x - r * 0.055, y - r * 2.02, r * 0.11, r * 2.02);
    c.fillStyle = '#b0b4b8';
    c.fillRect(x - r * 0.055, y - r * 2.02, r * 0.040, r * 2.02);
    /* the predator guard: a smooth cone nothing can climb past */
    c.fillStyle = '#a9adaf';
    c.beginPath();
    c.moveTo(x - r * 0.42, y - r * 0.86);
    c.lineTo(x, y - r * 1.24);
    c.lineTo(x + r * 0.42, y - r * 0.86);
    c.closePath(); c.fill();
    c.fillStyle = '#c6cacb';
    c.beginPath();
    c.moveTo(x - r * 0.42, y - r * 0.86);
    c.lineTo(x, y - r * 1.24);
    c.lineTo(x - r * 0.04, y - r * 0.88);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(70,78,80,0.35)';
    ell(c, x, y - r * 0.86, r * 0.42, r * 0.09);
    /* the box: untreated wood gone silver-grey */
    var bx = x - r * 0.36, by = y - r * 2.06, bw = r * 0.72, bh = r * 0.86;
    c.fillStyle = '#948f86';
    c.fillRect(bx, by, bw, bh);
    c.fillStyle = '#a8a49a';
    c.fillRect(bx, by, bw * 0.66, bh);
    c.fillStyle = '#bdb9ae';
    c.fillRect(bx, by, bw * 0.16, bh);
    c.strokeStyle = 'rgba(96,92,84,0.55)'; c.lineWidth = 1;
    for (i = 1; i < 3; i++) {
      c.beginPath();
      c.moveTo(bx + bw * i / 3, by + bh * 0.06);
      c.lineTo(bx + bw * i / 3, by + bh);
      c.stroke();
    }
    /* the side that swings open when you check it, and its pivot nail */
    c.strokeStyle = 'rgba(80,76,68,0.75)'; c.lineWidth = Math.max(0.8, r * 0.025);
    c.beginPath();
    c.moveTo(bx + bw * 0.74, by); c.lineTo(bx + bw * 0.74, by + bh);
    c.stroke();
    c.fillStyle = '#6d6961';
    ell(c, bx + bw * 0.87, by + bh * 0.24, r * 0.030, r * 0.030);
    /* the roof, overhanging front and back so the rain misses the hole */
    c.fillStyle = '#7f7a71';
    c.beginPath();
    c.moveTo(bx - r * 0.13, by + r * 0.06);
    c.lineTo(bx + bw * 0.5, by - r * 0.17);
    c.lineTo(bx + bw + r * 0.13, by + r * 0.06);
    c.lineTo(bx + bw + r * 0.13, by + r * 0.15);
    c.lineTo(bx - r * 0.13, by + r * 0.15);
    c.closePath(); c.fill();
    c.fillStyle = '#9a958b';
    c.beginPath();
    c.moveTo(bx - r * 0.13, by + r * 0.06);
    c.lineTo(bx + bw * 0.5, by - r * 0.17);
    c.lineTo(bx + bw * 0.5, by - r * 0.08);
    c.lineTo(bx - r * 0.13, by + r * 0.13);
    c.closePath(); c.fill();
    /* the hole, and nothing at all underneath it */
    c.fillStyle = '#241f1a';
    ell(c, bx + bw * 0.46, by + bh * 0.33, r * 0.115, r * 0.115);
    c.fillStyle = 'rgba(255,255,255,0.14)';
    ell(c, bx + bw * 0.46, by + bh * 0.28, r * 0.095, r * 0.030);
    /* the drainage holes in the floor */
    c.fillStyle = 'rgba(60,56,50,0.7)';
    ell(c, bx + bw * 0.28, by + bh * 0.95, r * 0.026, r * 0.020);
    ell(c, bx + bw * 0.62, by + bh * 0.95, r * 0.026, r * 0.020);
  };

  /* A bird bath. Shallow on purpose - a bird wants to stand in it, not
     swim in it. */
  P.birdBath = function (c, x, y, r, t, seed) {
    var ripple = (Math.sin(t * 1.3 + seed * 8) * 0.5 + 0.5);
    var i;
    shadow(c, x + 1, y, r * 0.66);
    /* the plinth and the pedestal */
    c.fillStyle = '#9a948a';
    ell(c, x, y - r * 0.04, r * 0.44, r * 0.16);
    c.fillStyle = '#b3ada1';
    c.beginPath();
    c.moveTo(x - r * 0.26, y - r * 0.02);
    c.lineTo(x - r * 0.16, y - r * 0.88);
    c.lineTo(x + r * 0.16, y - r * 0.88);
    c.lineTo(x + r * 0.26, y - r * 0.02);
    c.closePath(); c.fill();
    c.fillStyle = '#c6c0b4';
    c.beginPath();
    c.moveTo(x - r * 0.26, y - r * 0.02);
    c.lineTo(x - r * 0.16, y - r * 0.88);
    c.lineTo(x - r * 0.05, y - r * 0.88);
    c.lineTo(x - r * 0.11, y - r * 0.02);
    c.closePath(); c.fill();
    c.fillStyle = '#8e887d';
    c.beginPath();
    c.moveTo(x + r * 0.09, y - r * 0.02);
    c.lineTo(x + r * 0.11, y - r * 0.88);
    c.lineTo(x + r * 0.16, y - r * 0.88);
    c.lineTo(x + r * 0.26, y - r * 0.02);
    c.closePath(); c.fill();
    /* the basin: wide, and no deeper than a bird's knee */
    c.fillStyle = '#8e887d';
    ell(c, x, y - r * 0.82, r * 0.96, r * 0.34);
    c.fillStyle = '#c6c0b4';
    ell(c, x, y - r * 0.90, r * 0.96, r * 0.34);
    c.fillStyle = '#a49e92';
    ell(c, x, y - r * 0.90, r * 0.80, r * 0.26);
    /* the water */
    c.fillStyle = '#7ba3ae';
    ell(c, x, y - r * 0.895, r * 0.72, r * 0.225);
    c.fillStyle = 'rgba(206,232,236,0.55)';
    ell(c, x - r * 0.22, y - r * 0.94, r * 0.26, r * 0.070, -0.12);
    c.strokeStyle = 'rgba(232,246,248,0.45)'; c.lineWidth = Math.max(0.7, r * 0.025);
    for (i = 0; i < 2; i++) {
      var rr = r * (0.16 + i * 0.20 + ripple * 0.14);
      c.beginPath();
      c.ellipse(x + r * 0.12, y - r * 0.885, rr, rr * 0.31, 0, 0, Math.PI * 2);
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.32)';
    ell(c, x - r * 0.62, y - r * 0.925, r * 0.22, r * 0.055, -0.1);
  };

  /* A pole feeder: the crook, the tube of seed, and the small change
     underneath where the sparrows and the ground-feeders clear up. */
  P.feederPole = function (c, x, y, r, t, seed) {
    var swing = Math.sin(t * 1.0 + seed * 7) * 0.05;
    var i;
    shadow(c, x + 1, y, r * 0.44);
    /* the pole, and the shepherd's crook at the top */
    c.strokeStyle = '#4a4a46'; c.lineWidth = Math.max(1.6, r * 0.075);
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - r * 1.92);
    c.quadraticCurveTo(x, y - r * 2.16, x + r * 0.34, y - r * 2.14);
    c.stroke();
    c.strokeStyle = '#75756e'; c.lineWidth = Math.max(0.7, r * 0.026);
    c.beginPath();
    c.moveTo(x - r * 0.020, y - r * 0.2);
    c.lineTo(x - r * 0.020, y - r * 1.88);
    c.stroke();
    /* the hanger */
    var fx = x + r * 0.34 + swing * r, fy = y - r * 2.10;
    c.strokeStyle = '#4a4a46'; c.lineWidth = Math.max(1, r * 0.03);
    c.beginPath(); c.moveTo(x + r * 0.34, y - r * 2.13); c.lineTo(fx, fy + r * 0.10); c.stroke();
    /* the tube */
    c.fillStyle = '#6b7a52';                             // the cap
    GG.roundRect(c, fx - r * 0.24, fy + r * 0.06, r * 0.48, r * 0.14, r * 0.05); c.fill();
    c.fillStyle = '#cdd6d0';                             // the clear tube
    GG.roundRect(c, fx - r * 0.19, fy + r * 0.18, r * 0.38, r * 0.86, r * 0.08); c.fill();
    c.fillStyle = '#c8a85e';                             // the seed inside
    GG.roundRect(c, fx - r * 0.155, fy + r * 0.40, r * 0.31, r * 0.62, r * 0.06); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)';
    GG.roundRect(c, fx - r * 0.165, fy + r * 0.20, r * 0.09, r * 0.80, r * 0.04); c.fill();
    c.fillStyle = '#6b7a52';                             // the base tray
    GG.roundRect(c, fx - r * 0.28, fy + r * 1.00, r * 0.56, r * 0.13, r * 0.05); c.fill();
    /* the ports, and the perches - which a feeder does want */
    c.fillStyle = '#2f2a24';
    for (i = 0; i < 2; i++) {
      ell(c, fx + (i ? r * 0.10 : -r * 0.10), fy + r * (0.56 + i * 0.28), r * 0.045, r * 0.042);
    }
    c.strokeStyle = '#4a4a46'; c.lineWidth = Math.max(0.8, r * 0.025);
    for (i = 0; i < 2; i++) {
      var py = fy + r * (0.60 + i * 0.28);
      c.beginPath();
      c.moveTo(fx + (i ? r * 0.10 : -r * 0.10), py);
      c.lineTo(fx + (i ? r * 0.34 : -r * 0.34), py);
      c.stroke();
    }
    /* spilled seed at the foot of the pole */
    var rnd = GG.mulberry32(Math.floor(seed * 3313));
    for (i = 0; i < 9; i++) {
      c.fillStyle = rnd() > 0.5 ? 'rgba(200,168,94,0.9)' : 'rgba(150,124,70,0.9)';
      ell(c, x + (rnd() - 0.5) * r * 1.0, y + (rnd() - 0.5) * r * 0.22,
          r * 0.030, r * 0.022, rnd() * 3);
    }
  };

  /* =====================================================================
     THE BIRD FARM - irrigated crop country with a dozen hens in it, not a
     storybook barnyard.
     ===================================================================== */

  /* The coop and its run. The truest detail here is the hard line where the
     wire is: bare scratched dirt inside it, and grass right up to the
     outside. Chickens do that in about a week. */
  P.coop = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 7013));
    var i, px;
    /* the scratched-out dirt inside the run */
    c.fillStyle = 'rgba(146,124,88,0.92)';
    ell(c, x + r * 0.78, y - r * 0.04, r * 0.90, r * 0.30);
    c.fillStyle = 'rgba(120,100,70,0.45)';
    ell(c, x + r * 0.58, y - r * 0.02, r * 0.30, r * 0.10, 0.2);
    shadow(c, x + 2, y, r * 0.82);
    /* the coop: a shed the size of a garden shed */
    var bw = r * 0.82, bh = r * 0.92;
    c.fillStyle = '#a4977c';
    c.fillRect(x - bw, y - bh, bw * 1.7, bh);
    c.fillStyle = '#b6a98c';
    c.fillRect(x - bw, y - bh, bw * 0.7, bh);
    c.strokeStyle = 'rgba(112,98,74,0.55)'; c.lineWidth = 1;
    for (i = 1; i < 6; i++) {
      px = x - bw + i * bw * 1.7 / 6;
      c.beginPath(); c.moveTo(px, y - bh); c.lineTo(px, y); c.stroke();
    }
    /* the mono-pitch corrugated roof, sloping and overhanging */
    c.fillStyle = '#8a9490';
    c.beginPath();
    c.moveTo(x - bw * 1.14, y - bh * 0.90);
    c.lineTo(x + bw * 0.86, y - bh * 1.20);
    c.lineTo(x + bw * 0.86, y - bh * 1.09);
    c.lineTo(x - bw * 1.14, y - bh * 0.79);
    c.closePath(); c.fill();
    c.fillStyle = '#9ea7a3';
    c.beginPath();
    c.moveTo(x - bw * 1.14, y - bh * 0.90);
    c.lineTo(x + bw * 0.86, y - bh * 1.20);
    c.lineTo(x + bw * 0.86, y - bh * 1.15);
    c.lineTo(x - bw * 1.14, y - bh * 0.85);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(96,108,104,0.5)'; c.lineWidth = 1;
    for (i = 1; i < 7; i++) {
      var u = i / 7;
      c.beginPath();
      c.moveTo(x - bw * 1.14 + u * bw * 2.0, y - bh * 0.90 - u * bh * 0.30);
      c.lineTo(x - bw * 1.14 + u * bw * 2.0, y - bh * 0.79 - u * bh * 0.30);
      c.stroke();
    }
    /* the pop-hole and its little ramp with cleats */
    c.fillStyle = '#8b7a5e';
    GG.roundRect(c, x - bw * 0.30, y - bh * 0.40, bw * 0.30, bh * 0.36, bw * 0.05); c.fill();
    c.fillStyle = '#241f18';
    GG.roundRect(c, x - bw * 0.27, y - bh * 0.37, bw * 0.24, bh * 0.33, bw * 0.04); c.fill();
    c.fillStyle = '#a08a63';
    c.beginPath();
    c.moveTo(x - bw * 0.26, y - bh * 0.06);
    c.lineTo(x + bw * 0.44, y + bh * 0.05);
    c.lineTo(x + bw * 0.44, y + bh * 0.12);
    c.lineTo(x - bw * 0.26, y + bh * 0.01);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(96,78,52,0.7)'; c.lineWidth = Math.max(0.7, r * 0.02);
    for (i = 1; i < 4; i++) {
      var v = i / 4;
      c.beginPath();
      c.moveTo(x - bw * 0.26 + v * bw * 0.70, y - bh * 0.06 + v * bh * 0.11);
      c.lineTo(x - bw * 0.26 + v * bw * 0.70, y + bh * 0.01 + v * bh * 0.11);
      c.stroke();
    }
    /* the nest-box bump on the end, with its lid */
    c.fillStyle = '#9a8d73';
    c.fillRect(x + bw * 0.70, y - bh * 0.78, bw * 0.36, bh * 0.44);
    c.fillStyle = '#7e7258';
    c.fillRect(x + bw * 0.66, y - bh * 0.82, bw * 0.44, bh * 0.08);
    /* the run: posts and wire, and the hard line at the bottom of it */
    c.strokeStyle = '#8a7f66'; c.lineWidth = Math.max(1.1, r * 0.045);
    for (i = 0; i < 3; i++) {
      px = x + bw * (0.9 + i * 0.68);
      c.beginPath(); c.moveTo(px, y + r * 0.02); c.lineTo(px, y - r * 0.74); c.stroke();
    }
    c.strokeStyle = 'rgba(146,152,142,0.55)'; c.lineWidth = Math.max(0.6, r * 0.018);
    for (i = 0; i < 9; i++) {
      px = x + bw * 0.9 + i * (bw * 1.36 / 8);
      c.beginPath(); c.moveTo(px, y + r * 0.02); c.lineTo(px, y - r * 0.72); c.stroke();
    }
    for (i = 0; i < 5; i++) {
      var wy = y + r * 0.02 - i * r * 0.185;
      c.beginPath();
      c.moveTo(x + bw * 0.9, wy); c.lineTo(x + bw * 2.26, wy); c.stroke();
    }
    c.strokeStyle = '#8a7f66'; c.lineWidth = Math.max(0.9, r * 0.032);
    c.beginPath();
    c.moveTo(x + bw * 0.9, y - r * 0.74); c.lineTo(x + bw * 2.26, y - r * 0.74);
    c.stroke();
    /* a couple of feathers in the dirt */
    c.fillStyle = 'rgba(238,230,214,0.8)';
    for (i = 0; i < 3; i++) {
      ell(c, x + r * (0.5 + rnd() * 1.0), y + (rnd() - 0.5) * r * 0.22,
          r * 0.085, r * 0.030, (rnd() - 0.5) * 2.4);
    }
  };

  /* A straw bale. Straw is the stalk left over after the grain has gone,
     which is why it is pale and hollow and hay is not. */
  P.strawBale = function (c, x, y, r, t, seed) {
    var stacked = ((seed * 23) % 1) > 0.55;
    var rnd = GG.mulberry32(Math.floor(seed * 4177));
    var i;
    shadow(c, x + 1, y, r * 1.0);
    function bale(bx, by, bw, bh) {
      var k;
      c.fillStyle = '#c4a95c';                       // the front, cut ends out
      c.fillRect(bx - bw, by - bh, bw * 2, bh);
      c.fillStyle = '#d8bd6e';
      c.fillRect(bx - bw, by - bh, bw * 1.15, bh);
      c.fillStyle = '#e8d089';                       // the top face
      c.beginPath();
      c.moveTo(bx - bw, by - bh);
      c.lineTo(bx - bw * 0.80, by - bh - bw * 0.28);
      c.lineTo(bx + bw * 1.20, by - bh - bw * 0.28);
      c.lineTo(bx + bw, by - bh);
      c.closePath(); c.fill();
      c.fillStyle = '#b39a52';                       // the shaded end
      c.beginPath();
      c.moveTo(bx + bw, by - bh);
      c.lineTo(bx + bw * 1.20, by - bh - bw * 0.28);
      c.lineTo(bx + bw * 1.20, by - bw * 0.28);
      c.lineTo(bx + bw, by);
      c.closePath(); c.fill();
      /* the sawn-off look of a thousand cut stalks */
      c.strokeStyle = 'rgba(150,126,62,0.5)'; c.lineWidth = Math.max(0.6, r * 0.018);
      for (k = 0; k < 11; k++) {
        var sx = bx - bw + rnd() * bw * 2;
        var sy = by - bh + rnd() * bh * 0.9;
        c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (rnd() - 0.5) * r * 0.06, sy + bh * 0.18);
        c.stroke();
      }
      /* the two baling strings */
      c.strokeStyle = 'rgba(232,226,204,0.9)'; c.lineWidth = Math.max(0.8, r * 0.026);
      for (k = -1; k <= 1; k += 2) {
        c.beginPath();
        c.moveTo(bx + k * bw * 0.44, by - bh);
        c.lineTo(bx + k * bw * 0.44, by);
        c.moveTo(bx + k * bw * 0.44, by - bh);
        c.lineTo(bx + k * bw * 0.44 + bw * 0.20, by - bh - bw * 0.28);
        c.stroke();
      }
      /* wisps sticking out, so it is not a cardboard box */
      c.strokeStyle = 'rgba(224,200,132,0.9)'; c.lineWidth = Math.max(0.6, r * 0.018);
      for (k = 0; k < 6; k++) {
        var wx = bx - bw + rnd() * bw * 2, wy = by - bh - bw * 0.28 + rnd() * bw * 0.2;
        c.beginPath();
        c.moveTo(wx, wy);
        c.lineTo(wx + (rnd() - 0.5) * r * 0.24, wy - r * (0.05 + rnd() * 0.10));
        c.stroke();
      }
    }
    bale(x, y, r * 0.78, r * 0.56);
    if (stacked) bale(x + r * 0.10, y - r * 0.60, r * 0.70, r * 0.50);
  };

  /* A galvanised stock trough. The mud round it is not everywhere - it is
     exactly where the animals stand, which is on one side of it. */
  P.trough = function (c, x, y, r, t, seed) {
    var i, a;
    /* the churned mud, on the near side where they put their feet */
    c.fillStyle = 'rgba(110,95,73,0.85)';
    ell(c, x + r * 0.06, y + r * 0.10, r * 1.30, r * 0.36);
    c.fillStyle = 'rgba(88,74,56,0.55)';
    ell(c, x - r * 0.30, y + r * 0.16, r * 0.46, r * 0.14, 0.1);
    ell(c, x + r * 0.42, y + r * 0.12, r * 0.34, r * 0.11, -0.2);
    shadow(c, x + 1, y, r * 0.92);
    /* the body */
    c.fillStyle = '#8b9597';
    c.beginPath();
    c.moveTo(x - r, y - r * 0.74);
    c.lineTo(x - r * 0.94, y - r * 0.12);
    c.quadraticCurveTo(x, y + r * 0.22, x + r * 0.94, y - r * 0.12);
    c.lineTo(x + r, y - r * 0.74);
    c.closePath(); c.fill();
    /* the corrugations */
    for (i = -4; i <= 4; i++) {
      c.fillStyle = (i % 2) ? '#9aa4a6' : '#7b8587';
      c.fillRect(x + i * r * 0.20 - r * 0.09, y - r * 0.74, r * 0.18,
                 r * 0.84 - Math.abs(i) * r * 0.048);
    }
    c.fillStyle = 'rgba(255,255,255,0.16)';
    c.fillRect(x - r * 0.92, y - r * 0.74, r * 0.34, r * 0.66);
    c.fillStyle = 'rgba(40,52,52,0.35)';
    c.beginPath();
    c.moveTo(x - r * 0.94, y - r * 0.16);
    c.quadraticCurveTo(x, y + r * 0.20, x + r * 0.94, y - r * 0.16);
    c.quadraticCurveTo(x, y + r * 0.06, x - r * 0.94, y - r * 0.16);
    c.fill();
    /* the rim, and the water sitting in it */
    c.fillStyle = '#b6c0c1';
    ell(c, x, y - r * 0.74, r, r * 0.34);
    c.fillStyle = '#8b9597';
    ell(c, x, y - r * 0.72, r * 0.88, r * 0.28);
    c.fillStyle = '#4a5a50';
    ell(c, x, y - r * 0.71, r * 0.82, r * 0.255);
    c.fillStyle = 'rgba(160,190,178,0.35)';
    ell(c, x - r * 0.22, y - r * 0.77, r * 0.34, r * 0.075, -0.1);
    c.strokeStyle = 'rgba(206,220,216,0.5)'; c.lineWidth = Math.max(0.7, r * 0.025);
    c.beginPath();
    c.ellipse(x, y - r * 0.71, r * 0.82, r * 0.255, 0, 0, Math.PI * 2);
    c.stroke();
    /* the bright waterline ring the galvanising goes at */
    c.fillStyle = 'rgba(226,234,234,0.55)';
    ell(c, x, y - r * 0.74, r * 0.97, r * 0.31);
    c.fillStyle = '#4a5a50';
    ell(c, x, y - r * 0.71, r * 0.82, r * 0.255);
    c.fillStyle = 'rgba(178,206,196,0.30)';
    ell(c, x - r * 0.24, y - r * 0.78, r * 0.30, r * 0.065, -0.12);
    /* the float valve on one end */
    c.fillStyle = '#6f7a78';
    c.fillRect(x + r * 0.62, y - r * 0.98, r * 0.09, r * 0.24);
    c.fillStyle = '#b8bcb4';
    ell(c, x + r * 0.52, y - r * 0.74, r * 0.11, r * 0.085);
    c.fillStyle = 'rgba(255,255,255,0.4)';
    ell(c, x + r * 0.49, y - r * 0.77, r * 0.043, r * 0.030);
  };

  /* The fence line: weathered posts and four strands of wire, running off
     to the horizon. It is the most useful thing in bird town, because a
     bluebird hunts by sitting on a wire and then dropping on things. */
  P.farmFence = function (c, x, y, r, t, seed) {
    var rnd = GG.mulberry32(Math.floor(seed * 8419));
    var hw = r * 1.9;
    var i, k, px, ph;
    shadow(c, x + 1, y, r * 0.40);
    /* the wires first, so the posts sit in front of them */
    for (i = 0; i < 4; i++) {
      var wy = y - r * (0.42 + i * 0.30);
      c.strokeStyle = i === 3 ? 'rgba(168,172,168,0.9)' : 'rgba(146,150,146,0.9)';
      c.lineWidth = Math.max(0.8, r * 0.026);
      c.beginPath();
      c.moveTo(x - hw, wy);
      c.quadraticCurveTo(x - r * 0.55, wy + r * 0.07, x - r * 0.10, wy);
      c.quadraticCurveTo(x + r * 0.7, wy + r * 0.08, x + hw, wy - r * 0.02);
      c.stroke();
      /* barbs, a few of them, on two of the strands */
      if (i === 1 || i === 3) {
        c.lineWidth = Math.max(0.6, r * 0.018);
        for (k = -2; k <= 2; k++) {
          px = x + k * r * 0.62 + (rnd() - 0.5) * r * 0.1;
          var by2 = wy + (px < x - r * 0.1 ? r * 0.05 : r * 0.05);
          c.beginPath();
          c.moveTo(px - r * 0.035, by2 - r * 0.035);
          c.lineTo(px + r * 0.035, by2 + r * 0.035);
          c.moveTo(px - r * 0.035, by2 + r * 0.035);
          c.lineTo(px + r * 0.035, by2 - r * 0.035);
          c.stroke();
        }
      }
    }
    /* two posts: the near one, and one further along the line */
    for (i = 0; i < 2; i++) {
      px = x + (i ? r * 1.32 : 0);
      ph = r * (i ? 1.30 : 1.52);
      var w = r * (i ? 0.09 : 0.12);
      c.fillStyle = '#7d7059';
      c.beginPath();
      c.moveTo(px - w, y);
      c.lineTo(px - w * 0.86, y - ph);
      c.lineTo(px + w * 0.86, y - ph);
      c.lineTo(px + w, y);
      c.closePath(); c.fill();
      c.fillStyle = '#968869';
      c.fillRect(px - w, y - ph, w * 0.80, ph);
      c.fillStyle = '#5f553f';
      c.fillRect(px + w * 0.44, y - ph, w * 0.56, ph);
      c.fillStyle = '#a89a7a';                       // the sawn top
      ell(c, px, y - ph, w, w * 0.34);
      /* grey weathering cracks down the post */
      c.strokeStyle = 'rgba(60,52,38,0.45)'; c.lineWidth = Math.max(0.6, r * 0.016);
      for (k = 0; k < 2; k++) {
        var cx2 = px - w * 0.4 + k * w * 0.7;
        c.beginPath();
        c.moveTo(cx2, y - ph * 0.9);
        c.quadraticCurveTo(cx2 + (rnd() - 0.5) * r * 0.05, y - ph * 0.5, cx2, y - ph * 0.12);
        c.stroke();
      }
      /* the staples holding each wire on */
      c.fillStyle = '#5a5a52';
      for (k = 0; k < 4; k++) {
        ell(c, px + w * 0.5, y - r * (0.42 + k * 0.30), r * 0.022, r * 0.026);
      }
    }
    /* a tuft of grass the mower never reaches at the foot of the post */
    c.strokeStyle = 'rgba(160,150,96,0.85)'; c.lineWidth = Math.max(0.8, r * 0.028);
    c.lineCap = 'round';
    for (i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.06, y);
      c.quadraticCurveTo(x + i * r * 0.14, y - r * 0.16, x + i * r * 0.22, y - r * 0.26);
      c.stroke();
    }
  };

  /* The mouth of the lava tube, up on the ridge. A tube is a pipe, so the
     opening is a lopsided arch in a low basalt face, not a cathedral door. */
  P.caveMouth = function (c, x, y, r, t, seed) {
    shadow(c, x + 2, y, r * 1.0);
    /* the rock face */
    c.fillStyle = '#4a443e';
    c.beginPath();
    c.moveTo(x - r * 1.05, y);
    c.lineTo(x - r * 0.92, y - r * 0.86);
    c.lineTo(x - r * 0.3, y - r * 1.16);
    c.lineTo(x + r * 0.46, y - r * 1.08);
    c.lineTo(x + r * 1.0, y - r * 0.7);
    c.lineTo(x + r * 1.1, y);
    c.closePath(); c.fill();
    c.fillStyle = '#5a534b';
    c.beginPath();
    c.moveTo(x - r * 0.92, y - r * 0.86);
    c.lineTo(x - r * 0.3, y - r * 1.16);
    c.lineTo(x + r * 0.2, y - r * 0.9);
    c.lineTo(x - r * 0.5, y - r * 0.72);
    c.closePath(); c.fill();
    /* the opening, and it really is black in there */
    c.fillStyle = '#100e0d';
    c.beginPath();
    c.moveTo(x - r * 0.46, y);
    c.quadraticCurveTo(x - r * 0.5, y - r * 0.68, x + r * 0.04, y - r * 0.76);
    c.quadraticCurveTo(x + r * 0.5, y - r * 0.62, x + r * 0.42, y);
    c.closePath(); c.fill();
    /* blunt lavacicle drips round the top of the arch */
    c.fillStyle = '#1c1917';
    for (var i = -2; i <= 2; i++) {
      var lx = x + i * r * 0.16, ly = y - r * (0.70 - Math.abs(i) * 0.05);
      c.beginPath();
      c.moveTo(lx - r * 0.05, ly);
      c.quadraticCurveTo(lx, ly + r * 0.13, lx + r * 0.05, ly);
      c.closePath(); c.fill();
    }
    /* orange-brown glaze where the rock was baked, and a little grey lichen */
    c.fillStyle = 'rgba(138,79,46,0.45)';
    ell(c, x - r * 0.62, y - r * 0.4, r * 0.18, r * 0.1, -0.3);
    ell(c, x + r * 0.66, y - r * 0.32, r * 0.15, r * 0.09, 0.25);
    c.fillStyle = 'rgba(182,178,166,0.5)';
    ell(c, x + r * 0.34, y - r * 0.92, r * 0.16, r * 0.08, 0.2);
  };

  /* A boot brush at the cave mouth. People carry the white-nose fungus into
     caves on their boots, so wiping them is the thing that opens the door. */
  P.bootBrush = function (c, x, y, r, t, seed, col, p) {
    shadow(c, x + 1, y, r * 0.6);
    c.fillStyle = '#6b563c';
    GG.roundRect(c, x - r * 0.62, y - r * 0.22, r * 1.24, r * 0.24, r * 0.05); c.fill();
    c.fillStyle = '#8a7048';
    GG.roundRect(c, x - r * 0.56, y - r * 0.26, r * 1.12, r * 0.07, r * 0.03); c.fill();
    /* the bristles */
    c.strokeStyle = (p && p.used) ? '#3e4a2c' : '#2f3a24';
    c.lineWidth = Math.max(1, r * 0.06); c.lineCap = 'round';
    for (var i = -5; i <= 5; i++) {
      var bx = x + i * r * 0.1;
      c.beginPath();
      c.moveTo(bx, y - r * 0.26);
      c.lineTo(bx + (i % 2 ? 1 : -1) * r * 0.02, y - r * 0.44);
      c.stroke();
    }
    /* a little sign on a post */
    c.fillStyle = '#7a6142';
    c.fillRect(x + r * 0.52, y - r * 0.9, r * 0.09, r * 0.9);
    c.fillStyle = '#d9c9a4';
    GG.roundRect(c, x + r * 0.2, y - r * 1.24, r * 0.74, r * 0.4, r * 0.06); c.fill();
    c.fillStyle = '#5d4a33';
    for (var k = 0; k < 3; k++) c.fillRect(x + r * 0.28, y - r * 1.14 + k * r * 0.1, r * 0.56, r * 0.04);
  };

  GG.Props = P;
})(window.GG = window.GG || {});
