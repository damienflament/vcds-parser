/**
 * Service Worker related functions.
 * @module
 */

/**
 * Registers the specified file as a Service Worker.
 *
 * If a service worker is already registered with this path, nothing is done.
 *
 * @param {string} path the path to the file to register
 */
export function registerServiceWorker (path) {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported.')
    return
  }

  navigator.serviceWorker.getRegistration()
    .then(registration => {
      // Do nothing if the specified service worker is already registered
      if (registration) {
        const url = new URL(path, window.location.href)
        const registeredUrl = new URL(registration?.active.scriptURL)

        if (url.pathname === registeredUrl.pathname) return
      }

      navigator.serviceWorker.register(path, { type: 'module' })
        .catch(r => console.error('Failed to register service worker:', r))
    })
}

/**
  * Unregisters the Service Worker.
  *
  * If not any Service Worker is registered, nothing is done.
  */
export function unregisterServiceWorker () {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported.')
    return
  }
  navigator.serviceWorker.getRegistration()
    .then(reg => reg?.unregister())
}
