const CACHE_NAME = 'boda-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/details.html',
  '/watch.html',
  '/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Poppins:wght@300;400;600&display=swap',
  'https://vjs.zencdn.net/8.10.0/video-js.css',
  'https://vjs.zencdn.net/8.10.0/video.min.js'
];

// Install Event: Cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event: Serve from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // Optional: Return a custom offline page if fetch fails
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});