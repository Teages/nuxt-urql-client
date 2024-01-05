export default defineNuxtConfig({
  modules: ['../src/module'],
  urqlClient: {
    clients: {
      default: {
        url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
      },
      cytoid: {
        url: 'https://services.cytoid.io/graphql',
      },
    },
  },
  devtools: { enabled: true },
})
