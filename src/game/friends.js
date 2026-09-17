/* Garden Friends: the animals wandering the garden, and how you make friends.

   There is no net here and nothing can go wrong. She walks up to an animal, a
   green FRIEND button appears telling her the right thing to do for that kind
   of animal, she taps it, and then she has to KEEP STILL while a little ring
   fills up. Move about and the ring slips back a bit - it never empties, and
   the animal never runs off for good. Worst case she waits a moment longer.

   Every animal already befriended still wanders about; she just cannot be
   asked to befriend it twice.

   THE HUNT (Guin: "add the ability to for friends to hunt")

   Every friend that really hunts, hunts here. What it may go after comes
   from GG.ANIMAL_HUNTS in the roster, species by species, and nothing else
   is ever chased - a hummingbird will cross the garden for a gnat and take
   no notice of a dragonfly, and a bat never looks at the ground. Each family
   goes about it its own true way: a cat creeps and pounces, a dog runs
   straight in, a hummingbird hovers and picks, a bat swoops, and a frog does
   not chase at all - it sits perfectly still until dinner comes within reach
   of its tongue.

   Nothing is ever caught. Everything scatters and gets away, which is nearly
   what happens in the real world anyway: more than half of a cat's pounces
   end with the moth going free.

   AND GUIN'S RULE: friends never hunt friends.

   The awkward part is that some of them really would. A cat catches birds, a
   dog chases cats, a bullfrog swallows small frogs and bats. Rather than
   quietly leaving those pairs off the lists, the garden shows the rule
   happening: the hunter stops, sits down, and watches, three little dots
   appear over its head, and the book explains exactly why. That beat is the
   feature, not a hole in it.

   The parrots hunt nothing at all, because parrots do not hunt. They forage
   instead - see stepForage. */
