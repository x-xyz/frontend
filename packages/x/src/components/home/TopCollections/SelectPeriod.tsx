import { Menu, MenuButton, MenuItem, MenuList, MenuProps, useControllableState } from '@chakra-ui/react'
import { TriangleDownIcon } from '@chakra-ui/icons'
import { CollectionTradingVolumePeriod } from '@x/models/dist'

export interface SelectPeriodProps extends Omit<MenuProps, 'children'> {
  value?: CollectionTradingVolumePeriod
  onChange?: (value: CollectionTradingVolumePeriod) => void
  defaultValue?: CollectionTradingVolumePeriod
  disabled?: boolean
}

const periods = [
  CollectionTradingVolumePeriod.Day,
  CollectionTradingVolumePeriod.Week,
  CollectionTradingVolumePeriod.Month,
  // CollectionTradingVolumePeriod.All,
]

const periodToDisplayText: Record<CollectionTradingVolumePeriod, string> = {
  [CollectionTradingVolumePeriod.Day]: '24 Hours',
  [CollectionTradingVolumePeriod.Week]: '7 Days',
  [CollectionTradingVolumePeriod.Month]: '30 Days',
  [CollectionTradingVolumePeriod.All]: 'All',
}

export default function SelectPeriod({
  value,
  onChange,
  defaultValue = CollectionTradingVolumePeriod.Day,
  disabled,
  ...props
}: SelectPeriodProps) {
  const [period, setPeriod] = useControllableState({ value, onChange, defaultValue })

  function renderMenuItem(period: CollectionTradingVolumePeriod) {
    return (
      <MenuItem key={period} onClick={() => setPeriod(period)}>
        {periodToDisplayText[period]}
      </MenuItem>
    )
  }

  return (
    <Menu placement="bottom-end" {...props}>
      <MenuButton
        fontFamily="A2Gothic-Bold"
        fontSize={['4xl', '4xl', '5xl']}
        fontWeight="bold"
        color="primary"
        disabled={disabled}
      >
        {periodToDisplayText[period]}
        {!disabled && <TriangleDownIcon w="10px" pos="relative" top={-2} left={2} />}
      </MenuButton>
      <MenuList>{periods.map(renderMenuItem)}</MenuList>
    </Menu>
  )
}
