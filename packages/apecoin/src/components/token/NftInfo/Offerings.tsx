import SimpleTableWithScrollbar from 'components/SimpleTableWithScrollbar'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'

import { Box, Text } from '@chakra-ui/layout'
import { Collection, OrderItem } from '@x/models'
import { ensureNumber } from '@x/utils'

import Address from '../../Address'
import Price from '../../OldPrice'
import { SimpleField } from '../../SimpleTable'
import UsdPrice from '../../UsdPrice'
import { useActiveWeb3React } from '@x/hooks/dist'
import { ListingStrategy, NftItem } from '@x/models/dist'
import TakeOfferButton from '../../marketplace/signature-base/TakeOfferButton'

interface OfferingsProps {
  collection: Collection
  nftItem: NftItem
  offers: OrderItem[]
  isLoading: boolean
  isOwner: boolean
  showQuantity?: boolean
}

function Offerings({ collection, nftItem, offers, isLoading, isOwner, showQuantity }: OfferingsProps) {
  const { locale } = useRouter()
  const { account } = useActiveWeb3React()

  function renderPrice(offer: OrderItem) {
    return (
      <Price chainId={offer.chainId} tokenId={offer.currency} noUsdPrice={true} hideIcon>
        {offer.displayPrice}
      </Price>
    )
  }

  function renderUsdPrice(offer: OrderItem) {
    return (
      <>
        $
        <UsdPrice chainId={offer.chainId} tokenId={offer.currency}>
          {ensureNumber(offer.displayPrice)}
        </UsdPrice>
      </>
    )
  }

  function renderFloorDifference(offer: OrderItem) {
    const price = Number(offer.displayPrice)
    if (collection.floorPrice === price || collection.floorPrice === 0) return <Text fontSize="xs">-</Text>

    let diff = 0
    let text
    if (collection.floorPrice > price) {
      diff = 1 - price / collection.floorPrice
      text = 'below'
    } else {
      diff = price / collection.floorPrice - 1
      text = 'above'
    }

    return (
      <Text fontSize="sm">
        {(diff * 100).toLocaleString(locale, { maximumFractionDigits: 1 })}% {text}
      </Text>
    )
  }

  function renderDeadline(offer: OrderItem) {
    return <Text>{DateTime.fromISO(offer.endTime).toRelative()}</Text>
  }

  function renderFrom(offer: OrderItem) {
    return (
      <Address type="account" variant="address" color="primary">
        {offer.signer}
      </Address>
    )
  }

  function renderAccept(offer: OrderItem) {
    if (!isOwner) return null

    return <TakeOfferButton collection={collection} nftItem={nftItem} offer={offer} />
  }

  const fields: SimpleField<OrderItem>[] = [
    { name: 'Price', render: renderPrice },
    { name: 'USD Price', render: renderUsdPrice },
  ]

  if (showQuantity) fields.push({ name: 'Quantity', render: item => item.amount })

  fields.push(
    { name: 'Floor Difference', render: renderFloorDifference },
    { name: 'Expiration', render: renderDeadline },
    { name: 'From', render: renderFrom, nameToRight: true },
    { name: 'Action', render: renderAccept, nameToRight: true },
  )

  return (
    <Box overflowX="auto">
      <SimpleTableWithScrollbar fields={fields} data={offers} isLoading={isLoading} />
    </Box>
  )
}

export default Offerings
