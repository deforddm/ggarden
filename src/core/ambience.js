/* Guin's Garden - the sound of the place she is standing in.

   Layers of synthesised sound, faded up and down as she walks about and as
   the hours pass. Nothing is a recording: wind and surf are filtered noise,
   birds and crickets and frogs are little shaped tones fired at random.

   Each layer has a target level; every frame the real level eases toward it,
   so walking from the meadow down to the beach is a slow cross-fade rather
   than a switch. */
(function (GG) {
  'use strict';

  /* ---------- one continuous noise layer ----------

     Signal path: noise -> filter -> swell -> level -> the ambience bus.

     The swell and the level are SEPARATE gain stages on purpose. An
     AudioParam's value is its own value PLUS whatever is connected to it, so
     wiring the swell LFO straight onto the level gain made every bed audible
     at the full depth of its swell no matter how far away the water was -
     which is why the sea could be heard indoors. The LFO now rides its own
     stage, centred on a positive base, and multiplies the level instead. */
  function Bed(opts) {
    this.opts = opts;
    this.level = 0;
    this.target = 0;
    this.nodes = null;
  }
  Bed.prototype.build = function () {
    var a = GG.Audio.ctx(); if (!a || this.nodes) return;
    var buf = GG.Audio.noiseBuffer(); if (!buf) return;
    var src = a.createBufferSource();
    src.buffer = buf; src.loop = true;
    var filt = a.createBiquadFilter();
    filt.type = this.opts.filter || 'lowpass';
    filt.frequency.value = this.opts.freq;
    if (this.opts.q) filt.Q.value = this.opts.q;

    var swell = a.createGain();
    swell.gain.value = 1;
    var level = a.createGain();
    level.gain.value = 0;

    src.connect(filt); filt.connect(swell); swell.connect(level);
    level.connect(GG.Audio.bus('ambience'));
    src.start(a.currentTime + Math.random() * 0.2);
    this.nodes = { src: src, filt: filt, swell: swell, gain: level };

    /* a slow breathing swell, so surf rolls and wind gusts - always between
       (1 - depth) and 1, never negative, and always scaled by the level */
    if (this.opts.swell) {
      var d = GG.clamp(this.opts.swellDepth || 0.4, 0, 0.9) * 0.5;
      swell.gain.value = 1 - d;
      var lfo = a.createOscillator(), depth = a.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = this.opts.swell;
      depth.gain.value = d;
      lfo.connect(depth); depth.connect(swell.gain);
      lfo.start();
      this.nodes.lfo = lfo;
    }
  };
  Bed.prototype.set = function (v) { this.target = v; };
  Bed.prototype.step = function (dt) {
    var a = GG.Audio.ctx(); if (!a) return;
    if (this.target > 0.004 && !this.nodes) this.build();
    if (!this.nodes) return;
    /* fade away quicker than it fades in, so stepping indoors goes quiet */
    var k = Math.min(1, dt * (this.target < this.level ? 2.6 : 0.9));
    this.level += (this.target - this.level) * k;
    /* below a whisper, go properly silent rather than nearly silent */
    var lv = this.level < 0.02 ? 0 : this.level;
    this.nodes.gain.gain.setTargetAtTime(lv * this.opts.max, a.currentTime, 0.08);
  };

  /* ---------- a voice that chirps now and then ---------- */
  function Caller(opts) {
    this.opts = opts;
    this.level = 0;
    this.target = 0;
    this.timer = GG.rand(0.5, opts.gap[1]);
  }
  Caller.prototype.set = function (v) { this.target = v; };
  Caller.prototype.step = function (dt) {
    this.level += (this.target - this.level) * Math.min(1, dt * 0.8);
    if (this.level < 0.04) return;
    this.timer -= dt * (0.5 + this.level);
    if (this.timer > 0) return;
    this.timer = GG.rand(this.opts.gap[0], this.opts.gap[1]);
    this.opts.play(this.level);
  };

  /* little shaped tones */
  function blip(freq, dur, type, gain, slide, delay, wobble) {
    var a = GG.Audio.ctx(); if (!a || gain <= 0.0005) return;
    var t = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (wobble) {
      var lfo = a.createOscillator(), d = a.createGain();
      lfo.frequency.value = wobble; d.gain.value = freq * 0.05;
      lfo.connect(d); d.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + dur * 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(GG.Audio.bus('ambience'));
    o.start(t); o.stop(t + dur + 0.05);
  }

  function rasp(freq, dur, gain, pulses) {
    var a = GG.Audio.ctx(); if (!a || gain <= 0.0005) return;
    var t = a.currentTime;
    for (var i = 0; i < pulses; i++) {
      blip(freq * (1 + (i % 2) * 0.02), 0.035, 'square', gain * 0.35, null, i * (dur / pulses));
    }
  }

  var A = GG.Ambience = {
    on: false,
    beds: null,
    callers: null,

    init: function () {
      if (this.beds) return;
      this.beds = {
        wind:   new Bed({ freq: 420, max: 0.026, swell: 0.07, swellDepth: 0.5 }),
        leaves: new Bed({ freq: 1900, filter: 'bandpass', q: 0.7, max: 0.018, swell: 0.11, swellDepth: 0.6 }),
        stream: new Bed({ freq: 2400, filter: 'bandpass', q: 0.6, max: 0.022, swell: 0.9, swellDepth: 0.35 }),
        river:  new Bed({ freq: 900, filter: 'bandpass', q: 0.5, max: 0.026, swell: 0.35, swellDepth: 0.4 }),
        surf:   new Bed({ freq: 700, max: 0.042, swell: 0.115, swellDepth: 0.7 }),
        rain:   new Bed({ freq: 3200, filter: 'highpass', max: 0.046, swell: 0.25, swellDepth: 0.3 }),
        hearth: new Bed({ freq: 280, max: 0.030, swell: 0.5, swellDepth: 0.5 })
      };
      this.callers = {
        /* morning and daytime birdsong: two or three quick rising notes */
        birds: new Caller({ gap: [1.6, 6.5], play: function (v) {
          var base = GG.rand(1500, 2600);
          var n = GG.randInt(2, 4);
          for (var i = 0; i < n; i++) {
            blip(base * (1 + i * 0.12), GG.rand(0.07, 0.13), 'sine',
              0.020 * v, base * (1 + i * 0.12) * GG.rand(1.1, 1.5), i * 0.09, 26);
          }
        } }),
        /* one deeper, slower bird for the woods */
        dove: new Caller({ gap: [5, 15], play: function (v) {
          blip(560, 0.26, 'sine', 0.016 * v, 470, 0);
          blip(500, 0.34, 'sine', 0.013 * v, 440, 0.34);
        } }),
        /* crickets after dark */
        crickets: new Caller({ gap: [0.55, 1.5], play: function (v) {
          rasp(GG.rand(4200, 5000), 0.16, 0.012 * v, 5);
        } }),
        /* frogs by the pond at night */
        frogs: new Caller({ gap: [1.8, 6], play: function (v) {
          blip(GG.rand(150, 210), 0.22, 'sawtooth', 0.020 * v, null, 0, 22);
        } }),
        /* gulls over the sea */
        gulls: new Caller({ gap: [4, 13], play: function (v) {
          var f = GG.rand(900, 1200);
          for (var i = 0; i < 3; i++) {
            blip(f, 0.19, 'sawtooth', 0.011 * v, f * 1.5, i * 0.26, 14);
          }
        } }),
        /* a bee or two humming past on a warm afternoon */
        hum: new Caller({ gap: [7, 20], play: function (v) {
          blip(GG.rand(190, 240), 1.1, 'sawtooth', 0.008 * v, GG.rand(210, 260), 0, 30);
        } })
      };
    },

    start: function () {
      this.init();
      GG.Audio.bus('ambience');
      this.on = true;
    },

    stop: function () {
      this.on = false;
      if (!this.beds) return;
      for (var k in this.beds) this.beds[k].set(0);
    },

    /* Called every frame with where she is and what she is doing. */
    update: function (dt, scene, x, y) {
      if (!this.beds) return;
      var b = this.beds, c = this.callers;
      var want = { wind: 0, leaves: 0, stream: 0, river: 0, surf: 0, rain: 0, hearth: 0 };
      var call = { birds: 0, dove: 0, crickets: 0, frogs: 0, gulls: 0, hum: 0 };

      if (!this.on) {
        for (var z in b) b[z].set(0);
        for (var z2 in c) c[z2].set(0);
        this._step(dt);
        return;
      }

      if (scene === 'house') {
        /* indoors you hear the fire and, if it is raining, the roof.
           Nothing of the garden gets in - and certainly not the sea. */
        want.hearth = 1;
        want.rain = GG.Time.rain ? 0.2 : 0;
      } else if (scene === 'title') {
        want.wind = 0.5;
        want.leaves = 0.5;
        call.birds = 0.7;
      } else {
        var W = GG.World;
        var phase = GG.Time.phase();
        var biome = W.biomeRaw ? W.biomeRaw(x, y) : 'meadow';

        want.wind = 0.55;
        want.rain = GG.Time.rain ? 1 : 0;

        /* How close is the nearest water? The distance fields are in 8px
           cells, so 26 cells is about 210 pixels - roughly a screen's width
           on a phone. Water should be something you walk up to and hear, not
           a bed that plays across half the garden, so the falloff is steep
           and it is silent well before the next place along. */
        var i = W.maskIndex ? W.maskIndex(x, y) : -1;
        function near(field, reach) {
          if (i < 0 || !W[field]) return 0;
          return GG.clamp(1 - W[field][i] / reach, 0, 1);
        }
        want.surf = Math.pow(near('dSea', 26), 2.2);
        want.river = Math.pow(near('dRiver', 17), 2.2) * 0.85;
        want.stream = want.river * 0.7;
        if (biome === 'forest') { want.leaves = 0.85; }
        else if (biome === 'orchard' || biome === 'garden') { want.leaves = 0.45; }
        else { want.leaves = 0.22; }

        var pondNear = (W.waterKind && W.dShore && i >= 0) ? near('dShore', 40) : 0;
        var atPond = (W.placeName && W.placeName(x, y) === 'Lily Pond');

        if (phase === 'morning') { call.birds = 1; call.dove = 0.6; }
        else if (phase === 'day') { call.birds = 0.6; call.dove = 0.5; call.hum = 0.8; }
        else if (phase === 'evening') { call.birds = 0.25; call.crickets = 0.55; }
        else { call.crickets = 1; }

        if (GG.Time.rain) { call.birds *= 0.25; call.hum = 0; }
        if (atPond && (phase === 'evening' || phase === 'night')) call.frogs = 0.9;
        else if (pondNear > 0.5 && phase === 'night') call.frogs = 0.5;
        call.gulls = Math.min(1, want.surf * 1.6) * (phase === 'night' ? 0.25 : 1);
      }

      for (var k in want) b[k].set(want[k]);
      for (var n in call) c[n].set(call[n]);
      this._step(dt);
    },

    _step: function (dt) {
      var d = Math.min(dt, 0.1);
      for (var k in this.beds) this.beds[k].step(d);
      for (var n in this.callers) this.callers[n].step(d);
    }
  };
})(window.GG = window.GG || {});
