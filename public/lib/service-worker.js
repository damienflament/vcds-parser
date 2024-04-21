/**
 * Service Worker related functions.
 * @module
 */

/**
 * Registers the specified file as a Service Worker.
 *
 * @param {string} path the path to the file to register
 */
export function registerServiceWorker(path) {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(
            path,
            { type: "module", }
        )
            .catch(reason => console.error("Failed to register service worker:", reason));
    } else {
        console.error("Service workers are not supported.");
    }
}
