import { useState } from 'react'
import PageIntro from '../components/PageIntro.jsx'
import TreeCard from '../components/TreeCard.jsx'
import treeIcon from '../assets/design/stat-trees.png'
import donatedIcon from '../assets/design/stat-donated.png'
import carbonIcon from '../assets/design/stat-carbon.png'
import styles from './Trees.module.css'
const stats = [
  ['12', 'Trees planted', treeIcon],
  ['1800 UAH', 'Total donated', donatedIcon],
  ['240 Kg', 'CO2 absorbed', carbonIcon],
]
const trees = [2351, 2352, 2353].map((id) => ({ id, location: 'Uzhorod' }))
export default function Trees() {
  const [view, setView] = useState('All trees')
  return (
    <section className={styles.page}>
      <PageIntro title="My trees">
        Here you can see all trees you have planted
      </PageIntro>
      <dl className={styles.stats}>
        {stats.map(([value, label, icon]) => (
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
        {view !== 'All trees' && (
          <h2 className={styles.group}>
            {view === 'By region' ? 'Uzhorod · Zakarpattia oblast' : 'Oak'}
          </h2>
        )}
        <div className={styles.cards}>
          {trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      </div>
      <p className={styles.demo}>
        Demo collection and statistics. No user account or donation history is
        connected.
      </p>
    </section>
  )
}
