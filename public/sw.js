/**
 * Service Worker.
 */

"use strict";

const VERSION = "0.1.0-dev";
const CACHE_NAME = `vcds-parser-${VERSION}`;

/** Static resources */
const STATIC_RESOURCES = [
    "/",
    "/assets/fontawesome/css/fontawesome.min.css",
    "/assets/fontawesome/css/solid.min.css",
    "/assets/fontawesome/webfonts/fa-solid-900.ttf",
    "/assets/fontawesome/webfonts/fa-solid-900.woff2",
    "/assets/icons/scalable-icon.svg",
    "/assets/icons/windows-app-icon.png",
    "/assets/icons/windows-large-tile.png",
    "/assets/icons/windows-medium-tile.png",
    "/assets/icons/windows-small-tile.png",
    "/assets/icons/windows-store-logo.png",
    "/assets/bulma.min.css",
    "/assets/logo.png",
    "/assets/screenshot.png",
    "/assets/style.css",
    "/assets/van-1.5.0.debug.js",
    "/assets/van-1.5.0.js",
    "/assets/van-1.5.0.min.js",
    "/lib/components.js",
    "/lib/filesystem.js",
    "/lib/service-worker.js",
    "/lib/storage.js",
    "/lib/van.js",
    "/app.js",
    "/index.html",
    "/vcds-parser.webmanifest"
];

/**
 * Adds static resources to the cache.
 */
async function cacheStaticResources() {
    const cache = await caches.open(CACHE_NAME)
        .catch(reason => console.error(`Failed to open cache ${CACHE_NAME}:`, reason));

    await cache.addAll(STATIC_RESOURCES)
        .catch(reason => console.error("Failed to add resources to cache:", reason));
}

/**
 * Registers this Service Worker as the controller of the clients in the current
 * scope.
 *
 * All caches except {@link CACHE_NAME} are cleared before registration.
 */
async function takeControl() {
    const names = await caches.keys()
        .catch(reason => console.error("Failed to retrieve cache names from the storage:", reason));

    for (const name of names) {
        if (name != CACHE_NAME) {
            await caches.delete(name)
                .catch(reason => console.error(`Failed to delete cache ${name}:`, reason));
        }
    }

    await clients.claim()
        .catch(reason => console.error("Failed to take control of the clients:", reason));
}

/**
 * Fetches a response from the cache for the given URL.
 *
 * If no response matches the URL, a 404 response is returned.
 *
 * @param {String} url the requested URL
 * @returns {Promise<Response>} the response
 */
async function fetchFromCache(url) {
    const cache = await caches.open(CACHE_NAME)
        .catch(reason => console.error(`Failed to open cache ${CACHE_NAME}: `, reason));

    let response = await cache.match(url)
        .catch(reason => console.error(`Failed to search within cache for URL ${url}: `, reason));

    if (!response) {
        response = new Response(null, { status: 404 });
    }

    return response;
}

/**
 * Prevents the application to fetch data from the server.
 *
 * @param {FetchEvent} event the fetch event to handle
 */
function forceFetchFromCache(event) {
    let url = event.request.url;

    if (event.request.mode == "navigate") {
        url = "/";
    }

    event.respondWith(fetchFromCache(url));
}

self.addEventListener("install", (event) => {
    console.debug("Installing Service Worker...");
    event.waitUntil(cacheStaticResources());
});

self.addEventListener("activate", (event) => {
    console.debug("Activating Service Worker...");
    event.waitUntil(takeControl());
});

self.addEventListener("fetch", forceFetchFromCache);
