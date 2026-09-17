/* Guin's Garden - the fruit she can pick.

   Guin asked for "pluckable fruits that unlock a new decoration", so every
   fruit here unlocks one decoration the first time she picks it.

   Everything below was checked against WSU Tree Fruit and WSU Extension, the
   USDA Forest Service fire-effects database, the USDA Poisonous Plant Research
   Laboratory, NC State Extension and OSU Extension. Some of these are real
   food and some of them are genuinely not, so every fruit carries an `eat`
   rating and a `care` line, and the book shows it every single time:

     yes     - the ripe fruit is food
     careful - the fruit is food but part of the plant is not
     never   - do not eat this one at all

   Picking is always fine. Eating is the part that needs the truth. */
(function (GG) {
  'use strict';

  GG.FRUIT_EAT = {
    yes: { label: 'Good to eat', cls: 'eat-yes' },
    careful: { label: 'Careful', cls: 'eat-careful' },
    never: { label: 'Never eat this one', cls: 'eat-never' }
  };

  GG.FRUITS = [
    /* ---------- the Apple Orchard ---------- */
    {
      id: 'gala', name: 'Gala Apple', where: 'orchard', on: 'tree',
      shape: 'apple', skin: '#e8913a', skin2: '#d8452e', leaf: '#4f9450',
      measure: 'a small round apple', ripens: 'the end of August',
      eat: 'yes', unlock: 'appleplate',
      care: 'Give it a wash and eat the whole thing. The pips are the only bit to leave.',
      facts: [
        'Gala is the first really good eating apple of the year, and it is golden orange with red stripes running down it.',
        'Gala is Washington’s second biggest apple crop, after Red Delicious.',
        'An apple tree cannot make apples from its own pollen. It needs a different kind of apple tree nearby, and a bee to carry the pollen across.'
      ]
    },
    {
      id: 'red_delicious', name: 'Red Delicious Apple', where: 'orchard', on: 'tree',
      shape: 'apple', skin: '#b5241f', skin2: '#7d1412', leaf: '#4f9450',
      measure: 'a tall dark red apple', ripens: 'the middle of September',
      eat: 'yes', unlock: 'applecrate',
      care: 'Wash it first. Apple pips are best left in the core, not chewed.',
      facts: [
        'You can tell a Red Delicious upside down: it has five little points around the bottom, like a crown.',
        'It is still the apple Washington grows most of — about a third of the whole state’s crop — even though newer apples get more attention.',
        'Every Red Delicious in the world comes from one single tree that grew by accident on a farm in Iowa in the 1870s. All the rest are cuttings of it.'
      ]
    },
    {
      id: 'cosmic_crisp', name: 'Cosmic Crisp Apple', where: 'orchard', on: 'tree',
      shape: 'apple', skin: '#8e1f2a', skin2: '#5e1018', speck: true, leaf: '#4f9450',
      measure: 'a big dark red apple with pale freckles', ripens: 'late September',
      eat: 'yes', unlock: 'blossomspray',
      care: 'Wash it, then eat it. It keeps crisp in the fridge for a very long time.',
      facts: [
        'Cosmic Crisp was invented at Washington State University. Its other name is simply WA 38.',
        'It took more than twenty years of growing and tasting before anyone was allowed to buy one.',
        'The pale freckles all over its dark red skin are called lenticels, and they are how the apple breathes.'
      ]
    },
    {
      id: 'bing_cherry', name: 'Bing Cherry', where: 'orchard', on: 'tree',
      shape: 'cherry', skin: '#7d1224', skin2: '#4a0a16', leaf: '#4f9450',
      measure: 'two on one long stem', ripens: 'June and July',
      eat: 'careful', unlock: 'cherrybough',
      care: 'The red part is lovely. The stone in the middle is not food — eat around it and spit it out.',
      facts: [
        'Cherries hang in pairs off one long stem, which is why you so often pick two at a time.',
        'Washington grows about a hundred and forty-five thousand tonnes of sweet cherries a year, more than anywhere else in the country.',
        'The pale yellow and pink ones, called Rainier cherries, were bred at a research station in Prosser, Washington.'
      ]
    },
    {
      id: 'bartlett_pear', name: 'Bartlett Pear', where: 'orchard', on: 'tree',
      shape: 'pear', skin: '#b8cc52', skin2: '#8fa63a', leaf: '#4f9450',
      measure: 'a bell-shaped green pear', ripens: 'early August',
      eat: 'careful', unlock: 'pearbasket',
      care: 'A pear straight off the tree is rock hard. Take it home, let it soften for a few days, and then eat it.',
      facts: [
        'A pear is the one orchard fruit you must pick while it is still hard. Left to ripen on the tree it goes soft and mealy inside.',
        'Pears need a spell in the cold before they will ripen properly, which is why they go in the fridge first and the fruit bowl after.',
        'A Bartlett starts grass green and turns clear yellow when it is finally ready to eat.'
      ]
    },

    /* ---------- the berries along the edge of the orchard ----------
       Guin asked for pluckable berries in the orchard, so here they are: the
       brambles in the fence line, the currants and gooseberries at the end of
       a row, the strawberries down in the grass — and the one that climbs up
       through the blackberries and is not food at all. */
    {
      id: 'blackberry', name: 'Himalayan Blackberry', where: 'orchard', on: 'bramble',
      shape: 'bramble', skin: '#3d2545', skin2: '#180d20', glossy: true, leaf: '#4f7a45',
      measure: 'a bundle of shiny black beads, about as long as your thumbnail',
      ripens: 'late July and August',
      eat: 'yes', unlock: 'bramblearch',
      care: 'Good to eat, straight off the cane. Reach in slowly though — the prickles curve backwards, so they let you in and catch you on the way out.',
      facts: [
        'A blackberry is not one fruit. It is a bundle of tiny ones, and every little shiny bead has its own seed inside it.',
        'A blackberry keeps its core. The little white cone comes away with the fruit, which is why a blackberry is solid all the way through and a raspberry is hollow.',
        'One cane can run forty feet, arch straight over a fence, and put down roots wherever its nose touches the ground. That is how one bush becomes a whole hedge.',
        'This one came here from far away and it grows faster than the plants that were here first, so it crowds them out. Birds eat the berries and plant the seeds on fence posts. It is delicious, and it is in the wrong place — both of those are true at once.',
        'Count the leaflets on a leaf. Washington’s own wild blackberry has three. This one, the one from away, has five, and its leaves are pale grey underneath.'
      ]
    },
    {
      id: 'raspberry', name: 'Red Raspberry', where: 'orchard', on: 'cane',
      shape: 'bramble', skin: '#dc3a4e', skin2: '#9e1c30', thimble: true, leaf: '#6a9455',
      measure: 'a soft red thimble', ripens: 'late June and July, with more in late summer',
      eat: 'yes', unlock: 'berrypunnet',
      care: 'If you have to pull, it is not ready. A ripe raspberry slides off its little white core and into your hand all by itself.',
      facts: [
        'A raspberry is hollow because it leaves its core behind. Look at the cane after you pick one and the little white cone is still standing there.',
        'A raspberry is not really a berry either. It is dozens of tiny fruits, each with its own seed, packed together into a thimble.',
        'Whatcom County, right up in the corner of Washington, grows more red raspberries than anywhere else in the whole country.',
        'Its prickles are thin and straight, not hooked like a blackberry’s, so a raspberry cane is a much friendlier thing to reach into.'
      ]
    },
    {
      id: 'strawberry', name: 'Strawberry', where: 'orchard', on: 'ground',
      shape: 'straw', skin: '#e8332e', skin2: '#ae1a20', leaf: '#4f9450',
      measure: 'a red heart lying low in the grass', ripens: 'June',
      eat: 'yes', unlock: 'strawpatch',
      care: 'A strawberry grows lying on the dirt, so this is the one you always wash before you eat it.',
      facts: [
        'The little specks are not seeds. They are called achenes, and each one is a whole tiny fruit of its own, like a sunflower seed still in its shell.',
        'There are about two hundred of them on one medium strawberry. So one strawberry is really two hundred fruits, all riding along together.',
        'The red sweet part is not the fruit at all. It is the receptacle — the piece of the plant that holds the fruit up.',
        'A strawberry plant makes copies of itself. It throws a red string sideways across the ground, and where the string stops it puts down roots and becomes a whole new plant.'
      ]
    },
    {
      id: 'red_currant', name: 'Red Currant', where: 'orchard', on: 'bush',
      shape: 'strig', skin: '#e42f33', skin2: '#a4151c', clear: true, leaf: '#5f9450',
      measure: 'a dangling string of eight to thirty pea-sized berries',
      ripens: 'July and August',
      eat: 'yes', unlock: 'redstrig',
      care: 'Pick the whole dangling string at once and pull the berries off later. Pick them one at a time and you will squash every one.',
      facts: [
        'Currants hang in a string called a strig, swinging under the branch like a tiny bunch of grapes.',
        'A currant bush has no thorns at all. Its cousin the gooseberry has a spine beside every single leaf.',
        'Hold one up to the sun and you can see the seeds inside it. The skin really is that clear.',
        'The dried "currants" in a hot cross bun are not currants. They are tiny dried grapes from Corinth in Greece, and somebody muddled up the names hundreds of years ago.',
        'Currants and white pine trees can pass a disease back and forth, called white pine blister rust. It cannot finish growing up without both kinds of plant, so it goes pine, currant, pine.'
      ]
    },
    {
      id: 'gooseberry', name: 'Gooseberry', where: 'orchard', on: 'bush',
      shape: 'goose', skin: '#c9dc74', skin2: '#93b34a', clear: true, leaf: '#5f8f4a',
      measure: 'a plump grape-sized berry you can see through',
      ripens: 'July and August',
      eat: 'careful', unlock: 'goosebranch',
      care: 'The berry is proper food. The bush is the problem — there is a stiff spine beside every single leaf, so hold the branch with a folded-over sleeve and never with a bare hand.',
      facts: [
        'You can see through a gooseberry. Hold a ripe one up to the sun and the veins run down the skin like the lines on a beach ball.',
        'A gooseberry keeps getting sweeter after it is already ripe, so the last week of the season is the very best week.',
        'A gooseberry and a currant are the same kind of plant, both of them a Ribes. The gooseberry is the one that grew spines and gave up hanging its fruit in strings.',
        'Gooseberries never hang in strings. They sit on their own, or in twos and threes, on very short stalks tucked under the branch.',
        'An unripe one is rock hard and will pucker your whole mouth up. Wait until it softens and changes colour.'
      ]
    },
    {
      id: 'nightshade', name: 'Bittersweet Nightshade', where: 'orchard', on: 'vine',
      shape: 'nightshade', skin: '#d81f28', skin2: '#8c0f16', leaf: '#3f6f3c',
      measure: 'shiny little eggs, green and orange and red all at once',
      ripens: 'midsummer, and it hangs on into autumn',
      eat: 'never', unlock: 'nightvine',
      care: 'Pick it, look at it, put it in a tank — and do not eat it, not one single berry. These are poisonous, and the green ones are the worst of all.',
      facts: [
        'Nightshade climbs. It scrambles up through the blackberry brambles, so its berries end up dangling right beside berries that are good to eat.',
        'One little bunch has green ones, orange ones and red ones on it all at the same time. Almost nothing else in the hedge does that.',
        'Here is how you tell it from a currant. A currant dangles on a string, from a bush with no thorns and maple-shaped leaves. Nightshade climbs, and its flowers are purple stars with a small yellow beak poking out of the middle.',
        'Look at the bottom of a leaf and you will often find one or two little ear-shaped lobes sticking out sideways. That is the giveaway.',
        'It is in this book because it is poisonous, not in spite of it. Shiny and red and hanging in a bunch is not a promise.'
      ]
    },

    /* ---------- the Pebble Hills ---------- */
    {
      id: 'serviceberry', name: 'Saskatoon Serviceberry', where: 'hill', on: 'shrub',
      shape: 'berry', skin: '#4a3f7a', skin2: '#2e2752', crown: true, leaf: '#6a8f5a',
      measure: 'pea-sized, in little drooping bunches', ripens: 'July to September',
      eat: 'yes', unlock: 'berrybowl',
      care: 'Ripe ones are sweet and good. Pick only what you will eat and leave plenty for the birds.',
      facts: [
        'Look at the bottom of each berry and you will find a tiny five-pointed crown.',
        'It is in the same family as apples and pears, so a saskatoon berry is really a very small apple.',
        'It is usually the very first shrub on the whole hillside to flower in spring, and the white blossom lasts only about two weeks.'
      ]
    },
    {
      id: 'chokecherry', name: 'Chokecherry', where: 'hill', on: 'shrub',
      shape: 'spike', skin: '#3a1020', skin2: '#20080f', leaf: '#6a8f5a',
      measure: 'twenty or thirty on one hanging spike', ripens: 'late summer',
      eat: 'careful', unlock: 'chokespray',
      care: 'The soft outside is food and people have eaten it for thousands of years. Never crunch the stone and never chew the leaves — those parts are poisonous.',
      facts: [
        'Chokecherries hang in long dangling spikes of twenty or thirty, going green, then red, then almost black.',
        'They are called chokecherries because a ripe one still dries your mouth right out. Cooked with sugar they turn into wonderful jelly.',
        'The stones, the leaves and the stems all contain cyanide, and wilted leaves are the most dangerous of all. This is a real danger to horses and cattle, not a story.'
      ]
    },
    {
      id: 'rosehip', name: 'Wild Rose Hip', where: 'hill', on: 'shrub',
      shape: 'hip', skin: '#d84a2a', skin2: '#a32f18', leaf: '#6a8f5a',
      measure: 'a round orange-red hip', ripens: 'late summer, sweeter after a frost',
      eat: 'careful', unlock: 'hipring',
      care: 'The outside is good and full of vitamin C. Scrape the seeds out first — they are wrapped in fine stiff hairs that itch.',
      facts: [
        'A rose hip is what is left after a wild rose flower drops its petals. It is the fruit of the rose.',
        'Woods’ rose likes sunny slopes and rocky ravines, right up to six thousand feet in Washington.',
        'The hips often stay on the bare bush right through winter, long after every leaf has gone, which makes them easy to spot in the snow.'
      ]
    },
    {
      id: 'wax_currant', name: 'Wax Currant', where: 'hill', on: 'shrub',
      shape: 'berry', skin: '#e05a4a', skin2: '#b03828', glossy: true, leaf: '#7a9a68',
      measure: 'small round see-through red berries', ripens: 'August',
      eat: 'yes', unlock: 'currantsprig',
      care: 'Safe to eat, though rather bland on its own. It makes very good jam.',
      facts: [
        'Wax currant grows exactly where nothing else wants to: dry open slopes, ridges and bare rock outcrops in full sun.',
        'The berries are so thin-skinned you can almost see through them.',
        'Chickadees and other little birds strip the bushes, so the hillside currants rarely last long once they ripen.'
      ]
    },
    {
      id: 'snowberry', name: 'Snowberry', where: 'hill', on: 'shrub',
      shape: 'berry', skin: '#f4f2ee', skin2: '#d8d4cc', waxy: true, leaf: '#7a9a68',
      measure: 'waxy white berries in little bunches', ripens: 'autumn, and it stays all winter',
      eat: 'never', unlock: 'snowsprig',
      care: 'Pick it, look at it, put it in a tank — but do not eat it, not even one. Snowberries will make you sick.',
      facts: [
        'Snowberry breaks the rule that people think they know. Pretty white berries are not safe, and these ones are the poisonous part of the plant.',
        'They sit on the bare grey twigs all winter long after every leaf has gone, so the hillside gets little white dots in the snow.',
        'They will not kill you, but they will give you a very bad tummy ache, so the answer is always look and never taste.',
        'Birds eat them quite happily in late winter when nothing else is left, because birds are not people.'
      ]
    }
  ];

  GG.FRUIT_BY_ID = {};
  GG.FRUITS.forEach(function (f, i) { f.index = i; f.isFruit = true; GG.FRUIT_BY_ID[f.id] = f; });

  GG.FRUITS_WHERE = { orchard: 'the Apple Orchard', hill: 'the Pebble Hills' };

  /* what the thing it grows on is actually called, for the book page */
  GG.FRUIT_ON = {
    tree: 'a tree', shrub: 'a bush', bush: 'a bush',
    bramble: 'an arching bramble', cane: 'an upright cane',
    ground: 'a low plant on the ground', vine: 'a climbing vine'
  };
  GG.fruitOnName = function (def) {
    return (def && GG.FRUIT_ON[def.on]) || 'a bush';
  };

  /* every fruit unlocks exactly one decoration */
  GG.fruitForDecor = function (decorId) {
    for (var i = 0; i < GG.FRUITS.length; i++) {
      if (GG.FRUITS[i].unlock === decorId) return GG.FRUITS[i];
    }
    return null;
  };
})(window.GG = window.GG || {});
