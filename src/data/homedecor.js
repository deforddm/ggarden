/* v1.20 - Decorating Guin's cottage. David: "add the option to customize the
   decor of your home."

   Five kinds of look (the wallpaper, the floor, the rug, the quilt on her bed
   and the curtains at the window) and a box of things she can put down on the
   floor or hang on the wall. The FIRST option in each look list is the
   cottage exactly as it was before v1.20, so nothing changes until she
   decorates. Prices are in sparkles, the same ones she spends on her tanks.

   Things are sized off Guin at about 45 px to the metre, like the rest of the
   room (see "The cottage is small on purpose" in the build notes):
     fw   footprint width on the floor (px)      fd  footprint depth (px)
     ht   how tall it stands (px)                solid  she walks round it
     wall hangs on the back wall instead (fw x ht is its size there)
   Save.data.home = { wall, floor, rug, quilt, curtain, owned: [...], items: [{id, x, y}] }
   and null means the cottage as it always was. */
(function (GG) {
  'use strict';

  var D = GG.HOME_DECOR = {
    kinds: ['wall', 'floor', 'rug', 'quilt', 'curtain'],
    names: { wall: 'Walls', floor: 'Floor', rug: 'Rug', quilt: 'Bed', curtain: 'Window', item: 'Things' },

    wall: [
      { id: 'cream', name: 'Cream boards', price: 0 },
      { id: 'mint', name: 'Mint green', price: 0, base: '#bfeccf', line: '#aee0c1' },
      { id: 'sky', name: 'Sky blue', price: 20, base: '#b9e2fb', line: '#a6d5f2' },
      { id: 'sunny', name: 'Sunny stripes', price: 30, base: '#fff1a8', stripe: '#ffd766' },
      { id: 'candy', name: 'Candy stripes', price: 30, base: '#ffe0ec', stripe: '#ffb3cd' },
      { id: 'dots', name: 'Polka dots', price: 35, base: '#ffd1e0', dot: '#ffffff' },
      { id: 'flowers', name: 'Flowers', price: 45, base: '#fff6dc' },
      { id: 'stars', name: 'Starry night', price: 50, base: '#3f4fa3', dot: '#ffe36b' },
      { id: 'leaves', name: 'Leafy', price: 40, base: '#e3f6cf' },
      { id: 'gingham', name: 'Gingham', price: 35, base: '#fff7f2', check: 'rgba(240,96,110,0.30)' },
      { id: 'rainbow', name: 'Rainbow', price: 60 },
      { id: 'panel', name: 'Wood panels', price: 40, base: '#b77a4b', line: '#9a6238' }
    ],

    floor: [
      { id: 'honey', name: 'Honey boards', price: 0 },
      { id: 'dark', name: 'Dark boards', price: 25, base: '#8d5a36', line: '#734627' },
      { id: 'pale', name: 'Pale boards', price: 20, base: '#ecd3a8', line: '#dcbd8c' },
      { id: 'checker', name: 'Checker tiles', price: 35, a: '#ffffff', b: '#ff9fb6' },
      { id: 'bluecheck', name: 'Blue tiles', price: 35, a: '#f3fbff', b: '#7fc6ee' },
      { id: 'hex', name: 'Honeycomb tiles', price: 45, a: '#ffd76a', b: '#f5b93a' },
      { id: 'carpet', name: 'Soft carpet', price: 30, base: '#b8a3e8' },
      { id: 'grass', name: 'Grass carpet', price: 40, base: '#86cf6a' },
      { id: 'stone', name: 'Stone flags', price: 35, base: '#c9c3b6' }
    ],

    rug: [
      { id: 'blue', name: 'Blue oval', price: 0 },
      { id: 'none', name: 'No rug', price: 0 },
      { id: 'rag', name: 'Round rag rug', price: 20 },
      { id: 'rainbow', name: 'Rainbow stripes', price: 35 },
      { id: 'flower', name: 'Flower rug', price: 35 },
      { id: 'ladybug', name: 'Ladybird rug', price: 45 },
      { id: 'bee', name: 'Bumblebee rug', price: 45 },
      { id: 'leaf', name: 'Leaf rug', price: 30 },
      { id: 'star', name: 'Star rug', price: 40 }
    ],

    quilt: [
      { id: 'pink', name: 'Pink quilt', price: 0 },
      { id: 'sunny', name: 'Sunshine', price: 15, a: '#ffcf4a', b: '#ffe58c' },
      { id: 'sky', name: 'Sky blue', price: 15, a: '#63b7ee', b: '#94d2f7' },
      { id: 'patch', name: 'Patchwork', price: 30 },
      { id: 'gingham', name: 'Green gingham', price: 25 },
      { id: 'stars', name: 'Starry', price: 30 },
      { id: 'rainbow', name: 'Rainbow', price: 35 },
      { id: 'ladybug', name: 'Ladybird', price: 35 }
    ],

    curtain: [
      { id: 'none', name: 'No curtains', price: 0 },
      { id: 'redcheck', name: 'Red gingham', price: 15, a: '#ef5a64', b: '#ffffff' },
      { id: 'yellow', name: 'Buttercup', price: 15, a: '#ffd23f', b: '#ffe98f' },
      { id: 'pink', name: 'Pink frills', price: 20, a: '#ff8fb4', b: '#ffc2d6' },
      { id: 'starry', name: 'Starry blue', price: 25, a: '#4a64c8', b: '#ffe36b' },
      { id: 'leafy', name: 'Leafy green', price: 20, a: '#5cbf62', b: '#a6e38d' },
      { id: 'lace', name: 'White lace', price: 20, a: '#ffffff', b: '#e8eef7' }
    ],

    /* things to put down (ht ~ real height at 45 px/m) */
    item: [
      { id: 'plant', name: 'Potted plant', price: 0, fw: 26, fd: 12, ht: 38 },
      { id: 'teddy', name: 'Teddy bear', price: 0, fw: 22, fd: 12, ht: 26 },
      { id: 'cushions', name: 'Cushion pile', price: 0, fw: 38, fd: 16, ht: 22 },
      { id: 'fern', name: 'Big fern', price: 15, fw: 34, fd: 14, ht: 48 },
      { id: 'sunflower', name: 'Sunflower', price: 20, fw: 24, fd: 12, ht: 56 },
      { id: 'lamp', name: 'Tall lamp', price: 25, fw: 22, fd: 10, ht: 64, glow: 1 },
      { id: 'starlamp', name: 'Star lamp', price: 30, fw: 20, fd: 10, ht: 30, glow: 1 },
      { id: 'beanbag', name: 'Bean bag', price: 20, fw: 38, fd: 20, ht: 26 },
      { id: 'flowertable', name: 'Table of flowers', price: 25, fw: 30, fd: 14, ht: 40 },
      { id: 'fishbowl', name: 'Fish bowl', price: 35, fw: 22, fd: 12, ht: 44 },
      { id: 'globe', name: 'Globe', price: 30, fw: 22, fd: 12, ht: 44 },
      { id: 'piano', name: 'Toy piano', price: 35, fw: 36, fd: 14, ht: 28 },
      { id: 'stool', name: 'Ladybird stool', price: 10, fw: 20, fd: 12, ht: 16 },
      { id: 'easel', name: 'Painting easel', price: 25, fw: 30, fd: 14, ht: 58 },
      { id: 'toychest', name: 'Toy chest', price: 30, fw: 38, fd: 18, ht: 26, solid: 1 },
      { id: 'gameshelf', name: 'Shelf of games', price: 40, fw: 42, fd: 14, ht: 54, solid: 1 },
      { id: 'rocker', name: 'Rocking chair', price: 45, fw: 30, fd: 22, ht: 44, solid: 1 },
      { id: 'dollhouse', name: 'Doll’s house', price: 50, fw: 44, fd: 20, ht: 42, solid: 1 },
      { id: 'bunting', name: 'Bunting', price: 15, wall: 1, fw: 96, ht: 22 },
      { id: 'poster', name: 'Butterfly poster', price: 20, wall: 1, fw: 34, ht: 44 },
      { id: 'clock', name: 'Cuckoo clock', price: 30, wall: 1, fw: 26, ht: 40 },
      { id: 'rainbowpic', name: 'Rainbow picture', price: 20, wall: 1, fw: 42, ht: 32 },
      { id: 'garland', name: 'Star garland', price: 25, wall: 1, fw: 80, ht: 22 },
      { id: 'mirror', name: 'Round mirror', price: 25, wall: 1, fw: 32, ht: 32 }
    ],

    MAX_ITEMS: 24,

    byId: {}
  };

  D.kinds.concat(['item']).forEach(function (k) {
    D.byId[k] = {};
    D[k].forEach(function (o) { D.byId[k][o.id] = o; });
  });
})(window.GG = window.GG || {});
