/**
 * String utilities.
 * @module
 */

/**
 * Converts the given string from camelCase to dash-case.
 *
 * @param {string} string the string to convert
 * @returns the converted string
 */
const camelToDashCase = string =>
  string.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`)

export { camelToDashCase }
