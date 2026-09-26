/* v1.20 - who you play as. Every choice on the "My character" screen.

   A look is a small plain object saved in Save.data.player:
     { v, name, body, skin, hair, hairCol, eyes, outfit, outfitCol, acc, accCol }
   Everything except `name` and `outfitCol` (an index into that outfit's
   colour list) is an id from one of the lists below, so a save never holds
   a colour it cannot explain. Anything missing or unknown falls back to the
   default Guin look (GG.LOOKS.sanitize), so an old or half-written save can
   never draw a broken character.

   Hair styles and outfits are grouped only to put the likely ones first -
   every one of them can be picked with either body. */
(function (GG) {
  'use strict';

  var L = GG.LOOKS = {
    BODIES: [
      { id: 'girl', name: 'Girl' },
      { id: 'boy', name: 'Boy' }
    ],

    /* a real range, lightest to deepest */
    SKINS: [
      { id: 'porcelain', name: 'Porcelain', base: '#fde6d6' },
      { id: 'light', name: 'Light', base: '#fadcc0' },       // Guin
      { id: 'peach', name: 'Peach', base: '#f2c49e' },
      { id: 'golden', name: 'Golden', base: '#e6b27e' },
      { id: 'tan', name: 'Tan', base: '#d29a6a' },
      { id: 'brown', name: 'Brown', base: '#b27a4d' },
      { id: 'deep', name: 'Deep brown', base: '#8a5634' },
      { id: 'rich', name: 'Rich brown', base: '#643c26' }
    ],

    HAIRS: [
      { id: 'pigtails', name: 'Pigtails', group: 'girl' },
      { id: 'ponytail', name: 'Ponytail', group: 'girl' },
      { id: 'long', name: 'Long', group: 'girl' },
      { id: 'bob', name: 'Bob', group: 'girl' },
      { id: 'buns', name: 'Space buns', group: 'girl' },
      { id: 'braids', name: 'Braids', group: 'girl' },
      { id: 'curly', name: 'Curly', group: 'girl' },
      { id: 'puffs', name: 'Puffs', group: 'both' },
      { id: 'afro', name: 'Afro', group: 'both' },
      { id: 'short', name: 'Short', group: 'boy' },
      { id: 'spiky', name: 'Spiky', group: 'boy' },
      { id: 'swoop', name: 'Swoop', group: 'boy' },
      { id: 'curlyshort', name: 'Short curls', group: 'boy' },
      { id: 'buzz', name: 'Buzz', group: 'boy' }
    ],

    HAIR_COLORS: [
      { id: 'black', name: 'Black', base: '#2b2323' },
      { id: 'darkbrown', name: 'Dark brown', base: '#3a2a1e' },  // Guin
      { id: 'brown', name: 'Brown', base: '#6e4528' },
      { id: 'auburn', name: 'Auburn', base: '#93401f' },
      { id: 'ginger', name: 'Ginger', base: '#d9722e' },
      { id: 'blonde', name: 'Blonde', base: '#ecc563' },
      { id: 'platinum', name: 'Platinum', base: '#f3e6c2' },
      { id: 'pink', name: 'Bubblegum', base: '#ff86bd' },
      { id: 'blue', name: 'Sky blue', base: '#55a6ff' },
      { id: 'purple', name: 'Purple', base: '#a57af0' }
    ],

    EYES: [
      { id: 'dark', name: 'Dark brown', base: '#3b2418' },     // Guin
      { id: 'brown', name: 'Brown', base: '#7a4a24' },
      { id: 'hazel', name: 'Hazel', base: '#8b7a33' },
      { id: 'green', name: 'Green', base: '#3f9a52' },
      { id: 'blue', name: 'Blue', base: '#3f86d8' },
      { id: 'grey', name: 'Grey', base: '#6f8394' }
    ],

    /* a = the main colour, b = the second one, s = shoes (optional) */
    OUTFITS: [
      { id: 'sundress', name: 'Sundress', group: 'girl', colors: [
        { a: '#6ccbea', b: '#ffffff', s: '#5b4a8a' },          // Guin
        { a: '#ff9cc2', b: '#ffffff', s: '#c2466f' },
        { a: '#ffd45c', b: '#ffffff', s: '#e0823a' },
        { a: '#8fdc7a', b: '#fff6c8', s: '#4c8a3f' },
        { a: '#c3a2ff', b: '#fff0fb', s: '#6a4bb0' },
        { a: '#ff7a6b', b: '#fff3d6', s: '#8a3a4a' },
        { a: '#ffffff', b: '#ff8fb0', s: '#ff6f9a' } ] },
      { id: 'party', name: 'Tutu', group: 'girl', colors: [
        { a: '#ff8fbf', b: '#ffd1e6' },
        { a: '#b48cff', b: '#e3d4ff' },
        { a: '#5fc8f0', b: '#d4f3ff' },
        { a: '#ffcf4a', b: '#fff1b8' },
        { a: '#58d19a', b: '#d6f7e6' },
        { a: '#ff6f6f', b: '#ffd6d6' } ] },
      { id: 'jumper', name: 'Jumper & leggings', group: 'girl', colors: [
        { a: '#ff8a8a', b: '#5b4a8a' },
        { a: '#ffcf4a', b: '#3d6fb6' },
        { a: '#7fd1c8', b: '#6a4bb0' },
        { a: '#b48cff', b: '#ff8fb0' },
        { a: '#9ad86a', b: '#8a5a3a' },
        { a: '#6c9cff', b: '#ffd45c' },
        { a: '#f6f0e4', b: '#e0637a' } ] },
      { id: 'overalls', name: 'Overalls', group: 'both', colors: [
        { a: '#4f86c6', b: '#ffd166' },
        { a: '#4f86c6', b: '#ff8fb0' },
        { a: '#e0637a', b: '#fff3d6' },
        { a: '#5aa05a', b: '#ffe08a' },
        { a: '#8a67cc', b: '#bff0ff' },
        { a: '#e39a3a', b: '#ffffff' },
        { a: '#3b4a6b', b: '#ff9f6b' } ] },
      { id: 'tee', name: 'T-shirt & shorts', group: 'both', colors: [
        { a: '#ff6f61', b: '#3d6fb6' },
        { a: '#ffd45c', b: '#5aa05a' },
        { a: '#5fc8f0', b: '#f2f2f2' },
        { a: '#8fdc7a', b: '#5b4a8a' },
        { a: '#ff9cc2', b: '#6ccbea' },
        { a: '#b48cff', b: '#3b3f5c' },
        { a: '#ffffff', b: '#e0637a' },
        { a: '#ff9f43', b: '#2f7f7a' } ] },
      { id: 'hoodie', name: 'Hoodie & jeans', group: 'both', colors: [
        { a: '#5aa05a', b: '#4a6fa8' },
        { a: '#ff8a5c', b: '#4a6fa8' },
        { a: '#6c9cff', b: '#3a3f52' },
        { a: '#ff8fbf', b: '#6b8fd0' },
        { a: '#ffcf4a', b: '#3a3f52' },
        { a: '#9a7ae0', b: '#4a6fa8' },
        { a: '#e8e2d6', b: '#4a6fa8' } ] },
      { id: 'raincoat', name: 'Raincoat & boots', group: 'both', colors: [
        { a: '#ffd23f', b: '#3d6fb6' },
        { a: '#ff5d6c', b: '#ffd23f' },
        { a: '#5fc8f0', b: '#ffd23f' },
        { a: '#7ed957', b: '#e0637a' },
        { a: '#ff8fbf', b: '#8a67cc' },
        { a: '#ff9f43', b: '#2f7f7a' } ] },
      { id: 'explorer', name: 'Explorer vest', group: 'both', colors: [
        { a: '#8a9a4a', b: '#fff3d6' },
        { a: '#c98a4a', b: '#dff3ff' },
        { a: '#4f8a6a', b: '#fffbe8' },
        { a: '#6a7fa8', b: '#ffe7a8' },
        { a: '#b0564a', b: '#f4f0e0' },
        { a: '#e0a93a', b: '#ffffff' } ] },
      { id: 'sporty', name: 'Sporty', group: 'both', colors: [
        { a: '#3d6fb6', b: '#ffffff' },
        { a: '#e0463c', b: '#ffffff' },
        { a: '#2e9a5a', b: '#ffd45c' },
        { a: '#ff8fbf', b: '#ffffff' },
        { a: '#8a67cc', b: '#7ff0d8' },
        { a: '#ff9f1c', b: '#2b2d42' },
        { a: '#2b2d42', b: '#5fe0ff' } ] }
    ],

    ACCS: [
      { id: 'none', name: 'Nothing' },
      { id: 'flower', name: 'Flower clip' },   // Guin
      { id: 'bow', name: 'Bow' },
      { id: 'headband', name: 'Headband' },
      { id: 'cap', name: 'Cap' },
      { id: 'sunhat', name: 'Sun hat' },
      { id: 'glasses', name: 'Glasses' },
      { id: 'bandana', name: 'Bandana' }
    ],

    /* the accessory's colour, and the hair ties on pigtails, buns, braids */
    ACC_COLORS: [
      { id: 'pink', base: '#ff8fb0' },   // Guin
      { id: 'red', base: '#ff5d6c' },
      { id: 'orange', base: '#ff9f43' },
      { id: 'yellow', base: '#ffd23f' },
      { id: 'green', base: '#4fcf7f' },
      { id: 'blue', base: '#4f9dff' },
      { id: 'purple', base: '#a67cff' },
      { id: 'white', base: '#ffffff' }
    ],

    NAME_MAX: 14
  };

  function index(list) {
    var o = {};
    for (var i = 0; i < list.length; i++) o[list[i].id] = list[i];
    return o;
  }
  L.SKIN_BY_ID = index(L.SKINS);
  L.HAIR_BY_ID = index(L.HAIRS);
  L.HAIR_COLOR_BY_ID = index(L.HAIR_COLORS);
  L.EYE_BY_ID = index(L.EYES);
  L.OUTFIT_BY_ID = index(L.OUTFITS);
  L.ACC_BY_ID = index(L.ACCS);
  L.ACC_COLOR_BY_ID = index(L.ACC_COLORS);

  /* Today's Guin: pigtails, dark brown hair, a blue sundress, a pink flower. */
  L.DEFAULT = {
    v: 1, name: 'Guin', body: 'girl', skin: 'light', hair: 'pigtails', hairCol: 'darkbrown',
    eyes: 'dark', outfit: 'sundress', outfitCol: 0, acc: 'flower', accCol: 'pink'
  };
  /* the one handed out every frame when nothing is saved - never changed */
  var FROZEN = Object.freeze(Object.assign({}, L.DEFAULT));

  L.copy = function (look) { return Object.assign({}, look); };

  /* Fill in anything missing or unknown from the default, in place. */
  L.sanitize = function (look) {
    var d = L.DEFAULT;
    if (!look || typeof look !== 'object') return L.copy(d);
    if (look.body !== 'girl' && look.body !== 'boy') look.body = d.body;
    if (!L.SKIN_BY_ID[look.skin]) look.skin = d.skin;
    if (!L.HAIR_BY_ID[look.hair]) look.hair = d.hair;
    if (!L.HAIR_COLOR_BY_ID[look.hairCol]) look.hairCol = d.hairCol;
    if (!L.EYE_BY_ID[look.eyes]) look.eyes = d.eyes;
    if (!L.OUTFIT_BY_ID[look.outfit]) look.outfit = d.outfit;
    var n = L.OUTFIT_BY_ID[look.outfit].colors.length;
    look.outfitCol = Math.max(0, Math.min(n - 1, (look.outfitCol | 0)));
    if (!L.ACC_BY_ID[look.acc]) look.acc = d.acc;
    if (!L.ACC_COLOR_BY_ID[look.accCol]) look.accCol = d.accCol;
    if (typeof look.name !== 'string') look.name = '';
    look.name = look.name.slice(0, L.NAME_MAX);
    look.v = 1;
    return look;
  };

  /* "Surprise me!" - mostly picks from the styles that suit the body, with
     the odd surprise from the other list, because why not. */
  L.random = function (body, rnd) {
    rnd = rnd || Math.random;
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    body = body || (rnd() < 0.5 ? 'girl' : 'boy');
    function leaning(list) {
      var mine = list.filter(function (h) { return h.group === body || h.group === 'both'; });
      return rnd() < 0.85 ? pick(mine) : pick(list);
    }
    var outfit = leaning(L.OUTFITS);
    var fun = rnd() < 0.15;   // now and then, pink or blue hair
    var hairCols = L.HAIR_COLORS.filter(function (h) {
      return fun ? true : ['pink', 'blue', 'purple'].indexOf(h.id) < 0;
    });
    var acc = rnd() < 0.3 ? L.ACCS[0] : pick(L.ACCS.slice(1));
    return {
      v: 1, name: '', body: body,
      skin: pick(L.SKINS).id,
      hair: leaning(L.HAIRS).id,
      hairCol: pick(hairCols).id,
      eyes: pick(L.EYES).id,
      outfit: outfit.id,
      outfitCol: Math.floor(rnd() * outfit.colors.length),
      acc: acc.id,
      accCol: pick(L.ACC_COLORS).id
    };
  };

  /* A fresh copy of the default look, ready to be edited and saved. */
  GG.defaultPlayer = function () { return L.copy(L.DEFAULT); };

  /* The look to draw right now. Never allocates: when nothing is saved the
     same frozen default comes back every time. */
  GG.playerLook = function () {
    var d = GG.Save && GG.Save.data;
    return (d && d.player) || FROZEN;
  };

  /* What to call her (or him). */
  GG.playerName = function () {
    var d = GG.Save && GG.Save.data;
    var n = d && d.player && d.player.name;
    if (n && n.trim()) return n.trim();
    if (d && d.guest) return d.guestName || 'Friend';
    return 'Guin';
  };
})(window.GG = window.GG || {});
