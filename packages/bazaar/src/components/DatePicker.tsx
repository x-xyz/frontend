import { styled, BorderProps, LayoutProps } from '@chakra-ui/system'
import { forwardRef } from 'react'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const StyledDatePicker = styled(ReactDatePicker)

export type DatePickerProps = ReactDatePickerProps & LayoutProps & BorderProps

function DatePicker(props: DatePickerProps, ref: React.ForwardedRef<any>) {
  return (
    <StyledDatePicker
      ref={ref}
      borderColor="divider"
      borderWidth="1px"
      borderRadius="10px"
      background="background"
      px={4}
      h={10}
      w="full"
      clearButtonClassName="date-picker-clear-button"
      sx={{
        '&+.date-picker-clear-button::after': {
          backgroundColor: 'primary',
          color: 'background',
        },
      }}
      _disabled={{ color: 'gray.600' }}
      {...props}
    />
  )
}

export default forwardRef<any, DatePickerProps>(DatePicker)
