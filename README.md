# Guin's Garden

A gentle, top-down bug catching and fishing game for Guin, built as a web app / PWA
(same approach as NONOSLAM and PacCraft: plain HTML + JavaScript, no build
tools needed, installable to a phone home screen, works offline).

## Play it

* **Artifact (private link):** published from the Claude session.
* **Web / phone:** https://deforddm.github.io/ggarden/  (GitHub Pages)
* **Locally:** open `index.html` in a browser, or `dist/index.html`
  (single self-contained file, no other files needed).

## How the game works

* Walk around one open world, 4800 x 3200, with twelve places: Sunny Meadow,
  Flower Garden (home), Whispering Woods, Apple Orchard, Pebble Hills, the Lily
  Pond, Pebble Stream, the Winding River and its riverbank, Gull Inlet, Shell
  Beach, the rocky shore and The Tidepools.
* 103 real insects and mini-beasts, each with its own habitat, time of day
  and behaviour. Bugs get nervous when you charge at them - a `!` appears,
  and then they bolt. Creep closer instead (tiptoe = hold shift on a keyboard,
  or push the joystick gently).
* A day/night cycle runs about 12 real minutes. Fireflies, moths, crickets,
  stag beetles and the rhinoceros beetle only come out after dark. Rain
  showers bring out snails and pill bugs and send butterflies into hiding.
* **Fishing** anywhere there is water. Stand on the bank facing it and a blue
  FISH button appears. Fish swim about as shadows with a little wake, so you
  can pick one before you cast. Wait for the nibbles, and tap CATCH the moment
  the bobber goes under and a `!` appears. 29 real fish and shellfish, each with
  a page in the Fish Book, plus the occasional old boot. Fish can be kept in a
  Fish Tank or a Hybrid Tank.
* **Five different waters, each with its own fish.** The Lily Pond has bluegill,
  crappie and koi; Pebble Stream has creek chub, brook trout and sculpin;
  the Winding River has smallmouth bass, crayfish and pike; Gull Inlet has
  striped bass, flounder and blue crab; and the open sea off Shell Beach has
  mackerel, cod, halibut, red snapper and, very rarely, an ocean sunfish.
  The chinook salmon and the American eel turn up in all of them, because in
  real life they travel between fresh water and the sea.
* **The Tidepools.** Past Shell Beach, on the rocky shelf, are seven rock pools
  shallow enough to wade into. Netting there finds hermit crabs, shore crabs,
  sea stars, anemones, urchins, limpets, periwinkles and sea slugs. The book
  entries say plainly that in a real rock pool you look and put everything back
  exactly where you found it.
* The little stream is shallow enough to paddle straight across. The river and
  the sea are not, so you have to find a way round.
* **Pluckable fruit.** Ten real fruits grow in the garden - Gala, Red
  Delicious and Cosmic Crisp apples, Bing cherries and Bartlett pears on the
  orchard trees, and saskatoon serviceberry, chokecherry, wild rose hips, wax
  currant and snowberry on the hillside shrubs. Walk up to a plant and the main
  button turns into **PICK**. Every new kind unlocks one decoration for your
  tanks, and those ten are the only things in the game sparkles cannot buy.
  Each fruit says plainly whether you can eat it: green for yes, amber for
  careful (spit the cherry stone out, let the pear soften, never crunch a
  chokecherry stone) and red for the snowberry, which is genuinely poisonous
  and is in the game precisely so that "pretty white berries are safe" gets
  broken. A picked plant grows its fruit back after a minute and a half.
* **A footbridge** crosses the river mouth by Shell Beach, where the Winding
  River opens into Gull Inlet. You can walk right over it instead of going all
  the way round, and you can fish off the side of it.
* **Bees can sting.** Swing at a honeybee or bumblebee and miss, or swing at
  the beehive by the house, and she turns angry (a red cross appears over her)
  and chases you. If she catches you, Guin sees stars for a couple of seconds,
  walks slowly and cannot swing, and every bug nearby scatters. Nothing already
  caught is ever lost. You can still catch an angry bee if you are quick.
