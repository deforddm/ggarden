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

  S.butterfly = function (c, a, t) {
    var flap = 0.45 + 0.55 * Math.abs(Math.cos(t * 7));
    for (var s = -1; s <= 1; s += 2) {
      hindWing(c, s, flap, a.wing2 || a.wing, a.accent);
      foreWing(c, s, flap, a.wing, a.accent);
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
      }
      c.restore();
    }
    c.fillStyle = a.body; ell(c, 0, -0.5, 2.4, 5.6);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -5, 2.5, 2.4);
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
    legs(c, GG.shade(a.body, -0.35), 3, 3.6, 6.6 * (a.slim ? 1.1 : 1), t * 8, 1.3);
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
      line(c, -1.6, -8, -3.6, -11, 0.9, a.accent);
      line(c, 1.6, -8, 3.6, -11, 0.9, a.accent);
    }
    c.fillStyle = a.body; ell(c, 0, 0.4, 5.4 * w, 7.2);
    if (a.rim) { c.fillStyle = a.rim; ell(c, 0, 0.6, 5.1 * w, 6.9); }
    c.fillStyle = a.wing; ell(c, 0, 0.8, 4.9 * w, 6.6);
    c.fillStyle = a.accent; ell(c, 0, 0.8, 0.5, 6.6);
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
      c.fillStyle = a.accent;
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
    c.save(); c.globalAlpha = 0.55; c.scale(flap, 1);
    c.fillStyle = a.wing;
    ell(c, -4.4, -2, 4, 2.4, -0.5); ell(c, 4.4, -2, 4, 2.4, 0.5);
    c.restore(); c.globalAlpha = 1;
    c.fillStyle = a.head || a.accent; ell(c, 0, -6, 2.6, 2.4);
    c.fillStyle = '#fff'; ell(c, -1.1, -6.6, 0.6, 0.7); ell(c, 1.1, -6.6, 0.6, 0.7);
    c.fillStyle = a.thorax || GG.shade(a.body, -0.12); ell(c, 0, -2.6, 3.4, 3);
    if (a.thorax) {
      c.fillStyle = 'rgba(255,255,255,0.28)'; ell(c, -1.2, -3.6, 1.3, 1.4, -0.4);
    }
    c.fillStyle = a.body; ell(c, 0, 2.4, 3.8, 5.2);
    c.fillStyle = a.accent;
    ell(c, 0, 0.6, 3.5, 0.9); ell(c, 0, 3.4, 3.3, 0.9); ell(c, 0, 5.8, 2.4, 0.8);
    line(c, -1, -7.6, -2.6, -10, 0.8, a.accent);
    line(c, 1, -7.6, 2.6, -10, 0.8, a.accent);
  };

  S.dragonfly = function (c, a, t) {
    var flap = 0.45 + 0.55 * Math.abs(Math.cos(t * 20));
    c.save(); c.globalAlpha = 0.55; c.scale(1, flap);
    c.fillStyle = a.wing;
    ell(c, -8, -3.4, 8.4, 2, -0.12); ell(c, 8, -3.4, 8.4, 2, 0.12);
    ell(c, -7.4, 0.4, 7.8, 1.9, 0.1); ell(c, 7.4, 0.4, 7.8, 1.9, -0.1);
    c.restore(); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.5;
    c.fillStyle = a.accent; ell(c, 0, -8.2, 3, 2.6);
    c.fillStyle = '#2b2b33'; ell(c, -1.7, -9, 1.7, 1.7); ell(c, 1.7, -9, 1.7, 1.7);
    c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -2.1, -9.5, 0.6, 0.6); ell(c, 2.1, -9.5, 0.6, 0.6);
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, 0, -3.6, 2.6, 3.4);
    c.fillStyle = a.body;
    for (var i = 0; i < 6; i++) {
      ell(c, 0, 0.4 + i * 2.2, 1.9 - i * 0.17, 1.35);
    }
    if (a.pattern === 'stripes') {
      c.fillStyle = a.accent;
      for (var j = 0; j < 5; j++) ell(c, 0, 1.6 + j * 2.2, 1.7 - j * 0.16, 0.4);
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
    c.strokeStyle = GG.shade(a.body, -0.3); c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * 1.6, -3); c.quadraticCurveTo(s * 5, -1, s * 6, 2); c.stroke();
      c.beginPath(); c.moveTo(s * 1.6, -1); c.quadraticCurveTo(s * 5.5, 1.5, s * 6.5, 5); c.stroke();
      c.beginPath();
      c.moveTo(s * 2, 2); c.lineTo(s * 6.5, 7 + k); c.lineTo(s * 3.4, 13 + k); c.stroke();
      c.lineWidth = 2.6; c.strokeStyle = a.wing;
      c.beginPath(); c.moveTo(s * 2, 2); c.lineTo(s * 6.2, 6.6 + k); c.stroke();
      c.lineWidth = 1.3; c.strokeStyle = GG.shade(a.body, -0.3);
    }
    c.fillStyle = a.wing; ell(c, 0, 2.5, 3.2, 9);
    c.fillStyle = GG.shade(a.wing, -0.15); ell(c, 1.4, 2.5, 1.5, 8.2);
    c.fillStyle = a.body; ell(c, 0, -5.2, 2.7, 3.6);
    c.fillStyle = '#20202a'; ell(c, -1.4, -6.6, 0.9, 1.1); ell(c, 1.4, -6.6, 0.9, 1.1);
    curve(c, -1, -8, -2.5, -12, -3, -15, 0.9, a.accent);
    curve(c, 1, -8, 2.5, -12, 3, -15, 0.9, a.accent);
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
    c.strokeStyle = GG.shade(a.body, -0.2); c.lineWidth = 1.4; c.lineCap = 'round';
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
    c.fillStyle = GG.shade(a.wing, -0.12); ell(c, 1.2, 4.5, 1.4, 8.2);
    c.fillStyle = a.body; ell(c, 0, -4, 1.7, 4.4);
    c.beginPath();
    c.moveTo(-2.8, -10.5); c.lineTo(2.8, -10.5); c.lineTo(0, -6.4); c.closePath(); c.fill();
    c.fillStyle = '#f7ffe8'; ell(c, -2, -10.4, 1.2, 1.3); ell(c, 2, -10.4, 1.2, 1.3);
    c.fillStyle = '#20202a'; ell(c, -2, -10.4, 0.5, 0.6); ell(c, 2, -10.4, 0.5, 0.6);
    curve(c, -1, -11.4, -3, -15, -4, -18, 0.7, a.accent);
    curve(c, 1, -11.4, 3, -15, 4, -18, 0.7, a.accent);
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
    legs(c, a.accent, 3, 3.2, 5.6, t * 12, 1.1);
    c.fillStyle = a.body; ell(c, 0, 4.4, 3, 4);
    c.fillStyle = GG.shade(a.body, 0.08); ell(c, 0, -0.4, 1.9, 2.4);
    c.fillStyle = a.body; ell(c, 0, -4.6, 2.4, 2.6);
    c.fillStyle = '#0a0a0a'; ell(c, -1.1, -5.2, 0.6, 0.7); ell(c, 1.1, -5.2, 0.6, 0.7);
    curve(c, -1, -6.4, -3, -8, -3.4, -10.6, 0.8, a.accent);
    curve(c, 1, -6.4, 3, -8, 3.4, -10.6, 0.8, a.accent);
  };

  S.caterpillar = function (c, a, t) {
    for (var i = 6; i >= 0; i--) {
      var wob = Math.sin(t * 5 - i * 0.6) * 1.6;
      var r = 3.4 - i * 0.18;
      c.fillStyle = (i % 2) ? a.wing : a.body;
      ell(c, wob, 7 - i * 2.5, r, r);
    }
    var hw = Math.sin(t * 5 - 7 * 0.6) * 1.6;
    c.fillStyle = GG.shade(a.body, -0.1); ell(c, hw, -10, 3.5, 3.3);
    c.fillStyle = '#1e1e1e'; ell(c, hw - 1.4, -10.6, 0.8, 0.9); ell(c, hw + 1.4, -10.6, 0.8, 0.9);
    c.fillStyle = '#fff'; ell(c, hw - 1.6, -10.9, 0.3, 0.3); ell(c, hw + 1.2, -10.9, 0.3, 0.3);
    curve(c, hw - 1, -12.4, hw - 2, -14, hw - 2.6, -15.6, 0.7, a.accent);
    curve(c, hw + 1, -12.4, hw + 2, -14, hw + 2.6, -15.6, 0.7, a.accent);
  };

  S.spider = function (c, a, t) {
    var k = Math.sin(t * 5) * 1.2;
    c.strokeStyle = a.wing; c.lineWidth = 1.3; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 4; i++) {
        var ang = -1.15 + i * 0.62;
        var px = s * Math.cos(ang) * 3, py = Math.sin(ang) * 3 - 1;
        var mx = s * (7 + i * 0.5), my = py + (i - 1.5) * 2.6 + k * (i % 2 ? 1 : -1);
        c.beginPath();
        c.moveTo(px, py);
        c.quadraticCurveTo(mx, my - 3, s * (9.5 + i * 0.4), my + 2);
        c.stroke();
      }
    }
    c.fillStyle = a.wing; ell(c, 0, -3.5, 2.6, 2.6);
    c.fillStyle = a.body; ell(c, 0, 3, 4.6, 5.6);
    c.fillStyle = a.accent;
    ell(c, 0, 1.4, 3.6, 0.8); ell(c, 0, 4.2, 3.2, 0.8); ell(c, 0, 6.6, 2.2, 0.7);
    c.fillStyle = '#101010';
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
    c.fillStyle = a.wing;
    ell(c, 0.4, 2.6, 6.2, 6.2);
    c.strokeStyle = a.accent; c.lineWidth = 1.3;
    c.beginPath();
    for (var i = 0; i < 70; i++) {
      var ang = i * 0.28, r = 0.5 + i * 0.085;
      var x = 0.4 + Math.cos(ang) * r, y = 2.6 + Math.sin(ang) * r;
      if (r > 5.6) break;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.25)'; ell(c, -1.8, 0.4, 2, 2.4, -0.4);
    c.fillStyle = a.body; ell(c, 1, -7.4 + bob, 2.4, 2.2);
    c.strokeStyle = a.body; c.lineWidth = 0.9;
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
    c.strokeStyle = GG.shade(a.body, 0.16); c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(px(0) - 1, py(0));
    for (var j = 1; j <= seg; j++) c.lineTo(px(j) - 1, py(j));
    c.stroke();
    // faint rings
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.8;
    for (var k = 1; k < seg; k++) {
      c.beginPath();
      c.moveTo(px(k) - 2.7, py(k)); c.lineTo(px(k) + 2.7, py(k));
      c.stroke();
    }
    // the saddle
    c.strokeStyle = a.accent; c.lineWidth = 5.6;
    c.beginPath();
    c.moveTo(px(9), py(9)); c.lineTo(px(11), py(11));
    c.stroke();
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
    c.strokeStyle = a.accent; c.lineWidth = 0.8; c.lineCap = 'round';
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
      c.fillStyle = (j % 2) ? a.body : a.wing;
      ell(c, w2, yy, 3.1 - Math.abs(j - 6) * 0.05, 1.5);
      c.fillStyle = 'rgba(255,255,255,0.10)';
      ell(c, w2 - 1, yy - 0.4, 1.1, 0.8);
    }
    var hx = Math.sin(t * 2.4 - n * 0.45) * 1.2;
    c.fillStyle = a.wing; ell(c, hx, -15.5, 2.8, 2.2);
    line(c, hx - 1, -17, hx - 2.8, -19.6, 0.8, a.accent);
    line(c, hx + 1, -17, hx + 2.8, -19.6, 0.8, a.accent);
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
    c.strokeStyle = a.accent; c.lineWidth = 0.95; c.lineCap = 'round';
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(s * 1.4, -3 + i * 2.4);
        c.quadraticCurveTo(s * (11 + i * 3.5), 3 + i * 4 + k * 2, s * (8 + i * 2.5), 19 + i * 5 + k * 3);
        c.stroke();
      }
    }
    c.save(); c.globalAlpha = 0.5;
    c.fillStyle = a.wing;
    ell(c, -5.4, 0, 3.2, 8.6, 0.3); ell(c, 5.4, 0, 3.2, 8.6, -0.3);
    c.restore();
    c.fillStyle = a.body; ell(c, 0, 2, 1.7, 8.5);
    c.fillStyle = GG.shade(a.body, 0.14); ell(c, 0, -5.4, 1.8, 2.6);
    c.fillStyle = '#2b2b33'; ell(c, 0, -7.4, 1.5, 1.4);
    line(c, -0.8, -8.6, -2.4, -11.4, 0.7, a.accent);
    line(c, 0.8, -8.6, 2.4, -11.4, 0.7, a.accent);
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
    c.fillStyle = a.accent; c.globalAlpha = 0.55;
    ell(c, -6.2, -2, 4.4, 0.75, -0.42); ell(c, 6.2, -2, 4.4, 0.75, 0.42);
    c.restore(); c.globalAlpha = 1;
    /* dangling legs */
    c.strokeStyle = a.accent; c.lineWidth = 0.7; c.lineCap = 'round';
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
    /* fur */
    c.strokeStyle = GG.shade(a.body, 0.28); c.lineWidth = 0.6;
    for (var f = 0; f < 14; f++) {
      var ang = f / 14 * Math.PI * 2;
      var rx = Math.cos(ang) * 4.6, ry = 0.2 + Math.sin(ang) * 4.8;
      c.beginPath(); c.moveTo(rx * 0.8, ry * 0.8);
      c.lineTo(rx * 1.16, ry * 1.16); c.stroke();
    }
    c.fillStyle = a.accent; ell(c, 0, -4.4, 2.1, 1.9);
    c.fillStyle = '#101010'; ell(c, -1.3, -4.8, 0.85, 0.95); ell(c, 1.3, -4.8, 0.85, 0.95);
    /* the straw - straight out in front, never a sting */
    line(c, 0, -5.4, 0, -13, 0.75, a.accent);
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
