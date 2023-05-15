import { ChainId } from './network'
import { Category } from './category'
import { SortDir } from './misc'
import { TokenType } from './token'

export interface Collection {
  tokenType: TokenType
  chainId: ChainId
  erc721Address: string
  categories: string[]
  collectionName: string
  description: string
  discord: string
  isInternal: boolean
  isOwnerble: boolean
  isVerified: boolean
  isRegistered: boolean
  logoImageHash: string
  logoImageUrl: string
  coverImageHash: string
  coverImageUrl: string
  mediumHandle: string
  siteUrl: string
  telegram: string
  twitterHandle: string
  email: string
  feeRecipient: string
  owner: string
  // in percentage, 5 means 5%
  royalty: number
  instagramHandle: string
  supply?: number
  numOwners?: number
  numOwnersMovement?: number
  // trait type -> trait value -> count
  attributes?: Record<string, Record<string, number>>
  floorPrice: number
  floorPriceMovement: number
  usdFloorPrice: number
  hasFloorPrice: boolean
  highestSale: number
  highestSaleInUsd: number
  lastSoldAt: string
  hasBeenSold: number
  lastListedAt: string
  hasBeenListed: number
  // trait type -> trait name -> number
  traitFloorPrice?: Record<string, Record<string, number | undefined> | undefined>
  openseaFloorPriceInNative: number
  openseaFloorPriceInUsd: number
  openseaFloorPriceMovement: number
  openseaFloorPriceInApe: number
  openseaSalesVolume: number
  openseaSalesVolumeChange: number
  holdingCount: number
  holdingBalance?: number
}

export interface RegisterCollection {
  authToken: string
  collectionName: string
  description: string
  royalty: number
  feeRecipient: string
  categories: string[]
  erc721Address: string
  siteUrl: string
  twitterHandle: string
  discord: string
  instagramHandle: string
  mediumHandle: string
  telegram: string
  email: string
  logoImage: string
  coverImage?: string
  signature: string
  chainId: ChainId
}

export enum CollectionSortOption {
  ListedAtDesc = 'listed_at_high_to_low',
  SoldAtDesc = 'sold_at_high_to_low',
  FloorPriceAsc = 'floor_price_low_to_high',
  FloorPriceDesc = 'floor_price_high_to_low',
  ViewedDesc = 'viewed_high_to_low',
  LikedDesc = 'liked_high_to_low',
  CreatedAtAsc = 'created_at_low_to_high',
  CreatedAtDesc = 'created_at_high_to_low',
  HoldingAsc = 'holding_low_to_high',
  HoldingDesc = 'holding_high_to_low',
  NameAsc = 'name_low_to_high',
  NameDesc = 'name_high_to_low',
}

export interface SearchCollectionParams {
  authToken?: string
  limit?: number
  offset?: number
  sortBy?: CollectionSortOption
  /**
   * @deprecated
   */
  sortDir?: SortDir
  chainId?: ChainId
  category?: Category
  belongsTo?: string
  includeUnregistered?: boolean
  floorPriceLTE?: string
  floorPriceGTE?: string
  usdFloorPriceLTE?: string
  usdFloorPriceGTE?: string
  holder?: string
  yugaLab?: boolean
}

export interface CollectionIdentityParams {
  chainId: ChainId
  contract: string
}

export interface CollectionWithTradingVolume {
  chainId: string
  erc721Address: string
  collectionName: string
  logoImageHash: string
  logoImageUrl: string
  volume: number
  volumeInUsd: number
  volumeInApe: number
  changeRatio: number
  openseaFloorPriceInNative: number
  openseaFloorPriceInUsd: number
  openseaFloorPriceMovement: number
  openseaFloorPriceInApe: number
  sales: number
  supply: number
  numOwners: number
  eligibleForPromo: boolean
}

export enum CollectionTradingVolumePeriod {
  Day = 1,
  Week,
  Month,
  All,
}

export interface TopCollectionParams {
  periodType: CollectionTradingVolumePeriod
  limit: number
  yugaLab?: boolean
}

export enum TradingVolumePeriod {
  Unknown,
  Day, // 24 hours
  Week, // 7 days
  Month, // 30 days
  All, // all time
}

export interface TradingVolume {
  chainId: string
  address: string
  periodType: TradingVolumePeriod
  date: string
  volume: number
  volumeInUsd: number
}

export interface CollectionWithAccountStat extends Collection {
  ownedNftCount: number
  totalValue: number
  totalValueMovement: number
  instantLiquidityInUsd: number
  instantLiquidityRatio: number
}

export interface TwelvefoldItem {
  Edition: string
  Series: string
  Season: string
}

export interface TwelvefoldCollectionParams {
  series?: string
  season?: string
  limit?: number
  offset?: number
}
