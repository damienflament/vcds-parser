/**
 * The main application module.
 * @module
 */

import { DirectoryPicker, DualButton, FontAwesome, Menu, MenuItem, Navbar, Notification, NotificationArea, Section, StatusTag } from './lib/components.js'
import { configureFromUrl } from './lib/configuration.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { parse } from './lib/report.js'
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

  /** Report source */
  const reportSource = van.state('')

  van.derive(() => {
    if (isDirectoryOpen.val && state.file.val) {
      loadFileContent(state.file.val)
        .then(c => { reportSource.val = c })
    }
  })

  /** Report */
  const report = van.derive(() => {
    if (reportSource.val) {
      try {
        const result = parse(reportSource.val)
        return JSON.stringify(result, null, 4)
      } catch (e) {
        return e.toString()
      }
    } else {
      return ''
    }
  })

  /** Viever */
  const isViewingSource = van.state(false)

  /** Notification area */
  const notificationsArea = NotificationArea()

  const { pre, div, footer, p, strong, span } = van.tags

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

      div({ class: 'columns' },
        div({ class: 'column is-one-fifth' },
          () => Menu({
            label: 'Files'
          }, directoryFiles.val.map(f =>
            MenuItem({
              isSelected: f.name === state.file.val?.name,
              onclick: () => { state.file.val = f }
            }, f.name)
          ))
        ),
        div({ class: 'column' },
          DualButton({
            class: 'is-right',
            state: isViewingSource,
            left: [
              span({ class: 'icon' }, FontAwesome('toolbox')),
              span('Report')
            ],
            onclickLeft: () => { isViewingSource.val = false },
            right: [
              span({ class: 'icon' }, FontAwesome('file-lines')),
              span('Source')
            ],
            onclickRight: () => { isViewingSource.val = true }
          }),
          pre({ style: 'font-family: monospace; font-size: 16px;' },
            () => { return isViewingSource.val ? reportSource.val : report.val })
        )
      )
    ),

    footer({ class: 'footer' },
      div({ class: 'content has-text-centered' },
        p(strong('VCDS Parser'), ' by Damien Flament.')
      ),
      div({ class: 'field is-grouped is-grouped-centered' },
        div({ class: 'control' },
          StatusTag({ class: config.persistence ? 'is-success' : 'is-warning' }, 'Persistence')
        ),
        div({ class: 'control' },
          StatusTag({ class: config.serviceWorker ? 'is-success' : 'is-warning' }, 'Service Worker')
        )
      )
    )
  ]
}

van.add(document.body, App())
