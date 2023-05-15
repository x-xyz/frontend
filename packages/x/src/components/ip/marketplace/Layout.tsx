import ParentLayout from 'components/Layout/v3'
import Link from 'components/Link'
import { useRouter } from 'next/router'

import { Center, Container, Grid, GridItem, GridProps, Heading, Stack, StackProps } from '@chakra-ui/react'

export interface LayoutProps extends StackProps {
  templateColumns?: GridProps['templateColumns']
  appendNav?: React.ReactChild
}

export default function Layout({ children, templateColumns, appendNav, ...props }: LayoutProps) {
  const { asPath } = useRouter()
  return (
    <ParentLayout>
      <Stack h="full" spacing={0} pt={5} {...props}>
        <Center borderBottom="1px solid" borderColor="divider">
          <Container maxW="container.xl">
            <Grid w="full" templateColumns={templateColumns} columnGap={5}>
              <GridItem />
              <GridItem>
                <Stack direction="row" align="flex-end" fontWeight="extrabold" spacing={10}>
                  <Link
                    pb={5}
                    borderBottom="4px solid"
                    borderColor={asPath === '/ip/marketplace/buy' ? 'primary' : 'transparent'}
                    href="/ip/marketplace/buy"
                  >
                    Listings for Available IP
                  </Link>
                  <Link
                    pb={5}
                    borderBottom="4px solid"
                    borderColor={asPath === '/ip/marketplace/sell' ? 'primary' : 'transparent'}
                    href="/ip/marketplace/sell"
                  >
                    Listings for IP Wanted
                  </Link>
                  {appendNav}
                </Stack>
              </GridItem>
            </Grid>
          </Container>
        </Center>
        <Center flexGrow={1}>
          <Container maxW="container.xl" h="full" px={{ base: 0, md: 4 }}>
            {children}
          </Container>
        </Center>
      </Stack>
    </ParentLayout>
  )
}
