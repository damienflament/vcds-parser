import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone'
import fs from 'fs-extra'
import * as path from 'path'

export default function () {
  const ajv = new Ajv({
    code: {
      source: true,
      esm: true,
      lines: true
    }
  })

  const schemas = {}

  return {
    name: 'ajv',
    resolveId (source, importer, options) {
      if (!source?.startsWith('ajv:')) return null

      const url = new URL(source)
      const { dir, name } = path.parse(url.pathname)

      const id = path.resolve(path.dirname(importer), dir, `${name}-validator.js`)
      schemas[id] = path.resolve(path.dirname(importer), url.pathname)

      return {
        id,
        resolvedBy: 'ajv'
      }
    },
    load (id) {
      if (!schemas[id]) return null

      const schema = fs.readJsonSync(schemas[id])
      const validation = ajv.compile(schema)
      const validationCode = standaloneCode(ajv, validation)

      return {
        code: validationCode,
        map: { mapping: '' }
      }
    }
  }
}
