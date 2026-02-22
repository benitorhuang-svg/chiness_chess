const CACHE_NAME = 'chess-pwa-v1';
const ASSETS = [
    './',
    './index.html',
    './assets/css/style.css',
    './src/main.js',
    './src/engine/chess-engine.js',
    './src/engine/ai-engine.js',
    './src/ui/renderer.js',
    './src/services/network.js',
    './assets/images/board_bg.png',
    './favicon.png',
    'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
