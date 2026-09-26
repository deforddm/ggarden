/* v1.20 - the "My character" screen (#screen-char).

   GG.CharSelect.open(onDone)  show it; onDone() runs after "Let's go!" saves
   GG.CharSelect.skip()        accept what is on screen (or the default) at once
   GG.CharSelect.needed()      true when this garden has no character yet

   Big live preview at the top (turns round on its own, or when tapped, and
   waves hello), chunky rows of choices underneath. Every change shows at once
   with a little bounce and a sparkle. Nothing is saved until "Let's go!". */
(function (GG) {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var L = function () { return GG.LOOKS; };
  var TURN = ['down', 'right', 'up', 'left'];

  function sfx(name) { try { if (GG.Sfx && GG.Sfx[name]) GG.Sfx[name](); } catch (e) {} }
  function dpr() { return Math.min(window.devicePixelRatio || 1, 3); }

  var CS = GG.CharSelect = {
    look: null,
    _onDone: null,
    _built: false,
    _open: false,
    _dirI: 0,
    _turnT: 0,
    _pop: 0,
    _t0: 0,
    _tiles: [],        // { canvas, row, value, kind }
    _queue: [],

    needed: function () { return !(GG.Save && GG.Save.data && GG.Save.data.player); },

    isOpen: function () { return this._open; },

    open: function (onDone) {
      this._build();
      var d = GG.Save.data, guest = GG.Save.isGuest();
      this._first = !d.player;
      if (d.player) this.look = L().sanitize(L().copy(d.player));
      else if (guest) {
        this.look = L().random();
        this.look.name = (d.guestName && d.guestName !== 'Friend') ? d.guestName : '';
      } else {
        /* Guin's own garden - new or from before v1.20 - starts as Guin */
        this.look = GG.defaultPlayer();
      }
      this._onDone = onDone || null;
      $('char-title').textContent = this._first ? 'Make your character' : 'My character';
      $('char-name').placeholder = guest ? 'Your name' : 'Guin';
      $('char-name').value = this.look.name || '';
      this._dirI = 0; this._turnT = 0; this._waveT = 0; this._pop = 0;
      this._refreshAll();
      GG.UI.open('screen-char');
      var body = document.querySelector('#screen-char .body');
      if (body) body.scrollTop = 0;
      this._open = true;
      this._t0 = performance.now();
      this._loop();
    },

    /* take what is showing (or the default) and carry on */
    skip: function () {
      if (!this._open) {
        if (this.needed()) {
          var d = GG.Save.data;
          var lk = GG.defaultPlayer();
          if (GG.Save.isGuest()) lk.name = d.guestName || 'Friend';
          d.player = lk; d.name = lk.name;
          GG.Save.save();
          if (GG.PlayerArt) GG.PlayerArt.invalidate();
        }
        return;
      }
      this._go();
    },

    _go: function () {
      var d = GG.Save.data, guest = GG.Save.isGuest();
      var lk = L().sanitize(L().copy(this.look));
      var nm = ($('char-name').value || '').trim().slice(0, L().NAME_MAX);
      lk.name = nm || (guest ? (d.guestName || 'Friend') : 'Guin');
      d.player = lk;
      d.name = lk.name;
      if (guest) d.guestName = lk.name;
      GG.Save.save();
      if (GG.PlayerArt) GG.PlayerArt.invalidate();   // the next frame redraws and re-warms her
      this._close();
      var cb = this._onDone; this._onDone = null;
      if (cb) cb(lk);
    },

    _close: function () {
      this._open = false;
      GG.UI.close('screen-char');
      if (GG.PlayerArt) GG.PlayerArt.invalidate();
    },

    /* ---------- building the rows ---------- */
    _build: function () {
      if (this._built) return;
      this._built = true;
      var self = this, rows = $('char-rows');
      var LK = L();

      function row(title, cls) {
        var r = document.createElement('div');
        r.className = 'cs-row ' + (cls || '');
        var h = document.createElement('div'); h.className = 'cs-label'; h.textContent = title;
        r.appendChild(h);
        var g = document.createElement('div'); g.className = 'cs-choices';
        r.appendChild(g);
        rows.appendChild(r);
        return g;
      }
      function button(parent, cls, field, value, label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cs-btn ' + cls;
        b.setAttribute('data-field', field);
        b.setAttribute('data-value', String(value));
        if (label) { b.setAttribute('aria-label', label); b.title = label; }
        b.addEventListener('click', function () { self._set(field, value); });
        parent.appendChild(b);
        return b;
      }
      function swatch(parent, field, value, color, label) {
        var b = button(parent, 'cs-swatch', field, value, label);
        b.style.background = color;
        return b;
      }
      function tile(parent, field, value, kind, label, withName) {
        var b = button(parent, 'cs-tile cs-' + kind, field, value, label);
        var cv = document.createElement('canvas');
        b.appendChild(cv);
        if (withName) { var s = document.createElement('span'); s.textContent = label; b.appendChild(s); }
        self._tiles.push({ canvas: cv, field: field, value: value, kind: kind });
        return b;
      }

      /* girl or boy */
      var g = row('I am a…', 'cs-body');
      LK.BODIES.forEach(function (bd) {
        var b = button(g, 'cs-big', 'body', bd.id, bd.name);
        b.textContent = bd.name;
      });

      /* name */
      g = row('My name', 'cs-namerow');
      var inp = document.createElement('input');
      inp.type = 'text'; inp.id = 'char-name'; inp.maxLength = LK.NAME_MAX;
      inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'words'); inp.spellcheck = false;
      inp.addEventListener('input', function () {
        self.look = L().copy(self.look);
        self.look.name = inp.value.slice(0, L().NAME_MAX);
      });
      /* Enter closes the phone keyboard instead of doing nothing */
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') inp.blur(); });
      g.appendChild(inp);

      g = row('Skin');
      LK.SKINS.forEach(function (s) { swatch(g, 'skin', s.id, s.base, s.name); });

      g = row('Hair');
      g.classList.add('cs-tiles');
      LK.HAIRS.forEach(function (h) { tile(g, 'hair', h.id, 'head', h.name); });

      g = row('Hair colour');
      LK.HAIR_COLORS.forEach(function (h) { swatch(g, 'hairCol', h.id, h.base, h.name); });

      g = row('Eyes');
      LK.EYES.forEach(function (e) {
        var b = swatch(g, 'eyes', e.id, e.base, e.name);
        b.classList.add('cs-eye');
      });

      g = row('Clothes');
      g.classList.add('cs-tiles');
      LK.OUTFITS.forEach(function (o) { tile(g, 'outfit', o.id, 'body', o.name, true); });
      this._outfitColors = row('Clothes colour');

      g = row('Something extra');
      g.classList.add('cs-tiles');
      LK.ACCS.forEach(function (a) { tile(g, 'acc', a.id, 'acc', a.name, true); });
      this._accColors = row('Its colour', 'cs-acccol');
      LK.ACC_COLORS.forEach(function (a) { swatch(self._accColors, 'accCol', a.id, a.base, a.id); });

      /* the preview: tap to turn round */
      var pv = $('char-preview');
      pv.addEventListener('click', function () { self._turn(); });
      $('char-turn').addEventListener('click', function () { self._turn(); });
      $('char-surprise').addEventListener('click', function () {
        var nm = self.look.name;
        var r = L().random(self.look.body);
        r.name = nm;
        self.look = r;
        sfx('ding');
        self._bump();
        self._refreshAll();
      });
      $('char-go').addEventListener('click', function () { sfx('click'); self._go(); });
      $('char-x').addEventListener('click', function () { sfx('click'); self._close(); });
    },

    _turn: function () {
      this._dirI = (this._dirI + 1) % 4;
      this._turnT = 0;
      if (TURN[this._dirI] === 'down') this._waveT = 1.4;
      sfx('click');
    },

    _set: function (field, value) {
      var nl = L().copy(this.look);
      nl[field] = value;
      if (field === 'outfit') {
        /* keep the same colour slot where the new style has one */
        var n = L().OUTFIT_BY_ID[value].colors.length;
        if (nl.outfitCol >= n) nl.outfitCol = 0;
      }
      this.look = nl;
      sfx('place');
      this._bump();
      /* show the face for face-ish choices */
      if (field === 'eyes' || field === 'acc' || field === 'body') { this._dirI = 0; this._turnT = 0; }
      this._refreshAll(field);
    },

    _bump: function () {
      this._pop = 1;
      this._sparkles = [];
      for (var i = 0; i < 9; i++) {
        this._sparkles.push({ a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.25, s: 0.6 + Math.random() * 0.6, d: Math.random() * 0.15 });
      }
    },

    /* selected states, the colour rows, and which tile pictures need redoing */
    _refreshAll: function (changed) {
      var lk = this.look, self = this;
      var btns = document.querySelectorAll('#char-rows .cs-btn');
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i], f = b.getAttribute('data-field'), v = b.getAttribute('data-value');
        var on = String(lk[f]) === v;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      /* outfit colour swatches follow the outfit */
      var oc = this._outfitColors;
      if (oc._for !== lk.outfit) {
        oc.innerHTML = '';
        oc._for = lk.outfit;
        L().OUTFIT_BY_ID[lk.outfit].colors.forEach(function (col, k) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'cs-btn cs-swatch cs-duo';
          b.setAttribute('data-field', 'outfitCol');
          b.setAttribute('data-value', String(k));
          b.setAttribute('aria-label', 'Colour ' + (k + 1));
          b.style.background = 'linear-gradient(135deg,' + col.a + ' 0 58%,' + col.b + ' 58% 100%)';
          b.addEventListener('click', function () { self._set('outfitCol', k); });
          oc.appendChild(b);
        });
      }
      var ocb = oc.querySelectorAll('.cs-btn');
      for (var j = 0; j < ocb.length; j++) ocb[j].classList.toggle('on', ocb[j].getAttribute('data-value') === String(lk.outfitCol));
      this._accColors.parentNode.classList.toggle('hidden', lk.acc === 'none');

      /* pictures on the tiles */
      var DEPS = {
        head: { body: 1, skin: 1, hairCol: 1, eyes: 1 },
        body: { body: 1, skin: 1, hair: 1, hairCol: 1, eyes: 1, outfitCol: 1, acc: 1, accCol: 1 },
        acc: { body: 1, skin: 1, hair: 1, hairCol: 1, eyes: 1, accCol: 1 }
      };
      for (var t = 0; t < this._tiles.length; t++) {
        var tl = this._tiles[t];
        if (!changed || DEPS[tl.kind][changed] || !tl.drawn) {
          tl.drawn = false;
          if (this._queue.indexOf(tl) < 0) this._queue.push(tl);
        }
      }
    },

    _drawTile: function (tl) {
      var cv = tl.canvas, r = dpr();
      var w = cv.clientWidth || 60, h = cv.clientHeight || 60;
      if (!cv.clientWidth) return false;   // not laid out yet
      var W = Math.round(w * r), H = Math.round(h * r);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      var c = cv.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      var lk = L().copy(this.look);
      lk[tl.field] = tl.value;
      var PA = GG.PlayerArt, B = PA.BOX, img, S, cx, cy, span;
      if (tl.kind === 'head') {
        lk.acc = 'none';
        span = 36; cx = 0; cy = -29;
        S = H / span;
        img = PA.renderTo(lk, 'down', S, { headOnly: true });
      } else if (tl.kind === 'acc') {
        /* the whole top half, so a neckerchief shows too */
        span = 34; cx = 0; cy = -26.5;
        S = H / span;
        img = PA.renderTo(lk, 'down', S, {});
      } else {
        if (tl.field === 'outfit') lk.outfitCol = (lk.outfit === this.look.outfit) ? this.look.outfitCol : 0;
        span = 50; cx = 0; cy = -21;
        S = H / span;
        img = PA.renderTo(lk, 'down', S, {});
      }
      /* place the world point (cx, cy) at the middle of the tile */
      var ox = W / 2 - (cx - B.x0) * S, oy = H / 2 - (cy - B.y0) * S;
      c.drawImage(img, ox, oy);
      tl.drawn = true;
      return true;
    },

    /* ---------- the preview ---------- */
    _loop: function () {
      var self = this;
      if (this._raf) cancelAnimationFrame(this._raf);
      var last = performance.now();
      var frame = function (now) {
        if (!self._open) { self._raf = 0; return; }
        self._raf = requestAnimationFrame(frame);
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        self._step(dt, (now - self._t0) / 1000);
      };
      this._raf = requestAnimationFrame(frame);
    },

    _step: function (dt, t) {
      /* a few tile pictures per frame, never a long stall */
      var t0 = performance.now();
      while (this._queue.length && performance.now() - t0 < 6) {
        var tl = this._queue.shift();
        if (!this._drawTile(tl)) { this._queue.push(tl); break; }
      }
      /* turn round slowly on its own */
      this._turnT += dt;
      if (this._turnT > 2.6) {
        this._dirI = (this._dirI + 1) % 4; this._turnT = 0;
        if (TURN[this._dirI] === 'down') this._waveT = 1.4;
      }
      if (this._waveT > 0) this._waveT -= dt;
      if (this._pop > 0) this._pop = Math.max(0, this._pop - dt * 2.2);
      this._drawPreview(t);
    },

    _drawPreview: function (t) {
      var cv = $('char-preview');
      if (!cv) return;
      var r = dpr(), w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      var W = Math.round(w * r), H = Math.round(h * r);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      var c = cv.getContext('2d');
      c.setTransform(r, 0, 0, r, 0, 0);
      c.clearRect(0, 0, w, h);
      /* a little stage: sky, a hill of grass, a few flowers */
      var g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#bfe9ff'); g.addColorStop(0.62, '#e8f8ff'); g.addColorStop(0.63, '#9fdc78'); g.addColorStop(1, '#79c85a');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      cloud(c, w * 0.18, h * 0.2, 16); cloud(c, w * 0.82, h * 0.14, 12);
      var feetY = h * 0.9;
      c.fillStyle = 'rgba(40,90,30,0.22)';
      c.beginPath(); c.ellipse(w / 2, feetY, 42, 11, 0, 0, Math.PI * 2); c.fill();
      if (GG.Props && GG.Props.flower) {
        var fl = ['#ff8fb0', '#ffd45c', '#c39bff', '#fff0a8'];
        for (var i = 0; i < 6; i++) {
          var fx = (i < 3 ? 0.08 + i * 0.1 : 0.72 + (i - 3) * 0.1) * w;
          try { GG.Props.flower(c, fx, h * (0.8 + (i % 2) * 0.1), 9, t, i * 0.9, fl[i % 4]); } catch (e) {}
        }
      }
      /* the character, as big as fits */
      var scale = Math.min(h * 0.86 / 46, w * 0.8 / 40);
      var pop = this._pop, bounce = pop > 0 ? Math.sin((1 - pop) * Math.PI * 2.5) * pop * 0.08 : 0;
      var hop = pop > 0 ? Math.sin((1 - pop) * Math.PI) * pop * 10 : 0;
      c.save();
      c.translate(w / 2, feetY - hop);
      c.scale(1 - bounce * 0.5, 1 + bounce);
      GG.PlayerArt.portrait(c, this.look, 0, 0, scale, t, { dir: TURN[this._dirI], wave: this._waveT > 0, deviceScale: r });
      c.restore();
      /* sparkles after a change */
      if (pop > 0 && this._sparkles) {
        for (var k = 0; k < this._sparkles.length; k++) {
          var s = this._sparkles[k];
          var life = GG.clamp((1 - pop - s.d) / 0.85, 0, 1);
          if (life <= 0 || life >= 1) continue;
          var rad = (s.r + life * 0.25) * Math.min(w, h);
          var x = w / 2 + Math.cos(s.a) * rad * 0.9, y = feetY - scale * 24 + Math.sin(s.a) * rad * 0.8;
          c.globalAlpha = 1 - life;
          c.fillStyle = k % 3 ? '#ffd94a' : '#ffffff';
          star(c, x, y, 7 * s.s * (1 - life * 0.4));
          c.globalAlpha = 1;
        }
      }
    }
  };

  function cloud(c, x, y, r) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.arc(x + r * 0.9, y + r * 0.2, r * 0.75, 0, Math.PI * 2);
    c.arc(x - r * 0.9, y + r * 0.25, r * 0.65, 0, Math.PI * 2);
    c.fill();
  }
  function star(c, x, y, r) {
    c.beginPath();
    for (var k = 0; k < 8; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 4, rr = k % 2 ? r * 0.35 : r;
      if (k === 0) c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      else c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath(); c.fill();
  }
})(window.GG = window.GG || {});
