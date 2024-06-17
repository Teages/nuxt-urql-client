<script setup lang="ts">
const { useAsyncQuery } = useUrql('auth')

const query = gql(`
  query Auth {
    authorization
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
