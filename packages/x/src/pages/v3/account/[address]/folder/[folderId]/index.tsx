import AccountFolderLayout from 'components/account/v3/AccountFolderLayout'
import NftList from 'components/token/v3/NftList.v2'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import { isFeatureEnabled } from 'flags'
import { useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center } from '@chakra-ui/react'
import { fetchAccountFolder, fetchAccountV2, fetchTokens } from '@x/apis/fn'
import { useAuthToken } from '@x/hooks/dist'
import { Account, Folder, NftItem, SearchTokenV2Params, TokenV2SortOption } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'

interface Props {
  account: Account
  folder: Folder
}

export const getServerSideProps = createServerSidePropsGetter<Props>(
  async (ctx, authToken) => {
    const address = getFirst(ctx.params?.address)
    if (!address || !isAddress(address)) return { notFound: true }
    const folderId = getFirst(ctx.params?.folderId)
    if (!folderId) return { notFound: true }
    const [account, folder] = await Promise.all([
      call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }), {
        maxAttempt: 5,
        timeout: i => i * 300,
      }),
      call(() => fetchAccountFolder({ queryKey: ['accountFolder', address, folderId, { authToken }], meta: {} }), {
        maxAttempt: 5,
        timeout: i => i * 300,
      }),
    ])
    return { props: { account, folder: folder } }
  },
  { requrieAuth: !isFeatureEnabled('v3.portfolio-page') },
)

const batchSize = 10

export default function AccountFolder({ account, folder: initialFolder }: Props) {
  const [authToken] = useAuthToken()
  const { data: folder = initialFolder } = useQuery(
    ['accountFolder', account.address, initialFolder.id, { authToken }],
    fetchAccountFolder,
    { initialData: initialFolder },
  )
  const [filter, setFilter] = useState<SearchTokenV2Params>({ sortBy: TokenV2SortOption.CreatedAtDesc })
  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.CreatedAtDesc)
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    ['tokens', { ...filter, sortBy, folderId: folder.id, belongsTo: account.address, authToken, limit: batchSize }],
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
    <AccountFolderLayout account={account} folder={folder}>
      <NftListHeader
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={totalCount}
        isLoading={isLoading}
      />
      <Center>
        <NftList items={items} isLoading={isLoading} hasMore={hasNextPage} onLoadMore={fetchNextPage} />
      </Center>
    </AccountFolderLayout>
  )
}
