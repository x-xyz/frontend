import { Stack, Text } from '@chakra-ui/layout'
import { Stat, StatGroup, StatGroupProps, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/stat'
import { formatUnits } from '@ethersproject/units'
import TokenIcon from 'components/token/TokenIcon'
import { ChainId } from '@x/constants'
import { findToken } from '@x/constants'
import { useActiveWeb3React } from '@x/hooks'
import { Bidder } from '@x/models'
import { useMemo } from 'react'
import { compareAddress } from '@x/utils'

export interface HighestBidderProps extends StatGroupProps {
  bidder: Bidder
  paymentToken: string
  chainId: ChainId
  winner?: boolean
}

export default function HighestBidder({ bidder, paymentToken, chainId, winner, ...props }: HighestBidderProps) {
  const token = useMemo(() => findToken(paymentToken, chainId), [paymentToken, chainId])

  const { account } = useActiveWeb3React()

  return (
    <StatGroup flexShrink={0} {...props}>
      <Stat>
        <StatLabel color="primary" fontWeight="bold">
          {winner ? 'Win Bid' : 'Highest Bid'}
        </StatLabel>
        <StatNumber color="primary" fontSize="4xl">
          <Stack direction="row" alignItems="center">
            <TokenIcon chainId={chainId} tokenId={paymentToken} height="24px" />
            <Text fontSize="4xl" fontWeight="bold">
              {formatUnits(bidder.bid, token?.decimals)}
              <Text as="span" fontSize="xs" ml={2} fontWeight="medium">
                {token?.symbol.toUpperCase()}
              </Text>
            </Text>
          </Stack>
        </StatNumber>
        <StatHelpText>{compareAddress(bidder.bidder, account) && 'from Me'}</StatHelpText>
      </Stat>
    </StatGroup>
  )
}
