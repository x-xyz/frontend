import FavIcon from 'components/icons/FavIcon'
import useAuthToken from 'hooks/useAuthToken'
import { useRouter } from 'next/router'
import { memo, useEffect, useState } from 'react'

import { Button, ButtonProps } from '@chakra-ui/button'
import { Stack } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { BigNumberish } from '@ethersproject/bignumber'
import { useMutation } from 'react-query'
import { ChainId } from '@x/constants'
import { useActiveWeb3React, useSyncRef } from '@x/hooks'
import { isErrorResponse } from '@x/utils'
import { likeToken, unlikeToken } from '@x/apis/fn'

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
  chainId = ChainId.Fantom,
  contractAddress,
  tokenID,
  count: inputCount = 0,
  isLoading: isLoadingCount,
  children,
  onCountChange,
  defaultIsLiked = false,
  ...props
}: LikeButtonProps) {
  const { locale } = useRouter()

  const [count, setCount] = useState(inputCount)

  const prevCountRef = useSyncRef(count)

  const { account } = useActiveWeb3React()

  const [authToken, isLoadingAuthToken] = useAuthToken(account ?? void 0)

  const like = useMutation(likeToken)

  const unlike = useMutation(unlikeToken)

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

    const request = isLiked ? unlike.mutateAsync : like.mutateAsync

    const resp = await request({ queryKey: [authToken, chainId, contractAddress, `${tokenID}`], meta: {} })

    setCount(resp)

    setLiked(prev => !prev)
  }

  const isLoading = isLoadingAuthToken || like.isLoading || unlike.isLoading

  const disabled = isLoading || !authToken || props.disabled

  function render() {
    if (typeof children === 'function') return children(count)
    if (children) return children
    return (
      <Stack direction="row" align="center" color="value">
        <FavIcon w={4} h={4} color={isLiked ? 'transparent' : '#ffffff'} fill={isLiked ? '#ffffff' : 'transparent'} />
        {!isLoadingCount && (
          <SkeletonText color="#ffffff" fontSize="xs" isLoaded={!isLoadingCount}>
            {count.toLocaleString(locale)}
          </SkeletonText>
        )}
      </Stack>
    )
  }

  return (
    <Button
      variant="unstyled"
      minW="fit-content"
      size="sm"
      {...props}
      disabled={disabled}
      isLoading={isLoading}
      onClick={onClick}
    >
      {render()}
    </Button>
  )
}

export default memo(LikeButton)
