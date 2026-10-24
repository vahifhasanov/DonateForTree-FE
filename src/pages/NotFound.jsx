import Button from '../components/Button.jsx'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <section
      className={styles.page}
      aria-labelledby="not-found-heading"
      lang="uk"
    >
      <p className={styles.code}>404</p>
      <h1 id="not-found-heading">Сторінку не знайдено</h1>
      <p className={styles.description}>
        На жаль, такої сторінки не існує або її було переміщено
      </p>
      <Button to="/" className={styles.home}>
        Повернутися на головну
      </Button>
    </section>
  )
}
