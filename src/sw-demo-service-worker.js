const PRECACHE = 'sw-demo-precache-v1';
const RUNTIME = 'sw-demo-v1';

const PRECACHE_URLS = ['/', '/favicon.ico', '/index.html', '/main.bundle.js', '/assets/no_image_available.jpg'];

const IMGS_ORIGIN_REGEX = new RegExp(/\/\/images\.unsplash\.com\//);

const CACHED_IMGS = [
  'photo-1551742365-038395f2ca06',
  'photo-1529088363398-8efc64a0eb95',
  'photo-1534628854350-62b395c4a2c0',
  'photo-1517423568366-8b83523034fd'
];

let imgs_reg_def = '(';
CACHED_IMGS.forEach((img, index) => {
  if (index > 0) {
    imgs_reg_def += '|';
  }
  imgs_reg_def += '(' + img + ')';
});
imgs_reg_def += ')';
const CACHED_IMGS_REGEX = new RegExp(imgs_reg_def);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('Service worker - retrieve cached version of :', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request)
        .then(response => {
          let responseClone = response.clone();

          if (IMGS_ORIGIN_REGEX.test(event.request.url)) {
            if (CACHED_IMGS_REGEX.test(event.request.url)) {
              caches.open(RUNTIME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
          } else if (event.request.url.startsWith(self.location.origin)) {
            caches.open(RUNTIME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(error => {
          if (IMGS_ORIGIN_REGEX.test(event.request.url) && !CACHED_IMGS_REGEX.test(event.request.url)) {
            return caches.match('/assets/no_image_available.jpg');
          } else {
            return Promise.reject(error);
          }
        });
    })
  );
});
