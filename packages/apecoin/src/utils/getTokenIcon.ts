import { ChainId, findToken, TokenMeta } from '@x/constants'

const tokenToIcon = new Map<TokenMeta, string>()

addIcon(ChainId.Ethereum, 'ETH', '/assets/ico-ethereum-60x60.svg')
addIcon(ChainId.Ethereum, 'WETH', '/assets/ico-weth-60x60.svg')
addIcon(ChainId.Ropsten, 'ETH', '/assets/ico-ethereum-60x60.svg')
addIcon(ChainId.Ropsten, 'WETH', '/assets/ico-weth-60x60.svg')
addIcon(ChainId.BinanceSmartChain, 'BNB', '/assets/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChain, 'WBNB', '/assets/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChainTestnet, 'BNB', '/assets/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChainTestnet, 'WBNB', '/assets/ico-binance-60x60.svg')

function addIcon(chainId: ChainId, symbol: string, icon: string) {
  const token = findToken(symbol, chainId)
  if (!token) throw new Error(`not found token, ${chainId} ${symbol}`)
  tokenToIcon.set(token, icon)
}

export default function getTokenIcon(token: TokenMeta) {
  return tokenToIcon.get(token) || token.icon
}
