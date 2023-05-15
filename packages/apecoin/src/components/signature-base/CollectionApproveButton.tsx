import Web3CheckButton from 'components/Web3CheckButton'
import useToast from 'hooks/useToast'
import { useState } from 'react'

import { ButtonProps, useCallbackRef } from '@chakra-ui/react'
import { useActiveWeb3React, useErc721Contract } from '@x/hooks'
import { Collection } from '@x/models'
import { handleError } from '@x/web3'

export interface ApproveButtonProps extends ButtonProps {
  collection: Collection
  spender?: string
}

export default function CollectionApproveButton({
  collection,
  spender,
  children,
  disabled,
  isLoading,
  ...props
}: ApproveButtonProps) {
  const toast = useToast({ title: 'Approve Collection' })
  const [isCallingContract, setCallingContract] = useState(false)
  const { callContract } = useActiveWeb3React()
  const contract = useErc721Contract(collection.erc721Address, collection.chainId)
  const onClick = useCallbackRef(() => {
    if (!contract) return
    if (!spender) return
    let stale = false

    setCallingContract(true)

    callContract({ contract, method: 'setApprovalForAll', args: [spender, true] })
      .catch(error => {
        if (stale) return
        handleError(error, { toast })
      })
      .finally(() => {
        if (!stale) setCallingContract(false)
      })

    return () => {
      stale = true
    }
  }, [callContract, contract, spender])

  return (
    <Web3CheckButton
      expectedChainId={collection.chainId}
      onClick={onClick}
      isLoading={isLoading || isCallingContract}
      disabled={disabled || isLoading || isCallingContract || !spender}
      variant="outline"
      color="primary"
      {...props}
    >
      {children}
    </Web3CheckButton>
  )
}
