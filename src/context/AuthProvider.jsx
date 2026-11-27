import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { authenticate, endSession, getCurrentUser } from '../api/auth.js'
import { getToken, saveToken } from '../api/client.js'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    user: null,
    status: getToken() ? 'loading' : 'ready',
    error: '',
  }))
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => {
    setSession({ user: null, status: 'loading', error: '' })
    setAttempt((value) => value + 1)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    if (getToken()) {
      getCurrentUser(controller.signal).then(
        (user) => {
          if (!controller.signal.aborted)
            setSession({ user, status: 'ready', error: '' })
        },
        (error) => {
          if (controller.signal.aborted) return
          if (error.status === 401) saveToken('')
          setSession({
            user: null,
            status: 'ready',
            error: error.status === 401 ? '' : error.message,
          })
        },
      )
    }
    function expired(event) {
      if (event.detail !== getToken()) return
      saveToken('')
      setSession({ user: null, status: 'ready', error: '' })
    }
    function storage(event) {
      if (event.key === 'donatefortree.session') {
        // A different tab changed the session; reload to discard cached private data.
        window.location.reload()
      }
    }
    window.addEventListener('auth-expired', expired)
    window.addEventListener('storage', storage)
    return () => {
      controller.abort()
      window.removeEventListener('auth-expired', expired)
      window.removeEventListener('storage', storage)
    }
  }, [attempt])
  const login = useCallback(async (credentials, signup = false) => {
    const { user, token } = await authenticate(credentials, signup)
    saveToken(token)
    setSession({ user, status: 'ready', error: '' })
    return user
  }, [])
  const logout = useCallback(async () => {
    try {
      await endSession()
    } finally {
      saveToken('')
      setSession({ user: null, status: 'ready', error: '' })
    }
  }, [])
  return (
    <AuthContext.Provider value={{ ...session, login, logout, retry }}>
      {children}
    </AuthContext.Provider>
  )
}
