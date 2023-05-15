import { useActiveWeb3React } from '@x/hooks'
import ParentLayout from 'components/Layout'
import { Stack, Center, Container, Grid, GridItem, Text, StackProps } from '@chakra-ui/react'

const breakpoint = 'lg'

export type LayoutProps = StackProps

export function Layout({ children, ...props }: LayoutProps) {
  const { account } = useActiveWeb3React()

  return (
    <ParentLayout>
      <Stack h="full" spacing={0} pt={5} {...props}>
        {account && (
          <Center borderBottom="1px solid" borderColor="divider">
            <Container maxW="container.xl">
              <Grid w="full" templateColumns="380px 1fr" columnGap={5}>
                <GridItem display="flex" alignItems="flex-end">
                  <Text pb={5} fontWeight="extrabold" borderBottom="4px solid" borderColor="primary">
                    01. Collection Approval
                  </Text>
                </GridItem>
                <GridItem display="flex" alignItems="flex-end">
                  <Text pb={5} fontWeight="extrabold" borderBottom="4px solid" borderColor="primary">
                    02. NFT Listing
                  </Text>
                </GridItem>
              </Grid>
            </Container>
          </Center>
        )}
        <Center flexGrow={1}>
          <Container maxW="container.xl" h="full">
            {children}
          </Container>
        </Center>
      </Stack>
    </ParentLayout>
  )
}

export function MobileLayout({ children }: LayoutProps) {
  return <ParentLayout>{children}</ParentLayout>
}
