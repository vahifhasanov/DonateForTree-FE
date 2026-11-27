import { useSearchParams } from 'react-router-dom'
import TreeMap from '../components/TreeMap.jsx'
import TreeFilters from '../components/TreeFilters.jsx'
import RequestState from '../components/RequestState.jsx'
import { useTrees } from '../hooks/useTrees.js'
import { useTreeFilters } from '../hooks/useTreeFilters.js'
import { treeStats } from '../utils/trees.js'
import styles from './Map.module.css'

export default function Map() {
  const { data, loading, error, refetch } = useTrees()
  const controls = useTreeFilters(data)
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('tree')
  const selected = data.find((tree) => tree.id === selectedId)
  return (
    <section className={styles.page}>
      <aside className={styles.filters} aria-labelledby="map-heading">
        <h1 id="map-heading">Tree map</h1>
        <TreeFilters controls={controls} />
        <RequestState loading={loading} error={error} retry={refetch} />
        {!loading && !error && (
          <p role="status">
            {controls.filtered.length
              ? `${treeStats(controls.filtered).count} trees in ${controls.filtered.length} planting groups`
              : 'No trees match your filters.'}
          </p>
        )}
        {selectedId && !loading && !error && (
          <div className={styles.selection}>
            <p>
              {!selected
                ? 'The requested planting was not found.'
                : controls.filtered.some((tree) => tree.id === selectedId)
                  ? `Showing selected ${selected.species} planting.`
                  : 'The selected planting is hidden by your filters.'}
            </p>
            <button type="button" onClick={() => setParams({})}>
              Clear selected planting
            </button>
          </div>
        )}
        <p className={styles.demo}>
          Approximate demo coordinates in Ukraine. These are not confirmed real
          planting locations. Drag to move, scroll or use +/− to zoom. Markers
          support keyboard focus and Enter.
        </p>
      </aside>
      <TreeMap trees={controls.filtered} selectedId={selectedId} />
    </section>
  )
}
