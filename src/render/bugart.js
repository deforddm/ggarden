/* Every bug is drawn with code - no picture files.
   All shapes are drawn facing UP (head toward -y), centred on (0,0),
   about 26 pixels long at scale 1. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath();
    c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2);
    c.fill();
  }
  function line(c, x1, y1, x2, y2, w, col) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }
  function curve(c, x1, y1, cx, cy, x2, y2, w, col) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(cx, cy, x2, y2); c.stroke();
  }

  function legs(c, col, n, len, spread, wig, w) {
    c.strokeStyle = col; c.lineWidth = w || 1.4; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < n; i++) {
        var y = -3 + i * 3.4;
        var k = Math.sin(wig + i * 1.6 + (s > 0 ? 0 : 1.9)) * 1.5;
        c.beginPath();
        c.moveTo(s * 1.8, y);
        c.quadraticCurveTo(s * spread * 0.7, y + 1 + k, s * spread, y + len + k);
        c.stroke();
      }
    }
  }

  function pattern(c, a, rx, ry, cy) {
    if (a.pattern === 'spots') {
      c.fillStyle = a.accent;
      [[-0.45, -0.25], [0.45, -0.25], [-0.5, 0.28], [0.5, 0.28], [0, 0.55]].forEach(function (p) {
        ell(c, p[0] * rx, cy + p[1] * ry, rx * 0.18, ry * 0.15);
      });
    } else if (a.pattern === 'stripes') {
      c.fillStyle = a.accent;
      for (var i = -1; i <= 1; i++) ell(c, 0, cy + i * ry * 0.42, rx * 0.92, ry * 0.10);
    } else if (a.pattern === 'bands') {
      c.fillStyle = a.accent;
      for (var j = -1; j <= 1; j++) ell(c, 0, cy + j * ry * 0.45, rx * 0.85, ry * 0.13);
    }
  }

  /* ---------- wing helpers ---------- */
  function foreWing(c, s, flap, col, edge) {
    c.save(); c.scale(flap, 1);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(s * 1.2, -3.5);
    c.bezierCurveTo(s * 12, -12, s * 15, -3, s * 8.5, 1.5);
    c.bezierCurveTo(s * 5, 2.5, s * 2, 1.5, s * 1.2, -0.5);
    c.closePath(); c.fill();
    if (edge) { c.strokeStyle = edge; c.lineWidth = 0.9; c.stroke(); }
    c.restore();
  }
  function hindWing(c, s, flap, col, edge) {
    c.save(); c.scale(flap, 1);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(s * 1.2, 0);
    c.bezierCurveTo(s * 10, 1, s * 11, 9, s * 4, 9.5);
    c.bezierCurveTo(s * 1.8, 9, s * 1, 5, s * 1.2, 1);
    c.closePath(); c.fill();
    if (edge) { c.strokeStyle = edge; c.lineWidth = 0.9; c.stroke(); }
    c.restore();
  }

  /* ---------- the shapes ---------- */
  var S = {};

  /* patterns added later that want a quieter wing outline than a.accent,
     because for them a.accent is the marking colour, not an edge colour */
  var BF_OWNEDGE = { eyeband: 1, redspots: 1, checker: 1, whiteband: 1, blackbar: 1 };

  S.butterfly = function (c, a, t) {
    var flap = 0.45 + 0.55 * Math.abs(Math.cos(t * 7));
    var edge = BF_OWNEDGE[a.pattern] ? GG.shade(a.wing, -0.42) : a.accent;
    for (var s = -1; s <= 1; s += 2) {
      hindWing(c, s, flap, a.wing2 || a.wing, edge);
      foreWing(c, s, flap, a.wing, edge);
      if (a.pattern === 'veins') {
        c.save(); c.scale(flap, 1);
        c.strokeStyle = a.accent; c.lineWidth = 0.7;
        for (var i = 0; i < 4; i++) {
          c.beginPath(); c.moveTo(s * 2, -2.5);
          c.lineTo(s * (5 + i * 2.6), -8 + i * 3.2); c.stroke();
        }
        c.restore();
      } else if (a.pattern === 'edge') {
        c.save(); c.scale(flap, 1);
        c.fillStyle = a.accent;
        c.globalAlpha = 0.75;
        c.beginPath();
        c.moveTo(s * 11.5, -6.6); c.quadraticCurveTo(s * 15, -3, s * 8.5, 1.5);
        c.quadraticCurveTo(s * 12, -2, s * 11.5, -6.6); c.fill();
        c.globalAlpha = 1; c.restore();
      } else if (a.pattern === 'spots') {
        c.save(); c.scale(flap, 1); c.fillStyle = a.accent;
        ell(c, s * 8, -4.5, 1.2, 1.5); ell(c, s * 5.5, 6, 1, 1.2); c.restore();
      } else if (a.pattern === 'eyeband') {
        /* a broad warm band near the outer edge, with black eyespots sitting
           in it, each with a tiny white pupil */
        c.save(); c.scale(flap, 1);
        c.fillStyle = a.accent; c.globalAlpha = 0.9;
        c.beginPath();
        c.moveTo(s * 6.8, -7.6); c.quadraticCurveTo(s * 13.6, -4.4, s * 8.4, 1.2);
        c.quadraticCurveTo(s * 6.2, -3, s * 6.8, -7.6); c.fill();
        c.beginPath();
        c.moveTo(s * 5.8, 2.2); c.quadraticCurveTo(s * 9.8, 4.6, s * 5, 8.4);
        c.quadraticCurveTo(s * 4.2, 5, s * 5.8, 2.2); c.fill();
        c.globalAlpha = 1;
        var EY = [[8.8, -5.6, 1.75], [8.2, -1.6, 1.45], [6.2, 5, 1.1]];
        for (var e = 0; e < EY.length; e++) {
          c.fillStyle = '#16120e';
          ell(c, s * EY[e][0], EY[e][1], EY[e][2], EY[e][2]);
          c.fillStyle = '#f7f5ed';
          ell(c, s * EY[e][0] - s * 0.25, EY[e][1] - 0.4, EY[e][2] * 0.36, EY[e][2] * 0.36);
        }
        c.restore();
      } else if (a.pattern === 'redspots') {
        /* chalky paper wings with black veins, grey bars, and two drops of
           blood on each hindwing */
        c.save(); c.scale(flap, 1);
        c.strokeStyle = '#2b2723'; c.lineWidth = 0.65; c.lineCap = 'round';
        for (var v = 0; v < 4; v++) {
          c.beginPath(); c.moveTo(s * 2, -2.6);
          c.lineTo(s * (5.5 + v * 2.6), -8.5 + v * 3.2); c.stroke();
        }
        c.beginPath(); c.moveTo(s * 2, 1.2); c.lineTo(s * 8.4, 7.4); c.stroke();
        c.beginPath(); c.moveTo(s * 2, 1.2); c.lineTo(s * 4.6, 9); c.stroke();
        c.fillStyle = 'rgba(98,96,92,0.4)';
        ell(c, s * 10.2, -4.2, 0.75, 2.4, s * -0.5);
        c.fillStyle = a.accent;
        ell(c, s * 5.2, 4.2, 1.55, 1.55); ell(c, s * 7.2, 7.2, 1.3, 1.3);
        c.restore();
      } else if (a.pattern === 'checker') {
        /* rows of pale and dark squares, like a little stained-glass window */
        c.save(); c.scale(flap, 1);
        c.beginPath();
        c.moveTo(s * 1.2, -3.5);
        c.bezierCurveTo(s * 12, -12, s * 15, -3, s * 8.5, 1.5);
        c.bezierCurveTo(s * 5, 2.5, s * 2, 1.5, s * 1.2, -0.5);
        c.moveTo(s * 1.2, 0);
        c.bezierCurveTo(s * 10, 1, s * 11, 9, s * 4, 9.5);
        c.bezierCurveTo(s * 1.8, 9, s * 1, 5, s * 1.2, 1);
        c.clip();
        /* a warmer flush over the inner wing before the squares go on */
        c.fillStyle = a.wing2 || GG.shade(a.wing, 0.14);
        ell(c, s * 4.6, -2.4, 4, 3.4, s * -0.3);
        c.fillStyle = a.accent;
        for (var r = 0; r < 8; r++) {
          for (var q = 0; q < 7; q++) {
            if ((r + q) % 2) continue;
            var qx = 1.6 + q * 2.3;
            c.fillRect(s > 0 ? qx : -(qx + 1.65), -11 + r * 2.9, 1.65, 1.3);
          }
        }
        /* the dark margin, stroked inside its own clip */
        c.strokeStyle = GG.shade(a.wing, -0.5); c.lineWidth = 2.4; c.stroke();
        c.restore();
      } else if (a.pattern === 'whiteband') {
        /* one broad clean band straight across both wings */
        c.save(); c.scale(flap, 1);
        c.fillStyle = a.accent;
        c.beginPath();
        c.moveTo(s * 2.2, -1.2); c.lineTo(s * 12.2, -5.6); c.lineTo(s * 13, -2.4);
        c.lineTo(s * 3, 1.6); c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(s * 1.9, 2); c.lineTo(s * 8.8, 4.4); c.lineTo(s * 7.6, 7.2);
        c.lineTo(s * 1.7, 4.9); c.closePath(); c.fill();
        if (a.tip) {
          c.fillStyle = a.tip;
          c.beginPath();
          c.moveTo(s * 10.2, -8.2); c.quadraticCurveTo(s * 14.6, -3.4, s * 10.4, -1.4);
          c.quadraticCurveTo(s * 11.6, -5, s * 10.2, -8.2); c.fill();
        }
        c.restore();
      } else if (a.pattern === 'blackbar') {
        /* a bold black bar along the leading edge, a hook at the tip, and the
           hindwing veins outlined like a leaded window */
        c.save(); c.scale(flap, 1);
        c.strokeStyle = a.accent; c.lineCap = 'round';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(s * 2.4, -4.4);
        c.quadraticCurveTo(s * 9.5, -9.8, s * 13.2, -4.6);
        c.stroke();
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(s * 13.2, -4.6);
        c.quadraticCurveTo(s * 13.4, -1.4, s * 10, -0.2);
        c.stroke();
        c.lineWidth = 0.75;
        for (var g = 0; g < 4; g++) {
          c.beginPath(); c.moveTo(s * 2, 1.4);
          c.quadraticCurveTo(s * (5 + g * 1.4), 4 + g * 1.4, s * (4.2 + g * 1.8), 8.6 - g * 0.5);
          c.stroke();
        }
        c.restore();
      }
    }
    c.fillStyle = a.body; ell(c, 0, 0, 1.7, 6);
    c.fillStyle = GG.shade(a.body, 0.25); ell(c, 0, -5.5, 1.7, 2);
    line(c, -0.8, -7, -3.5, -11.5, 0.8, a.body);
    line(c, 0.8, -7, 3.5, -11.5, 0.8, a.body);
    c.fillStyle = a.body; ell(c, -3.6, -11.8, 0.8, 0.8); ell(c, 3.6, -11.8, 0.8, 0.8);
  };

  S.swallowtail = function (c, a, t) {
    var flap = 0.5 + 0.5 * Math.abs(Math.cos(t * 6.4));
    for (var s = -1; s <= 1; s += 2) {
      c.save(); c.scale(flap, 1);
      c.fillStyle = a.wing2 || a.wing;
      c.beginPath();
      c.moveTo(s * 1.2, 0);
      c.bezierCurveTo(s * 10, 1, s * 10, 8, s * 5, 9);
      c.lineTo(s * 3.4, 14.5); c.lineTo(s * 2.6, 8.5);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 0.8; c.stroke();
      c.restore();
      foreWing(c, s, flap, a.wing, a.accent);
      c.save(); c.scale(flap, 1);
      c.strokeStyle = a.accent; c.lineWidth = 1.1;
      for (var i = 0; i < 3; i++) {
        c.beginPath(); c.moveTo(s * (3 + i * 3), -2.2); c.lineTo(s * (4.5 + i * 3.2), -8.5); c.stroke();
      }
      c.restore();
    }
    c.fillStyle = a.body; ell(c, 0, 0, 1.8, 6.2);
    line(c, -0.8, -7, -3.8, -12, 0.8, a.body);
    line(c, 0.8, -7, 3.8, -12, 0.8, a.body);
  };

  S.lunamoth = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 5));
    for (var s = -1; s <= 1; s += 2) {
      c.save(); c.scale(flap, 1);
      c.fillStyle = a.wing;
      c.beginPath();
      c.moveTo(s * 1.2, 0.5);
      c.bezierCurveTo(s * 10.5, 2, s * 8.5, 8, s * 5.2, 8.8);
      c.bezierCurveTo(s * 5.4, 11.5, s * 3.4, 13.5, s * 1.6, 14.2);
      c.bezierCurveTo(s * 2.4, 11.5, s * 2.6, 9.5, s * 2, 6);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 0.8; c.stroke();
      c.fillStyle = a.wing2 || a.wing;
      c.beginPath();
      c.moveTo(s * 1.2, -3.5);
      c.bezierCurveTo(s * 12, -11, s * 14, -2, s * 8, 2);
      c.bezierCurveTo(s * 4, 2.6, s * 2, 1.4, s * 1.2, -0.5);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 0.9; c.stroke();
      c.fillStyle = a.accent; ell(c, s * 7, -4.5, 1.3, 1.9);
      c.fillStyle = '#ffffff'; ell(c, s * 7, -4.8, 0.5, 0.8);
      c.restore();
    }
    c.fillStyle = a.body; ell(c, 0, -1, 2.1, 6);
    c.fillStyle = GG.shade(a.body, -0.12); ell(c, 0, -6, 2.2, 2.4);
    curve(c, -1, -7.5, -3, -11, -5, -12.5, 1.1, a.body);
    curve(c, 1, -7.5, 3, -11, 5, -12.5, 1.1, a.body);
  };

  S.moth = function (c, a, t) {
    var flap = 0.5 + 0.5 * Math.abs(Math.cos(t * 8));
    for (var s = -1; s <= 1; s += 2) {
      c.save(); c.scale(flap, 1);
      c.fillStyle = a.wing2 || a.wing;
      c.beginPath(); c.moveTo(s * 1, 1); c.bezierCurveTo(s * 9, 3, s * 8, 9, s * 3, 9);
      c.closePath(); c.fill();
      c.fillStyle = a.wing;
      c.beginPath(); c.moveTo(s * 1, -3.5); c.bezierCurveTo(s * 12, -8, s * 12, 1, s * 3, 2.5);
      c.closePath(); c.fill();
      if (a.pattern === 'bands') {
        c.strokeStyle = a.accent; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(s * 3, -4.2); c.lineTo(s * 9.5, -2.4); c.stroke();
      } else if (a.pattern === 'eyespots') {
        c.fillStyle = a.accent;
        ell(c, s * 5.2, 5.4, 2.8, 2.8);
        c.fillStyle = '#f2f2f2'; ell(c, s * 5.2, 5.4, 1.1, 1.1);
        c.fillStyle = '#1a1a1a'; ell(c, s * 5.2, 5.4, 0.5, 0.5);
        c.strokeStyle = a.accent; c.lineWidth = 1;
        c.beginPath(); c.moveTo(s * 3, -4.4); c.lineTo(s * 10, -3); c.stroke();
      } else if (a.pattern === 'buckmoth') {
        /* pure white wings, black edged, two clean cross-lines and one big
           black oval in the middle of each wing */
        /* a narrow black rim only, so the wing stays white */
        c.strokeStyle = a.accent; c.lineCap = 'round'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(s * 1, -3.5);
        c.bezierCurveTo(s * 12, -8, s * 12, 1, s * 3, 2.5); c.stroke();
        c.beginPath(); c.moveTo(s * 1, 1);
        c.bezierCurveTo(s * 9, 3, s * 8, 9, s * 3, 9); c.stroke();
        /* two clean cross-lines */
        c.lineWidth = 0.65;
        c.beginPath(); c.moveTo(s * 2.8, -3);
        c.quadraticCurveTo(s * 6.2, -4.6, s * 9.2, -2.4); c.stroke();
        c.beginPath(); c.moveTo(s * 2.8, 0.2);
        c.quadraticCurveTo(s * 6.4, -0.8, s * 9, 0.4); c.stroke();
        /* one big black oval in the middle of each wing */
        c.fillStyle = a.accent;
        ell(c, s * 6.2, -1.5, 1.35, 1.05, s * 0.25);
        ell(c, s * 4.8, 5.2, 1.2, 0.95, s * -0.2);
      } else if (a.pattern === 'silverspots') {
        /* silvery-white spots scattered in rough rows */
        c.fillStyle = a.accent;
        var SP = [[3.2, -3.6], [6, -4.4], [8.8, -3], [4.2, -1.2], [7.2, -1],
          [9.8, 0.2], [3, 1.2], [5.8, 1.4], [3.2, 4.2], [5.4, 4.6],
          [3.8, 7], [6.2, 6.6]];
        for (var i = 0; i < SP.length; i++) ell(c, s * SP[i][0], SP[i][1], 0.85, 0.72);
      } else if (a.pattern === 'panels') {
        /* the black wing frame, filled with panes of pale green glass */
        c.fillStyle = a.accent;
        var PN = [[3.2, -4.8, 1.55, 1.15], [6.2, -4.8, 1.55, 1.1], [9, -3.3, 1.35, 0.95],
          [3.4, -1.8, 1.6, 1.15], [6.7, -1.9, 1.6, 1.1], [9.7, -0.9, 1.3, 0.95],
          [3.8, 1.1, 1.5, 0.95], [7.1, 0.8, 1.45, 0.9],
          [3.3, 3.8, 1.55, 1.05], [6.3, 3.9, 1.35, 1], [3.8, 6.9, 1.3, 0.95], [6.1, 6.6, 1.15, 0.85]];
        for (var p = 0; p < PN.length; p++) {
          ell(c, s * PN[p][0], PN[p][1], PN[p][2], PN[p][3], s * 0.2);
        }
      }
      c.restore();
    }
    if (a.pattern === 'panels' && a.leg) {
      /* bright orange front legs, held out in front */
      c.strokeStyle = a.leg; c.lineWidth = 1.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-1.8, -4); c.quadraticCurveTo(-5.4, -5.4, -7.4, -3.6); c.stroke();
      c.beginPath(); c.moveTo(1.8, -4); c.quadraticCurveTo(5.4, -5.4, 7.4, -3.6); c.stroke();
      c.beginPath(); c.moveTo(-1.6, -2.2); c.quadraticCurveTo(-4.8, -2.6, -6.4, -0.4); c.stroke();
      c.beginPath(); c.moveTo(1.6, -2.2); c.quadraticCurveTo(4.8, -2.6, 6.4, -0.4); c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, -0.5, 2.4, 5.6);
    if (a.bands) {
      /* a deep yellow abdomen ringed with black */
      c.fillStyle = a.bands;
      for (var bn = 0; bn < 4; bn++) ell(c, 0, -0.6 + bn * 1.9, 2.3 - bn * 0.3, 0.55);
    }
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -5, 2.5, 2.4);
    if (a.pattern === 'silverspots') {
      /* a thick furry body */
      c.strokeStyle = GG.shade(a.body, 0.3); c.lineWidth = 0.65; c.lineCap = 'round';
      for (var f = 0; f < 16; f++) {
        var fa = f / 16 * Math.PI * 2;
        var fx = Math.cos(fa) * 2.5, fy = Math.sin(fa) * 5.4;
        c.beginPath();
        c.moveTo(fx * 0.8, -1 + fy * 0.8); c.lineTo(fx * 1.35, -1 + fy * 1.2); c.stroke();
      }
    }
    if (a.dots) {
      /* a black head and thorax speckled with white */
      c.fillStyle = a.dots;
      var rnd = GG.mulberry32(53);
      for (var d = 0; d < 14; d++) {
        ell(c, (rnd() - 0.5) * 4.4, -6.6 + rnd() * 5.6, 0.4, 0.4);
      }
    }
    curve(c, -1, -6.5, -2.6, -9, -4.6, -10.5, 1.4, a.body);
    curve(c, 1, -6.5, 2.6, -9, 4.6, -10.5, 1.4, a.body);
  };

  S.atlas = function (c, a, t) {
    var flap = 0.6 + 0.4 * Math.abs(Math.cos(t * 4));
    for (var s = -1; s <= 1; s += 2) {
      c.save(); c.scale(flap, 1);
      c.fillStyle = a.wing2 || a.wing;
      c.beginPath();
      c.moveTo(s * 1.2, 0.5); c.lineTo(s * 12, 4); c.lineTo(s * 9, 11); c.lineTo(s * 2.5, 9);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 1; c.stroke();
      c.fillStyle = a.wing;
      c.beginPath();
      c.moveTo(s * 1.2, -4); c.lineTo(s * 9, -12); c.lineTo(s * 15, -9.5);
      c.lineTo(s * 13.5, -4); c.lineTo(s * 12, 0.5); c.lineTo(s * 2.5, 1.5);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 1; c.stroke();
      c.fillStyle = a.accent;
      c.globalAlpha = 0.85;
      c.beginPath(); c.moveTo(s * 5, -4.5); c.lineTo(s * 9, -6.5); c.lineTo(s * 8, -1.5); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(s * 5.5, 5); c.lineTo(s * 9, 4.5); c.lineTo(s * 7.5, 8.5); c.closePath(); c.fill();
      c.globalAlpha = 1;
      c.fillStyle = GG.shade(a.wing, -0.35);
      c.beginPath(); c.moveTo(s * 11, -11); c.lineTo(s * 15, -9.5); c.lineTo(s * 12.8, -6.5); c.closePath(); c.fill();
      c.restore();
    }
    c.fillStyle = a.body; ell(c, 0, -1, 2.6, 6.2);
    curve(c, -1, -7, -3, -10, -5.4, -11.5, 1.5, a.body);
    curve(c, 1, -7, 3, -10, 5.4, -11.5, 1.5, a.body);
  };

  S.ladybug = function (c, a, t) {
    var w = Math.sin(t * 9) * 0.6;
    legs(c, '#181818', 3, 3.4, 6.5, t * 9, 1.3);
    c.fillStyle = '#1c1c1c'; ell(c, 0, -6.2, 4.2, 3.2);
    c.fillStyle = '#f4f4f4'; ell(c, -2.4, -7.2, 1.1, 0.9); ell(c, 2.4, -7.2, 1.1, 0.9);
    c.fillStyle = a.body; ell(c, 0, 0.6, 6.2, 7);
    c.fillStyle = a.accent;
    ell(c, 0, 0.6, 0.55, 7);
    [[-0.5, -0.35], [0.5, -0.35], [-0.55, 0.3], [0.55, 0.3], [0, 0.68]].forEach(function (p) {
      ell(c, p[0] * 6.2, 0.6 + p[1] * 7, 1.5, 1.5);
    });
    c.fillStyle = 'rgba(255,255,255,0.30)';
    ell(c, -2.4 + w * 0.4, -2.2, 2, 2.6, -0.4);
  };

  S.beetle = function (c, a, t) {
    var w = a.slim ? 0.62 : 1;        // blister beetles are narrow and soft
    var shell = a.wing || a.shell;
    var acc = a.accent || a.shell2 || GG.shade(shell, -0.3);
    legs(c, a.legs || GG.shade(a.body, -0.35), 3, 3.6, 6.6 * (a.slim ? 1.1 : 1), t * 8, 1.3);
    c.fillStyle = GG.shade(a.body, -0.2); ell(c, 0, -6, 3.4 * w, 2.6);
    if (a.antennae === 'fan') {
      /* the male ten-lined june beetle opens his antennae like a hand of cards */
      var open = 0.5 + 0.5 * Math.abs(Math.sin(t * 1.4));
      c.fillStyle = a.fan || '#e08a2c';
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        for (var bl = 0; bl < 5; bl++) {
          c.save();
          c.translate(s2 * 2, -8.2);
          c.rotate(s2 * (0.25 + bl * 0.13 * open));
          ell(c, s2 * 1.4, -2.6, 0.55, 2.6);
          c.restore();
        }
      }
    } else {
      line(c, -1.6, -8, -3.6, -11, 0.9, acc);
      line(c, 1.6, -8, 3.6, -11, 0.9, acc);
    }
    c.fillStyle = a.body; ell(c, 0, 0.4, 5.4 * w, 7.2);
    if (a.rim) { c.fillStyle = a.rim; ell(c, 0, 0.6, 5.1 * w, 6.9); }
    c.fillStyle = shell; ell(c, 0, 0.8, 4.9 * w, 6.6);
    c.fillStyle = acc; ell(c, 0, 0.8, 0.5, 6.6);
    if (a.pattern === 'stripes') {
      c.fillStyle = a.accent;
      ell(c, -2.6 * w, 0.8, 0.7, 5.4); ell(c, 2.6 * w, 0.8, 0.7, 5.4);
    } else if (a.pattern === 'tenline') {
      c.fillStyle = a.accent;
      for (var ln = 1; ln <= 4; ln++) {
        var lx = ln * 1.0 * w;
        var lh = 6.2 - ln * 0.9;
        ell(c, -lx, 0.8, 0.34, lh); ell(c, lx, 0.8, 0.34, lh);
      }
    } else if (a.pattern === 'fourspot') {
      c.fillStyle = a.accent;
      ell(c, -2.5 * w, -2.4, 1.6, 1.5, -0.3); ell(c, 2.5 * w, -2.4, 1.6, 1.5, 0.3);
      ell(c, -2.6 * w, 3.4, 1.5, 1.4, 0.3); ell(c, 2.6 * w, 3.4, 1.5, 1.4, -0.3);
      /* short wing cases leave the tip of the abdomen bare */
      c.fillStyle = GG.shade(a.body, -0.3); ell(c, 0, 6.6, 3 * w, 1.6);
    }
    if (a.club) {
      /* a sap beetle's antennae end in a little knob */
      c.fillStyle = acc;
      ell(c, -3.7, -11.1, 1, 0.95); ell(c, 3.7, -11.1, 1, 0.95);
    }
    c.fillStyle = 'rgba(255,255,255,0.28)'; ell(c, -2.2 * w, -2.4, 1.7 * w, 2.6, -0.35);
  };

  S.stagbeetle = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.35), 3, 3.8, 7, t * 7, 1.5);
    c.strokeStyle = a.body; c.lineWidth = 1.9; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath();
      c.moveTo(s * 2, -7); c.quadraticCurveTo(s * 6, -12, s * 2.4, -15.5);
      c.stroke();
      c.beginPath(); c.moveTo(s * 3.6, -12.4); c.lineTo(s * 5.6, -12.9); c.stroke();
    }
    c.fillStyle = GG.shade(a.body, -0.15); ell(c, 0, -6, 3.2, 2.6);
    c.fillStyle = a.wing; ell(c, 0, 0.6, 5.2, 7.4);
    c.fillStyle = GG.shade(a.wing, -0.3); ell(c, 0, 0.6, 0.5, 7);
    c.fillStyle = 'rgba(255,255,255,0.22)'; ell(c, -2.2, -2.2, 1.6, 2.8, -0.3);
  };

  S.rhinobeetle = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.35), 3, 4.2, 7.6, t * 6.5, 1.7);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-1.9, -6.2); c.quadraticCurveTo(-2.6, -12, -6.2, -15.2);
    c.quadraticCurveTo(-2.9, -14.6, -1.0, -16.4);
    c.quadraticCurveTo(1.6, -11.6, 1.9, -6.2);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -5.4, 3.8, 3);
    c.fillStyle = a.wing; ell(c, 0, 1.2, 5.8, 8);
    c.fillStyle = GG.shade(a.wing, -0.3); ell(c, 0, 1.2, 0.55, 7.6);
    c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, -2.6, -2, 1.8, 3, -0.3);
  };

  S.firefly = function (c, a, t) {
    var glow = 0.5 + 0.5 * Math.sin(t * 2.4);
    var pulse = Math.pow(glow, 3);
    if (pulse > 0.02) {
      var g = c.createRadialGradient(0, 5, 0, 0, 5, 17);
      g.addColorStop(0, 'rgba(210,255,150,' + (0.62 * pulse) + ')');
      g.addColorStop(1, 'rgba(210,255,150,0)');
      c.fillStyle = g; ell(c, 0, 5, 17, 17);
    }
    var flap = 0.4 + 0.6 * Math.abs(Math.cos(t * 18));
    c.save(); c.globalAlpha = 0.45; c.scale(flap, 1);
    c.fillStyle = '#f2efe0';
    ell(c, -4.2, -0.5, 3.2, 5.4, 0.3); ell(c, 4.2, -0.5, 3.2, 5.4, -0.3);
    c.restore(); c.globalAlpha = 1;
    legs(c, '#241d12', 3, 2.6, 4.6, t * 9, 1);
    c.fillStyle = '#f0663f'; ell(c, 0, -4.6, 3.1, 2.9);
    c.fillStyle = '#241d12'; ell(c, 0, -6.4, 2.1, 1.9);
    c.fillStyle = a.body; ell(c, 0, 1.2, 3.2, 6.6);
    c.fillStyle = GG.shade(a.body, 0.18); ell(c, -1.4, 0.4, 1.1, 5.2);
    c.fillStyle = '#1b1610'; ell(c, 0, 1.2, 0.5, 6.2);
    c.fillStyle = 'rgba(196,255,120,' + (0.45 + 0.55 * pulse) + ')';
    ell(c, 0, 6.4, 2.4, 2.2);
  };

  S.bee = function (c, a, t) {
    var flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 24));
    var acc = a.accent || a.stripe;
    c.save(); c.globalAlpha = 0.55; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -4.4, -2, 4, 2.4, -0.5); ell(c, 4.4, -2, 4, 2.4, 0.5);
    c.restore(); c.globalAlpha = 1;
    if (a.leaf) {
      /* the disc of leaf she has cut out and is carrying home under her */
      c.fillStyle = a.leaf;
      ell(c, 0.5, 8.4, 2.9, 2.3, 0.2);
      c.fillStyle = GG.shade(a.leaf, -0.26);
      c.beginPath();
      c.moveTo(-2, 8.6); c.quadraticCurveTo(0.8, 10.2, 3.2, 9.4);
      c.quadraticCurveTo(0.6, 10.8, -1.9, 9.6); c.closePath(); c.fill();
      c.strokeStyle = GG.shade(a.leaf, 0.32); c.lineWidth = 0.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-2, 7.8); c.lineTo(2.8, 9.2); c.stroke();
    }
    if (a.shaggy) {
      /* fur thick enough to blur her outline, and made of her own colours:
         a black thorax edged orange, an orange-to-yellow abdomen */
      c.lineWidth = 1.5; c.lineCap = 'round';
      for (var f = 0; f < 30; f++) {
        var fa = f / 30 * Math.PI * 2;
        var fx = Math.cos(fa) * 4.4, fy = Math.sin(fa) * 7.8;
        var hy = 0.4 + fy;
        c.strokeStyle = hy < -1.4 ? acc : GG.shade(acc, 0.3);
        c.beginPath();
        c.moveTo(fx * 0.94, 0.4 + fy * 0.94); c.lineTo(fx * 1.26, 0.4 + fy * 1.3); c.stroke();
      }
    }
    /* legs go on before the body, so only the feet show past her fur */
    if (a.legs) legs(c, a.legs, 3, 2, 4.4, t * 9, 1);
    c.fillStyle = a.head || (a.shaggy ? GG.shade(a.body, 0.14) : acc); ell(c, 0, -6, 2.6, 2.4);
    c.fillStyle = '#fff'; ell(c, -1.1, -6.6, 0.6, 0.7); ell(c, 1.1, -6.6, 0.6, 0.7);
    c.fillStyle = a.thorax || GG.shade(a.body, -0.12); ell(c, 0, -2.6, 3.4, 3);
    if (a.thorax) {
      c.fillStyle = 'rgba(255,255,255,0.28)'; ell(c, -1.2, -3.6, 1.3, 1.4, -0.4);
    }
    c.fillStyle = a.body; ell(c, 0, 2.4, 3.8, 5.2);
    c.fillStyle = acc;
    ell(c, 0, 0.6, 3.5, 0.9); ell(c, 0, 3.4, 3.3, 0.9); ell(c, 0, 5.8, 2.4, 0.8);
    if (a.bellybrush) {
      /* the dense brush of pollen hairs on the UNDERSIDE of her abdomen -
         a leafcutter has no baskets on her legs */
      c.fillStyle = a.bellybrush;
      ell(c, 0, 5.6, 3.1, 1.9);
      c.strokeStyle = a.bellybrush; c.lineWidth = 1; c.lineCap = 'round';
      for (var b = 0; b < 11; b++) {
        var ba = 0.15 + b / 10 * (Math.PI - 0.3);
        var bx = Math.cos(ba) * 3.9, by = 4.2 + Math.sin(ba) * 4.6;
        c.beginPath();
        c.moveTo(bx * 0.74, 4.2 + (by - 4.2) * 0.74); c.lineTo(bx, by); c.stroke();
      }
    }
    if (a.shaggy) {
      c.lineWidth = 0.9; c.lineCap = 'round';
      for (var g = 0; g < 20; g++) {
        var ga = g / 20 * Math.PI * 2;
        var gx = Math.cos(ga) * 3.8, gy = Math.sin(ga) * 6.6;
        c.strokeStyle = (0.8 + gy) < -1.4 ? acc : GG.shade(acc, 0.32);
        c.beginPath();
        c.moveTo(gx * 0.94, 0.8 + gy * 0.94); c.lineTo(gx * 1.2, 0.8 + gy * 1.2); c.stroke();
      }
    }
    line(c, -1, -7.6, -2.6, -10, 0.8, acc);
    line(c, 1, -7.6, 2.6, -10, 0.8, acc);
  };

  S.dragonfly = function (c, a, t) {
    var flap = 0.45 + 0.55 * Math.abs(Math.cos(t * 20));
    /* the newer ones carry marks on the wing, so the wing has to be there */
    var wa = (a.wingSpots || a.amberBase || a.dorsalSpots || a.whiteface) ? 1 : 0.55;
    c.save(); c.globalAlpha = wa; c.scale(1, flap);
    c.fillStyle = a.wing;
    ell(c, -8, -3.4, 8.4, 2, -0.12); ell(c, 8, -3.4, 8.4, 2, 0.12);
    ell(c, -7.4, 0.4, 7.8, 1.9, 0.1); ell(c, 7.4, 0.4, 7.8, 1.9, -0.1);
    if (a.amberBase) {
      /* the amber triangles at the base of the hindwings */
      c.globalAlpha = 1; c.fillStyle = a.amberBase;
      for (var ab = -1; ab <= 1; ab += 2) {
        c.beginPath();
        c.moveTo(ab * 2.4, -0.6); c.lineTo(ab * 7.6, 0.2); c.lineTo(ab * 2.6, 2.1);
        c.closePath(); c.fill();
      }
      c.globalAlpha = wa;
    }
    if (a.wingSpots || a.amberBase || a.dorsalSpots || a.whiteface) {
      /* a hint of an edge, so glass wings still read on a pale background */
      c.globalAlpha = 1;
      c.strokeStyle = 'rgba(96,116,128,0.5)'; c.lineWidth = 0.5;
      var WW = [[-8, -3.4, 8.4, 2, -0.12], [8, -3.4, 8.4, 2, 0.12],
        [-7.4, 0.4, 7.8, 1.9, 0.1], [7.4, 0.4, 7.8, 1.9, -0.1]];
      for (var we = 0; we < 4; we++) {
        c.beginPath();
        c.ellipse(WW[we][0], WW[we][1], WW[we][2], WW[we][3], WW[we][4], 0, Math.PI * 2);
        c.stroke();
      }
      c.globalAlpha = wa;
    }
    if (a.wingSpots) {
      /* one dark spot in the middle of the leading edge of each of the four */
      c.globalAlpha = 1; c.fillStyle = a.accent;
      for (var ws = -1; ws <= 1; ws += 2) {
        ell(c, ws * 8, -5.1, 1.05, 0.85); ell(c, ws * 7.4, -1.3, 0.95, 0.8);
      }
      c.globalAlpha = wa;
    }
    c.restore(); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.5;
    c.fillStyle = a.accent; ell(c, 0, -8.2, 3, 2.6);
    c.fillStyle = a.eye || '#2b2b33'; ell(c, -1.7, -9, 1.7, 1.7); ell(c, 1.7, -9, 1.7, 1.7);
    c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -2.1, -9.5, 0.6, 0.6); ell(c, 2.1, -9.5, 0.6, 0.6);
    if (a.whiteface) {
      /* the bright white face the whole family is named for */
      c.fillStyle = a.whiteface; ell(c, 0, -10.2, 1.5, 1.2);
    }
    c.fillStyle = a.body2 || GG.shade(a.body, -0.1); ell(c, 0, -3.6, 2.6, 3.4);
    c.fillStyle = a.body;
    for (var i = 0; i < 6; i++) {
      ell(c, 0, 0.4 + i * 2.2, 1.9 - i * 0.17, 1.35);
    }
    if (a.pattern === 'stripes') {
      c.fillStyle = a.accent;
      for (var j = 0; j < 5; j++) ell(c, 0, 1.6 + j * 2.2, 1.7 - j * 0.16, 0.4);
    }
    if (a.dorsalSpots) {
      /* a row of long red spots down the top of the abdomen */
      c.fillStyle = a.dorsalSpots;
      for (var d = 0; d < 5; d++) ell(c, 0, 0.6 + d * 2.2, 1 - d * 0.1, 0.85);
    }
  };

  S.damselfly = function (c, a, t) {
    var flap = 0.5 + 0.5 * Math.abs(Math.cos(t * 14));
    c.save(); c.globalAlpha = 0.5; c.scale(1, flap);
    c.fillStyle = a.wing;
    ell(c, -4.5, 2, 3, 7.4, 0.45); ell(c, 4.5, 2, 3, 7.4, -0.45);
    c.restore(); c.globalAlpha = 1;
    c.fillStyle = a.accent; ell(c, 0, -7.6, 2.6, 2);
    c.fillStyle = '#2b2b33'; ell(c, -1.7, -8.1, 1.4, 1.4); ell(c, 1.7, -8.1, 1.4, 1.4);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -3.8, 2, 3);
    c.fillStyle = a.body;
    for (var i = 0; i < 7; i++) ell(c, 0, 0 + i * 2, 1.2 - i * 0.09, 1.15);
    c.fillStyle = a.accent; ell(c, 0, 13.2, 1.2, 1.2);
  };

  S.strider = function (c, a, t) {
    var k = Math.sin(t * 6) * 1.8;
    c.strokeStyle = a.body; c.lineWidth = 1.1; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1, -2.5); c.quadraticCurveTo(s * 6, -7, s * 9, -9); c.stroke();
      c.beginPath(); c.moveTo(s * 1, 0); c.quadraticCurveTo(s * 10, 1 + k, s * 14, 4 + k); c.stroke();
      c.beginPath(); c.moveTo(s * 1, 2); c.quadraticCurveTo(s * 9, 7 - k, s * 12, 11 - k); c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, 0, 1.7, 6);
    c.fillStyle = a.accent; ell(c, 0, -5, 1.7, 1.8);
  };

  S.grasshopper = function (c, a, t) {
    var k = Math.sin(t * 5) * 0.6;
    var wing = a.wing || a.body2;
    var legCol = a.legs || GG.shade(a.body, -0.3);
    c.strokeStyle = legCol; c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1.6, -3); c.quadraticCurveTo(s * 5, -1, s * 6, 2); c.stroke();
      c.beginPath(); c.moveTo(s * 1.6, -1); c.quadraticCurveTo(s * 5.5, 1.5, s * 6.5, 5); c.stroke();
      c.beginPath();
      c.moveTo(s * 2, 2); c.lineTo(s * 6.5, 7 + k); c.lineTo(s * 3.4, 13 + k); c.stroke();
      c.lineWidth = 2.6; c.strokeStyle = wing;
      c.beginPath(); c.moveTo(s * 2, 2); c.lineTo(s * 6.2, 6.6 + k); c.stroke();
      c.lineWidth = 1.3; c.strokeStyle = legCol;
    }
    c.fillStyle = wing; ell(c, 0, 2.5, 3.2, 9);
    c.fillStyle = GG.shade(wing, -0.15); ell(c, 1.4, 2.5, 1.5, 8.2);
    if (a.mottle) {
      /* mottled to match bare dirt */
      c.fillStyle = GG.shade(wing, -0.26);
      var rnd = GG.mulberry32(67);
      for (var m = 0; m < 22; m++) {
        var my = -5.6 + rnd() * 16.4;
        var mh = 3.1 * Math.sqrt(Math.max(0, 1 - ((my - 2.5) / 9) * ((my - 2.5) / 9)));
        ell(c, (rnd() - 0.5) * 2 * mh, my, 0.55, 0.45);
      }
    }
    if (a.crossBars) {
      /* two dark bands straight across each forewing */
      c.fillStyle = a.crossBars;
      ell(c, 0, -1.4, 3, 0.85); ell(c, 0, 4.6, 2.95, 0.85);
    }
    c.fillStyle = a.body; ell(c, 0, -5.2, 2.7, 3.6);
    if (a.mottle) {
      c.fillStyle = GG.shade(a.body, -0.25);
      ell(c, -1.4, -4.4, 0.8, 1.4); ell(c, 1.5, -5.4, 0.7, 1.2);
    }
    c.fillStyle = '#20202a'; ell(c, -1.4, -6.6, 0.9, 1.1); ell(c, 1.4, -6.6, 0.9, 1.1);
    curve(c, -1, -8, -2.5, -12, -3, -15, 0.9, a.accent || legCol);
    curve(c, 1, -8, 2.5, -12, 3, -15, 0.9, a.accent || legCol);
  };

  S.cricket = function (c, a, t) {
    S.grasshopper(c, a, t);
    curve(c, -1, -8, -5, -13, -9, -15, 0.8, a.accent);
    curve(c, 1, -8, 5, -13, 9, -15, 0.8, a.accent);
  };

  S.katydid = function (c, a, t) {
    var k = Math.sin(t * 4) * 0.5;
    c.strokeStyle = GG.shade(a.body, -0.25); c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1.6, -3); c.quadraticCurveTo(s * 5, -2, s * 6.5, 1); c.stroke();
      c.beginPath(); c.moveTo(s * 2, 1); c.lineTo(s * 7, 6 + k); c.lineTo(s * 4, 12 + k); c.stroke();
    }
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(0, -3); c.bezierCurveTo(5.6, 0, 5, 10, 0, 13.5);
    c.bezierCurveTo(-5, 10, -5.6, 0, 0, -3);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.wing, -0.25); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(0, -2); c.lineTo(0, 13); c.stroke();
    for (var i = 0; i < 5; i++) {
      c.beginPath(); c.moveTo(0, 0 + i * 2.4); c.lineTo(3.6 - i * 0.3, 2.6 + i * 2.2); c.stroke();
      c.beginPath(); c.moveTo(0, 0 + i * 2.4); c.lineTo(-3.6 + i * 0.3, 2.6 + i * 2.2); c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, -5.4, 2.6, 3.2);
    c.fillStyle = '#20202a'; ell(c, -1.3, -6.4, 0.8, 1); ell(c, 1.3, -6.4, 0.8, 1);
    curve(c, -1, -8, -6, -14, -10, -17, 0.8, a.accent);
    curve(c, 1, -8, 6, -14, 10, -17, 0.8, a.accent);
  };

  S.mantis = function (c, a, t) {
    var k = Math.sin(t * 3) * 0.8;
    var legCol = a.legs || GG.shade(a.body, -0.2);
    var ant = a.accent || legCol;
    c.strokeStyle = legCol; c.lineWidth = 1.4; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1.6, 2); c.quadraticCurveTo(s * 6, 4, s * 7, 9); c.stroke();
      c.beginPath(); c.moveTo(s * 1.6, 5); c.quadraticCurveTo(s * 6, 8, s * 6.5, 13); c.stroke();
    }
    c.lineWidth = 2; c.strokeStyle = a.body;
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      c.beginPath();
      c.moveTo(s2 * 1.4, -4.5);
      c.lineTo(s2 * (5 + k), -8);
      c.lineTo(s2 * (3 + k), -12.5);
      c.stroke();
      c.lineWidth = 1; c.strokeStyle = GG.shade(a.body, -0.3);
      for (var i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(s2 * (4.4 + k - i * 0.5), -8.6 - i * 1.3);
        c.lineTo(s2 * (5.6 + k - i * 0.5), -9.4 - i * 1.3);
        c.stroke();
      }
      c.lineWidth = 2; c.strokeStyle = a.body;
    }
    c.fillStyle = a.wing; ell(c, 0, 4.5, 3, 9);
    c.fillStyle = a.body2 || GG.shade(a.wing, -0.12); ell(c, 1.2, 4.5, 1.4, 8.2);
    c.fillStyle = a.body; ell(c, 0, -4, 1.7, 4.4);
    c.beginPath();
    c.moveTo(-2.8, -10.5); c.lineTo(2.8, -10.5); c.lineTo(0, -6.4); c.closePath(); c.fill();
    c.fillStyle = '#f7ffe8'; ell(c, -2, -10.4, 1.2, 1.3); ell(c, 2, -10.4, 1.2, 1.3);
    c.fillStyle = a.eye || '#20202a'; ell(c, -2, -10.4, 0.5, 0.6); ell(c, 2, -10.4, 0.5, 0.6);
    curve(c, -1, -11.4, -3, -15, -4, -18, 0.7, ant);
    curve(c, 1, -11.4, 3, -15, 4, -18, 0.7, ant);
  };

  S.stickbug = function (c, a, t) {
    var k = Math.sin(t * 2) * 0.5;
    c.strokeStyle = a.accent; c.lineWidth = 1; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 0.9, -8); c.quadraticCurveTo(s * 5, -11, s * 7, -14 + k); c.stroke();
      c.beginPath(); c.moveTo(s * 0.9, -4); c.quadraticCurveTo(s * 6, -3, s * 8, 0 + k); c.stroke();
      c.beginPath(); c.moveTo(s * 0.9, 0); c.quadraticCurveTo(s * 6, 3, s * 7.5, 8 - k); c.stroke();
    }
    c.strokeStyle = a.body; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 14); c.stroke();
    c.fillStyle = a.wing; ell(c, 0, -12.6, 1.3, 2);
    c.strokeStyle = a.accent; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-0.6, -14); c.lineTo(-2.6, -19); c.stroke();
    c.beginPath(); c.moveTo(0.6, -14); c.lineTo(2.6, -19); c.stroke();
  };

  S.cicada = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 12));
    c.save(); c.globalAlpha = 0.5; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -4.4, 3, 4, 9.5, 0.22); ell(c, 4.4, 3, 4, 9.5, -0.22);
    c.restore(); c.globalAlpha = 1;
    c.strokeStyle = GG.shade(a.wing, -0.25); c.lineWidth = 0.5;
    legs(c, GG.shade(a.body, -0.2), 3, 3, 5.4, t * 6, 1.2);
    c.fillStyle = a.body; ell(c, 0, 2, 3.4, 7);
    c.fillStyle = a.accent; ell(c, 0, -1, 3.6, 2.2);
    c.fillStyle = GG.shade(a.body, 0.1); ell(c, 0, -5.4, 3.8, 3.2);
    c.fillStyle = a.eyes || '#1c1c22';
    ell(c, -3.2, -6, 1.7, 1.8); ell(c, 3.2, -6, 1.7, 1.8);
    c.fillStyle = 'rgba(255,255,255,0.4)'; ell(c, -3.3, -6.4, 0.5, 0.5); ell(c, 3.3, -6.4, 0.5, 0.5);
  };

  S.ant = function (c, a, t) {
    var acc = a.accent || a.legs;
    /* a thatching ant wears a rusty red head and thorax over a black gaster */
    var fore = (a.bicolour && a.head) ? a.head : a.body;
    legs(c, acc, 3, 3.2, 5.6, t * 12, 1.1);
    c.fillStyle = a.body; ell(c, 0, 4.4, 3, 4);
    c.fillStyle = a.bicolour ? fore : GG.shade(a.body, 0.08); ell(c, 0, -0.4, 1.9, 2.4);
    if (a.bicolour) {
      c.fillStyle = fore; ell(c, 0, -2.2, 2.4, 2.2);
      c.fillStyle = GG.shade(fore, -0.18); ell(c, 0, -0.2, 1.5, 1.1);
    }
    c.fillStyle = fore; ell(c, 0, -4.8, 2.5, 2.7);
    c.fillStyle = '#0a0a0a'; ell(c, -1.2, -5.4, 0.62, 0.72); ell(c, 1.2, -5.4, 0.62, 0.72);
    curve(c, -1, -6.4, -3, -8, -3.4, -10.6, 0.8, acc);
    curve(c, 1, -6.4, 3, -8, 3.4, -10.6, 0.8, acc);
  };

  S.caterpillar = function (c, a, t) {
    var alt = a.wing || a.body2 || a.body;
    var ant = a.accent || a.legs || GG.shade(a.body, -0.3);
    for (var i = 6; i >= 0; i--) {
      var wob = Math.sin(t * 5 - i * 0.6) * 1.6;
      var r = 3.4 - i * 0.18;
      var sy = 7 - i * 2.5;
      c.fillStyle = (i % 2) ? alt : a.body;
      ell(c, wob, sy, r, r);
      if (a.woolly) {
        /* thick fur all over, and a tuft of longer hairs near the tail */
        var tail = (i <= 1);
        c.strokeStyle = tail && a.tuft ? a.tuft : (a.fur || GG.shade(a.body, 0.3));
        c.lineWidth = tail ? 0.85 : 0.75; c.lineCap = 'round';
        for (var h = 0; h < 9; h++) {
          var ha = -0.25 + h / 8 * (Math.PI * 2 - 0.5);
          var hx = Math.cos(ha), hy = Math.sin(ha);
          var out = tail ? 2.5 : 1.55;
          c.beginPath();
          c.moveTo(wob + hx * r * 0.55, sy + hy * r * 0.55);
          c.lineTo(wob + hx * (r + out), sy + hy * (r + out));
          c.stroke();
        }
      }
    }
    var hw = Math.sin(t * 5 - 7 * 0.6) * 1.6;
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, hw, -10, 3.5, 3.3);
    if (a.woolly) {
      c.strokeStyle = a.fur || GG.shade(a.body, 0.3); c.lineWidth = 0.75; c.lineCap = 'round';
      for (var k = 0; k < 10; k++) {
        var ka = Math.PI + 0.1 + k / 9 * (Math.PI + 1.6);
        var kx = Math.cos(ka), ky = Math.sin(ka);
        c.beginPath();
        c.moveTo(hw + kx * 2, -10 + ky * 1.9);
        c.lineTo(hw + kx * 5.1, -10 + ky * 4.8);
        c.stroke();
      }
    }
    c.fillStyle = '#1e1e1e'; ell(c, hw - 1.4, -10.6, 0.8, 0.9); ell(c, hw + 1.4, -10.6, 0.8, 0.9);
    c.fillStyle = '#fff'; ell(c, hw - 1.6, -10.9, 0.3, 0.3); ell(c, hw + 1.2, -10.9, 0.3, 0.3);
    curve(c, hw - 1, -12.4, hw - 2, -14, hw - 2.6, -15.6, 0.7, ant);
    curve(c, hw + 1, -12.4, hw + 2, -14, hw + 2.6, -15.6, 0.7, ant);
  };

  S.spider = function (c, a, t) {
    var k = Math.sin(t * 5) * 1.2;
    var legCol = a.legs || a.wing;
    var headCol = a.body2 || a.wing;
    var st = a.stocky ? 1 : 0;
    c.strokeStyle = legCol; c.lineWidth = st ? 2.2 : 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 4; i++) {
        var ang = (st ? -1.05 + i * 0.68 : -1.15 + i * 0.62);
        var px = s * Math.cos(ang) * 3, py = Math.sin(ang) * 3 - 1;
        var reach = st ? 0.9 : 1;
        var spread = st ? 3.4 : 2.6;
        var mx = s * (7 + i * 0.5) * reach, my = py + (i - 1.5) * spread + k * (i % 2 ? 1 : -1);
        c.beginPath();
        c.moveTo(px, py);
        c.quadraticCurveTo(mx, my - 3, s * (9.5 + i * 0.4) * reach, my + 2);
        c.stroke();
      }
    }
    c.fillStyle = headCol; ell(c, 0, -3.5, st ? 3.4 : 2.6, st ? 3.2 : 2.6);
    c.fillStyle = a.body; ell(c, 0, 3, st ? 5.2 : 4.6, st ? 5.9 : 5.6);
    if (a.accent) {
      c.fillStyle = a.accent;
      ell(c, 0, 1.4, 3.6, 0.8); ell(c, 0, 4.2, 3.2, 0.8); ell(c, 0, 6.6, 2.2, 0.7);
    }
    if (st) {
      /* a folding-door spider stabs straight down, so her fangs point
         forward out of the front of her face */
      c.fillStyle = GG.shade(headCol, -0.3);
      c.beginPath();
      c.moveTo(-2.4, -5.6); c.lineTo(-0.5, -5.8); c.lineTo(-1.5, -9.8);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(2.4, -5.6); c.lineTo(0.5, -5.8); c.lineTo(1.5, -9.8);
      c.closePath(); c.fill();
    }
    c.fillStyle = a.eye || '#101010';
    ell(c, -1, -5, 0.6, 0.6); ell(c, 1, -5, 0.6, 0.6);
    ell(c, -2, -4.4, 0.45, 0.45); ell(c, 2, -4.4, 0.45, 0.45);
  };

  S.pillbug = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.3), 3, 2.6, 4.6, t * 10, 1);
    c.fillStyle = a.body; ell(c, 0, 0, 4.4, 6.4);
    c.fillStyle = a.wing;
    for (var i = -2; i <= 2; i++) {
      c.save();
      c.beginPath(); c.ellipse(0, 0, 4.4, 6.4, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = (i % 2 === 0) ? a.wing : GG.shade(a.wing, -0.12);
      c.fillRect(-5, i * 2.2 - 1.1, 10, 2.2);
      c.restore();
    }
    c.fillStyle = a.accent; ell(c, 0, -5.4, 2.8, 1.8);
    curve(c, -1.4, -6.6, -2.6, -8, -3.2, -9.2, 0.7, a.accent);
    curve(c, 1.4, -6.6, 2.6, -8, 3.2, -9.2, 0.7, a.accent);
  };

  S.snail = function (c, a, t) {
    var bob = Math.sin(t * 3) * 0.5;
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-4.5, 6); c.quadraticCurveTo(-5.5, -2, -1.5, -7.5);
    c.quadraticCurveTo(1.5, -10, 3.5, -7);
    c.quadraticCurveTo(5.5, 2, 4.5, 6.5);
    c.quadraticCurveTo(0, 8.5, -4.5, 6); c.closePath(); c.fill();
    c.fillStyle = a.bandedShell ? (a.shell2 || a.shell) : a.wing;
    ell(c, 0.4, 2.6, 6.2, 6.2);
    function spiral(r0, step, w, col) {
      c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
      c.beginPath();
      for (var i = 0; i < 160; i++) {
        var ang = i * 0.28, r = r0 + i * step;
        var x = 0.4 + Math.cos(ang) * r, y = 2.6 + Math.sin(ang) * r;
        if (r > 5.9) break;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    if (a.bandedShell) {
      /* banded like a humbug - chestnut, yellow, dark and red going round */
      spiral(0.8, 0.118, 1.45, a.shell);
      spiral(1.9, 0.118, 0.8, a.band);
      spiral(2.5, 0.118, 0.75, a.band2 || a.band);
    } else {
      spiral(0.5, 0.085, 1.3, a.accent);
    }
    c.fillStyle = 'rgba(255,255,255,0.25)'; ell(c, -1.8, 0.4, 2, 2.4, -0.4);
    c.fillStyle = a.body; ell(c, 1, -7.4 + bob, 2.4, 2.2);
    c.strokeStyle = a.tent || a.body; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(0, -8.6 + bob); c.lineTo(-1.4, -12 + bob); c.stroke();
    c.beginPath(); c.moveTo(2, -8.6 + bob); c.lineTo(3.2, -12.2 + bob); c.stroke();
    c.fillStyle = '#20202a';
    ell(c, -1.5, -12.4 + bob, 0.9, 0.9); ell(c, 3.3, -12.6 + bob, 0.9, 0.9);
    c.fillStyle = '#fff';
    ell(c, -1.7, -12.7 + bob, 0.3, 0.3); ell(c, 3.1, -12.9 + bob, 0.3, 0.3);
  };


  /* ---------- second wave ---------- */

  S.worm = function (c, a, t) {
    var seg = 16;
    function px(i) { return Math.sin(t * 2.6 - i * 0.42) * 2.2; }
    function py(i) { return 13 - i * 1.85; }
    // one smooth body
    c.strokeStyle = a.body; c.lineWidth = 5.4; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(px(0), py(0));
    for (var i = 1; i <= seg; i++) c.lineTo(px(i), py(i));
    c.stroke();
    c.strokeStyle = a.body2 || GG.shade(a.body, 0.16); c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(px(0) - 1, py(0));
    for (var j = 1; j <= seg; j++) c.lineTo(px(j) - 1, py(j));
    c.stroke();
    // faint rings
    c.strokeStyle = a.rings || 'rgba(0,0,0,0.12)'; c.lineWidth = 0.8;
    for (var k = 1; k < seg; k++) {
      c.beginPath();
      c.moveTo(px(k) - 2.7, py(k)); c.lineTo(px(k) + 2.7, py(k));
      c.stroke();
    }
    // the saddle - an ice worm has none
    if (a.accent) {
      c.strokeStyle = a.accent; c.lineWidth = 5.6;
      c.beginPath();
      c.moveTo(px(9), py(9)); c.lineTo(px(11), py(11));
      c.stroke();
    }
    c.fillStyle = GG.shade(a.body, -0.1);
    ell(c, px(seg), py(seg) - 0.6, 2.5, 2.2);
  };

  S.centipede = function (c, a, t) {
    var n = 11;
    c.strokeStyle = a.accent; c.lineWidth = 1; c.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var y = 12 - i * 2.4;
      var wob = Math.sin(t * 7 - i * 0.7) * 1.6;
      for (var s = -1; s <= 1; s += 2) {
        var k = Math.sin(t * 9 + i * 1.1 + (s > 0 ? 0 : 1.7)) * 2;
        c.beginPath();
        c.moveTo(wob + s * 2, y);
        c.quadraticCurveTo(wob + s * 5.5, y + 1, wob + s * 7.5 + k * 0.4, y + 2.6 + k);
        c.stroke();
      }
    }
    for (var j = 0; j < n; j++) {
      var yy = 12 - j * 2.4;
      var w2 = Math.sin(t * 7 - j * 0.7) * 1.6;
      c.fillStyle = (j % 2) ? a.body : a.wing;
      ell(c, w2, yy, 2.7 - Math.abs(j - 5) * 0.06, 1.6);
    }
    var hx = Math.sin(t * 7 - n * 0.7) * 1.6;
    c.fillStyle = a.wing; ell(c, hx, -15, 2.6, 2.1);
    c.strokeStyle = a.accent; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(hx - 1, -16.6); c.lineTo(hx - 4.6, -21); c.stroke();
    c.beginPath(); c.moveTo(hx + 1, -16.6); c.lineTo(hx + 4.6, -21); c.stroke();
  };

  S.millipede = function (c, a, t) {
    var n = 12;
    var legCol = a.legs || a.accent;
    var alt = a.wing || a.body2;
    c.strokeStyle = legCol; c.lineWidth = 0.8; c.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var y = 13 - i * 2.3;
      var wob = Math.sin(t * 2.4 - i * 0.45) * 1.2;
      for (var s = -1; s <= 1; s += 2) {
        c.beginPath();
        c.moveTo(wob + s * 2, y);
        c.lineTo(wob + s * 4.6, y + 1.6 + Math.sin(t * 8 + i) * 0.8);
        c.stroke();
      }
    }
    for (var j = 0; j < n; j++) {
      var yy = 13 - j * 2.3;
      var w2 = Math.sin(t * 2.4 - j * 0.45) * 1.2;
      var rw = 3.1 - Math.abs(j - 6) * 0.05;
      c.fillStyle = (j % 2) ? a.body : alt;
      ell(c, w2, yy, rw, 1.5);
      c.fillStyle = 'rgba(255,255,255,0.10)';
      ell(c, w2 - 1, yy - 0.4, 1.1, 0.8);
      if (a.sideSpots) {
        /* the bright spot on the tip of every keel, marking the cyanide pore */
        c.fillStyle = a.sideSpots;
        ell(c, w2 - rw + 0.35, yy, 0.85, 0.7); ell(c, w2 + rw - 0.35, yy, 0.85, 0.7);
      }
    }
    var hx = Math.sin(t * 2.4 - n * 0.45) * 1.2;
    c.fillStyle = alt; ell(c, hx, -15.5, 2.8, 2.2);
    line(c, hx - 1, -17, hx - 2.8, -19.6, 0.8, legCol);
    line(c, hx + 1, -17, hx + 2.8, -19.6, 0.8, legCol);
  };

  S.harvestman = function (c, a, t) {
    c.strokeStyle = a.wing; c.lineWidth = 1; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 4; i++) {
        var k = Math.sin(t * 3 + i * 1.3 + (s > 0 ? 0 : 1.5)) * 2;
        var knee = 11 + i * 2;
        c.beginPath();
        c.moveTo(s * 1.6, -1 + i * 1.4);
        c.quadraticCurveTo(s * knee, -10 - i * 1.5 + k, s * (knee - 3), 6 + i * 3 + k);
        c.stroke();
      }
    }
    c.fillStyle = a.body; ell(c, 0, 0, 3.4, 4.2);
    c.fillStyle = GG.shade(a.body, -0.2); ell(c, 0, -1.6, 2.6, 2);
    c.fillStyle = '#20202a';
    ell(c, -1.1, -2.4, 0.9, 0.9); ell(c, 1.1, -2.4, 0.9, 0.9);
  };

  S.cranefly = function (c, a, t) {
    var k = Math.sin(t * 2.6);
    var legCol = a.legs || a.accent;
    var wide = a.wingless ? 1.35 : 1;
    c.strokeStyle = legCol; c.lineWidth = 0.95; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        c.beginPath();
        if (a.wingless) {
          /* held wide, one forward, one out, one back */
          c.moveTo(s * 1.7, -3.4 + i * 2.6);
          c.quadraticCurveTo(s * (7.4 + i * 1.4), -7 + i * 5 + k,
            s * (10.4 + i * 0.8), -10 + i * 9 + k * 2);
        } else {
          c.moveTo(s * 1.4, -3 + i * 2.4);
          c.quadraticCurveTo(s * (11 + i * 3.5), 3 + i * 4 + k * 2, s * (8 + i * 2.5), 19 + i * 5 + k * 3);
        }
        c.stroke();
      }
    }
    if (a.wingless) {
      /* a snow fly: no wings whatsoever, just two little knobs where they
         would have been, and a small oval body */
      c.fillStyle = a.halteres || GG.shade(a.body, 0.3);
      ell(c, -2.6, -2.2, 0.85, 0.85); ell(c, 2.6, -2.2, 0.85, 0.85);
      c.strokeStyle = a.halteres || GG.shade(a.body, 0.3); c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(-1.4, -3.2); c.lineTo(-2.4, -2.4); c.stroke();
      c.beginPath(); c.moveTo(1.4, -3.2); c.lineTo(2.4, -2.4); c.stroke();
      c.fillStyle = a.body; ell(c, 0, 1.4, 2.3, 5.8);
      c.fillStyle = GG.shade(a.body, -0.16);
      for (var b = 0; b < 4; b++) ell(c, 0, -1.4 + b * 2, 2.2 - b * 0.22, 0.42);
    } else {
      c.save(); c.globalAlpha = 0.5;
      c.fillStyle = a.wing;
      ell(c, -5.4, 0, 3.2, 8.6, 0.3); ell(c, 5.4, 0, 3.2, 8.6, -0.3);
      c.restore();
      c.fillStyle = a.body; ell(c, 0, 2, 1.7, 8.5);
    }
    c.fillStyle = GG.shade(a.body, 0.14); ell(c, 0, -5.4, 1.8 * wide, 2.6);
    c.fillStyle = '#2b2b33'; ell(c, 0, -7.4, 1.5, 1.4);
    line(c, -0.8, -8.6, -2.4, -11.4, 0.7, legCol);
    line(c, 0.8, -8.6, 2.4, -11.4, 0.7, legCol);
  };

  S.fly = function (c, a, t) {
    var flap = 0.35 + 0.65 * Math.abs(Math.cos(t * 22));
    c.save(); c.globalAlpha = a.wingBands ? 0.9 : 0.55; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -4.6, 0.6, 3.4, 6, 0.32); ell(c, 4.6, 0.6, 3.4, 6, -0.32);
    if (a.wingBands) {
      /* the four dark bands that make an F on each wing */
      c.fillStyle = a.wingBands;
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        c.save();
        c.translate(sgn * 4.6, 0.6); c.rotate(sgn * -0.32);
        c.beginPath(); c.ellipse(0, 0, 3.4, 6, 0, 0, Math.PI * 2); c.clip();
        [-4.2, -1.4, 1.4, 4.2].forEach(function (by, i) {
          c.fillRect(-3.6 + (i % 2 ? 1.6 : 0), by - 0.75, 5.4, 1.5);
        });
        c.restore();
      }
    }
    c.restore();
    legs(c, a.accent, 3, 3, 5, t * 10, 1);
    c.fillStyle = a.body; ell(c, 0, 2, 3.2, 5.4);
    if (a.pattern === 'bands') {
      c.fillStyle = a.accent;
      ell(c, 0, 0.6, 3.1, 0.9); ell(c, 0, 3.2, 2.9, 0.9); ell(c, 0, 5.4, 2.2, 0.8);
    } else {
      c.fillStyle = a.accent;
      ell(c, -1.1, 1.4, 0.55, 4.4); ell(c, 1.1, 1.4, 0.55, 4.4);
    }
    c.fillStyle = GG.shade(a.body, -0.15); ell(c, 0, -3.4, 3, 2.6);
    c.fillStyle = '#8a3a2a';
    ell(c, -1.9, -5, 2, 2.3); ell(c, 1.9, -5, 2, 2.3);
    c.fillStyle = 'rgba(255,255,255,0.4)';
    ell(c, -2.3, -5.6, 0.6, 0.6); ell(c, 2.3, -5.6, 0.6, 0.6);
  };

  S.mayfly = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 9));
    c.save(); c.globalAlpha = 0.7; c.scale(flap, 1);
    c.fillStyle = a.wing;
    c.beginPath(); c.moveTo(-1, -1); c.lineTo(-9.5, -13); c.lineTo(-2.8, 2.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(1, -1); c.lineTo(9.5, -13); c.lineTo(2.8, 2.5); c.closePath(); c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(120,130,150,0.45)'; c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(-1, -1); c.lineTo(-9.5, -13);
    c.moveTo(-1.8, 0.5); c.lineTo(-6.5, -9);
    c.moveTo(1, -1); c.lineTo(9.5, -13);
    c.moveTo(1.8, 0.5); c.lineTo(6.5, -9);
    c.stroke();
    c.restore();
    c.fillStyle = a.body; ell(c, 0, 1, 1.5, 7.5);
    c.fillStyle = a.accent;
    for (var i = 0; i < 4; i++) ell(c, 0, 2 + i * 1.9, 1.4 - i * 0.12, 0.4);
    c.fillStyle = GG.shade(a.body, 0.1); ell(c, 0, -5.6, 1.7, 2.2);
    c.fillStyle = '#2b2b33'; ell(c, -1.1, -6.4, 0.9, 0.9); ell(c, 1.1, -6.4, 0.9, 0.9);
    c.strokeStyle = a.accent; c.lineWidth = 0.7; c.lineCap = 'round';
    for (var s = -1; s <= 1; s++) {
      c.beginPath();
      c.moveTo(0, 8.4);
      c.quadraticCurveTo(s * 2.4, 13, s * 4 + Math.sin(t * 3 + s) * 1.4, 18);
      c.stroke();
    }
  };

  S.caddis = function (c, a, t) {
    var flap = 0.6 + 0.4 * Math.abs(Math.cos(t * 10));
    c.save(); c.scale(flap, 1);
    c.fillStyle = a.wing;
    c.beginPath(); c.moveTo(-0.8, -5); c.lineTo(-6.6, 4); c.lineTo(-2.6, 10); c.lineTo(-0.8, 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0.8, -5); c.lineTo(6.6, 4); c.lineTo(2.6, 10); c.lineTo(0.8, 4); c.closePath(); c.fill();
    c.strokeStyle = a.accent; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-1, -4); c.lineTo(-3.4, 8); c.moveTo(1, -4); c.lineTo(3.4, 8); c.stroke();
    c.restore();
    c.fillStyle = a.body; ell(c, 0, 0, 1.9, 7);
    c.fillStyle = GG.shade(a.body, 0.12); ell(c, 0, -5.6, 2, 2.2);
    c.strokeStyle = a.accent; c.lineWidth = 0.7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.9, -7); c.lineTo(-2.6, -17); c.stroke();
    c.beginPath(); c.moveTo(0.9, -7); c.lineTo(2.6, -17); c.stroke();
  };

  S.lacewing = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 8));
    for (var s = -1; s <= 1; s += 2) {
      c.save(); c.globalAlpha = 0.55; c.scale(flap, 1);
      c.fillStyle = a.wing;
      ell(c, s * 5.6, 2.6, 3.6, 8, s * 0.22);
      ell(c, s * 4.6, -2.4, 3.2, 7.4, s * 0.3);
      c.restore();
      c.save(); c.scale(flap, 1);
      c.strokeStyle = 'rgba(90,150,70,0.55)'; c.lineWidth = 0.45;
      for (var i = 0; i < 5; i++) {
        c.beginPath();
        c.moveTo(s * 2.4, -8 + i * 3.4);
        c.lineTo(s * 8.6, -5 + i * 3.6);
        c.stroke();
      }
      c.restore();
    }
    c.fillStyle = a.body; ell(c, 0, 0.5, 1.6, 7);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -5.4, 1.8, 2.2);
    c.fillStyle = '#f2c23a'; ell(c, -1.3, -6.2, 1.1, 1.1); ell(c, 1.3, -6.2, 1.1, 1.1);
    c.strokeStyle = a.accent; c.lineWidth = 0.7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.9, -7.4); c.quadraticCurveTo(-4, -11, -3, -15); c.stroke();
    c.beginPath(); c.moveTo(0.9, -7.4); c.quadraticCurveTo(4, -11, 3, -15); c.stroke();
  };

  S.antlion = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 7));
    c.save(); c.globalAlpha = 0.5; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -4.6, 3, 3, 9.5, 0.3); ell(c, 4.6, 3, 3, 9.5, -0.3);
    ell(c, -4, -2.4, 2.6, 8, 0.34); ell(c, 4, -2.4, 2.6, 8, -0.34);
    c.restore();
    c.fillStyle = a.body; ell(c, 0, 2, 1.5, 9);
    c.fillStyle = a.accent;
    for (var i = 0; i < 5; i++) ell(c, 0, 3 + i * 2.1, 1.4 - i * 0.1, 0.45);
    c.fillStyle = GG.shade(a.body, 0.12); ell(c, 0, -6.4, 1.9, 2.4);
    c.fillStyle = '#2b2b33'; ell(c, -1.2, -7.4, 1, 1); ell(c, 1.2, -7.4, 1, 1);
    // short clubbed antennae - the antlion's giveaway
    c.strokeStyle = a.accent; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-0.9, -8.4); c.lineTo(-2.8, -12.4); c.stroke();
    c.beginPath(); c.moveTo(0.9, -8.4); c.lineTo(2.8, -12.4); c.stroke();
    c.fillStyle = a.accent;
    ell(c, -3, -13.2, 1.4, 1.2); ell(c, 3, -13.2, 1.4, 1.2);
  };

  S.clearwing = function (c, a, t) {
    var flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 20));
    c.save(); c.scale(flap, 1);
    for (var s = -1; s <= 1; s += 2) {
      c.globalAlpha = 0.32;
      c.fillStyle = '#ffffff';
      ell(c, s * 8.4, -2.4, 7.6, 3.2, s * 0.14);
      c.globalAlpha = 1;
      c.strokeStyle = a.accent; c.lineWidth = 1.1;
      c.beginPath(); c.ellipse(s * 8.4, -2.4, 7.6, 3.2, s * 0.14, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 0.3; c.fillStyle = '#ffffff';
      ell(c, s * 5.4, 2.6, 4.4, 2.4, -s * 0.2);
      c.globalAlpha = 1;
      c.strokeStyle = a.accent; c.lineWidth = 0.9;
      c.beginPath(); c.ellipse(s * 5.4, 2.6, 4.4, 2.4, -s * 0.2, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
    c.fillStyle = a.wing; ell(c, 0, -1, 2.6, 5.4);
    c.fillStyle = a.accent; ell(c, 0, 4.2, 2.4, 3.4);
    c.fillStyle = GG.shade(a.accent, -0.2);
    c.beginPath();
    c.moveTo(-3.4, 7); c.lineTo(0, 5.4); c.lineTo(3.4, 7); c.lineTo(0, 9.6);
    c.closePath(); c.fill();
    c.fillStyle = a.wing; ell(c, 0, -6, 2.2, 2.4);
    c.strokeStyle = a.body; c.lineWidth = 0.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.8, -7.4); c.lineTo(-3.4, -11.4); c.stroke();
    c.beginPath(); c.moveTo(0.8, -7.4); c.lineTo(3.4, -11.4); c.stroke();
  };

  S.hawkmoth = function (c, a, t) {
    var flap = 0.35 + 0.65 * Math.abs(Math.cos(t * 16));
    c.save(); c.scale(flap, 1);
    for (var s = -1; s <= 1; s += 2) {
      c.fillStyle = a.accent;
      c.beginPath();
      c.moveTo(s * 1.2, 1); c.lineTo(s * 8.5, 5.5); c.lineTo(s * 4, 8.5); c.closePath(); c.fill();
      c.fillStyle = a.wing;
      c.beginPath();
      c.moveTo(s * 1.2, -4.5);
      c.lineTo(s * 15, -2.5);
      c.lineTo(s * 11, 3.5);
      c.lineTo(s * 2, 2);
      c.closePath(); c.fill();
      c.strokeStyle = GG.shade(a.wing, -0.28); c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(s * 2.4, -3.4); c.lineTo(s * 13, -1.6); c.stroke();
    }
    c.restore();
    c.fillStyle = a.body; ell(c, 0, 1, 2.6, 8);
    c.fillStyle = GG.shade(a.body, 0.16);
    for (var i = 0; i < 4; i++) ell(c, 0, 2 + i * 2, 2.2 - i * 0.2, 0.55);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -6.4, 2.4, 2.6);
    c.strokeStyle = a.body; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1, -8); c.lineTo(-3.4, -11.6); c.stroke();
    c.beginPath(); c.moveTo(1, -8); c.lineTo(3.4, -11.6); c.stroke();
  };

  S.weevil = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.3), 3, 3.2, 5.6, t * 7, 1.2);
    c.fillStyle = a.wing; ell(c, 0, 2.4, 4.6, 6);
    c.fillStyle = GG.shade(a.wing, -0.22); ell(c, 0, 2.4, 0.5, 5.6);
    c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, -1.9, 0.4, 1.5, 2.2, -0.3);
    c.fillStyle = a.body; ell(c, 0, -3.4, 2.6, 2.6);
    // the long snout
    c.strokeStyle = a.body; c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, -5); c.quadraticCurveTo(1.4, -10, -0.6, -13.6);
    c.stroke();
    c.fillStyle = '#20202a'; ell(c, -1.6, -4.2, 0.8, 0.8); ell(c, 1.6, -4.2, 0.8, 0.8);
    // elbowed antennae halfway down the snout
    c.strokeStyle = a.accent; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(0.5, -8.6); c.lineTo(4, -10.4); c.lineTo(5, -13.4); c.stroke();
    c.beginPath(); c.moveTo(0.2, -8.6); c.lineTo(-3.2, -10.4); c.lineTo(-4.2, -13.4); c.stroke();
  };

  S.shieldbug = function (c, a, t) {
    legs(c, GG.shade(a.accent, 0.1), 3, 3.2, 6.4, t * 6, 1.2);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -8.4);
    c.lineTo(6.4, -4.6); c.lineTo(5.4, 5.4); c.lineTo(0, 9);
    c.lineTo(-5.4, 5.4); c.lineTo(-6.4, -4.6);
    c.closePath(); c.fill();
    // scutellum
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(-3.6, -3.4); c.lineTo(3.6, -3.4); c.lineTo(0, 7.4);
    c.closePath(); c.fill();
    if (a.pattern === 'picasso') {
      c.strokeStyle = '#1f3a6b'; c.lineWidth = 1;
      var spots = [[-3.4, -1], [0, -2], [3.4, -1], [-2.6, 2.6], [2.6, 2.6], [0, 1.4], [-4, -5], [4, -5], [0, 5.4], [-1.6, -5.6], [1.6, -5.6]];
      for (var i = 0; i < spots.length; i++) {
        c.beginPath(); c.arc(spots[i][0], spots[i][1], 1.5, 0, Math.PI * 2); c.stroke();
        c.fillStyle = '#d8433a';
        c.beginPath(); c.arc(spots[i][0], spots[i][1], 0.65, 0, Math.PI * 2); c.fill();
      }
    } else if (a.pattern === 'firebug') {
      c.fillStyle = a.accent;
      c.beginPath(); c.moveTo(-6.4, -4.6); c.lineTo(6.4, -4.6); c.lineTo(5.9, -1.4); c.lineTo(-5.9, -1.4); c.closePath(); c.fill();
      ell(c, -2.9, 3.2, 1.9, 1.9); ell(c, 2.9, 3.2, 1.9, 1.9);
      c.beginPath(); c.moveTo(-5.4, 5.4); c.lineTo(0, 9); c.lineTo(5.4, 5.4); c.closePath(); c.fill();
    } else if (a.pattern === 'speckle') {
      c.fillStyle = a.accent;
      var rnd = GG.mulberry32(9);
      for (var k = 0; k < 16; k++) ell(c, (rnd() - 0.5) * 10, (rnd() - 0.35) * 13, 0.6, 0.6);
    }
    c.fillStyle = GG.shade(a.body, -0.12);
    c.beginPath();
    c.moveTo(-4.4, -7); c.lineTo(4.4, -7); c.lineTo(3, -10); c.lineTo(-3, -10);
    c.closePath(); c.fill();
    c.fillStyle = '#20202a'; ell(c, -3, -9, 0.9, 0.9); ell(c, 3, -9, 0.9, 0.9);
    line(c, -1.6, -10, -3.4, -14.4, 0.8, a.accent);
    line(c, 1.6, -10, 3.4, -14.4, 0.8, a.accent);
  };

  S.assassinbug = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.2), 2, 4.4, 8, t * 6, 1.2);
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(0, -2); c.quadraticCurveTo(6.4, 2, 4.2, 7.4);
    c.quadraticCurveTo(0, 10.4, -4.2, 7.4);
    c.quadraticCurveTo(-6.4, 2, 0, -2);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.wing, -0.25);
    ell(c, 0, 3.4, 1.9, 5.4);
    c.fillStyle = a.body; ell(c, 0, -4.4, 2.4, 3.4);
    c.fillStyle = GG.shade(a.body, -0.15); ell(c, 0, -8.4, 1.9, 2.4);
    c.fillStyle = '#20202a'; ell(c, -1.7, -9, 1, 1); ell(c, 1.7, -9, 1, 1);
    // curved stabbing beak, tucked under
    c.strokeStyle = a.accent; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, -10.4); c.quadraticCurveTo(2.6, -12.6, 1.2, -15.4);
    c.stroke();
    c.strokeStyle = a.accent; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-1.4, -10.6); c.quadraticCurveTo(-5, -14, -4, -18); c.stroke();
    c.beginPath(); c.moveTo(1.4, -10.6); c.quadraticCurveTo(5, -14, 4, -18); c.stroke();
  };

  S.wheelbug = function (c, a, t) {
    S.assassinbug(c, a, t);
    // the cogwheel crest
    c.fillStyle = GG.shade(a.body, -0.2);
    c.beginPath(); c.arc(0, -4.6, 4.4, Math.PI, 0); c.fill();
    c.fillStyle = a.wing;
    for (var i = 0; i < 8; i++) {
      var ang = Math.PI + 0.18 + i * (Math.PI - 0.36) / 7;
      c.beginPath();
      c.moveTo(Math.cos(ang) * 4.2, -4.6 + Math.sin(ang) * 4.2);
      c.lineTo(Math.cos(ang) * 6.1, -4.6 + Math.sin(ang) * 6.1);
      c.lineTo(Math.cos(ang + 0.16) * 4.2, -4.6 + Math.sin(ang + 0.16) * 4.2);
      c.closePath(); c.fill();
    }
  };

  S.aphid = function (c, a, t) {
    legs(c, a.accent, 3, 2.8, 4.4, t * 6, 0.9);
    c.fillStyle = a.body; ell(c, 0, 1.4, 3.8, 4.6);
    c.fillStyle = a.wing; ell(c, -1.2, 0.2, 1.8, 2.2, -0.3);
    // cornicles - the two little exhaust pipes
    c.strokeStyle = a.accent; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-2.4, 4.6); c.lineTo(-3.4, 7.4); c.stroke();
    c.beginPath(); c.moveTo(2.4, 4.6); c.lineTo(3.4, 7.4); c.stroke();
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -3.2, 2.2, 2);
    c.fillStyle = '#2b2b33'; ell(c, -1.2, -3.8, 0.6, 0.6); ell(c, 1.2, -3.8, 0.6, 0.6);
    line(c, -0.9, -4.6, -2.6, -8.4, 0.7, a.accent);
    line(c, 0.9, -4.6, 2.6, -8.4, 0.7, a.accent);
  };

  S.leafhopper = function (c, a, t) {
    var k = Math.sin(t * 5) * 0.5;
    c.strokeStyle = GG.shade(a.body, -0.3); c.lineWidth = 1.1; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1.4, -2); c.quadraticCurveTo(s * 4, -1, s * 5, 1.4); c.stroke();
      c.beginPath(); c.moveTo(s * 1.6, 1); c.lineTo(s * 5.4, 5 + k); c.lineTo(s * 3.2, 9.4 + k); c.stroke();
    }
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(0, -7.4); c.lineTo(3.4, -2); c.lineTo(2.4, 9); c.lineTo(-2.4, 9); c.lineTo(-3.4, -2);
    c.closePath(); c.fill();
    if (a.pattern === 'stripes') {
      c.strokeStyle = a.accent; c.lineWidth = 0.7;
      for (var i = 0; i < 3; i++) {
        c.beginPath(); c.moveTo(-3 + i * 0.5, -2 + i * 3); c.lineTo(3 - i * 0.5, -2 + i * 3); c.stroke();
      }
    }
    c.fillStyle = a.body;
    c.beginPath(); c.moveTo(0, -9.4); c.lineTo(2.4, -5); c.lineTo(-2.4, -5); c.closePath(); c.fill();
    c.fillStyle = '#20202a'; ell(c, -1.7, -5.4, 0.8, 0.8); ell(c, 1.7, -5.4, 0.8, 0.8);
  };

  S.treehopper = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.3), 3, 2.8, 4.6, t * 6, 1);
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(0, -4); c.quadraticCurveTo(3.6, 0, 2.4, 8); c.lineTo(-2.4, 8);
    c.quadraticCurveTo(-3.6, 0, 0, -4);
    c.closePath(); c.fill();
    // the thorn
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-3.4, -3.4); c.lineTo(3.4, -3.4); c.lineTo(1.6, -6);
    c.lineTo(2.6, -14.4); c.lineTo(-2, -5.6);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.body, 0.18);
    c.beginPath();
    c.moveTo(-1.4, -5.4); c.lineTo(1.2, -6); c.lineTo(2.2, -13); c.closePath(); c.fill();
    c.fillStyle = '#20202a'; ell(c, -2.4, -3.2, 0.8, 0.8); ell(c, 2.4, -3.2, 0.8, 0.8);
  };

  S.lanternfly = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 9));
    legs(c, '#2b2b2b', 3, 3.4, 5.6, t * 6, 1.1);
    // a flash of the red underwings
    c.save(); c.scale(flap, 1);
    c.fillStyle = '#d8402f';
    ell(c, -4.2, 3.4, 3.4, 6.4, 0.22); ell(c, 4.2, 3.4, 3.4, 6.4, -0.22);
    c.fillStyle = '#1a1a1a';
    ell(c, -5.4, 7.4, 2, 2.4); ell(c, 5.4, 7.4, 2, 2.4);
    c.restore();
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(-1, -6); c.quadraticCurveTo(-7.4, 0, -5, 9.4); c.lineTo(-1, 8);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(1, -6); c.quadraticCurveTo(7.4, 0, 5, 9.4); c.lineTo(1, 8);
    c.closePath(); c.fill();
    c.fillStyle = a.accent;
    var rnd = GG.mulberry32(17);
    for (var i = 0; i < 14; i++) {
      var sx = (rnd() < 0.5 ? -1 : 1) * (1.6 + rnd() * 4.4);
      ell(c, sx, -4 + rnd() * 11, 0.85, 0.85);
    }
    c.fillStyle = GG.shade(a.body, -0.18); ell(c, 0, -6.4, 2, 3.2);
    c.fillStyle = '#20202a'; ell(c, -1.7, -7.4, 0.9, 0.9); ell(c, 1.7, -7.4, 0.9, 0.9);
  };

  S.waterbug = function (c, a, t) {
    var row = Math.sin(t * 5) * 2.6;
    c.strokeStyle = GG.shade(a.body, -0.25); c.lineWidth = 1.6; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath();
      c.moveTo(s * 3, 2); c.quadraticCurveTo(s * 9, 6 + row, s * 11, 11 + row); c.stroke();
      c.beginPath();
      c.moveTo(s * 3, 5); c.quadraticCurveTo(s * 9, 10 - row, s * 10, 15 - row); c.stroke();
      // raptorial front legs
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(s * 2.6, -4.4); c.lineTo(s * 7, -8.4); c.lineTo(s * 4.4, -12);
      c.stroke();
      c.lineWidth = 1.6;
    }
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -10.4); c.quadraticCurveTo(5.6, -6, 5, 6.4);
    c.quadraticCurveTo(2.6, 12.4, 0, 13.4);
    c.quadraticCurveTo(-2.6, 12.4, -5, 6.4);
    c.quadraticCurveTo(-5.6, -6, 0, -10.4);
    c.closePath(); c.fill();
    c.fillStyle = a.wing; ell(c, 0, 2, 3.7, 7);
    c.fillStyle = GG.shade(a.wing, -0.22); ell(c, 0, 2, 0.45, 6.6);
    // the short breathing tube at the tail
    c.strokeStyle = GG.shade(a.body, -0.2); c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 12.6); c.lineTo(0, 15.4); c.stroke();
    // flat triangular head
    c.fillStyle = GG.shade(a.body, -0.12);
    c.beginPath();
    c.moveTo(-3.4, -8.4); c.lineTo(3.4, -8.4); c.lineTo(0, -14);
    c.closePath(); c.fill();
    c.fillStyle = '#20202a'; ell(c, -2.4, -9.2, 1.2, 1.2); ell(c, 2.4, -9.2, 1.2, 1.2);
  };

  S.backswimmer = function (c, a, t) {
    var row = Math.sin(t * 7) * 3.4;
    c.strokeStyle = GG.shade(a.accent, 0.15); c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath();
      c.moveTo(s * 2, 2.4);
      c.quadraticCurveTo(s * 9, 5 + row, s * 12, 9 + row);
      c.stroke();
      c.lineWidth = 2.4; c.strokeStyle = 'rgba(255,255,255,0.5)';
      c.beginPath();
      c.moveTo(s * 9, 7 + row); c.lineTo(s * 12, 9 + row); c.stroke();
      c.lineWidth = 1.3; c.strokeStyle = GG.shade(a.accent, 0.15);
      c.beginPath(); c.moveTo(s * 1.6, -1); c.quadraticCurveTo(s * 5, -3, s * 6.4, -6); c.stroke();
    }
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -8.4); c.quadraticCurveTo(4.4, -4, 3.4, 6);
    c.lineTo(0, 9.4); c.lineTo(-3.4, 6);
    c.quadraticCurveTo(-4.4, -4, 0, -8.4);
    c.closePath(); c.fill();
    c.fillStyle = a.wing; ell(c, 0, 0, 1.9, 6);
    c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, 0, 4.4, 2.4, 2.4);
    c.fillStyle = a.accent; ell(c, 0, -7.4, 2.2, 2.2);
    c.fillStyle = '#1a1a1a'; ell(c, -1.4, -8, 0.9, 0.9); ell(c, 1.4, -8, 0.9, 0.9);
  };

  S.cockroach = function (c, a, t) {
    legs(c, a.accent, 3, 4, 7.4, t * 12, 1.3);
    c.fillStyle = a.body;
    ell(c, 0, 1.4, 5.4, 8);
    c.fillStyle = a.wing; ell(c, 0, 2.4, 4.6, 7);
    c.fillStyle = GG.shade(a.wing, -0.2); ell(c, 0, 2.4, 0.5, 6.6);
    c.fillStyle = 'rgba(255,255,255,0.18)'; ell(c, -2, -0.6, 1.6, 2.6, -0.3);
    // pronotum shield over the head
    c.fillStyle = GG.shade(a.body, -0.18);
    ell(c, 0, -5.4, 4.4, 3.4);
    c.fillStyle = GG.shade(a.body, -0.35); ell(c, 0, -6, 2.6, 1.9);
    c.strokeStyle = a.accent; c.lineWidth = 0.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.4, -8.4); c.quadraticCurveTo(-6, -13, -4.4, -18.4); c.stroke();
    c.beginPath(); c.moveTo(1.4, -8.4); c.quadraticCurveTo(6, -13, 4.4, -18.4); c.stroke();
    // cerci
    c.beginPath(); c.moveTo(-2, 9); c.lineTo(-3.4, 12); c.stroke();
    c.beginPath(); c.moveTo(2, 9); c.lineTo(3.4, 12); c.stroke();
  };

  S.silverfish = function (c, a, t) {
    var wig = Math.sin(t * 8);
    legs(c, a.accent, 3, 2.6, 4.4, t * 12, 0.9);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -8.4);
    c.quadraticCurveTo(3.6 + wig, -2, 2.2 + wig * 1.4, 6);
    c.lineTo(0 + wig * 1.6, 9.4);
    c.lineTo(-2.2 + wig * 1.4, 6);
    c.quadraticCurveTo(-3.6 + wig, -2, 0, -8.4);
    c.closePath(); c.fill();
    c.fillStyle = a.wing;
    for (var i = 0; i < 5; i++) {
      ell(c, wig * (i * 0.3), -5 + i * 2.8, 2.8 - i * 0.35, 0.8);
    }
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -1, -4, 1.1, 2.4, -0.2);
    c.strokeStyle = a.accent; c.lineWidth = 0.8; c.lineCap = 'round';
    for (var s = -1; s <= 1; s++) {
      c.beginPath();
      c.moveTo(wig * 1.6, 9);
      c.quadraticCurveTo(s * 2.6 + wig, 12.6, s * 4.4 + wig, 16.4);
      c.stroke();
    }
    c.beginPath(); c.moveTo(-1, -8.4); c.quadraticCurveTo(-4.4, -13, -3.4, -17.4); c.stroke();
    c.beginPath(); c.moveTo(1, -8.4); c.quadraticCurveTo(4.4, -13, 3.4, -17.4); c.stroke();
  };

  S.earwig = function (c, a, t) {
    legs(c, a.accent, 3, 3.2, 5.4, t * 9, 1.1);
    c.fillStyle = a.body; ell(c, 0, 2.4, 3.4, 7.4);
    c.fillStyle = a.wing; ell(c, 0, -1.4, 3.2, 3.4);
    c.fillStyle = GG.shade(a.body, 0.15);
    for (var i = 0; i < 4; i++) ell(c, 0, 3 + i * 2, 3.2 - i * 0.2, 0.5);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -6.4, 2.8, 2.8);
    c.fillStyle = '#20202a'; ell(c, -1.4, -7.2, 0.8, 0.8); ell(c, 1.4, -7.2, 0.8, 0.8);
    c.strokeStyle = a.accent; c.lineWidth = 0.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.2, -8.4); c.lineTo(-4, -13.4); c.stroke();
    c.beginPath(); c.moveTo(1.2, -8.4); c.lineTo(4, -13.4); c.stroke();
    // pincers
    c.strokeStyle = GG.shade(a.accent, 0.2); c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-1.9, 9.4); c.quadraticCurveTo(-4.4, 13, -1.4, 15.4); c.stroke();
    c.beginPath();
    c.moveTo(1.9, 9.4); c.quadraticCurveTo(4.4, 13, 1.4, 15.4); c.stroke();
  };

  S.termite = function (c, a, t) {
    legs(c, GG.shade(a.accent, 0.1), 3, 2.6, 4.4, t * 9, 0.9);
    c.fillStyle = a.body; ell(c, 0, 3, 3, 5);
    c.fillStyle = GG.shade(a.body, -0.06); ell(c, 0, -1.4, 2.2, 2.4);
    c.fillStyle = a.accent; ell(c, 0, -5.4, 3, 3.2);
    c.fillStyle = '#3a2a18'; ell(c, -1.4, -6, 0.7, 0.7); ell(c, 1.4, -6, 0.7, 0.7);
    c.strokeStyle = GG.shade(a.accent, -0.15); c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.6, -7.6); c.lineTo(-3.2, -10.4); c.stroke();
    c.beginPath(); c.moveTo(1.6, -7.6); c.lineTo(3.2, -10.4); c.stroke();
    c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-1, -8); c.quadraticCurveTo(-3.4, -10, -3, -12.6); c.stroke();
    c.beginPath(); c.moveTo(1, -8); c.quadraticCurveTo(3.4, -10, 3, -12.6); c.stroke();
  };

  S.bedbug = function (c, a, t) {
    legs(c, a.accent, 3, 2.6, 4.4, t * 7, 1);
    c.fillStyle = a.body; ell(c, 0, 1.4, 4.4, 5.2);
    c.fillStyle = a.wing;
    for (var i = 0; i < 4; i++) ell(c, 0, -0.6 + i * 2, 4.1 - i * 0.5, 0.65);
    c.fillStyle = GG.shade(a.body, -0.15); ell(c, 0, -4.4, 2.6, 2.2);
    c.fillStyle = '#2b1a10'; ell(c, -1.7, -5, 0.8, 0.8); ell(c, 1.7, -5, 0.8, 0.8);
    line(c, -1.2, -6, -3, -9.4, 0.7, a.accent);
    line(c, 1.2, -6, 3, -9.4, 0.7, a.accent);
  };

  S.wasp = function (c, a, t) {
    var flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 22));
    c.save(); c.globalAlpha = 0.5; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -4.6, -1, 3.4, 6.4, -0.36); ell(c, 4.6, -1, 3.4, 6.4, 0.36);
    c.restore(); c.globalAlpha = 1;
    c.fillStyle = a.face || a.accent; ell(c, 0, -6.4, 2.4, 2.2);
    c.fillStyle = a.face ? '#2a2620' : '#f6efd8';
    ell(c, -1.1, -6.8, 0.5, 0.6); ell(c, 1.1, -6.8, 0.5, 0.6);
    c.fillStyle = a.body; ell(c, 0, -3, 3, 2.8);
    // the pinched waist
    c.strokeStyle = a.accent; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(0, -0.6); c.lineTo(0, 1.4); c.stroke();
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, 1); c.quadraticCurveTo(3.8, 3, 2.4, 7.4);
    c.quadraticCurveTo(0, 10.4, -2.4, 7.4);
    c.quadraticCurveTo(-3.8, 3, 0, 1);
    c.closePath(); c.fill();
    c.fillStyle = a.band || a.accent;
    if (a.tipOnly) {
      /* a bald-faced hornet is black, with white only right at the tip */
      ell(c, 0, 7.2, 2.3, 0.8); ell(c, 0, 8.8, 1.9, 0.8);
    } else {
      ell(c, 0, 3.2, 3, 0.9); ell(c, 0, 5.6, 2.4, 0.9);
    }
    c.strokeStyle = a.accent; c.lineWidth = 0.9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 9.6); c.lineTo(0, 12); c.stroke();
    line(c, -1, -7.8, -3, -10.8, 0.8, a.accent);
    line(c, 1, -7.8, 3, -10.8, 0.8, a.accent);
    legs(c, a.accent, 2, 3, 5.4, t * 9, 1);
  };

  /* ================= the river, the beach and the tidepools ================= */

  S.stonefly = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.3), 3, 3.4, 6, t * 7, 1.1);
    /* two long tails */
    curve(c, -1.1, 7, -2.2, 10, -3.4, 13.5, 0.8, a.accent);
    curve(c, 1.1, 7, 2.2, 10, 3.4, 13.5, 0.8, a.accent);
    /* wings folded flat down the back */
    c.fillStyle = a.wing; c.globalAlpha = 0.85;
    ell(c, -1.5, 2.4, 2.9, 8.4, 0.06);
    ell(c, 1.5, 2.4, 2.9, 8.4, -0.06);
    c.globalAlpha = 1;
    c.strokeStyle = GG.shade(a.wing, -0.28); c.lineWidth = 0.4;
    for (var i = -1; i <= 1; i++) {
      c.beginPath(); c.moveTo(i * 2.4, -4.4); c.lineTo(i * 3, 9.6); c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, 1.4, 2.2, 8);
    c.fillStyle = GG.shade(a.body, 0.12); ell(c, 0, -5.2, 2.5, 3.2);
    c.fillStyle = a.accent; ell(c, -1, -7.2, 0.7, 0.7); ell(c, 1, -7.2, 0.7, 0.7);
    curve(c, -1.4, -7.8, -3, -11, -4.2, -14, 0.7, a.accent);
    curve(c, 1.4, -7.8, 3, -11, 4.2, -14, 0.7, a.accent);
  };

  S.dobsonfly = function (c, a, t) {
    var flap = 0.72 + Math.sin(t * 9) * 0.28;
    legs(c, GG.shade(a.body, -0.3), 3, 4, 7, t * 7, 1.4);
    /* the long soft wings, one pair each side */
    c.save(); c.scale(flap, 1);
    c.fillStyle = a.wing; c.globalAlpha = 0.62;
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      ell(c, s2 * 5.4, 2.2, 4.4, 11, s2 * 0.1);
      ell(c, s2 * 3.6, 4.6, 3.4, 8.6, s2 * 0.12);
    }
    c.globalAlpha = 1;
    c.strokeStyle = GG.shade(a.wing, -0.3); c.lineWidth = 0.35;
    for (var k = -1; k <= 1; k += 2) for (var j = -1; j <= 1; j++) {
      c.beginPath();
      c.moveTo(k * 2, -5); c.quadraticCurveTo(k * (5 + j), 3, k * (6 + j * 1.4), 11);
      c.stroke();
    }
    c.restore();
    c.fillStyle = a.body; ell(c, 0, 2.6, 2.6, 10.5);
    c.fillStyle = GG.shade(a.body, 0.14); ell(c, 0, -5.4, 3, 4);
    c.fillStyle = a.eyes || '#e8c86a'; ell(c, -1.7, -7.2, 1.1, 1); ell(c, 1.7, -7.2, 1.1, 1);
    /* the great harmless jaws: out, up, and hooked gently inward */
    for (var g = -1; g <= 1; g += 2) {
      c.strokeStyle = GG.shade(a.body, 0.22); c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(g * 1.8, -8.4);
      c.bezierCurveTo(g * 6.4, -10.4, g * 7, -15.4, g * 3.4, -18.2);
      c.stroke();
      c.strokeStyle = GG.shade(a.body, 0.4); c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(g * 3.4, -18.2);
      c.quadraticCurveTo(g * 2.6, -19.4, g * 1.8, -19.2);
      c.stroke();
      /* the little tooth halfway along */
      c.beginPath();
      c.moveTo(g * 5.9, -13.2); c.lineTo(g * 4.1, -13.6);
      c.stroke();
    }
    curve(c, -2, -8.4, -5, -12, -7, -15, 0.6, a.accent);
    curve(c, 2, -8.4, 5, -12, 7, -15, 0.6, a.accent);
  };

  S.whirligig = function (c, a, t) {
    var spin = Math.sin(t * 6) * 0.5;
    c.save(); c.rotate(spin * 0.16);
    c.strokeStyle = GG.shade(a.body, 0.25); c.lineWidth = 1.1; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      c.beginPath();
      c.moveTo(s2 * 3, 1.5);
      c.quadraticCurveTo(s2 * 7, 3 + spin, s2 * 8.5, 6.5 + spin);
      c.stroke();
      c.beginPath();
      c.moveTo(s2 * 3, -1); c.lineTo(s2 * 6.5, -3.5);
      c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, 0.6, 4.4, 7.4);
    c.fillStyle = a.wing; ell(c, 0, 1.2, 3.8, 6.6);
    c.fillStyle = 'rgba(255,255,255,0.42)'; ell(c, -1.6, -1.8, 1.6, 3, -0.3);
    c.fillStyle = a.accent; ell(c, 0, 1.2, 0.4, 6.4);
    /* the two pairs of eyes */
    c.fillStyle = a.eyes || '#d8e4ee';
    ell(c, -2.2, -5.4, 0.9, 0.8); ell(c, 2.2, -5.4, 0.9, 0.8);
    ell(c, -2.4, -3.4, 0.7, 0.6); ell(c, 2.4, -3.4, 0.7, 0.6);
    c.restore();
  };

  S.boatman = function (c, a, t) {
    var row = Math.sin(t * 9);
    c.strokeStyle = GG.shade(a.body, -0.2); c.lineWidth = 1.1; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      /* the oars */
      c.beginPath();
      c.moveTo(s2 * 2.6, 2);
      c.quadraticCurveTo(s2 * 7, 4 + row * 1.6, s2 * 10, 7 + row * 2.4);
      c.stroke();
      c.beginPath();
      c.moveTo(s2 * 2.6, -1); c.lineTo(s2 * 5.6, -0.4); c.stroke();
    }
    /* the feathered blades */
    c.strokeStyle = GG.shade(a.body, -0.05); c.lineWidth = 0.4;
    for (var g = -1; g <= 1; g += 2) for (var i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(g * (8 + i * 0.6), 5.6 + row * 2 + i * 0.4);
      c.lineTo(g * (9.6 + i * 0.6), 7.4 + row * 2 + i * 0.4);
      c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, 0.4, 3.6, 6.8);
    c.fillStyle = a.wing; ell(c, 0, 1, 3.1, 6);
    c.strokeStyle = a.accent; c.lineWidth = 0.45;
    for (var j = -2; j <= 3; j++) {
      c.beginPath(); c.moveTo(-3, j * 1.5 + 0.4); c.lineTo(3, j * 1.5 - 0.2); c.stroke();
    }
    c.fillStyle = GG.shade(a.body, 0.1); ell(c, 0, -5.6, 2.6, 2.4);
    c.fillStyle = a.eyes || '#2b2418';
    ell(c, -1.5, -6.2, 0.9, 0.9); ell(c, 1.5, -6.2, 0.9, 0.9);
    c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -1.2, -2.2, 1.1, 2.2, -0.3);
  };

  /* a walking crab, seen from above, facing up */
  S.crab = function (c, a, t) {
    var step = Math.sin(t * 6);
    c.strokeStyle = GG.shade(a.body, -0.25); c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      for (var i = 0; i < 4; i++) {
        var yy = -1.6 + i * 2.5;
        var k = Math.sin(t * 6 + i * 1.5 + (s2 > 0 ? 0 : 1.8)) * 1.3;
        c.beginPath();
        c.moveTo(s2 * 4.5, yy);
        c.quadraticCurveTo(s2 * 8.5, yy + 1 + k, s2 * 10.5, yy + 4 + k);
        c.stroke();
      }
      /* the claw arms */
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(s2 * 4.4, -3.6);
      c.quadraticCurveTo(s2 * 9.5, -6, s2 * 8.6, -10.5);
      c.stroke();
    }
    /* the claws */
    c.fillStyle = GG.shade(a.body, -0.1);
    for (var g = -1; g <= 1; g += 2) {
      c.save(); c.translate(g * 8.6, -11.4); c.rotate(g * (0.2 + step * 0.12));
      ell(c, 0, 0, 2.1, 3.1);
      c.fillStyle = a.wing;
      ell(c, g * 0.5, -1.6, 1.1, 1.9, g * 0.4);
      c.fillStyle = GG.shade(a.body, -0.1);
      c.restore();
    }
    /* the shell */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-6.4, -1.2);
    c.quadraticCurveTo(-6.8, -6.4, 0, -7);
    c.quadraticCurveTo(6.8, -6.4, 6.4, -1.2);
    c.quadraticCurveTo(5.2, 4.4, 0, 5.2);
    c.quadraticCurveTo(-5.2, 4.4, -6.4, -1.2);
    c.closePath(); c.fill();
    c.fillStyle = a.wing;
    ell(c, 0, -1.6, 4.6, 3.2);
    c.fillStyle = 'rgba(255,255,255,0.24)'; ell(c, -2, -3, 2, 1.3, -0.3);
    c.fillStyle = a.accent;
    ell(c, -3.4, 1.6, 0.7, 0.6); ell(c, 3.4, 1.6, 0.7, 0.6);
    /* the eyes, on stalks for a ghost crab */
    if (a.stalks) {
      c.strokeStyle = GG.shade(a.body, -0.15); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-2.2, -5.6); c.lineTo(-2.6, -9.4); c.stroke();
      c.beginPath(); c.moveTo(2.2, -5.6); c.lineTo(2.6, -9.4); c.stroke();
      c.fillStyle = a.eyes || '#2b2b2b';
      ell(c, -2.6, -10, 1.1, 1.4); ell(c, 2.6, -10, 1.1, 1.4);
    } else {
      c.fillStyle = a.eyes || '#2b2b2b';
      ell(c, -2.2, -5.6, 1, 1.1); ell(c, 2.2, -5.6, 1, 1.1);
    }
  };

  S.hermitcrab = function (c, a, t) {
    var step = Math.sin(t * 5);
    /* the borrowed shell behind */
    c.fillStyle = a.wing;
    ell(c, 0.4, 4.4, 6.6, 6.2, 0.1);
    c.strokeStyle = GG.shade(a.wing, -0.3); c.lineWidth = 1;
    c.beginPath();
    for (var i = 0; i < 60; i++) {
      var ang = i * 0.3, r = 0.6 + i * 0.09;
      if (r > 5.6) break;
      var x = 0.4 + Math.cos(ang) * r, y = 4.4 + Math.sin(ang) * r * 0.95;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.24)'; ell(c, -2, 2.4, 2.2, 1.8, -0.4);
    /* the legs poking out at the front */
    c.strokeStyle = GG.shade(a.body, -0.15); c.lineWidth = 1.2; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      for (var j = 0; j < 2; j++) {
        var k = Math.sin(t * 5 + j * 1.7 + (s2 > 0 ? 0 : 1.6)) * 1.2;
        c.beginPath();
        c.moveTo(s2 * 2.6, -1.4 + j * 2.2);
        c.quadraticCurveTo(s2 * 6, 0.6 + j * 2 + k, s2 * 7.4, 3.4 + j * 1.6 + k);
        c.stroke();
      }
    }
    /* body and the one big claw */
    c.fillStyle = a.body; ell(c, 0, -2.6, 3.4, 3.6);
    c.fillStyle = GG.shade(a.body, -0.1);
    c.save(); c.translate(-3.8, -7 + step * 0.4); c.rotate(-0.4); ell(c, 0, 0, 2.4, 3.2); c.restore();
    c.fillStyle = a.body;
    c.save(); c.translate(3.4, -6.4 - step * 0.4); c.rotate(0.4); ell(c, 0, 0, 1.7, 2.4); c.restore();
    c.strokeStyle = GG.shade(a.body, 0.15); c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(-1.4, -5.4); c.lineTo(-2, -9); c.stroke();
    c.beginPath(); c.moveTo(1.4, -5.4); c.lineTo(2, -9); c.stroke();
    c.fillStyle = a.eyes || '#2b2b2b';
    ell(c, -2, -9.4, 0.9, 1); ell(c, 2, -9.4, 0.9, 1);
  };

  S.seastar = function (c, a, t) {
    var pulse = 1 + Math.sin(t * 1.4) * 0.02;
    function arm(ang) { return Math.pow(Math.abs(Math.cos(ang * 2.5)), 1.5); }
    function outline(c2, k) {
      c2.beginPath();
      for (var i = 0; i <= 72; i++) {
        var ang = -Math.PI / 2 + i / 72 * Math.PI * 2;
        var r = (4.2 + 7.6 * arm(ang)) * k;
        var x = Math.cos(ang) * r, y = Math.sin(ang) * r;
        if (i === 0) c2.moveTo(x, y); else c2.lineTo(x, y);
      }
      c2.closePath(); c2.fill();
    }
    c.save(); c.scale(pulse, pulse);
    c.fillStyle = a.body; outline(c, 1);
    c.fillStyle = a.wing; outline(c, 0.7);
    /* the little bumps running down each of the five arms */
    c.fillStyle = a.accent;
    for (var k = 0; k < 5; k++) {
      var dir = -Math.PI / 2 + k / 5 * Math.PI * 2;
      for (var d = 2.4; d < 11; d += 2) {
        ell(c, Math.cos(dir) * d, Math.sin(dir) * d, 0.62, 0.62);
        if (d < 8) {
          ell(c, Math.cos(dir + 0.2) * d * 0.92, Math.sin(dir + 0.2) * d * 0.92, 0.46, 0.46);
          ell(c, Math.cos(dir - 0.2) * d * 0.92, Math.sin(dir - 0.2) * d * 0.92, 0.46, 0.46);
        }
      }
    }
    ell(c, 0, 0, 1.2, 1.2);
    c.restore();
  };

  S.anemone = function (c, a, t) {
    /* the column */
    c.fillStyle = GG.shade(a.body, -0.15);
    ell(c, 0, 2.6, 6.4, 5.4);
    c.fillStyle = a.body;
    ell(c, 0, 0.6, 6.8, 5.6);
    /* the ring of tentacles */
    c.strokeStyle = a.wing; c.lineWidth = 1.5; c.lineCap = 'round';
    for (var i = 0; i < 22; i++) {
      var ang = i / 22 * Math.PI * 2;
      var wig = Math.sin(t * 2.2 + i * 0.9) * 1.4;
      var r0 = 3.4, r1 = 8.4 + Math.sin(i * 2.3) * 0.9;
      c.beginPath();
      c.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0 * 0.9);
      c.quadraticCurveTo(
        Math.cos(ang) * (r1 * 0.7) + wig * 0.5, Math.sin(ang) * (r1 * 0.7) * 0.9,
        Math.cos(ang) * r1 + wig, Math.sin(ang) * r1 * 0.9 + wig * 0.4);
      c.stroke();
    }
    c.strokeStyle = a.accent; c.lineWidth = 0.7;
    for (var j = 0; j < 11; j++) {
      var an = j / 11 * Math.PI * 2 + 0.14;
      c.beginPath();
      c.moveTo(Math.cos(an) * 3.4, Math.sin(an) * 3);
      c.lineTo(Math.cos(an) * 7, Math.sin(an) * 6.3);
      c.stroke();
    }
    /* the mouth */
    c.fillStyle = GG.shade(a.body, -0.3); ell(c, 0, 0.4, 2.4, 1.9);
    c.fillStyle = a.accent; ell(c, 0, 0.4, 1.1, 0.7);
  };

  S.urchin = function (c, a, t) {
    var wob = Math.sin(t * 1.6) * 0.06;
    c.strokeStyle = a.body; c.lineWidth = 1.3; c.lineCap = 'round';
    for (var i = 0; i < 26; i++) {
      var ang = i / 26 * Math.PI * 2 + wob;
      var len = 7 + ((i * 7) % 5) * 0.75;
      c.beginPath();
      c.moveTo(Math.cos(ang) * 3.4, Math.sin(ang) * 3.2);
      c.lineTo(Math.cos(ang) * len, Math.sin(ang) * len * 0.95);
      c.stroke();
    }
    c.strokeStyle = GG.shade(a.body, 0.25); c.lineWidth = 0.6;
    for (var j = 0; j < 13; j++) {
      var an = j / 13 * Math.PI * 2 + 0.24 + wob;
      c.beginPath();
      c.moveTo(Math.cos(an) * 3.2, Math.sin(an) * 3);
      c.lineTo(Math.cos(an) * 6, Math.sin(an) * 5.7);
      c.stroke();
    }
    c.fillStyle = a.accent; ell(c, 0, 0, 4.2, 4);
    c.fillStyle = a.wing; ell(c, 0, -0.4, 3.4, 3.2);
    c.fillStyle = GG.shade(a.accent, -0.2); ell(c, 0, 0, 1.2, 1.1);
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -1.4, -1.6, 1.1, 0.9, -0.4);
  };

  S.limpet = function (c, a, t) {
    c.fillStyle = GG.shade(a.body, -0.25);
    ell(c, 0, 2.6, 7.2, 3.4);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-7.2, 3);
    c.quadraticCurveTo(-4.4, -6.4, 0.4, -7.4);
    c.quadraticCurveTo(5, -6.2, 7.2, 3);
    c.quadraticCurveTo(0, 5.4, -7.2, 3);
    c.closePath(); c.fill();
    c.strokeStyle = a.accent; c.lineWidth = 0.55;
    for (var i = -3; i <= 3; i++) {
      c.beginPath();
      c.moveTo(0.4, -7);
      c.quadraticCurveTo(i * 2.2, -1, i * 2.35, 3.4);
      c.stroke();
    }
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(-3.4, -1.4);
    c.quadraticCurveTo(-1.6, -6.4, 0.4, -6.8);
    c.quadraticCurveTo(2.2, -6, 3, -1.6);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.28)'; ell(c, -1.6, -3, 1.4, 2.2, -0.3);
  };

  S.periwinkle = function (c, a, t) {
    var bob = Math.sin(t * 2.4) * 0.4;
    /* the pale foot creeping out at the front */
    c.fillStyle = GG.shade(a.wing, 0.34);
    ell(c, 0, 5.4 + bob * 0.3, 4.6, 2.9);
    c.fillStyle = GG.shade(a.wing, 0.5);
    ell(c, 0, 6.4 + bob * 0.3, 3.2, 1.7);
    /* a little tower of whorls, widest at the bottom - a sea snail seen
       from the side, which reads instantly at this size */
    var whorls = [[4.2, 5.8, 4.4], [0.2, 4.7, 3.6], [-3.2, 3.5, 2.7], [-6, 2.3, 1.8], [-8.2, 1.2, 1]];
    for (var i = 0; i < whorls.length; i++) {
      var w = whorls[i];
      c.fillStyle = (i % 2) ? GG.shade(a.body, 0.12) : a.body;
      ell(c, 0, w[0], w[1], w[2]);
    }
    /* the seam running round each whorl */
    c.strokeStyle = a.accent; c.lineWidth = 0.7; c.lineCap = 'round';
    for (var j = 0; j < whorls.length - 1; j++) {
      var q = whorls[j];
      c.beginPath();
      c.moveTo(-q[1] * 0.94, q[0] - q[2] * 0.5);
      c.quadraticCurveTo(0, q[0] - q[2] * 1.15, q[1] * 0.94, q[0] - q[2] * 0.5);
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.34)';
    ell(c, -1.8, -0.6, 1.5, 3.4, -0.22);
    /* the mouth of the shell, with its little trapdoor */
    c.fillStyle = GG.shade(a.body, -0.4);
    ell(c, -0.4, 5.6, 3, 2.2, -0.1);
    c.fillStyle = GG.shade(a.accent, 0.5);
    ell(c, -0.4, 5.8 + bob * 0.3, 2.1, 1.5, -0.1);
    c.fillStyle = 'rgba(255,255,255,0.28)';
    ell(c, -1.1, 5.4 + bob * 0.3, 0.8, 0.6, -0.1);
  };

  S.nudibranch = function (c, a, t) {
    var ripple = Math.sin(t * 3);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -9.4);
    c.quadraticCurveTo(4.6, -6, 4.2, 1);
    c.quadraticCurveTo(3.6, 8.4, 0, 10.4);
    c.quadraticCurveTo(-3.6, 8.4, -4.2, 1);
    c.quadraticCurveTo(-4.6, -6, 0, -9.4);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.body, 0.2);
    ell(c, 0, 0.4, 2.6, 7.4);
    /* the fingers along its back */
    c.strokeStyle = a.wing; c.lineWidth = 1.5; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      for (var i = 0; i < 5; i++) {
        var yy = -5.4 + i * 3;
        var k = Math.sin(t * 3 + i * 0.8 + (s2 > 0 ? 0 : 1.2)) * 0.8;
        c.beginPath();
        c.moveTo(s2 * 2.2, yy);
        c.quadraticCurveTo(s2 * 4.6, yy - 1 + k, s2 * 5.6, yy - 3 + k);
        c.stroke();
      }
    }
    c.fillStyle = a.accent;
    for (var g = -1; g <= 1; g += 2) for (var j = 0; j < 5; j++) {
      var y2 = -8.2 + j * 3 + Math.sin(t * 3 + j * 0.8 + (g > 0 ? 0 : 1.2)) * 0.8;
      ell(c, g * 5.6, y2, 0.8, 0.9);
    }
    /* the pair of little horns */
    c.strokeStyle = a.wing; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(-1.5, -8.4); c.lineTo(-2.6, -12 + ripple * 0.4); c.stroke();
    c.beginPath(); c.moveTo(1.5, -8.4); c.lineTo(2.6, -12 - ripple * 0.4); c.stroke();
    c.fillStyle = a.accent;
    ell(c, -2.6, -12.4 + ripple * 0.4, 0.8, 1); ell(c, 2.6, -12.4 - ripple * 0.4, 0.8, 1);
    /* the gill plume at the back */
    c.strokeStyle = a.wing; c.lineWidth = 1;
    for (var m = -2; m <= 2; m++) {
      c.beginPath(); c.moveTo(0, 6.6);
      c.quadraticCurveTo(m * 1.6, 8.6, m * 2.4, 10.6 + Math.abs(m) * -0.5);
      c.stroke();
    }
  };

  S.tigerbeetle = function (c, a, t) {
    legs(c, GG.shade(a.body, -0.3), 3, 5.4, 8.4, t * 12, 1.2);
    c.fillStyle = GG.shade(a.body, -0.15); ell(c, 0, -6.4, 4, 3);
    c.fillStyle = a.eyes || '#e8e2c8';
    ell(c, -2.8, -7.2, 1.7, 1.6); ell(c, 2.8, -7.2, 1.7, 1.6);
    c.fillStyle = GG.shade(a.body, -0.4);
    ell(c, -2.8, -7.4, 0.9, 0.9); ell(c, 2.8, -7.4, 0.9, 0.9);
    /* the sickle jaws */
    c.strokeStyle = '#f0ead4'; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.4, -8.4); c.quadraticCurveTo(-3.4, -11, -0.6, -12.4); c.stroke();
    c.beginPath(); c.moveTo(1.4, -8.4); c.quadraticCurveTo(3.4, -11, 0.6, -12.4); c.stroke();
    c.fillStyle = GG.shade(a.body, -0.05); ell(c, 0, -3.4, 2.8, 2.4);
    c.fillStyle = a.body; ell(c, 0, 2.6, 5, 7);
    c.fillStyle = a.wing; ell(c, 0, 2.8, 4.5, 6.4);
    c.fillStyle = GG.shade(a.body, -0.35); ell(c, 0, 2.8, 0.45, 6.3);
    /* the pale squiggles */
    c.fillStyle = a.accent;
    ell(c, -3.4, 0.4, 1.5, 0.6, -0.5); ell(c, 3.4, 0.4, 1.5, 0.6, 0.5);
    ell(c, -3.6, 4.4, 1.7, 0.7, 0.35); ell(c, 3.6, 4.4, 1.7, 0.7, -0.35);
    ell(c, 0, 8.2, 1.5, 0.7);
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -2, 0.2, 1.5, 2.6, -0.3);
  };

  S.sandhopper = function (c, a, t) {
    var kick = Math.sin(t * 8);
    c.strokeStyle = GG.shade(a.body, -0.25); c.lineWidth = 0.9; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      for (var i = 0; i < 4; i++) {
        var yy = -2 + i * 2.1;
        var k = Math.sin(t * 8 + i * 1.3 + (s2 > 0 ? 0 : 1.7)) * 1;
        c.beginPath();
        c.moveTo(s2 * 2, yy);
        c.quadraticCurveTo(s2 * 4.4, yy + 1.4 + k, s2 * 5.2, yy + 3.4 + k);
        c.stroke();
      }
    }
    /* the curled shrimpy body */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -8);
    c.quadraticCurveTo(3.6, -5, 3.4, 1.4);
    c.quadraticCurveTo(3, 7, 0.4, 9.4 + kick * 0.8);
    c.quadraticCurveTo(-1.4, 7.4, -1, 3.6);
    c.quadraticCurveTo(-3.4, 1, -3.2, -3.4);
    c.quadraticCurveTo(-2.6, -7, 0, -8);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.body, -0.22); c.lineWidth = 0.5;
    for (var j = 0; j < 6; j++) {
      c.beginPath();
      c.moveTo(-3, -4.4 + j * 2); c.quadraticCurveTo(0, -3.8 + j * 2, 3.2, -4.6 + j * 2);
      c.stroke();
    }
    c.fillStyle = a.wing; ell(c, 0, -5.6, 2.6, 2.8);
    c.fillStyle = a.eyes || '#2b2b2b'; ell(c, -1.2, -6.6, 0.8, 0.8); ell(c, 1.2, -6.6, 0.8, 0.8);
    c.strokeStyle = GG.shade(a.body, -0.2); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-1, -7.8); c.quadraticCurveTo(-2.6, -11, -3.4, -13.4); c.stroke();
    c.beginPath(); c.moveTo(1, -7.8); c.quadraticCurveTo(2.6, -11, 3.4, -13.4); c.stroke();
  };

  S.horseshoe = function (c, a, t) {
    var step = Math.sin(t * 3) * 0.6;
    /* the tail spike */
    c.strokeStyle = a.accent; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 6.4); c.lineTo(step * 0.4, 13); c.stroke();
    /* the little legs underneath */
    c.strokeStyle = GG.shade(a.body, -0.35); c.lineWidth = 0.9;
    for (var s2 = -1; s2 <= 1; s2 += 2) for (var i = 0; i < 4; i++) {
      var k = Math.sin(t * 5 + i * 1.4 + (s2 > 0 ? 0 : 1.6)) * 0.7;
      c.beginPath();
      c.moveTo(s2 * 2.4, -2.6 + i * 1.9);
      c.lineTo(s2 * (5 + k * 0.4), -1.4 + i * 2 + k);
      c.stroke();
    }
    /* the abdomen, the smaller back plate */
    c.fillStyle = GG.shade(a.body, -0.12);
    c.beginPath();
    c.moveTo(-5.4, 1.4);
    c.lineTo(-4, 6.6); c.lineTo(0, 7.8); c.lineTo(4, 6.6); c.lineTo(5.4, 1.4);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.body, -0.35); c.lineWidth = 0.6;
    for (var j = -2; j <= 2; j++) {
      c.beginPath(); c.moveTo(j * 1.9, 1.8); c.lineTo(j * 1.5, 6.8); c.stroke();
    }
    /* the great horseshoe shell */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-8.4, 3.4);
    c.quadraticCurveTo(-9.4, -7.4, 0, -9.4);
    c.quadraticCurveTo(9.4, -7.4, 8.4, 3.4);
    c.quadraticCurveTo(4.4, 2, 0, 2);
    c.quadraticCurveTo(-4.4, 2, -8.4, 3.4);
    c.closePath(); c.fill();
    c.fillStyle = a.wing;
    ell(c, 0, -3.4, 6.2, 4.2);
    c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, -2.6, -5, 2.6, 1.6, -0.3);
    c.strokeStyle = GG.shade(a.body, -0.3); c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-3.2, -8.2); c.lineTo(-3.6, 2.6); c.stroke();
    c.beginPath(); c.moveTo(3.2, -8.2); c.lineTo(3.6, 2.6); c.stroke();
    c.fillStyle = a.eyes || '#3a2c1c';
    ell(c, -4.6, -4.4, 1, 0.75, -0.3); ell(c, 4.6, -4.4, 1, 0.75, 0.3);
  };


  /* ---------- v1.12 orchard and hillside shapes ---------- */

  /* A snakefly rears its little flat head up on a long neck. The female
     trails a needle-thin egg-layer, which is NOT a sting. */
  S.snakefly = function (c, a, t) {
    var sway = Math.sin(t * 2.2) * 0.5;
    /* four clear wings, held roof-like over the back */
    c.save(); c.globalAlpha = 0.78;
    c.fillStyle = a.wing;
    ell(c, -4.2, 2.8, 3.4, 7.6, -0.2); ell(c, 4.2, 2.8, 3.4, 7.6, 0.2);
    c.fillStyle = GG.shade(a.wing, -0.08);
    ell(c, -2.6, 3.6, 2.6, 6.4, -0.12); ell(c, 2.6, 3.6, 2.6, 6.4, 0.12);
    c.restore(); c.globalAlpha = 1;
    c.strokeStyle = a.accent; c.lineWidth = 0.45;
    for (var s = -1; s <= 1; s += 2) {
      for (var v = 0; v < 4; v++) {
        c.beginPath();
        c.moveTo(s * 1.4, -1.6);
        c.lineTo(s * (2.6 + v * 1.7), 8.4 - v * 1.4);
        c.stroke();
      }
    }
    legs(c, a.accent, 3, 3, 4.6, t * 7, 0.9);
    /* abdomen */
    c.fillStyle = a.body; ell(c, 0, 4.4, 2.2, 6);
    c.fillStyle = GG.shade(a.body, 0.16);
    for (var b = 0; b < 4; b++) ell(c, 0, 1.4 + b * 2.2, 2.05, 0.4);
    /* the egg-layer, long and fine */
    if (a.tail !== false) {
      curve(c, 0, 10.2, 0.6, 13, 0.2, 16.4, 0.6, a.accent);
    }
    /* thorax */
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -1.4, 2.4, 3.2);
    /* the long neck, tipped up */
    c.save();
    c.translate(0, -4);
    c.rotate(sway * 0.12);
    c.fillStyle = a.neck || GG.shade(a.body, 0.1);
    ell(c, 0, -1.6, 1.25, 3.4);
    /* the flat head */
    c.fillStyle = a.head || a.body;
    ell(c, 0, -6, 2.1, 2.1);
    c.fillStyle = '#f4efe0';
    ell(c, -1.15, -6.5, 0.62, 0.66); ell(c, 1.15, -6.5, 0.62, 0.66);
    c.fillStyle = '#16110c';
    ell(c, -1.15, -6.6, 0.34, 0.36); ell(c, 1.15, -6.6, 0.34, 0.36);
    line(c, -0.9, -7.6, -2.4, -10.2, 0.55, a.accent);
    line(c, 0.9, -7.6, 2.4, -10.2, 0.55, a.accent);
    c.restore();
  };

  /* A bee fly: a round furry ball that hovers with a long straight drinking
     straw out in front. Two wings, dark along the front edge. */
  S.beefly = function (c, a, t) {
    var flap = 0.28 + 0.72 * Math.abs(Math.cos(t * 26));
    c.save(); c.globalAlpha = 0.5; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -5.6, -0.6, 5, 2.6, -0.42); ell(c, 5.6, -0.6, 5, 2.6, 0.42);
    if (a.accent) {
      c.fillStyle = a.accent; c.globalAlpha = 0.55;
      ell(c, -6.2, -2, 4.4, 0.75, -0.42); ell(c, 6.2, -2, 4.4, 0.75, 0.42);
    }
    c.restore(); c.globalAlpha = 1;
    /* dangling legs */
    c.strokeStyle = a.legs || a.accent; c.lineWidth = 0.7; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(s * 1.6, 1 + i);
        c.quadraticCurveTo(s * (3 + i), 6 + i * 1.4, s * (2.4 + i * 1.6), 10 + i * 1.6);
        c.stroke();
      }
    }
    /* the fat furry ball */
    c.fillStyle = GG.shade(a.body, -0.16); ell(c, 0, 0.6, 5.4, 5.6);
    c.fillStyle = a.body; ell(c, 0, 0.2, 4.9, 5.1);
    /* a warble fly wears a pale furry coat with a hot orange tail */
    if (a.fur) { c.fillStyle = a.fur; ell(c, 0, -2, 4.5, 3.2); }
    if (a.tip) { c.fillStyle = a.tip; ell(c, 0, 3.9, 3.6, 2.2); }
    /* fur */
    c.strokeStyle = a.fur || GG.shade(a.body, 0.28); c.lineWidth = a.fur ? 0.9 : 0.6;
    for (var f = 0; f < 14; f++) {
      var ang = f / 14 * Math.PI * 2;
      var rx = Math.cos(ang) * 4.6, ry = 0.2 + Math.sin(ang) * 4.8;
      if (a.tip && ry > 3) c.strokeStyle = a.tip;
      c.beginPath(); c.moveTo(rx * 0.8, ry * 0.8);
      c.lineTo(rx * 1.16, ry * 1.16); c.stroke();
    }
    c.fillStyle = a.accent || GG.shade(a.body, 0.18); ell(c, 0, -4.4, 2.1, 1.9);
    if (a.eye) {
      /* big fly eyes, and no mouth at all */
      c.fillStyle = a.eye; ell(c, -1.6, -5, 1.55, 1.7); ell(c, 1.6, -5, 1.55, 1.7);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      ell(c, -2, -5.6, 0.5, 0.5); ell(c, 1.2, -5.6, 0.5, 0.5);
    } else {
      c.fillStyle = '#101010'; ell(c, -1.3, -4.8, 0.85, 0.95); ell(c, 1.3, -4.8, 0.85, 0.95);
      /* the straw - straight out in front, never a sting */
      line(c, 0, -5.4, 0, -13, 0.75, a.accent);
    }
  };

  /* A Jerusalem cricket: no wings at all, a big amber head wider than the
     body, and a fat banded abdomen. */
  S.jerusalem = function (c, a, t) {
    var dig = Math.sin(t * 4) * 0.8;
    /* stout digging legs */
    c.strokeStyle = GG.shade(a.body, -0.3); c.lineWidth = 1.9; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        var y = -2.4 + i * 3.8;
        var k = Math.sin(t * 6 + i * 1.7 + (s > 0 ? 0 : 2)) * 1.2;
        c.beginPath();
        c.moveTo(s * 2.4, y);
        c.quadraticCurveTo(s * 6.4, y + 1.4 + k, s * 6.8, y + 4.6 + k);
        c.stroke();
      }
      /* little spines on the back legs */
      c.lineWidth = 0.8;
      for (var sp = 0; sp < 3; sp++) {
        c.beginPath();
        c.moveTo(s * (5.4 + sp * 0.4), 6 + sp * 1.3);
        c.lineTo(s * (7.6 + sp * 0.4), 5.4 + sp * 1.3);
        c.stroke();
      }
      c.lineWidth = 1.9;
    }
    /* the striped abdomen */
    c.fillStyle = a.accent; ell(c, 0, 5, 4.6, 6.6);
    c.fillStyle = a.band || '#f3e2bd';
    for (var b = 0; b < 4; b++) ell(c, 0, 1.2 + b * 2.5, 4.4 - b * 0.35, 0.95);
    c.fillStyle = 'rgba(0,0,0,0.16)'; ell(c, 0, 10.6, 2.4, 1.2);
    /* thorax */
    c.fillStyle = GG.shade(a.body, -0.12); ell(c, 0, -2.4, 4, 3.2);
    /* the great round head */
    c.save(); c.translate(0, dig * 0.25);
    c.fillStyle = a.body; ell(c, 0, -7.4, 5.2, 4.6);
    c.fillStyle = GG.shade(a.body, 0.2); ell(c, 0, -8.6, 4.2, 2.4);
    c.fillStyle = '#1c1008';
    ell(c, -2.9, -8.4, 0.85, 0.95); ell(c, 2.9, -8.4, 0.85, 0.95);
    /* the wide-set jaws */
    c.strokeStyle = GG.shade(a.body, -0.42); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-1.8, -10.6); c.quadraticCurveTo(-2.8, -12.4, -1, -13.2); c.stroke();
    c.beginPath(); c.moveTo(1.8, -10.6); c.quadraticCurveTo(2.8, -12.4, 1, -13.2); c.stroke();
    curve(c, -2.4, -10.2, -4.6, -12.4, -5.2, -14.6, 0.75, GG.shade(a.body, -0.3));
    curve(c, 2.4, -10.2, 4.6, -12.4, 5.2, -14.6, 0.75, GG.shade(a.body, -0.3));
    c.restore();
  };

  /* A little northern scorpion. Seen from above the tail curls up over its
     back, so the sting ends up pointing forward over the body. */
  S.scorpion = function (c, a, t) {
    var curl = Math.sin(t * 2.2) * 0.7;
    legs(c, GG.shade(a.body, -0.28), 4, 3.4, 6.4, t * 8, 1.1);
    /* body */
    c.fillStyle = a.body; ell(c, 0, 3.2, 3.2, 5.6);
    c.fillStyle = GG.shade(a.body, 0.16);
    for (var k = 0; k < 4; k++) ell(c, 0, 0.4 + k * 2.1, 3 - k * 0.2, 0.55);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -3.4, 2.8, 3);
    c.fillStyle = '#1a1208'; ell(c, -0.75, -4.4, 0.42, 0.46); ell(c, 0.75, -4.4, 0.42, 0.46);
    /* the pincers, reaching forward */
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      var wig = Math.sin(t * 3 + (s2 > 0 ? 0 : 1.4)) * 0.5;
      c.strokeStyle = a.body; c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(s2 * 2, -4.6);
      c.quadraticCurveTo(s2 * 4.6, -7, s2 * (4 + wig * 0.3), -9.6);
      c.stroke();
      c.fillStyle = a.claw || GG.shade(a.body, 0.1);
      ell(c, s2 * (4 + wig * 0.3), -10.8, 1.5, 2.3, s2 * 0.25);
      c.strokeStyle = GG.shade(a.body, -0.34); c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(s2 * (3.4 + wig * 0.3), -12);
      c.lineTo(s2 * (4.8 + wig * 0.3), -12.6 + wig * 0.5);
      c.stroke();
    }
    /* the tail, arcing up over the back with the sting over her head */
    var seg = [[0.4, 8.6], [2.4, 8.2], [3.6, 5.6], [3.4, 2.4], [2.4, -0.6], [0.9, -2.8]];
    c.strokeStyle = GG.shade(a.tailCol || a.body, -0.22); c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(seg[0][0], seg[0][1]);
    for (var i = 1; i < seg.length; i++) c.lineTo(seg[i][0] + curl * 0.35, seg[i][1] + curl * 0.25);
    c.stroke();
    c.fillStyle = a.tailCol || GG.shade(a.body, 0.12);
    for (var j = 0; j < seg.length; j++) {
      ell(c, seg[j][0] + curl * 0.35, seg[j][1] + curl * 0.25, 1.25 - j * 0.06, 1.25 - j * 0.06);
    }
    /* the bulb and the sting */
    c.fillStyle = GG.shade(a.tailCol || a.body, 0.16);
    ell(c, 0.9 + curl * 0.35, -2.8 + curl * 0.25, 1.5, 1.7, -0.4);
    c.fillStyle = GG.shade(a.body, -0.4);
    c.beginPath();
    c.moveTo(0.2 + curl * 0.35, -4.2);
    c.lineTo(-0.6 + curl * 0.35, -6.6);
    c.lineTo(1.8 + curl * 0.35, -4.6);
    c.closePath(); c.fill();
  };

  /* A windscorpion: neither spider nor scorpion. Enormous jaws, and two long
     feelers waved out in front that look like an extra pair of legs. */
  S.windscorpion = function (c, a, t) {
    var rush = Math.sin(t * 11) * 1.4;
    legs(c, GG.shade(a.body, -0.24), 4, 4.4, 7.4, t * 16, 1.1);
    /* the waving pedipalps */
    c.strokeStyle = GG.shade(a.body, -0.1); c.lineWidth = 1.2; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      var w = Math.sin(t * 6 + (s > 0 ? 0 : 1.8)) * 1.8;
      c.beginPath();
      c.moveTo(s * 2, -5);
      c.quadraticCurveTo(s * 5.4, -9, s * (4 + w * 0.4), -13.4);
      c.stroke();
    }
    /* pale abdomen */
    c.fillStyle = a.accent; ell(c, 0, 4.6, 3.8, 6);
    c.fillStyle = GG.shade(a.accent, -0.1);
    for (var b = 0; b < 4; b++) ell(c, 0, 1.4 + b * 2.2, 3.6 - b * 0.3, 0.5);
    /* thorax */
    c.fillStyle = a.body; ell(c, 0, -2.2, 3.2, 3.4);
    /* head */
    c.fillStyle = GG.shade(a.body, 0.08); ell(c, 0, -6, 2.8, 2.8);
    c.fillStyle = '#141010'; ell(c, -0.85, -7.4, 0.55, 0.6); ell(c, 0.85, -7.4, 0.55, 0.6);
    /* the huge jaws, opening and closing */
    var gap = 0.9 + Math.abs(Math.sin(t * 7)) * 0.9;
    c.fillStyle = a.jaw || GG.shade(a.body, -0.2);
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      c.save();
      c.translate(s2 * gap, -8.4);
      c.rotate(s2 * 0.12 + rush * 0.01);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(s2 * 2.4, -2.4, s2 * 1, -5.6);
      c.quadraticCurveTo(s2 * -0.6, -2.8, 0, 0);
      c.closePath(); c.fill();
      c.restore();
    }
  };

  /* A pinacate beetle: matte black, held high on long legs, and when it is
     startled it stands on its head. */
  S.darkling = function (c, a, t) {
    var stand = a.headstand ? 1 : Math.max(0, Math.sin(t * 0.9) - 0.86) * 7;
    c.save();
    c.translate(0, stand * 1.6);
    c.rotate(stand * 0.34);
    /* long stilt legs */
    c.strokeStyle = GG.shade(a.body, 0.18); c.lineWidth = 1.2; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        var y = -3 + i * 3.6;
        var k = Math.sin(t * 5 + i * 1.6 + (s > 0 ? 0 : 2.1)) * 1.1;
        c.beginPath();
        c.moveTo(s * 2, y);
        c.quadraticCurveTo(s * 6.4, y - 1.6 + k, s * 7.6, y + 3.4 + k);
        c.stroke();
      }
    }
    c.fillStyle = GG.shade(a.body, 0.1); ell(c, 0, -6.4, 2.8, 2.2);
    line(c, -1.4, -8, -3.2, -11, 0.85, GG.shade(a.body, 0.2));
    line(c, 1.4, -8, 3.2, -11, 0.85, GG.shade(a.body, 0.2));
    c.fillStyle = GG.shade(a.body, 0.06); ell(c, 0, -3.2, 3.4, 2.6);
    /* the fused, unopenable wing cases */
    c.fillStyle = a.body; ell(c, 0, 2.4, 5.2, 7.4);
    c.fillStyle = GG.shade(a.body, 0.08); ell(c, 0, 2.4, 4.6, 6.8);
    c.strokeStyle = GG.shade(a.body, -0.3); c.lineWidth = 0.45;
    for (var r = -2; r <= 2; r++) {
      c.beginPath();
      c.moveTo(r * 1.5, -3.4); c.lineTo(r * 1.9, 8.6); c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.14)'; ell(c, -2, -0.6, 1.5, 3, -0.3);
    c.restore();
  };

  /* A velvet ant - really a wingless wasp - in plush orange and black. */
  S.velvetant = function (c, a, t) {
    legs(c, a.accent, 3, 3.6, 6, t * 15, 1.2);
    /* the fuzzy abdomen */
    c.fillStyle = a.body; ell(c, 0, 5, 4, 5.6);
    c.fillStyle = a.accent;
    ell(c, 0, 2.2, 3.5, 0.8); ell(c, 0, 8.2, 2.6, 1.1);
    /* plush */
    c.strokeStyle = GG.shade(a.body, 0.3); c.lineWidth = 0.55;
    for (var f = 0; f < 16; f++) {
      var ang = f / 16 * Math.PI * 2;
      var rx = Math.cos(ang) * 3.8, ry = 5 + Math.sin(ang) * 5.4;
      c.beginPath();
      c.moveTo(rx * 0.84, 5 + (ry - 5) * 0.84);
      c.lineTo(rx * 1.2, 5 + (ry - 5) * 1.2); c.stroke();
    }
    /* waist and thorax */
    c.strokeStyle = a.accent; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(0, 0.2); c.lineTo(0, -1); c.stroke();
    c.fillStyle = a.body; ell(c, 0, -3.2, 3, 3);
    c.strokeStyle = GG.shade(a.body, 0.3); c.lineWidth = 0.55;
    for (var g = 0; g < 9; g++) {
      var a2 = g / 9 * Math.PI * 2;
      c.beginPath();
      c.moveTo(Math.cos(a2) * 2.5, -3.2 + Math.sin(a2) * 2.5);
      c.lineTo(Math.cos(a2) * 3.7, -3.2 + Math.sin(a2) * 3.7); c.stroke();
    }
    /* head */
    c.fillStyle = a.accent; ell(c, 0, -6.8, 2.4, 2.2);
    c.fillStyle = '#f2e8d8'; ell(c, -1, -7.2, 0.5, 0.55); ell(c, 1, -7.2, 0.5, 0.55);
    curve(c, -1, -8.2, -2.6, -9.6, -2.2, -11.8, 0.75, a.accent);
    curve(c, 1, -8.2, 2.6, -9.6, 2.2, -11.8, 0.75, a.accent);
  };

  /* A robber fly: sits dead still on a stone, then launches. Tapered
     abdomen, humped back, huge eyes and a bristly beard. */
  S.robberfly = function (c, a, t) {
    var flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 20));
    c.save(); c.globalAlpha = 0.45; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -3.6, 3.4, 2.6, 7.4, -0.14); ell(c, 3.6, 3.4, 2.6, 7.4, 0.14);
    c.restore(); c.globalAlpha = 1;
    /* spiny grabbing legs */
    c.strokeStyle = a.accent; c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        var y = -3 + i * 2.6;
        var k = Math.sin(t * 6 + i * 1.5 + (s > 0 ? 0 : 2)) * 0.9;
        c.beginPath();
        c.moveTo(s * 1.8, y);
        c.quadraticCurveTo(s * 5.4, y + 1 + k, s * 4.6, y + 5 + k);
        c.stroke();
      }
      c.lineWidth = 0.55;
      for (var sp = 0; sp < 3; sp++) {
        c.beginPath();
        c.moveTo(s * (4.8 - sp * 0.2), 0.6 + sp * 1.8);
        c.lineTo(s * (6.2 - sp * 0.2), 0 + sp * 1.8); c.stroke();
      }
      c.lineWidth = 1.3;
    }
    /* the long tapered abdomen */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-2.6, 0.4);
    c.quadraticCurveTo(-2.2, 7, -0.4, 11.6);
    c.quadraticCurveTo(0.4, 11.6, 0.4, 11.6);
    c.quadraticCurveTo(2.2, 7, 2.6, 0.4);
    c.closePath(); c.fill();
    c.fillStyle = a.accent;
    for (var b = 0; b < 4; b++) ell(c, 0, 1.6 + b * 2.4, 2.3 - b * 0.42, 0.42);
    if (a.tailTip) { c.fillStyle = a.tailTip; ell(c, 0, 10.4, 1, 1.5); }
    /* humped thorax */
    c.fillStyle = GG.shade(a.body, -0.12); ell(c, 0, -2.4, 3.4, 3.6);
    c.fillStyle = 'rgba(255,255,255,0.16)'; ell(c, -1.4, -3.6, 1.5, 1.6, -0.4);
    /* the big eyes with a dip between them */
    c.fillStyle = a.eyes || '#6a3a2a';
    ell(c, -2.1, -6.4, 2.1, 2.4); ell(c, 2.1, -6.4, 2.1, 2.4);
    c.fillStyle = 'rgba(255,255,255,0.4)';
    ell(c, -2.5, -7.2, 0.6, 0.6); ell(c, 2.5, -7.2, 0.6, 0.6);
    /* beard and beak */
    c.strokeStyle = a.beard || '#e8dcc0'; c.lineWidth = 0.5;
    for (var w = -2; w <= 2; w++) {
      c.beginPath(); c.moveTo(w * 0.55, -7.6); c.lineTo(w * 1.25, -10.2); c.stroke();
    }
    line(c, 0, -8, 0, -11.4, 0.9, GG.shade(a.body, -0.3));
  };


  /* A western black widow, hanging the way she really hangs: upside down in
     her messy tangle web. Because we are looking at her from above and she is
     belly-up, the red hourglass on her underside is the part we can see.
     She is never caught - only looked at. */
  S.widow = function (c, a, t) {
    var sway = Math.sin(t * 0.9) * 0.5;

    /* the untidy tangle web - nothing like a neat round orb */
    c.strokeStyle = a.web || 'rgba(236,240,246,0.30)';
    c.lineWidth = 0.32;
    var strands = [
      [-14, -12, -2.5, -3], [13, -13, 2.5, -3], [-15, 10, -3, 2.5], [14, 11, 3, 2.5],
      [-6, -16, -1, -4], [7, -15, 1.5, -4], [-9, 15, -1.5, 4.5], [10, 14, 2, 4.5],
      [-16, -1, -4, -0.5], [16, 0, 4, 0.5], [-4, -17, -0.5, -5], [3, 17, 0.5, 6]
    ];
    for (var s = 0; s < strands.length; s++) {
      var q = strands[s];
      c.beginPath();
      c.moveTo(q[0] + sway * 0.6, q[1]);
      c.quadraticCurveTo((q[0] + q[2]) / 2 + sway, (q[1] + q[3]) / 2, q[2], q[3]);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-12, -7); c.quadraticCurveTo(0, -3 + sway, 12, -8); c.stroke();
    c.beginPath();
    c.moveTo(-11, 7); c.quadraticCurveTo(0, 4 + sway, 11, 8); c.stroke();

    /* eight long thin legs, fanned out to the sides the way a hanging widow
       holds them - never straight up, or they read as antennae */
    var LEGS = [
      [-1, -1.02, 6.8, 10.6], [-1, -0.42, 7.6, 11.6],
      [-1, 0.24, 7.6, 11.2], [-1, 0.86, 6.6, 10.0],
      [1, -1.02, 6.8, 10.6], [1, -0.42, 7.6, 11.6],
      [1, 0.24, 7.6, 11.2], [1, 0.86, 6.6, 10.0]
    ];
    c.strokeStyle = a.body; c.lineCap = 'round'; c.lineWidth = 1.05;
    for (var i = 0; i < LEGS.length; i++) {
      var L = LEGS[i], side = L[0], ang = L[1], kneeR = L[2], tipR = L[3];
      var wob = Math.sin(t * 1.3 + i * 0.8) * 0.4;
      var ox = side * 1.8, oy = -2.2;
      /* the knee is lifted and the foot drops back down - the widow crook */
      var kx = ox + side * Math.cos(ang) * kneeR;
      var ky = oy + Math.sin(ang) * kneeR * 0.7 - 1.8 + wob;
      var tx = ox + side * Math.cos(ang) * tipR;
      var ty = oy + Math.sin(ang) * tipR * 0.85 + 1.2 + wob * 1.3;
      c.beginPath();
      c.moveTo(ox, oy);
      c.quadraticCurveTo(kx, ky, tx, ty);
      c.stroke();
    }

    /* the little front body */
    c.fillStyle = GG.shade(a.body, 0.16);
    ell(c, 0, -4.4, 2.3, 2.4);
    c.fillStyle = 'rgba(255,255,255,0.20)';
    ell(c, -0.85, -5.1, 0.85, 0.95, -0.4);

    /* the big round belly, glossy black */
    c.fillStyle = a.body;
    ell(c, 0, 2.8, 5.5, 5.9);
    /* the gloss goes on BEFORE the hourglass, and off to one side of it */
    c.fillStyle = 'rgba(255,255,255,0.11)';
    ell(c, -3.2, -0.2, 1.0, 1.8, -0.4);

    /* the hourglass, because she is hanging belly-up */
    c.fillStyle = a.mark || '#d8322a';
    c.beginPath();
    c.moveTo(-2.3, -0.2);
    c.lineTo(2.3, -0.2);
    c.lineTo(0.8, 2.9);
    c.lineTo(2.4, 6.0);
    c.lineTo(-2.4, 6.0);
    c.lineTo(-0.8, 2.9);
    c.closePath();
    c.fill();
  };



  /* ============ the mountains, the taiga, the tundra, the desert,
                  the rainforest and the forest glade ============ */

  /* An ice crawler: flat, pale and strongly segmented, with no wings at all.
     Its antennae and its tail filaments are both longer than its body, so it
     looks much the same at either end. */
  S.icecrawler = function (c, a, t) {
    var wig = Math.sin(t * 2.6) * 0.9;
    c.strokeStyle = a.legs; c.lineWidth = 1.2; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        var y = -4.4 + i * 3.6;
        var k = Math.sin(t * 5 + i * 1.6 + (s > 0 ? 0 : 1.9)) * 1.3;
        c.beginPath();
        c.moveTo(s * 2, y);
        c.quadraticCurveTo(s * 5.4, y + 1.4 + k, s * 7, y + 4 + k);
        c.stroke();
      }
    }
    c.fillStyle = a.body; ell(c, 0, 1.4, 3.1, 8.2);
    c.fillStyle = a.seg;
    for (var j = 0; j < 6; j++) ell(c, 0, -5 + j * 2.6, 3.05 - j * 0.09, 0.5);
    c.fillStyle = a.body; ell(c, wig * 0.3, -8.6, 2.5, 2.6);
    c.fillStyle = a.seg; ell(c, 0, -6.4, 2.9, 0.5);
    c.fillStyle = a.eye;
    ell(c, wig * 0.3 - 1.2, -9.5, 0.5, 0.55); ell(c, wig * 0.3 + 1.2, -9.5, 0.5, 0.55);
    var thread = GG.shade(a.seg, -0.22);
    curve(c, wig * 0.3 - 1.2, -10.6, -5.2 + wig, -16.5, -7 + wig * 2, -23.4, 0.75, thread);
    curve(c, wig * 0.3 + 1.2, -10.6, 5.2 + wig, -16.5, 7 + wig * 2, -23.4, 0.75, thread);
    curve(c, -1.7, 9, -3.6 - wig, 14, -5.2 - wig * 2, 20, 0.8, thread);
    curve(c, 1.7, 9, 3.6 - wig, 14, 5.2 - wig * 2, 20, 0.8, thread);
  };

  /* A snow scorpionfly: a minute humpbacked wingless thing with jumping back
     legs, a beak pointing down off the front of its head, and two stiff dark
     bristles laid back over its body where the wings would be. */
  S.boreus = function (c, a, t) {
    var k = Math.sin(t * 5) * 0.7;
    c.strokeStyle = a.legs; c.lineWidth = 1.2; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1.6, -3); c.quadraticCurveTo(s * 4.6, -2.6, s * 5.8, 0.4); c.stroke();
      c.beginPath(); c.moveTo(s * 1.8, -0.6); c.quadraticCurveTo(s * 5.2, 0.8, s * 6, 4); c.stroke();
      c.lineWidth = 2.2;
      c.beginPath(); c.moveTo(s * 1.8, 1.4); c.lineTo(s * 6.6, 6.2 + k); c.stroke();
      c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(s * 6.6, 6.2 + k); c.lineTo(s * 3.2, 12.6 + k); c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, 3.6, 3.4, 5.6);
    c.fillStyle = a.body; ell(c, 0, -2.4, 3.5, 4);
    c.fillStyle = a.sheen; ell(c, -1.3, -3.4, 1.3, 1.9, -0.4);
    c.fillStyle = 'rgba(255,255,255,0.14)'; ell(c, -1.1, 2.2, 1.1, 2.4, -0.2);
    c.strokeStyle = a.bristle; c.lineWidth = 1.4; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      c.beginPath();
      c.moveTo(s2 * 1.8, -4.6);
      c.quadraticCurveTo(s2 * 4.4, 0.6, s2 * 2.4, 6.8);
      c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, -6.9, 2.4, 2.2);
    c.fillStyle = a.bristle; ell(c, -1.2, -7.5, 0.6, 0.65); ell(c, 1.2, -7.5, 0.6, 0.65);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-1.4, -8.2); c.lineTo(1.4, -8.2); c.lineTo(0.6, -13.6); c.lineTo(-0.4, -13.6);
    c.closePath(); c.fill();
    c.fillStyle = a.sheen; ell(c, -0.2, -10.6, 0.34, 2);
    curve(c, -1.6, -8.4, -4.8, -12, -5.6, -17.5, 0.7, a.bristle);
    curve(c, 1.6, -8.4, 4.8, -12, 5.6, -17.5, 0.7, a.bristle);
  };

  /* A springtail: a stubby soft oval on six short legs. The snow flea carries
     a folded forked spring under her belly; the arctic one has none at all,
     and that is the whole difference between them. */
  S.springtail = function (c, a, t) {
    var hop = Math.sin(t * 6) * 0.6;
    c.strokeStyle = a.legs; c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        var y = -4.4 + i * 3.2;
        var k = Math.sin(t * 8 + i * 1.5 + (s > 0 ? 0 : 1.8)) * 1;
        c.beginPath();
        c.moveTo(s * 2.6, y);
        c.quadraticCurveTo(s * 5.2, y + 1.4 + k, s * 5.8, y + 3.6 + k);
        c.stroke();
      }
    }
    c.fillStyle = GG.shade(a.body, -0.26);
    ell(c, 0, 3.2, 4.8, 6.8); ell(c, 0, -3.4, 4.2, 4); ell(c, 0, -7.6, 3.2, 3.1);
    c.fillStyle = a.body; ell(c, 0, 3.2, 4.4, 6.4);
    c.fillStyle = a.body; ell(c, 0, -3.4, 3.8, 3.6);
    c.fillStyle = a.body2; ell(c, -1.3, 1.2, 1.9, 4.2, -0.15);
    c.fillStyle = a.body; ell(c, 0, -7.6, 2.9, 2.8);
    c.fillStyle = a.body2; ell(c, -1, -8.4, 1.1, 1.1);
    c.fillStyle = GG.shade(a.legs, -0.2);
    ell(c, -1.5, -8.6, 0.55, 0.6); ell(c, 1.5, -8.6, 0.55, 0.6);
    curve(c, -1.4, -9.4, -3.6, -11.6, -4.4, -14.4, 0.85, a.legs);
    curve(c, 1.4, -9.4, 3.6, -11.6, 4.4, -14.4, 0.85, a.legs);
    if (a.furcula) {
      c.strokeStyle = GG.shade(a.body2, 0.45); c.lineWidth = 1.7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 9.8 + hop); c.lineTo(0, 2.6 + hop); c.stroke();
      c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(0, 3.2 + hop); c.lineTo(-3.1, -1.4 + hop); c.stroke();
      c.beginPath(); c.moveTo(0, 3.2 + hop); c.lineTo(3.1, -1.4 + hop); c.stroke();
      c.fillStyle = GG.shade(a.body2, 0.45);
      ell(c, -3.3, -1.8 + hop, 0.7, 0.7); ell(c, 3.3, -1.8 + hop, 0.7, 0.7);
    }
  };

  /* A water bear, drawn the way a microscope shows one: a plump segmented
     barrel on four pairs of stubby clawed legs, with a blunt snout, a round
     mouth and two black dot eyespots. */
  S.tardigrade = function (c, a, t) {
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 4; i++) {
        var y = -4.6 + i * 3.4;
        var k = Math.sin(t * 4 + i * 1.5 + (s > 0 ? 0 : 1.8)) * 0.9;
        var lx = s * (5.6 + (i === 3 ? 0.4 : 0));
        var ly = y + 2.2 + k + (i === 3 ? 2.6 : 0);
        c.strokeStyle = a.body2; c.lineWidth = 3.4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(s * 3.4, y); c.lineTo(lx, ly); c.stroke();
        var dir = Math.atan2(ly - y, lx - s * 3.4);
        c.strokeStyle = a.claw; c.lineWidth = 0.55;
        for (var q = 0; q < 4; q++) {
          var ang = dir + (q - 1.5) * 0.36;
          c.beginPath();
          c.moveTo(lx, ly);
          c.lineTo(lx + Math.cos(ang) * 2.2, ly + Math.sin(ang) * 2.2);
          c.stroke();
        }
      }
    }
    c.fillStyle = a.body; ell(c, 0, 1.4, 5.6, 8.8);
    c.fillStyle = a.body2;
    for (var j = 0; j < 4; j++) ell(c, 0, -4.4 + j * 3.4, 5.4 - Math.abs(j - 1.5) * 0.6, 0.75);
    c.fillStyle = 'rgba(255,255,255,0.20)'; ell(c, -2.2, -2, 1.8, 3, -0.3);
    c.fillStyle = a.body; ell(c, 0, -8.8, 3.4, 2.8);
    c.fillStyle = a.claw; ell(c, 0, -10.6, 1.7, 1.5);
    c.fillStyle = GG.shade(a.claw, -0.45); ell(c, 0, -10.6, 0.85, 0.75);
    c.fillStyle = a.eye;
    ell(c, -2, -8, 0.8, 0.85); ell(c, 2, -8, 0.8, 0.85);
  };

  /* A longhorn beetle: long, flat-backed and parallel-sided, with antennae so
     long they sweep back past the tail. The sawyer is glossy black with one
     clean white spot and a scatter of flecks; the alder borer is banded chalky
     white and black all the way out along the antennae. */
  S.longhorn = function (c, a, t) {
    var f = (a.longAntennae || 1.5) / 2;
    var shell2 = a.shell2 || GG.shade(a.shell, -0.35);
    function bp(u, x0, x1, x2, x3) {
      var v = 1 - u;
      return v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3;
    }
    legs(c, a.legs, 3, 3.6, 6.6, t * 6, 1.4);
    c.fillStyle = a.body; ell(c, 0, -6, 3.2, 3);
    if (a.spine) {
      c.fillStyle = a.body;
      c.beginPath(); c.moveTo(-2.8, -7); c.lineTo(-6.6, -5.2); c.lineTo(-2.8, -4.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(2.8, -7); c.lineTo(6.6, -5.2); c.lineTo(2.8, -4.2); c.closePath(); c.fill();
    }
    c.fillStyle = a.body; ell(c, 0, -9.6, 2.4, 2.5);
    c.fillStyle = '#0d0c0c'; ell(c, -1.9, -9.8, 0.75, 0.9); ell(c, 1.9, -9.8, 0.75, 0.9);
    c.fillStyle = a.shell;
    c.beginPath();
    c.moveTo(-4.1, -3.6); c.lineTo(4.1, -3.6);
    c.lineTo(3.9, 8.4); c.quadraticCurveTo(0, 12.6, -3.9, 8.4);
    c.closePath(); c.fill();
    if (a.banded) {
      c.fillStyle = shell2;
      c.fillRect(-4.1, -3.6, 8.2, 1.9);
      c.beginPath();
      c.moveTo(-4.04, 1); c.lineTo(4.04, 1); c.lineTo(3.96, 5.6); c.lineTo(-3.96, 5.6);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(-3.6, 7.4); c.lineTo(3.6, 7.4);
      c.lineTo(3.3, 8.8); c.quadraticCurveTo(0, 12.6, -3.3, 8.8);
      c.closePath(); c.fill();
      c.fillStyle = a.body; ell(c, 0, -6, 3.2, 3);
      c.fillStyle = a.shell; ell(c, 0, -6.2, 1.5, 2.1);
    }
    c.fillStyle = shell2; ell(c, 0, 3, 0.45, 7.4);
    if (a.scutellum) {
      var rnd = GG.mulberry32(23);
      c.fillStyle = a.fleck;
      for (var i = 0; i < 13; i++) {
        var sx = (rnd() - 0.5) * 6.6, sy = -0.6 + rnd() * 9.4;
        ell(c, sx, sy, 0.42 + rnd() * 0.3, 0.38 + rnd() * 0.25);
      }
      c.fillStyle = a.fleck; ell(c, 0, -2.5, 1.2, 1);
    }
    for (var s = -1; s <= 1; s += 2) {
      var sway = Math.sin(t * 1.5 + (s > 0 ? 0 : 1.1)) * 1.1;
      /* They lie BACK along her sides, nearly straight, opening a little as
         they go - never arched up over her head, which reads as a hoop. */
      var L = 32 * f;
      var X = [s * 2.2,
        s * (4.6 + 0.04 * L + sway * 0.3),
        s * (5.2 + 0.13 * L + sway * 0.7),
        s * (5.4 + 0.2 * L + sway)];
      var Y = [-10.2, -10.2 + 0.31 * L, -10.2 + 0.64 * L, -10.2 + 0.97 * L];
      c.lineCap = 'round'; c.lineWidth = 1.1;
      if (a.banded) {
        var N = 9;
        for (var q = 0; q < N; q++) {
          c.strokeStyle = (q % 2) ? a.antenna : a.shell;
          c.beginPath();
          for (var st = 0; st <= 4; st++) {
            var u = (q + st / 4) / N;
            var px = bp(u, X[0], X[1], X[2], X[3]), py = bp(u, Y[0], Y[1], Y[2], Y[3]);
            if (st === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.stroke();
        }
      } else {
        c.strokeStyle = a.antenna;
        c.beginPath(); c.moveTo(X[0], Y[0]);
        c.bezierCurveTo(X[1], Y[1], X[2], Y[2], X[3], Y[3]); c.stroke();
      }
    }
  };

  /* A horntail: a wood wasp with no wasp waist at all - a straight banded
     cylinder from end to end, a little spike at the tail, and the female's
     long straight needle trailing out behind it. */
  S.horntail = function (c, a, t) {
    var flap = 0.45 + 0.55 * Math.abs(Math.cos(t * 16));
    c.save(); c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -6, -2.6, 5.8, 1.7, -0.2); ell(c, 6, -2.6, 5.8, 1.7, 0.2);
    ell(c, -4.8, 1.6, 4.4, 1.4, -0.14); ell(c, 4.8, 1.6, 4.4, 1.4, 0.14);
    c.restore();
    legs(c, a.legs, 3, 2.8, 4.8, t * 9, 1.1);
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-2.9, -7.4);
    c.quadraticCurveTo(0, -11.8, 2.9, -7.4);
    c.lineTo(2.9, 9.4);
    c.quadraticCurveTo(0, 12.4, -2.9, 9.4);
    c.closePath(); c.fill();
    c.fillStyle = a.band;
    var by = [-7, -4.2, -1.4, 1.4, 4.2, 7];
    for (var i = 0; i < by.length; i++) c.fillRect(-2.9, by[i], 5.8, 1.55);
    ell(c, 0, 9.8, 2.6, 1.1);
    c.fillStyle = '#0e0d0d'; ell(c, -2.1, -8.4, 1, 1.5); ell(c, 2.1, -8.4, 1, 1.5);
    c.fillStyle = a.band; ell(c, -2.5, -6.2, 0.95, 0.95); ell(c, 2.5, -6.2, 0.95, 0.95);
    curve(c, -1.1, -10.6, -2.8, -14, -2.4, -17.6, 0.9, a.antenna);
    curve(c, 1.1, -10.6, 2.8, -14, 2.4, -17.6, 0.9, a.antenna);
    c.fillStyle = GG.shade(a.body, 0.3);
    c.beginPath();
    c.moveTo(-1.4, 11); c.lineTo(1.4, 11); c.lineTo(0, 15.6); c.closePath(); c.fill();
    line(c, 0, 12, 0, 25.4, 0.8, a.ovipositor);
    c.fillStyle = a.ovipositor; ell(c, 0, 25.4, 0.55, 0.8);
  };

  /* A leaf-footed bug: a long flat mottled shield with a thin white zigzag
     across the middle of its back, and a flat leaf-shaped flag barred dark and
     pale on the shin of each hind leg. */
  S.leaffoot = function (c, a, t) {
    var k = Math.sin(t * 4) * 0.7;
    c.strokeStyle = a.legs; c.lineWidth = 1.2; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 3.4, -5.4); c.quadraticCurveTo(s * 7.4, -6.4, s * 8.8, -9.4); c.stroke();
      c.beginPath(); c.moveTo(s * 4.4, -1.6); c.quadraticCurveTo(s * 8.4, -0.6, s * 9.8, 1.8); c.stroke();
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(s * 4.2, 3); c.lineTo(s * 7.6, 6.4 + k); c.stroke();
      c.beginPath(); c.moveTo(s * 7.6, 6.4 + k); c.lineTo(s * 8.2, 14 + k); c.stroke();
      c.lineWidth = 1.2;
      c.save();
      c.translate(s * 7.95, 10.2 + k); c.rotate(s * 0.08);
      c.fillStyle = a.flag;
      ell(c, 0, 0, 2.2, 4);
      c.fillStyle = a.flagBar;
      for (var b = -2; b <= 2; b++) {
        var yy = b * 1.4;
        var hw = 2.2 * Math.sqrt(Math.max(0, 1 - (yy / 4) * (yy / 4)));
        ell(c, 0, yy, hw, 0.42);
      }
      c.restore();
    }
    c.fillStyle = a.body2;
    c.beginPath();
    c.moveTo(0, -10.6); c.lineTo(5.4, -6); c.lineTo(4.8, 6.4); c.lineTo(0, 11.6);
    c.lineTo(-4.8, 6.4); c.lineTo(-5.4, -6); c.closePath(); c.fill();
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-4.95, -5); c.lineTo(4.95, -5); c.lineTo(4.5, 4.6); c.lineTo(-4.5, 4.6);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.body, 0.18);
    var rnd = GG.mulberry32(31);
    for (var m = 0; m < 14; m++) ell(c, (rnd() - 0.5) * 8.4, -4.4 + rnd() * 8.6, 0.55, 0.5);
    c.fillStyle = a.body2;
    c.beginPath(); c.moveTo(-2.6, -5); c.lineTo(2.6, -5); c.lineTo(0, 0.4); c.closePath(); c.fill();
    c.strokeStyle = a.zig; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-4.7, 1.4);
    for (var z = 0; z < 6; z++) c.lineTo(-4.7 + (z + 1) * 1.57, (z % 2) ? 1.4 : 3);
    c.stroke();
    c.fillStyle = a.body2;
    c.beginPath();
    c.moveTo(-4.4, -6.6); c.lineTo(4.4, -6.6); c.lineTo(2.8, -10.2); c.lineTo(-2.8, -10.2);
    c.closePath(); c.fill();
    c.fillStyle = '#17110c'; ell(c, -2.9, -9.4, 0.85, 0.85); ell(c, 2.9, -9.4, 0.85, 0.85);
    curve(c, -1.8, -10.6, -4.6, -14, -3.8, -18.6, 0.85, a.legs);
    curve(c, 1.8, -10.6, 4.6, -14, 3.8, -18.6, 0.85, a.legs);
  };

  /* An arctic mosquito: humpbacked, slim and dark, with narrow scaled wings,
     a long beak and those long hind legs held up and back. */
  S.mosquito = function (c, a, t) {
    var flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 26));
    c.save(); c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -5.6, 0.6, 5.6, 1.5, -0.24); ell(c, 5.6, 0.6, 5.6, 1.5, 0.24);
    c.restore();
    c.strokeStyle = a.legs; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.lineWidth = 0.85;
      c.beginPath(); c.moveTo(s * 1.4, -2.8); c.quadraticCurveTo(s * 7, -6.4, s * 11, -9.8); c.stroke();
      c.beginPath(); c.moveTo(s * 1.4, -1); c.quadraticCurveTo(s * 8, 0.4, s * 12, 2.6); c.stroke();
      c.lineWidth = 1.05;
      c.beginPath();
      c.moveTo(s * 1.4, 1);
      c.quadraticCurveTo(s * 8, 8, s * 5.6 + Math.sin(t * 3 + s) * 1.2, 17.6);
      c.stroke();
    }
    c.fillStyle = a.body2; ell(c, 0, -2.6, 2.8, 3.1);
    c.fillStyle = a.body; ell(c, 0, -3.6, 2.4, 2.2);
    c.fillStyle = a.body; ell(c, 0, 5, 1.6, 6.8);
    c.fillStyle = a.body2;
    for (var i = 0; i < 4; i++) ell(c, 0, 1.4 + i * 2.3, 1.5 - i * 0.14, 0.4);
    c.fillStyle = a.body; ell(c, 0, -6.4, 1.8, 1.7);
    c.fillStyle = a.body2; ell(c, -1.3, -6.6, 0.7, 0.8); ell(c, 1.3, -6.6, 0.7, 0.8);
    line(c, -0.7, -7.4, -1.8, -12.6, 0.6, a.beak);
    line(c, 0.7, -7.4, 1.8, -12.6, 0.6, a.beak);
    line(c, 0, -7.4, 0, -15.6, 1.05, a.beak);
  };

  /* A wolf spider: chunky, hairy and long-legged, with a pale stripe down the
     middle of her back, chevrons on her abdomen and two big forward-facing
     eyes. The arctic one drags her egg ball everywhere she goes. */
  S.wolfspider = function (c, a, t) {
    var k = Math.sin(t * 4) * 1.1;
    if (a.eggsac) {
      c.strokeStyle = GG.shade(a.eggsac, -0.25); c.lineWidth = 1.3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 9.4); c.lineTo(0, 12.4); c.stroke();
      c.fillStyle = a.eggsac; ell(c, 0, 15.6, 4.5, 4.3);
      c.fillStyle = 'rgba(255,255,255,0.4)'; ell(c, -1.6, 14.2, 1.5, 1.4);
      c.fillStyle = GG.shade(a.eggsac, -0.16); ell(c, 0, 18.4, 2.6, 1.2);
    }
    c.strokeStyle = a.legs; c.lineCap = 'round';
    var WANG = [-1.02, -0.36, 0.28, 0.95];
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 4; i++) {
        var ang = WANG[i];
        var ox = s * 2.2, oy = -6.4 + i * 1.7;
        var kk = k * (i % 2 ? 1 : -1) * 0.6;
        var kx = ox + s * Math.cos(ang) * 6.6, ky = oy + Math.sin(ang) * 6.6 - 1.8 + kk;
        var tx = ox + s * Math.cos(ang) * 10.4, ty = oy + Math.sin(ang) * 10.4 + 1.1 + kk;
        c.lineWidth = 1.9;
        c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(kx, ky, tx, ty); c.stroke();
        c.lineWidth = 0.5;
        for (var h = 0; h < 2; h++) {
          var u = 0.35 + h * 0.3;
          var hx = ox + (kx - ox) * u, hy = oy + (ky - oy) * u;
          c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + s * 0.5, hy - 1.6); c.stroke();
        }
      }
    }
    c.fillStyle = a.body2; ell(c, 0, 4.4, 4.4, 5.9);
    if (a.heart) {
      c.fillStyle = a.heart;
      c.beginPath();
      c.moveTo(0, -0.8);
      c.quadraticCurveTo(2.5, 1.4, 0, 5.8);
      c.quadraticCurveTo(-2.5, 1.4, 0, -0.8);
      c.closePath(); c.fill();
    }
    c.strokeStyle = a.stripe; c.lineWidth = 0.9; c.lineCap = 'round';
    for (var q = 0; q < 3; q++) {
      var cy = 5 + q * 1.9;
      c.beginPath();
      c.moveTo(-3.1 + q * 0.5, cy + 1.2); c.lineTo(0, cy - 0.5); c.lineTo(3.1 - q * 0.5, cy + 1.2);
      c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, -5, 3.9, 4.7);
    c.fillStyle = GG.shade(a.body, -0.32);
    ell(c, -2.4, -5.2, 1.2, 3.8); ell(c, 2.4, -5.2, 1.2, 3.8);
    c.fillStyle = a.stripe; ell(c, 0, -5.2, 1.35, 4.1);
    c.fillStyle = a.eye;
    ell(c, -1.6, -8.3, 1.45, 1.45); ell(c, 1.6, -8.3, 1.45, 1.45);
    ell(c, -3.1, -6.6, 0.55, 0.55); ell(c, 3.1, -6.6, 0.55, 0.55);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    ell(c, -2, -8.9, 0.52, 0.52); ell(c, 1.2, -8.9, 0.52, 0.52);
  };

  /* A Mormon cricket: big, fat and shiny, with a great rounded shield over its
     shoulders hiding two useless stub wings, thread antennae longer than it is,
     and the female's long up-curved sword for laying eggs. */
  S.mormoncricket = function (c, a, t) {
    var k = Math.sin(t * 3.4) * 0.8;
    c.strokeStyle = a.legs; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(s * 2.4, -4.6); c.quadraticCurveTo(s * 6.6, -4, s * 7.6, -0.6); c.stroke();
      c.beginPath(); c.moveTo(s * 2.6, -1.6); c.quadraticCurveTo(s * 7.2, 0.4, s * 8.2, 3.6); c.stroke();
      c.lineWidth = 3.2;
      c.beginPath(); c.moveTo(s * 2.6, 0.6); c.lineTo(s * 7.6, 6.6 + k); c.stroke();
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(s * 7.6, 6.6 + k); c.lineTo(s * 4.4, 14.6 + k); c.stroke();
    }
    c.fillStyle = a.body; ell(c, 0, 4.6, 4.7, 7.2);
    c.fillStyle = a.body2;
    for (var i = 0; i < 5; i++) ell(c, 0, 0.8 + i * 2.3, 4.5 - i * 0.55, 0.6);
    c.fillStyle = 'rgba(255,255,255,0.16)'; ell(c, -2, 1.6, 1.5, 3.4, -0.25);
    c.fillStyle = a.body2; ell(c, 0, -1.4, 4.2, 2.6);
    c.fillStyle = a.shield;
    c.beginPath();
    c.moveTo(-4.7, -6.2);
    c.quadraticCurveTo(0, -10.2, 4.7, -6.2);
    c.quadraticCurveTo(5, -1.2, 0, -0.2);
    c.quadraticCurveTo(-5, -1.2, -4.7, -6.2);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.shield, 0.26); ell(c, 0, -5.6, 3.4, 1.1);
    c.fillStyle = a.body; ell(c, 0, -9.6, 3, 3);
    c.fillStyle = 'rgba(255,255,255,0.18)'; ell(c, -1.1, -10.6, 1.1, 1.2, -0.3);
    c.fillStyle = '#15101a'; ell(c, -1.8, -10.2, 0.85, 0.95); ell(c, 1.8, -10.2, 0.85, 0.95);
    /* thread antennae longer than she is, laid back OUTSIDE her sides so
       they still read against a body of the same colour */
    curve(c, -1.6, -11.6, -6.4, -7.4, -8.2, 10.4, 0.75, a.antenna);
    curve(c, 1.6, -11.6, 6.4, -7.4, 8.2, 10.4, 0.75, a.antenna);
    c.fillStyle = a.ovi;
    c.beginPath();
    c.moveTo(-2, 10.4);
    c.quadraticCurveTo(1.6, 15, 2, 21.4);
    c.quadraticCurveTo(-0.8, 15.8, -3, 11.4);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.ovi, 0.32); c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(-0.7, 11.6); c.quadraticCurveTo(0.9, 15.6, 1.2, 19.6); c.stroke();
  };

  /* A rain beetle: a fat glossy dome, so densely furred underneath that the fur
     shows as a fringe all round, with stout digging legs and antennae that end
     in a little opening fan of plates. */
  S.rainbeetle = function (c, a, t) {
    c.strokeStyle = a.fur; c.lineWidth = 1.2; c.lineCap = 'round';
    for (var f = 0; f < 26; f++) {
      var ang = f / 26 * Math.PI * 2;
      var fx = Math.cos(ang) * 7, fy = Math.sin(ang) * 8.1;
      c.beginPath();
      c.moveTo(fx * 0.84, 1.4 + fy * 0.84);
      c.lineTo(fx * 1.2, 1.4 + fy * 1.2);
      c.stroke();
    }
    c.strokeStyle = a.legs; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.lineWidth = 2.5;
      for (var i = 0; i < 3; i++) {
        var y = -4.4 + i * 4;
        var kk = Math.sin(t * 6 + i * 1.7 + (s > 0 ? 0 : 2)) * 1;
        c.beginPath();
        c.moveTo(s * 3.4, y);
        c.quadraticCurveTo(s * 7.6, y + 1.6 + kk, s * 8.2, y + 4.8 + kk);
        c.stroke();
      }
      c.lineWidth = 0.9;
      for (var q = 0; q < 3; q++) {
        c.beginPath();
        c.moveTo(s * (6.8 + q * 0.4), -3.4 + q * 1.4);
        c.lineTo(s * (9.2 + q * 0.4), -4 + q * 1.4);
        c.stroke();
      }
    }
    c.fillStyle = a.body; ell(c, 0, 1.6, 6.4, 8);
    c.fillStyle = a.shell; ell(c, 0, 2.6, 5.8, 7);
    c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, -2.6, -0.4, 1.9, 2.8, -0.3);
    c.fillStyle = a.shell2; ell(c, 0, 2.6, 0.5, 6.6);
    c.fillStyle = a.shell2; ell(c, 0, -6.2, 4.6, 3.4);
    c.fillStyle = GG.shade(a.shell2, 0.22); ell(c, 0, -7, 3.2, 1.4);
    c.fillStyle = a.body; ell(c, 0, -9.4, 2.8, 2.4);
    c.fillStyle = '#140a06'; ell(c, -2.2, -9.4, 0.7, 0.8); ell(c, 2.2, -9.4, 0.7, 0.8);
    var open = 0.45 + 0.55 * Math.abs(Math.sin(t * 1.3));
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      line(c, s2 * 1.8, -10.6, s2 * 3.6, -12.8, 0.9, a.fan);
      for (var bl = 0; bl < 6; bl++) {
        c.save();
        c.translate(s2 * 3.6, -12.8);
        c.rotate(s2 * (0.16 + bl * 0.17 * open));
        c.fillStyle = a.fan;
        ell(c, s2 * 0.95, -2.5, 0.52, 2.6);
        c.restore();
      }
    }
  };

  /* A banana slug: a long soft torpedo with a raised keel down its back, a
     saddle of a mantle behind the head, two long eye tentacles and two short
     feelers - and the little round breathing hole on her right-hand side. */
  S.slug = function (c, a, t) {
    var wob = Math.sin(t * 1.4) * 0.7;
    var stretch = Math.sin(t * 1.4 + 1) * 0.6;
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, -11 + stretch);
    c.bezierCurveTo(2.9, -10.4, 4.4, -6.4, 4.3, -1.4);
    c.bezierCurveTo(4.2, 6, 2.6, 12, 0, 15.2);
    c.bezierCurveTo(-2.6, 12, -4.2, 6, -4.3, -1.4);
    c.bezierCurveTo(-4.4, -6.4, -2.9, -10.4, 0, -11 + stretch);
    c.closePath(); c.fill();
    c.fillStyle = a.body2;
    ell(c, -3.5, 2.6, 0.8, 4.6, 0.05); ell(c, 3.5, 2.6, 0.8, 4.6, -0.05);
    c.fillStyle = a.keel;
    c.beginPath();
    c.moveTo(0, -3.4); c.quadraticCurveTo(1.15, 5, 0, 13.4);
    c.quadraticCurveTo(-1.15, 5, 0, -3.4); c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.keel, 0.42); c.lineWidth = 0.45; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.3, -1.4); c.quadraticCurveTo(-0.5, 5, -0.2, 11.4); c.stroke();
    c.fillStyle = a.spot;
    ell(c, -2.5, 4.4, 1.25, 1.6, -0.2); ell(c, 2.7, 7.6, 1.05, 1.3, 0.2);
    ell(c, 2.1, 1.4, 0.85, 1.1); ell(c, -2, 9.8, 0.9, 1.1);
    /* the saddle of a mantle - blended into her, not bolted on: a soft
       shoulder, and a rim only along its back edge */
    c.fillStyle = a.body2;
    c.beginPath();
    c.moveTo(-3.5, -7);
    c.bezierCurveTo(-1.6, -9, 1.6, -9, 3.5, -7);
    c.bezierCurveTo(4.4, -4.4, 4.2, -1.8, 3, 0.2);
    c.bezierCurveTo(1.2, 1.4, -1.2, 1.4, -3, 0.2);
    c.bezierCurveTo(-4.2, -1.8, -4.4, -4.4, -3.5, -7);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.keel, -0.1); c.lineWidth = 0.55; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-2.6, -0.2); c.quadraticCurveTo(0, 0.9, 2.6, -0.2); c.stroke();
    c.fillStyle = a.spot; ell(c, -2.2, -4.4, 0.85, 0.8);
    /* the pneumostome - her one nostril, always on her right */
    c.fillStyle = GG.shade(a.spot, -0.35); ell(c, 2.9, -2.6, 1.15, 1.15);
    c.fillStyle = GG.shade(a.body2, 0.2); ell(c, 2.9, -2.6, 0.5, 0.5);
    c.strokeStyle = a.tent; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.3, -9.4 + stretch); c.quadraticCurveTo(-2.9, -13.4, -2.5 + wob, -17.2); c.stroke();
    c.beginPath(); c.moveTo(1.3, -9.4 + stretch); c.quadraticCurveTo(2.9, -13.4, 2.5 + wob, -17.2); c.stroke();
    c.fillStyle = '#2a2418';
    ell(c, -2.5 + wob, -17.6, 0.9, 0.9); ell(c, 2.5 + wob, -17.6, 0.9, 0.9);
    c.strokeStyle = GG.shade(a.tent, -0.2); c.lineWidth = 1.05;
    c.beginPath(); c.moveTo(-1.5, -9.4 + stretch); c.quadraticCurveTo(-3.8, -11, -4.8, -12.4); c.stroke();
    c.beginPath(); c.moveTo(1.5, -9.4 + stretch); c.quadraticCurveTo(3.8, -11, 4.8, -12.4); c.stroke();
  };

  /* A snail-eating ground beetle: wide deep rounded wing covers on a narrow
     neck of a thorax, with a long stretched-out head and long jaws, all built
     to reach right down inside a snail's shell. */
  S.scaphinotus = function (c, a, t) {
    c.strokeStyle = a.legs; c.lineWidth = 1.4; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        var y = -4 + i * 3.6;
        var k = Math.sin(t * 7 + i * 1.6 + (s > 0 ? 0 : 1.9)) * 1.6;
        c.beginPath();
        c.moveTo(s * 2.4, y);
        c.quadraticCurveTo(s * 7.6, y - 0.6 + k, s * 8.8, y + 4.6 + k);
        c.stroke();
      }
    }
    c.fillStyle = a.shell;
    c.beginPath();
    c.moveTo(0, -3.6);
    c.bezierCurveTo(6.8, -2.6, 7.6, 6, 4.4, 11);
    c.bezierCurveTo(2.4, 13.6, -2.4, 13.6, -4.4, 11);
    c.bezierCurveTo(-7.6, 6, -6.8, -2.6, 0, -3.6);
    c.closePath(); c.fill();
    c.strokeStyle = a.sheen; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.13)'; ell(c, -2.8, 1.4, 1.5, 3, -0.25);
    c.fillStyle = a.shell2; ell(c, 0, 4.6, 0.5, 7.6);
    c.strokeStyle = a.shell2; c.lineWidth = 0.5;
    for (var r = 1; r <= 3; r++) {
      c.beginPath();
      c.moveTo(-r * 1.5, -1.6); c.quadraticCurveTo(-r * 1.95, 6, -r * 1.2, 11); c.stroke();
      c.beginPath();
      c.moveTo(r * 1.5, -1.6); c.quadraticCurveTo(r * 1.95, 6, r * 1.2, 11); c.stroke();
    }
    c.fillStyle = a.neck;
    c.beginPath();
    c.moveTo(-2.7, -3.8); c.quadraticCurveTo(-3.4, -8.6, -1.7, -9.8);
    c.lineTo(1.7, -9.8); c.quadraticCurveTo(3.4, -8.6, 2.7, -3.8);
    c.closePath(); c.fill();
    c.fillStyle = a.sheen; ell(c, -1.3, -6.6, 0.55, 2.2);
    c.fillStyle = a.body; ell(c, 0, -12.6, 1.95, 3.6);
    c.fillStyle = a.sheen; ell(c, -0.7, -13, 0.5, 2.4);
    c.fillStyle = '#0c060d'; ell(c, -1.85, -13.6, 0.7, 0.8); ell(c, 1.85, -13.6, 0.7, 0.8);
    c.strokeStyle = a.body; c.lineWidth = 1.7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.3, -15.4); c.quadraticCurveTo(-2.8, -18, -1, -19.8); c.stroke();
    c.beginPath(); c.moveTo(1.3, -15.4); c.quadraticCurveTo(2.8, -18, 1, -19.8); c.stroke();
    curve(c, -1.8, -13.4, -5.4, -15.2, -7, -18.6, 0.6, a.legs);
    curve(c, 1.8, -13.4, 5.4, -15.2, 7, -18.6, 0.6, a.legs);
  };

  /* A skipper, in its jet-fighter pose: forewings up, hindwings flat, a fat
     furry body, a black dash on the forewing and little hooks on the tips of
     its antennae. */
  S.skipper = function (c, a, t) {
    var flap = 0.55 + 0.45 * Math.abs(Math.cos(t * 9));
    for (var s = -1; s <= 1; s += 2) {
      c.save(); c.scale(flap, 1);
      c.fillStyle = a.wing2;
      c.beginPath();
      c.moveTo(s * 1.2, 0.6);
      c.lineTo(s * 9.6, 3.6); c.lineTo(s * 7.4, 9.2); c.lineTo(s * 1.6, 7.4);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = a.wing;
      c.beginPath();
      c.moveTo(s * 1.4, -4.4);
      c.lineTo(s * 12.2, -9.4); c.lineTo(s * 11.2, -2.2); c.lineTo(s * 2.2, 1);
      c.closePath(); c.fill();
      c.strokeStyle = a.accent; c.lineWidth = 1.7; c.stroke();
      c.fillStyle = a.accent;
      for (var q = 0; q < 3; q++) {
        c.beginPath();
        c.moveTo(s * (11.8 - q * 0.35), -7.8 + q * 2.2);
        c.lineTo(s * (8.8 - q * 0.25), -6.6 + q * 2.2);
        c.lineTo(s * (11.6 - q * 0.35), -5.4 + q * 2.2);
        c.closePath(); c.fill();
      }
      c.strokeStyle = a.dash; c.lineWidth = 1.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s * 4.2, -2.4); c.lineTo(s * 8, -5); c.stroke();
      c.restore();
    }
    c.fillStyle = a.body; ell(c, 0, -0.6, 2.4, 5.6);
    c.strokeStyle = GG.shade(a.body, 0.32); c.lineWidth = 0.6; c.lineCap = 'round';
    for (var f = 0; f < 14; f++) {
      var ang = f / 14 * Math.PI * 2;
      var fx = Math.cos(ang) * 2.4, fy = Math.sin(ang) * 5.3;
      c.beginPath();
      c.moveTo(fx * 0.8, -0.6 + fy * 0.8);
      c.lineTo(fx * 1.4, -0.6 + fy * 1.18);
      c.stroke();
    }
    c.fillStyle = GG.shade(a.body, 0.2); ell(c, 0, -5.4, 2.3, 2.3);
    c.fillStyle = '#17110a'; ell(c, -1.4, -6, 0.75, 0.8); ell(c, 1.4, -6, 0.75, 0.8);
    c.strokeStyle = a.accent; c.lineWidth = 1; c.lineCap = 'round';
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      c.beginPath();
      c.moveTo(s2 * 1, -7.2);
      c.quadraticCurveTo(s2 * 3.8, -11.4, s2 * 4.6, -13.8);
      c.stroke();
      c.beginPath();
      c.moveTo(s2 * 4.6, -13.8);
      c.quadraticCurveTo(s2 * 6.2, -14.4, s2 * 5.6, -12.4);
      c.stroke();
    }
  };

  /* An eyed click beetle: long, flat and parallel-sided, speckled grey and
     black, with two huge false eyes on its shoulders. */
  S.clickbeetle = function (c, a, t) {
    legs(c, a.legs, 3, 3.4, 6, t * 7, 1.3);
    c.fillStyle = a.shell;
    c.beginPath();
    c.moveTo(-4, -2.6); c.lineTo(4, -2.6);
    c.lineTo(3.4, 8.4); c.quadraticCurveTo(0, 12.8, -3.4, 8.4);
    c.closePath(); c.fill();
    c.fillStyle = a.shell;
    c.beginPath();
    c.moveTo(-3.4, -10.6); c.lineTo(3.4, -10.6);
    c.lineTo(4.7, -3.4); c.lineTo(3.6, -1.6);
    c.lineTo(-3.6, -1.6); c.lineTo(-4.7, -3.4);
    c.closePath(); c.fill();
    var rnd = GG.mulberry32(41);
    for (var i = 0; i < 46; i++) {
      var sy = -10.2 + rnd() * 21.4;
      var lim = sy < -1.6 ? 3.2 : (sy > 8.4 ? 3.4 - (sy - 8.4) * 0.8 : 3.6);
      if (lim < 0.4) continue;
      var sx = (rnd() - 0.5) * 2 * lim;
      c.fillStyle = rnd() < 0.55 ? a.speck : a.shell2;
      ell(c, sx, sy, 0.45 + rnd() * 0.3, 0.4 + rnd() * 0.25);
    }
    c.fillStyle = a.shell2; ell(c, 0, 4.4, 0.5, 7.8);
    for (var s = -1; s <= 1; s += 2) {
      c.globalAlpha = 0.55;
      c.fillStyle = a.eyering; ell(c, s * 2, -6.4, 2.45, 2.85);
      c.globalAlpha = 1;
      c.fillStyle = a.eyespot; ell(c, s * 2, -6.4, 1.85, 2.2);
    }
    c.fillStyle = a.body; ell(c, 0, -11.4, 2.2, 1.9);
    c.fillStyle = '#100e0c'; ell(c, -1.4, -11.6, 0.6, 0.6); ell(c, 1.4, -11.6, 0.6, 0.6);
    curve(c, -1.4, -12.4, -3.6, -14.6, -4, -17.4, 0.85, a.legs);
    curve(c, 1.4, -12.4, 3.6, -14.6, 4, -17.4, 0.85, a.legs);
  };

  /* A goldenrod crab spider: squat and crab-shaped, with a pink-red streak
     down each side and her two front pairs of legs held wide open in front of
     her like a pair of pincers. */
  S.crabspider = function (c, a, t) {
    var k = Math.sin(t * 2.2) * 0.9;
    c.lineCap = 'round';
    var backCol = GG.shade(a.legs, -0.55), frontCol = GG.shade(a.legs, -0.42);
    for (var s = -1; s <= 1; s += 2) {
      /* the four back legs, short and swept behind her */
      c.strokeStyle = backCol; c.lineWidth = 1.9;
      c.beginPath(); c.moveTo(s * 2.6, 1); c.quadraticCurveTo(s * 7.6, 2.6, s * 9.6, 6.4); c.stroke();
      c.beginPath(); c.moveTo(s * 2.4, 3.4); c.quadraticCurveTo(s * 6.6, 6.4, s * 7.6, 11); c.stroke();
      /* the two front pairs: mostly sideways, opening forward at the tips.
         Held forward instead of wide they read as antlers. */
      c.strokeStyle = frontCol; c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(s * 2.4, -3.4);
      c.quadraticCurveTo(s * (8.4 + k), -6.4, s * (11.6 + k), -7);
      c.stroke();
      c.lineWidth = 1.9;
      c.beginPath();
      c.moveTo(s * (11.6 + k), -7);
      c.quadraticCurveTo(s * (14 + k), -8.4, s * (14.6 + k), -12.2);
      c.stroke();
      /* the second pair goes almost straight out to the side, so the pair
         opens like a claw instead of doubling up into one horn */
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(s * 2.4, -1);
      c.quadraticCurveTo(s * (7.6 + k), -1.8, s * (11 + k), -0.6);
      c.stroke();
      c.lineWidth = 1.9;
      c.beginPath();
      c.moveTo(s * (11 + k), -0.6);
      c.quadraticCurveTo(s * (13.6 + k), 0.2, s * (13.8 + k), -3.4);
      c.stroke();
    }
    c.fillStyle = GG.shade(a.body, -0.2); ell(c, 0, 3.6, 6.4, 5.9);
    c.fillStyle = a.body; ell(c, 0, 3.4, 5.9, 5.4);
    c.fillStyle = 'rgba(255,255,255,0.32)'; ell(c, -2.2, 1.6, 2, 2.2, -0.3);
    c.fillStyle = a.stripe;
    ell(c, -4.9, 3.8, 1.5, 3.9, 0.12); ell(c, 4.9, 3.8, 1.5, 3.9, -0.12);
    c.fillStyle = GG.shade(a.body2, -0.22); ell(c, 0, -3.4, 3.5, 3.1);
    c.fillStyle = a.body2; ell(c, 0, -3.6, 3.1, 2.7);
    c.fillStyle = a.eye;
    ell(c, -2.1, -4.9, 0.45, 0.45); ell(c, -0.8, -5.3, 0.4, 0.4);
    ell(c, 0.8, -5.3, 0.4, 0.4); ell(c, 2.1, -4.9, 0.45, 0.45);
  };

  /* A red-backed jumping spider: chunky, short-legged and furry, with a bright
     red back split by a black stripe, shining teal jaws, and four eyes facing
     forward of which the middle two are enormous. */
  S.jumper = function (c, a, t) {
    var k = Math.sin(t * 5) * 0.8;
    c.strokeStyle = a.legs; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(s * 2.6, -5.4); c.quadraticCurveTo(s * 6.6, -7.6 + k, s * 7.6, -4.4 + k); c.stroke();
      c.beginPath(); c.moveTo(s * 2.8, -3); c.quadraticCurveTo(s * 6.2, -3.4, s * 7, 0); c.stroke();
      c.lineWidth = 1.7;
      c.beginPath(); c.moveTo(s * 2.4, 1.4); c.quadraticCurveTo(s * 5.8, 2.4, s * 6.2, 5.6); c.stroke();
      c.beginPath(); c.moveTo(s * 2.2, 3.6); c.quadraticCurveTo(s * 5.4, 5.8, s * 5.2, 9.2); c.stroke();
    }
    c.fillStyle = a.back; ell(c, 0, 4.6, 4.2, 5.9);
    c.fillStyle = a.stripe; ell(c, 0, 4.6, 1.1, 5.5);
    c.fillStyle = a.body; ell(c, 0, -3.8, 4.4, 4.8);
    c.strokeStyle = GG.shade(a.body, 0.45); c.lineWidth = 0.55; c.lineCap = 'round';
    for (var f = 0; f < 12; f++) {
      var ang = f / 12 * Math.PI * 2;
      var fx = Math.cos(ang) * 4.4, fy = Math.sin(ang) * 4.8;
      c.beginPath();
      c.moveTo(fx * 0.82, -3.8 + fy * 0.82);
      c.lineTo(fx * 1.16, -3.8 + fy * 1.16);
      c.stroke();
    }
    c.fillStyle = a.jaw;
    ell(c, -1.9, -8.8, 1.8, 2.1); ell(c, 1.9, -8.8, 1.8, 2.1);
    c.fillStyle = GG.shade(a.jaw, 0.45);
    ell(c, -2.3, -9.6, 0.7, 0.85); ell(c, 2.3, -9.6, 0.7, 0.85);
    c.fillStyle = a.eye;
    ell(c, -1.75, -5.6, 2, 2); ell(c, 1.75, -5.6, 2, 2);
    ell(c, -4.05, -4.2, 0.9, 0.95); ell(c, 4.05, -4.2, 0.9, 0.95);
    c.fillStyle = 'rgba(255,255,255,0.82)';
    ell(c, -2.35, -6.3, 0.6, 0.6); ell(c, 1.15, -6.3, 0.6, 0.6);
    c.fillStyle = 'rgba(255,255,255,0.5)';
    ell(c, -4.25, -4.6, 0.32, 0.32); ell(c, 3.85, -4.6, 0.32, 0.32);
  };

  /* A giant ichneumon: a slim banded wasp with rusty shoulders, four clear
     wings, and an egg-laying thread twice as long as she is trailing out
     behind her between its two sheaths. */
  S.ichneumon = function (c, a, t) {
    var flap = 0.4 + 0.6 * Math.abs(Math.cos(t * 18));
    var wag = Math.sin(t * 1.2) * 1.4;
    c.strokeStyle = a.thread; c.lineWidth = 0.6; c.lineCap = 'round';
    for (var q = -1; q <= 1; q++) {
      c.beginPath();
      c.moveTo(q * 0.5, 10.4);
      c.quadraticCurveTo(q * 1.8 + wag * 0.4, 19, q * 2.4 + wag, 28);
      c.stroke();
    }
    c.save(); c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -6, -3.4, 5.8, 2.1, -0.24); ell(c, 6, -3.4, 5.8, 2.1, 0.24);
    ell(c, -4.6, 0.6, 4.2, 1.6, -0.16); ell(c, 4.6, 0.6, 4.2, 1.6, 0.16);
    c.restore();
    legs(c, a.legs, 3, 3.4, 5.8, t * 8, 1);
    c.fillStyle = a.rust; ell(c, 0, -4.4, 2.8, 3.4);
    c.fillStyle = a.body; ell(c, 0, -2.6, 2.6, 1);
    c.fillStyle = a.body; ell(c, 0, -8.2, 2.2, 2.2);
    c.fillStyle = a.band; ell(c, 0, -9, 1.9, 0.9);
    c.fillStyle = '#100c0a'; ell(c, -1.6, -8.4, 0.75, 0.9); ell(c, 1.6, -8.4, 0.75, 0.9);
    c.strokeStyle = a.rust; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(0, -1.4); c.lineTo(0, 1); c.stroke();
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(0, 0.6);
    c.quadraticCurveTo(3, 2.6, 2.4, 7);
    c.quadraticCurveTo(1.4, 10.4, 0, 11);
    c.quadraticCurveTo(-1.4, 10.4, -2.4, 7);
    c.quadraticCurveTo(-3, 2.6, 0, 0.6);
    c.closePath(); c.fill();
    c.fillStyle = a.band;
    ell(c, 0, 2.6, 2.65, 0.75); ell(c, 0, 5.2, 2.4, 0.7); ell(c, 0, 7.6, 1.9, 0.65);
    c.fillStyle = a.rust; ell(c, 0, 9.8, 1.4, 1.1);
    curve(c, -1.1, -9.8, -4.6, -13, -4.2, -17.6, 0.8, a.body);
    curve(c, 1.1, -9.8, 4.6, -13, 4.2, -17.6, 0.8, a.body);
  };

  GG.BugArt = {
    shapes: S,
    /* Draw a bug. (x,y) is its centre, angle is where it is heading (radians),
       scale 1 is world size, t is a time value for the animation. */
    draw: function (c, bug, x, y, scale, angle, t, opts) {
      opts = opts || {};
      var a = bug.art;
      var fn = S[a.shape] || S.beetle;
      c.save();
      c.translate(x, y);
      if (angle != null) c.rotate(angle + Math.PI / 2);
      var s = scale * (bug.size || 1);
      c.scale(s, s);
      if (opts.alpha != null) c.globalAlpha = opts.alpha;
      if (opts.silhouette) {
        c.save();
        c.fillStyle = '#cdd6c4'; c.strokeStyle = '#cdd6c4';
        var old = c.fillStyle;
        fn({
          save: c.save.bind(c), restore: c.restore.bind(c), beginPath: c.beginPath.bind(c),
          moveTo: c.moveTo.bind(c), lineTo: c.lineTo.bind(c), closePath: c.closePath.bind(c),
          quadraticCurveTo: c.quadraticCurveTo.bind(c), bezierCurveTo: c.bezierCurveTo.bind(c),
          ellipse: c.ellipse.bind(c), arc: c.arc.bind(c), stroke: c.stroke.bind(c),
          fill: c.fill.bind(c), scale: c.scale.bind(c), translate: c.translate.bind(c),
          rotate: c.rotate.bind(c), clip: c.clip.bind(c), fillRect: c.fillRect.bind(c),
          createRadialGradient: c.createRadialGradient.bind(c),
          set fillStyle(v) { c.fillStyle = '#c3ccbb'; },
          get fillStyle() { return '#c3ccbb'; },
          set strokeStyle(v) { c.strokeStyle = '#c3ccbb'; },
          get strokeStyle() { return '#c3ccbb'; },
          set lineWidth(v) { c.lineWidth = v; }, get lineWidth() { return c.lineWidth; },
          set lineCap(v) { c.lineCap = v; }, get lineCap() { return c.lineCap; },
          set globalAlpha(v) { c.globalAlpha = v; }, get globalAlpha() { return c.globalAlpha; }
        }, a, t);
        c.restore();
      } else {
        fn(c, a, t);
      }
      c.restore();
    },
    /* Shadow blob under a flying bug. */
    shadow: function (c, x, y, r, alpha) {
      c.fillStyle = 'rgba(20,40,15,' + (alpha == null ? 0.18 : alpha) + ')';
      ell(c, x, y, r, r * 0.45);
    }
  };
})(window.GG = window.GG || {});
