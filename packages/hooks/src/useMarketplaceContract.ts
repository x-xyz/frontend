import { BigNumber } from '@ethersproject/bignumber'
import { Marketplace } from '@x/abis'
import marketplaceAbi from '@x/abis/marketplace.json'
import { addresses } from '@x/constants'
import { DateTime } from 'luxon'
import { useContract, useContractListener, useReadonlyContract } from './useContract'
import { ChainId } from '@x/constants'
import { useEffect, useState } from 'react'
import { callOnChain } from '@x/utils'
import { Listing } from '@x/models'

export function useMarketplaceContract(expectedChainId = ChainId.Fantom) {
  return useContract<Marketplace>(addresses.marketplace, marketplaceAbi, true, expectedChainId)
}

export function useReadonlyMarketplaceContract(expectedChainId = ChainId.Fantom) {
  return useReadonlyContract<Marketplace>(addresses.marketplace, marketplaceAbi, expectedChainId)
}

export type ItemListedEventArgs = [
  owner: string,
  contractAddress: string,
  tokenID: BigNumber,
  quantity: BigNumber,
  paymentToken: string,
  pricePerItem: BigNumber,
  startingTime: BigNumber,
  deadline: BigNumber,
]

export function useItemListedListener(contract: Marketplace | null, handler: (...args: ItemListedEventArgs) => void) {
  return useContractListener(contract, 'ItemListed', handler)
}

export type ItemUpdatedEventArgs = [
  owner: string,
  contractAddress: string,
  tokenID: BigNumber,
  paymentToken: string,
  newPrice: BigNumber,
  newDeadline: BigNumber,
]

export function useItemUpdatedListener(contract: Marketplace | null, handler: (...args: ItemUpdatedEventArgs) => void) {
  return useContractListener(contract, 'ItemUpdated', handler)
}

export type ItemCanceledEventArgs = [owner: string, contractAddress: string, tokenID: BigNumber]

export function useItemCanceledListener(
  contract: Marketplace | null,
  handler: (...args: ItemCanceledEventArgs) => void,
) {
  return useContractListener(contract, 'ItemCanceled', handler)
}

export type ItemSoldEventArgs = [
  seller: string,
  buyer: string,
  contractAddress: string,
  tokenID: BigNumber,
  quantity: BigNumber,
  paymentToken: string,
  totalPrice: BigNumber,
  unitPrice: BigNumber,
]

export function useItemSoldListener(contract: Marketplace | null, handler: (...args: ItemSoldEventArgs) => void) {
  return useContractListener(contract, 'ItemSold', handler)
}

export type OfferCreatedEventArgs = [
  creator: string,
  contractAddress: string,
  tokenID: BigNumber,
  quantity: BigNumber,
  payToken: string,
  pricePerItem: BigNumber,
  deadline: BigNumber,
]

export function useOfferCreatedListener(
  contract: Marketplace | null,
  handler: (...args: OfferCreatedEventArgs) => void,
) {
  return useContractListener(contract, 'OfferCreated', handler)
}

export type OfferCanceledEventArgs = [owner: string, contractAddress: string, tokenID: BigNumber]

export function useOfferCanceledListener(
  contract: Marketplace | null,
  handler: (...args: OfferCanceledEventArgs) => void,
) {
  return useContractListener(contract, 'OfferCanceled', handler)
}

interface State {
  listing?: Listing
  isLoading: boolean
  error?: unknown
}

export function useOnChainListing(chainId: ChainId, contract: string, tokenId: string, owner: string) {
  const marketplace = useReadonlyMarketplaceContract(chainId)

  const [{ listing, isLoading, error }, setState] = useState<State>({ isLoading: false })

  useEffect(() => {
    if (!marketplace) return

    let stale = false

    setState({ isLoading: true })

    callOnChain(() => marketplace.listings(contract, tokenId, owner))
      .then(listing => {
        if (stale) return
        if (listing.startingTime.isZero() || DateTime.fromSeconds(listing.deadline.toNumber()) < DateTime.now()) {
          setState({ isLoading: false })
        } else {
          setState({ listing, isLoading: false })
        }
      })
      .catch(error => {
        if (stale) return
        setState({ isLoading: false, error })
      })

    return () => {
      stale = true
    }
  }, [marketplace, contract, tokenId, owner])

  return [listing, isLoading, error] as const
}
