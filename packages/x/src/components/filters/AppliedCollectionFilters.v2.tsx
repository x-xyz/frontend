import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { Badge, Button, CloseButton, Spacer, Stack, StackProps } from '@chakra-ui/react'
import { getChain } from '@x/constants'
import { Category, getCategoryName, SearchCollectionParams } from '@x/models'

export interface AppliedCollectionFiltersProps extends StackProps {
  hideFilters?: (keyof SearchCollectionParams)[]
  value?: SearchCollectionParams
  onValueChange?: (value: SearchCollectionParams) => void
}

export default function AppliedCollectionFilters({
  hideFilters = [],
  value,
  onValueChange = () => void 0,
  ...props
}: AppliedCollectionFiltersProps) {
  const { locale } = useRouter()

  const {
    chainId,
    category,
    floorPriceGTE = '',
    floorPriceLTE = '',
    usdFloorPriceGTE = '',
    usdFloorPriceLTE = '',
  } = value || {}

  const canClearFilters = [
    chainId,
    category !== void 0 && category !== Category.All,
    floorPriceGTE !== void 0 || floorPriceLTE !== void 0,
    usdFloorPriceGTE !== void 0 || usdFloorPriceLTE !== void 0,
  ].some(Boolean)

  const chain = chainId && getChain(chainId)

  const clearFilters = useCallback(() => {
    const newValue = { ...value }
    if (!hideFilters.includes('chainId')) delete newValue.chainId
    if (!hideFilters.includes('category')) delete newValue.category
    if (!hideFilters.includes('floorPriceGTE')) delete newValue.floorPriceGTE
    if (!hideFilters.includes('floorPriceLTE')) delete newValue.floorPriceLTE
    if (!hideFilters.includes('usdFloorPriceGTE')) delete newValue.usdFloorPriceGTE
    if (!hideFilters.includes('usdFloorPriceLTE')) delete newValue.usdFloorPriceLTE
    onValueChange(newValue)
  }, [hideFilters, value, onValueChange])

  return (
    <Stack direction="row" {...props}>
      {!hideFilters.includes('chainId') && chain && (
        <Badge>
          {chain.name}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, chainId: void 0 })} />
        </Badge>
      )}
      {!hideFilters.includes('category') && category !== void 0 && category !== Category.All && (
        <Badge>
          {getCategoryName(category)}
          <Spacer />
          <CloseButton onClick={() => onValueChange({ ...value, category: void 0 })} />
        </Badge>
      )}
      {!hideFilters.includes('floorPriceGTE') &&
        !hideFilters.includes('floorPriceLTE') &&
        chain &&
        (floorPriceGTE || floorPriceLTE) && (
          <Badge>
            ({chain.nativeCurrency.symbol}) {parseFloat(floorPriceGTE).toLocaleString(locale) || '-'} -{' '}
            {parseFloat(floorPriceLTE).toLocaleString(locale) || '-'}
            <Spacer />
            <CloseButton onClick={() => onValueChange({ ...value, floorPriceGTE: void 0, floorPriceLTE: void 0 })} />
          </Badge>
        )}
      {!hideFilters.includes('usdFloorPriceGTE') &&
        !hideFilters.includes('usdFloorPriceLTE') &&
        (usdFloorPriceGTE || usdFloorPriceLTE) && (
          <Badge>
            (USD) {parseFloat(usdFloorPriceGTE).toLocaleString(locale) || '-'} -{' '}
            {parseFloat(usdFloorPriceLTE).toLocaleString(locale) || '-'}
            <Spacer />
            <CloseButton
              onClick={() => onValueChange({ ...value, usdFloorPriceGTE: void 0, usdFloorPriceLTE: void 0 })}
            />
          </Badge>
        )}
      {canClearFilters && (
        <Button variant="badge" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </Stack>
  )
}
