import { afterEach, describe, expect, test, vi } from 'vitest'
import { request, saveToken } from '../api/client.js'
import { getTrees, plantTree } from '../api/trees.js'

afterEach(() => {
  vi.unstubAllGlobals()
  saveToken('')
})
describe('HTTP client and API validation', () => {
  test('sends real JSON POST parameters and auth header', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}'))
    vi.stubGlobal('fetch', fetch)
    saveToken('example-session')
    await request('/trees', {
      method: 'POST',
      body: { quantity: 5 },
      authenticated: true,
    })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/trees'),
      expect.objectContaining({
        method: 'POST',
        body: '{"quantity":5}',
        headers: expect.objectContaining({
          Authorization: 'Bearer example-session',
          'Content-Type': 'application/json',
        }),
      }),
    )
  })
  test.each(['', 'not json'])(
    'rejects empty/malformed response %s',
    async (body) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)))
      await expect(request('/trees')).rejects.toThrow(/empty|invalid JSON/)
    },
  )
  test('reports network and HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    )
    await expect(request('/trees')).rejects.toThrow('Cannot reach the API')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"message":"Please retry"}', { status: 503 }),
        ),
    )
    await expect(request('/trees')).rejects.toThrow('Please retry')
  })
  test('rejects invalid tree collections/POST data but accepts an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]')))
    expect(await getTrees()).toEqual([])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('[{"id":1}]')),
    )
    await expect(getTrees()).rejects.toThrow('invalid tree data')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
    await expect(plantTree({}, 'example-key')).rejects.toThrow(
      'invalid planting',
    )
  })
  test('honors request cancellation', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')),
    )
    await expect(
      request('/trees', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
