import { gql } from '@urql/core'
import { useNuxtApp } from '#app'
import type { ClientName } from '#build/urql-client/options'

export function useUrql(name: ClientName) {
  const app = useNuxtApp()
  const client = app.$urqlClients[name]

  return { client, gql }
}
