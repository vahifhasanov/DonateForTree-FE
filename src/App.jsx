import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Trees from './pages/Trees.jsx'
import Plant from './pages/Plant.jsx'
import Map from './pages/Map.jsx'
import NotFound from './pages/NotFound.jsx'
import styles from './App.module.css'

const titles = {
  '/': 'Home',
  '/map': 'Tree map',
  '/trees': 'My trees',
  '/plant': 'Plant a tree',
  '/login': 'Log in',
  '/signup': 'Sign up',
}

export default function App() {
  const { pathname } = useLocation()
  const main = useRef(null)
  const previousPath = useRef(pathname)
  useEffect(() => {
    document.title = `${titles[pathname.replace(/\/+$/, '') || '/'] ?? '404 — Сторінку не знайдено'} · DonateForTree`
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0)
      main.current?.focus()
      previousPath.current = pathname
    }
  }, [pathname])
  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <Header key={pathname} />
      <main id="main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/trees" element={<Trees />} />
          <Route path="/plant" element={<Plant />} />
          <Route path="/login" element={<Auth key="login" />} />
          <Route path="/signup" element={<Auth key="signup" signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
