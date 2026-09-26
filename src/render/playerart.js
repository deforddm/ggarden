/* v1.20 - the player character, drawn from a look (src/data/looks.js).

   GG.PlayerArt.draw(c, look, sx, sy, dir, walkPhase, t, opts)
       the character in the world, feet at (sx, sy), about 36px tall at
       world scale. dir is 'down' | 'up' | 'left' | 'right'. opts:
       { moving, bob, lean, noHat }. The net and the fishing rod stay in
       GG.Player - this only draws the person.
   GG.PlayerArt.portrait(c, look, x, y, scale, t, opts)
       big, for the UI: feet at (x, y), `scale` times world size, breathing,
       blinking; opts { dir, wave }.
   GG.PlayerArt.head(c, look, x, y, scale, opts)
       just the head, for the little hair-style icons.

   Every pose is drawn once into an offscreen canvas at the canvas's real
   device resolution (with a soft dark outline so she stands out on busy
   grass) and then only stamped with drawImage, so the per-frame cost is one
   drawImage. The cache is keyed by look + scale and cleared when either
   changes; call invalidate() after editing a look in place.

   Coordinates while drawing: feet at (0, 0), up is -y, one unit = one world
   pixel. Only 'down', 'up' and 'right' are drawn; 'left' is 'right' mirrored. */
