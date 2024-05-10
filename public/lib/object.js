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

export { typeOf }
