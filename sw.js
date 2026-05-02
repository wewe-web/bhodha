const CACHE_NAME = 'boda-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './details.html',
  './watch.html',
  './logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// 1. Install & Cache UI Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

// 3. The "Offline Fix": Intercept Network Requests
self.addEventListener('fetch', (event) => {
  // Ignore external API calls to JSONBin so we don't break them
  if (event.request.url.includes('api.jsonbin.io')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached file if found, otherwise try the network
      return response || fetch(event.request).catch(() => {
        // If both fail (offline and not cached), return the cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// 4. Handle Video Downloads (from your trigger function)
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_VIDEO') {
    const { url, title } = event.data;
    
    caches.open('boda-videos').then((cache) => {
      fetch(url).then((response) => {
        if (response.ok) {
          cache.put(url, response);
          // Notify the UI
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'DOWNLOAD_COMPLETE', title }));
          });
        }
      });
    });
  }
});
