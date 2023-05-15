import { useEffect, useMemo } from 'react'
import { getCoingeckoId } from '@x/constants'
import { useLazyUsdPriceQuery } from '@x/apis'
import { ChainId } from '@x/constants'
import { useAppSelector, useAppDispatch, fetchUsdPrice, setUsdPrice, clearUsdPriceQueue } from '@x/store'
import { useDebouncedValue } from './useDebouncedValue'

export function useUsdPrice(tokenId?: string | null, chainId = ChainId.Fantom) {
  const id = useMemo(() => tokenId && getCoingeckoId(chainId, tokenId), [chainId, tokenId])

  const value = useAppSelector(state => !!id && state.coingecko.usdPrice[id])

  const dispatch = useAppDispatch()

  const usdPrice = typeof value === 'number' ? value : 0

  const isLoading = typeof value !== 'number'

  useEffect(() => {
    if (id) dispatch(fetchUsdPrice([id]))
  }, [id, dispatch])

  return [usdPrice, isLoading] as const
}

export function UsdPriceResolver() {
  const usdPriceQueue = useDebouncedValue(
    useAppSelector(store => store.coingecko.usdPriceQueue),
    1000,
  )

  const [fetch, { data }] = useLazyUsdPriceQuery()

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (usdPriceQueue.length > 0) {
      fetch(usdPriceQueue)
      dispatch(clearUsdPriceQueue())
    }
  }, [usdPriceQueue, fetch, dispatch])

  useEffect(() => {
    if (!data) return

    for (const id in data) {
      dispatch(setUsdPrice({ id, price: data[id]?.usd || 0 }))
    }
  }, [data, dispatch])

  return null
}
