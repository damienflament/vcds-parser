/**
 * Bulma elements as VanJS tags.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import { camelToDashCase } from './string.js'
import van from './van.js'

const { button, div, footer, header, p, span } = van.tags

const elementsTags = {
  Button: button,
  CardHeader: header,
  CardHeaderTitle: p,
  CardHeaderIcon: button,
  Delete: button,
  Footer: footer,
  FileCta: span,
  FileIcon: span,
  FileName: span,
  Icon: span,
  Tag: span
}

/**
 * Builds a VanJS tag for the specified Bulma element.
 *
 * @param {string} name the name of the Bulma element to build
 * @returns {(...any) => HTMLElement} a VanJS tag
 */
const buildElementTag = (name) => (...args) => {
  const [props, children] = van.args(args)

  const tag = elementsTags[name] ?? div
  const elementClassName = camelToDashCase(name)

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
