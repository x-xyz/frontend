import { useEffect, useState } from 'react'

export function useDelayTrigger(ms: number) {
  const [value, setValue] = useState(false)

  useEffect(() => {
    setValue(false)
    const timer = setTimeout(() => setValue(true), ms)
    return () => clearTimeout(timer)
  }, [ms])

  return value
}
