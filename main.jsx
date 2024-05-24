/**
 * The main application module.
 * @module
 */

import { formatRelative } from 'date-fns'
import { format } from 'string-kit'

import { configureFromUrl } from './lib/configuration.js'
import { listDirectory, loadFileContent, requestPermission } from './lib/filesystem.js'
import { AutoScan, safelyAssign } from './lib/model.js'
import { registerServiceWorker, unregisterServiceWorker } from './lib/serviceworker.js'
import { Storage, persist } from './lib/storage.js'

import { parse } from './lib/parser.js'
import { validate } from './lib/validator.js'

import { DirectoryPicker, FontAwesome, StatusTag } from './ui/components.jsx'
import { ReportView, ReportParseError } from './ui/report.jsx'

import bulma from './lib/bulma.js'
import van from './lib/van.js'

const sealed = Object.seal
const frozen = Object.freeze

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

const darkColorSchemeQueryList = window.matchMedia('(prefers-color-scheme: dark)')
const isColorSchemeDark = van.state(darkColorSchemeQueryList.matches)

darkColorSchemeQueryList.addEventListener('change', query => {
  isColorSchemeDark.val = query.matches
})

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
    // Sort reports by mileage, youngest first and keep failed parsing last
    state.reports.val.sort(
      ({ data: a }, { data: b }) =>
        a === null
          ? +1
          : b === null
            ? -1
            : b.vehicle.mileage.km - a.vehicle.mileage.km
    )

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

        default:
          endLoading()
      }
    })
  }

  const {
    Block, Section, Content, Footer,
    Navbar, NavbarBrand, NavbarItem,
    Buttons, Button, Icon,
    Columns, Column,
    Control, Field,
    Level, LevelLeft, LevelRight,
    Message, MessageHeader, MessageBody,
    Panel, PanelHeading, PanelIcon
  } = bulma.elements

  const navigation = (
    <Navbar class='has-background-primary'>
      <NavbarBrand>
        <NavbarItem><img src='/assets/logo.png' alt='application logo' /></NavbarItem>
      </NavbarBrand>
    </Navbar>
  )

  const bulmaIcon = () => {
    const path = () => `/assets/made-with-bulma--${isColorSchemeDark.val ? 'semiwhite' : 'semiblack'}.png`

    return <a href='https://bulma.io'><img style={{ height: '1.5em' }} src={path} alt='Made with Bulma' /></a>
  }

  const footer = (
    <Footer>
      <Content class='has-text-centered'>
        <p><strong>VCDS Parser</strong> by Damien Flament.</p>
        <Field class='is-grouped is-grouped-centered'>
          <Control><StatusTag class={config.persistence ? 'is-success' : 'is-warning'}>Persistence</StatusTag></Control>
          <Control><StatusTag class={config.serviceWorker ? 'is-success' : 'is-warning'}>Service Worker</StatusTag></Control>
        </Field>
        {bulmaIcon}
      </Content>
    </Footer>
  )

  const directoryPicker = () => {
    const name = () => state.directory.val?.name ?? '...'
    const setDirectory = d => { state.directory.val = d }

    return <DirectoryPicker label='Scans directory' directoryName={name} onsuccess={setDirectory} />
  }

  const viewerModeSwhitcher = () => {
    const reportButtonClass = () => state.isViewingSource.val ? '' : 'is-selected is-primary'
    const sourceButtonClass = () => state.isViewingSource.val ? 'is-selected is-primary' : ''

    const showReport = () => { state.isViewingSource.val = false }
    const showSource = () => { state.isViewingSource.val = true }

    return (
      <Buttons class='has-addons'>
        <Button class={reportButtonClass} onclick={showReport}>
          <Icon><FontAwesome name='toolbox' /></Icon>
          <span>Report</span>
        </Button>
        <Button class={sourceButtonClass} onclick={showSource}>
          <Icon><FontAwesome name='file-lines' /></Icon>
          <span>Source</span>
        </Button>
      </Buttons>
    )
  }

  const sourceViewer = () => {
    const viewerClass = () => state.isViewingSource.val ? '' : 'is-sr-only'
    const filename = () => report.val?.filename ?? ''
    const content = () => report.val?.content ?? ''

    return (
      <Message class={viewerClass}>
        <MessageHeader>
          <p>{filename}</p>
        </MessageHeader>
        <MessageBody>
          <pre>{content}</pre>
        </MessageBody>
      </Message>
    )
  }

  const reportViewer = () => {
    const viewerClass = () => state.isViewingSource.val ? 'is-sr-only' : ''
    const view = () => report.val
      ? report.val.error
        ? (<ReportParseError error={report.val.error} />)
        : (<ReportView report={report.val.data} />)
      : ''

    return (
      <Block class={viewerClass}>
        {view}
      </Block>
    )
  }

  const reloadButton = () => {
    document.addEventListener('keydown', ev => {
      if (ev.ctrlKey && ev.key === 'r') {
        ev.preventDefault()
        reload()
      }
    })

    const buttonClass = () => `is-fullwidth ${isLoading.val ? 'is-loading' : ''}`

    return (
      <Button class={buttonClass} title='Reload data from the filesystem' onclick={reload}>
        <Icon><FontAwesome name='rotate' /></Icon>
        <span>Reload [Ctrl+R]</span>
      </Button>
    )
  }

  const reportsPanel = () => {
    const items =
      Array.from(state.reports.val.entries())
        .map(([index, { filename, data: report }]) => {
          const itemClass = () => `panel-block ${state.index.val === index ? 'is-active' : ''} ${report === null ? 'has-text-warning' : ''}`
          const iconName = () =>
            report === null
              ? ''
              : report?.hasFaults
                ? 'circle-xmark'
                : 'circle-check'
          const iconClass = () => report === null || report.hasFaults ? 'has-text-danger' : 'has-text-success'
          const label = report === null
            ? 'Failed to parse report'
            : format('%n km - %s',
              report.vehicle.mileage.km,
              formatRelative(report.date, Date.now())
            )

          const setIndex = () => { state.index.val = index }

          return (
            <a key={index} class={itemClass} title={filename} onclick={setIndex}>
              <PanelIcon class={iconClass}><FontAwesome name={iconName} /></PanelIcon>
              {label}
            </a>
          )
        })

    return (
      <Panel class='is-primary'>
        <PanelHeading class='is-flex is-align-items-center is-justify-content-space-between'>Reports</PanelHeading>
        {items}
        <div class='panel-block'>{reloadButton}</div>
      </Panel>
    )
  }

  return (
    <>
      {navigation}
      <Section>
        {directoryPicker}
        <Columns>
          <Column class='is-one-third'>{reportsPanel}</Column>
          <Column>
            <Level>
              <LevelLeft />
              <LevelRight>{viewerModeSwhitcher}</LevelRight>
            </Level>
            {sourceViewer}
            {reportViewer}
          </Column>
        </Columns>
      </Section>
      {footer}
    </>
  )
}

van.add(document.body, App())
