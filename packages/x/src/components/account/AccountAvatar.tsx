import { SkeletonCircle, SkeletonProps } from '@chakra-ui/skeleton'
import { fetchAccountV2 } from '@x/apis/fn'
import Image from 'components/Image'
import AvatarPlaceholder from 'components/icons/AvatarPlaceholder'
import { useMemo } from 'react'
import { Account } from '@x/models'
import { useQuery } from 'react-query'

export interface AccountAvatarProps extends Omit<SkeletonProps, 'children'> {
  account?: Account | string | null
}

export default function AccountAvatar({ account, ...props }: AccountAvatarProps) {
  const address = useMemo(() => {
    if (typeof account === 'string') return account
    return ''
  }, [account])
  const { data, isLoading } = useQuery(['account', address], fetchAccountV2, { enabled: !!address })
  const imageHash = useMemo(() => {
    if (!account) return
    if (typeof account === 'object') return account.imageUrl || account.imageHash
    return data?.imageUrl || data?.imageHash
  }, [account, data])

  if (imageHash)
    return (
      <Image src={imageHash} borderColor="divider" borderWidth="2px" overflow="hidden" borderRadius="full" {...props} />
    )

  return (
    <SkeletonCircle
      isLoaded={!isLoading}
      borderColor="divider"
      borderWidth="2px"
      overflow="hidden"
      borderRadius="500px"
      {...props}
    >
      <AvatarPlaceholder w="full" h="full" fill="primary" />
    </SkeletonCircle>
  )
}
