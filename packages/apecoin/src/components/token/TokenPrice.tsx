import { SkeletonCircle, SkeletonText, Stack, StackProps } from '@chakra-ui/react'
import { fetchTokenV2 } from '@x/apis/fn'
import { findToken } from '@x/constants/dist'
import { ChainId, PriceSource } from '@x/models'
import TokenIcon from 'components/icons/TokenIcon'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

interface RenderProps {
  isLoading?: boolean
  paymentToken?: string
  price?: number
  priceSource?: PriceSource
}

export interface TokenPriceProps extends StackProps {
  chainId: ChainId
  contract: string
  tokenId: string
  children?: (props: RenderProps) => React.ReactNode
  locale?: string
}

export default function TokenPrice({ chainId, contract, tokenId, children, locale, ...props }: TokenPriceProps) {
  const { data, isLoading } = useQuery(['token', chainId, contract, tokenId], fetchTokenV2)
  function render({ paymentToken, price, isLoading }: RenderProps) {
    return (
      <>
        <SkeletonCircle isLoaded={!isLoading} w={5} h={5}>
          {paymentToken && <TokenIcon chainId={chainId} tokenId={paymentToken} />}
        </SkeletonCircle>
        <SkeletonText noOfLines={1} isLoaded={!isLoading}>
          {price?.toLocaleString(locale)} {!!paymentToken && findToken(paymentToken, chainId)?.symbol}
        </SkeletonText>
      </>
    )
  }
  const renderProps = useMemo<RenderProps>(
    () => ({ isLoading, paymentToken: data?.paymentToken, price: data?.price, priceSource: data?.priceSource }),
    [isLoading, data],
  )
  return (
    <Stack direction="row" align="center" {...props}>
      {children ? children(renderProps) : render(renderProps)}
    </Stack>
  )
}
