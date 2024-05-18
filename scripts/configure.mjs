/**
 * Configures the application.
 *
 * The manifest file is updated from the package description.
 * The application configuration file is also updated, including the generated
 * static resources list.
 */

import fs from 'fs-extra'
import { resolve } from 'path'
import standard from 'standard'

const PACKAGE = resolve(import.meta.dirname, '../package.json')
// const PUBLIC = resolve(import.meta.dirname, '../public/')
const MANIFEST = resolve(import.meta.dirname, '../public/vcds-parser.webmanifest')
const CONFIG = resolve(import.meta.dirname, '../config.js')

const jsonOptions = { spaces: 2 }

fs.readJson(PACKAGE).then(info => {
  fs.readJson(MANIFEST).then(manifest => {
    console.log('> Updating manifest')

    manifest.description = info.description

    return fs.writeJson(MANIFEST, manifest, jsonOptions)
  })

  console.log('> Generating config')

  const config = {
    version: info.version,
    cacheName: info.name + '-' + info.version
    // staticResources: klawSync(PUBLIC, { nodir: true })
    //   .map(({ path }) => '/' + relative(PUBLIC, path))
    //   .concat(['/'])
  }

  // Configuration file is indented by JSON then linted by Standard.
  return standard.lintText(
    'export default ' + JSON.stringify(config, (_, v) => v, jsonOptions.spaces)
    , { fix: true }
  )
    .then(res => fs.writeFile(CONFIG, res[0].output))
})
