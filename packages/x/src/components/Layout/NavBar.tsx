import { useRouter } from 'next/router'
import { Button } from '@chakra-ui/button'
import { Stack, Spacer, StackProps } from '@chakra-ui/layout'
import Link from 'components/Link'
import { useWeb3React } from '@x/utils'
import AccountMenu from 'components/account/AccountMenu'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import Searchbar from 'components/search/Searchbar'

export default function NavBar(props: StackProps) {
  const { pathname } = useRouter()

  const { active } = useWeb3React()

  function renderLink(label: string, href: string) {
    return (
      <Link href={href} variant={pathname === href ? 'active' : 'inactive'}>
        {label}
      </Link>
    )
  }

  return (
    <Stack as="nav" direction="row" alignItems="center" spacing={2} {...props}>
      <Stack direction="row" spacing={8}>
        {renderLink('Home', '/')}
        {renderLink('Marketplace', '/marketplace')}
      </Stack>
      <Spacer />
      <Searchbar maxW="240px" display={{ base: 'none', sm: 'block' }} />
      <Stack direction="row">
        <Link href="/mint" variant="button">
          <Button variant="outline" size="md" w={{ base: '100%', md: 'auto' }}>
            Mint
          </Button>
        </Link>
        {active ? <AccountMenu /> : <ConnectWalletButton />}
      </Stack>
    </Stack>
  )
}
