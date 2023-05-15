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

interface ListingsProps {
  contract: string
  tokenId: string
  listings: OrderItem[]
  showQuantity?: boolean
}

function Listings({ contract, tokenId, listings, showQuantity }: ListingsProps) {
  const { account } = useActiveWeb3React()

  function renderPrice(listing: OrderItem) {
    return (
      <Price chainId={listing.chainId} tokenId={listing.currency} noUsdPrice={true} hideIcon>
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
      <Text>Never</Text>
    ) : (
      <Text>{DateTime.fromISO(listing.endTime).toRelative({ locale: 'en' })}</Text>
    )
  }

  function renderFrom(listing: OrderItem) {
    return (
      <Address type="account" variant="address" color="primary">
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
    { name: 'Action', render: renderBuy, nameToRight: true },
  )

  return (
    <Box overflowX="auto">
      <SimpleTableWithScrollbar fields={fields} data={listings} isLoading={false} />
    </Box>
  )
}

export default Listings
