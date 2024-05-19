/**
 * VCDS report data validation.
 * @module
 */

import validation from 'ajv:../resources/vcds-schema.json'
import { inspect } from 'string-kit'

const ___ = '.'.repeat(80)

class ValidationError extends Error {
  name = 'ValidationError'

  constructor (errors) {
    super()

    const formattedErrors = errors
      .map(({ schemaPath, instancePath, message, data }) =>
`[!] ${instancePath} ${message}
    but got:
${inspect(data)}
  (from schema ${schemaPath})`
      )
      .join('\n\n' + ___ + '\n\n')

    this.message = `${errors[0].instancePath} ${errors[0].message}`
    this.stack = formattedErrors
  }
}

/**
 * Validates the given report data against the schema.
 *
 * @param {string} data
 * @throws {ValidationError} when the validation fails
 */
const validate = data => {
  if (!validation(data)) {
    throw new ValidationError(validation.errors)
  }
}

export { ValidationError, validate }
