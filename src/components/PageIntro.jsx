import plant from '../../img/plant.png'
import styles from './PageIntro.module.css'
export default function PageIntro({ title, children }) {
  return (
    <div className={styles.intro}>
      <h1>{title}</h1>
      <p>{children}</p>
      <img src={plant} alt="" />
    </div>
  )
}
