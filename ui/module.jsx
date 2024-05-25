import { inspect } from 'string-kit'

import { FontAwesome, Spoiler } from './components.jsx'

import van from '../lib/van.js'
import bulma from '../lib/bulma.js'
import { comfortMessage } from './report.jsx'

const { Icon, Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Message, MessageHeader, MessageBody, Subtitle, Table, Tag, Title } = bulma.elements

const ModuleView = ({ module }) => {
  const isOpened = van.state(false)

  const addressClass = `${module.isFaulty ? 'is-danger' : 'is-success'} mr-2`
  const reachableClass = module.isReachable ? '' : 'has-text-danger'

  const toggleIconName = () => isOpened.val ? 'angle-up' : 'angle-down'
  const contentClass = () => isOpened.val ? '' : 'is-sr-only'

  const repr = <div />
  repr.innerHTML = inspect({ depth: 5, outputMaxLength: 10000, style: 'html' }, module)

  const toggleOpened = () => { isOpened.val = !isOpened.val }

  const info = module.info
    ? (
      <>
        <Title>{module.name}</Title>
        <Subtitle class='is-spaced'>{module.info.component}</Subtitle>
        <ModuleInfo info={module.info} />
      </>
      )
    : null

  return (
    <Card>
      <CardHeader class='is-clickable' onclick={toggleOpened}>
        <CardHeaderTitle>
          <Tag class={addressClass}>{module.address}</Tag>
          <p class='is-flex-grow-1'>{module.name}</p>
          <Icon class={reachableClass}><FontAwesome name='plug' /></Icon>
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

const ModuleInfo = ({ info }) => {
  const {
    partNumber: {
      software: softwarePart,
      hardware: hardwarePart
    },
    serial,
    revision
  } = info

  return (
    <>
      <Title class='is-4'>Identification</Title>
      <Table class='is-striped is-fullwidth'>
        <tbody>
          <tr><th>Software part number</th><td>{softwarePart ?? '-'}</td></tr>
          <tr><th>Hardware part number</th><td>{hardwarePart ?? '-'}</td></tr>
          <tr><th>Serial number</th><td>{serial ?? '-'}</td></tr>
          <tr><th>Revision number</th><td>{revision ?? '-'}</td></tr>
        </tbody>
      </Table>
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
      {comfortMessage}
      <Spoiler>
        <p><strong>{name}</strong>: {message}</p>
        <pre>{stack}</pre>
        <pre>{inspect(module)}</pre>
      </Spoiler>
    </MessageBody>
  </Message>

export { ModuleView, ModuleReadError }
