/**
 * VCDS report data validation.
 * @module
 */

import _validation from '../generated/validator.js'
import { typeOf } from './object.js'
import { stringify } from './string.js'

class ValidationError extends Error {
  name = 'ValidationError'

  constructor (errors) {
    super()

    const formattedErrors = errors
      .map(({ schemaPath, instancePath, message, data }) =>
`> ${instancePath} ${message}
  on ${typeOf(data)}:
${stringify(data, 2, 4)}
  (from schema ${schemaPath})
  `
      )
      .join('\n')

    this.message = `${errors[0].instancePath} ${errors[0].message}`
    this.stack = formattedErrors
  }
}

/**
 * Validates the given report data against the schema.
 *
 * @param {string} data
 * @return {boolean} true if the validation succeeds
 * @throws {ValidationError} when the validation fails
 */
const validate = data => {
  if (!_validation(data)) {
    throw new ValidationError(_validation.errors)
  }

  return true
}

export { ValidationError, validate }
