import SellModal, { SellModalProps } from 'components/marketplace/v3/SellModal'
import SellModalV2, { FormData } from 'components/marketplace/v3/SellModal.v2'

import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { TokenType } from '@x/models'
import { isFeatureEnabled } from 'flags'
import { useEffect, useState } from 'react'
import ExecuteSellModal from './ExecuteSellModal'

export interface SellButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  hasListed?: boolean
  defaultValues?: SellModalProps['defaultValues']
  tokenType?: TokenType
}

export default function SellButton({
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

  useEffect(() => {
    // clear when close modal
    if (!isOpen) setFormData(void 0)
  }, [isOpen])

  function renderModal() {
    if (isFeatureEnabled('sale-modal.v2')) {
      if (formData)
        return (
          <ExecuteSellModal
            chainId={chainId}
            contract={contractAddress}
            tokenId={`${tokenID}`}
            formData={formData}
            isOpen={isOpen}
            onClose={onClose}
            isErc1155={tokenType === TokenType.Erc1155}
          />
        )

      return (
        <SellModalV2
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
      <SellModal
        mode={hasListed ? 'update' : 'create'}
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        isOpen={isOpen}
        onClose={onClose}
        defaultValues={defaultValues}
        tokenType={tokenType}
      />
    )
  }

  return (
    <>
      <Button variant="solid" onClick={onOpen} {...props}>
        {hasListed ? 'Update Listing' : 'Sell'}
      </Button>
      {renderModal()}
    </>
  )
}
