/**
 * The main application module.
 * @module
 */

import { DirectoryPicker, Menu, Navbar, Notification, NotificationArea, Section } from './lib/components.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { registerServiceWorker, unregisterServiceWorker } from './lib/serviceworker.js'
import { Storage, persist } from './lib/storage.js'
import van from './lib/van.js'

// The service worker is registered unless the 'nosw' URL parameter is defined.
const url = new URL(window.location.href)

if (url.searchParams.has('nosw')) {
  unregisterServiceWorker()
} else {
  registerServiceWorker('./sw.js')
}

const App = () => {
  const { pre } = van.tags

  /** Persisted state */
  const state = {
    directory: van.state(null),
    file: van.state(null)
  }
  const storage = new Storage(window.indexedDB)
  persist(state, storage)

  /** A flag indicating if the directory has been opened. */
  const isDirectoryOpened = van.state(false)

  /** Current directory label */
  const directoryName = van.derive(() =>
    isDirectoryOpened.val
      ? state.directory.val.name
      : 'Open a directory...'
  )

  /** Current directory files */
  const directoryFiles = van.state([])

  /**
   * Opens the directory.
   *
   * The directory stored in the persisted state is opened. If a permission
   * has to be requested to the user, a notification is shown.
   */
  async function openDirectory () {
    const directory = state.directory.val

    if (directory) {
      requestPermission(directory).then(permission => {
        switch (permission) {
          case 'granted':
            listDirectory(directory)
              .then((files) => {
                directoryFiles.val = files
                state.file.val ??= files[0]
                isDirectoryOpened.val = true
              })
            break

          case 'prompt':
            van.add(notificationsArea, Notification({
              message: 'Do you want to load the last opened directory ?',
              label: 'Yes, open it',
              onclick: () => openDirectory()
            }))
            break
        }
      })
    }
  }

  van.derive(openDirectory)

  /** Selected file content */
  const fileContent = van.state(null)

  van.derive(() => {
    if (isDirectoryOpened.val && state.file.val) {
      loadFileContent(state.file.val, (c) => { fileContent.val = c })
    } else {
      fileContent.val = ''
    }
  })

  /** Notification area */
  const notificationsArea = NotificationArea()

  return [
    Navbar({ logo: { src: '/assets/logo.png', alt: 'application logo' } }),
    Section(
      notificationsArea,
      DirectoryPicker({
        label: 'Scans directory',
        name: directoryName,
        onsuccess: (directory) => {
          state.directory.val = directory
          state.file.val = null
        }
      }),
      Menu({
        label: 'Files',
        itemsState: directoryFiles,
        formatter: f => f.name,
        onclick: f => { state.file.val = f },
        isSelected: f => f.name === state.file.val?.name
      }),
      pre({
        class: 'textarea',
        style: 'height: auto;'
      }, fileContent)
    )
  ]
}

van.add(document.body, App())
