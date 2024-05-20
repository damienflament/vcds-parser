import { inspect } from 'string-kit'
import { FontAwesome, Spoiler } from './components.jsx'

import bulma from '../lib/bulma.js'
import van from '../lib/van.js'

const { Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Icon, Message, MessageHeader, MessageBody, Tag } = bulma.elements

const ReportParseError = ({ error: { name, message, stack } }) =>
  <Message>
    <MessageHeader><p>Failed to parse report</p></MessageHeader>
    <MessageBody class='content'>
      <p>This error is <strong>NOT related to the vehicle</strong>. This is a problem with <strong>VCDS Parser</strong>.</p>
      <Spoiler>
        <p><strong>{name}</strong>: {message}</p>
        <pre>{stack}</pre>
      </Spoiler>
    </MessageBody>
  </Message>

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

const Report = ({ report: { modules } }) =>
  <div>
    {Object.values(modules).map(m => () => {
      try {
        return <Module module={m} />
      } catch (e) {
        return <ModuleReadError module={m} error={e} />
      }
    })}
  </div>

const Module = ({ module }) => {
  const opened = van.state(false)

  const toggleOpened = () => { opened.val = !opened.val }

  return (
    <Card>
      <CardHeader class='is-clickable' onclick={toggleOpened}>
        <CardHeaderTitle>
          <Tag class={[module.isFaulty ? 'is-danger' : 'is-success', 'mr-2']}>{module.address}</Tag>
          <p class='is-flex-grow-1'>{module.name}</p>
          <Icon class={module.isReachable ? '' : 'has-text-danger'}><FontAwesome name='plug' /></Icon>
        </CardHeaderTitle>
        <CardHeaderIcon>{() => <FontAwesome name={opened.val ? 'angle-up' : 'angle-down'} />}</CardHeaderIcon>
      </CardHeader>
      <CardContent>
        {() => {
          const dom = <div class={opened.val ? '' : 'is-sr-only'} />
          dom.innerHTML = inspect({ depth: 5, style: 'html' }, module)
          return dom
        }}
      </CardContent>
    </Card>
  )
}

export { Report, ReportParseError }
