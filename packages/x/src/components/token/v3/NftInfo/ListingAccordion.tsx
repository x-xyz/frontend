import BuyButton from 'components/marketplace/v3/BuyButton'
import { DateTime } from 'luxon'

import { Box, Text } from '@chakra-ui/layout'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks/dist'
import { ChainId, listingExpired, OrderItem, orderItemExpired } from '@x/models'
import { compareAddress, ensureNumber } from '@x/utils'

import Address from '../../../Address'
import Price from '../../../Price'
import SimpleTable, { SimpleField } from '../../../SimpleTable'
import UsdPrice from '../../../UsdPrice'

interface ListingAccordionProps {
  chainId: ChainId
  contract: string
  tokenId: string
  listings: OrderItem[]
  showQuantity?: boolean
}

function ListingAccordion({ chainId, contract, tokenId, listings, showQuantity }: ListingAccordionProps) {
  const { account } = useActiveWeb3React()

  function renderPrice(listing: OrderItem) {
    return (
      <Price chainId={chainId} tokenId={listing.currency} noUsdPrice={true}>
        {listing.displayPrice}
      </Price>
    )
  }

  function renderUsdPrice(listing: OrderItem) {
    return (
      <>
        $
        <UsdPrice chainId={chainId} tokenId={listing.currency}>
          {ensureNumber(listing.displayPrice)}
        </UsdPrice>
      </>
    )
  }

  function renderDeadline(listing: OrderItem) {
    return DateTime.fromISO(listing.endTime).equals(DateTime.fromSeconds(0)) || !listing.endTime ? (
      <Text>Never</Text>
    ) : (
      <Text>{DateTime.fromISO(listing.endTime).toRelative()}</Text>
    )
  }

  function renderFrom(listing: OrderItem) {
    return (
      <Address type="account" variant="address">
        {listing.signer}
      </Address>
    )
  }

  function renderBuy(listing: OrderItem) {
    if (compareAddress(account, listing.signer)) return null

    return (
      <BuyButton
        chainId={chainId}
        seller={listing.signer}
        price={listing.price}
        paymentToken={listing.currency}
        expired={orderItemExpired(listing)}
        orderItem={listing}
      />
    )
  }

  const fields: SimpleField<OrderItem>[] = [
    { key: 'Price', name: 'Price', render: renderPrice },
    { key: 'USD Price', name: 'USD Price', render: renderUsdPrice },
  ]

  if (showQuantity) fields.push({ key: 'Quantity', name: 'Quantity', render: item => item.amount })

  fields.push(
    { key: 'Expiration', name: 'Expiration', render: renderDeadline },
    { key: 'From', name: 'From', render: renderFrom },
    { key: 'Action', name: 'Action', render: renderBuy },
  )

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Listings
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel p={0}>
          <Box overflowX="auto">
            <SimpleTable fields={fields} data={listings} isLoading={false} />
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default ListingAccordion
