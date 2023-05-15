import CollapsedBox from 'components/CollapsedBox'
import CollectionInfoPopover from 'components/CollectionInfoPopover'
import Image from 'components/Image'
import SelectCollection from 'components/input/SelectCollection'
import Layout from 'components/Layout'
import Markdown from 'components/Markdown'
import AppliedTokenFilters from 'components/token/AppliedTokenFilters'
import NftList from 'components/token/NftList.v2'
import TokenFilters from 'components/token/TokenFilters'
import { builtInCollections, TwelvefoldAddressPlaceholder } from 'configs'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useDebouncedValue } from '@x/hooks'
import { Collection, NftItem, SearchTokenV2Params } from '@x/models'
import { compareAddress } from '@x/utils'
import { SearchIcon } from '@chakra-ui/icons'
import Link from 'components/Link'
import useTwelvefoldCollection from '../../hooks/useTwelvefoldCollection'
import { fetchTwelvefoldCollection } from '@x/apis/dist/fn'
import { TwelvefoldItem } from '@x/models/dist'
import { chain, countBy, find } from 'lodash'
import TokenSortor from '../../components/token/TokenSortor'

const defaultCollectionWhitelist = builtInCollections.map(({ chainId, address }) => ({ chainId, contract: address }))

const breakpoint = 'md'

interface Props {
  collection: Collection
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const collection = useTwelvefoldCollection()
  return { props: { collection } }
})

const batchSize = 18

function twelvefoldToNftItem(twelvefold: TwelvefoldItem): NftItem {
  return {
    contractAddress: TwelvefoldAddressPlaceholder,
    isAppropriate: true,
    lastSalePrice: 0,
    lastSalePriceInUSD: 0,
    lastSalePricePaymentToken: '',
    liked: 0,
    viewed: 0,
    name: twelvefold.Edition,
    paymentToken: '',
    price: 0,
    priceInUsd: 0,
    supply: 0,
    thumbnailPath: '',
    tokenId: twelvefold.Edition,
    tokenType: 0,
    chainId: 1,
    listings: [],
    offers: [],
    imageUrl: `https://storage.x.xyz/twelvefold/TwelveFold_${twelvefold.Edition}.webp`,
    tokenUri: '',
    contentType: 'image',
    attributes: [
      { trait_type: 'season', value: twelvefold.Season },
      { trait_type: 'series', value: twelvefold.Series },
    ],
  }
}

