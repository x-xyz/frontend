import { CollectionWithTradingVolume, TopCollectionParams } from '@x/models/dist'
import { QueryFunctionContext } from 'react-query'
import { goapiUrl } from '@x/constants'
import {
  Collection,
  ResponseOf,
  CollectionIdentityParams,
  SearchCollectionParams,
  ChainId,
  TradingVolumePeriod,
  TradingVolume,
  TwelvefoldItem,
  TwelvefoldCollectionParams,
} from '@x/models'
import { checkResponse, makeQuery, makeAuthHeader } from '../utils'
import { FetchTokensQueryKey } from './token'

export async function fetchCollection({ chainId, contract }: CollectionIdentityParams) {
  const url = `${goapiUrl}/collection/${chainId}/${contract}`
  const resp = await fetch(url)
  const data = await resp.json()
  return data as ResponseOf<Collection>
}

export type FetchCollectionQueryKey = [cacheKey: string, chainId: ChainId, contract: string]

export async function fetchCollectionV2({ queryKey }: QueryFunctionContext<FetchCollectionQueryKey>) {
  const [, chainId, contract] = queryKey
  const url = `${goapiUrl}/collection/${chainId}/${contract}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<Collection> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchCollectionsQueryKey = [cacheKey: string, params: SearchCollectionParams]

export async function fetchCollections({
  queryKey,
  pageParam,
}: QueryFunctionContext<FetchCollectionsQueryKey, number>) {
  const [, { authToken, ...params }] = queryKey
  const url = `${goapiUrl}/collections?${makeQuery({ ...params, offset: pageParam, isPaging: true })}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  await checkResponse(resp)
  const data: ResponseOf<{ items: Collection[]; count: number }> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchCollectionTradingVolumeQueryKey = [
  cacheKey: string,
  chainId: ChainId,
  contract: string,
  period: TradingVolumePeriod,
]

export async function fetchCollectionTradingVolume({
  queryKey,
}: QueryFunctionContext<FetchCollectionTradingVolumeQueryKey>) {
  const [, chainId, contract, period] = queryKey
  const url = `${goapiUrl}/collection/${chainId}/${contract}/volume?${makeQuery({ period })}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<TradingVolume> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function fetchTopCollection(query: TopCollectionParams) {
  const url = `${goapiUrl}/collections/top?${makeQuery(query)}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<CollectionWithTradingVolume[]> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchTwelvefoldCollectionQueryKey = [cacheKey: string, params: TwelvefoldCollectionParams]

export async function fetchTwelvefoldCollection({
  queryKey,
  pageParam,
}: QueryFunctionContext<FetchTwelvefoldCollectionQueryKey, number>) {
  const query = queryKey[1]
  const url = `${goapiUrl}/twelvefold?${makeQuery({ offset: pageParam, ...query })}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<TwelvefoldItem[]> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}
