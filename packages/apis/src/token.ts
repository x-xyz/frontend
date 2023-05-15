import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import {
  TokenUploadParams,
  TokenUploadResult,
  NftItem,
  SearchTokenParams,
  SearchTokenV2Params,
  TokenHistory,
  TokenIdentityParams,
  TokenOffer,
  TokenSearchResult,
  TokenListing,
  ResponseOf,
  AuthPayload,
  SignaturePayload,
  ActivityHistoryResult,
  TimePeriod,
  PagingPayload,
  PriceHistory,
  TokenLore,
} from '@x/models'
import { concatQueries, makeAuthHeader, makeQueryArray } from './utils'

function serializeAttrFilters(attrFilters: { name: string; values: string[] }[]) {
  return attrFilters.filter(af => af.name.length > 0 && af.values.length > 0).map(af => JSON.stringify(af))
}

export const tokenApiV2 = createApi({
  reducerPath: 'tokenApiV2',
  baseQuery: fetchBaseQuery({ baseUrl: goapiUrl, headers: { 'Content-Type': 'application/json' } }),
  endpoints: builder => ({
    tokens: builder.query<ResponseOf<TokenSearchResult>, SearchTokenParams & Partial<AuthPayload>>({
      query: ({ collections = [], attrFilters = [], authToken, ...params }) => ({
        url: `/tokens?${concatQueries(
          makeQueryArray('collections', collections),
          makeQueryArray('attrFilters', serializeAttrFilters(attrFilters)),
        )}`,
        params: { ...params },
        headers: makeAuthHeader(authToken),
      }),
    }),
    tokensV2: builder.query<ResponseOf<TokenSearchResult>, SearchTokenV2Params & Partial<AuthPayload>>({
      query: ({ collections = [], attrFilters = [], status, authToken, ...params }) => ({
        url: `/tokens/v2?${concatQueries(
          makeQueryArray('collections', collections),
          makeQueryArray('attrFilters', serializeAttrFilters(attrFilters)),
        )}`,
        params: { ...params, saleStatus: status },
        headers: makeAuthHeader(authToken),
      }),
    }),
    upload: builder.mutation<ResponseOf<TokenUploadResult>, TokenUploadParams & AuthPayload>({
      query: ({ authToken, royalty, ...body }) => ({
        method: 'POST',
        url: '/tokens/upload',
        body: { ...body, royalty: `${parseFloat(royalty) * 100}` },
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),
    token: builder.query<ResponseOf<NftItem>, TokenIdentityParams & Partial<AuthPayload>>({
      query: ({ chainId, contract, tokenId, authToken }) => ({
        url: `/token/${chainId}/${contract}/${tokenId}`,
        headers: makeAuthHeader(authToken),
      }),
    }),
    tokenOffers: builder.query<ResponseOf<TokenOffer[]>, TokenIdentityParams>({
      query: ({ chainId, contract, tokenId }) => ({ url: `/token/${chainId}/${contract}/${tokenId}/offers` }),
    }),
    tokenHistories: builder.query<ResponseOf<TokenHistory[]>, TokenIdentityParams>({
      query: ({ chainId, contract, tokenId }) => ({ url: `/token/${chainId}/${contract}/${tokenId}/histories` }),
    }),
    tokenListing: builder.query<ResponseOf<TokenListing[]>, TokenIdentityParams>({
      query: ({ chainId, contract, tokenId }) => ({ url: `/token/${chainId}/${contract}/${tokenId}/listings` }),
    }),
    tokenActivities: builder.query<ResponseOf<ActivityHistoryResult>, TokenIdentityParams & PagingPayload>({
      query: ({ chainId, contract, tokenId, offset, limit }) => ({
        url: `/token/${chainId}/${contract}/${tokenId}/activities`,
        params: { offset, limit },
      }),
    }),
    tokenPriceHistories: builder.query<ResponseOf<PriceHistory[]>, TokenIdentityParams & { period: TimePeriod }>({
      query: ({ chainId, contract, tokenId, period }) => ({
        url: `/token/${chainId}/${contract}/${tokenId}/price-histories/${period}`,
      }),
    }),
    banToken: builder.mutation<ResponseOf<void>, TokenIdentityParams & AuthPayload & SignaturePayload>({
      query: ({ chainId, contract, tokenId, authToken, ...body }) => ({
        method: 'POST',
        url: `/token/${chainId}/${contract}/${tokenId}/ban`,
        headers: makeAuthHeader(authToken),
        body,
      }),
    }),
    unbanToken: builder.mutation<ResponseOf<void>, TokenIdentityParams & AuthPayload & SignaturePayload>({
      query: ({ chainId, contract, tokenId, authToken, ...body }) => ({
        method: 'POST',
        url: `/token/${chainId}/${contract}/${tokenId}/unban`,
        headers: makeAuthHeader(authToken),
        body,
      }),
    }),
    likeToken: builder.mutation<ResponseOf<number>, TokenIdentityParams & AuthPayload>({
      query: ({ chainId, contract, tokenId, authToken }) => ({
        method: 'POST',
        url: `/token/${chainId}/${contract}/${tokenId}/like`,
        headers: makeAuthHeader(authToken),
      }),
    }),
    unlikeToken: builder.mutation<ResponseOf<number>, TokenIdentityParams & AuthPayload>({
      query: ({ chainId, contract, tokenId, authToken }) => ({
        method: 'DELETE',
        url: `/token/${chainId}/${contract}/${tokenId}/like`,
        headers: makeAuthHeader(authToken),
      }),
    }),
    addUnlockableContent: builder.mutation<
      ResponseOf<string>,
      TokenIdentityParams & AuthPayload & SignaturePayload & { content: string }
    >({
      query: ({ chainId, contract, tokenId, authToken, ...body }) => ({
        method: 'POST',
        url: `/token/${chainId}/${contract}/${tokenId}/unlockable-content`,
        headers: makeAuthHeader(authToken),
        body,
      }),
    }),
    unlockableContent: builder.mutation<ResponseOf<string>, TokenIdentityParams & AuthPayload & SignaturePayload>({
      query: ({ chainId, contract, tokenId, authToken, ...body }) => ({
        method: 'POST',
        url: `/token/${chainId}/${contract}/${tokenId}/unlockable-content/reveal`,
        headers: makeAuthHeader(authToken),
        body,
      }),
    }),
    viewCount: builder.query<ResponseOf<number>, TokenIdentityParams>({
      query: ({ chainId, contract, tokenId }) => ({ url: `/token/${chainId}/${contract}/${tokenId}/view-count` }),
    }),
    lores: builder.query<TokenLore[], TokenIdentityParams>({
      query: ({ chainId, contract, tokenId }) => ({ url: `/token/${chainId}/${contract}/${tokenId}/lores` }),
    }),
  }),
})

export const {
  useLazyTokenHistoriesQuery,
  useLazyTokenOffersQuery,
  useLazyTokenQuery,
  useLazyTokensQuery,
  useTokenHistoriesQuery,
  useTokenOffersQuery,
  useTokenQuery,
  useTokensQuery,
  useBanTokenMutation,
  useUnbanTokenMutation,
  useUploadMutation,
  useLikeTokenMutation,
  useUnlikeTokenMutation,
  useAddUnlockableContentMutation,
  useUnlockableContentMutation,
  useLazyTokenListingQuery,
  useTokenListingQuery,
  useViewCountQuery,
  useLazyViewCountQuery,
  useTokensV2Query,
  useLazyTokensV2Query,
  useLazyTokenActivitiesQuery,
  useLazyTokenPriceHistoriesQuery,
  useTokenActivitiesQuery,
  useTokenPriceHistoriesQuery,
  useLazyLoresQuery,
} = tokenApiV2
