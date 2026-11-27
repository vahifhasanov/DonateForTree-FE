import { useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import plant from '../../img/plant.png'
import styles from './Auth.module.css'
import { useAuth } from '../hooks/useAuth.js'
import { useMutation } from '../hooks/useMutation.js'
import { validateCredentials } from '../utils/trees.js'
import RequestState from '../components/RequestState.jsx'

export default function Auth({ signup = false }) {
  const help = useRef(null)
  const { user, status, error: sessionError, retry, login } = useAuth()
  const { state } = useLocation()
  const [validation, setValidation] = useState('')
  const { mutate, loading, error } = useMutation(login)
  const destination =
    typeof state?.from === 'string' && /^\/(?!\/)/.test(state.from)
      ? state.from
      : '/trees'
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const message =
      validateCredentials(values, signup) ||
      (signup && values.password !== values['confirm-password']
        ? 'Passwords do not match.'
        : '')
    setValidation(message)
    if (!message)
      await mutate(
        {
          name: values.name?.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        },
        signup,
      )
  }
  if (status === 'loading' || sessionError)
    return (
      <RequestState
        loading={status === 'loading'}
        error={sessionError}
        retry={retry}
      />
    )
  if (user) return <Navigate to={destination} replace />
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
          onSubmit={submit}
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
                minLength={2}
                maxLength={60}
              />
            )}
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com *"
              required
              maxLength={254}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              autoComplete={signup ? 'new-password' : 'current-password'}
              placeholder="****************"
              required
              minLength={8}
              maxLength={128}
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
          {(validation || error) && (
            <p className="form-error" role="alert">
              {validation || error}
            </p>
          )}
          <Button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Please wait…' : signup ? 'Create account' : 'Log in'}
          </Button>
          <p className={styles.switch}>
            {signup ? (
              <>
                Already have an account?{' '}
                <Link to="/login" state={state}>
                  LOG IN
                </Link>
              </>
            ) : (
              <>
                Don’t have an account?{' '}
                <Link to="/signup" state={state}>
                  SIGN UP
                </Link>
              </>
            )}
          </p>
        </form>
        <p id="auth-demo" className={styles.demo}>
          Local demo authentication. Use fictional details only, with a password
          of 8–128 characters. Demo account: demo@example.com / DemoTree2026!
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
