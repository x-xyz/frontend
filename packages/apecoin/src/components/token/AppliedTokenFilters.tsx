import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { Box, Badge, Button, CloseButton, Spacer, Stack, Text } from '@chakra-ui/react'
import { fetchCollections } from '@x/apis/fn'
import { getChain } from '@x/constants'
import { Category, ChainId, getCategoryName, SearchTokenV2Params, TokenStatus } from '@x/models'
import { compareAddress } from '@x/utils'

export interface AppliedTokenFiltersProps {
  hideFilters?: (keyof SearchTokenV2Params)[]
  collectionWhitelist?: { chainId: ChainId; contract: string }[]
  value?: SearchTokenV2Params
  onValueChange?: (value: SearchTokenV2Params) => void
}

const saleStatusLabel: Record<TokenStatus, string> = {
  [TokenStatus.BuyNow]: 'Buy Now',
  [TokenStatus.HasBid]: 'Has Bid',
  [TokenStatus.HasOffer]: 'Has Offer',
  [TokenStatus.HasTraded]: 'Has Traded',
  [TokenStatus.OnAuction]: 'On Auction',
}

export default function AppliedTokenFilters({
  hideFilters = ['chainId', 'category'],
  collectionWhitelist,
  value = {},
  onValueChange = () => void 0,
}: AppliedTokenFiltersProps) {
  const { locale } = useRouter()

  const collectionData = useQuery(['collections', {}], fetchCollections)

  const {
    chainId,
    collections,
    category = Category.All.toString(),
    status,
    attrFilters,
    priceGTE,
    priceLTE,
    priceInUsdGTE,
    priceInUsdLTE,
    search,
  } = value

  const hasSelectedAllCollections = useMemo(() => {
    if (!chainId || !collectionWhitelist || !collections) return false
    const selected: Record<string, boolean> = {}
    for (const contract of collections) {
      selected[`${chainId}:${contract}`] = true
    }
    return collectionWhitelist.every(c => selected[`${c.chainId}:${c.contract}`])
  }, [collectionWhitelist, collections, chainId])

  const chain = chainId && getChain(chainId)

  function renderCollection(contract: string) {
    const collection = collectionData?.data?.items?.find(c => compareAddress(c.erc721Address, contract))
    return (
      <Badge variant="outline" borderColor="primary" boxShadow="none" h={{ base: '52px', md: '32px' }}>
        {collection?.collectionName || contract}
        <Spacer />
        <CloseButton
          onClick={() =>
            onValueChange({ ...value, collections: collections?.filter(c => !compareAddress(c, contract)) })
          }
        />
      </Badge>
    )
  }

  const hasAppliedChain = !hideFilters.includes('chainId') && chain
  const hasAppliedCategory = !hideFilters.includes('category') && category && category !== `${Category.All}`
  const hasAppliedCollections =
    !hideFilters.includes('collections') && !hasSelectedAllCollections && collections && collections.length > 0
  const hasAppliedStatus = !hideFilters.includes('status') && status && status.length > 0
  const hasAppliedPrice =
    !hideFilters.includes('priceGTE') && !hideFilters.includes('priceLTE') && chain && (priceGTE || priceLTE)
  const hasAppliedPriceUsd =
    !hideFilters.includes('priceInUsdGTE') &&
    !hideFilters.includes('priceInUsdLTE') &&
    (!!priceInUsdGTE || !!priceInUsdLTE)
  const hasAppliedAttrFilters = !hideFilters.includes('attrFilters') && attrFilters && attrFilters.length > 0
  const hasAppliedSearch = !hideFilters.includes('search') && search

  const hasAnyApplied = [
    hasAppliedChain,
    hasAppliedCategory,
    hasAppliedCollections,
    hasAppliedStatus,
    hasAppliedPrice,
    hasAppliedPriceUsd,
    hasAppliedAttrFilters,
    hasAppliedSearch,
  ].some(Boolean)

  function clear() {
    const next = { ...value }
    if (hasAppliedChain) delete next.chainId
    if (hasAppliedCategory) delete next.category
    if (hasAppliedCollections) delete next.collections
    if (hasAppliedStatus) delete next.status
    if (hasAppliedPrice) {
      delete next.priceGTE
      delete next.priceLTE
    }
    if (hasAppliedPriceUsd) {
      delete next.priceInUsdGTE
      delete next.priceInUsdLTE
    }
    if (hasAppliedAttrFilters) delete next.attrFilters
    if (hasAppliedSearch) delete next.search
    onValueChange(next)
  }

  return (
    <>
      {hasAnyApplied && (
        <Button color="#000" onClick={clear} h="32px">
          Clear All
        </Button>
      )}
      <Box display={{ base: 'block', md: 'none' }} w="70%" />
      {hasAppliedChain && (
        <Badge variant="outline" borderColor="primary" boxShadow="none" h={{ base: '52px', md: '32px' }}>
          {chain.name}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, chainId: void 0 })} />
        </Badge>
      )}
      {hasAppliedCategory && (
        <Badge variant="outline" borderColor="primary" boxShadow="none" h={{ base: '52px', md: '32px' }}>
          {getCategoryName(parseFloat(category) as Category)}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, category: Category.All.toString() })} />
        </Badge>
      )}
      {hasAppliedCollections && collections.map(renderCollection)}
      {hasAppliedStatus &&
        status.map(tokenStatus => (
          <Badge
            variant="outline"
            borderColor="primary"
            boxShadow="none"
            h={{ base: '52px', md: '32px' }}
            key={tokenStatus}
          >
            {saleStatusLabel[tokenStatus]}
            <Spacer />
            <CloseButton onClick={() => onValueChange({ ...value, status: status.filter(v => v !== tokenStatus) })} />
          </Badge>
        ))}
      {hasAppliedPrice && (
        <Badge variant="outline" borderColor="primary" boxShadow="none" h={{ base: '52px', md: '32px' }}>
          ({chain.nativeCurrency.symbol}){' '}
          {[priceGTE?.toLocaleString(locale) || '-', priceLTE?.toLocaleString(locale) || '-'].join(' - ')}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, priceGTE: void 0, priceLTE: void 0 })} />
        </Badge>
      )}
      {hasAppliedPriceUsd && (
        <Badge variant="outline" borderColor="primary" boxShadow="none" h={{ base: '52px', md: '32px' }}>
          (USD){' '}
          {[priceInUsdGTE?.toLocaleString(locale) || '-', priceInUsdLTE?.toLocaleString(locale) || '-'].join(' - ')}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, priceInUsdGTE: void 0, priceInUsdLTE: void 0 })} />
        </Badge>
      )}
      {hasAppliedAttrFilters &&
        attrFilters.map(attrFilter =>
          attrFilter.values.map(traitValue => (
            <Badge
              variant="outline"
              borderColor="primary"
              boxShadow="none"
              key={`${attrFilter.name}-${traitValue}`}
              textTransform="capitalize"
              h={{ base: '52px', md: '32px' }}
            >
              <Stack as="span" direction={{ base: 'column', md: 'row' }} spacing={0}>
                <Text as="span" color="#898989">
                  {attrFilter.name}:&nbsp;
                </Text>
                <Text as="span" color="caption">
                  {traitValue.replace(/"/g, '')}
                </Text>
              </Stack>
              <Spacer />
              <CloseButton
                color="textSecondary"
                onClick={() => {
                  const index = attrFilters.findIndex(af => af.name === attrFilter.name)
                  onValueChange({
                    ...value,
                    attrFilters: [
                      ...attrFilters.slice(0, index),
                      {
                        name: attrFilters[index].name,
                        values: attrFilters[index].values.filter(v => v !== traitValue),
                      },
                      ...attrFilters.slice(index + 1),
                    ],
                  })
                }}
              />
            </Badge>
          )),
        )}
      {hasAppliedSearch && (
        <Badge variant="outline" borderColor="primary" boxShadow="none" h={{ base: '52px', md: '32px' }}>
          Search: {search}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, search: void 0 })} />
        </Badge>
      )}
    </>
  )
}
