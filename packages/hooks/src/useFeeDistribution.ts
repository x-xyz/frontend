import { useCallback, useEffect, useRef, useState } from 'react'

import { Zero } from '@ethersproject/constants'
import { FeeDistribution } from '@x/abis'
import feeDistributionAbi from '@x/abis/fee-distribution.json'
import { addresses, defaultNetwork } from '@x/constants'
import { callOnChain } from '@x/utils'
import { handleError } from '@x/web3'

import { useActiveWeb3React } from './useActiveWeb3React'
import { useContract, useReadonlyContract } from './useContract'
import { useCounter } from './useCounter'
import { useToast } from './useToast'

export function useFeeDistributionContract(chainId = defaultNetwork) {
  return useContract<FeeDistribution>(addresses.feeDistribution, feeDistributionAbi, true, chainId)
}

export function useReadonlyFeeDistributionContract(chainId = defaultNetwork) {
  return useReadonlyContract<FeeDistribution>(addresses.feeDistribution, feeDistributionAbi, chainId)
}

export function useClaimableFeeDistribution(chainId = defaultNetwork, account?: string | null) {
  const toast = useToast({ title: 'veX' })

  const contract = useReadonlyFeeDistributionContract(chainId)

  const [claimable, setClaimable] = useState(Zero)

  const [isLoading, setLoading] = useState(false)

  const [v, refresh] = useCounter()

  useEffect(() => {
    if (!contract || !account) return

    let stale = false

    setClaimable(Zero)
    setLoading(true)

    callOnChain(() => contract['claimable(address)'](account))
      .then(v => {
        if (stale) return
        setClaimable(v)
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
  }, [contract, account, toast, v])

  return [claimable, isLoading, refresh] as const
}

export interface UseClaimOptions {
  onClaimed?: () => void
}

export function useClaimFeeDistribution(chainId = defaultNetwork, options: UseClaimOptions = {}) {
  const toast = useToast({ title: 'veX' })

  const { callContract } = useActiveWeb3React()

  const contract = useFeeDistributionContract(chainId)

  const optionsRef = useRef(options)

  const [isClaiming, setClaiming] = useState(false)

  const claimable = !!contract

  return [
    useCallback(async () => {
      if (!contract) return

      setClaiming(true)

      try {
        const tx = await callContract({ contract, method: 'claim()', args: [] })
        await tx.wait()
        toast({ status: 'success', description: 'Claimed' })
        optionsRef.current.onClaimed?.()
      } catch (err) {
        handleError(err, { toast })
      } finally {
        setClaiming(false)
      }
    }, [callContract, contract, toast]),
    isClaiming,
    claimable,
  ] as const
}
