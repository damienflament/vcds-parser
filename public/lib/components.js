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
 * @param {string} directoryName the name of the selected directory
 * @param {() => any} onclick called when the user clicked on the button
 */
export const DirectoryPicker = (
  {
    label: pickerLabel,
    directoryName: name,
    onclick: callback
  }) =>
  div({ class: 'file has-name is-fullwidth' },
    label({ class: 'file-label' },
      button({ onclick: () => callback() }),
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
 * @param {string} label the menu label
 * @param {[state<any>]} itemsState the items
 * @param {(any) => any} formatter called to get the label for the given item
 * @param {(any) => any} onclick called with the given item when clicked
 * @param {(any) => boolean} isSelected called to check if the given item is selected
 */
export const Menu = (
  {
    label: menuLabel,
    itemsState: items,
    formatter,
    onclick: callback,
    isSelected
  }) =>
  aside({ class: 'menu block' },
    p({ class: 'menu-label' }, menuLabel),
    () => ul({ class: 'menu-list' }, items.val.map(i =>
      li(a(
        {
          class: isSelected(i) ? 'is-active' : '',
          onclick: () => callback(i)
        }, formatter(i)))
    ))
  )

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
  const n = div({ class: 'notification' },
    button({ class: 'delete', onclick: () => { n.remove() } }),
    div({ class: 'level' },
      div({ class: 'level-left' },
        div({ class: 'level-item' }, p(message)),
        div({ class: 'level-item' },
          button({
            class: 'button is-primary',
            onclick: () => {
              callback()
              n.remove()
            }
          }, buttonLabel)
        )
      )
    )
  )

  return n
}
