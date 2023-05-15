import { TokenMeta } from './types'
import { ChainId, chainMetadata } from '../network'
import { chainlinkFeeds } from '../contract'

const tokens: TokenMeta[] = [
  // Goerli
  chainMetadata[ChainId.Goerli].nativeCurrency,
  {
    address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    icon: '/assets/tokens/weth.svg',
    chainId: ChainId.Goerli,
    coingeckoId: 'weth',
    chainlinkFeed: chainlinkFeeds.ETH,
    isTradable: true,
  },
  {
    address: '0x2c616be52c15ec322f530f8c94fababd0813ca0c',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: '/assets/tokens/usdc.svg',
    chainId: ChainId.Goerli,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x7c7a3586c97894295cf75f9bbc4568997f953817',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    icon: '/assets/tokens/dai.svg',
    chainId: ChainId.Goerli,
    coingeckoId: 'dai',
    isStableCoin: true,
    isTradable: true,
  },
  {
    /**
     * @TODO update address
     */
    address: '0x57Cb7324039Dd3b2688Dd563AcFb35F1278a2e08',
    name: 'veX',
    symbol: 'veX',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Goerli,
  },
  {
    address: '0x958bf434d3dcef3738bd9f69ac11d7caddc533c4',
    name: 'X',
    symbol: 'X',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Goerli,
    isTradable: true,
    coingeckoId: 'x-2',
  },
  {
    address: '0x3c4f3c06a1737749e45600d7c11a22fe8c5d8615',
    name: 'Ape Coin',
    symbol: 'APE',
    decimals: 18,
    icon: '/assets/tokens/apecoin.webp',
    chainId: ChainId.Goerli,
    isTradable: true,
    coingeckoId: 'apecoin',
  },
]

export default tokens
