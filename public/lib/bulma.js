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
  Level: div,
  LevelLeft: div,
  LevelRight: div,
  Menu: aside,
  MenuLabel: p,
  MenuList: ul,
  Message: article,
  MessageHeader: div,
  MessageBody: div,
  Navbar: div,
  NavbarBrand: div,
  NavbarItem: div,
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

  // Take care of function as class value
  if (props.class instanceof Function) {
    const previousFunction = props.class

    props.class = () => van.classes(elementClassName, previousFunction())
  } else {
    props.class = van.classes(elementClassName, props.class ?? '')
  }

  return tag(props, ...children)
}

const elements = new Proxy({}, {
  get: (_target, name, _receiver) => buildElementTag(name)
})

export default { elements }
