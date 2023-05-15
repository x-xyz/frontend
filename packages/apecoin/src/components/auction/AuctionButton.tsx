import { Button, ButtonProps } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import AuctionModal from 'components/auction/v3/AuctionModal'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { Auction } from '@x/models'

export interface StartAuctionButtonProps extends ButtonProps {
  chainId: ChainId
  contractAddress: string
  tokenID: BigNumberish
  auction?: Auction
}

export default function AuctionButton({
  chainId,
  contractAddress,
  tokenID,
  auction,
  ...props
}: StartAuctionButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button variant="solid" onClick={onOpen} {...props}>
        {auction ? 'Update Auction' : 'Start Auction'}
      </Button>
      <AuctionModal
        chainId={chainId}
        contractAddress={contractAddress}
        tokenID={tokenID}
        auction={auction}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
