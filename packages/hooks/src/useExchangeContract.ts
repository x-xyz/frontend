import { Marketplace } from '@x/abis'
import exchangeAbi from '@x/abis/exchange.json'
import { addresses } from '@x/constants'
import { useContract, useReadonlyContract } from './useContract'
import { ChainId } from '@x/constants'

export function useExchangeContract(expectedChainId = ChainId.Fantom) {
  return useContract<Marketplace>(addresses.exchange, exchangeAbi, true, expectedChainId)
}

export function useReadonlyExchangeContract(expectedChainId = ChainId.Fantom) {
  return useReadonlyContract<Marketplace>(addresses.exchange, exchangeAbi, expectedChainId)
}
