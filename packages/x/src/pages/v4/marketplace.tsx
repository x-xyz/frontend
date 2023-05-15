import { ButtonGroup } from '@chakra-ui/button'
import { Flex } from '@chakra-ui/layout'
import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchTopCollection } from '@x/apis/fn'
import { getChainNameForUrl } from '@x/constants/dist'
import { CollectionTradingVolumePeriod, CollectionWithTradingVolume } from '@x/models/dist'
import Image from 'components/Image'
import Layout from 'components/Layout/v4'
import Link from 'components/Link'
import SortableTable from 'components/v4/SortableTable'
import { useRouter } from 'next/router'
import { useState } from 'react'
import InView from 'react-intersection-observer'
import { useQuery } from 'react-query'

export default function Index() {
  const { locale } = useRouter()
  const [periodType, setPeriodType] = useState(CollectionTradingVolumePeriod.Day)
  const { data, isLoading } = useQuery(['top-collection', periodType], async () =>
    fetchTopCollection({ periodType, limit: 100 }),
  )
  const [pageSize, setPageSize] = useState(15)

  const columns: ColumnDef<CollectionWithTradingVolume>[] = [
    {
      header: 'Collection',
      cell: ({ row }) => {
        const item = row.original
        return (
          <Flex alignItems="center">
            <Text minW="10">{row.index + 1}</Text>
            <Image
              w={10}
              h={10}
              mr={3}
              borderRadius="20px"
              overflow="hidden"
              flexShrink={0}
              src={item.logoImageUrl || item.logoImageHash}
            />
            <Link
              fontSize="sm"
              fontWeight="bold"
              maxW="140px"
              isTruncated
              href={`/collection/${getChainNameForUrl(item.chainId)}/${item.erc721Address}`}
            >
              {item.collectionName}
            </Link>
          </Flex>
        )
      },
    },
    {
      header: 'Volume',
      accessorKey: 'volume',
      cell: ({ row: { original: item } }) => (
        <Flex alignItems="center">
          <Image w={6} h={6} mr={2} borderRadius="200px" src={'/assets/v3/ico-ethereum-60x60.svg'} />
          <Text>{item.volume.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </Flex>
      ),
    },
    {
      header: '% Change',
      accessorKey: 'changeRatio',
      cell: ({ row: { original: item } }) => {
        const value = item.changeRatio
        if (value === -1) return <Text fontSize="sm">-</Text>
        if (value === 0) return <Text fontSize="sm">0%</Text>
        if (value > 0)
          return (
            <Text fontSize="sm" color="success">
              +{(value * 100).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </Text>
          )
        return (
          <Text fontSize="sm" color="danger">
            {(value * 100).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
          </Text>
        )
      },
    },
    {
      header: 'Floor Price',
      accessorKey: 'openseaFloorPriceInNative',
      cell: ({ row: { original: item } }) => (
        <Flex alignItems="center">
          <Image w={6} h={6} mr={2} borderRadius="200px" src={'/assets/v3/ico-ethereum-60x60.svg'} />
          <Text>
            {item.openseaFloorPriceInNative.toLocaleString(locale, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </Text>
        </Flex>
      ),
    },
    {
      header: 'Sales Count',
      accessorKey: 'sales',
      cell: ({ row: { original: item } }) => <Text>{item.sales}</Text>,
    },
    {
      header: '% Unique Owner',
      cell: () => '-',
    },
  ]

  return (
    <Layout bg="url(/assets/v4/bg/bg_ip_marketplace.jpg)">
      <Container maxW="container.xl" px={0}>
        <Stack align="center" mt="72px" mb="72px">
          <Heading fontSize="4.25rem" textTransform="uppercase">
            nft marketplace
          </Heading>
          <Text fontSize="2xl">Explore or search for your favorite NFT collection</Text>
        </Stack>
        <Box>
          <ButtonGroup
            isAttached
            variant="ghost"
            border="1px solid"
            borderColor="divider"
            borderRadius="6px"
            bgColor="black"
          >
            <Button
              minW="unset"
              color={periodType === CollectionTradingVolumePeriod.Day ? 'primary' : 'divider'}
              onClick={() => setPeriodType(CollectionTradingVolumePeriod.Day)}
            >
              24H
            </Button>
            <Button
              minW="unset"
              color={periodType === CollectionTradingVolumePeriod.Week ? 'primary' : 'divider'}
              onClick={() => setPeriodType(CollectionTradingVolumePeriod.Week)}
            >
              7D
            </Button>
            <Button
              minW="unset"
              color={periodType === CollectionTradingVolumePeriod.Month ? 'primary' : 'divider'}
              onClick={() => setPeriodType(CollectionTradingVolumePeriod.Month)}
            >
              30D
            </Button>
          </ButtonGroup>
        </Box>
        <Box w="full" overflowX="auto" mt={4}>
          <SortableTable
            columns={columns}
            data={data || []}
            isLoading={isLoading}
            pagination={{ pageIndex: 0, pageSize }}
            onMore={
              process.browser && (
                <InView onChange={inView => inView && pageSize < (data?.length || 0) && setPageSize(pageSize + 15)} />
              )
            }
          />
        </Box>
      </Container>
    </Layout>
  )
}
