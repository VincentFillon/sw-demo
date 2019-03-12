const PRECACHE: string = 'sw-demo-precache-v1';
const RUNTIME: string = 'sw-demo-v1';

const PRECACHE_URLS: string[] = [
  './',
  './favicon.ico',
  './index.html',
  './main.bundle.js',
  './fonts/fontawesome-webfont.woff2',
  './assets/image_not_available.jpg'
];

const IMGS_ORIGIN_REGEX: RegExp = new RegExp(/\/\/images\.unsplash\.com\//);

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache: Cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  const currentCaches = [PRECACHE, RUNTIME];
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

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse: Response) => {
      if (cachedResponse) {
        console.log('Service worker - retrieve cached version of :', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response: Response) => {
          let responseClone = response.clone();

          if (IMGS_ORIGIN_REGEX.test(event.request.url) || event.request.url.startsWith(self.location.origin)) {
            caches.open(RUNTIME).then((cache: Cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error: any) => {
          if (IMGS_ORIGIN_REGEX.test(event.request.url)) {
            return caches.match('/assets/image_not_available.jpg');
          } else {
            return Promise.reject(error);
          }
        });
    })
  );
});
