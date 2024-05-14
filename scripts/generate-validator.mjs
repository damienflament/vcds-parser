/**
 * Generates the data validator.
 *
 * The validator is generated from the JSON schema. Its code and the
 * dependencies are bundled to be loaded as a single module by the browser.
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
        allErrors: true,
        verbose: true,
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

      esbuild.build({
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
    .catch(e => { console.error(e) })

await generate(SCHEMA, VALIDATOR)

if (watching) {
  console.log('> Watching for changes on schema')

  const watcher = watch(SCHEMA)

  for await (const ev of watcher) {
    console.log(`! Change occurs on schema ${ev.filename}`)

    await generate(SCHEMA, VALIDATOR)
  }
}
