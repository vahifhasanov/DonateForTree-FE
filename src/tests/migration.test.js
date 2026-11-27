import { describe, test, expect } from 'vitest'
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs'
import { resolve } from 'node:path'
import legacy from '../../mock/migrations/legacy-trees.json'
import { createDemoApi } from '../../mock/server.js'
import { plantingCoordinates, REGIONS } from '../utils/trees.js'

describe('Safe seed migration and geographical placement', () => {
  test('removes only exact legacy rows, preserves users and POST/edited records, backs up and is idempotent', () => {
    mkdirSync('.tmp', { recursive: true })
    const dir = mkdtempSync(resolve('.tmp/migration-'))
    try {
      const path = resolve(dir, 'db.json')
      const posted = {
        ...legacy.trees[0],
        id: 'posted',
        requestKey: 'real-post-key',
      }
      const edited = { ...legacy.trees[1], quantity: 10, total: 1500 }
      const db = {
        users: [{ id: 'demo', name: 'Preserved account' }],
        trees: [legacy.trees[0], posted, edited],
      }
      writeFileSync(path, JSON.stringify(db))
      createDemoApi(path)
      const migrated = JSON.parse(readFileSync(path, 'utf8'))
      expect(migrated.users).toEqual(db.users)
      expect(migrated.trees).toEqual([posted, edited])
      expect(
        readdirSync(dir).filter((file) => file.includes('before-seed-removal')),
      ).toHaveLength(1)
      createDemoApi(path)
      expect(JSON.parse(readFileSync(path, 'utf8')).trees).toEqual([
        posted,
        edited,
      ])
      expect(readdirSync(dir)).toHaveLength(2)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
  test('uses repeatable curated regional points, with no random drift', () => {
    for (const region of REGIONS) {
      expect(plantingCoordinates(region.id, 0)).toEqual(
        plantingCoordinates(region.id, 3),
      )
      expect(plantingCoordinates(region.id, 0)).not.toEqual(
        plantingCoordinates(region.id, 1),
      )
      expect(plantingCoordinates(region.id, 1).every(Number.isFinite)).toBe(
        true,
      )
    }
  })
})
