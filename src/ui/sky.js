/* v1.21: THE NIGHT SKY.

   Walk up to a telescope after dark and look up. What she sees is the real
   sky over eastern Washington for tonight's real date: the right stars in
   the right places, the right colours, turning round the North Star as the
   night goes on, and the real Moon in tonight's real phase. She can go
   outside afterwards and find the same things.

   - Drag to look around. Slide the night along from dusk to dawn.
   - Tap a star and the constellation it belongs to shows as a join-the-dots
     puzzle. Tap or rub every star in it and it is hers, with a page in the
     Star Book.
   - The sky is seasonal, exactly like the real one. The Scorpion is a summer
     constellation and cannot be found in November - the book says when to
     come back.
   - From the Mesa lookout, far from the cottage lights, there are far more
     stars, the Milky Way, and the faint things that need a dark sky.
   - Shooting stars, more of them on the real shower nights.

   Astronomy, all low precision but honest to about a degree:
   sidereal time from the Julian date; the Sun from the Astronomical
   Almanac's short formula; the Moon from the Almanac's short series. Star
   places are J2000, which is a third of a degree out by now and does not
   show. There are no planets: getting them right needs much more than this,
   and a wrong planet is worse than none. */
(function (GG) {
  'use strict';
  var $ = GG.$;
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function mod(a, n) { return ((a % n) + n) % n; }
  function sind(a) { return Math.sin(a * D2R); }
  function cosd(a) { return Math.cos(a * D2R); }

  /* ------------------------------------------------------------------ */
  /* astronomy                                                           */
  /* ------------------------------------------------------------------ */

  /* Hours the Pacific clock is behind UTC on a date: 7 in summer time
     (second Sunday of March to first Sunday of November), otherwise 8. */
  function pacificOffset(y, m, d) {
    function nthSunday(month, n) {
      var first = new Date(Date.UTC(y, month - 1, 1)).getUTCDay();
      return 1 + mod(7 - first, 7) + (n - 1) * 7;
    }
    var start = nthSunday(3, 2), end = nthSunday(11, 1);
    var dst = (m > 3 && m < 11) || (m === 3 && d >= start) || (m === 11 && d < end);
    return dst ? 7 : 8;
  }

  function julian(ms) { return ms / 86400000 + 2440587.5; }
  function gmst(JD) { return mod(280.46061837 + 360.98564736629 * (JD - 2451545.0), 360); }

  function eclToEq(lon, lat, JD) {
    var eps = 23.439 - 0.0000004 * (JD - 2451545.0);
    var sl = sind(lon), cl = cosd(lon), sb = sind(lat), cb = cosd(lat);
    var ra = Math.atan2(sl * cb * cosd(eps) - sb * sind(eps), cl * cb) * R2D;
    var dec = Math.asin(sb * cosd(eps) + cb * sind(eps) * sl) * R2D;
    return { ra: mod(ra, 360), dec: dec };
  }

  function sunPos(JD) {
    var n = JD - 2451545.0;
    var L = mod(280.460 + 0.9856474 * n, 360), g = mod(357.528 + 0.9856003 * n, 360);
    var lon = mod(L + 1.915 * sind(g) + 0.020 * sind(2 * g), 360);
    var eq = eclToEq(lon, 0, JD);
    eq.lon = lon;
    return eq;
  }

  function moonPos(JD) {
    var T = (JD - 2451545.0) / 36525;
    var lon = 218.32 + 481267.881 * T
      + 6.29 * sind(135.0 + 477198.87 * T) - 1.27 * sind(259.3 - 413335.36 * T)
      + 0.66 * sind(235.7 + 890534.22 * T) + 0.21 * sind(269.9 + 954397.74 * T)
      - 0.19 * sind(357.5 + 35999.05 * T) - 0.11 * sind(186.5 + 966404.03 * T);
    var lat = 5.13 * sind(93.3 + 483202.02 * T) + 0.28 * sind(228.2 + 960400.89 * T)
      - 0.28 * sind(318.3 + 6003.15 * T) - 0.17 * sind(217.6 - 407332.21 * T);
    lon = mod(lon, 360);
    var eq = eclToEq(lon, lat, JD);
    var sun = sunPos(JD);
    eq.elong = mod(lon - sun.lon, 360);          // 0 new, 90 first quarter, 180 full
    eq.illum = (1 - cosd(eq.elong)) / 2;
    return eq;
  }

  function phaseName(elong) {
    if (elong < 12 || elong >= 348) return 'New Moon';
    if (elong < 78) return 'Waxing crescent Moon';
    if (elong < 102) return 'First quarter Moon';
    if (elong < 168) return 'Waxing gibbous Moon';
    if (elong < 192) return 'Full Moon';
    if (elong < 258) return 'Waning gibbous Moon';
    if (elong < 282) return 'Last quarter Moon';
    return 'Waning crescent Moon';
  }

  function eqVec(ra, dec) {
    return [cosd(dec) * cosd(ra), cosd(dec) * sind(ra), sind(dec)];
  }

  /* Galactic to equatorial, for the Milky Way band. */
  function galToEq(l, b) {
    var dG = 27.12825, aG = 192.85948, lN = 122.93192;
    var sd = sind(dG) * sind(b) + cosd(dG) * cosd(b) * cosd(lN - l);
    var dec = Math.asin(sd) * R2D;
    var ra = aG + Math.atan2(cosd(b) * sind(lN - l), cosd(dG) * sind(b) - sind(dG) * cosd(b) * cosd(lN - l)) * R2D;
    return { ra: mod(ra, 360), dec: dec };
  }

  /* ------------------------------------------------------------------ */
  /* the catalogue, unpacked once                                        */
  /* ------------------------------------------------------------------ */
  var N = 0, SX, SY, SZ, SM, SC;          // star vectors, magnitude, colour index
  var CON = null, CON_BY_ID = {};         // constellation geometry
  var NAMED = [];                         // { name, v, mag }
  var MW = [];                            // Milky Way puffs
  var COLS = ['#b9cdff', '#dbe6ff', '#fffaf0', '#ffeec2', '#ffd596', '#ffb37c'];
  function colIndex(bv) {
    return bv < 0 ? 0 : (bv < 0.3 ? 1 : (bv < 0.6 ? 2 : (bv < 1.0 ? 3 : (bv < 1.4 ? 4 : 5))));
  }

  function unpack() {
    if (CON) return;
    var D = GG.STAR_DATA || [];
    N = D.length / 4;
    SX = new Float32Array(N); SY = new Float32Array(N); SZ = new Float32Array(N);
    SM = new Float32Array(N); SC = new Uint8Array(N);
    var i, v;
    for (i = 0; i < N; i++) {
      v = eqVec(D[i * 4] / 100, D[i * 4 + 1] / 100);
      SX[i] = v[0]; SY[i] = v[1]; SZ[i] = v[2];
      SM[i] = D[i * 4 + 2] / 10; SC[i] = colIndex(D[i * 4 + 3] / 10);
    }
    function starNear(vec) {
      var best = -1, bd = 0.9999;       // within about 0.8 of a degree
      for (var k = 0; k < N; k++) {
        var d = SX[k] * vec[0] + SY[k] * vec[1] + SZ[k] * vec[2];
        if (d > bd) { bd = d; best = k; }
      }
      return best;
    }
    CON = [];
    (GG.CONSTELLATIONS || []).forEach(function (def) {
      var strips = (GG.STAR_LINES || {})[def.id];
      if (!strips) return;
      var verts = [], keyOf = {}, lines = [];
      strips.forEach(function (s) {
        var idx = s.map(function (p) {
          var key = Math.round(p[0] * 10) + ':' + Math.round(p[1] * 10);
          if (keyOf[key] == null) {
            var vv = eqVec(p[0], p[1]);
            var si = starNear(vv);
            keyOf[key] = verts.length;
            verts.push({ v: vv, ra: p[0], dec: p[1], mag: si >= 0 ? SM[si] : 4, col: si >= 0 ? SC[si] : 2,
              x: 0, y: 0, alt: 0, on: false, lit: false, litAt: 0 });
          }
          return keyOf[key];
        });
        lines.push(idx);
      });
      var cx = 0, cy = 0, cz = 0;
      verts.forEach(function (q) { cx += q.v[0]; cy += q.v[1]; cz += q.v[2]; });
      var len = Math.hypot(cx, cy, cz) || 1;
      var segs = 0; lines.forEach(function (l) { segs += l.length - 1; });
      var c = { def: def, id: def.id, verts: verts, lines: lines, segs: segs,
        mid: [cx / len, cy / len, cz / len], up: false, upFrac: 0, best: null, drawAt: 0 };
      CON.push(c); CON_BY_ID[def.id] = c;
    });
    var NM = GG.STAR_NAMED || {};
    Object.keys(NM).forEach(function (name) {
      NAMED.push({ name: name, v: eqVec(NM[name][0], NM[name][1]), mag: NM[name][2], x: 0, y: 0, on: false });
    });
    /* the Milky Way: soft puffs along the galactic equator, thickest and
       brightest towards the middle of the galaxy (in Sagittarius) */
    var R = GG.mulberry32 ? GG.mulberry32(20261122) : Math.random;
    for (var l = 0; l < 360; l += 2.5) {
      var toCentre = Math.cos(l * D2R) * 0.5 + 0.5;          // 1 at the centre, 0 opposite
      var n = 2 + Math.round(toCentre * 2);
      for (var k = 0; k < n; k++) {
        var b = (R() - 0.5) * (7 + toCentre * 9);
        var e = galToEq(l + (R() - 0.5) * 3, b);
        MW.push({ v: eqVec(e.ra, e.dec), s: 4 + R() * 4 + toCentre * 4, a: 0.03 + toCentre * 0.055 + R() * 0.02, x: 0, y: 0, on: false });
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* state                                                               */
  /* ------------------------------------------------------------------ */
  var cv, ctx, W = 0, H = 0, DPR = 1, raf = 0, T0 = 0, lastNow = 0;
  var site = 'home';
  var base = null;            // { y, m, d, off } - the evening this night began
  var hStart = 20, hEnd = 29, hour = 21;      // dark hours of tonight, on the clock (24 + for after midnight)
  var hourGoal = null;
  var az0 = 180, alt0 = 32, azGoal = null, altGoal = null;
  var S = 300;                // pixels per unit of the projection
  var M = [1, 0, 0, 0, 1, 0, 0, 0, 1];       // equatorial -> east, north, up
  var Rv = [1, 0, 0], Uv = [0, 0, 1], Fv = [0, 1, 0];   // camera right, up, forward (in east/north/up)
  var moon = null, sun = null, moonScr = null, sunAlt = -40, moonAlt = -40;
  var target = null;          // the constellation being joined up
  var showLines = true;
  var labelStars = {};
  var meteor = null, meteorIn = 9, wishOpen = 0, shower = null;
  var caption = '', captionUntil = 0;
  var chipsDirty = true, chipTimer = 0;
  var puff = null;
  var cardDef = null, pendingCard = null;
  var ptr = null;
  var treasureScr = {};
  var mwSeen = false;

  function save() { return GG.Save.data; }
  function has(id) { var s = save().stars; return !!(s && s[id]); }
  function limitMag() {
    var lim = site === 'mesa' ? 5.0 : 4.3;
    if (moonAlt > 0 && moon) lim -= 0.5 * moon.illum;          // moonlight drowns the faint ones
    if (sunAlt > -14) lim -= (sunAlt + 14) * 0.25;             // and so does twilight
    return lim;
  }

  /* ------------------------------------------------------------------ */
  /* time                                                                */
  /* ------------------------------------------------------------------ */
  function msAt(h) { return Date.UTC(base.y, base.m - 1, base.d, 0, 0, 0) + (h + base.off) * 3600000; }
  function lstAt(h) { return mod(gmst(julian(msAt(h))) + GG.SKY_PLACE.lon, 360); }
  function altOf(v, lst) {
    var lat = GG.SKY_PLACE.lat;
    return Math.asin(GG.clamp(cosd(lat) * (cosd(lst) * v[0] + sind(lst) * v[1]) + sind(lat) * v[2], -1, 1)) * R2D;
  }
  function sunAltAt(h) {
    var s = sunPos(julian(msAt(h)));
    return altOf(eqVec(s.ra, s.dec), lstAt(h));
  }

  /* Which evening is "tonight"? Before six in the morning it is still last
     night. Then find the dark hours: the Sun more than 9 degrees down. */
  function setNight(now) {
    var d = now ? new Date(now) : new Date();
    /* read the Pacific calendar date whatever clock the device keeps */
    var guess = pacificOffset(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    var p = new Date(d.getTime() - guess * 3600000);
    if (p.getUTCHours() < 6) p = new Date(p.getTime() - 86400000);
    base = { y: p.getUTCFullYear(), m: p.getUTCMonth() + 1, d: p.getUTCDate(), off: 8 };
    base.off = pacificOffset(base.y, base.m, base.d);
    hStart = null; hEnd = null;
    for (var h = 15; h <= 33; h += 1 / 12) {
      if (sunAltAt(h) < -9) { if (hStart === null) hStart = h; hEnd = h; }
    }
    if (hStart === null) { hStart = 22; hEnd = 27; }
    hStart = Math.ceil(hStart * 12) / 12; hEnd = Math.floor(hEnd * 12) / 12;
    hour = Math.min(hStart + 1, (hStart + hEnd) / 2);
    hourGoal = null;
    /* is tonight a shower night? within three days of the peak */
    shower = null;
    (GG.METEOR_SHOWERS || []).forEach(function (sh) {
      var peak = Date.UTC(base.y, sh.m - 1, sh.d), night = Date.UTC(base.y, base.m - 1, base.d);
      var days = Math.abs(night - peak) / 86400000;
      if (days > 180) days = 365 - days;
      if (days <= 3) shower = sh;
    });
    scanNight();
  }

  /* For each constellation: is it up at some point tonight, and when best? */
  /* How much of a figure is properly up. Stars that never climb more than a
     few degrees over these hills (the end of the Scorpion's tail) are not
     counted against it. */
  function upFrac(c, lst) {
    var n = 0, of = 0, lat = GG.SKY_PLACE.lat;
    for (var i = 0; i < c.verts.length; i++) {
      if (90 - lat + c.verts[i].dec < 9) continue;
      of++;
      if (altOf(c.verts[i].v, lst) > 7) n++;
    }
    return of ? n / of : 0;
  }
  function scanNight() {
    unpack();
    CON.forEach(function (c) {
      c.best = null; var bestAlt = -99;
      for (var h = hStart; h <= hEnd + 0.001; h += 0.25) {
        var lst = lstAt(h);
        if (upFrac(c, lst) >= 0.8) {
          var a = altOf(c.mid, lst);
          if (a > bestAlt) { bestAlt = a; c.best = h; }
        }
      }
    });
  }

  function clockLabel(h) {
    var hh = Math.floor(mod(h, 24)), mm = Math.round((h - Math.floor(h)) * 60);
    if (mm === 60) { mm = 0; hh = mod(hh + 1, 24); }
    var ap = hh < 12 ? 'am' : 'pm', h12 = hh % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
  }
  function roughTime(h) {
    var hh = mod(h, 24);
    if (hh >= 15 && hh < 21) return 'early in the evening';
    if (hh >= 21 && hh < 23.5) return 'late in the evening';
    if (hh >= 23.5 || hh < 1.5) return 'around midnight';
    if (hh < 4) return 'in the small hours';
    return 'just before dawn';
  }
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dateLabel() {
    var d = new Date(Date.UTC(base.y, base.m - 1, base.d));
    return DAYS[d.getUTCDay()] + ' ' + base.d + ' ' + MONTHS[base.m - 1];
  }

  /* ------------------------------------------------------------------ */
  /* projection                                                          */
  /* ------------------------------------------------------------------ */
  function frameMaths() {
    var lst = lstAt(hour), lat = GG.SKY_PLACE.lat;
    var sl = sind(lst), cl = cosd(lst), sp = sind(lat), cp = cosd(lat);
    M[0] = -sl; M[1] = cl; M[2] = 0;                 // east
    M[3] = -sp * cl; M[4] = -sp * sl; M[5] = cp;     // north
    M[6] = cp * cl; M[7] = cp * sl; M[8] = sp;       // up
    var sa = sind(az0), ca = cosd(az0), sh = sind(alt0), ch = cosd(alt0);
    Fv[0] = sa * ch; Fv[1] = ca * ch; Fv[2] = sh;
    Rv[0] = ca; Rv[1] = -sa; Rv[2] = 0;
    Uv[0] = -sa * sh; Uv[1] = -ca * sh; Uv[2] = ch;
    S = Math.min(W, H) * 2.2;      // about 50 degrees across the narrow side
    var JD = julian(msAt(hour));
    sun = sunPos(JD); moon = moonPos(JD);
    sunAlt = altOf(eqVec(sun.ra, sun.dec), lst);
    moonAlt = altOf(eqVec(moon.ra, moon.dec), lst);
  }
  /* east/north/up vector -> screen. Returns false when it is behind her. */
  var _p = { x: 0, y: 0 };
  function projH(e, n, u) {
    var d = e * Fv[0] + n * Fv[1] + u * Fv[2];
    if (d < -0.55) return false;
    var k = S / (1 + d);
    _p.x = W / 2 + k * (e * Rv[0] + n * Rv[1] + u * Rv[2]);
    _p.y = H * 0.45 - k * (e * Uv[0] + n * Uv[1] + u * Uv[2]);
    return true;
  }
  var _alt = 0;
  function projEq(v) {
    var e = M[0] * v[0] + M[1] * v[1] + M[2] * v[2];
    var n = M[3] * v[0] + M[4] * v[1] + M[5] * v[2];
    var u = M[6] * v[0] + M[7] * v[1] + M[8] * v[2];
    _alt = Math.asin(GG.clamp(u, -1, 1)) * R2D;
    return projH(e, n, u);
  }
  function projAzAlt(az, alt) {
    return projH(sind(az) * cosd(alt), cosd(az) * cosd(alt), sind(alt));
  }
  /* where in the sky (compass and height) a star is right now */
  function azAltOf(v) {
    var lst = lstAt(hour), lat = GG.SKY_PLACE.lat;
    var sl = sind(lst), cl = cosd(lst), sp = sind(lat), cp = cosd(lat);
    var e = -sl * v[0] + cl * v[1];
    var n = -sp * cl * v[0] - sp * sl * v[1] + cp * v[2];
    var u = cp * cl * v[0] + cp * sl * v[1] + sp * v[2];
    return { az: mod(Math.atan2(e, n) * R2D, 360), alt: Math.asin(GG.clamp(u, -1, 1)) * R2D };
  }

  /* ------------------------------------------------------------------ */
  /* drawing                                                             */
  /* ------------------------------------------------------------------ */
  function makePuff() {
    puff = document.createElement('canvas');
    puff.width = puff.height = 64;
    var g = puff.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(214,224,255,1)');
    gr.addColorStop(0.5, 'rgba(190,204,250,0.42)');
    gr.addColorStop(1, 'rgba(170,190,250,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  }

  function drawSky(t) {
    var c = ctx;
    /* the dark itself: deep overhead, a little paler low down */
    var tw = GG.clamp((sunAlt + 18) / 9, 0, 1);         // 0 full night .. 1 dusk
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, site === 'mesa' ? '#03061a' : '#060b26');
    g.addColorStop(0.62, site === 'mesa' ? '#0a1238' : '#101a48');
    g.addColorStop(1, site === 'mesa' ? '#16235a' : '#22306c');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* the last (or first) light of the Sun, low down where it set */
    if (tw > 0.02) {
      var sa = azAltOf(eqVec(sun.ra, sun.dec));
      if (projAzAlt(sa.az, 0)) {
        var gx = _p.x, gy = _p.y, rr = S * 1.5;
        var rg = c.createRadialGradient(gx, gy, 0, gx, gy, rr);
        rg.addColorStop(0, 'rgba(255,170,110,' + (0.55 * tw).toFixed(3) + ')');
        rg.addColorStop(0.35, 'rgba(210,120,150,' + (0.28 * tw).toFixed(3) + ')');
        rg.addColorStop(1, 'rgba(90,80,170,0)');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
      }
    }
  }

  function drawMilkyWay() {
    if (site !== 'mesa') return;
    var dim = 1 - (moonAlt > 0 ? 0.7 * moon.illum : 0);
    dim *= 1 - GG.clamp((sunAlt + 18) / 6, 0, 1);
    if (dim <= 0.03) { for (var j = 0; j < MW.length; j++) MW[j].on = false; return; }
    if (!puff) makePuff();
    var c = ctx;
    for (var i = 0; i < MW.length; i++) {
      var q = MW[i];
      q.on = projEq(q.v) && _alt > 1;
      if (!q.on) continue;
      q.x = _p.x; q.y = _p.y;
      if (q.x < -90 || q.x > W + 90 || q.y < -90 || q.y > H + 90) { q.on = false; continue; }
      var r = q.s * S / 114.6;        // q.s is its radius in degrees
      c.globalAlpha = q.a * dim * GG.clamp(_alt / 14, 0.15, 1) * 1.3;
      c.drawImage(puff, q.x - r, q.y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }

  function drawStars(t) {
    var c = ctx, lim = limitMag();
    for (var i = 0; i < N; i++) {
      var m = SM[i];
      if (m > lim) break;                      // brightest first, so we can stop
      var vx = SX[i], vy = SY[i], vz = SZ[i];
      var u = M[6] * vx + M[7] * vy + M[8] * vz;
      if (u < 0.01) continue;
      var e = M[0] * vx + M[1] * vy + M[2] * vz, n = M[3] * vx + M[4] * vy + M[5] * vz;
      var d = e * Fv[0] + n * Fv[1] + u * Fv[2];
      if (d < 0.05) continue;
      var k = S / (1 + d);
      var x = W / 2 + k * (e * Rv[0] + n * Rv[1] + u * Rv[2]);
      if (x < -6 || x > W + 6) continue;
      var y = H * 0.45 - k * (e * Uv[0] + n * Uv[1] + u * Uv[2]);
      if (y < -6 || y > H + 6) continue;
      /* near the hills the air is thick: stars dim and twinkle harder */
      var low = u < 0.2 ? 0.35 + u * 3.25 : 1;
      var tw = 1 + Math.sin(t * (2.2 + (i % 7) * 0.45) + i * 1.7) * (m < 2.5 ? 0.13 : 0.2) * (u < 0.3 ? 1.8 : 1);
      var r = Math.max(0.55, (3.5 - 0.66 * m)) * (W < 500 ? 0.92 : 1.05);
      var a = GG.clamp((lim - m) / 1.6 + 0.3, 0.25, 1) * low;
      c.fillStyle = COLS[SC[i]];
      if (m < 1.6) {
        c.globalAlpha = 0.16 * low * tw;
        c.beginPath(); c.arc(x, y, r * 3.4 * tw, 0, 6.2832); c.fill();
        c.globalAlpha = 0.5 * low;
        c.fillRect(x - r * 2.6 * tw, y - 0.5, r * 5.2 * tw, 1);
        c.fillRect(x - 0.5, y - r * 2.6 * tw, 1, r * 5.2 * tw);
      }
      c.globalAlpha = Math.min(1, a * tw);
      if (r < 1.1) c.fillRect(x - r, y - r, r * 2, r * 2);
      else { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
    }
    c.globalAlpha = 1;
  }

  /* the faint fuzzy things */
  function drawTreasures(t) {
    var c = ctx;
    treasureScr = {};
    (GG.SKY_TREASURES || []).forEach(function (tr) {
      if (tr.ra == null) return;
      if (tr.dark && site !== 'mesa') return;
      if (!projEq(eqVec(tr.ra, tr.dec)) || _alt < 3) return;
      var x = _p.x, y = _p.y;
      if (x < -30 || x > W + 30 || y < -30 || y > H + 30) return;
      treasureScr[tr.id] = { x: x, y: y };
      var r = tr.r * S / 114.6;
      if (tr.id !== 'pleiades') {
        if (!puff) makePuff();
        c.save();
        c.translate(x, y);
        if (tr.id === 'm31') { c.rotate(-0.6); c.scale(1.9, 0.7); }
        c.globalAlpha = tr.id === 'm42' ? 0.55 : 0.4;
        c.drawImage(puff, -r * 2, -r * 2, r * 4, r * 4);
        if (tr.id === 'm42') {
          c.globalAlpha = 0.25; c.fillStyle = '#ff9ec4';
          c.beginPath(); c.arc(0, 0, r * 1.1, 0, 6.2832); c.fill();
        }
        c.restore();
      }
      if (!has(tr.id)) {
        /* a faint ring that breathes, so she knows something is here */
        c.strokeStyle = 'rgba(255,236,170,' + (0.28 + 0.2 * Math.sin(t * 2.4)).toFixed(3) + ')';
        c.lineWidth = 1.4; c.setLineDash([3, 5]);
        c.beginPath(); c.arc(x, y, Math.max(13, r * 2.4), 0, 6.2832); c.stroke();
        c.setLineDash([]);
      } else if (showLines) {
        label(tr.name, x, y + Math.max(15, r * 2.4) + 9, 'rgba(255,236,170,0.78)', 11.5);
      }
    });
  }

  function label(text, x, y, col, size) {
    var c = ctx;
    c.font = '600 ' + (size || 13) + 'px Fredoka, Nunito, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 3; c.strokeStyle = 'rgba(6,10,36,0.75)';
    c.strokeText(text, x, y);
    c.fillStyle = col; c.fillText(text, x, y);
  }

  function placeVerts(con) {
    var any = false;
    for (var i = 0; i < con.verts.length; i++) {
      var q = con.verts[i];
      q.on = projEq(q.v);
      q.alt = _alt;
      if (q.on) { q.x = _p.x; q.y = _p.y; any = true; }
    }
    return any;
  }

  function strokeFigure(con, upTo) {
    /* upTo: how many segments to draw (for the drawing-itself animation) */
    var c = ctx, done = 0;
    c.beginPath();
    for (var l = 0; l < con.lines.length; l++) {
      var L = con.lines[l];
      for (var k = 0; k < L.length - 1; k++) {
        var a = con.verts[L[k]], b = con.verts[L[k + 1]];
        var want = upTo - done; done++;
        if (want <= 0) return c.stroke();
        if (!a.on || !b.on) continue;
        if (Math.abs(a.x - b.x) > W * 1.5 || Math.abs(a.y - b.y) > H * 1.5) continue;
        c.moveTo(a.x, a.y);
        if (want >= 1) c.lineTo(b.x, b.y);
        else c.lineTo(a.x + (b.x - a.x) * want, a.y + (b.y - a.y) * want);
      }
    }
    c.stroke();
  }

  function drawFigures(t, now) {
    var c = ctx;
    for (var i = 0; i < CON.length; i++) {
      var con = CON[i], found = has(con.id), isTarget = target === con;
      if (!found && !isTarget) { con.onScreen = false; continue; }
      con.onScreen = placeVerts(con);
      if (!con.onScreen) continue;
      if (found && (showLines || con.drawAt)) {
        var prog = con.drawAt ? GG.clamp((now - con.drawAt) / 1500, 0, 1) : 1;
        if (prog >= 1 && con.drawAt && now - con.drawAt > 4200) con.drawAt = 0;
        var glow = con.drawAt ? 1 - GG.clamp((now - con.drawAt - 1500) / 2400, 0, 1) : 0;
        c.lineCap = 'round'; c.lineJoin = 'round';
        if (glow > 0) {
          c.strokeStyle = 'rgba(255,240,170,' + (0.35 * glow).toFixed(3) + ')';
          c.lineWidth = 6; strokeFigure(con, prog * con.segs);
        }
        c.strokeStyle = glow > 0 ? 'rgba(255,246,200,' + (0.55 + 0.4 * glow).toFixed(3) + ')' : 'rgba(150,186,255,0.5)';
        c.lineWidth = glow > 0 ? 2.2 : 1.5;
        strokeFigure(con, prog * con.segs);
        if (prog >= 1 && projEq(con.mid) && _alt > 2) {
          label(con.def.name, _p.x, _p.y, glow > 0 ? '#fff2b0' : 'rgba(190,212,255,0.82)', 13);
        }
      } else if (isTarget) {
        /* join the dots: a faint dotted figure, a ring round every star
           still to touch, and a warm line wherever two lit stars meet */
        c.lineCap = 'round';
        c.setLineDash([2, 7]); c.strokeStyle = 'rgba(190,210,255,0.4)'; c.lineWidth = 1.5;
        strokeFigure(con, con.segs);
        c.setLineDash([]);
        c.strokeStyle = 'rgba(255,240,170,0.9)'; c.lineWidth = 2.2;
        c.beginPath();
        con.lines.forEach(function (L) {
          for (var k = 0; k < L.length - 1; k++) {
            var a = con.verts[L[k]], b = con.verts[L[k + 1]];
            if (a.lit && b.lit && a.on && b.on) { c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
          }
        });
        c.stroke();
        for (var k2 = 0; k2 < con.verts.length; k2++) {
          var q = con.verts[k2];
          if (!q.on || q.alt < 2) continue;
          if (q.lit) {
            var age = (now - q.litAt) / 500;
            c.fillStyle = 'rgba(255,240,170,' + (age < 1 ? 0.5 * (1 - age) : 0).toFixed(3) + ')';
            c.beginPath(); c.arc(q.x, q.y, 8 + age * 16, 0, 6.2832); c.fill();
            c.fillStyle = '#fff6c8';
            c.beginPath(); c.arc(q.x, q.y, 4.2, 0, 6.2832); c.fill();
          } else {
            var pulse = 0.5 + 0.5 * Math.sin(t * 3.2 + k2);
            c.strokeStyle = 'rgba(255,232,150,' + (0.55 + 0.4 * pulse).toFixed(3) + ')';
            c.lineWidth = 2;
            c.beginPath(); c.arc(q.x, q.y, 8 + pulse * 2.5, 0, 6.2832); c.stroke();
          }
        }
      }
    }
  }

  function drawNamed() {
    for (var i = 0; i < NAMED.length; i++) {
      var s = NAMED[i];
      s.on = projEq(s.v) && _alt > 1 && s.mag <= limitMag() + 0.4;
      if (!s.on) continue;
      s.x = _p.x; s.y = _p.y;
      if (labelStars[s.name] && s.x > 0 && s.x < W && s.y > 0 && s.y < H) {
        label(s.name, s.x, s.y - 13, 'rgba(255,255,255,0.86)', 11.5);
      }
    }
  }

  function drawMoon(t) {
    moonScr = null;
    if (!moon || moonAlt < -1) return;
    if (!projEq(eqVec(moon.ra, moon.dec))) return;
    var x = _p.x, y = _p.y;
    if (x < -60 || x > W + 60 || y < -60 || y > H + 60) return;
    moonScr = { x: x, y: y };
    var c = ctx, r = Math.max(11, S * 0.02);
    /* which way is the Sun from here, on the screen? the lit side faces it */
    var ang = 0;
    if (projEq(eqVec(sun.ra, sun.dec)) || true) {
      var sv = eqVec(sun.ra, sun.dec), mv = eqVec(moon.ra, moon.dec);
      var dx = [sv[0] - mv[0], sv[1] - mv[1], sv[2] - mv[2]];
      var e = M[0] * dx[0] + M[1] * dx[1] + M[2] * dx[2], n = M[3] * dx[0] + M[4] * dx[1] + M[5] * dx[2], u = M[6] * dx[0] + M[7] * dx[1] + M[8] * dx[2];
      ang = Math.atan2(-(e * Uv[0] + n * Uv[1] + u * Uv[2]), e * Rv[0] + n * Rv[1] + u * Rv[2]);
    }
    var glow = c.createRadialGradient(x, y, r * 0.8, x, y, r * (3 + 5 * moon.illum));
    glow.addColorStop(0, 'rgba(230,236,255,' + (0.1 + 0.3 * moon.illum).toFixed(3) + ')');
    glow.addColorStop(1, 'rgba(200,214,255,0)');
    c.fillStyle = glow; c.beginPath(); c.arc(x, y, r * (3 + 5 * moon.illum), 0, 6.2832); c.fill();
    c.save();
    c.translate(x, y); c.rotate(ang);            // +x now points at the Sun
    c.fillStyle = '#26315e';
    c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.fill();
    /* the lit part: a half disc on the sunward side, plus or minus an
       ellipse for the curved edge */
    var kk = Math.cos(moon.elong * D2R);         // +1 new .. -1 full
    c.fillStyle = '#fbf6e2';
    c.beginPath();
    c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    c.ellipse(0, 0, Math.abs(kk) * r, r, 0, Math.PI / 2, -Math.PI / 2, kk > 0);
    c.closePath(); c.fill();
    /* a few seas, only on the lit side */
    c.globalAlpha = 0.16; c.fillStyle = '#7a86a8';
    c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.clip();
    c.rotate(-ang);
    [[-0.3, -0.3, 0.3], [0.2, -0.1, 0.24], [-0.1, 0.35, 0.2], [0.4, 0.35, 0.16]].forEach(function (s) {
      c.beginPath(); c.arc(s[0] * r, s[1] * r, s[2] * r, 0, 6.2832); c.fill();
    });
    c.restore();
  }

  /* the dark ground along the bottom, with whatever stands on it */
  function drawGround() {
    var c = ctx, pts = [], a;
    for (a = -130; a <= 130; a += 5) {
      if (projAzAlt(az0 + a, 0)) pts.push([_p.x, _p.y]);
    }
    if (pts.length < 2) return;
    c.fillStyle = site === 'mesa' ? '#0b0d1c' : '#081410';
    c.beginPath();
    c.moveTo(pts[0][0] - 4000, pts[0][1] + 20);
    c.lineTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineTo(pts[pts.length - 1][0] + 4000, pts[pts.length - 1][1] + 20);
    c.lineTo(W + 4000, H + 4000); c.lineTo(-4000, H + 4000);
    c.closePath(); c.fill();

    /* things on the skyline: each has a compass bearing and a height in
       degrees, so they stay put as she turns */
    var R = GG.mulberry32 ? GG.mulberry32(site === 'mesa' ? 77 : 41) : Math.random;
    var count = site === 'mesa' ? 34 : 46;
    for (var k = 0; k < count; k++) {
      var az = R() * 360, hgt = site === 'mesa' ? 0.8 + R() * 1.4 : 2.5 + R() * 4.5, wide = site === 'mesa' ? 1.6 + R() * 2.4 : 1 + R() * 1.4;
      var pine = R() < 0.6;
      if (Math.abs(mod(az - az0 + 180, 360) - 180) > 95) continue;
      if (site !== 'mesa' && Math.abs(mod(az - 180 + 180, 360) - 180) < 16) continue;   // leave the cottage clear
      if (!projAzAlt(az, -0.5)) continue; var bx = _p.x, by = _p.y;
      if (!projAzAlt(az, hgt)) continue; var tx = _p.x, ty = _p.y;
      if (!projAzAlt(az + wide, -0.5)) continue; var wx = Math.abs(_p.x - bx);
      c.beginPath();
      if (site === 'mesa') { c.ellipse(bx, by, wx, by - ty, 0, Math.PI, 0); }   // sagebrush humps
      else if (pine) { c.moveTo(bx - wx, by); c.lineTo(tx, ty); c.lineTo(bx + wx, by); }
      else { c.ellipse(tx, (ty + by) / 2 - (by - ty) * 0.15, wx * 1.25, (by - ty) * 0.6, 0, 0, 6.2832); c.rect(bx - wx * 0.14, ty + (by - ty) * 0.5, wx * 0.28, (by - ty) * 0.5); }
      c.fill();
    }
    if (site !== 'mesa' && projAzAlt(180, -0.5)) {
      /* the cottage, due south, with a light in the window */
      var hx = _p.x, hy = _p.y, u = S * 0.008;
      if (hx > -200 && hx < W + 200) {
        c.beginPath();
        c.moveTo(hx - 5 * u, hy); c.lineTo(hx - 5 * u, hy - 4 * u); c.lineTo(hx - 6 * u, hy - 4 * u);
        c.lineTo(hx, hy - 8.4 * u); c.lineTo(hx + 2.6 * u, hy - 6.6 * u); c.lineTo(hx + 2.6 * u, hy - 8.6 * u);
        c.lineTo(hx + 3.9 * u, hy - 8.6 * u); c.lineTo(hx + 3.9 * u, hy - 5.6 * u);
        c.lineTo(hx + 6 * u, hy - 4 * u); c.lineTo(hx + 5 * u, hy - 4 * u); c.lineTo(hx + 5 * u, hy);
        c.closePath(); c.fill();
        var wg = c.createRadialGradient(hx - 2 * u, hy - 2 * u, 0, hx - 2 * u, hy - 2 * u, 5 * u);
        wg.addColorStop(0, 'rgba(255,200,110,0.5)'); wg.addColorStop(1, 'rgba(255,190,100,0)');
        c.fillStyle = wg; c.fillRect(hx - 7 * u, hy - 7 * u, 10 * u, 10 * u);
        c.fillStyle = '#ffd98a';
        c.fillRect(hx - 2.9 * u, hy - 2.9 * u, 1.8 * u, 1.8 * u);
      }
    }
    /* the compass, written on the ground */
    var names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    for (var d = 0; d < 8; d++) {
      if (Math.abs(mod(d * 45 - az0 + 180, 360) - 180) > 80) continue;
      if (!projAzAlt(d * 45, -4.5)) continue;
      if (_p.y > H - 4) continue;
      label(names[d], _p.x, _p.y, d % 2 ? 'rgba(200,214,255,0.55)' : 'rgba(255,240,190,0.9)', d % 2 ? 12 : 16);
    }
  }

  function drawMeteor(dt) {
    if (!meteor) return;
    meteor.age += dt;
    var k = meteor.age / meteor.life;
    if (k >= 1) { meteor = null; return; }
    var head = Math.min(1, k * 1.5), tail = Math.max(0, k * 1.5 - 0.5);
    function at(f) {
      return projH(meteor.a[0] + (meteor.b[0] - meteor.a[0]) * f, meteor.a[1] + (meteor.b[1] - meteor.a[1]) * f,
        meteor.a[2] + (meteor.b[2] - meteor.a[2]) * f);
    }
    if (!at(tail)) return; var x1 = _p.x, y1 = _p.y;
    if (!at(head)) return; var x2 = _p.x, y2 = _p.y;
    var c = ctx, g = c.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,250,220,' + (1 - k * 0.6).toFixed(3) + ')');
    c.strokeStyle = g; c.lineWidth = 2.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.fillStyle = 'rgba(255,255,240,' + (1 - k).toFixed(3) + ')';
    c.beginPath(); c.arc(x2, y2, 2.6, 0, 6.2832); c.fill();
  }

  function spawnMeteor() {
    /* somewhere in front of her, well up the sky */
    var az = az0 + (Math.random() - 0.5) * 70, alt = GG.clamp(alt0 + (Math.random() - 0.3) * 40, 18, 78);
    var a = [sind(az) * cosd(alt), cosd(az) * cosd(alt), sind(alt)];
    var dir;
    if (shower) {
      /* a shower's meteors all streak directly away from one spot */
      var rv = eqVec(shower.ra, shower.dec);
      var r = [M[0] * rv[0] + M[1] * rv[1] + M[2] * rv[2], M[3] * rv[0] + M[4] * rv[1] + M[5] * rv[2], M[6] * rv[0] + M[7] * rv[1] + M[8] * rv[2]];
      dir = [a[0] - r[0], a[1] - r[1], a[2] - r[2]];
    } else {
      dir = [Math.random() - 0.5, Math.random() - 0.5, -0.25 - Math.random() * 0.4];
    }
    var len = Math.hypot(dir[0], dir[1], dir[2]) || 1, reach = 0.22 + Math.random() * 0.16;
    var b = [a[0] + dir[0] / len * reach, a[1] + dir[1] / len * reach, a[2] + dir[2] / len * reach];
    meteor = { a: a, b: b, age: 0, life: 0.75 + Math.random() * 0.4 };
    wishOpen = 3.2;
    $('sky-wish').classList.remove('hidden');
    if (GG.Sfx.shootingStar) GG.Sfx.shootingStar();
  }

  /* ------------------------------------------------------------------ */
  /* the frame                                                           */
  /* ------------------------------------------------------------------ */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - lastNow) / 1000 || 0); lastNow = now;
    var t = (now - T0) / 1000;
    step(dt, now);
    render(t, now, dt);
  }

  function step(dt, now) {
    /* the night winding itself on to where a constellation is */
    if (hourGoal !== null) {
      var dh = hourGoal - hour;
      if (Math.abs(dh) < 0.02) { hour = hourGoal; hourGoal = null; }
      else hour += dh * Math.min(1, dt * 2.6) + (dh > 0 ? 1 : -1) * Math.min(Math.abs(dh), dt * 0.25);
      syncSlider(); chipsDirty = true;
    }
    if (azGoal !== null) {
      var da = mod(azGoal - az0 + 180, 360) - 180, dl = altGoal - alt0;
      if (Math.abs(da) < 0.3 && Math.abs(dl) < 0.3) { az0 = mod(azGoal, 360); alt0 = altGoal; azGoal = null; }
      else { az0 = mod(az0 + da * Math.min(1, dt * 3.4), 360); alt0 += dl * Math.min(1, dt * 3.4); }
    }
    /* a constellation being followed keeps the telescope on it while the
       night winds along */
    if (hourGoal !== null && Sky._follow) pointAt(Sky._follow.mid, true);

    if (wishOpen > 0) {
      wishOpen -= dt;
      if (wishOpen <= 0) $('sky-wish').classList.add('hidden');
    }
    if (!cardDef) {
      meteorIn -= dt;
      if (meteorIn <= 0 && !meteor) {
        spawnMeteor();
        meteorIn = shower ? 6 + Math.random() * 6 : 22 + Math.random() * 22;
      }
    }
    if (pendingCard && now >= pendingCard.at) { var pc = pendingCard; pendingCard = null; showCard(pc.def, true, pc.reward); }
    if (caption && captionUntil && now > captionUntil) setCaption('', 0);
    chipTimer -= dt;
    if (chipsDirty && chipTimer <= 0) { chipsDirty = false; chipTimer = 0.25; buildChips(); }
  }

  function render(t, now, dt) {
    if (!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    frameMaths();
    drawSky(t);
    drawMilkyWay();
    drawStars(t);
    drawTreasures(t);
    drawMoon(t);
    drawFigures(t, now);
    drawNamed();
    drawMeteor(dt || 0);
    drawGround();
  }

  function resize() {
    if (!cv) return;
    var r = cv.getBoundingClientRect();
    W = Math.max(200, r.width); H = Math.max(200, r.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  }

  /* ------------------------------------------------------------------ */
  /* finding things                                                      */
  /* ------------------------------------------------------------------ */
  function setCaption(text, ms) {
    caption = text || '';
    captionUntil = ms ? performance.now() + ms : 0;
    var el = $('sky-caption');
    if (el) { el.textContent = caption; el.classList.toggle('show', !!caption); }
  }

  function pointAt(v, instant) {
    var p = azAltOf(v);
    var a = GG.clamp(p.alt - 6, 12, 56);
    if (instant) { az0 = p.az; alt0 = a; azGoal = null; }
    else { azGoal = p.az; altGoal = a; }
  }

  function isUp(con) { return upFrac(con, lstAt(hour)) >= 0.8; }

  function setTarget(con) {
    if (target === con) return;
    /* the stars she has already touched stay lit, so wandering off to
       another constellation and coming back loses nothing */
    target = con;
    chipsDirty = true;
  }

  /* light every unlit star of the target within reach of the finger */
  function touchTarget(x, y, reach, all) {
    if (!target) return 0;
    var n = 0, now = performance.now(), best = null, bd = reach;
    function light(q) {
      q.lit = true; q.litAt = now; n++;
      var count = target.verts.filter(function (z) { return z.lit; }).length;
      if (GG.Sfx.starNote) GG.Sfx.starNote(count - 1);
    }
    target.verts.forEach(function (q) {
      if (q.lit || !q.on || q.alt < 2) return;
      var d = Math.hypot(q.x - x, q.y - y);
      if (d > reach) return;
      if (all) light(q);                       // rubbing: everything under the finger
      else if (d <= bd) { bd = d; best = q; }  // a tap: the one nearest star
    });
    if (best) light(best);
    if (n) checkDone();
    return n;
  }

  function checkDone() {
    if (!target) return;
    var need = 0, lit = 0;
    target.verts.forEach(function (q) { if (q.alt >= 2) { need++; if (q.lit) lit++; } });
    if (need >= 2 && lit >= need) {
      var con = target;
      target = null;
      con.verts.forEach(function (q) { q.lit = false; });
      foundIt(con.def, con);
    } else if (lit > 0) {
      setCaption(lit + ' of ' + need + ' stars. Keep going!', 2200);
    }
  }

  function foundIt(def, con) {
    var d = save();
    if (!d.stars) d.stars = {};
    var isNew = !d.stars[def.id];
    var reward = 0;
    if (isNew) {
      d.stars[def.id] = { first: Date.now(), site: site };
      reward = def.treasure ? 8 : 6;
      d.sparkles += reward;
      GG.Save.save();
      GG.UI.refreshHud();
    }
    if (con) con.drawAt = performance.now();
    if (GG.Sfx.starFound) GG.Sfx.starFound();
    setCaption('', 0);
    chipsDirty = true;
    pendingCard = { def: def, reward: reward, at: performance.now() + (con ? 1900 : 350) };
  }

  function nearestVert(x, y, reach) {
    var best = null, bd = reach;
    CON.forEach(function (con) {
      if (has(con.id) || !isUp(con)) return;
      placeVerts(con);
      con.verts.forEach(function (q) {
        if (!q.on || q.alt < 2) return;
        var d = Math.hypot(q.x - x, q.y - y);
        if (d < bd) { bd = d; best = con; }
      });
    });
    return best;
  }

  function tapAt(x, y) {
    if (cardDef) return;
    Sky._follow = null;
    /* 1. the Moon */
    if (moonScr && Math.hypot(moonScr.x - x, moonScr.y - y) < 30) {
      var pct = Math.round(moon.illum * 100);
      setCaption(phaseName(moon.elong) + ', ' + pct + '% lit. This is the real Moon for tonight. Go and look out of the window!', 6000);
      if (GG.Sfx.starNote) GG.Sfx.starNote(2);
      return;
    }
    /* 2. a star of the constellation she is joining up */
    if (touchTarget(x, y, 30)) return;
    /* 3. a named star says its name (and carries on, so tapping Vega also
          starts the Harp) */
    var named = null, nd = 24;
    NAMED.forEach(function (s) {
      if (!s.on) return;
      var d = Math.hypot(s.x - x, s.y - y);
      if (d < nd) { nd = d; named = s; }
    });
    /* 4. a fuzzy treasure */
    var tr = null;
    Object.keys(treasureScr).forEach(function (id) {
      var p = treasureScr[id];
      if (Math.hypot(p.x - x, p.y - y) < 28) tr = GG.SKY_BY_ID[id];
    });
    if (tr) {
      if (has(tr.id)) showCard(tr, false, 0); else foundIt(tr, null);
      return;
    }
    /* 5. a star of a constellation not found yet: that starts the puzzle */
    var con = nearestVert(x, y, 26);
    if (con) {
      setTarget(con);
      touchTarget(x, y, 30);
      if (named) { labelStars[named.name] = true; }
      if (target) setCaption((named ? GG.STAR_FACTS[named.name] + ' ' : '') + 'Now touch every star with a ring round it.', 5200);
      return;
    }
    if (named) {
      labelStars[named.name] = true;
      setCaption(GG.STAR_FACTS[named.name] || named.name, 5200);
      if (GG.Sfx.starNote) GG.Sfx.starNote(4);
      return;
    }
    /* 6. the name of a constellation she already has: read its page again */
    var hit = null;
    CON.forEach(function (c2) {
      if (!has(c2.id) || !showLines) return;
      if (projEq(c2.mid) && _alt > 2 && Math.abs(_p.x - x) < 54 && Math.abs(_p.y - y) < 16) hit = c2;
    });
    if (hit) { showCard(hit.def, false, 0); return; }
    /* 7. the Milky Way itself (the Mesa only) */
    if (site === 'mesa') {
      var onBand = false;
      for (var i = 0; i < MW.length; i++) {
        var q = MW[i];
        if (q.on && Math.hypot(q.x - x, q.y - y) < 26) { onBand = true; break; }
      }
      if (onBand) {
        var mw = GG.SKY_BY_ID.milkyway;
        if (has('milkyway')) setCaption('The Milky Way: our own galaxy, seen from the inside.', 4200);
        else foundIt(mw, null);
        return;
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* the list along the bottom                                           */
  /* ------------------------------------------------------------------ */
  function stateOf(con) {
    if (has(con.id)) return 'found';
    if (isUp(con)) return 'up';
    if (con.best !== null) return 'later';
    return 'away';
  }
  var ORDER = { up: 0, later: 1, away: 2, found: 3 };

  function buildChips() {
    var row = $('sky-chips');
    if (!row) return;
    var keep = row.scrollLeft;
    row.innerHTML = '';
    var list = CON.map(function (con) { return { con: con, st: stateOf(con) }; });
    list.sort(function (a, b) { return ORDER[a.st] - ORDER[b.st]; });
    list.forEach(function (it) {
      var b = GG.el('button', 'skychip ' + it.st + (target === it.con ? ' on' : ''));
      b.setAttribute('data-sky', it.con.id);
      b.setAttribute('data-state', it.st);
      var mark = it.st === 'found' ? '✓ ' : (it.st === 'up' ? '★ ' : (it.st === 'later' ? '◔ ' : ''));
      b.textContent = mark + it.con.def.name.replace(/^The /, '');
      b.addEventListener('click', function () { if (GG.Sfx) GG.Sfx.click(); chooseChip(it.con); });
      row.appendChild(b);
    });
    row.scrollLeft = keep;
    var got = 0;
    GG.SKY_ALL.forEach(function (d) { if (has(d.id)) got++; });
    var cnt = $('sky-count');
    if (cnt) cnt.textContent = '★ ' + got + ' / ' + GG.SKY_ALL.length;
  }

  function chooseChip(con) {
    var st = stateOf(con), def = con.def;
    if (st === 'away') {
      setTarget(null);
      setCaption(def.name + ' is not in tonight’s sky. Best seen: ' + def.when + '. The stars change with the seasons, so come back then!', 7000);
      return;
    }
    if (!isUp(con) && con.best !== null) {
      /* wind the night on (or back) to when it is well up */
      hourGoal = con.best;
      Sky._follow = con;
      setCaption(def.name + ' is up ' + roughTime(con.best) + ' tonight. Winding the night along…', 4200);
      setTimeout(function () { if (Sky.isOpen() && Sky._follow === con) { Sky._follow = null; chooseChip(con); } }, 2300);
      return;
    }
    pointAt(con.mid);
    if (st === 'found') { setTarget(null); setCaption(def.name + ' — found! Tap its name to read about it.', 3600); }
    else { setTarget(con); setCaption(def.look, 9000); }
  }

  /* ------------------------------------------------------------------ */
  /* the card                                                            */
  /* ------------------------------------------------------------------ */
  function showCard(def, isNew, reward) {
    cardDef = def;
    $('sky-card-new').classList.toggle('hidden', !isNew);
    $('sky-card-name').textContent = def.name;
    $('sky-card-latin').textContent = def.treasure ? def.latin : 'the constellation ' + def.latin;
    $('sky-card-fact').textContent = def.fact;
    $('sky-card-extra').textContent = def.extra || '';
    $('sky-card-reward').textContent = reward ? '✦ +' + reward + ' sparkles · a new page in your Star Book' : 'In your Star Book';
    var pic = $('sky-card-art');
    Sky.drawThumb(pic, def, true);
    $('sky-card-wrap').classList.remove('hidden');
    Sky._cardAt = performance.now();
    if (isNew && GG.FxUI && GG.FxUI.burst) {
      var r = $('sky-card').getBoundingClientRect(), a = $('app').getBoundingClientRect();
      GG.FxUI.burst(r.left - a.left + r.width / 2, r.top - a.top + 40, { count: 60, speed: 480, spread: 2.6 });
    }
    if (isNew && GG.Sfx.catchNew) GG.Sfx.catchNew();
  }
  function hideCard() {
    if (performance.now() - (Sky._cardAt || 0) < 500) return;
    cardDef = null;
    $('sky-card-wrap').classList.add('hidden');
    /* the very first find: tell her where it went */
    var n = Object.keys(save().stars || {}).length;
    if (n === 1) setCaption('It is in your Star Book now, in the Compendium. There are ' + (GG.SKY_ALL.length - 1) + ' more to find!', 6000);
    else if (n === GG.SKY_ALL.length) setCaption('You have found everything in the Star Book. You know the sky better than most grown-ups!', 9000);
  }

  function syncSlider() {
    var sl = $('sky-time');
    if (sl) sl.value = String(Math.round((hour - hStart) / Math.max(0.01, hEnd - hStart) * 1000));
    var lb = $('sky-clock');
    if (lb) lb.textContent = clockLabel(hour);
  }

  /* ------------------------------------------------------------------ */
  /* public                                                              */
  /* ------------------------------------------------------------------ */
  var Sky = GG.Sky = {
    _now: null,            // tests set this to pretend it is another night
    _follow: null,

    isOpen: function () { var e = $('screen-sky'); return !!e && !e.classList.contains('hidden'); },

    init: function () {
      var self = this;
      cv = $('sky-canvas');
      if (!cv) return;
      ctx = cv.getContext('2d');
      $('sky-close').addEventListener('click', function () { GG.Sfx.click(); self.close(); });
      $('sky-time').addEventListener('input', function () {
        hourGoal = null; Sky._follow = null;
        hour = hStart + (parseInt(this.value, 10) || 0) / 1000 * (hEnd - hStart);
        $('sky-clock').textContent = clockLabel(hour);
        chipsDirty = true;
      });
      $('sky-lines').addEventListener('click', function () {
        GG.Sfx.click();
        showLines = !showLines;
        this.classList.toggle('off', !showLines);
        this.textContent = showLines ? 'Lines: on' : 'Lines: off';
      });
      $('sky-wish').addEventListener('click', function () { self.wish(); });
      $('sky-card-ok').addEventListener('click', function () { GG.Sfx.click(); hideCard(); });
      $('sky-card-wrap').addEventListener('click', function (e) { if (e.target.id === 'sky-card-wrap') hideCard(); });

      /* looking around, tapping, and rubbing the stars of a puzzle */
      function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (cardDef) return;
        var p = pos(e);
        ptr = { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, t: performance.now(), moved: false, trace: false };
        /* starting on a ringed star means she is joining the dots, not turning round */
        if (target) {
          for (var i = 0; i < target.verts.length; i++) {
            var q = target.verts[i];
            if (q.on && !q.lit && Math.hypot(q.x - p.x, q.y - p.y) < 26) { ptr.trace = true; break; }
          }
        }
        azGoal = null; Sky._follow = null;
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var p = pos(e), dx = p.x - ptr.x, dy = p.y - ptr.y;
        if (!ptr.moved && Math.hypot(p.x - ptr.sx, p.y - ptr.sy) > 9) ptr.moved = true;
        if (ptr.trace) { touchTarget(p.x, p.y, 20, true); }
        else if (ptr.moved) {
          /* drag the sky like a sheet: pull right and she turns left */
          az0 = mod(az0 - dx / S * R2D * 2 / Math.max(0.45, cosd(alt0)), 360);
          alt0 = GG.clamp(alt0 + dy / S * R2D * 2, 8, 78);
        }
        ptr.x = p.x; ptr.y = p.y;
        e.preventDefault();
      });
      function up(e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var wasTap = !ptr.moved && performance.now() - ptr.t < 600;
        var p = pos(e), tr = ptr.trace;
        ptr = null;
        if (wasTap) tapAt(p.x, p.y);
        else if (tr) touchTarget(p.x, p.y, 20, true);
      }
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', function () { ptr = null; });
      window.addEventListener('resize', function () { if (self.isOpen()) resize(); });
    },

    /* where: 'home' (the cottage garden) or 'mesa' (the dark lookout) */
    open: function (where) {
      unpack();
      site = where === 'mesa' ? 'mesa' : 'home';
      setNight(this._now);
      target = null; meteor = null; cardDef = null; pendingCard = null; labelStars = {};
      CON.forEach(function (c) { c.drawAt = 0; c.verts.forEach(function (q) { q.lit = false; }); });
      $('sky-card-wrap').classList.add('hidden');
      $('sky-wish').classList.add('hidden');
      GG.UI.open('screen-sky');
      $('screen-sky').setAttribute('data-site', site);
      resize();
      syncSlider();
      frameMaths();
      /* start by facing whatever is best placed and not yet found */
      var first = null, bestAlt = -99;
      CON.forEach(function (c) {
        if (has(c.id) || !isUp(c)) return;
        var a = azAltOf(c.mid).alt;
        if (a > bestAlt && a < 58) { bestAlt = a; first = c; }
      });
      if (first) pointAt(first.mid, true); else { az0 = 180; alt0 = 30; }
      var JD = julian(msAt(hour));
      var mn = moonPos(JD);
      $('sky-title').textContent = site === 'mesa' ? 'The sky from the Mesa' : 'Tonight’s sky';
      $('sky-date').textContent = dateLabel() + ' · ' + phaseName(mn.elong);
      meteorIn = 7 + Math.random() * 5;
      chipsDirty = true; chipTimer = 0;
      var n = Object.keys(save().stars || {}).length;
      if (shower) {
        setCaption('Tonight is close to the ' + shower.name + '! Watch for shooting stars coming from ' + shower.from + '. They are dust left behind by ' + shower.dust + '.', 9000);
      } else if (!n) {
        setCaption('This is the real sky for tonight. Drag to look around, then tap a bright star to start joining up a constellation.', 9000);
      } else if (site === 'mesa' && !save().mesaSky) {
        setCaption('Far from the cottage lights there are many more stars. Look for the faint, cloudy band of the Milky Way.', 9000);
      } else {
        setCaption('Drag to look around. Slide the night along to see the sky turn.', 5000);
      }
      if (site === 'mesa' && !save().mesaSky) { save().mesaSky = true; GG.Save.save(); }
      T0 = lastNow = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    },

    close: function () {
      cancelAnimationFrame(raf); raf = 0;
      target = null; ptr = null;
      GG.UI.close('screen-sky');
    },

    wish: function () {
      if (wishOpen <= 0) return;
      wishOpen = 0;
      $('sky-wish').classList.add('hidden');
      var d = save();
      d.wishes = (d.wishes || 0) + 1;
      d.sparkles += 2;
      GG.Save.save(); GG.UI.refreshHud();
      if (GG.Sfx.coin) GG.Sfx.coin();
      var F = GG.METEOR_FACTS;
      setCaption('Wish made! ✦ +2. ' + F[(d.wishes - 1) % F.length], 8000);
    },

    /* ---- for the Star Book and the card: a little picture of one thing ---- */
    drawThumb: function (canvas, def, bright) {
      unpack();
      var c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, w, h);
      var g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, bright ? '#0a1238' : '#2a3152'); g.addColorStop(1, bright ? '#1c2a66' : '#3a4168');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      var R = GG.mulberry32 ? GG.mulberry32(def.id.length * 131 + def.id.charCodeAt(0) * 7 + def.id.charCodeAt(1)) : Math.random;
      var i;
      c.fillStyle = bright ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.14)';
      for (i = 0; i < 26; i++) c.fillRect(R() * w, R() * h, 1.4, 1.4);
      var con = CON_BY_ID[def.id];
      if (con) {
        /* flatten the patch of sky round its middle: north up, east to
           the left, the way it looks when you face it */
        var m = con.mid, ra0 = Math.atan2(m[1], m[0]), dec0 = Math.asin(m[2]);
        var pts = con.verts.map(function (q) {
          var ra = q.ra * D2R, dec = q.dec * D2R;
          var cc = Math.sin(dec0) * Math.sin(dec) + Math.cos(dec0) * Math.cos(dec) * Math.cos(ra - ra0);
          return [-Math.cos(dec) * Math.sin(ra - ra0) / cc,
            -(Math.cos(dec0) * Math.sin(dec) - Math.sin(dec0) * Math.cos(dec) * Math.cos(ra - ra0)) / cc, q];
        });
        var x0 = 9, x1 = -9, y0 = 9, y1 = -9;
        pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
        var pad = Math.min(w, h) * 0.16;
        var k = Math.min((w - pad * 2) / Math.max(0.02, x1 - x0), (h - pad * 2) / Math.max(0.02, y1 - y0));
        var ox = w / 2 - (x0 + x1) / 2 * k, oy = h / 2 - (y0 + y1) / 2 * k;
        if (bright) {
          c.strokeStyle = 'rgba(160,196,255,0.75)'; c.lineWidth = Math.max(1.5, w / 150); c.lineCap = 'round'; c.lineJoin = 'round';
          c.beginPath();
          con.lines.forEach(function (L) {
            L.forEach(function (vi, j) {
              var p = pts[vi];
              if (j) c.lineTo(ox + p[0] * k, oy + p[1] * k); else c.moveTo(ox + p[0] * k, oy + p[1] * k);
            });
          });
          c.stroke();
        }
        pts.forEach(function (p) {
          var q = p[2], r = Math.max(1.2, (4.6 - q.mag * 0.8)) * w / 190;
          c.fillStyle = bright ? COLS[q.col] : 'rgba(210,216,240,0.5)';
          c.beginPath(); c.arc(ox + p[0] * k, oy + p[1] * k, r, 0, 6.2832); c.fill();
        });
        return;
      }
      /* a treasure: draw what kind of thing it is */
      var cx = w / 2, cy = h / 2, u = Math.min(w, h) / 2;
      if (!puff) makePuff();
      c.globalAlpha = bright ? 1 : 0.35;
      if (def.id === 'pleiades') {
        [[0, 0, 3], [-0.34, -0.1, 2.5], [0.3, 0.14, 2.6], [0.1, -0.34, 2.2], [-0.16, 0.3, 2.2], [0.46, -0.16, 1.8], [-0.5, 0.22, 1.6]].forEach(function (s) {
          c.fillStyle = '#cfe0ff';
          c.globalAlpha = (bright ? 1 : 0.35) * 0.25; c.beginPath(); c.arc(cx + s[0] * u, cy + s[1] * u, s[2] * w / 60, 0, 6.2832); c.fill();
          c.globalAlpha = bright ? 1 : 0.35; c.beginPath(); c.arc(cx + s[0] * u, cy + s[1] * u, s[2] * w / 190, 0, 6.2832); c.fill();
        });
      } else if (def.id === 'milkyway') {
        c.save(); c.translate(cx, cy); c.rotate(-0.5);
        for (i = 0; i < 26; i++) {
          var px = (i / 25 - 0.5) * w * 1.3, s2 = u * (0.5 + R() * 0.4);
          c.globalAlpha = (bright ? 0.3 : 0.12);
          c.drawImage(puff, px - s2, (R() - 0.5) * u * 0.3 - s2, s2 * 2, s2 * 2);
        }
        c.restore();
      } else {
        c.save(); c.translate(cx, cy);
        if (def.kind === 'galaxy') { c.rotate(-0.6); c.scale(1.7, 0.6); }
        c.globalAlpha = bright ? 0.95 : 0.3;
        c.drawImage(puff, -u * 0.8, -u * 0.8, u * 1.6, u * 1.6);
        if (def.kind === 'nebula') { c.globalAlpha = bright ? 0.35 : 0.1; c.fillStyle = '#ff9ec4'; c.beginPath(); c.arc(0, 0, u * 0.42, 0, 6.2832); c.fill(); }
        if (def.kind === 'cluster') {
          c.fillStyle = '#fff6d8';
          for (i = 0; i < 40; i++) { var rr = Math.pow(R(), 1.6) * u * 0.55, aa = R() * 6.2832; c.globalAlpha = bright ? 0.8 : 0.25; c.fillRect(Math.cos(aa) * rr, Math.sin(aa) * rr, 1.6, 1.6); }
        }
        c.restore();
      }
      c.globalAlpha = 1;
    },

    found: function () {
      var n = 0;
      (GG.SKY_ALL || []).forEach(function (d) { if (has(d.id)) n++; });
      return n;
    },
    has: has,

    /* ---- test and debugging hooks ---- */
    debug: function () {
      return { site: site, hour: hour, hStart: hStart, hEnd: hEnd, az: az0, alt: alt0, base: base, limit: limitMag(),
        target: target ? target.id : null, moon: moon, moonAlt: moonAlt, sunAlt: sunAlt, shower: shower ? shower.name : null,
        W: W, H: H, card: cardDef ? cardDef.id : null, wishOpen: wishOpen, stars: N, mw: MW.length };
    },
    _setHour: function (h) { hour = h; hourGoal = null; syncSlider(); chipsDirty = true; frameMaths(); },
    _look: function (az, alt) { az0 = az; alt0 = alt; azGoal = null; frameMaths(); },
    _con: function (id) {
      var con = CON_BY_ID[id]; if (!con) return null;
      frameMaths(); placeVerts(con);
      return { up: isUp(con), best: con.best, state: stateOf(con),
        verts: con.verts.map(function (q) { return { x: q.x, y: q.y, on: q.on, alt: q.alt, lit: q.lit }; }) };
    },
    _point: function (id) { var con = CON_BY_ID[id]; if (con) { pointAt(con.mid, true); frameMaths(); } },
    _treasure: function (id) { frameMaths(); render(0, performance.now(), 0); return treasureScr[id] || null; },
    _named: function (name) {
      frameMaths(); drawNamed();
      for (var i = 0; i < NAMED.length; i++) if (NAMED[i].name === name) return { x: NAMED[i].x, y: NAMED[i].y, on: NAMED[i].on };
      return null;
    },
    _meteor: function () { meteorIn = 0; },
    _tap: tapAt,
    _astro: { moonPos: moonPos, sunPos: sunPos, julian: julian, gmst: gmst, phaseName: phaseName,
      pacificOffset: pacificOffset, altOf: altOf, eqVec: eqVec, galToEq: galToEq }
  };
})(window.GG = window.GG || {});
