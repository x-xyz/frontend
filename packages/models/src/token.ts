import { JsonRpcSigner } from '@ethersproject/providers'
import { BytesLike, splitSignature } from 'ethers/lib/utils'
import { DateTime } from 'luxon'
import { ChainId } from './network'
import { SortDir } from './misc'

export interface NftItemId {
  chainId: ChainId
  contractAddress: string
  tokenId: string
}

export enum TokenType {
  Erc721 = 721,
  Erc1155 = 1155,
  Ordinals = 0,
}

export interface TokenAttribute {
  trait_type: string
  /**
   * marshaled string
   */
  value: string
  display_type?: string
}

export enum PriceSource {
  Listing = 'listing',
  Offer = 'offer',
  AuctionReserve = 'auction_reserve',
  AuctionBid = 'auction_bid',
}

export interface NftItem {
  contractAddress: string
  isAppropriate: boolean
  lastSalePrice: number
  lastSalePriceInUSD: number
  // token symbol
  lastSalePricePaymentToken: string
  // 0, 1
  liked: number
  viewed: number
  name: string
  // token symbol
  paymentToken: string
  price: number
  priceInUsd: number
  priceSource?: PriceSource
  supply: number
  thumbnailPath: string
  tokenId: string
  tokenType: TokenType
  // if present, it is on auction
  saleEndsAt?: string
  chainId: ChainId
  // inject by `GET /tokens` & `GET /token`
  isLiked?: boolean
  // inject by `GET /token`
  hasUnlockable?: boolean
  // erc721 owner
  owner?: string
  // count of erc1155 owner
  numOwners?: number
  attributes?: TokenAttribute[]
  balance?: number

  // selling status
  activeListing?: OrderItem
  listings: OrderItem[]
  offers: OrderItem[]
  auction?: TokenAuction
  highestBid?: TokenBid

  // assets
  imageUrl: string
  tokenUri: string
  hostedImageUrl?: string
  hostedTokenUri?: string
  contentType: 'image' | 'video' | 'embed' | 'gif' | 'youtube'
  animationUrl?: string
  hostedAnimationUrl?: string
  animationUrlContentType?: 'video'
  animationUrlMimeType?: string // 'video/mp4'
}

export interface SimpleNftItem {
  chainId: ChainId
  contract: string
  tokenId: string | number
  name: string
  tokenUri: string
  thumbnailPath: string
  imagePath: string
  imageUrl: string
  hostedImageUrl?: string
}

export interface TokenSearchResult {
  items: NftItem[] | null
  count: number
}

export type TokenSaleType = 'all' | 'single' | 'bundle'

export enum TokenStatus {
  BuyNow = 'buynow',
  HasBid = 'hasbid',
  HasOffer = 'hasoffer',
  OnAuction = 'onauction',
  HasTraded = 'hastraded',
}

export enum SortableColumn {
  CreatedAt = 'createdAt',
  Viewed = 'viewed',
  Liked = 'liked',
  Price = 'price',
  LastPrice = 'lastSalePrice',
  ListedAt = 'listedAt',
  SoldAt = 'soldAt',
  AuctionStartTime = 'auctionStartTime',
  AuctionEndTime = 'auctionEndTime',
}

export interface SearchTokenParams {
  offset?: number
  limit?: number
  sortBy?: SortableColumn
  sortDir?: SortDir
  status?: TokenStatus[]
  collections?: string[]
  category?: string
  chainId?: ChainId
  belongsTo?: string
  type?: TokenSaleType
  likedBy?: string
  attrFilters?: { name: string; values: string[] }[]
}

