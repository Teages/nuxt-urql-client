import { type Client, cacheExchange, createClient, fetchExchange } from '@urql/core'
import { type H3Event, getHeader } from 'h3'
import type { ClientOptions } from '../../../options'
// @ts-expect-error type is not ready here
import type { ClientName } from '#urql-clients'
import { useRuntimeConfig } from '#imports'

export function useUrqlClient(event: H3Event, id: ClientName): Client {
  const clientOptions: ClientOptions = useRuntimeConfig(event)
    .public.urql.clients[id] ?? {}

  const {
    useDollarFetch = true,
    fetchOptions = {},
    credentials = 'omit',
    cookiesFilter = [],
  } = clientOptions

  return createClient({
    ...clientOptions,
    exchanges: [
      cacheExchange,
      fetchExchange,
    ],
    fetchOptions: () => {
      let cookie = ''
      const cookies = getHeader(event, 'cookie')
      const cookieList: string[] = []
      cookies?.split(';')
        .map(cookie => cookie.trim())
        .forEach((val) => {
          const [name, value] = val.split('=')
          if (cookiesFilter?.includes(name)) {
            cookieList.push(`${name}=${value}`)
          }
        })
      cookie = cookieList.join('; ')

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
}
