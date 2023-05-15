import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import React, { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef } from 'react'

import { useCallbackRef } from '@chakra-ui/hooks'
import { ChainId } from '@x/constants'
import { Category, TokenSaleType, TokenSortOption, TokenStatus } from '@x/models'
import { tokens, useAppDispatch, useAppSelector } from '@x/store'
import { compareArray, ensureNumber, toArray } from '@x/utils'

import { TokensResolver } from './useTokens'

export interface UseFetchTokensParamsOptions {
  defaultValue?: Partial<{
    chainId?: ChainId
    type: TokenSaleType
    from: number
    count: number
    sortBy: TokenSortOption
    collections?: string[]
    category?: Category
    filterBy?: TokenStatus[]
    address?: string
    likedBy?: string
  }>
  id?: string
}

export function useFetchTokens({ defaultValue, id = 'default' }: UseFetchTokensParamsOptions = {}) {
  const defaultValueRef = useRef(defaultValue)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (defaultValueRef.current?.address)
      dispatch(tokens.actions.setOwnedBy({ id, data: defaultValueRef.current?.address }))

    if (defaultValueRef.current?.category)
      dispatch(tokens.actions.setCategory({ id, data: defaultValueRef.current?.category }))

    if (defaultValueRef.current?.chainId)
      dispatch(tokens.actions.setChainId({ id, data: defaultValueRef.current?.chainId }))

    if (defaultValueRef.current?.collections)
      dispatch(tokens.actions.setCollections({ id, data: defaultValueRef.current?.collections }))

    if (defaultValueRef.current?.filterBy)
      dispatch(tokens.actions.setFilterBy({ id, data: defaultValueRef.current?.filterBy }))

    if (defaultValueRef.current?.from) dispatch(tokens.actions.setOffset({ id, data: defaultValueRef.current?.from }))

    if (defaultValueRef.current?.likedBy)
      dispatch(tokens.actions.setLikedBy({ id, data: defaultValueRef.current?.likedBy }))

    if (defaultValueRef.current?.sortBy)
      dispatch(tokens.actions.setSortBy({ id, data: defaultValueRef.current?.sortBy }))

    if (defaultValueRef.current?.type) dispatch(tokens.actions.setType({ id, data: defaultValueRef.current?.type }))
  }, [dispatch, id])

  const chainId = useAppSelector(tokens.selectors.chainId(id))

  const type = useAppSelector(tokens.selectors.type(id))

  const offset = useAppSelector(tokens.selectors.offset(id))

  const limit = useAppSelector(tokens.selectors.limit(id))

  const sortBy = useAppSelector(tokens.selectors.sortBy(id)) || 'createdAt'

  const collections = useAppSelector(tokens.selectors.collections(id))

  const category = useAppSelector(tokens.selectors.category(id))

  const filterBy = useAppSelector(tokens.selectors.filterBy(id))

  const ownedBy = useAppSelector(tokens.selectors.ownedBy(id))

  // const likedBy = useAppSelector(tokens.selectors.likedBy(id))

  const attrFilters = useAppSelector(tokens.selectors.attrFilters(id))

  const items = useAppSelector(tokens.selectors.items(id))

  const total = useAppSelector(tokens.selectors.total(id))

  const isLoading = useAppSelector(tokens.selectors.isLoading(id))

  const hasMore = useMemo(() => items.length < total, [items, total])

  return {
    isLoading,
    tokens: items,
    hasMore,
    total,
    chainId,
    setChainId: useCallback(
      (data: ChainId | undefined) => dispatch(tokens.actions.setChainId({ id, data })),
      [dispatch, id],
    ),
    from: offset,
    setFrom: useCallback((data: Updater<number>) => dispatch(tokens.actions.setOffset({ id, data })), [dispatch, id]),
    type,
    setType: useCallback(
      (data: Updater<TokenSaleType>) => dispatch(tokens.actions.setType({ id, data })),
      [dispatch, id],
    ),
    filterBy,
    setFilterBy: useCallback(
      (data: TokenStatus[]) => dispatch(tokens.actions.setFilterBy({ id, data })),
      [dispatch, id],
    ),
    sortBy,
    setSortBy: useCallback(
      (data: Updater<TokenSortOption>) => dispatch(tokens.actions.setSortBy({ id, data })),
      [dispatch, id],
    ),
    collections,
    setCollections: useCallback(
      (data: string[]) => {
        dispatch(tokens.actions.setCollections({ id, data }))
      },
      [dispatch, id],
    ),
    category,
    setCategory: useCallback(
      (data: Updater<Category>) => dispatch(tokens.actions.setCategory({ id, data })),
      [dispatch, id],
    ),
    address: ownedBy,
    setAddress: useCallback(
      (data: string | undefined) => dispatch(tokens.actions.setOwnedBy({ id, data })),
      [dispatch, id],
    ),
    attrFilters,
    setAttrFilters: useCallback(
      (name: string, values: string[], reset?: boolean) => {
        const getData = () => {
          if (reset) return [] // clear attrFilters
          const index = attrFilters.findIndex(item => item.name === name)
          if (index < 0) return [...attrFilters, { name, values }]
          if (values.length === 0) return [...attrFilters.filter(item => item.name !== name)]
          return [...attrFilters.slice(0, index), { name, values }, ...attrFilters.slice(index + 1)]
        }

        const data = getData()

        dispatch(
          tokens.actions.setAttrFilters({
            id,
            data,
          }),
        )
      },
      [dispatch, id, attrFilters],
    ),
    batchSize: limit,
  }
}

