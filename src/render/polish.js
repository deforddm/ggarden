/* v1.23: the polish pass - small things that make the garden feel alive.

   - cloud shadows drifting slowly over the ground by day
   - a puff of dust, sand, snow or a few flecks of grass at every footstep,
     and a ring on the water when she wades
   - a soft white streak behind the net as it swings
   - a ring of sparkles where a bug is caught
   - a faint darkening at the corners of the screen, so the eye rests on her

   Nothing here changes how the game plays. Everything is pooled and cheap:
   a few dozen small shapes a frame at the very most. */
(function (GG) {
  'use strict';
  var TAU = Math.PI * 2;
  var puffs = [], rings = [], sparks = [], trail = [];
  var blob = null, vig = null, vigKey = '';
  var DUST = { sand: '#e9d5a0', stone: '#b9b3a6', snow: '#ffffff', grass: '#7fc75f', wood: null, water: null };

  function soft() {
    if (blob) return blob;
    blob = document.createElement('canvas'); blob.width = blob.height = 128;
    var g = blob.getContext('2d'), gr = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    gr.addColorStop(0, 'rgba(18,36,60,1)'); gr.addColorStop(0.55, 'rgba(18,36,60,0.6)'); gr.addColorStop(1, 'rgba(18,36,60,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return blob;
  }

  /* the clouds: fixed shapes in a patch of sky that repeats, sliding east */
  var FIELD_W = 2600, FIELD_H = 1900;
  var CLOUDS = [];
  (function () {
    var R = GG.mulberry32 ? GG.mulberry32(20261123) : Math.random;
    for (var i = 0; i < 7; i++) {
      var lumps = [], n = 3 + Math.floor(R() * 2);
      for (var k = 0; k < n; k++) lumps.push({ dx: (k - (n - 1) / 2) * (110 + R() * 50), dy: (R() - 0.5) * 70, rx: 150 + R() * 110, ry: 90 + R() * 60 });
      CLOUDS.push({ x: R() * FIELD_W, y: R() * FIELD_H, v: 9 + R() * 7, lumps: lumps });
    }
  })();

  var Polish = GG.Polish = {
    on: true,

    step: function (x, y, surf) {
      if (!this.on) return;
      if (surf === 'water') {
        if (rings.length < 14) rings.push({ x: x, y: y + 3, age: 0, life: 0.9 });
        return;
      }
      var col = DUST[surf == null ? 'grass' : surf];
      if (!col) return;
      var n = surf === 'grass' ? 2 : 3;
      for (var i = 0; i < n && puffs.length < 40; i++) {
        puffs.push({ x: x + (Math.random() - 0.5) * 8, y: y + 2 + Math.random() * 2, vx: (Math.random() - 0.5) * 16,
          vy: -(surf === 'grass' ? 26 : 10) - Math.random() * 12, r: surf === 'grass' ? 1.1 : 2.2 + Math.random() * 1.6,
          age: 0, life: surf === 'grass' ? 0.42 : 0.6, col: col, fleck: surf === 'grass' });
      }
    },

    burst: function (x, y, col) {
      if (!this.on) return;
      for (var i = 0; i < 9 && sparks.length < 36; i++) {
        var a = i / 9 * TAU + Math.random() * 0.3;
        sparks.push({ x: x, y: y, vx: Math.cos(a) * 62, vy: Math.sin(a) * 62 - 14, age: 0, life: 0.5 + Math.random() * 0.2,
          col: i % 3 ? '#fff6b8' : (col || '#ffffff'), r: 2 + Math.random() * 1.6 });
      }
    },

    update: function (dt, P) {
      var i;
      for (i = puffs.length - 1; i >= 0; i--) {
        var p = puffs[i]; p.age += dt;
        if (p.age >= p.life) { puffs.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.fleck ? 110 : 14) * dt; p.vx *= 0.94;
      }
      for (i = rings.length - 1; i >= 0; i--) { rings[i].age += dt; if (rings[i].age >= rings[i].life) rings.splice(i, 1); }
      for (i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i]; s.age += dt;
        if (s.age >= s.life) { sparks.splice(i, 1); continue; }
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.9; s.vy *= 0.9;
      }
      /* the net leaves a streak while it is moving */
      if (P && P.swinging && P.swinging() && P.netPoint) {
        var np = P.netPoint();
        if (np) trail.push({ x: np.x, y: np.y, age: 0 });
      }
      for (i = trail.length - 1; i >= 0; i--) { trail[i].age += dt; if (trail[i].age > 0.2) trail.splice(i, 1); }
      for (i = 0; i < CLOUDS.length; i++) CLOUDS[i].x = (CLOUDS[i].x + CLOUDS[i].v * dt) % FIELD_W;
    },

    /* on the ground, under everything that stands up */
    drawGround: function (c, cam) {
      var i;
      for (i = 0; i < rings.length; i++) {
        var r = rings[i], k = r.age / r.life;
        c.strokeStyle = 'rgba(255,255,255,' + (0.55 * (1 - k)).toFixed(3) + ')';
        c.lineWidth = 1.4;
        c.beginPath(); c.ellipse(r.x - cam.x, r.y - cam.y, 4 + k * 15, 2 + k * 6.5, 0, 0, TAU); c.stroke();
        if (k > 0.3) { c.beginPath(); c.ellipse(r.x - cam.x, r.y - cam.y, 2 + (k - 0.3) * 12, 1 + (k - 0.3) * 5, 0, 0, TAU); c.stroke(); }
      }
      for (i = 0; i < puffs.length; i++) {
        var p = puffs[i], q = p.age / p.life;
        c.globalAlpha = (p.fleck ? 0.9 : 0.5) * (1 - q);
        c.fillStyle = p.col;
        if (p.fleck) c.fillRect(p.x - cam.x - 0.7, p.y - cam.y - 1.4, 1.4, 2.8);
        else { c.beginPath(); c.arc(p.x - cam.x, p.y - cam.y, p.r * (0.7 + q * 0.9), 0, TAU); c.fill(); }
      }
      c.globalAlpha = 1;
    },

    /* over the world: the net's streak and the sparkles of a catch */
    drawOver: function (c, cam) {
      var i;
      if (trail.length > 1) {
        c.lineCap = 'round'; c.lineJoin = 'round';
        for (i = 1; i < trail.length; i++) {
          var a = trail[i - 1], b = trail[i], k = 1 - b.age / 0.2;
          if (k <= 0) continue;
          c.strokeStyle = 'rgba(255,255,255,' + (0.5 * k).toFixed(3) + ')';
          c.lineWidth = 2 + 7 * k;
          c.beginPath(); c.moveTo(a.x - cam.x, a.y - cam.y); c.lineTo(b.x - cam.x, b.y - cam.y); c.stroke();
        }
      }
      for (i = 0; i < sparks.length; i++) {
        var s = sparks[i], q = s.age / s.life, r = s.r * (1 - q * 0.5), x = s.x - cam.x, y = s.y - cam.y;
        c.globalAlpha = 1 - q;
        c.fillStyle = s.col;
        c.beginPath();
        c.moveTo(x, y - r * 2); c.quadraticCurveTo(x, y, x + r * 2, y); c.quadraticCurveTo(x, y, x, y + r * 2);
        c.quadraticCurveTo(x, y, x - r * 2, y); c.quadraticCurveTo(x, y, x, y - r * 2); c.fill();
      }
      c.globalAlpha = 1;
    },

    /* cloud shadows: only in daylight, and not under a grey rainy sky */
    drawClouds: function (c, cam, vw, vh, night, rain) {
      if (!this.on || rain || night > 0.6) return;
      var img = soft(), a = 0.16 * (1 - night / 0.6);
      c.globalAlpha = a;
      for (var i = 0; i < CLOUDS.length; i++) {
        var cl = CLOUDS[i];
        /* where this cloud's nearest copy is, relative to the screen */
        var x = ((cl.x - cam.x * 1.0) % FIELD_W + FIELD_W) % FIELD_W, y = ((cl.y - cam.y) % FIELD_H + FIELD_H) % FIELD_H;
        if (x > FIELD_W - 500) x -= FIELD_W;
        if (y > FIELD_H - 300) y -= FIELD_H;
        if (x < -500 || x > vw + 500 || y < -300 || y > vh + 300) continue;
        for (var k = 0; k < cl.lumps.length; k++) {
          var L = cl.lumps[k];
          c.drawImage(img, x + L.dx - L.rx, y + L.dy - L.ry, L.rx * 2, L.ry * 2);
        }
      }
      c.globalAlpha = 1;
    },

    drawVignette: function (c, vw, vh) {
      if (!this.on) return;
      var key = Math.round(vw) + 'x' + Math.round(vh);
      if (!vig || vigKey !== key) {
        vigKey = key;
        vig = document.createElement('canvas'); vig.width = 160; vig.height = 160;
        var g = vig.getContext('2d'), gr = g.createRadialGradient(80, 76, 52, 80, 80, 116);
        gr.addColorStop(0, 'rgba(10,24,30,0)'); gr.addColorStop(1, 'rgba(10,24,30,0.34)');
        g.fillStyle = gr; g.fillRect(0, 0, 160, 160);
      }
      c.drawImage(vig, 0, 0, vw, vh);
    },

    clear: function () { puffs.length = rings.length = sparks.length = trail.length = 0; },
    counts: function () { return { puffs: puffs.length, rings: rings.length, sparks: sparks.length, trail: trail.length, clouds: CLOUDS.length }; }
  };
})(window.GG = window.GG || {});
