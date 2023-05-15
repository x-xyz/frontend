import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import { ResponseOf } from '@x/models'

export const vexApi = createApi({
  reducerPath: 'vexApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${goapiUrl}/vex`, headers: { 'Content-Type': 'application/json' } }),

  endpoints: builder => ({
    vexApr: builder.query<ResponseOf<number>, { limit?: number }>({
      query: ({ limit }) => ({ url: `/apr`, params: { limit } }),
    }),
  }),
})

export const { useLazyVexAprQuery, useVexAprQuery } = vexApi
