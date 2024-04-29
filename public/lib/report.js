import { parse as peggyParse } from './parser.js'

export { SyntaxError } from './parser.js'

/**
 * Describes the context of the given syntax error.
 *
 * @param {string} content the parsed content
 * @param {peggy.SyntaxError} error the error to build context from
 * @returns {string} the context description
 */
function describeErrorContext (content, error) {
  const size = 100

  const startLine = error.location.start.line
  const startCol = error.location.start.column
  const endLine = error.location.end.line
  const endCol = error.location.end.column
  const length = error.location.end.offset - error.location.start.offset
  const displayStart = error.location.start.offset - size
  const lineEnd = content.indexOf('\n', error.location.end.offset)
  const displayEnd = content.indexOf('\n', lineEnd + size)

  let message = `
  from line ${startLine} column ${startCol}
    to line ${endLine} column ${endCol}

  Context:
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯` + '\n'

  if (displayStart > 0) { message += '[...]' }

  message += content.substring(displayStart, lineEnd) + '\n' +
  ' '.repeat(startCol - 1) +
  '👆'.repeat(length)

  message += '\n' + content.substring(lineEnd + 1, displayEnd) + `
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`

  return message
}

/**
 * Builds a data structure by parsing the given report content.
 *
 * @param {string} content the report content
 * @returns {object} the built data structure
 */
export function buildFromContent (content) {
  try {
    return peggyParse(content)
  } catch (e) {
    if (e instanceof SyntaxError) {
      e.message += describeErrorContext(content, e)
    }

    throw e
  }
}
