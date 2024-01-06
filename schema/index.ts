import SchemaBuilder from '@pothos/core'
import type { H3Event } from 'h3'

const builder = new SchemaBuilder<{
  Context: {
    event: H3Event
    headers: Record<string, string>
  }
}>({})

builder.queryType({
  fields: t => ({
    hello: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (_p, { name }) => `hello ${name || 'World'}`,
    }),

    cookie: t.string({
      nullable: true,
      resolve: (_p, _a, ctx) => ctx.event.headers.get('cookie'),
    }),

    authorization: t.string({
      nullable: true,
      resolve: (_p, _a, ctx) => ctx.event.headers.get('authorization'),
    }),
  }),
})

export const schema = builder.toSchema()
