import { Stack, StackProps, Text, TextProps } from '@chakra-ui/layout'
import { ChainId } from '@x/constants'
import { findToken } from '@x/constants'
import { ensureNumber } from '@x/utils'
import TokenIcon from './token/TokenIcon'
import UsdPrice from './UsdPrice'

export interface PriceProps extends StackProps {
  children: React.ReactNode
  tokenId?: string
  chainId?: ChainId
  usdPrice?: number
  noUsdPrice?: boolean
  hideIcon?: boolean
  textProps?: TextProps
}

export default function Price({
  children,
  tokenId,
  chainId,
  usdPrice,
  noUsdPrice,
  hideIcon,
  textProps,
  ...props
}: PriceProps) {
  function renderUsdPrice() {
    if (usdPrice) return usdPrice
    return (
      <UsdPrice chainId={chainId} tokenId={tokenId}>
        {ensureNumber(children)}
      </UsdPrice>
    )
  }

  return (
    <Stack direction="row" alignItems="center" {...props}>
      {tokenId && !hideIcon && <TokenIcon chainId={chainId} tokenId={tokenId} height="24px" />}
      <Text whiteSpace="nowrap" color="currentcolor" {...textProps}>
        {children} {tokenId && findToken(tokenId, chainId)?.symbol.toUpperCase()}
      </Text>
      {!noUsdPrice && (
        <Text ml={2} fontSize="xs" color="currentcolor" whiteSpace="nowrap">
          (${renderUsdPrice()})
        </Text>
      )}
    </Stack>
  )
}
