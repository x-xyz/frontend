import { Button, ButtonProps } from '@chakra-ui/button'
import { Text } from '@chakra-ui/layout'
import { Zero } from '@ethersproject/constants'
import { formatUnits } from '@ethersproject/units'
import { ChainId, getChain } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { useBalance } from '@x/hooks'
import { useInterval } from '@x/hooks'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export type AccountBalanceProps = ButtonProps

export default function AccountBalance(props: AccountBalanceProps) {
  const { locale } = useRouter()

  const { chainId } = useActiveWeb3React()

  const { value, isLoading, refresh } = useBalance(chainId)

  const currency = useMemo(() => getChain(chainId as ChainId)?.nativeCurrency, [chainId])

  useInterval(refresh, 5000)

  return (
    <Button isLoading={value === Zero && isLoading} {...props}>
      <Text variant="gradient">
        {parseFloat(formatUnits(value, currency?.decimals)).toLocaleString(locale, { maximumFractionDigits: 3 })}{' '}
        {currency?.symbol}
      </Text>
    </Button>
  )
}
