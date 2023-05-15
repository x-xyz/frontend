import { DateTime } from 'luxon'
import { Stack } from '@chakra-ui/layout'
import AuctionReservePrice from 'components/auction/AuctionReservePrice'
import Countdown from 'components/auction/Countdown'
import HighestBidder from 'components/auction/HighestBidder'
import PlaceBidButton from 'components/auction/PlaceBidButton'
import WithdrawBidButton from 'components/auction/WithdrawBidButton'
import { ChainId } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useReadonlyAuctionContract, useRunningAuction } from '@x/hooks'
import { compareAddress } from '@x/utils'
import { useActiveWeb3React } from '@x/hooks'

export interface RunningAuctionProps {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
}

export default function RunningAuction({ chainId, contractAddress, tokenId }: RunningAuctionProps) {
  const { account } = useActiveWeb3React()

  const auctionContract = useReadonlyAuctionContract(chainId)

  const { auction, auctionHighestBidder, auctionWinner, auctionHasStarted, auctionHasEnded } = useRunningAuction(
    auctionContract,
    contractAddress,
    tokenId,
  )

  if (!auction) return null

  return (
    <Stack justifyContent="space-between">
      <Countdown
        concluded={auction.resulted}
        startTime={DateTime.fromSeconds(auction.startTime.toNumber())}
        endTime={DateTime.fromSeconds(auction.endTime.toNumber())}
        units={['days', 'hours', 'minutes', 'seconds']}
      />
      <AuctionReservePrice price={auction.reservePrice} paymentToken={auction.payToken} chainId={chainId} />
      {auctionHighestBidder && (
        <HighestBidder bidder={auctionHighestBidder} paymentToken={auction.payToken} chainId={chainId} />
      )}
      {auctionWinner && (
        <HighestBidder bidder={auctionWinner} paymentToken={auction.payToken} chainId={chainId} winner />
      )}
      {!compareAddress(auction.owner, account) &&
        (compareAddress(auctionHighestBidder?.bidder, account) ? (
          <WithdrawBidButton chainId={chainId} contractAddress={contractAddress} tokenID={tokenId} auction={auction} />
        ) : (
          <PlaceBidButton
            chainId={chainId}
            contractAddress={contractAddress}
            tokenID={tokenId}
            auction={auction}
            highestBidder={auctionHighestBidder}
            disabled={!auctionHasStarted || auctionHasEnded}
          />
        ))}
    </Stack>
  )
}
