import { ChainId } from './network'
import { SimpleNftItem } from './token'

export interface Account {
  address: string
  alias: string
  email: string
  bio: string
  imageHash: string
  imageUrl: string
  bannerHash: string
  bannerUrl: string
  followers: number
  followings: number
  customTokens?: string[]
  isModerator: boolean
  createdAtMs: number
  website: string
  twitter: string
  instagram: string
  discord: string
}

export const noopAccount: Account = {
  address: '',
  alias: '',
  email: '',
  bio: '',
  imageHash: '',
  imageUrl: '',
  bannerHash: '',
  bannerUrl: '',
  followers: 0,
  followings: 0,
  isModerator: false,
  createdAtMs: 0,
  website: '',
  twitter: '',
  instagram: '',
  discord: '',
}

export interface SimpleAccount {
  address: string
  alias: string
  imageHash: string
  imageUrl: string
}

export interface PatchableAccount {
  alias?: string
  email?: string
  bio?: string
  website?: string
  twitter?: string
  instagram?: string
  discord?: string
  /**
   * @deprecated
   */
  imgData?: string
  avatarImgData?: string
  bannerImgData?: string
}

export interface NotificationSettings {
  address: string
  fBundleCreation: boolean
  fBundleList: boolean
  fBundlePrice: boolean
  fNftAuction: boolean
  fNftAuctionPrice: boolean
  fNftList: boolean
  fNftPrice: false
  fNotification: boolean
  sAuctionOfBidCancel: boolean
  sAuctionWin: boolean
  sBundleBuy: boolean
  sBundleOffer: boolean
  sBundleOfferCancel: boolean
  sBundleSell: boolean
  sNftAuctionPrice: boolean
  sNftBidToAuction: boolean
  sNftBidToAuctionCancel: boolean
  sNftBuy: boolean
  sNftOffer: boolean
  sNftOfferCancel: boolean
  sNftSell: boolean
  sNotification: boolean
}

export enum ActivityTypeV2 {
  List = 'list',
  UpdateListing = 'updateListing',
  CancelListing = 'cancelListing',
  Buy = 'buy',
  Sold = 'sold',
  CreateOffer = 'createOffer',
  AcceptOffer = 'acceptOffer',
  OfferTaken = 'offerTaken',
  CancelOffer = 'cancelOffer',
  CreateAuction = 'createAuction',
  PlaceBid = 'placeBid',
  WithdrawBid = 'withdrawBid',
  BidRefunded = 'bidRefunded',
  ResultAuction = 'resultAuction',
  WonAuction = 'wonAuction',
  CancelAuction = 'cancelAuction',
  UpdateAuctionReservePrice = 'updateAuctionReservePrice',
  UpdateAuctionStartTime = 'updateAuctionStartTime',
  UpdateAuctionEndTime = 'updateAuctionEndTime',
  Transfer = 'transfer',
  Mint = 'mint',

  LegacyBid = 'bid',
  LegacyOffer = 'offer',
  LegacySale = 'sale',
}

export interface Activity {
  type: ActivityTypeV2
  token: SimpleNftItem
  owner?: SimpleAccount
  quantity: number
  price: number
  paymentToken: string
  priceInUsd: number
  txHash: string
  createdAt: string
  to: {
    address: string
    alias: string
    imageHash: string
  }
}

export interface ActivitiesResult {
  activities?: Activity[]
  count: number
}

export interface SearchActivitiesParams {
  offset?: number
  limit?: number
  chainId?: ChainId
  contract?: string
  tokenId?: string | number
  types?: ActivityTypeV2[]
}

export interface PendingOffer {
  token: SimpleNftItem
  offeror: SimpleAccount
  quantity: number
  price: number
  paymentToken: string
  priceInUsd: number
  createdAt: string
  deadline: number
}

export interface PendingOffersResult {
  data?: PendingOffer[]
  count: number
}

export interface SearchPendingOffersParams {
  offset?: number
  limit?: number
  chainId?: ChainId
  contract?: string
  tokenId?: string | number
}

export interface AccountStat {
  single: number
  bundle: number
  favorite: number
  collections: number
  createdNfts: number
  createdCollections: number
}

export interface NotificationSettings {
  address: string
  fBundleCreation: boolean
  fBundleList: boolean
  fBundlePrice: boolean
  fNftAuction: boolean
  fNftAuctionPrice: boolean
  fNftList: boolean
  fNftPrice: false
  fNotification: boolean
  sAuctionOfBidCancel: boolean
  sAuctionWin: boolean
  sBundleBuy: boolean
  sBundleOffer: boolean
  sBundleOfferCancel: boolean
  sBundleSell: boolean
  sNftAuctionPrice: boolean
  sNftBidToAuction: boolean
  sNftBidToAuctionCancel: boolean
  sNftBuy: boolean
  sNftOffer: boolean
  sNftOfferCancel: boolean
  sNftSell: boolean
  sNotification: boolean
}

export interface AccountCollectionSummary {
  totalCollectionValue: number
  nftCount: number
  collectionCount: number
  totalCollectionValueChange: number
  instantLiquidityValue: number
  instantLiquidityRatio: number
}

export interface AccountOrderNonce {
  nonce: string
}
