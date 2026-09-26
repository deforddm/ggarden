/* Guin's Garden service worker - lets the game work with no internet. */
const CACHE = 'guins-garden-v1.20.0';
const ASSETS = [
  /* v1.20: every script the page loads, so the whole game works offline
     from the first visit (the list had not been updated since v1.1) */
  './', './index.html', './manifest.json', './css/style.css', './src/core/util.js',
  './src/core/save.js', './src/core/input.js', './src/core/audio.js', './src/core/music.js',
  './src/core/ambience.js', './src/data/changelog.js', './src/data/bugs.js', './src/data/fish.js',
  './src/data/animals.js', './src/data/foodchain.js', './src/data/fruit.js',
  './src/data/pickables.js', './src/data/looks.js', './src/data/homedecor.js',
  './src/render/bugart.js', './src/render/fishart.js', './src/render/animalart.js',
  './src/render/playerart.js', './src/render/propart.js', './src/render/decorart.js',
  './src/render/homeart.js', './src/render/fruitart.js', './src/render/flowerart.js',
  './src/render/plantart.js', './src/render/pickdecor.js', './src/render/dogparkart.js',
  './src/render/fx.js', './src/render/yardart.js', './src/game/time.js', './src/game/world.js',
  './src/game/player.js', './src/game/critters.js', './src/game/fishing.js',
  './src/game/friends.js', './src/game/fetch.js', './src/game/orchard.js', './src/game/yard.js',
  './src/game/house.js', './src/game/cave.js', './src/ui/ui.js', './src/ui/fx-ui.js',
  './src/ui/book.js', './src/ui/terrarium.js', './src/ui/shop.js', './src/ui/charselect.js',
  './src/ui/homedecor.js', './src/main.js', './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
