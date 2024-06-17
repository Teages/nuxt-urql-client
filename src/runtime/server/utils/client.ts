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
  } = clientOptions

  return createClient({
    ...clientOptions,
    exchanges: [
      cacheExchange,
      fetchExchange,
    ],
    fetchOptions,
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
