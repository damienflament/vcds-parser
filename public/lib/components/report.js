import { FontAwesome, Tag } from '../components.js'
import van from '../van.js'

const { div, pre, p, header, button } = van.tags

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

  return div({ class: 'card' },
    header({ class: 'card-header is-clickable', onclick: () => { opened.val = !opened.val } },
      p({ class: 'card-header-title' },
        Tag({ class: hasFaults ? 'is-danger' : 'is-success' }, module.address),
        p({ class: 'ml-3' }, module.name)
      ),
      button({ class: 'card-header-icon' },
        () => FontAwesome(opened.val ? 'angle-up' : 'angle-down')
      )
    ),
    div({ class: 'card-content' },
      () => pre({ class: opened.val ? '' : 'is-sr-only' }, stringify(module))
    )
  )
}

export { Report }
