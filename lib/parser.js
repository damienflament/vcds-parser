/**
 * VCDS report parsing.
 * @module
 */

import { SyntaxError, parse as _parse } from 'peggy:../resources/vcds-grammar.pegjs'

/** Returns the given object frozen up to the innermost properties. */
const deeplyFrozen = o => {
  if (Array.isArray(o)) {
    for (let v of o) {
      v = deeplyFrozen(v)
    }

    return Object.freeze(o)
  }

  if (typeof o === 'object') {
    for (const k in o) {
      o[k] = deeplyFrozen(o[k])
    }

    return Object.freeze(o)
  }

  return o
}

class ParsingError extends Error {
  name = 'ParsingError'

  /**
   * @param {string} content
   * @param {SyntaxError} error
   */
  constructor (filename, content, cause) {
    super()

    this.message = cause.message
    this.stack = cause.format([{ source: filename, text: content }])
    this.cause = cause
  }
}

/**
 * Parses the given report content.
 *
 * @param {string} content
 * @returns {Promise<Report>} the built report
 * @throws {ParsingError} when Peggy throws an error on parsing
 */
const parse = (content, filename) => new Promise((resolve, reject) => {
  try {
    resolve(deeplyFrozen(_parse(content, { grammarSource: filename })))
  } catch (e) {
    if (e instanceof SyntaxError) {
      reject((new ParsingError(filename, content, e)))
    }

    throw e
  }
})

export { ParsingError, parse }
