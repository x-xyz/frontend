import AccountAvatar from 'components/account/AccountAvatar'
import EditProfileButton from 'components/account/EditProfileButton'
import { IconButton, IconButtonProps } from '@chakra-ui/button'
import { Stack, Text } from '@chakra-ui/layout'
import { HamburgerIcon2 } from '@x/components/icons'
import { useDisclosure } from '@chakra-ui/hooks'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter } from '@chakra-ui/modal'
import Searchbar from 'components/search/Searchbar'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { useActiveWeb3React } from '@x/hooks'
import NavItems from './NavItems'
import SocialLinks from './SocialLinks'
import AccountBalance from 'components/account/AccountBalance'
import AccountMenu from 'components/account/AccountMenu'
import AddTokenToMetaMaskByTokenId from 'components/erc20/AddTokenToMetaMaskByTokenId'

export type MenuButtonProps = Omit<IconButtonProps, 'aria-label'>

export default function MenuButton(props: MenuButtonProps) {
  const { isOpen, onClose, onToggle } = useDisclosure()

  const { account } = useActiveWeb3React()

  return (
    <>
      <IconButton
        icon={<HamburgerIcon2 color="primary" mx={3} />}
        aria-label="menu"
        variant="unstyled"
        minW="fit-content"
        onClick={onToggle}
        {...props}
      />
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" autoFocus={false}>
        <DrawerContent>
          <DrawerBody>
            <Searchbar />
            <Stack spacing={8} mt={8}>
              {!account && <ConnectWalletButton />}
              {account && (
                <Stack direction="row" mx={4}>
                  <EditProfileButton
                    icon={<AccountAvatar account={account} w="48px" h="48px" borderRadius="24px" overflow="hidden" />}
                    variant="unstyled"
                    minW="fit-content"
                  />
                  <AccountMenu>
                    <AccountBalance as="div" />
                  </AccountMenu>
                  <AddTokenToMetaMaskByTokenId tokenId="X" aria-label="Add X to MetaMask" flexShrink={0} />
                </Stack>
              )}
              <NavItems />
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <Stack direction="row" spacing={8} mt={8} justifyContent="center" alignItems="center">
              <SocialLinks />
              <Text fontSize="sm">©XChange 2021</Text>
            </Stack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
