/**
 * Notification components.
 * @module
 */

import bulma from '../bulma.js'
import van from '../van.js'

const { div, p } = van.tags
const { Button, Content, Delete, Notification } = bulma.elements

/**
 * An area to display notifications.
 *
 * @returns {HTMLElement}
 */
const NotificationArea = () => div({ class: 'block container' })

/**
 * A notification.
 *
 * @param {object} props
 * @param {string} props.message the message to display
 * @param {string} props.label the button label
 * @param {() => any} props.onclick called when the button is clicked
 * @returns {HTMLElement}
 */
const NotificationComponent = (
  {
    message,
    label: buttonLabel,
    onclick: callback
  }) => {
  const removed = van.state(false)

  return () => removed.val
    ? null
    : Notification(
      Delete({ onclick: () => { removed.val = true } }),
      Content({ class: 'is-flex is-align-items-baseline' },
        p(message),
        Button({
          class: 'is-primary mx-3',
          onclick: () => {
            callback()
            removed.val = true
          }
        }, buttonLabel)
      )
    )
}

export { NotificationComponent as Notification, NotificationArea }
