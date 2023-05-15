import { ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from '@x/constants'
import { TokenType } from '@x/models'

import Web3CheckButton from '../../Web3CheckButton'
import PlaceOfferOverlay from './PlaceOfferOverlay'
import { Collection, NftItem } from '@x/models/dist'

export interface OfferButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  tokenType?: TokenType
  nftItem: NftItem
  collection: Collection
}

export default function PlaceOfferButton({
  chainId,
  contractAddress,
  tokenID,
  tokenType,
  nftItem,
  collection,
  ...props
}: OfferButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Web3CheckButton expectedChainId={chainId} variant="solid" onClick={onOpen} {...props}>
        Offer
      </Web3CheckButton>
      <PlaceOfferOverlay
        placeOfferProps={{
          chainId,
          contractAddress,
          tokenID,
          tokenType,
          nftItem,
          collection,
        }}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
