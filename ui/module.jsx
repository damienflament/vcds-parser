import { format, inspect } from 'string-kit'

import { ClipboardCopy, FontAwesome, Spoiler } from './components.jsx'

import van from '../lib/van.js'
import bulma from '../lib/bulma.js'

const { Icon, Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Message, MessageHeader, MessageBody, Subtitle, Table, Tag, Title } = bulma.elements

const ModuleView = ({ module }) => {
  const isOpened = van.state(false)

  const addressClass = `${module.isFaulty ? 'is-danger' : 'is-success'} mr-2`
  const reachabilityClass = module.isReachable ? '' : 'has-text-danger '
  const reachabilityTooltip = module.isReachable ? 'Module reachable' : 'Module unreachable'

  const toggleIconName = () => isOpened.val ? 'angle-up' : 'angle-down'
  const contentClass = () => isOpened.val ? '' : 'is-sr-only'

  const repr = <div />
  repr.innerHTML = inspect({ depth: 7, outputMaxLength: 20000, style: 'html' }, module)

  const toggleOpened = () => { isOpened.val = !isOpened.val }

  const subsystems = module.hasSubsystems
    ? (
      <>
        <Title class='is-4 is-spaced'>Subsystems</Title>
        {module.subsystems.map(s => <Subsystem key={s.index} system={s} />)}
      </>
      )
    : null

  const faults = module.hasFaults
    ? (
      <>
        <Title class='is-4 is-spaced'>Faults</Title>
        {module.faults.map(f => <Fault key={f.code} fault={f} />)}
      </>
      )
    : null

  const info = module.info
    ? (
      <>
        <Title>{module.name}</Title>
        <Subtitle class='is-spaced'><ClipboardCopy>{module.info.component}</ClipboardCopy></Subtitle>
        <Info info={module.info} />
        {subsystems}
        {faults}
      </>
      )
    : null

  return (
    <Card>
      <CardHeader class='is-clickable' onclick={toggleOpened}>
        <CardHeaderTitle>
          <Tag class={addressClass}>{module.address}</Tag>
          <p class='is-flex-grow-1'>{module.name}</p>
          <Icon class={reachabilityClass} data-tooltip={reachabilityTooltip}><FontAwesome name='plug' /></Icon>
        </CardHeaderTitle>
        <CardHeaderIcon><FontAwesome name={toggleIconName} /></CardHeaderIcon>
      </CardHeader>
      <CardContent class={contentClass}>
        {info}
        {repr}
      </CardContent>
    </Card>
  )
}

const Info = ({ info }) => {
  const {
    partNumber: {
      software: softwarePart,
      hardware: hardwarePart
    },
    serial,
    revision,
    coding: {
      value: codingValue,
      wsc
    }
  } = info

  return (
    <>
      <Title class='is-4'>Identification</Title>
      <InfoTable>
        <InfoRow label='Software part number' info={softwarePart} clipboardCopy />
        <InfoRow label='Hardware part number' info={hardwarePart} clipboardCopy />
        <InfoRow label='Serial number' info={serial} clipboardCopy />
        <InfoRow label='Revision number' info={revision} clipboardCopy />
      </InfoTable>
      <Title class='is-4'>Coding</Title>
      <InfoTable>
        <InfoRow label='Coding value' info={codingValue} clipboardCopy />
        <InfoRow label='WorkShop Code (WSC)' info={wsc} clipboardCopy />
      </InfoTable>
    </>
  )
}

const InfoTable = ({ children }) => <Table class='is-striped is-fullwidth'><tbody>{children}</tbody></Table>

const InfoRow = ({ label, info, data = null, clipboardCopy = false }) => {
  if (info === '' || info === null) {
    info = '-'
  } else if (clipboardCopy) {
    info = data
      ? <ClipboardCopy data={data}>{info}</ClipboardCopy>
      : <ClipboardCopy>{info}</ClipboardCopy>
  }

  return <tr><th>{label}</th><td>{info}</td></tr>
}

const Subsystem = ({ system }) => {
  const {
    component,
    partNumber,
    coding,
    wsc
  } = system

  return (
    <>
      <Subtitle class='is-5'><ClipboardCopy>{component}</ClipboardCopy></Subtitle>
      <InfoTable>
        <InfoRow label='Part Number' info={partNumber} clipboardCopy />
        <InfoRow label='Coding value' info={coding} clipboardCopy />
        <InfoRow label='WorkShop Code (WSC)' info={wsc} clipboardCopy />
      </InfoTable>
    </>
  )
}

const Fault = ({ fault }) => {
  const {
    subject,
    code: {
      odb2,
      vag
    },
    symptom: {
      description
    }
  } = fault

  return (
    <>
      <Title class='is-5'>{subject}</Title>
      <InfoTable>
        <InfoRow label='OBD2 Code' info={odb2} clipboardCopy />
        <InfoRow label='VAG Code' info={vag} clipboardCopy />
        <InfoRow label='Symptom' info={description} />
      </InfoTable>
      {fault.freezeFrame && <FreezeFrame frame={fault.freezeFrame} />}
    </>
  )
}

const FreezeFrame = ({ frame }) => {
  const {
    status,
    priority,
    mileage,
    frequency,
    resetCounter,
    timeIndication
  } = frame

  return (
    <>
      <Title class='is-6'>Freeze frame</Title>
      <InfoTable>
        <InfoRow label='Status' info={status} />
        <InfoRow label='Priority' info={priority} />
        <InfoRow label='Mileage' info={format('%n km', mileage.km)} data={mileage.km} clipboardCopy />
        <InfoRow label='Frequency' info={frequency} />
        <InfoRow label='Reset counter' info={resetCounter} />
        <InfoRow label='Time indication' info={timeIndication} />
      </InfoTable>
    </>
  )
}

/** A message showing an error of module data reading. */
const ModuleReadError = ({ module, error: { name, message, stack } }) =>
  <Message>
    <MessageHeader>
      <p class='is-flex is-align-items-center'>
        <Tag>{module.address}</Tag>
        <p class='ml-3'>Failed to read module data</p>
      </p>
    </MessageHeader>
    <MessageBody class='content'>
      <p>This error is <strong>NOT related to the vehicle</strong>. This is a problem with <strong>VCDS Parser</strong>.</p>
      <Spoiler>
        <p><strong>{name}</strong>: {message}</p>
        <pre>{stack}</pre>
        <pre>{inspect(module)}</pre>
      </Spoiler>
    </MessageBody>
  </Message>

export { ModuleView, ModuleReadError }
