import { BigNumber } from '@ethersproject/bignumber'

export interface Listing {
  quantity: BigNumber
  payToken: string
  pricePerItem: BigNumber
  startingTime: BigNumber
}
