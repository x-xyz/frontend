import AccountLayout from 'components/account/v3/AccountLayout'
import CollectionList from 'components/token/v3/CollectionList'
import CollectionListHeader from 'components/token/v3/CollectionList/CollectionListHeader'
import { isFeatureEnabled } from 'flags'
import { useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center } from '@chakra-ui/react'
import { fetchAccount, fetchCollections } from '@x/apis/fn'
import { Account, Collection, CollectionSortOption, SearchCollectionParams } from '@x/models'
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

export default function AccountCreated({ account }: Props) {
  const [filter, setFilter] = useState<SearchCollectionParams>({})
  const [sortBy, setSortBy] = useState<CollectionSortOption>(CollectionSortOption.CreatedAtDesc)
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    ['collections', { ...filter, belongsTo: account.address, sortBy, limit: batchSize }],
    fetchCollections,
  )
  const items = useMemo(
    () => data?.pages.reduce((acc, page) => acc.concat(page.items), [] as Collection[]) || [],
    [data],
  )
  const totalCount = useMemo(() => (data?.pages ? data.pages[data.pages.length - 1].count : 0), [data])
  return (
    <AccountLayout account={account} pageTitle="Created Collections">
      <CollectionListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isLoading={isLoading}
        totalCount={totalCount}
      />
      <Center>
        <CollectionList items={items} isLoading={isLoading} hasMore={hasNextPage} onLoadMore={fetchNextPage} />
      </Center>
    </AccountLayout>
  )
}
