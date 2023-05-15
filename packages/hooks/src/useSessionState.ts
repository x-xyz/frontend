import { useCallback, useState } from 'react'

export function useSessionState<T>(key: string, initialState?: T) {
  const [state, setState] = useState(() => {
    try {
      const data = sessionStorage.getItem(key)
      if (data) return JSON.parse(data)
      sessionStorage.setItem(key, JSON.stringify(initialState))
      return initialState
    } catch {
      return initialState
    }
  })

  return [
    state,
    useCallback(
      (value: T) => {
        sessionStorage.setItem(key, JSON.stringify(value))
        setState(value)
      },
      [key],
    ),
  ]
}
