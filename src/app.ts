import { IImage } from './models';
import { images } from './data/images';

import 'bootstrap';
import * as $ from 'jquery';

require('./styles/app.scss');

const RUNTIME: string = 'sw-demo-v1';
const CACHE_IMG_LIST: string[] = [];

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('service-worker.js')
    .then(registration => {
      console.log('ServiceWorker - registration successful with scope: ', registration.scope);
    })
    .catch(error => {
      // registration failed
      console.log('ServiceWorker - registration failed with ', error);
    });
}

let promises: Promise<void>[] = [];

$(window).ready(() => {
  $('#clear-cache-btn').on('click', () => {
    if ('caches' in window) {
      caches.open(RUNTIME).then(cache => {
        cache.keys().then(keys => {
          keys.forEach(key => {
            cache.delete(key);
          });
        });
      });
    }
  });

  function updateOnlineStatus(): void {
    var condition = navigator.onLine ? 'online' : 'offline';

    $('#status-indicator').empty();
    $('#status-indicator').append(
      `<span class="d-none d-md-inline">${condition.toUpperCase()} </span><i class="fa fa-signal ${condition}"></i>`
    );
  }

  updateOnlineStatus();

  $(window).on('online', updateOnlineStatus);
  $(window).on('offline', updateOnlineStatus);

  function toggleCache(id: number): void {
    let image: IImage = images.filter(i => i.id === id)[0];
    let imgIndex: number = CACHE_IMG_LIST.indexOf(image.data.url);
    if (imgIndex === -1) {
      CACHE_IMG_LIST.push(image.data.url);
    } else {
      CACHE_IMG_LIST.splice(imgIndex, 1);
    }
    $(`#image-${image.id}`).toggleClass('to-be-cached');
  }

  let sliders: string[] = [];
  let indicators: string[] = [];

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
            <img id="image-${image.id}" class="d-block h-100 m-auto" src="${image.src}" alt="${
          image.data.alt
        }" data-image-url="${image.data.url}">
            <div class="carousel-caption d-none d-md-block">
              <h5>${image.data.name}</h5>
              <p><a href="${image.data.creditsUrl}" target="_blank">${image.data.credits}</a></p>
            </div>
          </div>`;

        indicators[image.id] = `
        <li data-target="#sw-demo-carousel" data-slide-to="${image.id}" ${
          image.id === 0 ? 'class="active"' : ''
        }></li>`;

        $(document).on('click', `#image-${image.id}`, () => {
          toggleCache(image.id);
        });
      });
    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    $('#sliders').append(sliders.join(''));
    $('#indicators').append(indicators.join(''));
    (<any>$('#sw-demo-carousel')).carousel();
  });
});
