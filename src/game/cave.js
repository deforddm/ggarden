/* The lava tube, up on Cloudtop Ridge.

   A lava tube is not a limestone cave. Lava kept running inside a crust that
   had hardened round it, and when the eruption stopped the pipe drained and
   left a tunnel behind. So: no stalactites - the blunt knobs on the ceiling
   are drips of melted rock. And nothing grows in the dark, so every scrap of
   food in here was carried in from outside, mostly by bats coming home. The
   bats are not visitors in this place. They are the farmers.

   Two things in here are lessons rather than scenery. She wipes her boots on
   the brush before she goes in, because people carry the white-nose fungus on
   their boots. And if she walks towards the sleeping bats she stops on her
   own and turns her light away, because waking a hibernating bat once costs
   it about three weeks of its stored food. */
(function (GG) {
  'use strict';

  var W = 1560, H = 720;
  var FLOORY = H - 56;            // the rubble floor
  var BATS = { x: 1252, y: 150, r: 150 };

  function ceilAt(x) {
    return 132 + Math.sin(x * 0.0042) * 34 + Math.sin(x * 0.011 + 1.4) * 12;
  }

  var Cave = GG.Cave = {
    W: W, H: H, FLOORY: FLOORY, BATS: BATS,
    START: { x: 250, y: FLOORY - 104 },   // clear of the way out, and above the rock pile
    ceilAt: ceilAt,
    turned: 0,                    // how far her lantern is turned away

    spots: [
      { id: 'out', x: 62, y: FLOORY - 60, w: 84, h: 150, label: 'Go Outside' }
    ],

    /* the room Critters borrows when she is in here */
    room: {
      biome: 'cave', W: W, H: H,
      blocked: function (x, y, r) { return Cave.blocked(x, y, r); }
    },

    blocked: function (x, y, rad) {
      if (x < 46 + rad || x > W - 46 - rad) return true;
      if (y > FLOORY - rad) return true;
      if (y < ceilAt(x) + 54 + rad) return true;
      /* the breakdown pile - a heap of angular blocks off the ceiling */
      var dx = x - 856, dy = (y - (FLOORY - 34)) * 1.7;
      if (dx * dx + dy * dy < (86 + rad) * (86 + rad)) return true;
      return false;
    },

    nearest: function (px, py) {
      var best = null, bd = 1e9;
      for (var i = 0; i < this.spots.length; i++) {
        var s = this.spots[i];
        var dx = Math.max(0, Math.abs(px - s.x) - s.w / 2);
        var dy = Math.max(0, Math.abs(py - s.y) - s.h / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 70 && d < bd) { bd = d; best = s; }
      }
      return best;
    },

    /* She stops herself, rather than being stopped. Returns true the moment
       she first turns her light away, so the toast is shown once a visit. */
    checkBats: function (px, py) {
      /* They are up in the arch and she is on the floor, so what matters is
         how far along the tunnel she is, not how far away in a straight line. */
      var d = Math.abs(px - BATS.x);
      var want = GG.clamp(1 - (d - 90) / 150, 0, 1);
      var was = this.turned;
      this.turned += (want - this.turned) * 0.12;
      return was < 0.5 && this.turned >= 0.5;
    },

    /* ---------- drawing ---------- */
    draw: function (c, cam, t, px, py) {
      var x, i;
      c.save();
      c.translate(-cam.x, -cam.y);

      /* ---- the rock all round ---- */
      c.fillStyle = '#241f1d';
      c.fillRect(0, 0, W, H);

      /* ---- the tube itself: floor, then the arch of the ceiling ---- */
      c.fillStyle = '#3a3632';
      c.beginPath();
      c.moveTo(0, H);
      c.lineTo(0, ceilAt(0) + 40);
      for (x = 0; x <= W; x += 20) c.lineTo(x, ceilAt(x) + 40);
      c.lineTo(W, H);
      c.closePath();
      c.fill();

      /* the dark zone is most of the floor */
      for (x = 0; x < W; x += 22) {
        for (var y = ceilAt(x) + 60; y < H; y += 22) {
          var n = GG.noise2(x / 70, y / 70, 61);
          if (n > 0.62) { c.fillStyle = '#1f1c1a'; c.fillRect(x, y, 24, 24); }
          else if (n < 0.24) { c.fillStyle = '#443e38'; c.fillRect(x, y, 24, 24); }
        }
      }
      /* a drift of pale silt, and wet flowstone sheen */
      c.fillStyle = 'rgba(91,81,72,0.55)';
      c.beginPath(); c.ellipse(430, FLOORY - 30, 210, 44, 0.05, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(43,58,58,0.5)';
      c.beginPath(); c.ellipse(1080, FLOORY - 22, 170, 34, -0.04, 0, Math.PI * 2); c.fill();

      /* ---- the ceiling, with its baked mineral glaze ---- */
      c.fillStyle = '#2e2a27';
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(W, 0);
      for (x = W; x >= 0; x -= 20) c.lineTo(x, ceilAt(x) + 40);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(138,79,46,0.5)'; c.lineWidth = 7;
      c.beginPath();
      for (x = 0; x <= W; x += 20) { if (x === 0) c.moveTo(x, ceilAt(x) + 42); else c.lineTo(x, ceilAt(x) + 42); }
      c.stroke();
      c.strokeStyle = 'rgba(122,103,72,0.4)'; c.lineWidth = 3;
      c.beginPath();
      for (x = 0; x <= W; x += 20) { if (x === 0) c.moveTo(x, ceilAt(x) + 54); else c.lineTo(x, ceilAt(x) + 54); }
      c.stroke();

      /* lavacicles - blunt drips of melted rock, NOT stalactites */
      var rnd = GG.mulberry32(4242);
      c.fillStyle = '#211d1b';
      for (i = 0; i < 46; i++) {
        var lx = 70 + rnd() * (W - 140), ly = ceilAt(lx) + 40;
        var lh = 10 + rnd() * 20, lw = 6 + rnd() * 7;
        c.beginPath();
        c.moveTo(lx - lw, ly);
        c.quadraticCurveTo(lx - lw * 0.5, ly + lh, lx, ly + lh + 3);
        c.quadraticCurveTo(lx + lw * 0.5, ly + lh, lx + lw, ly);
        c.closePath(); c.fill();
      }

      /* flow ledges - the high-water mark of a river of rock */
      [0.40, 0.62].forEach(function (f) {
        c.strokeStyle = 'rgba(70,62,56,0.85)'; c.lineWidth = 5;
        c.beginPath();
        for (var lx2 = 0; lx2 <= W; lx2 += 24) {
          var ly2 = ceilAt(lx2) + 40 + (FLOORY - ceilAt(lx2) - 40) * f;
          if (lx2 === 0) c.moveTo(lx2, ly2); else c.lineTo(lx2, ly2);
        }
        c.stroke();
      });

      /* cave slime - alive, and the bottom of the food chain in here */
      c.fillStyle = 'rgba(62,90,68,0.5)';
      for (i = 0; i < 26; i++) {
        var sx = 120 + rnd() * (W - 240), sy = ceilAt(sx) + 54 + rnd() * 90;
        c.beginPath(); c.ellipse(sx, sy, 12 + rnd() * 16, 5 + rnd() * 7, rnd(), 0, Math.PI * 2); c.fill();
      }

      /* ---- the breakdown pile ---- */
      c.fillStyle = '#1b1816';
      for (i = 0; i < 11; i++) {
        var bx = 856 + (rnd() - 0.5) * 150, by = FLOORY - 6 - rnd() * 54;
        var bw = 16 + rnd() * 22;
        c.beginPath();
        c.moveTo(bx - bw, by + bw * 0.5);
        c.lineTo(bx - bw * 0.6, by - bw * 0.6);
        c.lineTo(bx + bw * 0.7, by - bw * 0.4);
        c.lineTo(bx + bw, by + bw * 0.5);
        c.closePath(); c.fill();
        c.fillStyle = 'rgba(78,72,66,0.6)';
        c.beginPath();
        c.moveTo(bx - bw * 0.6, by - bw * 0.6);
        c.lineTo(bx + bw * 0.7, by - bw * 0.4);
        c.lineTo(bx + bw * 0.1, by - bw * 0.1);
        c.closePath(); c.fill();
        c.fillStyle = '#1b1816';
      }

      /* ---- an ice column, where the cold air pools ---- */
      var icex = 1420;
      c.fillStyle = 'rgba(184,212,220,0.55)';
      c.beginPath();
      c.moveTo(icex - 26, FLOORY);
      c.quadraticCurveTo(icex - 14, FLOORY - 120, icex - 20, ceilAt(icex) + 44);
      c.lineTo(icex + 22, ceilAt(icex) + 44);
      c.quadraticCurveTo(icex + 16, FLOORY - 120, icex + 30, FLOORY);
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(232,244,246,0.6)';
      c.fillRect(icex - 12, ceilAt(icex) + 48, 7, FLOORY - ceilAt(icex) - 50);
      c.fillStyle = 'rgba(94,136,150,0.45)';
      c.fillRect(icex + 10, ceilAt(icex) + 48, 5, FLOORY - ceilAt(icex) - 50);

      /* ---- the bats, high in the arch and out of reach ---- */
      var dim = 1 - this.turned * 0.75;
      c.save();
      c.globalAlpha = 0.55 + 0.45 * dim;
      for (i = 0; i < 9; i++) {
        var ax = BATS.x + (i % 3) * 26 - 26 + (i > 5 ? 13 : 0);
        var ay = BATS.y + Math.floor(i / 3) * 17;
        c.fillStyle = '#17120f';
        c.beginPath(); c.ellipse(ax, ay + 9, 6, 11, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#241c17';
        c.beginPath(); c.ellipse(ax, ay + 2, 4.5, 4, 0, 0, Math.PI * 2); c.fill();
      }
      c.restore();

      /* ---- the entrance: one hard cold shaft, and green only in its cone ---- */
      var g = c.createLinearGradient(0, 0, 250, FLOORY);
      g.addColorStop(0, 'rgba(191,214,224,0.85)');
      g.addColorStop(0.55, 'rgba(191,214,224,0.30)');
      g.addColorStop(1, 'rgba(191,214,224,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(300, 0); c.lineTo(180, FLOORY); c.lineTo(0, FLOORY);
      c.closePath(); c.fill();
      /* moss and ferns, stopping dead at the edge of the light */
      for (i = 0; i < 22; i++) {
        var gx = 56 + rnd() * 150, gy = FLOORY - 4 - rnd() * 60;
        c.strokeStyle = 'rgba(96,138,72,' + (0.9 - (gx - 56) / 210).toFixed(2) + ')';
        c.lineWidth = 2.4; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(gx, gy);
        c.quadraticCurveTo(gx + 5, gy - 14, gx + 13, gy - 22);
        c.stroke();
      }
      /* the way out */
      c.fillStyle = 'rgba(214,232,240,0.5)';
      c.beginPath();
      c.moveTo(0, FLOORY); c.lineTo(0, ceilAt(0) + 50);
      c.quadraticCurveTo(46, ceilAt(0) + 30, 76, FLOORY);
      c.closePath(); c.fill();

      c.restore();

      /* ---- her lantern, and nothing beyond it ---- */
      var lx3 = px - cam.x, ly3 = py - cam.y;
      var reach = 224 * (1 - this.turned * 0.38);
      var lamp = c.createRadialGradient(lx3, ly3 - 12, 10, lx3, ly3 - 12, reach);
      lamp.addColorStop(0, 'rgba(255,217,160,0.34)');
      lamp.addColorStop(0.55, 'rgba(255,217,160,0.12)');
      lamp.addColorStop(1, 'rgba(255,217,160,0)');
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = lamp;
      c.fillRect(0, 0, GG.view.w, GG.view.h);
      c.restore();
    },

    /* The dark, painted over everything that walks, so the lantern and the
       daylight are the only places you can see anything at all. */
    drawDark: function (c, cam, px, py) {
      var lx = px - cam.x, ly = py - cam.y;
      var reach = 244 * (1 - this.turned * 0.38);
      c.save();
      var g = c.createRadialGradient(lx, ly - 12, reach * 0.22, lx, ly - 12, reach);
      g.addColorStop(0, 'rgba(6,6,10,0)');
      g.addColorStop(0.7, 'rgba(6,6,10,0.42)');
      g.addColorStop(1, 'rgba(6,6,10,0.80)');
      c.fillStyle = g;
      c.fillRect(0, 0, GG.view.w, GG.view.h);
      /* the daylight at the mouth never goes dark */
      var dg = c.createLinearGradient(-cam.x, 0, 320 - cam.x, 0);
      dg.addColorStop(0, 'rgba(6,6,10,0.80)');
      dg.addColorStop(1, 'rgba(6,6,10,0)');
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = dg;
      c.fillRect(0, 0, Math.max(0, 320 - cam.x), GG.view.h);
      c.restore();
    }
  };
})(window.GG = window.GG || {});
