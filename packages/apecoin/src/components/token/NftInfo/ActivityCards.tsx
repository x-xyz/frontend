import Address from 'components/Address'
import { SimpleField } from 'components/SimpleTable'
import SimpleTableWithScrollbar from 'components/SimpleTableWithScrollbar'
import TokenIcon from 'components/token/TokenIcon'
import { reduce } from 'lodash'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useInfiniteQuery } from 'react-query'

import { Image } from '@chakra-ui/image'
import { Divider, HStack, Stack, Text } from '@chakra-ui/react'
import { fetchTokenActivities } from '@x/apis/dist/fn'
import { findToken } from '@x/constants'
import { ActivityHistory, ActivityHistoryType, ChainId } from '@x/models'

export interface ActivityListProps {
  chainId: ChainId
  contract: string
  tokenId: string
  showQuantity?: boolean
}

const bidIcon = '/assets/icons/ico-bid-60x60.svg'
const cancelIcon = '/assets/icons/ico-cancel-60x60.svg'
const listedIcon = '/assets/icons/ico-listed-60x60.svg'
const saleIcon = '/assets/icons/ico-sale-60x60.svg'
// const transferIcon = '/assets/icons/ico-transfer-60x60.svg'

const activityTypeToAction: Record<ActivityHistoryType, string> = {
  [ActivityHistoryType.List]: 'List',
  [ActivityHistoryType.UpdateListing]: 'Update Listing',
  [ActivityHistoryType.CancelListing]: 'Cancel Listing',
  [ActivityHistoryType.Buy]: 'Buy',
  [ActivityHistoryType.Sold]: 'Sold',
  [ActivityHistoryType.CreateOffer]: 'Offer',
  [ActivityHistoryType.AcceptOffer]: 'Accept Offer',
  [ActivityHistoryType.OfferTaken]: 'Take Offer',
  [ActivityHistoryType.CancelOffer]: 'Cancel Offer',
  [ActivityHistoryType.CreateAuction]: 'Auction',
  [ActivityHistoryType.PlaceBid]: 'Place Bid',
  [ActivityHistoryType.WithdrawBid]: 'Withdraw Bid',
  [ActivityHistoryType.BidRefunded]: 'Bid Refund',
  [ActivityHistoryType.ResultAuction]: 'Result Auction',
  [ActivityHistoryType.WonAuction]: 'Won Auction',
  [ActivityHistoryType.CancelAuction]: 'Cancel Auction',
  [ActivityHistoryType.UpdateAuctionReservePrice]: 'Update Auction Reserve Price',
  [ActivityHistoryType.UpdateAuctionStartTime]: 'Update Auction Start Time',
  [ActivityHistoryType.UpdateAuctionEndTime]: 'Update Auction End Time',
  [ActivityHistoryType.Transfer]: 'Transfer',
  [ActivityHistoryType.Mint]: 'Mint',
}

const activityTypeToIcon: Record<ActivityHistoryType, string> = {
  [ActivityHistoryType.List]: listedIcon,
  [ActivityHistoryType.UpdateListing]: listedIcon,
  [ActivityHistoryType.CancelListing]: cancelIcon,
  [ActivityHistoryType.Buy]: saleIcon,
  [ActivityHistoryType.Sold]: saleIcon,
  [ActivityHistoryType.CreateOffer]: listedIcon,
  [ActivityHistoryType.AcceptOffer]: saleIcon,
  [ActivityHistoryType.OfferTaken]: saleIcon,
  [ActivityHistoryType.CancelOffer]: cancelIcon,
  [ActivityHistoryType.CreateAuction]: bidIcon,
  [ActivityHistoryType.PlaceBid]: bidIcon,
  [ActivityHistoryType.WithdrawBid]: bidIcon,
  [ActivityHistoryType.BidRefunded]: cancelIcon,
  [ActivityHistoryType.ResultAuction]: bidIcon,
  [ActivityHistoryType.WonAuction]: bidIcon,
  [ActivityHistoryType.CancelAuction]: cancelIcon,
  [ActivityHistoryType.UpdateAuctionReservePrice]: bidIcon,
  [ActivityHistoryType.UpdateAuctionStartTime]: bidIcon,
  [ActivityHistoryType.UpdateAuctionEndTime]: bidIcon,
  [ActivityHistoryType.Transfer]: '/assets/icons/ico-transfer-60x60.svg',
  [ActivityHistoryType.Mint]: '/assets/icons/ico-minted-60x60.svg',
}

export default function ActivityCards({ chainId, contract, tokenId, showQuantity }: ActivityListProps) {
  const { locale } = useRouter()

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    ['token-activities', chainId, contract, tokenId],
    fetchTokenActivities,
    {
      getNextPageParam: (lastPage, allPages) => {
        const length = reduce(
          allPages,
          (length, activityResult) => {
            return length + (activityResult.items?.length || 0)
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

  const items = useMemo(() => {
    if (!data) return []
    return reduce(
      data.pages,
      (data, { items }) => {
        if (items) data.push(...items)
        return data
      },
      [] as ActivityHistory[],
    )
  }, [data])

  function renderEvent(item: ActivityHistory) {
    return <Text variant="body2">{activityTypeToAction[item.type]}</Text>
  }

  function renderPrice(item: ActivityHistory) {
    return (
      <Stack direction="row" align="center">
        <Text variant="body2">
          {item.price} {findToken(item.paymentToken, chainId)?.symbol}
        </Text>
      </Stack>
    )
  }

  function renderFrom(item: ActivityHistory) {
    return (
      <Address chainId={chainId} type="address" variant="body2">
        {item.account}
      </Address>
    )
  }

  function renderTo(item: ActivityHistory) {
    return item.to ? (
      <Address chainId={chainId} type="address" variant="body2">
        {item.to}
      </Address>
    ) : (
      <Text variant="body2">-</Text>
    )
  }

  function renderTime(item: ActivityHistory) {
    return DateTime.fromISO(item.time).toRelative({ locale })
  }

  const fields: SimpleField<ActivityHistory>[] = [
    { name: 'Event', render: renderEvent },
    { name: 'Price', render: renderPrice },
  ]

  if (showQuantity) fields.push({ name: 'Quantity', render: item => item.quantity })

  fields.push(
    { name: 'From', render: renderFrom },
    { name: 'To', render: renderTo },
    { name: 'Time', render: renderTime },
  )

  return (
    <Stack spacing={4} divider={<Divider borderColor="bg2" opacity={1} />}>
      {items.map((i, idx) => (
        <Stack key={idx} spacing={4}>
          <HStack alignItems="stretch">
            {/*Event*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                Event
              </Text>
              {renderEvent(i)}
            </Stack>
            {/*Price*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                Price
              </Text>
              {renderPrice(i)}
              <Text variant="body2" color="textSecondary"></Text>
            </Stack>
          </HStack>
          <HStack alignItems="stretch">
            {/*From*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                From
              </Text>
              {renderFrom(i)}
            </Stack>
            {/*To*/}
            <Stack spacing={1} flex="1 0 0">
              <Text variant="caption" color="textSecondary">
                To
              </Text>
              {renderTo(i)}
            </Stack>
          </HStack>
          {/*Time*/}
          <Stack spacing={1}>
            <Text variant="caption" color="textSecondary">
              Time
            </Text>
            <Text variant="body2">{renderTime(i)}</Text>
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
