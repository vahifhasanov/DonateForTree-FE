import { useState } from 'react'
import PageIntro from '../components/PageIntro.jsx'
import FormField from '../components/FormField.jsx'
import Button from '../components/Button.jsx'
import oak from '../assets/design/oak.png'
import maple from '../assets/design/maple.png'
import pine from '../assets/design/pine.png'
import other from '../assets/design/other.png'
import styles from './Plant.module.css'
const species = [
  ['Oak', oak],
  ['Maple', maple],
  ['Pine', pine],
  ['Other', other],
]

export default function Plant() {
  const [amount, setAmount] = useState('')
  return (
    <section className={styles.page}>
      <PageIntro title="Plant a tree">
        Choose what amount and species of trees you want to plant
      </PageIntro>
      <form
        className={styles.card}
        aria-label="Planting preview"
        aria-describedby="plant-demo"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend>1. Choose tree amount</legend>
          <div className={styles.amounts}>
            {[
              [1, 150],
              [5, 750],
              [10, 1500],
            ].map(([count, price]) => (
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
                <small>{price} uah</small>
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
                  min="150"
                  step="150"
                  onFocus={() => setAmount('custom')}
                />
                <span>uah</span>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>2. Choose tree species</legend>
          <div className={styles.species}>
            {species.map(([name, image]) => (
              <label className={styles.option} key={name}>
                <input
                  type="radio"
                  name="species"
                  value={name}
                  defaultChecked={name === 'Oak'}
                  aria-label={name}
                />
                <img src={image} alt={name} />
              </label>
            ))}
          </div>
        </fieldset>
        <div className={styles.region}>
          <FormField
            label="3. Choose region"
            name="region"
            defaultValue="zakarpattia"
          >
            <option value="zakarpattia">Zakarpattia oblast</option>
          </FormField>
          <p>
            Estimated planting location:
            <br />
            <span>Uzhorod region</span>
          </p>
        </div>
        <p id="plant-demo" className={styles.notice}>
          <span aria-hidden="true">ⓘ</span>This is an interface demonstration.
          Payments and planting are unavailable; nothing is sent or saved.
        </p>
        <Button type="submit" className={styles.submit}>
          Plant tree
        </Button>
      </form>
    </section>
  )
}
