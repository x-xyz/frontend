import { Center } from '@chakra-ui/layout'
import Link, { LinkProps } from 'components/Link'
import { useRouter } from 'next/router'

export interface NavItemProps extends LinkProps {
  noActiveBackground?: boolean
}

export default function NavItem({ children, href, noActiveBackground, ...props }: NavItemProps) {
  const { asPath } = useRouter()

  const path = typeof href === 'string' ? href : href?.href

  const isActive = path && asPath.startsWith(path)

  return (
    <Link
      href={href}
      bg={
        isActive && !noActiveBackground
          ? 'linear-gradient(150.71deg, #C471ED -30.38%, #F7797D 41.23%, rgba(251, 215, 134, 0.81) 115.2%);'
          : undefined
      }
      w={{ base: 'fit-content', lg: '50px' }}
      h="50px"
      borderRadius="50px"
      disabled={!href}
      px={{ base: 6, lg: 'initial' }}
      {...props}
    >
      <Center w="100%" h="100%">
        {children}
      </Center>
    </Link>
  )
}
