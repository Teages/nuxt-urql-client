import type { AnyVariables, Client, CombinedError, DocumentInput, OperationContext } from '@urql/core'
import { hash } from 'ohash'
import type { KeysOf, PickFrom } from '#app/composables/asyncData'
import { type AsyncData, type AsyncDataOptions, useAsyncData, useNuxtApp } from '#app'
import { type MaybeRefOrGetter, toValue } from '#imports'
// @ts-expect-error type is not ready here
import type { ClientName } from '#build/types/urql-client'

export function useUrql(id: ClientName): UseUrqlReturn {
  const app = useNuxtApp()
  const client = app.$urql[id]

  return {
    client,
    ...buildComposables(client),
  }
}

function buildComposables(client: Client): Omit<UseUrqlReturn, 'client'> {
  const useQuery: UseQuery = async (document, variables, context) => {
    const ans = await client.query(document, variables, context).toPromise()
    if (ans.error) {
      throw createUrqlError(ans.error)
    }

    return ans.data
  }

  const useMutation: UseMutation = async (document, variables, context) => {
    const ans = await client.mutation(document, variables as any, context).toPromise()
    if (ans.error) {
      throw createUrqlError(ans.error)
    }

    return ans.data
  }

  const useAsyncQuery: UseAsyncQuery = (document, variables, options) => {
    const key = hash({ document, variables })
    const context: Partial<OperationContext> = {
      // use the build-in cache of useAsyncData
      requestPolicy: 'network-only',
      ...options?.context,
    }
    return useAsyncData(key, () => useQuery(document, toValue(variables), context), options)
  }

  const useLazyAsyncQuery: UseAsyncQuery = (document, variables, options) => {
    return useAsyncQuery(document, variables, { lazy: true, ...options })
  }

  return {
    useQuery,
    useMutation,
    useAsyncQuery,
    useLazyAsyncQuery,
  }
}

function createUrqlError(error: CombinedError) {
  const graphqlErrors = error.graphQLErrors.map(e => e.message)
  const networkError = error.networkError?.message
  const message = [
    ...graphqlErrors,
    ...(networkError ? [`Network error: ${networkError}`] : []),
  ].join('; ')
  return new Error(message)
}

export interface UseUrqlReturn {
  client: Client
  useQuery: UseQuery
  useMutation: UseMutation
  useAsyncQuery: UseAsyncQuery
  useLazyAsyncQuery: UseAsyncQuery
}

export interface UseQuery {
  <
    Data = any,
    Variables extends AnyVariables = AnyVariables,
  > (
    document: DocumentInput<Data, Variables>,
    variables?: Variables,
    context?: Partial<OperationContext>,
  ): Promise<Data | undefined>
}

export interface UseMutation {
  <
    Data = any,
    Variables extends AnyVariables = AnyVariables,
  > (
    document: DocumentInput<Data, Variables>,
    variables?: Variables,
    context?: Partial<OperationContext>,
  ): Promise<Data | undefined>
}

export interface UseAsyncQuery {
  <
    Data = any,
    Variables extends AnyVariables = AnyVariables,
    DataT = Data | undefined,
    PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
    DefaultT = null,
  > (
    document: DocumentInput<Data, Variables>,
    variables?: MaybeRefOrGetter<Variables>,
    options?: AsyncDataOptions<Data | undefined, DataT, PickKeys, DefaultT> & { context?: Partial<OperationContext> },
  ): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, CombinedError | null>

  <
    Data = any,
    Variables extends AnyVariables = AnyVariables,
    DataT = Data | undefined,
    PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
    DefaultT = DataT,
  >(
    document: DocumentInput<Data, Variables>,
    variables?: MaybeRefOrGetter<Variables>,
    options?: AsyncDataOptions<Data | undefined, DataT, PickKeys, DefaultT> & { context?: Partial<OperationContext> },
  ): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, CombinedError | null>
}

// export interface useSubscription {}
