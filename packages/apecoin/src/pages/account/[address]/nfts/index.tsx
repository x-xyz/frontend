import AccountLayout from 'components/account/AccountLayout'
import { DateTime } from 'luxon'
import CollectionApprovalModal from 'components/account/CollectionApprovalModal'
import { fetchAccountOrderNonce, makeOrder } from '@x/apis/fn'
import SelectCollections from 'components/input/SelectCollections.v2'
import NftList from 'components/token/NftList.v2'
import TokenSortor from 'components/token/TokenSortor'
import { builtInCollections } from 'configs'
import useAuthToken from 'hooks/useAuthToken'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { parseUnits } from '@ethersproject/units'
import { keccak256 } from '@ethersproject/solidity'
import { defaultAbiCoder } from '@ethersproject/abi'
import { handleError } from '@x/web3/dist'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  Grid,
  GridItem,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spacer,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { fetchAccountV2, fetchCollections, fetchCollectionV2, fetchTokens } from '@x/apis/fn'
import { useActiveWeb3React, useDebouncedValue } from '@x/hooks'
import {
  Account,
  ChainId,
  Collection,
  NftItem,
  noopAccount,
  Order,
  SearchTokenV2Params,
  signMakerOrder,
  TokenV2SortOption,
  FeeDistType,
} from '@x/models'
import { call, compareAddress, getFirst, isAddress } from '@x/utils'
import { useRouter } from 'next/router'
import Media from 'components/Media'
import { PendingListing } from 'components/marketplace/signature-base/BulkListingButton'
import { addresses, findToken, getChain } from '@x/constants/dist'
import SelectToken from 'components/input/SelectToken'
import DatePicker from 'components/DatePicker'
import UsdPrice from 'components/UsdPrice'
import useToast from 'hooks/useToast'
import SelectFeeDistType from 'components/input/SelectFeeDistType'

const breakpoint = 'md'

interface Props {
  account: Account
  collections: Collection[]
  collection: Collection | null
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }

  const collectionName = getFirst(ctx.params?.collectionName)
  const collectionData = collectionName ? builtInCollections.find(c => c.alias === collectionName) : void 0

  const [account, { items: collections }, collection = null] = await Promise.all([
    call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }), { maxAttempt: 5, timeout: 500 }).catch(
      () => ({ ...noopAccount, address }),
    ),
    call(
      () =>
        fetchCollections({
          queryKey: ['collections', { holder: address, chainId: ChainId.Ethereum, limit: 5000 }],
          meta: {},
        }),
      {
        maxAttempt: 5,
        timeout: 500,
      },
    ),
    collectionData &&
      call(
        () => fetchCollectionV2({ queryKey: ['collection', collectionData.chainId, collectionData.address], meta: {} }),
        { maxAttempt: 5, timeout: 500 },
      ),
  ])

  return { props: { account, collections, collection } }
})

const batchSize = 10

