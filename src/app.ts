import { Renderer } from './utils';
import { ImageI, HtmlElementI } from './models';
import { images } from './data/images';

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

  clearBtn.addEventListener('click', e => {
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

  const status: HTMLElement = document.getElementById('status-indicator');

  function updateOnlineStatus() {
    var condition = navigator.onLine ? 'online' : 'offline';

    status.className = condition;
    status.innerHTML = condition.toUpperCase();
  }

  updateOnlineStatus();

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  const mainRenderer: Renderer = new Renderer('#sw-demo-container');

  const imgGrid: HtmlElementI = {
    tagName: 'div',
    classes: 'row align-items-end',
    children: []
  };

  images.forEach((image: ImageI, index: number) => {
    fetch(image.url, {
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
        let imageURL: string = window.URL.createObjectURL(blob);

        imgGrid.children[index] = {
          tagName: 'div',
          classes: 'col',
          children: [
            {
              tagName: 'figure',
              classes: 'text-center',
              children: [
                {
                  tagName: 'img',
                  attributes: [
                    { name: 'src', value: imageURL },
                    { name: 'alt', value: image.alt },
                    { name: 'style', value: 'max-width: 300px; max-height: 300px' }
                  ]
                },
                {
                  tagName: 'caption',
                  classes: 'text-center',
                  children: [
                    { tagName: 'span', children: [{ tagName: 'strong', innerHtml: image.name }] },
                    { tagName: 'br' },
                    {
                      tagName: 'a',
                      attributes: [{ name: 'href', value: image.creditsUrl }, { name: 'target', value: '_blank' }],
                      innerHtml: image.credits
                    }
                  ]
                }
              ]
            }
          ]
        };
        mainRenderer.clearContent();
        mainRenderer.appendChild(mainRenderer.renderEl(imgGrid));
      });
  });
});
