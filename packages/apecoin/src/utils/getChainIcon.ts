import { ChainId, ChainMetadata, getChain } from '@x/constants'

const chainIdToIcon = new Map<ChainMetadata, string>()

addIcon(ChainId.Ethereum, '/assets/ico-ethereum-60x60.svg')
addIcon(ChainId.Ropsten, '/assets/ico-ethereum-60x60.svg')
addIcon(ChainId.BinanceSmartChain, '/assets/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChainTestnet, '/assets/ico-binance-60x60.svg')

function addIcon(chainId: ChainId, icon: string) {
  const chainMeta = getChain(chainId)
  chainIdToIcon.set(chainMeta, icon)
}

export default function getChainIcon(chain: ChainMetadata) {
  return chainIdToIcon.get(chain) || chain.icon
}
