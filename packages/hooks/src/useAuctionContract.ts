import { DateTime } from 'luxon'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import type { Auction as AuctionContract } from '@x/abis'
import auctionAbi from '@x/abis/auction.json'
import { addresses } from '@x/constants'
import { useContract, useContractListener, useReadonlyContract } from './useContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Auction, Bidder } from '@x/models'
import { compareAddress, compareBigNumberish, callOnChain } from '@x/utils'
import { ChainId } from '@x/constants'
import { useCallbackRef } from '@chakra-ui/hooks'
import { useInterval } from './useInterval'

export function useAuctionContract(chainId = ChainId.Fantom) {
  return useContract<AuctionContract>(addresses.auction, auctionAbi, true, chainId)
}

export function useReadonlyAuctionContract(expectedChainId = ChainId.Fantom) {
  return useReadonlyContract<AuctionContract>(addresses.auction, auctionAbi, expectedChainId)
}

export interface UseRunningAuctionOptions {
  onAuctionResulted?: (auction: Auction, winner: Bidder) => void
}

export function useRunningAuction(
  contract: AuctionContract | null,
  contractAddress: string,
  tokenID: BigNumberish,
  options: UseRunningAuctionOptions = {},
) {
  const onAuctionResultedRef = useCallbackRef(options.onAuctionResulted)

  const [auction, setAuction] = useState<Auction>()

  const [isLoadingAuction, setLoadingAuction] = useState(false)

  const [highestBidder, setHighestBidder] = useState<Bidder>()

  const [winner, setWinner] = useState<Bidder>()

  const [hasStarted, setHasStarted] = useState(isAuctionStarted(auction))

  const [hasEnded, setHasEnded] = useState(isAuctionEnded(auction))

  const [isLoadingHighestBidder, setLoadingHighestBidder] = useState(false)

  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(prev => prev + 1), [])

  useInterval(() => setHasStarted(isAuctionStarted(auction)), 1000)

  useInterval(() => setHasEnded(isAuctionEnded(auction)), 1000)

  useEffect(() => {
    if (!contract) return

    let stale = false

    setLoadingAuction(true)

    setLoadingHighestBidder(true)

    callOnChain(() => contract.getAuction(contractAddress, tokenID))
      .then(([owner, payToken, reservePrice, startTime, endTime, resulted]) => {
        if (stale) return

        if (endTime.eq(0)) {
          setAuction(undefined)
        } else {
          setAuction({ owner, payToken, reservePrice, startTime, endTime, resulted })
        }
      })
      .catch(() => {
        if (!stale) setAuction(undefined)
      })
      .then(() => {
        if (!stale) setLoadingAuction(false)
      })

    callOnChain(() => contract.getHighestBidder(contractAddress, tokenID))
      .then(([bidder, bid, lastBidTime]) => {
        if (stale) return

        if (bid.eq(0)) {
          setHighestBidder(undefined)
        } else {
          setHighestBidder({ bidder, bid, lastBidTime })
        }
      })
      .catch(() => {
        if (!stale) setHighestBidder(undefined)
      })
      .then(() => {
        if (!stale) setLoadingHighestBidder(false)
      })

    return () => {
      stale = true
    }
  }, [contract, contractAddress, tokenID, version])

  useAuctionCreatedListener(contract, (_contractAddress, _tokenID) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      refresh()
    }
  })

  useAuctionReservePriceUpdatedListener(contract, (_contractAddress, _tokenID, payToken, reservePrice) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      setAuction(prev => prev && { ...prev, payToken, reservePrice })
    }
  })

  useAuctionStartTimeUpdatedListener(contract, (_contractAddress, _tokenID, startTime) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      setAuction(prev => prev && { ...prev, startTime })
    }
  })

  useAuctionEndTimeUpdatedListener(contract, (_contractAddress, _tokenID, endTime) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      setAuction(prev => prev && { ...prev, endTime })
    }
  })

  useBidPlacedListener(contract, (_contractAddress, _tokenID, bidder, bid) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      setHighestBidder({ bidder, bid, lastBidTime: BigNumber.from(Math.floor(DateTime.now().toSeconds())) })
    }
  })

  useBidWithdrawnListener(contract, (_contractAddress, _tokenID) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      refresh()
    }
  })

  useAuctionCancelledListener(contract, (_contractAddress, _tokenID) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      setAuction(undefined)
      setHighestBidder(undefined)
    }
  })

  useAuctionResultedListener(contract, (_contractAddress, _tokenID, bidder, paymentToken, unitPrice, bid) => {
    if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenID, _tokenID)) {
      setWinner({ bidder, bid, lastBidTime: Zero })
      setAuction(prev => {
        if (!prev) return prev
        const next = { ...prev, resulted: true }
        onAuctionResultedRef?.(next, { bidder, bid, lastBidTime: Zero })
        return next
      })
    }
  })

  return {
    auction,
    auctionHighestBidder: highestBidder,
    auctionWinner: winner,
    auctionHasStarted: hasStarted,
    auctionHasEnded: hasEnded,
    isLoadingAuction,
    isLoadingHighestBidder,
    refreshAuction: refresh,
  }
}

