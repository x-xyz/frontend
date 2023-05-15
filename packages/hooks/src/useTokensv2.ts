import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useCallbackRef } from '@chakra-ui/hooks'
import { useLazyTokensV2Query } from '@x/apis'
import {
  Category,
  ChainId,
  SearchTokenV2Params,
  toCategory,
  TokenSaleType,
  TokenStatus,
  TokenV2SortOption,
} from '@x/models'
import { tokensv2, useAppDispatch, useAppSelector } from '@x/store'
import { getFirst, toArray, trimObject } from '@x/utils'

import { useAuthToken } from './useAuthToken'
import { useSyncRef } from './useSyncRef'
import { useDebouncedValue } from './useDebouncedValue'

import type { ParsedUrlQuery } from 'querystring'
import { keys } from 'lodash'

export interface TokensV2Filters {
  chainId?: ChainId
  saleType?: TokenSaleType
  sortBy?: TokenV2SortOption
  collections?: string[]
  category?: Category
  filterBy?: TokenStatus[]
  ownedBy?: string
  likedBy?: string
  attrFilters?: { name: string; values: string[] }[]
  priceGTE?: number
  priceLTE?: number
  priceInUsdGTE?: number
  priceInUsdLTE?: number
}

export type Tokensv2FromQuery = (query: ParsedUrlQuery) => TokensV2Filters

export type Tokensv2ToQuery = (fitlers: TokensV2Filters) => ParsedUrlQuery

export interface UseTokensV2Options {
  fromQuery?: Tokensv2FromQuery
  toQuery?: Tokensv2ToQuery
  defaultChainId?: ChainId
  defaultCollections?: string[]
  defaultOwnedBy?: string
}

export function useTokensv2(id: string, options: UseTokensV2Options = {}) {
  const dispatch = useAppDispatch()

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const offset = useAppSelector(tokensv2.selectors.offset(id))
  const limit = useAppSelector(tokensv2.selectors.limit(id))
  const chainIdFromStore = useAppSelector(tokensv2.selectors.chainId(id))
  const collectionsFromStore = useAppSelector(tokensv2.selectors.collections(id))
  const saleType = useAppSelector(tokensv2.selectors.type(id))
  const sortBy = useAppSelector(tokensv2.selectors.sortBy(id))
  const category = useAppSelector(tokensv2.selectors.category(id))
  const filterBy = useAppSelector(tokensv2.selectors.filterBy(id))
  const ownedByFromStore = useAppSelector(tokensv2.selectors.ownedBy(id))
  const likedBy = useAppSelector(tokensv2.selectors.likedBy(id))
  const attrFilters = useAppSelector(tokensv2.selectors.attrFilters(id))
  const priceGTE = useAppSelector(tokensv2.selectors.priceGTE(id))
  const priceLTE = useAppSelector(tokensv2.selectors.priceLTE(id))
  const priceInUsdGTE = useAppSelector(tokensv2.selectors.priceInUsdGTE(id))
  const priceInUsdLTE = useAppSelector(tokensv2.selectors.priceInUsdLTE(id))

  /**
   * @todo write default value from server side
   * @note rtk-query will emit every fetched data, including stale one
   * as workaround, use `hasInitialDataLoaded` flag to prevent overwriting default value
   */
  const [chainId, setChainId] = useState(options.defaultChainId || chainIdFromStore)
  const [collections, setCollections] = useState(options.defaultCollections || collectionsFromStore)
  const [ownedBy, setOwnedBy] = useState(options.defaultOwnedBy || ownedByFromStore)
  const dataRef = useRef({ hasInitialDataLoaded: false })
  useEffect(() => {
    if (dataRef.current.hasInitialDataLoaded) setChainId(chainIdFromStore)
  }, [chainIdFromStore])
  useEffect(() => {
    if (dataRef.current.hasInitialDataLoaded) setCollections(collectionsFromStore)
  }, [collectionsFromStore])
  useEffect(() => {
    if (dataRef.current.hasInitialDataLoaded) setOwnedBy(ownedByFromStore)
  }, [ownedByFromStore])

  const params = useMemo<SearchTokenV2Params>(
    () => ({
      offset,
      limit,
      chainId,
      type: saleType,
      sortBy,
      collections: collections.length > 0 ? collections : void 0,
      category: category?.toString() && void 0,
      status: filterBy.length > 0 ? filterBy : void 0,
      belongsTo: ownedBy ? ownedBy : void 0,
      likedBy,
      attrFilters: attrFilters.length > 0 ? attrFilters : void 0,
      priceGTE,
      priceLTE,
      priceInUsdGTE,
      priceInUsdLTE,
    }),
    [
      offset,
      limit,
      chainId,
      saleType,
      sortBy,
      collections,
      category,
      filterBy,
      ownedBy,
      likedBy,
      attrFilters,
      priceGTE,
      priceLTE,
      priceInUsdGTE,
      priceInUsdLTE,
    ],
  )

  const debouncedParams = useDebouncedValue(params, 500)

  const [fetch, query] = useLazyTokensV2Query()

  const { data, isLoading, isFetching } = query

  // reset data when auth token loaded
  // it may affect search result
  useEffect(() => {
    if (!isLoadingAuthToken) dispatch(tokensv2.actions.reset(id))
  }, [dispatch, id, isLoadingAuthToken])

  useEffect(() => {
    // waiting for auth token loaded before starting fetch
    if (!isLoadingAuthToken) {
      fetch({ ...debouncedParams, authToken })
    }
  }, [isLoadingAuthToken, fetch, debouncedParams, authToken])

  useEffect(() => {
    dispatch(tokensv2.actions.setIsLoading({ id, data: isLoading || isFetching || isLoadingAuthToken }))
  }, [dispatch, id, isLoading, isFetching, isLoadingAuthToken])

  useEffect(() => {
    if (data?.status === 'success') {
      if (!dataRef.current.hasInitialDataLoaded) {
        dataRef.current.hasInitialDataLoaded = true
      }
      dispatch(
        tokensv2.actions.appendItems({
          id,
          data: {
            items: data.data.items || [],
            total: data.data.count,
          },
        }),
      )
    }
  }, [dispatch, id, data])

  useUrlQueryReader(id, options)

  useUrlQueryWriter(id, options)

  return query
}

