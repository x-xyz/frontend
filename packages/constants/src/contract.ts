import { ChainId } from '@x/models'
import { appEnv } from './env'

export type Address = Record<ChainId, string>

interface AddressMap {
  auction: Address
  marketplace: Address
  bundleMarketplace: Address
  wrapNative: Address
  votingEscrow: Address
  feeDistribution: Address
  // signature-base marketplace
  exchange: Address
  transferManagerErc721: Address
  transferManagerErc1155: Address
  strategyFixedPrice: Address
  strategyPrivateSale: Address
  strategyCollectionOffer: Address
}

export const addresses: AddressMap = {
  auction: {
    [ChainId.Ethereum]: process.env.AUCTION_CONTRACT_ADDRESS_1 || '',
    [ChainId.Ropsten]: process.env.AUCTION_CONTRACT_ADDRESS_3 || '',
    [ChainId.Goerli]: process.env.AUCTION_CONTRACT_ADDRESS_5 || '',
    [ChainId.BinanceSmartChain]: process.env.AUCTION_CONTRACT_ADDRESS_56 || '',
    [ChainId.BinanceSmartChainTestnet]: process.env.AUCTION_CONTRACT_ADDRESS_97 || '',
    [ChainId.Fantom]: process.env.AUCTION_CONTRACT_ADDRESS_250 || '',
  },
  marketplace: {
    [ChainId.Ethereum]: process.env.MARKETPLACE_CONTRACT_ADDRESS_1 || '',
    [ChainId.Ropsten]: process.env.MARKETPLACE_CONTRACT_ADDRESS_3 || '',
    [ChainId.Goerli]: process.env.MARKETPLACE_CONTRACT_ADDRESS_5 || '',
    [ChainId.BinanceSmartChain]: process.env.MARKETPLACE_CONTRACT_ADDRESS_56 || '',
    [ChainId.BinanceSmartChainTestnet]: process.env.MARKETPLACE_CONTRACT_ADDRESS_97 || '',
    [ChainId.Fantom]: process.env.MARKETPLACE_CONTRACT_ADDRESS_250 || '',
  },
  bundleMarketplace: {
    [ChainId.Ethereum]: process.env.BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_1 || '',
    [ChainId.Ropsten]: process.env.BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_3 || '',
    [ChainId.Goerli]: process.env.BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_5 || '',
    [ChainId.BinanceSmartChain]: process.env.BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_56 || '',
    [ChainId.BinanceSmartChainTestnet]: process.env.BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_97 || '',
    [ChainId.Fantom]: process.env.BUNDLE_MARKETPLACE_CONTRACT_ADDRESS_250 || '',
  },
  wrapNative: {
    [ChainId.Ethereum]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [ChainId.Ropsten]: '0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5',
    [ChainId.Goerli]: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
    [ChainId.BinanceSmartChain]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    [ChainId.BinanceSmartChainTestnet]: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    [ChainId.Fantom]: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  },
  votingEscrow: {
    [ChainId.Ethereum]: process.env.VOTING_ESCROW_1 || '',
    [ChainId.Ropsten]: process.env.VOTING_ESCROW_3 || '',
    [ChainId.Goerli]: process.env.VOTING_ESCROW_5 || '',
    [ChainId.BinanceSmartChain]: process.env.VOTING_ESCROW_56 || '',
    [ChainId.BinanceSmartChainTestnet]: process.env.VOTING_ESCROW_97 || '',
    [ChainId.Fantom]: process.env.VOTING_ESCROW_250 || '',
  },
  feeDistribution: {
    [ChainId.Ethereum]: process.env.FEE_DISTRIBUTION_1 || '',
    [ChainId.Ropsten]: process.env.FEE_DISTRIBUTION_3 || '',
    [ChainId.Goerli]: process.env.FEE_DISTRIBUTION_5 || '',
    [ChainId.BinanceSmartChain]: process.env.FEE_DISTRIBUTION_56 || '',
    [ChainId.BinanceSmartChainTestnet]: process.env.FEE_DISTRIBUTION_97 || '',
    [ChainId.Fantom]: process.env.FEE_DISTRIBUTION_250 || '',
  },
  exchange: {
    [ChainId.Ethereum]:
      appEnv === 'dev' ? '0xEb4f8a88C81a688B141C419b40A8e2F0411DeC10' : '0xb4a2E49818dd8a5CdD818f22aB99263b62DDEB6c',
    [ChainId.Ropsten]: '',
    [ChainId.Goerli]: '0x33962E44cD0a6FA8dbca34c62FFCAc418Cb079F3',
    [ChainId.BinanceSmartChain]: '',
    [ChainId.BinanceSmartChainTestnet]: '',
    [ChainId.Fantom]: '',
  },
  transferManagerErc721: {
    [ChainId.Ethereum]:
      appEnv === 'dev' ? '0xBdD0036Cf812C64681FFe512d61eFF428B375C33' : '0xf13D9F380cfEfe97b1FB52fb279655962fca47aF',
    [ChainId.Ropsten]: '',
    [ChainId.Goerli]: '0x067E5B2F819A99528Ef31a87Cb07d66F7a4EB2ce',
    [ChainId.BinanceSmartChain]: '',
    [ChainId.BinanceSmartChainTestnet]: '',
    [ChainId.Fantom]: '',
  },
  transferManagerErc1155: {
    [ChainId.Ethereum]:
      appEnv === 'dev' ? '0xe98480e2D703C3ED7Ae52d88c715633d2F0dfC3e' : '0x0eB7177b30D8415d36ed5cA71fAa7673c4FBE187',
    [ChainId.Ropsten]: '',
    [ChainId.Goerli]: '0xd4c11e70c61197b84184A436409be1a55551a647',
    [ChainId.BinanceSmartChain]: '',
    [ChainId.BinanceSmartChainTestnet]: '',
    [ChainId.Fantom]: '',
  },
  strategyFixedPrice: {
    [ChainId.Ethereum]:
      appEnv === 'dev' ? '0x2315d0Fbe1495c184efc77a85F08caC07Fc6D0B2' : '0x4eD371E1D4C435E37224427321E08CDe411B1b3A',
    [ChainId.Ropsten]: '',
    [ChainId.Goerli]: '0x2182cE31D5946db4A3DA320Fc17cabe16818734A',
    [ChainId.BinanceSmartChain]: '',
    [ChainId.BinanceSmartChainTestnet]: '',
    [ChainId.Fantom]: '',
  },
  strategyPrivateSale: {
    [ChainId.Ethereum]:
      appEnv === 'dev' ? '0x4B51aAa4F8Ee083f298E7B9d0339F82cC9E0464D' : '0xCdCe9eD14af3D471A1ca9F488e32faCaC9a12c82',
    [ChainId.Ropsten]: '',
    [ChainId.Goerli]: '0xa465D4152CF59C614F4b4859BE2E5CbE2eeBAd9A',
    [ChainId.BinanceSmartChain]: '',
    [ChainId.BinanceSmartChainTestnet]: '',
    [ChainId.Fantom]: '',
  },
  strategyCollectionOffer: {
    [ChainId.Ethereum]:
      appEnv === 'dev' ? '0x0762E4cb4aD683F3F7F749E49FB57d8826982bf1' : '0x806aa9d4c98f534cf71c7B53Ba4E0Fc23709fE09',
    [ChainId.Ropsten]: '',
    [ChainId.Goerli]: '0x51d73720A24D9e7a3C7D199b1775B01df6aF61c1',
    [ChainId.BinanceSmartChain]: '',
    [ChainId.BinanceSmartChainTestnet]: '',
    [ChainId.Fantom]: '',
  },
}

export interface ChainlinkFeed {
  address: string
  chainId: ChainId
  decimals: number
  heartbeat: number
}

export interface ChainlinkFeeds {
  BNB: ChainlinkFeed
  ETH: ChainlinkFeed
  FTM: ChainlinkFeed
}

export const chainlinkFeeds: ChainlinkFeeds = {
  BNB: {
    address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
    chainId: ChainId.BinanceSmartChain,
    decimals: 8,
    heartbeat: 60 * 1000,
  },
  ETH: {
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    chainId: ChainId.Ethereum,
    decimals: 8,
    heartbeat: 60 * 60 * 1000,
  },
  FTM: {
    address: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    chainId: ChainId.Fantom,
    decimals: 8,
    heartbeat: 5 * 60 * 1000,
  },
}
