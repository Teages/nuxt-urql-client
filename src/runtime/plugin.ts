import { cacheExchange, createClient, fetchExchange, ssrExchange } from '@urql/core'
import type { Client, SSRData } from '@urql/core'
import { defineNuxtPlugin, useState } from '#app'
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

    const client = createClient({
      ...clientOptions,
      exchanges: [
        cacheExchange,
        ssr,
        fetchExchange,
      ],
      // TODO: fetchOptions
      fetch: (input, init) => $fetch.raw(
        input.toString(),
        {
          ...init as any,
          responseType: 'stream', // don't use the body
        },
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
