import { ActivityTypeV2, SimpleAccount, SimpleNftItem } from '@x/models/dist'
import AccountLayout from 'components/account/AccountLayout'
import Address from 'components/Address'
import TokenIcon from 'components/icons/TokenIcon'
import Link from 'components/Link'
import Media from 'components/Media'
import SimpleTableWithScrollbar from 'components/SimpleTableWithScrollbar'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useInfiniteQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Box, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { fetchAccountActivity, fetchAccountV2 } from '@x/apis/fn'
import { findToken, getChainNameForUrl } from '@x/constants/dist'
import { Account, Activity } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'
import { builtInCollections } from '../../../configs'
import SimpleTable from 'components/SimpleTable'
import UsdPrice from 'components/UsdPrice'
import ActivityCards from '../../../components/account/ActivityCards'

const contractToName: Record<string, string> = {}

builtInCollections.forEach(c => (contractToName[c.address] = c.name))

interface Props {
  account: Account
}

const breakpoint = 'lg'

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  const account = await call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }), {
    maxAttempt: 5,
    timeout: 500,
  })
  return { props: { account } }
})

const batchSize = 50

export default function Activities({ account }: Props) {
  const { locale } = useRouter()

  const useDesktopView = useBreakpointValue({ base: false, [breakpoint]: true })

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    ['account-activities', account.address, { limit: batchSize }],
    fetchAccountActivity,
    {
      getNextPageParam: (lastPage, pages) => {
        const loaded = pages.length * batchSize
        if (lastPage.count > loaded) return loaded
      },
    },
  )

  const builtinCollectionAddresses = builtInCollections.map(c => c.address.toLowerCase())

  const items = useMemo(
    () =>
      data?.pages
        .reduce((acc, page) => acc.concat(page.activities || []), [] as Activity[])
        .filter(activity => {
          return builtinCollectionAddresses.includes(activity.token.contract.toLowerCase())
        }) || [],
    [data, builtinCollectionAddresses],
  )

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
    if (!item.paymentToken) return <Text textAlign="right">-</Text>
    return (
      <Stack align="flex-end">
        <Text>
          {item.price.toLocaleString(locale)} {findToken(item.paymentToken, item.token.chainId)?.symbol}
        </Text>
        <UsdPrice chainId={item.token.chainId} tokenId={item.paymentToken} fontSize="xs" color="#898989" prefix="$">
          {item.price}
        </UsdPrice>
      </Stack>
    )
  }

  return (
    <AccountLayout account={account}>
      {useDesktopView ? (
        <SimpleTableWithScrollbar
          size="sm"
          data={items}
          isLoading={isLoading}
          hasMore={hasNextPage}
          onMore={fetchNextPage}
          fields={[
            { name: 'Event', render: item => <Text textTransform="capitalize">{item.type}</Text> },
            { name: 'Item', render: renderItem },
            { name: 'Price', render: renderPrice },
            {
              name: 'From',
              render: item =>
                item.owner ? (
                  <Address type="address" chainId={item.token.chainId}>
                    {item.owner.address}
                  </Address>
                ) : (
                  '-'
                ),
            },
            {
              name: 'To',
              render: item =>
                item.to.address ? (
                  <Address type="address" chainId={item.token.chainId}>
                    {item.to.address}
                  </Address>
                ) : (
                  '-'
                ),
            },
            {
              name: 'Date',
              render: item => DateTime.fromISO(item.createdAt).toLocaleString(DateTime.DATETIME_SHORT),
            },
          ]}
          sx={{
            '& tr:not(:last-child)': {
              borderColor: 'divider',
              borderBottomWidth: '1px',
            },
            '& td': {
              py: 5,
            },
          }}
        />
      ) : (
        <ActivityCards activities={items} />
      )}
    </AccountLayout>
  )
}
