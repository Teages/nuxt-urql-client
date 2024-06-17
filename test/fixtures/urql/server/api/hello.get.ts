import { gql } from '@urql/core'

export default defineEventHandler(async (event) => {
  const client = useUrqlClient(event, 'hello')

  const query = gql(`
    query test($name: String!) {
      hello(name: $name)
    }
  `)

  const result = await client.query(query, { name: 'server' }).toPromise()

  return result.data
})
