/* The Critter Compendium (v1.15): one big book with four books inside it -
   the Bug Book, the Fish Book, the Friends Book and the Garden Book - every
   creature and fruit Guin has met, with real facts. Opening it with no book
   named shows the contents page, a shelf of the four. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  /* v1.19: the biggest bugs (an atlas moth, a rhinoceros beetle) used to
     spill out of their cells over the count. Measure each drawing once and
     shrink the ones that do not fit. */
  var FIT = {};
  function fitFor(def, w, h) {
    var key = (def.id || def.name) + '|' + w + 'x' + h;
    if (FIT[key] != null) return FIT[key];
    var W2 = w * 2, H2 = h * 2;
    var cv = document.createElement('canvas');
    cv.width = W2; cv.height = H2;
    var c = cv.getContext('2d');
    GG.drawAny(c, def, W2 / 2, H2 / 2, Math.min(w, h) / 34 * 1.05, -Math.PI / 2, 1.1);
    var k = 1;
    try {
      var d = c.getImageData(0, 0, W2, H2).data;
      var x0 = W2, x1 = -1, y0 = H2, y1 = -1;
      for (var y = 0; y < H2; y += 2) {
        for (var x = 0; x < W2; x += 2) {
          if (d[(y * W2 + x) * 4 + 3] > 24) {
            if (x < x0) x0 = x; if (x > x1) x1 = x;
            if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
        }
      }
      if (x1 > x0 && y1 > y0) {
        /* keep it centred: how far it reaches from the middle, each way */
        var rx = Math.max(W2 / 2 - x0, x1 - W2 / 2), ry = Math.max(H2 / 2 - y0, y1 - H2 / 2);
        k = Math.min(1, (w / 2 - 3) / rx, (h / 2 - 3) / ry);
      }
    } catch (e) { k = 1; }
    FIT[key] = k;
    return k;
  }

  function thumb(def, w, h, silhouette) {
    var cv = document.createElement('canvas');
    cv.width = w * 2; cv.height = h * 2;
    var c = cv.getContext('2d');
    c.scale(2, 2);
    var scale = Math.min(w, h) / 34 * fitFor(def, w, h);
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

  /* The books on the shelf, in shelf order. */
  var BOOKS = [
    { id: 'bugs', name: 'Bug Book', blurb: 'bugs and mini-beasts', col: '#5f9f4a',
      show: function () { return GG.BUG_BY_ID.monarch || GG.BUGS[0]; },
      list: function () { return GG.BUGS; },
      found: function () { return GG.Save.totalSpecies(); } },
    { id: 'fish', name: 'Fish Book', blurb: 'fish and river creatures', col: '#3f8fb8',
      show: function () { return GG.FISH_BY_ID.bluegill || GG.FISH[0]; },
      list: function () { return GG.FISH; },
      found: function () { return GG.Save.totalFish(); } },
    { id: 'friends', name: 'Friends Book', blurb: 'animal friends', col: '#c9728a',
      show: function () { return GG.ANIMAL_BY_ID.cookie || GG.ANIMALS[0]; },
      list: function () { return GG.ANIMALS; },
      found: function () {
        var met = 0;
        GG.ANIMALS.forEach(function (a) { if (a.lookOnly && GG.Save.hasSeen(a.id)) met++; });
        return GG.Save.totalFriends() + met;
      } },
    { id: 'fruit', name: 'Garden Book', blurb: 'fruit, berries, vegetables and flowers', col: '#d0813a',
      show: function () { return GG.FRUIT_BY_ID && (GG.FRUIT_BY_ID.apple || GG.FRUITS[0]); },
      list: function () { return GG.FRUITS; },
      found: function () { return GG.Save.totalFruit(); } }
  ];
  var BOOK_BY_ID = {};
  BOOKS.forEach(function (b) { BOOK_BY_ID[b.id] = b; });

  var Book = GG.Book = {
    tab: 'bugs',
    BOOKS: BOOKS,

    /* open() with no book named shows the contents page */
    open: function (tab) {
      this.tab = tab || 'home';
      GG.UI.open('screen-book');
      this.showGrid();
    },

    /* The contents page: a shelf of the four books, each with how far she
       has got through it. */
    showContents: function () {
      var grid = $('book-grid'), det = $('book-detail');
      grid.style.display = 'grid'; det.style.display = 'none';
      $('book-back').style.display = 'none';
      $('book-tabs').style.display = '';
      $('book-title').textContent = 'Critter Compendium';
      $('book-kicker').classList.add('hide');
      document.querySelectorAll('#book-tabs .tab').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-book') === 'home');
      });
      grid.innerHTML = '';
      var all = 0, got = 0;
      BOOKS.forEach(function (b) { all += b.list().length; got += Math.min(b.found(), b.list().length); });
      $('progress').textContent = got + ' / ' + all;

      var note = GG.el('div', 'shelfnote');
      note.innerHTML = '<b>Your Critter Compendium.</b> Four books in one. Everything you catch, '
        + 'meet, befriend or pick gets its own page. You have found <b>' + got + '</b> of <b>'
        + all + '</b> so far.';
      grid.appendChild(note);

      var shelf = GG.el('div', 'shelf');
      BOOKS.forEach(function (b) {
        var n = b.list().length, f = Math.min(b.found(), n);
        var card = GG.el('div', 'shelfbook');
        card.setAttribute('data-open', b.id);
        card.style.background = b.col;
        card.appendChild(GG.el('div', 'bk', b.name));
        var def = b.show();
        var cv = document.createElement('canvas');
        cv.width = 280; cv.height = 156;
        var c = cv.getContext('2d'); c.scale(2, 2);
        if (def) {
          if (def.isAnimal) GG.AnimalArt.draw(c, def, 70, 64, GG.animalFit(def, 58), false, 1.2);
          else GG.drawAny(c, def, 70, 39, def.isFish ? 2.2 : 2.1, def.isFish ? 0 : -Math.PI / 2, 1.1);
        }
        card.appendChild(cv);
        card.appendChild(GG.el('div', 'bn', f + ' of ' + n + ' ' + b.blurb));
        var bar = GG.el('div', 'bar'), fill = GG.el('i');
        fill.style.width = (n ? Math.round(f / n * 100) : 0) + '%';
        bar.appendChild(fill); card.appendChild(bar);
        card.addEventListener('click', function () { GG.Sfx.click(); Book.setTab(b.id); });
        shelf.appendChild(card);
      });
      grid.appendChild(shelf);
    },

    setTab: function (tab) {
      this.tab = tab; this._gridScroll = 0; this.showGrid();
      var b = document.querySelector('#screen-book .body'); if (b) b.scrollTop = 0;
    },

    showGrid: function () {
      if (!BOOK_BY_ID[this.tab]) { this.showContents(); return; }
      var grid = $('book-grid'), det = $('book-detail');
      var tab = this.tab;
      $('book-kicker').classList.remove('hide');
      var fish = tab === 'fish', friends = tab === 'friends', fruit = tab === 'fruit';
      grid.style.display = 'grid'; det.style.display = 'none';
      $('book-back').style.display = 'none';
      $('book-tabs').style.display = '';
      $('book-title').textContent = fruit ? 'Garden Book'
        : (friends ? 'Friends Book' : (fish ? 'Fish Book' : 'Bug Book'));
      document.querySelectorAll('#book-tabs .tab').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-book') === tab);
      });
      grid.innerHTML = '';
      var list = fruit ? (GG.fruitsInBookOrder ? GG.fruitsInBookOrder() : GG.FRUITS) : (friends ? GG.ANIMALS : (fish ? GG.FISH : GG.BUGS));
      /* the look-only friends are met, never befriended - but a page she has
         opened still counts towards the book, exactly as it does for bugs */
      var metOnly = 0;
      if (friends) {
        GG.ANIMALS.forEach(function (a) {
          if (a.lookOnly && GG.Save.hasSeen(a.id)) metOnly++;
        });
      }
      var found = fruit ? GG.Save.totalFruit()
        : (friends ? GG.Save.totalFriends() + metOnly
          : (fish ? GG.Save.totalFish() : GG.Save.totalSpecies()));
      $('progress').textContent = found + ' / ' + list.length;
      if (friends) this.companionRow(grid);
      if (fruit) this.fruitRow(grid);
      var shelf = null;
      list.forEach(function (def) {
        /* the Garden Book has four shelves: fruit, berries, vegetables, flowers */
        if (fruit && GG.FRUIT_KINDS && def.kind !== shelf) {
          shelf = def.kind;
          var kd = null;
          GG.FRUIT_KINDS.forEach(function (k) { if (k.id === shelf) kd = k; });
          var have = 0, all = 0;
          list.forEach(function (f) { if (f.kind === shelf) { all++; if (GG.Save.hasFruit(f.id)) have++; } });
          var hd = GG.el('div', 'book-shelf', (kd ? kd.name : 'More') + '  ' + have + ' / ' + all);
          hd.style.gridColumn = '1/-1';
          grid.appendChild(hd);
        }
        var got = fruit ? GG.Save.hasFruit(def.id)
          : (friends ? (def.lookOnly ? GG.Save.hasSeen(def.id) : GG.Save.hasFriend(def.id))
            : (fish ? GG.Save.hasFish(def.id) : GG.Save.found(def)));
        var cell = GG.el('div', 'bugcell' + (got ? ' got' : ''));
        var cv = thumb(def, 84, 54, !got);
        cv.style.width = '100%'; cv.style.height = '54px';
        cell.appendChild(cv);
        cell.appendChild(GG.el('div', 'nm', got ? def.name : '???'));
        if (got) {
          var n0 = fruit ? GG.Save.countOfFruit(def.id)
            : (def.lookOnly ? GG.Save.countOfSeen(def.id)
              : (friends ? GG.Save.countOfFriend(def.id)
                : (fish ? GG.Save.countOfFish(def.id) : GG.Save.countOf(def.id))));
          cell.appendChild(GG.el('div', 'cnt', def.lookOnly ? '✔' : '×' + n0));
          if (!fruit) {
            var r = GG.el('div', 'rar');
            r.style.background = GG.RARITY_COLORS[def.rarity];
            cell.appendChild(r);
          } else {
            var e = GG.el('div', 'rar');
            e.style.background = def.eat === 'never' ? '#d84a4a'
              : (def.eat === 'careful' ? '#e0a13c' : '#8fb98f');
            cell.appendChild(e);
          }
        }
        cell.addEventListener('click', function () {
          GG.Sfx.click();
          if (got) Book.showDetail(def);
          else if (def.lookOnly) {
            GG.UI.toast(def.isAnimal
              ? 'You have not met this one yet. Back slowly away from her and she becomes a friend you keep your distance from.'
              : 'You have not met this one yet. She is out on the hills after dark.', 3200);
          }
          else GG.UI.toast(fruit ? 'You have not picked this one yet!'
            : (friends ? 'You have not made friends with this one yet!'
              : (fish ? 'You have not caught this one yet!' : 'You have not met this one yet!')));
        });
        grid.appendChild(cell);
      });
    },

    /* a little basket at the top of the Fruit tab, saying what picking is for */
    fruitRow: function (grid) {
      var row = GG.el('div', '', null);
      row.id = 'companion-row';
      row.style.gridColumn = '1/-1';
      var kinds = GG.Orchard ? GG.Orchard.kinds() : GG.Save.totalFruit();
      var txt = GG.el('div', 'grow');
      txt.innerHTML = kinds
        ? '<b>' + kinds + ' of ' + GG.FRUITS.length + ' kinds picked.</b> Every new kind '
          + 'unlocks a decoration for your tanks.'
          + '<div class="dotkey"><i style="background:#8fb98f"></i>good to eat '
          + '<i style="background:#e0a13c"></i>careful <i style="background:#d84a4a"></i>never eat</div>'
        : 'Walk up to a fruit tree, a vegetable bed, a wild berry bush or a clump of flowers '
          + 'and tap <b>PICK</b>. Every new kind unlocks a decoration.';
      row.appendChild(txt);
      grid.appendChild(row);
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
      /* remember where she was in the list, and start the page at the top */
      var body = document.querySelector('#screen-book .body');
      if (body && grid.style.display !== 'none') this._gridScroll = body.scrollTop;
      grid.style.display = 'none'; det.style.display = 'block';
      if (body) body.scrollTop = 0;
      $('book-back').style.display = 'block';
      $('book-back').textContent = def.isFruit ? 'All the garden'
        : (def.isAnimal ? 'All friends'
          : (def.isFish ? 'All fish' : 'All bugs'));
      $('book-tabs').style.display = 'none';
      det.innerHTML = '';
      var isFish = !!def.isFish;
      var isAnimal = !!def.isAnimal;
      var isFruit = !!def.isFruit;

      var cv = GG.el('canvas'); cv.id = 'detail-art';
      cv.width = 640; cv.height = 300;
      det.appendChild(cv);

      var h = GG.el('h2', null, def.name);
      h.style.margin = '10px 0 2px'; h.style.fontSize = '21px';
      det.appendChild(h);

      var meta = GG.el('div', 'meta');
      var times = isFruit ? '' : def.times.map(function (x) { return GG.TIME_NAMES[x]; }).join(', ');
      var n = isFruit ? GG.Save.countOfFruit(def.id)
        : (def.lookOnly ? GG.Save.countOfSeen(def.id)
          : (isAnimal ? GG.Save.countOfFriend(def.id)
            : (isFish ? GG.Save.countOfFish(def.id) : GG.Save.countOf(def.id))));
      var rows;
      if (isFruit) {
        var un = GG.DECOR_BY_ID[def.unlock];
        rows = [['Grows in', GG.fruitWhereName ? GG.fruitWhereName(def) : (GG.FRUITS_WHERE[def.where] || def.where)],
          ['On', GG.fruitOnName ? GG.fruitOnName(def) : (def.on === 'tree' ? 'a tree' : 'a bush')],
          [def.kind === 'flower' ? 'In bloom' : 'Ripe in', def.ripens], ['Size', def.measure],
          ['Picked', n + ' time' + (n === 1 ? '' : 's')]];
        if (un) rows.push(['Unlocked', un.name]);
      } else if (isAnimal) {
        rows = [['Found in', GG.animalPlaces(def)], ['Out and about', times],
          ['Size', def.measure], ['Rarity', GG.RARITY_NAMES[def.rarity]],
          [def.lookOnly ? 'Met' : 'Said hello', n + ' time' + (n === 1 ? '' : 's')]];
      } else if (isFish) {
        var waters = (def.waters || ['pond']).map(function (w) { return GG.WATER_NAMES[w]; }).join(', ');
        rows = [['Found in', waters], ['Bites', times], ['Size', def.measure],
          ['Shadow', GG.SHADOW_NAMES[def.shadow]], ['Rarity', GG.RARITY_NAMES[def.rarity]],
          ['Caught', n + ' time' + (n === 1 ? '' : 's')]];
      } else {
        var places = def.habitats.map(function (x) { return GG.HABITAT_NAMES[x]; }).join(', ');
        rows = [['Found in', places], ['Comes out', times], ['Size', def.measure],
          ['Rarity', GG.RARITY_NAMES[def.rarity]]];
        if (def.lookOnly) {
          var seen = GG.Save.countOfSeen(def.id);
          rows.push(['Met', seen + ' time' + (seen === 1 ? '' : 's')]);
        } else {
          rows.push(['Caught', n + ' time' + (n === 1 ? '' : 's')]);
        }
      }
      rows.forEach(function (p) {
        meta.appendChild(GG.el('span', 'tag', p[0] + ': ' + p[1]));
      });
      if (def.sting) {
        var warn = GG.el('span', 'tag sting', 'Can sting if you upset her');
        meta.appendChild(warn);
      }
      if (def.lookOnly) {
        meta.appendChild(GG.el('span', 'tag lookonly', isAnimal
          ? 'A friend you keep away from \u2014 she never comes along, and she is never touched'
          : 'Look, don\u2019t catch \u2014 your net will not take her'));
      }
      if (!isFish && !isAnimal && GG.isAquaticBug(def)) {
        meta.appendChild(GG.el('span', 'tag wet', 'Needs water: keep it in a fish tank or a hybrid tank'));
      }
      if (isAnimal) {
        var way = GG.FRIEND_WAYS[def.way];
        if (way) meta.appendChild(GG.el('span', 'tag way', 'How to say hello: ' + way.blurb));
      }
      det.appendChild(meta);

      if (def.lookOnly && def.danger) {
        var dbox = GG.el('div');
        dbox.id = 'fruit-care';
        dbox.className = 'eat-never';
        dbox.innerHTML = '<b>Keep your hands to yourself</b><span>' + def.danger + '</span>';
        det.appendChild(dbox);
      }

      if (isFruit) {
        var eatInfo = GG.FRUIT_EAT[def.eat] || GG.FRUIT_EAT.careful;
        var box = GG.el('div');
        box.id = 'fruit-care';
        box.className = eatInfo.cls;
        box.innerHTML = '<b>' + eatInfo.label + '</b><span>' + def.care + '</span>';
        det.appendChild(box);
      }

      /* who eats whom */
      var eats = GG.eatsList ? GG.eatsList(def.id) : [];
      var eatenBy = GG.eatenByList ? GG.eatenByList(def.id) : [];
      /* Some friends do not hunt at all, and that is worth a line of its own
         rather than an empty space where the hunting would have been. */
      var forage = (isAnimal && GG.animalForage) ? GG.animalForage(def.id) : null;
      if (eats.length || eatenBy.length || forage) {
        var chain = GG.el('div', 'foodchain');
        chain.appendChild(GG.el('b', null, 'In the wild'));
        if (eats.length) {
          chain.appendChild(GG.el('div', 'fcline',
            '\ud83d\udc1b It hunts: ' + GG.nameList(eats, 6)));
        } else if (forage) {
          chain.appendChild(GG.el('div', 'fcline',
            '\ud83c\udf3e It does not hunt. ' + forage.note));
        }
        if (eatenBy.length) {
          chain.appendChild(GG.el('div', 'fcline',
            '\ud83d\udc40 Watch out for: ' + GG.nameList(eatenBy, 6)));
        }
        chain.appendChild(GG.el('div', 'fcnote',
          (eats.length || eatenBy.length)
            ? 'In your garden everybody always gets away.'
            : 'It forages instead \u2014 watch it work at something with its beak.'));
        det.appendChild(chain);
      }

      def.facts.forEach(function (f) {
        var line = GG.el('div', 'factline');
        line.innerHTML = '<b>&#10022;</b> ' + f;
        det.appendChild(line);
      });

      /* What a fish feels when she steps into the water. It belongs here,
         because this is the page she opens after one has shot away from her. */
      if (isFish) {
        var lat = GG.el('div', 'foodchain');
        lat.appendChild(GG.el('b', null, 'When you step in the water'));
        var l1 = GG.el('div', 'fcline');
        l1.innerHTML = '🌊 A fish has a line of tiny sensors down each side of its body '
          + 'called a <b>lateral line</b>. It works like touching — but at a distance. When '
          + 'you step into the stream the fish <b>feels</b> your leg push the water, long before '
          + 'it ever sees you.';
        lat.appendChild(l1);
        var l2 = GG.el('div', 'fcline');
        l2.innerHTML = '⚡ A frightened fish bends into a <b>C shape</b> and shoots away. It '
          + 'takes about one hundredth of a second — faster than you can blink.';
        lat.appendChild(l2);
        var l3 = GG.el('div', 'fcnote');
        l3.innerHTML = 'Fish in a stream face <b>upstream</b>, into the water coming towards them. '
          + 'So walk <b>up</b> the stream, behind them, and go slowly — the scientists who '
          + 'count fish underwater say that if you move slowly enough you can almost touch one '
          + 'before it notices.';
        lat.appendChild(l3);
        det.appendChild(lat);
      }

      if (isAnimal) {
        var man = GG.el('div');
        man.id = 'friend-manners';
        man.style.margin = '10px 0';
        man.innerHTML = '<b>Good manners</b><span>' + def.manners + '</span>';
        det.appendChild(man);

        /* what two of these do when they meet each other */
        var sig = GG.friendSignalOf ? GG.friendSignalOf(def) : null;
        if (sig) {
          var sbox = GG.el('div', 'foodchain');
          sbox.appendChild(GG.el('b', null, 'When two friends meet: ' + sig.name));
          sbox.appendChild(GG.el('div', 'fcline', '💛 ' + sig.why));
          sbox.appendChild(GG.el('div', 'fcnote', sig.honest));
          det.appendChild(sbox);
        }

        /* and the one friend you can get up on */
        if (def.rideable) {
          var ride = GG.el('div');
          ride.id = 'friend-riding';
          ride.style.margin = '10px 0';
          ride.innerHTML = '<b>Riding her</b><span>Ask the person she belongs to. Come to her '
            + '<b>shoulder</b>, from the side, talking as you go — never straight behind '
            + 'her, where she cannot see you, and never right under her nose, which she cannot '
            + 'see either. Then the <b>helmet</b>: a proper riding one, done up, every single '
            + 'time, even for a little ride. More than half of the people badly hurt around '
            + 'horses are hurt on the head.</span>';
          det.appendChild(ride);
        }

        /* silly hats */
        var hh = GG.el('div', 'hat-head', 'Silly hats');
        det.appendChild(hh);
        var hatRow = GG.el('div'); hatRow.id = 'hat-row';
        var picked = GG.Save.hatOf(def.id);

        var none = GG.el('div', 'hatpick' + (picked ? '' : ' on'));
        none.appendChild(GG.el('div', 'hatnone', '\u2014'));
        none.appendChild(GG.el('div', 'nm', 'No hat'));
        none.addEventListener('click', function () {
          GG.Sfx.click(); GG.Save.setHat(def.id, null); Book.showDetail(def);
        });
        hatRow.appendChild(none);

        GG.HATS.forEach(function (hat) {
          var cell = GG.el('div', 'hatpick' + (picked === hat.id ? ' on' : ''));
          var hv = GG.el('canvas'); hv.width = 120; hv.height = 120;
          var hc = hv.getContext('2d'); hc.scale(2, 2);
          GG.drawHatOnly(hc, hat.id, 30, 42, 17, 0.4);
          cell.appendChild(hv);
          cell.appendChild(GG.el('div', 'nm', hat.name));
          cell.addEventListener('click', function () {
            GG.Sfx.place();
            GG.Save.setHat(def.id, hat.id);
            Book.showDetail(def);
          });
          hatRow.appendChild(cell);
        });
        det.appendChild(hatRow);

        if (def.lookOnly) {
          /* She is never asked along, and there is no button that pretends
             otherwise - the same promise the Bug Book makes about the widow. */
          var keep = GG.el('div');
          keep.id = 'friend-riding';
          keep.style.margin = '10px 0';
          keep.innerHTML = '<b>She stays where she is</b><span>This is a friend you say hello '
            + 'to from a long way off. She never comes with you, she never waits at your house, '
            + 'and nobody ever picks her up.</span>';
          det.appendChild(keep);
        } else {
          var along = GG.el('button', 'btn primary');
          along.style.width = '100%';
          var here = GG.Save.data.companion === def.id;
          along.textContent = here ? 'They are already with you' : 'Ask them along';
          along.disabled = here;
          along.addEventListener('click', function () {
            GG.Sfx.click();
            GG.Friends.setCompanion(def.id);
            GG.Sfx.animalCall(def.family, def.id);
            GG.UI.toast(def.name + ' is coming with you!', 2400);
            Book.showDetail(def);
          });
          det.appendChild(along);
          if (GG.animalIsUnique(def)) {
            /* there is only one of her, and the page says where she is */
            var w = GG.Friends.uniqueWhere(def.id), wtxt;
            if (w === 'companion') wtxt = 'She is out walking with you.';
            else if (w === 'home') wtxt = 'She is waiting for you at the cottage.';
            else if (w) wtxt = 'She is visiting ' + (w.name || 'one of your habitats') + '.';
            else wtxt = 'She is out in the garden somewhere.';
            var one = GG.el('div');
            one.id = 'friend-unique';
            one.style.margin = '10px 0';
            one.innerHTML = '<b>There is only one ' + def.name + '</b><span>She is one particular '
              + 'dog, not a kind of dog, so she can only be in one place at a time. ' + wtxt + '</span>';
            det.appendChild(one);
          }
        }
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
        if (def.lookOnly) { g.addColorStop(0, '#3a3340'); g.addColorStop(1, '#241f28'); }
        else if (isFruit) { g.addColorStop(0, '#fdf0d8'); g.addColorStop(1, '#e9d4a8'); }
        else if (isAnimal) { g.addColorStop(0, '#cfeeff'); g.addColorStop(1, '#9ed98a'); }
        else if (isFish) { g.addColorStop(0, '#9fd8ee'); g.addColorStop(1, '#3f93b8'); }
        else { g.addColorStop(0, '#eaf6e4'); g.addColorStop(1, '#d3e9cb'); }
        c.fillStyle = g; GG.roundRect(c, 0, 0, cv.width, cv.height, 22); c.fill();
        /* soft clouds along the bottom - but the look-only page is a dark
           night scene, so they become faint web strands instead */
        if (def.lookOnly) {
          c.strokeStyle = 'rgba(255,255,255,0.07)'; c.lineWidth = 1;
          for (var w = 0; w < 6; w++) {
            c.beginPath();
            c.moveTo(0, w * 52 - 10);
            c.quadraticCurveTo(cv.width / 2, w * 38 + Math.sin(t + w) * 7, cv.width, w * 56);
            c.stroke();
          }
        } else {
          c.fillStyle = 'rgba(255,255,255,0.35)';
          for (var i = 0; i < 5; i++) {
            c.beginPath();
            c.ellipse(80 + i * 130, 250 + Math.sin(t + i) * 6, 60, 16, 0, 0, Math.PI * 2); c.fill();
          }
        }
        GG.drawAny(c, def, cv.width / 2, cv.height / 2 + Math.sin(t * 1.6) * 8, 8.4, -Math.PI / 2, t,
          false, def.isAnimal ? 0.8 : 0);
        self._raf = requestAnimationFrame(frame);
      }
      this._raf = requestAnimationFrame(frame);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    $('book-back').addEventListener('click', function () {
      GG.Sfx.click(); Book.showGrid();
      var body = document.querySelector('#screen-book .body');
      if (body) body.scrollTop = Book._gridScroll || 0;
    });
    document.querySelectorAll('#book-tabs .tab').forEach(function (el) {
      el.addEventListener('click', function () { GG.Sfx.click(); Book.setTab(el.getAttribute('data-book')); });
    });
  });
})(window.GG = window.GG || {});
