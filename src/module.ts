import { addImportsDir, addPlugin, addServerImportsDir, addTypeTemplate, createResolver, defineNuxtModule, updateRuntimeConfig, useLogger } from '@nuxt/kit'
import type { UrqlModuleOptions } from './options'

export default defineNuxtModule<UrqlModuleOptions>({
  meta: {
    name: '@teages/nuxt-urql-client',
    configKey: 'urqlClient',
  },
  defaults: {
    clients: {},
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // export client name type
    addTypeTemplate({
      filename: 'types/urql-client.d.ts',
      getContents: () => [
        `export type ClientName = ${
          Object.keys(options.clients).length === 0
            ? 'string'
            : Object.keys(options.clients).map(name => `'${name}'`).join(' | ')
        }`,
      ].join('\n'),
    })
    nuxt.options.nitro.alias = nuxt.options.nitro.alias ?? {}
    nuxt.options.nitro.alias['#urql-clients'] = './types/urql-client'

    updateRuntimeConfig({
      public: {
        urql: {
          clients: options.clients,
        },
      },
    })

    // plugin
    addPlugin(resolve('./runtime/plugin'))

    // composables
    addImportsDir(resolve('./runtime/composables'))

    // utils
    addImportsDir(resolve('./runtime/utils'))

    // server
    addServerImportsDir(resolve('./runtime/server/utils'))
  },
})
