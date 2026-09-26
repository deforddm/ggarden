/* Ambient life in the open world (v1.20): petals drifting through the
   cherry grove and the garden, dandelion fluff over the meadow, pollen in
   the sunbeams of the glade, leaves coming down in the woods, snow glinting
   on the tundra, rain splashing, and at night fireflies, lit windows and a
   soft glow round Guin.

   All of it is decoration only - nothing here can be caught, nothing moves
   a real creature, and none of it is big or busy enough to hide a bug.
   Particles live in a fixed pool (no allocation while playing), there are
   never more than MAX of them, and they only move while the world is
   drawn, so they stop when a panel is open like everything else. */
(function (GG) {
  'use strict';

  var TAU = Math.PI * 2;
  var MAX = 44;
  var pool = [], live = 0;
  for (var i = 0; i < MAX; i++) {
    pool.push({ on: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, life: 0, max: 1, s: 1, col: 0, ph: 0 });
  }
  var PETAL = 1, FLUFF = 2, MOTE = 3, LEAF = 4, FIREFLY = 5, SPLASH = 6;

  /* what drifts where: [kind, spawns per second, most at once] */
  var BY_PLACE = {
    cherry: [PETAL, 4.5, 26], garden: [PETAL, 1.4, 10], orchard: [LEAF, 0.9, 7],
    meadow: [FLUFF, 1.3, 10], birdtown: [FLUFF, 1.0, 8], savanna: [FLUFF, 0.7, 6],
    farmyard: [FLUFF, 0.6, 5], dogpark: [FLUFF, 0.7, 6], hill: [FLUFF, 0.6, 5],
    glade: [MOTE, 4, 24], forest: [LEAF, 1.3, 9], rainforest: [MOTE, 1.6, 12],
    taiga: [LEAF, 0.5, 4], bamboo: [LEAF, 0.9, 7], pond: [FLUFF, 0.5, 4]
  };
  /* where fireflies dance on a summer night */
  var FIREFLY_OK = { meadow: 1, garden: 1, pond: 1, forest: 1, glade: 1, orchard: 1, swamp: 1,
    riverbank: 1, cherry: 1, birdtown: 1, farmyard: 1, bamboo: 1, dogpark: 1, rainforest: 1 };

  var PETAL_COLS = ['#ffc6da', '#ffb3cf', '#ffe1ec', '#fff0f5'];
  var GARDEN_COLS = ['#ffb3cf', '#ffe38a', '#c9b5ff', '#ffffff'];
  var LEAF_COLS = ['#8fcf5a', '#e8b53a', '#e07b3a', '#b6d65c'];

  function take() {
    if (live >= MAX) return null;
    for (var i = 0; i < MAX; i++) if (!pool[i].on) { pool[i].on = true; live++; return pool[i]; }
    return null;
  }
  function drop(p) { p.on = false; live--; }

  /* a soft round glow, painted once */
  var glowCv = null;
  function glowSprite() {
    if (glowCv) return glowCv;
    glowCv = document.createElement('canvas');
    glowCv.width = glowCv.height = 64;
    var g = glowCv.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return glowCv;
  }
  /* warm lamplight, painted once */
  var warmCv = null;
  function warmSprite() {
    if (warmCv) return warmCv;
    warmCv = document.createElement('canvas');
    warmCv.width = warmCv.height = 128;
    var g = warmCv.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,210,120,0.9)');
    gr.addColorStop(0.35, 'rgba(255,180,90,0.38)');
    gr.addColorStop(1, 'rgba(255,160,70,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return warmCv;
  }

  var FX = GG.FX = {
    lastT: -1,
    acc: 0,
    count: function () { return live; },

    /* move everything on, and let new things in; dt comes from the world
       clock, so a paused game stays still */
    update: function (t, cam, vw, vh) {
      var dt = this.lastT < 0 ? 0 : t - this.lastT;
      this.lastT = t;
      if (dt <= 0) return;
      if (dt > 0.1) dt = 0.1;
      var P = GG.Player, W = GG.World;
      var place = W.biomeAt(P.x, P.y);
      var night = GG.Time.isDark(), rain = GG.Time.rain;
      var rule = BY_PLACE[place], i, p, n = 0;

      /* how many of each are out now */
      var have = 0, flies = 0, splashes = 0;
      for (i = 0; i < MAX; i++) {
        p = pool[i];
        if (!p.on) continue;
        if (rule && p.kind === rule[0]) have++;
        if (p.kind === FIREFLY) flies++;
        if (p.kind === SPLASH) splashes++;
      }

      if (rule && !(rain && rule[0] !== LEAF) && !(night && rule[0] === MOTE)) {
        this.acc += dt * rule[1];
        while (this.acc >= 1) {
          this.acc -= 1;
          if (have < rule[2]) { this.spawn(rule[0], place, cam, vw, vh); have++; }
        }
      }
      if (night && !rain && FIREFLY_OK[place] && flies < 9 && Math.random() < dt * 2.5) this.spawn(FIREFLY, place, cam, vw, vh);
      if (rain && splashes < 14) {
        var want = dt * 22;
        while (want > 0 && splashes < 14) {
          if (Math.random() < want) { this.spawn(SPLASH, place, cam, vw, vh); splashes++; }
          want -= 1;
        }
      }

      var x0 = cam.x - 60, x1 = cam.x + vw + 60, y0 = cam.y - 80, y1 = cam.y + vh + 60;
      for (i = 0; i < MAX; i++) {
        p = pool[i];
        if (!p.on) continue;
        p.life += dt;
        if (p.life >= p.max || p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) { drop(p); continue; }
        var k = p.kind;
        if (k === PETAL || k === LEAF) {
          /* a flutter from side to side as it falls */
          p.x += (p.vx + Math.sin(p.life * 2.2 + p.ph) * 14) * dt;
          p.y += p.vy * dt;
          p.a += p.va * dt;
        } else if (k === FLUFF) {
          p.x += (p.vx + Math.sin(p.life * 0.9 + p.ph) * 6) * dt;
          p.y += (p.vy + Math.sin(p.life * 1.3 + p.ph) * 4) * dt;
        } else if (k === MOTE) {
          p.x += (p.vx + Math.sin(p.life * 0.7 + p.ph) * 5) * dt;
          p.y += (p.vy + Math.cos(p.life * 0.8 + p.ph) * 4) * dt;
        } else if (k === FIREFLY) {
          p.x += Math.sin(p.life * 0.8 + p.ph) * 16 * dt;
          p.y += Math.cos(p.life * 0.6 + p.ph * 2) * 11 * dt;
        }
        n++;
      }
      return n;
    },

    spawn: function (kind, place, cam, vw, vh) {
      var p = take();
      if (!p) return;
      p.kind = kind; p.life = 0; p.ph = Math.random() * TAU; p.a = Math.random() * TAU;
      p.col = (Math.random() * 4) | 0;
      if (kind === PETAL || kind === LEAF) {
        /* from the top and the upwind side, drifting down and across */
        if (Math.random() < 0.6) { p.x = cam.x + Math.random() * vw; p.y = cam.y - 20; }
        else { p.x = cam.x - 20; p.y = cam.y + Math.random() * vh * 0.7; }
        p.vx = 14 + Math.random() * 18; p.vy = 18 + Math.random() * 16;
        p.va = (Math.random() - 0.5) * 5; p.max = 14; p.s = kind === LEAF ? 1 : (place === 'garden' ? 0.85 : 1);
        if (place === 'garden') p.col += 10;
      } else if (kind === FLUFF) {
        p.x = cam.x + Math.random() * vw; p.y = cam.y + vh * (0.3 + Math.random() * 0.75);
        p.vx = 8 + Math.random() * 10; p.vy = -(4 + Math.random() * 8);
        p.max = 10 + Math.random() * 6; p.s = 0.8 + Math.random() * 0.5;
      } else if (kind === MOTE) {
        p.x = cam.x + Math.random() * vw; p.y = cam.y + Math.random() * vh;
        p.vx = 3 + Math.random() * 5; p.vy = -(2 + Math.random() * 4);
        p.max = 5 + Math.random() * 4; p.s = 0.7 + Math.random() * 0.8;
      } else if (kind === FIREFLY) {
        p.x = cam.x + 20 + Math.random() * (vw - 40); p.y = cam.y + 30 + Math.random() * (vh - 60);
        p.max = 6 + Math.random() * 5; p.s = 1;
      } else if (kind === SPLASH) {
        p.x = cam.x + Math.random() * vw; p.y = cam.y + Math.random() * vh;
        p.max = 0.45 + Math.random() * 0.2; p.s = GG.World.isWater(p.x, p.y) ? 2 : 1;
      }
    },

    /* things on the ground, drawn just above it: snow glints and rain
       rings. Cheap: a few dozen dots at fixed places, no pool. */
    drawGround: function (c, cam, t, vw, vh) {
      var W = GG.World;
      var place = W.biomeAt(GG.Player.x, GG.Player.y);
      if (place === 'tundra' || place === 'mountain') {
        var step = 34, x0 = Math.floor(cam.x / step), y0 = Math.floor(cam.y / step);
        var x1 = Math.floor((cam.x + vw) / step), y1 = Math.floor((cam.y + vh) / step);
        c.fillStyle = '#ffffff';
        for (var gy = y0; gy <= y1; gy++) {
          for (var gx = x0; gx <= x1; gx++) {
            var h = GG.hash2(gx, gy, 71);
            if (h > (place === 'tundra' ? 0.45 : 0.2)) continue;
            var ph = Math.sin(t * 1.9 + h * 83);
            if (ph < 0.6) continue;
            var x = gx * step + GG.hash2(gx, gy, 72) * step, y = gy * step + GG.hash2(gx, gy, 73) * step;
            if (W.biomeAt(x, y) !== place) continue;
            var a = (ph - 0.6) / 0.4, r = 0.8 + a * 2.4, sx = x - cam.x, sy = y - cam.y;
            c.globalAlpha = 0.4 + a * 0.6;
            c.beginPath();
            c.moveTo(sx, sy - r); c.quadraticCurveTo(sx, sy, sx + r, sy);
            c.quadraticCurveTo(sx, sy, sx, sy + r); c.quadraticCurveTo(sx, sy, sx - r, sy);
            c.quadraticCurveTo(sx, sy, sx, sy - r); c.fill();
          }
        }
        c.globalAlpha = 1;
      }
      /* raindrops landing: a ring on the water, a little crown of drops on land */
      var any = false;
      for (var i = 0; i < MAX; i++) {
        var p = pool[i];
        if (!p.on || p.kind !== SPLASH) continue;
        if (!any) { c.lineWidth = 1.1; c.lineCap = 'round'; any = true; }
        var u = p.life / p.max, px = p.x - cam.x, py = p.y - cam.y;
        c.strokeStyle = p.s === 2 ? '#ebfaff' : '#e1f0ff';
        c.globalAlpha = (p.s === 2 ? 0.75 : 0.6) * (1 - u);
        c.beginPath();
        c.ellipse(px, py, 2 + u * (p.s === 2 ? 9 : 5), (2 + u * (p.s === 2 ? 9 : 5)) * 0.42, 0, 0, TAU);
        c.stroke();
        if (p.s === 1 && u < 0.5) {
          c.beginPath();
          c.moveTo(px - 2 - u * 6, py - 1 - u * 5); c.lineTo(px - 2.5 - u * 7, py - 2.5 - u * 6);
          c.moveTo(px + 2 + u * 6, py - 1 - u * 5); c.lineTo(px + 2.5 + u * 7, py - 2.5 - u * 6);
          c.stroke();
        }
      }
      c.globalAlpha = 1;
    },

    /* the drifting things, in the air over everything */
    draw: function (c, cam, t, vw, vh) {
      var W = GG.World;
      var place = W.biomeAt(GG.Player.x, GG.Player.y);
      /* long soft shafts of sun slanting down into the glade */
      if (place === 'glade' && !GG.Time.isDark() && !GG.Time.rain) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (var b = 0; b < 3; b++) {
          var bx = ((b * 131 + 40) - (cam.x * 0.35) % 400 + 800) % 400 - 60;
          c.globalAlpha = 0.05 + 0.03 * Math.sin(t * 0.4 + b * 2);
          c.fillStyle = '#fff0aa';
          c.beginPath();
          c.moveTo(bx, -10); c.lineTo(bx + 46, -10);
          c.lineTo(bx + 46 + vh * 0.5, vh + 10); c.lineTo(bx + vh * 0.5 - 10, vh + 10);
          c.closePath(); c.fill();
        }
        c.restore();
      }
      var i, p, sx, sy;
      for (i = 0; i < MAX; i++) {
        p = pool[i];
        if (!p.on) continue;
        var k = p.kind;
        if (k === FIREFLY || k === SPLASH) continue;
        sx = p.x - cam.x; sy = p.y - cam.y;
        /* fade in and out at the ends of a life */
        var f = Math.min(1, p.life / 0.6, (p.max - p.life) / 0.8);
        if (f <= 0) continue;
        if (k === PETAL) {
          c.globalAlpha = 0.92 * f;
          c.fillStyle = p.col >= 10 ? GARDEN_COLS[p.col - 10] : PETAL_COLS[p.col];
          var sq = Math.abs(Math.cos(p.a)) * 0.7 + 0.3;
          c.beginPath();
          c.ellipse(sx, sy, 3.2 * p.s, 2.1 * p.s * sq, p.a * 0.5, 0, TAU);
          c.fill();
        } else if (k === LEAF) {
          c.globalAlpha = 0.95 * f;
          c.fillStyle = LEAF_COLS[p.col];
          var sq2 = Math.abs(Math.cos(p.a)) * 0.75 + 0.25;
          c.save(); c.translate(sx, sy); c.rotate(p.a * 0.6); c.scale(1, sq2);
          c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(0, -3, 4, 0); c.quadraticCurveTo(0, 3, -4, 0); c.fill();
          c.restore();
        } else if (k === FLUFF) {
          /* a dandelion seed: a little parachute of white threads */
          c.globalAlpha = 0.85 * f;
          c.strokeStyle = '#ffffff'; c.lineWidth = 0.7;
          var r = 3.6 * p.s;
          c.beginPath();
          for (var q = 0; q < 5; q++) {
            var an = -Math.PI / 2 + (q - 2) * 0.42;
            c.moveTo(sx, sy); c.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r);
          }
          c.moveTo(sx, sy); c.lineTo(sx, sy + r * 0.9);
          c.stroke();
          c.fillStyle = '#fffbe8';
          c.beginPath(); c.arc(sx, sy - r * 0.45, r * 0.85, Math.PI * 1.05, Math.PI * 1.95); c.fill();
        } else if (k === MOTE) {
          var tw = 0.55 + 0.45 * Math.sin(t * 3 + p.ph * 5);
          c.globalAlpha = 0.8 * f * tw;
          c.fillStyle = '#fff6c0';
          c.beginPath(); c.arc(sx, sy, 1.1 * p.s + 0.4, 0, TAU); c.fill();
        }
      }
      c.globalAlpha = 1;
    },

    /* After the light of the hour has been laid over the world: the
       things that shine. night is 0 (day) to 1 (full night). */
    drawLights: function (c, cam, t, night, vw, vh) {
      if (night < 0.05) return;
      var g = glowSprite(), w = warmSprite(), i, p;
      c.save();
      c.globalCompositeOperation = 'lighter';
      /* a soft pool of light round Guin, so she can always see her way */
      var P = GG.Player, px = P.x - cam.x, py = P.y - cam.y - 10;
      c.globalAlpha = 0.20 * night;
      c.drawImage(w, px - 90, py - 70, 180, 140);
      /* the cottage windows, lit */
      var H = GG.World.HOUSE;
      if (H) {
        var hw = H.w, hh = hw * 0.72, wy = H.y - hh * 0.78 + hw * 0.09 - cam.y;
        if (wy > -120 && wy < vh + 120 && H.x - cam.x > -200 && H.x - cam.x < vw + 200) {
          for (i = -1; i <= 1; i += 2) {
            var wx = H.x + i * hw * 0.30 - cam.x;
            c.globalAlpha = 0.45 * night;
            c.drawImage(w, wx - 30, wy - 24, 60, 48);
          }
          /* and the light falling out of them onto the grass */
          c.globalAlpha = 0.28 * night;
          c.drawImage(w, H.x - cam.x - hw * 0.62, H.y - cam.y - 16, hw * 1.24, 60);
        }
      }
      /* fireflies */
      for (i = 0; i < MAX; i++) {
        p = pool[i];
        if (!p.on || p.kind !== FIREFLY) continue;
        var blink = Math.max(0, Math.sin(p.life * 2.4 + p.ph));
        blink = blink * blink;
        var f = Math.min(1, p.life / 0.8, (p.max - p.life) / 0.8);
        if (blink * f < 0.02) continue;
        var sx = p.x - cam.x, sy = p.y - cam.y;
        c.globalAlpha = 0.75 * blink * f * night;
        c.drawImage(g, sx - 9, sy - 9, 18, 18);
        c.globalAlpha = blink * f * night;
        c.fillStyle = '#f4ff9a';
        c.beginPath(); c.arc(sx, sy, 1.3, 0, TAU); c.fill();
      }
      c.restore();
    },

    clear: function () {
      for (var i = 0; i < MAX; i++) pool[i].on = false;
      live = 0; this.lastT = -1;
    }
  };
})(window.GG = window.GG || {});