* Catching a bug earns sparkles and, if it is new, a page in the **Bug Book**
  with real, fact-checked information about that insect.
* **Music and the sound of the place.** None of it is a file: a little
  generative music box plays a pentatonic tune whose mood follows the hour,
  and layered ambience fades in and out as you walk - birds in the morning,
  crickets after dark, frogs by the pond at night, the river burbling, surf and
  gulls at the beach, rain when it rains, and a hearth indoors. Water is only
  audible within about a screen's width of it, and indoors you hear only the
  fire (see "The swell bug" below).
* **Settings** (title screen, or the Garden Menu) has separate sliders for
  music, garden sounds and effects, a master mute, a "What's new" button and -
  behind a two-step confirmation and a three-second hold - starting over.
* **Let a friend play.** A guest visit runs in its own save slot
  (`guins-garden-guest-v1`). Guin's save is never read or written during a
  visit, the visit survives a reload, and finishing it clears the guest garden
  and restores hers exactly as she left it.
* **Garden Friends.** 23 animals across six families - hummingbirds, frogs,
  bats, dogs, cats and parrots - that you befriend rather than catch. See
  "Garden Friends" below.
* 54 decorations - 44 purchasable, each tagged for the tanks it suits: ferns,
  toadstools, pine cones, a tiny pond and a fairy house for terrariums; sea
  grass, coral, an anemone, a bubbler, a sand castle and a treasure chest for
  fish tanks; a nectar feeder, bird bath, bat house, kennel, cat basket,
  scratching post, parrot perch and jungle vine for garden habitats; a rock
  pool, bunting, a name plate and a glow crystal for anywhere - plus ten more
  that cannot be bought at all, only picked: a plate of apples, an apple crate,
  apple blossom, a cherry bough, a basket of pears, a bowl of berries, a
  chokecherry spray, a rose hip ring, a currant sprig and a snowberry sprig. A
  hybrid tank takes everything except the outdoor pieces. 27 scenes across the
  four kinds.
* Four kinds of tank, kept separate: a **Terrarium** (dry land, land bugs
  only), a **Fish Tank** (all water: fish, plus the rock-pool creatures, which
  potter about on the sand at the bottom), a **Hybrid Tank** (a grassy bank
  above a pool, holding everything - flying bugs above, fish below, a water
  strider skating on the surface and a hermit crab under it) and a **Garden
  Habitat** (a corner of the garden out under the open sky, with a hedge and
  clouds instead of glass, where up to five animal friends come to visit).
* **Rock-pool creatures need water.** Crabs, sea stars, anemones, urchins,
  limpets, periwinkles and sea slugs are flagged `aquatic: true`, and
  `GG.bugFitsTank(def, tankType)` is the rule: a terrarium turns them away with
  a message, a fish tank offers only them in its Bugs tab, and a hybrid takes
  both. The Bug Book shows a "needs water" tag on their pages, and a save with
  one already in a terrarium has it returned to the book on load. Each kind has its own scenes in the shop, and "New
  tank" shows a picture of each to choose from.
* Creatures put into a tank **live in it** - butterflies and dragonflies fly
  about, grasshoppers hop, snails creep along the ground. Each one stays near
  the spot you put it down, and picking one up grabs it wherever it has got to.
* Go **home** (the cottage) to read the Bug Book, buy decorations with
  sparkles, and build **terrariums** - drag bugs and decorations around a
  little glass tank, pick a scene, name it and keep it.
* Sleeping in the bed skips to the next morning.
* Everything saves automatically in the browser.

## Garden Friends

Some animals are not for catching. `src/data/animals.js` holds 22 of them in
six families, and each family is befriended **the way you really would**:

| family | method (`way`) | what she does |
| --- | --- | --- |
| hummingbird | `feeder` | hangs a feeder of plain sugar water and steps back |
| frog | `still` | crouches, keeps still, lets it come out - looks, never touches |
| bat | `bathouse` | puts up a bat house and watches from a long way off |
| dog | `ask` | asks the owner first, then a soft fist, then the shoulder |
| cat | `blink` | gets low, loose fist, slow-blink, lets the cat decide |
| parrot | `millet` / `watch` | millet for the tame ones, quiet watching for the wild |