export default function CollectionPage({ collection }: Props) {
  const [filter, setFilter] = useState<SearchTokenV2Params>({
    chainId: collection.chainId,
    collections: [collection.erc721Address],
  })
  const [search, setSearch] = useState('')
  const debounedSearch = useDebouncedValue(search, 500)
  useEffect(() => setFilter(prev => ({ ...prev, search: debounedSearch })), [debounedSearch])
  const debounedFilter = useDebouncedValue(filter, 500)

  const [page, setPage] = useState(1)

  const { data: items = [], isLoading: isLoadingNftItems } = useQuery(
    ['twelvefold', { limit: 300 }],
    fetchTwelvefoldCollection,
  )

  useEffect(() => {
    setPage(1)
  }, [items])

  const nftItems = useMemo(() => {
    return items
      .filter(i => i.Edition.includes(search))
      .filter(i => {
        const seasonFilter = chain(filter.attrFilters)
          .find({ name: 'Season' })
          .get('values')
          .map(i => i.toLowerCase())
          .value()

        if (seasonFilter.length === 0) return i
        return seasonFilter.includes(i.Season.toLowerCase())
      })
      .filter(i => {
        const seriesFilter = chain(filter.attrFilters)
          .find({ name: 'Series' })
          .get('values')
          .map(i => i.toLowerCase())
          .value()

        if (seriesFilter.length === 0) return i
        return seriesFilter.includes(i.Series.toLowerCase())
      })
      .map(twelvefoldToNftItem)
  }, [filter.attrFilters, items, search])

  const paginatedNftItems = useMemo(() => {
    return nftItems.slice(0, page * batchSize)
  }, [nftItems, page])

  const totalCount = nftItems.length

  useEffect(() => {
    setFilter({
      chainId: collection.chainId,
      collections: [collection.erc721Address],
    })
  }, [collection])

  const filterDisclosure = useDisclosure()

  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })

  function renderStats() {
    return (
      <Flex
        whiteSpace="nowrap"
        flexWrap="wrap"
        sx={{ '&>*': { mr: { [breakpoint]: '60px' }, mb: '24px', minW: { base: '50%', [breakpoint]: 'unset' } } }}
      >
        <Stack spacing={4}>
          <Text color="#fff" fontSize={{ base: '12px', [breakpoint]: '14px' }}>
            Items
          </Text>
          <Text fontSize={{ base: '16px', [breakpoint]: '20px' }} fontWeight={500} lineHeight={1.6}>
            {collection.supply?.toLocaleString() || '-'}
          </Text>
        </Stack>
      </Flex>
    )
  }

  function renderStatsWithCollapsable() {
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton display="flex" justifyContent="space-between">
            Collection Stats
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={0}>{renderStats()}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Layout>
      <Grid
        templateColumns={{ base: '1fr 1fr', [breakpoint]: 'auto 1fr 1fr' }}
        templateRows={{ base: 'repeat(4, auto)', [breakpoint]: 'auto auto 1fr auto' }}
        columnGap="30px"
        rowGap="16px"
        mt={10}
      >
        <GridItem rowSpan={{ [breakpoint]: 4 }}>
          <Image
            src={collection.logoImageUrl}
            w={{ base: '80px', [breakpoint]: '285px' }}
            overflow="hidden"
            borderRadius="8px"
          />
        </GridItem>
        <GridItem colSpan={{ base: 2, [breakpoint]: 1 }}>
          <Text fontWeight="bold" fontSize={{ base: '16px', [breakpoint]: '24px' }}>
            {collection.collectionName}
          </Text>
        </GridItem>
        <GridItem
          colStart={{ base: 2, [breakpoint]: 'auto' }}
          rowStart={{ base: 1, [breakpoint]: 'auto' }}
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          <Stack direction="row" spacing={{ base: '30px', [breakpoint]: '46px' }}>
            {collection.siteUrl && (
              <Link href={collection.siteUrl}>
                <Image w={6} h={6} src="/assets/icons/web.svg" />
              </Link>
            )}
            {collection.twitterHandle && (
              <Link href={collection.twitterHandle}>
                <Image w={6} h={6} src="/assets/icons/twitter.svg" />
              </Link>
            )}
            {collection.discord && (
              <Link href={collection.discord}>
                <Image w={6} h={6} src="/assets/icons/discord.svg" />
              </Link>
            )}
          </Stack>
        </GridItem>
        <GridItem colSpan={2}>
          {useMobileLayout ? (
            <CollapsedBox collapsedHeight={100} display={{ [breakpoint]: 'none' }} fontSize="xs">
              <Box fontSize="xs">
                <Markdown>{collection.description}</Markdown>
              </Box>
            </CollapsedBox>
          ) : (
            <Box fontSize="xs">
              <Markdown>{collection.description}</Markdown>
            </Box>
          )}
        </GridItem>
        <GridItem colSpan={2} display={{ base: 'none', [breakpoint]: 'block' }} />
        <GridItem colSpan={2}>{useMobileLayout ? renderStatsWithCollapsable() : renderStats()}</GridItem>
      </Grid>
      <Grid
        templateColumns={{ base: '100%', [breakpoint]: '288px 1fr' }}
        templateRows={{ base: 'auto auto auto 1fr', [breakpoint]: 'auto auto 1fr' }}
        columnGap={6}
        rowGap={5}
        pt={5}
      >
        {/* filter */}
        {!useMobileLayout && (
          <GridItem rowSpan={3}>
            {useMobileLayout ? (
              <>{/* <RedirectToCollection /> */}</>
            ) : (
              <TokenFilters
                collection={collection}
                value={filter}
                onValueChange={setFilter}
                components={{ SelectCollection: RedirectToCollection }}
                useSignalCollectionSelector
                collectionWhitelist={defaultCollectionWhitelist}
                hideCollectionInfo
                hideFilters={['status', 'priceGTE']}
                pos="sticky"
                top="112px"
              />
            )}
          </GridItem>
        )}
        {/* search bar & result count & sortor */}
        <GridItem>
          <Stack spacing={8} direction="row">
            <Box flexGrow={1}>
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon color="#898989" />
                </InputLeftElement>
                <Input placeholder="Search by Name" value={filter.search} onChange={e => setSearch(e.target.value)} />
              </InputGroup>
            </Box>
            <Box display={{ base: 'none', [breakpoint]: 'block' }} color="#898989" pt={2} whiteSpace="nowrap">
              {totalCount.toLocaleString()} Results
            </Box>
            {/*<TokenSortor display={{ base: 'none', [breakpoint]: 'block' }} value={sortBy} onValueChange={setSortBy} />*/}
          </Stack>
          <Stack display={{ [breakpoint]: 'none' }} direction="row" mt={6} justify="space-between">
            <Button variant="outline" color="primary" w="100%" h="40px" onClick={filterDisclosure.onOpen}>
              Filters
            </Button>
          </Stack>
          <Box display={{ [breakpoint]: 'none' }} color="#898989" pt={4} whiteSpace="nowrap">
            {totalCount.toLocaleString()} Results
          </Box>
        </GridItem>
        {/* applied filter */}
        <GridItem>
          <Flex direction="row" flexWrap="wrap" sx={{ '&>*:not(:last-child)': { mr: 1, mb: 1 } }}>
            <AppliedTokenFilters
              hideFilters={['chainId', 'category', 'collections', 'priceGTE']}
              collectionWhitelist={defaultCollectionWhitelist}
              value={filter}
              onValueChange={setFilter}
            />
          </Flex>
        </GridItem>
        {/* nfts */}
        <GridItem>
          <NftList
            hideActionButton
            hidePrice
            items={paginatedNftItems}
            isLoading={isLoadingNftItems}
            hasMore={page * batchSize < totalCount}
            onLoadMore={() => setPage(page + 1)}
            w="full"
            cardWidth={useBreakpointValue({ base: void 0, md: 258, '2xl': 283 })}
            // maxW="unset"
            // useFullWidth={useMobileLayout}
          />
        </GridItem>
      </Grid>
      {useMobileLayout && (
        <Modal size="2lg" onClose={filterDisclosure.onClose} isOpen={filterDisclosure.isOpen}>
          <ModalContent mt={0} h="100%">
            <ModalCloseButton color="#fff" />
            <ModalBody>
              <TokenFilters
                collection={collection}
                value={filter}
                onValueChange={setFilter}
                components={{ SelectCollection: RedirectToCollection }}
                useSignalCollectionSelector
                collectionWhitelist={defaultCollectionWhitelist}
                bg="unset"
                w="full"
                hideCollectionInfo={useMobileLayout}
                hideFilters={useMobileLayout ? ['collections', 'status', 'priceGTE'] : void 0}
              />
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Stack direction="row">
                <Button
                  variant="outline"
                  color="primary"
                  w="164px"
                  h="50px"
                  onClick={() => setFilter({ chainId: collection.chainId, collections: [collection.erc721Address] })}
                >
                  Clear All
                </Button>
                <Button variant="outline" color="primary" w="164px" h="50px" onClick={filterDisclosure.onClose}>
                  Close
                </Button>
              </Stack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  )
}

function RedirectToCollection() {
  const { asPath, push } = useRouter()
  const current = builtInCollections.find(c => asPath === `/collection/${c.alias}`)
  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })
  return (
    <>
      <SelectCollection
        value={current && { chainId: current.chainId, contractAddress: current.address }}
        onChange={v => {
          const selected = builtInCollections.find(
            c => c.chainId === v?.chainId && compareAddress(c.address, v.contractAddress),
          )
          if (selected) push(`/collection/${selected.alias}`)
        }}
        optionWhitelist={defaultCollectionWhitelist}
        hideOptionAll
      />
      {current && useMobileLayout && (
        <Box pt={2.5} pl={2.5}>
          <CollectionInfoPopover
            key={`${current.chainId}:${current.address}`}
            chainId={current.chainId}
            address={current.address}
          />
        </Box>
      )}
    </>
  )
}
