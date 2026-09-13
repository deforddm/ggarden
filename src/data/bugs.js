/* Guin's Garden — bug roster.
   Each species: where it lives, when it comes out, how it moves,
   how to draw it, and true facts for the Bug Book. */
(function (GG) {
  'use strict';

  // habitats: meadow, garden, forest, pond, hill, orchard, riverbank,
  //           river, beach, shore, tidepool, anywhere
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
      habitats: ['garden', 'meadow'], times: ['morning', 'day', 'evening'], rarity: 1, value: 10,
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
      habitats: ['hill', 'meadow'], times: ['day', 'evening', 'night'], rarity: 3, value: 65,
      behavior: 'crawl', speed: 22, shy: 48, size: 0.9,
      measure: '1 inch long',
      art: { shape: 'beetle', body: '#2b2b30', wing: '#3d3d46', accent: '#15151a', pattern: 'plain' },
      facts: [
        'Some dung beetles roll animal poop into a ball and push it away, to eat and to raise their babies in. They are nature’s clean-up crew.',
        'Some dung beetles look up at the Milky Way to keep their ball rolling in a straight line. They were the first animals we ever caught using the night sky as a map.'
      ]
    },
    {
      id: 'honeybee', name: 'Honeybee',
      habitats: ['garden', 'orchard'], times: ['morning', 'day'], rarity: 2, value: 25,
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
      habitats: ['garden', 'meadow'], times: ['morning', 'day'], rarity: 1, value: 15,
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
      habitats: ['pond', 'meadow'], times: ['morning', 'day'], rarity: 2, value: 40,
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
      habitats: ['pond'], times: ['day'], rarity: 4, value: 180,
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
      habitats: ['pond'], times: ['morning', 'day', 'evening'], rarity: 2, value: 28,
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
      habitats: ['pond'], times: ['any'], rarity: 2, value: 26,
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
      habitats: ['meadow', 'hill'], times: ['morning', 'day', 'evening'], rarity: 1, value: 12,
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
      habitats: ['meadow', 'garden'], times: ['evening', 'night'], rarity: 2, value: 22,
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
      habitats: ['forest', 'orchard'], times: ['night'], rarity: 3, value: 60,
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
      habitats: ['garden', 'forest'], times: ['any'], rarity: 2, value: 30,
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
      habitats: ['forest', 'garden'], times: ['any'], rarity: 1, value: 8,
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
      habitats: ['garden', 'forest'], times: ['any'], rarity: 1, value: 12,
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
      habitats: ['garden', 'meadow', 'forest'], times: ['any'], rarity: 1, value: 10,
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
      habitats: ['forest', 'garden'], times: ['evening', 'night'], rarity: 2, value: 28,
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
      habitats: ['forest', 'garden'], times: ['any'], rarity: 2, value: 24,
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
      habitats: ['forest', 'garden'], times: ['evening', 'night'], rarity: 2, value: 26,
      behavior: 'crawl', speed: 30, shy: 46, size: 1.2,
      measure: 'body the size of a pea',
      art: { shape: 'harvestman', body: '#8a6a4a', wing: '#3a2f26', accent: '#4a3a2a', pattern: 'plain' },
      facts: [
        'People call them daddy long-legs, but a harvestman is not a spider. Its body is one little blob instead of two parts, and it spins no web.',
        'Harvestmen have no venom and no fangs at all. The story that they are the most poisonous spider is completely made up.',
        'They eat tiny bugs and bits of rotting fruit, and they walk on legs that can be ten times longer than their body.'
      ]
    },
    {
      id: 'crane_fly', name: 'Crane Fly',
      habitats: ['meadow', 'pond', 'garden'], times: ['evening', 'night'], rarity: 1, value: 12,
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
      habitats: ['garden', 'meadow'], times: ['morning', 'day'], rarity: 1, value: 14,
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
      habitats: ['pond', 'riverbank'], times: ['evening', 'night'], rarity: 2, value: 28,
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
      habitats: ['garden', 'meadow'], times: ['evening', 'night'], rarity: 2, value: 32,
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
      habitats: ['hill', 'meadow', 'beach', 'riverbank'], times: ['day'], rarity: 3, value: 90,
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
      habitats: ['pond'], times: ['any'], rarity: 4, value: 170,
      behavior: 'skim', speed: 44, shy: 68, size: 1.35,
      measure: '1.5 inches long',
      art: { shape: 'waterbug', body: '#7a6b4a', wing: '#9a8a60', accent: '#4a4030', pattern: 'plain' },
      facts: [
        'Giant water bugs are fierce hunters. They can catch tadpoles and even small fish bigger than themselves.',
        'In many kinds of giant water bug the mother glues her eggs onto the father’s back, and he carries them about and keeps them wet until they hatch.',
        'They can fly from pond to pond at night, and they head for lights, which is why some people call them electric light bugs.'
      ]
    },
    {
      id: 'backswimmer', name: 'Backswimmer',
      habitats: ['pond'], times: ['any'], rarity: 2, value: 34,
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
      habitats: ['garden', 'forest'], times: ['evening', 'night'], rarity: 1, value: 14,
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
      habitats: ['orchard', 'garden'], times: ['morning', 'day'], rarity: 3, value: 70,
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
      habitats: ['riverbank'], times: ['evening', 'night'], rarity: 2, value: 34,
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
      habitats: ['pond', 'river'], times: ['any'], rarity: 1, value: 18,
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
    anywhere: 'all over the garden'
  };
  GG.TIME_NAMES = { morning: 'morning', day: 'daytime', evening: 'evening', night: 'night', any: 'any time' };
})(window.GG = window.GG || {});