The research drove the design. Hand-feeding is genuinely wrong for bats (a bite
can be too small to notice), for frogs (permeable skin - no lotion, no
sunscreen) and for wild parrots (protected, and that beak means it), and dogs
and cats need their person asked first. So there is one uniform *interaction*
with seven truthful per-family *methods*, and every animal carries a `manners`
line - the real-world advice - shown on the friend card **every single time**
she makes that friend, and again on its Friends Book page.

The ritual, in `src/game/friends.js`: walk close, a green **FRIEND** button
appears with that family's method on it, tap it, then **keep still** while a
ring fills. Moving slips the ring back by `NUDGE` (0.55/second) but **never
empties it** and the animal never runs off for good - worst case she waits a
little longer. Walking more than 120px away cancels with a kind toast. There is
no failure state anywhere in this feature.

Other pieces:

* **The companion.** "Ask them along" on a friend card or Book page sets
  `GG.Save.data.companion`; that friend then trails behind her all day, aiming
  for a point *behind and beside* her rather than at her feet, so it never
  stands on top of her.
* **The Friends Book** is a third tab in the book, with a companion strip at
  the top.
* **Sizes.** `def.size` is the **world** size and is set to real-life
  proportions against Guin (~56px tall): a hummingbird is 13px across, a
  labrador 44. For book pages, cards and trays that would be unreadable, so
  `GG.animalFit(def, px)` normalises any animal to a chosen pixel span using
  the per-shape `SPAN` table in `animalart.js`. Use `animalFit` anywhere the
  animal should fill a frame; use `def.size` only in the world.
* **Six shapes, 22 animals.** `src/render/animalart.js` draws hummingbird,
  frog, bat, dog, cat and parrot; everything else comes out of each animal's
  `art` block (colours, `patch: 'saddle'|'ruff'`, `fluffy`, `longtail`,
  `redtail`, `bars`, `wingTip`, `crest`). Animals face **right** in profile,
  about 40px long at scale 1, drawn with `(x, y)` at the **feet**.

**A canvas gotcha that bit once:** `ell()` in `animalart.js` *fills*. Do not
call it and then `c.clip()` - that clips to the ellipse but has already painted
it in whatever `fillStyle` was left over. Build the path with
`c.beginPath(); c.ellipse(...)` and clip that.

## Fruit

`src/data/fruit.js`, `src/render/fruitart.js`, `src/game/orchard.js`.

Every orchard tree and every hillside shrub carries one real fruit. Stand next
to one and the main action button becomes **PICK** - the same trick the cottage
door uses, so no extra button was needed on a phone. Picking shows a card, adds
it to the basket, and the plant regrows after 95 seconds. Nothing is used up.

Each fruit has an `eat` rating - `yes`, `careful` or `never` - and a `care` line
of real advice, and both are shown on the card **every single time** and again
on the fruit's page in the new **Fruit** tab of the book. That is the point of
the feature, not a footnote to it:

* the **snowberry** is included *because* it is not food. NC State Extension
  lists the fruit as the poisonous part, it is unmistakable, and it breaks the
  dangerous idea that pretty white berries are safe;
* the **chokecherry** needs both halves of the truth or it teaches something
  harmful either way - the ripe flesh really is food, and the stones, leaves and
  stems really do contain cyanide;
* **thimbleberry** was cut after the research: the USDA Forest Service is
  explicit that it avoids dry ground and belongs by a stream.

The first time she picks each kind, one decoration unlocks. Those ten sit on
their own shelf in the Decoration Box - *"Picked, not bought"* - as grey
silhouettes called **???** until she finds them.

## The footbridge

`GG.World.bridge` is five numbers and everything else is derived from them. It
crosses at (2857, 2383), square across the current where the river opens into
Gull Inlet, with both ends landing on the sand at Shell Beach.

