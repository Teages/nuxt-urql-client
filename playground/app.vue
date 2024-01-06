<script setup lang="ts">
const query = gql`
  query test {
    hello(name: "Teages")
    cookie
    authorization
  }
`

const { data, error } = useAsyncQuery(query)
</script>

<template>
  <div v-if="!error">
    {{ data }}
  </div>
  <div v-else>
    {{ error }}
  </div>
</template>
