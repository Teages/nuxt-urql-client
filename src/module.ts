import { addImports, addPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import type { UrqlModuleOptions } from './options'
import { setupCodegen } from './codegen'

export default defineNuxtModule<UrqlModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'urqlClient',
  },
  defaults: {
    clients: {},
  },
  async setup(options, nuxt) {
    const logger = useLogger('urql-client')
    if (Object.keys(options.clients).length === 0) {
      logger.warn('No client is configured.')
      options.codegen = false
    }

    const resolver = createResolver(import.meta.url)

    // export options and its type to runtime plugin
    addTemplate({
      filename: 'urql-client/options.mjs',
      getContents: () => `export const UrqlModuleOptions = ${JSON.stringify(options)}`,
    })
    addTypeTemplate({
      filename: 'urql-client/options.d.ts',
      getContents: () => [
        `import type { UrqlModuleOptions } from '${resolver.resolve('./options')}'`,
        `export declare const UrqlModuleOptions: UrqlModuleOptions`,
        `export type ClientName = ${
          Object.keys(options.clients).length === 0
            ? 'string'
            : Object.keys(options.clients).map(name => `'${name}'`).join(' | ')
        }`,
      ].join('\n'),
    })

    // gql codegen
    await setupCodegen(options, nuxt)

    addPlugin(resolver.resolve('./runtime/plugin'))

    addImports([
      'gql',
      'useUrql',
      'useQuery',
      'useMutation',
      'useAsyncQuery',
    ].map(name => ({
      name,
      from: resolver.resolve('./runtime/composables/urql'),
    })))
  },
})
