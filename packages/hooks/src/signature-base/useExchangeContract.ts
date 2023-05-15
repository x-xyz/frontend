import { Exchange } from '@x/abis'
import exchangeAbi from '@x/abis/exchange.json'
import { addresses } from '@x/constants'
import { ChainId } from '@x/models'

import { useContract, useReadonlyContract } from '../useContract'

export function useExchangeContract(chainId: ChainId) {
  return useContract<Exchange>(addresses.exchange, exchangeAbi, true, chainId)
}

export function useReadonlyExchangeContract(chainId: ChainId) {
  return useReadonlyContract<Exchange>(addresses.exchange, exchangeAbi, chainId)
}
