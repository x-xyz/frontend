import { Zero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, TokenMeta } from '@x/constants'
import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3React } from './useActiveWeb3React'
import { Erc20 } from '@x/abis'
import { callOnChain } from '@x/utils'
import { useErc20Contract } from './useContract'

export type State = { value: BigNumber; isLoading: boolean; error?: any }

export function useBalance(expectedChainId?: ChainId) {
  const { account, library, chainId } = useActiveWeb3React()

  const [balance, setBalance] = useState<State>({ value: Zero, isLoading: false })

  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!account || !library) return

    if (expectedChainId !== chainId) return

    setBalance(prev => ({ ...prev, isLoading: true }))

    callOnChain(() => library.getBalance(account))
      .then(value => setBalance(prev => ({ ...prev, value })))
      .catch(error => setBalance(prev => ({ ...prev, error })))
      .then(() => setBalance(prev => ({ ...prev, isLoading: false })))
  }, [version, account, library, expectedChainId, chainId])

  return { ...balance, refresh }
}

export function useErc20Balance(contract: Pick<Erc20, 'balanceOf'> | null) {
  const { account } = useActiveWeb3React()

  const [balance, setBalance] = useState<State>({ value: Zero, isLoading: false })

  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!account || !contract) return

    setBalance(prev => ({ ...prev, isLoading: true }))

    callOnChain(() => contract.balanceOf(account))
      .then(value => setBalance(prev => ({ ...prev, value })))
      .catch(error => setBalance(prev => ({ ...prev, error })))
      .then(() => setBalance(prev => ({ ...prev, isLoading: false })))
  }, [version, account, contract])

  return { ...balance, refresh }
}

export function useErc20BalanceByToken(token?: TokenMeta) {
  const contract = useErc20Contract(token?.address, token?.chainId)
  return useErc20Balance(contract)
}
