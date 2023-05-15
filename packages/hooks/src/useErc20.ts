import { Zero } from '@ethersproject/constants'
import { Erc20 } from '@x/abis'
import { callOnChain } from '@x/utils'
import { handleError } from '@x/web3/dist'
import { useEffect, useState } from 'react'
import { useCounter } from './useCounter'
import { useToast } from './useToast'

export function useErc20Allowance(contract?: Erc20 | null, account?: string | null, spender?: string | null) {
  const toast = useToast({ title: 'Erc20' })

  const [allowance, setAllowance] = useState(Zero)

  const [isLoading, setLoading] = useState(false)

  const [v, refresh] = useCounter()

  useEffect(() => {
    if (!contract || !account || !spender) return

    let stale = false

    setAllowance(Zero)
    setLoading(true)

    callOnChain(() => contract.allowance(account, spender))
      .then(v => {
        if (stale) return
        setAllowance(v)
      })
      .catch(err => {
        if (stale) return
        handleError(err, { toast })
      })
      .then(() => {
        if (stale) return
        setLoading(false)
      })

    return () => {
      stale = true
    }
  }, [contract, account, spender, toast, v])

  return [allowance, isLoading, refresh] as const
}
