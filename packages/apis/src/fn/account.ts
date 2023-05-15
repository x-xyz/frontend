import { QueryFunctionContext } from 'react-query'

import { goapiUrl } from '@x/constants'
import {
  Account,
  AccountCollectionSummary,
  AccountOrderNonce,
  AccountStat,
  ActivitiesResult,
  ActivityTypeV2,
  ChainId,
  CollectionWithAccountStat,
  CreateFolderPayload,
  Folder,
  NftItem,
  PatchableAccount,
  PendingOffersResult,
  ResponseOf,
  UpdateFolderPayload,
} from '@x/models'

import { checkResponse, makeAuthHeader, makeQuery } from '../utils'

export type FetchAccountQueryKey = [cacheKey: string, account: string]

export async function fetchAccountV2({ queryKey }: QueryFunctionContext<FetchAccountQueryKey>) {
  const [, address] = queryKey
  const url = `${goapiUrl}/account/${address}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<Account> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function fetchAccount(address: string) {
  const url = `${goapiUrl}/account/${address}`
  const resp = await fetch(url)
  const data = await resp.json()
  return data as ResponseOf<Account>
}

export type UpdateAccountQueryKey = [authToken: string, params: PatchableAccount & { signature: string }]

export async function updateAccount({ queryKey }: QueryFunctionContext<UpdateAccountQueryKey>) {
  const [authToken, params] = queryKey
  const url = `${goapiUrl}/account`
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: makeAuthHeader(authToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(params),
  })
  await checkResponse(resp)
  const data: ResponseOf<Account> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function fetchNonce(authToken: string) {
  const url = `${goapiUrl}/account/nonce`
  const resp = await fetch(url, { method: 'POST', headers: makeAuthHeader(authToken) })
  await checkResponse(resp)
  const data: ResponseOf<number> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchAccountFoldersQueryKey = [cacheKey: string, account: string, params: { authToken?: string }]

export async function fetchAccountFolders({ queryKey }: QueryFunctionContext<FetchAccountFoldersQueryKey>) {
  const [, account, { authToken }] = queryKey
  const url = `${goapiUrl}/account/${account}/folders`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  await checkResponse(resp)
  const data: ResponseOf<Folder[]> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchAccountFolderQueryKey = [
  cacheKey: string,
  account: string,
  folderId: string,
  params: { authToken?: string },
]

export async function fetchAccountFolder({ queryKey }: QueryFunctionContext<FetchAccountFolderQueryKey>) {
  const [, account, folderId, { authToken }] = queryKey
  const url = `${goapiUrl}/account/${account}/folder/${folderId}`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  await checkResponse(resp)
  const data: ResponseOf<Folder> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function fetchAccountFolderNfts({ queryKey }: QueryFunctionContext<FetchAccountFolderQueryKey>) {
  const [, account, folderId, { authToken }] = queryKey
  const url = `${goapiUrl}/account/${account}/folder/${folderId}/nfts`
  const resp = await fetch(url, { headers: makeAuthHeader(authToken) })
  await checkResponse(resp)
  const data: ResponseOf<NftItem[]> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type CreateAccountFolderQueryKey = [
  authToken: string,
  account: string,
  payload: CreateFolderPayload & { signature: string },
]

export async function createAccountFolder({ queryKey }: QueryFunctionContext<CreateAccountFolderQueryKey>) {
  const [authToken, account, payload] = queryKey
  const url = `${goapiUrl}/account/${account}/folders`
  const resp = await fetch(url, {
    method: 'POST',
    headers: makeAuthHeader(authToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })
  await checkResponse(resp)
  const data: ResponseOf<{ folderId: string }> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type UpdateAccountFolderQueryKey = [
  authToken: string,
  account: string,
  folderId: string,
  payload: UpdateFolderPayload & { signature: string },
]

export async function updateAccountFolder({ queryKey }: QueryFunctionContext<UpdateAccountFolderQueryKey>) {
  const [authToken, account, folderId, payload] = queryKey
  const url = `${goapiUrl}/account/${account}/folder/${folderId}`
  const resp = await fetch(url, {
    method: 'PUT',
    headers: makeAuthHeader(authToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })
  await checkResponse(resp)
  const data: ResponseOf<''> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchAccountStatQueryKey = [cacheKey: string, account: string]

export async function fetchAccountStat({ queryKey }: QueryFunctionContext<FetchAccountStatQueryKey>) {
  const [, account] = queryKey
  const url = `${goapiUrl}/account/${account}/stat`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<AccountStat> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type DeleteAccountFolderQueryKey = [
  account: string,
  folderId: string,
  payload: { authToken: string; signature: string },
]

export async function deleteAccountFolder({ queryKey }: QueryFunctionContext<DeleteAccountFolderQueryKey>) {
  const [account, folderId, { authToken, ...body }] = queryKey
  const url = `${goapiUrl}/account/${account}/folder/${folderId}`
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: makeAuthHeader(authToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  await checkResponse(resp)
  const data: ResponseOf<''> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export interface FetchAccountActivityParams {
  limit?: number
  chainId?: ChainId
  contract?: string
  tokenId?: string
  types?: ActivityTypeV2[]
}

export type FetchAccountActivityQueryKey = [cacheKey: string, account: string, params?: FetchAccountActivityParams]

export async function fetchAccountActivity({
  queryKey,
  pageParam,
}: QueryFunctionContext<FetchAccountActivityQueryKey>) {
  const [, account, params] = queryKey
  const url = `${goapiUrl}/account/${account}/activities?${makeQuery({ ...params, offset: pageParam })}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<ActivitiesResult> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchPendingOffersQueryKey = [
  cacheKey: string,
  account: string,
  params?: { limit?: number; chainId?: ChainId; contract?: string; tokenId?: string },
]

export async function fetchPendingOffers({ queryKey }: QueryFunctionContext<FetchPendingOffersQueryKey>) {
  const [, account, params = {}] = queryKey
  const url = `${goapiUrl}/account/${account}/pending-offers?${makeQuery(params)}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<PendingOffersResult> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchCollectionWithAccountStatQueryKey = [
  cacheKey: string,
  account: string,
  chainId: ChainId,
  contract: string,
]

export async function fetchCollectionWithAccountStat({
  queryKey,
}: QueryFunctionContext<FetchCollectionWithAccountStatQueryKey>) {
  const [, account, chainId, contract] = queryKey
  const url = `${goapiUrl}/account/${account}/collection/${chainId}/${contract}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<CollectionWithAccountStat> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchCollectionSummaryQueryKey = [cacheKey: string, account: string]

export async function fetchCollectionSummary({ queryKey }: QueryFunctionContext<FetchCollectionSummaryQueryKey>) {
  const [, account] = queryKey
  const url = `${goapiUrl}/account/${account}/collection-summary`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<AccountCollectionSummary> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type FetchAccountOrderNonceParams = {
  account: string
  chainId: ChainId
  authToken: string
}

export async function fetchAccountOrderNonce(account: string, chainId: ChainId, authToken: string) {
  const url = `${goapiUrl}/account/${account}/orderNonce/${chainId}`
  const resp = await fetch(url, {
    headers: makeAuthHeader(authToken, { 'Content-Type': 'application/json' }),
  })
  await checkResponse(resp)
  const data: ResponseOf<AccountOrderNonce> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}
