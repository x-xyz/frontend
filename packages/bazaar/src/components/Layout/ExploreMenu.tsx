import { Menu, MenuButton, MenuItem, MenuList, MenuProps } from '@chakra-ui/menu'
import { Stack, Text } from '@chakra-ui/layout'
import { ChevronDownIcon } from '@chakra-ui/icons'
import Link from 'components/Link'

export type ExploreMenuProps = Omit<MenuProps, 'children'>

export default function ExploreMenu(props: ExploreMenuProps) {
  return (
    <Menu variant="dropdown" {...props}>
      {({ isOpen }) => (
        <>
          <MenuButton borderRadius="10px" fontWeight="bold">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Text
                fontSize="sm"
                color={isOpen ? 'primary' : 'inactive'}
                textShadow={isOpen ? '0px 0px 4px #7FFFFD' : ''}
              >
                Explore
              </Text>
              <ChevronDownIcon color={isOpen ? 'primary' : 'inactive'} />
            </Stack>
          </MenuButton>

          <MenuList>
            <Link href="/collections">
              <MenuItem>Collections</MenuItem>
            </Link>

            <Link href="/assets">
              <MenuItem>Items</MenuItem>
            </Link>
          </MenuList>
        </>
      )}
    </Menu>
  )
}
