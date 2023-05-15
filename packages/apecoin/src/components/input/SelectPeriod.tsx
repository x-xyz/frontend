import {
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  MenuProps,
  Spacer,
  Stack,
  Text,
  useControllableState,
} from '@chakra-ui/react'
import { ChevronDownIcon, TriangleDownIcon } from '@chakra-ui/icons'

export enum Period {
  None,
  Day,
  Week,
  Month,
}

export interface SelectPeriodProps extends Omit<MenuProps, 'children'> {
  value?: Period
  onChange?: (value: Period) => void
  defaultValue?: Period
  disabled?: boolean
  buttonProps?: MenuButtonProps
}

const periods = [Period.None, Period.Day, Period.Week, Period.Month]

const periodToDisplayText: Record<Period, string> = {
  [Period.None]: '-',
  [Period.Day]: '24 Hours',
  [Period.Week]: '7 Days',
  [Period.Month]: '30 Days',
}

export default function SelectPeriod({
  value,
  onChange,
  defaultValue = Period.Day,
  disabled,
  buttonProps,
  ...props
}: SelectPeriodProps) {
  const [period, setPeriod] = useControllableState({ value, onChange, defaultValue })

  function renderMenuItem(period: Period) {
    return (
      <MenuItem key={period} onClick={() => setPeriod(period)}>
        {periodToDisplayText[period]}
      </MenuItem>
    )
  }

  return (
    <Menu isLazy={true} {...props}>
      <MenuButton type="button" disabled={disabled} {...buttonProps}>
        <Stack direction="row" align="center">
          <Text whiteSpace="nowrap">{periodToDisplayText[period]}</Text>
          <Spacer />
          {!disabled && <ChevronDownIcon />}
        </Stack>
      </MenuButton>
      <MenuList>{periods.map(renderMenuItem)}</MenuList>
    </Menu>
  )
}
