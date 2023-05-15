import { Avatar } from '@chakra-ui/avatar'
import { Stack, Text } from '@chakra-ui/layout'
import { SkeletonCircle, SkeletonText } from '@chakra-ui/skeleton'
import { fetchAccountV2 } from '@x/apis/dist/fn'
import Image from 'components/Image'
import { shortenAddress } from '@x/utils'
import { useQuery } from 'react-query'

export interface NftOwnerProps {
  owner: string
}

export default function NftOwner({ owner }: NftOwnerProps) {
  const { data, isLoading } = useQuery(['account', owner], fetchAccountV2)

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <SkeletonCircle isLoaded={!isLoading}>
        <Image
          as={Avatar}
          src={data?.imageUrl || data?.imageHash}
          borderRadius="30px"
          w="30px"
          h="30px"
          overflow="hidden"
        />
      </SkeletonCircle>
      <Stack spacing={0} flexGrow={1}>
        <Text fontSize="xs" color="currentcolor">
          Owner
        </Text>
        <SkeletonText fontSize="xs" isLoaded={!isLoading} isTruncated>
          {data?.alias || shortenAddress(owner)}
        </SkeletonText>
      </Stack>
    </Stack>
  )
}
