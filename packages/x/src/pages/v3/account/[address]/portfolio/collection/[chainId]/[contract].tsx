import AccountCollectionLayout from 'components/account/v3/AccountCollectionLayout'
import NftList from 'components/token/v3/NftList.v2'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center } from '@chakra-ui/react'
import { fetchAccountV2, fetchCollectionWithAccountStat, fetchTokens } from '@x/apis/fn'
import { getChainIdFromUrl } from '@x/constants'
import { useAuthToken } from '@x/hooks'
import { Account, CollectionWithAccountStat, NftItem, SearchTokenV2Params, TokenV2SortOption } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'

interface Props {
  account: Account
  collection: CollectionWithAccountStat
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }
  const chainId = getChainIdFromUrl(getFirst(ctx.params?.chainId) || '')
  if (!chainId) return { notFound: true }
  const contract = getFirst(ctx.params?.contract)
  if (!contract || !isAddress(contract)) return { notFound: true }
  const [account, collection] = await Promise.all([
    call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }), { maxAttempt: 5, timeout: 500 }),
    call(
      () =>
        fetchCollectionWithAccountStat({
          queryKey: ['collection-with-account-stat', address, chainId, contract],
          meta: {},
        }),
      {
        maxAttempt: 5,
        timeout: 500,
      },
    ),
  ])
  return { props: { account, collection } }
})

const batchSize = 10

export default function AccountCollection({ account, collection }: Props) {
  const [authToken] = useAuthToken()
  const [filter, setFilter] = useState<SearchTokenV2Params>({})
  const [sortBy, setSortBy] = useState(TokenV2SortOption.CreatedAtDesc)
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    [
      'tokens',
      {
        ...filter,
        sortBy,
        authToken,
        chainId: collection.chainId,
        collections: [collection.erc721Address],
        belongsTo: account.address,
        limit: batchSize,
      },
    ],
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
    <AccountCollectionLayout account={account} collection={collection} pageTitle={collection.collectionName}>
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={totalCount}
        isLoading={isLoading}
        hideFilters={['chainId', 'collections', 'belongsTo', 'category']}
      />
      <Center>
        <NftList items={items} isLoading={isLoading} hasMore={hasNextPage} onLoadMore={fetchNextPage} />
      </Center>
    </AccountCollectionLayout>
  )
}
