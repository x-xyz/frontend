import { useQuery } from 'react-query'
import { sign } from '@x/apis/fn'
import { createContext, useContext, useEffect, useState } from 'react'
import { useActiveWeb3React } from '@x/hooks'

export default function useAuthToken(address?: string) {
  const { account } = useActiveWeb3React()
  const useAddress = account || address
  const { authToken, isLoading, fetchAuthToken } = useContext(Context)
  useEffect(() => {
    fetchAuthToken(useAddress)
  }, [useAddress, fetchAuthToken])
  return [useAddress ? authToken : '', isLoading] as const
}

interface AuthTokenContext {
  authToken: string
  isLoading: boolean
  fetchAuthToken: (address?: string) => void
}

const Context = createContext<AuthTokenContext>({
  authToken: '',
  isLoading: false,
  fetchAuthToken: () => void 0,
})

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const [address, fetchAuthToken] = useState<string>()
  const { data: authToken = '', isLoading } = useQuery([address || ''], sign, {
    enabled: !!address,
    cacheTime: 12 * 86400 * 1000,
  })
  const value: AuthTokenContext = { authToken, isLoading, fetchAuthToken }
  return <Context.Provider value={value}>{children}</Context.Provider>
}
