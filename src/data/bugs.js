/* Guin's Garden — bug roster.
   Each species: where it lives, when it comes out, how it moves,
   how to draw it, and true facts for the Bug Book. */
(function (GG) {
  'use strict';

  // habitats: meadow, garden, forest, pond, hill, orchard, riverbank,
  //           river, beach, shore, tidepool, desert, mountain, taiga, tundra,
  //           rainforest, glade, savanna, swamp, cave, badlands, bamboo,
  //           cherry, farmyard, dogpark, mesa, anywhere
  // times:    morning, day, evening, night, any
  // behavior: flutter, hover, dart, crawl, hop, glow, skim, cling, slow, drift, tide
  // aquatic:  true means it needs water to live in, so it can only be kept in a
  //           fish tank or a hybrid tank - never a dry terrarium
  // rarity:   1 common .. 5 legendary

  GG.BUGS = [
    {
      id: 'blue_butterfly', name: 'Little Blue Butterfly',
      habitats: ['meadow', 'garden'], times: ['morning', 'day'], rarity: 1, value: 10,
      behavior: 'flutter', speed: 34, shy: 46, size: 1.0,
      measure: '1 inch across',
      art: { shape: 'butterfly', body: '#4a4356', wing: '#8fd0ff', wing2: '#d9f1ff', accent: '#ffffff', pattern: 'edge' },
      facts: [
        'Blue butterflies taste with their feet. They step on a leaf to find out if it is good food for their babies.',
        'Many little blue butterflies are friends with ants. The ants protect the caterpillars, and the caterpillars give the ants a sweet drink.'
      ]
    },
    {
      id: 'cabbage_white', name: 'Cabbage White',
      habitats: ['garden', 'meadow'], times: ['morning', 'day'], rarity: 1, value: 8,
      behavior: 'flutter', speed: 32, shy: 40, size: 1.05,
      measure: '2 inches across',
      art: { shape: 'butterfly', body: '#5a5348', wing: '#fbfbf3', wing2: '#ffffff', accent: '#3c3a33', pattern: 'spots' },
      facts: [
        'Cabbage whites are one of the most common butterflies in the world, and they love vegetable gardens.',
        'A butterfly wing is covered in tiny scales, like the shingles on a roof. If you touch one, some of the scales rub off like powder.'
      ]
    },
    {
      id: 'monarch', name: 'Monarch Butterfly',
      habitats: ['meadow', 'garden'], times: ['morning', 'day'], rarity: 3, value: 60,
      behavior: 'flutter', speed: 38, shy: 64, size: 1.25,
      measure: '4 inches across',
      art: { shape: 'butterfly', body: '#2b2b2b', wing: '#ff8c1a', wing2: '#ffb454', accent: '#1d1d1d', pattern: 'veins' },
      facts: [
        'Monarchs fly thousands of miles to spend the winter somewhere warm. That is one of the longest trips any insect makes.',
        'Monarch caterpillars only eat milkweed. The milkweed makes them taste terrible, so birds learn to leave them alone.',
        'No single monarch makes the whole round trip. It takes several generations to finish the journey.'
      ]
    },
    {
      id: 'swallowtail', name: 'Swallowtail Butterfly',
      habitats: ['garden', 'meadow'], times: ['day'], rarity: 2, value: 30,
      behavior: 'flutter', speed: 40, shy: 60, size: 1.2,
      measure: '4 inches across',
      art: { shape: 'swallowtail', body: '#2f2a22', wing: '#ffdf5c', wing2: '#ffeea1', accent: '#20252e', pattern: 'stripes' },
      facts: [
        'Swallowtails get their name from the long tails on their back wings, like the tail of a swallow bird.',
        'A swallowtail caterpillar can pop out an orange, smelly fork from its head to scare away birds.'
      ]
    },
    {
      id: 'blue_morpho', name: 'Blue Morpho',
      habitats: ['forest'], times: ['day'], rarity: 5, value: 300,
      behavior: 'flutter', speed: 46, shy: 96, size: 1.5,
      measure: '6 inches across',
      art: { shape: 'butterfly', body: '#20202a', wing: '#2f7bff', wing2: '#7fc5ff', accent: '#0d1730', pattern: 'edge' },
      facts: [
        'A blue morpho is not actually painted blue. Its wings are covered in tiny ridges that bend light, so we see a shiny blue.',
        'When it closes its wings, the brown underside with big eye spots makes it almost disappear against a tree.'
      ]
    },
    {
      id: 'luna_moth', name: 'Luna Moth',
      habitats: ['forest'], times: ['night'], rarity: 4, value: 140,
      behavior: 'flutter', speed: 30, shy: 70, size: 1.32,
      measure: '4 inches across',
      art: { shape: 'lunamoth', body: '#e8f3d2', wing: '#a7e08a', wing2: '#d6f5bd', accent: '#c8556b', pattern: 'eyespots' },
      facts: [
        'A grown-up luna moth has no mouth at all. It never eats. It lives about a week, just long enough to find a mate.',
        'Its long twisty tails confuse bats. The bat aims at the spinning tail and the moth gets away.'
      ]
    },
    {
      id: 'rosy_maple', name: 'Rosy Maple Moth',
      habitats: ['forest', 'orchard'], times: ['night'], rarity: 3, value: 70,
      behavior: 'flutter', speed: 28, shy: 56, size: 1.0,
      measure: '2 inches across',
      art: { shape: 'moth', body: '#ffe08a', wing: '#ff9ecb', wing2: '#ffe97a', accent: '#ffd2e6', pattern: 'bands' },
      facts: [
        'Rosy maple moths are fuzzy like a tiny stuffed animal, and pink and yellow like strawberry lemonade.',
        'Their caterpillars eat maple leaves, which is how the moth got its name.'
      ]
    },
    {
      id: 'atlas_moth', name: 'Atlas Moth',
      habitats: ['forest'], times: ['night'], rarity: 5, value: 350,
      behavior: 'flutter', speed: 24, shy: 92, size: 1.7,
      measure: '10 inches across',
      art: { shape: 'atlas', body: '#6b3a22', wing: '#c1652f', wing2: '#e7a663', accent: '#f3e2c4', pattern: 'window' },
      facts: [
        'Atlas moths have some of the biggest wings of any moth in the world, almost as wide as a dinner plate.',
        'The tips of their front wings look a lot like snake heads. Many scientists think that is a trick to make hungry birds think twice.',
        'Like the luna moth, an adult atlas moth cannot eat. It lives on the energy it stored as a caterpillar.'
      ]
    },
    {
      id: 'ladybug', name: 'Ladybug',
      habitats: ['garden', 'meadow', 'cherry', 'bamboo'], times: ['morning', 'day', 'evening'], rarity: 1, value: 10,
      behavior: 'crawl', speed: 20, shy: 30, size: 0.8,
      measure: 'as big as a pea',
      art: { shape: 'ladybug', body: '#e02f2f', wing: '#e02f2f', accent: '#1a1a1a', pattern: 'spots' },
      facts: [
        'One ladybug can eat 50 aphids in a day, so gardeners love them.',
        'The bright red colour is a warning. It tells birds "I taste awful, do not eat me."',
        'Ladybugs are really beetles. Their red shells are hard covers that fold over their real flying wings.'
      ]
    },
    {
      id: 'firefly', name: 'Firefly',
      habitats: ['meadow', 'pond'], times: ['evening', 'night'], rarity: 2, value: 35,
      behavior: 'glow', speed: 26, shy: 44, size: 0.85,
      measure: 'half an inch',
      art: { shape: 'firefly', body: '#3b3326', wing: '#6b5b3e', accent: '#b6ff6a', pattern: 'glow' },
      facts: [
        'A firefly makes light inside its own body, and the light is cold. It does not get hot like a light bulb.',
        'Fireflies blink in patterns to talk to each other. Each kind has its own secret blinking code.',
        'Fireflies are beetles too, even though people call them lightning bugs.'
      ]
    },
    {
      id: 'jewel_beetle', name: 'Jewel Beetle',
      habitats: ['forest', 'orchard'], times: ['day'], rarity: 4, value: 150,
      behavior: 'cling', speed: 18, shy: 72, size: 0.95,
      measure: '1 inch long',
      art: { shape: 'beetle', body: '#12a67a', wing: '#1fd39a', accent: '#0b6b4f', pattern: 'stripes' },
      facts: [
        'Jewel beetles shine like metal and rainbows. People have used their shells to decorate jewellery and clothes.',
        'Some jewel beetles can feel the heat of a forest fire from miles away and fly toward it to lay their eggs in the burnt wood.'
      ]
    },
    {
      id: 'stag_beetle', name: 'Stag Beetle',
      habitats: ['forest'], times: ['evening', 'night'], rarity: 4, value: 160,
      behavior: 'cling', speed: 16, shy: 74, size: 1.2,
      measure: '2.5 inches long',
      art: { shape: 'stagbeetle', body: '#4a2a17', wing: '#6b3d20', accent: '#2a1a10', pattern: 'plain' },
      facts: [
        'The big jaws on a male stag beetle look like deer antlers. He uses them to wrestle other males, not to bite people.',
        'A stag beetle spends years as a grub in rotting wood before it becomes a beetle for just one summer.'
      ]
    },
    {
      id: 'rhino_beetle', name: 'Rhinoceros Beetle',
      habitats: ['forest'], times: ['night'], rarity: 5, value: 320,
      behavior: 'cling', speed: 18, shy: 88, size: 1.4,
      measure: '2.5 inches long',
      art: { shape: 'rhinobeetle', body: '#3b2413', wing: '#5a3a1e', accent: '#26170c', pattern: 'plain' },
      facts: [
        'Rhinoceros beetles are some of the strongest animals for their size. They can push objects many, many times their own weight.',
        'The horn is only on the males, and they use it to flip each other off tree branches.',
        'Even though they look scary, they eat fruit and tree sap and cannot hurt you.'
      ]
    },
    {
      id: 'dung_beetle', name: 'Dung Beetle',
      habitats: ['hill', 'meadow', 'farmyard'], times: ['day', 'evening', 'night'], rarity: 3, value: 65,
      behavior: 'crawl', speed: 22, shy: 48, size: 0.9,
      measure: '1 inch long',
      art: { shape: 'beetle', body: '#2b2b30', wing: '#3d3d46', accent: '#15151a', pattern: 'plain' },
      facts: [
        'Some dung beetles roll animal poop into a ball and push it away, to eat and to raise their babies in. They are nature’s clean-up crew.',
        'Some dung beetles look up at the Milky Way to keep their ball rolling in a straight line. They were the first animals we ever caught using the night sky as a map.',
        'Washington’s are not rollers. Most of ours are dwellers, which live right inside the pat and break it down over a few weeks, and one is a tunneller, which digs it under.',
        'The reason a pasture is not knee-deep in muck is these beetles. Burying it also buries the fly maggots growing in it, so a field with dung beetles in it has fewer flies.'
      ]
    },
    {
      id: 'honeybee', name: 'Honeybee',
      habitats: ['garden', 'orchard', 'cherry'], times: ['morning', 'day'], rarity: 2, value: 25,
      behavior: 'hover', speed: 44, shy: 56, size: 0.85, sting: true,
      measure: 'half an inch',
      art: { shape: 'bee', body: '#e8a020', wing: '#fff0c4', accent: '#2d2216', pattern: 'stripes' },
      facts: [
        'A honeybee can only sting once. Her stinger is barbed like a fish hook, so it stays behind and she does not survive it. That is why she would much rather you left her alone.',
        'When a honeybee finds flowers, she flies home and dances. The shape of her dance tells the other bees which way to go.',
        'One worker bee makes about a twelfth of a teaspoon of honey in her whole life, so a jar of honey is the work of a lot of bees.',
        'Bees can see a colour we cannot: ultraviolet. Many flowers have secret ultraviolet landing stripes just for bees.'
      ]
    },
    {
      id: 'bumblebee', name: 'Bumblebee',
      habitats: ['garden', 'meadow', 'glade', 'cherry'], times: ['morning', 'day'], rarity: 1, value: 15,
      behavior: 'hover', speed: 38, shy: 44, size: 1.0, sting: true,
      measure: '1 inch long',
      art: { shape: 'bee', body: '#f2c53d', wing: '#fff6dc', accent: '#241f1a', pattern: 'bands' },
      facts: [
        'A bumblebee\u2019s stinger is smooth, so she can sting more than once and it does not hurt her. She hardly ever wants to. Only the girls can sting at all, and only if you frighten them.',
        'Bumblebees grab a flower and shiver until the pollen shakes loose. It is called buzz pollination, and honeybees cannot do it.',
        'A bumblebee can warm herself up by shivering her flight muscles, so she can fly on cold mornings when other bees stay home.'
      ]
    },
    {
      id: 'dragonfly', name: 'Blue Dasher Dragonfly',
      habitats: ['pond', 'meadow', 'swamp'], times: ['morning', 'day'], rarity: 2, value: 40,
      behavior: 'dart', speed: 78, shy: 78, size: 1.1,
      measure: '1.5 inches long',
      art: { shape: 'dragonfly', body: '#3aa0d8', wing: '#e7f6ff', accent: '#1c5f87', pattern: 'plain' },
      facts: [
        'Dragonflies are amazing hunters. In tests they caught almost every bug they went after, way more often than a lion or a shark does.',
        'A dragonfly can fly up, down, backwards and sideways, and hover in one spot like a helicopter.',
        'Its huge eyes are made of thousands of tiny lenses and can see almost all the way around its head.'
      ]
    },
    {
      id: 'emperor_dragonfly', name: 'Emperor Dragonfly',
      habitats: ['pond', 'swamp'], times: ['day'], rarity: 4, value: 180,
      behavior: 'dart', speed: 92, shy: 90, size: 1.4,
      measure: '3 inches long',
      art: { shape: 'dragonfly', body: '#2fd08a', wing: '#eafff5', accent: '#146b47', pattern: 'stripes' },
      facts: [
        'Emperor dragonflies often eat small bugs right in mid-air without stopping. Only a big catch makes them land.',
        'A young dragonfly lives underwater for a year or more before it climbs out and its back splits open to let the adult out.'
      ]
    },
    {
      id: 'damselfly', name: 'Damselfly',
      habitats: ['pond', 'swamp'], times: ['morning', 'day', 'evening'], rarity: 2, value: 28,
      behavior: 'drift', speed: 40, shy: 52, size: 0.9,
      measure: '1.5 inches long',
      art: { shape: 'damselfly', body: '#5ad2ff', wing: '#f2fbff', accent: '#1b7fae', pattern: 'plain' },
      facts: [
        'Damselflies look like skinny dragonflies. The easy way to tell: a damselfly folds its wings up when it lands, a dragonfly keeps them out flat.',
        'Damselflies are much slower and flutterier fliers than dragonflies, so they are easier to catch.'
      ]
    },
    {
      id: 'water_strider', name: 'Water Strider',
      habitats: ['pond', 'swamp'], times: ['any'], rarity: 2, value: 26,
      behavior: 'skim', speed: 56, shy: 50, size: 0.85,
      measure: 'half an inch',
      art: { shape: 'strider', body: '#4a4f3a', wing: '#6b7150', accent: '#2b2f22', pattern: 'plain' },
      facts: [
        'Water striders walk on top of the water. Their feet are covered in thousands of tiny hairs that trap air and never get wet.',
        'They feel tiny ripples with their legs to find out where a bug fell in, then skate over to it.'
      ]
    },
    {
      id: 'grasshopper', name: 'Grasshopper',
      habitats: ['meadow', 'hill', 'glade', 'savanna'], times: ['morning', 'day', 'evening'], rarity: 1, value: 12,
      behavior: 'hop', speed: 30, shy: 50, size: 1.0,
      measure: '1.5 inches long',
      art: { shape: 'grasshopper', body: '#7fbf3f', wing: '#a6d95f', accent: '#3f6b1f', pattern: 'plain' },
      facts: [
        'A grasshopper can jump about twenty times its own body length. If you could do that, you would jump over a house.',
        'Grasshoppers have ears on their bellies, not their heads.',
        'They sing by rubbing a rough leg against a wing, like running a stick along a fence.'
      ]
    },
    {
      id: 'cricket', name: 'Cricket',
      habitats: ['meadow', 'garden', 'savanna'], times: ['evening', 'night'], rarity: 2, value: 22,
      behavior: 'hop', speed: 28, shy: 46, size: 0.9,
      measure: '1 inch long',
      art: { shape: 'cricket', body: '#3a2f26', wing: '#544434', accent: '#1f1a14', pattern: 'plain' },
      facts: [
        'Crickets chirp faster when it is warm and slower when it is cool. You can guess the temperature by counting their chirps.',
        'Only the boys chirp, and they do it by rubbing their wings together, not their legs.'
      ]
    },
    {
      id: 'katydid', name: 'Katydid',
      habitats: ['forest', 'orchard', 'glade'], times: ['night'], rarity: 3, value: 60,
      behavior: 'cling', speed: 24, shy: 62, size: 1.15,
      measure: '2 inches long',
      art: { shape: 'katydid', body: '#6fbf4e', wing: '#8fd96a', accent: '#3d7a2c', pattern: 'veins' },
      facts: [
        'A katydid looks exactly like a green leaf, right down to the little veins, so predators fly right past it.',
        'Their name comes from their song. People thought it sounded like someone saying "katy did, katy didn’t."'
      ]
    },
    {
      id: 'mantis', name: 'Praying Mantis',
      habitats: ['garden', 'meadow'], times: ['day', 'evening'], rarity: 4, value: 150,
      behavior: 'cling', speed: 20, shy: 70, size: 1.3,
      measure: '3 inches long',
      art: { shape: 'mantis', body: '#7fd06a', wing: '#9be385', accent: '#3f7a33', pattern: 'plain' },
      facts: [
        'A praying mantis can swivel its head halfway around to peek right over its own shoulder. Almost no other insect can do that.',
        'It sits perfectly still with its spiky front legs folded up, then grabs a bug faster than you can blink.',
        'A mantis is the only insect we know of that sees in 3D. It does it a different way than we do: it watches for tiny movements to work out exactly how far away a bug is.'
      ]
    },
    {
      id: 'walking_stick', name: 'Walking Stick',
      habitats: ['forest'], times: ['any'], rarity: 4, value: 130,
      behavior: 'cling', speed: 12, shy: 66, size: 1.35,
      measure: '4 inches long',
      art: { shape: 'stickbug', body: '#8a6a3c', wing: '#a9884f', accent: '#5c4426', pattern: 'plain' },
      facts: [
        'A walking stick looks just like a twig. It even sways back and forth as if the wind were blowing it.',
        'If a bird grabs one by the leg, a walking stick can let the leg pop off and escape. A young one can grow the leg back the next time it sheds its skin.'
      ]
    },
    {
      id: 'cicada', name: 'Cicada',
      habitats: ['forest', 'orchard'], times: ['day'], rarity: 3, value: 70,
      behavior: 'cling', speed: 30, shy: 64, size: 1.15,
      measure: '2 inches long',
      art: { shape: 'cicada', body: '#2f4a3a', wing: '#dff2ea', accent: '#c58b2a', pattern: 'veins' },
      facts: [
        'Cicadas are some of the loudest insects on Earth. A big group singing can be as loud as a lawn mower.',
        'Some cicadas live underground for 13 or 17 years, then all climb out in the same summer together.',
        'The crunchy empty shells you find stuck on trees are the skins they crawled out of.'
      ]
    },
    {
      id: 'ant', name: 'Carpenter Ant',
      habitats: ['anywhere'], times: ['any'], rarity: 1, value: 6,
      behavior: 'crawl', speed: 34, shy: 24, size: 0.6,
      measure: 'a quarter to half an inch',
      art: { shape: 'ant', body: '#2a1d16', wing: '#3d2b20', accent: '#120c09', pattern: 'plain' },
      facts: [
        'An ant can lift many times its own weight, because small bodies are strong for their size.',
        'Ants leave a smell trail for each other. That is why they all march in a line to the same crumb.',
        'An ant colony works like one big family, and every ant has a job.'
      ]
    },
    {
      id: 'caterpillar', name: 'Caterpillar',
      habitats: ['garden', 'orchard'], times: ['any'], rarity: 1, value: 10,
      behavior: 'slow', speed: 10, shy: 20, size: 0.9,
      measure: '2 inches long',
      art: { shape: 'caterpillar', body: '#8fd14f', wing: '#b6e77a', accent: '#2f2f2f', pattern: 'bands' },
      facts: [
        'A caterpillar has way more muscles than you do, and it only has to worry about eating and growing.',
        'Inside its chrysalis, most of the caterpillar melts into mush. But little patches of special cells stay put, and they build the butterfly from the mush.',
        'Caterpillars have six real legs up front. The stubby back ones are called prolegs and help them hold on.'
      ]
    },
    {
      id: 'garden_spider', name: 'Garden Spider',
      habitats: ['garden', 'forest', 'savanna', 'bamboo'], times: ['any'], rarity: 2, value: 30,
      behavior: 'cling', speed: 22, shy: 56, size: 1.0,
      measure: '1 inch across',
      art: { shape: 'spider', body: '#f0d24a', wing: '#2a2a2a', accent: '#1a1a1a', pattern: 'spots' },
      facts: [
        'Spider silk is amazingly tough. A silk thread is stronger than a steel thread of the same weight, and it stretches too.',
        'Spiders are not insects. Insects have six legs and three body parts, spiders have eight legs and two.',
        'A garden spider often eats its old web and spins a fresh one, sometimes every single day.'
      ]
    },
    {
      id: 'pillbug', name: 'Pill Bug',
      habitats: ['forest', 'garden', 'rainforest', 'bamboo'], times: ['any'], rarity: 1, value: 8,
      behavior: 'slow', speed: 14, shy: 22, size: 0.7,
      measure: 'half an inch',
      art: { shape: 'pillbug', body: '#6b6b78', wing: '#8a8a99', accent: '#42424d', pattern: 'bands' },
      facts: [
        'Pill bugs roll into a perfect ball when something scares them. That is why some people call them roly-polies.',
        'They are not insects at all. They are crustaceans, so they are closer cousins to crabs and shrimp.',
        'Pill bugs breathe with gills, so they have to stay somewhere damp, like under a log.'
      ]
    },
    {
      id: 'snail', name: 'Garden Snail',
      habitats: ['garden', 'forest', 'bamboo'], times: ['any'], rarity: 1, value: 12,
      behavior: 'slow', speed: 8, shy: 16, size: 0.95,
      measure: '1 inch shell',
      art: { shape: 'snail', body: '#d8c7a8', wing: '#b4864a', accent: '#7a5730', pattern: 'spiral' },
      facts: [
        'A snail has thousands of tiny teeth on a tongue like a ribbon, and it uses them to scrape food off leaves.',
        'Snails glide on a trail of slime. It works like a cushion, so a snail can slide over rough, scratchy things without hurting its soft foot.',
        'A snail carries its house on its back and can pull all the way inside when it is scared.'
      ]
    }
,
    /* ===== the second wave ===== */
    {
      id: 'earthworm', name: 'Earthworm',
      habitats: ['garden', 'meadow', 'forest', 'rainforest'], times: ['any'], rarity: 1, value: 10,
      behavior: 'slow', speed: 9, shy: 18, size: 1.15, rainLover: true,
      measure: '4 inches long',
      art: { shape: 'worm', body: '#c98a8a', wing: '#e0a5a5', accent: '#a86a6a', pattern: 'rings' },
      facts: [
        'Earthworms eat their way through soil and leave it richer behind them. Gardeners call them nature’s ploughs.',
        'A worm has no lungs. It breathes through its damp skin, so it has to stay moist all the time.',
        'Worms come up in the rain to travel. On wet ground they can cross to a new patch of garden without drying out.',
        'An earthworm has bristles along its body to grip the tunnel, which is why a bird has to pull so hard.'
      ]
    },
    {
      id: 'centipede', name: 'Centipede',
      habitats: ['forest', 'garden', 'rainforest'], times: ['evening', 'night'], rarity: 2, value: 28,
      behavior: 'crawl', speed: 62, shy: 44, size: 1.25,
      measure: '2 inches long',
      art: { shape: 'centipede', body: '#c4682f', wing: '#e08a45', accent: '#7a3d18', pattern: 'plain' },
      facts: [
        'Centipedes have one pair of legs on each body segment, and they run fast on all of them.',
        'No centipede actually has a hundred legs. They always have an odd number of pairs, so 100 is impossible.',
        'Centipedes hunt other little creepy-crawlies at night, which makes them useful to have under a log.'
      ]
    },
    {
      id: 'millipede', name: 'Millipede',
      habitats: ['forest', 'garden', 'bamboo'], times: ['any'], rarity: 2, value: 24,
      behavior: 'slow', speed: 13, shy: 26, size: 1.2,
      measure: '1.5 inches long',
      art: { shape: 'millipede', body: '#3f2f28', wing: '#5a443a', accent: '#241a16', pattern: 'rings' },
      facts: [
        'A millipede has two pairs of legs on every segment, twice as many as a centipede, but it is much slower.',
        'Almost no millipede really has a thousand legs. Most have a few hundred. But one deep-burrowing millipede in Australia has 1,306, the most legs of any animal on Earth.',
        'Instead of biting, a frightened millipede curls into a tight spiral and can give off a smell predators dislike.'
      ]
    },
    {
      id: 'harvestman', name: 'Harvestman',
      habitats: ['forest', 'garden', 'rainforest', 'cave'], times: ['evening', 'night'], rarity: 2, value: 26,
      behavior: 'crawl', speed: 30, shy: 46, size: 1.2,
      measure: 'body the size of a pea',
      art: { shape: 'harvestman', body: '#8a6a4a', wing: '#3a2f26', accent: '#4a3a2a', pattern: 'plain' },
      facts: [
        'People call them daddy long-legs, but a harvestman is not a spider. Its body is one little blob instead of two parts, and it spins no web.',
        'Harvestmen have no venom and no fangs at all. The story that they are the most poisonous spider is completely made up.',
        'They eat tiny bugs and bits of rotting fruit, and they walk on legs that can be ten times longer than their body.',
        'Some kinds spend the whole winter in caves, hanging from the ceiling in a crowd with their legs tangled together.'
      ]
    },
    {
      id: 'crane_fly', name: 'Crane Fly',
      habitats: ['meadow', 'pond', 'garden', 'rainforest'], times: ['evening', 'night'], rarity: 1, value: 12,
      behavior: 'drift', speed: 34, shy: 44, size: 1.25,
      measure: '2 inches across',
      art: { shape: 'cranefly', body: '#9a8a6a', wing: '#eae6d8', accent: '#6b5f47', pattern: 'plain' },
      facts: [
        'Crane flies look like giant wobbly mosquitoes, but they do not bite anyone at all.',
        'Most adult crane flies barely eat. They live a few days, just long enough to lay eggs.',
        'Their legs snap off very easily, which helps them wriggle free of a spider web.'
      ]
    },
    {
      id: 'hoverfly', name: 'Hoverfly',
      habitats: ['garden', 'meadow', 'glade', 'cherry'], times: ['morning', 'day'], rarity: 1, value: 14,
      behavior: 'hover', speed: 48, shy: 46, size: 0.8,
      measure: 'half an inch',
      art: { shape: 'fly', body: '#e0a832', wing: '#f2f6ff', accent: '#2b2b20', pattern: 'bands' },
      facts: [
        'A hoverfly wears wasp stripes as a disguise, but it has no sting at all. Birds leave it alone anyway.',
        'The easy way to tell: a hoverfly has two wings and enormous eyes, while a wasp has four wings and a pinched waist.',
        'Hoverflies can hang perfectly still in the air, and many kinds have babies that hunt aphids. One grub can munch hundreds of them.'
      ]
    },
    {
      id: 'housefly', name: 'House Fly',
      habitats: ['anywhere'], times: ['morning', 'day', 'evening'], rarity: 1, value: 6,
      behavior: 'dart', speed: 62, shy: 48, size: 0.75,
      measure: 'a quarter inch',
      art: { shape: 'fly', body: '#4a4a52', wing: '#eef2f6', accent: '#22242a', pattern: 'plain' },
      facts: [
        'A house fly tastes with its feet, so it walks over your sandwich to find out what it is.',
        'Flies cannot chew. They dribble spit onto food to turn it soupy, then sponge it up.',
        'Its eyes are made of thousands of little lenses, which is why it sees your hand coming.'
      ]
    },
    {
      id: 'mayfly', name: 'Mayfly',
      habitats: ['pond'], times: ['evening'], rarity: 2, value: 30,
      behavior: 'drift', speed: 30, shy: 50, size: 0.9,
      measure: '1 inch long',
      art: { shape: 'mayfly', body: '#d8c98a', wing: '#f4f8ff', accent: '#8a7a4a', pattern: 'plain' },
      facts: [
        'A mayfly spends a year or more as a nymph under the water, then lives as a winged adult for only a day or two.',
        'Grown-up mayflies cannot eat at all. They have no working mouth, so they just dance over the water and lay eggs.',
        'Mayflies are the only insects that moult once more after they already have working wings.'
      ]
    },
    {
      id: 'caddisfly', name: 'Caddisfly',
      habitats: ['pond', 'riverbank', 'rainforest'], times: ['evening', 'night'], rarity: 2, value: 28,
      behavior: 'flutter', speed: 30, shy: 48, size: 0.9,
      measure: '1 inch long',
      art: { shape: 'caddis', body: '#8a7048', wing: '#b09a6a', accent: '#5a462c', pattern: 'plain' },
      facts: [
        'A baby caddisfly builds itself a case out of sand, pebbles and twigs, glued together with silk, and carries it about like a tiny suit of armour.',
        'Most caddisflies need clean, fast water, so scientists count them to check whether a stream is healthy.',
        'The grown-up looks like a small furry moth, and it flies mostly at night.',
        'Some artists give caddisfly larvae gold and gemstones to build with, and the little cases turn into jewellery.'
      ]
    },
    {
      id: 'lacewing', name: 'Green Lacewing',
      habitats: ['garden', 'meadow', 'glade', 'cherry', 'bamboo'], times: ['evening', 'night'], rarity: 2, value: 32,
      behavior: 'drift', speed: 28, shy: 46, size: 0.95,
      measure: '1 inch across',
      art: { shape: 'lacewing', body: '#a8dc6a', wing: '#e6ffe0', accent: '#5f9c3a', pattern: 'veins' },
      facts: [
        'Lacewing wings look like they are made of pale green stained glass, criss-crossed with tiny veins.',
        'The babies are such fierce aphid hunters that gardeners nickname them aphid lions.',
        'A lacewing lays each egg on top of a thin stalk of silk, so the first baby to hatch cannot eat the others.'
      ]
    },
    {
      id: 'antlion', name: 'Antlion',
      habitats: ['hill', 'forest'], times: ['evening', 'night'], rarity: 3, value: 70,
      behavior: 'drift', speed: 26, shy: 56, size: 1.1,
      measure: '2 inches across',
      art: { shape: 'antlion', body: '#9a8a6a', wing: '#efe8d2', accent: '#6b5c3a', pattern: 'veins' },
      facts: [
        'A baby antlion digs a funnel-shaped pit in dry sand and hides at the bottom, waiting for an ant to slip in.',
        'If the ant tries to climb out, the antlion flicks sand at it to start a little landslide.',
        'The grown-up looks a bit like a damselfly, but you can tell them apart by the antlion’s short clubbed feelers.'
      ]
    },
    {
      id: 'clearwing', name: 'Hummingbird Clearwing',
      habitats: ['garden', 'meadow'], times: ['morning', 'day'], rarity: 3, value: 80,
      behavior: 'hover', speed: 56, shy: 62, size: 1.1,
      measure: '2 inches across',
      art: { shape: 'clearwing', body: '#9a6a3a', wing: '#f0e4d2', accent: '#c25a6a', pattern: 'window' },
      facts: [
        'This is a moth, not a bird and not a bee, even though people call it a hummingbird moth or a bumblebee moth.',
        'It hovers in front of a flower in broad daylight and sips nectar through a long curled tongue.',
        'Its wings start out covered in scales like any moth, then the middle scales fall away and leave clear windows.'
      ]
    },
    {
      id: 'hawk_moth', name: 'Hawk Moth',
      habitats: ['garden', 'meadow'], times: ['evening', 'night'], rarity: 3, value: 85,
      behavior: 'hover', speed: 62, shy: 66, size: 1.35,
      measure: '3 inches across',
      art: { shape: 'hawkmoth', body: '#6b5a42', wing: '#8a7050', accent: '#e0a06a', pattern: 'bands' },
      facts: [
        'Hawk moths are powerful, speedy fliers, and they hover at flowers like little helicopters.',
        'They come out at dusk, when pale flowers open and smell strongest.',
        'Some have a tongue longer than their whole body, curled up like a party blower until they need it.'
      ]
    },
    {
      id: 'io_moth', name: 'Io Moth',
      habitats: ['forest', 'orchard'], times: ['night'], rarity: 3, value: 90,
      behavior: 'flutter', speed: 28, shy: 58, size: 1.2,
      measure: '2.5 inches across',
      art: { shape: 'moth', body: '#f0d24a', wing: '#f2c23a', wing2: '#e8a23a', accent: '#2b2b6b', pattern: 'eyespots' },
      facts: [
        'When something bothers an Io moth it flicks its front wings forward to show two huge eyespots, like a startled owl.',
        'The spiky green caterpillar can sting, so it is one to look at and not touch.',
        'The male\u2019s antennae are big and feathery, far bushier than the female\u2019s, and he uses them to smell her from far away.'
      ]
    },
    {
      id: 'weevil', name: 'Acorn Weevil',
      habitats: ['orchard', 'forest'], times: ['morning', 'day'], rarity: 2, value: 30,
      behavior: 'slow', speed: 16, shy: 34, size: 0.8,
      measure: 'a third of an inch, plus a long snout',
      art: { shape: 'weevil', body: '#8a6a3a', wing: '#a98a52', accent: '#5a4425', pattern: 'plain' },
      facts: [
        'A weevil has a long curved snout with tiny jaws right on the tip, like a drill.',
        'The acorn weevil drills a hole in a green acorn and lays an egg inside, and the grub eats the acorn from within.',
        'Weevils are the biggest family of animals on Earth. There are more kinds of weevil than there are kinds of bird, fish and mammal put together.'
      ]
    },
    {
      id: 'tiger_beetle', name: 'Tiger Beetle',
      habitats: ['hill', 'meadow', 'beach', 'riverbank', 'savanna'], times: ['day'], rarity: 3, value: 90,
      behavior: 'dart', speed: 78, shy: 82, size: 0.9,
      measure: 'three quarters of an inch long',
      art: { shape: 'tigerbeetle', body: '#2f7a5a', wing: '#3f9a6a', accent: '#f2efe0', eyes: '#e8e2c8' },
      facts: [
        'Tiger beetles are among the fastest runners on Earth for their size. One kind covers 125 body lengths every single second.',
        'They run so fast their eyes cannot keep up, so they have to stop, look, and then dash again.',
        'Baby tiger beetles live head-up in a straight tunnel in the ground and grab insects that walk past the door.',
        'Some beach tiger beetles are protected by law, so in the real world we look at them and leave them be.'
      ]
    },
    {
      id: 'stink_bug', name: 'Stink Bug',
      habitats: ['garden', 'orchard', 'meadow'], times: ['any'], rarity: 1, value: 14,
      behavior: 'crawl', speed: 22, shy: 34, size: 0.95,
      measure: 'half an inch',
      art: { shape: 'shieldbug', body: '#8a8a5a', wing: '#a3a36a', accent: '#5a5a38', pattern: 'speckle' },
      facts: [
        'A stink bug really does stink. Squeeze one and it squirts a smelly liquid from holes in its chest.',
        'The smell is its whole defence, and it works: birds spit them straight back out.',
        'Its back is shaped like a little shield, which is why they are also called shield bugs.'
      ]
    },
    {
      id: 'picasso_bug', name: 'Picasso Bug',
      habitats: ['forest', 'orchard'], times: ['day'], rarity: 5, value: 330,
      behavior: 'cling', speed: 18, shy: 86, size: 0.95,
      measure: 'half an inch',
      art: { shape: 'shieldbug', body: '#e8d24a', wing: '#f2df6a', accent: '#1f4a8a', pattern: 'picasso' },
      facts: [
        'A Picasso bug is pale green and gold with eleven dark rings, each one with a red dot inside, like a tiny modern painting.',
        'The bright pattern is a warning. It is a kind of shield bug, and it smells terrible if you bother it.',
        'That shield is not a wing case like a beetle\u2019s. It is a giant plate grown from its back that covers its four folded wings like a lid.'
      ]
    },
    {
      id: 'firebug', name: 'Firebug',
      habitats: ['meadow', 'garden'], times: ['morning', 'day'], rarity: 2, value: 26,
      behavior: 'crawl', speed: 26, shy: 36, size: 0.85,
      measure: 'half an inch',
      art: { shape: 'shieldbug', body: '#d8322a', wing: '#e8483a', accent: '#1a1a1a', pattern: 'firebug' },
      facts: [
        'Firebugs are bright red and black, and they gather in big huddles on sunny days, often at the foot of a lime tree.',
        'Bright red and black is a warning sign. Birds learn that firebugs taste horrible and leave them alone.',
        'They eat fallen seeds, so they do no harm to the garden at all.'
      ]
    },
    {
      id: 'assassin_bug', name: 'Assassin Bug',
      habitats: ['garden', 'forest'], times: ['day', 'evening'], rarity: 3, value: 72,
      behavior: 'cling', speed: 26, shy: 62, size: 1.0,
      measure: '0.75 inches long',
      art: { shape: 'assassinbug', body: '#6b2f2a', wing: '#8a3f36', accent: '#2b1a16', pattern: 'plain' },
      facts: [
        'An assassin bug stabs its prey with a curved beak and turns the insides to soup before drinking them.',
        'It tucks that beak into a groove under its chest when it is not using it.',
        'Some assassin bugs stick the leftover shells of their meals onto their own backs as a disguise.'
      ]
    },
    {
      id: 'wheel_bug', name: 'Wheel Bug',
      habitats: ['orchard', 'forest'], times: ['day', 'evening'], rarity: 4, value: 155,
      behavior: 'cling', speed: 22, shy: 72, size: 1.3,
      measure: '1.25 inches long',
      art: { shape: 'wheelbug', body: '#6b6b60', wing: '#84847a', accent: '#3a3a33', pattern: 'plain' },
      facts: [
        'A wheel bug wears a cog on its back, like half a gearwheel. No other insect in North America has one.',
        'It is the biggest assassin bug around, and it hunts caterpillars that would otherwise eat the orchard.',
        'It can give a painful jab if you grab it, so this is a bug to admire from a step back.'
      ]
    },
    {
      id: 'aphid', name: 'Aphid',
      habitats: ['garden', 'orchard'], times: ['any'], rarity: 1, value: 6,
      behavior: 'slow', speed: 8, shy: 16, size: 0.5,
      measure: 'smaller than a grain of rice',
      art: { shape: 'aphid', body: '#8fd86a', wing: '#b6ea94', accent: '#3f7a2a', pattern: 'plain' },
      facts: [
        'Aphids drink sap through a straw-like beak, and the sweet leftovers they drip are called honeydew.',
        'Ants farm aphids for that honeydew. They protect them from ladybirds and even carry them to fresh leaves.',
        'A mother aphid can give birth to daughters that are already carrying their own daughters inside them.'
      ]
    },
    {
      id: 'leafhopper', name: 'Leafhopper',
      habitats: ['meadow', 'garden'], times: ['morning', 'day'], rarity: 1, value: 14,
      behavior: 'hop', speed: 34, shy: 44, size: 0.6,
      measure: 'a quarter inch',
      art: { shape: 'leafhopper', body: '#4fc8a0', wing: '#6fe0bc', accent: '#1f6b52', pattern: 'stripes' },
      facts: [
        'Leafhoppers can jump many times their own height, using legs that work like a catapult.',
        'They come in astonishing colours for such tiny insects: mint green, sky blue, candy stripes.',
        'When you walk through long grass in summer, the little things pinging off your legs are usually leafhoppers.'
      ]
    },
    {
      id: 'treehopper', name: 'Thorn Treehopper',
      habitats: ['forest', 'orchard'], times: ['day'], rarity: 3, value: 78,
      behavior: 'cling', speed: 20, shy: 56, size: 0.7,
      measure: 'a quarter inch',
      art: { shape: 'treehopper', body: '#6b9a3a', wing: '#86b84a', accent: '#3f6b22', pattern: 'plain' },
      facts: [
        'A thorn treehopper has a spike on its back that makes it look exactly like a thorn on the twig.',
        'Sit still on a branch and even a sharp-eyed bird walks straight past it.',
        'Treehoppers talk to each other by shaking the plant they are standing on, sending buzzes down the stem.'
      ]
    },
    {
      id: 'lanternfly', name: 'Spotted Lanternfly',
      habitats: ['orchard', 'forest'], times: ['day', 'evening'], rarity: 3, value: 68,
      behavior: 'hop', speed: 40, shy: 58, size: 1.05,
      measure: '1 inch long',
      art: { shape: 'lanternfly', body: '#d8c0a0', wing: '#e8d8bc', accent: '#2b2b2b', pattern: 'lantern' },
      facts: [
        'A spotted lanternfly keeps bright red underwings hidden beneath its spotty grey front wings and flashes them when it jumps.',
        'It is not really a fly. It is a planthopper, and it is a much better jumper than it is a flier.',
        'In many places it is an unwelcome visitor that arrived from far away and harms trees, so scientists ask people to report where they see one.'
      ]
    },
    {
      id: 'water_bug', name: 'Giant Water Bug',
      habitats: ['pond', 'swamp'], times: ['any'], rarity: 4, value: 170,
      behavior: 'skim', speed: 44, shy: 68, size: 1.35,
      measure: 'two inches or more — the biggest true bug in North America',
      danger: 'Net it, look at it, and let it go. Do not hold it in your hand. Its other name is the toe biter, and the bite really does hurt. It is not angry and it is not poison — it is a hunter, and your finger is the wrong shape.',
      art: { shape: 'waterbug', body: '#7a6b4a', wing: '#9a8a60', accent: '#4a4030', pattern: 'plain' },
      facts: [
        'Giant water bugs are fierce hunters. They hang head-down on a stem, perfectly still, and catch insects, snails, tadpoles, frogs and even small fish bigger than themselves.',
        'It cannot chew. It gives its dinner one jab, waits ten or fifteen minutes for the inside to go soft, and drinks it.',
        'It breathes through two short tubes at its back end, like a pair of snorkels, and carries the air under its wings.',
        'In many kinds of giant water bug the mother glues her eggs onto the father’s back, and he carries them about and keeps them wet until they hatch.',
        'They can fly from pond to pond at night, and they head for lights, which is why some people call them electric light bugs.',
        'Picked up, it plays dead first. Biting is the thing it tries after running away has not worked.'
      ]
    },
    {
      id: 'backswimmer', name: 'Backswimmer',
      habitats: ['pond', 'swamp'], times: ['any'], rarity: 2, value: 34,
      behavior: 'skim', speed: 58, shy: 52, size: 0.8,
      measure: 'half an inch',
      art: { shape: 'backswimmer', body: '#d8d0b0', wing: '#efe8cc', accent: '#5a4a2a', pattern: 'plain' },
      facts: [
        'A backswimmer swims upside down, rowing along with long back legs like a pair of oars.',
        'Its colours are back to front: its belly is dark and its back is pale. Swimming upside down puts the dark side up and the pale side down, so it is hard to spot from above or below.',
        'It carries a silvery bubble of air against its belly so it can stay under the water and keep breathing.'
      ]
    },
    {
      id: 'cockroach', name: 'Cockroach',
      habitats: ['anywhere'], times: ['evening', 'night'], rarity: 1, value: 10,
      behavior: 'crawl', speed: 74, shy: 40, size: 1.0,
      measure: '1 inch long',
      art: { shape: 'cockroach', body: '#6b4526', wing: '#8a5c33', accent: '#3a2414', pattern: 'plain' },
      facts: [
        'Cockroaches can run incredibly fast for their size and squash flat enough to slip through a gap as thin as two coins stacked up.',
        'Little hairs on their back ends feel the tiniest puff of air, so they are already running before your foot moves.',
        'Out of thousands of kinds of cockroach in the world, only a handful ever come into houses. Most live quietly in forests.'
      ]
    },
    {
      id: 'silverfish', name: 'Silverfish',
      habitats: ['anywhere'], times: ['night'], rarity: 2, value: 24,
      behavior: 'crawl', speed: 56, shy: 42, size: 0.75,
      measure: 'half an inch',
      art: { shape: 'silverfish', body: '#a8adb8', wing: '#c8ccd6', accent: '#6b7080', pattern: 'plain' },
      facts: [
        'Silverfish are shaped like a little fish and wriggle along in the same way, which is how they got the name.',
        'They are one of the oldest kinds of insect. Their ancestors were scurrying about before there were any dinosaurs.',
        'They eat starchy things like paper and wallpaper paste, and they can go a very long time without a meal.'
      ]
    },
    {
      id: 'earwig', name: 'Earwig',
      habitats: ['garden', 'forest', 'bamboo'], times: ['evening', 'night'], rarity: 1, value: 14,
      behavior: 'crawl', speed: 40, shy: 36, size: 0.9,
      measure: '0.75 inches long',
      art: { shape: 'earwig', body: '#7a4a26', wing: '#9a6133', accent: '#3a2210', pattern: 'plain' },
      facts: [
        'Earwigs do not crawl into ears. That is an old story with nothing behind it.',
        'The pincers on the tail are for folding away its wings, wrestling other earwigs and warding off attackers.',
        'An earwig mother is unusual among insects: she guards her eggs, cleans them one by one, and looks after the babies.'
      ]
    },
    {
      id: 'termite', name: 'Termite',
      habitats: ['forest', 'orchard'], times: ['any'], rarity: 2, value: 20,
      behavior: 'crawl', speed: 30, shy: 30, size: 0.6,
      measure: 'a quarter inch',
      art: { shape: 'termite', body: '#e8dcc0', wing: '#f4ecd8', accent: '#a88a5a', pattern: 'plain' },
      facts: [
        'Termites can digest wood because of the tiny helpers living in their guts that break it down for them.',
        'They are not white ants. Their closest relatives are cockroaches.',
        'Some termites build towers of mud taller than a person, with tunnels that keep the inside cool all day.'
      ]
    },
    {
      id: 'bed_bug', name: 'Bed Bug',
      habitats: ['anywhere'], times: ['night'], rarity: 4, value: 120,
      behavior: 'crawl', speed: 30, shy: 58, size: 0.55,
      measure: 'the size of an apple seed',
      art: { shape: 'bedbug', body: '#a8552f', wing: '#c46b3a', accent: '#5a2a14', pattern: 'rings' },
      facts: [
        'Bed bugs are flat and oval, about the size of an apple seed, and they hide in cracks during the day.',
        'They feed on blood at night, but scientists have not found them to spread any disease.',
        'They hitch rides in bags and suitcases, which is how they travel the world. Hot washing and a hot tumble dry sees them off.'
      ]
    },
    {
      id: 'paper_wasp', name: 'Paper Wasp',
      habitats: ['orchard', 'garden', 'farmyard'], times: ['morning', 'day'], rarity: 3, value: 70,
      behavior: 'hover', speed: 54, shy: 60, size: 1.0, sting: true,
      measure: '0.75 inches long',
      art: { shape: 'wasp', body: '#e8a820', wing: '#f6efd8', accent: '#2b2016', pattern: 'stripes' },
      facts: [
        'Paper wasps really do make paper. They chew up old wood, mix it with spit, and build a nest of grey papery cells.',
        'Unlike a honeybee, a wasp’s sting is smooth, so she can sting more than once. She would still rather not.',
        'They are good for a garden, because they carry off the caterpillars that eat the leaves.'
      ]
    },
    {
      id: 'periodical_cicada', name: 'Periodical Cicada',
      habitats: ['forest', 'orchard'], times: ['day'], rarity: 4, value: 160,
      behavior: 'cling', speed: 30, shy: 66, size: 1.05,
      measure: 'about an inch long',
      art: { shape: 'cicada', body: '#2b2b33', wing: '#ffd9b0', accent: '#d83a2a', eyes: '#e0402a', pattern: 'veins' },
      facts: [
        'Periodical cicadas spend 13 or 17 years underground, then the whole brood climbs out in the same few weeks.',
        'You can tell them from other cicadas by their bright red eyes and orange wing veins.',
        'Coming out all at once is their trick: there are so many that the birds cannot possibly eat them all.'
      ]
    },
    /* ---------- the riverbank ---------- */
    {
      id: 'stonefly', name: 'Stonefly',
      habitats: ['riverbank', 'rainforest'], times: ['evening', 'night'], rarity: 2, value: 34,
      behavior: 'crawl', speed: 15, shy: 40, size: 0.95,
      measure: 'three quarters of an inch long',
      art: { shape: 'stonefly', body: '#6b5a3c', wing: '#d8cdb0', accent: '#3c3222', pattern: 'plain' },
      facts: [
        'Stoneflies only live in cold, clean, well-oxygenated water, so finding one means the stream is healthy.',
        'Most grown-up stoneflies never eat at all. They find a mate, and that is their whole grown-up life.',
        'They are clumsy fliers, so you usually find them crawling on wet rocks right beside the water.'
      ]
    },
    {
      id: 'dobsonfly', name: 'Dobsonfly',
      habitats: ['riverbank'], times: ['night'], rarity: 4, value: 200,
      behavior: 'flutter', speed: 30, shy: 66, size: 1.45,
      measure: '5 inches across',
      art: { shape: 'dobsonfly', body: '#4a4038', wing: '#cfc6b4', accent: '#241f19', eyes: '#e8c86a' },
      facts: [
        'A male dobsonfly has enormous curved jaws, but they are far too long to give him any grip, so he cannot pinch you with them.',
        'He uses those long jaws to hold on to a female, a bit like holding hands.',
        'Its baby is called a hellgrammite, and it hunts under the stones of fast water for two or three years before it grows wings.',
        'Grown-up dobsonflies never eat. They live only about a week.'
      ]
    },
    {
      id: 'whirligig', name: 'Whirligig Beetle',
      habitats: ['pond', 'river'], times: ['morning', 'day'], rarity: 2, value: 30,
      behavior: 'skim', speed: 52, shy: 56, size: 0.62,
      measure: 'half an inch long',
      art: { shape: 'whirligig', body: '#1d2026', wing: '#2f353f', accent: '#8fa3b8', eyes: '#d8e4ee' },
      facts: [
        'A whirligig beetle has two pairs of eyes: one pair looking up out of the water and one pair looking down into it.',
        'They spin in fast circles on the surface in busy little crowds, watching for insects that have fallen in.',
        'A whirligig can tuck a bubble of air under its wings and take it along when it dives.'
      ]
    },
    {
      id: 'boatman', name: 'Water Boatman',
      habitats: ['pond', 'river', 'swamp'], times: ['any'], rarity: 1, value: 18,
      behavior: 'skim', speed: 34, shy: 42, size: 0.66,
      measure: 'a third of an inch long',
      art: { shape: 'boatman', body: '#7a6a3c', wing: '#a89858', accent: '#3f3620', eyes: '#2b2418' },
      facts: [
        'A water boatman rows along with back legs shaped exactly like oars.',
        'It carries a silvery bubble of air against its body, like a tiny scuba tank, so it can breathe underwater.',
        'Water boatmen eat algae rather than animals, and they do not bite people. That is their upside-down cousin, the backswimmer.'
      ]
    },
    {
      id: 'mayfly_river', name: 'River Mayfly',
      habitats: ['riverbank'], times: ['evening'], rarity: 2, value: 28,
      behavior: 'drift', speed: 22, shy: 38, size: 0.95,
      measure: '1 inch long with its tails',
      art: { shape: 'mayfly', body: '#c8b06a', wing: '#eef2f6', accent: '#8a7440', pattern: 'plain' },
      facts: [
        'A grown-up mayfly has no working mouth. It cannot eat at all, and often lives just a single day.',
        'Mayflies are the only insects in the world that shed their skin one more time after their wings already work.',
        'Sometimes so many mayflies come out at once that weather radar picks up the swarm.'
      ]
    },

    /* ---------- the beach ---------- */
    {
      id: 'ghost_crab', name: 'Ghost Crab',
      habitats: ['beach'], times: ['night'], rarity: 3, value: 90,
      behavior: 'crawl', speed: 48, shy: 78, size: 1.35,
      measure: '2 inches across',
      art: { shape: 'crab', body: '#efe2c0', wing: '#f8f0d8', accent: '#c9b58c', eyes: '#2b2b2b', stalks: true },
      facts: [
        'Ghost crabs are almost exactly the colour of dry sand, which is how they got their name.',
        'They are the fastest crabs on land, and their tracks look like rows of little commas.',
        'A ghost crab digs a burrow deeper than you are tall and hides in it all day, coming out after dark.',
        'Its eyes sit up on little stalks, so it can see all around while the rest of it stays low.'
      ]
    },
    {
      id: 'sand_hopper', name: 'Sand Hopper',
      habitats: ['beach'], times: ['evening', 'night'], rarity: 1, value: 14,
      behavior: 'hop', speed: 30, shy: 44, size: 0.6,
      measure: 'half an inch long',
      art: { shape: 'sandhopper', body: '#d8c9a8', wing: '#efe4c8', accent: '#9a8a68', eyes: '#2b2b2b' },
      facts: [
        'A sand hopper is not an insect or a flea at all. It is a tiny shrimp-like crustacean.',
        'They hide under damp seaweed all day and come out at night to eat it.',
        'Shorebirds like sanderlings and plovers hunt for them along the tideline, so they are an important beach breakfast.'
      ]
    },
    {
      id: 'kelp_fly', name: 'Kelp Fly',
      habitats: ['beach'], times: ['morning', 'day'], rarity: 1, value: 12,
      behavior: 'dart', speed: 46, shy: 44, size: 0.55,
      measure: 'a quarter of an inch long',
      art: { shape: 'fly', body: '#3a3a34', wing: '#dfe6e8', accent: '#1f1f1c', eyes: '#8a5030' },
      facts: [
        'Kelp flies lay their eggs in the seaweed piled up at the tideline, and their babies grow up eating it.',
        'They help clean the beach by breaking down the old seaweed.',
        'Plovers and sandpipers hunt them in the wrack, so a beach full of kelp flies is a beach full of birds.'
      ]
    },
    {
      id: 'sand_wasp', name: 'Sand Wasp',
      habitats: ['beach'], times: ['morning', 'day'], rarity: 2, value: 44,
      behavior: 'hover', speed: 44, shy: 62, size: 0.95, sting: true,
      measure: 'three quarters of an inch long',
      art: { shape: 'wasp', body: '#f0e2b0', wing: '#e8f0f4', accent: '#3a3a34', eyes: '#4a4238', pattern: 'bands' },
      facts: [
        'A sand wasp digs her own burrow in bare sand. Lots of mothers dig side by side, but each one lives alone.',
        'She catches flies and brings them home to her baby a few at a time, feeding it fresh food as it grows.',
        'The grown-up sand wasp does not eat flies herself. She drinks flower nectar.',
        'She is not aggressive, but she can sting, so it is kindest to watch her from a step away.'
      ]
    },
    {
      id: 'horseshoe_crab', name: 'Horseshoe Crab',
      habitats: ['beach'], times: ['evening', 'night'], rarity: 4, value: 240,
      behavior: 'slow', speed: 12, shy: 30, size: 2.0,
      measure: '1 foot across',
      art: { shape: 'horseshoe', body: '#8a6a44', wing: '#a8875a', accent: '#5a4128', eyes: '#3a2c1c' },
      facts: [
        'A horseshoe crab is not really a crab at all. It is a closer cousin to spiders and scorpions.',
        'Its blood turns blue, and doctors use it to check that medicines are safe.',
        'Horseshoe crabs come ashore to lay their eggs on the very highest tides, at the full moon and the new moon.',
        'If one is upside down on the sand, you can gently turn it over by the edges of its shell. Never by the tail.'
      ]
    },

    /* ---------- the tidepools ---------- */
    {
      id: 'hermit_crab', name: 'Hermit Crab',
      habitats: ['tidepool'], times: ['any'], rarity: 1, value: 22,
      aquatic: true, behavior: 'tide', speed: 13, shy: 40, size: 0.85,
      measure: 'three quarters of an inch across',
      art: { shape: 'hermitcrab', body: '#d2703f', wing: '#e8c9a0', accent: '#8a5a2f', eyes: '#2b2b2b' },
      facts: [
        'A hermit crab does not grow its own shell. It borrows an empty snail shell to protect its soft, curly tail.',
        'When it grows too big it moves into a larger shell, and it never harms a living snail to do it.',
        'Sometimes hermit crabs line up biggest to smallest and all swap shells at once, so everybody gets a new home.'
      ]
    },
    {
      id: 'shore_crab', name: 'Shore Crab',
      habitats: ['tidepool'], times: ['any'], rarity: 1, value: 26,
      aquatic: true, behavior: 'tide', speed: 22, shy: 58, size: 1.05,
      measure: '2 inches across',
      art: { shape: 'crab', body: '#6a3f6a', wing: '#8a5a88', accent: '#3f2440', eyes: '#f2e8d0' },
      facts: [
        'Shore crabs hide under rocks when the tide goes out, so lifting a rock gently is how you find one. Always put the rock back exactly as it was.',
        'A crab cannot stretch its hard shell, so it grows by climbing right out of the old one.',
        'Shore crabs mostly eat green algae they scrape off the rocks, so they are more gardeners than hunters.'
      ]
    },
    {
      id: 'sea_star', name: 'Ochre Sea Star',
      habitats: ['tidepool'], times: ['any'], rarity: 3, value: 110,
      aquatic: true, behavior: 'tide', speed: 4, shy: 0, size: 1.6,
      measure: '8 inches across',
      art: { shape: 'seastar', body: '#e0764a', wing: '#f0a070', accent: '#a84a28' },
      facts: [
        'A sea star is not a fish at all. It is an echinoderm, a cousin of sea urchins and sand dollars.',
        'It has no brain and no blood. It moves on hundreds of tiny water-powered tube feet underneath.',
        'To eat a mussel, a sea star pushes its own stomach out through its mouth and digests the meal right inside the shell.',
        'In a real tidepool we never pry a sea star off its rock, because that tears its little feet. We just look.'
      ]
    },
    {
      id: 'anemone', name: 'Green Anemone',
      habitats: ['tidepool'], times: ['any'], rarity: 2, value: 60,
      aquatic: true, behavior: 'tide', speed: 0, shy: 0, size: 1.4,
      measure: '6 inches across',
      art: { shape: 'anemone', body: '#3f8a5a', wing: '#7fc48a', accent: '#e8f0a0' },
      facts: [
        'An anemone looks like a flower, but it is an animal, and those waving tentacles are how it catches its food.',
        'It is bright green because tiny algae live inside it and share the food they make from sunlight.',
        'It has stinging cells for catching food, but they are far too weak to hurt a person. Touching one just feels sticky.',
        'An anemone eats so slowly that it only needs a meal once or twice a month.'
      ]
    },
    {
      id: 'urchin', name: 'Purple Sea Urchin',
      habitats: ['tidepool'], times: ['any'], rarity: 2, value: 70,
      aquatic: true, behavior: 'tide', speed: 3, shy: 0, size: 1.15,
      measure: '3 inches across',
      art: { shape: 'urchin', body: '#7a4aa8', wing: '#9a6ac8', accent: '#4a2a6a' },
      facts: [
        'Purple urchin spines are not venomous. They are just for protection and for wedging into the rock.',
        'An urchin has five teeth on its underside, and it slowly grinds a little hollow in the rock to sit in.',
        'It passes food up to its mouth with its tube feet, like a bucket brigade.',
        'Baby purple urchins are green. They turn purple as they grow up.'
      ]
    },
    {
      id: 'limpet', name: 'Limpet',
      habitats: ['tidepool'], times: ['any'], rarity: 1, value: 20,
      aquatic: true, behavior: 'tide', speed: 2, shy: 0, size: 0.8,
      measure: '1 inch long',
      art: { shape: 'limpet', body: '#b8a888', wing: '#d8cbae', accent: '#7a6a4a' },
      facts: [
        'A limpet clamps down so hard on its rock that it traps a puddle of seawater inside and stays wet until the tide comes back.',
        'Every limpet has its own home spot worn into the rock, and after grazing it finds its way back to exactly that spot.',
        'It scrapes algae off the rock with a tongue covered in the strongest natural material scientists have ever measured.'
      ]
    },
    {
      id: 'periwinkle', name: 'Periwinkle',
      habitats: ['tidepool'], times: ['any'], rarity: 1, value: 16,
      aquatic: true, behavior: 'tide', speed: 5, shy: 0, size: 0.85,
      measure: 'three quarters of an inch tall',
      art: { shape: 'periwinkle', body: '#7a6a50', wing: '#b8a888', accent: '#463c2c' },
      facts: [
        'A periwinkle carries a little door on its foot and pulls it shut like a trapdoor so it does not dry out.',
        'It eats by scraping green slime off the rocks with a tongue like a tiny file.',
        'Periwinkles move about much more when the water covers them, because sliding along is easier underwater.'
      ]
    },
    {
      id: 'sea_slug', name: 'Sea Slug',
      habitats: ['tidepool'], times: ['any'], rarity: 3, value: 130,
      aquatic: true, behavior: 'tide', speed: 6, shy: 0, size: 1.0,
      measure: '2 inches long',
      art: { shape: 'nudibranch', body: '#ff8a4a', wing: '#ffd0a0', accent: '#ffffff', eyes: '#5a2a10' },
      facts: [
        'A sea slug is a snail that gave up its shell, so its gills and its little fingers are right out in the open.',
        'Some sea slugs eat stinging anemones and then store the stingers in their own fingertips to use for themselves.',
        'Their bright colours are a warning sign that says, quite clearly, do not eat me.'
      ]
    },

    /* ---------- v1.12: the Apple Orchard ---------- */
    {
      id: 'mason_bee', name: 'Blue Orchard Mason Bee',
      habitats: ['orchard', 'garden', 'cherry'], times: ['morning', 'day'], rarity: 2, value: 55,
      behavior: 'hover', speed: 46, shy: 52, size: 0.85, sting: true,
      measure: 'half an inch long',
      art: { shape: 'bee', body: '#2a3a6e', wing: '#dfe9f6', accent: '#1a2242', pattern: 'plain' },
      facts: [
        'A mason bee is shiny blue-black all over, with no stripes at all. She is not a honeybee and she makes no honey.',
        'Just two or three hundred mason bees will pollinate a whole acre of apple trees. Honeybees need two or three entire hives to do the same job.',
        'She carries pollen on her tummy instead of in baskets on her legs, so she dusts every flower she lands on.',
        'She works on cold cloudy days when honeybees stay at home, and she walls each baby into its own little room with a plug of mud.'
      ]
    },
    {
      id: 'yellowjacket', name: 'Western Yellowjacket',
      habitats: ['orchard', 'meadow', 'farmyard'], times: ['morning', 'day', 'evening'], rarity: 1, value: 26,
      behavior: 'dart', speed: 66, shy: 58, size: 0.9, sting: true,
      measure: 'half an inch long',
      art: { shape: 'wasp', body: '#f2cc2a', wing: '#efeadc', accent: '#171410', pattern: 'stripes' },
      facts: [
        'A yellowjacket is a wasp, not a bee. She is smooth and shiny where a bee is furry, and she makes no honey at all.',
        'The whole nest dies every autumn. Only the new queens live through the winter, so every nest you ever find was built from nothing that same year.',
        'She usually nests underground, very often in an old mouse burrow, so the way to stay friends is to walk around any hole with wasps going in and out.',
        'Early in the summer she hunts caterpillars and flies for her grubs. Only late on does she come looking for sweet fallen apples.'
      ]
    },
    {
      id: 'baldfaced_hornet', name: 'Bald-faced Hornet',
      habitats: ['orchard', 'forest'], times: ['morning', 'day'], rarity: 3, value: 95,
      behavior: 'hover', speed: 60, shy: 70, size: 1.1, sting: true,
      measure: 'three quarters of an inch long',
      art: { shape: 'wasp', body: '#22242a', wing: '#e6e6df', accent: '#3a3c44', face: '#f2f0e6', band: '#f2f0e6', tipOnly: true, pattern: 'stripes' },
      facts: [
        'She is not really a hornet. She is a big yellowjacket that lost her yellow, so she is black with an ivory-white face.',
        'Her grey football-shaped nest is real paper. The hornets scrape wood off a fence, chew it into pulp, and spread it out to dry.',
        'Unlike a honeybee she can sting again and again, and she will defend her nest, so a hornet nest is for looking at from a very long way off.',
        'She is a fierce hunter of caterpillars and flies, which makes her genuinely good for an orchard.'
      ]
    },
    {
      id: 'sap_beetle', name: 'Four-spotted Sap Beetle',
      habitats: ['orchard', 'garden'], times: ['day', 'evening'], rarity: 2, value: 24,
      behavior: 'crawl', speed: 26, shy: 34, size: 0.65,
      measure: 'a quarter of an inch',
      art: { shape: 'beetle', body: '#1c1a18', wing: '#242220', accent: '#e08a2c', pattern: 'fourspot', club: true },
      facts: [
        'People call this one the picnic beetle, because it turns up wherever there is sweet fruit going soft.',
        'It finds its food entirely by smell. The scent of a bruised, fermenting apple will bring it in from right across the orchard.',
        'The giveaway is its antennae: each one ends in a tiny knob, like a pin. No other little black beetle in the orchard has that.'
      ]
    },
    {
      id: 'apple_maggot_fly', name: 'Apple Maggot Fly',
      habitats: ['orchard'], times: ['morning', 'day'], rarity: 3, value: 34,
      behavior: 'dart', speed: 58, shy: 50, size: 0.75,
      measure: 'a fifth of an inch',
      art: { shape: 'fly', body: '#1a1a1e', wing: '#eef4f8', accent: '#f4f2ea', wingBands: '#20242a', pattern: 'bands' },
      facts: [
        'Each wing carries four black bands that make the shape of a letter F.',
        'Long ago this fly laid its eggs only in wild hawthorn fruit. In the 1800s some began using apples instead, and those two groups are slowly turning into two different kinds of fly.',
        'It is not from the Pacific Northwest at all. That is why, in real life, there are rules about carrying backyard apples from one county to another.',
        'The mother pushes her egg right under the apple skin, leaving nothing behind but a pinprick and a little dimple.'
      ]
    },
    {
      id: 'snakefly', name: 'Snakefly',
      habitats: ['orchard', 'forest'], times: ['morning', 'day'], rarity: 4, value: 130,
      behavior: 'cling', speed: 24, shy: 58, size: 0.95,
      measure: 'half an inch, with a long neck',
      art: { shape: 'snakefly', body: '#2a2420', neck: '#3a322a', head: '#1e1a16', wing: '#eef3f6', accent: '#c9b98f' },
      facts: [
        'A snakefly rears its little flat head up on a long neck, exactly like a snake about to strike. That is where the name comes from.',
        'Snakeflies live only in the west of North America and nowhere else on the whole continent.',
        'The long needle trailing behind her is not a sting. It is a tool for pushing her eggs deep into a crack in the bark.',
        'Most snakeflies take two or three years to grow up, and they spend that time eating aphids and other little pests in the trees.'
      ]
    },
    {
      id: 'bee_fly', name: 'Greater Bee Fly',
      habitats: ['orchard', 'garden'], times: ['morning', 'day'], rarity: 3, value: 70,
      behavior: 'hover', speed: 50, shy: 56, size: 0.9,
      measure: 'three quarters of an inch across',
      art: { shape: 'beefly', body: '#c8975a', wing: '#f2eee4', accent: '#3a2c1e' },
      facts: [
        'A bee fly looks like a tiny flying teddy bear with a long needle out in front. That needle is a drinking straw, not a sting, and a bee fly cannot sting or bite at all.',
        'It drinks nectar while hovering in front of a flower without ever landing on it.',
        'The mother builds no nest. She hovers over a mining bee’s burrow and flicks her eggs at the hole with the tip of her tummy.',
        'It is one of the very first things flying in spring, when the fruit blossom opens.'
      ]
    },
    {
      id: 'cross_orbweaver', name: 'Cross Orbweaver',
      habitats: ['orchard', 'garden', 'glade', 'farmyard'], times: ['evening', 'night'], rarity: 2, value: 40,
      behavior: 'cling', speed: 20, shy: 50, size: 1.0,
      measure: 'three quarters of an inch across',
      art: { shape: 'spider', body: '#b98a5e', wing: '#6a4c32', accent: '#f4ece0', pattern: 'spots' },
      facts: [
        'She is named for the little cross of white dots on her fat round back.',
        'She is not from here. She arrived from Europe and was first noticed in western Washington in the 1920s.',
        'People say spiders suddenly appear in September. They do not — she has been there all year, quietly growing, and has only just become big enough to notice.',
        'Two cross orbweavers called Arabella and Anita flew on the Skylab space station in 1973 and learned to spin webs with no gravity. Arabella’s web is in a museum.',
        'No orb weaver anywhere is dangerous to people. Walk around her web instead of through it — it took her all night.'
      ]
    },
    {
      id: 'tenlined_beetle', name: 'Ten-lined June Beetle',
      habitats: ['orchard', 'forest'], times: ['night'], rarity: 3, value: 110,
      behavior: 'drift', speed: 34, shy: 44, size: 1.25,
      measure: 'an inch long',
      art: { shape: 'beetle', body: '#5a3a22', wing: '#6b4728', accent: '#f0ead8', fan: '#e08a2c', pattern: 'tenline', antennae: 'fan' },
      facts: [
        'Ten chalk-white stripes run down its brown back, which is exactly how it got its name.',
        'The male has huge orange antennae that open out like a hand of cards. They are not for hearing — they are for smelling, so he can find a female in the dark.',
        'Pick one up and it hisses and squeaks at you. It is frightened, so the kind thing is to put it down gently, away from the light.',
        'Its grubs live underground for years, eating tree roots, which is why every orchardist knows this beetle.'
      ]
    },
    {
      id: 'ground_beetle', name: 'European Ground Beetle',
      habitats: ['orchard', 'garden'], times: ['night'], rarity: 3, value: 78,
      behavior: 'crawl', speed: 42, shy: 52, size: 1.05,
      measure: 'an inch long',
      art: { shape: 'beetle', body: '#1e2028', wing: '#2a2c36', rim: '#6a4a8a', accent: '#101018' },
      facts: [
        'Its black back is edged with a thin rim that shines purple or bronze when the light catches it.',
        'It hunts at night along the ground, and slugs and caterpillars are its favourite supper — which makes it a gardener’s friend.',
        'It came over from Europe a long time ago and now lives right down the west side of North America.'
      ]
    },

    /* ---------- v1.12: the Pebble Hills ---------- */
    {
      id: 'jerusalem_cricket', name: 'Jerusalem Cricket',
      habitats: ['hill', 'desert', 'badlands'], times: ['night'], rarity: 4, value: 140,
      behavior: 'slow', speed: 20, shy: 38, size: 1.35,
      measure: 'up to two inches long',
      art: { shape: 'jerusalem', body: '#e0a054', accent: '#3a2a1c', band: '#f3e2bd' },
      facts: [
        'It has no wings at all, and a big shiny amber head that is wider than the rest of it.',
        'It cannot chirp. Instead it drums its fat tummy against the ground, and the drumming travels through the soil to another Jerusalem cricket.',
        'It spends nearly its whole life underground eating roots, and comes up at night — especially after rain.',
        'It can nip if you pick it up, and it hurts for a little while, but it is not poisonous. The kind thing is to look and not lift.',
        'It is not a cricket, it is not from Jerusalem, and nobody actually knows where the name came from.'
      ]
    },
    {
      id: 'northern_scorpion', name: 'Northern Scorpion',
      habitats: ['hill', 'desert', 'badlands'], times: ['night'], rarity: 4, value: 160,
      behavior: 'crawl', speed: 30, shy: 56, size: 1.15, sting: true,
      measure: 'two inches, tail and all',
      art: { shape: 'scorpion', body: '#c9a468', claw: '#d8b478', tailCol: '#e0c07e', accent: '#7a5a2a' },
      facts: [
        'Washington really does have a scorpion. It lives on dry ground east of the mountains, under flat rocks.',
        'It glows blue-green under ultraviolet light. Scientists all agree that it glows — they still do not agree about why.',
        'Its sting is strong enough to make you say ouch, but it hurts less than a bee sting and it does not last long.',
        'It hides under a rock all day and hunts beetles and grasshoppers at night. Lift the far edge of a rock, have a look, and always put the rock back exactly where it was — that rock is somebody’s house.'
      ]
    },
    {
      id: 'windscorpion', name: 'Windscorpion',
      habitats: ['hill', 'desert', 'badlands'], times: ['night'], rarity: 5, value: 260,
      behavior: 'dart', speed: 92, shy: 78, size: 1.2,
      measure: 'an inch and a half across',
      art: { shape: 'windscorpion', body: '#b5763c', accent: '#e0cfae', jaw: '#7a4a20' },
      facts: [
        'It is neither a spider nor a scorpion. It belongs to a group all of its own.',
        'It has enormous jaws, nearly a third of its whole body — and no poison at all. It cannot hurt you.',
        'It hunts by touch. The two long feelers waving out in front are not legs, and it walks on the eight behind them.',
        'It is one of the fastest runners on the hillside, in quick stop-start dashes. If you meet one, just let it run.'
      ]
    },
    {
      id: 'pinacate_beetle', name: 'Pinacate Beetle',
      habitats: ['hill', 'meadow', 'desert', 'badlands'], times: ['evening', 'night'], rarity: 2, value: 44,
      behavior: 'crawl', speed: 24, shy: 32, size: 1.1,
      measure: 'an inch long',
      art: { shape: 'darkling', body: '#1a1a1e' },
      facts: [
        'When something frightens it, it stands on its head — nose down, bottom in the air — and that is its whole plan.',
        'If the headstand does not work it can squirt a smelly chemical, which is horrid in a fox’s nose and mouth but cannot really hurt anybody. The smell is very hard to wash off, so admire the headstand and leave the beetle alone.',
        'Its wing cases are fused shut, so it can never, ever fly.',
        'One animal has worked out the answer. The grasshopper mouse grabs the beetle, jams its bottom into the dirt so the spray goes into the soil, and eats it head first.'
      ]
    },
    {
      id: 'harvester_ant', name: 'Western Harvester Ant',
      habitats: ['hill', 'desert', 'badlands'], times: ['morning', 'day', 'evening'], rarity: 1, value: 14,
      behavior: 'crawl', speed: 38, shy: 26, size: 0.7, sting: true,
      measure: 'a third of an inch',
      art: { shape: 'ant', body: '#a33a24', wing: '#c25038', accent: '#5e1c10', pattern: 'plain' },
      facts: [
        'You can spot a harvester ant nest from a long way off. They clear a bare circle of gravel around the door and pile a little cone of pebbles on top.',
        'They are farmers. They carry seeds home to store, and the ones they drop along the way help plants spread across the whole hillside.',
        'This is the eastern Washington harvester ant, and it lives from here down through Oregon, Idaho, Montana and Nevada.',
        'They do sting, and they come out together, so the polite thing is to keep off the bare gravel circle — that patch is their doormat.'
      ]
    },
    {
      id: 'velvet_ant', name: 'Velvet Ant',
      habitats: ['hill', 'meadow', 'desert', 'badlands'], times: ['day'], rarity: 3, value: 120,
      behavior: 'dart', speed: 56, shy: 46, size: 0.85, sting: true,
      measure: 'half an inch long',
      art: { shape: 'velvetant', body: '#e2562a', accent: '#171310' },
      facts: [
        'It is not an ant at all. It is a wasp, and the fuzzy scarlet one running about on the ground is the female, who simply has no wings.',
        'Pick one up and she squeaks out loud, rubbing parts of her tummy together to warn you off.',
        'Her bright orange coat is not camouflage. It is a sign, and the sign says do not touch me. Her sting really hurts, so this one is for watching only.',
        'People call her a cow killer, which is only a story. She has never killed a cow.'
      ]
    },
    {
      id: 'robber_fly', name: 'Robber Fly',
      habitats: ['hill', 'meadow', 'desert', 'badlands'], times: ['day'], rarity: 2, value: 52,
      behavior: 'dart', speed: 74, shy: 62, size: 1.0,
      measure: 'an inch long',
      art: { shape: 'robberfly', body: '#7a6a52', wing: '#eceadf', accent: '#3a3226', eyes: '#6a3a2a', beard: '#e8dcc0', tailTip: '#d8cdb4' },
      facts: [
        'A robber fly sits perfectly still on a warm stone, and then launches out and catches another insect in mid-air.',
        'It will take on bees, wasps and grasshoppers bigger than itself, and carry them back to its perch.',
        'The bristly beard over its face is a shield, so a struggling meal cannot damage those enormous eyes.',
        'If one lands on you, brush it off gently rather than slapping it — trapped in a hand it can give you a jab.'
      ]
    },
    {
      id: 'blister_beetle', name: 'Black Blister Beetle',
      habitats: ['hill', 'meadow', 'desert', 'badlands'], times: ['day'], rarity: 3, value: 66,
      behavior: 'slow', speed: 22, shy: 36, size: 0.85,
      measure: 'half an inch long',
      art: { shape: 'beetle', body: '#171820', wing: '#23242e', accent: '#0d0e14', slim: true },
      facts: [
        'This one is eyes only. It does not bite and it does not sting, but it makes a chemical that can raise a blister on your skin if you handle it.',
        'It is long and narrow and soft, with a little head on a thin neck, so it looks quite different from a hard shiny beetle.',
        'Its grubs hunt down grasshopper eggs under the ground and eat them, so it is a nuisance grown up and a helper as a baby.',
        'Farmers watch out for them at haymaking, because a blister beetle caught in the hay can make a horse very ill.'
      ]
    },
    {
      id: 'sweat_bee', name: 'Green Sweat Bee',
      habitats: ['hill', 'meadow', 'garden', 'cherry'], times: ['morning', 'day'], rarity: 2, value: 48,
      behavior: 'hover', speed: 50, shy: 50, size: 0.7, sting: true,
      measure: 'a third of an inch',
      art: { shape: 'bee', body: '#e8cc3e', wing: '#eef4f6', accent: '#1d1a14', head: '#1f9a5a', thorax: '#1f9a5a', pattern: 'stripes' },
      facts: [
        'Her head and back are brilliant metallic green, like enamel paint.',
        'She digs a deep tunnel straight down into bare sun-baked soil, which is why thin, stony hillsides are full of them.',
        'In some kinds, a dozen or more females share one front door but each digs her own private rooms off the main shaft.',
        'Despite the name, this green sort is not interested in your sweat at all. That is a different, much duller group of bees.'
      ]
    },
    {
      id: 'behrs_hairstreak', name: 'Behr’s Hairstreak',
      habitats: ['hill', 'desert'], times: ['morning', 'day'], rarity: 4, value: 150,
      behavior: 'flutter', speed: 48, shy: 66, size: 0.8,
      measure: 'an inch across',
      art: { shape: 'butterfly', body: '#4a3a28', wing: '#e08a2c', wing2: '#c9b89a', accent: '#4a3520', pattern: 'edge' },
      facts: [
        'It is a hairstreak with no hairstreak tails, which is the quickest way to know it.',
        'Its caterpillars eat only bitterbrush and mountain mahogany, the grey shrubs of the dry hills. No bitterbrush, no butterfly — so never pull those bushes up.',
        'It flies for just a few weeks in June and July, once a year, and the males sit on top of a shrub and wait for a female to pass by.'
      ]
    },
    {
      /* The one creature in the whole garden that is never caught.
         `lookOnly` means the net refuses her, meeting her is what opens her
         Bug Book page, and her `danger` line is shown every time. */
      id: 'black_widow', name: 'Western Black Widow',
      habitats: ['hill', 'desert'], times: ['evening', 'night'], rarity: 4, value: 0,
      behavior: 'cling', speed: 14, shy: 30, size: 1.0,
      lookOnly: true,
      measure: 'her body is about half an inch',
      danger: 'Never put your hand anywhere you cannot see \u2014 not under a rock, not into a woodpile, not into a dark corner. Lift the far edge of a rock, have a look, and put it back exactly how it was.',
      art: { shape: 'widow', body: '#141419', mark: '#d8322a', web: 'rgba(240,244,248,0.42)' },
      facts: [
        'This is the one creature in the garden you never catch. You look at her, you leave her alone, and you both go on with your day.',
        'She hangs upside down in her web, which is why the red hourglass on her tummy is the part you can see.',
        'Her web is not a neat round one. It is a messy tangle close to the ground, in a woodpile or under a rock or in the gap behind a plant pot.',
        'She is common in eastern Washington, and she really would rather you went away. Widow spiders almost never bite unless they are squashed inside their own web.',
        'The little brown one a quarter of her size is the male, and he cannot bite people at all.',
        'Washington has no brown recluse spiders. Not one. That is a story people tell each other.'
      ]
    },

    /* =================================================================
       CLOUDTOP RIDGE - subalpine and alpine.
       Everything up here is solving the same problem in a different way:
       how to stay alive somewhere that is frozen most of the year.
       ================================================================= */
    {
      /* Look-only for a reason no other creature in the game has: a warm
         hand is what kills it. */
      id: 'ice_worm', name: 'Glacier Ice Worm',
      habitats: ['mountain'], times: ['evening', 'night'], rarity: 5, value: 0,
      behavior: 'slow', speed: 5, shy: 18, size: 0.8,
      lookOnly: true,
      measure: 'an inch long and thinner than a hair',
      danger: 'Do not pick this one up. It is not dangerous — you are. It dies at about the temperature of a cool room, and your hand is far hotter than that. Look at it on the snow and leave it there.',
      art: { shape: 'worm', body: '#2a211c', body2: '#4a382c', rings: '#14100d' },
      facts: [
        'It is the only worm in the world that lives its whole life inside a glacier.',
        'It does not dig through the ice. It squeezes between the ice grains, like sliding between packed snowballs.',
        'Every evening they climb up to the top of the glacier to eat, and go back down before the sun reaches them. There can be two and a half thousand of them in one square metre.',
        'They eat the pink snow — that watermelon colour on an old snowfield is a living alga, and this is what eats it.',
        'Nobody knows where they go in winter. One of the scientists who studies them says there are more mysteries about ice worms than there are answers.'
      ]
    },
    {
      id: 'ice_crawler', name: 'Ice Crawler',
      habitats: ['mountain', 'cave'], times: ['night'], rarity: 5, value: 0,
      behavior: 'crawl', speed: 13, shy: 40, size: 0.95,
      lookOnly: true,
      measure: 'about an inch',
      danger: 'Your hand is too hot for it. A person is about 32 degrees Celsius and this animal dies above about 27. Look, and let it walk away.',
      art: { shape: 'icecrawler', body: '#d9c9a8', seg: '#b09b74', legs: '#c7b593', eye: '#3b332a' },
      facts: [
        'It lives in a tiny window of temperature. It can walk about below freezing, and it dies if it gets warm.',
        'At night it comes out onto the snow to pick up moths and flies that the wind blew there and left too cold to move.',
        'It has no wings at all, very long feelers at the front and two long feelers at the back, so it looks the same at both ends.',
        'It was only found by scientists in 1914, and there are still only about thirty-five kinds known in the whole world. One lives at nine thousand feet on Mount Rainier.',
        'It lives on top of the mountain and under it. A lava tube is a cold place with no summer in it, and ice crawlers are the biggest hunters in the dark part of a cave.'
      ]
    },
    {
      id: 'snow_fly', name: 'Snow Fly',
      habitats: ['mountain', 'taiga'], times: ['morning', 'day', 'evening'], rarity: 4, value: 130,
      behavior: 'crawl', speed: 20, shy: 44, size: 0.85,
      measure: 'about the size of a blueberry, legs and all',
      art: { shape: 'cranefly', body: '#8a5f3c', legs: '#6b4a2e', wingless: true, halteres: '#c2a07a' },
      facts: [
        'It is a crane fly that gave up flying so it could walk about on snow. It has no wings at all.',
        'Scientists have watched them running about at twelve degrees below freezing.',
        'If one of its legs starts to freeze, the fly drops the leg off on purpose — in about half a second — to stop the ice spreading into the rest of it. No other animal has ever been caught doing that because of cold.',
        'They were found by a scientist out for a run in the Cascades in October.'
      ]
    },
    {
      id: 'snow_scorpionfly', name: 'Snow Scorpionfly',
      habitats: ['mountain', 'taiga'], times: ['morning', 'day'], rarity: 4, value: 120,
      behavior: 'hop', speed: 26, shy: 48, size: 0.7,
      measure: 'a quarter of an inch',
      art: { shape: 'boreus', body: '#3a2a22', sheen: '#7a4a2c', legs: '#241c17', bristle: '#1a1512' },
      facts: [
        'It has no sting and there is no scorpion in it anywhere. The name comes from the tail shape of its warm-weather cousins.',
        'The two stiff spines on the male’s back are not wings and cannot fly. They are hooks for holding on to a female.',
        'It eats moss, as a grub and as a grown-up, and hops across open snow to get from one moss patch to the next.',
        'They have been counted at the Hanford Reach, which is just down the road from Richland.'
      ]
    },
    {
      id: 'vidlers_alpine', name: 'Vidler’s Alpine',
      habitats: ['mountain'], times: ['day'], rarity: 3, value: 95,
      behavior: 'flutter', speed: 34, shy: 58, size: 1.05,
      measure: 'nearly 2 inches across',
      art: { shape: 'butterfly', body: '#3a2c24', wing: '#2c211c', wing2: '#33261f', accent: '#d2762e', pattern: 'eyeband' },
      facts: [
        'It lives nowhere else in the world except the high mountains from British Columbia down to the Olympics and the north Cascades.',
        'It flies for a few weeks in July and August — the only weeks the meadow is out from under the snow.',
        'Park rangers count them every summer to see how the mountains are changing.'
      ]
    },
    {
      id: 'clodius_parnassian', name: 'Clodius Parnassian',
      habitats: ['mountain', 'forest'], times: ['day'], rarity: 3, value: 110,
      behavior: 'drift', speed: 26, shy: 50, size: 1.2,
      measure: 'about 2½ inches across',
      art: { shape: 'butterfly', body: '#8e8a82', wing: '#f4f2ec', wing2: '#eceae2', accent: '#c8302c', pattern: 'redspots' },
      facts: [
        'It looks like a paper butterfly with two drops of blood on it. The wings are so thin you can nearly see through them.',
        'Its caterpillar eats only bleeding-heart plants, so you only find the butterfly where bleeding hearts grow.',
        'It belongs to the apollo butterflies, which live in mountains right around the top half of the world.'
      ]
    },
    {
      id: 'snow_flea', name: 'Snow Flea',
      habitats: ['mountain', 'taiga', 'tundra'], times: ['morning', 'day'], rarity: 2, value: 26,
      behavior: 'hop', speed: 30, shy: 34, size: 0.55,
      measure: 'smaller than this full stop',
      art: { shape: 'springtail', body: '#232b4a', body2: '#3a4570', legs: '#1a2036', furcula: true },
      facts: [
        'It is not a flea and it does not bite. It is a springtail, and it jumps by snapping a folded tail-spring against the ground.',
        'It makes its own antifreeze. The protein sticks to baby ice crystals and stops them growing, and people are studying it for keeping transplant organs cold — and for ice cream.',
        'They turn up in hundreds at once, like pepper scattered in your footprints.',
        'It is not quite an insect. Springtails are their own branch of six-legged animals.'
      ]
    },
    {
      id: 'thatching_ant', name: 'Western Thatching Ant',
      habitats: ['mountain', 'taiga', 'desert', 'glade'], times: ['morning', 'day', 'evening'], rarity: 1, value: 16,
      behavior: 'crawl', speed: 36, shy: 26, size: 0.8,
      sting: true,
      measure: 'up to a third of an inch',
      art: { shape: 'ant', body: '#241f1d', head: '#a8482a', legs: '#2c2523', bicolour: true },
      facts: [
        'It builds a haystack out of grass stems and pine needles, up to a foot and a half high, with the nest going four feet down underneath it.',
        'One nest can hold forty thousand ants. A supercolony found in Oregon had two hundred and ten connected nests and fifty-six million ants.',
        'It has no sting. It bites, then curls its tail forward and sprays acid into the bite — nearly three-quarters of the spray is formic acid.',
        'If a plant shades the mound, the ants spray it until it dies.',
        'Never sit or kneel on the mound. The acid does not really hurt your skin, but it stings badly in your eyes.'
      ]
    },
    {
      id: 'water_bear', name: 'Water Bear',
      habitats: ['mountain', 'taiga', 'tundra', 'rainforest'], times: ['any'], rarity: 5, value: 300,
      behavior: 'slow', speed: 6, shy: 20, size: 0.7,
      measure: 'under a millimetre — you need a lens',
      art: { shape: 'tardigrade', body: '#d8c48f', body2: '#b9cc9a', claw: '#8f7a4e', eye: '#2a241c' },
      facts: [
        'You find it by squeezing a cushion of wet moss and looking at the drop through a lens. It is far too small to see on its own.',
        'When its moss dries out it pulls its legs in, curls into a barrel, and switches itself almost off until the water comes back.',
        'Dried water bears have been put outside a spacecraft for ten days in the vacuum of space, and came back to Earth alive and had babies.',
        'They are not indestructible, though. Even a dried one is killed by an hour in an oven at eighty degrees. They survive extremes; they do not live in them.',
        'It has eight stubby legs and each one ends in a little handful of claws.'
      ]
    },

    /* =================================================================
       THE SPRUCE TAIGA - boreal forest, bog and burned ground.
       Half of these live inside dead wood, and the other half eat the
       ones that do.
       ================================================================= */
    {
      id: 'pine_beetle', name: 'Mountain Pine Beetle',
      habitats: ['taiga', 'mountain'], times: ['day', 'evening'], rarity: 3, value: 60,
      behavior: 'crawl', speed: 22, shy: 36, size: 0.55,
      measure: 'the size of a grain of rice',
      art: { shape: 'beetle', body: '#2e1d14', shell: '#3a2519', shell2: '#241610', legs: '#1a100b', slim: true, club: true },
      facts: [
        'The female chews a straight tunnel up the inside of the bark, usually about ten inches long, and lays her eggs along both sides of it.',
        'When a pine is attacked it fights back by pushing out sticky resin. That makes a blob on the bark called a pitch tube, and a big pale blob usually means the tree won.',
        'It carries a fungus on its body. The fungus stains the wood blue and blocks the tree’s plumbing, so it is really beetle and fungus together that kill a tree.',
        'Woodpeckers hunt them by hammering the bark off.'
      ]
    },
    {
      id: 'whitespotted_sawyer', name: 'Whitespotted Sawyer',
      habitats: ['taiga'], times: ['day', 'evening'], rarity: 2, value: 55,
      behavior: 'crawl', speed: 20, shy: 40, size: 1.05,
      measure: 'up to an inch, with much longer feelers',
      art: { shape: 'longhorn', body: '#191616', shell: '#221e1e', fleck: '#e6e2da', legs: '#12100f', antenna: '#1a1717', scutellum: true, spine: true, longAntennae: 2.0 },
      facts: [
        'The male’s feelers are up to twice as long as the rest of him. The female’s are only a little longer than her body — that is how you tell them apart.',
        'It moves into a forest after a fire and lays its eggs in trees that are already dead or dying. It does not attack healthy trees.',
        'The female makes a loud scraping noise gnawing her egg pits into the bark — loud enough that things that want to eat her can find her by it.',
        'The white dot right where the wing covers meet is how you know it from the other long-horned beetles.'
      ]
    },
    {
      id: 'white_horntail', name: 'White-horned Horntail',
      habitats: ['taiga'], times: ['day'], rarity: 4, value: 140,
      behavior: 'hover', speed: 30, shy: 46, size: 1.15,
      measure: 'an inch or more, plus her needle',
      art: { shape: 'horntail', body: '#161414', band: '#f0c22a', wing: 'rgba(214,180,120,0.55)', antenna: '#f2efe6', legs: '#1f1c1a', ovipositor: '#4a3f33' },
      facts: [
        'The long needle trailing behind her is not a sting. It is a drill for putting eggs into wood, and she cannot sting with it at all.',
        'When she drills, she squirts a fungus in along with the egg. The fungus softens the wood, and the grub eats the softened wood.',
        'The grub can take five years to grow up in cold country, which is why a horntail sometimes chews its way out of the wood of a brand new house.',
        'It looks terrifying and it is completely harmless. Those white feelers are where it gets its name.'
      ]
    },
    {
      id: 'seed_bug', name: 'Western Conifer Seed Bug',
      habitats: ['taiga', 'mountain'], times: ['day', 'evening'], rarity: 2, value: 40,
      behavior: 'crawl', speed: 19, shy: 34, size: 0.95,
      measure: 'about three quarters of an inch',
      art: { shape: 'leaffoot', body: '#6e4a2f', body2: '#3a2a1c', zig: '#efe6d2', legs: '#3f2f22', flag: '#4a3625', flagBar: '#d8c9ac' },
      facts: [
        'Its back legs each carry a flat leaf-shaped flag. Nobody is certain what they are for.',
        'It drinks the insides of pine seeds straight through the closed cone, using a beak like a drinking straw.',
        'It does not bite, it does not sting and it carries no disease — but if you frighten it, it lets off a strong smell that hangs about.',
        'People often mistake it for something dangerous. It is not.'
      ]
    },
    {
      id: 'pine_white', name: 'Pine White',
      habitats: ['taiga', 'mountain'], times: ['day'], rarity: 3, value: 70,
      behavior: 'drift', speed: 22, shy: 44, size: 1.1,
      measure: 'about 2 inches across',
      art: { shape: 'butterfly', body: '#35322c', wing: '#fbfbf7', wing2: '#f4f4ee', accent: '#1d1b18', pattern: 'blackbar' },
      facts: [
        'It is a butterfly that lives up in the conifers, and its caterpillars eat pine and fir needles. Almost no other butterfly does that.',
        'The female lays her eggs stuck in a neat row along a single needle.',
        'It drifts down out of the treetops so slowly that from underneath a whole hillside of them looks like it is snowing in August.'
      ]
    },
    {
      id: 'jutta_arctic', name: 'Jutta Arctic',
      habitats: ['taiga', 'tundra'], times: ['day'], rarity: 4, value: 120,
      behavior: 'flutter', speed: 36, shy: 62, size: 1.15,
      measure: 'about 2 inches across',
      art: { shape: 'butterfly', body: '#5a4b3c', wing: '#6b5a48', wing2: '#7a6b58', accent: '#d8a63c', pattern: 'eyeband' },
      facts: [
        'It takes two years to grow up. A tiny caterpillar sleeps through the first winter and a big one sleeps through the second.',
        'The males sit on logs and tree trunks rather than on flowers, and wait for a female to go past.',
        'Sitting head-down on a spruce trunk it almost vanishes — the underneath of its wings is mottled like bark.',
        'It lives all the way round the top of the world, in spruce bogs and wet tundra, and its caterpillars eat sedges and cotton grass.'
      ]
    },
    {
      id: 'four_spot_skimmer', name: 'Four-spotted Skimmer',
      habitats: ['taiga', 'tundra', 'pond'], times: ['morning', 'day'], rarity: 2, value: 50,
      behavior: 'dart', speed: 78, shy: 70, size: 1.3,
      measure: 'about 1¾ inches long',
      art: { shape: 'dragonfly', body: '#8a6a3c', body2: '#3a2c1c', wing: 'rgba(230,240,246,0.5)', accent: '#2a2018', wingSpots: true, amberBase: '#c9a05c', eye: '#4a3a22' },
      facts: [
        'It is the state insect of Alaska. Schoolchildren picked it.',
        'Each of its four wings has a dark spot right in the middle of the front edge. That is where the name comes from and it is the way to know it.',
        'It spends two years underwater as a larva before it ever flies.',
        'It hunts by sitting on a twig, tipping its head back to watch the sky, and shooting out at whatever goes over.'
      ]
    },
    {
      id: 'hudsonian_whiteface', name: 'Hudsonian Whiteface',
      habitats: ['taiga', 'pond'], times: ['morning', 'day'], rarity: 3, value: 66,
      behavior: 'dart', speed: 74, shy: 68, size: 1.05,
      measure: 'a little over an inch long',
      art: { shape: 'dragonfly', body: '#1e1c1a', body2: '#141312', wing: 'rgba(232,240,246,0.46)', accent: '#c8331f', dorsalSpots: '#c8331f', whiteface: '#f0ece0', eye: '#2c2a26' },
      facts: [
        'Its whole family is named for that chalk-white face. You can see it from right across a bog pond.',
        'The males have red spots down their back and the females have yellow ones, so you can tell them apart from a distance.',
        'In the warm south of where it lives it retreats up into mountain bogs, where the water stays cold.'
      ]
    },

    /* =================================================================
       THE LICHEN TUNDRA - past the last tree.
       Summer here is a few weeks long, and everything is built around
       that.
       ================================================================= */
    {
      id: 'arctic_woolly_bear', name: 'Arctic Woolly Bear',
      habitats: ['tundra'], times: ['day'], rarity: 5, value: 260,
      behavior: 'slow', speed: 9, shy: 28, size: 1.1,
      measure: 'about an inch and a half',
      danger: 'Look at hairy caterpillars, do not stroke them. Some of them have hairs that make skin itch, and it is not worth finding out which.',
      art: { shape: 'caterpillar', body: '#8a5f2c', body2: '#b5813f', fur: '#d9ab6a', legs: '#5a3d1e', woolly: true, tuft: '#7a4f24' },
      facts: [
        'It spends up to seven years as a caterpillar, because each summer up here is only a few weeks long. The moth it turns into lives a few weeks and that is all.',
        'It spends about six tenths of its life sunbathing. It turns to face the sun, and that can make it twenty degrees warmer than the ground it is sitting on.',
        'It really only eats in June, on the new buds of the Arctic willow, because that is when the leaves have the most goodness in them.',
        'More than half of them are killed by a fly that lays its eggs inside them.'
      ]
    },
    {
      id: 'arctic_wolf_spider', name: 'Arctic Wolf Spider',
      habitats: ['tundra'], times: ['morning', 'day'], rarity: 2, value: 44,
      behavior: 'dart', speed: 52, shy: 56, size: 0.95,
      measure: 'her body is about a third of an inch',
      danger: 'Use the net, not your fingers. A wolf spider can nip if you squeeze it. It is not dangerous, but nothing likes being squeezed.',
      art: { shape: 'wolfspider', body: '#6d5c48', body2: '#57482f', stripe: '#b8a684', legs: '#4c3f2c', eye: '#14110d', eggsac: '#e6dfcb' },
      facts: [
        'She carries her eggs in a silk ball stuck to her back end everywhere she goes, and when they hatch the babies ride around on her back.',
        'She is one of the top hunters of the tundra, and what she mostly hunts is springtails — the same little jumping specks that live on the snow.',
        'Wolf spiders build no web at all. They run their dinner down on foot.',
        'Arctic springs come earlier than they used to, and these spiders have started laying a second batch of eggs in one summer, which nobody had ever seen them do. It took twenty years of counting in Greenland to notice.'
      ]
    },
    {
      id: 'arctic_mosquito', name: 'Arctic Mosquito',
      habitats: ['tundra'], times: ['morning', 'day', 'evening'], rarity: 1, value: 14,
      behavior: 'hover', speed: 40, shy: 30, size: 0.75,
      measure: 'a quarter of an inch',
      art: { shape: 'mosquito', body: '#2e2a26', body2: '#4a4239', wing: 'rgba(226,232,238,0.42)', legs: '#241f1c', beak: '#1a1613' },
      facts: [
        'It is probably the most numerous mosquito in the whole Arctic.',
        'Its babies grow in the shallow ponds left by melting snow, and how fast they grow depends on exactly when the pond thaws.',
        'Underwater its worst enemy is the diving beetle. In warm years the babies grow up faster and get away.',
        'Only the females bite, and up here they mostly bite caribou. Nothing on the tundra would work without them — half the birds are there to eat them.'
      ]
    },
    {
      id: 'polar_bumblebee', name: 'Polar Bumble Bee',
      habitats: ['tundra'], times: ['morning', 'day'], rarity: 3, value: 90,
      behavior: 'hover', speed: 40, shy: 44, size: 1.2,
      sting: true,
      measure: 'about three quarters of an inch, and very furry',
      art: { shape: 'bee', body: '#1c1a18', stripe: '#e08a1e', wing: 'rgba(240,246,250,0.55)', legs: '#141210', shaggy: true },
      facts: [
        'It warms itself up by shivering its flight muscles, and can get its chest thirty degrees hotter than the air around it.',
        'It uses flowers as sun-chairs. Arctic poppies turn to follow the sun and cup the warmth, and the bee sits inside to heat up.',
        'It is much hairier than the bumble bees at home — the fur is thick enough to blur its outline.',
        'There is a second bumble bee up there, the cuckoo bumble bee, which has no workers of its own and takes over this one’s nest instead.'
      ]
    },
    {
      id: 'arctic_fritillary', name: 'Arctic Fritillary',
      habitats: ['tundra', 'taiga', 'mountain'], times: ['day'], rarity: 2, value: 48,
      behavior: 'flutter', speed: 42, shy: 56, size: 0.9,
      measure: 'about 1¼ inches across',
      art: { shape: 'butterfly', body: '#6b4a2c', wing: '#d6802f', wing2: '#e09447', accent: '#2a1f16', pattern: 'checker' },
      facts: [
        'Where it is really cold it takes two years to grow up — one winter asleep as a newly hatched caterpillar, and the next asleep as a big one.',
        'Its caterpillars eat violets and dwarf willows, which on the tundra grow flat along the ground instead of standing up.',
        'The same butterfly flies in Alaska, right across Canada, down the Rockies, and around the top of Europe and Asia.'
      ]
    },
    {
      id: 'warble_fly', name: 'Reindeer Warble Fly',
      habitats: ['tundra'], times: ['day'], rarity: 4, value: 130,
      behavior: 'dart', speed: 72, shy: 64, size: 1.0,
      measure: 'about half an inch',
      art: { shape: 'beefly', body: '#2a2622', fur: '#efe4c8', tip: '#e0921e', wing: 'rgba(226,230,236,0.5)', legs: '#1e1b18', eye: '#3a3028' },
      facts: [
        'It is a fly dressed up as a bumble bee, and it cannot sting or bite you at all. It has no working mouth.',
        'Caribou are terrified of it. A whole herd will stampede away from the sound of one.',
        'Its grubs spend the winter under a caribou’s skin, breathing through a little hole, and drop out onto the tundra in spring.',
        'Look for two wings rather than four, and big fly eyes. That is how you know it is not a bee.'
      ]
    },
    {
      id: 'arctic_springtail', name: 'Arctic Springtail',
      habitats: ['tundra'], times: ['any'], rarity: 4, value: 110,
      behavior: 'crawl', speed: 12, shy: 26, size: 0.5,
      measure: 'about a millimetre',
      art: { shape: 'springtail', body: '#efe6d4', body2: '#d8cbb0', legs: '#b5a88c', furcula: false },
      facts: [
        'When the ground freezes it does not make antifreeze and it does not let itself freeze. It dries itself out on purpose, so there is nothing left inside to turn to ice.',
        'It gets so dry that what liquid is left inside is many times saltier than the sea, and it survives that too.',
        'Scientists later found it makes an antifreeze protein as well, as a backup, which nobody expected.',
        'Unlike the snow flea it has no tail-spring, so it cannot jump. It walks.'
      ]
    },

    /* =================================================================
       THE SAGEBRUSH DESERT - the dry side of the mountains.
       A cold desert: hot days, cold nights, and about eight inches of
       rain a year.
       ================================================================= */
    {
      id: 'hera_buckmoth', name: 'Hera Buckmoth',
      habitats: ['desert'], times: ['day'], rarity: 3, value: 100,
      behavior: 'flutter', speed: 52, shy: 72, size: 1.35,
      measure: 'up to 3½ inches across',
      danger: 'The moth is harmless — it has no mouth and no sting. Its caterpillar is the one to leave alone: the spines are hollow, they are full of venom, and they raise burning welts.',
      art: { shape: 'moth', body: '#e0b428', wing: '#fbfbf7', wing2: '#f2f2ec', accent: '#1a1815', pattern: 'buckmoth', bands: '#1a1815' },
      facts: [
        'It is a moth that flies in broad daylight — big white wings crossing the sagebrush in August sunshine.',
        'Its caterpillars eat nothing but sagebrush.',
        'The grown moth has no working mouth and never eats at all. It lives on what it stored up as a caterpillar, and then it is done.'
      ]
    },
    {
      id: 'mormon_cricket', name: 'Mormon Cricket',
      habitats: ['desert', 'badlands'], times: ['morning', 'day'], rarity: 3, value: 80,
      behavior: 'crawl', speed: 30, shy: 52, size: 1.45,
      measure: 'up to 2 inches, plus the female’s spike',
      art: { shape: 'mormoncricket', body: '#3a2a3c', body2: '#241a26', shield: '#1c1520', legs: '#2c2028', antenna: '#241a26', ovi: '#5a4432' },
      facts: [
        'It is not a cricket. It is a shieldbacked katydid, and it cannot fly — its wings are far too short.',
        'They march. A band of them walks half a mile to a mile a day, and twenty-five to fifty miles in one summer.',
        'Scientists worked out that the bands keep moving partly to look for protein and salt, and partly so the ones behind do not eat them.',
        'The long sword on the female is not a stinger. It is the tool she pushes her eggs into the soil with.',
        'When there are just a few about they are green or purple. When there are millions they turn black or brown or red.'
      ]
    },
    {
      id: 'mormon_metalmark', name: 'Mormon Metalmark',
      habitats: ['desert'], times: ['day'], rarity: 4, value: 150,
      behavior: 'dart', speed: 48, shy: 64, size: 0.75,
      measure: 'about an inch across',
      art: { shape: 'butterfly', body: '#3a2a22', wing: '#7a4430', wing2: '#8a5038', accent: '#f4f0e6', pattern: 'checker' },
      facts: [
        'It flies late — August to October in eastern Washington — timed for when the snow buckwheat and the rabbitbrush are in flower.',
        'Its caterpillars eat only wild buckwheat. It lays lavender-coloured eggs on the buckwheat stems, and they wait there all winter.',
        'The males sit in little hollows on a hillside and watch for females going past.',
        'It sits with its wings flat open, chequered white and black like a tiny chessboard.'
      ]
    },
    {
      id: 'sagebrush_checkerspot', name: 'Sagebrush Checkerspot',
      habitats: ['desert'], times: ['day'], rarity: 2, value: 46,
      behavior: 'flutter', speed: 38, shy: 52, size: 1.0,
      measure: 'about 1½ inches across',
      art: { shape: 'butterfly', body: '#3a2e22', wing: '#e08a2c', wing2: '#f0a648', accent: '#2c221a', pattern: 'checker' },
      facts: [
        'In eastern Washington it flies in spring, and the males come out about a week before the females.',
        'The males are orange and the females are black, so the two look like different butterflies altogether.',
        'Its caterpillars here eat green rabbitbrush and the linear-leaved daisy.',
        'The pattern of pale and dark squares is where checkerspots get their name. It looks like a little stained-glass window.'
      ]
    },
    {
      id: 'pallid_grasshopper', name: 'Pallid-winged Grasshopper',
      habitats: ['desert', 'badlands'], times: ['day'], rarity: 2, value: 34,
      behavior: 'hop', speed: 44, shy: 50, size: 1.1,
      measure: 'about 1¼ inches',
      art: { shape: 'grasshopper', body: '#b5a184', body2: '#8a785e', legs: '#9c8a6e', accent: '#4a4034', mottle: true, crossBars: '#5a4c3a' },
      facts: [
        'When the males fly they crackle, snapping their back wings. It is called crepitation and it seems to be how courting starts.',
        'Its home is the bare ground between the shrubs, and its mottled tan is camouflage for exactly that.',
        'Open its back wings and there is a surprise underneath: a pale disc with one bold black band across it.',
        'It is the most widely spread band-winged grasshopper in the New World, from south-west Canada all the way to Argentina.',
        'If you grab one it may spit a little brown juice at you. It is harmless.'
      ]
    },
    {
      id: 'ground_mantis', name: 'Agile Ground Mantis',
      habitats: ['desert', 'badlands'], times: ['day'], rarity: 5, value: 240,
      behavior: 'dart', speed: 50, shy: 66, size: 0.85,
      measure: 'about an inch and a bit',
      art: { shape: 'mantis', body: '#6e6152', body2: '#574c40', legs: '#4c4238', eye: '#2a241e', wing: '#7a6d5c' },
      facts: [
        'It does not sit and wait like other mantises. It chases — running across bare ground after its dinner in the sun.',
        'It cannot fly at all, male or female.',
        'It is tiny for a mantis, about an inch, and the exact colour of dry dirt.',
        'If you corner one it rears up and spreads its front legs at you. That is entirely bluff.'
      ]
    },
    {
      id: 'wolf_spider', name: 'Wolf Spider',
      habitats: ['desert', 'glade', 'badlands'], times: ['evening', 'night'], rarity: 2, value: 42,
      behavior: 'crawl', speed: 40, shy: 50, size: 1.15,
      measure: 'her body up to nearly an inch',
      art: { shape: 'wolfspider', body: '#7a6a52', body2: '#5a4c38', stripe: '#c2b294', legs: '#57492f', eye: '#12100c', heart: '#3a3022' },
      facts: [
        'She carries her egg sac stuck to her back end, and when the babies hatch dozens of them ride about on her back.',
        'Wolf spiders build no web. They hunt on foot.',
        'Shine a torch along the ground at night and their eyes shine back at you like little green sparks.',
        'Big and fast and hairy is not the same as dangerous. Utah State University’s spider people put it plainly: no known health hazard to humans.'
      ]
    },
    {
      id: 'rain_beetle', name: 'Rain Beetle',
      habitats: ['desert', 'orchard'], times: ['morning', 'night'], rarity: 5, value: 280,
      behavior: 'drift', speed: 24, shy: 46, size: 1.2,
      rainLover: true,
      measure: 'up to an inch, and very fat',
      art: { shape: 'rainbeetle', body: '#5a2e1c', shell: '#6e3a22', shell2: '#44210f', fur: '#c2a077', legs: '#3a1c0f', fan: '#3a1c0f' },
      facts: [
        'The males only fly after the first autumn rains, early in the morning. For some of them that may be a single day in the whole year.',
        'The females never fly at all. They stay in their burrows and call the males in by smell.',
        'The grubs live underground eating roots for nine to thirteen years before they turn into beetles.',
        'And then the grown-up beetle cannot eat anything. Its mouth does not open. It flies, it finds a mate, and that is its whole life above ground.'
      ]
    },

    /* =================================================================
       THE MOSSY RAINFOREST - the wet side.
       Not a jungle: few kinds, enormous individuals, deep shade, and a
       floor made of moss.
       ================================================================= */
    {
      id: 'banana_slug', name: 'Pacific Banana Slug',
      habitats: ['rainforest'], times: ['any'], rarity: 1, value: 20,
      behavior: 'slow', speed: 7, shy: 22, size: 1.5,
      rainLover: true,
      measure: 'up to 10 inches long',
      danger: 'Hands, not mouth — and then wash your hands. Never put a slug or a snail near your face. Licking a banana slug really does numb your tongue, and that is exactly why you do not.',
      art: { shape: 'slug', body: '#e0c23c', body2: '#c2a628', keel: '#a88c1e', spot: '#3a3222', tent: '#c2a628' },
      facts: [
        'It has about twenty-seven thousand teeth, on a ribbon of a tongue called a radula.',
        'That little hole on its right side is its nostril — the opening to its one lung.',
        'A biologist once timed one at about six and a half feet in two hours.',
        'It is the forest’s recycler. It eats fallen leaves and mushrooms and puts the goodness back into the soil.',
        'They are not always yellow. Some are green, brown, tan, white or olive, and most have black blotches.'
      ]
    },
    {
      id: 'yellow_millipede', name: 'Yellow-spotted Millipede',
      habitats: ['rainforest'], times: ['morning', 'evening', 'night'], rarity: 1, value: 24,
      behavior: 'crawl', speed: 16, shy: 26, size: 1.25,
      measure: 'about 2 inches',
      danger: 'You may hold it. Then wash your hands and keep them away from your eyes and mouth. Millipedes have no fangs and cannot bite at all.',
      art: { shape: 'millipede', body: '#232a1e', body2: '#3a4a2e', legs: '#6e7a52', sideSpots: '#e8c82c' },
      facts: [
        'If something bothers it, it curls into a tight coil and leaks cyanide out of little pores along its sides.',
        'To us that smells like almond essence. To a beetle or a bird it is a warning.',
        'The yellow spots are the label. They mark exactly where the pores are.',
        'One beetle eats them anyway, and it is in this forest too — the snail-eating ground beetle’s cousin specialises in hunting them.',
        'It is one of the animals that turns the forest’s fallen leaves back into soil.'
      ]
    },
    {
      id: 'snail_beetle', name: 'Snail-eating Ground Beetle',
      habitats: ['rainforest'], times: ['night'], rarity: 3, value: 75,
      behavior: 'crawl', speed: 34, shy: 44, size: 1.1,
      measure: 'about three quarters of an inch',
      art: { shape: 'scaphinotus', body: '#241426', shell: '#3a1f3e', shell2: '#1a0e1c', neck: '#2c1a2e', legs: '#1a0e1c', sheen: '#6a3a6e' },
      facts: [
        'It has a long thin head and a long thin neck so that it can reach down inside a snail’s shell.',
        'It hunts snails, slugs, worms and spiders. One beetle can clear a great many slugs.',
        'It cannot fly. Its wings are too small, so it spends its whole life walking the forest floor.',
        'Depending on where you find it, it is glossy black, deep purple or deep red.'
      ]
    },
    {
      id: 'sideband_snail', name: 'Pacific Sideband Snail',
      habitats: ['rainforest'], times: ['evening', 'night'], rarity: 3, value: 70,
      behavior: 'slow', speed: 7, shy: 24, size: 1.2,
      rainLover: true,
      measure: 'the shell is up to 1½ inches across',
      danger: 'Same rule as the slug: hands, not mouth, and wash your hands afterwards.',
      art: { shape: 'snail', shell: '#8a5a2e', shell2: '#e0b45c', band: '#3a2010', band2: '#a83428', body: '#7a5a6e', tent: '#6a4c5e', bandedShell: true },
      facts: [
        'It is the biggest land snail that belongs in Washington.',
        'Its shell is banded like a humbug — chestnut, yellow, dark brown and red, going round and round.',
        'The big black and orange slugs people find in their gardens are not from here. This snail is.',
        'Its worst enemy is the snail-eating ground beetle, which is long and thin for exactly that reason.'
      ]
    },
    {
      id: 'western_horntail', name: 'Western Horntail',
      habitats: ['rainforest'], times: ['day'], rarity: 3, value: 85,
      behavior: 'drift', speed: 26, shy: 40, size: 1.15,
      measure: 'an inch or more',
      art: { shape: 'horntail', body: '#161414', band: '#e8c62e', wing: 'rgba(224,196,130,0.5)', antenna: '#e8c62e', legs: '#c2a028', ovipositor: '#4a3f33' },
      facts: [
        'It cannot sting. The horn at the tip and the long needle behind it are for laying eggs in wood, and it does not bite people either.',
        'When she lays an egg she injects a fungus with it, and the grub eats the fungus as it tunnels along.',
        'The grub can take five years to grow, chewing a tunnel a foot long, and then it chews out through three quarters of an inch of solid wood.',
        'It is a straight tube from end to end. No wasp waist at all — that is how you know a horntail.'
      ]
    },
    {
      id: 'giant_ichneumon', name: 'Norton’s Giant Ichneumon',
      habitats: ['rainforest'], times: ['day'], rarity: 4, value: 160,
      behavior: 'cling', speed: 16, shy: 38, size: 1.3,
      measure: 'an inch and a half, with a three-inch thread behind her',
      art: { shape: 'ichneumon', body: '#2a2220', band: '#e8b82c', rust: '#8a4428', wing: 'rgba(238,244,248,0.42)', legs: '#d8a82c', thread: '#3a2e26' },
      facts: [
        'She finds a horntail grub hidden inside a tree by smelling the fungus it is eating, and by feeling the chewing through her feelers.',
        'Then she drills through solid wood with a thread thinner than a guitar string, to reach it.',
        'She cannot sting you. The three-inch needle is a drill, not a weapon, and she drinks nectar and water.',
        'Look for her clinging head-down on a mossy trunk with the threads arched over her back. That pose is the whole animal.'
      ]
    },
    {
      id: 'tiger_moth', name: 'Silver-spotted Tiger Moth',
      habitats: ['rainforest', 'glade'], times: ['night'], rarity: 2, value: 52,
      behavior: 'flutter', speed: 34, shy: 42, size: 1.1,
      measure: 'about 2 inches across',
      danger: 'The moth is harmless. Its caterpillar has tiny hairs that can raise a rash or welts, so look at that one and do not touch it.',
      art: { shape: 'moth', body: '#6e5a42', wing: '#8a6e4e', wing2: '#7a6044', accent: '#e8e4d8', pattern: 'silverspots' },
      facts: [
        'Its caterpillars live together in loose silk webbing on fir branches, and spend the whole winter in it before coming out to feed again in spring.',
        'The grown moth is named for the little silver spots scattered across its brown wings.',
        'Douglas-fir is its main tree, but it will use true fir, spruce and pine as well.'
      ]
    },
    {
      id: 'folding_door_spider', name: 'Pacific Folding-door Spider',
      habitats: ['rainforest'], times: ['night'], rarity: 4, value: 155,
      behavior: 'cling', speed: 20, shy: 46, size: 1.05,
      measure: 'her body is about half an inch',
      danger: 'Look, do not handle. It is not dangerous to people, but it is a big spider with real fangs and it does not want to be picked up.',
      art: { shape: 'spider', body: '#2a1f22', body2: '#3e2c33', legs: '#1e1518', eye: '#0e0a0c', stocky: true },
      facts: [
        'It lives at the bottom of a silk-lined shaft six to ten inches deep, and closes the top by pulling the two sides of the silk rim together into a pair of doors.',
        'It waits behind the doors, then leaps out with astonishing speed, grabs whatever walked past, and drops back down.',
        'People ask whether Washington has tarantulas. This is the answer: not really, but we have these, and they are just as interesting.'
      ]
    },

    /* =================================================================
       THE GOLDEN GLADE - a bright hole in a dark ceiling.
       Everything here needs sun inside a forest, or lives in the
       fallen log.
       ================================================================= */
    {
      id: 'lorquins_admiral', name: 'Lorquin’s Admiral',
      habitats: ['glade', 'forest', 'cherry'], times: ['day'], rarity: 2, value: 56,
      behavior: 'flutter', speed: 40, shy: 56, size: 1.15,
      measure: 'about 2¼ inches across',
      art: { shape: 'butterfly', body: '#2a231e', wing: '#2e2620', wing2: '#33291f', accent: '#f4f2ea', pattern: 'whiteband', tip: '#c86a28' },
      facts: [
        'The males spend the whole day perched at the bottom of a clearing, watching for a female to go past.',
        'Its caterpillars spend the winter half grown, rolled up inside a leaf they have made into a shelter.',
        'It does not only drink from flowers. It feeds at bird droppings too, which is true and which eight-year-olds find excellent.',
        'Its mums lay their eggs on cherry, willow and chokecherry leaves, which is why it turns up in the Cherry Grove. And its caterpillar looks exactly like a bird dropping, so hungry animals leave it alone.'
      ]
    },
    {
      id: 'woodland_skipper', name: 'Woodland Skipper',
      habitats: ['glade', 'meadow', 'garden', 'savanna'], times: ['day'], rarity: 1, value: 18,
      behavior: 'dart', speed: 62, shy: 48, size: 0.7,
      measure: 'about an inch across',
      art: { shape: 'skipper', body: '#8a6a34', wing: '#e08a24', wing2: '#c27418', accent: '#4a3418', dash: '#241a0e' },
      facts: [
        'It is the late-summer butterfly. It flies from the end of July into October, when nearly everything else has finished.',
        'Its life is extraordinary: the tiny new caterpillar sleeps all winter, feeds in spring, then sleeps all summer as a big one before turning into a butterfly in the autumn.',
        'Its caterpillars eat grass. Plain ordinary grass.',
        'It sits like a little fighter plane, front wings up and back wings flat.'
      ]
    },
    {
      id: 'wood_nymph', name: 'Common Wood-Nymph',
      habitats: ['glade'], times: ['day'], rarity: 2, value: 50,
      behavior: 'drift', speed: 30, shy: 54, size: 1.2,
      measure: 'up to 3 inches across',
      art: { shape: 'butterfly', body: '#4a3c2e', wing: '#6a5442', wing2: '#7a6450', accent: '#e8c040', pattern: 'eyeband' },
      facts: [
        'Those two big eyes are on its wings, not its head. A bird pecks the wing and the butterfly gets away.',
        'It does not care much for flowers. It feeds on rotting fruit.',
        'Its caterpillars eat grasses, so it needs big sunny grassy openings — which is exactly what a glade is.',
        'It flies in a dipping, bobbing way through the long grass, which is how you know it before you see the eyes.'
      ]
    },
    {
      id: 'police_car_moth', name: 'Police Car Moth',
      habitats: ['glade'], times: ['day'], rarity: 3, value: 72,
      behavior: 'flutter', speed: 24, shy: 34, size: 1.05,
      measure: 'about 1¾ inches across',
      art: { shape: 'moth', body: '#1a1a24', wing: '#1c1c22', wing2: '#222229', accent: '#d8e0a8', pattern: 'panels', dots: '#f0f0e8', leg: '#e0821e' },
      facts: [
        'It is a moth that flies in broad daylight, and it is black and white, which is how it got its name.',
        'Its caterpillars eat only mountain bluebells.',
        'It flies slowly and feeds at flowers, so it is the easy one to net in the glade.',
        'Its front legs are bright orange, which is a lovely detail nobody expects.'
      ]
    },
    {
      id: 'alder_borer', name: 'Banded Alder Borer',
      habitats: ['glade', 'forest'], times: ['day', 'evening'], rarity: 4, value: 145,
      behavior: 'crawl', speed: 18, shy: 42, size: 1.2,
      measure: 'over an inch, with longer feelers still',
      danger: 'No sting. Strong jaws, though — a long-horned beetle can give a surprising nip if you squeeze it.',
      art: { shape: 'longhorn', body: '#1a1a1c', shell: '#c8cdd2', shell2: '#1c1c20', legs: '#141416', antenna: '#1a1a1c', banded: true, longAntennae: 1.5 },
      facts: [
        'Its babies grow up inside dead alder, and also ash, willow, maple and oak.',
        'It is sometimes drawn in numbers to fresh paint, so people meet it on a newly painted wall.',
        'Its feelers are banded black and white too, and they are often longer than the whole beetle.',
        'It is not a pest. Washington State University’s own advice sheet on it says there is no need to do anything about it.'
      ]
    },
    {
      id: 'click_beetle', name: 'Western Eyed Click Beetle',
      habitats: ['glade', 'rainforest'], times: ['evening', 'night'], rarity: 3, value: 88,
      behavior: 'hop', speed: 22, shy: 40, size: 1.25,
      measure: 'up to an inch and a half',
      art: { shape: 'clickbeetle', body: '#2c2a28', shell: '#4a4642', shell2: '#2a2725', speck: '#b2aca2', eyespot: '#16130f', eyering: '#cfc8bc', legs: '#1e1c1a' },
      facts: [
        'The two big eyes on its shoulders are not eyes. They are markings on its back. Its real eyes are small and at the front.',
        'It has a spine on its underside that snaps into a groove on its chest. The snap makes a loud click and throws the whole beetle into the air.',
        'It does that to flip itself over when it lands on its back — and to startle whatever just picked it up.',
        'Its grub is a hunter. It lives in dead wood and eats the other grubs living there.'
      ]
    },
    {
      id: 'crab_spider', name: 'Goldenrod Crab Spider',
      habitats: ['glade', 'meadow', 'garden', 'savanna'], times: ['day'], rarity: 2, value: 54,
      behavior: 'cling', speed: 8, shy: 20, size: 0.7,
      measure: 'she is about a third of an inch',
      art: { shape: 'crabspider', body: '#f2ecd0', body2: '#e8dfb8', stripe: '#d8607e', legs: '#e6dcbc', eye: '#3a3428' },
      facts: [
        'She changes colour to match her flower — but slowly. White to yellow takes ten to twenty-five days. Yellow back to white takes about six.',
        'She builds no web at all. She sits perfectly still on a flower and grabs whatever lands on it.',
        'She catches bumblebees far bigger than she is. Bumblebees give her the most food of anything she catches.',
        'And she cannot hurt you in the slightest. Her fangs cannot get through skin and her venom is far too weak to matter to anything big.'
      ]
    },
    {
      id: 'leafcutter_bee', name: 'Leafcutter Bee',
      habitats: ['glade', 'meadow', 'garden', 'orchard', 'cherry'], times: ['morning', 'day'], rarity: 2, value: 46,
      behavior: 'hover', speed: 44, shy: 40, size: 0.95,
      sting: true,
      measure: 'about the size of a honeybee',
      art: { shape: 'bee', body: '#2a2624', stripe: '#cfc6b2', wing: 'rgba(240,246,250,0.55)', legs: '#1e1b19', bellybrush: '#e8c83c', leaf: '#6a9c3c' },
      facts: [
        'She cuts neat circles out of leaves with her jaws, flies them home, and builds them into little cradles for her eggs. Those tidy half-moon notches in rose leaves are hers.',
        'She carries pollen on the furry underside of her tummy, not in baskets on her legs like a honeybee. If you draw baskets on her legs you have drawn the wrong bee.',
        'She works alone. There is no hive and no queen — every mother builds and stocks her own nest, in a hole about as wide as a pencil.',
        'She can sting, but she almost never does. She has no hive to defend, and the sting is mild.'
      ]
    },
    {
      id: 'jumping_spider', name: 'Red-backed Jumping Spider',
      habitats: ['glade', 'desert', 'hill'], times: ['day'], rarity: 3, value: 68,
      behavior: 'dart', speed: 36, shy: 44, size: 0.7,
      measure: 'about a third of an inch',
      art: { shape: 'jumper', body: '#1c1a1c', back: '#c8342a', stripe: '#1c1a1c', jaw: '#2e8a7a', legs: '#241f22', eye: '#0c0a0c' },
      facts: [
        'Those two big front eyes give it the sharpest sight of any spider its size. It looks at you, turns, and watches you.',
        'It builds no trap web. It stalks its dinner and jumps on it.',
        'It sleeps in a little silk sleeping bag under a rock or a piece of wood, and moults and shelters from bad weather in there.',
        'Its red and black colours look like a velvet ant — which has a fearsome sting — and that is thought to be why other things leave it alone.'
      ]
    },

    /* =================================================================
       THE OAK SAVANNA - Garry oak standing far apart over bunchgrass.
       The trees are the smallest part of it. Most of what lives here
       lives in the grass, and the rest of it lives in an acorn.
       ================================================================= */
    {
      id: 'propertius_duskywing', name: 'Propertius Duskywing',
      habitats: ['savanna'], times: ['day'], rarity: 5, value: 240,
      behavior: 'dart', speed: 52, shy: 74, size: 1.05,
      measure: 'up to 1¾ inches across, the biggest duskywing there is',
      art: { shape: 'duskywing', body: '#4a3b2e', wing: '#6b5a46', wing2: '#4a3b2e', accent: '#33281f', spot: '#efe9d8', fringe: '#cabfa6', marble: '#8a7a62' },
      facts: [
        'Its caterpillars eat Garry oak leaves and nothing else at all. Where the oak goes, this butterfly goes with it.',
        'It spends the whole winter as a caterpillar, rolled up inside a folded oak leaf.',
        'There is one life cycle a year. The ones flying in April and May are the only ones there will be.',
        'It is a skipper, so it does not flutter. It flicks from perch to perch and stops dead, with its wings held flat and swept back.',
        'It really lives on the other side of the mountains. Washington has six to ten places where it is still found, in Mason, San Juan, Skamania and Thurston counties, all west of the Cascades — so a savanna on this side of the state is a place it belongs in but no longer lives.'
      ]
    },
    {
      id: 'gall_wasp', name: 'Speckled Gall Wasp',
      habitats: ['savanna'], times: ['morning', 'day'], rarity: 3, value: 78,
      behavior: 'crawl', speed: 13, shy: 30, size: 0.72,
      measure: 'a few millimetres — the ball it grew up in is far easier to find',
      art: { shape: 'gallwasp', body: '#33292a', body2: '#4a3a38', gall: '#d6c98e', gall2: '#c2b478', freckle: '#9a5e3a', wing: 'rgba(238,244,248,0.55)', legs: '#4a3c33' },
      facts: [
        'The speckled ball on the underside of the oak leaf is not a fruit, and the wasp did not build it. The wasp laid an egg in the leaf and the tree grew the ball itself, around the grub.',
        'Inside, the grub sits in a little chamber slung on threads that radiate out to the husk, like a hammock in a balloon.',
        'This one wasp makes two different galls in a year, because it has two different generations: one on the leaves and one on the buds.',
        'It lives only along the Pacific coast, from British Columbia down to northern California, wherever there is Oregon white oak.'
      ]
    },
    {
      id: 'filbert_weevil', name: 'Filbert Weevil',
      habitats: ['savanna'], times: ['morning', 'day'], rarity: 3, value: 74,
      behavior: 'slow', speed: 14, shy: 36, size: 0.78,
      measure: 'a third of an inch, and the snout is half as long again',
      art: { shape: 'weevil', body: '#6b4f2c', wing: '#a88450', accent: '#8a6a3c', pattern: 'plain', longSnout: 1.35, scales: '#cdb07a' },
      facts: [
        'In one study of Garry oak in British Columbia, up to two acorns in every three had a weevil grub inside.',
        'The mother drills a hole in a green acorn with her snout and lays her eggs down it.',
        'The grub eats the acorn from the inside, then chews its own round door out, drops to the ground and digs itself a little chamber.',
        'It may stay down there for one or two whole years before it comes up as a beetle.',
        'So a perfect acorn with one small round hole in it has already been somebody’s entire childhood.'
      ]
    },

    /* =================================================================
       THE SWAMP - cattail marsh and slough. A swamp is a wooded wetland
       and a marsh is one of grasses and reeds, and what Washington
       actually has is marsh and slough. Most of what lives here is
       under the water or inside the reeds.
       ================================================================= */
    {
      id: 'diving_beetle', name: 'Predaceous Diving Beetle',
      habitats: ['swamp', 'pond'], times: ['any'], rarity: 3, value: 86,
      aquatic: true,
      behavior: 'skim', speed: 46, shy: 56, size: 1.25,
      measure: 'up to an inch and a half',
      art: { shape: 'divingbeetle', body: '#2e3324', shell: '#343a28', edge: '#d8b83c', legs: '#1e2218', eye: '#14160f' },
      facts: [
        'It is a smooth shiny oval with a thin gold line running all the way round the edge, and that gold border is how you know it.',
        'It rows with both back legs at once, like a rowing boat, so it goes in smooth curves. The water beetle that paddles one leg at a time wobbles instead.',
        'It carries its air under its wing cases, and comes up to the surface tail first to refill.',
        'Its baby is called a water tiger. It has two curved jaws like hollow needles and it hunts tadpoles.',
        'Grown-up ones fly from pond to pond at night, which is how a brand new puddle gets beetles in it.'
      ]
    },
    {
      id: 'dragonfly_nymph', name: 'Dragonfly Nymph',
      habitats: ['swamp', 'pond'], times: ['any'], rarity: 2, value: 48,
      aquatic: true,
      behavior: 'crawl', speed: 16, shy: 34, size: 1.0,
      measure: 'about an inch, and very drab on purpose',
      art: { shape: 'dragonflynymph', body: '#5a5a42', body2: '#43432f', buds: '#6b6b4e', legs: '#3a3a2a', eye: '#1c1c14', mask: '#7a7a58' },
      facts: [
        'This is a dragonfly before it is a dragonfly. It can spend a year or more down here, walking about underwater, and it has no idea what it is going to be.',
        'Its bottom lip is on a hinge and folds away under its face. It shoots out, grabs, and folds back faster than you can see it happen.',
        'When it is ready it climbs up a reed stem into the air, splits down the back, and steps out.',
        'It leaves the whole empty suit of armour behind, still gripping the stem. Those brown shells on the cattails are real, and you can go and find them.'
      ]
    },
    {
      id: 'mosquito_larva', name: 'Mosquito Wriggler',
      habitats: ['swamp', 'pond'], times: ['any'], rarity: 1, value: 8,
      aquatic: true,
      behavior: 'drift', speed: 18, shy: 22, size: 0.72,
      measure: 'a quarter of an inch',
      art: { shape: 'wriggler', body: '#4a4436', body2: '#635c48', head: '#3a352a', brush: '#8a8168', siphon: '#2e2a22' },
      facts: [
        'It hangs upside down from the underneath of the water, breathing through a tube at its tail end like a snorkel poked up through the ceiling.',
        'Two little brushes beside its mouth whisk scraps out of the water all day long.',
        'Touch the surface and the whole crowd of them wriggles down to the bottom at once. That wriggle is how it got its name.',
        'Almost everything in the marsh eats them: the diving beetle, the dragonfly nymph, the backswimmer and every small fish.'
      ]
    },
    {
      id: 'pond_snail', name: 'Pond Snail',
      habitats: ['swamp', 'pond'], times: ['any'], rarity: 1, value: 14,
      aquatic: true,
      behavior: 'slow', speed: 7, shy: 14, size: 0.85,
      measure: 'a shell about half an inch tall',
      art: { shape: 'snail', body: '#c9bd94', wing: '#a37c46', accent: '#6b4e2a', pattern: 'spiral' },
      facts: [
        'It grazes the green film off a stem with a tongue like a ribbon of tiny teeth, and it leaves a clean stripe behind it, so you can read exactly where it has been.',
        'Many pond snails breathe air. They come up to the surface, open a little hole in the side of the body, take a breath, and go back down.',
        'Their eggs come in a clear jelly blob stuck to the underside of a leaf, and you can see the babies turning round inside it.'
      ]
    },
    {
      id: 'scud', name: 'Scud',
      habitats: ['swamp', 'pond', 'river'], times: ['any'], rarity: 1, value: 12,
      aquatic: true,
      behavior: 'dart', speed: 42, shy: 26, size: 0.55,
      measure: 'about a quarter of an inch',
      art: { shape: 'scud', body: '#c0a06a', body2: '#8a6f42', legs: '#b09468', eye: '#2e2418' },
      facts: [
        'A scud swims on its side. It flicks along on one flank in short bursts and then tucks itself in under a dead leaf.',
        'At rest it curls up into a comma shape, which is why some people call them sideswimmers or freshwater shrimp.',
        'It is not an insect at all. It is a crustacean, a little cousin of the crab, with a shell in armoured plates.',
        'It eats dead leaves and the film that grows on them, and nearly every fish in the marsh eats it.'
      ]
    },
    {
      id: 'leech', name: 'Leech',
      habitats: ['swamp', 'pond'], times: ['any'], rarity: 2, value: 32,
      aquatic: true,
      behavior: 'slow', speed: 18, shy: 30, size: 1.1,
      measure: 'an inch or two, and it can stretch to twice that',
      art: { shape: 'leech', body: '#3f4432', body2: '#585f42', belly: '#9a9a6a', sucker: '#2b2f22', eye: '#1a1c14' },
      facts: [
        'It has a sucker at each end. It grips with the back one, reaches forward, grips with the front one, and loops along like an inchworm.',
        'Most freshwater leeches never drink blood at all. They hunt snails, worms and insect larvae and swallow them whole.',
        'It can stretch out long and thin or pull up short and fat, because it has no bones and no shell to stop it.',
        'It is a worm, and a close relative of the earthworm in the garden.'
      ]
    },

    /* =================================================================
       THE CAVE - a lava tube. Nothing grows in the dark, so every
       scrap of food in here walked or flew in from outside. The bats
       are not visitors in a cave. They are the farmers.
       ================================================================= */
    {
      id: 'cave_cricket', name: 'Cave Cricket',
      habitats: ['cave'], times: ['any'], rarity: 2, value: 44,
      behavior: 'hop', speed: 30, shy: 44, size: 1.15,
      measure: 'a body about an inch, with legs and feelers far longer',
      art: { shape: 'cavecricket', body: '#6e5a42', body2: '#8a7354', mottle: '#4a3a28', legs: '#5f4c37', eye: '#241c14' },
      facts: [
        'It is not really a cricket and it cannot chirp. It has no wings at all, so there is nothing for it to rub together.',
        'Its feelers are longer than the whole rest of it, and it uses them the way you would use your hands in the dark.',
        'It sleeps in the cave all day and goes outside at night to feed, so every night it carries a little of the outside world back in with it.',
        'It sits still, and still, and still — and then makes one enormous jump.',
        'In a lava tube it is one of the biggest animals you will meet.'
      ]
    },
    {
      id: 'cave_springtail', name: 'Cave Springtail',
      habitats: ['cave'], times: ['any'], rarity: 1, value: 12,
      behavior: 'hop', speed: 22, shy: 20, size: 0.48,
      measure: 'smaller than a grain of salt',
      art: { shape: 'springtail', body: '#c6ccbe', body2: '#8a9480', legs: '#6e7868', furcula: true },
      facts: [
        'This is the animal that turns bat droppings and fungus into food for everything else in the cave. Everything down here is eating it, or eating something that ate it.',
        'It has a folded tail latched under its belly. It lets go of the latch and the tail slaps the ground and flings the whole animal away, like a mousetrap going off.',
        'It has no eyes worth the name, and it does not need any.',
        'Springtails that live deep in caves often have no colour left at all.'
      ]
    },
    {
      id: 'fungus_gnat_larva', name: 'Fungus Gnat Larva',
      habitats: ['cave'], times: ['any'], rarity: 2, value: 36,
      behavior: 'slow', speed: 6, shy: 18, size: 0.82,
      measure: 'a glassy thread half an inch long',
      art: { shape: 'gnatlarva', body: 'rgba(228,234,216,0.92)', body2: 'rgba(202,212,186,0.95)', gut: '#5f7040', head: '#2a2620', rim: 'rgba(110,122,96,0.8)', silk: 'rgba(222,236,216,0.6)' },
      facts: [
        'The glisten on a cave wall is alive. It is a film of tiny things growing on the rock, and this grub is one of the most important animals eating it.',
        'It lays down a faint web of silk on the wet stone and slides along inside it.',
        'You can almost see through it, and the dark line down the middle is its dinner.',
        'It grows up into a small dark fly, the sort that looks like a tiny mosquito and cannot bite anything at all.'
      ]
    },
    {
      id: 'cave_harvestman', name: 'Cave Harvestman',
      habitats: ['cave'], times: ['any'], rarity: 3, value: 60,
      behavior: 'crawl', speed: 22, shy: 40, size: 1.15,
      measure: 'a body the size of a peppercorn, on thread legs',
      art: { shape: 'harvestman', body: '#9a8a6e', wing: '#5a5346', accent: '#6b6252', pattern: 'plain', legLen: 1.25, pale: 1 },
      facts: [
        'It spends every winter in a cave. Outside is too cold and too dry, and a cave stays the same temperature all year.',
        'It hangs upside down from the ceiling in a crowd, with all their legs tangled together into one shivering mat.',
        'A harvestman is not a spider. It has one body part instead of two, it spins no silk, and it has no venom and no fangs — none at all.',
        'When the light finds them they bounce on their legs together, so the whole cluster shimmers.'
      ]
    },
    {
      id: 'cave_millipede', name: 'Cave Millipede',
      habitats: ['cave'], times: ['any'], rarity: 4, value: 135,
      behavior: 'slow', speed: 9, shy: 26, size: 1.1,
      measure: 'about an inch, and the colour of paper',
      art: { shape: 'cavemillipede', body: '#e6e0cc', body2: '#cdc4a8', ring: '#8a8268', legs: '#b8ae94', head: '#d2c8ac' },
      facts: [
        'This one is a true cave animal. It lives nowhere else on Earth, it has no eyes, and it has no colour.',
        'One was photographed in a cave at Mount Adams, in Washington, eating tree roots that had grown down through the ceiling.',
        'That is the strange part. A tree up on the mountain pushes its roots down through cracks in the rock, and there is an animal down in the dark eating them that has never seen the tree.',
        'Like every millipede it has two pairs of legs on each segment, and it is in no hurry whatsoever.'
      ]
    },

    /* =================================================================
       THE BADLANDS - the channeled scablands. Shrub-steppe on bare rock,
       so most of the sagebrush desert lives here too. What is new is the
       water: pools that fill with winter snow and are gone by July.
       ================================================================= */
    {
      id: 'fairy_shrimp', name: 'Fairy Shrimp',
      habitats: ['badlands'], times: ['morning', 'day'], rarity: 4, value: 155,
      aquatic: true,
      behavior: 'drift', speed: 26, shy: 30, size: 0.9,
      measure: 'about an inch, and almost see-through',
      art: { shape: 'fairyshrimp', body: 'rgba(240,242,226,0.85)', body2: 'rgba(206,214,180,0.92)', legs: 'rgba(214,224,186,0.9)', rim: 'rgba(122,134,96,0.6)', tail: '#e0793c', eye: '#22222a', gut: '#7f9050' },
      facts: [
        'It swims upside down on its back, rowing with eleven pairs of flat leaf-shaped legs that beat in a wave from front to back.',
        'It lives in pools that fill with winter rain and snow and are dry ground again by July, so its whole life happens in a puddle that will not be there in the summer.',
        'Its eggs sit in the dust through the dry year — sometimes through several dry years — and hatch when the water comes back.',
        'And that is the trick: nothing that eats fairy shrimp can live in a puddle that keeps disappearing. It is safe there because the water goes away.',
        'Scientists have not studied the scabland pools much yet, so nobody can tell you for certain which kind of fairy shrimp is in them.'
      ]
    },

    /* =================================================================
       THE BAMBOO GROVE - a planted grove, not a wild one. There is no
       native bamboo anywhere in the Pacific Northwest, so what lives in
       one here is ordinary Washington garden life, plus one passenger
       that came with the plant.
       ================================================================= */
    {
      id: 'bamboo_aphid', name: 'Bamboo Aphid',
      habitats: ['bamboo'], times: ['morning', 'day'], rarity: 1, value: 12,
      behavior: 'slow', speed: 6, shy: 14, size: 0.58,
      measure: 'smaller than a sesame seed',
      art: { shape: 'aphid', body: '#b8d46a', wing: '#d8ec9c', accent: '#3a4a20', tailband: '#2a3418' },
      facts: [
        'It arrived here with the bamboo. Somebody shipped the plant, and the aphid came along on it, which is how most garden insects get anywhere.',
        'It lives in crowds on the underside of the leaves, and it is a pale pear-shaped green thing with two little exhaust pipes at the back.',
        'It drinks sap and lets the sugar out the back as honeydew, which drips onto whatever is underneath and grows a black sooty mould on it. That sticky shine on a car parked under a tree is aphids, not sap.',
        'Ladybirds and lacewings eat them, and both of those live in this garden already.'
      ]
    },

    /* =================================================================
       THE CHERRY GROVE - an orchard block of pruned fruiting cherries
       and a park corner of Japanese flowering cherries. One is grown
       for what it makes and one for what it does, for two weeks.
       ================================================================= */
    {
      id: 'cherry_fruit_fly', name: 'Western Cherry Fruit Fly',
      habitats: ['cherry', 'orchard'], times: ['morning', 'day'], rarity: 2, value: 42,
      behavior: 'dart', speed: 52, shy: 48, size: 0.74,
      measure: 'about a fifth of an inch',
      art: { shape: 'fly', body: '#17171b', wing: '#eef4f8', accent: '#f2f2ea', wingBands: '#1a1e24', pattern: 'bands', bandStyle: 'zigzag', bodyBands: '#e8e8dc' },
      facts: [
        'It has clear wings with a bold dark pattern painted across them, and it waves them slowly while it walks about on a cherry.',
        'The grown-ups come up out of the ground in May, about five weeks before the cherries are ripe, as if they knew.',
        'There is only one generation a year. Everything this fly does, it does once.',
        'The grub eats its way in to the stone, where nothing can reach it.',
        'Buyers will not accept one single maggot in a whole shipment of cherries, so this one small fly decides how an entire orchard is run. That is what a quarantine is: a box of fruit is also a vehicle.'
      ]
    },
    {
      id: 'pear_slug', name: 'Pear Slug',
      habitats: ['cherry', 'orchard'], times: ['morning', 'day'], rarity: 2, value: 40,
      behavior: 'slow', speed: 5, shy: 18, size: 0.8,
      measure: 'about a third of an inch',
      art: { shape: 'pearslug', body: '#38472e', body2: '#4c5c3a', head: '#2a3622', rim: '#5e7048', gloss: 'rgba(232,244,222,0.6)' },
      facts: [
        'It is not a slug. It is a baby sawfly — an insect with six legs under there — wearing a coat of olive-green slime it makes itself.',
        'It eats only the top skin of the leaf and leaves the veins and the underside alone, so the leaf turns into a brown lace window you can hold up to the light and see through.',
        'When it is nearly grown it sheds the slime, turns orange-yellow, stops looking like a slug at all, drops off the tree and burrows a couple of inches down.',
        'It grows up into a small shiny black wasp, and that wasp has no sting.',
        'So it is not what it looks like, and the thing it turns into is not what that looks like either.'
      ]
    },
    {
      id: 'black_cherry_aphid', name: 'Black Cherry Aphid',
      habitats: ['cherry'], times: ['morning', 'day'], rarity: 1, value: 10,
      behavior: 'slow', speed: 6, shy: 14, size: 0.5,
      measure: 'smaller than a sesame seed',
      art: { shape: 'aphid', body: '#22222a', wing: '#3a3a46', accent: '#6b6b7a', gloss: 'rgba(255,255,255,0.55)' },
      facts: [
        'It is glossy black, like a bead of lacquer, and it crowds onto the newest soft shoots at the ends of the branches.',
        'A cherry leaf curled tight in spring usually has a colony folded up inside it, out of the weather and out of sight.',
        'Ants love the sweet honeydew so much that they will guard the aphids and drive the ladybirds off them.'
      ]
    },

    /* =================================================================
       THE FARMYARD - Benton County is irrigated crop country: a pole
       shed, a dozen hens, a couple of goats, a horse and a row of
       poplars. Not a storybook barnyard.
       ================================================================= */
    {
      id: 'stable_fly', name: 'Stable Fly',
      habitats: ['farmyard'], times: ['morning', 'day', 'evening'], rarity: 2, value: 26,
      behavior: 'dart', speed: 56, shy: 44, size: 0.8,
      measure: 'the size of a house fly',
      danger: 'This one bites, and both the males and the females do it. A stable fly on your ankle is a sharp nip and then it is over. It wants a drink, not a fight, and it does not carry anything to you.',
      art: { shape: 'fly', body: '#43474e', wing: '#e8eef2', accent: '#6b7078', pattern: 'checks', beak: '#2b2f34', checks: '#2b2f34' },
      facts: [
        'It looks almost exactly like a house fly, and the difference is at the front. A house fly has a soft sponge for a mouth. A stable fly has a stiff black spear that sticks straight out in front of its face.',
        'It goes for ankles, and for the legs of horses and cattle. That is why a horse standing in the sun stamps one foot and then the other.',
        'Its babies do not grow in the muck. They grow in wet straw and spoiled hay, so a tidy yard has fewer of them.',
        'A house fly cannot bite you. It has nothing to bite with. If something bit you in a barn, it was probably this.'
      ]
    },
    {
      id: 'mealworm_beetle', name: 'Yellow Mealworm Beetle',
      habitats: ['farmyard'], times: ['evening', 'night'], rarity: 1, value: 18,
      behavior: 'crawl', speed: 24, shy: 30, size: 0.9,
      measure: 'about half an inch',
      art: { shape: 'darkling', body: '#3a3028', slim: true, noStand: true, sheen: 'rgba(224,206,166,0.24)' },
      facts: [
        'The mealworms sold in tubs to feed chickens and pet lizards are its babies. This is what they grow into.',
        'It lives in spilled grain and in the bottom of feed sacks, so one walking across the shed floor means a spill somewhere.',
        'It is a darkling beetle, the very same family as the pinacate beetle that stands on its head out in the sagebrush.',
        'A young one is pale gold and turns dark brown over a few days after it sheds.'
      ]
    },
    /* =================================================================
       v1.15 - more for the Cherry Grove and the Bamboo Grove.
       Guin: "New bugs for the cherry grove and bammo forest". Every one
       checked against WSU Tree Fruit, WSU Hortsense, PNW Insect
       Management Handbook, UC IPM, USDA APHIS, the Washington Butterfly
       Association, Colorado State and Penn State Extension, BugGuide and
       the Burke Museum.
       ================================================================= */
    {
      id: 'spotted_wing_drosophila', name: 'Spotted Wing Drosophila',
      habitats: ['cherry', 'orchard'], times: ['morning', 'day'], rarity: 2, value: 44,
      behavior: 'dart', speed: 54, shy: 46, size: 0.52,
      measure: 'about as long as this dash –',
      art: { shape: 'fly', body: '#c8a06a', wing: '#e8f1f5', accent: '#5a3a1e', pattern: 'bands', bodyBands: '#6b4524', eyeCol: '#d0382a', wingSpot: '#1a1a1a' },
      facts: [
        'It is a tiny tan fruit fly with big, bright red eyes.',
        'Most little fruit flies wait for fruit to go rotten. This one has a tiny saw on the end of her tail, so she can slice into a perfect ripe cherry and lay her eggs inside it.',
        'The boys have one dark spot near the tip of each wing. The spots take most of a day to show up after he hatches.',
        'It came from Asia and reached eastern Washington around 2010. It spends the winter as a grown-up fly.'
      ]
    },
    {
      id: 'peachtree_borer', name: 'Peachtree Borer',
      habitats: ['cherry', 'orchard'], times: ['day'], rarity: 4, value: 140,
      behavior: 'dart', speed: 58, shy: 70, size: 0.95,
      measure: 'wings about as wide as a quarter, or a little more',
      art: { shape: 'clearwing', body: '#1c2340', wing: '#26305a', accent: '#1c2340', rim: '#3a4c8c', belt: '#f28c28' },
      facts: [
        'It is a moth dressed up as a wasp, and it zips about in the daytime, which most moths never do.',
        'The mums and dads look different. He has see-through wings and thin yellow stripes. She has dark wings and one bright orange belt.',
        'Its creamy caterpillar lives inside the cherry trunk, right down by the ground, chewing under the bark.',
        'Where a caterpillar is tunnelling, the tree oozes sticky gum full of crumbs. That blob is a clue for tree detectives.'
      ]
    },
    {
      id: 'tent_caterpillar', name: 'Western Tent Caterpillar',
      habitats: ['cherry', 'orchard'], times: ['any'], rarity: 2, value: 34,
      behavior: 'slow', speed: 9, shy: 18, size: 1.0,
      measure: 'about 2 inches long',
      art: { shape: 'caterpillar', body: '#7c8da6', body2: '#9aa9be', fur: '#b98a58', legs: '#3e4a5c', woolly: true, back: '#f2ead3', spots: '#3e6fb0' },
      facts: [
        'Brothers and sisters spin a silk tent together in a fork of the branches, and they make it bigger as they grow.',
        'A grown one is soft and fuzzy, with blue spots down its sides and a pale stripe along its back.',
        'One mum moth lays up to 400 eggs in a single clump, and covers them with a grey-brown coat that works like a raincoat all winter.',
        'After four to six weeks the caterpillars wander off to spin cocoons, and plain brown moths come out in the middle of summer.'
      ]
    },
    {
      id: 'japanese_beetle', name: 'Japanese Beetle',
      habitats: ['cherry', 'garden'], times: ['day'], rarity: 4, value: 120,
      behavior: 'cling', speed: 16, shy: 60, size: 0.8,
      measure: 'a little less than half an inch',
      art: { shape: 'beetle', body: '#1e8c5a', wing: '#b8733a', accent: '#43c38a', pattern: 'tufts', shell: '#b8733a', shell2: '#d08a4c' },
      facts: [
        'It has a shiny green head, copper wing covers, and little white fuzzy tufts along its sides.',
        'It munches leaves until only the veins are left, like a lacy leaf skeleton. Cherry trees are on its menu.',
        'It spends about ten months of every year underground as a fat white grub, eating grass roots.',
        'It is not from here. Scientists found it near Pasco in 2023 and have been trapping it ever since to stop it spreading. If you ever see one, a grown-up can report it to the state.'
      ]
    },
    {
      id: 'mining_bee', name: 'Mining Bee',
      habitats: ['cherry', 'orchard'], times: ['morning', 'day'], rarity: 2, value: 38,
      behavior: 'hover', speed: 44, shy: 50, size: 0.7,
      measure: 'somewhere between a pea and a jellybean',
      art: { shape: 'bee', body: '#2b2b2b', wing: '#eee8dc', accent: '#b08a5a', pattern: 'plain', thorax: '#b08a5a', stripe: '#e8dcc0' },
      facts: [
        'Mum digs her very own tunnel in the ground to raise her babies in.',
        'Each mum works alone, but lots of them dig side by side, like a little bee neighbourhood.',
        'It is one of the first bees of spring, out and about while the cherry trees are in flower.',
        'About 400 different kinds of mining bee live in North America.'
      ]
    },
    {
      id: 'leafroller', name: 'Obliquebanded Leafroller',
      habitats: ['cherry', 'orchard'], times: ['evening', 'night'], rarity: 3, value: 56,
      behavior: 'flutter', speed: 30, shy: 48, size: 0.85,
      measure: 'about an inch across',
      art: { shape: 'moth', body: '#a0673a', wing: '#a0673a', wing2: '#e8d8b0', accent: '#6b3e1f', pattern: 'bands', bands: '#6b3e1f' },
      facts: [
        'Its caterpillar rolls a leaf into a tube and ties it shut with silk, to make a hideout.',
        'If you bother the caterpillar, it wriggles backwards very fast and can drop down on a silk thread.',
        'It spends the winter as a tiny caterpillar tucked into a silk sleeping bag on a branch.',
        'The moth has dark slanting bands across its wings. Oblique is a long word for slanted.'
      ]
    },

    /* ---- the bamboo grove ---- */
    {
      id: 'bamboo_mite', name: 'Bamboo Spider Mite',
      habitats: ['bamboo'], times: ['any'], rarity: 4, value: 110,
      behavior: 'slow', speed: 4, shy: 12, size: 0.5,
      measure: 'smaller than a grain of salt',
      art: { shape: 'spider', body: '#d9d48a', wing: '#2f4a2a', accent: '#2f4a2a', pattern: 'spots', legs: '#b9b46a', eye: '#7a2a1a' },
      facts: [
        'It is so tiny you need a magnifying glass. It lives on the underside of bamboo leaves.',
        'A whole family lives together under a thick, shiny silk roof that they weave.',
        'The family keeps one spot as a shared toilet, and it shows up as neat little rows of dark dots.',
        'Mums look after their young and push away strange mites. It goes wherever people carry bamboo, and leaves pale speckles on the leaves.'
      ]
    },
    {
      id: 'grass_carrying_wasp', name: 'Grass-carrying Wasp',
      habitats: ['bamboo', 'garden'], times: ['day'], rarity: 3, value: 66,
      behavior: 'dart', speed: 56, shy: 56, size: 0.9,
      measure: 'about two-thirds of an inch',
      art: { shape: 'wasp', body: '#151515', wing: '#5a4e44', accent: '#c8963e', pattern: 'plain', grass: '#7fb24a' },
      facts: [
        'It flies home carrying a long blade of grass that trails out behind it like a streamer.',
        'It does not dig. It moves into holes that are already there — hollow stems, the cut ends of bamboo, even window tracks — and stuffs them full of grass.',
        'Mum hunts tree crickets and katydids. She stings them so they keep still, and packs them in as food for her babies.',
        'The grown-ups sip nectar from flowers. It is calm, and only stings if it is grabbed.'
      ]
    },
    {
      id: 'woodlouse_spider', name: 'Woodlouse Hunter',
      habitats: ['bamboo', 'garden'], times: ['evening', 'night'], rarity: 3, value: 60,
      behavior: 'crawl', speed: 30, shy: 40, size: 0.85,
      measure: 'about half an inch, not counting its legs',
      art: { shape: 'spider', body: '#e3cfa4', body2: '#c0461e', wing: '#c0461e', accent: '#d8c294', legs: '#c0461e', eye: '#1a0a06', stocky: true },
      facts: [
        'It has six eyes, not eight like most spiders.',
        'Its huge fangs are made for getting through a roly-poly’s armour.',
        'It hunts at night without a web. In the day it rests in a little silk tent under a stone or a log.',
        'It came from round the Mediterranean Sea. Its bite is only a pinch, but it is one to watch rather than hold.'
      ]
    },
    {
      id: 'leopard_slug', name: 'Leopard Slug',
      habitats: ['bamboo', 'garden'], times: ['evening', 'night'], rarity: 3, value: 58,
      behavior: 'slow', speed: 6, shy: 14, size: 1.3,
      measure: 'about as long as your hand',
      art: { shape: 'slug', body: '#bfb4a5', body2: '#a89c8a', keel: '#8a7e6c', spot: '#2a2a2a', tent: '#8a7e6c' },
      facts: [
        'It is spotted like a leopard, and it can grow as long as your hand.',
        'It mostly eats mushrooms, mould and dead leaves, so it is part of the clean-up crew. Sometimes it even eats other slugs.',
        'It comes out at night, and afterwards it goes home to the very same hiding place.',
        'Two leopard slugs can spin slowly round each other hanging from a thick rope of their own slime. It first came from Europe.'
      ]
    },
    {
      id: 'garden_springtail', name: 'Garden Springtail',
      habitats: ['bamboo', 'garden'], times: ['any'], rarity: 1, value: 14,
      behavior: 'hop', speed: 26, shy: 34, size: 0.5,
      measure: 'about the size of a pinhead',
      art: { shape: 'springtail', body: '#7a6e8a', body2: '#998ea8', legs: '#5a506a', furcula: true },
      facts: [
        'It has a spring folded up under its tummy. When it lets go, it flips itself into the air.',
        'Thousands can live in one square foot of damp leaves.',
        'It breathes through its skin, so it needs damp places, like the thick pile of fallen bamboo leaves.',
        'It has six legs but it is not quite an insect — it is a close cousin. It eats mould, and it cannot bite.'
      ]
    },
    {
      id: 'zebra_jumper', name: 'Zebra Jumping Spider',
      habitats: ['bamboo', 'garden'], times: ['day'], rarity: 2, value: 40,
      behavior: 'hop', speed: 30, shy: 44, size: 0.6,
      measure: 'about a quarter of an inch',
      art: { shape: 'jumper', body: '#1a1a1a', back: '#f2f2ee', stripe: '#f2f2ee', bars: '#1a1a1a', jaw: '#3a3a3a', legs: '#2a2a2a', eye: '#0c0c0c' },
      facts: [
        'It is striped black and white, like a very small zebra.',
        'It does not catch its dinner in a web. It creeps up and pounces.',
        'Before it jumps, it fastens a silk safety line, like a rock climber’s rope.',
        'Its big front eyes see very well, so it may turn round and look right at you. It loves sunny walls, fences and bamboo stems. It came from Europe.'
      ]
    },

    /* ---------- v1.20: the Mesa (Guin asked for it) ---------- */
    {
      id: 'anise_swallowtail', name: 'Anise Swallowtail',
      habitats: ['mesa', 'hill'], times: ['morning', 'day'], rarity: 2, value: 36,
      behavior: 'flutter', speed: 42, shy: 62, size: 1.15,
      measure: 'about 3 inches across',
      art: { shape: 'swallowtail', body: '#1e1c1a', wing: '#f4d23a', wing2: '#fbe78a', accent: '#1e1c1a', pattern: 'stripes' },
      facts: [
        'Boy anise swallowtails fly to the tops of hills and rocky tops to wait for girl butterflies. Scientists call this hilltopping.',
        'Its caterpillars eat plants from the carrot family, like wild biscuitroot on dry hills, and dill, fennel and parsley in gardens.',
        'It lives all over the western part of North America, from the seashore up into the mountains.'
      ]
    },
    {
      id: 'painted_lady', name: 'Painted Lady',
      habitats: ['mesa', 'meadow', 'desert'], times: ['morning', 'day'], rarity: 2, value: 26,
      behavior: 'flutter', speed: 40, shy: 52, size: 1.05,
      measure: 'about 2 inches across',
      art: { shape: 'butterfly', body: '#2a2420', wing: '#f08a2a', wing2: '#f6b060', accent: '#1e1a18', pattern: 'spots' },
      facts: [
        'Painted ladies live on every continent except Australia and Antarctica. That makes them one of the most widespread butterflies in the world.',
        'Boy painted ladies like to perch on bushes on hilltops in the afternoon and watch for girls flying by.',
        'Their caterpillars often eat thistles, so another name for them is the thistle butterfly.',
        'Some years millions of them fly north together in spring. It is one of the great butterfly journeys.'
      ]
    },
    {
      id: 'clearwinged_grasshopper', name: 'Clearwinged Grasshopper',
      habitats: ['mesa', 'badlands'], times: ['morning', 'day'], rarity: 1, value: 14,
      behavior: 'hop', speed: 30, shy: 48, size: 0.95,
      measure: 'about 1 inch long',
      art: { shape: 'grasshopper', body: '#a8905e', wing: '#e6ddc6', accent: '#5e4c30', pattern: 'plain' },
      facts: [
        'Its back wings are see-through, like a window. You only see them when it flies.',
        'It lives in dry grassy places and mountain meadows all over western North America.',
        'Mother grasshoppers lay their eggs in the ground in bare, sunny spots, and many of them choose the very same patch.'
      ]
    }
  ];

  /* Does this creature need water in its tank? */
  GG.isAquaticBug = function (def) {
    return !!def && (def.aquatic === true || def.behavior === 'tide');
  };

  GG.BUG_BY_ID = {};
  GG.BUGS.forEach(function (b, i) { b.index = i; GG.BUG_BY_ID[b.id] = b; });

  GG.RARITY_NAMES = ['', 'Common', 'Often seen', 'Uncommon', 'Rare', 'Legendary'];
  GG.RARITY_COLORS = ['', '#8fb98f', '#7fb3d6', '#b58fd6', '#e0a13c', '#ff6fae'];

  GG.HABITAT_NAMES = {
    meadow: 'the Sunny Meadow', garden: 'the Flower Garden', forest: 'the Whispering Woods',
    pond: 'the Lily Pond', hill: 'the Pebble Hills', orchard: 'the Apple Orchard',
    riverbank: 'the riverbank', beach: 'Shell Beach', shore: 'the rocky shore',
    tidepool: 'the Tidepools', river: 'the river and the stream',
    desert: 'the Sagebrush Desert', mountain: 'Cloudtop Ridge', taiga: 'the Spruce Taiga',
    tundra: 'the Lichen Tundra', rainforest: 'the Mossy Rainforest', glade: 'the Golden Glade',
    savanna: 'the Oak Savanna', swamp: 'the Cattail Marsh', cave: 'the Lava Tube',
    badlands: 'the Scablands', bamboo: 'the Bamboo Grove', cherry: 'the Cherry Grove',
    farmyard: 'the Farmyard', dogpark: 'Dog\u2019s Paradise', mesa: 'the Mesa',
    anywhere: 'all over the garden'
  };
  GG.TIME_NAMES = { morning: 'morning', day: 'daytime', evening: 'evening', night: 'night', any: 'any time' };
})(window.GG = window.GG || {});
