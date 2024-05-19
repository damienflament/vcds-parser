import { inspect } from 'string-kit'
import { FontAwesome, Spoiler } from '../components.js'

import bulma from '../bulma.js'
import van from '../van.js'

const { div, pre, p, strong } = van.tags
const { Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Icon, Message, MessageHeader, MessageBody, Tag } = bulma.elements

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
        pre(inspect(module))
      )
    )
  )
}

/**
 * @param {import('../model.js').Report} report
 * @returns {HTMLElement}
 */
const Report = report => {
  const { modules } = van.val(report)

  return div(
    Object.values(modules).map(module => () => {
      try {
        return ModuleComponent(module)
      } catch (e) {
        return ModuleReadError(module, e)
      }
    })
  )
}

/**
 * @param {import('../model.js').Module} module the module to show
 * @returns {HTMLElement}
 */
const ModuleComponent = module => {
  const opened = van.state(false)

  return Card(
    CardHeader({ class: 'is-clickable', onclick: () => { opened.val = !opened.val } },
      CardHeaderTitle(
        Tag({ class: [module.isFaulty ? 'is-danger' : 'is-success', 'mr-2'] }, module.address),
        p({ class: 'is-flex-grow-1' }, module.name),
        Icon({ class: module.isReachable ? '' : 'has-text-danger' }, FontAwesome('plug'))
      ),
      CardHeaderIcon(
        () => FontAwesome(opened.val ? 'angle-up' : 'angle-down')
      )
    ),
    CardContent(
      () => {
        const dom = div({ class: opened.val ? '' : 'is-sr-only' })
        dom.innerHTML = inspect({ depth: 5, style: 'html' }, module)
        return dom
      }
    )
  )
}

export { Report, ReportParseError }
