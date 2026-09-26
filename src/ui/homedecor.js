/* v1.20 - Decorate my home. Opened from the paint pots by the cottage door.

   A live picture of her room sits at the top. Six tabs underneath - Walls,
   Floor, Rug, Bed, Curtains, Things - each a grid of big tiles showing what
   the option looks like. Tapping a look she owns puts it up straight away;
   tapping one she does not own lets her TRY IT ON in the picture, with a Buy
   button for its sparkles. Things work like Animal Crossing furniture: pick
   one, tap the room where it should go (it finds the nearest good spot on the
   floor, or on the wall for pictures), tap it again to move it or put it back
   in the box. Nothing she has bought is ever lost - a thing put away is still
   hers to put out again for free. */
(function (GG) {
  'use strict';
  var $ = GG.$;
  var D = function () { return GG.HOME_DECOR; };

  var HD = GG.HomeDecor = {
    kind: 'wall',
    tryOn: {},          // looks she is only trying on: { wall: 'stars' }
    mode: null,         // 'place' (sel = item id) or 'move' (picked = index)
    sel: null,
    picked: -1,
    _wired: false,

    open: function () {
      this._wire();
      this.tryOn = {}; this.mode = null; this.sel = null; this.picked = -1;
      GG.UI.open('screen-homedecor');
      this.setKind(this.kind || 'wall');
      this.fit();
    },
    close: function () {
      var H = GG.House, back = [], k;
      for (k in this.tryOn) {
        if (this.tryOn[k] !== H.look(k)) back.push(D().byId[k][this.tryOn[k]].name);
      }
      this.tryOn = {}; this.mode = null; this.picked = -1;
      GG.UI.close('screen-homedecor');
      H.refresh();
      GG.Save.save();
      if (back.length) GG.UI.toast('Only tried on: ' + back.join(', ') + '. Buy one to keep it!', 2600);
    },

    _wire: function () {
      if (this._wired) return;
      this._wired = true;
      var self = this;
      $('hd-done').addEventListener('click', function () { GG.Sfx.click(); self.close(); });
      document.querySelectorAll('#hd-tabs .hd-tab').forEach(function (b) {
        b.addEventListener('click', function () { GG.Sfx.click(); self.setKind(b.getAttribute('data-kind')); });
      });
      $('hd-room').addEventListener('click', function (e) {
        var r = this.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width * GG.House.W, y = (e.clientY - r.top) / r.height * GG.House.H;
        self.tapRoom(x, y);
      });
      window.addEventListener('resize', function () {
        if (!$('screen-homedecor').classList.contains('hidden')) self.fit();
      });
    },

    /* size the picture's canvas to the screen, then draw it */
    fit: function () {
      /* offsetWidth, not the bounding box: the sheet pops in with a scale
         animation, and the canvas must be sized for where it ends up */
      var cv = $('hd-room');
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      var w = Math.max(1, Math.round(cv.offsetWidth * dpr)), h = Math.max(1, Math.round(cv.offsetHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      this.drawRoom();
    },

    style: function () {
      var st = GG.House.style();
      for (var k in this.tryOn) st[k] = this.tryOn[k];
      return st;
    },

    drawRoom: function () {
      var cv = $('hd-room'), c = cv.getContext('2d'), H = GG.House;
      var s = cv.width / H.W;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      c.setTransform(s, 0, 0, cv.height / H.H, 0, 0);
      H.drawPreview(c, this.style());
      /* a dashed ring round the thing she has picked up */
      if (this.picked >= 0) {
        var it = H.items()[this.picked], def = it && D().byId.item[it.id];
        if (def) {
          c.save();
          c.strokeStyle = this.mode === 'move' ? '#ff5a8a' : '#ffffff';
          c.lineWidth = 2.4; c.setLineDash([5, 4]);
          GG.roundRect(c, it.x - def.fw / 2 - 5, it.y - def.ht - 5, def.fw + 10, def.ht + 10, 6); c.stroke();
          c.strokeStyle = 'rgba(60,40,20,0.5)'; c.lineWidth = 1; c.setLineDash([]);
          GG.roundRect(c, it.x - def.fw / 2 - 6.5, it.y - def.ht - 6.5, def.fw + 13, def.ht + 13, 7); c.stroke();
          c.restore();
        }
      }
      this.drawTabIcons();
    },

    setKind: function (kind) {
      this.kind = kind;
      if (kind !== 'item') { this.mode = null; this.picked = -1; }
      document.querySelectorAll('#hd-tabs .hd-tab').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-kind') === kind);
      });
      this.buildGrid();
      this.refreshBar();
      this.drawRoom();
      var body = document.querySelector('#screen-homedecor .hd-body');
      if (body) body.scrollTop = 0;
    },

    /* each tab wears a little picture of what is up in the room now */
    drawTabIcons: function () {
      var self = this;
      document.querySelectorAll('#hd-tabs .hd-tab').forEach(function (b) {
        var k = b.getAttribute('data-kind'), cv = b.querySelector('canvas');
        if (!cv) return;
        var c = cv.getContext('2d');
        c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
        c.scale(cv.width / 100, cv.height / 64);
        if (k === 'item') GG.HomeArt.swatch(c, 'item', 'teddy', 100, 64);
        else GG.HomeArt.swatch(c, k, self.tryOn[k] || GG.House.look(k), 100, 64);
      });
    },

    /* the grid of tiles for one tab */
    buildGrid: function () {
      var self = this, grid = $('hd-grid'), kind = this.kind, H = GG.House, d = GG.Save.data;
      grid.innerHTML = '';
      $('hd-sparkles').innerHTML = '&#10022; ' + (d.sparkles || 0);
      var list = D()[kind];
      var current = kind === 'item' ? null : (this.tryOn[kind] || H.look(kind));
      list.forEach(function (o) {
        var el = GG.el('button', 'hd-tile');
        el.setAttribute('data-id', o.id);
        var cv = GG.el('canvas'); cv.width = 200; cv.height = 128;
        var c = cv.getContext('2d'); c.scale(2, 2);
        GG.HomeArt.swatch(c, kind, o.id, 100, 64);
        el.appendChild(cv);
        el.appendChild(GG.el('div', 'nm', o.name));
        var price, cls = '';
        if (kind === 'item') {
          var sp = H.spare(o.id);
          if (!o.price) { price = 'Free'; cls = 'free'; }
          else if (sp > 0) { price = 'In your box ×' + sp; cls = 'owned'; }
          else price = '✦ ' + o.price;
          if (self.mode === 'place' && self.sel === o.id) el.classList.add('on');
        } else {
          if (H.look(kind) === o.id) { price = 'Using it'; cls = 'using'; }
          else if (H.owns(kind, o.id)) { price = o.price ? 'Yours' : 'Free'; cls = 'owned'; }
          else price = '✦ ' + o.price;
          if (current === o.id) el.classList.add('on');
        }
        el.appendChild(GG.el('div', 'pr ' + cls, price));
        el.addEventListener('click', function () { GG.Sfx.click(); self.tapTile(o.id); });
        grid.appendChild(el);
      });
    },

    tapTile: function (id) {
      var H = GG.House, kind = this.kind;
      if (kind === 'item') {
        var def = D().byId.item[id];
        if (this.mode === 'place' && this.sel === id) { this.mode = null; this.sel = null; }
        else {
          if (H.items().length >= D().MAX_ITEMS) { GG.UI.toast('Your room is full! Put something back in the box first.', 2400); return; }
          this.mode = 'place'; this.sel = id; this.picked = -1;
          GG.UI.toast(def.wall ? 'Now tap the wall where it should hang' : 'Now tap the room where it should go', 1800);
        }
      } else {
        if (H.owns(kind, id)) {
          /* hers already: up it goes */
          delete this.tryOn[kind];
          H.useLook(kind, id);
        } else {
          this.tryOn[kind] = id;
        }
      }
      this.buildGrid(); this.refreshBar(); this.drawRoom();
    },

    /* the strip under the picture: what is picked, and what she can do */
    refreshBar: function () {
      var self = this, H = GG.House, kind = this.kind, name = $('hd-name'), act = $('hd-actions');
      var hint = $('hd-hint'), d = GG.Save.data;
      act.innerHTML = ''; hint.classList.add('hidden');
      function btn(label, cls, fn) {
        var b = GG.el('button', 'btn ' + (cls || ''), label);
        b.addEventListener('click', function () { GG.Sfx.click(); fn(); });
        act.appendChild(b); return b;
      }
      if (kind !== 'item') {
        var id = this.tryOn[kind] || H.look(kind), o = D().byId[kind][id];
        name.innerHTML = '<b>' + o.name + '</b>';
        if (H.look(kind) === id) {
          act.appendChild(GG.el('span', 'hd-using', '✔ In your home'));
        } else if (!H.owns(kind, id)) {
          name.innerHTML += '<small>Trying it on</small>';
          var b = btn('Buy ✦ ' + o.price, 'primary', function () { self.buy(kind, id); });
          if ((d.sparkles || 0) < o.price) b.classList.add('short');
        }
        return;
      }
      var list = H.items();
      if (this.mode === 'place') {
        var def = D().byId.item[this.sel];
        name.innerHTML = '<b>' + def.name + '</b><small>' + (def.wall ? 'Tap the wall' : 'Tap the floor') + '</small>';
        hint.textContent = def.wall ? 'Tap the wall to hang it up' : 'Tap the floor to put it down';
        hint.classList.remove('hidden');
        btn('Cancel', '', function () { self.mode = null; self.sel = null; self.buildGrid(); self.refreshBar(); });
      } else if (this.picked >= 0 && list[this.picked]) {
        var pd = D().byId.item[list[this.picked].id];
        name.innerHTML = '<b>' + pd.name + '</b>';
        if (this.mode === 'move') {
          hint.textContent = 'Tap where it should go'; hint.classList.remove('hidden');
          btn('Cancel', '', function () { self.mode = null; self.refreshBar(); self.drawRoom(); });
        } else {
          btn('Move', 'primary', function () { self.mode = 'move'; self.refreshBar(); self.drawRoom(); });
          btn('Put away', 'pink', function () {
            H.removeItem(self.picked); self.picked = -1;
            GG.UI.toast(pd.name + ' is back in your box', 1600);
            self.buildGrid(); self.refreshBar(); self.drawRoom();
          });
        }
      } else {
        name.innerHTML = '<b>Things</b><small>' + (list.length ? 'Pick one below, or tap one in your room' : 'Pick one below, then tap your room') + '</small>';
      }
    },

    buy: function (kind, id) {
      var o = D().byId[kind][id], res = GG.House.useLook(kind, id);
      if (res === 'short') { GG.UI.toast('Not enough sparkles yet — catch some more bugs!', 2200); return; }
      if (res !== 'ok') return;
      delete this.tryOn[kind];
      GG.Sfx.coin(); GG.UI.refreshHud();
      GG.UI.toast('Bought the ' + o.name + '!', 1800);
      this.buildGrid(); this.refreshBar(); this.drawRoom();
    },

    tapRoom: function (x, y) {
      var H = GG.House, res, def;
      if (this.mode === 'place') {
        def = D().byId.item[this.sel];
        /* she taps the middle of where it should stand */
        res = H.placeItem(this.sel, x, y + (def.wall ? def.ht / 2 : def.fd / 2));
        if (!res.ok) { this.oops(res.reason, def); return; }
        if (res.bought) { GG.Sfx.coin(); GG.UI.refreshHud(); } else GG.Sfx.click();
        GG.UI.toast((def.wall ? 'Hung up the ' : 'Put down the ') + def.name + '!', 1600);
        this.mode = null; this.sel = null; this.picked = res.index;
        this.buildGrid(); this.refreshBar(); this.drawRoom();
        return;
      }
      if (this.mode === 'move' && this.picked >= 0) {
        def = D().byId.item[H.items()[this.picked].id];
        res = H.moveItem(this.picked, x, y + (def.wall ? def.ht / 2 : def.fd / 2));
        if (!res.ok) { this.oops(res.reason, def); return; }
        GG.Sfx.click();
        this.mode = null;
        this.refreshBar(); this.drawRoom();
        return;
      }
      /* otherwise a tap on one of her things picks it up */
      var i = H.itemAt(x, y);
      if (i >= 0) {
        GG.Sfx.click();
        if (this.kind !== 'item') { this.kind = 'item'; this.setKind('item'); }
        this.picked = i; this.mode = null;
        this.refreshBar(); this.drawRoom();
      } else if (this.picked >= 0) {
        this.picked = -1; this.refreshBar(); this.drawRoom();
      }
    },

    oops: function (reason, def) {
      var msg = {
        short: 'Not enough sparkles yet — catch some more bugs!',
        full: 'Your room is full! Put something back in the box first.',
        nowhere: def && def.wall ? 'No room on the wall there — try another spot' : 'No room there — try another spot'
      }[reason] || 'That will not fit there';
      GG.UI.toast(msg, 2200);
    }
  };
})(window.GG = window.GG || {});