export function tokenV2SortOptionToLegacySortOptions(value: TokenV2SortOption): [SortableColumn, SortDir] {
  switch (value) {
    case TokenV2SortOption.ListedAtDesc:
      return [SortableColumn.ListedAt, SortDir.Desc]
    case TokenV2SortOption.SoldAtDesc:
      return [SortableColumn.SoldAt, SortDir.Desc]
    case TokenV2SortOption.PriceAsc:
      return [SortableColumn.Price, SortDir.Asc]
    case TokenV2SortOption.PriceDesc:
      return [SortableColumn.Price, SortDir.Desc]
    case TokenV2SortOption.ViewedDesc:
      return [SortableColumn.Viewed, SortDir.Desc]
    case TokenV2SortOption.LikedDesc:
      return [SortableColumn.Liked, SortDir.Desc]
    case TokenV2SortOption.CreatedAtAsc:
      return [SortableColumn.CreatedAt, SortDir.Asc]
    case TokenV2SortOption.CreatedAtDesc:
      return [SortableColumn.CreatedAt, SortDir.Desc]
    case TokenV2SortOption.AuctionEndingSoon:
      return [SortableColumn.AuctionEndTime, SortDir.Desc]
    case TokenV2SortOption.LastSalePriceAsc:
      return [SortableColumn.LastPrice, SortDir.Asc]
    case TokenV2SortOption.LastSalePriceDesc:
      return [SortableColumn.LastPrice, SortDir.Desc]
    default:
      return [SortableColumn.CreatedAt, SortDir.Desc]
  }
}

export enum TokenV2SortOption {
  ListedAtDesc = 'listed_at_high_to_low',
  SoldAtDesc = 'sold_at_high_to_low',
  PriceAsc = 'price_low_to_high',
  PriceDesc = 'price_high_to_low',
  ViewedDesc = 'viewed_high_to_low',
  LikedDesc = 'liked_high_to_low',
  CreatedAtAsc = 'created_at_low_to_high',
  CreatedAtDesc = 'created_at_high_to_low',
  AuctionEndingSoon = 'auction_ending_soon',
  LastSalePriceAsc = 'last_sale_low_to_high',
  LastSalePriceDesc = 'last_sale_high_to_low',
  OfferPriceAsc = 'offer_price_low_to_high',
  OfferPriceDesc = 'offer_price_high_to_low',
  OfferDeadlineAsc = 'offer_deadline_expired_soon',
  OfferCreatedAsc = 'offer_created_at_low_to_high',
  OfferCreatedDesc = 'offer_created_at_high_to_low',
}

export interface SearchTokenV2Params {
  offset?: number
  limit?: number
  sortBy?: TokenV2SortOption
  status?: TokenStatus[]
  collections?: string[]
  category?: string
  chainId?: ChainId
  belongsTo?: string
  notBelongsTo?: string
  listingFrom?: string
  type?: TokenSaleType
  likedBy?: string
  attrFilters?: { name: string; values: string[] }[]
  priceGTE?: number
  priceLTE?: number
  priceInUsdGTE?: number
  priceInUsdLTE?: number
  offerPriceInUsdGTE?: number
  offerPriceInUsdLTE?: number
  folderId?: string
  // token name
  name?: string
  // search name and trait
  search?: string
  offerOwners?: string[]
  tokenType?: number
  bidOwner?: string
  includeOrders?: boolean
  includeInactiveOrders?: boolean
}

export interface TokenIdentityParams {
  chainId: ChainId
  contract: string
  tokenId: string | number
}

export interface TokenUploadParams {
  name: string
  description: string
  xtra: string
  image: string
  royalty: string
  collectionName?: string
}

export interface TokenUploadResult {
  fileHash?: string
  jsonHash?: string
  fileUrl?: string
  jsonUrl?: string
}

/**
 * @todo remove chainId, minter, tokenId
 */
export interface TokenOffer {
  owner: string
  payToken: string
  quantity: string
  pricePerItem: string
  deadline: string
  createdAt: string
  blockNumber: number
  displayPrice: string
  priceInUsd: number
  priceInNative: number
}

export interface TokenHistory {
  value: number
  paymentToken: string
  priceInUsd: number
  isAuction: boolean
  chainId: ChainId
  collectionAddress: string
  tokenId: number
  from: string
  to: string
  price: number
  txHash: string
  createdAt: string
  updatedAt: string
}

export interface TokenListing {
  owner: string
  quantity: string
  payToken: string
  pricePerItem: string
  startTime: string
  deadline: string
  blockNumber: number
  displayPrice: string
  priceInUsd: number
  priceInNative: number
}

export function listingExpired(listing: OrderItem) {
  if (DateTime.fromISO(listing.endTime).equals(DateTime.fromSeconds(0)) || !listing.endTime) {
    return false
  }
  return DateTime.fromISO(listing.endTime) <= DateTime.now()
}

export type TokenSortOption =
  | 'createdAt'
  | 'oldest'
  | 'listedAt'
  | 'soldAt'
  | 'saleEndsAt'
  | 'price'
  | 'cheapest'
  | 'lastSalePrice'
  | 'viewed'

