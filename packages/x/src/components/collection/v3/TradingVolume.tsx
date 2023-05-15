import Price, { PriceProps } from 'components/v3/Price'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

import { useTradingVolumeQuery } from '@x/apis'
import { getChain } from '@x/constants'
import { ChainId, TradingVolumePeriod } from '@x/models'

export interface TradingVolumeProps extends Omit<PriceProps, 'price' | 'priceInUsd'> {
  chainId: ChainId
  contract: string
  period: TradingVolumePeriod
  date: string | Date | DateTime
}

const periodToLabel: Record<TradingVolumePeriod, string> = {
  [TradingVolumePeriod.Day]: '(24h)',
  [TradingVolumePeriod.Week]: '(7d)',
  [TradingVolumePeriod.Month]: '(30d)',
  [TradingVolumePeriod.All]: '',
  [TradingVolumePeriod.Unknown]: '',
}

export default function TradingVolume({ chainId, contract, period, date, ...props }: TradingVolumeProps) {
  const parsedDate = useMemo(() => {
    let d: DateTime
    if (typeof date === 'string') d = DateTime.fromISO(date)
    else if (date instanceof Date) d = DateTime.fromJSDate(date)
    else d = date
    return d.toUTC().startOf('day').toISO()
  }, [date])
  const chain = useMemo(() => getChain(chainId), [chainId])
  const { data, isLoading, isFetching } = useTradingVolumeQuery({ chainId, contract, period, date: parsedDate })
  return (
    <Price
      label={['Total Volume', periodToLabel[period]].join(' ')}
      price={data?.data?.volume}
      priceInUsd={data?.data?.volumeInUsd}
      unit={chain.nativeCurrency.symbol}
      isLoading={isFetching || isLoading}
      {...props}
    />
  )
}
