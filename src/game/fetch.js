/* Guin's Garden - v1.20: fetch at Dog's Paradise.

   David's list said "the tennis-ball fetch game for Dog's Paradise is still
   just an idea for another time". This is that time.

   In the park, with a dog nearby, the round button says THROW. She throws a
   tennis ball the way she is facing, the nearest dog bounds after it, picks
   it up, trots back and drops it at her feet - and the ball is hers again.
   Each fetch is a couple of sparkles, and every now and then the park tells
   her something true about dogs and fetch.

   The facts were checked against the AKC (retrievers, soft mouth), the
   RSPCA and the Blue Cross (sticks splinter; rest and water on hot days),
   and the ASPCA (ask before you play with somebody's dog). */
(function (GG) {
  'use strict';

  var THROW = 175;          // how far a throw goes, in world px
  var FLY = 0.62;           // seconds in the air
  var RUN = 150;            // how fast a dog runs after a ball
  var TROT = 110;           // and how fast it brings it back

  GG.FETCH_FACTS = [
    'Fetch! Always ask a dog’s person before you play with their dog.',
    'Fetch! Retrievers, like Labradors and golden retrievers, were bred to bring back birds for hunters. That is why so many dogs love to fetch.',
    'Fetch! Retrievers have a soft mouth. They can carry something without biting down hard on it.',
    'Fetch! Balls and toys are best. Sticks can splinter and hurt a dog’s mouth.',
    'Fetch! Dogs cool down by panting. On a hot day, let the dog rest and drink water between throws.'
  ];

  var Fetch = GG.Fetch = {
    state: 'idle',          // idle, fly, roll, chase, carry, drop
    ball: null,             // { x, y, z, vx, vy, t, sx, sy, tx, ty }
    dog: null,              // the friend entry running after it
    count: 0,               // fetches this visit
    total: 0,               // fetches ever this session
    said: 0,
    _cam: null,

    inPark: function (x, y) {
      return GG.World && GG.World.biomeRaw(x, y) === 'dogpark';
    },

    /* the nearest dog that is at the park and free to play */
    pickDog: function (P) {
      var F = GG.Friends, best = null, bd = 330;
      if (!F || !F.list) return null;
      for (var i = 0; i < F.list.length; i++) {
        var f = F.list[i];
        if (!f.def || f.def.family !== 'dog' || !f.park) continue;
        if (F.busy && F.busy.animal === f) continue;
        if (f.scold > 0) continue;
        var d = GG.dist(f.x, f.y, P.x, P.y);
        if (d < bd) { bd = d; best = f; }
      }
      return best;
    },

    /* Is there a throw on offer? Only in the park, with a dog about, when
       she is not in the middle of anything else. */
    offer: function (P) {
      if (this.state !== 'idle') return false;
      if (!this.inPark(P.x, P.y)) return false;
      var F = GG.Friends;
      if (F && (F.busy || F.riding)) return false;
      return !!this.pickDog(P);
    },

    busy: function () { return this.state !== 'idle'; },

    throwBall: function (P) {
      var dog = this.pickDog(P);
      if (!dog) return false;
      var a0 = typeof P.angle === 'number' ? P.angle : Math.PI / 2;
      var W = GG.World, self = this;
      /* How far a throw can go this way: short of a wall, a tree, the water
         or the park fence, so a dog never has to leave the park for it. */
      function reach(a) {
        var best = 0;
        for (var s = 16; s <= THROW; s += 8) {
          var x = P.x + Math.cos(a) * s, y = P.y + Math.sin(a) * s;
          if (W.blocked(x, y, 8) || !self.inPark(x, y) || W.isWater(x, y)) break;
          best = s;
        }
        return best;
      }
      /* the way she is facing - unless that is right up against something,
         and then the most open way, as near to her facing as can be */
      var a = a0, far = reach(a0);
      if (far < 110) {
        for (var k = 1; k < 16; k++) {
          var off = Math.ceil(k / 2) * (k % 2 ? 1 : -1) * Math.PI / 8;
          var r2 = reach(a0 + off);
          if (r2 > far + 24) { far = r2; a = a0 + off; }
        }
      }
      if (far < 24) far = 24;
      var tx = P.x + Math.cos(a) * far, ty = P.y + Math.sin(a) * far;
      this.ball = { x: P.x, y: P.y, z: 18, sx: P.x + Math.cos(a) * 8, sy: P.y - 4, tx: tx, ty: ty, t: 0, vx: 0, vy: 0 };
      this.dog = dog;
      dog.fetchCtl = true;
      dog.fetchStuck = 0;
      this.state = 'fly';
      if (P.startSwing) P.swing = 0;
      if (GG.Sfx) GG.Sfx.swing();
      if (GG.Sfx && GG.Sfx.animalCall) GG.Sfx.animalCall('dog', dog.def.id);
      return true;
    },

    release: function () {
      if (this.dog) { this.dog.fetchCtl = false; this.dog.timer = 0.5; }
      this.dog = null; this.ball = null; this.state = 'idle';
    },

    /* move the dog towards (x, y) at speed sp; true when it gets there */
    runTo: function (f, x, y, sp, dt, close) {
      var W = GG.World;
      var dx = x - f.x, dy = y - f.y, d = Math.sqrt(dx * dx + dy * dy);
      f.faceLeft = dx < 0;
      if (d < close) { f.gait = 0; return true; }
      var step = Math.min(d, sp * dt);
      var nx = f.x + dx / d * step, ny = f.y + dy / d * step;
      var moved = false;
      /* a dog that wandered right up against a hydrant or a bench walks
         straight out of it rather than being stuck there */
      var inside = W.blocked(f.x, f.y, 9);
      if (inside || !W.blocked(nx, f.y, 9)) { f.x = nx; moved = true; }
      if (inside || !W.blocked(f.x, ny, 9)) { f.y = ny; moved = true; }
      /* caught on a corner: slip round it one way or the other */
      if (!moved) {
        var base = Math.atan2(dy, dx);
        for (var k = 1; k <= 6 && !moved; k++) {
          var ang = base + Math.ceil(k / 2) * (k % 2 ? 0.6 : -0.6);
          var sx = f.x + Math.cos(ang) * step, sy = f.y + Math.sin(ang) * step;
          if (!W.blocked(sx, sy, 9)) { f.x = sx; f.y = sy; moved = true; }
        }
      }
      f.fetchStuck = moved ? 0 : (f.fetchStuck || 0) + dt;
      f.gait = 1;
      f.bob = Math.abs(Math.sin(f.t * 14)) * -2.2;
      return false;
    },

    update: function (dt, P) {
      if (this.state === 'idle') return;
      var f = this.dog, b = this.ball;
      var F = GG.Friends;
      /* the dog wandered out of the list (far away), or she left the park */
      if (!f || !b || (F && F.list.indexOf(f) < 0) || (F && F.busy && F.busy.animal === f)) { this.release(); return; }
      if (!this.inPark(P.x, P.y) && GG.dist(P.x, P.y, f.x, f.y) > 420) { this.release(); return; }
      f.t += dt;

      if (this.state === 'fly') {
        b.t += dt / FLY;
        var k = Math.min(1, b.t);
        b.x = b.sx + (b.tx - b.sx) * k;
        b.y = b.sy + (b.ty - b.sy) * k;
        b.z = 18 * (1 - k) + Math.sin(k * Math.PI) * 46;
        /* the dog is off the moment it leaves her hand */
        this.runTo(f, b.tx, b.ty, RUN * 0.8, dt, 10);
        if (k >= 1) {
          this.state = 'roll';
          var ra = Math.atan2(b.ty - b.sy, b.tx - b.sx);
          b.vx = Math.cos(ra) * 60; b.vy = Math.sin(ra) * 60; b.z = 0; b.hop = 1;
          if (GG.Sfx) GG.Sfx.plop();
        }
        return;
      }
      if (this.state === 'roll') {
        /* a little bounce and a roll, then it sits still */
        b.hop = Math.max(0, b.hop - dt * 2.4);
        b.z = Math.abs(Math.sin(b.hop * Math.PI * 2)) * 10 * b.hop;
        var nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
        if (!GG.World.blocked(nx, ny, 5) && this.inPark(nx, ny)) { b.x = nx; b.y = ny; }
        else { b.vx = 0; b.vy = 0; }
        b.vx *= Math.pow(0.08, dt); b.vy *= Math.pow(0.08, dt);
        if (this.runTo(f, b.x, b.y, RUN, dt, 12) || f.fetchStuck > 1.6) {
          this.state = 'carry';
          f.fetchStuck = 0;
          if (GG.Sfx) GG.Sfx.pick();
        }
        return;
      }
      if (this.state === 'carry') {
        /* ball in its mouth, trotting back to her */
        b.x = f.x + (f.faceLeft ? -9 : 9); b.y = f.y - 1; b.z = 9;
        if (this.runTo(f, P.x + (f.x < P.x ? -22 : 22), P.y + 4, TROT, dt, 8) || f.fetchStuck > 1.6) {
          this.state = 'drop'; b.t = 0; f.gait = 0;
          f.faceLeft = P.x < f.x;
        }
        return;
      }
      if (this.state === 'drop') {
        b.t += dt;
        b.z = Math.max(0, 9 - b.t * 40);
        f.bob = Math.sin(f.t * 5) * 1.2;
        /* a happy wag, and the ball is hers again */
        if (b.t > 0.45) this.done(P);
      }
    },

    done: function (P) {
      var f = this.dog;
      this.count++; this.total++;
      var S = GG.Save && GG.Save.data;
      if (S) {
        S.sparkles += 2;
        S.fetches = (S.fetches || 0) + 1;
      }
      if (GG.Friends && f) {
        for (var i = 0; i < 4; i++) {
          GG.Friends.hearts.push({ x: f.x + GG.rand(-12, 12), y: f.y - 18 + GG.rand(-6, 6),
            life: GG.rand(0.8, 1.3), s: GG.rand(0.7, 1.1) });
        }
        /* a play bow now and then: let's go again! */
        if (this.count % 3 === 0) f.bow = 0.9;
      }
      if (GG.Sfx) GG.Sfx.coin();
      var msg = null;
      if (this.total === 1 || this.total % 4 === 0) msg = GG.FETCH_FACTS[this.said++ % GG.FETCH_FACTS.length];
      else msg = 'Good dog! Fetch ×' + this.count + '  +2 ✨';
      if (GG.UI) GG.UI.toast(msg, msg.length > 40 ? 5200 : 1600);
      if (this.count % 5 === 0 && GG.FxUI && this._cam && f) {
        var z = (GG.view && GG.view.zoom) || 1;
        GG.FxUI.burst((f.x - this._cam.x) * z, (f.y - 20 - this._cam.y) * z, { palette: 'friend', count: 40 });
      }
      if (GG.Save) GG.Save.save();
      this.release();
    },

    /* the ball: a fuzzy yellow-green ball with its white seam, and a
       shadow on the grass that shrinks as it flies higher */
    draw: function (c, cam, t) {
      this._cam = cam;
      var b = this.ball;
      if (!b) return;
      var x = b.x - cam.x, y = b.y - cam.y;
      var sh = Math.max(0.35, 1 - b.z / 70);
      c.save();
      c.fillStyle = 'rgba(40,60,20,' + (0.25 * sh).toFixed(2) + ')';
      c.beginPath(); c.ellipse(x, y + 2, 5 * sh, 2.2 * sh, 0, 0, Math.PI * 2); c.fill();
      var by = y - b.z - 3;
      var R = 5.6;
      var g = c.createRadialGradient(x - 2, by - 2, 0.5, x, by, R + 0.4);
      g.addColorStop(0, '#fbffb0'); g.addColorStop(0.65, '#dcf53c'); g.addColorStop(1, '#a4c21c');
      c.fillStyle = g;
      c.strokeStyle = 'rgba(70,90,20,0.75)'; c.lineWidth = 1.1;
      c.beginPath(); c.arc(x, by, R, 0, Math.PI * 2); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.2;
      var r = (t * 9) % (Math.PI * 2);
      c.beginPath(); c.arc(x - 3 * Math.cos(r), by - 3 * Math.sin(r), 4, r - 0.9, r + 0.9); c.stroke();
      /* a little speed trail while it is in the air */
      if (this.state === 'fly') {
        c.fillStyle = 'rgba(255,255,255,0.35)';
        c.beginPath(); c.arc(x - (b.tx - b.sx) * 0.06, by + 3, R * 0.7, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }
  };
})(window.GG = window.GG || {});
