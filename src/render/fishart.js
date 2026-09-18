/* Every fish is drawn with code too. Shapes face RIGHT, centred on (0,0),
   about 44 pixels long at scale 1. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); c.fill();
  }

  function eye(c, x, y, r, accent) {
    c.fillStyle = '#f6f4ec'; ell(c, x, y, r, r);
    c.fillStyle = '#22252a'; ell(c, x + r * 0.18, y, r * 0.56, r * 0.56);
    c.fillStyle = '#ffffff'; ell(c, x + r * 0.4, y - r * 0.35, r * 0.2, r * 0.2);
  }

  function mouth(c, x, y, w, col) {
    c.strokeStyle = col; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - w * 0.5, y + 1.4, x - w, y + 0.6); c.stroke();
  }

  /* Tail fin. `type`: fork, fan, round, long */
  function tail(c, x, a, wag, type, depth) {
    c.fillStyle = a.fin;
    c.save();
    c.translate(x, 0);
    c.rotate(wag * 0.35);
    c.beginPath();
    if (type === 'fork') {
      c.moveTo(2, 0);
      c.lineTo(-11, -depth); c.lineTo(-6, 0); c.lineTo(-11, depth);
    } else if (type === 'fan') {
      c.moveTo(2, 0);
      c.lineTo(-12, -depth * 1.1); c.lineTo(-9, 0); c.lineTo(-12, depth * 1.1);
    } else if (type === 'long') {
      c.moveTo(2, 0);
      c.lineTo(-17, -depth * 1.25); c.lineTo(-9, 0); c.lineTo(-17, depth * 1.25);
    } else {
      c.moveTo(2, 0);
      c.quadraticCurveTo(-12, -depth, -9, 0);
      c.quadraticCurveTo(-12, depth, 2, 0);
    }
    c.closePath(); c.fill();
    c.restore();
  }

  function pattern(c, a, L, D) {
    var p = a.pattern;
    if (p === 'bars') {
      c.fillStyle = a.accent; c.globalAlpha = 0.55;
      for (var i = -2; i <= 2; i++) ell(c, i * L * 0.26, -D * 0.1, L * 0.055, D * 0.72);
      c.globalAlpha = 1;
    } else if (p === 'stripe') {
      c.fillStyle = a.accent; c.globalAlpha = 0.6;
      c.beginPath();
      c.moveTo(-L * 0.85, 1);
      for (var x = -L * 0.85; x < L * 0.8; x += 4) c.lineTo(x, 1 + Math.sin(x * 0.35) * 1.6);
      c.lineTo(L * 0.8, 4); c.lineTo(-L * 0.85, 4);
      c.closePath(); c.fill();
      c.globalAlpha = 1;
    } else if (p === 'speckle') {
      c.fillStyle = a.accent;
      var rnd = GG.mulberry32(77);
      for (var s = 0; s < 22; s++) {
        ell(c, (rnd() - 0.5) * L * 1.7, (rnd() - 0.55) * D * 1.5, 1.1, 1.1);
      }
    } else if (p === 'spots') {
      c.fillStyle = a.accent;
      var r2 = GG.mulberry32(31);
      for (var k = 0; k < 10; k++) ell(c, (r2() - 0.5) * L * 1.5, (r2() - 0.5) * D * 1.3, 1.5, 1.5);
    } else if (p === 'worm') {
      c.strokeStyle = a.accent; c.lineWidth = 1.2; c.lineCap = 'round';
      for (var w = 0; w < 6; w++) {
        var wx = -L * 0.7 + w * L * 0.26;
        c.beginPath();
        c.moveTo(wx, -D * 0.72);
        c.quadraticCurveTo(wx + 3, -D * 0.5, wx - 1, -D * 0.3);
        c.stroke();
      }
      c.fillStyle = '#e0533f';
      var r3 = GG.mulberry32(13);
      for (var d = 0; d < 7; d++) ell(c, (r3() - 0.5) * L * 1.4, (r3() - 0.2) * D * 0.8, 1.3, 1.3);
    } else if (p === 'dashes') {
      c.fillStyle = a.accent;
      for (var q = 0; q < 12; q++) {
        ell(c, -L * 0.85 + (q % 6) * L * 0.3, (q < 6 ? -1 : 1) * D * 0.32, L * 0.09, 1.5);
      }
    } else if (p === 'scales') {
      c.strokeStyle = a.accent; c.lineWidth = 0.7; c.globalAlpha = 0.6;
      for (var sy = -1; sy <= 1; sy++) {
        for (var sx = -4; sx <= 3; sx++) {
          c.beginPath();
          c.arc(sx * L * 0.2, sy * D * 0.42, 3.2, -1.1, 1.1);
          c.stroke();
        }
      }
      c.globalAlpha = 1;
    } else if (p === 'koi') {
      c.fillStyle = a.accent;
      c.beginPath(); c.ellipse(-L * 0.35, -D * 0.2, L * 0.3, D * 0.55, 0.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(L * 0.42, -D * 0.15, L * 0.22, D * 0.45, -0.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2b2b33';
      c.beginPath(); c.ellipse(L * 0.02, D * 0.3, L * 0.16, D * 0.26, 0.3, 0, Math.PI * 2); c.fill();
    } else if (p === 'line') {
      c.fillStyle = a.accent; c.globalAlpha = 0.6;
      ell(c, 0, 0, L * 0.8, D * 0.12);
      c.globalAlpha = 1;
    } else if (p === 'wavy') {
      c.strokeStyle = a.accent; c.globalAlpha = 0.6; c.lineWidth = 1.2;
      for (var wv = -5; wv <= 4; wv++) {
        c.beginPath();
        c.moveTo(wv * L * 0.18, -D * 0.95);
        c.quadraticCurveTo(wv * L * 0.18 + 2.4, -D * 0.5, wv * L * 0.18 - 1, -D * 0.06);
        c.stroke();
      }
      c.globalAlpha = 1;
    } else if (p === 'mottle') {
      c.fillStyle = a.accent; c.globalAlpha = 0.35;
      var r4 = GG.mulberry32(5);
      for (var m = 0; m < 8; m++) ell(c, (r4() - 0.5) * L * 1.6, (r4() - 0.5) * D * 1.2, 3.5, 2.4);
      c.globalAlpha = 1;
    } else if (p === 'scutes') {
      c.fillStyle = a.accent;
      for (var z = -4; z <= 3; z++) {
        c.beginPath();
        c.moveTo(z * L * 0.22, -D * 0.95);
        c.lineTo(z * L * 0.22 + 3, -D * 0.7);
        c.lineTo(z * L * 0.22 - 3, -D * 0.7);
        c.closePath(); c.fill();
      }
      c.globalAlpha = 0.7;
      for (var z2 = -4; z2 <= 2; z2++) ell(c, z2 * L * 0.24, D * 0.55, 2, 1.3);
      c.globalAlpha = 1;
    }
  }

  /* A standard fish: belly, back, fins, pattern, eye. */
  function standard(c, a, t, opt) {
    var L = opt.L, D = opt.D;
    var wag = Math.sin(t * 5);
    tail(c, -L - 2, a, wag, opt.tail || 'fork', opt.tailD || D * 1.1);

    // dorsal + lower fins
    c.fillStyle = a.fin;
    c.beginPath();
    c.moveTo(-L * 0.35, -D * 0.7);
    c.quadraticCurveTo(-L * 0.1, -D * (opt.dorsal || 1.9), L * 0.3, -D * 0.75);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(-L * 0.3, D * 0.65);
    c.quadraticCurveTo(-L * 0.1, D * 1.5, L * 0.15, D * 0.7);
    c.closePath(); c.fill();

    // body
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(L, 0);
    c.bezierCurveTo(L * 0.55, -D, -L * 0.5, -D * (opt.hump || 1), -L, -D * 0.22);
    c.bezierCurveTo(-L * 1.05, 0, -L * 1.05, 0, -L, D * 0.22);
    c.bezierCurveTo(-L * 0.5, D * (opt.hump || 1), L * 0.55, D * 0.86, L, 0);
    c.closePath(); c.fill();

    // belly
    c.save();
    c.beginPath();
    c.moveTo(L, 0);
    c.bezierCurveTo(L * 0.55, -D, -L * 0.5, -D * (opt.hump || 1), -L, -D * 0.22);
    c.bezierCurveTo(-L * 1.05, 0, -L * 1.05, 0, -L, D * 0.22);
    c.bezierCurveTo(-L * 0.5, D * (opt.hump || 1), L * 0.55, D * 0.86, L, 0);
    c.closePath(); c.clip();
    c.fillStyle = a.belly;
    ell(c, -L * 0.05, D * 0.72, L * 1.05, D * 0.62);
    pattern(c, a, L, D);
    c.restore();

    // side fin
    c.fillStyle = a.fin;
    c.beginPath();
    c.moveTo(L * 0.3, D * 0.1);
    c.quadraticCurveTo(L * 0.05, D * 0.85, L * 0.32, D * 0.55);
    c.closePath(); c.fill();

    eye(c, L * 0.62, -D * 0.28, opt.eye || 2.6);
    mouth(c, L * 0.97, D * 0.06, opt.mouth || 5, '#2b2b33');
  }

  var S = {};

  S.minnow = function (c, a, t) { standard(c, a, t, { L: 15, D: 4.6, tail: 'fork', eye: 2, mouth: 3, dorsal: 1.6 }); };

  S.sunfish = function (c, a, t) {
    standard(c, a, t, { L: 17, D: 11.5, tail: 'fan', tailD: 9, hump: 1.02, dorsal: 1.25, eye: 2.8, mouth: 4 });
    // dark ear flap at the back of the gill cover
    c.fillStyle = a.accent;
    ell(c, 3.4, -2.6, 2.4, 3.1, -0.25);
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(6.5, -8); c.quadraticCurveTo(4, 0, 6.5, 8); c.stroke();
  };

  S.torpedo = function (c, a, t) { standard(c, a, t, { L: 22, D: 7.6, tail: 'fork', dorsal: 1.8, eye: 2.6, mouth: 6 }); };

  S.goldfish = function (c, a, t) {
    standard(c, a, t, { L: 14, D: 9, tail: 'long', tailD: 7.5, hump: 1.05, dorsal: 1.7, eye: 3, mouth: 4 });
  };

  S.carp = function (c, a, t) {
    standard(c, a, t, { L: 22, D: 10.5, tail: 'fork', tailD: 10, hump: 1.02, dorsal: 1.5, eye: 2.6, mouth: 6 });
    // barbels
    c.strokeStyle = a.fin; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(20.5, 1.5); c.quadraticCurveTo(25, 3, 25.5, 6.5); c.stroke();
    c.beginPath(); c.moveTo(19.5, 3); c.quadraticCurveTo(23, 6, 22.5, 9); c.stroke();
  };

  S.catfish = function (c, a, t) {
    standard(c, a, t, { L: 21, D: 8, tail: 'round', tailD: 8, hump: 0.85, dorsal: 1.7, eye: 2.1, mouth: 8 });
    c.strokeStyle = a.fin; c.lineWidth = 1.2; c.lineCap = 'round';
    [[-0.4, 5.5], [0.4, 8], [1.2, 10]].forEach(function (p) {
      c.beginPath();
      c.moveTo(19, p[0] + 1);
      c.quadraticCurveTo(26, p[0] + p[1] * 0.5, 27, p[1]);
      c.stroke();
      c.beginPath();
      c.moveTo(19, p[0] - 2);
      c.quadraticCurveTo(26, -p[0] - p[1] * 0.4, 26, -p[1] * 0.7);
      c.stroke();
    });
  };

  S.pike = function (c, a, t) {
    var L = 26, D = 6.4;
    var wag = Math.sin(t * 4.5);
    tail(c, -L - 2, a, wag, 'fork', D * 1.3);
    c.fillStyle = a.fin;
    c.beginPath();
    c.moveTo(-L * 0.72, -D * 0.7);
    c.quadraticCurveTo(-L * 0.5, -D * 2.2, -L * 0.2, -D * 0.8);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(-L * 0.68, D * 0.7); c.quadraticCurveTo(-L * 0.45, D * 2, -L * 0.2, D * 0.8);
    c.closePath(); c.fill();
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(L, 1.2);
    c.lineTo(L * 0.62, -D * 0.42);
    c.bezierCurveTo(L * 0.2, -D, -L * 0.55, -D * 0.95, -L, -D * 0.2);
    c.bezierCurveTo(-L * 1.05, 0, -L * 1.05, 0, -L, D * 0.2);
    c.bezierCurveTo(-L * 0.55, D * 0.95, L * 0.2, D * 0.9, L * 0.6, D * 0.5);
    c.closePath(); c.fill();
    c.save();
    c.beginPath();
    c.moveTo(L, 1.2); c.lineTo(L * 0.62, -D * 0.42);
    c.bezierCurveTo(L * 0.2, -D, -L * 0.55, -D * 0.95, -L, -D * 0.2);
    c.bezierCurveTo(-L * 1.05, 0, -L * 1.05, 0, -L, D * 0.2);
    c.bezierCurveTo(-L * 0.55, D * 0.95, L * 0.2, D * 0.9, L * 0.6, D * 0.5);
    c.closePath(); c.clip();
    c.fillStyle = a.belly; ell(c, -L * 0.1, D * 0.8, L * 1.05, D * 0.6);
    pattern(c, a, L, D);
    c.restore();
    c.strokeStyle = '#2b2b33'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(L * 1.0, 1.4); c.lineTo(L * 0.58, 2.2); c.stroke();
    eye(c, L * 0.52, -D * 0.35, 2.4);
  };

  S.sturgeon = function (c, a, t) {
    var L = 28, D = 6.2;
    var wag = Math.sin(t * 3.4);
    // upper lobe of the tail is longer, like a shark
    c.fillStyle = a.fin;
    c.save(); c.translate(-L - 2, 0); c.rotate(wag * 0.3);
    c.beginPath();
    c.moveTo(2, 0); c.lineTo(-13, -D * 1.7); c.lineTo(-8, -D * 0.2);
    c.lineTo(-11, D * 1.0); c.closePath(); c.fill();
    c.restore();
    c.beginPath();
    c.moveTo(-L * 0.6, -D * 0.8); c.quadraticCurveTo(-L * 0.42, -D * 2, -L * 0.16, -D * 0.85);
    c.closePath(); c.fill();
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(L, -1);
    c.lineTo(L * 0.55, -D * 0.55);
    c.bezierCurveTo(L * 0.1, -D * 1.05, -L * 0.55, -D, -L, -D * 0.22);
    c.bezierCurveTo(-L * 1.04, 0, -L * 1.04, 0, -L, D * 0.22);
    c.bezierCurveTo(-L * 0.55, D, L * 0.1, D * 0.95, L * 0.55, D * 0.5);
    c.lineTo(L, 1.4);
    c.closePath(); c.fill();
    c.save();
    c.beginPath();
    c.moveTo(L, -1); c.lineTo(L * 0.55, -D * 0.55);
    c.bezierCurveTo(L * 0.1, -D * 1.05, -L * 0.55, -D, -L, -D * 0.22);
    c.bezierCurveTo(-L * 1.04, 0, -L * 1.04, 0, -L, D * 0.22);
    c.bezierCurveTo(-L * 0.55, D, L * 0.1, D * 0.95, L * 0.55, D * 0.5);
    c.lineTo(L, 1.4); c.closePath(); c.clip();
    c.fillStyle = a.belly; ell(c, -L * 0.1, D * 0.85, L * 1.05, D * 0.55);
    pattern(c, a, L, D);
    c.restore();
    // barbels under the pointed snout
    c.strokeStyle = a.fin; c.lineWidth = 1; c.lineCap = 'round';
    for (var i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(L * 0.72 + i * 2, D * 0.16);
      c.lineTo(L * 0.68 + i * 2, D * 0.75);
      c.stroke();
    }
    c.fillStyle = '#2b2b33';
    ell(c, L * 0.86, D * 0.28, 2.2, 0.9);
    eye(c, L * 0.42, -D * 0.4, 2.1);
  };

  /* ---- things that are not fish ---- */
  S.boot = function (c) {
    c.fillStyle = '#5b4a3a';
    c.beginPath();
    c.moveTo(-8, -14); c.lineTo(6, -14); c.lineTo(7, 4); c.lineTo(16, 6);
    c.quadraticCurveTo(20, 8, 19, 12); c.lineTo(-9, 12);
    c.quadraticCurveTo(-12, 6, -9, -2);
    c.closePath(); c.fill();
    c.fillStyle = '#3f3227'; c.fillRect(-10, 10, 30, 4);
    c.fillStyle = '#7a6550'; c.fillRect(-8, -14, 14, 4);
    c.strokeStyle = '#9a8468'; c.lineWidth = 1.2;
    for (var i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(-6, -9 + i * 4); c.lineTo(4, -11 + i * 4); c.stroke();
    }
  };
  S.can = function (c) {
    c.fillStyle = '#9aa3a8';
    GG.roundRect(c, -12, -8, 24, 18, 3); c.fill();
    c.fillStyle = '#b7bfc4'; ell(c, 0, -8, 12, 3.6);
    c.fillStyle = '#c85a3f'; c.fillRect(-12, -3, 24, 7);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-9, -6, 3, 14);
    c.strokeStyle = '#7d868b'; c.lineWidth = 1;
    c.beginPath(); c.arc(0, -8, 7, 0, Math.PI * 2); c.stroke();
  };
  S.news = function (c) {
    c.fillStyle = '#e6e2d4';
    c.beginPath();
    c.moveTo(-14, -9); c.quadraticCurveTo(0, -13, 14, -8);
    c.lineTo(13, 10); c.quadraticCurveTo(0, 14, -13, 9);
    c.closePath(); c.fill();
    c.strokeStyle = '#b9b3a2'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#a8a293';
    for (var i = 0; i < 5; i++) c.fillRect(-10, -5 + i * 3.4, 20 - (i % 2) * 6, 1.6);
    c.fillStyle = '#8a8474'; c.fillRect(-10, -8, 14, 2.4);
  };

  /* Bugs and fish are drawn by different modules; this picks the right one. */
  /* ---------- the stream, the inlet and the open sea ---------- */

  S.sculpin = function (c, a, t) {
    standard(c, a, t, { L: 15, D: 5.6, tail: 'fan', tailD: 5.6, hump: 0.72, dorsal: 1.5, eye: 2.4, mouth: 7 });
    /* the big fanned-out side fins it props itself up on */
    c.fillStyle = a.fin; c.globalAlpha = 0.9;
    c.beginPath();
    c.moveTo(4, 1.4);
    c.quadraticCurveTo(-1, 9.6, -6.5, 6.6);
    c.quadraticCurveTo(-1.5, 4.4, 2.5, 2.6);
    c.closePath(); c.fill();
    c.globalAlpha = 1;
    /* the wide flat head */
    c.fillStyle = a.back;
    ell(c, 10, -0.6, 6.2, 5);
    c.fillStyle = a.accent; c.globalAlpha = 0.4;
    ell(c, 7, 2, 3.4, 1.8, 0.2); ell(c, 1, -2.4, 3, 1.7, -0.3);
    c.globalAlpha = 1;
    eye(c, 11.4, -2.8, 2.3);
    mouth(c, 15.4, 1.4, 7, '#2b2b33');
  };

  S.cod = function (c, a, t) {
    standard(c, a, t, { L: 22, D: 8.4, tail: 'fan', tailD: 7.4, hump: 0.94, dorsal: 1.5, eye: 2.6, mouth: 6 });
    /* the pale lateral line that curves over the shoulder */
    c.strokeStyle = '#f4f2e4'; c.globalAlpha = 0.8; c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-19, -1.4); c.quadraticCurveTo(0, -5.4, 17, -2);
    c.stroke(); c.globalAlpha = 1;
    /* the little chin whisker */
    c.strokeStyle = a.fin; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(20.4, 2.6); c.quadraticCurveTo(21.6, 6, 20, 8); c.stroke();
    /* three dorsal fins, the cod's giveaway */
    c.fillStyle = a.fin;
    [[-13, 5], [-2, 5.4], [9, 4.6]].forEach(function (d) {
      c.beginPath();
      c.moveTo(d[0] - 4, -7);
      c.quadraticCurveTo(d[0], -7 - d[1], d[0] + 4, -7);
      c.closePath(); c.fill();
    });
  };

  S.salmon = function (c, a, t) {
    standard(c, a, t, { L: 24, D: 8, tail: 'fork', tailD: 9.5, hump: 0.98, dorsal: 1.7, eye: 2.4, mouth: 8 });
    /* the pink flush along the flank */
    c.fillStyle = '#e88a86'; c.globalAlpha = 0.34;
    ell(c, -1, 1.4, 17, 4.2);
    c.globalAlpha = 1;
    /* the little fatty fin salmon and trout both have */
    c.fillStyle = a.fin;
    ell(c, -16, -5.6, 2.4, 1.4, -0.2);
    /* the hooked jaw of a spawning male */
    c.strokeStyle = a.accent; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(21, 1.6); c.quadraticCurveTo(26.5, 2.4, 25.5, -1.6);
    c.stroke();
  };

  S.eel = function (c, a, t) {
    var wag = Math.sin(t * 3.2);
    /* one long ribbon of a body */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(24, 0);
    for (var i = 24; i >= -24; i -= 4) {
      var d = 1.4 + 2.4 * Math.max(0, 1 - Math.abs(i + 4) / 30);
      c.lineTo(i, Math.sin(i * 0.16 + t * 3.2) * (2.6 * (1 - (i + 24) / 52)) - d);
    }
    for (var j = -24; j <= 24; j += 4) {
      var d2 = 1.4 + 2.4 * Math.max(0, 1 - Math.abs(j + 4) / 30);
      c.lineTo(j, Math.sin(j * 0.16 + t * 3.2) * (2.6 * (1 - (j + 24) / 52)) + d2);
    }
    c.closePath(); c.fill();
    /* the fin running all along the back and round the tail */
    c.strokeStyle = a.fin; c.lineWidth = 1.6; c.globalAlpha = 0.85;
    c.beginPath();
    for (var k = 14; k >= -25; k -= 3) {
      var y = Math.sin(k * 0.16 + t * 3.2) * (2.6 * (1 - (k + 24) / 52)) - 3.4;
      if (k === 14) c.moveTo(k, y); else c.lineTo(k, y);
    }
    c.stroke(); c.globalAlpha = 1;
    /* the pale belly */
    c.fillStyle = a.belly; c.globalAlpha = 0.6;
    c.beginPath();
    for (var m = 22; m >= -22; m -= 4) {
      var yy = Math.sin(m * 0.16 + t * 3.2) * (2.6 * (1 - (m + 24) / 52));
      if (m === 22) c.moveTo(m, yy + 0.6); else c.lineTo(m, yy + 0.6);
    }
    for (var n = -22; n <= 22; n += 4) {
      var y2 = Math.sin(n * 0.16 + t * 3.2) * (2.6 * (1 - (n + 24) / 52));
      var dd = 1.2 + 2 * Math.max(0, 1 - Math.abs(n + 4) / 30);
      c.lineTo(n, y2 + dd);
    }
    c.closePath(); c.fill(); c.globalAlpha = 1;
    eye(c, 19.5, Math.sin(19.5 * 0.16 + t * 3.2) * 0.4 - 1.4, 1.9);
    mouth(c, 24, Math.sin(24 * 0.16 + t * 3.2) * 0.4 + 0.6, 6, '#22221a');
    void wag;
  };

  S.flatfish = function (c, a, t) {
    var ripple = Math.sin(t * 2.6);
    /* seen from above: a wide oval with a frill all round */
    c.fillStyle = a.fin;
    c.beginPath();
    for (var i = 0; i <= 44; i++) {
      var ang = i / 44 * Math.PI * 2;
      var rx = 21 + Math.sin(ang * 6 + ripple) * 1.4;
      var ry = 13.5 + Math.sin(ang * 6 + ripple) * 1.4;
      var x = Math.cos(ang) * rx, y = Math.sin(ang) * ry;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath(); c.fill();
    c.fillStyle = a.back;
    ell(c, -0.5, 0, 18.5, 11.4);
    c.save();
    c.beginPath(); c.ellipse(-0.5, 0, 18.5, 11.4, 0, 0, Math.PI * 2); c.clip();
    c.fillStyle = a.belly; c.globalAlpha = 0.3;
    ell(c, 4, 4.4, 13, 6.4);
    c.globalAlpha = 1;
    if (a.pattern === 'spots') {
      c.fillStyle = a.accent; c.globalAlpha = 0.55;
      var r = GG.mulberry32(9);
      for (var s2 = 0; s2 < 11; s2++) {
        var px = (r() - 0.5) * 32, py = (r() - 0.5) * 19;
        ell(c, px, py, 2.2, 2);
        c.globalAlpha = 0.28;
        ell(c, px, py, 3.4, 3.1);
        c.globalAlpha = 0.55;
      }
      c.globalAlpha = 1;
    } else {
      c.fillStyle = a.accent; c.globalAlpha = 0.3;
      var r2 = GG.mulberry32(4);
      for (var m = 0; m < 12; m++) ell(c, (r2() - 0.5) * 34, (r2() - 0.5) * 20, 3.6, 2.6);
      c.globalAlpha = 1;
    }
    c.restore();
    /* both eyes on the same side, up at the head end */
    eye(c, 12.5, -3.6, 2.5);
    eye(c, 12, 2.2, 2.3);
    mouth(c, 18.4, 0.4, 6, '#2b2b33');
  };

  S.seacrab = function (c, a, t) {
    var step = Math.sin(t * 4);
    /* seen from above, facing right */
    c.strokeStyle = GG.shade(a.back, -0.2); c.lineWidth = 1.7; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      for (var i = 0; i < 3; i++) {
        var xx = -2 + i * 4.4;
        var k = Math.sin(t * 4 + i * 1.5 + (s2 > 0 ? 0 : 1.8)) * 1.6;
        c.beginPath();
        c.moveTo(xx, s2 * 6);
        c.quadraticCurveTo(xx - 2 + k, s2 * 11, xx - 5 + k, s2 * 14);
        c.stroke();
      }
      /* the paddle legs at the back */
      c.beginPath();
      c.moveTo(-9, s2 * 5.4);
      c.quadraticCurveTo(-14, s2 * 9, -17, s2 * 12);
      c.stroke();
      c.fillStyle = GG.shade(a.back, 0.1);
      ell(c, -18, s2 * 13.4, 3.6, 1.9, s2 * 0.7);
      /* the claw arms */
      c.strokeStyle = GG.shade(a.back, -0.15); c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(6, s2 * 5);
      c.quadraticCurveTo(13, s2 * 8, 17, s2 * 5.6 + step * s2);
      c.stroke();
      c.strokeStyle = GG.shade(a.back, -0.2); c.lineWidth = 1.7;
    }
    /* the claws */
    for (var g = -1; g <= 1; g += 2) {
      c.save(); c.translate(18.5, g * 5 + step * g); c.rotate(g * 0.3);
      c.fillStyle = GG.shade(a.back, 0.05); ell(c, 0, 0, 4.4, 2.6);
      c.fillStyle = a.accent; ell(c, 3, g * -0.6, 2.2, 1.2, g * 0.4);
      c.restore();
    }
    /* the wide shell, points at each side */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(11, 0);
    c.quadraticCurveTo(9, -6.4, 0, -7.6);
    c.lineTo(-14, -9.4);
    c.quadraticCurveTo(-11, 0, -14, 9.4);
    c.lineTo(0, 7.6);
    c.quadraticCurveTo(9, 6.4, 11, 0);
    c.closePath(); c.fill();
    c.fillStyle = a.belly; c.globalAlpha = 0.35;
    ell(c, -1, 0.6, 8.4, 4.4);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,255,255,0.22)';
    ell(c, 1, -3.4, 6, 2, -0.15);
    c.fillStyle = '#f2ecd8';
    ell(c, 8.4, -3.2, 1.5, 1.6); ell(c, 8.4, 3.2, 1.5, 1.6);
    c.fillStyle = '#22252a';
    ell(c, 8.9, -3.2, 0.8, 0.9); ell(c, 8.9, 3.2, 0.8, 0.9);
  };

  S.crayfish = function (c, a, t) {
    var step = Math.sin(t * 4.5);
    c.strokeStyle = GG.shade(a.back, -0.2); c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      for (var i = 0; i < 4; i++) {
        var xx = 1 + i * 3.4;
        var k = Math.sin(t * 4.5 + i * 1.4 + (s2 > 0 ? 0 : 1.7)) * 1.2;
        c.beginPath();
        c.moveTo(xx, s2 * 3.6);
        c.quadraticCurveTo(xx - 1 + k, s2 * 7, xx - 3 + k, s2 * 9.4);
        c.stroke();
      }
      /* the big pincer arms out front */
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(11, s2 * 3);
      c.quadraticCurveTo(17, s2 * 6, 21, s2 * 4.4 + step * s2 * 0.8);
      c.stroke();
      c.lineWidth = 1.3;
    }
    for (var g = -1; g <= 1; g += 2) {
      c.save(); c.translate(23, g * 4 + step * g * 0.8); c.rotate(g * 0.28);
      c.fillStyle = GG.shade(a.back, 0.06); ell(c, 0, 0, 4.6, 2.2);
      c.fillStyle = a.belly; ell(c, 3.2, g * -0.5, 2.4, 1);
      c.restore();
    }
    /* the tail, curling under */
    c.fillStyle = a.back;
    for (var j = 0; j < 5; j++) {
      ell(c, -4 - j * 3.4, Math.sin(t * 4.5) * (0.3 + j * 0.2), 3 - j * 0.24, 4.6 - j * 0.5);
    }
    c.fillStyle = GG.shade(a.back, 0.12);
    c.beginPath();
    var ty = Math.sin(t * 4.5) * 1.4;
    c.moveTo(-19, ty);
    c.lineTo(-25, ty - 5.4); c.lineTo(-23, ty); c.lineTo(-25, ty + 5.4);
    c.closePath(); c.fill();
    /* the head and shell */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(15, 0);
    c.quadraticCurveTo(12, -5.4, 4, -5.2);
    c.quadraticCurveTo(-3, -4.8, -4, 0);
    c.quadraticCurveTo(-3, 4.8, 4, 5.2);
    c.quadraticCurveTo(12, 5.4, 15, 0);
    c.closePath(); c.fill();
    c.fillStyle = a.belly; c.globalAlpha = 0.4;
    ell(c, 5, 1.4, 7, 2.8);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,255,255,0.24)'; ell(c, 6, -2.4, 5, 1.4, -0.1);
    /* the rostrum, the little pointed nose */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(14, -1.4); c.lineTo(20, 0); c.lineTo(14, 1.4); c.closePath(); c.fill();
    c.fillStyle = '#22252a';
    ell(c, 13, -2.6, 1.1, 1.1); ell(c, 13, 2.6, 1.1, 1.1);
    c.strokeStyle = a.accent; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(15, -1.6); c.quadraticCurveTo(22, -5, 27, -7.4); c.stroke();
    c.beginPath(); c.moveTo(15, 1.6); c.quadraticCurveTo(22, 5, 27, 7.4); c.stroke();
  };

  S.mola = function (c, a, t) {
    var flap = Math.sin(t * 1.8);
    /* the tall fins that row it along */
    c.fillStyle = a.fin;
    c.save(); c.rotate(flap * 0.1);
    c.beginPath();
    c.moveTo(-2, -12); c.quadraticCurveTo(4, -26, 8, -13);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(-2, 12); c.quadraticCurveTo(4, 26, 8, 13);
    c.closePath(); c.fill();
    c.restore();
    /* the round body, blunt at the back */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(19, 0);
    c.bezierCurveTo(17, -13, 4, -16, -6, -13.5);
    c.lineTo(-15, -11);
    c.quadraticCurveTo(-13, 0, -15, 11);
    c.lineTo(-6, 13.5);
    c.bezierCurveTo(4, 16, 17, 13, 19, 0);
    c.closePath(); c.fill();
    /* the frilly clavus where a tail should be */
    c.fillStyle = a.fin;
    for (var i = -4; i <= 4; i++) {
      ell(c, -15.4, i * 2.6, 2, 1.5);
    }
    c.fillStyle = a.belly; c.globalAlpha = 0.42;
    ell(c, 2, 6.4, 13, 6.4);
    c.globalAlpha = 1;
    c.fillStyle = a.accent; c.globalAlpha = 0.25;
    ell(c, 0, -5, 11, 5.4, -0.1);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,255,255,0.2)';
    ell(c, 4, -7, 7, 2.6, -0.2);
    eye(c, 13.5, -3.4, 2.8);
    mouth(c, 18.6, 1.4, 4, '#2b2b33');
    /* the little pursed beak */
    c.fillStyle = GG.shade(a.back, -0.25);
    ell(c, 18.8, 1.2, 1.8, 1.6);
  };


  /* ---------- the Cattail Marsh ---------- */

  /* A redside shiner: a deeper-bodied little minnow with one hot red band
     laid down the flank last of all, so nothing washes it out. */
  S.shiner = function (c, a, t) {
    standard(c, a, t, { L: 16, D: 5.8, tail: 'fork', tailD: 6, hump: 1.05, dorsal: 1.7, eye: 2.3, mouth: 4 });
    c.save();
    c.beginPath();
    c.ellipse(-0.5, 0, 16.6, 6.2, 0, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = a.accent; c.globalAlpha = 0.88;
    c.beginPath();
    c.moveTo(-15.5, 0.6); c.quadraticCurveTo(-2, -1.3, 13.5, -0.2);
    c.quadraticCurveTo(-2, 0.9, -15.5, 2.4);
    c.closePath(); c.fill();
    c.globalAlpha = 1;
    c.restore();
  };

  /* A peamouth and friends already use S.minnow. */

  /* Three-spine stickleback: a small armoured fish with a narrow waist in
     front of the tail, bony plates down the side and three spines that
     stand straight up out of its back. */
  S.stickleback = function (c, a, t) {
    var wag = Math.sin(t * 6);
    var L = 14, D = 4.6;
    /* narrow tail stalk and a small fan tail */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(-L * 0.55, -1.5); c.lineTo(-L - 3, -1.2);
    c.lineTo(-L - 3, 1.2); c.lineTo(-L * 0.55, 1.5);
    c.closePath(); c.fill();
    tail(c, -L - 3, a, wag, 'fan', 4.4);
    /* body: a plump teardrop, fattest just behind the head */
    c.fillStyle = a.back;
    c.beginPath();
    c.moveTo(L + 3, 0);
    c.bezierCurveTo(L * 0.5, -D * 1.25, -L * 0.2, -D * 1.05, -L * 0.62, -1.6);
    c.lineTo(-L * 0.62, 1.6);
    c.bezierCurveTo(-L * 0.2, D * 1.05, L * 0.5, D * 1.2, L + 3, 0);
    c.closePath(); c.fill();
    /* belly, kept inside the body outline */
    c.save();
    c.beginPath();
    c.moveTo(L + 3, 0);
    c.bezierCurveTo(L * 0.5, -D * 1.25, -L * 0.2, -D * 1.05, -L * 0.62, -1.6);
    c.lineTo(-L * 0.62, 1.6);
    c.bezierCurveTo(-L * 0.2, D * 1.05, L * 0.5, D * 1.2, L + 3, 0);
    c.closePath(); c.clip();
    c.fillStyle = a.belly; ell(c, 0, D * 0.75, L * 1.1, D * 0.72);
    /* the bony plates: a single low row of short dashes along the flank,
       not a rib cage */
    c.fillStyle = a.plate || '#d6dcd4'; c.globalAlpha = 0.7;
    for (var i = -3; i <= 5; i++) ell(c, i * 2.4 + 0.6, 0.4, 0.85, D * 0.34);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,255,255,0.28)'; ell(c, 4, -2.2, 4.4, 1.6, -0.12);
    c.restore();
    /* soft dorsal and anal fins at the back */
    c.fillStyle = a.fin;
    c.beginPath();
    c.moveTo(-L * 0.6, -D * 0.5); c.quadraticCurveTo(-L * 0.28, -D * 1.5, -L * 0.02, -D * 0.72);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(-L * 0.6, D * 0.5); c.quadraticCurveTo(-L * 0.3, D * 1.5, -L * 0.04, D * 0.75);
    c.closePath(); c.fill();
    /* the three spines, standing up, drawn last so they read */
    c.strokeStyle = a.spine || '#3a443e'; c.lineWidth = 1.5; c.lineCap = 'round';
    [[5.6, 3.4], [1.6, 3.8], [-2.4, 3]].forEach(function (p) {
      c.beginPath();
      c.moveTo(p[0], -D * 0.95);
      c.lineTo(p[0] - p[1] * 0.55, -D * 0.95 - p[1]); c.stroke();
    });
    /* one spine on the belly too */
    c.beginPath(); c.moveTo(1.8, D * 0.95); c.lineTo(0.4, D * 0.95 + 2.8); c.stroke();
    eye(c, L * 0.72, -1.3, 2.1);
    mouth(c, L + 2.4, 0.4, 3.4, '#2b2b33');
  };

  /* Sand roller: a small humpbacked trout-perch, pale and faintly
     see-through, with the little fatty adipose fin that gives it away. */
  S.sandroller = function (c, a, t) {
    standard(c, a, t, { L: 14, D: 5.4, tail: 'fork', tailD: 5.2, hump: 1.35, dorsal: 2.0, eye: 2.6, mouth: 3.4 });
    /* the adipose fin: a little fleshy nub behind the back fin */
    c.fillStyle = a.fin;
    ell(c, -9.4, -4.6, 2.1, 1.2, -0.22);
    /* a hint of the light coming through it */
    c.fillStyle = 'rgba(255,255,255,0.22)';
    ell(c, 1, 1.4, 7.4, 2.4, -0.1);
  };

  /* Chiselmouth: a long dark river minnow with a hard pale plate slung
     under the snout instead of a lower lip. */
  S.chiselmouth = function (c, a, t) {
    standard(c, a, t, { L: 20, D: 6.2, tail: 'fork', tailD: 7, hump: 0.92, dorsal: 1.7, eye: 2.4, mouth: 0.1 });
    /* the chisel: a straight hard blade jutting below the snout */
    c.fillStyle = a.chisel || '#e0d8bc';
    c.beginPath();
    c.moveTo(20.4, 0.4); c.lineTo(15.4, 2.6); c.lineTo(15.8, 4.2); c.lineTo(20.6, 2.2);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.chisel || '#e0d8bc', -0.35); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(20.4, 0.6); c.lineTo(15.5, 2.8); c.stroke();
  };

  /* Tench: thick-set and dark olive, tiny scales, every fin rounded off,
     a small red eye and one short whisker at each corner of the mouth. */
  S.tench = function (c, a, t) {
    var wag = Math.sin(t * 3.4);
    var L = 21, D = 9.4;
    /* rounded tail, barely forked */
    c.fillStyle = a.fin;
    c.save(); c.translate(-L - 1, 0); c.rotate(wag * 0.3);
    c.beginPath();
    c.moveTo(2, 0);
    c.quadraticCurveTo(-8, -D * 1.05, -11, -D * 0.5);
    c.quadraticCurveTo(-9.5, 0, -11, D * 0.5);
    c.quadraticCurveTo(-8, D * 1.05, 2, 0);
    c.closePath(); c.fill();
    c.restore();
    /* rounded dorsal and anal fins */
    c.fillStyle = a.fin;
    c.beginPath();
    c.moveTo(-L * 0.42, -D * 0.72);
    c.quadraticCurveTo(-L * 0.18, -D * 1.42, L * 0.08, -D * 0.78);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(-L * 0.4, D * 0.7);
    c.quadraticCurveTo(-L * 0.16, D * 1.34, L * 0.06, D * 0.76);
    c.closePath(); c.fill();
    /* the thick body */
    function outline() {
      c.beginPath();
      c.moveTo(L, 0);
      c.bezierCurveTo(L * 0.6, -D * 0.92, -L * 0.45, -D, -L * 0.92, -D * 0.3);
      c.bezierCurveTo(-L * 1.02, 0, -L * 1.02, 0, -L * 0.92, D * 0.3);
      c.bezierCurveTo(-L * 0.45, D, L * 0.6, D * 0.9, L, 0);
      c.closePath();
    }
    c.fillStyle = a.back; outline(); c.fill();
    c.save(); outline(); c.clip();
    c.fillStyle = a.belly; ell(c, -L * 0.05, D * 0.78, L * 1.05, D * 0.56);
    pattern(c, a, L, D);
    c.restore();
    /* rounded side fin */
    c.fillStyle = a.fin;
    c.beginPath();
    c.moveTo(L * 0.34, D * 0.14);
    c.quadraticCurveTo(L * 0.02, D * 0.86, L * 0.34, D * 0.56);
    c.closePath(); c.fill();
    /* one short barbel at each corner of the mouth */
    c.strokeStyle = GG.shade(a.back, 0.2); c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(19.6, 1.4); c.quadraticCurveTo(21.6, 3.2, 21, 5.2); c.stroke();
    mouth(c, L * 0.96, 0.8, 4, '#2b2b33');
    /* the small red eye, drawn last */
    c.fillStyle = a.eyering || '#c8482f'; ell(c, L * 0.6, -D * 0.3, 2.5, 2.5);
    c.fillStyle = '#22252a'; ell(c, L * 0.62, -D * 0.3, 1.25, 1.25);
    c.fillStyle = '#ffffff'; ell(c, L * 0.66, -D * 0.38, 0.5, 0.5);
  };

  /* Pacific lamprey: a long jawless ribbon with no paired fins at all,
     one low fin along the back half, a round sucker mouth ringed with
     teeth, and seven gill holes in a row behind the eye. */
  S.lamprey = function (c, a, t) {
    var k = t * 3.4;
    function wave(x) { return Math.sin(x * 0.17 + k) * (2.8 * (1 - (x + 24) / 54)); }
    function depth(x) { return 2.0 + 1.2 * Math.max(0, 1 - Math.abs(x + 2) / 26); }
    /* the low fin along the back of the rear half, drawn first */
    c.fillStyle = a.fin;
    c.beginPath();
    for (var f = 2; f >= -25; f -= 3) c.lineTo(f, wave(f) - depth(f) - 2.6);
    for (var f2 = -25; f2 <= 2; f2 += 3) c.lineTo(f2, wave(f2) - depth(f2) + 0.2);
    c.closePath(); c.fill();
    /* the body */
    c.fillStyle = a.back;
    c.beginPath();
    for (var i = 23; i >= -25; i -= 3) c.lineTo(i, wave(i) - depth(i));
    for (var j = -25; j <= 23; j += 3) c.lineTo(j, wave(j) + depth(j));
    c.closePath(); c.fill();
    /* the paler underside */
    c.save();
    c.beginPath();
    for (var i2 = 23; i2 >= -25; i2 -= 3) c.lineTo(i2, wave(i2) - depth(i2));
    for (var j2 = -25; j2 <= 23; j2 += 3) c.lineTo(j2, wave(j2) + depth(j2));
    c.closePath(); c.clip();
    c.fillStyle = a.belly; c.globalAlpha = 0.7;
    c.beginPath();
    for (var m = 23; m >= -25; m -= 3) c.lineTo(m, wave(m) + depth(m) * 0.25);
    for (var n = -25; n <= 23; n += 3) c.lineTo(n, wave(n) + depth(n));
    c.closePath(); c.fill();
    c.globalAlpha = 1;
    c.restore();
    /* the seven gill holes, in a row, behind the eye */
    c.fillStyle = a.pore || '#2b2b26';
    for (var g = 0; g < 7; g++) {
      var gx = 13.5 - g * 2.3;
      ell(c, gx, wave(gx) - 0.1, 0.62, 0.9);
    }
    /* the round sucker at the front, drawn last and facing forward */
    var hy = wave(23);
    c.fillStyle = GG.shade(a.back, -0.2);
    ell(c, 23.4, hy, 2.4, 3.3);
    c.fillStyle = '#2a211c';
    ell(c, 24.2, hy, 1.7, 2.6);
    c.fillStyle = a.teeth || '#e8e2cc';
    for (var d = 0; d < 9; d++) {
      var ang = d / 9 * Math.PI * 2;
      ell(c, 24.2 + Math.cos(ang) * 1.05, hy + Math.sin(ang) * 1.7, 0.4, 0.4);
    }
    eye(c, 17.4, wave(17.4) - 1.3, 1.7);
  };

  GG.drawAny = function (c, def, x, y, scale, angle, t, faceLeft, gait) {
    if (def.isFruit) GG.FruitArt.draw(c, def, x, y, scale, t);
    else if (def.isAnimal) {
      /* animals are normalised to fill their frame, so a hummingbird on a
         book page is not a speck next to a labrador */
      var as = GG.animalFit(def, 26 * scale);
      GG.AnimalArt.draw(c, def, x, y + 4.5 * as * (def.size || 1), as, !!faceLeft, t, gait);
    }
    else if (def.isFish || def.isJunk) GG.FishArt.draw(c, def, x, y, scale * 0.5, !!faceLeft, t);
    else GG.BugArt.draw(c, def, x, y, scale, angle, t);
  };

  GG.FishArt = {
    shapes: S,
    draw: function (c, def, x, y, scale, faceLeft, t) {
      var fn = S[def.art.shape] || S.torpedo;
      c.save();
      c.translate(x, y);
      var s = scale * (def.size || 1);
      c.scale(faceLeft ? -s : s, s);
      fn(c, def.art, t || 0);
      c.restore();
    }
  };
})(window.GG = window.GG || {});
