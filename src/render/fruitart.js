/* Fruit, drawn with code like everything else.
   `draw` puts one piece of fruit on a page or a card, hanging from its stem,
   about 26 pixels tall at scale 1. `onPlant` hangs a whole crop of it in a
   tree or a bush out in the garden. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath();
    c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2);
    c.fill();
  }
  function stem(c, x, y, len, col, lean) {
    c.strokeStyle = col; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y);
    c.quadraticCurveTo(x + (lean || 0), y - len * 0.6, x + (lean || 0) * 1.4, y - len);
    c.stroke();
  }
  function leafAt(c, x, y, r, col, rot) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(r * 0.9, -r * 0.7, r * 2, 0);
    c.quadraticCurveTo(r * 0.9, r * 0.7, 0, 0);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(col, -0.25); c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(0.2, 0); c.lineTo(r * 1.8, 0); c.stroke();
    c.restore();
  }
  /* '#rrggbb' -> 'rgba(r,g,b,al)', for soft blushes and blooms */
  function rgba(hex, al) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + al + ')';
  }
  /* one little shiny round berry: dark rim, colour, a highlight */
  function bead(c, x, y, r, rim, col, shine) {
    c.fillStyle = rim; ell(c, x, y, r, r);
    c.fillStyle = col; ell(c, x - r * 0.12, y - r * 0.14, r * 0.8, r * 0.8);
    if (shine) {
      c.fillStyle = 'rgba(255,255,255,' + shine + ')';
      ell(c, x - r * 0.34, y - r * 0.38, r * 0.26, r * 0.3, -0.5);
    }
  }

  var F = {};

  F.apple = function (c, a, t) {
    stem(c, 0, -7, 5, '#6a4a2a', 0.6);
    leafAt(c, 0.8, -10.4, 2.6, a.leaf, -0.5);
    c.fillStyle = a.skin2;
    c.beginPath();
    c.moveTo(0, -7.4);
    c.bezierCurveTo(-9, -8.6, -9.6, 5, -0.2, 8.6);
    c.bezierCurveTo(9.4, 5, 8.8, -8.6, 0, -7.4);
    c.closePath(); c.fill();
    c.fillStyle = a.skin;
    ell(c, -0.8, -0.4, 7.2, 7.4);
    if (a.speck) {
      c.fillStyle = 'rgba(255,240,220,0.55)';
      for (var i = 0; i < 12; i++) {
        var ang = i * 2.4, rr = 2 + (i % 4) * 1.5;
        ell(c, -0.8 + Math.cos(ang) * rr, -0.4 + Math.sin(ang) * rr * 1.05, 0.45, 0.45);
      }
    }
    c.fillStyle = 'rgba(255,255,255,0.42)';
    ell(c, -3.4, -3.4, 2, 2.8, -0.5);
    c.fillStyle = GG.shade(a.skin2, -0.3);
    ell(c, 0, -7, 1, 0.8);
  };

  F.pear = function (c, a, t) {
    stem(c, 0.4, -9, 5, '#6a4a2a', 0.3);
    leafAt(c, 1, -12.4, 2.4, a.leaf, -0.45);
    c.fillStyle = a.skin2;
    c.beginPath();
    c.moveTo(0, -9.4);
    c.bezierCurveTo(-4.4, -8.4, -4, -1.4, -6.4, 2.4);
    c.bezierCurveTo(-8.4, 7.4, -4, 10.4, 0, 10.4);
    c.bezierCurveTo(4, 10.4, 8.4, 7.4, 6.4, 2.4);
    c.bezierCurveTo(4, -1.4, 4.4, -8.4, 0, -9.4);
    c.closePath(); c.fill();
    c.save();
    c.beginPath();
    c.moveTo(0, -9.4);
    c.bezierCurveTo(-4.4, -8.4, -4, -1.4, -6.4, 2.4);
    c.bezierCurveTo(-8.4, 7.4, -4, 10.4, 0, 10.4);
    c.bezierCurveTo(4, 10.4, 8.4, 7.4, 6.4, 2.4);
    c.bezierCurveTo(4, -1.4, 4.4, -8.4, 0, -9.4);
    c.closePath(); c.clip();
    c.fillStyle = a.skin;
    ell(c, -1, 2, 6.4, 8);
    c.fillStyle = 'rgba(160,120,60,0.30)';
    for (var i = 0; i < 9; i++) ell(c, -5 + (i * 1.7) % 10, -4 + (i * 3.1) % 13, 0.5, 0.5);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.38)';
    ell(c, -3, 3.4, 1.7, 3, -0.25);
  };

  F.cherry = function (c, a, t) {
    var sway = Math.sin(t * 1.6) * 0.6;
    c.strokeStyle = '#7a9a4a'; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(-3, -6, -4.4 + sway, -0.6); c.stroke();
    c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(3.4, -5, 4.8 - sway, 2.4); c.stroke();
    leafAt(c, 0.4, -12.6, 2.6, a.leaf, -0.7);
    [[-4.4 + sway, 2.6, 4.2], [4.8 - sway, 5.6, 4.6]].forEach(function (p) {
      if (a.blush) {
        /* a Rainier: golden yellow, with a red cheek where the sun hit it */
        c.fillStyle = GG.shade(a.skin, -0.16); ell(c, p[0], p[1], p[2], p[2] * 0.98);
        c.fillStyle = a.skin; ell(c, p[0] - 0.4, p[1] - 0.4, p[2] * 0.82, p[2] * 0.8);
        var g = c.createRadialGradient(p[0] + p[2] * 0.45, p[1] - p[2] * 0.2, 0,
          p[0] + p[2] * 0.45, p[1] - p[2] * 0.2, p[2] * 1.05);
        g.addColorStop(0, rgba(a.skin2, 0.95));
        g.addColorStop(0.55, rgba(a.skin2, 0.55));
        g.addColorStop(1, rgba(a.skin2, 0));
        c.fillStyle = g; ell(c, p[0], p[1], p[2], p[2] * 0.98);
      } else {
        c.fillStyle = a.skin2; ell(c, p[0], p[1], p[2], p[2] * 0.98);
        c.fillStyle = a.skin; ell(c, p[0] - 0.4, p[1] - 0.4, p[2] * 0.82, p[2] * 0.8);
      }
      c.fillStyle = 'rgba(255,255,255,0.45)';
      ell(c, p[0] - p[2] * 0.36, p[1] - p[2] * 0.42, p[2] * 0.24, p[2] * 0.3, -0.5);
    });
  };

  /* a little drooping bunch of round berries */
  F.berry = function (c, a, t) {
    c.strokeStyle = '#7a6a4a'; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -12); c.lineTo(0, -5); c.stroke();
    leafAt(c, 0.4, -11.6, 2.6, a.leaf, -0.6);
    leafAt(c, -0.4, -9.4, 2.2, a.leaf, Math.PI + 0.6);
    var spots = [[-4.4, -1.4, 3.4], [4.2, -0.4, 3.2], [-1.4, 4.6, 3.6], [3, 6.4, 2.9], [-5, 5.4, 2.6]];
    spots.forEach(function (p, i) {
      c.strokeStyle = '#7a6a4a'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(0, -5); c.lineTo(p[0], p[1] - p[2]); c.stroke();
      c.fillStyle = a.skin2; ell(c, p[0], p[1], p[2], p[2]);
      c.fillStyle = a.skin; ell(c, p[0] - 0.3, p[1] - 0.4, p[2] * 0.82, p[2] * 0.8);
      if (a.crown) {
        c.fillStyle = GG.shade(a.skin2, -0.3);
        for (var k = 0; k < 5; k++) {
          var ang = k / 5 * Math.PI * 2;
          ell(c, p[0] + Math.cos(ang) * p[2] * 0.34, p[1] + p[2] * 0.5 + Math.sin(ang) * p[2] * 0.2, 0.32, 0.32);
        }
      }
      if (a.waxy) {
        c.fillStyle = 'rgba(255,255,255,0.7)';
        ell(c, p[0] - p[2] * 0.3, p[1] - p[2] * 0.36, p[2] * 0.3, p[2] * 0.34, -0.5);
      } else if (a.glossy) {
        c.fillStyle = 'rgba(255,255,255,0.55)';
        ell(c, p[0] - p[2] * 0.32, p[1] - p[2] * 0.38, p[2] * 0.26, p[2] * 0.3, -0.5);
      } else {
        c.fillStyle = 'rgba(255,255,255,0.3)';
        ell(c, p[0] - p[2] * 0.32, p[1] - p[2] * 0.38, p[2] * 0.24, p[2] * 0.28, -0.5);
      }
    });
  };

  /* a long hanging spike, the way chokecherries really grow */
  F.spike = function (c, a, t) {
    var sway = Math.sin(t * 1.4) * 0.8;
    c.strokeStyle = '#6a7a3a'; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, -12);
    c.quadraticCurveTo(sway, -2, sway * 1.6, 10.4);
    c.stroke();
    leafAt(c, 0.6, -12.2, 2.8, a.leaf, -0.5);
    for (var i = 0; i < 9; i++) {
      var f = i / 8;
      var y = -8.6 + f * 18;
      var x = sway * f * 1.6 + (i % 2 ? 2.6 : -2.6) * (1 - f * 0.45);
      var r = 2.5 - f * 0.9;
      c.strokeStyle = '#6a7a3a'; c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(sway * f * 1.4, y - 1); c.lineTo(x, y); c.stroke();
      c.fillStyle = a.skin2; ell(c, x, y, r, r);
      c.fillStyle = a.skin; ell(c, x - 0.25, y - 0.3, r * 0.8, r * 0.78);
      c.fillStyle = 'rgba(255,255,255,0.28)';
      ell(c, x - r * 0.32, y - r * 0.38, r * 0.24, r * 0.28, -0.5);
    }
  };

  /* a rose hip: round, with the dried sepals still standing on the bottom */
  F.hip = function (c, a, t) {
    stem(c, 0, -6.6, 5.4, '#6a7a3a', -0.5);
    leafAt(c, -1, -10.6, 2.4, a.leaf, Math.PI + 0.4);
    c.fillStyle = a.skin2; ell(c, 0, 0.4, 6.6, 7);
    c.fillStyle = a.skin; ell(c, -0.6, -0.2, 5.6, 6);
    c.fillStyle = 'rgba(255,255,255,0.4)';
    ell(c, -2.8, -3, 1.7, 2.4, -0.5);
    /* the little crown of dried sepals */
    c.strokeStyle = '#7a6a4a'; c.lineWidth = 0.85; c.lineCap = 'round';
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(i * 0.9, 6.6);
      c.lineTo(i * 2.4, 10.4);
      c.stroke();
    }
  };

  /* ---------- v1.13: the berries along the edge of the orchard ---------- */

  /* A blackberry or a raspberry. Neither of them is one berry: each is a
     bundle of little drupelets stuck together, and that bundle is the whole
     point, so it is drawn bead by bead. `thimble` makes it a raspberry. */
  F.bramble = function (c, a, t) {
    var thimble = !!a.thimble;
    c.strokeStyle = '#7a8f42'; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -12.6); c.quadraticCurveTo(-0.8, -11, 0, -9.2); c.stroke();
    /* a solid body behind, so the gaps between the beads are not sky */
    c.fillStyle = GG.shade(a.skin2, -0.3);
    ell(c, 0, thimble ? -0.4 : 0.4, thimble ? 5.9 : 6.8, thimble ? 8.2 : 9.2);
    /* the little green sepals it sits in, poking out at the shoulders */
    c.fillStyle = a.leaf;
    for (var k = -2; k <= 2; k++) {
      ell(c, k * 2.4, -8.4 + Math.abs(k) * 1.1, 2.6, 1.05, k * 0.55);
    }
    var rows = thimble
      ? [[-6.8, 4.6, 4], [-3.2, 5.0, 4], [0.4, 4.4, 4], [3.8, 3.3, 3], [6.8, 1.6, 2]]
      : [[-7.0, 3.6, 3], [-3.4, 5.2, 4], [0.4, 5.6, 4], [4.2, 4.8, 4], [7.6, 2.9, 3]];
    var r = thimble ? 2.15 : 2.35;
    rows.forEach(function (row) {
      var n = row[2];
      for (var i = 0; i < n; i++) {
        var fx = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
        var bx = fx * row[1], by = row[0] + Math.abs(fx) * 0.8;
        c.fillStyle = a.skin2; ell(c, bx, by, r, r);
        c.fillStyle = a.skin; ell(c, bx - r * 0.2, by - r * 0.22, r * 0.72, r * 0.72);
        if (thimble) {
          c.fillStyle = 'rgba(255,224,224,0.32)';
          ell(c, bx - r * 0.3, by - r * 0.34, r * 0.34, r * 0.36, -0.5);
        } else {
          c.fillStyle = 'rgba(255,255,255,0.55)';
          ell(c, bx - r * 0.34, by - r * 0.38, r * 0.3, r * 0.34, -0.5);
        }
      }
    });
    if (thimble) {
      /* the fine pale hairs all over a raspberry */
      c.strokeStyle = 'rgba(255,232,232,0.55)'; c.lineWidth = 0.4;
      for (var h = 0; h < 11; h++) {
        var ang = h / 11 * Math.PI * 2;
        var hx = Math.cos(ang) * 5.4, hy = -0.4 + Math.sin(ang) * 7.6;
        c.beginPath(); c.moveTo(hx, hy);
        c.lineTo(hx * 1.2, -0.4 + (hy + 0.4) * 1.16); c.stroke();
      }
    }
  };

  /* A strig of currants: one green string hung under a branch with the
     berries dangling off it, the way they really grow. */
  F.strig = function (c, a, t) {
    var sway = Math.sin(t * 1.3) * 0.7;
    c.strokeStyle = '#7a6a52'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-9.6, -11.4); c.quadraticCurveTo(0, -9.4, 9.6, -12.2); c.stroke();
    leafAt(c, 4.6, -12.4, 2.4, a.leaf, -0.75);
    c.strokeStyle = '#8a9a52'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(-1.4, -10.2);
    c.quadraticCurveTo(sway - 1, -1, sway * 1.6 + 0.6, 10.6);
    c.stroke();
    for (var i = 0; i < 8; i++) {
      var f = i / 7;
      var sx = -1.4 + (sway * 1.6 + 2) * f * f;
      var sy = -10.2 + f * 20.6;
      var bx = sx + (i % 2 ? 1 : -1) * (3.1 - f * 0.9);
      var by = sy + 1.5;
      var r = 3.1 - f * 0.7;
      c.strokeStyle = '#8a9a52'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(bx, by - r * 0.85); c.stroke();
      c.fillStyle = a.skin2; ell(c, bx, by, r, r);
      c.fillStyle = a.skin; ell(c, bx, by, r * 0.84, r * 0.84);
      c.fillStyle = GG.shade(a.skin, 0.42);
      ell(c, bx - r * 0.1, by + r * 0.12, r * 0.48, r * 0.48);
      /* you really can see the seeds through the skin */
      c.fillStyle = 'rgba(110,16,20,0.5)';
      ell(c, bx - r * 0.26, by + r * 0.06, r * 0.16, r * 0.22, 0.4);
      ell(c, bx + r * 0.22, by - r * 0.1, r * 0.15, r * 0.2, -0.3);
      c.fillStyle = 'rgba(255,255,255,0.62)';
      ell(c, bx - r * 0.34, by - r * 0.4, r * 0.26, r * 0.3, -0.5);
    }
  };

  /* A gooseberry: big, see-through, veined like a beach ball, sitting on its
     own under the branch — and a spine beside the leaf, which is the reason
     this one is a "careful". */
  F.goose = function (c, a, t) {
    c.strokeStyle = '#7a6a52'; c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-11.4, -10.2); c.quadraticCurveTo(0, -8.4, 11.4, -11.2); c.stroke();
    /* a small crinkly maple-shaped leaf, with a stiff spine right beside it */
    c.fillStyle = a.leaf;
    c.beginPath();
    for (var q = 0; q <= 40; q++) {
      var la = (q / 40) * Math.PI * 2 - Math.PI / 2;
      var lr = 4.2 * (0.56 + 0.44 * Math.abs(Math.cos(la * 2.5)));
      var lx = -8.2 + Math.cos(la) * lr, ly = -13.4 + Math.sin(la) * lr;
      if (q === 0) c.moveTo(lx, ly); else c.lineTo(lx, ly);
    }
    c.closePath(); c.fill();
    c.strokeStyle = '#efe2b4'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-4.4, -9.4); c.lineTo(-6.6, -13.6); c.stroke();
    c.beginPath(); c.moveTo(-4.4, -9.4); c.lineTo(-2.2, -13.4); c.stroke();
    c.strokeStyle = '#8a9a52'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(5.6, -9.4); c.lineTo(5.4, -6.2); c.stroke();
    c.beginPath(); c.moveTo(-1.2, -8.8); c.lineTo(-1.4, -3.6); c.stroke();

    function one(bx, by, rx, ry) {
      c.fillStyle = GG.shade(a.skin2, -0.32); ell(c, bx, by, rx * 1.1, ry * 1.1);
      c.fillStyle = a.skin2; ell(c, bx, by, rx, ry);
      c.fillStyle = a.skin; ell(c, bx, by, rx * 0.86, ry * 0.86);
      c.fillStyle = GG.shade(a.skin, 0.38);
      ell(c, bx - rx * 0.06, by + ry * 0.14, rx * 0.58, ry * 0.56);
      c.strokeStyle = 'rgba(104,132,44,0.55)'; c.lineWidth = 0.55;
      for (var v = -2; v <= 2; v++) {
        c.beginPath();
        c.moveTo(bx + v * rx * 0.13, by - ry * 0.9);
        c.quadraticCurveTo(bx + v * rx * 0.55, by, bx + v * rx * 0.15, by + ry * 0.9);
        c.stroke();
      }
      c.fillStyle = 'rgba(126,140,54,0.6)';
      ell(c, bx - rx * 0.24, by + ry * 0.1, rx * 0.13, ry * 0.17, 0.4);
      ell(c, bx + rx * 0.2, by - ry * 0.06, rx * 0.12, ry * 0.16, -0.3);
      /* the little dried tuft on the bottom end */
      c.strokeStyle = '#9a8f66'; c.lineWidth = 0.6;
      for (var k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(bx + k * 0.5, by + ry * 0.92);
        c.lineTo(bx + k * 1.6, by + ry * 1.34);
        c.stroke();
      }
      c.fillStyle = 'rgba(255,255,255,0.5)';
      ell(c, bx - rx * 0.38, by - ry * 0.42, rx * 0.24, ry * 0.28, -0.5);
    }
    one(5.4, -2.6, 3.5, 3.3);
    one(-1.4, 3.6, 6.4, 6.1);
  };

  /* A strawberry, hanging just off the ground on a short drooping stem:
     the green frilly collar on top, and the achenes freckled all over it. */
  F.straw = function (c, a, t) {
    var sway = Math.sin(t * 1.2) * 0.6;
    c.strokeStyle = '#7a9a4a'; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-5.4, -12.8);
    c.quadraticCurveTo(-1.6 + sway, -11.2, 0.2 + sway * 0.4, -7.2);
    c.stroke();
    c.save();
    c.translate(sway * 0.3, 0);
    c.fillStyle = a.skin2;
    c.beginPath();
    c.moveTo(0, -7.2);
    c.bezierCurveTo(-8.2, -8.6, -8.6, 2.4, 0, 11);
    c.bezierCurveTo(8.6, 2.4, 8.2, -8.6, 0, -7.2);
    c.closePath(); c.fill();
    c.save(); c.clip();
    c.fillStyle = a.skin; ell(c, -0.6, 0, 7.2, 9.4);
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -3.4, -2.4, 1.9, 3.2, -0.4);
    /* the specks: achenes, the true fruits, about two hundred of them */
    c.fillStyle = '#f4dc84';
    for (var row = 0; row < 7; row++) {
      for (var i = 0; i < 4; i++) {
        var yy = -6.2 + row * 2.6;
        var xx = -5.6 + i * 3.6 + (row % 2 ? 1.8 : 0);
        ell(c, xx, yy, 0.62, 0.8, 0.2);
      }
    }
    c.restore();
    /* the green frilly calyx */
    for (var k = 0; k < 7; k++) {
      leafAt(c, 0, -7.2, 1.95, a.leaf, -Math.PI + 0.26 + k * (Math.PI - 0.52) / 6);
    }
    c.fillStyle = GG.shade(a.leaf, 0.2);
    ell(c, 0, -7.4, 1.5, 1.5);
    c.restore();
  };

  /* Bittersweet nightshade: a climber, with green, orange and red berries all
     on one bunch, and the purple star flower with its yellow beak. */
  F.nightshade = function (c, a, t) {
    var sway = Math.sin(t * 1.25) * 0.8;
    c.strokeStyle = '#6a7a4a'; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-9.4, -13);
    c.quadraticCurveTo(-3, -11.6, -1.4 + sway * 0.3, -6.4);
    c.stroke();
    var fx = -7.8, fy = -10.4;
    c.fillStyle = '#7c4fbe';
    for (var k = 0; k < 5; k++) {
      var ang = -Math.PI / 2 + k / 5 * Math.PI * 2;
      c.beginPath();
      c.moveTo(fx, fy);
      c.lineTo(fx + Math.cos(ang - 0.34) * 3.5, fy + Math.sin(ang - 0.34) * 3.5);
      c.lineTo(fx + Math.cos(ang) * 5.4, fy + Math.sin(ang) * 5.4);
      c.lineTo(fx + Math.cos(ang + 0.34) * 3.5, fy + Math.sin(ang + 0.34) * 3.5);
      c.closePath(); c.fill();
    }
    c.fillStyle = '#f2c62e'; ell(c, fx + 0.6, fy + 0.9, 1.5, 2.4, 0.3);
    var mix = ['#d81f28', '#e2892a', '#7fae46', '#d81f28', '#8fbb4e', '#e08a2c', '#c41a24'];
    var spots = [[-3.2, -1.8, 2.6], [1.6, -2.4, 2.4], [4.4, 1.4, 2.5], [-1.4, 3.2, 2.7],
      [3.2, 5.8, 2.4], [-4.4, 5.4, 2.3], [0.6, 8.6, 2.3]];
    spots.forEach(function (p, i) {
      var col = mix[i % mix.length];
      c.strokeStyle = '#6a7a4a'; c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(-1.4 + sway * 0.3, -6.4);
      c.lineTo(p[0], p[1] - p[2] * 0.9);
      c.stroke();
      c.fillStyle = GG.shade(col, -0.32); ell(c, p[0], p[1], p[2] * 0.94, p[2] * 1.16);
      c.fillStyle = col; ell(c, p[0] - 0.25, p[1] - 0.32, p[2] * 0.76, p[2] * 0.96);
      c.fillStyle = 'rgba(255,255,255,0.55)';
      ell(c, p[0] - p[2] * 0.34, p[1] - p[2] * 0.5, p[2] * 0.24, p[2] * 0.3, -0.5);
    });
  };

  /* ---------- v1.18: orchard, vine, vegetable patch and wild berries ---------- */

  /* a peach or an apricot: round, a soft fuzzy blush, and the cleft line
     (the suture) running from the stem down one side. `small` shrinks it. */
  F.peach = function (c, a, t) {
    if (a.small) { c.save(); c.scale(0.86, 0.86); }
    stem(c, 0, -6.6, 3.4, '#6a4a2a', 0.3);
    /* peach leaves are long and thin */
    leafAt(c, 0.6, -9, 3.4, a.leaf, -0.35);
    c.beginPath();
    c.moveTo(0, -6.6);
    c.bezierCurveTo(-4.4, -9.4, -9.2, -6.2, -9, 0.6);
    c.bezierCurveTo(-8.8, 6.8, -4.2, 9.6, 0, 9.6);
    c.bezierCurveTo(4.6, 9.6, 9.2, 6.4, 9, 0.2);
    c.bezierCurveTo(8.8, -6.4, 3.8, -9.2, 0, -6.6);
    c.closePath();
    c.fillStyle = a.skin; c.fill();
    c.save(); c.clip();
    var g = c.createRadialGradient(4.2, -1.4, 0, 4.2, -1.4, 10.5);
    g.addColorStop(0, rgba(a.skin2, 0.95));
    g.addColorStop(0.5, rgba(a.skin2, 0.6));
    g.addColorStop(1, rgba(a.skin2, 0));
    c.fillStyle = g; c.fillRect(-10, -10, 20, 20);
    c.fillStyle = 'rgba(80,30,10,0.12)'; ell(c, 1.4, 5.4, 9, 5.4);
    /* the fuzz: a soft pale halo all round the edge */
    c.strokeStyle = 'rgba(255,236,214,0.5)'; c.lineWidth = 1.4; c.stroke();
    c.restore();
    /* the cleft */
    c.strokeStyle = rgba(a.skin2, 0.9); c.lineWidth = 0.9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0.2, -6.2); c.bezierCurveTo(5.4, -3, 5.6, 3.6, 2.4, 9.2); c.stroke();
    c.strokeStyle = 'rgba(255,232,200,0.45)'; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-0.6, -5.8); c.bezierCurveTo(4.2, -2.8, 4.4, 3.4, 1.4, 8.8); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.26)';
    ell(c, -4, -2.4, 2.4, 3.2, -0.4);
    c.fillStyle = GG.shade(a.skin2, -0.35); ell(c, 0, -6.4, 0.9, 0.7);
    if (a.small) c.restore();
  };

  /* a prune plum: an egg, deep purple, with the pale dusty bloom on it */
  F.plum = function (c, a, t) {
    stem(c, 0, -8.4, 3.8, '#6a4a2a', 0.5);
    leafAt(c, 0.6, -11.4, 3, a.leaf, -0.4);
    c.fillStyle = a.skin2; ell(c, 0, 1, 7, 9.6, 0.12);
    c.fillStyle = a.skin; ell(c, -0.7, 0.4, 5.9, 8.6, 0.12);
    /* the bloom: a dusty blue-white haze */
    c.fillStyle = 'rgba(196,196,228,0.30)'; ell(c, -1.4, -0.4, 5, 7.6, 0.12);
    c.fillStyle = 'rgba(210,210,236,0.22)';
    for (var i = 0; i < 7; i++) ell(c, -3.4 + (i * 2.3) % 6, -5 + (i * 3.7) % 11, 1.3, 0.9, 0.4);
    c.strokeStyle = rgba(a.skin2, 0.9); c.lineWidth = 0.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0.4, -8); c.bezierCurveTo(4.6, -4, 4.8, 5, 1.8, 10.2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.4)'; ell(c, -3, -3.6, 1.3, 2.6, -0.2);
  };

  /* a bunch of grapes hanging off the vine, with a curly tendril */
  F.grapes = function (c, a, t) {
    var sway = Math.sin(t * 1.2) * 0.5;
    c.strokeStyle = '#6a5a3a'; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1, -13); c.quadraticCurveTo(0, -11, 0, -8.4); c.stroke();
    /* the curly tendril */
    c.strokeStyle = '#8aa04a'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-0.4, -11.4);
    c.bezierCurveTo(-4, -12.6, -7, -11.4, -7, -9);
    c.bezierCurveTo(-7, -7.4, -5, -7.2, -4.8, -8.6);
    c.bezierCurveTo(-4.6, -9.6, -6, -9.8, -6, -8.8);
    c.stroke();
    /* a lobed grape leaf */
    c.fillStyle = a.leaf;
    c.beginPath();
    for (var q = 0; q <= 30; q++) {
      var la = (q / 30) * Math.PI * 2;
      var lr = 3.5 * (0.7 + 0.3 * Math.abs(Math.cos(la * 2.5)));
      var lx = 4.6 + Math.cos(la) * lr, ly = -11.2 + Math.sin(la) * lr;
      if (q === 0) c.moveTo(lx, ly); else c.lineTo(lx, ly);
    }
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(a.leaf, -0.25); c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(4.6, -11.2); c.lineTo(4.6, -14.2);
    c.moveTo(4.6, -11.2); c.lineTo(7.4, -12); c.moveTo(4.6, -11.2); c.lineTo(2, -12.4); c.stroke();
    var rows = [[-6.4, 4], [-2.4, 4], [1.4, 3], [5, 3], [8.4, 2], [11.4, 1]];
    var r = 2.35;
    rows.forEach(function (row, ri) {
      var n = row[1], w = (n - 1) * r * 1.72;
      for (var i = 0; i < n; i++) {
        var gx = -w / 2 + i * r * 1.72 + (ri % 2 ? 0.5 : -0.3) + sway * ri * 0.3;
        var gy = row[0];
        c.fillStyle = a.skin2; ell(c, gx, gy, r, r * 1.04);
        c.fillStyle = a.skin; ell(c, gx - 0.25, gy - 0.3, r * 0.8, r * 0.82);
        c.fillStyle = 'rgba(190,190,232,0.34)'; ell(c, gx - 0.3, gy - 0.1, r * 0.66, r * 0.6);
        c.fillStyle = 'rgba(255,255,255,0.5)';
        ell(c, gx - r * 0.36, gy - r * 0.4, r * 0.2, r * 0.26, -0.5);
      }
    });
  };

  /* a carrot, just pulled: the root points down, the feathery top above */
  F.carrot = function (c, a, t) {
    var sway = Math.sin(t * 1.5) * 0.5;
    /* the feathery fronds */
    c.strokeStyle = a.leaf; c.lineCap = 'round';
    [[-5.4, -13], [-2, -14], [1.8, -14], [5.2, -12.6], [0, -13.6]].forEach(function (p, i) {
      var tx = p[0] + sway, ty = p[1];
      c.lineWidth = 0.9; c.strokeStyle = GG.shade(a.leaf, -0.12);
      c.beginPath(); c.moveTo(0, -4.6); c.quadraticCurveTo(p[0] * 0.3, -9, tx, ty); c.stroke();
      c.fillStyle = a.leaf;
      for (var k = 1; k <= 3; k++) {
        var f = 0.35 + k * 0.2;
        var fx = tx * f, fy = -4.6 + (ty + 4.6) * f;
        ell(c, fx - 1.1, fy + 0.2, 1.3, 0.55, 0.5);
        ell(c, fx + 1.1, fy + 0.2, 1.3, 0.55, -0.5);
      }
      ell(c, tx, ty, 0.9, 1.3);
    });
    /* the root */
    c.beginPath();
    c.moveTo(-4.8, -4.4);
    c.bezierCurveTo(-5.2, 1, -2, 7, 0.2, 12.8);
    c.bezierCurveTo(2, 7, 5.2, 1, 4.8, -4.4);
    c.quadraticCurveTo(0, -6.4, -4.8, -4.4);
    c.closePath();
    c.fillStyle = a.skin; c.fill();
    c.save(); c.clip();
    c.fillStyle = a.skin2; ell(c, 4.4, 2, 2.6, 12);
    c.fillStyle = 'rgba(255,230,190,0.35)'; ell(c, -2.4, 0, 1.2, 7);
    c.restore();
    /* the rings */
    c.strokeStyle = GG.shade(a.skin2, -0.2); c.lineWidth = 0.6;
    [[-2.2, -1.6, 4.4], [0.6, 1.8, 4], [3.2, -1.4, 3.4], [5.8, 1.2, 2.8], [8.4, -0.6, 1.8]]
      .forEach(function (rg) {
        var hw = rg[2] * 0.5;
        c.beginPath(); c.moveTo(rg[1] - hw, rg[0]); c.quadraticCurveTo(rg[1], rg[0] + 0.7, rg[1] + hw, rg[0]); c.stroke();
      });
    c.fillStyle = GG.shade(a.leaf, -0.2); ell(c, 0, -5, 2.4, 0.9);
  };

  /* a radish: a round red root, a thin white tail, a leafy top */
  F.radish = function (c, a, t) {
    var sway = Math.sin(t * 1.5) * 0.5;
    [[-4.8, -13, -0.5], [0.4, -14, 0], [5, -12.6, 0.5]].forEach(function (p) {
      c.strokeStyle = GG.shade(a.skin, -0.15); c.lineWidth = 0.8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -3.6); c.lineTo(p[0] * 0.5 + sway, -8); c.stroke();
      c.save(); c.translate(p[0] * 0.5 + sway, -8); c.rotate(p[2] - Math.PI / 2);
      c.fillStyle = a.leaf;
      c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(2, -3.4, 7, -3.2, 6.8, 0);
      c.bezierCurveTo(7, 3.2, 2, 3.4, 0, 0); c.fill();
      c.strokeStyle = GG.shade(a.leaf, -0.25); c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(6, 0); c.stroke();
      c.restore();
    });
    /* the white tail */
    c.strokeStyle = a.skin2; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 7); c.quadraticCurveTo(0.2, 10.6, 1.6, 13.4); c.stroke();
    c.beginPath();
    c.moveTo(0, -3.8);
    c.bezierCurveTo(-8.4, -4.6, -8.2, 5.4, 0, 8.4);
    c.bezierCurveTo(8.2, 5.4, 8.4, -4.6, 0, -3.8);
    c.closePath();
    c.fillStyle = a.skin; c.fill();
    c.save(); c.clip();
    c.fillStyle = GG.shade(a.skin, -0.2); ell(c, 2.6, 2.6, 5, 5);
    c.fillStyle = a.skin; ell(c, 0.6, 0.6, 5.2, 5);
    /* the white bottom */
    c.fillStyle = a.skin2; ell(c, 0, 8.4, 3.2, 2.4);
    c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -3, -0.8, 1.5, 2.1, -0.4);
    c.restore();
  };

  /* a potato: lumpy, tan, a few eyes, no stem */
  F.potato = function (c, a, t) {
    function lump(k, dx, dy) {
      c.beginPath();
      for (var q = 0; q <= 36; q++) {
        var ang = q / 36 * Math.PI * 2;
        var rr = 1 + 0.06 * Math.sin(ang * 3 + 0.6) + 0.04 * Math.sin(ang * 5 + 2);
        var px = dx + Math.cos(ang) * 10.4 * k * rr, py = dy + Math.sin(ang) * 7.2 * k * rr;
        if (q === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath();
    }
    c.save(); c.rotate(-0.22);
    lump(1, 0, 0.6); c.fillStyle = a.skin2; c.fill();
    c.save(); c.clip();
    lump(0.9, -0.8, -0.3); c.fillStyle = a.skin; c.fill();
    c.fillStyle = rgba(a.skin2, 0.5);
    for (var i = 0; i < 14; i++) ell(c, -8 + (i * 5.3) % 16, -5 + (i * 3.9) % 10, 0.45, 0.35);
    c.fillStyle = 'rgba(255,248,226,0.35)'; ell(c, -4, -2.6, 3.4, 1.8, -0.1);
    c.restore();
    /* the eyes */
    [[-5.6, 1.6], [2.4, -3.4], [5.4, 2.6], [-1, 4]].forEach(function (e) {
      c.fillStyle = GG.shade(a.skin2, -0.45); ell(c, e[0], e[1], 0.9, 0.5, 0.3);
      c.strokeStyle = GG.shade(a.skin2, -0.25); c.lineWidth = 0.45;
      c.beginPath(); c.arc(e[0], e[1] + 0.2, 1.4, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    });
    c.restore();
  };

  /* an onion: round papery bulb, dry roots underneath, a short green neck */
  F.onion = function (c, a, t) {
    var sway = Math.sin(t * 1.4) * 0.5;
    c.strokeStyle = GG.shade(a.leaf, -0.1); c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.3, -6); c.quadraticCurveTo(-1.4, -10, -3 + sway, -13.6); c.stroke();
    c.strokeStyle = a.leaf;
    c.beginPath(); c.moveTo(0.3, -6); c.quadraticCurveTo(1.6, -10.4, 3.6 + sway, -13); c.stroke();
    /* the dry roots */
    c.strokeStyle = '#b89a6a'; c.lineWidth = 0.55;
    for (var k = -3; k <= 3; k++) {
      c.beginPath(); c.moveTo(k * 0.6, 8.6);
      c.quadraticCurveTo(k * 1.2, 10.6, k * 1.6 + (k % 2) * 0.6, 12.6); c.stroke();
    }
    c.beginPath();
    c.moveTo(0, -7.4);
    c.bezierCurveTo(1.2, -5, 9.8, -5.2, 9.6, 1.6);
    c.bezierCurveTo(9.4, 7.6, 4, 9.6, 0, 9.6);
    c.bezierCurveTo(-4, 9.6, -9.4, 7.6, -9.6, 1.6);
    c.bezierCurveTo(-9.8, -5.2, -1.2, -5, 0, -7.4);
    c.closePath();
    c.fillStyle = a.skin2; c.fill();
    c.save(); c.clip();
    c.fillStyle = a.skin; ell(c, -1, 1.4, 8.2, 7.4);
    /* the papery lines of the skin */
    c.strokeStyle = rgba(a.skin2, 0.75); c.lineWidth = 0.5;
    [-5.6, -2.8, 0, 2.8, 5.6].forEach(function (x) {
      c.beginPath(); c.moveTo(0, -6.8);
      c.bezierCurveTo(x * 1.5, -3, x * 1.5, 5.6, x * 0.25, 9.6); c.stroke();
    });
    c.fillStyle = 'rgba(255,255,244,0.5)'; ell(c, -4.6, -0.4, 1.7, 3.4, 0.3);
    c.restore();
    c.fillStyle = GG.shade(a.skin2, -0.2); ell(c, 0, 8.8, 1.6, 0.6);
  };

  /* an ear of sweet corn: rows of kernels, the husk peeled partway back,
     and the silk tuft at the top */
  F.corn = function (c, a, t) {
    var sway = Math.sin(t * 1.3) * 0.5;
    /* the silk */
    c.strokeStyle = '#9a6a32'; c.lineWidth = 0.55; c.lineCap = 'round';
    for (var k = -3; k <= 3; k++) {
      c.beginPath(); c.moveTo(k * 0.4, -10.6);
      c.quadraticCurveTo(k * 1.2, -12.4, k * 1.4 + sway + (k % 2) * 0.8, -14);
      c.stroke();
    }
    c.strokeStyle = '#c8964a'; c.lineWidth = 0.45;
    for (var j = -2; j <= 2; j++) {
      c.beginPath(); c.moveTo(j * 0.5, -10.6);
      c.quadraticCurveTo(j * 1.4 - 0.6, -12, j * 1.8 + sway, -13.2); c.stroke();
    }
    /* the ear */
    c.beginPath();
    c.moveTo(0, -11);
    c.bezierCurveTo(3.6, -11, 4.8, -4, 4.6, 2);
    c.bezierCurveTo(4.4, 7, 3, 10, 0, 10);
    c.bezierCurveTo(-3, 10, -4.4, 7, -4.6, 2);
    c.bezierCurveTo(-4.8, -4, -3.6, -11, 0, -11);
    c.closePath();
    c.fillStyle = a.skin2; c.fill();
    c.save(); c.clip();
    for (var row = 0; row < 12; row++) {
      var ky = -10.2 + row * 1.85;
      for (var col = -3; col <= 3; col++) {
        var ang = col * 0.42, kx = Math.sin(ang) * 4.8, kw = Math.cos(ang) * 0.95;
        c.fillStyle = a.skin; ell(c, kx, ky, kw, 0.82);
        c.fillStyle = 'rgba(255,255,230,0.55)'; ell(c, kx - kw * 0.3, ky - 0.3, kw * 0.34, 0.26);
      }
    }
    c.fillStyle = 'rgba(150,100,20,0.22)'; ell(c, 3.6, 0, 2, 12);
    c.restore();
    /* the husk leaves, peeled back and flaring out at the bottom */
    function husk(side, spread, tipY, col) {
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(side * 0.8, 13.4);
      c.bezierCurveTo(side * (spread * 0.8), 12, side * (spread + 1.2), 4, side * spread, tipY);
      c.bezierCurveTo(side * (spread - 2.8), tipY + 3.6, side * 4, 7, 0, 12.6);
      c.closePath(); c.fill();
      c.strokeStyle = GG.shade(col, 0.28); c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(side * 0.8, 12.6);
      c.quadraticCurveTo(side * (spread * 0.9), 8, side * (spread - 0.3), tipY + 1.4); c.stroke();
    }
    husk(-1, 9.6, -3.4, GG.shade(a.leaf, -0.15));
    husk(1, 9.8, -4.2, GG.shade(a.leaf, -0.15));
    husk(-1, 7, 1.4, a.leaf);
    husk(1, 7.2, 0.8, a.leaf);
    c.fillStyle = GG.shade(a.leaf, -0.25);
    c.fillRect(-1, 12.2, 2, 1.6);
  };

  /* a sugar snap pea pod, the peas showing through as bumps */
  F.peapod = function (c, a, t) {
    var sway = Math.sin(t * 1.4) * 0.5;
    c.save(); c.rotate(0.35);
    /* the curly tendril and the stem */
    c.strokeStyle = GG.shade(a.leaf, -0.1); c.lineWidth = 0.9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-10.4, -2.4); c.quadraticCurveTo(-12.2, -5, -11 + sway, -7.4); c.stroke();
    c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-11.4, -5);
    c.bezierCurveTo(-8, -9, -4.6, -8, -5.6, -6);
    c.bezierCurveTo(-6.4, -4.8, -7.6, -6, -6.6, -6.8); c.stroke();
    /* the pod */
    c.beginPath();
    c.moveTo(-10.4, -1.6);
    c.bezierCurveTo(-5, -4.2, 5, -4.4, 11.8, -2.4);
    c.bezierCurveTo(9, 2.8, 2, 4.4, -4, 3.8);
    c.bezierCurveTo(-8, 3.4, -10.6, 1.4, -10.4, -1.6);
    c.closePath();
    c.fillStyle = a.skin2; c.fill();
    c.save(); c.clip();
    c.fillStyle = a.skin; ell(c, 0, -0.8, 11, 3.4, -0.05);
    /* the peas inside, rounder and paler */
    for (var i = 0; i < 5; i++) {
      var px = -6.4 + i * 3.5, py = -0.2 + Math.sin(i * 0.8) * 0.3 - (i === 4 ? 0.5 : 0);
      c.fillStyle = rgba(a.skin2, 0.55); ell(c, px + 0.3, py + 0.3, 1.8, 1.8);
      c.fillStyle = GG.shade(a.skin, 0.22); ell(c, px, py, 1.6, 1.6);
      c.fillStyle = 'rgba(255,255,255,0.42)'; ell(c, px - 0.6, py - 0.6, 0.55, 0.5);
    }
    c.restore();
    /* the seam */
    c.strokeStyle = GG.shade(a.skin2, -0.15); c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-10, -1.8); c.bezierCurveTo(-5, -4, 5, -4.2, 11.4, -2.4); c.stroke();
    /* the little calyx at the stem end */
    for (var k = 0; k < 4; k++) leafAt(c, -10.4, -1.6, 1.4, a.leaf, -0.9 + k * 0.6);
    c.fillStyle = GG.shade(a.leaf, -0.15); ell(c, -10.4, -1.6, 1, 1);
    c.restore();
  };

  /* a tomato: round, a bit squashed, with a green star on top */
  F.tomato = function (c, a, t) {
    c.fillStyle = a.skin2; ell(c, 0, 1.4, 9.4, 8);
    c.fillStyle = a.skin; ell(c, -0.7, 0.8, 8.4, 7.2);
    /* the soft lobes */
    c.strokeStyle = rgba(a.skin2, 0.5); c.lineWidth = 0.7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.6, -5.4); c.quadraticCurveTo(-5, -3.4, -5.4, 1); c.stroke();
    c.beginPath(); c.moveTo(1.6, -5.4); c.quadraticCurveTo(5, -3.4, 5.6, 1); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -4.2, -2, 1.9, 2.6, -0.6);
    c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, -4.6, -2.6, 0.6, 0.8, -0.6);
    /* the green star calyx */
    c.fillStyle = a.leaf;
    for (var k = 0; k < 6; k++) {
      var ang = k / 6 * Math.PI * 2 + 0.3;
      c.beginPath();
      c.moveTo(Math.cos(ang - 0.5) * 1.2, -6 + Math.sin(ang - 0.5) * 0.6);
      c.quadraticCurveTo(Math.cos(ang) * 3, -6 + Math.sin(ang) * 1.6 - 0.4,
        Math.cos(ang) * 5.4, -6 + Math.sin(ang) * 2.6 + 0.4);
      c.lineTo(Math.cos(ang + 0.5) * 1.2, -6 + Math.sin(ang + 0.5) * 0.6);
      c.closePath(); c.fill();
    }
    c.fillStyle = GG.shade(a.leaf, -0.15); ell(c, 0, -6, 1.4, 0.8);
    c.strokeStyle = GG.shade(a.leaf, -0.1); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(0.4, -8.2, 1.6, -9.4); c.stroke();
  };

  /* a zucchini: a long dark green cylinder with pale flecks */
  F.zucchini = function (c, a, t) {
    c.save(); c.rotate(0.5);
    /* the stem end */
    c.fillStyle = '#9ab86a';
    c.beginPath(); c.moveTo(-1.4, -10.6); c.lineTo(-1.1, -13.6); c.lineTo(1.1, -13.6); c.lineTo(1.4, -10.6); c.fill();
    c.fillStyle = '#c8d89a'; ell(c, 0, -13.6, 1.1, 0.5);
    c.beginPath();
    c.moveTo(-2.8, -10);
    c.quadraticCurveTo(0, -12, 2.8, -10);
    c.bezierCurveTo(3.6, -2, 4.8, 6, 3.6, 10.4);
    c.quadraticCurveTo(0, 13.8, -3.6, 10.4);
    c.bezierCurveTo(-4.8, 6, -3.6, -2, -2.8, -10);
    c.closePath();
    c.fillStyle = a.skin2; c.fill();
    c.save(); c.clip();
    c.fillStyle = a.skin; ell(c, -0.7, 0.6, 3.3, 13);
    /* pale flecks and faint stripes along it */
    c.fillStyle = 'rgba(220,236,170,0.55)';
    for (var i = 0; i < 26; i++) {
      var fx = -3 + (i * 1.37) % 6, fy = -9 + (i * 4.3) % 20;
      ell(c, fx, fy, 0.3, 0.7);
    }
    c.strokeStyle = rgba(a.skin2, 0.6); c.lineWidth = 0.5;
    [-1.6, 1.2].forEach(function (x) {
      c.beginPath(); c.moveTo(x * 0.7, -10); c.quadraticCurveTo(x * 1.4, 0, x, 11); c.stroke();
    });
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -2, -1, 0.8, 7);
    c.restore();
    c.fillStyle = GG.shade(a.skin2, -0.2); ell(c, 0, 11.6, 1, 0.6);
    c.restore();
  };

  /* a pumpkin: wide and ribbed, with a thick stem */
  F.pumpkin = function (c, a, t) {
    var dk = GG.shade(a.skin2, -0.15);
    /* ribs from the back to the front */
    [[-7.4, 4.8], [7.4, 4.8], [-4.4, 5.6], [4.4, 5.6], [0, 5.4]].forEach(function (rb, i) {
      c.fillStyle = dk; ell(c, rb[0], 2, rb[1] + 0.4, 8.2);
      c.fillStyle = i < 2 ? a.skin2 : a.skin;
      ell(c, rb[0] - (rb[0] ? 0.3 * Math.sign(rb[0]) : 0.3), 1.6, rb[1] - 0.4, 7.6);
    });
    c.fillStyle = 'rgba(255,236,190,0.35)';
    ell(c, -1.4, -1, 1.4, 4.4); ell(c, -5.6, 0, 1, 3.6);
    /* the dip where the stem goes in */
    c.fillStyle = dk; ell(c, 0, -5.8, 3.4, 1.2);
    /* the stem, and a curly tendril */
    c.fillStyle = '#6a7a3a';
    c.beginPath();
    c.moveTo(-1.8, -5.6); c.quadraticCurveTo(-1.8, -10, 0.6, -12.6);
    c.lineTo(3, -11.8); c.quadraticCurveTo(1.2, -9.4, 1.8, -5.6);
    c.closePath(); c.fill();
    c.fillStyle = '#8a8a4a'; ell(c, 1.8, -12.2, 1.4, 0.8, 0.4);
    c.strokeStyle = '#4f6a2a'; c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(-0.4, -6); c.quadraticCurveTo(-0.4, -9.6, 1.4, -12); c.stroke();
    c.strokeStyle = a.leaf; c.lineWidth = 0.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(1.4, -7.4);
    c.bezierCurveTo(4.6, -9.6, 7.6, -8, 6.6, -6.4);
    c.bezierCurveTo(5.8, -5.4, 4.8, -6.6, 5.6, -7.2); c.stroke();
    leafAt(c, -1.6, -8.6, 2.8, a.leaf, Math.PI + 0.35);
  };

  /* a watermelon: a big striped oval */
  F.melon = function (c, a, t) {
    c.save(); c.rotate(-0.12);
    c.beginPath(); c.ellipse(0, 1, 12, 8.4, 0, 0, Math.PI * 2);
    c.fillStyle = a.skin; c.fill();
    c.save(); c.clip();
    /* the stripes, running end to end and meeting at the ends */
    c.fillStyle = a.skin2; c.fillRect(-13, -9, 26, 20);
    c.fillStyle = a.skin;
    [-1.05, -0.36, 0.36, 1.05].forEach(function (v, k) {
      c.beginPath();
      for (var q = 0; q <= 24; q++) {
        var x = -12 + q, e = Math.sqrt(Math.max(0, 1 - (x / 12) * (x / 12)));
        var j = (q % 2 ? 0.45 : -0.1) + Math.sin(q * 1.7 + k) * 0.15;
        var y = 1 + (v * 8.4 - 1.7 - j) * e;
        if (q === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      for (var q2 = 24; q2 >= 0; q2--) {
        var x2 = -12 + q2, e2 = Math.sqrt(Math.max(0, 1 - (x2 / 12) * (x2 / 12)));
        var j2 = (q2 % 2 ? -0.1 : 0.45) + Math.sin(q2 * 1.3 + k * 2) * 0.15;
        c.lineTo(x2, 1 + (v * 8.4 + 1.7 + j2) * e2);
      }
      c.closePath(); c.fill();
    });
    c.fillStyle = 'rgba(10,40,10,0.22)'; ell(c, 2, 6, 12, 5);
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -4.6, -3.2, 4.4, 1.8, -0.1);
    c.restore();
    /* the stem nub and tendril */
    c.strokeStyle = '#6a7a3a'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-11.6, 0); c.lineTo(-13.4, -1.4); c.stroke();
    c.strokeStyle = a.leaf; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-12.8, -1);
    c.bezierCurveTo(-12, -5, -8.4, -6.4, -8.6, -4.4);
    c.bezierCurveTo(-8.8, -3.2, -10.2, -3.8, -9.8, -4.6); c.stroke();
    c.restore();
  };

  /* asparagus: three spears tied in a bunch, purple-tipped scales */
  F.spear = function (c, a, t) {
    [[-3.4, -0.14, -11.4], [3.4, 0.14, -11], [0, 0, -13.4]].forEach(function (sp) {
      c.save(); c.translate(sp[0], 7); c.rotate(sp[1]); c.translate(0, -7);
      var top = sp[2], w = 1.7;
      /* the stalk */
      c.fillStyle = GG.shade(a.skin, -0.3);
      c.fillRect(-w - 0.35, top + 3, w * 2 + 0.7, 12.6 - top - 3);
      c.fillStyle = a.skin; c.fillRect(-w, top + 3, w * 2, 12.6 - top - 3);
      c.fillStyle = GG.shade(a.skin, -0.14); c.fillRect(w * 0.2, top + 3, w * 0.8, 12.6 - top - 3);
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-w * 0.7, top + 5, w * 0.4, 12.6 - top - 7);
      /* the pale cut end */
      c.fillStyle = '#e8ecc8'; ell(c, 0, 12.6, w + 0.3, 0.6);
      /* the little scales up the stalk */
      [top + 7.6, top + 12, top + 16.4].forEach(function (y, k) {
        var sd = k % 2 ? 1 : -1;
        c.fillStyle = a.skin2;
        c.beginPath(); c.moveTo(sd * (w + 0.3), y + 0.4); c.quadraticCurveTo(sd * 0.5, y - 0.2, sd * 0.7, y - 1.8);
        c.quadraticCurveTo(sd * w * 0.9, y - 1.2, sd * (w + 0.3), y + 0.4); c.fill();
      });
      /* the tight tip, like a little closed bud of scales */
      c.fillStyle = GG.shade(a.skin, -0.25);
      c.beginPath();
      c.moveTo(-w - 0.4, top + 4.4);
      c.quadraticCurveTo(-w - 0.6, top + 0.6, 0, top - 0.6);
      c.quadraticCurveTo(w + 0.6, top + 0.6, w + 0.4, top + 4.4);
      c.closePath(); c.fill();
      c.fillStyle = a.skin2;
      c.beginPath();
      c.moveTo(-w - 0.1, top + 4);
      c.quadraticCurveTo(-w - 0.2, top + 0.8, 0, top - 0.2);
      c.quadraticCurveTo(w + 0.2, top + 0.8, w + 0.1, top + 4);
      c.closePath(); c.fill();
      c.fillStyle = GG.shade(a.skin, 0.1);
      c.beginPath(); c.moveTo(-w, top + 4.6); c.quadraticCurveTo(-0.6, top + 2, 0, top + 1.2);
      c.quadraticCurveTo(0.6, top + 2, w, top + 4.6); c.closePath(); c.fill();
      c.strokeStyle = GG.shade(a.skin2, -0.2); c.lineWidth = 0.4;
      c.beginPath(); c.moveTo(-0.9, top + 1.6); c.lineTo(0, top + 3); c.lineTo(0.9, top + 1.6); c.stroke();
      c.restore();
    });
    /* tied with a bit of string */
    c.fillStyle = '#c89a5a'; c.fillRect(-4.8, 6.4, 9.6, 1.5);
    c.strokeStyle = '#a07a3a'; c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(3.6, 7.2); c.quadraticCurveTo(6, 8.4, 5.4, 10.4); c.stroke();
  };

  /* Red baneberry: a short upright cluster of glossy red berries on thick
     red stalks, each with a black dot on its end. Every part is poisonous. */
  F.baneberry = function (c, a, t) {
    var stalk = GG.shade(a.skin, -0.18);
    /* the toothed leaf at the base */
    c.save(); c.translate(-1, 9.4); c.rotate(Math.PI + 0.5);
    c.fillStyle = a.leaf;
    c.beginPath(); c.moveTo(0, 0);
    for (var q = 0; q <= 8; q++) c.lineTo(q * 0.9, -2.2 * Math.sin(q / 8 * Math.PI) - (q % 2) * 0.6);
    for (var q2 = 8; q2 >= 0; q2--) c.lineTo(q2 * 0.9, 2.2 * Math.sin(q2 / 8 * Math.PI) + (q2 % 2) * 0.6);
    c.fill(); c.restore();
    c.save(); c.translate(1, 11); c.rotate(-0.45);
    c.fillStyle = GG.shade(a.leaf, -0.08);
    c.beginPath(); c.moveTo(0, 0);
    for (var q3 = 0; q3 <= 8; q3++) c.lineTo(q3 * 0.9, -2 * Math.sin(q3 / 8 * Math.PI) - (q3 % 2) * 0.6);
    for (var q4 = 8; q4 >= 0; q4--) c.lineTo(q4 * 0.9, 2 * Math.sin(q4 / 8 * Math.PI) + (q4 % 2) * 0.6);
    c.fill(); c.restore();
    /* the main stalk, standing up */
    c.strokeStyle = '#6a8a3a'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 13.4); c.lineTo(0, 5); c.stroke();
    c.strokeStyle = stalk; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, 5.4); c.lineTo(0, -6); c.stroke();
    var bs = [[-4.6, 3.4], [4.6, 2.2], [-5.4, -2], [5, -3.2], [-2.6, -7.4], [2.8, -8.6], [0, -12]];
    var hub = [[0, 4.6], [0, 3.4], [0, 1], [0, -0.6], [0, -4], [0, -5], [0, -6]];
    bs.forEach(function (p, i) {
      c.strokeStyle = stalk; c.lineWidth = 1.05;
      c.beginPath(); c.moveTo(hub[i][0], hub[i][1]); c.lineTo(p[0], p[1]); c.stroke();
    });
    bs.forEach(function (p) {
      var r = 2.5;
      c.fillStyle = GG.shade(a.skin, -0.35); ell(c, p[0], p[1], r, r * 1.06);
      c.fillStyle = a.skin; ell(c, p[0] - 0.3, p[1] - 0.3, r * 0.82, r * 0.86);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      ell(c, p[0] - r * 0.38, p[1] - r * 0.42, r * 0.24, r * 0.28, -0.5);
      /* the black eye on the tip of each berry */
      var ex = p[0] + Math.sign(p[0]) * r * 0.36, ey = p[1] - r * 0.3;
      c.fillStyle = a.skin2; ell(c, ex, ey, 0.62, 0.62);
    });
  };

  /* An elderberry spray: a flat-topped umbrella of tiny berries on
     branching stalks. `bloom` gives them the whitish dust of blue elder. */
  F.umbel = function (c, a, t) {
    var sway = Math.sin(t * 1.2) * 0.4;
    var stalkCol = a.stalk || '#7a5a4a';
    leafAt(c, 0, 10.4, 3.4, a.leaf, Math.PI + 0.45);
    leafAt(c, 0, 10.4, 3.4, a.leaf, -0.45);
    c.strokeStyle = stalkCol; c.lineCap = 'round';
    c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(0, 13.4); c.lineTo(sway, 4.4); c.stroke();
    /* rays spreading out to a flat top */
    var ends = [-9, -5, -1, 3.4, 8.4];
    c.lineWidth = 0.75;
    ends.forEach(function (ex) {
      c.beginPath(); c.moveTo(sway, 4.4);
      c.quadraticCurveTo(ex * 0.5 + sway, 0, ex + sway, -3.4 - (1 - Math.abs(ex) / 10) * 1.2); c.stroke();
    });
    /* the berries: a flat dome */
    var pts = [];
    for (var row = 0; row < 4; row++) {
      var y = -3.8 - row * 2.2;
      var hw = 10.6 - row * row * 0.9;
      var n = Math.round(hw / 1.25);
      for (var i = 0; i <= n; i++) {
        var x = -hw + (2 * hw) * i / n + (row % 2 ? 0.6 : 0);
        pts.push([x + sway, y + Math.abs(x) * 0.12 + ((i * 7 + row * 3) % 5) * 0.18]);
      }
    }
    c.lineWidth = 0.45;
    pts.forEach(function (p, k) {
      if (k % 3) return;
      c.beginPath(); c.moveTo(p[0] * 0.8, p[1] + 3); c.lineTo(p[0], p[1]); c.stroke();
    });
    pts.forEach(function (p) {
      var r = 1.36;
      c.fillStyle = a.skin2; ell(c, p[0], p[1], r, r);
      c.fillStyle = a.skin; ell(c, p[0] - 0.18, p[1] - 0.2, r * 0.76, r * 0.76);
      if (a.bloom) {
        c.fillStyle = 'rgba(224,230,240,0.55)'; ell(c, p[0] - 0.1, p[1] - 0.15, r * 0.6, r * 0.56);
      } else {
        c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, p[0] - r * 0.34, p[1] - r * 0.38, r * 0.26, r * 0.28);
      }
    });
  };

  /* A prickly pear fruit (a "tuna"): a magenta barrel with a dimpled top,
     sitting on the edge of its pad, dotted with tufts of tiny spines. */
  F.tuna = function (c, a, t) {
    /* the edge of the pad it grows on */
    c.fillStyle = a.leaf; ell(c, 0, 14.4, 11.4, 4.2);
    c.fillStyle = GG.shade(a.leaf, 0.2); ell(c, -2, 13.2, 6, 1.6);
    c.fillStyle = '#e8dca8';
    for (var p = 0; p < 4; p++) ell(c, -7 + p * 4.6, 13.2 + (p % 2) * 1.2, 0.5, 0.5);
    c.beginPath();
    c.moveTo(-5.4, -8.4);
    c.quadraticCurveTo(0, -6.6, 5.4, -8.4);
    c.bezierCurveTo(8.6, -6, 7.8, 5, 3.2, 10.4);
    c.quadraticCurveTo(0, 12, -3.2, 10.4);
    c.bezierCurveTo(-7.8, 5, -8.6, -6, -5.4, -8.4);
    c.closePath();
    c.fillStyle = a.skin2; c.fill();
    c.save(); c.clip();
    c.fillStyle = a.skin; ell(c, -0.8, 0.2, 6.6, 10.4);
    c.fillStyle = 'rgba(255,200,230,0.35)'; ell(c, -3.4, -1.6, 1.6, 4.6, 0.1);
    c.restore();
    /* the dimpled top */
    c.fillStyle = GG.shade(a.skin2, -0.2); ell(c, 0, -8, 5, 1.6);
    c.fillStyle = GG.shade(a.skin2, 0.15); ell(c, 0, -7.6, 3.2, 0.9);
    c.fillStyle = GG.shade(a.skin2, -0.4); ell(c, 0, -7.5, 1.6, 0.5);
    /* the areoles, in a diamond pattern, each a tuft of glochids */
    for (var r = 0; r < 5; r++) {
      for (var k = -2; k <= 2; k++) {
        var gx = k * 2.9 + (r % 2 ? 1.45 : 0), gy = -5 + r * 3.4;
        if (Math.abs(gx) > 6.4 - (r === 4 ? 2.2 : 0) || (r === 4 && Math.abs(gx) > 2.4)) continue;
        c.fillStyle = GG.shade(a.skin2, -0.3); ell(c, gx, gy, 0.7, 0.7);
        c.fillStyle = '#f0e0a0';
        ell(c, gx - 0.3, gy - 0.25, 0.28, 0.28); ell(c, gx + 0.32, gy - 0.1, 0.26, 0.26);
        ell(c, gx, gy + 0.32, 0.26, 0.26);
      }
    }
    c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, -4, -3, 0.9, 2.2, 0.1);
  };

  /* ---------- the tiny versions, for the world ----------
     Each one is drawn around the origin (blob() has already translated),
     `s` is about half the fruit's size in pixels. Other files add their own. */
  var B = {};

  B.spike = function (c, def, s) {
    for (var i = 0; i < 5; i++) {
      c.fillStyle = i % 2 ? def.skin2 : def.skin;
      ell(c, (i % 2 ? 1 : -1) * s * 0.5, -s + i * s * 0.9, s * 0.55, s * 0.55);
    }
  };
  B.berry = function (c, def, s) {
    [[-s * 0.8, 0], [s * 0.8, s * 0.2], [0, s]].forEach(function (p) {
      c.fillStyle = def.skin2; ell(c, p[0], p[1], s * 0.62, s * 0.62);
      c.fillStyle = def.skin; ell(c, p[0] - s * 0.1, p[1] - s * 0.12, s * 0.5, s * 0.5);
    });
  };
  B.bramble = function (c, def, s) {
    c.fillStyle = GG.shade(def.skin2, -0.25);
    ell(c, 0, 0, s * 0.78, s * 0.95);
    [[-0.42, -0.5], [0.42, -0.5], [-0.42, 0.22], [0.42, 0.22], [0, 0.82]].forEach(function (p) {
      c.fillStyle = def.skin2; ell(c, p[0] * s, p[1] * s, s * 0.34, s * 0.34);
      c.fillStyle = def.skin; ell(c, (p[0] - 0.08) * s, (p[1] - 0.1) * s, s * 0.24, s * 0.24);
    });
  };
  B.strig = function (c, def, s) {
    c.strokeStyle = '#8a9a52'; c.lineWidth = Math.max(0.5, s * 0.12);
    c.beginPath(); c.moveTo(0, -s); c.lineTo(0, s); c.stroke();
    for (var q = 0; q < 4; q++) {
      var qy = -s * 0.6 + q * s * 0.6, qx = (q % 2 ? 1 : -1) * s * 0.42;
      c.fillStyle = def.skin2; ell(c, qx, qy, s * 0.36, s * 0.36);
      c.fillStyle = def.skin; ell(c, qx - s * 0.08, qy - s * 0.09, s * 0.26, s * 0.26);
    }
  };
  B.goose = function (c, def, s) {
    c.fillStyle = GG.shade(def.skin2, -0.35); ell(c, 0, 0, s * 1.02, s * 0.98);
    c.fillStyle = def.skin2; ell(c, 0, 0, s * 0.92, s * 0.88);
    c.fillStyle = def.skin; ell(c, 0, 0, s * 0.76, s * 0.72);
    c.strokeStyle = 'rgba(104,132,44,0.6)'; c.lineWidth = Math.max(0.4, s * 0.1);
    c.beginPath(); c.moveTo(0, -s * 0.66); c.lineTo(0, s * 0.66); c.stroke();
  };
  B.straw = function (c, def, s) {
    c.fillStyle = def.skin;
    c.beginPath();
    c.moveTo(0, -s * 0.7);
    c.bezierCurveTo(-s * 0.95, -s * 0.85, -s, s * 0.2, 0, s * 1.1);
    c.bezierCurveTo(s, s * 0.2, s * 0.95, -s * 0.85, 0, -s * 0.7);
    c.closePath(); c.fill();
    c.fillStyle = def.leaf; ell(c, 0, -s * 0.74, s * 0.68, s * 0.3);
  };
  B.nightshade = function (c, def, s) {
    [['#d81f28', -0.5, -0.3], ['#e2892a', 0.5, -0.06], ['#7fae46', 0, 0.72]]
      .forEach(function (p) {
        c.fillStyle = GG.shade(p[0], -0.28); ell(c, p[1] * s, p[2] * s, s * 0.38, s * 0.46);
        c.fillStyle = p[0]; ell(c, (p[1] - 0.08) * s, (p[2] - 0.1) * s, s * 0.28, s * 0.35);
      });
  };
  B.cherry = function (c, def, s) {
    c.strokeStyle = '#7a9a4a'; c.lineWidth = Math.max(0.6, s * 0.14);
    c.beginPath(); c.moveTo(0, -s * 1.6); c.lineTo(-s * 0.6, 0); c.stroke();
    c.beginPath(); c.moveTo(0, -s * 1.6); c.lineTo(s * 0.7, s * 0.3); c.stroke();
    c.fillStyle = def.skin; ell(c, -s * 0.6, s * 0.5, s * 0.58, s * 0.58);
    c.fillStyle = def.skin; ell(c, s * 0.7, s * 0.8, s * 0.6, s * 0.6);
    if (def.blush) {
      /* a Rainier: yellow, with a red cheek on the sunny side */
      c.fillStyle = def.skin2;
      ell(c, -s * 0.4, s * 0.36, s * 0.34, s * 0.34);
      ell(c, s * 0.9, s * 0.62, s * 0.36, s * 0.36);
    }
  };
  B.pear = function (c, def, s) {
    c.fillStyle = def.skin;
    ell(c, 0, s * 0.4, s * 0.66, s * 0.9);
    ell(c, 0, -s * 0.5, s * 0.42, s * 0.5);
  };

  /* v1.18 blobs */
  B.peach = function (c, def, s) {
    c.fillStyle = def.skin; ell(c, 0, 0, s * 0.92, s * 0.9);
    c.fillStyle = def.skin2; ell(c, s * 0.34, -s * 0.06, s * 0.5, s * 0.6);
    c.strokeStyle = GG.shade(def.skin2, -0.3); c.lineWidth = Math.max(0.45, s * 0.1);
    c.beginPath(); c.moveTo(0, -s * 0.8); c.quadraticCurveTo(s * 0.55, 0, s * 0.2, s * 0.86); c.stroke();
  };
  B.plum = function (c, def, s) {
    c.fillStyle = def.skin2; ell(c, 0, 0, s * 0.74, s * 0.98, 0.12);
    c.fillStyle = def.skin; ell(c, -s * 0.08, -s * 0.06, s * 0.6, s * 0.84, 0.12);
    c.fillStyle = 'rgba(200,200,232,0.55)'; ell(c, -s * 0.28, -s * 0.34, s * 0.2, s * 0.3, -0.2);
  };
  B.grapes = function (c, def, s) {
    c.strokeStyle = '#6a5a3a'; c.lineWidth = Math.max(0.5, s * 0.12);
    c.beginPath(); c.moveTo(0, -s * 1.4); c.lineTo(0, -s * 0.8); c.stroke();
    [[-0.6, -0.55], [0, -0.55], [0.6, -0.55], [-0.3, 0], [0.3, 0], [0, 0.55]].forEach(function (p) {
      c.fillStyle = def.skin2; ell(c, p[0] * s, p[1] * s, s * 0.36, s * 0.36);
      c.fillStyle = def.skin; ell(c, (p[0] - 0.06) * s, (p[1] - 0.07) * s, s * 0.26, s * 0.26);
    });
    c.fillStyle = 'rgba(200,200,236,0.5)'; ell(c, -s * 0.2, -s * 0.2, s * 0.3, s * 0.2);
  };
  B.carrot = function (c, def, s) {
    c.strokeStyle = def.leaf; c.lineWidth = Math.max(0.6, s * 0.2); c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -s * 0.5); c.lineTo(-s * 0.5, -s * 1.3);
    c.moveTo(0, -s * 0.5); c.lineTo(s * 0.1, -s * 1.45);
    c.moveTo(0, -s * 0.5); c.lineTo(s * 0.6, -s * 1.25); c.stroke();
    c.fillStyle = def.skin;
    c.beginPath(); c.moveTo(-s * 0.5, -s * 0.5); c.lineTo(s * 0.5, -s * 0.5); c.lineTo(0, s * 1.3); c.closePath(); c.fill();
    c.fillStyle = def.skin2;
    c.beginPath(); c.moveTo(s * 0.15, -s * 0.5); c.lineTo(s * 0.5, -s * 0.5); c.lineTo(0, s * 1.3); c.closePath(); c.fill();
  };
  B.radish = function (c, def, s) {
    c.fillStyle = def.leaf;
    ell(c, -s * 0.36, -s * 1.1, s * 0.3, s * 0.52, -0.4); ell(c, s * 0.36, -s * 1.1, s * 0.3, s * 0.52, 0.4);
    c.strokeStyle = def.skin2; c.lineWidth = Math.max(0.5, s * 0.14); c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, s * 0.6); c.lineTo(s * 0.12, s * 1.3); c.stroke();
    c.fillStyle = def.skin; ell(c, 0, 0, s * 0.8, s * 0.74);
    c.fillStyle = def.skin2; ell(c, 0, s * 0.6, s * 0.3, s * 0.18);
  };
  B.potato = function (c, def, s) {
    c.fillStyle = def.skin2; ell(c, 0, s * 0.05, s * 1.04, s * 0.74, -0.2);
    c.fillStyle = def.skin; ell(c, -s * 0.08, -s * 0.04, s * 0.9, s * 0.62, -0.2);
    c.fillStyle = GG.shade(def.skin2, -0.4);
    ell(c, -s * 0.4, s * 0.12, s * 0.11, s * 0.08); ell(c, s * 0.34, -s * 0.2, s * 0.11, s * 0.08);
  };
  B.onion = function (c, def, s) {
    c.strokeStyle = def.leaf; c.lineWidth = Math.max(0.6, s * 0.2); c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -s * 0.6); c.lineTo(s * 0.1, -s * 1.4); c.stroke();
    c.fillStyle = def.skin2;
    c.beginPath(); c.moveTo(0, -s * 0.85);
    c.quadraticCurveTo(s * 1.1, -s * 0.2, s * 0.8, s * 0.5);
    c.quadraticCurveTo(0, s * 1.2, -s * 0.8, s * 0.5);
    c.quadraticCurveTo(-s * 1.1, -s * 0.2, 0, -s * 0.85); c.fill();
    c.fillStyle = def.skin; ell(c, -s * 0.1, s * 0.2, s * 0.62, s * 0.56);
  };
  B.corn = function (c, def, s) {
    c.fillStyle = def.skin; ell(c, 0, -s * 0.2, s * 0.44, s * 1.05);
    c.fillStyle = def.skin2; ell(c, s * 0.16, -s * 0.2, s * 0.2, s * 0.9);
    c.fillStyle = def.leaf;
    c.beginPath(); c.moveTo(0, s * 1.2); c.quadraticCurveTo(-s * 0.9, s * 0.4, -s * 0.8, -s * 0.4);
    c.quadraticCurveTo(-s * 0.3, s * 0.3, 0, s * 0.6); c.quadraticCurveTo(s * 0.3, s * 0.3, s * 0.8, -s * 0.4);
    c.quadraticCurveTo(s * 0.9, s * 0.4, 0, s * 1.2); c.fill();
  };
  B.peapod = function (c, def, s) {
    c.save(); c.rotate(0.5);
    c.fillStyle = GG.shade(def.skin2, -0.4); ell(c, 0, 0, s * 1.28, s * 0.52);
    c.fillStyle = def.skin2; ell(c, 0, 0, s * 1.2, s * 0.44);
    c.fillStyle = def.skin; ell(c, -s * 0.05, -s * 0.06, s * 1.04, s * 0.32);
    c.fillStyle = GG.shade(def.skin, 0.25);
    ell(c, -s * 0.5, 0, s * 0.2, s * 0.2); ell(c, 0, 0, s * 0.2, s * 0.2); ell(c, s * 0.5, 0, s * 0.2, s * 0.2);
    c.restore();
  };
  B.tomato = function (c, def, s) {
    c.fillStyle = def.skin2; ell(c, 0, s * 0.08, s * 0.98, s * 0.84);
    c.fillStyle = def.skin; ell(c, -s * 0.08, 0, s * 0.84, s * 0.72);
    c.fillStyle = def.leaf;
    ell(c, -s * 0.3, -s * 0.66, s * 0.36, s * 0.14, 0.3); ell(c, s * 0.3, -s * 0.66, s * 0.36, s * 0.14, -0.3);
    ell(c, 0, -s * 0.72, s * 0.14, s * 0.3);
  };
  B.zucchini = function (c, def, s) {
    c.save(); c.rotate(0.6);
    c.fillStyle = def.skin2; ell(c, 0, 0, s * 0.44, s * 1.3);
    c.fillStyle = def.skin; ell(c, -s * 0.08, 0, s * 0.3, s * 1.18);
    c.fillStyle = 'rgba(220,236,170,0.7)'; ell(c, -s * 0.12, -s * 0.2, s * 0.08, s * 0.6);
    c.fillStyle = '#9ab86a'; ell(c, 0, -s * 1.3, s * 0.16, s * 0.2);
    c.restore();
  };
  B.pumpkin = function (c, def, s) {
    c.fillStyle = def.skin2; ell(c, -s * 0.48, s * 0.1, s * 0.62, s * 0.78); ell(c, s * 0.48, s * 0.1, s * 0.62, s * 0.78);
    c.fillStyle = def.skin; ell(c, 0, s * 0.08, s * 0.56, s * 0.8);
    c.fillStyle = '#6a7a3a'; c.fillRect(-s * 0.12, -s * 1.08, s * 0.26, s * 0.5);
  };
  B.melon = function (c, def, s) {
    c.fillStyle = def.skin; ell(c, 0, 0, s * 1.24, s * 0.86, -0.12);
    c.strokeStyle = def.skin2; c.lineWidth = Math.max(0.5, s * 0.18);
    c.save(); c.rotate(-0.12);
    [-0.4, 0, 0.4].forEach(function (y) {
      c.beginPath(); c.moveTo(-s * 1.0, y * s * 1.1); c.quadraticCurveTo(0, y * s * 1.7, s * 1.0, y * s * 1.1); c.stroke();
    });
    c.restore();
  };
  B.spear = function (c, def, s) {
    c.lineCap = 'round';
    [[-0.4, -0.1], [0.4, 0.1], [0, 0]].forEach(function (p, i) {
      var top = i === 2 ? -1.35 : -1.1;
      c.strokeStyle = GG.shade(def.skin, -0.45); c.lineWidth = Math.max(1.4, s * 0.44);
      c.beginPath(); c.moveTo(p[0] * s * 0.5, s * 1.2); c.lineTo(p[0] * s + p[1] * s, top * s); c.stroke();
      c.strokeStyle = def.skin; c.lineWidth = Math.max(0.8, s * 0.28);
      c.beginPath(); c.moveTo(p[0] * s * 0.5, s * 1.2); c.lineTo(p[0] * s + p[1] * s, top * s); c.stroke();
      c.fillStyle = def.skin2; ell(c, p[0] * s + p[1] * s, top * s, s * 0.2, s * 0.3);
    });
  };
  B.baneberry = function (c, def, s) {
    c.strokeStyle = GG.shade(def.skin, -0.2); c.lineWidth = Math.max(0.5, s * 0.14);
    c.beginPath(); c.moveTo(0, s * 1.3); c.lineTo(0, -s * 0.5); c.stroke();
    [[-0.5, 0.5], [0.5, 0.3], [-0.5, -0.3], [0.5, -0.5], [0, -1]].forEach(function (p) {
      c.fillStyle = GG.shade(def.skin, -0.3); ell(c, p[0] * s, p[1] * s, s * 0.34, s * 0.34);
      c.fillStyle = def.skin; ell(c, (p[0] - 0.05) * s, (p[1] - 0.05) * s, s * 0.26, s * 0.26);
      if (s >= 4) { c.fillStyle = def.skin2; ell(c, (p[0] + Math.sign(p[0]) * 0.1) * s, (p[1] - 0.08) * s, s * 0.08, s * 0.08); }
    });
  };
  B.umbel = function (c, def, s) {
    c.strokeStyle = def.stalk || '#7a5a4a'; c.lineWidth = Math.max(0.5, s * 0.12);
    c.beginPath(); c.moveTo(0, s * 1.2); c.lineTo(0, s * 0.3);
    c.moveTo(0, s * 0.3); c.lineTo(-s * 0.9, -s * 0.2); c.moveTo(0, s * 0.3); c.lineTo(s * 0.9, -s * 0.2); c.stroke();
    [[-1, -0.2], [-0.5, -0.3], [0, -0.3], [0.5, -0.3], [1, -0.2], [-0.72, -0.72], [-0.24, -0.8], [0.24, -0.8], [0.72, -0.72], [0, -1.2]]
      .forEach(function (p) {
        c.fillStyle = def.skin2; ell(c, p[0] * s, p[1] * s, s * 0.3, s * 0.3);
        c.fillStyle = def.bloom ? GG.shade(def.skin, 0.25) : def.skin;
        ell(c, (p[0] - 0.05) * s, (p[1] - 0.05) * s, s * 0.2, s * 0.2);
      });
  };
  B.tuna = function (c, def, s) {
    c.fillStyle = def.skin2; ell(c, 0, 0, s * 0.78, s * 1.04);
    c.fillStyle = def.skin; ell(c, -s * 0.08, 0, s * 0.64, s * 0.92);
    c.fillStyle = GG.shade(def.skin2, -0.25); ell(c, 0, -s * 0.9, s * 0.46, s * 0.16);
    c.fillStyle = '#f0e0a0';
    [[-0.3, -0.35], [0.3, -0.1], [-0.25, 0.35], [0.25, 0.6]].forEach(function (p) { ell(c, p[0] * s, p[1] * s, s * 0.08 + 0.2, s * 0.08 + 0.2); });
  };

  var FruitArt = GG.FruitArt = {
    shapes: F,

    /* one piece of fruit, centred on (x, y) */
    draw: function (c, def, x, y, scale, t) {
      var fn = F[def.shape] || F.apple;
      c.save();
      c.translate(x, y);
      var k = def.small ? 0.82 : 1;   /* an apricot is a smaller peach */
      c.scale(scale * k, scale * k);
      fn(c, def, t || 0);
      c.restore();
    },

    /* the crop hanging in a tree or a bush out in the garden.
       `n` is how many, `r` is the plant's radius, `ripe` 0..1 fades it in. */
    onPlant: function (c, def, cx, cy, r, n, seed, t, ripe) {
      if (ripe <= 0) return;
      var rnd = GG.mulberry32(Math.floor((seed || 0.5) * 9973) + 7);
      c.save();
      c.globalAlpha = Math.min(1, ripe);
      for (var i = 0; i < n; i++) {
        var ox = (rnd() - 0.5) * r * 1.5;
        var oy = (rnd() - 0.25) * r * 0.9;
        var s = (0.20 + rnd() * 0.07) * r * 0.55 * (ripe * 0.4 + 0.6);
        var bob = Math.sin(t * 1.1 + i * 1.7 + (seed || 0) * 9) * r * 0.02;
        FruitArt.blob(c, def, cx + ox, cy + oy + bob, s);
      }
      c.restore();
    },

    /* the tiny versions for the world, one per shape: FruitArt.blobs */
    blobs: B,

    /* a fast simplified fruit for the world, where it is only a few pixels.
       Looks up FruitArt.blobs[def.shape] (drawn around the origin), and falls
       back to a plain round fruit. */
    blob: function (c, def, x, y, s) {
      c.save();
      c.translate(x, y);
      var fn = B[def.shape];
      if (fn) {
        fn(c, def, s);
      } else {
        c.fillStyle = def.skin;
        ell(c, 0, 0, s * 0.92, s * 0.92);
        c.fillStyle = GG.shade(def.skin, -0.22);
        ell(c, s * 0.3, s * 0.28, s * 0.42, s * 0.46);
      }
      c.restore();
    }
  };
})(window.GG = window.GG || {});
