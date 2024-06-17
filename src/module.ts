import { addImportsDir, addPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import type { UrqlModuleOptions } from './options'

export default defineNuxtModule<UrqlModuleOptions>({
  meta: {
    name: '@teages/nuxt-urql-client',
    configKey: 'urqlClient',
  },
  defaults: {
    clients: {},
  },
  setup(options) {
    const { resolve } = createResolver(import.meta.url)

    // export options and its type to runtime plugin
    addTemplate({
      filename: 'urql-client/options.mjs',
      getContents: () => `export const urqlModuleOptions = ${JSON.stringify(options)}`,
    })
    addTypeTemplate({
      filename: 'urql-client/options.d.ts',
      getContents: () => [
        `import type { UrqlModuleOptions } from '${resolve('./options')}'`,
        `export declare const urqlModuleOptions: UrqlModuleOptions`,
        `export type ClientName = ${
          Object.keys(options.clients).length === 0
            ? 'string'
            : Object.keys(options.clients).map(name => `'${name}'`).join(' | ')
        }`,
      ].join('\n'),
    })

    // plugin
    addPlugin(resolve('./runtime/plugin'))

    // composables
    addImportsDir(resolve('./runtime/composables'))

    // utils
    addImportsDir(resolve('./runtime/utils'))
  },
})
