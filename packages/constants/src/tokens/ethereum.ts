import { TokenMeta } from './types'
import { ChainId, chainMetadata } from '../network'
import { chainlinkFeeds } from '../contract'

const tokens: TokenMeta[] = [
  // ethereum
  chainMetadata[ChainId.Ethereum].nativeCurrency,
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    icon: '/assets/tokens/weth.svg',
    chainId: ChainId.Ethereum,
    coingeckoId: 'weth',
    chainlinkFeed: chainlinkFeeds.ETH,
    isTradable: true,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: '/assets/tokens/usdc.svg',
    chainId: ChainId.Ethereum,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    icon: '/assets/tokens/dai.svg',
    chainId: ChainId.Ethereum,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x7f3141c4D6b047fb930991b450f1eD996a51CB26',
    name: 'X',
    symbol: 'X',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Ethereum,
  },
  {
    address: '0x5B8c598ef69E8Eb97eb55b339A45dcf7bdc5C3A3',
    name: 'veX',
    symbol: 'veX',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Ethereum,
  },
  {
    address: '0x4d224452801aced8b2f0aebe155379bb5d594381',
    name: 'ApeCoin',
    symbol: 'APE',
    decimals: 18,
    icon: '/assets/tokens/apecoin.webp',
    chainId: ChainId.Ethereum,
    isTradable: true,
  },
  {
    address: '0xff709449528b6fb6b88f557f7d93dece33bca78d',
    name: 'ApeUSD',
    symbol: 'ApeUSD',
    decimals: 18,
    icon: '/assets/tokens/apeusd.webp',
    chainId: ChainId.Ethereum,
    isTradable: true,
  },
]

export default tokens
