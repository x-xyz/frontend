import { useReducer } from 'react'

function reducer(state: number) {
  return state + 1
}

export function useCounter(defaultValue = 0) {
  const [count, add] = useReducer(reducer, defaultValue)
  return [count, add] as const
}
