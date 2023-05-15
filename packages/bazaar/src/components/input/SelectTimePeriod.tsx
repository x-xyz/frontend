import { Select, SelectProps, useCallbackRef, useControllableState } from '@chakra-ui/react'
import { TimePeriod } from '@x/models'
import { forwardRef, useMemo } from 'react'

export interface SelectTimePeriodProps extends SelectProps {
  value?: TimePeriod
  defaultValue?: TimePeriod
  onValueChange?: (value: TimePeriod) => void
  hideOptions?: TimePeriod[]
  timePeriodToLabel?: Partial<Record<TimePeriod, string>>
}

const allOptions = [
  TimePeriod.Day,
  TimePeriod.Week,
  TimePeriod.TwoWeeks,
  TimePeriod.Month,
  TimePeriod.TwoMonth,
  TimePeriod.Year,
  TimePeriod.All,
]

const defaultTimePeriodToLabel: Record<TimePeriod, string> = {
  [TimePeriod.Day]: 'Day',
  [TimePeriod.Week]: 'Week',
  [TimePeriod.TwoWeeks]: '2 Weeks',
  [TimePeriod.Month]: 'Month',
  [TimePeriod.TwoMonth]: '2 Months',
  [TimePeriod.Year]: 'Year',
  [TimePeriod.All]: 'All',
}

export default forwardRef<HTMLSelectElement, SelectTimePeriodProps>(
  (
    {
      hideOptions,
      value,
      defaultValue,
      onValueChange,
      onChange,
      timePeriodToLabel = defaultTimePeriodToLabel,
      ...props
    },
    ref,
  ) => {
    const options = useMemo(() => {
      if (!hideOptions) return allOptions
      return allOptions.filter(o => !hideOptions.includes(o))
    }, [hideOptions])
    const [innerValue, setInnerValue] = useControllableState({ value, defaultValue, onChange: onValueChange })
    const innerOnChange = useCallbackRef(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setInnerValue(e.target.value as TimePeriod)
        onChange?.(e)
      },
      [onChange, setInnerValue],
    )
    return (
      <Select ref={ref} value={innerValue} onChange={innerOnChange} {...props}>
        {options.map(o => (
          <option key={o} value={o}>
            {timePeriodToLabel[o] || defaultTimePeriodToLabel[o]}
          </option>
        ))}
      </Select>
    )
  },
)
