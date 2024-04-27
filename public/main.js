/**
 * The main application module.
 * @module
 */

import { DirectoryPicker, Menu, MenuItem, Navbar, Notification, NotificationArea, Section } from './lib/components.js'
import { configureFromUrl } from './lib/configuration.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { registerServiceWorker, unregisterServiceWorker } from './lib/serviceworker.js'
import { Storage, persist } from './lib/storage.js'
import van from './lib/van.js'

/** Application configuration */
const config = {
  serviceWorker: true,
  persistence: true
}

configureFromUrl(config, window.location.href)

if (config.serviceWorker) {
  registerServiceWorker('./sw.js')
} else {
  console.log('Service Worker disabled.')
  unregisterServiceWorker()
}

const App = () => {
  /** Persisted state */
  const state = {
    directory: van.state(null),
    file: van.state(null)
  }

  if (config.persistence) {
    const storage = new Storage(window.indexedDB)
    persist(state, storage)
  } else {
    console.log('Persistence disabled.')
  }

  /**
   * A flag indicating if the directory has been opened.
   *
   * If not, it means the `state.directory` value was just loaded from storage.
   */
  const isDirectoryOpen = van.state(false)

  /** Current directory label */
  const directoryName = van.derive(() =>
    isDirectoryOpen.val
      ? state.directory.val.name
      : 'Open a directory...'
  )

  /** Current directory files */
  const directoryFiles = van.state([])

  /**
   * Opens the given directory.
   *
   * If a permission has to be requested to the user, a notification is shown.
   *
   * @param {FileSystemDirectoryHandle} directory the directory to open
   */
  async function openDirectory (directory) {
    requestPermission(directory).then(permission => {
      switch (permission) {
        case 'granted':
          listDirectory(directory)
            .then((files) => {
              directoryFiles.val = files
              isDirectoryOpen.val = true
              state.file.val ??= files[0] ?? null
            })
          break

        case 'prompt':
          van.add(notificationsArea, Notification({
            message: 'Do you want to load the last opened directory ?',
            label: 'Yes, open it',
            onclick: () => openDirectory(directory)
          }))
          break
      }
    })
  }

  van.derive(() => {
    if (state.directory.val) {
      openDirectory(state.directory.val)
    }
  })

  /** Selected file content */
  const fileContent = van.state(null)

  van.derive(() => {
    if (isDirectoryOpen.val && state.file.val) {
      loadFileContent(state.file.val, (c) => { fileContent.val = c })
    } else {
      fileContent.val = ''
    }
  })

  /** Notification area */
  const notificationsArea = NotificationArea()

  const { pre } = van.tags

  return [
    Navbar({ logo: { src: '/assets/logo.png', alt: 'application logo' } }),
    Section(
      notificationsArea,
      DirectoryPicker({
        label: 'Scans directory',
        name: directoryName,
        onsuccess: d => {
          state.directory.val = d
          state.file.val = null
        }
      }),

      () => Menu({
        label: 'Files'
      }, directoryFiles.val.map(f =>
        MenuItem({
          isSelected: f.name === state.file.val?.name,
          onclick: () => { state.file.val = f }
        }, f.name)
      )),

      pre({
        class: 'textarea',
        style: 'height: auto;'
      }, fileContent)
    )
  ]
}

van.add(document.body, App())
