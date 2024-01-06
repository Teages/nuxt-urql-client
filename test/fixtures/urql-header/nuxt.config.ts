export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      default: {
        url: '/graphql',
        fetchOptions: {
          headers: {
            Authorization: 'Bearer 123',
          },
        },
      },
    },
    codegen: {
      schemaOverride: '../../../schema/schema.graphql',
      watch: {
        extra: ['./schema.graphql'],
      },
    },
  },
})
