import { cacheExchange, createClient, fetchExchange, ssrExchange } from '@urql/core'
import type { Client, SSRData } from '@urql/core'
import { defineNuxtPlugin, useRequestHeaders, useState } from '#app'
import type { ClientName } from '#build/urql-client/options'
import { UrqlModuleOptions as options } from '#build/urql-client/options'

export default defineNuxtPlugin((nuxt) => {
  const isClient = () => import.meta.client

  const getSsrKey = (name: string) => `__URQL_SSR_DATA__${name}__`

  const clients: Record<string, Client> = {}
  // for each client, create a urql client
  Object.entries(options.clients).forEach(([name, clientOptions]) => {
    /**
     * SSR Exchange
     */
    const ssrKey = getSsrKey(name)
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

    const useBuildInFetch = clientOptions.useBuildInFetch ?? true
    const fetchOptions = clientOptions.fetchOptions ?? {}
    const credentials = clientOptions.credentials ?? 'omit'
    const cookiesFilter = clientOptions.cookiesFilter ?? []

    const client = createClient({
      ...clientOptions,
      exchanges: [
        cacheExchange,
        ssr,
        fetchExchange,
      ],
      fetchOptions: () => {
        let cookie = ''
        if (!isClient()) {
          const headers = useRequestHeaders(['cookie'])
          headers.cookie?.split(';').forEach((cookie) => {
            const [name, value] = cookie.split('=')
            if (cookiesFilter?.includes(name)) {
              cookie += `${name}=${value};`
            }
          })
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
      ...(
        useBuildInFetch
          ? {
              fetch: (input, init) => $fetch.raw(
                input.toString(),
                {
                  ...init as any,
                  responseType: 'stream', // don't use the body
                },
              ),
            }
          : {}
      ),
    })

    clients[name] = client
  })

  nuxt.provide('urqlClients', clients)
  nuxt.vueApp.provide('$urqlClients', clients)
})

declare module '#app' {
  interface NuxtApp {
    $urqlClients: {
      [key in ClientName]: Client
    }
  }
  interface Context {
    $urqlClients: {
      [key in ClientName]: Client
    }
  }
}
