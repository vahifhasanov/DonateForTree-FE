import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Footer from '../components/Footer.jsx'
import styles from './Home.module.css'
import tree from '../../img/tree.png'
import sky from '../../img/sky.png'
import plant from '../../img/plant.png'
import people from '../../img/ppl.png'
import flag from '../../img/flag.png'
import bird from '../../img/bird.png'

export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="home-heading">
        <img src={sky} className={styles.sky} alt="" />
        <h1 id="home-heading" className={styles.heading}>
          <Link to="/login">LOGIN</Link>
          <span>
            or{' '}
            <Link
              className={styles.arrowLink}
              to="/signup"
              aria-label="Join DonateForTree"
            >
              ›
            </Link>
          </span>
          <Link to="/signup">REGISTER</Link>
        </h1>
        <p className={styles.callout}>click on the tree for donation</p>
        <Link
          to="/plant"
          className={styles.treeLink}
          aria-label="Explore planting a tree"
        >
          <img src={tree} alt="A green tree with a wide leafy crown" />
        </Link>
        <img src={plant} className={styles.sprout} alt="" />
      </section>
      <section className={styles.info} aria-labelledby="info-heading">
        <h2 id="info-heading">
          THERE IS A NEW WAY TO MAKE OUR COUNTRY MORE GREEN
          <br />
          WE ARE PRETEND TO SHOW YOU
        </h2>
        <ul>
          <li>THERE IS A NEW WAY TO</li>
          <li>MAKE OUR COUNTRY</li>
          <li>MORE GREEN</li>
          <li>WE ARE PRETEND TO</li>
          <li>SHOW YOU</li>
        </ul>
        <img
          src={people}
          className={styles.people}
          alt="A child planting a young tree"
        />
        <span className={styles.downArrow} aria-hidden="true" />
      </section>
      <section className={styles.tracking} aria-labelledby="tracking-heading">
        <h2 id="tracking-heading">
          YOU CAN TRACK
          <br />
          ALL INFO ABOUT
          <br />
          YOUR TREES
        </h2>
        <Button to="/trees" className={styles.track}>
          TRACK
        </Button>
        <div className={styles.count}>
          <p>Trees count</p>
          <p className={styles.number}>2152</p>
          <small>Demo data</small>
          <img src={bird} alt="" />
        </div>
      </section>
      <section className={styles.about} aria-labelledby="about-heading">
        <img
          src={flag}
          alt="The blue and yellow Ukrainian flag"
          className={styles.flag}
        />
        <div>
          <h2 id="about-heading">
            We are from Ukraine
            <br />
            Uzhorod
          </h2>
          <p>
            Our CEO is Vahif Hasanov Ilgam ogli
            <br />
            And his team is from uzhnu
          </p>
          <p>
            DonateForTree brings a greener future closer.
            <br />
            Explore our planting initiative and tree collection.
            <br />
            This laboratory project uses static demonstration data.
          </p>
        </div>
      </section>
      <Footer />
    </>
  )
}
