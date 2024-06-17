<script setup lang="ts">
const { useAsyncQuery } = useUrql('auth')

const query = gql(`
  query testHeader {
    authorization
  }
`)

const { data, error } = await useAsyncQuery(query)
</script>

<template>
  <div v-if="!error">
    Authorization: {{ data.authorization }}
  </div>
</template>
