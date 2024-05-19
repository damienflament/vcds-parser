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
  constructor (content, cause) {
    super()

    this.message = cause.message
    this.stack = describeErrorContext(content, cause)
    this.cause = cause
  }
}

const showControlCharacters = string =>
  string.replaceAll('\r', '␍')
    .replaceAll('\n', '␊\n')
    .replaceAll(' ', '␣')

const ___ = '.'.repeat(80)

/**
 * Describes the context of the given syntax error.
 *
 * @param {string} content the parsed content
 * @param {SyntaxError} error the error to build context from
 * @returns {string} the context description
 */
const describeErrorContext = (content, error) => {
  const { location } = error
  const size = 100

  const startLine = location.start.line
  const startCol = location.start.column
  const endLine = location.end.line
  const endCol = location.end.column
  const length = location.end.offset - location.start.offset
  const displayStart = content.indexOf('\n', location.start.offset - size) + 1
  const lineEnd = content.indexOf('\n', location.end.offset)
  const displayEnd = content.indexOf('\n', lineEnd + size)

  const contextBefore = content.substring(displayStart, lineEnd)
  const contextAfter = content.substring(lineEnd + 1, displayEnd)
  const finger = ' '.repeat(startCol - 1) + '👆'.repeat(length)

  return `from line ${startLine} column ${startCol}
  to line ${endLine} column ${endCol}

  Context:
${___}
${contextBefore}
${finger}
${contextAfter}
${___}
${showControlCharacters(contextBefore)}␊
${finger}
${showControlCharacters(contextAfter)}␊
${___}`
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
    resolve(deeplyFrozen(_parse(content, { filename })))
  } catch (e) {
    if (e instanceof SyntaxError) {
      reject((new ParsingError(content, e)))
    }

    throw e
  }
})

export { ParsingError, parse }
