import { Stat, StatGroup, StatGroupProps, StatLabel, StatNumber } from '@chakra-ui/stat'
import { formatUnits } from '@ethersproject/units'
import { BigNumberish } from '@ethersproject/bignumber'
import { findToken } from '@x/constants'
import { useMemo } from 'react'
import { Stack, Text } from '@chakra-ui/layout'
import { ChainId } from '@x/constants'
import TokenIcon from 'components/token/TokenIcon'

export interface AuctionReservePriceProps extends StatGroupProps {
  price: BigNumberish
  paymentToken: string
  chainId: ChainId
}

export default function AuctionReservePrice({ price, paymentToken, chainId, ...props }: AuctionReservePriceProps) {
  const token = useMemo(() => findToken(paymentToken, chainId), [paymentToken, chainId])

  return (
    <StatGroup flexShrink={0} {...props}>
      <Stat>
        <StatLabel color="primary" fontWeight="bold">
          Reserve Price
        </StatLabel>
        <StatNumber>
          <Stack direction="row" alignItems="center">
            <TokenIcon chainId={chainId} tokenId={paymentToken} height="24px" />
            <Text fontSize="4xl" fontWeight="bold">
              {formatUnits(price, token?.decimals)}
              <Text as="span" fontSize="xs" ml={2} fontWeight="medium">
                {token?.symbol.toUpperCase()}
              </Text>
            </Text>
          </Stack>
        </StatNumber>
      </Stat>
    </StatGroup>
  )
}
