export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      hello: {
        url: 'https://graphql-test.teages.xyz/graphql-hello',
      },
      auth: {
        url: 'https://graphql-test.teages.xyz/graphql-auth',
        credentials: 'same-origin',
        cookiesFilter: ['test_only'],
      },
    },
  },
})
