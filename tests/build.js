/* Bundle everything into one file, twice: a standalone page and an artifact page. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const html = read('index.html');
const css = read('css/style.css');

/* The cache name has to CHANGE every release or the browser never notices a
   new service worker and the "Update ready" bar never appears. So it is
   derived from GG.VERSION rather than typed in by hand. */
const versionMatch = read('src/data/changelog.js').match(/GG\.VERSION\s*=\s*'([^']+)'/);
if (!versionMatch) { console.error('could not find GG.VERSION in src/data/changelog.js'); process.exit(1); }
const VERSION = versionMatch[1];
const CACHE_NAME = 'guins-garden-v' + VERSION;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const js = scripts.map(s => '/* ==== ' + s + ' ==== */\n' + read(s)).join('\n');

// body markup only (between <body> and the first <script>)
const bodyStart = html.indexOf('<body>') + '<body>'.length;
const bodyEnd = html.indexOf('<script src=');
const markup = html.slice(bodyStart, bodyEnd).trim();

const iconData = {};
['icon-192.png', 'icon-512.png', 'icon-512-maskable.png'].forEach(n => {
  iconData[n] = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'icons', n)).toString('base64');
});

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });

/* --- 1. standalone page for GitHub Pages (flat file layout) --- */
const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#5fa855">
<meta name="description" content="Guin's Garden - a gentle bug catching adventure.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<title>Guin's Garden</title>
<style>
${css}
</style>
</head>
<body>
${markup}
<script>
${js}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), standalone);

/* --- 2. artifact page (no doctype/head/body wrapper; fully self-contained) --- */
const artifact = `<title>Guin's Garden</title>
<style>
${css}
</style>
${markup}
<script>
${js.replace("navigator.serviceWorker.register('sw.js')", "Promise.reject()")}
</script>
`;
fs.writeFileSync(path.join(ROOT, 'dist', 'artifact.html'), artifact);

/* --- 3. flat manifest + service worker for the Pages build --- */
fs.writeFileSync(path.join(ROOT, 'dist', 'manifest.json'), JSON.stringify({
  name: "Guin's Garden", short_name: "Guin's Garden",
  description: 'A gentle bug catching adventure - explore, collect and build terrariums.',
  start_url: './index.html', scope: './', display: 'fullscreen', orientation: 'any',
  background_color: '#9ed98a', theme_color: '#5fa855',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

fs.writeFileSync(path.join(ROOT, 'dist', 'sw.js'), `/* Guin's Garden service worker */
const CACHE = '${CACHE_NAME}';
const ASSETS = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match('./index.html'))));
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
`);

['icon-192.png', 'icon-512.png', 'icon-512-maskable.png'].forEach(n => {
  fs.copyFileSync(path.join(ROOT, 'icons', n), path.join(ROOT, 'dist', n));
});

const kb = f => (fs.statSync(path.join(ROOT, 'dist', f)).size / 1024).toFixed(1) + ' KB';
console.log('dist/index.html   ', kb('index.html'));
console.log('dist/artifact.html', kb('artifact.html'));
/* keep the source service worker in step, so a local run matches the build */
{
  const swPath = path.join(ROOT, 'sw.js');
  const sw = fs.readFileSync(swPath, 'utf8');
  const fixed = sw.replace(/const CACHE = '[^']*';/, "const CACHE = '" + CACHE_NAME + "';");
  if (fixed !== sw) fs.writeFileSync(swPath, fixed);
}

console.log('version ' + VERSION + '  cache ' + CACHE_NAME);
console.log('files:', fs.readdirSync(path.join(ROOT, 'dist')).join(', '));
