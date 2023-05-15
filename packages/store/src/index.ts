import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import {
  coingeckoApi,
  authApiV2,
  accountApiV2,
  collectionsApiV2,
  tokenApiV2,
  moderatorApiV2,
  searchApiV2,
  airdropApi,
  vexApi,
} from '@x/apis'
import app from './app'
import coingecko from './coingecko'
import tokens from './tokens'
import tokensv2 from './tokensv2'
import collections from './collections'

export * from './app'
export * from './coingecko'
export * as tokens from './tokens'
export * as tokensv2 from './tokensv2'
export * as collections from './collections'

const apis = [
  coingeckoApi,
  authApiV2,
  accountApiV2,
  collectionsApiV2,
  tokenApiV2,
  moderatorApiV2,
  searchApiV2,
  airdropApi,
  vexApi,
]

apis.reduce((acc, api) => ({ ...acc, [api.reducerPath]: api.reducer }), {})

export const store = configureStore({
  reducer: {
    app,
    coingecko,
    tokens,
    tokensv2,
    collections,
    ...apis.reduce((acc, api) => ({ ...acc, [api.reducerPath]: api.reducer }), {}),
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .concat(apis.map(api => api.middleware)) as any,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
