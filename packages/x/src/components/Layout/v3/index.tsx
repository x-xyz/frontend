import { ChakraProvider, Grid, GridItem, GridProps } from '@chakra-ui/react'
import AccountModalProvider from 'components/account/AccountModalProvider'
import ConnectWalletProvider from 'components/wallet/ConnectWalletProvider'
import theme from 'theme/v3'
import themeV4 from 'theme/v4'
import layout from 'theme/v3/layout'
import Fonts from './Fonts'
import DefaultHeader from './Header'
import HeaderV4 from 'components/Layout/v4/Header'
import Footer from './Footer'

export interface LayoutProps extends GridProps {
  components?: {
    Header?: React.JSXElementConstructor<{}> // eslint-disable-line @typescript-eslint/ban-types
  }
}

export default function Layout({ children, components: { Header = HeaderV4 } = {} }: LayoutProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <AccountModalProvider>
        <ConnectWalletProvider>
          <Fonts />
          <Grid
            w="100vw"
            minH="100vh"
            gridTemplateColumns="1fr"
            templateRows={`${layout.headerHeight} 1fr auto`}
            bg="background"
          >
            <GridItem pos="sticky" top={0} zIndex="sticky">
              <ChakraProvider resetCSS theme={themeV4}>
                <Header />
              </ChakraProvider>
            </GridItem>
            <GridItem overflow="hidden">{children}</GridItem>
            <GridItem>
              <Footer />
            </GridItem>
          </Grid>
        </ConnectWalletProvider>
      </AccountModalProvider>
    </ChakraProvider>
  )
}
