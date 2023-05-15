import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

import { Badge, Button, CloseButton, Flex, Spacer, StackProps } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { getChain } from '@x/constants'
import { Category, ChainId, getCategoryName, SearchTokenV2Params, TokenStatus } from '@x/models'
import { compareAddress } from '@x/utils'

export interface AppliedTokenFiltersProps extends StackProps {
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
  hideFilters = [],
  collectionWhitelist,
  value = {},
  onValueChange = () => void 0,
  ...props
}: AppliedTokenFiltersProps) {
  const { locale } = useRouter()

  const { data: collectionData } = useCollectionsQuery({})

  const {
    chainId,
    type = 'all',
    collections,
    category = Category.All.toString(),
    status,
    belongsTo,
    likedBy,
    attrFilters,
    priceGTE,
    priceLTE,
    priceInUsdGTE,
    priceInUsdLTE,
  } = value

  const hasSelectedAllCollections = useMemo(() => {
    if (!chainId || !collectionWhitelist || !collections) return false
    const selected: Record<string, boolean> = {}
    for (const contract of collections) {
      selected[`${chainId}:${contract}`] = true
    }
    return collectionWhitelist.every(c => selected[`${c.chainId}:${c.contract}`])
  }, [collectionWhitelist, collections, chainId])

  const canClearFilters = [
    !hideFilters.includes('chainId') && chainId,
    !hideFilters.includes('type') && type !== 'all',
    !hideFilters.includes('collections') && !hasSelectedAllCollections && collections && collections.length > 0,
    !hideFilters.includes('category') && category !== Category.All.toString(),
    !hideFilters.includes('status') && status && status.length > 0,
    !hideFilters.includes('belongsTo') && belongsTo,
    !hideFilters.includes('likedBy') && likedBy,
    !hideFilters.includes('attrFilters') && attrFilters && attrFilters.length > 0,
    !hideFilters.includes('priceGTE') &&
      !hideFilters.includes('priceLTE') &&
      (priceGTE !== void 0 || priceLTE !== void 0),
    !hideFilters.includes('priceInUsdGTE') &&
      !hideFilters.includes('priceInUsdLTE') &&
      (priceInUsdGTE !== void 0 || priceInUsdLTE !== void 0),
  ].some(Boolean)

  const clearFilters = useCallback(() => {
    const newValue = { ...value }
    if (!hideFilters.includes('chainId')) delete newValue.chainId
    if (!hideFilters.includes('type')) delete newValue.type
    if (!hideFilters.includes('collections')) newValue.collections = collectionWhitelist?.map(c => c.contract)
    if (!hideFilters.includes('category')) newValue.category = Category.All.toString()
    if (!hideFilters.includes('status')) delete newValue.status
    if (!hideFilters.includes('belongsTo')) delete newValue.belongsTo
    if (!hideFilters.includes('likedBy')) delete newValue.likedBy
    if (!hideFilters.includes('attrFilters')) delete newValue.attrFilters
    if (!hideFilters.includes('priceGTE') && !hideFilters.includes('priceLTE')) {
      delete newValue.priceGTE
      delete newValue.priceLTE
    }
    if (!hideFilters.includes('priceInUsdGTE') && !hideFilters.includes('priceInUsdLTE')) {
      delete newValue.priceInUsdGTE
      delete newValue.priceInUsdLTE
    }
    onValueChange(newValue)
  }, [hideFilters, collectionWhitelist, value, onValueChange])

  const chain = chainId && getChain(chainId)

  function renderCollection(contract: string) {
    const collection = collectionData?.data?.find(c => compareAddress(c.erc721Address, contract))
    return (
      <Badge key={contract}>
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

  return (
    <Flex direction="row" wrap="wrap" sx={{ '&>*': { mr: 2, mb: 2 } }} {...props}>
      {!hideFilters.includes('chainId') && chain && (
        <Badge>
          {chain.name}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, chainId: void 0 })} />
        </Badge>
      )}
      {!hideFilters.includes('category') && category && category !== Category.All.toString() && (
        <Badge>
          {getCategoryName(parseFloat(category) as Category)}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, category: Category.All.toString() })} />
        </Badge>
      )}
      {!hideFilters.includes('collections') &&
        !hasSelectedAllCollections &&
        collections &&
        collections.length > 0 &&
        collections.map(renderCollection)}
      {!hideFilters.includes('status') &&
        status &&
        status.map(tokenStatus => (
          <Badge key={tokenStatus}>
            {saleStatusLabel[tokenStatus]}
            <Spacer />
            <CloseButton onClick={() => onValueChange({ ...value, status: status.filter(v => v !== tokenStatus) })} />
          </Badge>
        ))}
      {!hideFilters.includes('priceGTE') && !hideFilters.includes('priceLTE') && chain && (priceGTE || priceLTE) && (
        <Badge>
          ({chain.nativeCurrency.symbol}) {priceGTE?.toLocaleString(locale) || '-'} -{' '}
          {priceLTE?.toLocaleString(locale) || '-'}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, priceGTE: void 0, priceLTE: void 0 })} />
        </Badge>
      )}
      {!hideFilters.includes('priceInUsdGTE') &&
        !hideFilters.includes('priceInUsdLTE') &&
        (!!priceInUsdGTE || !!priceInUsdLTE) && (
          <Badge>
            {'(USD)'} {priceInUsdGTE?.toLocaleString(locale) || '-'} - {priceInUsdLTE?.toLocaleString(locale) || '-'}
            <Spacer />
            <CloseButton onClick={() => onValueChange({ ...value, priceInUsdGTE: void 0, priceInUsdLTE: void 0 })} />
          </Badge>
        )}
      {!hideFilters.includes('attrFilters') &&
        attrFilters &&
        attrFilters.map(attrFilter =>
          attrFilter.values.map(traitValue => (
            <Badge key={`${attrFilter.name}-${traitValue}`}>
              {attrFilter.name}: {traitValue.replace(/"/g, '')}
              <Spacer />
              <CloseButton
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
      {canClearFilters && (
        <Button variant="badge" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </Flex>
  )
}
