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

import { Box, Stack, Text } from '@chakra-ui/react'
import { fetchAccountActivity, fetchAccountV2 } from '@x/apis/fn'
import { findToken, getChainNameForUrl } from '@x/constants/dist'
import { Account, Activity } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'
import { builtInCollections } from '../../../configs'

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  const account = await call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }), {
    maxAttempt: 5,
    timeout: 500,
  })
  return { props: { account } }
})

const batchSize = 10

export default function Activities({ account }: Props) {
  const { locale } = useRouter()

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
          <Media w={15} src={item.token.hostedImageUrl || item.token.imageUrl} />
          <Text>{item.token.name}</Text>
        </Stack>
      </Link>
    )
  }

  function renderPrice(item: Activity) {
    return (
      <Stack direction="row" align="center">
        <TokenIcon w={5} tokenId={item.paymentToken} chainId={item.token.chainId} />
        <Text>
          {item.price.toLocaleString(locale)} {findToken(item.paymentToken, item.token.chainId)?.symbol}
        </Text>
      </Stack>
    )
  }

  return (
    <AccountLayout account={account}>
      <Box borderColor="divider" borderWidth="1px" mt={15}>
        <Box bg="#2a2a2a" borderBottomColor="divider" borderBottomWidth="1px" fontSize="xs" px={4} py={2.5}>
          ACTIVITY
        </Box>
        <SimpleTableWithScrollbar
          size="sm"
          data={items}
          isLoading={isLoading}
          hasMore={hasNextPage}
          onMore={fetchNextPage}
          fields={[
            { name: 'EVENT', render: item => item.type },
            { name: 'ITEM', render: renderItem },
            { name: 'PRICE', render: renderPrice },
            { name: 'QUANTITY', render: item => item.quantity },
            {
              name: 'OWNER',
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
              name: 'DATE',
              render: item =>
                DateTime.fromISO(item.createdAt).toLocaleString({ dateStyle: 'short', timeStyle: 'short' }, { locale }),
            },
          ]}
        />
      </Box>
    </AccountLayout>
  )
}
