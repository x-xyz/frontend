import { InputLeftElement } from '@chakra-ui/input'
import { Divider } from '@chakra-ui/layout'
import { addresses, getChainNameForUrl } from '@x/constants/dist'
import { useErc721ApprovalForAll } from '@x/hooks/dist'
import { TokenType } from '@x/models/dist'
import RefreshIcon from 'components/icons/RefreshIcon'
import Media from 'components/Media'
import Link from 'components/Link'
import { DateTime } from 'luxon'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'

import {
  AspectRatio,
  Badge,
  Box,
  Button,
  ButtonProps,
  Center,
  Checkbox,
  Grid,
  GridItem,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  SkeletonText,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import * as apis from '@x/apis/fn'
import { findToken, getChain } from '@x/constants'
import { useAuthToken } from '@x/hooks'
import { ChainId, Collection, ExternalListing, NftItem, TokenV2SortOption } from '@x/models'
import { compareAddress } from '@x/utils'
import BulkListingButton, { PendingListing } from 'components/marketplace/v3/BulkListingButton'
import Dropdown from 'components/v3/Dropdown'
import { TriangleDownIcon } from '@chakra-ui/icons'

const maxSelectCount = 20
const templateColumns = `auto 1fr`
const subTemplateColumns = 'minmax(0, 2.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)'
const columnGap = 5

export interface TokenListProps {
  account: string
  collection: Collection
}

export default function TokenList({ account, collection }: TokenListProps) {
  const [searchName, setSearchName] = useState<string>('')
  const [authToken] = useAuthToken()
  const { data, isLoading } = useQuery(
    [
      'tokens',
      {
        authToken,
        name: searchName ? searchName : void 0,
        chainId: collection.chainId,
        collections: [collection.erc721Address],
        belongsTo: account,
        sortBy: TokenV2SortOption.CreatedAtDesc,
        includeOrders: true,
      },
    ],
    apis.fetchTokens,
  )
  const tokens = useMemo(() => data?.data.items || [], [data])
  const count = data?.data.count || 0

  const {
    data: externalListings,
    isLoading: isLoadingExternalListings,
    isFetching: isFetchingExternalListings,
    refetch,
  } = useQuery(['external-listings', account], apis.fetchExternalListings)

  const { mutateAsync: refreshExternalListings, isLoading: isRefreshingExternalListings } = useMutation(
    apis.refreshExternalListings,
    {
      onSuccess: () => {
        refetch()
      },
    },
  )

  const [selectedTokens, setSelectedTokens] = useState<NftItem[]>([])
  const isAllSelected = selectedTokens.length >= Math.min(maxSelectCount, tokens.length)
  const isIndeterminateSelected = !isAllSelected && selectedTokens.length > 0

  const addressMap =
    collection.tokenType === TokenType.Erc721 ? addresses.transferManagerErc721 : addresses.transferManagerErc1155
  const spender = addressMap[collection.chainId]
  const [approved, isApproving] = useErc721ApprovalForAll(
    collection.chainId,
    collection.erc721Address,
    account,
    spender,
  )

  // reset selected tokens if tokens refreshed
  useEffect(() => {
    setSelectedTokens([])
  }, [tokens])

  const onSelectToken = useCallback((token: NftItem, selected: boolean) => {
    if (selected) setSelectedTokens(prev => [...prev, token])
    else setSelectedTokens(prev => prev.filter(t => t !== token))
  }, [])

  function selectAllTokens() {
    setSelectedTokens(prev => {
      const next = [...prev]
      let remainedSeatCount = 20 - prev.length
      const candidates = [...tokens]
      while (candidates.length > 0 && remainedSeatCount > 0) {
        const candidate = candidates.shift()
        if (!candidate) break
        if (candidate.activeListing) continue
        if (prev.includes(candidate)) continue
        next.push(candidate)
        --remainedSeatCount
      }
      return next
    })
  }

  // token id -> price
  const [pricies, setPricies] = useState<Record<string, string>>({})
  const [paymentToken, setPaymentToken] = useState<string>(getChain(collection.chainId).nativeCurrency.address)
  const pendingListings = useMemo(
    () =>
      selectedTokens.map<PendingListing>(token => ({
        token,
        price: pricies[token.tokenId] || '0',
        paymentToken,
      })),
    [selectedTokens, pricies, paymentToken],
  )

  // reset payment token to native token
  useEffect(() => {
    setPricies({})
    setPaymentToken(getChain(collection.chainId).nativeCurrency.address)
  }, [collection])

  function applyOpenSeaFloorPrice() {
    setPricies(
      selectedTokens.reduce((acc, token) => {
        return {
          ...acc,
          [token.tokenId]: String(collection.openseaFloorPriceInNative),
        }
      }, {}),
    )
  }

  function applyOpenSeaListedPrice() {
    setPricies(() =>
      selectedTokens.reduce((acc, token) => {
        const listing = externalListings?.find(matchedListing(token, 'opensea'))

        if (!listing) return acc
        return { ...acc, [listing.tokenId]: String(listing.price) }
      }, {} as Record<string, string>),
    )
  }

  const externalListingsUpdatedAt = useMemo(() => {
    if (!externalListings || externalListings.length === 0) {
      return 0
    }
    return DateTime.fromISO(externalListings[0].updatedTime).toMillis()
  }, [externalListings])

  return (
    <Stack spacing={5}>
      <Grid templateColumns="1fr 280px" rowGap={4} columnGap={2}>
        <GridItem>
          <Stack justifyContent="space-between" h="full">
            <Text fontWeight="bold">NFT Listing</Text>
            <Divider h={0.5} />
          </Stack>
        </GridItem>
        <GridItem>
          <Stack direction="row" h="full" spacing={3}>
            <RefreshPriceButton
              isLoading={isRefreshingExternalListings}
              onClick={() => refreshExternalListings(account)}
              height="fit-content"
            />
            <Stack flexGrow={1}>
              <Text fontSize="0.625rem">Last Updated</Text>
              <Text fontSize="sm" fontWeight="bold">
                {externalListingsUpdatedAt === 0
                  ? '-'
                  : DateTime.fromMillis(externalListingsUpdatedAt).toLocaleString({
                      timeStyle: 'short',
                      dateStyle: 'short',
                    })}
              </Text>
            </Stack>
            <Divider orientation="vertical" />
            <Stack>
              <Text fontSize="0.625rem">Search Results</Text>
              <SkeletonText mr={1} noOfLines={1} isLoaded={!isLoading} fontSize="sm" fontWeight="bold">
                {count}
              </SkeletonText>
            </Stack>
          </Stack>
        </GridItem>
        <GridItem>
          <Stack direction="row" align="center" spacing={5}>
            <Checkbox
              flexShrink={0}
              fontWeight="bold"
              isIndeterminate={isIndeterminateSelected}
              isChecked={isAllSelected}
              onChange={e => {
                if (e.target.checked) selectAllTokens()
                else setSelectedTokens([])
              }}
            >
              Select All
            </Checkbox>
            <Dropdown.List
              title="Apply to Selected"
              triggerElem={
                <Button flexShrink={0}>
                  Apply to Selected
                  <TriangleDownIcon w={2} ml={2} />
                </Button>
              }
              noPadding
              closeOnBlur={true}
            >
              {({ onClose }) => (
                <>
                  <Dropdown.Item p={3} borderBottom="1px solid" borderColor="divider">
                    <Stack direction="row" w="full" justify="space-between" align="center">
                      <Text>Use OpenSea Listed Price</Text>
                      <Button
                        minW="unset"
                        onClick={() => {
                          applyOpenSeaListedPrice()
                          onClose()
                        }}
                      >
                        Apply
                      </Button>
                    </Stack>
                  </Dropdown.Item>
                  <Dropdown.Item p={3} borderBottom="1px solid" borderColor="divider">
                    <Stack direction="row" w="full" justify="space-between" align="center">
                      <Text>Use OpenSea Floor Price</Text>
                      <Button
                        minW="unset"
                        onClick={() => {
                          applyOpenSeaFloorPrice()
                          onClose()
                        }}
                      >
                        Apply
                      </Button>
                    </Stack>
                  </Dropdown.Item>
                  <Dropdown.Item p={3} overflowX="hidden">
                    <BulkUpdateSale
                      chainId={collection.chainId}
                      onApply={(price, paymentToken) => {
                        setPricies(
                          selectedTokens.reduce(
                            (acc, token) => ({ ...acc, [token.tokenId]: price }),
                            {} as Record<string, string>,
                          ),
                        )
                        setPaymentToken(paymentToken)
                        onClose()
                      }}
                    />
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.List>
            <BulkListingButton collection={collection} pendingListings={pendingListings}>
              List Now!
            </BulkListingButton>
          </Stack>
        </GridItem>
        <GridItem>
          <InputGroup>
            <InputLeftElement>
              <FiSearch color="#A2A6B8" />
            </InputLeftElement>
            <Input
              bg="reaction"
              placeholder="Search NFT"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </InputGroup>
        </GridItem>
      </Grid>
      <Spacer h={0} />
      <Stack spacing={4}>
        <Grid templateColumns={templateColumns} columnGap={columnGap} fontSize="xs" fontWeight="bold" color="note">
          <GridItem w={4} />
          <GridItem px={2}>
            <Grid templateColumns={subTemplateColumns} columnGap={columnGap}>
              <GridItem>NFT</GridItem>
              <GridItem>Floor Price</GridItem>
              <GridItem>Listed Price</GridItem>
              <GridItem>Price / Currency</GridItem>
            </Grid>
          </GridItem>
        </Grid>
        <Stack flexGrow={1} spacing={1}>
          {tokens.map(token => (
            <Box position="relative" key={`${token.chainId}:${token.contractAddress}:${token.tokenId}`}>
              {!approved && (
                <Box
                  position="absolute"
                  top={0}
                  bottom={0}
                  left={0}
                  right={0}
                  zIndex={999}
                  backgroundColor="background"
                  opacity={0.8}
                />
              )}
              <MemoTokenItem
                token={token}
                collection={collection}
                externalListings={externalListings}
                isLoadingExternalListings={isLoadingExternalListings || isFetchingExternalListings}
                isSelected={selectedTokens.includes(token)}
                onSelect={onSelectToken}
                exceedMaxSelection={selectedTokens.length === maxSelectCount}
                paymentToken={paymentToken}
                onPaymentTokenChange={setPaymentToken}
                price={pricies[token.tokenId]}
                onPriceChange={price => setPricies(prev => ({ ...prev, [token.tokenId]: price }))}
              />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

function RefreshPriceButton({ ...props }: ButtonProps) {
  return (
    <IconButton
      variant="icon"
      icon={<RefreshIcon w={10} h={10} />}
      aria-label="refresh price"
      border="1px solid"
      borderColor="divider"
      {...props}
    />
  )
}

interface TokenItemProps {
  token: NftItem
  collection: Collection
  externalListings?: ExternalListing[]
  isLoadingExternalListings?: boolean
  isSelected?: boolean
  onSelect?: (token: NftItem, selected: boolean) => void
  exceedMaxSelection?: boolean
  paymentToken?: string
  onPaymentTokenChange?: (paymentToken: string) => void
  price?: string
  onPriceChange?: (price: string) => void
}

function TokenItem({
  token,
  collection,
  externalListings,
  isLoadingExternalListings,
  isSelected,
  onSelect,
  exceedMaxSelection,
  paymentToken = getChain(token.chainId).nativeCurrency.address,
  onPaymentTokenChange,
  price = '',
  onPriceChange,
}: TokenItemProps) {
  const externalListing = useMemo(
    () => externalListings?.find(matchedListing(token, 'opensea')),
    [externalListings, token],
  )

  const activeListing = useMemo(() => {
    if (token.activeListing) return token.activeListing
    return token.listings?.[0]
  }, [token])

  const nftUrl = `/asset/${getChainNameForUrl(token.chainId)}/${token.contractAddress}/${token.tokenId}`

  return (
    <Grid templateColumns={templateColumns} columnGap={columnGap}>
      <GridItem as={Center}>
        <Checkbox
          isChecked={isSelected}
          onChange={e => onSelect?.(token, e.target.checked)}
          isDisabled={(!isSelected && exceedMaxSelection) || !!activeListing}
        />
      </GridItem>
      <GridItem bgColor="black" p={2} borderRadius="6px">
        <Grid templateColumns={subTemplateColumns} columnGap={columnGap} alignItems="center">
          <GridItem minW={0}>
            <Stack direction="row">
              <AspectRatio ratio={1} w="50px" h="50px" flexShrink={0}>
                <Media
                  contentType={token.animationUrlContentType || token.contentType}
                  mimetype={token.animationUrlMimeType}
                  src={token.animationUrl || token.imageUrl}
                />
              </AspectRatio>
              <Stack fontWeight="bold" spacing={0} minW={0} justifyContent="space-between">
                <Link href={nftUrl}>
                  <Text fontSize="ms">{token.name}</Text>
                </Link>
                <Link
                  href={`/collection/${getChainNameForUrl(collection?.chainId)}/${collection?.erc721Address}`}
                  minW={0}
                >
                  <Text fontSize="xs" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                    {collection.collectionName}
                  </Text>
                </Link>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem>
            <Stack fontSize="sm">
              <Stack direction="row" align="center">
                <Image src="/assets/opensea.png" w={5} h={5} />
                <Text whiteSpace="nowrap">{collection.openseaFloorPriceInNative.toFixed(2)} ETH</Text>
              </Stack>
              <Stack direction="row" align="center">
                <Image src="/assets/logo.png" w={5} h={5} borderRadius="10px" />
                <Text whiteSpace="nowrap">{collection.floorPrice.toFixed(2)} ETH</Text>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem>
            <Stack fontSize="sm">
              <Stack direction="row" align="center">
                <Image src="/assets/opensea.png" w={5} h={5} />
                <SkeletonText isLoaded={!isLoadingExternalListings} noOfLines={1} whiteSpace="nowrap">
                  {(externalListing && Number(externalListing.price).toFixed(2)) || '-'}{' '}
                  {externalListing && findToken(externalListing.paymentToken, token.chainId)?.symbol}
                </SkeletonText>
              </Stack>
              <Stack direction="row" align="center">
                <Image src="/assets/logo.png" w={5} h={5} borderRadius="10px" />
                <Text whiteSpace="nowrap">
                  {(activeListing && Number(activeListing.displayPrice).toFixed(2)) || '-'}{' '}
                  {activeListing && findToken(activeListing.currency, token.chainId)?.symbol}
                </Text>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem>
            <InputGroup>
              <Input
                type="number"
                placeholder="Price"
                borderRadius="6px"
                value={price}
                onChange={e => onPriceChange?.(e.target.value)}
                pr={15}
              />
              <InputRightElement
                zIndex="unset" // to prevent overlap on select token menu
                w="fit-content"
                pr={4}
              >
                <Text color="currentcolor" fontWeight="bold">
                  ETH
                </Text>
              </InputRightElement>
            </InputGroup>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  )
}

const MemoTokenItem = memo(TokenItem)

const matchedListing =
  (token: NftItem, source = 'opensea') =>
  (listing: ExternalListing) =>
    token.chainId === listing.chainId &&
    compareAddress(token.contractAddress, listing.contractAddress) &&
    token.tokenId === listing.tokenId &&
    listing.source === source

interface BulkUpdateSaleProps {
  chainId: ChainId
  onApply: (price: string, paymentToken: string) => void
}

function BulkUpdateSale({ chainId, onApply }: BulkUpdateSaleProps) {
  const [price, setPrice] = useState('')
  const [paymentToken, setPaymentToken] = useState<string>(getChain(chainId).nativeCurrency.address)
  return (
    <Stack direction="row" w="full" justify="space-between" align="center">
      <InputGroup>
        <Input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} type="number" />
        <InputRightElement
          zIndex="unset" // to prevent overlap on select token menu
          w="fit-content"
          px={1}
        >
          <Text color="currentcolor" fontWeight="bold">
            ETH
          </Text>
        </InputRightElement>
      </InputGroup>
      <Button minW="unset" onClick={() => onApply(price, paymentToken)}>
        Apply
      </Button>
    </Stack>
  )
}
