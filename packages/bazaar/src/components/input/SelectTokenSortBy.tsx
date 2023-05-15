import { useCallbackRef } from '@chakra-ui/hooks'
import { Select, SelectProps } from '@chakra-ui/select'
import { TokenSortOption } from '@x/models'

export interface SortableOption {
  value: TokenSortOption
  label: string
}

export const sortableOptions: SortableOption[] = [
  { value: 'createdAt', label: 'Recently Created' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'listedAt', label: 'Recently Listed' },
  { value: 'soldAt', label: 'Recently Sold' },
  { value: 'saleEndsAt', label: 'Ending Soon' },
  { value: 'price', label: 'Most expensive' },
  { value: 'cheapest', label: 'Cheapest' },
  // { value: 'lastSalePrice', label: 'Highest Last Sale' },
  { value: 'viewed', label: 'Mostly Viewed' },
]

export interface SelectTokenSortByProps extends Omit<SelectProps, 'children'> {
  value?: TokenSortOption
  onValueChange?: (value: TokenSortOption) => void
}

export default function SelectTokenSortBy({ onValueChange, ...props }: SelectTokenSortByProps) {
  const onChange = useCallbackRef(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) onValueChange(e.target.value as TokenSortOption)
      if (props.onChange) props.onChange(e)
    },
    [onValueChange, props.onChange],
  )

  return (
    <Select {...props} onChange={onChange}>
      {sortableOptions.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  )
}
