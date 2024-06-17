export default defineNuxtConfig({
  modules: ['../src/module'],
  urqlClient: {
    clients: {
      hello: {
        url: 'https://graphql-test.teages.xyz/graphql-hello',
      },
      user: {
        url: 'https://graphql-test.teages.xyz/graphql-user',
      },
      auth: {
        url: 'https://graphql-test.teages.xyz/graphql-auth',
        credentials: 'same-origin',
        cookiesFilter: ['locale'],
        fetchOptions: {
          headers: {
            Authorization: 'Bearer 123',
          },
        },
      },
    },
  },

  devtools: { enabled: true },
})
