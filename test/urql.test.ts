import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('urql', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/urql', import.meta.url)),
  })

  it('useQuery and useAsyncQuery', async () => {
    const html = await $fetch('/hello')
    expect(html).toContain('AsyncQuery: hello, one')
    expect(html).toContain('Query: hello, two')
    expect(html).toContain('AsyncWithGettersQuery: hello, three')
    expect(html).toContain('AsyncWithComputedQuery: hello, four')
  })

  it('useMutation', async () => {
    const html = await $fetch('/again')
    expect(html).toContain('Mutation: hello two from mutation')
  })

  it('server', async () => {
    const data = await $fetch('/api/hello')
    expect(data).toEqual({ hello: 'hello, server' })
  })
})
