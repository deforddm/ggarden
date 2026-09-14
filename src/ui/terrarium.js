/* Tanks: terrariums (land, bugs), fish tanks (water, fish) and hybrid tanks (both).
   Whatever lives in one moves about the way its species moves. */
(function (GG) {
  'use strict';
  var $ = GG.$;
  var CW = 640, CH = 420;
  var AIR = { flutter: 1, hover: 1, dart: 1, drift: 1, glow: 1 };

  /* Where in the glass does this creature belong? */
  function bandFor(def, b) {
    if (def && GG.isAquaticBug(def) && b.floor) return b.floor;      // on the bottom, under water
    if (def && AIR[def.behavior] && b.air) return b.air;             // flying
    if (def && def.behavior === 'skim' && b.hasWater && b.waterTop != null) {
      return [b.waterTop - 4, b.waterTop + 16];                      // skating on the surface
    }
    return b.ground || b.floor || b.water;                           // walking
  }

  var T = GG.Terrarium = {
    index: 0,
    tab: 'bugs',
    sel: null,
    drag: null,
    _raf: 0,
    _ft: 0,
    chooserMode: 'new',
    _motion: null,

    tank: function () {
      var d = GG.Save.data;
      if (this.index >= d.terrariums.length) this.index = 0;
      return d.terrariums[this.index];
    },
    typeOf: function (tank) { return GG.TANK_TYPE_BY_ID[tank.type] || GG.TANK_TYPE_BY_ID.terrarium; },

    /* Where things are allowed to be, for each kind of tank. */
    bands: function (tank) {
      var id = (tank.type || 'terrarium');
      if (id === 'aquarium') {
        return { id: id, hasLand: false, hasWater: true,
          sand: CH - 62, water: [50, CH - 68], decor: [CH - 80, CH - 48],
          floor: [CH - 64, CH - 48] };
      }
      if (id === 'hybrid') {
        return { id: id, hasLand: true, hasWater: true,
          bank: 232, waterTop: 270, sand: CH - 40,
          air: [42, 224], ground: [222, 264], water: [286, CH - 48], decor: [226, 264],
          floor: [CH - 56, CH - 42] };
      }
      if (id === 'habitat') {
        /* A corner of the garden. No glass, so there is sky right to the top
           and plenty of room for the flyers. */
        return { id: id, hasLand: true, hasWater: false, outdoors: true,
          ground: [286, CH - 40], air: [40, 250], decor: [278, CH - 36] };
      }
      return { id: id, hasLand: true, hasWater: false,
        ground: [292, CH - 46], air: [46, 300], decor: [282, CH - 42] };
    },

    /* Where in a habitat does this friend belong? */
    friendBand: function (def, b) {
      var fam = def.family;
      if (fam === 'hummingbird') return [b.air[0] + 40, b.air[1] - 30];
      if (fam === 'bat') return [b.air[0] + 10, b.air[1] - 70];
      if (fam === 'parrot') return [b.air[1] - 60, b.ground[0] + 20];
      return b.ground;
    },

    open: function () {
      GG.UI.open('screen-terrarium');
      this.sel = null;
      var tk = this.tank();
      var ty = this.typeOf(tk);
      this.tab = this.firstTab(ty, this.tab);
      this.refresh();
      this.loop();
    },
    close: function () { cancelAnimationFrame(this._raf); },

    /* Which tray tabs does this kind of tank have, and is the current one one
       of them? */
    tabAllowed: function (ty, k) {
      if (k === 'decor') return true;
      if (k === 'bugs') return !!ty.maxBugs;
      if (k === 'fish') return !!ty.maxFish;
      if (k === 'friends') return !!ty.maxFriends;
      return false;
    },
    firstTab: function (ty, want) {
      if (this.tabAllowed(ty, want)) return want;
      var order = ['friends', 'bugs', 'fish', 'decor'];
      for (var i = 0; i < order.length; i++) if (this.tabAllowed(ty, order[i])) return order[i];
      return 'decor';
    },

    refresh: function () {
      var tk = this.tank(), d = GG.Save.data, ty = this.typeOf(tk);
      var bg = GG.TANK_BY_ID[tk.bg] || GG.scenesFor(tk.type)[0];
      $('tank-name').textContent = tk.name;
      $('tank-kind').textContent = ty.name + ' · ' + bg.name;
      $('tank-count').textContent = 'Tank ' + (this.index + 1) + ' of ' + d.terrariums.length;
      /* your only tank cannot be thrown away */
      $('tank-delete').hidden = d.terrariums.length <= 1;
      $('tank-remove').style.display = this.sel ? '' : 'none';
      // only show the tabs this tank can use
      var self0 = this;
      document.querySelectorAll('#screen-terrarium .tabs .tab').forEach(function (el) {
        el.style.display = self0.tabAllowed(ty, el.getAttribute('data-tab')) ? '' : 'none';
      });
      this.buildTray();
    },

    buildTray: function () {
      var tray = $('tray'); tray.innerHTML = '';
      var self = this, tk = this.tank(), d = GG.Save.data, ty = this.typeOf(tk);
      this.tab = this.firstTab(ty, this.tab);
      document.querySelectorAll('#screen-terrarium .tabs .tab').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-tab') === self.tab);
      });

      function tile(def, isFish, onClick) {
        var item = GG.el('div', 'trayitem');
        var cv = GG.el('canvas'); cv.width = 132; cv.height = 84; cv.style.height = '42px';
        var c = cv.getContext('2d'); c.scale(2, 2);
        if (isFish) GG.FishArt.draw(c, def, 33, 22, 0.62, false, 1.2);
        else GG.BugArt.draw(c, def, 33, 21, 1.4, -Math.PI / 2, 1.2);
        item.appendChild(cv);
        item.appendChild(GG.el('div', 'nm', def.name));
        item.addEventListener('click', onClick);
        tray.appendChild(item);
      }

      if (this.tab === 'friends') {
        var aids = Object.keys(d.friends || {});
        if (!aids.length) {
          tray.innerHTML = '<div class="note" style="grid-column:1/-1">Make a friend out in the garden first, and then you can invite them round.</div>';
          return;
        }
        aids.forEach(function (id) {
          var def = GG.ANIMAL_BY_ID[id]; if (!def) return;
          var item = GG.el('div', 'trayitem');
          var cv = GG.el('canvas'); cv.width = 132; cv.height = 84; cv.style.height = '42px';
          var c = cv.getContext('2d'); c.scale(2, 2);
          GG.AnimalArt.draw(c, def, 33, 34, GG.animalFit(def, 44), false, 1.2);
          item.appendChild(cv);
          item.appendChild(GG.el('div', 'nm', def.name));
          item.addEventListener('click', function () { self.addItem('friend', id); });
          tray.appendChild(item);
        });
        tray.appendChild(GG.el('div', 'note',
          'They are only visiting \u2014 take them out whenever you like.'))
          .style.gridColumn = '1/-1';
        return;
      }

      if (this.tab === 'fish') {
        var fids = Object.keys(d.caughtFish);
        if (!fids.length) {
          tray.innerHTML = '<div class="note" style="grid-column:1/-1">Go and catch a fish at the Lily Pond first!</div>';
          return;
        }
        fids.forEach(function (id) {
          var def = GG.FISH_BY_ID[id]; if (!def) return;
          tile(def, true, function () { self.addItem('fish', id); });
        });
      } else if (this.tab === 'bugs') {
        var ids = Object.keys(d.caught);
        if (!ids.length) {
          tray.innerHTML = '<div class="note" style="grid-column:1/-1">Catch a bug first, then you can put it in here!</div>';
          return;
        }
        var fits = ids.map(function (id) { return GG.BUG_BY_ID[id]; })
          .filter(function (def) { return def && GG.bugFitsTank(def, tk.type || 'terrarium'); });
        if (!fits.length) {
          var msg = (tk.type === 'aquarium')
            ? 'A fish tank is for fish and rock-pool creatures. Catch a crab, a sea star or an urchin in The Tidepools and it can live in here.'
            : 'Nothing you have caught can live in this tank yet.';
          tray.innerHTML = '<div class="note" style="grid-column:1/-1">' + msg + '</div>';
          return;
        }
        fits.forEach(function (def) {
          tile(def, false, function () { self.addItem('bug', def.id); });
        });
        if (tk.type === 'aquarium') {
          tray.appendChild(GG.el('div', 'note',
            'Rock-pool creatures need water, so they live in here rather than a terrarium.'))
            .style.gridColumn = '1/-1';
        }
      } else {
        /* only the pieces that suit this kind of tank */
        var fits = GG.decorFor(this.tank().type || 'terrarium');
        if (!fits.length) {
          tray.innerHTML = '<div class="note" style="grid-column:1/-1">No decorations for this tank yet.</div>';
          return;
        }
        fits.forEach(function (dec) {
          var owned = d.unlockedDecor.indexOf(dec.id) >= 0;
          var item = GG.el('div', 'trayitem' + (owned ? '' : ' locked'));
          var cv = GG.el('canvas'); cv.width = 132; cv.height = 84; cv.style.height = '42px';
          var c = cv.getContext('2d'); c.scale(2, 2);
          var fn = GG.DecorArt[dec.id];
          if (fn) fn(c, 33, 38, 0.8, 1);
          item.appendChild(cv);
          item.appendChild(GG.el('div', 'nm', dec.name));
          if (!owned) item.appendChild(GG.el('div', 'price', '✦ ' + dec.price));
          item.addEventListener('click', function () {
            if (!owned) { GG.UI.toast('Buy this in the Decoration Box first'); return; }
            self.addItem('decor', dec.id);
          });
          tray.appendChild(item);
        });
      }
    },

    listFor: function (tank, kind) {
      if (kind === 'bug') return tank.bugs;
      if (kind === 'fish') return (tank.fish = tank.fish || []);
      if (kind === 'friend') return (tank.friends = tank.friends || []);
      return tank.decor;
    },

    addItem: function (kind, id) {
      var tk = this.tank(), ty = this.typeOf(tk), b = this.bands(tk);
      var arr = this.listFor(tk, kind);
      var max = kind === 'bug' ? ty.maxBugs
        : (kind === 'fish' ? ty.maxFish
          : (kind === 'friend' ? ty.maxFriends : ty.maxDecor));
      if (!max) { GG.UI.toast('That does not belong in a ' + ty.name.toLowerCase() + '.'); return; }

      /* A sea star would dry out on the grass, and a ladybug would drown. */
      if (kind === 'bug') {
        var d0 = GG.BUG_BY_ID[id];
        if (d0 && !GG.bugFitsTank(d0, tk.type || 'terrarium')) {
          GG.UI.toast(GG.isAquaticBug(d0)
            ? d0.name + ' needs water \u2014 put it in ' + GG.tankNeededFor(d0) + '.'
            : d0.name + ' would drown in there \u2014 it needs ' + GG.tankNeededFor(d0) + '.', 3000);
          return;
        }
      }
      if (kind === 'decor' && !GG.decorFits(GG.DECOR_BY_ID[id], tk.type || 'terrarium')) {
        GG.UI.toast('That does not belong in a ' + ty.name.toLowerCase() + '.');
        return;
      }
      if (kind === 'friend') {
        for (var q = 0; q < arr.length; q++) {
          if (arr[q].id === id) { GG.UI.toast('They are already here!'); return; }
        }
      }
      if (arr.length >= max) {
        GG.UI.toast(kind === 'friend'
          ? 'Any more and it would be crowded! (' + max + ' is the limit)'
          : 'This tank is full! (' + max + ' is the limit)');
        return;
      }

      var y;
      if (kind === 'fish') y = GG.rand(b.water[0] + 10, b.water[1] - 10);
      else if (kind === 'decor') y = GG.rand(b.decor[0], b.decor[1]);
      else if (kind === 'friend') {
        var fb = this.friendBand(GG.ANIMAL_BY_ID[id], b);
        y = GG.rand(fb[0] + 4, fb[1] - 4);
      } else {
        var band = bandFor(GG.BUG_BY_ID[id], b);
        y = GG.rand(band[0] + 4, band[1] - 4);
      }
      /* rock-pool creatures spread along the bottom rather than piling up */
      var spread = (kind === 'friend') ? 190
        : (kind === 'decor' && b.id === 'habitat') ? 240
          : ((kind === 'bug' && GG.isAquaticBug(GG.BUG_BY_ID[id])) ? 200 : 110);
      var item = { id: id, x: CW / 2 + GG.rand(-spread, spread), y: y, s: 1, seed: Math.random() };
      arr.push(item);
      this.sel = item;
      GG.Sfx.place();
      GG.Save.save();
      this.refresh();
    },

    items: function () {
      var tk = this.tank(), out = [];
      tk.decor.forEach(function (d) { out.push({ kind: 'decor', it: d }); });
      (tk.fish || []).forEach(function (f) { out.push({ kind: 'fish', it: f }); });
      tk.bugs.forEach(function (x) { out.push({ kind: 'bug', it: x }); });
      (tk.friends || []).forEach(function (f) { out.push({ kind: 'friend', it: f }); });
      return out;
    },

    /* ---------- life inside the glass ---------- */
    motionFor: function (it) {
      if (!this._motion) this._motion = new WeakMap();
      var m = this._motion.get(it);
      if (!m) {
        m = { ox: 0, oy: 0, ang: Math.random() * Math.PI * 2, timer: GG.rand(0.2, 1.5),
          hop: 0, dash: 0, lift: 0, lx: it.x, ly: it.y, face: -Math.PI / 2, faceLeft: false };
        this._motion.set(it, m);
      }
      return m;
    },

    step: function (dt) {
      var tk = this.tank(), b = this.bands(tk);
      this.stepFish(dt, tk, b);
      this.stepBugs(dt, tk, b);
      this.stepFriends(dt, tk, b);
    },

    /* The visiting friends potter about their corner of the garden. */
    stepFriends: function (dt, tk, b) {
      var list = tk.friends || [];
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        var def = GG.ANIMAL_BY_ID[it.id];
        if (!def) continue;
        var m = this.motionFor(it);
        if (this.drag && this.drag.e.it === it) { m.ox = 0; m.oy = 0; m.lift = 0; m.lx = it.x; m.ly = it.y; continue; }
        var fam = def.family;
        var flying = fam === 'hummingbird' || fam === 'bat';

        m.timer -= dt;
        if (m.timer <= 0) {
          m.ang += GG.rand(-1.6, 1.6);
          m.timer = GG.rand(1.1, 3);
          if (fam === 'frog') { m.hop = 0.36; m.timer = GG.rand(2.2, 4.4); }
        }
        var speed = { hummingbird: 44, frog: 18, bat: 54, dog: 30, cat: 22, parrot: 22 }[fam] || 24;
        var move = 1;
        if (fam === 'frog') move = m.hop > 0 ? 3.2 : 0;
        if (fam === 'hummingbird') move = (Math.sin(m.timer * 3) > 0.2) ? 1.5 : 0.15;
        if (fam === 'cat') move = (Math.sin(m.timer * 1.2) > 0) ? 1 : 0;
        if (fam === 'parrot') move = (Math.sin(m.timer * 1.6) > 0.3) ? 1 : 0.08;
        if (m.hop > 0) m.hop -= dt;

        var vx = Math.cos(m.ang) * speed * move;
        var vy = Math.sin(m.ang) * speed * move * (flying ? 0.6 : 0.3);
        m.gait = GG.clamp(Math.sqrt(vx * vx + vy * vy) / 28, 0, 1.4);
        m.ox += vx * dt; m.oy += vy * dt;
        var radius = flying ? 120 : 92;
        var away = Math.sqrt(m.ox * m.ox + m.oy * m.oy);
        if (away > radius) {
          m.ox = m.ox / away * radius; m.oy = m.oy / away * radius;
          m.ang = Math.atan2(-m.oy, -m.ox) + GG.rand(-0.6, 0.6);
        }

        var band = this.friendBand(def, b);
        var wx = it.x + m.ox, wy = it.y + m.oy;
        var lx = GG.clamp(wx, 44, CW - 44);
        var ly = GG.clamp(wy, band[0], band[1]);
        if (lx !== wx) { m.ox = lx - it.x; m.ang = Math.PI - m.ang; }
        if (ly !== wy) { m.oy = ly - it.y; m.ang = -m.ang; }

        if (fam === 'frog' && m.hop > 0) m.lift = Math.sin((1 - m.hop / 0.36) * Math.PI) * 18;
        else if (flying) m.lift = Math.sin(this._ft * (fam === 'bat' ? 1.8 : 2.6) + it.seed * 9) * 3;
        else m.lift *= 0.86;

        m.lx = lx; m.ly = ly;
        if (move > 0.25 && Math.abs(vx) > 2) m.faceLeft = vx < 0;
      }
    },

    stepFish: function (dt, tk, b) {
      var list = tk.fish || [];
      if (!b.hasWater) return;
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        var def = GG.FISH_BY_ID[it.id];
        if (!def) continue;
        var m = this.motionFor(it);
        if (this.drag && this.drag.e.it === it) { m.ox = 0; m.oy = 0; m.lift = 0; m.lx = it.x; m.ly = it.y; continue; }
        m.timer -= dt;
        if (m.timer <= 0) { m.ang += GG.rand(-1.1, 1.1); m.timer = GG.rand(1, 2.6); }
        m.hunt = (m.hunt || 0) - dt;
        if (m.hunt <= 0) {
          m.hunt = GG.rand(0.4, 0.9);
          var pr = this.huntTarget(tk, it.id, m.lx, m.ly, 150);
          if (pr) {
            m.ang = GG.angLerp(m.ang, Math.atan2(pr.m.ly - m.ly, pr.m.lx - m.lx), 0.7);
            if (pr.d < 40) { this.spookPrey(pr.m, m.lx, m.ly); m.hunt = GG.rand(3, 6); }
          }
        }
        var speed = 20 + (6 - def.shadow) * 5;
        var vx = Math.cos(m.ang) * speed, vy = Math.sin(m.ang) * speed * 0.28;
        m.ox += vx * dt; m.oy += vy * dt;
        var away = Math.sqrt(m.ox * m.ox + m.oy * m.oy);
        var radius = b.id === 'hybrid' ? 90 : 120;
        if (away > radius) {
          m.ox = m.ox / away * radius; m.oy = m.oy / away * radius;
          m.ang = Math.atan2(-m.oy, -m.ox) + GG.rand(-0.5, 0.5);
        }
        var wx = it.x + m.ox, wy = it.y + m.oy;
        var lx = GG.clamp(wx, 46, CW - 46);
        var ly = GG.clamp(wy, b.water[0], b.water[1]);
        if (lx !== wx) { m.ox = lx - it.x; m.ang = Math.PI - m.ang; }
        if (ly !== wy) { m.oy = ly - it.y; m.ang = -m.ang; }
        m.lx = lx; m.ly = ly; m.lift = 0;
        m.faceLeft = Math.cos(m.ang) < 0;
      }
    },

    stepBugs: function (dt, tk, b) {
      for (var i = 0; i < tk.bugs.length; i++) {
        var it = tk.bugs[i];
        var def = GG.BUG_BY_ID[it.id];
        if (!def) continue;
        var m = this.motionFor(it);
        if (this.drag && this.drag.e.it === it) { m.ox = 0; m.oy = 0; m.lift = 0; m.lx = it.x; m.ly = it.y; continue; }

        var bh = def.behavior;
        var wet = GG.isAquaticBug(def);
        var air = !wet && !!AIR[bh] && !!b.air;
        var skim = bh === 'skim';
        var radius = air ? 108 : (wet ? 58 : 76);
        var speed = air ? def.speed * 0.44
          : (wet ? Math.max(def.speed, 6) * 0.55 : Math.max(def.speed, 16) * 0.5);

        m.timer -= dt;
        if (m.timer <= 0) {
          m.ang += GG.rand(-1.7, 1.7);
          m.timer = GG.rand(0.5, 1.8);
          if (bh === 'hop') { m.hop = 0.5; m.timer = GG.rand(1.2, 2.6); }
          if (bh === 'dart') m.dash = 0.45;
        }
        m.hunt = (m.hunt || 0) - dt;
        if (m.hunt <= 0) {
          m.hunt = GG.rand(0.4, 0.9);
          var bp = this.huntTarget(tk, it.id, m.lx, m.ly, 120);
          if (bp) {
            m.ang = GG.angLerp(m.ang, Math.atan2(bp.m.ly - m.ly, bp.m.lx - m.lx), 0.6);
            if (bp.d < 30) { this.spookPrey(bp.m, m.lx, m.ly); m.hunt = GG.rand(3, 6); }
          }
        }
        var move = 1;
        if (bh === 'hover') move = (Math.sin(m.timer * 4) > 0.55) ? 0.15 : 1;
        if (bh === 'dart') { m.dash = Math.max(0, m.dash - dt); move = m.dash > 0 ? 2.3 : 0.12; }
        if (bh === 'glow' || bh === 'drift') move = 0.75;
        if (bh === 'hop') { if (m.hop > 0) { m.hop -= dt; move = 2.3; } else move = 0; }

        var vx = Math.cos(m.ang) * speed * move;
        var vy = Math.sin(m.ang) * speed * move * (air ? 0.7 : 0.4);
        m.ox += vx * dt; m.oy += vy * dt;
        var away = Math.sqrt(m.ox * m.ox + m.oy * m.oy);
        if (away > radius) {
          m.ox = m.ox / away * radius; m.oy = m.oy / away * radius;
          m.ang = Math.atan2(-m.oy, -m.ox) + GG.rand(-0.6, 0.6);
        }

        var band = bandFor(def, b);
        var lo = band[0], hi = band[1];
        void skim;

        var wx = it.x + m.ox, wy = it.y + m.oy;
        var lx = GG.clamp(wx, 40, CW - 40);
        var ly = GG.clamp(wy, lo, hi);
        if (lx !== wx) { m.ox = lx - it.x; m.ang = Math.PI - m.ang; }
        if (ly !== wy) { m.oy = ly - it.y; m.ang = -m.ang; }

        if (bh === 'hop' && m.hop > 0) m.lift = Math.sin((1 - m.hop / 0.5) * Math.PI) * 24;
        else m.lift *= 0.86;

        m.lx = lx; m.ly = ly;
        if (move > 0.25) m.face = GG.angLerp(m.face, Math.atan2(vy, vx), Math.min(1, dt * 6));
      }
    },

    /* The food chain inside the glass: a hunter drifts toward something it
       really would hunt, the other one darts off, and nothing is ever lost. */
    huntTarget: function (tk, id, x, y, reach) {
      if (!GG.EATS || !GG.EATS[id]) return null;
      var pools = [tk.bugs, tk.fish || []], best = null, bestD = reach, self = this;
      for (var p = 0; p < pools.length; p++) {
        for (var i = 0; i < pools[p].length; i++) {
          var it = pools[p][i];
          if (!GG.hunts(id, it.id)) continue;
          var m = self.motionFor(it);
          var d = GG.dist(x, y, m.lx, m.ly);
          if (d < bestD) { bestD = d; best = { it: it, m: m, d: d }; }
        }
      }
      return best;
    },

    spookPrey: function (m, fromX, fromY) {
      m.ang = Math.atan2(m.ly - fromY, m.lx - fromX) + GG.rand(-0.4, 0.4);
      m.dash = 0.5;
      m.timer = GG.rand(0.9, 1.6);
    },

    livePos: function (e) {
      if (e.kind === 'decor') return { x: e.it.x, y: e.it.y - 18 };
      var m = this.motionFor(e.it);
      return { x: m.lx, y: m.ly - m.lift };
    },

    pick: function (x, y) {
      var all = this.items();
      for (var i = all.length - 1; i >= 0; i--) {
        var e = all[i], pos = this.livePos(e);
        if (GG.dist(x, y, pos.x, pos.y) < 32) return e;
      }
      return null;
    },

    removeSelected: function () {
      if (!this.sel) return;
      var tk = this.tank(), i;
      if ((i = tk.bugs.indexOf(this.sel)) >= 0) tk.bugs.splice(i, 1);
      else if ((i = (tk.fish || []).indexOf(this.sel)) >= 0) tk.fish.splice(i, 1);
      else if ((i = (tk.friends || []).indexOf(this.sel)) >= 0) tk.friends.splice(i, 1);
      else if ((i = tk.decor.indexOf(this.sel)) >= 0) tk.decor.splice(i, 1);
      this.sel = null;
      GG.Save.save();
      this.refresh();
    },

    /* ---------- drawing ---------- */
    drawScene: function (c, tk, bg, b, t) {
      if (b.id === 'aquarium') {
        var wg = c.createLinearGradient(0, 0, 0, CH);
        wg.addColorStop(0, GG.shade(bg.sky, 0.22));
        wg.addColorStop(0.55, bg.sky);
        wg.addColorStop(1, bg.deep);
        c.fillStyle = wg; c.fillRect(0, 0, CW, CH);
        this.lightAndBubbles(c, t, 0);
        c.fillStyle = bg.ground;
        c.beginPath();
        c.moveTo(0, b.sand + 14);
        c.quadraticCurveTo(CW / 2, b.sand - 12, CW, b.sand + 14);
        c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
        c.fillStyle = bg.ground2;
        c.beginPath();
        c.moveTo(0, b.sand + 40);
        c.quadraticCurveTo(CW / 2, b.sand + 18, CW, b.sand + 40);
        c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
        return;
      }

      if (b.id === 'hybrid') {
        // air above
        var sg = c.createLinearGradient(0, 0, 0, b.bank);
        sg.addColorStop(0, bg.sky); sg.addColorStop(1, GG.shade(bg.sky, 0.12));
        c.fillStyle = sg; c.fillRect(0, 0, CW, b.bank + 6);
        // grassy bank
        c.fillStyle = bg.ground;
        c.beginPath();
        c.moveTo(0, b.bank + 4);
        c.quadraticCurveTo(CW / 2, b.bank - 14, CW, b.bank + 4);
        c.lineTo(CW, b.waterTop + 6); c.lineTo(0, b.waterTop + 6);
        c.closePath(); c.fill();
        c.fillStyle = bg.ground2;
        c.fillRect(0, b.waterTop - 12, CW, 18);
        // water below
        var hg = c.createLinearGradient(0, b.waterTop, 0, CH);
        hg.addColorStop(0, bg.water); hg.addColorStop(1, bg.deep);
        c.fillStyle = hg; c.fillRect(0, b.waterTop, CW, CH - b.waterTop);
        this.lightAndBubbles(c, t, b.waterTop);
        // sandy bottom
        c.fillStyle = '#dfd2a4';
        c.beginPath();
        c.moveTo(0, b.sand + 10);
        c.quadraticCurveTo(CW / 2, b.sand - 8, CW, b.sand + 10);
        c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
        // the waterline itself
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, b.waterTop + 2);
        for (var x = 0; x <= CW; x += 16) c.lineTo(x, b.waterTop + 2 + Math.sin(x * 0.06 + t * 1.6) * 1.8);
        c.stroke();
        return;
      }

      if (b.id === 'habitat') { this.drawGarden(c, bg, b, t); return; }

      // plain terrarium
      var g = c.createLinearGradient(0, 0, 0, b.air[1]);
      g.addColorStop(0, bg.sky); g.addColorStop(1, GG.shade(bg.sky, 0.12));
      c.fillStyle = g; c.fillRect(0, 0, CW, b.air[1]);
      if (bg.id === 'night') {
        c.fillStyle = '#fff';
        for (var s = 0; s < 26; s++) {
          c.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(t + s));
          c.fillRect((s * 97) % CW, (s * 53) % (b.air[1] - 40), 2, 2);
        }
        c.globalAlpha = 1;
        c.fillStyle = '#fff6c4';
        c.beginPath(); c.arc(540, 70, 26, 0, Math.PI * 2); c.fill();
      } else if (bg.id === 'sunset') {
        c.fillStyle = 'rgba(255,160,90,0.5)';
        c.beginPath(); c.arc(500, 210, 70, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = bg.ground;
      c.beginPath();
      c.moveTo(0, b.air[1] + 20);
      c.quadraticCurveTo(CW / 2, b.air[1] - 26, CW, b.air[1] + 20);
      c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
      c.fillStyle = bg.ground2;
      c.beginPath();
      c.moveTo(0, b.air[1] + 56);
      c.quadraticCurveTo(CW / 2, b.air[1] + 22, CW, b.air[1] + 56);
      c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
    },

    /* A corner of the real garden, with a sky and a fence rather than glass. */
    drawGarden: function (c, bg, b, t) {
      var g = c.createLinearGradient(0, 0, 0, b.ground[0] + 20);
      g.addColorStop(0, bg.sky); g.addColorStop(1, GG.shade(bg.sky, 0.14));
      c.fillStyle = g; c.fillRect(0, 0, CW, b.ground[0] + 24);
      if (bg.id === 'dusk') {
        c.fillStyle = '#fff';
        for (var st = 0; st < 30; st++) {
          c.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.8 + st));
          c.fillRect((st * 89) % CW, (st * 47) % 200, 2, 2);
        }
        c.globalAlpha = 1;
        c.fillStyle = '#fff6c4';
        c.beginPath(); c.arc(548, 62, 22, 0, Math.PI * 2); c.fill();
      } else {
        c.fillStyle = 'rgba(255,255,255,0.55)';
        for (var k = 0; k < 3; k++) {
          var cx = ((k * 240 + t * 5) % (CW + 200)) - 100;
          var cy = 46 + k * 26;
          c.beginPath();
          c.ellipse(cx, cy, 42, 15, 0, 0, Math.PI * 2);
          c.ellipse(cx + 30, cy + 4, 30, 12, 0, 0, Math.PI * 2);
          c.ellipse(cx - 28, cy + 5, 26, 11, 0, 0, Math.PI * 2);
          c.fill();
        }
      }
      /* a hedge along the back */
      c.fillStyle = GG.shade(bg.ground, -0.22);
      for (var h = -1; h < 12; h++) {
        c.beginPath();
        c.arc(h * 60 + 24, b.ground[0] - 6, 44, Math.PI, 0);
        c.fill();
      }
      c.fillStyle = bg.ground;
      c.beginPath();
      c.moveTo(0, b.ground[0] - 6);
      c.quadraticCurveTo(CW / 2, b.ground[0] - 20, CW, b.ground[0] - 6);
      c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
      c.fillStyle = bg.ground2;
      c.beginPath();
      c.moveTo(0, b.ground[0] + 40);
      c.quadraticCurveTo(CW / 2, b.ground[0] + 20, CW, b.ground[0] + 40);
      c.lineTo(CW, CH); c.lineTo(0, CH); c.closePath(); c.fill();
      /* a few tufts of grass so it does not look bald */
      c.strokeStyle = GG.shade(bg.ground2, -0.18); c.lineWidth = 2; c.lineCap = 'round';
      for (var q = 0; q < 26; q++) {
        var gx = (q * 137) % CW, gy = b.ground[0] + 14 + ((q * 53) % 90);
        var lean = Math.sin(t * 1.2 + q) * 3;
        c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + lean, gy - 9); c.stroke();
      }
    },

    lightAndBubbles: function (c, t, top) {
      c.fillStyle = 'rgba(255,255,255,0.13)';
      for (var ry = 0; ry < 4; ry++) {
        c.beginPath();
        c.ellipse(CW / 2, top + 20 + ry * 16, CW * 0.42, 5, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.16)';
      for (var sb = 0; sb < 7; sb++) {
        var span = CH - top + 40;
        var by = CH - ((t * 26 + sb * 63) % span);
        if (by < top) continue;
        c.beginPath(); c.arc(52 + sb * 82, by, 3 + (sb % 3), 0, Math.PI * 2); c.fill();
      }
    },

    draw: function (t) {
      var cv = $('tank-canvas'), c = cv.getContext('2d');
      var tk = this.tank();
      var b = this.bands(tk);
      var bg = GG.TANK_BY_ID[tk.bg] || GG.scenesFor(tk.type)[0];
      c.clearRect(0, 0, CW, CH);

      c.save();
      GG.roundRect(c, 6, 6, CW - 12, CH - 12, 18); c.clip();
      this.drawScene(c, tk, bg, b, t);

      var self = this;
      var all = this.items();
      all.forEach(function (e) { e.pos = self.livePos(e); });
      all.sort(function (a, q) {
        return (a.kind === 'decor' ? a.it.y : a.pos.y) - (q.kind === 'decor' ? q.it.y : q.pos.y);
      });

      for (var i = 0; i < all.length; i++) {
        var e = all[i], it = e.it, pos = e.pos;
        if (e.kind === 'decor') {
          var fn = GG.DecorArt[it.id];
          if (fn) fn(c, it.x, it.y, 1.75, t + it.seed * 10);
        } else if (e.kind === 'friend') {
          var adef = GG.ANIMAL_BY_ID[it.id];
          if (!adef) continue;
          var am = this.motionFor(it);
          var afly = adef.family === 'hummingbird' || adef.family === 'bat';
          /* squashed a bit, so a hummingbird is still visible next to a
             labrador without the labrador filling the whole garden */
          var ascale = GG.animalFit(adef, 40 + 90 * GG.clamp(adef.size || 1, 0.2, 1));
          if (!afly) GG.AnimalArt.shadow(c, am.lx, am.ly + 3, 15, 0.16);
          else GG.AnimalArt.shadow(c, am.lx, b.ground[0] + 26, 12, 0.09);
          GG.AnimalArt.draw(c, adef, pos.x, pos.y, ascale, am.faceLeft, t + it.seed * 6, am.gait);
        } else if (e.kind === 'fish') {
          var fdef = GG.FISH_BY_ID[it.id];
          if (!fdef) continue;
          var fm = this.motionFor(it);
          GG.FishArt.draw(c, fdef, pos.x, pos.y + Math.sin(t * 1.4 + it.seed * 8) * 2, 1.5, fm.faceLeft, t + it.seed * 5);
        } else {
          var def = GG.BUG_BY_ID[it.id];
          if (!def) continue;
          var m = this.motionFor(it);
          var flyer = !GG.isAquaticBug(def) && !!AIR[def.behavior] && !!b.air;
          var bob = Math.sin(t * 1.8 + it.seed * 9) * (flyer ? 3.4 : 0.8);
          if (flyer || m.lift > 1) {
            var shadowY = b.id === 'hybrid' ? b.bank + 8 : b.air[1] + 36;
            GG.BugArt.shadow(c, m.lx, shadowY, 13, 0.1);
          }
          GG.BugArt.draw(c, def, pos.x, pos.y + bob, 3.5, m.face, t + it.seed * 6);
        }
        if (this.sel === it) {
          c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3;
          c.setLineDash([6, 6]); c.lineDashOffset = -t * 16;
          c.beginPath(); c.arc(pos.x, pos.y, 34, 0, Math.PI * 2); c.stroke();
          c.setLineDash([]);
        }
      }
      c.restore();

      if (b.id === 'habitat') {
        /* no glass on a garden - a wooden edge instead */
        c.strokeStyle = '#b9884f'; c.lineWidth = 9;
        GG.roundRect(c, 6, 6, CW - 12, CH - 12, 18); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 2.4;
        GG.roundRect(c, 12, 12, CW - 24, CH - 24, 14); c.stroke();
        return;
      }

      // glass
      c.strokeStyle = '#dceef6'; c.lineWidth = 8;
      GG.roundRect(c, 6, 6, CW - 12, CH - 12, 18); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3;
      GG.roundRect(c, 12, 12, CW - 24, CH - 24, 14); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.10)';
      c.beginPath();
      c.moveTo(40, 14); c.lineTo(150, 14); c.lineTo(70, CH - 14); c.lineTo(14, CH - 14);
      c.closePath(); c.fill();
      c.fillStyle = '#b9884f';
      GG.roundRect(c, 0, CH - 26, CW, 26, 10); c.fill();
      c.fillStyle = '#a0703c';
      GG.roundRect(c, 0, CH - 26, CW, 8, 4); c.fill();
    },

    loop: function () {
      var self = this;
      cancelAnimationFrame(this._raf);
      var start = performance.now(), last = start;
      function frame(now) {
        if ($('screen-terrarium').classList.contains('hidden')) return;
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        self._ft = (now - start) / 1000;
        self.step(dt);
        self.draw(self._ft);
        self._raf = requestAnimationFrame(frame);
      }
      this._raf = requestAnimationFrame(frame);
    },

    toCanvas: function (ev) {
      var cv = $('tank-canvas'), r = cv.getBoundingClientRect();
      var p = ev.touches ? ev.touches[0] : ev;
      return { x: (p.clientX - r.left) / r.width * CW, y: (p.clientY - r.top) / r.height * CH };
    },

    dragLimits: function (e) {
      var tk = this.tank(), b = this.bands(tk);
      if (e.kind === 'fish') return b.water;
      if (e.kind === 'decor') return [b.decor[0], b.decor[1] + 10];
      if (e.kind === 'friend') return this.friendBand(GG.ANIMAL_BY_ID[e.it.id], b);
      return bandFor(GG.BUG_BY_ID[e.it.id], b);
    },

    /* A still picture of one particular tank, for the "get rid of it" card. */
    previewInto: function (cv, tk) {
      var c = cv.getContext('2d');
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      c.scale(cv.width / CW, cv.height / CH);
      var b = this.bands(tk);
      var bg = GG.TANK_BY_ID[tk.bg] || GG.scenesFor(tk.type)[0];
      this.drawScene(c, tk, bg, b, 1.4);

      var all = [];
      tk.decor.forEach(function (d) { all.push({ kind: 'decor', it: d, y: d.y }); });
      (tk.fish || []).forEach(function (f) { all.push({ kind: 'fish', it: f, y: f.y }); });
      tk.bugs.forEach(function (x) { all.push({ kind: 'bug', it: x, y: x.y }); });
      (tk.friends || []).forEach(function (f) { all.push({ kind: 'friend', it: f, y: f.y }); });
      all.sort(function (a, q) { return a.y - q.y; });

      for (var i = 0; i < all.length; i++) {
        var e = all[i], it = e.it, def;
        if (e.kind === 'decor') {
          var fn = GG.DecorArt[it.id];
          if (fn) fn(c, it.x, it.y, 1.75, 1.4 + it.seed * 10);
        } else if (e.kind === 'fish') {
          def = GG.FISH_BY_ID[it.id];
          if (def) GG.FishArt.draw(c, def, it.x, it.y, 1.5, false, 1.4);
        } else if (e.kind === 'friend') {
          def = GG.ANIMAL_BY_ID[it.id];
          if (def) {
            GG.AnimalArt.draw(c, def, it.x, it.y,
              GG.animalFit(def, 40 + 90 * GG.clamp(def.size || 1, 0.2, 1)), false, 1.4);
          }
        } else {
          def = GG.BUG_BY_ID[it.id];
          if (def) GG.BugArt.draw(c, def, it.x, it.y, 3.5, -Math.PI / 2, 1.4);
        }
      }
      c.restore();
    },

    /* What is in a tank, in words Guin can read. */
    contentsLine: function (tk) {
      var bits = [], total = 0;
      function say(n, one, many) {
        if (!n) return;
        total += n;
        bits.push(n + ' ' + (n === 1 ? one : many));
      }
      say(tk.bugs.length, 'creature', 'creatures');
      say((tk.fish || []).length, 'fish', 'fish');
      say((tk.friends || []).length, 'friend', 'friends');
      say(tk.decor.length, 'decoration', 'decorations');
      if (!bits.length) return 'It is completely empty.';
      var last = bits.pop();
      var list = bits.length ? bits.join(', ') + ' and ' + last : last;
      return (total === 1 ? 'There is ' : 'There are ') + list + ' in it.';
    },

    /* ---------- changing a tank's kind ---------- */

    /* What would have to come out if this tank became `type`? Nothing is
       destroyed - it all lives in the books and the decoration box already. */
    wouldMove: function (tk, type) {
      var ty = GG.TANK_TYPE_BY_ID[type] || {};
      var out = { bugs: 0, fish: 0, friends: 0, decor: 0 };
      tk.bugs.forEach(function (x) {
        if (!ty.maxBugs || !GG.bugFitsTank(GG.BUG_BY_ID[x.id], type)) out.bugs++;
      });
      out.fish = ty.maxFish ? Math.max(0, (tk.fish || []).length - ty.maxFish) : (tk.fish || []).length;
      out.friends = ty.maxFriends ? Math.max(0, (tk.friends || []).length - ty.maxFriends)
        : (tk.friends || []).length;
      tk.decor.forEach(function (x) {
        if (!GG.decorFits(GG.DECOR_BY_ID[x.id], type)) out.decor++;
      });
      /* and anything over the new limits */
      var keptBugs = tk.bugs.length - out.bugs;
      if (ty.maxBugs && keptBugs > ty.maxBugs) out.bugs += keptBugs - ty.maxBugs;
      var keptDecor = tk.decor.length - out.decor;
      if (ty.maxDecor && keptDecor > ty.maxDecor) out.decor += keptDecor - ty.maxDecor;
      out.total = out.bugs + out.fish + out.friends + out.decor;
      return out;
    },

    /* Turn this tank into another kind. */
    changeType: function (type) {
      var tk = this.tank(), ty = GG.TANK_TYPE_BY_ID[type];
      if (!ty || tk.type === type) return false;
      var moved = this.wouldMove(tk, type);

      tk.bugs = tk.bugs.filter(function (x) {
        return ty.maxBugs && GG.bugFitsTank(GG.BUG_BY_ID[x.id], type);
      }).slice(0, ty.maxBugs || 0);
      tk.fish = (ty.maxFish ? (tk.fish || []) : []).slice(0, ty.maxFish || 0);
      tk.friends = (ty.maxFriends ? (tk.friends || []) : []).slice(0, ty.maxFriends || 0);
      tk.decor = tk.decor.filter(function (x) {
        return GG.decorFits(GG.DECOR_BY_ID[x.id], type);
      }).slice(0, ty.maxDecor || 0);

      tk.type = type;
      tk.bg = GG.defaultSceneFor(type);

      /* everything left has to sit somewhere legal in the new layout */
      var b = this.bands(tk), self = this;
      this._motion = null;
      tk.bugs.forEach(function (x) { self.reseat(x, bandFor(GG.BUG_BY_ID[x.id], b)); });
      tk.fish.forEach(function (x) { self.reseat(x, b.water); });
      tk.friends.forEach(function (x) { self.reseat(x, self.friendBand(GG.ANIMAL_BY_ID[x.id], b)); });
      tk.decor.forEach(function (x) { self.reseat(x, b.decor); });

      this.sel = null; this.drag = null;
      GG.Save.save();
      this.refresh();
      GG.Sfx.place();

      var msg = 'This is a ' + ty.name.toLowerCase() + ' now!';
      if (moved.total) {
        msg += ' ' + moved.total + (moved.total === 1 ? ' thing went' : ' things went') +
          ' back to your books, safe and sound.';
      }
      GG.UI.toast(msg, 3600);
      return true;
    },

    reseat: function (it, band) {
      if (!band) return;
      it.y = GG.clamp(it.y, band[0] + 4, band[1] - 4);
      it.x = GG.clamp(it.x, 44, CW - 44);
    },

    /* Getting rid of a tank: never the last one, and always asked twice. */
    askDelete: function () {
      var d = GG.Save.data;
      if (d.terrariums.length <= 1) {
        GG.UI.toast('This is your only tank, so it has to stay. Make another one first.', 3200);
        return false;
      }
      var tk = this.tank();
      $('deltank-name').textContent = tk.name;
      $('deltank-what').textContent = this.contentsLine(tk);
      GG.UI.open('screen-deltank');
      this.previewInto($('deltank-art'), tk);
      return true;
    },

    doDelete: function () {
      var d = GG.Save.data;
      if (d.terrariums.length <= 1) return false;
      var gone = d.terrariums.splice(this.index, 1)[0];
      if (this.index >= d.terrariums.length) this.index = d.terrariums.length - 1;
      this.sel = null;
      this.drag = null;
      GG.Save.save();
      GG.UI.close('screen-deltank');
      this.refresh();
      GG.UI.toast(gone.name + ' is gone. Everything that was in it is safe in your books.', 3400);
      return true;
    },

    /* Little pictures of each kind of tank on the chooser. The same screen
       does double duty: buying a new tank, and changing this one's kind. */
    openChooser: function (mode) {
      var d = GG.Save.data;
      this.chooserMode = mode;
      var changing = mode === 'change';
      $('newtank-title').textContent = changing ? 'What kind should it be?' : 'A new tank';
      $('newtank-cost').hidden = changing;
      if (!changing) $('newtank-cost').textContent = '✦ ' + (d.terrariums.length * 250);
      var note = $('newtank-note');
      note.hidden = !changing;
      if (changing) {
        note.textContent = 'Changing the kind is free. Anything that cannot live in the new ' +
          'kind goes back to your books, and your decorations stay bought.';
      }
      GG.UI.open('screen-newtank');
      this.drawChooser();
    },

    drawChooser: function () {
      var self = this;
      var changing = this.chooserMode === 'change';
      var cur = changing ? this.tank() : null;
      document.querySelectorAll('#newtank-list .newtank').forEach(function (el) {
        var type = el.getAttribute('data-type');
        var warn = el.querySelector('.nt-warn');
        el.classList.toggle('current', !!cur && cur.type === type);
        if (warn) {
          if (!changing) { warn.hidden = true; }
          else if (cur.type === type) { warn.hidden = false; warn.textContent = 'This is what it is now.'; }
          else {
            var m = self.wouldMove(cur, type);
            warn.hidden = false;
            warn.textContent = m.total
              ? m.total + (m.total === 1 ? ' thing would come out' : ' things would come out') +
                ' and go back to your books.'
              : 'Everything in it can stay.';
          }
        }
        var cv = el.querySelector('canvas');
        var c = cv.getContext('2d');
        c.save();
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, cv.width, cv.height);
        c.scale(cv.width / CW, cv.height / CH);
        var tk = { type: type, bg: GG.defaultSceneFor(type), bugs: [], fish: [], decor: [], friends: [] };
        var b = self.bands(tk);
        self.drawScene(c, tk, GG.TANK_BY_ID[tk.bg], b, 1.2);
        if (type === 'habitat') {
          var dg = GG.ANIMAL_BY_ID.corgi, hb = GG.ANIMAL_BY_ID.ruby_hummingbird;
          if (dg) GG.AnimalArt.draw(c, dg, 410, b.ground[0] + 66, GG.animalFit(dg, 170), true, 1.2);
          if (hb) GG.AnimalArt.draw(c, hb, 190, b.air[0] + 96, GG.animalFit(hb, 110), false, 1.2);
          c.restore();
          return;
        }
        if (type !== 'aquarium') {
          GG.BugArt.draw(c, GG.BUG_BY_ID.monarch, 200, b.air[0] + 80, 3.6, -Math.PI / 2, 1.2);
          GG.BugArt.draw(c, GG.BUG_BY_ID.ladybug, 430, b.ground[0] + 14, 3.4, 0, 1.2);
        }
        if (type !== 'terrarium') {
          GG.FishArt.draw(c, GG.FISH_BY_ID.bluegill, 250, (b.water[0] + b.water[1]) / 2, 1.7, false, 1.2);
          GG.FishArt.draw(c, GG.FISH_BY_ID.goldfish, 440, (b.water[0] + b.water[1]) / 2 + 26, 1.5, true, 1.2);
        }
        c.restore();
      });
    },

    initEvents: function () {
      var self = this, cv = $('tank-canvas');

      function down(ev) {
        ev.preventDefault();
        var p = self.toCanvas(ev);
        var hit = self.pick(p.x, p.y);
        if (hit && hit.kind !== 'decor') {
          var m = self.motionFor(hit.it);
          hit.it.x = m.lx; hit.it.y = m.ly - m.lift;
          m.ox = 0; m.oy = 0; m.lift = 0;
        }
        self.sel = hit ? hit.it : null;
        self.drag = hit ? { e: hit, dx: p.x - hit.it.x, dy: p.y - hit.it.y } : null;
        $('tank-remove').style.display = self.sel ? '' : 'none';
        if (hit) GG.Sfx.click();
      }
      function move(ev) {
        if (!self.drag) return;
        ev.preventDefault();
        var p = self.toCanvas(ev);
        var it = self.drag.e.it;
        var lim = self.dragLimits(self.drag.e);
        it.x = GG.clamp(p.x - self.drag.dx, 34, CW - 34);
        it.y = GG.clamp(p.y - self.drag.dy, lim[0], lim[1]);
      }
      function up() { if (self.drag) { GG.Save.save(); self.drag = null; } }

      cv.addEventListener('touchstart', down, { passive: false });
      cv.addEventListener('touchmove', move, { passive: false });
      cv.addEventListener('touchend', up);
      cv.addEventListener('mousedown', down);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);

      document.querySelectorAll('#screen-terrarium .tabs .tab').forEach(function (el) {
        el.addEventListener('click', function () {
          GG.Sfx.click();
          self.tab = el.getAttribute('data-tab');
          self.buildTray();
        });
      });

      $('tank-prev').addEventListener('click', function () {
        GG.Sfx.click();
        var n = GG.Save.data.terrariums.length;
        self.index = (self.index - 1 + n) % n; self.sel = null; self.refresh();
      });
      $('tank-next').addEventListener('click', function () {
        GG.Sfx.click();
        var n = GG.Save.data.terrariums.length;
        self.index = (self.index + 1) % n; self.sel = null; self.refresh();
      });
      $('tank-remove').addEventListener('click', function () { GG.Sfx.click(); self.removeSelected(); });
      $('tank-clear').addEventListener('click', function () {
        GG.Sfx.click();
        var tk = self.tank();
        tk.bugs = []; tk.decor = []; tk.fish = []; tk.friends = []; self.sel = null;
        GG.Save.save(); self.refresh();
      });
      $('tank-rename').addEventListener('click', function () {
        GG.Sfx.click();
        var tk = self.tank();
        var v = window.prompt('What should this tank be called?', tk.name);
        if (v != null && v.trim()) { tk.name = v.trim().slice(0, 28); GG.Save.save(); self.refresh(); }
      });
      $('tank-bg').addEventListener('click', function () {
        GG.Sfx.click();
        var tk = self.tank();
        var owned = GG.scenesFor(tk.type).filter(function (b) {
          return b.price === 0 || GG.Save.data.unlockedDecor.indexOf('bg_' + b.id) >= 0;
        });
        if (owned.length < 2) { GG.UI.toast('Buy another scene in the Decoration Box first'); return; }
        var i = 0;
        owned.forEach(function (b, k) { if (b.id === tk.bg) i = k; });
        tk.bg = owned[(i + 1) % owned.length].id;
        GG.Save.save(); self.refresh();
        GG.UI.toast('Scene: ' + GG.TANK_BY_ID[tk.bg].name);
      });

      $('tank-delete').addEventListener('click', function () {
        GG.Sfx.click();
        self.askDelete();
      });
      $('deltank-yes').addEventListener('click', function () {
        GG.Sfx.click();
        self.doDelete();
      });

      $('tank-new').addEventListener('click', function () {
        GG.Sfx.click();
        var d = GG.Save.data;
        if (d.terrariums.length >= GG.MAX_TANKS) {
          GG.UI.toast(GG.MAX_TANKS + ' tanks is plenty!'); return;
        }
        self.openChooser('new');
      });

      $('tank-type').addEventListener('click', function () {
        GG.Sfx.click();
        self.openChooser('change');
      });

      document.querySelectorAll('#newtank-list .newtank').forEach(function (el) {
        el.addEventListener('click', function () {
          var d = GG.Save.data;
          var type = el.getAttribute('data-type');

          if (self.chooserMode === 'change') {
            GG.Sfx.click();
            if (self.tank().type === type) {
              GG.UI.toast('It is already a ' + GG.TANK_TYPE_BY_ID[type].name.toLowerCase() + '.');
              return;
            }
            self.changeType(type);
            GG.UI.close('screen-newtank');
            return;
          }

          var cost = d.terrariums.length * 250;
          if (d.terrariums.length >= GG.MAX_TANKS) {
            GG.UI.toast(GG.MAX_TANKS + ' tanks is plenty!'); return;
          }
          if (d.sparkles < cost) { GG.UI.toast('That costs ✦ ' + cost); return; }
          d.sparkles -= cost;
          var ty = GG.TANK_TYPE_BY_ID[type];
          d.terrariums.push({
            name: ty.name + ' ' + (d.terrariums.length + 1),
            type: type, bg: GG.defaultSceneFor(type), decor: [], bugs: [], fish: [], friends: []
          });
          self.index = d.terrariums.length - 1;
          GG.Sfx.coin();
          GG.Save.save(); GG.UI.refreshHud();
          GG.UI.close('screen-newtank');
          self.sel = null; self.refresh();
          GG.UI.toast('A brand new ' + ty.name.toLowerCase() + '!');
        });
      });
    }
  };
})(window.GG = window.GG || {});
