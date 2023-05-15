import { useCallbackRef } from '@chakra-ui/hooks'
import { Select, SelectProps } from '@chakra-ui/select'
import { Category } from '@x/models'
import React from 'react'
import { ensureNumber } from '@x/utils'

export interface CategoryOption {
  value: Category
  label: string
  icon?: string
}

export const categoryOptions: CategoryOption[] = [
  { value: Category.All, label: 'All' },
  {
    value: Category.Art,
    label: 'Art',
    icon: '/assets/icons/rainbow.svg',
  },
  {
    value: Category.Collectibles,
    label: 'Collectibles',
    icon: '/assets/icons/bear.svg',
  },
  {
    value: Category.Sports,
    label: 'Sports',
    icon: '/assets/icons/soccerball.svg',
  },
  {
    value: Category.Utility,
    label: 'Utility',
    icon: '/assets/icons/tools.svg',
  },
  {
    value: Category.TradingCards,
    label: 'Trading Cards',
    icon: '/assets/icons/cardboard.svg',
  },
  {
    value: Category.VirtualWorlds,
    label: 'Virtual Worlds',
    icon: '/assets/icons/monster.svg',
  },
  {
    value: Category.DomainNames,
    label: 'Domain Names',
    icon: '/assets/icons/domain.svg',
  },
]

export interface SelectCategoryProps extends Omit<SelectProps, 'children'> {
  value?: Category
  onValueChange?: (value: Category) => void
}

export default function SelectCategory({ onValueChange, ...props }: SelectCategoryProps) {
  const onChange = useCallbackRef(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) onValueChange(ensureNumber(e.target.value, Category.All))
      if (props.onChange) props.onChange(e)
    },
    [onValueChange, props.onChange],
  )

  return (
    <Select {...props} onChange={onChange}>
      {categoryOptions.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  )
}
