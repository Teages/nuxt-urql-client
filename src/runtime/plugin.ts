import { cacheExchange, createClient, fetchExchange, ssrExchange } from '@urql/core'
import type { Client, SSRData } from '@urql/core'
import { defineNuxtPlugin, useRequestHeaders, useState } from '#app'
import type { ClientName } from '#build/urql-client/options'
import { urqlModuleOptions as options } from '#build/urql-client/options'

export default defineNuxtPlugin((nuxt) => {
  const isClient = () => import.meta.client

  const getSsrKey = (id: string) => `__URQL_SSR_DATA__${id}__`

  const clients: Record<string, Client> = {}
  // for each client, create a urql client
  Object.entries(options.clients).forEach(([id, clientOptions]) => {
    /**
     * SSR Exchange
     */
    const ssrKey = getSsrKey(id)
    const ssrStorage = useState<SSRData>(ssrKey)
    const ssr = ssrExchange({
      isClient: isClient(),
    })
    // client side: restore data
    if (isClient()) {
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
      useBuildInFetch = true,
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
        if (!isClient()) {
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
      fetch: useBuildInFetch
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
      urqlClients: clients,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $urqlClients: {
      [key in ClientName]: Client
    }
  }
}
