import { Image } from '@chakra-ui/image'
import { Stack, StackProps } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import Link from 'components/Link'
import { Collection } from '@x/models'

export interface CollectionLinksProps extends StackProps {
  collection?: Collection
  isLoading?: boolean
}

export default function CollectionLinks({ collection, isLoading, ...props }: CollectionLinksProps) {
  function renderLink(icon: string, key: ExtractTypeOf<Collection, string>) {
    if (isLoading) return <Skeleton width="28px" height="28px" borderRadius="10px" />

    if (!collection || !collection) return

    if (!key || !collection[key]) return

    return (
      <Link variant="badge" href={collection[key]} px={2} py={1}>
        <Image src={icon} width="20px" height="20px" />
      </Link>
    )
  }

  return (
    <Stack direction="row" {...props}>
      {renderLink('/assets/icons/web.svg', 'siteUrl')}
      {renderLink('/assets/icons/twitter.svg', 'twitterHandle')}
      {renderLink('/assets/icons/telegram.svg', 'telegram')}
      {renderLink('/assets/icons/discord.svg', 'discord')}
    </Stack>
  )
}
