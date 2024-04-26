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

export function camelToDashCase (string) {
  return string.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`)
}
