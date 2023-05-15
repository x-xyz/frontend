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
import { Activity, ActivityHistory } from '@x/models/dist'
import Link from '../Link'
import { getChainNameForUrl } from '@x/constants/dist'
import Media from '../Media'
import { builtInCollections } from '../../configs'

export interface ActivityListProps {
  activities: Activity[]
}

const contractToName: Record<string, string> = {}

builtInCollections.forEach(c => (contractToName[c.address] = c.name))

export default function ActivityCards({ activities }: ActivityListProps) {
  function renderEvent(item: Activity) {
    return (
      <Text variant="body2" textTransform="capitalize">
        {item.type}
      </Text>
    )
  }

  function renderItem(item: Activity) {
    return (
      <Link href={`/asset/${getChainNameForUrl(item.token.chainId)}/${item.token.contract}/${item.token.tokenId}`}>
        <Stack direction="row" align="center">
          <Media h={10} w={10} src={item.token.hostedImageUrl || item.token.imageUrl} />
          <Stack spacing={0}>
            <Text fontSize="xs">{contractToName[item.token.contract]}</Text>
            <Text fontSize="md">{item.token.name}</Text>
          </Stack>
        </Stack>
      </Link>
    )
  }

  function renderPrice(item: Activity) {
    return (
      <Stack direction="row" align="center">
        <Text variant="body2">
          {item.price} {findToken(item.paymentToken, item.token.chainId)?.symbol}
        </Text>
      </Stack>
    )
  }

  function renderFrom(item: Activity) {
    return item.owner ? (
      <Address type="address" chainId={item.token.chainId}>
        {item.owner.address}
      </Address>
    ) : (
      '-'
    )
  }

  function renderTo(item: Activity) {
    return item.to.address ? (
      <Address chainId={item.token.chainId} type="address" variant="body2">
        {item.to.address}
      </Address>
    ) : (
      <Text variant="body2">-</Text>
    )
  }

  function renderTime(item: Activity) {
    return DateTime.fromISO(item.createdAt).toLocaleString(DateTime.DATETIME_SHORT)
  }

  const fields: SimpleField<Activity>[] = [
    { name: 'Event', render: renderEvent },
    { name: 'Price', render: renderPrice },
  ]

  fields.push(
    { name: 'From', render: renderFrom },
    { name: 'To', render: renderTo },
    { name: 'Time', render: renderTime },
  )

  return (
    <Stack spacing={4} divider={<Divider borderColor="bg2" opacity={1} />}>
      {activities.map((i, idx) => (
        <Stack key={idx} spacing={4}>
          {renderItem(i)}
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
