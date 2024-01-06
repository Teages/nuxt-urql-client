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

export type UrqlClientOptions = Omit<_ClientOptions, 'fetch' | 'exchanges'> & {
  /**
   * @description Replace fetch with nuxt built-in ofetch. Could provide better performance for full stack api.
   *
   * See https://nuxt.com/docs/api/utils/dollarfetch
   *
   * @default true
   */
  useBuildInFetch?: boolean

  /**
   * @description Allow json friendly data only.
   * It will be send to the client so don't put secret here.
   *
   * @default {}
   */
  fetchOptions?: {
    headers?: Record<string, string>
  }

  /**
   * @description The credentials policy you want to use for the fetch call.
   *
   * This option is only works in client side (browser).
   * See https://nuxt.com/docs/getting-started/data-fetching#passing-headers-and-cookies
   *
   * @default 'omit'
   */
  credentials?: RequestCredentials

  /**
   * @description The list of cookies you want to send to the api.
   *
   * This option is only works in server side (SSR).
   * See https://nuxt.com/docs/getting-started/data-fetching#passing-headers-and-cookies
   *
   * @default []
   */
  cookiesFilter?: string[]
}
