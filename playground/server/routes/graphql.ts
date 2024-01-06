import { createYoga } from 'graphql-yoga'

import { schema } from '../../../schema'

export default defineEventHandler((event) => {
  const { req, res } = event.node

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') {
    return null
  }

  // Handle the graphql request
  const handler = createYoga({
    schema,
    context: () => ({ event, headers: event.headers }),
  })
  return handler(req, res)
})
