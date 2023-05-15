import { Avatar } from '@chakra-ui/avatar'
import { Spacer, Stack, StackProps, Text } from '@chakra-ui/layout'
import { SkeletonCircle, SkeletonText } from '@chakra-ui/skeleton'
import Address from 'components/Address'
import Image from 'components/Image'
import Link from 'components/Link'
import { Account } from '@x/models'

export interface FollowerListProps extends StackProps {
  followers?: Account[]
  isLoading?: boolean
}

export default function FollowerList({ followers = [], isLoading, ...props }: FollowerListProps) {
  function renderFollower({ alias, imageUrl, imageHash, followers, address }: Account) {
    return (
      <Link key={address} href={`/account/${address}`} variant="unstyled">
        <Stack direction="row" alignItems="center" spacing={4}>
          <Image as={Avatar} src={imageUrl || imageHash} w={12} h={12} />
          <Stack>
            <Text>{alias || 'Unnamed'}</Text>
            <Address>{address}</Address>
          </Stack>
          <Spacer />
          <Text>{followers} followers</Text>
        </Stack>
      </Link>
    )
  }

  return (
    <Stack w="100%" {...props}>
      {isLoading && (
        <Stack direction="row">
          <SkeletonCircle w={12} h={12} />
          <SkeletonText noOfLines={2} w={20} />
          <Spacer />
          <SkeletonText noOfLines={1} w={10} />
        </Stack>
      )}
      {followers.map(renderFollower)}
    </Stack>
  )
}
