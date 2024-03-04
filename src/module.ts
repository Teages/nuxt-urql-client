import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { UrqlModuleOptions } from './options'

import { setup } from './setup'

export type * from './options'

export default defineNuxtModule<UrqlModuleOptions>({
  meta: {
    name: '@teages/nuxt-urql-client',
    configKey: 'urqlClient',
  },
  defaults: {
    clients: {},
  },
  setup(options, nuxt) {
    const srcResolver = createResolver(import.meta.url)
    const rootResolver = createResolver(nuxt.options.rootDir)

    return setup(options, nuxt, srcResolver, rootResolver)
  },
})
