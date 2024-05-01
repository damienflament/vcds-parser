import van from '../vendor/van-1.5.0.debug.js'

/**
 * Ensures the given value is allowed as a property value.
 *
 * If the value is a State, its actual value is returned. If it is a function,
 * its returned value is returned. If it is undefined, null is returned.
 * Otherwize, the untouched value is returned.
 *
 * @param {any} v the value work on
 * @returns the treated value
 */
van.val = (v) => {
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
 * @returns the treated handler
 */
van.handler = (h) => h === undefined ? null : h

/**
 * Ensures the given value is allowed by VanJS as a *class* property value.
 *
 * If the value is an array, it is flattened, its elements are trimmed and the
 * whole is joined. Otherwize, it is treated by {@link van.val}.
 *
 * @param {any} c the class property value to work on
 * @returns the treated class property value
 */
van.class = (c) =>
  Array.isArray(c)
    ? c.flat(Infinity)
      .filter(v => v?.trim())
      .join(' ')
    : van.val(c)

/**
 * Ensures the first argument is an object containing properties.
 *
 * If the first argument is not a object for properties, an empty object is
 * created. Otherwize, the property *class* is treated with the
 * {@link van.class} function.
 *
 * @param  {...any} args the arguments to parse
 * @returns the properties and children
 */
van.args = (...args) => {
  const objProto = Object.getPrototypeOf({ isConnected: 1 })
  const firstProto = Object.getPrototypeOf(args[0] ?? 0)

  const props = firstProto === objProto ? args.shift() : {}

  if (Object.hasOwn(props, 'class')) {
    props.class = van.class(props.class)
  }

  return [props, ...args]
}

export default van
