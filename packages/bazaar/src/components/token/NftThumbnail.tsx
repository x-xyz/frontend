import { Stack, StackProps, Text } from '@chakra-ui/layout'
import Link from 'components/Link'
import Media from 'components/Media'
import { ChainId, defaultNetwork, getChainName } from '@x/constants'
import { BigNumberish } from '@ethersproject/bignumber'

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
  chainId = defaultNetwork,
  contractAddress,
  tokenId,
  name,
  isLoading,
  ...props
}: NftThumbnailProps) {
  return (
    <Stack direction="row" alignItems="center" flexShrink={0} {...props}>
      <Media contentType="image" src={thumbnail} isLoading={isLoading} width="32px" height="32px" />
      <Stack spacing={0}>
        <Link href={`/asset/${chainId}/${contractAddress}/${tokenId}`} whiteSpace="nowrap">
          {name || '-'}
        </Link>
        <Text fontSize="sm" color="gray.500">
          {getChainName(chainId)} ({chainId})
        </Text>
      </Stack>
    </Stack>
  )
}
