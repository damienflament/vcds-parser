/**
 * Reactive VanJS components styled with Bulma.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import van from './van.js'

const { a, aside, button, div, i, img, label, li, p, span, ul } = van.tags

/** A responsive horizontal navigation bar. */
export const Navbar = ({ logo: { src: logoSrc, alt: logoAlt } }) =>
  div({ class: 'navbar' },
    div({ class: 'navbar-brand' },
      div({ class: 'navbar-item' },
        img({ src: logoSrc, alt: logoAlt })
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
 * @param {state<FileSystemDirectoryHandle>} directoryState the state to update with the picked directory
 * @param {string} directoryName the name of the selected directory
 */
export const DirectoryPicker = (
  {
    label: pickerLabel,
    directoryState: directory,
    directoryName: name
  }) =>
  div({ class: 'file has-name is-fullwidth' },
    label({ class: 'file-label' },
      button({
        onclick: async () => {
          try {
            directory.val = await window.showDirectoryPicker()
          } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') {
              // The user aborted the directory picker.
              ;
            }
          }
        }
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
 * @param {string} label the menu label
 * @param {[state<any>]} itemsState the items
 * @param {(any) => any} formatter a formatting function to apply on each item
 */
export const Menu = (
  {
    label: menuLabel,
    itemsState: items,
    formatter = (i) => i
  }) =>
  aside({ class: 'menu' },
    p({ class: 'menu-label' }, menuLabel),
    () => ul({ class: 'menu-list' }, items.val.map(i => li(a(formatter(i)))))
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
 * @param {() => any} action the button callback
 */
export const Notification = ({ message, label, action }) =>
  div({ class: 'notification' },
    button({
      class: 'delete',
      onclick: ev => ev.target.closest('div.notification').remove()
    }),
    div({ class: 'level' },
      div({ class: 'level-left' },
        div({ class: 'level-item' }, p(message)),
        div({ class: 'level-item' },
          button({
            class: 'button is-primary',
            onclick: (ev) => {
              action()
              ev.target.closest('div.notification').remove()
            }
          }, label)
        )
      )
    )
  )