`World.onBridge(x, y)` projects a point onto the deck, and `blocked()` now reads
`isDeepWater(x, y) && !onBridge(x, y)` - so the deck beats the water underneath
and nothing else about collision changes. Step off the side and it is deep water
again. `drawBridge()` runs after the water and before anything that walks, so
Guin and her friends cross on top of it. Fishing from it came free: the water
mask underneath is still water, so `Fishing.castTarget` finds it.

## Files

```
index.html            the game page (loads the modules below)
css/style.css         all styling
src/core/             util, save file (two slots), touch + keyboard input,
                      audio buses, music.js (the music box), ambience.js
src/data/changelog.js the version number and what changed, for "What's new"
src/data/bugs.js      the 103 species: habitat, time, rarity, art, facts
src/data/fish.js      the 29 fish: which waters, when they bite, art, facts
src/data/animals.js   the 23 Garden Friends and the seven ways to befriend them
src/data/foodchain.js who hunts whom (nothing is ever actually eaten)
src/data/fruit.js     the 10 fruits, what unlocks, and whether you can eat it
src/render/           bugart.js (every bug drawn in code), propart.js
                      (trees, flowers, the house), decorart.js (tank + habitat
                      items), animalart.js (the six animal shapes),
                      fruitart.js (the six fruit shapes)
src/game/             time.js, world.js (map + terrain + the footbridge),
                      player.js, critters.js (spawning, bug AI, catching),
                      house.js, friends.js (animal AI, befriending, the
                      companion), orchard.js (fruit, picking, regrowing)
src/ui/               ui.js, book.js, terrarium.js, shop.js
src/main.js           game loop, camera, scenes, minimap, PWA update button
sw.js, manifest.json  offline support + install-to-home-screen
icons/                app icons
dist/                 single-file builds (see below)
```

There are **no image or sound files**. Every bug, tree, flower and sound
effect is generated in code, which is why the whole game is about 664 KB as a
single self-contained file.

## The swell bug (worth knowing before touching `ambience.js`)

Each ambience layer has a slow LFO so surf rolls and wind gusts. It used to be
connected straight onto the layer's level gain:

```js
depth.connect(gain.gain);   // wrong
```

A Web Audio `AudioParam`'s value is its own value **plus** everything connected
to it - connections add, they do not multiply. So every layer played at the full
depth of its swell no matter what its level was: the sea was audible across the
whole map and inside the house, about twenty times louder than intended, and
setting its level to zero changed nothing.

The signal path is now `noise -> filter -> swell -> level -> bus`, with the LFO
on its own stage centred so it stays within `0..1` and can only scale the level
down. `tests/settings.js` asserts that, and reads the real `gain.gain.value`
rather than the intended level - the old tests passed throughout, because
`bed.level` was always right and the wiring underneath was not.

## Rebuilding the single-file versions

```
node tests/build.js
```

Tests (Playwright, with a local server on port 8899):

* `tests/touch.js` - real taps on a phone-sized screen. **Always run this.**
* `tests/bees.js`  - the angry-bee and sting rules.
* `tests/play.js`  - walks every screen and saves screenshots.
* `tests/probe.js` - catching, frame rate, and spawn coverage.
* `tests/fishing.js` - the whole fishing loop, the Fish Book and the aquarium.
* `tests/tanks.js` - the three tank kinds, what each will accept, and the
  migration of tanks saved before the split.
* `tests/update.js` - the "Update ready" bar: where it sits, that it is big and
  obvious, that it saves before reloading.
* `tests/three.js` - terrarium movement, indoor scale, and the back of Guin's head.
* `tests/look.js`  - saves a sheet of Guin from all four directions.
* `tests/waters.js` - the stream, river, inlet, beach and tidepools: that every
  water is where it should be, that the cottage is not in the river, that the
  tidepools sit above the tide line and can be waded, that each water holds the
  right fish, that tidepool creatures stay in their pool, and that Guin can walk
  from her own front door to every part of the garden.
* `tests/newlook.js` / `tests/worldshots.js` - picture sheets of the new
  creatures, and screenshots of each new place.
