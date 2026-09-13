/* Guin's Garden — what lives in the Lily Pond.
   Each fish: how big its shadow is, when it bites, how to draw it, and true facts. */
(function (GG) {
  'use strict';

  // shadow: 1 tiny .. 5 huge   |   times: morning day evening night any
  GG.FISH = [
    {
      id: 'minnow', name: 'Minnow', rarity: 1, value: 8, shadow: 1, size: 0.55,
      waters: ['pond', 'stream', 'river'], times: ['any'], measure: '2 inches long',
      art: { shape: 'minnow', back: '#7d8a6b', belly: '#eef0e2', fin: '#b9c4a4', accent: '#3f4636', pattern: 'line' },
      facts: [
        'Minnows swim in big groups called shoals. Hundreds of little eyes spot a hungry bass much sooner than two would.',
        'Lots of different small fish get called minnows, but real minnows all belong to one big family of their own, cousins of the carp.'
      ]
    },
    {
      id: 'bluegill', name: 'Bluegill', rarity: 1, value: 14, shadow: 2, size: 0.85,
      waters: ['pond'], times: ['morning', 'day', 'evening'], measure: '7 inches long',
      art: { shape: 'sunfish', back: '#4f7a52', belly: '#f2c85c', fin: '#3f6b58', accent: '#1f3a4a', pattern: 'bars' },
      facts: [
        'A bluegill gets its name from the shimmery blue on its chin and cheeks. The little flap on the edge of its gill cover is black, like a dark ear.',
        'The male sweeps a round nest in the gravel with his tail, then guards the eggs until they hatch.',
        'Bluegills are sunfish, and their bodies are flat and round like a dinner plate on its side.'
      ]
    },
    {
      id: 'pumpkinseed', name: 'Pumpkinseed', rarity: 1, value: 16, shadow: 2, size: 0.8,
      waters: ['pond'], times: ['morning', 'day'], measure: '6 inches long',
      art: { shape: 'sunfish', back: '#4a8a4f', belly: '#ffb84a', fin: '#3f6b58', accent: '#d2453f', pattern: 'spots' },
      facts: [
        'Pumpkinseeds are named for their shape: flat and round, like a pumpkin seed.',
        'They have wiggly blue lines on their cheeks and a bright orange spot on the gill flap.',
        'They love to eat snails, and they have special teeth in their throat for crunching the shells.'
      ]
    },
    {
      id: 'crappie', name: 'Black Crappie', rarity: 2, value: 26, shadow: 2, size: 0.95,
      waters: ['pond'], times: ['morning', 'evening'], measure: '10 inches long',
      art: { shape: 'sunfish', back: '#5e6b63', belly: '#e8ecdf', fin: '#4a5750', accent: '#2b332e', pattern: 'speckle' },
      facts: [
        'Crappie are covered in dark speckles scattered all over, like someone flicked a paintbrush at them.',
        'They feed most at dawn and dusk, so early morning and evening are the best times to find one.'
      ]
    },
    {
      id: 'perch', name: 'Yellow Perch', rarity: 2, value: 30, shadow: 2, size: 0.95,
      waters: ['pond', 'river'], times: ['morning', 'day'], measure: '9 inches long',
      art: { shape: 'torpedo', back: '#5f7a33', belly: '#ffd45c', fin: '#e07f2a', accent: '#3a4a1f', pattern: 'bars' },
      facts: [
        'Yellow perch wear six or seven dark bars down their golden sides, which helps them hide among the reeds.',
        'They swim about in schools, so where you find one there are usually plenty more.'
      ]
    },
    {
      id: 'goldfish', name: 'Goldfish', rarity: 2, value: 34, shadow: 1, size: 0.7,
      waters: ['pond'], times: ['any'], measure: '8 inches long',
      art: { shape: 'goldfish', back: '#f08a2a', belly: '#ffd08a', fin: '#ff9f4a', accent: '#c25a18', pattern: 'plain' },
      facts: [
        'Goldfish do not have three-second memories. That is a myth: they can be taught tricks and still remember them months later.',
        'A goldfish is a kind of carp. Wild ones are a plain greeny-brown, and the golden colour was bred by people long ago in China.',
        'A goldfish in a pond can live for decades, far longer than one in a little bowl.'
      ]
    },
    {
      id: 'bass', name: 'Largemouth Bass', rarity: 3, value: 65, shadow: 4, size: 1.3,
      waters: ['pond', 'river'], times: ['morning', 'day', 'evening'], measure: '14 inches long',
      art: { shape: 'torpedo', back: '#4f6b3a', belly: '#e9edd8', fin: '#3f5730', accent: '#2b3a22', pattern: 'stripe' },
      facts: [
        'Its mouth really is enormous. The top jaw reaches back past its eye, which is how you tell it from a smallmouth bass.',
        'A bass does not bite its food so much as open that huge mouth and suck it in with a gulp of water.'
      ]
    },
    {
      id: 'carp', name: 'Common Carp', rarity: 3, value: 70, shadow: 4, size: 1.35,
      waters: ['pond', 'river'], times: ['any'], measure: '20 inches long',
      art: { shape: 'carp', back: '#8a7a3f', belly: '#e2d9a8', fin: '#6b5d2f', accent: '#4a4020', pattern: 'scales' },
      facts: [
        'Carp have two pairs of whiskery barbels by their mouth that they use to feel for food in the mud.',
        'They root around in the bottom like underwater pigs, which is why a pond full of carp often looks cloudy.',
        'A common carp can live twenty years or more, and keeps growing heavier the whole time.'
      ]
    },
    {
      id: 'catfish', name: 'Brown Bullhead', rarity: 3, value: 60, shadow: 3, size: 1.15,
      waters: ['pond', 'river'], times: ['evening', 'night'], measure: '12 inches long',
      art: { shape: 'catfish', back: '#6b4a2f', belly: '#e6dcc0', fin: '#523823', accent: '#2f2015', pattern: 'mottle' },
      facts: [
        'Those whiskers are called barbels and they are covered in taste buds.',
        'In fact a catfish has taste buds all over its skin, so it can taste the water with its whole body. Handy in muddy water where you cannot see.',
        'Bullheads feed at night, so bring your rod to the pond after dark.'
      ]
    },
    {
      id: 'rainbow_trout', name: 'Rainbow Trout', rarity: 3, value: 80, shadow: 3, size: 1.15,
      waters: ['pond', 'stream', 'river'], times: ['morning', 'day'], measure: '14 inches long',
      art: { shape: 'torpedo', back: '#5f7f8a', belly: '#f2f0e4', fin: '#4f6b73', accent: '#e06f8f', pattern: 'speckle' },
      facts: [
        'A rainbow trout has a pink stripe down each side, which is where it gets its name.',
        'Trout like cold water with lots of oxygen in it. That is why you find them in chilly streams and deep, cool ponds.',
        'Some rainbow trout swim down to the sea, grow much bigger, and come back. Those ones are called steelhead.'
      ]
    },
    {
      id: 'brook_trout', name: 'Brook Trout', rarity: 4, value: 150, shadow: 3, size: 1.1,
      waters: ['stream', 'river'], times: ['morning', 'evening'], measure: '9 inches long',
      art: { shape: 'torpedo', back: '#4a6b4f', belly: '#f0a05c', fin: '#d2453f', accent: '#f2e9c8', pattern: 'worm' },
      facts: [
        'Brook trout are not really trout at all. They are char, a close cousin. In autumn the males turn a blazing orange underneath, with a bright white edge to their fins.',
        'The wiggly pale markings on their back look like little worms. Scientists really do call that pattern vermiculation.',
        'They like cold streams and spring-fed ponds, and they are easily startled.'
      ]
    },
    {
      id: 'koi', name: 'Koi', rarity: 4, value: 180, shadow: 4, size: 1.3,
      waters: ['pond'], times: ['any'], measure: '2 feet long',
      art: { shape: 'carp', back: '#f4f0e6', belly: '#ffffff', fin: '#ffd9c4', accent: '#e0533f', pattern: 'koi' },
      facts: [
        'Koi are a kind of carp. Farmers in Japan spotted the brightest ones in their ponds and bred them for their colours, starting about two hundred years ago.',
        'Every koi has its own pattern, like a fingerprint. Keepers can tell their fish apart at a glance.',
        'A well looked-after koi can live for decades, longer than most cats and dogs.'
      ]
    },
    {
      id: 'pike', name: 'Northern Pike', rarity: 4, value: 200, shadow: 5, size: 1.55,
      waters: ['pond', 'river'], times: ['day', 'evening'], measure: '2 feet long',
      art: { shape: 'pike', back: '#4f6b33', belly: '#ecebd2', fin: '#e08a3a', accent: '#cfe0a8', pattern: 'dashes' },
      facts: [
        'A pike has a long flat snout like a duck bill, and a mouth full of very sharp teeth.',
        'It hangs perfectly still in the weeds and then explodes forward to grab whatever swims past.',
        'Pike can go from a standstill to a lunge in a blink, which is why smaller fish keep well away from weed beds.'
      ]
    },
    {
      id: 'sturgeon', name: 'Lake Sturgeon', rarity: 5, value: 420, shadow: 5, size: 1.85,
      waters: ['pond', 'river'], times: ['any'], measure: '4 feet long',
      art: { shape: 'sturgeon', back: '#5a5f6b', belly: '#ded9c8', fin: '#474c56', accent: '#8a8f9a', pattern: 'scutes' },
      facts: [
        'Sturgeon were swimming about while the dinosaurs were alive. They still have the same armoured, pointy-nosed shape their ancestors had.',
        'Instead of scales they wear rows of bony plates called scutes, like armour.',
        'A sturgeon has no teeth at all. It hoovers food off the bottom with a mouth that sticks out like a tube.',
        'Lake sturgeon grow slowly and live a very long time. The big old ones can reach a hundred years, older than anyone in your family.'
      ]
    }
,
    /* ---------- the stream and the river ---------- */
    {
      id: 'creek_chub', name: 'Creek Chub', rarity: 1, value: 12, shadow: 1, size: 0.65,
      waters: ['stream', 'river'], times: ['day'], measure: '6 inches long',
      art: { shape: 'minnow', back: '#6b7a8a', belly: '#f0f0e6', fin: '#9aa8b4', accent: '#3a444e', pattern: 'line' },
      facts: [
        'A father creek chub builds a nest by carrying small stones in his mouth, one at a time, and piling them into a little ridge.',
        'Creek chubs need moving water to lay their eggs, so they live in small creeks and streams.',
        'They do their eating during the day, once the water has warmed up a bit.'
      ]
    },
    {
      id: 'smallmouth', name: 'Smallmouth Bass', rarity: 3, value: 75, shadow: 4, size: 1.25,
      waters: ['stream', 'river'], times: ['morning', 'day'], measure: '16 inches long',
      art: { shape: 'torpedo', back: '#8a7440', belly: '#f0e8cc', fin: '#6b5a2f', accent: '#4a3f22', pattern: 'bars' },
      facts: [
        'The father bass fans out a round nest in the gravel and then stands guard over the babies.',
        'Crayfish are one of a smallmouth bass’s favourite meals.',
        'It hunts by sight, so it needs clear, clean, cool water to live in.'
      ]
    },
    {
      id: 'sculpin', name: 'Mottled Sculpin', rarity: 2, value: 30, shadow: 1, size: 0.7,
      waters: ['stream'], times: ['night'], measure: '3 inches long',
      art: { shape: 'sculpin', back: '#6b5f4a', belly: '#e0d8c0', fin: '#8a7a5c', accent: '#3a3226', pattern: 'mottle' },
      facts: [
        'Sculpins have no swim bladder, the little air balloon most fish use to float, so they rest right on the bottom.',
        'A sculpin can change colour to match the stones it is sitting on.',
        'It comes out to hunt at night, when the stream is dark and quiet.'
      ]
    },
    {
      id: 'crayfish', name: 'Crayfish', rarity: 2, value: 34, shadow: 2, size: 0.9,
      waters: ['stream', 'river'], times: ['night'], measure: '4 inches long',
      art: { shape: 'crayfish', back: '#a8503a', belly: '#e8b48a', fin: '#8a3a28', accent: '#4a1f16', pattern: 'plain' },
      facts: [
        'When a crayfish grows too big for its shell, it wriggles right out of it and grows a brand new one.',
        'If it loses a claw, it can slowly grow another, though the new one is often a little smaller.',
        'It escapes danger by flipping its tail and shooting backwards through the water.'
      ]
    },
    {
      id: 'eel', name: 'American Eel', rarity: 4, value: 190, shadow: 4, size: 1.5,
      waters: ['stream', 'river', 'estuary', 'sea'], times: ['night'], measure: '3 feet long',
      art: { shape: 'eel', back: '#4a4a3a', belly: '#d8d0a8', fin: '#3a3a2c', accent: '#22221a', pattern: 'plain' },
      facts: [
        'Every American eel is born far out in the Sargasso Sea, then drifts to shore and swims up the rivers to grow up.',
        'It hunts at night and spends the day tucked away under plants and driftwood.',
        'Some eels live more than forty years before making the long journey back out to sea.'
      ]
    },
    {
      id: 'chinook', name: 'Chinook Salmon', rarity: 5, value: 460, shadow: 5, size: 1.8,
      waters: ['stream', 'river', 'estuary', 'sea'], times: ['any'], measure: '3 feet long',
      art: { shape: 'salmon', back: '#4a6b7a', belly: '#f0efe4', fin: '#3a5560', accent: '#2b3a42', pattern: 'speckle' },
      facts: [
        'The chinook is the biggest kind of Pacific salmon, which is why people call it the king salmon.',
        'It hatches in a river, swims out to the ocean to grow up, and then comes back to the very stream where it was born.',
        'The mother salmon digs a nest in the gravel called a redd, and lays her eggs safely inside it.'
      ]
    },

    /* ---------- Gull Inlet, where the river meets the sea ---------- */
    {
      id: 'striped_bass', name: 'Striped Bass', rarity: 4, value: 210, shadow: 5, size: 1.55,
      waters: ['river', 'estuary', 'sea'], times: ['any'], measure: '30 inches long',
      art: { shape: 'torpedo', back: '#5a6b7a', belly: '#f2f2ea', fin: '#48555f', accent: '#2b333a', pattern: 'stripe' },
      facts: [
        'A striped bass has seven or eight dark stripes running along each side, from its gills all the way to its tail.',
        'It lives in the ocean and the bays, but every spring it swims up into fresh water to lay its eggs.',
        'A striped bass can live to be thirty years old.'
      ]
    },
    {
      id: 'flounder', name: 'Summer Flounder', rarity: 3, value: 95, shadow: 4, size: 1.3,
      waters: ['estuary', 'sea'], times: ['morning', 'day'], measure: '2 feet long',
      art: { shape: 'flatfish', back: '#8a7a5a', belly: '#efe8d4', fin: '#6b5f46', accent: '#4a4030', pattern: 'spots' },
      facts: [
        'A flounder is born looking like any other fish, and then one eye slowly travels over its head until both eyes are on the same side.',
        'It can change colour to match the sand, which is why people call it the chameleon of the sea.',
        'It hides in the sand and waits for dinner to swim past.'
      ]
    },
    {
      id: 'blue_crab', name: 'Blue Crab', rarity: 2, value: 55, shadow: 2, size: 1.0,
      waters: ['estuary'], times: ['any'], measure: '6 inches across',
      art: { shape: 'seacrab', back: '#3f6ba8', belly: '#e8e2c8', fin: '#2b4a78', accent: '#d24a3a', pattern: 'plain' },
      facts: [
        'Its two back legs are shaped like paddles, so a blue crab can really swim rather than only walk.',
        'To grow bigger it has to shed its whole hard shell and grow a new one.',
        'A grown-up female blue crab has bright red tips on her claws, like painted fingernails.'
      ]
    },

    /* ---------- the open sea ---------- */
    {
      id: 'mackerel', name: 'Atlantic Mackerel', rarity: 1, value: 26, shadow: 2, size: 0.9,
      waters: ['sea'], times: ['morning', 'day'], measure: '14 inches long',
      art: { shape: 'torpedo', back: '#3f6b8a', belly: '#f2f4ee', fin: '#2f5570', accent: '#1f3348', pattern: 'wavy' },
      facts: [
        'A mackerel’s back is covered in twenty to thirty wavy dark stripes, like ripples drawn on with a brush.',
        'They swim in big schools near the top of the water.',
        'Mackerel travel long distances every year between their summer and winter homes.'
      ]
    },
    {
      id: 'sea_bass', name: 'Black Sea Bass', rarity: 2, value: 60, shadow: 3, size: 1.1,
      waters: ['sea', 'estuary'], times: ['morning', 'day'], measure: '18 inches long',
      art: { shape: 'sunfish', back: '#3a3f4a', belly: '#8a93a0', fin: '#2b303a', accent: '#5a8ad2', pattern: 'speckle' },
      facts: [
        'Nearly every black sea bass starts life as a female, and later turns into a male.',
        'In spawning season the biggest males turn bright blue and grow a blue bump on their heads.',
        'They like to live around shipwrecks, reefs and old oyster beds.'
      ]
    },
    {
      id: 'cod', name: 'Atlantic Cod', rarity: 3, value: 120, shadow: 4, size: 1.4,
      waters: ['sea'], times: ['any'], measure: '3 feet long',
      art: { shape: 'cod', back: '#7a8a5f', belly: '#f0eeda', fin: '#5f6b48', accent: '#4a5236', pattern: 'speckle' },
      facts: [
        'An Atlantic cod has a little whisker under its chin, rather like a catfish.',
        'It lives down near the ocean floor, along rocky slopes and ledges.',
        'An Atlantic cod can live more than twenty years.'
      ]
    },
    {
      id: 'snapper', name: 'Red Snapper', rarity: 3, value: 140, shadow: 3, size: 1.2,
      waters: ['sea'], times: ['morning', 'day'], measure: '2 feet long',
      art: { shape: 'sunfish', back: '#c8402f', belly: '#f6d8c4', fin: '#a82f22', accent: '#e8e2d0', pattern: 'plain' },
      facts: [
        'A red snapper’s red colour gets deeper the deeper down it lives.',
        'It likes to hang around reefs, ledges and underwater caves.',
        'Some red snapper have lived more than fifty years.'
      ]
    },
    {
      id: 'halibut', name: 'Atlantic Halibut', rarity: 4, value: 320, shadow: 5, size: 1.9,
      waters: ['sea'], times: ['any'], measure: 'over 6 feet long',
      art: { shape: 'flatfish', back: '#5a5f56', belly: '#eeeade', fin: '#464b44', accent: '#33372f', pattern: 'mottle' },
      facts: [
        'The Atlantic halibut is the biggest flatfish in the whole world.',
        'Like other flatfish it has both eyes on one side, and for a halibut that is always the right side.',
        'It grows very slowly and can live to be fifty years old.'
      ]
    },
    {
      id: 'mola', name: 'Ocean Sunfish', rarity: 5, value: 620, shadow: 5, size: 2.1,
      waters: ['sea'], times: ['morning', 'day'], measure: '6 feet across',
      art: { shape: 'mola', back: '#8a95a0', belly: '#e2e6ea', fin: '#6b757f', accent: '#4a525a', pattern: 'plain' },
      facts: [
        'An ocean sunfish looks like a giant swimming head, because it has no real tail at all, just a frilly edge at the back.',
        'It mostly eats jellyfish, and a slippery lining inside keeps it from being stung.',
        'It likes to lie over on its side at the surface of the open ocean, soaking up the sun.'
      ]
    }
  ];

  /* Not everything on the end of the line is a fish. */
  GG.JUNK = [
    { id: 'boot', name: 'Old Boot', value: 3, shadow: 2, size: 1,
      art: { shape: 'boot' }, line: 'An old boot. Somebody is walking home with one wet sock.' },
    { id: 'can', name: 'Tin Can', value: 3, shadow: 1, size: 0.9,
      art: { shape: 'can' }, line: 'A rusty tin can. Good job fishing it out, the pond is tidier now.' },
    { id: 'newspaper', name: 'Soggy Newspaper', value: 3, shadow: 2, size: 1,
      art: { shape: 'news' }, line: 'A soggy newspaper. The headline has gone all runny.' }
  ];

  GG.FISH_BY_ID = {};
  GG.FISH.forEach(function (f, i) { f.index = i; f.isFish = true; GG.FISH_BY_ID[f.id] = f; });
  GG.JUNK.forEach(function (j) { j.isJunk = true; j.rarity = 1; GG.FISH_BY_ID[j.id] = j; });

  GG.WATER_NAMES = {
    pond: 'the Lily Pond', stream: 'Pebble Stream', river: 'the Winding River',
    estuary: 'Gull Inlet', sea: 'the open sea'
  };

  GG.SHADOW_NAMES = ['', 'tiny', 'small', 'medium', 'large', 'huge'];
})(window.GG = window.GG || {});
