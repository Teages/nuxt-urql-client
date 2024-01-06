import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('urql-header', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/urql-header', import.meta.url)),
  })

  it('header Authorization', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Authorization: Bearer 123')
  })
})
