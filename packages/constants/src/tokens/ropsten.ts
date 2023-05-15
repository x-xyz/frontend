import { TokenMeta } from './types'
import { ChainId, chainMetadata } from '../network'
import { chainlinkFeeds } from '../contract'

const tokens: TokenMeta[] = [
  // ropsten
  chainMetadata[ChainId.Ropsten].nativeCurrency,
  {
    address: '0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5',
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    icon: '/assets/tokens/weth.svg',
    chainId: ChainId.Ropsten,
    coingeckoId: 'weth',
    chainlinkFeed: chainlinkFeeds.ETH,
    isTradable: true,
  },
  {
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: '/assets/tokens/usdc.svg',
    chainId: ChainId.Ropsten,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x31f42841c2db5173425b5223809cf3a38fede360',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    icon: '/assets/tokens/dai.svg',
    chainId: ChainId.Ropsten,
    coingeckoId: 'dai',
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0xa2f9e1c0273C4111673368F232C6388f764113e8',
    name: 'boat',
    symbol: 'ROW',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Ropsten,
  },
  {
    address: '0x57Cb7324039Dd3b2688Dd563AcFb35F1278a2e08',
    name: 'veX',
    symbol: 'veX',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Ropsten,
  },
  {
    address: '0xb85ab912386669fc8a335b498e0a0d3ee914dfd6',
    name: 'X',
    symbol: 'X',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Ropsten,
    isTradable: true,
    coingeckoId: 'x-2',
  },
  {
    address: '0xbC39E574487E49bc11DE7FDfF593518edaFeee98',
    name: 'Ape Coin',
    symbol: 'APE',
    decimals: 18,
    icon: '/assets/tokens/apecoin.webp',
    chainId: ChainId.Ropsten,
    isTradable: true,
    coingeckoId: 'apecoin',
  },
]

export default tokens
