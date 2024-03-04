<script setup lang="ts">
const query = gqlauth(/* GraphQL */`
  query testCookie {
    cookie
  }
`)

const { data, error } = await useAsyncQuery(query)
</script>

<template>
  <div v-if="!error">
    Cookies: {{ data.cookie }}
  </div>
</template>
