# Guin's Garden

A gentle, top-down bug catching game for Guin, built as a web app / PWA
(same approach as NONOSLAM and PacCraft: plain HTML + JavaScript, no build
tools needed, installable to a phone home screen, works offline).

## Play it

* **Artifact (private link):** published from the Claude session.
* **Web / phone:** https://deforddm.github.io/ggarden/  (GitHub Pages)
* **Locally:** open `index.html` in a browser, or `dist/index.html`
  (single self-contained file, no other files needed).

## How the game works

* Walk around one open world with six places: Sunny Meadow, Flower Garden,
  Whispering Woods, Apple Orchard, Pebble Hills and the Lily Pond.
* 31 real insects and mini-beasts, each with its own habitat, time of day
  and behaviour. Bugs get nervous when you charge at them - a `!` appears,
  and then they bolt. Creep closer instead (tiptoe = hold shift on a keyboard,
  or push the joystick gently).
* A day/night cycle runs about 12 real minutes. Fireflies, moths, crickets,
  stag beetles and the rhinoceros beetle only come out after dark. Rain
  showers bring out snails and pill bugs and send butterflies into hiding.
* Catching a bug earns sparkles and, if it is new, a page in the **Bug Book**
  with real, fact-checked information about that insect.
* Go **home** (the cottage) to read the Bug Book, buy decorations with
  sparkles, and build **terrariums** - drag bugs and decorations around a
  little glass tank, pick a scene, name it and keep it.
* Sleeping in the bed skips to the next morning.
* Everything saves automatically in the browser.

## Files

```
index.html            the game page (loads the modules below)
css/style.css         all styling
src/core/             util, save file, touch + keyboard input, sound
src/data/bugs.js      the 31 species: habitat, time, rarity, art, facts
src/render/           bugart.js (every bug drawn in code), propart.js
                      (trees, flowers, the house), decorart.js (terrarium items)
src/game/             time.js, world.js (map + terrain), player.js,
                      critters.js (spawning, bug AI, catching), house.js
src/ui/               ui.js, book.js, terrarium.js, shop.js
src/main.js           game loop, camera, scenes, minimap, PWA update button
sw.js, manifest.json  offline support + install-to-home-screen
icons/                app icons
dist/                 single-file builds (see below)
```

There are **no image or sound files**. Every bug, tree, flower and sound
effect is generated in code, which is why the whole game is about 170 KB.

## Rebuilding the single-file versions

```
node tests/build.js
```

(from a copy of the project that still has the `tests/` folder; the build
script inlines the CSS and all the JavaScript into `dist/index.html` and
`dist/artifact.html`.)

## Updating the published game

1. Edit the files in `src/` (or `css/style.css`).
2. Re-run the build so `dist/` matches.
3. Bump `CACHE` in `dist/sw.js` (e.g. `guins-garden-v2`) so phones pick up
   the new version.
4. Upload the changed files in `dist/` to the GitHub repo. The game shows a
   gold **"New version - tap to update"** button at the top of the screen
   when a new build is available.

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
pillbug, snail). The Bug Book, terrariums and spawning all pick it up
automatically.

## A note on the facts

Every fact in the Bug Book was checked against university extension
services, museums and current research, and several popular "fun facts"
were corrected or dropped along the way (spider silk vs. steel, the
dragonfly's 95% hunting rate, mantis 3D vision, dung beetles and the
Milky Way, walking sticks regrowing legs). They should be safe to repeat
at school.
