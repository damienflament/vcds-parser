/**
 * Bulma elements as VanJS tags.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import 'bulma/css/bulma.css'
import '../main.css'

import dashify from 'dashify'
import typeOf from 'type-detect'
import van from './van.js'

const { article, aside, button, div, figure, footer, header, p, span, table, ul } = van.tags

const elementsTags = {
  Block: div,
  Button: button,
  Buttons: div,
  Card: div,
  CardHeader: header,
  CardHeaderTitle: p,
  CardHeaderIcon: button,
  CardContent: div,
  Column: div,
  Columns: div,
  Content: div,
  Control: div,
  Delete: button,
  Field: div,
  File: div,
  FileCta: span,
  FileIcon: span,
  FileName: span,
  Footer: footer,
  Icon: span,
  IconText: span,
  Image: figure,
  Level: div,
  LevelLeft: div,
  LevelRight: div,
  LevelItem: div,
  Menu: aside,
  MenuLabel: p,
  MenuList: ul,
  Message: article,
  MessageHeader: div,
  MessageBody: div,
  Navbar: div,
  NavbarBrand: div,
  NavbarItem: div,
  Notification: div,
  Panel: div,
  PanelHeading: p,
  PanelIcon: span,
  Section: div,
  Table: table,
  Tag: span,
  Tags: div
}

/**
 * Builds a VanJS tag for the specified Bulma element.
 *
 * @param {string} name the name of the Bulma element to build
 * @returns {(...any) => HTMLElement} a VanJS tag
 */
const buildElementTag = (name) => (...args) => {
  const [props, children] = van.args(args)
  const elementClassName = dashify(name)
  let tag = elementsTags[name]

  if (tag === undefined) {
    console.log(`No tag defined for Bulma element: ${name}. Using default "div".`)
    tag = div
  }

  switch (typeOf(props.class)) {
    // Take care of function as class value
    case 'function': {
      const _class = props.class

      props.class = () => van.classes(elementClassName, _class())
      break
    }

    // Take care of classes array
    case 'Array':
      props.class = van.classes(elementClassName, ...props.class)
      break

    default:
      props.class = van.classes(elementClassName, props.class ?? '')
      break
  }

  return tag(props, ...children)
}

const elements = new Proxy({}, {
  get: (_target, name, _receiver) => buildElementTag(name)
})

export default { elements }
