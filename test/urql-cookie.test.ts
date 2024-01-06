import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('urql-cookie', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/urql-cookie', import.meta.url)),
  })

  it('header Authorization', async () => {
    const html = await $fetch('/', {
      headers: {
        cookie: 'token=123',
      },
    })
    expect(html).toContain('Cookies: token=123')
  })
})
