import { useRouter } from 'next/router'
import { Button } from '@chakra-ui/button'
import { Stack, Spacer, StackProps } from '@chakra-ui/layout'
import Link from 'components/Link'
import { useWeb3React } from '@x/utils'
import AccountMenu from 'components/account/AccountMenu'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import Searchbar from 'components/Searchbar'
import ExploreMenu from './ExploreMenu'

export default function NavBar(props: StackProps) {
  const { pathname } = useRouter()

  const { active } = useWeb3React()

  function renderLink(label: string, href: string) {
    const isActive = pathname === href

    return (
      <Link href={href} variant={isActive ? 'active' : 'inactive'} fontWeight={isActive ? 'bold' : 'normal'}>
        {label}
      </Link>
    )
  }

  return (
    <Stack as="nav" direction="row" alignItems="center" spacing={2} {...props}>
      <Stack direction="row" spacing={8} alignItems="center">
        {renderLink('Home', '/')}
        <ExploreMenu />
        {renderLink('Listing', '/collection/register')}
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
