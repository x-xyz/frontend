import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat'
import Price from 'components/Price'
import { TokenListing } from '@x/models'
import { memo } from 'react'

export interface BestListingProps {
  listing: TokenListing
}

function BestListing({ listing }: BestListingProps) {
  return (
    <Stat>
      <StatLabel color="primary" fontWeight="bold">
        Current Price
      </StatLabel>
      <StatNumber>
        <Price chainId={listing.chainId} tokenId={listing.paymentToken} usdPrice={listing.priceInUsd}>
          {listing.price}
        </Price>
      </StatNumber>
    </Stat>
  )
}

export default memo(BestListing)
