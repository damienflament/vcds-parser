/**
 * Reactive VanJS components styled with Bulma.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import van from './van.js'

export * from './components/column.js'
export * from './components/menu.js'
export * from './components/notification.js'

const { button, div, i, img, label, span } = van.tags

/**
 * A responsive horizontal navigation bar.
 *
 * @param {object} config
 * @param {object} config.logo
 * @param {string} config.logo.src the logo path
 * @param {string} config.logo.alt the logo alternative description
 */
export const Navbar = ({ logo: { src, alt } }) =>
  div({ class: 'navbar' },
    div({ class: 'navbar-brand' },
      div({ class: 'navbar-item' },
        img({ src, alt })
      )
    )
  )

/**
 * A simple container to divide your page into sections.
 *
 * @param {[any]} content then content wrapped by the container
 */
export const Section = (...content) => div({ class: 'section' }, content)

/**
 * A Font Awesome icon.
 *
 * @param {string} name the name of the icon in the Font Awesome library
 */
export const FontAwesome = name => i({ class: `fa-solid fa-${name}` })

/**
 * A directory upload input using Javascript.
 *
 * @param {object} config
 * @param {string} config.label the input label
 * @param {string} config.name the name of the selected directory
 * @param {(FileSystemDirectoryHandle) => any} config.onsuccess called when a directory has been selected by the user
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
          FontAwesome('folder-open')
        ),
        span({ class: 'file-label' }, pickerLabel)
      ),
      span({ class: 'file-name' }, name)
    )
  )

/**
 * A double tag to display a label on the left with a colored tag on the right.
 *
 * @param {object} config
 * @param {string} config.class the status tag class
 * @param  {...any} children the label tag children
 */
export const StatusTag = ({ class: cls }, ...children) =>
  div({ class: 'tags has-addons' },
    span({ class: 'tag' }, children),
    span({ class: `tag ${cls}` })
  )

/**
 * Two attached buttons.
 *
 * The left one is selected on load.
 *
 * @param {object} config
 * @param {string} config.class the buttons container class
 * @param {any} config.left the children of the left button
 * @param {any} config.right the children of the right button
 * @param {() => any} config.onclickRight called when the right button is clicked
 * @param {() => any} config.onclickLeft called when the left button is clicked
 */
export const DualButton = ({
  class: cls,
  left,
  right,
  onclickLeft,
  onclickRight
}) => {
  const isLeftSelected = van.state(true)

  return div({ class: `buttons has-addons ${cls}` },
    button(
      {
        class: () => `button ${isLeftSelected.val ? 'is-selected is-primary' : ''}`,
        onclick: () => { onclickLeft(); (isLeftSelected.val = true) }
      },
      left),
    button(
      {
        class: () => `button ${isLeftSelected.val ? '' : 'is-selected is-primary'}`,
        onclick: () => { onclickRight(); (isLeftSelected.val = false) }
      },
      right)
  )
}
