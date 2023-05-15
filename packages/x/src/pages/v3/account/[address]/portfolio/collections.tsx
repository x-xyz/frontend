import AccountLayout from 'components/account/v3/AccountLayout'
import { isFeatureEnabled } from 'flags'
import { reduce } from 'lodash'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { fetchAccount, fetchCollections } from '@x/apis/fn'
import { Account, Collection, CollectionSortOption, SearchCollectionParams } from '@x/models'
import { call, getFirst, isAddress, isErrorResponse } from '@x/utils'
import { useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { useAuthToken } from '@x/hooks'
import CollectionListHeader from 'components/token/v3/CollectionList/CollectionListHeader'
import { Center } from '@chakra-ui/react'
import CollectionList from 'components/token/v3/CollectionList'
import { getChainNameForUrl } from '@x/constants/dist'

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

export default function AccountCollections({ account }: Props) {
  const [filter, setFilter] = useState<SearchCollectionParams>({})
  const [sortBy, setSortBy] = useState<CollectionSortOption>(CollectionSortOption.CreatedAtDesc)
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    ['collections', { ...filter, sortBy, holder: account.address, limit: batchSize }],
    fetchCollections,
    {
      getNextPageParam: (lastPage, allPages) => {
        const length = reduce(
          allPages,
          (length, collectionsResult) => {
            return length + (collectionsResult.items.length || 0)
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
  const items = useMemo(
    () => data?.pages.reduce((acc, page) => acc.concat(page.items), [] as Collection[]) || [],
    [data],
  )
  const totalCount = useMemo(() => (data?.pages ? data.pages[data.pages.length - 1].count : 0), [data])
  return (
    <AccountLayout account={account} pageTitle="Collections">
      <CollectionListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isLoading={isLoading}
        totalCount={totalCount}
      />
      <Center>
        <CollectionList
          items={items}
          isLoading={isLoading}
          isOwner
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          collectionUrl={c =>
            `/account/${account.address}/portfolio/collection/${getChainNameForUrl(c.chainId)}/${c.erc721Address}`
          }
        />
      </Center>
    </AccountLayout>
  )
}
