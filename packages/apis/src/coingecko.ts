import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const coingeckoApi = createApi({
  reducerPath: 'coingeckoApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3', headers: { accept: 'application/json' } }),
  endpoints: builder => ({
    usdPrice: builder.query<Record<string, Record<string, number | undefined> | undefined>, string[]>({
      query: ids => ({ method: 'get', url: '/simple/price', params: { ids: ids.join(','), vs_currencies: 'usd' } }),
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const { useLazyUsdPriceQuery, useUsdPriceQuery } = coingeckoApi
