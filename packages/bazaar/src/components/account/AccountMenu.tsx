import { Menu, MenuButton, MenuDivider, MenuItem, MenuList, MenuProps } from '@chakra-ui/menu'
import { Stack, Text } from '@chakra-ui/layout'
import { defaultNetwork, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import Link from 'components/Link'
import { useAccountQuery } from '@x/apis'
import { adminWhitelist } from '@x/constants'
import { isFeatureEnabled } from 'flags'
import { useAccountModal, ModalControl } from './AccountModalProvider'

export type AccountMenuProps = Omit<MenuProps, 'children'>

export default function AccountMenu(props: AccountMenuProps) {
  const { account } = useActiveWeb3React()

  if (!account) return null

  return <WithAccount account={account} {...props} />
}

interface WithAccountProps extends AccountMenuProps {
  account: string
}

interface ModalItem {
  control: ModalControl
  label: string
  admin?: boolean
}

function WithAccount({ account, ...props }: WithAccountProps) {
  const { chainId = defaultNetwork, deactivate } = useActiveWeb3React()

  const chain = getChain(chainId)

  const isAdmin = adminWhitelist.includes(account)

  const { data } = useAccountQuery({ address: account })

  const isModerator = !!data?.data?.isModerator

  const {
    moderatorModal,
    banAccountModal,
    unbanAccountModal,
    banCollectionModal,
    unbanCollectionModal,
    banNftItemModal,
    unbanNftItemModal,
    wrapNativeModal,
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
      <Link key="review-collection" href="/collection/review">
        <MenuItem>Review collections</MenuItem>
      </Link>,
    )

  modalItems.forEach(({ label, control, admin }) => {
    if (isAdmin || (!admin && isModerator))
      items.push(
        <MenuItem key={label.replace(/s/g, '-').toLowerCase()} onClick={control.onOpen}>
          {label}
        </MenuItem>,
      )
  })

  // if (isAdmin) items.push(<MenuItem key="boost-collection">Boost collection</MenuItem>)

  if (items.length > 0) items.push(<MenuDivider key="divider" />)

  return (
    <>
      <Menu {...props}>
        <MenuButton borderRadius="10px" bg="#4F525E" h={10} px={6}>
          <Stack direction="row" alignItems="center">
            <Text fontSize="sm">
              {account.slice(0, 5)}..{account.slice(-3)}
            </Text>
          </Stack>
        </MenuButton>
        <MenuList>
          <Link href={`/account/${account}`} variant="unstyled">
            <MenuItem>My Profile</MenuItem>
          </Link>
          {isFeatureEnabled('notification') && (
            <Link href="/account/notifications" variant="unstyled">
              <MenuItem disabled>Notification Settings</MenuItem>
            </Link>
          )}
          <MenuItem
            onClick={wrapNativeModal.onOpen}
          >{`Swap ${chain.nativeCurrency.symbol} / W${chain.nativeCurrency.symbol}`}</MenuItem>
          {items}
          <MenuItem color="danger" onClick={deactivate}>
            Sign Out
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}
