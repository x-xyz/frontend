import { Image } from '@chakra-ui/image'
import Address from 'components/Address'
import SimpleTable, { SimpleField } from 'components/SimpleTable'
import TokenIcon from 'components/token/TokenIcon'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { useLazyTokenActivitiesQuery } from '@x/apis'
import { findToken } from '@x/constants'
import { ActivityHistory, ActivityHistoryType, ChainId } from '@x/models'

export interface ActivityListProps {
  chainId: ChainId
  contract: string
  tokenId: string
  showQuantity?: boolean
}

const batchSize = 10

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

export default function ActivityList({ chainId, contract, tokenId, showQuantity }: ActivityListProps) {
  const { locale } = useRouter()
  const [items, setItems] = useState<ActivityHistory[]>([])
  const [offset, setOffset] = useState(0)
  const [fetch, { data, isLoading, isFetching }] = useLazyTokenActivitiesQuery()
  const loadMore = useCallback(() => setOffset(prev => prev + batchSize), [])
  const hasMore = useMemo(() => !!data?.data?.count && items.length < data.data.count, [data, items])

  // to reset status for new token
  useEffect(() => {
    setOffset(0)
    setItems([])
  }, [chainId, contract, tokenId])

  // fetch once target changed
  useEffect(() => {
    fetch({ chainId, contract, tokenId, offset, limit: batchSize })
  }, [fetch, chainId, contract, tokenId, offset])

  // append new data once loaded
  useEffect(() => {
    setItems(prev => {
      if (!data?.data?.items) return prev
      return [...prev, ...data.data.items]
    })
  }, [data])

  function renderEvent(item: ActivityHistory) {
    return (
      <HStack align="center">
        <Image w={7} h={7} src={activityTypeToIcon[item.type]} />
        <Text>{activityTypeToAction[item.type]}</Text>
      </HStack>
    )
  }

  function renderPrice(item: ActivityHistory) {
    return (
      <Stack direction="row" align="center">
        <TokenIcon chainId={chainId} tokenId={item.paymentToken} w={7} h={7} />
        <Text>
          {item.price} {findToken(item.paymentToken, chainId)?.symbol}
        </Text>
      </Stack>
    )
  }

  function renderFrom(item: ActivityHistory) {
    return (
      <Address chainId={chainId} type="address" variant="address">
        {item.account}
      </Address>
    )
  }

  function renderTo(item: ActivityHistory) {
    return (
      item.to && (
        <Address chainId={chainId} type="address" variant="address">
          {item.to}
        </Address>
      )
    )
  }

  function renderTime(item: ActivityHistory) {
    return DateTime.fromISO(item.time).toRelative({ locale })
  }

  const fields: SimpleField<ActivityHistory>[] = [
    { key: 'event', name: 'Event', render: renderEvent },
    { key: 'price', name: 'Price', render: renderPrice },
  ]

  if (showQuantity) fields.push({ key: 'quantity', name: 'Quantity', render: item => item.quantity })

  fields.push(
    { key: 'from', name: 'From', render: renderFrom },
    { key: 'to', name: 'To', render: renderTo },
    { key: 'time', name: 'Time', render: renderTime },
  )

  return (
    <SimpleTable fields={fields} data={items} isLoading={isLoading || isFetching} onMore={loadMore} hasMore={hasMore} />
  )
}
