import { ButtonGroup } from '@chakra-ui/button'
import { Flex } from '@chakra-ui/layout'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  InputLeftElement,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { CellContext, ColumnDef, Row } from '@tanstack/react-table'
import { useTopCollectionsQuery } from '@x/apis/dist'
import { CollectionTradingVolumePeriod, CollectionWithTradingVolume } from '@x/models/dist'

import Image from 'components/Image'
import Link from 'components/Link'
import SortableTable from 'components/SortableTable'
import { useState } from 'react'
import Carousel from './Carousel'
import { builtInCollections, CollectionGroup, TwelvefoldAddressPlaceholder } from '../../../configs'
import { compareAddress } from '@x/utils/dist'
import { Input, InputGroup } from '@chakra-ui/input'
import { SearchIcon } from '@chakra-ui/icons'
import { filter } from 'lodash'
import { useRouter } from 'next/router'

// cell wrapper for twelvefold
const cellFunctionWrapper = (f: (row: CellContext<CollectionWithTradingVolume, unknown>) => JSX.Element) => {
  return (row: CellContext<CollectionWithTradingVolume, unknown>) => {
    const item = row.row.original
    if (compareAddress(item.erc721Address, TwelvefoldAddressPlaceholder)) {
      return <Text>N/A</Text>
    } else {
      return f(row)
    }
  }
}

