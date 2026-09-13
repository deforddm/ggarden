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

    /* A colour wash painted over the world. */
    tint: function () {
      var h = this.minutes / 60;
      function mix(a, b, t) {
        return [GG.lerp(a[0], b[0], t), GG.lerp(a[1], b[1], t), GG.lerp(a[2], b[2], t), GG.lerp(a[3], b[3], t)];
      }
      var NIGHT = [26, 38, 92, 0.52], DUSK = [255, 138, 70, 0.26],
          DAY = [255, 255, 255, 0], MORN = [255, 226, 150, 0.16];
      var col;
      if (h < 4.5) col = NIGHT;
      else if (h < 6) col = mix(NIGHT, MORN, (h - 4.5) / 1.5);
      else if (h < 9) col = mix(MORN, DAY, (h - 6) / 3);
      else if (h < 16.5) col = DAY;
      else if (h < 19) col = mix(DAY, DUSK, (h - 16.5) / 2.5);
      else if (h < 21) col = mix(DUSK, NIGHT, (h - 19) / 2);
      else col = NIGHT;
      if (this.rain) { col = [col[0] * 0.7 + 90 * 0.3, col[1] * 0.7 + 110 * 0.3, col[2] * 0.7 + 140 * 0.3, Math.max(col[3], 0.22)]; }
      return 'rgba(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ',' + col[3].toFixed(3) + ')';
    },

    isDark: function () { var h = this.minutes / 60; return h < 5.5 || h > 19.5; }
  };
})(window.GG = window.GG || {});
