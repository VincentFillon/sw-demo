// Set cache names
const PRECACHE: string = 'sw-demo-precache-v1';
const RUNTIME: string = 'sw-demo-v1';

// Set precache urls
const PRECACHE_URLS: string[] = [
  './',
  './favicon.ico',
  './index.html',
  './main.bundle.js',
  './fonts/fontawesome-webfont.woff2',
  './assets/image_not_available.jpg'
];

// Set url for image default fallback
const IMGS_ORIGIN_REGEX: RegExp = new RegExp(/\/\/images\.unsplash\.com\//);

// Service worker install handler
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    // Cache all precache urls
    caches.open(PRECACHE).then((cache: Cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Service worker activate handler
self.addEventListener('activate', (event: ExtendableEvent) => {
  const currentCaches = [PRECACHE, RUNTIME];
  // Clear old cache urls
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames: string[]) => {
        return cacheNames.filter((cacheName: string) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete: string[]) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete: string) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => (<any>self).clients.claim())
  );
});

// Service worker fetch handler
self.addEventListener('fetch', (event: FetchEvent) => {
  // Retrieve cached response if match event url or default image fallback if fetching image that is not cached
  event.respondWith(
    caches.match(event.request).then((cachedResponse: Response) => {
      if (cachedResponse) {
        console.log('Service worker - retrieve cached version of :', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        if (IMGS_ORIGIN_REGEX.test(event.request.url)) {
          return caches.match('/assets/image_not_available.jpg');
        } else {
          return fetch(event.request);
        }
      });
    })
  );
});
