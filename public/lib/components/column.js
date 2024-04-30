/**
 * Responsive columns components.
 * @module
 */

import van from '../van.js'

const { div } = van.tags

export const Columns = (...children) =>
  div(
    { class: 'columns' },
    children
  )

export const Column = (...args) => {
  const [props, ...children] = van.args(...args)
  const cls = props.class

  return div({ class: van.class(['column', cls ?? '']) }, children)
}
