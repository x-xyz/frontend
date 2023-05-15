import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import { TriangleDownIcon } from '@chakra-ui/icons'
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
  Text,
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
                <Link href="/collections">NFT Marketplace</Link>
              </ListItem>
              <ListItem>
                <Link href="/ip/marketplace/buy">IP Marketplace</Link>
              </ListItem>
              <ListItem>
                <Link href="/bulk-listing">Bulk Listing</Link>
              </ListItem>
              <Accordion allowToggle borderBottom="1px solid" borderColor="divider">
                <AccordionItem border="none">
                  <AccordionButton justifyContent="center">
                    <Text>Rewards</Text>
                    <TriangleDownIcon w={3} h={3} ml={2} />
                  </AccordionButton>
                  <AccordionPanel p={0}>
                    <List variant="border" textAlign="center" bg="panel" border="none">
                      <ListItem>
                        <Link disabled={true}>Everyday Rewards (Coming Soon)</Link>
                      </ListItem>
                      <ListItem>
                        <Link href="/vex">veX Dashboard</Link>
                      </ListItem>
                      <ListItem>
                        <Link href="https://x.vault.inc/">X Token Staking Vault</Link>
                      </ListItem>
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              {account && (
                <ListItem>
                  <Link href={`/account/${account}`}>My Portfolio</Link>
                </ListItem>
              )}
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
