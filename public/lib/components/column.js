/**
 * Responsive columns components.
 * @module
 */

import van from '../van.js'

const { div } = van.tags

/** A container for colums. */
export const Columns = (...children) =>
  div(
    { class: 'columns' },
    children
  )

/**
 * A column.
 *
 * @param {object} [props]
 * @param  {string} props.class the column class
 * @param {any} ...children
 */
export const Column = (...args) => {
  const [props, ...children] = van.args(...args)

  return div({ class: van.class(['column', props.class]) }, ...children)
}
