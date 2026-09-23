/* Garden Friends, drawn in code like everything else.

   Twenty-nine base shapes, each taking its colours and markings from the
   animal's `art` block, so a whole roster comes out of a handful of
   drawings. The first six - hummingbird, frog, bat, dog, cat, parrot -
   came first; the twenty-three below them are the garden, the farm, the
   river and the five faraway friends.

   Unlike the bugs (which face UP) these are drawn in PROFILE facing RIGHT,
   because that is how you picture a dog or a parrot. About 40 pixels long at
   scale 1, centred on (0,0) with the feet at about y = +14. */
(function (GG) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath();
    c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2);
    c.fill();
  }
  function line(c, x1, y1, x2, y2, w, col) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }
  function curve(c, x1, y1, cx, cy, x2, y2, w, col) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(cx, cy, x2, y2); c.stroke();
  }
  function eye(c, x, y, r, col, shine) {
    c.fillStyle = col || '#2a2320';
    ell(c, x, y, r, r);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    ell(c, x + r * 0.32, y - r * 0.36, r * 0.34, r * 0.34);
    if (shine) { c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, x - r * 0.3, y + r * 0.3, r * 0.2, r * 0.2); }
  }

  /* One tapered tail feather, pointing along `ang` from (x,y). */
  function feather(c, x, y, ang, len, w0, w1, col) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    var nx = -sa, ny = ca;
    var tx = x + ca * len, ty = y + sa * len;
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x + nx * w0, y + ny * w0);
    c.quadraticCurveTo(x + ca * len * 0.55 + nx * w0 * 0.9,
      y + sa * len * 0.55 + ny * w0 * 0.9, tx + nx * w1, ty + ny * w1);
    c.lineTo(tx - nx * w1, ty - ny * w1);
    c.quadraticCurveTo(x + ca * len * 0.55 - nx * w0 * 0.9,
      y + sa * len * 0.55 - ny * w0 * 0.9, x - nx * w0, y - ny * w0);
    c.closePath(); c.fill();
  }

  var S = {};

  /* ---------------- hummingbird ---------------- */
  S.hummingbird = function (c, a, t) {
    var hover = Math.sin(t * 3.2) * 0.8;
    var blur = 0.35 + 0.35 * Math.abs(Math.sin(t * 26));
    c.save(); c.translate(0, hover);

    /* the wings are a blur, so they are drawn as soft fans */
    c.fillStyle = a.wing; c.globalAlpha = blur;
    for (var s = -1; s <= 1; s += 2) {
      c.save();
      c.translate(-1, -3);
      c.rotate(s * (0.5 + Math.sin(t * 26) * 0.55));
      ell(c, -7, 0, 9, 3.2);
      c.restore();
    }
    c.globalAlpha = 1;

    /* tail */
    c.fillStyle = a.accent;
    c.beginPath();
    c.moveTo(-6, -1);
    c.lineTo(-17, -4 + Math.sin(t * 3) * 0.8);
    c.lineTo(-16, 2);
    c.closePath(); c.fill();

    /* body */
    c.fillStyle = a.body;
    ell(c, -1, -1, 8.4, 6.2, -0.12);
    c.fillStyle = a.belly;
    ell(c, -1.4, 2, 6.4, 3.6, -0.1);

    /* head */
    c.fillStyle = a.crown || a.body;
    ell(c, 6, -4.6, 4.4, 4.2);
    /* the bright throat patch */
    c.fillStyle = a.throat;
    c.beginPath();
    c.moveTo(3.4, -2.2);
    c.quadraticCurveTo(8.4, -1.4, 8.2, -4.6);
    c.quadraticCurveTo(5.6, -5.6, 3.4, -2.2);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)';
    ell(c, 5.4, -3.6, 1.6, 0.9, -0.3);

    /* the long needle bill */
    line(c, 9.4, -4.4, 21, -5.4, 1.5, a.accent);

    eye(c, 7.4, -5.6, 1.35);

    /* the tiny feet it can barely stand on */
    c.strokeStyle = a.accent; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(-1, 4.6); c.lineTo(-1.6, 7); c.stroke();
    c.beginPath(); c.moveTo(1.6, 4.4); c.lineTo(1.4, 6.8); c.stroke();
    c.restore();
  };

  /* ---------------- frog ---------------- */
  S.frog = function (c, a, t) {
    var breathe = Math.sin(t * 1.6) * 0.5;
    /* back legs, folded up ready to spring */
    c.fillStyle = GG.shade(a.body, -0.12);
    ell(c, -8.6, 6.4, 7, 4.4, -0.2);
    c.fillStyle = a.body;
    ell(c, -6.4, 8.8, 5.2, 3, -0.1);
    c.strokeStyle = GG.shade(a.body, -0.25); c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-9, 10.4); c.lineTo(-14.4, 11.6); c.stroke();
    c.beginPath(); c.moveTo(-14.4, 11.6); c.lineTo(-17.4, 10.2); c.stroke();

    /* the wide sitting body */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-12, 8);
    c.quadraticCurveTo(-13.4, -2 - breathe, -3, -5 - breathe);
    c.quadraticCurveTo(9, -7 - breathe, 13.4, 1);
    c.quadraticCurveTo(15, 8, 8, 10.4);
    c.quadraticCurveTo(-2, 12, -12, 8);
    c.closePath(); c.fill();

    /* the pale throat and belly */
    c.fillStyle = a.belly;
    ell(c, 4, 7.4, 8.4, 3.4, -0.1);

    /* markings */
    if (a.pattern === 'mottle') {
      c.fillStyle = a.accent; c.globalAlpha = 0.5;
      var r = GG.mulberry32(7);
      for (var i = 0; i < 9; i++) ell(c, -10 + r() * 22, -3 + r() * 9, 1.8 + r() * 1.4, 1.2 + r());
      c.globalAlpha = 1;
    } else if (a.pattern === 'stripe') {
      c.fillStyle = a.accent; c.globalAlpha = 0.75;
      c.beginPath();
      c.moveTo(11.4, -1.4); c.quadraticCurveTo(2, -1, -9, 2.4);
      c.lineTo(-9, 4.6); c.quadraticCurveTo(2, 1.4, 11.6, 1);
      c.closePath(); c.fill();
      c.globalAlpha = 1;
    } else if (a.pattern === 'cross') {
      c.strokeStyle = a.accent; c.lineWidth = 1.6; c.globalAlpha = 0.8;
      c.beginPath(); c.moveTo(-7, -2.4); c.lineTo(3.4, 6); c.stroke();
      c.beginPath(); c.moveTo(2.6, -3); c.lineTo(-6.4, 5.6); c.stroke();
      c.globalAlpha = 1;
    }

    /* front legs propping it up */
    c.strokeStyle = GG.shade(a.body, -0.2); c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(8.4, 6); c.quadraticCurveTo(11.4, 9.4, 10.4, 12); c.stroke();
    c.beginPath(); c.moveTo(3, 7.4); c.quadraticCurveTo(5.4, 10.4, 4.4, 12.4); c.stroke();
    /* toes */
    c.lineWidth = 1;
    [10.4, 4.4].forEach(function (fx) {
      for (var k = -1; k <= 1; k++) {
        c.beginPath(); c.moveTo(fx, 12.2); c.lineTo(fx + k * 2.4 + 1, 13.6); c.stroke();
      }
    });
    if (a.pads) {
      c.fillStyle = GG.shade(a.body, 0.3);
      ell(c, 12.4, 13.4, 1.3, 1.1); ell(c, 6.4, 13.7, 1.3, 1.1);
    }

    /* the big domed eyes on top */
    c.fillStyle = GG.shade(a.body, 0.1);
    ell(c, 8.4, -6.4 - breathe, 3.4, 3);
    ell(c, 1.4, -6.8 - breathe, 3.2, 2.9);
    eye(c, 8.8, -6.6 - breathe, 2, a.eye);
    eye(c, 1.8, -7 - breathe, 1.9, a.eye);
    c.fillStyle = '#1e1a16';
    ell(c, 8.8, -6.6 - breathe, 0.7, 1.5);
    ell(c, 1.8, -7 - breathe, 0.7, 1.5);

    /* the wide smile */
    curve(c, 13.4, 1.6, 10, 4.6, 3.4, 4.4, 1, GG.shade(a.body, -0.35));
    /* the nostril */
    c.fillStyle = GG.shade(a.body, -0.4);
    ell(c, 12, -1.6, 0.5, 0.5);
  };

  /* ---------------- bat ---------------- */
  S.bat = function (c, a, t) {
    var flap = Math.sin(t * 7);
    /* wings: a thumb-strut and three fingers each side, skin stretched between */
    for (var s = -1; s <= 1; s += 2) {
      var lift = flap * (s > 0 ? 1 : 0.92);
      c.save();
      c.translate(s * 3, -1);
      c.rotate(s * 0.1 - lift * 0.22);
      c.fillStyle = a.wing;
      c.globalAlpha = 0.94;
      c.beginPath();
      c.moveTo(0, -1);
      c.quadraticCurveTo(s * 9, -8 - lift * 4, s * 19, -5 - lift * 5);
      c.quadraticCurveTo(s * 16, 1 - lift * 2, s * 17, 4 - lift * 3);
      c.quadraticCurveTo(s * 12, 1.5 - lift, s * 11, 6 - lift * 2);
      c.quadraticCurveTo(s * 8, 2.5, s * 6, 6.5 - lift);
      c.quadraticCurveTo(s * 4, 3, 0, 4);
      c.closePath(); c.fill();
      c.globalAlpha = 1;
      /* the finger bones */
      c.strokeStyle = GG.shade(a.wing, 0.2); c.lineWidth = 0.9;
      [[19, -5], [12, 1.5], [8, 2.5]].forEach(function (p, i) {
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(s * p[0] * 0.55, -3 - lift * 2 + i, s * p[0], p[1] - lift * (4 - i));
        c.stroke();
      });
      c.restore();
    }

    /* body */
    c.fillStyle = a.body;
    ell(c, 0, 2, 5, 7.4);
    c.fillStyle = GG.shade(a.body, 0.12);
    ell(c, 0, 3.4, 3.4, 5);
    if (a.frost) {
      c.fillStyle = 'rgba(255,255,255,0.4)';
      var r = GG.mulberry32(11);
      for (var i = 0; i < 12; i++) ell(c, -3.4 + r() * 7, -3 + r() * 11, 0.8, 0.6);
    }

    /* head and big listening ears */
    c.fillStyle = a.ear;
    c.beginPath(); c.moveTo(-3.4, -5.4); c.lineTo(-5.4, -12.4); c.lineTo(-0.4, -7.6); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(3.4, -5.4); c.lineTo(5.4, -12.4); c.lineTo(0.4, -7.6); c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.ear, -0.2);
    c.beginPath(); c.moveTo(-3, -6); c.lineTo(-4.4, -10.6); c.lineTo(-1.4, -7.4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(3, -6); c.lineTo(4.4, -10.6); c.lineTo(1.4, -7.4); c.closePath(); c.fill();

    c.fillStyle = GG.shade(a.body, 0.16);
    ell(c, 0, -4.4, 4.4, 4);
    c.fillStyle = a.accent;
    ell(c, 0, -2.4, 2.2, 1.8);
    eye(c, -1.8, -5.4, 1.15, '#241c14');
    eye(c, 1.8, -5.4, 1.15, '#241c14');
    /* little nose and a hint of teeth */
    c.fillStyle = '#3a2a20'; ell(c, 0, -2.6, 0.7, 0.55);
    c.fillStyle = '#fdfaf2';
    ell(c, -0.9, -1.1, 0.42, 0.6); ell(c, 0.9, -1.1, 0.42, 0.6);

    /* feet, for hanging up by */
    c.strokeStyle = a.accent; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-1.8, 8.6); c.lineTo(-2.8, 11.4); c.stroke();
    c.beginPath(); c.moveTo(1.8, 8.6); c.lineTo(2.8, 11.4); c.stroke();
  };

  /* ---------------- dog ---------------- */
  S.dog = function (c, a, t, gait) {
    gait = gait || 0;
    var trot = Math.min(1, gait);
    var wag = Math.sin(t * (6 + trot * 4)) * (0.45 + trot * 0.3);
    var pant = Math.sin(t * 3) * 0.4;
    var build = a.build || 'mid';
    var legLen = build === 'short' ? 4.2 : (build === 'big' ? 9 : 7.4);
    var bodyY = 14 - legLen;
    /* the two diagonal pairs swing opposite each other, the way dogs trot */
    var stepA = Math.sin(t * 8.6) * 3.4 * trot;
    var stepB = Math.sin(t * 8.6 + Math.PI) * 3.4 * trot;
    var bounce = Math.abs(Math.sin(t * 8.6)) * 0.9 * trot;

    /* tail: a husky's curls up over its back, everyone else's wags behind */
    c.save();
    if (a.curl) {
      c.translate(-11, bodyY - 5);
      c.rotate(-0.2 + wag * 0.5);
      c.strokeStyle = a.body; c.lineWidth = 4 * (a.fluffy ? 1.2 : 1); c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-7, -3, -8, -12, -1, -12.6);
      c.stroke();
      c.strokeStyle = (a.patch === 'ruff') ? a.accent : GG.shade(a.body, 0.18);
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-4.4, -12.2); c.quadraticCurveTo(-2.4, -13.4, -1, -12.6); c.stroke();
    } else {
      c.translate(-12, bodyY - 4);
      c.rotate(-0.7 + wag);
      c.strokeStyle = a.body; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, -4, -3, -9); c.stroke();
      c.strokeStyle = (a.patch === 'ruff') ? a.accent : GG.shade(a.body, 0.18);
      c.lineWidth = (a.patch === 'ruff') ? 3 : 1.6;
      c.beginPath(); c.moveTo(-2.7, -6.6); c.quadraticCurveTo(-3.4, -8, -3, -9); c.stroke();
    }
    c.restore();

    c.save();
    c.translate(0, -bounce);

    /* back legs then front legs, swinging as she trots */
    c.strokeStyle = GG.shade(a.body, -0.12); c.lineWidth = 3.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-8, bodyY + 1); c.lineTo(-8.4 + stepB, 13.4 + bounce); c.stroke();
    c.beginPath(); c.moveTo(7.4, bodyY + 1); c.lineTo(7.8 + stepA, 13.4 + bounce); c.stroke();
    c.strokeStyle = a.body; c.lineWidth = 3.4;
    c.beginPath(); c.moveTo(-5.4, bodyY + 1); c.lineTo(-5.8 + stepA, 13.4 + bounce); c.stroke();
    c.beginPath(); c.moveTo(10, bodyY + 1); c.lineTo(10.4 + stepB, 13.4 + bounce); c.stroke();
    /* paws */
    c.fillStyle = GG.shade(a.body, 0.2);
    [-8.4 + stepB, -5.8 + stepA, 7.8 + stepA, 10.4 + stepB].forEach(function (px) {
      ell(c, px, 13.8 + bounce, 2.2, 1.3);
    });

    /* body */
    c.fillStyle = a.body;
    GG.roundRect(c, -12, bodyY - 6.5, 24, 11, 5.5); c.fill();
    if (a.patch) {
      c.save();
      GG.roundRect(c, -12, bodyY - 6.5, 24, 11, 5.5); c.clip();
      c.fillStyle = a.accent;
      if (a.patch === 'ruff') {
        /* a collie: a white ruff round the shoulders and a white belly */
        c.beginPath();
        c.moveTo(4.4, bodyY - 7.5);
        c.quadraticCurveTo(9, bodyY - 1, 5.4, bodyY + 5.5);
        c.lineTo(13, bodyY + 5.5); c.lineTo(13, bodyY - 7.5);
        c.closePath(); c.fill();
        ell(c, -2, bodyY + 4.4, 8, 2.4);
      } else {
        /* a beagle: a dark saddle right over the back */
        c.beginPath();
        c.moveTo(-13, bodyY + 1.4);
        c.quadraticCurveTo(-6, bodyY + 0.4, 1, bodyY + 1.6);
        c.quadraticCurveTo(4.6, bodyY + 2, 5.6, bodyY - 1.4);
        c.lineTo(5.6, bodyY - 8); c.lineTo(-13, bodyY - 8);
        c.closePath(); c.fill();
      }
      c.restore();
    }
    /* the paler underside */
    c.fillStyle = a.muzzle; c.globalAlpha = 0.5;
    ell(c, 0, bodyY + 3.4, 9.4, 2.6);
    c.globalAlpha = 1;

    /* the collar, sitting round the neck with a little tag hanging off it */
    c.save();
    GG.roundRect(c, -12, bodyY - 6.5, 24, 11, 5.5); c.clip();
    c.fillStyle = a.collar;
    GG.roundRect(c, 8.2, bodyY - 6.8, 2.9, 11.6, 1.3); c.fill();
    c.restore();
    c.fillStyle = '#f0d060';
    ell(c, 9.7, bodyY + 3.6, 1.4, 1.4);
    c.fillStyle = GG.shade('#f0d060', -0.18);
    ell(c, 9.7, bodyY + 3.9, 0.6, 0.5);

    /* head */
    c.fillStyle = a.body;
    ell(c, 14.4, bodyY - 6.4, 6.4, 5.8);
    /* ears: floppy on a beagle, upright on a corgi */
    c.fillStyle = a.ear;
    if (a.ears === 'up') {
      /* a husky's ears: tall triangles, pale inside */
      c.beginPath();
      c.moveTo(11.2, bodyY - 9.6); c.lineTo(10.6, bodyY - 19.4); c.lineTo(15.6, bodyY - 11.2);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(16.4, bodyY - 10.4); c.lineTo(18.4, bodyY - 18.6); c.lineTo(19.6, bodyY - 9.8);
      c.closePath(); c.fill();
      c.fillStyle = GG.shade(a.muzzle, -0.12);
      c.beginPath();
      c.moveTo(11.8, bodyY - 10.6); c.lineTo(11.4, bodyY - 17.4); c.lineTo(14.6, bodyY - 11.6);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(16.8, bodyY - 11); c.lineTo(18.2, bodyY - 16.8); c.lineTo(18.8, bodyY - 10.4);
      c.closePath(); c.fill();
    } else if (build === 'short') {
      c.beginPath();
      c.moveTo(11.4, bodyY - 10); c.lineTo(10.4, bodyY - 17.4); c.lineTo(15.4, bodyY - 11.4);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(17, bodyY - 10.4); c.lineTo(18.4, bodyY - 17); c.lineTo(19.4, bodyY - 10);
      c.closePath(); c.fill();
    } else {
      c.beginPath();
      c.moveTo(11.4, bodyY - 9.6);
      c.quadraticCurveTo(7.4, bodyY - 6, 9.4, bodyY - 0.4);
      c.quadraticCurveTo(13.4, bodyY - 2.4, 13.8, bodyY - 8);
      c.closePath(); c.fill();
    }
    if (a.face === 'bandit') {
      /* Cookie's markings: a white face with a dark robber's mask over the
         eyes and a white stripe straight up the middle. */
      c.save();
      c.beginPath();
      c.ellipse(14.4, bodyY - 6.4, 6.4, 5.8, 0, 0, Math.PI * 2);
      c.clip();
      c.fillStyle = a.accent;
      c.beginPath();
      c.moveTo(9, bodyY - 4);
      c.quadraticCurveTo(15, bodyY - 7.4, 21.4, bodyY - 5.4);
      c.lineTo(21.4, bodyY + 1); c.lineTo(9, bodyY + 1);
      c.closePath(); c.fill();
      /* the blaze up the forehead */
      GG.roundRect(c, 15.4, bodyY - 13.4, 2.6, 9, 1.3); c.fill();
      c.restore();
    }

    /* muzzle */
    c.fillStyle = a.muzzle;
    ell(c, 19, bodyY - 4.4, 4.6, 3.4);
    c.fillStyle = a.nose;
    ell(c, 22.4, bodyY - 5.4, 1.7, 1.4);
    /* the happy open mouth, with the tongue hanging out of it */
    c.fillStyle = '#e88a94';
    c.beginPath();
    c.moveTo(19.6, bodyY - 3.4);
    c.quadraticCurveTo(21.6, bodyY - 2.4 + pant, 20.4, bodyY - 0.4 + pant);
    c.quadraticCurveTo(18.6, bodyY + 0.2 + pant, 18.4, bodyY - 2 + pant * 0.6);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade('#e88a94', -0.22); c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(19.6, bodyY - 3); c.lineTo(19.4, bodyY - 0.6 + pant); c.stroke();
    c.strokeStyle = GG.shade(a.nose, 0.2); c.lineWidth = 0.9;
    curve(c, 22, bodyY - 3.8, 20.4, bodyY - 2.4, 17.6, bodyY - 3, 0.9, GG.shade(a.nose, 0.2));
    eye(c, 16.4, bodyY - 7.6, 1.5, '#2f241c', true);
    if (a.patch === 'ruff') {
      /* the narrow white stripe down a collie's face */
      c.save();
      c.beginPath();
      c.ellipse(14.4, bodyY - 6.4, 6.4, 5.8, 0, 0, Math.PI * 2);
      c.clip();
      c.fillStyle = a.accent;
      GG.roundRect(c, 17.2, bodyY - 12.4, 1.8, 7.6, 0.9); c.fill();
      c.restore();
    }
    /* the eyebrow spot dogs so often have */
    if (a.patch && a.patch !== 'ruff') {
      c.fillStyle = 'rgba(255,255,255,0.55)';
      ell(c, 16.4, bodyY - 9.8, 1.5, 1);
    }
    c.restore();
  };

  /* ---------------- cat ---------------- */
  /* The head is the same whether she is sitting or walking, so it lives in
     its own function and gets moved into place. */
  function catHead(c, a, dx, dy) {
    c.save();
    c.translate(dx, dy);
    /* head */
      c.fillStyle = a.body;
      ell(c, 4.4, -8.4, 6.4, 5.6);
      /* ears */
      c.fillStyle = a.body;
      c.beginPath(); c.moveTo(-0.6, -11.4); c.lineTo(-1.4, -18); c.lineTo(4, -12.6); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(7.4, -12.4); c.lineTo(10.4, -17.6); c.lineTo(10.4, -11); c.closePath(); c.fill();
      c.fillStyle = a.pattern === 'point' ? a.accent : GG.shade(a.body, -0.15);
      c.beginPath(); c.moveTo(0.2, -12); c.lineTo(-0.4, -16.4); c.lineTo(3.4, -12.8); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(7.8, -12.6); c.lineTo(9.8, -16.2); c.lineTo(9.8, -11.6); c.closePath(); c.fill();
      if (a.fluffy) {
        c.strokeStyle = GG.shade(a.body, 0.25); c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(0.4, -15); c.lineTo(-1.4, -19.4); c.stroke();
        c.beginPath(); c.moveTo(9.4, -15); c.lineTo(11, -19); c.stroke();
      }

      /* the pale face of a colourpoint, or the tabby M */
      if (a.pattern === 'point') {
        c.fillStyle = a.accent;
        ell(c, 6.4, -7.4, 4.4, 3.8);
      } else if (a.pattern === 'tabby') {
        c.strokeStyle = a.accent; c.lineWidth = 1; c.globalAlpha = 0.8;
        c.beginPath(); c.moveTo(1.4, -12.6); c.lineTo(2.6, -10.6); c.stroke();
        c.beginPath(); c.moveTo(4, -13); c.lineTo(4.2, -10.8); c.stroke();
        c.beginPath(); c.moveTo(6.6, -12.6); c.lineTo(5.8, -10.6); c.stroke();
        c.globalAlpha = 1;
      } else if (a.pattern === 'calico') {
        c.fillStyle = a.accent;
        ell(c, 2.4, -10.4, 3.4, 3);
        c.fillStyle = '#e08a2f';
        ell(c, 8.4, -9, 2.6, 2.4);
      }
      c.fillStyle = a.belly;
      ell(c, 7.4, -5.6, 3.4, 2.4);

      eye(c, 3, -9.4, 1.7, a.eye, true);
      eye(c, 8, -9.2, 1.7, a.eye, true);
      c.fillStyle = '#1e1a16';
      ell(c, 3, -9.4, 0.6, 1.5);
      ell(c, 8, -9.2, 0.6, 1.5);
      c.fillStyle = a.nose;
      c.beginPath();
      c.moveTo(4.6, -6.4); c.lineTo(6.6, -6.4); c.lineTo(5.6, -5); c.closePath(); c.fill();
      curve(c, 5.6, -5, 4.4, -3.6, 3.2, -4.4, 0.7, GG.shade(a.accent, -0.1));
      curve(c, 5.6, -5, 6.8, -3.6, 8, -4.4, 0.7, GG.shade(a.accent, -0.1));
      /* whiskers */
      c.strokeStyle = 'rgba(255,255,255,0.72)'; c.lineWidth = 0.6;
      for (var w = -1; w <= 1; w++) {
        c.beginPath(); c.moveTo(7.4, -6 + w * 1.2); c.lineTo(15.4, -8 + w * 2.4); c.stroke();
        c.beginPath(); c.moveTo(3.4, -6 + w * 1.2); c.lineTo(-3.4, -8.4 + w * 2.4); c.stroke();
      }
    c.restore();
  }

  function catTailSit(c, a, swish, fluff) {
    c.strokeStyle = a.body;
    c.lineWidth = 3.4 * fluff; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-10, 4);
    c.quadraticCurveTo(-17 - swish, 1, -15 + swish * 2, -7 + swish);
    c.stroke();
    if (a.pattern === 'point') {
      c.strokeStyle = a.accent; c.lineWidth = 3.2 * fluff;
      c.beginPath();
      c.moveTo(-15.4 + swish * 1.4, -3 + swish * 0.6);
      c.quadraticCurveTo(-16.4 + swish * 2, -5.4, -15 + swish * 2, -7 + swish);
      c.stroke();
    }
  }

  /* Walking, the tail goes up like a flag with a little hook on the end. */
  function catTailWalk(c, a, swish, fluff, bodyY) {
    c.strokeStyle = a.body;
    c.lineWidth = 3.2 * fluff; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-9, bodyY + 1);
    c.quadraticCurveTo(-14 - swish, bodyY - 4, -12 + swish * 1.6, bodyY - 13 + swish);
    c.stroke();
    if (a.pattern === 'point') {
      c.strokeStyle = a.accent; c.lineWidth = 3 * fluff;
      c.beginPath();
      c.moveTo(-12.6 + swish, bodyY - 9);
      c.quadraticCurveTo(-13.4 + swish * 1.6, bodyY - 11.4, -12 + swish * 1.6, bodyY - 13 + swish);
      c.stroke();
    }
  }

  S.cat = function (c, a, t, gait) {
    gait = gait || 0;
    var swish = Math.sin(t * (2.2 + gait * 2.6));
    var fluff = a.fluffy ? 1.25 : 1;

    if (gait > 0.15) {
      /* ---- padding along on all four paws ---- */
      var bodyY = 5.4;
      var step = Math.sin(t * 8.4) * 3.2 * Math.min(1, gait);
      var step2 = Math.sin(t * 8.4 + Math.PI) * 3.2 * Math.min(1, gait);

      catTailWalk(c, a, swish, fluff, bodyY);

      /* far legs, then near legs, so she reads as solid */
      c.strokeStyle = GG.shade(a.body, -0.14); c.lineWidth = 2.8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-6, bodyY + 2); c.lineTo(-6.4 + step2, 13.4); c.stroke();
      c.beginPath(); c.moveTo(6.4, bodyY + 2); c.lineTo(6.8 + step, 13.4); c.stroke();
      c.strokeStyle = a.body; c.lineWidth = 2.8;
      c.beginPath(); c.moveTo(-3.6, bodyY + 2); c.lineTo(-4 + step, 13.4); c.stroke();
      c.beginPath(); c.moveTo(8.6, bodyY + 2); c.lineTo(9 + step2, 13.4); c.stroke();
      c.fillStyle = GG.shade(a.body, 0.22);
      [[-6.4 + step2], [-4 + step], [6.8 + step], [9 + step2]].forEach(function (q) {
        ell(c, q[0], 13.6, 1.9, 1.2);
      });

      /* the long low body */
      c.fillStyle = a.body;
      c.beginPath();
      c.moveTo(-9.4, bodyY + 2);
      c.quadraticCurveTo(-11.4 * fluff, bodyY - 4.4, -5, bodyY - 5.4);
      c.quadraticCurveTo(3, bodyY - 7.4, 9.6, bodyY - 4.4);
      c.quadraticCurveTo(12, bodyY + 0.4, 9, bodyY + 3);
      c.quadraticCurveTo(0, bodyY + 4.6, -9.4, bodyY + 2);
      c.closePath(); c.fill();
      c.fillStyle = a.belly;
      ell(c, 2.4, bodyY + 2.6, 6.4, 1.9, 0);

      c.save();
      c.beginPath();
      c.moveTo(-9.4, bodyY + 2);
      c.quadraticCurveTo(-11.4 * fluff, bodyY - 4.4, -5, bodyY - 5.4);
      c.quadraticCurveTo(3, bodyY - 7.4, 9.6, bodyY - 4.4);
      c.quadraticCurveTo(12, bodyY + 0.4, 9, bodyY + 3);
      c.quadraticCurveTo(0, bodyY + 4.6, -9.4, bodyY + 2);
      c.closePath(); c.clip();
      if (a.pattern === 'tabby') {
        c.strokeStyle = a.accent; c.lineWidth = 1.5; c.globalAlpha = 0.75;
        for (var i = -2; i <= 3; i++) {
          c.beginPath();
          c.moveTo(-8 + i * 3.6, bodyY - 6);
          c.quadraticCurveTo(-6.4 + i * 3.6, bodyY - 2, -8.4 + i * 3.6, bodyY + 3);
          c.stroke();
        }
        c.globalAlpha = 1;
      } else if (a.pattern === 'calico') {
        c.fillStyle = '#e08a2f';
        ell(c, -4.4, bodyY - 2.4, 5, 4);
        ell(c, 6, bodyY + 1.4, 3.4, 3);
        c.fillStyle = a.accent;
        ell(c, 2.4, bodyY - 3.4, 4, 3.4);
      } else if (a.pattern === 'point') {
        c.fillStyle = a.accent; c.globalAlpha = 0.5;
        ell(c, -8.4, bodyY + 0.4, 4, 3);
        c.globalAlpha = 1;
      }
      c.restore();

      catHead(c, a, 4.8, bodyY - 3.4 + Math.sin(t * 8.4) * 0.5);
      return;
    }

    /* ---- sitting still ---- */
    catTailSit(c, a, swish, fluff);

    /* legs tucked, sitting */
    c.fillStyle = GG.shade(a.body, -0.08);
    ell(c, -4.4, 11.4, 4, 2.6);
    c.fillStyle = a.body;
    ell(c, 6.4, 11.6, 4.2, 2.6);

    /* the sitting body */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-9.4, 11.4);
    c.quadraticCurveTo(-11.4 * fluff, 0, -4, -4.4);
    c.quadraticCurveTo(6, -7.4, 9.4, 0);
    c.quadraticCurveTo(11.4, 7.4, 9, 11.6);
    c.quadraticCurveTo(0, 13.4, -9.4, 11.4);
    c.closePath(); c.fill();
    c.fillStyle = a.belly;
    ell(c, 3.4, 8.4, 6, 3.6, -0.1);

    /* markings */
    c.save();
    c.beginPath();
    c.moveTo(-9.4, 11.4);
    c.quadraticCurveTo(-11.4 * fluff, 0, -4, -4.4);
    c.quadraticCurveTo(6, -7.4, 9.4, 0);
    c.quadraticCurveTo(11.4, 7.4, 9, 11.6);
    c.quadraticCurveTo(0, 13.4, -9.4, 11.4);
    c.closePath(); c.clip();
    if (a.pattern === 'tabby') {
      c.strokeStyle = a.accent; c.lineWidth = 1.6; c.globalAlpha = 0.75;
      for (var k = -2; k <= 3; k++) {
        c.beginPath();
        c.moveTo(-9 + k * 3.6, -4);
        c.quadraticCurveTo(-7 + k * 3.6, 2, -9.4 + k * 3.6, 9);
        c.stroke();
      }
      c.globalAlpha = 1;
    } else if (a.pattern === 'calico') {
      c.fillStyle = '#e08a2f';
      ell(c, -4.4, 1.4, 5.4, 5);
      ell(c, 6, 7.4, 3.6, 3.4);
      c.fillStyle = a.accent;
      ell(c, 3.4, -1.4, 4.4, 4);
      ell(c, -7.4, 8, 3.4, 3);
    } else if (a.pattern === 'point') {
      c.fillStyle = a.accent; c.globalAlpha = 0.5;
      ell(c, -9, 9.4, 4.4, 3.4);
      c.globalAlpha = 1;
    }
    c.restore();

    catHead(c, a, 0, 0);
  };

  /* ---------------- parrot ---------------- */
  S.parrot = function (c, a, t, gait) {
    gait = gait || 0;
    var hop = Math.min(1, gait);
    var bob = Math.sin(t * (2.4 + hop * 5)) * (0.6 + hop * 1.2);
    var crestUp = 1 + Math.sin(t * 1.7) * 0.16;

    /* the tail: long feathers fanned back and down, not a plank */
    var tl = a.longtail ? 24 : 13;
    var sway = Math.sin(t * 1.9) * 0.05;
    var base = 0.34 + sway;                    // back and downwards
    for (var f = -1; f <= 1; f++) {
      var L = tl * (1 - Math.abs(f) * 0.22);
      var ang = Math.PI - base + f * 0.17;
      var col = (f === 0) ? a.accent : GG.shade(a.accent, f < 0 ? -0.12 : 0.12);
      feather(c, -4.6, 3.2, ang, L, 2.2, 0.9, col);
    }
    if (a.redtail) {
      /* a grey parrot's tail is dipped in red at the very end */
      for (var g = -1; g <= 1; g++) {
        var L2 = tl * (1 - Math.abs(g) * 0.22);
        var an2 = Math.PI - base + g * 0.17;
        feather(c, -4.6 + Math.cos(an2) * L2 * 0.55, 3.2 + Math.sin(an2) * L2 * 0.55,
          an2, L2 * 0.48, 1.5, 0.8, g === 0 ? '#d8402f' : '#c3382a');
      }
    }
    if (a.longtail) {
      /* a macaw's central streamers are the longest of all */
      feather(c, -4.6, 3.4, Math.PI - base + 0.02, tl * 1.28, 1.5, 0.6,
        GG.shade(a.accent, 0.16));
    }

    /* body */
    c.fillStyle = a.body;
    c.beginPath();
    c.moveTo(-6, 4);
    c.quadraticCurveTo(-8, -6, 0, -9.4);
    c.quadraticCurveTo(9, -11, 10, -2);
    c.quadraticCurveTo(10.4, 6, 3, 9.4);
    c.quadraticCurveTo(-3, 10.4, -6, 4);
    c.closePath(); c.fill();

    /* the folded wing */
    c.fillStyle = a.wing;
    c.beginPath();
    c.moveTo(-4, -2);
    c.quadraticCurveTo(3, -6, 7.4, -1);
    c.quadraticCurveTo(4, 5.4, -3.4, 4.4);
    c.closePath(); c.fill();
    if (a.bars) {
      c.strokeStyle = a.accent; c.lineWidth = 0.8; c.globalAlpha = 0.8;
      for (var i = 0; i < 5; i++) {
        c.beginPath();
        c.moveTo(-3.4 + i * 2.2, -3.4 + i * 0.5);
        c.lineTo(-1.4 + i * 2.2, 3.4);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    if (a.wingTip) {
      /* the blue flight feathers folded along the bottom of the wing */
      c.save();
      c.beginPath();
      c.moveTo(-4, -2);
      c.quadraticCurveTo(3, -6, 7.4, -1);
      c.quadraticCurveTo(4, 5.4, -3.4, 4.4);
      c.closePath(); c.clip();
      c.fillStyle = a.wingTip;
      c.beginPath();
      c.moveTo(-6, 1.6);
      c.quadraticCurveTo(1, 0.4, 8, 1.4);
      c.lineTo(8, 7); c.lineTo(-6, 7);
      c.closePath(); c.fill();
      c.restore();
      c.strokeStyle = GG.shade(a.wingTip, -0.18); c.lineWidth = 0.6;
      for (var w = 0; w < 3; w++) {
        c.beginPath();
        c.moveTo(-3 + w * 3.2, 2.6); c.lineTo(-4 + w * 3.2, 4.6); c.stroke();
      }
    }
    c.fillStyle = GG.shade(a.wing, -0.12);
    ell(c, 0.4, 2.4, 5, 2, -0.25);

    /* head */
    c.fillStyle = a.body;
    ell(c, 8.4, -10 + bob, 5.4, 5);
    c.fillStyle = a.face;
    ell(c, 10.4, -9.4 + bob, 3.4, 3.2);

    /* crest, cheek patch, and the great hooked beak */
    if (a.crest) {
      c.strokeStyle = a.face; c.lineWidth = 1.6; c.lineCap = 'round';
      for (var k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(7.4 + k * 1.2, -13.4 + bob);
        c.quadraticCurveTo(8 + k * 2, -19 * crestUp + bob, 11 + k * 2.4, -22 * crestUp + bob);
        c.stroke();
      }
    }
    if (a.cheek && a.cheek !== a.face) {
      c.fillStyle = a.cheek;
      ell(c, 9.4, -8.4 + bob, 1.9, 1.7);
    }
    c.fillStyle = a.beak;
    c.beginPath();
    c.moveTo(12, -11.4 + bob);
    c.quadraticCurveTo(17.4, -10.4 + bob, 15.4, -5.4 + bob);
    c.quadraticCurveTo(13, -6.4 + bob, 12, -8 + bob);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(a.beak, -0.25);
    c.beginPath();
    c.moveTo(12.4, -8.2 + bob);
    c.quadraticCurveTo(14.6, -7.4 + bob, 15.2, -5.8 + bob);
    c.quadraticCurveTo(13.4, -6 + bob, 12.4, -7 + bob);
    c.closePath(); c.fill();

    eye(c, 10.4, -11.4 + bob, 1.5, '#22201c', true);
    /* the pale ring round a parrot's eye */
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.7;
    c.beginPath(); c.arc(10.4, -11.4 + bob, 2.3, 0, Math.PI * 2); c.stroke();

    /* the gripping feet */
    var fa = Math.sin(t * 7.4) * 2.2 * hop;
    var fb = Math.sin(t * 7.4 + Math.PI) * 2.2 * hop;
    c.strokeStyle = GG.shade(a.beak, -0.2); c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(1.4, 8.4); c.lineTo(1 + fa, 12.4); c.stroke();
    c.beginPath(); c.moveTo(5.4, 8); c.lineTo(5.4 + fb, 12.4); c.stroke();
    c.lineWidth = 1;
    [1 + fa, 5.4 + fb].forEach(function (fx) {
      c.beginPath(); c.moveTo(fx, 12.4); c.lineTo(fx - 2.4, 13.6); c.stroke();
      c.beginPath(); c.moveTo(fx, 12.4); c.lineTo(fx + 2.4, 13.6); c.stroke();
    });
  };



  /* ================================================================
     Shared parts for the twenty-three garden animals below.

     Same rules as the six above: profile, facing RIGHT, about 40px
     across at scale 1, the FEET at y = +14, flat colour only, and a
     little life from `t`.  Every shape reads the same optional keys -
     body, body2, belly, head, ear, leg, face, eye, nose, tail, accent -
     and falls back to something sensible for any that are missing, so
     a half-written art block still draws.
     ================================================================ */

  /* Colours, with per-shape defaults, so nothing is ever undefined. */
  function pal(a, d) {
    d = d || {};
    var body = a.body || d.body || '#8a7a62';
    var belly = a.belly || d.belly || GG.shade(body, 0.42);
    return {
      body: body,
      body2: a.body2 || d.body2 || GG.shade(body, -0.14),
      belly: belly,
      head: a.head || d.head || body,
      ear: a.ear || d.ear || GG.shade(body, -0.22),
      leg: a.leg || d.leg || GG.shade(body, -0.16),
      face: a.face || d.face || belly,
      eye: a.eye || d.eye || '#241d18',
      nose: a.nose || d.nose || '#2b241f',
      tail: a.tail || d.tail || body,
      accent: a.accent || d.accent || GG.shade(body, -0.34)
    };
  }

  /* One leg, with a bend in the middle so that no two legs can ever
     lie along the same line and merge into a single shape. */
  function limb(c, x0, y0, x1, y1, bend, w, col) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo((x0 + x1) / 2 + (bend || 0), (y0 + y1) / 2, x1, y1);
    c.stroke();
  }

  /* Four legs in profile. The far pair goes down first and darker, the
     near pair over the top, and the diagonals swing opposite each other
     the way a walking animal actually moves. */
  function legs4(c, o) {
    var amp = o.step || 0;
    var A = Math.sin(o.t * (o.speed || 8.2)) * amp;
    var B = Math.sin(o.t * (o.speed || 8.2) + Math.PI) * amp;
    var sep = o.sep == null ? 2.4 : o.sep;
    var w = o.w;
    limb(c, o.hx - sep, o.top, o.hx - sep + B, o.foot, o.hbend, w, o.far);
    limb(c, o.sx - sep, o.top, o.sx - sep + A, o.foot, o.fbend, w, o.far);
    limb(c, o.hx, o.top, o.hx + A, o.foot, o.hbend, w, o.near);
    limb(c, o.sx, o.top, o.sx + B, o.foot, o.fbend, w, o.near);
    if (o.shoe) {
      c.fillStyle = o.shoe;
      var fy = o.foot + w * 0.22, fr = w * 0.6;
      ell(c, o.hx - sep + B, fy, fr, fr * 0.66);
      ell(c, o.sx - sep + A, fy, fr, fr * 0.66);
      ell(c, o.hx + A, fy, fr, fr * 0.66);
      ell(c, o.sx + B, fy, fr, fr * 0.66);
    }
    return { a: A, b: B };
  }

  /* A tapering ribbon along a curve - tails, mostly. Returns sample
     points; `ribbonPath` turns them into a path you can fill OR clip. */
  function ribbon(x0, y0, cx, cy, x1, y1, w0, w1, n) {
    var pts = [], i;
    n = n || 14;
    for (i = 0; i <= n; i++) {
      var s = i / n, u = 1 - s;
      var x = u * u * x0 + 2 * u * s * cx + s * s * x1;
      var y = u * u * y0 + 2 * u * s * cy + s * s * y1;
      var dx = 2 * u * (cx - x0) + 2 * s * (x1 - cx);
      var dy = 2 * u * (cy - y0) + 2 * s * (y1 - cy);
      var L = Math.sqrt(dx * dx + dy * dy) || 1;
      pts.push({ x: x, y: y, nx: -dy / L, ny: dx / L, w: w0 + (w1 - w0) * s });
    }
    return pts;
  }
  function ribbonPath(c, pts) {
    var i, p;
    c.beginPath();
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      if (i) c.lineTo(p.x + p.nx * p.w, p.y + p.ny * p.w);
      else c.moveTo(p.x + p.nx * p.w, p.y + p.ny * p.w);
    }
    for (i = pts.length - 1; i >= 0; i--) {
      p = pts[i];
      c.lineTo(p.x - p.nx * p.w, p.y - p.ny * p.w);
    }
    c.closePath();
  }
  /* Bands across a ribbon - a raccoon's tail, a red panda's. Call it
     inside a clip of the same ribbon. */
  function ribbonRings(c, pts, col, count, from, w) {
    c.strokeStyle = col; c.lineWidth = w || 2.6; c.lineCap = 'butt';
    for (var k = 0; k < count; k++) {
      var i = Math.round((from + (1 - from) * (k + 0.5) / count) * (pts.length - 1));
      var p = pts[i], e = p.w + 1.6;
      c.beginPath();
      c.moveTo(p.x - p.nx * e, p.y - p.ny * e);
      c.lineTo(p.x + p.nx * e, p.y + p.ny * e);
      c.stroke();
    }
    c.lineCap = 'round';
  }

  /* A cloud of wool: one path made of an ellipse plus a rim of circles,
     so it can be filled and clipped as a single bumpy shape. */
  function fleecePath(c, cx, cy, rx, ry, n) {
    c.beginPath();
    c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    var r = (rx + ry) * 0.17;
    for (var i = 0; i < n; i++) {
      var ang = i / n * Math.PI * 2;
      var x = cx + Math.cos(ang) * (rx - r * 0.35);
      var y = cy + Math.sin(ang) * (ry - r * 0.35);
      c.moveTo(x + r, y);
      c.arc(x, y, r, 0, Math.PI * 2);
    }
  }

  /* An upright ear: a rounded triangle from (x,y) leaning by `lean`. */
  function earUp(c, x, y, len, wid, lean, outer, inner) {
    c.fillStyle = outer;
    c.beginPath();
    c.moveTo(x - wid, y);
    c.quadraticCurveTo(x - wid * 0.7 + lean * 0.5, y - len, x + lean, y - len);
    c.quadraticCurveTo(x + wid * 0.7 + lean * 0.5, y - len * 0.6, x + wid, y);
    c.closePath(); c.fill();
    if (inner) {
      c.fillStyle = inner;
      c.beginPath();
      c.moveTo(x - wid * 0.5, y - 0.4);
      c.quadraticCurveTo(x - wid * 0.3 + lean * 0.5, y - len * 0.78, x + lean * 0.8, y - len * 0.8);
      c.quadraticCurveTo(x + wid * 0.4 + lean * 0.5, y - len * 0.5, x + wid * 0.5, y - 0.4);
      c.closePath(); c.fill();
    }
  }

  /* A round ear, seen from the side - bear, panda, koala, red panda. */
  function earRound(c, x, y, r, outer, inner) {
    c.fillStyle = outer; ell(c, x, y, r, r * 0.96);
    if (inner) { c.fillStyle = inner; ell(c, x + r * 0.16, y + r * 0.12, r * 0.5, r * 0.46); }
  }

  /* One palmate antler: a short beam, then a kidney-shaped palm lying
     roughly flat, with blunt tines round the outer rim. (bx,by) is where
     it leaves the skull; `rise` tips the palm up; it always sweeps BACK. */
  function palmate(c, bx, by, rise, len, wid, col) {
    c.save();
    c.translate(bx, by);
    c.scale(-1, 1);              // so the palm sweeps back, not forward
    c.rotate(-rise);
    /* the beam out of the skull */
    c.strokeStyle = col; c.lineWidth = wid * 0.32; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.26, -wid * 0.2); c.stroke();
    /* the palm: bulging along the outer edge, hollow along the inner one */
    function palm(cc) {
      cc.beginPath();
      cc.moveTo(len * 0.16, -wid * 0.12);
      cc.quadraticCurveTo(len * 0.52, -wid * 0.92, len * 0.9, -wid * 0.5);
      cc.quadraticCurveTo(len * 1.14, -wid * 0.02, len * 0.84, wid * 0.52);
      cc.quadraticCurveTo(len * 0.5, wid * 0.12, len * 0.14, wid * 0.34);
      cc.quadraticCurveTo(len * 0.02, wid * 0.1, len * 0.16, -wid * 0.12);
      cc.closePath();
    }
    c.fillStyle = col; palm(c); c.fill();
    /* the tines: short, blunt and splayed OUT from the middle of the palm,
       so the rim reads as a scalloped edge and not as a row of prongs */
    c.strokeStyle = col; c.lineWidth = wid * 0.26; c.lineCap = 'round';
    var mx = len * 0.55, my = -wid * 0.1;
    function qp(t, ax, ay, bx2, by2, cx2, cy2) {
      var u = 1 - t;
      return [u * u * ax + 2 * u * t * bx2 + t * t * cx2,
        u * u * ay + 2 * u * t * by2 + t * t * cy2];
    }
    var rim = [];
    [0.32, 0.58, 0.84, 1].forEach(function (u) {
      rim.push(qp(u, len * 0.16, -wid * 0.12, len * 0.52, -wid * 0.92, len * 0.9, -wid * 0.5));
    });
    [0.4, 0.78].forEach(function (u) {
      rim.push(qp(u, len * 0.9, -wid * 0.5, len * 1.14, -wid * 0.02, len * 0.84, wid * 0.52));
    });
    rim.forEach(function (q, i) {
      var ox = q[0] - mx, oy = q[1] - my;
      var m = Math.sqrt(ox * ox + oy * oy) || 1;
      var L = wid * (0.3 - Math.abs(i - 2) * 0.03);
      c.beginPath();
      c.moveTo(q[0] - ox / m * wid * 0.08, q[1] - oy / m * wid * 0.08);
      c.lineTo(q[0] + ox / m * L, q[1] + oy / m * L);
      c.stroke();
    });
    /* a hint of the hollow, so the palm reads as a plate and not a blob */
    c.strokeStyle = GG.shade(col, -0.14); c.lineWidth = 0.6;
    c.globalAlpha = 0.5;
    c.beginPath();
    c.moveTo(len * 0.26, wid * 0.14);
    c.quadraticCurveTo(len * 0.56, -wid * 0.02, len * 0.82, wid * 0.08);
    c.stroke();
    c.globalAlpha = 1;
    c.restore();
  }

  function smoothstep(e0, e1, x) {
    var s = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return s * s * (3 - 2 * s);
  }

  /* ---------------- rabbit ----------------
     A cottontail: a rounded loaf with the weight at the back, the long
     hind foot flat on the ground, and SHORT rounded black-tipped ears.
     The long spear ears belong to a jackrabbit, which is a hare. */
  S.rabbit = function (c, a, t, gait) {
    var p = pal(a, { body: '#9a8b78', body2: '#b5a692', belly: '#f2efe8',
      ear: '#a3947f', accent: '#3b322b', tail: '#f4f1ea', nose: '#7a6154' });
    var hop = Math.min(1, gait || 0);
    var bob = Math.sin(t * 2.2) * 0.4 + Math.abs(Math.sin(t * 7.5)) * 3.4 * hop;
    var perk = Math.sin(t * 1.3) * 0.14;
    c.save(); c.translate(0, -bob);

    /* the white scut, only a sliver of it showing from the side */
    c.fillStyle = p.tail; ell(c, -12.6, 4.4, 3.4, 3.2);

    /* far ear, behind the head */
    c.save(); c.translate(9.4, -2.4); c.rotate(-0.26 + perk);
    c.fillStyle = GG.shade(p.ear, -0.16);
    ell(c, 0, -3.6, 2.1, 4.2);
    c.fillStyle = p.accent; ell(c, 0.1, -6.4, 1.9, 1.6);
    c.restore();

    /* far legs */
    c.fillStyle = p.body2;
    ell(c, -5.4, 10.4, 5.4, 3.2, -0.08);
    ell(c, 6.4, 10.6, 2.8, 3);

    /* the loaf: heavy haunch behind, shoulders low in front */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-12.4, 6);
    c.quadraticCurveTo(-13.6, -4.4, -4, -5.6);
    c.quadraticCurveTo(6, -6.6, 11, -1.6);
    c.quadraticCurveTo(13.4, 4, 8, 9.4);
    c.quadraticCurveTo(-2, 12.4, -12.4, 6);
    c.closePath(); c.fill();
    /* the grizzled flank */
    c.fillStyle = p.body2;
    ell(c, -4.4, 1.4, 7.4, 5.4, -0.12);
    c.fillStyle = p.belly;
    ell(c, -1, 8.4, 8, 2.8, -0.05);

    /* the long hind foot, flat on the ground - the shape cue */
    c.fillStyle = p.leg;
    GG.roundRect(c, -10.4, 11.4, 10.4, 3, 1.5); c.fill();
    /* the little front paw */
    c.fillStyle = p.body;
    ell(c, 8, 10.8, 2.6, 3.2);
    c.fillStyle = p.leg; ell(c, 8.4, 13.2, 2.4, 1.3);

    /* head, tipped down towards the grass */
    c.fillStyle = p.head;
    ell(c, 12.6, -2.4, 5.4, 4.6, 0.12);
    c.fillStyle = p.face;
    ell(c, 15.4, -0.4, 2.8, 2.2);
    ell(c, 14.4, -3.6, 2.4, 1.9);

    /* near ear: short, rounded, black-tipped */
    c.save(); c.translate(11.8, -5); c.rotate(-0.06 - perk);
    c.fillStyle = p.ear; ell(c, 0, -3.8, 2.5, 4.6);
    c.fillStyle = GG.shade(p.belly, -0.12); ell(c, 0.2, -3.6, 1.3, 3.2);
    c.fillStyle = p.accent; ell(c, 0.1, -6.8, 2.3, 1.8);
    c.restore();

    eye(c, 14.4, -3.6, 1.7, p.eye, true);
    c.fillStyle = p.nose;
    ell(c, 17.6, -1.6, 1, 0.8);
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.5;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(17, -1.2); c.lineTo(24, -3.4 + w * 2.4); c.stroke();
    }
    c.restore();
  };

  /* ---------------- treesquirrel ----------------
     A fox squirrel sitting up. The tail is the animal: as long as the
     body, fluffed out sideways and held up behind - never a thin rope. */
  S.treesquirrel = function (c, a, t) {
    var p = pal(a, { body: '#8a6a45', body2: '#7a5c3c', belly: '#d9a05b',
      tail: '#c08a4e', accent: '#e8d2ae', ear: '#7a5c3c', nose: '#40302a' });
    var flick = Math.sin(t * 2.6) * 0.09;
    var nibble = Math.sin(t * 9) * 0.5;

    /* the plume, drawn as a broad tapering fan with a pale fringe */
    c.save(); c.translate(-4.4, 11.4); c.rotate(flick);
    var tl = ribbon(0, 0, -14.4, -3.4, -9.6, -16.4, 2.8, 4.8, 16);
    /* the pale fringe, bumped along both edges so it reads as fur */
    c.fillStyle = p.accent; ribbonPath(c, tl); c.fill();
    for (var g = 2; g < tl.length; g += 2) {
      var q = tl[g], rr = q.w * 0.62;
      ell(c, q.x + q.nx * q.w * 0.8, q.y + q.ny * q.w * 0.8, rr, rr);
      ell(c, q.x - q.nx * q.w * 0.8, q.y - q.ny * q.w * 0.8, rr, rr);
    }
    var ti = ribbon(0.4, -0.4, -12.8, -3.4, -8.8, -14.4, 2.1, 3.8, 16);
    c.fillStyle = p.tail; ribbonPath(c, ti); c.fill();
    for (var g2 = 2; g2 < ti.length; g2 += 3) {
      var q2 = ti[g2], r2 = q2.w * 0.5;
      ell(c, q2.x + q2.nx * q2.w * 0.5, q2.y + q2.ny * q2.w * 0.5, r2, r2);
    }
    c.restore();

    /* the hind foot it is sitting on */
    c.fillStyle = p.leg;
    GG.roundRect(c, -2.4, 11.4, 8.4, 3, 1.5); c.fill();

    /* the sitting S of the body */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-6.4, 12);
    c.quadraticCurveTo(-9.4, 3.4, -3.4, -1.4);
    c.quadraticCurveTo(1.4, -6.4, 6.4, -3.4);
    c.quadraticCurveTo(10.4, 0.4, 7.4, 7);
    c.quadraticCurveTo(4.4, 12.6, -6.4, 12);
    c.closePath(); c.fill();
    c.fillStyle = p.body2;
    ell(c, -1.4, 4.4, 5.4, 6, -0.12);
    c.fillStyle = p.belly;
    ell(c, 6, 5.4, 3.4, 5, -0.18);

    /* head */
    c.fillStyle = p.head;
    ell(c, 7, -6.4 + nibble * 0.3, 4.8, 4.4);
    c.fillStyle = p.face;
    ell(c, 10.2, -5, 2.6, 2.2);
    /* small rounded ear, set well back */
    earRound(c, 4.2, -10.4, 2.2, p.ear, GG.shade(p.belly, -0.1));

    /* the forepaws held together at the chest */
    c.fillStyle = p.leg;
    ell(c, 9.4, 1.4 + nibble, 2.4, 2, -0.3);
    ell(c, 10.6, 2.8 + nibble, 2.2, 1.8, -0.3);

    eye(c, 8.4, -7.4, 1.6, p.eye, true);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.7;
    c.beginPath(); c.arc(8.4, -7.4, 2.5, 0, Math.PI * 2); c.stroke();
    c.fillStyle = p.nose; ell(c, 12.4, -4.6, 0.9, 0.7);
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.5;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(12, -4.4); c.lineTo(18.4, -6.4 + w * 2.2); c.stroke();
    }
  };

  /* ---------------- groundsquirrel ----------------
     Townsend's ground squirrel, standing up at the mouth of its burrow.
     Not a tree squirrel: short legs, low body, a SHORT THIN tail and no
     ear tufts at all. */
  S.groundsquirrel = function (c, a, t) {
    var p = pal(a, { body: '#a99a80', body2: '#7c6e58', belly: '#d6ccb6',
      tail: '#a08f76', accent: '#6d6049', ear: '#8e8068', nose: '#3c332a' });
    var peer = Math.sin(t * 1.9) * 0.9;

    /* the short thin tail, held low and a little out behind */
    var tl = ribbon(-3.4, 10.4, -9.4, 9.4, -11.4, 3.4, 1.5, 1, 12);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();

    /* hind feet flat on the ground */
    c.fillStyle = p.leg;
    GG.roundRect(c, -3.4, 11.6, 7.6, 2.8, 1.4); c.fill();

    /* the upright body: a short pear, wide at the bottom */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-4.6, 12);
    c.quadraticCurveTo(-7, 4.4, -3.4, -2.4);
    c.quadraticCurveTo(0.4, -7, 4.4, -3);
    c.quadraticCurveTo(7.6, 2.4, 5.4, 8.4);
    c.quadraticCurveTo(3.4, 12.6, -4.6, 12);
    c.closePath(); c.fill();
    c.fillStyle = p.body2;
    ell(c, -1.4, 4.4, 3.4, 6.4, -0.08);
    c.fillStyle = p.belly;
    ell(c, 4, 4.4, 2.8, 5.4, -0.12);
    /* the faint mottling on the back */
    c.fillStyle = p.accent; c.globalAlpha = 0.42;
    var r = GG.mulberry32(23);
    for (var i = 0; i < 8; i++) ell(c, -5 + r() * 7, -1 + r() * 11, 1.1, 0.8);
    c.globalAlpha = 1;

    /* the little forepaws held at the chest */
    c.fillStyle = p.leg;
    ell(c, 6.4, 0.4, 1.9, 1.6, -0.3);
    ell(c, 7.2, 2, 1.8, 1.5, -0.3);

    /* head: round, blunt-nosed, low on the shoulders */
    c.fillStyle = p.head;
    ell(c, 3.4, -7.4 - peer * 0.2, 4.4, 4);
    c.fillStyle = p.face;
    ell(c, 6.4, -6, 2.4, 1.9);
    /* no tufts: just a low rounded rim of an ear */
    c.fillStyle = p.ear;
    ell(c, 0.6, -9.8, 1.5, 1.2);

    eye(c, 5, -8.6 - peer * 0.2, 1.5, p.eye, true);
    c.fillStyle = p.nose; ell(c, 8.4, -5.6, 0.85, 0.7);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.5;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(8, -5.4); c.lineTo(14, -7.4 + w * 2); c.stroke();
    }
  };

  /* ---------------- turtle ----------------
     Western painted turtle. The red is on the EDGE of the shell and the
     belly, never on the ear - that is a red-eared slider. The head
     stripes are yellow. */
  S.turtle = function (c, a, t) {
    var p = pal(a, { body: '#2b3a32', body2: '#22302a', belly: '#d9532e',
      accent: '#e8c64a', head: '#2b3a32', leg: '#243129', nose: '#141712' });
    var shell = a.shell || '#2f3a2a';
    var shell2 = a.shell2 || GG.shade(shell, -0.22);
    var plas = a.plastron || '#d9532e';
    var marg = a.accent || GG.shade(plas, -0.14);
    var rim = a.belly && a.belly !== plas ? a.belly : GG.shade(plas, 0.34);
    var stripe = a.face || a.accent || '#e8c64a';
    var reach = Math.sin(t * 1.5) * 0.8;
    var plod = Math.sin(t * 4.4) * 1.4;

    /* far legs */
    c.fillStyle = p.body2;
    ell(c, -8.4, 11.4 - Math.abs(plod) * 0.3, 3.2, 2.6, 0.3);
    ell(c, 8.4, 11.4, 3.2, 2.6, -0.3);

    /* neck and head, out and angled up */
    function neckHead(cc) {
      cc.beginPath();
      cc.moveTo(9.4, 2);
      cc.quadraticCurveTo(15.4, 1.4, 17, -2.8 + reach);
      cc.lineTo(20.4, -0.8 + reach);
      cc.quadraticCurveTo(16.4, 5.4, 9.4, 6.6);
      cc.closePath();
      cc.moveTo(23.8, -2.2 + reach);
      cc.ellipse(19.4, -2.2 + reach, 4.4, 3.2, -0.2, 0, Math.PI * 2);
    }
    c.fillStyle = p.head; neckHead(c); c.fill();
    /* the yellow head and neck stripes, kept on the skin */
    c.save(); neckHead(c); c.clip();
    c.strokeStyle = stripe; c.lineWidth = 0.9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(10, 1.4); c.quadraticCurveTo(16, -0.6, 22.4, -3.6 + reach); c.stroke();
    c.beginPath(); c.moveTo(10.4, 4); c.quadraticCurveTo(16.4, 3, 21.4, 0.4 + reach); c.stroke();
    c.beginPath(); c.moveTo(10.4, 6); c.quadraticCurveTo(15.4, 5.6, 18.4, 2.6 + reach); c.stroke();
    c.restore();

    /* the low dome of the carapace - flatter than a cartoon turtle */
    function carapace(cc) {
      cc.beginPath();
      cc.moveTo(-14.4, 7.4);
      cc.quadraticCurveTo(-13.4, -3.4, -1, -5.6);
      cc.quadraticCurveTo(11, -5.4, 13.4, 3.4);
      cc.quadraticCurveTo(13.8, 7.2, 12.4, 8.6);
      cc.lineTo(-13, 8.6);
      cc.closePath();
    }
    c.fillStyle = shell; carapace(c); c.fill();
    /* a lighter rim along the scute seams, so a dark shell still has a
       silhouette when the grass behind it is dark too */
    c.strokeStyle = GG.shade(shell, 0.3); c.lineWidth = 1.1;
    carapace(c); c.stroke();
    c.save(); carapace(c); c.clip();
    /* the scute seams */
    c.strokeStyle = shell2; c.lineWidth = 1;
    for (var k = -3; k <= 3; k++) {
      c.beginPath();
      c.moveTo(k * 4.2 - 1, -7); c.quadraticCurveTo(k * 4.2 + 0.6, 1, k * 4.2 - 0.4, 9.4);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-15, 4.2); c.quadraticCurveTo(0, 2.4, 14, 4.6); c.stroke();
    /* THE red marginal bar along the lower rim - the whole identity */
    c.fillStyle = marg;
    c.beginPath();
    c.moveTo(-15, 5.6); c.quadraticCurveTo(0, 3.8, 14.4, 6);
    c.lineTo(14.4, 9.4); c.lineTo(-15, 9.4);
    c.closePath(); c.fill();
    c.restore();

    /* the plastron edge showing under the rim */
    c.fillStyle = plas;
    GG.roundRect(c, -11.4, 8.4, 22.4, 1.9, 0.9); c.fill();
    c.fillStyle = rim;
    GG.roundRect(c, -10.4, 9.4, 20.4, 0.9, 0.45); c.fill();

    /* near legs, with claws */
    c.fillStyle = p.leg;
    ell(c, -6.4, 11.4 + plod * 0.2, 3.6, 2.8, 0.25);
    ell(c, 10.4, 11.4 - plod * 0.2, 3.6, 2.8, -0.25);
    c.strokeStyle = stripe; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(12.4, 12.6); c.lineTo(14.4, 13.6); c.stroke();
    c.beginPath(); c.moveTo(12, 13.4); c.lineTo(13.8, 14.2); c.stroke();
    c.beginPath(); c.moveTo(-8.4, 12.8); c.lineTo(-10.4, 13.8); c.stroke();
    /* a short pointed tail */
    c.fillStyle = GG.shade(p.tail, -0.14);
    c.beginPath();
    c.moveTo(-13.4, 7.4); c.lineTo(-18.4, 9.4); c.lineTo(-13.4, 10); c.closePath(); c.fill();

    eye(c, 21, -3.2 + reach, 1.3, p.eye);
    c.fillStyle = p.nose;
    ell(c, 23.4, -2.2 + reach, 0.6, 0.5);
  };

  /* ---------------- bear ----------------
     A black bear, which is very often not black. The two diagnostics:
     a STRAIGHT face with a long muzzle and long prominent ears, and a
     rump HIGHER than the shoulders. No grizzly hump. */
  S.bear = function (c, a, t, gait) {
    var p = pal(a, { body: '#2a231e', body2: '#221c18', belly: '#241e1a',
      face: '#9c7a52', ear: '#251f1a', leg: '#1e1815', nose: '#120e0b',
      accent: '#d8cbb5' });
    var walk = Math.min(1, gait || 0);
    var sway = Math.sin(t * 1.5) * 0.5;

    legs4(c, { t: t, speed: 5.4, step: 3 * walk, w: 6.4, sep: 3,
      hx: -8.4, sx: 7.4, top: 4, foot: 12.6, hbend: -1.6, fbend: 1.2,
      far: p.body2, near: p.leg });
    /* flat plantigrade feet */
    c.fillStyle = p.body2;
    ell(c, -8.4, 13, 4.4, 1.8); ell(c, 7.8, 13, 4.2, 1.8);

    /* the body: back line rising towards the rump */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-14.4, 4.4);
    c.quadraticCurveTo(-15.4, -7.4, -8, -8.6);      // the high rump
    c.quadraticCurveTo(2, -10, 11.4, -6.4);         // sloping down to the shoulder
    c.quadraticCurveTo(15.4, -3.4, 14, 3.4);
    c.quadraticCurveTo(0, 8.6, -14.4, 4.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, -1, 5.4, 10.4, 2.6);
    /* a stub of a tail on the high rump */
    c.fillStyle = p.tail === p.body ? p.body2 : p.tail;
    ell(c, -15.4, -3.4, 2.2, 2);

    /* head, carried low and forward */
    c.save(); c.translate(0, sway * 0.4);
    /* the long prominent ears, standing clear of the head */
    earRound(c, 13.4, -11.4, 3, p.ear, GG.shade(p.face, -0.25));
    earRound(c, 19.4, -11, 2.8, p.ear, GG.shade(p.face, -0.25));
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 17.4, -6.4, 6.4, 5.4);
    /* the straight face and long light muzzle */
    c.fillStyle = p.face;
    c.beginPath();
    c.moveTo(19, -8.4);
    c.quadraticCurveTo(26.4, -8, 26.8, -4.6);
    c.quadraticCurveTo(25.4, -1.4, 19.4, -2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.nose;
    ell(c, 26.2, -6, 1.9, 1.5);
    c.strokeStyle = GG.shade(p.face, -0.3); c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(26, -4.4); c.quadraticCurveTo(23.4, -2.6, 21, -3.6); c.stroke();
    eye(c, 20.4, -8.4, 1.3, p.eye, true);
    c.restore();

    /* the claws, which are the point of a bear */
    c.strokeStyle = p.accent; c.lineWidth = 0.9; c.lineCap = 'round';
    [-11.4, 10.4].forEach(function (fx) {
      for (var k = 0; k < 3; k++) {
        c.beginPath();
        c.moveTo(fx + k * 1.4, 12.8); c.lineTo(fx + k * 1.4 - 1, 14.2); c.stroke();
      }
    });
  };

  /* ---------------- raccoon ----------------
     A downward-sloping wedge with a striped tail. Two things carry it:
     the black mask and the ringed tail, and both are drawn last so
     nothing washes them out. */
  S.raccoon = function (c, a, t, gait) {
    var p = pal(a, { body: '#7e7768', body2: '#6b6456', belly: '#9c9280',
      face: '#e8e2d4', ear: '#6b6456', leg: '#4e483e', nose: '#3a3330',
      accent: '#22201c', tail: '#9c9280' });
    var walk = Math.min(1, gait || 0);
    var paw = Math.sin(t * 2.4) * 0.6;

    /* the thick ringed tail, held out low behind */
    var tl = ribbon(-10.4, 2.4, -20.4, 3.4, -26.4, 8.4, 3.2, 2.2, 18);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();
    c.save(); ribbonPath(c, tl); c.clip();
    ribbonRings(c, tl, a.accent || '#2a2622', 4, 0.12, 2.4);
    c.restore();
    c.fillStyle = a.accent || '#2a2622';
    ell(c, -26.2, 8.3, 2.3, 2.3);

    legs4(c, { t: t, speed: 6.4, step: 2.8 * walk, w: 4.2, sep: 2.4,
      hx: -7.4, sx: 7.4, top: 4.4, foot: 12.8, hbend: -1.2, fbend: 0.9,
      far: GG.shade(p.leg, -0.15), near: p.leg });
    /* the hands, long-fingered, like small human handprints */
    c.strokeStyle = p.leg; c.lineWidth = 1; c.lineCap = 'round';
    [9.4, -6.4].forEach(function (fx) {
      for (var k = -1; k <= 1; k++) {
        c.beginPath(); c.moveTo(fx, 13); c.lineTo(fx + 1.4 + k * 1.3, 14.4); c.stroke();
      }
    });

    /* the hunched body: rump high, shoulders low, head lower still */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-11.4, 5.4);
    c.quadraticCurveTo(-13.4, -6.4, -5, -8.4);
    c.quadraticCurveTo(4, -9.4, 11.4, -4.4);
    c.quadraticCurveTo(14.4, -1, 12, 4.4);
    c.quadraticCurveTo(0, 8.6, -11.4, 5.4);
    c.closePath(); c.fill();
    c.fillStyle = p.body2;
    ell(c, -3.4, -3.4, 8, 4, -0.1);
    c.fillStyle = p.belly;
    ell(c, 1.4, 5.6, 8.4, 2.4);

    /* head, low and forward, with a pointed muzzle */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 15.4, -1.4, 5.6, 4.8, 0.12);
    c.beginPath();
    c.moveTo(17, -3.4);
    c.quadraticCurveTo(23.4, -2.4, 22.4, 1.4);
    c.quadraticCurveTo(19.4, 2.6, 16.4, 1.4);
    c.closePath(); c.fill();
    /* small rounded ears with pale rims */
    earRound(c, 12.4, -6.4, 2.4, p.ear, p.face);
    earRound(c, 17.4, -6.6, 2.2, p.ear, p.face);

    /* the pale border, then THE MASK over the top of it */
    c.save();
    c.beginPath();
    c.ellipse(15.4, -1.4, 5.6, 4.8, 0.12, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = p.face;
    c.beginPath();
    c.moveTo(10, -6.4);
    c.quadraticCurveTo(16.4, -8, 22, -4.4);
    c.lineTo(22, 3.4); c.lineTo(10, 3.4);
    c.closePath(); c.fill();
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(10.4, -4.4);
    c.quadraticCurveTo(15.4, -5.4, 20.4, -2.6);
    c.quadraticCurveTo(19.4, 1, 15.4, 0.8);
    c.quadraticCurveTo(11.4, 0.4, 10.4, -4.4);
    c.closePath(); c.fill();
    c.restore();
    c.fillStyle = p.nose;
    ell(c, 22.4, -0.6, 1.5, 1.2);
    eye(c, 17.6, -2.8, 1.35, '#f3ead6');
    c.fillStyle = p.eye; ell(c, 17.6, -2.8, 0.8, 0.8);

    /* the near hand, turning something over */
    c.fillStyle = p.leg;
    ell(c, 11.4, 6.4 + paw, 2.4, 1.9, -0.3);
  };

  /* ---------------- fox ----------------
     Long and low, pointed muzzle, tall triangular ears, black stockings,
     and a brush nearly as long as the body held out LOW behind with a
     white tip - the white tip is the whole animal. */
  S.fox = function (c, a, t, gait) {
    var p = pal(a, { body: '#c2622a', body2: '#a9511f', belly: '#f4efe6',
      face: '#f4efe6', ear: '#26201c', leg: '#26201c', nose: '#231c18',
      accent: '#f4efe6', tail: '#c2622a', eye: '#c9a227' });
    var trot = Math.min(1, gait || 0);
    var sw = Math.sin(t * 2.1) * 1.4;

    /* the brush */
    var tl = ribbon(-10.4, 1.4, -19.4, 4.4 + sw * 0.4, -26.4, 8.4 + sw, 2.2, 3, 18);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();
    /* fluffed along both edges, so it is a brush and not a wedge */
    for (var g = 3; g < tl.length; g += 2) {
      var q = tl[g], rr = q.w * 0.66;
      ell(c, q.x + q.nx * q.w * 0.7, q.y + q.ny * q.w * 0.7, rr, rr);
      ell(c, q.x - q.nx * q.w * 0.7, q.y - q.ny * q.w * 0.7, rr, rr);
    }
    c.fillStyle = GG.shade(p.tail, -0.16);
    var ts = ribbon(-11.4, 2.4, -18.4, 5.4 + sw * 0.4, -23.4, 8.6 + sw, 1.3, 1.2, 12);
    ribbonPath(c, ts); c.fill();
    /* THE white tip */
    c.fillStyle = p.accent;
    ell(c, -26.4, 8.4 + sw, 3.2, 3);
    ell(c, -24.4, 7 + sw, 2.4, 2.2);

    legs4(c, { t: t, speed: 8.6, step: 3.2 * trot, w: 3, sep: 2.4,
      hx: -7.4, sx: 8, top: 3.4, foot: 13.4, hbend: -1.4, fbend: 0.9,
      far: GG.shade(p.leg, 0.12), near: p.leg, shoe: GG.shade(p.leg, 0.2) });

    /* the long low body */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-11.4, 2.4);
    c.quadraticCurveTo(-12.4, -5.4, -4, -6.4);
    c.quadraticCurveTo(6, -7.4, 12.4, -5.4);
    c.quadraticCurveTo(15.4, -2.4, 13, 3);
    c.quadraticCurveTo(0, 6.6, -11.4, 2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, 1.4, 3.6, 9.4, 2, -0.02);
    c.fillStyle = p.body2;
    ell(c, -5.4, -2.4, 6.4, 3.4, -0.1);

    /* the tall triangular ears, dark on the back */
    earUp(c, 13.4, -7.4, 8.4, 2.8, -1.4, p.ear, GG.shade(p.face, -0.1));
    earUp(c, 18.4, -7.6, 7.8, 2.6, 1.2, p.ear, GG.shade(p.face, -0.1));

    /* head and the sharp muzzle */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 16.4, -6, 5.4, 4.6);
    c.beginPath();
    c.moveTo(18, -7.4);
    c.quadraticCurveTo(25.4, -6.4, 25.4, -3.4);
    c.quadraticCurveTo(21.4, -1.6, 17.4, -2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.face;
    c.beginPath();
    c.moveTo(18.4, -4.4);
    c.quadraticCurveTo(23.4, -4, 25.2, -3.2);
    c.quadraticCurveTo(21.4, -1.6, 17.6, -2.6);
    c.closePath(); c.fill();
    c.fillStyle = p.face;
    ell(c, 14.4, -2.4, 3.4, 2, -0.2);
    c.fillStyle = p.nose;
    ell(c, 25.4, -3.6, 1.3, 1.1);

    eye(c, 18.4, -7.2, 1.4, p.eye, true);
    c.fillStyle = '#1e1a16';
    ell(c, 18.4, -7.2, 0.55, 1.3);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.5;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(24.4, -3); c.lineTo(31, -5 + w * 2.2); c.stroke();
    }
  };

  /* ---------------- panda ----------------
     A low bear barrel with a big round head. The black is one saddle:
     a band across the shoulders that runs straight down into both front
     legs. Round ears standing clear, sloping teardrop eye patches, and
     a short WHITE tail. */
  S.panda = function (c, a, t, gait) {
    var p = pal(a, { body: '#f5f1e8', body2: '#e6e0d4', belly: '#f0ebe0',
      ear: '#211e1c', leg: '#211e1c', nose: '#211e1c', accent: '#211e1c',
      face: '#f5f1e8', tail: '#f5f1e8' });
    var walk = Math.min(1, gait || 0);
    var chew = Math.sin(t * 3.4) * 0.4;

    legs4(c, { t: t, speed: 5, step: 2.6 * walk, w: 6.6, sep: 3,
      hx: -8.4, sx: 7.4, top: 4, foot: 12.6, hbend: -1.4, fbend: 1,
      far: GG.shade(p.accent, 0.18), near: p.leg });
    c.fillStyle = GG.shade(p.accent, 0.1);
    ell(c, -8.4, 13, 4.2, 1.8); ell(c, 7.6, 13, 4.2, 1.8);

    /* the short white tail - white, not black, and easy to miss on purpose */
    c.fillStyle = p.body2; ell(c, -13.2, -2.4, 2.4, 2.1);
    c.fillStyle = p.tail; ell(c, -13.6, -2.8, 1.9, 1.7);

    /* the barrel */
    function barrel(cc) {
      cc.beginPath();
      cc.moveTo(-12.4, 4.4);
      cc.quadraticCurveTo(-14, -6.4, -6, -8);
      cc.quadraticCurveTo(3, -9.4, 10.4, -6);
      cc.quadraticCurveTo(14, -2.4, 12, 4.4);
      cc.quadraticCurveTo(0, 8.6, -12.4, 4.4);
      cc.closePath();
    }
    c.fillStyle = p.body; barrel(c); c.fill();
    c.save(); barrel(c); c.clip();
    /* THE saddle-and-sleeves: one continuous band into the front legs */
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(2.4, -10.4);
    c.quadraticCurveTo(9.4, -9.4, 14.4, -5.4);
    c.lineTo(15.4, 10); c.lineTo(1.4, 10);
    c.quadraticCurveTo(0.4, -1.4, 2.4, -10.4);
    c.closePath(); c.fill();
    c.restore();
    c.fillStyle = p.belly;
    ell(c, -5.4, 5, 6.4, 2.2);

    /* the big round head, nearly as tall as the shoulder */
    c.save(); c.translate(0, chew * 0.3);
    earRound(c, 10.4, -13, 3.1, p.ear, GG.shade(p.ear, 0.2));
    earRound(c, 17.4, -13.4, 3.3, p.ear, GG.shade(p.ear, 0.2));
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 14.4, -7.4, 7, 6.4);
    /* the sloping teardrop eye patch, angled down and outward */
    c.save();
    c.beginPath(); c.ellipse(14.4, -7.4, 7, 6.4, 0, 0, Math.PI * 2); c.clip();
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(12.4, -12);
    c.quadraticCurveTo(17.8, -11.4, 18.2, -8);
    c.quadraticCurveTo(15.4, -4.6, 12.6, -6);
    c.quadraticCurveTo(11.2, -9, 12.4, -12);
    c.closePath(); c.fill();
    c.restore();
    /* the pale muzzle and the black nose */
    c.fillStyle = p.face;
    ell(c, 19.4, -5, 3.2, 2.6);
    c.fillStyle = p.nose;
    ell(c, 21, -6, 1.7, 1.3);
    c.strokeStyle = GG.shade(p.nose, 0.3); c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(20.8, -4.8); c.quadraticCurveTo(18.8, -2.8 + chew, 17, -3.8); c.stroke();
    eye(c, 15.6, -8.6, 1.2, '#f0ece2');
    c.fillStyle = p.eye; ell(c, 15.6, -8.6, 0.7, 0.7);
    c.restore();
  };

  /* ---------------- deer ----------------
     A mule deer: ENORMOUS dark-edged ears, a thin white rope of a tail
     with a black tip, and antlers that fork and fork again into equal
     Ys rather than branching off one beam. A calf has none and gets
     its spots instead. */
  S.deer = function (c, a, t, gait) {
    var p = pal(a, { body: '#a97a4c', body2: '#8c7a62', belly: '#ede6d8',
      face: '#ede6d8', ear: '#c0a180', leg: '#8a6238', nose: '#2a231d',
      accent: '#f0ebe0', tail: '#f0ebe0' });
    var calf = !!a.calf;
    var k = calf ? 0.74 : 1;
    var trot = Math.min(1, gait || 0);
    var graze = Math.sin(t * 1.1) * 0.6;
    var antler = a.antler || '#b1976c';

    c.save(); c.scale(1, 1); c.translate(0, 14 - 14 * k); c.scale(k, k);

    legs4(c, { t: t, speed: 8.4, step: 3.4 * trot, w: 2.6, sep: 2.6,
      hx: -8.4, sx: 8, top: -1.4, foot: 13.6, hbend: -2.2, fbend: 1.2,
      far: p.body2, near: p.leg });
    c.fillStyle = p.nose;
    ell(c, -8.4, 13.8, 1.5, 1); ell(c, 8, 13.8, 1.5, 1);

    /* the thin white tail with the black tip */
    c.strokeStyle = p.tail; c.lineWidth = 2.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-10.4, -6.4); c.quadraticCurveTo(-13.4, -4.4, -12.8, -0.4); c.stroke();
    c.strokeStyle = a.nose || '#1e1a16'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-12.9, -1.6); c.lineTo(-12.8, -0.2); c.stroke();

    /* a deep narrow chest and a light frame */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-11, -3.4);
    c.quadraticCurveTo(-12.4, -10.4, -4, -11.4);
    c.quadraticCurveTo(5, -12.4, 10, -9.4);
    c.quadraticCurveTo(12.4, -6.4, 9.4, -1.4);
    c.quadraticCurveTo(0, 1.4, -11, -3.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, -1.4, -1.6, 8.4, 1.8);
    /* the pale rump patch */
    c.fillStyle = p.accent;
    ell(c, -10.4, -6.4, 2.8, 3.4);
    if (calf) {
      c.fillStyle = 'rgba(255,255,255,0.72)';
      var r = GG.mulberry32(41);
      for (var i = 0; i < 11; i++) ell(c, -9 + r() * 17, -10.4 + r() * 7, 0.9, 0.7);
    }

    /* neck at about forty-five degrees */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(6, -10.4);
    c.quadraticCurveTo(12.4, -13.4, 15.4, -19.4 + graze);
    c.lineTo(19.4, -17.4 + graze);
    c.quadraticCurveTo(15.4, -11.4, 10.4, -6.4);
    c.closePath(); c.fill();

    c.save(); c.translate(0, graze);
    /* the ears: they should look too big */
    earUp(c, 15.4, -21.4, 9.4, 3.6, -3.4, p.ear, GG.shade(p.belly, -0.08));
    earUp(c, 21.4, -21.6, 9, 3.4, 3.4, p.ear, GG.shade(p.belly, -0.08));
    c.strokeStyle = a.nose || '#3a322a'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(13.4, -21.4); c.quadraticCurveTo(11.4, -27.4, 14.4, -30.4); c.stroke();
    c.beginPath(); c.moveTo(23.4, -21.6); c.quadraticCurveTo(25.4, -27.4, 22.4, -30.4); c.stroke();

    if (a.antler && !calf) {
      /* forked, and forked again - equal Ys, not one beam with tines */
      c.strokeStyle = antler; c.lineWidth = 1.8; c.lineCap = 'round';
      [[-1, 16.4], [1, 20.4]].forEach(function (q) {
        var s = q[0], bx = q[1];
        c.beginPath(); c.moveTo(bx, -23.4);
        c.quadraticCurveTo(bx + s * 3.4, -28.4, bx + s * 4.4, -31.4); c.stroke();
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(bx + s * 3.6, -29); c.lineTo(bx + s * 1.4, -34.4); c.stroke();
        c.beginPath(); c.moveTo(bx + s * 4.4, -31.4); c.lineTo(bx + s * 8, -34.4); c.stroke();
        c.beginPath(); c.moveTo(bx + s * 2.4, -32.4); c.lineTo(bx + s * 0.4, -36); c.stroke();
        c.beginPath(); c.moveTo(bx + s * 6.4, -33.2); c.lineTo(bx + s * 7.4, -37); c.stroke();
        c.lineWidth = 1.8;
      });
    }

    /* head, with a long straight face */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 18.4, -19.4, 5, 3.6, 0.22);
    c.beginPath();
    c.moveTo(20.4, -21.4);
    c.quadraticCurveTo(26.4, -19.4, 25.4, -15.4);
    c.quadraticCurveTo(21.4, -14.4, 18.4, -16.4);
    c.closePath(); c.fill();
    c.fillStyle = p.face;
    ell(c, 23.4, -16.4, 2.8, 2, 0.2);
    c.fillStyle = p.nose;
    ell(c, 25.2, -16.6, 1.5, 1.2);
    eye(c, 20.4, -20.2, 1.4, p.eye, true);
    c.restore();
    c.restore();
  };

  /* ---------------- moose ----------------
     Not a big deer. Shoulders humped higher than the rump, legs absurdly
     long, body short and deep, a heavy overhanging muzzle, a bell hanging
     from the throat, and PALMATE antlers - flat paddles, not twigs. A cow
     moose has none. */
  S.moose = function (c, a, t, gait) {
    var p = pal(a, { body: '#3a2b22', body2: '#2e231c', belly: '#332619',
      face: '#241b15', ear: '#4a392c', leg: '#9e9385', nose: '#1a1310',
      accent: '#332619', tail: '#2e231c' });
    var calf = !!a.calf;
    var k = calf ? 0.7 : 1;
    var walk = Math.min(1, gait || 0);
    var sway = Math.sin(t * 1.2) * 0.7;
    var antler = a.antler || '#b9a883';

    c.save(); c.translate(0, 14 - 14 * k); c.scale(k, k);

    /* the long pale legs */
    legs4(c, { t: t, speed: 6.2, step: 3.4 * walk, w: 3.2, sep: 2.8,
      hx: -8, sx: 6.4, top: -3, foot: 13.6, hbend: -2.4, fbend: 1.4,
      far: GG.shade(p.leg, -0.22), near: p.leg });
    c.fillStyle = p.nose;
    ell(c, -8, 13.8, 1.8, 1.1); ell(c, 6.4, 13.8, 1.8, 1.1);

    /* short deep body, hump at the shoulder */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-10.4, -5.4);
    c.quadraticCurveTo(-11.4, -11.4, -6, -12.4);     // rump, lower
    c.quadraticCurveTo(1.4, -14.4, 5.4, -17.4);      // up to the hump
    c.quadraticCurveTo(9.4, -16.4, 10, -10.4);
    c.quadraticCurveTo(10.4, -5.4, 7, -3.4);
    c.quadraticCurveTo(-2, -1.4, -10.4, -5.4);
    c.closePath(); c.fill();
    c.fillStyle = p.body2;
    ell(c, 2.4, -14.4, 5.4, 2.6, -0.28);
    c.fillStyle = p.belly;
    ell(c, -2.4, -4, 7.4, 1.8);
    /* a very short tail */
    c.fillStyle = p.tail;
    ell(c, -11.4, -9.4, 1.8, 2.4);

    c.save(); c.translate(0, sway * 0.3);
    /* short thick neck */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(6.4, -16.4);
    c.quadraticCurveTo(11.4, -19.4, 13.4, -21.4);
    c.lineTo(17.4, -17.4);
    c.quadraticCurveTo(13.4, -13.4, 9.4, -10.4);
    c.closePath(); c.fill();
    /* THE bell, hanging from the throat */
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(12.4, -13.4);
    c.quadraticCurveTo(17.4, -11.4, 15.8, -4.4);
    c.quadraticCurveTo(11.6, -5, 11, -11.4);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(p.accent, -0.2);
    ell(c, 13.6, -6.4, 2.2, 1.6, -0.1);

    /* the big ears, out sideways under the antlers */
    c.fillStyle = p.ear;
    ell(c, 8.4, -18.4, 4.4, 2.2, 0.42);
    ell(c, 15.4, -19.4, 4.2, 2.1, -0.38);
    c.fillStyle = GG.shade(p.ear, 0.24);
    ell(c, 8.8, -18.2, 3, 1.3, 0.42);
    ell(c, 15.2, -19.2, 2.8, 1.2, -0.38);

    if (a.antler && !calf) {
      /* THE palms. A moose antler is not a deer's twigs and it is not a
         rake: it is a broad kidney-shaped palm, held nearly flat, sweeping
         out and slightly back from the head, with short blunt tines only
         around the outer rim. The far one goes down first and darker. */
      palmate(c, 15.4, -22.8, 0.62, 12.6, 4.6, GG.shade(antler, -0.3));
      palmate(c, 12.6, -20.6, 0.1, 18, 5.4, antler);
    }

    /* the long head with the heavy drooping muzzle */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    c.beginPath();
    c.moveTo(12.4, -21.4);
    c.quadraticCurveTo(20.4, -21.4, 22.4, -16.4);
    c.quadraticCurveTo(23.4, -11.4, 19.4, -10.4);
    c.quadraticCurveTo(15.4, -11.4, 14, -15.4);
    c.closePath(); c.fill();
    c.fillStyle = p.face;
    c.beginPath();
    c.moveTo(19.4, -15.4);
    c.quadraticCurveTo(23.8, -15, 23.4, -11.4);
    c.quadraticCurveTo(20.4, -9.4, 17.4, -11.4);
    c.closePath(); c.fill();
    c.fillStyle = p.nose;
    ell(c, 22, -13.4, 1.3, 1);
    eye(c, 16.4, -19, 1.4, p.eye, true);
    c.restore();
    c.restore();
  };

  /* ---------------- cow ----------------
     A long deep rectangle on four short posts: straight flat back,
     angular hips, a dewlap under the throat, an udder, ears out
     sideways, a tufted tail - and no upper front teeth. */
  S.cow = function (c, a, t, gait) {
    var p = pal(a, { body: '#f5f2ec', body2: '#e2ded4', belly: '#f0ece2',
      face: '#f5f2ec', ear: '#e2ded4', leg: '#ddd8cc', nose: '#c89d9c',
      accent: '#3a342c', tail: '#e2ded4' });
    var muzzle = a.nose || '#c89d9c';
    var hoofc = a.accent || '#3a342c';
    var walk = Math.min(1, gait || 0);
    var chew = Math.sin(t * 2.6) * 0.5;
    var swish = Math.sin(t * 1.8) * 2;

    legs4(c, { t: t, speed: 5.2, step: 2.8 * walk, w: 3.4, sep: 2.8,
      hx: -9.4, sx: 7.4, top: 2.4, foot: 13.4, hbend: -1.6, fbend: 1,
      far: GG.shade(p.leg, -0.16), near: p.leg });
    c.fillStyle = hoofc;
    ell(c, -9.4, 13.8, 1.9, 1.1); ell(c, 7.4, 13.8, 1.9, 1.1);

    /* the long tail with the tuft */
    c.strokeStyle = p.tail; c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-13.4, -7.4);
    c.quadraticCurveTo(-16.4 + swish, -2.4, -15.4 + swish, 5.4);
    c.stroke();
    c.fillStyle = GG.shade(p.tail, -0.4);
    ell(c, -15.3 + swish, 7, 1.5, 2.4);

    /* the body: a straight flat back */
    function slab(cc) {
      cc.beginPath();
      cc.moveTo(-13.4, 1.4);
      cc.lineTo(-13, -8.6);
      cc.quadraticCurveTo(-11.4, -10.4, -8.4, -9.4);   // the angular hip
      cc.lineTo(7.4, -9.4);
      cc.quadraticCurveTo(12.4, -9, 12, -4.4);
      cc.quadraticCurveTo(12.4, 1.4, 8.4, 3);
      cc.quadraticCurveTo(-2, 4.6, -13.4, 1.4);
      cc.closePath();
    }
    c.fillStyle = p.body; slab(c); c.fill();
    /* the pale underside goes on first, so a patch can lie over it rather
       than showing through as a grey window */
    c.save(); slab(c); c.clip();
    c.fillStyle = p.belly; c.globalAlpha = 0.6;
    ell(c, -2.4, 2.4, 8.4, 1.8);
    c.globalAlpha = 1; c.restore();
    if (a.patch) {
      c.save(); slab(c); c.clip();
      c.fillStyle = a.patch;
      /* irregular hard-edged islands */
      ell(c, -9.4, -5.4, 4.4, 4.4); ell(c, -6.4, -7.4, 3.4, 2.8);
      ell(c, -11.4, -1.4, 3.4, 3);
      ell(c, 3.4, -6.4, 5, 3.8); ell(c, 6.4, -3.4, 3.4, 3.2);
      ell(c, -1.4, 1.4, 3.4, 2.4);
      c.restore();
    }
    /* the udder, back on the hind quarters where it belongs, and kept
       close enough to the body colour that it is not the first thing you see */
    c.fillStyle = GG.shade(muzzle, 0.3); c.globalAlpha = 0.72;
    ell(c, -8.4, 3.2, 2.5, 1.7);
    c.globalAlpha = 1;

    c.save(); c.translate(0, chew * 0.3);
    /* neck and the dewlap hanging below the chin */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(8.4, -9.4);
    c.quadraticCurveTo(13.4, -10.4, 15.4, -12.4);
    c.lineTo(18.4, -8.4);
    c.quadraticCurveTo(14.4, -5.4, 10.4, -3.4);
    c.closePath(); c.fill();
    c.fillStyle = p.body2;
    c.beginPath();
    c.moveTo(13.4, -6.4);
    c.quadraticCurveTo(17.4, -4.4, 16, -0.4);
    c.quadraticCurveTo(12.4, -1.4, 12, -5.4);
    c.closePath(); c.fill();

    /* ears out sideways */
    c.fillStyle = p.ear;
    ell(c, 12.4, -13.4, 3.4, 1.8, -0.5);
    ell(c, 18.4, -13.8, 3.2, 1.7, 0.45);

    /* the long square head */
    function cowHead(cc) {
      cc.beginPath();
      cc.moveTo(12.4, -14.4);
      cc.quadraticCurveTo(19.4, -15.4, 22.4, -12.4);
      cc.quadraticCurveTo(24.4, -9.4, 21.4, -7.4);
      cc.quadraticCurveTo(15.4, -6.4, 13, -9.4);
      cc.closePath();
    }
    c.fillStyle = p.head === p.body ? p.body : p.head;
    cowHead(c); c.fill();
    /* everything on the face is clipped to the head, so nothing hangs out
       of the jaw looking like a tongue */
    c.save(); cowHead(c); c.clip();
    if (a.face && a.face !== (a.head || p.body)) {
      c.fillStyle = a.face;
      ell(c, 18.4, -11.4, 4.6, 3.6, 0.14);
    }
    /* the muzzle pad, square across the whole front of the face */
    c.fillStyle = muzzle;
    c.beginPath();
    c.moveTo(20.4, -13.4);
    c.quadraticCurveTo(25.4, -11.4, 25.4, -8.4);
    c.quadraticCurveTo(24.4, -6.4, 20.4, -6.8);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(muzzle, -0.42);
    ell(c, 22.8, -11.4, 0.75, 0.6); ell(c, 22.8, -8.6, 0.75, 0.6);
    c.strokeStyle = GG.shade(muzzle, -0.3); c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(24, -10); c.quadraticCurveTo(22, -8.6 + chew, 20.4, -9); c.stroke();
    c.restore();
    eye(c, 15.4, -12.4, 1.5, p.eye, true);
    c.restore();
  };

  /* ---------------- horse ----------------
     Withers as a small ridge in front of a level back, sloping shoulder,
     round hindquarters, clean long legs with a knee and a hock, mane
     along the neck and a tail off the TOP of the rump. */
  S.horse = function (c, a, t, gait) {
    var p = pal(a, { body: '#6b4423', body2: '#5a3a1e', belly: '#7d5530',
      face: '#2a241e', ear: '#5a3a1e', leg: '#1c1815', nose: '#2a241e',
      accent: '#3e382f', tail: '#1c1815' });
    var mane = a.mane || p.tail;
    var trot = Math.min(1, gait || 0);
    var sw = Math.sin(t * 1.7) * 1.6;
    var ear = Math.sin(t * 2.3) * 0.1;

    /* the tail, off the top of the rump */
    var tl = ribbon(-12.4, -8.4, -17.4 + sw * 0.4, -2.4, -16.4 + sw, 8.4, 2, 2.6, 14);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();

    legs4(c, { t: t, speed: 8.2, step: 3.6 * trot, w: 2.8, sep: 2.8,
      hx: -8.4, sx: 7.4, top: 0.4, foot: 13.4, hbend: -2.4, fbend: 1.4,
      far: GG.shade(p.body, -0.24), near: p.body });
    /* dark stockings and hooves */
    c.strokeStyle = p.leg; c.lineWidth = 2.6; c.lineCap = 'round';
    [[-8.4, 1], [7.4, 1], [-11.2, 0.86], [4.6, 0.86]].forEach(function (q) {
      c.beginPath(); c.moveTo(q[0], 9.4); c.lineTo(q[0] + 0.3, 12.8); c.stroke();
    });
    c.fillStyle = a.accent || '#3e382f';
    [-8.4, 7.4, -11.2, 4.6].forEach(function (fx) { ell(c, fx, 13.6, 1.8, 1.2); });

    /* body: round quarters, level back, a ridge of withers at the front */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-12.4, -2.4);
    c.quadraticCurveTo(-13.4, -9.4, -7.4, -10.4);
    c.lineTo(3.4, -10.6);
    c.quadraticCurveTo(7.4, -12, 8.4, -10);        // the withers
    c.quadraticCurveTo(12.4, -7.4, 10.4, -1.4);
    c.quadraticCurveTo(0, 2.6, -12.4, -2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, -2.4, -0.8, 8.4, 1.8);
    c.fillStyle = p.body2;
    ell(c, -9.4, -5.4, 4.4, 4.4);

    if (a.rideable) {
      /* a saddle pad and a small saddle, so a rideable one looks it */
      c.fillStyle = a.accent || '#8a5a2a';
      GG.roundRect(c, -4.4, -12.4, 11.4, 4.4, 1.6); c.fill();
      c.fillStyle = GG.shade(a.accent || '#8a5a2a', -0.35);
      c.beginPath();
      c.moveTo(-2.4, -12);
      c.quadraticCurveTo(1.4, -15.4, 4.4, -12);
      c.quadraticCurveTo(1.4, -10.4, -2.4, -12);
      c.closePath(); c.fill();
      c.strokeStyle = GG.shade(a.accent || '#8a5a2a', -0.45); c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(1.4, -10.4); c.lineTo(1.4, -3.4); c.stroke();
    }

    /* the sloping neck */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(6.4, -11.4);
    c.quadraticCurveTo(12.4, -14.4, 15.4, -20.4);
    c.lineTo(19.4, -18.4);
    c.quadraticCurveTo(16.4, -12.4, 11.4, -7.4);
    c.closePath(); c.fill();
    /* the mane along the back of the neck */
    c.fillStyle = mane;
    c.beginPath();
    c.moveTo(5.4, -11.4);
    c.quadraticCurveTo(11.4, -15.4, 15, -21.6);
    c.lineTo(17.8, -20.2);
    c.quadraticCurveTo(13.4, -14.4, 8.4, -9.8);
    c.closePath(); c.fill();
    /* a few soft locks falling off the crest, rather than a row of teeth */
    c.fillStyle = mane;
    for (var m = 0; m < 4; m++) {
      var mx = 8.4 + m * 2.1, my = -12.8 - m * 2.1;
      c.beginPath();
      c.moveTo(mx, my);
      c.quadraticCurveTo(mx - 3.4, my - 0.8, mx - 4, my + 1.8);
      c.quadraticCurveTo(mx - 2, my + 0.8, mx, my + 1.6);
      c.closePath(); c.fill();
    }

    /* small mobile ears */
    earUp(c, 15.4, -21.4, 4.4, 1.6, -1 + ear * 4, p.ear, GG.shade(p.ear, 0.25));
    earUp(c, 18.6, -21.6, 4.2, 1.5, 1 - ear * 4, p.ear, GG.shade(p.ear, 0.25));

    /* the long straight head */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    c.beginPath();
    c.moveTo(15.4, -21.4);
    c.quadraticCurveTo(21.4, -21, 23.4, -16.4);
    c.quadraticCurveTo(24.4, -12.4, 21.4, -11.4);
    c.quadraticCurveTo(17.4, -13.4, 16, -17.4);
    c.closePath(); c.fill();
    /* the forelock between the ears */
    c.fillStyle = mane;
    c.beginPath();
    c.moveTo(16.4, -21.4); c.quadraticCurveTo(19.4, -23.4, 20.4, -19.4);
    c.quadraticCurveTo(18.4, -19, 16.4, -20.4); c.closePath(); c.fill();
    c.fillStyle = p.face;
    ell(c, 22.4, -13, 2.2, 1.9, 0.2);
    c.fillStyle = a.nose || '#171310';
    ell(c, 22.8, -14, 0.7, 0.6);
    /* the huge eye, set on the side of the head */
    eye(c, 18.4, -18.4, 1.7, p.eye, true);
  };

  /* ---------------- duck ----------------
     A drake mallard: green head, thin white collar, brown breast, grey
     body, black rear with the little CURLED tail feather, and the blue
     white-edged speculum on the folded wing - which a hen has too. */
  S.duck = function (c, a, t, gait) {
    var p = pal(a, { body: '#b9b4a8', body2: '#a39e92', belly: '#cfcabe',
      head: '#1f6b3f', face: '#1f6b3f', accent: '#f5f2ec', nose: '#1a1714',
      leg: '#e08a2f', tail: '#1a1714' });
    var breast = a.body2 || GG.shade(p.body, -0.4);
    var wingc = GG.shade(p.body, -0.13);
    var bill = a.bill || '#d9b546';
    var spec = a.speculum || '#2e4fa0';
    var waddle = Math.min(1, gait || 0);
    var rock = Math.sin(t * 6) * 1.6 * waddle;
    var look = Math.sin(t * 1.3) * 0.7;

    /* legs, set well back */
    c.strokeStyle = GG.shade(p.leg, -0.2); c.lineWidth = 1.8; c.lineCap = 'round';
    var fa = Math.sin(t * 6) * 2 * waddle, fb = -fa;
    c.beginPath(); c.moveTo(-2.4, 8.4); c.lineTo(-3 + fb, 12.8); c.stroke();
    c.fillStyle = GG.shade(p.leg, -0.2);
    c.beginPath();
    c.moveTo(-3 + fb, 12.6); c.lineTo(-6.4 + fb, 14); c.lineTo(1 + fb, 14);
    c.closePath(); c.fill();
    c.strokeStyle = p.leg; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(1.4, 8.4); c.lineTo(1 + fa, 12.8); c.stroke();
    c.fillStyle = p.leg;
    c.beginPath();
    c.moveTo(1 + fa, 12.6); c.lineTo(-2.4 + fa, 14); c.lineTo(5 + fa, 14);
    c.closePath(); c.fill();

    c.save(); c.rotate(rock * 0.012);

    /* the black rear, tail lifted */
    c.fillStyle = p.tail;
    c.beginPath();
    c.moveTo(-7.4, -1.4);
    c.quadraticCurveTo(-14.4, -3.4, -18.4, -5.4);
    c.quadraticCurveTo(-13.4, -0.4, -12.4, 4.4);
    c.quadraticCurveTo(-10.4, 5.6, -7.4, 5.4);
    c.closePath(); c.fill();

    /* the low horizontal body */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-11.4, 2.4);
    c.quadraticCurveTo(-11, -4.4, -2, -5.6);
    c.quadraticCurveTo(8, -6.4, 10.4, -0.4);
    c.quadraticCurveTo(11.4, 6.4, 2.4, 8.4);
    c.quadraticCurveTo(-8, 8.4, -11.4, 2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, -0.4, 6, 8.4, 2.4);
    /* the brown breast */
    c.fillStyle = breast;
    ell(c, 7.4, 0.4, 4.4, 4.6, -0.14);

    /* the folded wing, with THE speculum along its lower edge */
    c.fillStyle = wingc;
    c.beginPath();
    c.moveTo(-9.4, -1.4);
    c.quadraticCurveTo(-1.4, -5.4, 6.4, -2.4);
    c.quadraticCurveTo(-0.4, 3.4, -9, 2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(-8.4, 0); c.quadraticCurveTo(-2.4, -0.6, 3.4, -0.4);
    c.lineTo(3.4, 0.7); c.lineTo(-8.4, 1.1); c.closePath(); c.fill();
    c.fillStyle = spec;
    c.beginPath();
    c.moveTo(-8.4, 1); c.quadraticCurveTo(-2.4, 0.5, 3.4, 0.6);
    c.lineTo(3.4, 2.3); c.lineTo(-8.2, 2.7); c.closePath(); c.fill();
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(-8.2, 2.6); c.quadraticCurveTo(-2.4, 2.2, 3.4, 2.2);
    c.lineTo(3.2, 3.1); c.lineTo(-8.2, 3.5); c.closePath(); c.fill();

    /* THE curl on the rump */
    c.strokeStyle = p.tail; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-9.4, -2.6);
    c.bezierCurveTo(-13.4, -6.4, -10.4, -9.4, -7.4, -7);
    c.stroke();

    c.save(); c.translate(0, look * 0.4);
    /* the short S of a neck */
    c.fillStyle = p.head;
    c.beginPath();
    c.moveTo(8.4, -2.4);
    c.quadraticCurveTo(11.4, -5.4, 11.4, -9.4);
    c.lineTo(15.4, -9.4);
    c.quadraticCurveTo(15.4, -3.4, 12.4, -0.4);
    c.closePath(); c.fill();
    /* the thin white collar */
    c.strokeStyle = p.accent; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(8.8, -3.4); c.quadraticCurveTo(12.4, -4.8, 15.2, -3.4); c.stroke();
    /* the head */
    c.fillStyle = p.head;
    ell(c, 14, -8.4, 4.8, 4.4);
    c.fillStyle = p.face === p.head ? 'rgba(255,255,255,0.12)' : p.face;
    ell(c, 13.4, -10.4, 2.8, 1.4, -0.2);
    /* the broad flat bill, as long as the head */
    c.fillStyle = bill;
    c.beginPath();
    c.moveTo(17, -9.8);
    c.quadraticCurveTo(24.4, -9.4, 24.4, -7.4);
    c.quadraticCurveTo(23.4, -6, 17.4, -6.4);
    c.closePath(); c.fill();
    c.fillStyle = a.nose && a.nose !== bill ? a.nose : GG.shade(bill, -0.3);
    ell(c, 23.4, -7.6, 1.1, 0.9);
    c.strokeStyle = GG.shade(bill, -0.25); c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(17.4, -7.6); c.quadraticCurveTo(21.4, -7.2, 24.2, -7.4); c.stroke();
    eye(c, 15.8, -9.6, 1.3, p.eye);
    c.restore();
    c.restore();
  };

  /* ---------------- otter ----------------
     A long tube with a thick muscular tail that starts as wide as the
     body and tapers to a point. No neck to speak of, very short legs,
     a broad flat head and a silvery throat. */
  S.otter = function (c, a, t, gait) {
    var p = pal(a, { body: '#4a3a2c', body2: '#6b5544', belly: '#b9ac96',
      face: '#cfc3ac', ear: '#3a2e24', leg: '#3f3226', nose: '#2a231c',
      accent: '#ede7d9', tail: '#4a3a2c' });
    var lope = Math.min(1, gait || 0);
    var hump = Math.abs(Math.sin(t * 6.4)) * 2.4 * lope;
    var wig = Math.sin(t * 1.6) * 0.8;

    /* THE tail: as wide as the body at the root, a point at the end */
    var tl = ribbon(-5.4, 6, -15.4, 7.4 + wig * 0.4, -24.4, 10.4 + wig, 3.4, 0.7, 14);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();

    /* the very short legs */
    c.strokeStyle = GG.shade(p.leg, -0.16); c.lineWidth = 3.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-3.4, 7.4); c.lineTo(-4.8, 12.2); c.stroke();
    c.beginPath(); c.moveTo(9.4, 7); c.lineTo(10.8, 12.2); c.stroke();
    c.strokeStyle = GG.shade(p.leg, 0.14); c.lineWidth = 3.4;
    c.beginPath(); c.moveTo(-0.4, 7.4); c.lineTo(-1.8, 12.4); c.stroke();
    c.beginPath(); c.moveTo(12.4, 7); c.lineTo(13.8, 12.4); c.stroke();
    /* webbed feet */
    c.fillStyle = GG.shade(p.leg, 0.24);
    [[-4.8, 12.2], [-1.8, 12.4], [10.8, 12.2], [13.8, 12.4]].forEach(function (q) {
      ell(c, q[0], q[1] + 0.9, 2.6, 1.3);
    });

    /* the cylinder, arched a little as it lopes */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-6.4, 6.4);
    c.quadraticCurveTo(-8, -0.6 - hump, 0, -1.6 - hump);
    c.quadraticCurveTo(8, -2.4 - hump, 13.4, 0.4);
    c.quadraticCurveTo(16.4, 4.4, 12.4, 7.6);
    c.quadraticCurveTo(2, 9.6, -6.4, 6.4);
    c.closePath(); c.fill();
    c.fillStyle = p.body2;
    ell(c, 2.4, 0.4 - hump * 0.7, 8.4, 2.4, -0.05);
    /* the silvery throat and chest */
    c.fillStyle = p.belly;
    ell(c, 8.4, 6.6, 6.4, 2.2, -0.1);

    /* the broad flat head, no neck */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 16.4, 1.4, 5.8, 4.6, -0.12);
    c.beginPath();
    c.moveTo(18, -0.6);
    c.quadraticCurveTo(23.8, -0.6, 23.8, 2.6);
    c.quadraticCurveTo(21.4, 4.8, 17.4, 4.4);
    c.closePath(); c.fill();
    /* the wide pale muzzle */
    c.fillStyle = p.face;
    ell(c, 21.4, 3, 3.2, 2.4, -0.05);
    c.fillStyle = p.nose;
    ell(c, 23.2, 1.2, 1.5, 1.2);
    /* small round ears, high and back */
    earRound(c, 13.4, -1.8, 1.8, p.ear, GG.shade(p.face, -0.2));
    eye(c, 18.4, -0.6, 1.4, p.eye, true);
    /* the thick whiskers */
    c.strokeStyle = p.accent; c.lineWidth = 0.6;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(22.4, 2.4); c.lineTo(29.4, 0.4 + w * 2.6); c.stroke();
      c.beginPath(); c.moveTo(21.4, 3.6); c.lineTo(27.4, 5.6 + w * 1.4); c.stroke();
    }
  };

  /* ---------------- sheep ----------------
     A cloud of fleece with a smooth face and clean thin legs poking out
     at the corners - that contrast is the whole animal at 40px. Not
     white: cream to grey, and often a black face. */
  S.sheep = function (c, a, t, gait) {
    var p = pal(a, { body: '#e4dccc', body2: '#bfb5a0', belly: '#d8cfba',
      face: '#2a2520', ear: '#2a2520', leg: '#2a2520', nose: '#15120f',
      accent: '#3a342c', tail: '#e4dccc', eye: '#3a2e1e' });
    var walk = Math.min(1, gait || 0);
    var graze = Math.sin(t * 1.4) * 0.5;

    /* thin clean legs */
    legs4(c, { t: t, speed: 5.6, step: 2.2 * walk, w: 2.2, sep: 2.4,
      hx: -7.4, sx: 6.4, top: 4.4, foot: 13.4, hbend: -1.2, fbend: 0.8,
      far: GG.shade(p.leg, 0.22), near: p.leg });
    c.fillStyle = a.accent || '#3a342c';
    ell(c, -7.4, 13.8, 1.5, 1); ell(c, 6.4, 13.8, 1.5, 1);

    /* the fleece */
    c.fillStyle = p.body;
    fleecePath(c, -1.4, -0.4, 11.4, 7.4, 13); c.fill();
    c.save();
    fleecePath(c, -1.4, -0.4, 11.4, 7.4, 13); c.clip();
    c.fillStyle = p.belly === p.body ? p.body2 : p.belly; c.globalAlpha = 0.55;
    ell(c, -5.4, 3.4, 8.4, 4.4); ell(c, 4.4, 4.4, 5.4, 3);
    c.globalAlpha = 1;
    if (a.patch) {
      c.fillStyle = a.patch;
      ell(c, -7.4, -3.4, 5.4, 4.4); ell(c, -3.4, -5.4, 3.4, 2.8);
    }
    /* a few curls, so it reads as wool and not as a potato */
    c.strokeStyle = p.body2; c.lineWidth = 0.9; c.lineCap = 'round';
    var r = GG.mulberry32(17);
    for (var i = 0; i < 12; i++) {
      var cx = -11 + r() * 20, cy = -6 + r() * 12;
      c.beginPath(); c.arc(cx, cy, 1.5, 0.6, 4.2); c.stroke();
    }
    c.restore();
    /* a short tail */
    c.fillStyle = p.tail;
    ell(c, -12.4, -1.4, 2.2, 2.6);

    c.save(); c.translate(0, graze);
    /* ears, out and drooping */
    c.fillStyle = p.ear;
    ell(c, 9.4, -6.4, 3.4, 1.6, 0.45);
    ell(c, 15.4, -7, 3.2, 1.5, -0.35);
    /* the smooth face on a slim neck */
    c.fillStyle = a.head && a.head !== a.body ? p.head : p.face;
    c.beginPath();
    c.moveTo(8.4, -2.4);
    c.quadraticCurveTo(11.4, -6.4, 14.4, -7.4);
    c.quadraticCurveTo(19.4, -7.4, 19.4, -3.4);
    c.quadraticCurveTo(17.4, 0.4, 13.4, 0.4);
    c.quadraticCurveTo(9.4, 0.4, 8.4, -2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.nose;
    ell(c, 19, -4.4, 1.2, 1);
    /* the wide horizontal bar of a pupil */
    c.fillStyle = GG.shade(p.eye, 0.5);
    ell(c, 15.4, -5, 1.7, 1.5);
    c.fillStyle = '#17130f';
    ell(c, 15.4, -5, 1.4, 0.55);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    ell(c, 15.9, -5.8, 0.5, 0.4);
    c.strokeStyle = GG.shade(p.face, 0.35); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(18.8, -3.4); c.quadraticCurveTo(16.4, -1.8, 14, -2.6); c.stroke();
    c.restore();
  };

  /* ---------------- chicken ----------------
     A teardrop tipped nose-down with the tail up at the back and the
     neck an upright curve. Comb, wattles, a short triangular beak and
     scaly legs with three forward toes. */
  S.chicken = function (c, a, t, gait) {
    var p = pal(a, { body: '#7a3a1c', body2: '#632e14', belly: '#8e4a24',
      face: '#c2302a', ear: '#c2302a', leg: '#e0b04a', nose: '#e0b04a',
      accent: '#4a2010', tail: '#4a2010', eye: '#c9a227' });
    var step = Math.min(1, gait || 0);
    /* the head stays still in space while the body moves under it */
    var bob = Math.sin(t * 5.4) * 1.6 * (0.3 + step);
    var comb = a.face || '#c2302a';

    /* scaly legs with three forward toes */
    var fa = Math.sin(t * 6.4) * 2.2 * step, fb = -fa;
    [[-1.4, fb, GG.shade(p.leg, -0.2)], [2.4, fa, p.leg]].forEach(function (q) {
      c.strokeStyle = q[2]; c.lineWidth = 1.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(q[0], 8.4); c.lineTo(q[0] + q[1], 12.6); c.stroke();
      c.lineWidth = 1.1;
      for (var k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(q[0] + q[1], 12.6);
        c.lineTo(q[0] + q[1] + 1.4 + k * 1.6, 14); c.stroke();
      }
      c.beginPath();
      c.moveTo(q[0] + q[1], 12.6); c.lineTo(q[0] + q[1] - 2, 13.6); c.stroke();
    });

    /* the tail, a short fan carried up and back */
    for (var f = -2; f <= 2; f++) {
      var ta = -Math.PI * 0.74 + f * 0.155, tlen = 12.4 - Math.abs(f) * 1.5;
      feather(c, -5.6, 1, ta, tlen, 2.1, 1.1, GG.shade(p.tail, 0.3));
      feather(c, -5.6, 1, ta, tlen * 0.94, 1.6, 0.7,
        f === 0 ? p.tail : GG.shade(p.tail, f < 0 ? -0.16 : 0.18));
    }

    /* the teardrop body */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-7.4, 1.4);
    c.quadraticCurveTo(-6.4, -6.4, 2, -7.4);
    c.quadraticCurveTo(9.4, -6.4, 9.4, 0.4);
    c.quadraticCurveTo(8.4, 7.4, 1.4, 8.4);
    c.quadraticCurveTo(-5.4, 8, -7.4, 1.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, 3.4, 5.4, 5.4, 2.8, -0.08);
    /* the folded wing */
    c.fillStyle = p.body2;
    c.beginPath();
    c.moveTo(-5.4, -1.4);
    c.quadraticCurveTo(1.4, -4.4, 6.4, -0.4);
    c.quadraticCurveTo(1.4, 4.4, -4.4, 2.4);
    c.closePath(); c.fill();
    c.strokeStyle = p.accent; c.lineWidth = 0.7;
    for (var i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(-3.4 + i * 2.6, 1.4); c.lineTo(-4.4 + i * 2.6, 3.4); c.stroke();
    }

    c.save(); c.translate(0, -bob * 0.25);
    /* the upright curve of the neck */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(4.4, -5.4);
    c.quadraticCurveTo(7.4, -9.4, 8.4, -12.4);
    c.lineTo(12.4, -11.4);
    c.quadraticCurveTo(11.4, -7.4, 9.4, -3.4);
    c.closePath(); c.fill();
    /* head */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 11.4, -13, 3.6, 3.2);
    /* the comb */
    c.fillStyle = comb;
    c.beginPath();
    c.moveTo(8.4, -15);
    c.quadraticCurveTo(9.4, -18.4, 10.6, -15.8);
    c.quadraticCurveTo(11.8, -18.8, 12.8, -15.8);
    c.quadraticCurveTo(13.8, -18.2, 14.4, -15.2);
    c.quadraticCurveTo(11.4, -13.6, 8.4, -15);
    c.closePath(); c.fill();
    /* the wattles */
    c.fillStyle = comb;
    ell(c, 13.4, -9.6, 1.3, 2.1);
    ell(c, 11.9, -9.8, 1.1, 1.8);
    /* the earlobe, the little patch behind the eye */
    c.fillStyle = p.ear;
    ell(c, 10.4, -11.4, 1.1, 1.5);
    /* the short triangular beak */
    c.fillStyle = p.nose;
    c.beginPath();
    c.moveTo(14.4, -13.8); c.lineTo(18.4, -12.4); c.lineTo(14.4, -11.2);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(p.nose, -0.35); c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(14.4, -12.4); c.lineTo(18.2, -12.4); c.stroke();
    eye(c, 12.8, -13.8, 1.2, p.eye);
    c.fillStyle = '#1a1510'; ell(c, 12.8, -13.8, 0.6, 0.6);
    c.restore();
  };

  /* ---------------- owl ----------------
     A BURROWING owl: small, round-headed, no ear tufts at all, and up on
     long legs on the ground. Bright yellow eyes under broad buffy-white
     eyebrows. It bobs when it is nervous. */
  S.owl = function (c, a, t, gait) {
    var p = pal(a, { body: '#8a6f4e', body2: '#6f5738', belly: '#c9b48f',
      face: '#c9b48f', leg: '#9c8768', nose: '#d6d0c0', accent: '#ede4ce',
      tail: '#7a6244', eye: '#f2c230' });
    var disc = a.disc || p.face;
    var brow = a.brow || '#f5efdf';
    var bob = Math.abs(Math.sin(t * 2.6)) * 1.8;
    var strut = Math.min(1, gait || 0);
    var fa = Math.sin(t * 6.8) * 2.2 * strut, fb = -fa;

    /* THE long legs */
    c.strokeStyle = GG.shade(p.leg, -0.2); c.lineWidth = 1.9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.4, 4.4 - bob); c.lineTo(-2 + fb, 12.6); c.stroke();
    c.strokeStyle = p.leg; c.lineWidth = 2;
    c.beginPath(); c.moveTo(2, 4.4 - bob); c.lineTo(2.4 + fa, 12.6); c.stroke();
    c.strokeStyle = GG.shade(p.leg, -0.25); c.lineWidth = 1.1;
    [[-2 + fb], [2.4 + fa]].forEach(function (q) {
      for (var k = -1; k <= 1; k++) {
        c.beginPath(); c.moveTo(q[0], 12.6); c.lineTo(q[0] + 1.4 + k * 1.5, 14); c.stroke();
      }
    });

    c.save(); c.translate(0, -bob);

    /* the short tail sticking out behind */
    c.fillStyle = p.tail;
    c.beginPath();
    c.moveTo(-4.4, -1); c.lineTo(-10.4, 3.4); c.lineTo(-9.4, 6.2); c.lineTo(-3.4, 4.4);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(p.tail, -0.25); c.lineWidth = 0.6;
    for (var b = 0; b < 3; b++) {
      c.beginPath(); c.moveTo(-5.2 - b * 1.7, 0.6 + b * 1.2); c.lineTo(-4.6 - b * 1.7, 4.4); c.stroke();
    }

    /* the small upright body */
    function bod(cc) {
      cc.beginPath();
      cc.moveTo(-5.4, 0.4);
      cc.quadraticCurveTo(-6.4, -7.4, 0, -9.4);
      cc.quadraticCurveTo(6.4, -8.4, 6.4, -1.4);
      cc.quadraticCurveTo(6, 4.4, 0.4, 5.4);
      cc.quadraticCurveTo(-4.4, 5, -5.4, 0.4);
      cc.closePath();
    }
    c.fillStyle = p.body; bod(c); c.fill();
    c.save(); bod(c); c.clip();
    /* the barred breast */
    c.fillStyle = p.belly;
    ell(c, 3.4, -1.4, 4.4, 6.4);
    c.strokeStyle = p.body2; c.lineWidth = 1;
    for (var i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(0.4, -6.4 + i * 2.6);
      c.quadraticCurveTo(4.4, -5.4 + i * 2.6, 7.4, -6.8 + i * 2.6);
      c.stroke();
    }
    /* the buffy spotting on the back */
    c.fillStyle = p.accent;
    var r = GG.mulberry32(29);
    for (var k2 = 0; k2 < 9; k2++) ell(c, -6 + r() * 6, -9 + r() * 13, 0.85, 0.7);
    c.restore();

    /* the folded wing */
    c.fillStyle = p.body2;
    c.beginPath();
    c.moveTo(-4.4, -5.4);
    c.quadraticCurveTo(1.4, -7.4, 2.4, -1.4);
    c.quadraticCurveTo(0.4, 3.4, -4, 2.4);
    c.closePath(); c.fill();
    c.fillStyle = p.accent;
    for (var s2 = 0; s2 < 5; s2++) ell(c, -3.4 + (s2 % 2) * 2.4, -4.4 + s2 * 1.5, 0.75, 0.6);

    /* the big round head - NO tufts */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 1.4, -14.4, 6.4, 5.8);
    /* the facial disc */
    c.fillStyle = disc;
    ell(c, 3.4, -13.8, 4.4, 4.4);
    /* THE broad buffy-white eyebrow */
    c.fillStyle = brow;
    c.beginPath();
    c.moveTo(0.4, -17.4);
    c.quadraticCurveTo(5.4, -19.4, 7.4, -16.4);
    c.quadraticCurveTo(4.4, -15.6, 0.6, -16.2);
    c.closePath(); c.fill();
    /* the white throat */
    c.fillStyle = brow;
    ell(c, 4.4, -10.4, 2.8, 1.4, -0.15);

    eye(c, 4.4, -14.8, 2.1, p.eye);
    c.fillStyle = '#17130d'; ell(c, 4.6, -14.8, 1.1, 1.1);
    c.fillStyle = 'rgba(255,255,255,0.85)'; ell(c, 5.2, -15.5, 0.5, 0.5);
    /* the small pale bill */
    c.fillStyle = p.nose;
    c.beginPath();
    c.moveTo(6.4, -13.4); c.quadraticCurveTo(9.4, -12.6, 6.8, -11.2);
    c.closePath(); c.fill();
    c.restore();
  };

  /* ---------------- koala ----------------
     Upright and clinging, the way a koala actually sits - not a
     side-on quadruped. No tail. A head that is mostly ears and nose:
     oversized round ears with a shaggy white fringe, and a big spoon
     of a black nose taking up a third of the face. */
  S.koala = function (c, a, t) {
    var p = pal(a, { body: '#9aa2a7', body2: '#848d93', belly: '#f1f0eb',
      face: '#f1f0eb', ear: '#8e979d', leg: '#79838a', nose: '#241f1d',
      accent: '#c8ced1', tail: '#9aa2a7' });
    var doze = Math.sin(t * 1.1) * 0.6;
    var blink = Math.sin(t * 0.7) > 0.965;

    c.save(); c.translate(0, doze * 0.4);

    /* the far arm and leg, reaching round something */
    c.strokeStyle = p.leg; c.lineWidth = 4.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.4, 0.4); c.quadraticCurveTo(5.4, -0.6, 8.4, 2.4); c.stroke();
    c.beginPath(); c.moveTo(-2.4, 8.4); c.quadraticCurveTo(3.4, 9.4, 5.4, 12.6); c.stroke();

    /* the round upright body */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-8.4, 6.4);
    c.quadraticCurveTo(-10.4, -3.4, -3.4, -6.4);
    c.quadraticCurveTo(4.4, -8.4, 7.4, -1.4);
    c.quadraticCurveTo(9.4, 7.4, 3.4, 12.6);
    c.quadraticCurveTo(-5.4, 13.6, -8.4, 6.4);
    c.closePath(); c.fill();
    c.fillStyle = p.belly;
    ell(c, 2.4, 3.4, 4.4, 5.4, -0.12);
    /* the shaggy edge down the back */
    c.strokeStyle = p.body2; c.lineWidth = 1.4; c.lineCap = 'round';
    for (var sh = 0; sh < 7; sh++) {
      var sy = -4.4 + sh * 2.3;
      c.beginPath();
      c.moveTo(-7.6 + Math.sin(sh) * 0.4, sy);
      c.lineTo(-9.8 + Math.sin(sh) * 0.5, sy + 1.1); c.stroke();
    }

    /* the near arm and leg, gripping in front */
    c.strokeStyle = p.body2; c.lineWidth = 4.6;
    c.beginPath(); c.moveTo(2.4, 1.4); c.quadraticCurveTo(9.4, 0.4, 12, 4.4); c.stroke();
    c.beginPath(); c.moveTo(0.4, 9.4); c.quadraticCurveTo(6.4, 10.4, 8.4, 13.4); c.stroke();
    c.strokeStyle = GG.shade(p.nose, 0.35); c.lineWidth = 1;
    [[12.4, 4.6], [8.8, 13.4]].forEach(function (q) {
      for (var k = -1; k <= 1; k++) {
        c.beginPath(); c.moveTo(q[0] - 0.6, q[1]);
        c.lineTo(q[0] + 2.2, q[1] + k * 1.7 - 0.2); c.stroke();
      }
    });

    /* THE ears: oversized and round, with a shaggy white fringe round
       the outside only - drawn before the head so they sit behind it */
    [[-2.4, -11.4, 4.6], [9.4, -12.4, 4.2]].forEach(function (q) {
      c.strokeStyle = p.accent; c.lineWidth = 1.7; c.lineCap = 'round';
      for (var i = 0; i < 11; i++) {
        var ang = Math.PI * (0.52 + i / 10 * 1.06);
        c.beginPath();
        c.moveTo(q[0] + Math.cos(ang) * q[2] * 0.82, q[1] + Math.sin(ang) * q[2] * 0.82);
        c.lineTo(q[0] + Math.cos(ang) * (q[2] + 2.2), q[1] + Math.sin(ang) * (q[2] + 2.2));
        c.stroke();
      }
      c.fillStyle = p.ear; ell(c, q[0], q[1], q[2], q[2] * 0.96);
      c.fillStyle = GG.shade(p.ear, -0.16);
      ell(c, q[0] + q[2] * 0.14, q[1] + q[2] * 0.16, q[2] * 0.56, q[2] * 0.52);
    });

    /* the head */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 3.4, -10.4, 6.6, 5.8);
    c.fillStyle = p.face;
    ell(c, 5.4, -8.4, 4.4, 3.4);
    /* THE nose: huge, flat and spoon-shaped, a third of the face */
    c.fillStyle = p.nose;
    c.beginPath();
    c.moveTo(7.4, -14);
    c.quadraticCurveTo(13, -13.2, 12.8, -9.4);
    c.quadraticCurveTo(12, -5.4, 8.4, -6.2);
    c.quadraticCurveTo(6, -9.4, 6.9, -12.6);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.18)';
    ell(c, 9.8, -12.2, 1.7, 1, -0.3);
    c.fillStyle = GG.shade(p.nose, 0.35);
    ell(c, 11.8, -9.6, 0.55, 1);

    if (blink) {
      c.strokeStyle = '#241f1d'; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(1.4, -12.6); c.lineTo(4.4, -12.6); c.stroke();
    } else {
      eye(c, 2.8, -12.8, 1.5, p.eye);
    }
    c.restore();
  };

  /* ---------------- ocelot ----------------
     A compact low cat with big paws, a rounded head and a SHORT tail
     (a long trailing one belongs to a margay). Its markings are
     chain-like and run in LINES along the body - not scattered
     leopard dots - and they go on last so nothing washes them out. */
  S.ocelot = function (c, a, t, gait) {
    var p = pal(a, { body: '#d6b173', body2: '#c39a5c', belly: '#f3ede2',
      face: '#f3ede2', ear: '#211c18', leg: '#cfa868', nose: '#8a5a4a',
      accent: '#2a2118', tail: '#d6b173', eye: '#c8a83c' });
    var prowl = Math.min(1, gait || 0);
    var sw = Math.sin(t * 2) * 1.6;

    /* the short ringed tail */
    var tl = ribbon(-10.4, -0.4, -16.4, 0.4 + sw * 0.3, -19.4, 5.4 + sw, 2.2, 1.6, 12);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();
    c.save(); ribbonPath(c, tl); c.clip();
    ribbonRings(c, tl, p.accent, 4, 0.1, 2.2);
    c.restore();
    c.fillStyle = p.accent; ell(c, -19.3, 5.4 + sw, 1.7, 1.7);

    legs4(c, { t: t, speed: 8.4, step: 3 * prowl, w: 3.4, sep: 2.4,
      hx: -7.4, sx: 8, top: 3.4, foot: 13, hbend: -1.4, fbend: 1,
      far: p.body2, near: p.leg });
    /* noticeably large paws */
    c.fillStyle = GG.shade(p.body, 0.18);
    [-7.4, -9.8, 8, 5.6].forEach(function (fx) { ell(c, fx, 13.4, 2.6, 1.5); });

    /* the low muscular body */
    function cat(cc) {
      cc.beginPath();
      cc.moveTo(-11, 1.4);
      cc.quadraticCurveTo(-12.4, -5.4, -4.4, -6.4);
      cc.quadraticCurveTo(4.4, -7.6, 11.4, -4.4);
      cc.quadraticCurveTo(14.4, -1.4, 12, 3.4);
      cc.quadraticCurveTo(0, 6.6, -11, 1.4);
      cc.closePath();
    }
    c.fillStyle = p.body; cat(c); c.fill();
    c.fillStyle = p.belly;
    ell(c, 0.4, 3.8, 9.4, 1.9);

    /* head */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 15.4, -5.4, 5.4, 4.8);
    c.fillStyle = p.face;
    ell(c, 18, -3.4, 3, 2.4);
    c.fillStyle = p.nose;
    c.beginPath();
    c.moveTo(19, -5.2); c.lineTo(21, -5.2); c.lineTo(20, -3.8); c.closePath(); c.fill();
    /* the ears: black backs with the bright central spot */
    [[12.4, -8.4, -1.6], [17.8, -8.8, 1.4]].forEach(function (q) {
      earUp(c, q[0], q[1], 5.4, 2.6, q[2], p.ear, null);
      /* the bright spot in the middle of the black ear-back */
      c.fillStyle = '#e8e2d6';
      ell(c, q[0] + q[2] * 0.3, q[1] - 2.4, 1.1, 1.5);
    });

    eye(c, 17.4, -6.8, 1.6, p.eye, true);
    c.fillStyle = '#1e1a16'; ell(c, 17.4, -6.8, 0.6, 1.4);
    c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 0.55;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(19.4, -3.4); c.lineTo(26.4, -5.4 + w * 2.4); c.stroke();
    }

    /* THE chain markings, drawn last, over everything */
    c.save(); cat(c); c.clip();
    /* elongated open rosettes, linked into two chains running along the
       body - not the scattered round dots of a leopard */
    c.strokeStyle = p.accent; c.lineWidth = 1.05;
    for (var row = 0; row < 2; row++) {
      var ry = -3.4 + row * 4.2, off = row * 3.4;
      for (var i = 0; i < 3; i++) {
        var cx = -7.4 + off + i * 6.4;
        c.beginPath();
        c.ellipse(cx, ry, 3, 1.5, -0.1, 0, Math.PI * 2);
        c.stroke();
        /* the link between one rosette and the next */
        c.beginPath();
        c.moveTo(cx + 3, ry + 0.2); c.lineTo(cx + 3.4, ry + 0.2); c.stroke();
      }
    }
    /* a row of small solid spots low on the flank */
    c.fillStyle = p.accent;
    for (var k2 = 0; k2 < 5; k2++) ell(c, -7.4 + k2 * 4.2, 3.4, 0.85, 0.6);
    c.restore();
    /* and the two cheek stripes */
    c.strokeStyle = p.accent; c.lineWidth = 0.9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(14.4, -4.4); c.quadraticCurveTo(16.4, -2.4, 17.4, -1.4); c.stroke();
    c.beginPath(); c.moveTo(12.6, -3.4); c.quadraticCurveTo(14.4, -1.4, 15.4, -0.4); c.stroke();
    c.beginPath(); c.moveTo(12.4, -9.4); c.quadraticCurveTo(14, -7.4, 14.4, -5.4); c.stroke();
  };

  /* ---------------- redpanda ----------------
     Not a small giant panda and not a fox. Long, low and short-legged,
     with a thick RINGED tail carried horizontally, blunt white-rimmed
     ears, a broad flat white face with rust tear marks - and legs and
     belly that are nearly BLACK. That dark-over-light split is most of
     what makes it readable. */
  S.redpanda = function (c, a, t, gait) {
    var p = pal(a, { body: '#b85c29', body2: '#9c4a21', belly: '#2b1c14',
      face: '#f7f3ec', ear: '#a8501f', leg: '#2b1c14', nose: '#1a1310',
      accent: '#6b3a22', tail: '#c4622c' });
    var ring = a.body2 || '#8c4a24';
    var amble = Math.min(1, gait || 0);
    var sw = Math.sin(t * 1.8) * 1.2;

    /* the thick tail, carried horizontally, ringed */
    var tl = ribbon(-8.4, 2.4, -18.4, 0.4, -25.4, 2.4 + sw, 3.6, 2.8, 18);
    c.fillStyle = p.tail; ribbonPath(c, tl); c.fill();
    c.save(); ribbonPath(c, tl); c.clip();
    ribbonRings(c, tl, GG.shade(ring, -0.45), 5, 0.04, 3);
    c.restore();
    c.fillStyle = GG.shade(ring, -0.45); ell(c, -25.2, 2.4 + sw, 2.9, 2.9);

    /* the short near-black legs */
    legs4(c, { t: t, speed: 6.4, step: 2.4 * amble, w: 4, sep: 2.4,
      hx: -6.4, sx: 8.4, top: 5.4, foot: 12.8, hbend: -1.2, fbend: 0.9,
      far: GG.shade(p.leg, 0.16), near: p.leg });
    c.fillStyle = GG.shade(p.leg, 0.08);
    ell(c, -6.4, 13.2, 2.8, 1.5); ell(c, 8.4, 13.2, 2.8, 1.5);

    /* the long low body */
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-9.4, 3.4);
    c.quadraticCurveTo(-11, -3.4, -3.4, -4.6);
    c.quadraticCurveTo(5.4, -5.6, 11.4, -2.4);
    c.quadraticCurveTo(14.4, 1.4, 11.4, 5.4);
    c.quadraticCurveTo(0, 8.4, -9.4, 3.4);
    c.closePath(); c.fill();
    /* the near-black underside, a band along the bottom only */
    c.save();
    c.beginPath();
    c.moveTo(-9.4, 3.4);
    c.quadraticCurveTo(-11, -3.4, -3.4, -4.6);
    c.quadraticCurveTo(5.4, -5.6, 11.4, -2.4);
    c.quadraticCurveTo(14.4, 1.4, 11.4, 5.4);
    c.quadraticCurveTo(0, 8.4, -9.4, 3.4);
    c.closePath(); c.clip();
    c.fillStyle = p.belly;
    c.beginPath();
    c.moveTo(-11, 4.4);
    c.quadraticCurveTo(1.4, 6.4, 14, 3.4);
    c.lineTo(14, 10); c.lineTo(-11, 10);
    c.closePath(); c.fill();
    c.restore();

    /* blunt ears, white-rimmed, sitting clear on top of the head */
    [[11.6, -10.4, 2.8], [18.8, -10.8, 2.6]].forEach(function (q) {
      c.fillStyle = p.ear; ell(c, q[0], q[1] - 0.3, q[2] + 0.4, q[2] + 0.4);
      c.fillStyle = GG.shade(p.body, -0.3); ell(c, q[0], q[1] + 0.6, q[2] * 0.84, q[2] * 0.78);
    });

    /* the broad flat face */
    function rpHead(cc) {
      cc.beginPath();
      cc.ellipse(15.4, -2.8, 6.2, 5.4, 0, 0, Math.PI * 2);
    }
    c.fillStyle = p.head === p.body ? p.body : p.head;
    rpHead(c); c.fill();
    c.save(); rpHead(c); c.clip();
    /* the white mask: muzzle and cheeks low and forward, eyebrows above */
    /* the white muzzle, and a white cheek patch behind it */
    c.fillStyle = p.face;
    ell(c, 19.4, 0.6, 3.2, 2.8);
    ell(c, 13.6, 2, 2.8, 2);
    /* the white eyebrows above each eye */
    ell(c, 15.2, -5.8, 2.4, 1.4, -0.2);
    ell(c, 19.8, -5.4, 1.9, 1.2, 0.2);
    /* THE rust tear mark, straight down from the eye to the jaw */
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(14.6, -3.4);
    c.quadraticCurveTo(13.6, -1, 14.2, 1.4);
    c.lineTo(16, 1.2);
    c.quadraticCurveTo(15.6, -1.2, 16.2, -3.2);
    c.closePath(); c.fill();
    c.restore();
    c.fillStyle = p.nose;
    ell(c, 20.8, -0.6, 1.4, 1.1);
    c.strokeStyle = GG.shade(p.nose, 0.45); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(20.6, 0.4); c.quadraticCurveTo(19, 2.2, 17.2, 1.6); c.stroke();
    eye(c, 15.4, -3.8, 1.5, p.eye, true);
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.5;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(20.8, 0); c.lineTo(26.8, -1.6 + w * 2.2); c.stroke();
    }
  };

  /* ---------------- axolotl ----------------
     Not a fish - a salamander that never grew up. A broad flat head
     WIDER than the body, a fin running from mid-back along the top of
     the tail and back underneath, four small delicate limbs, and three
     pairs of feathery gill stalks sweeping back behind the head.
     The mouth is a straight line that turns up at the corners: it is
     not smiling, that is just the shape of its jaw. */
  S.axolotl = function (c, a, t) {
    var p = pal(a, { body: '#e8afc0', body2: '#dc9dae', belly: '#f4ceda',
      face: '#f4ceda', accent: '#d45c7a', nose: '#c07b8c', eye: '#2b2b2b',
      tail: '#e8afc0', leg: '#e8afc0' });
    var fin = GG.shade(p.body, -0.07);
    var gill = p.accent;
    var scull = Math.sin(t * 1.7) * 1.2;
    var fan = Math.sin(t * 2.3);

    /* An axolotl is mostly head. The body and tail are short, the head is
       broad and wider than the body, and the six feathery gill stalks are
       the whole animal - so they are long, thick, and a colour of their own. */

    /* the fin, above and below, running from mid-back down the tail */
    c.fillStyle = fin;
    c.beginPath();
    c.moveTo(1.4, 6);
    c.quadraticCurveTo(-5.4, 3.8, -12.4, 5.6 + scull);
    c.quadraticCurveTo(-15.4, 9.2 + scull, -12.4, 12.6 + scull);
    c.quadraticCurveTo(-5.4, 13.4, 1.4, 12);
    c.closePath(); c.fill();

    /* the short tail paddle and the short tube of a body */
    c.fillStyle = p.tail;
    c.beginPath();
    c.moveTo(-13.4, 7 + scull);
    c.quadraticCurveTo(-6.4, 5.4, -1.4, 6);
    c.quadraticCurveTo(-6.4, 12, -13.4, 11.4 + scull);
    c.closePath(); c.fill();
    c.fillStyle = p.body;
    c.beginPath();
    c.moveTo(-8.4, 6.4 + scull * 0.5);
    c.quadraticCurveTo(-2.4, 5, 4.4, 5.4);
    c.quadraticCurveTo(9.4, 6, 9.4, 8.6);
    c.quadraticCurveTo(9.4, 11.4, 4.4, 11.8);
    c.quadraticCurveTo(-2.4, 12.4, -8.4, 11 + scull * 0.5);
    c.closePath(); c.fill();
    c.fillStyle = p.body2 === p.body ? GG.shade(p.body, -0.12) : p.body2;
    c.globalAlpha = 0.45;
    ell(c, -1.4, 6.6, 7.4, 1.2);
    c.globalAlpha = 1;
    c.fillStyle = p.belly;
    ell(c, -0.4, 11.2, 8, 1.3);

    /* the four small delicate limbs */
    c.strokeStyle = GG.shade(p.leg, -0.14); c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-5.4, 11.4); c.lineTo(-8, 13.6); c.stroke();
    c.beginPath(); c.moveTo(6.4, 11.4); c.lineTo(8.4, 13.6); c.stroke();
    c.strokeStyle = p.leg; c.lineWidth = 1.7;
    c.beginPath(); c.moveTo(-3.4, 11.6); c.lineTo(-5.4, 14); c.stroke();
    c.beginPath(); c.moveTo(8.4, 11.6); c.lineTo(10.8, 14); c.stroke();
    c.strokeStyle = GG.shade(p.leg, -0.16); c.lineWidth = 0.7;
    [[-5.4, 14], [10.8, 14]].forEach(function (q) {
      for (var k = -1; k <= 1; k++) {
        c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + k * 1.5, q[1] + 1.5); c.stroke();
      }
    });

    /* THE gills: three stalks a side, swept back like a pair of ferns.
       The far three go first and dimmer so the near three stand out. */
    function gills(dx, dy, dim) {
      var tips = [[-7.4, -9.8], [-13.4, -3.4], [-10.4, 2.2]];
      for (var g = 0; g < 3; g++) {
        var bx = 6 + dx, by = 6.4 + dy + g * 1.1;
        var ex = bx + tips[g][0], ey = by + tips[g][1] + fan * 0.5;
        c.strokeStyle = dim ? GG.shade(gill, -0.34) : GG.shade(gill, -0.16);
        c.lineWidth = 2; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(bx, by);
        c.quadraticCurveTo((bx + ex) / 2 + 1.4, (by + ey) / 2 + 1.4, ex, ey);
        c.stroke();
        c.fillStyle = dim ? GG.shade(gill, -0.26) : gill;
        for (var f = 1; f <= 4; f++) {
          var u = 0.16 + f / 4.6;
          var px = bx + (ex - bx) * u + (1 - u) * 1.4 * (1 - u);
          var py = by + (ey - by) * u + (1 - u) * 1.4 * (1 - u);
          var rr = 1.9 - f * 0.18 + Math.sin(t * 2.4 + f * 1.3 + g) * 0.16;
          ell(c, px - 1.7, py - 1.6, rr, rr * 0.7, -0.5);
          ell(c, px + 1.6, py + 1.6, rr * 0.88, rr * 0.64, -0.5);
        }
      }
    }
    /* the far three, dimmer and set back; then the near three */
    gills(-1.6, -1.4, true);
    gills(0.8, 0.9, false);

    /* the broad flat head, wider than the body and a big share of the
       whole animal */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    c.beginPath();
    c.moveTo(5.4, 2.6);
    c.quadraticCurveTo(16.4, 1.6, 20.4, 7);
    c.quadraticCurveTo(16.4, 13.4, 5.4, 12.4);
    c.quadraticCurveTo(2.4, 7.6, 5.4, 2.6);
    c.closePath(); c.fill();
    c.fillStyle = p.face;
    ell(c, 14, 10.8, 5.4, 1.9, -0.06);

    /* the mouth: a straight line that turns up at the corners because of
       the shape of the jaw. It is not a smile; it has no expression. */
    c.strokeStyle = p.nose; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(19.8, 8);
    c.quadraticCurveTo(14, 10.8, 7.4, 9);
    c.stroke();
    c.fillStyle = p.nose;
    ell(c, 18.4, 4.8, 0.55, 0.45);
    /* the small dark eye, high and far forward */
    c.fillStyle = p.eye;
    ell(c, 14.4, 4.6, 1.5, 1.4);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    ell(c, 14.9, 4.1, 0.48, 0.48);
  };

  /* ---------------- songbird ----------------
     One small perching bird for six: a chickadee, a nuthatch, a junco,
     a goldfinch, a swallow and a bluebird. The shape stays put and the
     CAP, the BIB and the WING do all the telling apart - a cap that
     comes down past the eye plus a bib makes a chickadee; the same two
     in one colour, big, makes a junco's hood; a pale cap sweeping back
     over the eye makes a swallow's cheek. */
  S.songbird = function (c, a, t, gait) {
    var p = pal(a, { body: '#8b959c', body2: '#6f7a81', belly: '#f4f1e8',
      face: '#f4f1e8', leg: '#3a332c', nose: '#2b2620', accent: '#e8e4d8',
      tail: '#6f7a81', eye: '#1a1613' });
    var cap = a.cap || null;
    var bib = a.bib || null;
    var wing = a.wing || p.body2;
    var hop = Math.min(1, gait || 0);
    var flick = Math.sin(t * 3.4) * 0.8;
    var bob = Math.abs(Math.sin(t * 7)) * 1.6 * hop;

    c.save(); c.translate(0, -bob);

    /* the long slim tail */
    c.fillStyle = p.tail;
    c.beginPath();
    c.moveTo(-4.4, 1.4);
    c.quadraticCurveTo(-12.4, 2.4 + flick * 0.4, -17.4, 5.4 + flick);
    c.lineTo(-16.4, 8 + flick);
    c.quadraticCurveTo(-10.4, 6.4 + flick * 0.4, -4, 5.4);
    c.closePath(); c.fill();
    c.strokeStyle = p.accent; c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(-16.8, 6 + flick); c.quadraticCurveTo(-11.4, 4.4 + flick * 0.4, -5.4, 3.4);
    c.stroke();

    /* the round ball of a body */
    function ballPath(cc) {
      cc.beginPath();
      cc.moveTo(-6.4, 2.4);
      cc.quadraticCurveTo(-7.4, -4.4, 0, -6.4);
      cc.quadraticCurveTo(7.4, -6.4, 8, -0.4);
      cc.quadraticCurveTo(8.4, 5.4, 1.4, 7.4);
      cc.quadraticCurveTo(-5, 7, -6.4, 2.4);
      cc.closePath();
    }
    c.fillStyle = p.body; ballPath(c); c.fill();
    /* the belly and flanks */
    c.save(); ballPath(c); c.clip();
    c.fillStyle = p.belly;
    ell(c, 4.4, 3.4, 6.4, 5.4, -0.15);
    c.restore();

    /* the bib: throat and upper breast */
    if (bib) {
      c.save(); ballPath(c); c.clip();
      c.fillStyle = bib;
      c.beginPath();
      c.moveTo(3.4, -8.4);
      c.quadraticCurveTo(9.4, -6.4, 9.4, -0.4);
      c.quadraticCurveTo(5.4, 2.4, 2.4, 0.4);
      c.quadraticCurveTo(1.4, -4.4, 3.4, -8.4);
      c.closePath(); c.fill();
      c.restore();
    }

    /* the folded wing, long and pointed, with a bar in `accent` */
    c.fillStyle = wing;
    c.beginPath();
    c.moveTo(-5.4, -3.4);
    c.quadraticCurveTo(2.4, -6, 5.4, -1.4);
    c.quadraticCurveTo(0.4, 4.4, -9.4, 4.4);
    c.closePath(); c.fill();
    c.fillStyle = GG.shade(wing, -0.2);
    c.beginPath();
    c.moveTo(-4.4, 1.4);
    c.quadraticCurveTo(-0.4, 1.4, 3.4, 0.4);
    c.quadraticCurveTo(-1.4, 4.4, -9.4, 4.4);
    c.closePath(); c.fill();
    c.strokeStyle = p.accent; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-4.4, -1.4); c.quadraticCurveTo(0.4, -2.4, 4.6, -1.8); c.stroke();
    c.beginPath(); c.moveTo(-5.4, 1.2); c.quadraticCurveTo(-1.4, 0.4, 2.4, 0.4); c.stroke();

    /* the legs */
    c.strokeStyle = p.leg; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0.4, 6.4); c.lineTo(-0.4, 12.4 + bob); c.stroke();
    c.beginPath(); c.moveTo(3.4, 6.4); c.lineTo(3.4, 12.4 + bob); c.stroke();
    c.lineWidth = 0.9;
    [-0.4, 3.4].forEach(function (fx) {
      for (var k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(fx, 12.4 + bob); c.lineTo(fx + 1.2 + k * 1.3, 13.8 + bob); c.stroke();
      }
    });

    /* the head - a short neck and a large head, so it reads as a ball */
    c.fillStyle = p.head === p.body ? p.body : p.head;
    ell(c, 7.4, -5.4, 4.8, 4.4);
    /* the cheek, which the cap is going to sit on top of */
    c.fillStyle = p.face;
    ell(c, 8.4, -4, 3.4, 2.6);

    /* THE cap, clipped to the head so it can come down past the eye */
    if (cap) {
      c.save();
      c.beginPath(); c.ellipse(7.4, -5.4, 4.8, 4.4, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = cap;
      c.beginPath();
      c.moveTo(1.4, -10.4);
      c.quadraticCurveTo(8.4, -12, 13.4, -7.4);
      c.quadraticCurveTo(12.4, -4.4, 9.4, -4.8);
      c.quadraticCurveTo(4.4, -5.4, 1.4, -10.4);
      c.closePath(); c.fill();
      c.restore();
    }

    /* the short bill */
    c.fillStyle = p.nose;
    c.beginPath();
    c.moveTo(11.4, -6.4);
    c.lineTo(16.4, -4.9);
    c.lineTo(11.4, -3.6);
    c.closePath(); c.fill();
    c.strokeStyle = GG.shade(p.nose, -0.3); c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(11.4, -4.9); c.lineTo(16.2, -4.9); c.stroke();

    /* the eye, always findable even inside a dark cap */
    eye(c, 9.4, -6.4, 1.15, cap ? '#0f0d0b' : p.eye);
    if (cap) {
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.5;
      c.beginPath(); c.arc(9.4, -6.4, 1.8, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
  };

  /* ---------------- snake ----------------
     A shallow S with the head lifted, and the tongue out every so
     often. `pattern` decides which of four it is:
       stripes  - a garter: slender, three lengthwise stripes
       blotches - a gopher snake: heavy, squarish blotches, and a tail
                  that tapers smoothly to a POINT
       plain    - a rubber boa: a fat even sausage, blunt at both ends
       diamond  - a western rattlesnake: heavy, diamonds down the back, a
                  broad triangular head, a heat pit, a vertical pupil,
                  and a blunt tail with a RATTLE on the end. */
  S.snake = function (c, a, t) {
    var pat = a.pattern || 'plain';
    var p = pal(a, { body: '#5a6b4a', body2: '#44523a', belly: '#d8d2b4',
      accent: '#b08a3a', nose: '#2a2620', eye: '#1c1812' });
    var stripe = a.stripe || a.accent || GG.shade(a.body || '#5a6b4a', -0.35);

    var thick = pat === 'plain' ? 4.4 : (pat === 'diamond' ? 4.2
      : (pat === 'blotches' ? 3.6 : 2.8));
    var N = 34, pts = [], i;
    for (i = 0; i <= N; i++) {
      var s = i / N;
      var x = -21 + 40 * s;
      var y = 11.6 + Math.sin(s * 5.6 - t * 1.4) * 2;
      y -= smoothstep(0.62, 1, s) * 7.4;
      var w;
      if (pat === 'plain') w = thick * Math.min(1, 0.62 + s * 3.4);
      else if (pat === 'diamond') w = thick * Math.min(1, 0.52 + s * 3);
      else w = thick * Math.min(1, 0.08 + s * 5.4);
      pts.push({ x: x, y: y, w: w });
    }
    /* normals along the run */
    for (i = 0; i <= N; i++) {
      var a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(N, i + 1)];
      var dx = a1.x - a0.x, dy = a1.y - a0.y;
      var L = Math.sqrt(dx * dx + dy * dy) || 1;
      pts[i].nx = -dy / L; pts[i].ny = dx / L;
      pts[i].ang = Math.atan2(dy, dx);
    }
    /* the head sits a little beyond the last body point */
    var hp = pts[N], hang = hp.ang;
    var hx = hp.x + Math.cos(hang) * 3.4, hy = hp.y + Math.sin(hang) * 3.4;

    /* the rattle, on a blunt tail, held up and buzzing */
    if (pat === 'diamond') {
      var buzz = Math.sin(t * 30) * 1.1;
      c.fillStyle = a.accent || '#cfc4a4';
      for (var k = 0; k < 4; k++) {
        c.save();
        c.translate(pts[0].x - 1.4 - k * 2.2, pts[0].y - 1.4 - k * 2.6 + buzz * (k * 0.3));
        c.rotate(-0.5);
        GG.roundRect(c, -1.6, -1.3, 3.2, 2.6, 1); c.fill();
        c.restore();
      }
      c.globalAlpha = 0.35;
      c.strokeStyle = a.accent || '#cfc4a4'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(pts[0].x - 9, pts[0].y - 12); c.lineTo(pts[0].x - 6, pts[0].y - 8.4); c.stroke();
      c.beginPath(); c.moveTo(pts[0].x - 12, pts[0].y - 9.4); c.lineTo(pts[0].x - 8.4, pts[0].y - 7.4); c.stroke();
      c.globalAlpha = 1;
    }

    /* the body */
    var body = pts.map(function (q) { return { x: q.x, y: q.y, nx: q.nx, ny: q.ny, w: q.w }; });
    c.fillStyle = p.body; ribbonPath(c, body); c.fill();

    c.save(); ribbonPath(c, body); c.clip();
    /* the pale belly along the bottom edge */
    c.strokeStyle = p.belly; c.lineWidth = 2; c.lineCap = 'butt';
    c.beginPath();
    for (i = 0; i <= N; i++) {
      var q = pts[i];
      var bx = q.x + q.nx * q.w * 0.75, by = q.y + q.ny * q.w * 0.75;
      if (i) c.lineTo(bx, by); else c.moveTo(bx, by);
    }
    c.stroke();

    if (pat === 'stripes') {
      /* the dorsal stripe and one lateral stripe */
      [[-0.6, 1.9], [0.25, 1.3]].forEach(function (o) {
        c.strokeStyle = stripe; c.lineWidth = o[1];
        c.beginPath();
        for (var j = 0; j <= N; j++) {
          var q2 = pts[j];
          var sx = q2.x + q2.nx * q2.w * o[0], sy = q2.y + q2.ny * q2.w * o[0];
          if (j) c.lineTo(sx, sy); else c.moveTo(sx, sy);
        }
        c.stroke();
      });
      /* the red flecks between the stripes */
      c.fillStyle = p.accent;
      for (i = 3; i < N - 2; i += 4) {
        var q3 = pts[i];
        ell(c, q3.x + q3.nx * q3.w * -0.15, q3.y + q3.ny * q3.w * -0.15, 1, 0.8);
      }
    } else if (pat === 'blotches') {
      c.fillStyle = stripe;
      for (i = 2; i < N - 2; i += 4) {
        var q4 = pts[i];
        c.save();
        c.translate(q4.x + q4.nx * q4.w * -0.4, q4.y + q4.ny * q4.w * -0.4);
        c.rotate(q4.ang);
        GG.roundRect(c, -2, -q4.w * 0.85, 4, q4.w * 1.5, 0.8); c.fill();
        c.restore();
      }
      c.fillStyle = GG.shade(stripe, 0.3);
      for (i = 4; i < N - 2; i += 4) {
        var q5 = pts[i];
        ell(c, q5.x + q5.nx * q5.w * 0.42, q5.y + q5.ny * q5.w * 0.42, 1.2, 0.9);
      }
    } else if (pat === 'diamond') {
      for (i = 3; i < N - 3; i += 4) {
        var q6 = pts[i];
        c.save();
        c.translate(q6.x + q6.nx * q6.w * -0.25, q6.y + q6.ny * q6.w * -0.25);
        c.rotate(q6.ang);
        c.fillStyle = GG.shade(p.body, 0.42);
        c.beginPath();
        c.moveTo(-3.4, 0); c.lineTo(0, -q6.w * 1.05); c.lineTo(3.4, 0); c.lineTo(0, q6.w * 1.05);
        c.closePath(); c.fill();
        c.fillStyle = stripe;
        c.beginPath();
        c.moveTo(-2.4, 0); c.lineTo(0, -q6.w * 0.78); c.lineTo(2.4, 0); c.lineTo(0, q6.w * 0.78);
        c.closePath(); c.fill();
        c.restore();
      }
      /* the dark bands just before the rattle */
      c.strokeStyle = stripe; c.lineWidth = 2.4;
      for (i = 1; i < 4; i++) {
        var q7 = pts[i], e = q7.w + 1;
        c.beginPath();
        c.moveTo(q7.x - q7.nx * e, q7.y - q7.ny * e);
        c.lineTo(q7.x + q7.nx * e, q7.y + q7.ny * e);
        c.stroke();
      }
    } else {
      /* plain: just a slightly darker back, and the loose wrinkled skin */
      c.strokeStyle = p.body2; c.lineWidth = thick * 0.75; c.globalAlpha = 0.5;
      c.beginPath();
      for (i = 0; i <= N; i++) {
        var q8 = pts[i];
        var wx = q8.x + q8.nx * q8.w * -0.5, wy = q8.y + q8.ny * q8.w * -0.5;
        if (i) c.lineTo(wx, wy); else c.moveTo(wx, wy);
      }
      c.stroke(); c.globalAlpha = 1;
      c.strokeStyle = GG.shade(p.body, -0.08); c.lineWidth = 0.6;
      for (i = 5; i < N - 3; i += 7) {
        var q9 = pts[i], e2 = q9.w * 0.9;
        c.beginPath();
        c.moveTo(q9.x - q9.nx * e2, q9.y - q9.ny * e2);
        c.lineTo(q9.x + q9.nx * e2, q9.y + q9.ny * e2);
        c.stroke();
      }
    }
    c.restore();
    c.lineCap = 'round';

    /* the blunt second "head" on a rubber boa's tail */
    if (pat === 'plain') {
      c.fillStyle = p.tail;
      ell(c, pts[0].x - 0.4, pts[0].y, thick * 0.9, thick * 0.78);
    }

    /* the head */
    c.save();
    c.translate(hx, hy); c.rotate(hang);
    if (pat === 'diamond') {
      /* broad and distinctly triangular, much wider than the neck */
      c.fillStyle = p.head;
      c.beginPath();
      c.moveTo(-3.4, -5.4);
      c.quadraticCurveTo(4.4, -3.4, 5.4, -1);
      c.quadraticCurveTo(5.6, 1, 4.4, 2.6);
      c.quadraticCurveTo(0.4, 4.4, -3.4, 4.6);
      c.quadraticCurveTo(-5.4, -0.4, -3.4, -5.4);
      c.closePath(); c.fill();
      c.fillStyle = p.body2;
      c.beginPath();
      c.moveTo(-3.4, -4.4); c.quadraticCurveTo(2.4, -2.4, 4.4, -0.4);
      c.quadraticCurveTo(-0.4, -1.4, -3.4, -1.4); c.closePath(); c.fill();
      /* the dark stripe from the eye back to the jaw */
      c.strokeStyle = p.body2; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(1.4, -1.4); c.quadraticCurveTo(-1.4, 1.4, -3.4, 2.4); c.stroke();
      /* THE heat pit, between the eye and the nostril */
      c.fillStyle = '#17130f';
      ell(c, 3.4, 0.6, 0.85, 0.7);
      /* the eye, with a cat-like vertical slit */
      c.fillStyle = '#e0c878'; ell(c, 1.6, -1.9, 1.35, 1.25);
      c.fillStyle = '#16120d';
      c.save(); c.rotate(-hang); ell(c, 0, 0, 0.5, 1.2); c.restore();
      c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, 2.1, -2.5, 0.42, 0.42);
    } else {
      /* narrow, rounded snout, barely wider than the neck */
      c.fillStyle = p.head;
      ell(c, 0.4, 0, 4.2, pat === 'plain' ? 3.2 : 2.5, 0);
      c.fillStyle = p.body2;
      ell(c, -0.4, -0.9, 3.2, 1.2, 0);
      if (pat === 'blotches') {
        /* the dark stripe through the eye and across the snout */
        c.strokeStyle = p.body2; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(3.4, -0.4); c.quadraticCurveTo(0.4, 1, -2.4, 2); c.stroke();
      }
      c.fillStyle = p.eye;
      ell(c, 1.9, -1.2, pat === 'plain' ? 0.7 : 1.15, pat === 'plain' ? 0.6 : 1.05);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      ell(c, 2.2, -1.5, 0.36, 0.34);
      if (pat === 'stripes') {
        c.fillStyle = stripe;
        ell(c, 0.4, 1.6, 2.6, 0.7, 0);
      }
    }
    /* the mouth line */
    c.strokeStyle = p.face === p.body ? GG.shade(p.body, -0.35) : p.face;
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(pat === 'diamond' ? 5 : 4.2, 1.2);
    c.quadraticCurveTo(1.4, 2.6, -2.4, 2.6);
    c.stroke();
    /* the forked tongue, out every so often */
    if (Math.sin(t * 2.3) > 0.45) {
      c.strokeStyle = a.nose || '#d8453f';
      c.lineWidth = 0.8; c.lineCap = 'round';
      var tw = Math.sin(t * 17) * 0.5;
      var tx = pat === 'diamond' ? 5.4 : 4.4;
      c.beginPath(); c.moveTo(tx, 0.9); c.lineTo(tx + 3.4, 1.2 + tw); c.stroke();
      c.strokeStyle = '#2a2018';
      c.beginPath(); c.moveTo(tx + 3.2, 1.15 + tw); c.lineTo(tx + 5.4, 0.2 + tw); c.stroke();
      c.beginPath(); c.moveTo(tx + 3.2, 1.15 + tw); c.lineTo(tx + 5.4, 2.4 + tw); c.stroke();
    }
    c.restore();
  };

  /* ---------------- silly hats ---------------- */

  /* Where a hat sits on each shape: the middle of the top of the head, how
     wide the head is, and how far the hat should tilt. */
  var HAT_SPOT = {
    dog: function (a) {
      var build = a.build || 'mid';
      var legLen = build === 'short' ? 4.2 : (build === 'big' ? 9 : 7.4);
      var bodyY = 14 - legLen;
      /* clear of a husky's tall ears, or snug on a floppy-eared head */
      return { x: a.ears === 'up' ? 15.4 : 14.4, y: bodyY - (a.ears === 'up' ? 18.6 : 12.4),
        r: 5.6, tilt: -0.12 };
    },
    cat: function (a, t, gait) {
      if ((gait || 0) > 0.15) return { x: 9.2, y: -11.4, r: 5.6, tilt: -0.1 };
      return { x: 4.4, y: -13.4, r: 5.6, tilt: -0.1 };
    },
    hummingbird: function () { return { x: 5.4, y: -10.4, r: 3.2, tilt: -0.15 }; },
    frog: function () { return { x: 5, y: -10.4, r: 5.4, tilt: 0 }; },
    bat: function () { return { x: 0, y: -12.4, r: 4.4, tilt: 0 }; },
    parrot: function (a) { return { x: 8.4, y: a.crest ? -17.4 : -14.6, r: 4.8, tilt: -0.14 }; },

    rabbit: function () { return { x: 13, y: -8.4, r: 5, tilt: -0.1 }; },
    treesquirrel: function () { return { x: 7, y: -11, r: 4.6, tilt: -0.12 }; },
    groundsquirrel: function () { return { x: 3.4, y: -11.4, r: 4.2, tilt: -0.12 }; },
    turtle: function () { return { x: 19.4, y: -5.4, r: 4, tilt: -0.16 }; },
    bear: function () { return { x: 16, y: -13.6, r: 5.6, tilt: -0.1 }; },
    raccoon: function () { return { x: 15, y: -8.6, r: 5, tilt: -0.1 }; },
    fox: function () { return { x: 16, y: -15.4, r: 5, tilt: -0.12 }; },
    deer: function (a) {
      var k = a.calf ? 0.74 : 1;
      return { x: 18.4 * k, y: 14 - (14 + 23.4) * k, r: 4.6 * k, tilt: -0.1 };
    },
    moose: function (a) {
      var k = a.calf ? 0.7 : 1;
      return { x: 15 * k, y: 14 - (14 + 22.4) * k, r: 5 * k, tilt: -0.1 };
    },
    cow: function () { return { x: 17, y: -15.6, r: 5, tilt: -0.1 }; },
    horse: function () { return { x: 18.4, y: -21.6, r: 4.6, tilt: -0.12 }; },
    duck: function () { return { x: 14, y: -12.6, r: 4.4, tilt: -0.12 }; },
    otter: function () { return { x: 16, y: -0.6, r: 4.6, tilt: -0.12 }; },
    sheep: function () { return { x: 14, y: -8.6, r: 4.6, tilt: -0.1 }; },
    chicken: function () { return { x: 11.4, y: -16.6, r: 3.6, tilt: -0.12 }; },
    owl: function () { return { x: 1.4, y: -20.2, r: 5.4, tilt: -0.08 }; },
    panda: function () { return { x: 16, y: -15.6, r: 6, tilt: -0.1 }; },
    koala: function () { return { x: 3.4, y: -18.6, r: 5.4, tilt: -0.08 }; },
    ocelot: function () { return { x: 15, y: -12.4, r: 5, tilt: -0.1 }; },
    redpanda: function () { return { x: 14.4, y: -9.6, r: 5.2, tilt: -0.1 }; },
    axolotl: function () { return { x: 13, y: 3.4, r: 4.4, tilt: -0.1 }; },
    songbird: function () { return { x: 7.4, y: -9.8, r: 4.2, tilt: -0.14 }; },
    snake: function () { return { x: 19, y: 0.4, r: 3.4, tilt: -0.1 }; }
  };

  /* v1.16 - David: "improve the placement of silly hats, currently they sit
     on top of ears etc. Make them fit more to the top of the head." Each hat
     was being set down at the height of the ear tips, so on anything with
     ears it perched on them. These nudges (in each animal's own drawing
     units, measured off a grid laid over every head) bring the hat down onto
     the crown of the skull, between or in front of the ears, and shrink its
     brim to the width of the head so the ears stay visible either side. */
  var HAT_FIT = {
    hummingbird: { dx: 0.5, dy: 1.2, r: 3.0 },
    frog: { dx: 0.2, dy: 0.6, r: 4.2 },
    bat: { dx: 0, dy: 4.0, r: 3.0 },
    'dog:up': { dx: 0.6, dy: 6.0, r: 3.4 },
    dog: { dx: 1.8, dy: 0.5, r: 4.8 },
    cat: { dx: 1.0, dy: 1.2, r: 4.0 },
    parrot: { dx: 0, dy: 0.4, r: 4.4 },
    rabbit: { dx: 1.8, dy: 0.6, r: 3.6 },
    treesquirrel: { dx: 1.4, dy: 0.6, r: 3.8 },
    groundsquirrel: { dx: 0.9, dy: 0.4, r: 3.3 },
    turtle: { dx: 0.9, dy: 0.7, r: 3.2 },
    bear: { dx: 0.4, dy: 2.4, r: 3.8 },
    raccoon: { dx: 0, dy: 2.8, r: 3.3 },
    fox: { dx: -0.6, dy: 3.4, r: 3.1 },
    deer: { dx: 0.5, dy: 1.3, r: 3.4 },
    moose: { dx: 1.8, dy: 0.9, r: 4.2 },
    cow: { dx: 1.5, dy: 0.9, r: 4.2 },
    horse: { dx: -0.3, dy: 1.3, r: 3.3 },
    sheep: { dx: 1.8, dy: 1.1, r: 3.8 },
    chicken: { dx: 0.4, dy: 0.3, r: 3.2 },
    otter: { dx: 0.5, dy: -2.4, r: 3.8 },
    owl: { dx: 0.4, dy: 0.2, r: 5.0 },
    panda: { dx: -1.8, dy: 1.9, r: 3.5 },
    koala: { dx: 1.8, dy: 2.0, r: 4.2 },
    ocelot: { dx: 0.7, dy: 3.0, r: 3.4 },
    redpanda: { dx: 0.7, dy: 3.2, r: 3.4 },
    axolotl: { dx: 0.9, dy: -0.8, r: 4.0 },
    songbird: { dx: 0.3, dy: 0.2, r: 4.0 },
    snake: { dx: 3.0, dy: -1.0, r: 3.0 }
  };
  function fitHat(shape, a, at) {
    var f = HAT_FIT[shape === 'dog' && a.ears === 'up' ? 'dog:up' : shape];
    if (!f || !at) return at;
    var k = a.calf ? (shape === 'moose' ? 0.7 : 0.74) : 1;
    return { x: at.x + f.dx * k, y: at.y + f.dy * k, r: f.r * k, tilt: at.tilt };
  }

  var HATS = GG.HATS = [
    { id: 'party', name: 'Party Hat' },
    { id: 'top', name: 'Top Hat' },
    { id: 'bow', name: 'Big Bow' },
    { id: 'flower', name: 'Flower Crown' },
    { id: 'crown', name: 'Gold Crown' },
    { id: 'wizard', name: 'Wizard Hat' },
    { id: 'sun', name: 'Sun Hat' },
    { id: 'cap', name: 'Tiny Cap' },
    { id: 'chef', name: 'Chef Hat' },
    { id: 'pirate', name: 'Pirate Hat' },
    { id: 'antlers', name: 'Silly Antlers' },
    { id: 'propeller', name: 'Propeller Beanie' }
  ];
  GG.HAT_BY_ID = {};
  HATS.forEach(function (h) { GG.HAT_BY_ID[h.id] = h; });

  /* Every hat is drawn in a little space of its own: (0,0) is the middle of
     the top of the head, and one unit is one head-radius. */
  var HAT_ART = {
    party: function (c, t) {
      c.fillStyle = '#ef6fa0';
      c.beginPath();
      c.moveTo(-0.8, 0.1); c.lineTo(0, -2.3); c.lineTo(0.8, 0.1);
      c.closePath(); c.fill();
      c.fillStyle = '#ffd85c';
      for (var i = 0; i < 3; i++) {
        ell(c, -0.36 + i * 0.34, -0.45 - i * 0.55, 0.16, 0.16);
      }
      c.fillStyle = '#fff6c4';
      ell(c, 0, -2.45, 0.28, 0.28);
      c.fillStyle = '#ef6fa0';
      ell(c, 0, 0.12, 0.86, 0.2);
    },
    top: function (c) {
      c.fillStyle = '#2f2b33';
      c.fillRect(-0.62, -2.1, 1.24, 2.1);
      ell(c, 0, 0.02, 1.12, 0.24);
      c.fillStyle = '#d8455c';
      c.fillRect(-0.62, -0.62, 1.24, 0.4);
      c.fillStyle = 'rgba(255,255,255,0.16)';
      c.fillRect(-0.56, -2, 0.26, 1.9);
    },
    bow: function (c) {
      c.fillStyle = '#ff7fb0';
      c.beginPath();
      c.moveTo(0, -0.55);
      c.quadraticCurveTo(-1.5, -1.5, -1.35, -0.2);
      c.quadraticCurveTo(-1.2, 0.4, 0, -0.2);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(0, -0.55);
      c.quadraticCurveTo(1.5, -1.5, 1.35, -0.2);
      c.quadraticCurveTo(1.2, 0.4, 0, -0.2);
      c.closePath(); c.fill();
      c.fillStyle = '#e05a92';
      ell(c, 0, -0.4, 0.28, 0.34);
    },
    flower: function (c, t) {
      c.strokeStyle = '#5fb04f'; c.lineWidth = 0.2;
      c.beginPath();
      c.moveTo(-1, 0.05); c.quadraticCurveTo(0, -0.7, 1, 0.05); c.stroke();
      var cols = ['#ff8fb0', '#ffd45c', '#c39bff', '#fff0a8', '#8fd0ff'];
      for (var i = 0; i < 5; i++) {
        var x = -0.92 + i * 0.46;
        var y = -0.18 - Math.sin((i + 1) / 6 * Math.PI) * 0.5;
        c.fillStyle = cols[i];
        for (var pp = 0; pp < 5; pp++) {
          var ang = pp / 5 * Math.PI * 2;
          ell(c, x + Math.cos(ang) * 0.16, y + Math.sin(ang) * 0.16, 0.14, 0.14);
        }
        c.fillStyle = '#fff3b8';
        ell(c, x, y, 0.11, 0.11);
      }
    },
    crown: function (c, t) {
      c.fillStyle = '#f2c53c';
      c.beginPath();
      c.moveTo(-0.95, 0.1);
      c.lineTo(-0.95, -0.85); c.lineTo(-0.5, -0.35); c.lineTo(0, -1.15);
      c.lineTo(0.5, -0.35); c.lineTo(0.95, -0.85); c.lineTo(0.95, 0.1);
      c.closePath(); c.fill();
      c.fillStyle = '#d8a521';
      c.fillRect(-0.95, -0.1, 1.9, 0.22);
      c.fillStyle = '#ff6f9a'; ell(c, 0, -0.42, 0.16, 0.16);
      c.fillStyle = '#6fd0ff'; ell(c, -0.55, -0.2, 0.12, 0.12);
      c.fillStyle = '#6fd0ff'; ell(c, 0.55, -0.2, 0.12, 0.12);
    },
    wizard: function (c, t) {
      c.fillStyle = '#4a4090';
      c.beginPath();
      c.moveTo(-0.85, 0.08);
      c.quadraticCurveTo(-0.5, -1.6, 0.55, -2.7);
      c.quadraticCurveTo(0.5, -1.3, 0.85, 0.08);
      c.closePath(); c.fill();
      c.fillStyle = '#5f55b0';
      ell(c, 0, 0.1, 1.15, 0.26);
      c.fillStyle = '#ffd85c';
      [[-0.3, -0.75, 0.13], [0.18, -1.5, 0.1], [-0.05, -0.35, 0.09]].forEach(function (q) {
        star(c, q[0], q[1], q[2]);
      });
    },
    sun: function (c) {
      c.fillStyle = '#f0dfae';
      ell(c, 0, -0.1, 1.5, 0.44);
      c.fillStyle = '#e8d199';
      c.beginPath();
      c.ellipse(0, -0.42, 0.72, 0.6, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = '#8fcf6a';
      c.fillRect(-0.74, -0.34, 1.48, 0.22);
    },
    cap: function (c) {
      c.fillStyle = '#4a8fd0';
      c.beginPath();
      c.ellipse(0, 0, 0.8, 0.72, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = '#3f7cb8';
      c.beginPath();
      c.ellipse(0.66, -0.02, 0.7, 0.2, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = '#ffd85c';
      ell(c, 0, -0.62, 0.13, 0.13);
    },
    chef: function (c) {
      c.fillStyle = '#f6f4ee';
      c.fillRect(-0.6, -0.8, 1.2, 0.85);
      ell(c, -0.4, -1.05, 0.42, 0.42);
      ell(c, 0.4, -1.05, 0.42, 0.42);
      ell(c, 0, -1.25, 0.46, 0.46);
      c.fillStyle = '#e4e0d4';
      c.fillRect(-0.62, -0.3, 1.24, 0.32);
    },
    pirate: function (c) {
      c.fillStyle = '#2b2b33';
      c.beginPath();
      c.moveTo(-1.25, 0.05);
      c.quadraticCurveTo(-0.9, -1.1, 0, -1.05);
      c.quadraticCurveTo(0.9, -1.1, 1.25, 0.05);
      c.quadraticCurveTo(0, 0.5, -1.25, 0.05);
      c.closePath(); c.fill();
      c.fillStyle = '#f4f2ea';
      ell(c, 0, -0.52, 0.2, 0.24);
      ell(c, -0.13, -0.26, 0.07, 0.07);
      ell(c, 0.13, -0.26, 0.07, 0.07);
    },
    antlers: function (c) {
      c.strokeStyle = '#a5763f'; c.lineWidth = 0.17; c.lineCap = 'round';
      [-1, 1].forEach(function (sgn) {
        c.beginPath();
        c.moveTo(sgn * 0.3, 0.1);
        c.quadraticCurveTo(sgn * 0.75, -0.8, sgn * 0.55, -1.5);
        c.stroke();
        c.beginPath();
        c.moveTo(sgn * 0.66, -0.72); c.lineTo(sgn * 1.15, -1.05); c.stroke();
        c.beginPath();
        c.moveTo(sgn * 0.62, -1.15); c.lineTo(sgn * 1.02, -1.5); c.stroke();
      });
      c.fillStyle = '#ff6f6f';
      ell(c, 0, -0.1, 0.15, 0.15);
    },
    propeller: function (c, t) {
      c.fillStyle = '#e8584f';
      c.beginPath(); c.ellipse(0, 0, 0.8, 0.66, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#f2c53c';
      c.beginPath(); c.ellipse(0, 0, 0.28, 0.6, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#4a8fd0';
      c.fillRect(-0.82, -0.06, 1.64, 0.16);
      c.save();
      c.translate(0, -0.74);
      c.rotate((t || 0) * 7);
      c.fillStyle = '#6fd0ff';
      ell(c, 0.42, 0, 0.42, 0.11);
      ell(c, -0.42, 0, 0.42, 0.11);
      c.restore();
      c.fillStyle = '#8a8f94';
      ell(c, 0, -0.74, 0.1, 0.1);
    }
  };

  function star(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = (i % 2 ? r * 0.45 : r);
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var px = x + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad;
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath(); c.fill();
  }

  /* Put `hatId` on the animal whose shape has just been drawn. */
  function drawHat(c, def, hatId, t, gait) {
    var art = HAT_ART[hatId];
    var spot = HAT_SPOT[def.art.shape];
    if (!art || !spot) return;
    var at = fitHat(def.art.shape, def.art, spot(def.art, t, gait));
    c.save();
    c.translate(at.x, at.y);
    c.rotate(at.tilt || 0);
    c.scale(at.r, at.r);
    art(c, t || 0);
    c.restore();
  }
  GG.drawHatOnly = function (c, hatId, x, y, r, t) {
    var art = HAT_ART[hatId];
    if (!art) return;
    c.save();
    c.translate(x, y); c.scale(r, r);
    art(c, t || 0);
    c.restore();
  };

  /* Roughly how many pixels long each shape comes out at scale 1, size 1.
     Used to draw an animal at a chosen size on a card or a book page, so a
     hummingbird and a labrador both fill their frame nicely. */
  var SPAN = {
    hummingbird: 39, frog: 33, bat: 45, dog: 44, cat: 33, parrot: 38,
    rabbit: 38, treesquirrel: 40, groundsquirrel: 27, turtle: 43,
    bear: 46, raccoon: 51, fox: 57, deer: 53, moose: 49, cow: 42,
    horse: 45, duck: 43, otter: 52, sheep: 35, chicken: 33, owl: 36,
    panda: 40, koala: 36, ocelot: 45, redpanda: 53, axolotl: 35,
    songbird: 34, snake: 62
  };

  GG.animalFit = function (def, px) {
    return px / ((SPAN[def.art.shape] || 38) * (def.size || 1));
  };

  GG.AnimalArt = {
    shapes: S,
    SPAN: SPAN,
    /* where the hat sits on this animal, in its own drawing units */
    hatSpot: function (def, t, gait) {
      var f = HAT_SPOT[def.art.shape];
      return f ? fitHat(def.art.shape, def.art, f(def.art, t, gait)) : null;
    },

    /* (x, y) is the animal's FEET. faceLeft mirrors it. */
    draw: function (c, def, x, y, scale, faceLeft, t, gait, hat) {
      var fn = S[def.art.shape];
      if (!fn) return;
      var s = scale * (def.size || 1);
      if (hat === undefined && GG.Save && GG.Save.data && GG.Save.data.hats) {
        hat = GG.Save.data.hats[def.id];
      }
      c.save();
      c.translate(x, y - 14 * s);
      if (faceLeft) c.scale(-s, s); else c.scale(s, s);
      fn(c, def.art, t || 0, gait || 0);
      if (hat) drawHat(c, def, hat, t || 0, gait || 0);
      c.restore();
    },

    shadow: function (c, x, y, r, alpha) {
      c.fillStyle = 'rgba(30,50,25,' + (alpha == null ? 0.18 : alpha) + ')';
      c.beginPath();
      c.ellipse(x, y, r, r * 0.34, 0, 0, Math.PI * 2);
      c.fill();
    }
  };
})(window.GG = window.GG || {});
