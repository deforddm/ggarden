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

    /* The nearest plant with fruit on it, if she is close enough. */
    nearest: function (player) {
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

    /* how many kinds she has picked */
    kinds: function () {
      var n = 0;
      GG.FRUITS.forEach(function (f) { if (GG.Save.hasFruit(f.id)) n++; });
      return n;
    }
  };
})(window.GG = window.GG || {});
