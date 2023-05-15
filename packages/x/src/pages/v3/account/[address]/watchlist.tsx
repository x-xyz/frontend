import AccountLayout from 'components/account/v3/AccountLayout'
import NftList from 'components/token/v3/NftList.v2'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { isFeatureEnabled } from 'flags'
import { useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center } from '@chakra-ui/react'
import { fetchAccount, fetchTokens } from '@x/apis/fn'
import { useAuthToken } from '@x/hooks'
import {
  Account,
  NftItem,
  SearchTokenV2Params,
  TokenV2SortOption,
  tokenV2SortOptionToLegacySortOptions,
} from '@x/models'
import { call, getFirst, isAddress, isErrorResponse } from '@x/utils'

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

export default function AccountWatchlist({ account }: Props) {
  const [authToken] = useAuthToken()

  const [filter, setFilter] = useState<SearchTokenV2Params>({ likedBy: account.address })
  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.CreatedAtDesc)

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery(
    ['watchlist', { ...filter, sortBy, likedBy: account.address, authToken, limit: batchSize }],
    fetchTokens,
    {
      getNextPageParam: (lastPage, pages) => {
        const loaded = pages.length * batchSize
        if (lastPage.data.count > loaded) return loaded
      },
    },
  )

  const items = useMemo(
    () => data?.pages.reduce((acc, { data: { items } }) => acc.concat(items || []), [] as NftItem[]),
    [data],
  )

  const totalCount = useMemo(() => data?.pages && data.pages[data.pages.length - 1].data.count, [data])

  return (
    <AccountLayout account={account} pageTitle="Watchlist">
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        hideFilters={['likedBy']}
        totalCount={totalCount}
        isLoading={status === 'loading'}
      />
      <Center>
        <NftList items={items} isLoading={status === 'loading'} hasMore={hasNextPage} onLoadMore={fetchNextPage} />
      </Center>
    </AccountLayout>
  )
}
