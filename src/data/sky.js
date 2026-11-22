/* v1.21: the night sky - what there is to find up there, and what is true
   about it. The stars themselves are in stars.js; this file is the words.

   Every line here was written to be TRUE, the same as the other books:
   - the Big Dipper is an asterism inside the Great Bear, not a constellation
   - Polaris is NOT the brightest star (it is roughly the fiftieth)
   - Aldebaran is in front of the Hyades, not one of them
   - the sky you see depends on the real date, so some pages cannot be
     filled in tonight - and the page says when to come back. */
(function (GG) {
  'use strict';

  /* Where the garden is, for working out the sky: the Columbia Basin in
     eastern Washington, where Guin lives. */
  GG.SKY_PLACE = { lat: 46.24, lon: -119.10, name: 'eastern Washington' };

  /* when: the evenings it is best seen from here. */
  GG.CONSTELLATIONS = [
    { id: 'UMa', name: 'The Great Bear', latin: 'Ursa Major', when: 'every night of the year',
      star: 'Dubhe',
      look: 'Look north for seven bright stars shaped like a saucepan. That is the Big Dipper, and it is her back and tail.',
      fact: 'The Big Dipper is not a constellation by itself. It is the brightest part of a much bigger one, the Great Bear. The two stars at the end of the pan point straight at the North Star.',
      extra: 'From here the Big Dipper never sets. It just circles the North Star all night, all year.' },
    { id: 'UMi', name: 'The Little Bear', latin: 'Ursa Minor', when: 'every night of the year',
      star: 'Polaris',
      look: 'Find the North Star, Polaris. It is the end of the Little Bear’s tail, and the rest curls away from it like a small dipper.',
      fact: 'Polaris sits almost exactly above the Earth’s north pole, so it stays put while the whole sky turns around it. Slide the night along and watch.',
      extra: 'Lots of people think the North Star is the brightest star. It is not! About fifty stars are brighter. It is famous for where it is.' },
    { id: 'Cas', name: 'The Queen', latin: 'Cassiopeia', when: 'every night of the year',
      look: 'Five stars in a zigzag, like a W or an M. She is on the other side of the North Star from the Big Dipper.',
      fact: 'Cassiopeia and the Big Dipper sit on opposite sides of the North Star, like two children on a see-saw. When one is high, the other is low.',
      extra: 'In the old Greek story she was a queen who boasted too much, so she was put in the sky on her throne, where she spends half of every night upside down.' },
    { id: 'Cep', name: 'The King', latin: 'Cepheus', when: 'every night of the year',
      look: 'Next to the Queen. His stars look like a child’s drawing of a house with a pointed roof.',
      fact: 'One of his stars, Delta Cephei, gets brighter and dimmer and brighter again every five days, like slow breathing. You can see it change with just your eyes.',
      extra: 'Henrietta Leavitt worked out that stars like this one can be used to measure how far away things are in space. That is how we learned how big the universe is.' },
    { id: 'Dra', name: 'The Dragon', latin: 'Draco', when: 'every night of the year',
      star: 'Thuban',
      look: 'A long line of faint stars that winds between the two Bears and ends in a little four-star head.',
      fact: 'A faint star in the Dragon’s tail, Thuban, was the North Star when the pyramids of Egypt were being built. The Earth wobbles very slowly, like a spinning top, so the North Star changes.',
      extra: 'One whole wobble takes about 26,000 years.' },
    { id: 'Cyg', name: 'The Swan', latin: 'Cygnus', when: 'summer and autumn',
      star: 'Deneb',
      look: 'A big cross of stars flying along the Milky Way. Bright Deneb is the tail and the long neck stretches out the other way.',
      fact: 'Deneb is one of the most far-away stars you can see without a telescope. Its light set off more than a thousand years ago and is only just arriving.',
      extra: 'The star at the Swan’s beak, Albireo, looks like one star. A small telescope shows it is two: one gold and one blue.' },
    { id: 'Lyr', name: 'The Harp', latin: 'Lyra', when: 'summer',
      star: 'Vega',
      look: 'One very bright blue-white star, Vega, with a small leaning box of four stars hanging from it.',
      fact: 'The light you see from Vega left it 25 years ago. In about 12,000 years the Earth’s slow wobble will make Vega the North Star.',
      extra: 'Vega, Deneb and Altair make a huge triangle called the Summer Triangle. Find all three!' },
    { id: 'Aql', name: 'The Eagle', latin: 'Aquila', when: 'summer',
      star: 'Altair',
      look: 'Bright Altair with a fainter star close on each side of it, like a bird with its wings out.',
      fact: 'Altair spins round once in about nine hours. Our Sun takes nearly a month. Altair spins so fast that it is squashed, wider across the middle than from top to bottom.',
      extra: 'Altair is one of our nearest bright neighbours: its light takes about 17 years to get here.' },
    { id: 'Del', name: 'The Dolphin', latin: 'Delphinus', when: 'summer and early autumn',
      look: 'A tiny diamond of four stars with one more for a tail, just to the left of the Eagle. It really does look like a dolphin jumping.',
      fact: 'The Dolphin is one of the smallest constellations in the whole sky, but its stars are packed so close together that it is easy to spot once you know it.',
      extra: 'It has been called a dolphin for more than two thousand years.' },
    { id: 'Her', name: 'Hercules', latin: 'Hercules', when: 'summer',
      look: 'Four stars in a lopsided square called the Keystone, between bright Vega and bright Arcturus. His arms and legs sprawl out from the corners.',
      fact: 'On one side of the Keystone is a faint fuzzy spot. It is a ball of several hundred thousand stars, all swarming together, so far away that they blur into one smudge.',
      extra: 'Hercules is the fifth biggest constellation, but he has no really bright stars, so he takes some finding.' },
    { id: 'CrB', name: 'The Northern Crown', latin: 'Corona Borealis', when: 'late spring and summer',
      look: 'A small neat half-circle of stars, like a bowl or a crown, right beside the Herdsman’s kite.',
      fact: 'The brightest star in the Crown is sometimes called Gemma, which means the jewel. It sits in the middle of the curve, where the jewel in a crown would go.',
      extra: 'In the old story it is the crown of Princess Ariadne, thrown up into the sky.' },
    { id: 'Boo', name: 'The Herdsman', latin: 'Boötes', when: 'spring and summer',
      star: 'Arcturus',
      look: 'Follow the curve of the Big Dipper’s handle away from the pan and you “arc to Arcturus”, a bright orange star. The Herdsman is a kite shape above it.',
      fact: 'Arcturus is the brightest star in the northern half of the sky. It is an orange giant, about 25 times as wide as our Sun.',
      extra: 'Boötes is said “boh-OH-teez”. The two dots mean you say both letters.' },
    { id: 'Leo', name: 'The Lion', latin: 'Leo', when: 'spring',
      star: 'Regulus',
      look: 'A backwards question mark of stars is his head and mane, with bright Regulus as the dot at the bottom. A triangle further along is his back end and tail.',
      fact: 'Regulus means “little king”. It spins round in less than a day, so fast that it bulges out round the middle.',
      extra: 'Every November a shower of shooting stars, the Leonids, seems to come out of the Lion’s mane.' },
    { id: 'Vir', name: 'The Maiden', latin: 'Virgo', when: 'spring',
      star: 'Spica',
      look: 'Arc to Arcturus, then “speed on to Spica”: keep going along the same curve to the next bright star, a blue-white one. That is Spica, in her hand.',
      fact: 'Virgo is the second biggest constellation in the whole sky. Spica looks like one star but is really two, whirling round each other every four days.',
      extra: 'Behind Virgo, far too faint to see, are more than a thousand galaxies.' },
    { id: 'Sco', name: 'The Scorpion', latin: 'Scorpius', when: 'summer',
      star: 'Antares',
      look: 'Low in the south on summer nights. Find a bright red star, Antares, with three stars in a row for claws to its right and a long tail curling down to the left.',
      fact: 'Antares is a red supergiant. If it sat where our Sun is, it would swallow up Mercury, Venus, the Earth and Mars.',
      extra: 'Its name means “rival of Mars”, because it is the same red colour as the planet. From this far north the tip of the Scorpion’s tail only just clears the hills.' },
    { id: 'Sgr', name: 'The Archer', latin: 'Sagittarius', when: 'summer',
      look: 'Low in the south in summer, to the left of the Scorpion. Do not look for an archer: look for a teapot, with a spout, a lid and a handle.',
      fact: 'When you look at the Teapot’s spout you are looking towards the very middle of our galaxy, the Milky Way. It is about 26,000 light-years away.',
      extra: 'On a dark night the Milky Way looks like steam coming out of the spout.' },
    { id: 'Peg', name: 'The Winged Horse', latin: 'Pegasus', when: 'autumn',
      look: 'Four stars in a huge empty square, high up on autumn evenings. That is his body. His neck and head stretch off from one corner.',
      fact: 'Pegasus flies upside down! From here his legs stick up and his head hangs down. Only the front half of the horse is drawn in the stars.',
      extra: 'The Great Square is so big you could hide your whole fist inside it, held at arm’s length.' },
    { id: 'And', name: 'The Princess', latin: 'Andromeda', when: 'autumn',
      star: 'Alpheratz',
      look: 'Two long lines of stars that start at one corner of the Great Square of Pegasus and spread out, like two ribbons.',
      fact: 'Beside her is the Andromeda Galaxy, a whole other island of stars. It is two and a half million light-years away, the farthest thing most people can ever see with just their eyes.',
      extra: 'The corner star, Alpheratz, is shared. It is her head and it is also a corner of the horse.' },
    { id: 'Per', name: 'The Hero', latin: 'Perseus', when: 'autumn and winter',
      star: 'Algol',
      look: 'Between the Queen’s zigzag and the bright star Capella. A curve of stars with bright Mirfak in the middle.',
      fact: 'One of his stars, Algol, winks. Every two days and twenty-one hours it goes dim for a few hours, because a fainter star passes in front of it.',
      extra: 'Every August the Perseid shooting stars seem to come from here. They are bits of dust from a comet.' },
    { id: 'Ari', name: 'The Ram', latin: 'Aries', when: 'autumn and winter',
      look: 'A short bent line of three stars, between the Great Square and the Seven Sisters. It is small, so look carefully.',
      fact: 'Two thousand years ago the Sun was in front of the Ram on the first day of spring. The Earth’s slow wobble has moved that spot on since then.',
      extra: 'Its brightest star, Hamal, is an orange giant about 66 light-years away.' },
    { id: 'Tau', name: 'The Bull', latin: 'Taurus', when: 'winter',
      star: 'Aldebaran',
      look: 'Follow Orion’s belt up and to the right to a V of stars with a bright orange one. That is the Bull’s face, and orange Aldebaran is his eye.',
      fact: 'The V is a real family of stars called the Hyades, all travelling through space together. But Aldebaran is not one of them. It is much closer to us, and only happens to be in front.',
      extra: 'A little further on is a tiny sparkly bunch of stars, the Seven Sisters. Tap them!' },
    { id: 'Aur', name: 'The Charioteer', latin: 'Auriga', when: 'winter',
      star: 'Capella',
      look: 'A big ring of five stars high overhead in winter, with one very bright yellow star, Capella.',
      fact: 'Capella looks like one star. It is really four: two big yellow giants close together, and two small red stars further out.',
      extra: 'Capella means “little she-goat”. The three faint stars beside it are called the Kids, which is what baby goats are called.' },
    { id: 'Ori', name: 'The Hunter', latin: 'Orion', when: 'winter',
      star: 'Betelgeuse',
      look: 'Three bright stars in a short straight row are his belt. Nothing else in the sky looks like it. Two stars above are his shoulders and two below are his knees.',
      fact: 'Orange Betelgeuse, at his shoulder, is a red supergiant near the end of its life. Blue-white Rigel, at his knee, is young and very hot. Stars really are different colours. Look closely!',
      extra: 'Hanging from his belt is his sword, and the fuzzy middle of it is a cloud where new stars are being born right now.' },
    { id: 'Gem', name: 'The Twins', latin: 'Gemini', when: 'winter',
      star: 'Castor',
      look: 'Two bright stars side by side, up and to the left of Orion. They are the Twins’ heads, Castor and Pollux, and their bodies are two lines of stars running back towards Orion.',
      fact: 'Castor looks like one star, but it is really six stars, all going round each other. Pollux, the more orange twin, is the brighter one.',
      extra: 'Every December the Geminid shooting stars seem to come from near Castor.' },
    { id: 'CMa', name: 'The Great Dog', latin: 'Canis Major', when: 'winter',
      star: 'Sirius',
      look: 'Follow Orion’s belt down and to the left. You cannot miss it: Sirius is the brightest star in the whole night sky.',
      fact: 'Sirius is so bright partly because it is so close. Its light takes less than nine years to get here, which makes it one of our nearest neighbours.',
      extra: 'When Sirius is low it flashes red, blue and green. The star is not changing colour: our air is bending its light about.' },
    { id: 'CMi', name: 'The Little Dog', latin: 'Canis Minor', when: 'winter',
      star: 'Procyon',
      look: 'Just two stars! Bright Procyon and one fainter friend, to the left of Orion and above the Great Dog.',
      fact: 'Procyon means “before the dog”, because it comes up over the hills a little while before Sirius, the Dog Star, does.',
      extra: 'Procyon, Sirius and Betelgeuse make a big triangle called the Winter Triangle.' }
  ];

  /* Things that are not constellations. dark: only from the Mesa lookout,
     far from the cottage lights - which is true of every one of them. */
  GG.SKY_TREASURES = [
    { id: 'pleiades', name: 'The Seven Sisters', latin: 'the Pleiades', ra: 56.75, dec: 24.12, r: 2.2, dark: false,
      when: 'autumn and winter', kind: 'cluster',
      look: 'A tiny sparkly bunch of stars on the Bull’s shoulder, like a very small dipper.',
      fact: 'The Seven Sisters are a real family: hundreds of young stars, born together and still travelling together. Most people can count six. How many can you see in the real sky?',
      extra: 'People all over the world have told stories about these stars, for thousands of years.' },
    { id: 'm42', name: 'The Orion Nebula', latin: 'a star nursery', ra: 83.82, dec: -5.39, r: 1.6, dark: false,
      when: 'winter', kind: 'nebula',
      look: 'The fuzzy middle “star” of Orion’s sword, hanging below his belt.',
      fact: 'This fuzzy patch is not a star. It is an enormous cloud of gas and dust where new stars are being born right now. Our own Sun was born in a cloud like this.',
      extra: 'Its light takes about 1,300 years to reach us.' },
    { id: 'm31', name: 'The Andromeda Galaxy', latin: 'another galaxy', ra: 10.68, dec: 41.27, r: 2.4, dark: true,
      when: 'autumn', kind: 'galaxy',
      look: 'A faint, long smudge beside the Princess. You need a dark sky, like the one up on the Mesa.',
      fact: 'That smudge is a whole other galaxy with hundreds of billions of stars. Its light has been travelling for two and a half million years. It set off long before there were any people.',
      extra: 'It is the farthest thing most people can ever see with only their eyes.' },
    { id: 'm13', name: 'The Great Cluster', latin: 'in Hercules', ra: 250.42, dec: 36.46, r: 1.5, dark: true,
      when: 'summer', kind: 'cluster',
      look: 'A dim fuzzy dot on one side of the Keystone of Hercules. It needs a really dark sky.',
      fact: 'It looks like one faint smudge, but it is a ball of several hundred thousand very old stars, swarming like bees round a hive.',
      extra: 'It is about 22,000 light-years away.' },
    { id: 'milkyway', name: 'The Milky Way', latin: 'our own galaxy', dark: true,
      when: 'summer and autumn', kind: 'galaxy',
      look: 'A soft, cloudy band of light right across the sky. You can only see it far away from lamps and windows.',
      fact: 'That cloudy band is our own galaxy, seen from the inside. It is made of more stars than anybody could count, so far away that they blur together like mist.',
      extra: 'Every single star you can see at night belongs to the Milky Way. So does our Sun.' }
  ];

  GG.SKY_BY_ID = {};
  GG.CONSTELLATIONS.forEach(function (c) { c.isSky = true; c.kind = 'constellation'; GG.SKY_BY_ID[c.id] = c; });
  GG.SKY_TREASURES.forEach(function (c) { c.isSky = true; c.treasure = true; GG.SKY_BY_ID[c.id] = c; });
  GG.SKY_ALL = GG.CONSTELLATIONS.concat(GG.SKY_TREASURES);

  /* Tap a bright star and it tells you its name. */
  GG.STAR_FACTS = {
    Polaris: 'Polaris, the North Star. The whole sky turns around it.',
    Vega: 'Vega. Blue-white, and one corner of the Summer Triangle.',
    Sirius: 'Sirius, the Dog Star. The brightest star in the night sky.',
    Betelgeuse: 'Betelgeuse. A red supergiant, hundreds of times wider than the Sun.',
    Rigel: 'Rigel. Blue-white and very hot, far hotter than the Sun.',
    Arcturus: 'Arcturus. An orange giant, the brightest star in the northern sky.',
    Capella: 'Capella. It looks like one yellow star but is really four.',
    Aldebaran: 'Aldebaran, the orange eye of the Bull.',
    Antares: 'Antares, the red heart of the Scorpion.',
    Deneb: 'Deneb, the Swan’s tail. Its light is more than a thousand years old.',
    Altair: 'Altair. It spins round in about nine hours.',
    Spica: 'Spica. Blue-white, and really two stars very close together.',
    Regulus: 'Regulus, the “little king”, the heart of the Lion.',
    Procyon: 'Procyon, the Little Dog star. It rises just before Sirius.',
    Castor: 'Castor. One twin, and really six stars.',
    Pollux: 'Pollux, the brighter, more orange twin.',
    Mizar: 'Mizar. Look very closely: it has a tiny friend right beside it called Alcor. Can you see two?',
    Algol: 'Algol, the winking star. Every three days or so it dims for a few hours.',
    Albireo: 'Albireo, the Swan’s beak. In a telescope it is one gold star and one blue.',
    Thuban: 'Thuban. Faint now, but it was the North Star when the pyramids were built.',
    Dubhe: 'Dubhe. With Merak below it, it points the way to the North Star.',
    Merak: 'Merak. Draw a line from here through Dubhe and keep going to find the North Star.',
    Alcyone: 'Alcyone, the brightest of the Seven Sisters.',
    Fomalhaut: 'Fomalhaut, the lonely star of autumn. Nothing else that bright is near it.',
    Bellatrix: 'Bellatrix, Orion’s other shoulder.',
    Alpheratz: 'Alpheratz. It is the Princess’s head and a corner of the Winged Horse too.',
    Mirfak: 'Mirfak, the brightest star of Perseus.',
    Denebola: 'Denebola, the tip of the Lion’s tail.',
    Alkaid: 'Alkaid, the very end of the Big Dipper’s handle.'
  };

  /* The showers of shooting stars that come round on the same nights every
     year, when the Earth runs through the dust a comet left behind. m and d
     are the peak night; ra and dec are the spot they seem to come from. */
  GG.METEOR_SHOWERS = [
    { name: 'Quadrantids', m: 1, d: 3, ra: 230, dec: 49, from: 'near the Herdsman', dust: 'an old, worn-out comet' },
    { name: 'Lyrids', m: 4, d: 22, ra: 271, dec: 34, from: 'the Harp', dust: 'Comet Thatcher' },
    { name: 'Eta Aquariids', m: 5, d: 5, ra: 338, dec: -1, from: 'low in the east before dawn', dust: 'Halley’s Comet' },
    { name: 'Perseids', m: 8, d: 12, ra: 48, dec: 58, from: 'the Hero', dust: 'Comet Swift–Tuttle' },
    { name: 'Orionids', m: 10, d: 21, ra: 95, dec: 16, from: 'the Hunter', dust: 'Halley’s Comet' },
    { name: 'Leonids', m: 11, d: 17, ra: 152, dec: 22, from: 'the Lion', dust: 'Comet Tempel–Tuttle' },
    { name: 'Geminids', m: 12, d: 14, ra: 112, dec: 33, from: 'the Twins', dust: 'a rocky asteroid called Phaethon' }
  ];

  GG.METEOR_FACTS = [
    'A shooting star is not a star. It is a speck of space dust, often no bigger than a grain of sand, burning up high in the air.',
    'Shooting stars burn up about 50 to 75 miles above your head, far higher than any aeroplane flies.',
    'The dust is moving incredibly fast, many miles every second. That is why it glows.',
    'Every day, many tonnes of space dust fall on the Earth. Nearly all of it is far too small to notice.'
  ];
})(window.GG = window.GG || {});