export type AuctionCreatedEventArgs = [contractAddress: string, tokenID: BigNumber]

export function useAuctionCreatedListener(
  contract: AuctionContract | null,
  handler: (...args: AuctionCreatedEventArgs) => void,
) {
  return useContractListener(contract, 'AuctionCreated', handler)
}

export type AuctionStartTimeUpdatedEventArgs = [contractAddress: string, tokenID: BigNumber, startTime: BigNumber]

export function useAuctionStartTimeUpdatedListener(
  contract: AuctionContract | null,
  handler: (...args: AuctionStartTimeUpdatedEventArgs) => void,
) {
  return useContractListener(contract, 'UpdateAuctionStartTime', handler)
}

export type AuctionEndTimeUpdatedEventArgs = [contractAddress: string, tokenID: BigNumber, endTime: BigNumber]

export function useAuctionEndTimeUpdatedListener(
  contract: AuctionContract | null,
  handler: (...args: AuctionEndTimeUpdatedEventArgs) => void,
) {
  return useContractListener(contract, 'UpdateAuctionEndTime', handler)
}

export type AuctionReservePriceUpdatedEventArgs = [
  contractAddress: string,
  tokenID: BigNumber,
  paymentToken: string,
  price: BigNumber,
]

export function useAuctionReservePriceUpdatedListener(
  contract: AuctionContract | null,
  handler: (...args: AuctionReservePriceUpdatedEventArgs) => void,
) {
  return useContractListener(contract, 'UpdateAuctionReservePrice', handler)
}

export type MinBidIncrementUpdatedEventArgs = [minBidIncrement: BigNumber]

export function useMinBidIncrementUpdatedListener(
  contract: AuctionContract | null,
  handler: (...args: MinBidIncrementUpdatedEventArgs) => void,
) {
  return useContractListener(contract, 'UpdateMinBidIncrement', handler)
}

export type BidPlacedEventArgs = [contractAddress: string, tokenID: BigNumber, bidder: string, bid: BigNumber]

export function useBidPlacedListener(contract: AuctionContract | null, handler: (...args: BidPlacedEventArgs) => void) {
  return useContractListener(contract, 'BidPlaced', handler)
}

export type BidWithdrawnEventArgs = [contractAddress: string, tokenID: BigNumber, bidder: string, bid: BigNumber]

export function useBidWithdrawnListener(
  contract: AuctionContract | null,
  handler: (...args: BidWithdrawnEventArgs) => void,
) {
  return useContractListener(contract, 'BidWithdrawn', handler)
}

export type AuctionCancelledEventArgs = [contractAddress: string, tokenID: BigNumber]

export function useAuctionCancelledListener(
  contract: AuctionContract | null,
  handler: (...args: AuctionCancelledEventArgs) => void,
) {
  return useContractListener(contract, 'AuctionCancelled', handler)
}

export type AuctionResultedEventArgs = [
  contractAddress: string,
  tokenID: BigNumber,
  winner: string,
  paymentToken: string,
  unitPrice: BigNumber,
  winningBid: BigNumber,
]

export function useAuctionResultedListener(
  contract: AuctionContract | null,
  handler: (...args: AuctionResultedEventArgs) => void,
) {
  return useContractListener(contract, 'AuctionResulted', handler)
}

export function useMinBidIncreasement(contract: AuctionContract | null) {
  const [value, setValue] = useState(Zero)

  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (!contract) return

    setLoading(true)

    contract
      .minBidIncrement()
      .then(setValue)
      .catch(() => setValue(Zero))
      .then(() => setLoading(false))
  }, [contract])

  useMinBidIncrementUpdatedListener(contract, setValue)

  return [value, isLoading] as const
}

function isAuctionStarted(auction?: Auction) {
  return auction && DateTime.fromSeconds(auction.startTime.toNumber()).diffNow().valueOf() <= 0
}

function isAuctionEnded(auction?: Auction) {
  return auction && DateTime.fromSeconds(auction.endTime.toNumber()).diffNow().valueOf() <= 0
}
