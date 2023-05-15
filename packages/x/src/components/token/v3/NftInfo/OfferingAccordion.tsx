import { Box, Text } from '@chakra-ui/layout'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/react'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId, Collection, Order, OrderItem, TokenOffer } from '@x/models/dist'
import { ensureNumber } from '@x/utils/dist'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import Address from '../../../Address'
import TakeOfferButton from '../../../marketplace/v3/TakeOfferButton'
import Price from '../../../Price'
import SimpleTable, { SimpleField } from '../../../SimpleTable'
import UsdPrice from '../../../UsdPrice'

interface OfferingAccordionProps {
  chainId: ChainId
  collection?: Collection
  contractAddress: string
  tokenId: BigNumberish
  offers: OrderItem[]
  isLoading: boolean
  isOwner: boolean
  showQuantity?: boolean
  isErc1155?: boolean
}

function OfferingAccordion({
  chainId,
  collection,
  contractAddress,
  tokenId,
  offers,
  isLoading,
  isOwner,
  showQuantity,
  isErc1155,
}: OfferingAccordionProps) {
  const { locale } = useRouter()

  let fields: SimpleField<OrderItem>[] = [
    {
      key: 'price',
      name: 'Price',
      render: (offer: OrderItem) => (
        <Price chainId={chainId} tokenId={offer.currency} noUsdPrice={true}>
          {offer.displayPrice}
        </Price>
      ),
    },
    {
      key: 'usd price',
      name: 'USD Price',
      render: (offer: OrderItem) => (
        <>
          $
          <UsdPrice chainId={chainId} tokenId={offer.currency}>
            {ensureNumber(offer.displayPrice)}
          </UsdPrice>
        </>
      ),
    },
    {
      key: 'floor-diff',
      name: 'Floor Difference',
      render: (offer: OrderItem) => {
        const price = Number(offer.displayPrice)
        if (!collection || collection.floorPrice === price || collection.floorPrice === 0)
          return <Text fontSize="xs">-</Text>

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
      },
    },
    {
      key: 'expiration-in',
      name: 'Expiration',
      render: (offer: OrderItem) => <Text>{DateTime.fromISO(offer.currency).toRelative()}</Text>,
    },
    {
      key: 'from',
      name: 'From',
      render: (offer: OrderItem) => (
        <Address type="account" variant="address">
          {offer.signer}
        </Address>
      ),
    },
  ]

  if (showQuantity) fields.splice(2, 0, { key: 'quantity', name: 'Quantity', render: item => item.amount })

  if (isOwner) {
    fields = [
      {
        key: 'accept offer',
        name: '',
        render: (offer: OrderItem) => {
          const deadline = DateTime.fromISO(offer.endTime)
          if (deadline < DateTime.now()) return <></>
          return (
            <TakeOfferButton
              contractAddress={contractAddress}
              chainId={chainId}
              tokenId={tokenId}
              offer={offer}
              variant="link"
              color="primary"
              isErc1155={isErc1155}
            />
          )
        },
      },
      ...fields,
    ]
  }

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Offers
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel p={0}>
          <Box overflowX="auto">
            <SimpleTable fields={fields} data={offers} isLoading={isLoading} />
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default OfferingAccordion