export default function Nfts({ account, collections, collection }: Props) {
  const { account: viewer } = useActiveWeb3React()

  const [authToken] = useAuthToken(viewer ?? void 0)

  const [filter, setFilter] = useState<SearchTokenV2Params>({
    chainId: collection?.chainId,
    collections: collection ? [collection.erc721Address] : void 0,
  })

  const debounedFilter = useDebouncedValue(filter, 500)

  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.CreatedAtDesc)

  const {
    data: tokenPagings,
    isLoading: isLoadingNftItems,
    isFetching: isFetchingNftItems,
    hasNextPage: hasMoreNftItems,
    fetchNextPage: fetchMoreNftItems,
  } = useInfiniteQuery(
    [
      'tokens',
      {
        ...debounedFilter,
        sortBy,
        authToken,
        limit: batchSize,
        belongsTo: account.address,
        chainId: debounedFilter.chainId || ChainId.Ethereum,
        // query only built in collections if no specific collection
        collections: debounedFilter.collections?.length
          ? debounedFilter.collections
          : builtInCollections.map(c => c.address),
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

  const nftItems = useMemo(() => {
    const ids = new Map<string, boolean>()
    const result: NftItem[] = []
    tokenPagings?.pages.forEach(page => {
      page.data.items?.forEach(item => {
        const key = [item.chainId, item.contractAddress, item.tokenId].join(':')
        if (ids.has(key)) return
        ids.set(key, true)
        result.push(item)
      })
    })
    return result
  }, [tokenPagings])

  useEffect(() => {
    setFilter({
      chainId: collection?.chainId,
      collections: collection ? [collection.erc721Address] : void 0,
    })
  }, [collection])

  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })

  const [selectedItems, setSelectedItems] = useState<NftItem[]>([])

  const onSelectItem = useCallback((item: NftItem) => {
    setSelectedItems(prev => {
      const index = prev.indexOf(item)
      if (index >= 0) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)]
      } else {
        return [...prev, item]
      }
    })
  }, [])

  const collectionApprovalModal = useDisclosure()

  const bulkListingDrawer = useDisclosure()

  // clear selected items after close drawer
  useEffect(() => {
    if (!bulkListingDrawer.isOpen) setSelectedItems([])
  }, [bulkListingDrawer.isOpen])

  useEffect(() => {
    if (bulkListingDrawer.isOpen) collectionApprovalModal.onClose()
  }, [bulkListingDrawer.isOpen, collectionApprovalModal])

  const collectionsForApprovalProcess = useMemo(() => {
    const map: Record<string, Collection> = {}
    for (const collection of collections) map[collection.erc721Address] = collection
    const addresses = selectedItems.reduce((acc, i) => acc.add(i.contractAddress), new Set<string>())
    return [...addresses].map(address => map[address])
  }, [collections, selectedItems])

  const isOwner = compareAddress(account.address, viewer)

  const canBulkList = collectionsForApprovalProcess.length > 0 && isOwner

  const { push } = useRouter()

  const onAllApproved = useCallback(() => {
    sessionStorage.setItem('account-bulk-listing', JSON.stringify(selectedItems))
    push('/account/bulk-listing')
  }, [selectedItems, push])

  return (
    <AccountLayout
      account={account}
      actions={
        canBulkList &&
        !useMobileLayout && (
          <Button onClick={collectionApprovalModal.onOpen}>
            {selectedItems.length} NFT{selectedItems.length > 1 ? 's' : ''} to List
          </Button>
        )
      }
    >
      <Stack direction={{ base: 'column', [breakpoint]: 'row' }} mb="24px" spacing="12px">
        <InputGroup>
          <InputLeftElement>
            <SearchIcon color="#898989" />
          </InputLeftElement>
          <Input
            bg="#000"
            placeholder="Search by Name"
            value={filter.search}
            onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
          />
        </InputGroup>
        <SelectCollections
          value={filter.collections}
          onValueChange={collections => setFilter(prev => ({ ...prev, collections }))}
        />
        <TokenSortor minW="300px" value={sortBy} onValueChange={setSortBy} />
        <Spacer />
      </Stack>
      <NftList
        items={nftItems}
        isLoading={isLoadingNftItems || isFetchingNftItems}
        hasMore={hasMoreNftItems}
        onLoadMore={fetchMoreNftItems}
        w="full"
        cardWidth={useMobileLayout ? void 0 : 284}
        cardHeight={useMobileLayout ? void 0 : 398}
        // hideActionButton={!useMobileLayout}
        itemActionLabel={
          isOwner ? item => (selectedItems.includes(item) ? (useMobileLayout ? 'Selected' : 'Unlist') : 'List') : void 0
        }
        selectedItems={isOwner ? selectedItems : void 0}
        onSelectItem={isOwner ? onSelectItem : void 0}
        hidePrice
        hideActionButtonIfListed
      />
      {canBulkList && (
        <CollectionApprovalModal
          onClose={collectionApprovalModal.onClose}
          isOpen={collectionApprovalModal.isOpen}
          collections={collectionsForApprovalProcess}
          owner={account.address}
          onAllApproved={useMobileLayout ? bulkListingDrawer.onOpen : onAllApproved}
        />
      )}
      {useMobileLayout && canBulkList && (
        <Center
          pos="fixed"
          bottom={0}
          left={0}
          w="100vw"
          p={4}
          bg="#1E1E1E"
          borderTopColor="#575757"
          borderTopWidth="1px"
        >
          <Button w="full" onClick={collectionApprovalModal.onOpen}>
            {selectedItems.length} NFT to List
          </Button>
        </Center>
      )}
      {useMobileLayout && canBulkList && (
        <BulkListingDrawer
          onClose={bulkListingDrawer.onClose}
          isOpen={bulkListingDrawer.isOpen}
          selectedItems={selectedItems}
          collections={collectionsForApprovalProcess}
        />
      )}
    </AccountLayout>
  )
}

