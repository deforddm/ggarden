/* The pickable plants out in the world, v1.18: a vegetable bed, a native wild
   berry shrub and a clump of flowers. Like the orchard props they read
   p.fruit (a GG.FRUIT_BY_ID id) and p.ripe (0..1): at 1 the crop is there to
   pick, below 1 it has been picked and is growing back. Drawn with the BASE
   at (x, y), growing upward, r is the size. */
(function (GG) {
  'use strict';

  var TAU = Math.PI * 2;
  var P = GG.Props = GG.Props || {};

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); c.fill();
  }
  function shadow(c, x, y, rx) {
    c.fillStyle = 'rgba(30,60,25,0.16)';
    ell(c, x, y, rx, rx * 0.38);
  }
  function sh(col, amt) {
    return (typeof col === 'string' && col.charAt(0) === '#' && col.length === 7) ? GG.shade(col, amt) : col;
  }
  function defOf(p) {
    return p && p.fruit && GG.FRUIT_BY_ID ? GG.FRUIT_BY_ID[p.fruit] : null;
  }
  function ripeOf(p) {
    return (p && p.ripe != null) ? Math.max(0, Math.min(1, p.ripe)) : 1;
  }
  function line(c, x1, y1, x2, y2) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }
  /* a simple pointed leaf from (x, y) along angle rot, `len` long */
  function leaf(c, x, y, len, w, col, rot) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.45, -w, len, 0);
    c.quadraticCurveTo(len * 0.45, w, 0, 0);
    c.closePath(); c.fill();
    c.restore();
  }
  /* a round leaf with `lobes` points (pumpkin, thimbleberry, melon) */
  function lobedLeaf(c, x, y, R, col, rot, lobes, depth, squash) {
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(1, squash || 0.62);
    c.fillStyle = col;
    c.beginPath();
    for (var k = 0; k <= 48; k++) {
      var a = k / 48 * TAU;
      var rr = R * (1 - depth + depth * Math.pow(Math.abs(Math.cos(a * lobes / 2)), 0.6));
      var px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.strokeStyle = sh(col, -0.2); c.lineWidth = Math.max(0.4, R * 0.06);
    for (k = 0; k < lobes; k++) {
      var b = k / lobes * TAU;
      line(c, 0, 0, Math.cos(b) * R * 0.75, Math.sin(b) * R * 0.75);
    }
    c.restore();
  }
  /* the crop drawn through the fruit art's small world blob */
  function blob(c, def, x, y, s) {
    var B = GG.FruitArt && GG.FruitArt.blobs && GG.FruitArt.blobs[def.shape];
    if (B) { c.save(); c.translate(x, y); B(c, def, s); c.restore(); }
    else if (GG.FruitArt) GG.FruitArt.blob(c, def, x, y, s);
  }
  function berry(c, def, x, y, s) {
    c.fillStyle = def.skin2; ell(c, x, y, s, s);
    c.fillStyle = def.skin; ell(c, x - s * 0.12, y - s * 0.14, s * 0.8, s * 0.8);
    c.fillStyle = 'rgba(255,255,255,0.5)';
    ell(c, x - s * 0.35, y - s * 0.4, s * 0.26, s * 0.3, -0.5);
  }

  /* =====================================================================
     VEGETABLE PATCH
     ===================================================================== */
  function vegGroup(def) {
    var s = def ? def.shape : '';
    if (/carrot|radish|onion|potato|beet|turnip|parsnip|garlic|leek/.test(s)) return 'root';
    if (/spear|asparagus/.test(s)) return 'spear';
    if (/corn/.test(s)) return 'corn';
    if (/^pea|peapod|bean/.test(s)) return 'pea';
    if (/tomato|pepper/.test(s)) return 'tomato';
    if (/pumpkin|melon|zucchini|squash|cucumber|gourd/.test(s)) return 'sprawl';
    if (/spear|asparagus/.test(s)) return 'spear';
    return 'root';
  }

  function soilBed(c, x, y, r) {
    shadow(c, x + 1, y + r * 0.04, r * 1.02);
    c.fillStyle = '#56392a';
    ell(c, x, y - r * 0.1, r * 1.0, r * 0.3);
    c.fillStyle = '#6d4a33';
    ell(c, x, y - r * 0.15, r * 0.92, r * 0.23);
    c.strokeStyle = '#4c3223'; c.lineWidth = Math.max(0.8, r * 0.045); c.lineCap = 'round';
    for (var k = -1; k <= 1; k += 2) {
      c.beginPath();
      c.moveTo(x - r * 0.78, y - r * 0.15 + k * r * 0.07);
      c.quadraticCurveTo(x, y - r * 0.12 + k * r * 0.1, x + r * 0.78, y - r * 0.15 + k * r * 0.07);
      c.stroke();
    }
    c.fillStyle = '#80593e';
    [[-0.55, -0.2], [0.2, -0.26], [0.62, -0.12], [-0.2, -0.05]].forEach(function (q) {
      ell(c, x + q[0] * r, y + q[1] * r, r * 0.05, r * 0.03);
    });
  }
  /* the top of a root poking out of the dirt, with a little crumb of soil at its foot */
  function shoulder(c, x, y, rx, ry, skin, skin2, rings) {
    c.save();
    c.beginPath(); c.rect(x - rx * 2, y - ry * 3, rx * 4, ry * 3); c.clip();
    c.fillStyle = skin2; ell(c, x, y, rx, ry);
    c.fillStyle = skin; ell(c, x - rx * 0.12, y - ry * 0.08, rx * 0.84, ry * 0.9);
    if (rings) {
      c.strokeStyle = sh(skin2, -0.15); c.lineWidth = Math.max(0.4, rx * 0.12);
      for (var k = 1; k <= rings; k++) {
        c.beginPath(); c.ellipse(x, y - ry * 0.1, rx * (1 - k * 0.12), ry * 0.3, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      }
    }
    c.fillStyle = 'rgba(255,255,255,0.35)';
    ell(c, x - rx * 0.4, y - ry * 0.5, rx * 0.22, ry * 0.24, -0.4);
    c.restore();
    c.fillStyle = '#5c3e2c';
    ell(c, x, y + ry * 0.05, rx * 1.25, ry * 0.3);
  }

  function rootRow(c, def, x, y, r, t, seed, ripe) {
    var shape = def.shape, leafC = def.leaf || '#4f9a3a';
    var g = ripe >= 1 ? 1 : 0.35 + 0.45 * ripe;
    var sway = Math.sin(t * 1.3 + seed * 7) * r * 0.03;
    var xs = shape === 'potato' ? [-0.42, 0.42] : [-0.52, 0, 0.52];
    xs.forEach(function (fx, i) {
      var px = x + fx * r, py = y - r * 0.15 + (i % 2 ? -r * 0.03 : 0);
      var sw = sway * (i % 2 ? -1 : 1);
      var k, a;
      if (shape === 'carrot' || shape === 'parsnip') {
        /* feathery fronds */
        c.strokeStyle = leafC; c.lineWidth = Math.max(0.6, r * 0.035); c.lineCap = 'round';
        for (k = -2; k <= 2; k++) {
          a = -Math.PI / 2 + k * 0.32;
          var L = r * 0.58 * g * (1 - Math.abs(k) * 0.1);
          var tx = px + Math.cos(a) * L + sw, ty = py + Math.sin(a) * L;
          line(c, px, py, tx, ty);
          c.fillStyle = k % 2 ? leafC : sh(leafC, 0.12);
          for (var q = 1; q <= 4; q++) {
            var f = q / 4.4;
            var qx = px + (tx - px) * f, qy = py + (ty - py) * f;
            ell(c, qx - r * 0.05, qy, r * 0.05, r * 0.025, -0.5);
            ell(c, qx + r * 0.05, qy, r * 0.05, r * 0.025, 0.5);
          }
        }
        if (ripe >= 1) shoulder(c, px, py + r * 0.03, r * 0.13, r * 0.13, def.skin, def.skin2, 2);
      } else if (shape === 'radish' || shape === 'beet' || shape === 'turnip') {
        /* a few broad rounded leaves */
        for (k = -1; k <= 1; k++) {
          c.strokeStyle = sh(leafC, -0.12); c.lineWidth = Math.max(0.6, r * 0.03);
          a = -Math.PI / 2 + k * 0.62;
          var lx = px + Math.cos(a) * r * 0.26 * g + sw, ly = py + Math.sin(a) * r * 0.26 * g;
          line(c, px, py, lx, ly);
          c.fillStyle = k ? leafC : sh(leafC, 0.1);
          ell(c, lx + Math.cos(a) * r * 0.1 * g, ly + Math.sin(a) * r * 0.1 * g, r * 0.14 * g, r * 0.09 * g, a);
        }
        if (ripe >= 1) {
          /* a radish sits high, so you see most of its red top */
          shoulder(c, px, py + r * 0.07, r * 0.14, r * 0.17, def.skin, sh(def.skin, -0.18), 0);
        }
      } else if (shape === 'onion' || shape === 'garlic' || shape === 'leek') {
        /* tall hollow blue-green tubes */
        c.strokeStyle = leafC; c.lineWidth = Math.max(0.8, r * 0.05); c.lineCap = 'round';
        for (k = -2; k <= 2; k++) {
          var H = r * (0.7 - Math.abs(k) * 0.1) * g;
          c.beginPath();
          c.moveTo(px + k * r * 0.02, py);
          c.quadraticCurveTo(px + k * r * 0.06, py - H * 0.7, px + k * r * 0.12 + sw * (k || 1) * 0.6, py - H);
          c.stroke();
        }
        if (ripe >= 1) shoulder(c, px, py + r * 0.05, r * 0.16, r * 0.16, def.skin, def.skin2, 0);
        if (ripe >= 1) {
          c.strokeStyle = sh(def.skin2, -0.1); c.lineWidth = Math.max(0.35, r * 0.02);
          line(c, px - r * 0.05, py - r * 0.06, px - r * 0.02, py + r * 0.02);
          line(c, px + r * 0.05, py - r * 0.06, px + r * 0.03, py + r * 0.02);
        }
      } else {
        /* potato: a leafy little bush with white flowers */
        var cy = py - r * 0.26 * g;
        c.strokeStyle = sh(leafC, -0.2); c.lineWidth = Math.max(0.7, r * 0.04);
        line(c, px, py, px + sw, cy);
        for (k = 0; k < 7; k++) {
          a = k / 7 * TAU;
          c.fillStyle = k % 2 ? sh(leafC, -0.12) : leafC;
          ell(c, px + sw + Math.cos(a) * r * 0.2 * g, cy + Math.sin(a) * r * 0.12 * g, r * 0.12 * g, r * 0.08 * g, a);
        }
        c.fillStyle = sh(leafC, 0.14);
        ell(c, px + sw - r * 0.04, cy - r * 0.05 * g, r * 0.1 * g, r * 0.07 * g);
        if (ripe > 0.5) {
          c.fillStyle = '#f6f2ea';
          ell(c, px + sw + r * 0.07, cy - r * 0.14 * g, r * 0.05, r * 0.05);
          c.fillStyle = '#f0c93a';
          ell(c, px + sw + r * 0.07, cy - r * 0.14 * g, r * 0.02, r * 0.02);
        }
        if (ripe >= 1) {
          shoulder(c, px - r * 0.2, py + r * 0.1, r * 0.13, r * 0.1, def.skin, def.skin2, 0);
          shoulder(c, px + r * 0.24, py + r * 0.12, r * 0.1, r * 0.08, def.skin, def.skin2, 0);
        }
      }
    });
  }

  function cornPatch(c, def, x, y, r, t, seed, ripe) {
    var leafC = def.leaf || '#5f9a3c';
    var g = ripe >= 1 ? 1 : 0.45 + 0.4 * ripe;
    var sway = Math.sin(t * 0.9 + seed * 5) * r * 0.05;
    [[-0.4, 1.55, -1], [0.38, 1.4, 1], [0, 1.75, 1]].forEach(function (q, i) {
      var bx = x + q[0] * r, by = y - r * 0.15, H = r * q[1] * g;
      var tx = bx + sway * (i === 2 ? 1 : 0.7), ty = by - H;
      c.strokeStyle = sh(leafC, -0.08); c.lineWidth = Math.max(1.2, r * 0.07); c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx, by - H * 0.5, tx, ty); c.stroke();
      /* long arching blades, alternating up the stalk */
      for (var k = 0; k < 4; k++) {
        var f = 0.22 + k * 0.2, ly = by - H * f, lx = bx + (tx - bx) * f;
        var s = (k + i) % 2 ? 1 : -1;
        c.fillStyle = k % 2 ? leafC : sh(leafC, -0.12);
        c.beginPath();
        c.moveTo(lx, ly);
        c.quadraticCurveTo(lx + s * r * 0.36, ly - r * 0.36, lx + s * r * 0.58, ly - r * 0.08 + sway * 0.3);
        c.quadraticCurveTo(lx + s * r * 0.34, ly - r * 0.22, lx, ly + r * 0.08);
        c.closePath(); c.fill();
      }
      /* the tassel on top */
      if (ripe > 0.6) {
        c.strokeStyle = '#c9a85a'; c.lineWidth = Math.max(0.6, r * 0.03);
        for (var j = -2; j <= 2; j++) line(c, tx, ty, tx + j * r * 0.07 + sway * 0.3, ty - r * 0.16 + Math.abs(j) * r * 0.04);
      }
      /* the ear, wrapped in husk, with silk out of the top */
      if (ripe >= 1 && i !== 1) {
        var s2 = q[2], ex = bx + (tx - bx) * 0.5 + s2 * r * 0.1, ey = by - H * 0.5;
        c.save(); c.translate(ex, ey); c.rotate(s2 * 0.45);
        c.fillStyle = def.skin2; ell(c, 0, -r * 0.02, r * 0.08, r * 0.2);
        c.fillStyle = def.skin; ell(c, -r * 0.01, -r * 0.05, r * 0.06, r * 0.16);
        c.fillStyle = sh(def.skin2, -0.15);
        for (var n = 0; n < 4; n++) ell(c, r * 0.02, -r * 0.16 + n * r * 0.07, r * 0.012, r * 0.012);
        c.fillStyle = sh(leafC, 0.1);
        c.beginPath();
        c.moveTo(-r * 0.09, r * 0.2);
        c.quadraticCurveTo(-r * 0.12, -r * 0.05, -r * 0.03, -r * 0.14);
        c.quadraticCurveTo(-r * 0.02, r * 0.05, r * 0.02, r * 0.2);
        c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(r * 0.09, r * 0.2);
        c.quadraticCurveTo(r * 0.12, -r * 0.02, r * 0.05, -r * 0.1);
        c.quadraticCurveTo(r * 0.03, r * 0.08, -r * 0.02, r * 0.2);
        c.closePath(); c.fill();
        c.strokeStyle = '#a8703a'; c.lineWidth = Math.max(0.5, r * 0.025);
        line(c, 0, -r * 0.2, -r * 0.04, -r * 0.3);
        line(c, 0, -r * 0.2, r * 0.03, -r * 0.31);
        c.restore();
      }
    });
  }

  function peaTrellis(c, def, x, y, r, t, seed, ripe) {
    var leafC = def.leaf || '#5a9a3a';
    var g = ripe >= 1 ? 1 : 0.4 + 0.45 * ripe;
    var sway = Math.sin(t * 1.2 + seed * 6) * r * 0.03;
    var top = y - r * 1.35, by = y - r * 0.14;
    /* two canes and some string */
    c.strokeStyle = '#9a7442'; c.lineWidth = Math.max(1, r * 0.06); c.lineCap = 'round';
    line(c, x - r * 0.46, by + r * 0.04, x - r * 0.36, top);
    line(c, x + r * 0.46, by + r * 0.04, x + r * 0.36, top);
    c.strokeStyle = 'rgba(240,228,200,0.85)'; c.lineWidth = Math.max(0.5, r * 0.022);
    for (var k = 0; k < 4; k++) {
      var sy = top + r * 0.12 + k * r * 0.28;
      line(c, x - r * 0.42, sy, x + r * 0.42, sy);
    }
    /* the vine scrambling up it, with its curly tendrils */
    var vt = by - (by - top) * g * 0.95;
    c.strokeStyle = leafC; c.lineWidth = Math.max(0.8, r * 0.045);
    for (var v = -1; v <= 1; v += 2) {
      c.beginPath();
      c.moveTo(x + v * r * 0.12, by);
      c.bezierCurveTo(x + v * r * 0.4, by - (by - vt) * 0.3, x - v * r * 0.1, by - (by - vt) * 0.65,
                      x + v * r * 0.22 + sway, vt);
      c.stroke();
    }
    c.strokeStyle = sh(leafC, 0.15); c.lineWidth = Math.max(0.4, r * 0.02);
    [[-0.3, 0.55], [0.34, 0.8], [-0.1, 0.95]].forEach(function (q) {
      var cx = x + q[0] * r + sway, cy = by - (by - vt) * q[1];
      c.beginPath(); c.arc(cx, cy, r * 0.05, 0, Math.PI * 1.6); c.stroke();
    });
    /* pairs of round leaflets up the vine */
    for (k = 0; k < 6; k++) {
      var f = 0.12 + k * 0.15, ly = by - (by - vt) * f;
      var lx = x + Math.sin(k * 1.9) * r * 0.22 + sway * f;
      c.fillStyle = k % 2 ? leafC : sh(leafC, -0.12);
      ell(c, lx - r * 0.08, ly, r * 0.09, r * 0.065, -0.3);
      ell(c, lx + r * 0.08, ly - r * 0.02, r * 0.09, r * 0.065, 0.3);
    }
    if (ripe > 0.55) {
      c.fillStyle = '#fbf8f0';
      ell(c, x + r * 0.26 + sway, vt + r * 0.1, r * 0.06, r * 0.05);
      ell(c, x - r * 0.22 + sway, vt + r * 0.28, r * 0.055, r * 0.045);
    }
    if (ripe >= 1) {
      /* the pods hanging down, a little plump with the peas inside */
      [[-0.18, 0.42, 0.2], [0.2, 0.58, -0.25], [-0.02, 0.78, 0.1], [0.28, 0.3, -0.1]].forEach(function (q) {
        var px = x + q[0] * r + sway * 0.6, py = by - (by - vt) * q[1];
        c.save(); c.translate(px, py); c.rotate(q[2]);
        c.strokeStyle = sh(leafC, -0.2); c.lineWidth = Math.max(0.4, r * 0.02);
        line(c, 0, -r * 0.04, 0, r * 0.02);
        c.fillStyle = def.skin2;
        ell(c, 0, r * 0.15, r * 0.055, r * 0.15);
        c.fillStyle = def.skin;
        ell(c, -r * 0.01, r * 0.14, r * 0.042, r * 0.13);
        c.fillStyle = sh(def.skin, 0.2);
        for (var n = 0; n < 3; n++) ell(c, -r * 0.005, r * (0.06 + n * 0.08), r * 0.024, r * 0.03);
        c.restore();
      });
    }
  }

  function tomatoCage(c, def, x, y, r, t, seed, ripe) {
    var leafC = def.leaf || '#4f8a3a';
    var g = ripe >= 1 ? 1 : 0.45 + 0.4 * ripe;
    var sway = Math.sin(t * 1.1 + seed * 6) * r * 0.025;
    var by = y - r * 0.14, H = r * 1.3;
    var rings = [[0.08, 0.3], [0.5, 0.42], [0.95, 0.55]];
    function ringAt(q, front) {
      c.strokeStyle = front ? '#a4abb0' : '#7d858a'; c.lineWidth = Math.max(0.6, r * 0.03);
      c.beginPath();
      c.ellipse(x, by - H * q[0], r * q[1], r * q[1] * 0.28, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.stroke();
    }
    /* the back of the cage */
    rings.forEach(function (q) { ringAt(q, false); });
    /* the plant: a bushy heap of cut leaves filling the cage */
    var blobs = [[0, 0.3, 0.34], [-0.26, 0.55, 0.28], [0.26, 0.6, 0.28], [0, 0.85, 0.3], [-0.2, 1.05, 0.22], [0.2, 1.1, 0.2]];
    blobs.forEach(function (q, i) {
      var f = q[1] * g;
      c.fillStyle = i % 2 ? sh(leafC, -0.14) : leafC;
      ell(c, x + q[0] * r + sway * f, by - H * f * 0.9, r * q[2] * (0.6 + 0.4 * g), r * q[2] * 0.72 * (0.6 + 0.4 * g));
    });
    c.fillStyle = sh(leafC, 0.14);
    ell(c, x - r * 0.1 + sway, by - H * 0.95 * g, r * 0.12, r * 0.08);
    /* tomatoes: red when ready, small and green while they grow */
    if (ripe >= 0.35) {
      var rr = ripe >= 1 ? 1 : 0.6;
      var green = { skin: '#8cbf4a', skin2: '#6a9a38', leaf: leafC, shape: def.shape };
      [[-0.18, 0.38, 0.13], [0.2, 0.46, 0.12], [0.02, 0.66, 0.12], [-0.24, 0.78, 0.1], [0.22, 0.86, 0.1]].forEach(function (q, i) {
        if (ripe < 1 && i > 2) return;
        var d = ripe >= 1 ? def : green;
        var fx = x + q[0] * r + sway, fy = by - H * q[1] * g, s = r * q[2] * rr;
        c.fillStyle = d.skin2; ell(c, fx, fy, s, s * 0.92);
        c.fillStyle = d.skin; ell(c, fx - s * 0.1, fy - s * 0.08, s * 0.8, s * 0.74);
        c.fillStyle = 'rgba(255,255,255,0.45)';
        ell(c, fx - s * 0.4, fy - s * 0.36, s * 0.22, s * 0.18, -0.5);
        c.fillStyle = sh(leafC, -0.1);
        for (var k = 0; k < 5; k++) {
          var a = -Math.PI / 2 + (k - 2) * 0.5;
          ell(c, fx + Math.cos(a) * s * 0.3, fy - s * 0.8 + Math.sin(a) * s * 0.1 + s * 0.1, s * 0.26, s * 0.08, a + Math.PI / 2);
        }
      });
    }
    /* the front of the cage and its legs */
    c.strokeStyle = '#a4abb0'; c.lineWidth = Math.max(0.6, r * 0.03);
    [-1, -0.35, 0.35, 1].forEach(function (f) {
      line(c, x + f * r * 0.3, by + r * 0.08, x + f * r * 0.55, by - H * 0.95);
    });
    rings.forEach(function (q) { ringAt(q, true); });
  }

  function sprawlPatch(c, def, x, y, r, t, seed, ripe) {
    var shape = def.shape, leafC = def.leaf || '#4f8a3a';
    var g = ripe >= 1 ? 1 : 0.45 + 0.45 * ripe;
    var sway = Math.sin(t * 1.0 + seed * 5) * 0.06;
    var melon = /melon|cucumber/.test(shape);
    var by = y - r * 0.14;
    /* the vines creeping out over the dirt */
    c.strokeStyle = sh(leafC, 0.08); c.lineWidth = Math.max(0.7, r * 0.04); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x - r * 0.5, by + r * 0.12, x - r * 0.95, by + r * 0.02); c.stroke();
    c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x + r * 0.5, by + r * 0.14, x + r * 0.92, by - r * 0.02); c.stroke();
    c.beginPath(); c.arc(x + r * 0.95, by - r * 0.08, r * 0.06, 0.5, 5); c.stroke();
    /* big leaves held up on their stalks */
    var leaves = melon
      ? [[-0.55, -0.3, 0.26, -0.3], [0.5, -0.32, 0.25, 0.4], [-0.1, -0.52, 0.28, 0.1], [0.2, -0.2, 0.22, 0.6], [-0.75, -0.1, 0.2, -0.6]]
      : [[-0.5, -0.4, 0.36, -0.3], [0.48, -0.42, 0.34, 0.35], [0, -0.66, 0.38, 0.05], [-0.1, -0.22, 0.3, 0.2]];
    leaves.forEach(function (q, i) {
      var lx = x + q[0] * r * (0.6 + 0.4 * g), ly = by + q[1] * r * g;
      c.strokeStyle = sh(leafC, 0.1); c.lineWidth = Math.max(0.6, r * 0.035);
      line(c, x + q[0] * r * 0.3, by, lx, ly);
      lobedLeaf(c, lx, ly, r * q[2] * g, i % 2 ? sh(leafC, -0.1) : leafC, q[3] + sway,
                melon ? 5 : 5, melon ? 0.45 : 0.28, 0.66);
    });
    if (ripe < 1 && ripe > 0.4) {
      /* a big yellow squash flower, which is where the next one comes from */
      var fx = x + r * 0.2, fy = by - r * 0.3;
      c.fillStyle = '#f5c21e';
      for (var k = 0; k < 5; k++) {
        var a = k / 5 * TAU - Math.PI / 2;
        ell(c, fx + Math.cos(a) * r * 0.07, fy + Math.sin(a) * r * 0.06, r * 0.07, r * 0.05, a);
      }
      c.fillStyle = '#e69a12'; ell(c, fx, fy, r * 0.04, r * 0.035);
    }
    if (ripe < 1) return;
    /* the crop, lying on the ground in front of the leaves */
    if (/zucchini|cucumber/.test(shape)) {
      [[-0.2, 0.1, -0.22, 0.46], [0.3, 0.13, 0.16, 0.38]].forEach(function (q, j) {
        var zx = x + q[0] * r, zy = by + q[1] * r, L = r * q[3];
        c.save(); c.translate(zx, zy); c.rotate(q[2]);
        c.fillStyle = 'rgba(30,20,10,0.3)'; ell(c, r * 0.02, r * 0.07, L, r * 0.07);
        c.fillStyle = sh(def.skin2, -0.25); ell(c, 0, r * 0.01, L * 1.02, r * 0.115);
        c.fillStyle = def.skin; ell(c, 0, -r * 0.005, L * 0.97, r * 0.095);
        c.fillStyle = sh(def.skin, 0.2); ell(c, -L * 0.05, -r * 0.035, L * 0.8, r * 0.04);
        c.fillStyle = 'rgba(225,240,190,0.75)';
        for (var n = 0; n < 9; n++) ell(c, (n / 8 - 0.5) * L * 1.5, (n % 3 - 1) * r * 0.035, r * 0.022, r * 0.013);
        c.fillStyle = 'rgba(255,255,255,0.4)';
        ell(c, -L * 0.15, -r * 0.055, L * 0.5, r * 0.016);
        /* the stalk end, and a blossom still hanging off the far end of one */
        c.fillStyle = '#9aa860'; ell(c, -L * 1.0, 0, r * 0.04, r * 0.06);
        if (!j) {
          c.fillStyle = '#f5c21e';
          ell(c, L * 1.06, -r * 0.02, r * 0.08, r * 0.07);
          c.fillStyle = '#e69a12'; ell(c, L * 1.04, -r * 0.02, r * 0.03, r * 0.03);
        }
        c.restore();
      });
      return;
    }
    if (melon) {
      /* a big striped watermelon lying on its side */
      var mx = x + r * 0.05, my = by + r * 0.04, mw = r * 0.44, mh = r * 0.28;
      c.fillStyle = 'rgba(30,50,20,0.2)'; ell(c, mx + r * 0.04, my + mh * 0.85, mw * 0.95, mh * 0.3);
      c.fillStyle = def.skin; ell(c, mx, my, mw, mh);
      c.save(); c.beginPath(); c.ellipse(mx, my, mw, mh, 0, 0, TAU); c.clip();
      c.strokeStyle = def.skin2; c.lineWidth = Math.max(1, r * 0.05);
      for (var sI = -2; sI <= 2; sI++) {
        c.beginPath();
        c.moveTo(mx - mw, my + sI * mh * 0.2);
        for (var sx = -1; sx <= 1.001; sx += 0.1) {
          c.lineTo(mx + sx * mw, my + sI * mh * 0.34 * Math.sqrt(1 - sx * sx) + Math.sin(sx * 14 + sI) * r * 0.015);
        }
        c.stroke();
      }
      c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, mx - mw * 0.3, my - mh * 0.5, mw * 0.5, mh * 0.2);
      c.fillStyle = 'rgba(230,220,150,0.6)'; ell(c, mx + mw * 0.1, my + mh * 0.85, mw * 0.5, mh * 0.2);
      c.restore();
      c.strokeStyle = '#7a8a4a'; c.lineWidth = Math.max(0.6, r * 0.03);
      line(c, mx - mw * 0.95, my - mh * 0.1, mx - mw * 1.15, my - mh * 0.35);
      return;
    }
    /* a pumpkin: prefer the fruit art's own blob when it has one */
    var px = x + r * 0.06, py = by + r * 0.02, pr = r * 0.3;
    c.fillStyle = 'rgba(30,50,20,0.2)'; ell(c, px + r * 0.03, py + pr * 0.82, pr * 1.2, pr * 0.3);
    c.fillStyle = def.skin2;
    ell(c, px - pr * 0.6, py, pr * 0.62, pr * 0.82);
    ell(c, px + pr * 0.6, py, pr * 0.62, pr * 0.82);
    c.fillStyle = def.skin;
    ell(c, px - pr * 0.3, py, pr * 0.6, pr * 0.86);
    ell(c, px + pr * 0.3, py, pr * 0.6, pr * 0.86);
    c.fillStyle = sh(def.skin, 0.1);
    ell(c, px, py, pr * 0.46, pr * 0.88);
    c.strokeStyle = def.skin2; c.lineWidth = Math.max(0.5, r * 0.025);
    [-0.55, -0.2, 0.2, 0.55].forEach(function (f) {
      c.beginPath(); c.moveTo(px + f * pr * 0.5, py - pr * 0.78);
      c.quadraticCurveTo(px + f * pr * 1.25, py, px + f * pr * 0.5, py + pr * 0.8); c.stroke();
    });
    c.fillStyle = 'rgba(255,255,255,0.28)';
    ell(c, px - pr * 0.55, py - pr * 0.35, pr * 0.14, pr * 0.3, 0.3);
    c.strokeStyle = '#6a7a3a'; c.lineWidth = Math.max(1, r * 0.06); c.lineCap = 'round';
    c.beginPath(); c.moveTo(px, py - pr * 0.8); c.quadraticCurveTo(px + pr * 0.05, py - pr * 1.1, px + pr * 0.25, py - pr * 1.2); c.stroke();
  }

  function spearPatch(c, def, x, y, r, t, seed, ripe) {
    var leafC = def.leaf || '#6aa04a';
    var sway = Math.sin(t * 1.3 + seed * 8) * r * 0.05;
    var by = y - r * 0.14;
    /* the feathery fern it turns into if you leave it, at the back */
    c.strokeStyle = sh(leafC, 0.1); c.lineWidth = Math.max(0.5, r * 0.02); c.lineCap = 'round';
    [[-0.6, 0.95, -0.3], [0.62, 0.85, 0.3], [-0.25, 1.15, -0.1]].forEach(function (q) {
      var bx = x + q[0] * r, H = r * q[1] * (ripe >= 1 ? 1 : 0.7 + 0.3 * ripe);
      var tx = bx + q[2] * r + sway, ty = by - H;
      line(c, bx, by, tx, ty);
      for (var k = 1; k <= 6; k++) {
        var f = k / 7, fx = bx + (tx - bx) * f, fy = by + (ty - by) * f, w = r * 0.14 * (1 - f * 0.5);
        line(c, fx, fy, fx - w, fy - w * 0.5);
        line(c, fx, fy, fx + w, fy - w * 0.5);
      }
    });
    /* the spears coming straight up out of the dirt */
    var n = ripe >= 1 ? 5 : (ripe > 0.4 ? 2 : 0);
    var spots = [[-0.34, 0.62, -0.08], [-0.08, 0.84, 0.03], [0.18, 0.7, 0.07], [0.42, 0.5, 0.12], [0.02, 0.44, -0.04]];
    for (var i = 0; i < n; i++) {
      var q = spots[i];
      var sx = x + q[0] * r, H = r * q[1] * (ripe >= 1 ? 1 : 0.35), tx = sx + q[2] * r;
      var w = Math.max(1.2, r * 0.075);
      c.strokeStyle = sh(def.skin, -0.12); c.lineWidth = w; c.lineCap = 'round';
      line(c, sx, by + r * 0.02, tx, by - H);
      c.strokeStyle = sh(def.skin, 0.12); c.lineWidth = w * 0.4;
      line(c, sx - w * 0.2, by, tx - w * 0.2, by - H + w * 0.6);
      /* the purple-tipped scales, tight at the top */
      c.fillStyle = def.skin2;
      c.beginPath();
      c.moveTo(tx - w * 0.62, by - H + w * 0.8);
      c.quadraticCurveTo(tx - w * 0.5, by - H - w * 0.9, tx, by - H - w * 1.2);
      c.quadraticCurveTo(tx + w * 0.5, by - H - w * 0.9, tx + w * 0.62, by - H + w * 0.8);
      c.closePath(); c.fill();
      for (var k = 1; k <= 2; k++) {
        var f = 0.25 + k * 0.22, px = sx + (tx - sx) * (1 - f), py = by - H * (1 - f);
        ell(c, px + (k % 2 ? w * 0.4 : -w * 0.4), py, w * 0.3, w * 0.45, k % 2 ? 0.5 : -0.5);
      }
    }
  }

  function vegPatchLive(c, x, y, r, t, seed, col, p) {
    var def = defOf(p);
    var ripe = ripeOf(p);
    seed = seed || 0;
    soilBed(c, x, y, r);
    if (!def) {
      rootRow(c, { shape: 'carrot', skin: '#f08a2a', skin2: '#d4661a', leaf: '#4f9a3a' }, x, y, r, t, seed, 0.5);
      return;
    }
    var grp = vegGroup(def);
    if (grp === 'corn') cornPatch(c, def, x, y, r, t, seed, ripe);
    else if (grp === 'pea') peaTrellis(c, def, x, y, r, t, seed, ripe);
    else if (grp === 'tomato') tomatoCage(c, def, x, y, r, t, seed, ripe);
    else if (grp === 'sprawl') sprawlPatch(c, def, x, y, r, t, seed, ripe);
    else if (grp === 'spear') spearPatch(c, def, x, y, r, t, seed, ripe);
    else rootRow(c, def, x, y, r, t, seed, ripe);
  }

  /* =====================================================================
     WILD BERRY - a native shrub, cane or groundcover
     ===================================================================== */
  function wildForm(def) {
    if (!def) return 'huckle';
    var id = (def.id || '') + ' ' + (def.name || '');
    if (def.shape === 'tuna' || /prickly/i.test(id)) return 'cactus';
    if (def.on === 'low') {
      if (def.shape === 'straw' || /strawberr/i.test(id)) return 'strawberry';
      if (/crowberr/i.test(id)) return 'crowberry';
      return 'kinnik';
    }
    if (def.shape === 'bramble' || def.on === 'cane') return /thimble/i.test(id) ? 'thimble' : 'salmon';
    if (def.shape === 'umbel' || /elder/i.test(id)) return 'elder';
    if (def.shape === 'baneberry' || /baneberr/i.test(id)) return 'bane';
    if (def.shape === 'strig' || /oregon|mahonia/i.test(id)) return 'oregon';
    if (/salal/i.test(id)) return 'salal';
    return 'huckle';
  }

  function withCrop(c, ripe, fn) {
    if (ripe <= 0) return;
    c.save();
    c.globalAlpha *= Math.min(1, ripe);
    fn(0.6 + 0.4 * ripe);
    c.restore();
  }

  /* a holly-ish spiny leaflet */
  function hollyLeaf(c, x, y, L, W, col, rot) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(0, 0);
    var n = 3;
    for (var k = 1; k <= n; k++) {
      var f = k / (n + 1);
      c.lineTo(L * (f - 0.08), -W * 0.6);
      c.lineTo(L * f, -W * 1.05);
    }
    c.lineTo(L, 0);
    for (k = n; k >= 1; k--) {
      var f2 = k / (n + 1);
      c.lineTo(L * f2, W * 1.05);
      c.lineTo(L * (f2 - 0.08), W * 0.6);
    }
    c.closePath(); c.fill();
    c.strokeStyle = sh(col, 0.2); c.lineWidth = Math.max(0.3, W * 0.15);
    line(c, 0, 0, L * 0.9, 0);
    c.restore();
  }
  /* a straight-stalked compound leaf: `n` leaflets in pairs plus one on the end */
  function pinnate(c, x, y, L, rot, col, pairs, lw, serr) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.strokeStyle = sh(col, -0.15); c.lineWidth = Math.max(0.4, lw * 0.25);
    line(c, 0, 0, L, 0);
    for (var k = 0; k < pairs; k++) {
      var fx = L * (0.3 + k * (0.6 / Math.max(1, pairs)));
      leaf(c, fx, 0, lw * 2.2, lw * 0.75, k % 2 ? col : sh(col, -0.08), -0.9);
      leaf(c, fx, 0, lw * 2.2, lw * 0.75, k % 2 ? sh(col, -0.08) : col, 0.9);
    }
    leaf(c, L * 0.95, 0, lw * 2.4, lw * 0.8, col, 0);
    c.restore();
  }

  function woodyStems(c, x, y, r, col, n, spread, height, sway) {
    c.strokeStyle = col; c.lineWidth = Math.max(1, r * 0.06); c.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
      c.beginPath();
      c.moveTo(x + f * r * 0.1, y);
      c.quadraticCurveTo(x + f * r * spread * 0.5, y - r * height * 0.55,
                         x + f * r * spread + sway * (1 + Math.abs(f)), y - r * height * (1 - Math.abs(f) * 0.25));
      c.stroke();
    }
  }

  function wildBerryLive(c, x, y, r, t, seed, col, p) {
    var def = defOf(p);
    var ripe = def ? ripeOf(p) : 0;
    seed = seed || 0;
    var form = wildForm(def);
    var leafC = (def && def.leaf) || '#5a8a4a';
    var sway = Math.sin(t * 0.9 + seed * 7) * r * 0.05;
    var rnd = GG.mulberry32(Math.floor(seed * 7919) + 13);
    var i, k, a;

    if (form === 'strawberry') {
      /* a wild strawberry is a small strawberry plant: the orchard patch does it */
      P.fruitPatch(c, x, y, r * 0.9, t, seed, col, p);
      return;
    }

    if (form === 'cactus') {
      shadow(c, x, y, r * 0.95);
      var pads = [[-0.5, -0.3, 0.3, 0.38, -0.45], [0.46, -0.32, 0.3, 0.36, 0.4], [0.02, -0.46, 0.34, 0.44, 0.05],
                  [-0.28, -0.98, 0.24, 0.3, -0.3], [0.34, -1.02, 0.24, 0.3, 0.35]];
      var tops = [];
      pads.forEach(function (q, j) {
        var px = x + q[0] * r, py = y + q[1] * r;
        c.fillStyle = sh(leafC, -0.18);
        ell(c, px + r * 0.03, py + r * 0.02, r * q[2], r * q[3], q[4]);
        c.fillStyle = j % 2 ? leafC : sh(leafC, 0.06);
        ell(c, px, py, r * q[2], r * q[3], q[4]);
        c.fillStyle = 'rgba(255,255,255,0.12)';
        ell(c, px - r * q[2] * 0.35, py - r * q[3] * 0.3, r * q[2] * 0.3, r * q[3] * 0.4, q[4]);
        /* areoles in a neat diamond grid, each with its fuzz of glochids */
        for (k = 0; k < 5; k++) {
          var ax = px + (((k * 37) % 5) / 4 - 0.5) * r * q[2] * 1.1;
          var ay = py + (((k * 3) % 5) / 4 - 0.5) * r * q[3] * 1.2;
          c.fillStyle = 'rgba(236,228,180,0.85)'; ell(c, ax, ay, Math.max(0.45, r * 0.016), Math.max(0.45, r * 0.016));
          c.strokeStyle = 'rgba(240,236,210,0.7)'; c.lineWidth = Math.max(0.35, r * 0.012);
          line(c, ax, ay, ax + r * 0.045, ay - r * 0.035);
        }
        if (j >= 3) tops.push([px, py - r * q[3] * 0.9, q[4]]);
        if (j === 1) tops.push([px + r * 0.12, py - r * q[3] * 0.82, q[4] + 0.5]);
      });
      /* the fruit, the "tunas", sitting right on the pad edges */
      withCrop(c, ripe, function (g) {
        tops.forEach(function (q, j) {
          for (var n = 0; n < 2; n++) {
            if (j === 2 && n) continue;
            var fx = q[0] + (n ? r * 0.12 : -r * 0.1) + Math.sin(q[2]) * r * 0.1;
            var fy = q[1] + (n ? r * 0.02 : 0);
            var s = r * 0.1 * g;
            c.fillStyle = def.skin2; ell(c, fx, fy - s * 0.2, s * 0.85, s * 1.2);
            c.fillStyle = def.skin; ell(c, fx - s * 0.1, fy - s * 0.3, s * 0.68, s * 1.02);
            c.fillStyle = sh(def.skin2, -0.2); ell(c, fx, fy - s * 1.25, s * 0.5, s * 0.18);
            c.fillStyle = 'rgba(245,225,150,0.9)';
            ell(c, fx - s * 0.3, fy - s * 0.5, s * 0.1, s * 0.1);
            ell(c, fx + s * 0.25, fy - s * 0.1, s * 0.1, s * 0.1);
            ell(c, fx - s * 0.2, fy + s * 0.35, s * 0.1, s * 0.1);
          }
        });
      });
      return;
    }

    if (form === 'kinnik' || form === 'crowberry') {
      /* a low evergreen mat spreading out over the ground */
      c.fillStyle = 'rgba(30,60,25,0.14)'; ell(c, x, y, r * 1.15, r * 0.3);
      var stemCol = form === 'kinnik' ? '#8a4a32' : '#6a4a3a';
      var runners = [[-1.1, -0.1], [-0.7, -0.38], [-0.2, -0.46], [0.3, -0.44], [0.8, -0.34], [1.1, -0.06], [0, -0.2]];
      runners.forEach(function (q, j) {
        var ex = x + q[0] * r, ey = y + q[1] * r + (j % 2 ? sway * 0.2 : 0);
        c.strokeStyle = stemCol; c.lineWidth = Math.max(0.6, r * 0.035); c.lineCap = 'round';
        c.beginPath(); c.moveTo(x, y - r * 0.05);
        c.quadraticCurveTo((x + ex) / 2, ey - r * 0.12, ex, ey); c.stroke();
        for (k = 1; k <= 5; k++) {
          var f = k / 5.5;
          var lx = x + (ex - x) * f, ly = (y - r * 0.05) + (ey - y + r * 0.05) * f - Math.sin(f * Math.PI) * r * 0.06;
          if (form === 'kinnik') {
            /* small shiny paddle leaves */
            c.fillStyle = (j + k) % 2 ? leafC : sh(leafC, 0.14);
            ell(c, lx, ly - r * 0.04, r * 0.07, r * 0.045, (k % 2 ? -0.6 : 0.6));
            c.fillStyle = 'rgba(255,255,255,0.3)';
            ell(c, lx - r * 0.02, ly - r * 0.055, r * 0.025, r * 0.012, -0.4);
          } else {
            /* crowberry: little needles all round the stem, like a bottlebrush */
            c.strokeStyle = (j + k) % 2 ? leafC : sh(leafC, 0.14); c.lineWidth = Math.max(0.5, r * 0.025);
            for (var nn = -2; nn <= 2; nn++) {
              var na = -Math.PI / 2 + nn * 0.6;
              line(c, lx, ly, lx + Math.cos(na) * r * 0.07, ly + Math.sin(na) * r * 0.06);
            }
          }
        }
      });
      c.fillStyle = sh(leafC, -0.12); ell(c, x, y - r * 0.12, r * 0.4, r * 0.15);
      c.fillStyle = leafC; ell(c, x - r * 0.1, y - r * 0.17, r * 0.24, r * 0.1);
      withCrop(c, ripe, function (g) {
        for (var n = 0; n < 7; n++) {
          var bx = x + (rnd() - 0.5) * r * 1.8, byy = y - r * (0.08 + rnd() * 0.3);
          berry(c, def, bx, byy, r * 0.065 * g);
        }
      });
      return;
    }

    shadow(c, x + 1, y, r * 0.85);

    if (form === 'salmon' || form === 'thimble') {
      /* upright canes arching over at the top */
      var caneCol = form === 'salmon' ? '#a0703e' : '#8a8c52';
      var tips = [];
      c.strokeStyle = caneCol; c.lineWidth = Math.max(1.1, r * 0.07); c.lineCap = 'round';
      for (i = -2; i <= 2; i++) {
        var tx = x + i * r * 0.42 + sway * (1 + Math.abs(i) * 0.3);
        var ty = y - r * (1.2 - Math.abs(i) * 0.18);
        c.beginPath();
        c.moveTo(x + i * r * 0.08, y);
        c.quadraticCurveTo(x + i * r * 0.2, y - r * 1.35, tx, ty);
        c.stroke();
        tips.push([tx, ty, i]);
        if (form === 'salmon') {
          /* a few fine prickles near the base */
          c.strokeStyle = '#c89a62'; c.lineWidth = Math.max(0.4, r * 0.02);
          for (k = 1; k <= 2; k++) {
            var py2 = y - r * 0.25 * k, px2 = x + i * r * 0.08 + i * r * 0.03 * k;
            line(c, px2, py2, px2 + r * 0.05, py2 - r * 0.04);
          }
          c.strokeStyle = caneCol; c.lineWidth = Math.max(1.1, r * 0.07);
        }
      }
      if (form === 'thimble') {
        /* big soft maple-shaped leaves */
        [[-0.55, -0.72, 0.36, -0.2], [0.55, -0.7, 0.36, 0.25], [0, -1.08, 0.4, 0], [-0.22, -0.42, 0.3, -0.5], [0.3, -0.44, 0.3, 0.4]]
          .forEach(function (q, j) {
            lobedLeaf(c, x + q[0] * r + sway * 0.6, y + q[1] * r, r * q[2], j % 2 ? sh(leafC, -0.12) : leafC, q[3], 5, 0.3, 0.7);
          });
        c.fillStyle = '#fbf6ee';
        ell(c, x - r * 0.42 + sway, y - r * 1.12, r * 0.1, r * 0.08);
        ell(c, x - r * 0.45 + sway, y - r * 1.06, r * 0.08, r * 0.06);
        c.fillStyle = '#f0d060'; ell(c, x - r * 0.43 + sway, y - r * 1.1, r * 0.035, r * 0.03);
      } else {
        /* three toothed leaflets on each leaf */
        [[-0.5, -0.78, -0.4], [0.52, -0.74, 0.4], [0.02, -1.08, 0], [-0.3, -0.42, -0.9], [0.32, -0.46, 0.9]].forEach(function (q, j) {
          var lx = x + q[0] * r + sway * 0.6, ly = y + q[1] * r;
          var cl = j % 2 ? sh(leafC, -0.12) : leafC;
          leaf(c, lx, ly, r * 0.3, r * 0.1, cl, -Math.PI / 2 + q[2]);
          leaf(c, lx, ly, r * 0.26, r * 0.09, sh(cl, -0.05), -Math.PI / 2 + q[2] - 1.1);
          leaf(c, lx, ly, r * 0.26, r * 0.09, sh(cl, 0.06), -Math.PI / 2 + q[2] + 1.1);
        });
        c.fillStyle = '#e0508a';
        ell(c, x + r * 0.46 + sway, y - r * 1.02, r * 0.08, r * 0.06);
      }
      withCrop(c, ripe, function (g) {
        [[-0.34, -0.5], [0.4, -0.52], [0.1, -0.84], [-0.62, -0.95], [0.66, -0.98]].forEach(function (q) {
          blob(c, def, x + q[0] * r + sway * 0.6, y + q[1] * r, r * 0.13 * g);
        });
      });
      return;
    }

    if (form === 'elder') {
      /* a big multi-stemmed shrub, taller than she is, with flat heads of berries */
      var red = /red/i.test(def.id || def.name || '') || def.skin && parseInt(def.skin.slice(1, 3), 16) > 0xb0;
      c.fillStyle = sh(leafC, -0.24);
      ell(c, x - r * 0.35 + sway * 0.5, y - r * 0.85, r * 0.42, r * 0.36);
      ell(c, x + r * 0.38 + sway * 0.5, y - r * 0.9, r * 0.42, r * 0.36);
      ell(c, x + sway * 0.7, y - r * 1.2, r * 0.4, r * 0.32);
      woodyStems(c, x, y, r, '#8a7a62', 4, 0.6, 1.5, sway);
      [[-0.55, -0.9, -2.4], [0.55, -0.95, -0.7], [-0.2, -1.35, -1.9], [0.25, -1.4, -1.2], [-0.7, -0.5, -2.8], [0.72, -0.55, -0.3]]
        .forEach(function (q, j) {
          pinnate(c, x + q[0] * r * 0.4 + sway * 0.5, y + q[1] * r, r * 0.55, q[2], j % 2 ? sh(leafC, -0.1) : leafC, 2, r * 0.1);
        });
      withCrop(c, ripe, function (g) {
        [[-0.38, -1.22], [0.42, -1.28], [0.02, -1.6]].forEach(function (q) {
          var ux = x + q[0] * r + sway, uy = y + q[1] * r;
          var br = r * 0.052 * g, rows = red ? [5, 4, 3, 2] : [7, 6, 5];
          var dx = br * 1.55;
          /* the stalks spreading out like the ribs of an umbrella */
          c.strokeStyle = '#9a8a5a'; c.lineWidth = Math.max(0.4, r * 0.02);
          for (var n = -2; n <= 2; n++) line(c, ux, uy + r * 0.2, ux + n * dx * 1.2, uy + br);
          rows.forEach(function (cnt, row) {
            for (var m = 0; m < cnt; m++) {
              var bx = ux + (m - (cnt - 1) / 2) * dx + (row % 2 ? dx * 0.1 : 0);
              var byy = uy - row * br * (red ? 1.25 : 1.05) + Math.abs(m - (cnt - 1) / 2) * br * (red ? 0 : 0.25);
              c.fillStyle = def.skin2; ell(c, bx, byy, br, br);
              c.fillStyle = def.skin; ell(c, bx - br * 0.15, byy - br * 0.18, br * 0.75, br * 0.75);
              if (!red) {
                c.fillStyle = 'rgba(225,232,245,0.5)'; ell(c, bx - br * 0.1, byy - br * 0.1, br * 0.6, br * 0.6);
              } else {
                c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, bx - br * 0.35, byy - br * 0.4, br * 0.22, br * 0.22);
              }
            }
          });
        });
      });
      return;
    }

    if (form === 'bane') {
      /* not a shrub: a knee-high forest plant with big lacy leaves */
      c.strokeStyle = '#6a7a4a'; c.lineWidth = Math.max(0.9, r * 0.05); c.lineCap = 'round';
      line(c, x, y, x - r * 0.3 + sway, y - r * 0.7);
      line(c, x, y, x + r * 0.35 + sway, y - r * 0.62);
      line(c, x, y, x + r * 0.06 + sway, y - r * 1.15);
      [[-0.3, -0.7, -2.6], [-0.3, -0.7, -1.9], [0.35, -0.62, -0.5], [0.35, -0.62, -1.2]].forEach(function (q, j) {
        pinnate(c, x + q[0] * r + sway, y + q[1] * r, r * 0.42, q[2], j % 2 ? sh(leafC, -0.1) : leafC, 2, r * 0.1);
      });
      withCrop(c, ripe, function (g) {
        var cx = x + r * 0.06 + sway, cy = y - r * 1.25;
        for (var n = 0; n < 7; n++) {
          var aa = n / 7 * TAU, bx = cx + Math.cos(aa) * r * 0.12, byy = cy + Math.sin(aa) * r * 0.1 - (n % 2) * r * 0.04;
          c.strokeStyle = '#8a3a2a'; c.lineWidth = Math.max(0.4, r * 0.018);
          line(c, cx, cy + r * 0.14, bx, byy);
          var s = r * 0.065 * g;
          c.fillStyle = sh(def.skin, -0.2); ell(c, bx, byy, s, s);
          c.fillStyle = def.skin; ell(c, bx - s * 0.12, byy - s * 0.12, s * 0.82, s * 0.82);
          c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, bx - s * 0.35, byy - s * 0.35, s * 0.22, s * 0.22);
          c.fillStyle = def.skin2; ell(c, bx + s * 0.2, byy + s * 0.25, s * 0.2, s * 0.2);
        }
      });
      return;
    }

    if (form === 'oregon') {
      /* holly-like leaves on stiff upright stems, blue grapes on top */
      woodyStems(c, x, y, r, '#8a6a4a', 3, 0.5, 1.05, sway * 0.5);
      c.fillStyle = sh(leafC, -0.3);
      ell(c, x + sway * 0.4, y - r * 0.62, r * 0.55, r * 0.36);
      for (i = 0; i < 9; i++) {
        a = -Math.PI / 2 + (i / 8 - 0.5) * 2.9;
        var lx = x + Math.cos(a) * r * 0.12 + sway * 0.4, ly = y - r * 0.55 + Math.sin(a) * r * 0.12;
        var cl = i === 6 ? '#b0583a' : (i % 2 ? sh(leafC, 0.08) : sh(leafC, -0.08));
        hollyLeaf(c, lx, ly, r * 0.5, r * 0.13, cl, a + (i % 2 ? 0.15 : -0.15));
      }
      withCrop(c, ripe, function (g) {
        [[-0.26, -0.92], [0.22, -0.98], [0.02, -1.12]].forEach(function (q) {
          blob(c, def, x + q[0] * r + sway * 0.5, y + q[1] * r, r * 0.15 * g);
        });
      });
      return;
    }

    /* huckleberry and salal: an open woody shrub */
    var salal = form === 'salal';
    var twig = salal ? '#8a5a3a' : (def && def.skin && parseInt(def.skin.slice(1, 3), 16) > 0xb0 ? '#6aa04a' : '#7a6a4e');
    if (!salal) {
      /* a soft haze of leaves behind the twigs, so it reads as one bush */
      c.fillStyle = sh(leafC, -0.22);
      ell(c, x - r * 0.3 + sway * 0.5, y - r * 0.6, r * 0.4, r * 0.34);
      ell(c, x + r * 0.32 + sway * 0.5, y - r * 0.66, r * 0.38, r * 0.32);
      ell(c, x + sway * 0.7, y - r * 0.95, r * 0.36, r * 0.3);
    }
    woodyStems(c, x, y, r, twig, 5, 0.7, salal ? 0.95 : 1.2, sway);
    if (salal) {
      /* leathery, shiny egg-shaped leaves, packed thick */
      for (i = 0; i < 12; i++) {
        a = -Math.PI / 2 + (i / 11 - 0.5) * 2.9;
        var d = r * (0.28 + (i % 3) * 0.14);
        var lx2 = x + Math.cos(a) * d + sway * 0.5, ly2 = y - r * 0.4 + Math.sin(a) * d * 0.9;
        c.fillStyle = i % 2 ? leafC : sh(leafC, -0.14);
        ell(c, lx2, ly2, r * 0.16, r * 0.1, a);
        c.fillStyle = 'rgba(255,255,255,0.18)';
        ell(c, lx2 - r * 0.03, ly2 - r * 0.03, r * 0.07, r * 0.025, a);
      }
    } else {
      /* airy, with small oval leaves along thin zigzag twigs */
      c.strokeStyle = twig; c.lineWidth = Math.max(0.6, r * 0.03);
      for (i = 0; i < 6; i++) {
        var sx = x + (i / 5 - 0.5) * r * 1.1 + sway, sy = y - r * (0.55 + (i % 3) * 0.2);
        line(c, sx, sy, sx + (i % 2 ? r * 0.2 : -r * 0.2), sy - r * 0.18);
      }
      for (i = 0; i < 16; i++) {
        var bx2 = x + (rnd() - 0.5) * r * 1.4 + sway, by2 = y - r * (0.35 + rnd() * 0.85);
        c.fillStyle = i % 3 ? leafC : sh(leafC, -0.14);
        ell(c, bx2, by2, r * 0.085, r * 0.055, rnd() * 3);
      }
    }
    withCrop(c, ripe, function (g) {
      if (salal) {
        /* salal berries hang in a row along a drooping stalk */
        [[-0.3, -0.7], [0.34, -0.62]].forEach(function (q) {
          var sx2 = x + q[0] * r + sway * 0.5, sy2 = y + q[1] * r;
          c.strokeStyle = '#b05a4a'; c.lineWidth = Math.max(0.5, r * 0.025);
          c.beginPath(); c.moveTo(sx2, sy2); c.quadraticCurveTo(sx2 + r * 0.1, sy2 + r * 0.05, sx2 + r * 0.14, sy2 + r * 0.3); c.stroke();
          for (var n = 0; n < 4; n++) berry(c, def, sx2 + r * (0.04 + n * 0.035) + (n % 2 ? r * 0.05 : -r * 0.03), sy2 + r * (0.06 + n * 0.08), r * 0.06 * g);
        });
        return;
      }
      /* huckleberries hang one at a time under the twigs */
      for (var m = 0; m < 9; m++) {
        var hx = x + (rnd() - 0.5) * r * 1.3 + sway, hy = y - r * (0.35 + rnd() * 0.75);
        berry(c, def, hx, hy, r * 0.065 * g);
      }
    });
  }

  /* =====================================================================
     PICK FLOWER - a clump of 3 to 5 blooms of one flower
     ===================================================================== */
  function pickFlowerLive(c, x, y, r, t, seed, col, p) {
    var def = defOf(p);
    var ripe = ripeOf(p);
    seed = seed || 0;
    if (!def || !GG.FlowerArt) { P.flower && P.flower(c, x, y, r * 0.6, t, seed, col || '#ff8fb0'); return; }
    var rnd = GG.mulberry32(Math.floor(seed * 6151) + 3);
    var n = 3 + Math.floor(rnd() * 3);
    var tall = GG.FlowerArt.tall(def);
    shadow(c, x, y, r * 0.6);
    var stems = [];
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : i / (n - 1) - 0.5;
      stems.push({
        ox: f * r * 0.95 + (rnd() - 0.5) * r * 0.12,
        oy: (rnd() - 0.5) * r * 0.14,
        h: (0.78 + rnd() * 0.3) * (i === Math.floor(n / 2) ? 1.1 : 1),
        lean: f * 0.5 + (rnd() - 0.5) * 0.12,
        ph: rnd() * 6,
        cut: rnd() < 0.45
      });
    }
    /* the back ones first */
    stems.sort(function (a, b) { return a.oy - b.oy; });
    stems.forEach(function (s, j) {
      var sc = r * 1.1 * s.h * tall / 26;
      var lean = s.lean + Math.sin(t * 1.4 + seed * 9 + s.ph) * 0.05;
      c.save();
      c.translate(x + s.ox, y + s.oy);
      c.rotate(lean);
      GG.FlowerArt.draw(c, def, 0, -13 * sc, sc, t, {
        bloom: ripe, phase: s.ph, cut: s.cut && j > 0, stemW: Math.min(2.4, 1.1 / sc)
      });
      c.restore();
    });
  }

  /* =====================================================================
     SPRITES - each of these clumps costs 50 to 190 microseconds to draw
     from scratch, and a garden screen has dozens. So each plant is drawn
     once into its own little offscreen canvas at the screen's real
     resolution, and after that it is just stamped. It is redrawn only when
     its crop changes (picked, then growing back in tenths), its size or the
     screen scale changes. The price is the flowers' gentle sway.
     ===================================================================== */
  var SPR_CAP = 72;               // at most this many plants keep a sprite
  var sprUsed = new Map();        // prop -> true, oldest use first
  function spriteScale(c) {
    if (GG.PROP_DPR) return GG.PROP_DPR * ((GG.view && GG.view.zoom) || 1);
    var m = c.getTransform ? c.getTransform() : null;
    var s = m ? Math.sqrt(m.a * m.a + m.b * m.b) : 0;
    if (!(s > 0)) s = ((GG.view && GG.view.zoom) || 1) * Math.min(window.devicePixelRatio || 1, 2.5);
    return Math.round(s * 8) / 8;
  }
  function sprited(live, box) {
    return function (c, x, y, r, t, seed, col, p) {
      if (!p || typeof p !== 'object' || !c.drawImage) { live(c, x, y, r, t, seed, col, p); return; }
      var ripe = p.ripe == null ? 1 : Math.max(0, Math.min(1, p.ripe));
      /* in tenths, rounded DOWN: a plant never looks ready before it is */
      var rq = ripe >= 1 ? 1 : Math.floor(ripe * 10) / 10;
      var S = spriteScale(c);
      var cv = p._spr;
      if (!cv || p._sprFruit !== p.fruit || p._sprRipe !== rq || p._sprS !== S || p._sprR !== r || p._sprCol !== col) {
        var side = r * box[0] + 4, up = r * box[1] + 6, down = r * box[2] + 4;
        cv = cv || document.createElement('canvas');
        cv.width = Math.max(1, Math.ceil((side * 2) * S));
        cv.height = Math.max(1, Math.ceil((up + down) * S));
        var g = cv.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, cv.width, cv.height);
        g.setTransform(S, 0, 0, S, 0, 0);
        /* draw it as it is now, still: t = 0 and the crop at rq */
        var q = Object.create(p);
        q.ripe = rq;
        live(g, side, up, r, 0, seed, col, q);
        p._spr = cv; p._sprFruit = p.fruit; p._sprRipe = rq; p._sprS = S; p._sprR = r; p._sprCol = col;
        p._sprO = side; p._sprU = up;
        if (sprUsed.size >= SPR_CAP && !sprUsed.has(p)) {
          var old = sprUsed.keys().next().value;
          sprUsed.delete(old);
          if (old) old._spr = null;
        }
      }
      sprUsed.delete(p); sprUsed.set(p, true);
      /* land on whole device pixels, so the stamp is never resampled soft */
      var dx = Math.round((x - p._sprO) * S) / S, dy = Math.round((y - p._sprU) * S) / S;
      c.drawImage(cv, dx, dy, cv.width / S, cv.height / S);
    };
  }
  /* [half width, height above the base, depth below it], in units of r */
  P.vegPatch = sprited(vegPatchLive, [1.3, 2.35, 0.6]);
  P.wildBerry = sprited(wildBerryLive, [1.35, 2.4, 0.5]);
  P.pickFlower = sprited(pickFlowerLive, [1.5, 2.05, 0.4]);
  /* the unsprited versions, for anything that wants them moving */
  GG.PlantLive = { vegPatch: vegPatchLive, wildBerry: wildBerryLive, pickFlower: pickFlowerLive };
})(window.GG = window.GG || {});
