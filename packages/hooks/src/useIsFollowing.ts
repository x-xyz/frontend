import { useEffect, useState } from 'react'
import { useLazyIsFollowingQuery } from '@x/apis'
import { useAuthToken } from './useAuthToken'
import { useToast } from './useToast'

export function useIsFollowing(address?: string | null) {
  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [query, { data, isLoading, error }] = useLazyIsFollowingQuery()

  const [isFollowing, setFollowing] = useState(false)

  const toast = useToast({ title: 'Api' })

  useEffect(() => {
    if (authToken && address) query({ authToken, address })
  }, [authToken, address, query])

  useEffect(() => {
    if (error) toast({ status: 'error', description: 'fetch follow relationship failed' })
  }, [error, toast])

  useEffect(() => {
    if (data?.status === 'success') setFollowing(data.data)
  }, [data])

  return [isFollowing, isLoadingAuthToken || isLoading, setFollowing] as const
}
