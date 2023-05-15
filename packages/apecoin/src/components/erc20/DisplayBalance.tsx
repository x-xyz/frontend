import { useRouter } from 'next/router'

import { SkeletonText, SkeletonTextProps } from '@chakra-ui/react'
import { formatUnits } from '@ethersproject/units'
import { TokenMeta } from '@x/constants'
import { useBalance, useErc20BalanceByToken } from '@x/hooks'

export interface DisplayBalanceProps extends SkeletonTextProps {
  token: TokenMeta
}

export default function DisplayBalance({ token, ...props }: DisplayBalanceProps) {
  if (token.isNative) return <DisplayNativeBalance token={token} {...props} />
  return <DisplayErc20Balance token={token} {...props} />
}

function DisplayNativeBalance({ token, ...props }: DisplayBalanceProps) {
  const { locale } = useRouter()
  const { value, isLoading } = useBalance(token.chainId)
  return (
    <SkeletonText noOfLines={1} isLoaded={!isLoading} {...props}>
      {parseFloat(formatUnits(value, token.decimals)).toLocaleString(locale)}
    </SkeletonText>
  )
}

function DisplayErc20Balance({ token, ...props }: DisplayBalanceProps) {
  const { locale } = useRouter()
  const { value, isLoading } = useErc20BalanceByToken(token)
  return (
    <SkeletonText noOfLines={1} isLoaded={!isLoading} {...props}>
      {parseFloat(formatUnits(value, token.decimals)).toLocaleString(locale)}
    </SkeletonText>
  )
}
