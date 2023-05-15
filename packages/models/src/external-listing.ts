import { ChainId } from './network'

export interface ExternalListing {
  owner: string
  chainId: ChainId
  contractAddress: string
  minter: string
  tokenId: string
  quantity: number
  paymentToken: string
  price: string
  priceInUsd: string
  startTime: string // ISO 8601
  deadline: string // ISO 8601
  source: string
  createdTime: string
  updatedTime: string // ISO 8601
}
