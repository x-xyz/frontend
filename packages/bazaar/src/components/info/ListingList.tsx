import { DateTime } from 'luxon'
import { Box, BoxProps, Text } from '@chakra-ui/layout'
import Address from 'components/Address'
import BuyButton from 'components/marketplace/BuyButton'
import SimpleTable from 'components/SimpleTable'
import Price from 'components/Price'
import { TokenListing } from '@x/models'
import { useRouter } from 'next/router'
import CancelListingButton from 'components/marketplace/CancelListingButton'

export interface ListingListProps extends BoxProps {
  listings?: TokenListing[]
  isLoading?: boolean
  owner?: boolean
}

export default function ListingList({ listings = [], isLoading = false, owner, ...props }: ListingListProps) {
  const { locale } = useRouter()

  function renderPrice(listing: TokenListing) {
    return (
      <Price chainId={listing.chainId} tokenId={listing.paymentToken} usdPrice={listing.priceInUsd}>
        {listing.price}
      </Price>
    )
  }

  function renderExpiration(listing: TokenListing) {
    const datetime = DateTime.fromISO(listing.deadline)
    if (datetime.valueOf() === 0) return '--'
    return (
      <Text whiteSpace="nowrap">
        {DateTime.fromISO(listing.deadline).toLocaleString({ dateStyle: 'short', timeStyle: 'short' }, { locale })}
      </Text>
    )
  }

  function renderFrom(listing: TokenListing) {
    return (
      <Address type="account" fontSize="xs">
        {listing.owner}
      </Address>
    )
  }

  function renderActions(listing: TokenListing) {
    if (owner)
      return (
        <CancelListingButton chainId={listing.chainId} contractAddress={listing.minter} tokenID={listing.tokenId}>
          Cancel
        </CancelListingButton>
      )

    return (
      <BuyButton
        chainId={listing.chainId}
        contractAddress={listing.minter}
        tokenID={listing.tokenId}
        seller={listing.owner}
        price={listing.price}
        paymentToken={listing.paymentToken}
      />
    )
  }

  return (
    <Box overflowX="auto" {...props}>
      <SimpleTable
        fields={[
          { key: 'price', name: 'Price', render: renderPrice },
          { key: 'expiration', name: 'Expiration', render: renderExpiration },
          { key: 'from', name: 'From', render: renderFrom },
          { key: 'action', name: 'Action', render: renderActions },
        ]}
        data={listings}
        isLoading={isLoading}
      />
    </Box>
  )
}
