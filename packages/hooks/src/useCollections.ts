import { useCollectionsQuery } from '@x/apis'
import { Category, ChainId, toCategory } from '@x/models'
import { CollectionSortOption, PriceCurrency } from '@x/models/dist'
import { collections, useAppDispatch, useAppSelector } from '@x/store'
import { getFirst, trimObject } from '@x/utils'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { useEffect, useMemo } from 'react'
import { useSyncRef } from './useSyncRef'

export interface UseCollectionsOptions {
  defaultChainId?: ChainId
  defaultCategory?: Category
}

export function useCollections({ defaultChainId, defaultCategory }: UseCollectionsOptions = {}) {
  const dispatch = useAppDispatch()

  const chainId = useAppSelector(collections.selectors.chainId)
  const category = useAppSelector(collections.selectors.category)
  const priceCurrency = useAppSelector(collections.selectors.priceCurrency)
  const minPrice = useAppSelector(collections.selectors.minPrice)
  const maxPrice = useAppSelector(collections.selectors.maxPrice)
  const sortBy = useAppSelector(collections.selectors.sortBy)

  const param = useMemo(() => {
    if (priceCurrency === 'native') {
      return trimObject({
        chainId,
        category,
        sortBy,
        floorPriceGTE: minPrice,
        floorPriceLTE: maxPrice,
      })
    } else {
      return trimObject({
        chainId,
        category,
        sortBy,
        usdFloorPriceGTE: minPrice,
        usdFloorPriceLTE: maxPrice,
      })
    }
  }, [category, chainId, maxPrice, minPrice, priceCurrency, sortBy])

  const query = useCollectionsQuery(param)

  const { data, isLoading } = query

  useEffect(() => {
    dispatch(collections.actions.setChainId(defaultChainId))
  }, [dispatch, defaultChainId])

  useEffect(() => {
    dispatch(collections.actions.setCategory(defaultCategory))
  }, [dispatch, defaultCategory])

  useEffect(() => {
    if (data?.status === 'success') {
      dispatch(collections.actions.setCollections(data?.data || []))
    }
  }, [dispatch, data])

  useEffect(() => {
    dispatch(collections.actions.setIsLoading(isLoading))
  }, [dispatch, isLoading])

  useUrlQueryReader()

  useUrlQueryWriter()

  return query
}

interface Filters {
  chainId?: ChainId
  category?: Category
  priceCurrency?: PriceCurrency
  minPrice?: string
  maxPrice?: string
  sortBy?: CollectionSortOption
}

function fromQuery(query: ParsedUrlQuery): Filters {
  const rawChainId = getFirst(query.chainId)
  const chainId = rawChainId ? (parseInt(rawChainId, 10) as ChainId) : void 0
  const rawCategory = getFirst(query.category)
  const category = rawCategory ? toCategory(rawCategory) : void 0
  let priceCurrency: PriceCurrency | undefined = undefined
  const rawPriceCurrency = getFirst(query.priceCurrency)
  if (rawPriceCurrency === 'native' || rawPriceCurrency === 'usd') {
    priceCurrency = rawPriceCurrency
  }
  const rawMinPrice = getFirst(query.minPrice)
  const minPrice = isNaN(Number(rawMinPrice)) ? undefined : rawMinPrice
  const rawMaxPrice = getFirst(query.maxPrice)
  const maxPrice = isNaN(Number(rawMaxPrice)) ? undefined : rawMaxPrice
  const rawSortBy = getFirst(query.sortBy) || ''
  const sortBy = Object.values<string>(CollectionSortOption).includes(rawSortBy)
    ? (rawSortBy as CollectionSortOption)
    : undefined
  return { chainId, category, priceCurrency, minPrice, maxPrice, sortBy }
}

function toQuery(filters: Filters): ParsedUrlQuery {
  return trimObject({
    chainId: filters.chainId?.toString(),
    category: filters.category?.toString(),
    priceCurrency: filters.priceCurrency?.toString(),
    minPrice: filters.minPrice?.toString(),
    maxPrice: filters.maxPrice?.toString(),
    sortBy: filters.sortBy?.toString(),
  })
}

function useUrlQueryReader() {
  const dispatch = useAppDispatch()
  const { query } = useRouter()
  const queryRef = useSyncRef(query)

  useEffect(() => {
    const { chainId, category, priceCurrency, minPrice, maxPrice, sortBy } = fromQuery(queryRef.current)
    dispatch(collections.actions.setChainId(chainId))
    dispatch(collections.actions.setCategory(category))
    dispatch(collections.actions.setPriceCurrency(priceCurrency))
    dispatch(collections.actions.setMinPrice(minPrice))
    dispatch(collections.actions.setMaxPrice(maxPrice))
    dispatch(collections.actions.setSortBy(sortBy))
  }, [queryRef, dispatch])
}

function useUrlQueryWriter() {
  const { query, push } = useRouter()
  const chainId = useAppSelector(collections.selectors.chainId)
  const category = useAppSelector(collections.selectors.category)
  const priceCurrency = useAppSelector(collections.selectors.priceCurrency)
  const minPrice = useAppSelector(collections.selectors.minPrice)
  const maxPrice = useAppSelector(collections.selectors.maxPrice)
  const sortBy = useAppSelector(collections.selectors.sortBy)

  useEffect(() => {
    const prevQuery = query
    const nextQuery = toQuery({ chainId, category, priceCurrency, minPrice, maxPrice, sortBy })
    const isDirty =
      prevQuery.chainId !== nextQuery.chainId ||
      prevQuery.category !== nextQuery.category ||
      prevQuery.priceCurrency !== nextQuery.priceCurrency ||
      prevQuery.minPrice !== nextQuery.minPrice ||
      prevQuery.maxPrice !== nextQuery.maxPrice ||
      prevQuery.sortBy !== nextQuery.sortBy

    if (isDirty) {
      push({ query: nextQuery }, void 0, { shallow: true })
    }
  }, [push, query, chainId, category, priceCurrency, minPrice, maxPrice, sortBy])
}
