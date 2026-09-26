/* v1.20 - the art for decorating the cottage: wallpapers, floors, rugs,
   quilts, curtains and the things she can put down or hang up.

   The first option of each kind ('cream', 'honey', 'blue', 'pink', 'none')
   is drawn with EXACTLY the same calls as the v1.19 cottage, so a room she
   has never decorated is pixel-for-pixel what it was. Everything else is
   free to be bright.

   Room geometry comes from GG.House (W 560, H 440, FLOOR 112). Things are
   drawn with (x, y) at the middle of their base, like the animals. */
(function (GG) {
  'use strict';

  var TAU = Math.PI * 2;
  function ell(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); c.fill(); }
  function rr(c, x, y, w, h, r) { GG.roundRect(c, x, y, w, h, r); c.fill(); }
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, TAU); c.fill(); }
  function starPath(c, x, y, R, r, n, rot) {
    n = n || 5; rot = rot == null ? -Math.PI / 2 : rot;
    c.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var a = rot + i * Math.PI / n, d = (i % 2) ? r : R;
      if (i) c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else c.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    c.closePath();
  }
  function star(c, x, y, R, r) { starPath(c, x, y, R, r || R * 0.45); c.fill(); }
  function shadow(c, x, y, rx, ry) { c.fillStyle = 'rgba(60,35,15,0.16)'; ell(c, x, y, rx, ry || rx * 0.3); }
  function flower5(c, x, y, r, petal, mid) {
    c.fillStyle = petal;
    for (var k = 0; k < 5; k++) { var a = k * TAU / 5 - Math.PI / 2; circ(c, x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.78); }
    c.fillStyle = mid; circ(c, x, y, r * 0.62);
  }
  function leafShape(c, x, y, len, wid, ang) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.5, -wid, len, 0);
    c.quadraticCurveTo(len * 0.5, wid, 0, 0);
    c.fill(); c.restore();
  }
  var RAINBOW = ['#ff6f7d', '#ffa552', '#ffd84d', '#7ed66b', '#5fbdf0', '#8f86ea', '#d58ce8'];
  var PASTEL = ['#ffc2c9', '#ffdcb5', '#fff3a8', '#c9f2b8', '#bfe4fb', '#d6ccfb', '#f4c9f1'];

  var A = GG.HomeArt = {};

  /* ================= walls ================= */
  /* the paper itself, over any rectangle (the room's back wall or a swatch) */
  A.wallPattern = function (c, id, x0, y0, w, h) {
    var o = GG.HOME_DECOR.byId.wall[id] || GG.HOME_DECOR.wall[0];
    var x, y, i, k;
    c.save();
    c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    if (id === 'cream' || !o.base && id !== 'rainbow') {
      c.fillStyle = '#e9d3b4'; c.fillRect(x0, y0, w, h);
      c.fillStyle = '#dfc6a2';
      for (x = x0; x < x0 + w; x += 26) c.fillRect(x, y0, 1.5, h);
    } else if (id === 'rainbow') {
      var bh = h / PASTEL.length;
      for (i = 0; i < PASTEL.length; i++) { c.fillStyle = PASTEL[i]; c.fillRect(x0, y0 + i * bh, w, bh + 0.6); }
      c.fillStyle = 'rgba(255,255,255,0.85)';
      for (x = x0 + 30, k = 0; x < x0 + w + 40; x += 110, k++) {
        var cy = y0 + h * (k % 2 ? 0.34 : 0.62);
        ell(c, x, cy, 16, 6); ell(c, x + 10, cy - 4, 10, 6); ell(c, x - 9, cy - 2, 8, 5);
      }
    } else {
      c.fillStyle = o.base; c.fillRect(x0, y0, w, h);
      if (id === 'mint' || id === 'sky') {
        c.fillStyle = o.line;
        for (x = x0; x < x0 + w; x += 26) c.fillRect(x, y0, 1.5, h);
        c.fillStyle = 'rgba(255,255,255,0.22)';
        for (x = x0 + 4; x < x0 + w; x += 26) c.fillRect(x, y0, 5, h);
      } else if (id === 'sunny' || id === 'candy') {
        c.fillStyle = o.stripe;
        for (x = x0; x < x0 + w; x += 24) c.fillRect(x, y0, 11, h);
        c.fillStyle = 'rgba(255,255,255,0.55)';
        for (x = x0 + 16; x < x0 + w; x += 24) c.fillRect(x, y0, 2, h);
      } else if (id === 'dots') {
        c.fillStyle = o.dot;
        for (y = y0 + 8, k = 0; y < y0 + h + 6; y += 16, k++)
          for (x = x0 + (k % 2) * 11 + 4; x < x0 + w + 6; x += 22) circ(c, x, y, 3.6);
      } else if (id === 'flowers') {
        var pc = ['#ff8fb1', '#7ec8f2', '#c49af0', '#ffb45c'];
        for (y = y0 + 12, k = 0; y < y0 + h + 10; y += 24, k++)
          for (x = x0 + (k % 2) * 16 + 8, i = k; x < x0 + w + 10; x += 32, i++) {
            c.fillStyle = '#8fd07a'; leafShape(c, x + 2, y + 3, 9, 3, 0.5); leafShape(c, x - 2, y + 3, 9, 3, 2.6);
            flower5(c, x, y, 3.2, pc[i % 4], '#ffe066');
          }
      } else if (id === 'stars') {
        var g = c.createLinearGradient(0, y0, 0, y0 + h);
        g.addColorStop(0, '#34408f'); g.addColorStop(1, '#5a63c0');
        c.fillStyle = g; c.fillRect(x0, y0, w, h);
        for (y = y0 + 10, k = 0; y < y0 + h + 8; y += 22, k++)
          for (x = x0 + (k % 2) * 17 + 8, i = k; x < x0 + w + 8; x += 34, i++) {
            c.fillStyle = i % 3 ? '#ffe36b' : '#fff6c4';
            star(c, x, y, i % 3 ? 4.6 : 3.2);
            c.fillStyle = 'rgba(255,255,255,0.8)'; circ(c, x + 11, y + 9, 0.9);
          }
        c.fillStyle = '#fff6c4';
        for (x = x0 + 60; x < x0 + w; x += 190) { circ(c, x, y0 + h * 0.4, 8); c.fillStyle = g; circ(c, x + 4, y0 + h * 0.4 - 3, 7); c.fillStyle = '#fff6c4'; }
      } else if (id === 'leaves') {
        for (y = y0 + 10, k = 0; y < y0 + h + 12; y += 22, k++)
          for (x = x0 + (k % 2) * 15 + 6, i = k; x < x0 + w + 12; x += 30, i++) {
            c.fillStyle = i % 2 ? '#8fd46b' : '#63bb5a';
            leafShape(c, x, y, 13, 4.5, -0.6 + (i % 3) * 0.3);
            c.fillStyle = 'rgba(255,255,255,0.35)'; leafShape(c, x + 1, y - 0.5, 10, 1.2, -0.6 + (i % 3) * 0.3);
          }
      } else if (id === 'gingham') {
        c.fillStyle = o.check;
        for (x = x0; x < x0 + w; x += 20) c.fillRect(x, y0, 10, h);
        for (y = y0; y < y0 + h; y += 20) c.fillRect(x0, y, w, 10);
      } else if (id === 'panel') {
        for (x = x0, i = 0; x < x0 + w; x += 22, i++) {
          c.fillStyle = i % 3 === 0 ? '#bf8454' : i % 3 === 1 ? '#b3784a' : '#c28a5b';
          c.fillRect(x, y0, 22, h);
          c.fillStyle = o.line; c.fillRect(x, y0, 1.6, h);
          c.fillStyle = 'rgba(90,50,20,0.16)';
          c.fillRect(x + 7 + (i * 5) % 9, y0 + (i * 13) % 30, 1, h * 0.5);
        }
        c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(x0, y0, w, h * 0.3);
      }
    }
    c.restore();
  };

  /* the whole back wall of the room, skirting and picture rail included */
  A.wall = function (c, id) {
    var W = GG.House.W, FLOOR = GG.House.FLOOR, i;
    if (id === 'cream') {
      /* v1.19, call for call */
      c.fillStyle = '#e9d3b4';
      c.fillRect(0, 0, W, FLOOR);
      c.fillStyle = '#dfc6a2';
      for (i = 0; i < W; i += 26) c.fillRect(i, 0, 1.5, FLOOR - 8);
      c.fillStyle = '#b98f63';
      c.fillRect(0, FLOOR - 8, W, 8);
      c.fillStyle = '#d2b48c';
      c.fillRect(0, 0, W, 6);
      return;
    }
    A.wallPattern(c, id, 0, 0, W, FLOOR);
    /* a soft light from the window side, and a shade under the rail */
    var g = c.createLinearGradient(0, 0, 0, FLOOR);
    g.addColorStop(0, 'rgba(0,0,0,0.07)'); g.addColorStop(0.15, 'rgba(0,0,0,0)');
    g.addColorStop(0.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.08)');
    c.fillStyle = g; c.fillRect(0, 0, W, FLOOR);
    c.fillStyle = id === 'panel' ? '#7f4f2c' : '#ffffff';
    c.fillRect(0, FLOOR - 8, W, 8);
    c.fillStyle = id === 'panel' ? '#6b4122' : 'rgba(0,0,0,0.1)';
    c.fillRect(0, FLOOR - 8, W, 1.5);
    c.fillStyle = id === 'panel' ? '#d9a16c' : '#ffffff';
    c.fillRect(0, 0, W, 6);
    c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(0, 6, W, 1.5);
  };

  /* ================= floors ================= */
  function boards(c, x0, y0, w, h, base, line, vary) {
    c.fillStyle = base;
    c.fillRect(x0, y0, w, h);
    var y, row, bx;
    if (vary) {
      for (row = 0; y0 + row * 18 < y0 + h; row++) {
        for (bx = (row % 2) * 46 - 92, y = 0; bx < x0 + w; bx += 92, y++) {
          var v = ((row * 7 + y * 13) % 5) / 5;
          c.fillStyle = v > 0.5 ? 'rgba(255,255,255,' + (0.05 + (v - 0.5) * 0.12).toFixed(3) + ')' : 'rgba(80,40,10,' + (0.02 + v * 0.1).toFixed(3) + ')';
          c.fillRect(x0 + bx, y0 + row * 18, 92, 18);
        }
      }
    }
    c.fillStyle = line;
    for (y = y0 + 18; y < y0 + h; y += 18) c.fillRect(x0, y, w, 1.5);
    for (row = 0; y0 + row * 18 < y0 + h; row++) {
      for (bx = (row % 2) * 46; bx < w; bx += 92) c.fillRect(x0 + bx, y0 + row * 18, 1.5, 18);
    }
  }
  A.floorPattern = function (c, id, x0, y0, w, h) {
    var o = GG.HOME_DECOR.byId.floor[id] || GG.HOME_DECOR.floor[0];
    var x, y, i, k;
    c.save();
    c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    if (id === 'honey' || !GG.HOME_DECOR.byId.floor[id]) {
      boards(c, x0, y0, w, h, '#c69a6b', '#b98c5f', false);
    } else if (id === 'dark' || id === 'pale') {
      boards(c, x0, y0, w, h, o.base, o.line, true);
    } else if (id === 'checker' || id === 'bluecheck') {
      var s = 22;
      c.fillStyle = o.a; c.fillRect(x0, y0, w, h);
      c.fillStyle = o.b;
      for (y = 0, k = 0; y < h; y += s, k++)
        for (x = (k % 2) * s; x < w; x += s * 2) c.fillRect(x0 + x, y0 + y, s, s);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      for (y = 0; y < h; y += s) c.fillRect(x0, y0 + y, w, 1);
    } else if (id === 'hex') {
      c.fillStyle = '#e9a22c'; c.fillRect(x0, y0, w, h);
      var r = 12, hw = r * Math.sqrt(3);
      for (y = 0, k = 0; y < h + r * 2; y += r * 1.5, k++)
        for (x = (k % 2) * hw / 2; x < w + hw; x += hw) {
          c.fillStyle = ((k + Math.floor(x / hw)) % 3) ? o.a : o.b;
          c.beginPath();
          for (i = 0; i < 6; i++) {
            var a = Math.PI / 6 + i * Math.PI / 3;
            var px = x0 + x + Math.cos(a) * (r - 1.2), py = y0 + y + Math.sin(a) * (r - 1.2);
            if (i) c.lineTo(px, py); else c.moveTo(px, py);
          }
          c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, x0 + x - 3, y0 + y - 4, 3.5, 1.6);
        }
    } else if (id === 'carpet' || id === 'grass') {
      c.fillStyle = o.base; c.fillRect(x0, y0, w, h);
      var g = c.createLinearGradient(0, y0, 0, y0 + h);
      g.addColorStop(0, 'rgba(0,0,0,0.06)'); g.addColorStop(1, 'rgba(255,255,255,0.08)');
      c.fillStyle = g; c.fillRect(x0, y0, w, h);
      for (i = 0; i < (w * h) / 60; i++) {
        var sx = x0 + (i * 37.7) % w, sy = y0 + ((i * 53.3) % h + (i * 0.37) % 7) % h;
        c.fillStyle = (i % 3) ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)';
        if (id === 'grass') { c.fillRect(sx, sy, 1, 3); c.fillRect(sx + 1.5, sy + 0.5, 1, 2.5); }
        else c.fillRect(sx, sy, 1.4, 1.4);
      }
      if (id === 'grass') {
        for (i = 0; i < (w * h) / 1400; i++) {
          var fx = x0 + (i * 71.3) % w, fy = y0 + (i * 97.1) % h;
          flower5(c, fx, fy, 1.6, i % 2 ? '#ffffff' : '#fff27a', '#ffcf3a');
        }
      }
    } else if (id === 'stone') {
      c.fillStyle = '#a79f91'; c.fillRect(x0, y0, w, h);
      var shades = ['#d3cdc0', '#c6bfb0', '#dbd5c9', '#cbc3b3', '#bfb8aa'];
      for (y = 0, k = 0; y < h; y += 30, k++) {
        for (x = -((k * 23) % 40), i = 0; x < w; i++) {
          var fw = 38 + ((i * 17 + k * 11) % 26);
          c.fillStyle = shades[(i + k * 2) % shades.length];
          GG.roundRect(c, x0 + x + 1.5, y0 + y + 1.5, fw - 3, 27, 4); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x0 + x + 4, y0 + y + 3, fw - 12, 2);
          x += fw;
        }
      }
    }
    c.restore();
  };
  A.floor = function (c, id) {
    var H = GG.House;
    if (id === 'honey') {
      /* v1.19, call for call */
      c.save();
      c.beginPath(); c.rect(0, H.FLOOR, H.W, H.H - H.FLOOR); c.clip();
      boards(c, 0, H.FLOOR, H.W, H.H - H.FLOOR, '#c69a6b', '#b98c5f', false);
      c.restore();
      return;
    }
    A.floorPattern(c, id, 0, H.FLOOR, H.W, H.H - H.FLOOR);
    /* a little warmth by the back wall */
    var g = c.createLinearGradient(0, H.FLOOR, 0, H.FLOOR + 40);
    g.addColorStop(0, 'rgba(60,30,10,0.16)'); g.addColorStop(1, 'rgba(60,30,10,0)');
    c.fillStyle = g; c.fillRect(0, H.FLOOR, H.W, 40);
  };

  /* ================= rugs (centred on cx, cy; s scales) ================= */
  A.rug = function (c, id, cx, cy, s) {
    s = s || 1;
    var i, a;
    if (id === 'none') return;
    if (id === 'blue' || !GG.HOME_DECOR.byId.rug[id]) {
      if (s === 1) {
        /* v1.19, call for call */
        c.fillStyle = '#8fc7d8';
        c.beginPath(); c.ellipse(cx, cy, 74, 44, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#a9d9e6';
        c.beginPath(); c.ellipse(cx, cy, 56, 32, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#8fc7d8';
        c.beginPath(); c.ellipse(cx, cy, 34, 19, 0, 0, Math.PI * 2); c.fill();
        return;
      }
      c.fillStyle = '#8fc7d8'; ell(c, cx, cy, 74 * s, 44 * s);
      c.fillStyle = '#a9d9e6'; ell(c, cx, cy, 56 * s, 32 * s);
      c.fillStyle = '#8fc7d8'; ell(c, cx, cy, 34 * s, 19 * s);
      return;
    }
    c.save(); c.translate(cx, cy); c.scale(s, s);
    if (id === 'rag') {
      var rc = ['#e8505b', '#ffc93c', '#3fb6a8', '#ff8fb1', '#7cc95a', '#5a8fe0', '#ffa552'];
      for (i = 0; i < 7; i++) { c.fillStyle = rc[i]; ell(c, 0, 0, 70 - i * 10, 42 - i * 6); }
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1; c.setLineDash([3, 3]);
      for (i = 0; i < 6; i++) { c.beginPath(); c.ellipse(0, 0, 65 - i * 10, 39 - i * 6, 0, 0, TAU); c.stroke(); }
      c.setLineDash([]);
    } else if (id === 'rainbow') {
      c.save(); GG.roundRect(c, -70, -40, 140, 80, 12); c.clip();
      for (i = 0; i < 7; i++) { c.fillStyle = RAINBOW[i]; c.fillRect(-70, -40 + i * 80 / 7, 140, 80 / 7 + 0.5); }
      c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(-70, -40, 140, 14);
      c.restore();
      c.fillStyle = '#fff4e0';
      for (i = 0; i < 12; i++) { c.fillRect(-76, -37 + i * 6.6, 6, 1.6); c.fillRect(70, -37 + i * 6.6, 6, 1.6); }
    } else if (id === 'flower') {
      for (i = 0; i < 6; i++) {
        a = i * TAU / 6;
        c.fillStyle = i % 2 ? '#ff8fb1' : '#ffa8c6';
        c.save(); c.translate(Math.cos(a) * 36, Math.sin(a) * 21); c.rotate(Math.atan2(Math.sin(a) * 0.6, Math.cos(a)));
        ell(c, 0, 0, 30, 17); c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, 6, -3, 14, 5); c.restore();
      }
      c.fillStyle = '#ffd23f'; ell(c, 0, 0, 26, 16);
      c.fillStyle = '#f5a623';
      for (i = 0; i < 9; i++) circ(c, Math.cos(i * 2.4) * (i * 2), Math.sin(i * 2.4) * (i * 1.2), 1.8);
    } else if (id === 'ladybug') {
      c.strokeStyle = '#2b2226'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-78, -8); c.quadraticCurveTo(-92, -24, -86, -34); c.moveTo(-78, 8); c.quadraticCurveTo(-94, 18, -90, 30); c.stroke();
      c.fillStyle = '#2b2226'; ell(c, -64, 0, 20, 18);
      c.fillStyle = '#ffffff'; circ(c, -72, -7, 4.5); circ(c, -72, 7, 4.5);
      c.fillStyle = '#e8343f'; ell(c, 6, 0, 66, 40);
      c.fillStyle = '#ff6770'; ell(c, 0, -14, 46, 14);
      c.fillStyle = '#2b2226'; c.fillRect(-58, -1.5, 128, 3);
      var sp = [[-30, -20, 9], [10, -24, 8], [42, -14, 8], [-30, 20, 9], [10, 24, 8], [42, 14, 8]];
      for (i = 0; i < sp.length; i++) ell(c, sp[i][0], sp[i][1], sp[i][2], sp[i][2] * 0.75);
    } else if (id === 'bee') {
      c.fillStyle = 'rgba(255,255,255,0.85)'; ell(c, -10, -34, 26, 14); ell(c, 16, -34, 22, 12);
      c.save(); c.beginPath(); c.ellipse(0, 0, 66, 38, 0, 0, TAU); c.clip();
      c.fillStyle = '#ffd23f'; c.fillRect(-70, -40, 140, 80);
      c.fillStyle = '#35291f';
      for (i = -2; i <= 1; i++) c.fillRect(i * 28 + 4, -40, 13, 80);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-70, -32, 140, 10);
      c.restore();
      c.fillStyle = '#35291f'; ell(c, 70, 0, 18, 16);
      c.fillStyle = '#ffffff'; circ(c, 76, -5, 3.5);
      c.strokeStyle = '#35291f'; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(80, -10); c.quadraticCurveTo(92, -22, 90, -28); c.stroke();
    } else if (id === 'leaf') {
      var lg = c.createLinearGradient(-70, 0, 70, 0);
      lg.addColorStop(0, '#5cbf62'); lg.addColorStop(1, '#8edc6f');
      c.fillStyle = lg;
      c.beginPath(); c.moveTo(-74, 6);
      c.quadraticCurveTo(-20, -60, 74, -4); c.quadraticCurveTo(10, 56, -74, 6); c.fill();
      c.strokeStyle = '#cdf5b0'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-70, 5); c.quadraticCurveTo(0, -4, 70, -4); c.stroke();
      c.lineWidth = 1.5;
      for (i = -3; i <= 3; i++) {
        var vx = i * 17;
        c.beginPath(); c.moveTo(vx, -2); c.lineTo(vx + 14, -22 + Math.abs(i) * 3);
        c.moveTo(vx, -2); c.lineTo(vx + 12, 20 - Math.abs(i) * 3); c.stroke();
      }
    } else if (id === 'star') {
      c.save(); c.scale(1, 0.62);
      c.fillStyle = '#ffa52e'; star(c, 0, 4, 74, 34);
      c.fillStyle = '#ffd84d'; star(c, 0, 4, 64, 28);
      c.fillStyle = '#fff09a'; star(c, 0, 4, 34, 15);
      c.restore();
    }
    c.restore();
  };

  /* ================= the quilt on her bed ================= */
  A.quilt = function (c, id, B) {
    var qx = B.x0 + 3, qy = B.y0 + 20, qw = B.x1 - B.x0 - 6, qh = B.y1 - B.y0 - 23, q, i, j;
    if (id === 'pink' || !GG.HOME_DECOR.byId.quilt[id]) {
      /* v1.19, call for call */
      c.fillStyle = '#e07f9c';
      GG.roundRect(c, B.x0 + 3, B.y0 + 20, B.x1 - B.x0 - 6, B.y1 - B.y0 - 23, 5); c.fill();
      c.fillStyle = '#f09cb4';
      GG.roundRect(c, B.x0 + 3, B.y0 + 20, B.x1 - B.x0 - 6, 9, 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)';
      for (q = 0; q < 3; q++) c.fillRect(B.x0 + 8 + q * 13, B.y0 + 40, 2, B.y1 - B.y0 - 48);
      return;
    }
    var o = GG.HOME_DECOR.byId.quilt[id];
    c.save();
    GG.roundRect(c, qx, qy, qw, qh, 5); c.clip();
    if (id === 'sunny' || id === 'sky') {
      c.fillStyle = o.a; c.fillRect(qx, qy, qw, qh);
      c.fillStyle = o.b;
      for (j = 0; j < 5; j++) for (i = 0; i < 4; i++) if ((i + j) % 2) c.fillRect(qx + i * 18, qy + j * 16, 18, 16);
      for (j = 0; j < 5; j++) for (i = 0; i < 4; i++) if (!((i + j) % 2)) {
        if (id === 'sunny') flower5(c, qx + 9 + i * 18, qy + 8 + j * 16, 2.6, '#ffffff', '#ff9a3c');
        else { c.fillStyle = '#ffffff'; ell(c, qx + 9 + i * 18, qy + 9 + j * 16, 5, 2.6); ell(c, qx + 11 + i * 18, qy + 7 + j * 16, 3.4, 2.4); }
      }
    } else if (id === 'patch') {
      var pc = ['#ff8fb1', '#ffd23f', '#6fcaf0', '#8fd46b', '#c49af0', '#ffa552'];
      for (j = 0; j < 5; j++) for (i = 0; i < 4; i++) {
        c.fillStyle = pc[(i + j * 3) % pc.length]; c.fillRect(qx + i * 18, qy + j * 16, 18, 16);
        c.fillStyle = 'rgba(255,255,255,0.3)';
        if ((i + j) % 2) circ(c, qx + 9 + i * 18, qy + 8 + j * 16, 2.4); else c.fillRect(qx + 3 + i * 18, qy + 7 + j * 16, 12, 2);
      }
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.8; c.setLineDash([2, 2]);
      for (i = 1; i < 4; i++) { c.beginPath(); c.moveTo(qx + i * 18, qy); c.lineTo(qx + i * 18, qy + qh); c.stroke(); }
      for (j = 1; j < 5; j++) { c.beginPath(); c.moveTo(qx, qy + j * 16); c.lineTo(qx + qw, qy + j * 16); c.stroke(); }
      c.setLineDash([]);
    } else if (id === 'gingham') {
      c.fillStyle = '#f4fff0'; c.fillRect(qx, qy, qw, qh);
      c.fillStyle = 'rgba(72,178,86,0.4)';
      for (i = 0; i < qw; i += 12) c.fillRect(qx + i, qy, 6, qh);
      for (j = 0; j < qh; j += 12) c.fillRect(qx, qy + j, qw, 6);
    } else if (id === 'stars') {
      c.fillStyle = '#4a58b8'; c.fillRect(qx, qy, qw, qh);
      for (j = 0; j < 6; j++) for (i = 0; i < 4; i++) {
        c.fillStyle = (i + j) % 3 ? '#ffe36b' : '#ffffff';
        star(c, qx + 9 + i * 18 + (j % 2) * 5, qy + 8 + j * 14, (i + j) % 3 ? 3.8 : 2.4);
      }
    } else if (id === 'rainbow') {
      for (i = 0; i < 7; i++) { c.fillStyle = RAINBOW[i]; c.fillRect(qx + i * qw / 7, qy, qw / 7 + 0.5, qh); }
    } else if (id === 'ladybug') {
      c.fillStyle = '#ef3e4a'; c.fillRect(qx, qy, qw, qh);
      c.fillStyle = '#2b2226';
      for (j = 0; j < 5; j++) for (i = 0; i < 4; i++) circ(c, qx + 9 + i * 18 + (j % 2) * 6, qy + 10 + j * 15, 3.6);
    }
    /* the soft fold down its length and the turned-down sheet */
    var sh = c.createLinearGradient(qx, 0, qx + qw, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.45, 'rgba(255,255,255,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.08)');
    c.fillStyle = sh; c.fillRect(qx, qy, qw, qh);
    c.restore();
    c.fillStyle = '#fffaf2';
    GG.roundRect(c, qx, qy, qw, 10, 3); c.fill();
    c.fillStyle = o && o.a ? o.a : '#ff8fb1';
    if (id === 'patch' || id === 'rainbow') c.fillStyle = '#ffa8c6';
    if (id === 'stars') c.fillStyle = '#ffe36b';
    if (id === 'gingham') c.fillStyle = '#6cc36c';
    if (id === 'ladybug') c.fillStyle = '#2b2226';
    c.fillRect(qx + 2, qy + 7, qw - 4, 1.6);
  };

  /* ================= curtains, round a window at wx, wy (ww x wh) ================= */
  A.curtain = function (c, id, wx, wy, ww, wh) {
    if (id === 'none' || !GG.HOME_DECOR.byId.curtain[id]) return;
    var o = GG.HOME_DECOR.byId.curtain[id];
    var top = wy - 9, bot = wy + wh + 12;
    function fillPanel(side) {
      /* side -1 = left, 1 = right. Gathered to the edge of the window with a tie-back. */
      var ex = side < 0 ? wx - 20 : wx + ww + 20;      // outer edge
      var ix = side < 0 ? wx + 14 : wx + ww - 14;      // inner edge at the top
      var tx = side < 0 ? wx + 1 : wx + ww - 1;        // pulled in to here at the tie
      var ty = wy + wh * 0.62;
      c.beginPath();
      c.moveTo(ex, top);
      c.lineTo(ix, top);
      c.quadraticCurveTo(ix, ty - 12, tx, ty);
      c.quadraticCurveTo(tx - side * 3, ty + 12, tx + side * 3, bot);
      c.lineTo(ex, bot + 1);
      c.closePath();
    }
    for (var s = -1; s <= 1; s += 2) {
      c.save();
      fillPanel(s); c.clip();
      var x0 = wx - 24, x1 = wx + ww + 24, x, y, k;
      c.fillStyle = o.a; c.fillRect(x0, top, x1 - x0, bot - top + 2);
      if (id === 'redcheck') {
        c.fillStyle = '#ffffff'; c.fillRect(x0, top, x1 - x0, bot - top + 2);
        c.fillStyle = 'rgba(239,90,100,0.55)';
        for (x = x0; x < x1; x += 8) c.fillRect(x, top, 4, bot - top + 2);
        for (y = top; y < bot + 2; y += 8) c.fillRect(x0, y, x1 - x0, 4);
      } else if (id === 'yellow' || id === 'lace') {
        c.fillStyle = o.b;
        for (y = top + 4, k = 0; y < bot; y += 8, k++) for (x = x0 + (k % 2) * 4; x < x1; x += 8) circ(c, x, y, id === 'lace' ? 1.8 : 1.4);
      } else if (id === 'starry') {
        c.fillStyle = o.b;
        for (y = top + 6, k = 0; y < bot; y += 12, k++) for (x = x0 + (k % 2) * 6; x < x1; x += 12) star(c, x, y, 2.6);
      } else if (id === 'leafy') {
        c.fillStyle = o.b;
        for (y = top + 6, k = 0; y < bot; y += 11, k++) for (x = x0 + (k % 2) * 6; x < x1; x += 12) leafShape(c, x - 3, y, 7, 2.5, -0.5);
      } else if (id === 'pink') {
        c.fillStyle = o.b;
        for (x = x0; x < x1; x += 10) c.fillRect(x, top, 4, bot - top + 2);
      }
      /* folds */
      c.fillStyle = 'rgba(0,0,0,0.1)';
      var ex = s < 0 ? wx - 20 : wx + ww + 20;
      for (k = 1; k <= 3; k++) c.fillRect(ex - s * k * 7.5, top, 2.2, bot - top + 2);
      c.fillStyle = 'rgba(255,255,255,0.22)';
      for (k = 1; k <= 3; k++) c.fillRect(ex - s * (k * 7.5 + 3), top, 1.6, bot - top + 2);
      c.restore();
      if (id === 'pink' || id === 'lace') {
        /* a frilly hem */
        c.fillStyle = id === 'pink' ? '#ffd9e6' : '#ffffff';
        for (x = Math.min(ex, s < 0 ? wx + 6 : ex); x < Math.max(ex, s < 0 ? wx + 6 : wx + ww - 6); x += 5) circ(c, x + 2.5, bot, 2.6);
      }
      /* tie-back */
      c.fillStyle = id === 'starry' ? '#ffe36b' : id === 'leafy' ? '#ffd23f' : '#ffffff';
      var tx = s < 0 ? wx - 1 : wx + ww + 1;
      GG.roundRect(c, s < 0 ? wx - 20 : tx - 2, wy + wh * 0.62 - 3, 22 + 1, 5, 2.5); c.fill();
    }
    /* the pole and its knobs */
    c.fillStyle = '#8a5f36';
    GG.roundRect(c, wx - 26, top - 4, ww + 52, 4, 2); c.fill();
    c.fillStyle = '#e0a86c'; circ(c, wx - 27, top - 2, 3.4); circ(c, wx + ww + 27, top - 2, 3.4);
    /* a scalloped pelmet */
    c.fillStyle = o.a;
    c.fillRect(wx - 22, top, ww + 44, 6);
    for (var px = wx - 22; px < wx + ww + 22; px += 9) circ(c, px + 4.5, top + 6, 4.5);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(wx - 22, top, ww + 44, 2);
  };

  /* ================= things ================= */
  var ITEM = A.items = {};

  ITEM.plant = function (c, x, y) {
    shadow(c, x, y, 13);
    c.fillStyle = '#2f8a44'; ell(c, x - 8, y - 22, 9, 8); ell(c, x + 8, y - 22, 9, 8);
    c.fillStyle = '#45a857'; ell(c, x, y - 30, 11, 9); ell(c, x - 10, y - 17, 7, 5); ell(c, x + 10, y - 17, 7, 5);
    c.fillStyle = '#6cc66e'; ell(c, x - 3, y - 33, 6, 4); ell(c, x + 6, y - 26, 5, 3);
    c.fillStyle = '#e37b45';
    c.beginPath(); c.moveTo(x - 10, y - 14); c.lineTo(x + 10, y - 14); c.lineTo(x + 7.5, y); c.lineTo(x - 7.5, y); c.closePath(); c.fill();
    c.fillStyle = '#f39a64'; rr(c, x - 11.5, y - 16, 23, 5, 2);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x - 6, y - 11, 2.5, 9);
  };
  ITEM.teddy = function (c, x, y) {
    shadow(c, x, y, 12);
    var b = '#c1834e', l = '#e2b17c';
    c.fillStyle = b; ell(c, x - 7, y - 3, 5, 3.5); ell(c, x + 7, y - 3, 5, 3.5);  // feet
    ell(c, x, y - 10, 9, 8.5);                                                    // body
    ell(c, x - 9, y - 12, 3.2, 5); ell(c, x + 9, y - 12, 3.2, 5);                 // arms
    circ(c, x - 6.5, y - 25, 3.4); circ(c, x + 6.5, y - 25, 3.4);                 // ears
    ell(c, x, y - 19.5, 8, 7.2);                                                  // head
    c.fillStyle = l; ell(c, x, y - 9, 5.5, 5.5); ell(c, x, y - 17, 3.8, 2.8);
    circ(c, x - 6.5, y - 25, 1.6); circ(c, x + 6.5, y - 25, 1.6);
    c.fillStyle = '#3a2618'; circ(c, x - 2.8, y - 21, 1.1); circ(c, x + 2.8, y - 21, 1.1); ell(c, x, y - 18, 1.4, 1);
    c.fillStyle = '#ef4b6a';
    c.beginPath(); c.moveTo(x, y - 13.5); c.lineTo(x - 4.5, y - 16); c.lineTo(x - 4.5, y - 11); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x, y - 13.5); c.lineTo(x + 4.5, y - 16); c.lineTo(x + 4.5, y - 11); c.closePath(); c.fill();
    circ(c, x, y - 13.5, 1.4);
  };
  ITEM.cushions = function (c, x, y) {
    shadow(c, x, y, 20, 5);
    c.fillStyle = '#ff8fb1'; rr(c, x - 19, y - 10, 38, 10, 5);
    c.fillStyle = '#6fcaf0'; rr(c, x - 15, y - 17, 26, 9, 4.5);
    c.fillStyle = '#ffd23f'; rr(c, x - 4, y - 23, 20, 9, 4.5);
    c.fillStyle = 'rgba(255,255,255,0.4)';
    c.fillRect(x - 15, y - 9, 26, 1.8); c.fillRect(x - 11, y - 16, 16, 1.6); c.fillRect(x, y - 22, 11, 1.6);
    c.fillStyle = 'rgba(0,0,0,0.18)'; circ(c, x, y - 5, 1.2); circ(c, x - 2, y - 12.5, 1.1); circ(c, x + 6, y - 18.5, 1.1);
  };
  ITEM.fern = function (c, x, y) {
    shadow(c, x, y, 16);
    var fr = [[-2.5, 26], [-2.0, 30], [-1.55, 34], [-1.1, 30], [-0.7, 26], [-2.2, 20], [-0.95, 20]];
    for (var i = 0; i < fr.length; i++) {
      var a = fr[i][0], L = fr[i][1];
      var ex = x + Math.cos(a) * L, ey = y - 14 + Math.sin(a) * L * 1.05;
      c.strokeStyle = '#3f9446'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(x, y - 14); c.quadraticCurveTo(x + Math.cos(a) * L * 0.5, y - 14 + Math.sin(a) * L * 0.9 - 6, ex, ey); c.stroke();
      c.fillStyle = i % 2 ? '#56b35a' : '#6cc66e';
      for (var k = 1; k <= 6; k++) {
        var t = k / 7;
        var px = x + (ex - x) * t, py = (y - 14) + (ey - (y - 14)) * t - Math.sin(t * Math.PI) * 5;
        var sz = 5.2 * (1 - t * 0.6);
        leafShape(c, px, py, sz, sz * 0.4, a - 1.2);
        leafShape(c, px, py, sz, sz * 0.4, a + 1.2);
      }
    }
    c.fillStyle = '#4e9ad0';
    c.beginPath(); c.moveTo(x - 11, y - 15); c.lineTo(x + 11, y - 15); c.lineTo(x + 8, y); c.lineTo(x - 8, y); c.closePath(); c.fill();
    c.fillStyle = '#76b8e6'; rr(c, x - 12.5, y - 17, 25, 5, 2);
    c.fillStyle = '#ffffff'; circ(c, x - 3, y - 8, 1.4); circ(c, x + 3, y - 6, 1.4);
  };
  ITEM.sunflower = function (c, x, y, t) {
    shadow(c, x, y, 11);
    c.strokeStyle = '#4a9a3e'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(x, y - 12); c.quadraticCurveTo(x + 3, y - 30, x, y - 44); c.stroke();
    c.fillStyle = '#5cbf52'; leafShape(c, x + 1, y - 26, 12, 4.5, -0.4); leafShape(c, x, y - 21, 11, 4.2, Math.PI + 0.35);
    c.fillStyle = '#ffc928';
    for (var i = 0; i < 12; i++) { var a = i * TAU / 12; c.save(); c.translate(x + Math.cos(a) * 7, y - 46 + Math.sin(a) * 7); c.rotate(a); ell(c, 0, 0, 5, 2.4); c.restore(); }
    c.fillStyle = '#ffe36b';
    for (i = 0; i < 12; i++) { a = i * TAU / 12 + 0.26; c.save(); c.translate(x + Math.cos(a) * 6, y - 46 + Math.sin(a) * 6); c.rotate(a); ell(c, 0, 0, 3.4, 1.5); c.restore(); }
    c.fillStyle = '#7a4a22'; circ(c, x, y - 46, 5);
    c.fillStyle = '#5a3416'; circ(c, x - 1.5, y - 47, 1); circ(c, x + 1.5, y - 45, 1); circ(c, x + 1.8, y - 47.5, 0.8);
    c.fillStyle = '#ffb04a';
    c.beginPath(); c.moveTo(x - 9, y - 13); c.lineTo(x + 9, y - 13); c.lineTo(x + 7, y); c.lineTo(x - 7, y); c.closePath(); c.fill();
    c.fillStyle = '#ffc978'; rr(c, x - 10.5, y - 15, 21, 4.5, 2);
  };
  ITEM.lamp = function (c, x, y) {
    shadow(c, x, y, 10, 3);
    c.fillStyle = '#6b4a2e'; ell(c, x, y - 1.5, 8, 2.6);
    c.fillStyle = '#8a5f36'; c.fillRect(x - 1.2, y - 50, 2.4, 49);
    c.fillStyle = '#ffd98a';
    c.beginPath(); c.moveTo(x - 7, y - 64); c.lineTo(x + 7, y - 64); c.lineTo(x + 12, y - 48); c.lineTo(x - 12, y - 48); c.closePath(); c.fill();
    c.fillStyle = '#ff9fb6'; c.fillRect(x - 12, y - 50, 24, 2.2); c.fillRect(x - 7.5, y - 64, 15, 1.8);
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.beginPath(); c.moveTo(x - 4, y - 63); c.lineTo(x - 1, y - 63); c.lineTo(x - 3, y - 51); c.lineTo(x - 7, y - 51); c.closePath(); c.fill();
  };
  ITEM.starlamp = function (c, x, y) {
    shadow(c, x, y, 9, 3);
    c.fillStyle = '#b57fd1'; rr(c, x - 7, y - 7, 14, 7, 3);
    c.fillStyle = '#d6a8ec'; c.fillRect(x - 6, y - 6, 12, 1.6);
    c.fillStyle = '#8a5f36'; c.fillRect(x - 1, y - 12, 2, 5);
    c.fillStyle = '#ffb92e'; star(c, x, y - 21, 11, 5.2);
    c.fillStyle = '#ffe36b'; star(c, x, y - 21, 8.5, 4);
    c.fillStyle = '#fff6c4'; star(c, x - 1, y - 22.5, 3.6, 1.8);
  };
  ITEM.beanbag = function (c, x, y) {
    shadow(c, x, y, 20, 5);
    c.fillStyle = '#9b6ae0';
    c.beginPath();
    c.moveTo(x - 19, y - 2);
    c.quadraticCurveTo(x - 22, y - 18, x - 8, y - 24);
    c.quadraticCurveTo(x + 6, y - 28, x + 16, y - 18);
    c.quadraticCurveTo(x + 22, y - 8, x + 18, y - 1);
    c.quadraticCurveTo(x, y + 2, x - 19, y - 2);
    c.fill();
    c.fillStyle = '#b48cf0'; ell(c, x - 2, y - 13, 12, 7);
    c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, x - 8, y - 20, 5, 2.5);
    c.strokeStyle = 'rgba(70,30,120,0.35)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x - 10, y - 7); c.quadraticCurveTo(x, y - 4, x + 12, y - 8); c.stroke();
  };
  ITEM.flowertable = function (c, x, y) {
    shadow(c, x, y, 14, 4);
    c.fillStyle = '#b07845'; c.fillRect(x - 2, y - 20, 4, 19); ell(c, x, y - 1.5, 8, 2.5);
    c.fillStyle = '#e0a86c'; ell(c, x, y - 21, 15, 4.5);
    c.fillStyle = '#c98f56'; c.fillRect(x - 15, y - 21, 30, 2);
    c.fillStyle = '#8fd3f0'; rr(c, x - 4, y - 31, 8, 10, 3);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 2.5, y - 29, 1.5, 6);
    c.strokeStyle = '#4a9a3e'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x - 6, y - 37); c.moveTo(x, y - 30); c.lineTo(x + 1, y - 39); c.moveTo(x, y - 30); c.lineTo(x + 6, y - 36); c.stroke();
    flower5(c, x - 6, y - 37.5, 2.3, '#ff6f91', '#ffe066');
    flower5(c, x + 1, y - 40, 2.3, '#ffd23f', '#ff8a3c');
    flower5(c, x + 6.5, y - 36, 2.3, '#8f86ea', '#ffe066');
  };
  ITEM.fishbowl = function (c, x, y) {
    shadow(c, x, y, 11, 3);
    c.fillStyle = '#8a5f36'; c.fillRect(x - 8, y - 18, 3, 18); c.fillRect(x + 5, y - 18, 3, 18);
    c.fillStyle = '#b07845'; rr(c, x - 11, y - 21, 22, 4, 2);
    c.fillStyle = 'rgba(200,238,255,0.55)'; circ(c, x, y - 32, 11);
    c.save(); c.beginPath(); c.arc(x, y - 32, 10.2, 0, TAU); c.clip();
    c.fillStyle = '#6fc3ec'; c.fillRect(x - 11, y - 34, 22, 14);
    c.fillStyle = '#9ad8f4'; c.fillRect(x - 11, y - 34, 22, 1.4);
    c.fillStyle = '#f2d9a0'; c.fillRect(x - 11, y - 25, 22, 4);
    c.fillStyle = '#4fae5a'; c.fillRect(x - 5, y - 31, 1.6, 7); c.fillRect(x + 4, y - 29, 1.6, 5);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(x, y - 32, 11, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, x - 5, y - 38, 2.2, 3.2);
    c.fillStyle = '#e0f4ff'; ell(c, x, y - 43, 6, 1.6);
  };
  /* the goldfish in the bowl moves, so it is drawn on top of the cached bowl */
  A.fishInBowl = function (c, x, y, t) {
    var fx = x + Math.sin(t * 0.9) * 5, dir = Math.cos(t * 0.9) > 0 ? 1 : -1;
    var fy = y - 29 + Math.sin(t * 2.1) * 1;
    c.fillStyle = '#ff8a2e';
    c.beginPath(); c.ellipse(fx, fy, 3.2, 2, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(fx - dir * 2.6, fy); c.lineTo(fx - dir * 5.2, fy - 2); c.lineTo(fx - dir * 5.2, fy + 2); c.closePath(); c.fill();
  };
  ITEM.globe = function (c, x, y) {
    shadow(c, x, y, 10, 3);
    c.fillStyle = '#8a5f36'; ell(c, x, y - 2, 8, 2.6); c.fillRect(x - 1.2, y - 18, 2.4, 16);
    c.fillStyle = '#4fa6e8'; circ(c, x, y - 30, 11);
    c.save(); c.beginPath(); c.arc(x, y - 30, 11, 0, TAU); c.clip();
    c.fillStyle = '#76c85a';
    ell(c, x - 4, y - 35, 5, 3.5); ell(c, x - 2, y - 28, 3, 4.5); ell(c, x + 5, y - 32, 4, 3); ell(c, x + 6, y - 24, 3, 2);
    c.fillStyle = '#ffffff'; ell(c, x, y - 40.5, 7, 2);
    c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, x - 4, y - 35, 4, 6);
    c.restore();
    c.strokeStyle = '#e0a86c'; c.lineWidth = 1.8;
    c.beginPath(); c.arc(x, y - 30, 13.5, -Math.PI * 0.62, Math.PI * 0.62); c.stroke();
    c.fillStyle = '#e0a86c'; circ(c, x, y - 17, 1.8);
  };
  ITEM.piano = function (c, x, y) {
    shadow(c, x, y, 18, 4);
    c.fillStyle = '#c23e58'; c.fillRect(x - 15, y - 8, 3, 8); c.fillRect(x + 12, y - 8, 3, 8);
    c.fillStyle = '#ef5a78'; rr(c, x - 18, y - 28, 36, 21, 4);
    c.fillStyle = '#ff88a1'; c.fillRect(x - 16, y - 26, 32, 2);
    c.fillStyle = '#ffffff'; c.fillRect(x - 16, y - 17, 32, 8);
    c.fillStyle = '#d9ccd0';
    for (var i = 1; i < 8; i++) c.fillRect(x - 16 + i * 4, y - 17, 0.8, 8);
    c.fillStyle = '#2b2226';
    var bk = [1, 2, 4, 5, 6];
    for (i = 0; i < bk.length; i++) c.fillRect(x - 16 + bk[i] * 4 - 1.1, y - 17, 2.2, 4.8);
    c.fillStyle = '#ffd23f'; star(c, x, y - 22, 2.8);
  };
  ITEM.stool = function (c, x, y) {
    shadow(c, x, y, 10, 3);
    c.fillStyle = '#6b4a2e'; c.fillRect(x - 7, y - 6, 2, 6); c.fillRect(x + 5, y - 6, 2, 6);
    c.fillStyle = '#e8343f';
    c.beginPath(); c.ellipse(x, y - 7, 10, 8, 0, Math.PI, 0); c.fill();
    c.fillRect(x - 10, y - 7.5, 20, 2);
    c.fillStyle = '#2b2226'; c.fillRect(x - 0.6, y - 15, 1.2, 8);
    ell(c, x - 10.5, y - 9, 3.2, 3);
    circ(c, x - 5, y - 11, 1.8); circ(c, x + 4.5, y - 11, 1.8); circ(c, x + 6.5, y - 7.5, 1.4); circ(c, x - 3, y - 8, 1.3);
    c.fillStyle = 'rgba(255,255,255,0.4)'; ell(c, x - 2, y - 13, 3, 1.2);
  };
  ITEM.easel = function (c, x, y) {
    shadow(c, x, y, 14, 3.5);
    c.strokeStyle = '#a0703f'; c.lineWidth = 2.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 11, y); c.lineTo(x - 2, y - 56); c.moveTo(x + 11, y); c.lineTo(x + 2, y - 56); c.moveTo(x, y - 2); c.lineTo(x, y - 50); c.stroke();
    c.fillStyle = '#8a5f36'; c.fillRect(x - 14, y - 22, 28, 3);
    c.fillStyle = '#ffffff'; rr(c, x - 13, y - 50, 26, 28, 2);
    c.fillStyle = '#bfe6ff'; c.fillRect(x - 11, y - 48, 22, 16);
    c.fillStyle = '#8edc6f'; c.fillRect(x - 11, y - 32, 22, 8);
    c.fillStyle = '#ffd23f'; circ(c, x + 6, y - 43, 3.2);
    flower5(c, x - 5, y - 32, 2.2, '#ff6f91', '#ffe066');
    c.strokeStyle = '#4a9a3e'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 5, y - 30); c.lineTo(x - 5, y - 25); c.stroke();
  };
  ITEM.toychest = function (c, x, y) {
    shadow(c, x, y, 21, 5);
    c.fillStyle = '#ff6b6b'; circ(c, x - 9, y - 25, 5);                 // a ball peeping out
    c.fillStyle = '#ffffff'; c.fillRect(x - 14, y - 26, 10, 1.6);
    c.fillStyle = '#c1834e'; circ(c, x + 8, y - 26, 3); circ(c, x + 13, y - 26, 3);  // teddy's ears
    c.fillStyle = '#5fb3e8'; rr(c, x - 19, y - 22, 38, 22, 3);
    c.fillStyle = '#7ec8f2'; rr(c, x - 20.5, y - 25, 41, 7, 3);
    c.fillStyle = '#ffd23f'; star(c, x - 10, y - 10, 4); star(c, x + 10, y - 10, 4);
    c.fillStyle = '#ff8fb1'; circ(c, x, y - 11, 3.4);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x - 17, y - 17, 34, 1.6);
  };
  ITEM.gameshelf = function (c, x, y) {
    shadow(c, x, y, 22, 4);
    c.fillStyle = '#b07845'; rr(c, x - 21, y - 50, 42, 50, 3);
    c.fillStyle = '#8a5f36'; c.fillRect(x - 18, y - 47, 36, 44);
    var cols = ['#ff6f7d', '#ffd23f', '#5fbdf0', '#7ed66b', '#b57fd1', '#ffa552', '#ff8fb1'];
    for (var s = 0; s < 3; s++) {
      var sy = y - 47 + s * 15;
      for (var k = 0; k < 4; k++) {
        c.fillStyle = cols[(k + s * 2) % cols.length];
        if (s === 1) rr(c, x - 17 + k * 9, sy + 3, 8, 10, 1.5);                        // board games on end
        else { c.fillRect(x - 17, sy + 11 - k * 3, 30 - k * 4, 2.8); }                  // stacked boxes
      }
      c.fillStyle = '#b07845'; c.fillRect(x - 18, sy + 13.5, 36, 2);
    }
    c.fillStyle = '#ffffff'; circ(c, x + 12, y - 36, 1.6); circ(c, x + 14, y - 38, 1.6);   // dice
    c.fillStyle = '#ff6b6b'; circ(c, x + 11, y - 55, 5);                                   // a ball on top
    c.fillStyle = '#ffd23f'; c.fillRect(x + 6, y - 56, 10, 1.6);
  };
  ITEM.rocker = function (c, x, y) {
    shadow(c, x, y, 17, 4);
    c.strokeStyle = '#8a5f36'; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 17, y - 5); c.quadraticCurveTo(x, y + 3, x + 17, y - 5); c.stroke();
    c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(x - 11, y - 2); c.lineTo(x - 11, y - 20); c.moveTo(x + 11, y - 2); c.lineTo(x + 11, y - 20); c.stroke();
    c.fillStyle = '#b07845'; rr(c, x - 13, y - 44, 26, 6, 3);
    c.fillStyle = '#c98f56';
    for (var i = -2; i <= 2; i++) c.fillRect(x + i * 5 - 1, y - 39, 2, 19);
    c.fillStyle = '#b07845'; c.fillRect(x - 13, y - 44, 3, 26); c.fillRect(x + 10, y - 44, 3, 26);
    c.fillStyle = '#c98f56'; rr(c, x - 14, y - 22, 28, 5, 2);
    c.fillStyle = '#ff8fb1'; rr(c, x - 11, y - 26, 22, 6, 3);
    c.fillStyle = '#ffc2d6'; c.fillRect(x - 8, y - 25, 16, 1.4);
  };
  ITEM.dollhouse = function (c, x, y) {
    shadow(c, x, y, 23, 5);
    c.fillStyle = '#ffb6cf'; c.fillRect(x - 19, y - 28, 38, 28);
    c.fillStyle = '#ef5a78';
    c.beginPath(); c.moveTo(x - 23, y - 27); c.lineTo(x, y - 44); c.lineTo(x + 23, y - 27); c.closePath(); c.fill();
    c.fillStyle = '#ff88a1'; c.fillRect(x - 23, y - 28.5, 46, 2.5);
    c.fillStyle = '#fff4d6'; circ(c, x, y - 34, 3.6);
    c.fillStyle = '#9ad8f4'; c.fillRect(x - 15, y - 23, 9, 8); c.fillRect(x + 6, y - 23, 9, 8);
    c.fillStyle = '#ffffff'; c.fillRect(x - 11, y - 23, 1.2, 8); c.fillRect(x + 10, y - 23, 1.2, 8);
    c.fillRect(x - 15, y - 19.5, 9, 1.2); c.fillRect(x + 6, y - 19.5, 9, 1.2);
    c.fillStyle = '#b07845'; rr(c, x - 4, y - 13, 8, 13, 2);
    c.fillStyle = '#ffd23f'; circ(c, x + 2, y - 6, 1);
    c.fillStyle = '#7ed66b'; ell(c, x - 13, y - 1.5, 5, 2.5); ell(c, x + 13, y - 1.5, 5, 2.5);
  };

  /* wall things: (x, y) is the middle of the bottom edge */
  ITEM.bunting = function (c, x, y, t, def) {
    var w = (def && def.fw) || 96, x0 = x - w / 2, top = y - 22;
    c.strokeStyle = '#fff4e0'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(x0, top); c.quadraticCurveTo(x, top + 10, x0 + w, top); c.stroke();
    var n = Math.round(w / 12);
    for (var i = 0; i < n; i++) {
      var u = (i + 0.5) / n, fx = x0 + u * w, fy = top + 4 * (1 - Math.pow(2 * u - 1, 2)) * 1.25;
      c.fillStyle = RAINBOW[i % RAINBOW.length];
      c.beginPath(); c.moveTo(fx - 5, fy); c.lineTo(fx + 5, fy); c.lineTo(fx, fy + 12); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(fx - 4, fy, 8, 1.4);
    }
  };
  ITEM.garland = function (c, x, y, t, def) {
    var w = (def && def.fw) || 80, x0 = x - w / 2, top = y - 20;
    c.strokeStyle = '#8a6a45'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(x0, top); c.quadraticCurveTo(x, top + 14, x0 + w, top); c.stroke();
    var n = 7;
    for (var i = 0; i < n; i++) {
      var u = (i + 0.5) / n, fx = x0 + u * w, fy = top + 7 * (1 - Math.pow(2 * u - 1, 2)) * 1;
      c.strokeStyle = '#8a6a45'; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy + 4 + (i % 2) * 4); c.stroke();
      c.fillStyle = i % 2 ? '#ffe36b' : '#ffb92e'; star(c, fx, fy + 8 + (i % 2) * 4, 4.4);
      c.fillStyle = 'rgba(255,255,255,0.6)'; circ(c, fx - 1, fy + 7 + (i % 2) * 4, 1);
    }
  };
  ITEM.poster = function (c, x, y) {
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x - 15, y - 42, 34, 44);
    c.fillStyle = '#ffffff'; c.fillRect(x - 17, y - 44, 34, 44);
    c.fillStyle = '#e4f6ff'; c.fillRect(x - 15, y - 42, 30, 40);
    c.fillStyle = '#8edc6f'; c.fillRect(x - 15, y - 9, 30, 7);
    c.fillStyle = '#ff9a3c'; ell(c, x - 7, y - 28, 7, 8.5); ell(c, x + 7, y - 28, 7, 8.5);
    c.fillStyle = '#ffc24a'; ell(c, x - 5.5, y - 18, 4.5, 5); ell(c, x + 5.5, y - 18, 4.5, 5);
    c.fillStyle = '#2b2226'; ell(c, x, y - 24, 1.6, 9);
    c.fillStyle = '#ffffff'; circ(c, x - 10, y - 31, 1.5); circ(c, x + 10, y - 31, 1.5); circ(c, x - 11, y - 25, 1); circ(c, x + 11, y - 25, 1);
    c.strokeStyle = '#2b2226'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(x - 0.5, y - 32); c.quadraticCurveTo(x - 3, y - 37, x - 5, y - 38); c.moveTo(x + 0.5, y - 32); c.quadraticCurveTo(x + 3, y - 37, x + 5, y - 38); c.stroke();
    c.fillStyle = '#ef5a78'; circ(c, x - 17, y - 44, 1.6); circ(c, x + 17, y - 44, 1.6);
  };
  ITEM.clock = function (c, x, y, t) {
    c.fillStyle = '#6b4a2e'; c.fillRect(x - 0.6, y - 12, 1.2, 12); c.fillRect(x + 5.4, y - 12, 1.2, 9);
    c.fillStyle = '#ffd23f'; ell(c, x, y - 1, 2, 3); ell(c, x + 6, y - 2.5, 2, 3);
    c.fillStyle = '#9a6f43'; c.fillRect(x - 11, y - 30, 22, 18);
    c.fillStyle = '#c1834e';
    c.beginPath(); c.moveTo(x - 14, y - 29); c.lineTo(x, y - 41); c.lineTo(x + 14, y - 29); c.closePath(); c.fill();
    c.fillStyle = '#7ed66b'; leafShape(c, x - 13, y - 29, 7, 2.4, -0.2); leafShape(c, x + 13, y - 29, 7, 2.4, Math.PI + 0.2);
    c.fillStyle = '#fff8e8'; circ(c, x, y - 21, 6.5);
    c.strokeStyle = '#3a2618'; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - 21); c.lineTo(x, y - 25.5); c.moveTo(x, y - 21); c.lineTo(x + 3.2, y - 21); c.stroke();
    c.fillStyle = '#3a2618'; circ(c, x, y - 33, 2.6);
    c.fillStyle = '#ffd23f';
    c.beginPath(); c.moveTo(x - 1, y - 33); c.lineTo(x - 4.5, y - 32); c.lineTo(x - 1, y - 31.5); c.fill();
  };
  ITEM.rainbowpic = function (c, x, y) {
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x - 19, y - 30, 42, 32);
    c.fillStyle = '#e0a86c'; c.fillRect(x - 21, y - 32, 42, 32);
    c.fillStyle = '#eaf8ff'; c.fillRect(x - 18, y - 29, 36, 26);
    c.save(); c.beginPath(); c.rect(x - 18, y - 29, 36, 26); c.clip();
    c.lineWidth = 2.6;
    for (var i = 0; i < 6; i++) { c.strokeStyle = RAINBOW[i]; c.beginPath(); c.arc(x, y - 3, 16 - i * 2.6, Math.PI, 0); c.stroke(); }
    c.fillStyle = '#ffffff'; ell(c, x - 14, y - 5, 6, 3.5); ell(c, x + 14, y - 5, 6, 3.5); ell(c, x - 11, y - 8, 3.5, 3); ell(c, x + 11, y - 8, 3.5, 3);
    c.restore();
  };
  ITEM.mirror = function (c, x, y) {
    c.fillStyle = 'rgba(0,0,0,0.12)'; circ(c, x + 2, y - 14, 16);
    c.fillStyle = '#f2b93c'; circ(c, x, y - 16, 16);
    c.fillStyle = '#ffd97a';
    for (var i = 0; i < 12; i++) circ(c, x + Math.cos(i * TAU / 12) * 14.5, y - 16 + Math.sin(i * TAU / 12) * 14.5, 2);
    var g = c.createLinearGradient(x - 11, y - 27, x + 11, y - 5);
    g.addColorStop(0, '#e9f8ff'); g.addColorStop(1, '#a9d8f0');
    c.fillStyle = g; circ(c, x, y - 16, 11.5);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.save(); c.translate(x - 4, y - 20); c.rotate(-0.7); c.fillRect(-1.5, -6, 3, 12); c.fillRect(3.5, -3, 1.5, 7); c.restore();
  };

  /* the paint pots and the little easel by the door: tap here to decorate */
  ITEM._decorate = function (c, x, y) {
    shadow(c, x, y, 18, 4);
    c.strokeStyle = '#a0703f'; c.lineWidth = 2.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 8, y - 2); c.lineTo(x - 1, y - 46); c.moveTo(x + 8, y - 2); c.lineTo(x + 1, y - 46); c.stroke();
    c.fillStyle = '#8a5f36'; c.fillRect(x - 12, y - 20, 24, 3);
    c.fillStyle = '#ffffff'; rr(c, x - 12, y - 44, 24, 24, 2);
    /* a painting of the cottage itself */
    c.fillStyle = '#c9ecff'; c.fillRect(x - 10, y - 42, 20, 13);
    c.fillStyle = '#8edc6f'; c.fillRect(x - 10, y - 29, 20, 7);
    c.fillStyle = '#ffe6b0'; c.fillRect(x - 5, y - 34, 10, 7);
    c.fillStyle = '#ef5a64';
    c.beginPath(); c.moveTo(x - 7, y - 34); c.lineTo(x, y - 40); c.lineTo(x + 7, y - 34); c.closePath(); c.fill();
    c.fillStyle = '#8a5f36'; c.fillRect(x - 1.2, y - 31, 2.4, 4);
    /* paint pots at its feet */
    var pots = [[-13, '#ff5a6e'], [-5.5, '#ffd23f'], [13, '#4fa6e8']];
    for (var i = 0; i < pots.length; i++) {
      var px = x + pots[i][0];
      c.fillStyle = '#d7dde3'; rr(c, px - 4, y - 8, 8, 8, 1.5);
      c.fillStyle = pots[i][1]; ell(c, px, y - 8, 4, 1.6); c.fillRect(px - 4, y - 8, 8, 2.4);
      c.fillRect(px - 4.5 + (i === 2 ? 0 : 8), y - 6, 1.4, 3);
    }
    c.strokeStyle = '#a0703f'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(x + 13, y - 8); c.lineTo(x + 17, y - 17); c.stroke();
    c.fillStyle = '#ff5a6e'; circ(c, x + 17.3, y - 17.6, 1.6);
  };

  A.drawItem = function (c, id, x, y, t, def) {
    var f = ITEM[id]; if (!f) return;
    f(c, x, y, t || 0, def || GG.HOME_DECOR.byId.item[id]);
    if (id === 'fishbowl') A.fishInBowl(c, x, y, t || 0);
  };

  /* A thing drawn once to its own little canvas at the screen's resolution;
     the room then just stamps it. Keyed by the drawing scale. */
  var _sprites = {}, _spriteScale = 0;
  A.SPR_PAD = 14;
  A.sprite = function (id, scale) {
    if (scale !== _spriteScale) { _sprites = {}; _spriteScale = scale; }
    var sp = _sprites[id];
    if (sp) return sp;
    var def = GG.HOME_DECOR.byId.item[id] || { fw: 40, ht: 52 };
    var pad = A.SPR_PAD, bw = def.fw + pad * 2 + 12, bh = def.ht + pad * 2;
    var cv = document.createElement('canvas');
    cv.width = Math.ceil(bw * scale); cv.height = Math.ceil(bh * scale);
    var c = cv.getContext('2d');
    c.scale(scale, scale);
    ITEM[id](c, bw / 2, def.ht + pad, 0, def);
    sp = _sprites[id] = { cv: cv, w: bw, h: bh, ax: bw / 2, ay: def.ht + pad };
    return sp;
  };
  /* a soft pool of light round a lamp at night, drawn once */
  var _glow = null;
  A.glowSprite = function () {
    if (_glow) return _glow;
    _glow = document.createElement('canvas'); _glow.width = _glow.height = 128;
    var c = _glow.getContext('2d'), g = c.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,214,120,0.55)'); g.addColorStop(0.5, 'rgba(255,200,110,0.2)'); g.addColorStop(1, 'rgba(255,200,110,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    return _glow;
  };

  /* ================= swatches for the decorating panel ================= */
  A.swatch = function (c, kind, id, w, h) {
    var H = GG.House, s, B;
    c.clearRect(0, 0, w, h);
    if (kind === 'wall') {
      A.wallPattern(c, id, 0, 0, w, h * 0.78);
      c.fillStyle = id === 'panel' ? '#7f4f2c' : (id === 'cream' ? '#b98f63' : '#ffffff');
      c.fillRect(0, h * 0.78 - 5, w, 5);
      A.floorPattern(c, 'honey', 0, h * 0.78, w, h * 0.22);
    } else if (kind === 'floor') {
      A.floorPattern(c, id, 0, 0, w, h);
    } else if (kind === 'rug') {
      A.floorPattern(c, 'honey', 0, 0, w, h);
      if (id === 'none') {
        c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = 'bold 13px "Trebuchet MS", sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('bare floor', w / 2, h / 2);
      } else {
        s = Math.min(w / 190, h / 110);
        A.rug(c, id, w / 2, h / 2 + 2, s);
      }
    } else if (kind === 'quilt') {
      A.floorPattern(c, 'honey', 0, 0, w, h);
      s = Math.min(w / 120, h / 118);
      c.save(); c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2); c.scale(s, s);
      B = { x0: -39, x1: 39, y0: -50, y1: 50 };
      c.fillStyle = '#9a6f43'; GG.roundRect(c, B.x0, B.y0 - 8, 78, 108, 5); c.fill();
      c.fillStyle = '#f6eadf'; GG.roundRect(c, B.x0 + 4, B.y0, 70, 22, 5); c.fill();
      A.quilt(c, id, B);
      c.restore();
    } else if (kind === 'curtain') {
      A.wallPattern(c, 'cream', 0, 0, w, h);
      s = Math.min(w / 112, h / 88);
      c.save(); c.translate(w / 2 - 28 * s, h / 2 - 22 * s); c.scale(s, s);
      c.fillStyle = '#8a6a45'; GG.roundRect(c, -4, -4, 64, 54, 4); c.fill();
      c.fillStyle = '#a7dcf4'; c.fillRect(0, 0, 56, 46);
      c.fillStyle = '#7fc46a'; c.fillRect(0, 34, 56, 12);
      c.fillStyle = '#ffe98a'; circ(c, 42, 12, 6);
      c.strokeStyle = '#8a6a45'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(28, 0); c.lineTo(28, 46); c.moveTo(0, 23); c.lineTo(56, 23); c.stroke();
      A.curtain(c, id, 0, 0, 56, 46);
      c.restore();
    } else if (kind === 'item') {
      var def = GG.HOME_DECOR.byId.item[id];
      if (def.wall) A.wallPattern(c, 'cream', 0, 0, w, h);
      else {
        c.fillStyle = '#fff4dc'; c.fillRect(0, 0, w, h);
      }
      var bw = def.fw + 16, bh = def.ht + 12;
      s = Math.min(w / bw, h / bh, 2.2);
      c.save(); c.translate(w / 2, h - (h - def.ht * s) / 2); c.scale(s, s);
      A.drawItem(c, id, 0, 0, 0, def);
      c.restore();
    }
  };
})(window.GG = window.GG || {});
