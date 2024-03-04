export default defineNuxtConfig({
  modules: ['../src/module'],
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
      user: {
        url: 'https://graphql-test.teages.xyz/graphql-user',
        credentials: 'include',
        cookiesFilter: ['locale'],
        fetchOptions: {
          headers: {
            Authorization: 'Bearer 123',
          },
        },
      },
      // auth: {
      //   url: 'https://graphql-test.teages.xyz/graphql-auth',
      //   credentials: 'include',
      //   cookiesFilter: ['locale'],
      //   fetchOptions: {
      //     headers: {
      //       Authorization: 'Bearer 123',
      //     },
      //   },
      // },
    },
  },
  devtools: { enabled: true },
})
