import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

import { Badge, Button, CloseButton, Flex, Spacer, StackProps } from '@chakra-ui/react'
import { useCollectionsQuery } from '@x/apis'
import { getChain } from '@x/constants'
import { Category, ChainId, getCategoryName, TokenStatus } from '@x/models'
import { tokensv2, useAppDispatch, useAppSelector } from '@x/store'
import { compareAddress } from '@x/utils'

export interface AppliedTokenFiltersProps extends StackProps {
  id: string
  hideFilters?: (keyof typeof tokensv2.selectors)[]
  collectionWhitelist?: { chainId: ChainId; contract: string }[]
}

const saleStatusLabel: Record<TokenStatus, string> = {
  [TokenStatus.BuyNow]: 'Buy Now',
  [TokenStatus.HasBid]: 'Has Bid',
  [TokenStatus.HasOffer]: 'Has Offer',
  [TokenStatus.HasTraded]: 'Has Traded',
  [TokenStatus.OnAuction]: 'On Auction',
}

export default function AppliedTokenFilters({
  id,
  hideFilters = [],
  collectionWhitelist,
  ...props
}: AppliedTokenFiltersProps) {
  const { locale } = useRouter()

  const { data: collectionData } = useCollectionsQuery({})

  const dispatch = useAppDispatch()
  const chainId = useAppSelector(tokensv2.selectors.chainId(id))
  const saleType = useAppSelector(tokensv2.selectors.type(id))
  const collections = useAppSelector(tokensv2.selectors.collections(id))
  const category = useAppSelector(tokensv2.selectors.category(id))
  const filterBy = useAppSelector(tokensv2.selectors.filterBy(id))
  const ownedBy = useAppSelector(tokensv2.selectors.ownedBy(id))
  const likedBy = useAppSelector(tokensv2.selectors.likedBy(id))
  const attrFilters = useAppSelector(tokensv2.selectors.attrFilters(id))
  const priceGTE = useAppSelector(tokensv2.selectors.priceGTE(id))
  const priceLTE = useAppSelector(tokensv2.selectors.priceLTE(id))
  const priceInUsdGTE = useAppSelector(tokensv2.selectors.priceInUsdGTE(id))
  const priceInUsdLTE = useAppSelector(tokensv2.selectors.priceInUsdLTE(id))

  const hasSelectedAllCollections = useMemo(() => {
    if (!chainId || !collectionWhitelist) return false
    const selected: Record<string, boolean> = {}
    for (const contract of collections) {
      selected[`${chainId}:${contract}`] = true
    }
    return collectionWhitelist.every(c => selected[`${c.chainId}:${c.contract}`])
  }, [collectionWhitelist, collections, chainId])

  const canClearFilters = [
    !hideFilters.includes('chainId') && chainId,
    !hideFilters.includes('type') && saleType !== 'all',
    !hideFilters.includes('collections') && !hasSelectedAllCollections && collections.length > 0,
    !hideFilters.includes('category') && category !== Category.All,
    !hideFilters.includes('filterBy') && filterBy.length > 0,
    !hideFilters.includes('ownedBy') && ownedBy,
    !hideFilters.includes('likedBy') && likedBy,
    !hideFilters.includes('attrFilters') && attrFilters.length > 0,
    !hideFilters.includes('priceGTE') &&
      !hideFilters.includes('priceLTE') &&
      (priceGTE !== void 0 || priceLTE !== void 0),
    !hideFilters.includes('priceInUsdGTE') &&
      !hideFilters.includes('priceInUsdLTE') &&
      (priceInUsdGTE !== void 0 || priceInUsdLTE !== void 0),
  ].some(Boolean)

  const clearFilters = useCallback(() => {
    if (!hideFilters.includes('chainId')) dispatch(tokensv2.actions.setChainId({ id, data: void 0 }))
    if (!hideFilters.includes('type')) dispatch(tokensv2.actions.setType({ id, data: 'all' }))
    if (!hideFilters.includes('collections'))
      dispatch(tokensv2.actions.setCollections({ id, data: collectionWhitelist?.map(c => c.contract) || [] }))
    if (!hideFilters.includes('category')) dispatch(tokensv2.actions.setCategory({ id, data: Category.All }))
    if (!hideFilters.includes('filterBy')) dispatch(tokensv2.actions.setFilterBy({ id, data: [] }))
    if (!hideFilters.includes('ownedBy')) dispatch(tokensv2.actions.setOwnedBy({ id, data: void 0 }))
    if (!hideFilters.includes('likedBy')) dispatch(tokensv2.actions.setLikedBy({ id, data: void 0 }))
    if (!hideFilters.includes('attrFilters')) dispatch(tokensv2.actions.setAttrFilters({ id, data: [] }))
    if (!hideFilters.includes('priceGTE') && !hideFilters.includes('priceLTE')) {
      dispatch(tokensv2.actions.setPriceGTE({ id, data: void 0 }))
      dispatch(tokensv2.actions.setPriceLTE({ id, data: void 0 }))
    }
    if (!hideFilters.includes('priceInUsdGTE') && !hideFilters.includes('priceInUsdLTE')) {
      dispatch(tokensv2.actions.setPriceInUsdGTE({ id, data: void 0 }))
      dispatch(tokensv2.actions.setPriceInUsdLTE({ id, data: void 0 }))
    }
  }, [hideFilters, dispatch, id, collectionWhitelist])

  const chain = chainId && getChain(chainId)

  function renderCollection(contract: string) {
    const collection = collectionData?.data?.find(c => compareAddress(c.erc721Address, contract))
    return (
      <Badge>
        {collection?.collectionName || contract}
        <Spacer />
        <CloseButton
          onClick={() =>
            dispatch(
              tokensv2.actions.setCollections({ id, data: collections.filter(c => !compareAddress(c, contract)) }),
            )
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
          <CloseButton onClick={() => dispatch(tokensv2.actions.setChainId({ id, data: void 0 }))} />
        </Badge>
      )}
      {!hideFilters.includes('category') && category !== Category.All && (
        <Badge>
          {getCategoryName(category)}
          <Spacer />
          <CloseButton onClick={() => dispatch(tokensv2.actions.setCategory({ id, data: Category.All }))} />
        </Badge>
      )}
      {!hideFilters.includes('collections') &&
        !hasSelectedAllCollections &&
        collections.length > 0 &&
        collections.map(renderCollection)}
      {!hideFilters.includes('filterBy') &&
        filterBy.map(tokenStatus => (
          <Badge key={tokenStatus}>
            {saleStatusLabel[tokenStatus]}
            <Spacer />
            <CloseButton
              onClick={() =>
                dispatch(tokensv2.actions.setFilterBy({ id, data: filterBy.filter(v => v !== tokenStatus) }))
              }
            />
          </Badge>
        ))}
      {!hideFilters.includes('priceGTE') && !hideFilters.includes('priceLTE') && chain && (priceGTE || priceLTE) && (
        <Badge>
          ({chain.nativeCurrency.symbol}) {priceGTE?.toLocaleString(locale) || '-'} -{' '}
          {priceLTE?.toLocaleString(locale) || '-'}
          <Spacer />
          <CloseButton
            onClick={() => {
              dispatch(tokensv2.actions.setPriceGTE({ id, data: void 0 }))
              dispatch(tokensv2.actions.setPriceLTE({ id, data: void 0 }))
            }}
          />
        </Badge>
      )}
      {!hideFilters.includes('priceInUsdGTE') &&
        !hideFilters.includes('priceInUsdLTE') &&
        (priceInUsdGTE || priceInUsdLTE) && (
          <Badge>
            (USD) {priceInUsdGTE?.toLocaleString(locale) || '-'} - {priceInUsdLTE?.toLocaleString(locale) || '-'}
            <Spacer />
            <CloseButton
              onClick={() => {
                dispatch(tokensv2.actions.setPriceInUsdGTE({ id, data: void 0 }))
                dispatch(tokensv2.actions.setPriceInUsdLTE({ id, data: void 0 }))
              }}
            />
          </Badge>
        )}
      {!hideFilters.includes('attrFilters') &&
        attrFilters.map(attrFilter =>
          attrFilter.values.map(traitValue => (
            <Badge key={`${attrFilter.name}-${traitValue}`}>
              {attrFilter.name}: {traitValue.replace(/"/g, '')}
              <Spacer />
              <CloseButton
                onClick={() => {
                  const index = attrFilters.findIndex(af => af.name === attrFilter.name)
                  dispatch(
                    tokensv2.actions.setAttrFilters({
                      id,
                      data: [
                        ...attrFilters.slice(0, index),
                        {
                          name: attrFilters[index].name,
                          values: attrFilters[index].values.filter(v => v !== traitValue),
                        },
                        ...attrFilters.slice(index + 1),
                      ],
                    }),
                  )
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
