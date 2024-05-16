/**
 * String utilities.
 * @module
 */

/**
 * Converts the given string from camelCase to dash-case.
 * @param {string} string
 * @returns {string} the converted string
 */
const camelToDashCase = string =>
  string.replace(
    /[A-Z]/g,
    (match, offset) =>
      (offset > 0 ? '-' : '') + match.toLowerCase()
  )

/**
   * Represents the given data as a string.
   * @param {any} data
   * @returns {string}
  */
const stringify = (data, indent = 2, initialIndent = 0) => {
  let str = JSON.stringify(data, null, indent) ?? data.toString()

  if (initialIndent > 0) {
    str = str.split('\n')
      .map(line => ' '.repeat(initialIndent) + line)
      .join('\n')
  }

  return str
}

export { camelToDashCase, stringify }
