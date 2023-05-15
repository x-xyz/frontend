import { Stack, StackProps, Text } from '@chakra-ui/layout'
import { fetchCollectionV2 } from '@x/apis/dist/fn'
import Link from 'components/Link'
import Media from 'components/Media'
import { ChainId, getChainName, getChainNameForUrl } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from 'react-query'

export interface NftThumbnailProps extends StackProps {
  thumbnail: string
  chainId?: ChainId
  contractAddress: string
  tokenId: BigNumberish
  name: string
  isLoading?: boolean
}

export default function NftThumbnail({
  thumbnail,
  chainId = ChainId.Fantom,
  contractAddress,
  tokenId,
  name,
  isLoading,
  ...props
}: NftThumbnailProps) {
  const { data: collection } = useQuery(['collection', chainId || 0, contractAddress || ''], fetchCollectionV2)

  const collectionUrl =
    collection && `/collection/${getChainNameForUrl(collection.chainId)}/${collection.erc721Address}`

  return (
    <Stack direction="row" alignItems="center" flexShrink={0} {...props}>
      <Media
        contentType="image"
        src={thumbnail}
        isLoading={isLoading}
        width="78px"
        height="78px"
        borderRadius="20px"
        overflow="hidden"
        flexShrink={0}
      />
      <Stack spacing={0} w="200px">
        <Link href={collectionUrl} noOfLines={2}>
          {collection?.collectionName || '-'}
        </Link>
        <Link href={`/asset/${getChainNameForUrl(chainId)}/${contractAddress}/${tokenId}`} noOfLines={2}>
          {name || '-'}
        </Link>
      </Stack>
    </Stack>
  )
}
