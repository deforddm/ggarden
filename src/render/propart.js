/* Trees, flowers, rocks, the house - all drawn with code.
   Props are drawn with their BASE at (x, y), growing upward. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); c.fill();
  }
  function shadow(c, x, y, rx) {
    c.fillStyle = 'rgba(30,60,25,0.16)';
    ell(c, x, y, rx, rx * 0.38);
  }

  var P = {};

  P.tree = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.8 + seed * 6) * 2.2;
    shadow(c, x + 2, y, r * 0.72);
    c.fillStyle = '#6b4a2c';
    c.beginPath();
    c.moveTo(x - r * 0.17, y);
    c.lineTo(x - r * 0.12 + sway * 0.4, y - r * 0.95);
    c.lineTo(x + r * 0.12 + sway * 0.4, y - r * 0.95);
    c.lineTo(x + r * 0.17, y);
    c.closePath(); c.fill();
    var cy = y - r * 1.18, cx = x + sway;
    c.fillStyle = '#2f6b32';
    ell(c, cx - r * 0.46, cy + r * 0.20, r * 0.62, r * 0.56);
    ell(c, cx + r * 0.46, cy + r * 0.20, r * 0.62, r * 0.56);
    ell(c, cx, cy - r * 0.22, r * 0.74, r * 0.66);
    c.fillStyle = '#3d8a3e';
    ell(c, cx - r * 0.34, cy + r * 0.06, r * 0.5, r * 0.44);
    ell(c, cx + r * 0.40, cy + r * 0.02, r * 0.46, r * 0.42);
    ell(c, cx - r * 0.05, cy - r * 0.34, r * 0.58, r * 0.5);
    c.fillStyle = '#54a84c';
    ell(c, cx - r * 0.22, cy - r * 0.30, r * 0.34, r * 0.28);
    ell(c, cx + r * 0.26, cy - r * 0.12, r * 0.28, r * 0.24);
  };

  P.pine = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.7 + seed * 5) * 1.6;
    shadow(c, x + 2, y, r * 0.55);
    c.fillStyle = '#6b4a2c';
    c.fillRect(x - r * 0.11, y - r * 0.5, r * 0.22, r * 0.5);
    for (var i = 0; i < 3; i++) {
      var w = r * (0.82 - i * 0.20), yy = y - r * (0.35 + i * 0.55), h = r * 0.82;
      c.fillStyle = i === 2 ? '#2f6b46' : (i === 1 ? '#2a6440' : '#255a39');
      c.beginPath();
      c.moveTo(x + sway * (i + 1) * 0.4, yy - h);
      c.lineTo(x - w, yy); c.lineTo(x + w, yy);
      c.closePath(); c.fill();
    }
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
    shadow(c, x + 1, y, r * 0.85);
    c.fillStyle = '#33783a';
    ell(c, x - r * 0.42, y - r * 0.36, r * 0.6, r * 0.48);
    ell(c, x + r * 0.42, y - r * 0.36, r * 0.6, r * 0.48);
    ell(c, x, y - r * 0.6, r * 0.68, r * 0.56);
    c.fillStyle = '#47954a';
    ell(c, x - r * 0.2, y - r * 0.62, r * 0.42, r * 0.34);
    ell(c, x + r * 0.28, y - r * 0.46, r * 0.34, r * 0.28);
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
    shadow(c, x + 1, y, r * 0.9);
    c.fillStyle = '#9a9a96';
    c.beginPath();
    c.moveTo(x - r, y);
    c.lineTo(x - r * 0.72, y - r * 0.72);
    c.lineTo(x - r * 0.1, y - r * 0.95);
    c.lineTo(x + r * 0.62, y - r * 0.68);
    c.lineTo(x + r, y);
    c.closePath(); c.fill();
    c.fillStyle = '#b6b6b0';
    c.beginPath();
    c.moveTo(x - r * 0.62, y - r * 0.6);
    c.lineTo(x - r * 0.1, y - r * 0.88);
    c.lineTo(x + r * 0.3, y - r * 0.55);
    c.lineTo(x - r * 0.2, y - r * 0.4);
    c.closePath(); c.fill();
  };

  P.flower = function (c, x, y, r, t, seed, col) {
    var sway = Math.sin(t * 1.6 + seed * 8) * 1.2;
    c.strokeStyle = '#3f8a3a'; c.lineWidth = Math.max(1, r * 0.14); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * 0.4, y - r * 0.8, x + sway, y - r * 1.3); c.stroke();
    var cx = x + sway, cy = y - r * 1.3;
    c.fillStyle = col;
    for (var i = 0; i < 5; i++) {
      var a = i * Math.PI * 2 / 5 + seed;
      ell(c, cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, r * 0.42, r * 0.42);
    }
    c.fillStyle = '#ffd94a'; ell(c, cx, cy, r * 0.34, r * 0.34);
  };

  P.tulip = function (c, x, y, r, t, seed, col) {
    var sway = Math.sin(t * 1.4 + seed * 8) * 1.1;
    c.strokeStyle = '#3f8a3a'; c.lineWidth = Math.max(1, r * 0.16);
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * 0.4, y - r, x + sway, y - r * 1.5); c.stroke();
    c.fillStyle = '#4aa04a';
    ell(c, x - r * 0.5 + sway * 0.2, y - r * 0.6, r * 0.5, r * 0.2, -0.5);
    var cx = x + sway, cy = y - r * 1.62;
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(cx - r * 0.5, cy + r * 0.2);
    c.quadraticCurveTo(cx - r * 0.55, cy - r * 0.6, cx, cy - r * 0.8);
    c.quadraticCurveTo(cx + r * 0.55, cy - r * 0.6, cx + r * 0.5, cy + r * 0.2);
    c.quadraticCurveTo(cx, cy + r * 0.55, cx - r * 0.5, cy + r * 0.2);
    c.fill();
    c.fillStyle = GG.shade(col, -0.18);
    c.beginPath(); c.moveTo(cx, cy - r * 0.8); c.quadraticCurveTo(cx - r * 0.2, cy - r * 0.1, cx, cy + r * 0.35);
    c.quadraticCurveTo(cx + r * 0.2, cy - r * 0.1, cx, cy - r * 0.8); c.fill();
  };

  P.grassTuft = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.9 + seed * 11) * 1.6;
    c.strokeStyle = 'rgba(70,140,60,0.85)'; c.lineWidth = Math.max(1, r * 0.16); c.lineCap = 'round';
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.2, y);
      c.quadraticCurveTo(x + i * r * 0.35 + sway * 0.4, y - r * 0.7, x + i * r * 0.55 + sway, y - r * 1.1);
      c.stroke();
    }
  };

  P.mushroom = function (c, x, y, r, t, seed) {
    c.fillStyle = '#efe6d2';
    c.fillRect(x - r * 0.18, y - r * 0.7, r * 0.36, r * 0.7);
    c.fillStyle = '#d3453f';
    c.beginPath(); c.ellipse(x, y - r * 0.7, r * 0.62, r * 0.48, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#ffe9d6';
    ell(c, x - r * 0.26, y - r * 0.86, r * 0.12, r * 0.1);
    ell(c, x + r * 0.22, y - r * 0.94, r * 0.1, r * 0.09);
  };

  P.log = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 1.1);
    c.fillStyle = '#7a5533';
    GG.roundRect(c, x - r, y - r * 0.62, r * 2, r * 0.68, r * 0.3); c.fill();
    c.fillStyle = '#96683d';
    ell(c, x - r * 0.95, y - r * 0.3, r * 0.22, r * 0.34);
    c.fillStyle = '#b9855a';
    ell(c, x - r * 0.95, y - r * 0.3, r * 0.12, r * 0.2);
  };

  P.stump = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 0.95);
    c.fillStyle = '#7a5533';
    GG.roundRect(c, x - r * 0.7, y - r * 0.85, r * 1.4, r * 0.9, r * 0.18); c.fill();
    c.fillStyle = '#a9764a'; ell(c, x, y - r * 0.85, r * 0.7, r * 0.28);
    c.strokeStyle = '#7a5533'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(x, y - r * 0.85, r * 0.4, r * 0.16, 0, 0, Math.PI * 2); c.stroke();
  };

  P.reed = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 1.5 + seed * 9) * 2;
    c.strokeStyle = '#4f8a4a'; c.lineWidth = Math.max(1.2, r * 0.14); c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x + i * r * 0.3, y);
      c.quadraticCurveTo(x + i * r * 0.4 + sway * 0.5, y - r, x + i * r * 0.5 + sway, y - r * 1.7);
      c.stroke();
      if (i === 0) {
        c.fillStyle = '#8a5f33';
        ell(c, x + sway, y - r * 1.85, r * 0.13, r * 0.34);
      }
    }
  };

  P.lilypad = function (c, x, y, r, t, seed) {
    var bob = Math.sin(t * 1.1 + seed * 7) * 1.2;
    c.fillStyle = '#3f9350';
    c.beginPath();
    c.ellipse(x + bob * 0.4, y + bob * 0.2, r, r * 0.82, seed * 3, 0.42, Math.PI * 2 + 0.1);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,70,30,0.25)'; c.lineWidth = 1;
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
    c.fillStyle = '#c9a878';
    c.fillRect(x - r * 0.12, y - r * 1.1, r * 0.24, r * 1.1);
    c.fillRect(x - r, y - r * 0.9, r * 2, r * 0.16);
    c.fillRect(x - r, y - r * 0.5, r * 2, r * 0.16);
    c.fillStyle = '#a88a5e';
    c.beginPath();
    c.moveTo(x - r * 0.12, y - r * 1.1); c.lineTo(x, y - r * 1.3); c.lineTo(x + r * 0.12, y - r * 1.1);
    c.closePath(); c.fill();
  };

  P.sign = function (c, x, y, r, t, seed, label) {
    c.fillStyle = '#9a7247';
    c.fillRect(x - r * 0.1, y - r * 1.1, r * 0.2, r * 1.1);
    c.fillStyle = '#d9b982';
    GG.roundRect(c, x - r * 0.9, y - r * 1.9, r * 1.8, r * 0.9, r * 0.12); c.fill();
    c.strokeStyle = '#9a7247'; c.lineWidth = 1.5; c.stroke();
    if (label) {
      c.fillStyle = '#5b432a';
      c.font = 'bold ' + Math.round(r * 0.36) + 'px "Trebuchet MS", sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(label, x, y - r * 1.45);
    }
  };

  P.beehive = function (c, x, y, r, t, seed) {
    shadow(c, x, y, r * 0.7);
    c.fillStyle = '#d9a648';
    for (var i = 0; i < 3; i++) ell(c, x, y - r * (0.3 + i * 0.42), r * (0.72 - i * 0.1), r * 0.26);
    c.fillStyle = '#7a5a25'; ell(c, x, y - r * 0.35, r * 0.16, r * 0.12);
  };

  /* The player's house: front door faces down (south). */
  P.house = function (c, x, y, w, t) {
    var h = w * 0.72;
    c.fillStyle = 'rgba(30,60,25,0.18)';
    ell(c, x, y, w * 0.55, w * 0.14);
    c.fillStyle = '#f4e7cf';
    GG.roundRect(c, x - w / 2, y - h, w, h, 6); c.fill();
    c.strokeStyle = '#cbb794'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#c9564f';
    c.beginPath();
    c.moveTo(x - w * 0.60, y - h);
    c.lineTo(x, y - h - w * 0.46);
    c.lineTo(x + w * 0.60, y - h);
    c.closePath(); c.fill();
    c.fillStyle = '#a8433d';
    c.beginPath();
    c.moveTo(x - w * 0.60, y - h); c.lineTo(x, y - h - w * 0.46);
    c.lineTo(x, y - h + w * 0.02); c.closePath(); c.fill();
    c.fillStyle = '#8a6039';
    GG.roundRect(c, x - w * 0.14, y - h * 0.66, w * 0.28, h * 0.66, 4); c.fill();
    c.fillStyle = '#ffd88a'; ell(c, x + w * 0.08, y - h * 0.32, w * 0.022, w * 0.022);
    c.fillStyle = '#9fd6f0';
    GG.roundRect(c, x - w * 0.40, y - h * 0.78, w * 0.20, w * 0.18, 3); c.fill();
    GG.roundRect(c, x + w * 0.20, y - h * 0.78, w * 0.20, w * 0.18, 3); c.fill();
    c.strokeStyle = '#e8dcc2'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x - w * 0.30, y - h * 0.78); c.lineTo(x - w * 0.30, y - h * 0.78 + w * 0.18);
    c.moveTo(x + w * 0.30, y - h * 0.78); c.lineTo(x + w * 0.30, y - h * 0.78 + w * 0.18);
    c.stroke();
    c.fillStyle = '#7fb06a';
    GG.roundRect(c, x - w * 0.24, y - 6, w * 0.48, 8, 3); c.fill();
  };

  /* ---------- the river, the beach and the tidepools ---------- */

  P.willow = function (c, x, y, r, t, seed) {
    var sway = Math.sin(t * 0.7 + seed * 6) * 3.2;
    shadow(c, x + 2, y, r * 0.66);
    c.fillStyle = '#6a5233';
    c.beginPath();
    c.moveTo(x - r * 0.16, y);
    c.lineTo(x - r * 0.10 + sway * 0.3, y - r * 0.86);
    c.lineTo(x + r * 0.12 + sway * 0.3, y - r * 0.86);
    c.lineTo(x + r * 0.18, y);
    c.closePath(); c.fill();
    var cx = x + sway, cy = y - r * 1.02;
    c.fillStyle = '#4d7f38';
    ell(c, cx, cy - r * 0.16, r * 0.86, r * 0.5);
    c.fillStyle = '#6ea247';
    ell(c, cx - r * 0.34, cy - r * 0.26, r * 0.44, r * 0.32);
    ell(c, cx + r * 0.36, cy - r * 0.22, r * 0.40, r * 0.30);
    /* the trailing curtain of leaves */
    c.strokeStyle = '#79ad4c'; c.lineWidth = Math.max(1.1, r * 0.055); c.lineCap = 'round';
    for (var i = -4; i <= 4; i++) {
      var bx = cx + i * r * 0.19;
      var len = r * (0.62 + 0.34 * Math.cos(i * 0.55)) + Math.sin(seed * 9 + i) * r * 0.1;
      var dr = sway * 0.6 + Math.sin(t * 1.1 + i * 0.8 + seed * 4) * 2.2;
      c.beginPath();
      c.moveTo(bx, cy + r * 0.08);
      c.quadraticCurveTo(bx + dr * 0.5, cy + len * 0.6, bx + dr, cy + len);
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

  GG.Props = P;
})(window.GG = window.GG || {});
