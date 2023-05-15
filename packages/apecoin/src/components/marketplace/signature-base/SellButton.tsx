import { useEffect, useState } from 'react'

import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { TokenType } from '@x/models'

import SellModalV2, { SellModalProps, FormData } from './SellModal.v2'
import { useActiveWeb3React, useErc721ApprovalForAll, useErc721Contract } from '@x/hooks/dist'
import { addresses } from '@x/constants/dist'
import { handleError } from '@x/web3/dist'
import { toast } from '@chakra-ui/react'
import ApproveOverlay from './ApproveOverlay'
import SellOverlay from './SellOverlay'
import Web3CheckButton from '../../Web3CheckButton'
import { Collection } from '@x/models/dist'

export interface SellButtonProps extends ButtonProps {
  collection: Collection
  chainId: ChainId
  contractAddress: string
  tokenID: string
  hasListed?: boolean
  defaultValues?: SellModalProps['defaultValues']
  tokenType?: TokenType
}

export default function SellButton({
  collection,
  chainId,
  contractAddress,
  tokenID,
  hasListed,
  defaultValues,
  tokenType,
  ...props
}: SellButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [formData, setFormData] = useState<FormData>()

  const { account, callContract, library } = useActiveWeb3React()

  const transferManagerContractAddress =
    tokenType === TokenType.Erc1155
      ? addresses.transferManagerErc1155[chainId]
      : addresses.transferManagerErc721[chainId]

  const [isApproved, isLoadingApproved] = useErc721ApprovalForAll(
    chainId,
    contractAddress,
    account,
    transferManagerContractAddress,
  )

  const erc721 = useErc721Contract(contractAddress, chainId)

  async function approve() {
    if (!erc721) return
    if (!transferManagerContractAddress) return

    const tx = await callContract({
      contract: erc721,
      method: 'setApprovalForAll',
      args: [transferManagerContractAddress, true],
    })
    await tx.wait()
  }

  useEffect(() => {
    // clear when close modal
    if (!isOpen) setFormData(void 0)
  }, [isOpen])

  function renderOverlay() {
    if (!isApproved)
      return <ApproveOverlay collection={collection} onApproveClicked={approve} isOpen={isOpen} onClose={onClose} />

    return (
      <SellOverlay
        mode={hasListed ? 'update' : 'create'}
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        isOpen={isOpen}
        onClose={onClose}
        defaultValues={defaultValues}
        tokenType={tokenType}
        onConfirmSell={setFormData}
      />
    )
  }

  return (
    <>
      <Web3CheckButton
        expectedChainId={chainId}
        variant="solid"
        onClick={onOpen}
        disabled={isLoadingApproved}
        {...props}
      >
        {hasListed ? 'Update Listing' : 'List For Sell'}
      </Web3CheckButton>
      {!isLoadingApproved && renderOverlay()}
    </>
  )
}
