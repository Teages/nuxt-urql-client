<script setup lang="ts">
const query = gql`
  query testCookie {
    cookie
  }
`

const { data, error } = useAsyncQuery(query)
</script>

<template>
  <div v-if="!error">
    Cookies: {{ data.cookie }}
  </div>
</template>
