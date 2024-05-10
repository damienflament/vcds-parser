/**
 * VCDS reports parser.
 * @module
 */

import { SyntaxError, parse as _parse } from './generated-parser.js'
import { validate } from './generated-validator.js'

const showControlCharacters = string =>
  string.replaceAll('\r', '␍')
    .replaceAll('\n', '␊\n')
    .replaceAll(' ', '␣')

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
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
${contextBefore}
${finger}
${contextAfter}
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
${showControlCharacters(contextBefore)}␊
${finger}
${showControlCharacters(contextAfter)}␊
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`
}

/**
 * Parse the given report content.
 *
 * @param {string} content the report content
 * @returns {import('./report.js').Report} the built report
 * @throws {SyntaxError} when Peggy throws an error on parsing
 */
const parse = content => {
  try {
    const data = _parse(content)

    if (validate(data)) {
      console.log('Data validated')
    } else {
      console.log('Failed to validate data')
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      e.stack = describeErrorContext(content, e)
    }

    throw e
  }
}

export { SyntaxError } from './generated-parser.js'
export { parse }
