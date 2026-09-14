/* Who eats whom.

   Guin asked for a food chain, so here it is - but nothing in this game is
   ever eaten. A hunter creeps up on something it really would hunt in the
   wild, the other one bolts, and it always gets away. She can watch the chase
   and read the truth of it in the books without ever losing a creature she
   caught.

   Two rules of her own, kept exactly as she wrote them: a friend you have
   tamed never hunts anything, and friends never hunt each other.

   Every pairing below was checked against university extension services,
   state and federal wildlife agencies (NOAA, state DNRs), Animal Diversity
   Web and museum sources. Nymph and larva stages count as the animal itself,
   which is why the dragonfly hunts minnows and the firefly hunts snails.

   Deliberately NOT here, because they are the pairings people assume and get
   wrong: crane flies do not eat mosquitoes, water boatmen are not hunters
   (that is the backswimmer), millipedes and pill bugs eat dead leaves,
   ladybugs do not eat ants, hermit crabs and dung beetles are not hunters,
   butterflies never eat other insects, and nothing safely eats a monarch. */
(function (GG) {
  'use strict';

  /* predator id -> everything it hunts */
  var EATS = {
    /* --- the orchard and the hills (v1.12) --- */
    yellowjacket: ['caterpillar', 'housefly', 'crane_fly', 'apple_maggot_fly', 'sap_beetle'],
    baldfaced_hornet: ['caterpillar', 'housefly', 'hoverfly', 'crane_fly', 'yellowjacket'],
    snakefly: ['aphid', 'caterpillar', 'leafhopper'],
    bee_fly: ['mason_bee'],
    cross_orbweaver: ['aphid', 'apple_maggot_fly', 'housefly', 'crane_fly', 'hoverfly',
      'mason_bee', 'sap_beetle', 'leafhopper'],
    ground_beetle: ['caterpillar', 'snail', 'earthworm'],
    jerusalem_cricket: ['earthworm', 'pillbug'],
    northern_scorpion: ['pinacate_beetle', 'grasshopper', 'stink_bug', 'cricket', 'ant'],
    windscorpion: ['ant', 'cricket', 'grasshopper', 'harvester_ant', 'silverfish'],
    velvet_ant: ['sweat_bee'],
    robber_fly: ['bumblebee', 'grasshopper', 'honeybee', 'housefly', 'hoverfly',
      'sweat_bee', 'mason_bee', 'damselfly', 'yellowjacket'],

    /* --- garden and woodland --- */
    ladybug: ['aphid'],
    lacewing: ['aphid'],
    hoverfly: ['aphid'],
    harvestman: ['aphid'],
    earwig: ['aphid'],
    assassin_bug: ['aphid', 'caterpillar', 'housefly', 'leafhopper'],
    wheel_bug: ['caterpillar', 'lanternfly', 'stink_bug'],
    mantis: ['bumblebee', 'cabbage_white', 'caterpillar', 'cicada', 'cricket',
      'garden_spider', 'grasshopper', 'honeybee', 'housefly', 'katydid', 'lanternfly'],
    garden_spider: ['bumblebee', 'cabbage_white', 'crane_fly', 'grasshopper', 'honeybee',
      'housefly', 'hoverfly', 'leafhopper', 'lanternfly'],
    antlion: ['ant'],
    tiger_beetle: ['ant', 'caterpillar', 'grasshopper'],
    ant: ['termite'],
    firefly: ['earthworm', 'snail'],
    centipede: ['cockroach', 'cricket', 'earthworm', 'earwig', 'garden_spider',
      'pillbug', 'silverfish'],
    paper_wasp: ['caterpillar'],
    sand_wasp: ['housefly'],

    /* --- on and above the water --- */
    dragonfly: ['cabbage_white', 'crane_fly', 'damselfly', 'housefly', 'hoverfly',
      'leafhopper', 'blue_butterfly', 'mayfly'],
    emperor_dragonfly: ['cabbage_white', 'caddisfly', 'crane_fly', 'damselfly', 'housefly',
      'mayfly', 'minnow'],
    damselfly: ['aphid', 'mayfly'],
    water_strider: ['housefly', 'mayfly'],
    whirligig: ['housefly', 'mayfly'],
    backswimmer: ['mayfly', 'boatman'],
    water_bug: ['backswimmer', 'crayfish', 'minnow', 'boatman'],
    dobsonfly: ['caddisfly', 'mayfly', 'minnow', 'mayfly_river', 'stonefly'],
    stonefly: ['mayfly', 'mayfly_river'],

    /* --- the beach and the rock pools --- */
    ghost_crab: ['sand_hopper'],
    shore_crab: ['limpet', 'periwinkle', 'sand_hopper'],
    anemone: ['hermit_crab', 'urchin', 'shore_crab'],
    sea_slug: ['anemone'],
    sea_star: ['anemone', 'limpet', 'periwinkle', 'urchin'],

    /* --- the fish --- */
    minnow: ['mayfly'],
    creek_chub: ['caddisfly', 'mayfly', 'minnow'],
    bluegill: ['caddisfly', 'damselfly', 'mayfly'],
    pumpkinseed: ['caddisfly', 'damselfly', 'mayfly'],
    crappie: ['mayfly', 'minnow'],
    perch: ['crayfish', 'mayfly', 'minnow'],
    bass: ['crappie', 'bluegill', 'crayfish', 'creek_chub', 'goldfish', 'minnow',
      'periodical_cicada', 'pumpkinseed', 'perch'],
    smallmouth: ['crayfish', 'creek_chub', 'mayfly', 'minnow', 'sculpin'],
    pike: ['crappie', 'bluegill', 'creek_chub', 'goldfish', 'minnow', 'pumpkinseed', 'perch'],
    crayfish: ['caddisfly', 'mayfly'],
    sculpin: ['caddisfly', 'mayfly', 'mayfly_river', 'stonefly'],
    rainbow_trout: ['caddisfly', 'crane_fly', 'dobsonfly', 'mayfly', 'minnow', 'sculpin',
      'mayfly_river', 'stonefly'],
    brook_trout: ['caddisfly', 'crane_fly', 'dobsonfly', 'mayfly', 'minnow', 'sculpin',
      'mayfly_river', 'stonefly'],
    catfish: ['caddisfly', 'crayfish', 'mayfly', 'minnow'],
    carp: ['caddisfly', 'mayfly'],
    sturgeon: ['caddisfly', 'crayfish', 'mayfly', 'minnow', 'mayfly_river'],
    eel: ['caddisfly', 'crayfish', 'creek_chub', 'mayfly', 'minnow'],
    chinook: ['caddisfly', 'mayfly'],

    /* --- out at sea --- */
    striped_bass: ['eel', 'mackerel', 'blue_crab', 'mayfly'],
    flounder: ['sea_bass', 'blue_crab'],
    sea_bass: ['blue_crab'],
    cod: ['mackerel', 'flounder'],
    halibut: ['cod']
  };

  GG.EATS = EATS;

  /* the other way round, worked out once */
  var EATEN_BY = {};
  Object.keys(EATS).forEach(function (pred) {
    EATS[pred].forEach(function (prey) {
      (EATEN_BY[prey] = EATEN_BY[prey] || []).push(pred);
    });
  });
  GG.EATEN_BY = EATEN_BY;

  GG.eatsList = function (id) { return EATS[id] || []; };
  GG.eatenByList = function (id) { return EATEN_BY[id] || []; };

  /* Does `pred` hunt `prey`? Friends never hunt, and never each other. */
  GG.hunts = function (predId, preyId) {
    if (!predId || !preyId || predId === preyId) return false;
    var e = EATS[predId];
    return !!e && e.indexOf(preyId) >= 0;
  };

  /* A creature's name, wherever it lives in the three books. */
  GG.creatureName = function (id) {
    var d = GG.BUG_BY_ID[id] || GG.FISH_BY_ID[id] || GG.ANIMAL_BY_ID[id];
    return d ? d.name : id;
  };

  /* "a ladybug, a lacewing and a hoverfly", or "a, b, c and 4 more" */
  GG.nameList = function (ids, max) {
    max = max || 6;
    var names = ids.slice(0, max).map(GG.creatureName);
    if (!names.length) return '';
    var extra = ids.length - names.length;
    if (extra > 0) return names.join(', ') + ' and ' + extra + ' more';
    if (names.length === 1) return names[0];
    var last = names.pop();
    return names.join(', ') + ' and ' + last;
  };
})(window.GG = window.GG || {});
