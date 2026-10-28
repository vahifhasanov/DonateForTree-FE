import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import image from '../assets/design/map.png'
import styles from './Map.module.css'
export default function Map() {
  return (
    <section className={styles.page}>
      <div
        className={styles.map}
        role="img"
        aria-label="Static map of Ukraine with demonstration clusters of 52, 34 and 10 trees"
      >
        <div className={styles.mapScene}>
          <img src={image} alt="" />
          <span className={styles.large}>52</span>
          <span className={styles.medium}>34</span>
          <span className={styles.small}>10</span>
        </div>
      </div>
      <form
        className={styles.filters}
        aria-labelledby="map-heading"
        aria-describedby="map-demo"
        onSubmit={(event) => event.preventDefault()}
      >
        <h1 id="map-heading">Tree map</h1>
        <FormField
          className={styles.location}
          label="Location"
          type="search"
          name="location"
          placeholder="Select location..."
        />
        <FormField label="Region" name="region">
          <option value="">All regions</option>
          <option value="zakarpattia">Zakarpattia oblast</option>
        </FormField>
        <FormField label="Tree species" name="species">
          <option value="">All species</option>
          <option>Oak</option>
          <option>Maple</option>
          <option>Pine</option>
        </FormField>
        <FormField label="Year" name="year">
          <option value="">All years</option>
          <option>2026</option>
        </FormField>
        <Button type="submit">Apply filters</Button>
        <p id="map-demo" className={styles.demo}>
          Static map preview. Filters do not query or update data.
        </p>
      </form>
    </section>
  )
}
