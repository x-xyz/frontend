import React, { forwardRef } from 'react'
import { chakra, ChakraProps } from '@chakra-ui/react'
import { IconProps } from './shared'

export * from './CommunityIcon'
export * from './DashboardIcon'
export * from './FavoriteIcon'
export * from './GalleryIcon'
export * from './HamburgerIcon'
export * from './HamburgerIcon2'
export * from './LeftArrow'
export * from './LikeIcon'
export * from './MarketplaceIcon'
export * from './SettingIcon'
export * from './TelegramIcon'
export * from './WalletIcon'
export * from './WarningIcon'
export * from './GiftIcon'
export * from './LockIcon'
export * from './BscScanIcon'
export * from './TwitterIcon'
export * from './DiscordIcon'
export * from './WebsiteIcon'
export * from './ShareIcon'

export function makeIcon(
  defaultProps: ChakraProps & React.SVGAttributes<SVGSVGElement>,
  renderBody: () => JSX.Element,
) {
  return forwardRef<SVGSVGElement, IconProps>((props, ref) => {
    return (
      <chakra.svg ref={ref} xmlns="http://www.w3.org/2000/svg" {...defaultProps} {...props}>
        {renderBody()}
      </chakra.svg>
    )
  })
}
