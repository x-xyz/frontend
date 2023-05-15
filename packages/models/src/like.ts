import { ChainId } from './network'

export interface Like {
  chainId: ChainId
  contractAddress: string
  tokenID: number
  follower: string
}
