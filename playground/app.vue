<script setup lang="ts">
const queryUser = gqluser(/* GraphQL */`
  query QueryUser {
    user(id: "1") {
      name
      id
    }
  }
`)

const query = gqlhello(/* GraphQL */`
  query QueryHello {
    hello(name: "Teages")
  }
`)

const { data: helloData } = await useAsyncQuery(query)
const { data: userData } = await useAsyncQuery(queryUser)
</script>

<template>
  <div>
    <p>
      helloData: {{ helloData }}
    </p>
    <p>
      userData: {{ userData }}
    </p>
  </div>
</template>
