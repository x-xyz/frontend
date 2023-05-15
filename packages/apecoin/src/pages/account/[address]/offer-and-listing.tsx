import { SearchIcon } from '@chakra-ui/icons'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Box,
  Divider,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  SkeletonText,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { formatUnits } from '@ethersproject/units'
import { fetchAccountV2, fetchCollectionV2, fetchTokens } from '@x/apis/fn'
import { findToken, getChainNameForUrl } from '@x/constants/dist'
import { useDebouncedValue } from '@x/hooks'
import { Account, NftItem, OrderItem, SearchTokenV2Params, TokenStatus, TokenType, TokenV2SortOption } from '@x/models'
import { call, getFirst, isAddress } from '@x/utils'
import AccountLayout from 'components/account/AccountLayout'
import SelectCollections from 'components/input/SelectCollections.v2'
import Link from 'components/Link'
import CancelListingButton from 'components/marketplace/signature-base/CancelListingButton'
import TakeOfferButton from 'components/marketplace/signature-base/TakeOfferButton'
import Media from 'components/Media'
import TokenSortor from 'components/token/TokenSortor'
import { builtInCollections } from 'configs'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import createServerSidePropsGetter from 'utils/createServerSidePropsGetter'
import { ListingStrategy } from '@x/models/dist'
import OfferListingCard from '../../../components/account/OfferListingCard'

const contractToName: Record<string, string> = {}

builtInCollections.forEach(c => (contractToName[c.address] = c.name))

const breakpoint = 'md'

const templateColumns = '2fr repeat(6, 1fr)'

const columnGap = 6

interface Props {
  account: Account
}

export const getServerSideProps = createServerSidePropsGetter<Props>(async ctx => {
  const address = getFirst(ctx.params?.address)
  if (!address || !isAddress(address)) return { notFound: true }

  const account = await call(() => fetchAccountV2({ queryKey: ['account', address], meta: {} }))

  return { props: { account } }
})

export default function OfferAndListing({ account }: Props) {
  const [filter, setFilter] = useState<SearchTokenV2Params>({})

  const debounedFilter = useDebouncedValue(filter, 500)

  const [sortBy, setSortBy] = useState<TokenV2SortOption>(TokenV2SortOption.CreatedAtDesc)

  const useDesktopView = useBreakpointValue({ base: false, lg: true })

  const { data: tokensWithListing, isLoading: isLoadingTokensWithListing } = useQuery(
    [
      'tokens',
      {
        ...debounedFilter,
        belongsTo: account.address,
        includeOrders: true,
        status: [TokenStatus.BuyNow],
      },
    ],
    fetchTokens,
  )

  const { data: tokensWithOffer, isLoading: isLoadingTokensWithOffer } = useQuery(
    [
      'tokens',
      {
        ...debounedFilter,
        // belongsTo: account.address,
        includeOrders: true,
        status: [TokenStatus.HasOffer],
      },
    ],
    fetchTokens,
  )

  const isLoading = isLoadingTokensWithListing || isLoadingTokensWithOffer

  const tokens = useMemo(() => {
    const map: Record<string, boolean> = {}

    const allTokens: NftItem[] = []

    if (tokensWithListing?.data.items) {
      for (const item of tokensWithListing.data.items) {
        const key = `${item.chainId}:${item.contractAddress}:${item.tokenId}`
        if (map[key]) continue
        map[key] = true
        allTokens.push(item)
      }
    }

    if (tokensWithOffer?.data.items) {
      for (const item of tokensWithOffer.data.items) {
        const key = `${item.chainId}:${item.contractAddress}:${item.tokenId}`
        if (map[key]) continue
        map[key] = true
        allTokens.push(item)
      }
    }

    return allTokens
  }, [tokensWithListing, tokensWithOffer])

  return (
    <AccountLayout account={account}>
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
      </Stack>
      {useDesktopView ? (
        <>
          <Grid
            templateColumns={templateColumns}
            columnGap={columnGap}
            fontSize="xs"
            color="#898989"
            borderColor="divider"
            borderBottomWidth="1px"
            pb={2}
            px={5}
          >
            <GridItem>NFT</GridItem>
            <GridItem textAlign="right">Price</GridItem>
            <GridItem textAlign="right">USD Price</GridItem>
            <GridItem textAlign="right">Floor Difference</GridItem>
            <GridItem textAlign="right">Expiration</GridItem>
            <GridItem textAlign="right">Listed Date/From</GridItem>
            <GridItem textAlign="right">Action</GridItem>
          </Grid>
          {tokens.map(token => (
            <Row
              key={`${token.chainId}:${token.contractAddress}:${token.tokenId}`}
              nft={token}
              listings={token.listings || []}
              offers={token.offers || []}
            />
          ))}
        </>
      ) : (
        <Stack divider={<Divider borderColor="line" opacity={1} />} spacing={4}>
          {tokens.map(token => (
            <OfferListingCard
              key={`${token.chainId}:${token.contractAddress}:${token.tokenId}`}
              nft={token}
              listings={token.listings || []}
              offers={token.offers || []}
            />
          ))}
        </Stack>
      )}
    </AccountLayout>
  )
}

