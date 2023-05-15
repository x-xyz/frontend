import AccountPopover from 'components/account/AccountPopover'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import Link from 'components/Link'

import { Box, Center, Container, Image, Spacer, Stack } from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks/dist'

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  return (
    <Center w="full" h="full" bg="panel">
      <Container w="full" h="full" maxW="container.xl">
        <Stack h="full" direction="row" align="center">
          <Link href="https://x.xyz">
            <Image w={10} h={10} src="/assets/logo.svg" />
          </Link>
          <Spacer />
          <Link href="https://x.xyz">Back to X Marketplace</Link>
          <Box w={{ base: 2, lg: 10 }} />
          {account ? <AccountPopover account={account} chainId={chainId} /> : <ConnectWalletButton />}
        </Stack>
      </Container>
    </Center>
  )
}
