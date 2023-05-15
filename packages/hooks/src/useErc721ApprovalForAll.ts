import { ChainId } from '@x/constants'
import { useEffect, useRef, useState } from 'react'
import { handleError } from '@x/web3'
import { callOnChain } from '@x/utils'
import { compareAddress } from '@x/utils'
import { useReadonlyErc721Contract } from './useContract'
import { useToast } from './useToast'

export function useErc721ApprovalForAll(
  chainId: ChainId,
  contractAddress: string,
  owner?: string | null,
  operator?: string,
) {
  const toast = useToast({ title: 'Check approved for all' })

  const contract = useReadonlyErc721Contract(contractAddress, chainId)

  const [value, setValue] = useState<boolean>()

  const [loading, setLoading] = useState(false)

  const ref = useRef({ stale: false })

  useEffect(() => {
    ref.current.stale = true
    setValue(false)
  }, [contractAddress, owner, operator, contract])

  useEffect(() => {
    if (!owner || !operator || !contract || !ref.current.stale) return

    ref.current.stale = false

    setLoading(true)

    callOnChain(() => contract.isApprovedForAll(owner, operator))
      .then(value => {
        if (!ref.current.stale) setValue(value)
      })
      .catch(error => handleError(error, { toast }))
      .then(() => {
        if (!ref.current.stale) setLoading(false)
      })

    function onApprovalForAll(incomingOwner: string, incomingOperator: string, approved: boolean) {
      if (!compareAddress(owner, incomingOwner)) return
      if (!compareAddress(operator, incomingOperator)) return
      setValue(approved)
    }

    contract.on('ApprovalForAll', onApprovalForAll)

    return () => {
      contract.off('ApprovalForAll', onApprovalForAll)
    }
  }, [owner, operator, contract, toast])

  return [value, loading] as const
}
