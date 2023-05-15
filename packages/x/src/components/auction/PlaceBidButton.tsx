import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { useActiveWeb3React } from '@x/hooks'
import { Auction, Bidder } from '@x/models'
import PlaceBidModal from './PlaceBidModal'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'

export interface PlaceBidButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  auction: Auction
  highestBidder?: Bidder
}

export default function PlaceBidButton({
  chainId,
  contractAddress,
  tokenID,
  auction,
  highestBidder,
  ...props
}: PlaceBidButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { account } = useActiveWeb3React()

  return (
    <>
      <Button variant="solid" onClick={onOpen} disabled={!account} {...props}>
        Place Bid
      </Button>
      <PlaceBidModal
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        auction={auction}
        highestBidder={highestBidder}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
