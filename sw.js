const CACHE_NAME = 'boda-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/library.html',
  '/watch.html',
  '/manifest.json',
  'https://vjs.zencdn.net/8.10.0/video-js.css',
  'https://vjs.zencdn.net/8.10.0/video.min.js',
  'https://unpkg.com/@silvermine/videojs-quality-selector/dist/css/quality-selector.css',
  'https://unpkg.com/@silvermine/videojs-quality-selector/dist/js/silvermine-videojs-quality-selector.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Poppins:wght@300;400&display=swap'
];

// Install: Cache UI assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

// Fetch: Serve from Cache, Fallback to Network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin video requests (handled by watch.html logic)
  if (event.request.url.includes('.mp4') || event.request.url.includes('.m3u8')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
