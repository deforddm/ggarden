/* The in-game clock. A whole day and night takes about twelve minutes. */
(function (GG) {
  'use strict';
  var Time = GG.Time = {
    minutes: 8 * 60,
    day: 1,
    RATE: 2,             // in-game minutes per real second
    rain: false,
    rainTimer: 260,

    set: function (m, d) { this.minutes = m; if (d) this.day = d; },

    update: function (dt) {
      this.minutes += dt * this.RATE;
      if (this.minutes >= 1440) { this.minutes -= 1440; this.day++; }
      this.rainTimer -= dt;
      if (this.rainTimer <= 0) {
        this.rain = !this.rain && Math.random() < 0.45;
        this.rainTimer = this.rain ? GG.rand(50, 95) : GG.rand(150, 320);
      }
    },

    phase: function () {
      var h = this.minutes / 60;
      if (h >= 5 && h < 9) return 'morning';
      if (h >= 9 && h < 17) return 'day';
      if (h >= 17 && h < 20.5) return 'evening';
      return 'night';
    },

    label: function () {
      var h = Math.floor(this.minutes / 60), m = Math.floor(this.minutes % 60);
      var ap = h < 12 ? 'am' : 'pm';
      var hh = h % 12; if (hh === 0) hh = 12;
      return hh + ':' + (m < 10 ? '0' : '') + m + ap;
    },

    phaseName: function () {
      return { morning: 'Morning', day: 'Daytime', evening: 'Evening', night: 'Night' }[this.phase()];
    },

    /* A colour wash painted over the world (kept for anything that wants
       one string; the world itself uses grade() below since v1.20). */
    tint: function () {
      var g = this.grade();
      return 'rgba(' + (g.or | 0) + ',' + (g.og | 0) + ',' + (g.ob | 0) + ',' + g.oa.toFixed(3) + ')';
    },

    /* v1.20: the light of the hour, in two parts. mul is multiplied over
       the world, so night goes a deep clear blue without washing the
       colours out, and golden hour warms everything; over is a thin wash
       on top. night (0-1) tells the lights - windows, fireflies, the glow
       round Guin - how much to shine. The same object is reused. */
    grade: function () {
      var h = this.minutes / 60, G = this._g || (this._g = {});
      /*          mul r, g, b        over r, g, b, a         night */
      var NIGHT = [104, 124, 198, 22, 30, 90, 0.07, 1],
          DUSK = [255, 196, 160, 255, 120, 70, 0.10, 0.25],
          GOLD = [255, 226, 186, 255, 176, 90, 0.10, 0],
          DAY = [255, 255, 255, 255, 255, 255, 0, 0],
          MORN = [255, 232, 200, 255, 214, 140, 0.10, 0],
          DAWN = [196, 180, 214, 255, 170, 150, 0.08, 0.35];
      var A, B, u;
      if (h < 4.5) { A = NIGHT; B = NIGHT; u = 0; }
      else if (h < 5.5) { A = NIGHT; B = DAWN; u = h - 4.5; }
      else if (h < 6.5) { A = DAWN; B = MORN; u = h - 5.5; }
      else if (h < 9) { A = MORN; B = DAY; u = (h - 6.5) / 2.5; }
      else if (h < 16) { A = DAY; B = DAY; u = 0; }
      else if (h < 18) { A = DAY; B = GOLD; u = (h - 16) / 2; }
      else if (h < 19.3) { A = GOLD; B = DUSK; u = (h - 18) / 1.3; }
      else if (h < 21) { A = DUSK; B = NIGHT; u = (h - 19.3) / 1.7; }
      else { A = NIGHT; B = NIGHT; u = 0; }
      u = u * u * (3 - 2 * u);
      function m(i) { return A[i] + (B[i] - A[i]) * u; }
      G.mr = m(0); G.mg = m(1); G.mb = m(2);
      G.or = m(3); G.og = m(4); G.ob = m(5); G.oa = m(6); G.night = m(7);
      if (this.rain) {
        /* a grey, soft, rainy light - but still daylight in the day */
        G.mr *= 0.86; G.mg *= 0.88; G.mb *= 0.92;
        G.or = G.or * 0.5 + 60; G.og = G.og * 0.5 + 70; G.ob = G.ob * 0.5 + 90;
        G.oa = Math.max(G.oa, 0.10);
      }
      G.mul = (G.mr > 253 && G.mg > 253 && G.mb > 253) ? null
        : 'rgb(' + (G.mr | 0) + ',' + (G.mg | 0) + ',' + (G.mb | 0) + ')';
      G.over = G.oa < 0.004 ? null
        : 'rgba(' + (G.or | 0) + ',' + (G.og | 0) + ',' + (G.ob | 0) + ',' + G.oa.toFixed(3) + ')';
      return G;
    },

    isDark: function () { var h = this.minutes / 60; return h < 5.5 || h > 19.5; }
  };
})(window.GG = window.GG || {});
