<script setup lang="ts">
const { useAsyncQuery } = useUrql('hello')

const query = gql(`
  query {
    hello
  }
`)

const { data, error, refresh } = await useAsyncQuery(query)
</script>

<template>
  <div>
    <div v-if="error">
      Error: {{ error }}
    </div>
    <div v-else>
      {{ data }}
    </div>
    <button @click="() => refresh()">
      Refresh
    </button>
  </div>
</template>
