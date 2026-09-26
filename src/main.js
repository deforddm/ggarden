/* Guin's Garden - main loop and glue. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  var canvas, ctx, dpr = 1;
  var scene = 'title';
  var cam = { x: 0, y: 0 };
  /* screen (CSS pixels) -> the current scene's own coordinates, for tap-to-walk */
  GG.screenToWorld = function (cx, cy) {
    var r = canvas.getBoundingClientRect();
    var z = GG.view.zoom || 1;
    return { x: cam.x + (cx - r.left) / z, y: cam.y + (cy - r.top) / z };
  };
  /* a little ring where she is walking to */
  function drawMoveTarget(t) {
    var T = GG.Input.moveTarget;
    if (!T) return;
    var x = T.x - cam.x, y = T.y - cam.y;
    var p = 0.5 + 0.5 * Math.sin(t * 7);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 + 0.3 * p).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, 9 + p * 2, 4.5 + p, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,111,158,0.85)';
    ctx.beginPath(); ctx.ellipse(x, y, 2.6, 1.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  var lastTime = 0, elapsed = 0;
  /* reused every frame, so drawing the world makes no garbage */
  var _drawables = [], _pool = [], _playerEntry = { y: 0, player: true };
  function byY(a, b) { return a.y - b.y; }
  var TALL = { tree: 1, pine: 1, willow: 1, appleTree: 1, blackSpruce: 1, subalpineFir: 1, mossyTrunk: 1,
    cherryTree: 1, bamboo: 1, basaltColumn: 1, garryOak: 1, oakSnag: 1, snag: 1, vineMaple: 1,
    krummholz: 1, cliffOak: 1, sagebrush: 1 };
  var _pausedDrawn = false;
  /* write to the page only when the words change - every write costs a layout */
  function setText(el, s) { if (el && el._t !== s) { el._t = s; el.textContent = s; } }
  var swingChecked = false;
  var saveTimer = 0;
  var hurtFlash = 0;
  var rainDrops = [];
  var started = false;

  GG.view = { w: 480, h: 320, cssW: 480, cssH: 320, zoom: 1 };

  function resize() {
    /* 2 is plenty for a phone held at arm's length, and draws about a third
       faster than 2.5 (v1.19) */
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    _pausedDrawn = false;
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    GG.view.cssW = w; GG.view.cssH = h;
    applyZoom();
  }

  function applyZoom() {
    var w = GG.view.cssW, h = GG.view.cssH;
    // One zoom for everywhere, so Guin is exactly the same size indoors and out.
    var z = GG.clamp(Math.max(h / 560, w / 780), 1, 2.8);
    GG.view.zoom = z;
    GG.view.w = w / z; GG.view.h = h / z;
    ctx.setTransform(dpr * z, 0, 0, dpr * z, 0, 0);
  }

  var sceneLock = 0;   // a moment after going through a door when the button does nothing
  function setScene(s) {
    scene = s;
    sceneLock = 0.8;
    _pausedDrawn = false;
    GG.Orchard.wanted = null;
    GG.Input.clearTarget();
    applyZoom();
    if (s === 'world') {
      GG.Critters.clear();
      for (var i = 0; i < 10; i++) {
        GG.Critters.spawnNear(GG.Player.x, GG.Player.y, 120, Math.max(GG.view.w, GG.view.h) * 0.8);
      }
    } else {
      GG.Friends.clear();
      $('btn-friend').classList.add('hidden');
    }
  }

  var _fishLabel = '';
  function updateFishButton(fishing, castable, fetchable) {
    var btn = $('btn-fish');
    var show = fishing || castable || fetchable;
    btn.classList.toggle('hidden', !show);
    if (!show) { _fishLabel = ''; btn.classList.remove('ready'); return; }
    var st = GG.Fishing.state;
    var main = 'FISH', sub = 'cast', ready = false;
    /* v1.20: at Dog's Paradise the same round button throws the ball */
    if (!fishing && !castable && fetchable) { main = 'THROW'; sub = 'the ball'; st = ''; }
    if (st === 'bite') { main = 'CATCH'; sub = 'now!'; ready = true; }
    else if (st === 'nibble') { main = 'WAIT'; sub = 'nibble\u2026'; }
    else if (st === 'wait') { main = 'WAIT'; sub = 'for the !'; }
    else if (st === 'cast' || st === 'reel') { main = '\u2026'; sub = ''; }
    btn.classList.toggle('ready', ready);
    var key = main + '|' + sub;
    if (key !== _fishLabel) {
      _fishLabel = key;
      btn.innerHTML = main + '<small>' + sub + '</small>';
    }
  }

  var _friendLabel = '';
  function updateFriendButton(player) {
    var btn = $('btn-friend');
    var F = GG.Friends;
    var busy = F.busy;
    var cand = busy ? null : F.candidate(player);
    /* getting on and off a horse uses the same button */
    var ride = (busy || cand || !F.rideOffer) ? null : F.rideOffer(player);
    var show = !!(busy || cand || ride);
    btn.classList.toggle('hidden', !show);
    btn.classList.toggle('waiting', !!busy);
    /* getting on your own horse is an offer, not an alarm */
    btn.classList.toggle('quiet', !!(ride && ride.quiet) && !busy && !cand);
    if (!show) { _friendLabel = ''; return null; }
    var main, sub;
    if (ride) { main = ride.main; sub = ride.sub; } else {
    var def = busy ? busy.animal.def : cand.def;
    var way = GG.FRIEND_WAYS[def.way] || { btn: 'HELLO', sub: '', waiting: 'Keep still…' };
    main = busy ? 'SHHH' : (way.btn || way.verb.toUpperCase());
    sub = busy ? way.waiting : way.sub;
    }
    var key = main + '|' + sub;
    if (key !== _friendLabel) {
      _friendLabel = key;
      btn.innerHTML = main + '<small>' + sub + '</small>';
    }
    return cand;
  }

  var _label = '';
  function setActionLabel(main, sub) {
    if (_label === main + '|' + sub) return;
    _label = main + '|' + sub;
    $('btn-a').innerHTML = main + '<small>' + sub + '</small>';
  }

  /* ---------- rain ---------- */
  function updateRain(dt) {
    if (GG.Time.rain) {
      while (rainDrops.length < 90) {
        rainDrops.push({ x: Math.random() * (GG.view.w + 200) - 100, y: Math.random() * GG.view.h, s: GG.rand(420, 700) });
      }
    } else if (rainDrops.length) {
      rainDrops.length = Math.max(0, rainDrops.length - 3);
    }
    for (var i = 0; i < rainDrops.length; i++) {
      var d = rainDrops[i];
      d.y += d.s * dt; d.x += d.s * 0.28 * dt;
      if (d.y > GG.view.h) { d.y = -12; d.x = Math.random() * (GG.view.w + 200) - 100; }
    }
  }
  function drawRain() {
    if (!rainDrops.length) return;
    ctx.strokeStyle = 'rgba(200,225,255,0.5)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (var i = 0; i < rainDrops.length; i++) {
      var d = rainDrops[i];
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 3.4, d.y - 12); ctx.stroke();
    }
  }

  /* ---------- world scene ---------- */
  var _blockedWorld = function (x, y, r) { return GG.World.blocked(x, y, r); };
  var lastPickable = null, swingPeak = null;
  var lastCamX = null, lastCamY = null;

  /* A tap on the cottage walks her to the door step, not into the wall. */
  function onHouse(x, y) {
    var H = GG.World.HOUSE;
    return x > H.x - H.w / 2 - 6 && x < H.x + H.w / 2 + 6 && y > H.y - H.w * 1.3 && y < H.y + 4;
  }

  /* v1.20: VISIT at a habitat in the yard opens that tank in My Tanks */
  function visitYard(e) {
    GG.Sfx.click();
    GG.Input.clearTarget();
    GG.UI.prompt(null);
    GG.Terrarium.openTank(e.index);
  }

  function updateWorld(dt) {
    var W = GG.World, P = GG.Player;
    GG.Time.update(dt);
    GG.Input.blockedFn = _blockedWorld;
    var tap = GG.Input.tapPressed, tapYard = null;
    if (tap && !GG.Fishing.active()) {
      if (onHouse(tap.x, tap.y)) GG.Input.walkTo(W.DOOR.x, W.DOOR.y + 40);
      /* v1.20: a tap on a habitat in the yard walks her to its gate */
      else if (GG.Yard && (tapYard = GG.Yard.at(tap.x, tap.y))) { GG.Input.walkTo(tapYard.gx, tapYard.gy); GG.Yard.tapped = tapYard; }
      else GG.Orchard.want(tap.x, tap.y);
    }

    var doorD = GG.dist(P.x, P.y, W.DOOR.x, W.DOOR.y + 34);
    var atDoor = doorD < 40;
    /* the lava tube up on the ridge, and the boot brush at its mouth */
    var brush = W.bootBrush;
    if (brush && !brush.used && GG.dist(P.x, P.y, brush.x, brush.y) < 52) {
      brush.used = true;
      GG.Sfx.click();
      GG.UI.toast('You wipe your boots. People carry the bat sickness in on them.', 3200);
    }
    var atCave = !!W.caveMouth && GG.dist(P.x, P.y, W.caveMouth.x, W.caveMouth.y + 20) < 62;
    var Fi = GG.Fishing;

    /* On the footbridge, push the stick roughly along it and she walks
       along it, rather than bumping into the rail (v1.19). */
    var In = GG.Input, B = W.bridge;
    if (B && In.mag > 0 && W.onBridge(P.x, P.y, 34)) {
      var dot = In.x * B.dx + In.y * B.dy;
      if (Math.abs(dot) > 0.35) { var sg = dot > 0 ? 1 : -1; In.x = B.dx * sg; In.y = B.dy * sg; }
    }
    P.update(dt, function (x, y, r) { return W.blocked(x, y, r); });

    GG.Friends.update(dt, P, 'world');
    GG.Friends.stepCompanion(dt, P);
    if (GG.Yard) GG.Yard.update(dt);   // v1.20: the habitats out in the yard

    GG.Orchard.update(dt);
    GG.Orchard.stepPops(dt);
    var fishing = Fi.active();
    var pickable = !fishing && !atDoor && !GG.Friends.busy ? GG.Orchard.nearest(P) : null;
    var lookAt = !fishing && !atDoor && !GG.Friends.busy ? GG.Critters.nearestLookOnly(P, 78) : null;
    if (lookAt) pickable = null;   // she is the more important thing to notice
    /* A bug right in front of her keeps the button as NET - unless she
       tapped on the plant herself (v1.19: a ripe dandelion used to take
       the button over and she could not catch the ladybird beside it). */
    if (pickable && pickable !== GG.Orchard.wanted && GG.Critters.catchableNear(P, 72)) pickable = null;
    /* v1.20: a habitat in the yard she is standing beside says VISIT - unless
       a bug is right there (NET), or she tapped a plant to pick */
    var yardAt = (GG.Yard && !fishing && !atDoor && !atCave && !lookAt && !GG.Friends.busy &&
      !GG.Friends.riding) ? GG.Yard.near(P, 30) : null;
    if (yardAt && yardAt !== GG.Yard.tapped && GG.Critters.catchableNear(P, 60)) yardAt = null;
    if (yardAt && pickable && pickable === GG.Orchard.wanted) yardAt = null;
    else if (yardAt) pickable = null;
    lastPickable = pickable;
    var castable = !fishing && !atDoor ? Fi.castTarget(P) : null;
    /* v1.20: fetch at Dog's Paradise */
    if (GG.Fetch) GG.Fetch.update(dt, P);
    var fetchable = !fishing && !castable && !atDoor && GG.Fetch ? GG.Fetch.offer(P) : false;
    updateFishButton(fishing, !!castable, fetchable);
    var friendly = updateFriendButton(P);
    if (fishing) friendly = null;

    /* while the line is out, a tap anywhere on the water is the catch tap,
       rather than a walk that pulls the line in */
    if (fishing && tap) { GG.Input.clearTarget(); GG.Input.action2Pressed = true; }
    if (sceneLock > 0) { sceneLock -= dt; GG.Input.actionPressed = false; }

    if (GG.Input.action3Pressed) {
      if (!GG.Friends.busy && friendly) GG.Friends.begin(P);
    } else if (GG.Input.action2Pressed || (fishing && GG.Input.actionPressed)) {
      if (fishing) Fi.tap();
      else if (castable) Fi.cast(P);
      else if (fetchable) { GG.Input.clearTarget(); GG.Fetch.throwBall(P); }
    } else if (GG.Input.actionPressed) {
      if (atDoor) { enterHouse(); return; }
      if (atCave) {
        if (brush && !brush.used) {
          GG.UI.toast('Wipe your boots on the brush first \u2014 it is just down the path.', 2600);
          return;
        }
        enterCave(); return;
      }
      if (lookAt) { lookAtCreature(lookAt); return; }
      if (yardAt) { visitYard(yardAt); return; }
      if (pickable) { pickFruit(pickable); return; }
      if (GG.Friends.busy) GG.UI.toast('Keep still — no net for this one', 1800);
      else if (GG.Friends.riding) GG.UI.toast('Not from up here — get down first', 1800);
      else if (P.startSwing()) { swingChecked = false; swingPeak = null; }
    }
    if (P.swinging() && !swingChecked) {
      var pr = P.swingProgress();
      if (pr > 0.16 && pr < 0.8) {
        var got = GG.Critters.tryCatch(P);
        if (got) { swingChecked = true; onCatch(got); }
        /* where the net reached furthest, for judging what she swung at */
        if (!swingPeak && pr >= 0.3) swingPeak = P.netPoint();
      }
      if (pr >= 0.8) { swingChecked = true; onSwingMiss(P, swingPeak || P.netPoint()); }
    }

    var fishResult = Fi.update(dt, P);
    if (fishResult) onFishResult(fishResult);

    GG.Critters.update(dt, P);

    var stung = GG.Critters.checkSting(P);
    if (stung) onSting(stung);
    if (hurtFlash > 0) hurtFlash -= dt;
    updateRain(dt);

    cam.x = GG.clamp(P.x - GG.view.w / 2, 0, W.W - GG.view.w);
    cam.y = GG.clamp(P.y - GG.view.h / 2 - 12, 0, W.H - GG.view.h);
    if (W.W < GG.view.w) cam.x = (W.W - GG.view.w) / 2;
    if (W.H < GG.view.h) cam.y = (W.H - GG.view.h) / 2;

    /* The door and the lava tube both get a proper button - v1.15, Guin:
       "Button for enrty". The cave's label used to be set and then written
       straight over by NET a few lines later, every frame. */
    var caveReady = atCave && !(brush && !brush.used);
    GG.UI.prompt(atDoor ? 'Tap to go inside'
      : (atCave ? (caveReady ? 'Tap to go into the lava tube' : 'Wipe your boots on the brush first')
        : (lookAt ? 'Look \u2014 but this one is not for catching'
          : (yardAt ? GG.Yard.promptOf(yardAt)
            : (pickable ? pickPrompt(pickable) : null)))));
    if (P.stun > 0) setActionLabel('OUCH', 'dizzy');
    else if (GG.Friends.busy) setActionLabel('\u2014', 'keep still');
    else if (GG.Friends.riding) setActionLabel('\u2014', 'riding');
    else if (fishing) setActionLabel('\u2014', 'fishing');
    else if (atDoor) setActionLabel('GO IN', 'door');
    else if (atCave) setActionLabel(caveReady ? 'GO IN' : 'BOOTS', caveReady ? 'lava tube' : 'brush first');
    else if (lookAt) setActionLabel('LOOK', 'don\u2019t catch');
    else if (yardAt) setActionLabel('VISIT', GG.Yard.shortName(yardAt));
    else if (pickable) {
      var pf = GG.FRUIT_BY_ID[pickable.fruit];
      setActionLabel('PICK', pf ? pf.name.toLowerCase() : 'fruit');
    } else setActionLabel('NET', 'tap');
  }

  function drawWorld(t) {
    var W = GG.World, P = GG.Player;
    W.drawGround(ctx, cam, GG.view.w, GG.view.h);
    canvas._vw = GG.view.w;
    W.drawWater(ctx, cam, t, GG.view.w, GG.view.h);
    GG.Fishing.drawShadows(ctx, cam, t);
    W.drawBridge(ctx, cam, t);
    W.drawProps(ctx, cam, GG.view.w, GG.view.h, t, 'flat');
    if (GG.FX) { GG.FX.update(t, cam, GG.view.w, GG.view.h); GG.FX.drawGround(ctx, cam, t, GG.view.w, GG.view.h); }   // v1.20 art
    if (lastPickable && scene === 'world') GG.Orchard.drawTarget(ctx, cam, lastPickable, t);

    // everything that stands up gets sorted so Guin walks behind trees
    var list = W.sortedProps(cam, GG.view.w, GG.view.h);
    var drawables = _drawables;
    var n = 0, i;
    for (i = 0; i < list.length; i++) {
      var e = _pool[n] || (_pool[n] = { y: 0, p: null });
      e.y = list[i].y; e.p = list[i];
      drawables[n++] = e;
    }
    drawables.length = n;
    _playerEntry.y = P.y;
    drawables.push(_playerEntry);
    GG.Friends.collect(drawables, cam);
    if (GG.Yard) GG.Yard.collect(drawables, cam);   // v1.20: the habitats in the yard
    drawables.sort(byY);
    var seen = false, hidden = false, ply = P.y - GG.Friends.rideLift();
    for (var j = 0; j < drawables.length; j++) {
      var d = drawables[j];
      if (d.player) {
        seen = true;
        P.draw(ctx, P.x - cam.x, ply - cam.y, t);
      } else if (d.friend) {
        GG.Friends.drawEntry(ctx, d, cam, t);
      } else if (d.yard) {
        GG.YardArt.drawEntry(ctx, d, cam, t);
      } else {
        var p = d.p, fn = GG.Props[p.type];
        if (!fn) continue;
        /* v1.19: a big crown standing in front of her goes see-through, so
           she never loses sight of herself under a tree */
        var ghost = seen && TALL[p.type] && Math.abs(p.x - P.x) < p.r * 0.95 &&
          p.y - ply < p.r * 2.4 && p.y > ply;
        if (ghost) { ctx.save(); ctx.globalAlpha = 0.6; hidden = true; }
        fn(ctx, p.x - cam.x, p.y - cam.y, p.r, t, p.seed, p.col || p.label, p);
        if (ghost) ctx.restore();
      }
    }
    /* and if she is under leaves, a faint copy of her on top, so she can
       always see where she is */
    if (hidden) {
      ctx.save(); ctx.globalAlpha = 0.5;
      P.draw(ctx, P.x - cam.x, ply - cam.y, t);
      ctx.restore();
    }
    GG.Friends.drawHearts(ctx, cam);
    if (GG.Fetch) GG.Fetch.draw(ctx, cam, t);   // v1.20: the tennis ball
    GG.Orchard.drawSparkles(ctx, cam, P, t, GG.view.w, GG.view.h);
    GG.Orchard.drawPops(ctx, cam);
    GG.Critters.draw(ctx, cam, t);
    GG.Fishing.draw(ctx, cam, t, P);
    if (GG.FX) GG.FX.draw(ctx, cam, t, GG.view.w, GG.view.h);   // v1.20 art: petals, fluff, leaves

    /* v1.20 art: the light of the hour - multiplied (a clear blue night,
       a warm golden evening), a thin wash over it, then what shines */
    var grade = GG.Time.grade();
    if (grade.mul) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = grade.mul;
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (grade.over) {
      ctx.fillStyle = grade.over;
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
    }
    if (GG.FX) GG.FX.drawLights(ctx, cam, t, grade.night, GG.view.w, GG.view.h);
    if (GG.YardArt) GG.YardArt.drawLights(ctx, cam, t, grade.night);   // v1.20 yard: string lights, lanterns
    drawRain();
    if (hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255,70,70,' + (0.34 * (hurtFlash / 0.55)).toFixed(3) + ')';
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
    }
  }

  /* ---------- house scene ---------- */
  var _blockedHouse = function (x, y, r) { return GG.House.blocked(x, y, r); };
  var HOUSE_VERB = { door: ['GO OUT', 'back outside'], bed: ['SLEEP', 'have a nap'],
    book: ['READ', 'the books'], terrarium: ['TANKS', 'my tanks'], shop: ['OPEN', 'decorations'],
    decorate: ['<span class="hd-verb">DECORATE</span>', 'my home'] };
  function updateHouse(dt) {
    var H = GG.House, P = GG.Player;
    GG.Time.update(dt);
    GG.Input.blockedFn = _blockedHouse;
    if (sceneLock > 0) { sceneLock -= dt; GG.Input.actionPressed = false; }
    /* v1.20: if she has just put something solid down where she stands,
       step her out onto clear floor */
    if (H.blocked(P.x, P.y, P.rad)) { var fr = H.freeNear(P.x, P.y, P.rad); P.x = fr.x; P.y = fr.y; }
    P.update(dt, function (x, y, r) { return H.blocked(x, y, r); });

    /* the friend who is with her comes indoors too, and the ones waiting at
       home potter about the room */
    GG.Friends.update(dt, P, 'house');
    GG.Friends.stepCompanion(dt, P);
    GG.Friends.stepHome(dt);

    var spot = H.nearest(P.x, P.y);
    GG.UI.prompt(spot ? spot.label : null);
    var verb = spot && (HOUSE_VERB[spot.id] || ['OPEN', spot.label.toLowerCase()]);
    setActionLabel(verb ? verb[0] : '\u2014', verb ? verb[1] : 'walk around');

    if (GG.Input.actionPressed && spot) {
      GG.Sfx.click();
      if (spot.id === 'door') { leaveHouse(); return; }
      if (spot.id === 'book') GG.Book.open();
      if (spot.id === 'terrarium') GG.Terrarium.open();
      if (spot.id === 'shop') GG.Shop.open();
      if (spot.id === 'bed') sleep();
      if (spot.id === 'decorate') GG.HomeDecor.open();
    }

    cam.x = GG.clamp(P.x - GG.view.w / 2, 0, H.W - GG.view.w);
    cam.y = GG.clamp(P.y - GG.view.h / 2 - 10, 0, H.H - GG.view.h);
    if (H.W < GG.view.w) cam.x = (H.W - GG.view.w) / 2;
    if (H.H < GG.view.h) cam.y = (H.H - GG.view.h) / 2;
  }

  function drawHouse(t) {
    var g = ctx.createLinearGradient(0, 0, 0, GG.view.h);
    g.addColorStop(0, '#40311f'); g.addColorStop(1, '#241a11');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GG.view.w, GG.view.h);
    GG.House.draw(ctx, cam, t);

    /* Guin, her friend and anybody waiting at home, sorted back to front */
    var indoors = [{ y: GG.Player.y, player: true }];
    GG.Friends.collect(indoors, cam);
    GG.Friends.collectHome(indoors, cam);
    GG.House.collect(indoors);            // v1.20: her things on the floor, and the paint pots
    indoors.sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < indoors.length; i++) {
      var e = indoors[i];
      if (e.player) GG.Player.draw(ctx, GG.Player.x - cam.x, GG.Player.y - cam.y, t);
      else if (e.homeItem) GG.House.drawEntry(ctx, e, cam, t);
      else GG.Friends.drawEntry(ctx, e, cam, t);
    }
    if (GG.Time.isDark()) {
      ctx.fillStyle = 'rgba(30,34,80,0.24)';
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
      GG.House.drawGlows(ctx, cam);
    }
  }

  function enterHouse() {
    GG.Sfx.door();
    GG.Friends.loadHome();
    GG.Critters.calmAll();
    GG.Fishing.reset();
    $('btn-fish').classList.add('hidden');
    $('btn-friend').classList.add('hidden');
    setScene('house');
    GG.Player.reset(GG.House.START.x, GG.House.START.y);
    GG.UI.prompt(null);
    if (!GG.Save.data.seenHouseTip) {
      GG.Save.data.seenHouseTip = true; GG.Save.save();
      setTimeout(function () { GG.UI.toast('Walk up to the bookshelf, the tanks or the bed, then tap the big button', 3200); }, 500);
    }
  }
  function leaveHouse() {
    GG.Sfx.door();
    GG.Friends.homeList = [];
    setScene('world');
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 92);
    GG.UI.prompt(null);
  }
  function sleep() {
    var T = GG.Time;
    T.minutes = 7 * 60; T.day++;
    T.rain = false; T.rainTimer = GG.rand(160, 320);
    GG.Save.data.clock = T.minutes; GG.Save.data.day = T.day;
    GG.Save.save();
    GG.UI.toast('You had a lovely nap. It is day ' + T.day + '!', 2400);
    GG.Sfx.night();
  }

  /* ---------- the lava tube ---------- */
  var _blockedCave = function (x, y, r) { return GG.Cave.blocked(x, y, r); };
  function updateCave(dt) {
    var C = GG.Cave, P = GG.Player;
    GG.Time.update(dt);
    GG.Input.blockedFn = _blockedCave;
    if (sceneLock > 0) { sceneLock -= dt; GG.Input.actionPressed = false; }
    P.update(dt, function (x, y, r) { return C.blocked(x, y, r); });

    /* She stops herself. Nobody stops her. */
    if (C.checkBats(P.x, P.y)) {
      GG.UI.toast('You turn your light away. The bats are asleep \u2014 we walk quietly here.', 3400);
    }

    GG.Critters.update(dt, P);
    var stung = GG.Critters.checkSting(P);
    if (stung) onSting(stung);

    var spot = C.nearest(P.x, P.y);
    var lookC = spot ? null : GG.Critters.nearestLookOnly(P, 78);
    GG.UI.prompt(spot ? spot.label : (lookC ? 'Look \u2014 but this one is not for catching' : null));
    if (spot) setActionLabel('GO OUT', 'back outside');
    else if (lookC) setActionLabel('LOOK', 'don\u2019t catch');
    else setActionLabel('NET', 'tap');

    if (GG.Input.actionPressed) {
      if (spot) { leaveCave(); return; }
      if (lookC) { lookAtCreature(lookC); return; }
      if (P.startSwing()) swingChecked = false;
    }
    if (P.swinging() && !swingChecked) {
      var pr = P.swingProgress();
      if (pr > 0.16 && pr < 0.8) {
        var got = GG.Critters.tryCatch(P);
        if (got) { swingChecked = true; onCatch(got); }
      }
      if (pr >= 0.8) swingChecked = true;
    }

    cam.x = GG.clamp(P.x - GG.view.w / 2, 0, C.W - GG.view.w);
    cam.y = GG.clamp(P.y - GG.view.h / 2 - 10, 0, C.H - GG.view.h);
    if (C.W < GG.view.w) cam.x = (C.W - GG.view.w) / 2;
    if (C.H < GG.view.h) cam.y = (C.H - GG.view.h) / 2;
  }

  function drawCave(t) {
    var C = GG.Cave, P = GG.Player;
    ctx.fillStyle = '#0a0908';
    ctx.fillRect(0, 0, GG.view.w, GG.view.h);
    C.draw(ctx, cam, t, P.x, P.y);
    GG.Critters.draw(ctx, cam, t);
    P.draw(ctx, P.x - cam.x, P.y - cam.y, t);
    C.drawDark(ctx, cam, P.x, P.y);
  }

  function enterCave() {
    GG.Sfx.door();
    GG.Critters.clear();
    GG.Critters.room = GG.Cave.room;
    GG.Cave.turned = 0;
    GG.Friends.dismount('cave');   // the horse waits outside
    GG.Fishing.reset();
    $('btn-fish').classList.add('hidden');
    $('btn-friend').classList.add('hidden');
    setScene('cave');
    GG.Player.reset(GG.Cave.START.x, GG.Cave.START.y);
    GG.UI.prompt(null);
    if (!GG.Save.data.seenCaveTip) {
      GG.Save.data.seenCaveTip = true; GG.Save.save();
      setTimeout(function () {
        GG.UI.toast('Nothing grows in the dark. Everything in here was carried in.', 3600);
      }, 900);
    }
  }
  function leaveCave() {
    GG.Sfx.door();
    GG.Critters.room = null;
    GG.Critters.clear();
    setScene('world');
    GG.Player.reset(GG.World.caveMouth.x + 10, GG.World.caveMouth.y + 100);
    GG.UI.prompt(null);
  }

  /* ---------- bees ---------- */
  function onSwingMiss(P, at) {
    var net = at || P.netPoint();
    /* swinging at the one she must not catch teaches, it does not punish */
    var forbidden = GG.Critters.lookOnlyUnderNet(P, net);
    if (forbidden) { lookAtCreature(forbidden); return; }
    var cross = GG.Critters.angerNear(net.x, net.y, 66);
    var hive = GG.World.hive;
    var end = P.netPoint();   /* close up, the net can reach past the hive */
    if (hive && Math.min(GG.dist(net.x, net.y, hive.x, hive.y - 14),
      GG.dist(end.x, end.y, hive.x, hive.y - 14)) < 46) {
      cross += GG.Critters.stirHive(hive.x, hive.y - 16);
    }
    if (cross) beeWarning();
  }

  function beeWarning() {
    if (!GG.Save.data.seenBeeTip) {
      GG.Save.data.seenBeeTip = true;
      GG.Save.save();
      GG.UI.toast('Uh oh - you made a bee cross. Run away!', 2600);
    } else {
      GG.UI.toast('An angry bee is chasing you!', 1500);
    }
  }

  function onSting(def) {
    GG.Player.sting();
    hurtFlash = 0.55;
    GG.Sfx.ouch();
    GG.Save.data.stings = (GG.Save.data.stings || 0) + 1;
    GG.Save.save();
    GG.UI.toast(GG.stingLine(def), 4200);
  }

  /* ---------- fishing ---------- */
  function onFishResult(r) {
    if (r.kind === 'catch' && r.def) {
      var def = r.def;
      if (def.isJunk) {
        GG.Save.data.sparkles += def.value;
        GG.Save.save();
        GG.UI.refreshHud();
        GG.Sfx.catchSmall();
        GG.UI.showCatch(def, false, def.value);
        return;
      }
      var isNew = GG.Save.addFish(def.id);
      var reward = def.value + (isNew ? def.value * 2 : 0);
      GG.Save.data.sparkles += reward;
      GG.Save.save();
      GG.UI.refreshHud();
      if (isNew) GG.Sfx.catchNew(); else GG.Sfx.catchSmall();
      GG.UI.showCatch(def, isNew, reward);
      return;
    }
    if (r.kind === 'early') GG.UI.toast('Too soon! Wait for the bobber to go under.', 2200);
    else if (r.kind === 'lost') GG.UI.toast('It got away! Tap the moment you see the !', 2400);
    else if (r.kind === 'nothing') GG.UI.toast('Nothing is biting here. Try casting somewhere else.', 2200);
    else if (r.kind === 'moved') GG.UI.toast('You walked away, so the line came in.', 2000);
  }

  /* ---------- look, don't catch ---------- */
  /* One creature in the whole garden is never caught. Meeting her is what
     opens her page in the Bug Book, and the warning comes with it. */
  /* Once per creature: after she has looked, that one goes back to what it
     was doing and the LOOK button stops offering it (v1.15 - Guin: "You can
     spam look at uncatchable bugs make it so you can only do it once for
     each bug"). A new one of the same kind can still be met. */
  function lookAtCreature(b) {
    var def = b.def || b;
    if (b.def) b.looked = true;
    var isNew = GG.Save.addSeen(def.id);
    GG.UI.refreshHud();
    if (isNew) GG.Sfx.warn(); else GG.Sfx.click();
    GG.UI.showWarning(def, isNew);
  }

  /* ---------- picking fruit ---------- */
  function pickFruit(plant) {
    var res = GG.Orchard.pick(plant);
    if (!res) return;
    GG.Orchard.pop(res.def, plant.x, plant.y - 10);
    if (res.unlocked) GG.Sfx.unlocked(); else GG.Sfx.pick();
    GG.UI.refreshHud();
    GG.UI.showFruit(res);
  }

  /* ---------- catching ---------- */
  function onCatch(def) {
    var isNew = GG.Save.addCatch(def.id);
    var reward = def.value + (isNew ? def.value * 2 : 0);
    GG.Save.data.sparkles += reward;
    GG.Save.save();
    GG.UI.refreshHud();
    if (isNew) GG.Sfx.catchNew(); else GG.Sfx.catchSmall();
    GG.UI.showCatch(def, isNew, reward);
  }

  /* ---------- little map ---------- */
  /* The land and water never change, so they are painted once and kept
     (v1.19: re-sampling 83,000 cells every time the menu opened froze it
     for half a second). */
  var _mapBase = null;
  function drawMinimap() {
    var cv = $('minimap'); if (!cv) return;
    var W = GG.World;
    if (!_mapBase) {
      _mapBase = document.createElement('canvas');
      _mapBase.width = cv.width; _mapBase.height = cv.height;
      paintMapBase(_mapBase.getContext('2d'), cv.width / W.W, cv.height / W.H);
    }
    var c = cv.getContext('2d');
    c.clearRect(0, 0, cv.width, cv.height);
    c.drawImage(_mapBase, 0, 0);
    var sx = cv.width / W.W, sy = cv.height / W.H;
    drawMapMarks(c, sx, sy);
  }
  function paintMapBase(c, sx, sy) {
    var W = GG.World;
    /* v1.20: sunnier, candier colours - every place still its own colour */
    var COLS = { meadow: '#a8e878', garden: '#ffc4dc', forest: '#4ea455', pond: '#b4ea92',
      hill: '#ebdfa6', orchard: '#cdf07c', riverbank: '#9de48a', beach: '#fdeab6',
      shore: '#dcd3bd', desert: '#ebcb8c', mountain: '#b8b2a8', taiga: '#4b8c57',
      tundra: '#e3eadb', rainforest: '#3a8c43', glade: '#f5df62',
      badlands: '#cdae86', savanna: '#ead07c', swamp: '#7fa062', bamboo: '#98c85f',
      cherry: '#ffd0e4', birdtown: '#b6ee8a', farmyard: '#e8cf8c',
      dogpark: '#c8f79a', mesa: '#e6d592' };
    var WCOL = { 1: '#4cc0f2', 2: '#9fe8f8', 3: '#62cdf2', 4: '#5ccabf', 5: '#2f9be6', 6: '#8aeedd', 7: '#5aa892' };
    var cw = c.canvas.width, ch = c.canvas.height;
    var raw = document.createElement('canvas');
    raw.width = cw; raw.height = ch;
    var r = raw.getContext('2d');
    var step = 20;
    for (var y = 0; y < W.H; y += step) {
      for (var x = 0; x < W.W; x += step) {
        var k = W.waterKind(x + 10, y + 10);
        r.fillStyle = k ? WCOL[k] : (COLS[W.biomeAt(x + 10, y + 10)] || '#a8e878');
        r.fillRect(x * sx, y * sy, step * sx + 1, step * sy + 1);
      }
    }
    /* a touch of blur rounds off the staircase edges between places */
    c.drawImage(raw, 0, 0);
    if ('filter' in c) { c.filter = 'blur(1.1px)'; c.drawImage(raw, 0, 0); c.filter = 'none'; }
    /* sunlight from the top left, a soft shade round the edges */
    var g = c.createRadialGradient(cw * 0.25, ch * 0.1, 10, cw * 0.4, ch * 0.3, cw * 0.9);
    g.addColorStop(0, 'rgba(255,255,230,0.28)'); g.addColorStop(0.6, 'rgba(255,255,230,0)'); g.addColorStop(1, 'rgba(30,60,20,0.16)');
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
  }
  function drawMapMarks(c, sx, sy) {
    var W = GG.World;
    function mapLabel(c, text, x, y, fill, edge) {
      c.lineJoin = 'round';
      c.strokeStyle = edge; c.lineWidth = 5.5;
      c.strokeText(text, x, y);
      c.fillStyle = fill;
      c.fillText(text, x, y);
    }
    var FONT = '600 20px "Fredoka", "Nunito", "Trebuchet MS", sans-serif';
    c.font = FONT;
    c.textAlign = 'center';
    [['Hills', 3500, 1330], ['Meadow', 6250, 3170], ['Woods', 6500, 1250], ['Orchard', 5560, 2380],
     ['Pond', 3820, 2980], ['Garden', 4720, 2790], ['Stream', 4200, 2290],
     ['River', 5350, 2980], ['Inlet', 6380, 3520], ['Beach', 5700, 3780],
     ['Tidepools', 7320, 3090], ['The Sea', 7100, 4020],
     ['Desert', 1900, 2780], ['Ridge', 2760, 2980], ['Taiga', 4000, 740],
     ['Tundra', 4000, 260], ['Glade', 5900, 1680], ['Rainforest', 7450, 2500],
     ['Scablands', 700, 1700], ['Savanna', 620, 3900], ['Marsh', 3500, 3560],
     ['Bamboo', 4450, 1800], ['Cherry', 6300, 2800], ['Bird Town', 4380, 1380],
     ['Farmyard', 4420, 3200], ['Dog’s Paradise', 3700, 2100], ['Mesa', 880, 2330]].forEach(function (p) {
      mapLabel(c, p[0], p[1] * sx, p[2] * sy, '#ffffff', 'rgba(38,78,34,0.78)');
    });
    /* home: a little cottage with a red roof */
    var hx = W.HOUSE.x * sx, hy = W.HOUSE.y * sy;
    c.lineJoin = 'round';
    c.fillStyle = '#fffaf0'; c.strokeStyle = '#ffffff'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(hx - 11, hy - 6); c.lineTo(hx, hy - 16); c.lineTo(hx + 11, hy - 6); c.lineTo(hx + 8, hy - 6);
    c.lineTo(hx + 8, hy + 5); c.lineTo(hx - 8, hy + 5); c.lineTo(hx - 8, hy - 6); c.closePath();
    c.stroke(); c.fill();
    c.fillStyle = '#e8504a';
    c.beginPath(); c.moveTo(hx - 12, hy - 5); c.lineTo(hx, hy - 16); c.lineTo(hx + 12, hy - 5); c.closePath(); c.fill();
    c.fillStyle = '#9a6034'; c.fillRect(hx - 2.5, hy - 2, 5, 7);
    /* landmarks - the places you go INTO, or across, drawn as little
       pictures so she can find them again (v1.15) */
    var cm = W.caveMouth;
    if (cm) {
      var cx0 = cm.x * sx, cy0 = cm.y * sy + 4;
      c.fillStyle = '#8a8378';
      c.beginPath(); c.ellipse(cx0, cy0, 19, 15, 0, Math.PI, 0); c.lineTo(cx0 + 19, cy0 + 5); c.lineTo(cx0 - 19, cy0 + 5); c.closePath(); c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.stroke();
      c.fillStyle = '#1c1612';
      c.beginPath(); c.ellipse(cx0, cy0 + 3, 10, 10, 0, Math.PI, 0); c.lineTo(cx0 + 10, cy0 + 5); c.lineTo(cx0 - 10, cy0 + 5); c.closePath(); c.fill();
      c.font = FONT;
      mapLabel(c, 'Lava Tube', cx0, cy0 + 24, '#fff2a8', 'rgba(60,36,20,0.85)');
    }
    var br = W.bridge;
    if (br) {
      c.save();
      c.translate(br.x * sx, br.y * sy);
      c.rotate(Math.atan2(br.dy, br.dx));
      c.fillStyle = '#c98a4e'; c.fillRect(-14, -6, 28, 12);
      c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.strokeRect(-14, -6, 28, 12);
      c.strokeStyle = '#8a5a2c'; c.lineWidth = 1.5;
      for (var pl = -7; pl <= 7; pl += 7) { c.beginPath(); c.moveTo(pl, -5); c.lineTo(pl, 5); c.stroke(); }
      c.restore();
    }
    /* Guin: a pink dot in a soft pink glow */
    var gx = GG.Player.x * sx, gy = GG.Player.y * sy;
    c.fillStyle = 'rgba(255,95,146,0.28)';
    c.beginPath(); c.arc(gx, gy, 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ff4f8a';
    c.beginPath(); c.arc(gx, gy, 8, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke();
  }

  /* ---------- title animation ---------- */
  function titleAnim() {
    /* v1.20: the whole title screen is a little living garden - a sky with
       a turning sun and drifting clouds, rolling hills, swaying trees and
       flowers, bugs looping about and Cookie trotting along the bottom.
       The still parts (sky, hills) are painted once per size and reused. */
    var cv = $('title-canvas');
    if (!cv) return;
    var scr = $('screen-title');
    var c = cv.getContext('2d');
    var bugs = [];
    var picks = ['monarch', 'blue_butterfly', 'ladybug', 'firefly', 'bumblebee', 'swallowtail', 'dragonfly', 'luna_moth'];
    picks.forEach(function (id, i) {
      var def = GG.BUG_BY_ID[id];
      if (def) bugs.push({ def: def, fx: 0.12 + (i % 4) * 0.25, fy: 0.3 + (i % 3) * 0.085, ph: i * 1.3, sp: 0.45 + (i % 3) * 0.18 });
    });
    var dog = GG.ANIMAL_BY_ID && GG.ANIMAL_BY_ID.cookie;
    var W = 0, H = 0, dpr = 1, sky = null, hills = null, cloud = null, running = false;
    var motes = [];
    for (var m = 0; m < 16; m++) motes.push({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random() * 0.8, ph: Math.random() * 6 });
    var FLW = ['#ff8fb8', '#ffd84a', '#c3a8ff', '#ffffff', '#ff9a5c'];

    function layer() {
      var l = document.createElement('canvas');
      l.width = Math.round(W * dpr); l.height = Math.round(H * dpr);
      var x = l.getContext('2d'); x.scale(dpr, dpr);
      return { cv: l, c: x };
    }
    function hillY(base, amp, f, ph, x) { return base + Math.sin(x / W * Math.PI * f + ph) * amp; }
    function hill(x2, base, amp, f, ph, col) {
      x2.fillStyle = col;
      x2.beginPath(); x2.moveTo(0, H);
      for (var x = 0; x <= W + 8; x += 8) x2.lineTo(x, hillY(base, amp, f, ph, x));
      x2.lineTo(W, H); x2.closePath(); x2.fill();
    }
    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = scr.clientWidth || 412; H = scr.clientHeight || 860;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      /* sky */
      var s = layer(); sky = s.cv;
      var g = s.c.createLinearGradient(0, 0, 0, H * 0.7);
      g.addColorStop(0, '#5fc6f7'); g.addColorStop(0.55, '#aee6ff'); g.addColorStop(1, '#fff3cf');
      s.c.fillStyle = g; s.c.fillRect(0, 0, W, H);
      var sg = s.c.createRadialGradient(W - 34, 44, 10, W - 34, 44, Math.max(W, H) * 0.55);
      sg.addColorStop(0, 'rgba(255,250,200,0.85)'); sg.addColorStop(1, 'rgba(255,250,200,0)');
      s.c.fillStyle = sg; s.c.fillRect(0, 0, W, H);
      /* hills, far to near, with flowers dotted in the grass */
      var h = layer(); hills = h.cv; var x2 = h.c;
      hill(x2, H * 0.61, 16, 2.3, 0.4, '#a9e59a');
      hill(x2, H * 0.69, 20, 1.6, 2.2, '#7fd464');
      var rnd = GG.mulberry32 ? GG.mulberry32(20260926) : Math.random;
      for (var i = 0; i < W * 0.22; i++) {
        var fx = rnd() * W, fy = hillY(H * 0.69, 20, 1.6, 2.2, fx) + 6 + rnd() * (H * 0.1);
        x2.fillStyle = FLW[(rnd() * FLW.length) | 0];
        x2.beginPath(); x2.arc(fx, fy, 1.6 + rnd() * 1.4, 0, 6.2832); x2.fill();
      }
      hill(x2, H * 0.8, 14, 1.2, 4.1, '#5ec44b');
      var hg = x2.createLinearGradient(0, H * 0.78, 0, H);
      hg.addColorStop(0, 'rgba(255,255,255,0.18)'); hg.addColorStop(0.2, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(20,90,20,0.18)');
      x2.fillStyle = hg; x2.fillRect(0, H * 0.76, W, H * 0.24);
      /* little grass tufts, three blades each */
      x2.lineCap = 'round'; x2.lineWidth = 1.8;
      for (var k = 0; k < W * 0.09; k++) {
        var gx = rnd() * W, gy = hillY(H * 0.8, 14, 1.2, 4.1, gx) + 14 + rnd() * (H * 0.16);
        x2.strokeStyle = rnd() < 0.5 ? 'rgba(60,150,50,0.55)' : 'rgba(150,235,120,0.8)';
        x2.beginPath();
        x2.moveTo(gx - 3, gy - 5); x2.lineTo(gx, gy); x2.lineTo(gx, gy - 7);
        x2.moveTo(gx, gy); x2.lineTo(gx + 3, gy - 5);
        x2.stroke();
      }
      /* one puffy cloud, drawn once and reused */
      var cl = document.createElement('canvas');
      cl.width = Math.round(150 * dpr); cl.height = Math.round(70 * dpr);
      var cc = cl.getContext('2d'); cc.scale(dpr, dpr);
      var puffs = [[40, 44, 22], [68, 33, 28], [98, 40, 24], [122, 50, 16], [24, 52, 14], [60, 54, 16], [92, 55, 15]];
      cc.fillStyle = '#d7efff';
      puffs.forEach(function (p) { cc.beginPath(); cc.arc(p[0], p[1] + 3, p[2], 0, 6.2832); cc.fill(); });
      cc.fillStyle = '#ffffff';
      puffs.forEach(function (p) { cc.beginPath(); cc.arc(p[0], p[1], p[2], 0, 6.2832); cc.fill(); });
      cloud = cl;
    }

    var start = performance.now();
    function frame(now) {
      if (scr.classList.contains('hidden')) { running = false; return; }
      if ((scr.clientWidth && scr.clientWidth !== W) || (scr.clientHeight && scr.clientHeight !== H) || !sky) build();
      var t = (now - start) / 1000;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(sky, 0, 0);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* the sun, turning */
      var sx = W - 34, sy = 44;
      c.fillStyle = 'rgba(255,236,120,0.45)';
      c.beginPath();
      for (var r = 0; r < 12; r++) {
        var a0 = t * 0.2 + r * 0.5236;
        c.moveTo(sx, sy); c.arc(sx, sy, 110, a0, a0 + 0.2); c.closePath();
      }
      c.fill();
      c.fillStyle = '#ffe45c'; c.beginPath(); c.arc(sx, sy, 34 + Math.sin(t * 2) * 1.5, 0, 6.2832); c.fill();
      c.fillStyle = '#fff6a8'; c.beginPath(); c.arc(sx - 8, sy - 8, 14, 0, 6.2832); c.fill();
      /* clouds drift right and wrap round */
      for (var q = 0; q < 3; q++) {
        var cw = 150 * (0.7 + q * 0.2);
        var cx = ((t * (8 + q * 5) + q * W * 0.45) % (W + cw)) - cw;
        c.globalAlpha = 0.85 - q * 0.1;
        c.drawImage(cloud, cx, H * (0.2 + q * 0.09) - 30, cw, cw * 0.47);
      }
      c.globalAlpha = 1;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(hills, 0, 0);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* trees at the sides, swaying */
      GG.Props.tree(c, 26, H * 0.74, 40, t, 0.3);
      if (GG.Props.appleTree) GG.Props.appleTree(c, W - 22, H * 0.72, 36, t, 0.8);
      else GG.Props.tree(c, W - 22, H * 0.72, 36, t, 0.8);
      /* floating pollen twinkles */
      for (var mi = 0; mi < motes.length; mi++) {
        var mo = motes[mi];
        var my = ((mo.y - t * 0.025 * mo.s) % 1 + 1) % 1;
        var mx = mo.x + Math.sin(t * 0.7 + mo.ph) * 0.02;
        c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 3 + mo.ph);
        c.fillStyle = '#fffbe0';
        c.beginPath(); c.arc(mx * W, my * H * 0.8, 2 + mo.s * 1.5, 0, 6.2832); c.fill();
      }
      c.globalAlpha = 1;
      /* bugs looping about in the open sky */
      for (var b = 0; b < bugs.length; b++) {
        var gb = bugs[b];
        var ax = Math.min(W * 0.2, 90), ay = H * 0.05;
        var x = gb.fx * W + Math.sin(t * gb.sp + gb.ph) * ax;
        var y = gb.fy * H + Math.cos(t * gb.sp * 1.4 + gb.ph) * ay;
        var ang = Math.atan2(-Math.sin(t * gb.sp * 1.4 + gb.ph) * ay * gb.sp * 1.4,
                             Math.cos(t * gb.sp + gb.ph) * ax * gb.sp);
        GG.BugArt.draw(c, gb.def, x, y, 1.45, ang, t + gb.ph);
      }
      /* Cookie trotting back and forth along the bottom */
      if (dog && GG.AnimalArt) {
        var span = W + 120, period = span / 46;
        var ph = (t % (period * 2)) / period;
        var goingLeft = ph > 1;
        var dx = goingLeft ? (2 - ph) * span - 60 : ph * span - 60;
        var fs = GG.animalFit ? GG.animalFit(dog, 56) : 1;
        GG.AnimalArt.shadow(c, dx, H - 24, 20, 0.18);
        GG.AnimalArt.draw(c, dog, dx, H - 24 - Math.abs(Math.sin(t * 7)) * 2, fs, goingLeft, t, 1, null);
      }
      /* a row of flowers along the very bottom */
      var n = Math.ceil(W / 30);
      for (var f = 0; f < n; f++) {
        var fxp = 8 + f * 30 + (f % 2) * 6, fyp = H - 4 - (f % 3) * 6;
        if (f % 4 === 1 && GG.Props.tulip) GG.Props.tulip(c, fxp, fyp, 10, t, f * 0.7, FLW[f % 5]);
        else GG.Props.flower(c, fxp, fyp, 10, t, f * 0.7, FLW[f % 5]);
      }
      requestAnimationFrame(frame);
    }
    function go() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }
    /* coming back to the title (after a guest visit, say) starts it again */
    if (window.MutationObserver) {
      new MutationObserver(function () { if (!scr.classList.contains('hidden')) go(); })
        .observe(scr, { attributes: true, attributeFilter: ['class'] });
    }
    go();
  }

  /* ---------- loop ---------- */
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
    lastTime = now;
    if (!started) return;

    var paused = GG.UI.anyOpen();
    GG.Input.beginFrame();
    if (paused) { GG.Input.x = GG.Input.y = 0; GG.Input.mag = 0; GG.Input.actionPressed = false; }
    else elapsed += dt;

    if (!paused) {
      if (scene === 'world') updateWorld(dt);
      else if (scene === 'house') updateHouse(dt);
      else if (scene === 'cave') updateCave(dt);

      saveTimer -= dt;
      if (saveTimer <= 0) {
        saveTimer = 8;
        GG.Save.data.clock = GG.Time.minutes;
        GG.Save.data.day = GG.Time.day;
        GG.Save.save();
      }
    }

    /* While a panel or a card is open the garden is frozen, so it is drawn
       once and then left alone - no point painting the same picture sixty
       times a second underneath a book (v1.19). */
    if (!paused || !_pausedDrawn) {
      _pausedDrawn = paused;
      ctx.save();
      ctx.clearRect(0, 0, GG.view.w, GG.view.h);
      if (scene === 'world') drawWorld(elapsed);
      else if (scene === 'house') drawHouse(elapsed);
      else if (scene === 'cave') drawCave(elapsed);
      drawMoveTarget(elapsed);
      ctx.restore();
    }
    /* paint the next patch of ground before she walks onto it */
    if (!paused && scene === 'world' && GG.World.prewarm && dt < 0.034) {
      var pdx = lastCamX === null ? 0 : cam.x - lastCamX, pdy = lastCamY === null ? 0 : cam.y - lastCamY;
      lastCamX = cam.x; lastCamY = cam.y;
      GG.World.prewarm(cam, GG.view.w, GG.view.h, pdx, pdy);
    }

    setText($('chip-time'), (GG.view.cssW < 400 ? '' : 'Day ' + GG.Time.day + ' · ') + GG.Time.label() +
      (GG.Time.rain ? ' ☔' : ''));
    var placeNow = scene === 'house' ? 'Home'
      : (scene === 'cave' ? 'The Lava Tube' : GG.World.placeName(GG.Player.x, GG.Player.y));
    setText($('chip-place'), placeNow);
    parkNotice(placeNow);

    /* the sound of the place she is in */
    if (GG.Audio.ready()) {
      GG.Music.setMood(GG.Music.moodForNow(scene));
      GG.Ambience.update(dt, scene, GG.Player.x, GG.Player.y);
      if (paused !== _wasPaused) { _wasPaused = paused; GG.Audio.duck(paused); }
    }
  }
  var _wasPaused = false;

  /* what the prompt calls the thing she is about to pick (v1.18) */
  function pickPrompt(plant) {
    var d = plant && GG.FRUIT_BY_ID[plant.fruit];
    var k = d && d.kind;
    return k === 'flower' ? 'Tap to pick a flower'
      : (k === 'veg' ? 'Tap to pick the vegetable'
        : (k === 'berry' ? 'Tap to pick the berries' : 'Tap to pick the fruit'));
  }

  /* The notice board at Dog's Paradise: every time she walks in, one thing
     worth knowing about how dogs play (v1.18). Checked against Byosiere et
     al. 2016 on the play bow, Bekoff on fair play, Cornell's vet school on
     the zoomies, and the ASPCA on grapes and onions. */
  GG.DOGPARK_FACTS = [
    'Dog\u2019s Paradise! When a dog drops its front end down with its bottom in the air, that is a play bow. It means: let\u2019s play!',
    'Dog\u2019s Paradise! Big dogs often play gently with little ones, and even roll over and let them win. Scientists call it self-handicapping.',
    'Dog\u2019s Paradise! A dog racing round in wild circles has the zoomies. Vets call them frenetic random activity periods, and they are perfectly normal.',
    'Dog\u2019s Paradise! Never share grapes, raisins or onions with a dog. They are poisonous to dogs.',
    'Dog\u2019s Paradise! Always ask a dog\u2019s person before you say hello, and leave dogs that are eating or sleeping alone.'
  ];
  /* v1.20: Guin asked for a Mesa. The sign at the foot of the trail says
     what a mesa is and how to be safe on one. Checked against the USGS and
     NPS on mesas and buttes, and Washington State Parks on Steamboat Rock. */
  GG.MESA_FACTS = [
    'The Mesa! Mesa is the Spanish word for table. It is a hill with steep sides and a flat top, like a giant table.',
    'The Mesa! A hard layer of rock on top, called the caprock, keeps the softer rock underneath from wearing away.',
    'The Mesa! Stay on the trail and well back from the edge. Cliff edges can crumble.',
    'The Mesa! As rain and wind wear a mesa away it gets smaller. A small one with a narrow top is called a butte.',
    'The Mesa! Rattlesnakes rest in rock cracks here. Never put your hands where you cannot see, and bring plenty of water.'
  ];
  var _lastPlace = '', _parkFact = 0, _parkAt = -1e9, _mesaFact = 0, _mesaAt = -1e9;
  function parkNotice(place) {
    if (place === _lastPlace) return;
    var was = _lastPlace;
    _lastPlace = place;
    if (!was) return;
    var now = performance.now();
    if (place === 'The Mesa') {
      if (now - _mesaAt < 30000) return;
      _mesaAt = now;
      GG.UI.toast(GG.MESA_FACTS[_mesaFact++ % GG.MESA_FACTS.length], 5200);
      return;
    }
    if (place !== 'Dog\u2019s Paradise') return;
    if (now - _parkAt < 30000) return;   // not again just for stepping out and back
    _parkAt = now;
    GG.UI.toast(GG.DOGPARK_FACTS[_parkFact++ % GG.DOGPARK_FACTS.length], 5200);
  }

  /* ---------- "update ready" on the title screen ---------- */
  var swReg = null, updateAsked = false, updateReady = false, updateRaf = 0;

  function drawUpdateIcon() {
    var cv = $('update-icon');
    if (!cv) return;
    var c = cv.getContext('2d');
    var start = performance.now();
    cancelAnimationFrame(updateRaf);
    function frame(now) {
      var bar = $('update-bar');
      if (!bar || bar.hidden) return;
      var t = (now - start) / 1000;
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = 'rgba(242,185,60,0.22)';
      c.beginPath(); c.arc(44, 44, 34 + Math.sin(t * 2) * 2, 0, Math.PI * 2); c.fill();
      GG.BugArt.draw(c, GG.BUG_BY_ID.monarch, 44, 44, 2.4, -Math.PI / 2, t);
      updateRaf = requestAnimationFrame(frame);
    }
    updateRaf = requestAnimationFrame(frame);
  }

  function showUpdate() {
    if (updateReady) return;
    updateReady = true;
    var bar = $('update-bar');
    if (bar) { bar.hidden = false; drawUpdateIcon(); }
    var mb = $('menu-update');
    if (mb) mb.hidden = false;
    GG.Sfx.coin();
    if (started) GG.UI.toast('An update is ready! It is in the menu.', 3200);
  }

  function applyUpdate(btn) {
    GG.Sfx.click();
    GG.Save.data.clock = GG.Time.minutes;
    GG.Save.data.day = GG.Time.day;
    GG.Save.save();
    updateAsked = true;
    if (btn) { btn.textContent = 'Updating\u2026'; btn.disabled = true; }
    if (swReg && swReg.waiting) swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    else location.reload();
    setTimeout(function () { location.reload(); }, 4000);   // safety net
  }

  function setupUpdates() {
    var bar = $('update-bar');
    if (bar) {
      $('btn-update').addEventListener('click', function () { applyUpdate($('btn-update')); });
      $('btn-update-later').addEventListener('click', function () {
        GG.Sfx.click(); bar.hidden = true;
      });
    }
    var mb = $('menu-update');
    if (mb) mb.addEventListener('click', function () { applyUpdate(mb); });

    if (!('serviceWorker' in navigator) || location.protocol.indexOf('http') !== 0) return;

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (updateAsked) location.reload();
    });

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        swReg = reg;
        var hadController = !!navigator.serviceWorker.controller;
        if (reg.waiting && hadController) showUpdate();
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          if (!w) return;
          w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller && reg.waiting) showUpdate();
          });
        });
        function check() { reg.update().catch(function () {}); }
        document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
        setInterval(check, 15 * 60 * 1000);
      }).catch(function () {});
    });
  }

  GG.debugShowUpdate = showUpdate;   // used by the tests
  GG.debugSetScene = setScene;       // used by the tests
  GG.debugScene = function () { return scene; };

  /* ---------- start ---------- */
  function startGame() {
    if (started) {
      GG.UI.close('screen-title');
      return;
    }
    startSound();
    /* v1.20: a garden with no character yet makes one first (a new game, a
       save from before v1.20 - prefilled as Guin - or a friend's visit) */
    if (GG.CharSelect && GG.CharSelect.needed()) {
      if (!GG.CharSelect.isOpen()) GG.CharSelect.open(function () { startGame(); });
      return;
    }
    started = true;
    GG.UI.close('screen-title');
    setScene('world');
    checkNews();
    if (!GG.Save.data.seenIntro) {
      GG.Save.data.seenIntro = true; GG.Save.save();
      setTimeout(function () { GG.UI.toast('Tap where you want to go, or slide your thumb anywhere to walk', 3200); }, 600);
      setTimeout(function () { GG.UI.toast('Tap NET to swing at a bug', 2800); }, 3800);
    }
  }


  /* ---------- settings ---------- */
  var SLIDERS = [['set-music', 'music'], ['set-amb', 'ambience'], ['set-sfx', 'sfx']];

  function refreshSettings() {
    var st = GG.Save.data.settings || (GG.Save.data.settings = GG.Save.readSettings());
    SLIDERS.forEach(function (p) {
      var pct = Math.round((st[p[1]] || 0) * 100);
      $(p[0]).value = pct;
      $(p[0] + '-val').textContent = GG.Save.data.muted ? 'off' : pct + '%';
      $(p[0]).disabled = !!GG.Save.data.muted;
    });
    $('set-mute').textContent = GG.Save.data.muted ? 'Turn sound back on' : 'Turn all sound off';
    $('set-version').textContent = 'Guin\u2019s Garden version ' + (GG.VERSION || '1.0');
    var guest = GG.Save.isGuest();
    $('guest-banner').hidden = !guest;
    $('danger-note').textContent = guest
      ? 'This clears the guest garden only. Guin\u2019s garden is in a different place and is not touched.'
      : 'Starting again forgets every bug and fish, every tank and all your sparkles. There is no way to get them back.';
    hideResetStep2();
  }

  function hideResetStep2() {
    $('reset-step2').hidden = true;
    $('set-reset').hidden = false;
    $('reset-yes').classList.remove('arming');
    clearTimeout(_holdTimer);
  }

  var _holdTimer = null;

  function openSettings() {
    refreshSettings();
    GG.UI.open('screen-settings');
  }

  function wireSettings() {
    SLIDERS.forEach(function (p) {
      $(p[0]).addEventListener('input', function () {
        var v = GG.clamp(parseInt(this.value, 10) / 100, 0, 1);
        GG.Save.data.settings[p[1]] = v;
        $(p[0] + '-val').textContent = Math.round(v * 100) + '%';
        GG.Save.writeSettings();
        GG.Audio.applyVolumes();
      });
      /* a little taste of the level when she lets go */
      $(p[0]).addEventListener('change', function () {
        if (p[1] === 'sfx') GG.Sfx.coin();
      });
    });

    $('set-mute').addEventListener('click', function () {
      GG.Save.data.muted = !GG.Save.data.muted;
      GG.Save.save();
      GG.Audio.applyVolumes();
      if (!GG.Save.data.muted) { GG.Sfx.unlock(); GG.Sfx.click(); startSound(); }
      refreshSettings();
    });

    $('set-whatsnew').addEventListener('click', function () {
      GG.Sfx.click();
      showNews(GG.CHANGELOG.slice(0, 1), true);
    });

    /* Starting over is deliberately awkward: a button, then a question,
       then three seconds of holding the pink one down. */
    $('set-reset').addEventListener('click', function () {
      GG.Sfx.click();
      $('reset-count').textContent = String(GG.Save.totalSpecies() + GG.Save.totalFish());
      $('reset-q').innerHTML = GG.Save.isGuest()
        ? 'Clear this guest garden?'
        : 'Are you sure? There are <span id="reset-count">' +
          (GG.Save.totalSpecies() + GG.Save.totalFish()) + '</span> bugs and fish in the books.';
      $('reset-step2').hidden = false;
      $('set-reset').hidden = true;
    });
    $('reset-no').addEventListener('click', function () { GG.Sfx.click(); hideResetStep2(); });

    var yes = $('reset-yes');
    function armStart(e) {
      if (e && e.preventDefault) e.preventDefault();
      yes.classList.add('arming');
      clearTimeout(_holdTimer);
      _holdTimer = setTimeout(function () {
        yes.classList.remove('arming');
        GG.Save.reset();
        location.reload();
      }, 3000);
    }
    function armStop() {
      yes.classList.remove('arming');
      clearTimeout(_holdTimer);
    }
    yes.addEventListener('mousedown', armStart);
    yes.addEventListener('touchstart', armStart, { passive: false });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(function (ev) {
      yes.addEventListener(ev, armStop);
    });
    /* a plain click does nothing on its own - it has to be held */
    yes.addEventListener('click', function (e) { e.preventDefault(); });
  }

  /* ---------- what's new ---------- */
  function showNews(entries, manual) {
    if (!entries || !entries.length) {
      if (manual) GG.UI.toast('You are on the newest version');
      return;
    }
    $('news-title').textContent = manual ? 'What\u2019s new' : 'The garden has grown!';
    var body = $('news-body');
    body.innerHTML = '';
    entries.forEach(function (e) {
      var h = GG.el('div', 'newsver', 'Version ' + e.v + ' \u00b7 ' + e.title);
      body.appendChild(h);
      e.lines.forEach(function (l) {
        var d = GG.el('div', 'newsline');
        d.innerHTML = '<b>&#10022;</b> ' + l;
        body.appendChild(d);
      });
    });
    GG.UI.open('screen-news');
    newsAnim();
  }

  function newsAnim() {
    var cv = $('news-art'); if (!cv) return;
    var c = cv.getContext('2d');
    var start = performance.now();
    var picks = ['monarch', 'firefly', 'dragonfly', 'ladybug', 'hermit_crab', 'sea_star']
      .map(function (id) { return GG.BUG_BY_ID[id]; }).filter(Boolean);
    cancelAnimationFrame(newsAnim._raf);
    function frame(now) {
      if ($('screen-news').classList.contains('hidden')) return;
      var t = (now - start) / 1000;
      var g = c.createLinearGradient(0, 0, 0, cv.height);
      g.addColorStop(0, '#cfeeff'); g.addColorStop(1, '#9ed98a');
      c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
      c.fillStyle = '#8ac462';
      c.beginPath();
      c.moveTo(0, 132); c.quadraticCurveTo(cv.width / 2, 112, cv.width, 132);
      c.lineTo(cv.width, cv.height); c.lineTo(0, cv.height); c.closePath(); c.fill();
      picks.forEach(function (def, i) {
        var x = 60 + i * ((cv.width - 120) / Math.max(1, picks.length - 1));
        var y = 82 + Math.sin(t * 1.6 + i * 1.1) * 22;
        GG.BugArt.draw(c, def, x, y, 2.4, -Math.PI / 2, t + i);
      });
      newsAnim._raf = requestAnimationFrame(frame);
    }
    newsAnim._raf = requestAnimationFrame(frame);
  }

  /* Show the card once, the first time a newer build is opened. */
  function checkNews() {
    var seen = GG.Save.data.version;
    GG.Save.data.version = GG.VERSION;
    GG.Save.save();
    if (!seen) return;                                  // a brand new garden
    if (GG.cmpVersion(seen, GG.VERSION) >= 0) return;   // already up to date
    var list = GG.changesSince(seen);
    if (list.length) setTimeout(function () { showNews(list, false); }, 700);
  }

  /* ---------- letting a friend play ---------- */
  function refreshGuestChrome() {
    var guest = GG.Save.isGuest();
    $('chip-guest').hidden = !guest;
    $('chip-guest').textContent = guest
      ? (GG.Save.data.guestName || 'Guest') + '\u2019s visit'
      : '';
    $('menu-endguest').hidden = !guest;
    $('btn-guest').textContent = guest ? 'Back to Guin\u2019s garden' : 'Let a friend play';
    $('title-sub').textContent = guest
      ? 'a friend is visiting'
      : 'a gentle bug catching adventure';
  }

  function wireGuest() {
    $('btn-guest').addEventListener('click', function () {
      GG.Sfx.click();
      if (GG.Save.isGuest()) { endGuest(); return; }
      $('guest-name').value = '';
      GG.UI.open('screen-guest');
    });
    $('guest-start').addEventListener('click', function () {
      GG.Sfx.click();
      var name = ($('guest-name').value || '').trim().slice(0, 14) || 'Friend';
      GG.Save.startGuest(name);
      GG.UI.close('screen-guest');
      restartInto();
      GG.UI.toast('Welcome, ' + name + '! This garden is all yours.', 3200);
    });
    $('menu-endguest').addEventListener('click', function () {
      GG.Sfx.click();
      if (window.confirm('Finish the visit? The guest garden is cleared, and Guin\u2019s comes back exactly as she left it.')) {
        endGuest();
      }
    });
  }

  function endGuest() {
    GG.Save.endGuest();
    restartInto();
    GG.UI.toast('Welcome back, ' + (GG.playerName ? GG.playerName() : 'Guin') + '!', 2600);
  }

  /* Reload the world for whichever save slot is now loaded. */
  function restartInto() {
    GG.Time.minutes = GG.Save.data.clock;
    GG.Time.day = GG.Save.data.day;
    GG.Critters.clear();
    GG.Fishing.reset();
    GG.Fishing.swimmers.length = 0;
    GG.Friends.clear();
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 100);
    GG.Friends.loadCompanion();
    GG.UI.refreshHud();
    refreshGuestChrome();
    ['screen-menu', 'screen-settings', 'screen-book', 'screen-terrarium', 'screen-shop'].forEach(function (id) {
      GG.UI.close(id);
    });
    if (!started) { started = true; GG.UI.close('screen-title'); }
    setScene('world');
  }

  /* ---------- starting the sound ---------- */
  function startSound() {
    GG.Sfx.unlock();
    GG.Audio.applyVolumes();
    GG.Music.start();
    GG.Ambience.start();
  }

  function boot() {
    canvas = $('game');
    ctx = canvas.getContext('2d');
    /* A guest visit survives a reload, so nobody is dumped into Guin's
       garden halfway through their turn. */
    GG.Save.setSlot(GG.Save.rememberedSlot());
    GG.Save.load();
    GG.Time.minutes = GG.Save.data.clock;
    GG.Time.day = GG.Save.data.day;
    GG.World.build();
    GG.Orchard.assign();
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 100);
    GG.Friends.loadCompanion();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function () { setTimeout(resize, 250); });

    GG.Input.init($('app'), $('stick'), $('knob'), $('btn-a'), $('btn-fish'), $('btn-friend'));
    GG.UI.init();
    GG.UI.openPanels.push('screen-title');
    GG.UI.refreshHud();
    GG.Terrarium.initEvents();
    titleAnim();

    $('btn-play').addEventListener('click', function () { GG.Sfx.click(); startGame(); });
    /* v1.20: "My character", on the title and in the Garden Menu */
    if ($('btn-char')) $('btn-char').addEventListener('click', function () {
      GG.Sfx.click(); startSound();
      GG.CharSelect.open(function () { startGame(); });
    });
    if ($('menu-char')) $('menu-char').addEventListener('click', function () {
      GG.Sfx.click(); GG.UI.close('screen-menu'); GG.CharSelect.open();
    });
    $('btn-howto').addEventListener('click', function () { GG.Sfx.click(); GG.UI.open('screen-help'); });
    $('btn-settings').addEventListener('click', function () { GG.Sfx.click(); startSound(); openSettings(); });
    /* v1.19 (David): the Garden Menu gets out of the way when Settings or
       How to play opens, rather than sitting on top of it */
    $('menu-settings').addEventListener('click', function () { GG.Sfx.click(); GG.UI.close('screen-menu'); openSettings(); });
    wireSettings();
    wireGuest();
    /* v1.20: a visiting friend makes a character of their own (runs after
       wireGuest's handler has started the guest garden) */
    $('guest-start').addEventListener('click', function () {
      if (GG.CharSelect && GG.Save.isGuest() && GG.CharSelect.needed()) GG.CharSelect.open();
    });
    refreshGuestChrome();
    $('btn-menu').addEventListener('click', function () {
      GG.Sfx.click();
      var found = 0, total = 0;
      (GG.Book.BOOKS || []).forEach(function (b) { found += b.found(); total += b.list().length; });
      $('menu-progress').textContent = found + ' of ' + total + ' pages in your Critter Compendium';
      $('menu-place').textContent = 'Day ' + GG.Time.day + ' · ' + GG.Time.phaseName() +
        ' · ✦ ' + GG.Save.data.sparkles;
      if ($('map-me')) $('map-me').textContent = GG.playerName ? GG.playerName() : 'Guin';
      GG.UI.open('screen-menu');
      drawMinimap();
    });
    $('menu-book').addEventListener('click', function () { GG.Sfx.click(); GG.UI.close('screen-menu'); GG.Book.open(); });
    $('menu-help').addEventListener('click', function () { GG.Sfx.click(); GG.UI.close('screen-menu'); GG.UI.open('screen-help'); });

    GG.UI.onCatchClosed = function () { swingChecked = true; };
    GG.UI.onWarningClosed = function () { swingChecked = true; };
    GG.Friends.onFriend = function (def, isNew, reward) {
      GG.UI.showFriend(def, isNew, reward);
    };

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        GG.Save.data.clock = GG.Time.minutes;
        GG.Save.data.day = GG.Time.day;
        GG.Save.save();
      } else { lastTime = performance.now(); }
    });

    requestAnimationFrame(function (t) { lastTime = t; loop(t); });

    setupUpdates();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.GG = window.GG || {});
