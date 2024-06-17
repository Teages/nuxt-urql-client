import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('config-override', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/config-override', import.meta.url)),
  })

  it('config override', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Authorization: Bearer 456')
  })
})
