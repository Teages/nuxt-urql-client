export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      user: {
        url: 'https://graphql-test.teages.xyz/graphql-user',
      },
    },
  },
})
