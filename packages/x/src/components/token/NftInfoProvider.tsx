import { OrderItem } from '@x/models/dist'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import { BigNumberish } from '@ethersproject/bignumber'
import { fetchCollectionV2, fetchTokenMetadataV2, fetchTokenV2 } from '@x/apis/dist/fn'
import { ChainId } from '@x/constants'
import {
  ParsedMetadata,
  useActiveWeb3React,
  useAuthToken,
  useErc1155Balance,
  useErc721Owner,
  useReadonlyAuctionContract,
  useRunningAuction,
} from '@x/hooks'
import { Collection, NftItem, TokenType } from '@x/models'
import { compareAddress } from '@x/utils'

interface NftInfoContext {
  chainId: ChainId
  contractAddress: string
  tokenId: BigNumberish
  detail?: NftItem
  isLoadingDetail: boolean
  collection?: Collection
  isLoadingCollection: boolean
  metadata?: ParsedMetadata
  isLoadingMetadata: boolean
  listings: OrderItem[]
  isLoadingListings: boolean
  offers: OrderItem[]
  isLoadingOffers: boolean
  setOffers: React.Dispatch<React.SetStateAction<OrderItem[]>>
  bestListing?: OrderItem
  isLiked?: boolean
  isLoadingIsLiked: boolean
  tokenSpec?: TokenType
  owner?: string
  setOwner: React.Dispatch<React.SetStateAction<string | undefined>>
  isLoadingOwner: boolean
  myHolding?: number
  isLoadingMyHolding: boolean
  myOffer?: OrderItem
  myListing?: OrderItem
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
  initialNftItem?: NftItem
}

export default function NftInfoProvider({
  chainId,
  contractAddress,
  tokenId,
  initialNftItem,
  children,
}: NftInfoProviderProps) {
  const { account } = useActiveWeb3React()

  const [authToken] = useAuthToken()
  const [listings, setListings] = useState<OrderItem[]>([])
  const [offers, setOffers] = useState<OrderItem[]>([])

  const {
    data: detail,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useQuery(['token-detail', chainId, contractAddress, tokenId.toString(), { authToken }], fetchTokenV2, {
    initialData: initialNftItem,
  })

  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', chainId, contractAddress],
    fetchCollectionV2,
  )

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery(
    ['metadata', detail?.hostedTokenUri || detail?.tokenUri || ''],
    fetchTokenMetadataV2,
    { enabled: !!detail },
  )

  const refresh = useCallback(async () => {
    await refetchDetail()
  }, [refetchDetail])

  const tokenSpec = detail?.tokenType

  const [owner, isLoadingOwner, setOwner] = useErc721Owner({
    chainId,
    contractAddress,
    tokenId,
    disabled: tokenSpec === 1155,
  })

  const [myHolding, isLoadingMyHolding] = useErc1155Balance(
    chainId,
    contractAddress,
    `${tokenId}`,
    tokenSpec !== TokenType.Erc1155 ? void 0 : account,
  )

  const myOffer = useMemo(() => offers.find(offer => compareAddress(offer.signer, account)), [offers, account])

  const myListing = useMemo(() => {
    return detail?.listings
      ?.filter(listing => compareAddress(listing.signer, account))
      .sort((a, b) => a.priceInUsd - b.priceInUsd)[0]
  }, [detail, account])

  const bestListing = useMemo(() => {
    return detail?.listings?.sort((a, b) => a.priceInUsd - b.priceInUsd)[0]
  }, [detail])

  const isMine = tokenSpec === TokenType.Erc721 ? compareAddress(owner, account) : !!myHolding

  useEffect(() => setOffers(detail?.offers || []), [detail?.offers])
  useEffect(
    () =>
      setListings(
        detail?.listings?.filter(listing => {
          if (!listing.reservedBuyer) return true
          return compareAddress(listing.reservedBuyer, account)
        }) || [],
      ),
    [detail?.listings, account],
  )

  const readonlyAuctionContract = useReadonlyAuctionContract(chainId)

  const runningAuction = useRunningAuction(readonlyAuctionContract, contractAddress, tokenId, {
    onAuctionResulted: (_, winner) => setOwner(winner.bidder),
  })

  const value: NftInfoContext = {
    chainId,
    contractAddress,
    tokenId,
    detail: detail,
    isLoadingDetail: isLoadingDetail,
    collection,
    isLoadingCollection,
    metadata,
    isLoadingMetadata,
    listings,
    isLoadingListings: isLoadingDetail,
    offers,
    isLoadingOffers: isLoadingDetail,
    setOffers,
    bestListing,
    isLiked: detail?.isLiked,
    isLoadingIsLiked: isLoadingDetail,
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
