import { Center, Container, Grid, GridItem, GridProps, Stack } from '@chakra-ui/react'

import Fonts from './Fonts'
import Footer from './Footer'
import Header from './Header'

export type LayoutProps = GridProps

export default function Layout({ children, ...props }: LayoutProps) {
  return (
    <>
      <Fonts />
      <Stack minH="100vh" align="center" spacing={4}>
        <Grid w="full" flexGrow={1} templateRows="auto 1fr auto" {...props}>
          <GridItem as={Center} flexDir="column" bg="background" pos="sticky" zIndex="sticky" top={0}>
            <Header />
          </GridItem>
          <GridItem pb={10} px={{ base: 4, lg: 6, '2xl': 16 }} overflow="auto">
            {children}
          </GridItem>
          <GridItem as={Center}>
            <Container maxW="1200px">
              <Footer px={{ base: 4, lg: 6, '2xl': 16 }} />
            </Container>
          </GridItem>
        </Grid>
      </Stack>
    </>
  )
}
