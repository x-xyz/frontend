import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useEffect, useRef, useState } from 'react'
import { handleError } from '@x/web3'
import { callOnChain } from '@x/utils'
import { useReadonlyErc721Contract } from './useContract'
import { useToast } from './useToast'

export interface UseErc721OwnerParams {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
  disabled?: boolean
}

export function useErc721Owner({ chainId, contractAddress, tokenId, disabled = false }: UseErc721OwnerParams) {
  const toast = useToast({ title: 'Check owner of token' })

  const contract = useReadonlyErc721Contract(contractAddress, chainId)

  const [value, setValue] = useState<string>()

  const [loading, setLoading] = useState(false)

  const ref = useRef({ stale: false })

  useEffect(() => {
    ref.current.stale = true
  }, [contractAddress, tokenId, contract])

  useEffect(() => {
    if (disabled || !contract || !ref.current.stale) return

    ref.current.stale = false

    setLoading(true)

    callOnChain(() => contract.ownerOf(tokenId))
      .then(value => {
        if (!ref.current.stale) setValue(value)
      })
      .catch(error => handleError(error, { toast }))
      .then(() => {
        if (!ref.current.stale) setLoading(false)
      })
  }, [contract, tokenId, toast, disabled])

  return [value, loading, setValue] as const
}
