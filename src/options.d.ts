import type { ClientPresetConfig } from '@graphql-codegen/client-preset'
import type { CodegenConfig } from '@graphql-codegen/cli'

import type { ClientOptions as _ClientOptions } from '@urql/core'

export interface UrqlModuleOptions {
  clients: {
    /**
     * @description The default client, the first client will be the default if not specified.
     */
    default?: ClientOptions & { name?: string }
    [key: string]: ClientOptions
  }

  /**
   * @description Setup the codegen of GraphQL operations for all clients.
   */
  codegen?: false | (CodegenOptions & {
    /**
     * @description Rerun code generation when the app HMR.
     *
     * Only rerun when:
     * - the file include `gql` or other gql tag
     * - the file in `watch.extra` list.
     * - the Nitro server HMR and `watch.nitro` is true.
     *
     * @default {}
     */
    watch?: false | {
      /**
       * @description Regenerate when the file changed. (The file must be watched by Nuxt)
       */
      extra?: string[]

      /**
       * @description Regenerate when Nitro server HMR.
       * @default false
       */
      nitro?: boolean
    }
  })
}

export interface CodegenOptions {
  /**
   * @description Override config of client preset.
   *
   * @see https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#config-api
   *
   * @default
   * { useTypeImports: true }
   */
  config?: {
    /**
     * @description Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#scalars
     *
     * @example
     * import { DateTimeResolver } from 'graphql-scalars'
     *
     * scalars: {
     *   Date: DateTimeResolver.extensions.codegenScalarType
     * }
     */
    scalars?: any

    /**
     * @description Allows you to override the type that unknown scalars will have. Defaults to `any`.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#defaultscalartype
     */
    defaultScalarType?: string

    /**
     * @description If `scalars` are found in the schema that are not defined in scalars an error will be thrown during codegen.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#strictscalars
     */
    strictScalars?: boolean

    /**
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#namingconvention
     */
    namingConvention?: string

    /**
     * @description Will use `import type {}` rather than `import {}` when importing only types. This gives compatibility with TypeScript's [`"importsNotUsedAsValues": "error"`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues) option.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#usetypeimports
     */
    useTypeImports?: boolean

    /**
     * @description Does not add `__typename` to the generated types, unless it was specified in the selection set.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#skiptypename
     */
    skipTypename?: boolean

    /**
     * @description The [GraphQL spec](https://spec.graphql.org/draft/#sel-FAHjBJFCAACE_Gh7d) allows arrays and a single primitive value for list input. This allows to deactivate that behavior to only accept arrays instead of single values.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations#arrayinputcoercion
     */
    arrayInputCoercion?: boolean

    /**
     * @description Generates enum as TypeScript string union `type` instead of an `enum`. Useful if you wish to generate `.d.ts` declaration file instead of `.ts`, or if you want to avoid using TypeScript enums due to bundle size concerns.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#enumsastypes
     */
    enumsAsTypes?: boolean

    /**
     * @description Adds a catch-all entry to enum type definitions for values that may be added in the future.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#futureproofenums
     */
    futureProofEnums?: boolean

    /**
     * @description Removes fragment duplicates for reducing data transfer. It is done by removing sub-fragments imports from fragment definition.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#dedupefragments
     */
    dedupeFragments?: boolean

    /**
     * @description Automatically adds `__typename` field to the generated types, even when they are not specified in the selection set, and makes it non-optional.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#nonoptionaltypename
     */
    nonOptionalTypename?: boolean

    /**
     * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#avoidoptionals
     */
    avoidOptionals?: boolean

    /**
     * @description Allows you to control how the documents are generated.
     *
     * @see https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#documentmode
     */
    documentMode?: 'TypedDocumentNode' | 'string'
  }

  /**
   * @description Override preset config of client preset.
   */
  presetConfig?: Omit<ClientPresetConfig, 'gqlTagName'>

  /**
   * @description Override the schema used for codegen. Will fetch the schema from the remote if not provided.
   */
  schemaOverride?: CodegenConfig['schema']

  /**
   * @description Override the documents used for codegen.
   */
  documentsOverride?: CodegenConfig['documents']
}

export type ClientOptions = Omit<_ClientOptions, 'fetch' | 'exchanges'> & {
  /**
   * @description Rewrite the url in client side.
   */
  urlClient?: string

  /**
   * @description Specify the name of the "graphql tag" function to use
   * @default `gql${upperCamelCase(clientName)}`
   */
  gqlTagName?: string

  /**
   * @description Replace fetch with nuxt built-in ofetch. Could provide better performance for full stack app.
   *
   * @see https://nuxt.com/docs/api/utils/dollarfetch
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

  /**
   * @description Specify codegen options for this client.
   */
  codegen?: CodegenOptions
}
