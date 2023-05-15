import { Skeleton, SkeletonProps } from '@chakra-ui/skeleton'
import { ChainId } from '@x/constants'
import { useUsdPrice } from '@x/hooks'

export interface UsdPriceProps extends SkeletonProps {
  // address or symbol
  tokenId?: string | null
  chainId?: ChainId
  children?: number
  locale?: string
  format?: Intl.NumberFormatOptions
}

export default function UsdPrice({ tokenId, chainId, children = 0, locale, format, ...props }: UsdPriceProps) {
  const [unitPrice, isLoading] = useUsdPrice(tokenId, chainId)

  return (
    <Skeleton as="span" isLoaded={!isLoading} noOfLines={1} {...props} sx={{ display: 'inline' }}>
      {(children * unitPrice).toLocaleString(locale, format)}
    </Skeleton>
  )
}
