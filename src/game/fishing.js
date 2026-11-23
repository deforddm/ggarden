/* Fishing in the pond, the stream, the river, the inlet and the sea.
   Fish swim about as shadows. Cast near one, wait for the bobber to go under,
   then tap at the right moment. Every body of water holds its own fish.

   WADING IN (Guin: "make fish get scared away when you setp in the stream")

   They do, and the sense they use is one Guin has not got. A fish has a line
   of tiny sensors down each side of its body - the lateral line - that feels
   water moving. It is not the ground shaking; a fish has no feet. Her leg
   pushes a slug of water ahead of it and the fish feels that slug arrive, like
   being touched from a little way off. Close up the lateral line does the
   work; further out it is her shape against the sky and her shadow.

   The lesson is the good part, and it is the same lesson the fish-counting
   biologists follow: how fast she moves decides everything. The people who
   snorkel a stream to count fish must stay ten metres downstream and keep off
   the water until they are ready - but their own protocol also says that "a
   snorkeler who moves slowly can nearly touch a fish before they are
   frightened". So the scatter here is a function of her speed, and fish that
   have scattered drift back the moment she stands still. Coming up the stream
   from behind them works too: a fish in a stream faces into the current, so
   walking upstream puts her behind its head.

   And the bolt itself is faster than she can picture: a fish snaps into a C
   shape and is gone in about a hundredth of a second, fired by a single nerve
   cell. The animation is two or three frames on purpose. */
