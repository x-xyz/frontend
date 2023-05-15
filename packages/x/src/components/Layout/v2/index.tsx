import AccountAvatar from 'components/account/AccountAvatar'
import AccountModalProvider from 'components/account/AccountModalProvider'
import AccountBalance from 'components/account/AccountBalance'
import AccountMenu from 'components/account/AccountMenu'
// import { CommunityIcon } from '@x/components/icons'
import EditProfileButton from 'components/account/EditProfileButton'
import Link from 'components/Link'
import Searchbar from 'components/search/Searchbar'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { layout } from 'theme'

import { Button } from '@chakra-ui/button'
import { Image } from '@chakra-ui/image'
import { Box, GridProps, Heading, Spacer, Stack } from '@chakra-ui/layout'
import { useTheme } from '@chakra-ui/system'
import { getColor, transparentize } from '@chakra-ui/theme-tools'
import { useActiveWeb3React } from '@x/hooks'

import NavItems from './NavItems'
import SocialLinks from './SocialLinks'
import MenuButton from './MenuButton'
import AddTokenToMetaMaskByTokenId from 'components/erc20/AddTokenToMetaMaskByTokenId'
import { useBreakpointValue } from '@chakra-ui/react'

export interface LayoutProps extends Omit<GridProps, 'title'> {
  title?: React.ReactNode
}

export default function Layout({ children, title, ...props }: LayoutProps) {
  const { account } = useActiveWeb3React()

  const theme = useTheme()

  const breakpoint = 'lg'

  const isMobile = useBreakpointValue({ base: true, [breakpoint]: false })

  function renderTitle() {
    if (typeof title === 'string')
      return (
        <Heading lineHeight={1.8} fontSize={{ base: 'lg', lg: '4xl' }} whiteSpace="nowrap">
          {title}
        </Heading>
      )

    return title
  }

  function renderTopbar() {
    return (
      <Stack
        direction="row"
        h={layout.headerHeight}
        pos="sticky"
        zIndex="sticky"
        top={0}
        right={0}
        py={6}
        bg={transparentize(getColor(theme, 'background'), 0.7)(theme)}
        spacing={4}
        align="center"
      >
        {isMobile && (
          <>
            <Link href="/">
              <Image src="/assets/logo.svg" width="36px" height="36px" />
            </Link>
            <Spacer />
          </>
        )}
        {renderTitle()}
        <Spacer />
        <Searchbar size="sm" maxW="300px" display={{ base: 'none', [breakpoint]: 'block' }} />
        <Link href="/docs" display={{ base: 'none', [breakpoint]: 'block' }}>
          <Button>Learn</Button>
        </Link>
        <AddTokenToMetaMaskByTokenId
          tokenId="X"
          aria-label="Add X to MetaMask"
          flexShrink={0}
          display={{ base: 'none', [breakpoint]: 'block' }}
        />
        {!account && <ConnectWalletButton variant="primary" display={{ base: 'none', [breakpoint]: 'block' }} />}
        <Box display={{ base: 'none', [breakpoint]: 'block' }}>
          <AccountMenu>
            <AccountBalance as="div" />
          </AccountMenu>
        </Box>
        <MenuButton display={{ [breakpoint]: 'none' }} />
      </Stack>
    )
  }

  function renderSidebar() {
    return (
      <Box display={{ base: 'none', [breakpoint]: 'block' }}>
        <Stack
          h="100%"
          w={layout.sidebarWidth}
          boxShadow="inset 0px 0px 17px -3px #E5E5E5"
          borderRadius="3px"
          position="fixed"
          left={-4}
          pl={4}
          pt={16}
          pb={8}
          alignItems="center"
          spacing={8}
        >
          <Link href="/">
            <Image src="/assets/logo.svg" width="36px" height="36px" />
          </Link>
          <Spacer maxH={20} />
          {account && (
            <EditProfileButton
              icon={<AccountAvatar account={account} w="48px" h="48px" />}
              variant="unstyled"
              minW="fit-content"
            />
          )}
          <NavItems />
          <Spacer />
          <SocialLinks />
        </Stack>
        <Box w={layout.sidebarWidth} flexShrink={0} />
      </Box>
    )
  }

  return (
    <AccountModalProvider>
      <Stack
        w="100%"
        minH="100vh"
        direction="row"
        bg="linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),url(/assets/bg-x.png),url(/assets/bg-x.png),url(/assets/bg-x.png),#000722"
        bgSize="100%,1200px,1000px, 1200px"
        bgPos="top left,top left,top 2100px left -100px, top 3400px right -200px"
        bgRepeat="no-repeat"
        spacing={{ base: 0, [breakpoint]: 2 }}
        {...props}
      >
        {renderSidebar()}
        <Stack h="fit-content" minH="100vh" maxW="100%" flexGrow={1} px={{ base: 2, xl: '64px' }}>
          {renderTopbar()}
          <Box flexGrow={1}>{children}</Box>
        </Stack>
      </Stack>
    </AccountModalProvider>
  )
}
