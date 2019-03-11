import { ImageI } from './models';
import { images } from './data/images';
import 'bootstrap';
import * as $ from 'jquery';

require('./styles/app.scss');

const RUNTIME = 'sw-demo-v1';

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw-demo-service-worker.js')
    .then(registration => {
      console.log('ServiceWorker - registration successful with scope: ', registration.scope);
    })
    .catch(error => {
      // registration failed
      console.log('ServiceWorker - registration failed with ', error);
    });
}

window.addEventListener('load', () => {
  const clearBtn: HTMLElement = document.getElementById('clear-cache-btn');

  clearBtn.addEventListener('click', () => {
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

  function updateOnlineStatus() {
    var condition = navigator.onLine ? 'online' : 'offline';

    $('#status-indicator').empty();
    $('#status-indicator').append(
      `<span class="d-none d-md-inline">${condition.toUpperCase()} </span><i class="fa fa-signal ${condition}"></i>`
    );
  }

  updateOnlineStatus();

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  interface Item {
    index: number;
    imgData: ImageI;
    imgUrl: string;
  }

  let promises: Promise<void>[] = [];
  let items: Item[] = [];

  images.forEach((image: ImageI) => {
    let promise: Promise<void> = fetch(image.url, {
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
        let index: number = items.length;
        items.push({
          index: index,
          imgData: image,
          imgUrl: window.URL.createObjectURL(blob)
        });
      });
    promises.push(promise);
  });

  let sliders: string = '';
  let indicators: string = '';

  Promise.all(promises).then(() => {
    items.forEach(item => {
      sliders += `<div class="carousel-item${item.index === 0 ? ' active' : ''}">
                    <img class="d-block h-100 m-auto" src="${item.imgUrl}" alt="${item.imgData.alt}">
                    <div class="carousel-caption d-none d-md-block">
                      <h5>${item.imgData.name}</h5>
                      <p><a href="${item.imgData.creditsUrl}" target="_blank">${item.imgData.credits}</a></p>
                    </div>
                  </div>`;
      indicators += `<li data-target="#sw-demo-carousel" data-slide-to="${item.index}" ${
        item.index === 0 ? 'class="active"' : ''
      }></li>`;
    });
    $('#indicators').append(indicators);
    $('#sliders').append(sliders);
    (<any>$('#sw-demo-carousel')).carousel();
  });
});
