import * as path from 'path'

const resolveId = (prefix, suffix, sources, source, importer) => {
  if (!source?.startsWith(`${prefix}:`)) return null

  const url = new URL(source)
  const { dir, name } = path.parse(url.pathname)

  const id = 'virtual:' + path.join('/', dir, `${name}-${suffix}.js`)
  sources[id] = {
    path: path.resolve(path.dirname(importer), url.pathname),
    pathname: path.resolve('/', url.pathname)
  }

  return {
    id,
    resolvedBy: prefix
  }
}

export { resolveId }
