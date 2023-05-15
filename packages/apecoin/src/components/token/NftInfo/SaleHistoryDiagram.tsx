import { ChainId, PriceHistory, TimePeriod } from '@x/models'
import { useTokenPriceHistoriesQuery } from '@x/apis'
import { useState } from 'react'

export interface SaleHistoryDiagramProps {
  chainId: ChainId
  contract: string
  tokenId: string
}

export default function SaleHistoryDiagram({ chainId, contract, tokenId }: SaleHistoryDiagramProps) {
  const [period, setPeriod] = useState(TimePeriod.All)
  const { data, isLoading, isFetching } = useTokenPriceHistoriesQuery({ chainId, contract, tokenId, period })

  /**
   * @todo ui
   */
  return null
}
