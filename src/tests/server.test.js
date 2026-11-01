import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createDemoApi } from '../../mock/server.js'
import { filterTrees, treeStats } from '../utils/trees.js'

let server, base, directory, database, token, createdId
async function start() {
  server = createDemoApi(database)
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  base = `http://127.0.0.1:${server.address().port}`
}
async function call(path, body, options = {}) {
  const response = await fetch(`${base}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.key ? { 'Idempotency-Key': options.key } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  return { status: response.status, data: await response.json() }
}
beforeAll(async () => {
  mkdirSync('.tmp', { recursive: true })
  directory = mkdtempSync(resolve('.tmp/api-test-'))
  database = resolve(directory, 'db.json')
  await start()
})
afterAll(async () => {
  if (server) await new Promise((done) => server.close(done))
  if (directory) rmSync(directory, { recursive: true, force: true })
})

describe('Live local HTTP API', () => {
  test('GET starts empty and and blocks private database endpoints', async () => {
    expect((await call('/trees')).data).toEqual([])
    expect((await call('/users')).status).toBe(404)
    expect((await call('/db')).status).toBe(404)
    expect((await call('/my-trees')).status).toBe(401)
    expect(
      (
        await call(
          '/trees',
          { quantity: 1, species: 'Oak', region: 'kyiv' },
          { key: 'unauthorized' },
        )
      ).status,
    ).toBe(401)
  })
  test('registers normalized email, stores no cleartext password and prevents duplicates', async () => {
    const result = await call('/auth/register', {
      name: 'Test Gardener',
      email: 'TEST@example.com',
      password: 'Example123!',
    })
    expect(result.status).toBe(201)
    expect(result.data.user.email).toBe('test@example.com')
    expect(result.data.user.passwordHash).toBeUndefined()
    token = result.data.token
    expect(readFileSync(database, 'utf8')).not.toContain('Example123!')
    expect(
      (
        await call('/auth/register', {
          name: 'Other',
          email: 'test@example.com',
          password: 'Example123!',
        })
      ).status,
    ).toBe(409)
    expect(
      (
        await call('/auth/register', {
          name: '',
          email: 'invalid',
          password: 'bad',
        })
      ).status,
    ).toBe(400)
  })
  test('validates password and restores the current user', async () => {
    expect(
      (
        await call('/auth/login', {
          email: 'test@example.com',
          password: 'Wrong123!',
        })
      ).status,
    ).toBe(401)
    expect((await call('/auth/me', undefined, { token })).data.name).toBe(
      'Test Gardener',
    )
    expect((await call('/my-trees', undefined, { token })).data).toEqual([])
  })
  test('POST validates quantities and derives cost, owner and coordinates', async () => {
    const payload = {
      quantity: 5,
      species: 'Maple',
      region: 'lviv',
      total: 1,
      userId: 'someone-else',
    }
    const result = await call('/trees', payload, {
      token,
      key: 'planting-test-1',
    })
    expect(result.status).toBe(201)
    createdId = result.data.id
    expect(result.data.total).toBe(750)
    expect(result.data.userId).not.toBe('someone-else')
    expect(result.data.coordinates[0]).toBeCloseTo(49.84, 0)
    expect(
      (
        await call(
          '/trees',
          { ...payload, quantity: 0 },
          { token, key: 'invalid-test' },
        )
      ).status,
    ).toBe(400)
    expect(
      (
        await call(
          '/trees',
          { ...payload, quantity: 1.5 },
          { token, key: 'invalid-test' },
        )
      ).status,
    ).toBe(400)
    expect(
      (
        await call(
          '/trees',
          { ...payload, species: 'Unknown' },
          { token, key: 'invalid-test' },
        )
      ).status,
    ).toBe(400)
  })
  test('a repeated request creates exactly one record; changed payload is rejected', async () => {
    const payload = { quantity: 5, species: 'Maple', region: 'lviv' }
    expect(
      (await call('/trees', payload, { token, key: 'planting-test-1' })).data
        .id,
    ).toBe(createdId)
    expect((await call('/my-trees', undefined, { token })).data).toHaveLength(1)
    expect(
      (
        await call(
          '/trees',
          { ...payload, quantity: 6 },
          { token, key: 'planting-test-1' },
        )
      ).status,
    ).toBe(409)
    expect((await call(`/trees/${createdId}`)).data.quantity).toBe(5)
  })
  test('each account only receives its own private collection and logout revokes token', async () => {
    const demo = (
      await call('/auth/login', {
        email: 'demo@example.com',
        password: 'DemoTree2026!',
      })
    ).data
    const own = (await call('/my-trees', undefined, { token: demo.token })).data
    expect(own).toEqual([])
    expect(own.every((tree) => tree.userId === 'demo')).toBe(true)
    const secondPlant = await call(
      '/trees',
      { quantity: 2, species: 'Pine', region: 'kyiv' },
      { token: demo.token, key: 'second-owner-plant' },
    )
    expect(secondPlant.status).toBe(201)
    expect(
      (await call('/my-trees', undefined, { token: demo.token })).data.map(
        (tree) => tree.id,
      ),
    ).toEqual([secondPlant.data.id])
    const first = (await call('/my-trees', undefined, { token })).data
    expect(first.map((tree) => tree.id)).toEqual([createdId])
    expect(treeStats(first).count).toBe(5)
    expect(treeStats(first).total).toBe(750)
    const publicTrees = (await call('/trees')).data
    expect(publicTrees).toHaveLength(2)
    expect(
      filterTrees(publicTrees, { region: 'kyiv', species: 'Pine' }).map(
        (tree) => tree.id,
      ),
    ).toEqual([secondPlant.data.id])
    await call('/auth/logout', {}, { token: demo.token })
    expect(
      (await call('/auth/me', undefined, { token: demo.token })).status,
    ).toBe(401)
  })
  test('data and credentials survive API restart; old sessions require login again', async () => {
    await new Promise((done) => server.close(done))
    await start()
    expect(
      (await call('/trees')).data.some((tree) => tree.id === createdId),
    ).toBe(true)
    expect((await call('/auth/me', undefined, { token })).status).toBe(401)
    const login = await call('/auth/login', {
      email: 'test@example.com',
      password: 'Example123!',
    })
    expect(login.status).toBe(200)
    expect(
      (await call('/my-trees', undefined, { token: login.data.token })).data[0]
        .id,
    ).toBe(createdId)
  })
})
