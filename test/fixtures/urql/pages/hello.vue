<script setup lang="ts">
const query = gqlhello(/* GraphQL */`
  query test($name: String!) {
    hello(name: $name)
  }
`)

const { data: asyncQueryDaya } = await useAsyncQuery(query, { name: 'one' })
const { data } = await useAsyncData(() => useQuery(query, { name: 'two' }))
</script>

<template>
  <div> AsyncQuery: {{ asyncQueryDaya.hello }} </div>
  <div> Query: {{ data.hello }} </div>
</template>
