/* Who eats whom.

   Guin asked for a food chain, so here it is - but nothing in this game is
   ever eaten. A hunter creeps up on something it really would hunt in the
   wild, the other one bolts, and it always gets away. She can watch the chase
   and read the truth of it in the books without ever losing a creature she
   caught.

   One rule of her own, kept exactly as she wrote it: friends can never hunt
   friends. Since v1.13 the friends do hunt - each one goes after what it
   really eats and nothing else - and a friend that spots another friend sits
   down and watches instead.

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
    black_widow: ['ant', 'harvester_ant', 'cricket', 'grasshopper', 'pinacate_beetle',
      'pillbug', 'cockroach', 'silverfish'],

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

    /* --- the six new places (v1.13) --- */
    /* the tundra's top hunter, and what it really lives on */
    arctic_wolf_spider: ['snow_flea', 'arctic_springtail'],
    wolf_spider: ['ant', 'cricket', 'grasshopper', 'pallid_grasshopper', 'harvester_ant',
      'silverfish', 'jumping_spider', 'thatching_ant'],
    /* it picks up what the wind blew onto the snow and left too cold to move */
    ice_crawler: ['snow_fly', 'snow_flea', 'snow_scorpionfly'],
    four_spot_skimmer: ['arctic_mosquito', 'crane_fly', 'mayfly', 'housefly'],
    hudsonian_whiteface: ['arctic_mosquito', 'crane_fly', 'housefly'],
    /* it does not sit and wait. It runs its dinner down across bare ground. */
    ground_mantis: ['housefly', 'ant', 'pallid_grasshopper', 'thatching_ant', 'harvester_ant'],
    /* she sits still on a flower and takes whatever lands, bumblebees included */
    crab_spider: ['bumblebee', 'hoverfly', 'honeybee', 'sweat_bee', 'mason_bee',
      'leafcutter_bee', 'cabbage_white', 'woodland_skipper'],
    jumping_spider: ['housefly', 'ant', 'leafhopper', 'aphid', 'caterpillar', 'crab_spider'],
    /* long thin head and neck, for reaching down inside a shell */
    snail_beetle: ['banana_slug', 'sideband_snail', 'snail', 'earthworm', 'garden_spider'],
    /* she smells the fungus the grub is eating, then drills through the wood */
    giant_ichneumon: ['western_horntail'],
    /* the click beetle's own grub is the hunter, down inside the dead wood */
    click_beetle: ['pine_beetle', 'whitespotted_sawyer', 'alder_borer'],
    thatching_ant: ['aphid', 'caterpillar', 'housefly'],
    folding_door_spider: ['cricket', 'ground_beetle', 'pillbug', 'yellow_millipede'],

    /* --- out at sea --- */
    striped_bass: ['eel', 'mackerel', 'blue_crab', 'mayfly'],
    flounder: ['sea_bass', 'blue_crab'],
    sea_bass: ['blue_crab'],
    cod: ['mackerel', 'flounder'],
    halibut: ['cod']
  };

  /* v1.15 - the cherry and bamboo grove newcomers (WSU Tree Fruit, PNW
     Handbooks, BugGuide, Penn State, Colorado State Extension) */
  [
    ['earwig', ['spotted_wing_drosophila']],          // eats the pupae in the soil
    ['paper_wasp', ['tent_caterpillar', 'leafroller', 'lorquins_admiral']],
    ['yellowjacket', ['tent_caterpillar']],
    ['crab_spider', ['lorquins_admiral', 'mining_bee']],
    ['lacewing', ['bamboo_mite', 'leafroller']],
    ['ground_beetle', ['leopard_slug', 'garden_springtail']],
    ['centipede', ['garden_springtail']],
    ['harvestman', ['garden_springtail']],
    ['grass_carrying_wasp', ['cricket', 'katydid']],
    ['woodlouse_spider', ['pillbug', 'earwig', 'millipede']],
    ['zebra_jumper', ['bamboo_aphid', 'housefly', 'aphid']]
  ].forEach(function (row) {
    var list = EATS[row[0]] = EATS[row[0]] || [];
    row[1].forEach(function (prey) { if (list.indexOf(prey) < 0) list.push(prey); });
  });

  GG.EATS = EATS;

  /* The other way round, worked out once. The friends' own prey lists live in
     animals.js and are folded in here too, so a caterpillar's page knows that
     a chickadee is looking for it - without putting any animal into EATS,
     which is what keeps `GG.hunts` a bug-and-fish question. */
  var EATEN_BY = {};
  Object.keys(EATS).forEach(function (pred) {
    EATS[pred].forEach(function (prey) {
      (EATEN_BY[prey] = EATEN_BY[prey] || []).push(pred);
    });
  });
  if (GG.ANIMAL_HUNTS) {
    Object.keys(GG.ANIMAL_HUNTS).forEach(function (pred) {
      GG.ANIMAL_HUNTS[pred].forEach(function (prey) {
        var list = (EATEN_BY[prey] = EATEN_BY[prey] || []);
        if (list.indexOf(pred) < 0) list.push(pred);
      });
    });
  }
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
