/**
 * Bulma elements as VanJS tags.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import { camelToDashCase } from './string.js'
import van from './van.js'

const { article, aside, button, div, footer, header, p, span, ul } = van.tags

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
  Section: div,
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
  const elementClassName = camelToDashCase(name)
  let tag = elementsTags[name]

  if (tag === undefined) {
    console.log(`No tag defined for Bulma element: ${name}. Using default "div".`)
    tag = div
  }

  switch (true) {
    // Take care of function as class value
    case props.class instanceof Function: {
      const _class = props.class

      props.class = () => van.classes(elementClassName, _class())
      break
    }

    // Take care of classes array
    case props.class instanceof Array:
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
