import { Box, BoxProps, Text } from '@chakra-ui/layout'
import TakeOfferButton from 'components/marketplace/TakeOfferButton'
import Address from 'components/Address'
import { DateTime } from 'luxon'
import SimpleTable from 'components/SimpleTable'
import Price from 'components/Price'
import { TokenOffer } from '@x/models'
import { useActiveWeb3React } from '@x/hooks'
import { compareAddress } from '@x/utils/dist'
import CancelOfferButton from 'components/marketplace/CancelOfferButton'

export interface OfferListProps extends BoxProps {
  offers?: TokenOffer[]
  isLoading?: boolean
  onOfferTook?: (offer: TokenOffer) => void
  onOfferCanceled?: (offer: TokenOffer) => void
  owner?: boolean
}

export default function OfferList({
  offers = [],
  isLoading = false,
  onOfferTook,
  onOfferCanceled,
  owner,
  ...props
}: OfferListProps) {
  const { account } = useActiveWeb3React()

  function renderPrice(offer: TokenOffer) {
    return (
      <Price chainId={offer.chainId} tokenId={offer.paymentToken} usdPrice={offer.priceInUsd}>
        {offer.pricePerItem}
      </Price>
    )
  }

  function renderFrom(offer: TokenOffer) {
    return (
      <Address type="account" fontSize="xs">
        {offer.creator}
      </Address>
    )
  }

  function renderExpiration(offer: TokenOffer) {
    return <Text fontSize="xs">{DateTime.fromMillis(offer.deadline).toRelative()}</Text>
  }

  function renderAction(offer: TokenOffer) {
    if (owner) return <TakeOfferButton offer={offer} onOfferTook={onOfferTook} />
    if (compareAddress(offer.creator, account))
      return (
        <CancelOfferButton
          chainId={offer.chainId}
          contractAddress={offer.minter}
          tokenID={offer.tokenId}
          onOfferCanceled={() => onOfferCanceled?.(offer)}
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
          { key: 'action', name: 'Action', render: renderAction },
        ]}
        data={offers}
        isLoading={isLoading}
      />
    </Box>
  )
}
