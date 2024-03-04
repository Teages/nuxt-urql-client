import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('urql', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/urql-fragment', import.meta.url)),
  })

  it('fragment data', async () => {
    const html = await $fetch('/')
    expect(html).toContain('user: Teages (1)')
  })
})
