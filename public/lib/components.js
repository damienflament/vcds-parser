/**
 * Reactive VanJS components styled with Bulma.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import van from './van.js'

const { a, aside, button, div, i, img, label, li, p, span, ul } = van.tags

/**
 * A responsive horizontal navigation bar.
 *
 * @param {string} logo.src the logo path
 * @param {string} logo.alt the logo alternative description
 */
export const Navbar = ({ logo: { src, alt } }) =>
  div({ class: 'navbar' },
    div({ class: 'navbar-brand' },
      div({ class: 'navbar-item' },
        img({ src, alt })
      )
    )
  )

/** A simple container to divide your page into sections. */
export const Section = (...content) => div({ class: 'section' }, content)

/** A Font Awesome icon. */
export const FontAwesome = name => i({ class: `fa-solid fa-${name}` })

/**
 * A directory upload input using Javascript.
 *
 * @param {string} label the input label
 * @param {string} name the name of the selected directory
 * @param {() => any} onclick called when the user clicked on the button
 */
export const DirectoryPicker = (
  {
    label: pickerLabel,
    name,
    onsuccess: callback
  }) =>
  div({ class: 'file has-name is-fullwidth' },
    label({ class: 'file-label' },
      button({
        onclick: () => window.showDirectoryPicker()
          .then(d => callback(d))
          .catch(e => {
            if (e instanceof DOMException && e.name === 'AbortError') {
              // The user aborted the directory picker.
              ;
            }
          })
      }),
      span({ class: 'file-cta' },
        span({ class: 'file-icon' },
          FontAwesome('upload')
        ),
        span({ class: 'file-label' }, pickerLabel)
      ),
      span({ class: 'file-name' }, name)
    )
  )

/**
 * A simple menu.
 *
 * @param {object} param0
 * @param {string} param0.label the menu label
 * @param {[any]} children the menu items
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
   *
   * @param {object} param0
   * @param {boolean} param0.isSelected if true, the item is shown as selected
   * @param {() => any} param0.onclick called when the item is clicked
   * @param {[any]} children the item children (usually a text node)
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

/**
 * An area to display notifications.
 */
export const NotificationArea = () => div({ class: 'block container' })

/**
 * A notification.
 *
 * @param {string} message the message to display
 * @param {string} label the button label
 * @param {() => any} onclick called when the button is clicked
 */
export const Notification = ({
  message,
  label: buttonLabel,
  onclick: callback
}) => {
  const removed = van.state(false)
  return () => removed.val
    ? null
    : div({ class: 'notification' },
      button({ class: 'delete', onclick: () => { removed.val = true } }),
      div({ class: 'level' },
        div({ class: 'level-left' },
          div({ class: 'level-item' }, p(message)),
          div({ class: 'level-item' },
            button({
              class: 'button is-primary',
              onclick: () => {
                callback()
                removed.val = true
              }
            }, buttonLabel)
          )
        )
      )
    )
}
