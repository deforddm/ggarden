/* Tiny synthesised sounds - no audio files, so the game stays small and works offline.
   Three buses hang off the master: effects, music and ambience, each with its own
   volume in Settings. Everything below is generated; nothing is downloaded. */
(function (GG) {
  'use strict';
  var ctx = null;
  var master = null, busSfx = null, busMusic = null, busAmb = null;

  function vol(which) {
    var s = (GG.Save && GG.Save.data && GG.Save.data.settings) || {};
    if (GG.Save && GG.Save.data && GG.Save.data.muted) return 0;
    var v = s[which];
    return (v == null ? (which === 'music' ? 0.5 : 0.7) : v);
  }

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
      busSfx = ctx.createGain(); busSfx.connect(master);
      busMusic = ctx.createGain(); busMusic.connect(master);
      busAmb = ctx.createGain(); busAmb.connect(master);
      GG.Audio.applyVolumes();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* A shared strip of noise, so we are not allocating buffers all day. */
  var noiseBuf = null;
  function noiseBuffer(a) {
    if (!noiseBuf) {
      var n = a.sampleRate * 3;
      noiseBuf = a.createBuffer(1, n, a.sampleRate);
      var d = noiseBuf.getChannelData(0);
      var last = 0;
      for (var i = 0; i < n; i++) {
        var white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;   // brown-ish, easier on the ears
        d[i] = last * 3.2;
      }
    }
    return noiseBuf;
  }

  GG.Audio = {
    ctx: function () { return ctx; },
    ready: function () { return !!ctx; },
    bus: function (which) {
      ac();
      return which === 'music' ? busMusic : (which === 'ambience' ? busAmb : busSfx);
    },
    noiseBuffer: function () { var a = ac(); return a ? noiseBuffer(a) : null; },
    applyVolumes: function () {
      if (!ctx) return;
      var t = ctx.currentTime;
      busSfx.gain.setTargetAtTime(vol('sfx'), t, 0.05);
      busMusic.gain.setTargetAtTime(vol('music') * 0.8, t, 0.3);
      busAmb.gain.setTargetAtTime(vol('ambience') * 0.75, t, 0.3);
    },
    /* Ducked while a panel is open, so menus are quiet. */
    duck: function (on) {
      if (!ctx) return;
      master.gain.setTargetAtTime(on ? 0.45 : 1, ctx.currentTime, 0.12);
    }
  };

  function tone(freq, dur, type, vol, slideTo, delay, wobble) {
    var a = ac(); if (!a) return;
    var t0 = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol == null ? 0.12 : vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (wobble) {
      var lfo = a.createOscillator(), dep = a.createGain();
      lfo.frequency.value = wobble; dep.gain.value = freq * 0.06;
      lfo.connect(dep); dep.connect(o.frequency);
      lfo.start(t0); lfo.stop(t0 + dur + 0.02);
    }
    o.connect(g); g.connect(busSfx);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, freq) {
    var a = ac(); if (!a) return;
    var n = Math.floor(a.sampleRate * dur);
    var buf = a.createBuffer(1, n, a.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(); s.buffer = buf;
    var f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1400;
    var g = a.createGain(); g.gain.value = vol == null ? 0.12 : vol;
    s.connect(f); f.connect(g); g.connect(busSfx);
    s.start();
  }

  GG.Sfx = {
    unlock: function () { ac(); GG.Audio.applyVolumes(); },
    swing: function () { noise(0.14, 0.07, 2200); },
    step: function () { noise(0.05, 0.02, 700); },
    catchSmall: function () { tone(660, 0.10, 'triangle', 0.13); tone(880, 0.14, 'triangle', 0.11, null, 0.08); },
    catchNew: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.20, 'triangle', 0.12, null, i * 0.075); });
    },
    escape: function () { tone(520, 0.18, 'sine', 0.08, 260); },
    click: function () { tone(760, 0.05, 'square', 0.05); },
    door: function () { tone(300, 0.16, 'sine', 0.08, 200); },
    place: function () { tone(880, 0.07, 'triangle', 0.08); },
    coin: function () { tone(1046, 0.06, 'square', 0.05); tone(1318, 0.09, 'square', 0.05, null, 0.05); },
    night: function () { tone(392, 0.6, 'sine', 0.05, 330); },
    angryBuzz: function () {
      tone(180, 0.55, 'sawtooth', 0.055, 128);
      tone(252, 0.5, 'square', 0.03, 166, 0.05);
      tone(196, 0.45, 'sawtooth', 0.04, 140, 0.14);
    },
    cast: function () { noise(0.22, 0.05, 2600); tone(700, 0.12, 'sine', 0.04, 1200); },
    plop: function () { tone(420, 0.1, 'sine', 0.09, 180); noise(0.09, 0.04, 600); },
    nibble: function () { tone(880, 0.05, 'sine', 0.05); },
    bite: function () { tone(300, 0.16, 'sine', 0.12, 640); noise(0.2, 0.08, 500); },
    reel: function () { for (var i = 0; i < 5; i++) tone(520 + i * 40, 0.04, 'square', 0.035, null, i * 0.045); },
    befriendStart: function () { tone(520, 0.10, 'sine', 0.05, 700); },
    befriended: function () {
      [523, 659, 784, 1047, 1319].forEach(function (f, i) {
        tone(f, 0.24, 'sine', 0.10, null, i * 0.07);
      });
    },
    /* each family says hello in its own voice */
    animalCall: function (family) {
      if (family === 'hummingbird') { noise(0.5, 0.03, 2600); tone(240, 0.5, 'sawtooth', 0.03, 260); }
      else if (family === 'frog') { tone(180, 0.24, 'sawtooth', 0.09, 150); tone(165, 0.2, 'sawtooth', 0.06, 140, 0.26); }
      else if (family === 'bat') { tone(5200, 0.05, 'sine', 0.03, 3800); tone(5000, 0.04, 'sine', 0.025, 3600, 0.09); }
      else if (family === 'dog') { tone(340, 0.11, 'sawtooth', 0.10, 210); tone(300, 0.13, 'sawtooth', 0.08, 190, 0.16); }
      else if (family === 'cat') { tone(700, 0.30, 'sine', 0.08, 460, 0, 6); }
      else if (family === 'parrot') { tone(900, 0.14, 'square', 0.06, 1400); tone(1200, 0.12, 'square', 0.05, 800, 0.15); }
    },
    ouch: function () {
      tone(560, 0.13, 'square', 0.11, 170);
      noise(0.16, 0.07, 900);
      tone(300, 0.28, 'sine', 0.06, 190, 0.1);
    }
  };
})(window.GG = window.GG || {});
