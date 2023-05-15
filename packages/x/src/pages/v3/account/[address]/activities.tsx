import { Image } from '@chakra-ui/image'
import { Box } from '@chakra-ui/layout'
import { Container, HStack, Stack, Text } from '@chakra-ui/react'
import { FetchAccountActivityParams } from '@x/apis/dist/fn'
import { fetchAccount, fetchAccountActivity } from '@x/apis/fn'
import { findToken } from '@x/constants/dist'
import { Account } from '@x/models'
import { Activity, ActivityTypeV2 } from '@x/models/dist'
import { call, getFirst, isAddress, isErrorResponse } from '@x/utils'
import AccountLayout from 'components/account/v3/AccountLayout'
import Address from 'components/Address'
import EventFilters from 'components/filters/EventFilters'
import SimpleTable from 'components/SimpleTable'
import NftThumbnail from 'components/token/NftThumbnail'
import TokenIcon from 'components/token/TokenIcon'
import { isFeatureEnabled } from 'flags'
import { reduce } from 'lodash'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

const bidIcon = '/assets/icons/ico-bid-60x60.svg'
const cancelIcon = '/assets/icons/ico-cancel-60x60.svg'
const listedIcon = '/assets/icons/ico-listed-60x60.svg'
const saleIcon = '/assets/icons/ico-sale-60x60.svg'
const mintIcon = '/assets/icons/ico-minted-60x60.svg'
const transferIcon = '/assets/icons/ico-transfer-60x60.svg'

const activityTypeToAction: Record<ActivityTypeV2, string> = {
  [ActivityTypeV2.List]: 'List',
  [ActivityTypeV2.UpdateListing]: 'Update Listing',
  [ActivityTypeV2.CancelListing]: 'Cancel Listing',
  [ActivityTypeV2.Buy]: 'Buy',
  [ActivityTypeV2.Sold]: 'Sale',
  [ActivityTypeV2.CreateOffer]: 'Offer',
  [ActivityTypeV2.AcceptOffer]: 'Accept Offer',
  [ActivityTypeV2.OfferTaken]: 'Take Offer',
  [ActivityTypeV2.CancelOffer]: 'Cancel Offer',
  [ActivityTypeV2.CreateAuction]: 'Auction',
  [ActivityTypeV2.PlaceBid]: 'Place Bid',
  [ActivityTypeV2.WithdrawBid]: 'Withdraw Bid',
  [ActivityTypeV2.BidRefunded]: 'Bid Refund',
  [ActivityTypeV2.ResultAuction]: 'Result Auction',
  [ActivityTypeV2.WonAuction]: 'Won Auction',
  [ActivityTypeV2.CancelAuction]: 'Cancel Auction',
  [ActivityTypeV2.UpdateAuctionReservePrice]: 'Update Auction Reserve Price',
  [ActivityTypeV2.UpdateAuctionStartTime]: 'Update Auction Start Time',
  [ActivityTypeV2.UpdateAuctionEndTime]: 'Update Auction End Time',
  [ActivityTypeV2.Mint]: 'Mint',
  [ActivityTypeV2.Transfer]: 'Transfer',

  [ActivityTypeV2.LegacyBid]: 'Bid',
  [ActivityTypeV2.LegacyOffer]: 'Offer',
  [ActivityTypeV2.LegacySale]: 'Sale',
}

