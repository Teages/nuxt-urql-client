import { type Resolver, addImports, addPlugin, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { UrqlModuleOptions } from '../options'
import { setupCodegen } from './codegen'
import { setupRuntime } from './runtime'

export async function setup(
  options: UrqlModuleOptions,
  nuxt: Nuxt,
  srcResolver: Resolver,
  rootResolver: Resolver,
) {
  const logger = useLogger('urql-client')
  if (Object.keys(options.clients).length === 0) {
    logger.warn('No client is configured.')
    options.codegen = false
  }

  // make the first client as default if not set
  if (!options.clients.default && Object.keys(options.clients).length > 0) {
    const defaultId = Object.keys(options.clients)[0]
    logger.warn(`No default client is configured. Use "${defaultId}" as default client.`)
    options.clients.default = {
      ...options.clients[defaultId],
      name: defaultId,
    }
    delete options.clients[defaultId]
  }

  // export options and its type to runtime plugin
  addTemplate({
    filename: 'urql-client/options.mjs',
    getContents: () => `export const urqlModuleOptions = ${JSON.stringify(options)}`,
  })
  addTypeTemplate({
    filename: 'urql-client/options.d.ts',
    getContents: () => [
      `import type { UrqlModuleOptions } from '${srcResolver.resolve('./options')}'`,
      `export declare const urqlModuleOptions: UrqlModuleOptions`,
      `export type ClientName = ${
        Object.keys(options.clients).length === 0
          ? 'string'
          : Object.keys(options.clients).map(name => `'${name}'`).join(' | ')
      }`,
    ].join('\n'),
  })

  // gql codegen
  const additionImports = await setupCodegen(options, nuxt, rootResolver)
  nuxt.hook('imports:extend', (autoimports) => {
    autoimports.push(...additionImports)
  })

  setupRuntime(srcResolver, options.codegen !== false)
}
