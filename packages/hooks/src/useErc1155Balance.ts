import { useEffect, useState } from 'react'

import { ChainId } from '@x/models'

import { useReadonlyErc1155Contract } from './useContract'

export function useErc1155Balance(chainId: ChainId, contract: string, tokenId: string, owner?: string | null) {
  const [balance, setBalance] = useState(0)
  const [isLoading, setLoading] = useState(false)

  const erc1155Contract = useReadonlyErc1155Contract(contract, chainId)

  useEffect(() => {
    if (!erc1155Contract || !owner) {
      setBalance(0)
      setLoading(false)
      return
    }

    let stale = false

    setBalance(0)
    setLoading(true)

    erc1155Contract
      .balanceOf(owner, tokenId)
      .then(value => !stale && setBalance(value.toNumber()))
      .catch(() => !stale && setBalance(0))
      .finally(() => setLoading(false))

    return () => {
      stale = true
    }
  }, [erc1155Contract, owner, tokenId])

  return [balance, isLoading, setBalance] as const
}
