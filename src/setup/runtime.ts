import { type Resolver, addImportsDir, addPlugin } from '@nuxt/kit'

export function setupRuntime(
  resolver: Resolver,
  codegen: boolean,
) {
  // plugin
  addPlugin(resolver.resolve('./runtime/plugin.ts'))

  // composables
  addImportsDir(resolver.resolve(
    codegen ? './runtime/composables-codegen' : './runtime/composables',
  ))

  // utils
  // addImportsDir(resolver.resolve('./runtime/utils'))
}
