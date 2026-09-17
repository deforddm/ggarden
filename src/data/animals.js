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
   shown every single time she makes that friend.

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
                     garden keeps it, out loud. */
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
      times: ['morning', 'day', 'evening'], places: ['garden', 'meadow', 'beach'],
      measure: 'comes up past your knee', size: 0.87,
      art: { shape: 'dog', body: '#e0c48a', ear: '#c8a86a', accent: '#8a6a3a',
        muzzle: '#f2e2ba', nose: '#3a2f28', collar: '#3f8ad0', build: 'big' },
      facts: [
        'It has webbed toes and a thick tail like an otter’s, and both of them help it swim.',
        'Even though it is called a Labrador, the breed really comes from Newfoundland.',
        'It was the most popular dog in America for thirty-one years in a row.',
        'A retriever carries a bird all the way back without squashing it. That soft mouth is a hunting bite that people spent hundreds of years making gentler.',
        'Dogs really do chase cats. Not in this garden: a dog that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
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
        'Queen Elizabeth’s family got their first Corgi in the 1930s and made the breed famous.',
        'A Corgi moved cattle by darting in at their heels and dashing out again — a whole hunt boiled down to the quick bit in the middle, and nobody gets hurt.',
        'Dogs really do chase cats. Not in this garden: a Corgi that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
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
        'Some Beagles have a real job sniffing luggage at airports, in a team called the Beagle Brigade.',
        'Following a smell for miles is the first part of hunting, and a Beagle is all first part. It will trail a rabbit happily for an hour and then have no idea what to do when it catches up.',
        'Dogs really do chase cats. Not in this garden: a Beagle that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
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
        'It is friendly with people it knows, but it can be a bit shy with strangers at first.',
        '"The eye" is a real stalk. A wolf creeping up on something does exactly the same thing — a Border Collie just stops before the last bit and moves the sheep instead.',
        'When she springs after a moth and it gets away, that is how it usually goes. Dogs and cats both miss far more often than they catch.',
        'Dogs really do chase cats. Not in this garden: a Border Collie that spots one of your cat friends sits down and waits instead, because friends never hunt friends.'
      ],
      manners: 'This one is the most reserved of the four. Crouch a little, look away rather than at it, and let it make the first move in its own time.'
    },

    /* ---------------- cats ---------------- */
    {
      id: 'cookie', name: 'Cookie', family: 'dog',
      way: 'ask', patience: 2.5, keep: 52, rarity: 2, value: 110,
      times: ['morning', 'day', 'evening', 'night'],
      places: ['garden', 'meadow', 'forest', 'hill'],
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
    maine_coon: CAT_PREY

    /* --- parrots: nothing at all. See ANIMAL_FORAGE. --- */
  };

  /* How each family goes about it. The style drives the animation, and every
     one of them is the real thing:
       pounce - a cat: creep, freeze, then a short rush and a miss
       dash   - a dog: straight in at a run, one snap, gone
       hover  - a hummingbird: come up close, hold in the air, pick
       swoop  - a bat: a fast pass out of the dark
       ambush - a frog: do not chase at all. Sit. Wait. Tongue. */
  var HUNT_STYLE = GG.ANIMAL_HUNT_STYLE = {
    cat: 'pounce', dog: 'dash', hummingbird: 'hover', bat: 'swoop', frog: 'ambush'
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
      note: 'Nuts, fruit, leaves, bark and flowers, and the odd insect it finds — never one it chased.' }
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
      families: ['hummingbird'],
      does: 'sits down and watches',
      why: 'Cats really do catch birds. Friends never hunt friends, so this one just sits and watches.'
    },
    dog: {
      families: ['cat'],
      does: 'sits down and waits',
      why: 'Dogs really do chase cats. Friends never hunt friends, so this one sits down and waits instead.'
    },
    bullfrog: {
      families: ['frog', 'bat', 'hummingbird'],
      does: 'sits still and blinks',
      why: 'A bullfrog really would swallow a small frog, a bat, or a bird. Friends never hunt friends, so this one just sits and blinks.'
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
    return HUNT_STYLE[def.family] || null;
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
