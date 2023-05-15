export enum ActivityHistoryType {
  List = 'list',
  UpdateListing = 'updateListing',
  CancelListing = 'cancelListing',
  Buy = 'buy',
  Sold = 'sold',
  CreateOffer = 'createOffer',
  AcceptOffer = 'acceptOffer',
  OfferTaken = 'offerTaken',
  CancelOffer = 'cancelOffer',

  // auction
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
}

export interface ActivityHistory {
  chainId: string
  contractAddress: string
  tokenId: string
  type: ActivityHistoryType
  account: string
  quantity: string
  price: string
  paymentToken: string
  priceInUsd: number
  priceInNative: number
  blockNumber: number
  txHash: string
  time: string
  to?: string
}

export interface ActivityHistoryResult {
  items: ActivityHistory[] | null
  count: number
}
