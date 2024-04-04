/**
 * Service Worker related functions.
 * @module service-worker
 */

import { error } from "./application.js";

/**
 * Registers the specified Service Worker.
 *
 * @param {string} path the path to the file to register
 */
export function registerServiceWorker(path) {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(path)
            .catch(reason => error("Service worker registration failed:", reason));
    } else {
        error("Service workers are not supported");
    }
}
