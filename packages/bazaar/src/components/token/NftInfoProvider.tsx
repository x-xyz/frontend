import { DateTime } from 'luxon'
import { createContext, useCallback, useContext, useState } from 'react'
import { useCollectionQuery } from '@x/apis'
import {
  useLazyTokenQuery,
  useLazyTokenOffersQuery,
  useLazyTokenHistoriesQuery,
  useLazyTokenListingQuery,
} from '@x/apis'
import { useParsedMetadata, ParsedMetadata } from '@x/hooks'
import { useEffect, useMemo } from 'react'
import { ChainId } from '@x/constants'
import { Ownership } from '@x/models'
import { Collection } from '@x/models'
import { useActiveWeb3React } from '@x/hooks'
import { useErc721Owner } from '@x/hooks'
import { useErc1155Ownership } from '@x/hooks'
import { compareAddress, compareBigNumberish } from '@x/utils'
import {
  useItemCanceledListener,
  useItemListedListener,
  useItemUpdatedListener,
  useItemSoldListener,
  useOfferCreatedListener,
  useOfferCanceledListener,
  useReadonlyMarketplaceContract,
} from '@x/hooks'
import { useReadonlyAuctionContract, useRunningAuction } from '@x/hooks'
import { findToken } from '@x/constants'
import { formatUnits } from '@ethersproject/units'
import { BigNumberish } from '@ethersproject/bignumber'
import { NftItem, TokenHistory, TokenListing, TokenOffer, TokenType } from '@x/models'
import { useAuthToken } from '@x/hooks'

interface NftInfoContext {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
  detail?: NftItem
  isLoadingDetial: boolean
  collection?: Collection
  isLoadingCollection: boolean
  metadata?: ParsedMetadata
  isLoadingMetadata: boolean
  histories: TokenHistory[]
  isLoadingHistories: boolean
  listings: TokenListing[]
  isLoadingListings: boolean
  offers: TokenOffer[]
  isLoadingOffers: boolean
  setOffers: React.Dispatch<React.SetStateAction<TokenOffer[]>>
  bestListing?: TokenListing
  isLiked?: boolean
  isLoadingIsLiked: boolean
  tokenSpec?: TokenType
  owner?: string
  setOwner: React.Dispatch<React.SetStateAction<string | undefined>>
  isLoadingOwner: boolean
  myHolding?: Ownership
  isLoadingMyHolding: boolean
  myOffer?: TokenOffer
  myListing?: TokenListing
  isMine: boolean
  runningAuction: ReturnType<typeof useRunningAuction>
  refresh: () => void
}

const Context = createContext<NftInfoContext | null>(null)

export interface NftInfoProviderProps {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
  children: React.ReactNode
  enableEventListener?: boolean
}