export function defaultTokensv2FromQuery(query: ParsedUrlQuery): TokensV2Filters {
  const rawChainId = getFirst(query.chainId)
  const chainId = rawChainId ? (parseInt(rawChainId, 10) as ChainId) : void 0

  const rawSaleType = getFirst(query.saleType)
  let saleType = rawSaleType as TokenSaleType | undefined
  if (saleType === 'all') saleType = void 0

  const rawSortBy = getFirst(query.sortBy) || TokenV2SortOption.PriceAsc
  const sortBy = Object.values<string>(TokenV2SortOption).includes(rawSortBy)
    ? (rawSortBy as TokenV2SortOption)
    : undefined

  const collections = toArray(query.collections)

  const rawCategory = getFirst(query.category)
  let category = rawCategory ? toCategory(rawCategory) : void 0
  if (category === Category.All) category = void 0

  const rawFilterBy = toArray(query.filterBy)
  const filterBy = rawFilterBy.filter((item): item is TokenStatus => Object.values<string>(TokenStatus).includes(item))

  const ownedBy = getFirst(query.ownedBy)

  const likedBy = getFirst(query.likedBy)

  const rawAttrFilters = toArray(query.attrFilters)
  const attrFilters = rawAttrFilters
    .map(raw => {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  const rawPriceGTE = getFirst(query.priceGTE)
  const priceGTE = rawPriceGTE ? parseFloat(rawPriceGTE) : void 0

  const rawPriceLTE = getFirst(query.priceLTE)
  const priceLTE = rawPriceLTE ? parseFloat(rawPriceLTE) : void 0

  const rawPriceInUsdGTE = getFirst(query.priceInUsdGTE)
  const priceInUsdGTE = rawPriceInUsdGTE ? parseFloat(rawPriceInUsdGTE) : void 0

  const rawPriceInUsdLTE = getFirst(query.priceInUsdLTE)
  const priceInUsdLTE = rawPriceInUsdLTE ? parseFloat(rawPriceInUsdLTE) : void 0

  return {
    chainId,
    saleType,
    sortBy,
    collections,
    category,
    filterBy,
    ownedBy,
    likedBy,
    attrFilters,
    priceGTE,
    priceLTE,
    priceInUsdGTE,
    priceInUsdLTE,
  }
}

export function defaultTokensv2ToQuery(filters: TokensV2Filters): ParsedUrlQuery {
  return trimObject({
    chainId: filters.chainId?.toString(),
    saleType: filters.saleType !== 'all' ? filters.saleType?.toString() : void 0,
    sortBy: filters.sortBy?.toString(),
    collections: filters.collections?.length ? filters.collections : void 0,
    category: filters.category !== Category.All ? filters.category?.toString() : void 0,
    ownedBy: filters.ownedBy,
    likedBy: filters.likedBy,
    attrFilters: filters.attrFilters?.length ? filters.attrFilters.map(af => JSON.stringify(af)) : void 0,
    priceGTE: filters.priceGTE?.toString(),
    priceLTE: filters.priceLTE?.toString(),
    priceInUsdGTE: filters.priceInUsdGTE?.toString(),
    priceInUsdLTE: filters.priceInUsdLTE?.toString(),
  })
}

function useUrlQueryReader(id: string, options: UseTokensV2Options) {
  const fromQuery = useCallbackRef(options.fromQuery || defaultTokensv2FromQuery)
  const dispatch = useAppDispatch()
  const { query } = useRouter()

  useEffect(() => {
    const {
      chainId,
      saleType,
      sortBy,
      collections,
      category,
      ownedBy,
      likedBy,
      attrFilters,
      priceGTE,
      priceLTE,
      priceInUsdGTE,
      priceInUsdLTE,
    } = fromQuery(query)
    dispatch(tokensv2.actions.setChainId({ id, data: chainId }))
    dispatch(tokensv2.actions.setType({ id, data: saleType || 'all' }))
    dispatch(tokensv2.actions.setSortBy({ id, data: sortBy || TokenV2SortOption.PriceAsc }))
    dispatch(tokensv2.actions.setCollections({ id, data: collections || [] }))
    dispatch(tokensv2.actions.setCategory({ id, data: category || Category.All }))
    dispatch(tokensv2.actions.setOwnedBy({ id, data: ownedBy }))
    dispatch(tokensv2.actions.setLikedBy({ id, data: likedBy }))
    dispatch(tokensv2.actions.setAttrFilters({ id, data: attrFilters || [] }))
    dispatch(tokensv2.actions.setPriceGTE({ id, data: priceGTE }))
    dispatch(tokensv2.actions.setPriceLTE({ id, data: priceLTE }))
    dispatch(tokensv2.actions.setPriceInUsdGTE({ id, data: priceInUsdGTE }))
    dispatch(tokensv2.actions.setPriceInUsdLTE({ id, data: priceInUsdLTE }))
  }, [query, dispatch, id, fromQuery])
}

function useUrlQueryWriter(id: string, options: UseTokensV2Options) {
  const router = useRouter()
  const toQuery = useCallbackRef(options.toQuery || defaultTokensv2ToQuery)
  const fromQuery = useCallbackRef(options.fromQuery || defaultTokensv2FromQuery)
  const push = useCallbackRef(router.push)
  const queryRef = useSyncRef(router.query)
  const chainId = useAppSelector(tokensv2.selectors.chainId(id))
  const saleType = useAppSelector(tokensv2.selectors.type(id))
  const sortBy = useAppSelector(tokensv2.selectors.sortBy(id))
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
  const filters = useMemo<TokensV2Filters>(
    () => ({
      chainId,
      saleType,
      sortBy,
      collections,
      category,
      filterBy,
      ownedBy,
      likedBy,
      attrFilters,
      priceGTE,
      priceLTE,
      priceInUsdGTE,
      priceInUsdLTE,
    }),
    [
      chainId,
      saleType,
      sortBy,
      collections,
      category,
      filterBy,
      ownedBy,
      likedBy,
      attrFilters,
      priceGTE,
      priceLTE,
      priceInUsdGTE,
      priceInUsdLTE,
    ],
  )

  useEffect(() => {
    const prev = toQuery(fromQuery(queryRef.current))
    const next = toQuery(filters)

    const serializedPrev = keys(prev)
      .sort()
      .map(k => `${k}=${JSON.stringify(prev[k])}`)
      .join('&')

    const serializedNext = keys(next)
      .sort()
      .map(k => `${k}=${JSON.stringify(next[k])}`)
      .join('&')

    if (serializedPrev !== serializedNext) {
      push({ query: next }, void 0, { shallow: true })
    }
  }, [toQuery, fromQuery, push, queryRef, filters])
}
