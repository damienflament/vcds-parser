import fs from 'fs-extra'
import peggy from 'peggy'
import * as common from './common.mjs'

export default function () {
  const grammars = {}

  return {
    name: 'peggy',
    resolveId: (source, importer, options) =>
      common.resolveId('peggy', 'parser', grammars, source, importer, options),
    load (id) {
      if (!grammars[id]) return null

      this.addWatchFile(grammars[id])

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
