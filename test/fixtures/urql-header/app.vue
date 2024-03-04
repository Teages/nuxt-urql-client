<script setup lang="ts">
const query = gqlauth(/* GraphQL */`
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
