export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      default: {
        url: '/graphql',
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
