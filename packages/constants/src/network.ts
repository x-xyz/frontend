import { AddressZero } from '@ethersproject/constants'
import values from 'lodash/values'
import { ensureNumber } from '@x/utils'
import { ChainId } from '@x/models'
import type { NativeTokenMeta } from './tokens'
import { defaultChainId, chainIdWhitelist } from './env'
import { chainlinkFeeds } from './contract'

export { ChainId } from '@x/models'

export const defaultNetwork = ensureNumber(defaultChainId, ChainId.Ethereum) as ChainId

export interface ChainMetadata {
  readonly name: string
  readonly rpcUrl: string
  readonly blockExplorerUrl: string
  readonly icon: string
  readonly nativeCurrency: NativeTokenMeta
  readonly isTestnet?: boolean
}

export const chainMetadata: Record<ChainId, ChainMetadata> = {
  [ChainId.Ethereum]: {
    name: 'Ethereum',
    rpcUrl: '',
    blockExplorerUrl: 'https://etherscan.io',
    icon: '/assets/icons/eth.svg',
    nativeCurrency: {
      address: AddressZero,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      icon: '/assets/tokens/eth.svg',
      chainId: ChainId.Ethereum,
      isNative: true,
      isTradable: true,
      chainlinkFeed: chainlinkFeeds.ETH,
    },
  },
  [ChainId.Ropsten]: {
    name: 'Ropsten',
    rpcUrl: '',
    blockExplorerUrl: 'https://ropsten.etherscan.io',
    icon: '/assets/icons/eth.svg',
    nativeCurrency: {
      address: AddressZero,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      icon: '/assets/tokens/eth.svg',
      chainId: ChainId.Ropsten,
      isNative: true,
      isTradable: true,
      chainlinkFeed: chainlinkFeeds.ETH,
    },
    isTestnet: true,
  },
  [ChainId.Goerli]: {
    name: 'Goerli',
    rpcUrl: '',
    blockExplorerUrl: 'https://ropsten.etherscan.io',
    icon: '/assets/icons/eth.svg',
    nativeCurrency: {
      address: AddressZero,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      icon: '/assets/tokens/eth.svg',
      chainId: ChainId.Goerli,
      isNative: true,
      isTradable: true,
      chainlinkFeed: chainlinkFeeds.ETH,
    },
    isTestnet: true,
  },
  [ChainId.BinanceSmartChain]: {
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
    icon: '/assets/tokens/bnb.svg',
    nativeCurrency: {
      address: AddressZero,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      icon: '/assets/tokens/bnb.svg',
      chainId: ChainId.BinanceSmartChain,
      isNative: true,
      isTradable: true,
      coingeckoId: 'binancecoin',
      chainlinkFeed: chainlinkFeeds.BNB,
    },
  },
  [ChainId.BinanceSmartChainTestnet]: {
    name: 'Binance Smart Chain Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    icon: '/assets/tokens/bnb.svg',
    nativeCurrency: {
      address: AddressZero,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      icon: '/assets/tokens/bnb.svg',
      chainId: ChainId.BinanceSmartChainTestnet,
      isNative: true,
      isTradable: true,
      coingeckoId: 'binancecoin',
      chainlinkFeed: chainlinkFeeds.BNB,
    },
    isTestnet: true,
  },
  [ChainId.Fantom]: {
    name: 'Fantom',
    rpcUrl: 'https://rpc.ftm.tools',
    blockExplorerUrl: 'https://ftmscan.com',
    icon: '/assets/icons/ftm.svg',
    nativeCurrency: {
      address: AddressZero,
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
      icon: '/assets/tokens/ftm.svg',
      chainId: ChainId.Fantom,
      isNative: true,
      isTradable: true,
      chainlinkFeed: chainlinkFeeds.FTM,
    },
  },
}

export const supportedChainIds = values(ChainId)
  .filter((value): value is ChainId => typeof value !== 'string')
  .filter(chainId => {
    if (chainIdWhitelist.length === 0) return true
    return chainIdWhitelist.includes(chainId)
  })

export const supportedChainNames = supportedChainIds.map(getChainName)

const supportedChainNamesWithoutTestnet = supportedChainIds
  .map(getChain)
  .filter(chain => !chain.isTestnet)
  .map(chain => chain.name)

export function getSupportedChainNames(includeTestnet = false) {
  if (includeTestnet) return supportedChainNames
  return supportedChainNamesWithoutTestnet
}

export function getChain(value: ChainId): ChainMetadata {
  return chainMetadata[value]
}

export function getChainName(value: unknown) {
  return chainMetadata[ensureNumber(value, ChainId.Ethereum) as ChainId].name
}

export function getChainNameForUrl(value: unknown) {
  return getChainName(value).toLowerCase().replace(/\s/g, '-')
}

export function getChainIdFromUrl(value: string) {
  return supportedChainIds.find(chainId => getChainNameForUrl(chainId) === value)
}

export function getChainIdByName(name: string): ChainId | undefined {
  return supportedChainIds[supportedChainNames.findIndex(chainName => chainName.toLowerCase() === name.toLowerCase())]
}

export function makeChainIdMap<T>(getter: (chainId: ChainId) => T): Record<ChainId, T> {
  return supportedChainIds.reduce(
    (result, chainId) => ({ ...result, [chainId]: getter(chainId) }),
    {} as Record<ChainId, T>,
  )
}
