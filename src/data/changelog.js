/* What changed, in words Guin can read.

   When the game starts and the saved version is older than this one, the
   "What's new" card appears with everything she has missed since. Add a new
   entry at the TOP whenever you ship, and bump GG.VERSION to match. */
(function (GG) {
  'use strict';

  GG.VERSION = '1.10.0';

  GG.CHANGELOG = [
    {
      v: '1.10.0', title: 'Garden Friends',
      lines: [
        'Twenty-two new animals live in the garden now: hummingbirds, frogs, bats, dogs, cats and parrots. You do not catch these ones \u2014 you make friends with them.',
        'Walk up to one and a green button tells you the right way to say hello to that kind of animal. Then stand very still while the little heart fills up. Move about and it only slips back a bit, and nobody ever runs away for good.',
        'Every friend gets a page in the new Friends Book, with a Good manners note telling you the real way to be kind and safe with that animal.',
        'Tap "Ask them along" and a friend will follow you round the garden all day.',
        'A brand new kind of tank: the Garden Habitat, a corner of the garden out under the sky where your friends come to visit. Eleven new things to buy for it, from a nectar feeder and a bird bath to a bat house, a dog kennel and a cat basket.'
      ]
    },
    {
      v: '1.9.2', title: 'Quieter water',
      lines: [
        'The sea and the river were far too loud, and you could hear them all over the garden and even inside the house. Now they are much softer, and you only hear them when you are close to the water.',
        'Indoors it is properly cosy: just the fire, and the rain on the roof if it is raining.'
      ]
    },
    {
      v: '1.9.1', title: 'Rock-pool creatures need water',
      lines: [
        'Crabs, sea stars, urchins, limpets, periwinkles and sea slugs need water to live in, so now they can only go in a fish tank or a hybrid tank. They settle on the sand at the bottom and potter about.',
        'A terrarium will politely say no if you try to put one in, and the Bug Book tells you which tank each creature needs.'
      ]
    },
    {
      v: '1.9.0', title: 'Music, settings and a friend pass',
      lines: [
        'There is music now, and the garden makes its own sounds: birds in the morning, crickets after dark, frogs by the pond, the river burbling and waves on the beach.',
        'A new Settings button lets you turn the music, the garden sounds and the beeps up and down on their own.',
        'A friend can tap "Let a friend play" on the title screen for a little visit. They get their own garden to mess about in, and yours is kept completely safe.',
        'Lots of new things for your tanks: sea plants and coral for fish, a rock pool with a starfish for the hybrid tanks, a fairy house, a teacup, a driftwood branch and more.',
        'The "start a brand new garden" button has moved into Settings and now asks you twice, so nobody can wipe your garden by accident.'
      ]
    },
    {
      v: '1.8.0', title: 'Rivers, the beach and rock pools',
      lines: [
        'The garden is twice as big! A stream starts up in the hills, grows into a river, and opens into Gull Inlet where it meets the sea.',
        'Shell Beach and The Tidepools are past the inlet. You can wade into the rock pools and net hermit crabs, sea stars, urchins and sea slugs.',
        '15 new fish, each in its own kind of water, and 20 new creatures to find.'
      ]
    },
    {
      v: '1.7.0', title: 'Lots more bugs',
      lines: [
        '34 new bugs to find, including worms, centipedes, millipedes, lacewings, cicadas, lanternflies and the beautiful Picasso bug.'
      ]
    }
  ];

  /* Everything newer than `since`, newest first. */
  GG.changesSince = function (since) {
    if (!since) return [];
    var out = [];
    for (var i = 0; i < GG.CHANGELOG.length; i++) {
      if (GG.cmpVersion(GG.CHANGELOG[i].v, since) > 0) out.push(GG.CHANGELOG[i]);
    }
    return out;
  };

  GG.cmpVersion = function (a, b) {
    var pa = String(a).split('.'), pb = String(b).split('.');
    for (var i = 0; i < 3; i++) {
      var x = parseInt(pa[i] || '0', 10), y = parseInt(pb[i] || '0', 10);
      if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
  };
})(window.GG = window.GG || {});
