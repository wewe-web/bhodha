const CACHE_NAME = 'boda-theater-v1';
const VIDEO_CACHE = 'boda-video-downloads';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_VIDEO') {
        const { url, title } = event.data;
        downloadAndCacheVideo(url, title);
    }
});

async function downloadAndCacheVideo(url, title) {
    const cache = await caches.open(VIDEO_CACHE);
    
    try {
        // We use 'no-cors' for external mirrors like Bilibili 
        // Note: This creates an "opaque" response which can be cached but not read by JS
        const response = await fetch(url, { mode: 'no-cors' });
        await cache.put(url, response);
        
        // Notify the app that it's done
        const allClients = await clients.matchAll();
        allClients.forEach(client => {
            client.postMessage({
                type: 'DOWNLOAD_COMPLETE',
                title: title,
                url: url
            });
        });
    } catch (error) {
        console.error("Internal Download Failed:", error);
    }
}

// Intercept requests to serve cached videos offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
