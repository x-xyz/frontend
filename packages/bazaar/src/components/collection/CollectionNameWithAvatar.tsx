import Image from 'components/Image'

import { SkeletonCircle, SkeletonText, Stack, StackProps, Text } from '@chakra-ui/react'
import { useCollectionQuery } from '@x/apis'
import { ChainId } from '@x/models'

export interface CollectionNameWithAvatarProps extends StackProps {
  chainId?: ChainId
  contract?: string
  label?: React.ReactNode
}

export default function CollectionNameWithAvatar({
  chainId = ChainId.BinanceSmartChain,
  contract = '',
  label,
  ...props
}: CollectionNameWithAvatarProps) {
  const { data, isLoading } = useCollectionQuery({ chainId, contract }, { skip: !chainId || !contract })
  return (
    <Stack direction="row" align="center" {...props}>
      <SkeletonCircle isLoaded={!isLoading} borderColor="divider" borderWidth="2px" overflow="hidden">
        <Image src={data?.data?.logoImageUrl || data?.data?.logoImageHash} />
      </SkeletonCircle>
      <Stack spacing={0}>
        {typeof label === 'string' ? (
          <Text color="inactive" fontSize="sm">
            {label}
          </Text>
        ) : (
          label
        )}
        <SkeletonText isLoaded={!isLoading} noOfLines={1} color="primary">
          {data?.data?.collectionName}
        </SkeletonText>
      </Stack>
    </Stack>
  )
}
