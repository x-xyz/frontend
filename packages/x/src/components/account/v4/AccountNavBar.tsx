import { Account } from '@x/models'
import Link from 'components/Link'
import Dropdown from 'components/v4/Dropdown'
import Nav from 'components/v4/Nav'

interface AccountNavBarProps {
  account: Account
}

export default function AccountNavBar({ account }: AccountNavBarProps) {
  return (
    <Nav.Bar mt={10} mb={5}>
      <Nav.Item href={`/account/${account.address}/portfolio/folders`}>NFT Folders</Nav.Item>
      <Nav.Item href={`/account/${account.address}/watchlist`}>Watchlist</Nav.Item>
      <Nav.Item href={`/account/${account.address}/activities`}>Activities</Nav.Item>
      <Nav.Item
        dropdownItems={[
          <Link key="received" href={`/account/${account.address}/offers/received`}>
            <Dropdown.Item>Offers Received</Dropdown.Item>
          </Link>,
          <Link key="placed" href={`/account/${account.address}/offers/placed`}>
            <Dropdown.Item>Offers Made</Dropdown.Item>
          </Link>,
        ]}
      >
        Offers
      </Nav.Item>
      <Nav.Item
        dropdownItems={[
          <Link key="active" href={`/account/${account.address}/listings/active`}>
            <Dropdown.Item>Active Listings</Dropdown.Item>
          </Link>,
          <Link key="inactive" href={`/account/${account.address}/listings/inactive`}>
            <Dropdown.Item>Inactive Listings</Dropdown.Item>
          </Link>,
        ]}
      >
        Listings
      </Nav.Item>
    </Nav.Bar>
  )
}