export interface TokenMetadata {
  name: string
  description?: string
  image: string
  attributes?: { trait_type: string; value: string }[]
  properties?: Record<string, unknown>
  external_url?: string
}

export interface TokenAuction {
  blockNumber: number
  displayPrice: string
  owner: string
  payToken: string
  priceInNative: number
  priceInUsd: number
  reservePrice: string
  startTime?: string
  endTime?: string
}

export const noopTokenAuction: TokenAuction = {
  blockNumber: 0,
  displayPrice: '',
  owner: '',
  payToken: '',
  priceInNative: 0,
  priceInUsd: 0,
  reservePrice: '',
  startTime: '',
  endTime: '',
}

export interface TokenBid {
  owner: string
  payToken: string
  reservePrice: string
  bidTime: string
  bid: string
  // additional info
  blockNumber: number
  priceInUsd: number // price when created
}

export interface PriceHistory {
  priceInUsd: number
  priceInNative: number
  time: string
}

export interface TokenLore {
  author: {
    displayName: string
    primaryWallet: string
    profilePhotoUrl: string
    verifiedProfileImage:
      | string
      | {
          imageUrl: string
        }
  }
  previewText: string
  previewImageUrl: string
  createdAt: string
  _id: string
}

export enum FeeDistType {
  Burn = 'burn',
  Donate = 'donate',
}

export interface Order {
  chainId: ChainId
  isAsk: boolean
  signer: string
  items: {
    collection: string
    tokenId: string
    amount: string
    price: string
  }[]
  strategy: string
  currency: string
  nonce: string
  startTime: string // unix timestamp in second
  endTime: string // unix timestamp in second
  minPercentageToAsk: string
  marketplace: BytesLike // keccak256 hash
  params: BytesLike
  feeDistType: FeeDistType
}

export interface SignedOrder extends Order {
  s: string
  r: string
  v: number
}

const makerOrderFields = {
  MakerOrder: [
    { name: 'isAsk', type: 'bool' },
    { name: 'signer', type: 'address' },
    { name: 'items', type: 'OrderItem[]' },
    { name: 'strategy', type: 'address' },
    { name: 'currency', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'startTime', type: 'uint256' },
    { name: 'endTime', type: 'uint256' },
    { name: 'minPercentageToAsk', type: 'uint256' },
    { name: 'marketplace', type: 'bytes32' },
    { name: 'params', type: 'bytes' },
  ],
  OrderItem: [
    { name: 'collection', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'amount', type: 'uint256' },
    { name: 'price', type: 'uint256' },
  ],
}

function getDomainSeperater(chainId: number, address: string) {
  return {
    name: 'XExchange',
    version: '1',
    chainId: chainId,
    verifyingContract: address,
  }
}

export async function signMakerOrder(
  signer: JsonRpcSigner,
  chainId: ChainId,
  exchangeAddress: string,
  order: Order,
): Promise<SignedOrder> {
  const domain = getDomainSeperater(chainId, exchangeAddress)
  const digest = await signer._signTypedData(domain, makerOrderFields, order)
  const signature = splitSignature(digest)
  return {
    ...order,
    s: signature.s,
    r: signature.r,
    v: signature.v,
  }
}

export enum ListingStrategy {
  FixedPrice = 'fixedPrice',
  PrivateSale = 'privateSale',
  CollectionOffer = 'collectionOffer',
}

export interface OrderItem {
  chainId: ChainId
  collection: string
  tokenId: string
  amount: string
  price: string
  itemIdx: number
  orderHash: string
  orderItemHash: string
  isAsk: boolean
  signer: string // the address who signed this listing
  nonce: string
  currency: string
  startTime: string // ISO time
  endTime: string // ISO time
  minPercentageToAsk: string
  marketplace: string
  strategy: ListingStrategy
  reservedBuyer: string
  displayPrice: string
  priceInUsd: number
  priceInNative: number

  isValid: boolean
  isUsed: boolean
}

export function orderItemExpired(orderItem: OrderItem) {
  if (DateTime.fromISO(orderItem.endTime).equals(DateTime.fromSeconds(0)) || !orderItem.endTime) {
    return false
  }
  return DateTime.fromISO(orderItem.endTime) <= DateTime.now()
}
