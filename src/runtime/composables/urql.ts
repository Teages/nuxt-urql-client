import type { Client } from '@urql/core'
import { useNuxtApp } from '#app'
import type { ClientName } from '#build/urql-client/options'

export function useUrql(): { client: Client }
export function useUrql(id: ClientName): { client: Client }
export function useUrql(id?: ClientName) {
  const app = useNuxtApp()
  const client = app.$urqlClients[id ?? 'default']

  return { client }
}
