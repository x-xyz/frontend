import { useRouter } from 'next/router'
import { Center, CenterProps } from '@chakra-ui/react'
import Link, { LinkProps } from 'components/Link'

export type NavBarProps = CenterProps

export function NavBar({ children, ...props }: NavBarProps) {
  return (
    <Center w="full" borderBottom="1px solid" borderColor="divider" fontWeight="extrabold" {...props}>
      {children}
    </Center>
  )
}

export type NavLinkProps = LinkProps & { matchRoute?: string; isActive?: boolean }

export function NavLink({ children, href, matchRoute = `${href}`, isActive, ...props }: NavLinkProps) {
  const { pathname } = useRouter()
  const active = isActive || pathname.startsWith(matchRoute)
  return (
    <Link href={href} {...props}>
      <Center h="full" p={6} borderBottom={active ? '4px solid' : void 0} borderColor={active ? 'primary' : void 0}>
        {children}
      </Center>
    </Link>
  )
}
