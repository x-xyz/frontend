import { useCallback, useEffect, useState } from 'react'

import { formatUnits } from '@ethersproject/units'
import { VotingEscrow } from '@x/abis'
import votingEscrowAbi from '@x/abis/voting-escrow.json'
import { addresses, ChainId, defaultNetwork } from '@x/constants'
import { callOnChain } from '@x/utils'
import { handleError } from '@x/web3'

import { useContract, useReadonlyContract } from './useContract'
import { useCounter } from './useCounter'
import { useToast, useBaseToast } from './useToast'
import { useActiveWeb3React } from './useActiveWeb3React'

export function useVotingEscrowContract(chainId = defaultNetwork) {
  return useContract<VotingEscrow>(addresses.votingEscrow, votingEscrowAbi, true, chainId)
}

export function useReadonlyVotingEscrowContract(chainId = defaultNetwork) {
  return useReadonlyContract<VotingEscrow>(addresses.votingEscrow, votingEscrowAbi, chainId)
}

export function useVotingEscrowTotalSupply(chainId = defaultNetwork) {
  const toast = useToast({ title: 'veX' })

  const contract = useReadonlyVotingEscrowContract(chainId)

  const [value, setValue] = useState(0)

  const [isLoading, setLoading] = useState(false)

  const [v, refresh] = useCounter()

  useEffect(() => {
    if (!contract) return

    setLoading(true)

    callOnChain(() => contract['totalSupply()']())
      .then(v => {
        setValue(parseFloat(formatUnits(v, 18)))
      })
      .catch(err => handleError(err, { toast }))
      .then(() => setLoading(false))
  }, [contract, toast, v])

  return [value, isLoading, refresh] as const
}

export function useVotingEscrowBalance(chainId = defaultNetwork, address?: string | null) {
  const toast = useToast({ title: 'veX' })

  const contract = useReadonlyVotingEscrowContract(chainId)

  const [value, setValue] = useState(0)

  const [isLoading, setLoading] = useState(false)

  const [v, refresh] = useCounter()

  useEffect(() => {
    if (!contract || !address) return

    setValue(0)
    setLoading(true)

    let stale = false

    callOnChain(() => contract['balanceOf(address)'](address))
      .then(v => {
        if (stale) return
        setValue(parseFloat(formatUnits(v, 18)))
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
  }, [contract, toast, address, v])

  return [value, isLoading, refresh] as const
}

export function useVotingEscrowLockedState(chainId = defaultNetwork, address?: string | null) {
  const toast = useToast({ title: 'veX' })

  const contract = useReadonlyVotingEscrowContract(chainId)

  const [value, setValue] = useState(0)

  const [end, setEnd] = useState(0)

  const [isLoading, setLoading] = useState(false)

  const [v, refresh] = useCounter()

  useEffect(() => {
    if (!contract || !address) return

    setValue(0)
    setEnd(0)
    setLoading(true)

    let stale = false

    callOnChain(() => contract.locked(address))
      .then(({ amount, end }) => {
        if (stale) return
        setValue(parseFloat(formatUnits(amount, 18)))
        setEnd(end.toNumber())
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
  }, [contract, toast, address, v])

  return [{ value, end }, isLoading, refresh] as const
}

export interface UseVotingEscrowWithdrawOptions {
  chainId?: ChainId
  toast?: useBaseToast
}

export function useVotingEscrowWithdraw({ chainId = defaultNetwork, toast }: UseVotingEscrowWithdrawOptions = {}) {
  const { callContract } = useActiveWeb3React()

  const contract = useVotingEscrowContract(chainId)

  const [isWithdrawing, setWithdrawing] = useState(false)

  const canWithdraw = !!contract && !isWithdrawing

  const withdraw = useCallback(async () => {
    if (!contract) return

    setWithdrawing(true)

    try {
      const tx = await callContract({ contract, method: 'withdraw', args: [] })

      await tx.wait()

      toast?.({ status: 'success', description: 'Withdrawed' })
    } catch (err) {
      handleError(err, { toast })
    } finally {
      setWithdrawing(false)
    }
  }, [callContract, contract, toast])

  return [withdraw, { isWithdrawing, canWithdraw }] as const
}
