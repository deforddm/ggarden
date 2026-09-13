/* Inside Guin's cottage: the bug book, the terrarium table, the decoration box and a cosy bed.
   The room is drawn at the same scale as the world outside, so Guin is the same size indoors. */
(function (GG) {
  'use strict';

  var W = 840, H = 640;
  var FLOOR = 214;          // where the wall stops and the floorboards start

  var House = GG.House = {
    W: W, H: H, FLOOR: FLOOR,
    START: { x: 415, y: 580 },

    spots: [
      { id: 'book', x: 145, y: 200, w: 116, h: 86, label: 'Bug Book' },
      { id: 'terrarium', x: 410, y: 186, w: 186, h: 84, label: 'Terrariums' },
      { id: 'shop', x: 675, y: 200, w: 116, h: 84, label: 'Decoration Box' },
      { id: 'bed', x: 730, y: 430, w: 150, h: 250, label: 'Bed' },
      { id: 'door', x: 415, y: 624, w: 116, h: 36, label: 'Go Outside' }
    ],

    blocked: function (x, y, rad) {
      if (x < 52 + rad || x > W - 52 - rad) return true;
      if (y < FLOOR + rad) return true;
      if (y > H - 16 - rad) return true;
      if (x > 644 - rad && y > 326 - rad && y < 604) return true;   // the bed
      if (x < 132 + rad && y > 372 - rad && y < 430) return true;   // the potted plant
      return false;
    },

    nearest: function (px, py) {
      var best = null, bd = 1e9;
      for (var i = 0; i < this.spots.length; i++) {
        var s = this.spots[i];
        var dx = Math.max(0, Math.abs(px - s.x) - s.w / 2);
        var dy = Math.max(0, Math.abs(py - s.y) - s.h / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 64 && d < bd) { bd = d; best = s; }
      }
      return best;
    },

    draw: function (c, cam, t) {
      c.save();
      c.translate(-cam.x, -cam.y);

      /* ---- wall ---- */
      c.fillStyle = '#e9d3b4';
      c.fillRect(0, 0, W, FLOOR);
      c.fillStyle = '#dcc19c';
      for (var i = 0; i < W; i += 52) c.fillRect(i, 0, 2, FLOOR);
      c.fillStyle = '#c9a97f';
      c.fillRect(0, FLOOR - 14, W, 14);

      /* ---- floor ---- */
      c.fillStyle = '#c69a6b';
      c.fillRect(0, FLOOR, W, H - FLOOR);
      c.fillStyle = '#b98c5f';
      for (var y = FLOOR + 6; y < H; y += 40) c.fillRect(0, y, W, 3);
      for (var x = 0; x < W; x += 106) c.fillRect(x, FLOOR, 2, H - FLOOR);

      /* ---- rug ---- */
      c.fillStyle = '#8fc7d8';
      c.beginPath(); c.ellipse(380, 432, 178, 104, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#a9d9e6';
      c.beginPath(); c.ellipse(380, 432, 138, 78, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8fc7d8';
      c.beginPath(); c.ellipse(380, 432, 90, 48, 0, 0, Math.PI * 2); c.fill();

      /* ---- window, with the real time of day showing through ---- */
      var night = GG.Time.isDark();
      c.fillStyle = '#8a6a45';
      GG.roundRect(c, 330, 30, 142, 104, 7); c.fill();
      c.fillStyle = night ? '#20306a' : '#a7dcf4';
      c.fillRect(337, 37, 128, 90);
      if (night) {
        c.fillStyle = '#fff6c4';
        c.beginPath(); c.arc(434, 62, 11, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#dfe8ff';
        for (var s = 0; s < 11; s++) c.fillRect(342 + (s * 41) % 116, 42 + (s * 27) % 74, 2, 2);
      } else {
        c.fillStyle = '#7fc46a'; c.fillRect(337, 98, 128, 29);
        c.fillStyle = '#ffe98a';
        c.beginPath(); c.arc(438, 58, 12, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.ellipse(372, 62, 21, 9, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(392, 57, 14, 7, 0, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = '#8a6a45'; c.lineWidth = 6;
      c.beginPath();
      c.moveTo(401, 37); c.lineTo(401, 127);
      c.moveTo(337, 82); c.lineTo(465, 82);
      c.stroke();

      /* ---- bookshelf (the Bug Book) ---- */
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, 92, 112, 108, 96, 5); c.fill();
      c.fillStyle = '#7d5733'; c.fillRect(97, 156, 98, 6);
      var bookCols = ['#d2584f', '#e0a34a', '#5f9ed6', '#78bb63', '#b57fd1'];
      for (var b = 0; b < 5; b++) {
        c.fillStyle = bookCols[b];
        c.fillRect(102 + b * 19, 121, 14, 35);
      }
      c.fillStyle = '#f2e6cf';
      GG.roundRect(c, 104, 166, 84, 34, 4); c.fill();
      c.fillStyle = '#4b6b3a';
      c.font = 'bold 16px "Trebuchet MS", sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillText('BUGS', 146, 190);

      /* ---- terrarium table ---- */
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, 320, 152, 180, 54, 6); c.fill();
      c.fillStyle = '#8a5f36'; c.fillRect(334, 204, 12, 18); c.fillRect(474, 204, 12, 18);
      var tanks = GG.Save.data.terrariums;
      for (var k = 0; k < Math.min(3, tanks.length); k++) {
        var tx = 336 + k * 58, type = tanks[k].type || 'terrarium';
        c.save();
        GG.roundRect(c, tx, 112, 46, 42, 5); c.clip();
        if (type === 'aquarium') {
          c.fillStyle = '#8fd3ea'; c.fillRect(tx, 112, 46, 42);
          c.fillStyle = '#3f93b8'; c.fillRect(tx, 138, 46, 16);
          c.fillStyle = '#e3d6a8'; c.fillRect(tx + 2, 146, 42, 8);
        } else if (type === 'hybrid') {
          c.fillStyle = '#cfeeff'; c.fillRect(tx, 112, 46, 42);
          c.fillStyle = '#8ecf63'; c.fillRect(tx, 130, 46, 8);
          c.fillStyle = '#7fc4d2'; c.fillRect(tx, 138, 46, 16);
          c.fillStyle = '#dfd2a4'; c.fillRect(tx + 2, 149, 42, 5);
        } else {
          c.fillStyle = 'rgba(180,230,255,0.55)'; c.fillRect(tx, 112, 46, 42);
          c.fillStyle = '#7fc46a'; c.fillRect(tx, 139, 46, 15);
        }
        c.restore();
        c.strokeStyle = '#cfe9f5'; c.lineWidth = 2;
        GG.roundRect(c, tx, 112, 46, 42, 5); c.stroke();
      }

      /* ---- decoration box ---- */
      c.fillStyle = '#c98f56';
      GG.roundRect(c, 622, 160, 100, 56, 6); c.fill();
      c.fillStyle = '#e0a86c';
      GG.roundRect(c, 617, 146, 110, 24, 6); c.fill();
      c.fillStyle = '#8a5f36'; c.fillRect(665, 170, 12, 18);
      c.fillStyle = '#ffd45c';
      c.beginPath(); c.arc(671, 185, 6, 0, Math.PI * 2); c.fill();

      /* ---- bed ---- */
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, 656, 326, 136, 278, 12); c.fill();
      c.fillStyle = '#f6eadf';
      GG.roundRect(c, 664, 334, 120, 68, 9); c.fill();
      c.fillStyle = '#e07f9c';
      GG.roundRect(c, 664, 382, 120, 214, 9); c.fill();
      c.fillStyle = '#f09cb4';
      GG.roundRect(c, 664, 430, 120, 26, 5); c.fill();

      /* ---- potted plant ---- */
      c.fillStyle = '#c4703f';
      GG.roundRect(c, 68, 380, 56, 50, 7); c.fill();
      GG.Props.bush(c, 96, 382, 42, t, 0.4);

      /* ---- door ---- */
      c.fillStyle = '#8a5f36';
      GG.roundRect(c, 358, 600, 116, 40, 7); c.fill();
      c.fillStyle = '#a9743f';
      GG.roundRect(c, 365, 607, 102, 33, 6); c.fill();
      c.fillStyle = '#ffd45c';
      c.beginPath(); c.arc(452, 623, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5b432a';
      c.font = 'bold 14px "Trebuchet MS", sans-serif'; c.textAlign = 'center';
      c.fillText('outside', 415, 629);

      c.restore();
    }
  };
})(window.GG = window.GG || {});
