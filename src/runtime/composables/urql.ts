import type { AnyVariables, CombinedError, DocumentInput, OperationContext } from '@urql/core'
import { gql } from '@urql/core'
import { hash } from 'ohash'
import { type AsyncDataOptions, useAsyncData, useNuxtApp } from '#app'

export function useUrql() {
  const app = useNuxtApp()
  const client = app.$urqlClients.default

  return { client, gql }
}

export { gql }

export async function useQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Data, Variables>,
  variables?: Variables,
  context?: Partial<OperationContext>,
) {
  const { client } = useUrql()
  const ans = await client.query(document, variables, context).toPromise()
  if (ans.error) {
    throw createUrqlError(ans.error)
  }

  return ans.data
}

export async function useMutation<Data = any, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Data, Variables>,
  variables?: Variables,
  context?: Partial<OperationContext>,
) {
  const { client } = useUrql()
  const ans = await client.mutation(document, variables, context).toPromise()
  if (ans.error) {
    throw createUrqlError(ans.error)
  }

  return ans.data
}

export function useAsyncQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Data, Variables>,
  variables?: Variables,
  context?: Partial<OperationContext>,
  options?: AsyncDataOptions<Data | undefined>,
) {
  const key = hash({ document, variables })
  return useAsyncData(key, () => useQuery(document, variables, context), options)
}

// TODO: waiting nitro support websocket
/*
  export async function useSubscription<Data = any, Variables extends AnyVariables = AnyVariables>(
    query: MaybeRef<DocumentInput<Data, Variables>>,
    variables: MaybeRef<Variables>,
    context?: MaybeRef<Partial<OperationContext>>,
  ) {
    const { client } = useUrql()

    const result = useState<OperationResult<Data, Variables>>()
    let sub: Subscription | null = null
    let error: CombinedError | undefined

    // update when query/variables/context changes
    watch([query, variables, context], async () => {
      const _query = unref(query)
      const _variables = unref(variables)
      const _context = unref(context)

      const req = client.subscription(_query, _variables, _context)
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
