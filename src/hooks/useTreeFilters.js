import { useMemo, useState } from 'react'
import { filterTrees } from '../utils/trees.js'

const emptyFilters = { search: '', region: '', species: '', year: '' }
export function useTreeFilters(trees) {
  const [filters, setFilters] = useState(emptyFilters)
  const filtered = useMemo(() => filterTrees(trees, filters), [trees, filters])
  const years = useMemo(
    () =>
      [...new Set(trees.map((tree) => tree.plantedAt.slice(0, 4)))]
        .sort()
        .reverse(),
    [trees],
  )
  function change(event) {
    const { name, value } = event.target
    setFilters((previous) => ({ ...previous, [name]: value }))
  }
  return {
    filters,
    filtered,
    years,
    change,
    reset: () => setFilters(emptyFilters),
  }
}
