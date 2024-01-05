import { defineNuxtPlugin } from '#app'
import { urqlClientOptions as options } from '#build/urql-client/options'

export default defineNuxtPlugin((_nuxtApp) => {
  // eslint-disable-next-line no-console
  console.log('options', options)
})
