/**
 * Responsive columns components.
 * @module
 */

import van from '../van.js'

const { div } = van.tags

/**
 * A container for colums.
 *
 * @param {...any} children the container children
 * @returns {HTMLElement}
 */
const Columns = (...children) =>
  div(
    { class: 'columns' },
    children
  )

/**
 * A column.
 *
 * @param {object} [props]
 * @param  {string} props.class the column class
 * @param {...any} children the column children
 * @returns {HTMLElement}
 */
const Column = (...args) => {
  const [props, children] = van.args(args)

  return div({ class: van.classes('column', props.class) }, ...children)
}

export { Column, Columns }
