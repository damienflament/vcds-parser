/**
 * Configures the application.
 *
 * The manifest file is updated from the package description.
 * The application configuration file is also updated, including the generated
 * static resources list.
 */

'use strict'

import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone/index.js'
import * as esbuild from 'esbuild'
import fs from 'fs-extra'
import { watch } from 'fs/promises'
import { basename, dirname, resolve } from 'path'

const args = process.argv.slice(2)
const watching = args.includes('--watch')

const SCHEMA = resolve(import.meta.dirname, '../resources/vcds.schema.json')
const VALIDATOR = resolve(import.meta.dirname, '../public/generated/validator.js')

const generate = async (schemaPath, validatorPath) =>
  fs.readJson(schemaPath)
    .then(schema => {
      const ajv = new Ajv({
        strict: true,
        code: {
          source: true
        }
      })

      console.log('> Compiling schema')

      const validator = ajv.compile(schema)
      return standaloneCode(ajv, validator)
    })
    .then(code => {
      console.log('> Bundling validator for browser')
      return esbuild.build({
        stdin: {
          contents: code,
          resolveDir: dirname(validatorPath),
          sourcefile: basename(validatorPath),
          loader: 'js'
        },
        bundle: true,
        format: 'esm',
        outfile: validatorPath,
        allowOverwrite: true
      })
    })
    .then(() => {
      console.log('  done.')
    })

await generate(SCHEMA, VALIDATOR)

if (watching) {
  console.log('> Watching for changes on schema')

  const watcher = watch(SCHEMA)

  for await (const ev of watcher) {
    console.log(`  Changes occur on schema ${ev.filename}`)

    generate(SCHEMA, VALIDATOR)
  }
}
