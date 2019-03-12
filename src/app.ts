import { IImage } from './models';
import { images } from './data/images';

import 'bootstrap';
import * as $ from 'jquery';

require('./styles/app.scss');

const RUNTIME: string = 'sw-demo-v1';
const CACHE_IMG_LIST: string[] = [
  // workaround for the user selection of images not working :
  'https://images.unsplash.com/photo-1551742365-038395f2ca06?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1900&fit=max&ixid=eyJhcHBfaWQiOjYwNTU2fQ',
  'https://images.unsplash.com/photo-1534628854350-62b395c4a2c0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1900&fit=max&ixid=eyJhcHBfaWQiOjYwNTU2fQ'
];

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('service-worker.js')
    .then(registration => {
      console.log('ServiceWorker - registration successful with scope: ', registration.scope);
      $(window).ready(() => {
        $('#offline-rdy-indicator')
          .attr('title', 'Offline mode available')
          .html('<i class="fa fa-check text-success"></i>')
          .tooltip();
      });
    })
    .catch(error => {
      // registration failed
      console.log('ServiceWorker - registration failed with ', error);
      $(window).ready(() => {
        $('#offline-rdy-indicator')
          .attr('title', 'Offline mode unavailable')
          .html('<i class="fa fa-times text-danger"></i>')
          .tooltip();
      });
    });
}

function toggleCache(id: number): void {
  let image: IImage = images.filter(i => i.id === id)[0];
  let imgIndex: number = CACHE_IMG_LIST.indexOf(image.data.url);
  if (imgIndex === -1) {
    CACHE_IMG_LIST.push(image.data.url);
    $(`#image-${image.id}`).toggleClass('cached', true);
  } else {
    CACHE_IMG_LIST.splice(imgIndex, 1);
    $(`#image-${image.id}`).toggleClass('cached', false);
  }
}

$(window).ready(() => {
  $('#save-cache-btn').on('click', () => {
    if ('caches' in window) {
      caches.open(RUNTIME).then((cache: Cache) => {
        cache.addAll(CACHE_IMG_LIST);
        /* CACHE_IMG_LIST.forEach((url: string) => {
          fetch(url, {
            headers: {
              Authorization: 'Client-ID 2023f60e723bc951d0a13fcf586156faaa7e1ec9f07228e5156fb5986456ee3e',
              'Cache-Control': 'no-cache'
            }
          })
            .then(response => {
              if (response && response.status === 200) {
                cache.put(url, response);
              }
            })
            .catch(error => {
              console.error('Fetching image respond with :', error);
            });
        }); */
      });
    }
  });

  $('#clear-cache-btn').on('click', () => {
    if ('caches' in window) {
      caches.open(RUNTIME).then((cache: Cache) => {
        cache.keys().then((keys: ReadonlyArray<Request>) => {
          keys.forEach((key: Request) => {
            cache.delete(key);
          });
        });
      });
    }
  });

  $('.btn-toggle-cache').on('click', () => {
    let imgId: number = $(this).data('image-id');
    if (imgId !== undefined) {
      toggleCache(imgId);
    }
  });

  function updateOnlineStatus(): void {
    var condition = navigator.onLine ? 'online' : 'offline';

    $('#status-indicator').empty();
    $('#status-indicator').append(`<i class="fa fa-signal ${condition}"></i>`);
  }

  updateOnlineStatus();

  $(window).on('online', updateOnlineStatus);
  $(window).on('offline', updateOnlineStatus);

  let sliders: string[] = [];
  let indicators: string[] = [];
  let promises: Promise<void>[] = [];

  images.forEach((image: IImage) => {
    let promise: Promise<void> = fetch(image.data.url, {
      headers: {
        Authorization: 'Client-ID 2023f60e723bc951d0a13fcf586156faaa7e1ec9f07228e5156fb5986456ee3e',
        'Cache-Control': 'no-cache'
      }
    })
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
      })
      .then(blob => {
        image.src = window.URL.createObjectURL(blob);

        // Set cached img list
        if ('caches' in window) {
          caches.match(image.data.url).then((response: Response) => {
            if (response) {
              toggleCache(image.id);
            }
          });
        }

        sliders[image.id] = `
          <div class="carousel-item${image.id === 0 ? ' active' : ''}">
            <img id="image-${image.id}" class="d-block h-100 m-auto" src="${image.src}" alt="${image.data.alt}" data-image-url="${image.data.url}">
            <button type="button" class="btn btn-light btn-sm btn-toggle-cache text-center" data-image-id="${image.id}">Toggle cache</button>
            <div class="carousel-caption d-none d-md-block">
              <h5>${image.data.name}</h5>
              <p><a href="${image.data.creditsUrl}" target="_blank">${image.data.credits}</a></p>
            </div>
          </div>`;

        indicators[image.id] = `
        <li data-target="#sw-demo-carousel" data-slide-to="${image.id}" ${image.id === 0 ? 'class="active"' : ''}></li>`;
      });
    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    $('#sliders').append(sliders.join(''));
    $('#indicators').append(indicators.join(''));
    (<any>$('#sw-demo-carousel')).carousel();
  });
});
