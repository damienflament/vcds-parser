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
import fs from 'fs-extra'
import { watch } from 'fs/promises'
import { dirname, resolve } from 'path'
import standard from 'standard'

const args = process.argv.slice(2)
const development = args.includes('--dev')
const watching = args.includes('--watch')

const SCHEMA = resolve(import.meta.dirname, '../resources/vcds.schema.json')
const VALIDATOR = resolve(import.meta.dirname, '../public/generated/validator.js')

const generate = async (schemaPath, validatorPath, development) =>
  fs.readJson(schemaPath)
    .then(schema => {
      const ajv = new Ajv({
        strict: true,
        code: {
          source: true,
          esm: true,
          lines: development,
          optimize: development ? 0 : 1
        }
      })

      console.log('> Compiling schema')

      const validator = ajv.compile(schema)
      return standaloneCode(ajv, validator)
    })
    .then(code => {
      if (development) {
        console.log('> Formatting validator for development')

        return standard.lintText(code, { fix: true })
          .then(res => res[0].output)
      } else {
        return code
      }
    })
    .then(code => {
      console.log('> Generating validator')

      return fs.ensureDir(dirname(validatorPath))
        .then(() => fs.writeFile(validatorPath, code))
    })
    .then(() => {
      console.log('> Bundling validator for browser')
    })

await generate(SCHEMA, VALIDATOR, development)

if (watching) {
  console.log('> Watching for changes on schema')

  const watcher = watch(SCHEMA)

  for await (const ev of watcher) {
    console.log(`  Changes occur on schema ${ev.filename}`)

    generate(SCHEMA, VALIDATOR, development)
  }
}
