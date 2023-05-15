import { DateTime } from 'luxon'
import { Box, BoxProps, Text } from '@chakra-ui/layout'
import Address from 'components/Address'
import { useMemo } from 'react'
import SimpleTable from 'components/SimpleTable'
import Price from 'components/Price'
import { TokenHistory } from '@x/models'

export interface HistoryListProps extends BoxProps {
  histories?: TokenHistory[]
  isLoading?: boolean
}

export default function HistoryList({ histories = [], isLoading = false, ...props }: HistoryListProps) {
  const sorted = useMemo(
    () =>
      [...histories].sort((a, b) =>
        DateTime.fromISO(b.createdAt).diff(DateTime.fromISO(a.createdAt), 'milliseconds').toMillis(),
      ),
    [histories],
  )

  return (
    <Box overflowX="auto" {...props}>
      <SimpleTable
        fields={[
          {
            key: 'price',
            name: 'Price',
            render: history => (
              <Price chainId={history.chainId} tokenId={history.paymentToken} usdPrice={history.priceInUsd}>
                {history.price}
              </Price>
            ),
          },
          {
            key: 'from',
            name: 'From',
            render: history => (
              <Address type="account" fontSize="xs">
                {history.from}
              </Address>
            ),
          },
          {
            key: 'to',
            name: 'To',
            render: history => (
              <Address type="account" fontSize="xs">
                {history.to}
              </Address>
            ),
          },
          {
            key: 'date',
            name: 'Date',
            render: history => (
              <Text fontSize="xs">
                {DateTime.fromISO(history.createdAt).toLocaleString({ dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            ),
          },
        ]}
        data={sorted}
        isLoading={isLoading}
      />
    </Box>
  )
}
