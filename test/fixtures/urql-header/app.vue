<script setup lang="ts">
const query = gql`
  query testHeader {
    authorization
  }
`

const { data, error } = useAsyncQuery(query)
</script>

<template>
  <div v-if="!error">
    Authorization: {{ data.authorization }}
  </div>
</template>
