/**
 * Object utilities.
 * @module
 */

/**
 * Extracts the type name from the string representation of the given value.
 * @see https://www.freecodecamp.org/news/javascript-typeof-how-to-check-the-type-of-a-variable-or-object-in-js/
 * @param {any} value
 * @returns {string}
 */
const reprType = value => {
  const repr = Object.prototype.toString.call(value)

  const type = repr.substring(
    repr.indexOf(' ') + 1,
    repr.indexOf(']'))

  return type
}

/**
 * Gives the type name of the given value.
 * @param {any} value
 * @returns {string}
 */
const typeOf = value => {
  const type = reprType(value)

  switch (type) {
    case 'Undefined':
    case 'Null':
      return type.toLowerCase()
    case 'Number':
      return Number.isNaN(value)
        ? 'NaN'
        : Number.isInteger(value)
          ? 'integer'
          : 'Number'
    default:
      return type
  }
}

/** Returns the given object sealed */
const sealed = Object.seal

/** Returns the given object frozen. */
const frozen = Object.freeze

/** Returns the given object frozen up to the innermost properties. */
const deeplyFrozen = o => {
  if (Array.isArray(o)) {
    for (let v of o) {
      v = deeplyFrozen(v)
    }

    return frozen(o)
  }

  if (typeof o === 'object') {
    for (const k in o) {
      o[k] = deeplyFrozen(o[k])
    }

    return frozen(o)
  }

  return o
}

export { deeplyFrozen, frozen, sealed, typeOf }
