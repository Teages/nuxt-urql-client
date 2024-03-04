<script setup lang="ts">
const props = defineProps<{
  user: FragmentType<typeof UserFragment>
}>()

const UserFragment = gqluser(/* GraphQL */`
  fragment UserFragment on User {
    name
    id
  }
`)

const user = computed(() => getFragmentData(UserFragment, props.user))
</script>

<template>
  <div>
    user: {{ user.name }} ({{ user.id }})
  </div>
</template>
