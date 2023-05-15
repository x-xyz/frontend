import { AddressZero } from '@ethersproject/constants'
import { compareAddress, isAddress } from '@x/utils'
import { ChainId, chainMetadata } from '../network'
import type { TokenMeta, Erc20TokenMeta } from './types'
import ethereumTokens from './ethereum'
import ropstenTokens from './ropsten'
import goerliTokens from './goerli'
import bscTokens from './bsc'
import bscTestnetTokens from './bsc-testnet'
import fantomTokens from './fantom'

export * from './types'

export const tokens: TokenMeta[] = [
  ...ethereumTokens,
  ...ropstenTokens,
  ...goerliTokens,
  ...bscTokens,
  ...bscTestnetTokens,
  ...fantomTokens,
]

const tokenWhitelist: Record<number, string[] | undefined> | undefined =
  process.env.TOKEN_WHITELIST && JSON.parse(process.env.TOKEN_WHITELIST)

export const erc20Tokens = tokens.filter(
  (token): token is Erc20TokenMeta => !token.isNative && !!isAddress(token.address),
)

export function getTokens(chainId: ChainId, from = tokens) {
  return from.filter(token => {
    // if token whitelist exists, check it
    if (tokenWhitelist && !tokenWhitelist[chainId]?.includes(token.address)) return false
    return token.chainId === chainId
  })
}

export function getErc20Tokens(chainId: ChainId) {
  return getTokens(chainId, erc20Tokens) as Erc20TokenMeta[]
}

/**
 *
 * @param id could be address or symbol
 */
export function findToken(id: string | null, chainId = ChainId.Fantom) {
  if (!id) return
  if (!isAddress(id)) return findTokenBySymbol(id, chainId)
  if (compareAddress(id, AddressZero)) return chainMetadata[chainId].nativeCurrency
  return erc20Tokens.find(token => compareAddress(token.address, id))
}

export function findTokenBySymbol(symbol: string | null, chainId = ChainId.Fantom) {
  if (!symbol) return
  return getTokens(chainId).find(token => token.symbol.toLowerCase() === symbol.toLowerCase())
}

export function getTokenId(token: TokenMeta) {
  if (token.isNative) return token.symbol.toLowerCase()
  return token.address
}

export function getCoingeckoId(chainId: ChainId, id: string) {
  const token = findToken(id, chainId)
  if (!token) return
  if (token.coingeckoId) return token.coingeckoId
  return token.name.toLowerCase().replace(/\s/g, '-')
}
