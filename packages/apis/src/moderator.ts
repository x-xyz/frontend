import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import { Moderator, ResponseOf, AuthPayload, SignaturePayload } from '@x/models'

export const moderatorApiV2 = createApi({
  reducerPath: 'moderatorApiV2',
  baseQuery: fetchBaseQuery({ baseUrl: goapiUrl, headers: { 'Content-Type': 'application/json' } }),

  endpoints: builder => ({
    moderators: builder.query<ResponseOf<Moderator[]>, AuthPayload>({
      query: ({ authToken }) => ({ url: '/moderators', headers: { Authorization: `Bearer ${authToken}` } }),
    }),

    addModerator: builder.mutation<ResponseOf<void>, Moderator & AuthPayload & SignaturePayload>({
      query: ({ authToken, ...body }) => ({
        method: 'POST',
        url: '/moderators/add',
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    removeModerator: builder.mutation<ResponseOf<void>, { address: string } & AuthPayload & SignaturePayload>({
      query: ({ authToken, ...body }) => ({
        method: 'POST',
        url: '/moderators/remove',
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),
  }),
})

export const { useAddModeratorMutation, useLazyModeratorsQuery, useModeratorsQuery, useRemoveModeratorMutation } =
  moderatorApiV2
