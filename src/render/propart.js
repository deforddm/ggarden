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

  P.appleTree = function (c, x, y, r, t, seed) {
    P.tree(c, x, y, r, t, seed);
    var cx = x + Math.sin(t * 0.8 + seed * 6) * 2.2, cy = y - r * 1.18;
    c.fillStyle = '#e0413c';
    var rnd = GG.mulberry32(Math.floor(seed * 9999));
    for (var i = 0; i < 5; i++) {
      ell(c, cx + (rnd() - 0.5) * r * 1.2, cy + (rnd() - 0.3) * r * 0.9, r * 0.11, r * 0.11);
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

  P.berryBush = function (c, x, y, r, t, seed) {
    P.bush(c, x, y, r, t, seed);
    var rnd = GG.mulberry32(Math.floor(seed * 7777));
    c.fillStyle = '#b6407e';
    for (var i = 0; i < 6; i++) ell(c, x + (rnd() - 0.5) * r * 1.5, y - r * (0.2 + rnd() * 0.7), r * 0.1, r * 0.1);
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

  GG.Props = P;
})(window.GG = window.GG || {});
