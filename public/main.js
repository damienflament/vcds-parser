/**
 * The main application module.
 * @module
 */

import bulma from './lib/bulma.js'
import { DirectoryPicker, DualButton, FontAwesome, MenuItem, Navbar, Notification, NotificationArea, Report, ReportParseError, StatusTag } from './lib/components.js'
import { configureFromUrl } from './lib/configuration.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { AutoScan, safelyAssign } from './lib/model.js'
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
    reports: van.state([]),
    index: van.state(-1),
    isViewingSource: van.state(false)
  })

  if (config.persistence) {
    const storage = new Storage(window.indexedDB)
    persist(state, storage)
  } else {
    console.log('Persistence disabled.')
  }

  const report = van.derive(() => state.reports.val.length > 0 ? state.reports.val[state.index.val] : null)

  van.derive(() => {
    // Wrap data within model objects and validate
    state.reports.val.forEach((report) => {
      if (report.data) {
        const model = new AutoScan()

        safelyAssign(model, report.data)
        report.data = model

        try {
          validate(model)
        } catch (e) {
          report.error = e
        }
      }
    })
  })

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
              if (files.length === 0) {
                state.reports.val = []
                state.index.val = -1
                return
              }
              let sync = 0
              const reports = []

              files.forEach(f => {
                const report = sealed({
                  filename: f.name,
                  content: null,
                  data: null,
                  error: null
                })

                sync++

                loadFileContent(f)
                  .then(c => {
                    report.content = c

                    return parse(c, f.name)
                  })
                  .then(d => { report.data = frozen(d) })
                  .catch(e => { report.error = e })
                  .finally(() => {
                    reports.push(report)

                    if (--sync === 0) {
                      state.reports.val = reports
                      state.index.val = 0
                    }
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
        name: () => state.directory.val?.name ?? '...',
        onsuccess: d => { state.directory.val = d }
      }),
      Columns(
        Column({ class: 'is-one-fifth' },
          Menu(
            MenuLabel('Files'),
            () => MenuList(
              Array.from(state.reports.val.entries()).map(([i, r]) => // Iterator helper function map() is experimental, work on an array for now
                MenuItem({
                  isSelected: () => state.index.val === i,
                  onclick: () => {
                    state.index.val = i
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
          pre({ class: () => state.isViewingSource.val ? '' : 'is-sr-only' }, () => report.val ? report.val.content : ''),
          () => div({ class: () => state.isViewingSource.val ? 'is-sr-only' : '' },
            () => report.val
              ? report.val.error
                ? ReportParseError(report.val.error)
                : Report(report.val.data)
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
