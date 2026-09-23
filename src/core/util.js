/* Small helpers shared by everything. */
(function (GG) {
  'use strict';

  GG.clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };
  GG.lerp = function (a, b, t) { return a + (b - a) * t; };
  GG.dist2 = function (ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
  GG.dist = function (ax, ay, bx, by) { return Math.sqrt(GG.dist2(ax, ay, bx, by)); };
  GG.rand = function (a, b) { return a + Math.random() * (b - a); };
  GG.randInt = function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); };
  GG.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  GG.angLerp = function (a, b, t) {
    var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return a + d * t;
  };

  // Deterministic pseudo-random, so the world looks the same every visit.
  GG.hash2 = function (x, y, seed) {
    var h = x * 374761393 + y * 668265263 + (seed || 0) * 2246822519;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return ((h >>> 0) % 100000) / 100000;
  };
  GG.noise2 = function (x, y, seed) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = GG.hash2(xi, yi, seed), b = GG.hash2(xi + 1, yi, seed);
    var c = GG.hash2(xi, yi + 1, seed), d = GG.hash2(xi + 1, yi + 1, seed);
    return GG.lerp(GG.lerp(a, b, u), GG.lerp(c, d, u), v);
  };
  GG.mulberry32 = function (a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  GG.roundRect = function (ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  /* Art code asks for the same few hundred shades every frame, so the
     answers are remembered. The map is bounded: if something ever asks for
     an endless run of different shades, it is simply cleared and refilled. */
  var shadeMemo = new Map(), SHADE_CAP = 4096;
  GG.shade = function (hex, amt) {
    var key = hex + '|' + amt;
    var hit = shadeMemo.get(key);
    if (hit !== undefined) return hit;
    var out = shadeRaw(hex, amt);
    if (shadeMemo.size >= SHADE_CAP) shadeMemo.clear();
    shadeMemo.set(key, out);
    return out;
  };
  function shadeRaw(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt > 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }

  GG.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  GG.$ = function (id) { return document.getElementById(id); };
})(window.GG = window.GG || {});
