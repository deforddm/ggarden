/* Garden Friends, drawn in code like everything else.

   Six base shapes - hummingbird, frog, bat, dog, cat, parrot - each taking its
   colours and markings from the animal's `art` block, so twenty-two animals
   come out of six drawings.

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
    parrot: function (a) { return { x: 8.4, y: a.crest ? -17.4 : -14.6, r: 4.8, tilt: -0.14 }; }
  };

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
    var at = spot(def.art, t, gait);
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
  var SPAN = { hummingbird: 39, frog: 33, bat: 45, dog: 44, cat: 33, parrot: 38 };

  GG.animalFit = function (def, px) {
    return px / ((SPAN[def.art.shape] || 38) * (def.size || 1));
  };

  GG.AnimalArt = {
    shapes: S,
    SPAN: SPAN,

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
