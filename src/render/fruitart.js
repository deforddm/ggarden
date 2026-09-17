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
      c.fillStyle = a.skin2; ell(c, p[0], p[1], p[2], p[2] * 0.98);
      c.fillStyle = a.skin; ell(c, p[0] - 0.4, p[1] - 0.4, p[2] * 0.82, p[2] * 0.8);
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

  var FruitArt = GG.FruitArt = {
    shapes: F,

    /* one piece of fruit, centred on (x, y) */
    draw: function (c, def, x, y, scale, t) {
      var fn = F[def.shape] || F.apple;
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
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

    /* a fast simplified fruit for the world, where it is only a few pixels */
    blob: function (c, def, x, y, s) {
      c.save();
      c.translate(x, y);
      if (def.shape === 'spike') {
        for (var i = 0; i < 5; i++) {
          c.fillStyle = i % 2 ? def.skin2 : def.skin;
          ell(c, (i % 2 ? 1 : -1) * s * 0.5, -s + i * s * 0.9, s * 0.55, s * 0.55);
        }
      } else if (def.shape === 'berry') {
        [[-s * 0.8, 0], [s * 0.8, s * 0.2], [0, s]].forEach(function (p) {
          c.fillStyle = def.skin2; ell(c, p[0], p[1], s * 0.62, s * 0.62);
          c.fillStyle = def.skin; ell(c, p[0] - s * 0.1, p[1] - s * 0.12, s * 0.5, s * 0.5);
        });
      } else if (def.shape === 'bramble') {
        c.fillStyle = GG.shade(def.skin2, -0.25);
        ell(c, 0, 0, s * 0.78, s * 0.95);
        [[-0.42, -0.5], [0.42, -0.5], [-0.42, 0.22], [0.42, 0.22], [0, 0.82]].forEach(function (p) {
          c.fillStyle = def.skin2; ell(c, p[0] * s, p[1] * s, s * 0.34, s * 0.34);
          c.fillStyle = def.skin; ell(c, (p[0] - 0.08) * s, (p[1] - 0.1) * s, s * 0.24, s * 0.24);
        });
      } else if (def.shape === 'strig') {
        c.strokeStyle = '#8a9a52'; c.lineWidth = Math.max(0.5, s * 0.12);
        c.beginPath(); c.moveTo(0, -s); c.lineTo(0, s); c.stroke();
        for (var q = 0; q < 4; q++) {
          var qy = -s * 0.6 + q * s * 0.6, qx = (q % 2 ? 1 : -1) * s * 0.42;
          c.fillStyle = def.skin2; ell(c, qx, qy, s * 0.36, s * 0.36);
          c.fillStyle = def.skin; ell(c, qx - s * 0.08, qy - s * 0.09, s * 0.26, s * 0.26);
        }
      } else if (def.shape === 'goose') {
        c.fillStyle = GG.shade(def.skin2, -0.35); ell(c, 0, 0, s * 1.02, s * 0.98);
        c.fillStyle = def.skin2; ell(c, 0, 0, s * 0.92, s * 0.88);
        c.fillStyle = def.skin; ell(c, 0, 0, s * 0.76, s * 0.72);
        c.strokeStyle = 'rgba(104,132,44,0.6)'; c.lineWidth = Math.max(0.4, s * 0.1);
        c.beginPath(); c.moveTo(0, -s * 0.66); c.lineTo(0, s * 0.66); c.stroke();
      } else if (def.shape === 'straw') {
        c.fillStyle = def.skin;
        c.beginPath();
        c.moveTo(0, -s * 0.7);
        c.bezierCurveTo(-s * 0.95, -s * 0.85, -s, s * 0.2, 0, s * 1.1);
        c.bezierCurveTo(s, s * 0.2, s * 0.95, -s * 0.85, 0, -s * 0.7);
        c.closePath(); c.fill();
        c.fillStyle = def.leaf; ell(c, 0, -s * 0.74, s * 0.68, s * 0.3);
      } else if (def.shape === 'nightshade') {
        [['#d81f28', -0.5, -0.3], ['#e2892a', 0.5, -0.06], ['#7fae46', 0, 0.72]]
          .forEach(function (p) {
            c.fillStyle = GG.shade(p[0], -0.28); ell(c, p[1] * s, p[2] * s, s * 0.38, s * 0.46);
            c.fillStyle = p[0]; ell(c, (p[1] - 0.08) * s, (p[2] - 0.1) * s, s * 0.28, s * 0.35);
          });
      } else if (def.shape === 'cherry') {
        c.strokeStyle = '#7a9a4a'; c.lineWidth = Math.max(0.6, s * 0.14);
        c.beginPath(); c.moveTo(0, -s * 1.6); c.lineTo(-s * 0.6, 0); c.stroke();
        c.beginPath(); c.moveTo(0, -s * 1.6); c.lineTo(s * 0.7, s * 0.3); c.stroke();
        c.fillStyle = def.skin; ell(c, -s * 0.6, s * 0.5, s * 0.58, s * 0.58);
        c.fillStyle = def.skin; ell(c, s * 0.7, s * 0.8, s * 0.6, s * 0.6);
      } else if (def.shape === 'pear') {
        c.fillStyle = def.skin;
        ell(c, 0, s * 0.4, s * 0.66, s * 0.9);
        ell(c, 0, -s * 0.5, s * 0.42, s * 0.5);
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
