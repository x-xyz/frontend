import Address from 'components/Address'
import Layout, { LayoutProps } from 'components/Layout'
import Link from 'components/Link'
import { useRouter } from 'next/router'

import {
  Box,
  Center,
  Container,
  Divider,
  Heading,
  IconButton,
  Image,
  Spacer,
  Stack,
  useBreakpointValue,
  useClipboard,
} from '@chakra-ui/react'
import { Account } from '@x/models'

const breakpoint = 'md'

export interface AccountLayoutProps extends LayoutProps {
  account: Account
  actions?: React.ReactNode
}

export default function AccountLayout({ children, account, actions, ...props }: AccountLayoutProps) {
  const { route } = useRouter()

  const url = process.browser ? `${location.origin}${location.pathname}` : ''

  const { onCopy: copyPageUrl } = useClipboard(url)

  const { onCopy: copyAddress } = useClipboard(account.address)

  const useMobileLayout = useBreakpointValue({ base: true, [breakpoint]: false })

  function renderSharingButtons() {
    return (
      <Stack direction="row" justify="center">
        {/* <IconButton
          variant="unstyled"
          icon={<Image src="/assets/icons/ico-copy@2.png" w="40px" h="40px" />}
          aria-label="copy page url"
          onClick={copyPageUrl}
        /> */}
      </Stack>
    )
  }

  return (
    <Layout {...props}>
      <Container maxW="1184px" px={0}>
        <Stack spacing="18px">
          <Stack direction="row" align="center" justify={{ base: 'center', [breakpoint]: 'space-between' }}>
            <Heading fontSize="20px">Portfolio</Heading>
            {!useMobileLayout && renderSharingButtons()}
          </Stack>
          <Stack
            direction="row"
            spacing={5}
            mt={5}
            pos="relative"
            align="center"
            justify={{ base: 'center', [breakpoint]: 'flex-start' }}
          >
            <Address color="#fff">{account.address}</Address>
            <IconButton
              variant="unstyled"
              icon={<Image src="/assets/icons/ico-copy@2.png" w="40px" h="40px" />}
              aria-label="copy account"
              onClick={copyAddress}
            />
          </Stack>
          {useMobileLayout && renderSharingButtons()}
          <Center h="28px">
            <Divider bg="#575757" />
          </Center>
          <Stack
            direction="row"
            sx={{
              '&>a': {
                px: '8px',
                py: '8px',
                color: '#898989',
              },
              '&>a.active': {
                bg: '#1E1E1E',
              },
            }}
            overflowX="auto"
          >
            <Link href={`/account/${account.address}/nfts`} isActive={route.startsWith('/account/[address]/nfts')}>
              NFT
            </Link>
            <Link
              href={`/account/${account.address}/offer-and-listing`}
              isActive={route.startsWith('/account/[address]/offer-and-listing')}
            >
              Offers & Listings
            </Link>
            <Link
              href={`/account/${account.address}/activity`}
              isActive={route.startsWith('/account/[address]/activity')}
            >
              Activity
            </Link>
            <Spacer />
            {actions}
          </Stack>
        </Stack>
        <Box h="24px" />
        {children}
      </Container>
    </Layout>
  )
}
