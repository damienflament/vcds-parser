import { FontAwesome, Spoiler } from '../components.js'

import bulma from '../bulma.js'
import van from '../van.js'

const { div, pre, p, strong } = van.tags
const { Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Message, MessageHeader, MessageBody, Tag } = bulma.elements

const stringify = d => JSON.stringify(d, null, 4)

const ReportParseError = error => {
  const { name, message, stack } = van.val(error)

  return Message({ class: 'is-danger' },
    MessageHeader(p('Failed to parse report.')),
    MessageBody({ class: 'content' },
      p(`${name}: ${message}`),
      pre(stack)
    )
  )
}

const ModuleReadError = (module, error) => {
  const { name, message, stack } = error

  return Message(
    MessageHeader(
      p({ class: 'is-flex is-align-items-center' },
        Tag(module.address),
        p({ class: 'ml-3' }, 'Failed to read module data')
      )
    ),
    MessageBody({ class: 'content' },
      p('This error is ', strong('NOT related to the vehicle'), '. This is a problem with ', strong('VCDS Parser'), '.'),
      Spoiler(
        p(strong(name), `: ${message}`),
        pre(stack)
      )
    )
  )
}

const Report = data => {
  const { modules } = van.val(data)

  return div(
    Object.values(modules).map(module => () => {
      if (module.address === '00') return // Ignore special module 00 for now

      try {
        return Module(module)
      } catch (e) {
        return ModuleReadError(module, e)
      }
    })
  )
}

const Module = module => {
  const opened = van.state(false)
  const hasFaults = module.faults.length > 0

  return Card(
    CardHeader({ class: 'is-clickable', onclick: () => { opened.val = !opened.val } },
      CardHeaderTitle(
        Tag({ class: hasFaults ? 'is-danger' : 'is-success' }, module.address),
        p({ class: 'ml-3' }, module.name)
      ),
      CardHeaderIcon(
        () => FontAwesome(opened.val ? 'angle-up' : 'angle-down')
      )
    ),
    CardContent(
      () => pre({ class: opened.val ? '' : 'is-sr-only' }, stringify(module))
    )
  )
}

export { Report, ReportParseError }