function BulkListingDrawer({
  selectedItems,
  collections,
  ...props
}: Omit<DrawerProps, 'children'> & { selectedItems: NftItem[]; collections: Collection[] }) {
  const { account, chainId, library } = useActiveWeb3React()

  const [authToken] = useAuthToken()

  const toast = useToast()

  const [isConfirmingListings, setConfirmingListings] = useState(false)

  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextIndex = useCallback(
    () => setCurrentIndex(prev => Math.min(prev + 1, pendingListings.length)),
    [pendingListings],
  )

  const prevIndex = useCallback(() => setCurrentIndex(prev => Math.max(prev - 1, 0)), [])

  const hasNext = useMemo(() => currentIndex < pendingListings.length, [currentIndex, pendingListings])

  const hasPrev = useMemo(() => currentIndex > 0, [currentIndex])

  useEffect(() => {
    setCurrentIndex(0)
    setPendingListings(
      selectedItems.map(token => ({
        token,
        price: '0',
        paymentToken: getChain(token.chainId).nativeCurrency.address,
        quatity: '1',
      })),
    )
  }, [selectedItems])

  const currentItem = useMemo(() => pendingListings[currentIndex], [pendingListings, currentIndex])

  const currentCollection = useMemo(
    () =>
      currentItem &&
      collections.find(
        c =>
          c.chainId === currentItem.token.chainId && compareAddress(c.erc721Address, currentItem.token.contractAddress),
      ),
    [currentItem, collections],
  )

  const [endTime, setEndTime] = useState(new Date())

  const [isReviewing, setReviewing] = useState(false)

  const { onClose, isOpen } = props

  useEffect(() => {
    if (pendingListings.length === 0) onClose()
  }, [pendingListings, onClose])

  useEffect(() => {
    // reset index
    if (isOpen) {
      setCurrentIndex(0)
      setReviewing(false)
    }
  }, [isOpen])

  const totalAmount = useMemo(
    () => pendingListings.reduce((acc, pl) => acc + parseFloat(pl.price), 0),
    [pendingListings],
  )

  const totalFees = useMemo(
    () =>
      pendingListings.reduce((acc, pl) => {
        const col: Collection | undefined = collections.find(c =>
          compareAddress(c.erc721Address, pl.token.contractAddress),
        )
        const creatorFee = col ? calculateCreatorFee(pl, col) : 0
        return acc + calculateMarketplaceFee(pl) + creatorFee
      }, 0),
    [pendingListings, collections],
  )

  const sellPaymentToken = useMemo(() => {
    if (pendingListings.length === 0) return
    return (
      findToken(pendingListings[0].paymentToken, pendingListings[0].token.chainId) ||
      getChain(pendingListings[0].token.chainId).nativeCurrency
    )
  }, [pendingListings])

  const [feeDistType, setFeeDistType] = useState(FeeDistType.Burn)

  function calculateMarketplaceFee({ price, paymentToken, token }: PendingListing) {
    const apeToken = findToken('APE', token.chainId)
    const percentage = compareAddress(paymentToken, apeToken?.address) ? 0.0025 : 0.005
    return parseFloat(price) * percentage
  }

  function calculateCreatorFee({ price }: PendingListing, { royalty }: Collection) {
    const percentage = royalty * 0.01
    return parseFloat(price) * percentage
  }

  function renderNftList() {
    return (
      <Grid templateColumns="1fr 1fr" rowGap={4} columnGap={4}>
        <GridItem colSpan={2}>
          <Stack direction="row">
            <Media
              contentType={currentItem.token.animationUrlContentType || currentItem.token.contentType}
              mimetype={currentItem.token.animationUrlMimeType}
              src={
                currentItem.token.hostedAnimationUrl || currentItem.token.hostedImageUrl || currentItem.token.imageUrl
              }
              w={15}
              h={15}
            />
            <Stack>
              <Text overflow="hidden" textOverflow="ellipsis" fontSize="xs">
                {currentItem.token.name}
              </Text>
            </Stack>
          </Stack>
        </GridItem>
        <GridItem>
          <Text fontSize="xs" color="#898989">
            Last Price
          </Text>
          <Text fontSize="sm">
            {currentItem.token.lastSalePrice.toLocaleString()}{' '}
            {findToken(currentItem.token.lastSalePricePaymentToken, currentItem.token.chainId)?.symbol}
          </Text>
          <UsdPrice
            chainId={currentItem.token.chainId}
            tokenId={currentItem.token.lastSalePricePaymentToken}
            fontSize="sm"
            color="#898989"
            prefix="$"
          >
            {currentItem.token.lastSalePrice}
          </UsdPrice>
        </GridItem>
        <GridItem>
          <Text fontSize="xs" color="#898989">
            Floor Price
          </Text>
          <Text fontSize="sm">{currentCollection?.openseaFloorPriceInNative.toLocaleString()} ETH</Text>
          <UsdPrice
            chainId={currentItem.token.chainId}
            tokenId={getChain(currentItem.token.chainId).nativeCurrency.address}
            fontSize="sm"
            color="#898989"
            prefix="$"
          >
            {currentCollection?.openseaFloorPriceInNative || 0}
          </UsdPrice>
        </GridItem>
        <GridItem colSpan={2}>
          <Text fontSize="xs" color="#898989" mb={1}>
            List Price
          </Text>
          <InputGroup>
            <Input
              value={currentItem.price}
              onChange={e =>
                setPendingListings(prev => {
                  const next = [...prev]
                  next[currentIndex].price = e.target.value
                  return next
                })
              }
            />
            <InputRightElement w="80px">
              <SelectToken
                chainId={currentItem.token.chainId}
                value={currentItem.paymentToken}
                onChange={v => setPendingListings(prev => prev.map(pl => ({ ...pl, paymentToken: v })))}
              />
            </InputRightElement>
          </InputGroup>
        </GridItem>
        <GridItem>
          <Text fontSize="xs" color="#898989">
            Marketplace Fee
          </Text>
          <Text fontSize="sm">
            {calculateMarketplaceFee(currentItem)}{' '}
            {sellPaymentToken && findToken(sellPaymentToken?.address, currentItem.token.chainId)?.symbol}
          </Text>
          <UsdPrice
            chainId={currentItem.token.chainId}
            tokenId={sellPaymentToken?.address}
            fontSize="sm"
            color="#898989"
            prefix="$"
          >
            {calculateMarketplaceFee(currentItem)}
          </UsdPrice>
        </GridItem>
        <GridItem>
          <Text fontSize="xs" color="#898989">
            Creator Fee
          </Text>
          <Text fontSize="sm">
            {currentCollection && calculateCreatorFee(currentItem, currentCollection)}{' '}
            {sellPaymentToken && findToken(sellPaymentToken?.address, currentItem.token.chainId)?.symbol}
          </Text>
          <UsdPrice
            chainId={currentItem.token.chainId}
            tokenId={sellPaymentToken?.address}
            fontSize="sm"
            color="#898989"
            prefix="$"
          >
            {currentCollection ? calculateCreatorFee(currentItem, currentCollection) : 0}
          </UsdPrice>
        </GridItem>
        {hasPrev && (
          <GridItem pt={4}>
            <Button variant="outline" w="full" onClick={prevIndex}>
              Back
            </Button>
          </GridItem>
        )}
        <GridItem colSpan={hasPrev ? 1 : 2} pt={4}>
          <Button w="full" onClick={nextIndex}>
            Next
          </Button>
        </GridItem>
      </Grid>
    )
  }

  function renderDatepicker() {
    return (
      <Stack>
        <Text fontSize="xs" color="#898989">
          Duration
        </Text>
        <DatePicker
          dateFormat="yyyy/MM/dd h:mm aa"
          showTimeSelect
          w="full"
          h={10}
          onChange={v => v instanceof Date && setEndTime(v)}
          selected={endTime}
        />
        <Box h={2} />
        <Text size="xs" color="#898989">
          What should X do with your marketplace fee?
          <Tooltip label="We will burn or donate 100% of the marketplace fee for $APE listings and 50% of the fee for any other listings.">
            <Image display="inline-block" src="/assets/ic/info.png" />
          </Tooltip>
        </Text>
        <SelectFeeDistType value={feeDistType} onChange={setFeeDistType} />
        <Box h={4} />
        <Button onClick={() => setReviewing(true)}>Review Listing</Button>
      </Stack>
    )
  }

  function renderReview() {
    return (
      <Grid templateRows="1fr auto" h="90vh">
        <GridItem overflowY="auto">
          <Stack divider={<Divider />}>
            {pendingListings.map(pl => (
              <ReviewItem key={`${pl.token.contractAddress}:${pl.token.tokenId}`} {...pl} endTime={endTime} />
            ))}
          </Stack>
        </GridItem>
        <GridItem>
          <Stack fontSize="sm" justify="flex-end" bg="#1E1E1E" m="-16px" p="16px">
            <Stack align="flex-end">
              <Text>
                <Text as="span" mr={4}>
                  Total
                </Text>
                {totalAmount.toLocaleString()} {sellPaymentToken?.symbol}
              </Text>
              <UsdPrice chainId={chainId} tokenId={sellPaymentToken?.address} color="#898989" prefix="$">
                {totalAmount}
              </UsdPrice>
            </Stack>
            <Stack align="flex-end">
              <Text>
                <Text as="span" mr={4}>
                  - Fees
                </Text>
                {totalFees.toLocaleString()} {sellPaymentToken?.symbol}
              </Text>
              <UsdPrice chainId={chainId} tokenId={sellPaymentToken?.address} color="#898989" prefix="$">
                {totalFees}
              </UsdPrice>
            </Stack>
            <Stack align="flex-end">
              <Text>
                <Text as="span" mr={4}>
                  = Earning
                </Text>
                {(totalAmount - totalFees).toLocaleString()} {sellPaymentToken?.symbol}
              </Text>
              <UsdPrice chainId={chainId} tokenId={sellPaymentToken?.address} color="#898989" prefix="$">
                {totalAmount - totalFees}
              </UsdPrice>
            </Stack>
            <Box h={4} />
            <Button onClick={confirmListings} isLoading={isConfirmingListings} disabled={isConfirmingListings}>
              Complete Listing
            </Button>
          </Stack>
        </GridItem>
      </Grid>
    )
  }

  async function confirmListings() {
    setConfirmingListings(true)

    try {
      if (!account) throw new Error('cannot get account')
      if (!chainId) throw new Error('cannot get chainId')
      if (!library) throw new Error('cannot get library')
      if (!sellPaymentToken) throw new Error('cannot get payment token')
      const { nonce } = await fetchAccountOrderNonce(account, chainId, authToken)
      const order: Order = {
        chainId,
        isAsk: true,
        signer: account,
        items: pendingListings.map(listing => ({
          collection: listing.token.contractAddress,
          tokenId: listing.token.tokenId,
          amount: listing.quantity || '1',
          price: parseUnits(listing.price, sellPaymentToken.decimals).toString(),
        })),
        strategy: addresses.strategyFixedPrice[chainId as ChainId],
        currency: sellPaymentToken.address,
        nonce,
        startTime: DateTime.now().startOf('second').toSeconds().toString(),
        endTime: DateTime.fromJSDate(endTime).startOf('second').toSeconds().toString(),
        minPercentageToAsk: '0',
        marketplace: keccak256(['string'], ['apecoin']),
        params: defaultAbiCoder.encode([], []),
        feeDistType,
      }
      const signedOrder = await signMakerOrder(
        library.getSigner(),
        chainId,
        addresses.exchange[chainId as ChainId],
        order,
      )
      await makeOrder(signedOrder)
    } catch (err) {
      handleError(err, { toast })
    } finally {
      setConfirmingListings(false)
      onClose()
    }
  }

  return (
    <Drawer placement="bottom" {...props}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader bg={isReviewing ? '#000000' : void 0}>
          <Text textAlign="center">{selectedItems.length} NFT to List</Text>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody bg={isReviewing ? '#000000' : void 0}>
          {isReviewing ? renderReview() : currentItem ? renderNftList() : renderDatepicker()}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

function ReviewItem({ token, price, paymentToken, endTime }: PendingListing & { endTime: Date }) {
  return (
    <Grid templateColumns="1fr 1fr" rowGap={8}>
      <GridItem colSpan={2}>
        <Stack direction="row">
          <Media
            contentType={token.animationUrlContentType || token.contentType}
            mimetype={token.animationUrlMimeType}
            src={token.hostedAnimationUrl || token.hostedImageUrl || token.imageUrl}
            w={15}
            h={15}
          />
          <Stack>
            <Text overflow="hidden" textOverflow="ellipsis" fontSize="xs">
              {token.name}
            </Text>
          </Stack>
        </Stack>
      </GridItem>
      <GridItem>
        <Text fontSize="xs" color="#898989">
          List Price
        </Text>
        <Text fontSize="sm">
          {parseFloat(price).toLocaleString()} {findToken(paymentToken, token.chainId)?.symbol}
        </Text>
        <UsdPrice chainId={token.chainId} tokenId={paymentToken} fontSize="sm" color="#898989" prefix="$">
          {parseFloat(price)}
        </UsdPrice>
      </GridItem>
      <GridItem>
        <Text fontSize="xs" color="#898989">
          Duration
        </Text>
        <Text fontSize="sm">
          {DateTime.fromJSDate(endTime).toLocaleString({ dateStyle: 'short', timeStyle: 'short' })}
        </Text>
      </GridItem>
    </Grid>
  )
}
