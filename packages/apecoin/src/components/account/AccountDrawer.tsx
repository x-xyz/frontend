import Address from 'components/Address'
import AddTokenToMetaMaskByTokenId from 'components/erc20/AddTokenToMetaMaskByTokenId'
import Link from 'components/Link'

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  DrawerProps,
  List,
  ListItem,
  Stack,
} from '@chakra-ui/react'
import { useActiveWeb3React } from '@x/hooks/dist'

import AccountAvatar from './AccountAvatar'
import AccountBalanceList from './AccountBalanceList'

export interface AccountDrawerProps extends Omit<DrawerProps, 'children'> {
  account: string
}

export default function AccountDrawer({ account, ...props }: AccountDrawerProps) {
  const { deactivate } = useActiveWeb3React()
  return (
    <Drawer placement="right" {...props}>
      <DrawerOverlay />
      <DrawerContent maxW="382px" pt={8}>
        <DrawerCloseButton size="lg" mt={8} />
        <DrawerBody px={0}>
          <Stack divider={<Divider />} spacing={8}>
            <Stack px={8}>
              <AccountAvatar account={account} w={15} />
              <Address fontSize="xl">{account}</Address>
            </Stack>
            <List spacing={5} px={8} fontSize="xl">
              <ListItem>
                <Link href={`/account/${account}/nfts`}>MY NFTS</Link>
              </ListItem>
              <ListItem>
                <AddTokenToMetaMaskByTokenId tokenId="APE" variant="unstyled">
                  ADD $APE TO METAMASK
                </AddTokenToMetaMaskByTokenId>
              </ListItem>
              <ListItem>
                <Button variant="unstyled" onClick={deactivate}>
                  DISCONNECT WALLET
                </Button>
              </ListItem>
            </List>
            <Box px={8}>
              <AccountBalanceList showConvertButton />
            </Box>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
