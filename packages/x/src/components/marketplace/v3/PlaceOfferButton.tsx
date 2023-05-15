import PlaceOfferModal from 'components/marketplace/v3/PlaceOfferModal'

import { ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { TokenType } from '@x/models'

import Web3CheckButton from '../../Web3CheckButton'

export interface OfferButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  tokenType?: TokenType
}

export default function PlaceOfferButton({ chainId, contractAddress, tokenID, tokenType, ...props }: OfferButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Web3CheckButton expectedChainId={chainId} variant="solid" onClick={onOpen} {...props}>
        Offer
      </Web3CheckButton>
      <PlaceOfferModal
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        isOpen={isOpen}
        onClose={onClose}
        tokenType={tokenType}
      />
    </>
  )
}
