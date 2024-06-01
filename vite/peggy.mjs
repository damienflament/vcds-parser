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

      const { path: grammarPath, pathname: grammarSource } = grammars[id]

      this.addWatchFile(grammarPath)

      const src = fs.readFileSync(grammarPath).toString()

      try {
        const parserSourceNode = peggy.generate(
          src,
          {
            grammarSource,
            output: 'source-and-map',
            format: 'es'
          }
        )

        const { code, map } = parserSourceNode.toStringWithSourceMap()

        return {
          code,
          map: map.toJSON()
        }
      } catch (e) {
        if (e instanceof peggy.parser.SyntaxError) {
          e.message = e.format([{ source: grammarSource, text: src }])
        }

        throw e
      }
    }
  }
}
