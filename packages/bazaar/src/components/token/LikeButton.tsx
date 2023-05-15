import { memo, useEffect, useState } from 'react'
import { Button, ButtonProps } from '@chakra-ui/button'
import { Stack, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { BigNumberish } from '@ethersproject/bignumber'
import { LikeIcon } from '@x/components/icons'
import { useAuthToken } from '@x/hooks'
import { useSyncRef } from '@x/hooks'
import { useLikeTokenMutation, useUnlikeTokenMutation } from '@x/apis'
import { ChainId, defaultNetwork } from '@x/constants'
import { isErrorResponse } from '@x/utils'

export interface LikeButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress?: string
  tokenID?: BigNumberish
  count?: number
  isLoading?: boolean
  children?: React.ReactNode | ((count: number) => React.ReactNode)
  onCountChange?: (contractAddress: string, tokenID: BigNumberish, current: number, prev: number) => void
  defaultIsLiked?: boolean
}

function LikeButton({
  chainId = defaultNetwork,
  contractAddress,
  tokenID,
  count: inputCount = 0,
  isLoading: isLoadingCount,
  children,
  onCountChange,
  defaultIsLiked = false,
  ...props
}: LikeButtonProps) {
  const [count, setCount] = useState(inputCount)

  const prevCountRef = useSyncRef(count)

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const [like, { isLoading: isLiking }] = useLikeTokenMutation()

  const [unlike, { isLoading: isUnliking }] = useUnlikeTokenMutation()

  const [isLiked, setLiked] = useState(false)

  useEffect(() => setLiked(defaultIsLiked), [defaultIsLiked])

  useEffect(() => setCount(inputCount), [inputCount])

  useEffect(() => {
    if (!onCountChange) return
    if (count === prevCountRef.current) return
    if (!contractAddress || !tokenID) return
    onCountChange(contractAddress, tokenID, count, prevCountRef.current)
  }, [onCountChange, count, contractAddress, tokenID, prevCountRef])

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    e.preventDefault()

    if (!authToken) return

    if (!contractAddress) return

    if (!tokenID) return

    const request = isLiked ? unlike : like

    const resp = await request({ chainId, contract: contractAddress, tokenId: tokenID.toString(), authToken })

    if (isErrorResponse(resp)) {
      return
    } else if (resp.data.status === 'success') {
      setCount(resp.data.data)
    }

    setLiked(prev => !prev)
  }

  const isLoading = isLoadingAuthToken || isLiking || isUnliking

  const disabled = isLoading || !authToken || props.disabled

  function render() {
    if (typeof children === 'function') return children(count)
    if (children) return children
    return (
      <Stack direction="row" alignItems="center" px={2} spacing={1}>
        <LikeIcon width="14px" height="14px" stroke="currentcolor" fill={isLiked ? 'currentcolor' : 'transparent'} />
        <SkeletonText noOfLines={1} w={6} color="currentcolor" fontSize="sm" isLoaded={!isLoadingCount}>
          {count}
        </SkeletonText>
      </Stack>
    )
  }

  return (
    <Button variant="unstyled" bg="panel" {...props} disabled={disabled} isLoading={isLoading} onClick={onClick}>
      {render()}
    </Button>
  )
}

export default memo(LikeButton)
