import { useActiveWeb3React } from '@x/hooks'
import { useRouter } from 'next/router'
import { compareAddress } from '@x/utils'
import { NavBar, NavItem } from 'components/Nav'

export interface AccountNavBarProps {
  account?: string
}

export default function AccountNavBar({ account }: AccountNavBarProps) {
  const { route } = useRouter()

  const { account: myAccount } = useActiveWeb3React()

  const isMine = compareAddress(account, myAccount)

  return (
    <NavBar justify="space-evenly">
      <NavItem
        disabled={!account}
        href={`/account/${account}/collections`}
        active={route.startsWith('/account/[address]/collections') || route.startsWith('/dashboard')}
      >
        {isMine ? 'My ' : ''}Collections
      </NavItem>
      <NavItem
        disabled={!account}
        href={`/account/${account}/activities`}
        active={route.startsWith('/account/[address]/activities')}
      >
        {isMine ? 'My ' : ''}Activity
      </NavItem>
      <NavItem
        disabled={!account}
        href={`/account/${account}/pending-offers`}
        active={route.startsWith('/account/[address]/pending-offers')}
      >
        {isMine ? 'My ' : ''}Offers
      </NavItem>
    </NavBar>
  )
}
