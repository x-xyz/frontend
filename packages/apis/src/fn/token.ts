import { Order, SignedOrder } from '@x/models/dist'
import fetchJsonp from 'fetch-jsonp'
import { QueryFunctionContext } from 'react-query'

import { goapiUrl } from '@x/constants'
import {
  ActivityHistoryResult,
  AuthPayload,
  ChainId,
  NftItem,
  NftItemId,
  ResponseOf,
  SearchTokenParams,
  SearchTokenV2Params,
  TokenIdentityParams,
  TokenMetadata,
  TokenSearchResult,
} from '@x/models'

import { checkResponse, makeAuthHeader, makeQuery } from '../utils'

export async function fetchToken(params: TokenIdentityParams & Partial<AuthPayload>) {
  const { chainId, contract, tokenId, authToken } = params
  const url = `${goapiUrl}/token/${chainId}/${contract}/${tokenId}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  const data = await resp.json()
  return data as ResponseOf<NftItem>
}

export type FetchTokenV2QueryKey = [
  cacheKey: string,
  chaiId: ChainId,
  contract: string,
  tokenId: string,
  params?: { authToken?: string },
]

export async function fetchTokenV2({ queryKey }: QueryFunctionContext<FetchTokenV2QueryKey>) {
  const [, chainId, contract, tokenId, params = {}] = queryKey
  const { authToken } = params
  const url = `${goapiUrl}/token/${chainId}/${contract}/${tokenId}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  await checkResponse(resp)
  const data: ResponseOf<NftItem> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function fetchTokenMetadata(uri: string): Promise<TokenMetadata | undefined> {
  const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

  if (base64Regex.test(uri)) {
    return JSON.parse(atob(uri))
  }

  try {
    const resp = await fetch(uri)
    return await resp.json()
  } catch {
    try {
      const resp = await fetchJsonp(uri)
      return await resp.json()
    } catch {
      return
    }
  }
}

export type FetchTokenMetadataV2QueryKey = [cacheKey: string, uri: string]

export async function fetchTokenMetadataV2({ queryKey }: QueryFunctionContext<FetchTokenMetadataV2QueryKey>) {
  const [, uri] = queryKey
  return await fetchTokenMetadata(uri)
}

export type FetchTokensV1QueryKey = [cacheKey: string, params: SearchTokenParams & Partial<AuthPayload>]

export async function fetchTokensV1({ queryKey, pageParam }: QueryFunctionContext<FetchTokensV1QueryKey, number>) {
  const [, { authToken, attrFilters = [], ...params }] = queryKey
  const url = `${goapiUrl}/tokens?${makeQuery({
    ...params,
    offset: pageParam,
    attrFilters: serializeAttrFilters(attrFilters),
  })}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  const data: ResponseOf<TokenSearchResult> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data
}

export type FetchTokensQueryKey = [cacheKey: string, params: SearchTokenV2Params & Partial<AuthPayload>]

export async function fetchTokens({ queryKey, pageParam }: QueryFunctionContext<FetchTokensQueryKey, number>) {
  const [, { authToken, attrFilters = [], status, ...params }] = queryKey
  const url = `${goapiUrl}/tokens/v2?${makeQuery({
    ...params,
    saleStatus: status,
    category: params.category === '-1' ? void 0 : params.category,
    offset: pageParam,
    attrFilters: serializeAttrFilters(attrFilters),
  })}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  const data: ResponseOf<TokenSearchResult> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data
}

function serializeAttrFilters(attrFilters: { name: string; values: string[] }[]) {
  return attrFilters.filter(af => af.name.length > 0 && af.values.length > 0).map(af => JSON.stringify(af))
}

export type FetchTokenActivitiesQueryKey = [
  cacheKey: string,
  chainId: ChainId,
  contract: string,
  tokenId: string,
  params?: { authToken?: string; limit?: number },
]

export async function fetchTokenActivities({
  queryKey,
  pageParam,
}: QueryFunctionContext<FetchTokenActivitiesQueryKey>) {
  const [, chainId, contract, tokenId, params = {}] = queryKey
  const { authToken, ...queries } = params
  const url = `${goapiUrl}/token/${chainId}/${contract}/${tokenId}/activities?${makeQuery({
    ...queries,
    offset: pageParam,
  })}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  const data: ResponseOf<ActivityHistoryResult> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type LikeTokenQueryKey = [authToken: string, chainId: ChainId, contract: string, tokenId: string]

export async function likeToken({ queryKey }: QueryFunctionContext<LikeTokenQueryKey>) {
  const [authToken, chainId, contract, tokenId] = queryKey
  const url = `${goapiUrl}/token/${chainId}/${contract}/${tokenId}/like`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken), method: 'POST' })
  const data: ResponseOf<number> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function unlikeToken({ queryKey }: QueryFunctionContext<LikeTokenQueryKey>) {
  const [authToken, chainId, contract, tokenId] = queryKey
  const url = `${goapiUrl}/token/${chainId}/${contract}/${tokenId}/like`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken), method: 'DELETE' })
  const data: ResponseOf<number> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type RefreshTokenMetadataQueryKey = [authToken: string, chainId: ChainId, contract: string, tokenId: string]

export async function refreshTokenMetadata({ queryKey }: QueryFunctionContext<RefreshTokenMetadataQueryKey>) {
  const [authToken, chainId, contract, tokenId] = queryKey
  const url = `${goapiUrl}/token/${chainId}/${contract}/${tokenId}/refresh-metadata`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken), method: 'POST' })
  const data: ResponseOf<void> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return resp.status === 200
}

export type MarkTokenPrivateQueryKey = [
  authToken: string,
  body: { marks: NftItemId[]; unmarks: NftItemId[]; signature: string },
]

export async function markTokenPrivate({ queryKey }: QueryFunctionContext<MarkTokenPrivateQueryKey>) {
  const [authToken, body] = queryKey
  const url = `${goapiUrl}/tokens/mark-private`
  const resp = await fetch(url, {
    headers: makeAuthHeader(authToken, { 'Content-Type': 'application/json' }),
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data: ResponseOf<1> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return resp.status === 200
}

export async function makeOrder(signedOrder: SignedOrder) {
  const url = `${goapiUrl}/tokens/make-order`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order: signedOrder,
    }),
  })
  const data: ResponseOf<1> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return resp.status === 200
}

export async function fetchOrder(chainId: ChainId, orderHash: string) {
  const url = `${goapiUrl}/tokens/order/${chainId}/${orderHash}`
  const resp = await fetch(url)
  const data: ResponseOf<SignedOrder> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}
