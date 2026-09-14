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
      $('catch-ok').addEventListener('click', function () { GG.Sfx.click(); self.hideCatch(); });
      $('catch-pop').addEventListener('click', function (e) { if (e.target.id === 'catch-pop') self.hideCatch(); });
      $('friend-ok').addEventListener('click', function () { GG.Sfx.click(); self.hideFriend(); });
      $('friend-pop').addEventListener('click', function (e) { if (e.target.id === 'friend-pop') self.hideFriend(); });
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
    },
    close: function (id) {
      var el = $(id); if (!el) return;
      el.classList.add('hidden');
      var i = this.openPanels.indexOf(id);
      if (i >= 0) this.openPanels.splice(i, 1);
    },
    anyOpen: function () {
      return this.openPanels.length > 0 ||
        !$('catch-pop').classList.contains('hidden') ||
        !$('friend-pop').classList.contains('hidden');
    },

    toast: function (msg, ms) {
      var t = $('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(this._tt);
      this._tt = setTimeout(function () { t.classList.remove('show'); }, ms || 1800);
    },

    prompt: function (text) {
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
      $('catch-pop').classList.remove('hidden');
      this._animCatch();
    },

    _animCatch: function () {
      var self = this;
      cancelAnimationFrame(this._raf);
      var cv = $('catch-art'), c = cv.getContext('2d');
      var start = performance.now();
      function frame(now) {
        if ($('catch-pop').classList.contains('hidden')) return;
        var t = (now - start) / 1000;
        c.clearRect(0, 0, cv.width, cv.height);
        var g = c.createLinearGradient(0, 0, 0, cv.height);
        g.addColorStop(0, '#eaf6e4'); g.addColorStop(1, '#d9eed2');
        c.fillStyle = g;
        GG.roundRect(c, 0, 0, cv.width, cv.height, 26); c.fill();
        c.save();
        for (var i = 0; i < 10; i++) {
          var a = t * 0.8 + i * 0.63;
          c.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.2 * Math.sin(a * 2)) + ')';
          c.beginPath();
          c.arc(cv.width / 2 + Math.cos(a) * (120 + i * 9), cv.height / 2 + Math.sin(a * 1.3) * 70, 3 + (i % 3), 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
        var bob = Math.sin(t * 2) * 6;
        GG.drawAny(c, self._catchDef, cv.width / 2, cv.height / 2 + bob, 7.2, -Math.PI / 2, t);
        self._raf = requestAnimationFrame(frame);
      }
      this._raf = requestAnimationFrame(frame);
    },

    hideCatch: function () {
      $('catch-pop').classList.add('hidden');
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
      var count = GG.Save.countOfFriend(def.id);
      var fact = def.facts[Math.floor(Math.random() * def.facts.length)];
      $('friend-fact').textContent = isNew ? fact
        : ('You have said hello to ' + count + ' of these.');
      $('friend-manners').querySelector('span').textContent = def.manners;
      $('friend-reward').innerHTML = '&#10022; ' + reward + ' sparkles' +
        (isNew ? ' &nbsp;+&nbsp; new page in your Friends Book!' : '');
      var along = $('friend-along');
      along.hidden = (GG.Save.data.companion === def.id);
      along.textContent = 'Ask them along';
      $('friend-pop').classList.remove('hidden');
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
        g.addColorStop(0, '#f0f6e2'); g.addColorStop(1, '#dbeed6');
        c.fillStyle = g;
        GG.roundRect(c, 0, 0, cv.width, cv.height, 26); c.fill();
        for (var i = 0; i < 9; i++) {
          var a = t * 0.7 + i * 0.7;
          c.globalAlpha = 0.22 + 0.16 * Math.sin(a * 2);
          c.fillStyle = '#ff8fb0';
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
      cancelAnimationFrame(this._fraf);
      if (this.onFriendClosed) this.onFriendClosed();
    },

    refreshHud: function () {
      $('chip-sparkles').innerHTML = '&#10022; ' + GG.Save.data.sparkles;
    }
  };
})(window.GG = window.GG || {});
