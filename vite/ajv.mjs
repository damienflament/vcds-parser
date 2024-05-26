import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone'
import fs from 'fs-extra'
import * as common from './common.mjs'

export default function () {
  const schemas = {}

  return {
    name: 'ajv',
    resolveId: (source, importer, options) =>
      common.resolveId('ajv', 'validator', schemas, source, importer, options),
    load (id) {
      if (!schemas[id]) return null

      const { path: schemaPath } = schemas[id]

      this.addWatchFile(schemaPath)

      const schema = fs.readJsonSync(schemaPath)

      const ajv = new Ajv({
        strict: true,
        allErrors: true,
        verbose: true,
        code: {
          esm: true,
          lines: true,
          source: true
        }
      })
      const validation = ajv.compile(schema)
      const validationCode = standaloneCode(ajv, validation)

      return {
        code: validationCode,
        map: { mapping: '' }
      }
    }
  }
}
