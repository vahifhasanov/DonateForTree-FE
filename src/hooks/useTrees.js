import { useCallback, useEffect, useState } from 'react'
import { getTrees } from '../api/trees.js'
import { useAuth } from './useAuth.js'

export function useTrees(mine = false) {
  const { user } = useAuth()
  const owner = mine ? user?.id : 'public'
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: '',
    owner,
  })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision((value) => value + 1), [])
  useEffect(() => {
    if (!owner) return
    const controller = new AbortController()
    getTrees(controller.signal, mine).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: '', owner })
      },
      (error) => {
        if (!controller.signal.aborted)
          setState({ data: [], loading: false, error: error.message, owner })
      },
    )
    window.addEventListener('trees-changed', reload)
    return () => {
      controller.abort()
      window.removeEventListener('trees-changed', reload)
    }
  }, [mine, owner, revision, reload])
  const refetch = useCallback(() => {
    setState({ data: [], loading: true, error: '', owner })
    reload()
  }, [owner, reload])
  // Never display a previous user's collection while the next request is running.
  return {
    ...(state.owner === owner
      ? state
      : { data: [], loading: Boolean(owner), error: '' }),
    refetch,
  }
}

export const useMyTrees = () => useTrees(true)
