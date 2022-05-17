const { writeFileSync } = require('fs')
const { componentsList } = require('./get-component-list')
const render = require('json-templater/string')
const { resolve } = require('path')
const { EOL } = require('os')

const COMPONENTS_OUTPUT_PATH = resolve(
  __dirname,
  './../package/components/index.ts',
)

const COMPONENTS_IMPORT_TEMPLATE =
  "import { default as {{name}} } from '{{path}}'"
const COMPONENTS_TEMPLATE = `/* Automatically generated by './build/build-components-entry.js' */

{{include}}

export {
{{list}}
}

export default {
{{list}}
}
`

const buildEntry = (template, importTemplate, outputPath) => {
  const includeComponentTemplate = []
  const listTemplate = []

  componentsList.forEach((component) => {
    includeComponentTemplate.push(
      render(importTemplate, {
        name: component.name,
        path: component.relativePath,
      }),
    )

    listTemplate.push(`  ${component.name}`)
  })

  const file = render(template, {
    include: includeComponentTemplate.join(EOL),
    list: `${listTemplate.join(',' + EOL)},`,
  })

  writeFileSync(outputPath, file)
  // eslint-disable-next-line no-console
  console.log('[build entry] DONE:', outputPath)
}

buildEntry(
  COMPONENTS_TEMPLATE,
  COMPONENTS_IMPORT_TEMPLATE,
  COMPONENTS_OUTPUT_PATH,
)