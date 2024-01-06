import type { ClientPresetConfig } from '@graphql-codegen/client-preset'
import type { CodegenConfig } from '@graphql-codegen/cli'

import type { ClientOptions as _ClientOptions } from '@urql/core'

export interface UrqlModuleOptions {
  clients: {
    default?: UrqlClientOptions
    // TODO: support multiple clients
    /*
    [key: string]: UrqlClientOptions
    */
  }
}

export type UrqlClientOptions = Omit<_ClientOptions, 'fetch' | 'exchanges'> & {
  exchanges?: _ClientOptions['exchanges'] | (() => _ClientOptions['exchanges'])

  /**
   * @description Replace fetch with nuxt built-in ofetch. Could provide better performance for full stack api.
   * @default true
   */
  useBuildInFetch?: boolean

  /**
   * @description Setup the codegen of GraphQL operations.
   * @default
   * { useTypeImports: true }
   */
  codegen?: false | ClientPresetConfig & {
    /**
     * @description Override the schema used for codegen. Will fetch the schema from the remote if not provided.
     */
    schemaOverride?: CodegenConfig['schema']
  }
}
