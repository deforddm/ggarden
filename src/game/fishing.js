/* Fishing in the pond, the stream, the river, the inlet and the sea.
   Fish swim about as shadows. Cast near one, wait for the bobber to go under,
   then tap at the right moment. Every body of water holds its own fish. */
(function (GG) {
  'use strict';

  var TARGET_FISH = 12;
  var BITE_WINDOW = 0.95;      // generous on purpose

  var F = GG.Fishing = {
    swimmers: [],
    state: 'idle',             // idle cast wait nibble bite reel done
    bob: null,
    line: null,
    hooked: null,
    timer: 0,
    nibbles: 0,
    ripples: [],
    castFrom: null,
    result: null,

    active: function () { return this.state !== 'idle'; },

    reset: function () {
      this.state = 'idle'; this.bob = null; this.hooked = null;
      this.timer = 0; this.result = null; this.castFrom = null;
      for (var i = 0; i < this.swimmers.length; i++) this.swimmers[i].chase = 0;
    },

    /* ---------- which water is this, and who lives in it? ---------- */
    WATER_NAMES: { 1: 'pond', 2: 'stream', 3: 'river', 4: 'estuary', 5: 'sea' },

    waterAt: function (x, y) {
      return this.WATER_NAMES[GG.World.waterKind(x, y)] || null;
    },

    /* Fish do not live in the tidepools - those are for the net. */
    fishable: function (x, y) { return !!this.waterAt(x, y); },

    eligible: function (water) {
      var phase = GG.Time.phase(), out = [];
      for (var i = 0; i < GG.FISH.length; i++) {
        var f = GG.FISH[i];
        if (f.times.indexOf('any') < 0 && f.times.indexOf(phase) < 0) continue;
        if (water && f.waters && f.waters.indexOf(water) < 0) continue;
        out.push({ f: f, w: 1 / Math.pow(f.rarity, 1.8) });
      }
      return out;
    },

    /* A random fishable spot near Guin, so every water she stands beside
       fills up with its own fish. */
    randomWaterPoint: function (edgeBias, near) {
      var W = GG.World;
      var cx = near ? near.x : W.pond.cx, cy = near ? near.y : W.pond.cy;
      var far = Math.max(GG.view.w, GG.view.h) * 0.62 + 140;
      for (var i = 0; i < 40; i++) {
        var a = Math.random() * Math.PI * 2;
        var r = (edgeBias ? 0.35 + Math.random() * 0.65 : Math.sqrt(Math.random())) * far;
        var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (x < 20 || y < 20 || x > W.W - 20 || y > W.H - 20) continue;
        if (this.fishable(x, y)) return { x: x, y: y };
      }
      return null;
    },

    stock: function (dt, player) {
      var guard = 0;
      while (this.swimmers.length < TARGET_FISH && guard++ < TARGET_FISH) {
        var p = this.randomWaterPoint(true, player);
        if (!p) return;
        var water = this.waterAt(p.x, p.y);
        var cands = this.eligible(water);
        if (!cands.length) continue;
        var total = 0, i;
        for (i = 0; i < cands.length; i++) total += cands[i].w;
        var r = Math.random() * total, pick = cands[cands.length - 1].f;
        for (i = 0; i < cands.length; i++) { r -= cands[i].w; if (r <= 0) { pick = cands[i].f; break; } }
        this.swimmers.push({
          def: pick, x: p.x, y: p.y, ang: Math.random() * Math.PI * 2,
          sp: GG.rand(16, 34), timer: GG.rand(1, 3), chase: 0, t: Math.random() * 10,
          left: Math.random() < 0.5, age: 0, water: water
        });
      }
    },

    update: function (dt, player) {
      var W = GG.World;
      this.stock(dt, player);

      var i, s;
      var gone = Math.max(GG.view.w, GG.view.h) * 0.95 + 320;
      for (i = this.swimmers.length - 1; i >= 0; i--) {
        s = this.swimmers[i];
        if (s !== this.hooked && GG.dist(s.x, s.y, player.x, player.y) > gone) {
          this.swimmers.splice(i, 1); continue;
        }
        s.t += dt; s.age += dt;
        s.timer -= dt;

        if (s.chase > 0 && this.bob) {
          var toAng = Math.atan2(this.bob.y - s.y, this.bob.x - s.x);
          s.ang = GG.angLerp(s.ang, toAng, Math.min(1, dt * 3));
          var d = GG.dist(s.x, s.y, this.bob.x, this.bob.y);
          var sp = d > 26 ? s.sp * 2.1 : 0;
          s.x += Math.cos(s.ang) * sp * dt;
          s.y += Math.sin(s.ang) * sp * dt;
          if (d <= 26 && this.state === 'wait') {
            this.state = 'nibble';
            this.nibbles = GG.randInt(2, 3);
            this.timer = 0.42;
          }
        } else {
          if (s.timer <= 0) { s.ang += GG.rand(-1.5, 1.5); s.timer = GG.rand(1.2, 3.4); }
          var nx = s.x + Math.cos(s.ang) * s.sp * dt;
          var ny = s.y + Math.sin(s.ang) * s.sp * dt;
          if (this.fishable(nx, s.y)) s.x = nx; else s.ang = Math.PI - s.ang;
          if (this.fishable(s.x, ny)) s.y = ny; else s.ang = -s.ang;
        }
        if (Math.cos(s.ang) < -0.05) s.left = true;
        else if (Math.cos(s.ang) > 0.05) s.left = false;
      }

      // the line and the bobber
      if (this.state === 'cast') {
        this.timer -= dt;
        var p = GG.clamp(1 - this.timer / 0.42, 0, 1);
        this.bob.x = GG.lerp(this.castFrom.x, this.bob.tx, p);
        this.bob.y = GG.lerp(this.castFrom.y, this.bob.ty, p) - Math.sin(p * Math.PI) * 26;
        if (this.timer <= 0) {
          this.bob.x = this.bob.tx; this.bob.y = this.bob.ty;
          this.state = 'wait';
          this.timer = 9;
          GG.Sfx.plop();
          this.splash(this.bob.x, this.bob.y, 6);
          this.interest();
        }
      } else if (this.state === 'wait') {
        this.timer -= dt;
        if (this.timer <= 0) {
          if (this.junk) { this.state = 'nibble'; this.nibbles = 2; this.timer = 0.4; }
          else this.finish('nothing');
        }
      } else if (this.state === 'nibble') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.nibbles--;
          GG.Sfx.nibble();
          if (this.nibbles <= 0) {
            this.state = 'bite';
            this.timer = BITE_WINDOW;
            GG.Sfx.bite();
            this.splash(this.bob.x, this.bob.y, 10);
          } else {
            this.timer = GG.rand(0.34, 0.62);
          }
        }
      } else if (this.state === 'bite') {
        this.timer -= dt;
        if (this.timer <= 0) this.finish('lost');
      } else if (this.state === 'reel') {
        this.timer -= dt;
        if (this.bob) {
          this.bob.x = GG.lerp(this.bob.x, player.x, Math.min(1, dt * 9));
          this.bob.y = GG.lerp(this.bob.y, player.y - 14, Math.min(1, dt * 9));
        }
        if (this.timer <= 0) {
          var r = this.result;
          this.reset();
          return r;
        }
      }

      // she wandered off, so the line comes in
      if (this.state !== 'idle' && this.state !== 'reel' && this.castFrom &&
          GG.dist(player.x, player.y, this.castFrom.x, this.castFrom.y) > 26) {
        this.finish('moved');
      }

      for (i = this.ripples.length - 1; i >= 0; i--) {
        var rp = this.ripples[i];
        rp.life -= dt; rp.r += rp.grow * dt;
        if (rp.life <= 0) this.ripples.splice(i, 1);
      }
      return null;
    },

    /* Which fish notices the bait? */
    interest: function () {
      var best = null, bd = 260;
      for (var i = 0; i < this.swimmers.length; i++) {
        var s = this.swimmers[i];
        var d = GG.dist(s.x, s.y, this.bob.x, this.bob.y);
        if (d < bd) { bd = d; best = s; }
      }
      if (best) {
        best.chase = 1;
        this.hooked = best;
      } else if (Math.random() < 0.6) {
        // nothing swimming nearby - you have snagged something else
        this.hooked = null;
        this.junk = GG.pick(GG.JUNK);
        this.timer = GG.rand(1.4, 2.6);
      }
    },

    /* ---------- the player's side ---------- */
    /* Where would a cast land? null if she is not facing water. */
    castTarget: function (player) {
      var a = player.angle;
      var found = null;
      for (var d = 14; d <= 82; d += 6) {
        var x = player.x + Math.cos(a) * d, y = player.y + Math.sin(a) * d;
        if (this.fishable(x, y)) { found = { x: x, y: y, d: d }; break; }
      }
      if (!found) return null;
      for (var extra = 62; extra >= 0; extra -= 8) {
        var tx = player.x + Math.cos(a) * (found.d + extra);
        var ty = player.y + Math.sin(a) * (found.d + extra);
        if (this.fishable(tx, ty)) return { x: tx, y: ty };
      }
      return { x: found.x, y: found.y };
    },

    cast: function (player) {
      var t = this.castTarget(player);
      if (!t) return false;
      this.castFrom = { x: player.x, y: player.y };
      this.bob = { x: player.x, y: player.y - 16, tx: t.x, ty: t.y, dip: 0 };
      this.state = 'cast';
      this.timer = 0.42;
      this.hooked = null;
      this.junk = null;
      GG.Sfx.cast();
      return true;
    },

    /* Tapping the button. Returns what happened. */
    tap: function () {
      if (this.state === 'bite') {
        this.result = { kind: 'catch', def: this.hooked ? this.hooked.def : this.junk };
        if (this.hooked) {
          var i = this.swimmers.indexOf(this.hooked);
          if (i >= 0) this.swimmers.splice(i, 1);
        }
        this.splash(this.bob.x, this.bob.y, 14);
        GG.Sfx.reel();
        this.state = 'reel'; this.timer = 0.34;
        return 'catch';
      }
      if (this.state === 'wait' || this.state === 'nibble') { this.finish('early'); return 'early'; }
      if (this.state === 'cast') return null;
      return null;
    },

    finish: function (why) {
      if (this.state === 'reel' || this.state === 'idle') return;
      if (this.hooked) this.hooked.chase = 0;
      this.result = { kind: why };
      this.splash(this.bob ? this.bob.x : 0, this.bob ? this.bob.y : 0, 5);
      this.state = 'reel';
      this.timer = 0.3;
      GG.Sfx.reel();
    },

    splash: function (x, y, n) {
      this.ripples.push({ x: x, y: y, r: 3, grow: 34, life: 0.7, max: 0.7 });
      this.ripples.push({ x: x, y: y, r: 1, grow: 20, life: 0.9, max: 0.9 });
    },

    /* ---------- drawing ---------- */
    drawShadows: function (c, cam, t) {
      for (var i = 0; i < this.swimmers.length; i++) {
        var s = this.swimmers[i];
        var sx = s.x - cam.x, sy = s.y - cam.y;
        if (sx < -80 || sy < -80 || sx > GG.view.w + 80 || sy > GG.view.h + 80) continue;
        var len = 8 + s.def.shadow * 5.2;
        var wob = Math.sin(s.t * 4) * 0.12;
        c.save();
        c.translate(sx, sy);
        c.rotate(s.ang + wob);
        c.fillStyle = 'rgba(12,44,62,0.36)';
        c.beginPath(); c.ellipse(0, 0, len, len * 0.36, 0, 0, Math.PI * 2); c.fill();
        c.beginPath();
        c.moveTo(-len * 0.9, 0);
        c.lineTo(-len * 1.5, -len * 0.3);
        c.lineTo(-len * 1.5, len * 0.3);
        c.closePath(); c.fill();
        c.restore();
        // a faint wake
        c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 1.4;
        c.beginPath();
        c.arc(sx - Math.cos(s.ang) * len, sy - Math.sin(s.ang) * len, len * 0.8,
          s.ang - 0.9, s.ang + 0.9);
        c.stroke();
      }
    },

    draw: function (c, cam, t, player) {
      var i;
      for (i = 0; i < this.ripples.length; i++) {
        var rp = this.ripples[i];
        c.strokeStyle = 'rgba(255,255,255,' + (0.5 * rp.life / rp.max).toFixed(3) + ')';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(rp.x - cam.x, rp.y - cam.y, rp.r, rp.r * 0.45, 0, 0, Math.PI * 2);
        c.stroke();
      }
      if (!this.bob) return;

      var bx = this.bob.x - cam.x, by = this.bob.y - cam.y;
      var dip = 0;
      if (this.state === 'nibble') dip = Math.sin(t * 30) * 2.2;
      if (this.state === 'bite') dip = 7;

      // line from the rod tip
      var rod = this.rodTip(player, cam);
      c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1;
      c.beginPath();
      c.moveTo(rod.x, rod.y);
      c.quadraticCurveTo((rod.x + bx) / 2, (rod.y + by) / 2 + 6, bx, by + dip);
      c.stroke();

      // bobber
      c.fillStyle = '#e8534a';
      c.beginPath(); c.arc(bx, by + dip, 4.4, Math.PI, 0); c.fill();
      c.fillStyle = '#f6f2e6';
      c.beginPath(); c.arc(bx, by + dip, 4.4, 0, Math.PI); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(bx, by + dip, 4.4, 0, Math.PI * 2); c.stroke();

      if (this.state === 'bite') {
        c.fillStyle = '#fff2a8';
        c.font = 'bold 15px "Trebuchet MS", sans-serif';
        c.textAlign = 'center';
        c.fillText('!', bx, by - 13);
      }
    },

    rodTip: function (player, cam) {
      var a = player.angle;
      return {
        x: player.x - cam.x + Math.cos(a) * 20,
        y: player.y - cam.y - 20 + Math.sin(a) * 8
      };
    },

    drawRod: function (c, sx, sy, player) {
      var a = player.angle;
      var hx = sx + Math.cos(a) * 5, hy = sy - 13;
      var tx = sx + Math.cos(a) * 20, ty = sy - 20 + Math.sin(a) * 8;
      c.strokeStyle = '#b8875a'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx - Math.cos(a) * 7, hy + 4); c.lineTo(tx, ty); c.stroke();
      c.fillStyle = '#6b5540';
      c.beginPath(); c.arc(hx, hy + 2, 2.2, 0, Math.PI * 2); c.fill();
    }
  };
})(window.GG = window.GG || {});
