/* Guin's Garden - Garden Friends.

   Animals you make friends with rather than catch. There is no net here: each
   family is befriended the way you really would befriend it, and the way the
   game teaches is the way that is actually kind and safe.

     hummingbird - put out a feeder of plain sugar water and step back
     frog        - keep still and let it come out; look, never touch
     bat         - put up a bat house and watch from a long way off
     dog         - ask its person first, offer a soft fist, stroke the shoulder
     cat         - crouch down, offer a fist, slow-blink and wait
     parrot      - millet for the tame ones, quiet watching for the wild ones

   Every fact was checked against Cornell Lab, the National Park Service, state
   wildlife agencies, Bat Conservation International, the AKC, the Cat Fanciers'
   Association, the Australian Museum, Animal Diversity Web and peer-reviewed
   papers. The `manners` line on each one is the real-world advice, and it is
   shown every single time she makes that friend. */
(function (GG) {
  'use strict';

  /* family:   hummingbird, frog, bat, dog, cat, parrot
     way:      how you befriend it (drives the button and the whole ritual)
     patience: seconds of standing still it takes  (2.5 easy .. 7 shy)
     keep:     how close she may stand, in pixels  (small = it lets you near)
     times:    morning, day, evening, night, any
     places:   the biomes it turns up in
     rarity:   1 common .. 5 legendary */

  var WAYS = GG.FRIEND_WAYS = {
    feeder: {
      id: 'feeder', verb: 'Put out a feeder', btn: 'FEEDER', sub: 'sugar water',
      doing: 'Hanging up the feeder…', waiting: 'Stand back and wait…',
      blurb: 'Hang up a feeder of plain sugar water and step back.'
    },
    still: {
      id: 'still', verb: 'Keep very still', btn: 'KEEP STILL', sub: 'and wait',
      doing: 'Crouching down…', waiting: 'Keep still…',
      blurb: 'Crouch down, keep still, and let it come out on its own.'
    },
    bathouse: {
      id: 'bathouse', verb: 'Put up a bat house', btn: 'BAT HOUSE', sub: 'then watch',
      doing: 'Fixing up the bat house…', waiting: 'Watch from far away…',
      blurb: 'Put up a bat house, then watch from a long way off.'
    },
    ask: {
      id: 'ask', verb: 'Ask its person', btn: 'ASK FIRST', sub: 'then a fist',
      doing: 'Asking if you may say hello…', waiting: 'Let them come to you…',
      blurb: 'Ask the owner first, hold out a soft fist, and let the dog come to you.'
    },
    blink: {
      id: 'blink', verb: 'Crouch and slow-blink', btn: 'SLOW-BLINK', sub: 'let it choose',
      doing: 'Crouching down and slow-blinking…', waiting: 'Wait for the cheek rub…',
      blurb: 'Get low, hold out a loose fist, slow-blink, and let the cat decide.'
    },
    millet: {
      id: 'millet', verb: 'Offer some millet', btn: 'MILLET', sub: 'ask first',
      doing: 'Holding out the millet…', waiting: 'Hold still…',
      blurb: 'With its person’s say-so, hold out a sprig of millet and stay still.'
    },
    watch: {
      id: 'watch', verb: 'Watch quietly', btn: 'WATCH', sub: 'from afar',
      doing: 'Sitting down quietly…', waiting: 'Just watch…',
      blurb: 'Sit down quietly and watch. Some birds are for looking at, not touching.'
    }
  };

  GG.ANIMALS = [
    /* ---------------- hummingbirds ---------------- */
    {
      id: 'ruby_hummingbird', name: 'Ruby-throated Hummingbird', family: 'hummingbird',
      way: 'feeder', patience: 3.4, keep: 78, rarity: 2, value: 90,
      times: ['morning', 'day'], places: ['garden', 'meadow', 'orchard'],
      measure: 'about as long as your finger', size: 0.35,
      art: { shape: 'hummingbird', body: '#2f9a6a', wing: '#6fc4a0', throat: '#c8203a',
        belly: '#f2f0e2', accent: '#1f5a44' },
      facts: [
        'Its wings beat about fifty times every second, far too fast for your eyes to see.',
        'Its legs are so tiny it cannot walk or hop. It shuffles sideways along a twig instead.',
        'She builds a nest the size of a walnut and glues it together with spider silk.'
      ],
      manners: 'Hummingbirds are fed from a feeder, never from your hand. Plain sugar water only — one spoon of white sugar to four spoons of water. No red dye, and never honey.'
    },
    {
      id: 'annas_hummingbird', name: "Anna's Hummingbird", family: 'hummingbird',
      way: 'feeder', patience: 3.0, keep: 70, rarity: 2, value: 95,
      times: ['morning', 'day', 'evening'], places: ['garden', 'meadow', 'hill'],
      measure: 'about the size of a ping-pong ball', size: 0.38,
      art: { shape: 'hummingbird', body: '#4a8a5f', wing: '#7fb894', throat: '#d43f7a',
        belly: '#eef0e6', accent: '#2f5a3f', crown: '#d43f7a' },
      facts: [
        'When he dives to show off, the wind whistles through his tail feathers and makes a loud squeak.',
        'It stays on the west coast all winter instead of flying away somewhere warm.',
        'On cold nights it goes into a deep sleep and its heart slows right down.'
      ],
      manners: 'This is the boldest hummingbird of all and may buzz right up to your face to look at you. Stay still and let it — it is only being nosy.'
    },
    {
      id: 'rufous_hummingbird', name: 'Rufous Hummingbird', family: 'hummingbird',
      way: 'feeder', patience: 4.0, keep: 88, rarity: 3, value: 150,
      times: ['morning', 'day'], places: ['meadow', 'hill', 'orchard'],
      measure: 'about as long as your finger', size: 0.33,
      art: { shape: 'hummingbird', body: '#c8722a', wing: '#e0a05a', throat: '#e0552a',
        belly: '#f6ead2', accent: '#8a4a18' },
      facts: [
        'This tiny bird flies all the way from Alaska to Mexico and back again every year.',
        'It is very brave and will chase away hummingbirds much bigger than itself.',
        'It remembers exactly where a feeder was last year and comes back to check.'
      ],
      manners: 'It is the scrappiest hummingbird there is. If it chases the others off your feeder, put up a second one round the corner where it cannot see both at once.'
    },

    /* ---------------- frogs ---------------- */
    {
      id: 'green_frog', name: 'Green Frog', family: 'frog',
      way: 'still', patience: 3.0, keep: 62, rarity: 1, value: 40,
      times: ['any'], places: ['pond', 'riverbank'],
      measure: 'about as big as your fist', size: 0.46,
      art: { shape: 'frog', body: '#5f9a3f', belly: '#e8e8c0', accent: '#3a6b28',
        eye: '#d8b040', pattern: 'mottle' },
      facts: [
        'Its call sounds exactly like someone plucking a loose banjo string.',
        'It does not chase its dinner. It sits very still and waits for dinner to come to it.',
        'It almost never goes far from the water.'
      ],
      manners: 'Frogs drink and breathe through their skin, so we look with our eyes and not our hands. Every frog belongs to its own pond — we always leave it where we found it.'
    },
    {
      id: 'bullfrog', name: 'American Bullfrog', family: 'frog',
      way: 'still', patience: 4.2, keep: 76, rarity: 3, value: 110,
      times: ['evening', 'night'], places: ['pond', 'riverbank'],
      measure: 'as big as a dinner plate with its legs stretched out', size: 0.59,
      art: { shape: 'frog', body: '#4a7a3a', belly: '#efeccc', accent: '#2f5227',
        eye: '#c8a038', pattern: 'plain' },
      facts: [
        'It is the biggest frog in the whole of the United States.',
        'The males sing a deep "jug-o-rum" to say that this pond is theirs.',
        'Its babies can stay tadpoles for two whole winters before they turn into frogs.'
      ],
      manners: 'Bullfrogs cause real trouble when they turn up in ponds they are not from, so never carry one anywhere. Look, listen, and leave it be.'
    },
    {
      id: 'spring_peeper', name: 'Spring Peeper', family: 'frog',
      way: 'still', patience: 5.5, keep: 96, rarity: 3, value: 130,
      times: ['evening', 'night'], places: ['pond', 'forest', 'riverbank'],
      measure: 'smaller than your thumb', size: 0.26,
      art: { shape: 'frog', body: '#b58a52', belly: '#f0e4c8', accent: '#7a5730',
        eye: '#3a2c18', pattern: 'cross' },
      facts: [
        'It has a dark X on its back, like a little kiss.',
        'It is smaller than your thumb, but a whole pond full of them sounds like sleigh bells.',
        'In winter it hides under the leaves and can survive being partly frozen.'
      ],
      manners: 'Peepers stop singing the moment they hear you coming. If the pond goes quiet, sit down and wait — they start up again once they decide you are furniture.'
    },
    {
      id: 'chorus_frog', name: 'Pacific Chorus Frog', family: 'frog',
      way: 'still', patience: 4.6, keep: 84, rarity: 2, value: 80,
      times: ['evening', 'night', 'day'], places: ['pond', 'riverbank', 'meadow'],
      measure: 'smaller than a golf ball', size: 0.32,
      art: { shape: 'frog', body: '#6fb44a', belly: '#eef0d4', accent: '#3f7a2a',
        eye: '#c8a83c', pattern: 'stripe', pads: true },
      facts: [
        'It can slowly change its colour from green to brown to match wherever it is sitting.',
        'It has sticky round pads on its toes so it can climb straight up a smooth leaf.',
        'It says "rib-it", and it is the frog you hear most all along the west coast.'
      ],
      manners: 'If a grown-up says you may hold a frog, wet your hands first and make sure there is no sunscreen or bug spray on them. Then wash your hands afterwards.'
    },

    /* ---------------- bats ---------------- */
    {
      id: 'little_brown_bat', name: 'Little Brown Bat', family: 'bat',
      way: 'bathouse', patience: 4.0, keep: 130, rarity: 2, value: 100,
      times: ['night'], places: ['meadow', 'forest', 'pond', 'orchard'],
      measure: 'small enough to sit in your palm', size: 0.39,
      art: { shape: 'bat', body: '#6b4a30', wing: '#4a3220', accent: '#3a2618', ear: '#8a6242' },
      facts: [
        'It finds its dinner in the dark by shouting and listening to the echo.',
        'A mother bat can eat half her own weight in bugs in a single night.',
        'A little brown bat can live to be thirty years old.'
      ],
      manners: 'Bats are gentle neighbours who eat the bugs that bite us. If you ever find a bat on the ground, do not touch it — go and tell a grown-up. Bats say hello best from far away.'
    },
    {
      id: 'big_brown_bat', name: 'Big Brown Bat', family: 'bat',
      way: 'bathouse', patience: 3.6, keep: 120, rarity: 2, value: 95,
      times: ['evening', 'night'], places: ['garden', 'meadow', 'orchard', 'forest'],
      measure: 'wings as wide as a sheet of paper is long', size: 0.48,
      art: { shape: 'bat', body: '#8a5f38', wing: '#5a3d24', accent: '#3f2a18', ear: '#a87a4a' },
      facts: [
        'Its favourite food is crunchy beetles.',
        'It often raises its babies in barns, under bridges, or in a bat house someone put up for it.',
        'It sleeps right through the coldest part of winter and wakes up again in spring.'
      ],
      manners: 'This is the bat most likely to live near houses. A bat house on a warm wall is the kindest thing you can give it — and it keeps everyone happy.'
    },
    {
      id: 'hoary_bat', name: 'Hoary Bat', family: 'bat',
      way: 'bathouse', patience: 6.0, keep: 150, rarity: 4, value: 260,
      times: ['night'], places: ['forest', 'orchard'],
      measure: 'wings wider than a dinner plate', size: 0.6,
      art: { shape: 'bat', body: '#8a7a62', wing: '#5f5142', accent: '#3f372c',
        ear: '#a89880', frost: true },
      facts: [
        'Its fur is tipped with white, as if it had been dusted with frost. That is what "hoary" means.',
        'It does not live in caves at all. It sleeps by day wrapped up in the leaves of a tree.',
        'It hunts moths more than anything else.'
      ],
      manners: 'Hoary bats live alone in the treetops and are hardly ever seen. Finding one is a real piece of luck, so watch quietly and let it get on with its evening.'
    },

    /* ---------------- dogs ---------------- */
    {
      id: 'labrador', name: 'Labrador Retriever', family: 'dog',
      way: 'ask', patience: 2.4, keep: 48, rarity: 1, value: 60,
      times: ['morning', 'day', 'evening'], places: ['garden', 'meadow', 'beach'],
      measure: 'comes up past your knee', size: 0.87,
      art: { shape: 'dog', body: '#e0c48a', ear: '#c8a86a', accent: '#8a6a3a',
        muzzle: '#f2e2ba', nose: '#3a2f28', collar: '#3f8ad0', build: 'big' },
      facts: [
        'It has webbed toes and a thick tail like an otter’s, and both of them help it swim.',
        'Even though it is called a Labrador, the breed really comes from Newfoundland.',
        'It was the most popular dog in America for thirty-one years in a row.'
      ],
      manners: 'Always ask the owner before you say hello. Turn a little sideways, do not stare, hold out a soft fist to be sniffed, and stroke the shoulder rather than the top of the head.'
    },
    {
      id: 'corgi', name: 'Welsh Corgi', family: 'dog',
      way: 'ask', patience: 2.6, keep: 46, rarity: 2, value: 85,
      times: ['morning', 'day', 'evening'], places: ['garden', 'meadow'],
      measure: 'only as tall as a ruler is long', size: 0.59,
      art: { shape: 'dog', body: '#d88a48', ear: '#c07030', accent: '#8a4f1f',
        muzzle: '#f6ece0', nose: '#332a24', collar: '#d04a70', build: 'short' },
      facts: [
        'It has very short legs, but it is a real farm dog that helped move cattle about.',
        'It is small and it is brave: the rule book for the breed says it should be "bold, but kindly".',
        'Queen Elizabeth’s family got their first Corgi in the 1930s and made the breed famous.'
      ],
      manners: 'Corgis often bark first and make friends second. Wait for the barking to stop before you put your hand out, and never bother a dog that is eating or asleep.'
    },
    {
      id: 'beagle', name: 'Beagle', family: 'dog',
      way: 'ask', patience: 2.8, keep: 50, rarity: 1, value: 65,
      times: ['morning', 'day', 'evening'], places: ['meadow', 'forest', 'orchard'],
      measure: 'comes up to your shin', size: 0.67,
      art: { shape: 'dog', body: '#f0ead8', ear: '#8a5730', accent: '#3f342c',
        muzzle: '#f8f4e8', nose: '#2f2620', collar: '#5aa84f', build: 'mid', patch: 'saddle' },
      facts: [
        'Its long floppy ears help sweep smells up towards its nose.',
        'It has three different voices: a bark, a howl, and a yodelly sound called a bay.',
        'Some Beagles have a real job sniffing luggage at airports, in a team called the Beagle Brigade.'
      ],
      manners: 'A Beagle will follow its nose right past you without meaning to be rude. Let it finish sniffing before you expect it to notice you at all.'
    },
    {
      id: 'border_collie', name: 'Border Collie', family: 'dog',
      way: 'ask', patience: 3.6, keep: 62, rarity: 2, value: 100,
      times: ['morning', 'day', 'evening'], places: ['meadow', 'hill'],
      measure: 'comes up to your thigh', size: 0.79,
      art: { shape: 'dog', body: '#2f2a28', ear: '#221e1c', accent: '#f4f0e6',
        muzzle: '#f4f0e6', nose: '#2a2320', collar: '#e0a03a', build: 'big', patch: 'ruff' },
      facts: [
        'It herds sheep by crouching low and staring at them, and shepherds call that "the eye".',
        'A Border Collie named Chaser learned the names of one thousand and twenty-two different toys.',
        'It is friendly with people it knows, but it can be a bit shy with strangers at first.'
      ],
      manners: 'This one is the most reserved of the four. Crouch a little, look away rather than at it, and let it make the first move in its own time.'
    },

    /* ---------------- cats ---------------- */
    {
      id: 'tabby', name: 'Tabby Cat', family: 'cat',
      way: 'blink', patience: 3.2, keep: 54, rarity: 1, value: 55,
      times: ['morning', 'evening'], places: ['garden', 'meadow', 'orchard'],
      measure: 'about as long as your arm, plus the tail', size: 0.46,
      art: { shape: 'cat', body: '#b8874a', belly: '#efe0c0', accent: '#7a5528',
        nose: '#e0908a', eye: '#7fc45f', pattern: 'tabby' },
      facts: [
        'Tabby is not a kind of cat at all. It is a pattern, like stripes on a jumper.',
        'Every tabby has a little letter M on its forehead.',
        'Each single hair has light and dark bands along it, and that is what makes the pattern.'
      ],
      manners: 'Get low, hold out one loose fist at its nose height, and slow-blink at it. Wait for the cat to rub its face on your hand before you stroke its cheeks. A cat is always allowed to walk away.'
    },
    {
      id: 'calico', name: 'Calico Cat', family: 'cat',
      way: 'blink', patience: 3.6, keep: 58, rarity: 2, value: 90,
      times: ['morning', 'evening'], places: ['garden', 'orchard'],
      measure: 'about as long as your arm, plus the tail', size: 0.46,
      art: { shape: 'cat', body: '#f4efe4', belly: '#fbf7ee', accent: '#2f2a26',
        nose: '#e8a09a', eye: '#e0b040', pattern: 'calico' },
      facts: [
        'Almost every calico cat in the whole world is a girl.',
        'Calico is not a breed either. It is a pattern: white with orange and black patches.',
        'No two calico cats anywhere have exactly the same patches.'
      ],
      manners: 'Do not stare at a cat — to a cat, staring is rude. Look a little to one side and blink slowly, and it will often blink slowly right back at you.'
    },
    {
      id: 'siamese', name: 'Siamese Cat', family: 'cat',
      way: 'blink', patience: 3.0, keep: 52, rarity: 3, value: 140,
      times: ['morning', 'day', 'evening'], places: ['garden'],
      measure: 'a slim cat about as long as your arm, plus the tail', size: 0.43,
      art: { shape: 'cat', body: '#efe2c8', belly: '#f8f0dc', accent: '#5a4436',
        nose: '#d8908a', eye: '#5fb4e0', pattern: 'point' },
      facts: [
        'Its ears, face, paws and tail are dark because those are the coolest parts of its body.',
        'It is one of the chattiest cats there is, and it will answer you back.',
        'Cats like this were written about in a Thai book of cat poems hundreds of years ago.'
      ],
      manners: 'A Siamese will often come and talk to you first. Answer it back — but still let it decide when the stroking starts and when it stops.'
    },
    {
      id: 'maine_coon', name: 'Maine Coon', family: 'cat',
      way: 'blink', patience: 3.4, keep: 56, rarity: 3, value: 160,
      times: ['morning', 'evening', 'night'], places: ['garden', 'forest'],
      measure: 'the biggest pet cat there is', size: 0.55,
      art: { shape: 'cat', body: '#8a6a48', belly: '#e4d2b0', accent: '#4f3a26',
        nose: '#d8908a', eye: '#c8a03c', pattern: 'tabby', fluffy: true },
      facts: [
        'It is the biggest kind of pet cat, and people call it the gentle giant.',
        'It takes three whole years to finish growing up.',
        'Its shaggy coat and tufty ears were made for snowy north-eastern winters.'
      ],
      manners: 'Big cats are still cats. Stroke the cheeks or under the chin for a few seconds, then stop and check whether it wants more. Not the tummy, and not the tail.'
    },

    /* ---------------- parrots ---------------- */
    {
      id: 'budgie', name: 'Budgerigar', family: 'parrot',
      way: 'millet', patience: 3.0, keep: 58, rarity: 1, value: 70,
      times: ['morning', 'day'], places: ['garden', 'meadow'],
      measure: 'about as long as a teaspoon and a half', size: 0.44,
      art: { shape: 'parrot', body: '#8fd44a', wing: '#c8e88a', face: '#f2f4d8',
        beak: '#c8b070', accent: '#3f6b28', cheek: '#5fa8d8', bars: true },
      facts: [
        'Wild budgies live right in the dry middle of Australia.',
        'After the rains, budgies gather in flocks of tens of thousands.',
        'They do not have one home. They keep moving to wherever the food and the water are.'
      ],
      manners: 'Ask its person before you offer anything. A sprig of millet held flat and still is the polite way — and never, ever avocado, which is poisonous to birds.'
    },
    {
      id: 'cockatiel', name: 'Cockatiel', family: 'parrot',
      way: 'millet', patience: 3.4, keep: 60, rarity: 2, value: 105,
      times: ['morning', 'day'], places: ['garden', 'orchard'],
      measure: 'about as long as a pencil, plus a long tail', size: 0.43,
      art: { shape: 'parrot', body: '#c8c4b4', wing: '#e4e0d2', face: '#f0d868',
        beak: '#b8ac94', accent: '#8a8674', cheek: '#e07a4a', crest: true },
      facts: [
        'The feathery crest on its head goes up and down to show how it is feeling.',
        'It is a little cockatoo, all the way from Australia.',
        'It can crack a seed open and eat it in a couple of seconds.'
      ],
      manners: 'Watch the crest. Straight up means excited, flat down means nervous — and a nervous bird wants you to back off and try again later.'
    },
    {
      id: 'scarlet_macaw', name: 'Scarlet Macaw', family: 'parrot',
      way: 'watch', patience: 5.0, keep: 128, rarity: 4, value: 300,
      times: ['morning', 'day'], places: ['forest', 'orchard'],
      measure: 'as long as your arm, and half of that is tail', size: 0.96,
      art: { shape: 'parrot', body: '#e0392f', wing: '#f0b02a', face: '#f6f0e4',
        beak: '#efe8d8', accent: '#2f6bc0', cheek: '#f6f0e4', longtail: true,
        wingTip: '#2f6bc0' },
      facts: [
        'Its beak is strong enough to crack open nuts that nothing else can open.',
        'Scarlet macaws pick one partner and stay together for life.',
        'They sometimes nibble clay from the riverbank to help settle their tummies.'
      ],
      manners: 'Wild macaws are for watching, not for touching, and that beak means it every time. Sit down, stay quiet, and enjoy the noise they make.'
    },
    {
      id: 'african_grey', name: 'African Grey Parrot', family: 'parrot',
      way: 'watch', patience: 5.6, keep: 118, rarity: 4, value: 320,
      times: ['morning', 'day', 'evening'], places: ['forest'],
      measure: 'about as long as your forearm', size: 0.55,
      art: { shape: 'parrot', body: '#9aa0a4', wing: '#b8bec2', face: '#f2f2ee',
        beak: '#2f2a28', accent: '#5f6468', cheek: '#f2f2ee', redtail: true },
      facts: [
        'A grey parrot called Alex learned the names of fifty things, seven colours and five shapes, and could count up to six.',
        'They live in the rainforests of central and west Africa.',
        'At night they gather in trees above the water, often on little islands in the river.'
      ],
      manners: 'Greys are clever and very watchful, and wild ones stay well away from people. The kindest thing is to sit still, keep quiet, and just let it look at you.'
    }
  ];

  GG.ANIMAL_BY_ID = {};
  GG.ANIMALS.forEach(function (a, i) {
    a.index = i;
    a.isAnimal = true;
    GG.ANIMAL_BY_ID[a.id] = a;
  });

  GG.FAMILY_NAMES = {
    hummingbird: 'Hummingbirds', frog: 'Frogs', bat: 'Bats',
    dog: 'Dogs', cat: 'Cats', parrot: 'Parrots'
  };

  /* Which family lives where, for the Friends Book */
  GG.animalPlaces = function (def) {
    return def.places.map(function (p) { return GG.HABITAT_NAMES[p] || p; }).join(', ');
  };
})(window.GG = window.GG || {});
