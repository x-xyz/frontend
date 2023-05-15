import { TokenMeta } from './types'
import { ChainId, chainMetadata } from '../network'
import { chainlinkFeeds } from '../contract'

const tokens: TokenMeta[] = [
  // fantom
  chainMetadata[ChainId.Fantom].nativeCurrency,
  {
    address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    name: 'Wrapped Fantom',
    symbol: 'WFTM',
    decimals: 18,
    icon: '/assets/tokens/wftm.svg',
    chainId: ChainId.Fantom,
    chainlinkFeed: chainlinkFeeds.FTM,
    isTradable: true,
  },
  {
    address: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
    name: 'Tether USD',
    symbol: 'fUSDT',
    decimals: 6,
    icon: '/assets/tokens/usdt.svg',
    chainId: ChainId.Fantom,
    coingeckoId: 'tether',
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: '/assets/tokens/usdc.svg',
    chainId: ChainId.Fantom,
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    icon: '/assets/tokens/dai.svg',
    chainId: ChainId.Fantom,
    coingeckoId: 'dai',
    isStableCoin: true,
    isTradable: true,
  },
  {
    address: '0x10864cD0C4250F7de15DD3Cd3788dc704cDb6706',
    name: 'X',
    symbol: 'X',
    decimals: 18,
    icon: '/assets/logo.svg',
    chainId: ChainId.Fantom,
  },
]

export default tokens
