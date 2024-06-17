import { cacheExchange, createClient, fetchExchange, ssrExchange } from '@urql/core'
import type { Client, SSRData } from '@urql/core'
import type { ClientOptions } from '../options'
import { defineNuxtPlugin, useRequestHeaders, useRuntimeConfig, useState } from '#app'

// @ts-expect-error type is not ready here
import type { ClientName } from '#build/types/urql-client'

export default defineNuxtPlugin((nuxt) => {
  const isClient = import.meta.client

  const getSsrKey = (id: string) => `__URQL_SSR_DATA__${id}__`
  const clientsOptions = useRuntimeConfig().public.urql.clients as Record<string, ClientOptions>

  const clients: Record<string, Client> = {}
  // for each client, create a urql client
  Object.entries(clientsOptions).forEach(([id, clientOptions]) => {
    /**
     * SSR Exchange
     */
    const ssrKey = getSsrKey(id)
    const ssrStorage = useState<SSRData>(ssrKey)
    const ssr = ssrExchange({ isClient })
    // client side: restore data
    if (isClient) {
      nuxt.hook('app:created', () => {
        ssr.restoreData(ssrStorage.value)
      })
    }
    // server side: save data
    else {
      nuxt.hook('app:rendered', () => {
        ssrStorage.value = ssr.extractData()
      })
    }

    const url = import.meta.client && clientOptions.urlClient
      ? clientOptions.urlClient
      : clientOptions.url

    const {
      useDollarFetch = true,
      fetchOptions = {},
      credentials = 'omit',
      cookiesFilter = [],
    } = clientOptions

    const client = createClient({
      ...clientOptions,
      url,
      exchanges: [
        cacheExchange,
        ssr,
        fetchExchange,
      ],
      fetchOptions: () => {
        let cookie = ''
        if (!isClient) {
          const headers = useRequestHeaders(['cookie'])
          const cookieList: string[] = []
          headers.cookie?.split(';')
            .map(cookie => cookie.trim())
            .forEach((val) => {
              const [name, value] = val.split('=')
              if (cookiesFilter?.includes(name)) {
                cookieList.push(`${name}=${value}`)
              }
            })
          cookie = cookieList.join('; ')
        }

        if (fetchOptions.headers) {
          const userHeaders = fetchOptions.headers
          if (Array.isArray(userHeaders)) {
            for (const [key, value] of userHeaders) {
              if (key.toLowerCase() === 'cookie') {
                cookie += value
              }
            }
          }
          else if (userHeaders instanceof Headers) {
            cookie += userHeaders.get('cookie') ?? ''
          }
          else {
            cookie += userHeaders.cookie ?? ''
          }
        }

        return {
          ...fetchOptions,
          credentials,
          headers: {
            ...fetchOptions.headers,
            cookie,
          },
        }
      },
      fetch: useDollarFetch
        ? (input, init) => $fetch.raw(
            input.toString(),
            {
              ...init as any,
              responseType: 'stream', // don't use the body
            },
          )
        : undefined,
    })

    clients[id] = client
  })

  return {
    provide: {
      urql: clients,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $urql: {
      [key in ClientName]: Client
    }
  }
}
