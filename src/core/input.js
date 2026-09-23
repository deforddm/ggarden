/* Touch joystick, tap-to-walk and keyboard. Works on a phone or a laptop.

   v1.17 (David): "currently we only allow movement by pressing the left side
   of the screen. Let's change that up to allow it across the full screen and
   also allow the player to click to move to locations seamlessly."

   So a finger (or the mouse) anywhere on the game - not on a button - does
   one of two things, decided by what it does next:
     - it slides more than a few pixels: that is the floating joystick,
       centred where the finger first landed, exactly as before;
     - it lifts again quickly without sliding: that is a TAP, and Guin walks
       to the spot she tapped, steering round nothing but stopping politely
       when she arrives or when something is in the way.
   Any stick or key movement takes over from a tap straight away. */
(function (GG) {
  'use strict';

  var Input = GG.Input = {
    x: 0, y: 0,          // stick direction, -1..1
    mag: 0,              // 0..1 how far the stick is pushed
    actionPressed: false,// edge trigger for the A button
    action2Pressed: false,// edge trigger for the fishing button
    action3Pressed: false,// edge trigger for the friend button
    keys: {},
    stick: { active: false, id: null, ox: 0, oy: 0, cx: 0, cy: 0 },
    _actionQueued: false,
    pending: null,       // a finger that is down but has not slid yet
    moveTarget: null,    // { x, y } in the current scene's coordinates
    TAP_SLOP: 12,        // px a finger may wander and still count as a tap
    TAP_TIME: 450,       // ms: longer than this and it is not a tap

    /* Walk to (x, y) in the current scene. */
    walkTo: function (x, y) {
      this.moveTarget = { x: x, y: y, t: 0, best: 1e9, since: 0 };
    },
    clearTarget: function () { this.moveTarget = null; },

    init: function (rootEl, stickEl, knobEl, actionEl, action2El, action3El) {
      this.action2El = action2El;
      this.action3El = action3El;
      var self = this;
      this.stickEl = stickEl; this.knobEl = knobEl;

      function startStick(id, px, py) {
        self.stick.active = true; self.stick.id = id;
        self.stick.ox = px; self.stick.oy = py;
        self.stick.cx = px; self.stick.cy = py;
        stickEl.style.left = px + 'px'; stickEl.style.top = py + 'px';
        stickEl.classList.add('on');
      }
      function moveStick(px, py) {
        var dx = px - self.stick.ox, dy = py - self.stick.oy;
        var len = Math.sqrt(dx * dx + dy * dy);
        var max = 52;
        if (len > max) { dx = dx / len * max; dy = dy / len * max; len = max; }
        self.stick.cx = self.stick.ox + dx; self.stick.cy = self.stick.oy + dy;
        knobEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        self.mag = GG.clamp(len / max, 0, 1);
        if (len > 0.01) { self.x = dx / (len || 1); self.y = dy / (len || 1); }
        else { self.x = 0; self.y = 0; }
      }
      function endStick() {
        self.stick.active = false; self.stick.id = null;
        self.x = 0; self.y = 0; self.mag = 0;
        knobEl.style.transform = 'translate(0,0)';
        stickEl.classList.remove('on');
      }

      // A touch that lands on a button, a menu or a popup belongs to that
      // control - never swallow it, or nothing in the menus can be tapped.
      var UI_SELECTOR = '.panel, button, input, select, textarea, a, #catch-pop, #hud-top, #btn-update';
      function onUI(target) {
        if (!target) return false;
        if (target === actionEl || actionEl.contains(target)) return true;
        if (action2El && (target === action2El || action2El.contains(target))) return true;
        if (action3El && (target === action3El || action3El.contains(target))) return true;
        var el = target;
        while (el && el !== rootEl && el.nodeType === 1) {
          if (el.closest) return !!el.closest(UI_SELECTOR);
          el = el.parentNode;
        }
        return false;
      }

      /* ---- one finger, two gestures: slide = joystick, tap = walk there ---- */
      function down(id, px, py) {
        if (self.stick.active || self.pending) return false;
        self.pending = { id: id, x: px, y: py, t: Date.now() };
        return true;
      }
      function slide(id, px, py) {
        var pd = self.pending;
        if (pd && pd.id === id) {
          if (Math.abs(px - pd.x) + Math.abs(py - pd.y) > self.TAP_SLOP) {
            /* it is a drag: the stick appears where the finger first landed */
            self.pending = null;
            self.moveTarget = null;
            startStick(id, pd.x, pd.y);
            moveStick(px, py);
          }
          return true;
        }
        if (self.stick.active && self.stick.id === id) { moveStick(px, py); return true; }
        return false;
      }
      function up(id, px, py) {
        var pd = self.pending;
        if (pd && pd.id === id) {
          self.pending = null;
          if (Date.now() - pd.t <= self.TAP_TIME && GG.screenToWorld) {
            var w = GG.screenToWorld(px, py);
            if (w) self.walkTo(w.x, w.y);
          }
          return true;
        }
        if (self.stick.active && self.stick.id === id) { endStick(); return true; }
        return false;
      }

      rootEl.addEventListener('touchstart', function (e) {
        if (GG.UI && GG.UI.anyOpen()) return;
        var grabbed = false;
        for (var i = 0; i < e.changedTouches.length; i++) {
          var t = e.changedTouches[i];
          if (onUI(t.target)) continue;
          if (down(t.identifier, t.clientX, t.clientY)) grabbed = true;
        }
        if (grabbed) e.preventDefault();
      }, { passive: false });

      rootEl.addEventListener('touchmove', function (e) {
        var mine = false;
        for (var i = 0; i < e.changedTouches.length; i++) {
          var t = e.changedTouches[i];
          if (slide(t.identifier, t.clientX, t.clientY)) mine = true;
        }
        if (mine) e.preventDefault();
      }, { passive: false });

      function touchEnd(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          var t = e.changedTouches[i];
          up(t.identifier, t.clientX, t.clientY);
        }
      }
      rootEl.addEventListener('touchend', touchEnd);
      rootEl.addEventListener('touchcancel', function (e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          var id = e.changedTouches[i].identifier;
          if (self.pending && self.pending.id === id) self.pending = null;
          if (self.stick.active && self.stick.id === id) endStick();
        }
      });

      // Mouse, for playing on a computer: click to walk there, drag to steer.
      rootEl.addEventListener('mousedown', function (e) {
        if (GG.UI && GG.UI.anyOpen()) return;
        if (onUI(e.target)) return;
        if (e.button !== undefined && e.button !== 0) return;
        down('mouse', e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', function (e) { slide('mouse', e.clientX, e.clientY); });
      window.addEventListener('mouseup', function (e) { up('mouse', e.clientX, e.clientY); });

      function press(e) { e.preventDefault(); self._actionQueued = true; actionEl.classList.add('down'); }
      function release() { actionEl.classList.remove('down'); }
      actionEl.addEventListener('touchstart', press, { passive: false });
      actionEl.addEventListener('touchend', release);
      actionEl.addEventListener('mousedown', press);
      actionEl.addEventListener('mouseup', release);
      actionEl.addEventListener('mouseleave', release);

      if (action2El) {
        var press2 = function (e) { e.preventDefault(); self._action2Queued = true; action2El.classList.add('down'); };
        var rel2 = function () { action2El.classList.remove('down'); };
        action2El.addEventListener('touchstart', press2, { passive: false });
        action2El.addEventListener('touchend', rel2);
        action2El.addEventListener('mousedown', press2);
        action2El.addEventListener('mouseup', rel2);
        action2El.addEventListener('mouseleave', rel2);
      }

      if (action3El) {
        var press3 = function (e) { e.preventDefault(); self._action3Queued = true; action3El.classList.add('down'); };
        var rel3 = function () { action3El.classList.remove('down'); };
        action3El.addEventListener('touchstart', press3, { passive: false });
        action3El.addEventListener('touchend', rel3);
        action3El.addEventListener('mousedown', press3);
        action3El.addEventListener('mouseup', rel3);
        action3El.addEventListener('mouseleave', rel3);
      }

      window.addEventListener('keydown', function (e) {
        self.keys[e.key.toLowerCase()] = true;
        if (e.key.toLowerCase() === 'f') { self._action2Queued = true; e.preventDefault(); }
        if (e.key.toLowerCase() === 'e') { self._action3Queued = true; e.preventDefault(); }
        if (e.key === ' ' || e.key === 'Enter') { self._actionQueued = true; e.preventDefault(); }
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
      });
      window.addEventListener('keyup', function (e) { self.keys[e.key.toLowerCase()] = false; });
      window.addEventListener('blur', function () { self.keys = {}; self.pending = null; endStick(); });
    },

    /* Walking to a tapped spot: head straight for it, ease off at the end,
       and give up quietly if she stops getting any closer (a tree, the
       river, the edge of the room) rather than treading on the spot. */
    steer: function () {
      var T = this.moveTarget, P = GG.Player;
      var dx = T.x - P.x, dy = T.y - P.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 3) {
        /* arrived: settle on the spot rather than skidding past it */
        this.moveTarget = null; this.x = 0; this.y = 0; this.mag = 0;
        P.vx *= 0.25; P.vy *= 0.25;
        return;
      }
      var now = Date.now();
      if (!T.at) T.at = now;
      if (d < T.best - 2) { T.best = d; T.at = now; }
      else if (now - T.at > 450) { this.moveTarget = null; this.x = 0; this.y = 0; this.mag = 0; return; }
      this.x = dx / d; this.y = dy / d;
      this.mag = GG.clamp(d / 48, 0.18, 1);   // full speed, easing off over the last few steps
    },

    // Called once per frame, after the stick values are read.
    beginFrame: function () {
      var k = this.keys;
      var kx = 0, ky = 0;
      if (k['arrowleft'] || k['a']) kx -= 1;
      if (k['arrowright'] || k['d']) kx += 1;
      if (k['arrowup'] || k['w']) ky -= 1;
      if (k['arrowdown'] || k['s']) ky += 1;
      if (kx || ky) {
        var l = Math.sqrt(kx * kx + ky * ky);
        this.x = kx / l; this.y = ky / l;
        this.mag = (k['shift']) ? 0.42 : 1;   // hold shift to tiptoe
        this.moveTarget = null;               // the keys take over from a tap
      } else if (this.stick.active) {
        this.moveTarget = null;
      } else if (this.moveTarget && GG.Player) {
        this.steer();
      } else {
        this.x = 0; this.y = 0; this.mag = 0;
      }
      this.actionPressed = this._actionQueued;
      this._actionQueued = false;
      this.action2Pressed = this._action2Queued;
      this._action2Queued = false;
      this.action3Pressed = this._action3Queued;
      this._action3Queued = false;
    }
  };
})(window.GG = window.GG || {});
