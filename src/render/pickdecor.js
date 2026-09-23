/* One decoration for every pickable, so each new fruit, berry, vegetable or
   flower unlocks something to put in a tank without a hand-drawn decor each:
     fruit      -> a woven basket heaped with it
     berries    -> a punnet heaped with them
     vegetables -> a wooden crate of them, or a big one sitting on straw
     flowers    -> a glass jar with three blooms
   GG.pickDecorArt(def) returns a decor draw function (c, x, y, s, t) with the
   base on the ground at (x, y), about 26px tall at s = 1, like decorart.js.
   GG.pickDecorName(def) gives its name ('Basket of Peaches'); def.decorName wins. */
(function (GG) {
  'use strict';

  var TAU = Math.PI * 2;

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); c.fill();
  }
  function sh(col, amt) {
    return (typeof col === 'string' && col.charAt(0) === '#' && col.length === 7) ? GG.shade(col, amt) : col;
  }

  var BERRY_SHAPES = { berry: 1, bramble: 1, strig: 1, straw: 1, umbel: 1, baneberry: 1, goose: 1, nightshade: 1, spike: 1, hip: 1 };
  var BIG_VEG = { pumpkin: 1, melon: 1, watermelon: 1, squash: 1, gourd: 1 };
  /* vegetables that look best lying down in the crate */
  var LYING = { carrot: 1, zucchini: 1, corn: 1, spear: 1, parsnip: 1, cucumber: 1, leek: 1 };

  function kindOf(def) {
    if (!def) return 'fruit';
    if (def.kind === 'flower' || def.on === 'flower' || def.petal) return 'flower';
    if (def.kind === 'veg' || def.on === 'veg') return (def.big || BIG_VEG[def.shape]) ? 'bigveg' : 'veg';
    if (def.kind === 'berry') return 'berry';
    if (def.kind === 'fruit') return 'fruit';
    return BERRY_SHAPES[def.shape] ? 'berry' : 'fruit';
  }

  function item(c, def, x, y, sc, rot, t) {
    c.save();
    c.translate(x, y);
    if (rot) c.rotate(rot);
    GG.FruitArt.draw(c, def, 0, 0, sc, t || 0);
    c.restore();
  }

  /* ---------- containers ---------- */

  function basketBack(c, x, y, s) {
    /* the handle, behind the fruit */
    c.strokeStyle = '#9a7442'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 10.5 * s, y - 11 * s);
    c.quadraticCurveTo(x, y - 43 * s, x + 10.5 * s, y - 11 * s);
    c.stroke();
    c.strokeStyle = '#c49a5e'; c.lineWidth = 0.7 * s;
    c.beginPath();
    c.moveTo(x - 10.5 * s, y - 11.4 * s);
    c.quadraticCurveTo(x, y - 43.4 * s, x + 10.5 * s, y - 11.4 * s);
    c.stroke();
    c.fillStyle = '#8a6438'; ell(c, x, y - 12 * s, 12 * s, 2.6 * s);
  }
  function basketFront(c, x, y, s) {
    c.fillStyle = '#c49a5e';
    c.beginPath();
    c.moveTo(x - 12.6 * s, y - 12 * s);
    c.quadraticCurveTo(x - 11 * s, y, x, y);
    c.quadraticCurveTo(x + 11 * s, y, x + 12.6 * s, y - 12 * s);
    c.closePath(); c.fill();
    c.save();
    c.beginPath();
    c.moveTo(x - 12.6 * s, y - 12 * s);
    c.quadraticCurveTo(x - 11 * s, y, x, y);
    c.quadraticCurveTo(x + 11 * s, y, x + 12.6 * s, y - 12 * s);
    c.closePath(); c.clip();
    /* the weave: rows of little over-and-under bumps */
    for (var row = 0; row < 4; row++) {
      var yy = y - 10.2 * s + row * 3 * s;
      for (var k = -5; k <= 5; k++) {
        c.fillStyle = (k + row) % 2 ? '#d8b276' : '#ad844c';
        ell(c, x + k * 2.6 * s + (row % 2 ? 1.3 * s : 0), yy, 1.4 * s, 1.1 * s);
      }
    }
    c.fillStyle = 'rgba(80,50,20,0.18)';
    c.fillRect(x - 13 * s, y - 3.5 * s, 26 * s, 4 * s);
    c.restore();
    c.fillStyle = '#9a7442';
    GG.roundRect(c, x - 13.2 * s, y - 13.4 * s, 26.4 * s, 2.6 * s, 1.3 * s); c.fill();
    c.fillStyle = '#b8905a';
    for (var q = -4; q <= 4; q++) ell(c, x + q * 3 * s, y - 12.1 * s, 1.3 * s, 0.9 * s, 0.6);
  }

  function punnetBack(c, x, y, s) {
    c.fillStyle = '#a3814c'; ell(c, x, y - 12 * s, 12 * s, 2.2 * s);
  }
  function punnetFront(c, x, y, s) {
    c.fillStyle = '#c9a469';
    c.beginPath();
    c.moveTo(x - 12.6 * s, y - 12.4 * s);
    c.lineTo(x - 9.6 * s, y);
    c.lineTo(x + 9.6 * s, y);
    c.lineTo(x + 12.6 * s, y - 12.4 * s);
    c.closePath(); c.fill();
    c.strokeStyle = '#a3814c'; c.lineWidth = 0.9 * s;
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * 4.8 * s, y - 12 * s);
      c.lineTo(x + i * 3.7 * s, y - 0.6 * s);
      c.stroke();
    }
    /* a little paper label */
    c.fillStyle = '#f4ecd8';
    GG.roundRect(c, x - 4.2 * s, y - 8.4 * s, 8.4 * s, 4.4 * s, 0.8 * s); c.fill();
    c.fillStyle = '#b8935c';
    GG.roundRect(c, x - 13.2 * s, y - 14.6 * s, 26.4 * s, 2.8 * s, 1.2 * s); c.fill();
  }

  function crateBack(c, x, y, s) {
    c.fillStyle = '#6b4a2c';
    c.fillRect(x - 12 * s, y - 15 * s, 24 * s, 3 * s);
  }
  function crateFront(c, x, y, s) {
    c.fillStyle = '#8a6438';
    GG.roundRect(c, x - 13.5 * s, y - 13 * s, 27 * s, 13 * s, 1.4 * s); c.fill();
    c.fillStyle = '#a57d4c';
    for (var i = 0; i < 3; i++) c.fillRect(x - 12.4 * s, y - 12.2 * s + i * 4.1 * s, 24.8 * s, 2.6 * s);
    c.fillStyle = 'rgba(60,35,15,0.35)';
    for (i = 0; i < 3; i++) ell(c, x - 8 * s + i * 7 * s, y - 10.9 * s + (i % 2) * 4.1 * s, 0.5 * s, 0.5 * s);
    c.fillStyle = '#6b4a2c';
    c.fillRect(x - 13.5 * s, y - 13.6 * s, 2.4 * s, 13.6 * s);
    c.fillRect(x + 11.1 * s, y - 13.6 * s, 2.4 * s, 13.6 * s);
  }

  function straw(c, x, y, s, front) {
    var rnd = GG.mulberry32(front ? 91 : 37);
    if (!front) {
      c.fillStyle = '#c9a24a'; ell(c, x, y - 2.4 * s, 15 * s, 3.6 * s);
      c.fillStyle = '#e0c068'; ell(c, x, y - 3.2 * s, 13.4 * s, 2.8 * s);
    }
    c.strokeStyle = front ? '#e8cd78' : '#b8903c'; c.lineWidth = 0.7 * s; c.lineCap = 'round';
    for (var i = 0; i < (front ? 9 : 16); i++) {
      var sx = x + (rnd() - 0.5) * 28 * s, sy = y - (front ? 0.6 : 2) * s - rnd() * (front ? 2.4 : 4) * s;
      var a = (rnd() - 0.5) * 1.2;
      c.beginPath();
      c.moveTo(sx - Math.cos(a) * 3.4 * s, sy - Math.sin(a) * 3.4 * s);
      c.lineTo(sx + Math.cos(a) * 3.4 * s, sy + Math.sin(a) * 3.4 * s);
      c.stroke();
    }
  }

  /* a short, fat glass jar: 11 tall, so the flowers stand well out of it */
  var JH = 11;
  function jarBack(c, x, y, s) {
    c.fillStyle = 'rgba(206,232,240,0.45)';
    GG.roundRect(c, x - 7.5 * s, y - JH * s, 15 * s, JH * s, 3 * s); c.fill();
    /* water */
    c.fillStyle = 'rgba(126,186,214,0.35)';
    GG.roundRect(c, x - 7 * s, y - 6.6 * s, 14 * s, 6.2 * s, 2.6 * s); c.fill();
  }
  function jarFront(c, x, y, s) {
    c.fillStyle = 'rgba(126,186,214,0.22)';
    GG.roundRect(c, x - 7 * s, y - 6.6 * s, 14 * s, 6.2 * s, 2.6 * s); c.fill();
    c.strokeStyle = 'rgba(150,188,200,0.95)'; c.lineWidth = 0.9 * s;
    GG.roundRect(c, x - 7.5 * s, y - JH * s, 15 * s, JH * s, 3 * s); c.stroke();
    c.strokeStyle = 'rgba(200,230,240,0.9)'; c.lineWidth = 0.6 * s;
    c.beginPath(); c.moveTo(x - 7 * s, y - 6.6 * s); c.lineTo(x + 7 * s, y - 6.6 * s); c.stroke();
    /* the thick glass rim, a ribbon bow, and a shine down the side */
    c.fillStyle = 'rgba(186,216,228,0.95)';
    GG.roundRect(c, x - 8 * s, y - (JH + 1.4) * s, 16 * s, 2.4 * s, 1.2 * s); c.fill();
    c.fillStyle = '#e8708a';
    c.fillRect(x - 7.4 * s, y - (JH - 1.6) * s, 14.8 * s, 1.5 * s);
    ell(c, x + 3.2 * s, y - (JH - 2.35) * s, 1.6 * s, 1.1 * s, -0.5);
    ell(c, x + 5.6 * s, y - (JH - 2.35) * s, 1.6 * s, 1.1 * s, 0.5);
    c.fillStyle = '#c85070'; ell(c, x + 4.4 * s, y - (JH - 2.35) * s, 0.7 * s, 0.7 * s);
    c.fillStyle = 'rgba(255,255,255,0.55)';
    GG.roundRect(c, x - 5.8 * s, y - (JH - 3) * s, 1.4 * s, (JH - 4.6) * s, 0.7 * s); c.fill();
    c.fillStyle = 'rgba(80,110,120,0.18)';
    ell(c, x, y - 0.4 * s, 7 * s, 1 * s);
  }

  /* ---------- the four kinds ---------- */

  function drawBasket(c, def, x, y, s, t) {
    basketBack(c, x, y, s);
    var sc = 0.46 * s;
    [[-5.6, -14.4, -0.25], [5.6, -14.2, 0.3], [0, -15.4, 0.05], [-2.6, -20.2, -0.1], [3.4, -20, 0.2]]
      .forEach(function (q, i) { if (i < 4 || def.shape !== 'grapes') item(c, def, x + q[0] * s, y + q[1] * s, sc, q[2], t); });
    basketFront(c, x, y, s);
  }

  function drawPunnet(c, def, x, y, s, t) {
    punnetBack(c, x, y, s);
    var sc = 0.4 * s;
    [[-6, -16.4, -0.2], [6.2, -16.2, 0.25], [0, -17.4, 0], [-3, -21.6, -0.1], [3.4, -21.4, 0.15]]
      .forEach(function (q) { item(c, def, x + q[0] * s, y + q[1] * s, sc, q[2], t); });
    punnetFront(c, x, y, s);
  }

  function drawCrate(c, def, x, y, s, t) {
    crateBack(c, x, y, s);
    if (LYING[def.shape]) {
      /* long ones lie across the top, poking over the sides */
      var sc = 0.52 * s;
      [[-2.4, -15.6, -1.25], [3, -16.8, 1.2], [0, -18.6, -1.45]].forEach(function (q) {
        item(c, def, x + q[0] * s, y + q[1] * s, sc, q[2], t);
      });
    } else {
      var sc2 = 0.46 * s;
      [[-6.6, -15.6, -0.2], [6.6, -15.4, 0.2], [0, -16.4, 0], [-3.2, -21, -0.1], [3.6, -21.2, 0.12]]
        .forEach(function (q, i) {
          if (i === 4 && def.shape === 'peapod') return;
          item(c, def, x + q[0] * s, y + q[1] * s, sc2, q[2], t);
        });
    }
    crateFront(c, x, y, s);
  }

  function drawStraw(c, def, x, y, s, t) {
    straw(c, x, y, s, false);
    item(c, def, x, y - 12.4 * s, 0.86 * s, 0, t);
    straw(c, x, y, s, true);
  }

  function drawJar(c, def, x, y, s, t) {
    jarBack(c, x, y, s);
    var sc = 0.9 * s * (GG.FlowerArt && GG.FlowerArt.tall(def) > 1 ? 0.84 : 1);
    [[-0.5, 0.88, 1], [0.5, 0.9, 2], [0.02, 1.0, 0]].forEach(function (q) {
      c.save();
      c.translate(x, y - 3 * s);
      c.rotate(q[0] + Math.sin((t || 0) * 1.1 + q[2]) * 0.03);
      var k = sc * q[1];
      if (GG.FlowerArt) GG.FlowerArt.draw(c, def, 0, -13 * k, k, t, { cut: true, phase: q[2], stemW: 1.3 });
      else GG.FruitArt.draw(c, def, 0, -13 * k, k, t);
      c.restore();
    });
    jarFront(c, x, y, s);
  }

  GG.pickDecorArt = function (def) {
    var kind = kindOf(def);
    return function (c, x, y, s, t) {
      s = s || 1;
      c.save();
      c.lineCap = 'round';
      if (kind === 'flower') drawJar(c, def, x, y, s, t);
      else if (kind === 'bigveg') drawStraw(c, def, x, y, s, t);
      else if (kind === 'veg') drawCrate(c, def, x, y, s, t);
      else if (kind === 'berry') drawPunnet(c, def, x, y, s, t);
      else drawBasket(c, def, x, y, s, t);
      c.restore();
    };
  };

  /* ---------- names ---------- */

  /* words that stay the same in a heap of them */
  var MASS = { corn: 1, 'sweet corn': 1, asparagus: 1, lavender: 1, fireweed: 1, camas: 1, balsamroot: 1,
    salal: 1, kinnikinnick: 1, fruit: 1, zucchini: 1, rice: 1, wheat: 1, heather: 1, lettuce: 1, spinach: 1, kale: 1 };
  /* when the last word alone would not tell you what it is */
  var KEEP = { corn: 'Sweet Corn', daisy: null, salal: 'Salal Berries', kinnikinnick: 'Kinnikinnick Berries',
    grape: null, pea: 'Snap Peas' };

  function plural(w) {
    var lw = w.toLowerCase();
    if (MASS[lw]) return w;
    if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + 'ies';
    if (/(s|x|z|ch|sh)$/i.test(w)) return w + 'es';
    if (/[^aeiou]o$/i.test(w)) return w + 'es';
    return w + 's';
  }

  /* the everyday name of one of it: 'Redhaven Peach' -> 'Peach' */
  function noun(def) {
    var words = String(def.name || def.id || 'Fruit').replace(/_/g, ' ').trim().split(/\s+/);
    if (words.length > 1 && /^fruit$/i.test(words[words.length - 1])) words.pop();
    var last = words[words.length - 1];
    var lw = last.toLowerCase();
    if (KEEP[lw]) return { text: KEEP[lw], counted: false };
    /* keep the word before it when the name is really two words (Prickly Pear,
       Oregon Grape), or when it tells two berries apart (Red / Blue Elderberry) */
    if (words.length > 1 && /^(prickly|oregon|snap|sweet|red|black|blue|white|wild|mountain|golden|yellow|purple)$/i.test(words[words.length - 2])) {
      last = words[words.length - 2] + ' ' + last;
    }
    return { text: last, counted: true };
  }

  GG.pickDecorName = function (def) {
    if (!def) return 'Basket of Fruit';
    if (def.decorName) return def.decorName;
    var kind = kindOf(def);
    var n = noun(def);
    var many = n.counted ? plural(n.text) : n.text;
    if (kind === 'bigveg') return n.text + ' on Straw';
    if (kind === 'flower') return 'Jar of ' + many;
    if (kind === 'veg') return 'Crate of ' + many;
    if (kind === 'berry') return 'Punnet of ' + many;
    return 'Basket of ' + many;
  };

  /* Hand every v1.18 pickable its decoration. They go in after the hand-drawn
     fruit decor, picked and never bought, for a terrarium or the bank of a
     hybrid - the same as the apples and berries before them. */
  if (GG.FRUITS && GG.DECOR && GG.DecorArt) {
    GG.FRUITS.forEach(function (def) {
      if (!def.autoDecor || !def.unlock || GG.DECOR_BY_ID[def.unlock]) return;
      var dec = { id: def.unlock, name: GG.pickDecorName(def), price: 0, for: 'land', fruit: def.id };
      GG.DECOR.push(dec);
      GG.DECOR_BY_ID[dec.id] = dec;
      GG.DecorArt[dec.id] = GG.pickDecorArt(def);
    });
  }
})(window.GG = window.GG || {});
