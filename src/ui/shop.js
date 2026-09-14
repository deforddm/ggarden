/* The Decoration Box - spend sparkles on things for the terrariums. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  var Shop = GG.Shop = {
    open: function () { GG.UI.open('screen-shop'); this.refresh(); },

    refresh: function () {
      var d = GG.Save.data, self = this;
      $('shop-sparkles').innerHTML = '&#10022; ' + d.sparkles;

      var grid = $('shop-grid'); grid.innerHTML = '';
      var groupsD = [
        ['land', 'For terrariums (and the bank of a hybrid)'],
        ['water', 'For fish tanks (and the pool of a hybrid)'],
        ['habitat', 'For a garden habitat'],
        ['any', 'For any tank'],
        ['picked', 'Picked, not bought — from the orchard and the hills']
      ];
      groupsD.forEach(function (g) {
        grid.appendChild(GG.el('div', 'shop-group', g[1]));
        GG.DECOR.filter(function (x) {
          /* the fruit ones live in their own group, however they are tagged */
          if (g[0] === 'picked') return !!x.fruit;
          return !x.fruit && (x.for || 'any') === g[0];
        }).forEach(function (dec) {
        var owned = d.unlockedDecor.indexOf(dec.id) >= 0;
        var fruitDef = dec.fruit && GG.FRUIT_BY_ID ? GG.FRUIT_BY_ID[dec.fruit] : null;
        var el = GG.el('div', 'shopitem' + (owned ? ' owned' : ''));
        var cv = GG.el('canvas'); cv.width = 176; cv.height = 112; cv.style.height = '56px';
        var c = cv.getContext('2d'); c.scale(2, 2);
        var fn = GG.DecorArt[dec.id];
        if (fn) {
          if (!owned && fruitDef) {
            /* a shadow of the thing she has not found yet */
            c.save();
            fn(c, 44, 50, 0.9, 1);
            c.globalCompositeOperation = 'source-in';
            c.fillStyle = 'rgba(120,132,112,0.5)';
            c.fillRect(0, 0, 88, 56);
            c.restore();
          } else {
            fn(c, 44, 50, 0.9, 1);
          }
        }
        el.appendChild(cv);
        el.appendChild(GG.el('div', 'nm', (!owned && fruitDef) ? '???' : dec.name));
        el.appendChild(GG.el('div', 'price', owned ? 'owned'
          : (fruitDef ? 'pick one' : '✦ ' + dec.price)));
        el.addEventListener('click', function () {
          if (owned) { GG.UI.toast('You already have this one'); return; }
          if (fruitDef) {
            GG.UI.toast('Pick a ' + fruitDef.name + ' in '
              + (GG.FRUITS_WHERE[fruitDef.where] || 'the garden') + ' and this is yours.', 3000);
            return;
          }
          if (d.sparkles < dec.price) { GG.UI.toast('Not enough sparkles yet'); return; }
          d.sparkles -= dec.price;
          d.unlockedDecor.push(dec.id);
          GG.Sfx.coin(); GG.Save.save(); GG.UI.refreshHud(); self.refresh();
          GG.UI.toast('Bought ' + dec.name + '!');
        });
        grid.appendChild(el);
        });
      });

      var bgs = $('shop-bgs'); bgs.innerHTML = '';
      var groups = [['land', 'For terrariums'], ['water', 'For fish tanks'],
        ['hybrid', 'For hybrid tanks'], ['habitat', 'For garden habitats']];
      groups.forEach(function (grp) {
        bgs.appendChild(GG.el('div', 'shop-group', grp[1]));
        GG.TANK_BGS.filter(function (b) { return b.kind === grp[0]; }).forEach(function (bg) {
        var key = 'bg_' + bg.id;
        var owned = bg.price === 0 || d.unlockedDecor.indexOf(key) >= 0;
        var el = GG.el('div', 'shopitem' + (owned ? ' owned' : ''));
        var cv = GG.el('canvas'); cv.width = 176; cv.height = 112; cv.style.height = '56px';
        var c = cv.getContext('2d'); c.scale(2, 2);
        if (bg.kind === 'water') {
          var wg = c.createLinearGradient(0, 0, 0, 56);
          wg.addColorStop(0, bg.sky); wg.addColorStop(1, bg.deep);
          c.fillStyle = wg; c.fillRect(0, 0, 88, 56);
          c.fillStyle = bg.ground;
          c.beginPath(); c.moveTo(0, 47); c.quadraticCurveTo(44, 41, 88, 47);
          c.lineTo(88, 56); c.lineTo(0, 56); c.closePath(); c.fill();
        } else if (bg.kind === 'hybrid') {
          c.fillStyle = bg.sky; c.fillRect(0, 0, 88, 30);
          c.fillStyle = bg.ground; c.fillRect(0, 26, 88, 10);
          var hg = c.createLinearGradient(0, 34, 0, 56);
          hg.addColorStop(0, bg.water); hg.addColorStop(1, bg.deep);
          c.fillStyle = hg; c.fillRect(0, 34, 88, 22);
        } else {
          c.fillStyle = bg.sky; c.fillRect(0, 0, 88, 56);
          if (bg.kind === 'habitat') {
            c.fillStyle = GG.shade(bg.ground, -0.22);
            for (var hh = 0; hh < 6; hh++) {
              c.beginPath(); c.arc(hh * 18, 38, 12, Math.PI, 0); c.fill();
            }
          }
          c.fillStyle = bg.ground;
          c.beginPath(); c.moveTo(0, 40); c.quadraticCurveTo(44, 30, 88, 40);
          c.lineTo(88, 56); c.lineTo(0, 56); c.closePath(); c.fill();
          c.fillStyle = bg.ground2;
          c.beginPath(); c.moveTo(0, 49); c.quadraticCurveTo(44, 43, 88, 49);
          c.lineTo(88, 56); c.lineTo(0, 56); c.closePath(); c.fill();
        }
        el.appendChild(cv);
        el.appendChild(GG.el('div', 'nm', bg.name));
        el.appendChild(GG.el('div', 'price', owned ? 'owned' : '✦ ' + bg.price));
        el.addEventListener('click', function () {
          if (owned) { GG.UI.toast('You already have this scene'); return; }
          if (d.sparkles < bg.price) { GG.UI.toast('Not enough sparkles yet'); return; }
          d.sparkles -= bg.price;
          d.unlockedDecor.push(key);
          GG.Sfx.coin(); GG.Save.save(); GG.UI.refreshHud(); Shop.refresh();
          GG.UI.toast('Bought the ' + bg.name + ' scene!');
        });
        bgs.appendChild(el);
        });
      });
    }
  };
})(window.GG = window.GG || {});
