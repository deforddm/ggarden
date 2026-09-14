/* What changed, in words Guin can read.

   When the game starts and the saved version is older than this one, the
   "What's new" card appears with everything she has missed since. Add a new
   entry at the TOP whenever you ship, and bump GG.VERSION to match. */
(function (GG) {
  'use strict';

  GG.VERSION = '1.12.0';

  GG.CHANGELOG = [
    {
      v: '1.12.0', title: 'Fruit to pick, a footbridge, and twenty new bugs',
      lines: [
        'You can pick fruit now! Walk up to a tree in the Apple Orchard or a bush in the Pebble Hills and the button turns into PICK. There are ten kinds — apples, cherries, pears, and five wild ones from the hills.',
        'Every new kind of fruit you pick unlocks a decoration for your tanks. They are in the shop under "Picked, not bought", and you cannot buy them with sparkles — you have to go and find them.',
        'There is a new Fruit tab in your book. Every fruit says whether it is good to eat, and two of them are not, so have a read before you nibble anything.',
        'A wooden footbridge has been built near Shell Beach, where the river opens out into Gull Inlet. You can walk right across it instead of going all the way round, and you can fish off the side.',
        'Twenty new bugs. Ten for the orchard, including a bee fly like a tiny flying teddy bear and a snakefly that rears its head up like a snake.',
        'Ten more for the Pebble Hills, which were rather empty before — a Jerusalem cricket, a real Washington scorpion that glows under ultraviolet light, a windscorpion, and a beetle that stands on its head when it is frightened.'
      ]
    },
    {
      v: '1.11.1', title: 'Your friend really comes with you',
      lines: [
        'When you ask a friend along there is no longer a copy of them left wandering about the garden \u2014 they properly come with you.',
        'They follow you into the house now, and stay by you while you look at your books and your tanks.',
        'When you ask a different friend along, the one who was with you goes and waits at your house instead of just disappearing. Up to eight friends can be pottering about indoors, and asking one back out again takes them out of the house.'
      ]
    },
    {
      v: '1.11.0', title: 'Everything Guin asked for',
      lines: [
        'Cookie is in the game! She is an Alaskan Husky with a bandit mask, pointy ears and a curly tail, and she turns up in the garden, the meadow, the woods and the hills.',
        'Your friends walk properly now \u2014 dogs trot with their legs swinging, cats stand up and pad along on all four paws, and parrots hop.',
        'Silly hats! Open any friend in the Friends Book and give them a party hat, a crown, a wizard hat, silly antlers, a propeller beanie and eight more. They wear it everywhere.',
        'You can have ten tanks now instead of six, and you can change a tank into a different kind whenever you like \u2014 tap "Type". It is free, and anything that cannot live in the new kind goes safely back to your books.',
        'Cats really hate water and will not go near it, frogs love it and stay close to the pond, and cats cannot resist chasing a butterfly (they never, ever catch one).',
        'There is a food chain now. A ladybug hunts aphids, a pike hunts minnows, a sea star hunts limpets, and every book page tells you what a creature hunts and what hunts it. But nothing is ever eaten in your garden \u2014 whoever is being chased always gets away.'
      ]
    },
    {
      v: '1.10.1', title: 'Getting rid of a tank',
      lines: [
        'You can throw a tank away now. Open it, tap "Get rid of it", and it shows you a picture of that very tank and what is inside before it asks you if you are sure.',
        'Nothing is ever lost: everything living in the tank goes straight back to your books, and every decoration you bought stays bought.',
        'Your last tank cannot be thrown away, so you always have somewhere to keep things.'
      ]
    },
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
