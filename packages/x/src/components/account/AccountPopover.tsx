import { fetchAccountV2 } from '@x/apis/dist/fn'
import Address from 'components/Address'
import { AddTokenToMetaMaskByTokenIdButton } from 'components/erc20/AddTokenToMetaMaskByTokenId'
import Link from 'components/Link'

import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  SkeletonText,
  Stack,
} from '@chakra-ui/react'
import { adminWhitelist } from '@x/constants'
import { ChainId } from '@x/models'
import { useQuery } from 'react-query'

import AccountAvatar from './AccountAvatar'
import AccountBalanceList from './AccountBalanceList'
import { ModalControl, useAccountModal } from './AccountModalProvider'
import { useActiveWeb3React } from '@x/hooks/dist'

export interface AccountPopoverProps {
  account: string
  chainId?: ChainId
}

interface ModalItem {
  control: ModalControl
  label: string
  admin?: boolean
}

export default function AccountPopover({ account, chainId = ChainId.Ethereum }: AccountPopoverProps) {
  const { deactivate } = useActiveWeb3React()

  const { data, isLoading } = useQuery(['account', account], fetchAccountV2)

  const isAdmin = adminWhitelist.includes(account)
  const isModerator = !!data?.isModerator

  const {
    moderatorModal,
    banAccountModal,
    unbanAccountModal,
    banCollectionModal,
    unbanCollectionModal,
    banNftItemModal,
    unbanNftItemModal,
  } = useAccountModal()

  const modalItems: ModalItem[] = [
    { control: moderatorModal, label: 'Manage moderators', admin: true },
    { control: banAccountModal, label: 'Ban account' },
    { control: unbanAccountModal, label: 'Unban account', admin: true },
    { control: banCollectionModal, label: 'Ban collection' },
    { control: unbanCollectionModal, label: 'Unban collection', admin: true },
    { control: banNftItemModal, label: 'Ban nft item' },
    { control: unbanNftItemModal, label: 'Unban nft item', admin: true },
  ]

  const items: React.ReactNode[] = []

  if (isAdmin)
    items.push(
      <ListItem key="review-collection">
        <Link href="/collection/review">Review collections</Link>
      </ListItem>,
    )

  modalItems.forEach(({ label, control, admin }) => {
    if (isAdmin || (!admin && isModerator))
      items.push(
        <ListItem key={label.replace(/s/g, '-').toLowerCase()} onClick={control.onOpen}>
          <Button variant="link">{label}</Button>
        </ListItem>,
      )
  })

  function renderLinks() {
    return (
      <List textAlign="center" w="full" borderTop="1px solid" borderColor="divider">
        <ListItem>
          <Link href={`/account/${account}`}>NFT Portfolio</Link>
        </ListItem>
        <ListItem>
          <Link href="/vex">veX Dashboard</Link>
        </ListItem>
        <ListItem>
          <Link href="https://x.vault.inc/">X Token Staking Vault</Link>
        </ListItem>
        <ListItem>
          <Link href="/claim">Claim Rewards</Link>
        </ListItem>
        {items}
        <ListItem>
          <Button variant="link" onClick={deactivate}>
            Disconnect Wallet
          </Button>
        </ListItem>
      </List>
    )
  }

  function renderPanel() {
    return (
      <Stack w="full" align="center" spacing={0}>
        <Box
          pos="relative"
          w="full"
          h="60px"
          bg="url(/assets/v3/profile_bg.jpg)"
          bgSize="cover"
          bgRepeat="no-repeat"
          bgPos="center"
        >
          <AccountAvatar
            account={account}
            w={20}
            h={20}
            pos="absolute"
            top={5}
            left="50%"
            transform="translateX(-40px)"
          />
        </Box>
        <Box h={10} />
        <SkeletonText noOfLines={1} isLoaded={!isLoading} fontWeight="bold">
          {data?.alias || 'unnamed'}
        </SkeletonText>
        <Address color="note" fontSize="sm" selfSynonym="" type="copy">
          {account}
        </Address>
        <AddTokenToMetaMaskByTokenIdButton tokenId="X" pos="relative" top={5}>
          Add X to MetaMask
        </AddTokenToMetaMaskByTokenIdButton>
        <Box px={2} w="full">
          <AccountBalanceList w="full" py={4} showX showWrapButton />
        </Box>
        <Box h={6} />
        {renderLinks()}
      </Stack>
    )
  }

  return (
    <Popover isLazy returnFocusOnClose closeOnBlur closeOnEsc trigger="hover" placement="bottom-end">
      <PopoverTrigger>
        <Stack direction="row" align="center">
          <AccountAvatar account={account} w={10} h={10} />
          <TriangleDownIcon color="divider" w="10px" />
        </Stack>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="90vw" maxW="380px">
          <PopoverBody>{renderPanel()}</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
