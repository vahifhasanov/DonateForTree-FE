import { useEffect, useRef, useState } from 'react'

export function useMutation(action) {
  const [state, setState] = useState({ loading: false, error: '', data: null })
  const busy = useRef(false)
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])
  async function mutate(...args) {
    if (busy.current) return null
    busy.current = true
    setState({ loading: true, error: '', data: null })
    try {
      const data = await action(...args)
      if (active.current) setState({ loading: false, error: '', data })
      return data
    } catch (error) {
      if (active.current)
        setState({
          loading: false,
          error: error.message || 'The operation failed.',
          data: null,
        })
      return null
    } finally {
      busy.current = false
    }
  }
  function reset() {
    if (!busy.current) setState({ loading: false, error: '', data: null })
  }
  return { ...state, mutate, reset }
}
