import { ChainId } from './network'

export interface Airdrop {
  name: string
  chainId: ChainId
  contractAddress: string
  type: 'once' | 'round'
  deadline: string
  image: string
  rewardTokenAddress: string
  order?: number
}

export interface Proof {
  chainId: ChainId
  contractAddress: string
  claimer: string
  round: number
  amount: string
  proof: string[]
}
