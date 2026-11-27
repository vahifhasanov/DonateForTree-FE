import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import RequestState from './RequestState.jsx'

export default function ProtectedRoute({ children }) {
  const { user, status, error, retry } = useAuth()
  const location = useLocation()
  if (status === 'loading' || error)
    return (
      <RequestState
        loading={status === 'loading'}
        error={error}
        retry={retry}
      />
    )
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  return children
}
