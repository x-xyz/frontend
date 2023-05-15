import HeadMeta from 'components/HeadMeta'
import ConnectWalletProvider from 'components/wallet/ConnectWalletProvider'
import NetworkProviderWrapper from 'components/wallet/NetworkProviderWrapper'
import { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { QueryClient, QueryClientProvider } from 'react-query'
import theme from 'theme'
import { Provider } from 'react-redux'
import { store } from '@x/store'
import * as ga from 'ga'
import SetupGTag from 'ga/SetupGTag'

import { ChakraProvider } from '@chakra-ui/provider'
import { AuthTokenProvider } from 'hooks/useAuthToken'
import { ActiveWeb3ReactProvider, UsdPriceResolver } from '@x/hooks'
import { goapiUrl } from '@x/constants'

const NProgress = dynamic(() => import('components/NProgress'), { ssr: false })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ctx => {
        const resp = await fetch(`${ctx.queryKey[0]}`)
        return await resp.json()
      },
      // to ensure addresses in queries are consistent
      queryKeyHashFn: queryKey => JSON.stringify(queryKey).toLowerCase(),
      retry: (_, error) => {
        if (`${(error as any).message}`.includes('not found')) return false
        return true
      },
      refetchOnWindowFocus: false,
    },
  },
})

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    function handleRouteChange(url: string) {
      ga.pageview(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router.events])

  return (
    <ChakraProvider resetCSS theme={theme}>
      <HeadMeta />
      <NProgress />
      <QueryClientProvider client={queryClient}>
        {/*todo: remove Provider and UsdPriceResolver*/}
        <Provider store={store}>
          <UsdPriceResolver />
          <NetworkProviderWrapper>
            <ActiveWeb3ReactProvider>
              <ConnectWalletProvider>
                <DndProvider backend={HTML5Backend}>
                  <AuthTokenProvider>
                    <Component {...pageProps} />
                  </AuthTokenProvider>
                  <SetupGTag />
                </DndProvider>
              </ConnectWalletProvider>
            </ActiveWeb3ReactProvider>
          </NetworkProviderWrapper>
        </Provider>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
