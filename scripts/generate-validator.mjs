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
import { resolve } from 'path'
import standard from 'standard'

const args = process.argv.slice(2)
const development = args.includes('--dev')
const watching = args.includes('--watch')

const SCHEMA = resolve(import.meta.dirname, '../resources/vcds.schema.json')
const VALIDATOR = resolve(import.meta.dirname, '../public/lib/generated-validator.js')

const generate = async (schemaPath, validatorPath, development) =>
  fs.readJson(schemaPath).then(schema => {
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
    const validate = ajv.compile(schema)

    const code = standaloneCode(ajv, validate)

    if (development) {
      console.log('> Generating validator')
      return standard.lintText(code, { fix: true })
        .then(res => fs.writeFile(validatorPath, res[0].output))
    } else {
      console.log('> Generating validator for development')
      return fs.writeFile(validatorPath, code)
    }
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
