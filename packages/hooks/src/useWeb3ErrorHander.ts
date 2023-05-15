import { useEffect } from 'react'
import { useWeb3React } from '@x/utils'
import { useToast } from './useToast'

const ignoreErrorCode: number[] = [
  -32002, // pending request
]

export function shouldIgnoreWeb3Error(error: unknown) {
  const errorCode = (error as any).code // eslint-disable-line @typescript-eslint/no-explicit-any
  if (typeof errorCode === 'number') {
    return ignoreErrorCode.includes(errorCode)
  }
  return false
}

export function useWeb3ErrorHander() {
  const { error } = useWeb3React()

  const toast = useToast({ title: 'Web3' })

  useEffect(() => {
    if (error && !shouldIgnoreWeb3Error(error)) toast({ status: 'error', description: error.message })
  }, [error, toast])
}
