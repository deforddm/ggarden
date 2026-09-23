/* Little things to put inside a terrarium. */
(function (GG) {
  'use strict';
  function ell(c, x, y, rx, ry, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); c.fill();
  }

  var D = {};

  D.leaf = function (c, x, y, s) {
    c.fillStyle = '#4f9c46';
    c.beginPath();
    c.moveTo(x, y); c.quadraticCurveTo(x - 14 * s, y - 12 * s, x - 2 * s, y - 26 * s);
    c.quadraticCurveTo(x + 13 * s, y - 12 * s, x, y); c.fill();
    c.strokeStyle = '#367a30'; c.lineWidth = 1.4 * s;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2 * s, y - 25 * s); c.stroke();
  };
  D.pebble = function (c, x, y, s) {
    c.fillStyle = '#a9a9a2'; ell(c, x, y - 5 * s, 13 * s, 8 * s);
    c.fillStyle = '#c2c2ba'; ell(c, x - 3 * s, y - 7 * s, 6 * s, 3.6 * s);
  };
  D.twig = function (c, x, y, s) {
    c.strokeStyle = '#8a6238'; c.lineWidth = 3 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 3 * s, y); c.quadraticCurveTo(x + 3 * s, y - 16 * s, x - 1 * s, y - 30 * s); c.stroke();
    c.lineWidth = 2 * s;
    c.beginPath(); c.moveTo(x + 1 * s, y - 14 * s); c.lineTo(x + 11 * s, y - 21 * s); c.stroke();
    c.beginPath(); c.moveTo(x, y - 22 * s); c.lineTo(x - 9 * s, y - 30 * s); c.stroke();
  };
  D.mushroom = function (c, x, y, s) { GG.Props.mushroom(c, x, y, 26 * s, 0, 0.3); };
  D.flower = function (c, x, y, s) { GG.Props.flower(c, x, y, 15 * s, 0, 0.5, '#ff8fb0'); };
  D.bluebell = function (c, x, y, s) { GG.Props.tulip(c, x, y, 15 * s, 0, 0.2, '#9fa8ff'); };
  D.fern = function (c, x, y, s) {
    c.strokeStyle = '#3d8f45'; c.lineCap = 'round';
    for (var k = -1; k <= 1; k++) {
      var lean = k * 0.45;
      c.lineWidth = 2.4 * s;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + lean * 20 * s, y - 18 * s, x + lean * 30 * s, y - 34 * s);
      c.stroke();
      c.lineWidth = 1.5 * s;
      for (var i = 1; i <= 5; i++) {
        var tx = x + lean * 20 * s * (i / 5) * 1.2, ty = y - (34 * s) * (i / 5);
        c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 8 * s, ty - 4 * s); c.stroke();
        c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 8 * s, ty - 4 * s); c.stroke();
      }
    }
  };
  D.log = function (c, x, y, s) { GG.Props.log(c, x, y, 24 * s, 0, 0.5); };
  D.rock = function (c, x, y, s) { GG.Props.rock(c, x, y, 22 * s, 0, 0.5); };
  D.moss = function (c, x, y, s) {
    c.fillStyle = '#5fa84e';
    for (var i = 0; i < 9; i++) {
      var a = i * 0.7;
      ell(c, x + Math.cos(a) * 16 * s, y - 3 * s + Math.sin(a) * 5 * s, 7 * s, 4.5 * s);
    }
    c.fillStyle = '#79c064';
    ell(c, x - 5 * s, y - 6 * s, 8 * s, 4 * s);
  };
  D.acorn = function (c, x, y, s) {
    c.fillStyle = '#d8a35e'; ell(c, x, y - 8 * s, 8 * s, 9 * s);
    c.fillStyle = '#7a5330';
    c.beginPath(); c.ellipse(x, y - 13 * s, 9 * s, 5.5 * s, 0, Math.PI, 0); c.fill();
    c.strokeStyle = '#7a5330'; c.lineWidth = 2 * s;
    c.beginPath(); c.moveTo(x, y - 17 * s); c.lineTo(x + 1 * s, y - 22 * s); c.stroke();
  };
  D.shell = function (c, x, y, s) {
    c.fillStyle = '#f0d9c4';
    c.beginPath(); c.ellipse(x, y - 8 * s, 12 * s, 10 * s, 0, Math.PI, 0); c.fill();
    c.strokeStyle = '#d9b79a'; c.lineWidth = 1.2 * s;
    for (var i = 0; i < 5; i++) {
      var a = Math.PI + i * (Math.PI / 5) + 0.3;
      c.beginPath(); c.moveTo(x, y - 8 * s);
      c.lineTo(x + Math.cos(a) * 12 * s, y - 8 * s + Math.sin(a) * 10 * s); c.stroke();
    }
  };
  D.lantern = function (c, x, y, s, t) {
    var glow = 0.6 + 0.4 * Math.sin((t || 0) * 2);
    c.fillStyle = 'rgba(255,226,140,' + (0.20 * glow) + ')';
    ell(c, x, y - 22 * s, 30 * s, 30 * s);
    c.fillStyle = '#7a6a50';
    c.fillRect(x - 9 * s, y - 4 * s, 18 * s, 4 * s);
    c.fillStyle = 'rgba(255,222,130,' + (0.75 + 0.25 * glow) + ')';
    GG.roundRect(c, x - 7 * s, y - 26 * s, 14 * s, 22 * s, 3 * s); c.fill();
    c.strokeStyle = '#7a6a50'; c.lineWidth = 2 * s; c.stroke();
    c.beginPath(); c.moveTo(x, y - 26 * s); c.quadraticCurveTo(x, y - 34 * s, x + 7 * s, y - 32 * s); c.stroke();
  };
  D.crystal = function (c, x, y, s, t) {
    var g = 0.5 + 0.5 * Math.sin((t || 0) * 1.6);
    c.fillStyle = 'rgba(160,220,255,' + (0.18 + 0.12 * g) + ')';
    ell(c, x, y - 16 * s, 26 * s, 26 * s);
    c.fillStyle = '#8fd6ff';
    c.beginPath(); c.moveTo(x, y - 34 * s); c.lineTo(x + 9 * s, y - 8 * s); c.lineTo(x - 9 * s, y - 8 * s); c.closePath(); c.fill();
    c.fillStyle = '#c8ecff';
    c.beginPath(); c.moveTo(x, y - 34 * s); c.lineTo(x + 3 * s, y - 8 * s); c.lineTo(x - 3 * s, y - 8 * s); c.closePath(); c.fill();
  };
  D.waterdish = function (c, x, y, s) {
    c.fillStyle = '#b8b0a0'; ell(c, x, y - 4 * s, 20 * s, 8 * s);
    c.fillStyle = '#6fc3e0'; ell(c, x, y - 5 * s, 16 * s, 5.5 * s);
    c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, x - 5 * s, y - 6 * s, 5 * s, 1.6 * s);
  };
  D.berries = function (c, x, y, s) {
    c.strokeStyle = '#4f8a3a'; c.lineWidth = 2 * s;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 16 * s); c.stroke();
    c.fillStyle = '#c8365e';
    ell(c, x - 6 * s, y - 18 * s, 6 * s, 6 * s);
    ell(c, x + 6 * s, y - 16 * s, 5.5 * s, 5.5 * s);
    ell(c, x, y - 25 * s, 5 * s, 5 * s);
  };
  D.signplate = function (c, x, y, s) {
    c.fillStyle = '#e6d2a8';
    GG.roundRect(c, x - 22 * s, y - 18 * s, 44 * s, 16 * s, 3 * s); c.fill();
    c.strokeStyle = '#b79a6a'; c.lineWidth = 1.6 * s; c.stroke();
    c.fillStyle = '#8a6a3a';
    c.fillRect(x - 2 * s, y - 4 * s, 4 * s, 4 * s);
  };

  /* ---------- things for a fish tank ---------- */

  D.seagrass = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.1) * 4 * s;
    c.strokeStyle = '#3f9a6a'; c.lineCap = 'round';
    for (var i = -2; i <= 2; i++) {
      c.lineWidth = (3.4 - Math.abs(i) * 0.5) * s;
      c.strokeStyle = i % 2 ? '#3f9a6a' : '#56b884';
      c.beginPath();
      c.moveTo(x + i * 5 * s, y);
      c.quadraticCurveTo(x + i * 7 * s + sway * 0.5, y - 18 * s,
        x + i * 9 * s + sway, y - (34 - Math.abs(i) * 6) * s);
      c.stroke();
    }
  };

  D.coral = function (c, x, y, s) {
    c.fillStyle = '#e8746a';
    ell(c, x, y - 5 * s, 15 * s, 6 * s);
    c.strokeStyle = '#ef8f84'; c.lineCap = 'round';
    var arms = [[-9, -22, -14], [0, -30, 2], [9, -24, 14], [-4, -18, -7], [5, -16, 8]];
    for (var i = 0; i < arms.length; i++) {
      c.lineWidth = (5 - i * 0.5) * s;
      c.beginPath();
      c.moveTo(x + arms[i][0] * s, y - 4 * s);
      c.quadraticCurveTo(x + arms[i][0] * s, y + arms[i][1] * 0.6 * s,
        x + arms[i][2] * s, y + arms[i][1] * s);
      c.stroke();
    }
    c.fillStyle = '#ffc2b4';
    for (var j = 0; j < arms.length; j++) {
      ell(c, x + arms[j][2] * s, y + arms[j][1] * s, 2.6 * s, 2.6 * s);
    }
  };

  D.anemonedeco = function (c, x, y, s, t) {
    var wig = Math.sin((t || 0) * 1.8);
    c.fillStyle = '#3f8a5a';
    ell(c, x, y - 5 * s, 12 * s, 6 * s);
    c.strokeStyle = '#8fd8a8'; c.lineCap = 'round'; c.lineWidth = 2.4 * s;
    for (var i = 0; i < 13; i++) {
      var a = -Math.PI + i * (Math.PI / 12);
      var w = Math.sin((t || 0) * 1.6 + i) * 2.4 * s;
      c.beginPath();
      c.moveTo(x + Math.cos(a) * 6 * s, y - 7 * s);
      c.quadraticCurveTo(x + Math.cos(a) * 13 * s + w * 0.5, y - 16 * s,
        x + Math.cos(a) * 15 * s + w, y - 23 * s + Math.sin(a) * 2 * s);
      c.stroke();
    }
    c.fillStyle = '#ffe9a8';
    for (var j = 0; j < 7; j++) {
      var b = -Math.PI + 0.3 + j * (Math.PI / 6.5);
      ell(c, x + Math.cos(b) * 15 * s + wig, y - 23 * s + Math.sin(b) * 2 * s, 1.8 * s, 1.8 * s);
    }
  };

  D.bubbler = function (c, x, y, s, t) {
    var tt = (t || 0);
    c.fillStyle = '#6b6f78';
    GG.roundRect(c, x - 7 * s, y - 15 * s, 14 * s, 15 * s, 3 * s); c.fill();
    c.fillStyle = '#8a8f9a';
    GG.roundRect(c, x - 7 * s, y - 15 * s, 14 * s, 5 * s, 3 * s); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.3)';
    GG.roundRect(c, x - 5 * s, y - 13 * s, 4 * s, 10 * s, 2 * s); c.fill();
    for (var i = 0; i < 7; i++) {
      var ph = (tt * 0.55 + i / 7) % 1;
      var by = y - 12 * s - ph * 30 * s;
      var bx = x + Math.sin(ph * 7 + i) * 4 * s;
      c.fillStyle = 'rgba(255,255,255,' + (0.55 * (1 - ph)).toFixed(3) + ')';
      ell(c, bx, by, (1.8 + (i % 3)) * s, (1.8 + (i % 3)) * s);
    }
  };

  D.treasure = function (c, x, y, s, t) {
    var lid = -0.3 + Math.sin((t || 0) * 0.7) * 0.06;
    c.fillStyle = '#7a5330';
    GG.roundRect(c, x - 16 * s, y - 14 * s, 32 * s, 14 * s, 2 * s); c.fill();
    c.fillStyle = '#c8a35e';
    c.fillRect(x - 16 * s, y - 9 * s, 32 * s, 2.4 * s);
    c.save(); c.translate(x - 16 * s, y - 14 * s); c.rotate(lid);
    c.fillStyle = '#8a6238';
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(0, -6 * s);
    c.quadraticCurveTo(16 * s, -15 * s, 32 * s, -6 * s);
    c.lineTo(32 * s, 0); c.closePath(); c.fill();
    c.fillStyle = '#c8a35e';
    c.beginPath();
    c.moveTo(0, -4 * s); c.quadraticCurveTo(16 * s, -13 * s, 32 * s, -4 * s);
    c.lineTo(32 * s, -2 * s); c.quadraticCurveTo(16 * s, -11 * s, 0, -2 * s);
    c.closePath(); c.fill();
    c.restore();
    c.fillStyle = '#ffe08a';
    ell(c, x - 5 * s, y - 13 * s, 3.4 * s, 2.4 * s);
    ell(c, x + 4 * s, y - 13.5 * s, 3 * s, 2.2 * s);
    c.fillStyle = '#9fe8ff';
    ell(c, x + 10 * s, y - 12.6 * s, 2.4 * s, 2 * s);
  };

  D.seastardeco = function (c, x, y, s) {
    c.save(); c.translate(x, y - 9 * s); c.rotate(0.3);
    c.fillStyle = '#e8845a';
    c.beginPath();
    for (var i = 0; i <= 60; i++) {
      var ang = i / 60 * Math.PI * 2;
      var r = (7 + 12 * Math.pow(Math.abs(Math.cos(ang * 2.5)), 1.5)) * s;
      var px = Math.cos(ang) * r, py = Math.sin(ang) * r * 0.62;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath(); c.fill();
    c.fillStyle = '#f6a878';
    c.beginPath();
    for (var j = 0; j <= 60; j++) {
      var an = j / 60 * Math.PI * 2;
      var rr = (7 + 12 * Math.pow(Math.abs(Math.cos(an * 2.5)), 1.5)) * s * 0.66;
      var qx = Math.cos(an) * rr, qy = Math.sin(an) * rr * 0.62;
      if (j === 0) c.moveTo(qx, qy); else c.lineTo(qx, qy);
    }
    c.closePath(); c.fill();
    c.restore();
  };

  D.sandcastle = function (c, x, y, s) {
    c.fillStyle = '#e6d2a0';
    c.fillRect(x - 18 * s, y - 14 * s, 36 * s, 14 * s);
    [-14, 0, 14].forEach(function (dx, i) {
      var h = i === 1 ? 26 : 21;
      c.fillStyle = '#eddcb0';
      c.fillRect(x + dx * s - 6 * s, y - h * s, 12 * s, (h - 12) * s);
      c.fillStyle = '#d8c48e';
      c.beginPath();
      c.moveTo(x + dx * s - 7 * s, y - h * s);
      c.lineTo(x + dx * s, y - (h + 8) * s);
      c.lineTo(x + dx * s + 7 * s, y - h * s);
      c.closePath(); c.fill();
    });
    c.strokeStyle = '#c8a35e'; c.lineWidth = 1.2 * s;
    c.beginPath(); c.moveTo(x, y - 34 * s); c.lineTo(x, y - 42 * s); c.stroke();
    c.fillStyle = '#ef8fae';
    c.beginPath();
    c.moveTo(x, y - 42 * s); c.lineTo(x + 9 * s, y - 39 * s); c.lineTo(x, y - 36 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#8a7a5a';
    c.fillRect(x - 18 * s, y - 3 * s, 36 * s, 3 * s);
  };

  /* ---------- things for a hybrid tank ---------- */

  D.rockpool = function (c, x, y, s, t) {
    var rip = Math.sin((t || 0) * 1.4);
    c.fillStyle = '#9a958a';
    ell(c, x, y - 6 * s, 26 * s, 12 * s);
    c.fillStyle = '#7fc8c4';
    ell(c, x, y - 7 * s, 20 * s, 8.4 * s);
    c.fillStyle = '#a8dedb';
    ell(c, x, y - 8 * s, 15 * s, 5.6 * s);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1 * s;
    c.beginPath();
    c.ellipse(x + rip * 2 * s, y - 8 * s, (8 + rip) * s, 3 * s, 0, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = '#b8b2a4';
    ell(c, x - 21 * s, y - 9 * s, 7 * s, 5 * s, -0.3);
    ell(c, x + 20 * s, y - 8 * s, 6 * s, 4.4 * s, 0.3);
    c.fillStyle = '#e8845a';
    c.save(); c.translate(x + 6 * s, y - 8 * s); c.scale(0.5, 0.5);
    D.seastardeco(c, 0, 9 * s, s);
    c.restore();
  };

  D.lilypaddeco = function (c, x, y, s, t) {
    var bob = Math.sin((t || 0) * 1.1) * 1.4 * s;
    c.fillStyle = '#3f9350';
    c.beginPath();
    c.ellipse(x, y - 4 * s + bob, 18 * s, 8 * s, 0, 0.45, Math.PI * 2 + 0.1);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,70,30,0.3)'; c.lineWidth = 1 * s;
    for (var i = 0; i < 5; i++) {
      var a = 0.8 + i * 0.95;
      c.beginPath(); c.moveTo(x, y - 4 * s + bob);
      c.lineTo(x + Math.cos(a) * 16 * s, y - 4 * s + bob + Math.sin(a) * 7 * s);
      c.stroke();
    }
    c.fillStyle = '#fff0f6';
    ell(c, x + 8 * s, y - 9 * s + bob, 5 * s, 4 * s);
    c.fillStyle = '#ffd7e6';
    for (var j = 0; j < 6; j++) {
      var b = j * 1.05;
      ell(c, x + 8 * s + Math.cos(b) * 3.4 * s, y - 9 * s + bob + Math.sin(b) * 2.6 * s, 2.6 * s, 1.8 * s, b);
    }
    c.fillStyle = '#ffd45c';
    ell(c, x + 8 * s, y - 9 * s + bob, 1.6 * s, 1.2 * s);
  };

  D.cattail = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.2) * 2.4 * s;
    c.strokeStyle = '#4f8a4a'; c.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      c.lineWidth = 2.4 * s;
      c.beginPath();
      c.moveTo(x + i * 5 * s, y);
      c.quadraticCurveTo(x + i * 7 * s + sway * 0.5, y - 20 * s,
        x + i * 9 * s + sway, y - (36 - Math.abs(i) * 8) * s);
      c.stroke();
      if (i !== 0) continue;
      c.fillStyle = '#8a5f33';
      ell(c, x + sway, y - 42 * s, 3.4 * s, 8 * s);
      c.strokeStyle = '#8a5f33'; c.lineWidth = 1.6 * s;
      c.beginPath(); c.moveTo(x + sway, y - 50 * s); c.lineTo(x + sway, y - 55 * s); c.stroke();
      c.strokeStyle = '#4f8a4a';
    }
  };

  /* ---------- things for any tank ---------- */

  D.fairyhouse = function (c, x, y, s, t) {
    var glow = 0.55 + 0.45 * Math.sin((t || 0) * 1.5);
    c.fillStyle = '#c8a882';
    GG.roundRect(c, x - 12 * s, y - 20 * s, 24 * s, 20 * s, 3 * s); c.fill();
    c.fillStyle = '#e8556a';
    c.beginPath();
    c.moveTo(x - 17 * s, y - 19 * s);
    c.quadraticCurveTo(x, y - 42 * s, x + 17 * s, y - 19 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#fff0f0';
    [[-8, -26], [7, -25], [0, -32]].forEach(function (p) {
      ell(c, x + p[0] * s, y + p[1] * s, 2.6 * s, 2.2 * s);
    });
    c.fillStyle = '#6b4a2c';
    c.beginPath();
    c.moveTo(x - 5 * s, y); c.lineTo(x - 5 * s, y - 9 * s);
    c.quadraticCurveTo(x, y - 14 * s, x + 5 * s, y - 9 * s);
    c.lineTo(x + 5 * s, y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,226,140,' + (0.35 + 0.35 * glow).toFixed(3) + ')';
    ell(c, x + 8 * s, y - 13 * s, 3.4 * s, 3.4 * s);
    c.fillStyle = '#ffe9a8';
    ell(c, x + 8 * s, y - 13 * s, 2 * s, 2 * s);
  };

  D.teacup = function (c, x, y, s) {
    c.fillStyle = '#efe6d8';
    ell(c, x, y - 2 * s, 17 * s, 5 * s);
    c.fillStyle = '#fdf8ef';
    c.beginPath();
    c.moveTo(x - 11 * s, y - 18 * s);
    c.quadraticCurveTo(x, y + 1 * s, x + 11 * s, y - 18 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#9fd6f0';
    ell(c, x, y - 18 * s, 11 * s, 3.4 * s);
    c.strokeStyle = '#efe6d8'; c.lineWidth = 2.4 * s;
    c.beginPath();
    c.arc(x + 13 * s, y - 12 * s, 5 * s, -1.2, 1.5);
    c.stroke();
    c.strokeStyle = '#ef8fae'; c.lineWidth = 1.4 * s;
    c.beginPath();
    c.moveTo(x - 8 * s, y - 13 * s);
    c.quadraticCurveTo(x, y - 11 * s, x + 8 * s, y - 13 * s);
    c.stroke();
  };

  D.driftbranch = function (c, x, y, s) {
    c.strokeStyle = '#c8b79a'; c.lineCap = 'round';
    c.lineWidth = 5 * s;
    c.beginPath();
    c.moveTo(x - 20 * s, y - 3 * s);
    c.quadraticCurveTo(x, y - 14 * s, x + 20 * s, y - 5 * s);
    c.stroke();
    c.lineWidth = 3 * s; c.strokeStyle = '#d8c9ac';
    c.beginPath(); c.moveTo(x - 6 * s, y - 10 * s); c.lineTo(x - 12 * s, y - 22 * s); c.stroke();
    c.beginPath(); c.moveTo(x + 7 * s, y - 10 * s); c.lineTo(x + 15 * s, y - 20 * s); c.stroke();
    c.lineWidth = 2 * s;
    c.beginPath(); c.moveTo(x - 12 * s, y - 22 * s); c.lineTo(x - 18 * s, y - 28 * s); c.stroke();
    c.beginPath(); c.moveTo(x + 15 * s, y - 20 * s); c.lineTo(x + 21 * s, y - 27 * s); c.stroke();
    c.fillStyle = 'rgba(120,100,74,0.35)';
    ell(c, x, y - 1 * s, 20 * s, 3 * s);
  };

  D.pinecone = function (c, x, y, s) {
    c.fillStyle = '#7a5330';
    ell(c, x, y - 11 * s, 7 * s, 12 * s);
    c.fillStyle = '#96693d';
    for (var r = 0; r < 5; r++) {
      for (var i = -1; i <= 1; i++) {
        ell(c, x + i * 4 * s, y - 3 * s - r * 4.4 * s, 3.4 * s, 2.2 * s);
      }
    }
    c.fillStyle = '#5f9a4a';
    ell(c, x - 7 * s, y - 21 * s, 5 * s, 2.2 * s, -0.5);
    ell(c, x + 7 * s, y - 20 * s, 5 * s, 2.2 * s, 0.5);
  };

  D.toadstool = function (c, x, y, s) {
    c.fillStyle = '#f3ece0';
    GG.roundRect(c, x - 3.4 * s, y - 16 * s, 7 * s, 16 * s, 2 * s); c.fill();
    c.fillStyle = '#7f56c8';
    c.beginPath();
    c.moveTo(x - 15 * s, y - 15 * s);
    c.quadraticCurveTo(x, y - 32 * s, x + 15 * s, y - 15 * s);
    c.quadraticCurveTo(x, y - 10 * s, x - 15 * s, y - 15 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#c8a8f0';
    [[-7, -19], [4, -21], [9, -16], [-2, -23]].forEach(function (p) {
      ell(c, x + p[0] * s, y + p[1] * s, 2.6 * s, 2 * s);
    });
  };

  D.tinypond = function (c, x, y, s, t) {
    var rip = Math.sin((t || 0) * 1.6);
    c.fillStyle = '#8a8272';
    ell(c, x, y - 5 * s, 22 * s, 10 * s);
    c.fillStyle = '#6fc3e0';
    ell(c, x, y - 6 * s, 17 * s, 7 * s);
    c.fillStyle = '#a8e0f0';
    ell(c, x - 3 * s, y - 7 * s, 9 * s, 3.4 * s);
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1 * s;
    c.beginPath();
    c.ellipse(x, y - 6 * s, (7 + rip * 2) * s, (3 + rip) * s, 0, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = '#a9a9a2';
    for (var i = 0; i < 7; i++) {
      var a = i * 0.9;
      ell(c, x + Math.cos(a) * 20 * s, y - 5 * s + Math.sin(a) * 9 * s, 4 * s, 2.6 * s, a);
    }
  };

  D.bunting = function (c, x, y, s) {
    c.strokeStyle = '#c8b79a'; c.lineWidth = 1.4 * s;
    c.beginPath();
    c.moveTo(x - 26 * s, y - 30 * s);
    c.quadraticCurveTo(x, y - 20 * s, x + 26 * s, y - 30 * s);
    c.stroke();
    var cols = ['#ef8fae', '#ffd45c', '#8fd0ff', '#a8e88a', '#c39bff'];
    for (var i = 0; i < 5; i++) {
      var p = i / 4;
      var px = x + (-26 + p * 52) * s;
      var py = y - 30 * s + Math.sin(Math.PI * p) * 10 * s;
      c.fillStyle = cols[i];
      c.beginPath();
      c.moveTo(px - 4 * s, py); c.lineTo(px + 4 * s, py); c.lineTo(px, py + 9 * s);
      c.closePath(); c.fill();
    }
    c.strokeStyle = '#b8a888'; c.lineWidth = 2 * s;
    c.beginPath(); c.moveTo(x - 26 * s, y - 30 * s); c.lineTo(x - 26 * s, y); c.stroke();
    c.beginPath(); c.moveTo(x + 26 * s, y - 30 * s); c.lineTo(x + 26 * s, y); c.stroke();
  };


  /* ---------- things for a garden habitat ---------- */

  D.feeder = function (c, x, y, s, t) {
    t = t || 0;
    var sw = Math.sin(t * 1.4) * 0.05;
    c.save(); c.translate(x, y - 40 * s); c.rotate(sw);
    /* the hook and chain */
    c.strokeStyle = '#8a8f94'; c.lineWidth = 1.8 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -2 * s); c.lineTo(0, -18 * s); c.stroke();
    /* the red bowl of sugar water */
    c.fillStyle = '#d8453f';
    c.beginPath();
    c.moveTo(-13 * s, 0);
    c.quadraticCurveTo(-13 * s, 12 * s, 0, 13 * s);
    c.quadraticCurveTo(13 * s, 12 * s, 13 * s, 0);
    c.closePath(); c.fill();
    c.fillStyle = '#f0eee4';
    c.beginPath(); c.ellipse(0, 0, 13 * s, 4 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f4c74a';
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.ellipse(i * 8 * s, 6 * s, 3.2 * s, 3.2 * s, 0, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#b8322d';
    c.beginPath(); c.ellipse(0, 13 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  };

  D.birdbath = function (c, x, y, s, t) {
    t = t || 0;
    c.fillStyle = '#b8b4a8';
    c.beginPath();
    c.moveTo(x - 13 * s, y);
    c.quadraticCurveTo(x - 5 * s, y - 6 * s, x - 4 * s, y - 24 * s);
    c.lineTo(x + 4 * s, y - 24 * s);
    c.quadraticCurveTo(x + 5 * s, y - 6 * s, x + 13 * s, y);
    c.closePath(); c.fill();
    c.fillStyle = '#cdc9bc';
    c.beginPath();
    c.moveTo(-20 * s + x, y - 24 * s);
    c.quadraticCurveTo(x, y - 14 * s, x + 20 * s, y - 24 * s);
    c.quadraticCurveTo(x, y - 32 * s, x - 20 * s, y - 24 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#8fd0e4';
    c.beginPath();
    c.ellipse(x, y - 25.5 * s, 15 * s, 4.4 * s, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2 * s;
    var r = 4 + (t * 7) % 11;
    c.globalAlpha = GG.clamp(1 - (r - 4) / 11, 0, 1) * 0.8;
    c.beginPath();
    c.ellipse(x, y - 25.5 * s, r * s, r * 0.3 * s, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 1;
  };

  D.perch = function (c, x, y, s) {
    c.strokeStyle = '#a08258'; c.lineWidth = 3.4 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 34 * s); c.stroke();
    c.beginPath(); c.moveTo(x - 8 * s, y - 1 * s); c.lineTo(x + 8 * s, y - 1 * s); c.stroke();
    c.strokeStyle = '#8a6a44'; c.lineWidth = 4.4 * s;
    c.beginPath(); c.moveTo(x - 17 * s, y - 34 * s); c.lineTo(x + 17 * s, y - 36 * s); c.stroke();
    /* a swing of rope with a bell */
    c.strokeStyle = '#d8c49a'; c.lineWidth = 1.4 * s;
    c.beginPath(); c.moveTo(x + 12 * s, y - 35 * s); c.lineTo(x + 12 * s, y - 24 * s); c.stroke();
    c.fillStyle = '#e8b93a';
    c.beginPath(); c.ellipse(x + 12 * s, y - 21 * s, 3.4 * s, 3.4 * s, 0, 0, Math.PI * 2); c.fill();
  };

  D.batbox = function (c, x, y, s) {
    c.fillStyle = '#7a5a3a';
    c.beginPath();
    c.moveTo(x - 12 * s, y - 14 * s);
    c.lineTo(x + 12 * s, y - 14 * s);
    c.lineTo(x + 12 * s, y - 44 * s);
    c.lineTo(x, y - 52 * s);
    c.lineTo(x - 12 * s, y - 44 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#5f4530';
    c.fillRect(x - 9 * s, y - 20 * s, 18 * s, 5 * s);
    c.fillStyle = '#3a2c20';
    c.fillRect(x - 7 * s, y - 18.6 * s, 14 * s, 2.2 * s);
    c.strokeStyle = '#8a6a48'; c.lineWidth = 3 * s;
    c.beginPath(); c.moveTo(x, y - 14 * s); c.lineTo(x, y); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.14)';
    c.fillRect(x - 12 * s, y - 44 * s, 5 * s, 30 * s);
  };

  D.kennel = function (c, x, y, s) {
    c.fillStyle = '#c98f52';
    c.beginPath();
    c.moveTo(x - 24 * s, y);
    c.lineTo(x - 24 * s, y - 20 * s);
    c.lineTo(x, y - 34 * s);
    c.lineTo(x + 24 * s, y - 20 * s);
    c.lineTo(x + 24 * s, y);
    c.closePath(); c.fill();
    c.fillStyle = '#a8703c';
    c.beginPath();
    c.moveTo(x - 27 * s, y - 19 * s);
    c.lineTo(x, y - 36 * s);
    c.lineTo(x + 27 * s, y - 19 * s);
    c.lineTo(x + 22 * s, y - 17 * s);
    c.lineTo(x, y - 31 * s);
    c.lineTo(x - 22 * s, y - 17 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#4a3524';
    c.beginPath();
    c.moveTo(x - 9 * s, y);
    c.lineTo(x - 9 * s, y - 11 * s);
    c.quadraticCurveTo(x, y - 20 * s, x + 9 * s, y - 11 * s);
    c.lineTo(x + 9 * s, y);
    c.closePath(); c.fill();
  };

  D.basket = function (c, x, y, s) {
    c.fillStyle = '#c8a870';
    c.beginPath();
    c.moveTo(x - 22 * s, y - 14 * s);
    c.quadraticCurveTo(x - 20 * s, y, x, y);
    c.quadraticCurveTo(x + 20 * s, y, x + 22 * s, y - 14 * s);
    c.closePath(); c.fill();
    c.strokeStyle = '#a88a54'; c.lineWidth = 1.2 * s;
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * 8 * s, y - 13 * s);
      c.lineTo(x + i * 6 * s, y - 1 * s);
      c.stroke();
    }
    c.fillStyle = '#e08fa8';
    c.beginPath();
    c.ellipse(x, y - 14 * s, 21 * s, 6 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f0a8bd';
    c.beginPath();
    c.ellipse(x - 6 * s, y - 16 * s, 10 * s, 3.4 * s, 0, 0, Math.PI * 2); c.fill();
  };

  D.foodbowl = function (c, x, y, s) {
    c.fillStyle = '#4f8fd0';
    c.beginPath();
    c.moveTo(x - 14 * s, y - 10 * s);
    c.quadraticCurveTo(x - 12 * s, y, x, y);
    c.quadraticCurveTo(x + 12 * s, y, x + 14 * s, y - 10 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#3f78b0';
    c.beginPath(); c.ellipse(x, y - 10 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#a8763f';
    for (var i = 0; i < 7; i++) {
      var a = i * 1.1;
      c.beginPath();
      c.ellipse(x + Math.cos(a) * 8 * s, y - 11 * s + Math.sin(a) * 2.4 * s,
        2.6 * s, 2 * s, a, 0, Math.PI * 2);
      c.fill();
    }
  };

  D.scratchpost = function (c, x, y, s) {
    c.fillStyle = '#8a6a48';
    c.beginPath(); c.ellipse(x, y - 3 * s, 17 * s, 6 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#cbb188';
    c.fillRect(x - 6 * s, y - 40 * s, 12 * s, 37 * s);
    c.strokeStyle = '#b39a70'; c.lineWidth = 1 * s;
    for (var i = 0; i < 11; i++) {
      c.beginPath();
      c.moveTo(x - 6 * s, y - 6 * s - i * 3.2 * s);
      c.lineTo(x + 6 * s, y - 7.4 * s - i * 3.2 * s);
      c.stroke();
    }
    c.fillStyle = '#8a6a48';
    c.fillRect(x - 13 * s, y - 47 * s, 26 * s, 7 * s);
    c.strokeStyle = '#c4a068'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x + 11 * s, y - 46 * s);
    c.quadraticCurveTo(x + 18 * s, y - 40 * s, x + 14 * s, y - 33 * s);
    c.stroke();
    c.fillStyle = '#e0a8c0';
    c.beginPath(); c.ellipse(x + 14 * s, y - 30 * s, 4 * s, 4 * s, 0, 0, Math.PI * 2); c.fill();
  };

  D.branch = function (c, x, y, s) {
    c.strokeStyle = '#7a5a38'; c.lineWidth = 5 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 26 * s, y - 44 * s);
    c.quadraticCurveTo(x, y - 34 * s, x + 26 * s, y - 42 * s);
    c.stroke();
    c.lineWidth = 3 * s;
    c.beginPath(); c.moveTo(x - 8 * s, y - 38 * s); c.lineTo(x - 14 * s, y - 26 * s); c.stroke();
    c.fillStyle = '#4f9c46';
    [[-20, -48], [-2, -42], [16, -46], [10, -38]].forEach(function (q) {
      c.beginPath();
      c.ellipse(x + q[0] * s, y + q[1] * s, 7 * s, 4 * s, -0.5, 0, Math.PI * 2);
      c.fill();
    });
  };

  D.vine = function (c, x, y, s, t) {
    t = t || 0;
    c.strokeStyle = '#3f8a3a'; c.lineWidth = 2.6 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y - 52 * s);
    for (var i = 0; i <= 8; i++) {
      c.lineTo(x + Math.sin(i * 0.8 + t * 0.8) * 5 * s, y - 52 * s + i * 6 * s);
    }
    c.stroke();
    c.fillStyle = '#5fb04f';
    for (var k = 0; k < 7; k++) {
      var yy = y - 48 * s + k * 6.5 * s;
      var xx = x + Math.sin(k * 0.8 + t * 0.8) * 5 * s;
      c.beginPath();
      c.ellipse(xx + (k % 2 ? 6 : -6) * s, yy, 6 * s, 3.4 * s, (k % 2 ? 0.4 : -0.4), 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#e8709a';
    c.beginPath(); c.ellipse(x, y - 54 * s, 5 * s, 4 * s, 0, 0, Math.PI * 2); c.fill();
  };

  D.lilylog = function (c, x, y, s) {
    GG.Props.log(c, x, y, 26 * s, 0, 0.7);
    c.fillStyle = '#5fb04f';
    c.beginPath(); c.ellipse(x + 16 * s, y - 2 * s, 12 * s, 4.4 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f2f0e4';
    c.beginPath(); c.ellipse(x + 18 * s, y - 5 * s, 4.4 * s, 3 * s, 0, 0, Math.PI * 2); c.fill();
  };


  GG.DecorArt = D;

  /* `for` says which tanks a piece belongs in:
     land = terrariums, water = fish tanks, any = all three.
     A hybrid tank has both a bank and a pool, so it takes everything. */


  /* ---------- v1.12: brought back from the orchard and the hills ----------
     Each of these is unlocked by picking the fruit it is made of, never
     bought. Drawn like every other decoration: (x, y) is where it sits on the
     ground, and s is the scale. */

  D.appleplate = function (c, x, y, s, t) {
    c.fillStyle = '#d8cdb4'; ell(c, x, y - 2 * s, 15 * s, 5 * s);
    c.fillStyle = '#f0e4cf'; ell(c, x, y - 4 * s, 14 * s, 4.4 * s);
    [[-6, -8, 5], [6, -7, 4.6], [0, -13, 5.2]].forEach(function (p, i) {
      c.fillStyle = i === 2 ? '#d8452e' : '#e8913a';
      ell(c, x + p[0] * s, y + p[1] * s, p[2] * s, p[2] * s);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      ell(c, x + (p[0] - 1.8) * s, y + (p[1] - 1.8) * s, p[2] * 0.28 * s, p[2] * 0.34 * s, -0.5);
    });
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 1 * s;
    c.beginPath(); c.moveTo(x, y - 18 * s); c.lineTo(x + 1.6 * s, y - 22 * s); c.stroke();
    c.fillStyle = '#4f9450';
    ell(c, x + 5 * s, y - 22.5 * s, 3.6 * s, 1.9 * s, -0.4);
  };

  D.applecrate = function (c, x, y, s, t) {
    c.fillStyle = '#8a6438';
    GG.roundRect(c, x - 13 * s, y - 13 * s, 26 * s, 13 * s, 1.6 * s); c.fill();
    c.fillStyle = '#a07a4c';
    for (var i = 0; i < 3; i++) c.fillRect(x - 12 * s, y - 12 * s + i * 4 * s, 24 * s, 2.4 * s);
    c.fillStyle = '#6b4a2c';
    c.fillRect(x - 13 * s, y - 13.5 * s, 2.2 * s, 13.5 * s);
    c.fillRect(x + 10.8 * s, y - 13.5 * s, 2.2 * s, 13.5 * s);
    [[-7, -16.5], [0, -18.5], [7, -16.5]].forEach(function (p, k) {
      c.fillStyle = k === 1 ? '#7d1412' : '#b5241f';
      ell(c, x + p[0] * s, y + p[1] * s, 4.6 * s, 4.6 * s);
      c.fillStyle = 'rgba(255,255,255,0.32)';
      ell(c, x + (p[0] - 1.6) * s, y + (p[1] - 1.8) * s, 1.5 * s, 1.8 * s, -0.5);
    });
  };

  D.blossomspray = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.1) * 1.4;
    c.strokeStyle = '#6b4a2c'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y); c.quadraticCurveTo(x + 3 * s, y - 10 * s, x + (6 + sway) * s, y - 21 * s);
    c.stroke();
    c.beginPath();
    c.moveTo(x + 1.4 * s, y - 6 * s);
    c.quadraticCurveTo(x - 5 * s, y - 13 * s, x - (9 - sway) * s, y - 18 * s);
    c.stroke();
    [[6, -22], [-9, -19], [1, -13], [-2, -24], [10, -11]].forEach(function (p, i) {
      var px = x + (p[0] + sway * (i % 2 ? 0.4 : -0.4)) * s, py = y + p[1] * s, pr = 3.1 * s;
      c.fillStyle = i % 2 ? '#ffe6ee' : '#ffffff';
      for (var k = 0; k < 5; k++) {
        var a = k / 5 * Math.PI * 2 + i;
        ell(c, px + Math.cos(a) * pr, py + Math.sin(a) * pr, pr * 0.74, pr * 0.62, a);
      }
      c.fillStyle = '#f7c948'; ell(c, px, py, pr * 0.36, pr * 0.36);
    });
  };

  D.cherrybough = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.4) * 1.1;
    c.strokeStyle = '#6b4a2c'; c.lineWidth = 1.8 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 13 * s, y - 24 * s);
    c.quadraticCurveTo(x, y - 20 * s, x + 13 * s, y - 25 * s);
    c.stroke();
    [[-8, 1], [0.5, -1], [8, 0.6]].forEach(function (p) {
      var bx = x + (p[0] + sway * p[1]) * s;
      c.strokeStyle = '#7a9a4a'; c.lineWidth = 1 * s;
      c.beginPath(); c.moveTo(x + p[0] * s, y - 22 * s); c.lineTo(bx, y - 8 * s); c.stroke();
      c.fillStyle = '#4a0a16'; ell(c, bx, y - 4.6 * s, 4.4 * s, 4.4 * s);
      c.fillStyle = '#7d1224'; ell(c, bx - 0.5 * s, y - 5.2 * s, 3.7 * s, 3.6 * s);
      c.fillStyle = 'rgba(255,255,255,0.45)';
      ell(c, bx - 1.5 * s, y - 6.4 * s, 1.2 * s, 1.5 * s, -0.5);
    });
    c.fillStyle = '#4f9450';
    ell(c, x - 5 * s, y - 27 * s, 4.4 * s, 2 * s, -0.5);
    ell(c, x + 6 * s, y - 28 * s, 4 * s, 1.9 * s, 0.4);
  };

  D.pearbasket = function (c, x, y, s, t) {
    c.fillStyle = '#c49a5e';
    c.beginPath();
    c.moveTo(x - 12 * s, y - 13 * s);
    c.quadraticCurveTo(x - 10 * s, y, x, y);
    c.quadraticCurveTo(x + 10 * s, y, x + 12 * s, y - 13 * s);
    c.closePath(); c.fill();
    c.strokeStyle = '#9a7442'; c.lineWidth = 0.8 * s;
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * 4.4 * s, y - 13 * s);
      c.lineTo(x + i * 3.4 * s, y - 1 * s);
      c.stroke();
    }
    c.lineWidth = 1.4 * s;
    c.beginPath();
    c.moveTo(x - 11 * s, y - 13 * s);
    c.quadraticCurveTo(x, y - 27 * s, x + 11 * s, y - 13 * s);
    c.stroke();
    [[-5, -17], [5, -18]].forEach(function (p) {
      c.fillStyle = '#8fa63a';
      ell(c, x + p[0] * s, y + (p[1] + 2) * s, 3.8 * s, 4.8 * s);
      ell(c, x + p[0] * s, y + (p[1] - 2.6) * s, 2.4 * s, 2.8 * s);
      c.fillStyle = '#b8cc52';
      ell(c, x + (p[0] - 0.6) * s, y + (p[1] + 1.6) * s, 3 * s, 4 * s);
    });
  };

  D.berrybowl = function (c, x, y, s, t) {
    c.fillStyle = '#7a8fa8';
    c.beginPath();
    c.moveTo(x - 11 * s, y - 10 * s);
    c.quadraticCurveTo(x - 9 * s, y, x, y);
    c.quadraticCurveTo(x + 9 * s, y, x + 11 * s, y - 10 * s);
    c.closePath(); c.fill();
    c.fillStyle = '#93a8c0'; ell(c, x, y - 10 * s, 11 * s, 3 * s);
    var rnd = GG.mulberry32(4242);
    for (var i = 0; i < 11; i++) {
      var bx = x + (rnd() - 0.5) * 17 * s, by = y - (11 + rnd() * 3.4) * s;
      c.fillStyle = '#2e2752'; ell(c, bx, by, 2.4 * s, 2.4 * s);
      c.fillStyle = '#4a3f7a'; ell(c, bx - 0.3 * s, by - 0.4 * s, 1.9 * s, 1.9 * s);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      ell(c, bx - 0.8 * s, by - 0.9 * s, 0.7 * s, 0.8 * s, -0.5);
    }
  };

  D.chokespray = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.2) * 0.9;
    for (var b = -1; b <= 1; b += 2) {
      c.strokeStyle = '#6a7a3a'; c.lineWidth = 1.2 * s; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x + b * 3 * s, y - 25 * s);
      c.quadraticCurveTo(x + b * (5 + sway) * s, y - 12 * s, x + b * (6 + sway) * s, y - 1 * s);
      c.stroke();
      for (var i = 0; i < 7; i++) {
        var f = i / 6;
        var yy = y - (23 - f * 21) * s;
        var xx = x + b * (3.4 + f * 2.6 + sway * f) * s + (i % 2 ? 1.8 * s : -1.8 * s);
        var rr = (2.3 - f * 0.6) * s;
        c.fillStyle = '#20080f'; ell(c, xx, yy, rr, rr);
        c.fillStyle = '#3a1020'; ell(c, xx - rr * 0.18, yy - rr * 0.22, rr * 0.78, rr * 0.78);
      }
    }
    c.fillStyle = '#6a8f5a';
    ell(c, x - 7 * s, y - 26 * s, 4.4 * s, 2 * s, -0.5);
    ell(c, x + 7 * s, y - 27 * s, 4.4 * s, 2 * s, 0.5);
  };

  D.hipring = function (c, x, y, s, t) {
    var cy = y - 13 * s, R = 9.5 * s;
    c.strokeStyle = '#8a7a4a'; c.lineWidth = 1.8 * s;
    c.beginPath(); c.arc(x, cy, R, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#6a8f5a'; c.lineWidth = 0.9 * s;
    for (var k = 0; k < 10; k++) {
      var a = k / 10 * Math.PI * 2;
      c.beginPath();
      c.moveTo(x + Math.cos(a) * R, cy + Math.sin(a) * R);
      c.lineTo(x + Math.cos(a) * R * 1.38, cy + Math.sin(a) * R * 1.38);
      c.stroke();
    }
    for (var i = 0; i < 6; i++) {
      var ang = i / 6 * Math.PI * 2 + 0.3;
      var hx = x + Math.cos(ang) * R, hy = cy + Math.sin(ang) * R;
      c.fillStyle = '#a32f18'; ell(c, hx, hy, 3.2 * s, 3.4 * s);
      c.fillStyle = '#d84a2a'; ell(c, hx - 0.4 * s, hy - 0.5 * s, 2.6 * s, 2.7 * s);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      ell(c, hx - 1 * s, hy - 1.2 * s, 0.85 * s, 1 * s, -0.5);
    }
  };

  D.currantsprig = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.5) * 0.9;
    c.strokeStyle = '#7a6a52'; c.lineWidth = 1.4 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + 1.4 * s, y - 12 * s, x + (0.8 + sway) * s, y - 24 * s);
    c.stroke();
    c.fillStyle = '#7a9a68';
    [[-7, -13, -0.6], [7, -10, 0.5], [-6, -4, -0.3]].forEach(function (p) {
      c.save(); c.translate(x + p[0] * s, y + p[1] * s); c.rotate(p[2]); c.scale(s, s);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(3, -3.4, 6.8, 0);
      c.quadraticCurveTo(3, 3.4, 0, 0);
      c.closePath(); c.fill();
      c.restore();
    });
    for (var i = 0; i < 5; i++) {
      var ang = i / 5 * Math.PI * 2;
      var bx = x + (0.8 + sway) * s + Math.cos(ang) * 4.2 * s;
      var by = y - 21 * s + Math.sin(ang) * 3.8 * s;
      c.fillStyle = '#b03828'; ell(c, bx, by, 2.7 * s, 2.7 * s);
      c.fillStyle = '#e05a4a'; ell(c, bx - 0.4 * s, by - 0.45 * s, 2.2 * s, 2.2 * s);
      c.fillStyle = 'rgba(255,255,255,0.5)';
      ell(c, bx - 0.9 * s, by - 1 * s, 0.8 * s, 0.9 * s, -0.5);
    }
  };

  D.snowsprig = function (c, x, y, s, t) {
    c.strokeStyle = '#9a8f7a'; c.lineWidth = 1.4 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 1.4 * s, y);
    c.quadraticCurveTo(x + 0.8 * s, y - 12 * s, x + 2.4 * s, y - 22 * s);
    c.stroke();
    c.beginPath();
    c.moveTo(x, y - 8 * s);
    c.quadraticCurveTo(x - 5 * s, y - 13 * s, x - 9 * s, y - 18 * s);
    c.stroke();
    [[2.4, -23], [-9, -19], [6, -13], [-3, -13]].forEach(function (p, i) {
      var px = x + p[0] * s, py = y + p[1] * s, pr = (3.1 - (i % 2) * 0.5) * s;
      for (var k = 0; k < 3; k++) {
        var a = k / 3 * Math.PI * 2 + i;
        var qx = px + Math.cos(a) * pr * 0.6, qy = py + Math.sin(a) * pr * 0.6;
        c.fillStyle = '#d8d4cc'; ell(c, qx, qy, pr * 0.74, pr * 0.74);
        c.fillStyle = '#f4f2ee'; ell(c, qx - pr * 0.14, qy - pr * 0.16, pr * 0.6, pr * 0.6);
      }
    });
    c.fillStyle = '#7a9a68';
    ell(c, x - 1 * s, y - 4 * s, 3.8 * s, 1.7 * s, -0.4);
  };

  /* ---------- v1.13: brought back from the berry rows in the orchard ----------
     Same rule as the ones above: picked, never bought. (x, y) is where it sits
     on the ground and s is the scale, about 26 * s tall. */

  /* a bundle of drupelets — a blackberry or a raspberry is never one berry */
  function drupeClump(c, bx, by, rr, skin, skin2, hollow) {
    c.fillStyle = GG.shade(skin2, -0.32);
    ell(c, bx, by, rr * 1.55, rr * 1.85);
    [[-0.78, -1.0], [0.78, -1.0], [-0.9, 0.1], [0.9, 0.1], [0, -0.46], [0, 1.16]]
      .forEach(function (q) {
        c.fillStyle = skin2; ell(c, bx + q[0] * rr, by + q[1] * rr, rr * 0.74, rr * 0.74);
        c.fillStyle = skin; ell(c, bx + (q[0] - 0.16) * rr, by + (q[1] - 0.2) * rr, rr * 0.54, rr * 0.54);
        c.fillStyle = 'rgba(255,255,255,0.5)';
        ell(c, bx + (q[0] - 0.3) * rr, by + (q[1] - 0.36) * rr, rr * 0.2, rr * 0.23, -0.5);
      });
    if (hollow) {
      /* the hole a raspberry keeps, because it left its core on the cane */
      c.fillStyle = 'rgba(60,10,18,0.72)';
      ell(c, bx, by - rr * 0.1, rr * 0.62, rr * 0.5);
      c.fillStyle = 'rgba(255,225,225,0.35)';
      ell(c, bx, by - rr * 0.32, rr * 0.5, rr * 0.22);
    }
  }

  D.bramblearch = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.1) * 1.2;
    c.strokeStyle = '#6d5a3a'; c.lineWidth = 2.2 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 12 * s, y);
    c.bezierCurveTo(x - 14 * s, y - 20 * s, x + 3 * s, y - 28 * s,
      x + (13 + sway) * s, y - 14 * s);
    c.stroke();
    /* the prickles curve backwards, which is how they catch you */
    c.strokeStyle = '#d3c095'; c.lineWidth = 1.2 * s;
    [[-12.8, -7, 1], [-10.4, -18, 1], [-1, -26, -1], [8, -24.5, -1]].forEach(function (p) {
      c.beginPath();
      c.moveTo(x + p[0] * s, y + p[1] * s);
      c.quadraticCurveTo(x + (p[0] + p[2] * 3.2) * s, y + (p[1] + 1.6) * s,
        x + (p[0] + p[2] * 3.6) * s, y + (p[1] + 5) * s);
      c.stroke();
    });
    /* five leaflets on one stalk: the invader's field mark */
    for (var i = 0; i < 5; i++) {
      c.save();
      c.translate(x - 12.6 * s, y - 13 * s);
      c.rotate(Math.PI + 0.92 - i * 0.46);
      c.fillStyle = i % 2 ? '#4f7a45' : '#59864d';
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(4 * s, -3.1 * s, 9 * s, 0);
      c.quadraticCurveTo(4 * s, 3.1 * s, 0, 0);
      c.closePath(); c.fill();
      c.restore();
    }
    drupeClump(c, x + (10 + sway) * s, y - 11 * s, 2.5 * s, '#3d2545', '#180d20');
    drupeClump(c, x + 2 * s, y - 21 * s, 2.2 * s, '#3d2545', '#180d20');
    drupeClump(c, x - 5.6 * s, y - 24 * s, 2 * s, '#d8464e', '#a01e2a');
  };

  D.berrypunnet = function (c, x, y, s, t) {
    c.fillStyle = '#c9a469';
    c.beginPath();
    c.moveTo(x - 13 * s, y - 13 * s);
    c.lineTo(x - 10 * s, y);
    c.lineTo(x + 10 * s, y);
    c.lineTo(x + 13 * s, y - 13 * s);
    c.closePath(); c.fill();
    c.strokeStyle = '#a3814c'; c.lineWidth = 0.9 * s;
    for (var i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(x + i * 5 * s, y - 12.6 * s);
      c.lineTo(x + i * 3.9 * s, y - 0.6 * s);
      c.stroke();
    }
    c.fillStyle = '#b8935c';
    GG.roundRect(c, x - 13.6 * s, y - 15.4 * s, 27.2 * s, 3 * s, 1.2 * s); c.fill();
    drupeClump(c, x - 6.4 * s, y - 18 * s, 2.5 * s, '#dc3a4e', '#9e1c30');
    drupeClump(c, x + 6.6 * s, y - 17.4 * s, 2.4 * s, '#dc3a4e', '#9e1c30');
    /* two tipped over, so you can see they are hollow */
    drupeClump(c, x - 0.4 * s, y - 23.4 * s, 2.5 * s, '#dc3a4e', '#9e1c30', true);
    drupeClump(c, x + 8.6 * s, y - 23 * s, 2.1 * s, '#dc3a4e', '#9e1c30', true);
  };

  D.strawpatch = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.0) * 0.8;
    /* the runner: a red string crawling off to start a whole new plant */
    c.strokeStyle = '#b24a3a'; c.lineWidth = 1.2 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x + 2 * s, y - 3 * s);
    c.quadraticCurveTo(x + 14 * s, y - 1 * s, x + 21 * s, y - 4 * s);
    c.stroke();
    function trio(cx0, cy0, L, rot) {
      for (var i = -1; i <= 1; i++) {
        c.save(); c.translate(cx0, cy0); c.rotate(rot + i * 0.72);
        c.fillStyle = i === 0 ? '#4f9450' : '#448a47';
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(L * 0.42, -L * 0.38, L, 0);
        c.quadraticCurveTo(L * 0.42, L * 0.38, 0, 0);
        c.closePath(); c.fill();
        c.strokeStyle = '#2f6b33'; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(0.4, 0); c.lineTo(L * 0.9, 0); c.stroke();
        c.restore();
      }
    }
    trio(x - 3 * s, y - 4 * s, 11 * s, -2.5);
    trio(x + 3 * s, y - 4 * s, 11 * s, -0.7);
    trio(x - 1 * s, y - 5 * s, 10 * s, -1.6);
    trio(x + 21 * s, y - 4 * s, 5.5 * s, -1.7);   /* the baby plant */
    /* a white flower with a yellow middle */
    var fx = x - 9 * s, fy = y - 17 * s;
    c.fillStyle = '#ffffff';
    for (var k = 0; k < 5; k++) {
      var a = k / 5 * Math.PI * 2;
      ell(c, fx + Math.cos(a) * 2.6 * s, fy + Math.sin(a) * 2.6 * s, 2.2 * s, 2 * s, a);
    }
    c.fillStyle = '#f7c948'; ell(c, fx, fy, 1.5 * s, 1.5 * s);
    /* two berries hanging just off the ground */
    function berry(bx, by, w, h) {
      c.fillStyle = '#ae1a20';
      c.beginPath();
      c.moveTo(bx, by - h);
      c.bezierCurveTo(bx - w * 1.15, by - h * 1.15, bx - w * 1.1, by + h * 0.35, bx, by + h);
      c.bezierCurveTo(bx + w * 1.1, by + h * 0.35, bx + w * 1.15, by - h * 1.15, bx, by - h);
      c.closePath(); c.fill();
      c.fillStyle = '#e8332e'; ell(c, bx - w * 0.1, by - h * 0.05, w * 0.78, h * 0.82);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      ell(c, bx - w * 0.42, by - h * 0.4, w * 0.22, h * 0.32, -0.4);
      c.fillStyle = '#f4dc84';
      for (var r = 0; r < 4; r++) {
        for (var q = 0; q < 3; q++) {
          ell(c, bx + (q - 1) * w * 0.52 + (r % 2 ? w * 0.26 : 0),
            by - h * 0.62 + r * h * 0.46, w * 0.09, h * 0.085, 0.2);
        }
      }
      c.fillStyle = '#4f9450';
      for (var m = 0; m < 5; m++) {
        var ang = -Math.PI + 0.35 + m * (Math.PI - 0.7) / 4;
        ell(c, bx + Math.cos(ang) * w * 0.5, by - h + Math.sin(ang) * h * 0.2,
          w * 0.5, h * 0.16, ang * 0.5);
      }
    }
    berry(x + 6 * s + sway * 0.5, y - 9 * s, 5 * s, 6.4 * s);
    berry(x - 6.5 * s, y - 7.5 * s, 4 * s, 5.2 * s);
  };

  D.redstrig = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.4) * 1;
    c.strokeStyle = '#7a6a52'; c.lineWidth = 1.8 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 13 * s, y - 26 * s);
    c.quadraticCurveTo(x, y - 20 * s, x + 13 * s, y - 25 * s);
    c.stroke();
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x - 2 * s, y - 14 * s, x - 1 * s, y - 22.5 * s);
    c.stroke();
    /* maple-shaped leaves, and not a thorn anywhere on it */
    function lobeLeaf(cx0, cy0, R, col) {
      c.fillStyle = col;
      c.beginPath();
      for (var i = 0; i <= 48; i++) {
        var a = (i / 48) * Math.PI * 2 - Math.PI / 2;
        var rr = R * (0.56 + 0.44 * Math.abs(Math.cos(a * 2.5)));
        var px = cx0 + Math.cos(a) * rr, py = cy0 + Math.sin(a) * rr;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.fill();
    }
    lobeLeaf(x - 12 * s, y - 22 * s, 6 * s, '#5f9450');
    lobeLeaf(x + 12 * s, y - 21 * s, 5.2 * s, '#528a46');
    /* two strigs, dangling like tiny bunches of grapes */
    [[-5.5, 1], [5, 0.7]].forEach(function (g, gi) {
      var sx0 = x + g[0] * s;
      c.strokeStyle = '#8a9a52'; c.lineWidth = 1 * s;
      c.beginPath();
      c.moveTo(sx0, y - 23 * s);
      c.quadraticCurveTo(sx0 + sway * g[1] * s, y - 14 * s, sx0 + sway * g[1] * 1.6 * s, y - 3 * s);
      c.stroke();
      for (var i = 0; i < 7; i++) {
        var f = i / 6;
        var px0 = sx0 + sway * g[1] * 1.6 * s * f * f;
        var py0 = y - (23 - f * 20) * s;
        var bx = px0 + (i % 2 ? 1 : -1) * (2.9 - f * 0.8) * s;
        var by = py0 + 1.4 * s;
        var rr = (2.7 - f * 0.7) * s;
        c.strokeStyle = '#8a9a52'; c.lineWidth = 0.6 * s;
        c.beginPath(); c.moveTo(px0, py0); c.lineTo(bx, by - rr * 0.8); c.stroke();
        c.fillStyle = '#a4151c'; ell(c, bx, by, rr, rr);
        c.fillStyle = '#e42f33'; ell(c, bx, by, rr * 0.84, rr * 0.84);
        c.fillStyle = '#f56a5c'; ell(c, bx - rr * 0.1, by + rr * 0.12, rr * 0.48, rr * 0.48);
        c.fillStyle = 'rgba(110,16,20,0.5)';
        ell(c, bx - rr * 0.26, by + rr * 0.06, rr * 0.16, rr * 0.22, 0.4);
        c.fillStyle = 'rgba(255,255,255,0.6)';
        ell(c, bx - rr * 0.34, by - rr * 0.4, rr * 0.26, rr * 0.3, -0.5);
      }
    });
  };

  D.goosebranch = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.0) * 0.8;
    c.strokeStyle = '#7a6a52'; c.lineWidth = 2 * s; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 14 * s, y - 12 * s);
    c.quadraticCurveTo(x - 4 * s, y - 27 * s, x + 14 * s, y - 20 * s);
    c.stroke();
    c.lineWidth = 1.6 * s;
    c.beginPath();
    c.moveTo(x - 3 * s, y);
    c.quadraticCurveTo(x - 6 * s, y - 12 * s, x - 9 * s, y - 20 * s);
    c.stroke();
    /* a stiff spine beside every single leaf: this is the careful bit */
    var nodes = [[-10, -19], [-1, -25], [8, -23.5]];
    nodes.forEach(function (p, i) {
      c.strokeStyle = '#e4d8a8'; c.lineWidth = 1.2 * s;
      for (var k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(x + p[0] * s, y + p[1] * s);
        c.lineTo(x + (p[0] + k * 3.2) * s, y + (p[1] - 4.4) * s);
        c.stroke();
      }
      c.save();
      c.translate(x + p[0] * s, y + p[1] * s);
      c.rotate(i === 2 ? -0.5 : Math.PI + 0.5);
      c.fillStyle = '#5f8f4a';
      c.beginPath();
      for (var q = 0; q <= 40; q++) {
        var a = (q / 40) * Math.PI * 2 - Math.PI / 2;
        var rr = 4.6 * s * (0.58 + 0.42 * Math.abs(Math.cos(a * 2.5)));
        var px = 4.6 * s + Math.cos(a) * rr, py = Math.sin(a) * rr;
        if (q === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.fill();
      c.restore();
    });
    /* the fruit: singly, or in twos, on very short stalks */
    function goose(bx, by, rx, ry) {
      c.strokeStyle = '#8a9a52'; c.lineWidth = 0.9 * s;
      c.beginPath(); c.moveTo(bx, by - ry - 3.4 * s); c.lineTo(bx, by - ry * 0.8); c.stroke();
      c.fillStyle = '#93b34a'; ell(c, bx, by, rx, ry);
      c.fillStyle = '#c9dc74'; ell(c, bx, by, rx * 0.86, ry * 0.86);
      c.fillStyle = '#e2ee9e'; ell(c, bx, by + ry * 0.14, rx * 0.58, ry * 0.56);
      c.strokeStyle = 'rgba(104,132,44,0.6)'; c.lineWidth = 0.7 * s;
      for (var v = -2; v <= 2; v++) {
        c.beginPath();
        c.moveTo(bx + v * rx * 0.13, by - ry * 0.9);
        c.quadraticCurveTo(bx + v * rx * 0.55, by, bx + v * rx * 0.15, by + ry * 0.9);
        c.stroke();
      }
      c.fillStyle = 'rgba(126,140,54,0.6)';
      ell(c, bx - rx * 0.24, by + ry * 0.1, rx * 0.14, ry * 0.18, 0.4);
      ell(c, bx + rx * 0.2, by - ry * 0.06, rx * 0.13, ry * 0.17, -0.3);
      c.strokeStyle = '#9a8f66'; c.lineWidth = 0.7 * s;
      for (var k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(bx + k * 0.5 * s, by + ry * 0.92);
        c.lineTo(bx + k * 1.6 * s, by + ry * 1.34);
        c.stroke();
      }
      c.fillStyle = 'rgba(255,255,255,0.5)';
      ell(c, bx - rx * 0.38, by - ry * 0.42, rx * 0.24, ry * 0.28, -0.5);
    }
    goose(x - 9 * s + sway * 0.4, y - 11 * s, 5.2 * s, 4.9 * s);
    goose(x + 1.5 * s, y - 15 * s, 4.2 * s, 4 * s);
    goose(x + 9.5 * s - sway * 0.4, y - 13.5 * s, 4.8 * s, 4.6 * s);
  };

  D.nightvine = function (c, x, y, s, t) {
    var sway = Math.sin((t || 0) * 1.2) * 1;
    /* a stake with the vine twining up it, because nightshade climbs */
    c.strokeStyle = '#8a7856'; c.lineWidth = 2.2 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 7 * s, y); c.lineTo(x - 5 * s, y - 27 * s); c.stroke();
    c.strokeStyle = '#5f7a44'; c.lineWidth = 1.5 * s;
    c.beginPath();
    c.moveTo(x - 7 * s, y - 1 * s);
    for (var i = 1; i <= 5; i++) {
      var yy = y - (i * 5.2) * s;
      c.quadraticCurveTo(x + (i % 2 ? 1 : -11) * s, yy + 2.6 * s, x - 6 * s, yy);
    }
    c.stroke();
    c.beginPath();
    c.moveTo(x - 6 * s, y - 24 * s);
    c.quadraticCurveTo(x + 2 * s, y - 25 * s, x + (7 + sway) * s, y - 19 * s);
    c.stroke();
    /* a leaf with the little ear-shaped lobes at its base */
    function earLeaf(cx0, cy0, L, rot) {
      c.save(); c.translate(cx0, cy0); c.rotate(rot);
      c.fillStyle = '#3f6f3c';
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(L * 0.4, -L * 0.4, L, 0);
      c.quadraticCurveTo(L * 0.4, L * 0.4, 0, 0);
      c.closePath(); c.fill();
      ell(c, L * 0.22, -L * 0.3, L * 0.22, L * 0.12, -0.55);
      ell(c, L * 0.22, L * 0.3, L * 0.22, L * 0.12, 0.55);
      c.strokeStyle = '#2d5a2c'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(L * 0.1, 0); c.lineTo(L * 0.92, 0); c.stroke();
      c.restore();
    }
    earLeaf(x - 5 * s, y - 20 * s, 12 * s, -2.7);
    earLeaf(x - 5 * s, y - 11 * s, 10 * s, 0.5);
    /* the purple star flower with its yellow beak */
    var fx = x - 13 * s, fy = y - 25 * s;
    c.fillStyle = '#7c4fbe';
    for (var k = 0; k < 5; k++) {
      var a = -Math.PI / 2 + k / 5 * Math.PI * 2;
      c.beginPath();
      c.moveTo(fx, fy);
      c.lineTo(fx + Math.cos(a - 0.34) * 3.4 * s, fy + Math.sin(a - 0.34) * 3.4 * s);
      c.lineTo(fx + Math.cos(a) * 5.4 * s, fy + Math.sin(a) * 5.4 * s);
      c.lineTo(fx + Math.cos(a + 0.34) * 3.4 * s, fy + Math.sin(a + 0.34) * 3.4 * s);
      c.closePath(); c.fill();
    }
    c.fillStyle = '#f2c62e'; ell(c, fx + 0.5 * s, fy + 0.8 * s, 1.5 * s, 2.4 * s, 0.3);
    /* one bunch, three colours at once — green, orange and red together */
    var mix = ['#d81f28', '#e2892a', '#7fae46', '#c41a24', '#8fbb4e', '#e08a2c'];
    var hub = [x + (7 + sway) * s, y - 19 * s];
    [[3.4, 2.6], [8.2, 0.6], [1.6, 7.4], [6.6, 8.4], [11, 5.2], [10.4, 10.6]]
      .forEach(function (p, i) {
        var bx = hub[0] + (p[0] - 6) * s, by = hub[1] + p[1] * s;
        c.strokeStyle = '#5f7a44'; c.lineWidth = 0.8 * s;
        c.beginPath(); c.moveTo(hub[0], hub[1]); c.lineTo(bx, by - 2.6 * s); c.stroke();
        c.fillStyle = GG.shade(mix[i], -0.32); ell(c, bx, by, 2.7 * s, 3.3 * s);
        c.fillStyle = mix[i]; ell(c, bx - 0.3 * s, by - 0.4 * s, 2.1 * s, 2.7 * s);
        c.fillStyle = 'rgba(255,255,255,0.55)';
        ell(c, bx - 1 * s, by - 1.5 * s, 0.7 * s, 0.9 * s, -0.5);
      });
  };

  GG.DECOR = [
    // --- for a terrarium (and the bank of a hybrid) ---
    { id: 'leaf', name: 'Big Leaf', price: 0, for: 'land' },
    { id: 'pebble', name: 'Smooth Pebble', price: 0, for: 'any' },
    { id: 'twig', name: 'Little Twig', price: 0, for: 'land' },
    { id: 'mushroom', name: 'Red Mushroom', price: 0, for: 'land' },
    { id: 'flower', name: 'Pink Flower', price: 40, for: 'land' },
    { id: 'bluebell', name: 'Bluebell', price: 60, for: 'land' },
    { id: 'fern', name: 'Curly Fern', price: 80, for: 'land' },
    { id: 'moss', name: 'Soft Moss', price: 90, for: 'land' },
    { id: 'toadstool', name: 'Purple Toadstool', price: 110, for: 'land' },
    { id: 'log', name: 'Mossy Log', price: 120, for: 'land' },
    { id: 'rock', name: 'Grey Rock', price: 120, for: 'any' },
    { id: 'pinecone', name: 'Pine Cone', price: 140, for: 'land' },
    { id: 'acorn', name: 'Acorn', price: 150, for: 'land' },
    { id: 'berries', name: 'Red Berries', price: 180, for: 'land' },
    { id: 'cattail', name: 'Cattails', price: 190, for: 'any' },
    { id: 'waterdish', name: 'Water Dish', price: 260, for: 'land' },
    { id: 'tinypond', name: 'Tiny Pond', price: 340, for: 'land' },
    { id: 'fairyhouse', name: 'Fairy House', price: 480, for: 'land' },

    // --- for a fish tank (and the pool of a hybrid) ---
    { id: 'seagrass', name: 'Sea Grass', price: 50, for: 'water' },
    { id: 'shell', name: 'Sea Shell', price: 70, for: 'water' },
    { id: 'driftbranch', name: 'Driftwood Branch', price: 130, for: 'water' },
    { id: 'seastardeco', name: 'Sea Star', price: 160, for: 'water' },
    { id: 'coral', name: 'Coral Fan', price: 210, for: 'water' },
    { id: 'lilypaddeco', name: 'Water Lily', price: 240, for: 'water' },
    { id: 'anemonedeco', name: 'Anemone', price: 300, for: 'water' },
    { id: 'bubbler', name: 'Bubbler', price: 360, for: 'water' },
    { id: 'sandcastle', name: 'Sand Castle', price: 420, for: 'water' },
    { id: 'treasure', name: 'Treasure Chest', price: 650, for: 'water' },

    // --- for a garden habitat ---
    { id: 'feeder', name: 'Nectar Feeder', price: 120, for: 'habitat' },
    { id: 'foodbowl', name: 'Food Bowl', price: 130, for: 'habitat' },
    { id: 'lilylog', name: 'Frog Log', price: 160, for: 'habitat' },
    { id: 'basket', name: 'Cat Basket', price: 190, for: 'habitat' },
    { id: 'branch', name: 'Hanging Branch', price: 210, for: 'habitat' },
    { id: 'perch', name: 'Parrot Perch', price: 240, for: 'habitat' },
    { id: 'birdbath', name: 'Bird Bath', price: 280, for: 'habitat' },
    { id: 'batbox', name: 'Bat House', price: 320, for: 'habitat' },
    { id: 'scratchpost', name: 'Scratching Post', price: 360, for: 'habitat' },
    { id: 'kennel', name: 'Dog Kennel', price: 420, for: 'habitat' },
    { id: 'vine', name: 'Jungle Vine', price: 460, for: 'habitat' },

    // --- brought back from the orchard and the hills (picked, never bought) ---
    { id: 'appleplate', name: 'Plate of Apples', price: 0, for: 'land', fruit: 'gala' },
    { id: 'applecrate', name: 'Apple Crate', price: 0, for: 'land', fruit: 'red_delicious' },
    { id: 'blossomspray', name: 'Apple Blossom', price: 0, for: 'land', fruit: 'cosmic_crisp' },
    { id: 'cherrybough', name: 'Cherry Bough', price: 0, for: 'land', fruit: 'bing_cherry' },
    { id: 'pearbasket', name: 'Basket of Pears', price: 0, for: 'land', fruit: 'bartlett_pear' },
    { id: 'berrybowl', name: 'Bowl of Berries', price: 0, for: 'land', fruit: 'serviceberry' },
    { id: 'chokespray', name: 'Chokecherry Spray', price: 0, for: 'land', fruit: 'chokecherry' },
    { id: 'hipring', name: 'Rose Hip Ring', price: 0, for: 'land', fruit: 'rosehip' },
    { id: 'currantsprig', name: 'Currant Sprig', price: 0, for: 'land', fruit: 'wax_currant' },
    { id: 'snowsprig', name: 'Snowberry Sprig', price: 0, for: 'land', fruit: 'snowberry' },
    { id: 'bramblearch', name: 'Blackberry Bramble', price: 0, for: 'land', fruit: 'blackberry' },
    { id: 'berrypunnet', name: 'Punnet of Raspberries', price: 0, for: 'land', fruit: 'raspberry' },
    { id: 'strawpatch', name: 'Strawberry Patch', price: 0, for: 'land', fruit: 'strawberry' },
    { id: 'redstrig', name: 'String of Red Currants', price: 0, for: 'land', fruit: 'red_currant' },
    { id: 'goosebranch', name: 'Gooseberry Branch', price: 0, for: 'land', fruit: 'gooseberry' },
    { id: 'nightvine', name: 'Nightshade Vine', price: 0, for: 'land', fruit: 'nightshade' },

    // --- for anywhere ---
    { id: 'signplate', name: 'Name Plate', price: 300, for: 'any' },
    { id: 'bunting', name: 'Party Bunting', price: 380, for: 'any' },
    { id: 'rockpool', name: 'Rock Pool', price: 460, for: 'land' },
    { id: 'lantern', name: 'Tiny Lantern', price: 520, for: 'any' },
    { id: 'crystal', name: 'Glow Crystal', price: 700, for: 'any' }
  ];

  /* Can this decoration go in that kind of tank? */
  GG.decorFits = function (dec, tankType) {
    if (!dec) return false;
    var f = dec.for || 'any';
    if (f === 'any') return true;
    /* a garden habitat is outdoors, so it takes the outdoor things too */
    if (tankType === 'habitat') return f === 'habitat' || f === 'land';
    if (f === 'habitat') return false;
    if (tankType === 'hybrid') return true;
    if (tankType === 'aquarium') return f === 'water';
    return f === 'land';
  };
  GG.decorFor = function (tankType) {
    return GG.DECOR.filter(function (d) { return GG.decorFits(d, tankType); });
  };

  GG.DECOR_BY_ID = {};
  GG.DECOR.forEach(function (d) { GG.DECOR_BY_ID[d.id] = d; });

  /* Three kinds of tank, each with its own scenes. */
  /* `creatures` says which bugs a tank will take:
     land = the dry-land ones, water = the rock-pool ones (they need water to
     live in), any = both. A hybrid has a bank AND a pool, so it takes both. */
  /* How many tanks Guin may keep at once. */
  GG.MAX_TANKS = 10;

  GG.TANK_TYPES = [
    { id: 'terrarium', name: 'Terrarium', short: 'Terrarium', blurb: 'Dry land for bugs.',
      maxBugs: 8, maxFish: 0, maxDecor: 12, creatures: 'land' },
    { id: 'aquarium', name: 'Fish Tank', short: 'Fish Tank',
      blurb: 'All water, for fish and rock-pool creatures.',
      maxBugs: 8, maxFish: 6, maxDecor: 8, creatures: 'water' },
    { id: 'hybrid', name: 'Hybrid Tank', short: 'Hybrid', blurb: 'A grassy bank above, water below. Bugs and fish together.',
      maxBugs: 8, maxFish: 6, maxDecor: 10, creatures: 'any' },
    { id: 'habitat', name: 'Garden Habitat', short: 'Habitat',
      blurb: 'A corner of the garden your friends come and visit.',
      maxBugs: 0, maxFish: 0, maxFriends: 5, maxDecor: 12, creatures: 'none' }
  ];

  /* Can this creature live in that kind of tank? A sea star would dry out on a
     terrarium's grass, and a ladybug would drown in a fish tank. */
  GG.bugFitsTank = function (def, tankType) {
    if (!def) return false;
    var takes = (GG.TANK_TYPE_BY_ID[tankType] || {}).creatures || 'land';
    if (takes === 'any') return true;
    return GG.isAquaticBug(def) ? (takes === 'water') : (takes === 'land');
  };
  GG.tankNeededFor = function (def) {
    return GG.isAquaticBug(def) ? 'a fish tank or a hybrid tank' : 'a terrarium or a hybrid tank';
  };
  GG.TANK_TYPE_BY_ID = {};
  GG.TANK_TYPES.forEach(function (t) { GG.TANK_TYPE_BY_ID[t.id] = t; });

  GG.TANK_BGS = [
    // land scenes - terrariums
    { id: 'meadow', kind: 'land', name: 'Meadow', sky: '#cfeeff', ground: '#8ecf63', ground2: '#7cbd53', price: 0 },
    { id: 'forest', kind: 'land', name: 'Woodland', sky: '#cfe6cf', ground: '#4f9450', ground2: '#3f7f42', price: 0 },
    { id: 'night', kind: 'land', name: 'Moonlit', sky: '#2a3470', ground: '#3d5a3a', ground2: '#2f4a2e', price: 150 },
    { id: 'sunset', kind: 'land', name: 'Sunset', sky: '#ffc9a0', ground: '#9fbf63', ground2: '#87a852', price: 200 },
    { id: 'desert', kind: 'land', name: 'Sandy', sky: '#ffe9c4', ground: '#e3cf9a', ground2: '#d3bd85', price: 250 },
    { id: 'seashore', kind: 'land', name: 'Seashore', sky: '#bfe8ff', ground: '#efe0b4', ground2: '#e0cf9c', price: 280 },
    { id: 'hillside', kind: 'land', name: 'Hillside', sky: '#d8eeff', ground: '#c9c49a', ground2: '#b5b088', price: 300 },
    { id: 'blossom', kind: 'land', name: 'Blossom', sky: '#ffe4ef', ground: '#9fd06a', ground2: '#8abd57', price: 340 },
    // water scenes - fish tanks
    { id: 'clear', kind: 'water', name: 'Clear Water', sky: '#8fd3ea', deep: '#3f93b8', ground: '#e3d6a8', ground2: '#d2c28f', price: 0 },
    { id: 'planted', kind: 'water', name: 'Planted', sky: '#9fdcc8', deep: '#2f8a76', ground: '#d8cfa0', ground2: '#c2b98c', price: 90 },
    { id: 'rocky', kind: 'water', name: 'Rocky', sky: '#a8c8d8', deep: '#4a6b80', ground: '#b8b2a4', ground2: '#a09a8c', price: 140 },
    { id: 'deep', kind: 'water', name: 'Deep Blue', sky: '#4f7fc0', deep: '#1f3a6b', ground: '#8a8f9a', ground2: '#74798a', price: 200 },
    { id: 'reef', kind: 'water', name: 'Coral Reef', sky: '#9fe4ee', deep: '#2f7fa8', ground: '#f0dcbc', ground2: '#dfc79f', price: 260 },
    { id: 'tidepool', kind: 'water', name: 'Rock Pool', sky: '#b4e4e0', deep: '#4f938c', ground: '#b9b3a4', ground2: '#a29c8c', price: 300 },
    { id: 'stream', kind: 'water', name: 'Cold Stream', sky: '#c8f0f4', deep: '#5aa8c0', ground: '#c4bda8', ground2: '#aea792', price: 240 },
    // hybrid scenes
    { id: 'riverbank', kind: 'hybrid', name: 'Riverbank', sky: '#cfeeff', ground: '#8ecf63', ground2: '#6b8f4a', deep: '#3f93b8', water: '#8fd3ea', price: 0 },
    { id: 'woodpool', kind: 'hybrid', name: 'Woodland Pool', sky: '#cfe6cf', ground: '#4f9450', ground2: '#3a6b3c', deep: '#2f7a8a', water: '#7fc4d2', price: 120 },
    { id: 'nightpool', kind: 'hybrid', name: 'Moonlit Pool', sky: '#2a3470', ground: '#3d5a3a', ground2: '#2a3f28', deep: '#1f3a5b', water: '#4a6f9a', price: 200 },
    { id: 'shoreline', kind: 'hybrid', name: 'Shoreline', sky: '#bfe8ff', ground: '#efe0b4', ground2: '#d8c79a', deep: '#2f7fb4', water: '#8fd6e4', price: 240 },
    { id: 'rockyshelf', kind: 'hybrid', name: 'Rocky Shelf', sky: '#cfe4ee', ground: '#b9b3a4', ground2: '#a09a8a', deep: '#4f938c', water: '#a8dedb', price: 280 },
    { id: 'sunsetpool', kind: 'hybrid', name: 'Sunset Pool', sky: '#ffc9a0', ground: '#9fbf63', ground2: '#84a24f', deep: '#3f6f9a', water: '#8fb8d8', price: 320 },
    // habitat scenes - a corner of the garden, not a tank at all
    { id: 'backyard', kind: 'habitat', name: 'Back Garden', sky: '#cfeeff', ground: '#8ecf63', ground2: '#79b950', price: 0 },
    { id: 'porch', kind: 'habitat', name: 'Sunny Porch', sky: '#ffeccd', ground: '#c9a878', ground2: '#b08f60', price: 0 },
    { id: 'wildwood', kind: 'habitat', name: 'Wild Wood', sky: '#cfe6cf', ground: '#579a52', ground2: '#427f44', price: 160 },
    { id: 'dusk', kind: 'habitat', name: 'Dusk', sky: '#3a4478', ground: '#43603f', ground2: '#334c32', price: 240 },
    { id: 'pondside', kind: 'habitat', name: 'Pondside', sky: '#d8f0e8', ground: '#84c46a', ground2: '#5f9f58', price: 280 },
    { id: 'jungle', kind: 'habitat', name: 'Jungle', sky: '#bfe4a8', ground: '#3f8a44', ground2: '#2f6f38', price: 340 }
  ];
  GG.TANK_BY_ID = {};
  GG.TANK_BGS.forEach(function (b) { GG.TANK_BY_ID[b.id] = b; });

  GG.scenesFor = function (typeId) {
    var kind = typeId === 'aquarium' ? 'water'
      : (typeId === 'hybrid' ? 'hybrid' : (typeId === 'habitat' ? 'habitat' : 'land'));
    return GG.TANK_BGS.filter(function (b) { return b.kind === kind; });
  };
  GG.defaultSceneFor = function (typeId) { return GG.scenesFor(typeId)[0].id; };
})(window.GG = window.GG || {});
