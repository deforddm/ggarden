/* v1.20: the "juice" - confetti when something new goes in a book, sparkles
   that fly up to the HUD and count up, a wiggle on the big button when it
   starts doing something new, and the playful fonts.

   Everything here is decoration. If any of it fails (no canvas, no fonts,
   no network) the game underneath carries on exactly as before. */
(function (GG) {
  'use strict';
  var $ = GG.$ || function (id) { return document.getElementById(id); };

  var reduced = false;
  try {
    var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = !!(mq && mq.matches);
    if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { reduced = e.matches; });
  } catch (e) { reduced = false; }

  /* ---------- fonts ----------
     Fredoka for headings and buttons, Nunito for reading. Loaded without
     blocking anything (media=print, swapped to all once it has arrived), so
     offline - or on a slow connection - the page shows straight away in the
     fallback fonts from the stack in style.css. The service worker caches
     whatever does arrive, so after one online visit they work offline too. */
  function loadFonts() {
    if (document.getElementById('gg-fonts')) return;
    /* the automated tests run with no internet; a failed font request would
       only put noise in their error logs */
    if (navigator.webdriver) return;
    try {
      var l = document.createElement('link');
      l.id = 'gg-fonts';
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap';
      l.media = 'print';
      l.onload = function () {
        l.media = 'all';
        /* the minimap labels are canvas text; a fresh paint picks the font up */
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { FX._fontsReady = true; });
      };
      l.onerror = function () { l.remove(); };
      document.head.appendChild(l);
    } catch (e) { /* the fallback stack is fine */ }
  }

  /* ---------- the title logo: every letter its own bouncing sticker ---------- */
  var LOGO_COLS = ['#ff6fa3', '#ffb21f', '#4fc0f0', '#8a66f0', '#4dbb45', '#ff8a3c'];
  function splitLogo() {
    var h = $('title-logo');
    if (!h || h.getAttribute('data-split')) return;
    var text = h.textContent;
    h.setAttribute('data-split', '1');
    h.setAttribute('aria-label', text);
    h.textContent = '';
    var i = 0;
    text.split(' ').forEach(function (word, w) {
      if (w) h.appendChild(document.createTextNode(' '));
      var ws = document.createElement('span');
      ws.className = 'tl';
      ws.setAttribute('aria-hidden', 'true');
      for (var k = 0; k < word.length; k++) {
        var s = document.createElement('span');
        s.className = 'tl-c';
        s.textContent = word[k];
        s.style.setProperty('--i', i);
        s.style.setProperty('--c', LOGO_COLS[i % LOGO_COLS.length]);
        ws.appendChild(s);
        i++;
      }
      h.appendChild(ws);
    });
  }

  /* ---------- the particle overlay ----------
     One canvas over everything, pooled particles, and a loop that only runs
     while something is flying. When the last particle lands the canvas is
     cleared, hidden and the loop stops. */
  var POOL = 160;
  var parts = [];
  for (var pi = 0; pi < POOL; pi++) {
    parts.push({ on: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, age: 0, life: 1, size: 4,
      col: '#fff', flip: 0, tx: 0, ty: 0, sx: 0, sy: 0, cx: 0, cy: 0, delay: 0, done: null });
  }
  var cv = null, ctx = null, dpr = 1, W = 0, H = 0, raf = 0, last = 0, live = 0;

  function ensureCanvas() {
    if (cv) return true;
    var app = $('app'); if (!app) return false;
    cv = document.createElement('canvas');
    cv.id = 'fx-ui';
    app.appendChild(cv);
    ctx = cv.getContext('2d');
    return !!ctx;
  }
  function sizeCanvas() {
    var app = $('app');
    var r = app.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    W = r.width; H = r.height;
    return r;
  }
  function grab() {
    for (var i = 0; i < POOL; i++) if (!parts[i].on) return parts[i];
    return null;
  }
  function start() {
    if (raf) return;
    cv.classList.add('on');
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  var KIND_CONF = 0, KIND_STAR = 1, KIND_DOT = 2, KIND_HEART = 3, KIND_FLY = 4;

  function star(c, r) {
    c.beginPath();
    c.moveTo(0, -r);
    c.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
    c.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
    c.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
    c.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
    c.fill();
  }
  function heart(c, r) {
    c.beginPath();
    c.moveTo(0, r * 0.9);
    c.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.35);
    c.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.9);
    c.fill();
  }

  function step(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var c = ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    live = 0;
    for (var i = 0; i < POOL; i++) {
      var p = parts[i];
      if (!p.on) continue;
      if (p.delay > 0) { p.delay -= dt; live++; continue; }
      p.age += dt;
      var k = p.age / p.life;
      if (k >= 1) {
        p.on = false;
        if (p.done) { var d = p.done; p.done = null; d(); }
        continue;
      }
      live++;
      var a = 1;
      if (p.kind === KIND_FLY) {
        /* a sparkle flying along a curve to the HUD chip */
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var u = 1 - e;
        p.x = u * u * p.sx + 2 * u * e * p.cx + e * e * p.tx;
        p.y = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ty;
        p.rot += p.vr * dt;
        a = k < 0.15 ? k / 0.15 : 1;
      } else {
        p.vy += (p.kind === KIND_CONF ? 520 : 380) * dt;
        var drag = p.kind === KIND_CONF ? 2.2 : 1.6;
        p.vx -= p.vx * drag * dt;
        p.vy -= p.vy * drag * 0.6 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += dt * 9;
        a = k > 0.7 ? (1 - k) / 0.3 : 1;
      }
      c.globalAlpha = a;
      c.fillStyle = p.col;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      if (p.kind === KIND_CONF) {
        c.scale(1, Math.cos(p.flip));
        c.fillRect(-p.size, -p.size * 0.45, p.size * 2, p.size * 0.9);
      } else if (p.kind === KIND_STAR || p.kind === KIND_FLY) {
        var tw = p.kind === KIND_FLY ? 1 : 0.75 + 0.25 * Math.sin(p.age * 18 + i);
        star(c, p.size * tw);
        if (p.kind === KIND_FLY) {
          c.globalAlpha = a * 0.35;
          c.beginPath(); c.arc(0, 0, p.size * 1.3, 0, Math.PI * 2); c.fill();
        }
      } else if (p.kind === KIND_HEART) {
        heart(c, p.size);
      } else {
        c.beginPath(); c.arc(0, 0, p.size * 0.6, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }
    c.globalAlpha = 1;
    if (live > 0) raf = requestAnimationFrame(step);
    else {
      raf = 0;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      cv.classList.remove('on');
    }
  }

  var PALETTES = {
    bug: ['#ff6fa3', '#ffd23f', '#4fc0f0', '#6fdc5a', '#a88bff', '#ff9838', '#ffffff'],
    fish: ['#4fc0f0', '#8fe6ff', '#2f9fe0', '#ffffff', '#6fe3d2', '#ffd23f'],
    fruit: ['#ff5a4f', '#ff9838', '#ffd23f', '#7fd65a', '#ff7aa8', '#ffffff'],
    friend: ['#ff7aa8', '#ffb3cf', '#ffd23f', '#ffffff', '#c3a8ff', '#ff5f92']
  };

  var FX = GG.FxUI = {
    reduced: function () { return reduced; },

    /* A party-popper burst from a point (in #app pixels). */
    burst: function (x, y, opts) {
      if (reduced || !ensureCanvas()) return;
      opts = opts || {};
      sizeCanvas();
      var cols = PALETTES[opts.palette] || PALETTES.bug;
      var n = opts.count || 70;
      var spread = opts.spread == null ? Math.PI * 2 : opts.spread;
      var dir = opts.dir == null ? -Math.PI / 2 : opts.dir;
      var speed = opts.speed || 520;
      for (var i = 0; i < n; i++) {
        var p = grab(); if (!p) break;
        var ang = dir + (Math.random() - 0.5) * spread;
        var sp = speed * (0.45 + Math.random() * 0.65);
        p.on = true; p.age = 0; p.delay = (opts.delay || 0) + Math.random() * 0.06; p.done = null;
        p.life = 1.0 + Math.random() * 0.25;       // ~1.2 s, as asked
        p.x = x + (Math.random() - 0.5) * 16; p.y = y + (Math.random() - 0.5) * 10;
        p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp;
        p.rot = Math.random() * 6.28; p.vr = (Math.random() - 0.5) * 14; p.flip = Math.random() * 6;
        var r = Math.random();
        if (opts.palette === 'friend' && r < 0.4) { p.kind = KIND_HEART; p.size = 5 + Math.random() * 4; }
        else if (r < 0.62) { p.kind = KIND_CONF; p.size = 4 + Math.random() * 3; }
        else if (r < 0.85) { p.kind = KIND_STAR; p.size = 5 + Math.random() * 5; }
        else { p.kind = KIND_DOT; p.size = 4 + Math.random() * 3; }
        p.col = (p.kind === KIND_STAR && Math.random() < 0.5) ? '#fff4a8' : cols[(Math.random() * cols.length) | 0];
      }
      start();
    },

    /* The NEW! moment on a card: two poppers from its top corners and one
       shower from the middle, the card bounces (CSS), the sunburst turns. */
    celebrate: function (popId, cardId, palette) {
      var pop = $(popId), card = $(cardId);
      if (!pop || !card) return;
      pop.classList.remove('celebrate');
      void pop.offsetWidth;          // restart the CSS animations
      pop.classList.add('celebrate');
      if (reduced) return;
      if (GG.Sfx && GG.Sfx.popper) GG.Sfx.popper();
      var app = $('app').getBoundingClientRect();
      var r = card.getBoundingClientRect();
      /* the card starts its bounce small, so aim at where it will settle */
      var cx = r.left + r.width / 2 - app.left, top = r.top - app.top;
      var w = card.offsetWidth, h = card.offsetHeight;
      var cy = r.top + r.height / 2 - app.top;
      top = cy - h / 2;
      this.burst(cx - w * 0.42, top + 30, { palette: palette, count: 34, dir: -Math.PI * 0.62, spread: 1.1, speed: 620, delay: 0.12 });
      this.burst(cx + w * 0.42, top + 30, { palette: palette, count: 34, dir: -Math.PI * 0.38, spread: 1.1, speed: 620, delay: 0.12 });
      this.burst(cx, top + 70, { palette: palette, count: 40, dir: -Math.PI / 2, spread: 2.4, speed: 480, delay: 0.2 });
    },

    calm: function (popId) { var pop = $(popId); if (pop) pop.classList.remove('celebrate'); },

    /* A handful of sparkles flying from an element to another; onArrive
       fires when the first one lands. */
    flyTo: function (fromEl, toEl, n, onArrive) {
      if (reduced || !fromEl || !toEl || !ensureCanvas()) { if (onArrive) onArrive(); return; }
      var app = sizeCanvas();
      var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      if (!a.width || !b.width) { if (onArrive) onArrive(); return; }
      var sx = a.left + a.width / 2 - app.left, sy = a.top + a.height / 2 - app.top;
      var tx = b.left + b.width / 2 - app.left, ty = b.top + b.height / 2 - app.top;
      var fired = false;
      var arrive = function () { if (!fired) { fired = true; if (onArrive) onArrive(); } };
      for (var i = 0; i < n; i++) {
        var p = grab(); if (!p) break;
        p.on = true; p.kind = KIND_FLY; p.age = 0; p.life = 0.62 + i * 0.03; p.delay = i * 0.05;
        p.sx = sx + (Math.random() - 0.5) * a.width * 0.6; p.sy = sy + (Math.random() - 0.5) * 8;
        p.tx = tx + (Math.random() - 0.5) * 8; p.ty = ty;
        p.cx = (p.sx + p.tx) / 2 + (Math.random() - 0.5) * 160; p.cy = Math.min(p.sy, p.ty) - 40 - Math.random() * 80;
        p.x = p.sx; p.y = p.sy; p.rot = 0; p.vr = 5 + Math.random() * 5;
        p.size = 6 + Math.random() * 3;
        p.col = i % 3 ? '#ffe45c' : '#fffbe0';
        p.done = i === 0 ? arrive : null;
      }
      start();
      /* belt and braces: if the frames never run (hidden tab) still count */
      setTimeout(arrive, 1400);
    },

    /* ---------- sparkles counting up in the HUD ---------- */
    _shown: null,
    _countT: 0,
    setSparkles: function (v) {
      var chip = $('chip-sparkles'); if (!chip) return;
      var self = this;
      var from = this._shown;
      clearTimeout(this._countDelay);
      cancelAnimationFrame(this._countRaf);
      function set(n) { chip.textContent = '✦ ' + n; }
      if (from == null || v <= from || reduced || !GG.Save || !GG.Save.data) {
        this._shown = v; set(v); chip.classList.remove('counting'); return;
      }
      /* wait for the card to pop in, then fly the sparkles up from its
         reward line (if a card is showing) and count as they land */
      this._target = v;
      this._countDelay = setTimeout(function () {
        var src = null;
        ['catch-reward', 'friend-reward'].forEach(function (id) {
          var e = $(id);
          if (e && e.offsetParent && !src) src = e;
        });
        var go = function () { self._count(from, v); };
        if (src) self.flyTo(src, chip, 7, go);
        else go();
      }, 380);
    },
    _count: function (from, to) {
      var chip = $('chip-sparkles');
      var self = this;
      var dur = Math.min(1.1, 0.35 + (to - from) * 0.02);
      var t0 = performance.now(), lastN = from, lastTick = 0;
      chip.classList.add('counting');
      function frame(now) {
        var k = Math.min(1, (now - t0) / 1000 / dur);
        var e = 1 - Math.pow(1 - k, 3);
        var n = Math.round(from + (to - from) * e);
        if (n !== lastN) {
          lastN = n;
          chip.textContent = '✦ ' + n;
          self._shown = n;
          if (now - lastTick > 70) {
            lastTick = now;
            chip.classList.add('tick');
            setTimeout(function () { chip.classList.remove('tick'); }, 60);
            if (GG.Sfx && GG.Sfx.ding) GG.Sfx.ding(k);
          }
        }
        if (k < 1) self._countRaf = requestAnimationFrame(frame);
        else {
          self._shown = to;
          chip.textContent = '✦ ' + to;
          setTimeout(function () { chip.classList.remove('counting'); }, 380);
        }
      }
      this._countRaf = requestAnimationFrame(frame);
      /* a hidden tab never runs the frames: land on the right number anyway */
      setTimeout(function () {
        if (self._shown !== to && self._target === to) { self._shown = to; chip.textContent = '✦ ' + to; chip.classList.remove('counting'); }
      }, dur * 1000 + 600);
    },

    /* ---------- the big button ---------- */
    watchActionButton: function () {
      var btn = $('btn-a');
      if (!btn || !window.MutationObserver) return;
      var prev = null;
      var ACT = { NET: 'net', PICK: 'pick', 'GO IN': 'go', 'GO OUT': 'go', BOOTS: 'go', LOOK: 'look',
        READ: 'home', TANKS: 'home', SLEEP: 'home', OPEN: 'home' };
      function check() {
        var n = btn.firstChild;
        var main = (n && n.nodeType === 3) ? n.nodeValue.trim() : '';
        if (main === prev) return;
        var act = ACT[main] || (main === 'OUCH' || main === '—' ? 'net' : 'home');
        btn.setAttribute('data-act', act);
        if (prev !== null && act !== 'net' && !reduced) {
          btn.classList.remove('wiggle');
          void btn.offsetWidth;
          btn.classList.add('wiggle');
        }
        prev = main;
      }
      btn.addEventListener('animationend', function (e) {
        if (e.animationName === 'ui-wiggle') btn.classList.remove('wiggle');
      });
      new MutationObserver(check).observe(btn, { childList: true, characterData: true, subtree: true });
      check();
    }
  };

  loadFonts();
  splitLogo();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { FX.watchActionButton(); });
  else FX.watchActionButton();
  window.addEventListener('resize', function () { if (cv && raf) sizeCanvas(); });
})(window.GG = window.GG || {});
