import type { AnyVariables, Client, CombinedError, DocumentInput, OperationContext } from '@urql/core'
import { hash } from 'ohash'
import type { KeysOf, PickFrom } from '#app/composables/asyncData'
import { type AsyncData, type AsyncDataOptions, useAsyncData, useNuxtApp } from '#app'
import type { ClientName } from '#build/urql-client/options'
import { type MaybeRefOrGetter, toValue } from '#imports'

export function useUrql(): { client: Client }
export function useUrql(id: ClientName): { client: Client }
export function useUrql(id?: ClientName) {
  const app = useNuxtApp()
  const client = app.$urqlClients[id ?? 'default']

  return { client }
}

export async function useQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Data, Variables>,
  variables?: Variables,
  context?: Partial<OperationContext>,
): Promise<Data | undefined> {
  // @ts-expect-error _client is not in the type
  const clientId = document._client as ClientName
  if (!clientId) {
    throw new Error('The document is not tagged with a client')
  }
  const { client } = useUrql(clientId)
  const ans = await client.query(document, variables as any, context).toPromise()
  if (ans.error) {
    throw createUrqlError(ans.error)
  }

  return ans.data
}

export async function useMutation<Data = any, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Data, Variables>,
  variables?: Variables,
  context?: Partial<OperationContext>,
): Promise<Data | undefined> {
  // @ts-expect-error _client is not in the type
  const clientId = document._client as ClientName
  if (!clientId) {
    throw new Error('The document is not tagged with a client')
  }
  const { client } = useUrql(clientId)
  const ans = await client.mutation(document, variables as any, context).toPromise()
  if (ans.error) {
    throw createUrqlError(ans.error)
  }

  return ans.data
}

export function useAsyncQuery<
  Data = any,
  Variables extends AnyVariables = AnyVariables,
  DataT = Data | undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = null,
>(
  document: DocumentInput<Data, Variables>,
  variables?: MaybeRefOrGetter<Variables>,
  options?: AsyncDataOptions<Data | undefined, DataT, PickKeys, DefaultT> & { context?: Partial<OperationContext> },
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, CombinedError | null>
export function useAsyncQuery<
  Data = any,
  Variables extends AnyVariables = AnyVariables,
  DataT = Data | undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = DataT,
>(
  document: DocumentInput<Data, Variables>,
  variables?: MaybeRefOrGetter<Variables>,
  options?: AsyncDataOptions<Data | undefined, DataT, PickKeys, DefaultT> & { context?: Partial<OperationContext> },
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, CombinedError | null> {
  const key = hash({ document, variables })
  const context: Partial<OperationContext> = {
    // use the build-in cache of useAsyncData
    requestPolicy: 'network-only',
    ...options?.context,
  }
  return useAsyncData(key, () => useQuery(document, toValue(variables), context), options)
}

export function useLazyAsyncQuery<
  ResT = any,
  Variables extends AnyVariables = AnyVariables,
  DataT = ResT | undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = null,
>(
  document: DocumentInput<ResT, Variables>,
  variables?: MaybeRefOrGetter<Variables>,
  options?: AsyncDataOptions<ResT | undefined, DataT, PickKeys, DefaultT> & { context?: Partial<OperationContext> },
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, CombinedError | null>
export function useLazyAsyncQuery<
  ResT = any,
  Variables extends AnyVariables = AnyVariables,
  DataT = ResT | undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = DataT,
>(
  document: DocumentInput<ResT, Variables>,
  variables?: MaybeRefOrGetter<Variables>,
  options?: AsyncDataOptions<ResT | undefined, DataT, PickKeys, DefaultT> & { context?: Partial<OperationContext> },
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, CombinedError | null> {
  const key = hash({ document, variables })
  const context: Partial<OperationContext> = {
    // use the build-in cache of useAsyncData
    requestPolicy: 'network-only',
    ...options?.context,
  }
  return useAsyncData(key, () => useQuery(document, toValue(variables), context), {
    lazy: true,
    ...options,
  })
}

// TODO: need test
/*
  export async function useSubscription<Data = any, Variables extends AnyVariables = AnyVariables>(
    query: MaybeRef<DocumentInput<Data, Variables>>,
    variables: MaybeRef<Variables>,
  ) {
    const { client } = useUrql()

    const result = useState<OperationResult<Data, Variables>>()
    let sub: Subscription | null = null
    let error: CombinedError | undefined

    // update when query/variables changes
    watch([query, variables], async () => {
      const _query = unref(query)
      const _variables = unref(variables)

      const req = client.subscription(_query, _variables)
      sub = req.subscribe((newResult) => {
        result.value = newResult
      })

      const ans = await req.toPromise()
      error = ans.error
    })

    return { result, error, unsubscribe: () => sub?.unsubscribe() }
  }
*/

function createUrqlError(error: CombinedError) {
  const graphqlErrors = error.graphQLErrors.map(e => e.message)
  const networkError = error.networkError?.message
  const message = [
    ...graphqlErrors,
    ...(networkError ? [`Network error: ${networkError}`] : []),
  ].join('; ')
  return new Error(message)
}
