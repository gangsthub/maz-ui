const { writeFileSync } = require('node:fs')
const { componentsList } = require('./get-component-list')
const render = require('json-templater/string')
const { resolve } = require('node:path')
const { EOL } = require('node:os')

const ESM_COMPONENTS_OUTPUT_PATH = resolve(
  __dirname,
  './../components/index.js',
)
const CJS_COMPONENTS_OUTPUT_PATH = resolve(
  __dirname,
  './../cjs/components/index.js',
)

const CJS_INDEX_OUTPUT_PATH = resolve(__dirname, './../index.js')
const ESM_INDEX_OUTPUT_PATH = resolve(__dirname, './../cjs/index.js')

const ESM_INDEX_TEMPLATE = `/* Automatically generated by './build/build-entries.js' */
export * from './components'
export * from './modules'
`
const CJS_INDEX_TEMPLATE = `/* Automatically generated by './build/build-entries.js' */
const components = require('./components')
const modules = require('./modules')

module.exports = components
module.exports = modules
`

const ESM_COMPONENTS_IMPORT_TEMPLATE = "import {{name}} from '{{path}}'"
const ESM_COMPONENTS_TEMPLATE = `/* Automatically generated by './build/build-entries.js' */

{{include}}

export {
{{list}}
}
`
const CJS_COMPONENTS_IMPORT_TEMPLATE = "const {{name}} = require('{{path}}')"
const CJS_COMPONENTS_TEMPLATE = `/* Automatically generated by './build/build-entries.js' */

{{include}}

module.exports = {
{{list}}
}
`

const buildEntry = (template, importTemplate, outputPath) => {
  const includeComponentTemplate = []
  const listTemplate = []

  for (const component of componentsList) {
    includeComponentTemplate.push(
      render(importTemplate, {
        name: component.name,
        path: component.buildPath,
      }),
    )

    listTemplate.push(`  ${component.name}`)
  }

  const file = render(template, {
    include: includeComponentTemplate.join(EOL),
    list: listTemplate.join(',' + EOL),
  })

  writeFileSync(outputPath, file)
  // eslint-disable-next-line no-console
  console.log('[build entry] DONE:', outputPath)
}

buildEntry(
  ESM_COMPONENTS_TEMPLATE,
  ESM_COMPONENTS_IMPORT_TEMPLATE,
  ESM_COMPONENTS_OUTPUT_PATH,
)
buildEntry(
  CJS_COMPONENTS_TEMPLATE,
  CJS_COMPONENTS_IMPORT_TEMPLATE,
  CJS_COMPONENTS_OUTPUT_PATH,
)

writeFileSync(ESM_INDEX_OUTPUT_PATH, ESM_INDEX_TEMPLATE)
writeFileSync(CJS_INDEX_OUTPUT_PATH, CJS_INDEX_TEMPLATE)
