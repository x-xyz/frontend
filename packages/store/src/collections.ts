import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Category, ChainId, Collection, CollectionSortOption, PriceCurrency } from '@x/models'

export interface Store {
  chainId?: ChainId
  category?: Category
  minPrice?: string
  maxPrice?: string
  minUsdPrice?: number
  maxUsdPrice?: number
  priceCurrency?: PriceCurrency
  isLoading: boolean
  collections: Collection[]
  sortBy?: CollectionSortOption
}

const initialState: Store = {
  isLoading: false,
  collections: [],
  sortBy: CollectionSortOption.CreatedAtDesc,
}

const slice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    setChainId(state, { payload }: PayloadAction<ChainId | undefined>) {
      state.chainId = payload
    },
    setCategory(state, { payload }: PayloadAction<Category | undefined>) {
      if (payload === Category.All) {
        delete state.category
      } else {
        state.category = payload
      }
    },
    setMinPrice(state, { payload }: PayloadAction<string | undefined>) {
      state.minPrice = payload
    },
    setMaxPrice(state, { payload }: PayloadAction<string | undefined>) {
      state.maxPrice = payload
    },
    setPriceCurrency(state, { payload }: PayloadAction<PriceCurrency | undefined>) {
      state.priceCurrency = payload
    },
    setIsLoading(state, { payload }: PayloadAction<boolean>) {
      state.isLoading = payload
    },
    setCollections(state, { payload }: PayloadAction<Collection[]>) {
      state.collections = payload
    },
    setSortBy(state, { payload }: PayloadAction<CollectionSortOption | undefined>) {
      state.sortBy = payload
    },
    clearFilters(state) {
      delete state.chainId
      delete state.category
    },
  },
})

export const { actions } = slice

export default slice.reducer

interface ParentStore {
  collections: Store
}

export const selectors = {
  chainId: (s: ParentStore) => s.collections.chainId,
  category: (s: ParentStore) => s.collections.category,
  isLoading: (s: ParentStore) => s.collections.isLoading,
  collections: (s: ParentStore) => s.collections.collections,
  minPrice: (s: ParentStore) => s.collections.minPrice,
  maxPrice: (s: ParentStore) => s.collections.maxPrice,
  minUsdPrice: (s: ParentStore) => s.collections.minUsdPrice,
  maxUsdPrice: (s: ParentStore) => s.collections.maxUsdPrice,
  priceCurrency: (s: ParentStore) => s.collections.priceCurrency,
  sortBy: (s: ParentStore) => s.collections.sortBy || CollectionSortOption.CreatedAtDesc,
}
