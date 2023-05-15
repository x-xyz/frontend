import { TextProps } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/react'
import { formatUnits } from '@ethersproject/units'
import { ChainId, defaultNetwork } from '@x/constants'
import { findToken } from '@x/constants'
import { useBalance, useErc20Balance } from '@x/hooks'
import { useErc20Contract } from '@x/hooks'
import { useInterval } from '@x/hooks'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export interface TokenBalanceProps extends TextProps {
  chainId?: ChainId
  tokenId?: string
}

export default function TokenBalance({ chainId = defaultNetwork, tokenId, ...props }: TokenBalanceProps) {
  const { locale } = useRouter()

  const token = useMemo(() => (tokenId ? findToken(tokenId, chainId) : undefined), [tokenId, chainId])

  const nativeBalance = useBalance(chainId)

  const erc20Contract = useErc20Contract(token?.address, chainId)

  const erc20Balance = useErc20Balance(erc20Contract)

  const balance = token?.isNative ? nativeBalance : erc20Balance

  useInterval(() => balance.refresh(), 5000)

  return (
    <SkeletonText isLoaded={!!balance.value || !balance.isLoading} noOfLines={1} {...props}>
      {`Balance: ${parseFloat(formatUnits(balance.value, token?.decimals)).toLocaleString(locale, {
        maximumFractionDigits: 4,
      })} ${token?.symbol}`}
    </SkeletonText>
  )
}
