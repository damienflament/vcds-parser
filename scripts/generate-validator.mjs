/**
 * Generates a data validator and a TypeScript declaration file from the JSON
 * schema.
 */

'use strict'

import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone/index.js'
import * as esbuild from 'esbuild'
import fs from 'fs-extra'
import { watch } from 'fs/promises'
import { compile as compileDefinition } from 'json-schema-to-typescript-lite'
import { basename, dirname, resolve } from 'path'

const args = process.argv.slice(2)
const types = args.includes('--types')
const watching = args.includes('--watch')

const SCHEMA = resolve(import.meta.dirname, '../resources/vcds.schema.json')
const VALIDATOR = resolve(import.meta.dirname, '../public/generated/validator.js')
const DEFINITION = resolve(import.meta.dirname, '../public/lib/model.d.ts')

const generate = async (schemaPath, validatorPath) =>
  fs.readJson(schemaPath)
    .then(schema => {
      if (types) {
        console.log('> Generating types definition file')

        compileDefinition(schema)
          .then(code => fs.writeFile(DEFINITION, code))
          .catch(e => { console.error(e) })
      }

      return schema
    })
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
    console.log(`  Changes occur on schema ${ev.filename}`)

    generate(SCHEMA, VALIDATOR)
  }
}
