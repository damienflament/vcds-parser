const VERSION = "0.1"
const CACHE_NAME = `vcds-parser-${VERSION}`;

const STATIC_RESOURCES = [
    "/",
    "/vcds-parser.webmanifest",
    "/index.html",
    "/app.js",
    "/icons/windows-app-icon.png"
];

/**
 * Adds {@link STATIC_RESOURCES} to the {@link CACHE_NAME} cache.
 */
async function cacheStaticResources() {
    const cache = await caches.open(CACHE_NAME);

    await cache.addAll(STATIC_RESOURCES);
}

/**
 * Clears all caches except {@link CACHE_NAME} cache.
 */
async function clearCaches() {
    const names = await caches.keys();

    for (const name of names) {
        if (name != CACHE_NAME) {
            await caches.delete(name);
        }
    }

    await clients.claim();
}

/**
 *  Returns a response from the {@link CACHE_NAME} cache for the given {@link url}.
 *  If no response matches the {@link url}, a 404 response is returned.
 *
 * @param {String} url The requested URL
 * @returns {Promise<Response>} The response
 */
async function fetchFromCache(url) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await caches.match(url);

    return cachedResponse || new Response(null, { status: 404 })
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
    event.waitUntil(clearCaches())
});

self.addEventListener("fetch", forceFetchFromCache);
