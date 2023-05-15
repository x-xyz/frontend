import { ChainId, ChainMetadata, getChain } from '@x/constants'

const chainIdToIcon = new Map<ChainMetadata, string>()

addIcon(ChainId.Ethereum, '/assets/v3/ico-ethereum-60x60.svg')
addIcon(ChainId.Ropsten, '/assets/v3/ico-ethereum-60x60.svg')
addIcon(ChainId.Goerli, '/assets/v3/ico-ethereum-60x60.svg')
addIcon(ChainId.BinanceSmartChain, '/assets/v3/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChainTestnet, '/assets/v3/ico-binance-60x60.svg')

function addIcon(chainId: ChainId, icon: string) {
  const chainMeta = getChain(chainId)
  chainIdToIcon.set(chainMeta, icon)
}

export default function getChainIcon(chain: ChainMetadata) {
  return chainIdToIcon.get(chain) || chain.icon
}
