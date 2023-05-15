import { FeeDistType } from '@x/models'
import Select, { Options } from 'components/input/ReactSelect'

export interface SelectFeeDistTypeProps {
  value?: FeeDistType
  onChange?: (value: FeeDistType) => void
}

interface FeeDistTypeOption {
  label: string
  value: FeeDistType
}

const options: Options<FeeDistTypeOption> = [
  { label: 'Burn $APE', value: FeeDistType.Burn },
  { label: 'Donate $APE', value: FeeDistType.Donate },
]

export default function SelectFeeDistType({ value, onChange }: SelectFeeDistTypeProps) {
  return (
    <Select
      value={options.find(option => option.value === value)}
      onChange={option => option && onChange?.(option.value)}
      options={options}
      getOptionLabel={option => option.label}
      getOptionValue={option => option.value}
      isMulti={false}
    />
  )
}