function defaultShouldReplace(query: ParsedUrlQuery) {
  return true
}

export interface UseFetchTokensParamsQueryOptions {
  shouldReplace?: (query: ParsedUrlQuery) => boolean
  ignores?: ('collections' | 'category' | 'chainId')[]
}

export function useFetchTokensParamsQuery(
  { chainId, type, collections, filterBy, sortBy, category }: ReturnType<typeof useFetchTokens>,
  { shouldReplace = defaultShouldReplace, ignores = [] }: UseFetchTokensParamsQueryOptions = {},
) {
  const { query, push, replace } = useRouter()

  const shouldReplaceRef = useCallbackRef(shouldReplace, [shouldReplace])

  useEffect(() => {
    const newQuery: ParsedUrlQuery = { ...query }

    let isDirty = false

    if (!ignores.includes('chainId') && query.chainId !== chainId?.toString()) {
      if (chainId) newQuery.chainId = chainId.toString()
      else delete newQuery.chainId
      isDirty = true
    }

    if (query.type !== type) {
      newQuery.type = type
      isDirty = true
    }

    if (!ignores.includes('collections') && !compareArray(toArray(query.collections), collections)) {
      newQuery.collections = collections
      isDirty = true
    }

    if (!compareArray(toArray(query.filterBy), filterBy)) {
      newQuery.filterBy = filterBy
      isDirty = true
    }

    if (query.sortBy !== sortBy) {
      newQuery.sortBy = sortBy
      isDirty = true
    }

    if (!ignores.includes('category') && query.category !== category.toString()) {
      newQuery.category = category.toString()
      isDirty = true
    }

    if (isDirty) {
      const redirect = shouldReplaceRef(query) ? replace : push

      redirect({ query: newQuery }, undefined, { shallow: true })
    }
  }, [ignores, query, chainId, type, collections, filterBy, sortBy, category, push, replace, shouldReplaceRef])
}

export function parseFetchTokensParamsFromQuery(query: ParsedUrlQuery) {
  const defaultValues: UseFetchTokensParamsOptions['defaultValue'] = {}

  if (query.chainId) {
    if (typeof query.chainId === 'string') {
      defaultValues.chainId = ensureNumber(query.chainId)
    } else {
      defaultValues.chainId = ensureNumber(query.chainId[0])
    }
  }

  if (query.type) {
    if (typeof query.type === 'string') {
      defaultValues.type = query.type as TokenSaleType
    } else {
      defaultValues.type = query.type[0] as TokenSaleType
    }
  }

  if (query.filterBy) {
    if (typeof query.filterBy === 'string') {
      defaultValues.filterBy = [query.filterBy as TokenStatus]
    } else {
      defaultValues.filterBy = query.filterBy as TokenStatus[]
    }
  }

  if (query.sortBy) {
    if (typeof query.sortBy === 'string') {
      defaultValues.sortBy = query.sortBy as TokenSortOption
    } else {
      defaultValues.sortBy = query.sortBy[0] as TokenSortOption
    }
  }

  if (query.collections) {
    if (typeof query.collections === 'string') {
      defaultValues.collections = [query.collections]
    } else {
      defaultValues.collections = query.collections
    }
  }

  if (query.category) {
    if (typeof query.category === 'string') {
      defaultValues.category = ensureNumber(query.category, Category.All)
    } else {
      defaultValues.category = ensureNumber(query.category[0], Category.All)
    }
  }

  return defaultValues
}

const FetchTokensContext = createContext<ReturnType<typeof useFetchTokens>>({} as any) // eslint-disable-line @typescript-eslint/no-explicit-any

export function FetchTokensProvider({
  children,
  value,
  id = 'default',
}: {
  children: React.ReactNode
  value: ReturnType<typeof useFetchTokens>
  id?: string
}) {
  return createElement(FetchTokensContext.Provider, { value }, createElement(TokensResolver, { id }), children)
}

export function useFetchTokensContext() {
  const context = useContext(FetchTokensContext)

  if (Object.keys(context).length === 0) throw new Error('not found fetch tokens context')

  return context
}
