import { Stack, StackProps, Text, TextProps } from '@chakra-ui/layout'
import { ChainId } from '@x/constants'
import TokenIcon from './token/TokenIcon'

export interface PriceProps extends StackProps {
  children: React.ReactNode
  tokenId?: string
  chainId?: ChainId
  usdPrice?: number
  priceProps?: TextProps
}

export default function Price({ children, tokenId, chainId, usdPrice, priceProps, ...props }: PriceProps) {
  return (
    <Stack direction="row" alignItems="center" {...props}>
      {tokenId && <TokenIcon chainId={chainId} tokenId={tokenId} w="16px" h="16px" />}
      <Text fontWeight="bold" {...priceProps}>
        {children}
      </Text>
      <Text ml={2} fontSize="xs">
        ($
        {usdPrice ? usdPrice.toLocaleString() : '-'})
      </Text>
    </Stack>
  )
}
