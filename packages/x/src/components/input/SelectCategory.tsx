import { useControllableState } from '@chakra-ui/hooks'
import { Category, CategoryOption, categoryOptions, toCategory } from '@x/models'
import { Image, Radio, RadioGroup, RadioGroupProps, Stack, Text } from '@chakra-ui/react'

export interface SelectCategoryProps extends Omit<RadioGroupProps, 'children'> {
  value?: Category
  defaultValue?: Category
  onValueChange?: (value: Category) => void
}

export default function SelectCategory({
  value,
  defaultValue = Category.All,
  onValueChange,
  ...props
}: SelectCategoryProps) {
  const [category, setCategory] = useControllableState({ value, defaultValue, onChange: onValueChange })

  function renderOption({ value, label, icon }: CategoryOption) {
    return (
      <Radio key={value} value={value}>
        <Stack direction="row" align="center">
          {icon && <Image src={icon} w={4} h={4} />}
          <Text fontSize="sm" fontWeight="bold" color="currentcolor">
            {label}
          </Text>
        </Stack>
      </Radio>
    )
  }

  return (
    <RadioGroup {...props} value={category} onChange={v => setCategory(toCategory(v))}>
      <Stack>{categoryOptions.map(renderOption)}</Stack>
    </RadioGroup>
  )
}