const columns: ColumnDef<CollectionWithTradingVolume>[] = [
  {
    header: 'Collection',
    cell: ({ row }) => {
      const item = row.original
      return (
        <Flex alignItems="center">
          <Image
            w={20}
            h={20}
            mr={3}
            overflow="hidden"
            flexShrink={0}
            borderRadius="4px"
            border="1px solid #1e1e1e"
            src={item.logoImageUrl || item.logoImageHash}
          />
          <Link
            fontWeight="bold"
            maxW="240px"
            minW="unset"
            whiteSpace="break-spaces"
            isTruncated
            href={`/collection/${builtInCollections.find(c => compareAddress(c.address, item.erc721Address))?.alias}`}
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
    cell: cellFunctionWrapper(({ row: { original: item } }) => (
      <Stack>
        <Text>{item.volume.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH</Text>
        <Text color="textSecondary">
          {item.volumeInApe.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APE
        </Text>
      </Stack>
    )),
    enableSorting: false,
    meta: { isNumeric: true },
  },
  {
    header: '% Change',
    accessorKey: 'changeRatio',
    cell: cellFunctionWrapper(({ row: { original: item } }) => {
      const value = item.changeRatio
      if (value === -1) return <Text>-</Text>
      if (value === 0) return <Text>0%</Text>
      if (value > 0)
        return (
          <Text color="success">
            +{(value * 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
          </Text>
        )
      return (
        <Text color="danger">
          {(value * 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </Text>
      )
    }),
    enableSorting: false,
    meta: { isNumeric: true },
  },
  {
    header: 'Floor Price',
    accessorKey: 'openseaFloorPriceInNative',
    cell: cellFunctionWrapper(({ row: { original: item } }) => (
      <Stack>
        <Text>
          {item.openseaFloorPriceInNative.toLocaleString(void 0, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ETH
        </Text>
        <Text color="textSecondary">
          {item.openseaFloorPriceInApe.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
          APE
        </Text>
      </Stack>
    )),
    enableSorting: false,
    meta: { isNumeric: true },
  },
  {
    header: 'Sales Count',
    accessorKey: 'sales',
    cell: cellFunctionWrapper(({ row: { original: item } }) => <Text>{item.sales.toLocaleString()}</Text>),
    enableSorting: false,
    meta: { isNumeric: true },
  },
  {
    header: '% Unique Owner',
    cell: cellFunctionWrapper(({ row: { original: item } }) => (
      <Stack>
        <Text>
          {((item.numOwners / item.supply) * 100).toLocaleString(void 0, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          %
        </Text>
        <Text color="textSecondary">{item.numOwners.toLocaleString()} Owners</Text>
      </Stack>
    )),
    meta: { isNumeric: true },
  },
]

const breakpoint = 'lg'

const twelvefoldCollection = {
  chainId: '',
  erc721Address: TwelvefoldAddressPlaceholder,
  collectionName: 'Twelvefold',
  logoImageHash: '',
  logoImageUrl: 'https://storage.x.xyz/twelvefold/TwelveFold_1.webp',
  volume: 0,
  volumeInUsd: 0,
  volumeInApe: 0,
  changeRatio: 0,
  openseaFloorPriceInNative: 0,
  openseaFloorPriceInUsd: 0,
  openseaFloorPriceMovement: 0,
  openseaFloorPriceInApe: 0,
  sales: 0,
  supply: 300,
  numOwners: 0,
  eligibleForPromo: false,
}

export default function TopCollections() {
  const [period, setPeriod] = useState(CollectionTradingVolumePeriod.Day)
  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })

  const [search, setSearch] = useState('')

  const router = useRouter()

  const { data, isLoading } = useTopCollectionsQuery({
    periodType: period,
    limit: 100,
    yugaLab: true,
  })

  function getFilteredData() {
    if (!data || !data.data) return []

    const extendedData = [...data.data, twelvefoldCollection]

    if (!search) return extendedData

    return filter(extendedData, c => c.collectionName.toLowerCase().includes(search.toLowerCase()))
  }

  function getGroupedData(group: CollectionGroup) {
    const data = getFilteredData()

    const groupedData = filter(data, d => {
      return !!builtInCollections.find(c => {
        return compareAddress(c.address, d.erc721Address) && c.group === group
      })
    })

    // if (group === CollectionGroup.Yuga) {
    //   groupedData.push(twelvefoldCollection)
    // }

    return groupedData.sort((a, b) => {
      const orderA = builtInCollections.find(c => compareAddress(c.address, a.erc721Address))?.order || 0
      const orderB = builtInCollections.find(c => compareAddress(c.address, b.erc721Address))?.order || 0
      return orderB - orderA
    })
  }

  const periodOptions = [
    {
      text: '24h',
      period: CollectionTradingVolumePeriod.Day,
    },
    {
      text: '7d',
      period: CollectionTradingVolumePeriod.Week,
    },
    {
      text: '30d',
      period: CollectionTradingVolumePeriod.Month,
    },
    {
      text: 'All',
      period: CollectionTradingVolumePeriod.All,
    },
  ]

  function renderSearchInput() {
    return (
      <InputGroup>
        <InputLeftElement>
          <SearchIcon color="textSecondary" />
        </InputLeftElement>
        <Input
          placeholder="Search by Collection Name"
          bg="black"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ '::placeholder': { color: 'textDisable' } }}
        />
      </InputGroup>
    )
  }

  function renderPeriodButtonGroup() {
    return (
      <ButtonGroup variant="group" isAttached border="1px solid" borderColor="line">
        {periodOptions.map(o => (
          <Button key={o.text} onClick={() => setPeriod(o.period)} isActive={period === o.period}>
            {o.text}
          </Button>
        ))}
      </ButtonGroup>
    )
  }

  return (
    <Flex direction="column" width="full">
      <Box py={useMobileLayout ? 4 : 10} w="full">
        <Carousel />
      </Box>
      <Stack py={4} spacing={6}>
        <Text fontSize={{ base: 'xl', [breakpoint]: '3xl' }} fontWeight={{ base: 'medium', [breakpoint]: 'bold' }}>
          Available Collections
        </Text>
        {useMobileLayout ? (
          <>
            {renderSearchInput()}
            <Box>{renderPeriodButtonGroup()}</Box>
          </>
        ) : (
          <HStack spacing={9}>
            <Box flexGrow={1}>{renderSearchInput()}</Box>
            {renderPeriodButtonGroup()}
          </HStack>
        )}
      </Stack>
      {useMobileLayout ? (
        <Stack spacing={0}>
          {[CollectionGroup.Yuga, CollectionGroup.Otherside, CollectionGroup.L2, CollectionGroup.ApeCoinGovernance].map(
            group => (
              <Accordion
                key={group}
                defaultIndex={group === CollectionGroup.Yuga ? [0] : undefined}
                allowToggle
                borderBottom="1px solid"
                borderBottomColor="line"
              >
                <AccordionItem>
                  <AccordionButton w="full" py={4} _focus={{ boxShadow: 'none' }} _active={{ boxShadow: 'none' }}>
                    <HStack justifyContent="space-between" w="full">
                      <Text variant="subtitle1">{group}</Text>
                      <AccordionIcon />
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel p={0}>
                    <Stack divider={<Box borderBottom="1px solid" borderBottomColor="line" />} spacing={0}>
                      {getGroupedData(group).map(c => (
                        <MobileCollection key={c.collectionName} collection={c} />
                      ))}
                    </Stack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            ),
          )}
        </Stack>
      ) : (
        [CollectionGroup.Yuga, CollectionGroup.Otherside, CollectionGroup.L2, CollectionGroup.ApeCoinGovernance].map(
          group => (
            <Stack key={group} spacing={4} py={6}>
              <Text variant="headline6">{group}</Text>
              <Box py={4}>
                <SortableTable
                  columns={columns}
                  data={getGroupedData(group)}
                  hoverColor="bg2"
                  onRowClicked={row => {
                    const item = row.original
                    router.push(
                      `/collection/${
                        builtInCollections.find(c => compareAddress(c.address, item.erc721Address))?.alias
                      }`,
                    )
                  }}
                />
              </Box>
            </Stack>
          ),
        )
      )}
    </Flex>
  )
}

interface MobileCollectionProps {
  collection: CollectionWithTradingVolume
}

function MobileCollection({ collection }: MobileCollectionProps) {
  const change = (() => {
    const value = collection.changeRatio
    if (value === -1) return <Text>-</Text>
    if (value === 0) return <Text>0%</Text>
    if (value > 0)
      return (
        <Text variant="body2" color="success">
          +{(value * 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </Text>
      )
    return (
      <Text variant="body2" color="danger">
        {(value * 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
      </Text>
    )
  })()

  const isTwelvefold = compareAddress(collection.erc721Address, TwelvefoldAddressPlaceholder)

  return (
    <Stack py={4} spacing={4}>
      <HStack alignItems="center" spacing={4}>
        <Image
          w={15}
          h={15}
          overflow="hidden"
          flexShrink={0}
          src={collection.logoImageUrl || collection.logoImageHash}
        />
        <Link
          fontWeight="bold"
          maxW="140px"
          isTruncated
          href={`/collection/${
            builtInCollections.find(c => compareAddress(c.address, collection.erc721Address))?.alias
          }`}
        >
          {collection.collectionName}
        </Link>
      </HStack>
      <Flex gap={4}>
        <Stack spacing={1} flex="1 0 0">
          <Text variant="caption" color="textSecondary">
            Volume
          </Text>
          {!isTwelvefold ? (
            <Text variant="body2">
              {collection.volume.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH
            </Text>
          ) : (
            <Text variant="body2">N/A</Text>
          )}
        </Stack>
        <Stack spacing={1} flex="1 0 0">
          <Text variant="caption" color="textSecondary">
            Floor Price
          </Text>
          {!isTwelvefold ? (
            <Text variant="body2">
              {collection.openseaFloorPriceInNative.toLocaleString(void 0, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}{' '}
              ETH
            </Text>
          ) : (
            <Text variant="body2">N/A</Text>
          )}
        </Stack>
      </Flex>
      <Flex gap={4}>
        <Stack spacing={1} flex="1 0 0">
          <Text variant="caption" color="textSecondary">
            % Change
          </Text>
          {!isTwelvefold ? change : <Text variant="body2">N/A</Text>}
        </Stack>
        <Stack spacing={1} flex="1 0 0">
          <Text variant="caption" color="textSecondary">
            Sales
          </Text>
          {!isTwelvefold ? <Text variant="body2">{collection.sales}</Text> : <Text variant="body2">N/A</Text>}
        </Stack>
      </Flex>
    </Stack>
  )
}
