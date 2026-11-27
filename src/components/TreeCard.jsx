import Button from './Button.jsx'
import image from '../assets/design/tree-photo.png'
import oak from '../assets/design/oak.png'
import maple from '../assets/design/maple.png'
import pine from '../assets/design/pine.png'
import other from '../assets/design/other.png'
import { formatDate, regionName } from '../utils/trees.js'
import styles from './TreeCard.module.css'
export default function TreeCard({ tree }) {
  return (
    <article className={styles.card} aria-labelledby={`tree-${tree.id}`}>
      <img
        src={image}
        className={styles.photo}
        alt="Sunlight passing through the branches of a mature oak"
      />
      <div className={styles.details}>
        <h2 id={`tree-${tree.id}`}>
          {tree.species} · {tree.quantity}{' '}
          {tree.quantity === 1 ? 'tree' : 'trees'}
        </h2>
        <img
          src={
            { Oak: oak, Maple: maple, Pine: pine, Other: other }[tree.species]
          }
          className={styles.species}
          alt=""
        />
        <p>
          {tree.location} · {regionName(tree.region)}
        </p>
        <time dateTime={tree.plantedAt}>{formatDate(tree.plantedAt)}</time>
        <p>
          Status:
          <br />
          Demo planting saved
        </p>
      </div>
      <Button
        to={`/map?tree=${encodeURIComponent(tree.id)}`}
        className={styles.button}
        aria-label={`View tree ${tree.id} on map`}
      >
        View on map
      </Button>
    </article>
  )
}
