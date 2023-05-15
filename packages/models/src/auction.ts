import { BigNumber } from '@ethersproject/bignumber'

export interface Auction {
  owner: string
  payToken: string
  reservePrice: BigNumber
  startTime: BigNumber
  endTime: BigNumber
  resulted: boolean
}

export interface Bidder {
  bidder: string
  bid: BigNumber
  lastBidTime: BigNumber
}
