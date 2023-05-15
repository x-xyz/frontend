import { Account } from '@x/models'
import { isFeatureEnabled } from '../../../flags'
import Link from '../../Link'
import Dropdown from '../../v3/Dropdown'
import Nav from '../../v3/Nav'

interface AccountNavBarProps {
  account: Account
}

export default function AccountNavBar({ account }: AccountNavBarProps) {
  const offerEnabled = isFeatureEnabled('v3.portfolio-offers')
  const listingEnabled = isFeatureEnabled('v3.portfolio-listings')

  return (
    <Nav.Bar mt={10}>
      <Nav.Item href={`/account/${account.address}/portfolio/folders`}>NFT Folders</Nav.Item>
      <Nav.Item href={`/account/${account.address}/watchlist`}>Watchlist</Nav.Item>
      <Nav.Item href={`/account/${account.address}/activities`}>Activities</Nav.Item>
      <Nav.Item
        disabled={!offerEnabled}
        dropdownItems={
          offerEnabled
            ? [
                <Link key="received" href={`/account/${account.address}/offers/received`}>
                  <Dropdown.Item>Offers Received</Dropdown.Item>
                </Link>,
                <Link key="placed" href={`/account/${account.address}/offers/placed`}>
                  <Dropdown.Item>Offers Made</Dropdown.Item>
                </Link>,
              ]
            : []
        }
      >
        Offers
      </Nav.Item>
      <Nav.Item
        disabled={!listingEnabled}
        dropdownItems={
          listingEnabled
            ? [
                <Link key="active" href={`/account/${account.address}/listings/active`}>
                  <Dropdown.Item>Active Listings</Dropdown.Item>
                </Link>,
                <Link key="inactive" href={`/account/${account.address}/listings/inactive`}>
                  <Dropdown.Item>Inactive Listings</Dropdown.Item>
                </Link>,
              ]
            : []
        }
      >
        Listings
      </Nav.Item>
    </Nav.Bar>
  )
}
