import { useRouter } from 'next/router'
import { Center } from '@chakra-ui/react'
import Link, { LinkProps } from 'components/Link'
import { useActiveWeb3React } from '@x/hooks'

export default function Navbar() {
  const { account } = useActiveWeb3React()
  return (
    <Center w="full" borderBottom="1px solid" borderColor="divider" fontWeight="extrabold">
      <NavLink href="/yuga-collections/nfts">NFTs</NavLink>
      <NavLink href="/yuga-collections/collections">Collections</NavLink>
      {account && (
        <NavLink href={`/yuga-collections/${account}/nfts`} matchRoute="/yuga-collections/[account]/nfts">
          My Eligible NFTs
        </NavLink>
      )}
    </Center>
  )
}

function NavLink({ children, href, matchRoute = `${href}`, ...props }: LinkProps & { matchRoute?: string }) {
  const { pathname } = useRouter()
  const active = pathname.startsWith(matchRoute)
  return (
    <Link href={href} {...props}>
      <Center h="full" p={6} borderBottom={active ? '4px solid' : void 0} borderColor={active ? 'primary' : void 0}>
        {children}
      </Center>
    </Link>
  )
}
