<script setup lang="ts">
const query = gql`
  query test($name: String!) {
    hello(name: $name)
  }
`

const { data: asyncQueryDaya } = useAsyncQuery(query, { name: 'one' })
const { data } = useAsyncData(() => useQuery(query, { name: 'two' }))
</script>

<template>
  <div> AsyncQuery: {{ asyncQueryDaya.hello }} </div>
  <div> Query: {{ data.hello }} </div>
</template>
