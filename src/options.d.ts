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
   * @default {}
   */
  codegen?: false | {
    /**
     * @description The output path of generated code.
     * @default 'gql'
     */
    path?: string

    /**
     * @description Override config of client preset.
     *
     * See https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#config-api
     *
     * @default
     * { useTypeImports: true }
     */
    config?: Record<string, any>

    /**
     * @description Override preset config of client preset.
     */
    presetConfig?: ClientPresetConfig

    /**
     * @description Override the schema used for codegen. Will fetch the schema from the remote if not provided.
     */
    schemaOverride?: CodegenConfig['schema']

    /**
     * @description Override the documents used for codegen.
     */
    documentsOverride?: CodegenConfig['documents']

    /**
     * @description Rerun code generation when the app HMR.
     * Only rerun when the file include `gql`, or the file in `watch.extra` list.
     */
    watch?: false | {
      /**
       * @description Regenerate code when the file changed.
       */
      extra?: string[]
    }
  }
}

export type UrqlClientOptions = Omit<_ClientOptions, 'fetch' | 'exchanges'> & {
  /**
   * @description Rewrite the url in client side.
   */
  urlClient?: string

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
