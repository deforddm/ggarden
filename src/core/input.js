/* Touch joystick + keyboard. Works on a phone or a laptop. */
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

      rootEl.addEventListener('touchstart', function (e) {
        if (GG.UI && GG.UI.anyOpen()) return;
        var grabbed = false;
        for (var i = 0; i < e.changedTouches.length; i++) {
          var t = e.changedTouches[i];
          if (onUI(t.target)) continue;
          if (!self.stick.active && t.clientX < window.innerWidth * 0.62) {
            startStick(t.identifier, t.clientX, t.clientY);
            grabbed = true;
          }
        }
        if (grabbed) e.preventDefault();
      }, { passive: false });

      rootEl.addEventListener('touchmove', function (e) {
        if (!self.stick.active) return;
        var mine = false;
        for (var i = 0; i < e.changedTouches.length; i++) {
          var t = e.changedTouches[i];
          if (t.identifier === self.stick.id) { moveStick(t.clientX, t.clientY); mine = true; }
        }
        if (mine) e.preventDefault();
      }, { passive: false });

      function touchEnd(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          if (self.stick.active && e.changedTouches[i].identifier === self.stick.id) endStick();
        }
      }
      rootEl.addEventListener('touchend', touchEnd);
      rootEl.addEventListener('touchcancel', touchEnd);

      // Mouse, for playing on a computer.
      rootEl.addEventListener('mousedown', function (e) {
        if (GG.UI && GG.UI.anyOpen()) return;
        if (onUI(e.target)) return;
        startStick('mouse', e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', function (e) {
        if (self.stick.active && self.stick.id === 'mouse') moveStick(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', function () {
        if (self.stick.active && self.stick.id === 'mouse') endStick();
      });

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
      window.addEventListener('blur', function () { self.keys = {}; endStick(); });
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
      } else if (!this.stick.active) {
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
