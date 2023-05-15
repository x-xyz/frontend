import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat'
import { ChainId, OrderItem } from '@x/models/dist'
import Price from 'components/Price'
import { TokenListing } from '@x/models'
import { memo } from 'react'

export interface BestListingProps {
  chainId: ChainId
  listing: OrderItem
}

function BestListing({ chainId, listing }: BestListingProps) {
  return (
    <Stat>
      <StatLabel color="primary" fontWeight="bold">
        Current Price
      </StatLabel>
      <StatNumber>
        <Price chainId={chainId} tokenId={listing.currency} usdPrice={listing.priceInUsd}>
          {listing.displayPrice}
        </Price>
      </StatNumber>
    </Stat>
  )
}

export default memo(BestListing)
