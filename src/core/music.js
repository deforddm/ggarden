/* Guin's Garden - the music.

   There is no music file. A little generative music box plays a gentle
   pentatonic tune over soft chords, and the mood follows the time of day:
   bright and skippy in the morning, calm through the afternoon, warm at
   sunset, slow and starry at night. Indoors it goes soft and close.

   Notes are scheduled a second ahead of the clock so nothing stutters when
   the game is busy drawing. */
(function (GG) {
  'use strict';

  /* A four-bar chord loop per mood, as scale degrees of a pentatonic scale.
     keyHz is the root; the pentatonic steps are the safe, always-pretty ones. */
  var PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

  var MOODS = {
    morning: { key: 293.66, bpm: 96, chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]],
      lead: 0.82, pad: 0.30, bell: 0.30, wave: 'triangle' },
    day: { key: 261.63, bpm: 84, chords: [[0, 4, 7], [-3, 2, 5], [5, 9, 12], [2, 7, 11]],
      lead: 0.70, pad: 0.34, bell: 0.22, wave: 'triangle' },
    evening: { key: 233.08, bpm: 70, chords: [[0, 4, 7], [-2, 3, 7], [-5, 0, 5], [-3, 2, 7]],
      lead: 0.58, pad: 0.42, bell: 0.26, wave: 'sine' },
    night: { key: 196.00, bpm: 58, chords: [[0, 3, 7], [-4, 0, 5], [-2, 3, 7], [-5, 2, 7]],
      lead: 0.44, pad: 0.50, bell: 0.34, wave: 'sine' },
    indoors: { key: 261.63, bpm: 64, chords: [[0, 4, 7], [-3, 0, 5], [2, 5, 9], [-5, 0, 4]],
      lead: 0.50, pad: 0.44, bell: 0.30, wave: 'sine' },
    title: { key: 293.66, bpm: 88, chords: [[0, 4, 7], [5, 9, 12], [2, 7, 11], [-3, 2, 5]],
      lead: 0.78, pad: 0.34, bell: 0.30, wave: 'triangle' }
  };

  function semis(n) { return Math.pow(2, n / 12); }

  var M = GG.Music = {
    playing: false,
    mood: 'title',
    _next: 0,
    _step: 0,
    _timer: null,
    _out: null,

    /* Start (or quietly restart) the music box. */
    start: function () {
      var a = GG.Audio.ctx() || (GG.Audio.bus('music'), GG.Audio.ctx());
      if (!a) return;
      if (this.playing) return;
      this.playing = true;
      this._out = GG.Audio.bus('music');
      this._next = a.currentTime + 0.15;
      this._step = 0;
      var self = this;
      this._timer = setInterval(function () { self._schedule(); }, 120);
      this._schedule();
    },

    stop: function () {
      this.playing = false;
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
    },

    /* Called whenever the place or the hour changes. Takes effect at the
       start of the next bar, so it never cuts a phrase off. */
    setMood: function (m) {
      if (!MOODS[m] || this.mood === m) return;
      this.mood = m;
    },

    moodForNow: function (scene) {
      if (scene === 'title') return 'title';
      if (scene === 'house') return 'indoors';
      return GG.Time.phase();
    },

    _schedule: function () {
      var a = GG.Audio.ctx();
      if (!a || !this.playing) return;
      var mood = MOODS[this.mood] || MOODS.day;
      var spb = 60 / mood.bpm;          // one beat
      var stepLen = spb / 2;            // eighth notes
      while (this._next < a.currentTime + 1.1) {
        this._voice(mood, this._next, this._step);
        this._next += stepLen;
        this._step++;
      }
    },

    _voice: function (mood, t, step) {
      var a = GG.Audio.ctx();
      var inBar = step % 8;
      var bar = Math.floor(step / 8) % 4;
      var phrase = Math.floor(step / 32) % 4;
      var chord = mood.chords[bar];
      var root = mood.key;

      /* the pad: one long soft chord per bar */
      if (inBar === 0) {
        for (var i = 0; i < chord.length; i++) {
          this._note(root * semis(chord[i]) * 0.5, t, spbOf(mood) * 4.1,
            'sine', mood.pad * (i === 0 ? 0.5 : 0.30), 0.5);
        }
      }

      /* the bass, on the one and the three */
      if (inBar === 0 || inBar === 4) {
        this._note(root * semis(chord[0]) * 0.25, t, spbOf(mood) * 1.3,
          'sine', mood.pad * 0.55, 0.02);
      }

      /* the tune: a little pentatonic walk that changes every phrase */
      var pattern = [
        [0, null, 2, 3, null, 2, 4, null],
        [4, null, 3, null, 2, 1, null, 0],
        [2, 3, null, 4, null, 5, 4, null],
        [3, null, 2, null, 1, null, 0, null]
      ][phrase];
      var deg = pattern[inBar];
      if (deg != null) {
        var lift = (bar === 1 || bar === 3) ? 1 : 0;
        var n = PENT[GG.clamp(deg + lift + 3, 0, PENT.length - 1)];
        this._note(root * semis(n + chord[0]), t, spbOf(mood) * 0.62,
          mood.wave, mood.lead * 0.34, 0.012);
      }

      /* a sparkle on the off-beat, once a bar */
      if (inBar === 6 && (bar % 2 === 1)) {
        var hi = PENT[6 + (bar % 3)];
        this._note(root * semis(hi + chord[0]) * 2, t + 0.01, 0.7,
          'triangle', mood.bell * 0.16, 0.005);
      }
      void a;
    },

    _note: function (freq, t, dur, type, gain, attack) {
      var a = GG.Audio.ctx();
      if (!a || !this._out || gain <= 0) return;
      var o = a.createOscillator(), g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + (attack || 0.01));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this._out);
      o.start(t); o.stop(t + dur + 0.05);
    }
  };

  function spbOf(mood) { return 60 / mood.bpm; }
})(window.GG = window.GG || {});
