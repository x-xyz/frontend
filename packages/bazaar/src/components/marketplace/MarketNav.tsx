import { useRouter } from 'next/router'
import { Stack, StackProps } from '@chakra-ui/layout'
import Link, { LinkProps } from 'components/Link'

type MarketNavProps = StackProps

export default function MarketNav({ ...props }: MarketNavProps) {
  return (
    <Stack
      direction="row"
      pb={4}
      mt={8}
      mb={6}
      spacing="60px"
      borderBottomWidth="1px"
      borderBottomColor="primary"
      borderStyle="solid"
      justifyContent={{ base: 'space-evenly', sm: 'flex-start' }}
      {...props}
    >
      <NavItem href="/collections">Collections</NavItem>
      <NavItem href="/assets">Items</NavItem>
    </Stack>
  )
}

function NavItem({ children, href }: LinkProps) {
  const { pathname } = useRouter()

  const isActive = pathname === href

  return (
    <Link
      href={href}
      fontSize={{ base: 'xl', sm: '4xl' }}
      color={isActive ? 'primary' : 'inactive'}
      fontWeight={isActive ? 'bold' : 'normal'}
    >
      {children}
    </Link>
  )
}
