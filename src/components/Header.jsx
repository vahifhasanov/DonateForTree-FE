import { useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const toggle = useRef(null)
  const { pathname } = useLocation()
  const demoProfile = ['/trees', '/plant', '/map'].includes(pathname)
  function closeWithEscape(event) {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      toggle.current?.focus()
    }
  }
  return (
    <header className={styles.header} onKeyDown={closeWithEscape}>
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
        {demoProfile ? (
          <details className={styles.profile}>
            <summary>
              <span className={styles.person} aria-hidden="true" />
              Vagif <span aria-hidden="true">⌄</span>
            </summary>
            <div className={styles.profileMenu}>
              <p>Demo profile</p>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Sign up</Link>
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
