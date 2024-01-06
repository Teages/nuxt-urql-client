export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      default: {
        url: '/graphql',
        cookiesFilter: ['token'],
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
