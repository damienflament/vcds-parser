/**
 * The main application module.
 * @module
 */

import bulma from './lib/bulma.js'
import { DirectoryPicker, DualButton, FontAwesome, MenuItem, Navbar, Notification, NotificationArea, Report, ReportParseError, StatusTag } from './lib/components.js'
import { configureFromUrl } from './lib/configuration.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { frozen, sealed } from './lib/object.js'
import { parse } from './lib/parser.js'
import { registerServiceWorker, unregisterServiceWorker } from './lib/serviceworker.js'
import { Storage, persist } from './lib/storage.js'
import { validate } from './lib/validator.js'
import van from './lib/van.js'

/** Application configuration */
const config = sealed({
  serviceWorker: true,
  persistence: true
})

configureFromUrl(config, window.location.href)

if (config.serviceWorker) {
  registerServiceWorker('./sw.js')
} else {
  console.log('Service Worker disabled.')
  unregisterServiceWorker()
}

const App = () => {
  /** Persisted state */
  const state = frozen({
    directory: van.state(null),
    report: van.state(null),
    isViewingSource: van.state(false)
  })

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

  /** Working directory label */
  const directoryName = van.derive(() =>
    isDirectoryOpen.val
      ? state.directory.val.name
      : 'Open a directory...'
  )

  /** Reports located in the working directory */
  const reports = van.state([])

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
              reports.val = []

              files.forEach(f => {
                const report = sealed({
                  filename: f.name,
                  content: null,
                  data: null,
                  error: null
                })

                loadFileContent(f)
                  .then(c => {
                    report.content = c

                    return parse(c, f.name)
                  })
                  .then(d => {
                    report.data = d

                    return validate(d)
                  })
                  .catch(e => { report.error = e })
                  .finally(() => {
                    reports.val = reports.val.concat([report])
                    state.report.val ??= reports.val[0]
                    isDirectoryOpen.val = true
                  })
              })
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

  /** Notification area */
  const notificationsArea = NotificationArea()

  const { pre, div, p, strong, span } = van.tags
  const { Columns, Column, Content, Control, Field, Footer, Icon, Level, LevelLeft, LevelRight, Menu, MenuLabel, MenuList, Section } = bulma.elements

  return [
    Navbar({ logo: { src: '/assets/logo.png', alt: 'application logo' } }),

    Section(
      notificationsArea,
      DirectoryPicker({
        label: 'Scans directory',
        name: directoryName,
        onsuccess: d => {
          state.directory.val = d
          state.report.val = null
        }
      }),
      Columns(
        Column({ class: 'is-one-fifth' },
          Menu(
            MenuLabel('Files'),
            () => MenuList(
              reports.val.map((r) =>
                MenuItem({
                  isSelected: () => r.filename === state.report.val.filename,
                  onclick: () => {
                    state.report.val = r
                  }
                }, r.filename)
              )
            )
          )
        ),
        Column(
          Level(
            LevelLeft(),
            LevelRight(
              DualButton({
                left: [
                  Icon(FontAwesome('toolbox')),
                  span('Report')
                ],
                onclickLeft: () => { state.isViewingSource.val = false },
                right: [
                  Icon(FontAwesome('file-lines')),
                  span('Source')
                ],
                onclickRight: () => { state.isViewingSource.val = true },
                isLeftSelected: () => !state.isViewingSource.val
              })
            )
          ),
          pre({ class: () => state.isViewingSource.val ? '' : 'is-sr-only' }, () => isDirectoryOpen.val && state.report.val ? state.report.val.content : ''),
          () => div({ class: () => state.isViewingSource.val ? 'is-sr-only' : '' },
            () => isDirectoryOpen.val && state.report.val
              ? state.report.val.error
                ? ReportParseError(state.report.val.error)
                : Report(state.report.val.data)
              : ''
          )
        )
      )
    ),

    Footer(
      Content({ class: 'has-text-centered' },
        p(strong('VCDS Parser'), ' by Damien Flament.')
      ),
      Field({ class: 'is-grouped is-grouped-centered' },
        Control(
          StatusTag({ class: config.persistence ? 'is-success' : 'is-warning' }, 'Persistence')
        ),
        Control(
          StatusTag({ class: config.serviceWorker ? 'is-success' : 'is-warning' }, 'Service Worker')
        )
      )
    )
  ]
}

van.add(document.body, App())
