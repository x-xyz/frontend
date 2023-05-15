import BuyButton from 'components/marketplace/signature-base/BuyButton'
import SimpleTableWithScrollbar from 'components/SimpleTableWithScrollbar'
import { DateTime } from 'luxon'

import { Box, Text } from '@chakra-ui/layout'
import { useActiveWeb3React } from '@x/hooks/dist'
import { OrderItem } from '@x/models'
import { compareAddress, ensureNumber } from '@x/utils'

import Address from '../../Address'
import Price from '../../OldPrice'
import { SimpleField } from '../../SimpleTable'
import UsdPrice from '../../UsdPrice'
import { HStack, Stack } from '@chakra-ui/react'

interface ListingsCardsProps {
  contract: string
  tokenId: string
  listings: OrderItem[]
  showQuantity?: boolean
}

function ListingsCards({ contract, tokenId, listings, showQuantity }: ListingsCardsProps) {
  const { account } = useActiveWeb3React()

  function renderPrice(listing: OrderItem) {
    return (
      <Price
        chainId={listing.chainId}
        tokenId={listing.currency}
        noUsdPrice={true}
        hideIcon
        textProps={{ variant: 'body2' }}
      >
        {listing.displayPrice}
      </Price>
    )
  }

  function renderUsdPrice(listing: OrderItem) {
    return (
      <>
        $
        <UsdPrice chainId={listing.chainId} tokenId={listing.currency}>
          {ensureNumber(listing.displayPrice)}
        </UsdPrice>
      </>
    )
  }

  function renderDeadline(listing: OrderItem) {
    return DateTime.fromISO(listing.endTime).equals(DateTime.fromSeconds(0)) || !listing.endTime ? (
      <Text variant="body2">Never</Text>
    ) : (
      <Text variant="body2">{DateTime.fromISO(listing.endTime).toRelative()}</Text>
    )
  }

  function renderFrom(listing: OrderItem) {
    return (
      <Address type="account" variant="body2" color="primary">
        {listing.signer}
      </Address>
    )
  }

  function renderBuy(listing: OrderItem) {
    if (compareAddress(account, listing.signer)) return null

    return <BuyButton orderItem={listing} />
  }

  const fields: SimpleField<OrderItem>[] = [
    { name: 'Price', render: renderPrice },
    { name: 'USD Price', render: renderUsdPrice },
  ]

  if (showQuantity) fields.push({ name: 'Quantity', render: item => item.amount })

  fields.push(
    { name: 'Expiration', render: renderDeadline },
    { name: 'From', render: renderFrom },

    { name: 'Action', render: renderBuy },
  )

  return (
    <Stack spacing={8}>
      {listings.map((l, idx) => (
        <Stack key={idx} spacing={4}>
          <HStack alignItems="stretch">
            {/*Price*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                Price
              </Text>
              {renderPrice(l)}
              <Text variant="body2" color="textSecondary">
                {renderUsdPrice(l)}
              </Text>
            </Stack>
            {/*From*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                From
              </Text>
              {renderFrom(l)}
            </Stack>
          </HStack>
          {/*Expiration*/}
          <Stack spacing={1}>
            <Text variant="caption" color="textSecondary">
              Expiration
            </Text>
            {renderDeadline(l)}
          </Stack>
          {renderBuy(l)}
        </Stack>
      ))}
    </Stack>
  )
}

export default ListingsCards
