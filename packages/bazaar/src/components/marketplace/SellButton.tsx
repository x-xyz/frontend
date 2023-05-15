import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import SellModal, { SellModalProps } from 'components/marketplace/SellModal'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'

export interface SellButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  hasListed?: boolean
  defaultValues?: SellModalProps['defaultValues']
}

export default function SellButton({
  chainId,
  contractAddress,
  tokenID,
  hasListed,
  defaultValues,
  ...props
}: SellButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button variant="solid" onClick={onOpen} {...props}>
        {hasListed ? 'Update Listing' : 'Sell'}
      </Button>
      <SellModal
        mode={hasListed ? 'update' : 'create'}
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        isOpen={isOpen}
        onClose={onClose}
        defaultValues={defaultValues}
      />
    </>
  )
}
