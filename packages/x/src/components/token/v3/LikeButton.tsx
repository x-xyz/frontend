import { memo, useEffect, useState } from 'react'
import { Button, ButtonProps } from '@chakra-ui/button'
import { Stack } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { BigNumberish } from '@ethersproject/bignumber'
import FavIcon from 'components/icons/FavIcon'
import { useAuthToken } from '@x/hooks'
import { useSyncRef } from '@x/hooks'
import { useLikeTokenMutation, useUnlikeTokenMutation } from '@x/apis'
import { ChainId } from '@x/constants'
import { isErrorResponse } from '@x/utils'
import { useRouter } from 'next/router'

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
      <Stack direction="row" align="center" color="value" px={2}>
        <FavIcon w={4} h={4} color={isLiked ? '#E5409D' : 'currentcolor'} fill="transparent" />
        {!isLoadingCount && (
          <SkeletonText color="currentcolor" fontSize="xs" fontWeight="bold" isLoaded={!isLoadingCount}>
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
