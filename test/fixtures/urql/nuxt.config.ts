export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      hello: {
        url: 'https://graphql-test.teages.xyz/graphql-hello',
      },
    },
  },
})
