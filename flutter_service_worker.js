'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "37e0b13abaa42287b28752c3e4cef2cd",
"assets/assets/images/amex.png": "dad771da6513cec63005d2ef1271189f",
"assets/assets/images/categorias/ps4-pro.png": "a19c9746166e8f95c64f3fc367d27f04",
"assets/assets/images/discover.png": "ea70c496dfa0169f6a3e59412472d6c1",
"assets/assets/images/empty.png": "6603eb08bf06f7b01d2ca53f71f21678",
"assets/assets/images/emptycategory.png": "bf6582eafe98be385c1767924162ddd3",
"assets/assets/images/emptywallet.png": "a460b9925376f6eb902d113769aaf528",
"assets/assets/images/estados.json": "42804399d9999968ab7b1505e14a4225",
"assets/assets/images/heart.png": "5443e1fe4672a93b7b4b069840ccaa46",
"assets/assets/images/imgplaceholder.png": "1958dd0165588888f63c741771fcbb6b",
"assets/assets/images/loading.gif": "a0c13b5041ad9ee1962817525220325e",
"assets/assets/images/login.png": "0ba22427ca7a0f6dbf6f1a33c55dada4",
"assets/assets/images/mastercard.png": "7e386dc6c169e7164bd6f88bffb733c7",
"assets/assets/images/municipios.json": "d763994f45e6af64d46b1354535a81ce",
"assets/assets/images/offline.png": "ff8ee1705e390468ab06cdc85811d83a",
"assets/assets/images/otherbrand.png": "891a4eb7b807f9df0f0e5a57867fe4b5",
"assets/assets/images/payment.png": "659a66dced320d252e22eb702b1b9610",
"assets/assets/images/pedido-sucesso.png": "e8e4d87c8dea10b68320db326fe15c60",
"assets/assets/images/pedido-sucesso.svg": "cae414952dc640865b65272d62c965a6",
"assets/assets/images/pedidos.png": "872d40b475305fd39357b5c7393a6304",
"assets/assets/images/profile.png": "2c958575f2cf06529498bcdde5440818",
"assets/assets/images/register.png": "a174c5344640c7839df0db9a7e8fb92c",
"assets/assets/images/unheart.png": "ea63abab83ee670baaa1ab81d5ec9519",
"assets/assets/images/visa.png": "9db6b8c16d9afbb27b29ec0596be128b",
"assets/assets/images/walletfull.png": "0f96ff95a688cd478fe89885320e4e86",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/NOTICES": "53e4373c0ce48bde19024e493a3b01cc",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "383b6d6ea486be22c58db711a4649f0b",
"/": "383b6d6ea486be22c58db711a4649f0b",
"main.dart.js": "efc937f163b2bbef911eebb4ee9c2fec",
"manifest.json": "6d6f4be480d7e08a296550d4abf7aed5"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a 'reload' param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'reload'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
