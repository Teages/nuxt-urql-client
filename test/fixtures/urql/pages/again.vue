<script setup lang="ts">
const mutation = gqlhello(/* GraphQL */`
  mutation testMutation($name: String!) {
    helloAgain(name: $name)
  }
`)

const { data } = useAsyncData(() => useMutation(mutation, { name: 'two' }))
</script>

<template>
  <div> Mutation: {{ data.helloAgain }} </div>
</template>
