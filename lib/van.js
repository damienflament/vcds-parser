/**
 * A modified VanJS.
 * @module
 */

import van from 'vanjs-core'
import { configureFromUrl } from './configuration.js'

const sealed = Object.seal

const config = sealed({ debug: false })
configureFromUrl(config, window.location.href)

/**
 * Ensures the given value is allowed as a property value.
 *
 * If the value is a State, its actual value is returned. If it is a function,
 * its returned value is returned. If it is undefined, null is returned.
 * Otherwize, the untouched value is returned.
 *
 * @param {any} v the value work on
 * @returns {any} the treated value
 */
const val = v => {
  const stateProto = Object.getPrototypeOf(van.state())
  const protoOfV = Object.getPrototypeOf(v ?? 0)

  return protoOfV === stateProto
    ? v.val
    : protoOfV === Function.prototype
      ? v()
      : v === undefined
        ? null
        : v
}

/**
 * Ensures the given handler is allower as an *on...* event handler.
 *
 * If the return value is undefined, null is returned. Otherwize, the untouched
 * value is returned.
 *
 * @param {() => any} h the handler to work on
 * @returns {any} the treated handler
 */
const handler = h => h === undefined ? null : h

/**
 * Ensures the given values are allowed by VanJS as a single *class* property
 * value.
 *
 * The given values are treated by {@link val} then filtered and joined.
 *
 * @param {...any} classes the class property values to work on
 * @returns {string} the treated class property value
 */
const classes = (...classes) => classes.map(v => val(v))
  .filter(v => v?.trim())
  .join(' ')

/**
 * Handles the components parameters.
 *
 * If the first argument is not a properties object, an empty object is created.
 * Otherwize, the property *class* is treated with the {@link van.class}
 * function.
 *
 * An array whose the first element is the properties object and the second the
 * children is returned.
 *
 * @example
 *
 * import van from './van.js'
 *
 * const { div } = van.tags
 *
 * const MyComponent = (...args) => {
 *   const [props, children] = van.args(args)
 *
 *   return div({ class: props.class }, ...children)
 * }
 *
 * @param  {[any]} args the arguments to parse
 * @returns {[any]} the properties and children
 */
const args = args => {
  const children = [...args] // Working on a copy because we will use shift()
  const objProto = Object.getPrototypeOf({ isConnected: 1 })
  const firstProto = Object.getPrototypeOf(children[0] ?? 0)

  const props = firstProto === objProto ? children.shift() : {}

  return [props, children]
}

/**
 * Logs to the console the given state on change.
 *
 * If provided, the label is prepended to the value.
 *
 * @param {State} s the state to log
 * @param {string?} l the label to display
 * @returns
 */
const log = (s, l = null) => van.derive(() => console.log(l ? `${l}:` : '', s.val))

export default { val, handler, classes, args, log, ...van }
