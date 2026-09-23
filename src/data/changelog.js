/* What changed, in words Guin can read.

   When the game starts and the saved version is older than this one, the
   "What's new" card appears with everything she has missed since. Add a new
   entry at the TOP whenever you ship, and bump GG.VERSION to match. */
(function (GG) {
  'use strict';

  GG.VERSION = '1.17.0';

  GG.CHANGELOG = [
    {
      v: '1.17.0', title: 'Walk anywhere, or just tap where you want to go',
      lines: [
        'Tap anywhere in the garden and you walk there all by yourself. A little ring shows where you are going.',
        'Or put your thumb down anywhere on the screen, not just on the left, and slide it to steer.',
        'On a computer, click to walk there, or hold the mouse down and drag to steer.'
      ]
    },
    {
      v: '1.16.0', title: 'A cottage your size, hats that fit, and a calmer horse',
      lines: [
        'Your cottage has been rebuilt to fit you. The bed is a real bed, the door is a real door, and the bookshelf is only a little taller than you are. There is a fireplace now, with a fire in it.',
        'Friends waiting at home walk round the bed instead of getting stuck on top of it.',
        'Silly hats sit on top of the head now, between the ears, instead of balancing on the tips of them.',
        'When your horse is walking with you, nothing pops up. Stop and stand still, and she comes up beside you with her shoulder to you, and a little RIDE? button appears.'
      ]
    },
    {
      v: '1.15.1', title: 'A new sign on the bookshelf',
      lines: [
        'The bookshelf at home says Collections now, because it holds all four of your books \u2014 bugs, fish, friends and fruit.'
      ]
    },
    {
      v: '1.15.0', title: 'The Critter Compendium, fishing in the marsh, and Cookie',
      lines: [
        'Your Bug Book has grown into the Critter Compendium. Open it and there are four books on the shelf \u2014 the Bug Book, the Fish Book, the Friends Book and the Fruit Book \u2014 each with how far you have got.',
        'You can fish in the Cattail Marsh now. It had no water in it before, which is a funny sort of marsh. There are dark open pools between the cattails, with duckweed floating on them and seven fish to find.',
        'The lava tube has a proper GO IN button, and it is on the map as a little dark arch. The footbridge is on the map too.',
        'Only a honeybee dies after she stings you, because her stinger is barbed and stays in your skin. Every other bee and wasp flies off afterwards, and now they really do. Each one also tells you the true thing about her own sting \u2014 and a thatching ant has no stinger at all. That was a bite.',
        'Each look-don\u2019t-catch creature can be looked at once. After that she goes back to what she was doing.',
        'Hybrid tanks hold 8 bugs and 6 fish, and fish tanks hold 8 rock-pool creatures. The sea grass, shells and treasure chest go down on the sand under the water. And crabs climb up onto the bank for a walk, because shore crabs and hermit crabs really do.',
        'Thirteen new creatures in the Cherry Grove and the Bamboo Grove \u2014 including a butterfly that looks dipped in paint, a moth dressed as a wasp, a wasp that flies home with a blade of grass, a spider with six eyes, and a Japanese beetle, which really was found near Pasco.',
        'There is only one Cookie. Wherever she is \u2014 walking with you, waiting at home, or visiting a habitat \u2014 that is the only place she is.'
      ]
    },
    {
      v: '1.14.0', title: 'Thirty-one new friends, seven new places, and a horse to ride',
      lines: [
        'The garden has grown again, west this time, and there are seven more places in it.',
        'Out past the desert are the Scablands — bare black rock, round potholes, and ripples in the ground the size of sand dunes. A flood made those. A real one, bigger than any river on Earth, and it happened here dozens of times.',
        'South of that is the Oak Savanna, where every tree stands on its own with gold grass all round it, and each one throws its own island of shade.',
        'Below the pond is the Cattail Marsh, with muskrat lodges, a boardwalk to stand on, and new fish — including a lamprey, which has no jaws at all and is older than trees.',
        'There is a Bamboo Grove somebody planted and rather regretted, a Cherry Grove, a Bird Town full of nest boxes, and a Farmyard.',
        'And up on Cloudtop Ridge there is a hole in the rock. It is a lava tube — a pipe left behind by a river of melted stone — and you can walk into it with a lantern. Wipe your boots on the brush first: people carry a sickness that kills bats in on their boots. Nothing grows in the dark down there, so everything the cave animals eat was carried in from outside, mostly by bats coming home. The bats are not visitors. They are the farmers.',
        'Thirty-one new friends. Rabbits, squirrels, a turtle, a raccoon, a fox, deer, a bear, a moose, cows, sheep, chickens, ducks, an otter, a burrowing owl — and six little songbirds for Bird Town, four snakes, and five animals that live a very long way from here and whose pages say so: a giant panda, a koala, an ocelot, a red panda and an axolotl.',
        'Two of the friends you never go near. The black bear and the moose are the first ones where the ring fills as you BACK AWAY, not as you creep closer. Walk towards them and it stops. That is the real rule, and now it is the game.',
        'There is one venomous snake in Washington and she is here: a western rattlesnake, LOOK, DON’T CATCH, like the black widow.',
        'You can ride a horse. Come round to her shoulder — never behind her, she cannot see you there — ask her person first, put a helmet on, and up you go. You cannot ride a cow or a deer or a moose, and their pages tell you exactly why. (People really did try it with moose. It did not work.)',
        'Dogs chase squirrels now, and it is a game, not a hunt — the squirrel runs up a tree, stops halfway, turns round to face the dog and tells it off. Garter snakes chase frogs, and the frog always gets away.',
        'Friends who meet each other do something together — two dogs bow at each other and bounce. And if you step into the stream, the fish scatter. Wade slowly and they let you come close.'
      ]
    },
    {
      v: '1.13.0', title: 'Six new places, berries, and friends that hunt',
      lines: [
        'The garden has grown. There are six new places to walk to, and the map is nearly twice the size it was.',
        'Go north and it gets colder: first the Spruce Taiga, full of narrow black spruces and fallen logs, and then past the very last tree into the Lichen Tundra, where the ground is a patchwork of grey-green lichen and the only willow lies flat so the wind cannot get it.',
        'Go west and you climb Cloudtop Ridge — talus, snow patches that have not melted, and little alpine gardens tucked between the rocks. Over the far side is the Sagebrush Desert, and it is a cold desert, not a Sahara: silver sagebrush, bunchgrass with bare dirt between the clumps, black basalt and a cactus that only comes up to your ankle.',
        'The reason the desert is there is the ridge. The sea is in the south-east, so the wet air comes off it, crosses the forest, climbs the mountains and drops its rain on the way up. What is left over is dry.',
        'In the south-east corner, right by the sea, is the Mossy Rainforest, where every fallen log has a row of little trees growing along the top of it. And hidden inside the Whispering Woods there is a Golden Glade — a bright hole in a dark ceiling, with long grass, fireweed and one big fallen log.',
        'Forty-eight new creatures live in the six new places, and a lot of the old ones turn out to live there too. There is a worm that spends its whole life inside a glacier, a fly with no wings that walks about on snow, a beetle that clicks itself into the air, a spider that changes colour to match her flower, and a water bear you can only find by squeezing a cushion of wet moss.',
        'Two of the new ones are LOOK, DON’T CATCH — but not because they are dangerous. The ice worm and the ice crawler are both killed by a warm hand. You are the dangerous one.',
        'There are berries in the orchard now: blackberries, raspberries, strawberries, red currants and gooseberries, all pickable, all with a decoration to unlock. And there is one you must never eat — bittersweet nightshade, which climbs up through the brambles and hangs its shiny red berries right where a currant would be.',
        'Your friends hunt now. Every one of them goes after what it really eats and nothing else — a bat after moths, a hummingbird after gnats and spiders, a robin listening for a worm. Nothing is ever caught; it always gets away.',
        'And your rule is kept. Friends never hunt friends. A cat that spots a hummingbird stops, sits down, and watches it instead.'
      ]
    },
    {
      v: '1.12.1', title: 'One you look at and leave alone',
      lines: [
        'There is a black widow spider out on the Pebble Hills after dark, and she is the one creature in the whole garden you never catch. Your net will not take her, however hard you swing.',
        'Walk up to her and the button says LOOK instead of NET. Tap it and she gets a card of her own with the real reason: never put your hand anywhere you cannot see. Lift the far edge of a rock, have a look, and put it back exactly how it was.',
        'Meeting her is what opens her page in the Bug Book — it says Met instead of Caught — and the page tells you the true things about her, including that Washington has no brown recluse spiders at all.'
      ]
    },
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