export default function NftInfoProvider({
  chainId,
  contractAddress,
  tokenId,
  enableEventListener,
  children,
}: NftInfoProviderProps) {
  const { account } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const [fetchDetial, { data: detail, isLoading: isLoadingDetial }] = useLazyTokenQuery()

  const [fetchOffers, { data: offersResp, isLoading: isLoadingOffers }] = useLazyTokenOffersQuery()

  const [fetchHistories, { data: historiesResp, isLoading: isLoadingHistories }] = useLazyTokenHistoriesQuery()

  const [fetchListings, { data: listingsResp, isLoading: isLoadingListings }] = useLazyTokenListingQuery()

  useEffect(() => {
    fetchDetial({ chainId, contract: contractAddress, tokenId: tokenId.toString(), authToken })
    fetchOffers({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
    fetchHistories({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
    fetchListings({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
  }, [authToken, chainId, contractAddress, tokenId, fetchDetial, fetchOffers, fetchHistories, fetchListings])

  const refresh = useCallback(() => {
    fetchDetial({ chainId, contract: contractAddress, tokenId: tokenId.toString(), authToken })
    fetchOffers({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
    fetchHistories({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
    fetchListings({ chainId, contract: contractAddress, tokenId: tokenId.toString() })
  }, [authToken, chainId, contractAddress, tokenId, fetchDetial, fetchOffers, fetchHistories, fetchListings])

  const tokenSpec = useMemo(() => {
    if (detail?.status !== 'success') return
    return detail.data.tokenType
  }, [detail])

  const { data: collection, isLoading: isLoadingCollection } = useCollectionQuery({
    chainId,
    contract: contractAddress,
  })

  const [metadata, isLoadingMetadata] = useParsedMetadata(detail?.data?.hostedTokenUri || detail?.data?.tokenUri)

  const [owner, isLoadingOwner, setOwner] = useErc721Owner({
    chainId,
    contractAddress,
    tokenId,
    disabled: tokenSpec === 1155,
  })

  const [myHolding, isLoadingMyHolding] = useErc1155Ownership({
    chainId,
    contractAddress,
    tokenID: tokenId,
    account,
    disabled: tokenSpec !== 1155,
  })

  const [listings, setListings] = useState<TokenListing[]>([])

  const [offers, setOffers] = useState<TokenOffer[]>([])

  const [histories, setHistories] = useState<TokenHistory[]>([])

  /**
   * @todo is it possible to have multiple listings at same time?
   */
  const bestListing = useMemo(() => listings[0], [listings])

  const myOffer = useMemo(() => offers.find(offer => compareAddress(offer.creator, account)), [offers, account])

  const myListing = useMemo(() => listings.find(listing => compareAddress(listing.owner, account)), [listings, account])

  const isMine = tokenSpec === 721 ? compareAddress(owner, account) : !!myHolding

  useEffect(
    () =>
      setOffers(offersResp?.data?.filter(offer => DateTime.fromMillis(offer.deadline).diffNow().valueOf() > 0) || []),
    [offersResp],
  )

  useEffect(() => setListings(listingsResp?.data || []), [listingsResp])

  useEffect(() => setHistories(historiesResp?.data || []), [historiesResp])

  const readonlyAuctionContract = useReadonlyAuctionContract(chainId)

  const readonlyMarketplaceContract = useReadonlyMarketplaceContract(chainId)

  const runningAuction = useRunningAuction(readonlyAuctionContract, contractAddress, tokenId, {
    onAuctionResulted: (_, winner) => setOwner(winner.bidder),
  })

  useItemListedListener(
    enableEventListener ? readonlyMarketplaceContract : null,
    (owner, _contractAddress, _tokenID, quantity, paymentToken, pricePerItem, startingTime, deadline) => {
      if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenId, _tokenID)) {
        const token = findToken(paymentToken, chainId)

        setListings(prev => [
          ...prev,
          {
            chainId,
            minter: contractAddress,
            owner,
            paymentToken,
            price: parseFloat(formatUnits(pricePerItem, token?.decimals)),
            priceInUsd: 0,
            quantity: quantity.toNumber(),
            startTime: startingTime.toString(),
            tokenId: _tokenID.toNumber(),
            deadline: DateTime.fromSeconds(deadline.toNumber()).toISO(),
          },
        ])
      }
    },
  )

  useItemUpdatedListener(
    enableEventListener ? readonlyMarketplaceContract : null,
    (owner, _contractAddress, _tokenID, paymentToken, newPrice) => {
      if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenId, _tokenID)) {
        const token = findToken(paymentToken, chainId)

        setListings(prev => {
          const index = prev.findIndex(listing => compareAddress(listing.owner, owner))
          if (index < 0) return prev
          return [
            ...prev.slice(0, index),
            { ...prev[index], paymentToken, price: parseFloat(formatUnits(newPrice, token?.decimals)) },
            ...prev.slice(index + 1),
          ]
        })
      }
    },
  )

  useItemCanceledListener(
    enableEventListener ? readonlyMarketplaceContract : null,
    (owner, _contractAddress, _tokenID) => {
      if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenId, _tokenID)) {
        setListings(prev => prev.filter(listing => listing.owner === owner))
      }
    },
  )

  useItemSoldListener(
    enableEventListener ? readonlyMarketplaceContract : null,
    (seller, buyer, _contractAddress, _tokenID) => {
      if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenId, _tokenID)) {
        setListings(prev => prev.filter(listing => compareAddress(listing.owner, seller)))
        setOwner(buyer)
      }
    },
  )

  useOfferCreatedListener(
    enableEventListener ? readonlyMarketplaceContract : null,
    (creator, _contractAddress, _tokenID, quantity, payToken, pricePerItem, deadline) => {
      if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenId, _tokenID)) {
        const token = findToken(payToken, chainId)

        setOffers(prev => [
          {
            chainId,
            creator,
            deadline: deadline.toNumber() * 1000,
            minter: _contractAddress,
            paymentToken: payToken,
            priceInUsd: 0,
            pricePerItem: parseFloat(formatUnits(pricePerItem, token?.decimals)),
            quantity: quantity.toString(),
            tokenId: _tokenID.toNumber(),
          },
          ...prev,
        ])
      }
    },
  )

  useOfferCanceledListener(
    enableEventListener ? readonlyMarketplaceContract : null,
    (creator, _contractAddress, _tokenID) => {
      if (compareAddress(contractAddress, _contractAddress) && compareBigNumberish(tokenId, _tokenID)) {
        setOffers(prev => prev.filter(offer => !compareAddress(offer.creator, creator)))
      }
    },
  )

  const value: NftInfoContext = {
    chainId,
    contractAddress,
    tokenId,
    detail: detail?.data,
    isLoadingDetial,
    collection: collection?.data,
    isLoadingCollection,
    metadata,
    isLoadingMetadata,
    histories,
    isLoadingHistories,
    listings,
    isLoadingListings,
    offers,
    isLoadingOffers,
    setOffers,
    bestListing,
    isLiked: detail?.data?.isLiked,
    isLoadingIsLiked: isLoadingDetial,
    tokenSpec,
    owner,
    setOwner,
    isLoadingOwner,
    myHolding,
    isLoadingMyHolding,
    myOffer,
    myListing,
    isMine,
    runningAuction,
    refresh,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useNftInfo() {
  const context = useContext(Context)

  if (!context) throw new Error('not found provider')

  return context
}

export function useParentNftInfo() {
  return useContext(Context)
}
