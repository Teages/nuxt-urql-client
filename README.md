# @teages/nuxt-urql-client

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A simple graphql (urql) client for Nuxt.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- ~~[Document: WIP](#)~~
## Setup

1. Add `@teages/nuxt-urql-client` and `graphql` dependency to your project

> **NOTE:** `graphql` is a peer dependency of `@teages/nuxt-urql-client` and must be installed separately.

```bash
# Using pnpm
pnpm add -D @teages/nuxt-urql-client graphql

# Using yarn
yarn add --dev @teages/nuxt-urql-client graphql

# Using npm
npm install --save-dev @teages/nuxt-urql-client graphql
```

2. Add `@teages/nuxt-urql-client` to the `modules` section of `nuxt.config.ts`, and configure it:

See [module options](/src/options.d.ts) for more options.

```ts
export default defineNuxtConfig({
  modules: [
    '@teages/nuxt-urql-client'
  ],
  urqlClient: {
    clients: {
      default: {
        url: '/graphql',
      },
    },
  },
})
```

> We suggest to use `@teages/nuxt-gql-client-codegen` to generate types for your graphql queries.

## Usage

```vue
<script setup lang="ts">
const query = gql(`
  query test {
    hello
  }
`)

const { data, error } = useAsyncQuery(query)

// same as
// const { data } = useAsyncData(() => useQuery(query))
</script>

<template>
  <div v-if="!error">
    {{ data }}
  </div>
  <div v-else>
    {{ error }}
  </div>
</template>
```

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@teages/nuxt-urql-client/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@teages/nuxt-urql-client

[npm-downloads-src]: https://img.shields.io/npm/dm/@teages/nuxt-urql-client.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@teages/nuxt-urql-client

[license-src]: https://img.shields.io/npm/l/@teages/nuxt-urql-client.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@teages/nuxt-urql-client

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
