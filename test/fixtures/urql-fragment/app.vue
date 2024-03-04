<script setup lang="ts">
const queryUser = gqluser(/* GraphQL */`
  query QueryUser {
    user(id: "1") {
      ...UserFragment
    }
  }
`)

const { data: userData } = await useAsyncQuery(queryUser)
</script>

<template>
  <div v-if="userData?.user">
    <User :user="userData.user" />
  </div>
</template>
