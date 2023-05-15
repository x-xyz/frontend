import AccountModalProvider from 'components/account/AccountModalProvider'
import ConnectWalletProvider from 'components/wallet/ConnectWalletProvider'
import SetupGTag from 'ga/SetupGTag'
import { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Provider } from 'react-redux'
import theme from 'theme'

import { ChakraProvider } from '@chakra-ui/react'
import { ActiveWeb3ReactProvider, AuthTokenResolver, UsdPriceResolver } from '@x/hooks'
import { store } from '@x/store'
import HeadMeta from 'components/HeadMeta'

const NProgress = dynamic(() => import('components/NProgress'), { ssr: false })

const NetworkProvider = dynamic(() => import('components/wallet/NetworkProvider'), { ssr: false })

// to prevent SSR interruption
function NetworkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.browser) return <>{children}</>
  return <NetworkProvider>{children}</NetworkProvider>
}

function App({ Component, pageProps }: AppProps) {
  const title = 'BAZAAR'

  const description =
    'Bazaar is One-stop shop for all your BNB Chain NFTs and dedicated to rewarding the community with high earning reward program, community-driven governance, and exclusive NFT LaunchPad.'

  const image = `https://bzr.xyz/assets/card.jpg`

  return (
    <ChakraProvider resetCSS theme={theme}>
      <Provider store={store}>
        <NetworkProviderWrapper>
          <ActiveWeb3ReactProvider>
            <ConnectWalletProvider>
              <AccountModalProvider>
                <AuthTokenResolver />
                <UsdPriceResolver />
                <NProgress />
                <HeadMeta />
                <Component {...pageProps} />
                <SetupGTag />
              </AccountModalProvider>
            </ConnectWalletProvider>
          </ActiveWeb3ReactProvider>
        </NetworkProviderWrapper>
      </Provider>
    </ChakraProvider>
  )
}

export default App
