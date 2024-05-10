/**
 * VCDS report data validation.
 * @module
 */

import _validation from '../generated/validator.js'

class ValidationError extends Error {
  name = 'ValidationError'

  constructor (errors) {
    super()

    const formattedErrors = errors
      .map(({ schemaPath, instancePath, message }) =>
`from schema ${schemaPath}:
  ${instancePath} ${message}`
      )

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
