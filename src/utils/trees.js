export const PRICE_PER_TREE = 150
export const MAX_TREES = 100
export const SPECIES = ['Oak', 'Maple', 'Pine', 'Other']
export const REGIONS = [
  {
    id: 'zakarpattia',
    name: 'Zakarpattia oblast',
    location: 'Uzhhorod',
    coordinates: [48.62, 22.3],
  },
  {
    id: 'lviv',
    name: 'Lviv oblast',
    location: 'Lviv',
    coordinates: [49.84, 24.03],
  },
  {
    id: 'kyiv',
    name: 'Kyiv oblast',
    location: 'Kyiv',
    coordinates: [50.45, 30.52],
  },
  {
    id: 'ivano-frankivsk',
    name: 'Ivano-Frankivsk oblast',
    location: 'Ivano-Frankivsk',
    coordinates: [48.92, 24.71],
  },
]

// Curated demonstration points within each oblast. Never confirmed planting sites.
const DEMO_POINTS = {
  zakarpattia: [
    [48.62, 22.3],
    [48.448, 22.719],
    [48.181, 23.297],
  ],
  lviv: [
    [49.84, 24.03],
    [49.35, 23.51],
    [50.06, 23.39],
  ],
  kyiv: [
    [50.35, 30.95],
    [50.18, 30.31],
    [49.8, 30.12],
  ],
  'ivano-frankivsk': [
    [48.92, 24.71],
    [48.53, 25.04],
    [48.56, 24.42],
  ],
}
export function plantingCoordinates(region, index) {
  const points = DEMO_POINTS[region]
  if (!points) throw new Error('Unknown planting region')
  return [...points[index % points.length]]
}

export function validatePlanting({ quantity, species, region }) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TREES) {
    return `Choose a whole number of trees from 1 to ${MAX_TREES}.`
  }
  if (!SPECIES.includes(species)) return 'Choose a valid tree species.'
  if (!REGIONS.some((item) => item.id === region))
    return 'Choose a valid region.'
  return ''
}

export function validateCredentials({ name, email, password }, signup = false) {
  if (
    signup &&
    (typeof name !== 'string' ||
      name.trim().length < 2 ||
      name.trim().length > 60)
  )
    return 'Name must contain 2–60 characters.'
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    return 'Enter a valid email address.'
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128
  )
    return 'Password must contain 8–128 characters.'
  return ''
}

export function regionName(id) {
  return REGIONS.find((region) => region.id === id)?.name ?? id
}

export function filterTrees(
  trees,
  { search = '', region = '', species = '', year = '' },
) {
  const query = search.trim().toLocaleLowerCase()
  return trees.filter(
    (tree) =>
      (!region || tree.region === region) &&
      (!species || tree.species === species) &&
      (!year || tree.plantedAt.slice(0, 4) === year) &&
      (!query ||
        [tree.id, tree.species, regionName(tree.region), tree.location]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query)),
  )
}

export function treeStats(trees) {
  return trees.reduce(
    (stats, tree) => ({
      count: stats.count + tree.quantity,
      total: stats.total + tree.total,
      regions: new Set([...stats.regions, tree.region]),
    }),
    { count: 0, total: 0, regions: new Set() },
  )
}

export function isTree(tree) {
  return Boolean(
    tree &&
    typeof tree.id === 'string' &&
    typeof tree.userId === 'string' &&
    typeof tree.location === 'string' &&
    !validatePlanting(tree) &&
    typeof tree.plantedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(tree.plantedAt) &&
    !Number.isNaN(Date.parse(tree.plantedAt)) &&
    tree.total === tree.quantity * PRICE_PER_TREE &&
    Array.isArray(tree.coordinates) &&
    tree.coordinates.length === 2 &&
    tree.coordinates.every(Number.isFinite) &&
    Math.abs(tree.coordinates[0]) <= 90 &&
    Math.abs(tree.coordinates[1]) <= 180,
  )
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(date))
}
