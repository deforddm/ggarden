/* Guin herself, and her bug net. */
(function (GG) {
  'use strict';

  var Player = GG.Player = {
    x: 4720, y: 2580, vx: 0, vy: 0,
    dir: 'down', angle: Math.PI / 2,
    walk: 0, speed: 0,
    rad: 11,
    swing: 0,          // 0 = net down, counts down while swinging
    SWING_TIME: 0.42,
    caughtFlash: 0,
    stepTimer: 0,
    stun: 0,           // seeing stars after a bee sting
    stingCool: 0,      // no second sting straight away

    reset: function (x, y) {
      this.x = x; this.y = y; this.vx = this.vy = 0; this.swing = 0;
      this.dir = 'down'; this.angle = Math.PI / 2;
      this.stun = 0; this.stingCool = 0;
    },

    sting: function () {
      this.stun = 2.4;
      this.stingCool = 5;
      this.swing = 0;
      this.vx *= -0.4; this.vy *= -0.4;
    },

    update: function (dt, bounds) {
      var In = GG.Input;
      var mag = In.mag;
      var maxSpeed = this.stun > 0 ? 92 : 168;
      var want = mag > 0.02;
      var tx = want ? In.x * maxSpeed * mag : 0;
      var ty = want ? In.y * maxSpeed * mag : 0;
      if (this.swing > 0) { tx *= 0.35; ty *= 0.35; }

      var k = 1 - Math.pow(0.0006, dt);
      this.vx += (tx - this.vx) * k;
      this.vy += (ty - this.vy) * k;
      this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

      var nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
      if (!bounds(nx, this.y, this.rad)) this.x = nx; else this.vx = 0;
      if (!bounds(this.x, ny, this.rad)) this.y = ny; else this.vy = 0;

      if (want) {
        this.angle = Math.atan2(In.y, In.x);
        var a = this.angle;
        if (a > -Math.PI / 4 && a <= Math.PI / 4) this.dir = 'right';
        else if (a > Math.PI / 4 && a <= 3 * Math.PI / 4) this.dir = 'down';
        else if (a > -3 * Math.PI / 4 && a <= -Math.PI / 4) this.dir = 'up';
        else this.dir = 'left';
      }

      this.walk += this.speed * dt * 0.055;
      if (this.stun > 0) this.stun -= dt;
      if (this.stingCool > 0) this.stingCool -= dt;
      if (this.swing > 0) this.swing -= dt;
      if (this.caughtFlash > 0) this.caughtFlash -= dt;

      this.stepTimer -= dt;
      if (this.speed > 40 && this.stepTimer <= 0) {
        GG.Sfx.step(); this.stepTimer = 0.34 - Math.min(0.16, this.speed / 1400);
      }
    },

    startSwing: function () {
      if (this.swing > 0 || this.stun > 0) return false;
      if (GG.Fishing && GG.Fishing.active()) return false;
      this.swing = this.SWING_TIME;
      GG.Sfx.swing();
      return true;
    },
    swinging: function () { return this.swing > 0; },
    swingProgress: function () { return 1 - this.swing / this.SWING_TIME; },

    /* Where the net head is right now, in world coordinates. */
    netPoint: function () {
      var p = this.swing > 0 ? this.swingProgress() : 0;
      var reach = this.swing > 0 ? 20 + Math.sin(Math.min(1, p * 1.6) * Math.PI) * 26 : 16;
      var sweep = this.swing > 0 ? (p - 0.5) * 1.5 : 0.5;
      var a = this.angle + sweep;
      return { x: this.x + Math.cos(a) * reach, y: this.y + Math.sin(a) * reach * 0.85 - 6, r: 22 };
    },

    draw: function (c, sx, sy, t) {
      var bob = Math.sin(this.walk * 2) * (this.speed > 20 ? 1.6 : 0);
      var lean = Math.sin(this.walk * 2) * (this.speed > 20 ? 0.07 : 0);
      if (this.stun > 0) lean += Math.sin(t * 26) * 0.09;
      var d = this.dir;

      c.fillStyle = 'rgba(30,60,25,0.22)';
      c.beginPath(); c.ellipse(sx, sy + 1, 11, 4.6, 0, 0, Math.PI * 2); c.fill();

      var rodding = GG.Fishing && GG.Fishing.active();
      var behind = (d === 'up');
      if (behind) { if (rodding) GG.Fishing.drawRod(c, sx, sy, this); else this._net(c, sx, sy, t); }

      c.save();
      c.translate(sx, sy - bob);
      c.rotate(lean);

      // legs
      var swingLeg = Math.sin(this.walk * 2) * (this.speed > 20 ? 3.2 : 0);
      c.fillStyle = '#f3cfae';
      c.fillRect(-5, -7, 3.6, 7 + swingLeg * 0.4);
      c.fillRect(1.6, -7, 3.6, 7 - swingLeg * 0.4);
      c.fillStyle = '#5b4a8a';
      c.beginPath(); c.ellipse(-3.3, -0.4 + swingLeg * 0.2, 3.1, 2.1, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(3.3, -0.4 - swingLeg * 0.2, 3.1, 2.1, 0, 0, Math.PI * 2); c.fill();

      // dress
      c.fillStyle = '#57b8d8';
      c.beginPath();
      c.moveTo(-6.4, -7); c.lineTo(-9, -8.5);
      c.quadraticCurveTo(0, -10.5, 9, -8.5);
      c.lineTo(6.4, -7);
      c.quadraticCurveTo(0, -5.4, -6.4, -7);
      c.closePath(); c.fill();
      c.fillStyle = '#6ccbea';
      GG.roundRect(c, -6, -19, 12, 12, 3.5); c.fill();
      c.fillStyle = '#ffffff';
      c.fillRect(-6, -13.4, 12, 1.8);

      // arms
      c.strokeStyle = '#f3cfae'; c.lineWidth = 3.1; c.lineCap = 'round';
      var armSwing = Math.sin(this.walk * 2) * (this.speed > 20 ? 2.4 : 0);
      if (d !== 'up') {
        c.beginPath(); c.moveTo(-5.4, -16.5); c.lineTo(-8.2, -10 + armSwing); c.stroke();
        c.beginPath(); c.moveTo(5.4, -16.5); c.lineTo(8.2, -10 - armSwing); c.stroke();
      }

      // head
      var HAIR = '#3a2a1e';
      if (d === 'up') {
        // Seen from behind it is hair all the way round - no face, no bald patch.
        c.fillStyle = HAIR;
        c.beginPath(); c.ellipse(0, -26.5, 10.4, 9.8, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(-9.4, -25, 3.3, 6.4, 0.12, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(9.4, -25, 3.3, 6.4, -0.12, 0, Math.PI * 2); c.fill();
        // a soft shine and a parting so it reads as the back of her head
        c.fillStyle = 'rgba(255,255,255,0.13)';
        c.beginPath(); c.ellipse(-0.6, -30.4, 7.4, 4.4, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 0.9; c.lineCap = 'round';
        for (var hs = -1; hs <= 1; hs++) {
          c.beginPath();
          c.moveTo(hs * 3.4, -33.4);
          c.quadraticCurveTo(hs * 5.2, -28, hs * 4.6, -20.6);
          c.stroke();
        }
        // little bun
        c.fillStyle = HAIR;
        c.beginPath(); c.ellipse(0, -34.6, 4.6, 3.6, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ff8fb0';
        c.beginPath(); c.ellipse(0, -34.6, 5.2, 1.5, 0, 0, Math.PI * 2); c.fill();
      } else {
        c.fillStyle = HAIR;
        c.beginPath(); c.ellipse(0, -26.5, 10.4, 9.6, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fadcc0';
        c.beginPath(); c.ellipse(0, -25.5, 8.6, 8.2, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = HAIR;
        c.beginPath(); c.ellipse(0, -30.6, 8.8, 5.6, 0, Math.PI, 0); c.fill();
        c.beginPath(); c.ellipse(-9.4, -25, 3.1, 6.2, 0.12, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(9.4, -25, 3.1, 6.2, -0.12, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#ff8fb0';
      c.beginPath(); c.ellipse(7.6, -31.4, 3.4, 2.8, -0.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffd45c';
      c.beginPath(); c.ellipse(7.6, -31.4, 1.2, 1.2, 0, 0, Math.PI * 2); c.fill();

      // face
      if (d !== 'up') {
        var fx = d === 'left' ? -2.4 : (d === 'right' ? 2.4 : 0);
        c.fillStyle = '#2f2119';
        var blink = (Math.sin(t * 0.9) > 0.985) ? 0.25 : 1;
        c.beginPath(); c.ellipse(fx - 3.1, -25.4, 1.25, 1.5 * blink, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(fx + 3.1, -25.4, 1.25, 1.5 * blink, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.ellipse(fx - 3.4, -25.9, 0.45, 0.5, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(fx + 2.8, -25.9, 0.45, 0.5, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,150,150,0.5)';
        c.beginPath(); c.ellipse(fx - 5.4, -22.8, 1.7, 1.1, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(fx + 5.4, -22.8, 1.7, 1.1, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#2f2119'; c.lineWidth = 1;
        c.beginPath(); c.arc(fx, -22.6, 2.1, 0.28, Math.PI - 0.28); c.stroke();
      }
      c.restore();

      if (!behind) { if (rodding) GG.Fishing.drawRod(c, sx, sy, this); else this._net(c, sx, sy, t); }
      if (this.stun > 0) this._stars(c, sx, sy - bob, t);
    },

    /* Little stars going round her head after a sting. */
    _stars: function (c, sx, sy, t) {
      for (var i = 0; i < 3; i++) {
        var a = t * 5 + i * (Math.PI * 2 / 3);
        var x = sx + Math.cos(a) * 13;
        var y = sy - 40 + Math.sin(a) * 4.5;
        var sc = 0.8 + Math.sin(a) * 0.25;
        c.fillStyle = '#ffd94a';
        c.beginPath();
        for (var k = 0; k < 10; k++) {
          var ang = -Math.PI / 2 + k * Math.PI / 5;
          var r = (k % 2 ? 1.7 : 3.8) * sc;
          var px = x + Math.cos(ang) * r, py = y + Math.sin(ang) * r;
          if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
        }
        c.closePath(); c.fill();
      }
    },

    _net: function (c, sx, sy, t) {
      var p = this.swing > 0 ? this.swingProgress() : 0;
      var sweep = this.swing > 0 ? (p - 0.5) * 1.5 : 0.5;
      var a = this.angle + sweep;
      var handX = sx + Math.cos(this.angle) * 5, handY = sy - 12;
      var reach = this.swing > 0 ? 20 + Math.sin(Math.min(1, p * 1.6) * Math.PI) * 26 : 16;
      var hx = sx + Math.cos(a) * reach, hy = sy + Math.sin(a) * reach * 0.85 - 6;

      c.strokeStyle = '#c8a878'; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(handX, handY); c.lineTo(hx, hy); c.stroke();

      var r = 10.5;
      c.save();
      c.translate(hx, hy);
      c.rotate(a);
      c.fillStyle = 'rgba(255,255,255,0.34)';
      c.beginPath(); c.ellipse(2, 0, r, r * 0.92, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#e8e2d2'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(2, 0, r, r * 0.92, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.8;
      for (var i = -2; i <= 2; i++) {
        c.beginPath(); c.moveTo(2 + i * 3.6, -r * 0.86); c.lineTo(2 + i * 3.6, r * 0.86); c.stroke();
        c.beginPath(); c.moveTo(2 - r * 0.92, i * 3.6); c.lineTo(2 + r * 0.92, i * 3.6); c.stroke();
      }
      c.restore();

      if (this.swing > 0 && p < 0.6) {
        c.strokeStyle = 'rgba(255,255,255,0.30)'; c.lineWidth = 3;
        c.beginPath();
        c.arc(sx, sy - 6, reach, this.angle - 0.8, this.angle + sweep);
        c.stroke();
      }
    }
  };
})(window.GG = window.GG || {});
