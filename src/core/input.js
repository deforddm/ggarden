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
    TAP_TIME: 4000,      // ms: a press that never slides is a tap, however long she
                         // holds it (v1.19 - small fingers press and hold)
    tapPressed: null,    // { x, y } on the frame a tap lifted, in scene coordinates
    blockedFn: null,     // the current scene's collision test, set by main.js

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
            if (w) { self.walkTo(w.x, w.y); self._tapQueued = { x: w.x, y: w.y }; }
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
    /* v1.20: find a way there first. A tap far away through thick woods
       used to stop her short about one time in five, because "head straight
       for it and slip round what is in front" cannot get out of a pocket of
       trees. So on the first frame of a walk she plans a route on a little
       grid (A*, 12 px squares, only the box round her and the spot, and a
       hard cap on the work), pulls it tight into a few straight legs, and
       then walks the legs. No route (the spot is across the river, say):
       she walks the old way and stops politely when she gets no closer. */
    plan: function (T, P, B) {
      var CELL = 12, RAD = 12, MAXN = 9000;
      var sx = P.x, sy = P.y, tx = T.x, ty = T.y;
      var pad = 240;
      var minX = Math.min(sx, tx) - pad, minY = Math.min(sy, ty) - pad;
      var nx = Math.ceil((Math.max(sx, tx) + pad - minX) / CELL), ny = Math.ceil((Math.max(sy, ty) + pad - minY) / CELL);
      if (nx * ny > 90000) return null;          // too far to plan: walk the old way
      function cx(x) { return Math.round((x - minX) / CELL); }
      function cy(y) { return Math.round((y - minY) / CELL); }
      var N = nx * ny, state = new Uint8Array(N);   // 0 unknown, 1 free, 2 blocked
      function free(i) {
        if (!state[i]) state[i] = B(minX + (i % nx) * CELL, minY + ((i / nx) | 0) * CELL, RAD) ? 2 : 1;
        return state[i] === 1;
      }
      var si = cy(sy) * nx + cx(sx), gx = cx(tx), gy = cy(ty), gi = gy * nx + gx;
      var moved = false;
      /* the spot itself is inside a bush or a rock: aim for the nearest free square to it */
      if (gi < 0 || gi >= N || !free(gi)) {
        var best = -1, bestD = 1e9;
        for (var r = 1; r <= 4 && best < 0; r++) {
          for (var oy = -r; oy <= r; oy++) for (var ox = -r; ox <= r; ox++) {
            if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
            var ax = gx + ox, ay = gy + oy;
            if (ax < 0 || ay < 0 || ax >= nx || ay >= ny) continue;
            var ai = ay * nx + ax;
            if (free(ai) && ox * ox + oy * oy < bestD) { best = ai; bestD = ox * ox + oy * oy; }
          }
        }
        if (best < 0) return null;
        gi = best; gx = gi % nx; gy = (gi / nx) | 0; moved = true;
      }
      state[si] = 1;                              // she is standing here, so it is free
      var g = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
      var heap = [], hf = [];
      function push(i, f) {
        heap.push(i); hf.push(f);
        var k = heap.length - 1;
        while (k > 0) {
          var q = (k - 1) >> 1;
          if (hf[q] <= hf[k]) break;
          var t = heap[q]; heap[q] = heap[k]; heap[k] = t; t = hf[q]; hf[q] = hf[k]; hf[k] = t; k = q;
        }
      }
      function pop() {
        var top = heap[0], li = heap.pop(), lf = hf.pop();
        if (heap.length) {
          heap[0] = li; hf[0] = lf;
          var k = 0, n = heap.length;
          for (;;) {
            var a = 2 * k + 1, b = a + 1, m = k;
            if (a < n && hf[a] < hf[m]) m = a;
            if (b < n && hf[b] < hf[m]) m = b;
            if (m === k) break;
            var t = heap[m]; heap[m] = heap[k]; heap[k] = t; t = hf[m]; hf[m] = hf[k]; hf[k] = t; k = m;
          }
        }
        return top;
      }
      function h(i) { var ax = i % nx - gx, ay = ((i / nx) | 0) - gy; ax = Math.abs(ax); ay = Math.abs(ay); return Math.max(ax, ay) + 0.414 * Math.min(ax, ay); }
      var DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
      g[si] = 0; push(si, h(si));
      var work = 0, found = false;
      while (heap.length && work < MAXN) {
        var cur = pop();
        if (shut[cur]) continue;
        shut[cur] = 1; work++;
        if (cur === gi) { found = true; break; }
        var ux = cur % nx, uy = (cur / nx) | 0;
        for (var k = 0; k < 8; k++) {
          var vx = ux + DX[k], vy = uy + DY[k];
          if (vx < 0 || vy < 0 || vx >= nx || vy >= ny) continue;
          var vi = vy * nx + vx;
          if (shut[vi] || !free(vi)) continue;
          /* no squeezing diagonally between two trunks */
          if (k >= 4 && (!free(uy * nx + vx) || !free(vy * nx + ux))) continue;
          var ng = g[cur] + (k < 4 ? 1 : 1.414);
          if (ng < g[vi]) { g[vi] = ng; from[vi] = cur; push(vi, ng + h(vi)); }
        }
      }
      if (!found) return null;
      /* she tapped the water or a rock, and the nearest dry spot to it is
         the far bank: do not march her all the way round by the bridge -
         walk the old way and stop at the edge */
      if (moved) {
        var straight = Math.sqrt((tx - sx) * (tx - sx) + (ty - sy) * (ty - sy));
        if (g[gi] * CELL > straight * 1.6 + 80) return null;
      }
      var pts = [];
      for (var c = gi; c >= 0 && c !== si; c = from[c]) pts.push({ x: minX + (c % nx) * CELL, y: minY + ((c / nx) | 0) * CELL });
      pts.reverse();
      /* the last leg ends on the spot she tapped, if she can stand there */
      var tapFree = !B(tx, ty, RAD);
      if (gi === cy(ty) * nx + cx(tx)) pts[pts.length - 1] = { x: tx, y: ty };
      /* pull it tight: from each corner, go to the furthest point she can see */
      function clear(ax, ay, bx, by) {
        var L = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)), n = Math.ceil(L / 5);
        for (var i = 1; i <= n; i++) if (B(ax + (bx - ax) * i / n, ay + (by - ay) * i / n, RAD)) return false;
        return true;
      }
      var out = [], ax0 = sx, ay0 = sy, at = 0;
      while (at < pts.length) {
        var far = at;
        for (var j = pts.length - 1; j > at; j--) if (clear(ax0, ay0, pts[j].x, pts[j].y)) { far = j; break; }
        out.push(pts[far]); ax0 = pts[far].x; ay0 = pts[far].y; at = far + 1;
      }
      var end = out[out.length - 1];
      if (tapFree && end && (end.x !== tx || end.y !== ty) && clear(end.x, end.y, tx, ty)) out.push({ x: tx, y: ty });
      return out;
    },

    steer: function () {
      var T = this.moveTarget, P = GG.Player;
      var B0 = this.blockedFn;
      if (T.path === undefined) {
        T.path = null; T.ox = P.x; T.oy = P.y;
        if (B0) {
          var d0 = Math.sqrt((T.x - P.x) * (T.x - P.x) + (T.y - P.y) * (T.y - P.y));
          if (d0 > 40) { try { T.path = this.plan(T, P, B0); } catch (e) { T.path = null; } }
        }
        if (T.path && T.path.length) {
          var last = T.path[T.path.length - 1];
          T.x = last.x; T.y = last.y;           // aiming for the nearest free spot, if the tap was in a bush
        }
      }
      /* walk the legs of the route one at a time; the last one is the spot itself */
      var W = (T.path && T.path.length > 1) ? T.path[0] : T;
      if (W !== T) {
        var wdx = W.x - P.x, wdy = W.y - P.y;
        if (wdx * wdx + wdy * wdy < 12 * 12) { T.path.shift(); T.best = 1e9; T.at = 0; W = T.path.length > 1 ? T.path[0] : T; }
      }
      var dx = W.x - P.x, dy = W.y - P.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (W === T && d < 3) {
        /* arrived: settle on the spot rather than skidding past it */
        this.moveTarget = null; this.x = 0; this.y = 0; this.mag = 0;
        P.vx *= 0.25; P.vy *= 0.25;
        return;
      }
      var now = Date.now();
      if (!T.at) T.at = now;
      if (d < T.best - 2) { T.best = d; T.at = now; }
      else if (T.path && now - T.at > 450 && Math.abs(P.x - T.ox) + Math.abs(P.y - T.oy) < 6) {
        /* she could not even get started (hemmed in): stop, the old way */
        this.moveTarget = null; this.x = 0; this.y = 0; this.mag = 0; return;
      }
      else if (T.path && now - T.at > 700 && (T.replans || 0) < 2 && this.blockedFn) {
        /* snagged on a corner of the route: plan again from right here */
        T.replans = (T.replans || 0) + 1;
        var fin = { x: T.x, y: T.y };
        var again = null;
        try { again = this.plan(fin, P, this.blockedFn); } catch (e) { again = null; }
        T.path = again && again.length ? again : T.path;
        T.best = 1e9; T.at = now; T.side = 0;
        return;
      }
      else if (now - T.at > (T.side || T.path ? 1600 : 450)) { this.moveTarget = null; this.x = 0; this.y = 0; this.mag = 0; return; }
      var ux = dx / d, uy = dy / d;
      /* v1.19: something in the way? Look a little to one side, then the
         other, and slip round it - a tree trunk or a bush should not stop
         her dead. Once she has picked a side she keeps it, so she does not
         dither left-right-left in front of the trunk. */
      var B = this.blockedFn;
      if (B && d > 14) {
        var look = 24, rad = 10;
        if (B(P.x + ux * look, P.y + uy * look, rad)) {
          var tries = T.side ? [T.side, -T.side] : [1, -1];
          var found = false;
          for (var a = 1; a <= 4 && !found; a++) {
            for (var k = 0; k < tries.length && !found; k++) {
              var ang = tries[k] * a * 0.4;
              var cs = Math.cos(ang), sn = Math.sin(ang);
              var rx = ux * cs - uy * sn, ry = ux * sn + uy * cs;
              if (!B(P.x + rx * look, P.y + ry * look, rad)) {
                ux = rx; uy = ry; T.side = tries[k]; found = true;
              }
            }
          }
        } else if (T.side && d < T.best + 1) {
          T.side = 0;
        }
      }
      this.x = ux; this.y = uy;
      /* full speed along the route, easing off over the last few steps */
      this.mag = W === T ? GG.clamp(d / 48, 0.18, 1) : 1;
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
      this.tapPressed = this._tapQueued || null;
      this._tapQueued = null;
      this.action2Pressed = this._action2Queued;
      this._action2Queued = false;
      this.action3Pressed = this._action3Queued;
      this._action3Queued = false;
    }
  };
})(window.GG = window.GG || {});
