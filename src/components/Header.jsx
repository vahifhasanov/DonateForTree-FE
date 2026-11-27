import { useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import styles from './Header.module.css'
import { useAuth } from '../hooks/useAuth.js'
import { useMutation } from '../hooks/useMutation.js'

export default function Header() {
  const [open, setOpen] = useState(false)
  const toggle = useRef(null)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const signout = useMutation(logout)
  function closeWithEscape(event) {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      toggle.current?.focus()
    }
  }
  return (
    <header
      className={styles.header}
      data-home={pathname === '/'}
      onKeyDown={closeWithEscape}
    >
      <Link className={styles.logo} to="/" aria-label="DonateForTree home">
        <span aria-hidden="true">gas</span>
        <span aria-hidden="true">v</span>
      </Link>
      <button
        className={styles.toggle}
        type="button"
        ref={toggle}
        aria-expanded={open}
        aria-controls="navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close menu' : 'Menu'}{' '}
        <span aria-hidden="true">{open ? '×' : '☰'}</span>
      </button>
      <nav
        id="navigation"
        aria-label="Main navigation"
        data-open={open}
        data-home={pathname === '/'}
        className={styles.navigation}
      >
        <NavLink to="/" end>
          home
        </NavLink>
        <NavLink to="/map">map</NavLink>
        <NavLink to="/trees">your trees</NavLink>
        <NavLink to="/plant">plant a tree</NavLink>
        {user ? (
          <details className={styles.profile}>
            <summary>
              <span className={styles.person} aria-hidden="true" />
              <span className={styles.userName}>{user.name}</span>{' '}
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className={styles.profileMenu}>
              <p>Demo account</p>
              <Link to="/trees">My trees</Link>
              <button
                type="button"
                disabled={signout.loading}
                onClick={() => signout.mutate()}
              >
                {signout.loading ? 'Logging out…' : 'Log out'}
              </button>
            </div>
          </details>
        ) : (
          <div className={styles.auth}>
            <NavLink className={styles.login} to="/login">
              login
            </NavLink>
            <NavLink className={styles.signup} to="/signup">
              sign up
            </NavLink>
          </div>
        )}
      </nav>
    </header>
  )
}
