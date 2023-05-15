import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { Grid, GridItem, Heading, SkeletonText, Stack, Stat, StatHelpText, StatNumber } from '@chakra-ui/react'
import { fetchPrice } from '@x/apis/dist/fn/coin'
import { TokenMeta } from '@x/constants/dist'

export interface ProfitEstimationProps {
  sellPrice: number
  sellPaymentToken: TokenMeta
  xMarketplaceFee?: number
  royalty?: number
}

export default function ProfitEstimation({
  sellPrice,
  sellPaymentToken,
  xMarketplaceFee = 0.0169,
  royalty = 0,
}: ProfitEstimationProps) {
  const earning = useMemo(() => sellPrice * (1 - xMarketplaceFee - royalty), [sellPrice, xMarketplaceFee, royalty])
  const { data: unitPrice = '0', isLoading: isLoadingUnitPrice } = useQuery(
    ['price', sellPaymentToken.name.toLowerCase()],
    fetchPrice,
  )
  return (
    <Stack>
      <Heading as="h5" fontSize="xl" borderBottom="1px solid" borderColor="divider" pb={1}>
        Price and Fees
      </Heading>
      <Grid templateColumns="1fr auto" lineHeight={1.2} py={3}>
        <GridItem color="note">NFT</GridItem>
        <GridItem fontWeight="bold" textAlign="right">
          {sellPrice.toLocaleString(void 0, { maximumFractionDigits: 4 })} {sellPaymentToken.symbol}
        </GridItem>
        <GridItem color="note">X Marketplace Fees</GridItem>
        <GridItem fontWeight="bold" textAlign="right">
          {(xMarketplaceFee * 100).toFixed(2)}%
        </GridItem>
        <GridItem color="note">Creator Royalties</GridItem>
        <GridItem fontWeight="bold" textAlign="right">
          {(royalty * 100).toFixed(2)}%
        </GridItem>
      </Grid>
      <Heading as="h5" fontSize="xl" borderBottom="1px solid" borderColor="divider" pb={1}>
        Total Earnings
      </Heading>
      <Stat textAlign="right">
        <StatNumber fontSize="4xl">
          {earning.toLocaleString(void 0, { maximumFractionDigits: 4 })} {sellPaymentToken.symbol}
        </StatNumber>
        <StatHelpText>
          <SkeletonText noOfLines={1} isLoaded={!isLoadingUnitPrice}>
            {(parseFloat(unitPrice) * earning).toLocaleString()} USD
          </SkeletonText>
        </StatHelpText>
      </Stat>
    </Stack>
  )
}
