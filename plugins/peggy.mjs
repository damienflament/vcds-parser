import fs from 'fs-extra'
import * as path from 'path'
import peggy from 'peggy'

export default function () {
  const grammars = {}

  return {
    name: 'peggy',
    resolveId (source, importer, options) {
      if (!source?.startsWith('peggy:')) return null

      const url = new URL(source)
      const { dir, name } = path.parse(url.pathname)

      const id = path.resolve(path.dirname(importer), dir, `${name}-parser.js`)
      grammars[id] = path.resolve(path.dirname(importer), url.pathname)

      return {
        id,
        resolvedBy: 'peggy'
      }
    },
    async load (id) {
      if (!grammars[id]) return null

      const src = fs.readFileSync(grammars[id]).toString()
      const parserCode = peggy.generate(
        src,
        {
          grammarSource: id,
          output: 'source',
          format: 'es'
        }
      )

      return {
        code: parserCode,
        map: { mapping: '' }
      }
    }
  }
}
