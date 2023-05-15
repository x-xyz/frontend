import { useEffect, useMemo, useRef } from 'react'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { getContract, useWeb3React } from '@x/utils'
import bundleMarketplaceAbi from '@x/abis/bundle-marketplace.json'
import erc20Abi from '@x/abis/erc20.json'
import erc721Abi from '@x/abis/erc721.json'
import erc1155Abi from '@x/abis/erc1155.json'
import mintableErc721Abi from '@x/abis/mintable-erc721.json'
import mintableErc1155Abi from '@x/abis/mintable-erc1155.json'
import wftmAbi from '@x/abis/wftm.json'
import chainlinkFeedAbi from '@x/abis/chainlink-feed.json'
import {
  BundleMarketplace,
  Erc1155,
  Erc20,
  Erc721,
  Wftm,
  MintableErc1155,
  MintableErc721,
  ChainlinkFeed,
} from '@x/abis'
import { addresses } from '@x/constants'
import { ChainId } from '@x/constants'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useToast } from './useToast'
import { handleError } from '@x/web3'
import { networkProviderKey } from '@x/constants'
import { AddressZero } from '@ethersproject/constants'
import { Cache } from '@x/utils'

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  abi: ContractInterface,
  withSignerIfPossible = true,
  expectedChainId?: ChainId,
): T | null {
  const toast = useToast({ title: 'Contract' })

  const { library, account, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !library || !chainId) return null

    if (expectedChainId && expectedChainId !== chainId) return null

    let address: string | undefined

    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]

    if (!address || address === AddressZero) return null

    try {
      return getContract(address, abi, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      handleError(error, { toast })
      return null
    }
  }, [addressOrAddressMap, abi, library, chainId, expectedChainId, withSignerIfPossible, account, toast]) as T
}

const readonlyContractCache = new Cache<Contract>()

export function useReadonlyContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  abi: ContractInterface,
  expectedChainId = ChainId.Fantom,
): T | null {
  const toast = useToast({ title: 'Contract' })

  const { library, chainId } = useWeb3React(networkProviderKey[expectedChainId])

  return useMemo(() => {
    if (!addressOrAddressMap || !library || !chainId) return null

    let address: string | undefined

    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]

    if (!address || address === AddressZero) return null

    const cacheKey = [chainId, address, JSON.stringify(abi)].join(':')

    const cachedValue = readonlyContractCache.get(cacheKey)

    if (cachedValue) {
      return cachedValue
    }

    try {
      const contract = getContract(address, abi, library)

      readonlyContractCache.set(cacheKey, contract)

      return contract
    } catch (error) {
      handleError(error, { toast })
      return null
    }
  }, [addressOrAddressMap, abi, library, chainId, toast]) as T
}

/**
 * @see https://creamfinance.notion.site/creamfinance/Artion-Contracts-d607806cdb0644f3b4856685960b2f92
 */

// export function useAuctionContract(chainId = ChainId.Fantom) {
//   return useContract<Auction>(addresses.auction, auctionAbi, true, chainId)
// }

// export function useMarketplaceContract(chainId = ChainId.Fantom) {
//   return useContract<Marketplace>(addresses.marketplace, marketplaceAbi, true, chainId)
// }

export function useBundleMarketplaceContract(chainId = ChainId.Fantom) {
  return useContract<BundleMarketplace>(addresses.bundleMarketplace, bundleMarketplaceAbi, true, chainId)
}

export function useErc20Contract(address?: string, expectedChainId?: ChainId) {
  return useContract<Erc20>(address, erc20Abi, true, expectedChainId)
}

export function useReadonlyErc721Contract(address?: string, expectedChainId = ChainId.Fantom) {
  return useReadonlyContract<Erc721>(address, erc721Abi, expectedChainId)
}

export function useErc721Contract(address?: string, expectedChainId?: ChainId) {
  return useContract<Erc721>(address, erc721Abi, true, expectedChainId)
}

export function useErc1155Contract(address?: string, expectedChainId?: ChainId) {
  return useContract<Erc1155>(address, erc1155Abi, true, expectedChainId)
}

export function useReadonlyErc1155Contract(address?: string, expectedChainId?: ChainId) {
  return useReadonlyContract<Erc1155>(address, erc1155Abi, expectedChainId)
}

export function useMintableErc721Contract(address?: string, chainId = ChainId.Fantom) {
  return useContract<MintableErc721>(address, mintableErc721Abi, true, chainId)
}

export function useMintableErc1155Contract(address?: string, chainId = ChainId.Fantom) {
  return useContract<MintableErc1155>(address, mintableErc1155Abi, true, chainId)
}

export function useWrapNativeContract(chainId = ChainId.Fantom) {
  return useContract<Wftm>(addresses.wrapNative, wftmAbi, true, chainId)
}

export function useReadonlyChainlinkFeed(address?: string, chainId?: ChainId) {
  return useReadonlyContract<ChainlinkFeed>(address, chainlinkFeedAbi, chainId)
}

export function useContractListener<T extends any[]>(
  contract: Contract | null,
  eventName: string,
  handler: (...args: T) => void,
) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    if (!contract) return

    function handler(...args: unknown[]) {
      handlerRef.current(...(args as any))
    }

    contract.on(eventName, handler)

    return () => {
      contract.off(eventName, handler)
    }
  }, [contract, eventName])
}
