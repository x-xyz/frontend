import { useCallbackRef } from '@chakra-ui/hooks'
import { useCallback, useEffect, useState } from 'react'

export function useInterval(callback: (pause: () => void) => void, ms: number) {
  const callbackRef = useCallbackRef(callback)

  const [isPause, setPause] = useState(false)

  const pause = useCallback(() => setPause(true), [])

  const resume = useCallback(() => setPause(false), [])

  useEffect(() => {
    if (isPause) return

    const timer = setInterval(() => callbackRef(pause), ms)

    return () => clearInterval(timer)
  }, [isPause, ms, callbackRef, pause])

  return { isPause, pause, resume }
}
