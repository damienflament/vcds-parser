/**
 * Menu components.
 * @module
 */

import van from '../van.js'

const { a, aside, li, p, ul } = van.tags

/**
 * A simple menu.
 *
 * @param {object} [props]
 * @param {string} props.label the menu label
 * @param {...any} children the menu items
 * @returns HTMLElement
 */
const Menu = (...args) => {
  const [props, children] = van.args(args)

  return aside({ class: 'menu block' },
    p({ class: 'menu-label' }, props.label),
    ul({ class: 'menu-list' }, ...children)
  )
}

/**
 * A menu item.
 *
 * To be used as a menu child.
 *
 * @param {object} [props]
 * @param {boolean} props.isSelected if true, the item is shown as selected
 * @param {() => any} props.onclick called when the item is clicked
 * @param {...any} children the item children
 * @returns HTMLElement
 */
const MenuItem = (...args) => {
  const [props, children] = van.args(args)

  return li(a({
    class: props.isSelected ? 'is-active' : '',
    onclick: van.handler(props.onclick)
  }, ...children))
}

export { Menu, MenuItem }
