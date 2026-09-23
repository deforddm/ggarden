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
   instead - see stepForage.

   THE ONE EXCEPTION (David: "you can have the garter snakes hunt the frogs
   but not catch them like the others")

   A garter snake really does hunt the Pacific Chorus Frog, and that frog is a
   friend. So nearestPrey looks through the other friends as well as the bugs,
   but only for the pairs GG.ANIMAL_HUNTS actually lists - which is this one
   and nothing else. It ends the way every chase here ends: the frog bolts and
   the snake sits down for a while. Every other friend-on-friend meeting still
   goes through FRIEND_RULE and ends with somebody sitting and watching.

   THE ONE CHASE THAT IS NOT A HUNT (Guin: "dogs chase squirrels")

   See GG.FRIEND_PLAY. A dog runs the first half of a hunt - look, creep, run -
   and in most pet dogs the catching end was bred away long ago. The squirrel
   is not hiding either: it goes part way up the trunk, stops in plain sight
   facing the dog, and scolds it with a whipping tail. Scientists call that a
   pursuit-deterrent signal, and it means "I have seen you, don't bother".

   BACKING AWAY (the black bear, the moose, the rattlesnake)

   These three are befriended by leaving them alone, so their ring runs
   backwards: it fills as she puts distance between them and slips back the
   moment she closes in. Walking towards them is the one thing that stops it.

   RIDING (Guin: "rideable friends (cows horses deer moose)")

   Only the horse. She asks the owner, she comes to the shoulder from the side
   where the horse can see her - never behind, where there is a wedge of the
   world a horse cannot see and a startled horse kicks by reflex - and she puts
   a helmet on before she gets up. The cow, the deer and the moose are never
   offered, and their pages say why. */
(function (GG) {
  'use strict';

  var TARGET = 5;              // how many animals are about at once
  var NUDGE = 0.55;            // how much the ring slips back per second of moving

  /* Roughly how many pixels make a metre out here. The horse is about a
     hundred pixels long and about two and a half metres long, so: thirty. It
     is only used where a real measurement in metres has to become a distance
     on screen - the squirrel's escape sums, and the fish. */
  var PX_PER_M = 30;

  /* What a squirrel counts as a tree. */
  var TREES = { tree: 1, pine: 1, appleTree: 1, willow: 1, snag: 1, krummholz: 1 };

  var F = GG.Friends = {
    list: [],
    hearts: [],
    bits: [],                  // seed husks and bark from a foraging parrot
    /* the befriending in progress */
    busy: null,                // { animal, ring, need, from }
    companion: null,           // the friend tagging along today

    /* up on the horse's back */
    riding: null,              // { id, t } while she is up
    asked: false,              // she has asked the owner this time out
    helmetOn: false,           // and the helmet is on and buckled
    RIDE_LIFT: 20,             // how far up her sprite sits
    RIDE_SPEED: 1.6,           // a steady trot, in Guin-speeds

    clear: function () {
      this.list.length = 0; this.hearts.length = 0; this.bits.length = 0;
      this.busy = null;
      this.riding = null;
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
        /* and a unique friend who is indoors or visiting a habitat is not
           also out here */
        if (GG.animalIsUnique(def) && this.uniqueWhere(def.id)) continue;
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
      /* The look-only friends are met, never befriended - so meeting one
         again is always worth doing, exactly as it is with the black widow in
         the Bug Book. */
      var look = GG.animalIsLookOnly(def);
      this.list.push({
        def: def, x: x, y: y, hx: x, hy: y,
        ang: Math.random() * Math.PI * 2,
        t: Math.random() * 100, timer: GG.rand(0.6, 2.6),
        faceLeft: Math.random() < 0.5,
        hop: 0, bob: 0, shy: 0, curious: 0,
        lookOnly: look, met: look && !!GG.Save.hasSeen(def.id),
        friend: !look && !!GG.Save.hasFriend(def.id)
      });
      return this.list[this.list.length - 1];
    },

    /* ---------- every frame ---------- */
    update: function (dt, player, scene) {
      var W = GG.World;
      this.scene = scene;
      if (this._liftAsked > 0) this._liftAsked--;
      if (scene !== 'world') {
        /* you get off before you go indoors */
        if (this.riding) this.dismount('indoors');
        this.list.length = 0; this.busy = null; return;
      }
      this.stepRide(dt, player);

      /* keep a few about, and let the far-off ones wander off */
      var outer = Math.max(GG.view.w, GG.view.h) * 0.9 + 240;
      for (var i = this.list.length - 1; i >= 0; i--) {
        var f = this.list[i];
        if (this.busy && this.busy.animal === f) continue;
        if (GG.dist(f.x, f.y, player.x, player.y) > outer * 1.3) this.list.splice(i, 1);
      }
      var guard = 0;
      /* Dog's Paradise is full of dogs: a couple more about, and close by,
         so they turn up inside the park rather than out in the meadow */
      var inPark = GG.World.biomeRaw(player.x, player.y) === 'dogpark';
      var target = TARGET + (inPark ? 2 : 0);
      while (this.list.length < target && guard++ < 4) {
        if (!(inPark ? this.spawnNear(player.x, player.y, 150, 380)
          : this.spawnNear(player.x, player.y, 200, outer * 0.85))) break;
      }

      for (i = 0; i < this.list.length; i++) this.stepAnimal(dt, this.list[i], player);
      this.stepBusy(dt, player);
      this.stepCalls(dt, player);
      this.stepSocial(dt);

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
      if (this.playSaid > 0) this.playSaid -= dt;
      if (this.boltSaid > 0) this.boltSaid -= dt;
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
      if (best && GG.Sfx.animalCall) GG.Sfx.animalCall(best.def.family, best.def.id);
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
      var C = GG.Critters, best = null, bestD = radius, i, b, d;
      var id = f.def.id;
      if (C && C.list) {
        for (i = 0; i < C.list.length; i++) {
          b = C.list[i];
          if (!b.def || !GG.animalHunts(id, b.def.id)) continue;
          d = GG.dist(f.x, f.y, b.x, b.y);
          if (d < bestD) { bestD = d; best = b; }
        }
      }
      /* And the one friend-on-friend chase in the whole garden: the garter
         snake and the chorus frog. Only pairs GG.ANIMAL_HUNTS really lists
         count, so this finds that one and nothing else, ever. */
      for (i = 0; i < this.list.length; i++) {
        b = this.list[i];
        if (b === f || !b.def || !GG.ANIMAL_BY_ID[b.def.id]) continue;
        if (!GG.animalHunts(id, b.def.id)) continue;
        d = GG.dist(f.x, f.y, b.x, b.y);
        if (d < bestD) { bestD = d; best = b; }
      }
      return best;
    },

    /* Is this chase target still out there? Bugs live in one list, friends in
       another, and the snake's frog is in the second one. */
    preyStillThere: function (b) {
      if (!b) return false;
      if (GG.Critters && GG.Critters.list.indexOf(b) >= 0) return true;
      return this.list.indexOf(b) >= 0;
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
      var plays = !!(GG.FRIEND_PLAY &&
        (GG.FRIEND_PLAY[f.def.id] || GG.FRIEND_PLAY[f.def.family]));
      if (!style && !plays) return move;

      /* ---- the rule, checked before anything else ---- */
      var other = this.friendRuleNear(f);
      if (other) {
        f.watch = GG.rand(2.6, 4.6);
        f.watchAt = { x: other.x, y: other.y };
        f.watchWhy = other.rule;
        f.chase = 0; f.chaseId = null;
        f.chaseTimer = GG.rand(2.5, 5);
        this.sayRule(f, other.rule);
        f.play = 0; f.playAt = null;
        return wet ? move : 0;
      }

      /* ---- and then the chase that is not a hunt at all ---- */
      if (plays) {
        var played = this.stepPlay(dt, f, move);
        if (played != null) return played;
      }

      if (!style) return move;
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
      if (!this.preyStillThere(b)) {
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
      if (b.def && GG.ANIMAL_BY_ID[b.def.id]) {
        /* the frog the garter snake was after. It is a friend, so it is never
           caught and never even touched: it bolts, the way a frog does. */
        this.frogBolts(b, f);
      } else if (GG.Critters && GG.Critters.scatter) {
        GG.Critters.scatter(b.x, b.y, 48);
      }
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

    /* The frog the garter snake was after. Nothing is ever caught here, so
       what happens is what happens in a ditch in May: the frog is gone before
       the strike lands. */
    boltSaid: 0,
    frogBolts: function (prey, hunter) {
      prey.hop = 0.34;
      prey.bolt = GG.rand(1.1, 2.0);
      prey.timer = GG.rand(1.6, 3.0);
      prey.ang = Math.atan2(prey.y - hunter.y, prey.x - hunter.x) + GG.rand(-0.4, 0.4);
      prey.shy = 1;
      var p = GG.Player;
      if (this.boltSaid <= 0 && p && GG.dist(prey.x, prey.y, p.x, p.y) < 300) {
        this.boltSaid = 90;
        if (GG.UI && GG.UI.toast) {
          GG.UI.toast(hunter.def.name + ' goes after ' + prey.def.name
            + ' — and the frog always gets away.', 3200);
        }
      }
    },

    /* ---------- "dogs chase squirrels": the chase that is not a hunt ----------

       A dog runs the first half of a hunt and the squirrel wins, every single
       time, because the squirrel is doing sums about its own tree. Nothing is
       caught, nobody sits down and watches, and Guin's rule is not bent at
       all - this is play, and both of them are enjoying it. */
    PLAY_SEE: 210,

    friendPlayNear: function (f) {
      var best = null, bd = this.PLAY_SEE;
      for (var i = 0; i < this.list.length; i++) {
        var o = this.list[i];
        if (o === f || o.scold > 0) continue;
        if (!GG.friendPlayFor(f.def, o.def)) continue;
        var d = GG.dist(f.x, f.y, o.x, o.y);
        if (d < bd) { bd = d; best = o; }
      }
      return best;
    },

    /* The dog's half. Returns a movement multiplier, or null if it is not
       playing and the ordinary hunt should carry on. */
    playSaid: 0,
    stepPlay: function (dt, f, move) {
      if (!GG.FRIEND_PLAY) return null;
      if (f.play > 0) {
        f.play -= dt;
        var o = f.playAt;
        if (!o || this.list.indexOf(o) < 0) { this.playOver(f); return null; }
        var d = GG.dist(f.x, f.y, o.x, o.y);
        var to = Math.atan2(o.y - f.y, o.x - f.x);
        if (o.scold > 0) {
          /* up the tree, out of reach and telling it off. The dog circles the
             bottom with its nose in the air, which is all it was ever going
             to get. */
          f.ang = GG.angLerp(f.ang, to + Math.PI / 2, Math.min(1, dt * 2.6));
          f.lookUp = 1;
          if (f.play < 0.8) f.play = 0.8;
          if (o.scold < 0.35) this.playOver(f);
          return d > 52 ? 1.5 : 0.9;
        }
        f.lookUp = 0;
        f.ang = GG.angLerp(f.ang, to, Math.min(1, dt * 4));
        f.hop = Math.max(f.hop, 0.12);          /* the bounding run */
        /* and it never lays a paw on it. A squirrel in the open jinks, and a
           dog that has run past has to turn round and start again - which is
           how this goes in every garden in the world. */
        if (d < 30) { this.playOver(f); return 0.5; }
        return 2.2;
      }

      f.playRest = (f.playRest == null) ? GG.rand(0.5, 2) : f.playRest - dt;
      if (f.playRest > 0) return null;
      f.playRest = GG.rand(0.6, 1.4);
      var other = this.friendPlayNear(f);
      if (!other) return null;
      f.play = GG.rand(3.5, 6);
      f.playAt = other;
      f.playWhy = GG.friendPlayFor(f.def, other.def);
      f.chase = 0; f.chaseId = null; f.lookUp = 0;
      if (GG.Sfx.animalCall) GG.Sfx.animalCall('dog');
      var p = GG.Player;
      if (this.playSaid <= 0 && p && GG.dist(f.x, f.y, p.x, p.y) < 320 && GG.UI && GG.UI.toast) {
        this.playSaid = 80;
        GG.UI.toast(f.def.name + ' ' + f.playWhy.does + '. Nobody is caught — it is a game.', 3600);
      }
      return 2.2;
    },

    playOver: function (f) {
      f.play = 0; f.playAt = null; f.lookUp = 0;
      f.playRest = GG.rand(5, 10);
      f.missed = 0.5;                       /* the same little sulk as a miss */
      f.chaseTimer = GG.rand(2.5, 5);
    },

    /* Dill & Houtman measured this with a model cat on a wire: a squirrel
       lets a chaser come to 2.19 + 0.385 x (its own distance from the tree)
       metres. Close to the trunk it is brave; out in the open it goes early. */
    squirrelFlee: function (f) {
      var tree = this.nearestTree(f.x, f.y, 420);
      var toTree = tree ? tree.dist : 420;
      return 2.19 * PX_PER_M + 0.385 * toTree;
    },

    /* The nearest thing a squirrel would call a tree. The solid props are
       already sorted into a grid, so this only ever looks at the squares
       round about. */
    nearestTree: function (x, y, radius, from) {
      var W = GG.World, best = null, bd = radius || 300;
      if (!W || !W.grid) return null;
      var gx = Math.floor(x / 200), gy = Math.floor(y / 200);
      /* which way the dog is, so the squirrel does not pick a tree that is
         on the far side of it - nobody runs a chase THROUGH the thing
         chasing them */
      var away = from ? Math.atan2(from.y - y, from.x - x) : null;
      var awayD = from ? GG.dist(x, y, from.x, from.y) : 0;
      for (var i = -2; i <= 2; i++) {
        for (var j = -2; j <= 2; j++) {
          var cell = W.grid[(gx + i) + ',' + (gy + j)];
          if (!cell) continue;
          for (var k = 0; k < cell.length; k++) {
            var p = cell[k];
            if (!TREES[p.type]) continue;
            var d = GG.dist(x, y, p.x, p.y);
            if (away != null && d > awayD * 0.8) {
              var to = Math.atan2(p.y - y, p.x - x) - away;
              var off = Math.abs(Math.atan2(Math.sin(to), Math.cos(to)));
              if (off < 0.9) continue;         /* that one is past the dog */
            }
            if (d < bd) { bd = d; best = p; }
          }
        }
      }
      return best ? { x: best.x, y: best.y, r: best.r, rad: best.rad || 14, dist: bd } : null;
    },

    /* Where a squirrel would go. A tree if there is one within reach, and if
       there is not - out on the sagebrush flats there often is not - then
       whatever stands up nearest: a rock, a stump, a fence post. It is still
       up and it can still see the dog, which is the whole point of it. */
    nearestClimb: function (x, y, from) {
      var tree = this.nearestTree(x, y, 420, from);
      if (tree) return tree;
      var W = GG.World, best = null, bd = 230;
      if (!W || !W.grid) return null;
      var gx = Math.floor(x / 200), gy = Math.floor(y / 200);
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          var cell = W.grid[(gx + i) + ',' + (gy + j)];
          if (!cell) continue;
          for (var k = 0; k < cell.length; k++) {
            var p = cell[k];
            var d = GG.dist(x, y, p.x, p.y);
            if (d < bd) { bd = d; best = p; }
          }
        }
      }
      return best ? { x: best.x, y: best.y, r: best.r, rad: best.rad || 12, dist: bd, post: true } : null;
    },

    /* The squirrel's half, and the best beat in the feature. It runs for the
       nearest tree, goes PART WAY up, and stops there facing the dog, in
       plain sight, scolding with a whipping tail. It is not hiding: under a
       hawk a squirrel puts the trunk between them, but under a dog it stays
       where it can still see what it is shouting at. */
    stepScold: function (dt, f, move) {
      if (f.scold > 0) {
        f.scold -= dt;
        f.up = Math.min(1, (f.up || 0) + dt * 3.4);
        f.tail = (f.tail || 0) + dt;
        /* and it keeps itself on the dog's side of the trunk as the dog
           circles: the whole message is "I can see you", so hiding would be
           the wrong animation as well as the wrong fact */
        var d0 = f.scoldDog, tr = f.climb;
        if (d0 && tr && this.list.indexOf(d0) >= 0) {
          var reach0 = (tr.rad || 14) + 11;
          var a0 = Math.atan2(d0.y - tr.y, d0.x - tr.x);
          var tx0 = tr.x + Math.cos(a0) * reach0;
          var ty0 = tr.y + Math.sin(a0) * reach0 * 0.5 - 2;
          f.x += (tx0 - f.x) * Math.min(1, dt * 2.2);
          f.y += (ty0 - f.y) * Math.min(1, dt * 2.2);
          f.scoldAt = { x: d0.x, y: d0.y };
        }
        if (f.scoldAt) f.faceLeft = f.scoldAt.x < f.x;
        if (f.scold <= 0) {
          f.up = 0; f.climb = null; f.scoldAt = null; f.scoldDog = null;
          f.calm = GG.rand(4, 8);
        }
        return 0;
      }
      /* The nearest dog of any kind, and the nearest one actually playing
         with it. A squirrel does not let a dog stand on it whether or not
         anybody is playing, so the first of those matters all the time. */
      var dog = null, dd = 1e9, close = null, cd = 1e9, i, o, d;
      for (i = 0; i < this.list.length; i++) {
        o = this.list[i];
        if (o.def.family !== 'dog') continue;
        d = GG.dist(o.x, o.y, f.x, f.y);
        if (d < cd) { cd = d; close = o; }
        if (!(o.play > 0) || o.playAt !== f) continue;
        if (d < dd) { dd = d; dog = o; }
      }

      /* If a dog is right on top of it, the squirrel jinks: a hard turn
         across the dog's nose. That is the move that makes a squirrel so hard
         to catch, and it is why the dog never lays a paw on it. */
      if ((close && cd < 38) || f.jink > 0) {
        f.jink = (close && cd < 38) ? 0.5 : f.jink - dt;
        var side = (f.jinkSide == null) ? (f.jinkSide = Math.random() < 0.5 ? 1 : -1) : f.jinkSide;
        if (close) f.ang = Math.atan2(f.y - close.y, f.x - close.x) + side * 0.9;
        f.hop = 0;
        return 3.6;
      }
      f.jinkSide = null;

      if (f.calm > 0) { f.calm -= dt; return move; }
      if (!dog) { f.climb = null; return move; }
      if (dd > this.squirrelFlee(f) && !f.climb) return move;

      var tree = f.climb || this.nearestClimb(f.x, f.y, dog);
      if (!tree) return Math.max(move, 3.2);       /* nothing to go up: just go */
      f.climb = tree;
      var reach = (tree.rad || 14) + 11;
      var toTree = GG.dist(f.x, f.y, tree.x, tree.y);
      if (toTree > reach) {
        f.ang = GG.angLerp(f.ang, Math.atan2(tree.y - f.y, tree.x - f.x), Math.min(1, dt * 7));
        return 3.2;                    /* and it is quicker than the dog */
      }
      /* Up the trunk and stop - on the side the dog is on, not the far side.
         Under a hawk a squirrel hides round the back of the trunk; under a
         dog it deliberately stays where it can still see what it is
         shouting at, and where the dog can still see it. */
      var toDog = Math.atan2(dog.y - tree.y, dog.x - tree.x);
      f.x = tree.x + Math.cos(toDog) * reach;
      f.y = tree.y + Math.sin(toDog) * reach * 0.5 - 2;
      f.scold = GG.rand(3.4, 5.6);
      f.up = 0.12;
      f.scoldAt = { x: dog.x, y: dog.y };
      f.scoldDog = dog;
      if (GG.Sfx.squirrelScold) GG.Sfx.squirrelScold();
      return 0;
    },

    /* ---------- "friends laugh together" ----------

       Three honest signals, and no fourth one. A dog really does have a play
       bow and every dog in the world understands it. A kea really can set
       another kea playing with nothing but a call - the sound alone, through
       a loudspeaker, on a mountain. Everybody else gets the true and quieter
       thing: two friends notice one another, turn, and settle down together.
       Nothing here claims an animal laughs, because only the play bow and the
       kea call are solid enough to animate. */
    socialTimer: 3,
    stepSocial: function (dt) {
      this.socialTimer -= dt;
      if (this.socialTimer > 0) return;
      this.socialTimer = GG.rand(2.4, 5);
      for (var i = 0; i < this.list.length; i++) {
        var f = this.list[i];
        if (f.watch > 0 || f.play > 0 || f.scold > 0 || f.bow > 0 || f.settle > 0) continue;
        if (f.social > 0) { f.social -= this.socialTimer; continue; }
        var o = this.nearestSocial(f);
        /* A parrot does not need company to call. That is the whole point of
           the kea experiment: the call went out of a loudspeaker on an empty
           mountainside and the parrots who HEARD it started playing. So a
           parrot with another parrot anywhere in earshot may simply call. */
        if (!o && f.def.family === 'parrot' && this.parrotInEarshot(f)) {
          f.social = GG.rand(9, 18);
          f.signal = GG.FRIEND_SIGNALS.playcall;
          this.playCall(f);
          return;
        }
        if (!o) continue;
        var kind = GG.friendSignalFor(f.def, o.def);
        if (!kind) continue;
        f.social = GG.rand(9, 18); o.social = GG.rand(9, 18);
        f.signal = o.signal = kind;
        if (kind.id === 'playbow') {
          f.bow = 1.1; o.bow = 0.8;
          f.bounce = 2.4; o.bounce = 2.4;
          if (GG.Sfx.playPant) GG.Sfx.playPant();
        } else if (kind.id === 'playcall') {
          this.playCall(f);
        } else {
          f.settle = GG.rand(2.6, 4.6); o.settle = GG.rand(2.6, 4.6);
          f.settleAt = { x: o.x, y: o.y }; o.settleAt = { x: f.x, y: f.y };
        }
        return;                                /* one at a time, please */
      }
    },

    /* Is there another parrot near enough to hear one? */
    EARSHOT: 520,
    parrotInEarshot: function (f) {
      for (var i = 0; i < this.list.length; i++) {
        var q = this.list[i];
        if (q === f || q.def.family !== 'parrot') continue;
        if (GG.dist(q.x, q.y, f.x, f.y) <= this.EARSHOT) return true;
      }
      return false;
    },

    /* One parrot calls, and every parrot who can hear it starts playing -
       whether or not it can see anybody. The sound is what does it. */
    playCall: function (f) {
      f.bounce = 2.6;
      f.forage = 0;
      if (GG.Sfx.animalCall) GG.Sfx.animalCall('parrot', f.def.id);
      for (var k = 0; k < this.list.length; k++) {
        var q = this.list[k];
        if (q === f || q.def.family !== 'parrot') continue;
        if (GG.dist(q.x, q.y, f.x, f.y) > this.EARSHOT) continue;
        q.bounce = 2.4;
        q.social = GG.rand(9, 18);
        q.signal = GG.FRIEND_SIGNALS.playcall;
        q.forage = 0;
      }
    },

    nearestSocial: function (f) {
      var best = null, bd = 150;
      for (var i = 0; i < this.list.length; i++) {
        var o = this.list[i];
        if (o === f || o.watch > 0 || o.play > 0 || o.scold > 0) continue;
        if (GG.friendRuleFor(f.def, o.def) || GG.friendRuleFor(o.def, f.def)) continue;
        if (GG.friendPlayFor(f.def, o.def) || GG.friendPlayFor(o.def, f.def)) continue;
        if (GG.animalHunts(f.def.id, o.def.id) || GG.animalHunts(o.def.id, f.def.id)) continue;
        if (!GG.friendSignalFor(f.def, o.def)) continue;
        var d = GG.dist(f.x, f.y, o.x, o.y);
        if (d < bd) { bd = d; best = o; }
      }
      return best;
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

      /* Up the tree, telling the dog off. Nothing else matters while that is
         going on - not the wandering, not the hunt, not Guin. */
      if (f.scold > 0) {
        this.stepScold(dt, f, 0);
        f.gait = 0;
        f.bob = -(f.climb ? f.climb.r * 0.55 : 22) * (f.up || 0)
          + Math.sin(f.t * 16) * 0.6;
        return;
      }

      /* while she is befriending it, it edges closer instead of wandering -
         except for the three you befriend by going away, who stay where they
         are and keep their own distance */
      if (busy && d.way === 'backaway') {
        f.gait = 0;
        f.faceLeft = player.x < f.x;
        if (near < d.keep * 0.92) {
          var off = Math.atan2(f.y - player.y, f.x - player.x);
          var bx = f.x + Math.cos(off) * 30 * dt;
          var by = f.y + Math.sin(off) * 30 * dt * 0.7;
          if (!GG.World.blocked(bx, f.y, 10)) f.x = bx;
          if (!GG.World.blocked(f.x, by, 10)) f.y = by;
          f.gait = 0.55;
        }
        f.bob = Math.sin(f.t * 3) * 1.1;
        return;
      }
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
      /* A dog that turns up at Dog's Paradise stays at the park: when it
         wanders near the edge it turns back in (v1.19 - the park kept
         emptying as the dogs pottered off over the hill). */
      if (f.park === undefined) {
        var DP = GG.World.DOGPARK;
        f.park = !!(DP && d.family === 'dog' && GG.World.biomeRaw(f.x, f.y) === 'dogpark');
      }
      if (f.park) {
        var P2 = GG.World.DOGPARK, m = 70;
        if (f.x < P2.x0 + m || f.x > P2.x1 - m || f.y < P2.y0 + m || f.y > P2.y1 - m) {
          var home = Math.atan2(P2.cy - f.y, P2.cx - f.x);
          f.ang = GG.angLerp(f.ang, home, Math.min(1, dt * 3));
        }
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

      /* --- the squirrel's answer to a dog, and the play signals --- */
      if (fam === 'squirrel') move = this.stepScold(dt, f, move);
      if (f.bolt > 0) {
        f.bolt -= dt;
        if (fam === 'frog' && f.hop <= 0) { f.hop = 0.34; f.timer = 0.5; }
        move = Math.max(move, 2.4);
      }
      if (f.bow > 0) {
        /* front end down, bottom up, and hold it */
        f.bow -= dt;
        move = 0;
      } else if (f.bounce > 0) {
        f.bounce -= dt;
        if (f.hop <= 0 && Math.random() < dt * 5) { f.hop = 0.3; f.timer = GG.rand(0.4, 1); }
        move = Math.max(move, 1.3);
      } else if (f.settle > 0) {
        /* not laughing, and not pretending to: two friends who have noticed
           each other and would rather sit together */
        f.settle -= dt;
        if (f.settleAt) f.faceLeft = f.settleAt.x < f.x;
        move = 0;
      }

      /* too close, and it backs away rather than bolting. The three you
         befriend by leaving alone start doing it much further out, so she can
         never end up standing next to a bear or a moose. */
      if (d.way === 'backaway' && near < d.keep * 0.95) {
        var far = Math.atan2(f.y - player.y, f.x - player.x);
        f.ang = GG.angLerp(f.ang, far, Math.min(1, dt * 4));
        /* and it is faster than she is. A bear runs as fast as a racehorse
           and a moose trots all day: she is not going to catch one up, which
           is the truth and is also the point. */
        move = Math.max(move, 6.2);
        f.shy = Math.min(1, f.shy + dt * 2);
        /* and she cannot simply out-walk a bear to stand next to it: if she
           keeps crowding it, it goes. Which is what a bear does, and what
           she should want a bear to do. */
        if (near < d.keep * 0.62) {
          f.crowd = (f.crowd || 0) + dt;
          if (f.crowd > 1.4) this.walksOff(f);
        } else if (f.crowd > 0) {
          f.crowd = Math.max(0, f.crowd - dt * 0.5);
        }
      } else if (near < d.keep * 0.55) {
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
      if (this.busy || this.riding) return null;
      var best = null, bd = 1e9;
      for (var i = 0; i < this.list.length; i++) {
        var f = this.list[i];
        if (f.friend) continue;
        var d = GG.dist(f.x, f.y, player.x, player.y);
        if (d < d0(f.def) && d < bd) { bd = d; best = f; }
      }
      return best;
      /* The three you befriend by going away are offered from much further
         off, because walking up to them is the whole thing you must not do. */
      function d0(def) { return def.way === 'backaway' ? def.keep + 92 : def.keep + 46; }
    },

    /* ---------- the ritual ---------- */
    begin: function (player) {
      var f = this.candidate(player);
      if (!f) return false;
      this.busy = {
        animal: f, ring: 0, need: f.def.patience,
        from: { x: player.x, y: player.y },
        d0: GG.dist(player.x, player.y, f.x, f.y),
        settled: 0
      };
      GG.Sfx.befriendStart();
      return true;
    },

    /* How much further away she has to get, as a share of the distance the
       animal wants kept anyway. */
    BACK_NEED: 0.8,

    stepBusy: function (dt, player) {
      var b = this.busy;
      if (!b) return;
      var f = b.animal;

      /* The bear, the moose and the rattlesnake run the whole thing
         backwards: the ring fills as she gets further away and slips back the
         moment she closes in, because going away IS the befriending. Standing
         still in front of a bear is not the lesson. */
      if (f.def.way === 'backaway') {
        var need = f.def.keep * this.BACK_NEED;
        var away = GG.dist(player.x, player.y, f.x, f.y);
        /* begin() already knows the distance she started at; the other two
           are set here, and each on its own, so none of them can be left
           undefined by a start that filled only some of them in */
        if (b.d0 == null) b.d0 = away;
        if (b.last == null) b.last = away;
        if (b.best == null) b.best = away;
        var step = away - b.last;              /* + she is going away */
        b.last = away;
        if (away > b.best) b.best = away;
        var target = GG.clamp((away - b.d0) / need, 0, 1);

        if (step < -0.02) {
          /* Closing in slips it back at once, by as much ground as she just
             took back. That is the whole lesson: the ring is a picture of the
             distance between them. */
          b.ring = Math.max(0, b.ring + (step / need) * 0.75);
          b.settled = 0;
        } else {
          /* Going away fills it, and so does standing quietly once she is far
             enough off - back away, then keep your distance. It never fills
             faster than its patience allows, so running is no quicker than
             walking, and never further than the room she has actually given
             it, so it cannot fill without the distance being there. */
          b.ring = Math.min(target, b.ring + dt / b.need);
          b.settled += dt;
        }

        /* and walking at it - giving back the room she had given - stops the
           whole thing, whatever the ring says */
        if (away < b.best - 70) { this.cancel('closer'); return; }
        if (b.ring >= 1) this.finish();
        return;
      }

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

    /* An animal that has had enough of being followed simply leaves. Nobody
       has failed at anything: it went away, which is what it wanted. */
    walksOff: function (f) {
      var at = this.list.indexOf(f);
      if (at < 0) return;
      if (this.busy && this.busy.animal === f) this.busy = null;
      this.list.splice(at, 1);
      if (GG.UI && GG.UI.toast) {
        GG.UI.toast(f.def.name + ' had enough of being followed and walked away. '
          + 'Give her room and she will stay.', 3200);
      }
    },

    cancel: function (why) {
      if (!this.busy) return;
      var f = this.busy.animal;
      this.busy = null;
      if (why === 'moved') GG.UI.toast('You moved away — try again and keep still', 2200);
      else if (why === 'closer') {
        GG.UI.toast('Never walk towards ' + (f ? f.def.name : 'her')
          + ' — stand tall and step slowly backwards.', 3000);
      }
    },

    finish: function () {
      var b = this.busy;
      if (!b) return;
      var f = b.animal, def = f.def, i;
      this.busy = null;
      f.friend = true;
      var look = GG.animalIsLookOnly(def);
      if (look) {
        /* You do not make friends with a rattlesnake. You meet her, from a
           long way off, and you both go on your way - so no hearts, and no
           new-friend bonus. Meeting her is the whole of it. */
        f.met = true;
        for (i = 0; i < 6; i++) {
          this.bits.push({
            x: f.x + GG.rand(-12, 12), y: f.y - 14 + GG.rand(-6, 6),
            vx: GG.rand(-14, 14), vy: GG.rand(-30, -8),
            life: GG.rand(0.5, 1.0), col: 'rgba(232,226,210,0.9)', s: GG.rand(1, 2)
          });
        }
      } else {
        for (i = 0; i < 7; i++) {
          this.hearts.push({ x: f.x + GG.rand(-14, 14), y: f.y - 18 + GG.rand(-8, 8),
            life: GG.rand(0.9, 1.6), s: GG.rand(0.7, 1.3) });
        }
      }
      var isNew = look ? GG.Save.addSeen(def.id) : GG.Save.addFriend(def.id);
      var reward = look ? def.value : def.value + (isNew ? 40 : 0);
      GG.Save.data.sparkles += reward;
      GG.Save.save();
      GG.Sfx.befriended();
      GG.UI.refreshHud();
      if (this.onFriend) this.onFriend(def, isNew, reward);
    },

    /* ---------- one-of-a-kind friends ---------- */
    /* Where is this unique friend right now? 'companion', 'home', a habitat
       tank, or null for "out in the garden". */
    uniqueWhere: function (id) {
      var d = GG.Save.data;
      if (d.companion === id) return 'companion';
      if ((d.homeFriends || []).indexOf(id) >= 0) return 'home';
      var tanks = d.terrariums || [];
      for (var i = 0; i < tanks.length; i++) {
        var fr = tanks[i].friends || [];
        for (var j = 0; j < fr.length; j++) if (fr[j].id === id) return tanks[i];
      }
      return null;
    },
    /* Put a unique friend in exactly one place, taking her out of every other.
       `keepTank` is the habitat she is going into, if that is where. Returns
       a sentence saying where she came from, or '' if she was out in the
       garden. */
    claimUnique: function (id, where, keepTank) {
      var def = GG.ANIMAL_BY_ID[id];
      if (!GG.animalIsUnique(def)) return '';
      var d = GG.Save.data, from = '';
      if (where !== 'companion' && d.companion === id) {
        d.companion = null;
        this.companion = null;
        if (this.riding) this.dismount('swap');
        from = 'She stops walking with you';
      }
      if (where !== 'home' && d.homeFriends) {
        var at = d.homeFriends.indexOf(id);
        if (at >= 0) { d.homeFriends.splice(at, 1); from = 'She leaves the cottage'; }
        if (this.homeList) {
          this.homeList = this.homeList.filter(function (f) { return f.def.id !== id; });
        }
      }
      (d.terrariums || []).forEach(function (t) {
        if (t === keepTank || !t.friends) return;
        for (var i = t.friends.length - 1; i >= 0; i--) {
          if (t.friends[i].id === id) {
            t.friends.splice(i, 1);
            from = 'She hops out of ' + (t.name || 'her habitat');
          }
        }
      });
      /* and nobody else who looks just like her wanders the garden */
      for (var k = this.list.length - 1; k >= 0; k--) {
        if (this.list[k].def.id === id) {
          if (this.busy && this.busy.animal === this.list[k]) this.busy = null;
          this.list.splice(k, 1);
        }
      }
      GG.Save.save();
      return from;
    },

    /* ---------- the friend who tags along ---------- */
    setCompanion: function (id) {
      /* the look-only friends never come along. You met her; that is all
         either of you wanted. */
      if (id && GG.animalIsLookOnly(GG.ANIMAL_BY_ID[id])) {
        if (GG.UI && GG.UI.toast) {
          GG.UI.toast('She is a friend you say hello to from far away — she stays where she is.', 3000);
        }
        return;
      }
      if (this.riding) this.dismount('swap');
      var old = GG.Save.data.companion;

      /* the friend who was with you goes and waits at the cottage, so she
         always knows where to find them again */
      if (old && old !== id) this.sendHome(old);
      /* and the new one is coming with you, so they leave the house */
      if (id) this.takeFromHome(id);

      var moved = id ? this.claimUnique(id, 'companion') : '';
      if (moved && GG.UI && GG.UI.toast) {
        GG.UI.toast(moved + ' to come with you. There is only one ' + GG.ANIMAL_BY_ID[id].name + '!', 3000);
      }
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
      if (GG.animalIsLookOnly(GG.ANIMAL_BY_ID[id])) return;
      if (!d.homeFriends) d.homeFriends = [];
      var at = d.homeFriends.indexOf(id);
      if (at >= 0) d.homeFriends.splice(at, 1);
      this.claimUnique(id, 'home');
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
      if (GG.animalIsLookOnly(GG.ANIMAL_BY_ID[id])) return;
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
        var spot = this.homeSpot(i, ids.length, def);
        this.homeList.push({
          def: def, x: spot.x, y: spot.y,
          ang: Math.random() * Math.PI * 2, t: Math.random() * 40,
          timer: GG.rand(0.8, 2.8), faceLeft: Math.random() < 0.5,
          hop: 0, bob: 0, gait: 0, shy: 0, friend: true
        });
      }
    },

    /* Somewhere clear on the floor for friend number i of n: spread across
       the open floor spots the house offers, never inside the bed, the
       plant or the doorway (v1.16 - they used to be dealt out on a grid
       that could land right inside the bed, and then jitter there). */
    homeSpot: function (i, n, def) {
      var H = GG.House, spots = H.homeSpots ? H.homeSpots(this.HOME_RAD) : [];
      /* a horse or a moose is as tall as a grown-up, so it stands out on the
         open floor, not in front of the bookshelf with its head in it */
      if (def) {
        var ext = (GG.AnimalArt.SPAN[def.art.shape] || 38) * (def.size || 1) * 1.15;
        var roomy = spots.filter(function (q) {
          return q.y - ext * 0.8 > H.FLOOR - 10 && !H.blocked(q.x, q.y, Math.max(14, ext * 0.42));
        });
        if (roomy.length) spots = roomy;
      }
      if (!spots.length) return H.freeNear(H.START.x, H.START.y - 80, this.HOME_RAD);
      var step = Math.max(1, Math.floor(spots.length / Math.max(1, n)));
      var p = spots[(i * step + Math.floor(step / 2)) % spots.length];
      var j = H.freeNear(p.x + GG.rand(-10, 10), p.y + GG.rand(-8, 8), this.HOME_RAD);
      return j;
    },
    HOME_RAD: 14,

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
        var nx = f.x + vx * dt, ny = f.y + vy * dt, R = this.HOME_RAD;
        /* if something has ended up inside the bed or the wall (a door
           opening, a resize, an old save), set it back down on clear floor
           rather than let it flip about on the spot */
        if (H.blocked(f.x, f.y, R)) {
          var fr = H.freeNear(f.x, f.y, R);
          f.x = fr.x; f.y = fr.y; nx = f.x; ny = f.y;
        }
        if (!H.blocked(nx, f.y, R)) f.x = nx; else f.ang = Math.PI - f.ang;
        if (!H.blocked(f.x, ny, R)) f.y = ny; else f.ang = -f.ang;
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
      /* a new outing: you ask again, and the helmet comes out again */
      this.riding = null; this.asked = false; this.helmetOn = false; this.standTold = false;
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
      /* while she is up on it, it is not following her - it is carrying her,
         and stepRide has already put it where it belongs */
      if (this.riding) return;
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
      /* a horse she has stopped beside comes up alongside her and stands
         shoulder-on, the way you would lead one - so the right place to get
         on is simply where she is already standing */
      if (def.rideable && this.scene !== 'house' &&
          ((this.stillT || 0) > 0.35 || this.sidle > 0)) {
        var side = comp.faceLeft ? 1 : -1;
        tx = player.x + side * 4;
        ty = player.y - 16;
      }

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
        /* indoors the furniture is solid for friends too: they walk round
           the bed, not over it */
        var H = GG.House, R = this.HOME_RAD;
        if (H.blocked(comp.x, comp.y, R)) {
          var px0 = comp.px == null ? comp.x : comp.px, py0 = comp.py == null ? comp.y : comp.py;
          if (!H.blocked(comp.x, py0, R)) comp.y = py0;
          else if (!H.blocked(px0, comp.y, R)) comp.x = px0;
          else { var fr = H.freeNear(comp.x, comp.y, R); comp.x = fr.x; comp.y = fr.y; }
        }
      }
      comp.px = comp.x; comp.py = comp.y;

      var fam = def.family;
      var busy = d > 8;
      comp.bob = (fam === 'hummingbird') ? -20 + Math.sin(comp.t * 2.6) * 3
        : (fam === 'bat') ? -26 + Math.sin(comp.t * 1.9) * 5
          : (fam === 'frog') ? -Math.abs(Math.sin(comp.t * 3.2)) * 8
            : Math.sin(comp.t * 6) * (busy ? 1.6 : 0.4);
    },

    /* ---------- riding ----------

       Only the horse, and only her own horse. Everything about getting on is
       the real thing: you ask the person she belongs to, you come to her
       SHOULDER from the side where she can see you - a horse sees nearly all
       the way round itself but there is a wedge behind her and a patch under
       her nose that she cannot see, and a horse startled from there kicks
       before she has thought about it - and the helmet goes on before you do.
       The cow, the deer and the moose are never offered at all. */

    /* Which way is she standing? 'shoulder' is the right answer. */
    rideStance: function (player, comp) {
      var f = comp.faceLeft ? -1 : 1;
      var ahead = (player.x - comp.x) * f;        /* + in front of her */
      var side = Math.abs(player.y - comp.y);
      if (ahead < -10 && side < 20) return 'behind';
      if (ahead < -26) return 'behind';
      if (ahead > 14 && side < 10) return 'nose';
      return 'shoulder';
    },

    /* Which scene she is actually in. There are more than two of them now -
       the world, the cottage and the lava tube - so ask the game rather than
       assuming anything that is not the house is outdoors. */
    sceneNow: function () {
      return (GG.debugScene ? GG.debugScene() : null) || this.scene || 'world';
    },

    /* What the friend button should say right now, or null for nothing. */
    rideOffer: function (player) {
      if (this.riding) return { stage: 'off', main: 'GET DOWN', sub: 'on the left' };
      var comp = this.companion;
      if (!comp || this.busy || this.sceneNow() !== 'world') return null;
      var def = GG.ANIMAL_BY_ID[comp.id];
      if (!def || !def.rideable) return null;     /* a cow is not a horse */
      if (GG.Fishing && GG.Fishing.active()) return null;
      if (player.stun > 0) return null;
      /* v1.16 (David): while she is just walking along with her horse
         following, nothing pops up at all. The offer only comes once she
         has stopped, with the horse standing beside her - and then quietly. */
      if ((this.stillT || 0) < this.RIDE_STILL) return null;
      if (GG.dist(player.x, player.y, comp.x, comp.y) > 60) return null;
      var stance = this.rideStance(player, comp);
      if (stance !== 'shoulder') {
        return { stage: 'stand', main: 'RIDE', sub: 'go to her shoulder', quiet: true };
      }
      if (!this.asked) return { stage: 'ask', main: 'RIDE?', sub: 'ask first', quiet: true };
      if (!this.helmetOn) return { stage: 'helmet', main: 'HELMET', sub: 'every time', quiet: true };
      return { stage: 'up', main: 'GET ON', sub: 'at her shoulder', quiet: true };
    },

    /* One tap, one step of the flow. */
    rideTap: function (player) {
      var offer = this.rideOffer(player);
      if (!offer) return false;
      var comp = this.companion, def = comp ? GG.ANIMAL_BY_ID[comp.id] : null;
      var name = def ? def.name : 'her';
      if (offer.stage === 'stand') {
        /* the lesson is told once an outing, not every time */
        if (!this.standTold) {
          this.standTold = true;
          GG.UI.toast(this.rideStance(player, comp) === 'behind'
            ? 'She cannot see straight behind her, so you always get on at her shoulder. She steps round for you.'
            : 'She cannot see right under her own nose, so you get on at her shoulder. She steps round for you.',
            3400);
        }
        GG.Sfx.click();
        this.sidle = 1.6;       /* she walks up alongside, shoulder to you */
        return true;
      }
      if (offer.stage === 'ask') {
        this.asked = true;
        GG.Sfx.click();
        GG.UI.toast('You ask the person ' + name + ' belongs to. Yes — helmet first.', 3000);
        return true;
      }
      if (offer.stage === 'helmet') {
        this.helmetOn = true;
        GG.Sfx.place();
        GG.UI.toast('Helmet on and buckled — a proper riding one, every single time.', 3000);
        return true;
      }
      if (offer.stage === 'up') { this.mount(player); return true; }
      if (offer.stage === 'off') { this.dismount('tap'); return true; }
      return false;
    },

    mount: function (player) {
      var comp = this.companion;
      if (!comp) return false;
      var def = GG.ANIMAL_BY_ID[comp.id];
      if (!def || !def.rideable || !this.helmetOn || !this.asked) return false;
      this.riding = { id: comp.id, t: 0 };
      comp.x = player.x; comp.y = player.y + 3;
      comp.faceLeft = player.dir === 'left';
      if (GG.Sfx.animalCall) GG.Sfx.animalCall('horse', comp.id);
      GG.UI.toast('Up at her shoulder and away you go. Walk on!', 2600);
      return true;
    },

    dismount: function (why) {
      if (!this.riding) return false;
      this.riding = null;
      var comp = this.companion, p = GG.Player;
      if (comp && p) { comp.x = p.x - 26; comp.y = p.y + 10; comp.faceLeft = false; }
      if (why === 'tap') GG.UI.toast('Down on the left side, and a pat on the neck.', 2400);
      return true;
    },

    /* How far up her sprite sits. main.js asks for this while it is drawing
       her; if nobody asks, nothing is drawn up in the air either. */
    rideLift: function () {
      if (!this.riding) return 0;
      this._liftAsked = 2;
      return this.RIDE_LIFT;
    },
    _lift: function () {
      return (this.riding && this._liftAsked > 0) ? this.RIDE_LIFT : 0;
    },

    RIDE_STILL: 0.55,          // seconds stood still before the offer appears

    stepRide: function (dt, player) {
      this.stillT = (player.speed || 0) < 6 ? (this.stillT || 0) + dt : 0;
      if (this.sidle > 0) this.sidle -= dt;
      /* the friend button is shared, so riding only ever takes the tap when
         there is nobody new to say hello to */
      var In = GG.Input;
      if (In && In.action3Pressed && !this.busy && !this.candidate(player)) {
        if (this.rideOffer(player)) {
          In.action3Pressed = false;
          this.rideTap(player);
        }
      }
      if (!this.riding) return;
      var comp = this.companion;
      if (!comp || !GG.ANIMAL_BY_ID[comp.id] || player.stun > 0) { this.dismount('stop'); return; }
      /* and a horse does not go indoors, or down a lava tube */
      if (this.sceneNow() !== 'world') { this.dismount('indoors'); return; }
      this.riding.t += dt;

      /* she is up on the horse, so the pair of them go at a horse's pace */
      var k = this.RIDE_SPEED - 1;
      var nx = player.x + (player.vx || 0) * k * dt;
      var ny = player.y + (player.vy || 0) * k * dt;
      if (!GG.World.blocked(nx, player.y, player.rad || 11)) player.x = nx;
      if (!GG.World.blocked(player.x, ny, player.rad || 11)) player.y = ny;

      comp.x = player.x;
      comp.y = player.y + 3;
      comp.t += dt;
      comp.gait = GG.clamp((player.speed || 0) / 90, 0, 1.5);
      if (Math.abs(player.vx || 0) > 12) comp.faceLeft = player.vx < 0;
      comp.bob = Math.sin(comp.t * 8) * (player.speed > 20 ? 1.4 : 0.3);
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
      if (comp && GG.ANIMAL_BY_ID[comp.id]) {
        if (this.riding && GG.Player) {
          /* the horse goes in just behind her and the tack just in front, so
             she is sat between the two and not standing beside her own horse */
          out.push({ y: GG.Player.y - 1, friend: comp, isComp: true, mount: 'under' });
          out.push({ y: GG.Player.y + 1, friend: comp, isComp: true, mount: 'over' });
        } else {
          out.push({ y: comp.y, friend: comp, isComp: true });
        }
      }
    },

    drawEntry: function (c, d, cam, t) {
      var f = d.friend;
      var sx = f.x - cam.x, sy = f.y - cam.y;
      if (d.isComp) {
        var cdef = GG.ANIMAL_BY_ID[f.id];
        if (!cdef) return;
        if (d.mount === 'over') { this.drawTack(c, cam, cdef); return; }
        this.drawOne(c, cdef, sx, sy, f.bob || 0, f.faceLeft, t, f.gait);
        return;
      }

      /* a squirrel part way up a trunk shivers with the telling-off */
      if (f.scold > 0) sx += Math.sin(f.t * 26) * 0.9;

      /* the play bow: front end right down, bottom up, held for a beat */
      var bowing = f.bow > 0;
      if (bowing) {
        c.save();
        c.translate(sx, sy);
        c.rotate((f.faceLeft ? -1 : 1) * 0.30);
        c.translate(-sx, -sy);
      }
      this.drawOne(c, f.def, sx, sy, f.bob, f.faceLeft, t + f.t, f.gait);
      if (bowing) c.restore();

      /* the scolding itself: rapid chatter, aimed straight at the dog */
      if (f.scold > 0) {
        var dir = f.faceLeft ? -1 : 1;
        c.strokeStyle = 'rgba(255,255,255,0.8)';
        c.lineWidth = 1.4; c.lineCap = 'round';
        for (var s = 0; s < 3; s++) {
          var r0 = 9 + s * 5 + (Math.sin(f.t * 18 + s) * 1.4);
          c.beginPath();
          c.arc(sx + dir * 5, sy + (f.bob || 0) - 16, r0,
            (f.faceLeft ? Math.PI : 0) - 0.5, (f.faceLeft ? Math.PI : 0) + 0.5);
          c.stroke();
        }
      }

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
      } else if (f.lookOnly && f.met) {
        /* met, not befriended - so an eye, not a heart */
        this.eye(c, sx + 13, sy + (f.bob || 0) - 26, 4.2);
      } else if (f.friend) {
        c.fillStyle = 'rgba(255,140,170,0.85)';
        this.heart(c, sx + 13, sy + (f.bob || 0) - 26, 3.4);
      }
    },

    /* The helmet and the reins, drawn over the top of Guin once she is up. */
    drawTack: function (c, cam, def) {
      var p = GG.Player;
      if (!p) return;
      var px = p.x - cam.x, py = p.y - cam.y - this._lift();
      var dir = (this.companion && this.companion.faceLeft) ? -1 : 1;

      /* reins, from her hands forward to the horse's head */
      c.strokeStyle = 'rgba(60,44,30,0.85)'; c.lineWidth = 1.4; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(px - 5, py - 12);
      c.quadraticCurveTo(px + dir * 13, py - 8, px + dir * 22, py - 13 + this._lift() * 0.5);
      c.stroke();
      c.beginPath();
      c.moveTo(px + 5, py - 12);
      c.quadraticCurveTo(px + dir * 15, py - 6, px + dir * 22, py - 11 + this._lift() * 0.5);
      c.stroke();

      /* and the helmet: proper riding one, on every single ride */
      var hx = px, hy = py - 29;
      c.fillStyle = '#3c4a66';
      c.beginPath(); c.ellipse(hx, hy, 10.6, 8.4, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.ellipse(hx + dir * 3.4, hy + 0.6, 8.6, 2.4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.22)';
      c.beginPath(); c.ellipse(hx - dir * 2.6, hy - 4.4, 4.2, 2.2, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(40,48,66,0.9)'; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(hx - 8, hy + 1); c.lineTo(hx - 3, hy + 7);
      c.lineTo(hx + 3, hy + 7); c.lineTo(hx + 8, hy + 1); c.stroke();
      void def;
    },

    eye: function (c, x, y, s) {
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.beginPath(); c.ellipse(x, y, s, s * 0.62, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(60,54,48,0.9)';
      c.beginPath(); c.arc(x, y, s * 0.34, 0, Math.PI * 2); c.fill();
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

  /* ------------------------------------------------------------------
     "FRIENDS LAUGH TOGETHER" - what is actually true

     Two of these are solid enough to animate and the third is the honest
     answer for everybody else. Nothing here says an animal laughs, because
     nothing in the research says so: the nearest real things are a dog's
     breathy "play pant" (one small pilot study, sixteen dogs) and a rat's
     tickling call, which is so high that no person can hear it. A play bow
     and a kea's play call are different - those are properly documented, and
     those are the two the garden shows.
     ------------------------------------------------------------------ */
  GG.FRIEND_SIGNALS = {
    playbow: {
      id: 'playbow', name: 'The play bow',
      does: 'drops its front end right down with its bottom in the air',
      why: 'Dogs say “let’s play!” by putting their front end down and their bottom up. It is called a play bow, and every dog in the world understands it — wolves and puppies do it too. It means everything after this is a game.',
      honest: 'Dogs do not laugh. There is one thing close to it: a soft breathy panting dogs make only while playing, and almost never at any other time. Scientists have only studied sixteen dogs so far, so the garden shows it, and calls it a play pant, not a laugh.'
    },
    playcall: {
      id: 'playcall', name: 'The play call',
      does: 'calls out, and the other parrots start playing too',
      why: 'A kea is a parrot that can start another parrot playing with nothing but a sound. Scientists played a recording of the kea play call through a loudspeaker on a mountain in New Zealand, and the wild kea who heard it began to play — even the ones who could not see anybody. It is the closest thing anyone has found to catching a laugh.',
      honest: 'It is the sound itself that does it, not the sight of somebody playing — which is exactly how laughing works with people.'
    },
    companionable: {
      id: 'companionable', name: 'Sitting together',
      does: 'notices the other one, turns, and settles down beside them',
      why: 'Not every animal plays with a friend. Some just like to sit near one. This one notices the other, turns to look, and settles.',
      honest: 'Hummingbirds, bats and frogs are not shown playing together anywhere in this garden, because nobody has ever found that they do. An empty space is more honest than a made-up one.'
    }
  };

  /* Which of the three two friends would do. */
  GG.friendSignalFor = function (a, b) {
    if (!a || !b || a.id === b.id) return null;
    var S = GG.FRIEND_SIGNALS;
    if (a.family === 'dog' && b.family === 'dog') return S.playbow;
    if (a.family === 'parrot' && b.family === 'parrot') return S.playcall;
    return S.companionable;
  };

  /* And what a single animal's page should say about it. */
  GG.friendSignalOf = function (def) {
    if (!def) return null;
    var S = GG.FRIEND_SIGNALS;
    if (def.family === 'dog') return S.playbow;
    if (def.family === 'parrot') return S.playcall;
    return S.companionable;
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
