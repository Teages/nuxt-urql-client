<script setup lang="ts">
const { client, gql } = useUrql()

const query = gql`
  query latestFirm {
    allFilms (first: 1) {
      films {
        title
        created
      }
    }
  }
`

const { data } = useAsyncData(async () => {
  const { data } = await client.query(query, {}).toPromise()
  return data
})
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
