/**
 * Notification components.
 * @module
 */

import van from '../van.js'

const { button, div, p } = van.tags

/**
 * An area to display notifications.
 *
 * @returns HTMLElement
 */
const NotificationArea = () => div({ class: 'block container' })

/**
 * A notification.
 *
 * @param {object} props
 * @param {string} props.message the message to display
 * @param {string} props.label the button label
 * @param {() => any} props.onclick called when the button is clicked
 * @returns HTMLElement
 */
const Notification = (
  {
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

export { Notification, NotificationArea }
