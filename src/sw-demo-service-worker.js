self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('sw-demo-v1').then(function(cache) {
      return cache.addAll(['./', './favicon.ico', './index.html', './main.bundle.js', './assets/default_dog.jpg']);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response !== undefined) {
        console.log('Service worker - retrieve cached version of [' + event.request.url + ']');
        return response;
      } else {
        return fetch(event.request)
          .then(function(fResponse) {
            let responseClone = fResponse.clone();

            if (/\/\/images\.unsplash\.com\//.test(event.request.url)) {
              if (/photo\-1551742365\-038395f2ca06/.test(event.request.url)) {
                caches.open('sw-demo-v1').then(function(cache) {
                  cache.put(event.request, responseClone);
                });
              }
            } else {
              caches.open('sw-demo-v1').then(function(cache) {
                cache.put(event.request, responseClone);
              });
            }
            return fResponse;
          })
          .catch(function() {
            caches.match('/assets/default_dog.jpg').then(function(fResponse) {
              if (fResponse) {
                return fResponse;
              } else {
                return fetch(event.request);
              }
            });
          });
      }
    })
  );
});
