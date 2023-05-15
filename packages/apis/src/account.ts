import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { goapiUrl } from '@x/constants'
import {
  NotificationSettings,
  ResponseOf,
  Account,
  ActivitiesResult,
  AccountStat,
  PatchableAccount,
  PendingOffersResult,
  SearchActivitiesParams,
  SearchPendingOffersParams,
  Like,
  AuthPayload,
  SignaturePayload,
} from '@x/models'

export const accountApiV2 = createApi({
  reducerPath: 'accountApiV2',
  baseQuery: fetchBaseQuery({ baseUrl: `${goapiUrl}/account`, headers: { 'Content-Type': 'application/json' } }),

  endpoints: builder => ({
    account: builder.query<ResponseOf<Account>, { address: string }>({
      query: ({ address }) => ({ url: `/${address}` }),
      keepUnusedDataFor: 3600,
    }),

    updateAccount: builder.mutation<
      ResponseOf<Account>,
      AuthPayload & SignaturePayload & PatchableAccount & { imgData?: string }
    >({
      query: ({ authToken, ...body }) => ({
        method: 'PATCH',
        url: '',
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    updateAvatar: builder.mutation<ResponseOf<string>, { imgData: File | string } & AuthPayload & SignaturePayload>({
      query: ({ imgData, signature, signatureAddress, authToken }) => {
        const body = new FormData()
        body.append('imgData', imgData)
        body.append('signature', signature)
        body.append('signatureAddress', signatureAddress)
        return { method: 'PATCH', url: `/avatar`, body, headers: { Authorization: `Bearer ${authToken}` } }
      },
    }),

    updateBanner: builder.mutation<ResponseOf<string>, { imgData: File | string } & AuthPayload & SignaturePayload>({
      query: ({ imgData, signature, signatureAddress, authToken }) => {
        const body = new FormData()
        body.append('imgData', imgData)
        body.append('signature', signature)
        body.append('signatureAddress', signatureAddress)
        return { method: 'PATCH', url: `/banner`, body, headers: { Authorization: `Bearer ${authToken}` } }
      },
    }),

    nonce: builder.mutation<ResponseOf<number>, AuthPayload>({
      query: ({ authToken }) => ({
        method: 'POST',
        url: `/nonce`,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    likeds: builder.query<ResponseOf<Like>, { address: string }>({
      query: ({ address }) => ({ url: `/${address}/liked` }),
    }),

    followers: builder.query<ResponseOf<Account[]>, { address: string }>({
      query: ({ address }) => ({ url: `/${address}/followers` }),
    }),

    followings: builder.query<ResponseOf<Account[]>, { address: string }>({
      query: ({ address }) => ({ url: `/${address}/followings` }),
    }),

    isFollowing: builder.query<ResponseOf<boolean>, { address: string } & AuthPayload>({
      query: ({ address, authToken }) => ({
        url: `/${address}/follow`,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    follow: builder.mutation<ResponseOf<void>, { address: string } & AuthPayload>({
      query: ({ address, authToken }) => ({
        method: 'POST',
        url: `/${address}/follow`,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    unfollow: builder.mutation<ResponseOf<void>, { address: string } & AuthPayload>({
      query: ({ address, authToken }) => ({
        method: 'DELETE',
        url: `/${address}/follow`,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    notificationSettings: builder.query<ResponseOf<NotificationSettings>, AuthPayload>({
      query: ({ authToken }) => ({ url: `/settings/notification`, headers: { Authorization: `Bearer ${authToken}` } }),
    }),

    updateNotificationSettings: builder.mutation<
      ResponseOf<NotificationSettings>,
      AuthPayload & NotificationSettings & SignaturePayload
    >({
      query: ({ authToken, ...body }) => ({
        method: 'PUT',
        url: `/settings/notification`,
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    banAccount: builder.mutation<
      ResponseOf<{ successes: string[]; fails: string[] }>,
      { addresses: string[] } & AuthPayload & SignaturePayload
    >({
      query: ({ authToken, ...body }) => ({
        method: 'POST',
        url: `/ban`,
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    unbanAccount: builder.mutation<
      ResponseOf<{ successes: string[]; fails: string[] }>,
      { addresses: string[] } & AuthPayload & SignaturePayload
    >({
      query: ({ authToken, ...body }) => ({
        method: 'POST',
        url: `/unban`,
        body,
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    activities: builder.query<ResponseOf<ActivitiesResult>, { address: string } & SearchActivitiesParams>({
      query: ({ address, ...params }) => ({ url: `/${address}/activities`, params }),
    }),

    pendingOffers: builder.query<ResponseOf<PendingOffersResult>, { address: string } & SearchPendingOffersParams>({
      query: ({ address, ...params }) => ({ url: `/${address}/pending-offers`, params }),
    }),

    accountStat: builder.query<ResponseOf<AccountStat>, { address: string }>({
      query: ({ address }) => ({ url: `/${address}/stat` }),
    }),
  }),
})

export const {
  useAccountQuery,
  useLazyAccountQuery,
  useLazyLikedsQuery,
  useLikedsQuery,
  useNonceMutation,
  useUpdateAccountMutation,
  useFollowersQuery,
  useFollowingsQuery,
  useLazyFollowersQuery,
  useLazyFollowingsQuery,
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
  useLazyNotificationSettingsQuery,
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useFollowMutation,
  useUnfollowMutation,
  useBanAccountMutation,
  useUnbanAccountMutation,
  useIsFollowingQuery,
  useLazyIsFollowingQuery,
  useLazyActivitiesQuery,
  useLazyPendingOffersQuery,
  useAccountStatQuery,
} = accountApiV2
