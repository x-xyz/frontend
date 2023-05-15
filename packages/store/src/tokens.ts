import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Category, ChainId, NftItem, TokenSaleType, TokenSortOption, TokenStatus } from '@x/models'
import { resolveUpdater, compareArray } from '@x/utils'

export interface SubStore {
  chainId?: ChainId
  type: TokenSaleType
  offset: number
  limit: number
  sortBy: TokenSortOption
  collections: string[]
  category: Category
  filterBy: TokenStatus[]
  ownedBy?: string
  likedBy?: string
  attrFilters: { name: string; values: string[] }[]
  total: number
  items: NftItem[]
  isLoading: boolean
  itemMap: Record<string, number>
  authToken?: string
}

type Store = {
  [id: string]: SubStore | undefined
}

type Action<T> = PayloadAction<{ id: string; data: Updater<T> }>

const slice = createSlice({
  name: 'tokens',
  initialState: {} as Store,
  reducers: {
    setOffset(root, { payload: { id, data } }: Action<number>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.offset)
      if (state.offset === nextValue) return
      state.offset = nextValue
    },
    setChainId(root, { payload: { id, data } }: Action<ChainId | undefined>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.chainId)
      if (state.chainId === nextValue) return
      state.chainId = nextValue
      resetSubStore(state)
      state.attrFilters = []
    },
    setType(root, { payload: { id, data } }: Action<TokenSaleType>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.type)
      if (state.type === nextValue) return
      state.type = nextValue
      resetSubStore(state)
    },
    setSortBy(root, { payload: { id, data } }: Action<TokenSortOption>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.sortBy)
      if (state.sortBy === nextValue) return
      state.sortBy = nextValue
      resetSubStore(state)
    },
    setCollections(root, { payload: { id, data } }: Action<string[]>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.collections)
      if (compareArray(state.collections, nextValue)) return
      state.collections = nextValue
      resetSubStore(state)
      state.attrFilters = []
    },
    setCategory(root, { payload: { id, data } }: Action<Category>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.category)
      if (state.category === nextValue) return
      state.category = nextValue
      resetSubStore(state)
    },
    setFilterBy(root, { payload: { id, data } }: Action<TokenStatus[]>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.filterBy)
      if (compareArray(state.filterBy, nextValue)) return
      state.filterBy = nextValue
      resetSubStore(state)
    },
    setOwnedBy(root, { payload: { id, data } }: Action<string | undefined>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.ownedBy)
      if (state.ownedBy === nextValue) return
      state.ownedBy = nextValue
      resetSubStore(state)
    },
    setLikedBy(root, { payload: { id, data } }: Action<string | undefined>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.likedBy)
      if (state.likedBy === nextValue) return
      state.likedBy = nextValue
      resetSubStore(state)
    },
    setAttrFilters(root, { payload: { id, data } }: Action<{ name: string; values: string[] }[]>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.attrFilters)
      if (state.attrFilters === nextValue) return
      state.attrFilters = nextValue
      resetSubStore(state)
    },
    setAuthToken(root, { payload: { id, data } }: Action<string | undefined>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.authToken)
      if (state.authToken === nextValue) return
      state.authToken = nextValue
      resetSubStore(state)
    },
    setIsLoading(root, { payload: { id, data } }: Action<boolean>) {
      const state = getSubStore(root, id)
      const nextValue = resolveUpdater(data, state.isLoading)
      if (state.isLoading === nextValue) return
      state.isLoading = nextValue
    },
    appendItems(root, { payload: { id, data } }: Action<{ items: NftItem[]; total: number }>) {
      const state = getSubStore(root, id)
      const result = resolveUpdater(data, { items: state.items, total: state.total })
      for (const item of result.items) {
        const key = [item.chainId, item.contractAddress, item.tokenId].join(':')
        // dedup
        if (state.itemMap[key] !== void 0) continue
        state.itemMap[key] = state.items.push(item) - 1
      }
      state.total = result.total
    },
    clear(root, { payload }: PayloadAction<string>) {
      delete root[payload]
    },
  },
})

export const { actions } = slice

export default slice.reducer

type ParentStore = {
  tokens: Store
}

function makeSelector<Field extends keyof SubStore, Result extends SubStore[Field]>(
  field: Field,
): (id: string) => (s: ParentStore) => Result

function makeSelector<
  Field extends keyof SubStore,
  Result extends SubStore[Field],
  DefaultValue extends NonNullable<Result>,
>(field: Field, defaultValue: DefaultValue): (id: string) => (s: ParentStore) => Result

function makeSelector<Field extends keyof SubStore, Result extends SubStore[Field]>(
  field: Field,
  defaultValue?: NonNullable<Result>,
) {
  return (id: string) => (s: ParentStore) => s.tokens[id]?.[field] || defaultValue
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace selectors {
  export const chainId = makeSelector('chainId')
  export const type = makeSelector('type', 'all')
  export const offset = makeSelector('offset', 0)
  export const limit = makeSelector('limit', 18)
  export const sortBy = makeSelector('sortBy', 'createdAt')
  export const collections = makeSelector('collections', [])
  export const category = makeSelector('category', Category.All)
  export const filterBy = makeSelector('filterBy', [])
  export const ownedBy = makeSelector('ownedBy')
  export const likedBy = makeSelector('likedBy')
  export const attrFilters = makeSelector('attrFilters', [])
  export const total = makeSelector('total', 0)
  export const items = makeSelector('items', [])
  export const isLoading = makeSelector('isLoading', false)
  export const authToken = makeSelector('authToken')
}

function getSubStore(state: Store, id: string) {
  if (!state[id]) {
    state[id] = {
      type: 'all',
      offset: 0,
      limit: 18,
      filterBy: [],
      collections: [],
      sortBy: 'createdAt',
      category: Category.All,
      attrFilters: [],
      items: [],
      total: 0,
      isLoading: false,
      itemMap: {},
    }
  }
  return state[id] as SubStore
}

function resetSubStore(state: SubStore) {
  state.offset = 0
  state.total = 0
  state.items = []
  state.itemMap = {}
}
