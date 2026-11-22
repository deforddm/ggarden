/* v1.22: FAVOURS AND RANKS - something to set out to do each day, and a way
   to see how far she has come.

   THE FAVOUR BOARD. Every real day three of the animals ask a small favour:
   catch a bug that hops, pick a flower, play fetch with a dog. They are
   things the game already does, so nothing new has to be learned, and every
   one of them can be done on any day, in any weather, at any hour. Each
   gives a few sparkles and all three give a thank-you on top. There is no
   streak and nothing is lost by missing a day: tomorrow there are simply
   three new ones.

   RANKS. Every page in the five books, and every favour done, is one step.
   The steps add up to a rank, from Seedling to Guardian of the Garden, with
   a medal that changes as it grows. A save from before v1.22 gets the rank
   it has already earned the first time it opens - which is the surprise. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  var RANKS = [
    { at: 0, name: 'Seedling', col: '#8fce6a', rim: '#4f9a35' },
    { at: 5, name: 'Sprout', col: '#6cd65e', rim: '#2f8f2a' },
    { at: 15, name: 'Bug Spotter', col: '#9be0c8', rim: '#2f9a80' },
    { at: 30, name: 'Pond Dipper', col: '#7fd0f5', rim: '#2389c4' },
    { at: 50, name: 'Trail Walker', col: '#9fb4ff', rim: '#4a60cf' },
    { at: 75, name: 'Garden Scout', col: '#c3a8ff', rim: '#7a55d8' },
    { at: 105, name: 'Field Sketcher', col: '#ffa6c6', rim: '#d64f84' },
    { at: 140, name: 'Creature Keeper', col: '#ffb27a', rim: '#d9731d' },
    { at: 180, name: 'Wild Explorer', col: '#ffd45c', rim: '#c98d0c' },
    { at: 225, name: 'Naturalist', col: '#e8e8f2', rim: '#8d93ad' },
    { at: 275, name: 'Master Naturalist', col: '#ffe36e', rim: '#c58a00' },
    { at: 330, name: 'Garden Legend', col: '#ffd9f4', rim: '#c2409c' },
    { at: 390, name: 'Guardian of the Garden', col: '#fff6c8', rim: '#e0a400' }
  ];

  /* What can be asked. group keeps the three of a day different in kind.
     need: how many times. test(kind, def): does this thing she just did count? */
  var MOVES = { flutter: 'flutters', hop: 'hops', crawl: 'crawls' };
  var HOMES = { garden: 'the Flower Garden', meadow: 'the Sunny Meadow', forest: 'the Whispering Woods', pond: 'the Lily Pond' };
  var PICKS = { flower: 'a flower', berry: 'some berries', veg: 'a vegetable', fruit: 'a fruit from a tree' };
  var ASKS = [];
  ASKS.push({ id: 'bug3', group: 'bug', need: 3, text: 'Catch three bugs, any kind you like', why: 'I love hearing what you found!',
    test: function (k) { return k === 'bug'; } });
  Object.keys(MOVES).forEach(function (m) {
    ASKS.push({ id: 'move-' + m, group: 'bug', need: 1, text: 'Catch a bug that ' + MOVES[m], why: 'I want to see how it moves.',
      test: function (k, d) { return k === 'bug' && d && d.behavior === m; } });
  });
  Object.keys(HOMES).forEach(function (h) {
    ASKS.push({ id: 'home-' + h, group: 'bug', need: 1, text: 'Catch a bug that lives in ' + HOMES[h], why: 'That is my favourite place.',
      test: function (k, d) { return k === 'bug' && d && d.habitats && d.habitats.indexOf(h) >= 0; } });
  });
  ASKS.push({ id: 'fish', group: 'find', need: 1, text: 'Catch a fish', why: 'I like to watch them swim.',
    test: function (k, d) { return k === 'fish' && d && !d.isJunk; } });
  Object.keys(PICKS).forEach(function (p) {
    ASKS.push({ id: 'pick-' + p, group: 'find', need: 1, text: 'Pick ' + PICKS[p], why: 'Only take what you need, and leave some for the bees.',
      test: function (k, d) { return k === 'pick' && d && d.kind === p; } });
  });
  ASKS.push({ id: 'hello', group: 'kind', need: 1, text: 'Say hello to an animal, the proper way', why: 'Remember your good manners!',
    test: function (k) { return k === 'friend'; } });
  ASKS.push({ id: 'fetch', group: 'kind', need: 2, text: 'Throw the ball twice at Dog’s Paradise', why: 'The dogs have been waiting all day.',
    test: function (k) { return k === 'fetch'; } });
  ASKS.push({ id: 'wish', group: 'kind', need: 1, text: 'Wish on a shooting star', why: 'Look through the telescope after dark and be quick!',
    test: function (k) { return k === 'wish'; } });
  var ASK_BY_ID = {};
  ASKS.forEach(function (a) { ASK_BY_ID[a.id] = a; });

  var EACH = 12, ALL_THREE = 20;

  /* The Pacific calendar day, whatever clock the device keeps (the same
     rule the night sky uses). A new day starts at 4 in the morning, so a
     late night does not swap the favours under her. */
  function today(now) {
    var d = new Date(now == null ? Date.now() : now);
    var off = 8;
    if (GG.Sky && GG.Sky._astro) off = GG.Sky._astro.pacificOffset(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    var p = new Date(d.getTime() - (off + 4) * 3600000);
    var m = p.getUTCMonth() + 1, day = p.getUTCDate();
    return p.getUTCFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function seedOf(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  var Fav = GG.Favours = {
    RANKS: RANKS, ASKS: ASKS, _now: null,

    data: function () {
      var d = GG.Save.data;
      if (!d.favours || typeof d.favours !== 'object') d.favours = { day: '', list: [], done: 0, days: 0, thanked: false };
      return d.favours;
    },

    /* Make today's three if the day has turned. Returns true when it did. */
    roll: function () {
      var f = this.data(), day = today(this._now);
      if (f.day === day && f.list && f.list.length === 3) return false;
      var R = GG.mulberry32(seedOf(day + '|' + (GG.Save.data.name || '')));
      function pick(arr) { return arr[Math.floor(R() * arr.length)]; }
      /* who asks: friends she has made, or else a few who live nearby */
      var mine = GG.ANIMALS.filter(function (a) { return !a.lookOnly && GG.Save.hasFriend(a.id); });
      if (mine.length < 3) {
        mine = mine.concat(GG.ANIMALS.filter(function (a) {
          return !a.lookOnly && mine.indexOf(a) < 0 && a.places && (a.places.indexOf('garden') >= 0 || a.places.indexOf('meadow') >= 0);
        }));
      }
      var who = [];
      while (who.length < 3 && mine.length) who.push(mine.splice(Math.floor(R() * mine.length), 1)[0]);
      var prev = (f.list || []).map(function (x) { return x.id; });
      f.list = ['bug', 'find', 'kind'].map(function (g, i) {
        var pool = ASKS.filter(function (a) { return a.group === g && prev.indexOf(a.id) < 0; });
        var a = pick(pool);
        return { id: a.id, n: 0, done: false, who: who[i] ? who[i].id : null };
      });
      f.day = day; f.thanked = false;
      GG.Save.save();
      return true;
    },

    list: function () {
      this.roll();
      return this.data().list.map(function (it) {
        var a = ASK_BY_ID[it.id];
        return { it: it, ask: a, who: it.who && GG.ANIMAL_BY_ID[it.who] };
      }).filter(function (x) { return !!x.ask; });
    },
    left: function () { return this.list().filter(function (x) { return !x.it.done; }).length; },

    /* Something happened: a bug caught, a fish, a pick, a hello, a throw, a
       wish. Count it towards any favour it fits, then look at the rank. */
    note: function (kind, def) {
      var f = this.data(), self = this, told = false;
      this.list().forEach(function (x) {
        if (x.it.done || !x.ask.test(kind, def)) return;
        x.it.n++;
        if (x.it.n < x.ask.need) return;
        x.it.done = true;
        f.done = (f.done || 0) + 1;
        GG.Save.data.sparkles += EACH;
        var name = x.who ? x.who.name : 'A friend';
        self._say(name + ' says thank you! Favour done. ✦ +' + EACH, 3400);
        told = true;
      });
      if (told) {
        if (!f.thanked && f.list.every(function (it) { return it.done; })) {
          f.thanked = true; f.days = (f.days || 0) + 1;
          GG.Save.data.sparkles += ALL_THREE;
          setTimeout(function () { self._say('All three favours done today! A big thank-you: ✦ +' + ALL_THREE, 4200); }, 3600);
        }
        GG.Save.save();
        GG.UI.refreshHud();
        if (GG.Sfx.unlocked) GG.Sfx.unlocked();
        this.dot();
      }
      this.checkRank();
    },
    _say: function (msg, ms) { GG.UI.toast(msg, ms); },

    /* ---------- ranks ---------- */
    points: function () {
      var n = 0;
      (GG.Book.BOOKS || []).forEach(function (b) { n += Math.min(b.found(), b.list().length); });
      return n + (this.data().done || 0);
    },
    most: function () {
      var n = 0;
      (GG.Book.BOOKS || []).forEach(function (b) { n += b.list().length; });
      return n;
    },
    rankAt: function (pts) {
      var r = 0;
      for (var i = 0; i < RANKS.length; i++) if (pts >= RANKS[i].at) r = i;
      return r;
    },
    rank: function () { return this.rankAt(this.points()); },

    /* Has she gone up? Wait until nothing else is on the screen, then say so. */
    checkRank: function () {
      var d = GG.Save.data, self = this;
      if (typeof d.rank !== 'number') d.rank = 0;
      if (this.rank() <= d.rank || this._waiting) return;
      this._waiting = true;
      var tries = 0;
      (function wait() {
        if (GG.UI.anyOpen() && tries++ < 240) { setTimeout(wait, 500); return; }
        self._waiting = false;
        if (GG.UI.anyOpen()) return;
        self.celebrate();
      })();
    },
    celebrate: function () {
      var d = GG.Save.data, now = this.rank();
      if (now <= (d.rank || 0)) return;
      var gained = now - (d.rank || 0), reward = 0;
      for (var i = (d.rank || 0) + 1; i <= now; i++) reward += 15 + i * 10;
      d.rank = now;
      d.sparkles += reward;
      GG.Save.save();
      GG.UI.refreshHud();
      var R = RANKS[now];
      this.drawMedal($('rank-medal'), now);
      $('rank-kicker').textContent = gained > 1 ? 'You went up ' + gained + ' ranks!' : 'You went up a rank!';
      $('rank-name').textContent = R.name;
      $('rank-line').textContent = this.points() + ' discoveries and favours so far. '
        + (now < RANKS.length - 1 ? (RANKS[now + 1].at - this.points()) + ' more to become a ' + RANKS[now + 1].name + '.'
          : 'That is the very top. The whole garden knows your name.');
      $('rank-reward').textContent = '✦ +' + reward + ' sparkles';
      GG.UI.open('screen-rank');
      this._rankAt = performance.now();
      if (GG.Sfx.catchNew) GG.Sfx.catchNew();
      if (GG.FxUI && GG.FxUI.burst) {
        var r = $('rank-card').getBoundingClientRect(), a = $('app').getBoundingClientRect();
        GG.FxUI.burst(r.left - a.left + r.width / 2, r.top - a.top + 60, { count: 80, speed: 560, spread: 2.8 });
      }
    },

    /* A medal: a scalloped disc in the rank's colour, a ribbon, and one
       leaf for every rank so far round a number. */
    drawMedal: function (cv, idx) {
      if (!cv) return;
      var c = cv.getContext('2d'), w = cv.width, h = cv.height, R = RANKS[idx], cx = w / 2, cy = h * 0.44, r = Math.min(w, h) * 0.3;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
      /* ribbon tails */
      [[-1, '#e8568c'], [1, '#4f8fe8']].forEach(function (s) {
        c.fillStyle = s[1];
        c.beginPath();
        c.moveTo(cx + s[0] * r * 0.15, cy + r * 0.5); c.lineTo(cx + s[0] * r * 0.85, cy + r * 0.6);
        c.lineTo(cx + s[0] * r * 0.95, cy + r * 1.75); c.lineTo(cx + s[0] * r * 0.55, cy + r * 1.45);
        c.lineTo(cx + s[0] * r * 0.2, cy + r * 1.8); c.closePath(); c.fill();
      });
      /* scalloped edge */
      c.fillStyle = R.rim;
      for (var i = 0; i < 16; i++) {
        var a = i / 16 * Math.PI * 2;
        c.beginPath(); c.arc(cx + Math.cos(a) * r * 1.02, cy + Math.sin(a) * r * 1.02, r * 0.22, 0, 6.2832); c.fill();
      }
      c.beginPath(); c.arc(cx, cy, r * 1.04, 0, 6.2832); c.fill();
      var g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, R.col); g.addColorStop(1, R.col);
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 0.88, 0, 6.2832); c.fill();
      /* leaves round the rim, one per rank */
      c.fillStyle = R.rim;
      for (var k = 0; k < idx; k++) {
        var la = -Math.PI / 2 + (k - (idx - 1) / 2) * 0.44;
        c.save(); c.translate(cx + Math.cos(la) * r * 0.66, cy + Math.sin(la) * r * 0.66); c.rotate(la + Math.PI / 2);
        c.beginPath(); c.ellipse(0, 0, r * 0.07, r * 0.15, 0, 0, 6.2832); c.fill(); c.restore();
      }
      c.fillStyle = R.rim; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '700 ' + Math.round(r * 0.8) + 'px Fredoka, Nunito, sans-serif';
      c.fillText(String(idx + 1), cx, cy + r * 0.12);
    },

    /* ---------- the board ---------- */
    open: function () {
      this.roll();
      this.checkRank();
      this.render();
      GG.UI.open('screen-favours');
      GG.Save.data.favoursSeen = this.data().day;
      this.dot();
    },
    render: function () {
      var box = $('fav-list'), self = this;
      if (!box) return;
      var idx = this.rank(), pts = this.points(), R = RANKS[idx], next = RANKS[idx + 1];
      this.drawMedal($('fav-medal'), idx);
      $('fav-rank').textContent = R.name;
      $('fav-next').textContent = next ? (next.at - pts) + ' more to become a ' + next.name : 'The very top rank!';
      $('fav-bar').style.width = (next ? Math.round((pts - R.at) / (next.at - R.at) * 100) : 100) + '%';
      $('fav-points').textContent = pts + ' steps: every page in your books and every favour is one';
      box.innerHTML = '';
      var list = this.list();
      list.forEach(function (x) {
        var row = GG.el('div', 'favrow' + (x.it.done ? ' done' : ''));
        row.setAttribute('data-fav', x.ask.id);
        var cv = document.createElement('canvas'); cv.width = 128; cv.height = 112;
        if (x.who) { var c = cv.getContext('2d'); c.scale(2, 2); GG.AnimalArt.draw(c, x.who, 32, 48, GG.animalFit(x.who, 42), false, 1.2); }
        row.appendChild(cv);
        var tx = GG.el('div', 'grow');
        tx.appendChild(GG.el('div', 'who', (x.who ? x.who.name : 'A friend') + ' asks'));
        tx.appendChild(GG.el('div', 'what', x.ask.text));
        tx.appendChild(GG.el('div', 'why', x.it.done ? 'Thank you!' : '“' + x.ask.why + '”'));
        row.appendChild(tx);
        row.appendChild(GG.el('div', 'tick', x.it.done ? '✓' : (x.ask.need > 1 ? x.it.n + '/' + x.ask.need : '✦' + EACH)));
        box.appendChild(row);
      });
      var f = this.data(), left = list.filter(function (x) { return !x.it.done; }).length;
      $('fav-foot').textContent = left
        ? 'Three new favours every day. Do all three for a big thank-you. Miss a day? Nothing is lost.'
        : 'All done for today! Three new favours tomorrow. You have done ' + (f.done || 0) + ' favours altogether.';
    },
    /* a little dot on the menu button while today's board has not been read */
    dot: function () {
      var b = $('btn-menu'), m = $('menu-favours');
      var fresh = this.left() > 0 && GG.Save.data.favoursSeen !== this.data().day;
      if (b) b.classList.toggle('has-news', fresh);
      if (m) m.textContent = 'Favour Board' + (this.left() ? '  ·  ' + this.left() + ' to do' : '  ·  all done ✓');
    },

    init: function () {
      var self = this;
      if ($('menu-favours')) $('menu-favours').addEventListener('click', function () {
        GG.Sfx.click(); GG.UI.close('screen-menu'); self.open();
      });
      if ($('rank-ok')) $('rank-ok').addEventListener('click', function () {
        if (performance.now() - (self._rankAt || 0) < 500) return;
        GG.Sfx.click(); GG.UI.close('screen-rank');
      });
    },

    /* when the garden opens: today's favours, and the rank already earned */
    start: function () {
      var self = this, fresh = this.roll();
      this.dot();
      if (fresh || GG.Save.data.favoursSeen !== this.data().day) {
        setTimeout(function () {
          if (!GG.UI.anyOpen()) self._say('Three friends have a favour to ask today. Look at the Favour Board by the cottage!', 4600);
        }, 7000);
      }
      setTimeout(function () { self.checkRank(); }, 2200);
    },
    _today: today
  };
})(window.GG = window.GG || {});
