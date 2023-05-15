import { Input } from '@chakra-ui/input'
import { Stack, Text } from '@chakra-ui/layout'
import { useControllableState } from '@chakra-ui/react'
import { Select } from '@chakra-ui/select'
import { getChain } from '@x/constants/dist'
import { ChainId, PriceCurrency } from '@x/models'
import CaretDown from '../icons/CaretDown'

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
}

export default function InputPriceRange({
  chainId,
  value,
  defaultValue = { priceCurrency: 'usd' },
  onValueChange,
}: PriceRangeProps) {
  const currencyName = chainId && getChain(chainId).nativeCurrency.symbol

  const [innerValue, setInnerValue] = useControllableState({ value, defaultValue, onChange: onValueChange })

  return (
    <Stack direction="row" align="center" fontSize="xs">
      <Select
        variant="outline"
        value={innerValue.priceCurrency}
        onChange={e => setInnerValue(prev => ({ ...prev, priceCurrency: e.target.value as PriceCurrency }))}
        icon={<CaretDown />}
      >
        {chainId && <option value="native">{currencyName}</option>}
        <option value="usd">USD</option>
      </Select>
      <Input
        type="number"
        placeholder="Min"
        value={innerValue.minPrice || ''}
        onChange={e => setInnerValue(prev => ({ ...prev, minPrice: e.target.value }))}
        w={16}
        minW={16}
      />
      <Text fontSize="xs">to</Text>
      <Input
        type="number"
        placeholder="Max"
        value={innerValue.maxPrice || ''}
        onChange={e => setInnerValue(prev => ({ ...prev, maxPrice: e.target.value }))}
        w={16}
        minW={16}
      />
    </Stack>
  )
}
