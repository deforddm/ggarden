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
     songbird    - fill the feeder, or put up a box, then go a long way back
     snake       - stand still with your hands down and let it go past
     bear, moose, rattlesnake
                 - back away slowly. You make friends with these three by
                   leaving them alone, because that is the only kind thing
                   there is to do with them.
     cow, sheep, chicken
                 - ask the farmer, come from the side, wash your hands
     horse       - ask the owner, speak first, come to the shoulder
     panda, koala, ocelot, red panda, axolotl
                 - visit them where people look after them, quietly

   Every fact was checked against Cornell Lab, the National Park Service, state
   wildlife agencies, the Washington Department of Fish and Wildlife, the Burke
   Museum, the CDC, university extension services, Bat Conservation
   International, the AKC, the Cat Fanciers' Association, the Australian
   Museum, Animal Diversity Web and peer-reviewed papers. The `manners` line on
   each one is the real-world advice, and it is shown every single time she
   makes that friend.

   WHERE AN ANIMAL REALLY LIVES IS PART OF THE TRUTH. Several friends in here
   do not live anywhere near the Tri-Cities, and every one of those pages says
   so in its first fact: the black bear (everywhere in Washington except the
   dry middle of the Columbia Basin, which is exactly here), the moose (a
   hundred and seventy miles away in the Selkirks), the eastern fox squirrel
   (brought here and let loose in the early 1900s), and the five that live on
   other continents. Nothing is quietly left out and nothing is pretended.

   AND ONE FRIEND IS NEVER TOUCHED. The Western Rattlesnake is `lookOnly`,
   exactly like the black widow in the Bug Book: `value: 0`, a `danger` line
   shown every time, and meeting her is what opens her page. She is the only
   venomous snake in Washington and she lives right here.

   At the bottom of this file are three more tables, all of them checked the
   same way:

     ANIMAL_HUNTS  - what each one really hunts, species by species. Nothing
                     else is ever chased. A hummingbird will go after a gnat
                     and never a dragonfly; a bat hunts in the air and never
                     on the ground; a goldfinch-ish seed-eater hunts nothing.
     ANIMAL_FORAGE - what the ones that do not hunt do instead. Parrots are
                     not hunters, and that is content, not a gap.
     FRIEND_RULE   - Guin's own rule: friends never hunt friends. These are
                     the places where the truth and the rule collide, and
                     what the animal does instead. She wrote the rule; the
                     garden keeps it, out loud.
     FRIEND_PLAY   - the one chase that is not a hunt. Guin asked for dogs to
                     chase squirrels, and it turns out a dog chasing a
                     squirrel is playing: the catching end of the hunt has
                     been bred out of most pet dogs, and the squirrel stops
                     halfway up the tree to scold rather than to hide. Her
                     rule survives without a scratch. */
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
    },

    /* The one that runs backwards. For the bear, the moose and the
       rattlesnake the honest answer is do not approach at all, so this is the
       method where standing your ground is the wrong move and going away is
       the right one. */
    backaway: {
      id: 'backaway', verb: 'Back slowly away', btn: 'BACK AWAY', sub: 'give it room',
      doing: 'Stepping slowly backwards…', waiting: 'Keep backing away…',
      blurb: 'Stop, stand tall, and step slowly backwards until it is a long way behind you. Never run towards it, and go and tell a grown-up.'
    },
    farmer: {
      id: 'farmer', verb: 'Ask the farmer', btn: 'ASK FARMER', sub: 'come from the side',
      doing: 'Asking the farmer…', waiting: 'Stand where she can see you…',
      blurb: 'Ask the farmer first, come from the side where the animal can see you, and wash your hands afterwards.'
    },
    shoulder: {
      id: 'shoulder', verb: 'Ask, then shoulder', btn: 'SHOULDER', sub: 'speak first',
      doing: 'Asking, then talking to her…', waiting: 'Stand at her shoulder…',
      blurb: 'Ask the owner, talk to her so she hears you coming, and walk to her shoulder from the side — never behind her, where she cannot see you.'
    },
    snakestill: {
      id: 'snakestill', verb: 'Stand very still', btn: 'HANDS OFF', sub: 'let it pass',
      doing: 'Standing very still…', waiting: 'Hands down, keep still…',
      blurb: 'Stand still with your hands to yourself and let the snake go where it was going.'
    },
    seedtray: {
      id: 'seedtray', verb: 'Fill the feeder', btn: 'FILL FEEDER', sub: 'then step back',
      doing: 'Filling up the feeder…', waiting: 'Step back and keep still…',
      blurb: 'Fill the feeder with black-oil sunflower seed, then walk a long way back, sit down and keep still.'
    },
    nestbox: {
      id: 'nestbox', verb: 'Put up a nest box', btn: 'NEST BOX', sub: 'watch from afar',
      doing: 'Fixing up the nest box…', waiting: 'Watch from far away…',
      blurb: 'Put up a nest box with no perch, long before spring, and then watch it from far off — never open a box with a family inside.'
    },
    visit: {
      id: 'visit', verb: 'Visit and keep quiet', btn: 'VISIT', sub: 'behind the rail',
      doing: 'Coming in quietly…', waiting: 'Quiet voice, stay back…',
      blurb: 'Stay behind the rail, keep your voice quiet, never tap the glass and never feed it. The rail is there for the animal as much as for you.'
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
        'She builds a nest the size of a walnut and glues it together with spider silk.',
        'Flowers cannot make a hummingbird. Sugar water has no protein and no fat in it at all, so half of what she does all day is hunting gnats, fruit flies, aphids and tiny caterpillars.',
        'She will hover at a spider\u2019s web and pick the little trapped flies out of it — and sometimes take the spider too.'
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
        'On cold nights it goes into a deep sleep and its heart slows right down.',
        'It hunts midges, whiteflies and leafhoppers, snatched out of the air or picked off the underside of a leaf.',
        'One Anna\u2019s Hummingbird was found with thirty-two leafhoppers in her tummy at the same time.'
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
        'It remembers exactly where a feeder was last year and comes back to check.',
        'Between visits to the feeder it hunts gnats and midges in mid-air, and picks aphids off plants one at a time.'
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
        'It does not chase its dinner. It sits very still and waits for dinner to come to it, then flicks out a sticky tongue.',
        'It almost never goes far from the water.',
        'Green Frogs really come from the eastern side of the country. People brought them west, and now a few Washington ponds have them — so this is a visitor, not a local.'
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
        'It is the biggest frog in the whole of the United States, and about twice the size of any frog that truly belongs in Washington.',
        'The males sing a deep "jug-o-rum" to say that this pond is theirs.',
        'Its babies can stay tadpoles for two whole winters before they turn into frogs.',
        'It comes from the eastern United States. People carried bullfrogs west about a hundred years ago, and here it is now a prohibited animal — nobody is allowed to let one loose. That is not the frog\u2019s fault. It is only doing what a bullfrog does, in a pond it was never meant to be in.',
        'A bullfrog does not chase anything. It sits perfectly still and waits, and then it will try to swallow whatever it can fit in its mouth — a beetle, a crayfish, a fish, even another frog.',
        'A bullfrog really would try to eat a small frog, a bat, or a bird. Not here. This is Guin\u2019s garden, and friends never hunt friends — so this one sits and blinks at them instead.'
      ],
      manners: 'Bullfrogs cause real trouble when they turn up in ponds they are not from, and in Washington they already have. Never carry one anywhere, and never move a tadpole. Look, listen, and leave it exactly where it is.'
    },
    {
      id: 'red_legged_frog', name: 'Northern Red-legged Frog', family: 'frog',
      way: 'still', patience: 5.5, keep: 96, rarity: 3, value: 130,
      times: ['evening', 'night', 'morning'], places: ['pond', 'forest', 'riverbank'],
      measure: 'about as long as a playing card', size: 0.44,
      art: { shape: 'frog', body: '#9a6a48', belly: '#f0d8c8', accent: '#5f3a26',
        eye: '#c8a83c', pattern: 'mottle' },
      facts: [
        'Turn one over very gently and the skin under its back legs is a bright tomato red. That is where the name comes from.',
        'The males sing underwater, so the song comes up through the pond as a quiet stuttering chuckle that is easy to walk straight past.',
        'It spends most of the year in damp woods away from any pond, and only comes back to the water to lay its eggs in the middle of winter.',
        'This is one of the frogs that truly belongs in western Washington, and it is having a harder time than it used to.'
      ],
      manners: 'Frogs that belong here have a thin time of it when big frogs from far away move in. Look with your eyes, keep your hands to yourself, and never carry a frog or a tadpole from one pond to another.'
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
        'It says "rib-it", and it is the frog you hear most all along the west coast.',
        'It is about the size of a paperclip, so everything it eats is tiny: flies, ants, little beetles, aphids and spiders, caught with a flick of a sticky tongue.'
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
        'A mother bat can eat half her own weight in bugs in a single night. A mother feeding babies eats more than her whole weight.',
        'A little brown bat can live to be thirty years old.',
        'You may have heard that one bat eats a thousand mosquitoes in an hour. That number came from a bat shut in a room where mosquitoes were the only thing to eat. Bats really do eat mosquitoes — scientists found mosquito in bat droppings nearly everywhere they looked — but what a bat mostly eats is moths and midges, and whatever else is flying past.',
        'It hunts low over the water, about as high as a grown-up\u2019s head, and it can hover beside a leaf and pick a resting insect straight off it.'
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
        'Its favourite food is crunchy beetles. It has a heavy little skull and strong jaws made for chewing straight through a beetle\u2019s shell.',
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
        'It hunts moths more than anything else.',
        'It eats the middle of a moth and drops the wings and the head, so under a hoary bat\u2019s favourite tree you can find a little pile of moth wings.'
      ],
      manners: 'Hoary bats live alone in the treetops and are hardly ever seen. Finding one is a real piece of luck, so watch quietly and let it get on with its evening.'
    },

    /* ---------------- dogs ---------------- */
    {
      id: 'labrador', name: 'Labrador Retriever', family: 'dog',
      way: 'ask', patience: 2.4, keep: 48, rarity: 1, value: 60,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'garden', 'meadow', 'beach'],
      measure: 'comes up past your knee', size: 0.87,
      art: { shape: 'dog', body: '#e0c48a', ear: '#c8a86a', accent: '#8a6a3a',
        muzzle: '#f2e2ba', nose: '#3a2f28', collar: '#3f8ad0', build: 'big' },
      facts: [
        'It has webbed toes and a thick tail like an otter’s, and both of them help it swim.',
        'Even though it is called a Labrador, the breed really comes from Newfoundland.',
        'It was the most popular dog in America for thirty-one years in a row.',
        'A retriever carries a bird all the way back without squashing it. That soft mouth is a hunting bite that people spent hundreds of years making gentler.',
        'Chasing a squirrel is play, not hunting. The looking and the running are the first half of a hunt; the catching part at the end was bred out of most pet dogs long ago, which is why the chase is the whole point.',
        'Dogs really do chase cats. Not in this garden: a dog that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Always ask the owner before you say hello. Turn a little sideways, do not stare, hold out a soft fist to be sniffed, and stroke the shoulder rather than the top of the head.'
    },
    {
      id: 'corgi', name: 'Welsh Corgi', family: 'dog',
      way: 'ask', patience: 2.6, keep: 46, rarity: 2, value: 85,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'garden', 'meadow'],
      measure: 'only as tall as a ruler is long', size: 0.59,
      art: { shape: 'dog', body: '#d88a48', ear: '#c07030', accent: '#8a4f1f',
        muzzle: '#f6ece0', nose: '#332a24', collar: '#d04a70', build: 'short' },
      facts: [
        'It has very short legs, but it is a real farm dog that helped move cattle about.',
        'It is small and it is brave: the rule book for the breed says it should be "bold, but kindly".',
        'Queen Elizabeth’s family got their first Corgi in the 1930s and made the breed famous.',
        'A Corgi moved cattle by darting in at their heels and dashing out again — a whole hunt boiled down to the quick bit in the middle, and nobody gets hurt.',
        'When a Corgi bolts after a squirrel it is playing, not hunting — and the squirrel is not frightened either. It stops halfway up the trunk, in plain sight, and scolds the dog with its tail whipping about.',
        'Dogs really do chase cats. Not in this garden: a Corgi that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Corgis often bark first and make friends second. Wait for the barking to stop before you put your hand out, and never bother a dog that is eating or asleep.'
    },
    {
      id: 'beagle', name: 'Beagle', family: 'dog',
      way: 'ask', patience: 2.8, keep: 50, rarity: 1, value: 65,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'meadow', 'forest', 'orchard'],
      measure: 'comes up to your shin', size: 0.67,
      art: { shape: 'dog', body: '#f0ead8', ear: '#8a5730', accent: '#3f342c',
        muzzle: '#f8f4e8', nose: '#2f2620', collar: '#5aa84f', build: 'mid', patch: 'saddle' },
      facts: [
        'Its long floppy ears help sweep smells up towards its nose.',
        'It has three different voices: a bark, a howl, and a yodelly sound called a bay.',
        'Some Beagles have a real job sniffing luggage at airports, in a team called the Beagle Brigade.',
        'Following a smell for miles is the first part of hunting, and a Beagle is all first part. It will trail a rabbit happily for an hour and then have no idea what to do when it catches up.',
        'A Beagle will chase a squirrel up a tree and then have no idea what to do about it. Beagles are the dogs scientists point to when they say the catching end of the hunt has been bred away: they do not kill what they chase.',
        'Dogs really do chase cats. Not in this garden: a Beagle that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'A Beagle will follow its nose right past you without meaning to be rude. Let it finish sniffing before you expect it to notice you at all.'
    },
    {
      id: 'border_collie', name: 'Border Collie', family: 'dog',
      way: 'ask', patience: 3.6, keep: 62, rarity: 2, value: 100,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'meadow', 'hill'],
      measure: 'comes up to your thigh', size: 0.79,
      art: { shape: 'dog', body: '#2f2a28', ear: '#221e1c', accent: '#f4f0e6',
        muzzle: '#f4f0e6', nose: '#2a2320', collar: '#e0a03a', build: 'big', patch: 'ruff' },
      facts: [
        'It herds sheep by crouching low and staring at them, and shepherds call that "the eye".',
        'A Border Collie named Chaser learned the names of one thousand and twenty-two different toys.',
        'It is friendly with people it knows, but it can be a bit shy with strangers at first.',
        '"The eye" is a real stalk. A wolf creeping up on something does exactly the same thing — a Border Collie just stops before the last bit and moves the sheep instead.',
        'When she springs after a moth and it gets away, that is how it usually goes. Dogs and cats both miss far more often than they catch.',
        'A squirrel that has seen a dog coming does not hide. It goes a little way up the trunk, turns round to face the dog, and tells it off out loud — which means: I can see you, do not bother. It only hides properly from a hawk.',
        'Dogs really do chase cats. Not in this garden: a Border Collie that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'This one is one of the most reserved dogs about. Crouch a little, look away rather than at it, and let it make the first move in its own time.'
    },

    /* ---------------- Dog's Paradise (v1.18) ----------------
       Six more breeds, who are mostly found at the dog park. Checked
       against the AKC breed standards and histories, LSU's work on
       Dalmatian deafness, and the AVMA's dog-bite-prevention advice. */
    {
      id: 'golden_retriever', name: 'Golden Retriever', family: 'dog',
      way: 'ask', patience: 2.2, keep: 46, rarity: 1, value: 65,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'meadow'],
      measure: 'the top of its back comes up to your hip', size: 0.9,
      art: { shape: 'dog', body: '#d9a44a', ear: '#c88f3a', accent: '#8a5a24',
        muzzle: '#f0d49a', nose: '#3a2a22', collar: '#d04a4a', build: 'big', feather: '#e8bc6a' },
      facts: [
        'The first Golden Retrievers were bred in Scotland in the 1860s.',
        'Goldens were bred to fetch birds for hunters, and their mouths are so gentle that one can carry a raw egg without cracking it.',
        'Their thick golden coat keeps the water out, so they can swim in cold lakes.',
        'Goldens work as guide dogs, therapy dogs and search-and-rescue dogs.',
        'Dogs really do chase cats. Not in this garden: a Golden that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Goldens are very friendly and often jump up to say hello. Ask the owner first, and stand still like a tree until the dog is calm.'
    },
    {
      id: 'german_shepherd', name: 'German Shepherd', family: 'dog',
      way: 'ask', patience: 3.8, keep: 64, rarity: 2, value: 95,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'hill'],
      measure: 'the top of its back comes up to your hip, or a bit higher', size: 0.95,
      art: { shape: 'dog', body: '#b8864a', ear: '#2a2420', accent: '#2a2420',
        muzzle: '#c89a5e', nose: '#1a1614', collar: '#3f8ad0', build: 'big', ears: 'up',
        patch: 'saddle', mask: '#2a2420' },
      facts: [
        'German Shepherds were bred to herd sheep. The very first one, a dog called Horand, was chosen in Germany in 1899.',
        'In 1928 a German Shepherd called Buddy became the first Seeing Eye guide dog in America.',
        'A German Shepherd called Rin Tin Tin, rescued in the First World War, starred in twenty-three films.',
        'Today they work as police dogs, search-and-rescue dogs and sniffer dogs.',
        'Dogs really do chase cats. Not in this garden: a German Shepherd that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'A German Shepherd may be on the job, looking after its family or working as a helper dog. Always ask first, and never pet a dog that is working.'
    },
    {
      id: 'dachshund', name: 'Dachshund', family: 'dog',
      way: 'ask', patience: 2.8, keep: 44, rarity: 2, value: 80,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'garden'],
      measure: 'not even up to your knee', size: 0.62,
      art: { shape: 'dog', body: '#9a4a24', ear: '#7a3618', accent: '#5a2a14',
        muzzle: '#b0643a', nose: '#2a1a14', collar: '#e0a03a', long: true },
      facts: [
        'Dachshund is German for badger dog. The short legs and the long body let it crawl right down into a badger’s hole.',
        'Dachshunds come in three coats, smooth, wiry and long-haired, and in two sizes, standard and miniature.',
        'A Dachshund called Waldi was the very first Olympic mascot, at the 1972 Olympics in Munich.',
        'Dogs really do chase cats. Not in this garden: a Dachshund that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Never pick a Dachshund up: its long back is easy to hurt. Let the owner lift it, and sit down on the ground to say hello.'
    },
    {
      id: 'dalmatian', name: 'Dalmatian', family: 'dog',
      way: 'ask', patience: 3.2, keep: 56, rarity: 3, value: 120,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'farmyard'],
      measure: 'the top of its back comes up to the top of your leg', size: 0.9,
      art: { shape: 'dog', body: '#f4f2ec', ear: '#f4f2ec', accent: '#1a1a1a',
        muzzle: '#f8f6f0', nose: '#1a1a1a', collar: '#d0343a', build: 'big', spots: '#1a1a1a' },
      facts: [
        'Dalmatian puppies are born pure white. Their spots only come as they grow.',
        'No two Dalmatians have the same spots.',
        'Dalmatians used to run alongside horse-drawn fire wagons, and lots of fire stations kept one as a mascot after fire engines came along.',
        'Their spots are either black or liver-brown.',
        'Dogs really do chase cats. Not in this garden: a Dalmatian that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Quite a lot of Dalmatians cannot hear well in one ear or both. Come from the front, where it can see you, and never sneak up on one.'
    },
    {
      id: 'standard_poodle', name: 'Standard Poodle', family: 'dog',
      way: 'ask', patience: 3.4, keep: 54, rarity: 2, value: 90,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'pond'],
      measure: 'many come up as tall as your hip', size: 0.9,
      art: { shape: 'dog', body: '#e8c49a', ear: '#e0b888', accent: '#b8885a',
        muzzle: '#f0d4b0', nose: '#3a2a22', collar: '#e060a0', build: 'big', curly: true },
      facts: [
        'Poodles were bred to fetch ducks out of the water. The name comes from a German word that means to splash about.',
        'The fancy haircut had a job: hunters trimmed the legs and tail so the dog could swim, and left fur on the chest and joints to keep it warm.',
        'France calls the Poodle its national dog, even though the breed probably started in Germany.',
        'Dogs really do chase cats. Not in this garden: a Poodle that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Poodles are clever and sensitive, so move slowly and talk softly. Ask first, and let the dog come to you.'
    },
    {
      id: 'australian_shepherd', name: 'Australian Shepherd', family: 'dog',
      way: 'ask', patience: 3.6, keep: 60, rarity: 3, value: 115,
      times: ['morning', 'day', 'evening'], places: ['dogpark', 'farmyard'],
      measure: 'the top of its back comes up to your thigh', size: 0.85,
      art: { shape: 'dog', body: '#9aa4b0', ear: '#3a3f48', accent: '#f4f2ee',
        muzzle: '#f4f2ee', nose: '#2a2420', collar: '#5aa84f', build: 'big', patch: 'ruff',
        merle: '#3a3f48', points: '#b86a3a', bob: true },
      facts: [
        'Despite its name, the Australian Shepherd was made in the western United States, to herd sheep. It was named after sheepdogs that came over with sheep from Australia.',
        'Aussies got famous at rodeos, herding bulls and doing tricks.',
        'Their eyes can be brown, blue, amber, or even two colours in one eye!',
        'About one in five is born with a short little tail.',
        'Dogs really do chase cats. Not in this garden: a Aussie that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'Herding dogs may chase running feet or give them a nip. Do not run: stand still like a tree, and ask the owner first.'
    },

    /* ---------------- cats ---------------- */
    {
      id: 'cookie', name: 'Cookie', family: 'dog', unique: true,
      way: 'ask', patience: 2.5, keep: 52, rarity: 2, value: 110,
      times: ['morning', 'day', 'evening', 'night'],
      places: ['dogpark', 'garden', 'meadow', 'forest', 'hill'],
      measure: 'comes up past your knee', size: 0.8,
      art: { shape: 'dog', body: '#2f2b29', ear: '#241f1d', accent: '#f4f2ee',
        muzzle: '#f4f2ee', nose: '#171412', collar: '#b0322c', build: 'big',
        ears: 'up', face: 'bandit', curl: true, patch: 'ruff' },
      facts: [
        'An Alaskan Husky is not really one breed at all \u2014 it is a kind of sled dog, bred for running well rather than for looking a certain way.',
        'A dog can have up to 300 million tiny smell-catchers in its nose. People only have about six million, so the world smells a hundred times more interesting to her.',
        'When a dog is happy to see someone it loves, its tail wags a little more to its right side than its left.',
        'Tug-of-war, shaking a toy, and bolting after a beetle are all the same set of moves a wolf uses to hunt, with the last one taken out. When she plays, she is doing something very old.',
        'Sled dogs keep more of that hunt than most dogs do, so Cookie is the quickest of them all to spot something moving and go.',
        'Sled dogs keep more of the old hunt than most dogs, so a squirrel is very hard for Cookie to ignore. It is still play: she runs, the squirrel goes up the tree and scolds her, and neither of them is in any danger at all.',
        'Dogs really do chase cats. Not in this garden: Cookie sits down and waits instead when she spots one of your cat friends, because friends never hunt friends.'
      ],
      manners: 'Ask whoever she belongs to before you say hello, then hold out a soft fist and let her come to you. Huskies are chatty and wriggly and love to lean on people, but even the friendliest dog wants to be left alone while it is eating or sleeping.'
    },
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
        'Each single hair has light and dark bands along it, and that is what makes the pattern.',
        'Cats hunt because they are cats, not because they are hungry. The hunting part of a cat and the hungry part are two different things, which is why a cat with a full bowl still pounces on a shoelace.',
        'Most of the birds that cats catch are caught by cats who have no home — the ones nobody feeds, who have to hunt all day long to stay alive. A cat with a person, who comes indoors at night, catches hardly anything at all.',
        'Cats really do catch birds. Not in this garden: a cat that spots one of your hummingbird friends sits down and watches instead, because friends never hunt friends.'
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
        'No two calico cats anywhere have exactly the same patches.',
        'A cat is really a mouse-hunter. For every bird a cat catches, it catches about five little furry things — mice, voles and shrews.',
        'Cats really do catch birds. Not in this garden: a cat that spots one of your hummingbird friends sits down and watches instead, because friends never hunt friends.'
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
        'Cats like this were written about in a Thai book of cat poems hundreds of years ago.',
        'More than half of all pounces end with the moth or the mouse getting clean away. When something escapes her in your garden, that is not the game being kind — that is what usually happens.',
        'Cats really do catch birds. Not in this garden: a cat that spots one of your hummingbird friends sits down and watches instead, because friends never hunt friends.'
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
        'Its shaggy coat and tufty ears were made for snowy north-eastern winters.',
        'A bell on the collar does not stop a cat hunting — people have checked. What works is keeping a cat indoors, giving it a safe outdoor run of its own, or taking it out on a lead.',
        'Cats really do catch birds. Not in this garden: a cat that spots one of your hummingbird friends sits down and watches instead, because friends never hunt friends.'
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
        'They do not have one home. They keep moving to wherever the food and the water are.',
        'A budgie does not hunt anything. It eats grass seed, and dry-country grass seed is so full of goodness that a budgie needs nothing else at all.'
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
        'It can crack a seed open and eat it in a couple of seconds.',
        'A cockatiel is not a hunter. It walks about on the ground looking for fallen seed, which is a funny thing for a parrot to do, and now and then it picks up a little bug by accident.'
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
        'They sometimes nibble clay from the riverbank to help settle their tummies. Unripe fruit is full of bitter stuff, and the clay helps them cope with it.',
        'A macaw hunts nothing at all. Everything it eats is fruit, nuts and seeds — that enormous beak is a nutcracker, not a weapon.'
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
        'At night they gather in trees above the water, often on little islands in the river.',
        'A grey parrot eats nuts, fruit, leaves, bark and flowers, and now and again an insect it happens to find. It never chases one. Working a hard shell open with that beak and tongue is the clever bit.'
      ],
      manners: 'Greys are clever and very watchful, and wild ones stay well away from people. The kindest thing is to sit still, keep quiet, and just let it look at you.'
    },

    /* ---------------- rabbits ---------------- */
    {
      id: 'nuttalls_cottontail', name: "Nuttall's Cottontail", family: 'rabbit',
      way: 'watch', patience: 4.6, keep: 96, rarity: 1, value: 45,
      times: ['morning', 'evening'], places: ['desert', 'meadow', 'hill', 'garden'],
      measure: 'about as long as your forearm', size: 0.5,
      art: { shape: 'rabbit', body: '#9a8b78', body2: '#b5a692', belly: '#f2efe8',
        head: '#9a8b78', face: '#b5a692', ear: '#b5a692', leg: '#9a8b78',
        tail: '#f2efe8', accent: '#3b322b', eye: '#231c16', nose: '#c8968f' },
      facts: [
        'When something chases it, it does not run in a straight line. It runs round in a curve, and the curve is the trick.',
        'Its ears are short and rounded with black tips. The one with the enormous ears bouncing across the sagebrush is a jackrabbit, and a jackrabbit is a hare, not a rabbit.',
        'It eats some of its own droppings — the soft ones, straight away — so the grass goes through twice and it gets more out of it.',
        'Grass first, then sagebrush and juniper berries when the grass dries up. Carrots are a thing out of a story; no wild rabbit has ever had one.',
        'A nest of baby rabbits with no mother anywhere is not abandoned. She is away feeding, and she is coming back.'
      ],
      manners: 'Look, do not pick it up. Wild rabbits can carry a germ called tularemia, so hands off and wash them afterwards. Sit down low and still and it will come back out on its own.'
    },

    /* ---------------- squirrels ---------------- */
    {
      id: 'fox_squirrel', name: 'Eastern Fox Squirrel', family: 'squirrel',
      way: 'watch', patience: 4.0, keep: 88, rarity: 1, value: 40,
      times: ['morning', 'day'], places: ['garden', 'orchard', 'forest'],
      measure: 'as long as your arm, and half of that is tail', size: 0.52,
      art: { shape: 'treesquirrel', body: '#8a6a45', body2: '#c08a4e', belly: '#d9a05b',
        head: '#8a6a45', face: '#d9a05b', ear: '#8a6a45', leg: '#8a6a45',
        tail: '#c08a4e', accent: '#e8d2ae', eye: '#1a1512', nose: '#3a2a20' },
      facts: [
        'This squirrel is not from here. Eastern fox squirrels and eastern gray squirrels were brought over and let loose in parks and gardens in the early 1900s, and now they are the commonest squirrels in town.',
        'The squirrels that really belong to Washington live somewhere else. The Douglas squirrel keeps to the mountains and the west side, and the western gray squirrel is endangered — three small groups left in the whole state.',
        'It does not forget where it buried its nuts. It remembers by landmarks, it sorts them by kind, and it digs up twice as many of its own as it does another squirrel’s.',
        'When a dog comes, it runs up the trunk and then stops halfway, in plain sight, facing the dog, and scolds it with its tail whipping about. It is not hiding. It is saying: I can see you, do not bother.',
        'Its tail is as long as the rest of it and it fluffs out sideways, which is how you tell a tree squirrel from a ground squirrel at a glance.'
      ],
      manners: 'Do not feed squirrels. A squirrel that is fed by hand stops being afraid of people and starts demanding, and then it gets into trouble. Watch it, and let it find its own dinner.'
    },
    {
      id: 'townsends_squirrel', name: "Townsend's Ground Squirrel", family: 'squirrel',
      way: 'watch', patience: 4.4, keep: 92, rarity: 3, value: 140,
      times: ['morning', 'day'], places: ['desert', 'hill', 'meadow'],
      measure: 'about as long as your hand and your wrist', size: 0.36,
      art: { shape: 'groundsquirrel', body: '#a99a80', body2: '#7c6e58', belly: '#d6ccb6',
        head: '#a99a80', face: '#d6ccb6', ear: '#a99a80', leg: '#a99a80',
        tail: '#a99a80', accent: '#7c6e58', eye: '#1e1913', nose: '#3a3026' },
      facts: [
        'It is awake for only four or five months of the year. It comes up in January or February, has its babies in the spring, and is back underground asleep by May or June.',
        'It is a ground squirrel, not a tree squirrel: short legs, a low body and a short thin tail. Its pose is standing bolt upright at the mouth of its burrow, having a look round.',
        'This is the squirrel that truly belongs here. Benton County is written right into its range, which is more than the squirrel in the garden can say.',
        'A burrowing owl cannot dig. It moves into a hole a ground squirrel or a badger left behind — so an owl in a hole is usually living in a squirrel’s old house.'
      ],
      manners: 'Watch from where you are standing. A ground squirrel dives down its hole the moment you walk at it, and that hole is the only door it has.'
    },

    /* ---------------- turtles ---------------- */
    {
      id: 'painted_turtle', name: 'Western Painted Turtle', family: 'turtle',
      way: 'watch', patience: 3.6, keep: 70, rarity: 2, value: 90,
      times: ['morning', 'day'], places: ['pond', 'riverbank'],
      measure: 'a shell about as wide as your hand', size: 0.34,
      art: { shape: 'turtle', shell: '#2f3a2a', shell2: '#3f4a34', plastron: '#d9532e',
        body: '#2b3a32', head: '#2b3a32', face: '#e8c64a', leg: '#2b3a32',
        belly: '#d9532e', tail: '#2b3a32', accent: '#c6402a', eye: '#1a1a16', nose: '#1a1a16' },
      facts: [
        'The red is on the edge of its shell and on its belly, not on its ears. The stripes down its head and legs are yellow. The turtle with red ears is a different one, from far away.',
        'It starts every single day by climbing out onto a log to sit in the sun, because it cannot make any heat of its own.',
        'A turtle cannot climb out of its shell. The shell is its backbone and its ribs, grown flat and joined together.',
        'Washington has a turtle that nearly vanished: the western pond turtle, down to fewer than two hundred in the Columbia Gorge. Zoos now raise the hatchlings through their first year, and there are about eight hundred.'
      ],
      manners: 'If a turtle is crossing a path, help it the way it was already going and never turn it round. Never carry one to nicer water — it will spend the rest of its life walking home. Wash your hands afterwards.'
    },

    /* ---------------- bears ---------------- */
    {
      id: 'black_bear', name: 'Black Bear', family: 'bear',
      way: 'backaway', patience: 6.5, keep: 190, rarity: 4, value: 280,
      times: ['morning', 'evening'], places: ['forest', 'mountain', 'taiga'],
      measure: 'taller than a grown-up when it stands up', size: 1.25,
      art: { shape: 'bear', body: '#2a231e', body2: '#6b4327', belly: '#2a231e',
        head: '#2a231e', face: '#9c7a52', ear: '#241d19', leg: '#231c18',
        tail: '#2a231e', accent: '#d8cbb5', eye: '#120e0b', nose: '#9c7a52' },
      facts: [
        'There are no black bears in the Tri-Cities. They live in forests all over Washington except one place — the dry middle of the Columbia Basin — and that is exactly where your garden is. The nearest ones are in the Blue Mountains, sixty or seventy miles away.',
        'A black bear is very often not black. Brown, blond, cinnamon and rust ones are all black bears. You tell one from a grizzly by its straight face, its long ears, no hump on its shoulders, and a bottom higher than its shoulders.',
        'Nine tenths of what it eats is plants — berries, nuts and roots. It is a berry-picker with claws, and it carries the seeds in its tummy for miles and plants forests by accident.',
        'In winter its heart slows from about forty-five beats a minute down to eight, it cools by a dozen degrees, and it goes for months without eating, drinking or going to the toilet at all.',
        'It can run as fast as a racehorse, uphill as well as down, and it can climb a tree. That is why you never, ever run from one.'
      ],
      manners: 'You do not walk towards a bear, ever. If it has not seen you, go away quietly while it is not looking. If it has, back away slowly and talk to it in a low voice. Never run, and never feed one — in Washington feeding a bear is against the law, and a bear that learns to come to people nearly always ends up dead.'
    },

    /* ---------------- raccoons ---------------- */
    {
      id: 'raccoon', name: 'Raccoon', family: 'raccoon',
      way: 'watch', patience: 4.2, keep: 110, rarity: 2, value: 85,
      times: ['evening', 'night'], places: ['garden', 'riverbank', 'pond', 'forest', 'orchard'],
      measure: 'as long as your arm, plus a stripy tail', size: 0.62,
      art: { shape: 'raccoon', body: '#7e7768', body2: '#9c9280', belly: '#9c9280',
        head: '#7e7768', face: '#e8e2d4', ear: '#7e7768', leg: '#6b6558',
        tail: '#9c9280', accent: '#22201c', eye: '#141210', nose: '#3a3330' },
      facts: [
        'It is not washing its food. Its name means "the washer", and that was a mistake people made two hundred and fifty years ago: it handles food in water because wet hands feel far more.',
        'Its front paws are so good at feeling that it can work out what something is without ever looking at it. Its footprints look like tiny human handprints with five fingers.',
        'It can fall thirty-five or forty feet and walk away from it.',
        'There are more raccoons in town than out in the woods — fewer things to be frightened of, and a great deal more dinner.',
        'What it likes best is whatever it can feel about for in shallow water: crayfish, snails, frogs and little fish.'
      ],
      manners: 'Never touch a raccoon, and never touch its droppings — they can carry a worm that makes people very ill indeed. Feeding a raccoon is not kind: a fed raccoon stops being frightened and starts demanding.'
    },

    /* ---------------- foxes ---------------- */
    {
      id: 'red_fox', name: 'Red Fox', family: 'fox',
      way: 'watch', patience: 5.4, keep: 140, rarity: 3, value: 170,
      times: ['morning', 'evening', 'night'], places: ['meadow', 'hill', 'desert', 'orchard'],
      measure: 'like a small slim dog, with a tail nearly as long as the rest of it', size: 0.72,
      art: { shape: 'fox', body: '#c2622a', body2: '#d97c3e', belly: '#f4efe6',
        head: '#c2622a', face: '#f4efe6', ear: '#26201c', leg: '#26201c',
        tail: '#c2622a', accent: '#f4efe6', eye: '#c9a227', nose: '#1e1a17' },
      facts: [
        'The white tip on its tail never changes, whatever colour the rest of it is. Its legs and the backs of its ears are black, so a fox drawn all orange is drawn wrong.',
        'It hears a mouse under the snow, jumps straight up in the air, and comes down nose first.',
        'It eats berries and beetles as happily as it eats mice.',
        'Washington has two kinds of red fox that never meet: a rare grey-and-black one high in the Cascades, and the farm foxes down in the valleys, kept apart by the wet forests in between. The one out in the fields here is a valley fox.',
        'A fox really does hunt rabbits, ground squirrels and ducklings. Not in this garden: it sits down in the grass and watches them instead, because friends never hunt friends.'
      ],
      manners: 'A fox is not a pet and is never fed. A fed fox loses its fear, comes up to houses, and ends up under a car. Watch it from where you are and let it get on with its hunting.'
    },

    /* ---------------- deer ---------------- */
    {
      id: 'mule_deer', name: 'Mule Deer', family: 'deer',
      way: 'watch', patience: 5.0, keep: 150, rarity: 2, value: 110,
      times: ['morning', 'evening'], places: ['desert', 'hill', 'meadow', 'orchard', 'forest'],
      measure: 'taller than you at the shoulder', size: 1.2,
      art: { shape: 'deer', body: '#a97a4c', body2: '#8c8578', belly: '#ede6d8',
        head: '#a97a4c', face: '#ede6d8', ear: '#3a322a', leg: '#a97a4c',
        tail: '#f0ebe0', antler: '#b9a883', accent: '#1e1a16', eye: '#1a1512',
        nose: '#2a231d', calf: false },
      facts: [
        'Its ears are the size of a mule’s. That is how it got its name, and they really should look too big.',
        'When it is worried it bounces — all four feet off the ground at once, legs stiff. That looks a silly way to escape until you know what it means: look how strong I am, do not bother chasing me.',
        'A buck’s antlers fall off every winter and grow back every summer, and they fork and fork again into equal Ys rather than branching off one main beam.',
        'A fawn lying alone in the grass is not lost. Its mother left it there on purpose and is coming back — and it is not true that she would reject it if a person touched it. She is away feeding; the fawn is doing its job.',
        'You cannot ride a deer, and nobody is allowed to keep one — Washington law says so plainly. A deer’s back is long and thin and built for springing away, not for carrying, and being held frightens a deer so badly it can make it ill days later. Running away is the best thing about a deer, so we let it.'
      ],
      manners: 'Watch from a long way off. Since May 2025 it has been against the law in Washington to feed deer, elk or moose: crowding them together spreads disease, the wrong food upsets them, and it walks them straight out into the road.'
    },
    {
      id: 'moose', name: 'Moose', family: 'deer',
      way: 'backaway', patience: 7.0, keep: 198, rarity: 5, value: 380,
      times: ['morning', 'day', 'evening'], places: ['taiga', 'forest', 'mountain'],
      measure: 'nearly six feet tall at the shoulder, before you get to the head', size: 1.65,
      art: { shape: 'moose', body: '#3a2b22', body2: '#332619', belly: '#3a2b22',
        head: '#3a2b22', face: '#241b15', ear: '#3a2b22', leg: '#9e9385',
        tail: '#3a2b22', antler: '#b9a883', accent: '#332619', eye: '#14100d',
        nose: '#241b15', calf: false },
      facts: [
        'There are no moose anywhere near the Tri-Cities. Washington’s moose live up in the far north-east corner, in the Selkirk Mountains — about a hundred and seventy miles away, which is a four-hour drive.',
        'Washington had about sixty moose in the 1970s. It has about five thousand now, and they walked in by themselves.',
        'It is not a big deer to look at. Its shoulders are humped and far higher than its rump, its legs are much too long, its muzzle hangs out over its mouth, and a flap of skin called a bell swings under its throat. Its antlers are flat plates, like two open hands.',
        'In Alaska more people are hurt by moose every year than by bears. It is not that a moose is bad-tempered — it is that a moose is enormous, will not back down, and is fierce about its calf.',
        'You can tell an angry moose: the long hairs on its hump stand up, its ears go flat back like a cross cat’s, and it licks its lips.',
        'People really did try to use moose. In Sweden moose pulled the king’s messenger-sleighs, two hundred and thirty miles in a day, and there is a moose farm in Russia, started in 1963, where the moose walk off into the forest each day and come home to be milked. But nobody could make a moose pull a cart: it simply was not strong enough at pulling and it needed a person to help it up the hills.',
        'The famous story about soldiers riding moose into battle is not true at all. A historian went looking and found nothing but nineteenth-century rumours, and the Soviet version began as an April Fools’ joke in a magazine that got away from everybody.'
      ],
      manners: 'Never walk towards a moose. Stay more than twenty-five yards away, further if you can. If you see a calf and no mother, get out of there carefully — she is close, and you may be standing between them. And this is the one animal you should run from: run, and put a tree between you.'
    },

    /* ---------------- the farm ---------------- */
    {
      id: 'cow', name: 'Cow', family: 'cow',
      way: 'farmer', patience: 2.8, keep: 60, rarity: 1, value: 55,
      times: ['morning', 'day', 'evening'], places: ['meadow', 'orchard'],
      measure: 'taller than you at the shoulder, and twice as long', size: 1.55,
      art: { shape: 'cow', body: '#f5f2ec', body2: '#e4e0d6', patch: '#1e1b18',
        belly: '#f5f2ec', head: '#f5f2ec', face: '#f5f2ec', ear: '#e4e0d6',
        leg: '#f5f2ec', tail: '#1e1b18', accent: '#3a342c', eye: '#1a1512', nose: '#c89d9c' },
      facts: [
        'A cow has no top front teeth at all. She wraps her tongue round a bunch of grass and tears it off against a hard pad in the roof of her mouth.',
        'Her stomach has four rooms, and the first one on its own holds twenty-five gallons. Food takes seventy to a hundred hours to travel all the way through her.',
        'She spends more than a third of every day chewing the cud — bringing grass back up and chewing it all over again — and makes fifty to eighty quarts of spit a day to do it.',
        'Bulls do not hate red. Cattle cannot really tell red from green at all; what a bull charges is the cape moving about.',
        'You do not ride a cow, and it is not because it could not be done — people have driven oxen for thousands of years. It is that this cow was never taught to carry anybody. Her back is bony and ridged where a horse’s is padded and saddle-shaped, and there is no way to ask her to turn or to stop.'
      ],
      manners: 'Ask the farmer first, and come at her from the side where she can see you — cattle cannot see behind themselves and turn round to keep you in sight. Never go into a field with a cow and a new calf; that is the one time a gentle animal is not. And if you have a dog with you, keep well back: if cows come over, let go of the lead and walk away, because it is the dog they are worried about.'
    },
    {
      id: 'horse', name: 'Horse', family: 'horse', rideable: true,
      way: 'shoulder', patience: 3.0, keep: 56, rarity: 2, value: 120,
      times: ['morning', 'day', 'evening'], places: ['meadow', 'hill'],
      measure: 'her head is well above yours', size: 1.55,
      art: { shape: 'horse', body: '#6b4423', body2: '#7a5029', belly: '#7a5029',
        head: '#6b4423', face: '#6b4423', ear: '#6b4423', leg: '#1c1815',
        tail: '#1c1815', mane: '#1c1815', accent: '#3e382f', eye: '#161210',
        nose: '#2a241e', rideable: true },
      facts: [
        'A horse can see nearly all the way round itself, but there are two places it cannot see: right in front of its nose, and right behind its tail. That is the whole reason you never walk up behind one — a horse surprised from behind kicks before it has time to think.',
        'It sleeps standing up, in naps of less than two hours, because lying down for long is dangerous for an animal that size.',
        'Every riding horse alive came from one small group of horses on the grasslands between the Volga and the Don, about four thousand two hundred years ago. The two things people picked out, over and over, were a strong back and a calm temper.',
        'Horses read faces. Shown a photograph of an angry person, a horse looks at it with its left eye — the side wired to the alarm half of its brain — and its heart speeds up.',
        'This is the one friend you may ride, and that is exactly what four thousand years of choosing was for.'
      ],
      manners: 'Ask the person she belongs to first. Talk to her as you come so she hears you before she sees you, walk to her shoulder from the side, and let her smell the back of your closed hand. Never stand right behind her. And if you get on, you wear a proper ASTM/SEI riding helmet, every single time.'
    },
    {
      id: 'sheep', name: 'Sheep', family: 'sheep',
      way: 'farmer', patience: 2.8, keep: 58, rarity: 1, value: 55,
      times: ['morning', 'day', 'evening'], places: ['meadow', 'hill'],
      measure: 'about as tall as your chest', size: 0.95,
      art: { shape: 'sheep', body: '#e4dccc', body2: '#bfb5a0', patch: '#2a2520',
        belly: '#d8cebb', head: '#2a2520', face: '#2a2520', ear: '#2a2520',
        leg: '#2a2520', tail: '#e4dccc', accent: '#3a342c', eye: '#3a2e1e', nose: '#1e1a16' },
      facts: [
        'A sheep’s pupil is a wide horizontal bar, not a circle — and when she puts her head down to eat, her eyes roll to stay level with the ground, ten times further than yours can. It keeps the horizon sharp while she grazes, so she can see something coming.',
        'Sheep know faces. Eight sheep learned to pick particular people out of photographs and got it right about eight times out of ten, then picked their own keeper out of a line-up with no training at all, doing a visible double-take first.',
        'Wild sheep shed their coats. Farm sheep have been bred not to, so if nobody shears them the wool never stops. A sheep called Chris, found near Canberra in 2015, was carrying forty-one kilograms of fleece.',
        'A sheep on her own is a worried sheep. They live in flocks, and one separated from hers is genuinely miserable, which is why a lone sheep comes and stands near you.',
        'A sheep is not white. The wool is cream or grey, and the face and legs are often black or brown.'
      ],
      manners: 'Ask the farmer, walk up slowly from where she can see you, and never grab hold of the wool. Wash your hands afterwards.'
    },
    {
      id: 'chicken', name: 'Chicken', family: 'chicken',
      way: 'farmer', patience: 2.4, keep: 46, rarity: 1, value: 45,
      times: ['morning', 'day', 'evening'], places: ['garden', 'orchard', 'meadow'],
      measure: 'about as tall as a ruler is long', size: 0.44,
      art: { shape: 'chicken', body: '#7a3a1c', body2: '#4a2010', belly: '#8a4426',
        head: '#7a3a1c', face: '#c2302a', ear: '#c2302a', leg: '#e0b04a',
        tail: '#4a2010', accent: '#c2302a', eye: '#c9a227', nose: '#e0b04a' },
      facts: [
        'Chickens can count. Chicks raised with five identical things watched two screens and worked out which one was hiding the bigger group.',
        'A hen will wait for a better meal. Offered a small treat now or a bigger one in a moment, hens hold out on purpose.',
        '"Pecking order" was invented for actual chickens. A Norwegian scientist watched a farmyard in 1921 and wrote that "a grave seriousness lies over the chicken yard". Everybody else — monkeys, whales, ants — borrowed the phrase afterwards.',
        'Chickens came from red jungle fowl in the forests of south-east Asia, and it was dry rice farming that drew them down out of the trees about three and a half thousand years ago. When they first reached Europe nobody ate them at all: the earliest ones we find are buried whole and on their own, like something wonderful.',
        'Its head stays still in the air while its body walks along underneath. That is what makes the bobbing look so mechanical.'
      ],
      manners: 'You are old enough to hold a chicken. Never kiss one or hold it up against your face, and always wash your hands with soap and running water afterwards — poultry can look perfectly clean and healthy and still carry germs that make people ill.'
    },

    /* ---------------- ducks ---------------- */
    {
      id: 'mallard', name: 'Mallard', family: 'duck',
      way: 'watch', patience: 3.4, keep: 84, rarity: 1, value: 50,
      times: ['any'], places: ['pond', 'riverbank'],
      measure: 'about as long as your arm', size: 0.5,
      art: { shape: 'duck', body: '#b9b4a8', body2: '#6e3b22', belly: '#cfcac0',
        head: '#1f6b3f', face: '#1f6b3f', bill: '#d9b546', speculum: '#2e4fa0',
        leg: '#d98a2a', tail: '#1a1714', accent: '#f5f2ec', eye: '#1a1512', nose: '#d9b546' },
      facts: [
        'A mallard almost never dives. It tips upside down instead, bottom in the air, and grazes the bottom of the pond.',
        'The green-headed drake and the brown hen both have the same secret: a patch of blue on the wing with a white line above it and below it.',
        'It can fly at fifty-five miles an hour.',
        'Almost every duck on a farm is a mallard underneath — bred bigger, or whiter, or unable to fly, but a mallard.'
      ],
      manners: 'Bread is not duck food. It fills a duckling up with nothing at all while its wings are still growing, and a wing that grows out crooked never works again. Let them find their own dinner in the pond.'
    },

    /* ---------------- otters ---------------- */
    {
      id: 'river_otter', name: 'River Otter', family: 'otter',
      way: 'watch', patience: 5.2, keep: 130, rarity: 4, value: 240,
      times: ['any'], places: ['riverbank', 'pond'],
      measure: 'as long as a grown-up’s leg, tail and all', size: 0.78,
      art: { shape: 'otter', body: '#4a3a2c', body2: '#6b5544', belly: '#b9ac96',
        head: '#4a3a2c', face: '#cfc3ac', ear: '#4a3a2c', leg: '#4a3a2c',
        tail: '#4a3a2c', accent: '#ede7d9', eye: '#141210', nose: '#2a231c' },
      facts: [
        'It can hold its breath for eight minutes.',
        'Food goes all the way through an otter in about an hour, which is why it is always, always hunting.',
        'One male may travel a hundred and fifty miles in a year, up and down his river, going round the same circuit every one to four weeks.',
        'Otters really do slide down muddy banks, over and over, on purpose.',
        'The otters in the photographs holding hands are sea otters, out in the ocean. River otters do not do that. A river otter is usually a mother with her children, or a male on his own.'
      ],
      manners: 'An otter is not a toy. It is short-sighted, its mouth is made for cracking shells open, and a mother with pups will defend them — they have hurt people. Watch from the bank, and never feed one.'
    },

    /* ---------------- owls ---------------- */
    {
      id: 'burrowing_owl', name: 'Burrowing Owl', family: 'owl',
      way: 'watch', patience: 5.0, keep: 120, rarity: 4, value: 260,
      times: ['morning', 'day', 'evening'], places: ['desert', 'meadow', 'hill'],
      measure: 'about as tall as a milk bottle', size: 0.38,
      art: { shape: 'owl', body: '#8a6f4e', body2: '#6f5738', belly: '#c9b48f',
        head: '#8a6f4e', face: '#f5efdf', disc: '#c9b48f', brow: '#f5efdf',
        ear: '#8a6f4e', leg: '#9c8768', tail: '#6f5738', accent: '#ede4ce',
        eye: '#f2c230', nose: '#d6d0c0' },
      facts: [
        'This is the owl with your address written into it. It nests in Benton, Franklin, Grant and western Adams counties, and Benton and Franklin are the Tri-Cities.',
        'It is an owl that lives in a hole in the ground, and it cannot dig the hole. It moves into one a ground squirrel or a badger left behind, and comes back to the same one year after year.',
        'It is out in the daytime, which most owls are not, and it has long legs for an owl and runs after grasshoppers on foot.',
        'There are fewer of them than there used to be, so people build burrows for them out of buried pipe and boxes — and the owls move in. Washington has been doing it since 2010.',
        'No owl can turn its head all the way round. It goes about two hundred and seventy degrees, and the reason it has to turn its head at all is that its eyes are fixed tubes that cannot move in their sockets.',
        'A burrowing owl really does take small birds, and young ground squirrels out of the burrows it borrows. Not in this garden: it stands up tall on those long legs and watches them instead, because friends never hunt friends.'
      ],
      manners: 'Owls are watched from a long way off, and never from the burrow itself. Move slowly, keep quiet, do not stand over the hole — and if the owl starts bobbing up and down, that means you are too close, so go back.'
    },

    /* ---------------- friends from a long way away ----------------

       None of these five live anywhere near the Tri-Cities, and none of them
       pretend to. The first fact on every page says where it really lives, in
       miles, the way the Blue Morpho page does. You meet them where people
       look after them: quiet voice, behind the rail, no tapping, no feeding.
       Those are the rules a real visitor follows at a real zoo, which is why
       they are the rules here. */
    {
      id: 'giant_panda', name: 'Giant Panda', family: 'bear',
      way: 'visit', patience: 4.4, keep: 150, rarity: 5, value: 420,
      times: ['morning', 'day', 'evening'], places: ['mountain', 'forest'],
      measure: 'bigger than a Labrador, and a great deal wider', size: 1.25,
      art: { shape: 'panda', body: '#f5f1e8', body2: '#211e1c', belly: '#f5f1e8',
        head: '#f5f1e8', face: '#f5f1e8', ear: '#211e1c', leg: '#211e1c',
        tail: '#f5f1e8', accent: '#211e1c', eye: '#211e1c', nose: '#211e1c' },
      facts: [
        'A giant panda lives in cold, foggy mountain forests in central China — six mountain ranges, and nowhere else in the world. That is about seven thousand miles from your garden.',
        'It has a sixth finger. A wrist bone grew into a sort of thumb for holding bamboo, and pandas have had it for six or seven million years. It never got any longer, because the panda has to walk on that hand as well.',
        'A panda is a bear with a meat-eater’s insides, eating nothing but salad. More than ninety-eight parts in a hundred of what it eats is bamboo, and it digests it so badly that it has to eat for most of the day.',
        'A newborn panda weighs about a hundred and twelve grams — less than a small apple — while its mother weighs ninety kilograms.',
        'People say pandas are hopeless at having babies. They are not. A mother panda can only start a baby in a window of one to three days a year, which is narrow, not broken: there are about one thousand eight hundred and sixty-four wild pandas now, nearly a sixth more than twenty years ago, and two thirds of them live inside nature reserves.',
        'Unlike every other bear it does not sleep the winter away. It walks down the mountain instead, and walks back up in the summer.'
      ],
      manners: 'You will never meet a giant panda in a garden. You meet one at a zoo that helps look after them, and there you keep your voice quiet, never tap the glass, never feed it, and stay behind the rail. The rail is there for the panda as much as it is for you.'
    },
    {
      id: 'koala', name: 'Koala', family: 'koala',
      way: 'visit', patience: 4.0, keep: 130, rarity: 4, value: 300,
      times: ['day', 'evening', 'night'], places: ['forest', 'glade'],
      measure: 'about as long as your arm', size: 0.6,
      art: { shape: 'koala', body: '#9aa2a7', body2: '#818a90', belly: '#f1f0eb',
        head: '#9aa2a7', face: '#f1f0eb', ear: '#c8ced1', leg: '#9aa2a7',
        tail: '#9aa2a7', accent: '#f1f0eb', eye: '#1c1917', nose: '#241f1d' },
      facts: [
        'A koala lives in gum-tree forests in eastern Australia, about eight thousand miles from here, and it spends nearly its whole life up in the branches.',
        'A koala is not a bear. It is a marsupial, and its closest living relative is the wombat.',
        'Koalas have fingerprints — loops and whorls so like ours that under a microscope you cannot reliably tell them apart. They arrived at them completely separately from us.',
        'It is not drunk or dozy on eucalyptus. Gum leaves are poisonous, and a koala’s liver carries piles of extra copies of the genes that make the poison-breaking enzymes. What the leaves really are is nearly empty of energy — so a koala rests up to twenty hours a day because its dinner cannot pay for anything more.',
        'Nobody had properly written down that koalas drink at all until 2020, when scientists watched wild ones licking rainwater running down tree trunks. One of them drank for thirty-four minutes.',
        'In some parts of Australia there are still plenty of koalas. In Queensland, New South Wales and the ACT they are listed as endangered, and that is where the forest is being cut down.'
      ],
      manners: 'A koala is a wild animal, not a toy, and in most of Australia it is against the law to hold one. At a sanctuary you stand still, let the koala stay in its tree, and use a quiet voice — it sleeps twenty hours a day, and you would only be waking it up.'
    },
    {
      id: 'ocelot', name: 'Ocelot', family: 'cat',
      way: 'visit', patience: 5.6, keep: 150, rarity: 5, value: 400,
      times: ['evening', 'night'], places: ['rainforest', 'forest'],
      measure: 'about twice the size of a house cat', size: 0.68,
      art: { shape: 'ocelot', body: '#d6b173', body2: '#c49a5c', belly: '#f3ede2',
        head: '#d6b173', face: '#f3ede2', ear: '#211c18', leg: '#d6b173',
        tail: '#d6b173', accent: '#2a2118', eye: '#c9a227', nose: '#3a2a24' },
      facts: [
        'An ocelot is a spotted wild cat from the warm forests of South and Central America. A very few still live in thick thorny scrub in the far south of Texas — no more than about eighty in the whole of the United States.',
        'Its spots are not scattered dots like a leopard’s. They are long open rings with black edges, joined up into chains that run in lines along its body.',
        'It is a cat that likes water and swims well, which most cats do not.',
        'Two thirds of everything an ocelot eats is small rodents — mice and rats — and it takes lizards, crabs and fish too. It is not a deer hunter.',
        'Around the world the ocelot is not in trouble at all. It is only the American ones that are, which is worth knowing: where an animal lives matters as much as what it is.',
        'About four in every ten ocelots that die at Laguna Atascosa are hit by cars, so Texas now digs tunnels for them under the roads. The real way to help an ocelot is for grown-ups to drive slowly at night where they live.',
        'A wild cat this size really does take small birds. Not in this garden: it sits down and watches instead, because friends never hunt friends.'
      ],
      manners: 'You do not meet an ocelot in a garden — it comes out at night, and there are hardly any left. At a zoo you keep back, keep quiet, never tap the glass and never feed it.'
    },
    {
      id: 'red_panda', name: 'Red Panda', family: 'redpanda',
      way: 'visit', patience: 4.6, keep: 130, rarity: 5, value: 380,
      times: ['morning', 'evening'], places: ['mountain', 'taiga'],
      measure: 'about the size of a big house cat, with a tail nearly as long again', size: 0.55,
      art: { shape: 'redpanda', body: '#b85c29', body2: '#8c4a24', belly: '#2b1c14',
        head: '#b85c29', face: '#f7f3ec', ear: '#f7f3ec', leg: '#2b1c14',
        tail: '#c4622c', accent: '#6b3a22', eye: '#1a1512', nose: '#241b16' },
      facts: [
        'A red panda lives high up in cold, misty mountain forests in Nepal, India, Bhutan, northern Myanmar and China, where it snows and bamboo grows under the trees.',
        'The red panda was called a panda first. It was written up in 1825, about fifty years before anyone in Europe catalogued the giant panda — so the big one is named after the little one.',
        'It is not a panda, not a bear and not a raccoon. It is the only living member of its whole family, and its nearest relatives are skunks, raccoons and weasels. There is nothing else like it anywhere.',
        'It has a false thumb for holding bamboo, exactly like a giant panda — and the two of them are not related at all. Two different animals with the same problem invented the same tool.',
        'It comes down a tree head-first, which almost nothing its size can do, and it sleeps with its tail over its face like a blanket.',
        'About ninety-five parts in a hundred of what it eats is bamboo, and it only bothers with the tender leaf tips. It digests about a quarter of what it swallows.',
        'There are fewer than ten thousand grown-up red pandas left, and the number is still going down.'
      ],
      manners: 'Red pandas live a long way up a mountain, and you would only ever see one at a zoo that helps save them: quiet voice, stay back. And here is the odd one — one of the best things anybody can do for a red panda is keep a dog on its lead, because loose dogs chase them and give them diseases.'
    },
    {
      id: 'axolotl', name: 'Axolotl', family: 'salamander',
      way: 'visit', patience: 3.0, keep: 44, rarity: 5, value: 360,
      times: ['any'], places: ['pond', 'riverbank'],
      measure: 'about as long as a pencil and a half', size: 0.34,
      art: { shape: 'axolotl', body: '#e8afc0', body2: '#4a4638', belly: '#f4ceda',
        head: '#e8afc0', face: '#f4ceda', leg: '#e8afc0', tail: '#e8afc0',
        accent: '#d45c7a', eye: '#2b2b2b', nose: '#d45c7a' },
      facts: [
        'An axolotl lives in the canals of one city in Mexico, high up in the mountains, and nowhere else on Earth. There used to be two lakes; one of them, Lake Chalco, has been drained away and is gone.',
        'An axolotl is not a fish. It is an amphibian — a salamander — and those feathery frills behind its head are gills it simply never lost.',
        'Almost every other salamander grows up, loses its gills and walks out onto land. The axolotl just does not. It becomes a grown-up, has babies of its own, and stays a swimming larva its whole life.',
        'The pink one is the pet-and-laboratory kind. Wild axolotls are dark mottled brown and green, and they were the top hunter of their lake: a sit-still-and-wait animal that snaps sideways and sucks its dinner in.',
        'It can regrow a whole leg — bone, muscle, nerves and skin — and leave no scar at all. But it is not magic. If the same leg is taken off over and over it comes back less and less well, and in the end it heals over with scar tissue instead.',
        'There may be fewer than a thousand left in the wild, while thousands more live safely in tanks all over the world. In 2025 scientists put eighteen captive-bred ones back into the water and followed them by radio: every one fed itself and put on weight, and two were later eaten by herons, which is exactly how it is supposed to go.',
        'It is not smiling. Its mouth is a straight line that turns up at the corners because of the shape of its jaw, and it has no expression on its face at all.'
      ],
      manners: 'Some people keep axolotls in tanks. If you ever have one, the rule is absolute: never, ever put it in a pond or a stream or a lake. A pet let loose does not go home — it harms the animals that already live there.'
    },

    /* ---------------- bird town ----------------

       Six songbirds you meet by putting food or a house out and then going a
       long way away. Nobody is hand-fed: chickadees really will land on a
       still hand, and it is on the chickadee's page as a fact rather than as
       a method, because a child who learns "birds eat from my hand" will try
       it on gulls and geese, where it does real harm. */
    {
      id: 'chickadee', name: 'Black-capped Chickadee', family: 'songbird',
      way: 'seedtray', patience: 3.0, keep: 70, rarity: 1, value: 45,
      times: ['morning', 'day'], places: ['garden', 'forest', 'orchard', 'glade'],
      measure: 'a round little bird about as long as your thumb and palm', size: 0.3,
      art: { shape: 'songbird', body: '#9a9e9c', body2: '#8a8e8c', wing: '#b2b6b2',
        cap: '#1e1c1a', bib: '#1e1c1a', face: '#f6f4ec', belly: '#f1ece0',
        head: '#1e1c1a', leg: '#3a3532', tail: '#8a8e8a', accent: '#f6f4ec',
        eye: '#141210', nose: '#2a2724' },
      facts: [
        'It hides food all over the garden, one seed at a time, in a different place each time — and it can remember thousands of hiding places.',
        'Its name is a burglar alarm. The more "dee" notes on the end of chickadee-dee-dee, the more dangerous the thing it has spotted: a little pygmy-owl, quick enough to catch a chickadee, earned as many as twenty-three dees, while a great clumsy horned owl got far fewer.',
        'Every autumn it rebuilds part of its own brain, letting the cells holding old information die and growing new ones, so it can keep up with a flock that keeps changing.',
        'However cold the night, a chickadee sleeps in a little hole of its own. They almost never share one.',
        'Chickadees are so bold that people who sit very still for a very long time have had one land on their hand. The kind thing is still to let it take its seed from the feeder.'
      ],
      manners: 'Chickadees come close if you sit still and quiet. Let them take seed from the feeder and not from your hand, keep the feeder clean, and wash your hands afterwards.'
    },
    {
      id: 'red_breasted_nuthatch', name: 'Red-breasted Nuthatch', family: 'songbird',
      way: 'seedtray', patience: 4.0, keep: 86, rarity: 2, value: 80,
      times: ['morning', 'day'], places: ['forest', 'taiga', 'mountain', 'garden'],
      measure: 'smaller than a chickadee, with hardly any tail', size: 0.28,
      art: { shape: 'songbird', body: '#6a8296', body2: '#546c80', wing: '#546c80',
        cap: '#1e2228', bib: '#c98a5c', face: '#f4f1e8', belly: '#c98a5c',
        head: '#1e2228', leg: '#6a6058', tail: '#546c80', accent: '#1e2228',
        eye: '#141210', nose: '#3a3a38' },
      facts: [
        'It puts glue on its own front door. It gathers blobs of sticky resin from pine trees and smears them all round the entrance of its nest hole — the father does the outside, the mother the inside — most likely to keep other animals out.',
        'It walks down a tree trunk head-first, which almost no other bird can do. It goes up, down and sideways without minding which way is up, and never props itself on its tail the way a woodpecker does.',
        'It steals. Red-breasted nuthatches have been caught taking nest material from pygmy nuthatches and mountain chickadees.',
        'Its bill is a little chisel for prising insects out of the cracks in bark.'
      ],
      manners: 'Fill the feeder, then step well back — nuthatches come when the garden is calm. Wash the feeder often so that nobody gets ill from it, and take it down altogether if you ever see a poorly bird.'
    },
    {
      id: 'dark_eyed_junco', name: 'Dark-eyed Junco', family: 'songbird',
      way: 'seedtray', patience: 2.6, keep: 66, rarity: 1, value: 40,
      times: ['morning', 'day', 'evening'], places: ['garden', 'forest', 'meadow', 'glade'],
      measure: 'about as long as a teaspoon and a half', size: 0.33,
      art: { shape: 'songbird', body: '#8a6a52', body2: '#6b5546', wing: '#6b5546',
        cap: '#3a3438', bib: '#3a3438', face: '#3a3438', belly: '#f2efe6',
        head: '#3a3438', leg: '#c8907a', tail: '#3a3438', accent: '#d8b9a4',
        eye: '#141210', nose: '#e8c2c8' },
      facts: [
        'It is one of the commonest birds on the whole continent. There are about six hundred and thirty million of them.',
        'People call it the snowbird, because it turns up in gardens when the cold arrives and goes back up into the hills in spring.',
        'It feeds on the ground, hopping round the bottoms of bushes after fallen seed, rather than clinging onto a feeder.',
        'Its bill is pale pink, and the outer feathers of its tail are white — they flash like two white stripes the moment it flies.',
        'The oldest one anybody knows of lived at least eleven years and four months.'
      ],
      manners: 'Juncos feed on the ground, so scatter a little seed low down and then move well away. Keeping cats indoors is the kindest thing anybody can do for them.'
    },
    {
      id: 'american_goldfinch', name: 'American Goldfinch', family: 'songbird',
      way: 'seedtray', patience: 3.6, keep: 78, rarity: 2, value: 95,
      times: ['day'], places: ['garden', 'meadow', 'orchard', 'riverbank'],
      measure: 'about as long as your thumb and palm', size: 0.3,
      art: { shape: 'songbird', body: '#e8c72a', body2: '#d8b620', wing: '#1e1c19',
        cap: '#1e1c19', bib: '#e8c72a', face: '#e8c72a', belly: '#f0e08a',
        head: '#e8c72a', leg: '#c8a06a', tail: '#1e1c19', accent: '#f4f2ea',
        eye: '#141210', nose: '#e08a2a' },
      facts: [
        'It is Washington’s state bird. In 1951 the legislature let schoolchildren choose, and they picked the willow goldfinch over the meadowlark.',
        'It is a vegetarian — one of the strictest in the whole bird world, eating seeds and nothing else at all. It chases nothing, ever. That accidentally saves it: a cowbird chick smuggled into a goldfinch nest cannot live on a diet of seeds.',
        'It waits. Goldfinches nest later than almost any other bird here, in June or July, when the thistledown they line the nest with is finally ready.',
        'It changes clothes twice a year. In winter the bright yellow male turns plain streaky brown with blackish wings, and looks like a completely different bird.',
        'Its flight is a deep bouncing dip, up and down like a skipping stone.'
      ],
      manners: 'Goldfinches love nyjer seed and clean water. Never give any bird bread — it fills them right up without feeding them at all.'
    },
    {
      id: 'violet_green_swallow', name: 'Violet-green Swallow', family: 'songbird',
      way: 'nestbox', patience: 5.2, keep: 104, rarity: 3, value: 150,
      times: ['morning', 'day', 'evening'], places: ['meadow', 'riverbank', 'pond', 'hill', 'glade'],
      measure: 'wings more than twice as wide as the bird is long', size: 0.37,
      art: { shape: 'songbird', body: '#4a7a5c', body2: '#3a5f4a', wing: '#2f4a52',
        cap: '#3a5a4a', bib: '#f6f4ee', face: '#f6f4ee', belly: '#f6f4ee',
        head: '#3a5a4a', leg: '#3a3532', tail: '#2f4a52', accent: '#6b5a9c',
        eye: '#141210', nose: '#2a2724' },
      facts: [
        'It eats in the air, catching flying insects in mid-air, and it has been clocked at twenty-eight miles an hour.',
        'Its Latin name means "fast moving, of the sea".',
        'Its wings are so long that when it perches the wingtips stick out past the end of its tail. That is how you know it.',
        'There are white patches on both sides of its rump that nearly meet over the tail. Birdwatchers call them saddlebags, and from underneath they are the easiest thing on the bird to spot.',
        'One pair was recorded helping a pair of western bluebirds feed their chicks — somebody else’s chicks entirely.'
      ],
      manners: 'Put the nest box up in early spring and then leave it alone. Once a family has moved in, watch from far away and never open it to peek — the law says so too, and so does the bird.'
    },
    {
      id: 'western_bluebird', name: 'Western Bluebird', family: 'songbird',
      way: 'nestbox', patience: 5.6, keep: 100, rarity: 3, value: 170,
      times: ['morning', 'day'], places: ['meadow', 'orchard', 'glade', 'hill'],
      measure: 'the biggest bird in Bird Town, and still smaller than your hand', size: 0.41,
      art: { shape: 'songbird', body: '#2f5aa8', body2: '#26478a', wing: '#26478a',
        cap: '#2f5aa8', bib: '#2f5aa8', face: '#2f5aa8', belly: '#f0ece0',
        head: '#2f5aa8', leg: '#3a3532', tail: '#26478a', accent: '#b5622f',
        eye: '#141210', nose: '#2a2724' },
      facts: [
        'It cannot make its own front door. Western bluebirds nest in holes but cannot cut one, so they depend on woodpeckers, dead trees, or a box somebody put up — which makes a nest box genuinely useful rather than just pretty.',
        'Bluebird families sometimes have babysitters. Extra grown-up birds turn up and bring food to chicks that are not theirs at all.',
        'A bluebird weighs about an ounce and needs about fifteen calories a day — and twenty-three when there is a nestful of babies to feed.',
        'It hunts by sitting very still on a low perch and dropping straight down onto the ground. In winter it eats berries instead.'
      ],
      manners: 'Bluebirds want a box with no perch on the front — a perch only helps something else climb in — and a quiet garden round it. Watch from the window, and never touch the eggs or the babies.'
    },

    /* ---------------- snakes ----------------

       Four snakes, and one rule that covers all four of them: stand still,
       then step back, and let it go. She never has to work out which snake it
       is, which matters, because the usual test does not work - a gopher
       snake flattens its head into a triangle and buzzes its tail on purpose.

       The Western Rattlesnake is `lookOnly`, the only friend that is. She is
       venomous, she lives right here, and the whole point of her page is that
       you back away from her and are pleased with yourself afterwards. */
    {
      id: 'garter_snake', name: 'Common Garter Snake', family: 'snake',
      way: 'snakestill', patience: 3.2, keep: 55, rarity: 1, value: 50,
      times: ['morning', 'day'], places: ['garden', 'pond', 'riverbank', 'meadow'],
      measure: 'about as long as your arm, and thinner than a pencil', size: 0.56,
      art: { shape: 'snake', body: '#2f3630', body2: '#1e231f', stripe: '#e0d86a',
        pattern: 'stripes', belly: '#9ac4b4', head: '#2f3630', face: '#2f3630',
        tail: '#2f3630', accent: '#c8503a', eye: '#141210', nose: '#c8503a' },
      facts: [
        'It eats the rough-skinned newt, one of the most poisonous animals in the Pacific Northwest, and lives. It is the only animal known that can carry a resistance to that poison — and where the newts are more poisonous, the snakes are more resistant.',
        'It does not lay eggs. The mother gives birth to live baby snakes, usually ten to fifteen of them, though one litter got up to eighty-five.',
        'Its forked tongue smells in stereo. Each fork carries its scent to its own organ in the roof of the mouth, so the snake knows instantly which side the smell is stronger on.',
        'It is not venomous, and its bite cannot really hurt you. What a frightened one does is smear foul-smelling musk over your hands — that is the snake saying put me down, and it washes off.',
        'A garter snake really does hunt frogs, and in this garden it is allowed to try. Like every chase here, it never catches one. It goes the other way too: a bullfrog is quite big enough to swallow a garter snake.',
        'Garter snakes have been written down in every county in Washington except two — Benton and Franklin, which is here. They are almost certainly about; it is just that nobody has sent in a record.'
      ],
      manners: 'Watch garter snakes with your eyes, not your hands. Stand still, then step back, and let it go where it was going — and wash your hands afterwards if you have been poking about where snakes live.'
    },
    {
      id: 'gopher_snake', name: 'Gopher Snake', family: 'snake',
      way: 'snakestill', patience: 4.4, keep: 92, rarity: 3, value: 160,
      times: ['day', 'evening'], places: ['desert', 'meadow', 'hill', 'orchard'],
      measure: 'longer than you are tall', size: 0.8,
      art: { shape: 'snake', body: '#d8c48a', body2: '#b89a62', stripe: '#4a3a24',
        pattern: 'blotches', belly: '#f2ece0', head: '#d8c48a', face: '#d8c48a',
        tail: '#c8b078', accent: '#2f2620', eye: '#141210', nose: '#3a3028' },
      facts: [
        'A gopher snake with no rattle at all can still sound exactly like one. Frightened, it hisses, puffs itself up, flattens its head into a triangle and shakes its tail hard — and in dry grass that buzzes just like a rattlesnake. It is bluffing. It has no venom whatsoever.',
        'Look at the tail to find out the truth. A rattlesnake’s tail is blunt and ends in a rattle; a gopher snake’s tapers away to a point, and it has no heat-sensing pits on its face.',
        'It lays some of the biggest eggs of any snake in the United States, and the babies hatch out already thirteen to seventeen inches long.',
        'It hunts mice, rats and moles, and it kills by wrapping round them. It has no venom to bite with.',
        'It really does raid birds’ nests for eggs. Not in this garden: it glides quietly past and leaves them be, because friends never hunt friends.'
      ],
      manners: 'A gopher snake puffing and buzzing at you is a harmless snake pretending to be a dangerous one. Back away anyway and let it settle down — you never have to work out which snake it is, because every snake gets the same good manners.'
    },
    {
      id: 'rubber_boa', name: 'Northern Rubber Boa', family: 'snake',
      way: 'snakestill', patience: 4.8, keep: 42, rarity: 4, value: 240,
      times: ['evening', 'night'], places: ['forest', 'mountain', 'taiga', 'glade'],
      measure: 'about as long as your forearm, and fat with it', size: 0.47,
      art: { shape: 'snake', body: '#8a6a4a', body2: '#6b5238', stripe: '#8a6a4a',
        pattern: 'plain', belly: '#e0d08a', head: '#8a6a4a', face: '#8a6a4a',
        tail: '#8a6a4a', accent: '#c8a882', eye: '#241c16', nose: '#5a4430' },
      facts: [
        'It has two heads — sort of. Its tail is short and blunt and looks very like its head, with hard bone inside, and when it is frightened it rolls into a ball, hides its real head in the middle and waves the fake one at you.',
        'The trick works. Wild rubber boas are found with scars on their tails, from animals that went for the wrong end.',
        'It is one of the very few snakes that almost never bites. Wildlife officers call rubber boas slow and non-aggressive and say they can be safely watched — watched, not held.',
        'It hunts baby mice inside their nest, and it fends off the mother with that decoy tail while it does it.',
        'Its skin is loose and wrinkled and looks as soft as rubber, but no snake is slimy. Snake skin is dry, smooth and scaly.'
      ],
      manners: 'Rubber boas are the gentlest snakes there are, and they still belong to the wild. Look closely, keep your hands down, and let it slip away into the leaves.'
    },
    {
      /* The only friend who is never touched, and the only one worth nothing
         in sparkles. Meeting her is the whole reward. See `lookOnly` on the
         black widow in the Bug Book: the same idea, the same `danger` line
         shown every single time. */
      id: 'western_rattlesnake', name: 'Western Rattlesnake', family: 'snake',
      way: 'backaway', patience: 5.0, keep: 185, rarity: 5, value: 0,
      lookOnly: true,
      times: ['day', 'evening', 'night'], places: ['desert', 'hill'],
      measure: 'about two feet long, and thick with it', size: 0.71,
      danger: 'If you hear a buzz, or see a rattlesnake, stop. Step slowly backwards, and go and tell a grown-up. Never poke it, never chase it, never throw anything at it. And never put your hands or your feet anywhere you cannot see first — not under a rock, not into long grass.',
      art: { shape: 'snake', body: '#b9a480', body2: '#8a7452', stripe: '#4a3a28',
        pattern: 'diamond', belly: '#e8dcc4', head: '#b9a480', face: '#b9a480',
        tail: '#d8cbb5', accent: '#2f2620', eye: '#e0c86a', nose: '#3a3028' },
      facts: [
        'This is the only venomous snake in the whole of Washington, and it lives right here. There is a mountain named after it in Benton County.',
        'It sees warmth. There is a little pit between each eye and each nostril that picks up a difference of less than a fraction of a degree, so it can find a mouse in complete darkness.',
        'You cannot count the rings to find out its age. A new ring is added every time it sheds its skin, a young snake sheds three or four times in one summer, and the old rings break off the end anyway.',
        'A rattlesnake mother stays with her newborns for ten to fourteen days, until their first shed turns the silent little button on their tails into a real first rattle.',
        'Baby rattlesnakes are not more dangerous than grown-up ones. That is a story, and a scientist took it apart properly: babies can control how much venom they use, adults carry far more of it, and adults make people far iller. Give every snake the same room, whatever size it is.',
        'It would much rather you went away. It does not think of people as food and will not bite unless it is threatened, and it only coils up like that when it cannot get away by crawling.',
        'It does not chase anybody. A snake coming towards you is a snake escaping towards the only cover it can see — and from where it is standing, you are the dangerous one.'
      ],
      manners: 'This is the one friend you never walk towards and never touch. Stop as soon as you see or hear her, step slowly backwards until she is a long way behind you, and tell a grown-up. Stay on the open path, and never put a hand or a foot anywhere you have not looked first.'
    }
  ];

  /* ------------------------------------------------------------------
     WHAT EACH ONE REALLY HUNTS

     A friend only ever chases something it truly eats, and nothing else.
     The lists are per species, not per family, because the species is where
     the truth lives: a Little Brown Bat takes midges off the water and a
     Hoary Bat takes moths out of the treetops, and neither of them will ever
     go near an earthworm.

     Left out on purpose, and not by mistake:
       bees and wasps   - real for nearly all of them, and not something to
                          animate a child's friend doing. It is a sting in
                          the mouth either way.
       monarchs         - nothing in this garden hunts a monarch, the same
                          rule the bug food chain already keeps.
       anything too big - a hummingbird's beak is tiny. Cornell says "smaller
                          insects" every single time, so no dragonfly, no
                          grasshopper, no beetle. A dragonfly has been filmed
                          catching a hummingbird; it does not go the other way.
       the ground       - bats hunt in the air. No worms, no snails, no pill
                          bugs. The Little Brown Bat is the one exception, and
                          only because it really does hover beside a leaf and
                          pick a resting insect or a spider straight off it.
       fish and crayfish - only the bullfrog, which really does take them.
                          They live in the water and the chase never actually
                          starts, but the book tells the truth about it.
     ------------------------------------------------------------------ */

  var HUMMER_SMALL = ['aphid', 'leafhopper', 'hoverfly', 'housefly', 'crane_fly',
    'apple_maggot_fly', 'kelp_fly', 'mayfly', 'caterpillar',
    'garden_spider', 'cross_orbweaver', 'ant'];

  /* moths, crickets, beetles and flies - what a cat or a dog in a garden
     really does go after */
  var GARDEN_FLUTTERERS = ['blue_butterfly', 'cabbage_white', 'swallowtail',
    'behrs_hairstreak', 'luna_moth', 'io_moth', 'rosy_maple', 'hawk_moth',
    'clearwing'];
  var GARDEN_HOPPERS = ['grasshopper', 'cricket', 'katydid', 'cicada',
    'periodical_cicada'];
  var GARDEN_BEETLES = ['jewel_beetle', 'stag_beetle', 'ground_beetle',
    'tenlined_beetle', 'tiger_beetle'];

  var CAT_PREY = GARDEN_FLUTTERERS
    .concat(GARDEN_HOPPERS)
    .concat(GARDEN_BEETLES)
    .concat(['dragonfly', 'emperor_dragonfly', 'damselfly',
      'crane_fly', 'housefly', 'garden_spider', 'cross_orbweaver']);

  /* dogs snap at anything that flies past and dig after a beetle, but they
     do not hunt spiders, ants, worms or slugs - they only eat them */
  var DOG_PREY = GARDEN_FLUTTERERS
    .concat(GARDEN_HOPPERS)
    .concat(GARDEN_BEETLES)
    .concat(['dragonfly', 'emperor_dragonfly', 'crane_fly', 'housefly']);

  /* a frog the size of a fist: flying insects above all, plus whatever
     crawls past its nose */
  var POND_FROG_PREY = ['snail', 'earthworm', 'pillbug', 'cricket', 'grasshopper',
    'housefly', 'hoverfly', 'crane_fly', 'mayfly', 'caddisfly', 'water_strider',
    'rosy_maple', 'io_moth', 'ground_beetle', 'sap_beetle', 'ant', 'garden_spider'];

  /* a frog the size of a paperclip: flies, ants, aphids, little spiders */
  var TINY_FROG_PREY = ['housefly', 'hoverfly', 'crane_fly', 'mayfly', 'kelp_fly',
    'ant', 'aphid', 'leafhopper', 'sap_beetle', 'garden_spider'];

  var ANIMAL_HUNTS = GG.ANIMAL_HUNTS = {
    /* --- hummingbirds: protein the flowers cannot give them --- */
    ruby_hummingbird: HUMMER_SMALL,
    annas_hummingbird: HUMMER_SMALL,
    rufous_hummingbird: ['aphid', 'leafhopper', 'hoverfly', 'housefly', 'crane_fly',
      'apple_maggot_fly', 'kelp_fly', 'mayfly'],

    /* --- frogs: sit still, wait, and flick out a tongue --- */
    chorus_frog: TINY_FROG_PREY,
    red_legged_frog: POND_FROG_PREY,
    green_frog: POND_FROG_PREY,
    /* the bullfrog will try to swallow anything that fits, and that really
       does include fish and crayfish */
    bullfrog: POND_FROG_PREY.concat(['minnow', 'crayfish', 'dragonfly',
      'emperor_dragonfly', 'damselfly', 'stonefly', 'cockroach']),

    /* --- bats: the air, and only the air --- */
    little_brown_bat: ['crane_fly', 'housefly', 'mayfly', 'mayfly_river', 'caddisfly',
      'lacewing', 'rosy_maple', 'io_moth', 'apple_maggot_fly', 'kelp_fly',
      'garden_spider'],
    big_brown_bat: ['tenlined_beetle', 'stag_beetle', 'ground_beetle', 'lacewing',
      'crane_fly', 'housefly', 'caddisfly', 'hawk_moth', 'io_moth', 'rosy_maple',
      'luna_moth'],
    hoary_bat: ['luna_moth', 'io_moth', 'rosy_maple', 'hawk_moth', 'crane_fly',
      'caddisfly', 'tenlined_beetle', 'stag_beetle'],

    /* --- dogs: search, approach, chase, and then nothing --- */
    labrador: DOG_PREY,
    corgi: DOG_PREY,
    beagle: DOG_PREY,
    border_collie: DOG_PREY,
    cookie: DOG_PREY,

    /* --- cats: because they are cats, not because they are hungry --- */
    tabby: CAT_PREY,
    calico: CAT_PREY,
    siamese: CAT_PREY,
    maine_coon: CAT_PREY,

    /* --- the ocelot: two thirds of what it eats is mice and rats, and after
       that it is lizards, crabs, fish and the odd big insect. Nothing here is
       a butterfly, because a wild cat that size does not bother with one. --- */
    ocelot: ['crayfish', 'minnow', 'creek_chub', 'cricket', 'grasshopper',
      'jerusalem_cricket'],

    /* --- the turtle: it does not chase. It plods over and takes whatever is
       slow enough, in the water and at the edge of it. --- */
    painted_turtle: ['snail', 'sideband_snail', 'pillbug', 'earthworm', 'water_strider',
      'boatman', 'backswimmer', 'mayfly', 'caddisfly', 'crayfish', 'minnow'],

    /* --- the bear: nine tenths of a bear is a berry-picker, so this is the
       other tenth - ants and grubs turned out of a rotting log, and fish in a
       stream. --- */
    black_bear: ['ant', 'ground_beetle', 'sap_beetle', 'stag_beetle', 'pine_beetle',
      'click_beetle', 'minnow', 'creek_chub', 'rainbow_trout', 'chinook'],

    /* --- the raccoon: WDFW's own list, which is "particularly fond of
       creatures found in water" - crayfish, snails, frogs and little fish.
       The frogs are friends, so see FRIEND_RULE. --- */
    raccoon: ['crayfish', 'snail', 'sideband_snail', 'earthworm', 'minnow', 'bluegill',
      'pumpkinseed', 'creek_chub', 'ground_beetle', 'sap_beetle'],

    /* --- the fox: mice above all, and then grasshoppers, beetles, worms and
       berries. The rabbits and squirrels are friends. --- */
    red_fox: ['grasshopper', 'pallid_grasshopper', 'cricket', 'mormon_cricket',
      'katydid', 'ground_beetle', 'tenlined_beetle', 'earthworm'],

    /* --- the otter: "mostly fish", plus crayfish and big water beetles, and
       food goes through it in an hour, so it never stops. --- */
    river_otter: ['minnow', 'creek_chub', 'bluegill', 'pumpkinseed', 'perch', 'crappie',
      'sculpin', 'carp', 'smallmouth', 'rainbow_trout', 'crayfish', 'water_bug'],

    /* --- the chicken: an enthusiastic and very effective bug hunter --- */
    chicken: ['grasshopper', 'cricket', 'katydid', 'earwig', 'pillbug', 'earthworm',
      'snail', 'ant', 'ground_beetle', 'sap_beetle', 'click_beetle', 'housefly',
      'caterpillar', 'cockroach', 'silverfish'],

    /* --- the burrowing owl: insects come first by a long way, and it runs
       after them on those long legs. --- */
    burrowing_owl: ['grasshopper', 'pallid_grasshopper', 'mormon_cricket', 'cricket',
      'jerusalem_cricket', 'ground_beetle', 'tenlined_beetle', 'tiger_beetle',
      'pinacate_beetle', 'hawk_moth'],

    /* --- the axolotl: a sit-still-and-wait hunter that snaps sideways. It
       was the top hunter of its lake. --- */
    axolotl: ['minnow', 'earthworm', 'water_strider', 'boatman', 'backswimmer',
      'mayfly', 'caddisfly'],

    /* --- the songbirds. Insects and spiders, gleaned off bark and leaves and
       the ground - except the goldfinch, which chases nothing at all, ever.
       See ANIMAL_FORAGE for that one. --- */
    chickadee: ['caterpillar', 'aphid', 'leafhopper', 'ant', 'garden_spider',
      'cross_orbweaver', 'crab_spider', 'lacewing', 'sap_beetle', 'weevil'],
    red_breasted_nuthatch: ['ant', 'aphid', 'weevil', 'sap_beetle', 'pine_beetle',
      'crab_spider', 'lacewing', 'caterpillar', 'click_beetle', 'leafhopper'],
    dark_eyed_junco: ['ant', 'aphid', 'leafhopper', 'sap_beetle', 'caterpillar', 'pillbug'],
    violet_green_swallow: ['crane_fly', 'housefly', 'hoverfly', 'mayfly', 'mayfly_river',
      'kelp_fly', 'lacewing', 'aphid', 'leafhopper'],
    western_bluebird: ['grasshopper', 'cricket', 'caterpillar', 'ground_beetle',
      'sap_beetle', 'crab_spider', 'pillbug', 'earwig', 'click_beetle'],

    /* --- the garter snake, and the one friend-on-friend chase in the whole
       garden. Everything else that hunts a friend stops and watches; David
       said the garter snake may chase a frog, because it truly does, and
       because - like every chase here - it never catches one. The frog it
       could really take is the little Pacific Chorus Frog. A bullfrog is the
       other way round: it is big enough to swallow the snake. --- */
    garter_snake: ['earthworm', 'banana_slug', 'minnow', 'creek_chub', 'chorus_frog']

    /* --- parrots: nothing at all. See ANIMAL_FORAGE. --- */

    /* --- and three friends are on neither list, on purpose. The gopher
       snake, the rubber boa and the rattlesnake hunt mice, voles, moles and
       nestlings, mostly down inside a burrow, and there are no mice in this
       garden - so there is nothing here for them to go after. That silence is
       the truth, not a gap. --- */
  };

  /* How each family goes about it. The style drives the animation, and every
     one of them is the real thing:
       pounce - a cat: creep, freeze, then a short rush and a miss
       dash   - a dog: straight in at a run, one snap, gone
       hover  - a hummingbird: come up close, hold in the air, pick
       swoop  - a bat: a fast pass out of the dark
       ambush - a frog: do not chase at all. Sit. Wait. Tongue. */
  var HUNT_STYLE = GG.ANIMAL_HUNT_STYLE = {
    cat: 'pounce', dog: 'dash', hummingbird: 'hover', bat: 'swoop', frog: 'ambush',
    /* a fox mouses: ears forward, head cocked, then a high jump and a
       nose-first landing - which is a pounce with the volume turned up */
    fox: 'pounce',
    /* a raccoon feels about in the shallows and then makes a short rush */
    raccoon: 'pounce',
    /* a garter snake creeps and then strikes, and misses */
    snake: 'pounce',
    /* a bear can run as fast as a racehorse, which is the surprise of it */
    bear: 'dash',
    /* an otter is never still, and a chicken goes in like a small feathery
       dog. The burrowing owl runs after grasshoppers on its long legs. */
    otter: 'dash', chicken: 'dash', owl: 'dash', songbird: 'dash',
    /* a turtle and an axolotl do not chase at all: they wait, and then the
       head goes forward */
    turtle: 'ambush', salamander: 'ambush'
  };

  /* Where one species does it differently from the rest of its family. A
     violet-green swallow never lands on anything: it eats in the air. */
  var HUNT_STYLE_BY_ID = GG.ANIMAL_HUNT_STYLE_BY_ID = {
    violet_green_swallow: 'swoop'
  };

  /* ------------------------------------------------------------------
     THE ONES THAT DO NOT HUNT

     Parrots are not hunters and should not be made into them. A budgie eats
     grass seed, a cockatiel walks about on the ground after fallen seed, a
     macaw eats fruit and nuts and riverbank clay, and a grey parrot eats an
     insect now and then without ever chasing one. So they forage instead:
     they stop, work at something with that beak, and make a mess.
     ------------------------------------------------------------------ */
  var ANIMAL_FORAGE = GG.ANIMAL_FORAGE = {
    budgie: { doing: 'nibbling seeds off a grass head', bits: '#d8c86a',
      note: 'Grass seed, and nothing else. It is so full of goodness that a budgie needs no other food at all.' },
    cockatiel: { doing: 'walking about after fallen seed', bits: '#c8b88a',
      note: 'Almost the only parrot that forages on the ground, picking up seed a step at a time.' },
    scarlet_macaw: { doing: 'working a hard nut open', bits: '#c8a06a',
      note: 'Fruit, nuts and seeds, cracked with a beak strong enough to open what nothing else can.' },
    african_grey: { doing: 'peeling the bark off a twig', bits: '#9a8a72',
      note: 'Nuts, fruit, leaves, bark and flowers, and the odd insect it finds — never one it chased.' },

    /* --- and the grass-eaters, the leaf-eaters and the seed-eaters. None of
       these chases anything, and that is not a gap either. --- */
    nuttalls_cottontail: { doing: 'cropping the grass, ears up', bits: '#8fae62',
      note: 'Grass first, then sagebrush and juniper berries when the grass dries up. More than half its time out in the open is spent eating.' },
    fox_squirrel: { doing: 'turning a nut over in both hands', bits: '#c8a06a',
      note: 'Nuts, seeds and buds — buried one at a time, in a different place each time, and remembered by landmarks.' },
    townsends_squirrel: { doing: 'nibbling at the green shoots', bits: '#9ab86a',
      note: 'Green shoots and seeds, eaten fast: it is only awake for four or five months of the year.' },
    mule_deer: { doing: 'browsing at the shrubs', bits: '#7fa060',
      note: 'Shrubs, sagebrush, wild flowers and windfall fruit, taken a mouthful at a time with the head up between each one.' },
    moose: { doing: 'stripping the willow leaves', bits: '#6f9a58',
      note: 'Willow, water plants and shrubs. A moose steps over what a deer would jump, and eats the tops of things nothing else can reach.' },
    cow: { doing: 'tearing at the grass, then chewing the cud', bits: '#8fb05a',
      note: 'Grass, and seventy kilograms of it on a good day — torn off with the tongue, because she has no top front teeth.' },
    horse: { doing: 'grazing, with one hind hoof tipped up', bits: '#9ab462',
      note: 'Grass and hay, all day long in small amounts, which is how a horse is built to eat.' },
    sheep: { doing: 'grazing close to the ground', bits: '#a8bc72',
      note: 'Grass, with her eyes rolled level so the horizon stays sharp while her head is down.' },
    mallard: { doing: 'tipping bottom-up in the shallows', bits: '#7f9a6a',
      note: 'Seeds, pond weed, snails and water insects, grazed off the bottom upside down. A mallard almost never dives.' },
    giant_panda: { doing: 'working through a bamboo stem', bits: '#8aa860',
      note: 'Bamboo, and nothing else worth mentioning — with a meat-eater’s insides that can barely digest it, which is why it eats nearly all day.' },
    koala: { doing: 'picking through the gum leaves', bits: '#87a48a',
      note: 'Gum leaves, which are poisonous and nearly empty of energy. Its liver takes the poison apart; the sleeping is because there is nothing left over.' },
    red_panda: { doing: 'nipping off the tender leaf tips', bits: '#8aa860',
      note: 'Bamboo leaf tips and shoots, held in a false thumb — and it digests only about a quarter of what it swallows.' },
    american_goldfinch: { doing: 'working seeds out of a thistle head', bits: '#d8c86a',
      note: 'Seeds, and only seeds. Goldfinches are among the strictest vegetarians in the bird world and chase nothing at all, ever.' }
  };

  /* ------------------------------------------------------------------
     GUIN'S RULE: FRIENDS NEVER HUNT FRIENDS

     These are the places where the real world and Guin's rule collide. Each
     one is true - a cat really does catch hummingbirds, a dog really does
     chase a cat, a bullfrog really will swallow a small frog or a bat. In
     her garden none of it happens. The animal stops, sits down, and watches
     instead, and the book says exactly why.

     This is the rule made visible, on purpose. A silence would teach her
     nothing.
     ------------------------------------------------------------------ */
  var FRIEND_RULE = GG.FRIEND_RULE = {
    /* by family unless a species is named */
    cat: {
      families: ['hummingbird', 'songbird'],
      does: 'sits down and watches',
      why: 'Cats really do catch birds. Friends never hunt friends, so this one just sits and watches.'
    },
    dog: {
      families: ['cat'],
      does: 'sits down and waits',
      why: 'Dogs really do chase cats. Friends never hunt friends, so this one sits down and waits instead.'
    },
    bullfrog: {
      families: ['frog', 'bat', 'hummingbird', 'snake'],
      does: 'sits still and blinks',
      why: 'A bullfrog really would swallow a small frog, a bat, a bird, or even a snake. Friends never hunt friends, so this one just sits and blinks.'
    },
    red_fox: {
      families: ['rabbit', 'squirrel', 'duck', 'chicken'],
      does: 'sits down in the grass and watches',
      why: 'A fox really does hunt rabbits, ground squirrels, ducklings and hens. Friends never hunt friends, so this one sits down in the grass and watches instead.'
    },
    burrowing_owl: {
      families: ['songbird', 'squirrel'],
      does: 'stands up tall and watches',
      why: 'A burrowing owl really does take small birds, and young ground squirrels out of the burrows it borrows. Friends never hunt friends, so it stands up tall and watches instead.'
    },
    black_bear: {
      families: ['deer'],
      does: 'wanders off to the berries instead',
      why: 'A black bear really would take a young deer in the spring. Friends never hunt friends, so this one goes and looks for berries instead — which is nine tenths of what a bear eats anyway.'
    },
    raccoon: {
      families: ['turtle', 'duck', 'chicken', 'songbird'],
      does: 'turns a stone over instead',
      why: 'A raccoon really does dig up a turtle’s eggs and raid a nest. Friends never hunt friends, so this one goes and feels about under a stone instead.'
    },
    river_otter: {
      families: ['turtle', 'duck'],
      does: 'rolls over and swims off',
      why: 'An otter really would take a duckling or a young turtle. Friends never hunt friends, so this one rolls over and swims off.'
    },
    gopher_snake: {
      families: ['songbird', 'duck', 'chicken'],
      does: 'glides quietly past',
      why: 'A gopher snake really does raid nests for eggs. Friends never hunt friends, so this one glides quietly past and leaves them be.'
    },
    western_rattlesnake: {
      families: ['squirrel', 'songbird', 'rabbit'],
      does: 'lies still and lets them by',
      why: 'A rattlesnake really does hunt ground squirrels, rabbits and small birds. Friends never hunt friends, so this one lies still and lets them go by.'
    }
  };

  /* ------------------------------------------------------------------
     THE ONE CHASE THAT IS NOT A HUNT

     Guin asked for dogs to chase squirrels, and the truthful answer keeps her
     rule completely intact, because a dog chasing a squirrel is not hunting
     it. A hunt is a chain of moves - search, approach, chase, bite - and in
     most pet dogs the last link has been bred away. What is left is the first
     half, run for fun.

     The squirrel is not panicking either. It goes a little way up the trunk
     and stops there, in plain sight, facing the dog, and scolds it with rapid
     calls and a whipping tail. Scientists call that a pursuit-deterrent
     signal, which means: I have seen you, do not bother. Under a hawk a
     squirrel hides on the far side of the trunk; under a dog or a cat it
     deliberately stays where it can still see the danger.

     So this pair does not go in FRIEND_RULE. Nobody sits down and nobody is
     in any danger. The dog runs, the squirrel goes up and tells it off, and
     both of them enjoy it enormously.
     ------------------------------------------------------------------ */
  var FRIEND_PLAY = GG.FRIEND_PLAY = {
    dog: {
      families: ['squirrel'],
      does: 'bounds after it, and the squirrel stops halfway up and tells it off',
      why: 'This one is play, not hunting. A dog chasing a squirrel is running the first half of a hunt — the looking, the creeping, the running — and in most pet dogs the catching part at the end was bred away long ago. The squirrel knows it: it stops in plain sight where it can still see the dog, and scolds.'
    }
  };

  /* everything `id` really hunts */
  GG.animalPrey = function (id) { return ANIMAL_HUNTS[id] || []; };

  /* Would this animal really hunt this creature? Anything not on the list
     is never chased, whatever it is and however close it comes. */
  GG.animalHunts = function (animalId, preyId) {
    if (!animalId || !preyId) return false;
    var list = ANIMAL_HUNTS[animalId];
    return !!list && list.indexOf(preyId) >= 0;
  };

  /* 'pounce' | 'dash' | 'hover' | 'swoop' | 'ambush' | null */
  GG.animalHuntStyle = function (def) {
    if (!def || !ANIMAL_HUNTS[def.id]) return null;
    return HUNT_STYLE_BY_ID[def.id] || HUNT_STYLE[def.family] || null;
  };

  GG.animalForage = function (id) { return ANIMAL_FORAGE[id] || null; };

  /* Would `hunter` really hunt `other`, one friend to another? Returns the
     rule that stops it, or null. */
  GG.friendRuleFor = function (hunter, other) {
    if (!hunter || !other || hunter.id === other.id) return null;
    var rule = FRIEND_RULE[hunter.id] || FRIEND_RULE[hunter.family];
    if (!rule) return null;
    return rule.families.indexOf(other.family) >= 0 ? rule : null;
  };

  /* Would `chaser` chase `other` for fun? Only the dogs and the squirrels, and
     it is a game both of them are playing. Returns the pairing, or null. */
  GG.friendPlayFor = function (chaser, other) {
    if (!chaser || !other || chaser.id === other.id) return null;
    var play = FRIEND_PLAY[chaser.id] || FRIEND_PLAY[chaser.family];
    if (!play) return null;
    return play.families.indexOf(other.family) >= 0 ? play : null;
  };

  /* The look-only friends: met, never touched, worth no sparkles, and their
     `danger` line is shown every single time. Only the rattlesnake, so far. */
  GG.animalIsLookOnly = function (def) { return !!(def && def.lookOnly); };
  /* A unique friend is one particular animal, not a kind of animal. There is
     only one Cookie, so she is only ever in one place at a time: out in the
     garden, walking with Guin, waiting at the cottage, or visiting one Garden
     Habitat. (v1.15 - David: "Make certain friends unique so there is only
     one of them in the game at a time. Cookie will be the only unique for
     now.") */
  GG.animalIsUnique = function (def) { return !!(def && def.unique); };

  GG.ANIMAL_BY_ID = {};
  GG.ANIMALS.forEach(function (a, i) {
    a.index = i;
    a.isAnimal = true;
    GG.ANIMAL_BY_ID[a.id] = a;
  });

  /* The families, and they are real families wherever a real family exists.
     A moose is a deer. A giant panda is a bear. An ocelot is a cat — which is
     why the cat rule about birds covers it too. A red panda is the only
     living member of its own family and so it gets one to itself, and an
     axolotl is a salamander however much it looks like something else.
     "Songbirds" is the honest name for six birds from six different families
     that are all, genuinely, songbirds. */
  GG.FAMILY_NAMES = {
    hummingbird: 'Hummingbirds', frog: 'Frogs', bat: 'Bats',
    dog: 'Dogs', cat: 'Cats', parrot: 'Parrots',
    rabbit: 'Rabbits', squirrel: 'Squirrels', turtle: 'Turtles', bear: 'Bears',
    raccoon: 'Raccoons', fox: 'Foxes', deer: 'Deer and Moose', cow: 'Cows',
    horse: 'Horses', sheep: 'Sheep', chicken: 'Chickens', duck: 'Ducks',
    otter: 'Otters', owl: 'Owls', koala: 'Koalas', redpanda: 'Red Pandas',
    salamander: 'Salamanders', songbird: 'Songbirds', snake: 'Snakes'
  };

  /* Which family lives where, for the Friends Book */
  GG.animalPlaces = function (def) {
    return def.places.map(function (p) { return GG.HABITAT_NAMES[p] || p; }).join(', ');
  };
})(window.GG = window.GG || {});
