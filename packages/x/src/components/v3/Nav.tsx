import { TriangleDownIcon } from '@chakra-ui/icons'
import { Center, Stack, StackProps } from '@chakra-ui/react'
import Link, { LinkProps } from 'components/Link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Dropdown from './Dropdown'

export type NavBarProps = StackProps

function Bar({ children, ...props }: NavBarProps) {
  return (
    <Stack
      direction="row"
      align="center"
      justify="center"
      borderBottomWidth="1px"
      borderBottomColor="divider"
      spacing={12}
      {...props}
    >
      {children}
    </Stack>
  )
}

export interface NavItemProps extends LinkProps {
  rightElement?: React.ReactNode
  exact?: boolean
  isActive?: boolean
  dropdownItems?: React.ReactNode
}

function Item({ href, children, rightElement, exact, isActive: inputIsActive, dropdownItems, ...props }: NavItemProps) {
  const { asPath } = useRouter()
  const currentPath = useMemo(() => asPath.toLowerCase(), [asPath])
  const itemPath = useMemo(() => {
    if (typeof href === 'string') return href.toLowerCase()
    return href?.pathname?.toLowerCase()
  }, [href])
  const isActive = inputIsActive || (itemPath && (exact ? currentPath === itemPath : currentPath.startsWith(itemPath)))

  function render() {
    const linkElem = (
      <Link href={href} {...props}>
        <Center h="full" py={6} borderBottomWidth={isActive ? 4 : 0} borderBottomColor="primary" fontWeight="extrabold">
          {children}
          {!!dropdownItems && <TriangleDownIcon w={2.5} ml={2} />}
        </Center>
      </Link>
    )

    if (!dropdownItems) return linkElem

    return (
      <Dropdown.List triggerElem={linkElem} trigger="hover">
        {dropdownItems}
      </Dropdown.List>
    )
  }

  return (
    <Stack direction="row" align="center">
      {render()}
      {rightElement}
    </Stack>
  )
}

const Nav = { Bar, Item }

export default Nav
