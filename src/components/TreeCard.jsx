import Button from './Button.jsx'
import image from '../assets/design/tree-photo.png'
import oak from '../assets/design/oak.png'
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
        <h2 id={`tree-${tree.id}`}>Tree #{tree.id}</h2>
        <img src={oak} className={styles.species} alt="Oak" />
        <p>{tree.location}</p>
        <time dateTime="2026-09-23">23.09.2026</time>
        <p>
          Status:
          <br />
          Planted
        </p>
      </div>
      <Button
        to="/map"
        className={styles.button}
        aria-label={`View tree ${tree.id} on map`}
      >
        View on map
      </Button>
    </article>
  )
}
