import { Checkbox, CheckboxGroup, CheckboxGroupProps } from '@chakra-ui/checkbox'
import { Stack } from '@chakra-ui/layout'
import { TokenStatus } from '@x/models'

export interface StatusOption {
  value: TokenStatus
  label: string
}

export const statusOptions: StatusOption[] = [
  { value: TokenStatus.BuyNow, label: 'Buy Now' },
  { value: TokenStatus.HasBid, label: 'Has Bids' },
  { value: TokenStatus.HasOffer, label: 'Has Offers' },
  // { value: TokenStatus.OnAuction, label: 'On Auction' },
]

export interface SelectTokenStatusProps extends Omit<CheckboxGroupProps, 'children'> {
  value?: TokenStatus[]
  onChange?: (value: TokenStatus[]) => void
  hideOptions?: TokenStatus[]
}

export default function SelectTokenStatus({ value = [], hideOptions, ...props }: SelectTokenStatusProps) {
  return (
    <CheckboxGroup value={value} {...props}>
      <Stack>
        {statusOptions
          .filter(option => !hideOptions?.includes(option.value))
          .map(({ value, label }) => (
            <Checkbox key={value} value={value} checked={!!value?.includes(value)}>
              {label}
            </Checkbox>
          ))}
      </Stack>
    </CheckboxGroup>
  )
}
