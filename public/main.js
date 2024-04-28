/**
 * The main application module.
 * @module
 */

import { DirectoryPicker, Menu, MenuItem, Navbar, Notification, NotificationArea, Section } from './lib/components.js'
import { configureFromUrl } from './lib/configuration.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { SyntaxError, parse } from './lib/parser.js'
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
  const fileContent = van.state('')
  const fileStructure = van.state('')

  van.derive(() => {
    if (isDirectoryOpen.val && state.file.val) {
      loadFileContent(state.file.val).then(c => {
        fileContent.val = c

        try {
          const result = parse(c)
          fileStructure.val = JSON.stringify(result, null, 4)
        } catch (e) {
          if (e instanceof SyntaxError) {
            const startLine = e.location.start.line
            const startColumn = e.location.start.column
            const endLine = e.location.end.line
            const endColumn = e.location.end.column
            const startOffset = e.location.start.offset
            const endOffset = e.location.end.offset
            const endDisplay = c.indexOf('\r', endOffset)

            fileStructure.val = `${e.name}: ${e.message}
              from line ${startLine} column ${startColumn}
                to line ${endLine} column ${endColumn}\n` +
              '\n' +
              '[...]' + c.substring(startOffset - 100, endDisplay) + '\n' +
              '|'.padStart(startColumn - 1)

            if (endColumn - startColumn > 0) {
              fileStructure.val += ' '.repeat(endColumn - startColumn) + '|'
            }
          } else {
            throw e
          }
        }
      })
    } else {
      fileContent.val = ''
    }
  })

  /** Notification area */
  const notificationsArea = NotificationArea()

  const { pre, div } = van.tags

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

      div({ class: 'columns' },
        div({ class: 'column' },
          pre({
          }, fileStructure)
        ),
        div({ class: 'column' },
          pre({
          }, fileContent)
        )
      )
    )
  ]
}

van.add(document.body, App())
