/**
 * Reactive VanJS components styled with Bulma.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import bulma from './bulma.js'
import van from './van.js'

export * from './components/notification.js'
export * from './components/report.js'

const { div, i, label, span } = van.tags

const { Button, Buttons, File, FileCta, FileIcon, FileName, Icon, IconText, Tag, Tags } = bulma.elements

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
  File({ class: 'has-name is-fullwidth' },
    label(
      {
        class: 'file-label',
        onclick: () => window.showDirectoryPicker()
          .then(d => callback(d))
          .catch(e => {
            if (e instanceof DOMException && e.name === 'AbortError') {
              ; // The user aborted the directory picker.
            } else {
              throw e
            }
          })
      },
      FileCta(
        FileIcon(FontAwesome('folder-open')),
        span({ class: 'file-label' }, pickerLabel)
      ),
      FileName(name)
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

  return Tags({ class: 'has-addons' },
    Tag(...children),
    Tag({ class: props.class })
  )
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
}) => Buttons({ class: 'has-addons' },
  Button(
    {
      class: () => van.val(isLeftSelected) ? 'is-selected is-primary' : '',
      onclick: onclickLeft
    }, left),

  Button(
    {
      class: () => van.val(isLeftSelected) ? '' : 'is-selected is-primary',
      onclick: onclickRight
    },
    right)
)

/**
 * A spoiler.
 *
 * Hides its content. Has an arrow to show it.
 *
 * @param  {...any} children the spoiler children
 * @returns {HTMLElement}
 */
const Spoiler = (...children) => {
  const isClosed = van.state(true)

  return div(
    div({ class: 'is-flex is-justify-content-end mb-2' },
      IconText(
        {
          class: 'is-flex-direction-row-reverse is-clickable',
          onclick: () => { isClosed.val = !isClosed.val }
        },
        Icon(() => FontAwesome(isClosed.val ? 'angle-down' : 'angle-up')),
        span(() => isClosed.val ? 'Show more...' : 'Show less...')
      )
    ),
    div({ class: () => isClosed.val ? 'is-sr-only' : '' },
      ...children
    )
  )
}

export { DirectoryPicker, DualButton, FontAwesome, Spoiler, StatusTag }
