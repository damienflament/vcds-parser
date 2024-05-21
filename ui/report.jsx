import { inspect } from 'string-kit'
import { FontAwesome, Spoiler } from './components.jsx'

import bulma from '../lib/bulma.js'
import van from '../lib/van.js'

const { Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Icon, Message, MessageHeader, MessageBody, Tag } = bulma.elements

const comfortMessage = <p>This error is <strong>NOT related to the vehicle</strong>. This is a problem with <strong>VCDS Parser</strong>.</p>

/** A message showing an error of report parsing. */
const ReportParseError = ({ error: { name, message, stack } }) =>
  <Message>
    <MessageHeader><p>Failed to parse report</p></MessageHeader>
    <MessageBody class='content'>
      {comfortMessage}
      <Spoiler>
        <p><strong>{name}</strong>: {message}</p>
        <pre>{stack}</pre>
      </Spoiler>
    </MessageBody>
  </Message>

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

const Report = ({ report: { modules } }) => {
  const modulesViews = Object.values(modules).map(m => () => {
    try {
      return <Module module={m} />
    } catch (e) {
      return <ModuleReadError module={m} error={e} />
    }
  })

  return <div>{modulesViews}</div>
}

const Module = ({ module }) => {
  const isOpened = van.state(false)

  const addressClass = `${module.isFaulty ? 'is-danger' : 'is-success'} mr-2`
  const reachableClass = module.isReachable ? '' : 'has-text-danger'

  const toggleIconName = () => isOpened.val ? 'angle-up' : 'angle-down'
  const contentClass = () => isOpened.val ? '' : 'is-sr-only'
  const cardContent = <CardContent class={contentClass} />
  cardContent.innerHTML = inspect({ depth: 5, style: 'html' }, module)

  const toggleOpened = () => { isOpened.val = !isOpened.val }

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
      {cardContent}
    </Card>
  )
}

export { Report, ReportParseError }
