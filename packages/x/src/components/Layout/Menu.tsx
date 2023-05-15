import { Button, IconButton } from '@chakra-ui/button'
import { Divider, Spacer, Stack, StackProps, Text } from '@chakra-ui/layout'
import { Drawer, DrawerBody, DrawerContent, DrawerFooter } from '@chakra-ui/modal'
import { useDisclosure } from '@chakra-ui/hooks'
import { useRef } from 'react'
import Link from 'components/Link'
import { HamburgerIcon } from '@x/components/icons'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import { useActiveWeb3React } from '@x/hooks'
import { useRouter } from 'next/router'
import { ChainId, getChain, getChainName } from '@x/constants'
import { useAccountModal } from 'components/account/AccountModalProvider'
import { layout } from 'theme'
import ChainIcon from 'components/ChainIcon'

export default function Menu(props: StackProps) {
  const { pathname } = useRouter()

  const { isOpen, onToggle, onClose } = useDisclosure()

  const { account, chainId = ChainId.Fantom, deactivate } = useActiveWeb3React()

  const chain = getChain(chainId)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const { wrapNativeModal } = useAccountModal()

  function renderLink(label: string, href: string) {
    return (
      <Link href={href} color={pathname === href ? 'primary' : 'inactive'}>
        {label}
      </Link>
    )
  }

  return (
    <>
      <Stack
        display={{ base: 'flex', sm: 'none' }}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        {...props}
      >
        <IconButton
          ref={buttonRef}
          icon={<HamburgerIcon color="primary" mx={3} transform="scale(1.4)" />}
          aria-label="menu"
          variant="unstyled"
          onClick={onToggle}
        />
      </Stack>
      <Drawer isOpen={isOpen} onClose={onClose} finalFocusRef={buttonRef}>
        <DrawerContent maxW="100%" height={`calc(100% - ${layout.headerHeight})`} top="initial !important">
          <DrawerBody>
            <Stack h="100%" spacing={4}>
              {renderLink('Home', '/')}
              {renderLink('Marketplace', '/marketplace')}
              {account && (
                <>
                  {renderLink('My Profile', `/account/${account}`)}
                  {renderLink('Register Existing Collection', '/collection/register')}
                  <Button
                    variant="unstyled"
                    color="inactive"
                    textAlign="left"
                    h="fit-content"
                    onClick={wrapNativeModal.onOpen}
                  >{`Swap ${chain.nativeCurrency.symbol} / W${chain.nativeCurrency.symbol}`}</Button>
                </>
              )}
              <Divider />
              <Button variant="unstyled" color="inactive" textAlign="left" h="fit-content" onClick={deactivate}>
                Sign Out
              </Button>
              <Spacer />
              {account ? (
                <Stack direction="row" alignItems="center" bg="divider" h={10} px={6} borderRadius="10px">
                  <ChainIcon chainId={chainId} h="24px" />
                  <Text fontSize="sm">{getChainName(chainId)}</Text>
                  <Spacer />
                  <Text fontSize="sm">
                    {account.slice(0, 5)}..{account.slice(-3)}
                  </Text>
                </Stack>
              ) : (
                <ConnectWalletButton />
              )}
              <Link href="/mint" variant="button">
                <Button variant="outline" size="md" w={{ base: '100%', md: 'auto' }}>
                  Mint
                </Button>
              </Link>
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <Text fontSize="sm">©XChange 2021</Text>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
