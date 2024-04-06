/**
 * Service Worker.
 */

"use strict";

const VERSION = "0.1";
const CACHE_NAME = `vcds-parser-${VERSION}`;

const STATIC_RESOURCES = [
    "/",
    "/vcds-parser.webmanifest",
    "/index.html",
    "/assets/icons/scalable-icon.svg",
    "/assets/icons/windows-app-icon.png",
    "/assets/icons/windows-large-tile.png",
    "/assets/icons/windows-medium-tile.png",
    "/assets/icons/windows-small-tile.png",
    "/assets/icons/windows-store-logo.png",
    "/assets/logo.png",
    "/assets/screenshot.png",
    "/assets/bulma.min.css",
    "/assets/fontawesome/css/fontawesome.min.css",
    "/assets/fontawesome/css/solid.min.css",
    "/assets/fontawesome/webfonts/fa-solid-900.ttf",
    "/assets/fontawesome/webfonts/fa-solid-900.woff2",
    "/assets/style.css",
    "/lib/application.js",
    "/lib/configuration.js",
    "/lib/logging.js",
    "/lib/service-worker.js"
];

/**
 * Adds {@link STATIC_RESOURCES} to the {@link CACHE_NAME} cache.
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
 *  Fetches a response from the {@link CACHE_NAME} cache for the given
 * {@link url}. If no response matches the {@link url}, a 404 response is returned.
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
