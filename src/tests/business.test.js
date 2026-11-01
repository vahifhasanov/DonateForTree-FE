import { describe, expect, test } from 'vitest'
import seed from '../../mock/migrations/legacy-trees.json'
import {
  filterTrees,
  isTree,
  treeStats,
  validateCredentials,
  validatePlanting,
} from '../utils/trees.js'

describe('Planting business rules', () => {
  test.each([0, -1, 1.5, 101, NaN, Infinity, '5', null])(
    'rejects invalid tree count %s',
    (quantity) => {
      expect(
        validatePlanting({ quantity, species: 'Oak', region: 'kyiv' }),
      ).not.toBe('')
    },
  )
  test.each([1, 5, 100])('accepts whole quantity %s', (quantity) => {
    expect(
      validatePlanting({ quantity, species: 'Maple', region: 'lviv' }),
    ).toBe('')
  })
  test('rejects unknown species/region and corrupt server data', () => {
    expect(
      validatePlanting({ quantity: 2, species: 'Unknown', region: 'lviv' }),
    ).not.toBe('')
    expect(
      validatePlanting({ quantity: 2, species: 'Oak', region: 'unknown' }),
    ).not.toBe('')
    expect(seed.trees.every(isTree)).toBe(true)
    expect(isTree({ ...seed.trees[0], coordinates: [null, 100] })).toBe(false)
    expect(isTree({ ...seed.trees[0], total: 1 })).toBe(false)
    expect(isTree({ ...seed.trees[0], plantedAt: 'not-a-date' })).toBe(false)
  })
  test('calculates statistics from quantities rather than number of records', () => {
    const result = treeStats(
      seed.trees.filter((tree) => tree.userId === 'demo'),
    )
    expect(result.count).toBe(12)
    expect(result.total).toBe(1800)
    expect(result.regions.size).toBe(2)
    expect(treeStats([]).count).toBe(0)
  })
})

describe('Search and filters', () => {
  test('combines search, region, species and year', () => {
    expect(
      filterTrees(seed.trees, {
        search: '  UZHHOROD ',
        region: 'zakarpattia',
        species: 'Oak',
        year: '2026',
      }).map((tree) => tree.id),
    ).toEqual(['2351'])
  })
  test('searches species, region and ID, handles empty/no matches', () => {
    expect(filterTrees(seed.trees, { search: 'lviv' })).toHaveLength(2)
    expect(filterTrees(seed.trees, { search: 'pine' })).toHaveLength(2)
    expect(filterTrees(seed.trees, { search: '2353' })).toHaveLength(1)
    expect(filterTrees(seed.trees, { search: 'no such planting' })).toEqual([])
    expect(filterTrees(seed.trees, {})).toHaveLength(6)
    expect(filterTrees([], {})).toEqual([])
  })
})

describe('Demo credentials validation', () => {
  test('validates email, name and password before a request', () => {
    expect(
      validateCredentials(
        {
          name: 'Gardener',
          email: 'garden@example.com',
          password: 'Example123!',
        },
        true,
      ),
    ).toBe('')
    expect(
      validateCredentials({ email: 'bad-email', password: 'Example123!' }),
    ).toContain('email')
    expect(
      validateCredentials({ email: 'a@b.co', password: 'short' }),
    ).toContain('Password')
    expect(
      validateCredentials(
        { name: ' ', email: 'a@b.co', password: 'Example123!' },
        true,
      ),
    ).toContain('Name')
  })
})
