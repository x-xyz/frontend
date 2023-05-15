import { Stack } from '@chakra-ui/layout'
import { Radio, RadioGroup, RadioGroupProps } from '@chakra-ui/radio'
import { TokenSaleType } from '@x/models'

export interface SelectTokenTypeProps extends Omit<RadioGroupProps, 'children'> {
  value?: TokenSaleType
  onChange?: (value: TokenSaleType) => void
}

export default function SelectTokenType(props: SelectTokenTypeProps) {
  return (
    <RadioGroup {...props}>
      <Stack>
        <Radio value="all">All</Radio>
        <Radio value="single">Single</Radio>
      </Stack>
    </RadioGroup>
  )
}
