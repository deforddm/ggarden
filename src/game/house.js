/* Inside Guin's cottage: the Critter Compendium on its bookshelf, the tank
   table, the decoration chest, a fireplace, and her own bed.

   v1.16 - David: "make the inside of the house feel more true to the
   player's dimensions. It feels like a giant's home currently." It did: the
   bed was five Guins long and the front door twice her height. The whole room
   is now built to her scale, at about 45 pixels to the metre (Guin is a child
   of about 1.2 m and ~56 px): a 1.9 m bed, a door she could walk through, a
   bookshelf a little taller than she is. The room is drawn at the same zoom as
   the world outside, so she is exactly the same size indoors. */
(function (GG) {
  'use strict';

  var W = 560, H = 440;
  var FLOOR = 112;          // where the back wall stops and the floorboards start
  var SIDE = 14;            // thickness of the side and front walls
  var BACK = FLOOR + 16;    // furniture along the back wall stands out this far

  /* the solid things on the floor, as rectangles (the back-wall furniture is
     covered by BACK) */
  var BED = { x0: 468, x1: W - SIDE, y0: 244, y1: 344 };
  var PLANT = { x0: SIDE, x1: 58, y0: 360, y1: 396 };
  var DOOR = { x: 280, w: 46 };

  var House = GG.House = {
    W: W, H: H, FLOOR: FLOOR,
    START: { x: 280, y: H - 96 },   // a step in from the door, so a double tap does not walk her straight back out

    spots: [
      { id: 'book', x: 62, y: FLOOR + 22, w: 64, h: 32, label: 'Critter Compendium' },
      { id: 'terrarium', x: 378, y: FLOOR + 24, w: 96, h: 32, label: 'My Tanks' },
      { id: 'shop', x: 482, y: FLOOR + 24, w: 54, h: 32, label: 'Decoration Box' },
      { id: 'bed', x: (BED.x0 + BED.x1) / 2, y: (BED.y0 + BED.y1) / 2, w: BED.x1 - BED.x0 + 8, h: BED.y1 - BED.y0 + 8, label: 'Bed \u2014 have a nap' },
      { id: 'door', x: DOOR.x, y: H - 22, w: DOOR.w + 8, h: 26, label: 'Go Outside' }
    ],

    blocked: function (x, y, rad) {
      rad = rad || 0;
      if (x < SIDE + rad || x > W - SIDE - rad) return true;
      if (y < BACK + rad * 0.6) return true;
      if (y > H - SIDE - rad * 0.6) return true;
      if (x > BED.x0 - rad && x < BED.x1 + rad && y > BED.y0 - rad * 0.6 && y < BED.y1 + rad * 0.4) return true;
      if (x < PLANT.x1 + rad && y > PLANT.y0 - rad * 0.6 && y < PLANT.y1 + rad * 0.4) return true;
      return false;
    },

    /* The nearest place to (x, y) where something of this size can stand -
       for putting a friend back on the floor if it ever ends up inside the
       bed or the wall. */
    freeNear: function (x, y, rad) {
      if (!this.blocked(x, y, rad)) return { x: x, y: y };
      for (var r = 6; r < 400; r += 6) {
        for (var a = 0; a < Math.PI * 2; a += 0.3) {
          var nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r;
          if (!this.blocked(nx, ny, rad)) return { x: nx, y: ny };
        }
      }
      return { x: this.START.x, y: this.START.y - 60 };
    },

    /* Open floor, spread about the room and clear of the furniture and the
       doorway, for the friends waiting at home. */
    homeSpots: function (rad) {
      var out = [];
      for (var y = BACK + 36; y < H - 40; y += 54) {
        for (var x = SIDE + 44; x < W - SIDE - 30; x += 62) {
          if (this.blocked(x, y, rad)) continue;
          if (GG.dist(x, y, this.START.x, this.START.y) < 70) continue;
          out.push({ x: x, y: y });
        }
      }
      return out;
    },

    nearest: function (px, py) {
      var best = null, bd = 1e9;
      for (var i = 0; i < this.spots.length; i++) {
        var s = this.spots[i];
        var dx = Math.max(0, Math.abs(px - s.x) - s.w / 2);
        var dy = Math.max(0, Math.abs(py - s.y) - s.h / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 24 && d < bd) { bd = d; best = s; }
      }
      return best;
    },

    draw: function (c, cam, t) {
      c.save();
      c.translate(-cam.x, -cam.y);
      var night = GG.Time.isDark();
      var i;

      /* ---- floor ---- */
      c.save();
      c.beginPath(); c.rect(0, FLOOR, W, H - FLOOR); c.clip();
      c.fillStyle = '#c69a6b';
      c.fillRect(0, FLOOR, W, H - FLOOR);
      c.fillStyle = '#b98c5f';
      for (var y = FLOOR + 18; y < H; y += 18) c.fillRect(0, y, W, 1.5);       // boards ~40 cm
      for (var row = 0; FLOOR + row * 18 < H; row++) {
        for (var bx = (row % 2) * 46; bx < W; bx += 92) c.fillRect(bx, FLOOR + row * 18, 1.5, 18);
      }
      c.restore();

      /* ---- back wall ---- */
      c.fillStyle = '#e9d3b4';
      c.fillRect(0, 0, W, FLOOR);
      c.fillStyle = '#dfc6a2';
      for (i = 0; i < W; i += 26) c.fillRect(i, 0, 1.5, FLOOR - 8);         // tongue and groove
      c.fillStyle = '#b98f63';
      c.fillRect(0, FLOOR - 8, W, 8);                                        // skirting board
      c.fillStyle = '#d2b48c';
      c.fillRect(0, 0, W, 6);                                                // picture rail

      /* ---- rug ---- */
      c.fillStyle = '#8fc7d8';
      c.beginPath(); c.ellipse(262, 290, 74, 44, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#a9d9e6';
      c.beginPath(); c.ellipse(262, 290, 56, 32, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8fc7d8';
      c.beginPath(); c.ellipse(262, 290, 34, 19, 0, 0, Math.PI * 2); c.fill();

      /* ---- window: 1.2 m wide, with the real time of day in it ---- */
      var wx = 136, wy = 24, ww = 56, wh = 46;
      c.fillStyle = '#8a6a45';
      GG.roundRect(c, wx - 4, wy - 4, ww + 8, wh + 8, 4); c.fill();
      c.fillStyle = night ? '#20306a' : '#a7dcf4';
      c.fillRect(wx, wy, ww, wh);
      if (night) {
        c.fillStyle = '#fff6c4';
        c.beginPath(); c.arc(wx + 40, wy + 13, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#dfe8ff';
        for (var s = 0; s < 7; s++) c.fillRect(wx + 4 + (s * 17) % 48, wy + 4 + (s * 11) % 38, 1.5, 1.5);
      } else {
        c.fillStyle = '#7fc46a'; c.fillRect(wx, wy + wh - 12, ww, 12);
        c.fillStyle = '#ffe98a';
        c.beginPath(); c.arc(wx + 42, wy + 12, 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.ellipse(wx + 16, wy + 14, 9, 4, 0, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = '#8a6a45'; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh);
      c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2);
      c.stroke();
      c.fillStyle = '#9a6f43'; c.fillRect(wx - 6, wy + wh + 3, ww + 12, 4);   // sill

      /* ---- fireplace, 1.4 m across, with a real little fire ---- */
      var fx = 232, fw = 64;
      c.fillStyle = '#b3a494';
      c.fillRect(fx, FLOOR - 56, fw, 56 + 10);
      c.fillStyle = '#a09080';
      for (var bk = 0; bk < 7; bk++) {
        for (var bc = 0; bc < 4; bc++) {
          c.fillRect(fx + 2 + bc * 16 + (bk % 2) * 8, FLOOR - 54 + bk * 9, 14, 1.2);
        }
      }
      c.fillStyle = '#8a5f36';
      c.fillRect(fx - 6, FLOOR - 60, fw + 12, 7);                              // mantel
      c.fillStyle = '#2b1f18';
      GG.roundRect(c, fx + 14, FLOOR - 34, fw - 28, 34, 10); c.fill();       // firebox
      c.fillStyle = '#6b4a2e';
      c.fillRect(fx + 18, FLOOR - 6, fw - 36, 4);                             // log
      var fl = 0.5 + 0.5 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 1);
      c.fillStyle = 'rgba(255,150,40,0.95)';
      c.beginPath();
      c.moveTo(fx + 22, FLOOR - 5); c.quadraticCurveTo(fx + 26, FLOOR - 20 - fl * 5, fx + 32, FLOOR - 26 - fl * 3);
      c.quadraticCurveTo(fx + 38, FLOOR - 18 - fl * 4, fx + 42, FLOOR - 5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,230,120,0.95)';
      c.beginPath();
      c.moveTo(fx + 27, FLOOR - 5); c.quadraticCurveTo(fx + 30, FLOOR - 14 - fl * 3, fx + 32, FLOOR - 17 - fl * 2);
      c.quadraticCurveTo(fx + 35, FLOOR - 12 - fl * 2, fx + 37, FLOOR - 5); c.closePath(); c.fill();
      c.fillStyle = '#8f8274';
      c.fillRect(fx - 4, FLOOR + 6, fw + 8, 8);                               // hearth stone
      /* a warm glow on the floor in front of it */
      var g = c.createRadialGradient(fx + fw / 2, FLOOR + 14, 4, fx + fw / 2, FLOOR + 14, 80);
      g.addColorStop(0, 'rgba(255,170,70,' + (0.22 + fl * 0.06).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,170,70,0)');
      c.fillStyle = g; c.fillRect(fx - 60, FLOOR, fw + 120, 100);
      /* a little clock and a candle on the mantel, for the sense of size */
      c.fillStyle = '#f2e6cf'; c.fillRect(fx + 6, FLOOR - 68, 5, 8);
      c.fillStyle = '#ffd45c'; c.beginPath(); c.ellipse(fx + 8.5, FLOOR - 70, 1.6, 2.4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#c98f56'; GG.roundRect(c, fx + fw - 18, FLOOR - 72, 12, 12, 3); c.fill();
      c.fillStyle = '#fff6e0'; c.beginPath(); c.arc(fx + fw - 12, FLOOR - 66, 4, 0, Math.PI * 2); c.fill();

      /* ---- bookshelf: 1.2 m wide, a little taller than Guin ---- */
      var sx0 = 32, sw = 60, stop = FLOOR - 58, sbase = FLOOR + 14;
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, sx0, stop, sw, sbase - stop, 3); c.fill();
      c.fillStyle = '#7d5733';
      c.fillRect(sx0 + 3, stop + 3, sw - 6, sbase - stop - 6);
      var bookCols = ['#d2584f', '#e0a34a', '#5f9ed6', '#78bb63', '#b57fd1', '#e07f9c', '#6fb2a8'];
      for (var shelf = 0; shelf < 3; shelf++) {
        var sy = stop + 5 + shelf * 19;
        var bxp = sx0 + 5, k = shelf * 3;
        while (bxp < sx0 + sw - 8) {
          var bw = 4 + ((k * 7) % 3);
          var bh = 12 + ((k * 5) % 4);
          c.fillStyle = bookCols[k % bookCols.length];
          c.fillRect(bxp, sy + (16 - bh), bw, bh);
          bxp += bw + 1; k++;
        }
        c.fillStyle = '#9a6f43'; c.fillRect(sx0 + 3, sy + 16, sw - 6, 3);
      }
      /* the Collections sign across the bottom shelf */
      c.fillStyle = '#f2e6cf';
      GG.roundRect(c, sx0 + 3, sbase - 17, sw - 6, 14, 3); c.fill();
      c.fillStyle = '#4b6b3a';
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      var fs = 11;
      do {
        c.font = 'bold ' + fs + 'px "Trebuchet MS", sans-serif';
      } while (c.measureText('Collections').width > sw - 12 && --fs > 6);
      c.fillText('Collections', sx0 + sw / 2, sbase - 6);

      /* ---- tank table: 2 m long, waist height to a grown-up ---- */
      var tx0 = 330, tw = 96, ttop = FLOOR - 20, tbase = FLOOR + 14;
      c.fillStyle = '#8a5f36';
      c.fillRect(tx0 + 5, ttop + 6, 5, tbase - ttop - 6);
      c.fillRect(tx0 + tw - 10, ttop + 6, 5, tbase - ttop - 6);
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, tx0, ttop, tw, 8, 3); c.fill();
      var tanks = GG.Save.data.terrariums;
      for (var tk = 0; tk < Math.min(3, tanks.length); tk++) {
        var gx = tx0 + 5 + tk * 30, gw = 26, gh = 20, gy = ttop - gh, type = tanks[tk].type || 'terrarium';
        c.save();
        GG.roundRect(c, gx, gy, gw, gh, 3); c.clip();
        if (type === 'aquarium') {
          c.fillStyle = '#8fd3ea'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#3f93b8'; c.fillRect(gx, gy + 12, gw, 8);
          c.fillStyle = '#e3d6a8'; c.fillRect(gx + 1, gy + 16, gw - 2, 4);
        } else if (type === 'hybrid') {
          c.fillStyle = '#cfeeff'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#8ecf63'; c.fillRect(gx, gy + 8, gw, 4);
          c.fillStyle = '#7fc4d2'; c.fillRect(gx, gy + 12, gw, 8);
        } else if (type === 'habitat') {
          c.fillStyle = '#cfeeff'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#6fae52'; c.fillRect(gx, gy + 8, gw, 4);
          c.fillStyle = '#8ecf63'; c.fillRect(gx, gy + 12, gw, 8);
        } else {
          c.fillStyle = 'rgba(180,230,255,0.55)'; c.fillRect(gx, gy, gw, gh);
          c.fillStyle = '#7fc46a'; c.fillRect(gx, gy + 13, gw, 7);
        }
        c.restore();
        c.strokeStyle = '#cfe9f5'; c.lineWidth = 1.2;
        GG.roundRect(c, gx, gy, gw, gh, 3); c.stroke();
      }

      /* ---- decoration chest: a toy box, knee high ---- */
      var cx0 = 460, cw = 44, cbase = FLOOR + 14;
      c.fillStyle = '#c98f56';
      GG.roundRect(c, cx0, cbase - 24, cw, 24, 3); c.fill();
      c.fillStyle = '#e0a86c';
      GG.roundRect(c, cx0 - 2, cbase - 31, cw + 4, 9, 3); c.fill();
      c.fillStyle = '#8a5f36'; c.fillRect(cx0 + cw / 2 - 3, cbase - 24, 6, 8);
      c.fillStyle = '#ffd45c';
      c.beginPath(); c.arc(cx0 + cw / 2, cbase - 16, 2.4, 0, Math.PI * 2); c.fill();

      /* ---- her bed: a real single bed, 1.9 m by 0.9 m ---- */
      c.fillStyle = '#9a6f43';
      GG.roundRect(c, BED.x0, BED.y0 - 8, BED.x1 - BED.x0, BED.y1 - BED.y0 + 8, 5); c.fill();  // frame + headboard
      c.fillStyle = '#f6eadf';
      GG.roundRect(c, BED.x0 + 4, BED.y0, BED.x1 - BED.x0 - 8, 22, 5); c.fill();                // pillow
      c.fillStyle = '#e07f9c';
      GG.roundRect(c, BED.x0 + 3, BED.y0 + 20, BED.x1 - BED.x0 - 6, BED.y1 - BED.y0 - 23, 5); c.fill(); // quilt
      c.fillStyle = '#f09cb4';
      GG.roundRect(c, BED.x0 + 3, BED.y0 + 20, BED.x1 - BED.x0 - 6, 9, 3); c.fill();          // turned-down sheet
      c.fillStyle = 'rgba(255,255,255,0.35)';
      for (var q = 0; q < 3; q++) c.fillRect(BED.x0 + 8 + q * 13, BED.y0 + 40, 2, BED.y1 - BED.y0 - 48);
      /* a bedside rug */
      c.fillStyle = '#e8c870';
      GG.roundRect(c, BED.x0 - 30, BED.y0 + 30, 24, 40, 6); c.fill();

      /* ---- potted plant in the corner ---- */
      c.fillStyle = '#c4703f';
      GG.roundRect(c, PLANT.x0 + 12, PLANT.y1 - 20, 24, 20, 4); c.fill();
      GG.Props.bush(c, PLANT.x0 + 24, PLANT.y1 - 18, 20, t, 0.4);

      /* ---- side and front walls, with the doorway in the front one ---- */
      c.fillStyle = '#b3906a';
      c.fillRect(0, 0, SIDE, H);
      c.fillRect(W - SIDE, 0, SIDE, H);
      c.fillRect(0, H - SIDE, DOOR.x - DOOR.w / 2, SIDE);
      c.fillRect(DOOR.x + DOOR.w / 2, H - SIDE, W - DOOR.x - DOOR.w / 2, SIDE);
      c.fillStyle = '#9d7b57';
      c.fillRect(SIDE - 2, 0, 2, H - SIDE); c.fillRect(W - SIDE, 0, 2, H - SIDE);
      /* the doorway: open, with the doormat and daylight (or night) outside */
      c.fillStyle = night ? '#223066' : '#9fd87a';
      c.fillRect(DOOR.x - DOOR.w / 2, H - SIDE, DOOR.w, SIDE);
      c.fillStyle = '#8a5f36';
      c.fillRect(DOOR.x - DOOR.w / 2 - 3, H - SIDE, 3, SIDE);
      c.fillRect(DOOR.x + DOOR.w / 2, H - SIDE, 3, SIDE);
      c.fillStyle = '#a9743f';
      GG.roundRect(c, DOOR.x - 20, H - SIDE - 16, 40, 13, 3); c.fill();       // doormat
      c.fillStyle = '#8a5f36';
      c.font = 'bold 8px "Trebuchet MS", sans-serif'; c.textAlign = 'center';
      c.fillText('HELLO', DOOR.x, H - SIDE - 6.5);

      c.restore();
    }
  };
})(window.GG = window.GG || {});
