import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import Address from 'components/Address'
import SimpleTable from 'components/SimpleTable'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { Box, BoxProps, Stack, Text } from '@chakra-ui/react'
import { useLazyTokenActivitiesQuery } from '@x/apis'
import { findToken } from '@x/constants'
import { ActivityHistory, ActivityHistoryType, ChainId } from '@x/models'
import TxHash from 'components/TxHash'

export interface TokenActivityListProps extends BoxProps {
  chainId: ChainId
  contract: string
  tokenId: string
}

const batchSize = 10

const activityTypeToActionLabel: Record<ActivityHistoryType, string> = {
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
  [ActivityHistoryType.UpdateAuctionReservePrice]: 'Ppdate Auction Reserve Price',
  [ActivityHistoryType.UpdateAuctionStartTime]: 'Update Auction Start Time',
  [ActivityHistoryType.UpdateAuctionEndTime]: 'Update Auction End Time',
}

const activityTypeToActionIcon: Record<ActivityHistoryType, string> = {
  [ActivityHistoryType.List]: '/assets/icons/activity-list.png',
  [ActivityHistoryType.UpdateListing]: '/assets/icons/activity-list.png',
  [ActivityHistoryType.CancelListing]: '/assets/icons/activity-cancel-listng.png',
  [ActivityHistoryType.Buy]: '',
  [ActivityHistoryType.Sold]: '/assets/icons/activity-sold.png',
  [ActivityHistoryType.CreateOffer]: '/assets/icons/activity-offer.png',
  [ActivityHistoryType.AcceptOffer]: '',
  [ActivityHistoryType.OfferTaken]: '',
  [ActivityHistoryType.CancelOffer]: '/assets/icons/activity-cancel-offer.png',
  [ActivityHistoryType.CreateAuction]: '',
  [ActivityHistoryType.PlaceBid]: '/assets/icons/activity-bid.png',
  [ActivityHistoryType.WithdrawBid]: '/assets/icons/activity-withdraw-bid.png',
  [ActivityHistoryType.BidRefunded]: '/assets/icons/activity-bid-refund.png',
  [ActivityHistoryType.ResultAuction]: '',
  [ActivityHistoryType.WonAuction]: '',
  [ActivityHistoryType.CancelAuction]: '',
  [ActivityHistoryType.UpdateAuctionReservePrice]: '',
  [ActivityHistoryType.UpdateAuctionStartTime]: '',
  [ActivityHistoryType.UpdateAuctionEndTime]: '',
}

export default function TokenActivityList({ chainId, contract, tokenId, ...props }: TokenActivityListProps) {
  const { locale } = useRouter()
  const [fetch, { data, isLoading, isFetching }] = useLazyTokenActivitiesQuery()
  const [offset, setOffset] = useState(0)
  const [items, setItems] = useState<ActivityHistory[]>([])
  const hasMore = useMemo(() => !!data?.data?.count && items.length < data?.data?.count, [items, data])
  const loadMore = useCallback(() => setOffset(prev => prev + batchSize), [])

  useEffect(() => {
    setOffset(0)
    setItems([])
  }, [contract, tokenId])

  useEffect(
    () => fetch({ chainId, contract, tokenId, offset, limit: batchSize }),
    [fetch, chainId, contract, tokenId, offset],
  )

  useEffect(
    () =>
      setItems(prev => {
        if (!data?.data?.items) return prev
        return [...prev, ...data.data.items]
      }),
    [data],
  )

  function renderAction(item: ActivityHistory) {
    const icon = activityTypeToActionIcon[item.type]
    return (
      <Stack direction="row" align="center">
        <Box w="18px" h="18px">
          {icon && <Image src={icon} width="18px" height="18px" />}
        </Box>
        <Text>{activityTypeToActionLabel[item.type]}</Text>
      </Stack>
    )
  }

  function renderPrice(item: ActivityHistory) {
    if (!item.price || !item.paymentToken) return '--'
    const token = findToken(item.paymentToken, chainId)
    return `${item.price} ${token?.symbol}`
  }

  function renderFrom(item: ActivityHistory) {
    return (
      <Address chainId={chainId} type="address">
        {item.account}
      </Address>
    )
  }

  function renderTo(item: ActivityHistory) {
    return ''
  }

  function renderDate(item: ActivityHistory) {
    return DateTime.fromISO(item.time).toLocaleString({ dateStyle: 'short', timeStyle: 'short' }, { locale })
  }

  function renderLink(item: ActivityHistory) {
    if (!item.txHash) return null
    return <TxHash>{item.txHash}</TxHash>
  }

  return (
    <Box overflowX="auto" {...props}>
      <SimpleTable
        fields={[
          { key: 'action', name: 'Action', render: renderAction },
          { key: 'price', name: 'Price', render: renderPrice },
          { key: 'from', name: 'From', render: renderFrom },
          { key: 'to', name: 'To', render: renderTo },
          { key: 'date', name: 'Date', render: renderDate },
          { key: 'link', name: 'Link', render: renderLink },
        ]}
        data={items}
        isLoading={isLoading || isFetching}
        onMore={loadMore}
        hasMore={hasMore}
      />
    </Box>
  )
}
