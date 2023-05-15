import Layout from 'components/Layout/v3'
import CollectionList from 'components/token/v3/CollectionList'
import CollectionListHeader from 'components/token/v3/CollectionList/CollectionListHeader'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Center, Container, Heading } from '@chakra-ui/react'
import { Category, ChainId, Collection, CollectionSortOption, SearchCollectionParams } from '@x/models'
import { getFirst } from '@x/utils'
import { useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { useActiveWeb3React, useAuthToken } from '@x/hooks'
import { fetchCollections } from '@x/apis/fn'
import { reduce } from 'lodash'

const breakpoint = 'lg'

interface Props {
  defaultChainId?: ChainId
  defaultCategory?: Category
}

export const getServerSideProps = createServerSidePropsGetter(async ctx => {
  const props: Props = {}

  const chainId = getFirst(ctx.query.chainId)
  if (chainId) {
    const value = parseInt(chainId, 10)
    if (!isNaN(value)) props.defaultChainId = value
  }

  const category = getFirst(ctx.query.category)
  if (category) {
    const value = parseInt(category, 10)
    if (!isNaN(value)) props.defaultCategory = value
  }

  return { props }
})

const batchSize = 10

export default function Collections({ defaultChainId, defaultCategory }: Props) {
  const { account } = useActiveWeb3React()
  const [authToken, isLoadingAuthToken] = useAuthToken()
  const [filter, setFilter] = useState<SearchCollectionParams>({ chainId: defaultChainId, category: defaultCategory })
  const [sortBy, setSortBy] = useState(CollectionSortOption.CreatedAtDesc)
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    [
      'collections',
      {
        ...filter,
        sortBy,
        // holder: account || void 0,
        limit: batchSize,
        authToken,
      },
    ],
    fetchCollections,
    {
      enabled: !isLoadingAuthToken,
      getNextPageParam: (lastPage, allPages) => {
        const length = reduce(
          allPages,
          (length, collectionsResult) => length + (collectionsResult.items.length || 0),
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
    <Layout>
      <Center
        bgImg={{
          base: 'url(/assets/v3/mobile_xplore_banner_640x120_bg.jpg)',
          md: 'url(/assets/v3/xplore_collections_banner_2560x120_bg.jpg)',
        }}
        bgSize="auto 100%"
        bgRepeat="no-repeat"
        bgPos="center"
        h="120px"
        borderBottomWidth="1px"
        borderColor="divider"
        alignItems="flex-end"
        pb={3}
      >
        <Container maxW="container.xl">
          <Heading textAlign={{ base: 'center', [breakpoint]: 'unset' }}>X-plore Collections</Heading>
        </Container>
      </Center>
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
    </Layout>
  )
}
