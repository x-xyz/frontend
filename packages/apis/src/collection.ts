import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import { ChainId } from '@x/constants'
import {
  AuthPayload,
  SignaturePayload,
  Category,
  ResponseOf,
  Collection,
  RegisterCollection,
  SearchCollectionParams,
  CollectionWithTradingVolume,
  TopCollectionParams,
  TradingVolume,
  TradingVolumePeriod,
} from '@x/models'

type CollectionIdentityParams = { chainId: ChainId; contract: string }

type ReviewCollectionParams = CollectionIdentityParams & ({ accept: true } | { accept: false; reason: string })

export const collectionsApiV2 = createApi({
  reducerPath: 'collectionApiV2',
  baseQuery: fetchBaseQuery({ baseUrl: goapiUrl, headers: { 'Content-Type': 'application/json' } }),
  endpoints: builder => ({
    collections: builder.query<ResponseOf<Collection[]>, SearchCollectionParams>({
      query: params => ({
        url: '/collections',
        params: {
          ...params,
          category: params.category === Category.All ? undefined : params.category,
          includeUnregistered:
            params.includeUnregistered === void 0 ? params.category === Category.All : params.includeUnregistered,
        },
      }),
    }),
    topCollections: builder.query<ResponseOf<CollectionWithTradingVolume[]>, TopCollectionParams>({
      query: params => ({ url: '/collections/top', params }),
    }),
    mintableCollections: builder.query<ResponseOf<Collection[]>, SearchCollectionParams & AuthPayload>({
      query: ({ authToken, ...params }) => ({
        url: '/collections/mintable',
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),
    unreviewedCollections: builder.query<ResponseOf<Collection[]>, SearchCollectionParams & AuthPayload>({
      query: ({ authToken, ...params }) => ({
        url: '/collections/unreviewed',
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),
    registerCollection: builder.mutation<ResponseOf<Collection>, RegisterCollection & AuthPayload>({
      query: ({ authToken, ...body }) => ({
        method: 'POST',
        url: '/collections',
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),
    collection: builder.query<ResponseOf<Collection>, CollectionIdentityParams>({
      query: ({ chainId, contract }) => ({ url: `/collection/${chainId}/${contract}` }),
    }),
    reviewCollection: builder.mutation<ResponseOf<Collection>, ReviewCollectionParams & AuthPayload>({
      query: ({ authToken, chainId, contract, ...body }) => ({
        method: 'POST',
        url: `/collection/${chainId}/${contract}/review`,
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),
    banCollection: builder.mutation<ResponseOf<Collection>, CollectionIdentityParams & AuthPayload & SignaturePayload>({
      query: ({ authToken, chainId, contract, ...body }) => ({
        method: 'POST',
        url: `/collection/${chainId}/${contract}/ban`,
        headers: { Authorization: `Bearer ${authToken}` },
        body,
      }),
    }),
    unbanCollection: builder.mutation<
      ResponseOf<Collection>,
      CollectionIdentityParams & AuthPayload & SignaturePayload
    >({
      query: ({ authToken, chainId, contract, ...body }) => ({
        method: 'POST',
        url: `/collection/${chainId}/${contract}/unban`,
        headers: { Authorization: `Bearer ${authToken}` },
        body,
      }),
    }),
    tradingVolume: builder.query<
      ResponseOf<TradingVolume>,
      CollectionIdentityParams & { period: TradingVolumePeriod; date: string }
    >({
      query: ({ chainId, contract, ...params }) => ({ url: `/collection/${chainId}/${contract}/volume`, params }),
    }),
  }),
})

export const {
  useCollectionQuery,
  useCollectionsQuery,
  useLazyCollectionQuery,
  useLazyCollectionsQuery,
  useLazyMintableCollectionsQuery,
  useLazyUnreviewedCollectionsQuery,
  useMintableCollectionsQuery,
  useRegisterCollectionMutation,
  useReviewCollectionMutation,
  useUnreviewedCollectionsQuery,
  useBanCollectionMutation,
  useUnbanCollectionMutation,
  useTopCollectionsQuery,
  useLazyTopCollectionsQuery,
  useLazyTradingVolumeQuery,
  useTradingVolumeQuery,
} = collectionsApiV2
