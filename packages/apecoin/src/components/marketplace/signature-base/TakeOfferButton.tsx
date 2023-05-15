import { ButtonProps } from '@chakra-ui/button'
import { BigNumberish } from '@ethersproject/bignumber'
import { OrderItem } from '@x/models'
import { ChainId, Collection, NftItem } from '@x/models/dist'

import Web3CheckButton from '../../Web3CheckButton'
import { useDisclosure } from '@chakra-ui/hooks'
import TakeOfferOverlay from './TakeOfferOverlay'

export interface TakeOfferButtonProps extends ButtonProps {
  /**
   * @deprecated
   */
  contractAddress?: string
  /**
   * @deprecated
   */
  chainId?: ChainId
  /**
   * @deprecated
   */
  tokenId?: BigNumberish
  collection?: Collection
  nftItem: NftItem
  offer: OrderItem
  onOfferTook?: (offer: OrderItem) => void
  isErc1155?: boolean
}

export default function TakeOfferButton({
  nftItem,
  collection,
  offer,
  onOfferTook,
  isErc1155,
  ...props
}: TakeOfferButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Web3CheckButton expectedChainId={offer.chainId} onClick={onOpen} isLoading={!collection} {...props}>
        {/* {isApproved ? 'Accept' : 'Approve & Accept'} */}
        Accept
      </Web3CheckButton>
      {collection && (
        <TakeOfferOverlay
          takeOfferProps={{
            collection,
            nftItem,
            offer,
            onOfferTook,
            isErc1155,
          }}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  )
}
