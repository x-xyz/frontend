import { useQuery } from 'react-query'
import { fetchTokenV2 } from '@x/apis/fn'
import { ChainId } from '@x/models'
import Media, { MediaProps } from 'components/Media'
import { useAuthToken } from '@x/hooks/dist'

export interface FolderCoverProps extends MediaProps {
  chainId: ChainId
  contractAddress: string
  tokenId: string
}

export default function FolderCover({ chainId, contractAddress, tokenId, ...props }: FolderCoverProps) {
  const [authToken] = useAuthToken()
  const { data, isLoading } = useQuery(['token', chainId, contractAddress, tokenId, { authToken }], fetchTokenV2)

  return (
    <Media
      contentType={data?.contentType}
      mimetype={data?.animationUrlMimeType}
      src={data?.hostedAnimationUrl || data?.animationUrl || data?.hostedImageUrl || data?.imageUrl}
      isLoading={isLoading}
      {...props}
    />
  )
}
