/* Bugs living in the world: where they appear, how they move, how they get away. */
(function (GG) {
  'use strict';

  var TARGET = 16;

  /* water kind -> which habitat name the roster uses */
  var WATER_BIOME = { 1: 'pond', 2: 'river', 3: 'river', 4: 'sea', 5: 'sea', 6: 'tidepool', 7: 'swamp' };

  /* What happens after a sting, species by species. Of everything that stings
     in this garden, the honeybee worker is the one that dies of it: her
     stinger is strongly barbed, it catches in our skin and tears away from
     her. The others pull theirs back out and go on with their day (a few
     harvester ants elsewhere lose theirs too, but that has not been shown for
     ours). A stinger is a changed egg-laying tube, so only the girls have one.
     Checked: UC IPM, Virginia Tech ENTO-49, Visscher et al. Lancet 1996,
     Burke Museum, WSU, Clemson HGIC, Utah State. */
  GG.stingDies = function (def) { return !!def && def.id === 'honeybee'; };
  GG.STING_LINES = {
    honeybee: 'Ouch! A honeybee stung you. Her stinger is barbed and stays in your skin, so she only ever gets one sting - she really did not want to. Get the stinger out as fast as you can.',
    bumblebee: 'Ouch! A bumblebee stung you. Her stinger has hardly any barbs, so she can sting again - but she only does it when she is squashed or scared. Give her some room.',
    polar_bumblebee: 'Ouch! A polar bumble bee stung you. Unlike a honeybee, she flew off fine. Give her room - it is cold up here and she is busy.',
    paper_wasp: 'Ouch! A paper wasp stung you. They sting to guard their nest. Walk slowly away - no swatting.',
    sand_wasp: 'Ouch! A sand wasp stung you. They almost never sting people, so you must have really bothered her. Only the girls can sting.',
    mason_bee: 'Ouch! A mason bee stung you. They almost never do, and it is a small sting - she must have been squashed.',
    yellowjacket: 'Ouch! A yellowjacket stung you. She can sting again and again, so step away calmly. Never swat - a squashed yellowjacket calls her sisters.',
    baldfaced_hornet: 'Ouch! A bald-faced hornet stung you. She is really a kind of yellowjacket, and she guards her paper nest hard. Back away slowly.',
    northern_scorpion: 'Ouch! A northern scorpion stung you. It hurts about as much as a bee sting, or less, and it fades. Tell a grown-up, and always shake out your shoes.',
    harvester_ant: 'Ouch! A harvester ant stung you - they really do have stingers, and it hurts. Keep off the bare dirt round their mound.',
    velvet_ant: 'Ouch! A velvet ant stung you. She is really a wasp with no wings, and her sting is famous for hurting a lot. Look, but leave her be.',
    sweat_bee: 'Ouch! A sweat bee stung you. They only sting when they get trapped against your skin, and it is a small one.',
    thatching_ant: 'Ouch! A thatching ant got you. They have no stinger at all - that was a bite, with a squirt of acid in it.',
    leafcutter_bee: 'Ouch! A leafcutter bee stung you. They hardly ever sting and it is a mild one - she must have been squeezed.'
  };
  GG.stingLine = function (def) {
    if (!def) return 'Ouch!';
    return GG.STING_LINES[def.id] ||
      ('Ouch! A ' + def.name.toLowerCase() + ' stung you. Give her some space and she will calm down.');
  };

  /* The little red cross that means "this bee is cross with you". */
  function angerMark(c, x, y, r) {
    c.strokeStyle = '#ff3b3b';
    c.lineWidth = Math.max(1.5, r * 0.34);
    c.lineCap = 'round';
    for (var i = 0; i < 2; i++) {
      var a = i * Math.PI / 2 - 0.4;
      c.beginPath();
      c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      c.lineTo(x, y);
      c.lineTo(x + Math.cos(a + Math.PI / 2) * r, y + Math.sin(a + Math.PI / 2) * r);
      c.stroke();
    }
  }

  var Critters = GG.Critters = {
    list: [],
    fx: [],

    clear: function () { this.list.length = 0; this.fx.length = 0; },

    /* Some of the newer places are small pockets of somewhere else - a grove
       people planted, a nest-box trail along a meadow edge, a farmyard. They
       have a few species of their own and they borrow the rest from next door,
       which is also what really happens. */
    ALSO: {
      birdtown: ['meadow', 'garden'], farmyard: ['meadow', 'garden'],
      cherry: ['orchard', 'meadow'], bamboo: ['garden', 'forest'],
      savanna: ['meadow', 'hill'], badlands: ['desert', 'hill'],
      swamp: ['pond', 'riverbank']
    },

    eligible: function (biome, phase, rain) {
      var out = [];
      var also = this.ALSO[biome] || null;
      for (var i = 0; i < GG.BUGS.length; i++) {
        var b = GG.BUGS[i];
        var okPlace = b.habitats.indexOf(biome) >= 0 || b.habitats.indexOf('anywhere') >= 0;
        if (!okPlace && also) {
          for (var k = 0; k < also.length; k++) {
            if (b.habitats.indexOf(also[k]) >= 0) { okPlace = true; break; }
          }
        }
        if (!okPlace) continue;
        var okTime = b.times.indexOf('any') >= 0 || b.times.indexOf(phase) >= 0;
        if (!okTime) continue;
        if (rain && (b.behavior === 'flutter' || b.behavior === 'hover') && b.rarity < 4) continue;
        var w = 1 / Math.pow(b.rarity, 1.75);
        if (rain && (b.behavior === 'slow' || b.behavior === 'crawl')) w *= 2.4;
        out.push({ b: b, w: w });
      }
      return out;
    },

    pickWeighted: function (cands) {
      var total = 0, i;
      for (i = 0; i < cands.length; i++) total += cands[i].w;
      var r = Math.random() * total;
      for (i = 0; i < cands.length; i++) { r -= cands[i].w; if (r <= 0) return cands[i].b; }
      return cands.length ? cands[cands.length - 1].b : null;
    },

    /* Indoors (the lava tube) there is no world map to ask, so a room can
       stand in for one: its own size, its own walls, and one biome. */
    room: null,

    spawnNear: function (px, py, radMin, radMax) {
      var W = GG.World, phase = GG.Time.phase(), rain = GG.Time.rain;
      var R = this.room;
      if (R) {
        for (var k = 0; k < 14; k++) {
          var ra = Math.random() * Math.PI * 2, rd = GG.rand(radMin, radMax);
          var rx = px + Math.cos(ra) * rd, ry = py + Math.sin(ra) * rd;
          if (rx < 50 || ry < 50 || rx > R.W - 50 || ry > R.H - 50) continue;
          if (R.blocked(rx, ry, 8)) continue;
          var rc = this.eligible(R.biome, phase, false).filter(function (c) {
            return c.b.behavior !== 'skim' && c.b.behavior !== 'tide';
          });
          if (!rc.length) return false;
          var rdef = this.pickWeighted(rc);
          if (!rdef) continue;
          this.add(rdef, rx, ry);
          return true;
        }
        return false;
      }
      for (var attempt = 0; attempt < 14; attempt++) {
        var a = Math.random() * Math.PI * 2;
        var d = GG.rand(radMin, radMax);
        var x = px + Math.cos(a) * d, y = py + Math.sin(a) * d;
        if (x < 60 || y < 70 || x > W.W - 60 || y > W.H - 60) continue;
        var kind = W.waterKind(x, y);
        var onWater = kind !== 0;
        var inPool = kind === W.KIND.TIDEPOOL;
        var biome = onWater ? WATER_BIOME[kind] : W.biomeRaw(x, y);
        var cands = this.eligible(biome, phase, rain);
        if (!cands.length) continue;
        // Skimmers on open water, tidepool creatures in the pools,
        // and everybody else on dry land.
        cands = cands.filter(function (c) {
          var bh = c.b.behavior;
          if (inPool) return bh === 'tide' || bh === 'skim';
          if (onWater) return bh === 'skim';
          return bh !== 'skim' && bh !== 'tide';
        });
        if (!cands.length) continue;
        var def = this.pickWeighted(cands);
        if (!def) continue;
        if (!onWater && W.blocked(x, y, 6)) continue;
        this.add(def, x, y);
        return true;
      }
      return false;
    },

    add: function (def, x, y) {
      var z = { flutter: 20, hover: 15, dart: 22, drift: 13, glow: 17, skim: 1,
        crawl: 0, hop: 0, cling: 3, slow: 0, tide: 0 }[def.behavior] || 0;
      this.list.push({
        def: def, x: x, y: y, z: z, baseZ: z,
        vx: 0, vy: 0, angle: Math.random() * Math.PI * 2,
        t: Math.random() * 100, state: 'wander', timer: GG.rand(0.6, 2.4),
        alert: 0, flee: 0, hop: 0, life: 0, scale: 1, angry: 0
      });
    },

    update: function (dt, player) {
      var W = GG.World;
      var i, b;

      // keep a lively number of bugs around the player
      var vw = GG.view.w, vh = GG.view.h;
      var outer = Math.max(vw, vh) * 0.95 + 220;
      for (i = this.list.length - 1; i >= 0; i--) {
        b = this.list[i];
        if (GG.dist(b.x, b.y, player.x, player.y) > outer * 1.35) this.list.splice(i, 1);
      }
      var want = TARGET + (GG.Time.phase() === 'night' ? 2 : 0);
      var guard = 0;
      while (this.list.length < want && guard++ < 4) {
        this.spawnNear(player.x, player.y, Math.max(vw, vh) * 0.42 + 40, outer);
      }

      for (i = 0; i < this.list.length; i++) {
        b = this.list[i];
        var d = b.def;
        b.t += dt; b.life += dt;

        var toP = GG.dist(b.x, b.y, player.x, player.y);
        var scared = player.speed > 62 ? d.shy : d.shy * 0.55;
        if (player.swinging()) scared = d.shy * 1.15;

        if (b.flee <= 0 && toP < scared) {
          if (b.alert <= 0) { b.alert = 0.35; }
          b.alert -= dt;
          if (b.alert <= 0) {
            b.flee = GG.rand(1.3, 2.6);
            b.angle = Math.atan2(b.y - player.y, b.x - player.x) + GG.rand(-0.5, 0.5);
          }
        } else if (b.flee <= 0) {
          b.alert = 0;
        }
        if (b.flee > 0) b.flee -= dt;

        /* the food chain: creep up on something you really would hunt */
        b.hunt = (b.hunt || 0) - dt;
        if (b.hunt <= 0) {
          b.hunt = GG.rand(0.3, 0.7);
          b.prey = null;
          if (b.flee <= 0 && !b.angry && GG.EATS && GG.EATS[d.id]) {
            var bestD = 150, target = null;
            for (var q = 0; q < this.list.length; q++) {
              var o2 = this.list[q];
              if (o2 === b || !GG.hunts(d.id, o2.def.id)) continue;
              var dd = GG.dist(b.x, b.y, o2.x, o2.y);
              if (dd < bestD) { bestD = dd; target = o2; }
            }
            b.prey = target;
          }
        }
        if (b.prey && b.flee <= 0) {
          if (this.list.indexOf(b.prey) < 0) { b.prey = null; }
          else {
            var pd = GG.dist(b.x, b.y, b.prey.x, b.prey.y);
            if (pd > 160) { b.prey = null; }
            else {
              b.angle = GG.angLerp(b.angle,
                Math.atan2(b.prey.y - b.y, b.prey.x - b.x), Math.min(1, dt * 2.4));
              /* close enough to be noticed - and it always gets away */
              if (pd < 34) {
                b.prey.flee = GG.rand(1.4, 2.4);
                b.prey.alert = 0;
                b.prey.angle = Math.atan2(b.prey.y - b.y, b.prey.x - b.x) + GG.rand(-0.5, 0.5);
                b.prey = null;
                b.hunt = GG.rand(2.4, 4.5);
              }
            }
          }
        }

        var sp = d.speed * (b.flee > 0 ? 1.95 : (b.prey ? 1.25 : 1));
        b.timer -= dt;

        if (b.angry > 0) {
          // A cross bee forgets about flowers and comes straight for you.
          b.angry -= dt;
          b.flee = 0; b.alert = 0;
          var chaseAng = Math.atan2(player.y - 14 - b.y, player.x - b.x);
          b.angle = GG.angLerp(b.angle, chaseAng, Math.min(1, dt * 5));
          var chase = d.speed * 2.05;
          b.vx = Math.cos(b.angle) * chase;
          b.vy = Math.sin(b.angle) * chase;
          b.z = b.baseZ + Math.sin(b.t * 17) * 2.4;
          if (b.angry <= 0) { b.angry = 0; b.flee = 2.4; b.angle += Math.PI; }
        } else
        switch (d.behavior) {
          case 'flutter':
            if (b.timer <= 0 && b.flee <= 0) { b.angle += GG.rand(-1.5, 1.5); b.timer = GG.rand(0.5, 1.6); }
            b.angle += Math.sin(b.t * 3.2) * dt * 1.6;
            b.vx = Math.cos(b.angle) * sp; b.vy = Math.sin(b.angle) * sp;
            b.z = b.baseZ + Math.sin(b.t * 3.6) * 4;
            break;
          case 'hover':
            if (b.timer <= 0 && b.flee <= 0) { b.angle += GG.rand(-2.2, 2.2); b.timer = GG.rand(0.35, 1.1); }
            var hoverSlow = (b.flee <= 0 && Math.sin(b.t * 0.7) > 0.6) ? 0.12 : 1;
            b.vx = Math.cos(b.angle) * sp * hoverSlow; b.vy = Math.sin(b.angle) * sp * hoverSlow;
            b.z = b.baseZ + Math.sin(b.t * 8) * 1.6;
            break;
          case 'dart':
            if (b.timer <= 0) {
              b.angle += GG.rand(-2.4, 2.4);
              b.timer = b.flee > 0 ? 0.5 : GG.rand(0.35, 1.5);
              b.dash = b.flee > 0 ? 1 : (Math.random() < 0.55 ? 1 : 0);
            }
            var dm = b.dash ? 1 : 0.06;
            b.vx = Math.cos(b.angle) * sp * dm; b.vy = Math.sin(b.angle) * sp * dm;
            b.z = b.baseZ + Math.sin(b.t * 2.2) * 3;
            break;
          case 'drift':
            if (b.timer <= 0) { b.angle += GG.rand(-1.1, 1.1); b.timer = GG.rand(0.7, 2); }
            b.vx = Math.cos(b.angle) * sp * 0.8; b.vy = Math.sin(b.angle) * sp * 0.8;
            b.z = b.baseZ + Math.sin(b.t * 4) * 2.5;
            break;
          case 'glow':
            if (b.timer <= 0) { b.angle += GG.rand(-2, 2); b.timer = GG.rand(0.8, 2.2); }
            b.vx = Math.cos(b.angle) * sp * 0.7; b.vy = Math.sin(b.angle) * sp * 0.7;
            b.z = b.baseZ + Math.sin(b.t * 1.4) * 7;
            break;
          case 'hop':
            if (b.timer <= 0) {
              b.timer = b.flee > 0 ? GG.rand(0.5, 0.8) : GG.rand(1.1, 2.6);
              b.hop = 0.45;
              if (b.flee <= 0) b.angle += GG.rand(-2, 2);
            }
            if (b.hop > 0) {
              b.hop -= dt;
              var hp = 1 - b.hop / 0.45;
              b.z = Math.sin(hp * Math.PI) * (b.flee > 0 ? 26 : 16);
              b.vx = Math.cos(b.angle) * sp * 2.6; b.vy = Math.sin(b.angle) * sp * 2.6;
            } else { b.z = 0; b.vx = b.vy = 0; }
            break;
          case 'skim':
            if (b.timer <= 0) { b.angle += GG.rand(-2.6, 2.6); b.timer = GG.rand(0.25, 0.9); b.dash = 1; }
            b.dash = Math.max(0, (b.dash || 0) - dt * 4);
            b.vx = Math.cos(b.angle) * sp * (0.12 + b.dash * 1.6);
            b.vy = Math.sin(b.angle) * sp * (0.12 + b.dash * 1.6);
            break;
          case 'cling':
            if (b.timer <= 0) { b.angle += GG.rand(-1.6, 1.6); b.timer = GG.rand(1.6, 4); }
            var mv = b.flee > 0 ? 1 : (Math.sin(b.t * 0.5) > 0.75 ? 0.5 : 0);
            b.vx = Math.cos(b.angle) * sp * mv; b.vy = Math.sin(b.angle) * sp * mv;
            b.z = 3 + Math.sin(b.t * 2) * 0.6;
            break;
          case 'tide':
            /* pottering along the bottom of a pool, never leaving it */
            if (b.timer <= 0) { b.angle += GG.rand(-1.8, 1.8); b.timer = GG.rand(2.4, 5.5); }
            var drift = sp * (b.flee > 0 ? 1.4 : (Math.sin(b.t * 0.4) > 0.2 ? 1 : 0.15));
            b.vx = Math.cos(b.angle) * drift; b.vy = Math.sin(b.angle) * drift;
            b.z = 0;
            break;
          case 'slow':
          case 'crawl':
          default:
            if (b.timer <= 0) { b.angle += GG.rand(-1.4, 1.4); b.timer = GG.rand(1, 3); }
            b.vx = Math.cos(b.angle) * sp; b.vy = Math.sin(b.angle) * sp;
            b.z = 0;
            break;
        }

        var nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
        var onWater = d.behavior === 'skim';
        var okx, oky;
        if (d.behavior === 'tide') {
          okx = W.waterKind(nx, b.y) === W.KIND.TIDEPOOL;
          oky = W.waterKind(b.x, ny) === W.KIND.TIDEPOOL;
        } else if (onWater) {
          okx = W.isWater(nx, b.y); oky = W.isWater(b.x, ny);
        } else if (b.z > 8) {
          okx = !W.isWater(nx, b.y) && nx > 40 && nx < W.W - 40;
          oky = !W.isWater(b.x, ny) && ny > 60 && ny < W.H - 40;
        } else {
          if (this.room) {
            okx = !this.room.blocked(nx, b.y, 4); oky = !this.room.blocked(b.x, ny, 4);
          } else {
            okx = !W.blocked(nx, b.y, 4); oky = !W.blocked(b.x, ny, 4);
          }
        }
        if (okx) b.x = nx; else b.angle = Math.PI - b.angle + GG.rand(-0.3, 0.3);
        if (oky) b.y = ny; else b.angle = -b.angle + GG.rand(-0.3, 0.3);
      }

      for (i = this.fx.length - 1; i >= 0; i--) {
        var f = this.fx[i];
        f.life -= dt;
        f.x += f.vx * dt; f.y += f.vy * dt;
        f.vy += (f.g || 0) * dt;
        if (f.life <= 0) this.fx.splice(i, 1);
      }
    },

    /* Did the net land on anything? */
    tryCatch: function (player) {
      var n = player.netPoint();
      var best = null, bestD = 1e9;
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        /* the look-only ones are never in the net, whatever she swings at */
        if (b.def.lookOnly) continue;
        var dz = Math.max(0, b.z - 26) * 0.8;
        var d = GG.dist(b.x, b.y - b.z * 0.5, n.x, n.y) + dz;
        var reach = n.r + 8 * (b.def.size || 1);
        if (d < reach && d < bestD) { bestD = d; best = b; }
      }
      if (!best) return null;
      this.list.splice(this.list.indexOf(best), 1);
      this.burst(best.x, best.y - best.z, best.def);
      return best.def;
    },

    /* Did she just swing the net at something she must not catch? */
    lookOnlyUnderNet: function (player) {
      var n = player.netPoint();
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        if (!b.def.lookOnly || b.looked) continue;
        var reach = n.r + 10 * (b.def.size || 1);
        if (GG.dist(b.x, b.y, n.x, n.y) < reach) return b;
      }
      return null;
    },

    /* The nearest look-only creature she is standing beside. */
    nearestLookOnly: function (player, radius) {
      var best = null, bestD = (radius || 74) * (radius || 74);
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        if (!b.def.lookOnly || b.looked) continue;
        var dx = player.x - b.x, dy = (player.y - b.y) * 1.15;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = b; }
      }
      return best;
    },

    /* Swing at a bee and miss and she takes it personally. */
    angerNear: function (x, y, radius) {
      var n = 0;
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        if (!b.def.sting || b.angry > 0) continue;
        if (GG.dist(b.x, b.y - b.z * 0.5, x, y) < radius) {
          b.angry = GG.rand(5.5, 7.5);
          b.flee = 0; b.alert = 0;
          n++;
        }
      }
      if (n) GG.Sfx.angryBuzz();
      return n;
    },

    /* Knock the beehive and a few guards come out. */
    stirHive: function (x, y) {
      var defs = [GG.BUG_BY_ID.honeybee, GG.BUG_BY_ID.bumblebee, GG.BUG_BY_ID.honeybee];
      for (var i = 0; i < 3; i++) {
        if (!defs[i]) continue;
        this.add(defs[i], x + GG.rand(-16, 16), y + GG.rand(-8, 14));
        this.list[this.list.length - 1].angry = GG.rand(6.5, 8.5);
      }
      this.puff(x, y);
      GG.Sfx.angryBuzz();
      return 3;
    },

    /* Did an angry bee reach Guin? */
    checkSting: function (player) {
      if (player.stingCool > 0 || player.stun > 0) return null;
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        if (b.angry <= 0 || !b.def.sting) continue;
        if (GG.dist(b.x, b.y - b.z * 0.4, player.x, player.y - 14) < 18) {
          var def = b.def;
          /* Only a honeybee dies of stinging someone: her stinger is barbed,
             it stays in the skin and tears away from her. Every other stinger
             in the garden is smooth - she pulls it out and flies off, and she
             is still here. (v1.15 - Guin: "Bees that are not honeybees
             disapaer when you get stung".) */
          if (GG.stingDies(def)) {
            this.list.splice(i, 1);
            this.puff(b.x, b.y - b.z);
          }
          this.scatter(player.x, player.y, 170);
          return def;
        }
      }
      return null;
    },

    /* Everything nearby bolts. */
    scatter: function (x, y, radius) {
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        if (GG.dist(b.x, b.y, x, y) < radius) {
          b.angry = 0;
          b.flee = GG.rand(1.8, 3);
          b.angle = Math.atan2(b.y - y, b.x - x) + GG.rand(-0.4, 0.4);
        }
      }
    },

    calmAll: function () {
      for (var i = 0; i < this.list.length; i++) this.list[i].angry = 0;
    },

    burst: function (x, y, def) {
      for (var i = 0; i < 14; i++) {
        var a = Math.random() * Math.PI * 2, s = GG.rand(30, 120);
        this.fx.push({
          x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, g: 110,
          life: GG.rand(0.4, 0.9), max: 0.9, col: i % 3 === 0 ? '#fff6b0' : (def.art.wing || '#ffffff')
        });
      }
    },

    puff: function (x, y) {
      for (var i = 0; i < 6; i++) {
        var a = Math.random() * Math.PI * 2;
        this.fx.push({ x: x, y: y, vx: Math.cos(a) * 26, vy: Math.sin(a) * 26 - 12, g: 20,
          life: 0.4, max: 0.4, col: '#ffffff' });
      }
    },

    draw: function (c, cam, t) {
      var A = GG.BugArt;
      var dark = GG.Time.isDark();
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        var sx = b.x - cam.x, sy = b.y - cam.y;
        if (sx < -60 || sy < -60 || sx > GG.view.w + 60 || sy > GG.view.h + 60) continue;
        if (b.z > 2) A.shadow(c, sx, sy, 5 * (b.def.size || 1), 0.16);
        var ang = Math.atan2(b.vy, b.vx);
        if (b.def.behavior === 'cling' || b.def.behavior === 'slow' ||
            b.def.behavior === 'tide') {
          if (Math.abs(b.vx) + Math.abs(b.vy) < 1) ang = b.angle;
        }
        if (b.angry > 0) sx += Math.sin(b.t * 44) * 0.9;
        A.draw(c, b.def, sx, sy - b.z, 1.15, ang, b.t * (b.angry > 0 ? 1.9 : 1));
        if (b.angry > 0) {
          angerMark(c, sx + 10, sy - b.z - 15 * (b.def.size || 1), 6.4 + Math.sin(b.t * 20) * 0.9);
        }
        if (b.alert > 0 && b.flee <= 0) {
          c.fillStyle = '#ffdf4a';
          c.font = 'bold 15px "Trebuchet MS", sans-serif';
          c.textAlign = 'center';
          c.fillText('!', sx, sy - b.z - 20 * (b.def.size || 1));
        }
      }
      for (var j = 0; j < this.fx.length; j++) {
        var f = this.fx[j];
        c.globalAlpha = Math.max(0, f.life / f.max);
        c.fillStyle = f.col;
        var r = 2.2 + 2.2 * (f.life / f.max);
        c.beginPath(); c.arc(f.x - cam.x, f.y - cam.y, r, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
    },

    /* How many kinds are out right now, for the little "nearby" hint. */
    nearbyNames: function (player, radius) {
      var seen = {}, out = [];
      for (var i = 0; i < this.list.length; i++) {
        var b = this.list[i];
        if (GG.dist(b.x, b.y, player.x, player.y) < radius && !seen[b.def.id]) {
          seen[b.def.id] = 1; out.push(b.def);
        }
      }
      return out;
    }
  };
})(window.GG = window.GG || {});
