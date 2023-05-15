import { useEffect } from 'react'
import { Button, ButtonProps } from '@chakra-ui/button'
import { Icon } from '@chakra-ui/icon'
import { CheckIcon } from '@chakra-ui/icons'
import { Stack, Text } from '@chakra-ui/layout'
import { useAuthToken } from '@x/hooks'
import { useIsFollowing } from '@x/hooks'
import { useSyncRef } from '@x/hooks'
import { useFollowMutation, useUnfollowMutation } from '@x/apis'

export interface FollowButtonProps extends ButtonProps {
  to: string
  onChange?: () => void
}

export default function FollowButton({ to, onChange = () => void 0, ...props }: FollowButtonProps) {
  const [isFollowed, isLoading, setFollowed] = useIsFollowing(to)

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [follow, { isLoading: isFollowing, isSuccess: isFollowSuccessed }] = useFollowMutation()

  const [unfollow, { isLoading: isUnfollowing, isSuccess: isUnfollowSuccessed }] = useUnfollowMutation()

  const isUpdating = isFollowing || isUnfollowing

  const onChangeRef = useSyncRef(onChange)

  useEffect(() => {
    if (isFollowSuccessed) setFollowed(true)
  }, [isFollowSuccessed, setFollowed])

  useEffect(() => {
    if (isUnfollowSuccessed) setFollowed(false)
  }, [isUnfollowSuccessed, setFollowed])

  useEffect(() => {
    onChangeRef.current()
  }, [isFollowed, onChangeRef])

  function onClick() {
    if (!authToken) return
    if (isFollowed) unfollow({ address: to, authToken })
    else follow({ address: to, authToken })
  }

  return (
    <Button isLoading={isLoading || isLoadingAuthToken || isUpdating} onClick={onClick} {...props}>
      {isFollowed ? (
        <Stack direction="row" alignItems="center">
          <Icon as={CheckIcon} />
          <Text color="black">Following</Text>
        </Stack>
      ) : (
        'Follow'
      )}
    </Button>
  )
}
