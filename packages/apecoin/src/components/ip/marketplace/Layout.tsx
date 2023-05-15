import { Radio, RadioGroup } from '@chakra-ui/radio'
import ParentLayout from 'components/Layout'
import Link from 'components/Link'
import { useRouter } from 'next/router'

import { Center, Container, Grid, GridItem, GridProps, Heading, Stack, StackProps, Text } from '@chakra-ui/react'

export interface LayoutProps extends StackProps {
  desktop: boolean
  side: string
  templateColumns?: GridProps['templateColumns']
  appendNav?: React.ReactChild
}

export default function Layout({ desktop, side, children, templateColumns, appendNav, ...props }: LayoutProps) {
  const { asPath, replace } = useRouter()

  return (
    <ParentLayout>
      <Stack h="full" spacing={0} pt={5} {...props}>
        <Center borderBottom={desktop ? '1px solid' : 'none'} borderColor="divider">
          <Container maxW="container.xl" px={{ base: 0, lg: 4 }}>
            <Grid w="full" templateColumns={templateColumns} columnGap={5}>
              <GridItem />
              <GridItem>
                {desktop ? (
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
                ) : (
                  <RadioGroup defaultValue={side === 'buy' ? '1' : '2'}>
                    <Stack>
                      <Radio value="1" onChange={() => replace('/ip/marketplace/buy')}>
                        <Text fontWeight="bold">Listings for Available IP</Text>
                      </Radio>
                      <Radio value="2" onChange={() => replace('/ip/marketplace/sell')} fontWeight="bold">
                        <Text fontWeight="bold">Listings for IP Wanted</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                )}
              </GridItem>
            </Grid>
          </Container>
        </Center>
        <Center flexGrow={1}>
          <Container maxW="container.xl" h="full" px={{ base: 0, lg: 4 }}>
            {children}
          </Container>
        </Center>
      </Stack>
    </ParentLayout>
  )
}
