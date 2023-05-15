import { ListingStrategy, ChainId } from '@x/models'
import { Address, addresses } from '@x/constants'

const listingStrategyToContractAddress: Record<ListingStrategy, Address> = {
  [ListingStrategy.FixedPrice]: addresses.strategyFixedPrice,
  [ListingStrategy.PrivateSale]: addresses.strategyPrivateSale,
  [ListingStrategy.CollectionOffer]: addresses.strategyCollectionOffer,
}

export function getContractAddressByListingStrategy(strategy: ListingStrategy, chainId: ChainId) {
  return listingStrategyToContractAddress[strategy][chainId]
}
