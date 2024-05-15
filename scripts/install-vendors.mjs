/**
 * Install vendor libraries.
 *
 * The libraries are taken from the *node_modules* according to the list of
 * *SOURCES*. If the source is a path, the file is copied in the *DEST_DIR*
 * under the resulting basename. If the source is a tuple, the first element is
 * considered as the source path and the second one as a destination
 * subdirectory. The file is then copied in the *DEST_DIR* under that
 * subdirectory.
 */

import { copy, emptyDir } from 'fs-extra'
import { basename, join, resolve } from 'path'

const SRC_DIR = resolve(import.meta.dirname, '../node_modules')
const SOURCES = [
  'vanjs-core/src/van.debug.js',
  'vanjs-core/src/van.js',
  'bulma/css/bulma.min.css',
  ['@fortawesome/fontawesome-free/css/fontawesome.min.css', 'fontawesome/css/'],
  ['@fortawesome/fontawesome-free/css/solid.min.css', 'fontawesome/css/'],
  ['@fortawesome/fontawesome-free/css/brands.min.css', 'fontawesome/css/'],
  ['@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf', 'fontawesome/webfonts/'],
  ['@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2', 'fontawesome/webfonts/'],
  ['@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf', 'fontawesome/webfonts/'],
  ['@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2', 'fontawesome/webfonts/'],
  ['@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf', 'fontawesome/webfonts/'],
  ['@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2', 'fontawesome/webfonts/']
]
const DEST_DIR = resolve(import.meta.dirname, '../public/vendor/')

console.log(`> Installing vendor libraries to ${DEST_DIR}`)

emptyDir(DEST_DIR).then(() => {
  for (const source of SOURCES) {
    const [filepath, filename] =
    Array.isArray(source)
      ? [
          source[0],
          join(source[1], basename(source[0]))
        ]
      : [
          source,
          basename(source)
        ]

    const src = resolve(SRC_DIR, filepath)
    const dest = resolve(DEST_DIR, filename)

    console.log(`  - ${filename}`)
    copy(src, dest)
  }
})
