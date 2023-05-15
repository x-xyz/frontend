import { useEffect } from 'react'
import { useAppDispatch, useAppSelector, setAuthToken, setLoadingAuthToken } from '@x/store'
import { useLazySignQuery } from '@x/apis'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useToast } from './useToast'
import cookie from 'cookie'

export function useAuthToken() {
  const token = useAppSelector(s => s.app.authToken) || getAuthTokenFromCookie()

  const isLoading = useAppSelector(s => s.app.isLoadingAuthToken)

  return [token, isLoading] as const
}

export function AuthTokenResolver() {
  const toast = useToast({ title: 'Auth token' })

  const dispatch = useAppDispatch()

  const { account } = useActiveWeb3React()

  const [query, { data, isLoading, error }] = useLazySignQuery()

  useEffect(() => {
    if (!account) return
    query({ address: account })
  }, [dispatch, account, query])

  useEffect(() => {
    if (data && data.status === 'success') {
      dispatch(setAuthToken(data.data))
    }
  }, [data, dispatch])

  useEffect(() => {
    dispatch(setLoadingAuthToken(isLoading))
  }, [isLoading, dispatch])

  useEffect(() => {
    if (error) toast({ status: 'error', description: 'fetch auth token failed' })
  }, [error, toast])

  return null
}

function getAuthTokenFromCookie() {
  if (!process.browser) return ''
  return cookie.parse(document.cookie)['auth-token'] || ''
}
