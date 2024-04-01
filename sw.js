"use strict";

/**
 * Service Worker.
 */
const VERSION = "0.1"
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
    "/app.js"
];

/**
 * Adds {@link STATIC_RESOURCES} to the {@link CACHE_NAME} cache.
 */
async function cacheStaticResources() {
    const cache = await caches.open(CACHE_NAME);

    await cache.addAll(STATIC_RESOURCES)
        .catch("Unable to add resources to cache.");
}

/**
 * Registers this Service Worker as the controller of the clients in the current
 * scope.
 *
 * All caches except {@link CACHE_NAME} are cleared before registration.
 */
async function takeControl() {
    const names = await caches.keys()
        .catch("Unable to retrieve cache names from the storage");

    for (const name of names) {
        if (name != CACHE_NAME) {
            await caches.delete(name)
                .catch(console.error("Unable to delete cache: ", name));
        }
    }

    await clients.claim()
        .catch(console.error("Unable to take control of the clients"));
}

/**
 *  Fetches a response from the {@link CACHE_NAME} cache for the given
 * {@link url}. If no response matches the {@link url}, a 404 response is returned.
 *
 * @param {String} url The requested URL
 * @returns {Promise<Response>} The response
 */
async function fetchFromCache(url) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);

    if (!response) {
        response = new Response(null, { status: 404 });

        console.warn("Response not cached for URL: ", url)
    }

    return response;
}

/**
 * Prevents the application to fetch data from the server.
 *
 * @param {FetchEvent} event
 */
function forceFetchFromCache(event) {
    let url = event.request.url;

    if (event.request.mode == "navigate") {
        url = "/";
    }

    event.respondWith(fetchFromCache(url));
}

self.addEventListener("install", (event) => {
    event.waitUntil(cacheStaticResources());
});

self.addEventListener("activate", (event) => {
    event.waitUntil(takeControl())
});

self.addEventListener("fetch", forceFetchFromCache);
