import { ChainId, findToken, TokenMeta } from '@x/constants'

const tokenToIcon = new Map<TokenMeta, string>()

addIcon(ChainId.Ethereum, 'ETH', '/assets/v3/ico-ethereum-60x60.svg')
addIcon(ChainId.Ethereum, 'WETH', '/assets/v3/ico-weth-60x60.svg')
addIcon(ChainId.Ropsten, 'ETH', '/assets/v3/ico-ethereum-60x60.svg')
addIcon(ChainId.Ropsten, 'WETH', '/assets/v3/ico-weth-60x60.svg')
addIcon(ChainId.Goerli, 'ETH', '/assets/v3/ico-ethereum-60x60.svg')
addIcon(ChainId.Goerli, 'WETH', '/assets/v3/ico-weth-60x60.svg')
addIcon(ChainId.BinanceSmartChain, 'BNB', '/assets/v3/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChain, 'WBNB', '/assets/v3/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChainTestnet, 'BNB', '/assets/v3/ico-binance-60x60.svg')
addIcon(ChainId.BinanceSmartChainTestnet, 'WBNB', '/assets/v3/ico-binance-60x60.svg')

function addIcon(chainId: ChainId, symbol: string, icon: string) {
  const token = findToken(symbol, chainId)
  if (!token) throw new Error(`not found token, ${chainId} ${symbol}`)
  tokenToIcon.set(token, icon)
}

export default function getTokenIcon(token: TokenMeta) {
  return tokenToIcon.get(token) || token.icon
}
