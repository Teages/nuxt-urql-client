import { addImportsDir, addPlugin, addServerImportsDir, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, updateRuntimeConfig, updateTemplates, useLogger } from '@nuxt/kit'
import { globSync as glob } from 'fast-glob'
import { parse } from 'pathe'
import type { UrqlModuleOptions } from './options'

export default defineNuxtModule<UrqlModuleOptions>({
  meta: {
    name: '@teages/nuxt-urql-client',
    configKey: 'urqlClient',
    compatibility: {
      nuxt: '>=3.12.2',
    },
  },
  defaults: {
    clients: {},
  },
  setup(options, nuxt) {
    const logger = useLogger('@teages/nuxt-urql-client')

    const { resolve } = createResolver(import.meta.url)

    // export client name type
    addTypeTemplate({
      filename: 'types/urql-clients.d.ts',
      getContents: () => [
        `export type ClientName = ${
          Object.keys(options.clients).length === 0
            ? 'string'
            : Object.keys(options.clients).map(name => `'${name}'`).join(' | ')
        }`,
      ].join('\n'),
    })
    nuxt.options.nitro.alias = nuxt.options.nitro.alias ?? {}
    nuxt.options.nitro.alias['#urql-clients'] = './types/urql-clients'

    updateRuntimeConfig({
      public: {
        urql: {
          clients: options.clients,
        },
      },
    })

    addPlugin(resolve('./runtime/plugin'))

    addImportsDir(resolve('./runtime/composables'))
    addImportsDir(resolve('./runtime/utils'))
    addServerImportsDir(resolve('./runtime/server/utils'))

    // Config override
    const overrides = new Set<{ id: string, type: 'client', path: string }>()
    addTemplate({
      filename: 'urql-clients/override-options.client.mjs',
      getContents: () => Object.keys(options.clients).map((id) => {
        const override = [...overrides].find(o => o.id === id && o.type === 'client')
        if (override) {
          const path = override.path.replace(/\.(ts|js|mjs|mts)$/, '')
          return `export { default as ${id} } from '${path}'`
        }
        else {
          return `export const ${id} = () => {}`
        }
      }).flat().join('\n'),
      write: true,
    })

    const { resolve: srcResolve } = createResolver(nuxt.options.srcDir)
    const reloadOverrides = async () => {
      overrides.clear()

      const dirname = options.configDir ?? 'urql'

      glob(srcResolve(dirname, '*.{ts,js,mts,mjs}')).forEach((file) => {
        const id = parse(file).base.replace(/\.(ts|js|mjs|mts)$/, '')
        if (id in options.clients) {
          overrides.add({ id, type: 'client', path: file })
        }
        else {
          logger.warn(`Client "${id}" is not defined in nuxt.config`)
        }
      })

      updateTemplates({
        filter: template => template.filename.startsWith('urql-clients/override-options'),
      })
    }

    reloadOverrides()
    nuxt.hook('builder:watch', (event) => {
      if (event !== 'change') {
        reloadOverrides()
      }
    })
  },
})
