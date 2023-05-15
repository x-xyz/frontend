import {
  Heading,
  IconButton,
  IconButtonProps,
  Image,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalProps,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks'
import Link from 'components/Link'
import ConnectWalletButton from 'components/wallet/ConnectWalletButton'
import SocialMedia from 'components/SocialMedia'

export type NavModalProps = Omit<ModalProps, 'children'>

export default function NavModal(props: NavModalProps) {
  const { account } = useActiveWeb3React()
  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <Stack
          h="full"
          bg="url(/assets/v3/mobile_dropdown_bg_580x890.png)"
          bgSize="100% auto"
          bgRepeat="no-repeat"
          bgPos="bottom left"
        >
          <ModalBody px={0}>
            <List variant="border" textAlign="center" bg="panel">
              {!account && (
                <ListItem>
                  <ConnectWalletButton w="full" color="primary" />
                </ListItem>
              )}
              <ListItem>
                <Link href="/collections">X-plore</Link>
              </ListItem>
              {/*<ListItem>*/}
              {/*  <Link>Stats</Link>*/}
              {/*</ListItem>*/}
              {/* <ListItem>
                <Link href="/create">Create</Link>
              </ListItem> */}

              <ListItem>
                <Link href="/docs">Learn</Link>
              </ListItem>
              <ListItem>
                <Link href="/ip/marketplace/buy">IP Marketplace</Link>
              </ListItem>
              <ListItem>
                <Link href="/bulk-listing">Bulk Listing</Link>
              </ListItem>
              <ListItem>
                <Link href="https://app.sushi.com/swap?outputCurrency=0x7f3141c4d6b047fb930991b450f1ed996a51cb26">
                  Buy X
                </Link>
              </ListItem>
            </List>
          </ModalBody>
          <ModalFooter>
            <Stack w="full" direction="column" spacing={6} justify="center" align="center">
              <Heading size="xs">Join the X-community</Heading>
              <SocialMedia w="196px" />
            </Stack>
          </ModalFooter>
        </Stack>
      </ModalContent>
    </Modal>
  )
}

export function NavModalButton(props: Omit<IconButtonProps, 'aria-label'>) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        variant="icon"
        icon={<Image w={10} h={10} src="/assets/v3/ico-mobile-hamburger-80x80.png" />}
        onClick={onOpen}
        aria-label="navigation"
        {...props}
      />
      <NavModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
