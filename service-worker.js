/*
  Copyright (c) 2025 Robson Cassiano
  Licensed under the MIT License. See the LICENSE file in the project root for full text.

  Service Worker for offline support
  Caches core app shell and provides runtime caching for other requests (e.g., CDN assets).
*/

const CACHE_VERSION = 'v1';
const APP_CACHE = `abaco-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = 'runtime-cache';

// List of local assets to precache
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './assets/triquetra.png',
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
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests: serve cached index.html (SPA-style) when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try the network first
          const fresh = await fetch(request);
          const cache = await caches.open(APP_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          // Fallback to cached index.html or any cached navigation request
          const cache = await caches.open(APP_CACHE);
          const cached = await cache.match('./index.html');
          return cached || Response.error();
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
