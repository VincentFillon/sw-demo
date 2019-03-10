Service Worker Demo
------------------------------

Demo of wervice worker in action.
Load images from external urls and cache some of them through service worker.
If you run offline mode, it should retrieve cached images and default image for uncached ones.

_Note, this is a WIP._

## How to use

Just clone it and get going.

```
# --depth 1 removes all but one .git commit history
$ git clone --depth=1 https://github.com/VincentFillon/sw-demo.git <your-project-name>

# change directory to your project
cd  <your-project-name>

# install all dependencies.
$ npm i

# Start developing and serve your app:
npm (run) start

# Build your app without minification: 
npm run build

# Build your app with minification: 
npm run build.prod

# run unit tests:
npm run test
```

