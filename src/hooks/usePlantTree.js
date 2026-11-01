import { useRef } from 'react'
import { plantTree } from '../api/trees.js'
import { validatePlanting } from '../utils/trees.js'
import { useMutation } from './useMutation.js'

export function usePlantTree() {
  const pending = useRef(null)
  return useMutation(async (payload) => {
    const error = validatePlanting(payload)
    if (error) throw new Error(error)
    const signature = JSON.stringify(payload)
    if (pending.current?.signature !== signature)
      pending.current = { signature, key: crypto.randomUUID() }
    const result = await plantTree(payload, pending.current.key)
    pending.current = null
    window.dispatchEvent(new Event('trees-changed'))
    return result
  })
}
