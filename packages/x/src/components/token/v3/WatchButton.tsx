import { memo, useEffect, useState } from 'react'
import { Button, ButtonProps } from '@chakra-ui/button'
import { Stack, Text } from '@chakra-ui/layout'
import { BigNumberish } from '@ethersproject/bignumber'
import { useAuthToken } from '@x/hooks'
import { useSyncRef } from '@x/hooks'
import { useLikeTokenMutation, useUnlikeTokenMutation } from '@x/apis'
import { ChainId } from '@x/constants'
import { isErrorResponse } from '@x/utils'
import { useRouter } from 'next/router'
import WatchlistIcon from '../../icons/WatchlistIcon'

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
  chainId = ChainId.Fantom,
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

  const [like, { isLoading: isLiking }] = useLikeTokenMutation()

  const [unlike, { isLoading: isUnliking }] = useUnlikeTokenMutation()

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

    if (!authToken) return

    if (!contractAddress) return

    if (!tokenID) return

    const request = isWatched ? unlike : like

    const resp = await request({ chainId, contract: contractAddress, tokenId: tokenID.toString(), authToken })

    if (isErrorResponse(resp)) {
      return
    } else if (resp.data.status === 'success') {
      setCount(resp.data.data)
    }

    setWatched(prev => !prev)
  }

  const isLoading = isLoadingAuthToken || isLiking || isUnliking

  const disabled = isLoading || !authToken || props.disabled

  function render() {
    if (typeof children === 'function') return children(count)
    if (children) return children
    return (
      <Stack direction="row" align="center" color="value" px={5} py={2} spacing={3}>
        <WatchlistIcon w={5} h={5} isWatched={isWatched} />
        <Text fontWeight="bold" color={isWatched ? 'pink' : 'placeholder'}>
          {count.toLocaleString(locale)}
        </Text>
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
