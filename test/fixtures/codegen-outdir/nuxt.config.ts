export default defineNuxtConfig({
  modules: ['../../../src/module'],
  urqlClient: {
    clients: {
      hello: {
        url: 'https://graphql-test.teages.xyz/graphql-hello',
        credentials: 'include',
        cookiesFilter: ['locale'],
        fetchOptions: {
          headers: {
            Authorization: 'Bearer 123',
          },
        },
      },
    },
    codegen: { outputDir: '.gql' },
  },
})
