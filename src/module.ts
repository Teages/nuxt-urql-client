import { addPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { UrqlClientOptions } from './options'

export default defineNuxtModule<UrqlClientOptions>({
  meta: {
    name: 'my-module',
    configKey: 'urqlClient',
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const srcResolver = createResolver(nuxt.options.srcDir)

    // export options and its type to runtime plugin
    addTemplate({
      filename: 'urql-client/options.mjs',
      getContents: () => `export const urqlClientOptions = ${JSON.stringify(options)}`,
    })
    addTypeTemplate({
      filename: 'urql-client/options.d.ts',
      getContents: () => [
        `import type { UrqlClientOptions } from '${resolver.resolve('./options')}'`,
        `export declare const urqlClientOptions: UrqlClientOptions`,
      ].join('\n'),
    })

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
