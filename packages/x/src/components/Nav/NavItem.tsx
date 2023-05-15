import { Text, Stack } from '@chakra-ui/layout'
import Link, { LinkProps } from 'components/Link'

export interface NavItemProps extends LinkProps {
  active?: boolean
  icon?: React.ReactNode
}

export default function NavItem({ active, children, icon, ...props }: NavItemProps) {
  return (
    <Link px={2} py={4} flexShrink={0} fontWeight="bold" fontSize={{ base: 'xs', md: '20px' }} {...props}>
      <Stack direction="row" align="center">
        {icon}
        <Text color="currentcolor" variant={active ? 'gradient' : undefined} fontWeight="bold">
          {children}
        </Text>
      </Stack>
    </Link>
  )
}
