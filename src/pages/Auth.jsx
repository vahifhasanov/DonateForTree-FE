import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import plant from '../../img/plant.png'
import styles from './Auth.module.css'

export default function Auth({ signup = false }) {
  const help = useRef(null)
  return (
    <section
      className={`${styles.page} ${signup ? styles.signup : ''}`}
      aria-labelledby="auth-heading"
    >
      <div className={styles.welcome}>
        <h1 id="auth-heading">
          {signup ? (
            <>
              Join
              <br />
              us
            </>
          ) : (
            <>
              Welcome
              <br />
              back
            </>
          )}
        </h1>
        <p>
          {signup ? (
            <>
              Create an account
              <br />
              to be a great part
              <br />
              of a greener Ukraine
            </>
          ) : (
            <>
              Log in to your
              <br />
              account and
              <br />
              continue making
              <br />
              world better
            </>
          )}
        </p>
      </div>
      <div className={styles.formColumn}>
        <form
          className={styles.card}
          aria-labelledby="form-heading"
          aria-describedby="auth-demo"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 id="form-heading">{signup ? 'Sign up' : 'Log in'}</h2>
          <div className={styles.fields}>
            {signup && (
              <FormField
                label="Name"
                name="name"
                autoComplete="name"
                placeholder="Vagif Hasanov"
                required
              />
            )}
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com *"
              required
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              autoComplete={signup ? 'new-password' : 'current-password'}
              placeholder="****************"
              required
            />
            {signup && (
              <FormField
                label="Confirm password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="****************"
                required
              />
            )}
          </div>
          {!signup && (
            <button
              type="button"
              className={styles.forgot}
              onClick={() => help.current?.showModal()}
            >
              FORGOT PASSWORD?
            </button>
          )}
          <Button type="submit" className={styles.submit}>
            {signup ? 'Create account' : 'Log in'}
          </Button>
          <p className={styles.switch}>
            {signup ? (
              <>
                Already have an account? <Link to="/login">LOG IN</Link>
              </>
            ) : (
              <>
                Don’t have an account? <Link to="/signup">SIGN UP</Link>
              </>
            )}
          </p>
        </form>
        <p id="auth-demo" className={styles.demo}>
          Interface demo. {signup ? 'Account creation' : 'Authentication'} is
          unavailable; nothing is sent or saved.
        </p>
      </div>
      <img className={styles.plant} src={plant} alt="" />
      <dialog
        ref={help}
        className={styles.dialog}
        aria-labelledby="recovery-heading"
      >
        <h2 id="recovery-heading">Password recovery</h2>
        <p>
          This is an interface demonstration. Password recovery is unavailable.
        </p>
        <Button onClick={() => help.current?.close()}>Close</Button>
      </dialog>
    </section>
  )
}
