import { Center, Stack, Text, Tooltip } from '@chakra-ui/react'
import { DashboardIcon, FavoriteIcon, MarketplaceIcon, GiftIcon, LockIcon } from '@x/components/icons'
import { useActiveWeb3React } from '@x/hooks'
import NavIcon from 'components/Layout/wagmi/NavIcon'
import { isFeatureEnabled } from 'flags'

import NavItem, { NavItemProps } from './NavItem'

export default function NavItems() {
  const { account } = useActiveWeb3React()

  return (
    <>
      {isFeatureEnabled('promotion-page') && (
        <Item
          href="https://wagmi.x.xyz"
          noActiveBackground
          label="Monthly Special Promotion"
          icon={<NavIcon w="50px" h="50px" assetsFolder="/assets/wagmi-1" imageCount={6} />}
        />
      )}

      {isFeatureEnabled('claim-page') && (
        <Item href="/claim" label="Claim Rewards" icon={<GiftIcon transform="scale(2.2)" />} />
      )}

      {isFeatureEnabled('vex-page') && (
        <Item href="/vex" label="veX Dashboard" icon={<LockIcon transform="scale(2.2)" />} />
      )}

      <Item href="/dashboard" label="Dashboard" icon={<DashboardIcon w="22px" h="22px" />} />

      <Item href="/collections" label="Marketplace" icon={<MarketplaceIcon w="22px" h="22px" />} />

      <Item
        href={`/account/${account}/favorites`}
        disabled={!account}
        label="Favorites"
        icon={<FavoriteIcon w="22px" h="22px" />}
      />
    </>
  )
}

interface ItemProps extends NavItemProps {
  icon?: React.ReactNode
  label?: string
}

function Item({ icon, label, ...props }: ItemProps) {
  return (
    <NavItem {...props}>
      <Tooltip variant="navitem" label={label} placement="right">
        <Stack direction="row" w="100%" h="100%" align="center">
          <Center w={12} h={12}>
            {icon}
          </Center>
          <Text ml={8} display={{ lg: 'none' }}>
            {label}
          </Text>
        </Stack>
      </Tooltip>
    </NavItem>
  )
}
