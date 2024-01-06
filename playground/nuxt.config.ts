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
  },
  devtools: { enabled: true },
})
