import Address from 'components/Address'
import ChainIcon from 'components/ChainIcon'
import CollapsedBox from 'components/CollapsedBox'
import CollectionMenu from 'components/collection/v3/CollectionMenu'
import TradingVolume from 'components/collection/v3/TradingVolume'
import Image from 'components/Image'
import Layout from 'components/Layout/v3'
import Link from 'components/Link'
import Markdown from 'components/Markdown'
import NftList from 'components/token/v3/NftList.v2'
import NftListHeader from 'components/token/v3/NftList.v2/NftListHeader'
import Price from 'components/v3/Price'
import * as yugaConfig from 'configs/yuga-collections'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import { Box, Center, CenterProps, Container, Flex, Skeleton, SkeletonText, Stack, Text } from '@chakra-ui/react'
import { fetchAccountV2, fetchCollection, fetchTokens } from '@x/apis/fn'
import { getChain, getChainIdFromUrl } from '@x/constants'
import { useAuthToken } from '@x/hooks'
import { Collection, NftItem, SearchTokenV2Params, TokenV2SortOption, TradingVolumePeriod } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'

export interface Props {
  collection: Collection
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const { params = {} } = ctx
  const chainName = getFirst(params.chainName)
  const chainId = chainName && getChainIdFromUrl(chainName)
  const contract = getFirst(params.contract)

  if (!chainId || !contract || !isAddress(contract)) return { notFound: true }

  const resp = await call(() => fetchCollection({ chainId, contract }), { maxAttempt: 5, timeout: 500 })
  if (resp.status === 'fail') return { notFound: true }

  return { props: { collection: resp.data } }
})

const batchSize = 10

export default function Page({ collection }: Props) {
  const now = useMemo(() => new Date(), [])

  const { locale } = useRouter()

  const { chainId, erc721Address } = collection

  const chain = useMemo(() => getChain(chainId), [chainId])

  const { data: owner, isLoading: isLoadingOwner } = useQuery(['account', collection.owner], fetchAccountV2, {
    enabled: !!collection.owner,
  })

  const [authToken] = useAuthToken()
  const [filter, setFilter] = useState<SearchTokenV2Params>({})
  const [sortBy, setSortBy] = useState(TokenV2SortOption.PriceAsc)
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    ['tokens', { ...filter, sortBy, authToken, chainId, collections: [erc721Address], limit: batchSize }],
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

  function renderStat(title: string, value: string, note?: string, isLoading?: boolean) {
    return (
      <Center
        w={{ base: '160px', md: '200px' }}
        h="100px"
        flexDir="column"
        justifyContent="flex-start"
        pt={5}
        border="1px solid"
        borderColor="divider"
        mr="-1px"
        mb="-1px"
      >
        <Text fontSize="xs" fontWeight="bold" color="white">
          {title}
        </Text>
        <Skeleton isLoaded={!isLoading}>
          <Text fontSize="lg" fontWeight="bold">
            {value}
          </Text>
        </Skeleton>
        <Text fontSize="sm" color="value">
          {note}
        </Text>
      </Center>
    )
  }

  return (
    <Layout>
      <Box
        bgImg={{
          base: 'url(/assets/v3/mobile_nft_cover_banner_640x300.jpg)',
          md: 'url(/assets/v3/nft_cover_banner_1200x300.jpg)',
        }}
        bgSize="auto 100%"
        bgRepeat="no-repeat"
        bgPos={{ base: 'left center', md: 'center' }}
        h="300px"
      />
      <Container pos="relative" maxW="container.xl" py={5}>
        <Image
          pos="absolute"
          left="50%"
          transform="translate(-60px, -60px)"
          w="120px"
          h="120px"
          borderRadius="60px"
          border="2px solid"
          borderColor="divider"
          overflow="hidden"
          src={collection.logoImageUrl || collection.logoImageHash}
        />
        <ChainIcon chainId={chainId} w={10} h={10} border="1px solid" borderColor="divider" borderRadius={0} />
        <Box pos="absolute" top={5} right={4}>
          <CollectionMenu collection={collection} />
        </Box>
        <Box h={24} />
        <Stack align="center" spacing={10}>
          <Stack direction="row" align="center">
            <Text fontSize="4xl" fontWeight="bold">
              {collection.collectionName}
            </Text>
          </Stack>
          {collection.owner && (
            <Stack align="center" spacing={1}>
              <Text color="note" fontSize="xs" fontWeight="bold">
                Created by
              </Text>
              <SkeletonText fontWeight="bold" noOfLines={1} isLoaded={!isLoadingOwner} isTruncated>
                {owner?.alias || collection.owner || '-'}
              </SkeletonText>
              <Address type="copy" color="value" fontSize="sm">
                {collection.owner}
              </Address>
            </Stack>
          )}
          <CollapsedBox as={Text} maxW="760px" collapsedHeight={144} color="note">
            <Markdown>{collection.description}</Markdown>
          </CollapsedBox>
          <Flex wrap="wrap" justify="center">
            <Stat>
              <Price
                label="X Floor Price"
                price={collection.floorPrice}
                priceInUsd={collection.usdFloorPrice}
                unit={chain.nativeCurrency.symbol}
                center
                tooltip="Floor on X Marketplace"
              />
            </Stat>
            <Stat>
              <Price
                label="Highest Sale"
                price={collection.highestSale}
                priceInUsd={collection.highestSaleInUsd}
                unit={chain.nativeCurrency.symbol}
                center
              />
            </Stat>
            <Stat>
              <TradingVolume
                chainId={collection.chainId}
                contract={collection.erc721Address}
                period={TradingVolumePeriod.Day}
                date={now}
                center
              />
            </Stat>
            {renderStat('Items', collection.supply?.toLocaleString(locale) || '-')}
            {renderStat('Owners', collection.numOwners?.toLocaleString(locale) || '-')}
          </Flex>
        </Stack>
      </Container>
      <Box h={10} />
      <Center w="full" borderBottom="1px solid" borderColor="divider">
        <Center h="full" p={6} borderBottom="4px solid" borderColor="primary" fontWeight="extrabold">
          NFT
        </Center>
      </Center>
      <Center>
        <NftListHeader
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          totalCount={totalCount}
          isLoading={isLoading}
          collection={collection}
          hideFilters={['chainId', 'category', 'collections']}
        />
      </Center>
      <Center>
        <NftList items={items} isLoading={isLoading} hasMore={hasNextPage} onLoadMore={fetchNextPage} />
      </Center>
    </Layout>
  )
}

function Stat({ children, ...props }: CenterProps) {
  return (
    <Center
      w={{ base: '160px', md: '200px' }}
      h="100px"
      flexDir="column"
      justifyContent="flex-start"
      pt={5}
      border="1px solid"
      borderColor="divider"
      mr="-1px"
      mb="-1px"
      {...props}
    >
      {children}
    </Center>
  )
}
