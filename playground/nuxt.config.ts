export default defineNuxtConfig({
  modules: ['../src/module'],
  urqlClient: {
    clients: {
      default: {
        url: '/graphql',
        credentials: 'include',
        cookiesFilter: ['locale'],
        fetchOptions: {
          headers: {
            Authorization: 'Bearer 123',
          },
        },
      },
    },
    codegen: {
      schemaOverride: '../schema/schema.graphql',
      watch: {
        extra: ['./schema.graphql'],
      },
    },
  },
  devtools: { enabled: true },
})
