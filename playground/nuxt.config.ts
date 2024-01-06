export default defineNuxtConfig({
  modules: ['../src/module'],
  urqlClient: {
    clients: {
      default: {
        url: '/graphql',
        credentials: 'include',
        cookiesFilter: [],
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
