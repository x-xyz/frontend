import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import PlaceOfferModal from 'components/marketplace/PlaceOfferModal'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '@x/hooks'

export interface OfferButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
}

export default function PlaceOfferButton({ chainId, contractAddress, tokenID, ...props }: OfferButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { account } = useActiveWeb3React()

  return (
    <>
      <Button variant="solid" onClick={onOpen} disabled={!account} {...props}>
        Make Offer
      </Button>
      <PlaceOfferModal
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
