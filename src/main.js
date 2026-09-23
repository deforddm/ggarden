/* Guin's Garden - main loop and glue. */
(function (GG) {
  'use strict';
  var $ = GG.$;

  var canvas, ctx, dpr = 1;
  var scene = 'title';
  var cam = { x: 0, y: 0 };
  var lastTime = 0, elapsed = 0;
  var swingChecked = false;
  var saveTimer = 0;
  var hurtFlash = 0;
  var rainDrops = [];
  var started = false;

  GG.view = { w: 480, h: 320, cssW: 480, cssH: 320, zoom: 1 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
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

  function setScene(s) {
    scene = s;
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
  function updateFishButton(fishing, castable) {
    var btn = $('btn-fish');
    var show = fishing || castable;
    btn.classList.toggle('hidden', !show);
    if (!show) { _fishLabel = ''; btn.classList.remove('ready'); return; }
    var st = GG.Fishing.state;
    var main = 'FISH', sub = 'cast', ready = false;
    if (st === 'bite') { main = 'CATCH'; sub = 'now!'; ready = true; }
    else if (st === 'nibble') { main = 'WAIT'; sub = 'nibble\u2026'; }
    else if (st === 'wait') { main = 'WAIT'; sub = 'reel in'; }
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
  function updateWorld(dt) {
    var W = GG.World, P = GG.Player;
    GG.Time.update(dt);

    var doorD = GG.dist(P.x, P.y, W.DOOR.x, W.DOOR.y + 34);
    var atDoor = doorD < 40;
    /* the lava tube up on the ridge, and the boot brush at its mouth */
    var brush = W.bootBrush;
    if (brush && !brush.used && GG.dist(P.x, P.y, brush.x, brush.y) < 34) {
      brush.used = true;
      GG.Sfx.click();
      GG.UI.toast('You wipe your boots. People carry the bat sickness in on them.', 3200);
    }
    var atCave = !!W.caveMouth && GG.dist(P.x, P.y, W.caveMouth.x, W.caveMouth.y + 20) < 62;
    var Fi = GG.Fishing;

    P.update(dt, function (x, y, r) { return W.blocked(x, y, r); });

    GG.Friends.update(dt, P, 'world');
    GG.Friends.stepCompanion(dt, P);

    GG.Orchard.update(dt);
    GG.Orchard.stepPops(dt);
    var fishing = Fi.active();
    var pickable = !fishing && !atDoor && !GG.Friends.busy ? GG.Orchard.nearest(P) : null;
    var lookAt = !fishing && !atDoor && !GG.Friends.busy ? GG.Critters.nearestLookOnly(P, 78) : null;
    if (lookAt) pickable = null;   // she is the more important thing to notice
    var castable = !fishing && !atDoor ? Fi.castTarget(P) : null;
    updateFishButton(fishing, !!castable);
    var friendly = updateFriendButton(P);
    if (fishing) friendly = null;

    if (GG.Input.action3Pressed) {
      if (!GG.Friends.busy && friendly) GG.Friends.begin(P);
    } else if (GG.Input.action2Pressed || (fishing && GG.Input.actionPressed)) {
      if (fishing) Fi.tap();
      else if (castable) Fi.cast(P);
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
      if (pickable) { pickFruit(pickable); return; }
      if (GG.Friends.busy) GG.UI.toast('Keep still — no net for this one', 1800);
      else if (GG.Friends.riding) GG.UI.toast('Not from up here — get down first', 1800);
      else if (P.startSwing()) swingChecked = false;
    }
    if (P.swinging() && !swingChecked) {
      var pr = P.swingProgress();
      if (pr > 0.16 && pr < 0.8) {
        var got = GG.Critters.tryCatch(P);
        if (got) { swingChecked = true; onCatch(got); }
      }
      if (pr >= 0.8) { swingChecked = true; onSwingMiss(P); }
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
          : (pickable ? 'Tap to pick the fruit' : null))));
    if (P.stun > 0) setActionLabel('OUCH', 'dizzy');
    else if (GG.Friends.busy) setActionLabel('\u2014', 'keep still');
    else if (fishing) setActionLabel('\u2014', 'fishing');
    else if (atDoor) setActionLabel('GO IN', 'door');
    else if (atCave) setActionLabel(caveReady ? 'GO IN' : 'BOOTS', caveReady ? 'lava tube' : 'brush first');
    else if (lookAt) setActionLabel('LOOK', 'don\u2019t catch');
    else if (pickable) {
      var pf = GG.FRUIT_BY_ID[pickable.fruit];
      setActionLabel('PICK', pf ? pf.name.toLowerCase() : 'fruit');
    } else setActionLabel('NET', 'tap');
  }

  function drawWorld(t) {
    var W = GG.World, P = GG.Player;
    W.drawGround(ctx, cam, GG.view.w, GG.view.h);
    canvas._vw = GG.view.w;
    W.drawWater(ctx, cam, t);
    GG.Fishing.drawShadows(ctx, cam, t);
    W.drawBridge(ctx, cam, t);
    W.drawProps(ctx, cam, GG.view.w, GG.view.h, t, 'flat');

    // everything that stands up gets sorted so Guin walks behind trees
    var list = W.sortedProps(cam, GG.view.w, GG.view.h);
    var drawables = [];
    for (var i = 0; i < list.length; i++) drawables.push({ y: list[i].y, p: list[i] });
    drawables.push({ y: P.y, player: true });
    GG.Friends.collect(drawables, cam);
    drawables.sort(function (a, b) { return a.y - b.y; });
    for (var j = 0; j < drawables.length; j++) {
      var d = drawables[j];
      if (d.player) {
        P.draw(ctx, P.x - cam.x, P.y - cam.y - GG.Friends.rideLift(), t);
      } else if (d.friend) {
        GG.Friends.drawEntry(ctx, d, cam, t);
      } else {
        var p = d.p, fn = GG.Props[p.type];
        if (fn) fn(ctx, p.x - cam.x, p.y - cam.y, p.r, t, p.seed, p.col || p.label, p);
      }
    }
    GG.Friends.drawHearts(ctx, cam);
    GG.Orchard.drawPops(ctx, cam);
    GG.Critters.draw(ctx, cam, t);
    GG.Fishing.draw(ctx, cam, t, P);

    var tint = GG.Time.tint();
    if (tint.indexOf(',0.000)') < 0) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
    }
    drawRain();
    if (hurtFlash > 0) {
      ctx.fillStyle = 'rgba(255,70,70,' + (0.34 * (hurtFlash / 0.55)).toFixed(3) + ')';
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
    }
  }

  /* ---------- house scene ---------- */
  function updateHouse(dt) {
    var H = GG.House, P = GG.Player;
    GG.Time.update(dt);
    P.update(dt, function (x, y, r) { return H.blocked(x, y, r); });

    /* the friend who is with her comes indoors too, and the ones waiting at
       home potter about the room */
    GG.Friends.update(dt, P, 'house');
    GG.Friends.stepCompanion(dt, P);
    GG.Friends.stepHome(dt);

    var spot = H.nearest(P.x, P.y);
    GG.UI.prompt(spot ? spot.label : null);
    setActionLabel(spot ? 'OPEN' : '\u2014', spot ? spot.label.toLowerCase() : 'walk around');

    if (GG.Input.actionPressed && spot) {
      GG.Sfx.click();
      if (spot.id === 'door') { leaveHouse(); return; }
      if (spot.id === 'book') GG.Book.open();
      if (spot.id === 'terrarium') GG.Terrarium.open();
      if (spot.id === 'shop') GG.Shop.open();
      if (spot.id === 'bed') sleep();
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
    indoors.sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < indoors.length; i++) {
      var e = indoors[i];
      if (e.player) GG.Player.draw(ctx, GG.Player.x - cam.x, GG.Player.y - cam.y, t);
      else GG.Friends.drawEntry(ctx, e, cam, t);
    }
    if (GG.Time.isDark()) {
      ctx.fillStyle = 'rgba(30,34,80,0.24)';
      ctx.fillRect(0, 0, GG.view.w, GG.view.h);
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
      setTimeout(function () { GG.UI.toast('Walk up to something and tap NET', 2600); }, 500);
    }
  }
  function leaveHouse() {
    GG.Sfx.door();
    GG.Friends.homeList = [];
    setScene('world');
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 50);
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
  function updateCave(dt) {
    var C = GG.Cave, P = GG.Player;
    GG.Time.update(dt);
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
    GG.Player.reset(GG.World.caveMouth.x + 10, GG.World.caveMouth.y + 62);
    GG.UI.prompt(null);
  }

  /* ---------- bees ---------- */
  function onSwingMiss(P) {
    var net = P.netPoint();
    /* swinging at the one she must not catch teaches, it does not punish */
    var forbidden = GG.Critters.lookOnlyUnderNet(P);
    if (forbidden) { lookAtCreature(forbidden); return; }
    var cross = GG.Critters.angerNear(net.x, net.y, 66);
    var hive = GG.World.hive;
    if (hive && GG.dist(net.x, net.y, hive.x, hive.y - 14) < 46) {
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
  function drawMinimap() {
    var cv = $('minimap'); if (!cv) return;
    var c = cv.getContext('2d');
    var W = GG.World;
    var sx = cv.width / W.W, sy = cv.height / W.H;
    var COLS = { meadow: '#9ad96f', garden: '#f0b7d0', forest: '#3f8446', pond: '#a7d78a',
      hill: '#d8d2a4', orchard: '#bfe07a', riverbank: '#8fd07f', beach: '#f0e2b8',
      shore: '#c2bcac', desert: '#cdb68c', mountain: '#9d9a93', taiga: '#3c5c3a',
      tundra: '#c3c9ba', rainforest: '#2f5c2c', glade: '#c9bb6a',
      badlands: '#a2947a', savanna: '#c9b172', swamp: '#5e6b47', bamboo: '#7a9450',
      cherry: '#c8e089', birdtown: '#9ad96f', farmyard: '#b9ac7e' };
    var WCOL = { 1: '#4fa8c9', 2: '#8fd6e2', 3: '#5fb9d4', 4: '#5aa8a4', 5: '#2f7fb4', 6: '#7fd0c4', 7: '#4f7f73' };
    var step = 20;
    for (var y = 0; y < W.H; y += step) {
      for (var x = 0; x < W.W; x += step) {
        var k = W.waterKind(x + 10, y + 10);
        c.fillStyle = k ? WCOL[k] : (COLS[W.biomeAt(x + 10, y + 10)] || '#9ad96f');
        c.fillRect(x * sx, y * sy, step * sx + 1, step * sy + 1);
      }
    }
    c.fillStyle = 'rgba(255,255,255,0.92)';
    c.font = 'bold 15px "Trebuchet MS", sans-serif';
    c.textAlign = 'center';
    c.strokeStyle = 'rgba(60,80,50,0.7)'; c.lineWidth = 3;
    [['Hills', 3600, 1340], ['Meadow', 4100, 1940], ['Woods', 5700, 1580], ['Orchard', 5560, 2380],
     ['Pond', 3820, 2980], ['Garden', 4720, 2680], ['Stream', 4200, 2290],
     ['River', 5350, 2980], ['Inlet', 6380, 3520], ['Beach', 5700, 3780],
     ['Tidepools', 7320, 3090], ['The Sea', 7100, 4020],
     ['Desert', 2100, 2400], ['Ridge', 2720, 2800], ['Taiga', 4000, 740],
     ['Tundra', 4000, 260], ['Glade', 5800, 1640], ['Rainforest', 7450, 2500],
     ['Scablands', 700, 1700], ['Savanna', 620, 3900], ['Marsh', 3500, 3560],
     ['Bamboo', 4450, 1800], ['Cherry', 6300, 2800], ['Bird Town', 4380, 1380],
     ['Farmyard', 4420, 3200]].forEach(function (p) {
      c.strokeText(p[0], p[1] * sx, p[2] * sy);
      c.fillText(p[0], p[1] * sx, p[2] * sy);
    });
    // house
    c.fillStyle = '#c9564f';
    c.fillRect(W.HOUSE.x * sx - 7, W.HOUSE.y * sy - 10, 14, 11);
    c.fillStyle = '#f4e7cf';
    c.fillRect(W.HOUSE.x * sx - 5, W.HOUSE.y * sy - 5, 10, 6);
    /* landmarks - the places you go INTO, or across, drawn as little
       pictures so she can find them again (v1.15) */
    var cm = W.caveMouth;
    if (cm) {
      var cx0 = cm.x * sx, cy0 = cm.y * sy + 4;
      c.fillStyle = '#7a746a';
      c.beginPath(); c.ellipse(cx0, cy0, 19, 15, 0, Math.PI, 0); c.lineTo(cx0 + 19, cy0 + 5); c.lineTo(cx0 - 19, cy0 + 5); c.closePath(); c.fill();
      c.strokeStyle = '#3d3a34'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#120f0c';
      c.beginPath(); c.ellipse(cx0, cy0 + 3, 10, 10, 0, Math.PI, 0); c.lineTo(cx0 + 10, cy0 + 5); c.lineTo(cx0 - 10, cy0 + 5); c.closePath(); c.fill();
      c.font = 'bold 15px "Trebuchet MS", sans-serif';
      c.fillStyle = '#fff6c8'; c.strokeStyle = 'rgba(40,30,20,0.85)'; c.lineWidth = 3;
      c.strokeText('Lava Tube', cx0, cy0 - 20); c.fillText('Lava Tube', cx0, cy0 - 20);
    }
    var br = W.bridge;
    if (br) {
      c.save();
      c.translate(br.x * sx, br.y * sy);
      c.rotate(Math.atan2(br.dy, br.dx));
      c.fillStyle = '#b07a44'; c.fillRect(-14, -6, 28, 12);
      c.strokeStyle = '#6e4622'; c.lineWidth = 2; c.strokeRect(-14, -6, 28, 12);
      c.restore();
    }
    // guin
    c.fillStyle = '#ff5f92';
    c.beginPath(); c.arc(GG.Player.x * sx, GG.Player.y * sy, 7, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke();
  }

  /* ---------- title animation ---------- */
  function titleAnim() {
    var cv = $('title-canvas');
    if (!cv) return;
    var c = cv.getContext('2d');
    var bugs = [];
    var picks = ['monarch', 'blue_butterfly', 'ladybug', 'firefly', 'bumblebee', 'swallowtail', 'dragonfly'];
    picks.forEach(function (id, i) {
      var def = GG.BUG_BY_ID[id];
      if (def) bugs.push({ def: def, x: 60 + i * 92, y: 90 + (i % 3) * 40, ph: i * 1.3, sp: 0.5 + (i % 3) * 0.2 });
    });
    var start = performance.now();
    function frame(now) {
      if ($('screen-title').classList.contains('hidden')) return;
      var t = (now - start) / 1000;
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = '#8ed36a';
      c.beginPath();
      c.moveTo(0, 200); c.quadraticCurveTo(cv.width / 2, 160, cv.width, 200);
      c.lineTo(cv.width, cv.height); c.lineTo(0, cv.height); c.closePath(); c.fill();
      c.fillStyle = '#7bc45c';
      c.beginPath();
      c.moveTo(0, 250); c.quadraticCurveTo(cv.width / 2, 220, cv.width, 250);
      c.lineTo(cv.width, cv.height); c.lineTo(0, cv.height); c.closePath(); c.fill();
      var cols = ['#ff8fb0', '#ffd45c', '#c39bff', '#fff0a8'];
      for (var i = 0; i < 11; i++) {
        GG.Props.flower(c, 30 + i * 62, 250 + (i % 3) * 14, 15, t, i * 0.7, cols[i % 4]);
      }
      GG.Props.tree(c, 66, 230, 54, t, 0.3);
      GG.Props.tree(c, cv.width - 60, 236, 46, t, 0.8);
      for (var b = 0; b < bugs.length; b++) {
        var g = bugs[b];
        var x = g.x + Math.sin(t * g.sp + g.ph) * 46;
        var y = g.y + Math.cos(t * g.sp * 1.4 + g.ph) * 26;
        var ang = Math.atan2(Math.cos(t * g.sp * 1.4 + g.ph) * -26 * g.sp * 1.4,
                             Math.cos(t * g.sp + g.ph) * 46 * g.sp);
        GG.BugArt.draw(c, g.def, x, y, 2.6, ang, t + g.ph);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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

    ctx.save();
    ctx.clearRect(0, 0, GG.view.w, GG.view.h);
    if (scene === 'world') drawWorld(elapsed);
    else if (scene === 'house') drawHouse(elapsed);
    else if (scene === 'cave') drawCave(elapsed);
    ctx.restore();

    $('chip-time').textContent = 'Day ' + GG.Time.day + ' · ' + GG.Time.label() +
      (GG.Time.rain ? ' ☔' : '');
    $('chip-place').textContent = scene === 'house' ? 'Home'
      : (scene === 'cave' ? 'The Lava Tube' : GG.World.placeName(GG.Player.x, GG.Player.y));

    /* the sound of the place she is in */
    if (GG.Audio.ready()) {
      GG.Music.setMood(GG.Music.moodForNow(scene));
      GG.Ambience.update(dt, scene, GG.Player.x, GG.Player.y);
      if (paused !== _wasPaused) { _wasPaused = paused; GG.Audio.duck(paused); }
    }
  }
  var _wasPaused = false;

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
    started = true;
    GG.UI.close('screen-title');
    setScene('world');
    checkNews();
    if (!GG.Save.data.seenIntro) {
      GG.Save.data.seenIntro = true; GG.Save.save();
      setTimeout(function () { GG.UI.toast('Slide your thumb on the left to walk', 2800); }, 600);
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
    GG.UI.toast('Welcome back, Guin!', 2600);
  }

  /* Reload the world for whichever save slot is now loaded. */
  function restartInto() {
    GG.Time.minutes = GG.Save.data.clock;
    GG.Time.day = GG.Save.data.day;
    GG.Critters.clear();
    GG.Fishing.reset();
    GG.Fishing.swimmers.length = 0;
    GG.Friends.clear();
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 70);
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
    GG.Player.reset(GG.World.DOOR.x, GG.World.DOOR.y + 70);
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
    $('btn-howto').addEventListener('click', function () { GG.Sfx.click(); GG.UI.open('screen-help'); });
    $('btn-settings').addEventListener('click', function () { GG.Sfx.click(); startSound(); openSettings(); });
    $('menu-settings').addEventListener('click', function () { GG.Sfx.click(); openSettings(); });
    wireSettings();
    wireGuest();
    refreshGuestChrome();
    $('btn-menu').addEventListener('click', function () {
      GG.Sfx.click();
      $('menu-progress').textContent = GG.Save.totalSpecies() + ' of ' + GG.BUGS.length + ' bugs, ' +
        GG.Save.totalFish() + ' of ' + GG.FISH.length + ' fish, ' +
        GG.Save.totalFriends() + ' of ' + GG.ANIMALS.length + ' friends';
      $('menu-place').textContent = 'Day ' + GG.Time.day + ' · ' + GG.Time.phaseName() +
        ' · ✦ ' + GG.Save.data.sparkles;
      GG.UI.open('screen-menu');
      drawMinimap();
    });
    $('menu-book').addEventListener('click', function () { GG.Sfx.click(); GG.UI.close('screen-menu'); GG.Book.open(); });
    $('menu-help').addEventListener('click', function () { GG.Sfx.click(); GG.UI.open('screen-help'); });

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
