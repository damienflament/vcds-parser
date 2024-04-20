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
        navigator.serviceWorker.register(path)
            .catch(reason => console.error("Service worker registration failed:", reason));
    } else {
        console.error("Service workers are not supported.");
    }
}
