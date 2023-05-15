import { Box, ChakraProvider, Grid, GridItem, GridProps } from '@chakra-ui/react'
import AccountModalProvider from 'components/account/AccountModalProvider'
import ConnectWalletProvider from 'components/wallet/ConnectWalletProvider'
import theme from 'theme/v4'
import layout from 'theme/v4/layout'
import Fonts from './Fonts'
import DefaultHeader from './Header'
import Footer from './Footer'

export interface LayoutProps extends GridProps {
  components?: {
    Header?: React.JSXElementConstructor<{}> // eslint-disable-line @typescript-eslint/ban-types
  }
  disableTransparentBlackOnBackground?: boolean
}

export default function Layout({
  children,
  components: { Header = DefaultHeader } = {},
  disableTransparentBlackOnBackground,
  ...props
}: LayoutProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <AccountModalProvider>
        <ConnectWalletProvider>
          <Fonts />
          <Grid
            w="100vw"
            minH="100vh"
            templateColumns="1fr"
            templateRows={`${layout.headerHeight} 1fr auto`}
            bg="background"
            bgRepeat="no-repeat"
            bgPos="top center"
            bgSize="contain"
            {...props}
          >
            {!disableTransparentBlackOnBackground && (
              <GridItem w="full" h="full" gridColumn="1/2" gridRow="1/-1" bgColor="rgba(0, 0, 0, 0.8)" />
            )}
            <GridItem pos="sticky" top={0} zIndex="sticky" gridColumn="1/2" gridRow="1/2">
              <Header />
            </GridItem>
            <GridItem overflow="hidden" gridColumn="1/2" gridRow="2/3">
              {children}
            </GridItem>
            <GridItem gridColumn="1/2" gridRow="3/4">
              <Footer />
            </GridItem>
          </Grid>
        </ConnectWalletProvider>
      </AccountModalProvider>
    </ChakraProvider>
  )
}
