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
