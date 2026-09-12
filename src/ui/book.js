/* The Bug Book: every bug Guin has met, with real facts. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  function thumb(def, w, h, silhouette) {
    var cv = document.createElement('canvas');
    cv.width = w * 2; cv.height = h * 2;
    var c = cv.getContext('2d');
    c.scale(2, 2);
    var scale = Math.min(w, h) / 34;
    GG.drawAny(c, def, w / 2, h / 2, scale * 1.05, -Math.PI / 2, 1.1);
    if (silhouette) {
      // paint the whole drawing one flat colour so it stays a mystery
      c.save();
      c.globalCompositeOperation = 'source-in';
      c.fillStyle = 'rgba(120,132,112,0.55)';
      c.fillRect(0, 0, w, h);
      c.restore();
    }
    return cv;
  }

  var Book = GG.Book = {
    tab: 'bugs',

    open: function (tab) {
      if (tab) this.tab = tab;
      GG.UI.open('screen-book');
      this.showGrid();
    },

    setTab: function (tab) { this.tab = tab; this.showGrid(); },

    showGrid: function () {
      var grid = $('book-grid'), det = $('book-detail');
      var tab = this.tab;
      var fish = tab === 'fish', friends = tab === 'friends';
      grid.style.display = 'grid'; det.style.display = 'none';
      $('book-back').style.display = 'none';
      $('book-tabs').style.display = '';
      $('book-title').textContent = friends ? 'Friends Book' : (fish ? 'Fish Book' : 'Bug Book');
      document.querySelectorAll('#book-tabs .tab').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-book') === tab);
      });
      grid.innerHTML = '';
      var list = friends ? GG.ANIMALS : (fish ? GG.FISH : GG.BUGS);
      var found = friends ? GG.Save.totalFriends() : (fish ? GG.Save.totalFish() : GG.Save.totalSpecies());
      $('progress').textContent = found + ' / ' + list.length;
      if (friends) this.companionRow(grid);
      list.forEach(function (def) {
        var got = friends ? GG.Save.hasFriend(def.id)
          : (fish ? GG.Save.hasFish(def.id) : GG.Save.has(def.id));
        var cell = GG.el('div', 'bugcell' + (got ? ' got' : ''));
        var cv = thumb(def, 84, 54, !got);
        cv.style.width = '100%'; cv.style.height = '54px';
        cell.appendChild(cv);
        cell.appendChild(GG.el('div', 'nm', got ? def.name : '???'));
        if (got) {
          var n0 = friends ? GG.Save.countOfFriend(def.id)
            : (fish ? GG.Save.countOfFish(def.id) : GG.Save.countOf(def.id));
          cell.appendChild(GG.el('div', 'cnt', '×' + n0));
          var r = GG.el('div', 'rar');
          r.style.background = GG.RARITY_COLORS[def.rarity];
          cell.appendChild(r);
        }
        cell.addEventListener('click', function () {
          GG.Sfx.click();
          if (got) Book.showDetail(def);
          else GG.UI.toast(friends ? 'You have not made friends with this one yet!'
            : (fish ? 'You have not caught this one yet!' : 'You have not met this one yet!'));
        });
        grid.appendChild(cell);
      });
    },

    /* who is tagging along today, right at the top of the Friends tab */
    companionRow: function (grid) {
      var row = GG.el('div', '', null);
      row.id = 'companion-row';
      row.style.gridColumn = '1/-1';
      var id = GG.Save.data.companion;
      var def = id && GG.ANIMAL_BY_ID[id];
      if (def) {
        var cv = GG.el('canvas'); cv.width = 104; cv.height = 88;
        var c = cv.getContext('2d'); c.scale(2, 2);
        GG.AnimalArt.draw(c, def, 26, 40, GG.animalFit(def, 34), false, 1.2);
        row.appendChild(cv);
        var txt = GG.el('div', 'grow');
        txt.innerHTML = '<b>' + def.name + '</b> is keeping you company today.';
        row.appendChild(txt);
        var off = GG.el('button', 'btn small', 'Let them go');
        off.addEventListener('click', function () {
          GG.Sfx.click();
          GG.Friends.setCompanion(null);
          Book.showGrid();
          GG.UI.toast('Off they go. Tap a friend to ask another along.', 2400);
        });
        row.appendChild(off);
      } else {
        var t2 = GG.el('div', 'grow');
        t2.innerHTML = GG.Save.totalFriends()
          ? 'Nobody is with you today. Open a friend and tap <b>Ask them along</b>.'
          : 'Make a friend out in the garden and they can keep you company.';
        row.appendChild(t2);
      }
      grid.appendChild(row);
    },

    showDetail: function (def) {
      var grid = $('book-grid'), det = $('book-detail');
      grid.style.display = 'none'; det.style.display = 'block';
      $('book-back').style.display = 'block';
      $('book-back').textContent = def.isAnimal ? 'All friends'
        : (def.isFish ? 'All fish' : 'All bugs');
      $('book-tabs').style.display = 'none';
      det.innerHTML = '';
      var isFish = !!def.isFish;
      var isAnimal = !!def.isAnimal;

      var cv = GG.el('canvas'); cv.id = 'detail-art';
      cv.width = 640; cv.height = 300;
      det.appendChild(cv);

      var h = GG.el('h2', null, def.name);
      h.style.margin = '10px 0 2px'; h.style.fontSize = '21px';
      det.appendChild(h);

      var meta = GG.el('div', 'meta');
      var times = def.times.map(function (x) { return GG.TIME_NAMES[x]; }).join(', ');
      var n = isAnimal ? GG.Save.countOfFriend(def.id)
        : (isFish ? GG.Save.countOfFish(def.id) : GG.Save.countOf(def.id));
      var rows;
      if (isAnimal) {
        rows = [['Found in', GG.animalPlaces(def)], ['Out and about', times],
          ['Size', def.measure], ['Rarity', GG.RARITY_NAMES[def.rarity]],
          ['Said hello', n + ' time' + (n === 1 ? '' : 's')]];
      } else if (isFish) {
        var waters = (def.waters || ['pond']).map(function (w) { return GG.WATER_NAMES[w]; }).join(', ');
        rows = [['Found in', waters], ['Bites', times], ['Size', def.measure],
          ['Shadow', GG.SHADOW_NAMES[def.shadow]], ['Rarity', GG.RARITY_NAMES[def.rarity]],
          ['Caught', n + ' time' + (n === 1 ? '' : 's')]];
      } else {
        var places = def.habitats.map(function (x) { return GG.HABITAT_NAMES[x]; }).join(', ');
        rows = [['Found in', places], ['Comes out', times], ['Size', def.measure],
          ['Rarity', GG.RARITY_NAMES[def.rarity]], ['Caught', n + ' time' + (n === 1 ? '' : 's')]];
      }
      rows.forEach(function (p) {
        meta.appendChild(GG.el('span', 'tag', p[0] + ': ' + p[1]));
      });
      if (def.sting) {
        var warn = GG.el('span', 'tag sting', 'Can sting if you upset her');
        meta.appendChild(warn);
      }
      if (!isFish && !isAnimal && GG.isAquaticBug(def)) {
        meta.appendChild(GG.el('span', 'tag wet', 'Needs water: keep it in a fish tank or a hybrid tank'));
      }
      if (isAnimal) {
        var way = GG.FRIEND_WAYS[def.way];
        if (way) meta.appendChild(GG.el('span', 'tag way', 'How to say hello: ' + way.blurb));
      }
      det.appendChild(meta);

      def.facts.forEach(function (f) {
        var line = GG.el('div', 'factline');
        line.innerHTML = '<b>&#10022;</b> ' + f;
        det.appendChild(line);
      });

      if (isAnimal) {
        var man = GG.el('div');
        man.id = 'friend-manners';
        man.style.margin = '10px 0';
        man.innerHTML = '<b>Good manners</b><span>' + def.manners + '</span>';
        det.appendChild(man);

        var along = GG.el('button', 'btn primary');
        along.style.width = '100%';
        var here = GG.Save.data.companion === def.id;
        along.textContent = here ? 'They are already with you' : 'Ask them along';
        along.disabled = here;
        along.addEventListener('click', function () {
          GG.Sfx.click();
          GG.Friends.setCompanion(def.id);
          GG.Sfx.animalCall(def.family);
          GG.UI.toast(def.name + ' is coming with you!', 2400);
          Book.showDetail(def);
        });
        det.appendChild(along);
      }

      var c = cv.getContext('2d');
      var start = performance.now();
      cancelAnimationFrame(this._raf);
      var self = this;
      function frame(now) {
        if ($('screen-book').classList.contains('hidden') || det.style.display === 'none') return;
        var t = (now - start) / 1000;
        c.clearRect(0, 0, cv.width, cv.height);
        var g = c.createLinearGradient(0, 0, 0, cv.height);
        if (isAnimal) { g.addColorStop(0, '#cfeeff'); g.addColorStop(1, '#9ed98a'); }
        else if (isFish) { g.addColorStop(0, '#9fd8ee'); g.addColorStop(1, '#3f93b8'); }
        else { g.addColorStop(0, '#eaf6e4'); g.addColorStop(1, '#d3e9cb'); }
        c.fillStyle = g; GG.roundRect(c, 0, 0, cv.width, cv.height, 22); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.35)';
        for (var i = 0; i < 5; i++) {
          c.beginPath();
          c.ellipse(80 + i * 130, 250 + Math.sin(t + i) * 6, 60, 16, 0, 0, Math.PI * 2); c.fill();
        }
        GG.drawAny(c, def, cv.width / 2, cv.height / 2 + Math.sin(t * 1.6) * 8, 8.4, -Math.PI / 2, t);
        self._raf = requestAnimationFrame(frame);
      }
      this._raf = requestAnimationFrame(frame);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    $('book-back').addEventListener('click', function () { GG.Sfx.click(); Book.showGrid(); });
    document.querySelectorAll('#book-tabs .tab').forEach(function (el) {
      el.addEventListener('click', function () { GG.Sfx.click(); Book.setTab(el.getAttribute('data-book')); });
    });
  });
})(window.GG = window.GG || {});
