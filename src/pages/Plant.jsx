import { useState } from 'react'
import PageIntro from '../components/PageIntro.jsx'
import FormField from '../components/FormField.jsx'
import Button from '../components/Button.jsx'
import { usePlantTree } from '../hooks/usePlantTree.js'
import {
  MAX_TREES,
  PRICE_PER_TREE,
  REGIONS,
  SPECIES,
  regionName,
  validatePlanting,
} from '../utils/trees.js'
import oak from '../assets/design/oak.png'
import maple from '../assets/design/maple.png'
import pine from '../assets/design/pine.png'
import other from '../assets/design/other.png'
import styles from './Plant.module.css'

const images = { Oak: oak, Maple: maple, Pine: pine, Other: other }
export default function Plant() {
  const [amount, setAmount] = useState('1')
  const [custom, setCustom] = useState('')
  const [species, setSpecies] = useState('Oak')
  const [region, setRegion] = useState('zakarpattia')
  const [review, setReview] = useState(false)
  const [validation, setValidation] = useState('')
  const { mutate, loading, error, data, reset } = usePlantTree()
  const quantity =
    amount === 'custom' ? Number(custom) / PRICE_PER_TREE : Number(amount)
  const payload = { quantity, species, region }
  const invalid = validatePlanting(payload)
  async function submit(event) {
    event.preventDefault()
    setValidation(invalid)
    if (invalid) return
    if (!review) {
      setReview(true)
      return
    }
    await mutate(payload)
  }
  return (
    <section className={styles.page}>
      <PageIntro title="Plant a tree">
        Choose how many trees, their species and planting region
      </PageIntro>
      {data ? (
        <div className={`${styles.card} ${styles.success}`} role="status">
          <h2>Demo planting saved!</h2>
          <p>
            {data.quantity} {data.species} trees · {regionName(data.region)} ·{' '}
            {data.total} UAH
          </p>
          <p>No payment was taken. This is a demonstration record.</p>
          <Button to="/trees">My trees</Button>
          <Button to={`/map?tree=${encodeURIComponent(data.id)}`}>
            View on map
          </Button>
          <Button
            onClick={() => {
              reset()
              setReview(false)
              setValidation('')
            }}
          >
            Plant more trees
          </Button>
        </div>
      ) : (
        <form
          className={styles.card}
          aria-label="Planting"
          aria-describedby="plant-demo"
          onSubmit={submit}
        >
          <fieldset disabled={loading || review}>
            <legend>1. Choose tree amount</legend>
            <div className={styles.amounts}>
              {[1, 5, 10].map((count) => (
                <label className={styles.option} key={count}>
                  <input
                    type="radio"
                    name="amount"
                    value={count}
                    checked={amount === String(count)}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <span>
                    {count} {count === 1 ? 'tree' : 'trees'}
                  </span>
                  <small>{count * PRICE_PER_TREE} uah</small>
                </label>
              ))}
              <div className={styles.option}>
                <label className={styles.customLabel}>
                  <input
                    type="radio"
                    name="amount"
                    value="custom"
                    checked={amount === 'custom'}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <span>Custom</span>
                </label>
                <div className={styles.custom}>
                  <input
                    aria-label="Custom amount in UAH"
                    type="number"
                    min={PRICE_PER_TREE}
                    max={MAX_TREES * PRICE_PER_TREE}
                    step={PRICE_PER_TREE}
                    value={custom}
                    required={amount === 'custom'}
                    disabled={loading || review || amount !== 'custom'}
                    onChange={(event) => setCustom(event.target.value)}
                  />
                  <span>uah</span>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset disabled={loading || review}>
            <legend>2. Choose tree species</legend>
            <div className={styles.species}>
              {SPECIES.map((name) => (
                <label className={styles.option} key={name}>
                  <input
                    type="radio"
                    name="species"
                    value={name}
                    checked={species === name}
                    onChange={() => setSpecies(name)}
                    aria-label={name}
                  />
                  <img src={images[name]} alt="" />
                  <span className={styles.speciesName}>{name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className={styles.region}>
            <FormField
              label="3. Choose region"
              name="region"
              value={region}
              disabled={loading || review}
              onChange={(event) => setRegion(event.target.value)}
            >
              {REGIONS.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </FormField>
            <p>
              Demo planting location:
              <br />
              <span>
                {REGIONS.find((place) => place.id === region)?.location}
              </span>
            </p>
          </div>
          <p className={styles.summary} aria-live="polite">
            {invalid
              ? `Select 1–${MAX_TREES} trees. Custom amount must be a multiple of ${PRICE_PER_TREE} UAH.`
              : `${quantity} trees × ${PRICE_PER_TREE} UAH = ${quantity * PRICE_PER_TREE} UAH`}
          </p>
          <p id="plant-demo" className={styles.notice}>
            Demo planting only. No real payment or money transfer. Coordinates
            are approximate demonstration locations.
          </p>
          {review && (
            <div className={styles.review}>
              <h2>Review your planting</h2>
              <p>
                {quantity} {species} trees · {regionName(region)} · Total:{' '}
                {quantity * PRICE_PER_TREE} UAH
              </p>
              <Button disabled={loading} onClick={() => setReview(false)}>
                Edit selection
              </Button>
            </div>
          )}
          {(validation || error) && (
            <p className="form-error" role="alert">
              {validation || error}
            </p>
          )}
          <Button type="submit" className={styles.submit} disabled={loading}>
            {loading
              ? 'Saving…'
              : review
                ? 'Confirm demo planting'
                : 'Review planting'}
          </Button>
        </form>
      )}
    </section>
  )
}
