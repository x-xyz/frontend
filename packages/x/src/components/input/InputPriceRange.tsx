import { Input } from '@chakra-ui/input'
import { Stack, Text } from '@chakra-ui/layout'
import { HStack, useControllableState } from '@chakra-ui/react'
import { Select } from '@chakra-ui/select'
import { getChain } from '@x/constants/dist'
import { ChainId, PriceCurrency } from '@x/models'
import { useEffect } from 'react'

export interface PriceRange {
  priceCurrency: PriceCurrency
  minPrice?: string
  maxPrice?: string
}

export interface PriceRangeProps {
  chainId?: ChainId
  value?: PriceRange
  defaultValue?: PriceRange
  onValueChange?: (value: PriceRange) => void
  usdOnly?: boolean
}

export default function InputPriceRange({
  chainId,
  value,
  defaultValue = { priceCurrency: 'usd' },
  onValueChange,
  usdOnly,
}: PriceRangeProps) {
  const currencyName = chainId && getChain(chainId).nativeCurrency.symbol

  const [innerValue, setInnerValue] = useControllableState({ value, defaultValue, onChange: onValueChange })

  return (
    <Stack spacing={3}>
      <Select
        variant="outline"
        value={innerValue.priceCurrency}
        onChange={e => setInnerValue(prev => ({ ...prev, priceCurrency: e.target.value as PriceCurrency }))}
      >
        {chainId && (
          <option value="native" disabled={usdOnly}>
            {currencyName}
          </option>
        )}
        <option value="usd">United States Dollar (USD)</option>
      </Select>
      <HStack spacing={5}>
        <Input
          type="number"
          placeholder="Min"
          value={innerValue.minPrice || ''}
          onChange={e => setInnerValue(prev => ({ ...prev, minPrice: e.target.value }))}
        />
        <Text>to</Text>
        <Input
          type="number"
          placeholder="Max"
          value={innerValue.maxPrice || ''}
          onChange={e => setInnerValue(prev => ({ ...prev, maxPrice: e.target.value }))}
        />
      </HStack>
    </Stack>
  )
}
