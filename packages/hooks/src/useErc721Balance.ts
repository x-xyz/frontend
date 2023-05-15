import { useEffect, useState } from 'react'

import { ChainId } from '@x/models'

import { useReadonlyErc721Contract } from './useContract'

export function useErc721Balance(chainId: ChainId, contract: string, owner?: string | null) {
  const [state, setState] = useState({ balance: 0, isLoading: false })

  const erc721Contract = useReadonlyErc721Contract(contract, chainId)

  useEffect(() => {
    if (!erc721Contract || !owner) {
      setState({ balance: 0, isLoading: false })
      return
    }

    let stale = false

    setState({ balance: 0, isLoading: true })

    erc721Contract
      .balanceOf(owner)
      .then(value => !stale && setState({ balance: value.toNumber(), isLoading: false }))
      .catch(() => !stale && setState({ balance: 0, isLoading: false }))

    return () => {
      stale = true
    }
  }, [erc721Contract, owner])

  return [state.balance, state.isLoading] as const
}
