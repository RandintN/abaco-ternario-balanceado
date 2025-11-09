/*
  Copyright (c) 2025 Robson Cassiano
  Licensed under the MIT License. See the LICENSE file in the project root for full text.

  Service Worker for offline support
  Caches core app shell and provides runtime caching for other requests (e.g., CDN assets).
*/

const CACHE_VERSION = 'v3';
const APP_CACHE = `abaco-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = 'runtime-cache';

// List of local assets to precache
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './assets/triquetra.webp',
  './assets/favicons/favicon.ico',
  './assets/favicons/favicon-16x16.png',
  './assets/favicons/favicon-32x32.png',
  './assets/favicons/apple-touch-icon.png',
  './assets/favicons/android-chrome-192x192.png',
  './assets/favicons/android-chrome-512x512.png',
  './assets/favicons/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => {
        if (key !== APP_CACHE && key !== RUNTIME_CACHE) {
          return caches.delete(key);
        }
        return undefined;
      }));
      await self.clients.claim();
      // Notify all clients that a new service worker is active
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsList) {
        client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
      }
    })()
  );
});

// Allow the page to request immediate activation
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests: always serve app shell (index.html) to support SPA routes on static hosts
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const freshShell = await fetch('./index.html', { cache: 'no-cache' });
          const cache = await caches.open(APP_CACHE);
          cache.put('./index.html', freshShell.clone());
          return freshShell;
        } catch (err) {
          const cache = await caches.open(APP_CACHE);
          const cachedShell = await cache.match('./index.html');
          return cachedShell || Response.error();
        }
      })()
    );
    return;
  }

  // Same-origin: cache-first strategy for local assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Cache a clone of the response for future use
          return caches.open(APP_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // Cross-origin (e.g., CDN): network-first with runtime cache fallback
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request, { mode: 'no-cors' });
        // no-cors may create an opaque response; still cache it
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (e) {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        return Response.error();
      }
    })()
  );
});
