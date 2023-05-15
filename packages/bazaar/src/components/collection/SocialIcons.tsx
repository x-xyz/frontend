import { Stack, StackProps } from '@chakra-ui/layout'
import { IconButton } from '@chakra-ui/button'

import { TwitterIcon, TelegramIcon, DiscordIcon, WebsiteIcon } from '@x/components/icons'
import { Collection } from '@x/models'
import Link from 'components/Link'
import ShareMenu from './ShareMenu'

export interface SocialIconsProps extends StackProps {
  collection?: Collection
}

export default function SocialIcons({ collection, ...props }: SocialIconsProps) {
  const iconStyles = { w: '24px', h: '24px', color: 'primary' }

  function renderIconButton(Icon: JSX.Element, link?: string) {
    return (
      <Link href={link} isExternal>
        <IconButton
          aria-label="social media icon"
          icon={Icon}
          bgColor="#1C1C1F"
          w="44px"
          h="44px"
          variant="outline"
          borderColor="transparent"
        />
      </Link>
    )
  }

  function renderShareButton() {
    return <ShareMenu />
  }

  return (
    <Stack direction="row" spacing={{ base: 4, sm: 6 }} {...props}>
      {collection?.twitterHandle && renderIconButton(<TwitterIcon {...iconStyles} />, collection.twitterHandle)}
      {collection?.telegram && renderIconButton(<TelegramIcon {...iconStyles} />, collection.telegram)}
      {collection?.discord && renderIconButton(<DiscordIcon {...iconStyles} />, collection.discord)}
      {collection?.siteUrl && renderIconButton(<WebsiteIcon {...iconStyles} />, collection.siteUrl)}
      {renderShareButton()}
    </Stack>
  )
}
