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
export * from './components/report.js'

const { button, div, i, img, label, span } = van.tags

/**
 * A responsive horizontal navigation bar.
 *
 * @param {object} [props]
 * @param {object} props.logo
 * @param {string} props.logo.src the logo path
 * @param {string} props.logo.alt the logo alternative description
 * @returns {HTMLElement}
 */
const Navbar = ({ logo: { src, alt } }) =>
  div({ class: 'navbar' },
    div({ class: 'navbar-brand' },
      div({ class: 'navbar-item' },
        img({
          src: van.val(src),
          alt: van.val(alt)
        })
      )
    )
  )

/**
 * A simple container to divide your page into sections.
 *
 * @param {...any} children the content wrapped by the container
 * @returns {HTMLElement}
 */
const Section = (...content) => div({ class: 'section' }, ...content)

/**
 * An horizontal level.
 *
 * @param {object} props
 * @param {[any]|any} props.left the children on the left side
 * @param {[any]|any} props.right the children on the right side
 * @returns {HTMLElement}
 */
const Level = (
  {
    left = [],
    right = []
  }) =>
  div({ class: 'level' },
    div({ class: 'level-left' },
      Array.of(left)
        .flat()
        .map(ch => div({ class: 'level-item' }, ch))
    ),
    div({ class: 'level-right' },
      Array.of(right)
        .flat()
        .map(ch => div({ class: 'level-item' }, ch))
    )
  )

/**
 * A Font Awesome icon.
 *
 * @param {string} name the name of the icon in the Font Awesome library
 * @returns {HTMLElement}
 */
const FontAwesome = name => i({ class: `fa-solid fa-${van.val(name)}` })

/**
 * A directory upload input using Javascript.
 *
 * @param {object} props
 * @param {string} props.label the input label
 * @param {string} props.name the name of the selected directory
 * @param {(FileSystemDirectoryHandle) => any} props.onsuccess called when a directory has been selected by the user
 * @returns {HTMLElement}
 */
const DirectoryPicker = (
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
 * @param {object} [props]
 * @param {string} props.class the status tag class
 * @param  {...any} children the label tag children
 * @returns {HTMLElement}
 */
const StatusTag = (...args) => {
  const [props, children] = van.args(args)

  return div({ class: 'tags has-addons' },
    span({ class: 'tag' }, ...children),
    span({ class: van.classes('tag', props.class) })
  )
}

const Tag = (...args) => {
  const [props, children] = van.args(args)

  return div({ class: van.classes('tag', props.class) }, ...children)
}

/**
 * Two attached buttons.
 *
 * The left one is selected on load.
 *
 * @param {object} props
 * @param {string} props.class the buttons container class
 * @param {any} props.left the children of the left button
 * @param {any} props.right the children of the right button
 * @param {() => any} props.onclickRight called when the right button is clicked
 * @param {() => any} props.onclickLeft called when the left button is clicked
 * @param {boolean} props.isLeftSelected true if the left button is selected, false otherwize
 * @returns {HTMLElement}
 */
const DualButton = ({
  left,
  right,
  onclickLeft,
  onclickRight,
  isLeftSelected
}) => {
  return div({ class: van.classes('buttons has-addons') },
    button(
      {
        class: () => van.classes('button', van.val(isLeftSelected) ? 'is-selected is-primary' : ''),
        onclick: onclickLeft
      },
      left),
    button(
      {
        class: () => van.classes('button', van.val(isLeftSelected) ? '' : 'is-selected is-primary'),
        onclick: onclickRight
      },
      right)
  )
}

export { DirectoryPicker, DualButton, FontAwesome, Level, Navbar, Section, StatusTag, Tag }
