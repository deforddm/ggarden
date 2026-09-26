/* Panels, prompts, toasts and the catch popup. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  var UI = GG.UI = {
    openPanels: [],
    pendingCatch: null,

    init: function () {
      var self = this;
      document.querySelectorAll('[data-close]').forEach(function (b) {
        b.addEventListener('click', function () { GG.Sfx.click(); self.close(b.getAttribute('data-close')); });
      });
      /* v1.19: a card that has only just opened ignores taps for a moment.
         Her next tap on NET used to land on the dark background and close
         the NEW! card before she had read a word of it. */
      function settled(ms) { return performance.now() - (self._cardAt || 0) > (ms || 900); }
      $('catch-ok').addEventListener('click', function () { if (!settled(450)) return; GG.Sfx.click(); self.hideCatch(); });
      $('warn-ok').addEventListener('click', function () { if (!settled(450)) return; GG.Sfx.click(); self.hideWarning(); });
      $('warn-pop').addEventListener('click', function (e) {
        if (e.target.id === 'warn-pop' && settled()) self.hideWarning();
      });
      $('catch-pop').addEventListener('click', function (e) { if (e.target.id === 'catch-pop' && settled()) self.hideCatch(); });
      $('friend-ok').addEventListener('click', function () { if (!settled(450)) return; GG.Sfx.click(); self.hideFriend(); });
      $('friend-pop').addEventListener('click', function (e) { if (e.target.id === 'friend-pop' && settled()) self.hideFriend(); });
      $('friend-along').addEventListener('click', function () {
        GG.Sfx.click();
        var def = self._friendDef;
        if (!def) return;
        GG.Friends.setCompanion(def.id);
        self.hideFriend();
        self.toast(def.name + ' is coming along with you!', 2600);
      });
    },

    open: function (id) {
      var el = $(id); if (!el) return;
      el.classList.remove('hidden');
      if (this.openPanels.indexOf(id) < 0) this.openPanels.push(id);
      this._panelClass();
    },
    close: function (id) {
      var el = $(id); if (!el) return;
      el.classList.add('hidden');
      var i = this.openPanels.indexOf(id);
      if (i >= 0) this.openPanels.splice(i, 1);
      this._panelClass();
    },
    /* with a panel open the toast drops to the bottom, clear of the header
       and its close button */
    _panelClass: function () {
      var app = $('app');
      if (app) app.classList.toggle('panel-open', this.openPanels.some(function (p) { return p !== 'screen-title'; }));
    },
    anyOpen: function () {
      return this.openPanels.length > 0 ||
        !$('catch-pop').classList.contains('hidden') ||
        !$('warn-pop').classList.contains('hidden') ||
        !$('friend-pop').classList.contains('hidden');
    },

    toast: function (msg, ms) {
      var t = $('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(this._tt);
      this._tt = setTimeout(function () { t.classList.remove('show'); }, ms || 1800);
    },

    prompt: function (text) {
      /* called every frame, so only touch the page when something changes */
      if (text === this._promptText) return;
      this._promptText = text;
      var p = $('prompt');
      if (text) { p.textContent = text; p.classList.add('show'); }
      else p.classList.remove('show');
    },

    showCatch: function (def, isNew, reward) {
      var c = $('catch-art').getContext('2d');
      var cv = $('catch-art');
      cv.width = 640; cv.height = 260;
      this._catchDef = def;
      this._catchT = 0;
      $('catch-new').style.display = isNew ? 'inline-block' : 'none';
      $('catch-name').textContent = def.name;
      var count = def.isFish ? GG.Save.countOfFish(def.id) : GG.Save.countOf(def.id);
      if (def.isJunk) {
        $('catch-fact').textContent = def.line;
        $('catch-reward').innerHTML = '&#10022; ' + reward + ' sparkles for tidying up';
      } else {
        var fact = def.facts[Math.floor(Math.random() * def.facts.length)];
        $('catch-fact').textContent = isNew ? fact : ('You have caught ' + count + ' of these.');
        $('catch-reward').innerHTML = '&#10022; ' + reward + ' sparkles' +
          (isNew ? ' &nbsp;+&nbsp; new page in your ' + (def.isFish ? 'Fish Book' : 'Bug Book') + '!' : '');
      }
      $('catch-care').style.display = 'none';
      $('catch-ok').textContent = 'Nice!';
      this._cardAt = performance.now();
      this._catchKind = def.isFish || def.isJunk ? 'fish' : 'bug';
      $('catch-pop').classList.remove('hidden');
      this._celebrate('catch-pop', 'catch-card', isNew && !def.isJunk, this._catchKind);
      this._animCatch();
    },

    /* ---------- look, don't catch ---------- */
    showWarning: function (def, isNew) {
      var cv = $('warn-art');
      cv.width = 640; cv.height = 260;
      this._warnDef = def;
      $('warn-name').textContent = def.name;
      $('warn-danger').querySelector('span').textContent = def.danger || '';
      var n = GG.Save.countOfSeen(def.id);
      $('warn-fact').textContent = isNew
        ? def.facts[0]
        : def.facts[1 + Math.floor(Math.random() * (def.facts.length - 1))];
      this._cardAt = performance.now();
      $('warn-pop').classList.remove('hidden');
      this._animWarn();
    },

    _animWarn: function () {
      var self = this;
      cancelAnimationFrame(this._wraf);
      var cv = $('warn-art'), c = cv.getContext('2d');
      var start = performance.now();
      function frame(now) {
        if ($('warn-pop').classList.contains('hidden')) return;
        var t = (now - start) / 1000;
        c.clearRect(0, 0, cv.width, cv.height);
        var g = c.createLinearGradient(0, 0, 0, cv.height);
        g.addColorStop(0, '#3a3340'); g.addColorStop(1, '#241f28');
        c.fillStyle = g;
        GG.roundRect(c, 0, 0, cv.width, cv.height, 22); c.fill();
        /* a few faint web strands across the dark, for atmosphere */
        c.strokeStyle = 'rgba(255,255,255,0.07)'; c.lineWidth = 1;
        for (var i = 0; i < 7; i++) {
          c.beginPath();
          c.moveTo(0, i * 44 - 20);
          c.quadraticCurveTo(cv.width / 2, i * 30 + Math.sin(t + i) * 8, cv.width, i * 48);
          c.stroke();
        }
        GG.drawAny(c, self._warnDef, cv.width / 2,
          cv.height / 2 + Math.sin(t * 1.1) * 5, 7.6, -Math.PI / 2, t);
        self._wraf = requestAnimationFrame(frame);
      }
      this._wraf = requestAnimationFrame(frame);
    },

    hideWarning: function () {
      $('warn-pop').classList.add('hidden');
      cancelAnimationFrame(this._wraf);
      if (this.onWarningClosed) this.onWarningClosed();
    },

    /* ---------- a piece of fruit ---------- */
    showFruit: function (res) {
      var def = res.def;
      var cv = $('catch-art');
      cv.width = 640; cv.height = 260;
      this._catchDef = def;
      $('catch-new').style.display = res.first ? 'inline-block' : 'none';
      $('catch-name').textContent = def.name;
      var n = GG.Save.countOfFruit(def.id);
      $('catch-fact').textContent = res.first
        ? def.facts[0]
        : ('You have picked ' + n + ' of these.');
      var care = $('catch-care');
      var eat = GG.FRUIT_EAT[def.eat] || GG.FRUIT_EAT.careful;
      care.className = eat.cls;
      care.innerHTML = '<b>' + eat.label + '</b><span>' + def.care + '</span>';
      care.style.display = 'block';
      $('catch-reward').innerHTML = res.unlocked
        ? 'New decoration for your tanks: <b>' + res.unlocked.name + '</b>'
        : (res.first ? 'New page in your Garden Book!' : '&#10022; one for the basket');
      /* "Nice!" under "Never eat this one" sends the wrong message */
      $('catch-ok').textContent = def.eat === 'never' ? 'Got it' : 'Nice!';
      this._cardAt = performance.now();
      this._catchKind = 'fruit';
      $('catch-pop').classList.remove('hidden');
      /* a poisonous plant is a lesson, not a party: no confetti for it */
      this._celebrate('catch-pop', 'catch-card', res.first && def.eat !== 'never', 'fruit');
      this._animCatch(true);
    },

    _animCatch: function (isFruit) {
      var self = this;
      cancelAnimationFrame(this._raf);
      var cv = $('catch-art'), c = cv.getContext('2d');
      var start = performance.now();
      var kind = isFruit ? 'fruit' : (this._catchKind || 'bug');
      /* v1.20: brighter little stages - a sunny meadow for a bug, a bright
         pool for a fish, warm peach for the garden - with soft turning rays */
      var SKY = { bug: ['#aee8ff', '#e9fbd8'], fish: ['#8fe0ff', '#2f9fe0'], fruit: ['#fff1c4', '#ffc98a'] }[kind];
      var RAY = kind === 'fish' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.38)';
      var W = cv.width, H = cv.height;
      var bg = document.createElement('canvas');
      bg.width = W; bg.height = H;
      var b = bg.getContext('2d');
      var g = b.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, SKY[0]); g.addColorStop(1, SKY[1]);
      b.fillStyle = g; GG.roundRect(b, 0, 0, W, H, 26); b.fill();
      var glow = b.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, 170);
      glow.addColorStop(0, 'rgba(255,255,255,0.75)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      b.fillStyle = glow; b.fillRect(0, 0, W, H);
      if (kind === 'bug') {
        /* a strip of grass and a few flowers along the bottom */
        b.fillStyle = '#8ddc6a';
        b.beginPath(); b.moveTo(0, H - 34); b.quadraticCurveTo(W / 2, H - 58, W, H - 34);
        b.lineTo(W, H); b.lineTo(0, H); b.closePath(); b.fill();
        var fc = ['#ff8fb8', '#ffd84a', '#c3a8ff', '#ffffff'];
        for (var f = 0; f < 9; f++) {
          var fx = 30 + f * 72, fy = H - 20 - (f % 2) * 8;
          b.fillStyle = fc[f % 4];
          for (var q = 0; q < 5; q++) {
            var aa = q * 1.2566;
            b.beginPath(); b.arc(fx + Math.cos(aa) * 6, fy + Math.sin(aa) * 6, 5, 0, 6.2832); b.fill();
          }
          b.fillStyle = '#ffb21f'; b.beginPath(); b.arc(fx, fy, 4, 0, 6.2832); b.fill();
        }
      } else if (kind === 'fish') {
        b.fillStyle = 'rgba(255,255,255,0.25)';
        for (var wv = 0; wv < 3; wv++) {
          b.beginPath();
          for (var x = 0; x <= W; x += 20) b.lineTo(x, 30 + wv * 16 + Math.sin(x / 40 + wv) * 5);
          b.lineTo(W, 0); b.lineTo(0, 0); b.closePath(); b.fill();
        }
        b.fillStyle = '#f4dca0';
        b.beginPath(); b.moveTo(0, H - 22); b.quadraticCurveTo(W / 2, H - 38, W, H - 22);
        b.lineTo(W, H); b.lineTo(0, H); b.closePath(); b.fill();
      } else {
        b.fillStyle = 'rgba(255,255,255,0.4)';
        for (var dx = 0; dx < W; dx += 40) for (var dy = 12; dy < H; dy += 40) {
          b.beginPath(); b.arc(dx + ((dy / 40) % 2) * 20, dy, 4, 0, 6.2832); b.fill();
        }
      }
      function frame(now) {
        if ($('catch-pop').classList.contains('hidden')) return;
        var t = (now - start) / 1000;
        c.clearRect(0, 0, W, H);
        c.save();
        GG.roundRect(c, 0, 0, W, H, 26); c.clip();
        c.drawImage(bg, 0, 0);
        /* rays turning slowly behind the creature */
        c.fillStyle = RAY;
        c.beginPath();
        for (var r = 0; r < 12; r++) {
          var a0 = t * 0.25 + r * 0.5236;
          c.moveTo(W / 2, H / 2);
          c.arc(W / 2, H / 2, 420, a0, a0 + 0.22);
          c.closePath();
        }
        c.fill();
        if (kind === 'fish') {
          c.fillStyle = 'rgba(255,255,255,0.55)';
          for (var bb = 0; bb < 9; bb++) {
            var by = H - ((t * (30 + bb * 7) + bb * 53) % (H + 20));
            c.beginPath(); c.arc(60 + bb * 64 + Math.sin(t * 2 + bb) * 8, by, 3 + (bb % 3) * 2, 0, 6.2832); c.fill();
          }
        }
        /* twinkling sparkles */
        for (var i = 0; i < 10; i++) {
          var a = t * 0.8 + i * 0.63;
          var sx = W / 2 + Math.cos(a) * (130 + i * 10), sy = H / 2 + Math.sin(a * 1.3) * 78;
          var sr = (5 + (i % 3) * 2) * (0.6 + 0.4 * Math.sin(t * 5 + i * 1.7));
          c.fillStyle = i % 2 ? '#fffbe0' : '#ffe45c';
          c.beginPath();
          c.moveTo(sx, sy - sr); c.quadraticCurveTo(sx, sy, sx + sr, sy);
          c.quadraticCurveTo(sx, sy, sx, sy + sr); c.quadraticCurveTo(sx, sy, sx - sr, sy);
          c.quadraticCurveTo(sx, sy, sx, sy - sr); c.fill();
        }
        c.restore();
        var bob = Math.sin(t * 2) * 6;
        /* a happy hop when it is new */
        var hop = self._isNew ? Math.max(0, Math.sin(Math.min(t, 1.2) * Math.PI * 2.5)) * 14 * Math.max(0, 1 - t / 1.2) : 0;
        GG.drawAny(c, self._catchDef, W / 2, H / 2 + bob - hop,
          isFruit ? 8.6 : 7.2, -Math.PI / 2, t);
        self._raf = requestAnimationFrame(frame);
      }
      this._raf = requestAnimationFrame(frame);
    },

    hideCatch: function () {
      $('catch-pop').classList.add('hidden');
      $('catch-pop').classList.remove('celebrate');
      cancelAnimationFrame(this._raf);
      if (this.onCatchClosed) this.onCatchClosed();
    },

    /* ---------- a new friend ---------- */
    showFriend: function (def, isNew, reward) {
      var cv = $('friend-art');
      cv.width = 640; cv.height = 260;
      this._friendDef = def;
      $('friend-new').style.display = isNew ? 'inline-block' : 'none';
      $('friend-name').textContent = def.name;
      /* the look-only friends are met, never befriended: so they are counted
         in the "seen" list, they are worth no sparkles, and there is no
         button asking them to come along */
      var look = GG.animalIsLookOnly && GG.animalIsLookOnly(def);
      var count = look ? GG.Save.countOfSeen(def.id) : GG.Save.countOfFriend(def.id);
      var fact = def.facts[Math.floor(Math.random() * def.facts.length)];
      $('friend-fact').textContent = isNew ? fact
        : ('You have said hello to ' + count + ' of these.');
      $('friend-manners').querySelector('span').textContent = def.manners;
      $('friend-reward').innerHTML = look
        ? (isNew ? 'A new page in your Friends Book &mdash; and you both walked away.'
          : 'You both walked away. That is exactly right.')
        : ('&#10022; ' + reward + ' sparkles' +
          (isNew ? ' &nbsp;+&nbsp; new page in your Friends Book!' : ''));
      var along = $('friend-along');
      along.hidden = look || (GG.Save.data.companion === def.id);
      along.textContent = 'Ask them along';
      /* a rattlesnake or a bear is not a new friend with hearts round it:
         it is somebody she met from a long way off, and kept away from */
      var tag = $('friend-new');
      tag.textContent = look ? 'MET FROM FAR AWAY' : 'NEW FRIEND!';
      tag.classList.toggle('far', !!look);
      if (look) tag.style.display = 'inline-block';
      $('friend-ok').textContent = look ? 'I\u2019ll keep my distance' : 'Lovely!';
      this._friendLook = !!look;
      this._cardAt = performance.now();
      $('friend-pop').classList.remove('hidden');
      /* a bear met from far away is not a party either */
      this._celebrate('friend-pop', 'friend-card', isNew && !look, 'friend');
      this._animFriend();
    },

    _animFriend: function () {
      var self = this;
      cancelAnimationFrame(this._fraf);
      var cv = $('friend-art'), c = cv.getContext('2d');
      var start = performance.now();
      function frame(now) {
        if ($('friend-pop').classList.contains('hidden')) return;
        var t = (now - start) / 1000;
        c.clearRect(0, 0, cv.width, cv.height);
        var g = c.createLinearGradient(0, 0, 0, cv.height);
        if (self._friendLook) { g.addColorStop(0, '#f6efe4'); g.addColorStop(1, '#e8dcc8'); }
        else { g.addColorStop(0, '#ffe3ef'); g.addColorStop(0.62, '#fff4f8'); g.addColorStop(0.63, '#bdeaa0'); g.addColorStop(1, '#8fd873'); }
        c.fillStyle = g;
        GG.roundRect(c, 0, 0, cv.width, cv.height, 26); c.fill();
        if (!self._friendLook) {
          /* soft turning rays, like the catch card */
          c.save(); GG.roundRect(c, 0, 0, cv.width, cv.height, 26); c.clip();
          c.fillStyle = 'rgba(255,255,255,0.4)';
          c.beginPath();
          for (var r = 0; r < 12; r++) {
            var a0 = t * 0.25 + r * 0.5236;
            c.moveTo(cv.width / 2, cv.height / 2); c.arc(cv.width / 2, cv.height / 2, 420, a0, a0 + 0.22); c.closePath();
          }
          c.fill(); c.restore();
        }
        for (var i = 0; i < (self._friendLook ? 0 : 9); i++) {
          var a = t * 0.7 + i * 0.7;
          c.globalAlpha = 0.45 + 0.25 * Math.sin(a * 2);
          c.fillStyle = i % 3 ? '#ff7aa8' : '#ffb3cf';
          GG.Friends.heart(c, cv.width / 2 + Math.cos(a) * (130 + i * 8),
            cv.height / 2 + Math.sin(a * 1.25) * 74, 5);
          c.globalAlpha = 1;
        }
        var def = self._friendDef;
        if (def) {
          var fs = GG.animalFit(def, 150);
          GG.AnimalArt.shadow(c, cv.width / 2, cv.height / 2 + 54, 44, 0.16);
          GG.AnimalArt.draw(c, def, cv.width / 2, cv.height / 2 + 52 + Math.sin(t * 2) * 4,
            fs, false, t, 0.8);
        }
        self._fraf = requestAnimationFrame(frame);
      }
      this._fraf = requestAnimationFrame(frame);
    },

    hideFriend: function () {
      $('friend-pop').classList.add('hidden');
      $('friend-pop').classList.remove('celebrate');
      cancelAnimationFrame(this._fraf);
      if (this.onFriendClosed) this.onFriendClosed();
    },

    /* v1.20: the NEW! moment - confetti, a bouncing card, a turning sunburst */
    _celebrate: function (popId, cardId, on, palette) {
      this._isNew = !!on;
      if (!GG.FxUI) return;
      if (on) GG.FxUI.celebrate(popId, cardId, palette);
      else GG.FxUI.calm(popId);
    },

    /* v1.20: earning sparkles makes them fly up and count; spending them
       just changes the number */
    refreshHud: function () {
      var v = GG.Save.data.sparkles;
      if (GG.FxUI && this._hudReady) GG.FxUI.setSparkles(v);
      else {
        $('chip-sparkles').innerHTML = '&#10022; ' + v;
        if (GG.FxUI) GG.FxUI._shown = v;
      }
      this._hudReady = true;
    }
  };
})(window.GG = window.GG || {});
