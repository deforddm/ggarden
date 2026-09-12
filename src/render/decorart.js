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
  GG.TANK_TYPES = [
    { id: 'terrarium', name: 'Terrarium', short: 'Terrarium', blurb: 'Dry land for bugs.',
      maxBugs: 8, maxFish: 0, maxDecor: 12, creatures: 'land' },
    { id: 'aquarium', name: 'Fish Tank', short: 'Fish Tank',
      blurb: 'All water, for fish and rock-pool creatures.',
      maxBugs: 4, maxFish: 6, maxDecor: 8, creatures: 'water' },
    { id: 'hybrid', name: 'Hybrid Tank', short: 'Hybrid', blurb: 'A grassy bank above, water below. Bugs and fish together.',
      maxBugs: 5, maxFish: 4, maxDecor: 10, creatures: 'any' },
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
