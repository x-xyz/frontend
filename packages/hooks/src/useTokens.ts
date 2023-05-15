import { useTokensQuery } from '@x/apis'
import { SortableColumn, SortDir, TokenSortOption } from '@x/models'
import { tokens, useAppSelector, useAppDispatch } from '@x/store'
import { useEffect, useMemo } from 'react'
import { useAuthToken } from './useAuthToken'
import { useDelayTrigger } from './useDelayTrigger'

export function TokensResolver({ id }: { id: string }) {
  const dispatch = useAppDispatch()

  /**
   * @todo use react-query for canceling stale query to prevent redundent querying
   */
  const waitedForAuthToken = useDelayTrigger(800)

  const [currentAuthToken, isLoadingAuthToken] = useAuthToken()

  const chainId = useAppSelector(tokens.selectors.chainId(id))

  const type = useAppSelector(tokens.selectors.type(id))

  const offset = useAppSelector(tokens.selectors.offset(id))

  const limit = useAppSelector(tokens.selectors.limit(id))

  const sortBy = useAppSelector(tokens.selectors.sortBy(id))

  const collections = useAppSelector(tokens.selectors.collections(id))

  const category = useAppSelector(tokens.selectors.category(id))

  const filterBy = useAppSelector(tokens.selectors.filterBy(id))

  const ownedBy = useAppSelector(tokens.selectors.ownedBy(id))

  const likedBy = useAppSelector(tokens.selectors.likedBy(id))

  const attrFilters = useAppSelector(tokens.selectors.attrFilters(id))

  const authToken = useAppSelector(tokens.selectors.authToken(id))

  useEffect(() => {
    dispatch(tokens.actions.setAuthToken({ id, data: currentAuthToken }))
  }, [dispatch, id, currentAuthToken])

  const params = useMemo(
    () => ({
      offset,
      limit,
      ...parseSortOptions(sortBy),
      status: filterBy.length > 0 ? filterBy : void 0,
      collections: collections.length > 0 ? collections : void 0,
      category: category ? `${category}` : void 0,
      chainId: chainId,
      belongsTo: ownedBy,
      likedBy: likedBy,
      type: type,
      attrFilters: attrFilters,
      authToken,
    }),
    [chainId, type, offset, limit, sortBy, collections, category, filterBy, ownedBy, likedBy, attrFilters, authToken],
  )

  const { data, isLoading } = useTokensQuery(params, { skip: !waitedForAuthToken || isLoadingAuthToken })

  useEffect(() => {
    dispatch(tokens.actions.setIsLoading({ id, data: isLoading || isLoadingAuthToken }))
  }, [dispatch, id, isLoading, isLoadingAuthToken])

  useEffect(() => {
    if (data?.status === 'success') {
      dispatch(
        tokens.actions.appendItems({
          id,
          data: {
            items: data.data.items || [],
            total: data.data.count,
          },
        }),
      )
    }
  }, [dispatch, id, data])

  return null
}

function parseSortOptions(option: TokenSortOption): { sortBy: SortableColumn; sortDir: SortDir } {
  switch (option) {
    case 'cheapest':
      return { sortBy: SortableColumn.Price, sortDir: 1 }
    case 'price':
      return { sortBy: SortableColumn.Price, sortDir: -1 }
    case 'lastSalePrice':
      return { sortBy: SortableColumn.LastPrice, sortDir: -1 }
    case 'createdAt':
      return { sortBy: SortableColumn.CreatedAt, sortDir: -1 }
    case 'oldest':
      return { sortBy: SortableColumn.CreatedAt, sortDir: 1 }
    case 'listedAt':
      return { sortBy: SortableColumn.ListedAt, sortDir: -1 }
    case 'saleEndsAt':
      return { sortBy: SortableColumn.AuctionEndTime, sortDir: 1 }
    case 'soldAt':
      return { sortBy: SortableColumn.SoldAt, sortDir: -1 }
    case 'viewed':
    default:
      return { sortBy: SortableColumn.Viewed, sortDir: -1 }
  }
}
