import { likeToken, unlikeToken } from '@x/apis/dist/fn'
import { memo, useEffect, useState } from 'react'
import { Button, ButtonProps } from '@chakra-ui/button'
import { Stack, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { BigNumberish } from '@ethersproject/bignumber'
import FavIcon from 'components/icons/FavIcon'
import { useSyncRef } from '@x/hooks'
import { useLikeTokenMutation, useUnlikeTokenMutation } from '@x/apis'
import { ChainId } from '@x/constants'
import { isErrorResponse } from '@x/utils'
import { useRouter } from 'next/router'
import WatchlistIcon from 'components/icons/WatchlistIcon'
import useAuthToken from 'hooks/useAuthToken'
import { useMutation } from 'react-query'

export interface WatchButtonProps extends ButtonProps {
  chainId?: ChainId
  contractAddress?: string
  tokenID?: BigNumberish
  count?: number
  isLoading?: boolean
  children?: React.ReactNode | ((count: number) => React.ReactNode)
  onCountChange?: (contractAddress: string, tokenID: BigNumberish, current: number, prev: number) => void
  defaultIsWatched?: boolean
}

function WatchButton({
  chainId = ChainId.Ethereum,
  contractAddress,
  tokenID,
  count: inputCount = 0,
  isLoading: isLoadingCount,
  children,
  onCountChange,
  defaultIsWatched = false,
  ...props
}: WatchButtonProps) {
  const { locale } = useRouter()

  const [count, setCount] = useState(inputCount)

  const prevCountRef = useSyncRef(count)

  const [authToken, isLoadingAuthToken] = useAuthToken()

  const { mutateAsync: like, isLoading: isLiking } = useMutation(likeToken)
  const { mutateAsync: unlike, isLoading: isUnliking } = useMutation(unlikeToken)

  const [isWatched, setWatched] = useState(false)

  useEffect(() => setWatched(defaultIsWatched), [defaultIsWatched])

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

    if (!authToken || !contractAddress || !tokenID) return

    const request = isWatched ? unlike : like

    const resp = await request({ queryKey: [authToken, chainId, contractAddress, `${tokenID}`], meta: {} })
    setCount(resp)
    setWatched(prev => !prev)
  }

  const isLoading = isLoadingAuthToken || isLiking || isUnliking

  const disabled = isLoading || !authToken || props.disabled

  function render() {
    if (typeof children === 'function') return children(count)
    if (children) return children
    return (
      <Stack direction="row" align="center" color="value">
        <Text variant="body2" color={isWatched ? 'primary' : 'white'}>
          {count.toLocaleString(locale)}
        </Text>
        <WatchlistIcon isWatched={isWatched} />
      </Stack>
    )
  }

  return (
    <Button
      variant="unstyled"
      minW="fit-content"
      disabled={disabled}
      isLoading={isLoading}
      onClick={onClick}
      display="flex"
      alignItems="center"
      {...props}
    >
      {render()}
    </Button>
  )
}

export default memo(WatchButton)
