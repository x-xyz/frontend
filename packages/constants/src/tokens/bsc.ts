import { TokenMeta } from './types'
import { ChainId, chainMetadata } from '../network'
import { chainlinkFeeds } from '../contract'

const tokens: TokenMeta[] = [
  // binance smart chain
  chainMetadata[ChainId.BinanceSmartChain].nativeCurrency,
  {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    decimals: 18,
    icon: '/assets/tokens/bnb.svg',
    chainId: ChainId.BinanceSmartChain,
    coingeckoId: 'wbnb',
    chainlinkFeed: chainlinkFeeds.BNB,
    isTradable: true,
  },
  {
    address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    name: 'Binance-Peg Ethereum',
    symbol: 'ETH',
    decimals: 18,
    icon: '/assets/tokens/eth.svg',
    chainId: ChainId.BinanceSmartChain,
    coingeckoId: 'ethereum',
    chainlinkFeed: chainlinkFeeds.ETH,
    isTradable: true,
  },
  {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
    icon: '/assets/tokens/usdc.svg',
    chainId: ChainId.BinanceSmartChain,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    name: 'Binance USD',
    symbol: 'BUSD',
    decimals: 18,
    icon: '/assets/tokens/busd.svg',
    chainId: ChainId.BinanceSmartChain,
    isStableCoin: true,
    isTradable: true,
  },
]

export default tokens
