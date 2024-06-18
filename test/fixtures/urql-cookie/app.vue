<script setup lang="ts">
const { useAsyncQuery } = useUrqlComposables('auth')

const query = gql(`
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
