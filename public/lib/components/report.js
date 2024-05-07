import { FontAwesome, Spoiler } from '../components.js'

import bulma from '../bulma.js'
import van from '../van.js'

const { div, pre, p, strong } = van.tags
const { Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Message, MessageHeader, MessageBody, Tag } = bulma.elements

const stringify = d => JSON.stringify(d, null, 4)

const ReportParseError = error => {
  const { name, message, stack } = van.val(error)

  return Message(
    MessageHeader(p('Failed to parse report')),
    MessageBody({ class: 'content' },
      p('This error is ', strong('NOT related to the vehicle'), '. This is a problem with ', strong('VCDS Parser'), '.'),
      Spoiler(
        p(strong(name), `: ${message}`),
        pre(stack)
      )
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
        pre(stack),
        pre(JSON.stringify(module, null, 4))
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
        return ModuleComponent(module)
      } catch (e) {
        return ModuleReadError(module, e)
      }
    })
  )
}

/**
 *
 * @param {import('../report.js').Module} module the module to show
 * @returns {HTMLElement}
 */
const ModuleComponent = module => {
  const opened = van.state(false)

  return Card(
    CardHeader({ class: 'is-clickable', onclick: () => { opened.val = !opened.val } },
      CardHeaderTitle(
        Tag({ class: module.isFaulty ? 'is-danger' : 'is-success' }, module.address),
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
