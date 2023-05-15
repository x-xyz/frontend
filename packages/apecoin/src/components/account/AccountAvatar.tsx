import { ImageProps } from '@chakra-ui/image'
import AvatarPlaceholder from 'components/icons/AvatarPlaceholder'
import Image from 'components/Image'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { SkeletonCircle, SkeletonProps } from '@chakra-ui/skeleton'
import { fetchAccountV2 } from '@x/apis/fn'
import { Account } from '@x/models'

export interface AccountAvatarProps extends Omit<ImageProps, 'children'> {
  account?: Account | string | null
}

export default function AccountAvatar({ account, ...props }: AccountAvatarProps) {
  const [address, initialData] = useMemo<[string | null, Account | null]>(() => {
    if (!account) return [null, null]
    if (typeof account === 'string') return [account, null]
    return [account.address, account]
  }, [account])
  const { data, isLoading } = useQuery(['account', address || ''], fetchAccountV2, { initialData, enabled: !!address })

  // if (data?.imageHash) return <Image src={data?.imageHash} overflow="hidden" borderRadius="full" {...props} />

  return (
    <Image src="/assets/default_profile_avatar.svg" borderRadius="50%" {...props} />
    // <SkeletonCircle isLoaded={!isLoading} overflow="hidden" borderRadius="500px" {...props}>
    //
    //     {/*<AvatarPlaceholder w="full" h="full" fill="primary" />*/}
    //   </SkeletonCircle>
  )
}
