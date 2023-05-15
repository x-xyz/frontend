import { TokenMeta } from './types'
import { ChainId, chainMetadata } from '../network'
import { chainlinkFeeds } from '../contract'

const tokens: TokenMeta[] = [
  // binance smart chain testnet
  chainMetadata[ChainId.BinanceSmartChainTestnet].nativeCurrency,
  {
    address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    decimals: 18,
    icon: '/assets/tokens/bnb.svg',
    chainId: ChainId.BinanceSmartChainTestnet,
    coingeckoId: 'wbnb',
    chainlinkFeed: chainlinkFeeds.BNB,
    isTradable: true,
  },
  {
    address: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7',
    name: 'Binance USD',
    symbol: 'BUSD',
    decimals: 18,
    icon: '/assets/tokens/busd.svg',
    chainId: ChainId.BinanceSmartChainTestnet,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x8a9424745056Eb399FD19a0EC26A14316684e274',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    icon: '/assets/tokens/dai.svg',
    chainId: ChainId.BinanceSmartChainTestnet,
    coingeckoId: 'dai',
    isStableCoin: true,
    isTradable: true,
  },
]

export default tokens
