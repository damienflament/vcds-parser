/**
 * The main application module.
 * @module
 */

import bulma from './lib/bulma.js'
import { DirectoryPicker, DualButton, FontAwesome, Notification, NotificationArea, Report, ReportParseError, StatusTag } from './lib/components.js'
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

  const isLoading = van.state(false)

  const endLoading = () => {
    setTimeout(() => {
      isLoading.val = false
    }, 250)
  }

  const reload = () => {
    if (state.directory.val) {
      isLoading.val = true
      openDirectory(state.directory.val)
    }
  }

  van.derive(reload)

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

        endLoading()
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
          endLoading()
          van.add(notificationsArea, Notification({
            message: 'Do you want to load the last opened directory ?',
            label: 'Yes, open it',
            onclick: () => openDirectory(directory)
          }))
          break

        default:
          endLoading()
      }
    })
  }

  const notificationsArea = NotificationArea()

  const { a, pre, div, img, p, strong, span } = van.tags
  const {
    Footer, Section, Content,
    Navbar, NavbarBrand, NavbarItem,
    Button, Icon,
    Columns, Column,
    Control, Field,
    Level, LevelLeft, LevelRight,
    Panel, PanelHeading
  } = bulma.elements

  const navigation = Navbar({ class: 'has-background-primary' },
    NavbarBrand(
      NavbarItem(img({ src: '/assets/logo.png', alt: 'application logo' }))
    )
  )

  const footer = Footer(
    Content({ class: 'has-text-centered' },
      p(strong('VCDS Parser'), ' by Damien Flament.'),
      Field({ class: 'is-grouped is-grouped-centered' },
        Control(
          StatusTag({ class: config.persistence ? 'is-success' : 'is-warning' }, 'Persistence')
        ),
        Control(
          StatusTag({ class: config.serviceWorker ? 'is-success' : 'is-warning' }, 'Service Worker')
        )
      ),
      a({ href: 'https://bulma.io' }, img({ style: 'height: 1.5em', src: 'https://bulma.io/assets/images/made-with-bulma.png', alt: 'Made with Bulma' }))
    )
  )

  const viewerModeSwhitcher = DualButton({
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

  const sourceViewer = pre({ class: () => state.isViewingSource.val ? '' : 'is-sr-only' }, () => report.val ? report.val.content : '')

  const reportViewer = () => div({ class: () => state.isViewingSource.val ? 'is-sr-only' : '' },
    () => report.val
      ? report.val.error
        ? ReportParseError(report.val.error)
        : Report(report.val.data)
      : ''
  )

  const reportsReloadButton = () => {
    document.addEventListener('keydown', ev => {
      if (ev.ctrlKey && ev.key === 'r') {
        ev.preventDefault()
        reload()
      }
    })

    return Button(
      {
        class: () => 'is-fullwidth ' + (isLoading.val ? 'is-loading' : ''),
        title: 'Reload data from the filesystem',
        onclick: reload
      },
      Icon(FontAwesome('rotate')),
      span('Reload [Ctrl+R]')
    )
  }

  const reportsPanel = () => Panel({ class: 'is-primary' },
    PanelHeading({ class: 'is-flex is-align-items-center is-justify-content-space-between' },
      'Reports'

    ),
    Array.from(state.reports.val.entries()).map(([i, { filename: f, data: r, error: e }]) => // Iterator helper function map() is experimental, work on an array for now
      a(
        {
          class: van.classes(
            'panel-block',
            state.index.val === i ? 'is-active' : '',
            r === null ? 'has-text-danger' : ''
          ),
          title: f,
          onclick: () => { state.index.val = i }
        },
        r === null
          ? 'Failed to parse report'
          : r.date
      )
    ),
    div({ class: 'panel-block' }, reportsReloadButton)
  )

  return [
    navigation,

    Section(
      notificationsArea,

      DirectoryPicker({
        label: 'Scans directory',
        name: () => state.directory.val?.name ?? '...',
        onsuccess: d => { state.directory.val = d }
      }),

      Columns(
        Column({ class: 'is-one-third' }, reportsPanel),
        Column(
          Level(
            LevelLeft(),
            LevelRight(viewerModeSwhitcher)
          ),
          sourceViewer,
          reportViewer
        )
      )
    ),

    footer
  ]
}

van.add(document.body, App())
