/* Guin's Garden - v1.18: a lot more to pick.

   David asked for "considerably more pickables; fruits, vegetables, berries,
   flowers etc." So the orchard gets four more trees and a grape vine, the
   Farmyard and the Flower Garden get vegetable beds, every wild place gets the
   berry that really grows there, and the meadows, woods and hills get their
   own wildflowers.

   Every one of these was checked against WSU and OSU Extension, the USDA
   Forest Service, the National Park Service, Poison Control and the ASPCA.
   Several of them are not food, and a few are properly poisonous (baneberry,
   daffodil, foxglove, camas's lookalike), so the eat rating and the care line
   matter here more than anywhere else in the game.

   `where` can be a list now. `kind` is fruit, berry, veg or flower, and the
   Garden Book groups its pages by it. Each new one unlocks its own
   decoration: a basket, a punnet, a crate or a jar of it (pickdecor.js). */
(function (GG) {
  'use strict';

  function D(o) { o.autoDecor = true; o.unlock = 'pk_' + o.id; return o; }
  function FL(o) {
    o.kind = 'flower'; o.on = 'flower';
    o.skin = o.skin || o.petal; o.skin2 = o.skin2 || o.petal2;
    return D(o);
  }

  var MORE = [
    /* ---------- more for the Apple Orchard ---------- */
    D({
      id: 'redhaven_peach', name: 'Redhaven Peach', kind: 'fruit', where: 'orchard', on: 'tree',
      shape: 'peach', skin: '#f6a55a', skin2: '#d9493a', leaf: '#5a9a4c',
      measure: 'about as big as a baseball', ripens: 'late July and early August',
      eat: 'careful',
      care: 'Wash it and eat the juicy fruit, but never bite or crack the big stone in the middle.',
      facts: [
        'Redhaven was bred in Michigan and first sold in 1940. By the 1960s it was the most planted peach in the whole world.',
        'Peach growers still say when their other peaches ripen by counting the days before or after Redhaven.',
        'A nectarine is a peach without the fuzz. One single gene makes the difference.'
      ]
    }),
    D({
      id: 'apricot', name: 'Apricot', kind: 'fruit', where: 'orchard', on: 'tree',
      shape: 'peach', small: true, skin: '#f5a23c', skin2: '#e0762a', leaf: '#5a9a4c',
      measure: 'about as big as a golf ball', ripens: 'July',
      eat: 'careful',
      care: 'The soft orange fruit is food. Throw the stone away: the seed inside it is poisonous, so never crack it or chew it.',
      facts: [
        'Apricot trees flower very early, in February or March, so one frosty night can freeze every blossom and then there is no fruit that year.',
        'That early flowering is why hardly any farms grow apricots in Washington now, even though the summers are perfect for them. They are backyard trees here.',
        'The seed hidden inside the stone has a chemical that turns into poison inside you. Eat the fruit and toss the stone.'
      ]
    }),
    D({
      id: 'italian_plum', name: 'Italian Prune Plum', kind: 'fruit', where: 'orchard', on: 'tree',
      shape: 'plum', skin: '#5b3a7a', skin2: '#3e2656', leaf: '#4f9450',
      measure: 'about as long as your thumb, shaped like an egg', ripens: 'late August and September',
      eat: 'careful',
      care: 'Eat the sweet purple fruit and spit out the stone. It pops out easily.',
      facts: [
        'A prune is just a plum that dries well, and Italian prunes are one of the best kinds for drying.',
        'Around 1900, Clark County in Washington was called the Prune Capital of the World. It had more than forty wood-fired prune dryers.',
        'The whitish dust on a plum is a natural wax called bloom. It rubs off on your fingers when you hold it.'
      ]
    }),
    D({
      id: 'rainier_cherry', name: 'Rainier Cherry', kind: 'fruit', where: 'orchard', on: 'tree',
      shape: 'cherry', blush: true, skin: '#f4d36a', skin2: '#e2574a', leaf: '#4f9450',
      measure: 'about as big as a big marble', ripens: 'late June and July',
      eat: 'careful',
      care: 'Wash it and spit out the pit. Pick it gently, because Rainiers bruise very easily.',
      facts: [
        'The Rainier cherry was made in 1952 at the WSU research station in Prosser, Washington. That is only about thirty miles from Pasco.',
        'Its parents are two red cherries, Bing and Van, but the Rainier came out golden with a pink blush.',
        'Birds love Rainiers. The thin skin shows every bump, so they have to be picked and packed very gently.'
      ]
    }),
    D({
      id: 'concord_grape', name: 'Concord Grape', kind: 'fruit', where: 'orchard', on: 'vine',
      shape: 'grapes', skin: '#3f3470', skin2: '#2a2350', leaf: '#5a8a3c',
      measure: 'each grape is about as big as a marble', ripens: 'September and early October',
      eat: 'yes',
      care: 'Wash them and enjoy. Never give grapes to a dog: grapes can hurt a dog’s kidneys.',
      facts: [
        'A man called Ephraim Bull planted about twenty-two thousand seedlings in Concord, Massachusetts before he got this grape in 1849.',
        'Washington grows more Concord grapes than any other state, mostly in the Yakima Valley and near Burbank, right next to Pasco.',
        'It is a slip-skin grape: squeeze one and the inside pops right out of the skin.'
      ]
    }),

    /* ---------- vegetables: the Farmyard beds and the Flower Garden ---------- */
    D({
      id: 'carrot', name: 'Carrot', kind: 'veg', where: ['farmyard', 'garden'], on: 'veg',
      shape: 'carrot', skin: '#f08a2a', skin2: '#d4661a', leaf: '#4f9a3a',
      measure: 'about as long as your hand', ripens: 'July to October',
      eat: 'yes',
      care: 'Pull it up, brush off the dirt and wash it well before you crunch it.',
      facts: [
        'The very first farmed carrots were purple and yellow, not orange.',
        'Orange carrots were being grown hundreds of years ago, long before Dutch farmers made them famous.',
        'The story that orange carrots were made to honour a Dutch prince is a myth. Nobody has ever found any proof of it.'
      ]
    }),
    D({
      id: 'radish', name: 'Radish', kind: 'veg', where: ['farmyard', 'garden'], on: 'veg',
      shape: 'radish', skin: '#d8344a', skin2: '#f4ecec', leaf: '#4f9a3a',
      measure: 'about as big as a big marble', ripens: 'May and June, and again in the autumn',
      eat: 'yes',
      care: 'Wash it first, and get ready: a radish can taste spicy!',
      facts: [
        'Radishes are one of the fastest vegetables there is: from a seed to a crunchy radish in about a month.',
        'Radishes come in red, pink, white, purple, yellow and even green.',
        'In Oaxaca, in Mexico, people carve giant radishes into people and animals every December the 23rd, for a festival called the Night of the Radishes.'
      ]
    }),
    D({
      id: 'potato', name: 'Potato', kind: 'veg', where: 'farmyard', on: 'veg',
      shape: 'potato', skin: '#c49a62', skin2: '#a47a48', leaf: '#4f8a3a',
      measure: 'about as big as your fist', ripens: 'July for new potatoes, to October',
      eat: 'careful',
      care: 'Only eat potatoes cooked. Never eat green bits, sprouts, the leaves or the little green berries. Ask a grown-up.',
      facts: [
        'A potato is not a root. It is a swollen stem that grows under the ground.',
        'Potato plants grow little green berries that look like tiny tomatoes, and those are poisonous.',
        'Washington grows about one in every five potatoes in the whole country. Most of them become French fries, and lots come from the Columbia Basin near Pasco.'
      ]
    }),
    D({
      id: 'walla_walla_onion', name: 'Walla Walla Sweet Onion', kind: 'veg', where: 'farmyard', on: 'veg',
      shape: 'onion', skin: '#eadba0', skin2: '#c9ad62', leaf: '#6aa04a',
      measure: 'about as big as a softball', ripens: 'June to August',
      eat: 'yes',
      care: 'Peel off the papery skin and wash it. Keep onions away from dogs: onions make dogs sick.',
      facts: [
        'Around 1900 a French soldier called Peter Pieri brought onion seeds from the island of Corsica to Walla Walla.',
        'It has been Washington’s official state vegetable since 2007, after middle-school students campaigned for it.',
        'It is sweet because it has very little of the chemical that makes onions sting your eyes. It is also ninety-five percent water.'
      ]
    }),
    D({
      id: 'sweet_corn', name: 'Sweet Corn', kind: 'veg', where: 'farmyard', on: 'veg',
      shape: 'corn', skin: '#f2d24a', skin2: '#d8b030', leaf: '#5f9a3c',
      measure: 'about as long as your arm from elbow to wrist', ripens: 'late July to September',
      eat: 'yes',
      care: 'Peel off the husk and the silk. Corn is yummiest cooked, but fresh sweet corn can be eaten raw.',
      facts: [
        'Every thread of corn silk leads to one kernel. A kernel only grows if some pollen lands on its silk.',
        'The tassel at the very top is the corn’s pollen flower. The wind carries its pollen down to the silks.',
        'Washington grows some of the most sweet corn in the country for freezing and canning, and lots of it grows in the Columbia Basin.'
      ]
    }),
    D({
      id: 'snap_pea', name: 'Sugar Snap Pea', kind: 'veg', where: ['farmyard', 'garden'], on: 'veg',
      shape: 'peapod', skin: '#7cc04a', skin2: '#5a9a32', leaf: '#5a9a3a',
      measure: 'about as long as your finger', ripens: 'late May to early July',
      eat: 'yes',
      care: 'Wash it and eat the whole pod, crunchy shell and all. The sweet peas people grow as FLOWERS are different, and they are not food.',
      facts: [
        'Calvin Lamborn invented the sugar snap pea in Twin Falls, Idaho, by crossing a snow pea with a pea that had a thick pod.',
        'It won a top gardening prize, the All-America Selections award, in 1979.',
        'He named some of his later snap peas after his family, like Sugar Ann, for his daughter.'
      ]
    }),
    D({
      id: 'tomato', name: 'Tomato', kind: 'veg', where: ['farmyard', 'garden'], on: 'veg',
      shape: 'tomato', skin: '#e2402e', skin2: '#b82a20', leaf: '#4f8a3a',
      measure: 'about as big as a tennis ball', ripens: 'late July until the first frost',
      eat: 'yes',
      care: 'Wash it and eat the red fruit. The leaves and stems are not food.',
      facts: [
        'To a scientist a tomato is a fruit, because it grows from a flower and holds the seeds.',
        'In 1893 the United States Supreme Court decided that a tomato counts as a vegetable, for taxes.',
        'Tomatoes and potatoes are cousins, and their flowers look almost exactly the same.'
      ]
    }),
    D({
      id: 'zucchini', name: 'Zucchini', kind: 'veg', where: 'farmyard', on: 'veg',
      shape: 'zucchini', skin: '#3f7a34', skin2: '#2a5a24', leaf: '#4f8a3a',
      measure: 'best picked about as long as a new pencil', ripens: 'July to September',
      eat: 'yes',
      care: 'Wash it. If a zucchini ever tastes really bitter, spit it out and tell a grown-up.',
      facts: [
        'A zucchini plant has pollen flowers and fruit flowers. A bee has to carry pollen from one to the other before a zucchini can grow.',
        'The big yellow flowers are food too. Cooks pick them on the very day they open.',
        'Pick them often. A zucchini you miss can grow huge, tough and full of seeds.'
      ]
    }),
    D({
      id: 'pumpkin', name: 'Pumpkin', kind: 'veg', where: 'farmyard', on: 'veg',
      shape: 'pumpkin', skin: '#f08a24', skin2: '#d06a14', leaf: '#4f8a3a',
      measure: 'about as big as a basketball', ripens: 'September and October',
      eat: 'yes',
      care: 'Pumpkin is food when it is cooked, and so are the seeds when they are roasted. Never eat a carved pumpkin or a rotting one.',
      facts: [
        'Each pumpkin flower opens at dawn and closes by lunchtime. It gets one single morning for a bee to visit.',
        'Squash bees only visit squash and pumpkin flowers. Scientists first found them in the Pacific Northwest in 2016.',
        'The heaviest pumpkin ever weighed 2,819 pounds. That is heavier than a small car!'
      ]
    }),
    D({
      id: 'watermelon', name: 'Hermiston Watermelon', kind: 'veg', where: 'farmyard', on: 'veg',
      shape: 'melon', skin: '#3f8a3a', skin2: '#a8d070', leaf: '#4f8a3a',
      measure: 'bigger than a basketball', ripens: 'late July to September',
      eat: 'yes',
      care: 'Wash the outside before a grown-up cuts it. Swallowing a seed is fine: no melon will grow in your tummy!',
      facts: [
        'Hermiston is a town in Oregon, just across the Columbia River from Pasco, and it is famous for its melons.',
        'Hot days, cool nights and soft sandy soil are what make Hermiston melons so sweet.',
        'A watermelon is about ninety-two percent water.'
      ]
    }),
    D({
      id: 'asparagus', name: 'Asparagus', kind: 'veg', where: ['farmyard', 'garden'], on: 'veg',
      shape: 'spear', skin: '#7aa84a', skin2: '#9a6aa0', leaf: '#6aa04a',
      measure: 'about as long as a pencil', ripens: 'late March to June',
      eat: 'careful',
      care: 'Only the young spears are food. Later on the plant grows little red berries, and those are NOT food.',
      facts: [
        'On a warm spring day an asparagus spear can grow about two inches.',
        'One asparagus patch can keep making spears for fifteen years or more.',
        'There are about sixty asparagus farms within a hundred miles of the Tri-Cities.'
      ]
    }),

    /* ---------- wild berries, each in the place it really grows ---------- */
    D({
      id: 'red_huckleberry', name: 'Red Huckleberry', kind: 'berry', where: 'rainforest', on: 'wild',
      shape: 'berry', skin: '#e2402e', skin2: '#b82a20', leaf: '#6aa04a',
      measure: 'about as big as a pea', ripens: 'July and August',
      eat: 'yes',
      care: 'A tart, tasty wild berry. Only pick wild berries with a grown-up who knows the plant.',
      facts: [
        'Red huckleberries often grow right out of old rotting tree stumps.',
        'The bush can grow taller than a grown-up, up to about ten feet.',
        'Birds love the bright red berries, and they plant the seeds for the next bush.'
      ]
    }),
    D({
      id: 'black_huckleberry', name: 'Mountain Huckleberry', kind: 'berry', where: ['mountain', 'taiga'], on: 'wild',
      shape: 'berry', skin: '#3a2a52', skin2: '#22183a', leaf: '#5a8a4a',
      measure: 'about as big as a pea', ripens: 'the middle of August to the middle of September',
      eat: 'yes',
      care: 'Delicious! Pick only with a grown-up who knows the plant, and make some noise: bears love huckleberries too.',
      facts: [
        'Grizzly bears and black bears eat huckleberries, just like people do.',
        'Nobody has really managed to farm huckleberries, so nearly every one you eat was picked wild. WSU scientists are trying to grow them.',
        'In 1932 a Yakama chief and a forest ranger shook hands to keep part of Washington’s Sawtooth Berry Fields for Yakama berry pickers.'
      ]
    }),
    D({
      id: 'salmonberry', name: 'Salmonberry', kind: 'berry', where: 'rainforest', on: 'wild',
      shape: 'bramble', thimble: true, skin: '#f29a3a', skin2: '#e0602a', leaf: '#5aa04a',
      measure: 'about as big as the end of your thumb', ripens: 'May to July, one of the very first berries',
      eat: 'yes',
      care: 'Juicy but mild. The canes are prickly, so reach in gently, and pick with a grown-up.',
      facts: [
        'Salmonberries come in two colours, salmon-orange and red, on the same kind of bush.',
        'The flowers open in early spring, just as the rufous hummingbirds arrive to drink from them.',
        'Native peoples ate the berries, and the tender new shoots in spring too.'
      ]
    }),
    D({
      id: 'thimbleberry', name: 'Thimbleberry', kind: 'berry', where: ['glade', 'forest'], on: 'wild',
      shape: 'bramble', thimble: true, skin: '#d8342e', skin2: '#a82020', leaf: '#6aa84a',
      measure: 'fits on your fingertip like a thimble', ripens: 'July to September',
      eat: 'yes',
      care: 'Soft and sweet. It squishes easily, so pick it gently with a grown-up.',
      facts: [
        'The berry is hollow, so it sits on your fingertip like a sewing thimble.',
        'Unlike its bramble cousins, a thimbleberry has no prickles at all.',
        'Its big fuzzy leaves are so soft that hikers call them nature’s toilet paper.'
      ]
    }),
    D({
      id: 'salal', name: 'Salal', kind: 'berry', where: ['rainforest', 'forest'], on: 'wild',
      shape: 'berry', crown: true, skin: '#3a2a4a', skin2: '#1f1628', leaf: '#3f7a3a',
      measure: 'about as big as a pea', ripens: 'August and September',
      eat: 'yes',
      care: 'Pick only with a grown-up who knows the plant.',
      facts: [
        'Coast peoples dried salal berries into cakes to eat all winter.',
        'The name salal comes from Chinook Jargon, a trading language of the Northwest.',
        'Florists put salal leaves in bouquets, and thousands of people work picking them.'
      ]
    }),
    D({
      id: 'oregon_grape', name: 'Tall Oregon Grape', kind: 'berry', where: 'forest', on: 'wild',
      shape: 'strig', skin: '#4a5a9a', skin2: '#2f3a6a', leaf: '#4f7a3a',
      measure: 'about as big as a pea', ripens: 'late summer and autumn, after yellow flowers in spring',
      eat: 'careful',
      care: 'Very sour and full of seeds. The holly-like leaves are prickly, so pick carefully, with a grown-up.',
      facts: [
        'It is not a grape at all. It just has grape-like bunches of dusty blue berries.',
        'Its prickly leaves stay green all winter and look like holly.',
        'Oregon chose it as its state flower in 1899.'
      ]
    }),
    D({
      id: 'baneberry', name: 'Red Baneberry', kind: 'berry', where: 'forest', on: 'wild',
      shape: 'baneberry', skin: '#d8242a', skin2: '#2a1a14', leaf: '#4f8a3a',
      measure: 'about as big as a pea', ripens: 'the middle to the end of summer',
      eat: 'never',
      care: 'POISON. Look, but never eat. Shiny red berries are not always safe.',
      facts: [
        'The whole plant is poisonous, and the berries and the roots are the worst. Its poison works on the heart.',
        'The berries taste terribly bitter, which is a warning to leave them alone.',
        'Birds can eat them safely and spread the seeds, but people cannot. Never copy what a bird eats!'
      ]
    }),
    D({
      id: 'kinnikinnick', name: 'Kinnikinnick', kind: 'berry', where: ['tundra', 'mountain'], on: 'low',
      shape: 'berry', glossy: true, skin: '#d8342e', skin2: '#a82020', leaf: '#3f7a3a',
      measure: 'about as big as a pea', ripens: 'late summer, and then it stays on all winter',
      eat: 'yes',
      care: 'Safe, but dry and mealy: mostly food for bears and birds. Only nibble with a grown-up who knows it.',
      facts: [
        'Kinnikinnick is an Algonquian word that means mixture, because its leaves were mixed with tobacco.',
        'Its other name is bearberry, because bears eat it.',
        'Meriwether Lewis tasted one and wrote that it was tasteless and insipid!'
      ]
    }),
    D({
      id: 'crowberry', name: 'Black Crowberry', kind: 'berry', where: 'tundra', on: 'low',
      shape: 'berry', glossy: true, skin: '#1f1a24', skin2: '#0f0c12', leaf: '#4f7a3a',
      measure: 'smaller than a pea', ripens: 'late summer and autumn, and it stays on under the snow',
      eat: 'yes',
      care: 'Juicy but seedy. Only pick wild berries with a grown-up.',
      facts: [
        'Crowberries stay on the plant all winter, so people in Alaska can pick them again in spring.',
        'They taste sweeter after the first freeze.',
        'Alaska Native families mix them into akutaq, a traditional dessert a bit like ice cream.'
      ]
    }),
    D({
      id: 'blue_elderberry', name: 'Blue Elderberry', kind: 'berry', where: ['savanna', 'hill'], on: 'wild',
      shape: 'umbel', bloom: true, skin: '#4a5a8a', skin2: '#2e3a60', leaf: '#5a8a3a',
      measure: 'each berry as big as a peppercorn, the bunch as big as your hand', ripens: 'July to October',
      eat: 'careful',
      care: 'Never eat them raw! A grown-up must cook the ripe blue berries first. Stems, leaves and green berries are never food.',
      facts: [
        'Ripe berries have a white waxy coat that makes them look powder-blue.',
        'People have hollowed out the stems to make flutes and whistles.',
        'Raw elderberries have a chemical that can make you sick, but cooking makes the ripe berries safe for jam.'
      ]
    }),
    D({
      id: 'red_elderberry', name: 'Red Elderberry', kind: 'berry', where: 'rainforest', on: 'wild',
      shape: 'umbel', skin: '#d8342e', skin2: '#a82020', leaf: '#5a8a3a',
      measure: 'each berry as big as a peppercorn, in a bunch about as big as an egg', ripens: 'June and July',
      eat: 'never',
      care: 'Not for eating. The berries, seeds, stems and leaves can all make you sick.',
      facts: [
        'It blooms very early in spring, and hummingbirds and butterflies visit the flowers.',
        'Birds can strip a whole bush bare of its berries.',
        'Food scientists at Oregon State say to leave red elderberries alone, even for cooking. The seeds hold the most poison.'
      ]
    }),
    D({
      id: 'prickly_pear', name: 'Prickly Pear Fruit', kind: 'fruit', where: 'desert', on: 'wild',
      shape: 'tuna', skin: '#b8285a', skin2: '#7a1a3a', leaf: '#6a9a5a',
      measure: 'about as big as an egg', ripens: 'late summer',
      eat: 'careful',
      care: 'Do not touch! Tiny hair-spines stick in your skin. A grown-up takes them off with tongs and peels it.',
      facts: [
        'The fruit is called a tuna. Its tiny hair-spines, called glochids, are almost invisible and very hard to get out of your skin.',
        'A tiny bug called cochineal lives on prickly pears and makes a bright red colour. It takes about seventy thousand of them to make one kilogram of red dye!',
        'The big juicy ones come from further south. Washington has wild prickly pears too, but they are low and small, in dry sandy places.'
      ]
    }),
    D({
      id: 'wild_strawberry', name: 'Wild Strawberry', kind: 'berry', where: ['glade', 'meadow'], on: 'low',
      shape: 'straw', skin: '#e0302a', skin2: '#b01e1a', leaf: '#4f9a3a',
      measure: 'about as big as your fingernail', ripens: 'June and July',
      eat: 'yes',
      care: 'Tiny and sweet! Pick only with a grown-up who knows it.',
      facts: [
        'The seeds on a strawberry are really tiny fruits, each with a seed inside. One berry can wear about two hundred of them.',
        'Garden strawberries are a mix of two wild ones. One of them is the beach strawberry, which grows on Washington’s coast.',
        'That mix happened by accident, in France, in the 1700s.'
      ]
    }),

    /* ---------- flowers ---------- */
    FL({
      id: 'sunflower', name: 'Sunflower', where: ['farmyard', 'garden'],
      shape: 'daisy', petal: '#f6c62a', petal2: '#e0a018', centre: '#5a3a1a', stemCol: '#4f8a3a', big: true,
      measure: 'taller than a grown-up, with a head as big as a plate', ripens: 'July to September',
      eat: 'yes',
      care: 'The seeds are the food once they have dried. Crack off the hard shells first.',
      facts: [
        'A sunflower head is hundreds of tiny flowers. The middle alone can hold more than a thousand, all arranged in spirals.',
        'Young sunflowers follow the sun across the sky, and at night they turn back to face east.',
        'Grown-up sunflowers stay facing east. The morning sun warms them up, and bees like to visit warm flowers.'
      ]
    }),
    FL({
      id: 'tulip', name: 'Tulip', where: 'garden',
      shape: 'cup', petal: '#e0405a', petal2: '#b82a44', stemCol: '#4f8a3a',
      measure: 'a cup the size of an egg on a knee-high stem', ripens: 'April',
      eat: 'never',
      care: 'A flower for looking at, not eating. Wash your hands after. Tulips are poisonous to dogs and cats.',
      facts: [
        'Every April the Skagit Valley in Washington blooms with millions and millions of tulips. It is the biggest tulip festival in North America.',
        'Cut tulips keep on growing in a vase, sometimes an inch in a day!',
        'They bend towards the brightest light in the room.'
      ]
    }),
    FL({
      id: 'daffodil', name: 'Daffodil', where: ['garden', 'meadow'],
      shape: 'trumpet', petal: '#f8e27a', petal2: '#f0b020', stemCol: '#4f8a3a',
      measure: 'knee-high, with a trumpet flower about as wide as your palm', ripens: 'March and April',
      eat: 'never',
      care: 'POISON. Every part of it is poisonous. Look and smell only, and wash your hands after you touch it.',
      facts: [
        'Every part of a daffodil is poisonous, and the bulb is the worst.',
        'A daffodil bulb looks like an onion, but it does not smell like one.',
        'Daffodil sap has tiny needle-shaped crystals that make skin itchy, so flower sellers wear gloves.'
      ]
    }),
    FL({
      id: 'rose', name: 'Garden Rose', where: 'garden',
      shape: 'rose', petal: '#e0506a', petal2: '#b02a44', stemCol: '#3f7a3a',
      measure: 'a flower about as wide as your palm', ripens: 'June to September',
      eat: 'careful',
      care: 'Watch out for the prickles! The petals are only food if no garden sprays were ever used, so ask a grown-up.',
      facts: [
        'Apples, cherries, peaches and strawberries are all in the rose family!',
        'There is a rose bush in Hildesheim, in Germany, that is about seven hundred years old.',
        'That rose was bombed in 1945, but its roots lived on under the rubble, and it bloomed again.'
      ]
    }),
    FL({
      id: 'lavender', name: 'English Lavender', where: ['garden', 'farmyard'],
      shape: 'spike', petal: '#9a7ad8', petal2: '#6a4ab0', stemCol: '#7a9a6a',
      measure: 'a flower spike about as long as your finger', ripens: 'June and July',
      eat: 'careful',
      care: 'Smell it and let the bees visit. Cooks use a pinch in treats, but lavender oil is poison to drink. Keep it away from pets.',
      facts: [
        'Sequim, in Washington, calls itself the Lavender Capital of North America.',
        'Sequim gets less than half as much rain as Seattle, because the Olympic Mountains block the clouds. Lavender loves that.',
        'Lavender is poisonous to dogs, cats and horses.'
      ]
    }),
    FL({
      id: 'dandelion', name: 'Dandelion', where: ['meadow', 'garden'],
      shape: 'puff', petal: '#f8d02a', petal2: '#e8b020', stemCol: '#5a9a3a',
      measure: 'a flower about as big as a bottle cap', ripens: 'March to October, most of all in spring',
      eat: 'careful',
      care: 'The leaves and flowers can be food, but only where no weed spray was used and no dogs pee. Wash them first.',
      facts: [
        'Dandelion comes from the French dent de lion, which means lion’s tooth, because of its jagged leaves.',
        'Dandelions can make seeds without any pollen at all.',
        'Each fluffy seed flies away on its very own little parachute.'
      ]
    }),
    FL({
      id: 'foxglove', name: 'Foxglove', where: ['forest', 'glade'],
      shape: 'bells', petal: '#c05aa0', petal2: '#8a2a70', stemCol: '#4f8a3a',
      measure: 'a spike taller than you, with bells as big as your thumb', ripens: 'June and July',
      eat: 'never',
      care: 'POISON. Never eat any part of it. Wash your hands after you touch it.',
      facts: [
        'Foxglove came to America from Europe, and now it grows wild in the forest clearings of Washington.',
        'In 1785 a doctor called William Withering showed that foxglove could help sick hearts. Heart medicine still comes from it.',
        'Bumblebees crawl right inside the bells to reach the nectar.'
      ]
    }),
    FL({
      id: 'lupine', name: 'Broadleaf Lupine', where: ['mountain', 'meadow'],
      shape: 'spike', petal: '#6a6ad8', petal2: '#4a4ab0', stemCol: '#4f8a3a',
      measure: 'about knee-high', ripens: 'July and August in the mountains',
      eat: 'never',
      care: 'The seeds and pods are poisonous. Look only, and leave the wildflowers for the bees.',
      facts: [
        'Broadleaf lupine paints the meadows on Mount Rainier purple.',
        'Lupines make their own plant food, nitrogen, straight out of the air.',
        'After Mount St. Helens erupted in 1980, a little lupine cousin was one of the first plants to grow on the bare ash, and it helped make new soil.'
      ]
    }),
    FL({
      id: 'fireweed', name: 'Fireweed', where: ['glade', 'taiga'],
      shape: 'spike', petal: '#e05aa0', petal2: '#b03a7a', stemCol: '#6a4a5a',
      measure: 'often taller than you', ripens: 'June to September',
      eat: 'careful',
      care: 'Young shoots and flowers can be food, but only with a grown-up who knows it. Pick just a few.',
      facts: [
        'Fireweed is one of the first plants to grow back after a fire. It came back on Mount St. Helens the very summer it erupted.',
        'One plant can make about eighty thousand seeds, each with its own fluffy parachute.',
        'It even bloomed on the bombed ruins of London in the Second World War.'
      ]
    }),
    FL({
      id: 'camas', name: 'Common Camas', where: ['meadow', 'savanna'],
      shape: 'star', petal: '#6a70d8', petal2: '#4a50b0', centre: '#f0d060', stemCol: '#4f8a3a',
      measure: 'each star flower as wide as a quarter, on a knee-high stalk', ripens: 'April to June',
      eat: 'never',
      care: 'Never dig up camas or eat it. Poisonous death camas looks almost the same. Look only!',
      facts: [
        'Camas bulbs were an important food for Native peoples. The Nez Perce shared camas with Lewis and Clark in 1805.',
        'In June 1806 Lewis wrote that a blue camas meadow looked like lakes of fine clear water.',
        'Poisonous death camas looks so much like camas that people have been poisoned by mixing them up.'
      ]
    }),
    FL({
      id: 'oxeye_daisy', name: 'Oxeye Daisy', where: 'meadow',
      shape: 'daisy', petal: '#fbfbf4', petal2: '#e8e8e0', centre: '#f0c020', stemCol: '#4f8a3a',
      measure: 'a flower about as wide as a golf ball', ripens: 'May to August',
      eat: 'never',
      care: 'Not a snack. It is a weed in Washington, so picking lots of them is fine!',
      facts: [
        'Oxeye daisies came from Europe and Asia and spread all across Washington’s meadows.',
        'Their seeds can wait in the soil for thirty-eight years before they grow.',
        'It is against the law to sell them in Washington. If a cow eats them, they can spoil the taste of her milk.'
      ]
    }),
    FL({
      id: 'nasturtium', name: 'Nasturtium', where: 'garden',
      shape: 'round', petal: '#f0782a', petal2: '#d0401a', centre: '#f0c040', stemCol: '#5a9a3a',
      measure: 'a flower about as wide as a golf ball', ripens: 'June until the first frost',
      eat: 'yes',
      care: 'The leaves and flowers taste peppery. Only eat ones from your own garden that were never sprayed, and wash them. Keep them from pets.',
      facts: [
        'Nasturtiums come from the Andes Mountains in South America.',
        'The leaves, flowers and seeds are all food, and they all taste peppery. The seeds can be pickled like capers.',
        'Watercress has the scientific name Nasturtium, but garden nasturtiums are not related to it at all.'
      ]
    }),
    FL({
      id: 'arrowleaf_balsamroot', name: 'Arrowleaf Balsamroot', where: ['desert', 'hill'],
      shape: 'daisy', petal: '#f6c62a', petal2: '#e0a018', centre: '#d0a030', stemCol: '#8a9a7a',
      measure: 'a flower as wide as your palm, with leaves as long as your arm', ripens: 'April and May on the low hills near Pasco',
      eat: 'careful',
      care: 'People here once ate its roots and seeds, but it is not a snack for you. Pick just one or two: it is for the bees.',
      facts: [
        'Every spring balsamroot turns the hills yellow, including Badger Mountain by the Tri-Cities.',
        'Its root can be as thick as your hand and reach several feet down into the ground.',
        'Native peoples ground its seeds into flour and ate the young stems. Lewis and Clark wrote about it.'
      ]
    })
  ];

  /* the fruit that were already here get a kind too */
  var OLD_BERRIES = { serviceberry: 1, chokecherry: 1, wax_currant: 1, snowberry: 1, blackberry: 1,
    raspberry: 1, strawberry: 1, red_currant: 1, gooseberry: 1, nightshade: 1 };
  GG.FRUITS.forEach(function (f) {
    if (!f.kind) f.kind = OLD_BERRIES[f.id] ? 'berry' : 'fruit';
  });
  MORE.forEach(function (f) {
    if (GG.FRUIT_BY_ID[f.id]) return;   // never twice
    GG.FRUITS.push(f);
  });
  GG.FRUIT_BY_ID = {};
  GG.FRUITS.forEach(function (f, i) { f.index = i; f.isFruit = true; GG.FRUIT_BY_ID[f.id] = f; });

  /* the Garden Book's four shelves, in this order */
  GG.FRUIT_KINDS = [
    { id: 'fruit', name: 'Fruit' },
    { id: 'berry', name: 'Berries' },
    { id: 'veg', name: 'Vegetables' },
    { id: 'flower', name: 'Flowers' }
  ];
  GG.fruitsInBookOrder = function () {
    var out = [];
    GG.FRUIT_KINDS.forEach(function (k) {
      GG.FRUITS.forEach(function (f) { if (f.kind === k.id) out.push(f); });
    });
    GG.FRUITS.forEach(function (f) { if (out.indexOf(f) < 0) out.push(f); });
    return out;
  };

  var W = GG.FRUITS_WHERE;
  W.garden = 'the Flower Garden'; W.meadow = 'the Sunny Meadow'; W.forest = 'the Whispering Woods';
  W.glade = 'the Golden Glade'; W.mountain = 'Cloudtop Ridge'; W.taiga = 'the Spruce Taiga';
  W.tundra = 'the Lichen Tundra'; W.rainforest = 'the Mossy Rainforest'; W.desert = 'the Sagebrush Desert';
  W.savanna = 'the Oak Savanna'; W.farmyard = 'the Farmyard'; W.cherry = 'the Cherry Grove';
  W.dogpark = 'Dog’s Paradise';
  /* where it grows, in words, whether `where` is one place or a list */
  GG.fruitWhereName = function (def) {
    var list = Array.isArray(def.where) ? def.where : [def.where];
    var names = list.map(function (w) { return W[w] || w; });
    if (names.length < 2) return names[0] || 'the garden';
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  };
  GG.fruitGrowsIn = function (def, place) {
    return Array.isArray(def.where) ? def.where.indexOf(place) >= 0 : def.where === place;
  };

  var ON = GG.FRUIT_ON;
  ON.veg = 'a vegetable bed'; ON.wild = 'a wild bush'; ON.low = 'a low plant on the ground';
  ON.flower = 'its own stem';
  /* a prickly pear is a cactus, not a bush */
  var oldOn = GG.fruitOnName;
  GG.fruitOnName = function (def) {
    if (def && def.shape === 'tuna') return 'a cactus pad';
    if (def && def.on === 'wild' && def.shape === 'bramble') return 'an upright cane';
    return oldOn(def);
  };
})(window.GG = window.GG || {});
