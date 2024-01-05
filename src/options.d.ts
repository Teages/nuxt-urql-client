import type { ClientPresetConfig } from '@graphql-codegen/client-preset'
import type { CodegenConfig } from '@graphql-codegen/cli'

import type { ClientOptions as UrqlCoreOptions } from '@urql/core'

export interface UrqlClientOptions {
  default?: UrqlCoreOptions | undefined
  [key: string]: UrqlCoreOptions | undefined
}

export type ClientOptions = Omit<UrqlCoreOptions, 'fetch' | 'exchanges'> & {
  exchanges?: UrqlCoreOptions['exchanges'] | (() => UrqlCoreOptions['exchanges'])

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
