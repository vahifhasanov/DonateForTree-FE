import { useState } from 'react'
import PageIntro from '../components/PageIntro.jsx'
import TreeCard from '../components/TreeCard.jsx'
import RequestState from '../components/RequestState.jsx'
import TreeFilters from '../components/TreeFilters.jsx'
import Button from '../components/Button.jsx'
import { useMyTrees } from '../hooks/useTrees.js'
import { useTreeFilters } from '../hooks/useTreeFilters.js'
import { regionName, treeStats } from '../utils/trees.js'
import treeIcon from '../assets/design/stat-trees.png'
import donatedIcon from '../assets/design/stat-donated.png'
import carbonIcon from '../assets/design/stat-carbon.png'
import styles from './Trees.module.css'

export default function Trees() {
  const [view, setView] = useState('All trees')
  const { data, loading, error, refetch } = useMyTrees()
  const controls = useTreeFilters(data)
  const stats = treeStats(data)
  const groups = Object.groupBy(controls.filtered, (tree) =>
    view === 'By region'
      ? regionName(tree.region)
      : view === 'By species'
        ? tree.species
        : 'All trees',
  )
  return (
    <section className={styles.page}>
      <PageIntro title="My trees">
        Here you can see all trees you have planted
      </PageIntro>
      <RequestState loading={loading} error={error} retry={refetch} />
      {!loading && !error && (
        <>
          <dl className={styles.stats}>
            {[
              [stats.count, 'Demo trees', treeIcon],
              [`${stats.total} UAH`, 'Demo contributions', donatedIcon],
              [stats.regions.size, 'Planting regions', carbonIcon],
            ].map(([value, label, icon]) => (
              <div className={styles.stat} key={label}>
                <div className={styles.icon}>
                  <img src={icon} alt="" />
                </div>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.collection}>
            <div className={styles.tabs} role="group" aria-label="Tree display">
              {['All trees', 'By region', 'By species'].map((label) => (
                <button
                  type="button"
                  key={label}
                  aria-pressed={view === label}
                  onClick={() => setView(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <TreeFilters controls={controls} />
            {!data.length ? (
              <div className="request-state">
                <p>You have no trees yet. Create your first demo planting.</p>
                <Button to="/plant">Plant a tree</Button>
              </div>
            ) : !controls.filtered.length ? (
              <p className="request-state" role="status">
                No trees match your filters.
              </p>
            ) : (
              Object.entries(groups).map(([name, trees]) => (
                <section
                  key={name}
                  className={styles.treeGroup}
                  aria-label={name}
                >
                  {view !== 'All trees' && (
                    <h2 className={styles.group}>{name}</h2>
                  )}
                  <div className={styles.cards}>
                    {trees.map((tree) => (
                      <TreeCard key={tree.id} tree={tree} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
          <p className={styles.demo}>
            Statistics count saved demo trees, including all trees within each
            planting group. No real donations or measured CO₂ data.
          </p>
        </>
      )}
    </section>
  )
}
