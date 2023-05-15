import { AddressZero } from '@ethersproject/constants'
import { ChainId } from '../network'
import { ChainlinkFeed } from '../contract'

export interface BaseTokenMeta {
  readonly address: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly icon: string
  readonly chainId: ChainId
  readonly isNative?: boolean
  readonly isStableCoin?: boolean
  readonly coingeckoId?: string
  readonly chainlinkFeed?: ChainlinkFeed
  /**
   * is able to pay on marketplace
   */
  readonly isTradable?: boolean
}

export interface NativeTokenMeta extends BaseTokenMeta {
  readonly address: typeof AddressZero
  readonly isNative: true
}

export interface Erc20TokenMeta extends BaseTokenMeta {
  readonly isNative?: false
}

export type TokenMeta = NativeTokenMeta | Erc20TokenMeta
