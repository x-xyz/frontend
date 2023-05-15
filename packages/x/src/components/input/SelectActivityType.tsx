import { Checkbox, CheckboxGroup, CheckboxGroupProps } from '@chakra-ui/checkbox'
import { Stack } from '@chakra-ui/layout'
import { ActivityTypeV2 } from '@x/models'

export interface ActivityTypeV2Option {
  value: ActivityTypeV2
  label: string
}

export const activityTypeOptions: ActivityTypeV2Option[] = [
  { value: ActivityTypeV2.CreateOffer, label: 'Offer' },
  { value: ActivityTypeV2.List, label: 'List' },
  { value: ActivityTypeV2.PlaceBid, label: 'Bid' },
  { value: ActivityTypeV2.Buy, label: 'Buy' },
  { value: ActivityTypeV2.Sold, label: 'Sale' },
  { value: ActivityTypeV2.Transfer, label: 'Transfer' },
  { value: ActivityTypeV2.Mint, label: 'Mint' },
  { value: ActivityTypeV2.CancelOffer, label: 'Cancel Offer' },
  { value: ActivityTypeV2.CancelListing, label: 'Cancel Listing' },
]

export interface SelectTokenStatusProps extends Omit<CheckboxGroupProps, 'children'> {
  value?: ActivityTypeV2[]
  onChange?: (value: ActivityTypeV2[]) => void
  hideOptions?: ActivityTypeV2[]
}

export default function SelectActivityTypeV2({ value = [], hideOptions, ...props }: SelectTokenStatusProps) {
  return (
    <CheckboxGroup value={value} {...props}>
      <Stack>
        {activityTypeOptions
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
