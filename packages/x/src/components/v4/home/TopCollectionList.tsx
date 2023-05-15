import Link from 'components/Link'
import SortableTable from 'components/v4/SortableTable'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { times } from 'lodash'
import { Box, Button, ButtonGroup, Center, Flex, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchTopCollection } from '@x/apis/fn'
import { getChainNameForUrl } from '@x/constants'
import { CollectionTradingVolumePeriod, CollectionWithTradingVolume } from '@x/models'

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
        <Text>{item.volume.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
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
            +{(value * 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
          </Text>
        )
      return (
        <Text fontSize="sm" color="danger">
          {(value * 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
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
          {item.openseaFloorPriceInNative.toLocaleString(void 0, {
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

const pageSize = 5

export default function TopCollectionList() {
  const [periodType, setPeriodType] = useState(CollectionTradingVolumePeriod.Day)

  const { data = [], isLoading } = useQuery([periodType], ctx =>
    fetchTopCollection({ periodType: ctx.queryKey[0], limit: 15 }),
  )

  const hasPromotion = useMemo(() => data.some(c => c.eligibleForPromo), [data])

  const [page, setPage] = useState(0)
  const maxPage = useMemo(() => data.length / pageSize, [data])

  return (
    <Stack>
      <Stack direction="row" spacing={4} alignItems="center">
        <Heading as="h4" fontSize="20px">
          Industry Top Collections
        </Heading>
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
        {hasPromotion && (
          <Center
            variant="unstyled"
            borderWidth="2px"
            borderColor="primary"
            borderRadius="8px"
            px={4}
            bg="linear-gradient(to bottom, #2f677b, #3c2b49)"
            color="primary"
            fontWeight="bold"
            fontSize="sm"
            h={9}
          >
            Eligible for Promo
          </Center>
        )}
      </Stack>

      <Box w="full" overflowX="auto" mt={4}>
        <SortableTable
          columns={columns}
          data={data || []}
          isLoading={isLoading}
          pagination={{ pageIndex: page, pageSize }}
        />
        <Center w="full" h="60px">
          {times(maxPage).map(i => (
            <Button
              key={i}
              w={6}
              h="full"
              variant="unstyled"
              onClick={() => setPage(i)}
              _active={{ outline: 'none' }}
              _focus={{ outline: 'none' }}
            >
              <Center w="full" h="full">
                <Box
                  w={page === i ? 3 : 2}
                  h={page === i ? 3 : 2}
                  bg={page === i ? 'primary' : 'value'}
                  borderRadius="full"
                />
              </Center>
            </Button>
          ))}
        </Center>
      </Box>
    </Stack>
  )
}
