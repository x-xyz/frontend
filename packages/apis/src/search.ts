import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import { ResponseOf, SearchResult } from '@x/models'

export const searchApiV2 = createApi({
  reducerPath: 'searchApiV2',
  baseQuery: fetchBaseQuery({ baseUrl: goapiUrl, headers: { 'Content-Type': 'application/json' } }),
  endpoints: builder => ({
    search: builder.query<ResponseOf<SearchResult>, { keyword: string }>({
      query: ({ keyword }) => ({ url: '/search', params: { keyword } }),
    }),
  }),
})

export const { useLazySearchQuery, useSearchQuery } = searchApiV2
