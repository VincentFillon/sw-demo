import { Renderer } from './utils';
import { ImageI, HtmlElementI } from './models';
import { images } from './data/images';

require('./styles/app.scss');

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw-demo-service-worker.js')
    .then(reg => {
      if (reg.installing) {
        console.log('Service worker - installing');
      } else if (reg.waiting) {
        console.log('Service worker - installed');
      } else if (reg.active) {
        console.log('Service worker - active');
      }
    })
    .catch(error => {
      // registration failed
      console.log('Service worker - registration failed with ' + error);
    });
}

window.addEventListener('load', () => {
  const clearBtn: HTMLElement = document.getElementById('clear-cache-btn');

  clearBtn.addEventListener('click', e => {
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          caches.delete(key);
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
    imgGrid.children[index] = {
      tagName: 'div',
      classes: 'col',
      children: [
        {
          tagName: 'figure',
          id: 'figure-' + index,
          classes: 'text-center',
          children: [
            // dog.htmlStruct,
            {
              tagName: 'img',
              attributes: [
                { name: 'src', value: './assets/default_dog.jpg' },
                { name: 'alt', value: 'Default dog' },
                { name: 'style', value: 'max-width: 300px; max-height: 300px' }
              ]
            },
            {
              tagName: 'caption',
              classes: 'text-center',
              children: [{ tagName: 'span', children: [{ tagName: 'strong', innerHtml: 'Default dog' }] }]
            }
          ]
        }
      ]
    };

    if (navigator.onLine) {
      fetch(image.url, {
        headers: {
          Authorization: 'Client-ID 2023f60e723bc951d0a13fcf586156faaa7e1ec9f07228e5156fb5986456ee3e'
        }
      })
        .then(response => {
          if (response.ok) {
            return response.blob();
          } else {
            console.error(new Error(response.statusText));
          }
        })
        .then(blob => {
          let imageURL: string = window.URL.createObjectURL(blob);
          imgGrid.children[index].children[0].children = [
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
          ];
          mainRenderer.clearContent();
          mainRenderer.appendChild(mainRenderer.renderEl(imgGrid));
        });
    }
  });

  mainRenderer.clearContent();
  mainRenderer.appendChild(mainRenderer.renderEl(imgGrid));
});
