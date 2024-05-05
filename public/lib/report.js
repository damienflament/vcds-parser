/**
 * VCDS reports related function.
 * @module
 */

import { SyntaxError, parse } from './parser.js'

export { SyntaxError } from './parser.js'

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
  const size = 100

  const startLine = error.location.start.line
  const startCol = error.location.start.column
  const endLine = error.location.end.line
  const endCol = error.location.end.column
  const length = error.location.end.offset - error.location.start.offset
  const displayStart = content.indexOf('\n', error.location.start.offset - size) + 1
  const lineEnd = content.indexOf('\n', error.location.end.offset)
  const displayEnd = content.indexOf('\n', lineEnd + size)

  const contextBefore = content.substring(displayStart, lineEnd)
  const contextAfter = content.substring(lineEnd + 1, displayEnd)
  const finger = ' '.repeat(startCol - 1) + '👆'.repeat(length)

  return `
  from line ${startLine} column ${startCol}
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
 * Builds a data structure by parsing the given report content.
 *
 * @param {string} content the report content
 * @returns {object} the built data structure
 * @throws {SyntaxError} when Peggy throws an error on parsing
 */
const buildFromContent = content => {
  try {
    return parse(content)
  } catch (e) {
    if (e instanceof SyntaxError) {
      e.stack = describeErrorContext(content, e)
    }

    throw e
  }
}

export { buildFromContent }
