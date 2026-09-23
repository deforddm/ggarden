/* DOG'S PARADISE - a friendly off-leash dog park: agility bits to run
   through, a kennel, a bench for the grown-ups, a water bowl, and toys
   dropped all over the grass. Same prop convention as propart.js:
   P.name(c, x, y, r, t, seed, col) with the BASE at (x, y) and r a size
   radius (about 45 px to a metre). Suggested sizes:
     dogJump 24   dogWeave 24   dogTunnel 28   dogHouse 26   hydrant 14
     parkBench 24   dogBowl 10   tennisBall 4   boneToy 9
   The last three lie FLAT on the grass. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); c.fill();
  }
  function shadow(c, x, y, rx) {
    c.fillStyle = 'rgba(30,60,25,0.16)';
    ell(c, x, y, rx, rx * 0.38);
  }
  function quad(c, a, b, d, e) {
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]);
    c.closePath(); c.fill();
  }

  var P = GG.Props = GG.Props || {};

  /* A striped upright pole, with its little foot, from the ground up. */
  function upright(c, x, y, w, h, colA, colB, bands) {
    var i, bh = h / bands;
    c.fillStyle = 'rgba(40,40,40,0.3)';
    ell(c, x, y, w * 1.9, w * 0.7);
    for (i = 0; i < bands; i++) {
      c.fillStyle = i % 2 ? colB : colA;
      c.fillRect(x - w / 2, y - bh * (i + 1), w, bh + 0.3);
    }
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.fillRect(x - w / 2, y - h, w * 0.3, h);
    c.fillStyle = 'rgba(0,0,0,0.12)';
    c.fillRect(x + w * 0.2, y - h, w * 0.3, h);
    c.fillStyle = colA;
    ell(c, x, y - h, w / 2, w * 0.22);
  }

  /* ---------------- agility bar jump ---------------- */
  /* Two striped wings and a bar resting in cups - low, because a jump is
     for fun here, not a competition. */
  P.dogJump = function (c, x, y, r, t, seed, col) {
    var hw = r * 0.95, ph = r * 1.3, pw = Math.max(2, r * 0.11);
    var barY = y - r * 0.72, bar = col || '#3f8ad0';
    shadow(c, x + 1, y, r * 1.05);
    /* the uprights */
    upright(c, x - hw, y, pw, ph, '#f4f2ec', '#e2453c', 6);
    upright(c, x + hw, y, pw, ph, '#f4f2ec', '#e2453c', 6);
    /* the cups the bar sits in */
    c.fillStyle = '#3a3a3a';
    c.fillRect(x - hw + pw * 0.5, barY - pw * 0.3, pw * 0.7, pw * 0.9);
    c.fillRect(x + hw - pw * 1.2, barY - pw * 0.3, pw * 0.7, pw * 0.9);
    /* the bar: striped so a dog can see it */
    var bw = hw * 2 - pw * 0.6, bx = x - hw + pw * 0.3, n = 6, i;
    for (i = 0; i < n; i++) {
      c.fillStyle = i % 2 ? '#ffd85c' : bar;
      c.fillRect(bx + bw * i / n, barY - pw * 0.55, bw / n + 0.3, pw * 1.1);
    }
    c.fillStyle = 'rgba(255,255,255,0.4)';
    c.fillRect(bx, barY - pw * 0.55, bw, pw * 0.3);
    c.fillStyle = 'rgba(0,0,0,0.15)';
    c.fillRect(bx, barY + pw * 0.25, bw, pw * 0.3);
  };

  /* ---------------- weave poles ---------------- */
  /* Six poles on a flat base. The dog goes in with the first pole on its
     left shoulder and weaves out the far end. */
  P.dogWeave = function (c, x, y, r, t, seed, col) {
    var n = 6, gap = r * 0.46, span = gap * (n - 1), i;
    var ph = r * 1.55, pw = Math.max(1.8, r * 0.085);
    var x0 = x - span / 2, tape = col || '#ffd85c';
    shadow(c, x + 1, y, span * 0.62);
    /* the base rail and its feet */
    c.fillStyle = '#5a6068';
    c.fillRect(x0 - r * 0.2, y - r * 0.07, span + r * 0.4, r * 0.1);
    c.fillStyle = '#7a8088';
    c.fillRect(x0 - r * 0.2, y - r * 0.07, span + r * 0.4, r * 0.035);
    c.fillStyle = '#4a4f56';
    ell(c, x0 - r * 0.2, y, r * 0.08, r * 0.2);
    ell(c, x0 + span + r * 0.2, y, r * 0.08, r * 0.2);
    for (i = 0; i < n; i++) {
      var px = x0 + gap * i;
      var sway = Math.sin(t * 2.2 + i * 0.9 + seed * 5) * 0.4;
      c.save();
      c.translate(px, y - r * 0.05);
      c.rotate(sway * 0.02);
      c.fillStyle = '#f4f2ec';
      c.fillRect(-pw / 2, -ph, pw, ph);
      /* the bright tape round each pole, alternating high and low */
      c.fillStyle = i % 2 ? tape : '#e2453c';
      c.fillRect(-pw / 2, -ph * 0.92, pw, ph * 0.14);
      c.fillRect(-pw / 2, -ph * 0.5, pw, ph * 0.14);
      c.fillStyle = 'rgba(0,0,0,0.13)';
      c.fillRect(pw * 0.1, -ph, pw * 0.4, ph);
      c.fillStyle = '#f4f2ec';
      ell(c, 0, -ph, pw / 2, pw * 0.25);
      c.restore();
    }
  };

  /* ---------------- tunnel ---------------- */
  /* A long fabric tunnel lying in a gentle curve, hoops showing through
     the cloth, the near end open and dark. */
  P.dogTunnel = function (c, x, y, r, t, seed, col) {
    var L = r * 3.2, R = r * 0.42, bow = r * 0.55, N = 12, i;
    var cols = col ? [col, GG.shade(col, 0.3)] : ['#e2453c', '#f2a93a', '#ffd85c', '#5ab050', '#3f8ad0', '#8a5ac0'];
    function C(s) {
      var u = 1 - s;
      return [u * u * (x - L / 2) + 2 * u * s * x + s * s * (x + L / 2),
              u * u * (y - R) + 2 * u * s * (y - R - bow) + s * s * (y - R + bow * 0.25)];
    }
    function N_(s) {
      var u = 1 - s;
      var tx = 2 * u * L / 2 + 2 * s * L / 2;
      var ty = 2 * u * -bow + 2 * s * (bow + bow * 0.25);
      var l = Math.sqrt(tx * tx + ty * ty);
      return [ty / l, -tx / l];                     // points up the screen
    }
    function edge(s, k) { var p = C(s), n = N_(s); return [p[0] + n[0] * R * k, p[1] + n[1] * R * k]; }
    /* the shadow along the ground under it */
    c.fillStyle = 'rgba(30,60,25,0.17)';
    for (i = 0; i <= N; i++) {
      var ps = C(i / N);
      ell(c, ps[0] + 2, ps[1] + R * 0.95, R * 1.05, R * 0.4);
    }
    /* the far end: a closed-looking rim */
    var e0 = C(0);
    c.fillStyle = GG.shade(cols[0], -0.3);
    ell(c, e0[0], e0[1], R * 0.4, R, 0.25);
    /* the cloth, band by band */
    for (i = 0; i < N; i++) {
      var s0 = i / N, s1 = (i + 1) / N;
      c.fillStyle = cols[Math.floor(i / 2) % cols.length];
      quad(c, edge(s0, 1), edge(s1, 1.02), edge(s1, -0.95), edge(s0, -0.95));
      /* shade on the underside, shine along the top */
      c.fillStyle = 'rgba(0,0,0,0.16)';
      quad(c, edge(s0, -0.35), edge(s1, -0.35), edge(s1, -0.95), edge(s0, -0.95));
      c.fillStyle = 'rgba(255,255,255,0.26)';
      quad(c, edge(s0, 0.85), edge(s1, 0.85), edge(s1, 0.45), edge(s0, 0.45));
    }
    /* the hoops showing through */
    c.strokeStyle = 'rgba(40,30,30,0.28)'; c.lineWidth = Math.max(0.8, r * 0.04); c.lineCap = 'round';
    for (i = 1; i < N; i += 2) {
      var a = edge(i / N, 1), b = edge(i / N, -0.95);
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    }
    /* the open end, nearest to you */
    var e1 = C(1), n1 = N_(1), ang = Math.atan2(n1[1], n1[0]) + Math.PI / 2;
    c.fillStyle = cols[Math.floor((N - 1) / 2) % cols.length];
    ell(c, e1[0] + 0.5, e1[1], R * 0.5, R * 1.02, ang);
    c.fillStyle = '#2a2224';
    ell(c, e1[0] + R * 0.1, e1[1] + R * 0.02, R * 0.36, R * 0.84, ang);
    c.fillStyle = 'rgba(255,255,255,0.12)';
    ell(c, e1[0] + R * 0.02, e1[1] + R * 0.3, R * 0.2, R * 0.4, ang);
  };

  /* ---------------- kennel ---------------- */
  var NAMES = ['REX', 'BO', 'PIP', 'MAX', 'LUNA', 'BEAN'];
  P.dogHouse = function (c, x, y, r, t, seed, col) {
    var w = r * 1.5, h = r * 0.95, dx = r * 0.42, dy = r * 0.3;
    var fx = x - w / 2 - dx * 0.3, wood = col || '#c8904e';
    var roofH = r * 0.62, ov = r * 0.12, i;
    shadow(c, x + r * 0.1, y, r * 1.1);
    /* the side wall, going back to the right */
    c.fillStyle = GG.shade(wood, -0.22);
    quad(c, [fx + w, y], [fx + w + dx, y - dy], [fx + w + dx, y - dy - h], [fx + w, y - h]);
    /* the front wall, with its planks */
    c.fillStyle = wood;
    c.beginPath();
    c.moveTo(fx, y); c.lineTo(fx + w, y); c.lineTo(fx + w, y - h);
    c.lineTo(fx + w / 2, y - h - roofH); c.lineTo(fx, y - h);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(wood, -0.18); c.lineWidth = Math.max(0.7, r * 0.03);
    for (i = 1; i < 5; i++) {
      var ly = y - (h + roofH * 0.6) * i / 5;
      c.beginPath(); c.moveTo(fx, ly); c.lineTo(fx + w, ly); c.stroke();
    }
    /* the roof: red boards, the near slope in front and the far slope
       showing on top */
    var ridgeF = [fx + w / 2, y - h - roofH - ov * 0.4];
    var ridgeB = [ridgeF[0] + dx, ridgeF[1] - dy];
    var eaveR = [fx + w + ov, y - h + ov * 0.7];
    c.fillStyle = '#b8403a';
    quad(c, ridgeF, ridgeB, [eaveR[0] + dx, eaveR[1] - dy], eaveR);
    c.strokeStyle = 'rgba(80,20,20,0.35)'; c.lineWidth = Math.max(0.6, r * 0.025);
    for (i = 1; i < 4; i++) {
      var k = i / 4;
      c.beginPath();
      c.moveTo(ridgeF[0] + (eaveR[0] - ridgeF[0]) * k, ridgeF[1] + (eaveR[1] - ridgeF[1]) * k);
      c.lineTo(ridgeF[0] + (eaveR[0] - ridgeF[0]) * k + dx, ridgeF[1] + (eaveR[1] - ridgeF[1]) * k - dy);
      c.stroke();
    }
    /* the front edge boards of the roof */
    c.strokeStyle = '#d8554a'; c.lineWidth = Math.max(1.6, r * 0.1); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(fx - ov, y - h + ov * 0.7); c.lineTo(ridgeF[0], ridgeF[1]); c.lineTo(eaveR[0], eaveR[1]);
    c.stroke();
    c.strokeStyle = '#9a302c'; c.lineWidth = Math.max(0.8, r * 0.04);
    c.beginPath(); c.moveTo(ridgeF[0], ridgeF[1]); c.lineTo(ridgeB[0], ridgeB[1]); c.stroke();
    /* the arched door */
    var dw = w * 0.46, dh = h * 0.8, dcx = fx + w / 2;
    c.fillStyle = GG.shade(wood, -0.3);
    c.beginPath();
    c.moveTo(dcx - dw / 2 - r * 0.05, y);
    c.lineTo(dcx - dw / 2 - r * 0.05, y - dh + dw / 2);
    c.arc(dcx, y - dh + dw / 2, dw / 2 + r * 0.05, Math.PI, 0);
    c.lineTo(dcx + dw / 2 + r * 0.05, y);
    c.closePath(); c.fill();
    c.fillStyle = '#2a1e18';
    c.beginPath();
    c.moveTo(dcx - dw / 2, y);
    c.lineTo(dcx - dw / 2, y - dh + dw / 2);
    c.arc(dcx, y - dh + dw / 2, dw / 2, Math.PI, 0);
    c.lineTo(dcx + dw / 2, y);
    c.closePath(); c.fill();
    /* a cosy blanket peeping out of the doorway */
    c.fillStyle = '#6a9ad0';
    ell(c, dcx, y - r * 0.02, dw * 0.42, r * 0.07);
    /* the name plate over the door */
    var py = y - h - roofH * 0.25, pw = w * 0.42, phh = r * 0.2;
    c.fillStyle = '#f4ecd4';
    GG.roundRect(c, dcx - pw / 2, py - phh / 2, pw, phh, phh * 0.4); c.fill();
    c.strokeStyle = GG.shade(wood, -0.35); c.lineWidth = Math.max(0.6, r * 0.025);
    GG.roundRect(c, dcx - pw / 2, py - phh / 2, pw, phh, phh * 0.4); c.stroke();
    var name = NAMES[Math.floor(Math.abs(seed) * 997) % NAMES.length];
    if (r >= 18) {
      c.fillStyle = '#5a3a22';
      c.font = 'bold ' + (phh * 0.78).toFixed(1) + 'px sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(name, dcx, py + phh * 0.04);
      c.textAlign = 'start'; c.textBaseline = 'alphabetic';
    } else {
      c.fillStyle = '#5a3a22';
      c.fillRect(dcx - pw * 0.3, py - phh * 0.1, pw * 0.6, phh * 0.2);
    }
    /* a bone painted on the side wall */
    c.save();
    c.translate(fx + w + dx * 0.5, y - dy * 0.5 - h * 0.55);
    c.transform(0.5, -dy / dx * 0.5, 0, 1, 0, 0);
    drawBone(c, 0, 0, r * 0.2, '#f4ecd4');
    c.restore();
  };

  /* ---------------- fire hydrant ---------------- */
  /* Every dog park's favourite landmark. */
  P.hydrant = function (c, x, y, r, t, seed, col) {
    var red = col || '#d8343a', dk = GG.shade(red, -0.3), lt = GG.shade(red, 0.35);
    var bw = r * 0.62, bh = r * 1.35;
    shadow(c, x + 1, y, r * 0.7);
    /* the base flange */
    c.fillStyle = dk;
    ell(c, x, y - r * 0.05, r * 0.62, r * 0.2);
    c.fillStyle = red;
    c.fillRect(x - r * 0.6, y - r * 0.24, r * 1.2, r * 0.18);
    ell(c, x, y - r * 0.24, r * 0.6, r * 0.18);
    /* the barrel */
    c.fillStyle = red;
    c.fillRect(x - bw / 2, y - r * 0.24 - bh, bw, bh);
    c.fillStyle = lt;
    c.fillRect(x - bw * 0.36, y - r * 0.24 - bh, bw * 0.16, bh);
    c.fillStyle = 'rgba(0,0,0,0.16)';
    c.fillRect(x + bw * 0.18, y - r * 0.24 - bh, bw * 0.32, bh);
    /* the side nozzles, and the big one facing you */
    var ny = y - r * 1.05;
    c.fillStyle = red;
    GG.roundRect(c, x - bw / 2 - r * 0.3, ny - r * 0.16, r * 0.34, r * 0.32, r * 0.08); c.fill();
    GG.roundRect(c, x + bw / 2 - r * 0.04, ny - r * 0.16, r * 0.34, r * 0.32, r * 0.08); c.fill();
    c.fillStyle = '#e8c04a';
    ell(c, x - bw / 2 - r * 0.3, ny, r * 0.07, r * 0.15);
    ell(c, x + bw / 2 + r * 0.3, ny, r * 0.07, r * 0.15);
    c.fillStyle = dk;
    ell(c, x, ny + r * 0.05, r * 0.22, r * 0.22);
    c.fillStyle = '#e8c04a';
    ell(c, x, ny + r * 0.05, r * 0.13, r * 0.13);
    /* the collar ring and the domed bonnet */
    var ty = y - r * 0.24 - bh;
    c.fillStyle = dk;
    ell(c, x, ty, bw * 0.62, r * 0.14);
    c.fillStyle = red;
    c.beginPath(); c.ellipse(x, ty - r * 0.02, bw * 0.52, r * 0.42, 0, Math.PI, 0); c.fill();
    c.fillStyle = lt;
    ell(c, x - bw * 0.18, ty - r * 0.22, bw * 0.14, r * 0.1, -0.4);
    c.fillStyle = '#e8c04a';
    ell(c, x, ty - r * 0.44, r * 0.1, r * 0.08);
    c.fillRect(x - r * 0.05, ty - r * 0.52, r * 0.1, r * 0.1);
  };

  /* ---------------- park bench ---------------- */
  P.parkBench = function (c, x, y, r, t, seed, col) {
    var hw = r * 1.3, i;
    var wood = col || '#b8844a', iron = '#3a4a3a';
    var seatY = y - r * 0.55, back = r * 0.32;          // how far back the backrest sits (up the screen)
    shadow(c, x + 2, y + r * 0.02, r * 1.4);
    c.strokeStyle = iron; c.lineWidth = Math.max(1.4, r * 0.08); c.lineCap = 'round';
    /* back legs and the backrest frame */
    [-1, 1].forEach(function (s) {
      var lx = x + s * (hw - r * 0.12);
      c.beginPath(); c.moveTo(lx, y - back * 0.9); c.lineTo(lx, seatY - back - r * 0.62); c.stroke();
    });
    /* the backrest boards */
    for (i = 0; i < 2; i++) {
      var by = seatY - back - r * (0.26 + i * 0.25);
      c.fillStyle = GG.shade(wood, -0.08);
      GG.roundRect(c, x - hw, by - r * 0.09, hw * 2, r * 0.18, r * 0.05); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)';
      c.fillRect(x - hw + r * 0.05, by - r * 0.09, hw * 2 - r * 0.1, r * 0.05);
    }
    /* the seat: three boards seen from a little above */
    for (i = 0; i < 3; i++) {
      var sy = seatY - back + (i + 0.5) * (back / 3) + r * 0.02;
      c.fillStyle = i === 2 ? GG.shade(wood, -0.18) : wood;
      GG.roundRect(c, x - hw - r * 0.04, sy - back / 7, hw * 2 + r * 0.08, back / 3.8, r * 0.03); c.fill();
    }
    c.fillStyle = GG.shade(wood, -0.3);
    c.fillRect(x - hw - r * 0.04, seatY + r * 0.03, hw * 2 + r * 0.08, r * 0.07);
    /* front legs and the curly armrests */
    c.strokeStyle = iron; c.lineWidth = Math.max(1.4, r * 0.09);
    [-1, 1].forEach(function (s) {
      var lx = x + s * (hw - r * 0.12);
      c.beginPath(); c.moveTo(lx, y); c.lineTo(lx, seatY); c.stroke();
      c.beginPath();
      c.moveTo(lx, seatY);
      c.quadraticCurveTo(lx + s * r * 0.1, seatY - r * 0.42, lx, seatY - back - r * 0.3);
      c.stroke();
      c.lineWidth = Math.max(1, r * 0.06);
      c.beginPath(); c.arc(lx - s * r * 0.02, seatY - r * 0.14, r * 0.08, 0, Math.PI * 1.5); c.stroke();
      c.lineWidth = Math.max(1.4, r * 0.09);
    });
    c.fillStyle = '#5a6a5a';
    ell(c, x - hw + r * 0.12, y, r * 0.1, r * 0.04);
    ell(c, x + hw - r * 0.12, y, r * 0.1, r * 0.04);
  };

  /* ---------------- water bowl ---------------- */
  /* A big, heavy bowl that nobody can tip over, kept full. Flat on the
     ground. */
  P.dogBowl = function (c, x, y, r, t, seed, col) {
    var bowl = col || '#4a8fd0';
    var cy = y - r * 0.2, i;
    c.fillStyle = 'rgba(30,60,25,0.2)';
    ell(c, x + r * 0.12, y + r * 0.06, r * 1.1, r * 0.5);
    /* the sloping side of the bowl */
    c.fillStyle = GG.shade(bowl, -0.2);
    ell(c, x, cy + r * 0.2, r * 0.92, r * 0.44);
    c.fillRect(x - r * 0.92, cy, r * 1.84, r * 0.2);
    c.fillStyle = bowl;
    ell(c, x, cy, r, r * 0.5);
    /* the rim */
    c.fillStyle = GG.shade(bowl, 0.3);
    ell(c, x, cy - r * 0.02, r * 0.86, r * 0.42);
    /* the water, with a wobble of light across it */
    c.fillStyle = '#6ab8e8';
    ell(c, x, cy, r * 0.76, r * 0.36);
    c.fillStyle = '#8ad0f4';
    ell(c, x, cy - r * 0.04, r * 0.7, r * 0.3);
    var sh = Math.sin(t * 1.7 + seed * 9);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    ell(c, x - r * 0.28 + sh * r * 0.06, cy - r * 0.12, r * 0.22, r * 0.06, -0.15);
    ell(c, x + r * 0.2 - sh * r * 0.05, cy + r * 0.1, r * 0.1, r * 0.035, -0.1);
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = Math.max(0.5, r * 0.04);
    var rp = (t * 0.5 + seed) % 1;
    c.beginPath(); c.ellipse(x + r * 0.1, cy, r * 0.6 * rp, r * 0.26 * rp, 0, 0, Math.PI * 2);
    c.globalAlpha = 1 - rp; c.stroke(); c.globalAlpha = 1;
  };

  /* ---------------- tennis ball ---------------- */
  /* The ball itself, centred at (x, y), radius s - so a dog can carry one. */
  GG.drawTennisBall = function (c, x, y, s, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot || 0);
    c.fillStyle = '#b8d42a';
    ell(c, 0, 0, s, s);
    c.fillStyle = '#d4ea4a';
    ell(c, -s * 0.12, -s * 0.12, s * 0.84, s * 0.84);
    c.fillStyle = 'rgba(255,255,255,0.35)';
    ell(c, -s * 0.35, -s * 0.4, s * 0.3, s * 0.22, -0.5);
    /* the curving seam, like a sideways S */
    c.strokeStyle = '#f8f8ee'; c.lineWidth = Math.max(0.6, s * 0.16); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-s * 0.72, -s * 0.66);
    c.bezierCurveTo(-s * 0.1, -s * 0.2, -s * 0.2, s * 0.35, -s * 0.5, s * 0.84);
    c.stroke();
    c.beginPath();
    c.moveTo(s * 0.62, -s * 0.8);
    c.bezierCurveTo(s * 0.25, -s * 0.3, s * 0.2, s * 0.25, s * 0.78, s * 0.62);
    c.stroke();
    /* a fuzzy rim */
    c.strokeStyle = 'rgba(230,245,150,0.5)'; c.lineWidth = Math.max(0.4, s * 0.1);
    c.beginPath(); c.arc(0, 0, s * 0.96, 0, Math.PI * 2); c.stroke();
    c.restore();
  };
  P.tennisBall = function (c, x, y, r, t, seed) {
    c.fillStyle = 'rgba(30,60,25,0.22)';
    ell(c, x + r * 0.3, y, r * 1.05, r * 0.42);
    GG.drawTennisBall(c, x, y - r * 0.85, r, seed * 6);
  };

  /* ---------------- chew toys ---------------- */
  function drawBone(c, x, y, s, col) {
    c.fillStyle = col;
    c.fillRect(x - s * 1.3, y - s * 0.32, s * 2.6, s * 0.64);
    [-1, 1].forEach(function (k) {
      ell(c, x + k * s * 1.35, y - s * 0.34, s * 0.42, s * 0.42);
      ell(c, x + k * s * 1.35, y + s * 0.34, s * 0.42, s * 0.42);
    });
  }
  /* A chew bone or a knotted rope toy (chosen by seed), lying on the
     grass. */
  P.boneToy = function (c, x, y, r, t, seed, col) {
    var ang = (seed * 7.3 % 1 - 0.5) * 0.8, i;
    c.save();
    c.translate(x, y - r * 0.2);
    c.rotate(ang);
    c.scale(1, 0.62);                                   /* lying flat */
    c.fillStyle = 'rgba(30,60,25,0.22)';
    ell(c, r * 0.12, r * 0.3, r * 1.15, r * 0.5);
    if ((seed * 3.1) % 1 < 0.5) {
      drawBone(c, 0, 0, r * 0.62, '#cfc4ae');
      drawBone(c, 0, -r * 0.08, r * 0.6, col || '#f4ecd8');
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.fillRect(-r * 0.7, -r * 0.24, r * 1.4, r * 0.1);
    } else {
      /* the rope: twisted stripes between two fat knots, frayed ends */
      var cA = col || '#e2453c', cB = '#f4f2ec', cC = '#3f8ad0';
      var len = r * 0.8, th = r * 0.42;
      for (i = 0; i < 8; i++) {
        c.fillStyle = [cA, cB, cC, cB][i % 4];
        c.save();
        c.translate(-len + (i + 0.5) * len * 2 / 8, 0);
        c.rotate(0.5);
        c.fillRect(-len / 8 - 0.3, -th / 0.9 / 2, len / 4 + 0.6, th / 0.9);
        c.restore();
      }
      c.fillStyle = 'rgba(0,0,0,0.12)';
      c.fillRect(-len, th * 0.2, len * 2, th * 0.35);
      [-1, 1].forEach(function (k) {
        var kx = k * len;
        /* the frayed tassel */
        c.strokeStyle = cB; c.lineWidth = Math.max(0.5, r * 0.07); c.lineCap = 'round';
        for (var j = -2; j <= 2; j++) {
          c.beginPath(); c.moveTo(kx, 0);
          c.lineTo(kx + k * r * (0.5 + (j % 2 ? 0.08 : 0)), j * r * 0.12);
          c.stroke();
        }
        c.fillStyle = cA;
        ell(c, kx, 0, r * 0.32, r * 0.38);
        c.fillStyle = cC;
        ell(c, kx - k * r * 0.06, -r * 0.05, r * 0.13, r * 0.3, 0.5);
        c.fillStyle = 'rgba(255,255,255,0.3)';
        ell(c, kx - r * 0.08, -r * 0.12, r * 0.1, r * 0.06);
      });
    }
    c.restore();
  };
})(window.GG = window.GG || {});
