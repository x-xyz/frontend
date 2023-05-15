import 'isomorphic-fetch'

import { QueryFunctionContext } from 'react-query'

import { goapiUrl } from '@x/constants'
import { ExternalListing, ResponseOf } from '@x/models'

import { checkResponse } from '../utils'

export * from './token'
export * from './collection'
export * from './account'

export type SignQueryKey = [address: string]

export async function sign({ queryKey }: QueryFunctionContext<SignQueryKey>) {
  const [address] = queryKey
  const url = `${goapiUrl}/auth/sign`
  const resp = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ address }),
    headers: { 'Content-Type': 'application/json' },
  })
  await checkResponse(resp)
  const data: ResponseOf<string> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export type ExternalListingsKey = [cacheKey: string, account: string]

export async function fetchExternalListings({ queryKey }: QueryFunctionContext<ExternalListingsKey>) {
  const [, account] = queryKey
  const url = `${goapiUrl}/external-listings/${account}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<ExternalListing[]> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}

export async function refreshExternalListings(account: string) {
  const url = `${goapiUrl}/external-listings/${account}/refresh`
  const resp = await fetch(url, { method: 'POST' })
  await checkResponse(resp)
  const data: ResponseOf<null> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
}