(function (GG) {
  'use strict';

  var TAU = Math.PI * 2;
  var BOX = { x0: -22, y0: -54, w: 44, h: 60 };
  var HX = 0, HY = -27.2, HRX = 10.5, HRY = 9.9;
  var INK = '#3a2430';
  var WALK_FRAMES = 8;

  /* ---------- colour ---------- */
  var rgbMemo = {};
  function rgb(h) {
    var m = rgbMemo[h];
    if (m) return m;
    var n = parseInt(h.slice(1), 16);
    m = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbMemo[h] = m;
    return m;
  }
  function hex(r, g, b) {
    return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
  }
  function mix(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
  }
  function lum(h) { var x = rgb(h); return (x[0] * 0.3 + x[1] * 0.59 + x[2] * 0.11) / 255; }
  function dark(h, k) { return mix(h, '#2e1838', k == null ? 0.24 : k); }
  function light(h, k) { return mix(h, '#ffffff', k == null ? 0.38 : k); }

  /* ---------- paths ---------- */
  function ell(c, x, y, rx, ry, rot) {
    rot = rot || 0;
    c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
    c.ellipse(x, y, rx, ry, rot, 0, TAU);
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function fillE(c, x, y, rx, ry, rot, col) {
    c.fillStyle = col; c.beginPath(); ell(c, x, y, rx, ry, rot); c.fill();
  }

  /* Fill a shape with a soft dark rim along the bottom right and a thin
     light rim along the top left - the whole "soft shading" look, for any
     path. `path` builds the path (no beginPath). */
  function shade3(c, path, base, dk, lt, k) {
    k = k || 1;
    c.save();
    c.beginPath(); path(c);
    c.fillStyle = dk || base; c.fill();
    c.clip();
    c.translate(-0.8 * k, -1.2 * k);
    c.beginPath(); path(c);
    if (lt) {
      c.fillStyle = lt; c.fill();
      c.clip();
      c.translate(0.55 * k, 0.8 * k);
      c.beginPath(); path(c);
    }
    c.fillStyle = base; c.fill();
    c.restore();
  }
  function line(c, x0, y0, x1, y1, col, w) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }

  /* ---------- a look, turned into colours ---------- */
  function resolve(look) {
    var L = GG.LOOKS;
    var lk = L.sanitize(L.copy(look || L.DEFAULT));
    var skin = L.SKIN_BY_ID[lk.skin].base;
    var hair = L.HAIR_COLOR_BY_ID[lk.hairCol].base;
    var out = L.OUTFIT_BY_ID[lk.outfit];
    var oc = out.colors[lk.outfitCol];
    var acc = L.ACC_COLOR_BY_ID[lk.accCol].base;
    var sl = lum(skin), hl = lum(hair);
    var R = {
      girl: lk.body === 'girl',
      skin: skin,
      skinD: mix(skin, sl > 0.5 ? '#c0506a' : '#3a1420', sl > 0.5 ? 0.2 : 0.3),
      skinL: light(skin, 0.3),
      blush: sl > 0.45 ? 'rgba(255,110,130,0.42)' : 'rgba(255,110,120,0.30)',
      hairId: lk.hair,
      h: hair,
      hD: hl > 0.6 ? mix(hair, '#8a5a30', 0.45) : dark(hair, hl < 0.2 ? 0.45 : 0.32),
      hL: hl < 0.2 ? mix(hair, '#b8a6c8', 0.34) : light(hair, 0.42),
      eye: L.EYE_BY_ID[lk.eyes].base,
      outfit: lk.outfit,
      a: oc.a, aD: dark(oc.a), aL: light(oc.a),
      b: oc.b, bD: dark(oc.b, 0.2), bL: light(oc.b),
      s: oc.s || null,
      accId: lk.acc,
      acc: acc, accD: dark(acc, 0.28), accL: light(acc, 0.5),
      ink: INK
    };
    R.brow = mix(hair, '#2a1a14', 0.35);
    return R;
  }

  /* ================================================================
     the body
     ================================================================ */
  var SKIN_LEGS = { sundress: 1, party: 1, overalls: 1, tee: 1, explorer: 1, sporty: 1 };

  function legCol(R) {
    if (R.outfit === 'hoodie' || R.outfit === 'jumper') return R.b;
    return R.skin;
  }

  function drawLeg(c, R, hx, hy, fx, fy, far) {
    var col = legCol(R);
    var d = mix(col, '#2e1838', 0.18);
    line(c, hx, hy, fx, fy - 1, far ? d : col, 3.7);
    if (!far) line(c, hx - 0.8, hy + 0.5, fx - 0.8, fy - 1.6, 'rgba(255,255,255,0.18)', 0.9);
    /* socks and boot tops */
    if (R.outfit === 'sporty') {
      line(c, fx + (hx - fx) * 0.12, fy - 1.3, fx + (hx - fx) * 0.5, fy - 4.6, far ? R.bD : R.b, 3.9);
      line(c, fx + (hx - fx) * 0.47, fy - 4.3, fx + (hx - fx) * 0.5, fy - 4.6, R.a, 3.9);
    } else if (R.outfit === 'explorer') {
      line(c, fx, fy - 1.2, fx + (hx - fx) * 0.25, fy - 2.9, far ? '#e4ddd0' : '#fbf7ee', 3.9);
    } else if (R.outfit === 'hoodie') {
      line(c, fx, fy - 1.4, fx + (hx - fx) * 0.12, fy - 2.2, far ? dark(R.b, 0.1) : light(R.b, 0.18), 4.1);
    }
  }

  function drawShoe(c, R, fx, fy, side, far) {
    var o = R.outfit;
    var kind = (o === 'sundress' || o === 'party') ? 'flat'
      : (o === 'raincoat') ? 'rainboot'
        : (o === 'explorer' || o === 'jumper') ? 'boot' : 'sneaker';
    var base, dx = side ? 1.1 : 0, rx = side ? 3.7 : 3.3;
    if (kind === 'flat') base = R.s || (o === 'party' ? R.a : '#5b4a8a');
    else if (kind === 'rainboot') base = R.b;
    else if (kind === 'boot') base = o === 'jumper' ? dark(R.a, 0.45) : '#7b4f2e';
    else base = '#fbfaf6';
    if (far) base = dark(base, 0.14);
    var dk = dark(base, 0.28), lt = light(base, 0.45);
    if (kind === 'rainboot') {
      shade3(c, function (c) { rr(c, fx - 2.3, fy - 6.4, 4.6, 6, 1.4); ell(c, fx + dx, fy + 0.4, rx, 2.2); }, base, dk, lt, 0.8);
      line(c, fx - 2.3, fy - 6.1, fx + 2.3, fy - 6.1, lt, 1);
      return;
    }
    if (kind === 'boot') {
      shade3(c, function (c) { rr(c, fx - 2.2, fy - 3.5, 4.4, 3.8, 1.2); ell(c, fx + dx, fy + 0.4, rx, 2.2); }, base, dk, lt, 0.8);
      line(c, fx - 2.1, fy - 3.2, fx + 2.1, fy - 3.2, dark(base, 0.35), 0.8);
      return;
    }
    shade3(c, function (c) { ell(c, fx + dx, fy + 0.4, rx, 2.2); }, base, dk, lt, 0.8);
    if (kind === 'sneaker') {
      /* a coloured stripe and a sole */
      c.strokeStyle = (o === 'tee' || o === 'overalls') ? R.a : (o === 'sporty' ? R.a : R.b);
      c.lineWidth = 1.1;
      c.beginPath(); c.ellipse(fx + dx, fy + 0.2, rx * 0.6, 1.2, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      line(c, fx + dx - rx + 0.8, fy + 2.1, fx + dx + rx - 0.8, fy + 2.1, '#d8d0c4', 0.8);
    } else {
      /* a little strap and a shine */
      line(c, fx - 1.6 + dx * 0.5, fy - 0.9, fx + 1.6 + dx * 0.5, fy - 0.9, dk, 0.8);
      fillE(c, fx + dx - 1, fy - 0.3, 0.9, 0.5, 0, 'rgba(255,255,255,0.55)');
    }
  }

  /* skirts, shorts, the coat and the tutu */
  function drawBottom(c, R, v) {
    var side = v === 'right', o = R.outfit;
    var cx = side ? -0.2 : 0;
    var w0 = side ? 4.9 : 6.3;
    function flare(hem, spread, top) {
      return function (c) {
        c.moveTo(cx - w0, top);
        c.lineTo(cx - w0 - spread, hem - 0.6);
        c.quadraticCurveTo(cx, hem + 1.4, cx + w0 + spread, hem - 0.6);
        c.lineTo(cx + w0, top);
        c.closePath();
      };
    }
    if (o === 'sundress') {
      var sk = flare(-4.8, side ? 2.4 : 3.1, -12);
      shade3(c, sk, R.a, R.aD, R.aL);
      /* polka dots */
      c.save(); c.beginPath(); sk(c); c.clip();
      c.fillStyle = mix(R.b, R.a, 0.25);
      for (var i = 0; i < 7; i++) {
        var px = cx - 6 + (i % 4) * 4 + (i > 3 ? 2 : 0), py = i > 3 ? -6.6 : -9.6;
        c.beginPath(); c.arc(px, py, 0.62, 0, TAU); c.fill();
      }
      c.restore();
      c.strokeStyle = R.b; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(cx - w0 - (side ? 2.1 : 2.8), -5.5);
      c.quadraticCurveTo(cx, -3.7, cx + w0 + (side ? 2.1 : 2.8), -5.5); c.stroke();
    } else if (o === 'jumper') {
      shade3(c, flare(-6.2, side ? 1.2 : 1.6, -12), R.a, R.aD, R.aL);
      c.strokeStyle = R.aD; c.lineWidth = 0.7;
      for (var j = -3; j <= 3; j++) {
        if (side && Math.abs(j) > 2) continue;
        c.beginPath(); c.moveTo(cx + j * 1.9, -6.6); c.lineTo(cx + j * 2.1, -5.4); c.stroke();
      }
    } else if (o === 'raincoat') {
      shade3(c, flare(-5.0, side ? 2.2 : 2.8, -12.5), R.a, R.aD, R.aL);
      if (!side && v !== 'up') {
        /* pockets */
        line(c, -6.2, -8.6, -3.2, -8.6, R.aD, 1);
        line(c, 3.2, -8.6, 6.2, -8.6, R.aD, 1);
      } else if (side) line(c, 0.2, -8.6, 3.0, -8.6, R.aD, 1);
      if (v !== 'up' && !side) line(c, 0, -12, 0, -5.2, R.aD, 0.8);
    } else if (o === 'party') {
      /* a tutu: two fluffy layers */
      var lay = function (hem, spread, col, colD) {
        shade3(c, function (c) {
          var L0 = cx - w0 - spread, L1 = cx + w0 + spread, n = side ? 4 : 5;
          c.moveTo(cx - w0, -12.2);
          c.lineTo(L0, hem - 1.6);
          for (var k = 0; k < n; k++) {
            var xa = L0 + (L1 - L0) * k / n, xb = L0 + (L1 - L0) * (k + 1) / n;
            c.quadraticCurveTo((xa + xb) / 2, hem + 1.6, xb, hem - 1.2);
          }
          c.lineTo(cx + w0, -12.2);
          c.closePath();
        }, col, colD, light(col, 0.5), 0.8);
      };
      lay(-6.2, side ? 4 : 5.6, R.b, dark(R.b, 0.16));
      lay(-8.2, side ? 3 : 4.2, light(R.b, 0.35), dark(R.b, 0.08));
      c.fillStyle = 'rgba(255,255,255,0.9)';
      for (var q = 0; q < 4; q++) { c.beginPath(); c.arc(cx - 5 + q * 3.3, -8.2 + (q % 2) * 1.6, 0.45, 0, TAU); c.fill(); }
    } else {
      /* shorts */
      var col = o === 'explorer' ? '#c79f63' : (o === 'tee' ? R.b : R.a);
      var hem = o === 'sporty' ? -6.4 : -6.8;
      var sh = function (c) {
        if (side) { rr(c, cx - 4.9, -12.2, 9.8, 12.2 + hem, 2); return; }
        c.moveTo(-6.3, -12.2); c.lineTo(6.3, -12.2);
        c.lineTo(6.9, hem); c.lineTo(0.9, hem); c.lineTo(0, hem + 1.8 - 0.4);
        c.lineTo(-0.9, hem); c.lineTo(-6.9, hem); c.closePath();
      };
      shade3(c, sh, col, dark(col), light(col));
      if (o === 'sporty') {
        if (side) line(c, cx, -11.6, cx, hem + 0.4, R.b, 1.1);
        else { line(c, -6.4, -11.6, -6.8, hem + 0.3, R.b, 1.1); line(c, 6.4, -11.6, 6.8, hem + 0.3, R.b, 1.1); }
      } else {
        c.strokeStyle = dark(col, 0.32); c.lineWidth = 0.7;
        c.beginPath();
        if (side) { c.moveTo(cx - 4.7, hem + 0.9); c.lineTo(cx + 4.7, hem + 0.9); }
        else { c.moveTo(-6.7, hem + 0.9); c.lineTo(-1, hem + 0.9); c.moveTo(1, hem + 0.9); c.lineTo(6.7, hem + 0.9); }
        c.stroke();
      }
    }
  }

  function sleeveOf(o) {
    if (o === 'hoodie' || o === 'raincoat' || o === 'jumper') return 'long';
    if (o === 'sundress' || o === 'party') return 'none';
    return 'short';
  }
  function sleeveCol(R) {
    var o = R.outfit;
    if (o === 'overalls' || o === 'explorer') return R.b;
    return R.a;
  }

  function drawArm(c, R, x0, y0, x1, y1, far) {
    var sl = sleeveOf(R.outfit), sc = sleeveCol(R);
    var skin = far ? R.skinD : R.skin;
    if (far) sc = dark(sc, 0.14);
    if (sl === 'long') {
      line(c, x0, y0, x1, y1, R.ink, 4.8);
      line(c, x0, y0, x1, y1, sc, 3.8);
      var cx0 = x0 + (x1 - x0) * 0.82, cy0 = y0 + (y1 - y0) * 0.82;
      line(c, cx0, cy0, x0 + (x1 - x0) * 0.9, y0 + (y1 - y0) * 0.9, R.outfit === 'raincoat' ? R.b : dark(sc, 0.18), 4.1);
    } else {
      line(c, x0, y0, x1, y1, skin, 3.2);
      if (sl === 'short') {
        var mx = x0 + (x1 - x0) * 0.42, my = y0 + (y1 - y0) * 0.42;
        line(c, x0, y0, mx, my, R.ink, 5);
        line(c, x0, y0, mx, my, sc, 4.1);
      }
    }
    /* the hand */
    fillE(c, x1, y1 + 0.4, 2.05, 2.05, 0, skin);
    fillE(c, x1 + 0.6, y1 + 0.9, 1.1, 1.0, 0, mix(skin, '#2e1838', 0.12));
    fillE(c, x1 - 0.2, y1 + 0.2, 1.3, 1.2, 0, skin);
  }

  function torsoPath(v) {
    var side = v === 'right';
    var tx = side ? -0.2 : 0, tw = side ? 9.8 : 12.8;
    return function (c) { rr(c, tx - tw / 2, -21, tw, 11.6, 4.4); };
  }

  function drawTorso(c, R, v) {
    var side = v === 'right', back = v === 'up', o = R.outfit;
    var tp = torsoPath(v);
    var cx = side ? -0.2 : 0, hw = side ? 4.9 : 6.4;
    var base = (o === 'overalls' || o === 'explorer') ? R.b : R.a;
    shade3(c, tp, base, dark(base), light(base));
    c.save(); c.beginPath(); tp(c); c.clip();
    if (o === 'sundress') {
      /* white belt with a little bow, and a scalloped collar */
      c.fillStyle = R.b; c.fillRect(cx - hw, -13.6, hw * 2, 1.9);
      if (!back) {
        var bx = side ? 2.4 : 0;
        var bwc = lum(R.b) > 0.9 ? R.aD : R.bD;
        fillE(c, bx - 1.3, -12.7, 1.3, 0.9, 0.3, bwc); fillE(c, bx + 1.3, -12.7, 1.3, 0.9, -0.3, bwc);
        fillE(c, bx, -12.7, 0.6, 0.6, 0, R.a);
        if (!side) { fillE(c, -2.2, -20.6, 2.5, 1.7, 0.2, R.b); fillE(c, 2.2, -20.6, 2.5, 1.7, -0.2, R.b); }
      }
    } else if (o === 'party') {
      c.fillStyle = 'rgba(255,255,255,0.85)';
      var st = [[-3, -17], [2.6, -15.2], [-0.4, -13.4], [3.4, -18.4]];
      for (var i = 0; i < st.length; i++) {
        if (side && st[i][0] < -1) continue;
        star(c, st[i][0] + (side ? 0.6 : 0), st[i][1], 0.9);
      }
      c.fillStyle = R.b; c.fillRect(cx - hw, -12.6, hw * 2, 1.1);
    } else if (o === 'jumper') {
      /* a knitted band with little dots */
      c.fillStyle = R.b; c.fillRect(cx - hw, -17.4, hw * 2, 2.6);
      c.fillStyle = light(R.a, 0.55);
      for (var k = -3; k <= 3; k++) { c.beginPath(); c.arc(cx + k * 2, -16.1, 0.5, 0, TAU); c.fill(); }
      c.fillStyle = R.aD; c.fillRect(cx - hw, -20.8, hw * 2, 0.9);
    } else if (o === 'tee') {
      if (!back) { c.fillStyle = light(R.b, 0.1); star(c, side ? 2 : 0, -15.8, 2.4); }
    } else if (o === 'sporty') {
      c.fillStyle = R.b;
      if (!side) { c.fillRect(-6.4, -21, 1.4, 12); c.fillRect(5, -21, 1.4, 12); }
      else c.fillRect(-1, -21, 1.4, 12);
      if (!back) {
        c.strokeStyle = R.b; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(cx - 2.6 + (side ? 2.4 : 0), -21); c.lineTo(cx + (side ? 2.6 : 0), -18.2);
        c.lineTo(cx + 2.6 + (side ? 2.4 : 0), -21); c.stroke();
        if (!side) { c.fillStyle = R.b; c.font = 'bold 6px sans-serif'; c.textAlign = 'center'; c.fillText('7', 0.1, -11.6); }
      } else { c.fillStyle = R.b; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('7', 0.1, -11.2); }
    } else if (o === 'hoodie') {
      if (!back) {
        var px = side ? 1 : 0, pw = side ? 3.6 : 4.4;
        shade3(c, function (c) { rr(c, px - pw, -15.6, pw * 2, 4.4, 1.8); }, R.aD, dark(R.a, 0.36), null, 0.6);
        if (!side) { line(c, -1.6, -20.4, -1.9, -17.1, '#fbf7ee', 0.7); line(c, 1.6, -20.4, 1.9, -17.1, '#fbf7ee', 0.7); }
      }
      c.fillStyle = R.aD; c.fillRect(cx - hw, -10.6, hw * 2, 1.2);
    } else if (o === 'raincoat') {
      if (!back) {
        var bx2 = side ? 2.2 : 0;
        line(c, bx2, -20.6, bx2, -9, R.aD, 0.8);
        for (var b2 = 0; b2 < 3; b2++) fillE(c, bx2 + 1.5, -18.6 + b2 * 3, 0.75, 0.75, 0, R.b);
      }
    } else if (o === 'overalls') {
      if (!back) {
        var ox = side ? 1.4 : 0, ow = side ? 3.2 : 4.3;
        shade3(c, function (c) { rr(c, ox - ow, -18.2, ow * 2, 8.4, 1.3); }, R.a, R.aD, R.aL, 0.6);
        /* straps and buttons */
        if (!side) {
          line(c, -3.6, -17.6, -4.6, -21.5, R.a, 1.7); line(c, 3.6, -17.6, 4.6, -21.5, R.a, 1.7);
          fillE(c, -3.5, -17.2, 0.8, 0.8, 0, '#ffd45c'); fillE(c, 3.5, -17.2, 0.8, 0.8, 0, '#ffd45c');
          c.strokeStyle = R.aD; c.lineWidth = 0.6; c.strokeRect(-2, -15.8, 4, 2.8);
        } else {
          line(c, 1.2, -17.6, -0.6, -21.5, R.a, 1.7);
          fillE(c, 1.4, -17.2, 0.8, 0.8, 0, '#ffd45c');
        }
      } else {
        /* the straps cross on the back */
        line(c, -4.4, -21.4, 3.6, -12, R.a, 1.7); line(c, 4.4, -21.4, -3.6, -12, R.a, 1.7);
        c.fillStyle = R.a; c.fillRect(-6.4, -12.6, 12.8, 3.6);
      }
    } else if (o === 'explorer') {
      /* the vest: two front panels with pockets, or a whole back */
      if (back) {
        shade3(c, function (c) { rr(c, -6.4, -21, 12.8, 11.6, 4.4); }, R.a, R.aD, R.aL);
        line(c, -4, -18, 4, -18, R.aD, 0.7);
      } else if (side) {
        shade3(c, function (c) { rr(c, -5.2, -21, 7.4, 11.6, 3.6); }, R.a, R.aD, R.aL);
        c.strokeStyle = R.aD; c.lineWidth = 0.7; c.strokeRect(-1.6, -16.4, 3.2, 3);
      } else {
        shade3(c, function (c) { rr(c, -6.6, -21, 5.2, 11.6, 3); rr(c, 1.4, -21, 5.2, 11.6, 3); }, R.a, R.aD, R.aL);
        c.strokeStyle = R.aD; c.lineWidth = 0.7;
        c.strokeRect(-5.4, -16.4, 3, 2.8); c.strokeRect(2.4, -16.4, 3, 2.8);
        line(c, -5.4, -16.4, -2.4, -16.4, R.aD, 1.1); line(c, 2.4, -16.4, 5.4, -16.4, R.aD, 1.1);
        fillE(c, -3.9, -15.6, 0.45, 0.45, 0, '#e8d8a8'); fillE(c, 3.9, -15.6, 0.45, 0.45, 0, '#e8d8a8');
        /* the shirt collar */
        c.fillStyle = light(R.b, 0.4);
        c.beginPath(); c.moveTo(-2.8, -21); c.lineTo(0, -18.8); c.lineTo(-0.9, -21); c.fill();
        c.beginPath(); c.moveTo(2.8, -21); c.lineTo(0, -18.8); c.lineTo(0.9, -21); c.fill();
      }
    }
    c.restore();
  }

  function star(c, x, y, r) {
    c.beginPath();
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 ? r * 0.45 : r;
      if (k === 0) c.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      else c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.closePath(); c.fill();
  }

  /* hoods lie behind the neck from the front, and on the back from behind */
  function drawHood(c, R, v) {
    var o = R.outfit;
    if (o !== 'hoodie' && o !== 'raincoat') return;
    if (v === 'up') {
      shade3(c, function (c) { ell(c, 0, -18.6, 6.2, 4.2); }, R.aD, dark(R.a, 0.4), R.a, 0.7);
      c.strokeStyle = dark(R.a, 0.45); c.lineWidth = 0.7;
      c.beginPath(); c.ellipse(0, -19.4, 4, 2.4, 0, 0, Math.PI); c.stroke();
    } else if (v === 'right') {
      shade3(c, function (c) { ell(c, -4.4, -19.8, 3.4, 3.2); }, R.aD, dark(R.a, 0.4), R.a, 0.6);
    } else {
      shade3(c, function (c) { ell(c, 0, -20.2, 7.4, 2.6); }, R.aD, dark(R.a, 0.4), null, 0.5);
    }
  }

  function drawBody(c, R, v, ph, o) {
    var side = v === 'right';
    var s = ph == null ? 0 : Math.sin(ph), co = ph == null ? 0 : Math.cos(ph);
    var armS = s * 2.1;
    if (side) {
      var nf = ph == null ? 1.3 : s * 3.4, ff = ph == null ? -1.5 : -s * 3.4;
      var nl = ph == null ? 0 : Math.max(0, co) * 1.5, fl = ph == null ? 0 : Math.max(0, -co) * 1.5;
      /* far arm and leg first, a shade darker */
      if (!o.wave) drawArm(c, R, -0.4, -18.6, -0.4 + (ph == null ? -0.8 : s * 3.4), -11.2, true);
      drawLeg(c, R, -0.6, -10.2, ff, -1.2 - fl, true);
      drawShoe(c, R, ff, -1.2 - fl, true, true);
      drawLeg(c, R, 0.4, -10.2, nf, -1.2 - nl, false);
      drawShoe(c, R, nf, -1.2 - nl, true, false);
      drawBottom(c, R, v);
      drawTorso(c, R, v);
      drawHood(c, R, v);
      drawArm(c, R, 0.4, -18.6, 0.4 + (ph == null ? 0.9 : -s * 3.4), -11.2, false);
      return;
    }
    var lL = Math.max(0, s) * 2.0, lR = Math.max(0, -s) * 2.0;
    drawLeg(c, R, -3.0, -10.2, -3.1, -1.2 - lL, false);
    drawLeg(c, R, 3.0, -10.2, 3.1, -1.2 - lR, false);
    drawShoe(c, R, -3.1, -1.2 - lL, false, false);
    drawShoe(c, R, 3.1, -1.2 - lR, false, false);
    drawBottom(c, R, v);
    drawTorso(c, R, v);
    if (v === 'up') drawHood(c, R, v);
    /* arms. Waving uses her right hand (our left when she faces us). */
    if (o.wave != null && v === 'down') {
      var w = Math.sin(o.wave) * 2.4;
      drawArm(c, R, -5.2, -18.8, -11.2 + w * 0.4, -26.6 + Math.abs(w) * 0.2, false);
      fillE(c, -11.2 + w * 0.4, -27.4, 2.4, 2.4, 0, R.skin);
    } else {
      drawArm(c, R, -5.3, -18.8, -8.2, -11.2 + armS * 0.7, false);
    }
    drawArm(c, R, 5.3, -18.8, 8.2, -11.2 - armS * 0.7, false);
    if (v === 'down') drawHood(c, R, v);
  }

  /* ================================================================
     the head
     ================================================================ */
  function headPath(side) {
    var hx = side ? HX + 0.6 : HX;
    return function (c) { ell(c, hx, HY, HRX, HRY); };
  }

  function drawNeck(c, R) {
    c.fillStyle = R.skinD;
    c.fillRect(-1.9, -20.4, 3.8, 2.4);
  }

  function drawEars(c, R, v) {
    if (v === 'right') {
      shade3(c, function (c) { ell(c, -2.6, -25.9, 2.1, 2.5); }, R.skin, R.skinD, null, 0.6);
      c.strokeStyle = R.skinD; c.lineWidth = 0.6;
      c.beginPath(); c.arc(-2.4, -25.8, 1.1, -1.2, 1.4); c.stroke();
      return;
    }
    fillE(c, -10.2, -26, 2.1, 2.5, 0, R.skinD);
    fillE(c, 10.2, -26, 2.1, 2.5, 0, R.skinD);
    fillE(c, -10.0, -26.2, 1.5, 1.9, 0, R.skin);
    fillE(c, 10.0, -26.2, 1.5, 1.9, 0, R.skin);
  }

  function drawFace(c, R, v, blink) {
    var side = v === 'right';
    var fx = side ? 2.9 : 0;
    var ey = -25.4;
    var ex0 = side ? fx - 2.8 : -3.5, ex1 = side ? fx + 3.4 : 3.5;
    /* brows (bangs will cover them on some styles) */
    c.strokeStyle = R.brow; c.lineWidth = R.girl ? 0.75 : 1.0; c.lineCap = 'round';
    c.beginPath(); c.arc(ex0, ey - 1.4, 2.1, Math.PI * 1.25, Math.PI * 1.72); c.stroke();
    c.beginPath(); c.arc(ex1, ey - 1.4, side ? 1.7 : 2.1, Math.PI * 1.28, Math.PI * 1.75); c.stroke();
    /* cheeks */
    c.fillStyle = R.blush;
    if (side) {
      c.beginPath(); ell(c, fx - 4.2, -22.6, 2.0, 1.25); c.fill();
      c.beginPath(); ell(c, fx + 5.5, -22.4, 1.0, 0.9); c.fill();
    } else {
      c.beginPath(); ell(c, -6.1, -22.6, 2.1, 1.25); ell(c, 6.1, -22.6, 2.1, 1.25); c.fill();
    }
    eye(c, R, ex0, ey, 1, blink, -1);
    eye(c, R, ex1, ey, side ? 0.82 : 1, blink, 1);
    /* nose */
    fillE(c, fx + (side ? 1.4 : 0), -23.5, 0.7, 0.45, 0, mix(R.skin, '#8a3040', 0.22));
    /* a big open smile */
    var mx = fx + (side ? 1.2 : 0);
    c.fillStyle = '#9c3446';
    c.beginPath();
    c.moveTo(mx - 1.9, -21.9);
    c.quadraticCurveTo(mx, -21.3, mx + 1.9, -21.9);
    c.quadraticCurveTo(mx + 1.6, -19.2, mx, -19.3);
    c.quadraticCurveTo(mx - 1.6, -19.2, mx - 1.9, -21.9);
    c.closePath(); c.fill();
    fillE(c, mx + 0.1, -19.95, 1.05, 0.55, 0, '#ff8c98');
  }

  function eye(c, R, x, y, wk, blink, outer) {
    if (blink) {
      c.strokeStyle = '#2a1a18'; c.lineWidth = 0.85; c.lineCap = 'round';
      c.beginPath(); c.arc(x, y - 0.9, 1.6 * wk, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
      return;
    }
    var rx = 1.7 * wk, ry = 2.2;
    fillE(c, x, y, rx, ry, 0, '#24161a');
    fillE(c, x, y + 0.5, rx * 0.76, ry * 0.7, 0, R.eye);
    fillE(c, x, y + 0.9, rx * 0.5, ry * 0.4, 0, light(R.eye, 0.28));
    fillE(c, x, y + 0.35, rx * 0.36, ry * 0.36, 0, '#1a0f12');
    fillE(c, x - 0.55 * wk, y - 0.85, 0.72 * wk, 0.72, 0, '#ffffff');
    fillE(c, x + 0.55 * wk, y + 0.85, 0.32, 0.32, 0, 'rgba(255,255,255,0.9)');
    if (R.girl) {
      /* two little lashes at the outer corner */
      c.strokeStyle = '#24161a'; c.lineWidth = 0.6; c.lineCap = 'round';
      var ox = x + outer * rx * 0.8, oy = y - ry * 0.55;
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + outer * 1.2, oy - 0.7); c.stroke();
      c.beginPath(); c.moveTo(ox - outer * 0.4, oy - 0.6); c.lineTo(ox + outer * 0.5, oy - 1.6); c.stroke();
    }
  }

  /* ================================================================
     hair
     ================================================================ */

  /* The hair on the head itself, as a path, for each fringe kind.
     front view: the top of the head down to the fringe line */
  function capFront(kind) {
    return function (c) {
      var rx = 11.0, ry = 10.5, cy = -27.5, e = 0.44;
      if (kind === 'short' || kind === 'buzz' || kind === 'spiky' || kind === 'curlyS') e = 0.2;
      if (kind === 'buzz') { rx = 10.7; ry = 10.2; }
      c.moveTo(-rx * Math.cos(e), cy + ry * Math.sin(e));
      c.ellipse(0, cy, rx, ry, 0, Math.PI - e, TAU + e);
      var sy = cy + ry * Math.sin(e);
      if (kind === 'bangs') {
        c.lineTo(9.6, -25.6);
        c.quadraticCurveTo(9.2, -29.6, 7.0, -30.2);
        c.quadraticCurveTo(5.3, -28.9, 3.6, -30.0);
        c.quadraticCurveTo(1.8, -29.0, 0, -30.1);
        c.quadraticCurveTo(-1.8, -29.0, -3.6, -30.0);
        c.quadraticCurveTo(-5.3, -28.9, -7.0, -30.2);
        c.quadraticCurveTo(-9.2, -29.6, -9.6, -25.6);
      } else if (kind === 'part') {
        c.lineTo(9.7, -23.2);
        c.quadraticCurveTo(9.4, -30.5, 1.2, -33.4);
        c.lineTo(0, -32.3);
        c.lineTo(-1.2, -33.4);
        c.quadraticCurveTo(-9.4, -30.5, -9.7, -23.2);
      } else if (kind === 'side') {
        c.lineTo(9.8, -24.2);
        c.quadraticCurveTo(9.4, -30.2, 5.6, -31.2);
        c.quadraticCurveTo(1.2, -28.2, -4.6, -28.8);
        c.quadraticCurveTo(-7.4, -29.2, -8.6, -31.6);
        c.quadraticCurveTo(-9.6, -28.4, -9.8, -24.8);
      } else if (kind === 'spiky') {
        c.lineTo(9.3, -29.4);
        var pts = [7.4, -31.6, 5.6, -29.4, 3.4, -31.9, 1.2, -29.6, -1.2, -32.0, -3.4, -29.7, -5.6, -31.8, -7.6, -29.6, -9.3, -30.2];
        for (var i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
      } else if (kind === 'curly' || kind === 'curlyS') {
        var n = 6, x0 = kind === 'curly' ? 9.8 : 9.6, y0 = kind === 'curly' ? -26 : -28.4;
        c.lineTo(x0, y0);
        for (var j = 0; j < n; j++) {
          var xa = 8.6 - j * (17.2 / n), xb = 8.6 - (j + 1) * (17.2 / n);
          var ya = -30.3 + Math.abs(j - 2.5) * 0.25;
          c.quadraticCurveTo((xa + xb) / 2, ya + 2.4, xb, ya);
        }
        c.lineTo(-x0, y0);
      } else { /* short, buzz: a neat hairline */
        var top = kind === 'buzz' ? -31.6 : -30.9;
        c.lineTo(10.2, sy - 1.8);
        c.quadraticCurveTo(9.4, top + 0.4, 6.4, top);
        c.quadraticCurveTo(2.6, top - 0.9, 0.4, top + (kind === 'buzz' ? 0 : 0.8));
        c.quadraticCurveTo(-3.6, top - 1.1, -6.4, top);
        c.quadraticCurveTo(-9.4, top + 0.4, -10.2, sy - 1.8);
      }
      c.closePath();
    };
  }

  /* side view (facing right): the back of the head plus a fringe at the front */
  function capSide(kind) {
    return function (c) {
      var cx = 0.4, cy = -27.5, rx = 11.0, ry = 10.5;
      var nape = (kind === 'short' || kind === 'buzz' || kind === 'spiky' || kind === 'curlyS') ? -21.4 : -20.2;
      if (kind === 'buzz') { rx = 10.8; ry = 10.2; }
      c.moveTo(cx + rx * Math.cos(-0.5), cy + ry * Math.sin(-0.5));
      c.ellipse(cx, cy, rx, ry, 0, -0.5, Math.PI - 0.72, true);
      c.lineTo(-5.4, nape);
      c.quadraticCurveTo(-3.6, nape + 0.2, -3.2, -23.4);
      c.quadraticCurveTo(-1.6, -27.4, 1.2, -28.4);
      if (kind === 'bangs') {
        c.quadraticCurveTo(3.8, -28.4, 5.2, -29.6);
        c.quadraticCurveTo(7.4, -28.6, 9.2, -29.8);
        c.quadraticCurveTo(10.6, -30.6, 10.7, -31.4);
      } else if (kind === 'side') {
        c.quadraticCurveTo(5.4, -27.2, 10.2, -28.2);
        c.quadraticCurveTo(10.6, -30.4, 10.3, -32.2);
      } else if (kind === 'part') {
        c.quadraticCurveTo(6, -31.2, 10.2, -32.4);
      } else if (kind === 'spiky') {
        c.lineTo(4.4, -29.4); c.lineTo(6.2, -31.3); c.lineTo(7.8, -29.8); c.lineTo(10.4, -32.2);
      } else if (kind === 'curly' || kind === 'curlyS') {
        c.quadraticCurveTo(3.6, -27.2, 4.6, -29.4);
        c.quadraticCurveTo(6.6, -27.6, 7.6, -30.2);
        c.quadraticCurveTo(10, -29.4, 10.3, -32.2);
      } else {
        c.quadraticCurveTo(6, -30.2, 10.3, -31.6);
      }
      c.closePath();
    };
  }

  /* back view: the whole head is hair */
  function capBack(kind) {
    return function (c) {
      var rx = kind === 'buzz' ? 10.8 : 11.0, ry = kind === 'buzz' ? 10.2 : 10.5;
      var nape = (kind === 'short' || kind === 'buzz' || kind === 'spiky' || kind === 'curlyS') ? -20.8 : -19.6;
      c.moveTo(-rx * Math.cos(0.4), -27.5 + ry * Math.sin(0.4));
      c.ellipse(0, -27.5, rx, ry, 0, Math.PI - 0.4, TAU + 0.4);
      c.quadraticCurveTo(8.6, nape, 4, nape);
      c.lineTo(-4, nape);
      c.quadraticCurveTo(-8.6, nape, -rx * Math.cos(0.4), -27.5 + ry * Math.sin(0.4));
      c.closePath();
    };
  }

  var FRINGE = {
    pigtails: 'bangs', ponytail: 'part', long: 'part', bob: 'bangs', buns: 'part',
    braids: 'part', curly: 'curly', puffs: 'part', afro: 'curly', short: 'short',
    spiky: 'spiky', swoop: 'side', curlyshort: 'curlyS', buzz: 'buzz'
  };

  function hairShine(c, R, v, kind) {
    /* the shiny band on top of the head */
    c.save();
    c.strokeStyle = R.hL; c.lineCap = 'round';
    c.globalAlpha = kind === 'buzz' ? 0.35 : 0.75;
    c.lineWidth = 1.5;
    var cx = v === 'right' ? -0.4 : 0;
    c.beginPath(); c.ellipse(cx, -28, 7.8, 6.6, 0, Math.PI * 1.18, Math.PI * 1.5); c.stroke();
    c.lineWidth = 1.1;
    c.beginPath(); c.ellipse(cx, -28, 7.8, 6.6, 0, Math.PI * 1.58, Math.PI * 1.72); c.stroke();
    c.restore();
  }

  function strands(c, R, v, kind) {
    c.save();
    c.strokeStyle = R.hD; c.lineWidth = 0.6; c.lineCap = 'round'; c.globalAlpha = 0.8;
    if (kind === 'buzz') {
      /* nothing - a buzz cut is smooth */
    } else if (v === 'up') {
      for (var s = -1; s <= 1; s++) {
        c.beginPath(); c.moveTo(s * 3.2, -35.2); c.quadraticCurveTo(s * 5, -29, s * 4.6, -21.4); c.stroke();
      }
    } else if (v === 'right') {
      c.beginPath(); c.moveTo(-2, -36.5); c.quadraticCurveTo(-7.5, -32, -8.2, -24); c.stroke();
      c.beginPath(); c.moveTo(3, -37); c.quadraticCurveTo(-3, -33, -4.2, -26); c.stroke();
    } else if (kind !== 'curly' && kind !== 'curlyS') {
      c.beginPath(); c.moveTo(-4, -35.8); c.quadraticCurveTo(-7.4, -32.5, -8, -28); c.stroke();
      c.beginPath(); c.moveTo(4.4, -35.8); c.quadraticCurveTo(7.4, -32.5, 8, -28); c.stroke();
    }
    c.restore();
  }

  function hairShape(c, R, path, k) {
    shade3(c, path, R.h, R.hD, R.hL, k || 1);
  }

  /* bumpy round mass: an afro, a puff, a curl cluster */
  function puff(c, R, x, y, r, n) {
    n = n || 10;
    hairShape(c, R, function (c) {
      ell(c, x, y, r * 0.86, r * 0.86);
      for (var i = 0; i < n; i++) {
        var a = i / n * TAU;
        ell(c, x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, r * 0.3, r * 0.3);
      }
    }, 1.1);
    c.save(); c.strokeStyle = R.hD; c.globalAlpha = 0.5; c.lineWidth = 0.55; c.lineCap = 'round';
    for (var j = 0; j < n; j++) {
      var b = j / n * TAU + 0.3, rr3 = r * (j % 2 ? 0.45 : 0.62);
      c.beginPath(); c.arc(x + Math.cos(b) * rr3, y + Math.sin(b) * rr3, r * 0.14, 0.3, 2.6); c.stroke();
    }
    c.restore();
  }

  function tie(c, R, x, y, rot, w) {
    w = w || 2.6;
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    shade3(c, function (c) { rr(c, -w / 2, -1.1, w, 2.2, 1.1); }, R.acc, R.accD, R.accL, 0.5);
    c.restore();
  }

  function braid(c, R, x0, y0, x1, y1, n) {
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      var r = 2.3 - t * 0.6;
      (function (x, y, r, i) {
        hairShape(c, R, function (c) { ell(c, x + (i % 2 ? 0.4 : -0.4), y, r, r * 0.95); }, 0.6);
      })(x, y, r, i);
    }
    tie(c, R, x1, y1 + 1.6, 0, 2.6);
    hairShape(c, R, function (c) {
      c.moveTo(x1 - 1.3, y1 + 2.4); c.lineTo(x1 + 1.3, y1 + 2.4); c.lineTo(x1 + 0.4, y1 + 4.6); c.lineTo(x1 - 0.4, y1 + 4.6); c.closePath();
    }, 0.5);
  }

  /* One function per style. `layer` is:
       'behind' - before the body (long hair down the back, seen from the front)
       'back'   - after the body, before the head
       'over'   - after the hair cap (things seen from behind, braids in front) */
  var STYLES = {
    pigtails: function (c, R, v, layer) {
      if (v === 'down' && layer === 'back') {
        hairShape(c, R, function (c) { ell(c, -12.3, -22.8, 3.6, 6.4, 0.32); ell(c, 12.3, -22.8, 3.6, 6.4, -0.32); });
      } else if (v === 'down' && layer === 'over') {
        tie(c, R, -10.4, -28.2, 0.9); tie(c, R, 10.4, -28.2, -0.9);
      } else if (v === 'right' && layer === 'back') {
        hairShape(c, R, function (c) { ell(c, -11.4, -23.2, 3.6, 6.4, 0.42); });
        tie(c, R, -9.2, -28.2, 0.9);
      } else if (v === 'up' && layer === 'over') {
        hairShape(c, R, function (c) { ell(c, -12.3, -22.8, 3.6, 6.4, 0.32); ell(c, 12.3, -22.8, 3.6, 6.4, -0.32); });
        tie(c, R, -10.4, -28.2, 0.9); tie(c, R, 10.4, -28.2, -0.9);
        line(c, 0, -37.6, 0, -21, R.hD, 0.8);
      }
    },
    ponytail: function (c, R, v, layer) {
      if (v === 'down' && layer === 'back') {
        hairShape(c, R, function (c) {
          c.moveTo(6, -34); c.quadraticCurveTo(15.6, -33, 13.2, -17.4);
          c.quadraticCurveTo(12, -22, 8, -26); c.closePath();
        });
      } else if (v === 'right' && layer === 'back') {
        hairShape(c, R, function (c) {
          c.moveTo(-6.4, -35.4); c.quadraticCurveTo(-17.8, -33, -14.6, -16.6);
          c.quadraticCurveTo(-13.2, -24, -6.6, -28.2); c.closePath();
        });
        tie(c, R, -8.2, -33.4, 0.6);
      } else if (v === 'up' && layer === 'over') {
        hairShape(c, R, function (c) {
          c.moveTo(-3, -33); c.quadraticCurveTo(-5.2, -22, -1.6, -15.2);
          c.lineTo(0.4, -14.6); c.quadraticCurveTo(4.8, -22, 3, -33); c.closePath();
        });
        line(c, 0, -30, -0.4, -17, R.hD, 0.6);
        tie(c, R, 0, -33.2, 0, 4.2);
      }
    },
    long: function (c, R, v, layer) {
      if (v === 'down' && layer === 'behind') {
        hairShape(c, R, function (c) {
          c.moveTo(-10.6, -30); c.quadraticCurveTo(-13.4, -20, -12.2, -12.2);
          c.quadraticCurveTo(-9.6, -10.4, -7, -12.4); c.lineTo(7, -12.4);
          c.quadraticCurveTo(9.6, -10.4, 12.2, -12.2); c.quadraticCurveTo(13.4, -20, 10.6, -30); c.closePath();
        });
      } else if (v === 'down' && layer === 'over') {
        /* locks falling in front of the shoulders */
        hairShape(c, R, function (c) {
          c.moveTo(-10.4, -27); c.quadraticCurveTo(-11.8, -19, -10.2, -14.6); c.quadraticCurveTo(-8.6, -17, -8.4, -24); c.closePath();
          c.moveTo(10.4, -27); c.quadraticCurveTo(11.8, -19, 10.2, -14.6); c.quadraticCurveTo(8.6, -17, 8.4, -24); c.closePath();
        }, 0.7);
      } else if (v === 'right' && layer === 'back') {
        hairShape(c, R, function (c) {
          c.moveTo(-3, -36); c.quadraticCurveTo(-13.6, -30, -11.6, -12.4);
          c.quadraticCurveTo(-7.4, -10.8, -3.6, -13); c.quadraticCurveTo(-5, -18, -2, -24); c.closePath();
        });
      } else if (v === 'up' && layer === 'over') {
        hairShape(c, R, function (c) {
          c.moveTo(-10.8, -30); c.quadraticCurveTo(-12.8, -20, -11.6, -12.2);
          c.quadraticCurveTo(-5.8, -10.4, 0, -11.6); c.quadraticCurveTo(5.8, -10.4, 11.6, -12.2);
          c.quadraticCurveTo(12.8, -20, 10.8, -30); c.closePath();
        });
        c.save(); c.strokeStyle = R.hD; c.lineWidth = 0.6; c.globalAlpha = 0.7;
        for (var i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 3, -30); c.quadraticCurveTo(i * 3.8, -22, i * 3.6, -13); c.stroke(); }
        c.restore();
        hairShine(c, R, 'up', 'long');
      }
    },
    bob: function (c, R, v, layer) {
      if (v === 'down' && layer === 'back') {
        hairShape(c, R, function (c) {
          c.moveTo(-10.8, -30); c.quadraticCurveTo(-12.8, -23, -11.6, -19.4);
          c.quadraticCurveTo(-9.6, -18.2, -7.4, -19.8); c.lineTo(7.4, -19.8);
          c.quadraticCurveTo(9.6, -18.2, 11.6, -19.4); c.quadraticCurveTo(12.8, -23, 10.8, -30); c.closePath();
        });
      } else if (v === 'down' && layer === 'over') {
        hairShape(c, R, function (c) {
          c.moveTo(-10.6, -28); c.quadraticCurveTo(-11.6, -22, -10.8, -19.6); c.quadraticCurveTo(-8.8, -19.2, -8.2, -21); c.quadraticCurveTo(-8.8, -25, -8.4, -28); c.closePath();
          c.moveTo(10.6, -28); c.quadraticCurveTo(11.6, -22, 10.8, -19.6); c.quadraticCurveTo(8.8, -19.2, 8.2, -21); c.quadraticCurveTo(8.8, -25, 8.4, -28); c.closePath();
        }, 0.7);
      } else if (v === 'right' && layer === 'back') {
        hairShape(c, R, function (c) {
          c.moveTo(-2, -36); c.quadraticCurveTo(-13.6, -32, -11.4, -19.4);
          c.quadraticCurveTo(-7, -18.2, -2.6, -19.8); c.lineTo(-1.6, -25); c.closePath();
        });
      } else if (v === 'up' && layer === 'over') {
        hairShape(c, R, function (c) {
          c.moveTo(-10.9, -30); c.quadraticCurveTo(-12.6, -23, -11.4, -19.2);
          c.quadraticCurveTo(0, -17.4, 11.4, -19.2); c.quadraticCurveTo(12.6, -23, 10.9, -30); c.closePath();
        });
        hairShine(c, R, 'up', 'bob');
      }
    },
    buns: function (c, R, v, layer) {
      var bun = function (x, y) {
        hairShape(c, R, function (c) { ell(c, x, y, 4.4, 4.2); });
        c.strokeStyle = R.hD; c.lineWidth = 0.6;
        c.beginPath(); c.arc(x, y, 2.4, 0.4, 4.6); c.stroke();
        fillE(c, x - 1.4, y - 1.8, 1.2, 0.7, -0.4, 'rgba(255,255,255,0.28)');
      };
      if ((v === 'down' && layer === 'back') || (v === 'up' && layer === 'over')) {
        bun(-7.4, -35.4); bun(7.4, -35.4);
        tie(c, R, -6, -32.2, 0.55, 3.4); tie(c, R, 6, -32.2, -0.55, 3.4);
      } else if (v === 'right' && layer === 'back') {
        bun(-4.8, -36.4); bun(3.2, -38.2);
        tie(c, R, 2.8, -34.6, -0.2, 3.4);
      }
    },
    braids: function (c, R, v, layer) {
      if (v === 'down' && layer === 'over') {
        braid(c, R, -9.6, -22.6, -8.8, -12.2, 5);
        braid(c, R, 9.6, -22.6, 8.8, -12.2, 5);
      } else if (v === 'right' && layer === 'back') {
        braid(c, R, -6.4, -22, -8.6, -11.8, 5);
      } else if (v === 'up' && layer === 'over') {
        line(c, 0, -37.6, 0, -21, R.hD, 0.8);
        braid(c, R, -4.4, -21.8, -5.2, -11.2, 5);
        braid(c, R, 4.4, -21.8, 5.2, -11.2, 5);
      }
    },
    curly: function (c, R, v, layer) {
      var ring = function (cx, from, to, n) {
        hairShape(c, R, function (c) {
          for (var i = 0; i <= n; i++) {
            var a = from + (to - from) * i / n;
            var rad = 11.4;
            ell(c, cx + Math.cos(a) * rad, -27 + Math.sin(a) * rad * 1.02, 3.9, 3.9);
          }
        });
      };
      if (v === 'down' && layer === 'back') {
        ring(0, Math.PI * 0.12, Math.PI * 0.88, 0);
        ring(0, -Math.PI * 1.2, Math.PI * 0.2, 9);
        hairShape(c, R, function (c) {
          ell(c, -11.2, -18.4, 3.8, 3.8); ell(c, 11.2, -18.4, 3.8, 3.8);
          ell(c, -12.2, -23, 3.8, 3.8); ell(c, 12.2, -23, 3.8, 3.8);
        });
      } else if (v === 'right' && layer === 'back') {
        hairShape(c, R, function (c) {
          ell(c, -8, -33, 4.4, 4.4); ell(c, -11, -27, 4.4, 4.4); ell(c, -10.6, -21, 4.2, 4.2);
          ell(c, -6.6, -18.4, 3.8, 3.8); ell(c, -2, -36.6, 4.2, 4.2); ell(c, -5.6, -24, 5, 5);
        });
      } else if (v === 'up' && layer === 'over') {
        hairShape(c, R, function (c) {
          var pts = [-11.4, -30, -12.2, -23.6, -11.4, -18, -6.6, -16.4, 0, -16, 6.6, -16.4, 11.4, -18, 12.2, -23.6, 11.4, -30, -5, -22, 5, -22, 0, -25];
          for (var i = 0; i < pts.length; i += 2) ell(c, pts[i], pts[i + 1], 4.2, 4.2);
        });
        c.save(); c.strokeStyle = R.hD; c.globalAlpha = 0.45; c.lineWidth = 0.55;
        for (var k = 0; k < 7; k++) { c.beginPath(); c.arc(-8 + k * 2.7, -19 - (k % 2) * 3, 1.3, 0.3, 2.8); c.stroke(); }
        c.restore();
      }
    },
    puffs: function (c, R, v, layer) {
      if ((v === 'down' && layer === 'back') || (v === 'up' && layer === 'over')) {
        puff(c, R, -10.8, -34.6, 6, 10); puff(c, R, 10.8, -34.6, 6, 10);
        tie(c, R, -8, -31.6, 0.75, 3.4); tie(c, R, 8, -31.6, -0.75, 3.4);
      } else if (v === 'right' && layer === 'back') {
        puff(c, R, -8.4, -35.4, 6, 10); puff(c, R, 4.4, -38.6, 5.6, 10);
        tie(c, R, 3.4, -34, -0.2, 3.4);
      }
    },
    afro: function (c, R, v, layer) {
      if (layer === (v === 'up' ? 'over' : 'back')) {
        puff(c, R, v === 'right' ? -1.6 : 0, -29.4, 15.2, 16);
      }
    },
    short: function () {},
    buzz: function () {},
    spiky: function (c, R, v, layer) {
      /* spikes poking up out of the top of the head, under the cap */
      if (layer !== 'under') return;
      hairShape(c, R, function (c) {
        var cx = v === 'right' ? -0.6 : 0;
        var n = 7, a0 = Math.PI * 1.08, a1 = Math.PI * 1.92;
        if (v === 'right') { a0 = Math.PI * 0.92; a1 = Math.PI * 1.62; }
        for (var i = 0; i < n; i++) {
          var aa = a0 + (a1 - a0) * i / n, ab = a0 + (a1 - a0) * (i + 1) / n, am = (aa + ab) / 2;
          var tipR = (i % 2 ? 13.6 : 14.6);
          c.moveTo(cx + Math.cos(aa - 0.12) * 9.0, -28 + Math.sin(aa - 0.12) * 8.7);
          c.lineTo(cx + Math.cos(am) * tipR + (v === 'right' ? -1.4 : 0), -28.4 + Math.sin(am) * tipR * 0.93);
          c.lineTo(cx + Math.cos(ab + 0.12) * 9.0, -28 + Math.sin(ab + 0.12) * 8.7);
          c.closePath();
        }
      }, 0.8);
    },
    swoop: function (c, R, v, layer) {
      if (layer !== 'cap') return;
      /* a big swoop of fringe on top */
      if (v === 'up') {
        hairShape(c, R, function (c) { ell(c, 1, -36, 7.8, 3.6, -0.12); }, 0.7);
        return;
      }
      hairShape(c, R, function (c) {
        if (v === 'right') {
          c.moveTo(-6, -35); c.quadraticCurveTo(4, -41.6, 12.2, -35.2);
          c.quadraticCurveTo(11.8, -31, 8.6, -30.4); c.quadraticCurveTo(6, -34.2, -2, -33); c.closePath();
        } else {
          c.moveTo(-9.4, -31.4); c.quadraticCurveTo(-6, -41, 5, -38.6);
          c.quadraticCurveTo(11.6, -37, 11, -31.4); c.quadraticCurveTo(8.2, -34.6, 2.6, -33.6);
          c.quadraticCurveTo(-3.6, -33.2, -6.4, -29); c.closePath();
        }
      }, 0.8);
    },
    curlyshort: function (c, R, v, layer) {
      if (layer !== 'cap') return;
      hairShape(c, R, function (c) {
        var cx = v === 'right' ? -0.6 : 0, n = 8;
        var a0 = v === 'right' ? Math.PI * 0.85 : Math.PI * 1.05, a1 = v === 'right' ? Math.PI * 1.8 : Math.PI * 1.95;
        for (var i = 0; i <= n; i++) {
          var a = a0 + (a1 - a0) * i / n;
          ell(c, cx + Math.cos(a) * 9.9, -28 + Math.sin(a) * 9.6, 2.9, 2.9);
        }
      }, 0.7);
      c.save(); c.strokeStyle = R.hD; c.globalAlpha = 0.5; c.lineWidth = 0.55;
      for (var k = 0; k < 6; k++) { c.beginPath(); c.arc(-6 + k * 2.6 + (v === 'right' ? -1.5 : 0), -33.6 + (k % 2) * 2.2, 1.1, 0.3, 2.8); c.stroke(); }
      c.restore();
    }
  };

  function drawCap(c, R, v) {
    var kind = FRINGE[R.hairId] || 'bangs';
    var path = v === 'up' ? capBack(kind) : (v === 'right' ? capSide(kind) : capFront(kind));
    var col = R.h;
    STYLES[R.hairId] && STYLES[R.hairId](c, R, v, 'under');
    if (kind === 'buzz') {
      var skinMix = mix(R.h, R.skin, 0.35);
      shade3(c, path, skinMix, mix(R.hD, R.skin, 0.3), null, 0.7);
    } else {
      hairShape(c, R, path);
    }
    STYLES[R.hairId] && STYLES[R.hairId](c, R, v, 'cap');
    strands(c, R, v, kind);
    hairShine(c, R, v, kind);
    void col;
  }

  /* ================================================================
     accessories
     ================================================================ */
  function drawAcc(c, R, v, o) {
    var a = R.accId, side = v === 'right', up = v === 'up';
    if (a === 'none' || a === 'bandana') return;
    if (a === 'flower') {
      var fx = side ? 3.6 : 7.8, fy = side ? -34.4 : -31.8;
      if (up) { fx = 7.8; fy = -31.6; }
      for (var i = 0; i < 5; i++) {
        var ang = i / 5 * TAU - Math.PI / 2;
        (function (px, py) {
          shade3(c, function (c) { ell(c, px, py, 1.9, 1.9); }, R.acc, R.accD, R.accL, 0.4);
        })(fx + Math.cos(ang) * 2.1, fy + Math.sin(ang) * 2.1);
      }
      fillE(c, fx, fy, 1.35, 1.35, 0, '#ffd45c');
      fillE(c, fx - 0.4, fy - 0.4, 0.5, 0.5, 0, '#fff4c0');
    } else if (a === 'bow') {
      var bx = side ? -1.5 : (up ? 0 : 5.6), by = side ? -37.2 : (up ? -36.6 : -35.8), rot = up ? 0 : (side ? -0.1 : 0.25);
      c.save(); c.translate(bx, by); c.rotate(rot);
      shade3(c, function (c) {
        c.moveTo(0, 0); c.quadraticCurveTo(-5.6, -4.6, -5.8, 0.4); c.quadraticCurveTo(-5, 3.8, 0, 0);
        c.moveTo(0, 0); c.quadraticCurveTo(5.6, -4.6, 5.8, 0.4); c.quadraticCurveTo(5, 3.8, 0, 0);
      }, R.acc, R.accD, R.accL, 0.6);
      shade3(c, function (c) { c.moveTo(-0.8, 0.4); c.lineTo(-2.2, 4.4); c.lineTo(-0.4, 3.8); c.closePath(); c.moveTo(0.8, 0.4); c.lineTo(2.4, 4.2); c.lineTo(0.6, 3.8); c.closePath(); }, R.accD, R.accD, null, 0.4);
      fillE(c, 0, 0, 1.5, 1.5, 0, R.accD);
      fillE(c, -0.3, -0.3, 0.6, 0.5, 0, R.accL);
      c.restore();
    } else if (a === 'headband') {
      c.save();
      c.lineCap = 'round';
      c.beginPath();
      if (side) { c.moveTo(-2.2, -28.4); c.quadraticCurveTo(-1.4, -38.6, 5.2, -37.4); }
      else if (up) c.ellipse(0, -29.4, 10.2, 8.6, 0, Math.PI * 1.04, Math.PI * 1.96);
      else c.ellipse(0, -29.2, 9.8, 7.6, 0, Math.PI * 1.02, Math.PI * 1.98);
      c.strokeStyle = R.accD; c.lineWidth = 2.7; c.stroke();
      c.strokeStyle = R.acc; c.lineWidth = 1.9; c.stroke();
      c.strokeStyle = R.accL; c.lineWidth = 0.6; c.stroke();
      c.restore();
      if (!up) {
        /* a little heart on it */
        var hx = side ? 1.2 : 5.2, hy = side ? -37.6 : -34.8;
        c.fillStyle = R.accD;
        c.beginPath(); c.arc(hx - 0.8, hy, 1.0, 0, TAU); c.arc(hx + 0.8, hy, 1.0, 0, TAU);
        c.moveTo(hx - 1.8, hy + 0.3); c.lineTo(hx, hy + 2.2); c.lineTo(hx + 1.8, hy + 0.3); c.fill();
      }
    } else if (a === 'cap') {
      if (o.noHat) return;
      var capC = R.acc, capD = R.accD;
      if (up) {
        shade3(c, function (c) { c.moveTo(-10.9, -29.2); c.ellipse(0, -29.4, 10.9, 9.6, 0, Math.PI, TAU); c.closePath(); }, capC, capD, R.accL);
        line(c, -3.4, -29.6, 3.4, -29.6, capD, 1.3);
        fillE(c, 0, -29.4, 1.3, 1.0, 0, '#fbf7ee');
      } else if (side) {
        shade3(c, function (c) { c.moveTo(-10.6, -29.4); c.ellipse(0.2, -29.6, 10.8, 9.6, 0, Math.PI, TAU); c.closePath(); }, capC, capD, R.accL);
        shade3(c, function (c) { c.moveTo(8, -30.8); c.quadraticCurveTo(16.4, -31.6, 17.4, -28.6); c.quadraticCurveTo(12, -28.2, 8, -28.8); c.closePath(); }, capD, dark(capC, 0.4), null, 0.5);
      } else {
        shade3(c, function (c) { c.moveTo(-10.9, -29.4); c.ellipse(0, -29.6, 10.9, 9.6, 0, Math.PI, TAU); c.closePath(); }, capC, capD, R.accL);
        shade3(c, function (c) { ell(c, 0, -29.2, 9.8, 2.4); }, capD, dark(capC, 0.4), null, 0.5);
        /* a little logo: a ladybird */
        fillE(c, 0, -34.2, 2, 1.8, 0, '#fbf7ee');
        fillE(c, 0, -34, 1.3, 1.1, 0, '#e8454f');
        fillE(c, 0, -35, 0.6, 0.45, 0, '#2a1a18');
      }
      fillE(c, side ? -0.8 : 0, -38.8, 1.1, 0.7, 0, capD);
    } else if (a === 'sunhat') {
      if (o.noHat) return;
      var straw = '#f4d98a', strawD = '#d9b35a', strawL = '#fff2c4';
      var hy2 = -31.8;
      shade3(c, function (c) { ell(c, side ? 0.8 : 0, hy2 + 0.6, 17.2, side ? 4.2 : 4.6); }, straw, strawD, strawL, 0.7);
      shade3(c, function (c) { c.moveTo(-8.4, hy2); c.ellipse(side ? 0.2 : 0, hy2, 8.4, 8.2, 0, Math.PI, TAU); c.closePath(); }, straw, strawD, strawL);
      c.fillStyle = R.acc; c.fillRect(side ? -8.2 : -8.4, hy2 - 3, 16.8, 2.6);
      c.fillStyle = R.accD; c.fillRect(side ? -8.2 : -8.4, hy2 - 0.8, 16.8, 0.5);
      if (!up) {
        var fxh = side ? -6 : -6.6;
        fillE(c, fxh, hy2 - 2.1, 1.9, 1.9, 0, '#ffffff'); fillE(c, fxh, hy2 - 2.1, 0.8, 0.8, 0, '#ffd45c');
      }
      c.save(); c.strokeStyle = strawD; c.lineWidth = 0.5; c.globalAlpha = 0.6;
      c.beginPath(); c.ellipse(side ? 0.8 : 0, hy2 + 0.6, 13.6, 3.4, 0, 0, Math.PI); c.stroke();
      c.restore();
    } else if (a === 'glasses') {
      if (up) {
        line(c, -10.4, -26.6, -7, -26.4, R.accD, 0.9); line(c, 10.4, -26.6, 7, -26.4, R.accD, 0.9);
        return;
      }
      var gc = lum(R.acc) > 0.85 ? '#9aa6b8' : R.accD;
      c.strokeStyle = gc; c.lineWidth = 0.95;
      var fxg = side ? 2.9 : 0, e0 = side ? fxg - 2.8 : -3.5, e1 = side ? fxg + 3.4 : 3.5;
      c.fillStyle = 'rgba(210,240,255,0.28)';
      c.beginPath(); ell(c, e0, -25.2, 3.0, 2.8); c.fill(); c.stroke();
      c.beginPath(); ell(c, e1, -25.2, side ? 2.4 : 3.0, 2.8); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(e0 + 3.0, -25.8); c.quadraticCurveTo((e0 + e1) / 2, -27, e1 - (side ? 2.4 : 3.0), -25.8); c.stroke();
      if (side) { c.beginPath(); c.moveTo(e0 - 3, -25.6); c.lineTo(-2.6, -26.6); c.stroke(); }
      else {
        c.beginPath(); c.moveTo(-6.5, -25.8); c.lineTo(-9.8, -26.6); c.stroke();
        c.beginPath(); c.moveTo(6.5, -25.8); c.lineTo(9.8, -26.6); c.stroke();
      }
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.5;
      c.beginPath(); c.arc(e0 - 0.6, -25.8, 1.8, 3.6, 4.4); c.stroke();
      c.beginPath(); c.arc(e1 - 0.6, -25.8, 1.8, 3.6, 4.4); c.stroke();
    }
  }

  /* a neckerchief, knotted at the front */
  function drawBandana(c, R, v) {
    if (R.accId !== 'bandana') return;
    if (v === 'up') {
      shade3(c, function (c) { c.moveTo(-5.6, -20.4); c.quadraticCurveTo(0, -18.6, 5.6, -20.4); c.lineTo(0, -15.4); c.closePath(); }, R.acc, R.accD, R.accL, 0.5);
      return;
    }
    var cx = v === 'right' ? 2.4 : 0;
    shade3(c, function (c) {
      c.moveTo(cx - 5.8, -20.6); c.quadraticCurveTo(cx, -18.6, cx + 5.8, -20.6);
      c.lineTo(cx + 1.2, -15.6); c.lineTo(cx, -14.6); c.lineTo(cx - 1.2, -15.6); c.closePath();
    }, R.acc, R.accD, R.accL, 0.5);
    c.fillStyle = lum(R.acc) > 0.8 ? 'rgba(255,120,140,0.7)' : 'rgba(255,255,255,0.8)';
    var dots = [[-2.6, -19.2], [2.6, -19.2], [0, -17.4], [-1, -19.8], [1.3, -16.4]];
    for (var i = 0; i < dots.length; i++) { c.beginPath(); c.arc(cx + dots[i][0], dots[i][1], 0.42, 0, TAU); c.fill(); }
  }

  /* ================================================================
     the whole figure
     ================================================================ */
  function figure(c, R, v, ph, blink, o) {
    var style = STYLES[R.hairId] || STYLES.short;
    var side = v === 'right', up = v === 'up';
    if (!o.headOnly) {
      if (!up) style(c, R, v, 'behind');
      drawBody(c, R, v, ph, o);
      drawBandana(c, R, v);
    }
    if (!up) style(c, R, v, 'back');
    if (!o.headOnly) drawNeck(c, R);
    if (!side) drawEars(c, R, v);
    shade3(c, headPath(side), R.skin, R.skinD, R.skinL, 1.1);
    if (side) drawEars(c, R, v);
    if (!up) drawFace(c, R, v, blink);
    drawCap(c, R, v);
    style(c, R, v, 'over');
    if (!o.headOnly && up) drawBandanaBackKnot(c, R);
    if (!o.noAcc) drawAcc(c, R, v, o);
  }
  function drawBandanaBackKnot(c, R) {
    if (R.accId !== 'bandana') return;
    fillE(c, 0, -19.6, 1.4, 1.1, 0, R.accD);
  }

  /* Draw one pose into a fresh canvas at scale S, with the outline baked in. */
  var _scratch = null;
  function render(R, dir, ph, blink, S, o) {
    if (GG.PlayerArt) GG.PlayerArt._renders = (GG.PlayerArt._renders || 0) + 1;
    var W = Math.ceil(BOX.w * S), H = Math.ceil(BOX.h * S);
    if (!_scratch) _scratch = document.createElement('canvas');
    var A = _scratch;
    if (A.width < W || A.height < H) { A.width = Math.max(A.width, W); A.height = Math.max(A.height, H); }
    var a = A.getContext('2d');
    a.setTransform(1, 0, 0, 1, 0, 0);
    a.clearRect(0, 0, A.width, A.height);
    a.setTransform(S, 0, 0, S, -BOX.x0 * S, -BOX.y0 * S);
    if (dir === 'left') a.scale(-1, 1);
    var v = dir === 'left' ? 'right' : dir;
    figure(a, R, v, ph, blink, o || {});

    var out = (o && o.into) || document.createElement('canvas');
    if (out.width !== W || out.height !== H) { out.width = W; out.height = H; }
    var b = out.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, W, H);
    /* outline: the silhouette stamped round in a ring, tinted dark */
    var ow = Math.max(1, 0.72 * S);
    for (var i = 0; i < 8; i++) {
      var an = i / 8 * TAU;
      b.drawImage(A, 0, 0, W, H, Math.cos(an) * ow, Math.sin(an) * ow, W, H);
    }
    b.globalCompositeOperation = 'source-in';
    b.fillStyle = 'rgba(58,32,44,0.78)';
    b.fillRect(0, 0, W, H);
    b.globalCompositeOperation = 'source-over';
    b.drawImage(A, 0, 0, W, H, 0, 0, W, H);
    return out;
  }

  /* ================================================================
     the public side
     ================================================================ */
  var PA = GG.PlayerArt = {
    BOX: BOX,
    WALK_FRAMES: WALK_FRAMES,
    _cache: {},
    _look: null,
    _R: null,
    _scale: 0,
    _count: 0,

    invalidate: function () {
      this._cache = {}; this._count = 0; this._look = null; this._R = null;
      this._pcache = {}; this._pcount = 0; this._warmFor = null;
    },

    resolve: resolve,

    _resolved: function (look) {
      if (look !== this._look || !this._R) {
        this._cache = {}; this._count = 0; this._pcache = {}; this._pcount = 0;
        this._look = look; this._R = resolve(look);
      }
      return this._R;
    },

    /* the device scale of whatever canvas we are drawing into */
    _deviceScale: function (c) {
      var s = 1;
      if (c.getTransform) {
        var m = c.getTransform();
        s = Math.sqrt(m.a * m.a + m.b * m.b);
      } else {
        s = (GG.view && GG.view.zoom || 1) * Math.min(window.devicePixelRatio || 1, 2);
      }
      return Math.max(0.5, Math.min(8, Math.ceil(s * 4 - 0.01) / 4));
    },

    /* One pose, from the cache or drawn now. With `lazy`, a pose that is
       not ready yet may come back as the standing pose of the same
       direction instead, so at most one new pose is drawn per frame. */
    sprite: function (look, dir, frame, blink, S, noHat, lazy) {
      var R = this._resolved(look);
      if (S !== this._scale) { this._cache = {}; this._count = 0; this._scale = S; }
      if (this._count === 0 && this._warmFor !== look) this.warm(look, S);
      var key = dir.charCodeAt(0) * 64 + (frame + 1) * 2 + (blink ? 1 : 0) + (noHat ? 4096 : 0);
      var hit = this._cache[key];
      if (hit) return hit;
      if (lazy && (frame >= 0 || blink)) {
        var now = performance.now();
        if (now - this._genAt < 30) {
          var still = this._cache[dir.charCodeAt(0) * 64 + (noHat ? 4096 : 0)];
          if (still) return still;
        }
        this._genAt = now;
      }
      var ph = frame < 0 ? null : (frame + 0.5) / WALK_FRAMES * TAU;
      hit = render(R, dir, ph, blink, S, { noHat: noHat });
      this._cache[key] = hit;
      this._count++;
      return hit;
    },
    _genAt: 0,

    /* Draw every pose ahead of time, one at a time when the page is idle,
       so the first walk in each direction never stalls a frame. */
    warm: function (look, S) {
      var self = this, jobs = [];
      ['down', 'left', 'right', 'up'].forEach(function (d) {
        jobs.push([d, -1, false]);
        for (var f = 0; f < WALK_FRAMES; f++) jobs.push([d, f, false]);
        jobs.push([d, -1, true]);
      });
      this._warmFor = look;
      var gen = (this._warmGen = (this._warmGen || 0) + 1);
      /* only in real idle time - never in the middle of a busy moment; a
         pose that is needed before it is warmed is drawn on demand anyway */
      var later = window.requestIdleCallback
        ? function (fn) { window.requestIdleCallback(fn); }
        : function (fn) { setTimeout(fn, 120); };
      var step = function (deadline) {
        if (gen !== self._warmGen) return;              // a newer warm-up took over
        if (self._look !== look || (S && self._scale !== S)) return;
        while (!deadline || !deadline.timeRemaining || deadline.timeRemaining() > 9) {
          var j = jobs.shift();
          if (!j) return;
          self.sprite(look, j[0], j[1], j[2], self._scale, false);
          if (!deadline || !deadline.timeRemaining) break;
        }
        later(step);
      };
      later(step);
    },

    /* The character in the world. */
    draw: function (c, look, sx, sy, dir, walkPhase, t, opts) {
      opts = opts || EMPTY;
      var S = this._deviceScale(c);
      var moving = !!opts.moving;
      var frame = -1, blink = false;
      if (moving) {
        var p = ((walkPhase * 2) % TAU + TAU) % TAU;
        frame = Math.floor(p / TAU * WALK_FRAMES) % WALK_FRAMES;
      } else {
        blink = Math.sin(t * 0.9) > 0.985;
      }
      /* only a cap or a sun hat comes off for the riding helmet; every other
         look uses the very same poses, so riding costs no new drawing */
      var noHat = !!opts.noHat && (look.acc === 'cap' || look.acc === 'sunhat');
      var img = this.sprite(look, dir || 'down', frame, blink, S, noHat, true);
      var bob = opts.bob || 0, lean = opts.lean || 0;
      c.save();
      c.translate(sx, sy - bob);
      if (lean) c.rotate(lean);
      c.drawImage(img, BOX.x0, BOX.y0, BOX.w, BOX.h);
      c.restore();
    },

    /* Big and alive, for the character screen and anywhere else in the UI.
       Re-renders only when the pose actually changes. */
    portrait: function (c, look, x, y, scale, t, opts) {
      opts = opts || EMPTY;
      var S = Math.round((opts.deviceScale || this._deviceScale(c)) * scale * 4) / 4;
      var dir = opts.dir || 'down';
      var waving = !!opts.wave && dir === 'down';
      var blink = !waving && (t % 3.7) > 3.55;
      var wf = waving ? Math.floor(t * 9) % 6 : -1;
      var R = this._resolved(look);
      var key = dir + '|' + (blink ? 1 : 0) + '|' + wf + '|' + S;
      var img = this._pcache[key];
      if (!img) {
        if (this._pcount > 24) { this._pcache = {}; this._pcount = 0; }
        img = render(R, dir, null, blink, S, { wave: wf < 0 ? null : wf / 6 * TAU });
        this._pcache[key] = img; this._pcount++;
      }
      var breathe = 1 + Math.sin(t * 2.3) * 0.012;
      c.save();
      c.translate(x, y);
      c.scale(scale, scale * breathe);
      c.drawImage(img, BOX.x0, BOX.y0, BOX.w, BOX.h);
      c.restore();
    },

    /* A pose into a canvas of its own (for tiles and contact sheets). */
    renderTo: function (look, dir, S, opts) {
      opts = opts || {};
      var R = resolve(look);
      var ph = opts.frame == null || opts.frame < 0 ? null : (opts.frame + 0.5) / WALK_FRAMES * TAU;
      return render(R, dir || 'down', ph, !!opts.blink, S, { headOnly: !!opts.headOnly, noAcc: !!opts.noAcc, wave: opts.wave });
    },

    /* just the head, centred on (x, y) */
    head: function (c, look, x, y, scale, opts) {
      opts = opts || {};
      var S = this._deviceScale(c) * scale;
      var cv = this.renderTo(look, opts.dir || 'down', S, { headOnly: true, noAcc: opts.noAcc });
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.drawImage(cv, BOX.x0, BOX.y0 + 27, BOX.w, BOX.h);
      c.restore();
    }
  };
  var EMPTY = {};
  PA._pcache = {}; PA._pcount = 0;
})(window.GG = window.GG || {});
