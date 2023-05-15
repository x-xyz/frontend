import { Box, Center, Container, Image, Spacer, Stack, useBreakpointValue } from '@chakra-ui/react'
import Searchbar from 'components/search/Searchbar'
import SearchModalButton from 'components/search/SearchModalButton'
import AccountPopover from 'components/account/AccountPopover'
import Nav from './Nav'
import { NavModalButton } from './modals/NavModal'
import { useActiveWeb3React } from '@x/hooks/dist'
import Link from 'components/Link'

export default function Header() {
  const useDesktopView = useBreakpointValue({ base: false, lg: true })

  const { account, chainId } = useActiveWeb3React()

  return (
    <Center w="full" h="full" bg="panel">
      <Container w="full" h="full" maxW="container.xl">
        <Stack h="full" direction="row" align="center">
          <Link href="/">
            <Image w={10} h={10} src="/assets/logo.svg" />
          </Link>
          <Box w={12} />
          {useDesktopView && <Searchbar maxW="380px" />}
          <Spacer />
          {useDesktopView && <Nav flexShrink={0} />}
          {!useDesktopView && (
            <Stack direction="row" spacing={7}>
              <SearchModalButton />
              <NavModalButton />
              {account && <AccountPopover account={account} chainId={chainId} />}
            </Stack>
          )}
        </Stack>
      </Container>
    </Center>
  )
}