interface RowProps {
  nft: NftItem
  listings: OrderItem[]
  offers: OrderItem[]
}

function Row({ nft, listings, offers }: RowProps) {
  const topListing = useMemo(() => {
    if (listings.length === 0) return
    return listings.filter(listing => listing.isValid).sort((a, b) => a.priceInUsd - b.priceInUsd)[0]
  }, [listings])

  const topOffer = useMemo(() => {
    if (offers.length === 0) return
    return offers.filter(offer => offer.isValid).sort((a, b) => a.priceInUsd - b.priceInUsd)[0]
  }, [offers])

  const displayOrderItem = topListing || topOffer

  if (!displayOrderItem) return null

  return (
    <OrderItemRow
      nft={nft}
      orderItem={displayOrderItem}
      orderType={displayOrderItem === topListing ? 'listing' : 'offer'}
    >
      <GridItem colSpan={7} pt={5}>
        {offers.length > 0 && (
          <Accordion allowToggle>
            <AccordionItem bg="#1E1E1E" mx={-5}>
              <AccordionButton display="flex" justifyContent="space-between" px={5}>
                {offers.length} Offers
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={0}>
                {offers.map(offer => (
                  <OrderItemRow key={offer.orderHash} nft={nft} orderType="offer" orderItem={offer} isChild />
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </GridItem>
    </OrderItemRow>
  )
}

interface OrderItemRowProps {
  nft: NftItem
  orderType: 'listing' | 'offer'
  orderItem: OrderItem
  children?: React.ReactNode
  isChild?: boolean
}

function OrderItemRow({ nft, orderType, orderItem, children, isChild }: OrderItemRowProps) {
  const { data: collection, isLoading: isLoadingCollection } = useQuery(
    ['collection', nft.chainId, nft.contractAddress],
    fetchCollectionV2,
  )

  const nftUrl = nft && `/asset/${getChainNameForUrl(nft.chainId)}/${nft.contractAddress}/${nft.tokenId}`

  const contentType = nft.animationUrlContentType || nft.contentType

  const mimeType = nft.animationUrlMimeType

  const mediaUrl = nft.hostedAnimationUrl || nft.hostedImageUrl || nft.imageUrl

  const floorDifference = useMemo(() => {
    if (!orderItem || !collection) return 0

    return (orderItem.priceInNative - collection.openseaFloorPriceInNative) / collection.openseaFloorPriceInNative
  }, [orderItem, collection])

  function renderPrice(orderItem: OrderItem) {
    const { price, currency, chainId } = orderItem

    const paymentToken = findToken(currency, chainId)

    const type = orderType === 'listing' ? 'Listed' : 'Offer'

    return (
      <Stack>
        <Text fontSize="lg">{type}</Text>
        <Text fontSize="lg">
          {formatUnits(price, paymentToken?.decimals)} {paymentToken?.symbol}
        </Text>
      </Stack>
    )
  }

  return (
    <Grid
      pt={5}
      px={5}
      templateColumns={templateColumns}
      columnGap={columnGap}
      borderColor="#575757"
      borderTopWidth={!isChild ? '1px' : void 0}
      borderBottomWidth={!isChild ? '1px' : void 0}
      mb={6}
    >
      <GridItem>
        {!isChild && (
          <Link href={nftUrl}>
            <Stack direction="row">
              <Box>
                <AspectRatio ratio={1} w={10} h={10} overflow="hidden">
                  <Media h="full" w="full" contentType={contentType} mimetype={mimeType} src={mediaUrl} />
                </AspectRatio>
              </Box>
              <Stack spacing={0}>
                <Text fontSize="xs">{contractToName[nft.contractAddress]}</Text>
                <Text fontSize="lg">{nft.name}</Text>
              </Stack>
            </Stack>
          </Link>
        )}
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end" textAlign="right">
        {renderPrice(orderItem)}
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end">
        {orderItem.priceInUsd.toLocaleString()}
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end">
        <SkeletonText noOfLines={1} isLoaded={!isLoadingCollection} color={floorDifference < 0 ? 'danger' : 'success'}>
          {floorDifference > 0 && '+'}
          {(floorDifference * 100).toFixed(2)}%
        </SkeletonText>
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end">
        {DateTime.fromISO(orderItem.endTime).toLocaleString()}
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end">
        {DateTime.fromISO(orderItem.endTime).toRelative()}
      </GridItem>
      <GridItem display="flex" alignItems="center" justifyContent="flex-end">
        {orderType === 'listing' && (
          <CancelListingButton variant="ghost" color="primary" minW="unset" px={0} orderItem={orderItem}>
            Cancel
          </CancelListingButton>
        )}
        {orderType === 'offer' && (
          <TakeOfferButton
            collection={collection}
            nftItem={nft}
            offer={orderItem}
            isErc1155={nft.tokenType === TokenType.Erc1155}
          />
        )}
      </GridItem>
      {children}
    </Grid>
  )
}
