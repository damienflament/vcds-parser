import { FontAwesome } from '../components.js'

import bulma from '../bulma.js'
import van from '../van.js'

const { div, pre, p } = van.tags
const { Card, CardHeader, CardHeaderTitle, CardHeaderIcon, CardContent, Tag } = bulma.elements

const stringify = d => JSON.stringify(d, null, 4)

const Report = ({ data }) => {
  const { modules } = data

  return div(
    Object.values(modules).map(m => () => Module(m)),
    pre(stringify(data))
  )
}

const Module = (module) => {
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

export { Report }