* `tests/settings.js` - the Settings panel and its sliders, the guarded reset
  (a quick tap must do nothing; only a three-second hold wipes anything), the
  "What's new" card, the music and ambience actually running and responding to
  place and time, the decorations for each tank kind, and the whole guest
  visit - including that Guin's save is byte-for-byte unchanged throughout.
* `tests/orchard.js` - the fruit roster and its safety lines, picking and
  regrowing, the unlocks, the Fruit Book, the shop's picked-not-bought shelf,
  and the footbridge: both ends on dry land, nothing blocking the way, most of
  it really over water, stepping off the side is deep water again, Guin walks
  right across it and can cast a line off it.
* `tests/friends.js` - the Garden Friends, the companion, the silly hats, the
  water habits, the butterfly chase and the food chain.
* `tests/distcheck.js` - also asserts the service-worker cache name matches
  `GG.VERSION`.

**Anything a test times must close the popups first.** The game loop pauses
whenever `GG.UI.anyOpen()` is true, and that includes the catch card and the
friend card, so a card left open by an earlier step makes a timing test fail
with "nothing moved at all".

(from a copy of the project that still has the `tests/` folder; the build
script inlines the CSS and all the JavaScript into `dist/index.html` and
`dist/artifact.html`.)

## Updating the published game

1. Edit the files in `src/` (or `css/style.css`).
2. Re-run the build so `dist/` matches.
3. Bump `GG.VERSION` in `src/data/changelog.js` and add an entry at the top of
   `GG.CHANGELOG`. The build derives the service-worker cache name from it
   (`guins-garden-v<version>`) and rewrites `sw.js` to match, so the cache name
   always changes and phones really do see the update. **Do not hand-edit the
   cache name** - that is how it silently stopped changing between v1.7 and
   v1.8, which meant no "Update ready" bar appeared at all.
4. Upload the changed files in `dist/` to the GitHub repo. The next time the
   game is opened it shows a gold **"Update ready!"** bar on the title screen,
   under the Play button, with a green **Update** button; if an update arrives
   mid-play it also appears as a green button at the top of the Garden Menu.
   Tapping it saves the garden, then swaps to the new version.

## Adding a new bug

Add one entry to `src/data/bugs.js`:

```js
{
  id: 'my_bug', name: 'My Bug',
  habitats: ['meadow'], times: ['day'], rarity: 2, value: 30,
  behavior: 'flutter',        // flutter hover dart drift glow hop skim cling crawl slow
  speed: 34, shy: 50, size: 1,
  measure: '1 inch long',
  art: { shape: 'butterfly', body: '#333', wing: '#8fd0ff', accent: '#fff', pattern: 'edge' },
  facts: ['Something true and interesting.']
}
```

`shape` can be any of the shapes in `src/render/bugart.js` (butterfly,
swallowtail, lunamoth, moth, atlas, ladybug, beetle, stagbeetle,
rhinobeetle, firefly, bee, dragonfly, damselfly, strider, grasshopper,
cricket, katydid, mantis, stickbug, cicada, ant, caterpillar, spider,
pillbug, snail, crab, hermitcrab, seastar, anemone, urchin, limpet,
periwinkle, nudibranch, horseshoe, sandhopper, tigerbeetle, stonefly,
dobsonfly, whirligig, boatman, and more). The Bug Book, terrariums and
spawning all pick it up automatically.

Habitats are `meadow`, `garden`, `forest`, `pond`, `hill`, `orchard`,
`riverbank`, `river`, `beach`, `shore`, `tidepool` and `anywhere`. The
`tide` behaviour is for rock-pool creatures: they potter about the bottom of
a pool and never leave it.

## A note on the facts

Every fact in the Bug Book was checked against university extension
services, museums and current research, and several popular "fun facts"
were corrected or dropped along the way (spider silk vs. steel, the
dragonfly's 95% hunting rate, mantis 3D vision, dung beetles and the
Milky Way, walking sticks regrowing legs, "starfish are fish", "all sea
urchins are dangerous", sand fleas biting people, male dobsonflies pinching,
water boatmen biting, and the ocean sunfish being the heaviest bony fish
- that record belongs to a different species). They should be safe to
repeat at school.
