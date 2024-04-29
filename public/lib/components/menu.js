/**
 * Menu components.
 * @module
 */

import van from '../van.js'

const { a, aside, li, p, ul } = van.tags

/**
 * A simple menu.
 *
 * @param {object} config
 * @param {string} config.label the menu label
 * @param {[any]} items the menu items
 */
export const Menu = (
  {
    label: menuLabel
  }, ...items) =>
  aside({ class: 'menu block' },
    p({ class: 'menu-label' }, menuLabel),
    ul({ class: 'menu-list' }, items)
  )

/**
 * To be used as a menu child..
 *
 * @param {object} config
 * @param {boolean} config.isSelected if true, the item is shown as selected
 * @param {() => any} config.onclick called when the item is clicked
 * @param {[any]} children the item children
 */
export const MenuItem = (
  {
    isSelected,
    onclick: callback
  }, ...children) =>
  li(a({
    class: isSelected ? 'is-active' : '',
    onclick: callback
  }, children))
