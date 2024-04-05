<script setup lang="ts">
const query = gqlhello(/* GraphQL */`
  query test($name: String!) {
    hello(name: $name)
  }
`)

const { data: asyncQueryDaya } = await useAsyncQuery(query, { name: 'one' })
const { data } = await useAsyncData(() => useQuery(query, { name: 'two' }))

const { data: asyncWithGettersQueryData } = await useAsyncQuery(query, () => ({ name: 'three' }))
const v = computed(() => ({ name: 'four' }))
const { data: asyncWithComputedQueryData } = await useAsyncQuery(query, v)
</script>

<template>
  <div> AsyncQuery: {{ asyncQueryDaya.hello }} </div>
  <div> Query: {{ data.hello }} </div>

  <div> AsyncWithGettersQuery: {{ asyncWithGettersQueryData.hello }} </div>
  <div> AsyncWithComputedQuery: {{ asyncWithComputedQueryData.hello }} </div>
</template>