(function (GG) {
  'use strict';

  var TARGET_FISH = 12;
  var BITE_WINDOW = 1.5;       // generous on purpose (v1.19: small hands are slower)

  /* Ten metres, in this garden's pixels - what a person blundering into a
     stream disturbs. Nothing like all of it is used unless she is running. */
  var SPOOK_FAR = 300;

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
    WATER_NAMES: { 1: 'pond', 2: 'stream', 3: 'river', 4: 'estuary', 5: 'sea', 7: 'swamp' },

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
        var r = (edgeBias === 'close' ? 0.12 + Math.random() * 0.3
          : (edgeBias ? 0.35 + Math.random() * 0.65 : Math.sqrt(Math.random()))) * far;
        var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (x < 20 || y < 20 || x > W.W - 20 || y > W.H - 20) continue;
        if (this.fishable(x, y)) return { x: x, y: y };
      }
      return null;
    },

    stock: function (dt, player) {
      var guard = 0;
      /* v1.19: a full pond can still have every fish over the far side, so
         now and then one of the far-off ones is moved to where she is */
      this._nudge = (this._nudge || 0) - (dt || 0);
      if (this.swimmers.length >= TARGET_FISH && this._nudge <= 0 && player && this.state === 'idle') {
        this._nudge = 2;
        var near = 0, far = null, fd = 0;
        for (var n = 0; n < this.swimmers.length; n++) {
          var sw = this.swimmers[n], dd = GG.dist(sw.x, sw.y, player.x, player.y);
          if (dd < 230) near++;
          else if (dd > fd && dd > Math.max(GG.view.w, GG.view.h) * 0.6) { fd = dd; far = sw; }
        }
        if (near < 2 && far) {
          var cp = this.randomWaterPoint('close', player);
          if (cp && this.waterAt(cp.x, cp.y) === far.water) { far.x = cp.x; far.y = cp.y; far.age = 0; }
        }
      }
      while (this.swimmers.length < TARGET_FISH && guard++ < TARGET_FISH) {
        /* v1.19: keep a couple of fish where she can see them, so there is
           always a shadow to cast at */
        var close = 0;
        for (var q = 0; q < this.swimmers.length; q++) {
          if (GG.dist(this.swimmers[q].x, this.swimmers[q].y, player.x, player.y) < 230) close++;
        }
        var p = this.randomWaterPoint(close < 2 ? 'close' : true, player) || this.randomWaterPoint(true, player);
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
          left: Math.random() < 0.5, age: 0, water: water,
          flee: 0, spook: 0, back: null
        });
      }
    },

    /* ---------- wading in ---------- */
    /* Is she standing in the water? */
    wading: function (player) {
      return !!(player && GG.World.isWater(player.x, player.y));
    },

    spookSaid: 0,

    /* How far off a fish notices her, in pixels. Standing still it is very
       nearly nothing; running in, it is the whole ten metres. */
    spookRadius: function (player) {
      var norm = GG.clamp((player.speed || 0) / 168, 0, 1);
      return SPOOK_FAR * (0.15 + 0.85 * norm);
    },

    stepWading: function (dt, player) {
      if (this.spookSaid > 0) this.spookSaid -= dt;
      if (!this.wading(player)) return 0;
      if ((player.speed || 0) < 8) return 0;      /* creeping: nothing feels it */
      var radius = this.spookRadius(player), n = 0;
      for (var i = 0; i < this.swimmers.length; i++) {
        var s = this.swimmers[i];
        if (s.flee > 0) continue;
        var d = GG.dist(s.x, s.y, player.x, player.y);
        /* A fish in a stream holds its head into the current, so it feels and
           sees her sooner if she is coming at its face. Wade UP the stream,
           behind them, and you get much closer. */
        var facing = Math.cos(s.ang - Math.atan2(player.y - s.y, player.x - s.x));
        if (d > radius * (facing > 0 ? 1.25 : 0.7)) continue;
        this.spook(s, player.x, player.y);
        n++;
      }
      if (n && this.spookSaid <= 0 && GG.UI && GG.UI.toast) {
        this.spookSaid = 70;
        GG.UI.toast('They felt your leg push the water — wade slowly and they let you come close.', 3600);
      }
      return n;
    },

    /* The C-start: the fish bends into a C and is gone. In a real stream that
       takes about a hundredth of a second, so this is over in two frames. */
    spook: function (s, x, y) {
      s.back = { x: s.x, y: s.y };
      s.chase = 0;
      s.spook = 0.16;
      s.flee = GG.rand(0.7, 1.5);
      s.ang = Math.atan2(s.y - y, s.x - x) + GG.rand(-0.35, 0.35);
      this.splash(s.x, s.y, 4);
      if (GG.Sfx.fishDart) GG.Sfx.fishDart();
      if (this.hooked === s && this.state !== 'idle' && this.state !== 'reel') {
        this.finish('spooked');
        if (GG.UI && GG.UI.toast) {
          GG.UI.toast('You scared it off the line. Fish feel you long before they see you.', 2600);
        }
      }
    },

    update: function (dt, player) {
      var W = GG.World;
      this.stock(dt, player);
      this.stepWading(dt, player);

      var i, s;
      var gone = Math.max(GG.view.w, GG.view.h) * 0.95 + 320;
      for (i = this.swimmers.length - 1; i >= 0; i--) {
        s = this.swimmers[i];
        if (s !== this.hooked && GG.dist(s.x, s.y, player.x, player.y) > gone) {
          this.swimmers.splice(i, 1); continue;
        }
        s.t += dt; s.age += dt;
        s.timer -= dt;

        if (s.flee > 0) {
          /* gone, and fast. The first flick is the quick one. */
          s.flee -= dt;
          if (s.spook > 0) s.spook -= dt;
          var fsp = s.sp * (s.spook > 0 ? 5.4 : 2.3);
          var fx = s.x + Math.cos(s.ang) * fsp * dt;
          var fy = s.y + Math.sin(s.ang) * fsp * dt;
          if (this.fishable(fx, s.y)) s.x = fx; else s.ang = Math.PI - s.ang;
          if (this.fishable(s.x, fy)) s.y = fy; else s.ang = -s.ang;
        } else if (s.back && (!player || (player.speed || 0) < 14)) {
          /* she is standing still again, so they drift back to where they
             were - which is exactly what really happens, and is the whole
             reason KEEP STILL is the right way to see anything */
          var bd = GG.dist(s.x, s.y, s.back.x, s.back.y);
          if (bd < 28) { s.back = null; }
          else {
            s.ang = GG.angLerp(s.ang, Math.atan2(s.back.y - s.y, s.back.x - s.x),
              Math.min(1, dt * 1.6));
            var bx = s.x + Math.cos(s.ang) * s.sp * 0.7 * dt;
            var by = s.y + Math.sin(s.ang) * s.sp * 0.7 * dt;
            if (this.fishable(bx, s.y)) s.x = bx; else s.ang = Math.PI - s.ang;
            if (this.fishable(s.x, by)) s.y = by; else s.ang = -s.ang;
          }
        } else if (s.chase > 0 && this.bob) {
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
          this.timer = 7;
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
        if (s.flee > 0) continue;            /* a frightened fish wants nothing */
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
    /* v1.24: what a fish looks like from above. A family for each art
       shape: how long, how deep, what kind of tail. Still a shadow - the
       surprise of what it is stays for the catch - but a living one. */
    _form: function (def) {
      var sh = (def.art && def.art.shape) || 'torpedo';
      if (def.isJunk || sh === 'boot' || sh === 'can' || sh === 'news') return { junk: true };
      if (sh === 'seacrab' || sh === 'crayfish') return { crab: true, cray: sh === 'crayfish' };
      if (sh === 'eel' || sh === 'lamprey') return { k: 1.5, deep: 0.13, tail: 'none', wave: 1.9, fins: 0 };
      if (sh === 'pike' || sh === 'sturgeon') return { k: 1.38, deep: 0.17, tail: 'fork', wave: 1.1, fins: 0.8 };
      if (sh === 'flatfish') return { k: 0.9, deep: 0.62, tail: 'fan', wave: 0.5, fins: 0, flat: true };
      if (sh === 'sunfish' || sh === 'mola' || sh === 'goldfish' || sh === 'carp' || sh === 'tench') return { k: 0.84, deep: 0.58, tail: 'fan', wave: 0.7, fins: 1 };
      if (sh === 'catfish' || sh === 'sculpin') return { k: 1.05, deep: 0.36, tail: 'fan', wave: 1, fins: 1.3, head: 1.25 };
      return { k: 1.05, deep: 0.29, tail: 'fork', wave: 1, fins: 1 };
    },

    drawShadows: function (c, cam, t) {
      var N = 8, px = this._px || (this._px = new Float32Array(N + 1)), py = this._py || (this._py = new Float32Array(N + 1)),
        pw = this._pw || (this._pw = new Float32Array(N + 1));
      for (var i = 0; i < this.swimmers.length; i++) {
        var s = this.swimmers[i];
        var sx = s.x - cam.x, sy = s.y - cam.y;
        if (sx < -90 || sy < -90 || sx > GG.view.w + 90 || sy > GG.view.h + 90) continue;
        var F = s._form || (s._form = this._form(s.def));
        var len = (8 + s.def.shadow * 5.2) * (F.k || 1);
        /* the C-start: for two frames the whole fish is bent into a C */
        var cst = s.spook > 0 ? GG.clamp(s.spook / 0.16, 0, 1) : 0;
        var fade = Math.min(1, (s.age || 0) / 1.2);        /* swims up out of the deep */
        var hurry = GG.clamp((s.sp || 20) / 30, 0.6, 2.2) * (s.flee > 0 ? 1.6 : 1);
        c.save();
        c.translate(sx, sy);
        c.rotate(s.ang);
        if (F.junk) {
          c.globalAlpha = fade;
          c.fillStyle = 'rgba(12,44,62,0.34)';
          c.beginPath(); c.ellipse(0, 0, len, len * 0.42, 0.2, 0, Math.PI * 2); c.fill();
          c.restore();
          continue;
        }
        if (F.crab) {
          /* a round body, eight legs that scuttle, two claws out in front */
          c.globalAlpha = fade;
          var r0 = len * 0.42;
          c.strokeStyle = 'rgba(12,44,62,0.42)'; c.lineWidth = Math.max(1.2, r0 * 0.16); c.lineCap = 'round';
          for (var lg = 0; lg < 4; lg++) {
            var la = 0.5 + lg * 0.42, kick = Math.sin(s.t * 9 + lg * 1.6) * 0.18;
            for (var sd = -1; sd <= 1; sd += 2) {
              c.beginPath();
              c.moveTo(Math.cos(la) * r0 * 0.7 * -1 + r0 * 0.3, sd * r0 * 0.7);
              c.lineTo(-Math.cos(la + kick) * r0 * 1.5 + r0 * 0.5, sd * (r0 * 1.55 + Math.sin(la) * r0 * 0.2));
              c.stroke();
            }
          }
          c.fillStyle = 'rgba(12,44,62,0.46)';
          c.beginPath(); c.ellipse(0, 0, r0 * (F.cray ? 1.5 : 1.05), r0 * (F.cray ? 0.62 : 0.86), 0, 0, Math.PI * 2); c.fill();
          for (var cl = -1; cl <= 1; cl += 2) {
            var open = 0.25 + 0.2 * Math.sin(s.t * 2.2 + cl);
            c.save(); c.translate(r0 * (F.cray ? 1.5 : 0.95), cl * r0 * 0.75); c.rotate(cl * (0.5 - open));
            c.beginPath(); c.ellipse(r0 * 0.4, 0, r0 * 0.5, r0 * 0.26, 0, 0, Math.PI * 2); c.fill();
            c.restore();
          }
          if (F.cray) { c.beginPath(); c.moveTo(-r0 * 1.4, 0); c.lineTo(-r0 * 2.2, -r0 * 0.6); c.lineTo(-r0 * 2.2, r0 * 0.6); c.closePath(); c.fill(); }
          c.restore();
          continue;
        }
        /* the spine: nose at +len, tail at -len, a wave running down it that
           grows towards the tail and quickens when the fish hurries */
        var k, u;
        for (k = 0; k <= N; k++) {
          u = k / N;
          var amp = len * 0.2 * F.wave * Math.pow(u, 1.5) * Math.min(1.5, 0.55 + hurry * 0.4);
          px[k] = len * (1 - 2 * u);
          py[k] = Math.sin(s.t * (4.4 + hurry * 2.4) - u * 3.4 * F.wave) * amp + cst * len * 0.7 * u * u;
          /* how wide the body is here: a round head, fullest a third of
             the way back, tapering to the wrist of the tail */
          var prof = u < 0.3 ? Math.sqrt(u / 0.3) * (F.head || 1) : 1 - Math.pow((u - 0.3) / 0.7, F.flat ? 2.6 : 1.5) * (F.tail === 'none' ? 0.72 : 0.84);
          pw[k] = Math.max(0.12, Math.min(1.15, prof)) * len * F.deep * (1 + cst * 0.3);
        }
        function outline(ox, oy) {
          c.beginPath();
          c.moveTo(px[0] + ox + pw[0] * 0.6, py[0] + oy);
          for (k = 0; k <= N; k++) c.lineTo(px[k] + ox, py[k] + oy - pw[k]);
          /* the tail */
          var tx = px[N] + ox, ty = py[N] + oy, slope = (py[N] - py[N - 1]) / (px[N] - px[N - 1] || -1);
          var ta = Math.atan(slope), tl = len * (F.tail === 'fan' ? 0.42 : 0.55), tw = len * (F.tail === 'fan' ? 0.34 : 0.42) * (F.deep > 0.4 ? 1.15 : 1);
          if (F.tail !== 'none') {
            var cs = Math.cos(ta), sn = Math.sin(ta);
            var ax = tx - cs * tl + sn * tw, ay = ty - sn * tl - cs * tw, bx = tx - cs * tl - sn * tw, by = ty - sn * tl + cs * tw;
            c.lineTo(ax, ay);
            if (F.tail === 'fork') c.lineTo(tx - cs * tl * 0.45, ty - sn * tl * 0.45);
            else c.quadraticCurveTo(tx - cs * tl * 1.25, ty - sn * tl * 1.25, bx, by);
            c.lineTo(bx, by);
          } else c.lineTo(tx - len * 0.12, ty);
          for (k = N; k >= 0; k--) c.lineTo(px[k] + ox, py[k] + oy + pw[k]);
          c.closePath();
        }
        /* its shadow on the bed, a little way off: that is what makes the
           fish look as if it is hanging in the water */
        c.globalAlpha = fade * 0.5;
        c.fillStyle = 'rgba(8,30,44,0.2)';
        outline(Math.cos(-s.ang + 1.1) * 4, Math.sin(-s.ang + 1.1) * 4 + 0);
        c.fill();
        /* the paired fins, sculling */
        c.globalAlpha = fade;
        if (F.fins) {
          var fl = len * 0.34 * F.fins, flap = 0.75 + Math.sin(s.t * 5.5) * 0.25, fk = Math.round(N * 0.3);
          c.fillStyle = 'rgba(12,44,62,0.26)';
          for (var side = -1; side <= 1; side += 2) {
            c.beginPath();
            c.moveTo(px[fk] + len * 0.1, py[fk] + side * pw[fk] * 0.8);
            c.lineTo(px[fk] - fl * 0.9, py[fk] + side * (pw[fk] + fl * flap));
            c.lineTo(px[fk] - fl * 0.5, py[fk] + side * pw[fk] * 0.8);
            c.closePath(); c.fill();
          }
        }
        /* the fish itself: deep water colour, with a breath of its own
           colour in it - enough to wonder, not enough to know */
        outline(0, 0);
        c.fillStyle = 'rgba(12,44,62,0.44)';
        c.fill();
        var tint = s.def.art && s.def.art.back;
        if (tint) { c.globalAlpha = fade * 0.16; c.fillStyle = tint; c.fill(); c.globalAlpha = fade; }
        /* light along its back */
        c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = Math.max(1, len * F.deep * 0.3); c.lineCap = 'round';
        c.beginPath();
        c.moveTo(px[1], py[1]);
        for (k = 2; k <= N - 2; k++) c.lineTo(px[k], py[k]);
        c.stroke();
        c.restore();
        /* a V of wake behind a fish that is moving, and now and then a
           ring where it comes up to the top */
        var wk = GG.clamp((hurry - 0.7) * 0.22, 0.05, 0.3) * fade;
        c.strokeStyle = 'rgba(255,255,255,' + wk.toFixed(3) + ')'; c.lineWidth = 1.3; c.lineCap = 'round';
        var bx0 = sx + Math.cos(s.ang) * len * 0.7, by0 = sy + Math.sin(s.ang) * len * 0.7;
        for (var w = -1; w <= 1; w += 2) {
          c.beginPath(); c.moveTo(bx0, by0);
          c.lineTo(bx0 - Math.cos(s.ang + w * 0.42) * len * 1.5, by0 - Math.sin(s.ang + w * 0.42) * len * 1.5);
          c.stroke();
        }
        var beat = Math.floor(s.t / 2.6);
        if (beat !== s._beat) {
          s._beat = beat;
          if (((beat * 7919 + i * 104729) % 10) < 3 && this.ripples.length < 24 && fade >= 1) {
            this.ripples.push({ x: s.x + Math.cos(s.ang) * len * 0.8, y: s.y + Math.sin(s.ang) * len * 0.8, r: 1, grow: 16, life: 0.9, max: 0.9 });
          }
        }
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