(function (GG) {
  'use strict';

  var TARGET = 5;              // how many animals are about at once
  var NUDGE = 0.55;            // how much the ring slips back per second of moving

  var F = GG.Friends = {
    list: [],
    hearts: [],
    bits: [],                  // seed husks and bark from a foraging parrot
    /* the befriending in progress */
    busy: null,                // { animal, ring, need, from }
    companion: null,           // the friend tagging along today

    clear: function () {
      this.list.length = 0; this.hearts.length = 0; this.bits.length = 0;
      this.busy = null;
    },


    /* ---------- who could turn up here, and now? ---------- */
    eligible: function (place, phase) {
      var out = [];
      for (var i = 0; i < GG.ANIMALS.length; i++) {
        var a = GG.ANIMALS[i];
        if (a.places.indexOf(place) < 0) continue;
        if (a.times.indexOf('any') < 0 && a.times.indexOf(phase) < 0) continue;
        out.push({ a: a, w: 1 / Math.pow(a.rarity, 1.7) });
      }
      return out;
    },

    pickWeighted: function (cands) {
      var total = 0, i;
      for (i = 0; i < cands.length; i++) total += cands[i].w;
      var r = Math.random() * total;
      for (i = 0; i < cands.length; i++) { r -= cands[i].w; if (r <= 0) return cands[i].a; }
      return cands.length ? cands[cands.length - 1].a : null;
    },

    spawnNear: function (px, py, radMin, radMax) {
      var W = GG.World, phase = GG.Time.phase();
      for (var attempt = 0; attempt < 12; attempt++) {
        var ang = Math.random() * Math.PI * 2;
        var d = GG.rand(radMin, radMax);
        var x = px + Math.cos(ang) * d, y = py + Math.sin(ang) * d;
        if (x < 70 || y < 80 || x > W.W - 70 || y > W.H - 70) continue;
        if (W.isWater(x, y)) continue;
        if (W.blocked(x, y, 12)) continue;
        /* a cat would never be found next to the water */
        var catty = this.waterNear(x, y, 60);
        var place = W.biomeRaw(x, y);
        var cands = this.eligible(place, phase);
        if (!cands.length) continue;
        var def = this.pickWeighted(cands);
        if (!def) continue;
        if (def.family === 'cat' && catty) continue;
        /* never two of the same kind on screen at once, and never a second
           copy of the friend who is already walking with her */
        if (this.companion && this.companion.id === def.id) continue;
        for (var j = 0; j < this.list.length; j++) {
          if (this.list[j].def.id === def.id) { def = null; break; }
        }
        if (!def) continue;
        this.add(def, x, y);
        return true;
      }
      return false;
    },

    add: function (def, x, y) {
      this.list.push({
        def: def, x: x, y: y, hx: x, hy: y,
        ang: Math.random() * Math.PI * 2,
        t: Math.random() * 100, timer: GG.rand(0.6, 2.6),
        faceLeft: Math.random() < 0.5,
        hop: 0, bob: 0, shy: 0, curious: 0,
        friend: !!GG.Save.hasFriend(def.id)
      });
    },

    /* ---------- every frame ---------- */
    update: function (dt, player, scene) {
      var W = GG.World;
      this.scene = scene;
      if (scene !== 'world') { this.list.length = 0; this.busy = null; return; }

      /* keep a few about, and let the far-off ones wander off */
      var outer = Math.max(GG.view.w, GG.view.h) * 0.9 + 240;
      for (var i = this.list.length - 1; i >= 0; i--) {
        var f = this.list[i];
        if (this.busy && this.busy.animal === f) continue;
        if (GG.dist(f.x, f.y, player.x, player.y) > outer * 1.3) this.list.splice(i, 1);
      }
      var guard = 0;
      while (this.list.length < TARGET && guard++ < 4) {
        if (!this.spawnNear(player.x, player.y, 200, outer * 0.85)) break;
      }

      for (i = 0; i < this.list.length; i++) this.stepAnimal(dt, this.list[i], player);
      this.stepBusy(dt, player);
      this.stepCalls(dt, player);

      for (i = this.hearts.length - 1; i >= 0; i--) {
        var h = this.hearts[i];
        h.life -= dt; h.y -= dt * 26; h.x += Math.sin(h.life * 6) * 0.4;
        if (h.life <= 0) this.hearts.splice(i, 1);
      }
      for (i = this.bits.length - 1; i >= 0; i--) {
        var q = this.bits[i];
        q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 140 * dt;
        if (q.life <= 0) this.bits.splice(i, 1);
      }
      if (this.ruleSaid > 0) this.ruleSaid -= dt;
      void W;
    },

    /* Every now and then the nearest animal says something. Quiet, and never
       more than one at a time, so the garden does not turn into a zoo. */
    callTimer: 6,
    stepCalls: function (dt, player) {
      this.callTimer -= dt;
      if (this.callTimer > 0) return;
      this.callTimer = GG.rand(7, 15);
      var best = null, bd = 260;
      for (var i = 0; i < this.list.length; i++) {
        var f = this.list[i];
        var d = GG.dist(f.x, f.y, player.x, player.y);
        if (d < bd) { bd = d; best = f; }
      }
      if (best && GG.Sfx.animalCall) GG.Sfx.animalCall(best.def.family);
    },

    /* Is there water that way? Samples a ring around a point and reports the
       direction of the nearest water, and how close it is. */
    waterNear: function (x, y, radius) {
      var W = GG.World, best = null, bestD = 1e9;
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * Math.PI * 2;
        for (var r = radius * 0.45; r <= radius; r += radius * 0.55) {
          var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
          if (W.isWater(px, py) && r < bestD) { bestD = r; best = a; }
        }
      }
      return best == null ? null : { ang: best, dist: bestD };
    },

    /* The nearest creature this one would really hunt. Anything that is not
       on its own list simply does not register, however close it comes. */
    nearestPrey: function (f, radius) {
      var C = GG.Critters, best = null, bestD = radius;
      if (!C || !C.list) return null;
      var id = f.def.id;
      for (var i = 0; i < C.list.length; i++) {
        var b = C.list[i];
        if (!b.def || !GG.animalHunts(id, b.def.id)) continue;
        var d = GG.dist(f.x, f.y, b.x, b.y);
        if (d < bestD) { bestD = d; best = b; }
      }
      return best;
    },

    /* Guin's rule. Is there a friend nearby that this one really would hunt?
       The cat and the hummingbird, the dog and the cat, the bullfrog and
       very nearly everybody. */
    RULE_SEE: 195,
    friendRuleNear: function (f) {
      var best = null, bd = this.RULE_SEE, i, d;
      for (i = 0; i < this.list.length; i++) {
        var o = this.list[i];
        if (o === f) continue;
        var rule = GG.friendRuleFor(f.def, o.def);
        if (!rule) continue;
        d = GG.dist(f.x, f.y, o.x, o.y);
        if (d < bd) { bd = d; best = { x: o.x, y: o.y, rule: rule, def: o.def }; }
      }
      var comp = this.companion;
      if (comp) {
        var cdef = GG.ANIMAL_BY_ID[comp.id];
        var crule = cdef && GG.friendRuleFor(f.def, cdef);
        if (crule) {
          d = GG.dist(f.x, f.y, comp.x, comp.y);
          if (d < bd) best = { x: comp.x, y: comp.y, rule: crule, def: cdef };
        }
      }
      return best;
    },

    /* Said out loud, but not over and over. */
    ruleSaid: 0,
    sayRule: function (f, rule) {
      if (this.ruleSaid > 0) return;
      var p = GG.Player;
      if (!p || GG.dist(f.x, f.y, p.x, p.y) > 280) return;
      this.ruleSaid = 75;
      if (GG.UI && GG.UI.toast) {
        GG.UI.toast(f.def.name + ' ' + rule.does + '. Friends never hunt friends.', 3200);
      }
    },

    /* How each kind goes about it.
         see    how far off it notices something worth having
         hold   how long it will stay interested
         speed  how much faster than its usual pottering
         strike how close counts as a try
         rest   how long before it bothers again */
    HUNT: {
      pounce: { see: 150, hold: [1.6, 3.2], speed: 1.9, strike: 30, rest: [3, 6] },
      dash: { see: 180, hold: [1.3, 2.4], speed: 2.2, strike: 34, rest: [3.5, 7] },
      hover: { see: 130, hold: [1.8, 3.2], speed: 1.8, strike: 22, rest: [2.5, 5] },
      swoop: { see: 205, hold: [1.6, 3.0], speed: 2.0, strike: 26, rest: [2.5, 5] },
      ambush: { see: 110, hold: [3.0, 6.0], speed: 0, strike: 32, rest: [4, 8] }
    },

    /* The whole hunt, for every family. Returns the movement multiplier. */
    stepHunt: function (dt, f, move, wet) {
      /* ---- sitting and watching, because of the rule ---- */
      if (f.watch > 0) {
        f.watch -= dt;
        f.chase = 0; f.chaseId = null;
        if (f.watchAt) {
          f.faceLeft = f.watchAt.x < f.x;
        }
        return wet ? move : 0;
      }

      var style = GG.animalHuntStyle(f.def);
      if (!style) return move;

      /* ---- the rule, checked before anything else ---- */
      var other = this.friendRuleNear(f);
      if (other) {
        f.watch = GG.rand(2.6, 4.6);
        f.watchAt = { x: other.x, y: other.y };
        f.watchWhy = other.rule;
        f.chase = 0; f.chaseId = null;
        f.chaseTimer = GG.rand(2.5, 5);
        this.sayRule(f, other.rule);
        return wet ? move : 0;
      }

      var S = this.HUNT[style];
      if (!S) return move;

      /* ---- nothing in mind: have a look round now and then ---- */
      if (!(f.chase > 0)) {
        f.chaseTimer = (f.chaseTimer || 0) - dt;
        if (f.chaseTimer <= 0) {
          f.chaseTimer = GG.rand(0.4, 1.1);
          var prey = this.nearestPrey(f, S.see);
          if (prey) { f.chase = GG.rand(S.hold[0], S.hold[1]); f.chaseId = prey; }
        }
        return move;
      }

      /* ---- after something ---- */
      f.chase -= dt;
      var b = f.chaseId;
      if (!b || !GG.Critters || GG.Critters.list.indexOf(b) < 0) {
        f.chase = 0; f.chaseId = null;
        return move;
      }
      var fd = GG.dist(f.x, f.y, b.x, b.y);
      var to = Math.atan2(b.y - f.y, b.x - f.x);
      if (style === 'ambush') {
        /* A frog does not chase its dinner. It stops dead, faces it, and
           waits for it to come within reach of that sticky tongue. */
        f.hop = 0;
        f.faceLeft = Math.cos(to) < 0;
        move = 0;
        if (fd > S.see * 1.4) { f.chase = 0; f.chaseId = null; }
      } else {
        /* The last stride is the fast one. A cat creeps and then rushes, a
           dog drops its nose and goes, a bat tips over into the swoop - and
           none of them let go of something that is nearly in reach. */
        var near = fd < S.strike * 2.4;
        f.ang = GG.angLerp(f.ang, to, Math.min(1, dt * (near ? 6 : 3)));
        move = Math.max(move, near ? S.speed * 1.5 : S.speed);
        if (near && f.chase < 0.9) f.chase = 0.9;
      }
      if (fd < S.strike) this.strike(f, b, style);
      return move;
    },

    /* The try, and the miss. Nothing is ever caught here - and more than
       half of the time nothing is caught out there either. */
    strike: function (f, b, style) {
      var S = this.HUNT[style] || this.HUNT.pounce;
      if (GG.Critters && GG.Critters.scatter) GG.Critters.scatter(b.x, b.y, 48);
      f.chase = 0; f.chaseId = null;
      f.chaseTimer = GG.rand(S.rest[0], S.rest[1]);
      f.missed = 0.5;
      if (style !== 'hover' && style !== 'swoop') f.hop = 0.3;
      if (style === 'ambush') f.timer = GG.rand(2.4, 5);
      for (var i = 0; i < 4; i++) {
        this.bits.push({
          x: b.x + GG.rand(-4, 4), y: b.y - (b.z || 0),
          vx: GG.rand(-30, 30), vy: GG.rand(-46, -14),
          life: GG.rand(0.3, 0.6), col: 'rgba(255,255,255,0.9)', s: GG.rand(0.9, 1.7)
        });
      }
    },

    /* The ones that do not hunt. A parrot stops, works at something with
       that beak, and drops husks everywhere. */
    stepForage: function (dt, f, move) {
      var fg = GG.animalForage(f.def.id);
      if (!fg) return move;
      if (f.forage > 0) {
        f.forage -= dt;
        f.peck = Math.abs(Math.sin(f.t * 8));
        if (f.forage <= 0) { f.peck = 0; f.forageTimer = GG.rand(5, 11); }
        else if (Math.random() < dt * 6) {
          this.bits.push({
            x: f.x + GG.rand(-5, 9), y: f.y - 7,
            vx: GG.rand(-24, 24), vy: GG.rand(-46, -14),
            life: GG.rand(0.5, 1.1), col: fg.bits, s: GG.rand(1.1, 2.1)
          });
        }
        return 0;
      }
      if (f.forageTimer == null) f.forageTimer = GG.rand(1, 5);
      f.forageTimer -= dt;
      if (f.forageTimer <= 0) { f.forage = GG.rand(2.2, 4.4); f.forageTimer = 0; }
      return move;
    },

    stepAnimal: function (dt, f, player) {
      var d = f.def;
      f.t += dt;
      var busy = this.busy && this.busy.animal === f;
      var near = GG.dist(f.x, f.y, player.x, player.y);

      /* while she is befriending it, it edges closer instead of wandering */
      if (busy) {
        var want = d.keep * 0.42;
        f.gait = 0;
        if (near > want) {
          var to = Math.atan2(player.y - f.y, player.x - f.x);
          var sp = 16 + this.busy.ring * 26;
          f.x += Math.cos(to) * sp * dt;
          f.y += Math.sin(to) * sp * dt;
          f.faceLeft = Math.cos(to) < 0;
          f.gait = GG.clamp(sp / 34, 0, 1);
        }
        f.bob = Math.sin(f.t * 5) * 1.4;
        return;
      }

      /* otherwise it potters about, and keeps its distance if she crowds it */
      f.timer -= dt;
      if (f.timer <= 0) {
        f.ang += GG.rand(-1.6, 1.6);
        f.timer = GG.rand(1.2, 3.4);
        if (d.family === 'frog') { f.hop = 0.34; f.timer = GG.rand(2.4, 5); }
      }
      var speed = { hummingbird: 46, frog: 20, bat: 62, dog: 34, cat: 26, parrot: 34 }[d.family] || 28;
      var move = 1;
      if (d.family === 'frog') move = f.hop > 0 ? 3.4 : 0;
      if (d.family === 'hummingbird') move = (Math.sin(f.t * 1.6) > 0.3) ? 1.6 : 0.15;
      if (d.family === 'cat') move = (Math.sin(f.t * 0.7) > 0.1) ? 1 : 0;
      if (f.hop > 0) f.hop -= dt;

      /* --- habits --- */
      var fam = d.family;
      var wet = null;
      if (fam === 'cat') {
        /* cats really do hate getting their feet wet, and that comes before
           any butterfly */
        wet = this.waterNear(f.x, f.y, 74);
        if (wet) {
          f.ang = GG.angLerp(f.ang, wet.ang + Math.PI, Math.min(1, dt * 4));
          move = Math.max(move, 1.2);
          f.shy = Math.min(1, f.shy + dt * 1.5);
        }
      } else if (fam === 'frog') {
        /* frogs want to be near the water, and hop that way when they can */
        var pond = this.waterNear(f.x, f.y, 170);
        if (pond && pond.dist > 40) {
          f.ang = GG.angLerp(f.ang, pond.ang, Math.min(1, dt * 1.6));
        } else if (!pond) {
          f.timer = Math.min(f.timer, 0.8);
        }
      }

      /* --- the hunt, Guin's rule, and the ones that forage instead --- */
      if (f.missed > 0) f.missed -= dt;
      move = this.stepHunt(dt, f, move, !!wet);
      move = this.stepForage(dt, f, move);

      /* too close, and it backs away rather than bolting */
      if (near < d.keep * 0.55) {
        var away = Math.atan2(f.y - player.y, f.x - player.x);
        f.ang = GG.angLerp(f.ang, away, Math.min(1, dt * 3));
        move = Math.max(move, 1.3);
        f.shy = Math.min(1, f.shy + dt * 2);
      } else {
        f.shy = Math.max(0, f.shy - dt);
      }

      var vx = Math.cos(f.ang) * speed * move;
      var vy = Math.sin(f.ang) * speed * move * 0.7;
      f.gait = GG.clamp(Math.sqrt(vx * vx + vy * vy) / 34, 0, 1.6);
      var nx = f.x + vx * dt;
      var ny = f.y + vy * dt;
      var flying = d.family === 'hummingbird' || d.family === 'bat';
      var dry = d.family === 'cat';   /* not one paw in the water */
      var okx = flying ? !GG.World.isDeepWater(nx, f.y)
        : (!GG.World.blocked(nx, f.y, 8) && !(dry && GG.World.isWater(nx, f.y)));
      var oky = flying ? !GG.World.isDeepWater(f.x, ny)
        : (!GG.World.blocked(f.x, ny, 8) && !(dry && GG.World.isWater(f.x, ny)));
      if (okx) f.x = nx; else f.ang = Math.PI - f.ang;
      if (oky) f.y = ny; else f.ang = -f.ang;
      if (Math.cos(f.ang) < -0.05 && move > 0.1) f.faceLeft = true;
      else if (Math.cos(f.ang) > 0.05 && move > 0.1) f.faceLeft = false;

      /* how high off the ground it sits */
      if (d.family === 'hummingbird') f.bob = -22 + Math.sin(f.t * 2.4) * 3;
      else if (d.family === 'bat') f.bob = -34 + Math.sin(f.t * 1.7) * 6;
      else if (f.hop > 0) f.bob = -Math.sin((1 - f.hop / 0.34) * Math.PI) * 16;
      else f.bob = 0;
      if (f.peck > 0) f.bob += f.peck * 3.2;
    },

    /* ---------- can she start right now? ---------- */
    candidate: function (player) {
      if (this.busy) return null;
      var best = null, bd = 1e9;
      for (var i = 0; i < this.list.length; i++) {
        var f = this.list[i];
        if (f.friend) continue;
        var d = GG.dist(f.x, f.y, player.x, player.y);
        if (d < d0(f.def) && d < bd) { bd = d; best = f; }
      }
      return best;
      function d0(def) { return def.keep + 46; }
    },

    /* ---------- the ritual ---------- */
    begin: function (player) {
      var f = this.candidate(player);
      if (!f) return false;
      this.busy = {
        animal: f, ring: 0, need: f.def.patience,
        from: { x: player.x, y: player.y },
        settled: 0
      };
      GG.Sfx.befriendStart();
      return true;
    },

    stepBusy: function (dt, player) {
      var b = this.busy;
      if (!b) return;
      var f = b.animal;

      /* she has walked off */
      var strayed = GG.dist(player.x, player.y, b.from.x, b.from.y);
      if (strayed > 120) { this.cancel('moved'); return; }

      var moving = GG.Input.mag > 0.12 || GG.Player.speed > 8;
      if (moving) {
        /* fidgeting only costs a little, and never all of it */
        b.ring = Math.max(0, b.ring - NUDGE * dt);
        b.settled = 0;
      } else {
        b.settled += dt;
        b.ring += dt / b.need;
      }

      if (b.ring >= 1) this.finish();
    },

    cancel: function (why) {
      if (!this.busy) return;
      var f = this.busy.animal;
      this.busy = null;
      if (why === 'moved') GG.UI.toast('You moved away — try again and keep still', 2200);
    },

    finish: function () {
      var b = this.busy;
      if (!b) return;
      var f = b.animal, def = f.def;
      this.busy = null;
      f.friend = true;
      for (var i = 0; i < 7; i++) {
        this.hearts.push({ x: f.x + GG.rand(-14, 14), y: f.y - 18 + GG.rand(-8, 8),
          life: GG.rand(0.9, 1.6), s: GG.rand(0.7, 1.3) });
      }
      var isNew = GG.Save.addFriend(def.id);
      var reward = def.value + (isNew ? 40 : 0);
      GG.Save.data.sparkles += reward;
      GG.Save.save();
      GG.Sfx.befriended();
      GG.UI.refreshHud();
      if (this.onFriend) this.onFriend(def, isNew, reward);
    },

    /* ---------- the friend who tags along ---------- */
    setCompanion: function (id) {
      var old = GG.Save.data.companion;

      /* the friend who was with you goes and waits at the cottage, so she
         always knows where to find them again */
      if (old && old !== id) this.sendHome(old);
      /* and the new one is coming with you, so they leave the house */
      if (id) this.takeFromHome(id);

      GG.Save.data.companion = id || null;
      GG.Save.save();
      this.companion = id
        ? { id: id, x: GG.Player.x - 26, y: GG.Player.y + 12, t: 0, faceLeft: false }
        : null;

      /* there must never be a second copy of them wandering about outside */
      if (id) {
        for (var i = this.list.length - 1; i >= 0; i--) {
          if (this.list[i].def.id === id) {
            if (this.busy && this.busy.animal === this.list[i]) this.busy = null;
            this.list.splice(i, 1);
          }
        }
      }
      if (this.scene === 'house') this.loadHome();
    },

    /* ---------- the friends waiting at home ---------- */
    HOME_MAX: 8,

    sendHome: function (id) {
      var d = GG.Save.data;
      if (!d.homeFriends) d.homeFriends = [];
      var at = d.homeFriends.indexOf(id);
      if (at >= 0) d.homeFriends.splice(at, 1);
      d.homeFriends.push(id);
      /* the cottage only holds so many - the one who has been there longest
         wanders back out to the garden */
      while (d.homeFriends.length > this.HOME_MAX) d.homeFriends.shift();
      GG.Save.save();
      var def = GG.ANIMAL_BY_ID[id];
      if (def && GG.UI) {
        GG.UI.toast(def.name + ' has gone to wait at your house.', 2800);
      }
    },

    takeFromHome: function (id) {
      var d = GG.Save.data;
      if (!d.homeFriends) { d.homeFriends = []; return; }
      var at = d.homeFriends.indexOf(id);
      if (at >= 0) { d.homeFriends.splice(at, 1); GG.Save.save(); }
    },

    /* Lay the waiting friends out around the room. */
    loadHome: function () {
      var H = GG.House, ids = (GG.Save.data.homeFriends || []).slice();
      this.homeList = [];
      for (var i = 0; i < ids.length; i++) {
        var def = GG.ANIMAL_BY_ID[ids[i]];
        if (!def || !GG.Save.hasFriend(ids[i])) continue;
        var spot = this.homeSpot(i, ids.length);
        this.homeList.push({
          def: def, x: spot.x, y: spot.y,
          ang: Math.random() * Math.PI * 2, t: Math.random() * 40,
          timer: GG.rand(0.8, 2.8), faceLeft: Math.random() < 0.5,
          hop: 0, bob: 0, gait: 0, shy: 0, friend: true
        });
      }
    },

    homeSpot: function (i, n) {
      var H = GG.House;
      var lo = H.FLOOR + 48, hi = H.H - 60;
      var cols = Math.max(1, Math.min(4, n));
      var col = i % cols, row = Math.floor(i / cols);
      return {
        x: GG.clamp(150 + col * ((H.W - 300) / Math.max(1, cols - 1 || 1)) + GG.rand(-24, 24),
          90, H.W - 190),
        y: GG.clamp(lo + 40 + row * 70 + GG.rand(-16, 16), lo, hi)
      };
    },

    /* They potter about the cottage floor while she is indoors. */
    stepHome: function (dt) {
      var H = GG.House, list = this.homeList || [];
      for (var i = 0; i < list.length; i++) {
        var f = list[i], d = f.def;
        f.t += dt;
        f.timer -= dt;
        if (f.timer <= 0) {
          f.ang += GG.rand(-1.8, 1.8);
          f.timer = GG.rand(1.2, 3.6);
          if (d.family === 'frog') { f.hop = 0.34; f.timer = GG.rand(2.4, 5); }
        }
        var speed = { hummingbird: 34, frog: 16, bat: 42, dog: 22, cat: 17, parrot: 18 }[d.family] || 18;
        var move = 1;
        if (d.family === 'frog') move = f.hop > 0 ? 3 : 0;
        if (d.family === 'hummingbird') move = (Math.sin(f.t * 1.6) > 0.3) ? 1.4 : 0.12;
        if (d.family === 'cat') move = (Math.sin(f.t * 0.7) > 0.2) ? 1 : 0;
        if (d.family === 'parrot') move = (Math.sin(f.t * 1.4) > 0.4) ? 1 : 0.08;
        if (f.hop > 0) f.hop -= dt;

        var vx = Math.cos(f.ang) * speed * move;
        var vy = Math.sin(f.ang) * speed * move * 0.55;
        f.gait = GG.clamp(Math.sqrt(vx * vx + vy * vy) / 28, 0, 1.3);
        var nx = f.x + vx * dt, ny = f.y + vy * dt;
        if (!H.blocked(nx, f.y, 12)) f.x = nx; else f.ang = Math.PI - f.ang;
        if (!H.blocked(f.x, ny, 12)) f.y = ny; else f.ang = -f.ang;
        if (Math.cos(f.ang) < -0.05 && move > 0.1) f.faceLeft = true;
        else if (Math.cos(f.ang) > 0.05 && move > 0.1) f.faceLeft = false;

        if (d.family === 'hummingbird') f.bob = -20 + Math.sin(f.t * 2.4) * 3;
        else if (d.family === 'bat') f.bob = -30 + Math.sin(f.t * 1.7) * 5;
        else if (f.hop > 0) f.bob = -Math.sin((1 - f.hop / 0.34) * Math.PI) * 14;
        else f.bob = 0;
      }
    },

    collectHome: function (out, cam) {
      var list = this.homeList || [];
      for (var i = 0; i < list.length; i++) out.push({ y: list[i].y, friend: list[i], atHome: true });
    },
    loadCompanion: function () {
      var id = GG.Save.data.companion;
      this.companion = (id && GG.ANIMAL_BY_ID[id] && GG.Save.hasFriend(id))
        ? { id: id, x: GG.Player.x - 30, y: GG.Player.y + 10, t: 0, faceLeft: false }
        : null;
      if (id && !this.companion) { GG.Save.data.companion = null; }
      if (!GG.Save.data.homeFriends) GG.Save.data.homeFriends = [];
      this.homeList = [];
    },
    stepCompanion: function (dt, player) {
      var comp = this.companion;
      if (!comp) return;
      var def = GG.ANIMAL_BY_ID[comp.id];
      if (!def) { this.companion = null; return; }
      comp.t += dt;

      /* It aims for a spot just behind and beside her, rather than for her
         feet, so it never stands on top of her. */
      var vx = player.vx || 0, vy = player.vy || 0;
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 12) { comp.dx = -vx / sp; comp.dy = -vy / sp; }
      if (comp.dx == null) { comp.dx = -1; comp.dy = 0.35; }
      var tx = player.x + comp.dx * 26 - comp.dy * 12;
      var ty = player.y + comp.dy * 22 + 11;

      var d = GG.dist(comp.x, comp.y, tx, ty);
      comp.gait = 0;
      if (d > 1.5) {
        var to = Math.atan2(ty - comp.y, tx - comp.x);
        var rate = GG.clamp(d * 4.2, 0, 210);
        var move = Math.min(d, rate * dt);
        comp.x += Math.cos(to) * move;
        comp.y += Math.sin(to) * move;
        if (Math.abs(Math.cos(to)) > 0.2 && d > 6) comp.faceLeft = Math.cos(to) < 0;
        comp.gait = GG.clamp(rate / 40, 0, 1.4);
      }
      if (GG.dist(comp.x, comp.y, player.x, player.y) > 420) { comp.x = tx; comp.y = ty; }
      /* indoors they have to stay in the room with her */
      if (this.scene === 'house') {
        var H = GG.House;
        comp.x = GG.clamp(comp.x, 62, H.W - 62);
        comp.y = GG.clamp(comp.y, H.FLOOR + 14, H.H - 24);
      }

      var fam = def.family;
      var busy = d > 8;
      comp.bob = (fam === 'hummingbird') ? -20 + Math.sin(comp.t * 2.6) * 3
        : (fam === 'bat') ? -26 + Math.sin(comp.t * 1.9) * 5
          : (fam === 'frog') ? -Math.abs(Math.sin(comp.t * 3.2)) * 8
            : Math.sin(comp.t * 6) * (busy ? 1.6 : 0.4);
    },

    /* ---------- drawing ---------- */
    /* The animals get sorted in with the trees and Guin herself, so she can
       walk in front of a cat and behind a dog just like anything else. */
    collect: function (out, cam) {
      var i;
      for (i = 0; i < this.list.length; i++) {
        var f = this.list[i];
        var sx = f.x - cam.x, sy = f.y - cam.y;
        if (sx < -90 || sy < -140 || sx > GG.view.w + 90 || sy > GG.view.h + 90) continue;
        out.push({ y: f.y, friend: f });
      }
      var comp = this.companion;
      if (comp && GG.ANIMAL_BY_ID[comp.id]) out.push({ y: comp.y, friend: comp, isComp: true });
    },

    drawEntry: function (c, d, cam, t) {
      var f = d.friend;
      var sx = f.x - cam.x, sy = f.y - cam.y;
      if (d.isComp) {
        var cdef = GG.ANIMAL_BY_ID[f.id];
        if (cdef) this.drawOne(c, cdef, sx, sy, f.bob || 0, f.faceLeft, t, f.gait);
        return;
      }
      this.drawOne(c, f.def, sx, sy, f.bob, f.faceLeft, t + f.t, f.gait);

      /* Guin's rule, made visible: it has spotted a friend it really would
         hunt, and it has sat down to watch instead. */
      if (f.watch > 0) {
        c.fillStyle = 'rgba(255,255,255,0.78)';
        for (var k = 0; k < 3; k++) {
          c.beginPath();
          c.arc(sx - 6 + k * 6, sy + (f.bob || 0) - 36, 1.7, 0, Math.PI * 2);
          c.fill();
        }
      }

      /* a "!" while it is making its mind up, and a ring while she waits */
      if (this.busy && this.busy.animal === f) {
        this.drawRing(c, sx, sy + (f.bob || 0) - 30, this.busy.ring);
      } else if (!f.friend && f.shy > 0.4) {
        c.fillStyle = '#ffdf4a';
        c.font = 'bold 15px "Trebuchet MS", sans-serif';
        c.textAlign = 'center';
        c.fillText('!', sx, sy + (f.bob || 0) - 34);
      } else if (f.friend) {
        c.fillStyle = 'rgba(255,140,170,0.85)';
        this.heart(c, sx + 13, sy + (f.bob || 0) - 26, 3.4);
      }
    },

    drawHearts: function (c, cam) {
      var i;
      for (i = 0; i < this.hearts.length; i++) {
        var h = this.hearts[i];
        c.globalAlpha = GG.clamp(h.life, 0, 1);
        c.fillStyle = '#ff6f9a';
        this.heart(c, h.x - cam.x, h.y - cam.y, 5 * h.s);
        c.globalAlpha = 1;
      }
      /* husks from a foraging parrot, and the dust of a missed pounce */
      for (i = 0; i < this.bits.length; i++) {
        var q = this.bits[i];
        c.globalAlpha = GG.clamp(q.life * 2.2, 0, 1);
        c.fillStyle = q.col;
        c.beginPath();
        c.arc(q.x - cam.x, q.y - cam.y, q.s, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    },

    /* one-shot drawing, used by the tests and the title art */
    draw: function (c, cam, t) {
      var out = [];
      this.collect(out, cam);
      out.sort(function (a, b) { return a.y - b.y; });
      for (var i = 0; i < out.length; i++) this.drawEntry(c, out[i], cam, t);
      this.drawHearts(c, cam);
    },

    drawOne: function (c, def, sx, sy, bob, faceLeft, t, gait) {
      GG.AnimalArt.shadow(c, sx, sy + 2, 9 * (def.size || 1), bob < -6 ? 0.1 : 0.18);
      GG.AnimalArt.draw(c, def, sx, sy + (bob || 0), 1.15, faceLeft, t, gait);
    },

    drawRing: function (c, x, y, p) {
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3.4;
      c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#7fe0a0'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath();
      c.arc(x, y, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * GG.clamp(p, 0, 1));
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.85)';
      this.heart(c, x, y, 4.4 + Math.sin(p * 12) * 0.4);
    },

    heart: function (c, x, y, s) {
      c.beginPath();
      c.moveTo(x, y + s * 0.9);
      c.bezierCurveTo(x - s * 1.5, y - s * 0.3, x - s * 0.55, y - s * 1.3, x, y - s * 0.4);
      c.bezierCurveTo(x + s * 0.55, y - s * 1.3, x + s * 1.5, y - s * 0.3, x, y + s * 0.9);
      c.closePath(); c.fill();
    }
  };

  /* The books already know how to print a food chain - every page asks
     GG.eatsList what that creature hunts. The friends were never in the bugs'
     food chain (that table is for the bugs and the fish, and a tamed friend
     is not in it at all), so hand the book the friends' own hunting lists as
     well, and every animal page gains an honest "It hunts:" line. */
  var baseEats = GG.eatsList;
  GG.eatsList = function (id) {
    var own = baseEats ? baseEats(id) : [];
    if (own && own.length) return own;
    return GG.animalPrey ? GG.animalPrey(id) : [];
  };
})(window.GG = window.GG || {});