const activityTypeToIcon: Record<ActivityTypeV2, string> = {
  [ActivityTypeV2.List]: listedIcon,
  [ActivityTypeV2.UpdateListing]: listedIcon,
  [ActivityTypeV2.CancelListing]: cancelIcon,
  [ActivityTypeV2.Buy]: saleIcon,
  [ActivityTypeV2.Sold]: saleIcon,
  [ActivityTypeV2.CreateOffer]: listedIcon,
  [ActivityTypeV2.AcceptOffer]: saleIcon,
  [ActivityTypeV2.OfferTaken]: saleIcon,
  [ActivityTypeV2.CancelOffer]: cancelIcon,
  [ActivityTypeV2.CreateAuction]: bidIcon,
  [ActivityTypeV2.PlaceBid]: bidIcon,
  [ActivityTypeV2.WithdrawBid]: bidIcon,
  [ActivityTypeV2.BidRefunded]: cancelIcon,
  [ActivityTypeV2.ResultAuction]: bidIcon,
  [ActivityTypeV2.WonAuction]: bidIcon,
  [ActivityTypeV2.CancelAuction]: cancelIcon,
  [ActivityTypeV2.UpdateAuctionReservePrice]: bidIcon,
  [ActivityTypeV2.UpdateAuctionStartTime]: bidIcon,
  [ActivityTypeV2.UpdateAuctionEndTime]: bidIcon,
  [ActivityTypeV2.Mint]: mintIcon,
  [ActivityTypeV2.Transfer]: transferIcon,

  [ActivityTypeV2.LegacyBid]: bidIcon,
  [ActivityTypeV2.LegacyOffer]: listedIcon,
  [ActivityTypeV2.LegacySale]: saleIcon,
}

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async ctx => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const resp = await call(() => fetchAccount(address), { maxAttempt: 5, timeout: i => i * 300 })
    if (isErrorResponse(resp) || resp.status === 'fail') return { notFound: true }
    return { props: { account: resp.data } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

const batchSize = 10

export default function AccountActivities({ account }: Props) {
  const { address } = account
  const { locale } = useRouter()

  const [filter, setFilter] = useState<FetchAccountActivityParams>({})

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    ['accountActivity', address, { limit: batchSize, ...filter }],
    fetchAccountActivity,
    {
      getNextPageParam: (lastPage, allPages) => {
        const length = reduce(
          allPages,
          (length, activityResult) => {
            return length + (activityResult.activities?.length || 0)
          },
          0,
        )

        if (lastPage.count <= length) {
          return
        }
        return length
      },
    },
  )

  const result = useMemo<Activity[]>(() => {
    if (!data) return []

    return reduce(
      data.pages,
      (data, { activities }) => {
        if (activities) data.push(...activities)
        return data
      },
      [] as Activity[],
    )
  }, [data])

  function renderEvent(item: Activity) {
    return (
      <HStack align="center">
        <Image w={7} h={7} src={activityTypeToIcon[item.type]} />
        <Text fontWeight="bold">{activityTypeToAction[item.type]}</Text>
      </HStack>
    )
  }

  function renderNftItem(item: Activity) {
    return (
      <NftThumbnail
        thumbnail={item.token.thumbnailPath || item.token.imageUrl}
        chainId={item.token.chainId}
        contractAddress={item.token.contract}
        tokenId={item.token.tokenId}
        name={item.token.name}
      />
    )
  }

  function renderPrice(item: Activity) {
    const { type } = item
    if (
      type === ActivityTypeV2.Mint ||
      type === ActivityTypeV2.CancelListing ||
      type === ActivityTypeV2.CancelOffer ||
      type === ActivityTypeV2.Transfer
    ) {
      return ''
    }

    return (
      <Stack direction="row" align="center">
        <TokenIcon chainId={item.token.chainId} tokenId={item.paymentToken} w={7} h={7} />
        <Text fontWeight="bold">
          {item.price} {findToken(item.paymentToken, item.token.chainId)?.symbol}
        </Text>
      </Stack>
    )
  }

  function renderFrom(item: Activity) {
    return (
      <Address chainId={item.token.chainId} type="address" variant="address">
        {item.owner?.address}
      </Address>
    )
  }

  function renderTo(item: Activity) {
    if (!item.to.address) return '-'
    return (
      <Address chainId={item.token.chainId} type="address" variant="address">
        {item.to.address}
      </Address>
    )
  }

  function renderTime(item: Activity) {
    return DateTime.fromISO(item.createdAt).toRelative({ locale })
  }

  return (
    <AccountLayout account={account} pageTitle="Activities">
      <Container mb={20} maxW={{ base: 'container.xl', '2xl': 'container.3xl' }}>
        <Box py={5}>
          <EventFilters onValueChange={setFilter} defaultValues={filter} />
        </Box>
        <SimpleTable
          border="1px solid"
          borderColor="divider"
          fontSize="sm"
          fields={[
            { key: 'event', name: 'Event', render: renderEvent },
            { key: 'item', name: 'Item', render: renderNftItem },
            { key: 'price', name: 'Price', render: renderPrice },
            { key: 'from', name: 'From', render: renderFrom },
            { key: 'to', name: 'To', render: renderTo },
            { key: 'time', name: 'Time', render: renderTime },
          ]}
          data={result}
          isLoading={isLoading}
          onMore={() => fetchNextPage()}
          hasMore={hasNextPage}
        />
      </Container>
    </AccountLayout>
  )
}
