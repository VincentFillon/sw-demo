import { IImage } from './models';
import { images } from './data/images';

import 'bootstrap';
import * as $ from 'jquery';

require('./styles/app.scss');

// Set RUNTIME cache name
const RUNTIME: string = 'sw-demo-v1';

// Set images url to be cached when click on "Save images to cache" button
const CACHE_IMG_LIST: string[] = [
  'https://images.unsplash.com/photo-1551742365-038395f2ca06?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1900&fit=max&ixid=eyJhcHBfaWQiOjYwNTU2fQ',
  'https://images.unsplash.com/photo-1529088363398-8efc64a0eb95?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1900&fit=max&ixid=eyJhcHBfaWQiOjYwNTU2fQ',
  'https://images.unsplash.com/photo-1534628854350-62b395c4a2c0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1900&fit=max&ixid=eyJhcHBfaWQiOjYwNTU2fQ',
  'https://images.unsplash.com/photo-1512578056007-5f98190be743?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1900&fit=max&ixid=eyJhcHBfaWQiOjYwNTU2fQ'
];

// register service worker and put an icon with tooltip to tell the user if offline mode is available or not
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

/**
 * Cache all CACHE_IMG_LIST urls one by one and show a progress bar
 * @param {number} index index of current url to be cached
 */
function addToCache(index?: number): void {
  index = index !== undefined && isFinite(index) ? index : 0;
  let url: string = CACHE_IMG_LIST[index];
  if ('caches' in window) {
    caches.open(RUNTIME).then((cache: Cache) => {
      cache.add(url).finally(() => {
        let progress: number = ((index + 1) / CACHE_IMG_LIST.length) * 100;

        if (progress < 100) {
          let roundedProgress: number = 0;
          if (progress >= 25 && progress < 50) {
            roundedProgress = 25;
          } else if (progress >= 50 && progress < 75) {
            roundedProgress = 50;
          } else if (progress >= 75 && progress < 100) {
            roundedProgress = 75;
          }
          $('#caching-progress').html(
            `<div class="progress">
            <div class="progress-bar w-${roundedProgress}" role="progressbar" aria-valuenow="${roundedProgress}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>`
          );
        } else {
          $('#caching-progress').html(
            `<div class="progress">
              <div class="progress-bar w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
            </div>`
          );
          setTimeout(() => $('#caching-progress').empty(), 2000);
        }
        if (index < CACHE_IMG_LIST.length - 1) {
          addToCache(index + 1);
        }
      });
    });
  }
}

$(window).ready(() => {
  // "save images to cache" button handler (trigger addToCache recursive function)
  $('#save-cache-btn').on('click', () => {
    addToCache();
  });

  // "clear cache" button handler (remove all images from RUNTIME cache)
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

  /**
   * Show to user if application is runing online or not with a "signal" icon
   */
  function updateOnlineStatus(): void {
    var condition = navigator.onLine ? 'online' : 'offline';

    $('#status-indicator').empty();
    $('#status-indicator').append(`<i class="fa fa-signal ${condition}"></i>`);
  }

  // call updateOnlineStatus to define the online state on window ready
  updateOnlineStatus();

  // online status change handlers (trigger updateOnlineStatus function)
  $(window).on('online', updateOnlineStatus);
  $(window).on('offline', updateOnlineStatus);

  let sliders: string[] = [];
  let indicators: string[] = [];
  let promises: Promise<void>[] = [];

  /* Fetch images from external source
   * if offline, service worker will check if cache mach and retrieve it
   * else the default fallback image is retrieved like it was the original request
   */
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

        sliders[image.id] = `
          <div class="carousel-item${image.id === 0 ? ' active' : ''}">
            <img id="image-${image.id}" class="d-block img-fluid m-auto" src="${image.src}" alt="${image.data.alt}" data-image-url="${image.data.url}">
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

  // After all images are fully fetched, instanciate the bootstrap carousel
  Promise.all(promises).then(() => {
    $('#sliders').append(sliders.join(''));
    $('#indicators').append(indicators.join(''));
    (<any>$('#sw-demo-carousel')).carousel();
  });
});
