/* Picking fruit.

   Guin asked for "pluckable fruits that unlock a new decoration", so:
   every fruit-bearing tree and shrub in the garden carries one real species,
   she walks up to it and the main button turns into PICK, and the first time
   she picks each kind it unlocks one decoration for her tanks.

   Nothing is ever used up. A picked plant grows its fruit back. */
(function (GG) {
  'use strict';

  var REGROW = 95;       // seconds before the fruit comes back
  var REACH = 62;        // how close she has to be

  var Orchard = GG.Orchard = {
    REGROW: REGROW,
    REACH: REACH,
    plants: [],

    /* Hand out the fruit once the world has been built. Which plant carries
       which fruit never changes, so her orchard stays her orchard. */
    assign: function () {
      this.plants = [];
      var W = GG.World;
      /* A fruit goes on the kind of plant it really grows on. Apples belong in
         a tree; a blackberry is a bramble; a strawberry lies on the ground.
         Put a strawberry in a tree and the game has told her something false. */
      var PROP = { appleTree: 'tree', berryBush: 'shrub', fruitPatch: 'ground', wildBush: 'shrub' };
      var ON = { tree: 'tree', bramble: 'shrub', cane: 'shrub', bush: 'shrub',
                 vine: 'shrub', shrub: 'shrub', ground: 'ground' };
      var pools = {};
      GG.FRUITS.forEach(function (f) {
        /* the v1.18 beds, wild bushes and flowers are planted by the world
           itself, each with its own crop already on it (p.pick) */
        if (typeof f.where !== 'string' || !ON[f.on]) return;
        var key = f.where + ':' + (ON[f.on] || 'shrub');
        (pools[key] = pools[key] || []).push(f);
      });
      /* If nothing grows on the ground in a place, its low patches carry the
         shrub fruit instead, so no plant is left empty. */
      function pool(where, kind) {
        return pools[where + ':' + kind] || pools[where + ':shrub'] || pools[where + ':tree'] || null;
      }
      var turn = {};
      if (!GG.FRUITS.length) return;
      for (var i = 0; i < W.props.length; i++) {
        var p = W.props[i];
        if (p.pick) {
          if (!GG.FRUIT_BY_ID[p.pick]) continue;
          p.fruit = p.pick; p.ripe = 1; p.regrow = 0;
          this.plants.push(p);
          continue;
        }
        var kind = PROP[p.type];
        if (!kind) continue;
        var where = (p.type === 'wildBush') ? 'hill' : 'orchard';
        var list = pool(where, kind);
        if (!list || !list.length) continue;
        var key = where + ':' + kind;
        turn[key] = (turn[key] || 0);
        var def = list[turn[key]++ % list.length];
        if (!def) continue;
        p.fruit = def.id;
        p.ripe = 1;
        p.regrow = 0;
        this.plants.push(p);
      }
    },

    /* fruit grows back on its own */
    update: function (dt) {
      for (var i = 0; i < this.plants.length; i++) {
        var p = this.plants[i];
        if (p.ripe >= 1) continue;
        p.regrow -= dt;
        if (p.regrow <= 0) p.ripe = 1;
        else p.ripe = Math.max(0, 1 - p.regrow / REGROW);
      }
    },

    /* v1.19: the plant she tapped on, so PICK means the one she chose and
       not a neighbour that happens to be a step closer. */
    wanted: null,
    want: function (x, y) {
      var best = null, bestD = 44 * 44;
      for (var i = 0; i < this.plants.length; i++) {
        var p = this.plants[i];
        var dx = x - p.x, dy = (y - (p.y - Math.min(30, p.r * 0.6))) * 1.1;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = p; }
      }
      this.wanted = best;
      return best;
    },

    /* The nearest plant with fruit on it, if she is close enough. */
    nearest: function (player) {
      var w = this.wanted;
      if (w) {
        if (w.ripe >= 1) {
          var wx = player.x - w.x, wy = (player.y - w.y) * 1.15;
          if (wx * wx + wy * wy < REACH * REACH * 1.2) return w;
        } else this.wanted = null;
      }
      var best = null, bestD = REACH * REACH;
      for (var i = 0; i < this.plants.length; i++) {
        var p = this.plants[i];
        if (p.ripe < 1) continue;
        var dx = player.x - p.x, dy = (player.y - p.y) * 1.15;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = p; }
      }
      return best;
    },

    /* Pick it. Returns what happened, so the game can show a card. */
    pick: function (plant) {
      if (!plant || plant.ripe < 1) return null;
      var def = GG.FRUIT_BY_ID[plant.fruit];
      if (!def) return null;
      plant.ripe = 0;
      plant.regrow = REGROW;
      var first = !GG.Save.hasFruit(def.id);
      GG.Save.addFruit(def.id);
      var unlocked = null;
      if (first && def.unlock && GG.Save.data.unlockedDecor.indexOf(def.unlock) < 0) {
        GG.Save.data.unlockedDecor.push(def.unlock);
        unlocked = GG.DECOR_BY_ID[def.unlock] || null;
      }
      GG.Save.save();
      return { def: def, first: first, unlocked: unlocked, x: plant.x, y: plant.y };
    },

    /* little fruit that pops up out of the plant when she picks it */
    pops: [],
    pop: function (def, x, y) {
      this.pops.push({ def: def, x: x, y: y, t: 0 });
    },
    stepPops: function (dt) {
      for (var i = this.pops.length - 1; i >= 0; i--) {
        this.pops[i].t += dt;
        if (this.pops[i].t > 1.1) this.pops.splice(i, 1);
      }
    },
    drawPops: function (c, cam) {
      for (var i = 0; i < this.pops.length; i++) {
        var p = this.pops[i];
        var k = p.t / 1.1;
        c.save();
        c.globalAlpha = 1 - k * k;
        GG.FruitArt.draw(c, p.def, p.x - cam.x, p.y - cam.y - 34 - k * 34, 0.85, p.t);
        c.restore();
      }
    },

    /* A soft ring on the ground under the plant PICK will take, so she can
       see which one it means. */
    drawTarget: function (c, cam, plant, t) {
      if (!plant) return;
      var x = plant.x - cam.x, y = plant.y - cam.y + 2;
      var rx = Math.max(16, Math.min(34, plant.r * 0.8));
      var k = 0.5 + 0.5 * Math.sin(t * 5);
      c.save();
      c.strokeStyle = 'rgba(255,236,150,' + (0.55 + 0.35 * k).toFixed(2) + ')';
      c.lineWidth = 2.4;
      c.setLineDash([5, 4]);
      c.lineDashOffset = -t * 12;
      c.beginPath(); c.ellipse(x, y, rx + k * 2, (rx + k * 2) * 0.4, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
    },

    /* A little twinkle over the ripe beds, bushes and flowers near her, so
       the ones she can pick stand out from the ones that are only pretty.
       (The fruit trees do not need it: the fruit is the sign.) */
    drawSparkles: function (c, cam, player, t, vw, vh) {
      var near2 = 280 * 280;
      c.save();
      for (var i = 0; i < this.plants.length; i++) {
        var p = this.plants[i];
        if (!p.pick || p.ripe < 1) continue;
        var dx = p.x - player.x, dy = p.y - player.y;
        if (dx * dx + dy * dy > near2) continue;
        var x = p.x - cam.x, y = p.y - cam.y - p.r * 1.25 - 6;
        if (x < -20 || y < -20 || x > vw + 20 || y > vh + 40) continue;
        var ph = t * 2.2 + (p.seed || 0) * 17;
        var a = 0.35 + 0.55 * Math.max(0, Math.sin(ph));
        var s = 3 + 1.6 * Math.max(0, Math.sin(ph));
        y += Math.sin(ph * 0.5) * 2;
        c.globalAlpha = a;
        c.fillStyle = '#fff6c0';
        c.beginPath();
        c.moveTo(x, y - s * 1.6); c.lineTo(x + s * 0.4, y - s * 0.4); c.lineTo(x + s * 1.6, y);
        c.lineTo(x + s * 0.4, y + s * 0.4); c.lineTo(x, y + s * 1.6); c.lineTo(x - s * 0.4, y + s * 0.4);
        c.lineTo(x - s * 1.6, y); c.lineTo(x - s * 0.4, y - s * 0.4); c.closePath(); c.fill();
      }
      c.restore();
    },

    /* how many kinds she has picked */
    kinds: function () {
      var n = 0;
      GG.FRUITS.forEach(function (f) { if (GG.Save.hasFruit(f.id)) n++; });
      return n;
    }
  };
})(window.GG = window.GG || {});
