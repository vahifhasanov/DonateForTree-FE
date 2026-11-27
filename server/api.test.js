import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { scryptSync } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { createApi } from './index.js'

let directory, database, server, base
beforeEach(() => {
  mkdirSync('.tmp', { recursive: true })
  directory = mkdtempSync(resolve('.tmp/express-test-'))
  database = resolve(directory, 'db.json')
})
afterEach(async () => {
  vi.restoreAllMocks()
  if (server?.listening) await new Promise((done) => server.close(done))
  server = null
  rmSync(directory, { recursive: true, force: true })
})
async function start() {
  server = createApi(database)
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  base = `http://127.0.0.1:${server.address().port}`
}
async function call(path, { body, token, key, headers, method } = {}) {
  const response = await fetch(base + path, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}),
      ...headers,
    },
    ...(body === undefined
      ? {}
      : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  })
  const raw = await response.text()
  return {
    status: response.status,
    headers: response.headers,
    data: raw ? JSON.parse(raw) : null,
  }
}
const credentials = {
  name: 'Gardener',
  email: 'gardener@example.com',
  password: 'Example123!',
}
const planting = { quantity: 3, species: 'Oak', region: 'kyiv' }
async function register() {
  return (await call('/auth/register', { body: credentials })).data
}

test('new accounts store bcrypt hashes and only expose public user fields', async () => {
  await start()
  const session = await register()
  expect(session.token).toMatch(/^[a-f0-9]{64}$/)
  expect(Object.keys(session.user).sort()).toEqual(['email', 'id', 'name'])
  const saved = JSON.parse(readFileSync(database, 'utf8')).users.find(
    (u) => u.id === session.user.id,
  )
  expect(saved.passwordHash).toMatch(/^\$2[aby]\$10\$/)
  expect(bcrypt.compareSync(credentials.password, saved.passwordHash)).toBe(
    true,
  )
  expect(saved.password).toBeUndefined()
})

test.each([
  null,
  [],
  'broken JSON',
  { ...credentials, password: 'я'.repeat(37) },
])('rejects malformed registration %j', async (body) => {
  await start()
  const result = await call('/auth/register', { body })
  expect(result.status).toBe(400)
  expect(typeof result.data.message).toBe('string')
})

test('rejects oversized JSON, unknown regions, missing keys and unknown endpoints', async () => {
  await start()
  expect(
    (
      await call('/auth/register', {
        body: { ...credentials, name: 'a'.repeat(17000) },
      })
    ).status,
  ).toBe(413)
  const { token } = await register()
  expect((await call('/trees', { body: planting, token })).status).toBe(400)
  expect(
    (
      await call('/trees', {
        body: { ...planting, region: 'unknown' },
        token,
        key: 'valid-key-123',
      })
    ).status,
  ).toBe(400)
  expect((await call('/trees/missing')).status).toBe(404)
  expect((await call('/unknown', { body: {} })).status).toBe(404)
})

test('rejects invalid, expired and revoked tokens on protected routes', async () => {
  await start()
  for (const path of ['/auth/me', '/my-trees', '/auth/logout']) {
    expect(
      (
        await call(path, {
          token: 'invalid',
          ...(path.endsWith('logout') ? { body: {} } : {}),
        })
      ).status,
    ).toBe(401)
  }
  const { token } = await register()
  const now = Date.now()
  vi.spyOn(Date, 'now').mockReturnValue(now + 86400001)
  expect((await call('/auth/me', { token })).status).toBe(401)
  vi.restoreAllMocks()
  const login = await call('/auth/login', { body: credentials })
  expect(login.status).toBe(200)
  expect(login.data.token).not.toBe(token)
  expect(
    (await call('/auth/logout', { token: login.data.token, body: {} })).status,
  ).toBe(200)
  expect((await call('/auth/me', { token: login.data.token })).status).toBe(401)
})

test('CORS supports localhost preflight and excludes external origins', async () => {
  await start()
  const result = await call('/trees', {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173' },
  })
  expect(result.status).toBe(204)
  expect(result.headers.get('access-control-allow-origin')).toBe(
    'http://localhost:5173',
  )
  expect(result.headers.get('access-control-allow-headers')).toContain(
    'Idempotency-Key',
  )
  expect(
    (await call('/trees', { headers: { Origin: 'https://example.com' } }))
      .status,
  ).toBe(403)
})

test('idempotency survives restart, handles concurrent retries and is scoped per user', async () => {
  await start()
  const first = await register()
  const second = (
    await call('/auth/register', {
      body: { ...credentials, email: 'second@example.com' },
    })
  ).data
  const options = {
    body: planting,
    token: first.token,
    key: 'same-planting-key',
  }
  const results = await Promise.all([
    call('/trees', options),
    call('/trees', options),
  ])
  expect(results.map((r) => r.status).sort()).toEqual([200, 201])
  expect(results[0].data.id).toBe(results[1].data.id)
  expect(results[0].data.requestKey).toBeUndefined()
  const other = await call('/trees', { ...options, token: second.token })
  expect(other.status).toBe(201)
  expect(other.data.id).not.toBe(results[0].data.id)
  await new Promise((done) => server.close(done))
  await start()
  const login = await call('/auth/login', { body: credentials })
  const retry = await call('/trees', { ...options, token: login.data.token })
  expect(retry.status).toBe(200)
  expect(retry.data.id).toBe(results[0].data.id)
  expect(
    (await call('/my-trees', { token: login.data.token })).data,
  ).toHaveLength(1)
})

test.each(['plaintext', 'scrypt'])(
  'preserves legacy %s accounts and plantings while migrating hashes',
  async (format) => {
    const salt = 'legacy-salt'
    const user = {
      id: 'legacy',
      name: credentials.name,
      email: credentials.email,
      ...(format === 'plaintext'
        ? { password: credentials.password }
        : {
            salt,
            passwordHash: scryptSync(credentials.password, salt, 64).toString(
              'hex',
            ),
          }),
    }
    const trees = [
      {
        ...planting,
        id: 'preserved',
        userId: 'legacy',
        requestKey: 'old-request',
      },
    ]
    writeFileSync(database, JSON.stringify({ users: [user], trees }))
    await start()
    const login = await call('/auth/login', { body: credentials })
    expect(login.status).toBe(200)
    const db = JSON.parse(readFileSync(database, 'utf8'))
    expect(db.users.find((u) => u.id === 'legacy').passwordHash).toMatch(
      /^\$2[aby]\$/,
    )
    expect(readFileSync(database, 'utf8')).not.toContain(credentials.password)
    expect(db.trees).toEqual(trees)
  },
)

test('failed writes return 500 without leaking paths or retaining an unsaved record', async () => {
  await start()
  const { token } = await register()
  mkdirSync(database + '.tmp') // A directory prevents the atomic temporary-file write.
  const result = await call('/trees', {
    body: planting,
    token,
    key: 'write-failure-key',
  })
  expect(result.status).toBe(500)
  expect(result.data.message).not.toContain(directory)
  expect((await call('/my-trees', { token })).data).toEqual([])
  const failedSignup = await call('/auth/register', {
    body: { ...credentials, email: 'unsaved@example.com' },
  })
  expect(failedSignup.status).toBe(500)
  expect(
    (
      await call('/auth/login', {
        body: { ...credentials, email: 'unsaved@example.com' },
      })
    ).status,
  ).toBe(401)
})
