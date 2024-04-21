/* eslint-env serviceworker */

/**
 * Service Worker.
 */

'use strict'

import config from './config.js'

/**
 * Adds static resources to the cache.
 */
async function cacheStaticResources () {
  const cache = await caches.open(config.cacheName)
    .catch(reason => console.error(`Failed to open cache ${config.cacheName}:`, reason))

  return cache.addAll(config.staticResources)
    .catch(reason => console.error('Failed to add resources to cache:', reason))
}

/**
 * Registers this Service Worker as the controller of the clients in the current
 * scope.
 *
 * Unused caches are cleared before registration.
 */
async function takeControl () {
  const names = await caches.keys()
    .catch(reason => console.error('Failed to retrieve cache names from the storage:', reason))

  for (const name of names) {
    if (name !== config.cacheName) {
      await caches.delete(name)
        .catch(reason => console.error(`Failed to delete cache ${name}:`, reason))
    }
  }

  return clients.claim()
    .catch(reason => console.error('Failed to take control of the clients:', reason))
}

/**
 * Fetches a response from the cache for the given URL.
 *
 * If no response matches the URL, a 404 response is returned.
 *
 * @param {String} url the requested URL
 * @returns {Promise<Response>} the response
 */
async function fetchFromCache (url) {
  const cache = await caches.open(config.cacheName)
    .catch(reason => console.error(`Failed to open cache ${config.cacheName}: `, reason))

  let response = await cache.match(url)
    .catch(reason => console.error(`Failed to search within cache for URL ${url}: `, reason))

  if (!response) {
    response = new Response(null, { status: 404 })
  }

  return response
}

/**
 * Prevents the application to fetch data from the server.
 *
 * @param {FetchEvent} event the fetch event to handle
 */
function forceFetchFromCache (event) {
  let url = event.request.url

  if (event.request.mode === 'navigate') {
    url = '/'
  }

  event.respondWith(fetchFromCache(url))
}

self.addEventListener('install', (ev) => {
  console.debug('Installing Service Worker...')
  ev.waitUntil(cacheStaticResources())
})

self.addEventListener('activate', (ev) => {
  console.debug('Activating Service Worker...')
  ev.waitUntil(takeControl())
})

self.addEventListener('fetch', forceFetchFromCache)
