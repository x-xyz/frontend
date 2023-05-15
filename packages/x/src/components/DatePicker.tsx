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
      borderRightWidth={2}
      borderBottomWidth={2}
      borderRadius={0}
      background="background"
      px={4}
      autoComplete="off"
      _disabled={{ color: 'gray.600' }}
      {...props}
    />
  )
}

export default forwardRef<any, DatePickerProps>(DatePicker)
