import Image from 'components/Image'
import { useMemo } from 'react'

import { Avatar, SkeletonCircle, SkeletonText, Stack, StackProps, Text } from '@chakra-ui/react'
import { useAccountQuery } from '@x/apis'
import { shortenAddress } from '@x/utils'

export interface AccountAvatarProps extends StackProps {
  account?: string
  label?: React.ReactNode
  isLoading?: boolean
}

export default function AccountNameWithAvatar({ account, label, isLoading, ...props }: AccountAvatarProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data, isLoading: isLoadingData } = useAccountQuery({ address: account! }, { skip: !account })
  const imageHash = useMemo(() => data?.data?.imageHash, [data])
  return (
    <Stack direction="row" align="center" {...props}>
      <SkeletonCircle isLoaded={!isLoading && !isLoadingData} borderColor="divider" borderWidth="2px" overflow="hidden">
        <Image as={Avatar} src={imageHash} />
      </SkeletonCircle>
      <Stack spacing={0}>
        {typeof label === 'string' ? (
          <Text color="inactive" fontSize="sm">
            {label}
          </Text>
        ) : (
          label
        )}
        <SkeletonText isLoaded={!isLoading && !isLoadingData} noOfLines={1} color="primary">
          {data?.data?.alias || (account && shortenAddress(account)) || '-'}
        </SkeletonText>
      </Stack>
    </Stack>
  )
}
