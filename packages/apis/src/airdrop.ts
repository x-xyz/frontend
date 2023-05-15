import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import { ResponseOf, ChainId, Airdrop, Proof } from '@x/models'

export const airdropApi = createApi({
  reducerPath: 'airdropApi',
  baseQuery: fetchBaseQuery({ baseUrl: goapiUrl, headers: { 'Content-Type': 'application/json' } }),

  endpoints: builder => ({
    airdrops: builder.query<ResponseOf<Airdrop[]>, void>({
      query: () => ({ url: '/airdrops', params: { limit: 100 } }),
    }),
    proofs: builder.query<ResponseOf<Proof[]>, { chainId: ChainId; contract: string; claimer: string }>({
      query: ({ chainId, contract, claimer }) => ({
        url: '/proofs',
        params: { limit: 100, chainId, contractAddress: contract, claimer },
      }),
    }),
  }),
})

export const { useAirdropsQuery, useProofsQuery, useLazyAirdropsQuery, useLazyProofsQuery } = airdropApi
