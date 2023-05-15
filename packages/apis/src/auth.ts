import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import { ResponseOf } from '@x/models'

export const authApiV2 = createApi({
  reducerPath: 'authApiV2',
  baseQuery: fetchBaseQuery({ baseUrl: `${goapiUrl}/auth`, headers: { 'Content-Type': 'application/json' } }),
  endpoints: builder => ({
    sign: builder.query<ResponseOf<string>, { address: string }>({
      query: ({ address }) => ({ method: 'post', url: '/sign', body: { address } }),
      keepUnusedDataFor: 12 * 60 * 60, // keep for 12 hours
    }),
  }),
})

export const { useLazySignQuery, useSignQuery } = authApiV2
