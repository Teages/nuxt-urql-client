<script setup lang="ts">
const { useMutation } = useUrqlComposables('hello')

const mutation = gql(`
  mutation TestMutation($name: String!) {
    helloAgain(name: $name)
  }
`)

const { data } = useAsyncData(() => useMutation(mutation, { name: 'two' }))
</script>

<template>
  <div> Mutation: {{ data.helloAgain }} </div>
</template>
