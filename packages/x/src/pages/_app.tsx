import ConnectWalletProvider from 'components/wallet/ConnectWalletProvider'
import * as ga from 'ga'
import SetupGTag from 'ga/SetupGTag'
import { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import theme from 'theme'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { ChakraProvider } from '@chakra-ui/provider'
import { RouterScrollProvider } from '@moxy/next-router-scroll'
import { ActiveWeb3ReactProvider, AuthTokenResolver, UsdPriceResolver } from '@x/hooks'
import { store } from '@x/store'
import { goapiUrl } from '@x/constants/dist'

const NProgress = dynamic(() => import('components/NProgress'), { ssr: false })

const NetworkProvider = dynamic(() => import('components/wallet/NetworkProvider'), { ssr: false })

// to prevent SSR interruption
function NetworkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.browser) return <>{children}</>
  return <NetworkProvider>{children}</NetworkProvider>
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ctx => {
        const resp = await fetch(`${goapiUrl}${ctx.queryKey[0]}`)
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

  const title = 'X'

  const description = 'X is the first marketplace for the NFT economy, built for Apes by Apes.'

  const image = `https://x.xyz/assets/card.png`
  const twitterImage = `/assets/x_120x120.jpg`

  return (
    <ChakraProvider resetCSS theme={theme}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title key="title">{title}</title>
        <meta key="description" name="description" content={description} />
        <meta key="robots" name="robots" content="index, follow" />
        <meta key="og:title" property="og:title" content={title} />
        <meta key="og:description" property="og:description" content={description} />
        <meta key="og:image" property="og:image" content={image} />
        <meta key="og:url" property="og:url" content={`https://x.xyz`} />
        <meta key="og:site_name" property="og:site_name" content="X" />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="twitter:title" name="twitter:title" content={title} />
        <meta key="twitter:description" name="twitter:description" content={description} />
        <meta key="twitter:image" name="twitter:image" content={twitterImage} />
        <meta key="twitter:card" name="twitter:card" content="summary" />
        <meta key="twitter:site" name="twitter:site" content="@Xdotxyz" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <NetworkProviderWrapper>
            <ActiveWeb3ReactProvider>
              <ConnectWalletProvider>
                <DndProvider backend={HTML5Backend}>
                  <AuthTokenResolver />
                  <UsdPriceResolver />
                  <NProgress />
                  <RouterScrollProvider disableNextLinkScroll={false}>
                    <Component {...pageProps} />
                  </RouterScrollProvider>
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
