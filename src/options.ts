import type { ClientOptions as _ClientOptions } from '@urql/core'

export interface UrqlModuleOptions {
  clients: {
    [key: string]: ClientOptions
  }
  /**
   * @default 'urql'
   */
  configDir?: string
  /**
   * Auto import `gql` to global. (Vue and nitro)
   *
   * @default true
   */
  gql?: boolean
}

export type ClientOptions = Omit<_ClientOptions, 'fetch' | 'exchanges' | 'fetchOptions'> & {
  /**
   * @description Rewrite the url in client side.
   */
  urlClient?: string

  /**
   * @description Replace fetch with nuxt built-in ofetch. Could provide better performance for full stack app.
   *
   * @see https://nuxt.com/docs/api/utils/dollarfetch
   * @default true
   */
  useDollarFetch?: boolean

  /**
   * @description Allow json friendly data only.
   * It will be send to the client so don't put secret here.
   *
   * It works in both vue app and nitro server.
   *
   * @default {}
   */
  fetchOptions?: {
    headers?: Record<string, string>
  } & RequestInit

  /**
   * @description The credentials policy you want to use for the fetch call.
   *
   * This option is only works in client side (browser).
   * See https://nuxt.com/docs/getting-started/data-fetching#passing-headers-and-cookies
   *
   * @default 'omit'
   */
  credentials?: 'include' | 'omit' | 'same-origin'

  /**
   * @description The list of cookies you want to send to the api.
   *
   * This option is only works in server side (Vue SSR).
   * See https://nuxt.com/docs/getting-started/data-fetching#passing-headers-and-cookies
   *
   * @default []
   */
  cookiesFilter?: string[]
}
