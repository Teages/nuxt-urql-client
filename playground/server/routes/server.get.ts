export default defineEventHandler(async (event) => {
  const client = useUrqlClient(event, 'auth')

  const query = gql(`
    query Auth {
      authorization
    }
  `)

  const result = await client.query(query, {}).toPromise()

  return result.data
})
