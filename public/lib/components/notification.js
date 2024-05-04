/**
 * Notification components.
 * @module
 */

import bulma from '../bulma.js'
import van from '../van.js'

const { div, p } = van.tags
const { Button, Delete, Level, LevelLeft, LevelItem, Notification } = bulma.elements

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
      Level(
        LevelLeft(
          LevelItem(p(message)),
          LevelItem(
            Button({
              class: 'is-primary',
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

export { NotificationComponent as Notification, NotificationArea }
