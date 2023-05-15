import { DateTime } from 'luxon'
import { useRouter } from 'next/router'

import { Text } from '@chakra-ui/layout'
import { Collection, OrderItem } from '@x/models'
import { ensureNumber } from '@x/utils'

import Address from '../../Address'
import Price from '../../OldPrice'
import { SimpleField } from '../../SimpleTable'
import UsdPrice from '../../UsdPrice'
import { Divider, HStack, Stack } from '@chakra-ui/react'
import { NftItem } from '@x/models/dist'
import { useActiveWeb3React } from '@x/hooks/dist'
import TakeOfferButton from '../../marketplace/signature-base/TakeOfferButton'

interface OfferingsCardsProps {
  collection?: Collection
  nftItem: NftItem
  offers: OrderItem[]
  isLoading: boolean
  isOwner: boolean
  showQuantity?: boolean
}

function OfferingsCards({ collection, nftItem, offers, isOwner, isLoading, showQuantity }: OfferingsCardsProps) {
  const { locale } = useRouter()

  const { account } = useActiveWeb3React()

  function renderPrice(offer: OrderItem) {
    return (
      <Price
        chainId={offer.chainId}
        tokenId={offer.currency}
        noUsdPrice={true}
        hideIcon
        textProps={{ variant: 'body2' }}
      >
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
    if (!collection || collection.floorPrice === price || collection.floorPrice === 0)
      return <Text variant="body2">-</Text>

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
      <Text variant="body2">
        {(diff * 100).toLocaleString(locale, { maximumFractionDigits: 1 })}% {text}
      </Text>
    )
  }

  function renderDeadline(offer: OrderItem) {
    return <Text variant="body2">{DateTime.fromISO(offer.endTime).toRelative()}</Text>
  }

  function renderFrom(offer: OrderItem) {
    return (
      <Address type="account" variant="body2" color="primary">
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
    { name: 'From', render: renderFrom },
  )

  return (
    <Stack spacing={4} divider={<Divider borderColor="bg2" opacity={1} />}>
      {offers.map((o, idx) => (
        <Stack key={idx} spacing={4}>
          <HStack alignItems="stretch">
            {/*Price*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                Price
              </Text>
              {renderPrice(o)}
              <Text variant="body2" color="textSecondary">
                {renderUsdPrice(o)}
              </Text>
            </Stack>
            {/*From*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                From
              </Text>
              {renderFrom(o)}
            </Stack>
          </HStack>
          {/*Floor Difference*/}
          <Stack spacing={1}>
            <Text variant="caption" color="textSecondary">
              Floor Difference
            </Text>
            {renderFloorDifference(o)}
          </Stack>
          <HStack alignItems="stretch">
            {/*Expiration*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                Expiration
              </Text>
              {renderDeadline(o)}
            </Stack>
            <Stack spacing={1} flex="1 0 0">
              {renderAccept(o)}
            </Stack>
          </HStack>
        </Stack>
      ))}
    </Stack>
  )
}

export default OfferingsCards
